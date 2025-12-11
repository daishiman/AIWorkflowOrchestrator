# スパン設計ガイド

## スパンの粒度

### 適切な粒度の判断基準

**スパンを作成すべき箇所**:

- [ ] ビジネスロジックの意味のある単位か？
- [ ] ボトルネック特定に有用か？
- [ ] パフォーマンス測定が必要か？
- [ ] サービス境界を越えるか？
- [ ] 外部システム（DB、API等）を呼び出すか？

**スパンを作成すべきでない箇所**:

- [ ] 単純な変数代入や計算
- [ ] ユーティリティ関数（1行程度）
- [ ] ループの各イテレーション
- [ ] ゲッター/セッター

### 粒度の例

**粗すぎる**:

```typescript
// ❌ 悪い例: 1つのスパンで全処理
async function processOrder(orderId) {
  const span = startSpan("process_order");

  const order = await fetchOrder(orderId);
  await validateOrder(order);
  await chargePayment(order);
  await sendNotification(order);

  span.end();
}
// → ボトルネックがどこか分からない
```

**適切**:

```typescript
// ✅ 良い例: 意味のある単位でスパン分割
async function processOrder(orderId) {
  return withSpan("process_order", async () => {
    const order = await withSpan("fetch_order", () => fetchOrder(orderId));
    await withSpan("validate_order", () => validateOrder(order));
    await withSpan("charge_payment", () => chargePayment(order));
    await withSpan("send_notification", () => sendNotification(order));
    return order;
  });
}
// → 各処理の時間が明確
```

**細かすぎる**:

```typescript
// ❌ 悪い例: 過剰なスパン
async function calculateTotal(items) {
  return withSpan("calculate_total", async () => {
    let total = 0;
    for (const item of items) {
      // 各イテレーションでスパン作成（過剰）
      total += await withSpan(
        `add_item_${item.id}`,
        () => item.price * item.quantity,
      );
    }
    return total;
  });
}
// → オーバーヘッド大、ノイズ
```

## スパン命名規則

### 命名パターン

**動詞\_目的語形式**:

```
✅ fetch_user
✅ validate_payment
✅ send_email
✅ query_database
```

**HTTP操作**:

```
✅ GET /api/users
✅ POST /api/orders
✅ PUT /api/products/{id}
```

**データベース操作**:

```
✅ SELECT users
✅ INSERT INTO orders
✅ UPDATE products
```

### 一貫性

**同じ操作には同じ名前**:

```
✅ すべてのユーザー取得: fetch_user
❌ fetch_user, get_user, retrieve_user （バラバラ）
```

## スパン属性設計

### 必須属性

**すべてのスパン**:

- `service.name`: サービス名
- `span.kind`: スパンの種類（SERVER/CLIENT/PRODUCER/CONSUMER/INTERNAL）

**HTTPスパン**:

- `http.method`: HTTPメソッド
- `http.url`: URL
- `http.status_code`: ステータスコード

**データベーススパン**:

- `db.system`: データベース種別
- `db.statement`: SQL文
- `db.operation`: 操作種別（SELECT/INSERT等）

### カスタム属性の設計指針

**ビジネスコンテキスト**:

```typescript
span.setAttributes({
  "user.id": userId,
  "order.id": orderId,
  "order.total": 1234.56,
  "payment.method": "credit_card",
});
```

**診断情報**:

```typescript
span.setAttributes({
  "cache.hit": true,
  "retry.count": 2,
  "queue.size": 150,
});
```

**パフォーマンス情報**:

```typescript
span.setAttributes({
  "db.rows_affected": 5,
  "api.response_size_bytes": 4096,
});
```

## スパンイベント

### イベントとは

**定義**: スパン内で発生した特定の時点のイベント

**用途**:

- ログとトレースの統合
- 処理の途中経過を記録
- 例外発生を記録

### イベント追加

```typescript
span.addEvent("Validation started");

// 属性付きイベント
span.addEvent("Cache miss", {
  "cache.key": "user:123",
  "cache.ttl": 3600,
});

// 例外記録
span.recordException(error);
// → イベント "exception" が自動追加され、スタックトレースが記録される
```

## スパンステータス

### ステータスコード

**OK**: 処理成功

```typescript
span.setStatus({ code: SpanStatusCode.OK });
```

**ERROR**: 処理失敗

```typescript
span.setStatus({
  code: SpanStatusCode.ERROR,
  message: "Payment processing failed",
});
```

**UNSET**: 未設定（デフォルト）

```typescript
// 明示的に設定しない場合はUNSET
```

### エラーハンドリング

```typescript
async function processPayment(paymentData) {
  const span = startSpan("process_payment");

  try {
    const result = await paymentGateway.charge(paymentData);
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
}
```

## スパンリンク

### 用途

非同期処理やメッセージキューでのトレース連携

### 実装

```typescript
// メッセージ送信（親スパン）
const publishSpan = startSpan("publish_message");
const publishContext = publishSpan.spanContext();
await queue.publish("orders", { orderId, _trace: publishContext });
publishSpan.end();

// メッセージ受信（子スパン、非同期）
const message = await queue.consume("orders");
const publishContext = message._trace;

// リンクで親スパンと関連付け
const consumeSpan = startSpan("consume_message", {
  links: [
    {
      context: publishContext,
    },
  ],
});

await processOrder(message.orderId);
consumeSpan.end();
```

**可視化**:

```
Publish Span (10ms)
  ⋯ (リンク)
Consume Span (200ms) - 時間的には離れているが論理的に関連
```

## ベストプラクティス

1. **意味のある単位**: ビジネスロジックの処理単位
2. **命名一貫性**: 同じ操作には同じ名前
3. **属性の充実**: 診断に有用な情報を含める
4. **エラー記録**: 例外を必ずスパンに記録
5. **適切な粒度**: 過剰でも不足でもなく

## アンチパターン

❌ **過剰なスパン**: ループの各イテレーションでスパン
✅ **適切な粒度**: ビジネスロジック単位

❌ **属性不足**: スパンIDとタイムスタンプのみ
✅ **属性充実**: user_id、order_id等

❌ **エラー無視**: try-catchでエラーを握りつぶす
✅ **エラー記録**: span.recordException(error)
