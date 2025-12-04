#!/bin/bash
# Claude Code 型チェックHook
# イベント: PostToolUse (Edit|Write)
# 目的: TypeScriptファイル編集後に型エラーを検出

set -euo pipefail

# 標準入力からJSONを読み取り
INPUT=$(cat)

# ファイルパスを抽出
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# ファイルパスが空の場合は終了
if [[ -z "$FILE_PATH" || "$FILE_PATH" == "null" ]]; then
  exit 0
fi

# TypeScript/TSXファイル以外は終了
case "$FILE_PATH" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac

# ファイルが存在しない場合は終了
if [[ ! -f "$FILE_PATH" ]]; then
  exit 0
fi

# プロジェクトルートを取得
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# tsconfig.jsonが存在する場合のみ実行
if [[ -f "$PROJECT_DIR/tsconfig.json" ]]; then
  cd "$PROJECT_DIR" 2>/dev/null || exit 0

  # 型チェック実行（エラーがあってもブロックしない、警告として表示）
  TYPE_ERRORS=$(pnpm tsc --noEmit 2>&1) || true

  if [[ -n "$TYPE_ERRORS" && "$TYPE_ERRORS" != *"error TS"* ]]; then
    # エラーなし
    exit 0
  fi

  # エラーがある場合は警告として出力（ブロックはしない）
  if [[ "$TYPE_ERRORS" == *"error TS"* ]]; then
    echo "⚠️ TypeScript型エラーを検出しました:"
    echo "$TYPE_ERRORS" | grep "error TS" | head -5
    # exit 0 でブロックせず警告のみ
  fi
fi

exit 0
