import { useEffect, useState } from "react"
import type { Job, Run } from "../shared/types"
import { errorText, queryClient, rpc, toast, useJobLog, useRuns, useRun } from "./api"
import { errorToast, openExternal } from "./actions"
import { t, formatDate } from "./i18n"
import { nav } from "./nav"
import { Age, Button, CheckDot, Empty, Icon, IconButton, Pill, Spinner } from "./ui"

export function RunsView(props: { repo: string; branch: string | null; cwd: string }) {
  const [all, setAll] = useState(!props.branch)
  const runs = useRuns(props.repo, all ? null : props.branch, true)
  return (
    <div>
      <div className="glp-row" style={{ padding: "6px 10px", borderBottom: "0.5px solid var(--glp-border)" }}>
        <strong style={{ flex: 1 }}>{t("Pipelines")}</strong>
        {props.branch ? <Button size="sm" variant={all ? "ghost" : "primary"} onClick={() => setAll(false)}>{props.branch}</Button> : null}
        <Button size="sm" variant={all ? "primary" : "ghost"} onClick={() => setAll(true)}>{t("All")}</Button>
        <IconButton icon="refresh" label={t("Refresh")} onClick={() => void runs.refetch()} />
      </div>
      {runs.isLoading && !runs.data ? <div className="glp-empty"><Spinner /><span>{t("Loading…")}</span></div> : null}
      {runs.error ? <div className="glp-alert" data-tone="error">{errorText(runs.error)}</div> : null}
      {runs.data && runs.data.length === 0 ? <Empty icon="pipeline">{t("No pipelines")}</Empty> : null}
      {(runs.data ?? []).map((run) => (
        <div key={run.id} className="glp-row-item" data-compact onClick={() => nav.openRun({ repo: props.repo, id: run.id })}>
          <CheckDot state={run.status === "failed" ? "failure" : run.status === "success" ? "success" : ["running", "pending", "created", "waiting_for_resource", "preparing"].includes(run.status) ? "pending" : "none"} />
          <div className="glp-row-content">
            <div className="glp-row-title"><span className="glp-num">#{run.id}</span><span className="glp-ellipsis">{run.title}</span></div>
            <div className="glp-row-meta">
              <span className="glp-mono">{run.sha.slice(0, 7)}</span>
              <span>{run.branch}</span>
              <span>{run.event}</span>
              <Age date={run.created} title />
            </div>
          </div>
          <div className="glp-row-end">
            <Pill tone={run.status === "success" ? "success" : run.status === "failed" ? "danger" : ["running", "pending"].includes(run.status) ? "warn" : undefined}>{t(run.status)}</Pill>
          </div>
        </div>
      ))}
      <div style={{ height: 40 }} />
    </div>
  )
}

