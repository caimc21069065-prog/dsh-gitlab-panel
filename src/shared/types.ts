// Shared wire types for the host API and the browser panel. No runtime imports here.

export interface FileChange {
  path: string
  origPath: string | null
  index: string
  worktree: string
  conflicted: boolean
  untracked: boolean
}

export interface Remote {
  name: string
  /** Host of the GitLab instance, such as gitlab.com. */
  host: string
  /** Namespace path including subgroups, such as group/subgroup/project. */
  path: string
  owner: string
  repo: string
  web: string
  apiBase: string
  scheme: string
}

export type Operation = "merge" | "rebase" | "am" | "cherry-pick" | "revert" | null

export interface Overview {
  root: string
  name: string
  branch: string | null
  head: string | null
  upstream: string | null
  ahead: number
  behind: number
  remote: Remote | null
  defaultBranch: string | null
  operation: Operation
  stashes: number
  files: FileChange[]
  /** Why GitLab data cannot be read (no token, no glab, network). Git data still works. */
  gitlab: string | null
}

export interface Ref {
  name: string
  kind: "head" | "local" | "remote" | "tag"
}

export interface Commit {
  hash: string
  parents: string[]
  author: string
  email: string
  date: number
  subject: string
  refs: Ref[]
}

export interface CommitDetails {
  hash: string
  author: string
  email: string
  date: number
  body: string
  files: { status: string; path: string }[]
}

export interface Branch {
  name: string
  remote: boolean
  current: boolean
  upstream: string | null
  ahead: number
  behind: number
  gone: boolean
  sha: string
  date: number
  subject: string
  worktree?: string
}

export type ItemState = "OPEN" | "CLOSED" | "MERGED"
export type ItemKind = "issue" | "mr"
export type CloseReason = "completed" | "not_planned" | "duplicate"
export type CheckState = "success" | "failure" | "pending" | "none"

export interface Label {
  name: string
  color: string
  description?: string
}

/** A merge request row: the panel's equivalent of a pull request. */
export interface MergeRequest {
  number: number
  title: string
  state: ItemState
  draft: boolean
  url: string
  head: string
  /** The source project differs from the target project (a fork). */
  cross: boolean
  base: string
  author: string
  review: string | null
  checks: CheckState
  updated: string
  sha?: string
  sourceProject?: string
  targetProject?: string
}

export interface MergeRequests {
  error: string | null
  items: MergeRequest[]
}

export interface Issue {
  number: number
  title: string
  state: "OPEN" | "CLOSED"
  url: string
  author: string
  labels: Label[]
  assignees: string[]
  updated: string
}

export interface Issues {
  error: string | null
  items: Issue[]
}

export interface ItemRef {
  repo: string
  number: number
}

export interface Comment {
  id?: number
  author: string
  body: string
  created: string
  system?: boolean
}

export interface Check {
  name: string
  state: "success" | "failure" | "pending" | "skipped"
  url: string | null
  id?: number
}

export interface Item {
  kind: "issue" | "mr"
  repo: string
  number: number
  title: string
  state: ItemState
  reason?: CloseReason
  draft: boolean
  url: string
  author: string
  body: string
  labels: Label[]
  assignees: string[]
  milestone: string | null
  created: string
  updated: string
  comments: Comment[]
  pr: {
    head: string
    sha: string
    requested: string[]
    base: string
    cross: boolean
    additions: number
    deletions: number
    files: number
    review: string | null
    mergeable: string
    checks: Check[]
    approvedBy?: string[]
    targetProject?: string
    sourceProject?: string
    mergeStatus?: string
  } | null
  links?: ItemRef[]
}

export interface ChangedFile {
  path: string
  previous: string | null
  status: string
  additions: number
  deletions: number
  patch: string | null
}

export interface ThreadComment {
  id: string
  author: string
  body: string
  created: string
  hunk: string
}

export interface Thread {
  id: string
  resolved: boolean
  outdated: boolean
  path: string
  line: number | null
  side: string
  comments: ThreadComment[]
}

export interface Review {
  id: string
  author: string
  state: string
  body: string
  submitted: string | null
}

export interface Reviews {
  reviews: Review[]
  threads: Thread[]
  mine: boolean
}

export interface RemoteCommit {
  repo: string
  sha: string
  message: string
  author: string
  date: string
  url: string
  parents: string[]
  files: ChangedFile[]
}

