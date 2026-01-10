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
  createUser() {
    /* ... */
  }
  updateUser() {
    /* ... */
  }
  deleteUser() {
    /* ... */
  }

  // 認証（別責務）
  login() {
    /* ... */
  }
  logout() {
    /* ... */
  }
  refreshToken() {
    /* ... */
  }

  // メール送信（別責務）
  sendWelcomeEmail() {
    /* ... */
  }
  sendPasswordResetEmail() {
    /* ... */
  }

  // 分析（別責務）
  trackUserActivity() {
    /* ... */
  }
  generateUserReport() {
    /* ... */
  }

  // 課金（別責務）
  processPayment() {
    /* ... */
  }
  handleSubscription() {
    /* ... */
  }
}
```

### リファクタリング

```typescript
// ✅ 責務を分割
class UserService {
  createUser() {
    /* ... */
  }
  updateUser() {
    /* ... */
  }
  deleteUser() {
    /* ... */
  }
}

class AuthService {
  login() {
    /* ... */
  }
  logout() {
    /* ... */
  }
  refreshToken() {
    /* ... */
  }
}

class EmailService {
  sendWelcomeEmail() {
    /* ... */
  }
  sendPasswordResetEmail() {
    /* ... */
  }
}

class AnalyticsService {
  trackUserActivity() {
    /* ... */
  }
  generateUserReport() {
    /* ... */
  }
}

class PaymentService {
  processPayment() {
    /* ... */
  }
  handleSubscription() {
    /* ... */
  }
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
    throw new Error("Empty order");
  }
  order.total = order.items.reduce((sum, item) => sum + item.price, 0);
  order.status = "processing";
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
    this.status = "draft";
  }

  addItem(item: OrderItem): void {
    this.items.push(item);
  }

  process(): void {
    if (this.items.length === 0) {
      throw new Error("Empty order");
    }
    this.status = "processing";
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

    if (membershipLevel === "premium") {
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
    if (this.membershipLevel === "premium") {
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
    items.forEach((item) => {
      item.markAsReported(); // 副作用！
    });
    return items.map((item) => `${item.name}: ${item.price}`).join("\n");
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
    return this.items.map((item) => ({
      name: item.name,
      price: item.price,
    }));
  }

  markAsReported(): void {
    this.items.forEach((item) => item.markAsReported());
  }
}

class OrderReport {
  generate(order: Order): string {
    const summary = order.getItemsSummary();
    order.markAsReported();
    return summary.map((item) => `${item.name}: ${item.price}`).join("\n");
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
    console.log("Flying...");
  }

  eat(): void {
    console.log("Eating...");
  }
}

class Penguin extends Bird {
  fly(): void {
    throw new Error("Penguins cannot fly"); // 拒否された遺産
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
  eat(): void {
    console.log("Eating...");
  }
  fly(): void {
    console.log("Flying...");
  }
}

class Penguin implements Eatable {
  eat(): void {
    console.log("Eating fish...");
  }
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

---

## 実装事例（2026-01-06追加）

### God Component検出とリファクタリング事例

search-replace-ui-implementation Phase 10で、EditorViewコンポーネントのGod Component問題を検出し改善した事例。

#### 検出された問題

EditorViewコンポーネント（713行）を分析した結果、以下のGod Componentの兆候を検出：

**定量的指標**:
- 総行数: 713行（閾値500行を超過）
- useState使用数: 12箇所（閾値10を超過）
- useEffect使用数: 6箇所（閾値5を超過）
- useRef使用数: 5箇所

**定性的指標**:
- 複数の異なる関心事が混在
  - エディタ表示とコンテンツ管理
  - 検索・置換機能
  - キーボードショートカット処理
  - ファイル操作（保存、読み込み）
- 単一責任の原則に違反

#### 検出したスメルの詳細

**God Component（主要スメル）**
- 症状: 1つのコンポーネントに複数の責務が集約
- 影響: 変更時の影響範囲が広く、テストが困難

**Long Method（付随スメル）**
- 対象: editorInstanceRefの初期化ロジック（80行）
- 症状: useRefとuseEffect内に位置計算、スクロール、置換処理が密集
- 影響: 可読性低下、部分的なテストが不可能

**Feature Envy（付随スメル）**
- 対象: workspaceSearchProvider実装部分
- 症状: EditorView内でIPC通信の詳細（リクエスト組み立て、レスポンス解析）を直接実装
- 影響: Electron APIへの依存がコンポーネント全体に波及

**Complex Conditional（付随スメル）**
- 対象: キーボードショートカット処理
- 症状: 6つの条件分岐（Cmd+F、Cmd+Shift+F、Cmd+P、F3、Escape等）が1つのuseEffect内に存在
- 影響: ショートカット追加時に既存ロジックへの影響確認が必要

#### 改善アプローチ

Extract Hookパターンを適用し、責務ごとにカスタムフックを抽出：

1. **useEditorInstance**: エディタ操作ロジックを抽出
   - 位置計算（calculateCharPosition、calculateLineColumn）
   - スクロール処理（scrollToLine）
   - 置換処理（replaceText、replaceAllText）

2. **useWorkspaceSearch**: IPC検索ロジックを抽出
   - Electron API呼び出しの詳細を隠蔽
   - AsyncGeneratorでストリーミング検索を提供

3. **useSearchKeyboardShortcuts**: ショートカット処理を抽出
   - キーイベントのハンドリング
   - モード切り替えロジック

#### 改善結果

- EditorView: 713行 → 495行（約30%削減）
- 各フックが独立してテスト可能に
- 新しいショートカット追加時はuseSearchKeyboardShortcutsのみ修正
- エディタ実装変更時はuseEditorInstanceのアダプターのみ差し替え

#### Reactコンポーネント向けGod Component検出基準

従来のクラス向け基準に加え、Reactコンポーネント固有の指標：

| 指標 | 閾値 | 説明 |
|------|------|------|
| useState数 | 10以上 | 状態管理が複雑化している兆候 |
| useEffect数 | 5以上 | 副作用処理が多すぎる兆候 |
| 総行数 | 500行以上 | クラス同様 |
| 関心事の数 | 3以上 | 異なる責務の混在 |
