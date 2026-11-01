import assert from "node:assert/strict"
import test from "node:test"
import { backoff, blocker, counts, expand, parseShell, parseWrite, triageProgress, undoFor, describe as describeAction } from "../src/host/plan.ts"
import { hunkRanges, placementError, splitDrift, withMoved } from "../src/host/draft.ts"
import type { AgentAction, ChangedFile } from "../src/shared/types.ts"

const PATCH = ["@@ -1,3 +1,4 @@", " one", "-two", "+TWO", "+three", " four"].join("\n")

function file(patch: string | null, path = "src/app.ts", previous: string | null = null): ChangedFile {
  return { path, previous, status: "modified", additions: 2, deletions: 1, patch }
}

function action(over: Partial<AgentAction> = {}): AgentAction {
  return {
    id: "a1", sessionID: "s1", batch: "b1", repo: "g/p", number: 7, item: "issue", title: "Crash",
    kind: "comment", payload: { body: "hi" }, note: "why", status: "done", error: null, result: null,
    source: "tool", undoOf: null, undoneBy: null, createdAt: 0, updatedAt: 0, ...over,
  }
}

test("parseWrite keeps the issue/MR kind and refuses an incomplete write", () => {
  const mr = parseWrite("close", { numbers: ["!7"], kind: "mr", reason: "completed", note: "done with it" })
  assert.deepEqual(mr.numbers, [7])
  assert.equal(mr.itemKind, "mr")
  assert.equal(parseWrite("comment", { numbers: [3], body: "x", note: "n" }).itemKind, undefined)
  assert.throws(() => parseWrite("comment", { numbers: [3], body: "x" }), /`note` is required/)
  assert.throws(() => parseWrite("close", { numbers: [3], reason: "duplicate", note: "n" }), /`duplicate_of` is required/)
  assert.throws(() => parseWrite("close", { numbers: [3], reason: "duplicate", duplicate_of: 3, note: "n" }), /duplicate of itself/)
  assert.throws(() => parseWrite("label", { numbers: [3], add: ["bug"], remove: ["bug"], note: "n" }), /cannot be both added and removed/)
  assert.throws(() => parseWrite("comment", { numbers: [], body: "x", note: "n" }), /at least one/)
})

test("parseWrite refuses a name that cannot be a GitLab username", () => {
  // An unresolvable assignee used to be dropped server-side, so the write reported done having changed nobody.
  assert.throws(() => parseWrite("assign", { numbers: [3], add: ["Ada Lovelace"], note: "n" }), /is not a GitLab username/)
  assert.throws(() => parseWrite("assign", { numbers: [3], add: ["group/team"], note: "n" }), /is not a GitLab username/)
  assert.deepEqual(parseWrite("assign", { numbers: [3], add: ["@Ada_Lovelace", "@me"], note: "n" }).payload.add, ["Ada_Lovelace", "@me"])
  assert.deepEqual(parseWrite("label", { numbers: [3], add: ["needs: repro"], note: "n" }).payload.add, ["needs: repro"])
})

test("expand records which kind each number resolved to", () => {
  const proposal = parseWrite("close", { numbers: [7, 8], reason: "completed", note: "n" })
  const actions = expand({ ...proposal, repo: "g/p" }, {
    sessionID: "s", repo: "g/p", batch: "b", now: 1, status: "proposed",
    items: new Map([[7, { title: "Issue seven", item: "issue" as const }], [8, { title: "MR eight", item: "mr" as const }]]),
    id: () => "x",
  })
  // GitLab numbers issues and merge requests separately, so the resolved kind has to travel with the action.
  assert.deepEqual(actions.map((entry) => [entry.number, entry.item, entry.title]), [[7, "issue", "Issue seven"], [8, "mr", "MR eight"]])
  const unmatched = expand({ ...proposal, numbers: [99], repo: "g/p" }, {
    sessionID: "s", repo: "g/p", batch: "b", now: 1, status: "proposed", items: new Map(), id: () => "y",
  })
  assert.equal(unmatched[0]?.item, null)
})

