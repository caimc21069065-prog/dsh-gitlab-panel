import { test } from "node:test"
import assert from "node:assert/strict"
import {
  closingRefs,
  diffStats,
  findRefs,
  hunkAt,
  issueBranchName,
  issueFromBranch,
  mrFor,
  parseBranches,
  parseDecorations,
  parseGitLabLink,
  parseLog,
  parsePatch,
  parseRemote,
  parseSearchQuery,
  parseStatus,
  parseWorktrees,
  withClosing,
} from "../src/shared/core.ts"
import { cleanupCandidates } from "../src/shared/cleanup.ts"
import { layout } from "../src/shared/graph.ts"
import type { Branch } from "../src/shared/types.ts"

test("parseStatus reads branch, divergence and porcelain v2 files", () => {
  const output = [
    "# branch.oid abc123",
    "# branch.head feature/login",
    "# branch.upstream origin/feature/login",
    "# branch.ab +2 -3",
    "1 .M N... 100644 100644 100644 111 111 src/math.js",
    "2 R. N... 100644 100644 100644 111 111 R100 src/new.js",
    "src/old.js",
    "? src/untracked.js",
    "u UU N... 100644 100644 100644 100644 111 222 333 src/conflict.js",
  ].join("\0")
  const parsed = parseStatus(output)
  assert.equal(parsed.branch.branch, "feature/login")
  assert.equal(parsed.branch.upstream, "origin/feature/login")
  assert.equal(parsed.branch.ahead, 2)
  assert.equal(parsed.branch.behind, 3)
  assert.deepEqual(parsed.files.map((file) => [file.path, file.origPath, file.untracked, file.conflicted]), [
    ["src/math.js", null, false, false],
    ["src/new.js", "src/old.js", false, false],
    ["src/untracked.js", null, true, false],
    ["src/conflict.js", null, false, true],
  ])
})

test("parseLog and decorations understand branches, remotes and tags", () => {
  const raw = ["abc", "abc^", "Alice", "a@example.com", "1700000000", "Fix login", "HEAD -> refs/heads/main, refs/remotes/origin/main, tag: refs/tags/v1"].join("\x1f") + "\x1e"
  const commits = parseLog(raw)
  assert.equal(commits.length, 1)
  assert.equal(commits[0]?.subject, "Fix login")
  assert.deepEqual(commits[0]?.refs, [
    { name: "HEAD", kind: "head" },
    { name: "main", kind: "local" },
    { name: "origin/main", kind: "remote" },
    { name: "v1", kind: "tag" },
  ])
  assert.deepEqual(parseDecorations("refs/stash"), [])
})

test("parseBranches attaches worktrees and skips remote HEADs", () => {
  const line = (ref: string, head = " ") => [ref, "abc1234", "origin/main", "ahead 2, behind 1", "1700000000", "subject", head].join("\x1f")
  const output = [line("refs/heads/main", "*"), line("refs/heads/work"), line("refs/remotes/origin/main"), line("refs/remotes/origin/HEAD")].join("\n")
  const branches = parseBranches(output, new Map([["work", "C:/other"]]))
  assert.equal(branches.length, 3)
  assert.equal(branches[0]?.current, true)
  assert.equal(branches[0]?.ahead, 2)
  assert.equal(branches[1]?.worktree, "C:/other")
  assert.equal(branches[2]?.remote, true)
})

test("parseWorktrees skips prunable worktrees", () => {
  const parsed = parseWorktrees("worktree C:/repo\nbranch refs/heads/main\n\nworktree C:/gone\nbranch refs/heads/old\nprunable gitdir file points to non-existent location\n")
  assert.deepEqual([...parsed], [["main", "C:/repo"]])
})

test("parseRemote accepts GitLab https, scp-like ssh, subgroups and self-hosted ports", () => {
  assert.deepEqual(parseRemote("origin", "https://gitlab.com/group/project.git"), {
    name: "origin",
    host: "gitlab.com",
    path: "group/project",
    owner: "group",
    repo: "project",
    web: "https://gitlab.com/group/project",
    apiBase: "https://gitlab.com",
    scheme: "https",
  })
  const ssh = parseRemote("origin", "git@gitlab.example.com:team/sub/app.git")
  assert.equal(ssh?.host, "gitlab.example.com")
  assert.equal(ssh?.path, "team/sub/app")
  assert.equal(ssh?.owner, "team/sub")
  const https = parseRemote("upstream", "https://user:token@gitlab.example.com:8443/group/app.git")
  assert.equal(https?.path, "group/app")
  assert.equal(https?.scheme, "https")
})

