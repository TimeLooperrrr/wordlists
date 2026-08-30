# 多 Agent 协作入口

开始写入前先读项目根 `AGENTS.md`，再从 `tasks/` 找到自己的任务合同并确认 owner、基线、依赖、允许路径和验证命令。全局规则见 workspace 根 `AGENTS.md`。

## 任务状态机

```text
planned -> ready -> in_progress -> review -> done
                         |            |
                         v            v
                      blocked      blocked
planned/ready/in_progress/review -> cancelled
```

- `planned`：范围定义中，不能写入。
- `ready`：依赖与路径已确认，等待 owner 开始。
- `in_progress`：唯一 owner 正在实施。
- `review`：停止写入，等待独立复核。
- `done`：验证、交接与关闭条件完成。
- `blocked` / `cancelled`：阻塞待解决 / 协调者确认取消。

只有任务 owner 编辑自己的任务正文；共享索引和决策只由协调者编辑。owner 变更前必须先在 `handoffs/` 建交接记录。

## 并行协作守则

- 合同先行：无任务文件不写入。
- 一任务一 owner 一 worktree：代码任务用 `git worktree add .worktrees/{task-id} -b codex/{task-id}`。
- 共享写入点（主工作树、远端 push）先协调再用；远端分支删除、强制推送需用户单独授权。
- 共享面（README 当前状态、`WORKSPACE_MAP.md`、`decisions/`）只由协调者编辑。
- 冲突即停，不扩大范围、不覆盖他人产出。
- 完成自证：任务验证 + `git status --short` 干净，证据写入任务文件后关闭。

## 目录

- `tasks/`：任务合同，用 `TASK_TEMPLATE.md`。
- `handoffs/`：交接记录，用 `HANDOFF_TEMPLATE.md`。
- `decisions/`：协调者维护的共享决策记录。
- `WORKSPACE_MAP.md`：区域用途与写入风险。
