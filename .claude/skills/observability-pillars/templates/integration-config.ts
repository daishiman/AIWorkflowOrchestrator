/**
 * オブザーバビリティ三本柱統合設定テンプレート
 *
 * このテンプレートは、ログ・メトリクス・トレースを統合的に設定するための
 * OpenTelemetry統合コンフィグを提供します。
 */

import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { TraceIdRatioBasedSampler } from "@opentelemetry/sdk-trace-node";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";

// ============================================================
// Configuration
// ============================================================

const CONFIG = {
  service: {
    name: process.env.SERVICE_NAME || "api-server",
    version: process.env.SERVICE_VERSION || "1.0.0",
    environment: process.env.NODE_ENV || "development",
  },
  otel: {
    collectorUrl: process.env.OTEL_COLLECTOR_URL || "http://localhost:4318",
    samplingRate: parseFloat(process.env.OTEL_SAMPLING_RATE || "0.01"), // 1%
    exportInterval: parseInt(process.env.OTEL_EXPORT_INTERVAL || "60000", 10), // 1分
  },
  logging: {
    level: process.env.LOG_LEVEL || "INFO",
    enableConsole: process.env.LOG_CONSOLE === "true",
  },
};

// ============================================================
// OpenTelemetry SDK Setup
// ============================================================

// デバッグログ有効化（開発環境のみ）
if (CONFIG.service.environment === "development") {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
}

// リソース属性の定義
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: CONFIG.service.name,
  [SemanticResourceAttributes.SERVICE_VERSION]: CONFIG.service.version,
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]:
    CONFIG.service.environment,
});

// トレースエクスポーター
const traceExporter = new OTLPTraceExporter({
  url: `${CONFIG.otel.collectorUrl}/v1/traces`,
  headers: {
    // 必要に応じて認証ヘッダーを追加
    // 'Authorization': `Bearer ${process.env.OTEL_AUTH_TOKEN}`
  },
});

// メトリクスエクスポーター
const metricExporter = new OTLPMetricExporter({
  url: `${CONFIG.otel.collectorUrl}/v1/metrics`,
  headers: {},
});

// メトリクスリーダー
const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: CONFIG.otel.exportInterval,
});

// サンプラー設定
const sampler = new TraceIdRatioBasedSampler(CONFIG.otel.samplingRate);

// SDK初期化
const sdk = new NodeSDK({
  resource,
  traceExporter,
  metricReader,
  sampler,
  instrumentations: [
    getNodeAutoInstrumentations({
      // HTTP計装
      "@opentelemetry/instrumentation-http": {
        enabled: true,
        requestHook: (span, request) => {
          // リクエスト情報をスパンに追加
          span.setAttributes({
            "http.request_id": request.headers["x-request-id"],
            "http.user_agent": request.headers["user-agent"],
          });
        },
        responseHook: (span, response) => {
          // レスポンス情報をスパンに追加
          span.setAttributes({
            "http.status_code": response.statusCode,
          });
        },
      },

      // Express計装
      "@opentelemetry/instrumentation-express": {
        enabled: true,
      },

      // データベース計装（SQLite/Turso）
      "@opentelemetry/instrumentation-sqlite3": {
        enabled: true,
        enhancedDatabaseReporting: true, // SQL文を記録
      },

      // Redis計装
      "@opentelemetry/instrumentation-redis": {
        enabled: true,
      },
    }),
  ],
});

// ============================================================
// SDK起動と終了処理
// ============================================================

export async function startTelemetry(): Promise<void> {
  try {
    await sdk.start();
    console.log("✅ OpenTelemetry initialized");
  } catch (error) {
    console.error("❌ Failed to initialize OpenTelemetry:", error);
    throw error;
  }
}

export async function shutdownTelemetry(): Promise<void> {
  try {
    await sdk.shutdown();
    console.log("✅ OpenTelemetry shutdown complete");
  } catch (error) {
    console.error("❌ Failed to shutdown OpenTelemetry:", error);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  await shutdownTelemetry();
  process.exit(0);
});

// ============================================================
// Helper Functions
// ============================================================

import { trace, context, SpanStatusCode } from "@opentelemetry/api";

/**
 * 手動スパンを作成して処理を実行
 */
export async function withSpan<T>(
  name: string,
  fn: (span: any) => Promise<T>,
  attributes?: Record<string, string | number>,
): Promise<T> {
  const tracer = trace.getTracer(CONFIG.service.name);

  return tracer.startActiveSpan(name, async (span) => {
    try {
      if (attributes) {
        span.setAttributes(attributes);
      }

      const result = await fn(span);

      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * 現在のトレースコンテキストを取得
 */
export function getTraceContext() {
  const span = trace.getActiveSpan();
  if (!span) return {};

  const spanContext = span.spanContext();
  return {
    trace_id: spanContext.traceId,
    span_id: spanContext.spanId,
  };
}

// ============================================================
// Usage Example
// ============================================================

/*
// main.ts
import { startTelemetry } from './telemetry-config';

async function bootstrap() {
  await startTelemetry();

  const app = express();
  // ... アプリケーション設定 ...

  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
}

bootstrap();

// ビジネスロジックでの使用
import { withSpan, getTraceContext } from './telemetry-config';

async function processOrder(orderId: string) {
  return withSpan('process_order', async (span) => {
    span.setAttributes({
      'order.id': orderId
    });

    const order = await fetchOrder(orderId);
    await validateOrder(order);
    await chargePayment(order);

    // ログにトレースコンテキストを含める
    logger.info('Order processed', {
      ...getTraceContext(),
      order_id: orderId
    });

    return order;
  });
}
*/
