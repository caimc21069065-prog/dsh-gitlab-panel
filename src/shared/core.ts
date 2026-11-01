import type { Branch, CheckState, CloseReason, Commit, FileChange, ItemKind, Ref, Remote } from "./types"

export const FIELD = "\x1f"
export const RECORD = "\x1e"
export const LOG_FORMAT = ["%H", "%P", "%an", "%ae", "%at", "%s", "%D"].join("%x1f") + "%x1e"
export const BRANCH_FORMAT = [
  "%(refname)",
  "%(objectname:short)",
  "%(upstream:short)",
  "%(upstream:track,nobracket)",
  "%(committerdate:unix)",
  "%(contents:subject)",
  "%(HEAD)",
].join("%1f")

export interface StatusBranch {
  head: string | null
  branch: string | null
  upstream: string | null
  ahead: number
  behind: number
}

export function parseStatus(output: string) {
  const tokens = output.split("\0")
  const branch: StatusBranch = { head: null, branch: null, upstream: null, ahead: 0, behind: 0 }
  const files: FileChange[] = []
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (!token) continue
    if (token.startsWith("# ")) {
      const [key, ...rest] = token.slice(2).split(" ")
      const value = rest.join(" ")
      if (key === "branch.oid") branch.head = value === "(initial)" ? null : value
      if (key === "branch.head") branch.branch = value === "(detached)" ? null : value
      if (key === "branch.upstream") branch.upstream = value
      if (key === "branch.ab") {
        const match = /^\+(\d+) -(\d+)$/.exec(value)
        branch.ahead = Number(match?.[1] ?? 0)
        branch.behind = Number(match?.[2] ?? 0)
      }
      continue
    }
    const kind = token[0]
    if (kind === "?") {
      files.push(change(token.slice(2), null, ".", "?", false, true))
      continue
    }
    if (kind === "1") {
      const parts = token.split(" ")
      const xy = parts[1] ?? ".."
      files.push(change(parts.slice(8).join(" "), null, xy[0] ?? ".", xy[1] ?? ".", false, false))
      continue
    }
    if (kind === "2") {
      const parts = token.split(" ")
      const xy = parts[1] ?? ".."
      const orig = tokens[i + 1] ?? null
      i++
      files.push(change(parts.slice(9).join(" "), orig, xy[0] ?? ".", xy[1] ?? ".", false, false))
      continue
    }
    if (kind === "u") {
      const parts = token.split(" ")
      const xy = parts[1] ?? "UU"
      files.push(change(parts.slice(10).join(" "), null, xy[0] ?? "U", xy[1] ?? "U", true, false))
    }
  }
  return { branch, files }
}

function change(path: string, origPath: string | null, index: string, worktree: string, conflicted: boolean, untracked: boolean): FileChange {
  return { path, origPath, index, worktree, conflicted, untracked }
}

export function parseLog(output: string): Commit[] {
  return output
    .split(RECORD)
    .map((record) => record.replace(/^\n/, ""))
    .filter((record) => record.length > 0)
    .flatMap((record) => {
      const [hash, parents, author, email, date, subject, decorations] = record.split(FIELD)
      if (!hash) return []
      return [{
        hash,
        parents: parents ? parents.split(" ").filter(Boolean) : [],
        author: author ?? "",
        email: email ?? "",
        date: Number(date ?? 0),
        subject: subject ?? "",
        refs: parseDecorations(decorations ?? ""),
      }]
    })
}

