---
name: domain-services
description: |
  ドメイン駆動設計におけるドメインサービスの設計と実装を専門とするスキル。
  エンティティや値オブジェクトに属さないドメインロジックを適切にモデル化します。

  専門分野:
  - サービスの識別: ドメインサービスが必要な場面の判断
  - 設計パターン: ステートレスサービス、計算サービス、ポリシーサービス
  - 実装技法: 依存性注入、インターフェース分離
  - レイヤー配置: ドメインサービスとアプリケーションサービスの区別

  使用タイミング:
  - エンティティに属さないドメインロジックがある時
  - 複数の集約をまたがる操作が必要な時
  - ドメインポリシーや計算ロジックを実装する時
  - サービスの責務を明確にしたい時

  Use proactively when implementing domain logic that doesn't belong to entities,
  coordinating multiple aggregates, or implementing domain policies.
version: 1.0.0
---

# Domain Services

## 概要

このスキルは、DDDにおけるドメインサービス（Domain Service）の設計と実装パターンを提供します。
ドメインサービスは、エンティティや値オブジェクトに自然に属さないドメインロジックをカプセル化します。

**主要な価値**:
- 適切な責務の分離
- ドメインロジックの明示的な表現
- テスト容易性の向上
- 再利用可能なドメイン操作

**対象ユーザー**:
- ドメインモデルを設計するエージェント
- ビジネスロジックの配置に迷う開発者
- DDDを実践するチーム

## リソース構造

```
domain-services/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── when-to-use-domain-services.md         # ドメインサービスの使いどころ
│   ├── service-patterns.md                    # サービスパターン集
│   └── service-vs-application.md              # ドメインサービスとアプリケーションサービスの違い
├── scripts/
│   └── analyze-service-responsibilities.mjs   # サービス責務分析スクリプト
└── templates/
    └── domain-service-template.ts             # ドメインサービステンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# ドメインサービスの使いどころ
cat .claude/skills/domain-services/resources/when-to-use-domain-services.md

# サービスパターン集
cat .claude/skills/domain-services/resources/service-patterns.md

# ドメインサービスとアプリケーションサービスの違い
cat .claude/skills/domain-services/resources/service-vs-application.md
```

### スクリプト実行

```bash
# サービス責務分析
node .claude/skills/domain-services/scripts/analyze-service-responsibilities.mjs src/domain/services/
```

### テンプレート参照

```bash
# ドメインサービステンプレート
cat .claude/skills/domain-services/templates/domain-service-template.ts
```

## 核心概念

### 1. ドメインサービスとは

**定義**: エンティティや値オブジェクトに自然に属さないドメインロジックをカプセル化するステートレスなオブジェクト

**特徴**:
- **ステートレス**: 状態を持たない
- **ドメイン操作**: ビジネスロジックを実行
- **ユビキタス言語**: ドメインの動詞を表現
- **純粋なドメイン層**: インフラストラクチャに依存しない

### 2. ドメインサービスが必要な場面

| 場面 | 説明 | 例 |
|-----|------|-----|
| 複数エンティティの操作 | 1つのエンティティに属さない操作 | 送金（口座間の移動） |
| 外部ポリシーの適用 | ビジネスルールの適用 | 価格計算、税金計算 |
| 計算ロジック | 複雑な計算 | 配送料計算、割引計算 |
| 変換処理 | ドメイン間の変換 | DTO変換、フォーマット変換 |

### 3. ドメインサービスの原則

**原則1: ステートレス**
```typescript
// ✅ 良い例：状態を持たない
class PricingService {
  calculatePrice(order: Order, customer: Customer): Money {
    // 計算ロジック
  }
}

// ❌ 悪い例：状態を持つ
class PricingService {
  private lastCalculatedPrice: Money;  // 状態を持っている

  calculatePrice(order: Order): Money {
    this.lastCalculatedPrice = /* 計算 */;
    return this.lastCalculatedPrice;
  }
}
```

**原則2: ドメイン層に配置**
```typescript
// ドメインサービスはドメイン層に配置
// src/domain/services/PricingService.ts

// インフラストラクチャに依存しない
class PricingService {
  // ❌ データベースに直接アクセスしない
  // ❌ 外部APIを直接呼ばない
  // ✅ ドメインオブジェクトのみを操作
}
```

**原則3: ユビキタス言語を使用**
```typescript
// ✅ 良い例：ドメインの動詞を使用
class TransferService {
  transfer(from: Account, to: Account, amount: Money): void { }
}

// ❌ 悪い例：技術的な名前
class AccountProcessor {
  processTransaction(/* ... */): void { }
}
```

## ワークフロー

### Phase 1: サービスの必要性判断

**目的**: ドメインサービスが必要かどうかを判断

**判断基準**:
- [ ] この操作は特定のエンティティに属するか？ → エンティティのメソッド
- [ ] 複数のエンティティをまたがるか？ → ドメインサービス候補
- [ ] ビジネスポリシーを表現しているか？ → ドメインサービス候補
- [ ] 外部システムとの連携が必要か？ → アプリケーションサービス

**フローチャート**:
```
操作が必要
    ↓
特定のエンティティに属する？
    ├── Yes → エンティティのメソッドとして実装
    └── No → 複数の集約をまたがる？
              ├── Yes → ドメインサービス
              └── No → 純粋な計算/ポリシー？
                        ├── Yes → ドメインサービス
                        └── No → アプリケーションサービス
```

### Phase 2: インターフェース設計

