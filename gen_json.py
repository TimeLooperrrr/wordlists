#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 words_10000.txt 拆成 10 个 JSON chunk(每 1000 词),供网页按组加载。"""
import json
import os

BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(BASE, "data", "words_10000.txt")
OUT_DIR = os.path.join(BASE, "web/data")

os.makedirs(OUT_DIR, exist_ok=True)

entries = []
with open(SRC, encoding="utf-8") as f:
    for line in f:
        line = line.rstrip("\n")
        if not line or line.startswith("#"):
            continue
        parts = line.split("\t")
        if len(parts) < 4:
            continue
        rank, word, phon, trans = parts[0], parts[1], parts[2], parts[3]
        entries.append({"r": int(rank), "w": word, "p": phon, "t": trans})

print(f"总词条: {len(entries)}")
assert len(entries) == 10000, f"词条数不对: {len(entries)}"

for g in range(10):
    chunk = entries[g * 1000:(g + 1) * 1000]
    path = os.path.join(OUT_DIR, f"{g + 1}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(chunk, f, ensure_ascii=False, separators=(",", ":"))
    print(f"data/{g + 1}.json  {len(chunk)} 词  {os.path.getsize(path)//1024}KB")
