import { spawn, type ChildProcess } from "node:child_process"
import { existsSync } from "node:fs"
import { delimiter } from "node:path"

const TIMEOUT = 5 * 60_000
const MAX_OUTPUT = 64 * 1024 * 1024

export type Log = (level: "debug" | "info" | "warn" | "error", message: string, data?: Record<string, unknown>) => void

/** The GUI process can miss Homebrew's directories; the harness itself usually has a full PATH. */
export function environment(): NodeJS.ProcessEnv {
  const extra = ["/opt/homebrew/bin", "/usr/local/bin", "/usr/bin", "/bin"]
  const path = [...(process.env.PATH ?? "").split(delimiter), ...extra].filter((item, index, all) => item && all.indexOf(item) === index)
  return {
    ...process.env,
    PATH: path.join(delimiter),
    GIT_TERMINAL_PROMPT: "0",
    GIT_EDITOR: "true",
    GIT_SEQUENCE_EDITOR: "true",
    GIT_MERGE_AUTOEDIT: "no",
    GIT_OPTIONAL_LOCKS: "0",
    GIT_PAGER: "cat",
    GH_PROMPT_DISABLED: "1",
    GLAB_NO_PROMPT: "1",
    NO_COLOR: "1",
    LANG: "C",
    LC_ALL: "C",
  }
}

export interface RunOptions {
  signal?: AbortSignal
  ok?: (code: number) => boolean
  quiet?: boolean
  env?: Record<string, string>
  input?: string
  timeout?: number
}

/** Runs one command with bounded output, an abort signal and a hard timeout. */
export function run(command: string, args: readonly string[], cwd: string, options: RunOptions = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: options.env ? { ...environment(), ...options.env } : environment(),
      stdio: [options.input === undefined ? "ignore" : "pipe", "pipe", "pipe"],
      windowsHide: true,
      detached: process.platform !== "win32",
    })
    const stdout: Buffer[] = []
    const stderr: Buffer[] = []
    const state = { size: 0, stopped: "", settled: false }
    const stop = (reason: string) => {
      if (state.stopped) return
      state.stopped = reason
      kill(child)
    }
    const limit = options.timeout ?? TIMEOUT
    const timer = setTimeout(() => stop(`\`${command} ${args[0]}\` did not finish within ${Math.round(limit / 60_000)} minutes.`), limit)
    const abort = () => stop("Cancelled.")
    options.signal?.addEventListener("abort", abort, { once: true })
    if (options.signal?.aborted) abort()
    const collect = (into: Buffer[]) => (chunk: Buffer) => {
      state.size += chunk.length
      if (state.size > MAX_OUTPUT) return stop(`\`${command} ${args[0]}\` printed more than ${MAX_OUTPUT / 1024 / 1024} MB.`)
      into.push(chunk)
    }
    child.stdin?.on("error", () => undefined)
    child.stdin?.end(options.input)
    child.stdout?.on("data", collect(stdout))
    child.stderr?.on("data", collect(stderr))
    const finish = (code: number | null, error?: NodeJS.ErrnoException) => {
      if (state.settled) return
      state.settled = true
      clearTimeout(timer)
      options.signal?.removeEventListener("abort", abort)
      const out = Buffer.concat(stdout).toString("utf8")
      if (!error && !state.stopped && code !== null && (options.ok ?? ((value) => value === 0))(code)) return resolve(out)
      const output = Buffer.concat(stderr).toString("utf8").trim() || out.trim()
      const message =
        state.stopped ||
        (error ? spawnError(command, cwd, error) : "") ||
        (output.length > 4000 ? `${output.slice(0, 4000)}\n…` : output) ||
        `\`${command} ${args[0]}\` failed with exit code ${code}.`
      if (!options.signal?.aborted) reject(new Error(message))
      else reject(new Error("Cancelled."))
    }
    child.on("error", (error) => finish(null, error))
    child.on("close", (code) => finish(code))
  })
}

function kill(child: ChildProcess) {
  if (child.pid === undefined || child.exitCode !== null || child.signalCode !== null) return
  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true }).on("error", () => child.kill())
    return
  }
  try {
    process.kill(-child.pid, "SIGTERM")
  } catch {
    child.kill("SIGTERM")
  }
}

function spawnError(command: string, cwd: string, error: NodeJS.ErrnoException) {
  if (error.code === "ENOENT" && !existsSync(cwd)) return `The directory ${cwd} does not exist.`
  if (error.code === "ENOENT") return `${command} is not installed or not on PATH.`
  return error.message
}

/** A ref, branch or commit as an argument: one starting with `-` would be read as an option. */
export function arg(value: string) {
  if (!value || value.startsWith("-")) throw new Error(`"${value}" is not a valid name.`)
  return value
}

/** A path from `git status` as a pathspec relative to the top of the work tree, with glob characters taken literally. */
export function pathspec(path: string) {
  return `:(top,literal)${path}`
}

export function batched(paths: readonly string[]) {
  const all: string[][] = []
  const state = { size: 0 }
  paths.forEach((path) => {
    const last = all.at(-1)
    state.size += path.length + 3
    if (last && state.size < 24_000) return void last.push(path)
    all.push([path])
    state.size = path.length + 3
  })
  return all
}