test("blocker refuses a write that cannot apply", () => {
  assert.equal(blocker("close", { state: "MERGED" }, undefined), "already merged")
  assert.equal(blocker("reopen", { state: "MERGED" }, undefined), "merged; it cannot be reopened")
  assert.equal(blocker("reopen", { state: "OPEN" }, undefined), "already open")
  assert.equal(blocker("close", { state: "OPEN" }, undefined), undefined)
  assert.match(blocker("comment", undefined, undefined) ?? "", /does not exist/)
  assert.match(blocker("comment", { state: "OPEN" }, { status: "proposed" }) ?? "", /waiting for the user/)
})

test("undoFor only takes back what the action really changed", () => {
  assert.deepEqual(undoFor(action({ kind: "comment", result: { commentId: "c1" } })), { kind: "uncomment", payload: { commentId: "c1" } })
  assert.equal(undoFor(action({ kind: "comment", result: {} })), undefined)
  // Labels and assignees that were already on the item must not be removed.
  assert.deepEqual(
    undoFor(action({ kind: "label", payload: { add: ["bug", "triaged"], remove: [] }, result: { added: ["bug"], removed: [] } })),
    { kind: "label", payload: { add: [], remove: ["bug"] } },
  )
  assert.equal(undoFor(action({ kind: "label", result: { added: [], removed: [] } })), undefined)
  // A close is reversible whoever ran it; anything else from the shell only says what was asked.
  assert.deepEqual(undoFor(action({ source: "shell", kind: "close" })), { kind: "reopen", payload: {} })
  // GitLab has no duplicate-of field, so a note marks it; undo has to carry that note's id or it stays behind.
  assert.deepEqual(
    undoFor(action({ kind: "close", payload: { reason: "duplicate", duplicateOf: 4 }, result: { commentId: 99 } })),
    { kind: "reopen", payload: { commentId: 99 } },
  )
  assert.equal(undoFor(action({ source: "shell", kind: "comment", result: { commentId: "c1" } })), undefined)
  assert.equal(undoFor(action({ status: "failed" })), undefined)
  assert.equal(undoFor(action({ result: { noop: true } })), undefined)
})

test("backoff waits what GitLab asked for and gives up after three tries", () => {
  assert.equal(backoff("GitLab: too many requests (HTTP 429) retry-after: 5", 0), 5_000)
  assert.equal(backoff("GitLab: slow down (HTTP 429)", 0), 60_000)
  assert.equal(backoff("GitLab: slow down (HTTP 429)", 1), 120_000)
  assert.equal(backoff("GitLab: slow down (HTTP 429)", 3), undefined)
  assert.equal(backoff("GitLab: not found (HTTP 404)", 0), undefined)
  assert.equal(backoff("retry-after: 99999", 0), 600_000)
})

test("describe marks merge requests with ! and falls back to the command line", () => {
  assert.equal(describeAction(action({ item: "mr", kind: "close", payload: {} })), "close merge request")
  assert.equal(describeAction(action({ kind: "close", payload: { reason: "duplicate", duplicateOf: 3 } })), "close as duplicate of #3")
  assert.equal(describeAction(action({ kind: "close", payload: { reason: "not_planned" } })), "close as not planned")
  assert.equal(describeAction(action({ kind: "assign", payload: { command: "glab mr update 1 --unassign" } })), "ran `glab mr update 1 --unassign`")
  assert.equal(describeAction(action({ kind: "label", payload: { add: ["bug"] } })), "add label bug")
  assert.equal(describeAction(action({ kind: "assign", payload: { add: ["alice"] } })), "add assignee @alice")
})

test("triageProgress counts only this run's own proposals", () => {
  const actions = [
    action({ number: 1, round: 1, status: "done" }),
    action({ number: 2, round: 1, status: "proposed" }),
    action({ number: 3, round: 1, status: "skipped" }),
    action({ number: 9, status: "done" }),
    action({ number: 8, round: 1, source: "user" }),
  ]
  assert.deepEqual(triageProgress({ total: 3, reviewed: [1] }, actions), { reviewed: 3, total: 3, approved: 1, skipped: 1, waiting: 1 })
  assert.deepEqual(triageProgress({ total: 40, reviewed: [] }, []).total, 40)
})

test("counts groups approved with running", () => {
  const actions = [action({ status: "proposed" }), action({ status: "approved" }), action({ status: "running" }), action({ status: "done" }), action({ status: "failed" })]
  assert.deepEqual(counts(actions), { proposed: 1, running: 2, done: 1, failed: 1 })
})

