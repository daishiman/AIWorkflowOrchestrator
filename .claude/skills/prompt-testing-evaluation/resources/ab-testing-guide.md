# A/Bテストガイド

## 概要

A/Bテストは、2つ以上のプロンプトバリアントを
比較し、統計的に優位なものを選択する手法です。

## A/Bテストの基礎

### いつA/Bテストを行うか

**適切な場面**:

- プロンプトの改善候補がある
- 変更の影響を定量化したい
- リスクを最小化してデプロイしたい
- データに基づく意思決定をしたい

**不適切な場面**:

- 明らかに一方が優れている
- サンプルサイズが確保できない
- 緊急の修正が必要
- 測定可能な指標がない

### 基本用語

| 用語           | 説明                     |
| -------------- | ------------------------ |
| コントロール   | 現行のプロンプト（A）    |
| トリートメント | 新しいプロンプト（B）    |
| サンプルサイズ | テストに使用するデータ量 |
| 統計的有意性   | 差が偶然でない確率       |
| 効果量         | 改善の大きさ             |

## テスト設計

### Step 1: 仮説の設定

```yaml
hypothesis:
  null: "プロンプトAとBに差はない"
  alternative: "プロンプトBはAより精度が高い"

  metrics:
    primary: "accuracy"
    secondary: ["latency", "token_usage"]

  expected_improvement: ">5%"
  confidence_level: 0.95
```

### Step 2: サンプルサイズの決定

**計算式（比率の差の検定）**:

```
n = 2 × ((z_α + z_β)² × p × (1-p)) / d²

where:
  z_α = 1.96 (95%信頼水準)
  z_β = 0.84 (80%検出力)
  p = 期待される比率の平均
  d = 検出したい最小の差
```

**簡易計算表**:
| 検出したい差 | 必要サンプル数 (per group) |
|-------------|---------------------------|
| 10% | ~200 |
| 5% | ~800 |
| 3% | ~2,200 |
| 1% | ~20,000 |

### Step 3: 実験設計

```yaml
experiment_design:
  name: "Prompt Clarity Improvement"
  start_date: "2024-01-15"
  end_date: "2024-01-22"

  variants:
    control:
      name: "baseline_v1"
      prompt: "..."
      allocation: 50%

    treatment:
      name: "improved_v2"
      prompt: "..."
      allocation: 50%

  segmentation:
    - random # ランダム割り当て
    # - user_based  # ユーザー単位
    # - request_based  # リクエスト単位

  guardrails:
    max_error_rate: 15%
    stop_if_degradation: true
```

## テスト実行

### ランダム化

```typescript
function assignVariant(requestId: string, variants: Variant[]): Variant {
  // 一貫したハッシュベースの割り当て
  const hash = crypto.createHash("md5").update(requestId).digest("hex");

  const value = parseInt(hash.substring(0, 8), 16) / 0xffffffff;

  let cumulative = 0;
  for (const variant of variants) {
    cumulative += variant.allocation;
    if (value < cumulative) {
      return variant;
    }
  }

  return variants[variants.length - 1];
}
```

### データ収集

```typescript
interface ABTestResult {
  request_id: string;
  timestamp: string;
  variant: string;

  // 入出力
  input: string;
  output: string;

  // メトリクス
  accuracy: number | null;
  latency_ms: number;
  tokens: number;
  error: boolean;

  // メタデータ
  user_id?: string;
  session_id?: string;
}
```

### モニタリング

```yaml
monitoring:
  real_time:
    - error_rate_by_variant
    - latency_distribution
    - sample_count

  alerts:
    - condition: "treatment.error_rate > control.error_rate * 1.5"
      action: "pause_experiment"

  checkpoints:
    - at: 25%
      check: "no_critical_issues"
    - at: 50%
      check: "preliminary_analysis"
    - at: 100%
      check: "final_analysis"
```

## 結果分析

### 統計的検定

**比率の差（精度など）**:

```typescript
function chiSquareTest(
  controlSuccess: number,
  controlTotal: number,
  treatmentSuccess: number,
  treatmentTotal: number,
): { pValue: number; significant: boolean } {
  // カイ二乗検定の実装
  const controlRate = controlSuccess / controlTotal;
  const treatmentRate = treatmentSuccess / treatmentTotal;
  const pooledRate =
    (controlSuccess + treatmentSuccess) / (controlTotal + treatmentTotal);

  const expectedControl = controlTotal * pooledRate;
  const expectedTreatment = treatmentTotal * pooledRate;

  const chiSquare =
    Math.pow(controlSuccess - expectedControl, 2) / expectedControl +
    Math.pow(treatmentSuccess - expectedTreatment, 2) / expectedTreatment;

  // p値の計算（1自由度）
  const pValue = 1 - chiSquareCDF(chiSquare, 1);

  return {
    pValue,
    significant: pValue < 0.05,
  };
}
```

