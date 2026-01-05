# バリデーション戦略

## 概要

値オブジェクトの重要な特性の一つは「自己検証」です。
不正な値は生成段階で拒否し、一度生成された値オブジェクトは常に有効な状態を保証します。

このドキュメントでは、値オブジェクトのバリデーション戦略を解説します。

## バリデーションの原則

### 1. 生成時にバリデーション

```typescript
// ✅ 良い例：ファクトリメソッドでバリデーション
class EmailAddress {
  private static readonly PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(private readonly value: string) {}

  static of(value: string): EmailAddress {
    if (!value) {
      throw new InvalidEmailError("メールアドレスは必須です");
    }
    if (!this.PATTERN.test(value)) {
      throw new InvalidEmailError(`不正なメールアドレス形式: ${value}`);
    }
    return new EmailAddress(value.toLowerCase());
  }
}

// ❌ 悪い例：バリデーションがない
class EmailAddress {
  constructor(public value: string) {} // 不正な値も受け入れてしまう
}
```

### 2. 常に有効な状態を保証

```typescript
// 一度生成されたら、常に有効
const email = EmailAddress.of("user@example.com");
// email は常に有効なメールアドレス

// 不正な値は生成段階で拒否
try {
  const invalid = EmailAddress.of("invalid-email");
} catch (e) {
  // InvalidEmailError がスロー
}
```

### 3. 失敗を早期に検出

```typescript
// ✅ 値オブジェクト使用：問題を早期に検出
function sendEmail(to: EmailAddress, subject: string): void {
  // to は既に検証済み
}

// ❌ プリミティブ使用：問題の検出が遅れる可能性
function sendEmail(to: string, subject: string): void {
  // to が有効かどうか不明
  // 送信時まで問題が分からない
}
```

## バリデーションパターン

### パターン1: 例外をスロー

最も一般的なパターン。不正な値は例外をスローします。

```typescript
class Money {
  private constructor(
    private readonly amount: number,
    private readonly currency: Currency,
  ) {}

  static of(amount: number, currency: Currency): Money {
    if (!Number.isFinite(amount)) {
      throw new InvalidMoneyError("金額は有限の数値である必要があります");
    }
    if (amount < 0) {
      throw new NegativeMoneyError("金額は0以上である必要があります");
    }
    return new Money(amount, currency);
  }
}

// 使用例
try {
  const money = Money.of(-100, Currency.JPY);
} catch (e) {
  if (e instanceof NegativeMoneyError) {
    // エラーハンドリング
  }
}
```

### パターン2: Result型を返す

関数型プログラミングスタイル。成功/失敗を型で表現します。

```typescript
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

class EmailAddress {
  private static readonly PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(private readonly value: string) {}

  static create(value: string): Result<EmailAddress, ValidationError> {
    if (!value) {
      return {
        ok: false,
        error: new ValidationError("メールアドレスは必須です"),
      };
    }
    if (!this.PATTERN.test(value)) {
      return {
        ok: false,
        error: new ValidationError("不正なメールアドレス形式です"),
      };
    }
    return { ok: true, value: new EmailAddress(value.toLowerCase()) };
  }

  // 例外版も提供（便利な場合がある）
  static of(value: string): EmailAddress {
    const result = this.create(value);
    if (!result.ok) {
      throw result.error;
    }
    return result.value;
  }
}

// 使用例
const result = EmailAddress.create(userInput);
if (result.ok) {
  const email = result.value;
  // 成功時の処理
} else {
  const error = result.error;
  // エラー時の処理
}
```

### パターン3: Option型を返す

値の存在/不在を表現。エラーの詳細が不要な場合。

```typescript
type Option<T> = T | null;

class PositiveNumber {
  private constructor(private readonly value: number) {}

  static tryCreate(value: number): Option<PositiveNumber> {
    if (value <= 0) {
      return null;
    }
    return new PositiveNumber(value);
  }

  // 必須版
  static of(value: number): PositiveNumber {
    const result = this.tryCreate(value);
    if (result === null) {
      throw new InvalidValueError("正の数である必要があります");
    }
    return result;
  }
}

// 使用例
const maybeNumber = PositiveNumber.tryCreate(userInput);
if (maybeNumber !== null) {
  // 有効な値
}
```

