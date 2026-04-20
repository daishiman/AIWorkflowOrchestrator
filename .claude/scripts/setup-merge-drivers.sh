#!/bin/bash
# カスタム merge ドライバーの登録
#
# .gitattributes の merge=ours は built-in ではなくカスタムドライバー名。
# このスクリプトを実行してから git merge を行うこと。
# 再実行しても安全（idempotent）。
#
# 使い方: bash .claude/scripts/setup-merge-drivers.sh

set -euo pipefail

git config merge.ours.driver true
echo "[setup-merge-drivers] merge.ours.driver = true を設定しました"
INSTALL_HOOKS_SCRIPT="$(git rev-parse --show-toplevel)/.claude/scripts/install-git-hooks.sh"
if [ -f "$INSTALL_HOOKS_SCRIPT" ]; then
  bash "$INSTALL_HOOKS_SCRIPT"
fi
echo "[setup-merge-drivers] generated index のマージ後は以下を実行して再生成してください:"
echo "  node .claude/skills/aiworkflow-requirements/scripts/generate-index.js"
