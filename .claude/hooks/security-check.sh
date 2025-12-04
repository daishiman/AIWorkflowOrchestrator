#!/bin/bash
# Claude Code セキュリティ検証Hook
# イベント: PreToolUse (Write|Edit|Bash)
# 目的: 禁止ファイル・危険操作の事前検証

set -euo pipefail

# 標準入力からJSONを読み取り
INPUT=$(cat)

# ツール名とファイルパスを抽出
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# 禁止ファイルパターン
FORBIDDEN_FILE_PATTERNS=(
  "\.env$"
  "\.env\."
  "secrets"
  "credentials"
  "\.pem$"
  "\.key$"
  "id_rsa"
  "id_ed25519"
  "\.ssh/"
  "password"
  "apikey"
  "api_key"
  "secret_key"
)

# Write/Edit操作の場合
if [[ "$TOOL_NAME" == "Write" || "$TOOL_NAME" == "Edit" ]]; then
  if [[ -n "$FILE_PATH" && "$FILE_PATH" != "null" ]]; then
    for pattern in "${FORBIDDEN_FILE_PATTERNS[@]}"; do
      if [[ "$FILE_PATH" =~ $pattern ]]; then
        # JSON形式で拒否決定を出力
        cat << EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "セキュリティ: 機密ファイルへのアクセスは禁止されています: $pattern"
  },
  "continue": false,
  "stopReason": "Security: Protected file pattern matched"
}
EOF
        exit 2
      fi
    done
  fi
fi

# Bash操作の場合の危険コマンドチェック
if [[ "$TOOL_NAME" == "Bash" && -n "$COMMAND" && "$COMMAND" != "null" ]]; then
  # 危険なコマンドパターン（確認が必要）
  DANGEROUS_PATTERNS=(
    "rm -rf /"
    "rm -rf ~"
    "rm -rf \*"
    "> /dev/sda"
    "mkfs\."
    "dd if="
    ":(){:|:&};:"
  )

  for pattern in "${DANGEROUS_PATTERNS[@]}"; do
    if [[ "$COMMAND" == *"$pattern"* ]]; then
      cat << EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "セキュリティ: 危険なコマンドが検出されました: $pattern"
  },
  "continue": false,
  "stopReason": "Security: Dangerous command detected"
}
EOF
      exit 2
    fi
  done
fi

# 許可
cat << EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "permissionDecisionReason": "セキュリティチェック完了"
  },
  "continue": true
}
EOF

exit 0
