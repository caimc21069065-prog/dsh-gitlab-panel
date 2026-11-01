// src/host/agent.ts
import { randomUUID } from "node:crypto";
import { homedir } from "node:os";
import { resolve } from "node:path";

// src/host/context.ts
var LIMIT = 24e3;
var DESCRIPTION = 8e3;
function itemContextText(item, keep2 = 10) {
  const kind = item.kind === "mr" ? "merge request" : "issue";
  const pr = item.pr;
  const comments = keep2 === 0 ? [] : item.comments.slice(-keep2);
  const head = [
    `# ${item.kind === "mr" ? "Merge request" : "Issue"} ${item.repo}${item.kind === "mr" ? "!" : "#"}${item.number}: ${item.title}`,
    "",
    `- State: ${item.draft && item.state === "OPEN" ? "draft" : item.state.toLowerCase()}`,
    `- Author: @${item.author}`,
    `- URL: ${item.url}`,
    ...item.labels.length > 0 ? [`- Labels: ${item.labels.map((label) => label.name).join(", ")}`] : [],
    ...item.assignees.length > 0 ? [`- Assignees: ${item.assignees.map((login) => `@${login}`).join(", ")}`] : [],
    ...item.milestone ? [`- Milestone: ${item.milestone}`] : [],
    ...pr ? [
      `- Branch: ${pr.head} \u2192 ${pr.base}${pr.cross ? " (from a fork)" : ""}`,
      `- Size: ${pr.files} changed files`,
      ...pr.review ? [`- Review: ${pr.review.toLowerCase().replace(/_/g, " ")}`] : [],
      ...pr.checks.length > 0 ? [`- Pipeline: ${checks(pr.checks)}`] : []
    ] : []
  ];
  const description = ["", "## Description", "", clip(item.body.trim(), DESCRIPTION) || "_No description._"];
  const conversation = comments.length > 0 ? ["", `## Comments (${item.comments.length})`, ...item.comments.length > comments.length ? ["", `_${item.comments.length - comments.length} older comments omitted._`] : [], ...comments.flatMap((comment) => ["", `### @${comment.author} (${comment.created.slice(0, 10)})`, "", clip(comment.body.trim(), DESCRIPTION)])] : [];
  return clip([...head, ...description, ...conversation].join("\n"));
}
function checks(list) {
  const failed = list.filter((check) => check.state === "failure").map((check) => check.name);
  const pending = list.filter((check) => check.state === "pending").length;
  const passed = list.filter((check) => check.state === "success").length;
  return [failed.length > 0 ? `failing: ${failed.join(", ")}` : "", pending > 0 ? `${pending} running` : "", `${passed} passed`].filter(Boolean).join("; ");
}
function clip(text, limit = LIMIT) {
  return text.length > limit ? `${text.slice(0, limit)}
\u2026 (${text.length - limit} more characters omitted)` : text;
}

