import type { AgentAction, AgentKind, AgentPayload, CloseReason } from "../shared/types"

export const MAX_BATCH = 100
export const MAX_BODY = 65_536
const MAX_NOTE = 1000
const RETRIES = 3
export const STALE = 15 * 60_000

export type WriteKind = "comment" | "close" | "reopen" | "label" | "assign"

export interface Proposal {
  readonly repo: string | null
  readonly numbers: readonly number[]
  readonly kind: WriteKind
  readonly payload: AgentPayload
  readonly note: string
  /** GitLab numbers issues and merge requests separately; this picks one when both exist. */
  readonly itemKind?: "issue" | "mr"
}

export function parseWrite(kind: WriteKind, input: unknown): Proposal {
  if (typeof input !== "object" || input === null) throw new Error("Pass the arguments as an object.")
  const value = input as Record<string, unknown>
  const repo = value.repo === undefined || value.repo === null || value.repo === "" ? null : checkRepo(value.repo)
  const numbers = checkNumbers(value.numbers)
  const note = typeof value.note === "string" ? value.note.trim() : ""
  if (!note) throw new Error("`note` is required: one short sentence telling the user why, shown next to the action.")
  const itemKind = value.kind === "issue" || value.kind === "mr" ? value.kind : undefined
  return { repo, numbers, kind, payload: payloadOf(kind, value, numbers), note: note.slice(0, MAX_NOTE), ...(itemKind ? { itemKind } : {}) }
}

function payloadOf(kind: WriteKind, value: Record<string, unknown>, numbers: readonly number[]): AgentPayload {
  if (kind === "comment") return { body: checkBody(value.body, "body", true) }
  if (kind === "reopen") return optionalBody(value.comment)
  if (kind === "close") {
    const duplicateOf = value.duplicate_of === undefined || value.duplicate_of === null ? undefined : checkNumber(value.duplicate_of, "duplicate_of")
    const reason = value.reason === undefined || value.reason === null ? (duplicateOf ? "duplicate" : "completed") : checkReason(value.reason)
    if (reason === "duplicate" && !duplicateOf) throw new Error('`duplicate_of` is required when `reason` is "duplicate": the number of the issue to keep.')
    if (reason !== "duplicate" && duplicateOf) throw new Error('`duplicate_of` only goes with `reason` "duplicate".')
    if (duplicateOf && numbers.includes(duplicateOf)) throw new Error(`#${duplicateOf} cannot be closed as a duplicate of itself.`)
    return { reason, ...(duplicateOf ? { duplicateOf } : {}), ...optionalBody(value.comment) }
  }
  const add = checkNames(value.add, "add", kind)
  const remove = checkNames(value.remove, "remove", kind)
  if (add.length === 0 && remove.length === 0) throw new Error("Pass `add`, `remove` or both, with at least one name.")
  const both = add.filter((name) => remove.includes(name))
  if (both.length > 0) throw new Error(`${both.join(", ")} cannot be both added and removed.`)
  return { add, remove }
}

function optionalBody(body: unknown): AgentPayload {
  const text = checkBody(body, "comment", false)
  return text ? { body: text } : {}
}

export function checkRepo(repo: unknown) {
  if (typeof repo !== "string" || !/^[\w.-]+(?:\/[\w.-]+)+$/.test(repo.trim()) || /(^|\/)\.\.?($|\/)/.test(repo.trim()))
    throw new Error("`repo` must look like group/project (subgroups allowed), such as gitlab-org/gitlab.")
  return repo.trim()
}

function checkNumbers(numbers: unknown) {
  if (!Array.isArray(numbers) || numbers.length === 0) throw new Error("`numbers` must list at least one issue or merge request number.")
  const unique = [...new Set(numbers.map((number) => checkNumber(number, "numbers")))]
  if (unique.length > MAX_BATCH) throw new Error(`At most ${MAX_BATCH} numbers per call; split the rest into another call.`)
  return unique
}

