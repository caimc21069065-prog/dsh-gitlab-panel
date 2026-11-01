import { useMemo } from "react"
import { parsePatch } from "../shared/core"
import type { ChangedFile } from "../shared/types"
import { t } from "./i18n"
import { Empty, Icon, Spinner } from "./ui"

export function DiffView(props: {
  patch: string | null | undefined
  loading?: boolean
  error?: string
  onComment?: (side: "LEFT" | "RIGHT", line: number) => void
  maxHeight?: number | string
  emptyText?: string
}) {
  const lines = useMemo(() => parsePatch((props.patch ?? "").replace(/\r\n/g, "\n")), [props.patch])
  if (props.loading) {
    return (
      <div className="glp-diff">
        <div className="glp-diff-empty glp-row">
          <Spinner /> {t("Loading diff…")}
        </div>
      </div>
    )
  }
  if (props.error) return <div className="glp-diff"><div className="glp-diff-empty glp-error">{props.error}</div></div>
  if (!props.patch) return <div className="glp-diff"><div className="glp-diff-empty">{props.emptyText ?? t("No diff")}</div></div>
  if (lines.length === 0) return <div className="glp-diff"><div className="glp-diff-empty">{t("No diff")}</div></div>
  return (
    <div className="glp-diff" style={props.maxHeight ? { maxHeight: props.maxHeight } : undefined}>
      <table className="glp-diff-table">
        <tbody>
          {lines.map((line, index) =>
            line.kind === "hunk" ? (
              <tr key={index} className="glp-diff-line" data-kind="hunk">
                <td className="glp-diff-num" />
                <td className="glp-diff-num" />
                <td className="glp-diff-marker" />
                <td className="glp-diff-text">{line.text}</td>
              </tr>
            ) : (
              <tr key={index} className="glp-diff-line" data-kind={line.kind}>
                <td
                  className="glp-diff-num"
                  title={props.onComment && line.old !== null ? t("Add comment") : undefined}
                  onClick={props.onComment && line.old !== null ? () => props.onComment?.("LEFT", line.old ?? 0) : undefined}
                >
                  {line.old ?? ""}
                </td>
                <td
                  className="glp-diff-num"
                  title={props.onComment && line.new !== null ? t("Add comment") : undefined}
                  onClick={props.onComment && line.new !== null ? () => props.onComment?.("RIGHT", line.new ?? 0) : undefined}
                >
                  {line.new ?? ""}
                </td>
                <td className="glp-diff-marker">{line.kind === "add" ? "+" : line.kind === "del" ? "-" : " "}</td>
                <td className="glp-diff-text">{line.text}</td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  )
}

export function FileBlock(props: {
  file: ChangedFile
  open: boolean
  onToggle: () => void
  onComment?: (side: "LEFT" | "RIGHT", line: number) => void
  viewed?: boolean
  onViewed?: (viewed: boolean) => void
  children?: React.ReactNode
}) {
  return (
    <section className="glp-file-block">
      <div className="glp-file-block-head" onClick={props.onToggle}>
        <Icon name={props.open ? "chevron-down" : "chevron-right"} size={11} />
        <span className="glp-file-status" data-code={statusCode(props.file.status)}>{statusCode(props.file.status)}</span>
        <span className="glp-file-name" style={{ maxWidth: "60%" }}>
          <span>{props.file.previous && props.file.previous !== props.file.path ? `${props.file.previous} → ${props.file.path}` : props.file.path}</span>
        </span>
        <span className="glp-faint" style={{ marginLeft: "auto", fontFamily: "var(--glp-mono)", fontSize: 10.5 }}>
          +{props.file.additions} −{props.file.deletions}
        </span>
        {props.onViewed ? (
          <label className="glp-faint" style={{ fontSize: 10.5, display: "flex", alignItems: "center", gap: 3 }} onClick={(event) => event.stopPropagation()}>
            <input type="checkbox" checked={!!props.viewed} onChange={(event) => props.onViewed?.(event.target.checked)} />
            {t("Viewed")}
          </label>
        ) : null}
      </div>
      {props.open ? props.children : null}
    </section>
  )
}

export function statusCode(status: string) {
  if (status === "added" || status === "A") return "A"
  if (status === "removed" || status === "deleted" || status === "D") return "D"
  if (status === "renamed" || status === "R") return "R"
  if (status === "copied" || status === "C") return "C"
  if (status === "modified" || status === "M") return "M"
  return "M"
}

export function FileStatusLabel(props: { status: string }) {
  const code = statusCode(props.status)
  return <span className="glp-file-status" data-code={code}>{code}</span>
}

export function FileBadge(props: { path: string; status?: string }) {
  return (
    <span className="glp-row" style={{ minWidth: 0, fontFamily: "var(--glp-mono)", fontSize: 11 }}>
      <FileStatusLabel status={props.status ?? "modified"} />
      <span className="glp-ellipsis">{props.path}</span>
    </span>
  )
}

export function NoDiff() {
  return <Empty icon="file" inline>{t("No diff")}</Empty>
}
