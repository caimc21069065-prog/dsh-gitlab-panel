import { useCallback, useSyncExternalStore } from "react"
import { QueryClient, useInfiniteQuery, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query"
import { t } from "./i18n"
import type { AgentQueue, Branch, Commit, CommitDetails, DraftReview, Inbox, Item, ItemKind, MergeRequests, Overview, PrDefaults, RepoMeta, Reviews, Run, RunDetails, SearchPage, ChangedFile } from "../shared/types"

type Ctx = any

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 15_000, gcTime: 10 * 60_000, retry: 1, refetchOnWindowFocus: false },
  },
})

const plugin: { ctx?: Ctx } = {}
export function setPluginCtx(ctx: Ctx) {
  plugin.ctx = ctx
}
export function pluginCtx(): Ctx {
  if (!plugin.ctx) throw new Error("The GitLab panel is not ready.")
  return plugin.ctx
}

function url(path: string) {
  return new URL(path, document.baseURI).toString()
}

export async function rpc<T = unknown>(method: string, params: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch(url("gitlab-panel/api"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ method, params }),
  })
  const text = await response.text()
  let parsed: { ok?: boolean; value?: T; error?: string } = {}
  try {
    parsed = text ? JSON.parse(text) : {}
  } catch {
    throw new Error(`The GitLab panel returned invalid JSON (HTTP ${response.status}).`)
  }
  if (!response.ok) throw new Error(parsed.error || `Request failed (HTTP ${response.status}).`)
  if (parsed.ok !== true) throw new Error(parsed.error || "The GitLab panel request failed.")
  return parsed.value as T
}

export const api = {
  overview: (cwd: string) => rpc<Overview | null>("overview", { cwd }),
  branches: (cwd: string) => rpc<Branch[]>("branches", { cwd }),
  log: (cwd: string, scope: "current" | "local" | "all", limit: number) => rpc<Commit[]>("log", { cwd, scope, limit }),
  show: (cwd: string, hash: string) => rpc<CommitDetails>("show", { cwd, hash }),
  diff: (cwd: string, path: string, staged: boolean, untracked: boolean) => rpc<string>("diff", { cwd, path, staged, untracked }),
  mrs: (cwd: string, fresh = false) => rpc<MergeRequests>("mrs", { cwd, fresh }),
  branchMrs: (cwd: string, names: string[]) => rpc<MergeRequests>("branchMrs", { cwd, names, fresh: false }),
  mergedBranches: (cwd: string) => rpc<string[]>("mergedBranches", { cwd }),
  outgoing: (cwd: string) => rpc<{ unpushed: Commit[]; base: string | null; ahead: number }>("outgoing", { cwd }),
  search: (repo: string, kind: ItemKind, query: string, cursor: string | null) => rpc<SearchPage>("search", { repo, kind, query, cursor }),
  item: (repo: string, number: number, kind?: ItemKind) => rpc<Item>("item", { repo, number, kind }),
  files: (repo: string, number: number, head?: string) => rpc<ChangedFile[]>("files", { repo, number, head }),
  reviews: (repo: string, number: number) => rpc<Reviews>("reviews", { repo, number }),
  meta: (repo: string) => rpc<RepoMeta>("repoMeta", { repo }),
  inbox: (fresh = false) => rpc<Inbox>("inbox", { fresh }),
  agent: (sessionID: string) => rpc<AgentQueue>("agentActions", { sessionID, repo: null }),
  runs: (repo: string, branch: string | null) => rpc<Run[]>("runs", { repo, branch, fresh: false }),
  run: (repo: string, id: number) => rpc<RunDetails>("run", { repo, id }),
  jobLog: (repo: string, job: number) => rpc<string>("jobLog", { repo, job }),
  remoteCommit: (repo: string, sha: string) => rpc("remoteCommit", { repo, sha }),
  mrDefaults: (cwd: string, base: string) => rpc<PrDefaults>("mrDefaults", { cwd, base }),
  drafts: (repo: string, number: number, sessionID: string | null) => rpc<DraftReview[]>("reviewDrafts", { repo, number, sessionID }),
}

