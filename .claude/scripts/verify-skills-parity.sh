#!/usr/bin/env bash
# verify-skills-parity.sh
# .claude/skills（canonical）と .agents/skills（mirror）の完全パリティを検証
# exit 0: parity OK、または両 root 不在（bootstrap skip）
# exit 1: parity NG、または mirror root 欠損

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
CANONICAL="$REPO_ROOT/.claude/skills"
MIRROR="$REPO_ROOT/.agents/skills"

if [ ! -d "$CANONICAL" ] && [ ! -d "$MIRROR" ]; then
  echo "[parity-check] SKIP: skills root が未配置です"
  exit 0
fi

if [ ! -d "$CANONICAL" ]; then
  echo "[parity-check] SKIP: canonical root が未配置です"
  exit 0
fi

if [ ! -d "$MIRROR" ]; then
  echo "[parity-check] NG: mirror root が存在しません"
  echo "修正: bash .claude/scripts/sync-skills-mirror.sh"
  exit 1
fi

DIFF_OUTPUT=$(diff -qr "$CANONICAL" "$MIRROR" 2>/dev/null || true)

if [ -z "$DIFF_OUTPUT" ]; then
  echo "[parity-check] OK: .claude/skills と .agents/skills に差分はありません"
  exit 0
fi

echo "[parity-check] NG: 以下の差分が検出されました:"
echo "$DIFF_OUTPUT"
echo ""
echo "修正: bash .claude/scripts/sync-skills-mirror.sh"
exit 1
