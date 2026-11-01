import { existsSync } from "node:fs"
import { readdir, readFile } from "node:fs/promises"
import { basename, dirname, isAbsolute, join } from "node:path"
import { arg, batched, pathspec, run, type Log } from "./exec"
import { BRANCH_FORMAT, LOG_FORMAT, FIELD, parseBranches, parseLog, parseRemote, parseStatus, parseWorktrees } from "../shared/core"
import type { Branch, Commit, CommitDetails, MergeRequests, Operation, Overview, PrDefaults, Remote } from "../shared/types"

const FACTS_TTL = 60_000
const OPEN_MRS_TTL = 2 * 60_000
const TIMEOUT = 5 * 60_000
const MAX_OUTPUT = 64 * 1024 * 1024

export interface GitDeps {
  log: Log
  emitChanged: (event: { cwd: string; remote?: boolean; pulls?: boolean }) => void
  /** Remote overrides from config/environment. */
  host?: string
  project?: string
  apiBase?: string
  defaultBranch?: string
}

export interface GitFacts {
  root: string
  gitDir: string
  common: string
  /** The main checkout of this repository, which is `root` unless the session works in a linked worktree. */
  mainRoot: string
  remote: Remote | null
  defaultBranch: string | null
}

export function createGit(deps: GitDeps) {
  const queued = new Map<string, Promise<unknown>>()
  const facts = new Map<string, { at: number; value: Promise<unknown> }>()
  const openMrs = new Map<string, { at: number; value: Promise<MergeRequests> }>()

  const git = (cwd: string, args: readonly string[], signal?: AbortSignal) => run("git", args, cwd, { signal, timeout: TIMEOUT })
  const probe = (cwd: string, args: readonly string[], signal?: AbortSignal) =>
    run("git", args, cwd, { signal, quiet: true, timeout: TIMEOUT }).catch(() => "")

  const fact = <T>(key: string, read: () => Promise<T>): Promise<T> => {
    const known = facts.get(key)
    if (known && Date.now() - known.at < FACTS_TTL) return known.value as Promise<T>
    const value = read()
    facts.set(key, { at: Date.now(), value })
    void value.catch(() => facts.delete(key))
    return value
  }

  const readRemote = async (cwd: string): Promise<Remote | null> => {
    const names = (await probe(cwd, ["remote"])).split("\n").filter(Boolean)
    const ordered = [...names.filter((name) => name === "origin"), ...names.filter((name) => name !== "origin")]
    for (const name of ordered) {
      const parsed = parseRemote(name, await probe(cwd, ["remote", "get-url", name]), {
        ...(deps.host ? { host: deps.host } : {}),
        ...(deps.project ? { project: deps.project } : {}),
        ...(deps.apiBase ? { apiBase: deps.apiBase } : {}),
      })
      if (parsed) return parsed
    }
    if (deps.apiBase || deps.project) {
      return parseRemote("configured", `https://configured/${deps.project ?? "unknown/project"}.git`, {
        ...(deps.host ? { host: deps.host } : {}),
        ...(deps.project ? { project: deps.project } : {}),
        ...(deps.apiBase ? { apiBase: deps.apiBase } : {}),
      }) ?? null
    }
    return null
  }

  const remote = (cwd: string) => fact(`remote:${cwd}`, () => readRemote(cwd))

  const readDefaultBranch = async (cwd: string, remoteName: string | undefined): Promise<string | null> => {
    if (remoteName) {
      const symbolic = (await probe(cwd, ["symbolic-ref", "--short", `refs/remotes/${remoteName}/HEAD`])).trim()
      if (symbolic) return symbolic.slice(remoteName.length + 1)
    }
    const local = (await probe(cwd, ["branch", "--list", "main", "master", "--format=%(refname:short)"]))
      .split("\n")
      .filter(Boolean)
    return local.includes("main") ? "main" : (local[0] ?? null)
  }

  const defaultBranch = (cwd: string, remoteName: string | undefined) =>
    fact(`default:${cwd}:${remoteName ?? ""}`, async () => deps.defaultBranch || readDefaultBranch(cwd, remoteName))

  const operation = (gitDir: string): Operation => {
    if (existsSync(join(gitDir, "rebase-apply", "applying"))) return "am"
    if (existsSync(join(gitDir, "rebase-merge")) || existsSync(join(gitDir, "rebase-apply"))) return "rebase"
    if (existsSync(join(gitDir, "MERGE_HEAD"))) return "merge"
    if (existsSync(join(gitDir, "CHERRY_PICK_HEAD"))) return "cherry-pick"
    if (existsSync(join(gitDir, "REVERT_HEAD"))) return "revert"
    return null
  }

  const currentBranch = async (cwd: string) => (await git(cwd, ["branch", "--show-current"])).trim()

  const baseRef = async (cwd: string) => {
    const remoteName = (await remote(cwd))?.name ?? "origin"
    const name = await defaultBranch(cwd, remoteName)
    if (!name) return null
    const tracked = (await probe(cwd, ["rev-parse", "--verify", "--quiet", `refs/remotes/${remoteName}/${name}`])).trim()
    return { name, ref: tracked ? `${remoteName}/${name}` : name }
  }

  const mutate = <T>(cwd: string, work: () => Promise<T>, remoteChange = false) => {
    facts.clear()
    const next = (queued.get(cwd) ?? Promise.resolve()).then(work, work)
    const settled = next.catch(() => undefined)
    queued.set(cwd, settled)
    void settled.then(() => {
      if (queued.get(cwd) === settled) queued.delete(cwd)
    })
    return next.finally(() => {
      if (remoteChange) openMrs.clear()
      deps.emitChanged({ cwd, remote: remoteChange })
    })
  }

  const write = (cwd: string, args: readonly string[], remoteChange = false) => mutate(cwd, () => git(cwd, args), remoteChange)

  const factsOf = async (cwd: string): Promise<GitFacts | null> => {
    const top = (await probe(cwd, ["rev-parse", "--show-toplevel", "--absolute-git-dir", "--git-common-dir"])).trim().split(/\r?\n/)
    const [root, gitDir, common] = top
    if (!root || !gitDir) return null
    const shared = !common ? gitDir : isAbsolute(common) ? common : join(cwd, common)
    return {
      root,
      gitDir,
      common: shared,
      // A linked worktree keeps the shared dir under the main checkout's `.git`, so its parent is that checkout.
      mainRoot: basename(shared) === ".git" ? dirname(shared) : root,
      remote: await remote(cwd),
      defaultBranch: await defaultBranch(cwd, (await remote(cwd))?.name),
    }
  }

  const ensurePushed = async (cwd: string) => {
    const status = parseStatus(await git(cwd, ["status", "--porcelain=v2", "--branch", "-z", "--untracked-files=no"]))
    const branch = status.branch.branch
    if (!branch) throw new Error("Check out a branch before creating a merge request.")
    const upstreamRemote = (await probe(cwd, ["config", "--get", `branch.${branch}.remote`])).trim()
    if (status.branch.upstream && status.branch.upstream === `${upstreamRemote}/${branch}`) {
      if (status.branch.ahead > 0) await git(cwd, ["push", upstreamRemote, `HEAD:refs/heads/${branch}`])
      return branch
    }
    const repo = await remote(cwd)
    await git(cwd, ["push", "-u", repo?.name ?? "origin", `HEAD:refs/heads/${branch}`])
    return branch
  }

  const readOpenMrs = async (cwd: string, fetchMrs: (remote: Remote) => Promise<MergeRequests>): Promise<MergeRequests> => {
    const repo = await remote(cwd)
    if (!repo) return { error: "No GitLab remote found for this repository.", items: [] }
    const key = `${repo.apiBase}/${repo.path}`
    const known = openMrs.get(key)
    if (known && Date.now() - known.at < OPEN_MRS_TTL) return known.value
    const value = fetchMrs(repo)
    openMrs.set(key, { at: Date.now(), value })
    void value.then((result) => { if (result.error) openMrs.delete(key) }, () => openMrs.delete(key))
    return value
  }

  return {
    git,
    probe,
    remote,
    defaultBranch,
    baseRef,
    currentBranch,
    ensurePushed,
    factsOf,
    readOpenMrs,
    facts,
    openMrs,
    mutate,
    write,
    operation,

    overview: async ({ cwd }: { cwd: string }, signal?: AbortSignal): Promise<Overview | null> => {
      const found = await factsOf(cwd)
      if (!found || !existsSync(found.gitDir)) return null
      const [status, stashes] = await Promise.all([
        git(cwd, ["status", "--porcelain=v2", "--branch", "-z"], signal),
        readFile(join(found.common, "logs", "refs", "stash"), "utf8").then((text) => text.split("\n").filter(Boolean).length, () => 0),
      ])
      const parsed = parseStatus(status)
      return {
        root: found.root,
        worktreeRoot: found.mainRoot,
        name: basename(found.root),
        branch: parsed.branch.branch,
        head: parsed.branch.head,
        upstream: parsed.branch.upstream,
        ahead: parsed.branch.ahead,
        behind: parsed.branch.behind,
        remote: found.remote,
        defaultBranch: found.defaultBranch,
        operation: operation(found.gitDir),
        stashes,
        files: parsed.files,
        gitlab: null,
      }
    },

    log: async ({ cwd, limit, scope }: { cwd: string; limit: number; scope: "current" | "local" | "all" }, signal?: AbortSignal): Promise<Commit[]> => {
      const args = ["log", "--topo-order", "--decorate=full", "--no-show-signature", `--format=${LOG_FORMAT}`, `-n${Math.max(1, Math.floor(limit) || 1)}`]
      const refs = async (): Promise<string[]> => {
        if (scope === "current") return ["HEAD"]
        if (scope === "all") return ["--branches", "--remotes", "--tags", "HEAD"]
        const upstreams = (await probe(cwd, ["for-each-ref", "--format=%(upstream)", "refs/heads"], signal))
          .split("\n")
          .filter((ref, index, all) => ref.startsWith("refs/remotes/") && all.indexOf(ref) === index)
        return ["--branches", "--tags", "HEAD", ...upstreams]
      }
      return parseLog(await git(cwd, [...args, ...(await refs()), "--"], signal).catch(() => ""))
    },

    show: async ({ cwd, hash }: { cwd: string; hash: string }, signal?: AbortSignal): Promise<CommitDetails> => {
      const [meta, files] = await Promise.all([
        git(cwd, ["show", "-s", "--no-show-signature", `--format=%H%x1f%an%x1f%ae%x1f%at%x1f%B`, arg(hash), "--"], signal),
        git(cwd, ["show", "--format=", "--no-show-signature", "--no-color", "--no-ext-diff", "--name-status", "-z", "-M", "-m", "--first-parent", arg(hash), "--"], signal),
      ])
      const [full, author, email, date, ...body] = meta.split(FIELD)
      const tokens = files.split("\0").filter(Boolean)
      const changed: { status: string; path: string }[] = []
      for (let i = 0; i < tokens.length; i++) {
        const status = tokens[i] ?? ""
        const renamed = status.startsWith("R") || status.startsWith("C")
        const path = renamed ? tokens[i + 2] : tokens[i + 1]
        i += renamed ? 2 : 1
        if (path) changed.push({ status: status[0] ?? "M", path })
      }
      return { hash: full ?? hash, author: author ?? "", email: email ?? "", date: Number(date ?? 0), body: body.join(FIELD).trim(), files: changed }
    },

    branches: async ({ cwd }: { cwd: string }, signal?: AbortSignal): Promise<Branch[]> => {
      const [refs, worktrees] = await Promise.all([
        git(cwd, ["for-each-ref", "--sort=-committerdate", `--format=${BRANCH_FORMAT}`, "refs/heads", "refs/remotes"], signal),
        probe(cwd, ["worktree", "list", "--porcelain"], signal),
      ])
      return parseBranches(refs, parseWorktrees(worktrees))
    },

    mergedBranches: async ({ cwd }: { cwd: string }, signal?: AbortSignal) => {
      const base = await baseRef(cwd)
      if (!base) return []
      const output = await git(cwd, ["for-each-ref", `--merged=${base.ref}`, "--format=%(refname:short)", "refs/heads"], signal)
      return output.split("\n").filter(Boolean)
    },

    outgoing: async ({ cwd }: { cwd: string }, signal?: AbortSignal) => {
      const [remotes, base] = await Promise.all([probe(cwd, ["for-each-ref", "--count=1", "--format=%(refname)", "refs/remotes"], signal), baseRef(cwd)])
      const unpushed = remotes.trim()
        ? parseLog(await probe(cwd, ["log", "--decorate=full", "--no-show-signature", `--format=${LOG_FORMAT}`, "-n50", "HEAD", "--not", "--remotes", "--"], signal))
        : []
      const ahead = base ? Number((await probe(cwd, ["rev-list", "--count", `${base.ref}..HEAD`, "--"], signal)).trim()) || 0 : 0
      return { unpushed, base: base?.name ?? null, ahead }
    },

    diff: async ({ cwd, path, staged, untracked }: { cwd: string; path: string; staged: boolean; untracked: boolean }, signal?: AbortSignal) => {
      if (untracked) {
        const files = path.endsWith("/")
          ? (await git(cwd, ["ls-files", "--others", "--exclude-standard", "-z", "--", pathspec(path)], signal)).split("\0").filter(Boolean)
          : [path]
        const diffs = await Promise.all(
          files.slice(0, 20).map((file) =>
            run("git", ["-c", "core.quotePath=false", "diff", "--no-color", "--no-ext-diff", "--no-index", "--", "/dev/null", file], cwd, {
              signal,
              ok: (code) => code <= 1,
              timeout: TIMEOUT,
            }).catch(() => ""),
          ),
        )
        return diffs.join("") + (files.length > 20 ? `\n… ${files.length - 20} more files\n` : "")
      }
      return git(cwd, ["-c", "core.quotePath=false", "diff", "--no-color", "--no-ext-diff", ...(staged ? ["--cached"] : []), "--", pathspec(path)], signal)
    },

    mrDefaults: async ({ cwd, base }: { cwd: string; base: string }): Promise<PrDefaults> => {
      const remoteName = (await remote(cwd))?.name ?? "origin"
      const range = (await probe(cwd, ["rev-parse", "--verify", "--quiet", `${remoteName}/${arg(base)}`])).trim()
        ? `${remoteName}/${base}..HEAD`
        : `${base}..HEAD`
      const subjects = (await probe(cwd, ["log", "--reverse", "--no-show-signature", "--format=%s", range, "--"])).split("\n").filter(Boolean)
      const branch = await currentBranch(cwd)
      const title = subjects.length === 1 ? (subjects[0] ?? branch) : branch.replace(/^[^/]+\//, "").replace(/[-_]+/g, " ")
      const template = await templateAt((await probe(cwd, ["rev-parse", "--show-toplevel"])).trim())
      return {
        title: title.charAt(0).toUpperCase() + title.slice(1),
        body: subjects.length > 1 ? subjects.map((subject) => `- ${subject}`).join("\n") : "",
        ...(template ? { template } : {}),
      }
    },

    stage: async ({ cwd, paths }: { cwd: string; paths: readonly string[] }) =>
      paths.length === 0 ? "" : mutate(cwd, () => batched(paths.map(pathspec)).reduce<Promise<string>>((previous, batch) => previous.then(() => git(cwd, ["add", "-A", "--", ...batch])), Promise.resolve(""))),
    unstage: async ({ cwd, paths }: { cwd: string; paths: readonly string[] }) =>
      paths.length === 0
        ? ""
        : mutate(cwd, async () => {
            const hasHead = !!(await probe(cwd, ["rev-parse", "--verify", "--quiet", "HEAD"])).trim()
            return batched(paths.map(pathspec)).reduce<Promise<string>>(
              (previous, batch) => previous.then(() => git(cwd, hasHead ? ["restore", "--staged", "--", ...batch] : ["rm", "--cached", "-r", "-q", "--", ...batch])),
              Promise.resolve(""),
            )
          }),
    discard: ({ cwd, tracked, untracked }: { cwd: string; tracked: readonly string[]; untracked: readonly string[] }) =>
      mutate(cwd, async () => {
        if (tracked.length > 0) await batched(tracked.map(pathspec)).reduce<Promise<string>>((previous, batch) => previous.then(() => git(cwd, ["restore", "--worktree", "--", ...batch])), Promise.resolve(""))
        if (untracked.length > 0) await batched(untracked.map(pathspec)).reduce<Promise<string>>((previous, batch) => previous.then(() => git(cwd, ["clean", "-fdq", "--", ...batch])), Promise.resolve(""))
        return ""
      }),
    commit: ({ cwd, message, amend, all }: { cwd: string; message: string; amend: boolean; all: boolean }) =>
      mutate(cwd, async () => {
        if (all) await git(cwd, ["add", "-A"])
        if (amend && !message) return git(cwd, ["commit", "--amend", "--no-edit"])
        return git(cwd, ["commit", "-m", message, ...(amend ? ["--amend"] : [])])
      }),
    checkout: async ({ cwd, ref, track }: { cwd: string; ref: string; track: string | null }) =>
      write(cwd, track ? ["switch", "-c", arg(ref), "--track", arg(track)] : ["switch", arg(ref)], true).catch((error: unknown) => {
        if (error instanceof Error && /a branch is expected|invalid reference/i.test(error.message)) return write(cwd, ["switch", "--detach", ref], true)
        throw error
      }),
    createBranch: ({ cwd, name, start, checkout }: { cwd: string; name: string; start: string | null; checkout: boolean }) =>
      write(cwd, [...(checkout ? ["switch", "-c"] : ["branch"]), arg(name), ...(start ? ["--no-track", arg(start)] : [])]),
    deleteBranch: ({ cwd, name, force }: { cwd: string; name: string; force: boolean }) => write(cwd, ["branch", force ? "-D" : "-d", arg(name)]),
    deleteBranches: ({ cwd, names, force }: { cwd: string; names: readonly string[]; force: boolean }) =>
      mutate(cwd, () =>
        names.reduce<Promise<{ name: string; error: string | null }[]>>(async (previous, name) => {
          const done = await previous
          const error = await git(cwd, ["branch", force ? "-D" : "-d", arg(name)]).then(() => null, (failure: unknown) => (failure instanceof Error ? failure.message : String(failure)))
          return [...done, { name, error }]
        }, Promise.resolve([])),
      ),
    undoCommit: ({ cwd }: { cwd: string }) =>
      mutate(cwd, async () => {
        const gitDir = (await git(cwd, ["rev-parse", "--absolute-git-dir"])).trim()
        if (operation(gitDir)) throw new Error("Finish or abort the operation in progress first.")
        const parents = (await git(cwd, ["rev-list", "--parents", "-n1", "HEAD", "--"])).trim().split(" ").slice(1)
        if (parents.length === 0) throw new Error("The first commit of a repository cannot be undone here.")
        if (parents.length > 1) throw new Error("A merge commit cannot be undone here.")
        if ((await probe(cwd, ["branch", "-r", "--contains", "HEAD"])).trim()) throw new Error("The last commit is already on a remote; undoing it would rewrite published history.")
        return git(cwd, ["reset", "--soft", "HEAD~1"])
      }),
    deleteRemoteBranch: ({ cwd, remote: remoteName, name }: { cwd: string; remote: string; name: string }) => write(cwd, ["push", arg(remoteName), "--delete", arg(name)], true),
    merge: ({ cwd, ref }: { cwd: string; ref: string }) => write(cwd, ["merge", "--no-edit", arg(ref)]),
    rebase: ({ cwd, ref }: { cwd: string; ref: string }) => write(cwd, ["rebase", arg(ref)]),
    cherryPick: ({ cwd, hash }: { cwd: string; hash: string }) => write(cwd, ["cherry-pick", arg(hash)]),
    revert: ({ cwd, hash }: { cwd: string; hash: string }) => write(cwd, ["revert", "--no-edit", arg(hash)]),
    abort: ({ cwd }: { cwd: string }) =>
      mutate(cwd, async () => {
        const gitDir = (await git(cwd, ["rev-parse", "--absolute-git-dir"])).trim()
        const op = operation(gitDir)
        if (!op) return ""
        return git(cwd, [op, "--abort"])
      }),
    continue: ({ cwd }: { cwd: string }) =>
      mutate(cwd, async () => {
        const gitDir = (await git(cwd, ["rev-parse", "--absolute-git-dir"])).trim()
        const op = operation(gitDir)
        if (!op) return ""
        if (op === "merge") return git(cwd, ["commit", "--no-edit"])
        return git(cwd, [op, "--continue"])
      }),
    fetch: ({ cwd }: { cwd: string }) => write(cwd, ["fetch", "--all", "--prune"], true),
    pull: ({ cwd }: { cwd: string }) => write(cwd, ["pull"], true),
    push: ({ cwd, force }: { cwd: string; force: boolean }) =>
      mutate(cwd, async () => {
        const upstream = await probe(cwd, ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"])
        if (upstream.trim()) return git(cwd, ["push", ...(force ? ["--force-with-lease"] : [])])
        const repo = await remote(cwd)
        return git(cwd, ["push", "-u", repo?.name ?? "origin", "HEAD", ...(force ? ["--force-with-lease"] : [])])
      }, true),
    pushBranch: ({ cwd, name }: { cwd: string; name: string }) =>
      mutate(cwd, async () => {
        const repo = await remote(cwd)
        return git(cwd, ["push", "-u", repo?.name ?? "origin", arg(name)])
      }, true),
    stash: ({ cwd }: { cwd: string }) => write(cwd, ["stash", "push", "--include-untracked"]),
    stashPop: ({ cwd }: { cwd: string }) => write(cwd, ["stash", "pop"]),

    worktreeAdd: ({ cwd, branch, base }: { cwd: string; branch: string; base: string }) =>
      mutate(cwd, async () => {
        const root = (await git(cwd, ["rev-parse", "--show-toplevel"])).trim()
        if (!root) throw new Error("This directory is not a git work tree.")
        const safe = branch.replace(/[^\w.-]+/g, "-")
        let path = join(join(root, ".."), `${basename(root)}-${safe}`)
        let suffix = 2
        while (existsSync(path)) path = join(join(root, ".."), `${basename(root)}-${safe}-${suffix++}`)
        // An existing branch is attached rather than recreated; git still refuses one another work tree holds.
        const known = await git(cwd, ["rev-parse", "--verify", "--quiet", `refs/heads/${arg(branch)}`]).then((out) => out.trim() !== "", () => false)
        await git(cwd, known ? ["worktree", "add", path, arg(branch)] : ["worktree", "add", "-b", arg(branch), path, arg(base)])
        return { path }
      }, true),

    worktreeRemove: async ({ cwd, path, force }: { cwd: string; path: string; force: boolean }) => {
      const found = await factsOf(cwd)
      if (!found) throw new Error("This directory is not a git work tree.")
      if (found.mainRoot === path) throw new Error("The main checkout cannot be removed as a worktree.")
      // Queued and announced against the main checkout: git refuses to remove the tree it runs from, and the folder
      // this call was addressed to stops existing, so nothing may watch it afterwards.
      return mutate(found.mainRoot, () => git(found.mainRoot, ["worktree", "remove", ...(force ? ["--force"] : []), arg(path)]), true)
    },

    checkoutMrs: ({ cwd, mr }: { cwd: string; mr: MergeRequestForCheckout }) =>
      mutate(cwd, async () => {
        const remoteName = (await remote(cwd))?.name ?? "origin"
        try {
          await git(cwd, ["fetch", remoteName, `merge-requests/${mr.number}/head:refs/heads/mr-${mr.number}`])
          return await git(cwd, ["switch", `mr-${mr.number}`])
        } catch {
          await git(cwd, ["fetch", remoteName, `${mr.head}:refs/remotes/${remoteName}/${mr.head}`])
          return git(cwd, ["switch", "-c", arg(mr.head), "--track", `${remoteName}/${mr.head}`])
        }
      }, true),
  }
}

export interface MergeRequestForCheckout {
  number: number
  head: string
}

export type Git = ReturnType<typeof createGit>

/** The merge request template GitLab and the panel look for. */
async function templateAt(root: string) {
  if (!root) return undefined
  const dirs = await Promise.all(
    [join(root, ".gitlab", "merge_request_templates"), join(root, ".gitlab"), join(root, ".github"), root, join(root, "docs")].map(async (dir) => ({
      dir,
      names: await readdir(dir).catch(() => [] as string[]),
    })),
  )
  const named = (wanted: string) => dirs.flatMap((entry) => entry.names.filter((name) => name.toLowerCase() === wanted).map((name) => join(entry.dir, name)))
  const folder = join(root, ".gitlab", "merge_request_templates")
  const inFolder = (await readdir(folder).catch(() => [] as string[])).filter((name) => name.toLowerCase().endsWith(".md")).sort().map((name) => join(folder, name))
  const path = named("merge_request_template.md")[0] ?? named("pull_request_template.md")[0] ?? inFolder[0]
  if (!path) return undefined
  const text = await readFile(path, "utf8").catch(() => undefined)
  return text?.trim() ? text.slice(0, 20_000) : undefined
}
