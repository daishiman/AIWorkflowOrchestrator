# メソッド関連のコードスメル

## 1. Long Method（長いメソッド）

### 説明
一つのメソッドに多くの処理が詰め込まれている状態。

### 検出基準
- 20行以上のメソッド
- ネストが3段以上
- 複数の異なる処理を含む

### 例

```typescript
// ❌ Long Method
async function processOrder(orderId: string): Promise<void> {
  // 注文取得
  const order = await db.orders.findById(orderId);
  if (!order) throw new Error('Order not found');

  // 在庫チェック
  for (const item of order.items) {
    const stock = await db.inventory.findById(item.productId);
    if (!stock || stock.quantity < item.quantity) {
      throw new Error(`Insufficient stock for ${item.productId}`);
    }
  }

  // 在庫更新
  for (const item of order.items) {
    await db.inventory.update({
      where: { productId: item.productId },
      data: { quantity: { decrement: item.quantity } }
    });
  }

  // 支払い処理
  const customer = await db.customers.findById(order.customerId);
  const paymentMethod = await db.paymentMethods.findFirst({
    where: { customerId: customer.id, isDefault: true }
  });
  await stripe.charges.create({
    amount: order.total,
    source: paymentMethod.stripeId
  });

  // ステータス更新
  await db.orders.update({
    where: { id: orderId },
    data: { status: 'processing' }
  });

  // 通知送信
  await sendEmail(customer.email, 'Order Confirmed', `Your order ${orderId} has been confirmed.`);
  await sendPushNotification(customer.deviceToken, 'Order Confirmed');
}
```

### リファクタリング

```typescript
// ✅ メソッドの抽出
async function processOrder(orderId: string): Promise<void> {
  const order = await getOrder(orderId);
  await validateStock(order);
  await reserveStock(order);
  await processPayment(order);
  await updateOrderStatus(order, 'processing');
  await notifyCustomer(order);
}

async function getOrder(orderId: string): Promise<Order> {
  const order = await db.orders.findById(orderId);
  if (!order) throw new Error('Order not found');
  return order;
}

async function validateStock(order: Order): Promise<void> {
  for (const item of order.items) {
    const stock = await db.inventory.findById(item.productId);
    if (!stock || stock.quantity < item.quantity) {
      throw new Error(`Insufficient stock for ${item.productId}`);
    }
  }
}

// ... 他のメソッドも同様に抽出
```

---

## 2. Long Parameter List（長いパラメータリスト）

### 説明
メソッドのパラメータが多すぎる状態。

### 検出基準
- 4つ以上のパラメータ
- 似た型のパラメータが連続
- パラメータの順序を覚える必要がある

### 例

```typescript
// ❌ Long Parameter List
function createUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  phoneNumber: string,
  address: string,
  city: string,
  country: string,
  postalCode: string,
  dateOfBirth: Date,
  role: string
): User {
  // ...
}
```

### リファクタリング

```typescript
// ✅ オブジェクトパラメータ
interface CreateUserParams {
  name: {
    first: string;
    last: string;
  };
  email: string;
  password: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
  dateOfBirth?: Date;
  role?: UserRole;
}

function createUser(params: CreateUserParams): User {
  // ...
}

// 呼び出し
createUser({
  name: { first: 'John', last: 'Doe' },
  email: 'john@example.com',
  password: 'secret',
});
```

---

## 3. Flag Argument（フラグ引数）

### 説明
Boolean引数によってメソッドの動作が分岐する。

### 検出基準
- boolean型のパラメータ
- パラメータ値によって大きく異なる処理

### 例

```typescript
// ❌ Flag Argument
function getUsers(includeInactive: boolean): User[] {
  if (includeInactive) {
    return db.users.findAll();
  } else {
    return db.users.findAll({ where: { isActive: true } });
  }
}

// 呼び出し側で意図が不明
getUsers(true);  // ???
getUsers(false); // ???
```

### リファクタリング

```typescript
// ✅ 明確な名前のメソッドに分割
function getActiveUsers(): User[] {
  return db.users.findAll({ where: { isActive: true } });
}

function getAllUsers(): User[] {
  return db.users.findAll();
}

// 呼び出し側で意図が明確
getActiveUsers();
getAllUsers();
```

---

## 4. Speculative Generality（推測的汎用化）

### 説明
「将来必要になるかもしれない」という理由で追加された未使用の機能。

### 検出基準
- 使用されていないパラメータ
- 使用されていないメソッドオーバーロード
- 過度な抽象化

### 例

```typescript
// ❌ Speculative Generality
interface DataProcessor<T, R, M> {
  process(data: T, options?: ProcessOptions<M>): R;
  processAsync(data: T, options?: ProcessOptions<M>): Promise<R>;
  processBatch(data: T[], options?: BatchOptions<M>): R[];
  processBatchAsync(data: T[], options?: BatchOptions<M>): Promise<R[]>;
  transform(data: T): T;  // 使われていない
  validate(data: T): boolean;  // 使われていない
}

// 実際には1つのメソッドしか使っていない
class StringProcessor implements DataProcessor<string, string, never> {
  process(data: string): string {
    return data.toUpperCase();
  }
  // 他のメソッドは空実装...
}
```

### リファクタリング

```typescript
// ✅ 必要なものだけを定義
interface StringProcessor {
  process(data: string): string;
}

class UpperCaseProcessor implements StringProcessor {
  process(data: string): string {
    return data.toUpperCase();
  }
}
```

---

## 5. Dead Code（死んだコード）

### 説明
実行されることのないコード。

### 検出基準
- 到達不能なコード
- 未使用の変数・関数
- コメントアウトされたコード

### 例

```typescript
// ❌ Dead Code
function calculate(value: number): number {
  if (value < 0) {
    return -1;
  }
  return value * 2;

  // 到達不能
  console.log('Done'); // Dead code
}

// 未使用の関数
function oldCalculation(value: number): number {
  return value + 1;
}

// コメントアウトされたコード
// function deprecatedFeature() {
//   // 古い実装
// }
```

### リファクタリング

```typescript
// ✅ 不要なコードを削除
function calculate(value: number): number {
  if (value < 0) {
    return -1;
  }
  return value * 2;
}
```

---

## 6. Message Chains（メッセージチェーン）

### 説明
オブジェクトを取得するために連鎖的にメソッドを呼び出す。

### 検出基準
- 3つ以上のドット演算子の連鎖
- 中間オブジェクトへの依存

### 例

```typescript
// ❌ Message Chains
const managerName = company.getDepartment().getManager().getName();

// または
const city = order
  .getCustomer()
  .getShippingAddress()
  .getCity();
```

### リファクタリング

```typescript
// ✅ 委譲メソッドを追加
class Order {
  getShippingCity(): string {
    return this.customer.getShippingCity();
  }
}

class Customer {
  getShippingCity(): string {
    return this.shippingAddress.city;
  }
}

// 使用
const city = order.getShippingCity();
```

---

## 検出スクリプト

```bash
# 長いメソッドを検出
grep -rn "function\|=>\|method" src/ --include="*.ts" -A 30 | \
  awk '/function|=>|method/{count=0} {count++; if(count>20) print}'

# 多くのパラメータを持つ関数
grep -rn "function.*(.*, .*, .*, " src/ --include="*.ts"

# 未使用のexport
npx ts-prune
```

## チェックリスト

- [ ] 20行を超えるメソッドがないか
- [ ] 4つ以上のパラメータを持つメソッドがないか
- [ ] booleanフラグで動作が分岐するメソッドがないか
- [ ] 使われていない機能・コードがないか
- [ ] メソッドチェーンが長くないか
