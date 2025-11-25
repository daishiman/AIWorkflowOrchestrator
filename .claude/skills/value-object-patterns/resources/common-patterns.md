# よく使う値オブジェクトパターン

## 概要

実際のプロジェクトでよく使用される値オブジェクトのパターン集です。
これらのパターンを参考に、プロジェクト固有の値オブジェクトを設計してください。

## 識別子パターン

### UserId / CustomerId / OrderId

```typescript
class UserId {
  private constructor(private readonly value: string) {}

  static generate(): UserId {
    return new UserId(crypto.randomUUID());
  }

  static fromString(value: string): UserId {
    if (!value || value.trim().length === 0) {
      throw new InvalidUserIdError('UserIdは空にできません');
    }
    return new UserId(value);
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
```

### 連番ID

```typescript
class SequenceId {
  private constructor(
    private readonly prefix: string,
    private readonly sequence: number
  ) {}

  static of(prefix: string, sequence: number): SequenceId {
    if (sequence < 1) {
      throw new InvalidSequenceError('連番は1以上である必要があります');
    }
    return new SequenceId(prefix, sequence);
  }

  static fromString(value: string): SequenceId {
    const match = value.match(/^([A-Z]+)-(\d+)$/);
    if (!match) {
      throw new InvalidSequenceIdFormatError(value);
    }
    return new SequenceId(match[1], parseInt(match[2], 10));
  }

  next(): SequenceId {
    return new SequenceId(this.prefix, this.sequence + 1);
  }

  toString(): string {
    return `${this.prefix}-${String(this.sequence).padStart(6, '0')}`;
  }
}
```

## 連絡先パターン

### EmailAddress

```typescript
class EmailAddress {
  private static readonly PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  private constructor(private readonly value: string) {}

  static of(value: string): EmailAddress {
    const normalized = value.trim().toLowerCase();
    if (!this.PATTERN.test(normalized)) {
      throw new InvalidEmailError(value);
    }
    return new EmailAddress(normalized);
  }

  get localPart(): string {
    return this.value.split('@')[0];
  }

  get domain(): string {
    return this.value.split('@')[1];
  }

  equals(other: EmailAddress): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
```

### PhoneNumber（日本向け）

```typescript
class JapanesePhoneNumber {
  private static readonly PATTERNS = {
    mobile: /^0[789]0-?\d{4}-?\d{4}$/,
    landline: /^0\d{1,4}-?\d{1,4}-?\d{4}$/,
  };

  private constructor(
    private readonly value: string,
    private readonly type: 'mobile' | 'landline'
  ) {}

  static of(value: string): JapanesePhoneNumber {
    const normalized = value.replace(/[-\s]/g, '');

    if (this.PATTERNS.mobile.test(value)) {
      return new JapanesePhoneNumber(normalized, 'mobile');
    }
    if (this.PATTERNS.landline.test(value)) {
      return new JapanesePhoneNumber(normalized, 'landline');
    }
    throw new InvalidPhoneNumberError(value);
  }

  get isMobile(): boolean {
    return this.type === 'mobile';
  }

  format(): string {
    if (this.type === 'mobile') {
      return `${this.value.slice(0, 3)}-${this.value.slice(3, 7)}-${this.value.slice(7)}`;
    }
    // 固定電話のフォーマットは地域により異なる（簡略化）
    return this.value;
  }

  equals(other: JapanesePhoneNumber): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.format();
  }
}
```

## 住所パターン

### PostalCode（日本向け）

```typescript
class JapanesePostalCode {
  private static readonly PATTERN = /^\d{3}-?\d{4}$/;

  private constructor(private readonly value: string) {}

  static of(value: string): JapanesePostalCode {
    const normalized = value.replace(/-/g, '');
    if (!this.PATTERN.test(value) || normalized.length !== 7) {
      throw new InvalidPostalCodeError(value);
    }
    return new JapanesePostalCode(normalized);
  }

  format(): string {
    return `${this.value.slice(0, 3)}-${this.value.slice(3)}`;
  }

  equals(other: JapanesePostalCode): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.format();
  }
}
```

### Address

