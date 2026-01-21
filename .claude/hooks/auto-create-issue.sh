#!/bin/bash
# auto-create-issue.sh
#
# docs/30-workflows/unassigned-task/ 配下のタスク仕様書が作成・更新されたとき、
# 自動的にGitHub Issueを作成または更新するフック
#
# トリガー: PostToolUse (Edit|Write)
# 対象: docs/30-workflows/unassigned-task/task-*.md
#
# 動作:
# - 新規ファイル: Issueを作成し、issue_number を仕様書に書き戻す
# - 既存ファイル（issue_number あり）: Issueを更新

set -e

# 環境変数から対象ファイルパスを取得
FILE_PATH="${CLAUDE_FILE_PATH:-}"

# ファイルパスが空の場合は終了
if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# 対象ディレクトリとファイルパターンをチェック
TARGET_DIR="docs/30-workflows/unassigned-task"
if [[ ! "$FILE_PATH" =~ ${TARGET_DIR}/task-.*\.md$ ]]; then
  exit 0
fi

# 相対パスに変換
RELATIVE_PATH="${FILE_PATH#$CLAUDE_PROJECT_DIR/}"
RELATIVE_PATH="${RELATIVE_PATH#./}"

# タスク仕様書ファイルの存在確認
if [ ! -f "$CLAUDE_PROJECT_DIR/$RELATIVE_PATH" ]; then
  exit 0
fi

# スクリプトパス
CREATE_SCRIPT="$CLAUDE_PROJECT_DIR/.claude/skills/github-issue-manager/scripts/create_issue.js"

# スクリプトの存在確認
if [ ! -f "$CREATE_SCRIPT" ]; then
  echo "⚠ Issue作成スクリプトが見つかりません: $CREATE_SCRIPT" >&2
  exit 0
fi

# gh CLIの認証状態を確認
if ! gh auth status &>/dev/null; then
  echo "⚠ gh CLIが認証されていません。Issue同期をスキップします。" >&2
  exit 0
fi

# issue_number の有無をチェック
if grep -q "^issue_number:" "$CLAUDE_PROJECT_DIR/$RELATIVE_PATH" 2>/dev/null; then
  ACTION="更新"
else
  ACTION="作成"
fi

# Issue作成/更新を実行
echo "📝 タスク仕様書を検出: $RELATIVE_PATH"
echo "🔄 GitHub Issue ${ACTION}中..."

cd "$CLAUDE_PROJECT_DIR"
if node "$CREATE_SCRIPT" --spec "$RELATIVE_PATH" 2>/dev/null; then
  echo "✅ GitHub Issue ${ACTION}完了"
else
  echo "⚠ Issue ${ACTION}をスキップ（失敗）" >&2
fi

exit 0
