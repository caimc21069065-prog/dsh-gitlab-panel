import { useEffect } from "react"
import { mrFor } from "../shared/core"
import { useAgent, useCwd, useMrs, useOverview, usePrefs } from "./api"
import { t } from "./i18n"
import { nav } from "./nav"
import { setCurrentRepo } from "./mentions"
import { CheckDot, Icon } from "./ui"

export function HeaderChip(props: any) {
  const cwd = useCwd(props)
  const [prefs] = usePrefs()
  const overview = useOverview(cwd, { poll: 15_000, enabled: !!cwd })
  const mrs = useMrs(cwd, !!overview.data?.remote)
  const data = overview.data
  useEffect(() => {
    if (data?.remote) setCurrentRepo(data.remote.path)
  }, [data?.remote?.path])
  if (!prefs.headerChip || !data) return null
  const mr = mrFor(mrs.data as any, data.branch, data.head, data.defaultBranch) as any
  const dirty = data.files.length > 0
  return (
    <span data-glp="" style={{ display: "inline-flex", alignItems: "center", gap: 4, minWidth: 0, maxWidth: 280 }} title={data.root}>
      <button
        type="button"
        className="glp-btn"
        data-variant="ghost"
        data-size="sm"
        style={{ maxWidth: 160, gap: 4 }}
        onClick={() => nav.openMain()}
      >
        <Icon name="branch" size={11} />
        <span className="glp-ellipsis">{data.branch ?? data.head?.slice(0, 7) ?? ""}</span>
        {dirty ? <span style={{ color: "var(--glp-warn)", fontSize: 8 }}>●</span> : null}
        {data.operation ? <Icon name="warning" size={10} /> : null}
      </button>
      {mr ? (
        <button
          type="button"
          className="glp-btn"
          data-variant="ghost"
          data-size="sm"
          style={{ maxWidth: 190, gap: 4 }}
          title={mr.title}
          onClick={() => {
            nav.openMain()
            if (data.remote) nav.openItem({ repo: data.remote.path, kind: "mr", number: mr.number })
          }}
        >
          <CheckDot state={mr.checks} />
          <span className="glp-ellipsis">!{mr.number} {mr.title}</span>
        </button>
      ) : null}
    </span>
  )
}

export function ComposerPill(props: any) {
  const sessionId = String(props?.sessionId ?? props?.session?.sessionId ?? "")
  const agent = useAgent(sessionId)
  if (!agent.data) return null
  const proposed = agent.data.actions.filter((action) => action.status === "proposed").length
  const running = agent.data.actions.filter((action) => action.status === "approved" || action.status === "running").length
  const done = agent.data.actions.filter((action) => action.status === "done").length
  if (proposed + running + done === 0) return null
  return (
    <span data-glp="" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <button type="button" className="glp-btn" data-size="sm" data-variant={proposed > 0 ? "primary" : "ghost"} onClick={() => nav.openMain({ show: "activity" })} title={t("Agent proposed changes")}>
        <Icon name="gitlab" size={11} />
        <span>GitLab</span>
        {proposed > 0 ? <span>{proposed} {t("to approve")}</span> : running > 0 ? <span>{running} {t("running")}</span> : <span>{done} {t("done")}</span>}
      </button>
    </span>
  )
}
