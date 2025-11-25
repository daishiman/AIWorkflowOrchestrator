# Facade Pattern for API Integration

## 概要

Facadeパターンは、複雑な外部APIまたは複数の外部サービスを、シンプルな統一インターフェースで隠蔽する構造的パターンです。
呼び出し側は複雑さを意識することなく、単純なメソッド呼び出しで機能を利用できます。

## いつ使うか

### 適用条件
- [ ] 複数の外部APIを組み合わせて1つの機能を実現する
- [ ] 外部APIの呼び出し順序が複雑
- [ ] 呼び出し側に外部システムの複雑さを見せたくない
- [ ] トランザクション的な一連の操作を統合したい

### 適用しない条件
- 単一の外部APIで完結する場合（Adapterで十分）
- 各API呼び出しを個別に制御する必要がある
- Facade層のオーバーヘッドが問題になる場合

## パターン構造

```
┌─────────────────┐
│  Internal Code  │
└────────┬────────┘
         │ 単一メソッド呼び出し
         ▼
┌─────────────────┐
│     Facade      │ ── 統合インターフェース
└────────┬────────┘
         │ 複数APIの調整
    ┌────┴────┬────────┐
    ▼         ▼        ▼
┌───────┐ ┌───────┐ ┌───────┐
│ API A │ │ API B │ │ API C │
└───────┘ └───────┘ └───────┘
```

## 実装アプローチ

### 1. 統合インターフェース定義

```typescript
// Facadeが提供する統合インターフェース
interface OrderFacade {
  // 複数のAPIを組み合わせた高レベル操作
  placeOrder(request: OrderRequest): Promise<OrderResult>;
  cancelOrder(orderId: string): Promise<CancelResult>;
  getOrderStatus(orderId: string): Promise<OrderStatus>;
}
```

### 2. Facade実装

```typescript
class OrderServiceFacade implements OrderFacade {
  constructor(
    private readonly inventoryApi: InventoryApiClient,
    private readonly paymentApi: PaymentApiClient,
    private readonly shippingApi: ShippingApiClient,
    private readonly notificationApi: NotificationApiClient,
  ) {}

  async placeOrder(request: OrderRequest): Promise<OrderResult> {
    // 1. 在庫確認
    const inventory = await this.inventoryApi.checkAvailability(
      request.items.map(i => i.productId)
    );
    if (!inventory.allAvailable) {
      return { success: false, reason: 'OUT_OF_STOCK' };
    }

    // 2. 在庫予約
    const reservation = await this.inventoryApi.reserve(request.items);

    try {
      // 3. 支払い処理
      const payment = await this.paymentApi.charge({
        amount: request.totalAmount,
        method: request.paymentMethod,
      });

      if (!payment.success) {
        await this.inventoryApi.releaseReservation(reservation.id);
        return { success: false, reason: 'PAYMENT_FAILED' };
      }

      // 4. 配送手配
      const shipping = await this.shippingApi.createShipment({
        address: request.shippingAddress,
        items: request.items,
      });

      // 5. 確認通知
      await this.notificationApi.sendOrderConfirmation({
        email: request.customerEmail,
        orderId: payment.orderId,
        trackingNumber: shipping.trackingNumber,
      });

      return {
        success: true,
        orderId: payment.orderId,
        trackingNumber: shipping.trackingNumber,
      };
    } catch (error) {
      // 補償トランザクション
      await this.inventoryApi.releaseReservation(reservation.id);
      throw error;
    }
  }

  async cancelOrder(orderId: string): Promise<CancelResult> {
    // 複数サービスへのキャンセル操作を調整
    const [inventoryResult, paymentResult, shippingResult] = await Promise.all([
      this.inventoryApi.cancelReservation(orderId),
      this.paymentApi.refund(orderId),
      this.shippingApi.cancelShipment(orderId),
    ]);

    await this.notificationApi.sendCancellationConfirmation({ orderId });

    return {
      success: inventoryResult.success && paymentResult.success,
      refundAmount: paymentResult.refundedAmount,
    };
  }

  async getOrderStatus(orderId: string): Promise<OrderStatus> {
    // 複数ソースからの情報を統合
    const [payment, shipping] = await Promise.all([
      this.paymentApi.getStatus(orderId),
      this.shippingApi.getTrackingInfo(orderId),
    ]);

    return {
      orderId,
      paymentStatus: payment.status,
      shippingStatus: shipping.status,
      estimatedDelivery: shipping.estimatedDelivery,
    };
  }
}
```

