#!/bin/bash
# CI検証スクリプト - ローカルでCIパイプラインと同等のチェックを実行
# Usage: ./scripts/validate-ci.sh [--quick]

set -e

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# フラグ
QUICK_MODE=false
if [[ "$1" == "--quick" ]]; then
    QUICK_MODE=true
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  CI Validation Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 結果追跡
LINT_RESULT=0
TYPECHECK_RESULT=0
TEST_RESULT=0
BUILD_RESULT=0

# 1. Lint チェック
echo -e "${YELLOW}[1/4] Running lint...${NC}"
if pnpm lint; then
    echo -e "${GREEN}✓ Lint passed${NC}"
else
    echo -e "${RED}✗ Lint failed${NC}"
    LINT_RESULT=1
fi
echo ""

# 2. TypeScript 型チェック
echo -e "${YELLOW}[2/4] Running typecheck...${NC}"
echo "Building shared package first..."
if pnpm --filter @repo/shared build > /dev/null 2>&1; then
    if pnpm typecheck; then
        echo -e "${GREEN}✓ Typecheck passed${NC}"
    else
        echo -e "${RED}✗ Typecheck failed${NC}"
        TYPECHECK_RESULT=1
    fi
else
    echo -e "${RED}✗ Shared package build failed${NC}"
    TYPECHECK_RESULT=1
fi
echo ""

# 3. テスト実行
echo -e "${YELLOW}[3/4] Running tests...${NC}"
if $QUICK_MODE; then
    echo "(Quick mode: skipping tests)"
    echo -e "${YELLOW}⚠ Tests skipped${NC}"
else
    if pnpm --filter @repo/shared test:run && pnpm --filter @repo/desktop test:run; then
        echo -e "${GREEN}✓ Tests passed${NC}"
    else
        echo -e "${RED}✗ Tests failed${NC}"
        TEST_RESULT=1
    fi
fi
echo ""

# 4. ビルド確認
echo -e "${YELLOW}[4/4] Running build check...${NC}"
if $QUICK_MODE; then
    echo "(Quick mode: checking existing build artifacts only)"
    if [[ -d "packages/shared/dist" ]]; then
        echo -e "${GREEN}✓ Shared package artifacts exist${NC}"
    else
        echo -e "${YELLOW}⚠ Shared package not built${NC}"
    fi
else
    if pnpm --filter @repo/desktop build; then
        echo -e "${GREEN}✓ Build passed${NC}"

        # アーティファクト確認
        if [[ -d "packages/shared/dist" ]]; then
            echo -e "${GREEN}  ✓ packages/shared/dist exists${NC}"
        else
            echo -e "${RED}  ✗ packages/shared/dist missing${NC}"
            BUILD_RESULT=1
        fi

        if [[ -d "apps/desktop/out" ]]; then
            echo -e "${GREEN}  ✓ apps/desktop/out exists${NC}"
        else
            echo -e "${RED}  ✗ apps/desktop/out missing${NC}"
            BUILD_RESULT=1
        fi
    else
        echo -e "${RED}✗ Build failed${NC}"
        BUILD_RESULT=1
    fi
fi
echo ""

# 結果サマリー
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Results Summary${NC}"
echo -e "${BLUE}========================================${NC}"

TOTAL_FAILURES=$((LINT_RESULT + TYPECHECK_RESULT + TEST_RESULT + BUILD_RESULT))

if [[ $LINT_RESULT -eq 0 ]]; then
    echo -e "${GREEN}✓ Lint${NC}"
else
    echo -e "${RED}✗ Lint${NC}"
fi

if [[ $TYPECHECK_RESULT -eq 0 ]]; then
    echo -e "${GREEN}✓ Typecheck${NC}"
else
    echo -e "${RED}✗ Typecheck${NC}"
fi

if $QUICK_MODE; then
    echo -e "${YELLOW}⚠ Tests (skipped)${NC}"
else
    if [[ $TEST_RESULT -eq 0 ]]; then
        echo -e "${GREEN}✓ Tests${NC}"
    else
        echo -e "${RED}✗ Tests${NC}"
    fi
fi

if [[ $BUILD_RESULT -eq 0 ]]; then
    echo -e "${GREEN}✓ Build${NC}"
else
    echo -e "${RED}✗ Build${NC}"
fi

echo ""

if [[ $TOTAL_FAILURES -eq 0 ]]; then
    echo -e "${GREEN}All checks passed! Ready to create PR.${NC}"
    exit 0
else
    echo -e "${RED}$TOTAL_FAILURES check(s) failed. Please fix before creating PR.${NC}"
    exit 1
fi
