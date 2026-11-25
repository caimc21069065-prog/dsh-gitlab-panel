import { QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { createRoot } from "react-dom/client"
import type { ItemKind } from "../shared/types"
import { errorText, queryClient, setPluginCtx, startEvents, stopEvents, toast, useCwd, useItem } from "./api"
import { ComposerPill, HeaderChip } from "./chip"
import { RunPage } from "./ci"
import { installMentions, setCurrentRepo } from "./mentions"
import { t, useLanguage } from "./i18n"
import { nav, type CommitParams, type ItemParams, type MainParams, type PanelParams, type RunParams } from "./nav"
import { forgetTab, paramsForTab, rememberTab } from "./tabs"
import { CommitPage, MainPanel } from "./panel"
import { ItemPage } from "./item"
import { styles } from "./styles"
import { Button, Empty, Icon, Spinner, StateIcon, Toasts } from "./ui"

type Ctx = any

export const name = "gitlab-panel"
export const inject = ["slots", "sidebarRightTabs", "sidebarRight", "uiWorkspace", "remote", "remote.session"]

const MAIN_ID = "dsh-gitlab-panel/main"
const ITEM_ID = "dsh-gitlab-panel/item"
const RUN_ID = "dsh-gitlab-panel/run"
const COMMIT_ID = "dsh-gitlab-panel/commit"

const MAIN_KIND = "gitlab"
const ITEM_KIND = "gitlab-item"
const RUN_KIND = "gitlab-run"
const COMMIT_KIND = "gitlab-commit"

/** What a remembered tab opened, so a second open of the same content reveals it instead of adding a tab. */
function contentKey(params: PanelParams | undefined): string | undefined {
  if (!params) return undefined
  if (params.page === "item") return `item:${params.repo}:${params.kind}:${params.number}`
  if (params.page === "run") return `run:${params.repo}:${params.id}`
  if (params.page === "commit") return `commit:${params.repo}:${params.sha}`
  return "main"
}

export function apply(ctx: Ctx) {
  setPluginCtx(ctx)

  ctx.effect(() => {
    const element = document.createElement("style")
    element.dataset.glp = ""
    element.dataset.plugin = "dsh-gitlab-panel"
    element.textContent = styles
    document.head.appendChild(element)
    return () => element.remove()
  }, "gitlab-panel: styles")

  ctx.effect(() => {
    const host = document.createElement("div")
    host.dataset.glp = ""
    host.style.cssText = "position:absolute;width:0;height:0;overflow:hidden"
    document.body.appendChild(host)
    const root = createRoot(host)
    root.render(<Toasts />)
    return () => {
      root.unmount()
      host.remove()
    }
  }, "gitlab-panel: toast host")

  /**
   * Open one of the plugin's page types. `openTab` writes into the Session on
   * screen and throws when there is none, which a shortcut or the composer pill
   * can easily hit; a `multiple` type mints a fresh tab per open, so content
   * already open is revealed here instead.
   */
  const openPage = (kind: string, params: PanelParams) => {
    const sidebar = ctx.sidebarRight
    const wanted = contentKey(params)
    const session = sidebar.mounted?.getSnapshot?.()
    if (wanted !== undefined && session !== undefined) {
      for (const tab of sidebar.openTabs?.getSnapshot?.() ?? []) {
        if (tab.kind !== kind || tab.sessionId !== session) continue
        if (contentKey(paramsForTab(tab.tabId)) === wanted) {
          sidebar.focus(tab.tabId)
          return
        }
      }
    }
    sidebar.openTab(kind, { params })
    rememberTab(sidebar.active()?.id, params)
  }

  const open = (what: string, run: () => void) => {
    try {
      run()
    } catch (error) {
      toast({ tone: "error", title: t("Could not open the GitLab panel"), description: `${what}: ${errorText(error)}` })
    }
  }

  nav.openMain = (params: MainParams = {}) => open("main", () => openPage(MAIN_KIND, { page: "main", ...params }))
  nav.openItem = (input) => open("item", () => openPage(ITEM_KIND, { page: "item", ...input }))
  nav.openRun = (input) => open("pipeline", () => openPage(RUN_KIND, { page: "run", ...input }))
  nav.openCommit = (input) => open("commit", () => openPage(COMMIT_KIND, { page: "commit", ...input }))
  nav.openActivity = () => nav.openMain({ show: "activity" })
  nav.openInbox = () => nav.openMain({ show: "inbox" })
  nav.openRuns = () => nav.openMain({ show: "runs" })

  safe(ctx, "tab types", () =>
    ctx.effect(() => {
      const stops = [
        ctx.sidebarRightTabs.register({
          id: MAIN_ID,
          kind: MAIN_KIND,
          keepMounted: true,
          title: () => t("GitLab"),
          guide: [{ id: "open", order: 45, title: () => t("GitLab"), description: () => t("Git, merge requests, issues and pipelines") }],
        }),
        ctx.sidebarRightTabs.register({ id: ITEM_ID, kind: ITEM_KIND, multiple: true, keepMounted: true, title: () => t("GitLab") }),
        ctx.sidebarRightTabs.register({ id: RUN_ID, kind: RUN_KIND, multiple: true, title: () => t("Pipelines") }),
        ctx.sidebarRightTabs.register({ id: COMMIT_ID, kind: COMMIT_KIND, multiple: true, title: () => t("History") }),
      ]
      return () => stops.forEach((stop) => stop())
    }, "gitlab-panel: tab types"),
  )

  registerBody(ctx, "sidebar.right.pane.tab", MAIN_ID, MainBody)
  registerBody(ctx, "sidebar.right.pane.tab", ITEM_ID, ItemBody)
  registerBody(ctx, "sidebar.right.pane.tab", RUN_ID, RunBody)
  registerBody(ctx, "sidebar.right.pane.tab", COMMIT_ID, CommitBody)
  registerBody(ctx, "sidebar.right.pane.tab.title", ITEM_ID, ItemTitle)
  registerBody(ctx, "sidebar.right.pane.tab.title", RUN_ID, RunTitle)
  registerBody(ctx, "sidebar.right.pane.tab.title", COMMIT_ID, CommitTitle)

  safe(ctx, "header chip", () =>
    ctx.slots.inject("conversation.session.header.utilities", () =>
      ctx.slots.register({ name: "conversation.session.header.utilities", id: "gitlab-panel", order: -8 }, HeaderChipSlot),
    ),
  )
  safe(ctx, "composer pill", () =>
    ctx.slots.inject("conversation.composer.dock", () =>
      ctx.slots.register({ name: "conversation.composer.dock", id: "gitlab-panel", order: 20 }, ComposerPillSlot),
    ),
  )
  safe(ctx, "settings card", () =>
    ctx.slots.inject("settings.section", () =>
      ctx.slots.register({ name: "settings.section", id: "gitlab-panel", order: 80, label: () => "GitLab" }, SettingsCard),
    ),
  )

  safe(ctx, "shortcut", () => {
    const shortcuts = ctx.get?.("shortcuts")
    if (!shortcuts?.register) return
    ctx.effect(
      () =>
        shortcuts.register({
          id: "gitlab-panel.open",
          label: () => t("Open GitLab panel"),
          aliases: ["gitlab", "git"],
          // Only desktop defaults: the registry skips a runtime or platform a
          // command declares none for, and a Web binding would have to clear its
          // own browser-reservation rules.
          defaults: {
            "desktop:windows": { code: "KeyG", modifiers: ["primary", "shift"] },
            "desktop:macos": { code: "KeyG", modifiers: ["primary", "shift"] },
            "desktop:linux": { code: "KeyG", modifiers: ["primary", "shift"] },
          },
          regions: ["page", "editable"],
          modals: [],
          resolve: () => ({ status: "handled", run: () => nav.openMain() }),
        }),
      "gitlab-panel: shortcut",
    )
  })

  safe(ctx, "slash command", () => {
    const commandUi = ctx.get?.("commandUi")
    if (!commandUi?.register) return
    ctx.effect(
      () =>
        commandUi.register({
          name: "gitlab",
          label: () => t("GitLab panel"),
          description: () => t("Git, merge requests, issues and pipelines for this repository"),
          available: () => true,
          ui: { kind: "action", run: () => nav.openMain() },
        }),
      "gitlab-panel: slash command",
    )
  })

  ctx.effect(() => {
    startEvents()
    const stopMentions = installMentions()
    return () => {
      stopEvents()
      stopMentions()
      setCurrentRepo(undefined)
    }
  }, "gitlab-panel: events and timeline links")
}

function safe(ctx: Ctx, what: string, register: () => void) {
  try {
    register()
  } catch (error) {
    console.warn(`[gitlab-panel] could not register ${what}`, error)
  }
}

function registerBody(ctx: Ctx, slot: string, key: string, component: React.ComponentType<any>) {
  safe(ctx, slot, () =>
    ctx.slots.inject(slot, () =>
      ctx.slots.register({ name: slot, key }, component),
    ),
  )
}

function Provider(props: { children: React.ReactNode }) {
  useLanguage()
  return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
}

function HeaderChipSlot(props: any) {
  return <Provider><HeaderChip {...props} /></Provider>
}

function ComposerPillSlot(props: any) {
  return <Provider><ComposerPill {...props} /></Provider>
}

function MainBody(props: any) {
  const info = props.useTabInfo?.()
  const params = info?.tab?.navigation?.params as MainParams | undefined
  const cwd = useCwd(props)
  return (
    <Provider>
      {cwd ? <MainPanel key={info?.tab?.navigation?.revision ?? 0} sessionId={String(props.sessionId ?? "")} cwd={cwd} params={params} /> : <MissingCwd />}
    </Provider>
  )
}

function tabParams<T extends { page: string }>(info: any): T | undefined {
  const live = info?.tab?.navigation?.params as T | undefined
  if (live) {
    rememberTab(info?.tab?.id, live as any)
    return live
  }
  return paramsForTab(info?.tab?.id) as T | undefined
}

function ItemBody(props: any) {
  const info = props.useTabInfo?.()
  const params = tabParams<ItemParams>(info)
  const cwd = useCwd(props)
  if (!params || params.page !== "item") return <Provider><Empty icon="mr">{t("No item selected.")}<div><Button size="sm" onClick={() => { forgetTab(info?.tab?.id); info?.tab?.actions?.close?.() }}>{t("Close")}</Button></div></Empty></Provider>
  return (
    <Provider>
      <ItemPage
        repo={params.repo}
        kind={params.kind}
        number={params.number}
        sessionId={String(props.sessionId ?? "")}
        cwd={cwd}
        onClose={() => { forgetTab(info?.tab?.id); info?.tab?.actions?.close?.() }}
      />
    </Provider>
  )
}

function RunBody(props: any) {
  const info = props.useTabInfo?.()
  const params = tabParams<RunParams>(info)
  if (!params || params.page !== "run") return <Provider><Empty icon="pipeline">{t("No pipeline selected.")}<div><Button size="sm" onClick={() => { forgetTab(info?.tab?.id); info?.tab?.actions?.close?.() }}>{t("Close")}</Button></div></Empty></Provider>
  return <Provider><RunPage repo={params.repo} id={params.id} onClose={() => { forgetTab(info?.tab?.id); info?.tab?.actions?.close?.() }} /></Provider>
}

function CommitBody(props: any) {
  const info = props.useTabInfo?.()
  const params = tabParams<CommitParams>(info)
  const cwd = useCwd(props)
  if (!params || params.page !== "commit") return <Provider><Empty icon="branch">{t("No commit selected.")}<div><Button size="sm" onClick={() => { forgetTab(info?.tab?.id); info?.tab?.actions?.close?.() }}>{t("Close")}</Button></div></Empty></Provider>
  return <Provider><CommitPage sha={params.sha} cwd={cwd} onClose={() => { forgetTab(info?.tab?.id); info?.tab?.actions?.close?.() }} /></Provider>
}

function ItemTitle(props: any) {
  const info = props.useTabInfo?.()
  const params = tabParams<ItemParams>(info)
  if (!params || params.page !== "item") return <span>GitLab</span>
  return (
    <Provider>
      <ItemTitleInner repo={params.repo} number={params.number} kind={params.kind} />
    </Provider>
  )
}

function ItemTitleInner(props: { repo: string; number: number; kind: ItemKind }) {
  const item = useItem(props.repo, props.number, props.kind)
  return (
    <span className="glp-row" style={{ gap: 3 }}>
      <StateIcon kind={props.kind} state={item.data?.state ?? "OPEN"} draft={item.data?.draft} />
      <span>{props.kind === "mr" ? "!" : "#"}{props.number}</span>
    </span>
  )
}

function RunTitle(props: any) {
  const info = props.useTabInfo?.()
  const params = tabParams<RunParams>(info)
  return <span className="glp-row" style={{ gap: 3 }}><Icon name="pipeline" size={11} />#{params?.page === "run" ? params.id : ""}</span>
}

function CommitTitle(props: any) {
  const info = props.useTabInfo?.()
  const params = tabParams<CommitParams>(info)
  return <span className="glp-row" style={{ gap: 3 }}><Icon name="branch" size={11} />{params?.page === "commit" ? params.sha.slice(0, 7) : ""}</span>
}

function MissingCwd() {
  return <div className="glp-root" data-glp=""><div className="glp-empty"><Icon name="warning" size={20} /><span>{t("This session has no working directory.")}</span></div><Toasts /></div>
}

function SettingsCard(_props: any) {
  const [open, setOpen] = useState(false)
  return (
    <div data-glp="" style={{ border: "0.5px solid var(--dsw-alias-border-l2, rgba(0,0,0,0.11))", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Icon name="gitlab" size={14} />
        <strong style={{ flex: 1 }}>GitLab panel</strong>
        <Button size="sm" variant="ghost" onClick={() => setOpen((value) => !value)}>{open ? t("Show less") : t("Show more")}</Button>
      </div>
      <div style={{ fontSize: 11.5, color: "var(--dsw-alias-label-secondary, #60646c)" }}>
        {t("A Git and GitLab side panel: branch changes, commit graph, merge requests, issues, pipelines, reviews and agent actions.")}
      </div>
      {open ? (
        <div style={{ fontSize: 11.5, color: "var(--dsw-alias-label-secondary, #60646c)", display: "flex", flexDirection: "column", gap: 4 }}>
          <div>{t("The host needs git. For GitLab data, set GITLAB_TOKEN to a personal access token with api scope, or run glab auth login on the host.")}</div>
          <div>{t("Open it from the right sidebar’s + guide, the session header chip, ⌘⇧G, or /gitlab.")}</div>
          <div><Button size="sm" onClick={() => nav.openMain()}>{t("Open GitLab panel")}</Button></div>
        </div>
      ) : null}
    </div>
  )
}

export default { name, inject, apply }
