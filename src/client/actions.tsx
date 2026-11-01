import { useEffect, useMemo, useState } from "react"
import { issueBranchName, withClosing } from "../shared/core"
import type { Branch, CloseReason, Item, ItemKind, Label, RepoMeta } from "../shared/types"
import type { SavedReply, SavedSearch, Prefs } from "./api"
import { api, errorText, getPrefs, pluginCtx, queryClient, rpc, startAgentSession, toast, updatePrefs, useMeta, usePrefs } from "./api"
import { t } from "./i18n"
import { Button, Checkbox, Icon, InlineError, LabelChip, Markdown, Menu, Modal, Pill, Segmented, Spinner, TextArea, copyText, type MenuEntry } from "./ui"

export function errorToast(error: unknown, title = "Error") {
  toast({ tone: "error", title: t(title), description: errorText(error) })
}

export async function notify<T>(title: string, work: () => Promise<T>, success?: string): Promise<T | undefined> {
  try {
    const value = await work()
    if (success) toast({ tone: "success", title: t(success) })
    return value
  } catch (error) {
    errorToast(error, title)
    return undefined
  }
}

export function openExternal(url: string) {
  const ctx = pluginCtx()
  try {
    if (ctx.system?.openExternal) return ctx.system.openExternal(url)
  } catch {
    // Fall back to the browser.
  }
  window.open(url, "_blank", "noopener")
}

export function savedRepliesFor(repo: string): SavedReply[] {
  return getPrefs().savedReplies.filter((reply) => reply.repo === repo)
}

export function rememberReply(repo: string, name: string, body: string) {
  updatePrefs((draft) => {
    draft.savedReplies = [...draft.savedReplies.filter((reply) => !(reply.repo === repo && reply.name === name)), { id: crypto.randomUUID(), repo, name, body }]
  })
}

export function rememberSavedSearch(repo: string, kind: ItemKind, name: string, query: string) {
  updatePrefs((draft) => {
    draft.savedSearches = [...draft.savedSearches.filter((entry) => !(entry.repo === repo && entry.kind === kind && entry.name === name)), { id: crypto.randomUUID(), repo, kind, name, query }]
  })
}

export function forgetSavedSearch(id: string) {
  updatePrefs((draft) => {
    draft.savedSearches = draft.savedSearches.filter((entry) => entry.id !== id)
  })
}

export function rememberIssueBranch(repo: string, branch: string, number: number) {
  updatePrefs((draft) => {
    draft.issueBranches[`${repo}:${branch}`] = number
  })
}

export function issueBranchOf(repo: string, branch: string): number | undefined {
  return getPrefs().issueBranches[`${repo}:${branch}`]
}

export function itemQuote(item: Item) {
  const head = `${item.kind === "mr" ? "Merge request" : "Issue"} ${item.repo}${item.kind === "mr" ? "!" : "#"}${item.number}: ${item.title}`
  return [`> ${head}`, `> ${item.url}`, "", item.body.slice(0, 3000)].join("\n")
}

export async function askAboutItems(sessionID: string, cwd: string, label: string, items: { number: number; title: string; state: string; url: string }[]) {
  const text = [
    label,
    "",
    ...items.map((item) => `- #${item.number} (${item.state.toLowerCase()}) ${item.title} — ${item.url}`),
    "",
    "Help me decide what to do with them.",
  ].join("\n")
  const { quoteToChat } = await import("./api")
  await quoteToChat(sessionID, cwd, text)
}

export function itemWorkingPrompt(item: Item, base: string) {
  return [
    `Work on this ${item.kind === "mr" ? "merge request" : "issue"} in ${item.repo}. The branch ${base} was created for it.`,
    "",
    itemQuote(item),
    "",
    "Read the code, make the change, and run the relevant checks. Use the gitlab_panel tools to comment on or update the issue if something needs the user's attention; writes wait for their approval.",
  ].join("\n")
}

export function reviewPrompt(item: Item) {
  return [
    `Review merge request ${item.repo}!${item.number} for me.`,
    "",
    `Start with gitlab_panel_diff (repo "${item.repo}", number ${item.number}); pass path to read one file in full.`,
    "Then draft the review with gitlab_panel_review: a concise summary, a verdict (COMMENT, APPROVE or REQUEST_CHANGES), and inline comments on precise lines of the diff. Only mention real problems; skip style nits unless they matter.",
    "Nothing is posted until I submit the draft in the GitLab panel. Stop after drafting.",
  ].join("\n")
}

// Dialogs.

export function ConfirmDialog(props: { open: boolean; title: string; description?: string; confirm?: string; danger?: boolean; onClose: () => void; onConfirm: () => void | Promise<void> }) {
  const [busy, setBusy] = useState(false)
  return (
    <Modal
      open={props.open}
      title={props.title}
      onClose={props.onClose}
      footer={
        <>
          <Button variant="ghost" onClick={props.onClose}>{t("Cancel")}</Button>
          <Button
            variant={props.danger ? "danger" : "primary"}
            busy={busy}
            onClick={async () => {
              setBusy(true)
              try {
                await props.onConfirm()
                props.onClose()
              } finally {
                setBusy(false)
              }
            }}
          >
            {props.confirm ?? t("Confirm")}
          </Button>
        </>
      }
    >
      {props.description ? <div className="glp-dim glp-wrap">{props.description}</div> : null}
    </Modal>
  )
}

