#!/bin/bash
# Claude Code 操作ログ記録Hook
# イベント: PostToolUse (*)
# 目的: 全操作を監査ログに記録

set -euo pipefail

# 標準入力からJSONを読み取り
INPUT=$(cat)

# ログディレクトリ
LOG_DIR="${HOME}/.claude/logs"
LOG_FILE="${LOG_DIR}/operations.log"

# ログディレクトリがなければ作成
mkdir -p "$LOG_DIR"

# 情報を抽出
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // "unknown"')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.command // "N/A"' | head -c 100)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"')
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# ログに記録
echo "${TIMESTAMP} | ${SESSION_ID:0:8} | ${TOOL_NAME} | ${FILE_PATH}" >> "$LOG_FILE"

# ログローテーション（10000行を超えたら古いものを削除）
if [[ -f "$LOG_FILE" ]]; then
  LINE_COUNT=$(wc -l < "$LOG_FILE")
  if [[ $LINE_COUNT -gt 10000 ]]; then
    tail -5000 "$LOG_FILE" > "${LOG_FILE}.tmp"
    mv "${LOG_FILE}.tmp" "$LOG_FILE"
  fi
fi

exit 0
