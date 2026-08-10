#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从 ECDICT 词库提取 COCA 词频前 10000 常用单词,生成带音标和中文释义的词表。"""
import csv
import os
import re
import sys

BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(BASE, "ecdict.csv")
OUT_TXT = os.path.join(BASE, "words_10000.txt")
OUT_CSV = os.path.join(BASE, "words_10000_anki.csv")

def clean(text):
    if not text:
        return ""
    text = text.replace("\r", " ").replace("\n", "；").strip()
    # 多个分隔符压缩
    text = re.sub(r"[；;]\s*[；;]+", "；", text)
    return text.strip("；; ")

def main():
    rows = []
    with open(SRC, "r", encoding="utf-8-sig", errors="replace") as f:
        reader = csv.DictReader(f)
        for i, r in enumerate(reader):
            frq = (r.get("frq") or "").strip()
            if not frq:
                continue
            try:
                frq_val = int(frq)
            except ValueError:
                continue
            rows.append((frq_val, r))

    rows.sort(key=lambda x: x[0])  # COCA 排名升序 = 越常用越靠前
    top = rows[:10000]
    print(f"总词条: {len(rows)}  前10000词频范围: {top[0][0]} ~ {top[-1][0]}")

    words = []
    with open(OUT_TXT, "w", encoding="utf-8") as f:
        f.write("# 常用英语单词 10000 个(按 COCA 词频排序,来源 ECDICT)\n")
        f.write("# 格式: 序号\t单词\t音标\t中文释义\n")
        for i, (frq, r) in enumerate(top, 1):
            word = r["word"].strip()
            phon = clean(r.get("phonetic"))
            # 中文释义优先,缺则用英文释义
            trans = clean(r.get("translation"))
            if not trans:
                trans = clean(r.get("definition"))
            # 释义长度截断,避免超长短语撑爆排版
            if len(trans) > 200:
                trans = trans[:200] + "…"
            f.write(f"{i}\t{word}\t{phon}\t{trans}\n")
            words.append((i, word, phon, trans, clean(r.get("definition")),
                          clean(r.get("pos")), frq, clean(r.get("bnc")),
                          clean(r.get("collins")), clean(r.get("oxford")),
                          clean(r.get("tag"))))

    # Anki 导入用 CSV(中文释义 + 词性 + 词频 + 标签)
    with open(OUT_CSV, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["rank", "word", "phonetic", "translation", "pos",
                    "frq", "bnc", "collins", "oxford", "tag"])
        for row in words:
            w.writerow(row)

    # 简单校验:重复单词、短语占比
    ws = [w[1].lower() for w in words]
    dups = len(ws) - len(set(ws))
    phrases = sum(1 for w in ws if " " in w or "-" in w)
    print(f"重复单词: {dups}  含短语/复合词: {phrases}")

    # 按考试标签统计
    from collections import Counter
    tag_counter = Counter()
    for _, _, _, _, _, _, _, _, _, _, tag in words:
        for t in (tag or "").split():
            tag_counter[t] += 1
    if tag_counter:
        print("考试标签分布(前10):", dict(tag_counter.most_common(10)))

    print(f"\n输出文件:")
    print(f"  {OUT_TXT}")
    print(f"  {OUT_CSV}")
    print("\n前 20 词预览:")
    for i, w, p, t in words[:20]:
        print(f"{i:>5}  {w:<16} {p:<14} {t[:40]}")

if __name__ == "__main__":
    main()