// src/shared/core.ts
var FIELD = "";
var RECORD = "";
var LOG_FORMAT = ["%H", "%P", "%an", "%ae", "%at", "%s", "%D"].join("%x1f") + "%x1e";
var BRANCH_FORMAT = [
  "%(refname)",
  "%(objectname:short)",
  "%(upstream:short)",
  "%(upstream:track,nobracket)",
  "%(committerdate:unix)",
  "%(contents:subject)",
  "%(HEAD)"
].join("%1f");
function parseStatus(output) {
  const tokens = output.split("\0");
  const branch = { head: null, branch: null, upstream: null, ahead: 0, behind: 0 };
  const files = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) continue;
    if (token.startsWith("# ")) {
      const [key, ...rest] = token.slice(2).split(" ");
      const value = rest.join(" ");
      if (key === "branch.oid") branch.head = value === "(initial)" ? null : value;
      if (key === "branch.head") branch.branch = value === "(detached)" ? null : value;
      if (key === "branch.upstream") branch.upstream = value;
      if (key === "branch.ab") {
        const match = /^\+(\d+) -(\d+)$/.exec(value);
        branch.ahead = Number(match?.[1] ?? 0);
        branch.behind = Number(match?.[2] ?? 0);
      }
      continue;
    }
    const kind = token[0];
    if (kind === "?") {
      files.push(change(token.slice(2), null, ".", "?", false, true));
      continue;
    }
    if (kind === "1") {
      const parts = token.split(" ");
      const xy = parts[1] ?? "..";
      files.push(change(parts.slice(8).join(" "), null, xy[0] ?? ".", xy[1] ?? ".", false, false));
      continue;
    }
    if (kind === "2") {
      const parts = token.split(" ");
      const xy = parts[1] ?? "..";
      const orig = tokens[i + 1] ?? null;
      i++;
      files.push(change(parts.slice(9).join(" "), orig, xy[0] ?? ".", xy[1] ?? ".", false, false));
      continue;
    }
    if (kind === "u") {
      const parts = token.split(" ");
      const xy = parts[1] ?? "UU";
      files.push(change(parts.slice(10).join(" "), null, xy[0] ?? "U", xy[1] ?? "U", true, false));
    }
  }
  return { branch, files };
}
function change(path, origPath, index, worktree, conflicted, untracked) {
  return { path, origPath, index, worktree, conflicted, untracked };
}
function parseLog(output) {
  return output.split(RECORD).map((record2) => record2.replace(/^\n/, "")).filter((record2) => record2.length > 0).flatMap((record2) => {
    const [hash, parents, author, email, date, subject, decorations] = record2.split(FIELD);
    if (!hash) return [];
    return [{
      hash,
      parents: parents ? parents.split(" ").filter(Boolean) : [],
      author: author ?? "",
      email: email ?? "",
      date: Number(date ?? 0),
      subject: subject ?? "",
      refs: parseDecorations(decorations ?? "")
    }];
  });
}
function parseDecorations(value) {
  return value.split(", ").map((item) => item.trim()).filter(Boolean).flatMap((item) => {
    if (item === "HEAD") return [{ name: "HEAD", kind: "head" }];
    if (item.startsWith("HEAD -> ")) return [{ name: "HEAD", kind: "head" }, ...parseDecorations(item.slice("HEAD -> ".length))];
    if (item.startsWith("tag: ")) return [{ name: item.slice(5).replace(/^refs\/tags\//, ""), kind: "tag" }];
    if (item.startsWith("refs/heads/")) return [{ name: item.slice(11), kind: "local" }];
    if (item.startsWith("refs/remotes/")) {
      const name2 = item.slice(13);
      if (name2.endsWith("/HEAD")) return [];
      return [{ name: name2, kind: "remote" }];
    }
    return [];
  });
}
function parseBranches(output, worktrees = /* @__PURE__ */ new Map()) {
  return output.split("\n").filter(Boolean).flatMap((line) => {
    const [ref, sha, upstream, track, date, subject, head] = line.split(FIELD);
    if (!ref) return [];
    const remote = ref.startsWith("refs/remotes/");
    const name2 = ref.replace(/^refs\/(heads|remotes)\//, "");
    if (remote && (name2.endsWith("/HEAD") || !name2.includes("/"))) return [];
    const worktree = remote || head === "*" ? void 0 : worktrees.get(name2);
    return [{
      name: name2,
      remote,
      current: head === "*",
      upstream: upstream || null,
      ahead: Number(/ahead (\d+)/.exec(track ?? "")?.[1] ?? 0),
      behind: Number(/behind (\d+)/.exec(track ?? "")?.[1] ?? 0),
      gone: track === "gone",
      sha: sha ?? "",
      date: Number(date ?? 0),
      subject: subject ?? "",
      ...worktree ? { worktree } : {}
    }];
  });
}
function parseWorktrees(output) {
  return new Map(
    output.split(/\n\n+/).flatMap((record2) => {
      const lines = record2.split("\n");
      const path = lines.find((line) => line.startsWith("worktree "))?.slice("worktree ".length);
      const branch = lines.find((line) => line.startsWith("branch refs/heads/"))?.slice("branch refs/heads/".length);
      if (!path || !branch || lines.some((line) => line === "prunable" || line.startsWith("prunable "))) return [];
      return [[branch, path]];
    })
  );
}
function parseRemote(name2, url, override) {
  const trimmed = url.trim();
  let host = "";
  let path = "";
  let scheme = "https";
  const https = /^(https?):\/\/(?:[^@/]+@)?([^/:]+)(?::\d+)?\/(.+?)\/?$/i.exec(trimmed);
  const ssh = /^(?:ssh:\/\/)?(?:[\w.-]+@)([^/:]+)(?::\d+)?[:/](.+?)\/?$/i.exec(trimmed);
  if (https?.[1] && https[2] && https[3]) {
    scheme = https[1];
    host = https[2];
    path = https[3];
  } else if (ssh?.[1] && ssh[2]) {
    host = ssh[1];
    path = ssh[2];
  } else {
    return void 0;
  }
  path = path.replace(/\.git$/i, "");
  if (override?.project) path = override.project;
  if (override?.host) host = override.host;
  if (!path.includes("/") || !host) return void 0;
  const parts = path.split("/");
  const repo = parts.pop() ?? "";
  const owner = parts.join("/");
  const apiBase = override?.apiBase?.replace(/\/$/, "") ?? `${scheme}://${host}`;
  return {
    name: name2,
    host,
    path,
    owner,
    repo,
    web: `${apiBase}/${path}`,
    apiBase,
    scheme
  };
}
function parsePatch(patch) {
  const lines = [];
  const at = { old: 0, new: 0 };
  let inHunk = false;
  for (const text of patch.split("\n")) {
    const hunk = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(text);
    if (hunk) {
      at.old = Number(hunk[1]);
      at.new = Number(hunk[2]);
      inHunk = true;
      lines.push({ kind: "hunk", text, old: null, new: null });
      continue;
    }
    if (text.startsWith("diff --git ") || text.startsWith("Binary files ")) {
      inHunk = false;
      lines.push({ kind: "hunk", text, old: null, new: null });
      continue;
    }
    if (!inHunk) continue;
    if (text.startsWith("\\") || text === "") continue;
    if (text.startsWith("+")) {
      lines.push({ kind: "add", text: text.slice(1), old: null, new: at.new++ });
      continue;
    }
    if (text.startsWith("-")) {
      lines.push({ kind: "del", text: text.slice(1), old: at.old++, new: null });
      continue;
    }
    lines.push({ kind: "context", text: text.slice(1), old: at.old++, new: at.new++ });
  }
  return lines;
}
function diffStats(patch) {
  let additions = 0;
  let deletions = 0;
  for (const line of parsePatch(patch)) {
    if (line.kind === "add") additions++;
    if (line.kind === "del") deletions++;
  }
  return { additions, deletions };
}
function hunkAt(patch, line, side) {
  if (!patch) return "";
  const lines = parsePatch(patch);
  for (let i = 0; i < lines.length; i++) {
    const row = lines[i];
    if (row?.kind !== "hunk" && (side === "RIGHT" ? row?.new : row?.old) === line) {
      let start = i;
      while (start > 0 && lines[start - 1]?.kind !== "hunk") start--;
      let end = i;
      while (end + 1 < lines.length && lines[end + 1]?.kind !== "hunk") end++;
      const width = side === "RIGHT" ? 200 : 200;
      return lines.slice(start, Math.min(end + 1, start + width)).map((entry) => entry.kind === "add" ? `+${entry.text}` : entry.kind === "del" ? `-${entry.text}` : entry.kind === "hunk" ? entry.text : ` ${entry.text}`).join("\n");
    }
  }
  return "";
}
function checkState(status) {
  if (!status) return "none";
  const value = status.toLowerCase();
  if (["success", "passed"].includes(value)) return "success";
  if (["failed", "canceled", "cancelled", "timedout", "timeout"].includes(value)) return "failure";
  if (["created", "waiting_for_resource", "preparing", "pending", "running", "manual", "scheduled", "skipped"].includes(value)) {
    return value === "skipped" || value === "manual" ? "none" : "pending";
  }
  return "none";
}
function parseSearchQuery(query, kind) {
  const params = {};
  const words = [];
  let sort = null;
  const order = (value) => {
    const match = /^(created|updated|priority|milestone|popularity|label_priority|due_date|merged|closed)-(asc|desc)$/.exec(value);
    if (!match) return false;
    sort = value;
    params.order_by = match[1] === "closed" ? "updated_at" : match[1] === "merged" ? "updated_at" : match[1];
    params.sort = match[2] ?? "desc";
    return true;
  };
  for (const raw of tokenize(query)) {
    const negated = raw.startsWith("-");
    const token = negated ? raw.slice(1) : raw;
    const colon = token.indexOf(":");
    if (colon === -1) {
      words.push(raw);
      continue;
    }
    const key = token.slice(0, colon);
    const value = token.slice(colon + 1);
    if (!value) {
      words.push(raw);
      continue;
    }
    const state = (next) => {
      if (kind === "mr" && next === "open") params.state = "opened";
      else if (kind === "mr" && next === "merged") params.state = "merged";
      else if (next === "closed") params.state = "closed";
      else params.state = "opened";
    };
    if (key === "is") {
      if (["open", "opened", "closed", "merged", "all"].includes(value)) {
        if (value === "all") params.state = "all";
        else state(value);
        continue;
      }
      if (kind === "mr" && (value === "draft" || value === "ready")) {
        params.wip = (value === "ready" ? !negated : negated) ? "no" : "yes";
        continue;
      }
      if (value === "issue" || value === "pr" || value === "mr") continue;
    }
    if (key === "sort" && order(value)) continue;
    if (key === "label") {
      if (negated) params["not[labels]"] = joinList(params["not[labels]"], value);
      else params.labels = joinList(params.labels, value);
      continue;
    }
    if (key === "author") {
      if (!negated) params.author_username = normUser(value);
      continue;
    }
    if (key === "assignee") {
      if (negated || value === "none") params.assignee_id = "None";
      else params.assignee_username = normUser(value);
      continue;
    }
    if (key === "reviewer" && kind === "mr") {
      if (!negated) params.reviewer_username = normUser(value);
      continue;
    }
    if (key === "milestone") {
      if (negated) params["not[milestone]"] = value;
      else params.milestone = value;
      continue;
    }
    if (key === "no" && value === "assignee") {
      params.assignee_id = "None";
      continue;
    }
    if (key === "no" && value === "label") {
      params.labels = "None";
      continue;
    }
    if (key === "no" && value === "milestone") {
      params.milestone = "None";
      continue;
    }
    if (key === "draft" && kind === "mr") {
      params.wip = /^(false|no|0)$/i.test(value) || negated ? "no" : "yes";
      continue;
    }
    if (key === "in") {
      params.in = value;
      continue;
    }
    if (key === "created" || key === "updated") {
      const date = /^[<>]=?(\d{4}-\d\d-\d\d)$/.exec(value);
      if (date?.[1]) {
        params[`${key}_after`] = date[1];
        continue;
      }
    }
    words.push(raw);
  }
  if (!params.state || params.state === "opened") {
    if (!sort) {
      params.order_by = "created_at";
      params.sort = "desc";
    }
  } else if (!sort) {
    delete params.order_by;
    delete params.sort;
  }
  return { search: words.join(" ").trim(), params, sort };
}
function tokenize(query) {
  const tokens = [];
  let word = "";
  let quote = "";
  for (const char of query) {
    if (quote) {
      if (char === quote) quote = "";
      else word += char;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (/\s/.test(char)) {
      if (word) tokens.push(word);
      word = "";
      continue;
    }
    word += char;
  }
  if (word) tokens.push(word);
  return tokens;
}
function normUser(value) {
  return value === "@me" ? "@me" : value.replace(/^@/, "");
}
function joinList(current, value) {
  if (!current) return value;
  if (current === "None" || value === "None") return value;
  return `${current},${value}`;
}

// src/host/plan.ts
var MAX_BATCH = 100;
var MAX_BODY = 65536;
var MAX_NOTE = 1e3;
var RETRIES = 3;
var STALE = 15 * 6e4;
function parseWrite(kind, input) {
  if (typeof input !== "object" || input === null) throw new Error("Pass the arguments as an object.");
  const value = input;
  const repo = value.repo === void 0 || value.repo === null || value.repo === "" ? null : checkRepo(value.repo);
  const numbers = checkNumbers(value.numbers);
  const note = typeof value.note === "string" ? value.note.trim() : "";
  if (!note) throw new Error("`note` is required: one short sentence telling the user why, shown next to the action.");
  const itemKind = value.kind === "issue" || value.kind === "mr" ? value.kind : void 0;
  return { repo, numbers, kind, payload: payloadOf(kind, value, numbers), note: note.slice(0, MAX_NOTE), ...itemKind ? { itemKind } : {} };
}
function payloadOf(kind, value, numbers) {
  if (kind === "comment") return { body: checkBody(value.body, "body", true) };
  if (kind === "reopen") return optionalBody(value.comment);
  if (kind === "close") {
    const duplicateOf = value.duplicate_of === void 0 || value.duplicate_of === null ? void 0 : checkNumber(value.duplicate_of, "duplicate_of");
    const reason = value.reason === void 0 || value.reason === null ? duplicateOf ? "duplicate" : "completed" : checkReason(value.reason);
    if (reason === "duplicate" && !duplicateOf) throw new Error('`duplicate_of` is required when `reason` is "duplicate": the number of the issue to keep.');
    if (reason !== "duplicate" && duplicateOf) throw new Error('`duplicate_of` only goes with `reason` "duplicate".');
    if (duplicateOf && numbers.includes(duplicateOf)) throw new Error(`#${duplicateOf} cannot be closed as a duplicate of itself.`);
    return { reason, ...duplicateOf ? { duplicateOf } : {}, ...optionalBody(value.comment) };
  }
  const add = checkNames(value.add, "add", kind);
  const remove = checkNames(value.remove, "remove", kind);
  if (add.length === 0 && remove.length === 0) throw new Error("Pass `add`, `remove` or both, with at least one name.");
  const both = add.filter((name2) => remove.includes(name2));
  if (both.length > 0) throw new Error(`${both.join(", ")} cannot be both added and removed.`);
  return { add, remove };
}
function optionalBody(body) {
  const text = checkBody(body, "comment", false);
  return text ? { body: text } : {};
}
function checkRepo(repo) {
  if (typeof repo !== "string" || !/^[\w.-]+(?:\/[\w.-]+)+$/.test(repo.trim()) || /(^|\/)\.\.?($|\/)/.test(repo.trim()))
    throw new Error("`repo` must look like group/project (subgroups allowed), such as gitlab-org/gitlab.");
  return repo.trim();
}
function checkNumbers(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) throw new Error("`numbers` must list at least one issue or merge request number.");
  const unique = [...new Set(numbers.map((number) => checkNumber(number, "numbers")))];
  if (unique.length > MAX_BATCH) throw new Error(`At most ${MAX_BATCH} numbers per call; split the rest into another call.`);
  return unique;
}
function checkNumber(number, field) {
  const parsed = typeof number === "string" && /^[#!]?\d+$/.test(number.trim()) ? Number(number.trim().replace(/^[#!]/, "")) : number;
  if (typeof parsed !== "number" || !Number.isSafeInteger(parsed) || parsed <= 0) throw new Error(`\`${field}\` takes positive whole numbers, not ${JSON.stringify(number)}.`);
  return parsed;
}
function checkReason(reason) {
  const text = typeof reason === "string" ? reason.trim().toLowerCase().replace(/[\s-]+/g, "_") : "";
  if (text === "completed" || text === "not_planned" || text === "duplicate") return text;
  throw new Error('`reason` must be "completed", "not_planned" or "duplicate".');
}
function checkBody(body, field, required) {
  if (body === void 0 || body === null) {
    if (required) throw new Error(`\`${field}\` is required.`);
    return "";
  }
  if (typeof body !== "string") throw new Error(`\`${field}\` must be text.`);
  if (required && !body.trim()) throw new Error(`\`${field}\` must not be empty.`);
  if (body.length > MAX_BODY) throw new Error(`\`${field}\` is ${body.length} characters; GitLab allows ${MAX_BODY}.`);
  return body.trim() ? body : "";
}
function checkNames(names, field, kind) {
  if (names === void 0 || names === null) return [];
  if (!Array.isArray(names)) throw new Error(`\`${field}\` must be a list of ${kind === "label" ? "label names" : "GitLab usernames"}.`);
  const checked = names.map((name2) => {
    if (typeof name2 !== "string" || !name2.trim()) throw new Error(`\`${field}\` has an empty name.`);
    if (kind === "label") return name2.trim();
    const login = name2.trim() === "@me" ? "@me" : name2.trim().replace(/^@/, "");
    if (login !== "@me" && !/^[A-Za-z0-9_](?:[A-Za-z0-9_.-]*[A-Za-z0-9_-])?$/.test(login)) throw new Error(`"${name2}" is not a GitLab username.`);
    return login;
  });
  return [...new Set(checked)];
}
function expand(proposal, input) {
  return proposal.numbers.map((number) => ({
    id: input.id(),
    sessionID: input.sessionID,
    batch: input.batch,
    repo: input.repo,
    number,
    item: input.items.get(number)?.item ?? null,
    title: input.items.get(number)?.title ?? "",
    kind: proposal.kind,
    payload: proposal.payload,
    note: input.source === "user" ? "" : proposal.note,
    status: input.status,
    error: null,
    result: null,
    source: input.source ?? "tool",
    undoOf: null,
    undoneBy: null,
    ...input.round === void 0 ? {} : { round: input.round },
    createdAt: input.now,
    updatedAt: input.now
  }));
}
function blocker(kind, info, same) {
  if (!info) return "does not exist or cannot be read";
  if (kind === "close" && info.state !== "OPEN") return `already ${info.state.toLowerCase()}`;
  if (kind === "reopen" && info.state === "MERGED") return "merged; it cannot be reopened";
  if (kind === "reopen" && info.state === "OPEN") return "already open";
  if (same) return `already ${same.status === "proposed" ? "proposed and waiting for the user" : "approved and running"}`;
  return void 0;
}
function edits(action) {
  if (!action.edited) return void 0;
  const original = action.original;
  if (!original) return "edited by the user";
  const before = describe({ ...action, payload: original });
  const after = describe(action);
  const body = (original.body ?? "") !== (action.payload.body ?? "");
  const same = describe({ ...action, payload: { ...original, body: void 0 } }) === describe({ ...action, payload: { ...action.payload, body: void 0 } });
  const changed = same ? body ? "the user rewrote the comment" : "the user saved it unchanged" : `the user changed it to ${after}`;
  const comments = body ? ` Your comment: "${oneLine(original.body ?? "", 300)}"; the user's: "${oneLine(action.payload.body ?? "", 300)}".` : "";
  return `edited by the user: you proposed ${before}; ${changed}.${comments}`;
}
function triageProgress(triage, actions) {
  const mine = actions.filter((action) => action.round !== void 0 && action.source === "tool");
  const reviewed = (/* @__PURE__ */ new Set([...triage.reviewed, ...mine.map((action) => action.number)])).size;
  const of = (...statuses) => mine.filter((action) => statuses.includes(action.status)).length;
  return {
    reviewed,
    total: Math.max(triage.total, reviewed),
    approved: of("approved", "running", "done", "failed", "undone"),
    skipped: of("skipped"),
    waiting: of("proposed")
  };
}
function describe(action) {
  const payload = action.payload;
  const comment = payload.body ? ", with a comment" : "";
  if (action.kind === "comment") return `comment "${oneLine(payload.body ?? "", 60)}"`;
  if (action.kind === "close") {
    if (action.item === "mr") return `close merge request${comment}`;
    if (payload.reason === "duplicate") return `close as duplicate of #${payload.duplicateOf}${comment}`;
    return `close as ${payload.reason === "not_planned" ? "not planned" : "completed"}${comment}`;
  }
  if (action.kind === "reopen") return `reopen${comment}`;
  if (action.kind === "uncomment") return "delete a comment";
  if (action.kind === "approve") return "approve";
  if (action.kind === "unapprove") return "remove approval";
  if (action.kind === "other") return `ran \`${oneLine(payload.command ?? "", 80)}\``;
  const noun = action.kind === "label" ? "label" : "assignee";
  const mark2 = action.kind === "label" ? "" : "@";
  const list = (names) => (names ?? []).map((name2) => name2 === "@me" ? name2 : `${mark2}${name2}`).join(", ");
  const parts = [
    payload.add?.length ? `add ${noun}${payload.add.length > 1 ? "s" : ""} ${list(payload.add)}` : "",
    payload.remove?.length ? `remove ${noun}${payload.remove.length > 1 ? "s" : ""} ${list(payload.remove)}` : ""
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : `ran \`${oneLine(payload.command ?? "", 80)}\``;
}
function undoFor(action) {
  if (action.status !== "done" || action.undoOf || action.undoneBy || action.result?.noop) return void 0;
  const result = action.result ?? {};
  const comment = result.commentId ? { commentId: result.commentId } : {};
  if (action.kind === "close") return { kind: "reopen", payload: comment };
  if (action.source === "shell") return void 0;
  if (action.kind === "reopen") return { kind: "close", payload: { reason: result.reason === "not_planned" ? "not_planned" : "completed", ...comment } };
  if (action.kind === "comment") return result.commentId ? { kind: "uncomment", payload: { commentId: result.commentId } } : void 0;
  if (action.kind !== "label" && action.kind !== "assign") return void 0;
  const add = result.removed ?? [];
  const remove = result.added ?? [];
  if (add.length === 0 && remove.length === 0) return void 0;
  return { kind: action.kind, payload: { add, remove } };
}
function backoff(message3, attempt) {
  const after = /retry[- ]after:?\s*(\d+)/i.exec(message3);
  const limited = !!after || /rate limit|too many requests|HTTP 429/i.test(message3);
  if (!limited || attempt >= RETRIES) return void 0;
  if (after) return Math.min(Number(after[1]), 600) * 1e3;
  return 6e4 * 2 ** attempt;
}
function settle(actions, now) {
  return actions.map(
    (action) => action.status === "running" && now - action.updatedAt > STALE ? { ...action, status: "failed", error: "Interrupted before it finished; check the item, then retry or skip it.", updatedAt: now } : action
  );
}
var VERBS = /* @__PURE__ */ new Set(["close", "reopen", "note", "comment", "update", "merge", "approve", "unapprove", "delete"]);
var VALUE_FLAGS = {
  close: ["-r", "--reason"],
  reopen: [],
  note: ["-m", "--message", "-F", "--file"],
  comment: ["-m", "--message", "-F", "--file"],
  update: [
    "-t",
    "--title",
    "-d",
    "--description",
    "-m",
    "--milestone",
    "-a",
    "--assignee",
    "--add-label",
    "--remove-label",
    "--reviewer",
    "--target-branch",
    "--source-branch"
  ],
  merge: ["-m", "--message", "-b", "--branch", "--sha"],
  approve: [],
  unapprove: [],
  delete: []
};
function parseShell(command) {
  const where = { cd: null };
  return segments(command).flatMap((tokens) => {
    if (tokens[0] === "cd" || tokens[0] === "pushd") {
      const target2 = tokens[1] ?? "~";
      where.cd = where.cd === "?" || /[$`*?]/.test(target2) || target2 === "-" ? "?" : where.cd && !/^[~/]/.test(target2) ? `${where.cd}/${target2}` : target2;
      return [];
    }
    const env = tokens.findIndex((token) => !/^[A-Za-z_][A-Za-z0-9_]*=/.test(token));
    if (env === -1) return [];
    const glab = tokens[env] ?? "";
    if (glab !== "glab" && !glab.endsWith("/glab")) return [];
    const envRepo = tokens.slice(0, env).map((token) => /^GITLAB_REPO=(.+)$/.exec(token)?.[1]).filter(Boolean).at(-1);
    const args = tokens.slice(env + 1);
    const flags = /* @__PURE__ */ new Map();
    const positional = [];
    const verbAt = { group: "", verb: "" };
    for (let index = 0; index < args.length; index++) {
      const entry = args[index] ?? "";
      const [flag, inline] = entry.startsWith("--") && entry.includes("=") ? [entry.slice(0, entry.indexOf("=")), entry.slice(entry.indexOf("=") + 1)] : [entry, void 0];
      const takes = flag === "-R" || flag === "--repo" || (VALUE_FLAGS[verbAt.verb] ?? []).includes(flag);
      if (flag.startsWith("-") && flag !== "-") {
        const value = inline ?? (takes ? args[++index] : "");
        flags.set(flag, [...flags.get(flag) ?? [], value ?? ""]);
        continue;
      }
      if (!verbAt.group) {
        if (entry !== "issue" && entry !== "mr") return [];
        verbAt.group = entry;
        continue;
      }
      if (!verbAt.verb) {
        if (!VERBS.has(entry)) return [];
        verbAt.verb = entry;
        continue;
      }
      positional.push(entry);
    }
    if (!verbAt.verb) return [];
    const target = targetOf(positional[0] ?? "");
    if (!target) return [];
    const flagRepo = flags.get("-R")?.at(-1) ?? flags.get("--repo")?.at(-1);
    const repo = target.repo ?? repoName(flagRepo) ?? repoName(envRepo);
    const group = verbAt.group === "mr" ? "mr" : "issue";
    const line = tokens.map((token) => /^[\w@%+=:,./#!-]+$/.test(token) ? token : JSON.stringify(token)).join(" ");
    return [{ group, verb: verbAt.verb, number: target.number, repo, cd: where.cd, ...shellKind(verbAt.verb, flags, line) }];
  });
}
function shellKind(verb, flags, command) {
  const values = (...names) => names.flatMap((name2) => flags.get(name2) ?? []).flatMap((value) => value.split(",")).map((value) => value.trim()).filter(Boolean);
  const line = { command: oneLine(command, 500) };
  if (verb === "close") {
    const reason = values("-r", "--reason")[0]?.toLowerCase().replace(/[\s-]+/g, "_");
    return { kind: "close", payload: { ...line, reason: reason === "not_planned" ? "not_planned" : "completed" } };
  }
  if (verb === "reopen") return { kind: "reopen", payload: line };
  if (verb === "note" || verb === "comment") return { kind: "comment", payload: line };
  if (verb === "approve") return { kind: "approve", payload: line };
  if (verb === "unapprove") return { kind: "unapprove", payload: line };
  if (verb !== "update") return { kind: "other", payload: line };
  const labels = { add: values("--add-label", "-l", "--label"), remove: values("--remove-label") };
  const unassigned = (flags.get("--unassign") ?? []).length > 0;
  const people = { add: values("-a", "--assignee"), remove: values("--unassign") };
  const reviewers = { add: values("--reviewer") };
  const other = [...flags.keys()].some((flag) => !["-R", "--repo", "--add-label", "--remove-label", "-l", "--label", "-a", "--assignee", "--unassign", "--reviewer"].includes(flag));
  if (!other && labels.add.length + labels.remove.length > 0 && people.add.length + people.remove.length === 0 && !unassigned) return { kind: "label", payload: { ...line, ...labels } };
  if (!other && (people.add.length + people.remove.length > 0 || unassigned) && labels.add.length + labels.remove.length === 0) return { kind: "assign", payload: { ...line, ...people } };
  if (!other && reviewers.add.length > 0) return { kind: "assign", payload: { ...line, add: reviewers.add } };
  return { kind: "other", payload: line };
}
function targetOf(value) {
  const url = /^https?:\/\/[^/]+\/(.+?)\/-\/(?:issues|merge_requests)\/(\d+)(?:[/?#].*)?$/.exec(value);
  if (url?.[1] && url[2]) return { repo: url[1], number: Number(url[2]) };
  const number = /^[#!]?(\d+)$/.exec(value)?.[1];
  if (!number || !Number.isSafeInteger(Number(number)) || Number(number) <= 0) return void 0;
  return { repo: null, number: Number(number) };
}
function repoName(value) {
  const parts = value?.replace(/^https?:\/\//, "").replace(/\.git$/, "").split("/").filter(Boolean) ?? [];
  const name2 = parts.slice(-2).join("/");
  return parts.length >= 2 && /^[\w.-]+\/[\w.-]+$/.test(name2) ? name2 : null;
}
function segments(command) {
  const all = [[]];
  const state = { word: "", started: false, quote: "" };
  const push = () => {
    if (state.started) all.at(-1)?.push(state.word);
    state.word = "";
    state.started = false;
  };
  const split = () => {
    push();
    all.push([]);
  };
  for (let index = 0; index < command.length; index++) {
    const char = command[index] ?? "";
    if (state.quote === "'") {
      if (char === "'") state.quote = "";
      else state.word += char;
      continue;
    }
    if (state.quote === '"') {
      if (char === '"') state.quote = "";
      else if (char === "\\" && /["\\$`]/.test(command[index + 1] ?? "")) state.word += command[++index];
      else state.word += char;
      continue;
    }
    if (char === "'" || char === '"') {
      state.quote = char;
      state.started = true;
      continue;
    }
    if (char === "\\") {
      if (command[index + 1] === "\n") index++;
      else {
        state.word += command[++index] ?? "";
        state.started = true;
      }
      continue;
    }
    if (char === ";" || char === "|" || char === "&" || char === "\n" || char === "(" || char === ")") {
      split();
      continue;
    }
    if (/\s/.test(char)) {
      push();
      continue;
    }
    state.word += char;
    state.started = true;
  }
  push();
  return all.filter((tokens) => tokens.length > 0);
}
function oneLine(text, limit) {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > limit ? `${flat.slice(0, limit)}\u2026` : flat;
}

// src/host/draft.ts
var MAX_COMMENTS = 100;
var MAX_BODY2 = 65536;
var FILE_LINES = 400;
var PATH_LINES = 3e3;
var DIFF_BUDGET = 8e4;
function hunkRanges(patch) {
  if (!patch) return { LEFT: [], RIGHT: [] };
  const hunks = parsePatch(patch.replace(/\r\n/g, "\n")).reduce((all, line) => {
    if (line.kind === "hunk") return [...all, { left: [], right: [] }];
    const hunk = all[all.length - 1];
    if (!hunk) return all;
    if (line.old !== null) hunk.left.push(line.old);
    if (line.new !== null) hunk.right.push(line.new);
    return all;
  }, []);
  const span = (lines) => lines.length > 0 ? [[Math.min(...lines), Math.max(...lines)]] : [];
  return { LEFT: hunks.flatMap((hunk) => span(hunk.left)), RIGHT: hunks.flatMap((hunk) => span(hunk.right)) };
}
function formatRanges(ranges) {
  const side = (name2) => ranges[name2].length > 0 ? `${name2} ${ranges[name2].map(([from, to]) => from === to ? `${from}` : `${from}\u2013${to}`).join(", ")}` : "";
  return [side("RIGHT"), side("LEFT")].filter(Boolean).join("; ") || "none";
}
function placementError(files, comment) {
  const file = files.find((item) => item.path === comment.path);
  if (!file) {
    const renamed = files.find((item) => item.previous === comment.path);
    if (renamed) return `\`${comment.path}\` was renamed to \`${renamed.path}\`; use the new path.`;
    const names = files.map((item) => item.path);
    return `\`${comment.path}\` is not changed in this merge request. Changed files: ${names.slice(0, 40).join(", ")}${names.length > 40 ? ", \u2026" : ""}.`;
  }
  if (!file.patch) return `\`${comment.path}\` has no diff GitLab can comment on (binary or too large); mention it in the summary instead.`;
  const ranges = hunkRanges(file.patch);
  const valid = `Lines you can comment on in \`${comment.path}\`: ${formatRanges(ranges)}.`;
  const hunk = ranges[comment.side].find(([from, to]) => comment.line >= from && comment.line <= to);
  const sideHint = comment.side === "RIGHT" ? "RIGHT counts the new file's lines: added and unchanged ones" : "LEFT counts the old file's lines: removed and unchanged ones";
  if (!hunk) return `Line ${comment.line} on the ${comment.side} side of \`${comment.path}\` is outside the diff; ${sideHint}. ${valid}`;
  if (comment.startLine === null) return void 0;
  if (comment.startLine > comment.line) return `\`start_line\` ${comment.startLine} comes after \`line\` ${comment.line} in \`${comment.path}\`; \`start_line\` is the first line of the range.`;
  if (comment.startLine < hunk[0]) return `Lines ${comment.startLine}\u2013${comment.line} of \`${comment.path}\` span more than one hunk; a comment's lines must be in one hunk (${comment.side} ${hunk[0]}\u2013${hunk[1]}). ${valid}`;
  return void 0;
}
function splitDrift(comments, files) {
  const moved = comments.filter((comment) => placementError(files, comment) !== void 0);
  return { valid: comments.filter((comment) => !moved.includes(comment)), moved };
}
function withMoved(summary, moved) {
  if (moved.length === 0) return summary;
  const entries = moved.map((comment) => {
    const lines = comment.startLine !== null && comment.startLine !== comment.line ? `${comment.startLine}-${comment.line}` : `${comment.line}`;
    return `**\`${comment.path}:${lines}\`**${comment.side === "LEFT" ? " (removed lines)" : ""}

${comment.body.trim()}`;
  });
  return [summary.trim(), "---", "_Comments on lines that are no longer in the diff:_", ...entries].filter(Boolean).join("\n\n");
}
function editDraft(draft, edit, now) {
  const update = edit.update;
  if (update && !draft.comments.some((comment) => comment.id === update.id)) throw new Error("That comment is no longer in the draft.");
  if (edit.remove && !draft.comments.some((comment) => comment.id === edit.remove)) throw new Error("That comment is no longer in the draft.");
  if (update && !update.body.trim()) throw new Error("A comment cannot be empty; delete it instead.");
  if (edit.add && !edit.add.body.trim()) throw new Error("A comment cannot be empty.");
  checkLength(edit.summary ?? "", "The summary");
  checkLength(update?.body ?? edit.add?.body ?? "", "A comment");
  const comments = draft.comments.filter((comment) => comment.id !== edit.remove).map((comment) => update && comment.id === update.id && comment.body !== update.body ? { ...comment, body: update.body, edited: comment.edited || comment.source === "agent" } : comment);
  if (edit.add && comments.length >= MAX_COMMENTS) throw new Error(`A review holds at most ${MAX_COMMENTS} comments.`);
  return {
    ...draft,
    summary: edit.summary ?? draft.summary,
    event: edit.event ?? draft.event,
    comments: edit.add ? [...comments, edit.add] : comments,
    updatedAt: now
  };
}
function checkLength(text, what) {
  if (text.length > MAX_BODY2) throw new Error(`${what} is ${text.length} characters; GitLab allows ${MAX_BODY2}.`);
}
function parseReview(input) {
  if (typeof input !== "object" || input === null) throw new Error("Pass the arguments as an object.");
  const value = input;
  const number = positive(value.number, "number");
  const repo = value.repo === void 0 || value.repo === null || value.repo === "" ? null : checkRepo(value.repo);
  const summary = typeof value.summary === "string" ? value.summary : "";
  if (!summary.trim()) throw new Error("`summary` is required: the review's body in Markdown, the overall verdict and the main points.");
  checkLength(summary, "`summary`");
  const event = value.event === void 0 || value.event === null ? "COMMENT" : value.event;
  if (event !== "COMMENT" && event !== "APPROVE" && event !== "REQUEST_CHANGES") throw new Error('`event` must be "COMMENT", "APPROVE" or "REQUEST_CHANGES".');
  const note = typeof value.note === "string" ? value.note.trim().slice(0, 1e3) : "";
  if (!note) throw new Error("`note` is required: one short sentence for the user about this review.");
  const list = value.comments === void 0 || value.comments === null ? [] : value.comments;
  if (!Array.isArray(list)) throw new Error("`comments` must be a list of inline comments.");
  if (list.length > MAX_COMMENTS) throw new Error(`At most ${MAX_COMMENTS} inline comments; keep the most important ones and summarize the rest.`);
  const comments = list.map((raw, index) => {
    const where = `comments[${index}]`;
    if (typeof raw !== "object" || raw === null) throw new Error(`\`${where}\` must be an object with path, line and body.`);
    const item = raw;
    if (typeof item.path !== "string" || !item.path.trim()) throw new Error(`\`${where}.path\` is required: the file's path in the repository.`);
    const side = item.side === void 0 || item.side === null ? "RIGHT" : item.side;
    if (side !== "LEFT" && side !== "RIGHT") throw new Error(`\`${where}.side\` must be "RIGHT" (new lines) or "LEFT" (removed lines).`);
    const line = positive(item.line, `${where}.line`);
    const start = item.start_line === void 0 || item.start_line === null ? null : positive(item.start_line, `${where}.start_line`);
    if (typeof item.body !== "string" || !item.body.trim()) throw new Error(`\`${where}.body\` must not be empty.`);
    checkLength(item.body, `\`${where}.body\``);
    return { path: item.path.trim().replace(/^\.?\//, ""), line, side, startLine: start === line ? null : start, body: item.body };
  });
  return { number, repo, summary, event, note, comments };
}
function positive(value, field) {
  const number = typeof value === "string" ? Number(value.replace(/^[#!]/, "")) : value;
  if (typeof number !== "number" || !Number.isSafeInteger(number) || number <= 0) throw new Error(`\`${field}\` must be a positive whole number.`);
  return number;
}
function diffText(files, path) {
  const picked = path ? files.filter((file) => file.path === path || file.previous === path) : files;
  if (path && picked.length === 0) throw new Error(`\`${path}\` is not changed in this merge request. Changed files: ${files.map((file) => file.path).join(", ")}.`);
  const limit = path ? PATH_LINES : FILE_LINES;
  const budget = { left: DIFF_BUDGET };
  const sections = picked.map((file) => {
    const head = `## ${file.previous && file.previous !== file.path ? `${file.previous} \u2192 ` : ""}${file.path} (${file.status}, +${file.additions} \u2212${file.deletions})`;
    if (!file.patch) return `${head}
No diff (binary or too large); comments cannot go on it.`;
    if (budget.left <= 0) return `${head}
Diff not shown to save space; call again with \`path: "${file.path}"\`.`;
    const lines = parsePatch(file.patch.replace(/\r\n/g, "\n").replace(/\n$/, ""));
    const width = String(Math.max(0, ...lines.map((line) => Math.max(line.old ?? 0, line.new ?? 0)))).length;
    const pad = (value) => (value === null ? "" : String(value)).padStart(width);
    const body = lines.slice(0, limit).map((line) => line.kind === "hunk" ? line.text : `${pad(line.old)} ${pad(line.new)} \u2502${line.kind === "add" ? "+" : line.kind === "del" ? "-" : " "} ${line.text}`).join("\n");
    const cut = lines.length > limit ? `
\u2026 ${lines.length - limit} more lines${path ? "" : `; call again with \`path: "${file.path}"\` for the rest`}.` : "";
    const text = `${head}
Commentable: ${formatRanges(hunkRanges(file.patch))}
${body}${cut}`;
    budget.left -= text.length;
    return text;
  });
  return [
    `${files.length} changed file${files.length === 1 ? "" : "s"}${path ? `, showing ${path}` : ""}. Each diff line shows the old (LEFT) line number, the new (RIGHT) line number, then +, - or a space and the text.`,
    "Review comments go on RIGHT with the new number for added and unchanged lines, or on LEFT with the old number for removed lines, and only on lines inside a hunk.",
    "",
    sections.join("\n\n")
  ].join("\n");
}

// src/host/agent.ts
var PACE = 1e3;
var WAIT = 10 * 6e4;
var POLL = 5e3;
var FINAL = ["done", "failed", "skipped", "undone"];
function createAgent(deps) {
  const { ctx, store, git, gitlab } = deps;
  const locks = /* @__PURE__ */ new Map();
  const watchers = /* @__PURE__ */ new Map();
  const waiters = /* @__PURE__ */ new Map();
  const waits = /* @__PURE__ */ new Set();
  const repos = /* @__PURE__ */ new Map();
  const waiting = /* @__PURE__ */ new Set();
  const worker = { running: false, stopped: false, last: 0, wake: void 0 };
  const serialize = (key, work) => {
    const next = (locks.get(key) ?? Promise.resolve()).then(work, work);
    const settled2 = next.catch(() => void 0);
    locks.set(key, settled2);
    void settled2.then(() => {
      if (locks.get(key) === settled2) locks.delete(key);
    });
    return next;
  };
  const load = async (sessionID) => {
    const queue = (await store.read()).queues[sessionID];
    return { auto: queue?.auto ?? false, actions: settle(queue?.actions ?? [], Date.now()), ...queue?.triage ? { triage: queue.triage } : {} };
  };
  const update = (sessionID, change2) => serialize(sessionID, async () => {
    const next = await store.mutate((state) => {
      const current = state.queues[sessionID] ?? { auto: false, actions: [] };
      const changed = change2({ auto: current.auto, actions: settle(current.actions, Date.now()), ...current.triage ? { triage: current.triage } : {} });
      state.queues[sessionID] = changed;
      return changed;
    });
    deps.emit({ type: "agent", sessionID });
    next.actions.forEach((action) => {
      if (!FINAL.includes(action.status)) return;
      waiters.get(action.id)?.(action);
      waiters.delete(action.id);
    });
    watchers.get(sessionID)?.forEach((watch) => watch(next));
    return next;
  });
  const patch = (action, change2) => update(action.sessionID, (queue) => ({
    ...queue,
    actions: queue.actions.map((item) => item.id === action.id ? { ...item, ...change2, updatedAt: Date.now() } : item)
  }));
  const indexRepo = async (repo, sessionID) => {
    await store.mutate((state) => {
      const key = `recent:${repo.toLowerCase()}`;
      const known = state.reasons[key];
      const list = Array.isArray(known) ? known.filter((item) => typeof item === "string") : [];
      state.reasons[key] = [sessionID, ...list.filter((item) => item !== sessionID)].slice(0, 50);
    });
  };
  const recentSessions = async (repo) => {
    const known = (await store.read()).reasons[`recent:${repo.toLowerCase()}`];
    return Array.isArray(known) ? known.filter((item) => typeof item === "string") : [];
  };
  const add = async (sessionID, actions) => {
    if (actions.length === 0) return;
    await update(sessionID, (queue) => ({ ...queue, actions: [...queue.actions, ...actions] }));
    await Promise.all([...new Set(actions.map((action) => action.repo))].map((repo) => indexRepo(repo, sessionID)));
  };
  const repoOfSession = async (sessionID, cwd, ...relative) => {
    const directory = resolve(cwd, ...relative);
    const known = repos.get(directory);
    if (known) return known;
    const found = git.remote(directory).then((remote) => {
      if (!remote) return null;
      gitlab.rememberRemote(remote);
      return remote.path;
    }).catch(() => null);
    repos.set(directory, found);
    void found.then((repo) => {
      if (!repo) repos.delete(directory);
    });
    return found;
  };
  const requireRepo = async (repo, sessionID, cwd) => {
    const found = repo ? checkRepo(repo) : await repoOfSession(sessionID, cwd);
    if (!found) throw new Error("This session's directory has no GitLab remote; pass `repo` as group/project.");
    return found;
  };
  const kick = (sessionID) => {
    waiting.add(sessionID);
    if (!worker.running) void drain();
  };
  const drain = async () => {
    worker.running = true;
    while (waiting.size > 0 && !worker.stopped) {
      const sessionID = waiting.values().next().value ?? "";
      const next = await load(sessionID).then((queue) => queue.actions.find((action) => action.status === "approved"), () => void 0);
      if (!next) {
        waiting.delete(sessionID);
        continue;
      }
      await execute(next).catch((error) => {
        deps.log("warn", "agent action failed", { error: message(error) });
        waiting.delete(sessionID);
      });
    }
    worker.running = false;
  };
  const sleep = (ms) => new Promise((done) => {
    const timer = setTimeout(done, ms);
    worker.wake = () => {
      clearTimeout(timer);
      done();
    };
  });
  const paced = async (work) => {
    const wait = worker.last + PACE - Date.now();
    if (wait > 0) await sleep(wait);
    worker.last = Date.now();
    return work();
  };
  const execute = async (action) => {
    const taken = { value: false };
    const claimed = await update(action.sessionID, (queue) => ({
      ...queue,
      actions: queue.actions.map((item) => {
        if (item.id !== action.id || item.status !== "approved") return item;
        taken.value = true;
        return { ...item, status: "running", error: null, updatedAt: Date.now() };
      })
    }));
    const current = claimed.actions.find((item) => item.id === action.id);
    if (!taken.value || !current) return;
    const outcome = await attempt(current, 0);
    const finished = await patch(current, "error" in outcome ? { status: "failed", error: outcome.error } : { status: "done", error: null, result: outcome.result });
    const original = current.undoOf ? finished.actions.find((item) => item.id === current.undoOf) : void 0;
    if (original) await patch(original, "error" in outcome ? { undoneBy: null } : { status: "undone" });
    deps.emit({ type: "item", repo: action.repo, number: action.number, ...current.kind === "close" ? { state: "CLOSED" } : current.kind === "reopen" ? { state: "OPEN" } : {} });
  };
  const attempt = async (action, tries, progress = {}) => {
    try {
      return { result: await perform(action, progress) };
    } catch (error) {
      const text = message(error);
      const wait = backoff(text, tries);
      if (wait === void 0 || worker.stopped) return { error: tries > 0 ? `${text} (after ${tries} retries)` : text };
      await patch(action, { error: `GitLab rate limit; retrying in ${Math.round(wait / 1e3)} s.` });
      await sleep(wait);
      return attempt(action, tries + 1, progress);
    }
  };
  const perform = async (action, progress) => {
    const repo = action.repo;
    const number = action.number;
    const payload = action.payload;
    const info = (await gitlab.itemsInfo(repo, [number], action.item ?? void 0)).get(number);
    if (!info) throw new Error(`${repo}${action.item === "issue" ? "#" : "!"}${number} does not exist or cannot be read.`);
    const comment = async () => {
      if (payload.body && !progress.comment) progress.comment = await paced(() => gitlab.addComment(repo, number, payload.body ?? "", info.item));
      return progress.comment ? { commentId: progress.comment.id, url: progress.comment.url } : {};
    };
    const cleanup = async () => {
      if (payload.commentId && !progress.cleaned) await paced(() => gitlab.deleteComment(repo, number, payload.commentId ?? 0, info.item));
      progress.cleaned = true;
    };
    if (action.kind === "comment") return comment();
    if (action.kind === "uncomment") {
      await cleanup();
      return {};
    }
    if (action.kind === "close") {
      if (info.state !== "OPEN" && !progress.changed) return { noop: true };
      const posted = await comment();
      if (info.state === "OPEN") progress.result = await paced(() => gitlab.closeItem(repo, number, info.item, payload.reason ?? "completed", payload.duplicateOf));
      progress.changed = true;
      await cleanup();
      return { ...progress.result, ...posted };
    }
    if (action.kind === "reopen") {
      if (info.state === "MERGED") throw new Error(`!${number} is merged; a merged merge request cannot be reopened.`);
      if (info.state === "OPEN" && !progress.changed) return { noop: true };
      progress.result ??= info.reason ? { reason: info.reason } : {};
      if (info.state !== "OPEN") await paced(() => gitlab.reopenItem(repo, number, info.item));
      progress.changed = true;
      await cleanup();
      return { ...progress.result, ...await comment() };
    }
    if (action.kind === "approve" || action.kind === "unapprove") {
      if (info.item !== "mr") throw new Error("Only merge requests can be approved.");
      return {};
    }
    if (action.kind === "label" || action.kind === "assign") {
      const me = [...payload.add ?? [], ...payload.remove ?? []].includes("@me") ? await gitlab.viewerName(repo) : "";
      const names = (list) => (list ?? []).map((name2) => name2 === "@me" ? me : name2);
      const present = action.kind === "label" ? info.labels : info.assignees;
      const has = (name2) => present.find((item) => item.toLowerCase() === name2.toLowerCase());
      const added = names(payload.add).filter((name2) => !has(name2));
      const removed = names(payload.remove).flatMap((name2) => has(name2) ?? []);
      progress.result ??= { added, removed };
      if (added.length > 0 || removed.length > 0) await paced(() => gitlab.editPeople(repo, number, action.kind === "label" ? "labels" : "assignees", added, removed, info.item));
      const result = progress.result;
      return (result.added?.length ?? 0) + (result.removed?.length ?? 0) > 0 ? result : { noop: true };
    }
    throw new Error("Commands the agent ran in the shell are recorded, not run again.");
  };
  const quiet = (sessionID, signal) => new Promise((done) => {
    const set = watchers.get(sessionID) ?? /* @__PURE__ */ new Set();
    watchers.set(sessionID, set);
    const timer = setTimeout(() => finish(false), WAIT);
    const poll = setInterval(() => void load(sessionID).then(watch, () => void 0), POLL);
    const abort = () => finish(false);
    const watch = (queue) => {
      if (queue.actions.every((action) => action.status !== "proposed" && action.status !== "approved" && action.status !== "running")) finish(true);
    };
    const finish = (value) => {
      clearTimeout(timer);
      clearInterval(poll);
      signal.removeEventListener("abort", abort);
      waits.delete(abort);
      set.delete(watch);
      if (set.size === 0 && watchers.get(sessionID) === set) watchers.delete(sessionID);
      done(value);
    };
    set.add(watch);
    waits.add(abort);
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted || worker.stopped) return finish(false);
    void load(sessionID).then(watch, () => finish(false));
  });
  const settled = (ids, sessionID, signal) => new Promise((done) => {
    const results = /* @__PURE__ */ new Map();
    const finish = () => done(ids.flatMap((id) => results.get(id) ?? []));
    ids.forEach(
      (id) => waiters.set(id, (action) => {
        results.set(id, action);
        if (results.size === ids.length) finish();
      })
    );
    signal.addEventListener(
      "abort",
      () => void update(sessionID, (queue) => ({
        ...queue,
        actions: queue.actions.map(
          (action) => ids.includes(action.id) && action.status === "approved" ? { ...action, status: "skipped", error: "Cancelled with the tool call.", updatedAt: Date.now() } : action
        )
      })).finally(finish),
      { once: true }
    );
  });
  const knownLabels = async (repo, proposal) => {
    const labels = (await gitlab.repoMeta({ repo })).labels.map((label) => label.name);
    if (labels.length === 0) return proposal.payload;
    const spelled = (name2) => labels.find((label) => label.toLowerCase() === name2.toLowerCase());
    const unknown = (proposal.payload.add ?? []).filter((name2) => !spelled(name2));
    if (unknown.length > 0) throw new Error(`${repo} has no label ${unknown.map((name2) => `"${name2}"`).join(", ")}. Its labels: ${labels.slice(0, 100).join(", ")}${labels.length > 100 ? ", \u2026" : ""}`);
    return {
      add: (proposal.payload.add ?? []).map((name2) => spelled(name2) ?? name2),
      remove: (proposal.payload.remove ?? []).map((name2) => spelled(name2) ?? name2)
    };
  };
  const blockers = (kind, repo, numbers, payload, info, queue) => {
    const pending = queue.actions.filter((action) => action.status === "proposed" || action.status === "approved" || action.status === "running");
    return numbers.flatMap((number) => {
      const target = info.get(number);
      const same = pending.find((action) => action.repo === repo && action.number === number && action.item === target?.item && action.kind === kind && JSON.stringify(action.payload) === JSON.stringify(payload));
      const reason = blocker(kind, target, same);
      return reason ? [[number, reason]] : [];
    });
  };
  const propose = async (kind, raw, context) => {
    const proposal = parseWrite(kind, raw);
    const repo = await requireRepo(proposal.repo, context.sessionID, context.cwd);
    const payload = kind === "label" ? await knownLabels(repo, proposal) : proposal.payload;
    const [info, queue] = await Promise.all([gitlab.itemsInfo(repo, proposal.numbers, proposal.itemKind), load(context.sessionID)]);
    const reasons = blockers(kind, repo, proposal.numbers, payload, info, queue);
    const skipped = new Map(reasons);
    const numbers = proposal.numbers.filter((number) => !skipped.has(number));
    const batch = `b_${randomUUID().replaceAll("-", "").slice(0, 8)}`;
    const actions = expand(
      { ...proposal, numbers, payload },
      {
        sessionID: context.sessionID,
        repo,
        batch,
        now: Date.now(),
        status: queue.auto ? "approved" : "proposed",
        items: info,
        id: () => `a_${randomUUID().replaceAll("-", "").slice(0, 12)}`,
        ...queue.triage ? { round: queue.triage.round } : {}
      }
    );
    await add(context.sessionID, actions);
    const notProposed = reasons.length > 0 ? ["", "Not proposed:", ...reasons.map(([number, reason]) => `- ${info.get(number)?.item === "mr" ? "!" : "#"}${number}: ${reason}`)] : [];
    if (actions.length === 0) return [`Nothing was proposed on ${repo}.`, ...notProposed].join("\n");
    if (!queue.auto) {
      return [
        `Proposed ${plural(actions.length, "action")} on ${repo} (batch ${batch}). ${actions.length === 1 ? "It is" : "They are"} waiting for the user's approval in the GitLab panel:`,
        ...actions.map((action) => `- ${mark(action)}${action.number}${action.title ? ` "${action.title}"` : ""}: ${describe(action)}`),
        ...notProposed,
        "",
        "Don't propose these again, and don't run them another way (such as glab in the shell). The user may approve, edit or skip each one; call the gitlab_panel_actions tool later to see what was decided."
      ].join("\n");
    }
    kick(context.sessionID);
    const done = await settled(actions.map((action) => action.id), context.sessionID, context.signal);
    return [
      `Ran ${plural(actions.length, "action")} on ${repo} (auto-run is on for this session):`,
      ...done.map((action) => `- ${mark(action)}${action.number}${action.title ? ` "${action.title}"` : ""}: ${describe(action)} \u2014 ${statusText(action)}`),
      ...notProposed
    ].join("\n");
  };
  const search = async (raw, sessionID, cwd) => {
    const value = record(raw);
    const query = typeof value.query === "string" ? value.query.replace(/(^|\s)repo:\S+/g, " ").trim() : "";
    const repo = await requireRepo(value.repo ? checkRepo(value.repo) : null, sessionID, cwd);
    const remote = await gitlabRemote(repo);
    const kind = value.kind === "mr" ? "mr" : value.kind === "issue" ? "issue" : /\bis:(?:pr|mr)\b/.test(query) ? "mr" : "issue";
    const page = await gitlab.searchAny(remote, kind, query, typeof value.cursor === "string" && value.cursor ? value.cursor : null, typeof value.limit === "number" ? Math.min(100, Math.max(1, Math.floor(value.limit))) : 30);
    return [
      `${repo}: ${plural(page.total, "result")}${query ? ` for \`${query}\`` : ""}${page.items.length < page.total ? `, showing ${page.items.length}` : ""}.`,
      ...page.items.map(searchLine),
      ...page.cursor ? ["", `More: call again with cursor "${page.cursor}".`] : []
    ].join("\n");
  };
  const view = async (raw, sessionID, cwd) => {
    const value = record(raw);
    const number = Number(typeof value.number === "string" ? value.number.replace(/^[#!]/, "") : value.number);
    if (!Number.isSafeInteger(number) || number <= 0) throw new Error("`number` must be a positive whole number.");
    const repo = await requireRepo(value.repo ? checkRepo(value.repo) : null, sessionID, cwd);
    const keep2 = typeof value.comments === "number" ? Math.min(50, Math.max(0, Math.floor(value.comments))) : 10;
    const item = await gitlab.item({ repo, number, kind: value.kind === "issue" || value.kind === "mr" ? value.kind : void 0 });
    const queue = await load(sessionID);
    const older = item.comments.length - keep2;
    const context = itemContextText(item, keep2);
    const mine = queue.actions.filter((action) => action.repo === repo && action.number === number && action.item === item.kind);
    return [
      context,
      ...older > 0 ? ["", `_${older} older comments not shown; pass a larger \`comments\` to read them._`] : [],
      ...mine.length > 0 ? ["", "## Agent actions on it in this session", ...mine.map((action) => `- ${describe(action)} \u2014 ${statusText(action)}`)] : []
    ].join("\n");
  };
  const status = async (raw, context) => {
    const value = record(raw);
    const sessionID = context.sessionID;
    const reviewed = Array.isArray(value.reviewed) ? value.reviewed.filter((number) => typeof number === "number" && Number.isSafeInteger(number) && number > 0) : [];
    const before = await update(sessionID, (queue2) => {
      const triage2 = queue2.triage;
      if (!triage2) return queue2;
      const used = queue2.actions.some((action) => action.round === triage2.round);
      return { ...queue2, triage: { ...triage2, round: used ? triage2.round + 1 : triage2.round, reviewed: [.../* @__PURE__ */ new Set([...triage2.reviewed, ...reviewed])] } };
    });
    const isQuiet = value.wait === true ? await quiet(sessionID, context.signal) : true;
    const queue = before.triage && value.all !== true ? await markChecked(sessionID) : await load(sessionID);
    const triage = before.triage;
    if (triage && value.all !== true) return triageStatus(queue, triage.checkedAt, isQuiet);
    const wanted = typeof value.status === "string" && value.status !== "all" ? value.status : void 0;
    const list = queue.actions.filter((action) => (!wanted || action.status === wanted) && (!value.repo || action.repo === value.repo));
    const waited = isQuiet ? [] : ["", "Some actions still wait for the user; call again with `wait: true` to keep waiting."];
    if (list.length === 0) return [`No GitLab actions${wanted ? ` ${wanted}` : ""} in this session. Auto-run is ${queue.auto ? "on" : "off"}.`, ...waited].join("\n");
    return [
      `${plural(list.length, "action")} in this session, oldest first. Auto-run is ${queue.auto ? "on: writes run at once" : "off: writes wait for the user's approval"}.`,
      ...list.map((action) => `- ${action.id} ${actionLine(action)}`),
      ...waited
    ].join("\n");
  };
  const markChecked = (sessionID) => update(sessionID, (queue) => queue.triage ? { ...queue, triage: { ...queue.triage, checkedAt: Date.now() } } : queue);
  const recordShell = async (sessionID, command, cwd, workdir) => {
    const found = parseShell(command);
    if (found.length === 0) return;
    const start2 = workdir ? resolve(cwd, workdir) : cwd;
    const resolved = await Promise.all(
      found.map(async (entry) => ({
        ...entry,
        repo: entry.repo ?? (entry.cd === "?" ? null : await repoOfSession(sessionID, start2, (entry.cd ?? ".").replace(/^~(?=\/|$)/, homedir())))
      }))
    );
    const known = resolved.filter((entry) => !!entry.repo);
    if (known.length === 0) return;
    const infos = /* @__PURE__ */ new Map();
    const groups = new Set(known.map((entry) => `${entry.repo}\0${entry.group}`));
    for (const key of groups) {
      const [repo, group] = key.split("\0");
      const map = await gitlab.itemsInfo(repo, known.filter((entry) => entry.repo === repo && entry.group === group).map((entry) => entry.number), group).catch(() => /* @__PURE__ */ new Map());
      infos.set(key, new Map([...map].map(([number, info]) => [number, { item: info.item, title: info.title }])));
    }
    const batch = `b_${randomUUID().replaceAll("-", "").slice(0, 8)}`;
    const now = Date.now();
    await add(
      sessionID,
      known.map((entry) => {
        const info = infos.get(`${entry.repo}\0${entry.group}`)?.get(entry.number);
        return {
          id: `a_${randomUUID().replaceAll("-", "").slice(0, 12)}`,
          sessionID,
          batch,
          repo: entry.repo,
          number: entry.number,
          item: info?.item ?? entry.group,
          title: info?.title ?? "",
          kind: entry.kind,
          payload: entry.payload,
          note: "",
          status: "done",
          error: null,
          result: null,
          source: "shell",
          undoOf: null,
          undoneBy: null,
          createdAt: now,
          updatedAt: now
        };
      })
    );
    known.forEach((entry) => deps.emit({ type: "item", repo: entry.repo, number: entry.number }));
  };
  const draftKey = (sessionID, repo, number) => `${sessionID}\0${repo.toLowerCase()}#${number}`;
  const loadDraft = async (sessionID, repo, number) => (await store.read()).drafts[draftKey(sessionID, repo, number)];
  const saveDraft = async (draft) => {
    await store.mutate((state) => {
      state.drafts[draftKey(draft.sessionID, draft.repo, draft.number)] = draft;
    });
    deps.emit({ type: "review", repo: draft.repo, number: draft.number });
    return draft;
  };
  const dropDraft = async (sessionID, repo, number) => {
    await store.mutate((state) => {
      delete state.drafts[draftKey(sessionID, repo, number)];
    });
    deps.emit({ type: "review", repo, number });
  };
  const pullRequest = async (repo, number) => {
    const item = await gitlab.item({ repo, number, kind: "mr" });
    if (item.kind !== "mr" || !item.pr) throw new Error(`${repo}!${number} is an issue, not a merge request.`);
    const sha = item.pr.sha;
    return { item, sha, files: await gitlab.files({ repo, number, head: sha }) };
  };
  const draftTool = async (raw, sessionID, cwd) => {
    const review = parseReview(raw);
    const repo = await requireRepo(review.repo, sessionID, cwd);
    const number = review.number;
    const mr = await pullRequest(repo, number);
    const mine = await gitlab.viewerName(repo).then((name2) => name2 === mr.item.author, () => false);
    if (mr.item.state !== "OPEN") throw new Error(`${repo}!${number} is ${mr.item.state.toLowerCase()}; only an open merge request can be reviewed.`);
    const problems = review.comments.flatMap((comment, index) => {
      const error = placementError(mr.files, comment);
      return error ? [`- comments[${index}] (${comment.path}:${comment.line}): ${error}`] : [];
    });
    if (problems.length > 0)
      throw new Error(
        [
          `Nothing was drafted: ${problems.length} of ${review.comments.length} comments are not on lines of the diff at the head (${mr.sha.slice(0, 7)}). Fix them and call again with every comment; use the gitlab_panel_diff tool for line numbers.`,
          ...problems
        ].join("\n")
      );
    const event = mine && review.event !== "COMMENT" ? "COMMENT" : review.event;
    const now = Date.now();
    const replaced = await loadDraft(sessionID, repo, number);
    await saveDraft({
      sessionID,
      repo,
      number,
      sha: mr.sha,
      summary: review.summary,
      event,
      note: review.note,
      source: "agent",
      comments: review.comments.map((comment) => ({ id: commentId(), ...comment, source: "agent", edited: false })),
      createdAt: now,
      updatedAt: now
    });
    return [
      `Drafted a review of ${repo}!${number} with ${review.comments.length} inline comment${review.comments.length === 1 ? "" : "s"}. The user reviews and submits it in the GitLab panel.`,
      ...event !== review.event ? [`The suggested verdict is "COMMENT": GitLab does not let the user ${review.event === "APPROVE" ? "approve" : "request changes on"} their own merge request.`] : [],
      ...replaced ? ["It replaces the draft you made earlier in this session."] : [],
      "Don't submit it another way (such as glab in the shell); stop here unless the user asks for more."
    ].join("\n");
  };
  const diffTool = async (raw, sessionID, cwd) => {
    const value = record(raw);
    const number = Number(typeof value.number === "string" ? value.number.replace(/^[#!]/, "") : value.number);
    if (!Number.isSafeInteger(number) || number <= 0) throw new Error("`number` must be a positive whole number.");
    const repo = await requireRepo(value.repo ? checkRepo(value.repo) : null, sessionID, cwd);
    const mr = await pullRequest(repo, number);
    const path = typeof value.path === "string" && value.path.trim() ? value.path.trim().replace(/^\.?\//, "") : null;
    return `# ${repo}!${number} at ${mr.sha.slice(0, 7)}: ${mr.item.title}

${diffText(mr.files, path)}`;
  };
  const tool = (name2, description, parameters, execute2) => {
    ctx.tools.register({
      name: name2,
      description,
      parameters,
      timeoutMs: 11 * 6e4,
      output: {
        schema: { type: "string" },
        render: (_args, value) => [{ type: "text", text: String(value ?? "") }]
      },
      async execute(raw, exec) {
        const context = sessionOf(exec);
        return execute2(raw, { ...context, exec });
      }
    });
  };
  const sessionOf = (exec) => {
    const session = exec?.agent?.session;
    const sessionID = String(session?.id ?? "");
    if (!sessionID) throw new Error("This tool needs an agent session.");
    const working = ctx.workingDirectory;
    const cwd = working?.get ? working.get(session) : session?.header?.cwd;
    if (!cwd) throw new Error("This session has no working directory.");
    return { sessionID, cwd: String(cwd) };
  };
  const REPO = { type: "string", description: "Project as group/project (subgroups allowed). Omit it to use the GitLab project of this session's working directory." };
  const NUMBERS = {
    type: "array",
    items: { type: "integer", minimum: 1 },
    minItems: 1,
    maxItems: MAX_BATCH,
    description: `Issue or merge request numbers (IIDs), up to ${MAX_BATCH}. Each becomes its own action that the user approves or skips.`
  };
  const NOTE = { type: "string", description: 'One short sentence telling the user why, shown next to each action, e.g. "Same crash as #120, which has the fix".' };
  const ITEM_KIND = { type: "string", enum: ["issue", "mr"], description: "GitLab numbers issues (#) and merge requests (!) separately. Pass issue or mr when both exist with this number; otherwise it is inferred." };
  const APPROVAL = "Nothing is written right away: each number becomes a proposed action the user approves, edits or skips in the GitLab panel, and the result lists what was proposed. When the user has turned on auto-run for this session, the actions run at once instead and the result reports each outcome. Don't propose the same thing twice or run it another way (such as glab in the shell); use the gitlab_panel_actions tool to see what the user decided.";
  tool(
    "gitlab_panel_search",
    "Search a GitLab project's issues or merge requests and get a compact list: number, kind, state, title, labels, author, age and comment count, with the total. Read-only, runs at once. Pass kind to choose issues or merge requests (GitLab numbers them separately); without it, is:mr in the query selects merge requests and anything else lists issues. Query accepts words plus GitLab-friendly qualifiers such as is:open, is:closed, is:merged, label:bug, author:@me, assignee:@me, reviewer:@me, milestone:v1, no:assignee, sort:created-desc or sort:updated-desc. Use cursor from a result for the next page, and gitlab_panel_view to read one item in full.",
    {
      type: "object",
      properties: {
        query: { type: "string", description: "Words and qualifiers, without repo:. Empty lists the newest items." },
        repo: REPO,
        kind: ITEM_KIND,
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Results per page, 1 to 100. Defaults to 30." },
        cursor: { type: "string", description: "The cursor a previous result gave, for the next page." }
      },
      required: ["query"],
      additionalProperties: false
    },
    async (raw, context) => search(raw, context.sessionID, context.cwd)
  );
  tool(
    "gitlab_panel_view",
    "Read one GitLab issue or merge request: title, state, author, labels, assignees, milestone, description and the latest comments (long text is cut), and for a merge request its branches, review state and pipeline. Also lists the agent actions already proposed or done on it in this session. Read-only, runs at once.",
    {
      type: "object",
      properties: {
        number: { type: "integer", minimum: 1, description: "The issue or merge request IID." },
        kind: { type: "string", enum: ["issue", "mr"], description: "Whether it is an issue or a merge request. Omit to try the merge request first." },
        repo: REPO,
        comments: { type: "integer", minimum: 0, maximum: 50, description: "How many of the latest comments to include, 0 to 50. Defaults to 10." }
      },
      required: ["number"],
      additionalProperties: false
    },
    async (raw, context) => view(raw, context.sessionID, context.cwd)
  );
  const WRITES = [
    {
      kind: "comment",
      description: `Propose a comment on GitLab issues or merge requests (Markdown, up to 65,536 characters). ${APPROVAL}`,
      parameters: {
        type: "object",
        properties: { numbers: NUMBERS, kind: ITEM_KIND, body: { type: "string", minLength: 1, description: "The comment, in GitLab-flavored Markdown." }, note: NOTE, repo: REPO },
        required: ["numbers", "body", "note"],
        additionalProperties: false
      }
    },
    {
      kind: "close",
      description: `Propose closing GitLab issues or merge requests, with a reason and an optional closing comment. reason: "completed" (fixed or done), "not_planned" (won't fix, stale, invalid, out of scope) or "duplicate" with duplicate_of, the issue to keep. Reasons apply to issues; merge requests simply close. Items already closed are left out. ${APPROVAL}`,
      parameters: {
        type: "object",
        properties: {
          numbers: NUMBERS,
          kind: ITEM_KIND,
          reason: { type: "string", enum: ["completed", "not_planned", "duplicate"], description: 'Why: "completed", "not_planned" or "duplicate". Defaults to "completed".' },
          duplicate_of: { type: "integer", minimum: 1, description: 'With reason "duplicate": the issue these duplicate.' },
          comment: { type: "string", description: "Optional comment posted before closing, in Markdown." },
          note: NOTE,
          repo: REPO
        },
        required: ["numbers", "note"],
        additionalProperties: false
      }
    },
    {
      kind: "reopen",
      description: `Propose reopening closed GitLab issues or merge requests, with an optional comment. Merged merge requests cannot be reopened. ${APPROVAL}`,
      parameters: {
        type: "object",
        properties: { numbers: NUMBERS, kind: ITEM_KIND, comment: { type: "string", description: "Optional comment posted after reopening." }, note: NOTE, repo: REPO },
        required: ["numbers", "note"],
        additionalProperties: false
      }
    },
    {
      kind: "label",
      description: `Propose adding and removing labels on GitLab issues or merge requests. Use the project's existing labels: an unknown name is an error that lists the valid ones. Labels already there (or already absent) are left alone. ${APPROVAL}`,
      parameters: {
        type: "object",
        properties: {
          numbers: NUMBERS,
          kind: ITEM_KIND,
          add: { type: "array", items: { type: "string", minLength: 1 }, description: "Label names to add." },
          remove: { type: "array", items: { type: "string", minLength: 1 }, description: "Label names to remove." },
          note: NOTE,
          repo: REPO
        },
        required: ["numbers", "note"],
        additionalProperties: false
      }
    },
    {
      kind: "assign",
      description: `Propose assigning or unassigning people on GitLab issues or merge requests, by GitLab username (or @me for the signed-in user). ${APPROVAL}`,
      parameters: {
        type: "object",
        properties: {
          numbers: NUMBERS,
          kind: ITEM_KIND,
          add: { type: "array", items: { type: "string", minLength: 1 }, description: "Usernames to assign." },
          remove: { type: "array", items: { type: "string", minLength: 1 }, description: "Usernames to unassign." },
          note: NOTE,
          repo: REPO
        },
        required: ["numbers", "note"],
        additionalProperties: false
      }
    }
  ];
  WRITES.forEach(
    (write) => tool(
      write.kind === "assign" ? "gitlab_panel_assign" : `gitlab_panel_${write.kind}`,
      write.description,
      write.parameters,
      async (raw, context) => propose(write.kind, raw, context)
    )
  );
  tool(
    "gitlab_panel_actions",
    "List this session's GitLab actions with their status: waiting for the user's approval, approved and queued, running, done, failed (with GitLab's error), skipped by the user, or undone; and what the user changed when they edited one. Includes glab writes you ran in the shell and the user's own bulk actions. Call it after proposing to learn what the user decided before following up; don't propose skipped actions again unless the user asks, and follow the user's edits. With `wait: true` it first waits (up to 10 minutes) until the user has decided every proposal and the approved ones have run. In a triage session it reports the run's progress and only the decisions since you last called it (pass `all: true` for the full list), and each call starts a new batch.",
    {
      type: "object",
      properties: {
        status: { type: "string", enum: ["all", "proposed", "approved", "running", "done", "failed", "skipped", "undone"], description: 'Only actions with this status. Defaults to "all".' },
        repo: REPO,
        wait: { type: "boolean", description: "Wait until the user has decided every proposal and the approved ones have run, then report. Defaults to false." },
        reviewed: { type: "array", items: { type: "integer", minimum: 1 }, description: "In a triage session: every number you reviewed since the last call, including the ones you proposed nothing for." },
        all: { type: "boolean", description: "In a triage session: list every action instead of only the decisions since the last call." }
      },
      additionalProperties: false
    },
    async (raw, context) => status(raw, context)
  );
  tool(
    "gitlab_panel_diff",
    "Read a merge request's changed files with their diffs, each line numbered with its old (LEFT) and new (RIGHT) line number, and the line ranges review comments can go on per file. Long diffs are cut; pass `path` to read one file in full. Read-only, runs at once. Use it before gitlab_panel_review to place inline comments.",
    {
      type: "object",
      properties: {
        number: { type: "integer", minimum: 1, description: "The merge request IID." },
        repo: REPO,
        path: { type: "string", description: "Only this file, shown in full." }
      },
      required: ["number"],
      additionalProperties: false
    },
    async (raw, context) => diffTool(raw, context.sessionID, context.cwd)
  );
  tool(
    "gitlab_panel_review",
    `Draft a review of a merge request: a summary, a suggested verdict and inline comments on lines of its diff. Nothing is posted: the draft appears in the user's GitLab panel, where they edit, add to and submit it (or discard it). Every comment must be on a line inside a hunk of the current diff (see gitlab_panel_diff): RIGHT with the new line number for added or unchanged lines, LEFT with the old number for removed lines; \`start_line\` makes it span lines of one hunk. An invalid line rejects the whole call with the valid ranges, so nothing is half drafted. Calling it again for the same merge request replaces this session's draft. Up to ${MAX_COMMENTS} comments.`,
    {
      type: "object",
      properties: {
        number: { type: "integer", minimum: 1, description: "The merge request IID." },
        repo: REPO,
        summary: { type: "string", minLength: 1, description: "The review's body in Markdown: the verdict in a sentence, then the main points." },
        event: { type: "string", enum: ["COMMENT", "REQUEST_CHANGES", "APPROVE"], description: 'The suggested verdict: "REQUEST_CHANGES" for problems that must be fixed, "APPROVE" when it is ready, else "COMMENT". Defaults to "COMMENT". The user decides.' },
        comments: {
          type: "array",
          maxItems: MAX_COMMENTS,
          description: "Inline comments, each on a line of the diff.",
          items: {
            type: "object",
            properties: {
              path: { type: "string", description: "The file's path in the repository, as the diff lists it." },
              line: { type: "integer", minimum: 1, description: "The line the comment is on (the last line, with start_line)." },
              side: { type: "string", enum: ["RIGHT", "LEFT"], description: "RIGHT (default): the new file's line number. LEFT: the old file's, for removed lines." },
              start_line: { type: "integer", minimum: 1, description: "For a comment on several lines: the first one, in the same hunk and on the same side." },
              body: { type: "string", minLength: 1, description: "The comment in Markdown." }
            },
            required: ["path", "line", "body"],
            additionalProperties: false
          }
        },
        note: { type: "string", description: "One short sentence for the user about this review, shown with the draft." }
      },
      required: ["number", "summary", "note"],
      additionalProperties: false
    },
    async (raw, context) => draftTool(raw, context.sessionID, context.cwd)
  );
  const methods = {
    agentActions: async ({ sessionID, repo }) => {
      const queue = await load(sessionID);
      return repo ? { ...queue, actions: queue.actions.filter((action) => action.repo === repo) } : queue;
    },
    agentRecent: async ({ repo, limit }) => {
      const sessions = await recentSessions(repo);
      const queues = await Promise.all(sessions.map(load));
      return queues.flatMap((queue) => queue.actions.filter((action) => action.repo === repo)).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, Math.max(1, Math.min(500, Math.floor(limit) || 50)));
    },
    agentDecide: async ({ sessionID, ids, batch, decision }) => {
      const decidable = (action) => decision === "reset" ? action.source === "tool" && (action.status === "approved" || action.status === "skipped" && !action.error) : action.status === "proposed" || action.status === "approved";
      const picked = (action) => (ids ? ids.includes(action.id) : true) && (!batch || action.batch === batch) && decidable(action);
      const status2 = decision === "approve" ? "approved" : decision === "skip" ? "skipped" : "proposed";
      const count = { value: 0 };
      await update(sessionID, (queue) => {
        count.value = queue.actions.filter(picked).length;
        return { ...queue, actions: queue.actions.map((action) => picked(action) ? { ...action, status: status2, updatedAt: Date.now() } : action) };
      });
      if (decision === "approve") kick(sessionID);
      return `${decision === "approve" ? "Approved" : decision === "skip" ? "Skipped" : "Took back"} ${plural(count.value, "action")}.`;
    },
    agentQueue: async (input) => {
      const proposal = parseWrite(input.kind, {
        repo: input.repo,
        numbers: input.numbers,
        kind: input.itemKind,
        note: "user",
        ...input.kind === "comment" ? { body: input.body } : { comment: input.body },
        reason: input.reason,
        duplicate_of: input.duplicateOf,
        add: input.add,
        remove: input.remove
      });
      const repo = proposal.repo ?? input.repo;
      const payload = input.kind === "label" ? await knownLabels(repo, proposal) : proposal.payload;
      const [info, queue] = await Promise.all([gitlab.itemsInfo(repo, proposal.numbers, proposal.itemKind), load(input.sessionID)]);
      const reasons = blockers(input.kind, repo, proposal.numbers, payload, info, queue);
      const skipped = new Map(reasons);
      const numbers = proposal.numbers.filter((number) => !skipped.has(number));
      const batch = `b_${randomUUID().replaceAll("-", "").slice(0, 8)}`;
      const actions = expand(
        { ...proposal, numbers, payload },
        { sessionID: input.sessionID, repo, batch, now: Date.now(), status: "approved", items: info, id: () => `a_${randomUUID().replaceAll("-", "").slice(0, 12)}`, source: "user" }
      );
      await add(input.sessionID, actions);
      kick(input.sessionID);
      return { batch, queued: numbers, skipped: reasons.map(([number, reason]) => ({ number, reason })) };
    },
    agentTriage: async ({ sessionID, triage }) => {
      if (!triage) throw new Error("Triage metadata is required.");
      const now = Date.now();
      await update(sessionID, (queue) => ({ ...queue, triage: { ...triage, round: 1, reviewed: [], checkedAt: now, createdAt: now } }));
      await indexRepo(triage.repo, sessionID);
      return "Triage started.";
    },
    agentEdit: async (edit) => {
      const action = (await load(edit.sessionID)).actions.find((item) => item.id === edit.id);
      if (!action) throw new Error("That action is gone.");
      if (action.status !== "proposed") throw new Error("Only an action waiting for approval can be edited.");
      if (!["comment", "close", "reopen", "label", "assign"].includes(action.kind)) throw new Error("This action cannot be edited.");
      const payload = action.payload;
      const body = edit.body ?? payload.body;
      const reason = edit.reason ?? payload.reason;
      const duplicateOf = edit.duplicateOf === null || reason !== "duplicate" ? void 0 : edit.duplicateOf ?? payload.duplicateOf;
      const checked = parseWrite(action.kind, {
        numbers: [action.number],
        note: action.note || "edited",
        ...action.kind === "comment" ? { body } : { comment: body },
        reason,
        duplicate_of: duplicateOf,
        add: edit.add ?? payload.add,
        remove: edit.remove ?? payload.remove
      });
      const next = action.kind === "label" ? await knownLabels(action.repo, checked) : checked.payload;
      const updated = await update(edit.sessionID, (queue) => ({
        ...queue,
        actions: queue.actions.map(
          (item) => item.id === action.id && item.status === "proposed" ? { ...item, payload: next, edited: true, original: item.original ?? item.payload, updatedAt: Date.now() } : item
        )
      }));
      const result = updated.actions.find((item) => item.id === action.id);
      if (result?.status !== "proposed") throw new Error("The action was decided while you edited it.");
      return result;
    },
    agentUndo: async ({ sessionID, id }) => {
      const action = (await load(sessionID)).actions.find((item) => item.id === id);
      const plan = action ? undoFor(action) : void 0;
      if (!action || !plan) throw new Error("This action cannot be undone.");
      const now = Date.now();
      const undo = {
        ...action,
        id: `a_${randomUUID().replaceAll("-", "").slice(0, 12)}`,
        batch: `b_${randomUUID().replaceAll("-", "").slice(0, 8)}`,
        kind: plan.kind,
        payload: plan.payload,
        note: `Undo: ${describe(action)}`,
        status: "approved",
        error: null,
        result: null,
        source: "user",
        undoOf: action.id,
        undoneBy: null,
        edited: void 0,
        original: void 0,
        round: void 0,
        createdAt: now,
        updatedAt: now
      };
      await update(sessionID, (queue) => ({
        ...queue,
        actions: [...queue.actions.map((item) => item.id === id ? { ...item, undoneBy: undo.id, updatedAt: now } : item), undo]
      }));
      kick(sessionID);
      return `Undoing: ${describe(undo)}.`;
    },
    agentRetry: async ({ sessionID, ids }) => {
      await update(sessionID, (queue) => ({
        ...queue,
        actions: queue.actions.map((action) => ids.includes(action.id) && action.status === "failed" ? { ...action, status: "approved", error: null, updatedAt: Date.now() } : action)
      }));
      kick(sessionID);
      return "Retrying.";
    },
    agentAuto: async ({ sessionID, auto }) => {
      await update(sessionID, (queue) => ({ ...queue, auto }));
      return auto ? "Auto-run on." : "Auto-run off.";
    },
    reviewDrafts: async ({ repo, number, sessionID }) => {
      const state = await store.read();
      return Object.values(state.drafts).filter((draft) => draft.repo.toLowerCase() === repo.toLowerCase() && draft.number === number).sort((a, b) => Number(b.sessionID === sessionID) - Number(a.sessionID === sessionID) || b.updatedAt - a.updatedAt);
    },
    reviewEdit: async (edit) => {
      const add2 = edit.add;
      const files = add2 ? (await pullRequest(edit.repo, edit.number)).files : [];
      const error = add2 ? placementError(files, add2) : void 0;
      if (error) throw new Error(error);
      return serialize(draftKey(edit.sessionID, edit.repo, edit.number), async () => {
        const draft = await loadDraft(edit.sessionID, edit.repo, edit.number);
        const now = Date.now();
        const base = draft ?? (add2 && edit.sha ? { sessionID: edit.sessionID, repo: edit.repo, number: edit.number, sha: edit.sha, summary: "", event: "COMMENT", note: "", source: "user", comments: [], createdAt: now, updatedAt: now } : void 0);
        if (!base) throw new Error("This draft review is gone: it was submitted or discarded.");
        return saveDraft(
          editDraft(
            base,
            { summary: edit.summary, event: edit.event, update: edit.update, remove: edit.remove, add: add2 ? { id: commentId(), ...add2, source: "user", edited: false } : void 0 },
            now
          )
        );
      });
    },
    reviewDiscard: async ({ sessionID, repo, number }) => {
      await serialize(draftKey(sessionID, repo, number), () => dropDraft(sessionID, repo, number));
      return "Draft review discarded.";
    },
    reviewSubmit: async ({ sessionID, repo, number, force }) => serialize(draftKey(sessionID, repo, number), async () => {
      const draft = await loadDraft(sessionID, repo, number);
      if (!draft) throw new Error("This draft review is gone: it was submitted or discarded.");
      const pr = await pullRequest(repo, number);
      if (pr.item.state !== "OPEN") throw new Error(`!${number} is ${pr.item.state.toLowerCase()}; GitLab takes reviews only on open merge requests.`);
      const split = splitDrift(draft.comments, pr.files);
      if (pr.sha !== draft.sha && !force) {
        return {
          submitted: false,
          url: null,
          moved: split.moved,
          message: `!${number} has new commits since this review was drafted.${split.moved.length > 0 ? ` ${split.moved.length} of ${draft.comments.length} comments are on lines no longer in the diff; submitting moves them into the summary.` : " Every comment's line is still in the diff."}`
        };
      }
      const body = withMoved(draft.summary, split.moved);
      if (draft.event === "REQUEST_CHANGES" && !body.trim()) throw new Error("Requesting changes needs a summary.");
      if (draft.event === "COMMENT" && !body.trim() && split.valid.length === 0) throw new Error("Write a summary or add a comment first.");
      const url = await gitlab.createReview({ repo, number, sha: pr.sha, event: draft.event, body, comments: split.valid });
      await dropDraft(sessionID, repo, number);
      return {
        submitted: true,
        url: url || null,
        moved: split.moved,
        message: `Review submitted with ${split.valid.length} inline comment${split.valid.length === 1 ? "" : "s"}${split.moved.length > 0 ? `; ${split.moved.length} moved into the summary` : ""}.`
      };
    })
  };
  const start = () => {
    const hook = (exec, result) => {
      if (exec?.name !== "bash" && exec?.name !== "pwsh") return;
      const args = exec.arguments && typeof exec.arguments === "object" ? exec.arguments : {};
      const command = typeof args.command === "string" ? args.command : "";
      if (!/\bglab\b/.test(command)) return;
      if (result?.isError) return;
      const value = result?.value && typeof result.value === "object" ? result.value : {};
      if (typeof value.exitCode === "number" && value.exitCode !== 0) return;
      if (value.kind === "background" || value.status === "running") return;
      const sessionID = String(exec.agent?.session?.id ?? "");
      if (!sessionID) return;
      const session = exec.agent?.session;
      const cwd = ctx.workingDirectory?.get?.(session) ?? session?.header?.cwd;
      if (!cwd) return;
      void recordShell(sessionID, command, String(cwd), typeof args.workdir === "string" ? args.workdir : typeof value.cwd === "string" ? value.cwd : void 0).catch(
        (error) => deps.log("warn", "could not record a glab command", { error: message(error) })
      );
    };
    const unhook = ctx.on("tools/result", hook);
    return () => {
      worker.stopped = true;
      worker.wake?.();
      waits.forEach((abort) => abort());
      unhook();
    };
  };
  const gitlabRemote = async (repo) => {
    const remote = gitlab.remoteOf(repo);
    if (!remote) throw new Error(`No GitLab remote is known for ${repo}. Open the panel in that project first.`);
    return remote;
  };
  return { methods, start };
}
function commentId() {
  return `c_${randomUUID().replaceAll("-", "").slice(0, 12)}`;
}
function mark(action) {
  return action.item === "issue" ? "#" : "!";
}
function statusText(action) {
  if (action.status === "done") return action.result?.noop ? "done (nothing to change)" : action.undoneBy ? "done, then undone by the user" : "done";
  if (action.status === "failed") return `failed: ${action.error ?? "unknown error"}`;
  if (action.status === "skipped") return action.error ? `skipped: ${action.error}` : "skipped by the user";
  if (action.status === "proposed") return "waiting for the user's approval";
  if (action.status === "approved") return "approved, queued to run";
  if (action.status === "running") return action.error ? `running (${action.error})` : "running";
  return "undone by the user";
}
function actionLine(action) {
  const edit = edits(action);
  return `${action.repo}${mark(action)}${action.number}${action.title ? ` "${action.title}"` : ""}: ${describe(action)} \u2014 ${statusText(action)}${edit ? ` (${edit})` : ""}${action.source === "shell" ? " (ran in the shell)" : ""}${action.source === "user" && !action.undoOf ? " (the user's own action)" : ""}`;
}
function triageStatus(queue, since, isQuiet) {
  const triage = queue.triage;
  if (!triage) return "";
  const progress = triageProgress(triage, queue.actions);
  const mine = queue.actions.filter((action) => action.round !== void 0 && action.source === "tool");
  const news = mine.filter((action) => action.updatedAt > since && action.status !== "proposed");
  const skipped = news.filter((action) => action.status === "skipped" && !action.error);
  const edited = news.filter((action) => action.edited);
  const waiting = mine.filter((action) => action.status === "proposed");
  return [
    `Triage of ${triage.repo}: ${progress.reviewed} of ${progress.total} items reviewed \xB7 ${progress.approved} approved \xB7 ${progress.skipped} skipped \xB7 ${progress.waiting} waiting for the user. New proposals go into batch ${triage.round}.`,
    ...news.length > 0 ? ["", "Decided since you last looked:", ...news.map((action) => `- ${actionLine(action)}`)] : ["", "Nothing was decided since you last looked."],
    ...skipped.length > 0 || edited.length > 0 ? [
      "",
      "The user's preferences from these decisions; follow them for the remaining items:",
      ...skipped.map((action) => `- Skipped on ${mark(action)}${action.number}: ${describe(action)}${action.note ? ` (your note: ${action.note})` : ""}. Don't propose it again.`),
      ...edited.map((action) => `- On ${mark(action)}${action.number}, ${edits(action)}`)
    ] : [],
    ...waiting.length > 0 ? [
      "",
      `Still waiting for the user: ${waiting.map((action) => `${mark(action)}${action.number} ${describe(action)}`).join("; ")}.`,
      isQuiet ? "Call this tool with `wait: true` to wait for the decisions." : "Call this tool again with `wait: true` to keep waiting."
    ] : [],
    ...progress.reviewed >= progress.total && waiting.length === 0 ? ["", "Every item is reviewed: summarize the run for the user."] : []
  ].join("\n");
}
function searchLine(item) {
  const state = item.draft && item.state === "OPEN" ? "draft" : item.state.toLowerCase();
  const labels = item.labels.length > 0 ? ` [${item.labels.map((label) => label.name).join(", ")}]` : "";
  return `${item.kind === "mr" ? "!" : "#"}${item.number} ${item.kind === "mr" ? "MR" : "issue"} ${state}: ${item.title}${labels} \xB7 @${item.author} \xB7 ${age(item.created)} \xB7 ${plural(item.comments, "comment")}`;
}
function age(date) {
  const days = Math.floor((Date.now() - Date.parse(date)) / 864e5);
  if (!Number.isFinite(days) || days < 1) return "today";
  if (days < 60) return `${days}d ago`;
  if (days < 730) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
function plural(count, noun) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}
function record(value) {
  return typeof value === "object" && value !== null ? value : {};
}
function message(error) {
  return error instanceof Error ? error.message : String(error);
}

// src/host/git.ts
import { existsSync as existsSync2 } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { basename, dirname, isAbsolute as isAbsolute2, join as join2 } from "node:path";

// src/host/exec.ts
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { delimiter } from "node:path";
var TIMEOUT = 5 * 6e4;
var MAX_OUTPUT = 64 * 1024 * 1024;
function environment() {
  const extra = ["/opt/homebrew/bin", "/usr/local/bin", "/usr/bin", "/bin"];
  const path = [...(process.env.PATH ?? "").split(delimiter), ...extra].filter((item, index, all) => item && all.indexOf(item) === index);
  return {
    ...process.env,
    PATH: path.join(delimiter),
    GIT_TERMINAL_PROMPT: "0",
    GIT_EDITOR: "true",
    GIT_SEQUENCE_EDITOR: "true",
    GIT_MERGE_AUTOEDIT: "no",
    GIT_OPTIONAL_LOCKS: "0",
    GIT_PAGER: "cat",
    GH_PROMPT_DISABLED: "1",
    GLAB_NO_PROMPT: "1",
    NO_COLOR: "1",
    LANG: "C",
    LC_ALL: "C"
  };
}
function run(command, args, cwd, options = {}) {
  return new Promise((resolve2, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: options.env ? { ...environment(), ...options.env } : environment(),
      stdio: [options.input === void 0 ? "ignore" : "pipe", "pipe", "pipe"],
      windowsHide: true,
      detached: process.platform !== "win32"
    });
    const stdout = [];
    const stderr = [];
    const state = { size: 0, stopped: "", settled: false };
    const stop = (reason) => {
      if (state.stopped) return;
      state.stopped = reason;
      kill(child);
    };
    const limit = options.timeout ?? TIMEOUT;
    const timer = setTimeout(() => stop(`\`${command} ${args[0]}\` did not finish within ${Math.round(limit / 6e4)} minutes.`), limit);
    const abort = () => stop("Cancelled.");
    options.signal?.addEventListener("abort", abort, { once: true });
    if (options.signal?.aborted) abort();
    const collect = (into) => (chunk) => {
      state.size += chunk.length;
      if (state.size > MAX_OUTPUT) return stop(`\`${command} ${args[0]}\` printed more than ${MAX_OUTPUT / 1024 / 1024} MB.`);
      into.push(chunk);
    };
    child.stdin?.on("error", () => void 0);
    child.stdin?.end(options.input);
    child.stdout?.on("data", collect(stdout));
    child.stderr?.on("data", collect(stderr));
    const finish = (code, error) => {
      if (state.settled) return;
      state.settled = true;
      clearTimeout(timer);
      options.signal?.removeEventListener("abort", abort);
      const out = Buffer.concat(stdout).toString("utf8");
      if (!error && !state.stopped && code !== null && (options.ok ?? ((value) => value === 0))(code)) return resolve2(out);
      const output = Buffer.concat(stderr).toString("utf8").trim() || out.trim();
      const message3 = state.stopped || (error ? spawnError(command, cwd, error) : "") || (output.length > 4e3 ? `${output.slice(0, 4e3)}
\u2026` : output) || `\`${command} ${args[0]}\` failed with exit code ${code}.`;
      if (!options.signal?.aborted) reject(new Error(message3));
      else reject(new Error("Cancelled."));
    };
    child.on("error", (error) => finish(null, error));
    child.on("close", (code) => finish(code));
  });
}
function kill(child) {
  if (child.pid === void 0 || child.exitCode !== null || child.signalCode !== null) return;
  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true }).on("error", () => child.kill());
    return;
  }
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    child.kill("SIGTERM");
  }
}
function spawnError(command, cwd, error) {
  if (error.code === "ENOENT" && !existsSync(cwd)) return `The directory ${cwd} does not exist.`;
  if (error.code === "ENOENT") return `${command} is not installed or not on PATH.`;
  return error.message;
}
function arg(value) {
  if (!value || value.startsWith("-")) throw new Error(`"${value}" is not a valid name.`);
  return value;
}
function pathspec(path) {
  return `:(top,literal)${path}`;
}
function batched(paths) {
  const all = [];
  const state = { size: 0 };
  paths.forEach((path) => {
    const last = all.at(-1);
    state.size += path.length + 3;
    if (last && state.size < 24e3) return void last.push(path);
    all.push([path]);
    state.size = path.length + 3;
  });
  return all;
}

// src/host/git.ts
var FACTS_TTL = 6e4;
var OPEN_MRS_TTL = 2 * 6e4;
var TIMEOUT2 = 5 * 6e4;
var MAX_OUTPUT2 = 64 * 1024 * 1024;
function createGit(deps) {
  const queued = /* @__PURE__ */ new Map();
  const facts = /* @__PURE__ */ new Map();
  const openMrs = /* @__PURE__ */ new Map();
  const git = (cwd, args, signal) => run("git", args, cwd, { signal, timeout: TIMEOUT2 });
  const probe = (cwd, args, signal) => run("git", args, cwd, { signal, quiet: true, timeout: TIMEOUT2 }).catch(() => "");
  const fact = (key, read) => {
    const known = facts.get(key);
    if (known && Date.now() - known.at < FACTS_TTL) return known.value;
    const value = read();
    facts.set(key, { at: Date.now(), value });
    void value.catch(() => facts.delete(key));
    return value;
  };
  const readRemote = async (cwd) => {
    const names = (await probe(cwd, ["remote"])).split("\n").filter(Boolean);
    const ordered = [...names.filter((name2) => name2 === "origin"), ...names.filter((name2) => name2 !== "origin")];
    for (const name2 of ordered) {
      const parsed = parseRemote(name2, await probe(cwd, ["remote", "get-url", name2]), {
        ...deps.host ? { host: deps.host } : {},
        ...deps.project ? { project: deps.project } : {},
        ...deps.apiBase ? { apiBase: deps.apiBase } : {}
      });
      if (parsed) return parsed;
    }
    if (deps.apiBase || deps.project) {
      return parseRemote("configured", `https://configured/${deps.project ?? "unknown/project"}.git`, {
        ...deps.host ? { host: deps.host } : {},
        ...deps.project ? { project: deps.project } : {},
        ...deps.apiBase ? { apiBase: deps.apiBase } : {}
      }) ?? null;
    }
    return null;
  };
  const remote = (cwd) => fact(`remote:${cwd}`, () => readRemote(cwd));
  const readDefaultBranch = async (cwd, remoteName) => {
    if (remoteName) {
      const symbolic = (await probe(cwd, ["symbolic-ref", "--short", `refs/remotes/${remoteName}/HEAD`])).trim();
      if (symbolic) return symbolic.slice(remoteName.length + 1);
    }
    const local = (await probe(cwd, ["branch", "--list", "main", "master", "--format=%(refname:short)"])).split("\n").filter(Boolean);
    return local.includes("main") ? "main" : local[0] ?? null;
  };
  const defaultBranch = (cwd, remoteName) => fact(`default:${cwd}:${remoteName ?? ""}`, async () => deps.defaultBranch || readDefaultBranch(cwd, remoteName));
  const operation = (gitDir) => {
    if (existsSync2(join2(gitDir, "rebase-apply", "applying"))) return "am";
    if (existsSync2(join2(gitDir, "rebase-merge")) || existsSync2(join2(gitDir, "rebase-apply"))) return "rebase";
    if (existsSync2(join2(gitDir, "MERGE_HEAD"))) return "merge";
    if (existsSync2(join2(gitDir, "CHERRY_PICK_HEAD"))) return "cherry-pick";
    if (existsSync2(join2(gitDir, "REVERT_HEAD"))) return "revert";
    return null;
  };
  const currentBranch = async (cwd) => (await git(cwd, ["branch", "--show-current"])).trim();
  const baseRef = async (cwd) => {
    const remoteName = (await remote(cwd))?.name ?? "origin";
    const name2 = await defaultBranch(cwd, remoteName);
    if (!name2) return null;
    const tracked = (await probe(cwd, ["rev-parse", "--verify", "--quiet", `refs/remotes/${remoteName}/${name2}`])).trim();
    return { name: name2, ref: tracked ? `${remoteName}/${name2}` : name2 };
  };
  const mutate = (cwd, work, remoteChange = false) => {
    facts.clear();
    const next = (queued.get(cwd) ?? Promise.resolve()).then(work, work);
    const settled = next.catch(() => void 0);
    queued.set(cwd, settled);
    void settled.then(() => {
      if (queued.get(cwd) === settled) queued.delete(cwd);
    });
    return next.finally(() => {
      if (remoteChange) openMrs.clear();
      deps.emitChanged({ cwd, remote: remoteChange });
    });
  };
  const write = (cwd, args, remoteChange = false) => mutate(cwd, () => git(cwd, args), remoteChange);
  const factsOf = async (cwd) => {
    const top = (await probe(cwd, ["rev-parse", "--show-toplevel", "--absolute-git-dir", "--git-common-dir"])).trim().split(/\r?\n/);
    const [root, gitDir, common] = top;
    if (!root || !gitDir) return null;
    const shared = !common ? gitDir : isAbsolute2(common) ? common : join2(cwd, common);
    return {
      root,
      gitDir,
      common: shared,
      // A linked worktree keeps the shared dir under the main checkout's `.git`, so its parent is that checkout.
      mainRoot: basename(shared) === ".git" ? dirname(shared) : root,
      remote: await remote(cwd),
      defaultBranch: await defaultBranch(cwd, (await remote(cwd))?.name)
    };
  };
  const ensurePushed = async (cwd) => {
    const status = parseStatus(await git(cwd, ["status", "--porcelain=v2", "--branch", "-z", "--untracked-files=no"]));
    const branch = status.branch.branch;
    if (!branch) throw new Error("Check out a branch before creating a merge request.");
    const upstreamRemote = (await probe(cwd, ["config", "--get", `branch.${branch}.remote`])).trim();
    if (status.branch.upstream && status.branch.upstream === `${upstreamRemote}/${branch}`) {
      if (status.branch.ahead > 0) await git(cwd, ["push", upstreamRemote, `HEAD:refs/heads/${branch}`]);
      return branch;
    }
    const repo = await remote(cwd);
    await git(cwd, ["push", "-u", repo?.name ?? "origin", `HEAD:refs/heads/${branch}`]);
    return branch;
  };
  const readOpenMrs = async (cwd, fetchMrs) => {
    const repo = await remote(cwd);
    if (!repo) return { error: "No GitLab remote found for this repository.", items: [] };
    const key = `${repo.apiBase}/${repo.path}`;
    const known = openMrs.get(key);
    if (known && Date.now() - known.at < OPEN_MRS_TTL) return known.value;
    const value = fetchMrs(repo);
    openMrs.set(key, { at: Date.now(), value });
    void value.then((result) => {
      if (result.error) openMrs.delete(key);
    }, () => openMrs.delete(key));
    return value;
  };
  return {
    git,
    probe,
    remote,
    defaultBranch,
    baseRef,
    currentBranch,
    ensurePushed,
    factsOf,
    readOpenMrs,
    facts,
    openMrs,
    mutate,
    write,
    operation,
    overview: async ({ cwd }, signal) => {
      const found = await factsOf(cwd);
      if (!found || !existsSync2(found.gitDir)) return null;
      const [status, stashes] = await Promise.all([
        git(cwd, ["status", "--porcelain=v2", "--branch", "-z"], signal),
        readFile(join2(found.common, "logs", "refs", "stash"), "utf8").then((text) => text.split("\n").filter(Boolean).length, () => 0)
      ]);
      const parsed = parseStatus(status);
      return {
        root: found.root,
        worktreeRoot: found.mainRoot,
        name: basename(found.root),
        branch: parsed.branch.branch,
        head: parsed.branch.head,
        upstream: parsed.branch.upstream,
        ahead: parsed.branch.ahead,
        behind: parsed.branch.behind,
        remote: found.remote,
        defaultBranch: found.defaultBranch,
        operation: operation(found.gitDir),
        stashes,
        files: parsed.files,
        gitlab: null
      };
    },
    log: async ({ cwd, limit, scope }, signal) => {
      const args = ["log", "--topo-order", "--decorate=full", "--no-show-signature", `--format=${LOG_FORMAT}`, `-n${Math.max(1, Math.floor(limit) || 1)}`];
      const refs = async () => {
        if (scope === "current") return ["HEAD"];
        if (scope === "all") return ["--branches", "--remotes", "--tags", "HEAD"];
        const upstreams = (await probe(cwd, ["for-each-ref", "--format=%(upstream)", "refs/heads"], signal)).split("\n").filter((ref, index, all) => ref.startsWith("refs/remotes/") && all.indexOf(ref) === index);
        return ["--branches", "--tags", "HEAD", ...upstreams];
      };
      return parseLog(await git(cwd, [...args, ...await refs(), "--"], signal).catch(() => ""));
    },
    show: async ({ cwd, hash }, signal) => {
      const [meta, files] = await Promise.all([
        git(cwd, ["show", "-s", "--no-show-signature", `--format=%H%x1f%an%x1f%ae%x1f%at%x1f%B`, arg(hash), "--"], signal),
        git(cwd, ["show", "--format=", "--no-show-signature", "--no-color", "--no-ext-diff", "--name-status", "-z", "-M", "-m", "--first-parent", arg(hash), "--"], signal)
      ]);
      const [full, author, email, date, ...body] = meta.split(FIELD);
      const tokens = files.split("\0").filter(Boolean);
      const changed = [];
      for (let i = 0; i < tokens.length; i++) {
        const status = tokens[i] ?? "";
        const renamed = status.startsWith("R") || status.startsWith("C");
        const path = renamed ? tokens[i + 2] : tokens[i + 1];
        i += renamed ? 2 : 1;
        if (path) changed.push({ status: status[0] ?? "M", path });
      }
      return { hash: full ?? hash, author: author ?? "", email: email ?? "", date: Number(date ?? 0), body: body.join(FIELD).trim(), files: changed };
    },
    branches: async ({ cwd }, signal) => {
      const [refs, worktrees] = await Promise.all([
        git(cwd, ["for-each-ref", "--sort=-committerdate", `--format=${BRANCH_FORMAT}`, "refs/heads", "refs/remotes"], signal),
        probe(cwd, ["worktree", "list", "--porcelain"], signal)
      ]);
      return parseBranches(refs, parseWorktrees(worktrees));
    },
    mergedBranches: async ({ cwd }, signal) => {
      const base = await baseRef(cwd);
      if (!base) return [];
      const output = await git(cwd, ["for-each-ref", `--merged=${base.ref}`, "--format=%(refname:short)", "refs/heads"], signal);
      return output.split("\n").filter(Boolean);
    },
    outgoing: async ({ cwd }, signal) => {
      const [remotes, base] = await Promise.all([probe(cwd, ["for-each-ref", "--count=1", "--format=%(refname)", "refs/remotes"], signal), baseRef(cwd)]);
      const unpushed = remotes.trim() ? parseLog(await probe(cwd, ["log", "--decorate=full", "--no-show-signature", `--format=${LOG_FORMAT}`, "-n50", "HEAD", "--not", "--remotes", "--"], signal)) : [];
      const ahead = base ? Number((await probe(cwd, ["rev-list", "--count", `${base.ref}..HEAD`, "--"], signal)).trim()) || 0 : 0;
      return { unpushed, base: base?.name ?? null, ahead };
    },
    diff: async ({ cwd, path, staged, untracked }, signal) => {
      if (untracked) {
        const files = path.endsWith("/") ? (await git(cwd, ["ls-files", "--others", "--exclude-standard", "-z", "--", pathspec(path)], signal)).split("\0").filter(Boolean) : [path];
        const diffs = await Promise.all(
          files.slice(0, 20).map(
            (file) => run("git", ["-c", "core.quotePath=false", "diff", "--no-color", "--no-ext-diff", "--no-index", "--", "/dev/null", file], cwd, {
              signal,
              ok: (code) => code <= 1,
              timeout: TIMEOUT2
            }).catch(() => "")
          )
        );
        return diffs.join("") + (files.length > 20 ? `
\u2026 ${files.length - 20} more files
` : "");
      }
      return git(cwd, ["-c", "core.quotePath=false", "diff", "--no-color", "--no-ext-diff", ...staged ? ["--cached"] : [], "--", pathspec(path)], signal);
    },
    mrDefaults: async ({ cwd, base }) => {
      const remoteName = (await remote(cwd))?.name ?? "origin";
      const range = (await probe(cwd, ["rev-parse", "--verify", "--quiet", `${remoteName}/${arg(base)}`])).trim() ? `${remoteName}/${base}..HEAD` : `${base}..HEAD`;
      const subjects = (await probe(cwd, ["log", "--reverse", "--no-show-signature", "--format=%s", range, "--"])).split("\n").filter(Boolean);
      const branch = await currentBranch(cwd);
      const title = subjects.length === 1 ? subjects[0] ?? branch : branch.replace(/^[^/]+\//, "").replace(/[-_]+/g, " ");
      const template = await templateAt((await probe(cwd, ["rev-parse", "--show-toplevel"])).trim());
      return {
        title: title.charAt(0).toUpperCase() + title.slice(1),
        body: subjects.length > 1 ? subjects.map((subject) => `- ${subject}`).join("\n") : "",
        ...template ? { template } : {}
      };
    },
    stage: async ({ cwd, paths }) => paths.length === 0 ? "" : mutate(cwd, () => batched(paths.map(pathspec)).reduce((previous, batch) => previous.then(() => git(cwd, ["add", "-A", "--", ...batch])), Promise.resolve(""))),
    unstage: async ({ cwd, paths }) => paths.length === 0 ? "" : mutate(cwd, async () => {
      const hasHead = !!(await probe(cwd, ["rev-parse", "--verify", "--quiet", "HEAD"])).trim();
      return batched(paths.map(pathspec)).reduce(
        (previous, batch) => previous.then(() => git(cwd, hasHead ? ["restore", "--staged", "--", ...batch] : ["rm", "--cached", "-r", "-q", "--", ...batch])),
        Promise.resolve("")
      );
    }),
    discard: ({ cwd, tracked, untracked }) => mutate(cwd, async () => {
      if (tracked.length > 0) await batched(tracked.map(pathspec)).reduce((previous, batch) => previous.then(() => git(cwd, ["restore", "--worktree", "--", ...batch])), Promise.resolve(""));
      if (untracked.length > 0) await batched(untracked.map(pathspec)).reduce((previous, batch) => previous.then(() => git(cwd, ["clean", "-fdq", "--", ...batch])), Promise.resolve(""));
      return "";
    }),
    commit: ({ cwd, message: message3, amend, all }) => mutate(cwd, async () => {
      if (all) await git(cwd, ["add", "-A"]);
      if (amend && !message3) return git(cwd, ["commit", "--amend", "--no-edit"]);
      return git(cwd, ["commit", "-m", message3, ...amend ? ["--amend"] : []]);
    }),
    checkout: async ({ cwd, ref, track }) => write(cwd, track ? ["switch", "-c", arg(ref), "--track", arg(track)] : ["switch", arg(ref)], true).catch((error) => {
      if (error instanceof Error && /a branch is expected|invalid reference/i.test(error.message)) return write(cwd, ["switch", "--detach", ref], true);
      throw error;
    }),
    createBranch: ({ cwd, name: name2, start, checkout }) => write(cwd, [...checkout ? ["switch", "-c"] : ["branch"], arg(name2), ...start ? ["--no-track", arg(start)] : []]),
    deleteBranch: ({ cwd, name: name2, force }) => write(cwd, ["branch", force ? "-D" : "-d", arg(name2)]),
    deleteBranches: ({ cwd, names, force }) => mutate(
      cwd,
      () => names.reduce(async (previous, name2) => {
        const done = await previous;
        const error = await git(cwd, ["branch", force ? "-D" : "-d", arg(name2)]).then(() => null, (failure) => failure instanceof Error ? failure.message : String(failure));
        return [...done, { name: name2, error }];
      }, Promise.resolve([]))
    ),
    undoCommit: ({ cwd }) => mutate(cwd, async () => {
      const gitDir = (await git(cwd, ["rev-parse", "--absolute-git-dir"])).trim();
      if (operation(gitDir)) throw new Error("Finish or abort the operation in progress first.");
      const parents = (await git(cwd, ["rev-list", "--parents", "-n1", "HEAD", "--"])).trim().split(" ").slice(1);
      if (parents.length === 0) throw new Error("The first commit of a repository cannot be undone here.");
      if (parents.length > 1) throw new Error("A merge commit cannot be undone here.");
      if ((await probe(cwd, ["branch", "-r", "--contains", "HEAD"])).trim()) throw new Error("The last commit is already on a remote; undoing it would rewrite published history.");
      return git(cwd, ["reset", "--soft", "HEAD~1"]);
    }),
    deleteRemoteBranch: ({ cwd, remote: remoteName, name: name2 }) => write(cwd, ["push", arg(remoteName), "--delete", arg(name2)], true),
    merge: ({ cwd, ref }) => write(cwd, ["merge", "--no-edit", arg(ref)]),
    rebase: ({ cwd, ref }) => write(cwd, ["rebase", arg(ref)]),
    cherryPick: ({ cwd, hash }) => write(cwd, ["cherry-pick", arg(hash)]),
    revert: ({ cwd, hash }) => write(cwd, ["revert", "--no-edit", arg(hash)]),
    abort: ({ cwd }) => mutate(cwd, async () => {
      const gitDir = (await git(cwd, ["rev-parse", "--absolute-git-dir"])).trim();
      const op = operation(gitDir);
      if (!op) return "";
      return git(cwd, [op, "--abort"]);
    }),
    continue: ({ cwd }) => mutate(cwd, async () => {
      const gitDir = (await git(cwd, ["rev-parse", "--absolute-git-dir"])).trim();
      const op = operation(gitDir);
      if (!op) return "";
      if (op === "merge") return git(cwd, ["commit", "--no-edit"]);
      return git(cwd, [op, "--continue"]);
    }),
    fetch: ({ cwd }) => write(cwd, ["fetch", "--all", "--prune"], true),
    pull: ({ cwd }) => write(cwd, ["pull"], true),
    push: ({ cwd, force }) => mutate(cwd, async () => {
      const upstream = await probe(cwd, ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]);
      if (upstream.trim()) return git(cwd, ["push", ...force ? ["--force-with-lease"] : []]);
      const repo = await remote(cwd);
      return git(cwd, ["push", "-u", repo?.name ?? "origin", "HEAD", ...force ? ["--force-with-lease"] : []]);
    }, true),
    pushBranch: ({ cwd, name: name2 }) => mutate(cwd, async () => {
      const repo = await remote(cwd);
      return git(cwd, ["push", "-u", repo?.name ?? "origin", arg(name2)]);
    }, true),
    stash: ({ cwd }) => write(cwd, ["stash", "push", "--include-untracked"]),
    stashPop: ({ cwd }) => write(cwd, ["stash", "pop"]),
    worktreeAdd: ({ cwd, branch, base }) => mutate(cwd, async () => {
      const root = (await git(cwd, ["rev-parse", "--show-toplevel"])).trim();
      if (!root) throw new Error("This directory is not a git work tree.");
      const safe = branch.replace(/[^\w.-]+/g, "-");
      let path = join2(join2(root, ".."), `${basename(root)}-${safe}`);
      let suffix = 2;
      while (existsSync2(path)) path = join2(join2(root, ".."), `${basename(root)}-${safe}-${suffix++}`);
      const known = await git(cwd, ["rev-parse", "--verify", "--quiet", `refs/heads/${arg(branch)}`]).then((out) => out.trim() !== "", () => false);
      await git(cwd, known ? ["worktree", "add", path, arg(branch)] : ["worktree", "add", "-b", arg(branch), path, arg(base)]);
      return { path };
    }, true),
    worktreeRemove: async ({ cwd, path, force }) => {
      const found = await factsOf(cwd);
      if (!found) throw new Error("This directory is not a git work tree.");
      if (found.mainRoot === path) throw new Error("The main checkout cannot be removed as a worktree.");
      return mutate(found.mainRoot, () => git(found.mainRoot, ["worktree", "remove", ...force ? ["--force"] : [], arg(path)]), true);
    },
    checkoutMrs: ({ cwd, mr }) => mutate(cwd, async () => {
      const remoteName = (await remote(cwd))?.name ?? "origin";
      try {
        await git(cwd, ["fetch", remoteName, `merge-requests/${mr.number}/head:refs/heads/mr-${mr.number}`]);
        return await git(cwd, ["switch", `mr-${mr.number}`]);
      } catch {
        await git(cwd, ["fetch", remoteName, `${mr.head}:refs/remotes/${remoteName}/${mr.head}`]);
        return git(cwd, ["switch", "-c", arg(mr.head), "--track", `${remoteName}/${mr.head}`]);
      }
    }, true)
  };
}
async function templateAt(root) {
  if (!root) return void 0;
  const dirs = await Promise.all(
    [join2(root, ".gitlab", "merge_request_templates"), join2(root, ".gitlab"), join2(root, ".github"), root, join2(root, "docs")].map(async (dir) => ({
      dir,
      names: await readdir(dir).catch(() => [])
    }))
  );
  const named = (wanted) => dirs.flatMap((entry) => entry.names.filter((name2) => name2.toLowerCase() === wanted).map((name2) => join2(entry.dir, name2)));
  const folder = join2(root, ".gitlab", "merge_request_templates");
  const inFolder = (await readdir(folder).catch(() => [])).filter((name2) => name2.toLowerCase().endsWith(".md")).sort().map((name2) => join2(folder, name2));
  const path = named("merge_request_template.md")[0] ?? named("pull_request_template.md")[0] ?? inFolder[0];
  if (!path) return void 0;
  const text = await readFile(path, "utf8").catch(() => void 0);
  return text?.trim() ? text.slice(0, 2e4) : void 0;
}

// src/host/gitlab.ts
import { readFile as readFile2 } from "node:fs/promises";
import { homedir as homedir2 } from "node:os";
import { join as join3 } from "node:path";
var META_TTL = 5 * 6e4;
var INBOX_TTL = 6e4;
var RUNS_TTL = 15e3;
var THREADS_TTL = 2e4;
var LOG_LIMIT = 4e5;
var TOKEN_TTL = 30 * 6e4;
function keep(cache, key, value, limit) {
  cache.set(key, value);
  if (cache.size <= limit) return;
  for (const old of cache.keys()) {
    if (cache.size <= limit) break;
    cache.delete(old);
  }
}
function labelList(labels) {
  const broken = labels.find((label) => label.includes(","));
  if (broken) throw new Error(`The label "${broken}" contains a comma, which GitLab's comma-separated labels field cannot carry.`);
  return labels.join(",");
}
function createGitLab(deps) {
  const viewerCache = /* @__PURE__ */ new Map();
  const metaCache = /* @__PURE__ */ new Map();
  const filesCache = /* @__PURE__ */ new Map();
  const threadsCache = /* @__PURE__ */ new Map();
  const inboxCache = { at: 0, value: Promise.resolve(emptyInbox()) };
  const runsCache = /* @__PURE__ */ new Map();
  const finishedCache = /* @__PURE__ */ new Map();
  const logsCache = /* @__PURE__ */ new Map();
  const tokenCache = /* @__PURE__ */ new Map();
  const postedCache = /* @__PURE__ */ new Map();
  const writes = /* @__PURE__ */ new Map();
  const headersFor = (token) => ({
    "PRIVATE-TOKEN": token ?? "",
    Accept: "application/json",
    "User-Agent": "dsh-gitlab-panel"
  });
  const resolveToken = (host) => {
    const key = host ?? "";
    const cached = tokenCache.get(key);
    if (cached && Date.now() - cached.at < TOKEN_TTL) return cached.value;
    const value = (async () => {
      const direct = deps.config.token || (deps.config.tokenEnv ? process.env[deps.config.tokenEnv] : void 0) || process.env.GITLAB_TOKEN || process.env.GITLAB_PRIVATE_TOKEN || process.env.GLAB_TOKEN;
      if (direct) return direct;
      return readGlabToken(host ?? deps.config.host);
    })();
    tokenCache.set(key, { at: Date.now(), value });
    return value;
  };
  const requestPage = async (remote, path, init = {}) => {
    const query = Object.entries(init.query ?? {}).filter(([, value]) => value !== void 0 && value !== "").map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`).join("&");
    const url = `${apiBaseOf(remote)}${path}${query ? `${path.includes("?") ? "&" : "?"}${query}` : ""}`;
    const token = await resolveToken(remote.host);
    if (token) {
      const response = await fetch(url, {
        method: init.method ?? "GET",
        headers: {
          ...headersFor(token),
          ...init.body !== void 0 ? { "Content-Type": "application/json" } : {}
        },
        body: init.body === void 0 ? void 0 : JSON.stringify(init.body),
        signal: init.signal
      });
      if (response.status === 401) tokenCache.delete(remote.host);
      const text = await response.text();
      if (!response.ok) throw new Error(gitlabError(path, response.status, response.statusText, text, retryAfterOf(response.headers)));
      return { data: text ? JSON.parse(text) : null, headers: response.headers };
    }
    return glabPage(remote, path, init);
  };
  const request = async (remote, path, init = {}) => (await requestPage(remote, path, init)).data;
  const glabPage = async (remote, path, init = {}) => {
    const args = ["api", "--hostname", remote.host, "-X", init.method ?? "GET", path];
    const query = Object.entries(init.query ?? {}).filter(([, value]) => value !== void 0 && value !== "");
    query.forEach(([key, value]) => args.push("-f", `${key}=${String(value)}`));
    if (init.body !== void 0) args.push("--input", "-");
    const text = await run("glab", args, homedir2(), {
      signal: init.signal,
      input: init.body === void 0 ? void 0 : JSON.stringify(init.body),
      quiet: true
    }).catch((error) => {
      const message3 = error instanceof Error ? error.message : String(error);
      if (/not found|not installed|ENOENT/i.test(message3))
        throw new Error("GitLab is not configured: set GITLAB_TOKEN (or run `glab auth login`), or install the GitLab CLI.");
      throw new Error(message3);
    });
    return { data: text.trim() ? JSON.parse(text) : null, headers: new Headers() };
  };
  const projectId = (remote) => encodeURIComponent(remote.path);
  const viewer = (remote) => {
    const key = `${apiBaseOf(remote)}/${remote.path}`;
    const known = viewerCache.get(key);
    if (known) return known;
    const value = request(remote, "/user");
    viewerCache.set(key, value);
    value.catch(() => viewerCache.delete(key));
    return value;
  };
  const approveState = async (remote, iid) => {
    const data = await request(remote, `/projects/${projectId(remote)}/merge_requests/${iid}/approvals`).catch(() => null);
    if (!data) return { approvedBy: [], review: null, requested: [] };
    const approvedBy = (data.approved_by ?? []).map((entry) => entry.user?.username).filter(Boolean);
    const required = Number(data.approvals_required ?? 0);
    const left = Number(data.approvals_left ?? 0);
    const reviewerStates = data.approvals?.flatMap((rule) => rule.approved_by ?? []) ?? [];
    const review = required > 0 ? left === 0 ? "APPROVED" : "REVIEW_REQUIRED" : approvedBy.length > 0 ? "APPROVED" : null;
    return { approvedBy, review, requested: reviewerStates.map((entry) => entry.user?.username).filter(Boolean) };
  };
  const toMr = async (remote, raw) => {
    const state = raw.state === "merged" ? "MERGED" : raw.state === "closed" || raw.state === "locked" ? "CLOSED" : "OPEN";
    let review = null;
    if (state === "OPEN" && raw.detailed_merge_status) {
      const status = String(raw.detailed_merge_status);
      if (status === "approved") review = "APPROVED";
      else if (status.includes("approval")) review = "REVIEW_REQUIRED";
    }
    return {
      number: raw.iid,
      title: raw.title ?? "",
      state,
      draft: !!raw.draft || !!raw.work_in_progress,
      url: raw.web_url ?? `${remote.web}/-/merge_requests/${raw.iid}`,
      head: raw.source_branch ?? "",
      cross: raw.source_project_id !== void 0 && raw.target_project_id !== void 0 && raw.source_project_id !== raw.target_project_id,
      base: raw.target_branch ?? "",
      author: raw.author?.username ?? "ghost",
      review,
      checks: checkState(raw.head_pipeline?.status),
      updated: raw.updated_at ?? raw.created_at ?? (/* @__PURE__ */ new Date()).toISOString(),
      sha: raw.sha,
      sourceProject: raw.source_project_id ? String(raw.source_project_id) : void 0,
      targetProject: remote.path
    };
  };
  const toSearchItem = (remote, raw, kind) => {
    const mr = kind === "mr";
    const state = raw.state === "merged" ? "MERGED" : raw.state === "closed" || raw.state === "locked" ? "CLOSED" : "OPEN";
    return {
      kind,
      repo: remote.path,
      number: raw.iid ?? raw.id ?? 0,
      title: raw.title ?? "",
      state,
      draft: !!raw.draft || !!raw.work_in_progress,
      url: raw.web_url ?? `${remote.web}/-/${mr ? "merge_requests" : "issues"}/${raw.iid}`,
      author: raw.author?.username ?? "ghost",
      labels: (raw.labels ?? []).map((label) => typeof label === "string" ? { name: label, color: "888888" } : { name: label.name, color: label.color ?? "888888" }),
      comments: Number(raw.user_notes_count ?? 0),
      created: raw.created_at ?? "",
      updated: raw.updated_at ?? raw.created_at ?? "",
      head: mr ? raw.source_branch ?? null : null,
      base: mr ? raw.target_branch ?? null : null,
      review: null,
      checks: mr ? checkState(raw.head_pipeline?.status) : "none",
      assignees: (raw.assignees ?? []).map((user) => user.username).filter(Boolean)
    };
  };
  const mapNote = (note) => ({
    id: Number(note.id),
    author: note.author?.username ?? "ghost",
    body: String(note.body ?? ""),
    created: note.created_at ?? "",
    system: !!note.system
  });
  const allPages = async (remote, path, query = {}, signal) => {
    const output = [];
    for (let page = 1; page <= 5; page++) {
      const result = await requestPage(remote, path, { query: { ...query, per_page: "100", page: String(page) }, signal });
      const data = Array.isArray(result.data) ? result.data : [];
      output.push(...data);
      const next = result.headers.get("x-next-page");
      if (data.length < 100 && !next) break;
      if (!next && data.length < 100) break;
    }
    return output;
  };
  const meta = (remote) => {
    const key = `${apiBaseOf(remote)}/${remote.path}`;
    const cached = metaCache.get(key);
    if (cached && Date.now() - cached.at < META_TTL) return cached.value;
    const id = projectId(remote);
    const value = Promise.all([
      allPages(remote, `/projects/${id}/labels`).catch(() => []),
      allPages(remote, `/projects/${id}/members/all`).catch(() => []),
      allPages(remote, `/projects/${id}/milestones`, { state: "active" }).catch(() => [])
    ]).then(([labels, members, milestones]) => ({
      labels: labels.map((label) => ({ name: label.name, color: String(label.color ?? "888888").replace(/^#/, ""), description: label.description ?? void 0 })),
      people: members.map((member) => member.username).filter(Boolean),
      milestones: milestones.map((entry) => entry.title).filter(Boolean)
    }));
    metaCache.set(key, { at: Date.now(), value });
    return value;
  };
  const changes = async (remote, iid, head) => {
    const key = head ? `${apiBaseOf(remote)}/${remote.path}!${iid}@${head}` : null;
    const known = key ? filesCache.get(key) : void 0;
    if (known) return known;
    const value = request(remote, `/projects/${projectId(remote)}/merge_requests/${iid}/changes`).then((data) => {
      const list = Array.isArray(data?.changes) ? data.changes : [];
      return list.map((entry) => {
        const patch = entry.diff ?? "";
        const stats = diffStats(patch);
        return {
          path: entry.new_path ?? entry.old_path ?? "",
          previous: entry.renamed_file ? entry.old_path ?? null : null,
          status: entry.new_file ? "added" : entry.deleted_file ? "removed" : entry.renamed_file ? "renamed" : "modified",
          additions: stats.additions,
          deletions: stats.deletions,
          patch: patch || null
        };
      });
    });
    if (key) {
      keep(filesCache, key, value, 100);
      value.catch(() => filesCache.delete(key));
    }
    return value;
  };
  const readThreads = async (remote, iid, head, files, author) => {
    const [discussions, approvals, me] = await Promise.all([
      allPages(remote, `/projects/${projectId(remote)}/merge_requests/${iid}/discussions`).catch(() => []),
      approveState(remote, iid).catch(() => ({ approvedBy: [], review: null, requested: [] })),
      viewer(remote).catch(() => null)
    ]);
    const threads = [];
    for (const discussion of discussions) {
      const notes = (discussion.notes ?? []).filter((note) => !note.system);
      const diffNotes = notes.filter((note) => note.position);
      if (diffNotes.length === 0) continue;
      const first = diffNotes[0];
      const position = first.position ?? {};
      const path = position.new_path || position.old_path || "";
      const line = position.new_line ?? position.old_line ?? null;
      const side = position.new_line ? "RIGHT" : "LEFT";
      const file = files.find((entry) => entry.path === path || entry.previous === path);
      threads.push({
        id: String(discussion.id),
        resolved: !!discussion.resolved || diffNotes.every((note) => note.resolved),
        outdated: !!position.head_sha && position.head_sha !== head,
        path,
        line,
        side,
        comments: diffNotes.map((note) => ({
          id: String(note.id),
          author: note.author?.username ?? "ghost",
          body: String(note.body ?? ""),
          created: note.created_at ?? "",
          hunk: hunkAt(file?.patch, Number(line ?? 0), side)
        }))
      });
    }
    const reviews = (approvals.approvedBy ?? []).map((author2, index) => ({
      id: `approval-${index}-${author2}`,
      author: author2,
      state: "APPROVED",
      body: "",
      submitted: null
    }));
    return { reviews, threads, mine: !!me && !!author && me.username === author };
  };
  const remoteCommit = async (repo, sha) => {
    const [commit, diff] = await Promise.all([
      request(repo, `/projects/${projectId(repo)}/repository/commits/${sha}`),
      allPages(repo, `/projects/${projectId(repo)}/repository/commits/${sha}/diff`).catch(() => [])
    ]);
    return {
      repo: repo.path,
      sha: commit.id ?? sha,
      message: commit.message ?? commit.title ?? "",
      author: commit.author_name ?? "",
      date: commit.created_at ?? "",
      url: commit.web_url ?? `${repo.web}/-/commit/${sha}`,
      parents: (commit.parent_ids ?? []).filter(Boolean),
      files: diff.map((entry) => {
        const patch = entry.diff ?? "";
        const stats = diffStats(patch);
        return {
          path: entry.new_path ?? entry.old_path ?? "",
          previous: entry.renamed_file ? entry.old_path ?? null : null,
          status: entry.new_file ? "added" : entry.deleted_file ? "removed" : entry.renamed_file ? "renamed" : "modified",
          additions: stats.additions,
          deletions: stats.deletions,
          patch: patch || null
        };
      })
    };
  };
  const readInbox = async () => {
    const [todos, reviews, assigned, authored] = await Promise.allSettled([
      allPages(currentRemote(), "/todos", { state: "pending" }),
      searchAny(currentRemote(), "mr", "is:open reviewer:@me sort:updated-desc"),
      searchAny(currentRemote(), "issue", "is:open assignee:@me sort:updated-desc"),
      searchAny(currentRemote(), "mr", "is:open author:@me sort:updated-desc")
    ]);
    const notifications = todos.status === "fulfilled" ? todos.value.flatMap((todo) => {
      const target = todo.target ?? {};
      const project = todo.project ?? {};
      const kind = target.target_type === "MergeRequest" ? "mr" : target.target_type === "Issue" ? "issue" : "other";
      const number = target.iid ?? (target.id && kind !== "other" ? target.iid : null);
      const path = project.path_with_namespace ?? project.path ?? "";
      return [{
        thread: Number(todo.id),
        repo: path,
        number: number ? Number(number) : null,
        kind,
        title: target.title ?? String(todo.body ?? ""),
        reason: String(todo.action_name ?? "todo").replace(/_/g, " "),
        updated: todo.updated_at ?? todo.created_at ?? "",
        unread: true,
        url: number && project.web_url ? `${project.web_url}/-/${kind === "mr" ? "merge_requests" : "issues"}/${number}` : project.web_url ?? ""
      }];
    }) : [];
    const items = (result, reason) => result.status === "fulfilled" ? result.value.items.map((item) => ({
      thread: null,
      repo: item.repo,
      number: item.number,
      kind: item.kind,
      title: item.title,
      reason,
      updated: item.updated,
      unread: false,
      url: item.url
    })) : [];
    const all = [todos, reviews, assigned, authored];
    return {
      error: all.every((entry) => entry.status === "rejected") ? message2(all[0]?.status === "rejected" ? all[0].reason : "") : null,
      notifications,
      reviews: items(reviews, "review requested"),
      assigned: items(assigned, "assigned"),
      authored: items(authored, "authored")
    };
  };
  const searchAny = async (remote, kind, query, cursor = null, limit = 30) => {
    const parsed = parseSearchQuery(query, kind);
    const page = Number(cursor ?? 1) || 1;
    const path = kind === "mr" ? `/projects/${projectId(remote)}/merge_requests` : `/projects/${projectId(remote)}/issues`;
    const result = await requestPage(remote, path, {
      query: {
        ...await forViewer(remote, parsed.params),
        search: parsed.search || void 0,
        per_page: String(Math.min(100, Math.max(1, Math.floor(limit) || 30))),
        page: String(page)
      }
    });
    const data = Array.isArray(result.data) ? result.data : [];
    const headers = result.headers;
    const perPage = Math.min(100, Math.max(1, Math.floor(limit) || 30));
    const rawTotal = headers.get("x-total");
    const total = rawTotal === null ? (page - 1) * perPage + data.length : Number(rawTotal);
    const next = headers.get("x-next-page");
    const more = next === null ? data.length >= perPage : next.trim() !== "";
    return {
      total,
      items: data.map((raw) => toSearchItem(remote, raw, kind)),
      cursor: data.length > 0 && more ? next || String(page + 1) : null
    };
  };
  const forViewer = async (remote, params) => {
    if (!Object.values(params).some((value) => value === "@me")) return params;
    const me = await viewer(remote);
    return Object.fromEntries(Object.entries(params).map(([key, value]) => [key, value === "@me" ? me.username : value]));
  };
  const currentRemoteCache = {};
  const remoteCache = /* @__PURE__ */ new Map();
  const currentRemote = () => {
    const remote = currentRemoteCache.value;
    if (!remote) throw new Error("No GitLab project is selected.");
    return remote;
  };
  return {
    rememberRemote,
    remoteOf: (repo) => remoteCache.get(repo) ?? (currentRemoteCache.value?.path === repo ? currentRemoteCache.value : void 0),
    viewer,
    meta,
    changes,
    searchAny,
    search: async ({ repo, kind, query, cursor }) => {
      const remote = remoteFor(repo);
      rememberRemote(remote);
      return searchAny(remote, kind, query, cursor);
    },
    mrs: async ({ cwd, fresh, branch }, remote) => {
      if (!remote) return { error: "No GitLab remote found for this repository.", items: [] };
      rememberRemote(remote);
      try {
        const me = await viewer(remote).catch(() => null);
        const base = `/projects/${projectId(remote)}/merge_requests`;
        const results = await Promise.allSettled([
          request(remote, base, { query: { state: "opened", per_page: "50", order_by: "updated_at", sort: "desc" } }),
          me ? request(remote, base, { query: { state: "opened", author_username: me.username, per_page: "30", order_by: "updated_at", sort: "desc" } }) : Promise.resolve([]),
          branch ? request(remote, base, { query: { source_branch: branch, state: "all", per_page: "20", order_by: "updated_at", sort: "desc" } }) : Promise.resolve([])
        ]);
        const failure = results.find((result) => result.status === "rejected");
        if (results.every((result) => result.status === "rejected")) return { error: message2(failure?.reason), items: [] };
        const seen = /* @__PURE__ */ new Set();
        const items = (await Promise.all(
          results.flatMap((result) => result.status === "fulfilled" ? result.value : []).filter((raw) => !seen.has(raw.iid) && !!seen.add(raw.iid)).map((raw) => toMr(remote, raw))
        )).sort((a, b) => Number(b.state === "OPEN") - Number(a.state === "OPEN") || b.updated.localeCompare(a.updated));
        return { error: null, items };
      } catch (error) {
        return { error: message2(error), items: [] };
      }
    },
    branchMrs: async ({ names }, remote) => {
      if (!remote) return { error: "No GitLab remote found for this repository.", items: [] };
      const wanted = new Set(names.filter(Boolean));
      if (wanted.size === 0) return { error: null, items: [] };
      try {
        const all = [];
        for (let page = 1; page <= 2; page++) {
          const data = await request(remote, `/projects/${projectId(remote)}/merge_requests`, {
            query: { state: "opened", per_page: "100", page: String(page), order_by: "updated_at", sort: "desc" }
          });
          all.push(...data);
        }
        const related = await Promise.all(all.filter((raw) => wanted.has(raw.source_branch)).map((raw) => toMr(remote, raw)));
        return { error: null, items: related };
      } catch (error) {
        return { error: message2(error), items: [] };
      }
    },
    item: async ({ repo, number, kind }) => {
      const remote = remoteFor(repo);
      rememberRemote(remote);
      const known = kind;
      const mrRaw = known === "issue" ? null : await request(remote, `/projects/${projectId(remote)}/merge_requests/${number}`).catch((error) => {
        if (known === "mr") throw error;
        return null;
      });
      const isMr = !!mrRaw;
      if (!isMr && known === "mr") throw new Error(`Merge request !${number} not found.`);
      const raw = isMr ? mrRaw : await request(remote, `/projects/${projectId(remote)}/issues/${number}`);
      const [notes, approvals] = await Promise.all([
        allPages(remote, `/projects/${projectId(remote)}/${isMr ? "merge_requests" : "issues"}/${number}/notes`, { sort: "asc", order_by: "created_at" }).catch(() => []),
        isMr ? approveState(remote, number).catch(() => ({ approvedBy: [], review: null, requested: [] })) : Promise.resolve({ approvedBy: [], review: null, requested: [] })
      ]);
      const comments = notes.filter((note) => !note.system && !note.position).map(mapNote);
      const state = raw.state === "merged" ? "MERGED" : raw.state === "closed" || raw.state === "locked" ? "CLOSED" : "OPEN";
      const pipeline = raw.head_pipeline;
      const checks2 = pipeline ? [{ id: Number(pipeline.id), name: pipeline.name ?? "Pipeline", state: checkState(pipeline.status) === "failure" ? "failure" : checkState(pipeline.status) === "pending" ? "pending" : checkState(pipeline.status) === "success" ? "success" : "skipped", url: pipeline.web_url ?? raw.web_url }] : [];
      const closing = isMr ? (raw.closing_issues_count ?? 0) > 0 ? await allPages(remote, `/projects/${projectId(remote)}/merge_requests/${number}/closes_issues`).catch(() => []) : [] : [];
      const related = !isMr ? await allPages(remote, `/projects/${projectId(remote)}/issues/${number}/related_merge_requests`).catch(() => []) : [];
      const links = isMr ? closing.map((issue) => ({ repo: remote.path, number: Number(issue.iid) })) : related.map((mr) => ({ repo: remote.path, number: Number(mr.iid) }));
      const reason = state === "CLOSED" && !isMr ? deps.reasonOf(remote.path, number) : void 0;
      return {
        kind: isMr ? "mr" : "issue",
        repo: remote.path,
        number,
        title: raw.title ?? "",
        state,
        ...reason ? { reason } : {},
        draft: !!raw.draft || !!raw.work_in_progress,
        url: raw.web_url ?? `${remote.web}/-/${isMr ? "merge_requests" : "issues"}/${number}`,
        author: raw.author?.username ?? "ghost",
        body: raw.description ?? "",
        labels: (raw.labels ?? []).map((label) => typeof label === "string" ? { name: label, color: "888888" } : { name: label.name, color: label.color ?? "888888" }),
        assignees: (raw.assignees ?? []).map((user) => user.username).filter(Boolean),
        milestone: raw.milestone?.title ?? null,
        created: raw.created_at ?? "",
        updated: raw.updated_at ?? raw.created_at ?? "",
        comments,
        pr: isMr ? {
          head: raw.source_branch ?? "",
          sha: raw.diff_refs?.head_sha ?? raw.sha ?? "",
          requested: (raw.reviewers ?? []).map((user) => user.username).filter(Boolean),
          base: raw.target_branch ?? "",
          cross: raw.source_project_id !== void 0 && raw.target_project_id !== void 0 && raw.source_project_id !== raw.target_project_id,
          additions: 0,
          deletions: 0,
          files: Number.parseInt(String(raw.changes_count ?? 0), 10) || 0,
          review: approvals.review,
          mergeable: raw.detailed_merge_status ?? raw.merge_status ?? "unchecked",
          checks: checks2,
          approvedBy: approvals.approvedBy,
          sourceProject: raw.source_project_id ? String(raw.source_project_id) : void 0,
          targetProject: raw.target_project_id ? String(raw.target_project_id) : void 0,
          mergeStatus: raw.merge_status
        } : null,
        links
      };
    },
    comment: async ({ repo, number, kind, body }) => {
      const remote = remoteFor(repo);
      await change2(repo, number, () => request(remote, `/projects/${projectId(remote)}/${kind === "mr" ? "merge_requests" : "issues"}/${number}/notes`, { method: "POST", body: { body } }));
      return "";
    },
    setState: async (input) => {
      const remote = remoteFor(input.repo);
      await change2(input.repo, input.number, async () => {
        const path = `/projects/${projectId(remote)}/${input.kind === "mr" ? "merge_requests" : "issues"}/${input.number}`;
        const note = input.comment?.trim();
        if (!input.open) {
          if (note) await request(remote, `${path}/notes`, { method: "POST", body: { body: note } });
          if (input.kind === "issue" && input.reason === "duplicate" && input.duplicateOf)
            await request(remote, `${path}/notes`, { method: "POST", body: { body: `Duplicate of #${input.duplicateOf}` } });
          await request(remote, path, { method: "PUT", body: { state_event: "close" } });
        } else {
          await request(remote, path, { method: "PUT", body: { state_event: "reopen" } });
          if (note) await request(remote, `${path}/notes`, { method: "POST", body: { body: note } });
        }
      });
      if (input.kind === "issue" && !input.open) setReason(input.repo, input.number, input.reason ?? "completed");
      if (input.kind === "issue" && input.open) setReason(input.repo, input.number, void 0);
      return "";
    },
    edit: async (input) => {
      const remote = remoteFor(input.repo);
      await change2(input.repo, input.number, async () => {
        const path = `/projects/${projectId(remote)}/${input.kind === "mr" ? "merge_requests" : "issues"}/${input.number}`;
        const raw = await request(remote, path);
        const fields = {};
        if (input.title !== void 0) fields.title = input.title;
        if (input.body !== void 0) fields.description = input.body;
        const currentLabels = (raw.labels ?? []).map((label) => typeof label === "string" ? label : label.name);
        if (input.addLabels.length > 0 || input.removeLabels.length > 0) {
          fields.labels = labelList([.../* @__PURE__ */ new Set([...currentLabels.filter((label) => !input.removeLabels.includes(label)), ...input.addLabels])]);
        }
        const currentAssignees = (raw.assignees ?? []).map((user) => Number(user.id));
        if (input.addAssignees.length > 0 || input.removeAssignees.length > 0) {
          const add = await userIds(remote, input.addAssignees);
          const remove = new Set(await userIds(remote, input.removeAssignees));
          fields.assignee_ids = [.../* @__PURE__ */ new Set([...currentAssignees.filter((id) => !remove.has(id)), ...add])];
        }
        if (input.kind === "mr") {
          const currentReviewers = (raw.reviewers ?? []).map((user) => Number(user.id));
          if (input.addReviewers.length > 0 || input.removeReviewers.length > 0) {
            const add = await userIds(remote, input.addReviewers);
            const remove = new Set(await userIds(remote, input.removeReviewers));
            fields.reviewer_ids = [.../* @__PURE__ */ new Set([...currentReviewers.filter((id) => !remove.has(id)), ...add])];
          }
        }
        if (input.milestone !== void 0) {
          if (input.milestone === null) fields.milestone_id = 0;
          else fields.milestone_id = await milestoneId(remote, input.milestone);
        }
        if (Object.keys(fields).length > 0) await request(remote, path, { method: "PUT", body: fields });
      });
      return "";
    },
    setDraft: async ({ repo, number, draft }) => {
      const remote = remoteFor(repo);
      await change2(repo, number, async () => {
        const path = `/projects/${projectId(remote)}/merge_requests/${number}`;
        const raw = await request(remote, path);
        const title = String(raw.title ?? "");
        const next = draft ? /^(?:draft:|wip:)\s*/i.test(title) ? title : `Draft: ${title}` : title.replace(/^(?:draft:|wip:)\s*/i, "");
        await request(remote, path, { method: "PUT", body: { title: next } });
      });
      return "";
    },
    repoMeta: async ({ repo }) => {
      const remote = remoteFor(repo);
      return meta(remote);
    },
    remoteCommit: async ({ repo, sha }) => remoteCommit(remoteFor(repo), sha),
    files: async ({ repo, number, head }) => changes(remoteFor(repo), number, head),
    reviews: async ({ repo, number }) => {
      const remote = remoteFor(repo);
      const item = await request(remote, `/projects/${projectId(remote)}/merge_requests/${number}`);
      const head = item.diff_refs?.head_sha ?? item.sha ?? "";
      const key = `${apiBaseOf(remote)}/${remote.path}!${number}@${head}`;
      const cached = threadsCache.get(key);
      if (cached && Date.now() - cached.at < THREADS_TTL) return cached.value;
      const value = changes(remote, number, head).then((files) => readThreads(remote, number, head, files, item.author?.username));
      keep(threadsCache, key, { at: Date.now(), value }, 50);
      value.catch(() => threadsCache.delete(key));
      return value;
    },
    submitReview: async ({ repo, number, event, body }) => {
      const remote = remoteFor(repo);
      await change2(repo, number, async () => {
        const path = `/projects/${projectId(remote)}/merge_requests/${number}`;
        if (event === "REQUEST_CHANGES") {
          await request(remote, `${path}/unapprove`, { method: "POST" }).catch(() => void 0);
          await request(remote, `${path}/notes`, { method: "POST", body: { body: body.trim() ? `**Changes requested**

${body}` : "**Changes requested.**" } });
        } else {
          if (body.trim()) await request(remote, `${path}/notes`, { method: "POST", body: { body } });
          if (event === "APPROVE") await request(remote, `${path}/approve`, { method: "POST" });
        }
      });
      return "";
    },
    replyThread: async ({ repo, number, thread, body }) => {
      const remote = remoteFor(repo);
      await change2(
        repo,
        number,
        () => request(remote, `/projects/${projectId(remote)}/merge_requests/${number}/discussions/${thread}/notes`, { method: "POST", body: { body } })
      );
      return "";
    },
    resolveThread: async ({ repo, number, thread, resolved }) => {
      const remote = remoteFor(repo);
      await change2(
        repo,
        number,
        () => request(remote, `/projects/${projectId(remote)}/merge_requests/${number}/discussions/${thread}`, {
          method: "PUT",
          query: { resolved: String(resolved) }
        })
      );
      return "";
    },
    lineComment: async (input) => {
      const remote = remoteFor(input.repo);
      await change2(input.repo, input.number, async () => {
        const mr = await request(remote, `/projects/${projectId(remote)}/merge_requests/${input.number}`);
        const refs = mr.diff_refs ?? {};
        const position = {
          position_type: "text",
          base_sha: refs.base_sha,
          start_sha: refs.start_sha,
          head_sha: input.sha || refs.head_sha,
          new_path: input.path,
          old_path: input.path,
          ...input.side === "RIGHT" ? { new_line: input.line } : { old_line: input.line }
        };
        await request(remote, `/projects/${projectId(remote)}/merge_requests/${input.number}/discussions`, {
          method: "POST",
          body: { body: input.body, position }
        });
      });
      return "";
    },
    createReview: async (input) => {
      const remote = remoteFor(input.repo);
      return change2(input.repo, input.number, async () => {
        const path = `/projects/${projectId(remote)}/merge_requests/${input.number}`;
        const mr = await request(remote, path);
        const refs = mr.diff_refs ?? {};
        const head = input.sha || refs.head_sha;
        const key = `${remote.path}!${input.number}@${head}`;
        const posted = postedCache.get(key) ?? /* @__PURE__ */ new Set();
        keep(postedCache, key, posted, 50);
        const once = async (stamp, send) => {
          if (posted.has(stamp)) return;
          await send();
          posted.add(stamp);
        };
        for (const comment of input.comments) {
          const position = {
            position_type: "text",
            base_sha: refs.base_sha,
            start_sha: refs.start_sha,
            head_sha: head,
            new_path: comment.path,
            old_path: comment.path,
            // GitLab REST positions carry one line, so a range comment lands on its last line.
            ...comment.side === "RIGHT" ? { new_line: comment.line } : { old_line: comment.line }
          };
          await once(`${comment.path}\0${comment.side}\0${comment.line}\0${comment.body}`, () => request(remote, `${path}/discussions`, { method: "POST", body: { body: comment.body, position } }));
        }
        if (input.event === "REQUEST_CHANGES") {
          await request(remote, `${path}/unapprove`, { method: "POST" }).catch(() => void 0);
          await once(`note\0${input.body}`, () => request(remote, `${path}/notes`, { method: "POST", body: { body: input.body.trim() ? `**Changes requested**

${input.body}` : "**Changes requested.**" } }));
        } else {
          if (input.body.trim()) await once(`note\0${input.body}`, () => request(remote, `${path}/notes`, { method: "POST", body: { body: input.body } }));
          if (input.event === "APPROVE") await once("approve", () => request(remote, `${path}/approve`, { method: "POST" }));
        }
        postedCache.delete(key);
        return mr.web_url ?? `${remote.web}/-/merge_requests/${input.number}`;
      });
    },
    runs: async ({ repo, branch, fresh }) => {
      const remote = remoteFor(repo);
      const key = `${remote.path}
${branch ?? ""}`;
      const cached = runsCache.get(key);
      if (!fresh && cached && Date.now() - cached.at < RUNS_TTL) return cached.value;
      const value = request(remote, `/projects/${projectId(remote)}/pipelines`, {
        query: { ref: branch ?? void 0, per_page: "30", order_by: "updated_at", sort: "desc" }
      }).then((data) => data.map((raw) => toRun(remote, raw)));
      keep(runsCache, key, { at: Date.now(), value }, 50);
      value.catch(() => runsCache.delete(key));
      return value;
    },
    run: async ({ repo, id }) => {
      const remote = remoteFor(repo);
      const key = `${remote.path}#${id}`;
      const done = finishedCache.get(key);
      if (done) return done;
      const [pipeline, jobs] = await Promise.all([
        request(remote, `/projects/${projectId(remote)}/pipelines/${id}`),
        allPages(remote, `/projects/${projectId(remote)}/pipelines/${id}/jobs`).catch(() => [])
      ]);
      const details = {
        run: toRun(remote, pipeline),
        jobs: jobs.map((job) => toJob(remote, job))
      };
      if (["success", "failed", "canceled", "skipped"].includes(String(pipeline.status))) keep(finishedCache, key, Promise.resolve(details), 50);
      return details;
    },
    jobLog: async ({ repo, job }) => {
      const remote = remoteFor(repo);
      const key = `${remote.path}#${job}`;
      const known = logsCache.get(key);
      if (known) return known;
      const token = await resolveToken(remote.host);
      let raw = "";
      if (token) {
        const response = await fetch(`${apiBaseOf(remote)}/projects/${projectId(remote)}/jobs/${job}/trace`, { headers: headersFor(token) });
        raw = await response.text();
        if (!response.ok) throw new Error(gitlabError(`jobs/${job}/trace`, response.status, response.statusText, raw));
      } else {
        raw = await run("glab", ["api", "--hostname", remote.host, `/projects/${projectId(remote)}/jobs/${job}/trace`], homedir2(), { quiet: true });
      }
      const output = raw.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").replace(/\u001b\[[0-9;?]*[A-Za-z]/g, "").replace(/^section_(?:start|end):\d+:[^\n]*\n?/gm, "");
      const text = output.length > LOG_LIMIT ? `\u2026 (${Math.round((output.length - LOG_LIMIT) / 1024)} KB earlier output omitted)
${output.slice(-LOG_LIMIT)}` : output;
      const finished = await request(remote, `/projects/${projectId(remote)}/jobs/${job}`).catch(() => null);
      if (finished && ["success", "failed", "canceled", "skipped"].includes(String(finished.status))) keep(logsCache, key, Promise.resolve(text), 20);
      return text;
    },
    rerun: async ({ repo, id }) => {
      const remote = remoteFor(repo);
      finishedCache.delete(`${remote.path}#${id}`);
      try {
        await request(remote, `/projects/${projectId(remote)}/pipelines/${id}/retry`, { method: "POST" });
        return "";
      } finally {
        runsCache.clear();
        deps.runChanged(remote.path, id);
      }
    },
    cancelRun: async ({ repo, id }) => {
      const remote = remoteFor(repo);
      try {
        await request(remote, `/projects/${projectId(remote)}/pipelines/${id}/cancel`, { method: "POST" });
        return "";
      } finally {
        runsCache.clear();
        deps.runChanged(remote.path, id);
      }
    },
    retryJob: async ({ repo, job }) => {
      const remote = remoteFor(repo);
      logsCache.delete(`${remote.path}#${job}`);
      await request(remote, `/projects/${projectId(remote)}/jobs/${job}/retry`, { method: "POST" });
      return "";
    },
    cancelJob: async ({ repo, job }) => {
      const remote = remoteFor(repo);
      await request(remote, `/projects/${projectId(remote)}/jobs/${job}/cancel`, { method: "POST" });
      return "";
    },
    inbox: async ({ fresh }) => {
      if (!fresh && inboxCache.value && Date.now() - inboxCache.at < INBOX_TTL) return inboxCache.value;
      const value = readInbox();
      inboxCache.value = value;
      inboxCache.at = Date.now();
      return value;
    },
    markRead: async ({ thread }) => {
      const remote = currentRemote();
      try {
        await request(remote, thread ? `/todos/${thread}/mark_as_done` : "/todos/mark_all_as_done", { method: "POST" });
        return "";
      } finally {
        inboxCache.at = 0;
        deps.inboxChanged();
      }
    },
    createIssue: async ({ remote, title, body }) => {
      const raw = await request(remote, `/projects/${projectId(remote)}/issues`, { method: "POST", body: { title, description: body } });
      return raw.web_url ?? "";
    },
    createMergeRequest: async ({ repo, source, title, body, base, draft, removeSource }) => {
      const remote = remoteFor(repo);
      const raw = await request(remote, `/projects/${projectId(remote)}/merge_requests`, {
        method: "POST",
        body: {
          source_branch: source,
          target_branch: base,
          title: draft ? /^(?:draft:|wip:)/i.test(title) ? title : `Draft: ${title}` : title,
          description: body,
          remove_source_branch: removeSource
        }
      });
      return raw.web_url ?? `${remote.web}/-/merge_requests/${raw.iid}`;
    },
    mergeMr: async ({ repo, number, squash, deleteBranch }) => {
      const remote = remoteFor(repo);
      await change2(
        repo,
        number,
        () => request(remote, `/projects/${projectId(remote)}/merge_requests/${number}/merge`, {
          method: "PUT",
          body: { squash, should_remove_source_branch: deleteBranch }
        })
      );
      deps.itemChanged(remote.path, number);
      return "";
    },
    raw: { request, projectId, viewer, approveState },
    addComment: async (repo, number, body, kind) => {
      const remote = remoteFor(repo);
      const path = `/projects/${projectId(remote)}/${kind === "issue" ? "issues" : "merge_requests"}/${number}/notes`;
      return change2(repo, number, async () => {
        const note = await request(remote, path, { method: "POST", body: { body } });
        return { id: Number(note.id), url: `${remote.web}/-/${kind === "issue" ? "issues" : "merge_requests"}/${number}#note_${note.id}` };
      });
    },
    deleteComment: async (repo, number, id, kind) => {
      const remote = remoteFor(repo);
      await change2(
        repo,
        number,
        () => request(remote, `/projects/${projectId(remote)}/${kind === "issue" ? "issues" : "merge_requests"}/${number}/notes/${id}`, { method: "DELETE" })
      );
    },
    itemsInfo: async (repo, numbers, kind) => {
      const remote = remoteFor(repo);
      const output = /* @__PURE__ */ new Map();
      await Promise.all(
        [...new Set(numbers)].filter((number) => Number.isSafeInteger(number) && number > 0).map(async (number) => {
          const mr = kind === "issue" ? { status: "rejected" } : await request(remote, `/projects/${projectId(remote)}/merge_requests/${number}`).then((value) => ({ status: "fulfilled", value }), () => ({ status: "rejected" }));
          const issue = kind === "mr" || mr.status === "fulfilled" ? { status: "rejected" } : await request(remote, `/projects/${projectId(remote)}/issues/${number}`).then((value) => ({ status: "fulfilled", value }), () => ({ status: "rejected" }));
          const raw = mr.status === "fulfilled" ? mr.value : issue.status === "fulfilled" ? issue.value : null;
          if (!raw) return;
          const isMr = mr.status === "fulfilled";
          output.set(number, {
            item: isMr ? "mr" : "issue",
            title: raw.title ?? "",
            state: raw.state === "merged" ? "MERGED" : raw.state === "closed" || raw.state === "locked" ? "CLOSED" : "OPEN",
            reason: isMr ? null : deps.reasonOf(remote.path, number) ?? null,
            labels: (raw.labels ?? []).map((label) => typeof label === "string" ? label : label.name),
            assignees: (raw.assignees ?? []).map((user) => user.username)
          });
        })
      );
      return output;
    },
    editPeople: async (repo, number, kind, add, remove, itemKind) => {
      const remote = remoteFor(repo);
      await change2(repo, number, async () => {
        const path = `/projects/${projectId(remote)}/${itemKind === "issue" ? "issues" : "merge_requests"}/${number}`;
        if (kind === "labels") {
          const raw = await request(remote, path);
          const current = (raw.labels ?? []).map((label) => typeof label === "string" ? label : label.name);
          const labels = [.../* @__PURE__ */ new Set([...current.filter((label) => !remove.includes(label)), ...add])];
          await request(remote, path, { method: "PUT", body: { labels: labelList(labels) } });
        } else {
          const raw = await request(remote, path);
          const current = (raw.assignees ?? []).map((user) => Number(user.id));
          const addIds = await userIds(remote, add);
          const removeIds = new Set(await userIds(remote, remove));
          await request(remote, path, { method: "PUT", body: { assignee_ids: [.../* @__PURE__ */ new Set([...current.filter((id) => !removeIds.has(id)), ...addIds])] } });
        }
      });
    },
    closeItem: async (repo, number, kind, reason, duplicateOf) => {
      const remote = remoteFor(repo);
      return change2(repo, number, async () => {
        const path = `/projects/${projectId(remote)}/${kind === "issue" ? "issues" : "merge_requests"}/${number}`;
        const duplicate = kind === "issue" && reason === "duplicate" && duplicateOf ? await request(remote, `${path}/notes`, { method: "POST", body: { body: `Duplicate of #${duplicateOf}` } }) : void 0;
        await request(remote, path, { method: "PUT", body: { state_event: "close" } });
        if (kind === "issue") setReason(repo, number, reason);
        return duplicate ? { commentId: Number(duplicate.id), url: `${remote.web}/-/issues/${number}#note_${duplicate.id}` } : {};
      });
    },
    reopenItem: async (repo, number, kind) => {
      const remote = remoteFor(repo);
      return change2(repo, number, async () => {
        await request(remote, `/projects/${projectId(remote)}/${kind === "issue" ? "issues" : "merge_requests"}/${number}`, { method: "PUT", body: { state_event: "reopen" } });
        if (kind === "issue") setReason(repo, number, void 0);
        return {};
      });
    },
    viewerName: async (repo) => {
      const remote = remoteFor(repo);
      return (await viewer(remote)).username;
    },
    checkin: async () => {
      const remote = currentRemoteCache.value;
      if (!remote) return "No GitLab project selected.";
      await viewer(remote);
      return "";
    }
  };
  function setReason(repo, number, reason) {
    deps.setReason(repo, number, reason);
  }
  function remoteFor(repo) {
    const cached = remoteCache.get(repo);
    if (cached) return cached;
    const configured = deps.config.project && deps.config.project === repo ? { name: "origin", host: deps.config.host ?? new URL(apiBaseGuess(deps.config)).host, path: repo, owner: repo.split("/").slice(0, -1).join("/"), repo: repo.split("/").pop() ?? "", web: `${apiBaseGuess(deps.config)}/${repo}`, apiBase: apiBaseGuess(deps.config), scheme: "https" } : void 0;
    if (configured) return configured;
    const current = currentRemoteCache.value;
    if (current && current.path === repo) return current;
    if (current && /^[\w.-]+(?:\/[\w.-]+)+$/.test(repo)) {
      const owner = repo.split("/").slice(0, -1).join("/");
      return { ...current, path: repo, owner, repo: repo.split("/").pop() ?? "", web: `${apiBaseGuess({ apiBase: current.apiBase })}/${repo}` };
    }
    throw new Error(`No GitLab remote is known for ${repo}. Open the panel in that repository first.`);
  }
  function rememberRemote(remote) {
    currentRemoteCache.value = remote;
    remoteCache.set(remote.path, remote);
  }
  async function userIds(remote, names) {
    const me = names.includes("@me") ? await viewer(remote) : null;
    const members = await allPages(remote, `/projects/${projectId(remote)}/members/all`).then(
      (list) => list,
      () => void 0
    );
    const ids = [];
    for (const name2 of names) {
      if (name2 === "@me") {
        if (!me) throw new Error("Could not read the signed-in GitLab user.");
        ids.push(me.id);
        continue;
      }
      const wanted = name2.replace(/^@/, "").toLowerCase();
      const member = members?.find((entry) => String(entry.username).toLowerCase() === wanted);
      if (member) {
        ids.push(Number(member.id));
        continue;
      }
      const user = (await allPages(remote, "/users", { username: wanted }).catch(() => [])).find(
        (entry) => String(entry.username).toLowerCase() === wanted
      );
      if (!user) throw new Error(`GitLab has no user "@${wanted}".`);
      if (members) throw new Error(`"@${wanted}" is not a member of this project, so it cannot be assigned.`);
      ids.push(Number(user.id));
    }
    return ids;
  }
  async function milestoneId(remote, title) {
    const list = await allPages(remote, `/projects/${projectId(remote)}/milestones`, { search: title }).catch(() => []);
    const found = list.find((entry) => entry.title === title);
    if (!found) throw new Error(`This project has no milestone "${title}".`);
    return Number(found.id);
  }
  async function change2(repo, number, work) {
    const key = `${repo}#${number}`;
    const queued = writes.get(key) ?? Promise.resolve();
    const next = queued.then(work, work);
    keep(writes, key, next.catch(() => void 0), 100);
    try {
      return await next;
    } finally {
      filesCache.forEach((_, entry) => {
        if (entry.includes(`/${repo}!${number}@`)) filesCache.delete(entry);
      });
      threadsCache.forEach((_, entry) => {
        if (entry.includes(`/${repo}!${number}@`)) threadsCache.delete(entry);
      });
      deps.itemChanged(repo, number);
    }
  }
}
function toRun(remote, raw) {
  return {
    id: Number(raw.id),
    title: raw.name ?? raw.ref ?? `Pipeline ${raw.id}`,
    workflow: raw.name ?? "Pipeline",
    status: String(raw.status ?? "unknown"),
    conclusion: String(raw.status ?? ""),
    branch: raw.ref ?? "",
    event: raw.source ?? "push",
    sha: raw.sha ?? "",
    created: raw.created_at ?? "",
    url: raw.web_url ?? `${remote.web}/-/pipelines/${raw.id}`,
    attempt: 1
  };
}
function toJob(remote, raw) {
  return {
    id: Number(raw.id),
    name: raw.name ?? "",
    status: String(raw.status ?? ""),
    conclusion: String(raw.status ?? ""),
    started: raw.started_at ?? null,
    completed: raw.finished_at ?? null,
    steps: [],
    stage: raw.stage ?? "",
    allowFailure: !!raw.allow_failure,
    webUrl: raw.web_url ?? `${remote.web}/-/jobs/${raw.id}`
  };
}
function emptyInbox() {
  return { error: null, notifications: [], reviews: [], assigned: [], authored: [] };
}
function apiBaseOf(remote) {
  const base = (remote.apiBase || `https://${remote.host}`).replace(/\/$/, "");
  return base.endsWith("/api/v4") ? base : `${base}/api/v4`;
}
function apiBaseGuess(config) {
  return (config.apiBase || `https://${config.host ?? "gitlab.com"}`).replace(/\/$/, "").replace(/\/api\/v4$/, "");
}
function gitlabError(path, status, statusText2, text, retryAfter) {
  let detail = text;
  try {
    const parsed = JSON.parse(text);
    detail = typeof parsed.message === "string" ? parsed.message : typeof parsed.error === "string" ? parsed.error : text;
  } catch {
  }
  if (status === 401) return "GitLab rejected the token. Set GITLAB_TOKEN (a personal access token with api scope) or run `glab auth login`.";
  if (status === 404) return `GitLab: ${detail.slice(0, 500) || statusText2} (HTTP 404)`;
  return `GitLab: ${detail.slice(0, 500) || statusText2} (HTTP ${status})${retryAfter === void 0 ? "" : ` retry-after: ${retryAfter}`}`;
}
function retryAfterOf(headers) {
  const after = headers.get("retry-after");
  if (after) {
    const seconds = Number(after);
    if (Number.isFinite(seconds) && seconds > 0) return Math.ceil(seconds);
    const at = Date.parse(after);
    if (Number.isFinite(at)) return Math.max(1, Math.ceil((at - Date.now()) / 1e3));
  }
  const reset = Number(headers.get("ratelimit-reset"));
  if (Number.isFinite(reset) && reset > 0) return Math.max(1, Math.ceil(reset - Date.now() / 1e3));
  return void 0;
}
async function readGlabToken(host) {
  const paths = [
    process.env.GLAB_CONFIG_DIR ? join3(process.env.GLAB_CONFIG_DIR, "config.yml") : "",
    process.env.APPDATA ? join3(process.env.APPDATA, "glab-cli", "config.yml") : "",
    process.env.XDG_CONFIG_HOME ? join3(process.env.XDG_CONFIG_HOME, "glab-cli", "config.yml") : "",
    join3(homedir2(), ".config", "glab-cli", "config.yml"),
    join3(homedir2(), ".config", "glab-cli", "config.yaml")
  ].filter(Boolean);
  for (const path of paths) {
    const text = await readFile2(path, "utf8").catch(() => void 0);
    if (!text) continue;
    const token = parseGlabToken(text, host);
    if (token) return token;
  }
  return null;
}
function parseGlabToken(text, host) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  let hosts = false;
  let hostIndent = -1;
  let currentHost = "";
  let token = null;
  let currentIndent = -1;
  const flush = () => {
    if (token && (!host || currentHost === host || currentHost.startsWith(`${host}:`))) return token;
    token = null;
  };
  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const indent = line.length - line.trimStart().length;
    if (/^\s*hosts:\s*$/.test(line)) {
      hosts = true;
      hostIndent = indent;
      continue;
    }
    if (!hosts) continue;
    if (indent <= hostIndent && /^\S/.test(line)) {
      const found = flush();
      if (found) return found;
      hosts = false;
      continue;
    }
    const hostMatch = /^\s{2,}["']?([^"':]+)["']?:\s*$/.exec(line);
    if (hostMatch && indent <= hostIndent + 2) {
      const found = flush();
      if (found) return found;
      currentHost = hostMatch[1]?.trim() ?? "";
      currentIndent = indent;
      continue;
    }
    const tokenMatch = /^\s+token:\s*["']?([^"'\s#]+)/.exec(line);
    if (tokenMatch && currentHost) token = tokenMatch[1] ?? null;
  }
  return flush();
}
function message2(reason) {
  return reason instanceof Error ? reason.message : String(reason);
}

