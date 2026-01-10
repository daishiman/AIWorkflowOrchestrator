# 実装パターン

## Prometheus メトリクス収集

### メトリクス命名規則

```
<namespace>_<subsystem>_<name>_<unit>
```

| 要素      | 例           | 説明                     |
| --------- | ------------ | ------------------------ |
| namespace | file_watcher | アプリケーション名       |
| subsystem | event        | コンポーネント名         |
| name      | latency      | 何を測定しているか       |
| unit      | seconds      | 単位（seconds, bytes等） |

### ファイル監視の標準メトリクス

```typescript
// Counter: 処理イベント総数
const eventsTotal = new Counter({
  name: "file_watcher_events_total",
  help: "Total number of file events processed",
  labelNames: ["event_type", "status"],
});

// Histogram: 処理遅延
const eventLatency = new Histogram({
  name: "file_watcher_event_latency_seconds",
  help: "Event processing latency in seconds",
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
});

// Gauge: キュー長
const queueLength = new Gauge({
  name: "file_watcher_queue_length",
  help: "Current number of events in queue",
});
```

### ラベル設計のベストプラクティス

| ルール                     | 理由                           |
| -------------------------- | ------------------------------ |
| カーディナリティを制限     | 高カーディナリティはメモリ爆発 |
| 意味のあるラベルのみ       | ノイズを避ける                 |
| ファイルパスは避ける       | 無限のカーディナリティ         |
| event_type, status等を使用 | 有限の値セット                 |

## Grafana ダッシュボード設計

### パネル構成（推奨）

| 行  | パネル1            | パネル2        | パネル3      |
| --- | ------------------ | -------------- | ------------ |
| 1   | イベント処理レート | エラー率       | キュー長     |
| 2   | レイテンシ分布     | レイテンシ推移 | SLO達成状況  |
| 3   | リソース使用率     | ログエラー件数 | アラート履歴 |

### PromQL例

```promql
# リクエストレート（1分間の平均）
rate(file_watcher_events_total[1m])

# エラー率
sum(rate(file_watcher_events_total{status="error"}[5m]))
  / sum(rate(file_watcher_events_total[5m]))

# p99レイテンシ
histogram_quantile(0.99,
  rate(file_watcher_event_latency_seconds_bucket[5m]))

# SLO達成率（過去7日間でp99 < 1sの割合）
avg_over_time(
  (histogram_quantile(0.99, rate(file_watcher_event_latency_seconds_bucket[5m])) < 1)[7d:1h]
)
```

## アラートルール設計

### 推奨アラート

```yaml
groups:
  - name: file-watcher
    rules:
      - alert: HighLatency
        expr: histogram_quantile(0.99, rate(file_watcher_event_latency_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High event processing latency"

      - alert: ErrorRateHigh
        expr: sum(rate(file_watcher_events_total{status="error"}[5m])) / sum(rate(file_watcher_events_total[5m])) > 0.001
        for: 5m
        labels:
          severity: critical

      - alert: QueueSaturation
        expr: file_watcher_queue_length > 1000
        for: 2m
        labels:
          severity: warning
```

## ログ統合（Loki）

### 構造化ログ形式

```typescript
const logger = {
  info: (message: string, context: Record<string, unknown>) => {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        message,
        ...context,
      }),
    );
  },
};

// 使用例
logger.info("File event processed", {
  file_path: "/data/input.csv",
  event_type: "modify",
  processing_time_ms: 45,
  trace_id: "abc123",
});
```

## トレース統合（OpenTelemetry）

### 基本設定

```typescript
import { trace } from "@opentelemetry/api";

const tracer = trace.getTracer("file-watcher");

async function processFileEvent(event: FileEvent) {
  const span = tracer.startSpan("process-file-event");
  span.setAttribute("file.path", event.path);
  span.setAttribute("event.type", event.type);

  try {
    await handleEvent(event);
    span.setStatus({ code: SpanStatusCode.OK });
  } catch (error) {
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
    throw error;
  } finally {
    span.end();
  }
}
```
