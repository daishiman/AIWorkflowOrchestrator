# W2-seq-03a 要件定義

## タスク概要

`SkillCreateWizard.tsx` のオーケストレーション更新。テンプレート生成モードを廃止してLLM専用化し、スマートデフォルト推論・会話ラリーStep・品質フィードバックハンドラを追加する。

---

## 機能要件

### 1. 削除対象

| 項目                         | 種別         | 理由                                  |
| ---------------------------- | ------------ | ------------------------------------- |
| `generationMode` state       | State削除    | LLM専用化に伴いテンプレートモード廃止 |
| `description` state          | State削除    | `formData` に統合                     |
| `options` state              | State削除    | `formData` に統合                     |
| `GenerationMode` import      | Import削除   | 型不要                                |
| `DescribeStep` import        | Import削除   | `SkillInfoStep` に置換                |
| `handleLlmGenerate()`        | ハンドラ削除 | `handleGenerate(method)` に統合       |
| `handleExecutePlan()`        | ハンドラ削除 | plan実行フロー廃止                    |
| `handleCancelPlan()`         | ハンドラ削除 | plan実行フロー廃止                    |
| `handleDescribeNext()`       | ハンドラ削除 | `handleStep0Next()` に置換            |
| `clearPlanExecutionState()`  | 関数削除     | plan実行フロー廃止                    |
| 各種plan/execute store hooks | Hook削除     | plan実行フロー廃止                    |

### 2. 追加対象

#### 2-1. State追加

| State名                  | 型                           | 初期値       | 説明                                             |
| ------------------------ | ---------------------------- | ------------ | ------------------------------------------------ |
| `formData`               | `SkillFormData \| null`      | `null`       | Step 0 の入力データ（name, purpose, category等） |
| `answers`                | `string[]`                   | `[]`         | ConversationRoundStep の会話回答リスト           |
| `smartDefaults`          | `SmartDefaultResult \| null` | `null`       | inferSmartDefaults の推論結果                    |
| `generationMethod`       | `'complete' \| 'skip'`       | `'complete'` | LLM生成方式（詳細生成/スキップ）                 |
| `skillPath`              | `string \| null`             | `null`       | 生成済みスキルのファイルパス                     |
| `hasExternalIntegration` | `boolean`                    | `false`      | 外部ツール連携の有無                             |
| `externalToolName`       | `string \| null`             | `null`       | 外部連携ツール名                                 |

#### 2-2. 関数追加

##### `inferSmartDefaults(formData: SkillFormData): SmartDefaultResult`

推論ルール:

| 条件                                                  | 推論結果                                                        |
| ----------------------------------------------------- | --------------------------------------------------------------- |
| `formData.purpose` に "slack" を含む（大小文字不問）  | `hasExternalIntegration = true`, `externalToolName = "Slack"`   |
| `formData.purpose` に "github" を含む（大小文字不問） | `hasExternalIntegration = true`, `externalToolName = "GitHub"`  |
| `formData.purpose` に "notion" を含む（大小文字不問） | `hasExternalIntegration = true`, `externalToolName = "Notion"`  |
| `formData.category === 'schedule'`                    | `generationMethod = 'complete'`（スケジュール系は詳細生成推奨） |
| `formData.category === 'realtime'`                    | `generationMethod = 'complete'`（リアルタイム系は詳細生成推奨） |
| `formData.category === 'code-support'`                | `generationMethod = 'skip'`（コードサポート系はスキップ可）     |
| `formData.category === 'data-analysis'`               | `generationMethod = 'skip'`（データ分析系はスキップ可）         |

#### 2-3. ハンドラ追加

| ハンドラ名               | シグネチャ                                        | 説明                                                                             |
| ------------------------ | ------------------------------------------------- | -------------------------------------------------------------------------------- |
| `handleStep0Next`        | `(data: SkillFormData) => void`                   | Step 0 完了時に `formData` を保存し、`inferSmartDefaults` を実行してStep 1へ進む |
| `handleGenerate(method)` | `(method: 'complete' \| 'skip') => Promise<void>` | LLMによるスキル生成を実行。`generationMethod` を更新し生成APIを呼び出す          |
| `handleQualityFeedback`  | `(feedback: QualityFeedback) => void`             | 生成結果へのフィードバックを受け取り記録する                                     |
| `handleRetry`            | `() => void`                                      | Step 0 に戻り、前回の `formData` を保持したまま再入力を可能にする                |

### 3. STEPS配列更新

```typescript
const STEPS = ["スキル情報入力", "詳細設定", "生成", "完了"];
```

### 4. ステップレンダリング更新

| Step番号 | コンポーネント          | 主な変更点                                                                                    |
| -------- | ----------------------- | --------------------------------------------------------------------------------------------- |
| Step 0   | `SkillInfoStep`         | `DescribeStep` から置換。`onNext={handleStep0Next}` を接続                                    |
| Step 1   | `ConversationRoundStep` | `onGenerate={handleGenerate}` を接続                                                          |
| Step 2   | `GenerateStep`          | `generationMode` prop を削除                                                                  |
| Step 3   | `CompleteStep`          | `skillPath` / `hasExternalIntegration` / `externalToolName` / action cards / `onRetry` を接続 |

---

## 非機能要件

### 型安全性

- `any` 型の使用を禁止する
- 新規追加するすべての State・ハンドラ・Props は TypeScript の厳密な型定義を持つこと
- `SmartDefaultResult` 型を `packages/shared` に定義し、フロントエンド・バックエンド間で共有すること

### テストカバレッジ

- `inferSmartDefaults` 関数のユニットテストカバレッジ 100% を維持すること
- `handleStep0Next` / `handleGenerate` / `handleRetry` の統合テストを追加すること
- 削除したハンドラ・state に依存する既存テストを更新すること
