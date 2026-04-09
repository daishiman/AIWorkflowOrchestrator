# Phase 1 タスク3: 受入条件（AC）定義書

## 調査日: 2026-04-08

## 受入条件一覧

| AC    | 条件                                                                                                                  | 検証方法       |
| ----- | --------------------------------------------------------------------------------------------------------------------- | -------------- |
| AC-1  | SkillCreateWizard の Step 0 正本である SkillInfoStep に「LLM で生成」と「テンプレートから作成」の選択 UI が表示される | 自動テスト     |
| AC-2  | 「LLM で生成」選択 → GenerateStep へ直接遷移し planSkill が呼ばれる                                                   | 自動テスト     |
| AC-3  | GenerateStep で plan 結果（type, estimatedSteps, guidance）が正しく表示される                                         | 自動テスト     |
| AC-4  | GenerateStep の「実行する」ボタンで executePlan が呼ばれ、成功時 CompleteStep に遷移する                              | 自動テスト     |
| AC-5  | GenerateStep の「キャンセル」ボタンで plan をクリアし SkillInfoStep に戻る                                            | 自動テスト     |
| AC-6  | generationProgress が GenerateStep に表示される（ローディング状態）                                                   | 自動テスト     |
| AC-7  | planSkill / executePlan のエラー時、GenerateStep にエラーメッセージが表示される                                       | 自動テスト     |
| AC-8  | 「テンプレートから作成」フローが既存のまま動作する（非破壊）                                                          | 自動テスト     |
| AC-9  | PlanResult 型は agentSlice.ts からの Single Source of Truth を使用する                                                | コードレビュー |
| AC-10 | Hybrid State Pattern の対称クリアが handleCancelPlan / handleExecutePlan の両方で行われる                             | 自動テスト     |

## 統合テスト連携

- planSkill: window.skillCreatorAPI.planSkill(description) で呼ぶ
- executePlan: window.skillCreatorAPI.executePlan(planId, skillSpec) で呼ぶ
- テストは window.skillCreatorAPI を mock