export function PromptDialog(props: {
  open: boolean
  title: string
  placeholder?: string
  initial?: string
  multiline?: boolean
  confirm?: string
  onClose: () => void
  onSubmit: (value: string) => void | Promise<void>
}) {
  const [value, setValue] = useState(props.initial ?? "")
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (props.open) setValue(props.initial ?? "")
  }, [props.open, props.initial])
  return (
    <Modal
      open={props.open}
      title={props.title}
      onClose={props.onClose}
      footer={
        <>
          <Button variant="ghost" onClick={props.onClose}>{t("Cancel")}</Button>
          <Button
            variant="primary"
            busy={busy}
            disabled={!value.trim()}
            onClick={async () => {
              setBusy(true)
              try {
                await props.onSubmit(value)
                props.onClose()
              } catch (error) {
                errorToast(error)
              } finally {
                setBusy(false)
              }
            }}
          >
            {props.confirm ?? t("Submit")}
          </Button>
        </>
      }
    >
      {props.multiline ? (
        <TextArea rows={6} autoFocus value={value} placeholder={props.placeholder} onChange={(event) => setValue(event.target.value)} />
      ) : (
        <input className="glp-input" autoFocus value={value} placeholder={props.placeholder} onChange={(event) => setValue(event.target.value)} />
      )}
    </Modal>
  )
}

export function NewBranchDialog(props: { open: boolean; cwd: string; start?: string; branch?: string; onClose: () => void; onDone: () => void }) {
  const [name, setName] = useState(props.branch ?? "")
  const [start, setStart] = useState(props.start ?? "")
  const [checkout, setCheckout] = useState(true)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (props.open) {
      setName(props.branch ?? "")
      setStart(props.start ?? "")
    }
  }, [props.open, props.branch, props.start])
  return (
    <Modal
      open={props.open}
      title={t("New branch")}
      onClose={props.onClose}
      footer={
        <>
          <Button variant="ghost" onClick={props.onClose}>{t("Cancel")}</Button>
          <Button
            variant="primary"
            busy={busy}
            disabled={!name.trim()}
            onClick={async () => {
              setBusy(true)
              try {
                await rpc("createBranch", { cwd: props.cwd, name: name.trim(), start: start.trim() || null, checkout })
                toast({ tone: "success", title: t("Branch created") })
                props.onClose()
                props.onDone()
              } catch (error) {
                errorToast(error)
              } finally {
                setBusy(false)
              }
            }}
          >
            {t("Create")}
          </Button>
        </>
      }
    >
      <label className="glp-col" style={{ gap: 4 }}>
        <span className="glp-dim">{t("Branch name")}</span>
        <input className="glp-input" autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="feat/my-change" />
      </label>
      <label className="glp-col" style={{ gap: 4 }}>
        <span className="glp-dim">{t("Start point")}</span>
        <input className="glp-input" value={start} onChange={(event) => setStart(event.target.value)} placeholder="origin/main (defaults to HEAD)" />
      </label>
      <Checkbox checked={checkout} onChange={setCheckout} label={t("Checkout after creating")} />
    </Modal>
  )
}

export function CreateMrDialog(props: { open: boolean; cwd: string; branch: string | null; defaultBranch: string | null; branches: Branch[]; issueNumber?: number; onClose: () => void; onDone: () => void }) {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [base, setBase] = useState(props.defaultBranch ?? "main")
  const [draft, setDraft] = useState(getPrefs().prDraft)
  const [template, setTemplate] = useState<string | undefined>()
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  useEffect(() => {
    if (!props.open) return
    setBase(props.defaultBranch ?? "main")
    setDraft(getPrefs().prDraft)
    setLoading(true)
    setError(undefined)
    api
      .mrDefaults(props.cwd, props.defaultBranch ?? "main")
      .then((defaults) => {
        setTitle(defaults.title)
        setBody(defaults.body)
        setTemplate(defaults.template)
      })
      .catch((reason: unknown) => setError(errorText(reason)))
      .finally(() => setLoading(false))
  }, [props.open, props.cwd, props.defaultBranch])
  const baseOptions = useMemo(() => {
    const names = props.branches.filter((branch) => !branch.remote).map((branch) => branch.name)
    return [...new Set([props.defaultBranch ?? "main", ...names])]
  }, [props.branches, props.defaultBranch])
  return (
    <Modal
      open={props.open}
      title={t("Create merge request")}
      onClose={props.onClose}
      width={620}
      footer={
        <>
          <Button variant="ghost" onClick={props.onClose}>{t("Cancel")}</Button>
          <Button
            variant="primary"
            busy={busy}
            disabled={!title.trim()}
            onClick={async () => {
              setBusy(true)
              try {
                const finalBody = props.issueNumber ? withClosing(body.trim() ? body : (template ?? ""), props.issueNumber) : body
                const url = await rpc<string>("createMr", { cwd: props.cwd, title: title.trim(), body: finalBody, base, draft })
                updatePrefs((prefs) => {
                  prefs.prDraft = draft
                })
                toast({ tone: "success", title: t("Merge request created"), description: url, action: url ? { label: t("Open on GitLab"), run: () => openExternal(url) } : undefined })
                props.onClose()
                props.onDone()
              } catch (reason) {
                errorToast(reason)
              } finally {
                setBusy(false)
              }
            }}
          >
            {t("Create")}
          </Button>
        </>
      }
    >
      {loading ? (
        <div className="glp-row"><Spinner /> {t("Loading…")}</div>
      ) : (
        <>
          {error ? <InlineError error={error} /> : null}
          <div className="glp-split">
            <label className="glp-col" style={{ gap: 4 }}>
              <span className="glp-dim">{t("Source")}</span>
              <input className="glp-input" value={props.branch ?? ""} readOnly />
            </label>
            <label className="glp-col" style={{ gap: 4 }}>
              <span className="glp-dim">{t("Base branch")}</span>
              <select className="glp-select" value={base} onChange={(event) => setBase(event.target.value)}>
                {baseOptions.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
          </div>
          <label className="glp-col" style={{ gap: 4 }}>
            <span className="glp-dim">{t("Title")}</span>
            <input className="glp-input" value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="glp-col" style={{ gap: 4 }}>
            <span className="glp-dim">{t("Description")}</span>
            <TextArea rows={8} value={body} onChange={(event) => setBody(event.target.value)} placeholder={template ? t("Pull request template is available") : undefined} />
          </label>
          <div className="glp-row">
            <Checkbox checked={draft} onChange={setDraft} label={t("Create as draft")} />
            {template ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setBody((current) => (current.trim() ? `${current.trimEnd()}\n\n${template}` : template))
                }}
              >
                {t("Insert template")}
              </Button>
            ) : null}
          </div>
          <div className="glp-faint" style={{ fontSize: 11 }}>Title, body and template are filled from the commits and the repository's merge request template. Pushing happens first if the branch is not on the remote.</div>
        </>
      )}
    </Modal>
  )
}

