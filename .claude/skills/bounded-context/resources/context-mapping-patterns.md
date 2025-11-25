# コンテキストマッピングパターン

## 概要

コンテキストマッピングは、境界付けられたコンテキスト間の関係を定義・可視化する手法です。
各パターンは異なる統合シナリオに適しています。

## パターン一覧

### 1. 共有カーネル（Shared Kernel）

**説明**: 2つのコンテキストがコードやモデルの一部を共有

**特徴**:
- 変更には両チームの合意が必要
- 緊密な協力関係が前提
- 共有範囲は最小限に保つ

**適用場面**:
- 緊密に連携するチーム
- 頻繁に一緒に変更されるモデル
- 分離のコストが高い場合

```
┌─────────────────┐     ┌─────────────────┐
│   コンテキストA  │     │   コンテキストB  │
│                 │     │                 │
│    ┌───────────────────────┐            │
│    │      共有カーネル      │            │
│    │   - Money クラス      │            │
│    │   - Address クラス    │            │
│    └───────────────────────┘            │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
```

**実装例**:
```typescript
// shared-kernel/src/Money.ts
// 両方のコンテキストで使用
export class Money {
  constructor(
    private readonly amount: number,
    private readonly currency: Currency
  ) {}
  // ...
}

// sales/src/Order.ts
import { Money } from '@shared-kernel/Money';

// shipping/src/ShippingCost.ts
import { Money } from '@shared-kernel/Money';
```

**注意点**:
- 共有範囲を厳密に管理
- 変更の影響範囲を常に把握
- テストを厳重に

---

### 2. 顧客/供給者（Customer/Supplier）

**説明**: 上流（供給者）と下流（顧客）の明確な関係

**特徴**:
- 上流が下流のニーズに応える責任
- 下流は要件を提示できる
- 明確な依存の方向

**適用場面**:
- 上流が下流のニーズを理解・対応できる
- 下流に発言権がある関係
- 組織内の異なるチーム間

```
┌─────────────────┐
│    上流（供給者） │
│   販売コンテキスト │
│                 │
│   提供するAPI:    │
│   - getOrder()   │
│   - getCustomer()│
└────────┬────────┘
         │ データ提供
         ↓
┌─────────────────┐
│    下流（顧客）   │
│   配送コンテキスト │
│                 │
│   必要なデータ:   │
│   - 配送先住所    │
│   - 商品リスト    │
└─────────────────┘
```

**実装例**:
```typescript
// 上流（販売コンテキスト）
interface ISalesApi {
  getOrder(orderId: string): Promise<OrderDto>;
  getCustomer(customerId: string): Promise<CustomerDto>;
}

// 下流（配送コンテキスト）
class ShippingService {
  constructor(private readonly salesApi: ISalesApi) {}

  async createShipment(orderId: string): Promise<Shipment> {
    // 上流から必要なデータを取得
    const order = await this.salesApi.getOrder(orderId);
    // 配送コンテキストのモデルに変換して使用
    return Shipment.create({
      destination: order.shippingAddress,
      items: order.items,
    });
  }
}
```

---

### 3. 適合者（Conformist）

**説明**: 下流が上流のモデルに完全に従う

**特徴**:
- 下流は上流のモデルをそのまま使用
- 変換レイヤーなし
- 上流の変更に下流が追従

**適用場面**:
- 上流に影響力がない（外部サービス）
- 変換コストが高い
- 上流のモデルが十分に良い

```
┌─────────────────┐
│    外部システム    │
│   （上流）        │
│                 │
│   OrderResponse: │
│   - orderId     │
│   - items[]     │
│   - status      │
└────────┬────────┘
         │ そのまま使用
         ↓
┌─────────────────┐
│    自システム     │
│   （下流）        │
│                 │
│   上流のモデルを   │
│   そのまま採用    │
└─────────────────┘
```

**実装例**:
```typescript
// 外部APIのレスポンス型をそのまま使用
import { ExternalOrderResponse } from 'external-api';

class OrderProcessor {
  // 外部のモデルをそのまま使用
  process(order: ExternalOrderResponse): void {
    // 変換なしで処理
  }
}
```

**注意点**:
- 上流の変更に脆弱
- 自ドメインの表現力が制限される
- 可能なら腐敗防止層を検討

---

### 4. 腐敗防止層（Anti-Corruption Layer / ACL）

**説明**: 他のコンテキストのモデルを自コンテキストのモデルに変換

**特徴**:
- 外部モデルから自モデルを保護
- 明示的な変換レイヤー
- 他システムの変更の影響を局所化

**適用場面**:
- レガシーシステムとの統合
- 外部サービスとの連携
- モデルの違いが大きい場合

```
┌─────────────────┐
│  外部/レガシー    │
│   システム        │
│                 │
│   LegacyOrder:  │
│   - ORDER_NO    │
│   - ITEM_LIST   │
│   - CUST_ID     │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────────┐
│          腐敗防止層（ACL）           │
│                                     │
│   class OrderTranslator {           │
│     translate(legacy): Order {      │
│       // 変換ロジック               │
│     }                               │
│   }                                 │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────┐
│   自コンテキスト  │
│                 │
│   Order:        │
│   - id          │
│   - items       │
│   - customerId  │
└─────────────────┘
```

