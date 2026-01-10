#!/bin/bash
# Pre-commit Hook Template for Secret Detection
# このファイルを .git/hooks/pre-commit に配置してください

set -e

# カラー出力
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔍 Checking for secrets...${NC}"

# ═══════════════════════════════════════════════════
# 検出パターン定義
# ═══════════════════════════════════════════════════

declare -A PATTERNS=(
  # Generic Secrets
  ["Generic Password"]='(password|passwd|pwd)\s*[:=]\s*["'"'"'][^"'"'"']{8,}["'"'"']'
  ["Generic API Key"]='(api[_-]?key|apikey)\s*[:=]\s*["'"'"'][a-zA-Z0-9]{20,}["'"'"']'
  ["Generic Secret"]='(secret[_-]?key|token)\s*[:=]\s*["'"'"'][^"'"'"']{20,}["'"'"']'

  # Cloud Provider Keys
  ["AWS Access Key"]='AKIA[0-9A-Z]{16}'
  ["Google API Key"]='AIza[0-9A-Za-z\\-_]{35}'
  ["OpenAI API Key"]='sk-proj-[a-zA-Z0-9]{48}'
  ["Anthropic API Key"]='sk-ant-api03-[a-zA-Z0-9_-]{95}'
  ["Stripe API Key"]='sk_live_[0-9a-zA-Z]{24,}'
  ["GitHub Token"]='(ghp|github_pat)_[a-zA-Z0-9]{36,}'

  # Connection Strings
  ["Turso Connection"]='libsql://[^:]+:[^@]+@[^/]+'
  ["Turso Auth Token"]='eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+'
  ["MySQL Connection"]='mysql://[^:]+:[^@]+@[^/]+'
  ["MongoDB Connection"]='mongodb(\+srv)?://[^:]+:[^@]+'

  # Private Keys
  ["Private Key"]='-----BEGIN .* PRIVATE KEY-----'

  # Discord
  ["Discord Webhook"]='https://discord\.com/api/webhooks/\d+/[a-zA-Z0-9_-]+'
)

# ═══════════════════════════════════════════════════
# ホワイトリスト（誤検知除外）
# ═══════════════════════════════════════════════════

WHITELIST_FILES=(
  ".env.example"
  ".env.template"
  "tests/fixtures/"
  "tests/mocks/"
  "docs/examples/"
)

WHITELIST_STRINGS=(
  "example"
  "sample"
  "test"
  "mock"
  "fixture"
  "placeholder"
  "your-api-key-here"
)

# ═══════════════════════════════════════════════════
# ホワイトリストチェック関数
# ═══════════════════════════════════════════════════

is_whitelisted() {
  local file=$1
  local content=$2

  # ファイルパスチェック
  for whitelist in "${WHITELIST_FILES[@]}"; do
    if [[ "$file" == *"$whitelist"* ]]; then
      return 0  # ホワイトリスト
    fi
  done

  # コンテンツチェック
  for whitelist_str in "${WHITELIST_STRINGS[@]}"; do
    if echo "$content" | grep -qi "$whitelist_str"; then
      return 0  # ホワイトリスト
    fi
  done

  return 1  # ホワイトリストなし
}

# ═══════════════════════════════════════════════════
# メイン検出ロジック
# ═══════════════════════════════════════════════════

DETECTED=0
FILES=$(git diff --cached --name-only --diff-filter=ACM)

for FILE in $FILES; do
  # バイナリファイルをスキップ
  if git diff --cached --numstat "$FILE" | grep -q "^-"; then
    continue
  fi

  # ファイル内容を取得
  CONTENT=$(git diff --cached "$FILE")

  # 各パターンでチェック
  for PATTERN_NAME in "${!PATTERNS[@]}"; do
    PATTERN="${PATTERNS[$PATTERN_NAME]}"

    if echo "$CONTENT" | grep -qEi "$PATTERN"; then
      # ホワイトリストチェック
      MATCHED_LINE=$(echo "$CONTENT" | grep -Ei "$PATTERN" | head -1)

      if is_whitelisted "$FILE" "$MATCHED_LINE"; then
        echo -e "${YELLOW}⚠️  Whitelisted: $PATTERN_NAME in $FILE${NC}"
        continue
      fi

      # Secret検出！
      echo -e "${RED}🚨 SECRET DETECTED: $PATTERN_NAME in $FILE${NC}"
      echo -e "${RED}   Pattern: $PATTERN${NC}"
      echo -e "${RED}   Line: $MATCHED_LINE${NC}"
      echo ""
      DETECTED=1
    fi
  done
done

# ═══════════════════════════════════════════════════
# 結果判定
# ═══════════════════════════════════════════════════

if [ $DETECTED -eq 1 ]; then
  echo -e "${RED}❌ COMMIT BLOCKED: Secrets detected${NC}"
  echo ""
  echo "🔧 How to fix:"
  echo "  1. Remove the secret from the file"
  echo "  2. Add it to .env or secret management system (Railway Secrets, etc.)"
  echo "  3. Update your code to read from environment variables"
  echo "  4. If this is a false positive, add to whitelist in this hook"
  echo ""
  echo "📖 For more info:"
  echo "  - See docs/security/secret-management.md"
  echo "  - Contact security team"
  echo ""
  exit 1
fi

echo -e "${GREEN}✅ No secrets detected${NC}"
exit 0
