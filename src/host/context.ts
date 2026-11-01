import type { Check, Item } from "../shared/types"

const LIMIT = 24_000
const DESCRIPTION = 8_000
const LINE = 500

/** An issue or merge request as Markdown for the agent's view tool; the newest comments are kept when space runs out. */
export function itemContextText(item: Item, keep = 10) {
  const kind = item.kind === "mr" ? "merge request" : "issue"
  const pr = item.pr
  const comments = keep === 0 ? [] : item.comments.slice(-keep)
  const head = [
    `# ${item.kind === "mr" ? "Merge request" : "Issue"} ${item.repo}${item.kind === "mr" ? "!" : "#"}${item.number}: ${item.title}`,
    "",
    `- State: ${item.draft && item.state === "OPEN" ? "draft" : item.state.toLowerCase()}`,
    `- Author: @${item.author}`,
    `- URL: ${item.url}`,
    ...(item.labels.length > 0 ? [`- Labels: ${item.labels.map((label) => label.name).join(", ")}`] : []),
    ...(item.assignees.length > 0 ? [`- Assignees: ${item.assignees.map((login) => `@${login}`).join(", ")}`] : []),
    ...(item.milestone ? [`- Milestone: ${item.milestone}`] : []),
    ...(pr
      ? [
          `- Branch: ${pr.head} → ${pr.base}${pr.cross ? " (from a fork)" : ""}`,
          `- Size: ${pr.files} changed files`,
          ...(pr.review ? [`- Review: ${pr.review.toLowerCase().replace(/_/g, " ")}`] : []),
          ...(pr.checks.length > 0 ? [`- Pipeline: ${checks(pr.checks)}`] : []),
        ]
      : []),
  ]
  const description = ["", "## Description", "", clip(item.body.trim(), DESCRIPTION) || "_No description._"]
  const conversation = comments.length > 0 ? ["", `## Comments (${item.comments.length})`, ...(item.comments.length > comments.length ? ["", `_${item.comments.length - comments.length} older comments omitted._`] : []), ...comments.flatMap((comment) => ["", `### @${comment.author} (${comment.created.slice(0, 10)})`, "", clip(comment.body.trim(), DESCRIPTION)])] : []
  return clip([...head, ...description, ...conversation].join("\n"))
}

function checks(list: readonly Check[]) {
  const failed = list.filter((check) => check.state === "failure").map((check) => check.name)
  const pending = list.filter((check) => check.state === "pending").length
  const passed = list.filter((check) => check.state === "success").length
  return [failed.length > 0 ? `failing: ${failed.join(", ")}` : "", pending > 0 ? `${pending} running` : "", `${passed} passed`].filter(Boolean).join("; ")
}

function clip(text: string, limit = LIMIT) {
  return text.length > limit ? `${text.slice(0, limit)}\n… (${text.length - limit} more characters omitted)` : text
}

export const contextLineLimit = LINE
