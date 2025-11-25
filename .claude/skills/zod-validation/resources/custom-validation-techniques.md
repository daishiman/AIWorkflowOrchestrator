# カスタムバリデーション技法

## 概要

Zodの組み込みバリデーターでは対応できない複雑な検証ロジックを実装するための
テクニックを解説します。`.refine()`、`.superRefine()`、`.transform()`を適切に使い分け、
堅牢なバリデーションを実現します。

## refine() によるカスタムバリデーション

### 基本的な使用法

```typescript
import { z } from 'zod';

// 単一フィールドのカスタムバリデーション
const passwordSchema = z.string()
  .min(8)
  .refine(
    (password) => /[A-Z]/.test(password),
    { message: '大文字を1文字以上含めてください' }
  )
  .refine(
    (password) => /[a-z]/.test(password),
    { message: '小文字を1文字以上含めてください' }
  )
  .refine(
    (password) => /[0-9]/.test(password),
    { message: '数字を1文字以上含めてください' }
  )
  .refine(
    (password) => /[!@#$%^&*]/.test(password),
    { message: '特殊文字(!@#$%^&*)を1文字以上含めてください' }
  );
```

### 複数フィールド間のバリデーション

```typescript
// パスワード確認
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'], // エラーを表示するフィールド
  }
);

// 日付範囲の検証
const dateRangeSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine(
  (data) => data.endDate > data.startDate,
  {
    message: '終了日は開始日より後の日付を指定してください',
    path: ['endDate'],
  }
);
```

### 条件付きバリデーション

```typescript
// タイプに応じた条件付きバリデーション
const paymentSchema = z.object({
  method: z.enum(['card', 'bank', 'cash']),
  cardNumber: z.string().optional(),
  bankAccount: z.string().optional(),
}).refine(
  (data) => {
    if (data.method === 'card') {
      return data.cardNumber !== undefined && data.cardNumber.length === 16;
    }
    if (data.method === 'bank') {
      return data.bankAccount !== undefined && data.bankAccount.length > 0;
    }
    return true;
  },
  {
    message: '選択した支払い方法に必要な情報を入力してください',
  }
);
```

## superRefine() による高度なバリデーション

### 複数のエラーを返す

```typescript
const userSchema = z.object({
  username: z.string(),
  email: z.string(),
  password: z.string(),
}).superRefine((data, ctx) => {
  // ユーザー名の検証
  if (data.username.length < 3) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'ユーザー名は3文字以上必要です',
      path: ['username'],
    });
  }

  if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'ユーザー名は英数字とアンダースコアのみ使用可能です',
      path: ['username'],
    });
  }

  // パスワードの複合検証
  const passwordIssues: string[] = [];
  if (!/[A-Z]/.test(data.password)) {
    passwordIssues.push('大文字');
  }
  if (!/[a-z]/.test(data.password)) {
    passwordIssues.push('小文字');
  }
  if (!/[0-9]/.test(data.password)) {
    passwordIssues.push('数字');
  }

  if (passwordIssues.length > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `パスワードには${passwordIssues.join('、')}を含めてください`,
      path: ['password'],
    });
  }
});
```

### 条件分岐とエラーの詳細制御

```typescript
const productSchema = z.object({
  type: z.enum(['physical', 'digital']),
  price: z.number(),
  weight: z.number().optional(),
  downloadUrl: z.string().url().optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'physical') {
    if (data.weight === undefined || data.weight <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '物理商品には重量を指定してください',
        path: ['weight'],
      });
    }
    if (data.downloadUrl !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '物理商品にダウンロードURLは不要です',
        path: ['downloadUrl'],
      });
    }
  }

  if (data.type === 'digital') {
    if (!data.downloadUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'デジタル商品にはダウンロードURLが必要です',
        path: ['downloadUrl'],
      });
    }
  }
});
```

## transform() による変換処理

### 基本的な変換

```typescript
// 文字列の正規化
const normalizedStringSchema = z.string()
  .transform((s) => s.trim().toLowerCase());

// 数値への変換
const numberFromStringSchema = z.string()
  .transform((s) => parseInt(s, 10))
  .refine((n) => !isNaN(n), { message: '有効な数値を入力してください' });

// 日付への変換
const dateSchema = z.string()
  .transform((s) => new Date(s))
  .refine((d) => !isNaN(d.getTime()), { message: '有効な日付を入力してください' });
```

### オブジェクトの変換

```typescript
// フラット化
const apiResponseSchema = z.object({
  data: z.object({
    user: z.object({
      id: z.string(),
      name: z.string(),
    }),
  }),
}).transform((response) => ({
  userId: response.data.user.id,
  userName: response.data.user.name,
}));

// フィールドの追加
const userWithFullNameSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
}).transform((data) => ({
  ...data,
  fullName: `${data.firstName} ${data.lastName}`,
}));
```

### pipe() によるチェーン変換

