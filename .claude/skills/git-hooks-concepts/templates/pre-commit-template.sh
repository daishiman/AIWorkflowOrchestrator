#!/bin/bash
# Pre-commit Hook Template
# 目的: ステージ済みファイルのコード品質チェック
# 実行タイミング: git commitコマンド実行時

set -e  # エラーで即座に終了

# 色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'  # No Color

echo -e "${YELLOW}Running pre-commit checks...${NC}"

# ステージ済みファイルを取得
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR)

if [ -z "$STAGED_FILES" ]; then
  echo -e "${GREEN}✅ No staged files to check${NC}"
  exit 0
fi

# TypeScriptファイルの型チェック
TS_FILES=$(echo "$STAGED_FILES" | grep ".ts$" || true)
if [ ! -z "$TS_FILES" ]; then
  echo -e "${YELLOW}Checking TypeScript...${NC}"
  if ! npx tsc --noEmit; then
    echo -e "${RED}❌ TypeScript compilation failed${NC}"
    exit 1
  fi
fi

# フォーマット確認 (Prettier)
echo -e "${YELLOW}Checking code formatting...${NC}"
if ! npx prettier --check $STAGED_FILES; then
  echo -e "${RED}❌ Prettier formatting check failed${NC}"
  echo "Run: npx prettier --write ."
  exit 1
fi

# Lint確認 (ESLint)
JS_TS_FILES=$(echo "$STAGED_FILES" | grep -E "\.(js|ts)$" || true)
if [ ! -z "$JS_TS_FILES" ]; then
  echo -e "${YELLOW}Running ESLint...${NC}"
  if ! npx eslint $JS_TS_FILES; then
    echo -e "${RED}❌ ESLint check failed${NC}"
    exit 1
  fi
fi

echo -e "${GREEN}✅ All pre-commit checks passed${NC}"
exit 0