export function CreateIssueDialog(props: { open: boolean; cwd: string; onClose: () => void; onDone: () => void }) {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (props.open) {
      setTitle("")
      setBody("")
    }
  }, [props.open])
  return (
    <Modal
      open={props.open}
      title={t("New issue")}
      onClose={props.onClose}
      width={600}
      footer={
        <>
          <Button variant="ghost" onClick={props.onClose}>{t("Cancel")}</Button>
          <Button
            variant="primary"
            busy={busy}
            disabled={!title.trim()}
            onClick={async () => {
              setBusy(true)
              try {
                const url = await rpc<string>("createIssue", { cwd: props.cwd, title: title.trim(), body })
                toast({ tone: "success", title: t("Issue created"), description: url, action: url ? { label: t("Open on GitLab"), run: () => openExternal(url) } : undefined })
                props.onClose()
                props.onDone()
              } catch (error) {
                errorToast(error)
              } finally {
                setBusy(false)
              }
            }}
          >
            {t("Create")}
          </Button>
        </>
      }
    >
      <label className="glp-col" style={{ gap: 4 }}>
        <span className="glp-dim">{t("Title")}</span>
        <input className="glp-input" autoFocus value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      <label className="glp-col" style={{ gap: 4 }}>
        <span className="glp-dim">{t("Description")}</span>
        <TextArea rows={8} value={body} onChange={(event) => setBody(event.target.value)} />
      </label>
    </Modal>
  )
}

export function CloseDialog(props: {
  open: boolean
  repo: string
  kind: ItemKind
  numbers: number[]
  sessionID: string
  mode: "item" | "bulk"
  onClose: () => void
  onDone: () => void
}) {
  const [reason, setReason] = useState<CloseReason>("completed")
  const [duplicateOf, setDuplicateOf] = useState("")
  const [comment, setComment] = useState("")
  const [busy, setBusy] = useState(false)
  const replies = savedRepliesFor(props.repo)
  useEffect(() => {
    if (props.open) {
      setReason("completed")
      setDuplicateOf("")
      setComment("")
    }
  }, [props.open])
  const many = props.numbers.length > 1
  return (
    <Modal
      open={props.open}
      title={props.mode === "bulk" ? t("Close {count} items", { count: props.numbers.length }) : t("Close {item}", { item: `${props.kind === "mr" ? "!" : "#"}${props.numbers[0]}` })}
      onClose={props.onClose}
      footer={
        <>
          <Button variant="ghost" onClick={props.onClose}>{t("Cancel")}</Button>
          <Button
            variant="danger"
            busy={busy}
            onClick={async () => {
              setBusy(true)
              try {
                if (props.mode === "bulk") {
                  const result = await rpc<{ queued: number[]; skipped: { number: number; reason: string }[] }>("agentQueue", {
                    sessionID: props.sessionID,
                    repo: props.repo,
                    kind: "close",
                    itemKind: props.kind,
                    numbers: props.numbers,
                    body: comment || undefined,
                    reason,
                    duplicateOf: reason === "duplicate" && duplicateOf ? Number(duplicateOf) : undefined,
                  })
                  toast({ tone: "success", title: t("Queued {count} close actions", { count: result.queued.length }), description: result.skipped.length ? t("Skipped {count}", { count: result.skipped.length }) : undefined })
                } else {
                  for (const number of props.numbers) {
                    await rpc("setState", { repo: props.repo, number, kind: props.kind, open: false, reason, duplicateOf: reason === "duplicate" && duplicateOf ? Number(duplicateOf) : undefined, comment: comment || undefined })
                  }
                  toast({ tone: "success", title: t("Closed") })
                }
                props.onClose()
                props.onDone()
              } catch (error) {
                errorToast(error)
              } finally {
                setBusy(false)
              }
            }}
          >
            {t("Close")}
          </Button>
        </>
      }
    >
      {many ? <div className="glp-dim">{t("Closing {count} items asks first and runs one at a time; each can be undone from Agent activity.", { count: props.numbers.length })}</div> : null}
      {props.kind === "issue" ? (
        <label className="glp-col" style={{ gap: 4 }}>
          <span className="glp-dim">{t("Reason")}</span>
          <select className="glp-select" value={reason} onChange={(event) => setReason(event.target.value as CloseReason)}>
            <option value="completed">{t("Completed")}</option>
            <option value="not_planned">{t("Not planned")}</option>
            <option value="duplicate">{t("Duplicate")}</option>
          </select>
        </label>
      ) : null}
      {reason === "duplicate" && props.kind === "issue" ? (
        <label className="glp-col" style={{ gap: 4 }}>
          <span className="glp-dim">{t("Duplicate of")}</span>
          <input className="glp-input" value={duplicateOf} onChange={(event) => setDuplicateOf(event.target.value.replace(/[^0-9]/g, ""))} placeholder="#123" />
        </label>
      ) : null}
      <label className="glp-col" style={{ gap: 4 }}>
        <span className="glp-row"><span className="glp-dim" style={{ flex: 1 }}>{t("Comment (optional)")}</span>
          {replies.length > 0 ? (
            <select className="glp-select" style={{ width: "auto", maxWidth: 170 }} defaultValue="" onChange={(event) => {
              const reply = replies.find((entry) => entry.id === event.target.value)
              if (reply) setComment(reply.body)
              event.target.value = ""
            }}>
              <option value="">{t("Saved replies…")}</option>
              {replies.map((reply) => <option key={reply.id} value={reply.id}>{reply.name}</option>)}
            </select>
          ) : null}
        </span>
        <TextArea rows={5} value={comment} onChange={(event) => setComment(event.target.value)} />
      </label>
      <div className="glp-faint" style={{ fontSize: 11 }}>{t("GitLab closes without a reason; a duplicate link is added as a comment, and your comment is posted first.")}</div>
    </Modal>
  )
}

