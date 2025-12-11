# Data Transformer Patterns

## 概要

データ変換パターンは、外部APIのレスポンスを内部ドメイン型に安全かつ効率的に変換するための実装パターン集です。
型安全性、エラーハンドリング、パフォーマンスを考慮した実践的なアプローチを提供します。

## 基本パターン

### 1. シンプル変換

最も基本的なフィールドマッピング。

```typescript
// 外部型
interface ExternalUser {
  user_id: string;
  email_address: string;
  full_name: string;
}

// 内部型
interface User {
  id: string;
  email: string;
  displayName: string;
}

// 変換関数
const transformUser = (external: ExternalUser): User => ({
  id: external.user_id,
  email: external.email_address,
  displayName: external.full_name,
});
```

### 2. Zodによる検証付き変換

実行時の型安全性を確保するパターン。

```typescript
import { z } from "zod";

// 外部データのスキーマ（検証用）
const ExternalUserSchema = z.object({
  user_id: z.string(),
  email_address: z.string().email(),
  full_name: z.string().min(1),
  created_at: z.string().datetime(),
});

// 内部型のスキーマ
const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  createdAt: z.date(),
});

type User = z.infer<typeof UserSchema>;

// 検証付き変換
const transformAndValidate = (data: unknown): User => {
  // 1. 外部データの検証
  const external = ExternalUserSchema.parse(data);

  // 2. 変換
  const internal: User = {
    id: external.user_id,
    email: external.email_address,
    displayName: external.full_name,
    createdAt: new Date(external.created_at),
  };

  // 3. 内部型の検証（オプション）
  return UserSchema.parse(internal);
};
```

### 3. Result型による安全な変換

エラーを例外ではなく戻り値として扱うパターン。

```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

const safeTransform = (data: unknown): Result<User, TransformError> => {
  try {
    const external = ExternalUserSchema.safeParse(data);

    if (!external.success) {
      return {
        success: false,
        error: new ValidationError(external.error.format()),
      };
    }

    const user = transformUser(external.data);
    return { success: true, data: user };
  } catch (error) {
    return {
      success: false,
      error: new TransformError("Transformation failed", { cause: error }),
    };
  }
};

// 使用例
const result = safeTransform(apiResponse);
if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

## 高度なパターン

### 4. パイプライン変換

複数の変換ステップを連鎖させるパターン。

```typescript
type TransformFn<TInput, TOutput> = (input: TInput) => TOutput;

// パイプラインビルダー
const pipeline = <T>() => ({
  pipe: <U>(fn: TransformFn<T, U>) => ({
    ...pipeline<U>(),
    execute: (input: T) => fn(input),
    pipe: <V>(nextFn: TransformFn<U, V>) =>
      pipeline<V>().pipe((i: T) => nextFn(fn(i))),
  }),
});

// 使用例
const transformPipeline = pipeline<ExternalUser>()
  .pipe(normalizeFieldNames)
  .pipe(convertDates)
  .pipe(applyDefaults)
  .pipe(validate);

const user = transformPipeline.execute(externalData);
```

### 5. ネスト構造の変換

深くネストされたデータの変換パターン。

```typescript
// 外部型（深くネスト）
interface ExternalOrder {
  order_id: string;
  customer: {
    customer_id: string;
    contact_info: {
      email: string;
      phone: string | null;
    };
  };
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
  }>;
}

// 内部型（フラット化または再構造化）
interface Order {
  id: string;
  customerId: string;
  customerEmail: string;
  customerPhone: string | undefined;
  lineItems: OrderLineItem[];
  totalAmount: number;
}

// 段階的変換
const transformOrder = (external: ExternalOrder): Order => {
  const lineItems = transformLineItems(external.items);
  const totalAmount = calculateTotal(lineItems);

  return {
    id: external.order_id,
    customerId: external.customer.customer_id,
    customerEmail: external.customer.contact_info.email,
    customerPhone: external.customer.contact_info.phone ?? undefined,
    lineItems,
    totalAmount,
  };
};

const transformLineItems = (items: ExternalOrder["items"]): OrderLineItem[] =>
  items.map((item) => ({
    productId: item.product_id,
    quantity: item.quantity,
    unitPrice: item.unit_price,
    subtotal: item.quantity * item.unit_price,
  }));

const calculateTotal = (items: OrderLineItem[]): number =>
  items.reduce((sum, item) => sum + item.subtotal, 0);
```

### 6. 条件付き変換

データの状態に応じて異なる変換を適用するパターン。

```typescript
// ステータスによって構造が異なる外部型
type ExternalPayment =
  | { status: "pending"; initiated_at: string }
  | { status: "completed"; completed_at: string; amount: number }
  | { status: "failed"; failed_at: string; error_code: string };

// 内部型（統一構造）
interface Payment {
  status: PaymentStatus;
  timestamp: Date;
  amount?: number;
  errorCode?: string;
}

