#!/bin/bash

# 基本テスト実行スクリプト
# APIキー不要なテスト（TC-01, TC-02, TC-09, TC-10）のみを実行します

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "==========================================================="
echo "基本テスト実行（APIキー不要）"
echo "==========================================================="
echo ""

TOTAL=0
PASSED=0
FAILED=0

run_test() {
  local test_name=$1
  local test_file=$2

  echo "-----------------------------------------------------------"
  echo "[$((TOTAL + 1))] $test_name"
  echo "-----------------------------------------------------------"

  if pnpm tsx "scripts/$test_file" > /dev/null 2>&1; then
    echo "✅ PASS"
    PASSED=$((PASSED + 1))
  else
    echo "❌ FAIL"
    FAILED=$((FAILED + 1))
  fi

  TOTAL=$((TOTAL + 1))
  echo ""
}

# テスト実行
run_test "TC-01: Markdownチャンキング" "tc01-chunking.ts"
run_test "TC-02: コードチャンキング" "tc02-code-chunking.ts"
run_test "TC-09: エラーハンドリング" "tc09-error-handling.ts"
run_test "TC-10: 差分更新" "tc10-incremental.ts"

# サマリー
echo "==========================================================="
echo "実行結果サマリー"
echo "==========================================================="
echo "総テスト数: $TOTAL"
echo "合格: $PASSED"
echo "不合格: $FAILED"
echo "成功率: $(awk "BEGIN {printf \"%.1f\", ($PASSED/$TOTAL)*100}")%"
echo ""

if [ $FAILED -eq 0 ]; then
  echo "✅ 全テスト合格"
  exit 0
else
  echo "❌ $FAILED 件のテストが失敗"
  exit 1
fi