```typescript
class Address {
  private constructor(
    private readonly postalCode: JapanesePostalCode,
    private readonly prefecture: Prefecture,
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
    if (!city || city.trim().length === 0) {
      throw new InvalidAddressError('市区町村は必須です');
    }
    if (!street || street.trim().length === 0) {
      throw new InvalidAddressError('番地は必須です');
    }

    return new Address(
      JapanesePostalCode.of(postalCode),
      Prefecture.fromName(prefecture),
      city.trim(),
      street.trim(),
      building?.trim() || null
    );
  }

  get fullAddress(): string {
    const parts = [
      `〒${this.postalCode.format()}`,
      this.prefecture.name,
      this.city,
      this.street,
    ];
    if (this.building) {
      parts.push(this.building);
    }
    return parts.join(' ');
  }

  withBuilding(building: string): Address {
    return new Address(
      this.postalCode,
      this.prefecture,
      this.city,
      this.street,
      building
    );
  }

  equals(other: Address): boolean {
    return this.postalCode.equals(other.postalCode)
        && this.prefecture.equals(other.prefecture)
        && this.city === other.city
        && this.street === other.street
        && this.building === other.building;
  }
}
```

## 金額パターン

### Money

```typescript
class Money {
  private constructor(
    private readonly amount: number,  // 最小通貨単位（円なら円、ドルならセント）
    private readonly currency: Currency
  ) {}

  static of(amount: number, currency: Currency): Money {
    if (!Number.isInteger(amount)) {
      throw new InvalidMoneyError('金額は整数である必要があります');
    }
    return new Money(amount, currency);
  }

  static yen(amount: number): Money {
    return Money.of(amount, Currency.JPY);
  }

  static zero(currency: Currency): Money {
    return Money.of(0, currency);
  }

  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return Money.of(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    const result = this.amount - other.amount;
    if (result < 0) {
      throw new NegativeMoneyError();
    }
    return Money.of(result, this.currency);
  }

  multiply(factor: number): Money {
    return Money.of(Math.round(this.amount * factor), this.currency);
  }

  percentage(percent: number): Money {
    return this.multiply(percent / 100);
  }

  isGreaterThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this.amount > other.amount;
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  private ensureSameCurrency(other: Money): void {
    if (!this.currency.equals(other.currency)) {
      throw new CurrencyMismatchError(this.currency, other.currency);
    }
  }

  format(): string {
    return this.currency.format(this.amount);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount
        && this.currency.equals(other.currency);
  }

  toString(): string {
    return this.format();
  }
}
```

### Percentage

```typescript
class Percentage {
  private constructor(private readonly value: number) {}

  static of(value: number): Percentage {
    if (value < 0 || value > 100) {
      throw new InvalidPercentageError(value);
    }
    return new Percentage(value);
  }

  static fromDecimal(decimal: number): Percentage {
    return Percentage.of(decimal * 100);
  }

  toDecimal(): number {
    return this.value / 100;
  }

  apply(amount: number): number {
    return Math.round(amount * this.toDecimal());
  }

  complement(): Percentage {
    return Percentage.of(100 - this.value);
  }

  format(): string {
    return `${this.value}%`;
  }

  equals(other: Percentage): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.format();
  }
}
```

## 日時パターン

### DateRange

```typescript
class DateRange {
  private constructor(
    private readonly start: Date,
    private readonly end: Date
  ) {}

  static create(start: Date, end: Date): DateRange {
    if (start > end) {
      throw new InvalidDateRangeError('開始日は終了日以前である必要があります');
    }
    return new DateRange(new Date(start), new Date(end));
  }

  static fromStrings(start: string, end: string): DateRange {
    return DateRange.create(new Date(start), new Date(end));
  }

  static singleDay(date: Date): DateRange {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return new DateRange(start, end);
  }

  contains(date: Date): boolean {
    return date >= this.start && date <= this.end;
  }

  overlaps(other: DateRange): boolean {
    return this.start <= other.end && this.end >= other.start;
  }

  includes(other: DateRange): boolean {
    return this.start <= other.start && this.end >= other.end;
  }

  get durationInDays(): number {
    const diffMs = this.end.getTime() - this.start.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  get durationInHours(): number {
    const diffMs = this.end.getTime() - this.start.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60));
  }

  extend(days: number): DateRange {
    const newEnd = new Date(this.end);
    newEnd.setDate(newEnd.getDate() + days);
    return new DateRange(this.start, newEnd);
  }

  equals(other: DateRange): boolean {
    return this.start.getTime() === other.start.getTime()
        && this.end.getTime() === other.end.getTime();
  }

  toString(): string {
    return `${this.start.toISOString()} - ${this.end.toISOString()}`;
  }
}
```

### TimeSlot