export function CommentDialog(props: {
  open: boolean
  repo: string
  kind: ItemKind
  numbers: number[]
  sessionID: string
  mode: "item" | "bulk"
  onClose: () => void
  onDone: () => void
}) {
  const [body, setBody] = useState("")
  const [busy, setBusy] = useState(false)
  const replies = savedRepliesFor(props.repo)
  useEffect(() => {
    if (props.open) setBody("")
  }, [props.open])
  return (
    <Modal
      open={props.open}
      title={props.numbers.length > 1 ? t("Comment on {count} items", { count: props.numbers.length }) : t("Comment")}
      onClose={props.onClose}
      footer={
        <>
          <Button variant="ghost" onClick={props.onClose}>{t("Cancel")}</Button>
          <Button
            variant="primary"
            busy={busy}
            disabled={!body.trim()}
            onClick={async () => {
              setBusy(true)
              try {
                if (props.mode === "bulk") {
                  const result = await rpc<{ queued: number[] }>("agentQueue", { sessionID: props.sessionID, repo: props.repo, kind: "comment", itemKind: props.kind, numbers: props.numbers, body })
                  toast({ tone: "success", title: t("Queued {count} comments", { count: result.queued.length }) })
                } else {
                  for (const number of props.numbers) await rpc("comment", { repo: props.repo, number, kind: props.kind, body })
                  toast({ tone: "success", title: t("Comment posted") })
                }
                props.onClose()
                props.onDone()
              } catch (error) {
                errorToast(error)
              } finally {
                setBusy(false)
              }
            }}
          >
            {t("Comment")}
          </Button>
        </>
      }
    >
      <div className="glp-row">
        <span className="glp-dim" style={{ flex: 1 }}>{t("Markdown is supported.")}</span>
        {replies.length > 0 ? (
          <select className="glp-select" style={{ width: "auto", maxWidth: 180 }} defaultValue="" onChange={(event) => {
            const reply = replies.find((entry) => entry.id === event.target.value)
            if (reply) setBody(reply.body)
            event.target.value = ""
          }}>
            <option value="">{t("Saved replies…")}</option>
            {replies.map((reply) => <option key={reply.id} value={reply.id}>{reply.name}</option>)}
          </select>
        ) : null}
        <Button size="sm" variant="ghost" onClick={() => {
          const name = window.prompt(t("Name"))
          if (name && body.trim()) rememberReply(props.repo, name, body)
        }}>{t("Save as reply")}</Button>
      </div>
      <TextArea rows={7} autoFocus value={body} onChange={(event) => setBody(event.target.value)} />
      {body.trim() ? <div className="glp-md" style={{ border: "0.5px solid var(--glp-border)", borderRadius: 6, padding: 8, maxHeight: 180, overflow: "auto" }}><Markdown text={body} repo={props.repo} /></div> : null}
    </Modal>
  )
}

