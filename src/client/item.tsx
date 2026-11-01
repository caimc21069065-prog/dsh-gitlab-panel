import { useEffect, useMemo, useRef, useState } from "react"
import { hunkAt, parsePatch } from "../shared/core"
import type { AgentAction, ChangedFile, DraftComment, DraftReview, Item, ItemKind, ReviewEvent, Thread } from "../shared/types"
import {
  api,
  errorText,
  queryClient,
  rpc,
  startAgentSession,
  toast,
  useAgent,
  useDrafts,
  useFiles,
  useItem,
  useJobLog,
  useOverview,
  usePrefs,
  useReviews,
  useRun,
} from "./api"
import {
  CloseDialog,
  CommentDialog,
  EditItemDialog,
  MergeDialog,
  StartWorkDialog,
  errorToast,
  itemQuote,
  openExternal,
  reviewPrompt,
} from "./actions"
import { DiffView, FileBlock, statusCode } from "./diff"
import { t, formatDate } from "./i18n"
import { nav } from "./nav"
import { setCurrentRepo } from "./mentions"
import {
  Age,
  Avatar,
  Button,
  CheckDot,
  Checkbox,
  Clamp,
  Empty,
  Icon,
  IconButton,
  LabelChip,
  Markdown,
  Menu,
  Modal,
  Pill,
  Spinner,
  StateIcon,
  TextArea,
  copyText,
  type MenuEntry,
} from "./ui"

