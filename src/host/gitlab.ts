import { readFile } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"
import { checkState, diffStats, hunkAt, stateReason } from "../shared/core"
import type {
  ChangedFile,
  Check,
  CloseReason,
  Inbox,
  InboxEntry,
  Item,
  ItemKind,
  Job,
  MergeRequest,
  MergeRequests,
  RemoteCommit,
  Remote,
  RepoMeta,
  Reviews,
  Run,
  RunDetails,
  SearchItem,
  SearchPage,
  Thread,
} from "../shared/types"
import { parseSearchQuery } from "../shared/core"
import { run, type Log } from "./exec"

const META_TTL = 5 * 60_000
const INBOX_TTL = 60_000
const RUNS_TTL = 15_000
const THREADS_TTL = 20_000
const LOG_LIMIT = 400_000
const TOKEN_TTL = 30 * 60_000

/** Bound one host cache, so a long-lived process does not grow without end. */
function keep<K, V>(cache: Map<K, V>, key: K, value: V, limit: number) {
  cache.set(key, value)
  if (cache.size <= limit) return
  for (const old of cache.keys()) {
    if (cache.size <= limit) break
    cache.delete(old)
  }
}

/**
 * GitLab's `labels` field is one comma-separated string, so a label whose own name holds a comma cannot be sent back:
 * it would arrive as two labels and quietly rewrite the item's whole set. Refuse rather than corrupt it.
 */
function labelList(labels: readonly string[]) {
  const broken = labels.find((label) => label.includes(","))
  if (broken) throw new Error(`The label "${broken}" contains a comma, which GitLab's comma-separated labels field cannot carry.`)
  return labels.join(",")
}

export interface GitLabDeps {
  log: Log
  config: { token?: string; tokenEnv?: string; host?: string; apiBase?: string; project?: string }
  reasonOf: (repo: string, number: number) => CloseReason | undefined
  setReason: (repo: string, number: number, reason: CloseReason | undefined) => void
  itemChanged: (repo: string, number: number) => void
  runChanged: (repo: string, id: number) => void
  inboxChanged: () => void
}

interface Viewer {
  id: number
  username: string
  name: string
}

interface Page<T> {
  data: T
  headers: Headers
}

type Json = Record<string, any>