export function EditItemDialog(props: { open: boolean; item: Item; onClose: () => void; onDone: () => void }) {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [labels, setLabels] = useState<string[]>([])
  const [assignees, setAssignees] = useState<string[]>([])
  const [reviewers, setReviewers] = useState<string[]>([])
  const [milestone, setMilestone] = useState("")
  const [draft, setDraft] = useState(false)
  const [busy, setBusy] = useState(false)
  const meta = useMeta(props.item.repo, props.open)
  useEffect(() => {
    if (!props.open) return
    setTitle(props.item.title)
    setBody(props.item.body)
    setLabels(props.item.labels.map((label) => label.name))
    setAssignees(props.item.assignees)
    setReviewers(props.item.pr?.requested ?? [])
    setMilestone(props.item.milestone ?? "")
    setDraft(props.item.draft)
  }, [props.open, props.item])
  const metaData: RepoMeta = meta.data ?? { labels: [], people: [], milestones: [] }
  const toggle = (list: string[], value: string) => (list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value])
  return (
    <Modal
      open={props.open}
      title={t("Edit")}
      onClose={props.onClose}
      width={600}
      footer={
        <>
          <Button variant="ghost" onClick={props.onClose}>{t("Cancel")}</Button>
          <Button
            variant="primary"
            busy={busy}
            onClick={async () => {
              setBusy(true)
              try {
                const original = props.item
                await rpc("edit", {
                  repo: original.repo,
                  number: original.number,
                  kind: original.kind,
                  ...(title !== original.title ? { title } : {}),
                  ...(body !== original.body ? { body } : {}),
                  addLabels: labels.filter((label) => !original.labels.some((entry) => entry.name === label)),
                  removeLabels: original.labels.map((entry) => entry.name).filter((label) => !labels.includes(label)),
                  addAssignees: assignees.filter((name) => !original.assignees.includes(name)),
                  removeAssignees: original.assignees.filter((name) => !assignees.includes(name)),
                  addReviewers: reviewers.filter((name) => !(original.pr?.requested ?? []).includes(name)),
                  removeReviewers: (original.pr?.requested ?? []).filter((name) => !reviewers.includes(name)),
                  milestone: milestone === (original.milestone ?? "") ? undefined : milestone || null,
                })
                if (original.kind === "mr" && draft !== original.draft) await rpc("setDraft", { repo: original.repo, number: original.number, draft })
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
      <label className="glp-col" style={{ gap: 4 }}>
        <span className="glp-dim">{t("Title")}</span>
        <input className="glp-input" value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      <label className="glp-col" style={{ gap: 4 }}>
        <span className="glp-dim">{t("Body")}</span>
        <TextArea rows={6} value={body} onChange={(event) => setBody(event.target.value)} />
      </label>
      <div className="glp-split">
        <div className="glp-col" style={{ gap: 4 }}>
          <span className="glp-dim">{t("Labels")}</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {meta.isLoading ? <Spinner /> : metaData.labels.map((label) => (
              <button key={label.name} type="button" style={{ border: labels.includes(label.name) ? "1px solid var(--glp-accent)" : "1px solid transparent", background: "transparent", borderRadius: 999, padding: 0, cursor: "pointer" }} onClick={() => setLabels(toggle(labels, label.name))}>
                <LabelChip label={label} />
              </button>
            ))}
          </div>
        </div>
        <div className="glp-col" style={{ gap: 4 }}>
          <span className="glp-dim">{t("Milestone")}</span>
          <select className="glp-select" value={milestone} onChange={(event) => setMilestone(event.target.value)}>
            <option value="">{t("None")}</option>
            {metaData.milestones.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
      </div>
      <div className="glp-split">
        <label className="glp-col" style={{ gap: 4 }}>
          <span className="glp-dim">{t("Assignees")}</span>
          <select className="glp-select" value="" onChange={(event) => { if (event.target.value) setAssignees(toggle(assignees, event.target.value)); event.target.value = "" }}>
            <option value="">{t("Add assignee…")}</option>
            {metaData.people.filter((name) => !assignees.includes(name)).map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
          <div className="glp-row" style={{ flexWrap: "wrap" }}>{assignees.map((name) => <button key={name} type="button" className="glp-chip" onClick={() => setAssignees(assignees.filter((entry) => entry !== name))}>@{name} <Icon name="close" size={9} /></button>)}</div>
        </label>
        {props.item.kind === "mr" ? (
          <label className="glp-col" style={{ gap: 4 }}>
            <span className="glp-dim">{t("Reviewers")}</span>
            <select className="glp-select" value="" onChange={(event) => { if (event.target.value) setReviewers(toggle(reviewers, event.target.value)); event.target.value = "" }}>
              <option value="">{t("Add reviewer…")}</option>
              {metaData.people.filter((name) => !reviewers.includes(name)).map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
            <div className="glp-row" style={{ flexWrap: "wrap" }}>{reviewers.map((name) => <button key={name} type="button" className="glp-chip" onClick={() => setReviewers(reviewers.filter((entry) => entry !== name))}>@{name} <Icon name="close" size={9} /></button>)}</div>
          </label>
        ) : <div />}
      </div>
      {props.item.kind === "mr" ? <Checkbox checked={draft} onChange={setDraft} label={t("Draft")} /> : null}
    </Modal>
  )
}

export function MergeDialog(props: { open: boolean; repo: string; number: number; onClose: () => void; onDone: () => void }) {
  const [squash, setSquash] = useState(false)
  const [deleteBranch, setDeleteBranch] = useState(false)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (props.open) {
      setSquash(false)
      setDeleteBranch(false)
    }
  }, [props.open])
  return (
    <Modal
      open={props.open}
      title={t("Merge !{number}?", { number: props.number })}
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
                await rpc("mergeMr", { repo: props.repo, number: props.number, squash, deleteBranch })
                toast({ tone: "success", title: t("Merged") })
                props.onClose()
                props.onDone()
              } catch (error) {
                errorToast(error)
              } finally {
                setBusy(false)
              }
            }}
          >
            {t("Merge")}
          </Button>
        </>
      }
    >
      <Checkbox checked={squash} onChange={setSquash} label={t("Squash commits")} />
      <Checkbox checked={deleteBranch} onChange={setDeleteBranch} label={t("Delete source branch")} />
      <div className="glp-faint" style={{ fontSize: 11 }}>{t("GitLab merges with the project's merge method; the pipeline must pass unless the project allows otherwise.")}</div>
    </Modal>
  )
}

