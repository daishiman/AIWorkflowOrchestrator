# W2-seq-03a: SkillCreateWizard オーケストレーション更新

## メタ情報

| 項目         | 内容                                                                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID     | UT-SKILL-WIZARD-W2-seq-03a                                                                                                               |
| タスク名     | SkillCreateWizard オーケストレーション更新                                                                                               |
| 実行順       | Wave 2（直列・W1-par-02a+W1-par-02b+W1-par-02c完了後）                                                                                   |
| 依存タスク   | W1-par-02a, W1-par-02b, W1-par-02c                                                                                                       |
| 対象ファイル | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`, `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx` |
| 作成日       | 2026-04-07                                                                                                                               |
| ステータス   | Phase 12 完了（PR 未作成）                                                                                                               |

## 概要

`SkillCreateWizard.tsx` を大幅改修し、テンプレート生成モードを廃止してLLM専用化する。  
スマートデフォルト推論機能・会話ラリーStep・品質フィードバックハンドラを追加し、Step 2 の `GenerateStep` から `generationMode` を外して LLM 専用化する。  
Step 3 の `CompleteStep` では `skillPath` を表示し、品質フィードバックとリカバリーフローを接続する。

## 削除する内容

| 削除対象                            | 理由                                 |
| ----------------------------------- | ------------------------------------ |
| `description` state                 | Step 0 の `formData` に統合するため  |
| `options` state                     | Step 0/1 の新 state に置き換えるため |
| `generationMode` state              | LLM専用化によりモード選択が不要      |
| `setGenerationMode`                 | 同上                                 |
| `handleGenerate()`                  | テンプレート生成ロジックを廃止       |
| `handleDescribeNext()` の分岐       | 常にLLMモードのため分岐不要          |
| `createSkill(description, options)` | 旧入力パラメータを廃止               |
| `template`関連の全条件分岐          | テンプレートモード廃止に伴う除去     |

## 追加・変更する内容

| 追加・変更対象                                    | 内容                                                                                        |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `formData: SkillInfoFormData` state               | Step 0のフォームデータ保持                                                                  |
| `answers: ConversationAnswers` state              | Step 1の会話回答保持                                                                        |
| `smartDefaults: SmartDefaultResult \| null` state | スマートデフォルト推論結果                                                                  |
| `generationMethod: "complete" \| "skip"` state    | 生成方式フラグ                                                                              |
| `skillPath: string \| null` state                 | 生成完了後のスキルパス保持                                                                  |
| `inferSmartDefaults(formData)` 関数               | Step 0入力からデフォルト値を推論                                                            |
| STEPS配列更新                                     | `["スキル情報入力", "詳細設定", "生成", "完了"]`                                            |
| Step 0: `<SkillInfoStep>` レンダリング            | 新ステップコンポーネント                                                                    |
| Step 1: `<ConversationRoundStep>` レンダリング    | 会話ラリーコンポーネント                                                                    |
| Step 2: `<GenerateStep>` レンダリング             | `generationMode` なしの LLM 進捗表示                                                        |
| Step 3: `<CompleteStep>` レンダリング             | `skillPath` / `hasExternalIntegration` / `externalToolName` / action cards / `onRetry` 接続 |
| `handleStep0Next()` 関数                          | formData→スマートデフォルト推論→Step 1遷移                                                  |
| `handleGenerate(method)` 関数                     | "complete"/"skip"フラグ付きLLM生成                                                          |
| `handleQualityFeedback(satisfied)` 関数           | フィードバック受信→trackEvent呼び出し                                                       |
| `handleRetry()` 関数                              | CompleteStep の 👎 から Step 0 へ復帰                                                       |

## STEPS名変更

```
変更前: ["説明入力", "設定", "生成", "完了"]
変更後: ["スキル情報入力", "詳細設定", "生成", "完了"]
```

## スマートデフォルト推論ルール

```typescript
// 目的テキストは小文字化して判定（大小文字不問）
// "slack" / "github" / "notion" を含む → tool = "slack" / "github" / "notion"
// 「毎日/毎週/定期」→ timing = "scheduled"
// category === "code-support" → format = "code"
```

## 実装上の要点（2026-04-08時点）

- `CompleteStep` で `skillPath` を表示し、生成先パスを完了画面で確認できる
- `hasExternalIntegration` / `externalToolName` は Step 0 の推論結果を初期値として保持し、Step 3 のチェックリスト表示に使う
- `handleGenerate(method)` は `isGenerating` と `generationLockRef` を使って二重呼び出しを防止し、生成開始時に `clearGenerationState()` でストアを初期化する
- `handleRetry()` は `formData` を保持し、`answers` / `smartDefaults` / `skillPath` / `hasExternalIntegration` / `externalToolName` / `error` / `generationMethod` / `isGenerating` をリセットし、`clearGenerationState()` と `generationLockRef` を初期化して Step 0 に戻す

## Phaseリスト

| Phase | 名前         | 概要                                 |
| ----- | ------------ | ------------------------------------ |
| 1     | 要件定義     | 影響範囲分析・受け入れ基準定義       |
| 2     | 設計         | スマートデフォルト推論フロー設計     |
| 3     | 設計レビュー | 設計の矛盾・漏れチェック             |
| 4     | テスト作成   | Red段階テスト定義                    |
| 5     | 実装         | legacy state削除 + 生成/完了画面接続 |
| 6     | テスト拡充   | エッジケース・回帰テスト             |
| 7     | カバレッジ   | カバレッジ計測・未到達分析           |
| 8     | リファクタ   | コード品質改善                       |
| 9     | 品質保証     | 静的解析・リスク評価                 |
| 10    | 最終レビュー | Phase 1-9 の成果物統合レビュー       |
| 11    | 手動テスト   | ブラウザ/Electron実機確認            |
| 12    | ドキュメント | 実装ガイド・仕様更新・フィードバック |
| 13    | PR作成       | 提出準備・承認待ち                   |
