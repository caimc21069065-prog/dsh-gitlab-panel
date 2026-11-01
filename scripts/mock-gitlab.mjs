// A small GitLab API v4 fixture for developing the panel without a real GitLab instance.
// Start it with: node scripts/mock-gitlab.mjs (default port 4199), then boot dsh with
// GITLAB_API_BASE=http://127.0.0.1:4199 GITLAB_PROJECT=test/project GITLAB_TOKEN=mock
import { createServer } from "node:http"

const PORT = Number(process.env.MOCK_GITLAB_PORT ?? 4199)
const PROJECT = "test/project"
const BASE = `http://127.0.0.1:${PORT}`

const user = { id: 1, username: "tester", name: "Test User", avatar_url: null }
const other = { id: 2, username: "alice", name: "Alice" }
const labels = [
  { id: 1, name: "bug", color: "#e5484d", description: "Something is broken" },
  { id: 2, name: "enhancement", color: "#4b5bd7", description: "New feature" },
  { id: 3, name: "docs", color: "#2f9e44", description: "Documentation" },
  { id: 4, name: "duplicate", color: "#8b8d98", description: "Already reported" },
  { id: 5, name: "needs-info", color: "#f76b15", description: "Waiting for the reporter" },
]

const mrBase = {
  project_id: 101,
  target_project_id: 101,
  source_project_id: 101,
  target_branch: "main",
  author: other,
  reviewers: [user],
  assignees: [user],
  labels: ["bug"],
  milestone: { id: 1, title: "v1.0" },
  user_notes_count: 3,
  web_url: `${BASE}/${PROJECT}/-/merge_requests/1`,
  created_at: "2026-10-20T09:00:00Z",
  updated_at: "2026-10-31T11:30:00Z",
  diff_refs: {
    base_sha: "aaa1111111111111111111111111111111111111",
    start_sha: "aaa1111111111111111111111111111111111111",
    head_sha: "78604b85595be030723c3a3303537e2a68b2706e",
  },
}

const mrs = [
  {
    ...mrBase,
    id: 1001,
    iid: 1,
    title: "Fix login redirect",
    description: "Fixes the redirect after login.\n\n## Changes\n- return the redirect target\n- cover the Safari edge case\n\nCloses #1",
    state: "opened",
    draft: false,
    source_branch: "feature/login",
    sha: "78604b85595be030723c3a3303537e2a68b2706e",
    changes_count: "3",
    detailed_merge_status: "mergeable",
    merge_status: "can_be_merged",
    head_pipeline: { id: 9001, name: "Pipeline for feature/login", status: "success", web_url: `${BASE}/${PROJECT}/-/pipelines/9001` },
  },
  {
    ...mrBase,
    id: 1002,
    iid: 2,
    title: "Document the API",
    description: "Adds an API section to the README.",
    state: "opened",
    draft: true,
    source_branch: "docs/api",
    target_branch: "main",
    labels: ["docs"],
    reviewers: [other],
    assignees: [],
    web_url: `${BASE}/${PROJECT}/-/merge_requests/2`,
    sha: "6ecb93a000000000000000000000000000000000",
    detailed_merge_status: "checking",
    merge_status: "checking",
    head_pipeline: { id: 9002, name: "Pipeline for docs/api", status: "running", web_url: `${BASE}/${PROJECT}/-/pipelines/9002` },
    diff_refs: {
      base_sha: "aaa1111111111111111111111111111111111111",
      start_sha: "aaa1111111111111111111111111111111111111",
      head_sha: "6ecb93a000000000000000000000000000000000",
    },
  },
  {
    ...mrBase,
    id: 1003,
    iid: 3,
    title: "Merge feature toggle",
    description: "Brings the toggle in.",
    state: "merged",
    draft: false,
    source_branch: "merged-work",
    labels: ["enhancement"],
    assignees: [],
    web_url: `${BASE}/${PROJECT}/-/merge_requests/3`,
    sha: "6ecb93a000000000000000000000000000000001",
    head_pipeline: { id: 9003, name: "Pipeline for merged-work", status: "success", web_url: `${BASE}/${PROJECT}/-/pipelines/9003` },
    updated_at: "2026-10-14T10:00:00Z",
  },
]