test("parsePatch numbers lines and finds hunks", () => {
  const patch = "@@ -10,2 +10,3 @@\n context\n+added\n-removed\n"
  const lines = parsePatch(patch)
  assert.equal(lines[0]?.kind, "hunk")
  assert.equal(lines[1]?.old, 10)
  assert.equal(lines[1]?.new, 10)
  assert.equal(lines[2]?.new, 11)
  assert.equal(lines[3]?.old, 11)
  assert.deepEqual(diffStats(patch), { additions: 1, deletions: 1 })
  assert.match(hunkAt(patch, 10, "RIGHT"), /context/)
})

test("parsePatch ignores the raw git diff preamble", () => {
  const raw = [
    "diff --git a/src/app.ts b/src/app.ts",
    "index 1234567..89abcde 100644",
    "--- a/src/app.ts",
    "+++ b/src/app.ts",
    "@@ -1,2 +1,2 @@",
    " keep",
    "-old",
    "+new",
    "",
  ].join("\n")
  const lines = parsePatch(raw)
  assert.deepEqual(lines.map((line) => line.kind), ["hunk", "hunk", "context", "del", "add"])
  assert.equal(lines[0]?.text, "diff --git a/src/app.ts b/src/app.ts")
  assert.equal(lines[1]?.text, "@@ -1,2 +1,2 @@")
  // The file headers must not be counted as one deletion and one addition.
  assert.deepEqual(diffStats(raw), { additions: 1, deletions: 1 })
})

test("refs understand #issues and !merge requests", () => {
  const refs = findRefs("Fix #12 and group/sub/project!34, not a#1 or &#1;")
  assert.deepEqual(refs.map((ref) => [ref.repo, ref.kind, ref.number]), [
    [undefined, "issue", 12],
    ["group/sub/project", "mr", 34],
  ])
})

test("GitLab links resolve issues, MRs, commits and pipelines", () => {
  assert.deepEqual(parseGitLabLink("https://gitlab.com/group/app/-/merge_requests/9/diffs"), { kind: "item", repo: "group/app", number: 9, item: "mr", files: true })
  assert.deepEqual(parseGitLabLink("https://gitlab.example.com/g/p/-/issues/4"), { kind: "item", repo: "g/p", number: 4, item: "issue", files: false })
  assert.deepEqual(parseGitLabLink("https://gitlab.com/g/p/-/commit/abcdef123456"), { kind: "commit", repo: "g/p", sha: "abcdef123456" })
  assert.deepEqual(parseGitLabLink("https://gitlab.com/g/p/-/pipelines/77/jobs/88"), { kind: "run", repo: "g/p", id: 77, job: 88 })
  // Issues and merge requests number independently, so a legacy URL keeps which one it named.
  assert.deepEqual(parseGitLabLink("https://gitlab.com/g/p/merge_requests/4"), { kind: "item", repo: "g/p", number: 4, item: "mr", files: false })
})

test("branch names and closing keywords follow GitLab conventions", () => {
  assert.equal(issueBranchName(42, "Fix the login redirect!"), "42-fix-the-login-redirect")
  assert.equal(issueFromBranch("feat/123-login"), 123)
  assert.equal(issueFromBranch("fix/456"), 456)
  assert.equal(issueFromBranch("no-number"), undefined)
  assert.deepEqual(closingRefs("Fixes #12 and closes group/app#13; Resolves https://gitlab.com/g/p/-/issues/14"), [
    { repo: undefined, number: 12 },
    { repo: "group/app", number: 13 },
    { repo: "g/p", number: 14 },
  ])
  assert.equal(withClosing("Body", 7), "Body\n\nCloses #7")
  assert.equal(withClosing("Closes #", 7), "Closes #7")
})

