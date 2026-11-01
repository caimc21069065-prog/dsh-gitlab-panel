import { useEffect, useMemo, useRef, useState } from "react"
import { relativeAge } from "../shared/core"
import type { ItemKind, MergeRequest, Overview, SearchItem } from "../shared/types"
import {
  api,
  errorText,
  getPrefs,
  queryClient,
  rememberSeen,
  rpc,
  startAgentSession,
  toast,
  updatePrefs,
  useAgent,
  useMeta,
  usePrefs,
  useSearch,
} from "./api"
import {
  BulkMenu,
  CloseDialog,
  CommentDialog,
  SavedSearchDialog,
  StartWorkDialog,
  TriageDialog,
  askAboutItems,
  errorToast,
  forgetSavedSearch,
  itemQuote,
  openExternal,
  reviewPrompt,
} from "./actions"
import { t } from "./i18n"
import { nav } from "./nav"
import { Age, Avatar, Button, CheckDot, Checkbox, Empty, Icon, IconButton, LabelChip, Menu, Modal, Pill, Spinner, StateIcon, type MenuEntry } from "./ui"

interface Preset {
  id: string
  label: string
  query: string
}

const MR_PRESETS: Preset[] = [
  { id: "assigned", label: "Assigned to me", query: "is:open assignee:@me" },
  { id: "review", label: "Review requested", query: "is:open reviewer:@me" },
  { id: "authored", label: "Created by me", query: "is:open author:@me" },
  { id: "open", label: "All open", query: "is:open" },
  { id: "drafts", label: "Drafts", query: "is:open draft:true" },
  { id: "merged", label: "Recently merged", query: "is:merged sort:updated-desc" },
]

const ISSUE_PRESETS: Preset[] = [
  { id: "assigned", label: "Assigned to me", query: "is:open assignee:@me" },
  { id: "authored", label: "Created by me", query: "is:open author:@me" },
  { id: "open", label: "All open", query: "is:open" },
  { id: "unassigned", label: "Unassigned", query: "is:open no:assignee" },
  { id: "closed", label: "Recently closed", query: "is:closed sort:updated-desc" },
]

const QUALIFIERS = [
  "is:open", "is:closed", "is:merged", "is:issue", "is:mr", "is:draft",
  "label:", "author:@me", "assignee:@me", "reviewer:@me", "milestone:", "no:assignee",
  "sort:created-desc", "sort:updated-desc", "sort:updated-asc",
]

const SORTS: { label: string; value: string }[] = [
  { label: "Newest", value: "sort:created-desc" },
  { label: "Oldest", value: "sort:created-asc" },
  { label: "Recently updated", value: "sort:updated-desc" },
  { label: "Least recently updated", value: "sort:updated-asc" },
  { label: "Priority", value: "sort:priority-desc" },
]