// src/host/store.ts
import { mkdir, readFile as readFile3, rename, writeFile } from "node:fs/promises";
import { homedir as homedir3 } from "node:os";
import { dirname as dirname2, join as join4 } from "node:path";
var KEEP = 500;
var REASON_KEEP = 2e3;
function createStore(log) {
  const home = process.env.DSH_HOME || join4(homedir3(), ".dsh");
  const file = join4(home, "gitlab-panel", "state.json");
  let loaded;
  let lock = Promise.resolve();
  const read = () => {
    loaded ??= readFile3(file, "utf8").then((text) => {
      const parsed = text.trim() ? JSON.parse(text) : {};
      return {
        queues: parsed.queues && typeof parsed.queues === "object" ? parsed.queues : {},
        reasons: parsed.reasons && typeof parsed.reasons === "object" ? parsed.reasons : {},
        drafts: parsed.drafts && typeof parsed.drafts === "object" ? parsed.drafts : {}
      };
    }).catch((error) => {
      if (error.code !== "ENOENT") log("warn", "could not read the GitLab panel state; starting empty", { error: error.message, file });
      return { queues: {}, reasons: {}, drafts: {} };
    });
    return loaded;
  };
  const write = async (state) => {
    await mkdir(dirname2(file), { recursive: true });
    const temporary = `${file}.${process.pid}.tmp`;
    await writeFile(temporary, JSON.stringify(state, null, 0), { encoding: "utf8", mode: 384 });
    await rename(temporary, file);
  };
  const mutate = (work) => {
    const next = lock.then(async () => {
      const state = await read();
      const result = await work(state);
      trim(state);
      await write(state);
      return result;
    });
    lock = next.catch(() => void 0);
    return next;
  };
  const trim = (state) => {
    for (const queue of Object.values(state.queues)) {
      const finished = queue.actions.filter((action) => ["done", "failed", "skipped", "undone"].includes(action.status));
      if (finished.length <= KEEP) continue;
      const drop = new Set(finished.slice(0, finished.length - KEEP).map((action) => action.id));
      queue.actions = queue.actions.filter((action) => !drop.has(action.id));
    }
    const reasons = Object.entries(state.reasons);
    if (reasons.length > REASON_KEEP) state.reasons = Object.fromEntries(reasons.slice(reasons.length - REASON_KEEP));
  };
  return {
    file,
    read,
    mutate,
    reasonOf: async (repo, number) => (await read()).reasons[`${repo}#${number}`],
    setReason: (repo, number, reason) => mutate((state) => {
      const key = `${repo}#${number}`;
      if (reason) state.reasons[key] = reason;
      else delete state.reasons[key];
    })
  };
}

