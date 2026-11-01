import { useEffect, useMemo, useRef, useState } from "react"
import type { AgentAction, AgentQueue, ItemKind } from "../shared/types"
import { errorText, queryClient, rpc, toast, useAgent } from "./api"
import { errorToast } from "./actions"
import { describeAction, EditProposalDialog } from "./item"
import { t, formatDate } from "./i18n"
import { Age, Button, Empty, Icon, IconButton, Menu, Pill, Spinner, StatusPill } from "./ui"

export function ActivityView(props: { sessionId: string; repo: string; cwd: string; onOpenItem: (kind: ItemKind, number: number) => void }) {
  const agent = useAgent(props.sessionId)
  const [active, setActive] = useState(0)
  const [busy, setBusy] = useState<string>()
  const [editing, setEditing] = useState<AgentAction>()
  const container = useRef<HTMLDivElement>(null)
  const queue = agent.data
  const actions = queue?.actions ?? []
  const ordered = useMemo(() => [...actions].reverse(), [actions])
  const proposed = actions.filter((action) => action.status === "proposed")
  const triage = queue?.triage

  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["agent", props.sessionId] })

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

  const decide = (action: AgentAction, decision: "approve" | "skip" | "reset") =>
    act(action.id + decision, async () => {
      await rpc("agentDecide", { sessionID: props.sessionId, ids: [action.id], batch: null, decision })
    }, decision === "approve" ? t("Approved") : decision === "skip" ? t("Skipped") : t("Took back"))

  const approveBatch = (batch: string) => act("batch" + batch, async () => {
    await rpc("agentDecide", { sessionID: props.sessionId, ids: null, batch, decision: "approve" })
  }, t("Approved"))

  const undo = (action: AgentAction) => act(action.id + "undo", async () => {
    await rpc("agentUndo", { sessionID: props.sessionId, id: action.id })
  }, t("Undoing…"))

  const retry = (action: AgentAction) => act(action.id + "retry", async () => {
    await rpc("agentRetry", { sessionID: props.sessionId, ids: [action.id] })
  }, t("Retrying."))

  const edit = (action: AgentAction) => setEditing(action)

  useEffect(() => {
    setActive((value) => Math.min(value, Math.max(0, ordered.length - 1)))
  }, [ordered.length])

  const batches = useMemo(() => {
    const map = new Map<string, AgentAction[]>()
    for (const action of actions) {
      const list = map.get(action.batch) ?? []
      list.push(action)
      map.set(action.batch, list)
    }
    return [...map.entries()].reverse()
  }, [actions])

  return (
    <div
      ref={container}
      tabIndex={0}
      style={{ outline: "none", minHeight: "100%" }}
      onKeyDown={(event) => {
        const target = event.target as HTMLElement
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") return
        const action = ordered[active]
        if ((event.key === "j" || event.key === "ArrowDown") && !event.metaKey) {
          event.preventDefault()
          setActive(Math.min(ordered.length - 1, active + 1))
        } else if ((event.key === "k" || event.key === "ArrowUp") && !event.metaKey) {
          event.preventDefault()
          setActive(Math.max(0, active - 1))
        } else if (event.key === "y" && action?.status === "proposed") {
          void decide(action, "approve")
        } else if (event.key === "n" && action?.status === "proposed") {
          void decide(action, "skip")
        } else if (event.key === "e" && action?.status === "proposed") {
          edit(action)
        } else if (event.key === "u" && action?.status === "done") {
          void undo(action)
        } else if (event.key === "o" && action) {
          props.onOpenItem(action.item === "issue" ? "issue" : "mr", action.number)
        } else if (event.key === "a" && proposed.length > 0) {
          void act("all", async () => { await rpc("agentDecide", { sessionID: props.sessionId, ids: null, batch: null, decision: "approve" }) }, t("Approved"))
        }
      }}
    >
      <div className="glp-row" style={{ padding: "6px 10px", borderBottom: "0.5px solid var(--glp-border)" }}>
        <strong style={{ flex: 1 }}>{t("Agent activity")}</strong>
        {proposed.length > 0 ? <Pill tone="warn">{proposed.length} {t("to approve")}</Pill> : null}
        <label className="glp-checkbox" title={t("Run writes at once instead of waiting for approval")}>
          <input type="checkbox" checked={!!queue?.auto} onChange={(event) => void act("auto", async () => { await rpc("agentAuto", { sessionID: props.sessionId, auto: event.target.checked }) }, event.target.checked ? t("Auto-run on.") : t("Auto-run off."))} />
          {t("Auto-run")}
        </label>
        {proposed.length > 0 ? <Button size="sm" variant="primary" busy={busy === "all"} onClick={() => void act("all", async () => { await rpc("agentDecide", { sessionID: props.sessionId, ids: null, batch: null, decision: "approve" }) }, t("Approved"))}>{t("Approve all")}</Button> : null}
        <IconButton icon="refresh" label={t("Refresh")} onClick={refresh} />
      </div>

      {triage ? (
        <div className="glp-activity-card">
          <div className="glp-activity-head"><Icon name="checklist" size={12} /><span style={{ flex: 1 }}>{t("Triage")} · {triage.repo}</span><span>{triage.reviewed.length} / {triage.total}</span></div>
          <div className="glp-activity-body">
            <div className="glp-triage-progress"><div style={{ width: `${Math.min(100, (Math.max(triage.reviewed.length, actions.filter((action) => action.round !== undefined).length) / Math.max(1, triage.total)) * 100)}%` }} /></div>
            <div className="glp-faint" style={{ fontSize: 11 }}>
              {triage.reviewed.length} {t("reviewed")} · {actions.filter((action) => action.source === "tool" && ["approved", "running", "done"].includes(action.status)).length} {t("approved")} · {actions.filter((action) => action.status === "skipped").length} {t("skipped")} · {t("batch {count}", { count: triage.round })}
            </div>
            {triage.rules ? <div className="glp-faint glp-wrap" style={{ fontSize: 11 }}>{t("Rules")}: {triage.rules}</div> : null}
          </div>
        </div>
      ) : null}

      {agent.isLoading && !queue ? <div className="glp-empty"><Spinner /><span>{t("Loading…")}</span></div> : null}
      {agent.error ? <div className="glp-alert" data-tone="error">{errorText(agent.error)}</div> : null}
      {queue && actions.length === 0 ? <Empty icon="checklist">{t("Nothing waiting")}<div className="glp-faint" style={{ fontSize: 11 }}>{t("Agent writes and your bulk actions appear here. Auto-run is {state}.", { state: queue.auto ? t("on") : t("off") })}</div></Empty> : null}

      {batches.map(([batch, list]) => {
        const pending = list.filter((action) => action.status === "proposed")
        return (
          <div key={batch} className="glp-activity-card">
            <div className="glp-activity-head">
              <Icon name="sparkles" size={12} />
              <span style={{ flex: 1 }}>{batch} · {list[0] ? formatDate(list[0].createdAt as any, "long") : ""}</span>
              {pending.length > 0 ? <Button size="sm" variant="ghost" busy={busy === "batch" + batch} onClick={() => approveBatch(batch)}>{t("Approve all")}</Button> : null}
            </div>
            <div className="glp-activity-body">
              {list.map((action) => {
                const index = ordered.indexOf(action)
                return (
                  <div key={action.id} style={{ borderTop: "0.5px solid var(--glp-border-soft)", paddingTop: 5, background: active === index ? "var(--glp-hover)" : undefined }} onClick={() => setActive(index)}>
                    <div className="glp-row">
                      <StatusPill status={action.status}>{t(action.status)}</StatusPill>
                      <button type="button" style={{ border: 0, background: "transparent", padding: 0, cursor: "pointer", color: "inherit", flex: 1, textAlign: "left" }} className="glp-ellipsis" onClick={() => props.onOpenItem(action.item === "issue" ? "issue" : "mr", action.number)}>
                        <span className="glp-faint">{action.repo}{action.item === "issue" ? "#" : "!"}{action.number}</span> {action.title}
                      </button>
                      {action.source === "shell" ? <Pill>{t("shell")}</Pill> : action.source === "user" ? <Pill>{t("you")}</Pill> : null}
                    </div>
                    <div className="glp-dim glp-wrap" style={{ fontSize: 11.5, margin: "2px 0 3px" }}>{describeAction(action)}</div>
                    {action.note ? <div className="glp-faint glp-wrap" style={{ fontSize: 11 }}>{action.note}</div> : null}
                    {action.edited ? <div className="glp-faint" style={{ fontSize: 11 }}>{t("edited by you")}</div> : null}
                    {action.status === "failed" && action.error ? <div className="glp-error glp-wrap" style={{ fontSize: 11 }}>{action.error}</div> : null}
                    {action.status === "running" && action.error ? <div className="glp-faint" style={{ fontSize: 11 }}>{action.error}</div> : null}
                    {action.result?.noop ? <div className="glp-faint" style={{ fontSize: 11 }}>{t("nothing to change")}</div> : null}
                    <div className="glp-activity-actions">
                      {action.status === "proposed" ? (
                        <>
                          <Button size="sm" variant="primary" busy={busy === action.id + "approve"} onClick={() => void decide(action, "approve")}>{t("Approve")}</Button>
                          <Button size="sm" variant="ghost" onClick={() => edit(action)}>{t("Edit")}</Button>
                          <Button size="sm" variant="ghost" busy={busy === action.id + "skip"} onClick={() => void decide(action, "skip")}>{t("Skip")}</Button>
                        </>
                      ) : null}
                      {action.status === "approved" ? <Button size="sm" variant="ghost" busy={busy === action.id + "reset"} onClick={() => void decide(action, "reset")}>{t("Took back")}</Button> : null}
                      {action.status === "done" && !action.undoOf && !action.undoneBy && !action.result?.noop ? <Button size="sm" variant="ghost" icon="undo" busy={busy === action.id + "undo"} onClick={() => void undo(action)}>{t("Undo")}</Button> : null}
                      {action.status === "failed" ? <Button size="sm" variant="ghost" busy={busy === action.id + "retry"} onClick={() => retry(action)}>{t("Retry")}</Button> : null}
                      {action.status === "skipped" && action.source === "tool" ? <Button size="sm" variant="ghost" onClick={() => void decide(action, "reset")}>{t("Took back")}</Button> : null}
                      <span className="glp-spacer" />
                      <span className="glp-faint" style={{ fontSize: 10 }}><Age date={action.createdAt as any} /></span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
      <div className="glp-footer-note">{t("Keys: j/k move · y approve · n skip · e edit · u undo · o open · a approve all")}</div>
      <EditProposalDialog action={editing} onClose={() => setEditing(undefined)} onDone={refresh} />
    </div>
  )
}
