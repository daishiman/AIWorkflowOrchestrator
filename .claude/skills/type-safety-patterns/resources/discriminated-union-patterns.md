# Discriminated Unions パターン

## 概要

Discriminated Unions（判別可能なユニオン型）を活用して、
状態管理や複雑なデータ構造を型安全に設計するパターンを解説します。

## 基本概念

### Discriminated Union とは

判別フィールド（discriminant）を持つユニオン型。
TypeScriptが自動的に型を絞り込むことができます。

```typescript
// 判別フィールド: status
type ApiResponse<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: { code: string; message: string } }
  | { status: 'loading' };

function handleResponse<T>(response: ApiResponse<T>) {
  switch (response.status) {
    case 'success':
      // response.data にアクセス可能
      return response.data;
    case 'error':
      // response.error にアクセス可能
      throw new Error(response.error.message);
    case 'loading':
      // データなし
      return null;
  }
}
```

## 実践パターン

### 状態管理

```typescript
// フェッチ状態の管理
type FetchState<T, E = Error> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T; timestamp: Date }
  | { status: 'error'; error: E; retryCount: number };

// 使用例
function useFetch<T>(url: string) {
  const [state, setState] = useState<FetchState<T>>({ status: 'idle' });

  async function fetch() {
    setState({ status: 'loading' });

    try {
      const data = await fetchData<T>(url);
      setState({ status: 'success', data, timestamp: new Date() });
    } catch (error) {
      setState({
        status: 'error',
        error: error as Error,
        retryCount: state.status === 'error' ? state.retryCount + 1 : 1
      });
    }
  }

  return { state, fetch };
}
```

### フォーム状態

```typescript
type FormState<T> =
  | { status: 'pristine'; values: T }
  | { status: 'dirty'; values: T; changedFields: (keyof T)[] }
  | { status: 'submitting'; values: T }
  | { status: 'submitted'; values: T; response: unknown }
  | { status: 'error'; values: T; errors: Record<keyof T, string[]> };

function getSubmitButtonText<T>(state: FormState<T>): string {
  switch (state.status) {
    case 'pristine':
      return '送信';
    case 'dirty':
      return '変更を保存';
    case 'submitting':
      return '送信中...';
    case 'submitted':
      return '送信完了';
    case 'error':
      return 'エラーを修正してください';
  }
}
```

### イベントハンドリング

```typescript
type AppEvent =
  | { type: 'USER_LOGIN'; payload: { userId: string; email: string } }
  | { type: 'USER_LOGOUT' }
  | { type: 'DATA_FETCH_START'; payload: { resource: string } }
  | { type: 'DATA_FETCH_SUCCESS'; payload: { resource: string; data: unknown } }
  | { type: 'DATA_FETCH_ERROR'; payload: { resource: string; error: Error } };

function eventReducer(state: AppState, event: AppEvent): AppState {
  switch (event.type) {
    case 'USER_LOGIN':
      return { ...state, user: event.payload };
    case 'USER_LOGOUT':
      return { ...state, user: null };
    case 'DATA_FETCH_START':
      return { ...state, loading: { ...state.loading, [event.payload.resource]: true } };
    case 'DATA_FETCH_SUCCESS':
      return {
        ...state,
        data: { ...state.data, [event.payload.resource]: event.payload.data },
        loading: { ...state.loading, [event.payload.resource]: false },
      };
    case 'DATA_FETCH_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [event.payload.resource]: event.payload.error },
        loading: { ...state.loading, [event.payload.resource]: false },
      };
  }
}
```

### Result型パターン

```typescript
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// 成功を作成
function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

// 失敗を作成
function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// Result型を使用した関数
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return err('Division by zero');
  }
  return ok(a / b);
}

// 使用例
const result = divide(10, 2);
if (result.ok) {
  console.log(result.value); // 5
} else {
  console.error(result.error);
}

// チェーン処理
function map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  if (result.ok) {
    return ok(fn(result.value));
  }
  return result;
}

function flatMap<T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> {
  if (result.ok) {
    return fn(result.value);
  }
  return result;
}
```

### Option型パターン

