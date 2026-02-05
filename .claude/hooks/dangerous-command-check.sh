#!/bin/bash
# Claude Code 危険コマンド警告Hook
# イベント: PreToolUse (Bash)
# 目的: 危険なコマンドの実行前に確認を促す / 禁止コマンドをブロック

set -euo pipefail

# 標準入力からJSONを読み取り
INPUT=$(cat)

# コマンドを抽出
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# コマンドが空の場合は終了
if [[ -z "$COMMAND" || "$COMMAND" == "null" ]]; then
  exit 0
fi

# ==========================================================================
# 🚫 完全禁止コマンド（exit 2 でブロック）
# ==========================================================================
BLOCKED_PATTERNS=(
  "--no-verify"
  "-n.*commit"  # git commit -n (--no-verify の短縮形)
)

for pattern in "${BLOCKED_PATTERNS[@]}"; do
  if [[ "$COMMAND" =~ $pattern ]]; then
    echo "🚫 禁止: --no-verify オプションは絶対に使用禁止です！"
    echo "   コマンド: $COMMAND"
    echo ""
    echo "   理由: pre-commit/pre-pushフックをスキップすると、"
    echo "   CIで初めてエラーが検出され、修正に余計な時間がかかります。"
    echo ""
    echo "   対処法: テストが失敗する場合は、テストを修正してください。"
    echo "   詳細は CLAUDE.md の「Git操作の禁止事項」を参照。"
    # exit 2 でブロック（Claude Codeはexit 2をブロックとして扱う）
    exit 2
  fi
done

# ==========================================================================
# ⚠️ 警告が必要なコマンドパターン（ブロックはしないが確認を促す）
# ==========================================================================
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
