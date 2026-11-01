import { randomUUID } from "node:crypto"
import { homedir } from "node:os"
import { isAbsolute, join, resolve } from "node:path"
import { itemContextText } from "./context"
import { diffText, editDraft, parseReview, placementError, splitDrift, withMoved, MAX_COMMENTS } from "./draft"
import { backoff, blocker, checkRepo, describe, edits, expand, MAX_BATCH, parseShell, parseWrite, settle, triageProgress, undoFor, type WriteKind } from "./plan"
import type { Store } from "./store"
import type { AgentAction, AgentPayload, AgentQueue, AgentResult, CloseReason, DraftReview, Item, ReviewEvent } from "../shared/types"
import type { Git } from "./git"
import type { createGitLab } from "./gitlab"

const PACE = 1000
const WAIT = 10 * 60_000
const POLL = 5000
const FINAL: readonly AgentAction["status"][] = ["done", "failed", "skipped", "undone"]

type Ctx = any
type GitLab = ReturnType<typeof createGitLab>
type Log = (level: "debug" | "info" | "warn" | "error", message: string, data?: Record<string, unknown>) => void

export interface AgentDeps {
  ctx: Ctx
  store: Store
  git: Git
  gitlab: GitLab
  log: Log
  emit: (event: Record<string, unknown>) => void
}