export function SearchView(props: { kind: ItemKind; repo: string; cwd: string; sessionId: string; overview: Overview; onOpenItem: (kind: ItemKind, number: number) => void }) {
  const presets = props.kind === "mr" ? MR_PRESETS : ISSUE_PRESETS
  const [prefs, setPrefs] = usePrefs()
  const saved = prefs.savedSearches.filter((entry) => entry.repo === props.repo && entry.kind === props.kind)
  const initialQuery = props.kind === "mr" ? prefs.savedSearches.find((entry) => entry.repo === props.repo && entry.kind === "mr")?.query : undefined
  const [query, setQuery] = useState(initialQuery ?? "is:open")
  const [applied, setApplied] = useState(initialQuery ?? "is:open")
  const [preset, setPreset] = useState<string>(initialQuery ? "" : "open")
  const [active, setActive] = useState(0)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [anchor, setAnchor] = useState<number | undefined>(undefined)
  const lastClicked = useRef<number | undefined>(undefined)
  const [dialog, setDialog] = useState<"close" | "comment" | "label" | "assign" | "save" | "triage" | undefined>()
  const [rowActions, setRowActions] = useState<SearchItem>()
  const [startItem, setStartItem] = useState<any>()
  const [focusSearch, setFocusSearch] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const container = useRef<HTMLDivElement>(null)
  const sentinel = useRef<HTMLDivElement>(null)
  const meta = useMeta(props.repo, true)
  const agent = useAgent(props.sessionId)
  const agentActions = agent.data?.actions ?? []
  const search = useSearch(props.repo, props.kind, applied, !!props.repo)
  const items = useMemo(() => search.data?.pages.flatMap((page) => page.items) ?? [], [search.data])
  const total = search.data?.pages[0]?.total ?? 0
  const seen = useRef(prefs.seen[`${props.repo}:${props.kind}`] ?? 0).current

  useEffect(() => {
    const timer = setTimeout(() => rememberSeen(props.repo, props.kind), 4_000)
    return () => clearTimeout(timer)
  }, [props.repo, props.kind])

  useEffect(() => {
    const node = sentinel.current
    if (!node || !search.hasNextPage || search.isFetchingNextPage) return
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) void search.fetchNextPage()
    }, { root: null, rootMargin: "240px" })
    observer.observe(node)
    return () => observer.disconnect()
  }, [search.hasNextPage, search.isFetchingNextPage, search.fetchNextPage, items.length])

  useEffect(() => {
    setActive((value) => Math.min(value, Math.max(0, items.length - 1)))
  }, [items.length])

  useEffect(() => {
    if (focusSearch) {
      input.current?.focus()
      setFocusSearch(false)
    }
  }, [focusSearch])

  const apply = (next: string, presetId = "") => {
    setQuery(next)
    setApplied(next)
    setPreset(presetId)
    setSelected(new Set())
    setAnchor(undefined)
    void queryClient.invalidateQueries({ queryKey: ["search", props.repo, props.kind] })
  }

  const insertToken = (token: string) => {
    const parts = query.split(/\s+/).filter(Boolean)
    const last = parts[parts.length - 1] ?? ""
    if (last && !last.includes(":")) parts[parts.length - 1] = token
    else parts.push(token)
    const next = parts.join(" ")
    setQuery(`${next} `)
    input.current?.focus()
  }

  const removeToken = (token: string) => apply(query.split(/\s+/).filter((part) => part !== token).join(" "), "")

  const filtered = useMemo(() => {
    const tokens = query.split(/\s+/).filter(Boolean)
    const typing = tokens[tokens.length - 1] ?? ""
    if (!typing || /^is:(open|closed|merged)$/.test(typing)) return []
    if (typing.includes(":")) {
      const [key, value] = typing.split(":", 2)
      if (key === "label") return (meta.data?.labels ?? []).filter((label) => label.name.toLowerCase().includes((value ?? "").toLowerCase())).slice(0, 8).map((label) => ({ value: `label:${label.name}`, hint: "" }))
      if (key === "assignee" || key === "reviewer" || key === "author") return (meta.data?.people ?? []).filter((name) => name.toLowerCase().includes((value ?? "").toLowerCase())).slice(0, 8).map((name) => ({ value: `${key}:${name}`, hint: "" }))
      if (key === "milestone") return (meta.data?.milestones ?? []).filter((name) => name.toLowerCase().includes((value ?? "").toLowerCase())).slice(0, 8).map((name) => ({ value: `milestone:${name}`, hint: "" }))
    }
    return QUALIFIERS.filter((entry) => entry.startsWith(typing) || entry.includes(typing)).slice(0, 8).map((entry) => ({ value: entry, hint: "" }))
  }, [query, meta.data])

  const tokens = useMemo(() => query.split(/\s+/).filter((token) => token.includes(":")), [query])
  const sortToken = tokens.find((token) => token.startsWith("sort:"))?.slice(5) ?? "created-desc"

  const move = (delta: number) => {
    const next = Math.max(0, Math.min(items.length - 1, active + delta))
    setActive(next)
    container.current?.querySelector(`[data-index="${next}"]`)?.scrollIntoView({ block: "nearest" })
  }

  const toggle = (number: number, range = false) => {
    const index = items.findIndex((item) => item.number === number)
    setSelected((current) => {
      if (!range || lastClicked.current === undefined) {
        const next = new Set(current)
        if (next.has(number)) next.delete(number)
        else next.add(number)
        setAnchor(index)
        return next
      }
      const from = Math.min(lastClicked.current, index)
      const to = Math.max(lastClicked.current, index)
      const span = items.slice(from, to + 1).map((item) => item.number)
      const on = !current.has(number)
      return on ? new Set([...current, ...span]) : new Set([...current].filter((entry) => !span.includes(entry)))
    })
    lastClicked.current = index
  }

  const openRow = (item: SearchItem) => props.onOpenItem(item.kind, item.number)

  const copyRef = (item: SearchItem) => {
    navigator.clipboard?.writeText(`${props.repo}${item.kind === "mr" ? "!" : "#"}${item.number}`)
    toast({ tone: "success", title: t("Copied") })
  }

  const rowMenu = (item: SearchItem): MenuEntry[] => [
    { label: t("Open"), icon: "arrow-left", onSelect: () => openRow(item) },
    { label: t("Add to chat"), icon: "comment", onSelect: () => void quote(item) },
    { label: t("Ask agent"), icon: "sparkles", onSelect: () => void ask(item) },
    { type: "separator" },
    { label: t("Copy link"), icon: "copy", onSelect: () => { navigator.clipboard?.writeText(item.url); toast({ tone: "success", title: t("Copied") }) } },
    { label: t("Copy reference"), icon: "link", onSelect: () => copyRef(item) },
    { label: t("Open on GitLab"), icon: "external", onSelect: () => openExternal(item.url) },
    { type: "separator" },
    ...(item.state === "OPEN"
      ? [{ label: t("Close"), icon: "close", danger: true, onSelect: () => { setSelected(new Set([item.number])); setDialog("close") } }]
      : item.state !== "MERGED"
        ? [{ label: t("Reopen"), icon: "undo", onSelect: () => void reopen(item.number) }]
        : []),
    ...(item.kind === "issue"
      ? [{ label: t("Start working"), icon: "play", onSelect: () => void startWorking(item) }]
      : [
          { label: t("Checkout"), icon: "download", onSelect: () => void checkout(item) },
          { label: t("Pre-review with agent"), icon: "sparkles", onSelect: () => void preReview(item) },
        ]),
  ]

  const quote = async (item: SearchItem) => {
    try {
      const full = await api.item(props.repo, item.number, item.kind)
      const { quoteToChat } = await import("./api")
      await quoteToChat(props.sessionId, props.cwd, itemQuote(full))
    } catch (error) {
      errorToast(error)
    }
  }

  const ask = async (item: SearchItem) => {
    await askAboutItems(props.sessionId, props.cwd, t("Help me with this {kind}:", { kind: item.kind === "mr" ? t("merge request") : t("issue") }), [item])
  }

  const reopen = async (number: number) => {
    try {
      const result = await rpc<{ queued: number[] }>("agentQueue", { sessionID: props.sessionId, repo: props.repo, kind: "reopen", itemKind: props.kind, numbers: [number] })
      toast({ tone: "success", title: t("Queued {count} reopen actions", { count: result.queued.length }) })
      void queryClient.invalidateQueries({ queryKey: ["search"] })
    } catch (error) {
      errorToast(error)
    }
  }

  const startWorking = async (item: SearchItem) => {
    try {
      setStartItem(await api.item(props.repo, item.number, item.kind))
    } catch (error) {
      errorToast(error)
    }
  }

  const checkout = async (item: SearchItem) => {
    try {
      await rpc("checkoutMr", { cwd: props.cwd, repo: props.repo, number: item.number })
      toast({ tone: "success", title: t("Checked out") })
      void queryClient.invalidateQueries({ queryKey: ["overview", props.cwd] })
    } catch (error) {
      errorToast(error)
    }
  }

  const preReview = async (item: SearchItem) => {
    try {
      const full = await api.item(props.repo, item.number, item.kind)
      await startAgentSession({ cwd: props.cwd, prompt: reviewPrompt(full) })
      toast({ tone: "success", title: t("Session started") })
    } catch (error) {
      errorToast(error)
    }
  }

  const bulkAsk = () => {
    const picked = items.filter((item) => selected.has(item.number))
    void askAboutItems(props.sessionId, props.cwd, t("Look at these {count} items:", { count: picked.length }), picked)
  }

  const setSort = (value: string) => {
    const cleaned = query.split(/\s+/).filter((token) => !token.startsWith("sort:")).join(" ")
    apply(`${cleaned} sort:${value}`.trim(), "")
  }

  const stateFilter = () => {
    const token = tokens.find((entry) => /^is:(open|closed|merged)$/.test(entry))
    return token?.slice(3) ?? "open"
  }

  const setStateFilter = (state: string) => {
    const cleaned = query.split(/\s+/).filter((token) => !/^is:(open|closed|merged)$/.test(token)).join(" ")
    apply(`${cleaned} is:${state}`.trim(), "")
  }

  const toggleMine = (key: "assignee" | "reviewer" | "author") => {
    const has = tokens.includes(`${key}:@me`)
    const cleaned = query.split(/\s+/).filter((token) => token !== `${key}:@me`).join(" ")
    apply(has ? cleaned : `${cleaned} ${key}:@me`.trim(), "")
  }

  const toggleLabel = (name: string) => {
    const token = `label:${name}`
    const has = tokens.includes(token)
    const cleaned = query.split(/\s+/).filter((entry) => entry !== token).join(" ")
    apply(has ? cleaned : `${cleaned} ${token}`.trim(), "")
  }

  const filterItems: MenuEntry[] = [
    { type: "header", label: t("State") },
    ...["open", "closed", ...(props.kind === "mr" ? ["merged"] : []), "all"].map((state) => ({
      label: state === "open" ? t("Open") : state === "closed" ? t("Closed") : state === "merged" ? t("Merged") : t("All"),
      checked: stateFilter() === state,
      onSelect: () => setStateFilter(state),
    })),
    { type: "separator" },
    { label: t("Assigned to me"), checked: tokens.includes("assignee:@me"), onSelect: () => toggleMine("assignee") },
    { label: t("Created by me"), checked: tokens.includes("author:@me"), onSelect: () => toggleMine("author") },
    ...(props.kind === "mr" ? [{ label: t("Review requested"), checked: tokens.includes("reviewer:@me"), onSelect: () => toggleMine("reviewer") }] : []),
    ...(meta.data?.labels.length ? [{ type: "separator" as const }, { type: "header" as const, label: t("Labels") }, ...meta.data.labels.slice(0, 12).map((label) => ({ label: label.name, checked: tokens.includes(`label:${label.name}`), onSelect: () => toggleLabel(label.name) }))] : []),
    { type: "separator" },
    { label: t("Clear filters"), onSelect: () => apply(`is:open sort:${sortToken}`, "open") },
  ]

  const sortItems: MenuEntry[] = SORTS.map((entry) => ({
    label: t(entry.label),
    checked: sortToken === entry.value.slice(5),
    onSelect: () => setSort(entry.value.slice(5)),
  }))

  const bulkMenu = selected.size > 0 ? (
    <div className="glp-bulkbar" onClick={(event) => event.stopPropagation()}>
      <Checkbox checked={selected.size === items.length && items.length > 0} indeterminate={selected.size > 0 && selected.size < items.length} onChange={(checked) => setSelected(checked ? new Set(items.map((item) => item.number)) : new Set())} />
      <strong>{selected.size}</strong>
      <span className="glp-faint">{t("selected")}</span>
      <span className="glp-spacer" />
      <Button size="sm" variant="ghost" icon="close" onClick={() => setDialog("close")}>{t("Close")}</Button>
      <Button size="sm" variant="ghost" icon="comment" onClick={() => setDialog("comment")}>{t("Comment")}</Button>
      <Button size="sm" variant="ghost" onClick={() => setDialog("label")}>{t("Label")}</Button>
      <Button size="sm" variant="ghost" onClick={() => setDialog("assign")}>{t("Assign")}</Button>
      <BulkMenu
        repo={props.repo}
        kind={props.kind}
        numbers={[...selected]}
        sessionID={props.sessionId}
        cwd={props.cwd}
        items={items.filter((item) => selected.has(item.number)).map((item) => ({ number: item.number, title: item.title, state: item.state, url: item.url }))}
        onCloseSelection={() => setSelected(new Set())}
        onDone={() => void queryClient.invalidateQueries({ queryKey: ["search"] })}
        onAsk={bulkAsk}
        onTriage={() => setDialog("triage")}
      />
      <IconButton icon="close" label={t("Clear filters")} onClick={() => setSelected(new Set())} />
    </div>
  ) : null

  return (
    <div
      ref={container}
      tabIndex={0}
      style={{ outline: "none", minHeight: "100%" }}
      onKeyDown={(event) => {
        const target = event.target as HTMLElement
        const typing = target.tagName === "INPUT" || target.tagName === "TEXTAREA"
        if (event.key === "/" && !typing) {
          event.preventDefault()
          setFocusSearch(true)
        } else if ((event.key === "j" || event.key === "ArrowDown") && !typing) {
          event.preventDefault()
          move(1)
        } else if ((event.key === "k" || event.key === "ArrowUp") && !typing) {
          event.preventDefault()
          move(-1)
        } else if (event.key === "Enter" && !typing && items[active]) {
          event.preventDefault()
          openRow(items[active])
        } else if (event.key === "x" && !typing && items[active]) {
          event.preventDefault()
          toggle(items[active].number)
        } else if (event.key === "a" && !typing && !event.metaKey && !event.ctrlKey && selected.size > 0) {
          event.preventDefault()
          bulkAsk()
        } else if (event.key === "." && !typing && items[active]) {
          event.preventDefault()
          setRowActions(items[active])
        } else if (event.key === "Escape") {
          setSelected(new Set())
        } else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "a" && !typing && items.length > 0) {
          event.preventDefault()
          setSelected(new Set(items.map((item) => item.number)))
        }
      }}
    >
      <div className="glp-search-head" style={{ position: "sticky" }}>
        <div className="glp-search-box">
          <Icon name="search" size={13} className="glp-faint" />
          <input
            ref={input}
            value={query}
            placeholder={t("Search {kind}…", { kind: props.kind === "mr" ? t("merge requests") : t("issues") })}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") apply(query, "")
              if (event.key === "Escape") {
                setQuery(applied)
                input.current?.blur()
              }
            }}
          />
          <span className="glp-kbd">/</span>
        </div>
        {filtered.length > 0 ? (
          <div className="glp-suggestions" style={{ position: "relative", left: 0, right: 0, top: 0, boxShadow: "none" }}>
            {filtered.map((entry) => (
              <div key={entry.value} className="glp-suggestion" onMouseDown={(event) => { event.preventDefault(); insertToken(entry.value) }}>
                <span style={{ fontFamily: "var(--glp-mono)", fontSize: 11 }}>{entry.value}</span>
                {entry.hint ? <small>{entry.hint}</small> : null}
              </div>
            ))}
          </div>
        ) : null}
        <div className="glp-presets">
          <Menu label={t("Filter")} icon="filter" trigger="text" items={filterItems} />
          <Menu label={t("Sort")} icon="sort" trigger="text" items={sortItems} />
          <Menu
            label={t("Saved searches")}
            icon="archive"
            trigger="text"
            items={[
              ...saved.map((entry) => ({ label: entry.name, icon: "search", onSelect: () => apply(entry.query, ""), hint: "" })),
              ...(saved.length ? [{ type: "separator" as const }] : []),
              { label: t("Save search"), icon: "plus", onSelect: () => setDialog("save") },
            ]}
          />
          <Button size="sm" variant="ghost" icon="sparkles" onClick={() => { setSelected(new Set()); setDialog("triage") }}>{t("Triage")}</Button>
          <span className="glp-spacer" />
          {presets.map((entry) => (
            <button key={entry.id} type="button" className="glp-preset" data-selected={preset === entry.id ? "" : undefined} onClick={() => apply(entry.query, entry.id)}>
              {t(entry.label)}
            </button>
          ))}
        </div>
        {tokens.length > 0 ? (
          <div className="glp-chip-row">
            {tokens.map((token) => (
              <span key={token} className="glp-chip">{token}<button type="button" onClick={() => removeToken(token)} aria-label={t("Remove")}>×</button></span>
            ))}
            <span className="glp-spacer" />
            <button type="button" className="glp-preset" data-selected={prefs.compactRows ? "" : undefined} onClick={() => setPrefs((draft) => { draft.compactRows = !draft.compactRows })}>{t("Compact")}</button>
          </div>
        ) : null}
      </div>

      {selected.size > 0 ? bulkMenu : (
        <div className="glp-results-line">
          <span>{total > 0 ? t("{count} results", { count: total }) : search.isLoading ? t("Loading…") : t("No results")}</span>
          {search.isFetching && !search.isFetchingNextPage ? <Spinner /> : null}
          <span className="glp-spacer" />
          <span className="glp-faint">{t("↑↓ or j/k · Enter · / search · x select · a ask · Esc clear")}</span>
        </div>
      )}

      {search.error ? (
        <div className="glp-alert" data-tone="error"><Icon name="warning" size={13} /><span style={{ flex: 1 }}>{errorText(search.error)}</span><Button size="sm" onClick={() => void search.refetch()}>{t("Retry")}</Button></div>
      ) : null}

      {selected.size === 0 && search.isLoading ? <div className="glp-empty"><Spinner /><span>{t("Loading…")}</span></div> : null}
      {selected.size === 0 && !search.isLoading && items.length === 0 && !search.error ? <Empty icon={props.kind === "mr" ? "mr" : "issue"}>{props.kind === "mr" ? t("No merge requests") : t("No issues")}</Empty> : null}

      <div className="glp-list">
        {items.map((item, index) => {
          const isNew = seen > 0 && Date.parse(item.created) > seen
          const isUpdated = seen > 0 && !isNew && Date.parse(item.updated) > seen
          const isSelected = selected.has(item.number)
          const rowActionsForAgent = agentActions.filter((action) => action.repo === props.repo && action.number === item.number && action.item === props.kind)
          const pendingForRow = rowActionsForAgent.filter((action) => action.status === "proposed").length
          const runningForRow = rowActionsForAgent.filter((action) => action.status === "approved" || action.status === "running").length
          return (
            <div
              key={`${item.repo}#${item.number}`}
              data-index={index}
              className="glp-row-item"
              data-compact={prefs.compactRows ? "" : undefined}
              data-active={active === index ? "" : undefined}
              data-new={isNew ? "" : undefined}
              data-updated={isUpdated ? "" : undefined}
              style={{ background: active === index ? "var(--glp-hover)" : undefined }}
              onClick={(event) => {
                if ((event.target as HTMLElement).closest(".glp-icon-btn, .glp-menu, button, input, label")) return
                if (event.shiftKey) {
                  event.preventDefault()
                  toggle(item.number, true)
                  return
                }
                if (event.metaKey || event.ctrlKey) {
                  event.preventDefault()
                  toggle(item.number)
                  return
                }
                setActive(index)
                openRow(item)
              }}
            >
              <span className="glp-row-check" onClick={(event) => event.stopPropagation()} style={{ opacity: isSelected || active === index ? 1 : undefined }}>
                <input type="checkbox" checked={isSelected} onChange={() => toggle(item.number)} aria-label={t("Select")} />
              </span>
              <StateIcon kind={item.kind} state={item.state} draft={item.draft} />
              <div className="glp-row-content">
                <div className="glp-row-title" title={item.title}>
                  <span className="glp-num">{item.kind === "mr" ? "!" : "#"}{item.number}</span>
                  <span className="glp-ellipsis">{item.title}</span>
                  {item.draft && item.state === "OPEN" ? <Pill tone="draft">{t("Draft")}</Pill> : null}
                </div>
                <div className="glp-row-meta">
                  <span>@{item.author}</span>
                  {item.labels.length > 0 ? <span className="glp-labels">{item.labels.slice(0, 3).map((label) => <LabelChip key={label.name} label={label} />)}{item.labels.length > 3 ? <span className="glp-faint">+{item.labels.length - 3}</span> : null}</span> : null}
                  {item.kind === "mr" && item.head ? <span className="glp-mono" style={{ fontSize: 10 }}>{item.head}</span> : null}
                  {prefs.compactRows ? null : <Age date={item.updated} title />}
                  {item.comments > 0 ? <span className="glp-row" style={{ gap: 2 }}><Icon name="comment" size={10} />{item.comments}</span> : null}
                </div>
              </div>
              <div className="glp-row-end">
                {item.kind === "mr" ? <CheckDot state={item.checks} /> : null}
                {item.assignees && item.assignees.length > 0 ? item.assignees.slice(0, 2).map((name) => <Avatar key={name} name={name} size={16} />) : null}
                {rowActionsForAgent.length > 0 ? (
                  <Pill tone={pendingForRow > 0 ? "warn" : runningForRow > 0 ? "accent" : "success"} title={rowActionsForAgent.map((action) => `${action.kind}: ${action.status}`).join("\n")}>
                    {pendingForRow > 0 ? `${pendingForRow} ${t("to approve")}` : runningForRow > 0 ? t("running") : t("done")}
                  </Pill>
                ) : null}
                <span style={{ minWidth: 26, textAlign: "right" }}>{(item.kind === "mr" ? "!" : "#") + item.number}</span>
                <Menu label={t("More")} icon="dots" trigger="icon" items={rowMenu(item)} />
              </div>
            </div>
          )
        })}
      </div>
      <div ref={sentinel} style={{ height: 1 }} />
      {search.isFetchingNextPage ? <div className="glp-empty" data-inline><Spinner /> {t("Loading…")}</div> : null}

      <CloseDialog open={dialog === "close"} repo={props.repo} kind={props.kind} numbers={[...selected]} sessionID={props.sessionId} mode="bulk" onClose={() => setDialog(undefined)} onDone={() => { setSelected(new Set()); void queryClient.invalidateQueries({ queryKey: ["search"] }) }} />
      <CommentDialog open={dialog === "comment"} repo={props.repo} kind={props.kind} numbers={[...selected]} sessionID={props.sessionId} mode="bulk" onClose={() => setDialog(undefined)} onDone={() => { setSelected(new Set()); void queryClient.invalidateQueries({ queryKey: ["search"] }) }} />
      <BulkLabelDialog open={dialog === "label"} repo={props.repo} kind={props.kind} numbers={[...selected]} sessionID={props.sessionId} onClose={() => setDialog(undefined)} onDone={() => { setSelected(new Set()); void queryClient.invalidateQueries({ queryKey: ["search"] }) }} />
      <BulkAssignDialog open={dialog === "assign"} repo={props.repo} kind={props.kind} numbers={[...selected]} sessionID={props.sessionId} onClose={() => setDialog(undefined)} onDone={() => { setSelected(new Set()); void queryClient.invalidateQueries({ queryKey: ["search"] }) }} />
      <SavedSearchDialog open={dialog === "save"} repo={props.repo} kind={props.kind} query={query} onClose={() => setDialog(undefined)} onSaved={(entry) => apply(entry.query, "")} />
      <TriageDialog
        open={dialog === "triage"}
        repo={props.repo}
        kind={props.kind}
        cwd={props.cwd}
        query={selected.size > 0 ? null : applied}
        numbers={selected.size > 0 ? [...selected] : []}
        total={selected.size > 0 ? selected.size : total}
        sessionID={props.sessionId}
        onClose={() => setDialog(undefined)}
        onDone={() => setSelected(new Set())}
      />
      <RowActions open={!!rowActions} item={rowActions} menu={rowActions ? rowMenu(rowActions) : []} onClose={() => setRowActions(undefined)} />
      {startItem ? <StartWorkDialog open item={startItem} cwd={props.cwd} defaultBranch={props.overview.defaultBranch} onClose={() => setStartItem(undefined)} onDone={() => void queryClient.invalidateQueries({ queryKey: ["search"] })} /> : null}
    </div>
  )
}

