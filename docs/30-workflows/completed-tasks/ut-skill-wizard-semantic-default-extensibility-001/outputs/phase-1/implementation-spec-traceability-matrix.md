# Phase 1: トレーサビリティ行列

| AC-ID | 要件                                                          | 実装ファイル                                          | テストケース                  |
| ----- | ------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------- |
| AC-1  | QuestionSemanticLabelMap 型が @repo/shared から import できる | `packages/shared/src/types/skill-wizard-label-map.ts` | TC-12（import確認）           |
| AC-2  | resolveSemanticLabel がハードコードを持たない                 | `ConversationRoundStep.tsx`（旧inline削除）           | TC-01〜TC-07（変換結果確認）  |
| AC-3  | applySmartDefaults テスト 10件以上 PASS                       | `ConversationRoundStep.test.tsx`                      | TC-01〜TC-12（12件以上）      |
| AC-4  | 正準形マッピング表がドキュメント化されている                  | `outputs/phase-3/design-decisions.md`                 | Phase 8 Task 2 で作成         |
| AC-5  | 既存動作が変わらない                                          | `ConversationRoundStep.tsx`                           | TC-10（回帰テスト）+ 既存36件 |
