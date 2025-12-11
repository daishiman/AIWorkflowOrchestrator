---
name: value-object-patterns
description: |
  ドメイン駆動設計における値オブジェクトの設計と実装パターンを専門とするスキル。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/value-object-patterns/resources/common-patterns.md`: Common Patternsリソース
  - `.claude/skills/value-object-patterns/resources/validation-strategies.md`: Validation Strategiesリソース
  - `.claude/skills/value-object-patterns/resources/value-object-fundamentals.md`: Value Object Fundamentalsリソース

  - `.claude/skills/value-object-patterns/templates/composite-value-object.ts`: Composite Value Objectテンプレート
  - `.claude/skills/value-object-patterns/templates/simple-value-object.ts`: Simple Value Objectテンプレート

  - `.claude/skills/value-object-patterns/scripts/detect-primitive-obsession.mjs`: Detect Primitive Obsessionスクリプト

version: 1.0.0
---

# Value Object Patterns

## 概要

このスキルは、DDD における値オブジェクト（Value Object）の設計と実装パターンを提供します。
値オブジェクトは、識別子を持たず、属性の等価性で識別される不変のドメイン概念です。

**主要な価値**:

- 型安全なドメインモデリング
- 不正な状態の排除
- ドメインロジックのカプセル化
- コードの表現力向上

**対象ユーザー**:

- ドメインモデルを設計するエージェント
- 型安全なコードを書きたい開発者
- DDD を実践するチーム

## リソース構造

```
value-object-patterns/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── value-object-fundamentals.md           # 値オブジェクトの基礎
│   ├── common-patterns.md                     # よく使うパターン集
│   └── validation-strategies.md               # バリデーション戦略
├── scripts/
│   └── detect-primitive-obsession.mjs         # プリミティブ偏愛の検出
└── templates/
    ├── simple-value-object.ts                 # 単純値オブジェクトテンプレート
    └── composite-value-object.ts              # 複合値オブジェクトテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# 値オブジェクトの基礎
cat .claude/skills/value-object-patterns/resources/value-object-fundamentals.md

# よく使うパターン集
cat .claude/skills/value-object-patterns/resources/common-patterns.md

# バリデーション戦略
cat .claude/skills/value-object-patterns/resources/validation-strategies.md
```

### スクリプト実行

```bash
# プリミティブ偏愛の検出
node .claude/skills/value-object-patterns/scripts/detect-primitive-obsession.mjs src/domain/
```

### テンプレート参照

```bash
# 単純値オブジェクトテンプレート
cat .claude/skills/value-object-patterns/templates/simple-value-object.ts

# 複合値オブジェクトテンプレート
cat .claude/skills/value-object-patterns/templates/composite-value-object.ts
```

## 核心概念

### 1. 値オブジェクトとは

**定義**: 識別子を持たず、属性の値によって等価性が判断される不変のオブジェクト

**特徴**:

- **不変性**: 一度作成したら変更できない
- **等価性**: 属性が同じなら同一とみなす
- **自己完結**: 自身のバリデーションを持つ
- **副作用なし**: メソッドは新しいインスタンスを返す

### 2. エンティティとの違い

| 観点           | エンティティ    | 値オブジェクト         |
| -------------- | --------------- | ---------------------- |
| 識別方法       | ID（識別子）    | 属性の値               |
| 可変性         | 変更可能        | 不変                   |
| ライフサイクル | 継続的に追跡    | 必要に応じて生成・破棄 |
| 例             | Customer, Order | Money, EmailAddress    |

### 3. 値オブジェクトの原則

**原則 1: 不変性**

```typescript
// ✅ 良い例：変更は新しいインスタンスを返す
class Money {
  add(other: Money): Money {
    return new Money(this.amount + other.amount, this.currency);
  }
}

// ❌ 悪い例：内部状態を変更
class Money {
  add(other: Money): void {
    this.amount += other.amount; // 状態変更
  }
}
```

**原則 2: 等価性**

```typescript
// 属性が同じなら等価
const money1 = Money.of(100, "JPY");
const money2 = Money.of(100, "JPY");
money1.equals(money2); // true
```

**原則 3: 自己検証**

```typescript
// 不正な値を生成段階で拒否
class EmailAddress {
  private constructor(private readonly value: string) {}

  static of(value: string): EmailAddress {
    if (!this.isValid(value)) {
      throw new InvalidEmailError(value);
    }
    return new EmailAddress(value);
  }
}
```

## ワークフロー

### Phase 1: 値オブジェクト候補の特定

**目的**: ドメインモデルで値オブジェクトにすべき概念を特定

**判断基準**:

- [ ] 識別子（ID）が不要か？
- [ ] 属性の組み合わせで等価性を判断できるか？
- [ ] 不変であるべきか？
- [ ] ドメイン固有のバリデーションがあるか？

**一般的な候補**:

- 金額（Money）
- メールアドレス（EmailAddress）
- 住所（Address）
- 日付範囲（DateRange）
- 座標（Coordinates）
- 電話番号（PhoneNumber）

### Phase 2: 設計

**目的**: 値オブジェクトの構造と振る舞いを定義

**設計要素**:

1. 属性の決定
2. 生成方法（ファクトリメソッド）
3. バリデーションルール
4. 等価性判定
5. ドメイン操作

**設計テンプレート**:

```
値オブジェクト名: [名前]
属性:
  - [属性1]: [型]
  - [属性2]: [型]
