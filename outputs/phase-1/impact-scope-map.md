# Phase 1: 影響範囲マップ

## 削除対象

| 削除対象                                                       | ファイル              | 行番号（概算） |
| -------------------------------------------------------------- | --------------------- | -------------- |
| generationMode state                                           | SkillCreateWizard.tsx | 415-416        |
| hasActivatedLlmMode state                                      | SkillCreateWizard.tsx | 418            |
| llmDescription state                                           | SkillCreateWizard.tsx | 421            |
| setGenerationMode / setHasActivatedLlmMode / setLlmDescription | SkillCreateWizard.tsx | 関連箇所       |
| handleLlmGenerate()                                            | SkillCreateWizard.tsx | 588-666        |
| handleExecutePlan()                                            | SkillCreateWizard.tsx | 669-800        |
| handleCancelPlan()                                             | SkillCreateWizard.tsx | 803-813        |
| handleCancelTemplateGeneration()                               | SkillCreateWizard.tsx | 816-820        |
| handleStep0NextFromLlm()                                       | SkillCreateWizard.tsx | 469-478        |
| Step 0 のテンプレート切替ラジオUI                              | SkillCreateWizard.tsx | 872-938        |
| GenerateStep への generationMode 条件分岐 props                | SkillCreateWizard.tsx | 968-986        |
| templateGenerationRequestIdRef                                 | SkillCreateWizard.tsx | 391            |

## 保持する内容

| 保持対象                                                                       | 理由                                |
| ------------------------------------------------------------------------------ | ----------------------------------- |
| generationLockRef                                                              | 二重呼び出し防止（LLM生成でも必要） |
| llmGenerationRequestIdRef                                                      | 非同期リクエスト識別に使用          |
| handleLlmGenerate → 将来的に不要だが、このタスクでは handleGenerate で代替済み |
| wizard/index.ts の GenerationMode 型                                           | W2-seq-03b の担当                   |
