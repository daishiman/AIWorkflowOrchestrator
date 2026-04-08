#!/usr/bin/env bash
# git フックインストーラー（冪等）
# 使い方: bash .claude/scripts/install-git-hooks.sh
#
# このスクリプトは何度実行しても安全（冪等）です。
# すでに同じフックが存在する場合は上書きします。

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
SOURCE_DIR="$REPO_ROOT/.claude/hooks"
HOOK_PATH="$(git rev-parse --git-path hooks/post-merge)"
HOOK_DIR="$(dirname "$HOOK_PATH")"

# hooks ディレクトリが存在しない場合は作成
mkdir -p "$HOOK_DIR"

# post-merge フックをインストール
SOURCE="$SOURCE_DIR/post-merge-index-regenerate.sh"
if [ -f "$SOURCE" ]; then
  cp "$SOURCE" "$HOOK_PATH"
  chmod +x "$HOOK_PATH"
  echo "[hooks] post-merge フックのインストール完了: $HOOK_PATH"
else
  echo "[hooks] 警告: $SOURCE が見つかりません。スキップします。"
fi