export function ItemPage(props: { repo: string; kind: ItemKind; number: number; sessionId: string; cwd: string; onClose?: () => void }) {
  const item = useItem(props.repo, props.number, props.kind)
  const [tab, setTab] = useState<"overview" | "files" | "checks">("overview")
  const [dialog, setDialog] = useState<"comment" | "close" | "edit" | "start" | "merge" | undefined>()
  const [comment, setComment] = useState("")
  const [busy, setBusy] = useState<string>()
  const [editingProposal, setEditingProposal] = useState<AgentAction>()
  const [foldAll, setFoldAll] = useState<boolean | undefined>(undefined)
  const agent = useAgent(props.sessionId)
  const prefs = usePrefs()[0]
  const overview = useOverview(props.cwd, { enabled: !!props.cwd })
  const drafts = useDrafts(props.repo, props.number, props.sessionId)
  const data = item.data
  useEffect(() => {
    setCurrentRepo(props.repo)
  }, [props.repo])

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["item", props.repo, props.number] })
    void queryClient.invalidateQueries({ queryKey: ["reviews", props.repo, props.number] })
    void queryClient.invalidateQueries({ queryKey: ["drafts", props.repo, props.number] })
  }

  const act = async (id: string, work: () => Promise<unknown>, success?: string) => {
    if (busy) return
    setBusy(id)
    try {
      await work()
      if (success) toast({ tone: "success", title: success })
      refresh()
    } catch (error) {
      errorToast(error)
    } finally {
      setBusy(undefined)
    }
  }

  const postComment = async () => {
    if (!comment.trim()) return
    await act("comment", async () => {
      await rpc("comment", { repo: props.repo, number: props.number, kind: data?.kind ?? props.kind, body: comment })
      setComment("")
      toast({ tone: "success", title: t("Comment posted") })
    })
  }

  const reopen = () => void act("reopen", async () => { await rpc("setState", { repo: props.repo, number: props.number, kind: data?.kind ?? props.kind, open: true }) }, t("Reopened"))

  const quote = async () => {
    if (!data) return
    const { quoteToChat } = await import("./api")
    await quoteToChat(props.sessionId, props.cwd, itemQuote(data))
  }


  const checkout = () => void act("checkout", async () => { await rpc("checkoutMr", { cwd: props.cwd, repo: props.repo, number: props.number }); toast({ tone: "success", title: t("Checked out") }) })

  const preReview = async () => {
    if (!data) return
    await act("review", async () => {
      await startAgentSession({ cwd: props.cwd, prompt: reviewPrompt(data) })
      toast({ tone: "success", title: t("Session started") })
    })
  }

  if (item.isLoading && !data) {
    return <div className="glp-root" data-glp=""><div className="glp-empty"><Spinner /><span>{t("Loading…")}</span></div></div>
  }
  if (item.error || !data) {
    return (
      <div className="glp-root" data-glp="">
        <div className="glp-empty"><Icon name="warning" size={20} /><span>{item.error ? errorText(item.error) : t("Not found")}</span><Button size="sm" onClick={() => void item.refetch()}>{t("Retry")}</Button></div>
        </div>
    )
  }

  const state = data.draft && data.state === "OPEN" ? "DRAFT" : data.state
  const pending = (agent.data?.actions ?? []).filter((action) => action.repo === props.repo && action.number === props.number && (action.status === "proposed" || action.status === "approved" || action.status === "running"))
  const currentDraft = drafts.data?.find((draft) => draft.sessionID === props.sessionId) ?? undefined
  const otherDraft = drafts.data?.find((draft) => draft.sessionID !== props.sessionId)

  const menu: MenuEntry[] = [
    { label: t("Edit"), icon: "settings", onSelect: () => setDialog("edit") },
    { label: t("Add to chat"), icon: "comment", onSelect: () => void quote() },
    { label: t("Copy link"), icon: "copy", onSelect: () => { navigator.clipboard?.writeText(data.url); toast({ tone: "success", title: t("Copied") }) } },
    { label: t("Open on GitLab"), icon: "external", onSelect: () => openExternal(data.url) },
    { type: "separator" },
    ...(data.kind === "issue"
      ? [{ label: t("Start working"), icon: "play", onSelect: () => setDialog("start") }]
      : [
          { label: t("Pre-review with agent"), icon: "sparkles", onSelect: () => void preReview() },
          { label: t("Checkout"), icon: "download", onSelect: () => checkout() },
          { label: t("Merge…"), icon: "mr", disabled: data.state !== "OPEN", onSelect: () => setDialog("merge") },
        ]),
  ]

  return (
    <div className="glp-root" data-glp="" data-item-page>
      <div className="glp-topbar">
        <StateIcon kind={data.kind} state={data.state} draft={data.draft} />
        <span className="glp-repo glp-ellipsis" style={{ maxWidth: "none", flex: 1 }}>
          <span className="glp-faint">{data.repo}{data.kind === "mr" ? "!" : "#"}</span>{data.number}
          <span style={{ fontWeight: 400, marginLeft: 6 }}>{data.title}</span>
        </span>
        <div className="glp-topbar-actions">
          <IconButton icon="refresh" label={t("Refresh")} onClick={refresh} />
          <Menu items={menu} label={t("More")} icon="dots" />
          {props.onClose ? <IconButton icon="close" label={t("Close")} onClick={props.onClose} /> : null}
        </div>
      </div>

      <div className="glp-item-tabs">
        <button type="button" className="glp-item-tab" data-selected={tab === "overview" ? "" : undefined} onClick={() => setTab("overview")}>{t("Overview")}</button>
        {data.kind === "mr" ? (
          <>
            <button type="button" className="glp-item-tab" data-selected={tab === "files" ? "" : undefined} onClick={() => setTab("files")}>{t("Files")}{data.pr?.files ? <span className="glp-tab-count" style={{ marginLeft: 4 }}>{data.pr.files}</span> : null}</button>
            <button type="button" className="glp-item-tab" data-selected={tab === "checks" ? "" : undefined} onClick={() => setTab("checks")}>{t("Checks")}</button>
          </>
        ) : null}
        <span className="glp-spacer" />
        <span className="glp-faint" style={{ fontSize: 10.5 }}>{state === "DRAFT" ? t("Draft") : t(state === "MERGED" ? "Merged" : state === "CLOSED" ? "Closed" : "Open")}</span>
      </div>

      <div className="glp-body">
        {tab === "overview" ? (
          <div className="glp-item">
            <div className="glp-item-head">
              <div className="glp-col" style={{ flex: 1, gap: 4 }}>
                <div className="glp-item-title">{data.title}</div>
                <div className="glp-item-meta">
                  <Avatar name={data.author} size={16} /> @{data.author}
                  <span>· {t("opened {date}", { date: formatDate(data.created) })}</span>
                  <span>· {t("updated {date}", { date: formatDate(data.updated) })}</span>
                  {data.pr ? <><span>·</span><span className="glp-mono">{data.pr.head} → {data.pr.base}</span></> : null}
                </div>
              </div>
            </div>
            <div className="glp-item-actions">
              <Button size="sm" icon="comment" onClick={() => setDialog("comment")}>{t("Comment")}</Button>
              {data.state === "OPEN" ? (
                <Button size="sm" variant="ghost" icon="close" onClick={() => setDialog("close")}>{t("Close")}</Button>
              ) : data.state !== "MERGED" ? (
                <Button size="sm" variant="ghost" icon="undo" busy={busy === "reopen"} onClick={reopen}>{t("Reopen")}</Button>
              ) : null}
              {data.kind === "issue" ? <Button size="sm" variant="ghost" icon="play" onClick={() => setDialog("start")}>{t("Start working")}</Button> : null}
              <Button size="sm" variant="ghost" icon="comment" onClick={() => void quote()}>{t("Add to chat")}</Button>
              <span className="glp-spacer" />
              <Button size="sm" variant="ghost" icon="external" onClick={() => openExternal(data.url)}>{t("Open on GitLab")}</Button>
            </div>

            <div className="glp-row" style={{ flexWrap: "wrap", gap: 4 }}>
              {data.labels.map((label) => <LabelChip key={label.name} label={label} />)}
              {data.assignees.map((name) => <span key={name} className="glp-chip"><Avatar name={name} size={12} /> {name}</span>)}
              {data.milestone ? <Pill>{t("Milestone")}: {data.milestone}</Pill> : null}
              {data.pr?.review ? <Pill tone={data.pr.review === "APPROVED" ? "success" : "accent"}>{data.pr.review === "APPROVED" ? t("Approved") : t("Review required")}</Pill> : null}
              {data.pr?.mergeable ? <Pill tone={data.pr.mergeable === "can_be_merged" ? "success" : data.pr.mergeable === "cannot_be_merged" ? "danger" : undefined}>{t(data.pr.mergeable.replace(/_/g, " "))}</Pill> : null}
            </div>

            {pending.length > 0 ? <AgentBanner actions={pending} onEdit={setEditingProposal} onDone={refresh} /> : null}

            {currentDraft || otherDraft ? (
              <DraftBanner draft={currentDraft ?? otherDraft!} own={!!currentDraft} onReview={() => setTab("files")} />
            ) : null}

            <Clamp lines={prefs.foldItems ? 12 : 0} open={foldAll}>
              <Markdown text={data.body || `_${t("No description.")}_`} repo={data.repo} onOpenItem={(kind, number) => nav.openItem({ repo: data.repo, kind, number })} />
            </Clamp>

            {data.links && data.links.length > 0 ? (
              <div className="glp-col" style={{ gap: 3 }}>
                <strong style={{ fontSize: 11.5 }}>{data.kind === "mr" ? t("Closes") : t("Linked merge requests")}</strong>
                <div className="glp-row" style={{ flexWrap: "wrap" }}>
                  {data.links.map((link) => <button key={`${link.repo}#${link.number}`} type="button" className="glp-chip" style={{ border: 0, cursor: "pointer" }} onClick={() => nav.openItem({ repo: link.repo, kind: data.kind === "mr" ? "issue" : "mr", number: link.number })}>{link.repo === data.repo ? "" : `${link.repo} `}{data.kind === "mr" ? "#" : "!"}{link.number}</button>)}
                </div>
              </div>
            ) : null}

            <div className="glp-col" style={{ gap: 6 }}>
              <div className="glp-row">
                <strong style={{ flex: 1 }}>{t("Comments")} {data.comments.length > 0 ? <span className="glp-faint">{data.comments.length}</span> : null}</strong>
                {prefs.foldItems ? <><Button size="sm" variant="ghost" onClick={() => setFoldAll(true)}>{t("Fold all")}</Button><Button size="sm" variant="ghost" onClick={() => setFoldAll(false)}>{t("Unfold all")}</Button></> : null}
              </div>
              {data.comments.length === 0 ? <div className="glp-faint">{t("No comments yet.")}</div> : null}
              {data.comments.map((entry, index) => (
                <div key={entry.id ?? index} className="glp-comment">
                  <div className="glp-comment-head">
                    <Avatar name={entry.author} size={14} />
                    <strong style={{ color: "var(--glp-text-2)" }}>@{entry.author}</strong>
                    <span>· {formatDate(entry.created, "long")}</span>
                    <span className="glp-spacer" />
                    <button type="button" className="glp-chip" style={{ border: 0, cursor: "pointer" }} onClick={async () => {
                      const text = `> @${entry.author} in ${data.repo}${data.kind === "mr" ? "!" : "#"}${data.number}:\n\n${entry.body}`
                      const { quoteToChat } = await import("./api")
                      await quoteToChat(props.sessionId, props.cwd, text)
                    }}>{t("Add to chat")}</button>
                  </div>
                  <div className="glp-comment-body">
                    <Clamp lines={prefs.foldItems ? 10 : 0} open={foldAll}><Markdown text={entry.body} repo={data.repo} onOpenItem={(kind, number) => nav.openItem({ repo: data.repo, kind, number })} /></Clamp>
                  </div>
                </div>
              ))}
            </div>

            <div className="glp-col" style={{ gap: 5, borderTop: "0.5px solid var(--glp-border)", paddingTop: 10 }}>
              <TextArea rows={4} value={comment} onChange={(event) => setComment(event.target.value)} placeholder={t("Comment…")} />
              <div className="glp-row">
                <span className="glp-faint" style={{ fontSize: 10.5 }}>{t("Markdown is supported. ⌘⏎ posts.")}</span>
                <span className="glp-spacer" />
                <Button size="sm" variant="primary" busy={busy === "comment"} disabled={!comment.trim()} onClick={() => void postComment()}>{t("Comment")}</Button>
              </div>
            </div>
          </div>
        ) : null}

        {tab === "files" ? (
          <FilesView
            repo={props.repo}
            number={props.number}
            item={data}
            draft={currentDraft}
            sessionId={props.sessionId}
            cwd={props.cwd}
            onRefresh={refresh}
          />
        ) : null}

        {tab === "checks" ? <ChecksView repo={props.repo} item={data} /> : null}
      </div>

      <CommentDialog open={dialog === "comment"} repo={props.repo} kind={data.kind} numbers={[props.number]} sessionID={props.sessionId} mode="item" onClose={() => setDialog(undefined)} onDone={refresh} />
      <CloseDialog open={dialog === "close"} repo={props.repo} kind={data.kind} numbers={[props.number]} sessionID={props.sessionId} mode="item" onClose={() => setDialog(undefined)} onDone={refresh} />
      <EditItemDialog open={dialog === "edit"} item={data} onClose={() => setDialog(undefined)} onDone={refresh} />
      <MergeDialog open={dialog === "merge"} repo={props.repo} number={props.number} onClose={() => setDialog(undefined)} onDone={refresh} />
      <StartWorkDialog open={dialog === "start"} item={data} cwd={props.cwd} defaultBranch={overview.data?.defaultBranch ?? null} onClose={() => setDialog(undefined)} onDone={() => void queryClient.invalidateQueries({ queryKey: ["item", props.repo, props.number] })} />
      <EditProposalDialog action={editingProposal} onClose={() => setEditingProposal(undefined)} onDone={refresh} />
    </div>
  )
}