function RowActions(props: { open: boolean; item: SearchItem | undefined; menu: MenuEntry[]; onClose: () => void }) {
  return (
    <Modal open={props.open} title={props.item ? `${props.item.kind === "mr" ? "!" : "#"}${props.item.number} ${props.item.title}` : ""} onClose={props.onClose} footer={<Button variant="ghost" onClick={props.onClose}>{t("Close")}</Button>}>
      <div className="glp-col">
        {props.menu.map((entry, index) =>
          entry.type === "separator" ? <div key={index} className="glp-menu-sep" /> : entry.type === "header" ? null : (
            <Button key={index} variant={(entry as any).danger ? "danger" : "ghost"} icon={(entry as any).icon} onClick={() => { props.onClose(); entry.onSelect() }}>
              {entry.label}
            </Button>
          ),
        )}
      </div>
    </Modal>
  )
}

function BulkLabelDialog(props: { open: boolean; repo: string; kind: ItemKind; numbers: number[]; sessionID: string; onClose: () => void; onDone: () => void }) {
  const meta = useMeta(props.repo, props.open)
  const [add, setAdd] = useState<string[]>([])
  const [remove, setRemove] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (props.open) {
      setAdd([])
      setRemove([])
    }
  }, [props.open])
  return (
    <Modal
      open={props.open}
      title={t("Label {count} items", { count: props.numbers.length })}
      onClose={props.onClose}
      footer={
        <>
          <Button variant="ghost" onClick={props.onClose}>{t("Cancel")}</Button>
          <Button
            variant="primary"
            busy={busy}
            disabled={add.length === 0 && remove.length === 0}
            onClick={async () => {
              setBusy(true)
              try {
                const result = await rpc<{ queued: number[] }>("agentQueue", { sessionID: props.sessionID, repo: props.repo, kind: "label", itemKind: props.kind, numbers: props.numbers, add, remove })
                toast({ tone: "success", title: t("Queued {count} label actions", { count: result.queued.length }) })
                props.onClose()
                props.onDone()
              } catch (error) {
                errorToast(error)
              } finally {
                setBusy(false)
              }
            }}
          >
            {t("Apply")}
          </Button>
        </>
      }
    >
      <div className="glp-split">
        <div className="glp-col" style={{ gap: 4 }}>
          <span className="glp-dim">{t("Add")}</span>
          {meta.data?.labels.map((label) => (
            <Checkbox key={label.name} checked={add.includes(label.name)} onChange={(value) => setAdd(value ? [...add, label.name] : add.filter((name) => name !== label.name))} label={label.name} />
          ))}
        </div>
        <div className="glp-col" style={{ gap: 4 }}>
          <span className="glp-dim">{t("Remove")}</span>
          {meta.data?.labels.map((label) => (
            <Checkbox key={label.name} checked={remove.includes(label.name)} onChange={(value) => setRemove(value ? [...remove, label.name] : remove.filter((name) => name !== label.name))} label={label.name} />
          ))}
        </div>
      </div>
    </Modal>
  )
}

