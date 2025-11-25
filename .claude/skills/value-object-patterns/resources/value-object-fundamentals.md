# 値オブジェクトの基礎

## 概要

値オブジェクト（Value Object）は、DDDの戦術的パターンの一つで、
識別子を持たず、属性の値によって等価性が判断される不変のオブジェクトです。

## 値オブジェクトの本質

### 特性

| 特性 | 説明 | 実装方法 |
|-----|------|---------|
| 不変性 | 一度作成したら変更できない | readonly属性、setter禁止 |
| 等価性 | 属性が同じなら同一とみなす | equals()メソッド実装 |
| 自己検証 | 不正な値を生成させない | ファクトリメソッドでバリデーション |
| 副作用なし | 操作は新しいインスタンスを返す | 内部状態を変更しない |

### エンティティとの比較

```typescript
// エンティティ：IDで識別
class Customer {
  constructor(
    private readonly id: CustomerId,
    private name: string
  ) {}

  // IDが同じなら同一のCustomer
  equals(other: Customer): boolean {
    return this.id.equals(other.id);
  }
}

// 値オブジェクト：属性で識別
class Money {
  constructor(
    private readonly amount: number,
    private readonly currency: string
  ) {}

  // 属性が全て同じなら同一のMoney
  equals(other: Money): boolean {
    return this.amount === other.amount
        && this.currency === other.currency;
  }
}
```

## 値オブジェクトの構造

### 基本構造

```typescript
class ValueObject {
  // 1. プライベートな読み取り専用属性
  private readonly attribute1: Type1;
  private readonly attribute2: Type2;

  // 2. プライベートコンストラクタ
  private constructor(attr1: Type1, attr2: Type2) {
    this.attribute1 = attr1;
    this.attribute2 = attr2;
  }

  // 3. ファクトリメソッド（バリデーション付き）
  static create(attr1: Type1, attr2: Type2): ValueObject {
    // バリデーション
    if (!this.isValid(attr1, attr2)) {
      throw new InvalidValueError();
    }
    return new ValueObject(attr1, attr2);
  }

  // 4. 等価性判定
  equals(other: ValueObject): boolean {
    return this.attribute1 === other.attribute1
        && this.attribute2 === other.attribute2;
  }

  // 5. ゲッター（読み取り専用アクセス）
  get value1(): Type1 {
    return this.attribute1;
  }

  // 6. ドメイン操作（新しいインスタンスを返す）
  withAttribute1(newValue: Type1): ValueObject {
    return new ValueObject(newValue, this.attribute2);
  }
}
```

## 値オブジェクトの分類

### 1. 単純値オブジェクト

単一の属性を持つ値オブジェクト。プリミティブ型のラッパー。

```typescript
// 金額
class Amount {
  private constructor(private readonly value: number) {}

  static of(value: number): Amount {
    if (value < 0) throw new NegativeAmountError();
    return new Amount(value);
  }

  add(other: Amount): Amount {
    return Amount.of(this.value + other.value);
  }

  equals(other: Amount): boolean {
    return this.value === other.value;
  }
}

// メールアドレス
class EmailAddress {
  private static readonly PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(private readonly value: string) {}

  static of(value: string): EmailAddress {
    if (!this.PATTERN.test(value)) {
      throw new InvalidEmailError(value);
    }
    return new EmailAddress(value.toLowerCase());
  }

  get localPart(): string {
    return this.value.split('@')[0];
  }

  get domain(): string {
    return this.value.split('@')[1];
  }
}
```

### 2. 複合値オブジェクト

複数の属性を持つ値オブジェクト。

```typescript
// 住所
class Address {
  private constructor(
    private readonly postalCode: PostalCode,
    private readonly prefecture: string,
    private readonly city: string,
    private readonly street: string,
    private readonly building: string | null
  ) {}

  static create(
    postalCode: string,
    prefecture: string,
    city: string,
    street: string,
    building?: string
  ): Address {
    return new Address(
      PostalCode.of(postalCode),
      prefecture,
      city,
      street,
      building ?? null
    );
  }

  get fullAddress(): string {
    const parts = [
      this.postalCode.toString(),
      this.prefecture,
      this.city,
      this.street,
    ];
    if (this.building) {
      parts.push(this.building);
    }
    return parts.join(' ');
  }

  equals(other: Address): boolean {
    return this.postalCode.equals(other.postalCode)
        && this.prefecture === other.prefecture
        && this.city === other.city
        && this.street === other.street
        && this.building === other.building;
  }
}

// 金額（通貨付き）
class Money {
  private constructor(
    private readonly amount: number,
    private readonly currency: Currency
  ) {}

  static of(amount: number, currency: Currency): Money {
    if (amount < 0) throw new NegativeAmountError();
    return new Money(amount, currency);
  }

  add(other: Money): Money {
    if (!this.currency.equals(other.currency)) {
      throw new CurrencyMismatchError();
    }
    return Money.of(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return Money.of(Math.round(this.amount * factor), this.currency);
  }
}
```

### 3. 範囲値オブジェクト

範囲を表す値オブジェクト。