function AgentBanner(props: { actions: AgentAction[]; onEdit: (action: AgentAction) => void; onDone: () => void }) {
  const [busy, setBusy] = useState<string>()
  const decide = async (action: AgentAction, decision: "approve" | "skip") => {
    setBusy(action.id + decision)
    try {
      await rpc("agentDecide", { sessionID: action.sessionID, ids: [action.id], batch: null, decision })
      toast({ tone: "success", title: decision === "approve" ? t("Approved") : t("Skipped") })
      props.onDone()
    } catch (error) {
      errorToast(error)
    } finally {
      setBusy(undefined)
    }
  }
  return (
    <div className="glp-review-bar">
      <div className="glp-row">
        <Icon name="sparkles" size={13} />
        <strong style={{ flex: 1 }}>{t("Agent proposed changes")}</strong>
        <span className="glp-faint">{props.actions.length}</span>
      </div>
      {props.actions.map((action) => (
        <div key={action.id} className="glp-col" style={{ gap: 3, borderTop: "0.5px solid var(--glp-border)", paddingTop: 5 }}>
          <div className="glp-row"><span className="glp-status-pill" data-status={action.status}>{t(action.status)}</span><span className="glp-ellipsis" style={{ flex: 1 }}>{describeAction(action)}</span></div>
          {action.note ? <div className="glp-faint glp-wrap" style={{ fontSize: 11 }}>{action.note}</div> : null}
          {action.edited ? <Pill tone="accent">{t("edited by you")}</Pill> : null}
          <div className="glp-row">
            <Button size="sm" variant="primary" busy={busy === action.id + "approve"} disabled={action.status !== "proposed"} onClick={() => void decide(action, "approve")}>{t("Approve")}</Button>
            <Button size="sm" variant="ghost" disabled={action.status !== "proposed"} onClick={() => props.onEdit(action)}>{t("Edit")}</Button>
            <Button size="sm" variant="ghost" busy={busy === action.id + "skip"} disabled={action.status !== "proposed"} onClick={() => void decide(action, "skip")}>{t("Skip")}</Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export function describeAction(action: AgentAction) {
  const payload = action.payload
  if (action.kind === "comment") return `comment “${(payload.body ?? "").slice(0, 80)}”`
  if (action.kind === "close") return action.item === "mr" ? t("close") : `close (${t(payload.reason ?? "completed")})`
  if (action.kind === "reopen") return t("Reopen")
  if (action.kind === "label") return `${t("Labels")}: +${(payload.add ?? []).join(", ")} −${(payload.remove ?? []).join(", ")}`
  if (action.kind === "assign") return `${t("Assignees")}: +${(payload.add ?? []).join(", ")} −${(payload.remove ?? []).join(", ")}`
  return action.kind
}

export function EditProposalDialog(props: { action: AgentAction | undefined; onClose: () => void; onDone: () => void }) {
  const [body, setBody] = useState("")
  const [reason, setReason] = useState("completed")
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (props.action) {
      setBody(props.action.payload.body ?? "")
      setReason(props.action.payload.reason ?? "completed")
    }
  }, [props.action])
  return (
    <Modal
      open={!!props.action}
      title={t("Edit proposal")}
      onClose={props.onClose}
      footer={
        <>
          <Button variant="ghost" onClick={props.onClose}>{t("Cancel")}</Button>
          <Button
            variant="primary"
            busy={busy}
            onClick={async () => {
              if (!props.action) return
              setBusy(true)
              try {
                await rpc("agentEdit", { sessionID: props.action.sessionID, id: props.action.id, body: body || undefined, reason: props.action.kind === "close" ? reason : undefined })
                toast({ tone: "success", title: t("Saved") })
                props.onClose()
                props.onDone()
              } catch (error) {
                errorToast(error)
              } finally {
                setBusy(false)
              }
            }}
          >
            {t("Save")}
          </Button>
        </>
      }
    >
      {props.action?.kind === "close" && props.action.item === "issue" ? (
        <label className="glp-col" style={{ gap: 4 }}>
          <span className="glp-dim">{t("Reason")}</span>
          <select className="glp-select" value={reason} onChange={(event) => setReason(event.target.value)}>
            <option value="completed">{t("Completed")}</option>
            <option value="not_planned">{t("Not planned")}</option>
            <option value="duplicate">{t("Duplicate")}</option>
          </select>
        </label>
      ) : null}
      {["comment", "close", "reopen"].includes(props.action?.kind ?? "") ? (
        <label className="glp-col" style={{ gap: 4 }}>
          <span className="glp-dim">{t("Comment")}</span>
          <TextArea rows={6} value={body} onChange={(event) => setBody(event.target.value)} />
        </label>
      ) : null}
    </Modal>
  )
}

function DraftBanner(props: { draft: DraftReview; own: boolean; onReview: () => void }) {
  return (
    <div className="glp-review-bar">
      <div className="glp-row">
        <Icon name="sparkles" size={13} />
        <strong style={{ flex: 1 }}>{t("Draft review")}</strong>
        <Pill tone="accent">{t(props.draft.event === "APPROVE" ? "Approve" : props.draft.event === "REQUEST_CHANGES" ? "Request changes" : "Comment only")}</Pill>
      </div>
      <div className="glp-faint glp-wrap" style={{ fontSize: 11 }}>{props.draft.summary || props.draft.note}</div>
      <div className="glp-row">
        <span className="glp-faint" style={{ fontSize: 10.5 }}>{props.draft.comments.length} {t("inline comments")} · {props.own ? t("yours in this session") : t("from another session")}</span>
        <span className="glp-spacer" />
        {props.own ? <Button size="sm" variant="primary" onClick={props.onReview}>{t("Review")}</Button> : null}
      </div>
    </div>
  )
}

function FilesView(props: { repo: string; number: number; item: Item; draft: DraftReview | undefined; sessionId: string; cwd: string; onRefresh: () => void }) {
  const head = props.item.pr?.sha
  const files = useFiles(props.repo, props.number, head)
  const reviews = useReviews(props.repo, props.number, true)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [viewed, setViewed] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(`dsh-gitlab-panel.viewed:${props.repo}!${props.number}@${head ?? ""}`)
      return new Set(raw ? (JSON.parse(raw) as string[]) : [])
    } catch {
      return new Set()
    }
  })
  const [commentTarget, setCommentTarget] = useState<{ path: string; line: number; side: "LEFT" | "RIGHT" }>()
  const [commentBody, setCommentBody] = useState("")
  const [busy, setBusy] = useState(false)
  const draft = props.draft
  const prefs = usePrefs()[0]
  const threads = reviews.data?.threads ?? []

  useEffect(() => {
    try {
      localStorage.setItem(`dsh-gitlab-panel.viewed:${props.repo}!${props.number}@${head ?? ""}`, JSON.stringify([...viewed]))
    } catch {
      // Ignore.
    }
  }, [viewed, props.repo, props.number, head])

  const saveViewed = (path: string, value: boolean) => setViewed((current) => {
    const next = new Set(current)
    if (value) next.add(path)
    else next.delete(path)
    return next
  })

  const addComment = async () => {
    if (!commentTarget || !commentBody.trim() || !head) return
    setBusy(true)
    try {
      await rpc("reviewEdit", {
        sessionID: props.sessionId,
        repo: props.repo,
        number: props.number,
        sha: head,
        add: { path: commentTarget.path, line: commentTarget.line, side: commentTarget.side, startLine: null, body: commentBody },
      })
      setCommentTarget(undefined)
      setCommentBody("")
      props.onRefresh()
      toast({ tone: "success", title: t("Added to the review draft") })
    } catch (error) {
      errorToast(error)
    } finally {
      setBusy(false)
    }
  }

  const draftFor = (path: string) => (draft?.comments ?? []).filter((comment) => comment.path === path)
  const threadsFor = (path: string) => threads.filter((thread) => thread.path === path)

  return (
    <div>
      <div className="glp-files-toolbar">
        <span className="glp-faint" style={{ fontSize: 11 }}>{files.data?.length ?? 0} {t("files changed")}</span>
        <span className="glp-spacer" />
        <Button size="sm" variant="ghost" onClick={() => setCollapsed(collapsed.size > 0 ? new Set() : new Set((files.data ?? []).map((file) => file.path)))}>
          {collapsed.size > 0 ? t("Expand all") : t("Collapse all")}
        </Button>
      </div>
      {draft ? <ReviewBar repo={props.repo} number={props.number} item={props.item} draft={draft} onDone={props.onRefresh} /> : null}
      {!draft ? (
        <div className="glp-alert" data-tone="info">
          <Icon name="comment" size={13} />
          <span style={{ flex: 1 }}>{t("Click a line's number to start a review draft. Nothing is posted until you submit.")}</span>
          <Button size="sm" variant="ghost" icon="sparkles" onClick={async () => {
            try {
              await startAgentSession({ cwd: props.cwd, prompt: reviewPrompt(props.item) })
            } catch (error) {
              errorToast(error)
            }
          }}>{t("Pre-review with agent")}</Button>
        </div>
      ) : null}
      {files.isLoading ? <div className="glp-empty"><Spinner /><span>{t("Loading…")}</span></div> : null}
      {files.error ? <div className="glp-alert" data-tone="error">{errorText(files.error)}</div> : null}
      {files.data && files.data.length === 0 ? <Empty icon="file">{t("No changes")}</Empty> : null}
      {(files.data ?? []).map((file) => {
        const open = !collapsed.has(file.path)
        const fileThreads = threadsFor(file.path)
        const fileDrafts = draftFor(file.path)
        return (
          <FileBlock
            key={file.path}
            file={file}
            open={open}
            onToggle={() => setCollapsed((current) => {
              const next = new Set(current)
              if (next.has(file.path)) next.delete(file.path)
              else next.add(file.path)
              return next
            })}
            viewed={viewed.has(file.path)}
            onViewed={(value) => saveViewed(file.path, value)}
            onComment={(side, line) => {
              if (!head) return
              setCommentTarget({ path: file.path, line, side })
              setCommentBody("")
            }}
          >
            {fileThreads.map((thread) => <ThreadCard key={thread.id} repo={props.repo} number={props.number} thread={thread} onDone={props.onRefresh} />)}
            {fileDrafts.map((comment) => (
              <DraftCommentCard key={comment.id} repo={props.repo} number={props.number} sessionId={props.sessionId} comment={comment} onDone={props.onRefresh} />
            ))}
            {commentTarget?.path === file.path ? (
              <div style={{ padding: 8, background: "var(--glp-panel-2)", borderBottom: "0.5px solid var(--glp-border)" }}>
                <div className="glp-faint" style={{ fontSize: 11, marginBottom: 4 }}>
                  {file.path}:{commentTarget.line} ({commentTarget.side}) · {t("New review comment")}
                </div>
                <TextArea rows={3} autoFocus value={commentBody} onChange={(event) => setCommentBody(event.target.value)} placeholder={t("What should change?")} />
                <div className="glp-row" style={{ marginTop: 4 }}>
                  <Button size="sm" variant="primary" busy={busy} disabled={!commentBody.trim()} onClick={() => void addComment()}>{t("Add comment")}</Button>
                  <Button size="sm" variant="ghost" onClick={() => setCommentTarget(undefined)}>{t("Cancel")}</Button>
                  {file.patch ? <span className="glp-faint" style={{ fontSize: 10.5 }}>{t("Line {line}", { line: commentTarget.line })}</span> : null}
                </div>
              </div>
            ) : null}
            <DiffView
              patch={file.patch}
              maxHeight={prefs.foldItems ? 420 : 800}
              emptyText={t("No diff")}
              onComment={head ? (side, line) => {
                setCommentTarget({ path: file.path, line, side })
                setCommentBody("")
              } : undefined}
            />
          </FileBlock>
        )
      })}
    </div>
  )
}