**連続値（レイテンシなど）**:

```typescript
function tTest(
  controlValues: number[],
  treatmentValues: number[],
): { pValue: number; significant: boolean } {
  const controlMean = mean(controlValues);
  const treatmentMean = mean(treatmentValues);
  const controlStd = standardDeviation(controlValues);
  const treatmentStd = standardDeviation(treatmentValues);

  const pooledStdError = Math.sqrt(
    controlStd ** 2 / controlValues.length +
      treatmentStd ** 2 / treatmentValues.length,
  );

  const tStatistic = (treatmentMean - controlMean) / pooledStdError;

  // p値の計算
  const df = controlValues.length + treatmentValues.length - 2;
  const pValue = 2 * (1 - tDistributionCDF(Math.abs(tStatistic), df));

  return {
    pValue,
    significant: pValue < 0.05,
  };
}
```

### 結果レポート

```markdown
# A/Bテスト結果レポート

## 実験概要

- 実験名: Prompt Clarity Improvement
- 期間: 2024-01-15 〜 2024-01-22
- サンプルサイズ: Control 1,000 / Treatment 1,000

## 結果サマリー

| メトリクス | Control | Treatment | 差分   | p値   | 有意 |
| ---------- | ------- | --------- | ------ | ----- | ---- |
| 精度       | 87.2%   | 91.5%     | +4.3%  | 0.003 | ✓    |
| レイテンシ | 1.2s    | 1.3s      | +8.3%  | 0.12  | -    |
| トークン   | 450     | 520       | +15.6% | 0.001 | ✓    |

## 結論

- 精度は統計的に有意に改善（+4.3%）
- レイテンシの増加は有意でない
- トークン使用量が増加（+15.6%）

## 推奨

Treatment（改善版）の採用を推奨。
ただし、トークンコスト増加（約16%）を考慮し、
コスト対効果を確認すること。
```

## 高度なテクニック

### 多変量テスト（A/B/n）

```yaml
multivariate_test:
  variants:
    A:
      prompt_style: "formal"
      example_count: 2
    B:
      prompt_style: "formal"
      example_count: 3
    C:
      prompt_style: "casual"
      example_count: 2
    D:
      prompt_style: "casual"
      example_count: 3

  analysis:
    - main_effects: ["prompt_style", "example_count"]
    - interaction: ["prompt_style × example_count"]
```

### バンディットテスト

**Multi-Armed Bandit（MAB）**:

```typescript
class ThompsonSampling {
  private alphas: Map<string, number> = new Map();
  private betas: Map<string, number> = new Map();

  constructor(variants: string[]) {
    variants.forEach((v) => {
      this.alphas.set(v, 1);
      this.betas.set(v, 1);
    });
  }

  selectVariant(): string {
    let bestVariant = "";
    let bestSample = -1;

    for (const [variant, alpha] of this.alphas) {
      const beta = this.betas.get(variant)!;
      const sample = betaSample(alpha, beta);

      if (sample > bestSample) {
        bestSample = sample;
        bestVariant = variant;
      }
    }

    return bestVariant;
  }

  update(variant: string, success: boolean): void {
    if (success) {
      this.alphas.set(variant, this.alphas.get(variant)! + 1);
    } else {
      this.betas.set(variant, this.betas.get(variant)! + 1);
    }
  }
}
```

**利点**:

- 探索と活用のバランス
- 劣勢バリアントへの露出を自動的に減少
- より早い収束

### 段階的ロールアウト

```yaml
rollout_stages:
  stage_1:
    treatment_allocation: 5%
    duration: "2 days"
    criteria: "no_critical_errors"

  stage_2:
    treatment_allocation: 25%
    duration: "3 days"
    criteria: "metrics_not_degraded"

  stage_3:
    treatment_allocation: 50%
    duration: "3 days"
    criteria: "positive_trend"

  stage_4:
    treatment_allocation: 100%
    criteria: "final_approval"
```

## よくある落とし穴

### 1. 早すぎる終了

```
❌ 誤り: 初期結果が良さそうなので早期終了
✅ 正解: 予定サンプルサイズまで継続
```

### 2. 複数メトリクスの同時検定

```
❌ 誤り: 5つのメトリクスすべてでp<0.05を要求
✅ 正解: 主要メトリクスを1つ決め、補正を適用
```

### 3. ピーキング問題

```
❌ 誤り: 毎日p値をチェックして有意になったら終了
✅ 正解: 事前に決めたサンプルサイズで1回だけ検定
```

### 4. セグメンテーションの無視

```
❌ 誤り: 全体の結果だけを見る
✅ 正解: セグメント別（ユーザータイプ、タスクタイプ）も確認
```
