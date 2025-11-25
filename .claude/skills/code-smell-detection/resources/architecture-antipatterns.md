# アーキテクチャ・アンチパターン

## 1. Big Ball of Mud（泥だんご）

### 説明
構造や設計原則がなく、場当たり的に成長したシステム。

### 兆候
- 明確なレイヤー分離がない
- どこからでもどこでもアクセス可能
- 一貫性のない命名規則
- テストがない、または書きにくい

### 検出方法

```bash
# 依存関係の可視化で「スパゲッティ」を発見
madge src/ --image deps.svg

# 循環依存の数をカウント
madge src/ --circular | wc -l
```

### 対策
1. 境界の定義から始める
2. 段階的にモジュールを抽出
3. 依存関係のルールを設定
4. CI/CDで依存関係を検証

---

## 2. Anemic Domain Model（貧血ドメインモデル）

### 説明
データのみを持ち、振る舞いのないドメインオブジェクト。
ビジネスロジックがサービスレイヤーに散在。

### 兆候
- Entity/Modelがgetter/setterのみ
- Service層に複雑なロジックが集中
- ドメインオブジェクトが単なるDTO

### 例

```typescript
// ❌ Anemic Domain Model
class Order {
  public id: string;
  public items: OrderItem[];
  public status: string;
  public total: number;
}

class OrderService {
  calculateTotal(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  submit(order: Order): void {
    if (order.items.length === 0) {
      throw new Error('Empty order');
    }
    order.status = 'submitted';
    order.total = this.calculateTotal(order);
  }
}
```

### リファクタリング

```typescript
// ✅ Rich Domain Model
class Order {
  private readonly id: OrderId;
  private items: OrderItem[];
  private status: OrderStatus;

  submit(): void {
    this.ensureNotEmpty();
    this.status = OrderStatus.Submitted;
  }

  addItem(item: OrderItem): void {
    this.ensureDraft();
    this.items.push(item);
  }

  calculateTotal(): Money {
    return this.items.reduce(
      (sum, item) => sum.add(item.subtotal()),
      Money.zero()
    );
  }

  private ensureDraft(): void {
    if (this.status !== OrderStatus.Draft) {
      throw new DomainError('Cannot modify submitted order');
    }
  }

  private ensureNotEmpty(): void {
    if (this.items.length === 0) {
      throw new DomainError('Cannot submit empty order');
    }
  }
}
```

---

## 3. Distributed Monolith（分散モノリス）

### 説明
マイクロサービスの名を借りた、ネットワーク越しの密結合システム。

### 兆候
- サービス間で同期呼び出しが多い
- 1つのサービスの変更が他に波及
- すべてのサービスを同時にデプロイ
- 共有データベース

### 検出方法

```
質問チェック:
□ 各サービスを独立してデプロイできるか？
□ 1サービスがダウンしても他は動作するか？
□ サービスごとに独立したDB/スキーマを持つか？
□ 同期呼び出しのチェーンが3つ以上あるか？
```

### 対策
1. 同期→非同期への移行
2. イベント駆動アーキテクチャの採用
3. サービス境界の再定義
4. データの所有権の明確化

---

## 4. Golden Hammer（金の槌）

### 説明
慣れ親しんだ技術やパターンをすべての問題に適用しようとする。

### 兆候
- 「このフレームワークですべて解決」
- 問題に合わないパターンの強制
- 新技術の拒否または盲目的な採用

### 例

```typescript
// ❌ すべてをReduxで管理
// ローカル状態で十分なUIコンポーネントにもReduxを使用
const ToggleButton = () => {
  const isOn = useSelector(state => state.toggleButton.isOn);
  const dispatch = useDispatch();

  return (
    <button onClick={() => dispatch(toggleAction())}>
      {isOn ? 'ON' : 'OFF'}
    </button>
  );
};
```

### 対策

```typescript
// ✅ 問題に適した解決策を選択
// ローカル状態で十分ならuseStateを使用
const ToggleButton = () => {
  const [isOn, setIsOn] = useState(false);

  return (
    <button onClick={() => setIsOn(!isOn)}>
      {isOn ? 'ON' : 'OFF'}
    </button>
  );
};
```

---

## 5. Vendor Lock-in（ベンダーロックイン）

### 説明
特定のプラットフォームやフレームワークに過度に依存。

### 兆候
- フレームワーク固有のアノテーションが全体に散在
- ビジネスロジックがフレームワークAPIに依存
- 移行コストが非常に高い

### 例

```typescript
// ❌ フレームワーク依存
// ビジネスロジック内でNext.js固有のAPIを使用
export class OrderService {
  async createOrder(data: OrderData): Promise<Order> {
    // Next.js固有の環境変数
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;

    // Next.js固有のAPI呼び出し
    const res = await fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    // Next.js固有のルーティング
    redirect('/orders/success');
  }
}
```

### リファクタリング

```typescript
// ✅ 抽象化による分離
// ビジネスロジックはフレームワーク非依存
export class OrderService {
  constructor(
    private readonly apiClient: IApiClient,
    private readonly config: IConfig
  ) {}

  async createOrder(data: OrderData): Promise<Order> {
    const apiKey = this.config.getApiKey();
    return this.apiClient.post('/orders', data);
  }
}

// Next.js固有のコードはアダプターに分離
// adapters/next/config.ts
export class NextConfig implements IConfig {
  getApiKey(): string {
    return process.env.NEXT_PUBLIC_API_KEY!;
  }
}
```

---

## 6. Leaky Abstraction（漏れのある抽象化）

### 説明
抽象化が内部実装の詳細を隠しきれていない。

### 兆候
- 抽象化を使うのに実装詳細の知識が必要
- エラーメッセージが内部実装を露出
- パフォーマンス最適化に実装知識が必要

### 例

```typescript
// ❌ Leaky Abstraction
interface IUserRepository {
  findById(id: string): Promise<User>;
  // SQL知識が必要
  findByRawQuery(sql: string): Promise<User[]>;
  // Drizzle固有の型が露出
  getQueryBuilder(): DrizzleQuery;
}
```

### リファクタリング

```typescript
// ✅ 適切な抽象化
interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(criteria: UserSearchCriteria): Promise<User[]>;
  save(user: User): Promise<void>;
}

interface UserSearchCriteria {
  status?: UserStatus;
  createdAfter?: Date;
  limit?: number;
  offset?: number;
}
```

---

## 検出チェックリスト

### アーキテクチャ健全性チェック

- [ ] 明確なレイヤー/モジュール境界があるか
- [ ] ドメインモデルが振る舞いを持っているか
- [ ] サービス間の同期呼び出しが最小限か
- [ ] 技術選定が問題に適しているか
- [ ] フレームワークから独立したコアロジックか
- [ ] 抽象化が実装詳細を適切に隠しているか

### 改善優先度

1. **Critical**: 循環依存、分散モノリス
2. **High**: 貧血ドメインモデル、ベンダーロックイン
3. **Medium**: 金の槌、漏れのある抽象化
4. **Low**: 軽微な設計上の問題
