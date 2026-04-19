#!/usr/bin/env bash
# sync-skills-mirror.sh
# canonical → mirror の完全同期 + generate-index 再生成 + 最終 parity 確認
# 引数:
#   --check-only: rsync を実行せず diff -qr を行い、差分の有無を exit 0/1 で返す

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
CANONICAL="$REPO_ROOT/.claude/skills"
MIRROR="$REPO_ROOT/.agents/skills"
GEN_INDEX="$CANONICAL/aiworkflow-requirements/scripts/generate-index.js"
CHECK_ONLY="${1:-}"

if [ ! -d "$CANONICAL" ] && [ ! -d "$MIRROR" ]; then
  echo "[mirror-sync] SKIP: skills root が未配置です"
  exit 0
fi

if [ "$CHECK_ONLY" = "--check-only" ]; then
  if [ ! -d "$CANONICAL" ] || [ ! -d "$MIRROR" ]; then
    echo "[mirror-sync] SKIP (check-only): canonical または mirror が未配置です"
    exit 0
  fi
  diff -qr "$CANONICAL" "$MIRROR" 2>/dev/null
  exit $?
fi

mkdir -p "$MIRROR"

MIRROR_ONLY=$(diff -qr "$CANONICAL" "$MIRROR" 2>/dev/null \
  | grep "^Only in $MIRROR" || true)
if [ -n "$MIRROR_ONLY" ]; then
  echo "[mirror-sync] warning: mirror にのみ存在するファイル（rsync --delete で削除されます）:"
  echo "$MIRROR_ONLY"
fi

echo "[mirror-sync] index 再生成中..."
node "$GEN_INDEX" --quiet

echo "[mirror-sync] rsync 開始: canonical → mirror"
rsync -a --delete "$CANONICAL/" "$MIRROR/"

echo "[mirror-sync] parity 最終確認..."
DIFF_FINAL=$(diff -qr "$CANONICAL" "$MIRROR" 2>/dev/null || true)
if [ -z "$DIFF_FINAL" ]; then
  echo "[mirror-sync] 完了: parity OK"
  exit 0
fi
echo "[mirror-sync] 警告: 再生成後も差分が残っています:"
echo "$DIFF_FINAL"
exit 1