**目的**: サービスのインターフェースを定義

**設計要素**:
1. メソッド名（ドメインの動詞）
2. パラメータ（ドメインオブジェクト）
3. 戻り値（ドメインオブジェクトまたは値オブジェクト）
4. 例外（ドメイン例外）

**設計テンプレート**:
```typescript
interface I{{ServiceName}}Service {
  /**
   * [操作の説明]
   *
   * @param [パラメータ説明]
   * @returns [戻り値説明]
   * @throws [例外説明]
   */
  {{operationName}}(/* params */): ResultType;
}
```

### Phase 3: 実装

**目的**: ドメインサービスを実装

**実装チェックリスト**:
- [ ] ステートレスか？
- [ ] ドメインオブジェクトのみを操作しているか？
- [ ] インフラストラクチャに依存していないか？
- [ ] テスト可能か？

### Phase 4: テスト

**目的**: ドメインサービスの正確性を検証

**テスト観点**:
- ビジネスルールの正確性
- 境界値のテスト
- エラーケースのテスト
- 依存のモック化

## いつ使うか

### シナリオ1: 送金処理

**状況**: 口座間で資金を移動する

**分析**:
- `withdraw()` は Account のメソッド
- `deposit()` は Account のメソッド
- でも「送金」という操作は1つの Account に属さない

**解決策**: TransferService

```typescript
class TransferService {
  transfer(from: Account, to: Account, amount: Money): void {
    from.withdraw(amount);
    to.deposit(amount);
  }
}
```

### シナリオ2: 価格計算

**状況**: 顧客ランクに応じた割引価格を計算

**分析**:
- 計算ロジックは Order にも Customer にも属さない
- ビジネスポリシーとして独立している

**解決策**: PricingService

```typescript
class PricingService {
  calculatePrice(
    order: Order,
    customer: Customer,
    campaign?: Campaign
  ): Money {
    let price = order.subtotal;

    // 顧客ランク割引
    const customerDiscount = this.getCustomerDiscount(customer);
    price = price.multiply(1 - customerDiscount.toDecimal());

    // キャンペーン割引
    if (campaign && campaign.isApplicable(order)) {
      price = campaign.applyDiscount(price);
    }

    return price;
  }
}
```

### シナリオ3: 重複チェック

**状況**: メールアドレスの重複を確認

**分析**:
- リポジトリアクセスが必要 → ドメインサービスではない
- でもドメインルールとして重要

**解決策**: アプリケーションサービス + ドメイン仕様

```typescript
// ドメイン層：仕様
class UniqueEmailSpecification {
  constructor(private readonly existingEmails: EmailAddress[]) {}

  isSatisfiedBy(email: EmailAddress): boolean {
    return !this.existingEmails.some(e => e.equals(email));
  }
}

// アプリケーション層：サービス
class UserRegistrationService {
  async register(email: string): Promise<User> {
    const existingEmails = await this.userRepository.getAllEmails();
    const spec = new UniqueEmailSpecification(existingEmails);

    const emailAddress = EmailAddress.of(email);
    if (!spec.isSatisfiedBy(emailAddress)) {
      throw new EmailAlreadyExistsError();
    }

    return this.userRepository.save(User.create(emailAddress));
  }
}
```

## ベストプラクティス

### すべきこと

1. **命名にドメイン用語を使用**:
   - TransferService（送金サービス）
   - PricingService（価格算出サービス）
   - ShippingCostCalculator（配送料計算）

2. **依存性注入を使用**:
   - テスト容易性の向上
   - 実装の切り替えが容易

3. **インターフェースを定義**:
   - 抽象に依存
   - モック化が容易

### 避けるべきこと

1. **状態を持つサービス**:
   - ❌ メンバー変数で状態を保持
   - ✅ すべてパラメータで受け取る

2. **インフラストラクチャへの依存**:
   - ❌ データベースに直接アクセス
   - ❌ 外部APIを直接呼び出し
   - ✅ リポジトリインターフェース経由（アプリケーション層で注入）

3. **過度なサービス化**:
   - ❌ すべてのロジックをサービスに
   - ✅ エンティティに属するロジックはエンティティに

## トラブルシューティング

### 問題1: ドメインサービスかアプリケーションサービスか迷う

**判断基準**:
- ドメインサービス：純粋なビジネスロジック
- アプリケーションサービス：ユースケースの調整、インフラ連携

### 問題2: サービスが大きくなりすぎる

**原因**: 複数の責務が混在

**解決策**:
1. 責務ごとにサービスを分割
2. 共通ロジックは別のサービスに抽出
3. ポリシーオブジェクトを使用

### 問題3: テストが難しい

**原因**: 依存が多い、状態を持っている

**解決策**:
1. 依存性注入を使用
2. インターフェースに依存
3. ステートレスに設計

## 関連スキル

- **domain-driven-design** (`.claude/skills/domain-driven-design/SKILL.md`): DDDの戦術的パターン
- **value-object-patterns** (`.claude/skills/value-object-patterns/SKILL.md`): 値オブジェクトの設計
- **bounded-context** (`.claude/skills/bounded-context/SKILL.md`): コンテキスト境界の定義

## 参考文献

- **『エリック・エヴァンスのドメイン駆動設計』**
  - 第5章: ソフトウェアで表現されたモデル（サービス）

- **『実践ドメイン駆動設計』**
  - 第7章: サービス

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版作成 - ドメインサービスの設計と実装 |