function DraftCommentCard(props: { repo: string; number: number; sessionId: string; comment: DraftComment; onDone: () => void }) {
  const [editing, setEditing] = useState(false)
  const [body, setBody] = useState(props.comment.body)
  return (
    <div className="glp-thread" style={{ margin: 8 }}>
      <div className="glp-thread-head">
        <Icon name="comment" size={11} />
        <span className="glp-mono">{props.comment.path}:{props.comment.line} ({props.comment.side})</span>
        <span className="glp-spacer" />
        <Pill tone="accent">{t("Draft")}</Pill>
        {props.comment.edited ? <Pill>{t("edited")}</Pill> : null}
      </div>
      <div className="glp-thread-note">
        {editing ? (
          <>
            <TextArea rows={4} value={body} onChange={(event) => setBody(event.target.value)} />
            <div className="glp-row" style={{ marginTop: 4 }}>
              <Button size="sm" variant="primary" onClick={async () => {
                try {
                  await rpc("reviewEdit", { sessionID: props.sessionId, repo: props.repo, number: props.number, update: { id: props.comment.id, body } })
                  setEditing(false)
                  props.onDone()
                } catch (error) {
                  errorToast(error)
                }
              }}>{t("Save")}</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>{t("Cancel")}</Button>
            </div>
          </>
        ) : (
          <Markdown text={props.comment.body} repo={props.repo} />
        )}
      </div>
      <div className="glp-thread-actions">
        <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>{t("Edit")}</Button>
        <Button size="sm" variant="ghost" onClick={async () => {
          try {
            await rpc("reviewEdit", { sessionID: props.sessionId, repo: props.repo, number: props.number, remove: props.comment.id })
            props.onDone()
          } catch (error) {
            errorToast(error)
          }
        }}>{t("Delete")}</Button>
      </div>
    </div>
  )
}

