# wordlists 项目经验

| 日期 | 问题/原因 | 解决办法 |
|---|---|---|
| 2026-08-10 | `/words` 无尾斜杠导致相对 JS/CSS/数据路径解析到站点根，页面显示无数据 | Caddy 将 `/words` 永久重定向到 `/words/`，`.project.json` 公网路径也保留尾斜杠 |
| 2026-08-10 | 迁移后构建脚本残留旧绝对路径 | `build.py`、`build2.py`、`gen_json.py` 全部使用 `__file__` 推导项目路径并真实运行验证 |
| 2026-08-30 | `build.py` 与 `build2.py` 语义不同(COCA 词序 vs google-10000 词序)却写同一对输出文件;跑 build.py 会静默覆盖线上词表,且其预览循环解包 bug 让它跑到一半才崩,产物已污染 | 线上词表唯一生成器是 `build2.py`;跑错生成器后用 `git restore`/`git checkout -- <产物>` 从索引还原;build.py 解包已修,README 标注勿混跑 |

最后整理：2026-08-30。

## 2026-08-23 GitHub Pages 试点(wordlists)

- Pages API `source.path` 只允许 `/` 或 `/docs`(422):发布任意子目录(如 `web/`)必须 `build_type=workflow` + Actions(`actions/upload-pages-artifact` 的 `path: web`)
- gh CLI 装在 Windows `D:\Software\Github\gh\`(winget --location),依赖软链到 `C:\Users\Administrator\bin` 进 PATH;认证走 SSH(git_protocol=ssh),WSL 内 仓库 push 无需额外配置
- 站点内全相对路径(css/js/data fetch)零改动适配 Pages 子路径 `/wordlists/`