export function createGitLab(deps: GitLabDeps) {
  const viewerCache = new Map<string, Promise<Viewer>>()
  const metaCache = new Map<string, { at: number; value: Promise<RepoMeta> }>()
  const filesCache = new Map<string, Promise<ChangedFile[]>>()
  const threadsCache = new Map<string, { at: number; value: Promise<Reviews> }>()
  const inboxCache: { at: number; value: Promise<Inbox> } = { at: 0, value: Promise.resolve(emptyInbox()) }
  const runsCache = new Map<string, { at: number; value: Promise<Run[]> }>()
  const finishedCache = new Map<string, Promise<RunDetails>>()
  const logsCache = new Map<string, Promise<string>>()
  const tokenCache = new Map<string, { at: number; value: Promise<string | null> }>()
  /** Inline comments already posted for one draft review, so a retry after a partial failure does not duplicate them. */
  const postedCache = new Map<string, Set<string>>()
  /** Writes waiting their turn on one item, so a read-modify-write cannot be clobbered by another running beside it. */
  const writes = new Map<string, Promise<unknown>>()

  const headersFor = (token: string | null) => ({
    "PRIVATE-TOKEN": token ?? "",
    Accept: "application/json",
    "User-Agent": "dsh-gitlab-panel",
  })

  const resolveToken = (host?: string): Promise<string | null> => {
    const key = host ?? ""
    const cached = tokenCache.get(key)
    if (cached && Date.now() - cached.at < TOKEN_TTL) return cached.value
    const value = (async () => {
      const direct = deps.config.token || (deps.config.tokenEnv ? process.env[deps.config.tokenEnv] : undefined) || process.env.GITLAB_TOKEN || process.env.GITLAB_PRIVATE_TOKEN || process.env.GLAB_TOKEN
      if (direct) return direct
      return readGlabToken(host ?? deps.config.host)
    })()
    tokenCache.set(key, { at: Date.now(), value })
    return value
  }

  const requestPage = async (remote: Remote, path: string, init: { method?: string; body?: unknown; query?: Record<string, string | undefined>; signal?: AbortSignal } = {}): Promise<Page<any>> => {
    const query = Object.entries(init.query ?? {})
      .filter(([, value]) => value !== undefined && value !== "")
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join("&")
    const url = `${apiBaseOf(remote)}${path}${query ? `${path.includes("?") ? "&" : "?"}${query}` : ""}`
    const token = await resolveToken(remote.host)
    if (token) {
      const response = await fetch(url, {
        method: init.method ?? "GET",
        headers: {
          ...headersFor(token),
          ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
        },
        body: init.body === undefined ? undefined : JSON.stringify(init.body),
        signal: init.signal,
      })
      if (response.status === 401) tokenCache.delete(remote.host)
      const text = await response.text()
      if (!response.ok) throw new Error(gitlabError(path, response.status, response.statusText, text, retryAfterOf(response.headers)))
      return { data: text ? JSON.parse(text) : null, headers: response.headers }
    }
    return glabPage(remote, path, init)
  }

  const request = async <T = any>(remote: Remote, path: string, init: { method?: string; body?: unknown; query?: Record<string, string | undefined>; signal?: AbortSignal } = {}): Promise<T> =>
    (await requestPage(remote, path, init)).data as T

  const glabPage = async (remote: Remote, path: string, init: { method?: string; body?: unknown; query?: Record<string, string | undefined>; signal?: AbortSignal } = {}): Promise<Page<any>> => {
    const args = ["api", "--hostname", remote.host, "-X", init.method ?? "GET", path]
    const query = Object.entries(init.query ?? {}).filter(([, value]) => value !== undefined && value !== "")
    query.forEach(([key, value]) => args.push("-f", `${key}=${String(value)}`))
    if (init.body !== undefined) args.push("--input", "-")
    const text = await run("glab", args, homedir(), {
      signal: init.signal,
      input: init.body === undefined ? undefined : JSON.stringify(init.body),
      quiet: true,
    }).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error)
      if (/not found|not installed|ENOENT/i.test(message))
        throw new Error("GitLab is not configured: set GITLAB_TOKEN (or run `glab auth login`), or install the GitLab CLI.")
      throw new Error(message)
    })
    return { data: text.trim() ? JSON.parse(text) : null, headers: new Headers() }
  }

  const projectId = (remote: Remote) => encodeURIComponent(remote.path)
  const viewer = (remote: Remote): Promise<Viewer> => {
    const key = `${apiBaseOf(remote)}/${remote.path}`
    const known = viewerCache.get(key)
    if (known) return known
    const value = request<Viewer>(remote, "/user")
    viewerCache.set(key, value)
    value.catch(() => viewerCache.delete(key))
    return value
  }

  const approveState = async (remote: Remote, iid: number) => {
    const data = await request<any>(remote, `/projects/${projectId(remote)}/merge_requests/${iid}/approvals`).catch(() => null)
    if (!data) return { approvedBy: [] as string[], review: null as string | null, requested: [] as string[] }
    const approvedBy = (data.approved_by ?? []).map((entry: Json) => entry.user?.username).filter(Boolean) as string[]
    const required = Number(data.approvals_required ?? 0)
    const left = Number(data.approvals_left ?? 0)
    const reviewerStates = data.approvals?.flatMap((rule: Json) => rule.approved_by ?? []) ?? []
    const review = required > 0 ? (left === 0 ? "APPROVED" : "REVIEW_REQUIRED") : approvedBy.length > 0 ? "APPROVED" : null
    return { approvedBy, review, requested: reviewerStates.map((entry: Json) => entry.user?.username).filter(Boolean) }
  }

  const toMr = async (remote: Remote, raw: Json): Promise<MergeRequest> => {
    const state = raw.state === "merged" ? "MERGED" : raw.state === "closed" || raw.state === "locked" ? "CLOSED" : "OPEN"
    let review: string | null = null
    if (state === "OPEN" && raw.detailed_merge_status) {
      const status = String(raw.detailed_merge_status)
      if (status === "approved") review = "APPROVED"
      else if (status.includes("approval")) review = "REVIEW_REQUIRED"
    }
    return {
      number: raw.iid,
      title: raw.title ?? "",
      state,
      draft: !!raw.draft || !!raw.work_in_progress,
      url: raw.web_url ?? `${remote.web}/-/merge_requests/${raw.iid}`,
      head: raw.source_branch ?? "",
      cross: raw.source_project_id !== undefined && raw.target_project_id !== undefined && raw.source_project_id !== raw.target_project_id,
      base: raw.target_branch ?? "",
      author: raw.author?.username ?? "ghost",
      review,
      checks: checkState(raw.head_pipeline?.status),
      updated: raw.updated_at ?? raw.created_at ?? new Date().toISOString(),
      sha: raw.sha,
      sourceProject: raw.source_project_id ? String(raw.source_project_id) : undefined,
      targetProject: remote.path,
    }
  }

  const toSearchItem = (remote: Remote, raw: Json, kind: ItemKind): SearchItem => {
    const mr = kind === "mr"
    const state = raw.state === "merged" ? "MERGED" : raw.state === "closed" || raw.state === "locked" ? "CLOSED" : "OPEN"
    return {
      kind,
      repo: remote.path,
      number: raw.iid ?? raw.id ?? 0,
      title: raw.title ?? "",
      state,
      draft: !!raw.draft || !!raw.work_in_progress,
      url: raw.web_url ?? `${remote.web}/-/${mr ? "merge_requests" : "issues"}/${raw.iid}`,
      author: raw.author?.username ?? "ghost",
      labels: (raw.labels ?? []).map((label: Json) => (typeof label === "string" ? { name: label, color: "888888" } : { name: label.name, color: label.color ?? "888888" })),
      comments: Number(raw.user_notes_count ?? 0),
      created: raw.created_at ?? "",
      updated: raw.updated_at ?? raw.created_at ?? "",
      head: mr ? (raw.source_branch ?? null) : null,
      base: mr ? (raw.target_branch ?? null) : null,
      review: null,
      checks: mr ? checkState(raw.head_pipeline?.status) : "none",
      assignees: (raw.assignees ?? []).map((user: Json) => user.username).filter(Boolean),
    }
  }

  const mapNote = (note: Json) => ({
    id: Number(note.id),
    author: note.author?.username ?? "ghost",
    body: String(note.body ?? ""),
    created: note.created_at ?? "",
    system: !!note.system,
  })

  const allPages = async <T = any>(remote: Remote, path: string, query: Record<string, string | undefined> = {}, signal?: AbortSignal): Promise<T[]> => {
    const output: T[] = []
    for (let page = 1; page <= 5; page++) {
      const result = await requestPage(remote, path, { query: { ...query, per_page: "100", page: String(page) }, signal })
      const data = Array.isArray(result.data) ? (result.data as T[]) : []
      output.push(...data)
      const next = result.headers.get("x-next-page")
      if (data.length < 100 && !next) break
      if (!next && data.length < 100) break
    }
    return output
  }

  const meta = (remote: Remote): Promise<RepoMeta> => {
    const key = `${apiBaseOf(remote)}/${remote.path}`
    const cached = metaCache.get(key)
    if (cached && Date.now() - cached.at < META_TTL) return cached.value
    const id = projectId(remote)
    const value = Promise.all([
      allPages<Json>(remote, `/projects/${id}/labels`).catch(() => []),
      allPages<Json>(remote, `/projects/${id}/members/all`).catch(() => []),
      allPages<Json>(remote, `/projects/${id}/milestones`, { state: "active" }).catch(() => []),
    ]).then(([labels, members, milestones]) => ({
      labels: labels.map((label) => ({ name: label.name, color: String(label.color ?? "888888").replace(/^#/, ""), description: label.description ?? undefined })),
      people: members.map((member) => member.username).filter(Boolean),
      milestones: milestones.map((entry) => entry.title).filter(Boolean),
    }))
    metaCache.set(key, { at: Date.now(), value })
    return value
  }

  const changes = async (remote: Remote, iid: number, head?: string): Promise<ChangedFile[]> => {
    // Only a known head is immutable enough to remember; without one the merge request moves on.
    const key = head ? `${apiBaseOf(remote)}/${remote.path}!${iid}@${head}` : null
    const known = key ? filesCache.get(key) : undefined
    if (known) return known
    const value = request<Json>(remote, `/projects/${projectId(remote)}/merge_requests/${iid}/changes`).then((data) => {
      const list: Json[] = Array.isArray(data?.changes) ? data.changes : []
      return list.map((entry): ChangedFile => {
        const patch = entry.diff ?? ""
        const stats = diffStats(patch)
        return {
          path: entry.new_path ?? entry.old_path ?? "",
          previous: entry.renamed_file ? (entry.old_path ?? null) : null,
          status: entry.new_file ? "added" : entry.deleted_file ? "removed" : entry.renamed_file ? "renamed" : "modified",
          additions: stats.additions,
          deletions: stats.deletions,
          patch: patch || null,
        }
      })
    })
    if (key) {
      keep(filesCache, key, value, 100)
      value.catch(() => filesCache.delete(key))
    }
    return value
  }

  const readThreads = async (remote: Remote, iid: number, head: string, files: ChangedFile[], author?: string): Promise<Reviews> => {
    const [discussions, approvals, me] = await Promise.all([
      allPages<Json>(remote, `/projects/${projectId(remote)}/merge_requests/${iid}/discussions`).catch(() => []),
      approveState(remote, iid).catch(() => ({ approvedBy: [], review: null, requested: [] })),
      viewer(remote).catch(() => null),
    ])
    const threads: Thread[] = []
    for (const discussion of discussions) {
      const notes = (discussion.notes ?? []).filter((note: Json) => !note.system)
      const diffNotes = notes.filter((note: Json) => note.position)
      if (diffNotes.length === 0) continue
      const first = diffNotes[0]
      const position = first.position ?? {}
      const path = position.new_path || position.old_path || ""
      const line = position.new_line ?? position.old_line ?? null
      const side = position.new_line ? "RIGHT" : "LEFT"
      const file = files.find((entry) => entry.path === path || entry.previous === path)
      threads.push({
        id: String(discussion.id),
        resolved: !!discussion.resolved || diffNotes.every((note: Json) => note.resolved),
        outdated: !!position.head_sha && position.head_sha !== head,
        path,
        line,
        side,
        comments: diffNotes.map((note: Json) => ({
          id: String(note.id),
          author: note.author?.username ?? "ghost",
          body: String(note.body ?? ""),
          created: note.created_at ?? "",
          hunk: hunkAt(file?.patch, Number(line ?? 0), side),
        })),
      })
    }
    const reviews = (approvals.approvedBy ?? []).map((author: string, index: number) => ({
      id: `approval-${index}-${author}`,
      author,
      state: "APPROVED",
      body: "",
      submitted: null,
    }))
    // GitLab refuses to approve or request changes on your own merge request; the panel disables both when it knows.
    return { reviews, threads, mine: !!me && !!author && me.username === author }
  }

  const remoteCommit = async (repo: Remote, sha: string): Promise<RemoteCommit> => {
    const [commit, diff] = await Promise.all([
      request<Json>(repo, `/projects/${projectId(repo)}/repository/commits/${sha}`),
      allPages<Json>(repo, `/projects/${projectId(repo)}/repository/commits/${sha}/diff`).catch(() => []),
    ])
    return {
      repo: repo.path,
      sha: commit.id ?? sha,
      message: commit.message ?? commit.title ?? "",
      author: commit.author_name ?? "",
      date: commit.created_at ?? "",
      url: commit.web_url ?? `${repo.web}/-/commit/${sha}`,
      parents: (commit.parent_ids ?? []).filter(Boolean),
      files: diff.map((entry) => {
        const patch = entry.diff ?? ""
        const stats = diffStats(patch)
        return {
          path: entry.new_path ?? entry.old_path ?? "",
          previous: entry.renamed_file ? (entry.old_path ?? null) : null,
          status: entry.new_file ? "added" : entry.deleted_file ? "removed" : entry.renamed_file ? "renamed" : "modified",
          additions: stats.additions,
          deletions: stats.deletions,
          patch: patch || null,
        }
      }),
    }
  }

  const readInbox = async (): Promise<Inbox> => {
    const [todos, reviews, assigned, authored] = await Promise.allSettled([
      allPages<Json>(currentRemote(), "/todos", { state: "pending" }),
      searchAny(currentRemote(), "mr", "is:open reviewer:@me sort:updated-desc"),
      searchAny(currentRemote(), "issue", "is:open assignee:@me sort:updated-desc"),
      searchAny(currentRemote(), "mr", "is:open author:@me sort:updated-desc"),
    ])
    const notifications =
      todos.status === "fulfilled"
        ? todos.value.flatMap((todo): InboxEntry[] => {
            const target = todo.target ?? {}
            const project = todo.project ?? {}
            const kind = target.target_type === "MergeRequest" ? "mr" : target.target_type === "Issue" ? "issue" : "other"
            const number = target.iid ?? (target.id && kind !== "other" ? target.iid : null)
            const path = project.path_with_namespace ?? project.path ?? ""
            return [{
              thread: Number(todo.id),
              repo: path,
              number: number ? Number(number) : null,
              kind,
              title: target.title ?? String(todo.body ?? ""),
              reason: String(todo.action_name ?? "todo").replace(/_/g, " "),
              updated: todo.updated_at ?? todo.created_at ?? "",
              unread: true,
              url:
                number && project.web_url
                  ? `${project.web_url}/-/${kind === "mr" ? "merge_requests" : "issues"}/${number}`
                  : project.web_url ?? "",
            }]
          })
        : []
    const items = (result: PromiseSettledResult<SearchPage>, reason: string): InboxEntry[] =>
      result.status === "fulfilled"
        ? result.value.items.map((item) => ({
            thread: null,
            repo: item.repo,
            number: item.number,
            kind: item.kind,
            title: item.title,
            reason,
            updated: item.updated,
            unread: false,
            url: item.url,
          }))
        : []
    const all = [todos, reviews, assigned, authored]
    return {
      error: all.every((entry) => entry.status === "rejected") ? message(all[0]?.status === "rejected" ? (all[0] as PromiseRejectedResult).reason : "") : null,
      notifications,
      reviews: items(reviews, "review requested"),
      assigned: items(assigned, "assigned"),
      authored: items(authored, "authored"),
    }
  }

  const searchAny = async (remote: Remote, kind: ItemKind, query: string, cursor: string | null = null, limit = 30): Promise<SearchPage> => {
    const parsed = parseSearchQuery(query, kind)
    const page = Number(cursor ?? 1) || 1
    const path = kind === "mr" ? `/projects/${projectId(remote)}/merge_requests` : `/projects/${projectId(remote)}/issues`
    const result = await requestPage(remote, path, {
      query: {
        ...(await forViewer(remote, parsed.params)),
        search: parsed.search || undefined,
        per_page: String(Math.min(100, Math.max(1, Math.floor(limit) || 30))),
        page: String(page),
      },
    })
    const data: Json[] = Array.isArray(result.data) ? result.data : []
    const headers = result.headers
    const perPage = Math.min(100, Math.max(1, Math.floor(limit) || 30))
    // GitLab omits x-total on big projects and the glab fallback has no headers at all, so x-next-page decides when it is there.
    const rawTotal = headers.get("x-total")
    const total = rawTotal === null ? (page - 1) * perPage + data.length : Number(rawTotal)
    const next = headers.get("x-next-page")
    const more = next === null ? data.length >= perPage : next.trim() !== ""
    return {
      total,
      items: data.map((raw) => toSearchItem(remote, raw, kind)),
      cursor: data.length > 0 && more ? next || String(page + 1) : null,
    }
  }

  /** GitLab's `*_username` params take a literal name, so `@me` becomes the signed-in user's before the request. */
  const forViewer = async (remote: Remote, params: Record<string, string>) => {
    if (!Object.values(params).some((value) => value === "@me")) return params
    const me = await viewer(remote)
    return Object.fromEntries(Object.entries(params).map(([key, value]) => [key, value === "@me" ? me.username : value]))
  }

  const currentRemoteCache: { value?: Remote } = {}
  const remoteCache = new Map<string, Remote>()
  const currentRemote = (): Remote => {
    const remote = currentRemoteCache.value
    if (!remote) throw new Error("No GitLab project is selected.")
    return remote
  }

  return {
    rememberRemote,
    remoteOf: (repo: string) => remoteCache.get(repo) ?? (currentRemoteCache.value?.path === repo ? currentRemoteCache.value : undefined),
    viewer,
    meta,
    changes,
    searchAny,

    search: async ({ repo, kind, query, cursor }: { repo: string; kind: ItemKind; query: string; cursor: string | null }): Promise<SearchPage> => {
      const remote = remoteFor(repo)
      rememberRemote(remote)
      return searchAny(remote, kind, query, cursor)
    },

    mrs: async ({ cwd, fresh, branch }: { cwd: string; fresh: boolean; branch?: string | null }, remote: Remote | null): Promise<MergeRequests> => {
      if (!remote) return { error: "No GitLab remote found for this repository.", items: [] }
      rememberRemote(remote)
      try {
        const me = await viewer(remote).catch(() => null)
        const base = `/projects/${projectId(remote)}/merge_requests`
        const results = await Promise.allSettled([
          request<Json[]>(remote, base, { query: { state: "opened", per_page: "50", order_by: "updated_at", sort: "desc" } }),
          me ? request<Json[]>(remote, base, { query: { state: "opened", author_username: me.username, per_page: "30", order_by: "updated_at", sort: "desc" } }) : Promise.resolve([]),
          branch ? request<Json[]>(remote, base, { query: { source_branch: branch, state: "all", per_page: "20", order_by: "updated_at", sort: "desc" } }) : Promise.resolve([]),
        ])
        const failure = results.find((result) => result.status === "rejected")
        if (results.every((result) => result.status === "rejected")) return { error: message((failure as PromiseRejectedResult)?.reason), items: [] }
        const seen = new Set<number>()
        const items = (await Promise.all(
          results.flatMap((result) => (result.status === "fulfilled" ? (result.value as Json[]) : [])).filter((raw) => !seen.has(raw.iid) && !!seen.add(raw.iid)).map((raw) => toMr(remote, raw)),
        )).sort((a, b) => Number(b.state === "OPEN") - Number(a.state === "OPEN") || b.updated.localeCompare(a.updated))
        return { error: null, items }
      } catch (error) {
        return { error: message(error), items: [] }
      }
    },

    branchMrs: async ({ names }: { names: readonly string[] }, remote: Remote | null): Promise<MergeRequests> => {
      if (!remote) return { error: "No GitLab remote found for this repository.", items: [] }
      const wanted = new Set(names.filter(Boolean))
      if (wanted.size === 0) return { error: null, items: [] }
      try {
        const all: Json[] = []
        for (let page = 1; page <= 2; page++) {
          const data = await request<Json[]>(remote, `/projects/${projectId(remote)}/merge_requests`, {
            query: { state: "opened", per_page: "100", page: String(page), order_by: "updated_at", sort: "desc" },
          })
          all.push(...data)
        }
        const related = (await Promise.all(all.filter((raw) => wanted.has(raw.source_branch)).map((raw) => toMr(remote, raw))))
        return { error: null, items: related }
      } catch (error) {
        return { error: message(error), items: [] }
      }
    },

    item: async ({ repo, number, kind }: { repo: string; number: number; kind?: ItemKind }): Promise<Item> => {
      const remote = remoteFor(repo)
      rememberRemote(remote)
      const known = kind
      const mrRaw = known === "issue" ? null : await request<Json>(remote, `/projects/${projectId(remote)}/merge_requests/${number}`).catch((error: unknown) => {
        if (known === "mr") throw error
        return null
      })
      const isMr = !!mrRaw
      if (!isMr && known === "mr") throw new Error(`Merge request !${number} not found.`)
      const raw = isMr
        ? mrRaw
        : await request<Json>(remote, `/projects/${projectId(remote)}/issues/${number}`)
      const [notes, approvals] = await Promise.all([
        allPages<Json>(remote, `/projects/${projectId(remote)}/${isMr ? "merge_requests" : "issues"}/${number}/notes`, { sort: "asc", order_by: "created_at" }).catch(() => []),
        isMr ? approveState(remote, number).catch(() => ({ approvedBy: [], review: null, requested: [] })) : Promise.resolve({ approvedBy: [], review: null, requested: [] }),
      ])
      const comments = notes.filter((note) => !note.system && !note.position).map(mapNote)
      const state = raw.state === "merged" ? "MERGED" : raw.state === "closed" || raw.state === "locked" ? "CLOSED" : "OPEN"
      const pipeline = raw.head_pipeline
      const checks: Check[] = pipeline
        ? [{ id: Number(pipeline.id), name: pipeline.name ?? "Pipeline", state: checkState(pipeline.status) === "failure" ? "failure" : checkState(pipeline.status) === "pending" ? "pending" : checkState(pipeline.status) === "success" ? "success" : "skipped", url: pipeline.web_url ?? raw.web_url }]
        : []
      const closing = isMr
        ? ((raw.closing_issues_count ?? 0) > 0
            ? await allPages<Json>(remote, `/projects/${projectId(remote)}/merge_requests/${number}/closes_issues`).catch(() => [])
            : [])
        : []
      const related = !isMr
        ? ((await allPages<Json>(remote, `/projects/${projectId(remote)}/issues/${number}/related_merge_requests`).catch(() => [])) as Json[])
        : []
      const links = isMr
        ? closing.map((issue) => ({ repo: remote.path, number: Number(issue.iid) }))
        : related.map((mr) => ({ repo: remote.path, number: Number(mr.iid) }))
      const reason = state === "CLOSED" && !isMr ? deps.reasonOf(remote.path, number) : undefined
      return {
        kind: isMr ? "mr" : "issue",
        repo: remote.path,
        number,
        title: raw.title ?? "",
        state,
        ...(reason ? { reason } : {}),
        draft: !!raw.draft || !!raw.work_in_progress,
        url: raw.web_url ?? `${remote.web}/-/${isMr ? "merge_requests" : "issues"}/${number}`,
        author: raw.author?.username ?? "ghost",
        body: raw.description ?? "",
        labels: (raw.labels ?? []).map((label: Json) => (typeof label === "string" ? { name: label, color: "888888" } : { name: label.name, color: label.color ?? "888888" })),
        assignees: (raw.assignees ?? []).map((user: Json) => user.username).filter(Boolean),
        milestone: raw.milestone?.title ?? null,
        created: raw.created_at ?? "",
        updated: raw.updated_at ?? raw.created_at ?? "",
        comments,
        pr: isMr
          ? {
              head: raw.source_branch ?? "",
              sha: raw.diff_refs?.head_sha ?? raw.sha ?? "",
              requested: (raw.reviewers ?? []).map((user: Json) => user.username).filter(Boolean),
              base: raw.target_branch ?? "",
              cross: raw.source_project_id !== undefined && raw.target_project_id !== undefined && raw.source_project_id !== raw.target_project_id,
              additions: 0,
              deletions: 0,
              files: Number.parseInt(String(raw.changes_count ?? 0), 10) || 0,
              review: approvals.review,
              mergeable: raw.detailed_merge_status ?? raw.merge_status ?? "unchecked",
              checks,
              approvedBy: approvals.approvedBy,
              sourceProject: raw.source_project_id ? String(raw.source_project_id) : undefined,
              targetProject: raw.target_project_id ? String(raw.target_project_id) : undefined,
              mergeStatus: raw.merge_status,
            }
          : null,
        links,
      }
    },

    comment: async ({ repo, number, kind, body }: { repo: string; number: number; kind: ItemKind; body: string }) => {
      const remote = remoteFor(repo)
      await change(repo, number, () => request<Json>(remote, `/projects/${projectId(remote)}/${kind === "mr" ? "merge_requests" : "issues"}/${number}/notes`, { method: "POST", body: { body } }))
      return ""
    },

    setState: async (input: { repo: string; number: number; kind: ItemKind; open: boolean; reason?: CloseReason; duplicateOf?: number; comment?: string }) => {
      const remote = remoteFor(input.repo)
      await change(input.repo, input.number, async () => {
        const path = `/projects/${projectId(remote)}/${input.kind === "mr" ? "merge_requests" : "issues"}/${input.number}`
        const note = input.comment?.trim()
        if (!input.open) {
          if (note) await request(remote, `${path}/notes`, { method: "POST", body: { body: note } })
          if (input.kind === "issue" && input.reason === "duplicate" && input.duplicateOf)
            await request(remote, `${path}/notes`, { method: "POST", body: { body: `Duplicate of #${input.duplicateOf}` } })
          await request(remote, path, { method: "PUT", body: { state_event: "close" } })
        } else {
          await request(remote, path, { method: "PUT", body: { state_event: "reopen" } })
          if (note) await request(remote, `${path}/notes`, { method: "POST", body: { body: note } })
        }
      })
      if (input.kind === "issue" && !input.open) setReason(input.repo, input.number, input.reason ?? "completed")
      if (input.kind === "issue" && input.open) setReason(input.repo, input.number, undefined)
      return ""
    },

    edit: async (input: {
      repo: string
      number: number
      kind: ItemKind
      title?: string
      body?: string
      addLabels: string[]
      removeLabels: string[]
      addAssignees: string[]
      removeAssignees: string[]
      addReviewers: string[]
      removeReviewers: string[]
      milestone?: string | null
    }) => {
      const remote = remoteFor(input.repo)
      await change(input.repo, input.number, async () => {
        const path = `/projects/${projectId(remote)}/${input.kind === "mr" ? "merge_requests" : "issues"}/${input.number}`
        const raw = await request<Json>(remote, path)
        const fields: Json = {}
        if (input.title !== undefined) fields.title = input.title
        if (input.body !== undefined) fields.description = input.body
        const currentLabels: string[] = (raw.labels ?? []).map((label: Json) => (typeof label === "string" ? label : label.name))
        if (input.addLabels.length > 0 || input.removeLabels.length > 0) {
          fields.labels = labelList([...new Set([...currentLabels.filter((label) => !input.removeLabels.includes(label)), ...input.addLabels])])
        }
        const currentAssignees: number[] = (raw.assignees ?? []).map((user: Json) => Number(user.id))
        if (input.addAssignees.length > 0 || input.removeAssignees.length > 0) {
          const add = await userIds(remote, input.addAssignees)
          const remove = new Set(await userIds(remote, input.removeAssignees))
          fields.assignee_ids = [...new Set([...currentAssignees.filter((id) => !remove.has(id)), ...add])]
        }
        if (input.kind === "mr") {
          const currentReviewers: number[] = (raw.reviewers ?? []).map((user: Json) => Number(user.id))
          if (input.addReviewers.length > 0 || input.removeReviewers.length > 0) {
            const add = await userIds(remote, input.addReviewers)
            const remove = new Set(await userIds(remote, input.removeReviewers))
            fields.reviewer_ids = [...new Set([...currentReviewers.filter((id) => !remove.has(id)), ...add])]
          }
        }
        if (input.milestone !== undefined) {
          if (input.milestone === null) fields.milestone_id = 0
          else fields.milestone_id = await milestoneId(remote, input.milestone)
        }
        if (Object.keys(fields).length > 0) await request(remote, path, { method: "PUT", body: fields })
      })
      return ""
    },

    setDraft: async ({ repo, number, draft }: { repo: string; number: number; draft: boolean }) => {
      const remote = remoteFor(repo)
      await change(repo, number, async () => {
        const path = `/projects/${projectId(remote)}/merge_requests/${number}`
        const raw = await request<Json>(remote, path)
        const title = String(raw.title ?? "")
        const next = draft
          ? /^(?:draft:|wip:)\s*/i.test(title) ? title : `Draft: ${title}`
          : title.replace(/^(?:draft:|wip:)\s*/i, "")
        await request(remote, path, { method: "PUT", body: { title: next } })
      })
      return ""
    },

    repoMeta: async ({ repo }: { repo: string }) => {
      const remote = remoteFor(repo)
      return meta(remote)
    },

    remoteCommit: async ({ repo, sha }: { repo: string; sha: string }) => remoteCommit(remoteFor(repo), sha),

    files: async ({ repo, number, head }: { repo: string; number: number; head?: string }) => changes(remoteFor(repo), number, head),

    reviews: async ({ repo, number }: { repo: string; number: number }): Promise<Reviews> => {
      const remote = remoteFor(repo)
      const item = await request<Json>(remote, `/projects/${projectId(remote)}/merge_requests/${number}`)
      const head = item.diff_refs?.head_sha ?? item.sha ?? ""
      const key = `${apiBaseOf(remote)}/${remote.path}!${number}@${head}`
      // Discussions change under a fixed head, so this expires; the Refresh button has to be able to see that.
      const cached = threadsCache.get(key)
      if (cached && Date.now() - cached.at < THREADS_TTL) return cached.value
      const value = changes(remote, number, head).then((files) => readThreads(remote, number, head, files, item.author?.username))
      keep(threadsCache, key, { at: Date.now(), value }, 50)
      value.catch(() => threadsCache.delete(key))
      return value
    },

    submitReview: async ({ repo, number, event, body }: { repo: string; number: number; event: "APPROVE" | "REQUEST_CHANGES" | "COMMENT"; body: string }) => {
      const remote = remoteFor(repo)
      await change(repo, number, async () => {
        const path = `/projects/${projectId(remote)}/merge_requests/${number}`
        if (event === "REQUEST_CHANGES") {
          await request(remote, `${path}/unapprove`, { method: "POST" }).catch(() => undefined)
          await request(remote, `${path}/notes`, { method: "POST", body: { body: body.trim() ? `**Changes requested**\n\n${body}` : "**Changes requested.**" } })
        } else {
          if (body.trim()) await request(remote, `${path}/notes`, { method: "POST", body: { body } })
          if (event === "APPROVE") await request(remote, `${path}/approve`, { method: "POST" })
        }
      })
      return ""
    },

    replyThread: async ({ repo, number, thread, body }: { repo: string; number: number; thread: string; body: string }) => {
      const remote = remoteFor(repo)
      await change(repo, number, () =>
        request(remote, `/projects/${projectId(remote)}/merge_requests/${number}/discussions/${thread}/notes`, { method: "POST", body: { body } }),
      )
      return ""
    },

    resolveThread: async ({ repo, number, thread, resolved }: { repo: string; number: number; thread: string; resolved: boolean }) => {
      const remote = remoteFor(repo)
      await change(repo, number, () =>
        request(remote, `/projects/${projectId(remote)}/merge_requests/${number}/discussions/${thread}`, {
          method: "PUT",
          query: { resolved: String(resolved) },
        }),
      )
      return ""
    },

    lineComment: async (input: { repo: string; number: number; sha: string; path: string; line: number; side: "LEFT" | "RIGHT"; body: string }) => {
      const remote = remoteFor(input.repo)
      await change(input.repo, input.number, async () => {
        const mr = await request<Json>(remote, `/projects/${projectId(remote)}/merge_requests/${input.number}`)
        const refs = mr.diff_refs ?? {}
        const position = {
          position_type: "text",
          base_sha: refs.base_sha,
          start_sha: refs.start_sha,
          head_sha: input.sha || refs.head_sha,
          new_path: input.path,
          old_path: input.path,
          ...(input.side === "RIGHT" ? { new_line: input.line } : { old_line: input.line }),
        }
        await request(remote, `/projects/${projectId(remote)}/merge_requests/${input.number}/discussions`, {
          method: "POST",
          body: { body: input.body, position },
        })
      })
      return ""
    },

    createReview: async (input: { repo: string; number: number; sha: string; event: "APPROVE" | "REQUEST_CHANGES" | "COMMENT"; body: string; comments: { path: string; line: number; side: "LEFT" | "RIGHT"; startLine: number | null; body: string }[] }) => {
      const remote = remoteFor(input.repo)
      return change(input.repo, input.number, async () => {
        const path = `/projects/${projectId(remote)}/merge_requests/${input.number}`
        const mr = await request<Json>(remote, path)
        const refs = mr.diff_refs ?? {}
        const head = input.sha || refs.head_sha
        // GitLab has no single "submit review" call, so this posts one request per part. A failure leaves the
        // earlier parts posted and the draft alive; stamping them keeps the user's retry from duplicating them.
        const key = `${remote.path}!${input.number}@${head}`
        const posted = postedCache.get(key) ?? new Set<string>()
        keep(postedCache, key, posted, 50)
        const once = async (stamp: string, send: () => Promise<unknown>) => {
          if (posted.has(stamp)) return
          await send()
          posted.add(stamp)
        }
        for (const comment of input.comments) {
          const position = {
            position_type: "text",
            base_sha: refs.base_sha,
            start_sha: refs.start_sha,
            head_sha: head,
            new_path: comment.path,
            old_path: comment.path,
            // GitLab REST positions carry one line, so a range comment lands on its last line.
            ...(comment.side === "RIGHT" ? { new_line: comment.line } : { old_line: comment.line }),
          }
          await once(`${comment.path}\u0000${comment.side}\u0000${comment.line}\u0000${comment.body}`, () =>
            request(remote, `${path}/discussions`, { method: "POST", body: { body: comment.body, position } }))
        }
        if (input.event === "REQUEST_CHANGES") {
          await request(remote, `${path}/unapprove`, { method: "POST" }).catch(() => undefined)
          await once(`note\u0000${input.body}`, () =>
            request(remote, `${path}/notes`, { method: "POST", body: { body: input.body.trim() ? `**Changes requested**\n\n${input.body}` : "**Changes requested.**" } }))
        } else {
          if (input.body.trim()) await once(`note\u0000${input.body}`, () => request(remote, `${path}/notes`, { method: "POST", body: { body: input.body } }))
          // A refused approval (your own merge request, an approval rule) is the user's to know about.
          if (input.event === "APPROVE") await once("approve", () => request(remote, `${path}/approve`, { method: "POST" }))
        }
        postedCache.delete(key)
        return mr.web_url ?? `${remote.web}/-/merge_requests/${input.number}`
      })
    },

    runs: async ({ repo, branch, fresh }: { repo: string; branch: string | null; fresh: boolean }) => {
      const remote = remoteFor(repo)
      const key = `${remote.path}\n${branch ?? ""}`
      const cached = runsCache.get(key)
      if (!fresh && cached && Date.now() - cached.at < RUNS_TTL) return cached.value
      const value = request<Json[]>(remote, `/projects/${projectId(remote)}/pipelines`, {
        query: { ref: branch ?? undefined, per_page: "30", order_by: "updated_at", sort: "desc" },
      }).then((data) => data.map((raw) => toRun(remote, raw)))
      keep(runsCache, key, { at: Date.now(), value }, 50)
      value.catch(() => runsCache.delete(key))
      return value
    },

    run: async ({ repo, id }: { repo: string; id: number }): Promise<RunDetails> => {
      const remote = remoteFor(repo)
      const key = `${remote.path}#${id}`
      const done = finishedCache.get(key)
      if (done) return done
      const [pipeline, jobs] = await Promise.all([
        request<Json>(remote, `/projects/${projectId(remote)}/pipelines/${id}`),
        allPages<Json>(remote, `/projects/${projectId(remote)}/pipelines/${id}/jobs`).catch(() => []),
      ])
      const details: RunDetails = {
        run: toRun(remote, pipeline),
        jobs: jobs.map((job) => toJob(remote, job)),
      }
      if (["success", "failed", "canceled", "skipped"].includes(String(pipeline.status))) keep(finishedCache, key, Promise.resolve(details), 50)
      return details
    },

    jobLog: async ({ repo, job }: { repo: string; job: number }) => {
      const remote = remoteFor(repo)
      const key = `${remote.path}#${job}`
      const known = logsCache.get(key)
      if (known) return known
      const token = await resolveToken(remote.host)
      let raw = ""
      if (token) {
        const response = await fetch(`${apiBaseOf(remote)}/projects/${projectId(remote)}/jobs/${job}/trace`, { headers: headersFor(token) })
        raw = await response.text()
        if (!response.ok) throw new Error(gitlabError(`jobs/${job}/trace`, response.status, response.statusText, raw))
      } else {
        raw = await run("glab", ["api", "--hostname", remote.host, `/projects/${projectId(remote)}/jobs/${job}/trace`], homedir(), { quiet: true })
      }
      const output = raw
        .replace(/^\uFEFF/, "")
        .replace(/\r\n?/g, "\n")
        .replace(/\u001b\[[0-9;?]*[A-Za-z]/g, "")
        .replace(/^section_(?:start|end):\d+:[^\n]*\n?/gm, "")
      const text = output.length > LOG_LIMIT ? `… (${Math.round((output.length - LOG_LIMIT) / 1024)} KB earlier output omitted)\n${output.slice(-LOG_LIMIT)}` : output
      const finished = await request<Json>(remote, `/projects/${projectId(remote)}/jobs/${job}`).catch(() => null)
      // A log is up to LOG_LIMIT bytes, so this stays the smallest bound.
      if (finished && ["success", "failed", "canceled", "skipped"].includes(String(finished.status))) keep(logsCache, key, Promise.resolve(text), 20)
      return text
    },

    rerun: async ({ repo, id }: { repo: string; id: number }) => {
      const remote = remoteFor(repo)
      finishedCache.delete(`${remote.path}#${id}`)
      try {
        await request(remote, `/projects/${projectId(remote)}/pipelines/${id}/retry`, { method: "POST" })
        return ""
      } finally {
        runsCache.clear()
        deps.runChanged(remote.path, id)
      }
    },

    cancelRun: async ({ repo, id }: { repo: string; id: number }) => {
      const remote = remoteFor(repo)
      try {
        await request(remote, `/projects/${projectId(remote)}/pipelines/${id}/cancel`, { method: "POST" })
        return ""
      } finally {
        runsCache.clear()
        deps.runChanged(remote.path, id)
      }
    },

    retryJob: async ({ repo, job }: { repo: string; job: number }) => {
      const remote = remoteFor(repo)
      logsCache.delete(`${remote.path}#${job}`)
      await request(remote, `/projects/${projectId(remote)}/jobs/${job}/retry`, { method: "POST" })
      return ""
    },

    cancelJob: async ({ repo, job }: { repo: string; job: number }) => {
      const remote = remoteFor(repo)
      await request(remote, `/projects/${projectId(remote)}/jobs/${job}/cancel`, { method: "POST" })
      return ""
    },

    inbox: async ({ fresh }: { fresh: boolean }) => {
      if (!fresh && inboxCache.value && Date.now() - inboxCache.at < INBOX_TTL) return inboxCache.value
      const value = readInbox()
      inboxCache.value = value
      inboxCache.at = Date.now()
      return value
    },

    markRead: async ({ thread }: { thread: number | null }) => {
      const remote = currentRemote()
      try {
        // GitLab spells the two forms differently: one todo, or every pending one.
        await request(remote, thread ? `/todos/${thread}/mark_as_done` : "/todos/mark_all_as_done", { method: "POST" })
        return ""
      } finally {
        inboxCache.at = 0
        deps.inboxChanged()
      }
    },

    createIssue: async ({ remote, title, body }: { remote: Remote; title: string; body: string }) => {
      const raw = await request<Json>(remote, `/projects/${projectId(remote)}/issues`, { method: "POST", body: { title, description: body } })
      return raw.web_url ?? ""
    },

    createMergeRequest: async ({ repo, source, title, body, base, draft, removeSource }: { repo: string; source: string; title: string; body: string; base: string; draft: boolean; removeSource: boolean }) => {
      const remote = remoteFor(repo)
      const raw = await request<Json>(remote, `/projects/${projectId(remote)}/merge_requests`, {
        method: "POST",
        body: {
          source_branch: source,
          target_branch: base,
          title: draft ? (/^(?:draft:|wip:)/i.test(title) ? title : `Draft: ${title}`) : title,
          description: body,
          remove_source_branch: removeSource,
        },
      })
      return raw.web_url ?? `${remote.web}/-/merge_requests/${raw.iid}`
    },

    mergeMr: async ({ repo, number, squash, deleteBranch }: { repo: string; number: number; squash: boolean; deleteBranch: boolean }) => {
      const remote = remoteFor(repo)
      await change(repo, number, () =>
        request(remote, `/projects/${projectId(remote)}/merge_requests/${number}/merge`, {
          method: "PUT",
          body: { squash, should_remove_source_branch: deleteBranch },
        }),
      )
      deps.itemChanged(remote.path, number)
      return ""
    },

    raw: { request, projectId, viewer, approveState },

    addComment: async (repo: string, number: number, body: string, kind?: ItemKind) => {
      const remote = remoteFor(repo)
      const path = `/projects/${projectId(remote)}/${kind === "issue" ? "issues" : "merge_requests"}/${number}/notes`
      return change(repo, number, async () => {
        const note = await request<Json>(remote, path, { method: "POST", body: { body } })
        return { id: Number(note.id), url: `${remote.web}/-/${kind === "issue" ? "issues" : "merge_requests"}/${number}#note_${note.id}` }
      })
    },

    deleteComment: async (repo: string, number: number, id: number, kind?: ItemKind) => {
      const remote = remoteFor(repo)
      await change(repo, number, () =>
        request(remote, `/projects/${projectId(remote)}/${kind === "issue" ? "issues" : "merge_requests"}/${number}/notes/${id}`, { method: "DELETE" }),
      )
    },

    itemsInfo: async (repo: string, numbers: readonly number[], kind?: "issue" | "mr"): Promise<Map<number, ItemInfo>> => {
      const remote = remoteFor(repo)
      const output = new Map<number, ItemInfo>()
      await Promise.all(
        [...new Set(numbers)].filter((number) => Number.isSafeInteger(number) && number > 0).map(async (number) => {
          const mr = kind === "issue"
            ? ({ status: "rejected" } as const)
            : await request<Json>(remote, `/projects/${projectId(remote)}/merge_requests/${number}`).then((value) => ({ status: "fulfilled" as const, value }), () => ({ status: "rejected" as const }))
          const issue = kind === "mr" || mr.status === "fulfilled"
            ? ({ status: "rejected" } as const)
            : await request<Json>(remote, `/projects/${projectId(remote)}/issues/${number}`).then((value) => ({ status: "fulfilled" as const, value }), () => ({ status: "rejected" as const }))
          const raw = mr.status === "fulfilled" ? mr.value : issue.status === "fulfilled" ? issue.value : null
          if (!raw) return
          const isMr = mr.status === "fulfilled"
          output.set(number, {
            item: isMr ? "mr" : "issue",
            title: raw.title ?? "",
            state: raw.state === "merged" ? "MERGED" : raw.state === "closed" || raw.state === "locked" ? "CLOSED" : "OPEN",
            reason: isMr ? null : deps.reasonOf(remote.path, number) ?? null,
            labels: (raw.labels ?? []).map((label: Json) => (typeof label === "string" ? label : label.name)),
            assignees: (raw.assignees ?? []).map((user: Json) => user.username),
          })
        }),
      )
      return output
    },

    editPeople: async (repo: string, number: number, kind: "labels" | "assignees", add: readonly string[], remove: readonly string[], itemKind?: ItemKind) => {
      const remote = remoteFor(repo)
      await change(repo, number, async () => {
        const path = `/projects/${projectId(remote)}/${itemKind === "issue" ? "issues" : "merge_requests"}/${number}`
        if (kind === "labels") {
          const raw = await request<Json>(remote, path)
          const current: string[] = (raw.labels ?? []).map((label: Json) => (typeof label === "string" ? label : label.name))
          const labels = [...new Set([...current.filter((label) => !remove.includes(label)), ...add])]
          await request(remote, path, { method: "PUT", body: { labels: labelList(labels) } })
        } else {
          const raw = await request<Json>(remote, path)
          const current: number[] = (raw.assignees ?? []).map((user: Json) => Number(user.id))
          const addIds = await userIds(remote, add)
          const removeIds = new Set(await userIds(remote, remove))
          await request(remote, path, { method: "PUT", body: { assignee_ids: [...new Set([...current.filter((id) => !removeIds.has(id)), ...addIds])] } })
        }
      })
    },

    closeItem: async (repo: string, number: number, kind: ItemKind, reason: CloseReason, duplicateOf?: number) => {
      const remote = remoteFor(repo)
      return change(repo, number, async () => {
        const path = `/projects/${projectId(remote)}/${kind === "issue" ? "issues" : "merge_requests"}/${number}`
        // GitLab has no duplicate-of field, so this note is what marks the duplicate; undo has to be able to take it back.
        const duplicate = kind === "issue" && reason === "duplicate" && duplicateOf
          ? await request<Json>(remote, `${path}/notes`, { method: "POST", body: { body: `Duplicate of #${duplicateOf}` } })
          : undefined
        await request(remote, path, { method: "PUT", body: { state_event: "close" } })
        if (kind === "issue") setReason(repo, number, reason)
        return duplicate
          ? { commentId: Number(duplicate.id), url: `${remote.web}/-/issues/${number}#note_${duplicate.id}` }
          : {}
      })
    },

    reopenItem: async (repo: string, number: number, kind: ItemKind) => {
      const remote = remoteFor(repo)
      return change(repo, number, async () => {
        await request(remote, `/projects/${projectId(remote)}/${kind === "issue" ? "issues" : "merge_requests"}/${number}`, { method: "PUT", body: { state_event: "reopen" } })
        if (kind === "issue") setReason(repo, number, undefined)
        return {}
      })
    },

    viewerName: async (repo: string) => {
      const remote = remoteFor(repo)
      return (await viewer(remote)).username
    },

    checkin: async () => {
      const remote = currentRemoteCache.value
      if (!remote) return "No GitLab project selected."
      await viewer(remote)
      return ""
    },
  }

  function setReason(repo: string, number: number, reason: CloseReason | undefined) {
    deps.setReason(repo, number, reason)
  }

  function remoteFor(repo: string): Remote {
    const cached = remoteCache.get(repo)
    if (cached) return cached
    const configured = deps.config.project && deps.config.project === repo
      ? { name: "origin", host: deps.config.host ?? new URL(apiBaseGuess(deps.config)).host, path: repo, owner: repo.split("/").slice(0, -1).join("/"), repo: repo.split("/").pop() ?? "", web: `${apiBaseGuess(deps.config)}/${repo}`, apiBase: apiBaseGuess(deps.config), scheme: "https" }
      : undefined
    if (configured) return configured
    const current = currentRemoteCache.value
    if (current && current.path === repo) return current
    // Todos can name another project on the same GitLab host; the API address is the same instance.
    if (current && /^[\w.-]+(?:\/[\w.-]+)+$/.test(repo)) {
      const owner = repo.split("/").slice(0, -1).join("/")
      return { ...current, path: repo, owner, repo: repo.split("/").pop() ?? "", web: `${apiBaseGuess({ apiBase: current.apiBase })}/${repo}` }
    }
    throw new Error(`No GitLab remote is known for ${repo}. Open the panel in that repository first.`)
  }

  function rememberRemote(remote: Remote) {
    currentRemoteCache.value = remote
    remoteCache.set(remote.path, remote)
  }

  /**
   * GitLab assigns by user id, so every name has to resolve. One that resolves to nobody is an error, not a dropped
   * entry: silently writing back the ids that did resolve reports a change that was never made.
   */
  async function userIds(remote: Remote, names: readonly string[]): Promise<number[]> {
    const me = names.includes("@me") ? await viewer(remote) : null
    const members = await allPages<Json>(remote, `/projects/${projectId(remote)}/members/all`).then(
      (list) => list as Json[] | undefined,
      () => undefined,
    )
    const ids: number[] = []
    for (const name of names) {
      if (name === "@me") {
        if (!me) throw new Error("Could not read the signed-in GitLab user.")
        ids.push(me.id)
        continue
      }
      const wanted = name.replace(/^@/, "").toLowerCase()
      const member = members?.find((entry) => String(entry.username).toLowerCase() === wanted)
      if (member) {
        ids.push(Number(member.id))
        continue
      }
      const user = (await allPages<Json>(remote, "/users", { username: wanted }).catch(() => [])).find(
        (entry) => String(entry.username).toLowerCase() === wanted,
      )
      if (!user) throw new Error(`GitLab has no user "@${wanted}".`)
      // The member list could be read and this name is not in it, so GitLab would refuse the write anyway.
      if (members) throw new Error(`"@${wanted}" is not a member of this project, so it cannot be assigned.`)
      ids.push(Number(user.id))
    }
    return ids
  }

  async function milestoneId(remote: Remote, title: string) {
    const list = await allPages<Json>(remote, `/projects/${projectId(remote)}/milestones`, { search: title }).catch(() => [])
    const found = list.find((entry) => entry.title === title)
    if (!found) throw new Error(`This project has no milestone "${title}".`)
    return Number(found.id)
  }

  async function change<T>(repo: string, number: number, work: () => Promise<T>): Promise<T> {
    const key = `${repo}#${number}`
    const queued = writes.get(key) ?? Promise.resolve()
    // `edit` reads an item's labels and assignees before writing them back, so two edits running together would each
    // overwrite what the other had just set. The queued promise never rejects, so a failure does not stall the next.
    const next = queued.then(work, work)
    keep(writes, key, next.catch(() => undefined), 100)
    try {
      return await next
    } finally {
      filesCache.forEach((_, entry) => { if (entry.includes(`/${repo}!${number}@`)) filesCache.delete(entry) })
      threadsCache.forEach((_, entry) => { if (entry.includes(`/${repo}!${number}@`)) threadsCache.delete(entry) })
      // `finishedCache` and `logsCache` are keyed by pipeline and job id, which share no space with an item iid;
      // rerun and retry own their eviction.
      deps.itemChanged(repo, number)
    }
  }
}

export interface ItemInfo {
  item: "issue" | "mr"
  title: string
  state: "OPEN" | "CLOSED" | "MERGED"
  reason: CloseReason | null
  labels: string[]
  assignees: string[]
}

function toRun(remote: Remote, raw: Json): Run {
  return {
    id: Number(raw.id),
    title: raw.name ?? raw.ref ?? `Pipeline ${raw.id}`,
    workflow: raw.name ?? "Pipeline",
    status: String(raw.status ?? "unknown"),
    conclusion: String(raw.status ?? ""),
    branch: raw.ref ?? "",
    event: raw.source ?? "push",
    sha: raw.sha ?? "",
    created: raw.created_at ?? "",
    url: raw.web_url ?? `${remote.web}/-/pipelines/${raw.id}`,
    attempt: 1,
  }
}

function toJob(remote: Remote, raw: Json): Job {
  return {
    id: Number(raw.id),
    name: raw.name ?? "",
    status: String(raw.status ?? ""),
    conclusion: String(raw.status ?? ""),
    started: raw.started_at ?? null,
    completed: raw.finished_at ?? null,
    steps: [],
    stage: raw.stage ?? "",
    allowFailure: !!raw.allow_failure,
    webUrl: raw.web_url ?? `${remote.web}/-/jobs/${raw.id}`,
  }
}

function emptyInbox(): Inbox {
  return { error: null, notifications: [], reviews: [], assigned: [], authored: [] }
}

function apiBaseOf(remote: Remote) {
  const base = (remote.apiBase || `https://${remote.host}`).replace(/\/$/, "")
  return base.endsWith("/api/v4") ? base : `${base}/api/v4`
}

function apiBaseGuess(config: { apiBase?: string; host?: string }) {
  return (config.apiBase || `https://${config.host ?? "gitlab.com"}`).replace(/\/$/, "").replace(/\/api\/v4$/, "")
}

function gitlabError(path: string, status: number, statusText: string, text: string, retryAfter?: number) {
  let detail = text
  try {
    const parsed = JSON.parse(text) as { message?: unknown; error?: unknown }
    detail = typeof parsed.message === "string" ? parsed.message : typeof parsed.error === "string" ? parsed.error : text
  } catch {
    // Plain text error.
  }
  if (status === 401) return "GitLab rejected the token. Set GITLAB_TOKEN (a personal access token with api scope) or run `glab auth login`."
  if (status === 404) return `GitLab: ${detail.slice(0, 500) || statusText} (HTTP 404)`
  // `backoff` reads the wait out of this text, so a throttled write waits what GitLab asked for.
  return `GitLab: ${detail.slice(0, 500) || statusText} (HTTP ${status})${retryAfter === undefined ? "" : ` retry-after: ${retryAfter}`}`
}

/** Seconds a throttled response asks for, from Retry-After or GitLab's RateLimit-Reset. */
function retryAfterOf(headers: Headers): number | undefined {
  const after = headers.get("retry-after")
  if (after) {
    const seconds = Number(after)
    if (Number.isFinite(seconds) && seconds > 0) return Math.ceil(seconds)
    const at = Date.parse(after)
    if (Number.isFinite(at)) return Math.max(1, Math.ceil((at - Date.now()) / 1000))
  }
  const reset = Number(headers.get("ratelimit-reset"))
  if (Number.isFinite(reset) && reset > 0) return Math.max(1, Math.ceil(reset - Date.now() / 1000))
  return undefined
}

/** The token `glab auth login` stored for a host, from the CLI's YAML config. */
async function readGlabToken(host?: string): Promise<string | null> {
  const paths = [
    process.env.GLAB_CONFIG_DIR ? join(process.env.GLAB_CONFIG_DIR, "config.yml") : "",
    process.env.APPDATA ? join(process.env.APPDATA, "glab-cli", "config.yml") : "",
    process.env.XDG_CONFIG_HOME ? join(process.env.XDG_CONFIG_HOME, "glab-cli", "config.yml") : "",
    join(homedir(), ".config", "glab-cli", "config.yml"),
    join(homedir(), ".config", "glab-cli", "config.yaml"),
  ].filter(Boolean)
  for (const path of paths) {
    const text = await readFile(path, "utf8").catch(() => undefined)
    if (!text) continue
    const token = parseGlabToken(text, host)
    if (token) return token
  }
  return null
}

function parseGlabToken(text: string, host?: string) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n")
  let hosts = false
  let hostIndent = -1
  let currentHost = ""
  let token: string | null = null
  let currentIndent = -1
  const flush = () => {
    if (token && (!host || currentHost === host || currentHost.startsWith(`${host}:`))) return token
    token = null
  }
  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith("#")) continue
    const indent = line.length - line.trimStart().length
    if (/^\s*hosts:\s*$/.test(line)) {
      hosts = true
      hostIndent = indent
      continue
    }
    if (!hosts) continue
    if (indent <= hostIndent && /^\S/.test(line)) {
      const found = flush()
      if (found) return found
      hosts = false
      continue
    }
    const hostMatch = /^\s{2,}["']?([^"':]+)["']?:\s*$/.exec(line)
    if (hostMatch && indent <= hostIndent + 2) {
      const found = flush()
      if (found) return found
      currentHost = hostMatch[1]?.trim() ?? ""
      currentIndent = indent
      continue
    }
    const tokenMatch = /^\s+token:\s*["']?([^"'\s#]+)/.exec(line)
    if (tokenMatch && currentHost) token = tokenMatch[1] ?? null
  }
  return flush()
}

function message(reason: unknown) {
  return reason instanceof Error ? reason.message : String(reason)
}