### パターン4: 検証メソッドを分離

検証ロジックを再利用可能にする。

```typescript
class Password {
  private constructor(private readonly value: string) {}

  static readonly MIN_LENGTH = 8;
  static readonly MAX_LENGTH = 100;
  static readonly REQUIRE_UPPERCASE = true;
  static readonly REQUIRE_LOWERCASE = true;
  static readonly REQUIRE_NUMBER = true;
  static readonly REQUIRE_SPECIAL = true;

  // 検証メソッド（再利用可能）
  static validate(value: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!value) {
      errors.push(new ValidationError("パスワードは必須です"));
      return errors; // 以降のチェックは不要
    }

    if (value.length < this.MIN_LENGTH) {
      errors.push(
        new ValidationError(`パスワードは${this.MIN_LENGTH}文字以上必要です`),
      );
    }

    if (value.length > this.MAX_LENGTH) {
      errors.push(
        new ValidationError(
          `パスワードは${this.MAX_LENGTH}文字以下にしてください`,
        ),
      );
    }

    if (this.REQUIRE_UPPERCASE && !/[A-Z]/.test(value)) {
      errors.push(new ValidationError("大文字を含める必要があります"));
    }

    if (this.REQUIRE_LOWERCASE && !/[a-z]/.test(value)) {
      errors.push(new ValidationError("小文字を含める必要があります"));
    }

    if (this.REQUIRE_NUMBER && !/\d/.test(value)) {
      errors.push(new ValidationError("数字を含める必要があります"));
    }

    if (this.REQUIRE_SPECIAL && !/[!@#$%^&*]/.test(value)) {
      errors.push(
        new ValidationError("特殊文字(!@#$%^&*)を含める必要があります"),
      );
    }

    return errors;
  }

  // ファクトリメソッド
  static of(value: string): Password {
    const errors = this.validate(value);
    if (errors.length > 0) {
      throw new PasswordValidationError(errors);
    }
    return new Password(value);
  }

  // 検証のみ（生成しない）
  static isValid(value: string): boolean {
    return this.validate(value).length === 0;
  }
}

// 使用例
// フォームでリアルタイム検証
const errors = Password.validate(inputValue);
if (errors.length > 0) {
  displayErrors(errors);
}

// 実際の生成
const password = Password.of(inputValue);
```

## 複合バリデーション

### 複数フィールドの整合性チェック

```typescript
class DateRange {
  private constructor(
    private readonly start: Date,
    private readonly end: Date,
  ) {}

  static create(start: Date, end: Date): DateRange {
    // 個別のバリデーション
    if (!start || isNaN(start.getTime())) {
      throw new InvalidDateError("開始日が不正です");
    }
    if (!end || isNaN(end.getTime())) {
      throw new InvalidDateError("終了日が不正です");
    }

    // フィールド間の整合性チェック
    if (start > end) {
      throw new InvalidDateRangeError(
        "開始日は終了日より前である必要があります",
      );
    }

    return new DateRange(new Date(start), new Date(end));
  }
}
```

### 外部依存を持つバリデーション

```typescript
// ❌ 避けるべき：値オブジェクト内で外部サービスを呼ぶ
class EmailAddress {
  static async of(value: string): Promise<EmailAddress> {
    // 外部サービスに依存 - 避けるべき
    const exists = await emailService.checkExists(value);
    if (exists) {
      throw new EmailAlreadyExistsError();
    }
    return new EmailAddress(value);
  }
}

// ✅ 良い例：外部依存のバリデーションは別の層で行う
class EmailAddress {
  // 形式のバリデーションのみ
  static of(value: string): EmailAddress {
    if (!this.isValidFormat(value)) {
      throw new InvalidEmailError(value);
    }
    return new EmailAddress(value);
  }
}

// 存在チェックはアプリケーションサービスで
class UserRegistrationService {
  async register(email: string): Promise<User> {
    const emailAddress = EmailAddress.of(email); // 形式チェック

    // 存在チェックは別途
    if (await this.userRepository.existsByEmail(emailAddress)) {
      throw new EmailAlreadyExistsError();
    }

    return this.userRepository.save(User.create(emailAddress));
  }
}
```

