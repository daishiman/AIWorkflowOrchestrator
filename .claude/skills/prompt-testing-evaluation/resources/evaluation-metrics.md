# 評価メトリクス

## 概要

プロンプトの品質を定量的に評価するための
メトリクス体系を解説します。

## メトリクス分類

### 1. 品質メトリクス

出力の内容に関する品質を測定

### 2. 運用メトリクス

システムのパフォーマンスを測定

### 3. ビジネスメトリクス

ビジネス価値への影響を測定

## 品質メトリクス詳細

### 精度（Accuracy）

**定義**: 正しい出力の割合

**計算式**:

```
精度 = 正しい出力数 / 総出力数
```

**測定方法**:

1. ゴールデンデータセットとの比較
2. 人間評価
3. 自動評価（完全一致、類似度）

**適用場面**:

- 分類タスク
- 抽出タスク
- 質問応答

### 一貫性（Consistency）

**定義**: 同じ入力に対する出力の安定性

**計算式**:

```
一貫性 = 1 - (出力のバリアンス / 許容範囲)
```

**測定方法**:

```typescript
async function measureConsistency(
  prompt: string,
  input: string,
  runs: number = 5,
): Promise<number> {
  const outputs = await Promise.all(
    Array(runs)
      .fill(null)
      .map(() => generateOutput(prompt, input)),
  );

  // 出力の類似度を計算
  const similarities = calculatePairwiseSimilarity(outputs);
  return average(similarities);
}
```

**適用場面**:

- 決定論的な出力が必要な場合
- 信頼性が重要な場面

### 完全性（Completeness）

**定義**: 必要な情報がすべて含まれているか

**測定方法**:

```yaml
completeness_checklist:
  - field_a: present/missing
  - field_b: present/missing
  - field_c: present/missing

score: present_count / total_fields
```

**適用場面**:

- データ抽出
- レポート生成
- 要約タスク

### 適切性（Relevance）

**定義**: 出力が文脈に適合しているか

**測定方法**:

1. 人間評価（1-5スケール）
2. LLM-as-a-Judge
3. 埋め込み類似度

**評価基準**:
| スコア | 説明 |
|--------|------|
| 5 | 完全に適切 |
| 4 | ほぼ適切、軽微な問題 |
| 3 | 部分的に適切 |
| 2 | あまり適切でない |
| 1 | 全く適切でない |

### 有害性（Harmfulness）

**定義**: 有害なコンテンツの有無

**測定方法**:

```typescript
interface SafetyCheck {
  is_safe: boolean;
  categories: {
    hate_speech: boolean;
    violence: boolean;
    sexual: boolean;
    misinformation: boolean;
  };
  confidence: number;
}
```

**適用場面**:

- ユーザー向け出力
- 公開コンテンツ

## 運用メトリクス詳細

### レイテンシ（Latency）

**定義**: 応答までの時間

**測定ポイント**:

```
Total Latency =
  Network Time +
  Queue Time +
  Processing Time +
  Token Generation Time
```

**ベンチマーク**:
| ユースケース | 目標 |
|-------------|------|
| リアルタイムチャット | <2秒 |
| バッチ処理 | <30秒 |
| 複雑な分析 | <60秒 |

### トークン使用量

**定義**: 入出力で消費されるトークン数

**計算式**:

```
総トークン = 入力トークン + 出力トークン
コスト = (入力トークン × 入力単価) + (出力トークン × 出力単価)
```

**最適化指標**:

```yaml
token_efficiency:
  target_ratio: output_quality / tokens_used
  acceptable_overhead: <20%
```

### エラー率

**定義**: 失敗したリクエストの割合

**カテゴリ**:

```yaml
error_categories:
  api_errors: # APIエラー
  timeout_errors: # タイムアウト
  format_errors: # 出力形式エラー
  content_errors: # 内容エラー
  safety_errors: # 安全性エラー
```

**目標値**:

- 全体エラー率: <5%
- 重大エラー率: <1%

### スループット

**定義**: 単位時間あたりの処理数

**計算式**:

```
スループット = 処理リクエスト数 / 時間
```

**考慮事項**:

- レート制限
- 並列処理能力
- バッチサイズ

## ビジネスメトリクス

### ユーザー満足度

**測定方法**:

1. 明示的フィードバック（👍/👎）
2. アンケート（NPS、CSAT）
3. 行動指標（再利用率、完了率）

### タスク完了率

**定義**: ユーザーがタスクを完了できた割合

**計算式**:

```
完了率 = 成功タスク数 / 開始タスク数
```

### コスト対効果

**計算式**:

```
ROI = (価値創出 - コスト) / コスト × 100%
```

## メトリクス収集の実装

### データ収集パイプライン

```typescript
interface MetricEvent {
  timestamp: string;
  request_id: string;
  prompt_version: string;

  // 入出力
  input: string;
  output: string;

  // 品質メトリクス
  accuracy?: number;
  consistency?: number;
  completeness?: number;

  // 運用メトリクス
  latency_ms: number;
  input_tokens: number;
  output_tokens: number;
  error?: string;

  // コンテキスト
  user_id?: string;
  task_type?: string;
}
```

### ダッシュボード設計

```yaml
dashboard_panels:
  overview:
    - total_requests
    - success_rate
    - average_latency
    - total_cost

  quality:
    - accuracy_trend
    - consistency_distribution
    - error_breakdown

  operations:
    - latency_percentiles (p50, p95, p99)
    - token_usage_by_model
    - error_rate_timeline

  comparison:
    - version_comparison
    - ab_test_results
```

## メトリクス目標設定

### SMART目標

```yaml
metric_goals:
  accuracy:
    specific: "分類タスクの精度"
    measurable: ">95%"
    achievable: "現在92%から改善"
    relevant: "ユーザー満足度に直結"
    time_bound: "2週間以内"

  latency:
    specific: "p95レイテンシ"
    measurable: "<2000ms"
    achievable: "現在2500msから改善"
    relevant: "UX要件"
    time_bound: "1週間以内"
```

### 段階的目標

```yaml
maturity_levels:
  level_1_basic:
    accuracy: ">80%"
    error_rate: "<10%"
    latency_p95: "<5000ms"

  level_2_improved:
    accuracy: ">90%"
    error_rate: "<5%"
    latency_p95: "<3000ms"

  level_3_optimized:
    accuracy: ">95%"
    error_rate: "<2%"
    latency_p95: "<2000ms"

  level_4_excellent:
    accuracy: ">98%"
    error_rate: "<1%"
    latency_p95: "<1000ms"
```

## アラート設定

### アラートルール

```yaml
alerts:
  critical:
    - name: "High Error Rate"
      condition: "error_rate > 10%"
      window: "5 minutes"
      action: "page_oncall"

  warning:
    - name: "Accuracy Degradation"
      condition: "accuracy < 90%"
      window: "1 hour"
      action: "notify_team"

  info:
    - name: "Token Usage Spike"
      condition: "tokens > baseline * 1.5"
      window: "1 hour"
      action: "log"
```

## メトリクス選択ガイド

### タスクタイプ別推奨メトリクス

| タスクタイプ | 主要メトリクス | 副次メトリクス     |
| ------------ | -------------- | ------------------ |
| 分類         | 精度、F1       | レイテンシ、一貫性 |
| 抽出         | 完全性、精度   | 適切性             |
| 生成         | 適切性、有害性 | 多様性、一貫性     |
| 対話         | ユーザー満足度 | レイテンシ、完了率 |
| 要約         | 完全性、簡潔性 | 精度               |
