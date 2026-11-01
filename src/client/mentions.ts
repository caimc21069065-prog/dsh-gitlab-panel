import { findRefs, parseGitLabLink } from "../shared/core"
import type { ItemKind } from "../shared/types"
import { api } from "./api"
import { t } from "./i18n"
import { nav } from "./nav"

let currentRepo: string | undefined

export function setCurrentRepo(repo: string | undefined) {
  currentRepo = repo
}

const SKIP = "a, pre, code, textarea, input, select, script, style, [contenteditable='true'], [data-glp], .glp-mention-overlay, .glp-portal"

/** Highlights `#123` and `group/project#123` in conversation text with clickable overlays, without changing the DOM. */
export function installMentions() {
  const layer = document.createElement("div")
  layer.dataset.glp = ""
  layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147482998"
  document.body.appendChild(layer)
  let card: HTMLDivElement | undefined
  let timer = 0

  const clear = () => {
    layer.textContent = ""
  }

  const rebuild = () => {
    clear()
    if (!currentRepo) return
    if (!document.body) return
    // Only conversation text: other app surfaces may show # in titles or keys where an overlay would be noise.
    const roots = [...document.querySelectorAll("[data-chat-flow], [data-trajectory]")]
    let count = 0
    for (const root of roots) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const text = node.nodeValue
          if (!text || text.length < 3 || !/[#!]\d/.test(text)) return NodeFilter.FILTER_REJECT
          const parent = node.parentElement
          if (!parent || parent.closest(SKIP)) return NodeFilter.FILTER_REJECT
          return NodeFilter.FILTER_ACCEPT
        },
      })
      let node: Node | null
      while ((node = walker.nextNode()) && count < 200) {
        const text = node.nodeValue ?? ""
        for (const ref of findRefs(text)) {
          if (count >= 200) break
          const repo = ref.repo ?? currentRepo
          if (ref.repo && currentRepo && ref.repo.toLowerCase() !== currentRepo.toLowerCase()) continue
          if (!repo) continue
          const range = document.createRange()
          try {
            range.setStart(node, ref.index)
            range.setEnd(node, ref.index + ref.length)
          } catch {
            continue
          }
          for (const rect of range.getClientRects()) {
            if (rect.width < 2 || rect.height < 2) continue
            if (rect.bottom < 0 || rect.top > window.innerHeight) continue
            const spot = document.createElement("a")
            spot.className = "glp-mention-overlay"
            spot.dataset.glp = ""
            spot.style.position = "fixed"
            spot.style.left = `${rect.left}px`
            spot.style.top = `${rect.top}px`
            spot.style.width = `${rect.width}px`
            spot.style.height = `${rect.height}px`
            spot.style.cursor = "pointer"
            spot.style.pointerEvents = "auto"
            spot.style.background = "transparent"
            spot.style.borderBottom = "1px dotted var(--dsw-alias-link, #3e63dd)"
            spot.style.borderRadius = "2px"
            spot.setAttribute("aria-label", `${repo}${ref.kind === "mr" ? "!" : "#"}${ref.number}`)
            spot.dataset.kind = ref.kind
            spot.addEventListener("pointerenter", (event) => showCard(event, repo, ref.number, ref.kind))
            spot.addEventListener("pointerleave", () => hideCard())
            spot.addEventListener("click", (event) => {
              event.preventDefault()
              event.stopPropagation()
              void open(repo, ref.number, ref.kind)
            })
            layer.appendChild(spot)
            count++
          }
        }
      }
      if (count >= 200) break
    }
  }

  const schedule = () => {
    window.clearTimeout(timer)
    timer = window.setTimeout(rebuild, 250)
  }

  const hideCard = () => {
    card?.remove()
    card = undefined
  }

  const showCard = (event: PointerEvent, repo: string, number: number, hintKind?: ItemKind) => {
    if (!window.matchMedia("(any-hover: hover)").matches) return
    hideCard()
    const anchor = event.currentTarget as HTMLElement
    void api
      .item(repo, number, hintKind)
      .then((item) => {
        const element = document.createElement("div")
        element.dataset.glp = ""
        element.className = "glp-portal"
        element.style.cssText = "position:fixed;z-index:2147483050;pointer-events:none"
        const box = document.createElement("div")
        box.className = "glp-hover-card"
        box.style.pointerEvents = "auto"
        box.style.position = "static"
        const title = document.createElement("div")
        title.style.cssText = "font-weight:600;line-height:1.35;overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical"
        title.textContent = `${item.kind === "mr" ? "!" : "#"}${item.number} ${item.title}`
        const meta = document.createElement("div")
        meta.style.cssText = "font-size:11px;color:var(--glp-text-3);display:flex;gap:6px;align-items:center"
        meta.textContent = `${item.state.toLowerCase()} · @${item.author}${item.draft ? " · draft" : ""}`
        const hint = document.createElement("div")
        hint.style.cssText = "font-size:10px;color:var(--glp-text-3)"
        hint.textContent = t("Click to open in the GitLab panel")
        box.append(title, meta, hint)
        box.addEventListener("click", () => void open(repo, number, item.kind))
        element.appendChild(box)
        const rect = anchor.getBoundingClientRect()
        const top = rect.bottom + 6 + 120 > window.innerHeight ? Math.max(6, rect.top - 130) : rect.bottom + 6
        const left = Math.min(window.innerWidth - 310, Math.max(6, rect.left))
        element.style.left = `${left}px`
        element.style.top = `${top}px`
        card = element
        document.body.appendChild(element)
      })
      .catch(() => undefined)
  }

  const open = async (repo: string, number: number, kind?: ItemKind) => {
    let resolved = kind
    if (!resolved) {
      try {
        resolved = (await api.item(repo, number)).kind
      } catch {
        resolved = "issue"
      }
    }
    nav.openItem({ repo, kind: resolved, number })
    hideCard()
  }

  const click = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const target = event.target as Element | null
    if (!target) return
    if (target.closest("[data-glp]")) return
    const anchor = target.closest("a")
    if (anchor instanceof HTMLAnchorElement && anchor.href) {
      const link = parseGitLabLink(anchor.href)
      if (!link) return
      event.preventDefault()
      event.stopPropagation()
      if (link.kind === "item") void open(link.repo, link.number, link.item)
      else if (link.kind === "commit") nav.openCommit({ repo: link.repo, sha: link.sha })
      else if (link.kind === "run") nav.openRun({ repo: link.repo, id: link.id })
      return
    }
    const ref = target.closest(".glp-mention")
    if (ref instanceof HTMLElement) {
      const repo = ref.dataset.repo
      const number = Number(ref.dataset.number)
      if (repo && number) void open(repo, number, ref.dataset.kind === "mr" ? "mr" : ref.dataset.kind === "issue" ? "issue" : undefined)
    }
  }

  const onScroll = () => schedule()
  const observer = new MutationObserver((records) => {
    if (records.every((record) => record.target instanceof Element && record.target.closest("[data-glp]"))) return
    schedule()
  })
  observer.observe(document.body, { childList: true, subtree: true, characterData: true })
  window.addEventListener("scroll", onScroll, { capture: true, passive: true })
  window.addEventListener("resize", onScroll, { passive: true })
  document.addEventListener("click", click, true)
  schedule()

  return () => {
    observer.disconnect()
    window.removeEventListener("scroll", onScroll, true)
    window.removeEventListener("resize", onScroll)
    document.removeEventListener("click", click, true)
    window.clearTimeout(timer)
    hideCard()
    layer.remove()
  }
}