```typescript
// 変換後に追加のバリデーション
const positiveIntSchema = z.string()
  .transform((s) => parseInt(s, 10))
  .pipe(z.number().int().positive());

// 複雑な変換パイプライン
const processedInputSchema = z.string()
  .transform((s) => s.trim())
  .pipe(z.string().min(1))
  .transform((s) => s.toLowerCase())
  .transform((s) => s.replace(/\s+/g, '-'));
```

## 非同期バリデーション

### refineAsync の使用

```typescript
// メールアドレスの重複チェック（データベース確認）
const uniqueEmailSchema = z.string()
  .email()
  .refine(async (email) => {
    const existing = await db.user.findUnique({ where: { email } });
    return existing === null;
  }, { message: 'このメールアドレスは既に使用されています' });

// ユーザー名の利用可能性チェック
const availableUsernameSchema = z.string()
  .min(3)
  .max(20)
  .refine(async (username) => {
    const isAvailable = await checkUsernameAvailability(username);
    return isAvailable;
  }, { message: 'このユーザー名は使用できません' });

// parseAsync を使用して検証
const user = await userSchema.parseAsync(data);
```

### 非同期バリデーションの注意点

```typescript
// ⚠️ パフォーマンス考慮
const schema = z.object({
  email: z.string().email().refine(async (email) => {
    // データベースアクセスは最小限に
    return await isEmailUnique(email);
  }),
  username: z.string().refine(async (username) => {
    // 複数の非同期バリデーションは並列化される
    return await isUsernameAvailable(username);
  }),
});

// safeParse の非同期版
const result = await schema.safeParseAsync(data);
if (result.success) {
  // 検証成功
} else {
  // エラー処理
}
```

## カスタムエラーコード

### ZodIssueCode の活用

```typescript
const customSchema = z.string().superRefine((val, ctx) => {
  if (val.length < 3) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_small,
      minimum: 3,
      type: 'string',
      inclusive: true,
      message: '3文字以上必要です',
    });
  }

  if (!/^[a-z]+$/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.invalid_string,
      validation: 'regex',
      message: '小文字のアルファベットのみ使用可能です',
    });
  }

  // カスタムコード
  if (val === 'admin') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'この値は使用できません',
      params: {
        reason: 'reserved_word',
        value: val,
      },
    });
  }
});
```

## 実践的なパターン

### フォームバリデーション

```typescript
const registrationFormSchema = z.object({
  email: z.string()
    .email('有効なメールアドレスを入力してください'),
  password: z.string()
    .min(8, '8文字以上で入力してください'),
  confirmPassword: z.string(),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: '利用規約に同意してください' }),
  }),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: 'パスワードが一致しません', path: ['confirmPassword'] }
).superRefine((data, ctx) => {
  // パスワード強度チェック
  const strength = calculatePasswordStrength(data.password);
  if (strength < 3) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'パスワードが弱すぎます。大文字、数字、特殊文字を含めてください',
      path: ['password'],
    });
  }
});
```

### API入力バリデーション

```typescript
const createOrderSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
  })).min(1, '1つ以上の商品を選択してください'),
  shippingAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    postalCode: z.string().regex(/^\d{3}-\d{4}$/),
    country: z.string().length(2),
  }),
  couponCode: z.string().optional(),
}).superRefine(async (data, ctx) => {
  // クーポンコードの検証
  if (data.couponCode) {
    const coupon = await validateCoupon(data.couponCode);
    if (!coupon.valid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: coupon.reason,
        path: ['couponCode'],
      });
    }
  }

  // 在庫確認
  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];
    const stock = await checkStock(item.productId);
    if (stock < item.quantity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `在庫が不足しています（残り${stock}個）`,
        path: ['items', i, 'quantity'],
      });
    }
  }
});
```

## ベストプラクティス

### 1. バリデーションロジックの分離

```typescript
// ✅ 再利用可能なバリデーション関数
const isStrongPassword = (password: string): boolean => {
  return /[A-Z]/.test(password) &&
         /[a-z]/.test(password) &&
         /[0-9]/.test(password) &&
         password.length >= 8;
};

const passwordSchema = z.string()
  .refine(isStrongPassword, { message: 'パスワードが弱すぎます' });
```

### 2. エラーメッセージの一貫性

```typescript
// ✅ エラーメッセージを定数化
const ERROR_MESSAGES = {
  REQUIRED: '必須項目です',
  INVALID_EMAIL: '有効なメールアドレスを入力してください',
  PASSWORD_TOO_SHORT: 'パスワードは8文字以上必要です',
  PASSWORDS_DONT_MATCH: 'パスワードが一致しません',
} as const;
```

### 3. 非同期バリデーションの最小化

```typescript
// ❌ 不要な非同期バリデーション
const badSchema = z.string().refine(async (s) => {
  await sleep(100); // 不要な待機
  return s.length > 0;
});

// ✅ 同期で可能なものは同期で
const goodSchema = z.string().min(1);
```

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版リリース |
