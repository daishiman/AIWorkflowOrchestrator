# Phase 2 タスク1: コンポーネントトポロジ設計

## 変更後のコンポーネントフロー図

```
SkillCreateWizard（状態オーナー）
├─ Step 0: 生成モード選択 + 入力 UI
│   ├─ [共通] generationMode ラジオボタン（新規）
│   ├─ [template モード] SkillInfoStep（既存）
│   │   ├─ skillName input
│   │   ├─ purpose textarea
│   │   └─ category buttons
│   └─ [llm モード] シンプル description textarea（新規）
│       └─ 「次へ」ボタン → handleLlmGenerate()
├─ Step 1: ConversationRoundStep（template モード時のみ）
├─ Step 2: GenerateStep
│   ├─ ストリーミング進捗表示（既存）
│   ├─ generationProgress 表示（既存Props、LLM接続で使用）
│   ├─ plan 結果表示パネル（既存Props）
│   ├─ 「実行する」ボタン（既存Props）
│   ├─ 「キャンセル」ボタン（既存Props）
│   └─ エラー表示（既存）
└─ Step 3: CompleteStep（既存）
```

## 各コンポーネントの責務

| コンポーネント        | 責務                                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| SkillCreateWizard     | generationMode 状態管理、handleLlmGenerate/handleExecutePlan/handleCancelPlan 定義、ステップ遷移制御 |
| Step 0 ラジオ UI      | generationMode 選択（UI のみ）                                                                       |
| SkillInfoStep         | テンプレートモード時の詳細入力（変更なし）                                                           |
| LLM 入力 UI           | LLM モード時の description 入力（シンプルな textarea）                                               |
| ConversationRoundStep | テンプレートオプション設定（変更なし）                                                               |
| GenerateStep          | 生成進捗 / plan 結果表示 / 実行・キャンセルボタン（UI 変更なし、Props 接続のみ）                     |
| CompleteStep          | 完了表示（変更なし）                                                                                 |