function checkNumber(number: unknown, field: string) {
  const parsed = typeof number === "string" && /^[#!]?\d+$/.test(number.trim()) ? Number(number.trim().replace(/^[#!]/, "")) : number
  if (typeof parsed !== "number" || !Number.isSafeInteger(parsed) || parsed <= 0) throw new Error(`\`${field}\` takes positive whole numbers, not ${JSON.stringify(number)}.`)
  return parsed
}

function checkReason(reason: unknown): CloseReason {
  const text = typeof reason === "string" ? reason.trim().toLowerCase().replace(/[\s-]+/g, "_") : ""
  if (text === "completed" || text === "not_planned" || text === "duplicate") return text
  throw new Error('`reason` must be "completed", "not_planned" or "duplicate".')
}

function checkBody(body: unknown, field: string, required: boolean) {
  if (body === undefined || body === null) {
    if (required) throw new Error(`\`${field}\` is required.`)
    return ""
  }
  if (typeof body !== "string") throw new Error(`\`${field}\` must be text.`)
  if (required && !body.trim()) throw new Error(`\`${field}\` must not be empty.`)
  if (body.length > MAX_BODY) throw new Error(`\`${field}\` is ${body.length} characters; GitLab allows ${MAX_BODY}.`)
  return body.trim() ? body : ""
}

function checkNames(names: unknown, field: string, kind: WriteKind) {
  if (names === undefined || names === null) return []
  if (!Array.isArray(names)) throw new Error(`\`${field}\` must be a list of ${kind === "label" ? "label names" : "GitLab usernames"}.`)
  const checked = names.map((name) => {
    if (typeof name !== "string" || !name.trim()) throw new Error(`\`${field}\` has an empty name.`)
    if (kind === "label") return name.trim()
    return name.trim() === "@me" ? "@me" : name.trim().replace(/^@/, "")
  })
  return [...new Set(checked)]
}

export function expand(
  proposal: Proposal,
  input: {
    readonly sessionID: string
    readonly repo: string
    readonly batch: string
    readonly now: number
    readonly status: "proposed" | "approved"
    readonly items: ReadonlyMap<number, { readonly title: string; readonly item: "issue" | "mr" }>
    readonly id: () => string
    readonly source?: "tool" | "user"
    readonly round?: number
  },
): AgentAction[] {
  return proposal.numbers.map((number) => ({
    id: input.id(),
    sessionID: input.sessionID,
    batch: input.batch,
    repo: input.repo,
    number,
    item: input.items.get(number)?.item ?? null,
    title: input.items.get(number)?.title ?? "",
    kind: proposal.kind,
    payload: proposal.payload,
    note: input.source === "user" ? "" : proposal.note,
    status: input.status,
    error: null,
    result: null,
    source: input.source ?? "tool",
    undoOf: null,
    undoneBy: null,
    ...(input.round === undefined ? {} : { round: input.round }),
    createdAt: input.now,
    updatedAt: input.now,
  }))
}

export function blocker(kind: WriteKind, info: { readonly state: "OPEN" | "CLOSED" | "MERGED" } | undefined, same: Pick<AgentAction, "status"> | undefined) {
  if (!info) return "does not exist or cannot be read"
  if (kind === "close" && info.state !== "OPEN") return `already ${info.state.toLowerCase()}`
  if (kind === "reopen" && info.state === "MERGED") return "merged; it cannot be reopened"
  if (kind === "reopen" && info.state === "OPEN") return "already open"
  if (same) return `already ${same.status === "proposed" ? "proposed and waiting for the user" : "approved and running"}`
  return undefined
}

export function edits(action: Pick<AgentAction, "kind" | "payload" | "item" | "edited" | "original">) {
  if (!action.edited) return undefined
  const original = action.original
  if (!original) return "edited by the user"
  const before = describe({ ...action, payload: original })
  const after = describe(action)
  const body = (original.body ?? "") !== (action.payload.body ?? "")
  const same = describe({ ...action, payload: { ...original, body: undefined } }) === describe({ ...action, payload: { ...action.payload, body: undefined } })
  const changed = same ? (body ? "the user rewrote the comment" : "the user saved it unchanged") : `the user changed it to ${after}`
  const comments = body ? ` Your comment: "${oneLine(original.body ?? "", 300)}"; the user's: "${oneLine(action.payload.body ?? "", 300)}".` : ""
  return `edited by the user: you proposed ${before}; ${changed}.${comments}`
}

export function triageProgress(triage: { readonly total: number; readonly reviewed: readonly number[] }, actions: readonly AgentAction[]) {
  const mine = actions.filter((action) => action.round !== undefined && action.source === "tool")
  const reviewed = new Set([...triage.reviewed, ...mine.map((action) => action.number)]).size
  const of = (...statuses: AgentAction["status"][]) => mine.filter((action) => statuses.includes(action.status)).length
  return {
    reviewed,
    total: Math.max(triage.total, reviewed),
    approved: of("approved", "running", "done", "failed", "undone"),
    skipped: of("skipped"),
    waiting: of("proposed"),
  }
}

export function toggleRange(selected: ReadonlySet<number>, numbers: readonly number[], index: number, anchor: number | undefined, range: boolean) {
  const number = numbers[index]
  if (number === undefined) return new Set(selected)
  const on = !selected.has(number)
  const from = range && anchor !== undefined ? Math.min(anchor, index) : index
  const to = range && anchor !== undefined ? Math.max(anchor, index) : index
  const span = numbers.slice(from, to + 1)
  return on ? new Set([...selected, ...span]) : new Set([...selected].filter((item) => !span.includes(item)))
}

export function itemList(
  repo: string,
  kind: "issue" | "mr",
  items: readonly { readonly number: number; readonly title: string; readonly state: string; readonly author: string; readonly labels: readonly { readonly name: string }[] }[],
) {
  return [
    `${items.length} ${kind === "mr" ? "merge requests" : "issues"} in ${repo}:`,
    "",
    ...items.map(
      (item) =>
        `- ${kind === "mr" ? "!" : "#"}${item.number} (${item.state.toLowerCase()}) ${item.title}${item.labels.length > 0 ? ` [${item.labels.map((label) => label.name).join(", ")}]` : ""} · @${item.author}`,
    ),
  ].join("\n")
}

export function triagePrompt(input: {
  readonly repo: string
  readonly kind: "issue" | "mr"
  readonly query: string | null
  readonly numbers: readonly number[]
  readonly total: number
  readonly rules: string
  readonly replies: readonly { readonly name: string; readonly body: string }[]
  readonly batch: number
}) {
  const noun = input.kind === "mr" ? "merge requests" : "issues"
  const what = input.query
    ? [
        `The ${input.total} ${noun} matching this search, in this order:`,
        "",
        "```",
        input.query,
        "```",
        "",
        `First list them all: call the gitlab_panel_search tool with repo "${input.repo}", kind "${input.kind}", exactly this query and limit 100, and follow its cursor to the last page. Work through that fixed list; don't search again between batches, since items the user closes drop out of the results and would shift the pages.`,
      ]
    : [`These ${input.numbers.length} ${noun}: ${input.numbers.map((number) => (input.kind === "mr" ? "!" : "#") + number).join(", ")}.`]
  const replies =
    input.replies.length > 0
      ? [
          "",
          "## Saved replies",
          "",
          "Use these replies, word for word, where the rules call for them (fill in only what a reply leaves for you to fill in):",
          ...input.replies.flatMap((reply) => ["", `### ${reply.name}`, "", reply.body.trim()]),
        ]
      : []
  return [
    `Triage ${noun} in ${input.repo} with me, using the gitlab_panel tools. I review every change you propose in the GitLab panel.`,
    "",
    "## What to go through",
    "",
    ...what,
    "",
    "## My rules",
    "",
    input.rules.trim() || "(No rules given: propose only what is clearly right, such as labels that fit and duplicates.)",
    ...replies,
    "",
    "## How to work",
    "",
    `- Work in batches of ${input.batch} items. Read each item's search line, and call \`gitlab_panel_view\` when the title and labels are not enough to decide.`,
    "- Only propose. Use the gitlab_panel_comment, gitlab_panel_close, gitlab_panel_reopen, gitlab_panel_label and gitlab_panel_assign tools: each queues proposals that I approve, edit or skip. Never write to GitLab any other way: no glab in the shell, no API calls.",
    `- GitLab numbers issues and merge requests separately. Every write tool takes kind: "${input.kind}" here; pass it so a number never lands on the other kind.`,
    "- Give every proposal a short `note` saying why; I see it next to the action.",
    "- Put identical actions in one tool call: all the numbers that get the same close reason and reply, or the same labels, go together.",
    "- When no rule applies or you are not sure, leave the item alone and mention it in the batch summary instead of guessing.",
    `- After each batch, call the \`gitlab_panel_actions\` tool with \`wait: true\` and \`reviewed\` set to every number you looked at in the batch, including the ones you left alone. It returns once I have decided, with what I approved, skipped and edited. If it returns while proposals still wait, call it again the same way. Don't stop to ask me between batches.`,
    "- Learn from my skips and edits before the next batch: follow how I changed your proposals, and don't propose what I skipped again.",
    "- When every item is done, stop and summarize: what I approved, what I skipped, and the items you left alone with the reason for each.",
  ].join("\n")
}

export function describe(action: Pick<AgentAction, "kind" | "payload" | "item">) {
  const payload = action.payload
  const comment = payload.body ? ", with a comment" : ""
  if (action.kind === "comment") return `comment "${oneLine(payload.body ?? "", 60)}"`
  if (action.kind === "close") {
    if (action.item === "mr") return `close merge request${comment}`
    if (payload.reason === "duplicate") return `close as duplicate of #${payload.duplicateOf}${comment}`
    return `close as ${payload.reason === "not_planned" ? "not planned" : "completed"}${comment}`
  }
  if (action.kind === "reopen") return `reopen${comment}`
  if (action.kind === "uncomment") return "delete a comment"
  if (action.kind === "approve") return "approve"
  if (action.kind === "unapprove") return "remove approval"
  if (action.kind === "other") return `ran \`${oneLine(payload.command ?? "", 80)}\``
  const noun = action.kind === "label" ? "label" : "assignee"
  const mark = action.kind === "label" ? "" : "@"
  const list = (names: readonly string[] | undefined) => (names ?? []).map((name) => (name === "@me" ? name : `${mark}${name}`)).join(", ")
  return [
    payload.add?.length ? `add ${noun}${payload.add.length > 1 ? "s" : ""} ${list(payload.add)}` : "",
    payload.remove?.length ? `remove ${noun}${payload.remove.length > 1 ? "s" : ""} ${list(payload.remove)}` : "",
  ]
    .filter(Boolean)
    .join(", ")
}

export function undoFor(action: AgentAction): { kind: AgentKind; payload: AgentPayload } | undefined {
  if (action.status !== "done" || action.undoOf || action.undoneBy || action.result?.noop) return undefined
  const result = action.result ?? {}
  const comment = result.commentId ? { commentId: result.commentId } : {}
  if (action.kind === "close") return { kind: "reopen", payload: comment }
  if (action.source === "shell") return undefined
  if (action.kind === "reopen") return { kind: "close", payload: { reason: result.reason === "not_planned" ? "not_planned" : "completed", ...comment } }
  if (action.kind === "comment") return result.commentId ? { kind: "uncomment", payload: { commentId: result.commentId } } : undefined
  if (action.kind !== "label" && action.kind !== "assign") return undefined
  const add = result.removed ?? []
  const remove = result.added ?? []
  if (add.length === 0 && remove.length === 0) return undefined
  return { kind: action.kind, payload: { add, remove } }
}

export function backoff(message: string, attempt: number) {
  const after = /retry[- ]after:?\s*(\d+)/i.exec(message)
  const limited = !!after || /rate limit|too many requests|HTTP 429/i.test(message)
  if (!limited || attempt >= RETRIES) return undefined
  if (after) return Math.min(Number(after[1]), 600) * 1000
  return 60_000 * 2 ** attempt
}

export function settle(actions: readonly AgentAction[], now: number): AgentAction[] {
  return actions.map((action) =>
    action.status === "running" && now - action.updatedAt > STALE
      ? { ...action, status: "failed", error: "Interrupted before it finished; check the item, then retry or skip it.", updatedAt: now }
      : action,
  )
}

export function counts(actions: readonly AgentAction[]) {
  const of = (status: AgentAction["status"]) => actions.filter((action) => action.status === status).length
  return { proposed: of("proposed"), running: of("running") + of("approved"), done: of("done"), failed: of("failed") }
}

/** A `glab issue|mr …` command found in a shell command line, with what it targets. */
export interface ShellGlab {
  readonly group: "issue" | "mr"
  readonly verb: string
  readonly number: number
  readonly repo: string | null
  readonly cd: string | null
  readonly kind: AgentKind
  readonly payload: AgentPayload
}

const VERBS = new Set(["close", "reopen", "note", "comment", "update", "merge", "approve", "unapprove", "delete"])
const VALUE_FLAGS: Record<string, readonly string[]> = {
  close: ["-r", "--reason"],
  reopen: [],
  note: ["-m", "--message", "-F", "--file"],
  comment: ["-m", "--message", "-F", "--file"],
  update: [
    "-t", "--title", "-d", "--description", "-m", "--milestone", "-a", "--assignee", "--add-label", "--remove-label",
    "--reviewer", "--unassign", "--target-branch", "--source-branch",
  ],
  merge: ["-m", "--message", "-b", "--branch", "--sha"],
  approve: [],
  unapprove: [],
  delete: [],
}

/**
 * The glab issue/mr close, reopen, note/comment, update, merge, approve commands in a shell line that name their
 * item by number or GitLab URL. Commands whose number comes from a variable are left out.
 */
export function parseShell(command: string): ShellGlab[] {
  const where = { cd: null as string | null }
  return segments(command).flatMap((tokens) => {
    if (tokens[0] === "cd" || tokens[0] === "pushd") {
      const target = tokens[1] ?? "~"
      where.cd = where.cd === "?" || /[$`*?]/.test(target) || target === "-" ? "?" : where.cd && !/^[~/]/.test(target) ? `${where.cd}/${target}` : target
      return []
    }
    const env = tokens.findIndex((token) => !/^[A-Za-z_][A-Za-z0-9_]*=/.test(token))
    if (env === -1) return []
    const glab = tokens[env] ?? ""
    if (glab !== "glab" && !glab.endsWith("/glab")) return []
    const args = tokens.slice(env + 1)
    const flags = new Map<string, string[]>()
    const positional: string[] = []
    const verbAt = { group: "", verb: "" }
    for (let index = 0; index < args.length; index++) {
      const entry = args[index] ?? ""
      const [flag, inline] = entry.startsWith("--") && entry.includes("=") ? [entry.slice(0, entry.indexOf("=")), entry.slice(entry.indexOf("=") + 1)] : [entry, undefined]
      const takes = flag === "-R" || flag === "--repo" || (VALUE_FLAGS[verbAt.verb] ?? []).includes(flag)
      if (flag.startsWith("-") && flag !== "-") {
        const value = inline ?? (takes ? args[++index] : "")
        flags.set(flag, [...(flags.get(flag) ?? []), value ?? ""])
        continue
      }
      if (!verbAt.group) {
        if (entry !== "issue" && entry !== "mr") return []
        verbAt.group = entry
        continue
      }
      if (!verbAt.verb) {
        if (!VERBS.has(entry)) return []
        verbAt.verb = entry
        continue
      }
      positional.push(entry)
    }
    if (!verbAt.verb) return []
    const target = targetOf(positional[0] ?? "")
    if (!target) return []
    const flagRepo = flags.get("-R")?.at(-1) ?? flags.get("--repo")?.at(-1)
    const repo = target.repo ?? repoName(flagRepo)
    const group = verbAt.group === "mr" ? "mr" : "issue"
    const line = tokens.map((token) => (/^[\w@%+=:,./#!-]+$/.test(token) ? token : JSON.stringify(token))).join(" ")
    return [{ group, verb: verbAt.verb, number: target.number, repo, cd: where.cd, ...shellKind(verbAt.verb, flags, line) }]
  })
}

function shellKind(verb: string, flags: ReadonlyMap<string, string[]>, command: string): { kind: AgentKind; payload: AgentPayload } {
  const values = (...names: string[]) => names.flatMap((name) => flags.get(name) ?? []).flatMap((value) => value.split(",")).map((value) => value.trim()).filter(Boolean)
  const line = { command: oneLine(command, 500) }
  if (verb === "close") {
    const reason = values("-r", "--reason")[0]?.toLowerCase().replace(/[\s-]+/g, "_")
    return { kind: "close", payload: { ...line, reason: reason === "not_planned" ? "not_planned" : "completed" } }
  }
  if (verb === "reopen") return { kind: "reopen", payload: line }
  if (verb === "note" || verb === "comment") return { kind: "comment", payload: line }
  if (verb === "approve") return { kind: "approve", payload: line }
  if (verb === "unapprove") return { kind: "unapprove", payload: line }
  if (verb !== "update") return { kind: "other", payload: line }
  const labels = { add: values("--add-label", "-l", "--label"), remove: values("--remove-label") }
  const people = { add: values("-a", "--assignee"), remove: values("--unassign") }
  const reviewers = { add: values("--reviewer") }
  const other = [...flags.keys()].some((flag) => !["-R", "--repo", "--add-label", "--remove-label", "-l", "--label", "-a", "--assignee", "--unassign", "--reviewer"].includes(flag))
  if (!other && labels.add.length + labels.remove.length > 0 && people.add.length + people.remove.length === 0) return { kind: "label", payload: { ...line, ...labels } }
  if (!other && people.add.length + people.remove.length > 0 && labels.add.length + labels.remove.length === 0) return { kind: "assign", payload: { ...line, ...people } }
  if (!other && reviewers.add.length > 0) return { kind: "assign", payload: { ...line, add: reviewers.add } }
  return { kind: "other", payload: line }
}

function targetOf(value: string) {
  const url = /^https?:\/\/[^/]+\/(.+?)\/-\/(?:issues|merge_requests)\/(\d+)(?:[/?#].*)?$/.exec(value)
  if (url?.[1] && url[2]) return { repo: url[1], number: Number(url[2]) }
  const number = /^[#!]?(\d+)$/.exec(value)?.[1]
  if (!number || !Number.isSafeInteger(Number(number)) || Number(number) <= 0) return undefined
  return { repo: null, number: Number(number) }
}

function repoName(value: string | undefined) {
  const parts = value?.replace(/^https?:\/\//, "").replace(/\.git$/, "").split("/").filter(Boolean) ?? []
  const name = parts.slice(-2).join("/")
  return parts.length >= 2 && /^[\w.-]+\/[\w.-]+$/.test(name) ? name : null
}

function segments(command: string): string[][] {
  const all: string[][] = [[]]
  const state = { word: "", started: false, quote: "" }
  const push = () => {
    if (state.started) all.at(-1)?.push(state.word)
    state.word = ""
    state.started = false
  }
  const split = () => {
    push()
    all.push([])
  }
  for (let index = 0; index < command.length; index++) {
    const char = command[index] ?? ""
    if (state.quote === "'") {
      if (char === "'") state.quote = ""
      else state.word += char
      continue
    }
    if (state.quote === '"') {
      if (char === '"') state.quote = ""
      else if (char === "\\" && /["\\$`]/.test(command[index + 1] ?? "")) state.word += command[++index]
      else state.word += char
      continue
    }
    if (char === "'" || char === '"') {
      state.quote = char
      state.started = true
      continue
    }
    if (char === "\\") {
      if (command[index + 1] === "\n") index++
      else {
        state.word += command[++index] ?? ""
        state.started = true
      }
      continue
    }
    if (char === ";" || char === "|" || char === "&" || char === "\n" || char === "(" || char === ")") {
      split()
      continue
    }
    if (/\s/.test(char)) {
      push()
      continue
    }
    state.word += char
    state.started = true
  }
  push()
  return all.filter((tokens) => tokens.length > 0)
}

function oneLine(text: string, limit: number) {
  const flat = text.replace(/\s+/g, " ").trim()
  return flat.length > limit ? `${flat.slice(0, limit)}…` : flat
}