## 設計パターン

### 順序依存の処理

```typescript
class SequentialFacade {
  async processWorkflow(): Promise<Result> {
    // 順序が重要な処理
    const step1 = await this.serviceA.initialize();
    const step2 = await this.serviceB.process(step1.data);
    const step3 = await this.serviceC.finalize(step2.result);
    return step3;
  }
}
```

### 並列処理の統合

```typescript
class ParallelFacade {
  async aggregateData(id: string): Promise<AggregatedData> {
    // 並列で取得可能なデータ
    const [userData, ordersData, preferencesData] = await Promise.all([
      this.userApi.getUser(id),
      this.orderApi.getOrders(id),
      this.preferenceApi.getPreferences(id),
    ]);

    return {
      user: userData,
      orders: ordersData,
      preferences: preferencesData,
    };
  }
}
```

### 条件分岐の隠蔽

```typescript
class ConditionalFacade {
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    // 支払い方法による分岐を隠蔽
    switch (request.method) {
      case 'CREDIT_CARD':
        return this.creditCardApi.charge(request);
      case 'BANK_TRANSFER':
        return this.bankApi.transfer(request);
      case 'WALLET':
        return this.walletApi.pay(request);
      default:
        throw new UnsupportedPaymentMethodError(request.method);
    }
  }
}
```

## エラーハンドリング

### 補償トランザクション

```typescript
class TransactionalFacade {
  async executeWithCompensation(): Promise<Result> {
    const completedSteps: CompensationAction[] = [];

    try {
      // Step 1
      const result1 = await this.service1.execute();
      completedSteps.push(() => this.service1.rollback(result1.id));

      // Step 2
      const result2 = await this.service2.execute(result1.data);
      completedSteps.push(() => this.service2.rollback(result2.id));

      // Step 3
      const result3 = await this.service3.execute(result2.data);

      return { success: true, data: result3 };
    } catch (error) {
      // 逆順で補償を実行
      for (const compensate of completedSteps.reverse()) {
        try {
          await compensate();
        } catch (compensationError) {
          // 補償失敗をログに記録
          console.error('Compensation failed:', compensationError);
        }
      }
      throw error;
    }
  }
}
```

### 部分的成功の処理

```typescript
class PartialSuccessFacade {
  async batchProcess(items: Item[]): Promise<BatchResult> {
    const results = await Promise.allSettled(
      items.map(item => this.processItem(item))
    );

    const successful = results.filter(r => r.status === 'fulfilled');
    const failed = results.filter(r => r.status === 'rejected');

    return {
      total: items.length,
      successful: successful.length,
      failed: failed.length,
      errors: failed.map(r => (r as PromiseRejectedResult).reason),
    };
  }
}
```

## チェックリスト

### 設計時
- [ ] Facadeが提供するインターフェースは十分にシンプルか？
- [ ] 各外部APIの責務が明確に分離されているか？
- [ ] エラー発生時の補償トランザクションが考慮されているか？

### 実装時
- [ ] 並列実行可能な処理はPromise.allで最適化されているか？
- [ ] タイムアウトが適切に設定されているか？
- [ ] 部分的失敗のハンドリングが実装されているか？

### テスト時
- [ ] 各外部APIのモックが準備されているか？
- [ ] 失敗シナリオ（各ステップでの失敗）がテストされているか？
- [ ] 補償トランザクションがテストされているか？

## アンチパターン

### ❌ 神クラス化

```typescript
// NG: Facadeがすべてを知りすぎている
class GodFacade {
  // 100以上のメソッド
  // すべての外部APIを直接操作
  // ビジネスロジックも含む
}
```

### ❌ 透過的でないFacade

```typescript
// NG: 外部APIの詳細が漏洩
interface BadFacade {
  callApiAWithParams(params: ApiASpecificParams): Promise<ApiAResponse>;
  callApiBWithParams(params: ApiBSpecificParams): Promise<ApiBResponse>;
}
```

## 関連パターン

- **Adapter Pattern**: 個々のAPIクライアントをラップ
- **Mediator Pattern**: コンポーネント間の複雑な相互作用を調整
- **Proxy Pattern**: Facadeにキャッシュや認証を追加
