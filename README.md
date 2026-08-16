# Project-007 wordlists — 常用英语单词 10000 站

从 ECDICT 词库提取 COCA 词频前 10000 常用单词,生成带音标/中文释义的词表 + 网页查询站。

## 启动(静态站 :8095)

- systemd user 服务:`words-server.service`(开机自启,零维护)
- 手动:`/usr/bin/python3 -m http.server 8095 --bind 0.0.0.0 --directory web`
- 公网:`/words/`(Caddy 反代)

## 生成流程

```bash
python3 build.py      # ecdict.csv → words_10000.txt + words_10000_anki.csv
python3 gen_json.py   # words_10000.txt → web/data/*.json(10 个 chunk, 网页按组加载)
```

脚本自定位(`__file__` 推导),搬目录不用改。build2.py 为 google-10000 合并备选实现。

## 关键路径

| 内容 | 位置 |
|---|---|
| 源词库 | `ecdict.csv` |
| 生成词表 | `words_10000.txt` / `words_10000_anki.csv` |
| 网页数据 | `web/data/` |
| 静态根 | `web/` |

## 状态

2026-08-10:迁移后自定位改造(build.py/build2.py/gen_json.py 旧路径已清)。

## WSL Local / Worktree（2026-08-17）

WSL 原生目录：`/home/yhy/workspace/projects/Project-007-wordlists`，使用系统 Python，无第三方依赖。

```bash
./scripts/setup.sh   # 从已跟踪词表生成 web/data
./scripts/run.sh
./scripts/check.sh
```

Windows 访问：`http://localhost:8095`，默认监听 `127.0.0.1`。Local 保留完整 `ecdict.csv` 与生成数据；Worktree 仅依赖 Git 已跟踪词表并可复现生成网页数据。

