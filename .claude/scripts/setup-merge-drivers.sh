#!/bin/bash
# ── カスタム merge ドライバー登録スクリプト ──
#
# このスクリプトは、リポジトリの .gitattributes で参照される
# `merge=ours` カスタムドライバーをローカル Git 設定に登録します。
#
# === 登録されるドライバー ===
# merge.ours.driver = true
#   用途: .gitattributes の `merge=ours` 指定を解決し、
#         マージ時に現ブランチ（統合先）側を採用する。
#   適用ファイル例: indexes/*.json, indexes/*.md, EVALS.json
#
# === 未登録時の挙動 ===
# Git は `merge=ours` 指定を解決できず、以下のいずれかが発生する:
#   - warning: failed to resolve 'ours'
#     → デフォルト 3-way マージにフォールバック（conflict 発生の可能性）
#   - 環境によってはマージ失敗
# マージ後に自動生成インデックスを再生成する場合:
#   node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
#
# === 実行タイミング（必須） ===
# - 初回 clone 直後（.git/config はリポジトリ内に含まれないため毎回必要）
# - macOS / Linux 両対応、idempotent（何度実行しても安全）
# - SessionStart hook が `(unset)` を検出した際の修復手段
#
# 使い方: bash .claude/scripts/setup-merge-drivers.sh
#
# 関連:
#   - .gitattributes（merge=ours 適用ファイル定義）
#   - docs/30-workflows/gitattributes-merge-union-reeval-001/（判断ガイドライン）

set -euo pipefail

git config merge.ours.driver true
echo "[setup-merge-drivers] merge.ours.driver = true を設定しました"
INSTALL_HOOKS_SCRIPT="$(git rev-parse --show-toplevel)/.claude/scripts/install-git-hooks.sh"
if [ -f "$INSTALL_HOOKS_SCRIPT" ]; then
  bash "$INSTALL_HOOKS_SCRIPT"
fi
echo "[setup-merge-drivers] generated index のマージ後は以下を実行して再生成してください:"
echo "  node .claude/skills/aiworkflow-requirements/scripts/generate-index.js"