```typescript
class TimeSlot {
  private constructor(
    private readonly startHour: number,
    private readonly startMinute: number,
    private readonly endHour: number,
    private readonly endMinute: number
  ) {}

  static create(
    startHour: number,
    startMinute: number,
    endHour: number,
    endMinute: number
  ): TimeSlot {
    if (startHour < 0 || startHour > 23 || endHour < 0 || endHour > 23) {
      throw new InvalidTimeError('時は0-23の範囲である必要があります');
    }
    if (startMinute < 0 || startMinute > 59 || endMinute < 0 || endMinute > 59) {
      throw new InvalidTimeError('分は0-59の範囲である必要があります');
    }

    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;
    if (startTotal >= endTotal) {
      throw new InvalidTimeSlotError('開始時刻は終了時刻より前である必要があります');
    }

    return new TimeSlot(startHour, startMinute, endHour, endMinute);
  }

  static fromStrings(start: string, end: string): TimeSlot {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return TimeSlot.create(sh, sm, eh, em);
  }

  get durationInMinutes(): number {
    const startTotal = this.startHour * 60 + this.startMinute;
    const endTotal = this.endHour * 60 + this.endMinute;
    return endTotal - startTotal;
  }

  overlaps(other: TimeSlot): boolean {
    const thisStart = this.startHour * 60 + this.startMinute;
    const thisEnd = this.endHour * 60 + this.endMinute;
    const otherStart = other.startHour * 60 + other.startMinute;
    const otherEnd = other.endHour * 60 + other.endMinute;
    return thisStart < otherEnd && thisEnd > otherStart;
  }

  format(): string {
    const formatTime = (h: number, m: number) =>
      `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    return `${formatTime(this.startHour, this.startMinute)}-${formatTime(this.endHour, this.endMinute)}`;
  }

  equals(other: TimeSlot): boolean {
    return this.startHour === other.startHour
        && this.startMinute === other.startMinute
        && this.endHour === other.endHour
        && this.endMinute === other.endMinute;
  }

  toString(): string {
    return this.format();
  }
}
```

## 数量パターン

### Quantity

```typescript
class Quantity {
  private constructor(private readonly value: number) {}

  static of(value: number): Quantity {
    if (!Number.isInteger(value)) {
      throw new InvalidQuantityError('数量は整数である必要があります');
    }
    if (value < 0) {
      throw new NegativeQuantityError();
    }
    return new Quantity(value);
  }

  static zero(): Quantity {
    return Quantity.of(0);
  }

  add(other: Quantity): Quantity {
    return Quantity.of(this.value + other.value);
  }

  subtract(other: Quantity): Quantity {
    const result = this.value - other.value;
    if (result < 0) {
      throw new InsufficientQuantityError();
    }
    return Quantity.of(result);
  }

  multiply(factor: number): Quantity {
    return Quantity.of(Math.floor(this.value * factor));
  }

  isZero(): boolean {
    return this.value === 0;
  }

  isGreaterThan(other: Quantity): boolean {
    return this.value > other.value;
  }

  toNumber(): number {
    return this.value;
  }

  equals(other: Quantity): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return String(this.value);
  }
}
```

## 名前パターン

### PersonName

```typescript
class PersonName {
  private constructor(
    private readonly lastName: string,
    private readonly firstName: string,
    private readonly lastNameKana: string | null,
    private readonly firstNameKana: string | null
  ) {}

  static create(
    lastName: string,
    firstName: string,
    lastNameKana?: string,
    firstNameKana?: string
  ): PersonName {
    if (!lastName || lastName.trim().length === 0) {
      throw new InvalidNameError('姓は必須です');
    }
    if (!firstName || firstName.trim().length === 0) {
      throw new InvalidNameError('名は必須です');
    }

    return new PersonName(
      lastName.trim(),
      firstName.trim(),
      lastNameKana?.trim() || null,
      firstNameKana?.trim() || null
    );
  }

  get fullName(): string {
    return `${this.lastName} ${this.firstName}`;
  }

  get fullNameKana(): string | null {
    if (!this.lastNameKana || !this.firstNameKana) {
      return null;
    }
    return `${this.lastNameKana} ${this.firstNameKana}`;
  }

  equals(other: PersonName): boolean {
    return this.lastName === other.lastName
        && this.firstName === other.firstName;
  }

  toString(): string {
    return this.fullName;
  }
}
```

## チェックリスト

### パターン選択ガイド

| 要件 | 推奨パターン |
|-----|------------|
| エンティティの識別子 | UserId / OrderId パターン |
| メールアドレス | EmailAddress パターン |
| 電話番号 | PhoneNumber パターン |
| 住所 | Address + PostalCode パターン |
| 金額 | Money パターン |
| 割合 | Percentage パターン |
| 日付範囲 | DateRange パターン |
| 時間帯 | TimeSlot パターン |
| 数量 | Quantity パターン |
| 人名 | PersonName パターン |
