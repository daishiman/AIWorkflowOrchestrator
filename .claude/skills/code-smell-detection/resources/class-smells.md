# クラス関連のコードスメル

## 1. God Class（神クラス）

### 説明
あまりにも多くの責務を持つ大規模なクラス。

### 検出基準
- 500行以上のコード
- 20以上のメソッド
- 10以上のフィールド
- 複数の異なる責務を担当

### 例

```typescript
// ❌ God Class
class UserManager {
  // ユーザー管理
  createUser() { /* ... */ }
  updateUser() { /* ... */ }
  deleteUser() { /* ... */ }

  // 認証（別責務）
  login() { /* ... */ }
  logout() { /* ... */ }
  refreshToken() { /* ... */ }

  // メール送信（別責務）
  sendWelcomeEmail() { /* ... */ }
  sendPasswordResetEmail() { /* ... */ }

  // 分析（別責務）
  trackUserActivity() { /* ... */ }
  generateUserReport() { /* ... */ }

  // 課金（別責務）
  processPayment() { /* ... */ }
  handleSubscription() { /* ... */ }
}
```

### リファクタリング

```typescript
// ✅ 責務を分割
class UserService {
  createUser() { /* ... */ }
  updateUser() { /* ... */ }
  deleteUser() { /* ... */ }
}

class AuthService {
  login() { /* ... */ }
  logout() { /* ... */ }
  refreshToken() { /* ... */ }
}

class EmailService {
  sendWelcomeEmail() { /* ... */ }
  sendPasswordResetEmail() { /* ... */ }
}

class AnalyticsService {
  trackUserActivity() { /* ... */ }
  generateUserReport() { /* ... */ }
}

class PaymentService {
  processPayment() { /* ... */ }
  handleSubscription() { /* ... */ }
}
```

---

## 2. Data Class（データクラス）

### 説明
データのみを保持し、ほとんど振る舞いを持たないクラス。

### 検出基準
- getter/setterのみ
- ビジネスロジックがない
- 外部から頻繁に操作される

### 例

```typescript
// ❌ Data Class（貧血モデル）
class Order {
  public customerId: string;
  public items: OrderItem[];
  public status: string;
  public total: number;
}

// 外部でロジックを実行
function processOrder(order: Order) {
  if (order.items.length === 0) {
    throw new Error('Empty order');
  }
  order.total = order.items.reduce((sum, item) => sum + item.price, 0);
  order.status = 'processing';
}
```

### リファクタリング

```typescript
// ✅ リッチドメインモデル
class Order {
  private readonly customerId: string;
  private items: OrderItem[];
  private status: OrderStatus;

  constructor(customerId: string) {
    this.customerId = customerId;
    this.items = [];
    this.status = 'draft';
  }

  addItem(item: OrderItem): void {
    this.items.push(item);
  }

  process(): void {
    if (this.items.length === 0) {
      throw new Error('Empty order');
    }
    this.status = 'processing';
  }

  calculateTotal(): number {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }
}
```

---

## 3. Feature Envy（機能の嫉妬）

### 説明
自クラスよりも他クラスのデータに多くアクセスするメソッド。

### 検出基準
- 他オブジェクトのgetter呼び出しが3回以上
- 自クラスのメンバーへのアクセスが少ない

### 例

```typescript
// ❌ Feature Envy
class Order {
  calculateShipping(customer: Customer): number {
    // customerの情報に依存しすぎ
    const address = customer.getAddress();
    const membershipLevel = customer.getMembershipLevel();
    const orderHistory = customer.getOrderHistory();

    if (membershipLevel === 'premium') {
      return 0; // 無料配送
    }

    if (address.isRemote()) {
      return 15;
    }

    if (orderHistory.totalOrders() > 10) {
      return 3;
    }

    return 5;
  }
}
```

### リファクタリング

```typescript
// ✅ メソッドを適切なクラスに移動
class Customer {
  calculateShippingCost(baseRate: number): number {
    if (this.membershipLevel === 'premium') {
      return 0;
    }

    if (this.address.isRemote()) {
      return baseRate * 3;
    }

    if (this.orderHistory.totalOrders() > 10) {
      return baseRate * 0.6;
    }

    return baseRate;
  }
}

class Order {
  calculateShipping(customer: Customer): number {
    const baseRate = 5;
    return customer.calculateShippingCost(baseRate);
  }
}
```

---

## 4. Inappropriate Intimacy（不適切な親密さ）

### 説明
クラスが他クラスの内部実装に過度に依存している状態。

### 検出基準
- privateメンバーへの直接アクセス（リフレクション等）
- 内部構造の知識に依存
- 双方向の強い結合

### 例

```typescript
// ❌ Inappropriate Intimacy
class Order {
  private items: OrderItem[] = [];

  // Reportが内部構造を知っている
  getItems(): OrderItem[] {
    return this.items; // 内部配列を直接公開
  }
}

class OrderReport {
  generate(order: Order): string {
    const items = order.getItems();
    // 内部構造に依存した操作
    items.forEach(item => {
      item.markAsReported(); // 副作用！
    });
    return items.map(item => `${item.name}: ${item.price}`).join('\n');
  }
}
```

### リファクタリング

```typescript
// ✅ 公開APIを通じた操作
class Order {
  private items: OrderItem[] = [];

  // 内部状態を保護
  getItemsSummary(): ReadonlyArray<{ name: string; price: number }> {
    return this.items.map(item => ({
      name: item.name,
      price: item.price
    }));
  }

  markAsReported(): void {
    this.items.forEach(item => item.markAsReported());
  }
}

class OrderReport {
  generate(order: Order): string {
    const summary = order.getItemsSummary();
    order.markAsReported();
    return summary.map(item => `${item.name}: ${item.price}`).join('\n');
  }
}
```

---

## 5. Refused Bequest（拒否された遺産）

### 説明
継承したメソッドやプロパティを使用しない・オーバーライドして空実装にする。

### 検出基準
- 継承したメソッドの空実装
- 継承したメソッドで例外をスロー
- 親クラスの機能をほとんど使用しない

### 例

```typescript
// ❌ Refused Bequest
class Bird {
  fly(): void {
    console.log('Flying...');
  }

  eat(): void {
    console.log('Eating...');
  }
}

class Penguin extends Bird {
  fly(): void {
    throw new Error('Penguins cannot fly'); // 拒否された遺産
  }
}
```

### リファクタリング

```typescript
// ✅ インターフェース分離
interface Eatable {
  eat(): void;
}

interface Flyable {
  fly(): void;
}

class Sparrow implements Eatable, Flyable {
  eat(): void { console.log('Eating...'); }
  fly(): void { console.log('Flying...'); }
}

class Penguin implements Eatable {
  eat(): void { console.log('Eating fish...'); }
  // flyは実装不要
}
```

---

## 検出スクリプト

```bash
# 大きなクラスを検出
find src -name "*.ts" -exec wc -l {} \; | sort -rn | head -20

# getter/setterのみのクラスを検出
grep -rn "class.*{" src/ --include="*.ts" -A 50 | \
  grep -E "get |set " | wc -l
```

## チェックリスト

- [ ] 500行を超えるクラスがないか
- [ ] データのみを持つクラスがないか
- [ ] 他クラスのデータに過度に依存するメソッドがないか
- [ ] 内部実装に依存した密結合がないか
- [ ] 継承した機能を拒否していないか
