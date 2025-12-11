# 自動評価手法

## 概要

自動評価は、人間の評価を補完または代替する
スケーラブルな評価手法です。

## 自動評価の種類

### 1. ルールベース評価

事前定義されたルールによる評価

### 2. 参照ベース評価

ゴールデンアンサーとの比較

### 3. モデルベース評価

LLM-as-a-Judge

### 4. 統計ベース評価

出力の統計的特性を評価

## ルールベース評価

### 形式チェック

```typescript
interface FormatValidator {
  validateJSON(output: string): ValidationResult;
  validateSchema(output: unknown, schema: Schema): ValidationResult;
  validateLength(output: string, min: number, max: number): ValidationResult;
  validatePattern(output: string, pattern: RegExp): ValidationResult;
}

function validateOutput(output: string, rules: Rule[]): ValidationResult[] {
  return rules.map((rule) => {
    switch (rule.type) {
      case "json":
        try {
          JSON.parse(output);
          return { passed: true };
        } catch {
          return { passed: false, error: "Invalid JSON" };
        }

      case "length":
        const len = output.length;
        return {
          passed: len >= rule.min && len <= rule.max,
          actual: len,
        };

      case "contains":
        return {
          passed: output.includes(rule.text),
          missing: rule.text,
        };

      case "regex":
        return {
          passed: new RegExp(rule.pattern).test(output),
        };

      default:
        return { passed: true };
    }
  });
}
```

### キーワードチェック

```typescript
function keywordCheck(
  output: string,
  required: string[],
  forbidden: string[],
): CheckResult {
  const missingRequired = required.filter(
    (kw) => !output.toLowerCase().includes(kw.toLowerCase()),
  );

  const foundForbidden = forbidden.filter((kw) =>
    output.toLowerCase().includes(kw.toLowerCase()),
  );

  return {
    passed: missingRequired.length === 0 && foundForbidden.length === 0,
    missingRequired,
    foundForbidden,
  };
}
```

### 安全性チェック

```typescript
const SAFETY_PATTERNS = {
  pii: /\b\d{3}-\d{4}-\d{4}\b|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  hate_speech: /...(パターン).../,
  harmful_instructions: /...(パターン).../,
};

function safetyCheck(output: string): SafetyResult {
  const issues: SafetyIssue[] = [];

  for (const [category, pattern] of Object.entries(SAFETY_PATTERNS)) {
    const matches = output.match(pattern);
    if (matches) {
      issues.push({
        category,
        matches,
        severity: getSeverity(category),
      });
    }
  }

  return {
    is_safe: issues.length === 0,
    issues,
  };
}
```

## 参照ベース評価

### 完全一致

```typescript
function exactMatch(output: string, expected: string): boolean {
  return output.trim() === expected.trim();
}

function normalizedMatch(output: string, expected: string): boolean {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[^\w\s]/g, "")
      .trim();

  return normalize(output) === normalize(expected);
}
```

### 類似度スコア

```typescript
// 文字列類似度（Levenshtein）
function levenshteinSimilarity(a: string, b: string): number {
  const distance = levenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length);
  return 1 - distance / maxLen;
}

// トークン重複（BLEU-like）
function tokenOverlap(output: string, reference: string): number {
  const outTokens = new Set(output.toLowerCase().split(/\s+/));
  const refTokens = new Set(reference.toLowerCase().split(/\s+/));

  const intersection = new Set([...outTokens].filter((t) => refTokens.has(t)));

  const precision = intersection.size / outTokens.size;
  const recall = intersection.size / refTokens.size;

  // F1スコア
  return (2 * (precision * recall)) / (precision + recall) || 0;
}
```

### 埋め込み類似度

```typescript
async function embeddingSimilarity(
  output: string,
  reference: string,
  model: EmbeddingModel,
): Promise<number> {
  const [outputEmb, refEmb] = await Promise.all([
    model.embed(output),
    model.embed(reference),
  ]);

  return cosineSimilarity(outputEmb, refEmb);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

## LLM-as-a-Judge

### 基本評価プロンプト

```markdown
あなたはAI出力の品質評価者です。
以下の出力を評価してください。

## 評価対象

入力: {{input}}
出力: {{output}}
期待される出力（参考）: {{reference}}

## 評価基準

1. 正確性 (1-5): 情報が正確か
2. 完全性 (1-5): 必要な情報が含まれているか
3. 明確性 (1-5): 表現が明確か
4. 適切性 (1-5): 文脈に適切か

## 回答形式（JSON）

{
"accuracy": { "score": 1-5, "reason": "..." },
"completeness": { "score": 1-5, "reason": "..." },
"clarity": { "score": 1-5, "reason": "..." },
"relevance": { "score": 1-5, "reason": "..." },
"overall": 1-5,
"feedback": "改善点..."
}
```

### ペア比較プロンプト

```markdown
以下の2つの出力を比較し、どちらがより良いか判断してください。

## 入力

{{input}}

## 出力A

{{output_a}}

## 出力B

{{output_b}}

## 評価観点

- 正確性
- 完全性
- 明確性
- ユーザーへの有用性

## 回答形式

{
"winner": "A" | "B" | "tie",
"confidence": 0.0-1.0,
"reasoning": "...",
"a_strengths": ["..."],
"a_weaknesses": ["..."],
"b_strengths": ["..."],
"b_weaknesses": ["..."]
}
```

### 分解評価（Rubric-based）

```markdown
以下のルーブリックに基づいて出力を評価してください。

## 出力

{{output}}

## ルーブリック

### 正確性