export function createAgent(deps: AgentDeps) {
  const { ctx, store, git, gitlab } = deps
  const locks = new Map<string, Promise<unknown>>()
  const watchers = new Map<string, Set<(queue: AgentQueue) => void>>()
  const waiters = new Map<string, (action: AgentAction) => void>()
  const waits = new Set<() => void>()
  const repos = new Map<string, Promise<string | null>>()
  const waiting = new Set<string>()
  const worker = { running: false, stopped: false, last: 0, wake: undefined as (() => void) | undefined }

  const serialize = <T>(key: string, work: () => Promise<T>) => {
    const next = (locks.get(key) ?? Promise.resolve()).then(work, work)
    const settled = next.catch(() => undefined)
    locks.set(key, settled)
    void settled.then(() => {
      if (locks.get(key) === settled) locks.delete(key)
    })
    return next
  }

  const load = async (sessionID: string): Promise<AgentQueue> => {
    const queue = (await store.read()).queues[sessionID]
    return { auto: queue?.auto ?? false, actions: settle(queue?.actions ?? [], Date.now()), ...(queue?.triage ? { triage: queue.triage } : {}) }
  }

  const update = (sessionID: string, change: (queue: AgentQueue) => AgentQueue) =>
    serialize(sessionID, async () => {
      const next = await store.mutate((state) => {
        const current = state.queues[sessionID] ?? { auto: false, actions: [] }
        const changed = change({ auto: current.auto, actions: settle(current.actions, Date.now()), ...(current.triage ? { triage: current.triage } : {}) })
        state.queues[sessionID] = changed
        return changed
      })
      deps.emit({ type: "agent", sessionID })
      next.actions.forEach((action) => {
        if (!FINAL.includes(action.status)) return
        waiters.get(action.id)?.(action)
        waiters.delete(action.id)
      })
      watchers.get(sessionID)?.forEach((watch) => watch(next))
      return next
    })

  const patch = (action: AgentAction, change: Partial<AgentAction>) =>
    update(action.sessionID, (queue) => ({
      ...queue,
      actions: queue.actions.map((item) => (item.id === action.id ? { ...item, ...change, updatedAt: Date.now() } : item)),
    }))

  const indexRepo = async (repo: string, sessionID: string) => {
    await store.mutate((state) => {
      const key = `recent:${repo.toLowerCase()}`
      const known = (state.reasons as Record<string, unknown>)[key]
      const list = Array.isArray(known) ? known.filter((item): item is string => typeof item === "string") : []
      ;(state.reasons as Record<string, unknown>)[key] = [sessionID, ...list.filter((item) => item !== sessionID)].slice(0, 50)
    })
  }

  const recentSessions = async (repo: string): Promise<string[]> => {
    const known = (await store.read()).reasons[`recent:${repo.toLowerCase()}`]
    return Array.isArray(known) ? (known as unknown[]).filter((item): item is string => typeof item === "string") : []
  }

  const add = async (sessionID: string, actions: readonly AgentAction[]) => {
    if (actions.length === 0) return
    await update(sessionID, (queue) => ({ ...queue, actions: [...queue.actions, ...actions] }))
    await Promise.all([...new Set(actions.map((action) => action.repo))].map((repo) => indexRepo(repo, sessionID)))
  }

  const repoOfSession = async (sessionID: string, cwd: string, ...relative: string[]): Promise<string | null> => {
    const directory = resolve(cwd, ...relative)
    const known = repos.get(directory)
    if (known) return known
    const found = git.remote(directory).then((remote) => {
      if (!remote) return null
      gitlab.rememberRemote(remote)
      return remote.path
    }).catch(() => null)
    repos.set(directory, found)
    void found.then((repo) => {
      if (!repo) repos.delete(directory)
    })
    return found
  }

  const requireRepo = async (repo: string | null, sessionID: string, cwd: string) => {
    const found = repo ? checkRepo(repo) : await repoOfSession(sessionID, cwd)
    if (!found) throw new Error("This session's directory has no GitLab remote; pass `repo` as group/project.")
    return found
  }

  const kick = (sessionID: string) => {
    waiting.add(sessionID)
    if (!worker.running) void drain()
  }

  const drain = async () => {
    worker.running = true
    while (waiting.size > 0 && !worker.stopped) {
      const sessionID = waiting.values().next().value ?? ""
      const next = await load(sessionID).then((queue) => queue.actions.find((action) => action.status === "approved"), () => undefined)
      if (!next) {
        waiting.delete(sessionID)
        continue
      }
      await execute(next).catch((error: unknown) => {
        deps.log("warn", "agent action failed", { error: message(error) })
        waiting.delete(sessionID)
      })
    }
    worker.running = false
  }

  const sleep = (ms: number) =>
    new Promise<void>((done) => {
      const timer = setTimeout(done, ms)
      worker.wake = () => {
        clearTimeout(timer)
        done()
      }
    })

  const paced = async <T>(work: () => Promise<T>) => {
    const wait = worker.last + PACE - Date.now()
    if (wait > 0) await sleep(wait)
    worker.last = Date.now()
    return work()
  }

  const execute = async (action: AgentAction) => {
    const taken = { value: false }
    const claimed = await update(action.sessionID, (queue) => ({
      ...queue,
      actions: queue.actions.map((item) => {
        if (item.id !== action.id || item.status !== "approved") return item
        taken.value = true
        return { ...item, status: "running", error: null, updatedAt: Date.now() }
      }),
    }))
    const current = claimed.actions.find((item) => item.id === action.id)
    if (!taken.value || !current) return
    const outcome = await attempt(current, 0)
    const kind = current.item === "issue" ? "issue" : "mr"
    const finished = await patch(current, "error" in outcome ? { status: "failed", error: outcome.error } : { status: "done", error: null, result: outcome.result })
    const original = current.undoOf ? finished.actions.find((item) => item.id === current.undoOf) : undefined
    if (original) await patch(original, "error" in outcome ? { undoneBy: null } : { status: "undone" })
    deps.emit({ type: "item", repo: action.repo, number: action.number, ...(current.kind === "close" ? { state: kind === "issue" ? "CLOSED" : "CLOSED" } : current.kind === "reopen" ? { state: "OPEN" } : {}) })
  }

  const attempt = async (action: AgentAction, tries: number, progress: Progress = {}): Promise<{ result: AgentResult } | { error: string }> => {
    try {
      return { result: await perform(action, progress) }
    } catch (error) {
      const text = message(error)
      const wait = backoff(text, tries)
      if (wait === undefined || worker.stopped) return { error: tries > 0 ? `${text} (after ${tries} retries)` : text }
      await patch(action, { error: `GitLab rate limit; retrying in ${Math.round(wait / 1000)} s.` })
      await sleep(wait)
      return attempt(action, tries + 1, progress)
    }
  }

  const perform = async (action: AgentAction, progress: Progress): Promise<AgentResult> => {
    const repo = action.repo
    const number = action.number
    const payload = action.payload
    const info = (await gitlab.itemsInfo(repo, [number], action.item ?? undefined)).get(number)
    if (!info) throw new Error(`${repo}${action.item === "issue" ? "#" : "!"}${number} does not exist or cannot be read.`)
    const comment = async () => {
      if (payload.body && !progress.comment) progress.comment = await paced(() => gitlab.addComment(repo, number, payload.body ?? "", info.item))
      return progress.comment ? { commentId: progress.comment.id, url: progress.comment.url } : {}
    }
    const cleanup = async () => {
      if (payload.commentId && !progress.cleaned) await paced(() => gitlab.deleteComment(repo, number, payload.commentId ?? 0, info.item))
      progress.cleaned = true
    }
    if (action.kind === "comment") return comment()
    if (action.kind === "uncomment") {
      await cleanup()
      return {}
    }
    if (action.kind === "close") {
      if (info.state !== "OPEN" && !progress.changed) return { noop: true }
      const posted = await comment()
      if (info.state === "OPEN") progress.result = await paced(() => gitlab.closeItem(repo, number, info.item, payload.reason ?? "completed", payload.duplicateOf))
      progress.changed = true
      await cleanup()
      return { ...progress.result, ...posted }
    }
    if (action.kind === "reopen") {
      if (info.state === "MERGED") throw new Error(`!${number} is merged; a merged merge request cannot be reopened.`)
      if (info.state === "OPEN" && !progress.changed) return { noop: true }
      progress.result ??= info.reason ? { reason: info.reason } : {}
      if (info.state !== "OPEN") await paced(() => gitlab.reopenItem(repo, number, info.item))
      progress.changed = true
      await cleanup()
      return { ...progress.result, ...(await comment()) }
    }
    if (action.kind === "approve" || action.kind === "unapprove") {
      if (info.item !== "mr") throw new Error("Only merge requests can be approved.")
      return {}
    }
    if (action.kind === "label" || action.kind === "assign") {
      const me = [...(payload.add ?? []), ...(payload.remove ?? [])].includes("@me") ? await gitlab.viewerName(repo) : ""
      const names = (list: readonly string[] | undefined) => (list ?? []).map((name) => (name === "@me" ? me : name))
      const present = action.kind === "label" ? info.labels : info.assignees
      const has = (name: string) => present.find((item) => item.toLowerCase() === name.toLowerCase())
      const added = names(payload.add).filter((name) => !has(name))
      const removed = names(payload.remove).flatMap((name) => has(name) ?? [])
      progress.result ??= { added, removed }
      if (added.length > 0 || removed.length > 0) await paced(() => gitlab.editPeople(repo, number, action.kind === "label" ? "labels" : "assignees", added, removed, info.item))
      const result = progress.result
      return (result.added?.length ?? 0) + (result.removed?.length ?? 0) > 0 ? result : { noop: true }
    }
    throw new Error("Commands the agent ran in the shell are recorded, not run again.")
  }

  const quiet = (sessionID: string, signal: AbortSignal) =>
    new Promise<boolean>((done) => {
      const set = watchers.get(sessionID) ?? new Set()
      watchers.set(sessionID, set)
      const timer = setTimeout(() => finish(false), WAIT)
      const poll = setInterval(() => void load(sessionID).then(watch, () => undefined), POLL)
      const abort = () => finish(false)
      const watch = (queue: AgentQueue) => {
        if (queue.actions.every((action) => action.status !== "proposed" && action.status !== "approved" && action.status !== "running")) finish(true)
      }
      const finish = (value: boolean) => {
        clearTimeout(timer)
        clearInterval(poll)
        signal.removeEventListener("abort", abort)
        waits.delete(abort)
        set.delete(watch)
        if (set.size === 0 && watchers.get(sessionID) === set) watchers.delete(sessionID)
        done(value)
      }
      set.add(watch)
      waits.add(abort)
      signal.addEventListener("abort", abort, { once: true })
      if (signal.aborted || worker.stopped) return finish(false)
      void load(sessionID).then(watch, () => finish(false))
    })

  const settled = (ids: readonly string[], sessionID: string, signal: AbortSignal) =>
    new Promise<AgentAction[]>((done) => {
      const results = new Map<string, AgentAction>()
      const finish = () => done(ids.flatMap((id) => results.get(id) ?? []))
      ids.forEach((id) =>
        waiters.set(id, (action) => {
          results.set(id, action)
          if (results.size === ids.length) finish()
        }),
      )
      signal.addEventListener(
        "abort",
        () =>
          void update(sessionID, (queue) => ({
            ...queue,
            actions: queue.actions.map((action) =>
              ids.includes(action.id) && action.status === "approved" ? { ...action, status: "skipped", error: "Cancelled with the tool call.", updatedAt: Date.now() } : action,
            ),
          })).finally(finish),
        { once: true },
      )
    })

  const knownLabels = async (repo: string, proposal: ReturnType<typeof parseWrite>) => {
    const labels = (await gitlab.repoMeta({ repo })).labels.map((label: { name: string }) => label.name)
    if (labels.length === 0) return proposal.payload
    const spelled = (name: string) => labels.find((label) => label.toLowerCase() === name.toLowerCase())
    const unknown = (proposal.payload.add ?? []).filter((name) => !spelled(name))
    if (unknown.length > 0) throw new Error(`${repo} has no label ${unknown.map((name) => `"${name}"`).join(", ")}. Its labels: ${labels.slice(0, 100).join(", ")}${labels.length > 100 ? ", …" : ""}`)
    return {
      add: (proposal.payload.add ?? []).map((name) => spelled(name) ?? name),
      remove: (proposal.payload.remove ?? []).map((name) => spelled(name) ?? name),
    }
  }

  const blockers = (kind: WriteKind, repo: string, numbers: readonly number[], payload: AgentPayload, info: Awaited<ReturnType<GitLab["itemsInfo"]>>, queue: AgentQueue) => {
    const pending = queue.actions.filter((action) => action.status === "proposed" || action.status === "approved" || action.status === "running")
    return numbers.flatMap((number): [number, string][] => {
      const target = info.get(number)
      const same = pending.find((action) => action.repo === repo && action.number === number && action.item === target?.item && action.kind === kind && JSON.stringify(action.payload) === JSON.stringify(payload))
      const reason = blocker(kind, target, same)
      return reason ? [[number, reason]] : []
    })
  }

  const propose = async (kind: WriteKind, raw: unknown, context: { sessionID: string; cwd: string; signal: AbortSignal }) => {
    const proposal = parseWrite(kind, raw)
    const repo = await requireRepo(proposal.repo, context.sessionID, context.cwd)
    const payload = kind === "label" ? await knownLabels(repo, proposal) : proposal.payload
    const [info, queue] = await Promise.all([gitlab.itemsInfo(repo, proposal.numbers, proposal.itemKind), load(context.sessionID)])
    const reasons = blockers(kind, repo, proposal.numbers, payload, info, queue)
    const skipped = new Map(reasons)
    const numbers = proposal.numbers.filter((number) => !skipped.has(number))
    const batch = `b_${randomUUID().replaceAll("-", "").slice(0, 8)}`
    const actions = expand(
      { ...proposal, numbers, payload },
      {
        sessionID: context.sessionID,
        repo,
        batch,
        now: Date.now(),
        status: queue.auto ? "approved" : "proposed",
        items: info,
        id: () => `a_${randomUUID().replaceAll("-", "").slice(0, 12)}`,
        ...(queue.triage ? { round: queue.triage.round } : {}),
      },
    )
    await add(context.sessionID, actions)
    const notProposed = reasons.length > 0 ? ["", "Not proposed:", ...reasons.map(([number, reason]) => `- ${proposal.kind === "comment" ? "#" : "#"}${number}: ${reason}`)] : []
    if (actions.length === 0) return [`Nothing was proposed on ${repo}.`, ...notProposed].join("\n")
    if (!queue.auto) {
      return [
        `Proposed ${plural(actions.length, "action")} on ${repo} (batch ${batch}). ${actions.length === 1 ? "It is" : "They are"} waiting for the user's approval in the GitLab panel:`,
        ...actions.map((action) => `- ${mark(action)}${action.number}${action.title ? ` "${action.title}"` : ""}: ${describe(action)}`),
        ...notProposed,
        "",
        "Don't propose these again, and don't run them another way (such as glab in the shell). The user may approve, edit or skip each one; call the gitlab_panel_actions tool later to see what was decided.",
      ].join("\n")
    }
    kick(context.sessionID)
    const done = await settled(actions.map((action) => action.id), context.sessionID, context.signal)
    return [
      `Ran ${plural(actions.length, "action")} on ${repo} (auto-run is on for this session):`,
      ...done.map((action) => `- ${mark(action)}${action.number}${action.title ? ` "${action.title}"` : ""}: ${describe(action)} — ${statusText(action)}`),
      ...notProposed,
    ].join("\n")
  }

  const search = async (raw: unknown, sessionID: string, cwd: string) => {
    const value = record(raw)
    const query = typeof value.query === "string" ? value.query.replace(/(^|\s)repo:\S+/g, " ").trim() : ""
    const repo = await requireRepo(value.repo ? checkRepo(value.repo) : null, sessionID, cwd)
    const remote = await gitlabRemote(repo)
    const kind: "issue" | "mr" = value.kind === "mr" ? "mr" : value.kind === "issue" ? "issue" : /\bis:(?:pr|mr)\b/.test(query) ? "mr" : "issue"
    const page = await gitlab.searchAny(remote, kind, query, typeof value.cursor === "string" && value.cursor ? value.cursor : null, typeof value.limit === "number" ? Math.min(100, Math.max(1, Math.floor(value.limit))) : 30)
    return [
      `${repo}: ${plural(page.total, "result")}${query ? ` for \`${query}\`` : ""}${page.items.length < page.total ? `, showing ${page.items.length}` : ""}.`,
      ...page.items.map(searchLine),
      ...(page.cursor ? ["", `More: call again with cursor "${page.cursor}".`] : []),
    ].join("\n")
  }

  const view = async (raw: unknown, sessionID: string, cwd: string) => {
    const value = record(raw)
    const number = Number(typeof value.number === "string" ? value.number.replace(/^[#!]/, "") : value.number)
    if (!Number.isSafeInteger(number) || number <= 0) throw new Error("`number` must be a positive whole number.")
    const repo = await requireRepo(value.repo ? checkRepo(value.repo) : null, sessionID, cwd)
    const keep = typeof value.comments === "number" ? Math.min(50, Math.max(0, Math.floor(value.comments))) : 10
    const item = await gitlab.item({ repo, number, kind: value.kind === "issue" || value.kind === "mr" ? value.kind : undefined })
    const queue = await load(sessionID)
    const older = item.comments.length - keep
    const context = itemContextText(item, keep)
    const mine = queue.actions.filter((action) => action.repo === repo && action.number === number)
    return [
      context,
      ...(older > 0 ? ["", `_${older} older comments not shown; pass a larger \`comments\` to read them._`] : []),
      ...(mine.length > 0 ? ["", "## Agent actions on it in this session", ...mine.map((action) => `- ${describe(action)} — ${statusText(action)}`)] : []),
    ].join("\n")
  }

  const status = async (raw: unknown, context: { sessionID: string; signal: AbortSignal }) => {
    const value = record(raw)
    const sessionID = context.sessionID
    const reviewed = Array.isArray(value.reviewed) ? value.reviewed.filter((number): number is number => typeof number === "number" && Number.isSafeInteger(number) && number > 0) : []
    const before = await update(sessionID, (queue) => {
      const triage = queue.triage
      if (!triage) return queue
      const used = queue.actions.some((action) => action.round === triage.round)
      return { ...queue, triage: { ...triage, round: used ? triage.round + 1 : triage.round, reviewed: [...new Set([...triage.reviewed, ...reviewed])] } }
    })
    const isQuiet = value.wait === true ? await quiet(sessionID, context.signal) : true
    const queue = before.triage && value.all !== true ? await markChecked(sessionID) : await load(sessionID)
    const triage = before.triage
    if (triage && value.all !== true) return triageStatus(queue, triage.checkedAt, isQuiet)
    const wanted = typeof value.status === "string" && value.status !== "all" ? value.status : undefined
    const list = queue.actions.filter((action) => (!wanted || action.status === wanted) && (!value.repo || action.repo === value.repo))
    const waited = isQuiet ? [] : ["", "Some actions still wait for the user; call again with `wait: true` to keep waiting."]
    if (list.length === 0) return [`No GitLab actions${wanted ? ` ${wanted}` : ""} in this session. Auto-run is ${queue.auto ? "on" : "off"}.`, ...waited].join("\n")
    return [
      `${plural(list.length, "action")} in this session, oldest first. Auto-run is ${queue.auto ? "on: writes run at once" : "off: writes wait for the user's approval"}.`,
      ...list.map((action) => `- ${action.id} ${actionLine(action)}`),
      ...waited,
    ].join("\n")
  }

  const markChecked = (sessionID: string) => update(sessionID, (queue) => (queue.triage ? { ...queue, triage: { ...queue.triage, checkedAt: Date.now() } } : queue))

  const recordShell = async (sessionID: string, command: string, cwd: string, workdir: string | undefined) => {
    const found = parseShell(command)
    if (found.length === 0) return
    const start = workdir ? resolve(cwd, workdir) : cwd
    const resolved = await Promise.all(
      found.map(async (entry) => ({
        ...entry,
        repo: entry.repo ?? (entry.cd === "?" ? null : await repoOfSession(sessionID, start, (entry.cd ?? ".").replace(/^~(?=\/|$)/, homedir()))),
      })),
    )
    const known = resolved.filter((entry): entry is typeof entry & { repo: string } => !!entry.repo)
    if (known.length === 0) return
    const infos = new Map<string, Map<number, { item: "issue" | "mr"; title: string }>>()
    const groups = new Set(known.map((entry) => `${entry.repo}\u0000${entry.group}`))
    for (const key of groups) {
      const [repo, group] = key.split("\u0000") as [string, "issue" | "mr"]
      const map = await gitlab.itemsInfo(repo, known.filter((entry) => entry.repo === repo && entry.group === group).map((entry) => entry.number), group).catch(() => new Map())
      infos.set(key, new Map([...map].map(([number, info]) => [number, { item: info.item, title: info.title }])))
    }
    const batch = `b_${randomUUID().replaceAll("-", "").slice(0, 8)}`
    const now = Date.now()
    await add(
      sessionID,
      known.map((entry) => {
        const info = infos.get(`${entry.repo}\u0000${entry.group}`)?.get(entry.number)
        return {
          id: `a_${randomUUID().replaceAll("-", "").slice(0, 12)}`,
          sessionID,
          batch,
          repo: entry.repo,
          number: entry.number,
          item: info?.item ?? entry.group,
          title: info?.title ?? "",
          kind: entry.kind,
          payload: entry.payload,
          note: "",
          status: "done",
          error: null,
          result: null,
          source: "shell",
          undoOf: null,
          undoneBy: null,
          createdAt: now,
          updatedAt: now,
        }
      }),
    )
    known.forEach((entry) => deps.emit({ type: "item", repo: entry.repo, number: entry.number }))
  }

  // Review drafts.

  const draftKey = (sessionID: string, repo: string, number: number) => `${sessionID}\u0000${repo.toLowerCase()}#${number}`
  const loadDraft = async (sessionID: string, repo: string, number: number) => (await store.read()).drafts[draftKey(sessionID, repo, number)]
  const saveDraft = async (draft: DraftReview) => {
    await store.mutate((state) => {
      state.drafts[draftKey(draft.sessionID, draft.repo, draft.number)] = draft
    })
    deps.emit({ type: "review", repo: draft.repo, number: draft.number })
    return draft
  }
  const dropDraft = async (sessionID: string, repo: string, number: number) => {
    await store.mutate((state) => {
      delete state.drafts[draftKey(sessionID, repo, number)]
    })
    deps.emit({ type: "review", repo, number })
  }

  const pullRequest = async (repo: string, number: number) => {
    const item = await gitlab.item({ repo, number, kind: "mr" })
    if (item.kind !== "mr" || !item.pr) throw new Error(`${repo}!${number} is an issue, not a merge request.`)
    const sha = item.pr.sha
    return { item, sha, files: await gitlab.files({ repo, number, head: sha }) }
  }

  const draftTool = async (raw: unknown, sessionID: string, cwd: string) => {
    const review = parseReview(raw)
    const repo = await requireRepo(review.repo, sessionID, cwd)
    const number = review.number
    const mr = await pullRequest(repo, number)
    const mine = await gitlab.viewerName(repo).then((name) => name === mr.item.author, () => false)
    if (mr.item.state !== "OPEN") throw new Error(`${repo}!${number} is ${mr.item.state.toLowerCase()}; only an open merge request can be reviewed.`)
    const problems = review.comments.flatMap((comment, index) => {
      const error = placementError(mr.files, comment)
      return error ? [`- comments[${index}] (${comment.path}:${comment.line}): ${error}`] : []
    })
    if (problems.length > 0)
      throw new Error(
        [
          `Nothing was drafted: ${problems.length} of ${review.comments.length} comments are not on lines of the diff at the head (${mr.sha.slice(0, 7)}). Fix them and call again with every comment; use the gitlab_panel_diff tool for line numbers.`,
          ...problems,
        ].join("\n"),
      )
    const event: ReviewEvent = mine && review.event !== "COMMENT" ? "COMMENT" : review.event
    const now = Date.now()
    const replaced = await loadDraft(sessionID, repo, number)
    await saveDraft({
      sessionID,
      repo,
      number,
      sha: mr.sha,
      summary: review.summary,
      event,
      note: review.note,
      source: "agent",
      comments: review.comments.map((comment) => ({ id: commentId(), ...comment, source: "agent", edited: false })),
      createdAt: now,
      updatedAt: now,
    })
    return [
      `Drafted a review of ${repo}!${number} with ${review.comments.length} inline comment${review.comments.length === 1 ? "" : "s"}. The user reviews and submits it in the GitLab panel.`,
      ...(event !== review.event ? [`The suggested verdict is "COMMENT": GitLab does not let the user ${review.event === "APPROVE" ? "approve" : "request changes on"} their own merge request.`] : []),
      ...(replaced ? ["It replaces the draft you made earlier in this session."] : []),
      "Don't submit it another way (such as glab in the shell); stop here unless the user asks for more.",
    ].join("\n")
  }

  const diffTool = async (raw: unknown, sessionID: string, cwd: string) => {
    const value = record(raw)
    const number = Number(typeof value.number === "string" ? value.number.replace(/^[#!]/, "") : value.number)
    if (!Number.isSafeInteger(number) || number <= 0) throw new Error("`number` must be a positive whole number.")
    const repo = await requireRepo(value.repo ? checkRepo(value.repo) : null, sessionID, cwd)
    const mr = await pullRequest(repo, number)
    const path = typeof value.path === "string" && value.path.trim() ? value.path.trim().replace(/^\.?\//, "") : null
    return `# ${repo}!${number} at ${mr.sha.slice(0, 7)}: ${mr.item.title}\n\n${diffText(mr.files, path)}`
  }

  // The tools.

  const tool = (name: string, description: string, parameters: Record<string, unknown>, execute: (raw: any, exec: any) => Promise<string>) => {
    ctx.tools.register({
      name,
      description,
      parameters,
      timeoutMs: 11 * 60_000,
      output: {
        schema: { type: "string" },
        render: (_args: unknown, value: unknown) => [{ type: "text", text: String(value ?? "") }],
      },
      async execute(raw: unknown, exec: any) {
        const context = sessionOf(exec)
        return execute(raw, { ...context, exec })
      },
    })
  }

  const sessionOf = (exec: any) => {
    const session = exec?.agent?.session
    const sessionID = String(session?.id ?? "")
    if (!sessionID) throw new Error("This tool needs an agent session.")
    const working = ctx.workingDirectory
    const cwd = working?.get ? working.get(session) : session?.header?.cwd
    if (!cwd) throw new Error("This session has no working directory.")
    return { sessionID, cwd: String(cwd) }
  }

  const REPO = { type: "string", description: "Project as group/project (subgroups allowed). Omit it to use the GitLab project of this session's working directory." }
  const NUMBERS = {
    type: "array",
    items: { type: "integer", minimum: 1 },
    minItems: 1,
    maxItems: MAX_BATCH,
    description: `Issue or merge request numbers (IIDs), up to ${MAX_BATCH}. Each becomes its own action that the user approves or skips.`,
  }
  const NOTE = { type: "string", description: 'One short sentence telling the user why, shown next to each action, e.g. "Same crash as #120, which has the fix".' }
  const ITEM_KIND = { type: "string", enum: ["issue", "mr"], description: "GitLab numbers issues (#) and merge requests (!) separately. Pass issue or mr when both exist with this number; otherwise it is inferred." }
  const APPROVAL =
    "Nothing is written right away: each number becomes a proposed action the user approves, edits or skips in the GitLab panel, and the result lists what was proposed. When the user has turned on auto-run for this session, the actions run at once instead and the result reports each outcome. Don't propose the same thing twice or run it another way (such as glab in the shell); use the gitlab_panel_actions tool to see what the user decided."

  tool(
    "gitlab_panel_search",
    "Search a GitLab project's issues or merge requests and get a compact list: number, kind, state, title, labels, author, age and comment count, with the total. Read-only, runs at once. Pass kind to choose issues or merge requests (GitLab numbers them separately); without it, is:mr in the query selects merge requests and anything else lists issues. Query accepts words plus GitLab-friendly qualifiers such as is:open, is:closed, is:merged, label:bug, author:@me, assignee:@me, reviewer:@me, milestone:v1, no:assignee, sort:created-desc or sort:updated-desc. Use cursor from a result for the next page, and gitlab_panel_view to read one item in full.",
    {
      type: "object",
      properties: {
        query: { type: "string", description: "Words and qualifiers, without repo:. Empty lists the newest items." },
        repo: REPO,
        kind: ITEM_KIND,
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Results per page, 1 to 100. Defaults to 30." },
        cursor: { type: "string", description: "The cursor a previous result gave, for the next page." },
      },
      required: ["query"],
      additionalProperties: false,
    },
    async (raw, context) => search(raw, context.sessionID, context.cwd),
  )

  tool(
    "gitlab_panel_view",
    "Read one GitLab issue or merge request: title, state, author, labels, assignees, milestone, description and the latest comments (long text is cut), and for a merge request its branches, review state and pipeline. Also lists the agent actions already proposed or done on it in this session. Read-only, runs at once.",
    {
      type: "object",
      properties: {
        number: { type: "integer", minimum: 1, description: "The issue or merge request IID." },
        kind: { type: "string", enum: ["issue", "mr"], description: "Whether it is an issue or a merge request. Omit to try the merge request first." },
        repo: REPO,
        comments: { type: "integer", minimum: 0, maximum: 50, description: "How many of the latest comments to include, 0 to 50. Defaults to 10." },
      },
      required: ["number"],
      additionalProperties: false,
    },
    async (raw, context) => view(raw, context.sessionID, context.cwd),
  )

  const WRITES: { kind: WriteKind; description: string; parameters: Record<string, unknown> }[] = [
    {
      kind: "comment",
      description: `Propose a comment on GitLab issues or merge requests (Markdown, up to 65,536 characters). ${APPROVAL}`,
      parameters: {
        type: "object",
        properties: { numbers: NUMBERS, kind: ITEM_KIND, body: { type: "string", minLength: 1, description: "The comment, in GitLab-flavored Markdown." }, note: NOTE, repo: REPO },
        required: ["numbers", "body", "note"],
        additionalProperties: false,
      },
    },
    {
      kind: "close",
      description: `Propose closing GitLab issues or merge requests, with a reason and an optional closing comment. reason: "completed" (fixed or done), "not_planned" (won't fix, stale, invalid, out of scope) or "duplicate" with duplicate_of, the issue to keep. Reasons apply to issues; merge requests simply close. Items already closed are left out. ${APPROVAL}`,
      parameters: {
        type: "object",
        properties: {
          numbers: NUMBERS,
          kind: ITEM_KIND,
          reason: { type: "string", enum: ["completed", "not_planned", "duplicate"], description: 'Why: "completed", "not_planned" or "duplicate". Defaults to "completed".' },
          duplicate_of: { type: "integer", minimum: 1, description: 'With reason "duplicate": the issue these duplicate.' },
          comment: { type: "string", description: "Optional comment posted before closing, in Markdown." },
          note: NOTE,
          repo: REPO,
        },
        required: ["numbers", "note"],
        additionalProperties: false,
      },
    },
    {
      kind: "reopen",
      description: `Propose reopening closed GitLab issues or merge requests, with an optional comment. Merged merge requests cannot be reopened. ${APPROVAL}`,
      parameters: {
        type: "object",
        properties: { numbers: NUMBERS, kind: ITEM_KIND, comment: { type: "string", description: "Optional comment posted after reopening." }, note: NOTE, repo: REPO },
        required: ["numbers", "note"],
        additionalProperties: false,
      },
    },
    {
      kind: "label",
      description: `Propose adding and removing labels on GitLab issues or merge requests. Use the project's existing labels: an unknown name is an error that lists the valid ones. Labels already there (or already absent) are left alone. ${APPROVAL}`,
      parameters: {
        type: "object",
        properties: {
          numbers: NUMBERS,
          kind: ITEM_KIND,
          add: { type: "array", items: { type: "string", minLength: 1 }, description: "Label names to add." },
          remove: { type: "array", items: { type: "string", minLength: 1 }, description: "Label names to remove." },
          note: NOTE,
          repo: REPO,
        },
        required: ["numbers", "note"],
        additionalProperties: false,
      },
    },
    {
      kind: "assign",
      description: `Propose assigning or unassigning people on GitLab issues or merge requests, by GitLab username (or @me for the signed-in user). ${APPROVAL}`,
      parameters: {
        type: "object",
        properties: {
          numbers: NUMBERS,
          kind: ITEM_KIND,
          add: { type: "array", items: { type: "string", minLength: 1 }, description: "Usernames to assign." },
          remove: { type: "array", items: { type: "string", minLength: 1 }, description: "Usernames to unassign." },
          note: NOTE,
          repo: REPO,
        },
        required: ["numbers", "note"],
        additionalProperties: false,
      },
    },
  ]

  WRITES.forEach((write) =>
    tool(write.kind === "assign" ? "gitlab_panel_assign" : `gitlab_panel_${write.kind}`, write.description, write.parameters, async (raw, context) =>
      propose(write.kind, raw, context),
    ),
  )

  tool(
    "gitlab_panel_actions",
    "List this session's GitLab actions with their status: waiting for the user's approval, approved and queued, running, done, failed (with GitLab's error), skipped by the user, or undone; and what the user changed when they edited one. Includes glab writes you ran in the shell and the user's own bulk actions. Call it after proposing to learn what the user decided before following up; don't propose skipped actions again unless the user asks, and follow the user's edits. With `wait: true` it first waits (up to 10 minutes) until the user has decided every proposal and the approved ones have run. In a triage session it reports the run's progress and only the decisions since you last called it (pass `all: true` for the full list), and each call starts a new batch.",
    {
      type: "object",
      properties: {
        status: { type: "string", enum: ["all", "proposed", "approved", "running", "done", "failed", "skipped", "undone"], description: 'Only actions with this status. Defaults to "all".' },
        repo: REPO,
        wait: { type: "boolean", description: "Wait until the user has decided every proposal and the approved ones have run, then report. Defaults to false." },
        reviewed: { type: "array", items: { type: "integer", minimum: 1 }, description: "In a triage session: every number you reviewed since the last call, including the ones you proposed nothing for." },
        all: { type: "boolean", description: "In a triage session: list every action instead of only the decisions since the last call." },
      },
      additionalProperties: false,
    },
    async (raw, context) => status(raw, context),
  )

  tool(
    "gitlab_panel_diff",
    "Read a merge request's changed files with their diffs, each line numbered with its old (LEFT) and new (RIGHT) line number, and the line ranges review comments can go on per file. Long diffs are cut; pass `path` to read one file in full. Read-only, runs at once. Use it before gitlab_panel_review to place inline comments.",
    {
      type: "object",
      properties: {
        number: { type: "integer", minimum: 1, description: "The merge request IID." },
        repo: REPO,
        path: { type: "string", description: "Only this file, shown in full." },
      },
      required: ["number"],
      additionalProperties: false,
    },
    async (raw, context) => diffTool(raw, context.sessionID, context.cwd),
  )

  tool(
    "gitlab_panel_review",
    `Draft a review of a merge request: a summary, a suggested verdict and inline comments on lines of its diff. Nothing is posted: the draft appears in the user's GitLab panel, where they edit, add to and submit it (or discard it). Every comment must be on a line inside a hunk of the current diff (see gitlab_panel_diff): RIGHT with the new line number for added or unchanged lines, LEFT with the old number for removed lines; \`start_line\` makes it span lines of one hunk. An invalid line rejects the whole call with the valid ranges, so nothing is half drafted. Calling it again for the same merge request replaces this session's draft. Up to ${MAX_COMMENTS} comments.`,
    {
      type: "object",
      properties: {
        number: { type: "integer", minimum: 1, description: "The merge request IID." },
        repo: REPO,
        summary: { type: "string", minLength: 1, description: "The review's body in Markdown: the verdict in a sentence, then the main points." },
        event: { type: "string", enum: ["COMMENT", "REQUEST_CHANGES", "APPROVE"], description: 'The suggested verdict: "REQUEST_CHANGES" for problems that must be fixed, "APPROVE" when it is ready, else "COMMENT". Defaults to "COMMENT". The user decides.' },
        comments: {
          type: "array",
          maxItems: MAX_COMMENTS,
          description: "Inline comments, each on a line of the diff.",
          items: {
            type: "object",
            properties: {
              path: { type: "string", description: "The file's path in the repository, as the diff lists it." },
              line: { type: "integer", minimum: 1, description: "The line the comment is on (the last line, with start_line)." },
              side: { type: "string", enum: ["RIGHT", "LEFT"], description: "RIGHT (default): the new file's line number. LEFT: the old file's, for removed lines." },
              start_line: { type: "integer", minimum: 1, description: "For a comment on several lines: the first one, in the same hunk and on the same side." },
              body: { type: "string", minLength: 1, description: "The comment in Markdown." },
            },
            required: ["path", "line", "body"],
            additionalProperties: false,
          },
        },
        note: { type: "string", description: "One short sentence for the user about this review, shown with the draft." },
      },
      required: ["number", "summary", "note"],
      additionalProperties: false,
    },
    async (raw, context) => draftTool(raw, context.sessionID, context.cwd),
  )

  // The window's view of the queue and the user's decisions.

  const methods = {
    agentActions: async ({ sessionID, repo }: { sessionID: string; repo: string | null }) => {
      const queue = await load(sessionID)
      return repo ? { ...queue, actions: queue.actions.filter((action) => action.repo === repo) } : queue
    },
    agentRecent: async ({ repo, limit }: { repo: string; limit: number }) => {
      const sessions = await recentSessions(repo)
      const queues = await Promise.all(sessions.map(load))
      return queues
        .flatMap((queue) => queue.actions.filter((action) => action.repo === repo))
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, Math.max(1, Math.min(500, Math.floor(limit) || 50)))
    },
    agentDecide: async ({ sessionID, ids, batch, decision }: { sessionID: string; ids: readonly string[] | null; batch: string | null; decision: "approve" | "skip" | "reset" }) => {
      const decidable = (action: AgentAction) =>
        decision === "reset"
          ? action.source === "tool" && (action.status === "approved" || (action.status === "skipped" && !action.error))
          : action.status === "proposed" || action.status === "approved"
      const picked = (action: AgentAction) => (ids ? ids.includes(action.id) : true) && (!batch || action.batch === batch) && decidable(action)
      const status = decision === "approve" ? "approved" : decision === "skip" ? "skipped" : "proposed"
      const count = { value: 0 }
      await update(sessionID, (queue) => {
        count.value = queue.actions.filter(picked).length
        return { ...queue, actions: queue.actions.map((action) => (picked(action) ? { ...action, status, updatedAt: Date.now() } : action)) }
      })
      if (decision === "approve") kick(sessionID)
      return `${decision === "approve" ? "Approved" : decision === "skip" ? "Skipped" : "Took back"} ${plural(count.value, "action")}.`
    },
    agentQueue: async (input: { sessionID: string; repo: string; kind: WriteKind; numbers: readonly number[]; itemKind?: "issue" | "mr"; body?: string; reason?: CloseReason; duplicateOf?: number; add?: readonly string[]; remove?: readonly string[] }) => {
      const proposal = parseWrite(input.kind, {
        repo: input.repo,
        numbers: input.numbers,
        kind: input.itemKind,
        note: "user",
        ...(input.kind === "comment" ? { body: input.body } : { comment: input.body }),
        reason: input.reason,
        duplicate_of: input.duplicateOf,
        add: input.add,
        remove: input.remove,
      })
      const repo = proposal.repo ?? input.repo
      const payload = input.kind === "label" ? await knownLabels(repo, proposal) : proposal.payload
      const [info, queue] = await Promise.all([gitlab.itemsInfo(repo, proposal.numbers, proposal.itemKind), load(input.sessionID)])
      const reasons = blockers(input.kind, repo, proposal.numbers, payload, info, queue)
      const skipped = new Map(reasons)
      const numbers = proposal.numbers.filter((number) => !skipped.has(number))
      const batch = `b_${randomUUID().replaceAll("-", "").slice(0, 8)}`
      const actions = expand(
        { ...proposal, numbers, payload },
        { sessionID: input.sessionID, repo, batch, now: Date.now(), status: "approved", items: info, id: () => `a_${randomUUID().replaceAll("-", "").slice(0, 12)}`, source: "user" },
      )
      await add(input.sessionID, actions)
      kick(input.sessionID)
      return { batch, queued: numbers, skipped: reasons.map(([number, reason]) => ({ number, reason })) }
    },
    agentTriage: async ({ sessionID, triage }: { sessionID: string; triage: AgentQueue["triage"] }) => {
      if (!triage) throw new Error("Triage metadata is required.")
      const now = Date.now()
      await update(sessionID, (queue) => ({ ...queue, triage: { ...triage, round: 1, reviewed: [], checkedAt: now, createdAt: now } }))
      await indexRepo(triage.repo, sessionID)
      return "Triage started."
    },
    agentEdit: async (edit: { sessionID: string; id: string; body?: string; reason?: CloseReason; duplicateOf?: number | null; add?: readonly string[]; remove?: readonly string[] }) => {
      const action = (await load(edit.sessionID)).actions.find((item) => item.id === edit.id)
      if (!action) throw new Error("That action is gone.")
      if (action.status !== "proposed") throw new Error("Only an action waiting for approval can be edited.")
      if (!["comment", "close", "reopen", "label", "assign"].includes(action.kind)) throw new Error("This action cannot be edited.")
      const payload = action.payload
      const body = edit.body ?? payload.body
      const reason = edit.reason ?? payload.reason
      const duplicateOf = edit.duplicateOf === null || reason !== "duplicate" ? undefined : (edit.duplicateOf ?? payload.duplicateOf)
      const checked = parseWrite(action.kind as WriteKind, {
        numbers: [action.number],
        note: action.note || "edited",
        ...(action.kind === "comment" ? { body } : { comment: body }),
        reason,
        duplicate_of: duplicateOf,
        add: edit.add ?? payload.add,
        remove: edit.remove ?? payload.remove,
      })
      const next = action.kind === "label" ? await knownLabels(action.repo, checked) : checked.payload
      const updated = await update(edit.sessionID, (queue) => ({
        ...queue,
        actions: queue.actions.map((item) =>
          item.id === action.id && item.status === "proposed" ? { ...item, payload: next, edited: true, original: item.original ?? item.payload, updatedAt: Date.now() } : item,
        ),
      }))
      const result = updated.actions.find((item) => item.id === action.id)
      if (result?.status !== "proposed") throw new Error("The action was decided while you edited it.")
      return result
    },
    agentUndo: async ({ sessionID, id }: { sessionID: string; id: string }) => {
      const action = (await load(sessionID)).actions.find((item) => item.id === id)
      const plan = action ? undoFor(action) : undefined
      if (!action || !plan) throw new Error("This action cannot be undone.")
      const now = Date.now()
      const undo: AgentAction = {
        ...action,
        id: `a_${randomUUID().replaceAll("-", "").slice(0, 12)}`,
        batch: `b_${randomUUID().replaceAll("-", "").slice(0, 8)}`,
        kind: plan.kind,
        payload: plan.payload,
        note: `Undo: ${describe(action)}`,
        status: "approved",
        error: null,
        result: null,
        source: "user",
        undoOf: action.id,
        undoneBy: null,
        edited: undefined,
        original: undefined,
        round: undefined,
        createdAt: now,
        updatedAt: now,
      }
      await update(sessionID, (queue) => ({
        ...queue,
        actions: [...queue.actions.map((item) => (item.id === id ? { ...item, undoneBy: undo.id, updatedAt: now } : item)), undo],
      }))
      kick(sessionID)
      return `Undoing: ${describe(undo)}.`
    },
    agentRetry: async ({ sessionID, ids }: { sessionID: string; ids: readonly string[] }) => {
      await update(sessionID, (queue) => ({
        ...queue,
        actions: queue.actions.map((action) => (ids.includes(action.id) && action.status === "failed" ? { ...action, status: "approved", error: null, updatedAt: Date.now() } : action)),
      }))
      kick(sessionID)
      return "Retrying."
    },
    agentAuto: async ({ sessionID, auto }: { sessionID: string; auto: boolean }) => {
      await update(sessionID, (queue) => ({ ...queue, auto }))
      return auto ? "Auto-run on." : "Auto-run off."
    },

    reviewDrafts: async ({ repo, number, sessionID }: { repo: string; number: number; sessionID: string | null }) => {
      const state = await store.read()
      return Object.values(state.drafts)
        .filter((draft) => draft.repo.toLowerCase() === repo.toLowerCase() && draft.number === number)
        .sort((a, b) => Number(b.sessionID === sessionID) - Number(a.sessionID === sessionID) || b.updatedAt - a.updatedAt)
    },
    reviewEdit: async (edit: { sessionID: string; repo: string; number: number; summary?: string; event?: ReviewEvent; update?: { id: string; body: string }; remove?: string; add?: { path: string; line: number; side: "LEFT" | "RIGHT"; startLine: number | null; body: string }; sha?: string }) => {
      const add = edit.add
      const files = add ? (await pullRequest(edit.repo, edit.number)).files : []
      const error = add ? placementError(files, add) : undefined
      if (error) throw new Error(error)
      return serialize(draftKey(edit.sessionID, edit.repo, edit.number), async () => {
        const draft = await loadDraft(edit.sessionID, edit.repo, edit.number)
        const now = Date.now()
        const base =
          draft ??
          (add && edit.sha
            ? { sessionID: edit.sessionID, repo: edit.repo, number: edit.number, sha: edit.sha, summary: "", event: "COMMENT" as ReviewEvent, note: "", source: "user" as const, comments: [], createdAt: now, updatedAt: now }
            : undefined)
        if (!base) throw new Error("This draft review is gone: it was submitted or discarded.")
        return saveDraft(
          editDraft(
            base,
            { summary: edit.summary, event: edit.event, update: edit.update, remove: edit.remove, add: add ? { id: commentId(), ...add, source: "user", edited: false } : undefined },
            now,
          ),
        )
      })
    },
    reviewDiscard: async ({ sessionID, repo, number }: { sessionID: string; repo: string; number: number }) => {
      await serialize(draftKey(sessionID, repo, number), () => dropDraft(sessionID, repo, number))
      return "Draft review discarded."
    },
    reviewSubmit: async ({ sessionID, repo, number, force }: { sessionID: string; repo: string; number: number; force: boolean }) =>
      serialize(draftKey(sessionID, repo, number), async () => {
        const draft = await loadDraft(sessionID, repo, number)
        if (!draft) throw new Error("This draft review is gone: it was submitted or discarded.")
        const pr = await pullRequest(repo, number)
        if (pr.item.state !== "OPEN") throw new Error(`!${number} is ${pr.item.state.toLowerCase()}; GitLab takes reviews only on open merge requests.`)
        const split = splitDrift(draft.comments, pr.files)
        if (pr.sha !== draft.sha && !force) {
          return {
            submitted: false,
            url: null,
            moved: split.moved,
            message: `!${number} has new commits since this review was drafted.${split.moved.length > 0 ? ` ${split.moved.length} of ${draft.comments.length} comments are on lines no longer in the diff; submitting moves them into the summary.` : " Every comment's line is still in the diff."}`,
          }
        }
        const body = withMoved(draft.summary, split.moved)
        if (draft.event === "REQUEST_CHANGES" && !body.trim()) throw new Error("Requesting changes needs a summary.")
        if (draft.event === "COMMENT" && !body.trim() && split.valid.length === 0) throw new Error("Write a summary or add a comment first.")
        const url = await gitlab.createReview({ repo, number, sha: pr.sha, event: draft.event, body, comments: split.valid })
        await dropDraft(sessionID, repo, number)
        return {
          submitted: true,
          url: url || null,
          moved: split.moved,
          message: `Review submitted with ${split.valid.length} inline comment${split.valid.length === 1 ? "" : "s"}${split.moved.length > 0 ? `; ${split.moved.length} moved into the summary` : ""}.`,
        }
      }),
  }

  const start = () => {
    const hook = (exec: any, result: any) => {
      if (exec?.name !== "bash" && exec?.name !== "pwsh") return
      const args = exec.arguments && typeof exec.arguments === "object" ? exec.arguments : {}
      const command = typeof args.command === "string" ? args.command : ""
      if (!/\bglab\b/.test(command)) return
      if (result?.isError) return
      const value = result?.value && typeof result.value === "object" ? result.value : {}
      if (typeof value.exitCode === "number" && value.exitCode !== 0) return
      if (value.kind === "background" || value.status === "running") return
      const sessionID = String(exec.agent?.session?.id ?? "")
      if (!sessionID) return
      const session = exec.agent?.session
      const cwd = ctx.workingDirectory?.get?.(session) ?? session?.header?.cwd
      if (!cwd) return
      void recordShell(sessionID, command, String(cwd), typeof args.workdir === "string" ? args.workdir : typeof value.cwd === "string" ? value.cwd : undefined).catch((error: unknown) =>
        deps.log("warn", "could not record a glab command", { error: message(error) }),
      )
    }
    ctx.on("tools/result", hook)
    return () => {
      worker.stopped = true
      worker.wake?.()
      waits.forEach((abort) => abort())
      ctx.off?.("tools/result", hook)
    }
  }

  const gitlabRemote = async (repo: string) => {
    const remote = gitlab.remoteOf(repo)
    if (!remote) throw new Error(`No GitLab remote is known for ${repo}. Open the panel in that project first.`)
    return remote
  }

  return { methods, start }
}

interface Progress {
  changed?: boolean
  cleaned?: boolean
  comment?: { id: number; url: string }
  result?: AgentResult
}

function commentId() {
  return `c_${randomUUID().replaceAll("-", "").slice(0, 12)}`
}

function mark(action: AgentAction) {
  return action.item === "issue" ? "#" : "!"
}

function statusText(action: AgentAction) {
  if (action.status === "done") return action.result?.noop ? "done (nothing to change)" : action.undoneBy ? "done, then undone by the user" : "done"
  if (action.status === "failed") return `failed: ${action.error ?? "unknown error"}`
  if (action.status === "skipped") return action.error ? `skipped: ${action.error}` : "skipped by the user"
  if (action.status === "proposed") return "waiting for the user's approval"
  if (action.status === "approved") return "approved, queued to run"
  if (action.status === "running") return action.error ? `running (${action.error})` : "running"
  return "undone by the user"
}

function actionLine(action: AgentAction) {
  const edit = edits(action)
  return `${action.repo}${mark(action)}${action.number}${action.title ? ` "${action.title}"` : ""}: ${describe(action)} — ${statusText(action)}${edit ? ` (${edit})` : ""}${action.source === "shell" ? " (ran in the shell)" : ""}${action.source === "user" && !action.undoOf ? " (the user's own action)" : ""}`
}

function triageStatus(queue: AgentQueue, since: number, isQuiet: boolean) {
  const triage = queue.triage
  if (!triage) return ""
  const progress = triageProgress(triage, queue.actions)
  const mine = queue.actions.filter((action) => action.round !== undefined && action.source === "tool")
  const news = mine.filter((action) => action.updatedAt > since && action.status !== "proposed")
  const skipped = news.filter((action) => action.status === "skipped" && !action.error)
  const edited = news.filter((action) => action.edited)
  const waiting = mine.filter((action) => action.status === "proposed")
  return [
    `Triage of ${triage.repo}: ${progress.reviewed} of ${progress.total} items reviewed · ${progress.approved} approved · ${progress.skipped} skipped · ${progress.waiting} waiting for the user. New proposals go into batch ${triage.round}.`,
    ...(news.length > 0 ? ["", "Decided since you last looked:", ...news.map((action) => `- ${actionLine(action)}`)] : ["", "Nothing was decided since you last looked."]),
    ...(skipped.length > 0 || edited.length > 0
      ? [
          "",
          "The user's preferences from these decisions; follow them for the remaining items:",
          ...skipped.map((action) => `- Skipped on ${mark(action)}${action.number}: ${describe(action)}${action.note ? ` (your note: ${action.note})` : ""}. Don't propose it again.`),
          ...edited.map((action) => `- On ${mark(action)}${action.number}, ${edits(action)}`),
        ]
      : []),
    ...(waiting.length > 0
      ? [
          "",
          `Still waiting for the user: ${waiting.map((action) => `${mark(action)}${action.number} ${describe(action)}`).join("; ")}.`,
          isQuiet ? "Call this tool with `wait: true` to wait for the decisions." : "Call this tool again with `wait: true` to keep waiting.",
        ]
      : []),
    ...(progress.reviewed >= progress.total && waiting.length === 0 ? ["", "Every item is reviewed: summarize the run for the user."] : []),
  ].join("\n")
}

function searchLine(item: { number: number; kind: "issue" | "mr"; state: string; draft: boolean; title: string; labels: { name: string }[]; author: string; created: string; comments: number }) {
  const state = item.draft && item.state === "OPEN" ? "draft" : item.state.toLowerCase()
  const labels = item.labels.length > 0 ? ` [${item.labels.map((label) => label.name).join(", ")}]` : ""
  return `${item.kind === "mr" ? "!" : "#"}${item.number} ${item.kind === "mr" ? "MR" : "issue"} ${state}: ${item.title}${labels} · @${item.author} · ${age(item.created)} · ${plural(item.comments, "comment")}`
}

function age(date: string) {
  const days = Math.floor((Date.now() - Date.parse(date)) / 86_400_000)
  if (!Number.isFinite(days) || days < 1) return "today"
  if (days < 60) return `${days}d ago`
  if (days < 730) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

function plural(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`
}

function record(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {}
}

function message(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}