// src/host/index.ts
var name = "gitlab-panel";
var inject = ["webServer", "tools"];
var ROUTE = "/gitlab-panel";
var MAX_BODY3 = 32 * 1024 * 1024;
function apply(ctx, config = {}) {
  const log = (level, message3, data) => {
    const line = `[gitlab-panel] ${message3}`;
    if (level === "error") console.error(line, data ?? "");
    else if (level === "warn") console.warn(line, data ?? "");
  };
  const store = createStore(log);
  const listeners = /* @__PURE__ */ new Set();
  const broadcast = (event) => {
    const payload = `data: ${JSON.stringify(event)}

`;
    for (const response of listeners) {
      try {
        response.write(payload);
      } catch {
        listeners.delete(response);
      }
    }
  };
  const git = createGit({
    log,
    emitChanged: (event) => broadcast({ type: "changed", ...event }),
    host: config.host || process.env.GITLAB_HOST,
    project: config.project || process.env.GITLAB_PROJECT,
    apiBase: config.apiBase || process.env.GITLAB_API_BASE || process.env.GITLAB_URL,
    defaultBranch: config.defaultBranch
  });
  const reasonCache = /* @__PURE__ */ new Map();
  void store.read().then((state) => {
    for (const [key, value] of Object.entries(state.reasons)) reasonCache.set(key, value);
  });
  const gitlab = createGitLab({
    log,
    config: {
      token: config.token,
      tokenEnv: config.tokenEnv,
      host: config.host || process.env.GITLAB_HOST,
      project: config.project || process.env.GITLAB_PROJECT,
      apiBase: config.apiBase || process.env.GITLAB_API_BASE || process.env.GITLAB_URL
    },
    reasonOf: (repo, number) => reasonCache.get(`${repo}#${number}`),
    setReason: (repo, number, reason) => {
      const key = `${repo}#${number}`;
      if (reason) reasonCache.set(key, reason);
      else reasonCache.delete(key);
      void store.setReason(repo, number, reason);
    },
    itemChanged: (repo, number) => broadcast({ type: "item", repo, number }),
    runChanged: (repo, id) => broadcast({ type: "run", repo, id }),
    inboxChanged: () => broadcast({ type: "inbox" })
  });
  const agent = createAgent({ ctx, store, git, gitlab, log, emit: broadcast });
  const overview = async (params) => {
    const result = await git.overview(params);
    if (!result) return null;
    if (!result.remote) {
      result.gitlab = "No GitLab remote found for this repository. Add one, or set GITLAB_PROJECT.";
      return result;
    }
    gitlab.rememberRemote(result.remote);
    try {
      await gitlab.viewer(result.remote);
      result.gitlab = null;
    } catch (error) {
      result.gitlab = error instanceof Error ? error.message : String(error);
    }
    return result;
  };
  const withRemote = async (cwd) => {
    const remote = await git.remote(cwd);
    if (remote) gitlab.rememberRemote(remote);
    return remote;
  };
  const api = {
    ...agent.methods,
    overview,
    mrs: async ({ cwd, fresh }) => {
      const remote = await withRemote(cwd);
      const branch = await git.currentBranch(cwd).catch(() => null);
      return gitlab.mrs({ cwd, fresh, branch }, remote);
    },
    branchMrs: async ({ cwd, names, fresh }) => {
      const remote = await withRemote(cwd);
      return gitlab.branchMrs({ names }, remote);
    },
    createIssue: async ({ cwd, title, body }) => {
      const remote = await withRemote(cwd);
      if (!remote) throw new Error("No GitLab remote found for this repository.");
      return gitlab.createIssue({ remote, title, body });
    },
    createMr: async ({ cwd, title, body, base, draft }) => {
      const remote = await withRemote(cwd);
      if (!remote) throw new Error("No GitLab remote found for this repository.");
      return git.mutate(cwd, async () => {
        const source = await git.ensurePushed(cwd);
        return gitlab.createMergeRequest({ repo: remote.path, source, title, body, base, draft, removeSource: false });
      }, true);
    },
    checkoutMr: async ({ cwd, repo, number }) => {
      const item = await gitlab.item({ repo, number, kind: "mr" });
      if (!item.pr) throw new Error(`${repo}!${number} is not a merge request.`);
      const output = await git.checkoutMrs({ cwd, mr: { number, head: item.pr.head } });
      broadcast({ type: "changed", cwd, remote: true });
      return output;
    },
    mergeMr: async ({ repo, number, squash, deleteBranch }) => {
      const result = await gitlab.mergeMr({ repo, number, squash, deleteBranch });
      broadcast({ type: "item", repo, number, state: "MERGED" });
      return result;
    },
    inbox: async ({ fresh }) => {
      try {
        return await gitlab.inbox({ fresh });
      } catch (error) {
        return { error: error instanceof Error ? error.message : String(error), notifications: [], reviews: [], assigned: [], authored: [] };
      }
    },
    reasonOf: async ({ repo, number }) => store.reasonOf(repo, number)
  };
  const gitMethods = [
    "log",
    "show",
    "branches",
    "mergedBranches",
    "outgoing",
    "diff",
    "mrDefaults",
    "stage",
    "unstage",
    "discard",
    "commit",
    "checkout",
    "createBranch",
    "deleteBranch",
    "deleteBranches",
    "undoCommit",
    "deleteRemoteBranch",
    "merge",
    "rebase",
    "cherryPick",
    "revert",
    "abort",
    "continue",
    "fetch",
    "pull",
    "push",
    "pushBranch",
    "stash",
    "stashPop",
    "worktreeAdd",
    "worktreeRemove"
  ];
  for (const method of gitMethods) api[method] = (params) => git[method](params);
  const gitlabMethods = [
    "search",
    "item",
    "comment",
    "setState",
    "edit",
    "setDraft",
    "repoMeta",
    "remoteCommit",
    "files",
    "reviews",
    "submitReview",
    "replyThread",
    "resolveThread",
    "lineComment",
    "createReview",
    "runs",
    "run",
    "jobLog",
    "rerun",
    "cancelRun",
    "retryJob",
    "cancelJob",
    "markRead"
  ];
  for (const method of gitlabMethods) api[method] = (params) => gitlab[method](params);
  const allowed = new Set(Object.keys(api));
  const reject = (req, res) => {
    const connection = ctx.get?.("connection");
    if (!connection?.requestRejection) return false;
    const status = connection.requestRejection(req);
    if (status === void 0) return false;
    res.statusCode = status;
    res.end();
    return true;
  };
  const sendJson = (res, status, value) => {
    res.statusCode = status;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.setHeader("cache-control", "no-store");
    res.end(JSON.stringify(value));
  };
  const readBody = (req) => new Promise((resolve2, rejectBody) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY3) {
        rejectBody(new Error("Request body is too large."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve2(Buffer.concat(chunks).toString("utf8")));
    req.on("error", rejectBody);
  });
  const handler = async (req, res) => {
    if (reject(req, res)) return;
    const url = new URL(req.url ?? "/", "http://localhost");
    const path = url.pathname.replace(/\/+$/, "");
    if (path === `${ROUTE}/events` || path === `${ROUTE}/events/`) {
      if (req.method !== "GET") return sendJson(res, 405, { error: "GET only." });
      res.statusCode = 200;
      res.setHeader("content-type", "text/event-stream; charset=utf-8");
      res.setHeader("cache-control", "no-cache, no-transform");
      res.setHeader("connection", "keep-alive");
      res.setHeader("x-accel-buffering", "no");
      res.write(`data: ${JSON.stringify({ type: "hello", version: 1 })}

`);
      listeners.add(res);
      const keep2 = setInterval(() => {
        try {
          res.write(": keepalive\n\n");
        } catch {
          clearInterval(keep2);
          listeners.delete(res);
        }
      }, 2e4);
      const close = () => {
        clearInterval(keep2);
        listeners.delete(res);
      };
      req.on("close", close);
      req.on("error", close);
      return;
    }
    if (path === `${ROUTE}/status`) {
      return sendJson(res, 200, { ok: true, plugin: name, version: 1, methods: [...allowed].length });
    }
    if (path !== `${ROUTE}/api`) return sendJson(res, 404, { error: "Not found." });
    if (req.method !== "POST") return sendJson(res, 405, { error: "POST only." });
    if (!/^application\/json\b/i.test(String(req.headers["content-type"] ?? ""))) return sendJson(res, 415, { error: "Content-Type must be application/json." });
    let body;
    try {
      body = JSON.parse(await readBody(req));
    } catch (error) {
      return sendJson(res, 400, { error: error instanceof Error ? error.message : "Invalid JSON." });
    }
    const method = typeof body.method === "string" ? body.method : "";
    if (!allowed.has(method)) return sendJson(res, 404, { error: `Unknown method "${method}".` });
    const params = body.params && typeof body.params === "object" && !Array.isArray(body.params) ? body.params : {};
    try {
      const value = await api[method]?.(params);
      return sendJson(res, 200, { ok: true, value });
    } catch (error) {
      const message3 = error instanceof Error ? error.message : String(error);
      log("warn", `${method} failed`, { error: message3 });
      return sendJson(res, 200, { ok: false, error: message3 });
    }
  };
  ctx.effect(() => ctx.webServer.register({ kind: "prefix", path: ROUTE, handler }), "gitlab-panel: API route");
  ctx.effect(() => {
    const stop = agent.start();
    return () => {
      stop();
      for (const response of listeners) {
        try {
          response.end();
        } catch {
        }
      }
      listeners.clear();
    };
  }, "gitlab-panel: agent tools");
  log("info", "loaded", { route: ROUTE, state: store.file });
}
var index_default = { name, inject, apply };
export {
  apply,
  index_default as default,
  inject,
  name
};