const issues = [
  {
    id: 2001,
    iid: 1,
    project_id: 101,
    title: "Login fails on Safari",
    description: "On Safari 18, login redirects to a blank page.\n\n### Steps\n1. Open `/login`\n2. Sign in\n3. See the browser stay blank\n\n`window.location` looks wrong.",
    state: "opened",
    labels: ["bug"],
    assignees: [user],
    author: other,
    milestone: { id: 1, title: "v1.0" },
    user_notes_count: 2,
    web_url: `${BASE}/${PROJECT}/-/issues/1`,
    created_at: "2026-10-18T08:00:00Z",
    updated_at: "2026-10-30T16:20:00Z",
  },
  {
    id: 2002,
    iid: 2,
    project_id: 101,
    title: "Add dark mode",
    description: "Please add a dark theme.",
    state: "opened",
    labels: ["enhancement"],
    assignees: [],
    author: user,
    milestone: null,
    user_notes_count: 1,
    web_url: `${BASE}/${PROJECT}/-/issues/2`,
    created_at: "2026-10-21T12:00:00Z",
    updated_at: "2026-10-29T09:10:00Z",
  },
  {
    id: 2003,
    iid: 3,
    project_id: 101,
    title: "Docs typo in README",
    description: "teh -> the",
    state: "closed",
    labels: ["docs"],
    assignees: [other],
    author: other,
    milestone: null,
    user_notes_count: 0,
    web_url: `${BASE}/${PROJECT}/-/issues/3`,
    created_at: "2026-10-02T12:00:00Z",
    updated_at: "2026-10-03T09:10:00Z",
  },
]

const notesFor = (iid, diff = false) => [
  {
    id: 5000 + iid * 10,
    body: "Thanks for the report! I can reproduce this on Safari.",
    author: user,
    created_at: "2026-10-29T10:00:00Z",
    system: false,
    position: diff
      ? { new_path: "src/math.js", old_path: "src/math.js", new_line: 2, head_sha: "78604b85595be030723c3a3303537e2a68b2706e" }
      : null,
    resolvable: diff,
    resolved: false,
  },
  {
    id: 5001 + iid * 10,
    body: "Pushed a fix in `feature/login`.",
    author: other,
    created_at: "2026-10-30T15:00:00Z",
    system: false,
    position: null,
  },
  {
    id: 5002 + iid * 10,
    body: "mentioned in commit abc123",
    author: other,
    created_at: "2026-10-30T15:01:00Z",
    system: true,
    position: null,
  },
]

const changes1 = [
  {
    old_path: "README.md",
    new_path: "README.md",
    new_file: false,
    renamed_file: false,
    deleted_file: false,
    diff: "@@ -1,3 +1,7 @@\n # Demo\n \n-A fixture repository for the GitLab panel.\n+A fixture repository for the GitLab panel.\n+\n+## Login\n+\n+The login flow now redirects back to the page you came from.\n",
  },
  {
    old_path: "src/math.js",
    new_path: "src/math.js",
    new_file: false,
    renamed_file: false,
    deleted_file: false,
    diff: "@@ -1,3 +1,7 @@\n export function add(a, b) {\n   return a + b\n }\n+\n+export function sub(a, b) {\n+  return a - b\n+}\n",
  },
  {
    old_path: "src/auth.js",
    new_path: "src/auth.js",
    new_file: true,
    renamed_file: false,
    deleted_file: false,
    diff: "@@ -0,0 +1,3 @@\n+export function login(user) {\n+  return { user, token: \"demo\" }\n+}\n",
  },
]

const changes2 = [
  {
    old_path: "README.md",
    new_path: "README.md",
    new_file: false,
    renamed_file: false,
    deleted_file: false,
    diff: "@@ -1,3 +1,10 @@\n # Demo\n \n A fixture repository for the GitLab panel.\n+\n+## API\n+\n+`POST /login` returns a token.\n",
  },
]

