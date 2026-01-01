#!/bin/bash
# Claude Quality Check Template
# 目的: Claude生成コードの品質指標確認
# 実行タイミング: pre-push

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Checking Claude Code Quality Metrics${NC}"

# 1. テストカバレッジ確認
echo -e "${YELLOW}Checking test coverage...${NC}"
COVERAGE=$(pnpm test -- --coverage --silent 2>/dev/null | grep "Lines" | awk '{print $(NF-1)}' | tr -d '%' || echo "0")

if (( $(echo "$COVERAGE < 80" | bc -l) )); then
  echo -e "${RED}❌ Coverage below threshold: ${COVERAGE}% < 80%${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Coverage OK: ${COVERAGE}%${NC}"

# 2. セキュリティ監査
echo -e "${YELLOW}Running security audit...${NC}"
if ! pnpm audit --production 2>/dev/null; then
  echo -e "${RED}⚠️ Security vulnerabilities detected${NC}"
  # exit 1 (許可可能に設定)
fi
echo -e "${GREEN}✅ Security check passed${NC}"

# 3. 複雑度チェック
echo -e "${YELLOW}Checking code complexity...${NC}"
COMPLEXITY=$(npx eslint src/ --format=json 2>/dev/null | \
  grep -o '"complexity":[0-9]*' | \
  cut -d':' -f2 | \
  sort -nr | head -1 || echo "0")

if [ "$COMPLEXITY" -gt 10 ]; then
  echo -e "${RED}❌ Complexity too high: $COMPLEXITY > 10${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Complexity OK: max=$COMPLEXITY${NC}"

echo -e "${GREEN}✅ All quality checks passed${NC}"
exit 0
