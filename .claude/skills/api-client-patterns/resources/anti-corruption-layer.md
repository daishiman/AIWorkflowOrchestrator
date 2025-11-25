# Anti-Corruption Layer (腐敗防止層)

## 概要

腐敗防止層（Anti-Corruption Layer, ACL）は、外部システムのドメインモデルや概念が内部システムに侵入することを防ぐ境界層です。
エリック・エヴァンスの『Domain-Driven Design』で提唱され、サム・ニューマンの『Building Microservices』で実践的なパターンとして発展しました。

## なぜ必要か

### 外部システムの「腐敗」とは

外部システムを統合する際、以下の問題が発生します：

1. **概念の侵入**: 外部システムの用語やモデルが内部コードに浸透
2. **依存の拡散**: 外部APIの変更が内部全体に波及
3. **モデルの歪み**: 内部ドメインモデルが外部の制約に縛られる

### ACLの目的

```
外部システムの世界観 ←─ ACL ─→ 内部ドメインの世界観
（外部ドメインモデル）    │      （内部ドメインモデル）
                         │
                    完全な分離
```

## いつ使うか

### 適用条件
- [ ] 外部システムのドメインモデルが内部と大きく異なる
- [ ] 外部システムが頻繁に変更される可能性がある
- [ ] 内部ドメインの純粋性を維持したい
- [ ] 外部の概念を内部用語に翻訳する必要がある

### 適用しない条件
- 外部システムと内部が同じドメインモデルを共有
- 一時的または使い捨ての統合
- ACLのオーバーヘッドが価値を上回る場合

## ACLの構成要素

```
┌─────────────────────────────────────────────────────────┐
│                Anti-Corruption Layer                     │
├─────────────────┬─────────────────┬─────────────────────┤
│                 │                 │                     │
│   Translator    │   Adapter       │   Facade            │
│  (概念の翻訳)   │  (形式の変換)   │  (複雑性の隠蔽)    │
│                 │                 │                     │
└─────────────────┴─────────────────┴─────────────────────┘
         │                 │                   │
         ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│                    External System                       │
└─────────────────────────────────────────────────────────┘
```

### 1. Translator（翻訳者）

外部ドメイン概念を内部ドメイン概念に翻訳します。

```typescript
// 外部の概念: "Subscriber" with "subscription_tier"
interface ExternalSubscriber {
  subscriber_id: string;
  subscription_tier: 'free' | 'basic' | 'premium' | 'enterprise';
  billing_status: 'active' | 'past_due' | 'canceled';
}

// 内部の概念: "User" with "membershipLevel"
interface User {
  id: string;
  membershipLevel: MembershipLevel;
  accountStatus: AccountStatus;
}

// Translator: 概念の翻訳
class SubscriberToUserTranslator {
  translate(subscriber: ExternalSubscriber): User {
    return {
      id: subscriber.subscriber_id,
      membershipLevel: this.translateTier(subscriber.subscription_tier),
      accountStatus: this.translateStatus(subscriber.billing_status),
    };
  }

  private translateTier(tier: string): MembershipLevel {
    const mapping: Record<string, MembershipLevel> = {
      'free': MembershipLevel.FREE,
      'basic': MembershipLevel.STANDARD,
      'premium': MembershipLevel.PREMIUM,
      'enterprise': MembershipLevel.ENTERPRISE,
    };
    return mapping[tier] ?? MembershipLevel.FREE;
  }

  private translateStatus(status: string): AccountStatus {
    const mapping: Record<string, AccountStatus> = {
      'active': AccountStatus.ACTIVE,
      'past_due': AccountStatus.SUSPENDED,
      'canceled': AccountStatus.INACTIVE,
    };
    return mapping[status] ?? AccountStatus.UNKNOWN;
  }
}
```

### 2. Adapter（アダプター）

外部APIのインターフェースを内部インターフェースに適合させます。

```typescript
// 内部が期待するインターフェース
interface UserRepository {
  findById(id: string): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
}

// ACL Adapter
class ExternalSubscriptionServiceAdapter implements UserRepository {
  constructor(
    private readonly client: ExternalApiClient,
    private readonly translator: SubscriberToUserTranslator,
  ) {}

  async findById(id: string): Promise<User> {
    const subscriber = await this.client.get(`/subscribers/${id}`);
    return this.translator.translate(subscriber);
  }

  async findByEmail(email: string): Promise<User | null> {
    const response = await this.client.get('/subscribers', { email });
    if (!response.data.length) return null;
    return this.translator.translate(response.data[0]);
  }
}
```

### 3. Facade（ファサード）

複数の外部システム操作を統合し、複雑さを隠蔽します。

```typescript
// 複数の外部サービスを統合するFacade
class MembershipFacade {
  constructor(
    private readonly subscriptionAdapter: ExternalSubscriptionServiceAdapter,
    private readonly billingAdapter: ExternalBillingServiceAdapter,
    private readonly usageAdapter: ExternalUsageServiceAdapter,
  ) {}

  async getMembershipDetails(userId: string): Promise<MembershipDetails> {
    const [user, billing, usage] = await Promise.all([
      this.subscriptionAdapter.findById(userId),
      this.billingAdapter.getCurrentPlan(userId),
      this.usageAdapter.getUsageStats(userId),
    ]);

    return {
      user,
      plan: billing.plan,
      usage: {
        apiCalls: usage.api_call_count,
        storageUsed: usage.storage_bytes,
      },
    };
  }
}
```

