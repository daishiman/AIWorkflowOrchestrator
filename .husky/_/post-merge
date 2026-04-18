#!/usr/bin/env bash
# post-merge フック: indexes/*.json の自動再生成
# インストール先: git rev-parse --git-path hooks/post-merge
#
# 用途: merge=ours により現ブランチが優先された indexes/*.json を
#       マージ後にスクリプトで再生成し、最新状態に戻す。

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
SCRIPT="$REPO_ROOT/.claude/skills/aiworkflow-requirements/scripts/generate-index.js"

# node と生成スクリプトが両方存在する場合のみ実行（オプショナル）
if command -v node > /dev/null 2>&1 && [ -f "$SCRIPT" ]; then
  echo "[post-merge] indexes/*.json を再生成中..."
  node "$SCRIPT" --quiet
  echo "[post-merge] 再生成完了"
fi
