import { useEffect, useMemo, useRef, useState } from "react"
import { cleanupCandidates, type CleanupCandidate } from "../shared/cleanup"
import { findRefs, issueFromBranch, mrFor } from "../shared/core"
import { layout, type GraphRow } from "../shared/graph"
import type { Branch, Commit, FileChange, ItemKind, MergeRequest, Overview } from "../shared/types"
import { api, errorText, getPrefs, keys, openSessionAt, queryClient, rpc, toast, updatePrefs, useAgent, useBranches, useCommit, useDiff, useInbox, useItem, useLog, useMrs, useOverview, usePrefs } from "./api"
import { CleanupDialog, CreateIssueDialog, CreateMrDialog, MergeDialog, NewBranchDialog, PromptDialog, SavedRepliesDialog, finishBranch, finishWorktree, openExternal, errorToast } from "./actions"
import { DiffView } from "./diff"
import { t } from "./i18n"
import { nav, type MainPage, type MainParams } from "./nav"
import { setCurrentRepo } from "./mentions"
import { SearchView } from "./search"
import { ActivityView } from "./activity"
import { InboxView } from "./inbox"
import { RunsView } from "./ci"
import { Age, Button, CheckDot, Empty, Icon, IconButton, Menu, Modal, Pill, Segmented, Spinner, StateIcon,  copyText, type MenuEntry } from "./ui"

export function MainPanel(props: { sessionId: string; cwd: string; params?: MainParams }) {
  const [prefs, setPrefs] = usePrefs()
  const overview = useOverview(props.cwd, { poll: 4_000 })
  const overviewData = overview.data
  const [page, setPage] = useState<MainPage | undefined>(props.params?.show)
  const [view, setView] = useState<"changes" | "history" | "mrs" | "issues">(props.params?.view ?? prefs.view)
  const [branchOpen, setBranchOpen] = useState(false)
  const [dialog, setDialog] = useState<"newBranch" | "createMr" | "createIssue" | "cleanup" | "replies" | "settings" | undefined>()
  const [mergeMr, setMergeMr] = useState<MergeRequest>()
  const [busy, setBusy] = useState<string>()
  const [cleanup, setCleanup] = useState<CleanupCandidate[]>([])
  const [prompt, setPrompt] = useState<{ title: string; placeholder?: string; initial?: string; onSubmit: (value: string) => Promise<void> }>()

  useEffect(() => {
    if (props.params?.show) setPage(props.params.show)
    if (props.params?.view) setView(props.params.view)
  }, [props.params?.show, props.params?.view])

  useEffect(() => {
    if (!overviewData?.remote && (view === "mrs" || view === "issues")) setView("changes")
  }, [overviewData?.remote, view])

  useEffect(() => {
    setCurrentRepo(overviewData?.remote?.path)
  }, [overviewData?.remote?.path])

  const agent = useAgent(props.sessionId)
  const inbox = useInbox(true)
  const mrs = useMrs(props.cwd, !!overviewData?.remote)
  const unread = inbox.data?.notifications.filter((entry) => entry.unread).length ?? 0
  const proposed = agent.data?.actions.filter((action) => action.status === "proposed").length ?? 0

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["overview", props.cwd] })
    void queryClient.invalidateQueries({ queryKey: ["branches", props.cwd] })
    void queryClient.invalidateQueries({ queryKey: ["log", props.cwd] })
    void queryClient.invalidateQueries({ queryKey: ["outgoing", props.cwd] })
    void queryClient.invalidateQueries({ queryKey: ["mrs", props.cwd] })
  }

  const run = async (id: string, work: () => Promise<void>) => {
    if (busy) return
    setBusy(id)
    try {
      await work()
    } catch (error) {
      errorToast(error)
    } finally {
      setBusy(undefined)
      refresh()
    }
  }

  const repo = overviewData?.remote?.path
  const branches = useBranches(props.cwd, branchOpen || dialog === "cleanup" || dialog === "createMr")
  const merged = useMerged(props.cwd, dialog === "cleanup" || branchOpen)
  const mergedData = merged.data ?? []
  const branchMrs = useBranchMrs(props.cwd, (branches.data ?? []).filter((branch) => !branch.remote).map((branch) => branch.name), branchOpen)

  const openCleanup = () => {
    const candidates = cleanupCandidates({
      branches: branches.data ?? [],
      current: overviewData?.branch ?? null,
      base: overviewData?.defaultBranch ?? null,
      merged: mergedData,
      mrFor: (name) => branchMrs.data?.items.find((item) => item.head === name && item.state !== "CLOSED") ?? branchMrs.data?.items.find((item) => item.head === name),
    })
    setCleanup(candidates)
    setDialog("cleanup")
  }

  const topItems: MenuEntry[] = [
    { label: t("Fetch"), icon: "download", disabled: !!busy, onSelect: () => void run("fetch", async () => { await rpc("fetch", { cwd: props.cwd }); refresh() }) },
    { label: t("Refresh"), icon: "refresh", onSelect: refresh },
    { type: "separator" },
    { label: t("Pipelines"), icon: "pipeline", disabled: !overviewData?.remote, onSelect: () => { setPage(page === "runs" ? undefined : "runs") } },
    { label: t("Inbox"), icon: "inbox", onSelect: () => setPage(page === "inbox" ? undefined : "inbox") },
    { label: t("Activity"), icon: "checklist", onSelect: () => setPage(page === "activity" ? undefined : "activity") },
    { type: "separator" },
    { label: t("Open on GitLab"), icon: "external", disabled: !overviewData?.remote, onSelect: () => overviewData?.remote && openExternal(overviewData.remote.web) },
    { label: t("New issue"), icon: "plus", disabled: !overviewData?.remote, onSelect: () => setDialog("createIssue") },
    { label: t("Saved replies"), icon: "comment", disabled: !overviewData?.remote, onSelect: () => setDialog("replies") },
    { type: "separator" },
    { label: t("Header chip"), icon: "branch", checked: prefs.headerChip, onSelect: () => setPrefs((draft) => { draft.headerChip = !draft.headerChip }) },
    { label: t("Settings"), icon: "settings", onSelect: () => setDialog("settings") },
  ]

  if (overview.isLoading && !overviewData) {
    return <Shell><div className="glp-empty"><Spinner /><span>{t("Loading…")}</span></div></Shell>
  }
  if (overview.error) {
    return (
      <Shell>
        <div className="glp-empty">
          <Icon name="warning" size={20} />
          <span>{errorText(overview.error)}</span>
          <Button size="sm" onClick={refresh}>{t("Retry")}</Button>
        </div>
      </Shell>
    )
  }
  if (!overviewData) {
    return <Shell><div className="glp-empty"><Icon name="branch" size={22} /><span>{t("Not a git repository")}</span></div></Shell>
  }

  const current = overviewData
  const currentIssue = current.remote && current.branch
    ? getPrefs().issueBranches[`${current.remote.path}:${current.branch}`] ?? issueFromBranch(current.branch)
    : undefined
  const openItem = (kind: ItemKind, number: number, repo?: string) => {
    const target = repo ?? current.remote?.path
    if (target) nav.openItem({ repo: target, kind, number })
  }

  return (
    <div className="glp-root" data-glp="" data-glp-root>
      <div className="glp-topbar">
        <span className="glp-repo glp-ellipsis" title={current.root}>
          {current.remote ? <><span className="glp-faint">{current.remote.owner}/</span>{current.remote.repo}</> : current.name}
        </span>
        <div className="glp-tabs" role="tablist">
          {(["changes", "history", ...(current.remote ? (["mrs", "issues"] as const) : [])] as const).map((id) => {
            const labels = { changes: t("Changes"), history: t("History"), mrs: t("MRs"), issues: t("Issues") }
            const selected = !page && view === id
            return (
              <button key={id} type="button" role="tab" className="glp-tab" aria-selected={selected} data-selected={selected ? "" : undefined} title={id === "mrs" ? t("Merge requests") : labels[id]} onClick={() => { setPage(undefined); setView(id as any); setPrefs((draft) => { draft.view = id as any }) }}>
                {labels[id]}
                {id === "changes" && current.files.length > 0 ? <span className="glp-tab-count">{current.files.length}</span> : null}
              </button>
            )
          })}
        </div>
        <div className="glp-topbar-actions">
          <span className="glp-bell">
            <IconButton icon="checklist" label={t("Activity")} pressed={page === "activity"} onClick={() => setPage(page === "activity" ? undefined : "activity")} />
            {proposed > 0 ? <span className="glp-count-badge" data-tone="warn">{proposed > 99 ? "99+" : proposed}</span> : null}
          </span>
          <span className="glp-bell">
            <IconButton icon="bell" label={t("Inbox")} pressed={page === "inbox"} onClick={() => setPage(page === "inbox" ? undefined : "inbox")} />
            {unread > 0 ? <span className="glp-count-badge">{unread > 99 ? "99+" : unread}</span> : null}
          </span>
          <Menu items={topItems} label={t("More")} icon="dots" />
        </div>
      </div>

      {page ? (
        <div className="glp-branchbar" style={{ padding: 0 }}>
          <div className="glp-row" style={{ padding: "3px 8px" }}>
            <IconButton icon="arrow-left" label={t("Back")} onClick={() => setPage(undefined)} />
            <span style={{ fontWeight: 600 }}>{page === "inbox" ? t("Inbox") : page === "activity" ? t("Activity") : t("Pipelines")}</span>
            {page === "runs" && current.branch ? <span className="glp-faint glp-ellipsis">{current.branch}</span> : null}
          </div>
        </div>
      ) : view === "changes" || view === "history" ? (
        <BranchBar
          overview={current}
          cwd={props.cwd}
          mrs={mrs.data}
          busy={busy}
          onOpenItem={openItem}
          onPickBranch={() => setBranchOpen(true)}
          onRun={run}
          onDialog={setDialog}
          onMerge={setMergeMr}
          onCleanup={openCleanup}
          onRefresh={refresh}
        />
      ) : null}

      <div className="glp-body">
        {page === "inbox" ? <InboxView repo={current.remote?.path ?? ""} cwd={props.cwd} sessionId={props.sessionId} onOpenItem={openItem} /> : null}
        {page === "activity" ? <ActivityView sessionId={props.sessionId} repo={current.remote?.path ?? ""} cwd={props.cwd} onOpenItem={openItem} /> : null}
        {page === "runs" && current.remote ? <RunsView repo={current.remote.path} branch={current.branch} cwd={props.cwd} /> : null}
        {!page && view === "changes" ? <ChangesView overview={current} cwd={props.cwd} onOpenItem={openItem} onPrompt={(input) => setPrompt(input)} /> : null}
        {!page && view === "history" ? <HistoryView overview={current} cwd={props.cwd} onOpenItem={openItem} onOpenCommit={(sha) => current.remote && nav.openCommit({ repo: current.remote.path, sha })} onPrompt={(input) => setPrompt(input)} /> : null}
        {!page && view === "mrs" && current.remote ? (
          <SearchView kind="mr" repo={current.remote.path} cwd={props.cwd} sessionId={props.sessionId} overview={current} onOpenItem={openItem} />
        ) : null}
        {!page && view === "issues" && current.remote ? (
          <SearchView kind="issue" repo={current.remote.path} cwd={props.cwd} sessionId={props.sessionId} overview={current} onOpenItem={openItem} />
        ) : null}
      </div>

      <CreateMrDialog open={dialog === "createMr"} cwd={props.cwd} branch={current.branch} defaultBranch={current.defaultBranch} branches={branches.data ?? []} issueNumber={currentIssue} onClose={() => setDialog(undefined)} onDone={refresh} />
      <CreateIssueDialog open={dialog === "createIssue"} cwd={props.cwd} onClose={() => setDialog(undefined)} onDone={refresh} />
      <MergeDialog open={!!mergeMr} repo={current.remote?.path ?? ""} number={mergeMr?.number ?? 0} onClose={() => setMergeMr(undefined)} onDone={refresh} />
      <NewBranchDialog open={dialog === "newBranch"} cwd={props.cwd} start={current.defaultBranch ?? undefined} onClose={() => setDialog(undefined)} onDone={refresh} />
      <CriticalCleanup open={dialog === "cleanup"} candidates={cleanup} cwd={props.cwd} onClose={() => setDialog(undefined)} onDone={refresh} />
      <SavedRepliesDialog open={dialog === "replies"} repo={current.remote?.path ?? ""} onClose={() => setDialog(undefined)} />
      <SettingsDialog open={dialog === "settings"} overview={current} onClose={() => setDialog(undefined)} />
      <BranchPicker
        open={branchOpen}
        cwd={props.cwd}
        overview={current}
        branches={branches.data ?? []}
        branchMrs={branchMrs.data?.items ?? []}
        busy={busy}
        onClose={() => setBranchOpen(false)}
        onRefresh={refresh}
        onRun={run}
        onNewBranch={() => { setBranchOpen(false); setDialog("newBranch") }}
        onCleanup={() => { setBranchOpen(false); openCleanup() }}
      />
      <PromptDialog open={!!prompt} title={prompt?.title ?? ""} placeholder={prompt?.placeholder} initial={prompt?.initial} onClose={() => setPrompt(undefined)} onSubmit={async (value) => { await prompt?.onSubmit(value) }} />
    </div>
  )
}

