# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 8                        |
| Phase名    | リファクタリング         |
| 対象機能   | TASK-SW-FIX-FEEDBACK-008 |
| 前提Phase  | Phase 7                  |
| 次Phase    | Phase 9                  |
| ステータス | completed                |
| 作成日     | 2026-04-15               |

## 目的

重複コードの削除・ナビゲーションドリフトの解消。`processWorkflowOutcome` および `handleExecutePlan` において、`fetchSkills()` が失敗した際に後続の `selectSkillByName` が呼ばれなくなる問題を解消するため、`try-catch` パターンから `.catch()` による non-blocking パターンへ統一する。

## 実行タスク

### タスク 8-1: fetchSkills non-blocking パターンの一貫性確認

`processWorkflowOutcome` と `handleExecutePlan` の両方で同一の non-blocking パターンが適用されているか確認する。

- `processWorkflowOutcome` 内の `fetchSkills()` 呼び出しが `.catch()` パターンになっているか確認
- `handleExecutePlan` 内の `fetchSkills()` 呼び出しが `.catch()` パターンになっているか確認
- 両関数で `selectSkillByName` が `fetchSkills()` の成否に依存せず実行されることを確認

### タスク 8-2: console.warn メッセージの統一確認

`fetchSkills()` 失敗時の警告メッセージが両関数で統一されているか確認する。

- `processWorkflowOutcome` での `console.warn` メッセージ内容確認
- `handleExecutePlan` での `console.warn` メッセージ内容確認
- メッセージフォーマットが一貫していることを確認

## 変更内容テーブル

| 対象                     | Before                                                             | After                                                                         | 理由                                                                |
| ------------------------ | ------------------------------------------------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `processWorkflowOutcome` | `try-catch` でラップし、`catch` ブロックで `return` または早期終了 | `.catch()` パターンで non-blocking 化し、`fetchSkills` 失敗時も後続処理を継続 | `fetchSkills` 失敗時に `selectSkillByName` が実行されない問題の解消 |
| `handleExecutePlan`      | `try-catch` でラップし、`catch` ブロックで `return` または早期終了 | `.catch()` パターンで non-blocking 化し、`fetchSkills` 失敗時も後続処理を継続 | `fetchSkills` 失敗時に `selectSkillByName` が実行されない問題の解消 |
| エラーハンドリング       | `generationError` にエラーをセット                                 | `console.warn` でログ記録のみ（`generationError` には設定しない）             | フェッチ失敗をユーザー向けエラーとして扱わないようにする            |

## 参照資料

- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx`
- Issue #2176
- PR #2179

## 統合テスト連携

- `SkillLifecyclePanel.llm-generation.test.tsx` のテストケース U-8 / U-13 が対象
- non-blocking 化後も既存テストが PASS であることを確認

## 成果物

- `SkillLifecyclePanel.tsx`（修正済み）: `fetchSkills()` non-blocking パターン適用済み

## 完了条件

- [x] `processWorkflowOutcome` で `.catch()` パターンが適用されている
- [x] `handleExecutePlan` で `.catch()` パターンが適用されている
- [x] 両関数で `fetchSkills` 失敗時でも `selectSkillByName` が実行される
- [x] `console.warn` メッセージが両関数で統一されている
- [x] `generationError` に `fetchSkills` の失敗エラーがセットされない

## タスク100%実行確認【必須】

- [x] タスク 8-1: fetchSkills non-blocking パターンの一貫性確認 完了
- [x] タスク 8-2: console.warn メッセージの統一確認 完了

## 次Phase

Phase 9: 品質保証
