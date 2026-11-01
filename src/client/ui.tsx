import { Fragment, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { colorFor, findRefs, initials, relativeAge } from "../shared/core"
import type { ItemKind, Label } from "../shared/types"
import { dismissToast, useToasts, type Toast } from "./api"
import { t } from "./i18n"

export function Icon(props: { name: string; size?: number; className?: string; style?: CSSProperties }) {
  const size = props.size ?? 14
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.35,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: props.className,
    style: props.style,
    "aria-hidden": true,
  }
  const path = () => {
    switch (props.name) {
      case "gitlab":
        return <path fill="currentColor" stroke="none" d="M8 14.2 3.1 10.7a.45.45 0 0 1-.16-.5l.9-2.75L5.9 1.9a.3.3 0 0 1 .57 0L8 5.55l1.53-3.65a.3.3 0 0 1 .57 0l2.06 5.55.9 2.75a.45.45 0 0 1-.16.5Z" />
      case "branch":
        return <><circle cx="4.2" cy="3.4" r="1.6" /><circle cx="4.2" cy="12.6" r="1.6" /><circle cx="11.8" cy="5.2" r="1.6" /><path d="M4.2 5v6M11.8 6.8c0 2.2-1.8 3-4 3.4-1.6.3-2.6.8-3.2 1.3" /></>
      case "chevron-down": return <path d="m4.5 6.2 3.5 3.6 3.5-3.6" />
      case "chevron-right": return <path d="m6.2 4.5 3.6 3.5-3.6 3.5" />
      case "chevron-left": return <path d="m9.8 4.5-3.6 3.5 3.6 3.5" />
      case "chevron-up": return <path d="m4.5 9.8 3.5-3.6 3.5 3.6" />
      case "dots": return <><circle cx="3.2" cy="8" r="1" fill="currentColor" stroke="none" /><circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" /><circle cx="12.8" cy="8" r="1" fill="currentColor" stroke="none" /></>
      case "bell": return <><path d="M4 11h8l-1-1.6V6.7A3 3 0 0 0 8 3.7a3 3 0 0 0-3 3v2.7Z" /><path d="M6.7 11a1.35 1.35 0 0 0 2.6 0" /></>
      case "checklist": return <><path d="M3 4.6l1.15 1.15L6.4 3.5" /><path d="M3 11.1l1.15 1.15L6.4 10" /><path d="M8.3 5h4.7M8.3 11.5h4.7" /></>
      case "refresh": return <><path d="M12.7 6.1A5 5 0 1 0 13 9.3" /><path d="M12.8 2.9v3.4H9.4" /></>
      case "download": return <><path d="M8 2.8v7.4" /><path d="m5.2 7.5 2.8 2.8 2.8-2.8" /><path d="M3 12.9h10" /></>
      case "upload": return <><path d="M8 10.4V3" /><path d="M5.2 5.8 8 3l2.8 2.8" /><path d="M3 12.9h10" /></>
      case "plus": return <path d="M8 3.2v9.6M3.2 8h9.6" />
      case "close": return <path d="m4.2 4.2 7.6 7.6M11.8 4.2l-7.6 7.6" />
      case "check": return <path d="m3.4 8.2 3 3 6.2-6.4" />
      case "warning": return <><path d="M8 2.7 14 13H2Z" /><path d="M8 6.3v3.2M8 11.4v.1" /></>
      case "search": return <><circle cx="7" cy="7" r="4.4" /><path d="m10.3 10.3 2.5 2.5" /></>
      case "filter": return <path d="M2.7 3.4h10.6L9.2 8v4.1l-2.4 1V8Z" />
      case "sort": return <><path d="M4.5 3v10M2.3 10.8 4.5 13l2.2-2.2" /><path d="M11.5 13V3M9.3 5.2 11.5 3l2.2 2.2" /></>
      case "copy": return <><rect x="5.2" y="5.2" width="8" height="8.3" rx="1.2" /><path d="M10.8 5.2V3.7A1.2 1.2 0 0 0 9.6 2.5H3.7A1.2 1.2 0 0 0 2.5 3.7v5.9a1.2 1.2 0 0 0 1.2 1.2h1.5" /></>
      case "external": return <><path d="M9 2.8h4.2v4.2" /><path d="m13 3-5.6 5.6" /><path d="M6.7 3.2H3.5a.7.7 0 0 0-.7.7v8.6c0 .4.3.7.7.7h8.6a.7.7 0 0 0 .7-.7v-3.2" /></>
      case "comment": return <path d="M13 8.6c0 2.1-2.2 3.8-5 3.8-.6 0-1.2 0-1.7-.2L3.4 13.3l.8-2.2A3.6 3.6 0 0 1 3 8.6c0-2.1 2.2-3.8 5-3.8s5 1.7 5 3.8Z" />
      case "folder": return <path d="M2.5 4.3c0-.6.4-1 1-1h2.4l1.2 1.2h7.4c.6 0 1 .4 1 1v6.2c0 .6-.4 1-1 1H3.5c-.6 0-1-.4-1-1Z" />
      case "file": return <><path d="M4 2.5h5l3 3v8H4Z" /><path d="M9 2.7v3.2h3" /></>
      case "play": return <path d="M5.2 3.4 12 8l-6.8 4.6Z" />
      case "stop": return <rect x="4.2" y="4.2" width="7.6" height="7.6" rx="1" />
      case "clock": return <><circle cx="8" cy="8" r="5.5" /><path d="M8 4.8V8l2.1 1.3" /></>
      case "sparkles": return <><path d="M8 2.4 9 5.4l3 1-3 1-1 3-1-3-3-1 3-1Z" /><path d="M12.8 9.6l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5Z" /></>
      case "settings": return <><circle cx="8" cy="8" r="2.1" /><path d="M8 1.8v1.3M8 12.9v1.3M1.8 8h1.3M12.9 8h1.3M3.6 3.6l.9.9M11.5 11.5l.9.9M12.4 3.6l-.9.9M4.5 11.5l-.9.9" /></>
      case "arrow-left": return <><path d="M12.8 8H3.2" /><path d="M6.7 4.5 3.2 8l3.5 3.5" /></>
      case "inbox": return <><path d="M2.5 9.4 4.2 3.5h7.6l1.7 5.9v3.1H2.5Z" /><path d="M2.6 9.4h3.1l.8 1.5h3l.8-1.5h3.1" /></>
      case "pipeline": return <><circle cx="4" cy="3.4" r="1.2" /><circle cx="8" cy="8" r="1.2" /><circle cx="12" cy="12.6" r="1.2" /><path d="M5.1 3.7 7.1 7M8.9 9 11 12" /></>
      case "issue": return <><circle cx="8" cy="8" r="5.4" /><circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none" /></>
      case "mr": return <><circle cx="4.4" cy="3.7" r="1.4" /><circle cx="4.4" cy="12.2" r="1.4" /><circle cx="11.6" cy="8" r="1.4" /><path d="M4.4 5.2v5.6M11.5 6.6c0 2-1.9 1.4-3.6 1.6-1 .1-1.9.4-2.5 1" /></>
      case "link": return <><path d="M6.3 9.6 9.7 6.2" /><path d="M7.4 4.7 8.7 3.4a2.5 2.5 0 0 1 3.5 3.5l-1.3 1.3" /><path d="M8.6 11.3 7.3 12.6a2.5 2.5 0 0 1-3.5-3.5l1.3-1.3" /></>
      case "eye": return <><path d="M1.8 8S4.1 4.2 8 4.2 14.2 8 14.2 8 11.9 11.8 8 11.8 1.8 8 1.8 8Z" /><circle cx="8" cy="8" r="1.7" /></>
      case "undo": return <><path d="M3.2 7.8h6.4a3.1 3.1 0 0 1 0 6.2H6.5" /><path d="M5.7 4.8 2.7 7.8l3 3" /></>
      case "archive": return <><rect x="2.5" y="3" width="11" height="3" rx="0.8" /><path d="M3.5 6v6c0 .6.4 1 1 1h7c.6 0 1-.4 1-1V6" /><path d="M6.3 8.7h3.4" /></>
      case "cloud-upload": return <><path d="M5.1 11.6a2.8 2.8 0 0 1-.2-5.6A3.8 3.8 0 0 1 12 7a2.3 2.3 0 0 1-.3 4.6" /><path d="M8 13V7.8M5.9 9.5 8 7.4l2.1 2.1" /></>
      case "check-circle": return <><circle cx="8" cy="8" r="5.5" /><path d="m5.3 8.1 1.9 1.9 3.6-3.8" /></>
      case "x-circle": return <><circle cx="8" cy="8" r="5.5" /><path d="m5.9 5.9 4.2 4.2M10.1 5.9 5.9 10.1" /></>
      case "dot": return <circle cx="8" cy="8" r="2.2" fill="currentColor" stroke="none" />
      case "circle": return <circle cx="8" cy="8" r="5.3" />
      case "return": return <><path d="M12.5 4.3v4.1H4.3" /><path d="M7 6 4.3 8.4 7 10.8" /></>
      case "shield": return <path d="M8 2.2 13 4v3.4c0 3-2.1 5.3-5 6.4-2.9-1.1-5-3.4-5-6.4V4Z" />
      default: return <circle cx="8" cy="8" r="5.5" />
    }
  }
  return <svg {...common}>{path()}</svg>
}

