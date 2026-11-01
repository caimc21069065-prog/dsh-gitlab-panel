import { useMemo, useState } from "react"
import type { InboxEntry, ItemKind } from "../shared/types"
import { errorText, queryClient, rpc, toast, useInbox } from "./api"
import { errorToast } from "./actions"
import { t } from "./i18n"
import { nav } from "./nav"
import { Age, Button, Empty, Icon, IconButton, Pill, Spinner, StateIcon } from "./ui"

export function InboxView(props: { repo: string; cwd: string; sessionId: string; onOpenItem: (kind: ItemKind, number: number, repo?: string) => void }) {
  const inbox = useInbox(true, 60_000)
  const [busy, setBusy] = useState(false)
  const data = inbox.data
  const groups = useMemo(() => {
    const map = new Map<string, InboxEntry[]>()
    for (const entry of data?.notifications ?? []) {
      const list = map.get(entry.repo) ?? []
      list.push(entry)
      map.set(entry.repo, list)
    }
    return [...map.entries()]
  }, [data])

  const open = async (entry: InboxEntry) => {
    // A todo carries its own project; numbering is per project, so opening it in the current one would show a different item.
    if (entry.number) props.onOpenItem(entry.kind === "mr" ? "mr" : "issue", entry.number, entry.repo || undefined)
    if (entry.thread) {
      try {
        await rpc("markRead", { thread: entry.thread })
        void queryClient.invalidateQueries({ queryKey: ["inbox"] })
      } catch {
        // Opening the item still worked.
      }
    }
  }

  const row = (entry: InboxEntry) => (
    <div key={`${entry.thread ?? entry.url}-${entry.number ?? entry.title}`} className="glp-row-item" data-compact onClick={() => void open(entry)} style={{ opacity: entry.unread && entry.thread ? 1 : undefined }}>
      <StateIcon kind={entry.kind === "mr" ? "mr" : "issue"} state="OPEN" />
      <div className="glp-row-content">
        <div className="glp-row-title">
          {entry.number ? <span className="glp-num">{entry.kind === "mr" ? "!" : "#"}{entry.number}</span> : null}
          <span className="glp-ellipsis">{entry.title}</span>
          {entry.unread && entry.thread ? <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--glp-accent)", flex: "none" }} /> : null}
        </div>
        <div className="glp-row-meta">
          <span>{entry.reason}</span>
          {entry.repo ? <span className="glp-faint">{entry.repo}</span> : null}
          <Age date={entry.updated} title />
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <div className="glp-row" style={{ padding: "6px 10px", borderBottom: "0.5px solid var(--glp-border)" }}>
        <strong style={{ flex: 1 }}>{t("Inbox")}</strong>
        {data && data.notifications.length > 0 ? <Pill tone="accent">{data.notifications.filter((entry) => entry.unread).length} {t("unread")}</Pill> : null}
        <Button size="sm" variant="ghost" busy={busy} onClick={async () => {
          setBusy(true)
          try {
            await rpc("markRead", { thread: null })
            toast({ tone: "success", title: t("Marked all read") })
            void queryClient.invalidateQueries({ queryKey: ["inbox"] })
          } catch (error) {
            errorToast(error)
          } finally {
            setBusy(false)
          }
        }}>{t("Mark all read")}</Button>
        <IconButton icon="refresh" label={t("Refresh")} onClick={() => void inbox.refetch()} />
      </div>
      {inbox.isLoading && !data ? <div className="glp-empty"><Spinner /><span>{t("Loading…")}</span></div> : null}
      {data?.error ? <div className="glp-alert" data-tone="error"><Icon name="warning" size={13} /><span style={{ flex: 1 }}>{data.error}</span><Button size="sm" onClick={() => void inbox.refetch()}>{t("Retry")}</Button></div> : null}
      {data && data.notifications.length === 0 && data.reviews.length === 0 && data.assigned.length === 0 && data.authored.length === 0 ? <Empty icon="bell">{t("No notifications")}</Empty> : null}
      {groups.map(([repo, entries]) => (
        <section key={repo} className="glp-inbox-group">
          <div className="glp-inbox-head"><Icon name="gitlab" size={12} /> <span className="glp-ellipsis" style={{ flex: 1 }}>{repo}</span><span className="glp-faint">{entries.length}</span></div>
          {entries.map(row)}
        </section>
      ))}
      {data && data.reviews.length > 0 ? (
        <section className="glp-inbox-group">
          <div className="glp-inbox-head"><Icon name="eye" size={12} /> <span style={{ flex: 1 }}>{t("Review requested from you")}</span><span className="glp-faint">{data.reviews.length}</span></div>
          {data.reviews.map(row)}
        </section>
      ) : null}
      {data && data.assigned.length > 0 ? (
        <section className="glp-inbox-group">
          <div className="glp-inbox-head"><Icon name="issue" size={12} /> <span style={{ flex: 1 }}>{t("Assigned to you")}</span><span className="glp-faint">{data.assigned.length}</span></div>
          {data.assigned.map(row)}
        </section>
      ) : null}
      {data && data.authored.length > 0 ? (
        <section className="glp-inbox-group">
          <div className="glp-inbox-head"><Icon name="mr" size={12} /> <span style={{ flex: 1 }}>{t("Created by you")}</span><span className="glp-faint">{data.authored.length}</span></div>
          {data.authored.map(row)}
        </section>
      ) : null}
      <div className="glp-footer-note">{t("Notifications come from GitLab todos. Opening one marks it read.")}</div>
    </div>
  )
}
