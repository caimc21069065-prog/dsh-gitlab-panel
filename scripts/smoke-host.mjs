// Host API smoke test against a running dsh web server and the mock GitLab.
// Usage: node scripts/smoke-host.mjs http://127.0.0.1:3187 "<cookie>" "<repo cwd>" "<session id>"
const [base, cookie, cwd, sessionID] = process.argv.slice(2)
if (!base || !cookie || !cwd) {
  console.error("usage: node scripts/smoke-host.mjs <base> <cookie> <cwd> [sessionID]")
  process.exit(2)
}

const call = async (method, params = {}) => {
  const response = await fetch(`${base.replace(/\/$/, "")}/gitlab-panel/api`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({ method, params }),
  })
  const result = await response.json()
  if (!result.ok) throw new Error(`${method}: ${result.error}`)
  return result.value
}
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const overview = await call("overview", { cwd })
assert(overview?.remote?.path === "test/project", "overview should find the GitLab remote")
assert(overview.gitlab === null, `GitLab should be reachable: ${overview.gitlab}`)
console.log("overview", overview.branch, overview.files.length, "files", "gitlab:", overview.gitlab)

const mrs = await call("mrs", { cwd, fresh: true })
assert(mrs.items.some((item) => item.number === 1 && item.state === "OPEN"), "the open merge request is listed")
console.log("mrs", mrs.items.map((item) => `!${item.number}:${item.state}`).join(", "))

const issue = await call("item", { repo: "test/project", kind: "issue", number: 1 })
assert(issue.kind === "issue" && issue.title.includes("Safari"), "issue #1 resolves as an issue, not MR !1")
console.log("issue", issue.kind, issue.number, issue.state, "comments:", issue.comments.length)

const mr = await call("item", { repo: "test/project", kind: "mr", number: 1 })
assert(mr.kind === "mr" && mr.title.includes("login"), "MR !1 resolves as a merge request")
console.log("mr", mr.kind, mr.number, mr.state, "files:", mr.pr?.files)

const files = await call("files", { repo: "test/project", number: 1, head: mr.pr?.sha })
assert(files.length === 3 && files.some((file) => file.path === "src/auth.js"), "MR files and diffs are returned")
console.log("files", files.map((file) => `${file.path} +${file.additions} -${file.deletions}`).join(", "))

const reviews = await call("reviews", { repo: "test/project", number: 1 })
assert(reviews.threads.length > 0, "review threads are returned")
console.log("threads", reviews.threads.length, reviews.threads[0]?.path, reviews.threads[0]?.line)

const run = await call("run", { repo: "test/project", id: 9001 })
assert(run.jobs.length >= 3, "pipeline jobs are returned")
console.log("pipeline", run.run.status, run.jobs.map((job) => job.name).join(", "))

const search = await call("search", { repo: "test/project", kind: "mr", query: "is:open", cursor: null })
assert(search.items.length >= 2, "search lists open MRs")
console.log("search", search.total, "results:", search.items.map((item) => `!${item.number}`).join(", "))

const inbox = await call("inbox", { fresh: true })
assert(inbox.notifications.length > 0, "todos are returned")
console.log("inbox", inbox.notifications.length, "todos,", inbox.reviews.length, "review requests")

const worktree = await call("worktreeAdd", { cwd, branch: "panel-smoke-worktree", base: "main" })
assert(worktree?.path, "a worktree is created")
console.log("worktree", worktree.path)

if (sessionID) {
  const before = await call("agentActions", { sessionID, repo: null })
  const queued = await call("agentQueue", {
    sessionID,
    repo: "test/project",
    kind: "comment",
    itemKind: "issue",
    numbers: [1],
    body: "Kind check from the smoke test.",
  })
  assert(queued.queued.length === 1, "the comment is queued")
  const after = await call("agentActions", { sessionID, repo: null })
  const action = after.actions.at(-1)
  assert(action.item === "issue", `the queued action targets the issue, got ${action.item}`)
  assert(after.actions.length === before.actions.length + 1, "the queue grew by one action")
  console.log("queue", action.item, action.kind, action.status, action.id)
}

console.log("smoke ok")