// 判別共用体の変換
const transformPayment = (external: ExternalPayment): Payment => {
  const base = { status: transformStatus(external.status) };

  switch (external.status) {
    case "pending":
      return {
        ...base,
        timestamp: new Date(external.initiated_at),
      };
    case "completed":
      return {
        ...base,
        timestamp: new Date(external.completed_at),
        amount: external.amount,
      };
    case "failed":
      return {
        ...base,
        timestamp: new Date(external.failed_at),
        errorCode: external.error_code,
      };
  }
};
```

### 7. バッチ変換とストリーミング

大量データの効率的な変換パターン。

```typescript
// バッチ変換（メモリ効率）
async function* transformBatch<T, U>(
  items: AsyncIterable<T>,
  transform: (item: T) => U,
  batchSize = 100,
): AsyncGenerator<U[]> {
  let batch: U[] = [];

  for await (const item of items) {
    batch.push(transform(item));
    if (batch.length >= batchSize) {
      yield batch;
      batch = [];
    }
  }

  if (batch.length > 0) {
    yield batch;
  }
}

// 使用例
const users: User[] = [];
for await (const batch of transformBatch(externalUsers, transformUser)) {
  users.push(...batch);
  // または直接処理
  await saveUsers(batch);
}
```

## デフォルト値とNull処理

### オプショナルフィールドの処理

```typescript
// 外部型（nullableフィールド）
interface ExternalProfile {
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  followers_count: number | null;
}

// 内部型（デフォルト値適用）
interface Profile {
  displayName: string;
  bio: string;
  avatarUrl: string | undefined;
  followersCount: number;
}

const transformProfile = (external: ExternalProfile): Profile => ({
  displayName: external.display_name ?? "Anonymous",
  bio: external.bio ?? "",
  avatarUrl: external.avatar_url ?? undefined,
  followersCount: external.followers_count ?? 0,
});
```

### Nullish Coalescing vs デフォルトパラメータ

```typescript
// ?? はnullとundefinedのみ
const value1 = external.count ?? 0; // 0は0、nullは0

// || は falsy 値すべて
const value2 = external.count || 0; // 0は0（危険！）

// 明示的なチェック
const value3 = external.count === null ? 0 : external.count;
```

## 日付と時刻の変換

### 日付形式の変換

```typescript
// Unix timestamp（秒）→ Date
const fromUnixTimestamp = (ts: number): Date => new Date(ts * 1000);

// Unix timestamp（ミリ秒）→ Date
const fromUnixMs = (ts: number): Date => new Date(ts);

// ISO 8601 → Date
const fromIso = (iso: string): Date => new Date(iso);

// カスタム形式 → Date
const fromCustomFormat = (dateStr: string, format: string): Date => {
  // 例: "2024-01-15" → Date
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};
```

### タイムゾーン考慮

```typescript
// UTC → ローカル
const utcToLocal = (utcDate: Date): Date => {
  const offset = utcDate.getTimezoneOffset() * 60000;
  return new Date(utcDate.getTime() - offset);
};

// ISO文字列として保存（タイムゾーン維持）
const toIsoString = (date: Date): string => date.toISOString();
```

## エラーハンドリング

### 変換エラーの型定義

```typescript
class TransformError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "TransformError";
  }
}

class ValidationError extends TransformError {
  constructor(
    public readonly issues: Array<{
      path: string;
      message: string;
    }>,
  ) {
    super("Validation failed");
    this.name = "ValidationError";
  }
}
```

### グレースフルデグラデーション

```typescript
const transformWithFallback = (
  external: ExternalData,
  fallback: Partial<InternalData> = {},
): InternalData => {
  const result: InternalData = {
    id: external.id ?? fallback.id ?? generateId(),
    name: external.name ?? fallback.name ?? "Unknown",
    createdAt:
      parseDate(external.created_at) ?? fallback.createdAt ?? new Date(),
  };

  return result;
};

const parseDate = (value: unknown): Date | null => {
  if (!value) return null;
  const date = new Date(String(value));
  return isNaN(date.getTime()) ? null : date;
};
```

## チェックリスト

### 設計時

- [ ] 外部型と内部型の対応が明確か？
- [ ] null/undefinedの処理方針が決まっているか？
- [ ] エラーハンドリング戦略が定義されているか？

### 実装時

- [ ] Zodなどで実行時検証を行っているか？
- [ ] 日付/タイムゾーンの変換が正しいか？
- [ ] 深くネストした構造の変換が段階的か？

### テスト時

- [ ] 正常系のマッピングがテストされているか？
- [ ] null/undefined/空文字の処理がテストされているか？
- [ ] 無効なデータでのエラーがテストされているか？

## 参考パターン

- **Value Object**: 変換後の値を不変オブジェクトとして扱う
- **Builder**: 複雑な変換を段階的に構築
- **Factory**: 変換ロジックのカプセル化
- **Strategy**: 複数の変換戦略の切り替え
