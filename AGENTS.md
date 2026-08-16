# Project-007 wordlists 工作约定

## 项目定位

- 本项目从词库生成常用英语词表、Anki 文件和静态查询站。
- 开始任务先读 `README.md` 与 `LESSONS.md`。

## 修改边界

- `ecdict.csv` 和 `google-10000-english.txt` 是输入源；生成逻辑优先修改 `build.py`、`build2.py` 或 `gen_json.py`。
- 脚本必须由 `__file__` 自定位，不能写死机器路径。
- 修改生成逻辑后同步检查文本、Anki CSV 与 `web/data/`，避免只更新其中一种产物。

## 验证

- 运行受影响的生成脚本，检查退出状态、词条数量、UTF-8 内容和 JSON 可解析性。
- 网页改动用静态服务器打开 `web/`，检查加载、搜索和分组切换；发布或重启服务需用户明确要求。

## 文档维护

- 数据源、生成顺序或访问方式变化时更新 `README.md`；可复发问题写入 `LESSONS.md`。
