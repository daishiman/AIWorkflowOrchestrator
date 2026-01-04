#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# commit-msg: メッセージ規約チェックの実行例
# 例: commitlint を使う場合
if command -v npx >/dev/null 2>&1; then
  npx --no-install commitlint --edit "$1"
else
  echo "commitlint が見つかりません" >&2
  exit 1
fi
