# Phase 8: 責務境界マップ — UT-SKILL-WIZARD-W2-seq-03b

## ファイル責務

| ファイル                           | 責務                                       | 状態                                    |
| ---------------------------------- | ------------------------------------------ | --------------------------------------- |
| `wizard/index.ts`                  | barrel export（再エクスポートのみ）        | 更新済み                                |
| `wizard/SkillInfoStep.tsx`         | Step 0 UI（スキル情報入力）                | 更新済み（SkillInfoStepProps export化） |
| `wizard/ConversationRoundStep.tsx` | Step 1 UI（会話ラリー設定）                | 変更なし                                |
| `wizard/StepIndicator.tsx`         | ステップインジケーター UI                  | 変更なし                                |
| `wizard/GenerateStep.tsx`          | Step 2 UI（LLM 生成）+ `GenerationMode` 型 | 変更なし（Single Source of Truth）      |
| `wizard/CompleteStep.tsx`          | Step 3 UI（完了画面）                      | 変更なし                                |
| `wizard/DescribeStep.tsx`          | 廃止（`@deprecated`）                      | 廃止処理済み                            |
| `wizard/InterviewProgressBar.tsx`  | 面談進捗 UI                                | 変更なし                                |
| `wizard/ApplySummaryCard.tsx`      | 適用サマリー UI                            | 変更なし                                |
