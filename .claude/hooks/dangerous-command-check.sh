#!/bin/bash
# Claude Code 危険コマンド警告Hook
# イベント: PreToolUse (Bash)
# 目的: 危険なコマンドの実行前に確認を促す

set -euo pipefail

# 標準入力からJSONを読み取り
INPUT=$(cat)

# コマンドを抽出
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# コマンドが空の場合は終了
if [[ -z "$COMMAND" || "$COMMAND" == "null" ]]; then
  exit 0
fi

# 警告が必要なコマンドパターン（ブロックはしないが確認を促す）
WARNING_PATTERNS=(
  "git push --force"
  "git push -f"
  "git reset --hard"
  "git clean -fd"
  "rm -rf"
  "sudo rm"
  "DROP TABLE"
  "DROP DATABASE"
  "TRUNCATE"
  "DELETE FROM.*WHERE"
  "chmod 777"
  "chmod -R"
)

for pattern in "${WARNING_PATTERNS[@]}"; do
  if [[ "$COMMAND" =~ $pattern ]]; then
    # 警告メッセージを出力（ブロックはしない）
    echo "⚠️ 注意: 危険な可能性のあるコマンドを検出しました: $pattern"
    echo "   コマンド: $COMMAND"
    # exit 0 でブロックせず警告のみ
    exit 0
  fi
done

exit 0