export function StartWorkDialog(props: { open: boolean; item: Item; cwd: string; defaultBranch: string | null; onClose: () => void; onDone: () => void }) {
  const branches = useMemo(() => [] as Branch[], [])
  void branches
  const [branch, setBranch] = useState("")
  const [base, setBase] = useState(props.defaultBranch ?? "main")
  const [where, setWhere] = useState<"worktree" | "checkout">("worktree")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  useEffect(() => {
    if (props.open) {
      setBranch(issueBranchName(props.item.number, props.item.title))
      setBase(props.defaultBranch ?? "main")
      setWhere("worktree")
      setError(undefined)
    }
  }, [props.open, props.item, props.defaultBranch])
  return (
    <Modal
      open={props.open}
      title={t("Start working")}
      onClose={props.onClose}
      footer={
        <>
          <Button variant="ghost" onClick={props.onClose}>{t("Cancel")}</Button>
          <Button
            variant="primary"
            busy={busy}
            disabled={!branch.trim()}
            onClick={async () => {
              setBusy(true)
              setError(undefined)
              try {
                let target = props.cwd
                if (where === "worktree") {
                  const created = await rpc<{ path: string }>("worktreeAdd", { cwd: props.cwd, branch: branch.trim(), base })
                  target = created.path
                } else {
                  const overview = await api.overview(props.cwd)
                  if (overview && overview.files.length > 0) await rpc("stash", { cwd: props.cwd })
                  await rpc("createBranch", { cwd: props.cwd, name: branch.trim(), start: base, checkout: true })
                }
                rememberIssueBranch(props.item.repo, branch.trim(), props.item.number)
                await startAgentSession({ cwd: target, prompt: itemWorkingPrompt(props.item, branch.trim()) })
                toast({ tone: "success", title: t("Session started"), description: `${props.item.repo}${props.item.kind === "mr" ? "!" : "#"}${props.item.number}` })
                props.onClose()
                props.onDone()
              } catch (reason) {
                setError(errorText(reason))
              } finally {
                setBusy(false)
              }
            }}
          >
            {t("Start")}
          </Button>
        </>
      }
    >
      <div className="glp-md">
        <p><strong>{props.item.title}</strong></p>
        <p className="glp-faint">{props.item.repo}{props.item.kind === "mr" ? "!" : "#"}{props.item.number}</p>
      </div>
      {error ? <InlineError error={error} /> : null}
      <label className="glp-col" style={{ gap: 4 }}>
        <span className="glp-dim">{t("Branch name")}</span>
        <input className="glp-input" value={branch} onChange={(event) => setBranch(event.target.value)} />
      </label>
      <label className="glp-col" style={{ gap: 4 }}>
        <span className="glp-dim">{t("Start from")}</span>
        <select className="glp-select" value={base} onChange={(event) => setBase(event.target.value)}>
          <option value={props.defaultBranch ?? "main"}>{props.defaultBranch ?? "main"}</option>
          <option value="HEAD">{t("Current HEAD")}</option>
        </select>
      </label>
      <div className="glp-col" style={{ gap: 4 }}>
        <span className="glp-dim">{t("Where")}</span>
        <Segmented
          value={where}
          onChange={setWhere}
          options={[
            { value: "worktree", label: t("New worktree"), title: t("A separate folder; this checkout and its changes stay as they are") },
            { value: "checkout", label: t("This checkout"), title: t("Switch here, stashing your changes first") },
          ]}
        />
      </div>
      <div className="glp-faint" style={{ fontSize: 11 }}>
        {where === "worktree" ? t("A new worktree is created next to this repository and the agent starts there.") : t("Your changes are stashed before switching. The agent starts in this checkout.")}
      </div>
    </Modal>
  )
}