- 5点: すべての事実が正確
- 4点: 軽微な不正確さが1つ
- 3点: 不正確さが2-3個
- 2点: 重大な不正確さがある
- 1点: 大部分が不正確

### 構造

- 5点: 論理的で読みやすい構造
- 4点: おおむね良い構造
- 3点: 構造に問題あり
- 2点: 構造が不明確
- 1点: 構造がない

## 回答
```

### 評価の信頼性向上

```typescript
async function reliableLLMEvaluation(
  input: string,
  output: string,
  evaluationPrompt: string,
  options: {
    numEvaluations?: number;
    temperature?: number;
    models?: string[];
  } = {},
): Promise<AggregatedEvaluation> {
  const {
    numEvaluations = 3,
    temperature = 0.3,
    models = ["claude-3-sonnet"],
  } = options;

  // 複数回評価
  const evaluations = await Promise.all(
    Array(numEvaluations)
      .fill(null)
      .map(() => callLLM(evaluationPrompt, { temperature })),
  );

  // 結果を集約
  const scores = evaluations.map((e) => parseScore(e));
  const agreement = calculateAgreement(scores);

  return {
    meanScore: mean(scores),
    stdDev: standardDeviation(scores),
    agreement,
    rawEvaluations: evaluations,
    confidence: agreement > 0.8 ? "high" : agreement > 0.6 ? "medium" : "low",
  };
}
```

## 統計ベース評価

### 出力の多様性

```typescript
function diversityScore(outputs: string[]): number {
  // 一意な出力の割合
  const unique = new Set(outputs);
  return unique.size / outputs.length;
}

function nGramDiversity(outputs: string[], n: number = 2): number {
  const allNgrams = new Set<string>();
  const totalNgrams = outputs.reduce((acc, output) => {
    const ngrams = getNgrams(output, n);
    ngrams.forEach((ng) => allNgrams.add(ng));
    return acc + ngrams.length;
  }, 0);

  return allNgrams.size / totalNgrams;
}
```

### 出力の長さ分布

```typescript
function lengthStatistics(outputs: string[]): LengthStats {
  const lengths = outputs.map((o) => o.length);

  return {
    mean: mean(lengths),
    median: median(lengths),
    stdDev: standardDeviation(lengths),
    min: Math.min(...lengths),
    max: Math.max(...lengths),
    p25: percentile(lengths, 25),
    p75: percentile(lengths, 75),
  };
}
```

## 評価パイプライン

### 完全なパイプライン

```typescript
interface EvaluationPipeline {
  stages: EvaluationStage[];
  aggregation: AggregationStrategy;
}

const pipeline: EvaluationPipeline = {
  stages: [
    // Stage 1: 形式チェック（高速）
    {
      name: "format_check",
      type: "rule_based",
      weight: 0.2,
      validators: [
        { type: "json", required: true },
        { type: "schema", schema: outputSchema },
      ],
    },

    // Stage 2: 安全性チェック（高速）
    {
      name: "safety_check",
      type: "rule_based",
      weight: 0.1,
      validators: [{ type: "safety", patterns: SAFETY_PATTERNS }],
    },

    // Stage 3: 参照比較（中速）
    {
      name: "reference_comparison",
      type: "reference_based",
      weight: 0.3,
      metrics: ["embedding_similarity", "token_overlap"],
    },

    // Stage 4: LLM評価（低速）
    {
      name: "llm_evaluation",
      type: "model_based",
      weight: 0.4,
      config: {
        prompt: evaluationPrompt,
        numRuns: 3,
      },
    },
  ],

  aggregation: {
    method: "weighted_average",
    earlyStop: {
      onFormatFail: true,
      onSafetyFail: true,
    },
  },
};
```

### 実行例

```typescript
async function runEvaluationPipeline(
  testCases: TestCase[],
  pipeline: EvaluationPipeline,
): Promise<EvaluationReport> {
  const results: TestResult[] = [];

  for (const testCase of testCases) {
    let stageResults: StageResult[] = [];
    let shouldContinue = true;

    for (const stage of pipeline.stages) {
      if (!shouldContinue) break;

      const stageResult = await runStage(stage, testCase);
      stageResults.push(stageResult);

      // 早期終了チェック
      if (pipeline.aggregation.earlyStop) {
        if (
          stage.name === "format_check" &&
          pipeline.aggregation.earlyStop.onFormatFail &&
          !stageResult.passed
        ) {
          shouldContinue = false;
        }
        if (
          stage.name === "safety_check" &&
          pipeline.aggregation.earlyStop.onSafetyFail &&
          !stageResult.passed
        ) {
          shouldContinue = false;
        }
      }
    }

    // スコア集約
    const finalScore = aggregateScores(stageResults, pipeline.stages);

    results.push({
      testCase,
      stageResults,
      finalScore,
      passed: finalScore >= threshold,
    });
  }

  return generateReport(results);
}
```

## ベストプラクティス

### 評価の組み合わせ

```yaml
recommended_combination:
  fast_feedback:
    - rule_based: "形式、安全性"
    - purpose: "即時フィードバック"

  quality_assessment:
    - reference_based: "類似度"
    - model_based: "LLM評価"
    - purpose: "品質測定"

  final_validation:
    - human_evaluation: "サンプル"
    - purpose: "最終確認"
```

### 評価コストの最適化

```
高コスト（LLM評価）
  ↑
  │  サンプリング
  │  ────────────
  │
  │  自動フィルタリング
  │  ────────────────
  │
低コスト（ルールベース）
  ↓

戦略: 低コスト評価で絞り込み、
      高コスト評価はサンプルのみ
```
