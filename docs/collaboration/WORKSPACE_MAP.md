# Workspace Map

写入边界以项目根 `AGENTS.md` 与 workspace 根 `AGENTS.md` 为唯一权威。

| area | purpose | default access | owner | external-write risk |
|---|---|---|---|---|
| 项目根（源码/文档） | 开发与文档 | 按任务合同读写 | 当前任务 owner | 中：命令可能触发外部缓存或服务，须显式约束 |
| `.worktrees/{task-id}` | 隔离代码任务工作树 | 仅对应任务 owner 写入 | 当前任务 owner | 低：临时目录和缓存须位于项目内 |
| `docs/collaboration/` | 任务、交接、决策 | owner 编辑自己的任务；共享索引只由协调者编辑 | coordinator | 低：不把外部证据正文或 secret 复制进来 |
| 运行数据/缓存目录（如有） | 运行时产物 | 只读或任务合同明确后读写 | runtime owner / coordinator | 高：不得借此修改外部服务或远端状态 |
| 外部系统（服务/远程/密钥） | — | 只读，除非有精确授权 | user-authorized owner | 极高：默认禁止任何写入 |