## エラー設計

### ドメイン固有のエラークラス

```typescript
// 基底エラー
abstract class DomainError extends Error {
  abstract readonly code: string;
}

// 値オブジェクト固有のエラー
class InvalidEmailError extends DomainError {
  readonly code = "INVALID_EMAIL";

  constructor(value: string) {
    super(`不正なメールアドレス形式: ${value}`);
  }
}

class InvalidMoneyError extends DomainError {
  readonly code = "INVALID_MONEY";

  constructor(message: string) {
    super(message);
  }
}

class NegativeMoneyError extends InvalidMoneyError {
  override readonly code = "NEGATIVE_MONEY";

  constructor() {
    super("金額は0以上である必要があります");
  }
}

class CurrencyMismatchError extends DomainError {
  readonly code = "CURRENCY_MISMATCH";

  constructor(currency1: Currency, currency2: Currency) {
    super(`通貨が一致しません: ${currency1.code} と ${currency2.code}`);
  }
}
```

### バリデーションエラーの集約

```typescript
class ValidationErrors extends Error {
  constructor(readonly errors: ValidationError[]) {
    super(`バリデーションエラー: ${errors.length}件`);
  }

  get messages(): string[] {
    return this.errors.map((e) => e.message);
  }

  static single(error: ValidationError): ValidationErrors {
    return new ValidationErrors([error]);
  }

  static combine(errors: ValidationError[]): ValidationErrors | null {
    if (errors.length === 0) return null;
    return new ValidationErrors(errors);
  }
}

// 使用例
class UserProfile {
  static create(name: string, email: string, age: number): UserProfile {
    const errors: ValidationError[] = [];

    if (!name) {
      errors.push(new ValidationError("名前は必須です"));
    }
    if (!email) {
      errors.push(new ValidationError("メールアドレスは必須です"));
    }
    if (age < 0 || age > 150) {
      errors.push(new ValidationError("年齢は0-150の範囲で入力してください"));
    }

    if (errors.length > 0) {
      throw new ValidationErrors(errors);
    }

    return new UserProfile(
      PersonName.of(name),
      EmailAddress.of(email),
      Age.of(age),
    );
  }
}
```

## 正規化

### 入力の正規化

```typescript
class EmailAddress {
  private constructor(private readonly value: string) {}

  static of(value: string): EmailAddress {
    if (!value) {
      throw new InvalidEmailError("メールアドレスは必須です");
    }

    // 正規化
    const normalized = value
      .trim() // 前後の空白を除去
      .toLowerCase(); // 小文字に統一

    if (!this.isValidFormat(normalized)) {
      throw new InvalidEmailError(value);
    }

    return new EmailAddress(normalized);
  }
}
```

### フォーマット統一

```typescript
class PhoneNumber {
  private constructor(private readonly value: string) {}

  static of(value: string): PhoneNumber {
    // 数字以外を除去して正規化
    const digitsOnly = value.replace(/\D/g, "");

    if (digitsOnly.length !== 10 && digitsOnly.length !== 11) {
      throw new InvalidPhoneNumberError(value);
    }

    return new PhoneNumber(digitsOnly);
  }

  // フォーマット済み出力
  format(): string {
    if (this.value.length === 11) {
      return `${this.value.slice(0, 3)}-${this.value.slice(3, 7)}-${this.value.slice(7)}`;
    }
    return `${this.value.slice(0, 3)}-${this.value.slice(3, 6)}-${this.value.slice(6)}`;
  }
}
```

## チェックリスト

### バリデーション設計チェック

- [ ] 生成時にすべてのバリデーションを行っているか？
- [ ] 不正な値を生成できないようになっているか？
- [ ] エラーメッセージは具体的で分かりやすいか？
- [ ] ドメイン固有のエラークラスを使用しているか？
- [ ] 必要に応じて入力を正規化しているか？
- [ ] 複数フィールドの整合性をチェックしているか？
- [ ] 外部依存のバリデーションを分離しているか？
