# コードの命名規則

## 概要

ユビキタス言語をコードに正確に反映するための命名規則を定義します。
ドメインエキスパートがコードを読める状態を目指します。

## 基本原則

### 1. ドメイン用語をそのまま使用

**原則**: 技術的な言い換えを避け、ドメインで使われる用語をそのまま使用

**良い例**:

```typescript
// ドメイン用語「注文」をそのまま使用
class Order { }

// ドメイン用語「承認する」をそのまま使用
approve(): void { }
```

**悪い例**:

```typescript
// 技術用語への言い換え
class OrderEntity { }  // ❌ Entity は技術用語
class OrderDTO { }     // ❌ DTO は技術用語

// 一般化しすぎ
process(): void { }    // ❌ 何をするか不明
handle(): void { }     // ❌ 曖昧
```

### 2. 一貫した用語使用

**原則**: 同じ概念には必ず同じ用語を使用

**良い例**:

```typescript
// 「顧客」で統一
class Customer {}
interface CustomerRepository {}
function findCustomerById() {}
```

**悪い例**:

```typescript
// 用語が統一されていない
class Customer {}
interface ClientRepository {} // ❌ Customer と Client の混在
function getUserById() {} // ❌ User も混在
```

### 3. コンテキストを意識

**原則**: 境界付けられたコンテキスト内で用語の意味を統一

```typescript
// 販売コンテキスト
namespace Sales {
  class Customer {
    purchaseHistory: PurchaseHistory;
  }
}

// サポートコンテキスト
namespace Support {
  class Customer {
    tickets: SupportTicket[];
  }
}
```

## クラス名の命名

### エンティティ

| パターン       | 説明                   | 例                               |
| -------------- | ---------------------- | -------------------------------- |
| 単数形名詞     | ドメイン概念をそのまま | Order, Customer, Product         |
| 複合語         | 修飾語 + 名詞          | PremiumCustomer, ExpressOrder    |
| 状態を含まない | 状態は属性で表現       | Order（CancelledOrder ではなく） |

```typescript
// ✅ 良い例
class Order {}
class Customer {}
class ShippingAddress {}

// ❌ 悪い例
class OrderEntity {} // Entity サフィックス不要
class CustomerModel {} // Model サフィックス不要
class OrderData {} // Data サフィックス不要
```

### 値オブジェクト

| パターン | 説明                   | 例                             |
| -------- | ---------------------- | ------------------------------ |
| 概念名   | ドメインで使われる名前 | Money, EmailAddress, DateRange |
| 複合語   | 修飾語 + 名詞          | JapanesePhoneNumber            |

```typescript
// ✅ 良い例
class Money {}
class EmailAddress {}
class PostalCode {}

// ❌ 悪い例
class MoneyVO {} // VO サフィックス不要
class EmailAddressValue {} // Value サフィックス不要
```

### 集約

```typescript
// 集約ルート名 = ドメイン概念
class Order {} // 注文集約のルート

// 内部エンティティは集約内でのみ使用
// 外部からは集約ルート経由でアクセス
```

### リポジトリ

| パターン                        | 説明             | 例               |
| ------------------------------- | ---------------- | ---------------- |
| I + エンティティ名 + Repository | インターフェース | IOrderRepository |
| エンティティ名 + Repository     | 実装             | OrderRepository  |

```typescript
// ✅ 良い例
interface IOrderRepository {}
class OrderRepository implements IOrderRepository {}

// ❌ 悪い例
interface OrderRepo {} // 略語を避ける
class OrderRepositoryImpl {} // Impl サフィックス不要
```

### ドメインサービス

| パターン              | 説明       | 例                        |
| --------------------- | ---------- | ------------------------- |
| 動詞 + 名詞 + Service | 操作を表す | PricingCalculationService |
| 名詞 + Service        | 概念を表す | ShippingService           |

```typescript
// ✅ 良い例
class PricingService {}
class ShippingCostCalculator {}
class OrderFulfillmentService {}

// ❌ 悪い例
class OrderHelper {} // Helper は曖昧
class OrderManager {} // Manager は曖昧
class OrderUtils {} // Utils は技術用語
```

## メソッド名の命名

### コマンド（状態変更）

| パターン     | 説明                   | 例                             |
| ------------ | ---------------------- | ------------------------------ |
| 動詞         | シンプルな操作         | approve(), cancel(), ship()    |
| 動詞 + 名詞  | 操作対象を明示         | addItem(), removeItem()        |
| ドメイン動詞 | ビジネスで使われる動詞 | place(), fulfill(), dispatch() |

```typescript
class Order {
  // ✅ 良い例：ドメインの動詞を使用
  place(): void {} // 注文する
  approve(): void {} // 承認する
  cancel(): void {} // キャンセルする
  ship(): void {} // 出荷する
  addItem(item: Item): void {}

  // ❌ 悪い例：技術的な動詞
  setStatus(): void {} // 技術的すぎる
  updateOrder(): void {} // 曖昧
  processOrder(): void {} // 何をするか不明
}
```