## 境界の設計

### 境界の位置決定

```
アプリケーション層
       │
       │ ← この境界でACLを配置
       ▼
┌─────────────────┐
│  ACL (Gateway)  │ ← 外部との唯一の接点
└─────────────────┘
       │
       ▼
 外部システム
```

### ディレクトリ構造

```
src/
├── domain/                    # 内部ドメイン（純粋）
│   ├── entities/
│   │   └── User.ts           # 内部User型
│   └── repositories/
│       └── UserRepository.ts  # 内部インターフェース
│
├── infrastructure/            # ACL層
│   └── external-subscription-service/
│       ├── client.ts          # HTTP クライアント
│       ├── types.ts           # 外部型定義
│       ├── translator.ts      # 概念翻訳
│       └── adapter.ts         # インターフェースアダプター
│
└── application/               # ユースケース
    └── GetUserMembership.ts   # ACLを通じて外部データを取得
```

## 双方向の変換

### 読み取り（External → Internal）

```typescript
class InboundTranslator {
  toUser(external: ExternalSubscriber): User {
    return {
      id: external.subscriber_id,
      email: external.email_address,
      membershipLevel: this.translateLevel(external.tier),
    };
  }
}
```

### 書き込み（Internal → External）

```typescript
class OutboundTranslator {
  toSubscriber(user: User): ExternalSubscriberUpdate {
    return {
      subscriber_id: user.id,
      email_address: user.email,
      tier: this.translateLevelToTier(user.membershipLevel),
    };
  }
}
```

## エラー処理

### 外部エラーの内部エラーへの変換

```typescript
class ErrorTranslator {
  translateError(externalError: ExternalApiError): DomainError {
    switch (externalError.code) {
      case 'SUBSCRIBER_NOT_FOUND':
        return new UserNotFoundError(externalError.message);
      case 'SUBSCRIPTION_EXPIRED':
        return new MembershipExpiredError(externalError.message);
      case 'PAYMENT_FAILED':
        return new PaymentError(externalError.message);
      default:
        return new ExternalServiceError('External service error');
    }
  }
}
```

## テスト戦略

### ACL層のテスト

```typescript
describe('SubscriberToUserTranslator', () => {
  it('should translate subscription tier to membership level', () => {
    const translator = new SubscriberToUserTranslator();

    const external: ExternalSubscriber = {
      subscriber_id: '123',
      subscription_tier: 'premium',
      billing_status: 'active',
    };

    const user = translator.translate(external);

    expect(user.membershipLevel).toBe(MembershipLevel.PREMIUM);
    expect(user.accountStatus).toBe(AccountStatus.ACTIVE);
  });

  it('should handle unknown tier gracefully', () => {
    const translator = new SubscriberToUserTranslator();

    const external = {
      subscriber_id: '123',
      subscription_tier: 'unknown_tier',
      billing_status: 'active',
    } as ExternalSubscriber;

    const user = translator.translate(external);

    expect(user.membershipLevel).toBe(MembershipLevel.FREE);
  });
});
```

## チェックリスト

### 設計時
- [ ] 外部概念と内部概念の対応表を作成したか？
- [ ] 境界の位置が明確に定義されているか？
- [ ] 内部ドメインが外部に依存していないか？

### 実装時
- [ ] Translatorで概念の翻訳が完結しているか？
- [ ] 外部の型が内部コードに漏れていないか？
- [ ] エラーも内部形式に変換されているか？

### 保守時
- [ ] 外部API変更時、ACL層のみの修正で済むか？
- [ ] 翻訳ルールが文書化されているか？
- [ ] テストカバレッジは十分か？

## アンチパターン

### ❌ 透過的なACL

```typescript
// NG: 外部の概念がそのまま内部に流れる
class BadAcl {
  getSubscriber(id: string): Promise<ExternalSubscriber> {
    return this.client.get(`/subscribers/${id}`);
  }
}
```

### ❌ 薄すぎるACL

```typescript
// NG: 型だけ変換して概念は変換しない
class ThinAcl {
  toUser(sub: ExternalSubscriber): User {
    return {
      id: sub.subscriber_id,
      subscriptionTier: sub.subscription_tier, // 概念がそのまま！
    };
  }
}
```

### ❌ ビジネスロジックを含むACL

```typescript
// NG: ACLがビジネスロジックを実行
class FatAcl {
  async processUpgrade(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (user.canUpgrade()) { // ← ビジネスロジック
      await this.externalApi.upgrade(userId);
    }
  }
}
```

## 参考文献

- **『Domain-Driven Design』** Eric Evans著
  - Chapter 14: Maintaining Model Integrity - Anti-Corruption Layer

- **『Building Microservices』** Sam Newman著
  - Chapter 4: Integration - Customer-Supplier Teams & ACL

- **『Implementing Domain-Driven Design』** Vaughn Vernon著
  - Chapter 13: Integrating Bounded Contexts