export const keys = {
  overview: (cwd: string) => ["overview", cwd] as const,
  branches: (cwd: string) => ["branches", cwd] as const,
  log: (cwd: string, scope: string) => ["log", cwd, scope] as const,
  show: (cwd: string, hash: string) => ["show", cwd, hash] as const,
  diff: (cwd: string, path: string, staged: boolean, untracked: boolean) => ["diff", cwd, path, staged, untracked] as const,
  outgoing: (cwd: string) => ["outgoing", cwd] as const,
  merged: (cwd: string) => ["merged", cwd] as const,
  mrs: (cwd: string) => ["mrs", cwd] as const,
  item: (repo: string, number: number, kind: string) => ["item", repo, number, kind] as const,
  files: (repo: string, number: number, head: string) => ["files", repo, number, head] as const,
  reviews: (repo: string, number: number) => ["reviews", repo, number] as const,
  search: (repo: string, kind: string, query: string) => ["search", repo, kind, query] as const,
  meta: (repo: string) => ["meta", repo] as const,
  inbox: () => ["inbox"] as const,
  agent: (sessionID: string) => ["agent", sessionID] as const,
  runs: (repo: string, branch: string | null) => ["runs", repo, branch ?? ""] as const,
  run: (repo: string, id: number) => ["run", repo, id] as const,
  job: (repo: string, job: number) => ["job", repo, job] as const,
  drafts: (repo: string, number: number, sessionID: string) => ["drafts", repo, number, sessionID] as const,
}

export function useOverview(cwd: string, options: { poll?: number; enabled?: boolean } = {}) {
  return useQuery({
    queryKey: keys.overview(cwd),
    queryFn: () => api.overview(cwd),
    enabled: !!cwd && (options.enabled ?? true),
    staleTime: 2_000,
    refetchInterval: options.poll ?? false,
  })
}

export function useBranches(cwd: string, enabled = true) {
  return useQuery({ queryKey: keys.branches(cwd), queryFn: () => api.branches(cwd), enabled: !!cwd && enabled, staleTime: 5_000 })
}

export function useLog(cwd: string, scope: "current" | "local" | "all", limit = 200) {
  return useQuery({ queryKey: keys.log(cwd, scope), queryFn: () => api.log(cwd, scope, limit), enabled: !!cwd, staleTime: 5_000 })
}

export function useCommit(cwd: string, hash: string | undefined) {
  return useQuery({ queryKey: keys.show(cwd, hash ?? ""), queryFn: () => api.show(cwd, hash ?? ""), enabled: !!cwd && !!hash, staleTime: Infinity })
}

export function useDiff(cwd: string, path: string, staged: boolean, untracked: boolean, enabled = true) {
  return useQuery({ queryKey: keys.diff(cwd, path, staged, untracked), queryFn: () => api.diff(cwd, path, staged, untracked), enabled: !!cwd && enabled, staleTime: 2_000 })
}

export function useMrs(cwd: string, enabled = true) {
  return useQuery({ queryKey: keys.mrs(cwd), queryFn: () => api.mrs(cwd, queryClient.getQueryData(keys.mrs(cwd)) !== undefined), enabled: !!cwd && enabled, staleTime: 60_000 })
}

export function useItem(repo: string, number: number, kind: ItemKind, enabled = true) {
  return useQuery({ queryKey: keys.item(repo, number, kind), queryFn: () => api.item(repo, number, kind), enabled: enabled && !!repo && number > 0, staleTime: 30_000 })
}

export function useFiles(repo: string, number: number, head: string | undefined) {
  return useQuery({ queryKey: keys.files(repo, number, head ?? ""), queryFn: () => api.files(repo, number, head), enabled: !!repo && !!number && !!head, staleTime: Infinity })
}

export function useReviews(repo: string, number: number, enabled = true) {
  return useQuery({ queryKey: keys.reviews(repo, number), queryFn: () => api.reviews(repo, number), enabled: enabled && !!repo && number > 0, staleTime: 15_000 })
}

