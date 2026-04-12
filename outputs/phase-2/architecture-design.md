# Phase 2: アーキテクチャ設計

## State 設計

| state名                | 型                         | 初期値            | 役割                       |
| ---------------------- | -------------------------- | ----------------- | -------------------------- |
| formData               | SkillInfoFormData          | DEFAULT_FORM_DATA | Step 0 のフォーム入力値    |
| answers                | ConversationAnswers        | DEFAULT_ANSWERS   | Step 1 の会話回答          |
| smartDefaults          | SmartDefaultResult \| null | null              | 推論済みデフォルト値       |
| generationMethod       | "complete" \| "skip"       | "complete"        | 生成方式フラグ             |
| isGenerating           | boolean                    | false             | LLM生成中フラグ            |
| error                  | Error \| null              | null              | 生成失敗時の UI エラー保持 |
| skillPath              | string \| null             | null              | 生成完了後のスキルパス     |
| hasExternalIntegration | boolean                    | false             | 完了画面の外部連携表示制御 |
| externalToolName       | string \| null             | null              | 完了画面の外部ツール名     |

generationLockRef は state ではなく ref で、二重呼び出し防止に使う。

## 削除対象 State

- generationMode: "template" | "llm"
- hasActivatedLlmMode: boolean
- llmDescription: string

## STEPS 配列

["スキル情報入力", "詳細設定", "生成", "完了"]
インデックス: 0=SkillInfoStep, 1=ConversationRoundStep, 2=GenerateStep, 3=CompleteStep

## レンダリング設計

| currentStep | コンポーネント        | 主要props                                                                  |
| ----------- | --------------------- | -------------------------------------------------------------------------- |
| 0           | SkillInfoStep         | formData, onFormDataChange, onNext={handleStep0Next}                       |
| 1           | ConversationRoundStep | formData, smartDefaults, answers, onAnswersChange, onBack, onGenerate      |
| 2           | GenerateStep          | stage, percent, message, isGenerating, onCancel（generationMode なし）     |
| 3           | CompleteStep          | skillPath, hasExternalIntegration, externalToolName, action cards, onRetry |