function useMerged(cwd: string, enabled: boolean) {
  return useCommitLikeQuery(["merged", cwd], () => rpc<string[]>("mergedBranches", { cwd }), enabled)
}

function useBranchMrs(cwd: string, names: string[], enabled: boolean) {
  return useCommitLikeQuery(["branchMrs", cwd, names.join(",")], () => rpc<{ error: string | null; items: MergeRequest[] }>("branchMrs", { cwd, names, fresh: false }), enabled && names.length > 0)
}

function useCommitLikeQuery<T>(key: (string | number)[], work: () => Promise<T>, enabled: boolean) {
  const [state, setState] = useState<{ data?: T; loading: boolean; error?: string }>({ loading: false })
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!enabled) return
    let alive = true
    setState((current) => ({ ...current, loading: true }))
    work()
      .then((data) => alive && setState({ data, loading: false }))
      .catch((error: unknown) => alive && setState({ loading: false, error: errorText(error) }))
    return () => {
      alive = false
    }
  }, [enabled, tick, key.join("|")])
  return { data: state.data, isLoading: state.loading, error: state.error, refetch: () => setTick((value) => value + 1) }
}

function Shell(props: { children: React.ReactNode }) {
  return <div className="glp-root" data-glp="">{props.children}</div>
}

export function SettingsDialog(props: { open: boolean; overview: Overview; onClose: () => void }) {
  const [prefs, setPrefs] = usePrefs()
  const [lang, setLang] = useState(getPrefs() ? localStorage.getItem("dsh-gitlab-panel.lang") ?? "auto" : "auto")
  const importLang = async (value: string) => {
    setLang(value)
    const i18n = await import("./i18n")
    if (value === "auto") {
      localStorage.removeItem("dsh-gitlab-panel.lang")
      i18n.setLanguage(/^zh/i.test(navigator.language) ? "zh" : "en")
    } else i18n.setLanguage(value as "en" | "zh")
  }
  return (
    <Modal
      open={props.open}
      title={t("Settings")}
      onClose={props.onClose}
      width={520}
      footer={<Button variant="ghost" onClick={props.onClose}>{t("Close")}</Button>}
    >
      <div className="glp-settings-card" style={{ margin: 0 }}>
        <div className="glp-row"><strong style={{ flex: 1 }}>{t("Token & requirements")}</strong><Pill tone={props.overview.gitlab ? "danger" : "success"}>{props.overview.gitlab ? t("Missing") : t("Connected")}</Pill></div>
        <div className="glp-dim glp-wrap">{props.overview.gitlab ?? t("GitLab data is available through GITLAB_TOKEN or glab auth login.")}</div>
        <div className="glp-faint" style={{ fontSize: 11 }}>
          {t("The panel needs git on the host. GitLab data needs GITLAB_TOKEN or glab auth login.")} <code>GITLAB_TOKEN</code>, <code>GITLAB_HOST</code>, <code>GITLAB_PROJECT</code>.
        </div>
      </div>
      <div className="glp-settings-card" style={{ margin: 0 }}>
        <div className="glp-row"><strong style={{ flex: 1 }}>{t("Appearance")}</strong></div>
        <label className="glp-row"><span style={{ flex: 1 }}>{t("Header chip")}</span><input type="checkbox" checked={prefs.headerChip} onChange={(event) => setPrefs((draft) => { draft.headerChip = event.target.checked })} /></label>
        <label className="glp-row"><span style={{ flex: 1 }}>{t("Compact rows")}</span><input type="checkbox" checked={prefs.compactRows} onChange={(event) => setPrefs((draft) => { draft.compactRows = event.target.checked })} /></label>
        <label className="glp-row"><span style={{ flex: 1 }}>{t("Fold long content")}</span><input type="checkbox" checked={prefs.foldItems} onChange={(event) => setPrefs((draft) => { draft.foldItems = event.target.checked })} /></label>
        <label className="glp-row"><span style={{ flex: 1 }}>{t("Language")}</span>
          <select className="glp-select" style={{ width: 130 }} value={lang} onChange={(event) => void importLang(event.target.value)}>
            <option value="auto">{t("Auto")}</option>
            <option value="en">English</option>
            <option value="zh">中文</option>
          </select>
        </label>
      </div>
      <div className="glp-faint" style={{ fontSize: 11 }}>
        {props.overview.remote ? `${props.overview.remote.host} · ${props.overview.remote.path}` : t("No project selected")}
      </div>
    </Modal>
  )
}