export function useSearch(repo: string, kind: ItemKind, query: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: keys.search(repo, kind, query),
    queryFn: ({ pageParam }) => api.search(repo, kind, query, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (page: SearchPage) => page.cursor,
    enabled: enabled && !!repo,
    staleTime: 60_000,
  })
}

export function useMeta(repo: string, enabled = true) {
  return useQuery({ queryKey: keys.meta(repo), queryFn: () => api.meta(repo), enabled: enabled && !!repo, staleTime: 5 * 60_000 })
}

export function useInbox(enabled = true, poll = 120_000) {
  return useQuery({ queryKey: keys.inbox(), queryFn: () => api.inbox(queryClient.getQueryData(keys.inbox()) !== undefined), enabled, staleTime: 60_000, refetchInterval: poll })
}

export function useAgent(sessionID: string) {
  return useQuery({
    queryKey: keys.agent(sessionID),
    queryFn: () => api.agent(sessionID),
    enabled: !!sessionID,
    staleTime: 10_000,
    refetchInterval: (query) => {
      const data = query.state.data as AgentQueue | undefined
      return data?.actions.some((action) => action.status === "approved" || action.status === "running") ? 3_000 : false
    },
  })
}

export function useRuns(repo: string, branch: string | null, enabled = true) {
  return useQuery({ queryKey: keys.runs(repo, branch), queryFn: () => api.runs(repo, branch), enabled: enabled && !!repo, staleTime: 15_000 })
}

export function useRun(repo: string, id: number, enabled = true) {
  return useQuery({ queryKey: keys.run(repo, id), queryFn: () => api.run(repo, id), enabled: enabled && !!repo && id > 0, staleTime: 5_000, refetchInterval: (query) => (query.state.data?.run.status === "running" ? 5_000 : false) })
}

export function useJobLog(repo: string, job: number, done: boolean, enabled = true) {
  return useQuery({ queryKey: keys.job(repo, job), queryFn: () => api.jobLog(repo, job), enabled: enabled && job > 0, staleTime: done ? Infinity : 5_000 })
}

export function useDrafts(repo: string, number: number, sessionID: string, enabled = true) {
  return useQuery({ queryKey: keys.drafts(repo, number, sessionID), queryFn: () => api.drafts(repo, number, sessionID), enabled: enabled && !!repo && number > 0, staleTime: 5_000 })
}

/** The session's checkout, from the slot props' standard session hooks. */
export function useCwd(props: any): string {
  const hook = props?.useSessions ?? (() => undefined)
  const selected = hook((state: any) => state?.byId?.[props?.sessionId]?.cwd) as string | undefined
  const session = props?.session
  return selected || session?.cwd || session?.directory || session?.header?.cwd || ""
}

export function useSessionId(props: any): string {
  return String(props?.sessionId ?? props?.session?.sessionId ?? "")
}

// Events.

let events: EventSource | undefined

