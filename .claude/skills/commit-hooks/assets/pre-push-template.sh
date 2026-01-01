#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# pre-push: 重要なチェックのみを実行する例
# 例: 変更範囲のテストを実行
if command -v pnpm >/dev/null 2>&1; then
  pnpm -r test --filter=... || exit 1
else
  echo "pnpm が見つかりません" >&2
  exit 1
fi