```typescript
// 日付範囲
class DateRange {
  private constructor(
    private readonly start: Date,
    private readonly end: Date
  ) {}

  static create(start: Date, end: Date): DateRange {
    if (start > end) {
      throw new InvalidDateRangeError('開始日は終了日より前である必要があります');
    }
    return new DateRange(start, end);
  }

  contains(date: Date): boolean {
    return date >= this.start && date <= this.end;
  }

  overlaps(other: DateRange): boolean {
    return this.start <= other.end && this.end >= other.start;
  }

  get durationInDays(): number {
    const diffTime = this.end.getTime() - this.start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

// 数値範囲
class NumberRange {
  private constructor(
    private readonly min: number,
    private readonly max: number
  ) {}

  static create(min: number, max: number): NumberRange {
    if (min > max) {
      throw new InvalidRangeError('最小値は最大値以下である必要があります');
    }
    return new NumberRange(min, max);
  }

  contains(value: number): boolean {
    return value >= this.min && value <= this.max;
  }

  clamp(value: number): number {
    return Math.max(this.min, Math.min(this.max, value));
  }
}
```

### 4. 列挙値オブジェクト

固定の値セットを持つ値オブジェクト。

```typescript
// 通貨
class Currency {
  private static readonly instances = new Map<string, Currency>();

  static readonly JPY = Currency.of('JPY', '円', 0);
  static readonly USD = Currency.of('USD', 'ドル', 2);
  static readonly EUR = Currency.of('EUR', 'ユーロ', 2);

  private constructor(
    private readonly code: string,
    private readonly name: string,
    private readonly decimalPlaces: number
  ) {}

  private static of(code: string, name: string, decimalPlaces: number): Currency {
    const currency = new Currency(code, name, decimalPlaces);
    this.instances.set(code, currency);
    return currency;
  }

  static fromCode(code: string): Currency {
    const currency = this.instances.get(code);
    if (!currency) {
      throw new UnknownCurrencyError(code);
    }
    return currency;
  }

  equals(other: Currency): boolean {
    return this.code === other.code;
  }

  formatAmount(amount: number): string {
    return amount.toFixed(this.decimalPlaces) + ' ' + this.code;
  }
}
```

## 識別子としての値オブジェクト

エンティティの識別子も値オブジェクトとして実装することで型安全性を高めます。

```typescript
// 汎用的なID基底クラス
abstract class Identifier<T> {
  protected constructor(protected readonly value: T) {}

  equals(other: Identifier<T>): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return String(this.value);
  }
}

// 具体的なID
class CustomerId extends Identifier<string> {
  private constructor(value: string) {
    super(value);
  }

  static generate(): CustomerId {
    return new CustomerId(crypto.randomUUID());
  }

  static fromString(value: string): CustomerId {
    if (!value) throw new InvalidIdError('CustomerId');
    return new CustomerId(value);
  }
}

class OrderId extends Identifier<string> {
  private constructor(value: string) {
    super(value);
  }

  static generate(): OrderId {
    return new OrderId(crypto.randomUUID());
  }

  static fromString(value: string): OrderId {
    if (!value) throw new InvalidIdError('OrderId');
    return new OrderId(value);
  }
}

// 型安全な使用
function findCustomer(id: CustomerId): Customer { }
function findOrder(id: OrderId): Order { }

// コンパイルエラー：型が異なる
// findCustomer(OrderId.generate());  // ❌
// findOrder(CustomerId.generate());  // ❌
```

## 値オブジェクトの比較

### 等価性の実装

```typescript
class Point {
  constructor(
    private readonly x: number,
    private readonly y: number
  ) {}

  // 構造的等価性
  equals(other: Point): boolean {
    if (!(other instanceof Point)) {
      return false;
    }
    return this.x === other.x && this.y === other.y;
  }

  // ハッシュコード（MapやSetで使用する場合）
  hashCode(): number {
    return this.x * 31 + this.y;
  }
}
```

### コレクションでの使用

```typescript
// 値オブジェクトをキーにする場合
class ValueObjectMap<K extends { hashCode(): number; equals(other: K): boolean }, V> {
  private readonly map = new Map<number, Array<{ key: K; value: V }>>();

  set(key: K, value: V): void {
    const hash = key.hashCode();
    const bucket = this.map.get(hash) ?? [];
    const existing = bucket.find(item => item.key.equals(key));
    if (existing) {
      existing.value = value;
    } else {
      bucket.push({ key, value });
    }
    this.map.set(hash, bucket);
  }

  get(key: K): V | undefined {
    const hash = key.hashCode();
    const bucket = this.map.get(hash);
    return bucket?.find(item => item.key.equals(key))?.value;
  }
}
```

## チェックリスト

### 値オブジェクト設計チェック

- [ ] 識別子が不要であることを確認したか？
- [ ] すべての属性がreadonlyか？
- [ ] コンストラクタがprivateか？
- [ ] ファクトリメソッドでバリデーションしているか？
- [ ] equals()が正しく実装されているか？
- [ ] 変更操作が新しいインスタンスを返すか？
- [ ] ドメイン操作が適切に定義されているか？
