#!/bin/bash
# Claude Code Commit Hook Template
# 目的: Claude Code生成コードのコミット前検証
# 実行タイミ: git commitコマンド実行時

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Claude Code Commit Validation${NC}"

# 1. TypeScript型チェック
echo -e "${YELLOW}Checking TypeScript...${NC}"
if ! npx tsc --noEmit; then
  echo -e "${RED}❌ TypeScript check failed${NC}"
  exit 1
fi
echo -e "${GREEN}✅ TypeScript OK${NC}"

# 2. ESLint
echo -e "${YELLOW}Running ESLint...${NC}"
STAGED_FILES=$(git diff --cached --name-only | grep -E "\.(ts|js)$" || true)
if [ ! -z "$STAGED_FILES" ]; then
  if ! npx eslint $STAGED_FILES; then
    echo -e "${RED}❌ ESLint check failed${NC}"
    exit 1
  fi
fi
echo -e "${GREEN}✅ ESLint OK${NC}"

# 3. テスト実行
echo -e "${YELLOW}Running tests...${NC}"
if ! npm test -- --bail 2>&1; then
  echo -e "${RED}❌ Tests failed${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Tests passed${NC}"

echo -e "${GREEN}✅ All Claude Code checks passed${NC}"
exit 0
