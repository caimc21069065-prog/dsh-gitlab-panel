# dsh-gitlab-panel

DeepSeek Harness（DSH）的 Git 与 GitLab 右侧面板插件。它是
[opencode-github-panel](https://github.com/neriousy/opencode-github-panel) 的 GitLab 版本，
按原项目的功能逐项复刻：分支、变更、提交图、合并请求、议题、流水线、评审、分诊，
以及带审批队列的 Agent 工具。

> 依赖 DSH 0.2.x（插件 API `apply(ctx)`、`ctx.slots`、`ctx.sidebarRightTabs`、
> `ctx.webServer`、`ctx.tools`）与 `git`。GitLab 数据需要 Personal Access Token
> （`api` scope），或宿主机上已执行 `glab auth login`。

---

## 安装

### 从本地源码（链接安装）

```bash
cd /path/to/dsh-gitlab-panel
npm install
npm run build            # 生成 lib/index.js 与 lib/client.js
dsh plugin --profile <profile> add /path/to/dsh-gitlab-panel
dsh --profile <profile> --dump-config   # 应出现 "# == dsh-gitlab-panel" 层
dsh --profile <profile>
```

如果 profile 还没有 Web 应用层，先用官方 Web 模板创建：

```bash
dsh --profile demo --from-default-profile web --dump-config
dsh plugin --profile demo add /path/to/dsh-gitlab-panel
dsh --profile demo --no-open
```

### 临时 overlay（不安装到 profile）

```yaml
# cordis.patch.yml
- insert:
    - id: gitlab-panel
      name: 'dsh-gitlab-panel'   # 或包的绝对路径
```

```bash
dsh web --patch /absolute/path/to/dsh-gitlab-panel/cordis.patch.yml
```

### 安装要求

- Node.js 22+（DSH 自身要求）
- `git` 在宿主机的 `PATH` 中
- GitLab：`GITLAB_TOKEN`（推荐）或 `glab` 已登录。自托管 GitLab 用
  `GITLAB_API_BASE`/`GITLAB_URL` 指定地址。

---

## 配置

所有配置都可以通过环境变量或插件行 `config` 提供。Token 只留在宿主机，不会发到浏览器。

| 配置 | 环境变量 | 说明 |
|---|---|---|
| `host` | `GITLAB_HOST` | GitLab 主机名，例如 `gitlab.com`、`gitlab.example.com` |
| `apiBase` | `GITLAB_API_BASE` / `GITLAB_URL` | API 根地址，例如 `https://gitlab.example.com`；已含 `/api/v4` 也可 |
| `project` | `GITLAB_PROJECT` | 项目路径 `group/subgroup/project`；默认从 `origin` 等 remote 解析 |
| `token` | `GITLAB_TOKEN` / `GITLAB_PRIVATE_TOKEN` / `GLAB_TOKEN` | Personal Access Token（`api` scope） |
| `tokenEnv` | — | 存放 Token 的环境变量名 |
| `defaultBranch` | — | 当无法读取 `refs/remotes/<remote>/HEAD` 时的默认分支 |

Token 解析顺序：插件 config → `tokenEnv` → `GITLAB_TOKEN` → `GITLAB_PRIVATE_TOKEN` →
`GLAB_TOKEN` → `glab-cli/config.yml`。没有 Token 时会尝试调用 `glab api`（需要 glab 已登录），
两者都没有时面板仍可显示本地 git 数据，并在顶部提示缺少 GitLab 凭据。

```yaml
# cordis.patch.yml 示例
- insert:
    - id: gitlab-panel
      name: 'dsh-gitlab-panel'
      config:
        host: gitlab.example.com
        apiBase: https://gitlab.example.com
        defaultBranch: main
```

---

## 使用

打开方式：

- 右侧边栏 `+` → 指南页中的 **GitLab**；
- 会话标题栏的分支 chip（可在面板菜单里关闭）；
- 桌面端快捷键 `⌘⇧G` / `Ctrl+Shift+G`；
- 输入框 `/gitlab` 斜杠命令。

### 顶栏与仓库

顶栏显示项目、四个页签（变更、历史、MRs、议题）、Agent 活动角标、收件箱角标和菜单：
Fetch、刷新、流水线、收件箱、Agent 活动、在 GitLab 打开、新建议题、常用回复、会话头 chip
开关、设置。

### 分支栏

- 分支选择器：搜索、最近分支、有 MR 的分支、本地/远程分支，带 ahead/behind、MR、最后一次提交；
  可检出、合并到当前、变基、推送、删除、打开工作树会话。
- 拉取 ↓ / 推送 ↑ / 发布 / Fetch；菜单含新建分支、创建 MR、强制推送（`--force-with-lease`）、
  stash/pop、清理分支。
- 合并、rebase、`git am`、cherry-pick、revert 进行中时显示 Continue / Abort。
- 当前分支 MR strip：状态、流水线、评审、下一步；没有 MR 时显示 ahead 数和“创建合并请求”。
  分支若关联议题（`123-...`、`fix/123` 或“开始工作”记录），显示议题链接。

### 变更

- 冲突 / 已暂存 / 未暂存 / 未跟踪文件，按文件展开内联 diff；逐个或全部 stage/unstage/discard。
- 提交框：Commit、Commit all、Commit & push、Amend（`⌘⏎`）；修补已推送提交前确认。
- 未推送提交列表：Push、撤销上次提交（不会重写已发布历史）。
- 支持 stash 数量与 pop。

### 历史

- 提交图（泳道、合并曲线、分支/远程/标签徽章），范围：当前分支 / 本地分支 / 全部。
- 点击提交查看正文、文件列表与 diff；操作：检出、从此处新建分支、cherry-pick、revert、
  复制哈希、在 GitLab 打开。

### MRs / 议题

- 预设搜索：分配给我、待我评审、我创建的、全部未打开、草稿、最近合并（议题：未分配、最近关闭）。
- 搜索语法支持 `is:open/closed/merged`、`label:`、`author:@me`、`assignee:@me`、
  `reviewer:@me`、`milestone:`、`no:assignee`、`sort:created-desc` 等；输入 `/` 显示限定符、
  标签/成员/里程碑自动补全；筛选与排序菜单、可移除的条件 chips、已保存搜索。
- 每页 30 条、滚动加载、只渲染可见行；舒适/紧凑行；已读状态标记。
- 键盘：`↑↓`/`j k` 移动、`Enter` 打开、`/` 搜索、`x` 选择、`⌘A` 全选、`Esc` 清空。
- 多选批量：关闭（原因 + 可选评论）、Label、Assign、Comment、Reopen、询问 Agent、
  Agent 分诊；批量写入走 Agent 队列，速率受限、显示进度、可撤销。
- 行菜单：打开、引用到对话、询问 Agent、复制链接/引用、在 GitLab 打开、关闭/重开、
  开始工作、检出、Agent 预评审。

### 议题 / MR 详情

- 独立侧栏标签（刷新后仍能恢复目标），状态、标签、负责人、里程碑、描述、评论与评论框。
- 关闭/重开、编辑（标题、正文、标签、负责人、评审人、里程碑、草稿）、复制链接、在 GitLab 打开、
  引用到对话。
- MR 额外有：
  - **文件**：变更列表、全部折叠、Viewed、内联 diff、行号点击创建评审评论。
  - **检查**：失败作业优先，作业日志（ANSI 清理）、重试/取消流水线与作业、跳转 GitLab。
  - 评审线程：内联代码片段、回复、解决/取消解决。
  - 评审草稿：Agent 或用户创建，可编辑/删除评论、修改摘要与结论，提交或丢弃；
    head 有新提交时会提示，可强制提交并把失效行评论并入摘要。
  - 合并对话框：Squash、删除源分支。
  - 签出 MR、Agent 预评审、开始工作。

### CI 流水线

- 按当前分支或全部列出流水线；点击打开独立流水线标签，按阶段显示作业、失败优先、
  日志与重试/取消。

### 收件箱

- GitLab Todos，按项目分组；点击条目打开对应议题/MR 并标记 todo 完成；全部标为已读。
- 另外聚合“待我评审”“分配给我”“我创建的”。

### Agent 活动

- 按会话展示提议/已批准/运行中/完成/失败/跳过/撤销的操作，按批次分组。
- 批准、编辑、跳过、取回、撤销、重试、自动执行；支持键盘 `j/k y n e u o a`。
- Triage 会话显示进度条、已审核/已批准/已跳过/等待中。
- 用户自己的批量操作与 Agent 在 shell 中执行的 `glab issue|mr ...` 写入也会记录在这里。

### Agent 工具

宿主侧注册以下工具（无需手工启用）：

| 工具 | 作用 |
|---|---|
| `gitlab_panel_search` | 搜索议题与 MR，返回紧凑列表与总数 |
| `gitlab_panel_view` | 读取单个议题/MR，含最新评论与流水线 |
| `gitlab_panel_comment` | 提议评论（可批量） |
| `gitlab_panel_close` | 提议关闭（completed / not_planned / duplicate） |
| `gitlab_panel_reopen` | 提议重新打开 |
| `gitlab_panel_label` | 提议增删标签 |
| `gitlab_panel_assign` | 提议分配/取消分配 |
| `gitlab_panel_actions` | 查看本会话操作；`wait: true` 等待用户决定 |
| `gitlab_panel_diff` | 读取 MR diff，带 LEFT/RIGHT 行号与可评论范围 |
| `gitlab_panel_review` | 起草评审（摘要、结论、内联评论），不直接发布 |

写入默认进入**按会话的审批队列**，用户在面板中批准、编辑或跳过；可在活动页开启
**自动执行**。批准后逐条执行（约 1 秒一条，遇 429 退避重试），并记录撤销信息。

> GitLab 的议题用 `#N`、合并请求用 `!N`，编号空间独立。写工具接受 `kind: "issue" | "mr"`，
> 批量操作与 triage 提示词会自动带上它，避免同号误操作。

### 开始工作 / Triage / 预评审

- **开始工作**：为议题创建分支（默认 `123-slug`，从最新默认分支或当前 HEAD），
  选择“新工作树”或“当前检出”；然后在新会话中带上议题上下文启动 Agent。
- **Triage with agent**：输入规则、选择常用回复与批大小；新会话按批处理，Agent 只提议，
  用户在活动页按批批准/跳过，Agent 会读到用户的修改与跳过偏好。
- **预评审**：为 MR 启动会话，Agent 用 `gitlab_panel_diff` 读 diff、`gitlab_panel_review`
  写草稿；用户在文件页编辑并提交。

### 会话中的引用

- 会话里的 `#123`、`!123`、`group/project#123`、`group/project!123` 会显示可点击下划线，
  悬停显示状态卡，点击在侧栏打开；`⌘`/`Ctrl` 点击保持原链接行为。
- GitLab URL（issue/MR/commit/pipeline）点击也会转到面板内标签。
- 会话头 chip 显示分支、未提交标记和 MR；输入框下方的 “GitLab · N” pill 显示审批数量，
  点击打开 Agent 活动。

### 设置

- 面板菜单 → 设置：Token/连接状态、会话头 chip、紧凑行、折叠长内容、语言（自动/EN/中文）。
- DSH 设置页也注册了 GitLab 卡片，可直接打开面板与查看凭据说明。

---

## 开发

```bash
npm install
npm run dev        # esbuild watch：lib/index.js + lib/client.js
npm run typecheck
npm test           # 共享解析、diff、引用、搜索、图布局、清理逻辑
npm run mock       # 本地 GitLab API mock（127.0.0.1:4199）
```

用 mock 做端到端开发：

```bash
node scripts/mock-gitlab.mjs
# 让一个 git 仓库的 origin 指向 https://gitlab.example.com/test/project.git
GITLAB_API_BASE=http://127.0.0.1:4199 GITLAB_PROJECT=test/project GITLAB_TOKEN=mock \
  dsh --profile <profile>
```

客户端 bundle 由 esbuild 生成 `lib/client.js`，遵循 DSH 的 CJS 工厂包装：

```js
window.__ModuleLoader__.load({ id: "dsh-gitlab-panel", factory: (require) => { ... } })
```

React 与 `react-dom/client` 来自 DSH 模块表（external），`@tanstack/react-query`
与业务代码打进 bundle；样式以 `<style data-plugin="dsh-gitlab-panel">` 注入，
不依赖构建期 CSS 处理。插件卸载时路由、监听、样式、事件流与工具都会清理。

### 结构

```
src/shared/   类型、Git 解析、diff、引用、图布局、清理候选、搜索语法
src/host/     宿主插件：git 进程、GitLab REST、SSE/HTTP 路由、存储、Agent 队列与工具
src/client/   浏览器插件：侧栏标签、面板、搜索、详情、CI、收件箱、活动、评审、样式
scripts/      构建与 GitLab mock
tests/        共享逻辑单测
```

宿主 API：`POST /gitlab-panel/api`（JSON `{method, params}`）与
`GET /gitlab-panel/events`（SSE）。路由走 DSH `webServer`，并调用
`connection.requestRejection` 做来源/会话校验。队列、关闭原因、评审草稿持久化在
`$DSH_HOME/gitlab-panel/state.json`。

---

## 与 GitHub 原项目的映射

| opencode-github-panel | 本插件 |
|---|---|
| GitHub PR | GitLab Merge Request (`!N`) |
| Issue | GitLab Issue (`#N`) |
| `gh` CLI | GitLab REST v4 + `glab` 配置/CLI 兜底 |
| GitHub Actions | GitLab Pipelines / Jobs |
| review decision | GitLab approvals |
| notifications | GitLab Todos |
| `gh` shell 记录 | `glab` shell 记录 |
| GitHub search 语法 | 兼容子集，映射到 GitLab 列表参数 |
| OpenCode 主进程/服务端 RPC | DSH 宿主 HTTP + SSE |
| Solid 面板 | React 侧栏标签 |
| GitHub 提及 | `#` / `!` 引用 + GitLab 链接 |

GitLab 没有关闭原因、review decision 的完全等价字段：关闭原因会保存在本地状态中，
duplicate 会以评论链接到保留的议题；approvals 用批准/取消批准与评论表达“请求修改”。

## 已知限制

- 同一时间面板面向一个项目的检出；收件箱中同一 GitLab 主机的其他项目可以打开，
  跨主机项目需在对应主机配置后再打开。
- GitLab 的 issue/MR 编号独立，Agent 工具需要时可传 `kind`；未传时先查 MR 再查 issue。
- 不包含 GitHub 专属能力（workflow rerun failed only、GraphQL review threads 等）。
- 会话头 chip 与输入框 pill 依赖 DSH 的会话已进入对话界面（空白会话的 Hero 页不渲染这些 slot）。

## 致谢

- 功能设计与行为参考 [neriousy/opencode-github-panel](https://github.com/neriousy/opencode-github-panel)（MIT）。
- 插件框架与 Web Client：[deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)。
