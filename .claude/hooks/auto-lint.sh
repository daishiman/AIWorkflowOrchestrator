#!/bin/bash
# Claude Code 自動LintHook
# イベント: PostToolUse (Edit|Write)
# 目的: ファイル編集後に自動でESLintを実行（自動修正）
# 対象: TypeScript, Next.js, Electron プロジェクト

set -euo pipefail

# 標準入力からJSONを読み取り
INPUT=$(cat)

# ファイルパスを抽出
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# ファイルパスが空の場合は終了
if [[ -z "$FILE_PATH" || "$FILE_PATH" == "null" ]]; then
  exit 0
fi

# ファイルが存在しない場合は終了
if [[ ! -f "$FILE_PATH" ]]; then
  exit 0
fi

# プロジェクトルートを取得
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# ファイルの拡張子に基づいてLinterを実行
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs)
    # TypeScript/JavaScriptファイル: ESLintで自動修正
    cd "$PROJECT_DIR" 2>/dev/null || exit 0
    # --fixで自動修正、エラーは無視（次回の型チェックで検出）
    pnpm eslint --fix "$FILE_PATH" 2>/dev/null || true
    ;;
  *.css|*.scss|*.less)
    # CSSファイル: stylelintで自動修正
    cd "$PROJECT_DIR" 2>/dev/null || exit 0
    pnpm stylelint --fix "$FILE_PATH" 2>/dev/null || true
    ;;
esac

exit 0