test("parseShell records glab writes with the right kind and project", () => {
  const [close] = parseShell("glab issue close 12 -r completed")
  assert.equal(close?.group, "issue")
  assert.equal(close?.number, 12)
  assert.equal(close?.kind, "close")
  assert.equal(close?.payload.reason, "completed")

  const [note] = parseShell("glab mr note 34 -m 'looks good'")
  assert.equal(note?.group, "mr")
  assert.equal(note?.number, 34)
  assert.equal(note?.kind, "comment")

  const [byUrl] = parseShell("glab issue close https://gitlab.com/group/app/-/issues/9")
  assert.equal(byUrl?.repo, "group/app")
  assert.equal(byUrl?.number, 9)

  assert.equal(parseShell("glab issue close 5 -R other/project")[0]?.repo, "other/project")
  assert.equal(parseShell("GITLAB_REPO=env/project glab issue close 5")[0]?.repo, "env/project")
  // An explicit flag beats the environment.
  assert.equal(parseShell("GITLAB_REPO=env/project glab issue close 5 -R flag/project")[0]?.repo, "flag/project")

  assert.equal(parseShell("cd packages/app && glab issue close 5")[0]?.cd, "packages/app")
  assert.equal(parseShell("gh issue close 5").length, 0)
  assert.equal(parseShell("glab issue list").length, 0)
  assert.equal(parseShell("glab mr close $IID").length, 0)
})

test("parseShell does not let a boolean flag swallow the next one", () => {
  const [labels] = parseShell("glab issue update 12 --remove-label bug --add-label triaged")
  assert.equal(labels?.kind, "label")
  assert.deepEqual(labels?.payload.remove, ["bug"])
  assert.deepEqual(labels?.payload.add, ["triaged"])
  // `--unassign` takes no value, so the flag after it keeps its own.
  const [mixed] = parseShell("glab mr update 12 --unassign --remove-label bug")
  assert.equal(mixed?.number, 12)
  assert.match(String(mixed?.payload.command), /--remove-label bug/)
})

test("hunkRanges lists the lines a review comment may sit on", () => {
  assert.deepEqual(hunkRanges(PATCH), { LEFT: [[1, 3]], RIGHT: [[1, 4]] })
  assert.deepEqual(hunkRanges(null), { LEFT: [], RIGHT: [] })
})

test("placementError keeps a draft comment inside the diff", () => {
  const files = [file(PATCH)]
  assert.equal(placementError(files, { path: "src/app.ts", line: 2, side: "RIGHT", startLine: null }), undefined)
  assert.match(placementError(files, { path: "src/app.ts", line: 99, side: "RIGHT", startLine: null }) ?? "", /outside the diff/)
  assert.match(placementError(files, { path: "gone.ts", line: 1, side: "RIGHT", startLine: null }) ?? "", /not changed/)
  assert.match(placementError([file(PATCH, "src/app.ts", "src/old.ts")], { path: "src/old.ts", line: 1, side: "RIGHT", startLine: null }) ?? "", /renamed/)
  assert.match(placementError([file(null)], { path: "src/app.ts", line: 1, side: "RIGHT", startLine: null }) ?? "", /no diff GitLab can comment on/)
  assert.match(placementError(files, { path: "src/app.ts", line: 4, side: "RIGHT", startLine: 9 }) ?? "", /comes after/)
})

test("splitDrift moves comments whose lines left the diff into the summary", () => {
  const comments = [
    { path: "src/app.ts", line: 2, side: "RIGHT" as const, startLine: null, body: "still valid" },
    { path: "src/app.ts", line: 99, side: "RIGHT" as const, startLine: null, body: "drifted" },
  ]
  const split = splitDrift(comments, [file(PATCH)])
  assert.deepEqual(split.valid.map((comment) => comment.line), [2])
  assert.deepEqual(split.moved.map((comment) => comment.line), [99])
  assert.match(withMoved("Summary", split.moved), /no longer in the diff/)
  assert.match(withMoved("Summary", split.moved), /src\/app\.ts:99/)
  assert.equal(withMoved("Summary", []), "Summary")
})
