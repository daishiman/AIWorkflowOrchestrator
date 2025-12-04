#!/bin/bash
# Claude Code 自動フォーマットHook
# イベント: PostToolUse (Edit|Write)
# 目的: ファイル編集後に自動でPrettierを実行
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

# pnpmでPrettierを実行
run_prettier() {
  cd "$PROJECT_DIR" 2>/dev/null || return
  pnpm prettier --write "$FILE_PATH" 2>/dev/null || true
}

# ファイルの拡張子に基づいてフォーマッタを実行
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs)
    # TypeScript/JavaScriptファイル
    run_prettier
    ;;
  *.json)
    # JSONファイル
    run_prettier
    ;;
  *.md|*.mdx)
    # Markdownファイル
    run_prettier
    ;;
  *.css|*.scss|*.less)
    # CSSファイル
    run_prettier
    ;;
  *.html|*.htm)
    # HTMLファイル
    run_prettier
    ;;
  *.yaml|*.yml)
    # YAMLファイル
    run_prettier
    ;;
esac

exit 0
