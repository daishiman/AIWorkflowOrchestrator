# OpenTelemetry導入ガイド

## OpenTelemetryとは

OpenTelemetry (OTel) は、ログ・メトリクス・トレースを統一的に扱うための
ベンダー中立的なオープンソース標準です。

### 主要コンポーネント

1. **API**: テレメトリデータの生成インターフェース
2. **SDK**: API実装とエクスポート機能
3. **Exporter**: バックエンド（Jaeger、Prometheus等）へのデータ送信
4. **Collector**: テレメトリデータの収集・処理・転送

## セットアップ

### Node.js / TypeScript

#### インストール

```bash
# コアSDK
pnpm add @opentelemetry/sdk-node

# 自動計装
pnpm add @opentelemetry/auto-instrumentations-node

# エクスポーター（例: Jaeger）
pnpm add @opentelemetry/exporter-trace-otlp-http
pnpm add @opentelemetry/exporter-metrics-otlp-http
```

#### 基本設定

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';

const sdk = new NodeSDK({
  serviceName: 'api-server',
  traceExporter: new OTLPTraceExporter({
    url: 'http://otel-collector:4318/v1/traces'
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: 'http://otel-collector:4318/v1/metrics'
    }),
    exportIntervalMillis: 60000 // 1分ごと
  }),
  instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start();
```

## 自動計装

### 対象ライブラリ

自動計装が利用可能な主要ライブラリ:
- HTTP/HTTPS
- Express, Fastify, Koa
- Database (PostgreSQL, MySQL, MongoDB)
- Redis
- AWS SDK
- gRPC

### 有効化方法

```typescript
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': { enabled: true },
      '@opentelemetry/instrumentation-express': { enabled: true },
      '@opentelemetry/instrumentation-pg': { enabled: true },
      '@opentelemetry/instrumentation-redis': { enabled: true }
    })
  ]
});
```

## 手動計装

### スパンの作成

```typescript
import { trace } from '@opentelemetry/api';

async function processOrder(orderId: string) {
  const tracer = trace.getTracer('order-service');
  const span = tracer.startSpan('process_order');

  try {
    // スパン属性の設定
    span.setAttributes({
      'order.id': orderId,
      'order.status': 'processing'
    });

    // ビジネスロジック
    const order = await fetchOrder(orderId);
    await validateOrder(order);
    await chargePayment(order);

    span.setStatus({ code: SpanStatusCode.OK });
    return order;
  } catch (error) {
    // エラー記録
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message
    });
    span.recordException(error);
    throw error;
  } finally {
    span.end();
  }
}
```

### ネストしたスパン

```typescript
async function processOrder(orderId: string) {
  const tracer = trace.getTracer('order-service');

  return tracer.startActiveSpan('process_order', async (parentSpan) => {
    // 子スパン1: 注文取得
    await tracer.startActiveSpan('fetch_order', async (span) => {
      const order = await database.query('SELECT * FROM orders WHERE id = $1', [orderId]);
      span.setAttributes({ 'order.total': order.total });
      span.end();
      return order;
    });

    // 子スパン2: 決済処理
    await tracer.startActiveSpan('charge_payment', async (span) => {
      await paymentGateway.charge(order);
      span.end();
    });

    parentSpan.end();
  });
}
```

## ログ統合

### ログにトレースコンテキストを含める

```typescript
import { trace, context } from '@opentelemetry/api';

function getTraceContext() {
  const span = trace.getActiveSpan();
  if (!span) return {};

  const spanContext = span.spanContext();
  return {
    trace_id: spanContext.traceId,
    span_id: spanContext.spanId,
    trace_flags: spanContext.traceFlags
  };
}

// ロガーに統合
logger.info('Order processed', {
  ...getTraceContext(),
  order_id: 'ord_123'
});
```

### W3C Trace Context

**トレースコンテキストヘッダー**:
```
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
             |   |                                |                |
             version  trace-id (32 hex)         span-id (16 hex)  flags
```

## サンプリング戦略

### ヘッドベースサンプリング

**リクエスト受信時に決定**:
```typescript
const sdk = new NodeSDK({
  sampler: new TraceIdRatioBasedSampler(0.01) // 1%サンプリング
});
```

### テールベースサンプリング

**リクエスト完了後に決定**:
```
完了後の条件:
- エラーが発生 → 100%記録
- レイテンシ > 1秒 → 100%記録
- 正常 AND 高速 → 1%サンプリング
```

**実装**（OTel Collectorで設定）:
```yaml
processors:
  tail_sampling:
    policies:
      - name: errors
        type: status_code
        status_code: {status_codes: [ERROR]}
      - name: slow_requests
        type: latency
        latency: {threshold_ms: 1000}
      - name: random_sampling
        type: probabilistic
        probabilistic: {sampling_percentage: 1}
```

## メトリクス収集

### カウンター（Counter）

**用途**: 増加のみの累積値（リクエスト数、エラー数等）

```typescript
import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('api-server');
const requestCounter = meter.createCounter('http_requests_total', {
  description: 'Total HTTP requests'
});

// リクエストごとにインクリメント
requestCounter.add(1, {
  method: req.method,
  path: req.path,
  status: res.statusCode
});
```

### ゲージ（Gauge）

**用途**: 増減する現在値（メモリ使用量、アクティブ接続数等）

```typescript
const activeConnections = meter.createObservableGauge('active_connections', {
  description: 'Current number of active connections'
});

activeConnections.addCallback((observableResult) => {
  const count = server.getActiveConnections();
  observableResult.observe(count);
});
```

### ヒストグラム（Histogram）

**用途**: 値の分布（レイテンシ、リクエストサイズ等）

```typescript
const requestDuration = meter.createHistogram('http_request_duration_seconds', {
  description: 'HTTP request duration',
  unit: 'seconds'
});

// リクエストごとに記録
const startTime = Date.now();
// ... リクエスト処理 ...
const duration = (Date.now() - startTime) / 1000;
requestDuration.record(duration, {
  method: req.method,
  path: req.path,
  status: res.statusCode
});
```

## ベストプラクティス

1. **自動計装優先**: 手動計装は重要箇所のみ
2. **属性の充実**: スパンとログに診断に有用な情報を含める
3. **サンプリング戦略**: コストと診断能力をバランス
4. **相関ID一貫性**: request_id/trace_idを三本柱で共有
5. **コンテキスト伝播**: 非同期処理でもコンテキストを維持

## 参照

- OpenTelemetry公式ドキュメント: https://opentelemetry.io/docs/
- W3C Trace Context: https://www.w3.org/TR/trace-context/