```typescript
type Option<T> =
  | { some: true; value: T }
  | { some: false };

function some<T>(value: T): Option<T> {
  return { some: true, value };
}

function none<T>(): Option<T> {
  return { some: false };
}

function fromNullable<T>(value: T | null | undefined): Option<T> {
  return value == null ? none() : some(value);
}

// 使用例
function findUser(id: string): Option<User> {
  const user = users.find((u) => u.id === id);
  return fromNullable(user);
}

const userOption = findUser('123');
if (userOption.some) {
  console.log(userOption.value.name);
}
```

## 高度なパターン

### 多段階の状態遷移

```typescript
// ウィザード/ステップフォームの状態
type WizardState<T extends Record<string, unknown>> =
  | { step: 'personal'; data: Pick<T, 'name' | 'email'> | null }
  | { step: 'address'; data: Pick<T, 'name' | 'email' | 'address'> }
  | { step: 'payment'; data: Pick<T, 'name' | 'email' | 'address' | 'payment'> }
  | { step: 'confirmation'; data: T }
  | { step: 'completed'; data: T; orderId: string };

function canProceed(state: WizardState<FormData>): boolean {
  switch (state.step) {
    case 'personal':
      return state.data !== null;
    case 'address':
    case 'payment':
    case 'confirmation':
      return true;
    case 'completed':
      return false;
  }
}
```

### 権限ベースの型

```typescript
type UserRole = 'guest' | 'user' | 'admin';

type UserWithRole =
  | { role: 'guest' }
  | { role: 'user'; userId: string; email: string }
  | { role: 'admin'; userId: string; email: string; permissions: string[] };

function canAccessAdminPanel(user: UserWithRole): boolean {
  return user.role === 'admin';
}

function getUserEmail(user: UserWithRole): string | null {
  if (user.role === 'guest') {
    return null;
  }
  return user.email;
}
```

### 網羅性チェック

```typescript
// never型を使用した網羅性チェック
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

type MessageType =
  | { type: 'text'; content: string }
  | { type: 'image'; url: string; alt: string }
  | { type: 'video'; url: string; duration: number };

function renderMessage(message: MessageType): string {
  switch (message.type) {
    case 'text':
      return `<p>${message.content}</p>`;
    case 'image':
      return `<img src="${message.url}" alt="${message.alt}" />`;
    case 'video':
      return `<video src="${message.url}" data-duration="${message.duration}"></video>`;
    default:
      // 新しい type が追加されるとコンパイルエラー
      return assertNever(message);
  }
}
```

## Zodとの組み合わせ

```typescript
import { z } from 'zod';

// Zodでdiscriminated unionを定義
const resultSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('success'),
    data: z.object({
      id: z.string(),
      name: z.string(),
    }),
  }),
  z.object({
    status: z.literal('error'),
    error: z.object({
      code: z.string(),
      message: z.string(),
    }),
  }),
]);

type Result = z.infer<typeof resultSchema>;

// バリデーション付きで使用
function processApiResponse(data: unknown): void {
  const result = resultSchema.parse(data);

  if (result.status === 'success') {
    console.log(result.data.name);
  } else {
    console.error(result.error.message);
  }
}
```

## ベストプラクティス

### 1. 判別フィールドの命名

```typescript
// ✅ 明確な判別フィールド名
type GoodUnion =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; size: number };

// ❌ 曖昧な判別フィールド名
type BadUnion =
  | { value: 'a'; data1: number }
  | { value: 'b'; data2: string };
```

### 2. リテラル型の一貫性

```typescript
// ✅ 一貫したリテラル型
type ConsistentUnion =
  | { type: 'CREATE'; payload: CreatePayload }
  | { type: 'UPDATE'; payload: UpdatePayload }
  | { type: 'DELETE'; payload: DeletePayload };

// ❌ 混在するリテラル型
type InconsistentUnion =
  | { type: 'create'; payload: CreatePayload }
  | { action: 'UPDATE'; data: UpdatePayload } // フィールド名が異なる
  | { type: 3; payload: DeletePayload }; // 数値リテラル
```

### 3. 型の拡張性

```typescript
// 基本型を定義
type BaseEvent = {
  timestamp: Date;
  userId: string;
};

// 拡張可能なイベント型
type AppEvent =
  | (BaseEvent & { type: 'login' })
  | (BaseEvent & { type: 'logout' })
  | (BaseEvent & { type: 'action'; action: string });
```

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版リリース |
