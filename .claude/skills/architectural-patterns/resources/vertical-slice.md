# 垂直スライスアーキテクチャ（Vertical Slice Architecture）

## 概要

Jimmy Bogard が提唱したアーキテクチャパターン。
機能（Feature）単位でコードを組織化する。

## 従来アーキテクチャとの比較

### 水平レイヤー（従来）

```
src/
├── Controllers/        # すべてのController
│   ├── OrderController
│   ├── UserController
│   └── ProductController
├── Services/           # すべてのService
│   ├── OrderService
│   ├── UserService
│   └── ProductService
├── Repositories/       # すべてのRepository
│   ├── OrderRepository
│   ├── UserRepository
│   └── ProductRepository
└── Models/             # すべてのModel
    ├── Order
    ├── User
    └── Product
```

### 垂直スライス

```
src/
├── features/
│   ├── orders/
│   │   ├── create-order/
│   │   │   ├── handler.ts
│   │   │   ├── request.ts
│   │   │   └── validator.ts
│   │   ├── get-order/
│   │   │   ├── handler.ts
│   │   │   └── response.ts
│   │   └── cancel-order/
│   │       ├── handler.ts
│   │       └── request.ts
│   ├── users/
│   │   ├── register/
│   │   └── login/
│   └── products/
│       ├── create-product/
│       └── list-products/
└── shared/
    ├── core/
    └── infrastructure/
```

## 核心原則

### 1. 機能による凝集

- 関連するコードを**機能単位**でグループ化
- 一つの機能に必要なすべてが同じディレクトリに

### 2. 機能間の独立性

- 機能同士は**直接依存しない**
- 共通機能は`shared/`に配置

### 3. 変更の局所化

- 機能の変更は**その機能内で完結**
- 他の機能に影響を与えない

## コード例

### 機能の構造

```typescript
// features/orders/create-order/request.ts
export interface CreateOrderRequest {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: Address;
}
```

```typescript
// features/orders/create-order/handler.ts
import { CreateOrderRequest } from './request';
import { db } from '@/shared/infrastructure/database';
import { Order } from '@/shared/core/entities/order';

export async function createOrder(
  request: CreateOrderRequest
): Promise<Order> {
  // バリデーション
  validateRequest(request);

  // ビジネスロジック
  const order = new Order({
    customerId: request.customerId,
    items: request.items,
    shippingAddress: request.shippingAddress,
    status: 'pending',
    createdAt: new Date(),
  });

  // データベース操作
  await db.insert(orders).values(order.toDTO());

  return order;
}

function validateRequest(request: CreateOrderRequest): void {
  if (!request.customerId) {
    throw new ValidationError('Customer ID is required');
  }
  if (request.items.length === 0) {
    throw new ValidationError('At least one item is required');
  }
}
```

```typescript
// features/orders/create-order/index.ts
export { createOrder } from './handler';
export type { CreateOrderRequest } from './request';
```

### API Routeとの統合

```typescript
// app/api/orders/route.ts
import { createOrder, CreateOrderRequest } from '@/features/orders/create-order';
import { getOrders } from '@/features/orders/list-orders';

export async function POST(request: Request) {
  const body: CreateOrderRequest = await request.json();
  const order = await createOrder(body);
  return Response.json(order, { status: 201 });
}

export async function GET() {
  const orders = await getOrders();
  return Response.json(orders);
}
```

## このプロジェクトでの適用

```
src/
├── features/
│   ├── registry.ts              # 機能レジストリ
│   ├── execute-workflow/
│   │   ├── schema.ts           # Zodスキーマ
│   │   ├── executor.ts         # ハンドラー
│   │   └── __tests__/
│   ├── analyze-code/
│   │   ├── schema.ts
│   │   ├── executor.ts
│   │   └── __tests__/
│   └── generate-response/
│       ├── schema.ts
│       ├── executor.ts
│       └── __tests__/
├── shared/
│   ├── core/                   # ドメインモデル、インターフェース
│   └── infrastructure/         # データベース、外部サービス
└── app/                        # Next.js App Router
```

## メリット

1. **高い凝集度**: 関連コードが近くに配置
2. **低い結合度**: 機能間の依存がない
3. **理解しやすさ**: 機能単位で把握可能
4. **変更の影響範囲**: 限定的で予測可能
5. **チーム開発**: 機能単位での並行開発が容易

## 注意点

### コードの重複

- 機能間で似たコードが発生する可能性
- 必要に応じて`shared/`に共通化

### 共通機能の判断

```
Q: このコードは shared に移動すべきか？
├─ 2つ以上の機能で使用 → はい
├─ ドメインモデル → はい（core/entities）
├─ インフラ関連 → はい（infrastructure）
└─ 1つの機能でのみ使用 → いいえ（機能内に留める）
```

## チェックリスト

- [ ] 各機能が独立したディレクトリを持っているか
- [ ] 機能間で直接importしていないか
- [ ] 共通コードが適切にsharedに配置されているか
- [ ] 機能の変更が他の機能に影響しないか