### クエリ（情報取得）

| パターン    | 説明             | 例                          |
| ----------- | ---------------- | --------------------------- |
| get + 名詞  | 単一値の取得     | getTotal(), getStatus()     |
| is/has/can  | 真偽値の取得     | isApproved(), hasItems()    |
| find + 名詞 | 検索（null許容） | findById()                  |
| list/getAll | 複数取得         | listItems(), getAllOrders() |

```typescript
class Order {
  // ✅ 良い例
  getTotal(): Money { }
  getStatus(): OrderStatus { }
  isApproved(): boolean { }
  hasItems(): boolean { }
  canBeCancelled(): boolean { }
}

interface IOrderRepository {
  findById(id: OrderId): Order | null { }
  getById(id: OrderId): Order { }  // 存在前提、なければ例外
  findByCustomer(customerId: CustomerId): Order[] { }
}
```

### ファクトリメソッド

| パターン      | 説明                 | 例                   |
| ------------- | -------------------- | -------------------- |
| create        | 新規作成             | Order.create()       |
| from + 情報源 | 変換・復元           | Money.fromString()   |
| of            | 値オブジェクト生成   | EmailAddress.of()    |
| reconstitute  | 永続化データから復元 | Order.reconstitute() |

```typescript
class Order {
  static create(customerId: CustomerId): Order {}
  static reconstitute(props: OrderProps): Order {}
}

class Money {
  static of(amount: number, currency: Currency): Money {}
  static fromString(value: string): Money {}
}
```

## プロパティ名の命名

### 属性

| パターン      | 説明             | 例                              |
| ------------- | ---------------- | ------------------------------- |
| 名詞          | シンプルな属性   | name, email, address            |
| 形容詞 + 名詞 | 修飾が必要な場合 | shippingAddress, billingAddress |

```typescript
class Customer {
  // ✅ 良い例
  name: CustomerName;
  email: EmailAddress;
  shippingAddress: Address;
  billingAddress: Address;

  // ❌ 悪い例
  customerName: CustomerName; // Customer は既に自明
  emailAddress: EmailAddress; // Address の重複
}
```

### 関連

| パターン       | 説明         | 例                    |
| -------------- | ------------ | --------------------- |
| 単数形         | 1対1の関連   | customer, order       |
| 複数形         | 1対多の関連  | items, orders         |
| 関係を示す名詞 | 明示的な関係 | assignedTo, createdBy |

```typescript
class Order {
  // ✅ 良い例
  customer: Customer; // 1対1
  items: OrderItem[]; // 1対多
  assignedTo: Employee; // 関係を明示

  // ❌ 悪い例
  customerRef: Customer; // Ref は技術用語
  itemList: OrderItem[]; // List は技術用語
}
```

### 日時

| パターン        | 説明             | 例                    |
| --------------- | ---------------- | --------------------- |
| 動詞過去形 + At | イベント発生日時 | createdAt, updatedAt  |
| 名詞 + Date     | 予定・期限       | dueDate, deliveryDate |

```typescript
class Order {
  // ✅ 良い例
  createdAt: Date;
  updatedAt: Date;
  placedAt: Date;
  shippedAt: Date | null;
  deliveryDate: Date;

  // ❌ 悪い例
  createDate: Date; // At が標準
  orderTimestamp: Date; // Timestamp は技術用語
}
```

## 列挙型の命名

### ステータス・状態

```typescript
// ✅ 良い例：ドメインの状態をそのまま
enum OrderStatus {
  DRAFT = "DRAFT",
  PLACED = "PLACED",
  APPROVED = "APPROVED",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

// ❌ 悪い例
enum OrderStatus {
  STATUS_1 = 1, // 意味不明
  NEW = "NEW", // DRAFT の方が具体的
  PROCESSED = "PROCESSED", // 何が処理されたか不明
}
```

### 種別・タイプ

```typescript
// ✅ 良い例
enum CustomerType {
  INDIVIDUAL = "INDIVIDUAL",
  CORPORATE = "CORPORATE",
  PREMIUM = "PREMIUM",
}

enum PaymentMethod {
  CREDIT_CARD = "CREDIT_CARD",
  BANK_TRANSFER = "BANK_TRANSFER",
  CASH_ON_DELIVERY = "CASH_ON_DELIVERY",
}
```

## チェックリスト

### 命名レビュー

- [ ] ドメイン用語がそのまま使われているか？
- [ ] 技術的なサフィックス（Entity, DTO, VO等）がないか？
- [ ] 同じ概念に同じ用語が使われているか？
- [ ] メソッド名がドメインの動詞を使っているか？
- [ ] 略語を使っていないか？
- [ ] ドメインエキスパートがコードを読めるか？

### コードレビューでの確認

```typescript
// このコードを見て、ドメインエキスパートは理解できるか？

// ✅ 理解しやすい
order.place();
order.approve();
order.ship();

// ❌ 理解しにくい
order.setStatus(OrderStatus.PLACED);
order.process();
orderService.handleOrder(order);
```