バリデーション:
  - [ルール1]
  - [ルール2]
操作:
  - [メソッド1]: [説明]
  - [メソッド2]: [説明]
```

### Phase 3: 実装

**目的**: 設計に基づいて値オブジェクトを実装

**実装ステップ**:

1. クラス定義（private コンストラクタ）
2. ファクトリメソッド実装
3. バリデーション実装
4. equals()メソッド実装
5. ドメイン操作実装
6. 文字列表現（toString）

**実装チェックリスト**:

- [ ] コンストラクタが private か？
- [ ] すべての属性が readonly か？
- [ ] バリデーションがファクトリメソッドにあるか？
- [ ] equals()が正しく実装されているか？
- [ ] 変更操作が新しいインスタンスを返すか？

### Phase 4: テスト

**目的**: 値オブジェクトの正確性を検証

**テスト観点**:

- 正常値での生成
- 異常値での拒否
- 等価性判定
- 不変性の保証
- ドメイン操作の正確性

## いつ使うか

### シナリオ 1: プリミティブ型の置き換え

**状況**: string や number がドメイン概念を表している

**適用条件**:

- [ ] 特定のフォーマットがある（例：メールアドレス）
- [ ] 範囲制限がある（例：0 以上の金額）
- [ ] ドメイン操作がある（例：金額の加算）

**期待される成果**: 型安全なドメイン表現

### シナリオ 2: 複数属性の集約

**状況**: 複数の値が常にセットで使用される

**適用条件**:

- [ ] 値が意味的にまとまっている
- [ ] 個別に使用することがない
- [ ] まとめてバリデーションが必要

**期待される成果**: 凝集度の高いドメインモデル

### シナリオ 3: ドメインロジックのカプセル化

**状況**: プリミティブ型に対するロジックが散在している

**適用条件**:

- [ ] 同じバリデーションが複数箇所にある
- [ ] 同じ計算ロジックが重複している
- [ ] フォーマット変換が散在している

**期待される成果**: DRY なドメインロジック

## ベストプラクティス

### すべきこと

1. **常に不変に設計**:
   - すべての属性を readonly に
   - 変更は新しいインスタンスを返す
   - setter を作らない

2. **生成時にバリデーション**:
   - 不正な値はそもそも生成させない
   - ファクトリメソッドでバリデーション
   - 「常に有効」な状態を保証

3. **ドメイン操作を提供**:
   - 単なるデータホルダーにしない
   - ドメインの振る舞いをカプセル化
   - 意味のあるメソッド名を使用

### 避けるべきこと

1. **可変な値オブジェクト**:
   - ❌ setter の提供
   - ❌ 内部状態の変更
   - ✅ 新しいインスタンスを返す

2. **プリミティブ偏愛**:
   - ❌ `userId: string` を使い続ける
   - ❌ バリデーションを呼び出し側に任せる
   - ✅ `UserId` 値オブジェクトを作成

3. **過度な複雑化**:
   - ❌ 単純な値に過度なロジック
   - ❌ 本来エンティティにすべきものを値オブジェクトに
   - ✅ 適切な粒度で設計

## トラブルシューティング

### 問題 1: 値オブジェクトかエンティティか迷う

**症状**: 概念をどちらで表現すべきか不明

**判断基準**:

1. ライフサイクルを追跡する必要があるか？ → エンティティ
2. 同じ属性値なら区別不要か？ → 値オブジェクト
3. 変更履歴を管理するか？ → エンティティ

### 問題 2: 値オブジェクトが大きくなりすぎる

**症状**: 多くの属性と操作を持つ値オブジェクト

**原因**: 複数の概念が混在

**解決策**:

1. 概念を分離して複数の値オブジェクトに
2. 関連する値オブジェクトは複合値オブジェクトで組み合わせ
3. 一部をエンティティに昇格させる検討

### 問題 3: パフォーマンス懸念

**症状**: 値オブジェクト生成のオーバーヘッド

**対策**:

1. 不変なので安全にキャッシュ可能
2. 頻繁に使う値はシングルトン化
3. 大量のインスタンス生成はプーリング

## 関連スキル

- **domain-driven-design** (`.claude/skills/domain-driven-design/SKILL.md`): DDD の戦術的パターン
- **ubiquitous-language** (`.claude/skills/ubiquitous-language/SKILL.md`): ドメイン用語と命名
- **domain-services** (`.claude/skills/domain-services/SKILL.md`): ドメインサービスとの組み合わせ

## 参考文献

- **『エリック・エヴァンスのドメイン駆動設計』**
  - 第 5 章: ソフトウェアで表現されたモデル（値オブジェクト）

- **『実践ドメイン駆動設計』**
  - 第 6 章: 値オブジェクト

## 変更履歴

| バージョン | 日付       | 変更内容                                      |
| ---------- | ---------- | --------------------------------------------- |
| 1.0.0      | 2025-11-25 | 初版作成 - 値オブジェクトの設計と実装パターン |
