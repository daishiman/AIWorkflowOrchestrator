#!/bin/bash
# Pre-push Hook Template
# 目的: プッシュ前のテスト・ビルド確認
# 実行タイミング: git pushコマンド実行時

set -e  # エラーで即座に終了

# 色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'  # No Color

echo -e "${YELLOW}Running pre-push checks...${NC}"

# テスト実行
echo -e "${YELLOW}Running tests...${NC}"
if ! pnpm test; then
  echo -e "${RED}❌ Tests failed${NC}"
  exit 1
fi

# ビルド確認
echo -e "${YELLOW}Building project...${NC}"
if ! pnpm run build; then
  echo -e "${RED}❌ Build failed${NC}"
  exit 1
fi

# Linting確認
echo -e "${YELLOW}Running linter...${NC}"
if ! pnpm run lint; then
  echo -e "${RED}❌ Linting failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ All pre-push checks passed${NC}"
exit 0
