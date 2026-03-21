# Phase 13: PR作成 - 新関数テスト拡充

## メタ情報

| 項目     | 値                                                                                   |
| -------- | ------------------------------------------------------------------------------------ |
| Phase    | 13                                                                                   |
| 機能名   | UT-TASK06-007-EXT-006-new-function-test-expansion                                    |
| 作成日   | 2026-03-21                                                                           |
| タスクID | UT-TASK06-007-EXT-006                                                                |
| 前Phase  | Phase 12: ドキュメント更新（[phase-12-documentation.md](phase-12-documentation.md)） |

## 目的

Phase 1〜12 の全成果物をブランチにコミットし、Pull Request を作成してレビュー可能な状態にする。**ユーザーの明示的な承認を得てからのみ実施すること。**

## 実行タスク

- 最終動作確認: PR作成前にテスト全件PASSと型チェックを最終確認
- ブランチ作成・コミット: 成果物をブランチにコミット
- PR作成: GitHub Pull Request を作成し、GitHub Issue #1393 とリンク

## 参照資料

| 資料名                  | パス                                                            | 説明                     |
| ----------------------- | --------------------------------------------------------------- | ------------------------ |
| Phase 2成果物           | `outputs/phase-2/design.md`                                     | テスト構造とexport設計   |
| Phase 5成果物           | `outputs/phase-5/green-confirmation.md`                         | export追加後のGreen確認  |
| Phase 6成果物           | `phase-6-test-expansion.md`                                     | 追加テストの最終範囲     |
| Phase 7成果物           | `outputs/phase-7/coverage-report.md`                            | カバレッジ結果           |
| Phase 8成果物           | `outputs/phase-8/refactoring-report.md`                         | リファクタリング結果     |
| Phase 9成果物           | `outputs/phase-9/quality-report.md`                             | 品質ゲート結果           |
| Phase 10成果物          | `outputs/phase-10/final-review-result.md`                       | 最終レビュー結果         |
| 手動テスト結果          | `outputs/phase-11/manual-test-result.md`                        | Test Plan に使用         |
| system spec 更新結果    | `outputs/phase-12/system-spec-update-summary.md`                | Step 1 / Step 2 の根拠   |
| documentation-changelog | `outputs/phase-12/documentation-changelog.md`                   | 変更内容サマリーに使用   |
| 準拠チェック            | `outputs/phase-12/phase12-task-spec-compliance-check.md`        | Phase 12 完了根拠        |
| GitHub Issue            | https://github.com/daishiman/AIWorkflowOrchestrator/issues/1393 | PRリンク先               |
| PR作成ルール            | `.claude/rules/07-git-and-tooling.md`                           | ブランチ名・PR本文ルール |
| 実装ガイド              | `outputs/phase-12/implementation-guide.md`                      | Phase 12 成果物          |
| 未タスク検出            | `outputs/phase-12/unassigned-task-detection.md`                 | Phase 12 成果物          |
| スキルフィードバック    | `outputs/phase-12/skill-feedback-report.md`                     | Phase 12 成果物          |

## 実行手順

### Step 1: PR作成前の最終確認

```bash
# テスト全件PASS（最終確認）
cd apps/desktop && pnpm vitest run scripts/__tests__/check-ipc-contracts.test.ts

# 型チェック
cd apps/desktop && pnpm typecheck

# Lint
cd apps/desktop && pnpm lint
```

**確認ポイント:**

- [ ] テストが全件PASSすること（FAILが0件）
- [ ] 型チェックエラーが0件であること
- [ ] Lintエラーが0件であること（または既知の既存エラーのみ）

### Step 2: ブランチ作成・コミット