**実装例**:
```typescript
// 腐敗防止層
class LegacyOrderAdapter implements IOrderSource {
  constructor(private readonly legacyApi: ILegacyApi) {}

  async getOrder(orderId: string): Promise<Order> {
    // レガシーシステムからデータ取得
    const legacyOrder = await this.legacyApi.fetchOrder(orderId);

    // 自コンテキストのモデルに変換
    return this.translate(legacyOrder);
  }

  private translate(legacy: LegacyOrder): Order {
    return Order.create({
      id: OrderId.fromString(legacy.ORDER_NO),
      items: legacy.ITEM_LIST.map(item => this.translateItem(item)),
      customerId: CustomerId.fromString(legacy.CUST_ID),
      status: this.translateStatus(legacy.STATUS_CD),
    });
  }

  private translateStatus(statusCode: string): OrderStatus {
    const mapping: Record<string, OrderStatus> = {
      '01': OrderStatus.PENDING,
      '02': OrderStatus.CONFIRMED,
      '03': OrderStatus.SHIPPED,
      '99': OrderStatus.CANCELLED,
    };
    return mapping[statusCode] ?? OrderStatus.UNKNOWN;
  }
}
```

---

### 5. 公開ホストサービス（Open Host Service / OHS）

**説明**: 標準化されたAPIを公開し、複数の利用者に提供

**特徴**:
- 多数の下流に対応
- 安定したAPI
- バージョニングで進化

**適用場面**:
- 多くのシステムが利用する機能
- プラットフォームサービス
- 公開API

```
                    ┌─────────────────┐
                    │   コンテキストA  │
                    └────────┬────────┘
                             │
┌─────────────────┐         │         ┌─────────────────┐
│   コンテキストB  │────────┼────────│   コンテキストC  │
└─────────────────┘         │         └─────────────────┘
                             │
               ┌─────────────┴─────────────┐
               │     公開ホストサービス      │
               │   (Open Host Service)     │
               │                           │
               │   /api/v1/orders          │
               │   /api/v1/customers       │
               │   /api/v1/products        │
               └───────────────────────────┘
```

**実装例**:
```typescript
// 公開API
@Controller('api/v1/orders')
class OrdersController {
  @Get(':id')
  async getOrder(@Param('id') id: string): Promise<OrderDto> {
    // 内部モデルを公開DTOに変換
    const order = await this.orderService.getById(id);
    return OrderDto.fromDomain(order);
  }
}

// 公開DTO（公開言語）
class OrderDto {
  id: string;
  status: string;
  items: OrderItemDto[];
  total: MoneyDto;

  static fromDomain(order: Order): OrderDto {
    return {
      id: order.id.toString(),
      status: order.status,
      items: order.items.map(OrderItemDto.fromDomain),
      total: MoneyDto.fromDomain(order.total),
    };
  }
}
```

---

### 6. 公開言語（Published Language）

**説明**: コンテキスト間で共通の言語（フォーマット）で通信

**特徴**:
- 標準化されたデータ形式
- ドキュメント化されたスキーマ
- 業界標準の活用

**適用場面**:
- 異なる組織間の統合
- 業界標準が存在する場合
- 多くのシステムとの相互運用

```
┌─────────────────┐                    ┌─────────────────┐
│   コンテキストA  │                    │   コンテキストB  │
│                 │                    │                 │
│   内部モデル     │                    │   内部モデル     │
│      ↓          │                    │      ↑          │
│   変換          │                    │   変換          │
│      ↓          │                    │      ↑          │
│   公開言語      │─────────────────→│   公開言語      │
│   (JSON/XML)    │                    │   (JSON/XML)    │
└─────────────────┘                    └─────────────────┘

        └─────────────────┬─────────────────┘
                          │
                    ┌─────┴─────┐
                    │  共通スキーマ  │
                    │  (JSON Schema,│
                    │   Protocol   │
                    │   Buffers)   │
                    └─────────────┘
```

**実装例**:
```typescript
// 公開言語としてのスキーマ定義
// order-schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "orderId": { "type": "string" },
    "orderDate": { "type": "string", "format": "date-time" },
    "lineItems": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "productId": { "type": "string" },
          "quantity": { "type": "integer" }
        }
      }
    }
  }
}

// 各コンテキストは公開言語に変換
class OrderMessageConverter {
  toPublishedLanguage(order: Order): PublishedOrder {
    return {
      orderId: order.id.toString(),
      orderDate: order.createdAt.toISOString(),
      lineItems: order.items.map(item => ({
        productId: item.productId.toString(),
        quantity: item.quantity,
      })),
    };
  }

  fromPublishedLanguage(published: PublishedOrder): Order {
    // 公開言語から内部モデルへ変換
  }
}
```

---

### 7. 分離した道（Separate Ways）

**説明**: 統合せずに独立して存在

**特徴**:
- 統合コストが高すぎる
- 重複を許容
- 独立性を最優先

**適用場面**:
- 統合のROIが低い
- 完全に独立した業務
- 一時的な状況

---

### 8. 大きな泥団子（Big Ball of Mud）

**説明**: 明確な境界がない混沌とした状態

**特徴**:
- 避けるべき状態
- レガシーシステムの現実
- 段階的な改善対象

**対処法**:
1. 境界を徐々に明確化
2. 腐敗防止層で隔離
3. 新機能は別コンテキストで開発

## パターン選択ガイド

| 状況 | 推奨パターン |
|-----|------------|
| 緊密な協力が可能なチーム | 共有カーネル |
| 上流に影響力がある | 顧客/供給者 |
| 上流に影響力がない | 適合者 or ACL |
| レガシーとの統合 | 腐敗防止層 |
| 多数の利用者 | 公開ホストサービス |
| 異なる組織間 | 公開言語 |
| 統合メリットなし | 分離した道 |