function CriticalCleanup(props: { open: boolean; candidates: CleanupCandidate[]; cwd: string; onClose: () => void; onDone: () => void }) {
  return <CleanupDialog open={props.open} candidates={props.candidates} cwd={props.cwd} onClose={props.onClose} onDone={props.onDone} />
}

function BranchBar(props: {
  overview: Overview
  cwd: string
  mrs: { items: MergeRequest[]; error: string | null } | undefined
  busy: string | undefined
  onOpenItem: (kind: ItemKind, number: number) => void
  onPickBranch: () => void
  onRun: (id: string, work: () => Promise<void>) => Promise<void>
  onDialog: (dialog: "createMr" | "newBranch" | "replies") => void
  onMerge: (mr: MergeRequest) => void
  onCleanup: () => void
  onRefresh: () => void
}) {
  const o = props.overview
  const upstreamNote = () => {
    if (!o.branch) return undefined
    if (!o.upstream) return t("no upstream")
    return o.upstream.endsWith(`/${o.branch}`) ? undefined : `→ ${o.upstream}`
  }
  const mr = mrFor(props.mrs as any, o.branch, o.head, o.defaultBranch) as MergeRequest | undefined
  const issueNumber = issueFromBranch(o.branch ?? "")
  const linked = o.remote ? getPrefs().issueBranches[`${o.remote.path}:${o.branch}`] ?? issueNumber : issueNumber
  // The issue this branch works on, so the strip can say when a merge already closed it.
  const issue = useItem(o.remote?.path ?? "", linked ?? 0, "issue")
  const inWorktree = !!o.worktreeRoot && o.worktreeRoot !== o.root
  const repo = o.remote?.path ?? ""
  const next = (): { label: string; icon: string; id: string; run: () => void } | undefined => {
    if (!mr || !repo) return undefined
    if (mr.state === "MERGED" && inWorktree) {
      return { label: t("Finish worktree"), icon: "branch", id: "finish", run: () => void props.onRun("finish", async () => { await finishWorktree(props.cwd, o, mr, o.worktreeRoot) }) }
    }
    if (mr.state === "MERGED" && o.defaultBranch) {
      return { label: t("Finish and switch to {base}", { base: o.defaultBranch }), icon: "branch", id: "finish", run: () => void props.onRun("finish", async () => { await finishBranch(props.cwd, o, mr) }) }
    }
    if (o.upstream && o.ahead > 0) {
      return { label: t("Push"), icon: "cloud-upload", id: "push", run: () => void props.onRun("push", async () => { await rpc("push", { cwd: props.cwd, force: false }) }) }
    }
    if (mr.state !== "OPEN") return undefined
    if (mr.draft) {
      return { label: t("Mark ready"), icon: "eye", id: "ready", run: () => void props.onRun("ready", async () => { await rpc("setDraft", { repo, number: mr.number, draft: false }); toast({ tone: "success", title: t("Marked ready") }) }) }
    }
    // GitLab has no review decision to wait on; approvals and the pipeline are what stand between here and a merge.
    if (mr.review !== "REVIEW_REQUIRED" && mr.checks !== "failure" && mr.checks !== "pending") {
      return { label: t("Merge…"), icon: "mr", id: "merge", run: () => props.onMerge(mr) }
    }
    return undefined
  }
  const step = next()
  const linkedIssue = issue.data?.kind === "issue" && issue.data.number === linked ? issue.data : undefined
  // A merge that carried "Closes #N" closes the issue on GitLab; the strip says so instead of showing a stale title.
  const closedByMerge = mr?.state === "MERGED" && linkedIssue?.state === "CLOSED"
  useEffect(() => {
    if (mr?.state !== "MERGED" || !linked || !repo) return
    void queryClient.invalidateQueries({ queryKey: keys.item(repo, linked, "issue") })
  }, [mr?.state, linked, repo])
  const menu: MenuEntry[] = [
    { label: t("New branch"), icon: "plus", onSelect: () => props.onDialog("newBranch") },
    { label: t("Create merge request"), icon: "mr", disabled: !o.branch || !o.remote, onSelect: () => props.onDialog("createMr") },
    { label: t("Force push"), icon: "cloud-upload", disabled: !o.branch || !!props.busy, onSelect: () => {
      if (!window.confirm(t("Force push {branch} with --force-with-lease? Commits it replaces are lost.", { branch: o.branch ?? "" }))) return
      void props.onRun("push", async () => { await rpc("push", { cwd: props.cwd, force: true }) })
    } },
    { type: "separator" },
    { label: t("Stash"), icon: "archive", disabled: o.files.length === 0 || !!props.busy, onSelect: () => void props.onRun("stash", async () => { await rpc("stash", { cwd: props.cwd }); toast({ tone: "success", title: t("Stashed") }) }) },
    { label: t("Pop stash ({count})", { count: o.stashes }), icon: "undo", disabled: o.stashes === 0 || !!props.busy, onSelect: () => void props.onRun("stashPop", async () => { await rpc("stashPop", { cwd: props.cwd }); toast({ tone: "success", title: t("Stash restored") }) }) },
    { type: "separator" },
    { label: t("Clean up…"), icon: "archive", onSelect: props.onCleanup },
  ]
  return (
    <div className="glp-branchbar">
      <div className="glp-branch-row">
        <button type="button" className="glp-branch-button glp-ellipsis" title={t("Switch branch")} onClick={props.onPickBranch}>
          <Icon name="branch" size={13} />
          <span className="glp-ellipsis">{o.branch ?? `${t("Detached")} ${o.head?.slice(0, 7) ?? ""}`}</span>
          <Icon name="chevron-down" size={11} className="glp-faint" />
        </button>
        {upstreamNote() ? <span className="glp-upstream glp-ellipsis">{upstreamNote()}</span> : null}
        <span className="glp-spacer" />
        {o.upstream || !o.branch ? (
          <>
            <button type="button" className="glp-icon-btn" title={t("Pull")} disabled={!!props.busy || !o.upstream} onClick={() => void props.onRun("pull", async () => { await rpc("pull", { cwd: props.cwd }) })}>
              <span className="glp-ahead-behind" data-active={o.behind > 0 ? "" : undefined}><Icon name="download" size={13} />{o.behind}</span>
            </button>
            <button type="button" className="glp-icon-btn" title={t("Push")} disabled={!!props.busy} onClick={() => void props.onRun("push", async () => { await rpc("push", { cwd: props.cwd, force: false }) })}>
              <span className="glp-ahead-behind" data-active={o.ahead > 0 ? "" : undefined}><Icon name="upload" size={13} />{o.ahead}</span>
            </button>
          </>
        ) : (
          <Button size="sm" icon="upload" disabled={!!props.busy} onClick={() => void props.onRun("push", async () => { await rpc("push", { cwd: props.cwd, force: false }) })}>{t("Publish")}</Button>
        )}
        <IconButton icon="refresh" label={t("Fetch")} disabled={!!props.busy} onClick={() => void props.onRun("fetch", async () => { await rpc("fetch", { cwd: props.cwd }); props.onRefresh() })} />
        <Menu items={menu} label={t("More")} icon="dots" />
      </div>
      {o.operation ? (
        <div className="glp-alert" data-tone="info" style={{ margin: 0 }}>
          <Icon name="warning" size={13} />
          <span style={{ flex: 1 }}>{t("{operation} in progress", { operation: t(o.operation) })}</span>
          <Button size="sm" variant="ghost" disabled={!!props.busy} onClick={() => { if (window.confirm(t("Abort the operation?"))) void props.onRun("abort", async () => { await rpc("abort", { cwd: props.cwd }) }) }}>{t("Abort")}</Button>
          <Button size="sm" disabled={!!props.busy} onClick={() => void props.onRun("continue", async () => { await rpc("continue", { cwd: props.cwd }) })}>{t("Continue")}</Button>
        </div>
      ) : null}
      {o.branch && o.remote && o.branch !== o.defaultBranch ? (
        <div className="glp-branch-strip" data-tone={mr?.state === "MERGED" ? "success" : mr?.checks === "failure" ? "danger" : mr?.checks === "pending" ? "warn" : undefined}>
          {mr ? (
            <>
              <StateIcon kind="mr" state={mr.state} draft={mr.draft} />
              <button type="button" style={{ border: 0, background: "transparent", padding: 0, cursor: "pointer", color: "inherit", flex: 1, minWidth: 0, textAlign: "left" }} className="glp-ellipsis" onClick={() => props.onOpenItem("mr", mr.number)}>
                <span className="glp-faint">!{mr.number}</span> {mr.title}
              </button>
              <CheckDot state={mr.checks} />
              {mr.review ? <Pill tone={mr.review === "APPROVED" ? "success" : "accent"}>{mr.review === "APPROVED" ? t("Approved") : t("Review required")}</Pill> : null}
              <Pill tone={mr.state === "MERGED" ? "success" : undefined}>{mr.state === "MERGED" ? t("Merged") : mr.draft ? t("Draft") : t("Open")}</Pill>
            </>
          ) : (
            <>
              <Icon name="mr" size={12} />
              <span className="glp-faint" style={{ flex: 1 }}>{t("No merge request")} · {o.ahead} {t("ahead")}</span>
              <Button size="sm" variant="ghost" onClick={() => props.onDialog("createMr")}>{t("Create merge request")}</Button>
            </>
          )}
          {linked && o.remote ? (
            <button type="button" className="glp-chip glp-ellipsis" style={{ border: 0, cursor: "pointer", maxWidth: 240 }} title={linkedIssue?.title} onClick={() => props.onOpenItem("issue", linked)}>
              <StateIcon kind="issue" state={linkedIssue?.state ?? "OPEN"} />
              <span className="glp-faint">#{linked}</span>
              {closedByMerge ? t("closed by this merge") : linkedIssue?.title ?? ""}
            </button>
          ) : null}
          {step ? <Button size="sm" icon={step.icon} busy={props.busy === step.id} disabled={!!props.busy} onClick={step.run}>{step.label}</Button> : null}
        </div>
      ) : null}
    </div>
  )
}

