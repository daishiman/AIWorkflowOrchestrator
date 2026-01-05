# Observability 基礎知識

> **相対パス**: `references/basics.md`
> **原典**: Google SRE Book, Observability Engineering (Honeycomb)

---

## Observabilityとは

システムの内部状態を外部出力から理解する能力。
「何が起きているか」だけでなく「なぜ起きているか」を把握することを目指す。

**Monitoring vs Observability**:

- Monitoring: 既知の問題を検出（What is broken?）
- Observability: 未知の問題を探索（Why is it broken?）

---

## 3本柱 (Three Pillars)

| 柱      | 説明                         | 主なツール                    |
| ------- | ---------------------------- | ----------------------------- |
| Metrics | 時系列の数値データ           | Prometheus, InfluxDB, Datadog |
| Logs    | イベントのテキスト記録       | Elasticsearch, Loki, Splunk   |
| Traces  | リクエストの分散システム経路 | Jaeger, Zipkin, Tempo         |

---

## Four Golden Signals

SREが監視すべき4つの重要指標:

### 1. Latency（レイテンシ）

リクエスト処理にかかる時間。

```promql
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))
```

### 2. Traffic（トラフィック）

システムへの需要量。

```promql
rate(http_requests_total[5m])
```

### 3. Errors（エラー）

失敗したリクエストの割合。

```promql
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])
```

### 4. Saturation（飽和度）

リソースの使用率。

```promql
container_memory_usage_bytes / container_spec_memory_limit_bytes
```

---

## SLI/SLO/SLA

| 用語 | 説明                    | 例                        |
| ---- | ----------------------- | ------------------------- |
| SLI  | Service Level Indicator | レイテンシp99 = 200ms     |
| SLO  | Service Level Objective | p99 < 500ms を99.9%達成   |
| SLA  | Service Level Agreement | 99.9%未達の場合は返金対象 |

---

## メトリクスタイプ

| タイプ    | 説明               | ユースケース   |
| --------- | ------------------ | -------------- |
| Counter   | 単調増加の値       | リクエスト数   |
| Gauge     | 増減する現在値     | メモリ使用量   |
| Histogram | 値の分布           | レイテンシ分布 |
| Summary   | パーセンタイル計算 | レイテンシp99  |

---

## 関連リソース

- **実装パターン**: See [patterns.md](patterns.md)
