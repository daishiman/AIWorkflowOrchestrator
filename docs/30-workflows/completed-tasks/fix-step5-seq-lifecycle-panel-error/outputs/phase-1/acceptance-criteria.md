# Phase 1: 要件定義 - 受入条件

## 概要

`SkillLifecyclePanel.tsx` の `onWorkflowStateChanged` コールバックに対して、`currentPhase: 'handoff'` 時にエラーを消さない仕様を確定した。

## 受入条件

| ID   | 条件                                                                                | 検証結果 | 備考                                                                            |
| ---- | ----------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------- |
| AC-1 | `currentPhase: 'handoff'` の snapshot 受信後、`setWorkflowError(null)` が呼ばれない | PASS     | `SkillLifecyclePanel.error-persistence.test.tsx` の TC-EP-01/04/06/07/08 で確認 |
| AC-2 | `currentPhase: 'handoff'` 以外では `setWorkflowError(null)` が呼ばれる              | PASS     | TC-EP-02/03/05 で確認                                                           |
| AC-3 | `currentPhase: 'handoff'` 後に別 snapshot が届いてもエラーメッセージが消えない      | PASS     | 連続 snapshot 経路のテストで確認                                                |
| AC-4 | 既存の正常系テストが GREEN                                                          | PASS     | `SkillLifecyclePanel.test.tsx` が 10/10 PASS                                    |
| AC-5 | TypeScript 型エラーなし、ESLint エラーなし                                          | PASS     | `pnpm --filter @repo/desktop typecheck` / `pnpm exec eslint ...` で確認         |

## P50 チェック

| 観点     | 結果 | コメント                                                             |
| -------- | ---- | -------------------------------------------------------------------- |
| 変更規模 | PASS | 修正本体は `if (snapshot.currentPhase !== "handoff")` の条件追加のみ |
| 総工数   | PASS | テストは追加されたが、変更の主目的は 1 箇所の条件分岐で完結          |
| 影響範囲 | PASS | `handoffBundle` 処理と IPC 契約は変更なし                            |

## 命名規則メモ

- 既存テストの命名は `SkillLifecyclePanel.*.test.tsx` のサフィックス運用。
- 新規テストは `SkillLifecyclePanel.error-persistence.test.tsx` を採用。
- workflow 配下の成果物は kebab-case のファイル名で統一。

## 参照

- [修正対象](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260402-230758-wt-2/apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx)
- [新規テスト](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260402-230758-wt-2/apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.error-persistence.test.tsx)
