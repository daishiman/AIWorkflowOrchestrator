/**
 * 分散トレーシング設定テンプレート
 *
 * このテンプレートは、OpenTelemetryを使用した分散トレーシングの
 * 基本設定とヘルパー関数を提供します。
 */

import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { trace, context, SpanStatusCode } from "@opentelemetry/api";
import crypto from "crypto";

// ============================================================
// Configuration
// ============================================================

const TRACING_CONFIG = {
  serviceName: process.env.SERVICE_NAME || "api-server",
  serviceVersion: process.env.SERVICE_VERSION || "1.0.0",
  environment: process.env.NODE_ENV || "development",
  jaegerUrl: process.env.JAEGER_URL || "http://localhost:14268/api/traces",
  samplingRate: parseFloat(process.env.TRACING_SAMPLING_RATE || "0.01"),
};

// ============================================================
// Trace ID / Span ID Generation
// ============================================================

export function generateTraceId(): string {
  // 16バイト = 32文字Hex
  return crypto.randomBytes(16).toString("hex");
}

export function generateSpanId(): string {
  // 8バイト = 16文字Hex
  return crypto.randomBytes(8).toString("hex");
}

// ============================================================
// W3C Trace Context Helpers
// ============================================================

export interface TraceContext {
  version: string;
  traceId: string;
  parentId: string;
  flags: number;
  sampled: boolean;
}

export function parseTraceParent(traceparent: string): TraceContext | null {
  if (!traceparent) return null;

  const parts = traceparent.split("-");
  if (parts.length !== 4) return null;

  const [version, traceId, parentId, flags] = parts;
  const flagsNum = parseInt(flags, 16);

  return {
    version,
    traceId,
    parentId,
    flags: flagsNum,
    sampled: (flagsNum & 1) === 1,
  };
}

export function generateTraceParent(
  traceId: string,
  spanId: string,
  sampled: boolean,
): string {
  const version = "00";
  const flags = sampled ? "01" : "00";
  return `${version}-${traceId}-${spanId}-${flags}`;
}

// ============================================================
// OpenTelemetry SDK Setup
// ============================================================

const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: TRACING_CONFIG.serviceName,
  [SemanticResourceAttributes.SERVICE_VERSION]: TRACING_CONFIG.serviceVersion,
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]:
    TRACING_CONFIG.environment,
});

const traceExporter = new OTLPTraceExporter({
  url: `${TRACING_CONFIG.jaegerUrl}/v1/traces`,
});

const sdk = new NodeSDK({
  resource,
  spanProcessor: new BatchSpanProcessor(traceExporter),
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-http": { enabled: true },
      "@opentelemetry/instrumentation-express": { enabled: true },
      "@opentelemetry/instrumentation-sqlite3": { enabled: true },
    }),
  ],
});

export async function startTracing(): Promise<void> {
  await sdk.start();
  console.log("✅ Distributed tracing initialized");
}

export async function shutdownTracing(): Promise<void> {
  await sdk.shutdown();
  console.log("✅ Distributed tracing shutdown");
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * 手動スパンを作成して処理を実行
 */
export async function withSpan<T>(
  name: string,
  fn: (span: any) => Promise<T>,
  attributes?: Record<string, string | number | boolean>,
): Promise<T> {
  const tracer = trace.getTracer(TRACING_CONFIG.serviceName);

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
  if (!span) return null;

  const spanContext = span.spanContext();
  return {
    trace_id: spanContext.traceId,
    span_id: spanContext.spanId,
    sampled: (spanContext.traceFlags & 1) === 1,
  };
}

/**
 * ダウンストリームサービス呼び出し時のヘッダー生成
 */
export function getTracingHeaders(): Record<string, string> {
  const span = trace.getActiveSpan();
  if (!span) return {};

  const spanContext = span.spanContext();
  return {
    traceparent: generateTraceParent(
      spanContext.traceId,
      spanContext.spanId,
      (spanContext.traceFlags & 1) === 1,
    ),
  };
}

// ============================================================
// Usage Examples
// ============================================================

/*
// main.ts
import { startTracing } from './tracing-config';

async function bootstrap() {
  await startTracing();
  // ... アプリケーション起動 ...
}

// ビジネスロジック
import { withSpan, getTraceContext, getTracingHeaders } from './tracing-config';

// 例1: 手動スパンでビジネスロジックを計測
async function processOrder(orderId: string) {
  return withSpan('process_order', async (span) => {
    span.setAttributes({
      'order.id': orderId
    });

    const order = await fetchOrder(orderId);
    await validateOrder(order);
    await chargePayment(order);

    return order;
  }, {
    'business.operation': 'order_processing'
  });
}

// 例2: ダウンストリームサービス呼び出し
async function callPaymentService(paymentData: any) {
  return withSpan('call_payment_service', async (span) => {
    const response = await fetch('https://payment-service/api/charge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getTracingHeaders() // traceparentを自動追加
      },
      body: JSON.stringify(paymentData)
    });

    span.setAttributes({
      'http.status_code': response.status
    });

    return response.json();
  });
}

// 例3: ログにトレースコンテキストを含める
import { logger } from './logger';

function logWithTrace(message: string, context: any) {
  const traceContext = getTraceContext();

  logger.info(message, {
    ...traceContext,
    ...context
  });
}
*/