function BulkAssignDialog(props: { open: boolean; repo: string; kind: ItemKind; numbers: number[]; sessionID: string; onClose: () => void; onDone: () => void }) {
  const [add, setAdd] = useState("")
  const [remove, setRemove] = useState("")
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (props.open) {
      setAdd("")
      setRemove("")
    }
  }, [props.open])
  return (
    <Modal
      open={props.open}
      title={t("Assign {count} items", { count: props.numbers.length })}
      onClose={props.onClose}
      footer={
        <>
          <Button variant="ghost" onClick={props.onClose}>{t("Cancel")}</Button>
          <Button
            variant="primary"
            busy={busy}
            onClick={async () => {
              setBusy(true)
              try {
                const result = await rpc<{ queued: number[] }>("agentQueue", {
                  sessionID: props.sessionID,
                  repo: props.repo,
                  kind: "assign",
                  itemKind: props.kind,
                  numbers: props.numbers,
                  add: add.split(",").map((name) => name.trim()).filter(Boolean),
                  remove: remove.split(",").map((name) => name.trim()).filter(Boolean),
                })
                toast({ tone: "success", title: t("Queued {count} assign actions", { count: result.queued.length }) })
                props.onClose()
                props.onDone()
              } catch (error) {
                errorToast(error)
              } finally {
                setBusy(false)
              }
            }}
          >
            {t("Apply")}
          </Button>
        </>
      }
    >
      <label className="glp-col" style={{ gap: 4 }}>
        <span className="glp-dim">{t("Assign (comma-separated usernames)")}</span>
        <input className="glp-input" value={add} onChange={(event) => setAdd(event.target.value)} placeholder="@me, alice" />
      </label>
      <label className="glp-col" style={{ gap: 4 }}>
        <span className="glp-dim">{t("Unassign (comma-separated usernames)")}</span>
        <input className="glp-input" value={remove} onChange={(event) => setRemove(event.target.value)} />
      </label>
    </Modal>
  )
}
