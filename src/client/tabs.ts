import type { PanelParams } from "./nav"

const KEY = "dsh-gitlab-panel.tabs.v1"
const LIMIT = 200

interface Entry {
  id: string
  params: PanelParams
  at: number
}

function read(): Entry[] {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? (JSON.parse(raw) as Entry[]) : []
    return Array.isArray(parsed) ? parsed.filter((entry) => typeof entry?.id === "string" && !!entry.params) : []
  } catch {
    return []
  }
}

function write(entries: Entry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries.slice(-LIMIT)))
  } catch {
    // Ignore.
  }
}

/** The right Sidebar restores tab ids but not their navigation params; this remembers what each tab opened. */
export function rememberTab(id: string | undefined, params: PanelParams) {
  if (!id) return
  const entries = read()
  const previous = entries.find((entry) => entry.id === id)
  // Bodies and titles call this on every render; only a real navigation writes.
  if (previous && JSON.stringify(previous.params) === JSON.stringify(params)) return
  write([...entries.filter((entry) => entry.id !== id), { id, params, at: Date.now() }])
}

export function forgetTab(id: string | undefined) {
  if (!id) return
  write(read().filter((entry) => entry.id !== id))
}

export function paramsForTab(id: string | undefined): PanelParams | undefined {
  if (!id) return undefined
  return read().find((entry) => entry.id === id)?.params
}
