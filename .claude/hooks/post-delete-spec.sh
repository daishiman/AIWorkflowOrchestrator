#!/bin/bash
# post-delete-spec.sh
#
# タスク仕様書削除後にGitHub Issueをクローズするフック
#
# トリガー: PostToolUse (Bash)
# 対象: pre-delete-spec.sh でキャッシュされたIssue
#
# 動作:
# - キャッシュされたIssue番号があれば、Issueをクローズ
# - クローズ後、キャッシュファイルを削除

set -e

# Bashツールでない場合は終了
if [ "${CLAUDE_TOOL_NAME:-}" != "Bash" ]; then
  exit 0
fi

# キャッシュディレクトリ
CACHE_DIR="${TMPDIR:-/tmp}/claude-issue-cache"

# キャッシュファイルがない場合は終了
if [ ! -d "$CACHE_DIR" ]; then
  exit 0
fi

# 保留中のクローズ処理を実行
for CACHE_FILE in "$CACHE_DIR"/pending-close-*.txt; do
  [ -f "$CACHE_FILE" ] || continue

  ISSUE_NUMBER=$(head -1 "$CACHE_FILE")
  SPEC_FILE=$(tail -1 "$CACHE_FILE")

  if [ -z "$ISSUE_NUMBER" ]; then
    rm -f "$CACHE_FILE"
    continue
  fi

  # ファイルが本当に削除されたか確認
  if [ -n "$CLAUDE_PROJECT_DIR" ]; then
    FULL_PATH="$CLAUDE_PROJECT_DIR/$SPEC_FILE"
  else
    FULL_PATH="$SPEC_FILE"
  fi

  if [ -f "$FULL_PATH" ]; then
    # ファイルがまだ存在する場合（削除されなかった）
    rm -f "$CACHE_FILE"
    continue
  fi

  # gh CLI の認証状態を確認
  if ! gh auth status &>/dev/null; then
    echo "⚠ gh CLIが認証されていません。Issue #$ISSUE_NUMBER のクローズをスキップします。" >&2
    rm -f "$CACHE_FILE"
    continue
  fi

  # close_issue.js スクリプトのパス
  CLOSE_SCRIPT="$CLAUDE_PROJECT_DIR/.claude/skills/github-issue-manager/scripts/close_issue.js"

  if [ -f "$CLOSE_SCRIPT" ]; then
    echo "🔄 Issue #$ISSUE_NUMBER をクローズ中..." >&2
    cd "$CLAUDE_PROJECT_DIR"
    if node "$CLOSE_SCRIPT" --number "$ISSUE_NUMBER" --reason "タスク仕様書 $SPEC_FILE が削除されました" 2>/dev/null; then
      echo "✅ Issue #$ISSUE_NUMBER をクローズしました" >&2
    else
      # スクリプト失敗時は gh コマンドで直接クローズ
      echo "⚠ スクリプト失敗、直接クローズを試行..." >&2
      if gh issue close "$ISSUE_NUMBER" -c "🤖 自動クローズ: タスク仕様書が削除されました"; then
        echo "✅ Issue #$ISSUE_NUMBER をクローズしました" >&2
      else
        echo "❌ Issue #$ISSUE_NUMBER のクローズに失敗しました" >&2
      fi
    fi
  else
    # スクリプトがない場合は gh コマンドで直接クローズ
    echo "🔄 Issue #$ISSUE_NUMBER をクローズ中..." >&2
    cd "$CLAUDE_PROJECT_DIR"
    if gh issue close "$ISSUE_NUMBER" -c "🤖 自動クローズ: タスク仕様書が削除されました"; then
      echo "✅ Issue #$ISSUE_NUMBER をクローズしました" >&2
    else
      echo "❌ Issue #$ISSUE_NUMBER のクローズに失敗しました" >&2
    fi
  fi

  # キャッシュファイルを削除
  rm -f "$CACHE_FILE"
done

exit 0