function ReviewBar(props: { repo: string; number: number; item: Item; draft: DraftReview; onDone: () => void }) {
  const [summary, setSummary] = useState(props.draft.summary)
  const [event, setEvent] = useState<ReviewEvent>(props.draft.event)
  const [busy, setBusy] = useState(false)
  const [drift, setDrift] = useState<{ moved: DraftComment[]; message: string }>()
  useEffect(() => {
    setSummary(props.draft.summary)
    setEvent(props.draft.event)
  }, [props.draft.updatedAt, props.draft.summary, props.draft.event])
  const submit = async (force: boolean) => {
    setBusy(true)
    try {
      await rpc("reviewEdit", { sessionID: props.draft.sessionID, repo: props.repo, number: props.number, summary, event })
      const result = await rpc<{ submitted: boolean; url: string | null; moved: DraftComment[]; message: string }>("reviewSubmit", { sessionID: props.draft.sessionID, repo: props.repo, number: props.number, force })
      if (!result.submitted) {
        setDrift({ moved: result.moved, message: result.message })
        return
      }
      toast({ tone: "success", title: t("The review was submitted"), description: result.message })
      setDrift(undefined)
      props.onDone()
    } catch (error) {
      errorToast(error)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="glp-review-bar" style={{ margin: 10 }}>
      <div className="glp-row">
        <Icon name="sparkles" size={13} />
        <strong style={{ flex: 1 }}>{t("Draft review")}</strong>
        <span className="glp-faint">{props.draft.comments.length} {t("inline comments")}</span>
        <Button size="sm" variant="ghost" onClick={async () => {
          try {
            await rpc("reviewDiscard", { sessionID: props.draft.sessionID, repo: props.repo, number: props.number })
            toast({ tone: "success", title: t("Draft review discarded.") })
            props.onDone()
          } catch (error) {
            errorToast(error)
          }
        }}>{t("Discard draft")}</Button>
      </div>
      {props.draft.note ? <div className="glp-faint glp-wrap" style={{ fontSize: 11 }}>{props.draft.note}</div> : null}
      <TextArea rows={4} value={summary} onChange={(event) => setSummary(event.target.value)} placeholder={t("Summary")} />
      <div className="glp-row" style={{ flexWrap: "wrap" }}>
        <select className="glp-select" style={{ width: "auto" }} value={event} onChange={(e) => setEvent(e.target.value as ReviewEvent)}>
          <option value="COMMENT">{t("Comment only")}</option>
          <option value="APPROVE">{t("Approve MR")}</option>
          <option value="REQUEST_CHANGES">{t("Request changes on MR")}</option>
        </select>
        <span className="glp-spacer" />
        <Button size="sm" variant="primary" busy={busy} onClick={() => void submit(false)}>{t("Submit review")}</Button>
      </div>
      {drift ? (
        <div className="glp-alert" data-tone="info" style={{ margin: 0 }}>
          <div style={{ flex: 1 }}>
            <strong>{t("New commits since drafted")}</strong>
            <div className="glp-faint glp-wrap" style={{ fontSize: 11 }}>{drift.message}</div>
          </div>
          <Button size="sm" variant="primary" busy={busy} onClick={() => void submit(true)}>{t("Submit anyway")}</Button>
        </div>
      ) : null}
    </div>
  )
}

function ThreadCard(props: { repo: string; number: number; thread: Thread; onDone: () => void }) {
  const [reply, setReply] = useState("")
  const [busy, setBusy] = useState(false)
  return (
    <div className="glp-thread" style={{ margin: 8 }} data-resolved={props.thread.resolved ? "" : undefined}>
      <div className="glp-thread-head">
        <span className="glp-mono">{props.thread.path}{props.thread.line ? `:${props.thread.line}` : ""}</span>
        {props.thread.outdated ? <Pill tone="warn">{t("Outdated")}</Pill> : null}
        {props.thread.resolved ? <Pill tone="success">{t("Resolved")}</Pill> : null}
        <span className="glp-spacer" />
        <Button size="sm" variant="ghost" onClick={async () => {
          try {
            await rpc("resolveThread", { repo: props.repo, number: props.number, thread: props.thread.id, resolved: !props.thread.resolved })
            props.onDone()
          } catch (error) {
            errorToast(error)
          }
        }}>{props.thread.resolved ? t("Unresolve") : t("Resolve")}</Button>
      </div>
      {props.thread.comments[0]?.hunk ? <div className="glp-thread-hunk">{props.thread.comments[0].hunk}</div> : null}
      {props.thread.comments.map((comment) => (
        <div key={comment.id} className="glp-thread-note">
          <div className="glp-row" style={{ marginBottom: 2 }}><Avatar name={comment.author} size={13} /><strong style={{ fontSize: 11 }}>@{comment.author}</strong><span className="glp-faint" style={{ fontSize: 10 }}>{formatDate(comment.created)}</span></div>
          <Markdown text={comment.body} repo={props.repo} />
        </div>
      ))}
      <div className="glp-thread-actions">
        <input className="glp-input" placeholder={t("Reply…")} value={reply} onChange={(event) => setReply(event.target.value)} style={{ flex: 1 }} />
        <Button size="sm" busy={busy} disabled={!reply.trim()} onClick={async () => {
          setBusy(true)
          try {
            await rpc("replyThread", { repo: props.repo, number: props.number, thread: props.thread.id, body: reply })
            setReply("")
            props.onDone()
          } catch (error) {
            errorToast(error)
          } finally {
            setBusy(false)
          }
        }}>{t("Reply")}</Button>
      </div>
    </div>
  )
}

function ChecksView(props: { repo: string; item: Item }) {
  const pipeline = props.item.pr?.checks[0]
  const run = useRun(props.repo, pipeline?.id ?? 0, !!pipeline?.id)
  const [job, setJob] = useState<number>()
  if (!pipeline) {
    return <Empty icon="pipeline">{t("No pipeline for this merge request.")}<div className="glp-faint" style={{ fontSize: 11 }}>{t("Pipeline checks come from the MR's head pipeline.")}</div></Empty>
  }
  return (
    <div className="glp-checks">
      <div className="glp-row">
        <Icon name="pipeline" size={13} />
        <strong style={{ flex: 1 }}>{pipeline.name ?? t("Pipeline")}</strong>
        <CheckDot state={pipeline.state} />
        <Button size="sm" variant="ghost" icon="external" onClick={() => pipeline.url && openExternal(pipeline.url)}>{t("Open on GitLab")}</Button>
        <Button size="sm" variant="ghost" disabled={props.item.state !== "OPEN" || !pipeline.id} onClick={async () => {
          try {
            if (!window.confirm(t("Retry this pipeline?"))) return
            await rpc("rerun", { repo: props.repo, id: pipeline.id })
            toast({ tone: "success", title: t("Retried") })
          } catch (error) {
            errorToast(error)
          }
        }}>{t("Retry")}</Button>
        <Button size="sm" variant="ghost" onClick={async () => {
          try {
            if (!pipeline.id || !window.confirm(t("Cancel this pipeline?"))) return
            await rpc("cancelRun", { repo: props.repo, id: pipeline.id })
            toast({ tone: "success", title: t("Canceled") })
          } catch (error) {
            errorToast(error)
          }
        }}>{t("Cancel")}</Button>
      </div>
      {run.isLoading ? <div className="glp-row"><Spinner /> {t("Loading…")}</div> : null}
      {run.error ? <div className="glp-error">{errorText(run.error)}</div> : null}
      {sortJobs(run.data?.jobs ?? []).map((entry) => (
        <div key={entry.id} className="glp-check-row" data-state={entry.conclusion === "failed" ? "failure" : undefined} onClick={() => setJob(job === entry.id ? undefined : entry.id)}>
          <CheckDot state={entry.conclusion === "failed" ? "failure" : entry.conclusion === "success" ? "success" : ["running", "pending", "created"].includes(entry.conclusion) ? "pending" : "none"} />
          <span className="glp-ellipsis" style={{ flex: 1 }}>{entry.name}</span>
          {entry.stage ? <Pill>{entry.stage}</Pill> : null}
          <span className="glp-faint" style={{ fontSize: 10.5 }}>{entry.conclusion || entry.status}</span>
          <Icon name={job === entry.id ? "chevron-down" : "chevron-right"} size={10} />
        </div>
      ))}
      {job ? <JobPanel repo={props.repo} job={job} onClose={() => setJob(undefined)} /> : null}
    </div>
  )
}

function sortJobs(jobs: import("../shared/types").Job[]) {
  const weight = (job: import("../shared/types").Job) => (job.conclusion === "failed" ? 0 : ["running", "pending", "created"].includes(job.conclusion) ? 1 : job.conclusion === "success" ? 2 : 3)
  return [...jobs].sort((a, b) => weight(a) - weight(b))
}

export function JobPanel(props: { repo: string; job: number; onClose?: () => void }) {
  const log = useJobLog(props.repo, props.job, false)
  return (
    <div style={{ border: "0.5px solid var(--glp-border)", borderRadius: 6, overflow: "hidden", marginTop: 4 }}>
      <div className="glp-row" style={{ padding: "4px 8px", background: "var(--glp-panel-2)" }}>
        <Icon name="file" size={11} />
        <strong style={{ flex: 1 }}>{t("Log")}</strong>
        <Button size="sm" variant="ghost" onClick={() => { if (log.data) { navigator.clipboard?.writeText(log.data); toast({ tone: "success", title: t("Copied") }) } }}>{t("Copy")}</Button>
        {props.onClose ? <Button size="sm" variant="ghost" onClick={props.onClose}>{t("Close")}</Button> : null}
      </div>
      {log.isLoading ? <div className="glp-empty" data-inline><Spinner /> {t("Loading…")}</div> : null}
      {log.error ? <div className="glp-alert" data-tone="error">{errorText(log.error)}</div> : null}
      {log.data ? <pre className="glp-mono" style={{ margin: 0, padding: 8, maxHeight: 420, overflow: "auto", fontSize: 10.5, whiteSpace: "pre-wrap", background: "var(--glp-panel)" }}>{log.data}</pre> : null}
    </div>
  )
}
