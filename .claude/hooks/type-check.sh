#!/bin/bash
# Claude Code 型チェックHook
# イベント: PostToolUse (Edit|Write)
# 目的: TypeScriptファイル編集後に型エラーを検出
#
# 環境変数:
#   CLAUDE_SKIP_HEAVY_HOOKS=1  - このフックをスキップ
#   CLAUDE_TYPECHECK_TIMEOUT   - タイムアウト秒数（デフォルト: 30）

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

# タイムアウト設定（デフォルト60秒）
TIMEOUT_SEC="${CLAUDE_TYPECHECK_TIMEOUT:-60}"

# tsconfig.jsonが存在する場合のみ実行
if [[ -f "$PROJECT_DIR/tsconfig.json" ]]; then
  cd "$PROJECT_DIR" 2>/dev/null || exit 0

  # 変更ファイルのみを型チェック（軽量化）
  # timeout コマンドで確実にタイムアウト
  TYPE_ERRORS=$(timeout "$TIMEOUT_SEC" pnpm tsc --noEmit "$FILE_PATH" 2>&1) || true

  # タイムアウトした場合
  if [[ $? -eq 124 ]]; then
    echo "⏱️ 型チェックがタイムアウトしました（${TIMEOUT_SEC}秒）"
    exit 0
  fi

  # エラーがある場合は警告として出力（ブロックはしない）
  if [[ "$TYPE_ERRORS" == *"error TS"* ]]; then
    echo "⚠️ TypeScript型エラーを検出しました:"
    echo "$TYPE_ERRORS" | grep "error TS" | head -5
  fi
fi

exit 0
