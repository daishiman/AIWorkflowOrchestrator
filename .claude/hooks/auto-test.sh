#!/bin/bash
# Claude Code テスト自動実行Hook
# イベント: PostToolUse (Edit|Write)
# 目的: ソースファイル編集後に関連テストを自動実行
# 対象: TypeScript, Next.js, Electron プロジェクト (Vitest/Jest)
#
# 環境変数:
#   CLAUDE_SKIP_HEAVY_HOOKS=1  - このフックをスキップ
#   CLAUDE_TEST_TIMEOUT        - タイムアウト秒数（デフォルト: 60）

set -euo pipefail

# 重いフックをスキップするオプション
if [[ "${CLAUDE_SKIP_HEAVY_HOOKS:-}" == "1" ]]; then
  exit 0
fi

# 標準入力からJSONを読み取り（タイムアウト付き）
INPUT=$(timeout 2 cat 2>/dev/null || echo '{}')

# ファイルパスを抽出
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null || echo "")

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

# タイムアウト設定（デフォルト120秒）
TIMEOUT_SEC="${CLAUDE_TEST_TIMEOUT:-120}"

# TypeScript/JavaScriptファイルのみ対象
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs)
    # ファイル名からベース名を取得
    BASENAME=$(basename "$FILE_PATH" | sed 's/\.[^.]*$//')

    # テストファイルのパターンを検索（タイムアウト5秒）
    TEST_FILE=""
    for ext in "test.ts" "test.tsx" "spec.ts" "spec.tsx" "test.js" "test.jsx"; do
      FOUND=$(timeout 5 find . -path "./node_modules" -prune -o -name "${BASENAME}.${ext}" -print 2>/dev/null | head -1)
      if [[ -n "$FOUND" ]]; then
        TEST_FILE="$FOUND"
        break
      fi
    done

    if [[ -n "$TEST_FILE" ]]; then
      echo "🧪 関連テスト実行: $TEST_FILE"
      # タイムアウト付きでVitest実行、なければJest
      timeout "$TIMEOUT_SEC" pnpm vitest run "$TEST_FILE" --reporter=dot 2>/dev/null || \
        timeout "$TIMEOUT_SEC" pnpm jest "$TEST_FILE" --silent 2>/dev/null || true

      if [[ $? -eq 124 ]]; then
        echo "⏱️ テストがタイムアウトしました（${TIMEOUT_SEC}秒）"
      fi
    fi
    ;;
esac

exit 0
