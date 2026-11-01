import { useSyncExternalStore } from "react"

type Lang = "en" | "zh"
const KEY = "dsh-gitlab-panel.lang"

const listeners = new Set<() => void>()

function detect(): Lang {
  try {
    const stored = localStorage.getItem(KEY)
    if (stored === "en" || stored === "zh") return stored
  } catch {
    // Storage may be unavailable in a sandboxed frame.
  }
  return typeof navigator !== "undefined" && /^zh/i.test(navigator.language) ? "zh" : "en"
}

let current: Lang = detect()

export function language() {
  return current
}

export function setLanguage(next: Lang) {
  current = next
  try {
    localStorage.setItem(KEY, next)
  } catch {
    // Ignore.
  }
  listeners.forEach((listener) => listener())
}

export function useLanguage(): Lang {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => current,
    () => current,
  )
}

const ZH: Record<string, string> = {
  "GitLab": "GitLab",
  "Changes": "变更",
  "History": "历史",
  "Merge requests": "合并请求",
  "Issues": "议题",
  "Branches": "分支",
  "Activity": "活动",
  "Inbox": "收件箱",
  "Pipelines": "流水线",
  "Settings": "设置",
  "Refresh": "刷新",
  "Fetch": "获取",
  "Pull": "拉取",
  "Push": "推送",
  "Publish": "发布",
  "Commit": "提交",
  "Commit all": "提交全部",
  "Commit & push": "提交并推送",
  "Amend": "修补",
  "Stage": "暂存",
  "Unstage": "取消暂存",
  "Discard": "丢弃",
  "Discard…": "丢弃…",
  "Stash": "暂存工作区",
  "Pop stash": "恢复暂存工作区",
  "New branch": "新建分支",
  "Create merge request": "创建合并请求",
  "Force push": "强制推送",
  "Open on GitLab": "在 GitLab 打开",
  "New issue": "新建议题",
  "Copy hash": "复制哈希",
  "Checkout": "检出",
  "New branch from here": "从此处新建分支",
  "Cherry-pick": "拣选",
  "Revert": "还原",
  "Merge into current": "合并到当前分支",
  "Rebase onto": "变基到此分支",
  "Delete": "删除",
  "Clean up…": "清理…",
  "Search": "搜索",
  "Filter": "筛选",
  "Sort": "排序",
  "Saved searches": "已保存的搜索",
  "Save search": "保存搜索",
  "Saved replies": "常用回复",
  "All open": "全部未关闭",
  "Assigned to me": "分配给我",
  "Created by me": "我创建的",
  "Review requested": "待我评审",
  "Drafts": "草稿",
  "Recently merged": "最近合并",
  "Unassigned": "未分配",
  "Recently closed": "最近关闭",
  "Newest": "最新",
  "Oldest": "最早",
  "Recently updated": "最近更新",
  "Most commented": "评论最多",
  "Clear filters": "清除筛选",
  "Close": "关闭",
  "Close with a comment": "带评论关闭",
  "Reopen": "重新打开",
  "Comment": "评论",
  "Comment…": "评论…",
  "Approve": "批准",
  "Request changes": "请求修改",
  "Submit review": "提交评审",
  "Add to chat": "添加到对话",
  "Start working": "开始处理",
  "Ask agent": "询问 Agent",
  "Ask agent about these": "就此询问 Agent",
  "Triage with agent": "Agent 批量分诊",
  "Pre-review with agent": "Agent 预评审",
  "Files": "文件",
  "Checks": "检查",
  "Checks & pipelines": "检查与流水线",
  "Overview": "概览",
  "Description": "描述",
  "Comments": "评论",
  "Commits": "提交",
  "Unpushed commits": "未推送提交",
  "Undo last commit": "撤销上次提交",
  "Continue": "继续",
  "Abort": "中止",
  "Retry": "重试",
  "Cancel": "取消",
  "Run": "运行",
  "Jobs": "作业",
  "Log": "日志",
  "Failed first": "失败优先",
  "Mark all read": "全部标为已读",
  "Group by project": "按项目分组",
  "No changes": "没有变更",
  "No merge requests": "没有合并请求",
  "No issues": "没有议题",
  "No commits": "没有提交",
  "Loading…": "加载中…",
  "Approve all": "全部批准",
  "Skip": "跳过",
  "Edit": "编辑",
  "Save": "保存",
  "Undo": "撤销",
  "Auto-run": "自动执行",
  "Proposed": "待批准",
  "Done": "已完成",
  "Failed": "失败",
  "Draft review": "评审草稿",
  "Discard draft": "丢弃草稿",
  "Submit": "提交",
  "Approve and submit": "批准并提交",
  "Add comment": "添加评论",
  "Resolve": "解决",
  "Resolved": "已解决",
  "Outdated": "已过期",
  "Reply…": "回复…",
  "Viewed": "已查看",
  "Collapse all": "全部折叠",
  "Unfold all": "全部展开",
  "Fold long content": "折叠长内容",
  "Show more": "展开",
  "Show less": "收起",
  "Compact rows": "紧凑行",
  "Comfortable rows": "舒适行",
  "Header chip": "会话头标签",
  "Default branch": "默认分支",
  "Base branch": "目标分支",
  "Branch name": "分支名",
  "Title": "标题",
  "Body": "正文",
  "Labels": "标签",
  "Assignees": "负责人",
  "Reviewers": "评审人",
  "Milestone": "里程碑",
  "None": "无",
  "Apply": "应用",
  "Remove": "移除",
  "Add": "添加",
  "Create": "创建",
  "Start": "开始",
  "Rules": "规则",
  "Batch size": "每批数量",
  "New worktree": "新工作树",
  "This checkout": "当前检出",
  "Where": "位置",
  "Open settings": "打开设置",
  "Glab token or glab login is required": "需要 GitLab Token 或 glab 登录",
  "No GitLab remote found for this repository.": "该仓库未找到 GitLab 远程地址。",
  "This session has no working directory.": "该会话没有工作目录。",
  "Working…": "处理中…",
  "Copy": "复制",
  "Copied": "已复制",
  "Loading diff…": "加载差异…",
  "No diff": "无差异",
  "Pull request": "合并请求",
  "Issue": "议题",
  "Merged": "已合并",
  "Closed": "已关闭",
  "Open": "打开",
  "Draft": "草稿",
  "Pipeline": "流水线",
  "Queued": "排队中",
  "Running": "运行中",
  "Passed": "通过",
  "Canceled": "已取消",
  "Skipped": "已跳过",
  "Manual": "手动",
  "Summary": "摘要",
  "Verdict": "结论",
  "Approve MR": "批准 MR",
  "Request changes on MR": "请求修改 MR",
  "Comment only": "仅评论",
  "Submit anyway": "仍然提交",
  "Lines moved": "行位置已变化",
  "New commits since drafted": "起草后已有新提交",
  "Your review draft is stored until you submit it.": "评审草稿会保存到你提交为止。",
  "Agent actions": "Agent 操作",
  "Nothing waiting": "没有待处理项",
  "Triage": "分诊",
  "Review": "评审",
  "Ask": "询问",
  "About this repository": "关于此仓库",
  "Token & requirements": "Token 与依赖",
  "The panel needs git on the host. GitLab data needs GITLAB_TOKEN or glab auth login.": "面板需要宿主机上的 git。GitLab 数据需要 GITLAB_TOKEN 或执行 glab auth login。",
  "Language": "语言",
  "Appearance": "外观",
  "Search issues and merge requests…": "搜索议题和合并请求…",
  "Type / for qualifiers": "输入 / 查看限定符",
  "Review requested from you": "请求你评审",
  "Assigned to you": "分配给你",
  "Created by you": "由你创建",
  "Notifications": "通知",
  "Todos": "待办",
  "Mark read": "标为已读",
  "All todos": "全部待办",
  "No notifications": "没有通知",
  "Approve pending proposals": "批准待处理提议",
  "Agent proposed changes": "Agent 提议了更改",
  "Files changed": "变更文件",
  "Additions": "新增",
  "Deletions": "删除",
  "Merge": "合并",
  "Squash": "压缩合并",
  "Delete source branch": "删除源分支",
  "Checking out…": "正在检出…",
  "Start a session with this issue": "以此议题启动会话",
  "Quoted from GitLab": "引用自 GitLab",
  "Session started": "会话已启动",
  "Open session": "打开会话",
  "No project selected": "未选择项目",
  "This project is read-only": "该项目只读",
  "Show in GitLab": "在 GitLab 查看",
  "Copy link": "复制链接",
  "Copy reference": "复制引用",
  "The review was submitted": "评审已提交",
  "Changes requested": "已请求修改",
  "Approved": "已批准",
  "Refresh failed": "刷新失败",
}

export function t(text: string, params?: Record<string, unknown>) {
  const value = current === "zh" ? ZH[text] ?? text : text
  if (!params) return value
  return value.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? ""))
}

export function formatDate(value: string | number | undefined, mode: "short" | "long" = "short") {
  if (value === undefined || value === "") return ""
  const date = new Date(typeof value === "number" ? (value < 1e12 ? value * 1000 : value) : value)
  if (Number.isNaN(date.getTime())) return ""
  const locale = current === "zh" ? "zh-CN" : "en-US"
  if (mode === "long") return date.toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" })
  return date.toLocaleDateString(locale, { month: "short", day: "numeric" })
}
