# Task: 相関ID実装

> **相対パス**: `agents/implement-correlation.md`
> **バージョン**: 1.0.0

---

## 目的

設計に基づき、三本柱を統合する相関IDシステムを実装する。

## 入力

- 統合設計書（`design-integration`の出力）
- 対象コードベース
- `assets/integration-config.ts`テンプレート

## 出力

- 相関IDミドルウェア
- 統合されたログ・メトリクス・トレース
- ナビゲーションリンク設定

## 手順

### Step 1: 依存関係インストール

```bash
# OpenTelemetry
pnpm add @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node
pnpm add @opentelemetry/exporter-trace-otlp-http

# ロギング（構造化ログ）
pnpm add pino

# メトリクス
pnpm add prom-client
```

### Step 2: ミドルウェア実装

```typescript
// src/middleware/correlation.ts
import { AsyncLocalStorage } from "async_hooks";
import { v4 as uuidv4 } from "uuid";
import { trace, context, SpanContext } from "@opentelemetry/api";

interface RequestContext {
  request_id: string;
  trace_id: string;
  span_id: string;
  user_id?: string;
}

export const asyncContext = new AsyncLocalStorage<RequestContext>();

export function correlationMiddleware(req, res, next) {
  // Request ID生成または引き継ぎ
  const request_id = req.headers["x-request-id"] || uuidv4();
  res.setHeader("X-Request-ID", request_id);

  // Trace Context取得
  const spanContext = trace.getSpan(context.active())?.spanContext();
  const trace_id = spanContext?.traceId || generateTraceId();
  const span_id = spanContext?.spanId || generateSpanId();

  // コンテキスト設定
  asyncContext.run(
    {
      request_id,
      trace_id,
      span_id,
      user_id: req.user?.id,
    },
    () => next(),
  );
}
```

### Step 3: ロガー統合

```typescript
// src/lib/logger.ts
import pino from "pino";
import { asyncContext } from "../middleware/correlation";

export const logger = pino({
  mixin() {
    const ctx = asyncContext.getStore();
    return ctx
      ? {
          request_id: ctx.request_id,
          trace_id: ctx.trace_id,
          span_id: ctx.span_id,
          user_id: ctx.user_id,
        }
      : {};
  },
});
```

### Step 4: メトリクス統合

```typescript
// src/lib/metrics.ts
import { Counter, Histogram, Registry } from "prom-client";

export const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "path", "status"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
});

// 高カーディナリティラベルはサンプリング
export function recordRequestWithSampling(req, res, duration) {
  const labels = {
    method: req.method,
    path: normalizePath(req.path), // パス正規化
    status: res.statusCode.toString(),
  };
  httpRequestDuration.observe(labels, duration);
}
```

### Step 5: トレース設定

```typescript
// src/instrumentation.ts
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  }),
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: process.env.SERVICE_NAME,
});

sdk.start();
```

### Step 6: Grafanaダッシュボード設定

```json
{
  "panels": [
    {
      "title": "Error Rate",
      "type": "timeseries",
      "targets": [
        {
          "expr": "rate(http_requests_total{status=~\"5..\"}[5m])"
        }
      ],
      "links": [
        {
          "title": "View Logs",
          "url": "/explore?left=[\"now-1h\",\"now\",\"Loki\",{\"expr\":\"{level=\\\"error\\\"}\"}]"
        }
      ]
    }
  ]
}
```

## テスト

```bash
# 相関IDの一貫性テスト
curl -H "X-Request-ID: test-123" http://localhost:3000/api/test

# レスポンスヘッダーにX-Request-IDが含まれることを確認
# ログにrequest_id, trace_idが含まれることを確認
```

## 完了条件

- [ ] ミドルウェアでrequest_id/trace_idを生成・伝播
- [ ] ログにコンテキスト情報が自動付与
- [ ] メトリクスラベルが適切に設定
- [ ] トレーススパンにrequest_idが含まれる
- [ ] ダッシュボードでドリルダウンリンクが機能
