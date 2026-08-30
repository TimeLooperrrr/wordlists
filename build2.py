#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""常用英语单词 10000 个:Google 万亿语料词频表(权威词序)+ ECDICT 音标/中文释义。"""
import csv
import re
from collections import Counter

import os

BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "data")
GOOGLE = os.path.join(DATA, "google-10000-english.txt")
ECDICT = os.path.join(DATA, "ecdict.csv")
OUT_TXT = os.path.join(DATA, "words_10000.txt")
OUT_CSV = os.path.join(DATA, "words_10000_anki.csv")

def clean(text):
    if not text:
        return ""
    text = text.replace("\\r\\n", "；").replace("\\n", "；").replace("\\r", "；")
    # 去掉计算机术语噪音(如 "[计] DOS批处理命令")和纯网络释义占位
    text = re.sub(r"\[计\][^；;]*[；;]?", "", text)
    text = re.sub(r"[；;]\s*[；;]+", "；", text)
    return text.strip("；; ")

def main():
    with open(GOOGLE, encoding="utf-8") as f:
        words = [ln.strip() for ln in f if ln.strip()]
    print(f"google-10000 词表: {len(words)} 词")

    # ECDICT 建索引(word 小写 -> row)
    index = {}
    with open(ECDICT, "r", encoding="utf-8-sig", errors="replace") as f:
        for r in csv.DictReader(f):
            w = (r["word"] or "").strip().lower()
            if w and w not in index:
                index[w] = r
    print(f"ECDICT 索引词条: {len(index)}")

    rows = []
    missing = []
    for i, w in enumerate(words, 1):
        r = index.get(w.lower()) or index.get(w)
        if r is None:
            missing.append(w)
            rows.append((i, w, "", "[未收录]", ""))
            continue
        phon = clean(r.get("phonetic"))
        trans = clean(r.get("translation"))
        if not trans:
            trans = clean(r.get("definition"))
        if len(trans) > 200:
            trans = trans[:200] + "…"
        rows.append((i, w, phon, trans, clean(r.get("pos"))))

    print(f"找到释义: {len(rows) - len(missing)}/{len(rows)}  缺失: {len(missing)} ({missing[:15]})")

    with open(OUT_TXT, "w", encoding="utf-8") as f:
        f.write("# 常用英语单词 10000 个(Google 万亿语料词频排序;音标/释义来自 ECDICT)\n")
        f.write("# 格式: 序号\t单词\t音标\t中文释义\n")
        for i, w, p, t, _ in rows:
            f.write(f"{i}\t{w}\t{p}\t{t}\n")

    with open(OUT_CSV, "w", encoding="utf-8-sig", newline="") as f:
        wtr = csv.writer(f)
        wtr.writerow(["rank", "word", "phonetic", "translation", "pos"])
        for row in rows:
            wtr.writerow(row)

    # 词性/缺失统计
    pos_c = Counter(r[4].split()[0] if r[4] else "?" for r in rows)
    print("词性分布(前8):", dict(pos_c.most_common(8)))
    print("\n输出:")
    print(f"  {OUT_TXT}")
    print(f"  {OUT_CSV}")
    print("\n前 25 词预览:")
    for i, w, p, t, _ in rows[:25]:
        print(f"{i:>5}  {w:<14} {p:<14} {t[:34]}")

if __name__ == "__main__":
    main()