export function RunPage(props: { repo: string; id: number; onClose?: () => void }) {
  const run = useRun(props.repo, props.id, true)
  const [job, setJob] = useState<Job>()
  const [busy, setBusy] = useState<string>()
  const data = run.data
  const act = async (id: string, work: () => Promise<unknown>, success?: string) => {
    setBusy(id)
    try {
      await work()
      if (success) toast({ tone: "success", title: success })
      void queryClient.invalidateQueries({ queryKey: ["run", props.repo, props.id] })
    } catch (error) {
      errorToast(error)
    } finally {
      setBusy(undefined)
    }
  }
  const weight = (job: Job) => (job.conclusion === "failed" ? 0 : ["running", "pending", "created"].includes(job.conclusion) ? 1 : job.conclusion === "success" ? 2 : 3)
  const orderedJobs = [...(data?.jobs ?? [])].sort((a, b) => weight(a) - weight(b))
  const stages = new Map<string, Job[]>()
  for (const entry of orderedJobs) {
    const list = stages.get(entry.stage ?? "") ?? []
    list.push(entry)
    stages.set(entry.stage ?? "", list)
  }
  return (
    <div className="glp-root" data-glp="">
      <div className="glp-topbar">
        <Icon name="pipeline" size={13} />
        <span className="glp-repo glp-ellipsis" style={{ flex: 1 }}>#{props.id} {data?.run.title ?? ""}</span>
        <div className="glp-topbar-actions">
          {data ? <Pill tone={data.run.status === "success" ? "success" : data.run.status === "failed" ? "danger" : "warn"}>{t(data.run.status)}</Pill> : null}
          <IconButton icon="external" label={t("Open on GitLab")} onClick={() => data && openExternal(data.run.url)} />
          <IconButton icon="refresh" label={t("Refresh")} onClick={() => void run.refetch()} />
          {props.onClose ? <IconButton icon="close" label={t("Close")} onClick={props.onClose} /> : null}
        </div>
      </div>
      <div className="glp-body">
        {run.isLoading ? <div className="glp-empty"><Spinner /><span>{t("Loading…")}</span></div> : null}
        {run.error ? <div className="glp-alert" data-tone="error">{errorText(run.error)}</div> : null}
        {data ? (
          <div className="glp-item">
            <div className="glp-item-head">
              <div className="glp-col" style={{ flex: 1 }}>
                <div className="glp-item-title">{data.run.title}</div>
                <div className="glp-item-meta">
                  <span className="glp-mono">{data.run.sha.slice(0, 7)}</span>
                  <span>{data.run.branch}</span>
                  <span>{data.run.event}</span>
                  <span>{formatDate(data.run.created, "long")}</span>
                </div>
              </div>
            </div>
            <div className="glp-item-actions">
              <Button size="sm" variant="ghost" icon="undo" busy={busy === "retry"} onClick={() => void act("retry", async () => { await rpc("rerun", { repo: props.repo, id: props.id }) }, t("Retried"))}>{t("Retry")}</Button>
              <Button size="sm" variant="ghost" icon="stop" busy={busy === "cancel"} onClick={() => void act("cancel", async () => { await rpc("cancelRun", { repo: props.repo, id: props.id }) }, t("Canceled"))}>{t("Cancel")}</Button>
            </div>
            {[...stages.entries()].map(([stage, jobs]) => (
              <div key={stage} className="glp-col" style={{ gap: 4 }}>
                <span className="glp-group-title" style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.03em" }}>{stage || t("Jobs")}</span>
                {jobs.map((entry) => (
                  <div key={entry.id} className="glp-check-row" data-state={entry.conclusion === "failed" ? "failure" : undefined} onClick={() => setJob(job?.id === entry.id ? undefined : entry)}>
                    <CheckDot state={entry.conclusion === "failed" ? "failure" : entry.conclusion === "success" ? "success" : ["running", "pending", "created"].includes(entry.conclusion) ? "pending" : "none"} />
                    <span className="glp-ellipsis" style={{ flex: 1 }}>{entry.name}</span>
                    <span className="glp-faint" style={{ fontSize: 10.5 }}>{t(entry.status || entry.conclusion)}</span>
                    <Icon name={job?.id === entry.id ? "chevron-down" : "chevron-right"} size={10} />
                  </div>
                ))}
              </div>
            ))}
            {job ? <RunJobPanel repo={props.repo} job={job} onClose={() => setJob(undefined)} /> : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function RunJobPanel(props: { repo: string; job: Job; onClose: () => void }) {
  const log = useJobLog(props.repo, props.job.id, ["success", "failed", "canceled"].includes(props.job.conclusion), true)
  const [busy, setBusy] = useState<string>()
  return (
    <div style={{ border: "0.5px solid var(--glp-border)", borderRadius: 6, overflow: "hidden", marginTop: 6 }}>
      <div className="glp-row" style={{ padding: "4px 8px", background: "var(--glp-panel-2)" }}>
        <Icon name="file" size={11} />
        <strong style={{ flex: 1 }}>{props.job.name}</strong>
        <Button size="sm" variant="ghost" onClick={() => { if (log.data) { navigator.clipboard?.writeText(log.data); toast({ tone: "success", title: t("Copied") }) } }}>{t("Copy")}</Button>
        <Button size="sm" variant="ghost" busy={busy === "retry"} onClick={async () => { setBusy("retry"); try { await rpc("retryJob", { repo: props.repo, job: props.job.id }); toast({ tone: "success", title: t("Retried") }) } catch (error) { errorToast(error) } finally { setBusy(undefined) } }}>{t("Retry")}</Button>
        <Button size="sm" variant="ghost" busy={busy === "cancel"} onClick={async () => { setBusy("cancel"); try { await rpc("cancelJob", { repo: props.repo, job: props.job.id }); toast({ tone: "success", title: t("Canceled") }) } catch (error) { errorToast(error) } finally { setBusy(undefined) } }}>{t("Cancel")}</Button>
        <Button size="sm" variant="ghost" onClick={props.onClose}>{t("Close")}</Button>
      </div>
      {log.isLoading ? <div className="glp-empty" data-inline><Spinner /> {t("Loading…")}</div> : null}
      {log.error ? <div className="glp-alert" data-tone="error">{errorText(log.error)}</div> : null}
      {log.data ? <pre className="glp-mono" style={{ margin: 0, padding: 8, maxHeight: 460, overflow: "auto", fontSize: 10.5, whiteSpace: "pre-wrap", background: "var(--glp-panel)" }}>{log.data}</pre> : null}
    </div>
  )
}
