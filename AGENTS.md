# Project-007 wordlists 工作约定

## 项目定位

- 本项目从词库生成常用英语词表、Anki 文件和静态查询站。
- 开始任务先读 `README.md` 与 `LESSONS.md`。

## 修改边界

- `data/ecdict.csv` 和 `data/google-10000-english.txt` 是输入源；生成逻辑优先修改 `build.py`、`build2.py` 或 `gen_json.py`。数据与产物文件统一放 `data/`，顶层只留治理文件与脚本。
- 脚本必须由 `__file__` 自定位，不能写死机器路径。
- 修改生成逻辑后同步检查文本、Anki CSV 与 `web/data/`，避免只更新其中一种产物。

## 验证

- 运行受影响的生成脚本，检查退出状态、词条数量、UTF-8 内容和 JSON 可解析性。
- 网页改动用静态服务器打开 `web/`，检查加载、搜索和分组切换；发布或重启服务需用户明确要求。

## 文档维护

- 数据源、生成顺序或访问方式变化时更新 `README.md`；可复发问题写入 `LESSONS.md`。

## 多 Agent 任务合同（v1-2026-08-30 追加）

> 本节由 workspace 基线于 2026-08-30 追加，与上文冲突时以更严格的为准；母版见 workspace `templates/`。

- 任何写入任务开始前，先在 `docs/collaboration/tasks/` 建任务文件（用 `TASK_TEMPLATE.md`），声明 owner、基线提交、允许写入路径、依赖、验证命令和交接条件；无合同不写入。
- 同一任务唯一 owner；代码任务在 `.worktrees/{task-id}` 建独立 worktree，一任务一树。
- 任务状态机：planned → ready → in_progress → review → done（可 blocked / cancelled）；owner 变更前先在 `docs/collaboration/handoffs/` 写交接记录。
- 共享面（README 当前状态、`docs/collaboration/WORKSPACE_MAP.md`、`decisions/`）只由协调者编辑。
- 发现范围不足或路径冲突立即停止并回报；不得扩大范围或覆盖其他任务产出。
- 完成自证：任务指定验证 + `git status --short` 干净，证据写入任务文件后再关闭。
- 写入边界同时遵守本文件上文与 workspace 根 `AGENTS.md`；本文件保持真实文件，不得用符号链接充当入口。