export function parseDecorations(value: string): Ref[] {
  return value
    .split(", ")
    .map((item) => item.trim())
    .filter(Boolean)
    .flatMap((item): Ref[] => {
      if (item === "HEAD") return [{ name: "HEAD", kind: "head" }]
      if (item.startsWith("HEAD -> ")) return [{ name: "HEAD", kind: "head" }, ...parseDecorations(item.slice("HEAD -> ".length))]
      if (item.startsWith("tag: ")) return [{ name: item.slice(5).replace(/^refs\/tags\//, ""), kind: "tag" }]
      if (item.startsWith("refs/heads/")) return [{ name: item.slice(11), kind: "local" }]
      if (item.startsWith("refs/remotes/")) {
        const name = item.slice(13)
        if (name.endsWith("/HEAD")) return []
        return [{ name, kind: "remote" }]
      }
      return []
    })
}

export function parseBranches(output: string, worktrees: ReadonlyMap<string, string> = new Map()): Branch[] {
  return output.split("\n").filter(Boolean).flatMap((line): Branch[] => {
    const [ref, sha, upstream, track, date, subject, head] = line.split(FIELD)
    if (!ref) return []
    const remote = ref.startsWith("refs/remotes/")
    const name = ref.replace(/^refs\/(heads|remotes)\//, "")
    if (remote && (name.endsWith("/HEAD") || !name.includes("/"))) return []
    const worktree = remote || head === "*" ? undefined : worktrees.get(name)
    return [{
      name,
      remote,
      current: head === "*",
      upstream: upstream || null,
      ahead: Number(/ahead (\d+)/.exec(track ?? "")?.[1] ?? 0),
      behind: Number(/behind (\d+)/.exec(track ?? "")?.[1] ?? 0),
      gone: track === "gone",
      sha: sha ?? "",
      date: Number(date ?? 0),
      subject: subject ?? "",
      ...(worktree ? { worktree } : {}),
    }]
  })
}

export function parseWorktrees(output: string): Map<string, string> {
  return new Map(
    output.split(/\n\n+/).flatMap((record): [string, string][] => {
      const lines = record.split("\n")
      const path = lines.find((line) => line.startsWith("worktree "))?.slice("worktree ".length)
      const branch = lines.find((line) => line.startsWith("branch refs/heads/"))?.slice("branch refs/heads/".length)
      if (!path || !branch || lines.some((line) => line === "prunable" || line.startsWith("prunable "))) return []
      return [[branch, path]]
    }),
  )
}

/**
 * Reads a GitLab project from any git remote URL: https(s), ssh:// with a port, scp-like git@host:group/project,
 * and git+ssh. GitLab.com and self-hosted hosts are both accepted.
 */
export function parseRemote(name: string, url: string, override?: { host?: string; project?: string; apiBase?: string }): Remote | undefined {
  const trimmed = url.trim()
  let host = ""
  let path = ""
  let scheme = "https"
  const https = /^(https?):\/\/(?:[^@/]+@)?([^/:]+)(?::\d+)?\/(.+?)\/?$/i.exec(trimmed)
  const ssh = /^(?:ssh:\/\/)?(?:[\w.-]+@)([^/:]+)(?::\d+)?[:/](.+?)\/?$/i.exec(trimmed)
  if (https?.[1] && https[2] && https[3]) {
    scheme = https[1]
    host = https[2]
    path = https[3]
  } else if (ssh?.[1] && ssh[2]) {
    host = ssh[1]
    path = ssh[2]
  } else {
    return undefined
  }
  path = path.replace(/\.git$/i, "")
  if (override?.project) path = override.project
  if (override?.host) host = override.host
  if (!path.includes("/") || !host) return undefined
  const parts = path.split("/")
  const repo = parts.pop() ?? ""
  const owner = parts.join("/")
  const apiBase = override?.apiBase?.replace(/\/$/, "") ?? `${scheme}://${host}`
  return {
    name,
    host,
    path,
    owner,
    repo,
    web: `${apiBase}/${path}`,
    apiBase,
    scheme,
  }
}

export function stateReason(value: string | null | undefined): CloseReason {
  if (value === "not_planned" || value === "not-planned" || value === "NOT_PLANNED") return "not_planned"
  if (value === "duplicate" || value === "DUPLICATE") return "duplicate"
  return "completed"
}

/** `#123` or `group/project#123`, not inside a word, a path or an HTML entity such as `&#123;`. */
export const REF_PATTERN = /(?<![\w/#&.!-])(?:((?:[\w.-]+\/)+[\w.-]+))?([#!])(\d{1,7})\b/g

export function findRefs(text: string) {
  return [...text.matchAll(REF_PATTERN)].map((match) => ({
    index: match.index ?? 0,
    length: match[0].length,
    repo: match[1],
    number: Number(match[3]),
    kind: match[2] === "!" ? ("mr" as const) : ("issue" as const),
  }))
}

/** A GitLab URL that names an issue, merge request, pipeline, job or commit this panel can show itself. */
export type GitLabLink =
  | { kind: "item"; repo: string; number: number; item: ItemKind; files: boolean }
  | { kind: "commit"; repo: string; sha: string }
  | { kind: "run"; repo: string; id: number; job: number | null }

export function parseGitLabLink(href: string): GitLabLink | undefined {
  const whole = /^https?:\/\/[^/]+\/(.+)$/.exec(href)
  if (!whole?.[1]) return undefined
  const path = whole[1].split(/[?#]/)[0] ?? ""
  let repo = ""
  let rest = ""
  const marker = path.indexOf("/-/")
  if (marker !== -1) {
    repo = path.slice(0, marker)
    rest = path.slice(marker + 3)
  } else {
    // Older GitLab URLs omit /-/; the project is everything before the first known segment.
    const legacy = /^((?:[\w.-]+\/)+[\w.-]+?)\/(issues|merge_requests|commit|pipelines)\/(.*)$/.exec(path)
    if (!legacy?.[1] || !legacy[2] || legacy[3] === undefined) return undefined
    repo = legacy[1]
    rest = `${legacy[2]}/${legacy[3]}`
  }
  if (!repo) return undefined
  // Issues and merge requests number independently, so the URL segment is the only thing that says which one this is.
  const item = /^(issues|merge_requests)\/(\d+)(\/diffs)?/.exec(rest)
  if (item?.[2]) return { kind: "item", repo, number: Number(item[2]), item: item[1] === "merge_requests" ? "mr" : "issue", files: !!item[3] }
  const commit = /^(?:commit|merge_requests\/\d+\/commits)\/([0-9a-f]{7,40})/.exec(rest)
  if (commit?.[1]) return { kind: "commit", repo, sha: commit[1] }
  const run = /^pipelines\/(\d+)(?:\/(?:jobs|builds)\/(\d+))?/.exec(rest)
  if (run?.[1]) return { kind: "run", repo, id: Number(run[1]), job: run[2] ? Number(run[2]) : null }
  return undefined
}

/** The issue a branch is named after: `123-fix-x`, `feat/123-x`, `issue-123`, `fix-123`, `fix/123`. */
export function issueFromBranch(branch: string): number | undefined {
  const name = branch.slice(branch.lastIndexOf("/") + 1)
  const match = /^(\d{1,7})(?:[-_]|$)/.exec(name) ?? /(?:^|[-_])(?:issues?|fix|gl)[-_]?(\d{1,7})(?:[-_]|$)/i.exec(name)
  const number = Number(match?.[1])
  return number > 0 ? number : undefined
}

export function issueBranchName(number: number, title: string) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .split("-")
    .slice(0, 6)
    .join("-")
  return slug ? `${number}-${slug}` : String(number)
}

const CLOSING = /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?):?\s+(?:((?:[\w.-]+\/)+[\w.-]+)?#(\d{1,7})\b|https?:\/\/[^\s]+\/((?:[\w.-]+\/)+[\w.-]+)\/-\/(?:issues|merge_requests)\/(\d{1,7})\b)/gi

export function closingRefs(body: string): { repo: string | undefined; number: number }[] {
  return [...body.replace(/<!--[\s\S]*?-->/g, "").matchAll(CLOSING)].map((match) => ({
    repo: match[1] ?? match[3],
    number: Number(match[2] ?? match[4]),
  }))
}

const PLACEHOLDER = /\b((?:close[sd]?|fix(?:e[sd])?|resolve[sd]?):?\s*)#(?![\w#])/i

export function withClosing(body: string, number: number) {
  if (closingRefs(body).some((ref) => !ref.repo && ref.number === number)) return body
  const parts = body.split(/(<!--[\s\S]*?-->)/)
  const at = parts.findIndex((part, index) => index % 2 === 0 && PLACEHOLDER.test(part))
  if (at !== -1) return parts.map((part, index) => (index === at ? part.replace(PLACEHOLDER, `$1#${number}`) : part)).join("")
  const trimmed = body.trimEnd()
  return trimmed ? `${trimmed}\n\nCloses #${number}` : `Closes #${number}`
}

export interface DiffLine {
  kind: "context" | "add" | "del" | "hunk"
  text: string
  old: number | null
  new: number | null
}

export function parsePatch(patch: string): DiffLine[] {
  const lines: DiffLine[] = []
  const at = { old: 0, new: 0 }
  // Raw `git diff` output carries a preamble (`diff --git`, `index`, `--- a/f`, `+++ b/f`) that is not diff
  // content. Only lines after a hunk header are classified, so a file header never renders as a change.
  let inHunk = false
  for (const text of patch.split("\n")) {
    const hunk = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(text)
    if (hunk) {
      at.old = Number(hunk[1])
      at.new = Number(hunk[2])
      inHunk = true
      lines.push({ kind: "hunk", text, old: null, new: null })
      continue
    }
    if (text.startsWith("diff --git ") || text.startsWith("Binary files ")) {
      inHunk = false
      lines.push({ kind: "hunk", text, old: null, new: null })
      continue
    }
    if (!inHunk) continue
    if (text.startsWith("\\") || text === "") continue
    if (text.startsWith("+")) {
      lines.push({ kind: "add", text: text.slice(1), old: null, new: at.new++ })
      continue
    }
    if (text.startsWith("-")) {
      lines.push({ kind: "del", text: text.slice(1), old: at.old++, new: null })
      continue
    }
    lines.push({ kind: "context", text: text.slice(1), old: at.old++, new: at.new++ })
  }
  return lines
}

export function diffStats(patch: string) {
  let additions = 0
  let deletions = 0
  for (const line of parsePatch(patch)) {
    if (line.kind === "add") additions++
    if (line.kind === "del") deletions++
  }
  return { additions, deletions }
}

/** The hunk of a patch that contains a line, for an inline review thread's code excerpt. */
export function hunkAt(patch: string | null | undefined, line: number, side: string): string {
  if (!patch) return ""
  const lines = parsePatch(patch)
  for (let i = 0; i < lines.length; i++) {
    const row = lines[i]
    if (row?.kind !== "hunk" && (side === "RIGHT" ? row?.new : row?.old) === line) {
      let start = i
      while (start > 0 && lines[start - 1]?.kind !== "hunk") start--
      let end = i
      while (end + 1 < lines.length && lines[end + 1]?.kind !== "hunk") end++
      const width = side === "RIGHT" ? 200 : 200
      return lines
        .slice(start, Math.min(end + 1, start + width))
        .map((entry) => (entry.kind === "add" ? `+${entry.text}` : entry.kind === "del" ? `-${entry.text}` : entry.kind === "hunk" ? entry.text : ` ${entry.text}`))
        .join("\n")
    }
  }
  return ""
}

/** The merge request a branch stands for. A long-lived branch that moved past its merged MR shows none. */
export function mrFor(
  mrs: { items: { number: number; head: string; base: string; state: string; cross: boolean; sha?: string; url: string }[] } | undefined,
  branch: string | null | undefined,
  tip?: string | null,
  defaultBranch?: string | null,
) {
  if (!mrs || !branch) return undefined
  const matching = mrs.items.filter((item) => item.head === branch && !item.cross)
  const open = matching.find((item) => item.state === "OPEN")
  if (open) return open
  if (branch === defaultBranch) return undefined
  const done = matching[0]
  if (!done || !tip || !done.sha) return done
  return done.sha === tip ? done : undefined
}

export function checkState(status: string | null | undefined): CheckState {
  if (!status) return "none"
  const value = status.toLowerCase()
  if (["success", "passed"].includes(value)) return "success"
  if (["failed", "canceled", "cancelled", "timedout", "timeout"].includes(value)) return "failure"
  if (["created", "waiting_for_resource", "preparing", "pending", "running", "manual", "scheduled", "skipped"].includes(value)) {
    return value === "skipped" || value === "manual" ? "none" : "pending"
  }
  return "none"
}

/**
 * GitLab reports mergeability through two different fields: the coarse `merge_status`
 * (`can_be_merged` / `cannot_be_merged` / `checking`) and the finer `detailed_merge_status`
 * (`mergeable`, `ci_must_pass`, `not_approved`, …). Either can arrive, so both map to one label.
 */
export function mergeability(status: string | null | undefined): { tone: "success" | "danger" | "warn" | undefined; label: string } {
  switch (status) {
    case "can_be_merged":
    case "mergeable":
      return { tone: "success", label: "Ready to merge" }
    case "cannot_be_merged":
      return { tone: "danger", label: "Merge conflicts" }
    case "ci_must_pass":
    case "ci_still_running":
      return { tone: "warn", label: "Waiting on the pipeline" }
    case "discussions_not_resolved":
      return { tone: "warn", label: "Discussions to resolve" }
    case "draft_status":
      return { tone: "warn", label: "Still a draft" }
    case "not_approved":
      return { tone: "warn", label: "Needs approval" }
    case "blocked_status":
    case "external_status_check":
      return { tone: "warn", label: "Blocked" }
    case "checking":
    case "unchecked":
      return { tone: undefined, label: "Checking mergeability" }
    default:
      return { tone: undefined, label: status ? status.replace(/_/g, " ") : "" }
  }
}

/** A GitHub-style query translated into GitLab list parameters. Unknown qualifiers remain free-text search. */
export interface ParsedQuery {  search: string
  params: Record<string, string>
  sort: string | null
}

export function parseSearchQuery(query: string, kind: "issue" | "mr"): ParsedQuery {
  const params: Record<string, string> = {}
  const words: string[] = []
  let sort: string | null = null
  const order = (value: string) => {
    const match = /^(created|updated|priority|milestone|popularity|label_priority|due_date|merged|closed)-(asc|desc)$/.exec(value)
    if (!match) return false
    sort = value
    params.order_by = match[1] === "closed" ? "updated_at" : match[1] === "merged" ? "updated_at" : match[1]
    params.sort = match[2] ?? "desc"
    return true
  }
  for (const raw of tokenize(query)) {
    const negated = raw.startsWith("-")
    const token = negated ? raw.slice(1) : raw
    const colon = token.indexOf(":")
    if (colon === -1) {
      words.push(raw)
      continue
    }
    const key = token.slice(0, colon)
    const value = token.slice(colon + 1)
    if (!value) {
      words.push(raw)
      continue
    }
    const state = (next: string) => {
      if (kind === "mr" && next === "open") params.state = "opened"
      else if (kind === "mr" && next === "merged") params.state = "merged"
      else if (next === "closed") params.state = "closed"
      else params.state = "opened"
    }
    if (key === "is") {
      if (["open", "opened", "closed", "merged", "all"].includes(value)) {
        if (value === "all") params.state = "all"
        else state(value)
        continue
      }
      if (kind === "mr" && (value === "draft" || value === "ready")) {
        params.wip = (value === "ready" ? !negated : negated) ? "no" : "yes"
        continue
      }
      // A kind selector says nothing about a list whose kind the caller already fixed; searching for it literally finds nothing.
      if (value === "issue" || value === "pr" || value === "mr") continue
    }
    if (key === "sort" && order(value)) continue
    if (key === "label") {
      if (negated) params["not[labels]"] = joinList(params["not[labels]"], value)
      else params.labels = joinList(params.labels, value)
      continue
    }
    if (key === "author") {
      // GitLab has no `not[author_username]`; dropping the qualifier beats inverting it.
      if (!negated) params.author_username = normUser(value)
      continue
    }
    if (key === "assignee") {
      if (negated || value === "none") params.assignee_id = "None"
      else params.assignee_username = normUser(value)
      continue
    }
    if (key === "reviewer" && kind === "mr") {
      if (!negated) params.reviewer_username = normUser(value)
      continue
    }
    if (key === "milestone") {
      if (negated) params["not[milestone]"] = value
      else params.milestone = value
      continue
    }
    if (key === "no" && value === "assignee") {
      params.assignee_id = "None"
      continue
    }
    if (key === "no" && value === "label") {
      params.labels = "None"
      continue
    }
    if (key === "no" && value === "milestone") {
      params.milestone = "None"
      continue
    }
    if (key === "draft" && kind === "mr") {
      params.wip = /^(false|no|0)$/i.test(value) || negated ? "no" : "yes"
      continue
    }
    if (key === "in") {
      params.in = value
      continue
    }
    if (key === "created" || key === "updated") {
      const date = /^[<>]=?(\d{4}-\d\d-\d\d)$/.exec(value)
      if (date?.[1]) {
        params[`${key}_after`] = date[1]
        continue
      }
    }
    words.push(raw)
  }
  // The list APIs only sort open items reliably; closed lists keep their server order.
  if (!params.state || params.state === "opened") {
    if (!sort) {
      params.order_by = "created_at"
      params.sort = "desc"
    }
  } else if (!sort) {
    delete params.order_by
    delete params.sort
  }
  return { search: words.join(" ").trim(), params, sort }
}

function tokenize(query: string) {
  const tokens: string[] = []
  let word = ""
  let quote = ""
  for (const char of query) {
    if (quote) {
      if (char === quote) quote = ""
      else word += char
      continue
    }
    if (char === '"' || char === "'") {
      quote = char
      continue
    }
    if (/\s/.test(char)) {
      if (word) tokens.push(word)
      word = ""
      continue
    }
    word += char
  }
  if (word) tokens.push(word)
  return tokens
}

/** Strips the leading `@`. `@me` stays a sentinel: GitLab's `*_username` params take a literal name, so the host resolves it. */
function normUser(value: string) {
  return value === "@me" ? "@me" : value.replace(/^@/, "")
}

function joinList(current: string | undefined, value: string) {
  if (!current) return value
  if (current === "None" || value === "None") return value
  return `${current},${value}`
}

/** Formats a query parsed from UI chips back into the query string. */
export function buildQuery(base: string, qualifiers: Record<string, string | undefined>) {
  const parts = Object.entries(qualifiers)
    .filter(([, value]) => !!value)
    .map(([key, value]) => (key === "text" ? String(value) : `${key}:${String(value).includes(" ") ? `"${value}"` : value}`))
  const text = base.trim()
  return [text, ...parts].filter(Boolean).join(" ")
}

export function relativeAge(date: string | number | undefined, now = Date.now()) {
  if (!date) return ""
  const value = typeof date === "number" ? (date < 1e12 ? date * 1000 : date) : Date.parse(date)
  if (!Number.isFinite(value)) return ""
  const seconds = Math.floor((now - value) / 1000)
  if (seconds < 60) return "now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo`
  return `${Math.floor(months / 12)}y`
}

export function initials(name: string) {
  const parts = name.trim().split(/[\s._-]+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return (parts[0] ?? "?").slice(0, 2).toUpperCase()
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase()
}

export function colorFor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
  const colors = ["#e5484d", "#f76b15", "#ffb224", "#46a758", "#12a594", "#0091ff", "#6e56cf", "#e93d82", "#8e4ec6", "#3e63dd"]
  return colors[Math.abs(hash) % colors.length] ?? "#8b8d98"
}

export function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

export function oneLine(text: string, limit = 200) {
  const flat = text.replace(/\s+/g, " ").trim()
  return flat.length > limit ? `${flat.slice(0, limit)}…` : flat
}

export function clip(text: string, limit: number) {
  return text.length > limit ? `${text.slice(0, limit)}\n… (${text.length - limit} more characters omitted)` : text
}