// Changes.

function groupFiles(files: FileChange[]) {
  return {
    conflicts: files.filter((file) => file.conflicted),
    staged: files.filter((file) => !file.conflicted && !file.untracked && file.index !== "."),
    changes: files.filter((file) => !file.conflicted && !file.untracked && file.worktree !== "." && file.index === "."),
    untracked: files.filter((file) => file.untracked),
    partially: files.filter((file) => !file.conflicted && !file.untracked && file.worktree !== "." && file.index !== "."),
  }
}

function ChangesView(props: { overview: Overview; cwd: string; onOpenItem: (kind: ItemKind, number: number) => void; onPrompt: (input: any) => void }) {
  const o = props.overview
  const groups = groupFiles(o.files)
  const [open, setOpen] = useState<Record<string, boolean>>({ conflicts: true, staged: true, changes: true, untracked: true })
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState<string>()
  const [amend, setAmend] = useState(false)
  const outgoing = useOutgoing(props.cwd)
  const staged = groups.staged.length + groups.partially.length > 0
  const any = o.files.length > 0

  const act = async (id: string, work: () => Promise<unknown>, success?: string) => {
    if (busy) return
    setBusy(id)
    try {
      await work()
      if (success) toast({ tone: "success", title: success })
      void queryClient.invalidateQueries({ queryKey: ["overview", props.cwd] })
      void queryClient.invalidateQueries({ queryKey: ["outgoing", props.cwd] })
      void queryClient.invalidateQueries({ queryKey: ["log", props.cwd] })
    } catch (error) {
      errorToast(error)
    } finally {
      setBusy(undefined)
    }
  }

  const commit = async (push: boolean) => {
    if (groups.conflicts.length > 0) {
      toast({ tone: "error", title: t("Resolve the conflicts first") })
      return
    }
    if (!message.trim() && !amend) {
      toast({ tone: "error", title: t("Write a commit message first") })
      return
    }
    if (amend && o.upstream && o.ahead === 0 && !window.confirm(t("Amending a pushed commit rewrites history. Continue?"))) return
    await act("commit", async () => {
      // Amending takes only what is staged: sweeping in every change would rewrite history with work the user did not pick.
      await rpc("commit", { cwd: props.cwd, message: message.trim(), amend, all: !amend && !staged })
      if (push) await rpc("push", { cwd: props.cwd, force: amend })
      setMessage("")
      setAmend(false)
      toast({ tone: "success", title: t(push ? "Committed and pushed" : "Committed") })
    })
  }

  const fileRow = (file: FileChange, group: string) => {
    const key = `${group}:${file.path}`
    const code = file.conflicted ? "U" : file.untracked ? "?" : group === "staged" ? file.index : file.worktree
    // Staging a conflicted file is how it is marked resolved, so it stays available there.
    const canStage = group !== "staged"
    const canUnstage = group === "staged" || (group === "changes" && file.index !== ".")
    return (
      <div key={key}>
        <div className="glp-file" data-selected={expanded[key] ? "" : undefined} onClick={() => setExpanded((current) => ({ ...current, [key]: !current[key] }))}>
          <Icon name={expanded[key] ? "chevron-down" : "chevron-right"} size={10} />
          <span className="glp-file-status" data-code={code}>{code}</span>
          <span className="glp-file-name" title={file.origPath ? `${file.origPath} → ${file.path}` : file.path}><span>{file.origPath ? `${file.origPath} → ${file.path}` : file.path}</span></span>
          <span className="glp-file-actions">
            {canStage ? <IconButton icon="plus" label={file.conflicted ? t("Mark resolved") : t("Stage")} onClick={(event) => { event.stopPropagation(); void act("stage", () => rpc("stage", { cwd: props.cwd, paths: [file.path] })) }} /> : null}
            {canUnstage ? <IconButton icon="undo" label={t("Unstage")} onClick={(event) => { event.stopPropagation(); void act("unstage", () => rpc("unstage", { cwd: props.cwd, paths: [file.path] })) }} /> : null}
            {file.conflicted ? null : (
              <IconButton
                icon="close"
                label={t("Discard")}
                onClick={(event) => {
                  event.stopPropagation()
                  if (!window.confirm(t("Discard the changes in {path}? This cannot be undone.", { path: file.path }))) return
                  void act("discard", () => rpc("discard", { cwd: props.cwd, tracked: file.untracked ? [] : [file.path], untracked: file.untracked ? [file.path] : [] }), t("Discarded"))
                }}
              />
            )}
          </span>
        </div>
        {expanded[key] ? <FileDiff cwd={props.cwd} path={file.path} staged={group === "staged"} untracked={file.untracked} /> : null}
      </div>
    )
  }

  const discardAll = (files: FileChange[], what: string) => {
    if (files.length === 0) return
    if (!window.confirm(t("Discard the changes in {count} files? This cannot be undone.", { count: files.length }))) return
    void act("discard", () => rpc("discard", {
      cwd: props.cwd,
      tracked: files.filter((file) => !file.untracked).map((file) => file.path),
      untracked: files.filter((file) => file.untracked).map((file) => file.path),
    }), what)
  }

  return (
    <div>
      {!any ? (
        <Empty icon="check-circle">{t("No changes")}{o.head ? <div className="glp-faint" style={{ fontSize: 11 }}>{t("The working tree is clean.")}</div> : null}</Empty>
      ) : (
        <>
          {groups.conflicts.length > 0 ? (
            <FileGroup title={t("Conflicts")} open={!!open.conflicts} onToggle={() => setOpen((current) => ({ ...current, conflicts: !current.conflicts }))} count={groups.conflicts.length} icon="warning"
              extra={<Button size="sm" variant="ghost" onClick={(event) => { event.stopPropagation(); void act("stage", () => rpc("stage", { cwd: props.cwd, paths: groups.conflicts.map((file) => file.path) }), t("Marked resolved")) }}>{t("Mark all resolved")}</Button>}>
              {groups.conflicts.map((file) => fileRow(file, "conflicts"))}
            </FileGroup>
          ) : null}
          {groups.staged.length > 0 ? (
            <FileGroup title={t("Staged")} open={!!open.staged} onToggle={() => setOpen((current) => ({ ...current, staged: !current.staged }))} count={groups.staged.length}
              extra={<Button size="sm" variant="ghost" onClick={(event) => { event.stopPropagation(); void act("unstage", () => rpc("unstage", { cwd: props.cwd, paths: groups.staged.map((file) => file.path) })) }}>{t("Unstage all")}</Button>}>
              {groups.staged.map((file) => fileRow(file, "staged"))}
            </FileGroup>
          ) : null}
          {groups.changes.length + groups.partially.length > 0 ? (
            <FileGroup title={t("Changes")} open={!!open.changes} onToggle={() => setOpen((current) => ({ ...current, changes: !current.changes }))} count={groups.changes.length + groups.partially.length}
              extra={
                <span className="glp-row" style={{ gap: 2 }}>
                  <Button size="sm" variant="ghost" onClick={(event) => { event.stopPropagation(); discardAll([...groups.changes, ...groups.partially], t("Discarded")) }}>{t("Discard all")}</Button>
                  <Button size="sm" variant="ghost" onClick={(event) => { event.stopPropagation(); void act("stage", () => rpc("stage", { cwd: props.cwd, paths: [...groups.changes, ...groups.partially].map((file) => file.path) })) }}>{t("Stage all")}</Button>
                </span>
              }>
              {[...groups.changes, ...groups.partially].map((file) => fileRow(file, "changes"))}
            </FileGroup>
          ) : null}
          {groups.untracked.length > 0 ? (
            <FileGroup title={t("Untracked")} open={!!open.untracked} onToggle={() => setOpen((current) => ({ ...current, untracked: !current.untracked }))} count={groups.untracked.length}
              extra={
                <span className="glp-row" style={{ gap: 2 }}>
                  <Button size="sm" variant="ghost" onClick={(event) => { event.stopPropagation(); discardAll(groups.untracked, t("Discarded")) }}>{t("Discard all")}</Button>
                  <Button size="sm" variant="ghost" onClick={(event) => { event.stopPropagation(); void act("stage", () => rpc("stage", { cwd: props.cwd, paths: groups.untracked.map((file) => file.path) })) }}>{t("Stage all")}</Button>
                </span>
              }>
              {groups.untracked.map((file) => fileRow(file, "untracked"))}
            </FileGroup>
          ) : null}
        </>
      )}

      <div className="glp-commit-box">
        <textarea
          className="glp-textarea"
          rows={3}
          value={message}
          placeholder={t("Commit message")}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              event.preventDefault()
              void commit(false)
            }
          }}
        />
        <div className="glp-commit-actions">
          <Button size="sm" variant="primary" icon="check" disabled={(!staged && !any) || !!busy || groups.conflicts.length > 0} busy={busy === "commit"} onClick={() => void commit(false)}>
            {staged ? t("Commit") : t("Commit all")}
          </Button>
          <Button size="sm" disabled={(!staged && !any) || !!busy || groups.conflicts.length > 0} onClick={() => void commit(true)}>{t("Commit & push")}</Button>
          <Button size="sm" variant="ghost" disabled={(!staged && !any) || !!busy} onClick={() => setAmend((value) => !value)} data-variant={amend ? "primary" : "ghost"}>{t("Amend")}</Button>
          <span className="glp-spacer" />
          {groups.conflicts.length > 0
            ? <span className="glp-faint" style={{ fontSize: 10.5 }}>{t("Mark every conflict resolved to commit.")}</span>
            : <span className="glp-faint" style={{ fontSize: 10.5 }}><span className="glp-kbd">⌘⏎</span> {t("commits")}</span>}
        </div>
      </div>

      {outgoing.data && (outgoing.data.unpushed.length > 0 || outgoing.data.ahead > 0) ? (
        <div className="glp-unpushed">
          <div className="glp-row" style={{ marginBottom: 4 }}>
            <Icon name="upload" size={12} />
            <strong style={{ flex: 1 }}>{t("Unpushed commits")}</strong>
            <Pill tone="warn">{outgoing.data.unpushed.length}</Pill>
            <Button size="sm" variant="ghost" onClick={() => void act("push", async () => { await rpc("push", { cwd: props.cwd, force: false }) }, t("Pushed"))}>{t("Push")}</Button>
            <Button size="sm" variant="ghost" onClick={() => { setAmend(true); toast({ tone: "info", title: t("Amend is on; write a message or leave it empty to keep the last one.") }) }}>{t("Amend")}</Button>
            <Button size="sm" variant="ghost" onClick={() => {
              if (!window.confirm(t("Undo the last commit and keep its changes unstaged?"))) return
              void act("undo", async () => { await rpc("undoCommit", { cwd: props.cwd }); toast({ tone: "success", title: t("Last commit undone") }) })
            }}>{t("Undo last commit")}</Button>
          </div>
          {outgoing.data.unpushed.slice(0, 8).map((commit) => (
            <div key={commit.hash} className="glp-unpushed-row">
              <span className="glp-hash">{commit.hash.slice(0, 7)}</span>
              <span className="glp-ellipsis" style={{ flex: 1 }}>{commit.subject}</span>
              <Age date={commit.date} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function FileGroup(props: { title: string; open: boolean; onToggle: () => void; count: number; children: React.ReactNode; extra?: React.ReactNode; icon?: string }) {
  return (
    <section className="glp-group">
      <div className="glp-group-head" role="button" tabIndex={0} onClick={props.onToggle} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") props.onToggle() }}>
        <Icon name={props.open ? "chevron-down" : "chevron-right"} size={12} />
        <span className="glp-group-title">{props.title}</span>
        <span className="glp-tab-count">{props.count}</span>
        <span className="glp-spacer" />
        {props.extra}
      </div>
      {props.open ? <div className="glp-group-body">{props.children}</div> : null}
    </section>
  )
}

function FileDiff(props: { cwd: string; path: string; staged: boolean; untracked: boolean }) {
  const diff = useDiff(props.cwd, props.path, props.staged, props.untracked)
  return <div className="glp-file-diff"><DiffView patch={diff.data} loading={diff.isLoading} error={diff.error ? errorText(diff.error) : undefined} maxHeight={320} /></div>
}

function useOutgoing(cwd: string) {
  const [state, setState] = useState<{ data?: { unpushed: Commit[]; base: string | null; ahead: number } }>({})
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let alive = true
    const load = () => rpc<{ unpushed: Commit[]; base: string | null; ahead: number }>("outgoing", { cwd }).then((data) => alive && setState({ data }), () => undefined)
    void load()
    const timer = setInterval(load, 10_000)
    return () => {
      alive = false
      clearInterval(timer)
    }
  }, [cwd, tick])
  return state
}

// History.

const LANE = 14
const ROW = 28
const PAD = 8
const LANE_COLORS = ["#4b5bd7", "#2f9e44", "#f76b15", "#e5484d", "#8e4ec6", "#12a594", "#ffb224", "#e93d82", "#3e63dd", "#46a758"]

function HistoryView(props: { overview: Overview; cwd: string; onOpenItem: (kind: ItemKind, number: number) => void; onOpenCommit: (sha: string) => void; onPrompt: (input: any) => void }) {
  const [scope, setScope] = useState<"current" | "local" | "all">(getPrefs().graphScope)
  const log = useLog(props.cwd, scope, 300)
  const rows = useMemo(() => layout((log.data ?? []).map((commit) => ({ hash: commit.hash, parents: commit.parents }))), [log.data])
  const [selected, setSelected] = useState<string>()
  const [busy, setBusy] = useState<string>()
  const [message, setMessage] = useState("")
  const remote = props.overview.remote

  const act = async (id: string, work: () => Promise<unknown>, success?: string) => {
    if (busy) return
    setBusy(id)
    try {
      await work()
      if (success) toast({ tone: "success", title: success })
      void queryClient.invalidateQueries({ queryKey: ["overview", props.cwd] })
      void queryClient.invalidateQueries({ queryKey: ["log", props.cwd] })
      void queryClient.invalidateQueries({ queryKey: ["branches", props.cwd] })
    } catch (error) {
      errorToast(error)
    } finally {
      setBusy(undefined)
    }
  }

  if (log.isLoading && !log.data) return <div className="glp-empty"><Spinner /><span>{t("Loading…")}</span></div>
  if (log.error) return <div className="glp-empty"><Icon name="warning" /><span>{errorText(log.error)}</span></div>
  if (!log.data || log.data.length === 0) return <Empty icon="branch">{t("No commits")}</Empty>

  return (
    <div>
      <div className="glp-graph-scope">
        <Segmented
          value={scope}
          onChange={(value) => {
            setScope(value)
            updatePrefs((draft) => { draft.graphScope = value })
          }}
          options={[
            { value: "current", label: t("Current"), title: t("Only this branch") },
            { value: "local", label: t("Local"), title: t("Local branches and their upstreams") },
            { value: "all", label: t("All"), title: t("Every ref") },
          ]}
        />
        <span className="glp-spacer" />
        <span className="glp-faint" style={{ fontSize: 10.5 }}>{log.data.length} {t("commits")}</span>
      </div>
      {log.data.map((commit, index) => (
        <div key={commit.hash}>
          <div className="glp-graph-row" data-selected={selected === commit.hash ? "" : undefined} onClick={() => setSelected(selected === commit.hash ? undefined : commit.hash)}>
            <GraphCell row={rows[index]} />
            <div className="glp-graph-main">
              <div className="glp-col" style={{ flex: 1, minWidth: 0 }}>
                <div className="glp-row" style={{ minWidth: 0 }}>
                  {commit.refs.filter((ref) => ref.kind !== "head" || ref.name === "HEAD").slice(0, 2).map((ref) => <RefTag key={ref.name + ref.kind} name={ref.name} kind={ref.kind} />)}
                  <span className="glp-graph-subject" title={commit.subject}>{commit.subject}</span>
                </div>
                <div className="glp-graph-meta">
                  {commit.author} · <Age date={commit.date} title /> · <span className="glp-mono">{commit.hash.slice(0, 7)}</span>
                </div>
              </div>
            </div>
          </div>
          {selected === commit.hash ? (
            <CommitDetail
              commit={commit}
              cwd={props.cwd}
              remote={remote?.web}
              busy={busy}
              message={message}
              setMessage={setMessage}
              onAct={act}
              onOpenCommit={props.onOpenCommit}
            />
          ) : null}
        </div>
      ))}
      <div style={{ height: 60 }} />
    </div>
  )
}

function GraphCell(props: { row: GraphRow | undefined }) {
  const row = props.row
  if (!row) return <div className="glp-graph-svg" style={{ width: PAD * 2 + LANE }} />
  const lanes = Math.min(8, Math.max(1, row.width))
  const width = PAD * 2 + lanes * LANE
  const x = (lane: number) => PAD + lane * LANE
  const y = ROW / 2
  return (
    <svg className="glp-graph-svg" width={width} height={ROW} viewBox={`0 0 ${width} ${ROW}`} aria-hidden>
      {row.below.map((lane) => (lane.lane < lanes ? <line key={`below-${lane.lane}`} x1={x(lane.lane)} y1={y} x2={x(lane.lane)} y2={ROW} stroke={LANE_COLORS[lane.color % LANE_COLORS.length]} strokeWidth={1.3} opacity={0.7} /> : null))}
      {row.edges.map((edge, index) => {
        if (edge.from >= lanes && edge.to >= lanes) return null
        const from = x(Math.min(edge.from, lanes - 1))
        const to = x(Math.min(edge.to, lanes - 1))
        if (edge.kind === "pass" && edge.from === edge.to) return <line key={index} x1={from} y1={0} x2={from} y2={ROW} stroke={LANE_COLORS[edge.color % LANE_COLORS.length]} strokeWidth={1.3} opacity={0.7} />
        if (edge.kind === "in") return <path key={index} d={`M ${to} ${y} C ${to} ${y - 8}, ${from} ${y - 8}, ${from} 0`} stroke={LANE_COLORS[edge.color % LANE_COLORS.length]} strokeWidth={1.3} fill="none" opacity={0.85} />
        return <path key={index} d={`M ${from} ${y} C ${from} ${y + 8}, ${to} ${y + 8}, ${to} ${ROW}`} stroke={LANE_COLORS[edge.color % LANE_COLORS.length]} strokeWidth={1.3} fill="none" opacity={0.85} />
      })}
      <circle cx={x(Math.min(row.col, lanes - 1))} cy={y} r={3.6} fill={LANE_COLORS[row.color % LANE_COLORS.length]} stroke="var(--glp-bg)" strokeWidth={1.5} />
    </svg>
  )
}

function RefTag(props: { name: string; kind: string }) {
  const label = props.name.replace(/^origin\//, "origin/")
  return <span className="glp-ref" data-kind={props.kind} title={props.name}>{label}</span>
}

function CommitDetail(props: {
  commit: Commit
  cwd: string
  remote: string | undefined
  busy: string | undefined
  message: string
  setMessage: (value: string) => void
  onAct: (id: string, work: () => Promise<unknown>, success?: string) => Promise<void>
  onOpenCommit: (sha: string) => void
}) {
  const details = useCommit(props.cwd, props.commit.hash)
  const [openFile, setOpenFile] = useState<string>()
  const diff = useDiff(props.cwd, openFile ?? "", false, false, !!openFile)
  const file = details.data?.files.find((entry) => entry.path === openFile)
  return (
    <div className="glp-commit-detail">
      <div className="glp-commit-detail-actions">
        <Button size="sm" variant="ghost" icon="copy" onClick={() => { copyText(props.commit.hash); toast({ tone: "success", title: t("Copied") }) }}>{t("Copy hash")}</Button>
        <Button size="sm" variant="ghost" icon="branch" onClick={() => void props.onAct("checkout", async () => { await rpc("checkout", { cwd: props.cwd, ref: props.commit.hash, track: null }); toast({ tone: "success", title: t("Checked out") }) })}>{t("Checkout")}</Button>
        <Button size="sm" variant="ghost" icon="plus" onClick={() => {
          const name = window.prompt(t("New branch from here"), `fix/${props.commit.hash.slice(0, 7)}`)
          if (name) void props.onAct("branch", async () => { await rpc("createBranch", { cwd: props.cwd, name, start: props.commit.hash, checkout: true }); toast({ tone: "success", title: t("Branch created") }) })
        }}>{t("New branch from here")}</Button>
        <Button size="sm" variant="ghost" onClick={() => void props.onAct("cherry", async () => { await rpc("cherryPick", { cwd: props.cwd, hash: props.commit.hash }); toast({ tone: "success", title: t("Cherry-picked") }) })}>{t("Cherry-pick")}</Button>
        <Button size="sm" variant="ghost" onClick={() => void props.onAct("revert", async () => { await rpc("revert", { cwd: props.cwd, hash: props.commit.hash }); toast({ tone: "success", title: t("Reverted") }) })}>{t("Revert")}</Button>
        {props.remote ? <Button size="sm" variant="ghost" icon="external" onClick={() => openExternal(`${props.remote}/-/commit/${props.commit.hash}`)}>{t("Open on GitLab")}</Button> : null}
      </div>
      {details.isLoading ? <div className="glp-row"><Spinner /> {t("Loading…")}</div> : null}
      {details.data ? (
        <>
          <div className="glp-md glp-wrap" style={{ fontSize: 12 }}>{details.data.body}</div>
          <div className="glp-faint" style={{ fontSize: 11 }}>{details.data.author} &lt;{details.data.email}&gt;</div>
          <div className="glp-commit-files">
            {details.data.files.map((entry) => (
              <div key={entry.path} className="glp-commit-file" onClick={() => setOpenFile(openFile === entry.path ? undefined : entry.path)}>
                <span className="glp-file-status" data-code={entry.status}>{entry.status}</span>
                <span className="glp-ellipsis glp-mono" style={{ flex: 1 }}>{entry.path}</span>
                <Icon name={openFile === entry.path ? "chevron-down" : "chevron-right"} size={10} />
              </div>
            ))}
          </div>
          {openFile ? <DiffView patch={file ? diff.data : undefined} loading={diff.isLoading} error={diff.error ? errorText(diff.error) : undefined} maxHeight={300} emptyText={t("No diff")} /> : null}
        </>
      ) : null}
    </div>
  )
}

// Branch picker.

function BranchPicker(props: {
  open: boolean
  cwd: string
  overview: Overview
  branches: Branch[]
  branchMrs: MergeRequest[]
  busy: string | undefined
  onClose: () => void
  onRefresh: () => void
  onRun: (id: string, work: () => Promise<void>) => Promise<void>
  onNewBranch: () => void
  onCleanup: () => void
}) {
  const [search, setSearch] = useState("")
  const query = search.trim().toLowerCase()
  const match = (branch: Branch) => !query || branch.name.toLowerCase().includes(query) || (branch.worktree ?? "").toLowerCase().includes(query)
  const local = props.branches.filter((branch) => !branch.remote && match(branch))
  // Checking out a remote branch runs `switch -c <name>`, which refuses a name that is already taken. A remote whose
  // name a local branch (or another remote's row) already carries would only offer a row that cannot succeed.
  const taken = new Set(props.branches.filter((branch) => !branch.remote).map((branch) => branch.name))
  const remote = props.branches.filter((branch) => {
    if (!branch.remote || !match(branch)) return false
    const name = branch.name.replace(/^[^/]+\//, "")
    if (taken.has(name)) return false
    taken.add(name)
    return true
  })
  const mrOf = (branch: Branch) => props.branchMrs.find((mr) => mr.head === branch.name)
  const recent = [...local].sort((a, b) => b.date - a.date).slice(0, 5)
  const withMr = local.filter((branch) => mrOf(branch))
  const checkout = async (branch: Branch) => {
    if (branch.current) return props.onClose()
    if (branch.worktree) {
      try {
        await openSessionAt(branch.worktree)
        props.onClose()
      } catch (error) {
        errorToast(error)
      }
      return
    }
    await props.onRun("checkout", async () => {
      await rpc("checkout", { cwd: props.cwd, ref: branch.remote ? branch.name.replace(/^[^/]+\//, "") : branch.name, track: branch.remote ? branch.name : null })
      toast({ tone: "success", title: t("Checked out {branch}", { branch: branch.name }) })
    })
    props.onClose()
    props.onRefresh()
  }
  const row = (branch: Branch) => {
    const mr = mrOf(branch)
    return (
      <div key={`${branch.remote ? "r" : "l"}:${branch.name}`} className="glp-picker-row" onClick={() => void checkout(branch)}>
        <Icon name={branch.current ? "check" : "branch"} size={12} />
        <span className="glp-ellipsis" style={{ flex: 1, fontFamily: "var(--glp-mono)", fontSize: 11.5 }} title={branch.worktree ? `${branch.name} — ${branch.worktree}` : branch.name}>
          {branch.name}
          {branch.worktree ? <span className="glp-faint" style={{ fontFamily: "inherit", fontSize: 10 }}> · {branch.worktree}</span> : null}
        </span>
        {mr ? <button type="button" className="glp-chip" style={{ border: 0, cursor: "pointer" }} onClick={(event) => { event.stopPropagation(); nav.openItem({ repo: props.overview.remote?.path ?? "", kind: "mr", number: mr.number }) }}>!{mr.number}</button> : null}
        {branch.ahead > 0 ? <span className="glp-faint" style={{ fontSize: 10 }}>↑{branch.ahead}</span> : null}
        {branch.behind > 0 ? <span className="glp-faint" style={{ fontSize: 10 }}>↓{branch.behind}</span> : null}
        {branch.gone ? <Pill tone="warn">{t("gone")}</Pill> : null}
        <span className="glp-faint glp-ellipsis" style={{ maxWidth: "30%", fontSize: 10.5 }}>{branch.subject}</span>
        <Menu
          label={t("More")}
          icon="dots"
          trigger="icon"
          items={[
            { label: t("Checkout"), icon: "check", disabled: branch.current, onSelect: () => void checkout(branch) },
            { label: t("Merge into current"), icon: "mr", disabled: branch.current, onSelect: () => void props.onRun("merge", async () => { await rpc("merge", { cwd: props.cwd, ref: branch.name }); toast({ tone: "success", title: t("Merged") }) }) },
            { label: t("Rebase onto"), icon: "branch", disabled: branch.current, onSelect: () => void props.onRun("rebase", async () => { await rpc("rebase", { cwd: props.cwd, ref: branch.name }); toast({ tone: "success", title: t("Rebased") }) }) },
            { label: t("Push"), icon: "upload", disabled: branch.remote, onSelect: () => void props.onRun("pushBranch", async () => { await rpc("pushBranch", { cwd: props.cwd, name: branch.name }); toast({ tone: "success", title: t("Pushed") }) }) },
            { type: "separator" },
            { label: t("Delete"), icon: "close", danger: true, disabled: branch.current || !!branch.worktree, onSelect: () => {
              if (!window.confirm(t("Delete the local branch {branch}?", { branch: branch.name }))) return
              void props.onRun("delete", async () => { await rpc("deleteBranch", { cwd: props.cwd, name: branch.name, force: false }); toast({ tone: "success", title: t("Deleted") }) })
              props.onRefresh()
            } },
            ...(branch.remote ? [{ label: t("Delete on remote"), icon: "cloud-upload", danger: true, onSelect: () => {
              const name = branch.name.replace(/^[^/]+\//, "")
              const remoteName = branch.name.split("/")[0] ?? "origin"
              if (!window.confirm(t("Delete {branch} on {remote}?", { branch: name, remote: remoteName }))) return
              void props.onRun("deleteRemote", async () => { await rpc("deleteRemoteBranch", { cwd: props.cwd, remote: remoteName, name }); toast({ tone: "success", title: t("Deleted") }) })
              props.onRefresh()
            } }] : []),
          ]}
        />
      </div>
    )
  }
  return (
    <Modal
      open={props.open}
      title={t("Branches")}
      onClose={props.onClose}
      width={640}
      footer={
        <>
          <Button size="sm" variant="ghost" onClick={props.onNewBranch}>{t("New branch")}</Button>
          <Button size="sm" variant="ghost" onClick={props.onCleanup}>{t("Clean up…")}</Button>
          <span className="glp-spacer" />
          <Button variant="ghost" onClick={props.onClose}>{t("Close")}</Button>
        </>
      }
    >
      <input className="glp-input" autoFocus placeholder={t("Search branches…")} value={search} onChange={(event) => setSearch(event.target.value)} />
      <div className="glp-picker-list">
        {props.overview.branch ? <><div className="glp-picker-group">{t("Current")}</div>{local.filter((branch) => branch.current).map(row)}</> : null}
        {recent.filter((branch) => !branch.current).length > 0 ? <><div className="glp-picker-group">{t("Recent")}</div>{recent.filter((branch) => !branch.current).map(row)}</> : null}
        {withMr.filter((branch) => !branch.current && !recent.includes(branch)).length > 0 ? <><div className="glp-picker-group">{t("With an open merge request")}</div>{withMr.filter((branch) => !branch.current && !recent.includes(branch)).map(row)}</> : null}
        {local.filter((branch) => !branch.current && !recent.includes(branch)).length > 0 ? <><div className="glp-picker-group">{t("Local")}</div>{local.filter((branch) => !branch.current && !recent.includes(branch)).map(row)}</> : null}
        {remote.length > 0 ? <><div className="glp-picker-group">{t("Remote")}</div>{remote.map(row)}</> : null}
        {local.length + remote.length === 0 ? <div className="glp-faint" style={{ padding: 12 }}>{t("No branches match.")}</div> : null}
      </div>
      <div className="glp-faint" style={{ fontSize: 11 }}>{t("A branch checked out in another worktree opens a session in that folder instead of checking out here.")}</div>
    </Modal>
  )
}

export function CommitPage(props: { sha: string; cwd: string; onClose?: () => void }) {
  const details = useCommit(props.cwd, props.sha)
  const overview = useOverview(props.cwd)
  const [openFile, setOpenFile] = useState<string>()
  const diff = useDiff(props.cwd, openFile ?? "", false, false, !!openFile)
  const data = details.data
  const remote = overview.data?.remote?.web
  const action = async (work: () => Promise<unknown>, success: string) => {
    try {
      await work()
      toast({ tone: "success", title: t(success) })
      void queryClient.invalidateQueries({ queryKey: ["overview", props.cwd] })
    } catch (error) {
      errorToast(error)
    }
  }
  return (
    <div className="glp-root" data-glp="">
      <div className="glp-topbar">
        <Icon name="branch" size={13} />
        <span className="glp-repo glp-mono" style={{ flex: 1 }}>{props.sha.slice(0, 12)}</span>
        <div className="glp-topbar-actions">
          <IconButton icon="copy" label={t("Copy hash")} onClick={() => { copyText(props.sha); toast({ tone: "success", title: t("Copied") }) }} />
          {remote ? <IconButton icon="external" label={t("Open on GitLab")} onClick={() => openExternal(`${remote}/-/commit/${props.sha}`)} /> : null}
          {props.onClose ? <IconButton icon="close" label={t("Close")} onClick={props.onClose} /> : null}
        </div>
      </div>
      <div className="glp-body">
        {details.isLoading ? <div className="glp-empty"><Spinner /><span>{t("Loading…")}</span></div> : null}
        {details.error ? <div className="glp-alert" data-tone="error">{errorText(details.error)}</div> : null}
        {data ? (
          <div className="glp-item">
            <div className="glp-md glp-wrap" style={{ whiteSpace: "pre-wrap" }}>{data.body}</div>
            <div className="glp-faint" style={{ fontSize: 11 }}>{data.author} &lt;{data.email}&gt; · {new Date(data.date * 1000).toLocaleString()}</div>
            <div className="glp-item-actions">
              <Button size="sm" variant="ghost" onClick={() => {
                const name = window.prompt(t("New branch from here"), `fix/${props.sha.slice(0, 7)}`)
                if (name) void action(() => rpc("createBranch", { cwd: props.cwd, name, start: props.sha, checkout: true }), "Branch created")
              }}>{t("New branch from here")}</Button>
              <Button size="sm" variant="ghost" onClick={() => void action(() => rpc("cherryPick", { cwd: props.cwd, hash: props.sha }), "Cherry-picked")}>{t("Cherry-pick")}</Button>
              <Button size="sm" variant="ghost" onClick={() => void action(() => rpc("revert", { cwd: props.cwd, hash: props.sha }), "Reverted")}>{t("Revert")}</Button>
            </div>
            <div className="glp-commit-files">
              {data.files.map((file) => (
                <div key={file.path} className="glp-commit-file" onClick={() => setOpenFile(openFile === file.path ? undefined : file.path)}>
                  <span className="glp-file-status" data-code={file.status}>{file.status}</span>
                  <span className="glp-ellipsis glp-mono" style={{ flex: 1 }}>{file.path}</span>
                  <Icon name={openFile === file.path ? "chevron-down" : "chevron-right"} size={10} />
                </div>
              ))}
            </div>
            {openFile ? <DiffView patch={diff.data} loading={diff.isLoading} error={diff.error ? errorText(diff.error) : undefined} maxHeight={520} /> : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export { useOutgoing }