export function Button(props: {
  children?: ReactNode
  variant?: "default" | "primary" | "ghost" | "danger"
  size?: "sm" | "md"
  icon?: string
  busy?: boolean
  disabled?: boolean
  title?: string
  onClick?: (event: React.MouseEvent) => void
  className?: string
  type?: "button" | "submit"
}) {
  return (
    <button
      type={props.type ?? "button"}
      className={`glp-btn ${props.className ?? ""}`}
      data-variant={props.variant ?? undefined}
      data-size={props.size ?? undefined}
      disabled={props.disabled || props.busy}
      title={props.title}
      onClick={props.onClick}
    >
      {props.busy ? <span className="glp-spinner" style={{ width: 11, height: 11, borderWidth: 1.5 }} /> : props.icon ? <Icon name={props.icon} size={12} /> : null}
      {props.children}
    </button>
  )
}

export function IconButton(props: { icon: string; label: string; onClick?: (event: React.MouseEvent) => void; disabled?: boolean; pressed?: boolean; className?: string; size?: number }) {
  return (
    <button
      type="button"
      className={`glp-icon-btn ${props.className ?? ""}`}
      aria-label={props.label}
      title={props.label}
      aria-pressed={props.pressed}
      data-pressed={props.pressed ? "" : undefined}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      <Icon name={props.icon} size={props.size ?? 14} />
    </button>
  )
}

