# Observability 実装パターン

> **相対パス**: `references/patterns.md`
> **原典**: Google SRE Book, OpenTelemetry Documentation

---

## メトリクス命名規則

### Prometheus命名規則

```
<namespace>_<name>_<unit>_<suffix>
```

| 要素      | 説明                      | 例                          |
| --------- | ------------------------- | --------------------------- |
| namespace | アプリケーション/チーム名 | `myapp`                     |
| name      | メトリクスの意味          | `http_requests`             |
| unit      | 単位                      | `seconds`, `bytes`, `total` |
| suffix    | タイプ示唆                | `_total`, `_bucket`         |

**例**:

```
myapp_http_request_duration_seconds_bucket
myapp_http_requests_total
myapp_memory_usage_bytes
```

---

## ラベル設計

### すべきこと

```yaml
http_requests_total{
method="GET",
path="/api/users",
status="200",
service="user-api"
}
```

### 避けるべきこと（カーディナリティ爆発）

```yaml
# NG: ユーザーIDなど無制限の値
http_requests_total{user_id="12345"}

# NG: タイムスタンプ
http_requests_total{timestamp="2024-01-01T12:00:00"}
```

---

## 分散トレーシング

### 基本構造

```
Trace
├── Span A (root)
│   ├── Span B
│   │   └── Span D
│   └── Span C
```

### サンプリング戦略

| 戦略          | 説明         | ユースケース            |
| ------------- | ------------ | ----------------------- |
| Head-based    | 開始時に決定 | 低オーバーヘッド        |
| Tail-based    | 完了後に決定 | エラー/遅延トレース保持 |
| Probabilistic | 確率的に決定 | 一般的な使用            |

### OpenTelemetry設定例

```typescript
import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: "http://collector:4318/v1/traces",
  }),
  serviceName: "my-service",
});

sdk.start();
```

---

## 構造化ログ

### JSON形式

```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "level": "info",
  "message": "Request processed",
  "trace_id": "abc123",
  "span_id": "def456",
  "user_id": "user-789",
  "duration_ms": 150,
  "status_code": 200
}
```

### Correlation ID

ログ、メトリクス、トレースを関連付けるIDを使用。

```typescript
const logger = {
  info: (message: string, context: Record<string, unknown>) => {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "info",
        message,
        trace_id: getCurrentTraceId(),
        ...context,
      }),
    );
  },
};
```

---

## ダッシュボード設計

### RED Method（サービス）

| 指標     | 説明          |
| -------- | ------------- |
| Rate     | リクエスト/秒 |
| Errors   | エラー率      |
| Duration | レイテンシ    |

### USE Method（リソース）

| 指標        | 説明     |
| ----------- | -------- |
| Utilization | 使用率   |
| Saturation  | 飽和度   |
| Errors      | エラー数 |

---

## 関連リソース

- **基礎知識**: See [basics.md](basics.md)