export function TriageDialog(props: { open: boolean; repo: string; kind: ItemKind; cwd: string; query: string | null; numbers: number[]; total: number; sessionID: string; onClose: () => void; onDone: () => void }) {
  const [rules, setRules] = useState("")
  const [batch, setBatch] = useState(10)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  const replies = savedRepliesFor(props.repo)
  const [picked, setPicked] = useState<string[]>([])
  const prefs = usePrefs()[0]
  useEffect(() => {
    if (props.open) {
      setRules(prefs.triageRules[props.repo] ?? "")
      setBatch(10)
      setPicked(replies.map((reply) => reply.id))
      setError(undefined)
    }
  }, [props.open, props.repo])
  return (
    <Modal
      open={props.open}
      title={t("Triage with agent")}
      onClose={props.onClose}
      width={600}
      footer={
        <>
          <Button variant="ghost" onClick={props.onClose}>{t("Cancel")}</Button>
          <Button
            variant="primary"
            busy={busy}
            onClick={async () => {
              setBusy(true)
              setError(undefined)
              try {
                const chosen = replies.filter((reply) => picked.includes(reply.id)).map((reply) => ({ name: reply.name, body: reply.body }))
                const triage = {
                  repo: props.repo,
                  kind: props.kind,
                  query: props.query,
                  numbers: props.numbers,
                  rules,
                  replies: chosen,
                  batch: Math.max(1, batch),
                  total: props.total,
                }
                const { triagePrompt } = await import("../host/plan")
                const prompt = triagePrompt({ ...triage, numbers: props.numbers })
                const sessionID = await startAgentSession({ cwd: props.cwd, prompt, open: false })
                await rpc("agentTriage", { sessionID, triage })
                pluginCtx().uiWorkspace?.openSession?.(sessionID)
                updatePrefs((draft) => {
                  draft.triageRules[props.repo] = rules
                })
                toast({ tone: "success", title: t("Triage started"), description: t("{count} items", { count: props.total }) })
                props.onClose()
                props.onDone()
              } catch (reason) {
                setError(errorText(reason))
              } finally {
                setBusy(false)
              }
            }}
          >
            {t("Start")}
          </Button>
        </>
      }
    >
      {error ? <InlineError error={error} /> : null}
      <div className="glp-dim">
        {props.query ? <>{t("Search")}: <code>{props.query}</code></> : <>{props.numbers.length} {props.kind === "mr" ? t("merge requests") : t("issues")}</>} · {t("{count} items", { count: props.total })}
      </div>
      <label className="glp-col" style={{ gap: 4 }}>
        <span className="glp-dim">{t("Rules")}</span>
        <TextArea rows={6} value={rules} onChange={(event) => setRules(event.target.value)} placeholder={t("For example: close spam as not planned; label crashes with bug; ask for reproduction steps when the report has none.")} />
      </label>
      <label className="glp-col" style={{ gap: 4 }}>
        <span className="glp-dim">{t("Batch size")}</span>
        <input className="glp-input" type="number" min={1} max={50} value={batch} onChange={(event) => setBatch(Number(event.target.value) || 1)} />
      </label>
      {replies.length > 0 ? (
        <div className="glp-col" style={{ gap: 4 }}>
          <span className="glp-dim">{t("Saved replies to use")}</span>
          {replies.map((reply) => (
            <Checkbox key={reply.id} checked={picked.includes(reply.id)} onChange={(value) => setPicked(value ? [...picked, reply.id] : picked.filter((id) => id !== reply.id))} label={reply.name} />
          ))}
        </div>
      ) : null}
      <div className="glp-faint" style={{ fontSize: 11 }}>{t("A new session starts with these rules. Every proposed change waits for your approval; use Agent activity to approve or skip in batches.")}</div>
    </Modal>
  )
}

export function SavedRepliesDialog(props: { open: boolean; repo: string; onClose: () => void }) {
  const [prefs, setPrefs] = usePrefs()
  const replies = prefs.savedReplies.filter((reply) => reply.repo === props.repo)
  const [name, setName] = useState("")
  const [body, setBody] = useState("")
  return (
    <Modal open={props.open} title={t("Saved replies")} onClose={props.onClose} footer={<Button variant="ghost" onClick={props.onClose}>{t("Close")}</Button>}>
      {replies.length === 0 ? <div className="glp-faint">{t("No saved replies for this repository yet.")}</div> : null}
      {replies.map((reply) => (
        <div key={reply.id} className="glp-col" style={{ gap: 4, border: "0.5px solid var(--glp-border)", borderRadius: 6, padding: 8 }}>
          <div className="glp-row">
            <strong style={{ flex: 1 }}>{reply.name}</strong>
            <Button size="sm" variant="ghost" onClick={() => { setName(reply.name); setBody(reply.body) }}>{t("Edit")}</Button>
            <Button size="sm" variant="ghost" onClick={() => setPrefs((draft: Prefs) => { draft.savedReplies = draft.savedReplies.filter((entry) => entry.id !== reply.id) })}>{t("Delete")}</Button>
          </div>
          <div className="glp-faint glp-wrap" style={{ maxHeight: 70, overflow: "auto", whiteSpace: "pre-wrap" }}>{reply.body}</div>
        </div>
      ))}
      <div className="glp-col" style={{ gap: 4, marginTop: 6 }}>
        <span className="glp-dim">{t("New reply")}</span>
        <input className="glp-input" placeholder={t("Name")} value={name} onChange={(event) => setName(event.target.value)} />
        <TextArea rows={4} placeholder={t("Body")} value={body} onChange={(event) => setBody(event.target.value)} />
        <Button
          size="sm"
          variant="primary"
          disabled={!name.trim() || !body.trim()}
          onClick={() => {
            rememberReply(props.repo, name.trim(), body)
            setName("")
            setBody("")
          }}
        >
          {t("Save")}
        </Button>
      </div>
    </Modal>
  )
}

