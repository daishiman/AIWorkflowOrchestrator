# 検証メカニズム

## 概要

検証メカニズムは、AI出力の品質を事後的に保証する
最後の防衛線です。

## 検証タイプ

### 1. 構造検証

**目的**: 出力が期待される形式に従っているか確認

**検証項目**:

- スキーマ準拠
- 型整合性
- 必須フィールドの存在
- 値の制約

**実装例**:

```typescript
function validateStructure(output: unknown, schema: z.ZodSchema) {
  const result = schema.safeParse(output);
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.issues,
      suggestion: "スキーマに従って再生成してください",
    };
  }
  return { valid: true, data: result.data };
}
```

### 2. 内容検証

**目的**: 出力内容が入力と整合しているか確認

**検証項目**:

- 入力データとの整合性
- 論理的一貫性
- 矛盾の検出
- 情報源のトレーサビリティ

**実装例**:

```typescript
interface ContentValidation {
  inputReference: string; // 参照した入力箇所
  outputClaim: string; // 出力の主張
  isSupported: boolean; // 入力で裏付けられているか
  confidence: number; // 確信度
}

function validateContent(
  output: OutputData,
  input: InputData,
): ContentValidation[] {
  return output.claims.map((claim) => ({
    inputReference: findReference(claim, input),
    outputClaim: claim.text,
    isSupported: checkSupport(claim, input),
    confidence: calculateConfidence(claim, input),
  }));
}
```

### 3. 信頼度検証

**目的**: AIの確信度が閾値を満たしているか確認

**検証項目**:

- 信頼度スコアの存在
- 閾値の適用
- 低信頼度項目のフラグ付け

**閾値設定**:

```typescript
const CONFIDENCE_THRESHOLDS = {
  high_risk: 0.95, // 法的・医療・金融
  medium_risk: 0.8, // 技術情報
  low_risk: 0.6, // 一般情報
};

function validateConfidence(
  output: OutputWithConfidence,
  riskLevel: keyof typeof CONFIDENCE_THRESHOLDS,
): ValidationResult {
  const threshold = CONFIDENCE_THRESHOLDS[riskLevel];
  const lowConfidenceItems = output.items.filter(
    (item) => item.confidence < threshold,
  );

  return {
    valid: lowConfidenceItems.length === 0,
    lowConfidenceItems,
    suggestion:
      lowConfidenceItems.length > 0
        ? `${lowConfidenceItems.length}件の項目が信頼度閾値未満です`
        : null,
  };
}
```

### 4. クロス検証

**目的**: 複数の方法で出力を検証

**検証方法**:

- 複数回生成による一致確認
- 異なるモデルでの検証
- 人間レビューとの照合

**実装例**:

```typescript
async function crossValidate(
  prompt: string,
  iterations: number = 3,
): Promise<CrossValidationResult> {
  const outputs = await Promise.all(
    Array(iterations)
      .fill(null)
      .map(() => generateOutput(prompt)),
  );

  const consensus = findConsensus(outputs);
  const disagreements = findDisagreements(outputs);

  return {
    consensusItems: consensus,
    disagreementItems: disagreements,
    agreementRate: consensus.length / (consensus.length + disagreements.length),
    recommendation:
      disagreements.length > 0
        ? "不一致項目は人間レビューを推奨"
        : "一致率が高いため信頼性良好",
  };
}
```

## 検証フロー

```
AI出力
  │
  ▼
┌─────────────────┐
│  構造検証       │
│  (スキーマ)     │
└────────┬────────┘
         │ Pass
         ▼
┌─────────────────┐
│  内容検証       │
│  (整合性)       │
└────────┬────────┘
         │ Pass
         ▼
┌─────────────────┐
│  信頼度検証     │
│  (閾値)         │
└────────┬────────┘
         │ Pass
         ▼
┌─────────────────┐
│  クロス検証     │  ← 高リスクタスクのみ
│  (複数検証)     │
└────────┬────────┘
         │ Pass
         ▼
    検証完了
```

## エラーハンドリング

### 検証失敗時の対応

```typescript
interface ValidationFailure {
  stage: "structure" | "content" | "confidence" | "cross";
  errors: ValidationError[];
  retryable: boolean;
  suggestion: string;
}

async function handleValidationFailure(
  failure: ValidationFailure,
  originalPrompt: string,
  maxRetries: number = 3,
): Promise<RetryResult> {
  if (!failure.retryable || maxRetries <= 0) {
    return { success: false, escalate: true };
  }

  // エラーをフィードバックとして含めて再試行
  const feedbackPrompt = `
    前回の出力に以下の問題がありました：
    ${failure.errors.map((e) => `- ${e.message}`).join("\n")}

    ${failure.suggestion}

    ${originalPrompt}
  `;

  const newOutput = await generateOutput(feedbackPrompt);
  const newValidation = await validateOutput(newOutput);

  if (newValidation.valid) {
    return { success: true, output: newOutput };
  }

  return handleValidationFailure(
    newValidation.failure,
    originalPrompt,
    maxRetries - 1,
  );
}
```

### エスカレーション

```typescript
interface EscalationRequest {
  reason: string;
  failedValidations: ValidationFailure[];
  originalInput: unknown;
  lastOutput: unknown;
  suggestedActions: string[];
}

function escalateToHumanReview(request: EscalationRequest): void {
  // 人間レビューキューに追加
  // 通知を送信
  // ログを記録
}
```

## ベストプラクティス

### 1. 段階的な検証

- 軽い検証から開始
- 問題があれば詳細な検証へ
- リソースの効率的な使用

### 2. フィードバックループ

- 検証エラーをAIにフィードバック
- 自己修正の機会を与える
- 改善が見られない場合はエスカレーション

### 3. 検証結果の記録

- すべての検証結果をログ
- 傾向分析に活用
- プロンプト改善の材料に
