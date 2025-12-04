#!/bin/bash
# Claude Code テスト自動実行Hook
# イベント: PostToolUse (Edit|Write)
# 目的: ソースファイル編集後に関連テストを自動実行
# 対象: TypeScript, Next.js, Electron プロジェクト (Vitest/Jest)

set -euo pipefail

# 標準入力からJSONを読み取り
INPUT=$(cat)

# ファイルパスを抽出
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# ファイルパスが空の場合は終了
if [[ -z "$FILE_PATH" || "$FILE_PATH" == "null" ]]; then
  exit 0
fi

# テストファイル自体の編集は除外（無限ループ防止）
if [[ "$FILE_PATH" == *.test.* || "$FILE_PATH" == *.spec.* || "$FILE_PATH" == *__tests__* ]]; then
  exit 0
fi

# プロジェクトルートを取得
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$PROJECT_DIR" 2>/dev/null || exit 0

# TypeScript/JavaScriptファイルのみ対象
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs)
    # ファイル名からベース名を取得
    BASENAME=$(basename "$FILE_PATH" | sed 's/\.[^.]*$//')

    # テストファイルのパターンを検索
    TEST_FILE=""
    for pattern in "**/${BASENAME}.test.ts" "**/${BASENAME}.test.tsx" "**/${BASENAME}.spec.ts" "**/${BASENAME}.spec.tsx" "**/${BASENAME}.test.js" "**/${BASENAME}.test.jsx"; do
      FOUND=$(find . -path "./node_modules" -prune -o -name "$(basename "$pattern")" -print 2>/dev/null | head -1)
      if [[ -n "$FOUND" ]]; then
        TEST_FILE="$FOUND"
        break
      fi
    done

    if [[ -n "$TEST_FILE" ]]; then
      echo "🧪 関連テスト実行: $TEST_FILE"
      # Vitestを優先、なければJest
      pnpm vitest run "$TEST_FILE" --reporter=dot 2>/dev/null || pnpm jest "$TEST_FILE" --silent 2>/dev/null || true
    fi
    ;;
esac

exit 0