export function CleanupDialog(props: {
  open: boolean
  cwd: string
  candidates: { name: string; reasons: readonly { kind: string; number?: number; base?: string }[]; risk: string | null }[]
  onClose: () => void
  onDone: () => void
}) {
  const [picked, setPicked] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (props.open) setPicked(props.candidates.filter((candidate) => !candidate.risk).map((candidate) => candidate.name))
  }, [props.open, props.candidates])
  const reasonText = (candidate: (typeof props.candidates)[number]) =>
    candidate.reasons
      .map((reason) =>
        reason.kind === "merged-mr" || reason.kind === "closed-mr"
          ? `${reason.kind === "merged-mr" ? t("MR merged") : t("MR closed")} !${reason.number}`
          : reason.kind === "gone"
            ? t("upstream gone")
            : t("merged into {base}", { base: reason.base ?? "" }),
      )
      .join(", ")
  return (
    <Modal
      open={props.open}
      title={t("Clean up branches")}
      onClose={props.onClose}
      width={600}
      footer={
        <>
          <Button variant="ghost" onClick={props.onClose}>{t("Cancel")}</Button>
          <Button
            variant="danger"
            busy={busy}
            disabled={picked.length === 0}
            onClick={async () => {
              setBusy(true)
              try {
                const result = await rpc<{ name: string; error: string | null }[]>("deleteBranches", { cwd: props.cwd, names: picked, force: true })
                const failed = result.filter((entry) => entry.error)
                toast({ tone: failed.length ? "error" : "success", title: t("Deleted {count} branches", { count: result.length - failed.length }), description: failed[0]?.error ?? undefined })
                props.onClose()
                props.onDone()
              } catch (error) {
                errorToast(error)
              } finally {
                setBusy(false)
              }
            }}
          >
            {t("Delete {count}", { count: picked.length })}
          </Button>
        </>
      }
    >
      {props.candidates.length === 0 ? <div className="glp-faint">{t("No branches look done with.")}</div> : null}
      {props.candidates.map((candidate) => (
        <div key={candidate.name} className="glp-row" style={{ padding: "4px 0", alignItems: "flex-start" }}>
          <Checkbox checked={picked.includes(candidate.name)} onChange={(value) => setPicked(value ? [...picked, candidate.name] : picked.filter((name) => name !== candidate.name))} />
          <div className="glp-col" style={{ flex: 1 }}>
            <span style={{ fontFamily: "var(--glp-mono)", fontSize: 11.5 }}>{candidate.name}</span>
            <span className="glp-faint" style={{ fontSize: 10.5 }}>{reasonText(candidate)}</span>
            {candidate.risk ? <span className="glp-pill" data-tone="warn" style={{ alignSelf: "flex-start" }}>{t(candidate.risk === "unpushed" ? "unpushed commits" : candidate.risk === "moved" ? "moved past its MR" : "not merged")}</span> : null}
          </div>
        </div>
      ))}
      <div className="glp-faint" style={{ fontSize: 11 }}>{t("Branches with unpushed work start unchecked. Branches checked out in a worktree are not listed.")}</div>
    </Modal>
  )
}

export function SavedSearchDialog(props: { open: boolean; repo: string; kind: ItemKind; query: string; onClose: () => void; onSaved: (search: SavedSearch) => void }) {
  const [name, setName] = useState("")
  return (
    <Modal
      open={props.open}
      title={t("Save search")}
      onClose={props.onClose}
      footer={
        <>
          <Button variant="ghost" onClick={props.onClose}>{t("Cancel")}</Button>
          <Button
            variant="primary"
            disabled={!name.trim()}
            onClick={() => {
              rememberSavedSearch(props.repo, props.kind, name.trim(), props.query)
              const search = getPrefs().savedSearches.find((entry) => entry.repo === props.repo && entry.kind === props.kind && entry.name === name.trim())
              if (search) props.onSaved(search)
              props.onClose()
            }}
          >
            {t("Save")}
          </Button>
        </>
      }
    >
      <div className="glp-dim"><code>{props.query}</code></div>
      <input className="glp-input" autoFocus placeholder={t("Name")} value={name} onChange={(event) => setName(event.target.value)} />
    </Modal>
  )
}

export function BulkMenu(props: {
  repo: string
  kind: ItemKind
  numbers: number[]
  sessionID: string
  cwd: string
  items: { number: number; title: string; state: string; url: string }[]
  onCloseSelection: () => void
  onDone: () => void
  onAsk: () => void
  onTriage: () => void
}) {
  const entries: MenuEntry[] = [
    { label: t("Reopen {count}", { count: props.numbers.length }), icon: "undo", onSelect: async () => {
      if (props.numbers.length > 1 && !window.confirm(t("Reopen {count} items?", { count: props.numbers.length }))) return
      try {
        const result = await rpc<{ queued: number[] }>("agentQueue", { sessionID: props.sessionID, repo: props.repo, kind: "reopen", itemKind: props.kind, numbers: props.numbers })
        toast({ tone: "success", title: t("Queued {count} reopen actions", { count: result.queued.length }) })
        props.onDone()
        props.onCloseSelection()
      } catch (error) {
        errorToast(error)
      }
    } },
    { label: t("Ask agent about these"), icon: "sparkles", onSelect: props.onAsk },
    { label: t("Triage these {count} with agent", { count: props.numbers.length }), icon: "checklist", onSelect: props.onTriage },
  ]
  return <Menu label={t("More")} icon="dots" trigger="icon" items={entries} />
}

export function assignLabelText(labels: Label[]) {
  return labels.map((label) => label.name).join(", ")
}

export function itemStateLabel(state: string) {
  return state === "MERGED" ? t("Merged") : state === "CLOSED" ? t("Closed") : t("Open")
}