```bash
# ブランチ作成（ルート worktree から実行、または既に対象ブランチにいる場合はスキップ）
git checkout -b feature/ut-task06-007-ext-006-test-expansion

# 変更ファイルの確認
git status
git diff --stat

# 対象ファイルをステージング
git add apps/desktop/scripts/check-ipc-contracts.ts
git add apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts
git add docs/30-workflows/UT-TASK06-007-EXT-006-new-function-test-expansion/
git add .claude/skills/aiworkflow-requirements/LOGS.md
git add .claude/skills/task-specification-creator/LOGS.md
git add .claude/skills/aiworkflow-requirements/SKILL.md
git add .claude/skills/task-specification-creator/SKILL.md
git add .claude/skills/aiworkflow-requirements/indexes/

# コミット（--no-verify は絶対に使用禁止）
git commit -m "$(cat <<'EOF'
test(scripts): check-ipc-contracts 新関数の境界値・エッジケーステスト拡充 (#1393)

- normalizeTypeAnnotation / isPrimitiveTypeAnnotation の境界値テストを追加
- mergeChannelMaps / CHANNEL_OBJECT_PATTERN / PRELOAD_CALL_START_PATTERN のテストを追加
- export追加により5対象への直接テストアクセスを可能にした
- fsモック戦略として一時ファイル方式を採用（vi.mock制約を回避）

Closes #1393
EOF
)"
```

**重要**: `--no-verify` は絶対に使用禁止（CLAUDE.md参照）。pre-commitフック失敗時はフック指示に従って修正する。

### Step 3: PR作成

```bash
# リモートにプッシュ
git push -u origin feature/ut-task06-007-ext-006-test-expansion

# PR作成
gh pr create \
  --title "test(scripts): check-ipc-contracts 新関数の境界値・エッジケーステスト拡充 (#1393)" \
  --body "$(cat <<'EOF'
## Summary

- `check-ipc-contracts.ts` の5対象（`normalizeTypeAnnotation`、`isPrimitiveTypeAnnotation`、`mergeChannelMaps`、`CHANNEL_OBJECT_PATTERN`、`PRELOAD_CALL_START_PATTERN`）に境界値・エッジケーステストを拡充
- `export` キーワードを追加して直接テストアクセスを可能にした（既存スクリプト動作への影響なし）
- fsモック戦略として一時ファイル方式を採用し、`vi.mock` の hoisting 制約を回避

## Test Plan

- [ ] `cd apps/desktop && pnpm vitest run scripts/__tests__/check-ipc-contracts.test.ts` — 全テストPASS
- [ ] `cd apps/desktop && pnpm typecheck` — 型チェックエラー0件
- [ ] `cd apps/desktop && pnpm lint` — Lintエラー0件
- [ ] export追加後もスクリプト本体が正常起動すること（構文エラーなし）

## 関連 Issue

Closes #1393

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### Step 4: PR作成後の確認

```bash
# PR URLを確認
gh pr view

# GitHub Issue #1393 がPRにリンクされていることを確認
gh issue view 1393
```

**確認ポイント:**

- [ ] PRのURLが出力されていること
- [ ] GitHub Issue #1393 に「Closes」リンクが設定されていること
- [ ] PRタイトルが70文字以内であること
- [ ] PR本文にSummaryとTest Planが含まれていること
- [ ] CIが自動実行されていること（GitHub Actions）

## 統合テスト連携

PR作成後、CIで以下が自動実行される:

- pnpm lint: Lintチェック
- pnpm typecheck: 型チェック
- pnpm vitest run: テスト全件実行

CI失敗時は `--no-verify` を使わず、失敗原因を修正してから再コミットすること。

## 成果物

| 成果物       | パス                                           | 説明                             |
| ------------ | ---------------------------------------------- | -------------------------------- |
| Pull Request | GitHub PR URL（作成後に確認）                  | レビュー可能なPR                 |
| ブランチ     | `feature/ut-task06-007-ext-006-test-expansion` | 成果物を含むフィーチャーブランチ |

## 完了条件

- [ ] **ユーザーの明示的な承認を得ていること**（これがない場合はStep 2以降を実施しない）
- [ ] Step 1: テスト全件PASS、型チェック・Lintエラー0件
- [ ] Step 2: `feature/ut-task06-007-ext-006-test-expansion` ブランチにコミット済み（`--no-verify` 不使用）
- [ ] Step 3: PR作成済みでURLが確認できること
- [ ] Step 4: GitHub Issue #1393 がPRにリンクされていること
- [ ] CIが自動実行されていること

## 次Phase

なし（タスク完了）
