# W2-seq-03a アーキテクチャ設計

## タスクID: W2-seq-03a

---

## State設計テーブル

| State名                  | 型                           | 初期値       | ライフサイクル                                   | 説明                               |
| ------------------------ | ---------------------------- | ------------ | ------------------------------------------------ | ---------------------------------- |
| `currentStep`            | `number`                     | `0`          | ウィザード全体                                   | 現在表示中のステップ番号           |
| `formData`               | `SkillFormData \| null`      | `null`       | Step 0 入力後に設定、handleRetry でも保持        | Step 0 の入力データ                |
| `answers`                | `string[]`                   | `[]`         | Step 1 入力中に更新、handleRetry でリセット      | ConversationRoundStep の回答リスト |
| `smartDefaults`          | `SmartDefaultResult \| null` | `null`       | handleStep0Next 時に設定、handleRetry でリセット | inferSmartDefaults の推論結果      |
| `generationMethod`       | `'complete' \| 'skip'`       | `'complete'` | handleGenerate 時に確定                          | LLM生成方式                        |
| `skillPath`              | `string \| null`             | `null`       | 生成完了時に設定、handleRetry でリセット         | 生成済みスキルのファイルパス       |
| `hasExternalIntegration` | `boolean`                    | `false`      | handleStep0Next 時に推論から設定                 | 外部ツール連携の有無               |
| `externalToolName`       | `string \| null`             | `null`       | handleStep0Next 時に推論から設定                 | 外部連携ツール名                   |

---

## ハンドラ設計

### handleStep0Next(data: SkillFormData): void

```
1. setFormData(data)
2. const result = inferSmartDefaults(data)
3. setSmartDefaults(result)
4. setHasExternalIntegration(result.hasExternalIntegration)
5. setExternalToolName(result.externalToolName ?? null)
6. setCurrentStep(1)
```

### handleGenerate(method: 'complete' | 'skip'): Promise<void>

```
1. setGenerationMethod(method)
2. setCurrentStep(2)  // GenerateStep へ遷移
3. const result = await generateSkillVieLLM(formData, answers, method)
4. setSkillPath(result.skillPath)
5. setCurrentStep(3)  // CompleteStep へ遷移
```

### handleQualityFeedback(feedback: QualityFeedback): void

```
1. // フィードバックを記録（ログ/分析用途）
2. recordFeedback(feedback)
```

### handleRetry(): void

```
1. setCurrentStep(0)
2. // formData は保持（前回入力を引き継ぐ）
3. setAnswers([])
4. setSmartDefaults(null)
5. setSkillPath(null)
6. setHasExternalIntegration(false)
7. setExternalToolName(null)
```

---

## レンダリング設計

### STEPS配列

```typescript
const STEPS = ["スキル情報入力", "詳細設定", "生成", "完了"];
```

### Step 0: SkillInfoStep

```tsx
<SkillInfoStep initialData={formData} onNext={handleStep0Next} />
```

- `initialData` に前回の `formData` を渡すことで、handleRetry 時に入力値を復元する

### Step 1: ConversationRoundStep

```tsx
<ConversationRoundStep
  formData={formData}
  smartDefaults={smartDefaults}
  answers={answers}
  onAnswersChange={setAnswers}
  onGenerate={handleGenerate}
/>
```

### Step 2: GenerateStep

```tsx
<GenerateStep
  formData={formData}
  answers={answers}
  generationMethod={generationMethod}
  // generationMode prop は削除済み
/>
```

### Step 3: CompleteStep

```tsx
<CompleteStep
  skillPath={skillPath}
  hasExternalIntegration={hasExternalIntegration}
  externalToolName={externalToolName}
  onClose={onClose}        // optional
  onExecuteNow={...}
  onOpenInEditor={...}
  onCreateAnother={...}
  onQualityFeedback={handleQualityFeedback}
  onRetry={handleRetry}
/>
```

---

## 型定義

### SkillFormData（既存型を利用）

```typescript
interface SkillFormData {
  name: string;
  purpose: string;
  category: SkillCategory | null;
}
```

### SmartDefaultResult（packages/shared に定義済み）

```typescript
interface SmartDefaultResult {
  hasExternalIntegration: boolean;
  externalToolName: string | null;
  generationMethod: "complete" | "skip";
  inferenceLog?: string[];
}
```

### QualityFeedback

```typescript
interface QualityFeedback {
  rating: "good" | "bad";
  comment?: string;
}
```

---

## 設計上の制約

1. `inferSmartDefaults` は純粋関数とし、副作用を持たない
2. `handleGenerate` は非同期処理を含むが、エラー時は GenerateStep 内でハンドリングする
3. `formData` は `handleRetry` 後も保持するため、Step 0 の `initialData` に渡す
4. `generationMode` prop は `GenerateStep` から完全に削除し、後方互換性を持たせない
