#!/bin/bash
# Claude Code 要求仕様→スキル同期Hook
# イベント: Stop
# 目的: docs/00-requirements の変更がある場合のみスキル索引とLevelを同期する

set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

if [[ ! -d "$PROJECT_DIR/.git" ]]; then
  exit 0
fi

CHANGED=$(git -C "$PROJECT_DIR" status --porcelain 2>/dev/null || true)
if [[ -z "$CHANGED" ]]; then
  exit 0
fi

if ! echo "$CHANGED" | grep -E 'docs/00-requirements/' -q; then
  exit 0
fi

SYNC_SCRIPT="$PROJECT_DIR/scripts/sync_requirements_to_skills.py"
LEVELS_SCRIPT="$PROJECT_DIR/scripts/update_skill_levels.py"

if [[ ! -f "$SYNC_SCRIPT" || ! -f "$LEVELS_SCRIPT" ]]; then
  echo "⚠️ requirements sync scripts not found; skip." >&2
  exit 0
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "⚠️ python3 not found; skip requirements sync." >&2
  exit 0
fi

cd "$PROJECT_DIR"

if ! python3 "$SYNC_SCRIPT"; then
  echo "⚠️ requirements sync failed." >&2
  exit 0
fi

if ! python3 "$LEVELS_SCRIPT"; then
  echo "⚠️ skill level update failed." >&2
  exit 0
fi

exit 0