const jobs = {
  9001: [
    { id: 9101, name: "lint", stage: "test", status: "success", started_at: "2026-10-31T11:21:00Z", finished_at: "2026-10-31T11:21:30Z", allow_failure: false },
    { id: 9102, name: "test", stage: "test", status: "success", started_at: "2026-10-31T11:22:00Z", finished_at: "2026-10-31T11:24:10Z", allow_failure: false },
    { id: 9103, name: "build", stage: "build", status: "success", started_at: "2026-10-31T11:24:20Z", finished_at: "2026-10-31T11:25:00Z", allow_failure: false },
    { id: 9104, name: "deploy", stage: "deploy", status: "skipped", allow_failure: false },
  ],
  9002: [
    { id: 9201, name: "lint", stage: "test", status: "success", allow_failure: false },
    { id: 9202, name: "test", stage: "test", status: "running", allow_failure: false },
  ],
  9003: [{ id: 9301, name: "test", stage: "test", status: "success", allow_failure: false }],
}

const trace = (job) =>
  [
    `Running with gitlab-runner 17.2.0`,
    `Preparing the docker executor`,
    `Using docker image sha256:...`,
    `$ npm test`,
    job === 9102 ? "✓ add(1, 2) === 3" : "✓ lint",
    job === 9102 ? "✓ returns 1" : "",
    "Cleaning up project directory and file based variables",
    "Job succeeded",
  ].filter(Boolean).join("\n")

const discussions = [
  {
    id: "d1",
    notes: [
      {
        id: 6001,
        body: "Could this return the redirect target instead?",
        author: user,
        created_at: "2026-10-30T14:00:00Z",
        system: false,
        resolvable: true,
        resolved: false,
        position: { new_path: "src/math.js", old_path: "src/math.js", new_line: 2, old_line: 2, head_sha: "78604b85595be030723c3a3303537e2a68b2706e" },
      },
      {
        id: 6002,
        body: "Good point, done in the next commit.",
        author: other,
        created_at: "2026-10-30T15:00:00Z",
        system: false,
        resolvable: true,
        resolved: false,
        position: { new_path: "src/math.js", old_path: "src/math.js", new_line: 2, old_line: 2, head_sha: "78604b85595be030723c3a3303537e2a68b2706e" },
      },
    ],
  },
  {
    id: "d2",
    notes: [{ id: 6003, body: "Approving, tests pass locally.", author: user, created_at: "2026-10-30T16:00:00Z", system: false }],
  },
]

const todos = [
  { id: 7001, project: { id: 101, path_with_namespace: PROJECT, web_url: `${BASE}/${PROJECT}` }, target: { id: 1001, iid: 1, project_id: 101, title: "Fix login redirect", target_type: "MergeRequest" }, action_name: "review_requested", updated_at: "2026-10-31T11:30:00Z", state: "pending" },
  { id: 7002, project: { id: 101, path_with_namespace: PROJECT, web_url: `${BASE}/${PROJECT}` }, target: { id: 2001, iid: 1, project_id: 101, title: "Login fails on Safari", target_type: "Issue" }, action_name: "assigned", updated_at: "2026-10-30T16:20:00Z", state: "pending" },
]

const now = () => new Date().toISOString()

function send(res, status, body, extra = {}) {
  const text = typeof body === "string" ? body : JSON.stringify(body)
  res.writeHead(status, {
    "content-type": typeof body === "string" ? "text/plain; charset=utf-8" : "application/json",
    "access-control-allow-origin": "*",
    ...extra,
  })
  res.end(text)
}

function pageHeaders(res, list, page, perPage) {
  const total = list.length
  const next = page * perPage < total ? String(page + 1) : ""
  res.setHeader("x-total", String(total))
  res.setHeader("x-page", String(page))
  res.setHeader("x-next-page", next)
  res.setHeader("x-per-page", String(perPage))
}

