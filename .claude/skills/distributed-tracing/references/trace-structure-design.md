# トレース構造設計

## トレースの階層構造

### 基本的な親子関係

```
Root Span (API Gateway)
├─ Child Span 1 (Authentication Service)
├─ Child Span 2 (Order Service)
│  ├─ Child Span 2.1 (Database Query)
│  └─ Child Span 2.2 (Payment API)
└─ Child Span 3 (Notification Service)
```

**親子関係の表現**:

- Parent Span ID: 親スパンの識別子
- Root Span: Parent Span ID = null

### スパンの時系列

```
Time →
|---------- Root Span (100ms) ----------|
  |-- Child 1 (10ms) --|
                        |-- Child 2 (70ms) --|
                          |-- 2.1 (30ms) --|
                                            |-- 2.2 (40ms) --|
                                                              |-- Child 3 (20ms) --|
```

**重要な観察**:

- Child 2.1 と Child 2.2 は連続（直列）
- 合計時間: 10ms + 70ms + 20ms = 100ms
- ボトルネック: Child 2 (70ms)

## スパン属性設計

### 標準属性（OpenTelemetry Semantic Conventions）

#### HTTP スパン

```typescript
span.setAttributes({
  // HTTP標準属性
  "http.method": "POST",
  "http.url": "https://api.example.com/orders",
  "http.status_code": 200,
  "http.request_content_length": 1234,
  "http.response_content_length": 5678,

  // ネットワーク属性
  "net.peer.name": "api.example.com",
  "net.peer.port": 443,
  "net.transport": "ip_tcp",
});
```

#### データベーススパン

```typescript
span.setAttributes({
  // データベース標準属性
  "db.system": "sqlite",
  "db.name": "orders_db",
  "db.statement": "SELECT * FROM orders WHERE id = ?",
  "db.operation": "SELECT",
  "db.sql.table": "orders",

  // 接続情報
  "db.connection_string": "libsql://localhost:8080",
  "db.user": "app_user",
});
```

#### メッセージングスパン

```typescript
span.setAttributes({
  // メッセージング標準属性
  "messaging.system": "rabbitmq",
  "messaging.destination": "order-processing",
  "messaging.destination_kind": "queue",
  "messaging.operation": "publish",
  "messaging.message_id": "msg_12345",
});
```

### カスタム属性

**ビジネス情報**:

```typescript
span.setAttributes({
  // ビジネス属性
  "user.id": "user_12345",
  "order.id": "ord_abc123",
  "order.total_amount": 1234.56,
  "order.items_count": 3,
  "payment.method": "credit_card",
});
```

**診断情報**:

```typescript
span.setAttributes({
  // 診断属性
  "cache.hit": true,
  "retry.count": 2,
  "circuit_breaker.state": "closed",
  "feature_flag.enabled": true,
});
```

## スパン設計パターン

### パターン1: サービス境界スパン

**目的**: サービス間の呼び出しを追跡

**実装**:

```typescript
// サービスA → サービスB の呼び出し
async function callServiceB() {
  const tracer = trace.getTracer("service-a");

  return tracer.startActiveSpan("call_service_b", async (span) => {
    span.setAttributes({
      "rpc.service": "service-b",
      "rpc.method": "getUser",
      "peer.service": "service-b",
    });

    const response = await fetch("http://service-b/api/user", {
      headers: {
        traceparent: generateTraceParent(span.spanContext()),
      },
    });

    span.setAttributes({
      "http.status_code": response.status,
    });

    span.end();
    return response.json();
  });
}
```

### パターン2: データベーススパン

**目的**: データベースクエリを追跡

**実装**:

```typescript
async function fetchUser(userId: string) {
  const tracer = trace.getTracer("user-service");

  return tracer.startActiveSpan("db_query_user", async (span) => {
    span.setAttributes({
      "db.system": "sqlite",
      "db.operation": "SELECT",
      "db.sql.table": "users",
      "db.statement": "SELECT * FROM users WHERE id = ?",
      "user.id": userId,
    });

    try {
      const result = await database.query("SELECT * FROM users WHERE id = ?", [
        userId,
      ]);
      span.setStatus({ code: SpanStatusCode.OK });
      return result.rows[0];
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
}
```

