# Phase 3 タスク2: AC カバレッジチェック

| AC    | 設計カバレッジ                                                             | 充足 |
| ----- | -------------------------------------------------------------------------- | ---- |
| AC-1  | Step 0 に generationMode ラジオボタンを追加する設計済み                    | ✅   |
| AC-2  | handleLlmGenerate が goToStep(2) + planSkill 呼出の設計済み                | ✅   |
| AC-3  | GenerateStep の planResult Props 接続の設計済み                            | ✅   |
| AC-4  | handleExecutePlan が executePlan → goToStep(3) の設計済み                  | ✅   |
| AC-5  | handleCancelPlan が goToStep(0) の設計済み                                 | ✅   |
| AC-6  | GenerateStep に generationProgress を渡す設計済み（既存Props）             | ✅   |
| AC-7  | エラーパスに setGenerationError の設計済み                                 | ✅   |
| AC-8  | templateモード: 既存SkillInfoStep → ConversationRoundStep フローは変更なし | ✅   |
| AC-9  | PlanResult は agentSlice.ts からのみ import の設計済み                     | ✅   |
| AC-10 | handleCancelPlan / handleExecutePlan 両方に対称クリア設計済み              | ✅   |
