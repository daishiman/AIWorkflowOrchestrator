# Phase 13: 完了

## メタ情報

| 項目       | 値                                                   |
| ---------- | ---------------------------------------------------- |
| Phase番号  | 13                                                   |
| 機能名     | LLMモデル選択インラインガイダンス追加                |
| タスクID   | TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE                |
| 作成日     | 2026-03-20                                           |
| ステータス | 作成済み                                             |
| 依存       | [Phase 12 ドキュメント](./phase-12-documentation.md) |

## 目的

成果物の最終確認を行い、PR 作成の準備を整える。全 Phase の成果物が揃っていることを確認し、PR ブランチへの整合性チェックを実施する。

## 実行タスク

### Task 1: 成果物最終確認

以下の成果物が全て存在することを確認する:

#### Phase 4〜13 の仕様書

```bash
ls docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/
```

| 仕様書                       | 存在確認 |
| ---------------------------- | -------- |
| phase-4-test-creation.md     | -        |
| phase-5-implementation.md    | -        |
| phase-6-test-expansion.md    | -        |
| phase-7-coverage-check.md    | -        |
| phase-8-refactoring.md       | -        |
| phase-9-quality-assurance.md | -        |
| phase-10-final-review.md     | -        |
| phase-11-manual-test.md      | -        |
| phase-12-documentation.md    | -        |
| phase-13-pr-creation.md      | -        |

#### 実装成果物

| ファイル                                                                                       | 存在確認 |
| ---------------------------------------------------------------------------------------------- | -------- |
| `apps/desktop/src/renderer/views/ChatView/LLMGuidanceBanner.tsx`                               | -        |
| `apps/desktop/src/renderer/views/ChatView/__tests__/LLMGuidanceBanner.test.tsx`                | -        |
| `apps/desktop/src/renderer/views/ChatView/__tests__/ChatView.guidance.test.tsx`                | -        |
| `apps/desktop/src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.guidance.test.tsx` | -        |

#### ドキュメント成果物

| ファイル                                       | 存在確認 |
| ---------------------------------------------- | -------- |
| outputs/artifacts.json                         | -        |
| outputs/phase-11/manual-test-checklist.md      | -        |
| outputs/phase-11/manual-test-result.md         | -        |
| outputs/phase-11/discovered-issues.md          | -        |
| outputs/phase-12/implementation-guide.md       | -        |
| component-documentation.md                     | -        |
| outputs/phase-12/system-spec-update-summary.md | -        |
| outputs/phase-12/documentation-changelog.md    | -        |
| outputs/phase-12/unassigned-task-detection.md  | -        |
| outputs/phase-12/skill-feedback-report.md      | -        |

### Task 2: 最終テスト実行

```bash
# 全テストが PASS することを最終確認
cd apps/desktop && pnpm vitest run src/renderer/views/ChatView/
cd apps/desktop && pnpm vitest run src/renderer/views/WorkspaceView/

# Lint・型チェック
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop typecheck
```

### Task 3: PR 作成準備

#### ブランチ命名

```
fix/llm-selector-inline-guidance
```

#### PR タイトル（70文字以内）

```
fix(ui): ChatView/WorkspaceViewにLLMモデル未選択時ガイダンスバナーを追加
```

#### PR 本文テンプレート

```markdown
## Summary

- ChatView ヘッダーにモデル未選択時のガイダンスバナー（LLMGuidanceBanner）を追加
- WorkspaceView の GuidanceBlock に設定画面遷移ボタンを追加
- どちらの画面からも1クリックで Settings 画面へ直接遷移可能

## Changes

- `apps/desktop/src/renderer/views/ChatView/LLMGuidanceBanner.tsx` — 新規作成
- `apps/desktop/src/renderer/views/ChatView/index.tsx` — バナー統合
- `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx` — GuidanceBlock 改善

## Test Plan

- `LLMGuidanceBanner.test.tsx`: 表示/非表示制御・コンテンツ・インタラクション（TC-1〜TC-3）
- `ChatView.guidance.test.tsx`: ChatView 統合（TC-4）
- `WorkspaceChatPanel.guidance.test.tsx`: GuidanceBlock 改善（TC-5）
- 手動テスト: モデル未選択→バナー表示→Settings遷移→モデル選択→バナー消去のフロー確認済み

## References

- TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE
- Phase 12 documentation: `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/`
```

### Task 4: PR 作成（ユーザー確認後実行）

**注意**: PR 作成はユーザー確認後に実行する。`--no-verify` は絶対に使用しない。

```bash
# コミット前チェック（必須）
pnpm lint
pnpm typecheck

# PR 作成
gh pr create \
  --title "fix(ui): ChatView/WorkspaceViewにLLMモデル未選択時ガイダンスバナーを追加" \
  --body-file pr-body.md \
  --base main
```

## 参照資料

| ファイル                                                                                                  | 用途                                    |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `.claude/rules/07-git-and-tooling.md`                                                                     | PR 作成ルール・コミット前チェックリスト |
| `CLAUDE.md`                                                                                               | `--no-verify` 禁止                      |
| `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/phase-2-design.md`            | 実装スコープと設計意図                  |
| `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/phase-5-implementation.md`    | 実装変更点                              |
| `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/phase-6-test-expansion.md`    | 追加テスト観点                          |
| `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/phase-7-coverage-check.md`    | coverage gate 結果                      |
| `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/phase-8-refactoring.md`       | リファクタリング内容                    |
| `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/phase-9-quality-assurance.md` | 品質保証結果                            |
| `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/phase-10-final-review.md`     | 最終レビュー結果                        |
| `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/phase-11-manual-test.md`      | Phase 11 evidence の正本                |
| `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/phase-12-documentation.md`    | Phase 12 same-wave sync の正本          |

## 実行手順

### Step 1: 成果物最終確認（Task 1）

全チェックリストにチェックを入れる。

### Step 2: 最終テスト実行（Task 2）

全テスト PASS を確認する。

### Step 3: PR 本文準備（Task 3）

### Step 4: ユーザー確認後 PR 作成（Task 4）

## 成果物

| 成果物 | パス                    |
| ------ | ----------------------- |
| PR     | GitHub PR URL（作成後） |

## 完了条件

- [ ] 全 Phase 仕様書（Phase 4〜13）が存在している
- [ ] 実装ファイルが全て存在している
- [ ] `outputs/artifacts.json` が root `artifacts.json` と同期している
- [ ] Phase 11 / Phase 12 ドキュメント成果物が全て作成されている
- [ ] 最終テストが全 PASS している
- [ ] Lint・型チェックが PASS している
- [ ] PR タイトルが 70 文字以内
- [ ] PR 本文に Summary と Test Plan が含まれている
- [ ] `--no-verify` を使用していない

## タスク完了

TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE の全 Phase（1〜13）が完了。
