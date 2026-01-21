#!/bin/bash
# pre-delete-spec.sh
#
# タスク仕様書が削除される前にIssue番号をキャッシュするフック
#
# トリガー: PreToolUse (Bash)
# 対象: docs/30-workflows/unassigned-task/task-*.md を削除するコマンド
#
# 動作:
# - rm コマンドが spec ファイルを削除しようとしている場合
# - issue_number を一時ファイルにキャッシュ
# - PostToolUse で close_issue.js が実行される

set -e

# 環境変数からBashコマンドを取得
TOOL_INPUT="${CLAUDE_TOOL_INPUT:-}"

# Bashツールでない場合は終了
if [ "${CLAUDE_TOOL_NAME:-}" != "Bash" ]; then
  exit 0
fi

# コマンドが空の場合は終了
if [ -z "$TOOL_INPUT" ]; then
  exit 0
fi

# rm コマンドでない場合は終了
if ! echo "$TOOL_INPUT" | grep -qE '^\s*rm\s'; then
  exit 0
fi

# 対象ディレクトリのファイルを削除しようとしているかチェック
TARGET_DIR="docs/30-workflows/unassigned-task"
if ! echo "$TOOL_INPUT" | grep -qE "${TARGET_DIR}/task-.*\.md"; then
  exit 0
fi

# 削除対象のファイルパスを抽出
SPEC_FILE=$(echo "$TOOL_INPUT" | grep -oE "${TARGET_DIR}/task-[^[:space:]]+\.md" | head -1)

if [ -z "$SPEC_FILE" ]; then
  exit 0
fi

# 絶対パスに変換
if [ -n "$CLAUDE_PROJECT_DIR" ]; then
  FULL_PATH="$CLAUDE_PROJECT_DIR/$SPEC_FILE"
else
  FULL_PATH="$SPEC_FILE"
fi

# ファイルが存在しない場合は終了
if [ ! -f "$FULL_PATH" ]; then
  exit 0
fi

# issue_number を抽出
ISSUE_NUMBER=$(grep -E "^issue_number:\s*" "$FULL_PATH" 2>/dev/null | sed 's/issue_number:\s*//' | tr -d '[:space:]')

if [ -z "$ISSUE_NUMBER" ]; then
  exit 0
fi

# キャッシュディレクトリを作成
CACHE_DIR="${TMPDIR:-/tmp}/claude-issue-cache"
mkdir -p "$CACHE_DIR"

# Issue番号をキャッシュ
CACHE_FILE="$CACHE_DIR/pending-close-$$.txt"
echo "$ISSUE_NUMBER" > "$CACHE_FILE"
echo "$SPEC_FILE" >> "$CACHE_FILE"

echo "📝 削除予定: $SPEC_FILE (Issue #$ISSUE_NUMBER)" >&2

exit 0