export type MenuEntry =
  | { type?: "item"; label: string; icon?: string; disabled?: boolean; danger?: boolean; checked?: boolean; hint?: string; onSelect: () => void }
  | { type: "separator" }
  | { type: "header"; label: string }

export function Menu(props: { items: MenuEntry[]; label?: string; icon?: string; trigger?: "icon" | "text"; align?: "start" | "end"; disabled?: boolean; className?: string }) {
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLSpanElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  useLayoutEffect(() => {
    if (!open || !trigger.current) return
    const rect = trigger.current.getBoundingClientRect()
    const width = 220
    const left = props.align === "end" ? Math.max(6, rect.right - width) : Math.min(window.innerWidth - width - 6, rect.left)
    const top = rect.bottom + 4
    setPos({ top: Math.min(top, window.innerHeight - 40), left })
  }, [open, props.align])

  useEffect(() => {
    if (!open) return
    const away = (event: MouseEvent) => {
      if (menu.current?.contains(event.target as Node) || trigger.current?.contains(event.target as Node)) return
      setOpen(false)
    }
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", away)
    document.addEventListener("keydown", key)
    const close = () => setOpen(false)
    window.addEventListener("resize", close)
    window.addEventListener("scroll", close, true)
    return () => {
      document.removeEventListener("mousedown", away)
      document.removeEventListener("keydown", key)
      window.removeEventListener("resize", close)
      window.removeEventListener("scroll", close, true)
    }
  }, [open])

  return (
    <>
      <span ref={trigger} className={props.className}>
        {props.trigger === "text" ? (
          <Button size="sm" icon={props.icon} disabled={props.disabled} onClick={() => setOpen((value) => !value)}>
            {props.label}
          </Button>
        ) : (
          <IconButton icon={props.icon ?? "dots"} label={props.label ?? "Menu"} disabled={props.disabled} pressed={open} onClick={() => setOpen((value) => !value)} />
        )}
      </span>
      {open
        ? createPortal(
            <div className="glp-portal" style={{ inset: 0, pointerEvents: "none" }}>
              <div ref={menu} className="glp-menu" role="menu" style={{ position: "fixed", top: pos.top, left: pos.left, pointerEvents: "auto" }}>
                {props.items.map((item, index) =>
                  item.type === "separator" ? (
                    <div key={index} className="glp-menu-sep" />
                  ) : item.type === "header" ? (
                    <div key={index} className="glp-menu-item" style={{ opacity: 0.55, cursor: "default", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {item.label}
                    </div>
                  ) : (
                    <button
                      key={index}
                      type="button"
                      className="glp-menu-item"
                      role="menuitem"
                      disabled={item.disabled}
                      style={item.danger ? { color: "var(--glp-danger)" } : undefined}
                      onClick={() => {
                        setOpen(false)
                        item.onSelect()
                      }}
                    >
                      <span style={{ width: 14, display: "inline-flex", justifyContent: "center" }}>
                        {item.checked ? <Icon name="check" size={12} /> : item.icon ? <Icon name={item.icon} size={12} /> : null}
                      </span>
                      <span className="glp-ellipsis" style={{ flex: 1 }}>{item.label}</span>
                      {item.hint ? <span className="glp-kbd">{item.hint}</span> : null}
                    </button>
                  ),
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

export function Modal(props: { open: boolean; title: ReactNode; onClose: () => void; children: ReactNode; footer?: ReactNode; width?: number }) {
  useEffect(() => {
    if (!props.open) return
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") props.onClose()
    }
    document.addEventListener("keydown", key)
    return () => document.removeEventListener("keydown", key)
  }, [props.open, props.onClose])
  if (!props.open) return null
  return createPortal(
    <div className="glp-portal">
      <div className="glp-mask" onMouseDown={props.onClose} />
      <div className="glp-dialog" role="dialog" aria-modal="true" style={{ width: props.width }}>
        <div className="glp-row">
          <h2 style={{ flex: 1 }}>{props.title}</h2>
          <IconButton icon="close" label={t("Close")} onClick={props.onClose} />
        </div>
        {props.children}
        {props.footer ? <div className="glp-dialog-actions">{props.footer}</div> : null}
      </div>
    </div>,
    document.body,
  )
}

export function Toasts() {
  const toasts = useToasts()
  if (toasts.length === 0) return null
  return createPortal(
    <div className="glp-portal" style={{ inset: 0, pointerEvents: "none" }}>
      <div className="glp-toasts">
        {toasts.map((entry: Toast) => (
          <div key={entry.id} className="glp-toast" data-tone={entry.tone} role="status">
            <strong>{entry.title}</strong>
            {entry.description ? <small>{entry.description}</small> : null}
            {entry.action ? (
              <button
                type="button"
                onClick={() => {
                  entry.action?.run()
                  dismissToast(entry.id)
                }}
              >
                {entry.action.label}
              </button>
            ) : null}
            <button type="button" onClick={() => dismissToast(entry.id)} style={{ opacity: 0.65 }}>
              {t("Dismiss")}
            </button>
          </div>
        ))}
      </div>
    </div>,
    document.body,
  )
}

/** A compact Markdown renderer for issue, merge request and comment bodies. */
export function Markdown(props: { text: string; repo?: string; onOpenItem?: (kind: ItemKind, number: number) => void; className?: string }) {
  return <div className={`glp-md ${props.className ?? ""}`}>{renderMarkdown(props.text ?? "", props.repo, props.onOpenItem)}</div>
}

function renderMarkdown(text: string, repo: string | undefined, open: ((kind: ItemKind, number: number) => void) | undefined) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n")
  const blocks: ReactNode[] = []
  let index = 0
  let key = 0
  while (index < lines.length) {
    const line = lines[index] ?? ""
    if (line.startsWith("```")) {
      const language = line.slice(3).trim()
      const body: string[] = []
      index++
      while (index < lines.length && !(lines[index] ?? "").startsWith("```")) {
        body.push(lines[index] ?? "")
        index++
      }
      index++
      blocks.push(
        <pre key={key++} data-language={language || undefined}>
          <code>{body.join("\n")}</code>
        </pre>,
      )
      continue
    }
    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    if (heading) {
      const level = Math.min(4, (heading[1] ?? "#").length)
      const content = inline(heading[2] ?? "", repo, open)
      blocks.push(level === 1 ? <h1 key={key++}>{content}</h1> : level === 2 ? <h2 key={key++}>{content}</h2> : <h3 key={key++}>{content}</h3>)
      index++
      continue
    }
    if (/^\s*([-*_])\s*\1\s*\1\s*$/.test(line)) {
      blocks.push(<hr key={key++} />)
      index++
      continue
    }
    if (/^>\s?/.test(line)) {
      const quote: string[] = []
      while (index < lines.length && /^>\s?/.test(lines[index] ?? "")) {
        quote.push((lines[index] ?? "").replace(/^>\s?/, ""))
        index++
      }
      blocks.push(<blockquote key={key++}>{renderMarkdown(quote.join("\n"), repo, open)}</blockquote>)
      continue
    }
    const listMatch = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(line)
    if (listMatch) {
      const ordered = /\d/.test(listMatch[2] ?? "-")
      const items: { text: string; task?: boolean; done?: boolean }[] = []
      while (index < lines.length) {
        const current = lines[index] ?? ""
        const match = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(current)
        if (!match) break
        const raw = match[3] ?? ""
        const task = /^\[([ xX])]\s+(.*)$/.exec(raw)
        items.push({ text: task ? (task[2] ?? "") : raw, task: !!task, done: task ? (task[1] ?? "").toLowerCase() === "x" : undefined })
        index++
      }
      const content = items.map((item, i) => (
        <li key={i} style={item.task ? { listStyle: "none", marginLeft: -16 } : undefined}>
          {item.task ? <input type="checkbox" checked={!!item.done} readOnly style={{ marginRight: 6 }} /> : null}
          {inline(item.text, repo, open)}
        </li>
      ))
      blocks.push(ordered ? <ol key={key++}>{content}</ol> : <ul key={key++}>{content}</ul>)
      continue
    }
    if (line.trim() === "") {
      index++
      continue
    }
    const paragraph: string[] = [line]
    index++
    while (index < lines.length) {
      const next = lines[index] ?? ""
      if (next.trim() === "" || next.startsWith("```") || /^#{1,6}\s/.test(next) || /^>\s?/.test(next) || /^(\s*)([-*+]|\d+[.)])\s+/.test(next) || /^\s*([-*_])\s*\1\s*\1\s*$/.test(next)) break
      paragraph.push(next)
      index++
    }
    blocks.push(<p key={key++}>{inline(paragraph.join("\n"), repo, open)}</p>)
  }
  return blocks
}

const INLINE = /(`[^`]+`)|(\*\*[^*]+\*\*)|(__[^_]+__)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))|(https?:\/\/[^\s<>()]+)|(((?:[\w.-]+\/)+[\w.-]+)?[#!]\d{1,7}\b)/g

function inline(text: string, repo: string | undefined, open: ((kind: ItemKind, number: number) => void) | undefined) {
  const nodes: ReactNode[] = []
  let last = 0
  let key = 0
  for (const match of text.matchAll(INLINE)) {
    const at = match.index ?? 0
    if (at > last) nodes.push(text.slice(last, at))
    const token = match[0]
    if (token.startsWith("`")) nodes.push(<code key={key++}>{token.slice(1, -1)}</code>)
    else if (token.startsWith("**") || token.startsWith("__")) nodes.push(<strong key={key++}>{token.slice(2, -2)}</strong>)
    else if (token.startsWith("*") && token.endsWith("*")) nodes.push(<em key={key++}>{token.slice(1, -1)}</em>)
    else if (token.startsWith("[")) {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token)
      const href = link ? safeHref(link[2] ?? "") : undefined
      if (link && href) nodes.push(<a key={key++} href={href} target="_blank" rel="noreferrer">{link[1]}</a>)
      else nodes.push(link?.[1] ?? token)
    } else if (token.startsWith("http")) {
      const href = token.replace(/[.,;:!?]+$/, "")
      const safe = safeHref(href)
      if (safe) nodes.push(<a key={key++} href={safe} target="_blank" rel="noreferrer">{href}</a>)
      else nodes.push(href)
      if (href !== token) nodes.push(token.slice(href.length))
    } else {
      const ref = /^(?:((?:[\w.-]+\/)+[\w.-]+))?([#!])(\d{1,7})$/.exec(token)
      if (ref && open) {
        const number = Number(ref[3])
        const target = ref[1] ?? repo
        const kind: ItemKind = ref[2] === "!" ? "mr" : "issue"
        nodes.push(
          <a
            key={key++}
            href={target ? `${kind === "mr" ? "!" : "#"}${ref[3]}` : undefined}
            className="glp-mention"
            onClick={(event) => {
              event.preventDefault()
              if (target) open(kind, number)
            }}
            title={target ?? ""}
          >
            {token}
          </a>,
        )
      } else nodes.push(token)
    }
    last = at + token.length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

function safeHref(value: string) {
  try {
    const url = new URL(value, document.baseURI)
    return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "mailto:" ? value : undefined
  } catch {
    return undefined
  }
}

export function LabelChip(props: { label: Label }) {
  const color = `#${(props.label.color || "888888").replace(/^#/, "")}`
  const rgb = color.length === 7 ? [1, 3, 5].map((at) => parseInt(color.slice(at, at + 2), 16)) : [136, 136, 136]
  const luminance = (0.299 * (rgb[0] ?? 0) + 0.587 * (rgb[1] ?? 0) + 0.114 * (rgb[2] ?? 0)) / 255
  return (
    <span className="glp-label" style={{ background: `${color}22`, color: luminance > 0.6 ? "var(--glp-text-2)" : color, borderColor: `${color}55` }} title={props.label.description}>
      {props.label.name}
    </span>
  )
}

export function Avatar(props: { name: string; size?: number }) {
  const size = props.size ?? 18
  return (
    <span className="glp-avatar" style={{ width: size, height: size, background: colorFor(props.name), fontSize: Math.max(7, Math.round(size / 2.3)) }} title={props.name}>
      {initials(props.name)}
    </span>
  )
}

export function StateIcon(props: { kind: ItemKind; state: string; draft?: boolean }) {
  if (props.kind === "mr") {
    if (props.draft && props.state === "OPEN") return <span className="glp-state" data-state="DRAFT"><Icon name="circle" size={13} /></span>
    if (props.state === "MERGED") return <span className="glp-state" data-state="MERGED"><Icon name="check-circle" size={13} /></span>
    if (props.state === "CLOSED") return <span className="glp-state" data-state="CLOSED"><Icon name="x-circle" size={13} /></span>
    return <span className="glp-state" data-state="OPEN"><Icon name="mr" size={13} /></span>
  }
  if (props.state === "CLOSED") return <span className="glp-state" data-state="CLOSED"><Icon name="check-circle" size={13} /></span>
  return <span className="glp-state" data-state="OPEN"><Icon name="issue" size={13} /></span>
}

export function CheckDot(props: { state: string }) {
  return <span className="glp-check-dot" data-state={props.state} title={`Checks: ${props.state}`} />
}

export function StatusPill(props: { status: string; children?: ReactNode }) {
  return <span className="glp-status-pill" data-status={props.status}>{props.children ?? props.status}</span>
}

export function Pill(props: { tone?: string; children: ReactNode; title?: string }) {
  return <span className="glp-pill" data-tone={props.tone} title={props.title}>{props.children}</span>
}

export function Spinner() {
  return <span className="glp-spinner" />
}

export function TextArea(props: {
  value: string
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
  rows?: number
  placeholder?: string
  autoFocus?: boolean
  mono?: boolean
  className?: string
}) {
  return (
    <textarea
      className={`glp-textarea ${props.className ?? ""}`}
      rows={props.rows ?? 4}
      value={props.value}
      placeholder={props.placeholder}
      autoFocus={props.autoFocus}
      data-mono={props.mono ? "" : undefined}
      onChange={props.onChange}
      onKeyDown={props.onKeyDown}
    />
  )
}

export function Empty(props: { icon?: string; children: ReactNode; inline?: boolean }) {
  return (
    <div className="glp-empty" data-inline={props.inline ? "" : undefined}>
      {props.icon ? <Icon name={props.icon} size={20} /> : null}
      <span>{props.children}</span>
    </div>
  )
}

export function Age(props: { date: string | number | undefined; title?: boolean }) {
  const label = relativeAge(props.date)
  if (!label) return null
  return <span title={props.title ? new Date(typeof props.date === "number" ? props.date * 1000 : String(props.date)).toLocaleString() : undefined}>{label}</span>
}

export function Clamp(props: { children: ReactNode; lines?: number; id?: string; open?: boolean; onOpen?: (open: boolean) => void }) {
  const [own, setOwn] = useState(false)
  const [clamps, setClamps] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const lines = props.lines ?? 8
  const open = props.open ?? own
  useLayoutEffect(() => {
    const element = ref.current
    if (!element || lines <= 0) {
      setClamps(false)
      return
    }
    const measure = () => {
      const lineHeight = parseFloat(getComputedStyle(element).lineHeight) || 18
      setClamps(element.scrollHeight > lineHeight * (lines + 2))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [lines, props.children])
  if (lines <= 0) return <div className="glp-clamp"><div className="glp-clamp-box"><div>{props.children}</div></div></div>
  return (
    <div className="glp-clamp">
      <div className="glp-clamp-box" style={{ maxHeight: clamps && !open ? `${lines * 1.6}em` : undefined }}>
        <div ref={ref}>{props.children}</div>
      </div>
      {clamps ? (
        <button
          type="button"
          className="glp-clamp-toggle"
          onClick={() => {
            setOwn(!open)
            props.onOpen?.(!open)
          }}
        >
          {open ? t("Show less") : t("Show more")}
        </button>
      ) : null}
    </div>
  )
}

export function copyText(text: string) {
  void navigator.clipboard?.writeText(text).catch(() => undefined)
}

export function useClickOutside(active: boolean, onClose: () => void, refs: React.RefObject<HTMLElement | null>[]) {
  useEffect(() => {
    if (!active) return
    const handler = (event: MouseEvent) => {
      if (refs.some((ref) => ref.current?.contains(event.target as Node))) return
      onClose()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [active, onClose, refs])
}

export function Segmented<T extends string>(props: { value: T; options: { value: T; label: string; title?: string }[]; onChange: (value: T) => void }) {
  return (
    <div className="glp-row" style={{ gap: 2 }}>
      {props.options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="glp-tab"
          data-selected={props.value === option.value ? "" : undefined}
          title={option.title}
          onClick={() => props.onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function Kbd(props: { children: ReactNode }) {
  return <span className="glp-kbd">{props.children}</span>
}

export function InlineError(props: { error: unknown }) {
  return <div className="glp-error" role="alert">{props.error instanceof Error ? props.error.message : String(props.error)}</div>
}

export function Group(props: { title: ReactNode; count?: number; open: boolean; onToggle: () => void; children: ReactNode; extra?: ReactNode }) {
  return (
    <section className="glp-group" data-open={props.open ? "" : undefined}>
      <button type="button" className="glp-group-head" aria-expanded={props.open} onClick={props.onToggle}>
        <Icon name={props.open ? "chevron-down" : "chevron-right"} size={12} />
        <span className="glp-group-title glp-ellipsis">{props.title}</span>
        {props.count !== undefined ? <span className="glp-tab-count">{props.count}</span> : null}
        <span className="glp-spacer" />
        {props.extra}
      </button>
      {props.open ? <div className="glp-group-body">{props.children}</div> : null}
    </section>
  )
}

export function RefChip(props: { name: string; kind: string; current?: boolean }) {
  const kind = props.current ? "head" : props.kind
  return <span className="glp-ref" data-kind={kind} title={props.name}>{props.name}</span>
}

export function Checkbox(props: { checked: boolean; onChange: (checked: boolean) => void; label?: string; indeterminate?: boolean }) {
  return (
    <label className="glp-checkbox" title={props.label}>
      <input
        type="checkbox"
        checked={props.checked}
        ref={(element) => {
          if (element) element.indeterminate = !!props.indeterminate
        }}
        onChange={(event) => props.onChange(event.target.checked)}
      />
      {props.label ? <span>{props.label}</span> : null}
    </label>
  )
}

export function Quote(props: { text: string }) {
  return <div className="glp-quote-text">{props.text}</div>
}

export function Divider() {
  return <div className="glp-menu-sep" />
}

export { findRefs }
