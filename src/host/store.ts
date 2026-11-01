import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import { homedir } from "node:os"
import { dirname, join } from "node:path"
import type { AgentQueue, CloseReason, DraftReview } from "../shared/types"

export interface PanelState {
  queues: Record<string, AgentQueue>
  reasons: Record<string, CloseReason>
  drafts: Record<string, DraftReview>
}

const EMPTY: PanelState = { queues: {}, reasons: {}, drafts: {} }
const KEEP = 500
const REASON_KEEP = 2000

/** Durable per-session queues and drafts, kept in a JSON file under the Harness home. */
export function createStore(log: (level: "debug" | "info" | "warn" | "error", message: string, data?: Record<string, unknown>) => void) {
  const home = process.env.DSH_HOME || join(homedir(), ".dsh")
  const file = join(home, "gitlab-panel", "state.json")
  let loaded: Promise<PanelState> | undefined
  let lock: Promise<unknown> = Promise.resolve()

  const read = (): Promise<PanelState> => {
    loaded ??= readFile(file, "utf8")
      .then((text) => {
        const parsed = text.trim() ? (JSON.parse(text) as Partial<PanelState>) : {}
        return {
          queues: parsed.queues && typeof parsed.queues === "object" ? parsed.queues : {},
          reasons: parsed.reasons && typeof parsed.reasons === "object" ? parsed.reasons : {},
          drafts: parsed.drafts && typeof parsed.drafts === "object" ? parsed.drafts : {},
        }
      })
      .catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") log("warn", "could not read the GitLab panel state; starting empty", { error: error.message, file })
        return { queues: {}, reasons: {}, drafts: {} }
      })
    return loaded
  }

  const write = async (state: PanelState) => {
    await mkdir(dirname(file), { recursive: true })
    const temporary = `${file}.${process.pid}.tmp`
    await writeFile(temporary, JSON.stringify(state, null, 0), { encoding: "utf8", mode: 0o600 })
    await rename(temporary, file)
  }

  const mutate = <T>(work: (state: PanelState) => T | Promise<T>): Promise<T> => {
    const next = lock.then(async () => {
      const state = await read()
      const result = await work(state)
      trim(state)
      await write(state)
      return result
    })
    lock = next.catch(() => undefined)
    return next
  }

  const trim = (state: PanelState) => {
    for (const queue of Object.values(state.queues)) {
      const finished = queue.actions.filter((action) => ["done", "failed", "skipped", "undone"].includes(action.status))
      if (finished.length <= KEEP) continue
      const drop = new Set(finished.slice(0, finished.length - KEEP).map((action) => action.id))
      queue.actions = queue.actions.filter((action) => !drop.has(action.id))
    }
    const reasons = Object.entries(state.reasons)
    if (reasons.length > REASON_KEEP) state.reasons = Object.fromEntries(reasons.slice(reasons.length - REASON_KEEP))
  }

  return {
    file,
    read,
    mutate,
    reasonOf: async (repo: string, number: number) => (await read()).reasons[`${repo}#${number}`],
    setReason: (repo: string, number: number, reason: CloseReason | undefined) =>
      mutate((state) => {
        const key = `${repo}#${number}`
        if (reason) state.reasons[key] = reason
        else delete state.reasons[key]
      }),
  }
}

export type Store = ReturnType<typeof createStore>

export const emptyState = EMPTY
