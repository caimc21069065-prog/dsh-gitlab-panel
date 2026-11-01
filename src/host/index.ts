import type { IncomingMessage, ServerResponse } from "node:http"
import { createAgent } from "./agent"
import { createGit } from "./git"
import { createGitLab } from "./gitlab"
import { createStore } from "./store"
import type { ApiResponse, Overview } from "../shared/types"

type Ctx = any

export const name = "gitlab-panel"
export const inject = ["webServer", "tools"]

export interface Config {
  /** GitLab host, such as gitlab.com or gitlab.example.com. Read from the remote when omitted. */
  host?: string
  /** Project path (group/project), when the checkout has no GitLab remote or points elsewhere. */
  project?: string
  /** GitLab base URL, such as https://gitlab.example.com. */
  apiBase?: string
  /** Personal access token with api scope. Prefer GITLAB_TOKEN or `glab auth login` over a config file. */
  token?: string
  /** Environment variable that holds the token. Defaults to GITLAB_TOKEN. */
  tokenEnv?: string
  /** The remote's default branch, when it cannot be read from refs/remotes/<remote>/HEAD. */
  defaultBranch?: string
}

const ROUTE = "/gitlab-panel"
const MAX_BODY = 32 * 1024 * 1024

export function apply(ctx: Ctx, config: Config = {}) {
  const log = (level: "debug" | "info" | "warn" | "error", message: string, data?: Record<string, unknown>) => {
    const line = `[gitlab-panel] ${message}`
    if (level === "error") console.error(line, data ?? "")
    else if (level === "warn") console.warn(line, data ?? "")
  }
  const store = createStore(log)
  const listeners = new Set<ServerResponse>()

  const broadcast = (event: Record<string, unknown>) => {
    const payload = `data: ${JSON.stringify(event)}\n\n`
    for (const response of listeners) {
      try {
        response.write(payload)
      } catch {
        listeners.delete(response)
      }
    }
  }

  const git = createGit({
    log,
    emitChanged: (event) => broadcast({ type: "changed", ...event }),
    host: config.host || process.env.GITLAB_HOST,
    project: config.project || process.env.GITLAB_PROJECT,
    apiBase: config.apiBase || process.env.GITLAB_API_BASE || process.env.GITLAB_URL,
    defaultBranch: config.defaultBranch,
  })

  const reasonCache = new Map<string, import("../shared/types").CloseReason>()
  void store.read().then((state) => {
    for (const [key, value] of Object.entries(state.reasons)) reasonCache.set(key, value)
  })
  const gitlab = createGitLab({
    log,
    config: {
      token: config.token,
      tokenEnv: config.tokenEnv,
      host: config.host || process.env.GITLAB_HOST,
      project: config.project || process.env.GITLAB_PROJECT,
      apiBase: config.apiBase || process.env.GITLAB_API_BASE || process.env.GITLAB_URL,
    },
    reasonOf: (repo, number) => reasonCache.get(`${repo}#${number}`),
    setReason: (repo, number, reason) => {
      const key = `${repo}#${number}`
      if (reason) reasonCache.set(key, reason)
      else reasonCache.delete(key)
      void store.setReason(repo, number, reason)
    },
    itemChanged: (repo, number) => broadcast({ type: "item", repo, number }),
    runChanged: (repo, id) => broadcast({ type: "run", repo, id }),
    inboxChanged: () => broadcast({ type: "inbox" }),
  })

  const agent = createAgent({ ctx, store, git, gitlab, log, emit: broadcast })

  const overview = async (params: { cwd: string }): Promise<Overview | null> => {
    const result = await git.overview(params)
    if (!result) return null
    if (!result.remote) {
      result.gitlab = "No GitLab remote found for this repository. Add one, or set GITLAB_PROJECT."
      return result
    }
    gitlab.rememberRemote(result.remote)
    try {
      await gitlab.viewer(result.remote)
      result.gitlab = null
    } catch (error) {
      result.gitlab = error instanceof Error ? error.message : String(error)
    }
    return result
  }

  const withRemote = async (cwd: string) => {
    const remote = await git.remote(cwd)
    if (remote) gitlab.rememberRemote(remote)
    return remote
  }

  const api: Record<string, (params: any) => Promise<unknown>> = {
    ...(agent.methods as unknown as Record<string, (params: any) => Promise<unknown>>),
    overview,
    mrs: async ({ cwd, fresh }) => {
      const remote = await withRemote(cwd)
      const branch = await git.currentBranch(cwd).catch(() => null)
      return gitlab.mrs({ cwd, fresh, branch }, remote)
    },
    branchMrs: async ({ cwd, names, fresh }) => {
      const remote = await withRemote(cwd)
      return gitlab.branchMrs({ names }, remote)
    },
    createIssue: async ({ cwd, title, body }) => {
      const remote = await withRemote(cwd)
      if (!remote) throw new Error("No GitLab remote found for this repository.")
      return gitlab.createIssue({ remote, title, body })
    },
    createMr: async ({ cwd, title, body, base, draft }) => {
      const remote = await withRemote(cwd)
      if (!remote) throw new Error("No GitLab remote found for this repository.")
      const source = await git.ensurePushed(cwd)
      const url = await gitlab.createMergeRequest({ repo: remote.path, source, title, body, base, draft, removeSource: false })
      broadcast({ type: "changed", cwd, remote: true })
      return url
    },
    checkoutMr: async ({ cwd, repo, number }) => {
      const item = await gitlab.item({ repo, number, kind: "mr" })
      if (!item.pr) throw new Error(`${repo}!${number} is not a merge request.`)
      const output = await git.checkoutMrs({ cwd, mr: { number, head: item.pr.head } })
      broadcast({ type: "changed", cwd, remote: true })
      return output
    },
    mergeMr: async ({ repo, number, squash, deleteBranch }) => {
      const result = await gitlab.mergeMr({ repo, number, squash, deleteBranch })
      broadcast({ type: "item", repo, number, state: "MERGED" })
      return result
    },
    inbox: async ({ fresh }) => {
      try {
        return await gitlab.inbox({ fresh })
      } catch (error) {
        return { error: error instanceof Error ? error.message : String(error), notifications: [], reviews: [], assigned: [], authored: [] }
      }
    },
    reasonOf: async ({ repo, number }) => store.reasonOf(repo, number),
  }

  // Only the panel's own snapshot of methods is reachable: internal helpers (raw requests, queue primitives) stay inside.
  const gitMethods = [
    "log", "show", "branches", "mergedBranches", "outgoing", "diff", "mrDefaults", "stage", "unstage", "discard",
    "commit", "checkout", "createBranch", "deleteBranch", "deleteBranches", "undoCommit", "deleteRemoteBranch", "merge",
    "rebase", "cherryPick", "revert", "abort", "continue", "fetch", "pull", "push", "pushBranch", "stash", "stashPop",
    "worktreeAdd",
  ] as const
  for (const method of gitMethods) api[method] = (params) => (git as any)[method](params)
  const gitlabMethods = [
    "search", "mrChecks", "item", "comment", "setState", "edit", "setDraft", "repoMeta", "remoteCommit", "files",
    "reviews", "submitReview", "replyThread", "resolveThread", "lineComment", "createReview", "runs", "run", "jobLog",
    "rerun", "cancelRun", "retryJob", "cancelJob", "markRead",
  ] as const
  for (const method of gitlabMethods) api[method] = (params) => (gitlab as any)[method](params)

  const allowed = new Set(Object.keys(api))

  const reject = (req: IncomingMessage, res: ServerResponse) => {
    const connection = ctx.get?.("connection")
    if (!connection?.requestRejection) return false
    const status = connection.requestRejection(req)
    if (status === undefined) return false
    res.statusCode = status
    res.end()
    return true
  }

  const sendJson = (res: ServerResponse, status: number, value: unknown) => {
    res.statusCode = status
    res.setHeader("content-type", "application/json; charset=utf-8")
    res.setHeader("cache-control", "no-store")
    res.end(JSON.stringify(value))
  }

  const readBody = (req: IncomingMessage) =>
    new Promise<string>((resolve, rejectBody) => {
      let size = 0
      const chunks: Buffer[] = []
      req.on("data", (chunk: Buffer) => {
        size += chunk.length
        if (size > MAX_BODY) {
          rejectBody(new Error("Request body is too large."))
          req.destroy()
          return
        }
        chunks.push(chunk)
      })
      req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")))
      req.on("error", rejectBody)
    })

  const handler = async (req: IncomingMessage, res: ServerResponse) => {
    if (reject(req, res)) return
    const url = new URL(req.url ?? "/", "http://localhost")
    const path = url.pathname.replace(/\/+$/, "")

    if (path === `${ROUTE}/events` || path === `${ROUTE}/events/`) {
      if (req.method !== "GET") return sendJson(res, 405, { error: "GET only." })
      res.statusCode = 200
      res.setHeader("content-type", "text/event-stream; charset=utf-8")
      res.setHeader("cache-control", "no-cache, no-transform")
      res.setHeader("connection", "keep-alive")
      res.setHeader("x-accel-buffering", "no")
      res.write(`data: ${JSON.stringify({ type: "hello", version: 1 })}\n\n`)
      listeners.add(res)
      const keep = setInterval(() => {
        try {
          res.write(": keepalive\n\n")
        } catch {
          clearInterval(keep)
          listeners.delete(res)
        }
      }, 20_000)
      const close = () => {
        clearInterval(keep)
        listeners.delete(res)
      }
      req.on("close", close)
      req.on("error", close)
      return
    }

    if (path === `${ROUTE}/status`) {
      return sendJson(res, 200, { ok: true, plugin: name, version: 1, methods: [...allowed].length })
    }

    if (path !== `${ROUTE}/api`) return sendJson(res, 404, { error: "Not found." })
    if (req.method !== "POST") return sendJson(res, 405, { error: "POST only." })
    if (!/^application\/json\b/i.test(String(req.headers["content-type"] ?? ""))) return sendJson(res, 415, { error: "Content-Type must be application/json." })

    let body: { method?: unknown; params?: unknown }
    try {
      body = JSON.parse(await readBody(req)) as typeof body
    } catch (error) {
      return sendJson(res, 400, { error: error instanceof Error ? error.message : "Invalid JSON." })
    }
    const method = typeof body.method === "string" ? body.method : ""
    if (!allowed.has(method)) return sendJson(res, 404, { error: `Unknown method "${method}".` })
    const params = body.params && typeof body.params === "object" && !Array.isArray(body.params) ? (body.params as Record<string, unknown>) : {}
    try {
      const value = await api[method]?.(params)
      return sendJson(res, 200, { ok: true, value } satisfies ApiResponse)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      log("warn", `${method} failed`, { error: message })
      return sendJson(res, 200, { ok: false, error: message } satisfies ApiResponse)
    }
  }

  ctx.effect(() => ctx.webServer.register({ kind: "prefix", path: ROUTE, handler }), "gitlab-panel: API route")
  ctx.effect(() => {
    const stop = agent.start()
    return () => {
      stop()
      for (const response of listeners) {
        try {
          response.end()
        } catch {
          // The connection is already gone.
        }
      }
      listeners.clear()
    }
  }, "gitlab-panel: agent tools")

  log("info", "loaded", { route: ROUTE, state: store.file })
}

export default { name, inject, apply }
