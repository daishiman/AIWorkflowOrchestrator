# Level 1: Modular Architecture Basics

## 概要

モジュラーアーキテクチャの基礎概念と原則を学習するレベル。高凝集・低結合の基本原理、モジュール分割の考え方、基本的な設計パターンを理解する。

## 1. モジュラーアーキテクチャとは

### 1.1 定義

モジュラーアーキテクチャは、システムを独立した機能単位（モジュール）に分割し、各モジュールが明確な責務を持ち、他のモジュールと疎結合な関係を維持する設計手法。

### 1.2 目的

- **保守性の向上**: 変更の影響範囲を局所化
- **再利用性の促進**: モジュールを他のシステムで再利用
- **テスト容易性**: 独立したテストが可能
- **並行開発**: チーム間の依存を最小化
- **スケーラビリティ**: モジュール単位でのスケーリング

## 2. 凝集性（Cohesion）

### 2.1 凝集性の定義

モジュール内の要素がどれだけ密接に関連しているかを示す指標。

### 2.2 凝集性のレベル（高い順）

1. **機能的凝集性（Functional Cohesion）**: 単一の明確な目的を持つ
   - 例: ユーザー認証モジュール
2. **シーケンシャル凝集性（Sequential Cohesion）**: 出力が次の入力になる
   - 例: データ読み込み → 加工 → 保存
3. **通信的凝集性（Communicational Cohesion）**: 同じデータを操作
   - 例: 顧客情報の読み取りと更新
4. **手続き的凝集性（Procedural Cohesion）**: 特定の順序で実行
   - 例: 初期化処理の一連の手順
5. **一時的凝集性（Temporal Cohesion）**: 同じタイミングで実行
   - 例: システム起動時の処理
6. **論理的凝集性（Logical Cohesion）**: 論理的に関連するが異なる処理
   - 例: 様々な入力検証を1つのモジュールに
7. **偶発的凝集性（Coincidental Cohesion）**: 関連性が低い（避けるべき）
   - 例: ユーティリティ関数の寄せ集め

**ベストプラクティス**: 機能的凝集性を目指す

## 3. 結合度（Coupling）

### 3.1 結合度の定義

モジュール間の依存関係の強さを示す指標。

### 3.2 結合度のレベル（低い順）

1. **データ結合（Data Coupling）**: 単純なデータを引数で渡す（推奨）
   - 例: `calculateTotal(items: Item[]): number`
2. **スタンプ結合（Stamp Coupling）**: データ構造を渡す
   - 例: オブジェクト全体を引数に
3. **制御結合（Control Coupling）**: 制御フラグを渡す
   - 例: `process(data, isDebugMode: boolean)`
4. **外部結合（External Coupling）**: 外部リソースを共有
   - 例: グローバル設定ファイル
5. **共通結合（Common Coupling）**: グローバル変数を共有
   - 例: グローバルステート
6. **内容結合（Content Coupling）**: 内部実装に直接アクセス（避けるべき）
   - 例: プライベートフィールドへのアクセス

**ベストプラクティス**: データ結合を目指す

## 4. モジュール分割の原則

### 4.1 単一責任の原則（SRP: Single Responsibility Principle）

各モジュールは1つの変更理由のみを持つべき。

```typescript
// Good: 責務が分離されている
class UserRepository {
  save(user: User): void {}
  findById(id: string): User {}
}

class UserValidator {
  validate(user: User): ValidationResult {}
}

// Bad: 複数の責務が混在
class UserManager {
  save(user: User): void {}
  validate(user: User): boolean {}
  sendEmail(user: User): void {}
}
```

### 4.2 情報隠蔽（Information Hiding）

モジュールの内部実装を外部から隠蔽し、公開インターフェースのみを提供。

```typescript
// Good: 内部実装が隠蔽されている
class OrderService {
  private calculateDiscount(order: Order): number {
    // 内部ロジック
  }

  public placeOrder(order: Order): void {
    const discount = this.calculateDiscount(order);
    // ...
  }
}
```

### 4.3 依存性逆転の原則（DIP: Dependency Inversion Principle）

抽象に依存し、具象に依存しない。

```typescript
// Good: インターフェースに依存
interface IEmailService {
  send(to: string, message: string): void;
}

class NotificationService {
  constructor(private emailService: IEmailService) {}

  notify(user: User): void {
    this.emailService.send(user.email, "Notification");
  }
}

// Bad: 具象クラスに直接依存
class NotificationService {
  private emailService = new SmtpEmailService();
}
```

## 5. 基本的なモジュール構造

### 5.1 レイヤーアーキテクチャ（基本）

```
Presentation Layer     (UI, Controllers)
      ↓
Application Layer      (Use Cases, Services)
      ↓
Domain Layer           (Business Logic, Entities)
      ↓
Infrastructure Layer   (Database, External APIs)
```

### 5.2 依存関係の方向

- 上位レイヤーは下位レイヤーに依存可能
- 下位レイヤーは上位レイヤーに依存してはならない
- Domain Layer は他のレイヤーに依存してはならない（独立性）

## 6. モジュール間の通信

### 6.1 直接呼び出し

```typescript
class OrderService {
  constructor(private inventoryService: InventoryService) {}

  placeOrder(order: Order): void {
    this.inventoryService.reserveItems(order.items);
  }
}
```

### 6.2 イベント駆動

```typescript
class OrderService {
  constructor(private eventBus: EventBus) {}

  placeOrder(order: Order): void {
    // 処理
    this.eventBus.publish(new OrderPlacedEvent(order));
  }
}

class InventoryService {
  constructor(eventBus: EventBus) {
    eventBus.subscribe(OrderPlacedEvent, this.handleOrderPlaced);
  }

  private handleOrderPlaced(event: OrderPlacedEvent): void {
    this.reserveItems(event.order.items);
  }
}
```

## 7. 実践例

### 7.1 モジュール境界の決定

システム: Eコマースプラットフォーム

**モジュール候補**:

1. **User Management**: ユーザー登録、認証、プロフィール管理
2. **Product Catalog**: 商品情報、カテゴリ、在庫
3. **Order Processing**: 注文、支払い、配送
4. **Inventory**: 在庫管理、補充
5. **Notification**: メール、プッシュ通知

**境界の妥当性チェック**:

- 各モジュールが単一のビジネス能力に対応しているか？ ✓
- モジュール間の依存関係が明確か？ ✓
- 独立してデプロイ可能か？ ✓

## 8. よくある落とし穴

### 8.1 神オブジェクト（God Object）

すべての責務を1つのモジュールに集約してしまうアンチパターン。

**対策**: 単一責任の原則に従い、責務を分割する。

### 8.2 循環依存

モジュールAがBに依存し、BがAに依存する状態。

```
OrderService → InventoryService
     ↑                ↓
     └────────────────┘
```

**対策**: インターフェースを導入し、依存性を逆転させる。

### 8.3 過度な汎用化

将来の変更を見越して過度に抽象化してしまう。

**対策**: YAGNI（You Aren't Gonna Need It）原則に従い、必要になったときに抽象化する。

## 9. 次のステップ

Level 1 をマスターしたら、次は以下を学習:

- **Level 2**: 高度な設計パターン、インターフェース設計
- **cohesion-principles.md**: 凝集性の詳細パターン
- **bounded-contexts.md**: ドメイン駆動設計の境界づけられたコンテキスト