function paginate(list, url) {
  const page = Number(url.searchParams.get("page") ?? 1)
  const per = Number(url.searchParams.get("per_page") ?? 20)
  return { page, per, slice: list.slice((page - 1) * per, page * per) }
}

function toListMr(mr) {
  return {
    ...mr,
    references: { short: `!${mr.iid}`, full: `${PROJECT}!${mr.iid}` },
  }
}

function toListIssue(issue) {
  return { ...issue, references: { short: `#${issue.iid}`, full: `${PROJECT}#${issue.iid}` } }
}

function filterByState(list, state) {
  if (!state || state === "all") return list
  if (state === "opened") return list.filter((item) => item.state === "opened")
  return list.filter((item) => item.state === state)
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", BASE)
  if (req.method === "OPTIONS") return send(res, 204, "", { "access-control-allow-methods": "GET,POST,PUT,DELETE", "access-control-allow-headers": "PRIVATE-TOKEN,CONTENT-TYPE" })
  if (url.pathname === "/api/v4/user") return send(res, 200, user)
  if (url.pathname === "/api/v4/todos") {
    const pending = url.pathname.endsWith("mark_as_done") ? [] : todos
    return send(res, 200, pending)
  }
  if (url.pathname === "/api/v4/todos/mark_as_done") return send(res, 200, {})
  if (url.pathname.startsWith("/api/v4/todos/")) return send(res, 200, {})
  if (url.pathname === "/api/v4/projects" && req.method === "GET") return send(res, 200, [])
  const project = `/api/v4/projects/${encodeURIComponent(PROJECT)}`
  if (!url.pathname.startsWith(project)) return send(res, 404, { message: "404 Project Not Found" })
  const path = url.pathname.slice(project.length) || "/"

  let body = ""
  for await (const chunk of req) body += chunk
  let payload = {}
  try {
    payload = body ? JSON.parse(body) : {}
  } catch {
    payload = {}
  }

  if (path === "" || path === "/") return send(res, 200, { id: 101, path_with_namespace: PROJECT, default_branch: "main", web_url: `${BASE}/${PROJECT}` })
  if (path === "/merge_requests" || path === "/merge_requests/") {
    let list = filterByState(mrs, url.searchParams.get("state"))
    const branch = url.searchParams.get("source_branch")
    if (branch) list = list.filter((mr) => mr.source_branch === branch)
    const author = url.searchParams.get("author_username")
    if (author && author !== "me") list = list.filter((mr) => mr.author.username === author)
    const reviewer = url.searchParams.get("reviewer_username")
    if (reviewer) list = list.filter((mr) => (mr.reviewers ?? []).some((entry) => entry.username === reviewer || (reviewer === "me" && entry.username === "tester")))
    const search = (url.searchParams.get("search") ?? "").toLowerCase()
    if (search) list = list.filter((mr) => mr.title.toLowerCase().includes(search) || mr.description.toLowerCase().includes(search))
    const { page, per, slice } = paginate(list, url)
    pageHeaders(res, list, page, per)
    return send(res, 200, slice.map(toListMr))
  }
  const mrMatch = /^\/merge_requests\/(\d+)(\/.*)?$/.exec(path)
  if (mrMatch) {
    const iid = Number(mrMatch[1])
    const mr = mrs.find((entry) => entry.iid === iid)
    if (!mr) return send(res, 404, { message: `404 Not found` })
    const sub = mrMatch[2] ?? ""
    if (sub === "") {
      if (req.method === "PUT") {
        if (payload.state_event === "close") mr.state = "closed"
        if (payload.state_event === "reopen") mr.state = "opened"
        if (typeof payload.title === "string") mr.title = payload.title
        if (typeof payload.description === "string") mr.description = payload.description
        if (typeof payload.labels === "string") mr.labels = payload.labels.split(",").filter(Boolean)
        return send(res, 200, toListMr(mr))
      }
      return send(res, 200, toListMr(mr))
    }
    if (sub === "/approvals") return send(res, 200, { approvals_required: 1, approvals_left: mr.iid === 1 ? 0 : 1, approved_by: mr.iid === 1 ? [{ user }] : [], approvals: [{ approved_by: mr.iid === 1 ? [{ user }] : [] }] })
    if (sub === "/approve" || sub === "/unapprove") return send(res, 200, {})
    if (sub === "/changes") {
      const changes = mr.iid === 1 ? changes1 : mr.iid === 2 ? changes2 : []
      return send(res, 200, { ...mr, changes })
    }
    if (sub === "/notes") {
      if (req.method === "POST") {
        const note = { id: 8000 + Math.floor(Math.random() * 1000), body: payload.body ?? "", author: user, created_at: now(), system: false }
        return send(res, 201, note)
      }
      const diff = url.searchParams.get("diff") === "true"
      let notes = notesFor(iid, diff)
      if (url.searchParams.get("sort") === "asc") notes = notes.slice()
      // Distinguish issues and MRs by a query the real API does not need; both fixtures can share the notes.
      return send(res, 200, notes)
    }
    if (sub === "/discussions") {
      if (req.method === "POST") {
        const discussion = { id: `d${Date.now()}`, notes: [{ id: 6100 + Date.now() % 1000, body: payload.body ?? "", author: user, created_at: now(), position: payload.position ?? null, resolvable: !!payload.position }] }
        return send(res, 201, discussion)
      }
      return send(res, 200, discussions)
    }
    const discussionMatch = /^\/discussions\/([^/]+)(\/notes)?$/.exec(sub)
    if (discussionMatch) {
      if (discussionMatch[2]) {
        return send(res, 201, { id: 6200, body: payload.body ?? "", author: user, created_at: now() })
      }
      return send(res, 200, { id: discussionMatch[1], resolved: !!payload.resolved })
    }
    if (sub === "/merge") {
      mr.state = "merged"
      return send(res, 200, { ...toListMr(mr), state: "merged" })
    }
    if (sub === "/closes_issues") return send(res, 200, [toListIssue(issues[0])])
    if (sub === "/related_merge_requests") return send(res, 200, [])
    if (sub === "/pipelines") return send(res, 200, [{ id: mr.head_pipeline?.id, status: mr.head_pipeline?.status, ref: mr.source_branch }])
    return send(res, 404, { message: "404 Not Found" })
  }

  if (path === "/issues" || path === "/issues/") {
    let list = filterByState(issues, url.searchParams.get("state"))
    const search = (url.searchParams.get("search") ?? "").toLowerCase()
    if (search) list = list.filter((issue) => issue.title.toLowerCase().includes(search) || issue.description.toLowerCase().includes(search))
    const labelsFilter = url.searchParams.get("labels")
    if (labelsFilter) list = list.filter((issue) => issue.labels.includes(labelsFilter))
    const { page, per, slice } = paginate(list, url)
    pageHeaders(res, list, page, per)
    return send(res, 200, slice.map(toListIssue))
  }
  const issueMatch = /^\/issues\/(\d+)(\/.*)?$/.exec(path)
  if (issueMatch) {
    const iid = Number(issueMatch[1])
    const issue = issues.find((entry) => entry.iid === iid)
    if (!issue) return send(res, 404, { message: "404 Not found" })
    const sub = issueMatch[2] ?? ""
    if (sub === "") {
      if (req.method === "PUT") {
        if (payload.state_event === "close") issue.state = "closed"
        if (payload.state_event === "reopen") issue.state = "opened"
        if (typeof payload.title === "string") issue.title = payload.title
        if (typeof payload.description === "string") issue.description = payload.description
        if (typeof payload.labels === "string") issue.labels = payload.labels.split(",").filter(Boolean)
        return send(res, 200, toListIssue(issue))
      }
      return send(res, 200, toListIssue(issue))
    }
    if (sub === "/notes") {
      if (req.method === "POST") return send(res, 201, { id: 8100, body: payload.body ?? "", author: user, created_at: now(), system: false })
      return send(res, 200, notesFor(iid, false))
    }
    if (sub === "/related_merge_requests") return send(res, 200, [{ iid: 1, title: "Fix login redirect", web_url: `${BASE}/${PROJECT}/-/merge_requests/1` }])
    return send(res, 404, { message: "404 Not Found" })
  }

  if (path === "/labels") return send(res, 200, labels)
  if (path === "/members/all") return send(res, 200, [user, other])
  if (path === "/milestones") return send(res, 200, [{ id: 1, title: "v1.0" }])
  if (path === "/pipelines") {
    const ref = url.searchParams.get("ref")
    const list = [
      { id: 9002, name: "Pipeline for docs/api", status: "running", ref: "docs/api", sha: "6ecb93a000000000000000000000000000000000", source: "push", created_at: "2026-10-31T11:00:00Z", web_url: `${BASE}/${PROJECT}/-/pipelines/9002` },
      { id: 9001, name: "Pipeline for feature/login", status: "success", ref: "feature/login", sha: "78604b85595be030723c3a3303537e2a68b2706e", source: "push", created_at: "2026-10-31T11:20:00Z", web_url: `${BASE}/${PROJECT}/-/pipelines/9001` },
      { id: 9003, name: "Pipeline for merged-work", status: "success", ref: "merged-work", sha: "6ecb93a000000000000000000000000000000001", source: "merge_request_event", created_at: "2026-10-14T09:00:00Z", web_url: `${BASE}/${PROJECT}/-/pipelines/9003` },
    ].filter((pipeline) => !ref || pipeline.ref === ref)
    return send(res, 200, list)
  }
  const pipelineMatch = /^\/pipelines\/(\d+)(\/.*)?$/.exec(path)
  if (pipelineMatch) {
    const id = Number(pipelineMatch[1])
    const meta = { 9001: ["success", "feature/login"], 9002: ["running", "docs/api"], 9003: ["success", "merged-work"] }[id] ?? ["success", "main"]
    if (pipelineMatch[2] === "/jobs") {
      const list = (jobs[id] ?? []).map((job) => ({ ...job, web_url: `${BASE}/${PROJECT}/-/jobs/${job.id}`, pipeline: { id } }))
      const { page, per, slice } = paginate(list, url)
      pageHeaders(res, list, page, per)
      return send(res, 200, slice)
    }
    if (pipelineMatch[2] === "/retry" || pipelineMatch[2] === "/cancel") return send(res, 200, { id, status: "running" })
    return send(res, 200, { id, name: `Pipeline #${id}`, status: meta[0], ref: meta[1], sha: "78604b85595be030723c3a3303537e2a68b2706e", source: "push", created_at: "2026-10-31T11:20:00Z", web_url: `${BASE}/${PROJECT}/-/pipelines/${id}` })
  }
  const jobMatch = /^\/jobs\/(\d+)(\/.*)?$/.exec(path)
  if (jobMatch) {
    const id = Number(jobMatch[1])
    const job = Object.values(jobs).flat().find((entry) => entry.id === id) ?? { id, name: "job", status: "success" }
    if (jobMatch[2] === "/trace") return send(res, 200, trace(id), { "content-type": "text/plain" })
    if (jobMatch[2] === "/retry" || jobMatch[2] === "/cancel") return send(res, 200, {})
    return send(res, 200, { ...job, web_url: `${BASE}/${PROJECT}/-/jobs/${id}` })
  }
  const commitMatch = /^\/repository\/commits\/([^/]+)(\/diff)?$/.exec(path)
  if (commitMatch) {
    if (commitMatch[2]) return send(res, 200, changes1)
    return send(res, 200, {
      id: commitMatch[1],
      short_id: commitMatch[1].slice(0, 8),
      title: "Fix login redirect",
      message: "Fix login redirect\n\nReturn the redirect target.",
      author_name: "Alice",
      created_at: "2026-10-30T10:00:00Z",
      parent_ids: ["aaa1111111111111111111111111111111111111"],
      web_url: `${BASE}/${PROJECT}/-/commit/${commitMatch[1]}`,
    })
  }
  return send(res, 404, { message: `404 Not Found: ${path}` })
})

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[mock-gitlab] listening on ${BASE}`)
})
