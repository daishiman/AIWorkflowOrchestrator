# 検証戦略

## 概要

テストの検証には「状態検証」と「振る舞い検証」の2つのアプローチがあります。
適切な検証戦略の選択は、テストの品質と保守性に大きく影響します。

## 状態検証（State Verification）

### 定義

操作後のシステムの状態を確認する検証方法。

### 特徴

- 結果にフォーカス
- 実装の詳細に依存しない
- テストが安定
- リファクタリングに強い

### 例

```typescript
it("should update user name", async () => {
  // Arrange
  const fakeRepo = new FakeUserRepository();
  fakeRepo.seed([{ id: "user-1", name: "Old Name" }]);
  const service = new UserService(fakeRepo);

  // Act
  await service.updateName("user-1", "New Name");

  // Assert - 状態を検証
  const user = await fakeRepo.findById("user-1");
  expect(user.name).toBe("New Name");
});
```

### 適用場面

- 最終的な結果が重要
- 複数の方法で同じ結果を達成可能
- リファクタリングが予想される
- 統合テスト

## 振る舞い検証（Behavior Verification）

### 定義

オブジェクト間の相互作用が期待通りかを確認する検証方法。

### 特徴

- プロセスにフォーカス
- 呼び出しパターンを検証
- 実装の詳細に依存
- 契約の遵守を確認

### 例

```typescript
it("should notify when order is placed", async () => {
  // Arrange
  const mockNotification = { send: vi.fn() };
  const service = new OrderService(mockNotification);

  // Act
  await service.placeOrder({ userId: "user-1", items: [] });

  // Assert - 振る舞いを検証
  expect(mockNotification.send).toHaveBeenCalledWith(
    expect.objectContaining({ type: "order_placed" }),
  );
});
```

### 適用場面

- 副作用が重要（通知、ログ、メトリクス）
- 外部システムとの連携
- 呼び出し順序が重要
- 契約の検証

## 使い分けガイドライン

### 状態検証を選ぶ

```
判断基準:
├─ 最終結果が重要
├─ 実装方法が変わる可能性
├─ Fakeが利用可能
└─ 統合テスト
```

**例**:

```typescript
// ✅ 状態検証が適切
it("should calculate order total", async () => {
  const order = await service.createOrder({
    items: [
      { price: 100, quantity: 2 },
      { price: 50, quantity: 3 },
    ],
  });

  // 結果を検証
  expect(order.total).toBe(350);
});
```

### 振る舞い検証を選ぶ

```
判断基準:
├─ 副作用が重要
├─ 外部連携の確認
├─ 呼び出しパターンが契約
└─ 状態を確認できない
```

**例**:

```typescript
// ✅ 振る舞い検証が適切
it("should send email notification", async () => {
  await service.completeRegistration(userId);

  // 外部サービス呼び出しを検証
  expect(mockEmailService.send).toHaveBeenCalledWith(
    expect.objectContaining({
      to: user.email,
      template: "welcome",
    }),
  );
});
```

## アンチパターン

### ❌ 過度な振る舞い検証

```typescript
// 悪い例：すべての呼び出しを検証
it("should process order", async () => {
  await service.processOrder(orderId);

  // 過度な検証 - 実装に密結合
  expect(mockLogger.log).toHaveBeenCalledWith("Processing started");
  expect(mockRepo.findById).toHaveBeenCalledWith(orderId);
  expect(mockValidator.validate).toHaveBeenCalled();
  expect(mockRepo.save).toHaveBeenCalled();
  expect(mockLogger.log).toHaveBeenCalledWith("Processing completed");
});

// 良い例：重要な振る舞いのみ
it("should save processed order", async () => {
  await service.processOrder(orderId);

  expect(mockRepo.save).toHaveBeenCalledWith(
    expect.objectContaining({ status: "processed" }),
  );
});
```

### ❌ 検証の重複

```typescript
// 悪い例：状態と振る舞いの両方を過度に検証
it("should update user", async () => {
  await service.updateUser("user-1", { name: "New Name" });

  // 冗長
  expect(mockRepo.save).toHaveBeenCalled();
  const user = await fakeRepo.findById("user-1");
  expect(user.name).toBe("New Name");
});

// 良い例：どちらか一方
it("should update user name", async () => {
  await service.updateUser("user-1", { name: "New Name" });

  const user = await fakeRepo.findById("user-1");
  expect(user.name).toBe("New Name");
});
```

## ハイブリッドアプローチ

複雑なシナリオでは両方を組み合わせる：

```typescript
describe("Payment Processing", () => {
  it("should process payment and update order", async () => {
    // Arrange
    fakeOrderRepo.seed([{ id: "order-1", status: "pending" }]);

    // Act
    await paymentService.processPayment("order-1", { amount: 1000 });

    // 状態検証: 結果
    const order = await fakeOrderRepo.findById("order-1");
    expect(order.status).toBe("paid");
    expect(order.paidAmount).toBe(1000);

    // 振る舞い検証: 重要な外部連携
    expect(mockPaymentGateway.charge).toHaveBeenCalledWith({
      orderId: "order-1",
      amount: 1000,
    });
  });
});
```

## 決定マトリックス

| シナリオ     | 推奨検証 | 理由             |
| ------------ | -------- | ---------------- |
| CRUD操作     | 状態     | 結果が重要       |
| 通知送信     | 振る舞い | 副作用が重要     |
| 計算ロジック | 状態     | 結果の正確性     |
| 外部API連携  | 振る舞い | 呼び出しパターン |
| データ変換   | 状態     | 出力の正確性     |
| イベント発行 | 振る舞い | 発行の確認       |

## チェックリスト

### 検証戦略選択時

- [ ] 何を検証したいのか明確か？
- [ ] 状態で検証できるか？
- [ ] 振る舞いの検証が必要か？
- [ ] 実装の詳細に依存しすぎていないか？

### テスト設計時

- [ ] 検証は最小限か？
- [ ] テストの意図が明確か？
- [ ] リファクタリング耐性があるか？
