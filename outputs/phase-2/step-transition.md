# Phase 2 タスク5: ステップ遷移ロジック設計

## ステップ番号参照テーブル

| ステップ番号 | コンポーネント                            | 備考                                                 |
| ------------ | ----------------------------------------- | ---------------------------------------------------- |
| 0            | Step 0 UI（generationMode ラジオ + 入力） | LLMモード: シンプルUI、templateモード: SkillInfoStep |
| 1            | ConversationRoundStep                     | テンプレートモード時のみ                             |
| 2            | GenerateStep                              | 生成中 / plan 結果表示                               |
| 3            | CompleteStep                              | 完了                                                 |

## 遷移マトリクス

| 現在のステップ | generationMode | アクション              | 遷移先                             |
| -------------- | -------------- | ----------------------- | ---------------------------------- |
| Step 0         | template       | onNext（SkillInfoStep） | Step 1（ConversationRoundStep）    |
| Step 0         | llm            | 「次へ」クリック        | Step 2（GenerateStep） + planSkill |
| Step 1         | template       | onGenerate              | Step 2（GenerateStep）             |
| Step 1         | -              | onBack                  | Step 0                             |
| Step 2         | llm            | onExecutePlan (成功)    | Step 3（CompleteStep）             |
| Step 2         | llm            | onCancelPlan            | Step 0                             |
| Step 2         | template       | (createSkill 自動)      | Step 3                             |

## goToStep 使用方針

- LLM モード: `goToStep(2)` で ConfigureStep をスキップ
- LLM キャンセル: `goToStep(0)` で Step 0 へ戻る
- LLM 成功: `goToStep(3)` で CompleteStep へ
- テンプレートモード: 既存の `goNext()` / `handleGenerate()` をそのまま使用
