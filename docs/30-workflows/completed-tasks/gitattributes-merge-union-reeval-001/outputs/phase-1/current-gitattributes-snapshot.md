# 現状 `.gitattributes` スナップショット

取得日時: 2026-04-19

## 1. `.gitattributes` 全文

```gitattributes
# Visual regression baseline 画像を binary として扱う（git diff を抑制）
# Playwright はデフォルトで spec-file-name-snapshots/ ディレクトリに保存する
apps/desktop/e2e/ui-ux/*.spec.ts-snapshots/*.png binary
apps/desktop/e2e/ui-ux/snapshots/*.png binary

# ── マージ戦略 ──────────────────────────────────────────────────────────────
# 追記型ログ・評価記録: 並列ブランチからの追記を自動統合（コンフリクトマーカー不要）
# 並列PR開発でコンフリクトが発生しないよう全スキル共通で適用
.claude/skills/*/LOGS.md          merge=union
.agents/skills/*/LOGS.md          merge=union
.claude/skills/*/EVALS.json       merge=ours
.agents/skills/*/EVALS.json       merge=ours

# リファレンス・記録ファイル（append-only）
.claude/skills/*/references/*.md  merge=union
.agents/skills/*/references/*.md  merge=union

# SKILL-changelog.md: 変更履歴は追記型のため merge=union で両ブランチの追記を統合
.claude/skills/*/SKILL-changelog.md  merge=union
.agents/skills/*/SKILL-changelog.md  merge=union

# auto-generated インデックスファイル: マージせず現ブランチを優先し、マージ後にスクリプトで再生成する
# merge=ours はカスタムドライバー名（built-in ではない）。事前に以下を実行すること:
#   bash .claude/scripts/setup-merge-drivers.sh
# または: git config merge.ours.driver true
# マージ後の再生成: node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
.claude/skills/*/indexes/*.json   merge=ours
.claude/skills/*/indexes/*.md     merge=ours
.agents/skills/*/indexes/*.json   merge=ours
.agents/skills/*/indexes/*.md     merge=ours
```

## 2. `git check-attr` 実測結果（代表ファイル）

| ファイルパス                                                                   | 現状属性          | 期待 (修正後)             |
| ------------------------------------------------------------------------------ | ----------------- | ------------------------- |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                               | `merge: union`    | `merge: union`（維持）    |
| `.claude/skills/aiworkflow-requirements/references/LOGS.md`                    | `merge: union`    | `merge: union`（維持）    |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | `merge: union` ❌ | (unspecified)（**変更**） |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` | `merge: union` ❌ | (unspecified)（**変更**） |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | `merge: union`    | `merge: union`（維持）    |

❌ 印: 構造化ドキュメントに誤適用されている箇所（本タスクで是正対象）

## 3. `.{claude,agents}/skills/*/references/*.md` カバー件数

| スコープ                                                            | 件数                                             |
| ------------------------------------------------------------------- | ------------------------------------------------ |
| `.claude/skills/*/references/*.md`                                  | 609 ファイル                                     |
| `.agents/skills/*/references/*.md`                                  | 609 ファイル（mirror）                           |
| **うち LOGS.md in references**                                      | 1 件／スキル                                     |
| **うち SKILL-changelog.md in references**                           | 0 件（skill 直下にあり references 配下にはなし） |
| **うち task-workflow-completed\*.md**                               | 50 件以上（append-only）                         |
| **うち lessons-learned-\*.md**                                      | 100 件以上（append-only／time-sliced）           |
| **うち task-workflow.md / -rules / -phases / -active / -backlog\*** | 構造化（誤適用中）                               |
| **うち api-_.md / arch-_.md 等ドキュメント**                        | 構造化（誤適用中）                               |

## 4. `merge.ours.driver` 登録状況

```bash
$ git config --get merge.ours.driver
(unset)
```

- **未登録**。SessionStart hook の警告 `merge.ours.driver が未設定です。.gitattributes の merge=ours が機能しません` と一致。
- 修正方法: `bash .claude/scripts/setup-merge-drivers.sh` 実行で `merge.ours.driver = true` になる。
- Phase 11 の MT-01 で正式検証する。

## 5. `setup-merge-drivers.sh` 現状

```bash
#!/bin/bash
# カスタム merge ドライバーの登録
# ...
set -euo pipefail
git config merge.ours.driver true
echo "[setup-merge-drivers] merge.ours.driver = true を設定しました"
INSTALL_HOOKS_SCRIPT="$(git rev-parse --show-toplevel)/.claude/scripts/install-git-hooks.sh"
if [ -f "$INSTALL_HOOKS_SCRIPT" ]; then
  bash "$INSTALL_HOOKS_SCRIPT"
fi
# ...
```

- ロジックは `git config merge.ours.driver true` の 1 行のみ（idempotent）。
- 本タスクではロジック変更せず、冒頭コメントに以下を追記する:
  - 未登録時のフォールバック挙動
  - 初回 clone 後に必ず実行すべき旨
  - `indexes/*.json` との依存関係