export function startEvents() {
  if (events) return
  events = new EventSource(url("gitlab-panel/events"))
  events.addEventListener("message", (message) => {
    let event: any
    try {
      event = JSON.parse((message as MessageEvent).data)
    } catch {
      return
    }
    if (event.type === "hello") {
      void queryClient.invalidateQueries()
      return
    }
    if (event.type === "changed") {
      void queryClient.invalidateQueries({ queryKey: ["overview", event.cwd] })
      void queryClient.invalidateQueries({ queryKey: ["branches", event.cwd] })
      void queryClient.invalidateQueries({ queryKey: ["log", event.cwd] })
      void queryClient.invalidateQueries({ queryKey: ["outgoing", event.cwd] })
      void queryClient.invalidateQueries({ queryKey: ["mrs", event.cwd] })
      if (event.remote) {
        void queryClient.invalidateQueries({ queryKey: ["runs"] })
        void queryClient.invalidateQueries({ queryKey: ["search"] })
      }
      return
    }
    if (event.type === "item") {
      void queryClient.invalidateQueries({ queryKey: ["item", event.repo, event.number] })
      void queryClient.invalidateQueries({ queryKey: ["search"] })
      void queryClient.invalidateQueries({ queryKey: ["mrs"] })
      void queryClient.invalidateQueries({ queryKey: ["reviews", event.repo, event.number] })
      void queryClient.invalidateQueries({ queryKey: ["inbox"] })
      return
    }
    if (event.type === "run") {
      void queryClient.invalidateQueries({ queryKey: ["runs", event.repo] })
      void queryClient.invalidateQueries({ queryKey: ["run", event.repo, event.id] })
      return
    }
    if (event.type === "inbox") {
      void queryClient.invalidateQueries({ queryKey: ["inbox"] })
      return
    }
    if (event.type === "agent") {
      void queryClient.invalidateQueries({ queryKey: ["agent", event.sessionID] })
      return
    }
    if (event.type === "review") {
      void queryClient.invalidateQueries({ queryKey: ["drafts", event.repo, event.number] })
    }
  })
}

export function stopEvents() {
  events?.close()
  events = undefined
}

// Preferences, per browser.

export interface SavedSearch {
  id: string
  repo: string
  kind: ItemKind
  name: string
  query: string
}

export interface SavedReply {
  id: string
  repo: string
  name: string
  body: string
}

export interface Prefs {
  view: "changes" | "history" | "mrs" | "issues"
  graphScope: "current" | "local" | "all"
  compactRows: boolean
  foldItems: boolean
  headerChip: boolean
  prDraft: boolean
  seen: Record<string, number>
  savedSearches: SavedSearch[]
  savedReplies: SavedReply[]
  listSort: Record<string, string>
  triageRules: Record<string, string>
  issueBranches: Record<string, number>
}

const PREFS_KEY = "dsh-gitlab-panel.prefs"
const DEFAULT_PREFS: Prefs = {
  view: "changes",
  graphScope: "local",
  compactRows: false,
  foldItems: true,
  headerChip: true,
  prDraft: false,
  seen: {},
  savedSearches: [],
  savedReplies: [],
  listSort: {},
  triageRules: {},
  issueBranches: {},
}

function readPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    return raw ? { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<Prefs>) } : DEFAULT_PREFS
  } catch {
    return DEFAULT_PREFS
  }
}

let prefs = readPrefs()
const prefsListeners = new Set<() => void>()

export function getPrefs() {
  return prefs
}

export function updatePrefs(change: (draft: Prefs) => void) {
  const next = structuredClone(prefs)
  change(next)
  prefs = next
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  } catch {
    // Ignore storage quota or privacy errors.
  }
  prefsListeners.forEach((listener) => listener())
}

export function usePrefs(): [Prefs, (change: (draft: Prefs) => void) => void] {
  const snapshot = useSyncExternalStore(
    (listener) => {
      prefsListeners.add(listener)
      return () => prefsListeners.delete(listener)
    },
    () => prefs,
    () => prefs,
  )
  return [snapshot, updatePrefs]
}

export function rememberSeen(repo: string, kind: ItemKind) {
  updatePrefs((draft) => {
    draft.seen[`${repo}:${kind}`] = Date.now()
  })
}

// Toasts.

export interface Toast {
  id: number
  tone: "info" | "success" | "error"
  title: string
  description?: string
  action?: { label: string; run: () => void }
}

let toasts: Toast[] = []
let toastId = 0
const toastListeners = new Set<() => void>()

export function toast(input: Omit<Toast, "id"> & { duration?: number }) {
  const entry: Toast = { id: ++toastId, ...input }
  toasts = [...toasts.slice(-3), entry]
  toastListeners.forEach((listener) => listener())
  const duration = input.duration ?? (input.tone === "error" ? 10_000 : 5_000)
  setTimeout(() => dismissToast(entry.id), duration)
}

export function dismissToast(id: number) {
  toasts = toasts.filter((entry) => entry.id !== id)
  toastListeners.forEach((listener) => listener())
}

