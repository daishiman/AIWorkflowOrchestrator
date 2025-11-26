# 三本柱統合パターン

## パターン1: 相関IDによる統合

### 設計原則

すべての三本柱（ログ・メトリクス・トレース）で同一の識別子を共有し、
異なる視点からの情報を結びつけることで、包括的な診断を可能にする。

### 統一ID体系

**Request ID**:
- スコープ: 単一HTTPリクエスト
- 生成タイミング: リクエスト受信時（APIゲートウェイ、ミドルウェア）
- フォーマット: UUID v4
- 使用箇所: ログ、メトリクスラベル、HTTPヘッダー、レスポンス

**Trace ID**:
- スコープ: 分散システム全体のリクエストフロー
- 生成タイミング: エントリーポイント（または外部から受信）
- フォーマット: W3C Trace Context標準（16バイトHex）
- 使用箇所: ログ、トレーシングシステム、HTTPヘッダー

### 実装ステップ

#### Step 1: リクエスト受信時のID生成

```typescript
app.use((req, res, next) => {
  // Request IDの生成または引き継ぎ
  req.request_id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.request_id);

  // Trace IDの引き継ぎまたは生成
  req.trace_id = req.headers['traceparent']
    ? parseTraceParent(req.headers['traceparent']).traceId
    : generateTraceId();

  next();
});
```

#### Step 2: ログへのID埋め込み

```typescript
logger.info('User action', {
  request_id: req.request_id,
  trace_id: req.trace_id,
  action: 'login',
  user_id: 'user_123'
});
```

#### Step 3: メトリクスラベルへのID追加

```typescript
// Prometheusの例（サンプリングして追加）
if (shouldSampleForMetrics()) {
  httpRequestDuration.labels({
    method: req.method,
    path: req.path,
    status: res.statusCode,
    request_id: req.request_id.slice(0, 8) // 短縮版
  }).observe(duration);
}
```

#### Step 4: トレースへのID設定

```typescript
import { trace } from '@opentelemetry/api';

const span = trace.getTracer('api-server').startSpan('handle_request', {
  attributes: {
    'http.request_id': req.request_id,
    'http.method': req.method,
    'http.url': req.url
  }
});
```

### ナビゲーション実装

#### メトリクス → ログ

**ダッシュボード設定**:
```
# Grafanaの例
Panel: Error Rate
  ↓
Drill-down Link: Logs
  ↓
Query: level="ERROR" AND timestamp between {timeRange}
```

**ログクエリ**:
```
# Elasticsearchの例
GET /logs/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "level": "ERROR" }},
        { "range": { "timestamp": { "gte": "2025-11-26T10:00:00Z", "lte": "2025-11-26T10:05:00Z" }}}
      ]
    }
  }
}
```

#### ログ → トレース

**ログからtrace_idを取得**:
```json
{
  "level": "ERROR",
  "message": "Payment processing failed",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736"
}
```

**トレーシングシステムで検索**:
```
# Jaegerの例
http://jaeger-ui.example.com/trace/4bf92f3577b34da6a3ce929d0e0e4736
```

#### トレース → メトリクス

**ボトルネックスパンを特定**:
```
Span: database-query (500ms)  ← 異常に遅い
```

**該当サービスのメトリクスを確認**:
```
# Prometheusクエリ
rate(database_query_duration_seconds_sum[5m])
database_connections_active
```

---

## パターン2: コンテキスト伝播

### 同期処理での伝播

**HTTPリクエスト**:
```typescript
// リクエスト送信
const response = await fetch('https://api.example.com/data', {
  headers: {
    'X-Request-ID': req.request_id,
    'traceparent': `00-${req.trace_id}-${generateSpanId()}-01`
  }
});
```

### 非同期処理での伝播

**AsyncLocalStorage（Node.js）**:
```typescript
import { AsyncLocalStorage } from 'async_hooks';

const asyncContext = new AsyncLocalStorage();

// コンテキスト設定
app.use((req, res, next) => {
  asyncContext.run({
    request_id: req.request_id,
    trace_id: req.trace_id,
    user_id: req.user?.id
  }, () => {
    next();
  });
});

// 任意の場所でコンテキスト取得
function logWithContext(message, context) {
  const asyncCtx = asyncContext.getStore();
  logger.info(message, {
    ...asyncCtx,  // request_id, trace_id, user_idが自動追加
    ...context
  });
}
```