test("search queries map GitHub-style qualifiers to GitLab parameters", () => {
  const parsed = parseSearchQuery("is:open label:bug author:@me reviewer:@me sort:updated-desc crash", "mr")
  assert.equal(parsed.params.state, "opened")
  assert.equal(parsed.params.labels, "bug")
  // `@me` stays a sentinel: GitLab's *_username params take a literal name, so the host resolves it.
  assert.equal(parsed.params.author_username, "@me")
  assert.equal(parsed.params.reviewer_username, "@me")
  assert.equal(parsed.params.order_by, "updated")
  assert.equal(parsed.params.sort, "desc")
  assert.equal(parsed.search, "crash")
  const closed = parseSearchQuery("is:closed no:assignee", "issue")
  assert.equal(closed.params.state, "closed")
  assert.equal(closed.params.assignee_id, "None")
})

test("negated and draft qualifiers do not invert into their opposite", () => {
  const negated = parseSearchQuery("-label:bug -milestone:v1 -author:@me", "issue")
  assert.equal(negated.params["not[labels]"], "bug")
  assert.equal(negated.params["not[milestone]"], "v1")
  assert.equal(negated.params.labels, undefined)
  assert.equal(negated.params.author_username, undefined)
  assert.equal(negated.search, "")
  assert.equal(parseSearchQuery("draft:false", "mr").params.wip, "no")
  assert.equal(parseSearchQuery("is:draft", "mr").params.wip, "yes")
  assert.equal(parseSearchQuery("-is:draft", "mr").params.wip, "no")
  assert.equal(parseSearchQuery("is:ready", "mr").params.wip, "no")
  assert.equal(parseSearchQuery("no:milestone", "issue").params.milestone, "None")
  // The other kind's name is dropped, never searched for literally.
  assert.equal(parseSearchQuery("is:pr", "mr").search, "")
  assert.equal(parseSearchQuery("is:issue", "mr").search, "")
})

test("graph layout keeps a first-parent lane straight through a merge", () => {
  const rows = layout([
    { hash: "a", parents: ["b", "c"] },
    { hash: "c", parents: ["b"] },
    { hash: "b", parents: [] },
  ])
  assert.equal(rows.length, 3)
  assert.equal(rows[0]?.col, 0)
  assert.ok(rows[0]?.edges.some((edge) => edge.kind === "out" && edge.to === 1))
  assert.equal(rows[2]?.col, 0)
})

test("cleanup candidates skip the current branch and flag unpushed work", () => {
  const branches: Branch[] = [
    { name: "main", remote: false, current: false, upstream: "origin/main", ahead: 0, behind: 0, gone: false, sha: "a", date: 0, subject: "" },
    { name: "feature", remote: false, current: true, upstream: "origin/feature", ahead: 0, behind: 0, gone: false, sha: "b", date: 0, subject: "" },
    { name: "merged", remote: false, current: false, upstream: null, ahead: 2, behind: 0, gone: true, sha: "c", date: 0, subject: "" },
    { name: "done", remote: false, current: false, upstream: "origin/done", ahead: 0, behind: 0, gone: false, sha: "d", date: 0, subject: "" },
  ]
  const candidates = cleanupCandidates({
    branches,
    current: "feature",
    base: "main",
    merged: ["done"],
    mrFor: (name) => (name === "done" ? { number: 5, title: "Done", state: "MERGED", draft: false, url: "", head: "done", cross: false, base: "main", author: "x", review: null, checks: "none", updated: "" } : undefined),
  })
  assert.deepEqual(candidates.map((entry) => entry.name), ["merged", "done"])
  assert.equal(candidates[0]?.risk, "unpushed")
  assert.equal(candidates[1]?.risk, null)
})

test("mrFor prefers the open MR and hides a merged one after the branch moved", () => {
  const items = [
    { number: 1, head: "feature", base: "main", state: "CLOSED", cross: false, sha: "old", url: "" },
    { number: 2, head: "feature", base: "main", state: "OPEN", cross: false, sha: "new", url: "" },
  ]
  assert.equal(mrFor({ items }, "feature", "new", "main")?.number, 2)
  const merged = [{ number: 3, head: "feature", base: "main", state: "MERGED", cross: false, sha: "old", url: "" }]
  assert.equal(mrFor({ items: merged }, "feature", "new", "main"), undefined)
  assert.equal(mrFor({ items: merged }, "feature", "old", "main")?.number, 3)
})