### パターン3: 非同期処理スパン

**目的**: 非同期ジョブやメッセージキューを追跡

**実装**:

```typescript
// メッセージ送信
async function publishMessage(queueName: string, message: any) {
  const tracer = trace.getTracer("api-service");

  return tracer.startActiveSpan("publish_message", async (span) => {
    span.setAttributes({
      "messaging.system": "rabbitmq",
      "messaging.destination": queueName,
      "messaging.operation": "publish",
    });

    // トレースコンテキストをメッセージに含める
    const traceContext = span.spanContext();
    await queue.publish(queueName, {
      ...message,
      _trace_context: {
        trace_id: traceContext.traceId,
        span_id: traceContext.spanId,
      },
    });

    span.end();
  });
}

// メッセージ受信
async function consumeMessage(message: any) {
  const tracer = trace.getTracer("worker-service");

  // トレースコンテキストを復元
  const traceContext = message._trace_context;

  // 新しいスパンを作成（親スパンを引き継ぐ）
  return tracer.startActiveSpan(
    "consume_message",
    {
      links: [
        {
          context: {
            traceId: traceContext.trace_id,
            spanId: traceContext.span_id,
          },
        },
      ],
    },
    async (span) => {
      await processMessage(message);
      span.end();
    },
  );
}
```

## トレース可視化

### Jaeger UI

**機能**:

- トレース検索（トレースID、サービス名、タグ等）
- トレース詳細表示（Gantt Chart形式）
- サービス依存関係グラフ
- レイテンシ分布

**画面構成**:

```
[Search] トレースID、サービス、操作名で検索
   ↓
[Trace List] 検索結果のトレース一覧
   ↓
[Trace Detail] Gantt Chart形式でスパン表示
   - Timeline: 時系列でスパンを可視化
   - Spans: スパン一覧（階層表示）
   - Attributes: スパン属性詳細
```

### サービスマップ

**依存関係グラフ**:

```
API Gateway
  ↓
Order Service → Payment API (外部)
  ↓           ↓
Database    Notification Service
              ↓
            Email API (外部)
```

**用途**:

- サービス間の呼び出し関係を可視化
- ボトルネックサービスを特定
- 外部依存の影響を評価

## ボトルネック特定

### クリティカルパス分析

**定義**: トレース全体の処理時間に最も影響するスパンの連鎖

**例**:

```
Trace Duration: 500ms

Critical Path:
API Gateway (10ms)
→ Order Service (40ms)
  → Database Query (400ms) ← ボトルネック
→ Response (50ms)

非Critical Path:
→ Notification Service (20ms) ← 並列実行、全体に影響小
```

### レイテンシ分析

**スパン別レイテンシ**:

```
Span 1: API Gateway        10ms  (2%)
Span 2: Order Service      40ms  (8%)
Span 3: Database Query    400ms (80%) ← ボトルネック
Span 4: Payment API        30ms  (6%)
Span 5: Notification       20ms  (4%)
```

**改善優先度**:

1. Database Query (80%削減で大幅改善)
2. Order Service (8%削減)
3. その他 (影響小)

## ベストプラクティス

1. **ビジネスロジック単位**: 意味のある処理単位でスパン作成
2. **属性の充実**: 診断に有用な情報をスパン属性に含める
3. **エラー記録**: 例外をスパンに記録
4. **サンプリング**: エラーは100%、正常は1-10%
5. **W3C準拠**: traceparentヘッダーで標準伝播

## アンチパターン

❌ **スパンなし**: トレーシングを使わない
✅ **適切なスパン**: ビジネスロジック単位で作成

❌ **粗すぎるスパン**: 1つのスパンで全処理
✅ **適切な粒度**: ボトルネック特定可能な粒度

❌ **属性不足**: スパンIDとタイムスタンプのみ
✅ **属性充実**: user_id、order_id等を含める

## 参照

このスキルを使用するエージェント:

- `.claude/agents/sre-observer.md` - ロギング・監視設計者 (.claude/agents/sre-observer.md:982)