### メッセージキューでの伝播

**メッセージヘッダーに含める**:
```typescript
// メッセージ送信
await queue.publish('order-processing', {
  headers: {
    request_id: req.request_id,
    trace_id: req.trace_id
  },
  body: orderData
});

// メッセージ受信
queue.subscribe('order-processing', (message) => {
  const { request_id, trace_id } = message.headers;

  // コンテキスト継続
  asyncContext.run({ request_id, trace_id }, () => {
    processOrder(message.body);
  });
});
```

---

## パターン3: 自動相関分析

### 異常検知時の自動情報収集

**アラート発火時のワークフロー**:
```
1. メトリクスアラート発火: error_rate > 5%
   ↓
2. 自動アクション: 該当時刻のERRORログを検索
   ↓
3. 自動アクション: ログからtrace_idを抽出
   ↓
4. 自動アクション: 該当トレースを取得
   ↓
5. ダッシュボード: すべての情報を統合表示
```

### 実装例（Grafana + Loki + Tempo）

**アラートルール**:
```yaml
alert: HighErrorRate
expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
annotations:
  summary: Error rate is {{ $value }}
  log_query: '{level="ERROR"} |~ "{{ $labels.request_id }}"'
  trace_query: '{{ $labels.trace_id }}'
```

**ダッシュボードパネル**:
```
Panel 1: Error Rate (メトリクス)
  ↓ クリック
Panel 2: Error Logs (ログ) - request_idでフィルタ
  ↓ trace_idクリック
Panel 3: Trace Details (トレース) - フルリクエストフロー表示
```

---

## パターン4: 探索的調査

### 仮説なしの問題発見

**従来のモニタリング**:
事前定義されたメトリクスとアラートのみ

**オブザーバビリティ**:
高カーディナリティデータにより、仮説なしに異常を発見

**例**:
```
# Loki クエリ（ログベース探索）
{service="api-server"} | json | user_id="user_12345" | line_format "{{.message}}"

# 発見: 特定ユーザーだけエラーが多い
# さらに探索
{service="api-server", user_id="user_12345"} | json | error_type != ""

# 発見: データベースタイムアウトが集中
# trace_idで詳細確認
```

### 高カーディナリティクエリ

**ログベース**:
```
# user_idごとのエラー率
{level="ERROR"} | json | count by user_id

# 特定セッションのすべてのイベント
{session_id="sess_abc123"} | json | line_format "{{.timestamp}} {{.message}}"
```

**メトリクスベース**:
```
# endpoint別のレイテンシP99
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))

# ユーザーIDサンプルによるエラー率
rate(http_requests_total{status=~"5..", user_id!=""}[5m])
```

---

## ベストプラクティス

### 統合設計
1. **統一相関ID**: すべての三本柱でrequest_id/trace_idを共有
2. **双方向ナビゲーション**: メトリクス ⇄ ログ ⇄ トレース
3. **自動相関**: 異常検知時に関連情報を自動収集
4. **一貫性**: タイムスタンプ、サービス名、環境を統一

### パフォーマンス最適化
1. **サンプリング**: 正常リクエストは1%、エラーは100%
2. **高カーディナリティ制御**: メトリクスラベルは適度に
3. **ログ集約**: 同一エラーの重複ログを集約
4. **トレース軽量化**: 不要なスパンは除外

### セキュリティとプライバシー
1. **PIIマスキング**: すべての三本柱でPIIを保護
2. **アクセス制御**: ログ・メトリクス・トレースのアクセス権限を制御
3. **保持期間**: GDPRコンプライアンスを考慮した保持期間設定

## アンチパターン

❌ **三本柱が独立**: 相関IDなしで各々が独立
✅ **統合設計**: request_id/trace_idで連携

❌ **メトリクスのみ**: ログとトレースがない
✅ **三本柱バランス**: 各々の強みを活用

❌ **過剰な高カーディナリティ**: メトリクスに数百万のラベル
✅ **適切な粒度**: メトリクスは集約、ログで詳細

## 参照

このスキルを使用するエージェント:
- `@sre-observer` - ロギング・監視設計者 (.claude/agents/sre-observer.md:979)