export interface Run {
  id: number
  title: string
  workflow: string
  status: string
  conclusion: string
  branch: string
  event: string
  sha: string
  created: string
  url: string
  attempt: number
}

export interface Step {
  number: number
  name: string
  status: string
  conclusion: string
}

export interface Job {
  id: number
  name: string
  status: string
  conclusion: string
  started: string | null
  completed: string | null
  steps: Step[]
  stage?: string
  allowFailure?: boolean
  webUrl?: string
}

export interface RunDetails {
  run: Run
  jobs: Job[]
}

export interface RepoMeta {
  labels: Label[]
  people: string[]
  milestones: string[]
}

export interface InboxEntry {
  thread: number | null
  repo: string
  number: number | null
  kind: "issue" | "mr" | "other"
  title: string
  reason: string
  updated: string
  unread: boolean
  url: string
}

export interface Inbox {
  error: string | null
  notifications: InboxEntry[]
  reviews: InboxEntry[]
  assigned: InboxEntry[]
  authored: InboxEntry[]
}

export interface SearchItem {
  kind: "issue" | "mr"
  repo: string
  number: number
  title: string
  state: ItemState
  reason?: CloseReason
  draft: boolean
  url: string
  author: string
  labels: Label[]
  comments: number
  created: string
  updated: string
  head: string | null
  base: string | null
  review: string | null
  checks: CheckState
  assignees?: string[]
}

export interface SearchPage {
  total: number
  items: SearchItem[]
  cursor: string | null
}

export type AgentKind = "comment" | "close" | "reopen" | "label" | "assign" | "uncomment" | "approve" | "unapprove" | "other"
export type AgentStatus = "proposed" | "approved" | "running" | "done" | "failed" | "skipped" | "undone"

export interface AgentPayload {
  body?: string
  reason?: CloseReason
  duplicateOf?: number
  add?: string[]
  remove?: string[]
  commentId?: number
  command?: string
}

export interface AgentResult {
  commentId?: number
  url?: string
  reason?: CloseReason
  added?: string[]
  removed?: string[]
  noop?: boolean
}

export interface AgentAction {
  id: string
  sessionID: string
  batch: string
  repo: string
  number: number
  item: "issue" | "mr" | null
  title: string
  kind: AgentKind
  payload: AgentPayload
  note: string
  status: AgentStatus
  error: string | null
  result: AgentResult | null
  source: "tool" | "shell" | "user"
  undoOf: string | null
  undoneBy: string | null
  edited?: boolean
  original?: AgentPayload
  round?: number
  createdAt: number
  updatedAt: number
}

export interface SavedReply {
  name: string
  body: string
}

export interface TriageStart {
  repo: string
  kind: "issue" | "mr"
  query: string | null
  numbers: number[]
  rules: string
  replies: SavedReply[]
  batch: number
  total: number
}

export interface AgentTriage extends TriageStart {
  round: number
  reviewed: number[]
  checkedAt: number
  createdAt: number
}

export interface AgentQueue {
  auto: boolean
  actions: AgentAction[]
  triage?: AgentTriage
}

export type ReviewEvent = "COMMENT" | "APPROVE" | "REQUEST_CHANGES"
export type DiffSide = "LEFT" | "RIGHT"

export interface DraftComment {
  id: string
  path: string
  line: number
  side: DiffSide
  startLine: number | null
  body: string
  source: "agent" | "user"
  edited: boolean
}

export interface DraftReview {
  sessionID: string
  repo: string
  number: number
  sha: string
  summary: string
  event: ReviewEvent
  note: string
  source: "agent" | "user"
  comments: DraftComment[]
  createdAt: number
  updatedAt: number
}

export interface PrDefaults {
  title: string
  body: string
  template?: string
}

export interface JobLog {
  text: string
}

/** Events the host streams to the browser. */
export type HostEvent =
  | { type: "changed"; cwd: string; remote?: boolean }
  | { type: "item"; repo: string; number: number; state?: ItemState; reason?: CloseReason }
  | { type: "run"; repo: string; id: number }
  | { type: "inbox" }
  | { type: "agent"; sessionID: string }
  | { type: "review"; repo: string; number: number }

export interface ApiRequest {
  method: string
  params: Record<string, unknown>
  sessionID?: string
}

export interface ApiResponse<T = unknown> {
  ok: boolean
  value?: T
  error?: string
}

export const MAX_BATCH = 100
export const MAX_BODY = 65_536
