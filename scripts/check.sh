#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
python3 -m py_compile build.py build2.py gen_json.py
python3 - <<'PY'
from pathlib import Path
import json
files = sorted(Path('web/data').glob('*.json'))
if not files:
    raise SystemExit('web/data is empty; run ./scripts/setup.sh')
for path in files:
    json.loads(path.read_text(encoding='utf-8'))
print(f'wordlists JSON files: {len(files)}')
PY
test -s web/index.html
echo 'wordlists check: ok'
