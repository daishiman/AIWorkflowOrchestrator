# Logging & Observability パターン

> **相対パス**: `references/patterns.md`
> **読込条件**: 実装時

---

## 構造化ログ実装パターン

### Pino (推奨: 高性能)

```typescript
import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// コンテキスト付きログ
const childLogger = logger.child({
  service: "user-service",
  trace_id: request.headers["x-trace-id"],
});
```

### Winston

```typescript
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "app.log" }),
  ],
});
```

---

## メトリクス設計パターン

### RED Method (リクエスト指向)

| メトリクス | 説明             | Prometheus 例                   |
| ---------- | ---------------- | ------------------------------- |
| Rate       | 秒間リクエスト数 | `http_requests_total`           |
| Errors     | エラー率         | `http_requests_errors_total`    |
| Duration   | レスポンス時間   | `http_request_duration_seconds` |

### USE Method (リソース指向)

| メトリクス  | 説明               | 例                 |
| ----------- | ------------------ | ------------------ |
| Utilization | リソース使用率     | CPU使用率          |
| Saturation  | キュー長・待機時間 | ディスクIOキュー   |
| Errors      | エラー数           | ネットワークエラー |

---

## アラート戦略

### アラート疲労防止

| 原則            | 説明                 |
| --------------- | -------------------- |
| Actionable      | 対応アクションが明確 |
| Urgent          | 即座の対応が必要     |
| Not duplicative | 重複しない           |
| Rare            | 頻繁に発生しない     |

### SLO ベースアラート

```yaml
# Prometheus アラートルール例
groups:
  - name: slo-alerts
    rules:
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_errors_total[5m]))
          / sum(rate(http_requests_total[5m])) > 0.01
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: Error rate exceeds 1% SLO
```

---

## OpenTelemetry 統合

### 基本セットアップ

```typescript
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: "http://localhost:4318/v1/traces",
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

---

## ログ集約システム比較

| システム     | 強み                       | 弱み               |
| ------------ | -------------------------- | ------------------ |
| ELK Stack    | 全文検索、柔軟性           | 運用コスト         |
| Grafana Loki | Prometheus連携、コスト効率 | 全文検索制限       |
| CloudWatch   | AWS統合、マネージド        | ベンダーロックイン |
| Datadog      | 統合プラットフォーム       | コスト             |

---

## サンプリング戦略

| 方式           | 説明                       | ユースケース           |
| -------------- | -------------------------- | ---------------------- |
| Head-based     | リクエスト開始時に決定     | 予測可能なサンプリング |
| Tail-based     | リクエスト完了後に決定     | エラートレース優先     |
| Priority-based | 重要度に応じてサンプリング | SLO違反優先            |

---

## 関連リソース

- **基礎知識**: See [basics.md](basics.md)
