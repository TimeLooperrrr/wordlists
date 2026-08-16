#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
exec /usr/bin/python3 -m http.server "${PORT:-8095}" --bind "${HOST:-127.0.0.1}" --directory "$ROOT/web"
