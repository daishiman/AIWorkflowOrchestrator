#!/bin/bash
# Claude Code バックアップ作成Hook
# イベント: PreToolUse (Write|Edit)
# 目的: ファイル編集前に自動バックアップを作成

set -euo pipefail

# 標準入力からJSONを読み取り
INPUT=$(cat)

# ファイルパスを抽出
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# ファイルパスが空の場合は終了
if [[ -z "$FILE_PATH" || "$FILE_PATH" == "null" ]]; then
  exit 0
fi

# ファイルが存在しない場合は終了（新規作成の場合）
if [[ ! -f "$FILE_PATH" ]]; then
  exit 0
fi

# バックアップディレクトリ
BACKUP_DIR="${HOME}/.claude/backups"
mkdir -p "$BACKUP_DIR"

# タイムスタンプ
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')

# ファイル名を安全な形式に変換
SAFE_NAME=$(echo "$FILE_PATH" | tr '/' '_' | tr ' ' '_')

# バックアップファイル作成
BACKUP_FILE="${BACKUP_DIR}/${TIMESTAMP}_${SAFE_NAME}"
cp "$FILE_PATH" "$BACKUP_FILE" 2>/dev/null || true

# 古いバックアップの削除（100個を超えたら古いものから削除）
BACKUP_COUNT=$(find "$BACKUP_DIR" -type f | wc -l)
if [[ $BACKUP_COUNT -gt 100 ]]; then
  find "$BACKUP_DIR" -type f -printf '%T+ %p\n' | sort | head -20 | cut -d' ' -f2- | xargs rm -f 2>/dev/null || true
fi

exit 0
