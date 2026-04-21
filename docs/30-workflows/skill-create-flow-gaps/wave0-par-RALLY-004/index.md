# TASK-RALLY-004 - selectedOptionIds/selectedValues重複フィールド整理

## メタ情報

| 項目                | 値                                             |
| ------------------- | ---------------------------------------------- |
| タスクID            | TASK-RALLY-004                                 |
| 機能名              | duplicate-field-clarification-selected-options |
| 作成日              | 2026-04-21                                     |
| 衝突ドメイン        | skillCreator型定義                             |
| 実行形態            | par（Wave 0 並列実行可）                       |
| タスク間依存        | なし                                           |
| 後続タスク          | RALLY-009（同一ファイル衝突のため直列）        |
| implementation_mode | new                                            |

## 目的

`SkillCreatorUserInputSubmission` 型と `InterviewUserAnswer` 型に `selectedOptionIds` と `selectedValues` という類似フィールドが両方存在し、どちらが正規値かが型定義レベルで明記されていない。

- `SkillCreatorWorkflowEngine.ts` の `normalizeSelectedOptionIds` 関数が `submission.selectedOptionIds ?? submission.selectedValues` でフォールバックしており、`selectedOptionIds` を正規フィールドとして扱っている
- `ConversationalInterview.tsx` では `selectedOptionIds` と `selectedValues` に同じ値をセットして送信している
- `useInterviewState.ts` でも両フィールドに相互フォールバックする形で代入している

本タスクでは `selectedOptionIds` を `@canonical` フィールドとして明示し、`selectedValues` を `@deprecated` マークすることで、型定義とコードの意図を一致させる。

## 実行フロー

### タスク間の直列/並列

```
Wave 0（並列実行可）:
  RALLY-001 ┐
  RALLY-002 │ 同時実行可（ファイル衝突なし）
  RALLY-004 ┘
↓
Wave 1（コア設計確立）:
  RALLY-005（SkillLifecyclePanelドメイン）
  RALLY-009（RALLY-004完了後、同一型定義ファイル）
↓
Wave 2（副作用フック修正）:
  RALLY-006 ← RALLY-005完了後
  RALLY-008 ← RALLY-005完了後
```

### Phase内SubAgent編成

- **Phase 1**: SubAgent-A（型定義現状調査）・SubAgent-B（使用箇所調査）を**並列**実行
- **Phase 2**: 設計は統合SubAgentが**直列**で担当（A・B完了後）
- **Phase 4**: テスト確認は直列（既存テスト通過確認のみ）
- **Phase 5**: 型定義変更は直列（1ファイル・2箇所）

## 対象ファイル

- `packages/shared/src/types/skillCreator.ts`

## Phases

| Phase | ファイル                     | ステータス |
| ----- | ---------------------------- | ---------- |
| 1     | phase-1-requirements.md      | pending    |
| 2     | phase-2-design.md            | pending    |
| 3     | phase-3-design-review.md     | pending    |
| 4     | phase-4-test-creation.md     | pending    |
| 5     | phase-5-implementation.md    | pending    |
| 6     | phase-6-test-expansion.md    | pending    |
| 7     | phase-7-coverage-check.md    | pending    |
| 8     | phase-8-refactoring.md       | pending    |
| 9     | phase-9-quality-assurance.md | pending    |
| 10    | phase-10-final-review.md     | pending    |
| 11    | phase-11-manual-test.md      | pending    |
| 12    | phase-12-documentation.md    | pending    |
| 13    | phase-13-pr-creation.md      | pending    |
