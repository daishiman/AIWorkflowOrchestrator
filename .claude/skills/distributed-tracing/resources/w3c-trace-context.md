# W3C Trace Context 実装ガイド

## W3C Trace Context 標準

### 概要

W3C Trace Contextは、分散システムにおけるトレースコンテキストの伝播を
標準化するための仕様です。

**策定**: W3C Distributed Tracing Working Group
**URL**: https://www.w3.org/TR/trace-context/

### 主要ヘッダー

#### traceparent

**フォーマット**:
```
traceparent: {version}-{trace-id}-{parent-id}-{trace-flags}
```

**例**:
```
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
```

**フィールド**:
- `version`: バージョン（現在は `00`）
- `trace-id`: トレース識別子（32文字Hex = 16バイト）
- `parent-id`: 親スパン識別子（16文字Hex = 8バイト）
- `trace-flags`: フラグ（01 = sampled, 00 = not sampled）

#### tracestate

**用途**: ベンダー固有情報の伝播

**フォーマット**:
```
tracestate: vendor1=value1,vendor2=value2
```

**例**:
```
tracestate: congo=t61rcWkgMzE,rojo=00f067aa0ba902b7
```

## 実装パターン

### パターン1: リクエスト受信

```typescript
import { v4 as uuidv4 } from 'uuid';

function parseTraceParent(traceparent: string) {
  if (!traceparent) return null;

  const parts = traceparent.split('-');
  if (parts.length !== 4) return null;

  const [version, traceId, parentId, flags] = parts;

  return {
    version,
    traceId,
    parentId,
    flags: parseInt(flags, 16)
  };
}

// Express middleware
app.use((req, res, next) => {
  const traceContext = parseTraceParent(req.headers['traceparent']);

  if (traceContext) {
    // 既存トレースを引き継ぐ
    req.traceId = traceContext.traceId;
    req.parentSpanId = traceContext.parentId;
    req.sampled = (traceContext.flags & 1) === 1;
  } else {
    // 新しいトレースを開始
    req.traceId = generateTraceId(); // 32文字Hex
    req.parentSpanId = null;
    req.sampled = shouldSample();
  }

  // 新しいスパンIDを生成
  req.spanId = generateSpanId(); // 16文字Hex

  next();
});

function generateTraceId(): string {
  // 16バイト = 32文字Hex
  return uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '').slice(0, 0);
  // または
  return crypto.randomBytes(16).toString('hex');
}

function generateSpanId(): string {
  // 8バイト = 16文字Hex
  return crypto.randomBytes(8).toString('hex');
}

function shouldSample(): boolean {
  return Math.random() < 0.01; // 1%サンプリング
}
```

### パターン2: リクエスト送信

```typescript
function generateTraceParent(traceId: string, spanId: string, sampled: boolean): string {
  const version = '00';
  const flags = sampled ? '01' : '00';
  return `${version}-${traceId}-${spanId}-${flags}`;
}

// ダウンストリームサービス呼び出し
async function callDownstreamService(url: string, data: any) {
  const traceparent = generateTraceParent(req.traceId, req.spanId, req.sampled);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'traceparent': traceparent,
      'tracestate': req.headers['tracestate'] || '' // 引き継ぐ
    },
    body: JSON.stringify(data)
  });

  return response.json();
}
```

### パターン3: OpenTelemetry統合

```typescript
import { trace, context, propagation } from '@opentelemetry/api';
import { W3CTraceContextPropagator } from '@opentelemetry/core';

// W3C Trace Context Propagatorを設定
propagation.setGlobalPropagator(new W3CTraceContextPropagator());

// リクエスト送信時に自動伝播
const response = await fetch(url, {
  headers: {
    // OpenTelemetryが自動的にtraceparentを追加
    ...propagation.inject(context.active(), {})
  }
});
```

## トレースコンテキスト伝播

### HTTP伝播

**送信側**:
```typescript
const headers = {
  'traceparent': generateTraceParent(traceId, spanId, sampled)
};

if (tracestate) {
  headers['tracestate'] = tracestate;
}

await fetch(url, { headers });
```

**受信側**:
```typescript
const traceparent = req.headers['traceparent'];
const tracestate = req.headers['tracestate'];

// パースして使用
const context = parseTraceParent(traceparent);
```

### メッセージキュー伝播

**送信側**:
```typescript
await queue.publish('order-processing', {
  body: orderData,
  headers: {
    'traceparent': generateTraceParent(traceId, spanId, sampled),
    'tracestate': tracestate
  }
});
```

**受信側**:
```typescript
queue.subscribe('order-processing', (message) => {
  const traceparent = message.headers['traceparent'];
  const context = parseTraceParent(traceparent);

  // 新しいスパンを作成（トレースを継続）
  startSpanWithContext(context, () => {
    processOrder(message.body);
  });
});
```

### gRPC伝播

**自動伝播**:
OpenTelemetry gRPC計装が自動的に処理

```typescript
import { GrpcInstrumentation } from '@opentelemetry/instrumentation-grpc';

const sdk = new NodeSDK({
  instrumentations: [new GrpcInstrumentation()]
});
```

## サンプリング伝播

### sampled フラグ

**値**:
- `01`: サンプリング対象（記録する）
- `00`: サンプリング対象外（記録しない）

**伝播ルール**:
親スパンがsampledの場合、すべての子スパンもsampled

**実装**:
```typescript
// 親スパンのsampledフラグを引き継ぐ
const sampled = (traceContext.flags & 1) === 1;

// 子スパンも同じsampledフラグ
const childTraceparent = generateTraceParent(traceId, childSpanId, sampled);
```

## ベストプラクティス

1. **W3C準拠**: traceparentヘッダーで標準伝播
2. **一貫性**: すべてのサービスで同じトレースID
3. **サンプリング一貫性**: 親がsampledなら子もsampled
4. **tracestate保持**: ベンダー固有情報を引き継ぐ

## アンチパターン

❌ **独自ヘッダー**: X-Trace-IDなど独自ヘッダー
✅ **W3C標準**: traceparentヘッダー

❌ **コンテキスト破棄**: 受信したtraceparentを無視
✅ **コンテキスト継続**: traceparentを引き継ぎ伝播

❌ **サンプリング不一致**: 親はsampled、子はnot sampled
✅ **一貫性**: 親のsampledフラグを引き継ぐ
