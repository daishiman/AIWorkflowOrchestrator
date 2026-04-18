#!/usr/bin/env bash
# post-merge フック: aiworkflow-requirements の indexes/*.md / *.json を自動再生成
# インストール先: git rev-parse --git-path hooks/post-merge
#
# 用途: merge=ours により現ブランチが優先された aiworkflow-requirements の
#       generated index をマージ後に再生成し、最新状態に戻す。

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
SCRIPT="$REPO_ROOT/.claude/skills/aiworkflow-requirements/scripts/generate-index.js"

# node と生成スクリプトが両方存在する場合のみ実行（オプショナル）
if command -v node > /dev/null 2>&1 && [ -f "$SCRIPT" ]; then
  echo "[post-merge] aiworkflow-requirements indexes (*.md / *.json) を再生成中..."
  node "$SCRIPT" --quiet
  echo "[post-merge] 再生成完了"
fi