export function useToasts() {
  return useSyncExternalStore(
    (listener) => {
      toastListeners.add(listener)
      return () => toastListeners.delete(listener)
    },
    () => toasts,
    () => toasts,
  )
}

export function errorText(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

export function useInvalidate() {
  const client = useQueryClient()
  return useCallback((key?: QueryKey) => (key ? client.invalidateQueries({ queryKey: key }) : client.invalidateQueries()), [client])
}

// Session helpers.

export interface StartSessionInput {
  cwd: string
  prompt: string
  open?: boolean
  /**
   * Runs once the session exists but before its first prompt is sent. Metadata that the agent's own first proposals
   * are stamped with has to be in place by then, or those proposals are recorded without it.
   */
  before?: (sessionID: string) => Promise<void>
}

export async function startAgentSession(input: StartSessionInput): Promise<string> {
  const session = sessionRemote()
  const created = await session.create({ cwd: input.cwd })
  if (!created?.ok) throw new Error(created?.error?.message ?? "Could not create the session.")
  const sessionID = created.value.sessionId
  if (input.before) await input.before(sessionID)
  const sent = await session.prompt({
    requestId: crypto.randomUUID(),
    sessionId: sessionID,
    mode: "queue",
    content: [{ type: "text", text: input.prompt }],
    clientTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })
  if (!sent?.ok) throw new Error(sent?.error?.message ?? "Could not send the first prompt.")
  if (input.open !== false) openSession(sessionID)
  return sessionID
}

export async function openSessionAt(cwd: string): Promise<string> {
  const session = sessionRemote()
  const created = await session.create({ cwd })
  if (!created?.ok) throw new Error(created?.error?.message ?? "Could not create the session.")
  openSession(created.value.sessionId)
  return created.value.sessionId
}

/** `ctx.remote.session` is a flat generated namespace: `remote.session.create`, never `remote.session.session.create`. */
function sessionRemote(): any {
  const remote = pluginCtx().remote?.session
  if (!remote?.create || !remote?.prompt) throw new Error("This DeepSeek Harness build cannot create sessions from a plugin.")
  return remote
}

function openSession(sessionID: string) {
  try {
    pluginCtx().uiWorkspace?.openSession?.(sessionID)
  } catch {
    // The session exists even when navigation is unavailable.
  }
}

/** The session's composer face, when the session is retained and its conversation scope is live. */
function composerOf(sessionID: string): any {
  try {
    const scope = pluginCtx().sessions?.scope?.(sessionID)
    if (!scope) return undefined
    return scope.get?.("conversation")?.input?.for(scope)
  } catch {
    // `input.for` throws for a scope the conversation layer has not retained.
    return undefined
  }
}

export async function sendToChat(sessionID: string, text: string): Promise<boolean> {
  const scope = pluginCtx().sessions?.scope?.(sessionID)
  const conversation = scope?.get?.("conversation")
  if (conversation?.send) {
    try {
      await conversation.send(text)
      return true
    } catch {
      return false
    }
  }
  try {
    const sent = await sessionRemote().prompt({
      requestId: crypto.randomUUID(),
      sessionId: sessionID,
      mode: "queue",
      content: [{ type: "text", text }],
    })
    return !!sent?.ok
  } catch {
    return false
  }
}

/** Quotes into the composer so the user still edits it before sending, as the panel's Add to chat does. */
function quoteIntoComposer(sessionID: string, text: string): boolean {
  const composer = composerOf(sessionID)
  if (!composer?.insertQuote) return false
  try {
    if (composer.insertQuote(text) !== true) return false
    composer.focus?.()
    return true
  } catch {
    return false
  }
}

export async function quoteToChat(sessionID: string, cwd: string, text: string) {
  if (quoteIntoComposer(sessionID, text) || (await sendToChat(sessionID, text))) {
    toast({ tone: "success", title: t("Added to chat") })
    return
  }
  await startAgentSession({ cwd, prompt: text })
}

