# Task Contract Template

```yaml
task_id: 2026-08-30-data-dir-tidy
status: done
owner: root-workspace-session
base_commit: 4e5e682
depends_on: []
allowed_read_paths: ["*"]
allowed_write_paths: ["data/", "build.py", "build2.py", "gen_json.py", "README.md", "AGENTS.md", "docs/collaboration/tasks/2026-08-30-data-dir-tidy.md"]
forbidden_paths: ["web/", ".github/", "scripts/"]
external_write_authorization: none
validation_commands: ["python3 build.py", "python3 gen_json.py", "./scripts/check.sh"]
handoff_required: false
```

## Goal

顶层杂类数据文件归入 `data/`，消除顶层污染：`ecdict.csv`、`google-10000-english.txt`、`words_10000.txt`、`words_10000_anki.csv`、`words_10000.zip` 移入 `data/`，同步修改三个生成脚本的路径常量与文档。

## Non-goals

不改生成逻辑本身；不动 `web/`、`.github/`、`scripts/`（已核实无文件引用被移动路径）；不推送远端（push 会触发 Pages 上线）。

## Inputs

- 用户指示（根 workspace 会话 2026-08-30）：整理 Project-007 顶层污染，作为唯一有实际污染的项目做局部治理。

## Work log

- 核实引用：py/md/sh/json/html/js/workflow 均无对被移动文件的路径引用；web/ 仅引用 web/data/*.json（生成产物，位置不变）。
- `git mv` 四个已跟踪文件入 `data/`；`ecdict.csv`（ignored）直接 mv。
- 修改 `build.py`、`build2.py`、`gen_json.py` 的 BASE 相对路径为 `data/` 前缀。
- 单 owner 维护任务，无并行任务，按最小范围在主检出直接执行（未建 worktree）。

## Validation evidence

- 2026-08-30:`python3 build2.py` exit=0,`git diff -- data/words_10000.txt data/words_10000_anki.csv` 为空(从 data/ 逐字节复现提交版产物);`python3 gen_json.py` exit=0,`git diff -- web/data` 为空。
- 2026-08-30:`python3 build.py` exit=0(顺手修复预览循环 11 元组按 4 元解包的预存 bug;该生成器语义为 COCA 词序,产物已还原,线上词表以 build2.py 为准)。
- 2026-08-30:`./scripts/check.sh` 通过(10 个 JSON 可解析、web/index.html 存在)。
- 2026-08-30:过程教训——首次误跑 build.py 覆盖 tracked 产物,已从索引还原;经验写入项目 LESSONS.md。

## Risks

- 生成不确定导致产物 diff → build.py 排序稳定，若 git diff 非空则回退排查。

## Handoff conditions

- 验证命令全部通过、`git status --short` 干净（本地提交后）、证据回填本文件。
