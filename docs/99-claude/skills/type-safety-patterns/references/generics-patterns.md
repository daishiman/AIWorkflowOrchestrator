# ジェネリクスパターン

## 概要

TypeScriptのジェネリクスを活用して、再利用可能で型安全なコードを
設計するパターンを解説します。

## 基本的なジェネリクス

### 関数ジェネリクス

```typescript
// 基本的なジェネリック関数
function identity<T>(value: T): T {
  return value;
}

// 使用時に型が推論される
const str = identity("hello"); // string
const num = identity(42); // number

// 明示的な型指定
const arr = identity<string[]>(["a", "b", "c"]);
```

### 複数の型パラメータ

```typescript
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

const result = pair("hello", 42); // [string, number]

// マップ関数
function map<T, U>(array: T[], fn: (item: T) => U): U[] {
  return array.map(fn);
}

const numbers = map(["1", "2", "3"], (s) => parseInt(s, 10));
// number[]
```

### ジェネリック型

```typescript
// ジェネリックインターフェース
interface Container<T> {
  value: T;
  transform<U>(fn: (value: T) => U): Container<U>;
}

// ジェネリック型エイリアス
type Nullable<T> = T | null;
type Optional<T> = T | undefined;
type Maybe<T> = T | null | undefined;

// 使用例
const container: Container<number> = {
  value: 42,
  transform<U>(fn: (value: number) => U): Container<U> {
    return { value: fn(this.value), transform: this.transform };
  },
};
```

## 制約付きジェネリクス

### extends による制約

```typescript
// 特定の型を継承する制約
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}

getLength("hello"); // OK
getLength([1, 2, 3]); // OK
getLength({ length: 10 }); // OK
// getLength(42); // エラー: number には length がない

// オブジェクト制約
function getProperty<T extends object, K extends keyof T>(
  obj: T,
  key: K,
): T[K] {
  return obj[key];
}

const user = { name: "John", age: 30 };
const name = getProperty(user, "name"); // string
const age = getProperty(user, "age"); // number
```

### 複数の制約

```typescript
interface Serializable {
  serialize(): string;
}

interface Comparable<T> {
  compareTo(other: T): number;
}

// 複数の制約を満たす型
function process<T extends Serializable & Comparable<T>>(item: T): string {
  return item.serialize();
}
```

## 条件型

### 基本的な条件型

```typescript
// T が U を継承していれば X、そうでなければ Y
type Conditional<T, U, X, Y> = T extends U ? X : Y;

type IsString<T> = T extends string ? true : false;

type A = IsString<string>; // true
type B = IsString<number>; // false
```

### infer による型抽出

```typescript
// 関数の戻り値の型を取得
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// 配列の要素の型を取得
type ElementType<T> = T extends (infer E)[] ? E : never;

// Promiseの中身の型を取得
type Awaited<T> = T extends Promise<infer U> ? U : T;

// 使用例
type Fn = (x: number) => string;
type FnReturn = ReturnType<Fn>; // string

type Arr = number[];
type ArrElement = ElementType<Arr>; // number

type PromiseNum = Promise<number>;
type PromiseValue = Awaited<PromiseNum>; // number
```

### 分配条件型

```typescript
// ユニオン型に対して分配される
type ToArray<T> = T extends any ? T[] : never;

type Result = ToArray<string | number>;
// → string[] | number[]

// 分配を防ぐ
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;

type Result2 = ToArrayNonDist<string | number>;
// → (string | number)[]
```

## マップ型

### 基本的なマップ型

```typescript
// すべてのプロパティをオプショナルに
type Partial<T> = {
  [P in keyof T]?: T[P];
};

// すべてのプロパティを必須に
type Required<T> = {
  [P in keyof T]-?: T[P];
};

// すべてのプロパティを読み取り専用に
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// 特定のキーのみ抽出
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// 特定のキーを除外
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

### キーの変換

```typescript
// キーを変換するマップ型
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface Person {
  name: string;
  age: number;
}

type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number }

// 条件付きキー変換
type OnlyMethods<T> = {
  [K in keyof T as T[K] extends Function ? K : never]: T[K];
};
```

## 実践パターン

### APIレスポンスのジェネリック型

```typescript
// 成功/失敗を表すジェネリック型
type ApiResponse<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// ページネーション付きリスト
type PaginatedList<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

// API関数の型
type ApiFunction<TParams, TResponse> = (
  params: TParams,
) => Promise<ApiResponse<TResponse>>;

// 使用例
interface User {
  id: string;
  name: string;
}

type GetUsersFn = ApiFunction<{ page: number }, PaginatedList<User>>;
```

### ビルダーパターン

```typescript
// 型安全なビルダー
class QueryBuilder<T extends object, Selected extends keyof T = never> {
  private selectedFields: Selected[] = [];

  select<K extends Exclude<keyof T, Selected>>(
    field: K,
  ): QueryBuilder<T, Selected | K> {
    this.selectedFields.push(field as unknown as Selected);
    return this as unknown as QueryBuilder<T, Selected | K>;
  }

  build(): Pick<T, Selected> {
    // 実際のクエリ実行
    return {} as Pick<T, Selected>;
  }
}

// 使用例
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

const query = new QueryBuilder<User>().select("name").select("email").build();
// Pick<User, 'name' | 'email'>
```

### 型安全なイベントエミッター

```typescript
type EventMap = {
  login: { userId: string };
  logout: undefined;
  error: { message: string; code: number };
};

class TypedEventEmitter<T extends Record<string, any>> {
  private listeners = new Map<keyof T, Set<Function>>();

  on<K extends keyof T>(event: K, listener: (payload: T[K]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  emit<K extends keyof T>(event: K, payload: T[K]): void {
    this.listeners.get(event)?.forEach((listener) => listener(payload));
  }
}

// 使用例
const emitter = new TypedEventEmitter<EventMap>();

emitter.on("login", (payload) => {
  console.log(payload.userId); // 型安全
});

emitter.emit("login", { userId: "123" }); // OK
// emitter.emit('login', { userId: 123 }); // エラー
```

### 深いPartial型

```typescript
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

interface Config {
  server: {
    host: string;
    port: number;
    ssl: {
      enabled: boolean;
      cert: string;
    };
  };
  logging: {
    level: string;
  };
}

type PartialConfig = DeepPartial<Config>;
// すべてのネストされたプロパティがオプショナル

const config: PartialConfig = {
  server: {
    port: 3000,
    // host, ssl は省略可能
  },
};
```

## ベストプラクティス

### 1. 型パラメータの命名規則

```typescript
// ✅ 意味のある名前
type Container<TValue> = { value: TValue };
type KeyValue<TKey, TValue> = { key: TKey; value: TValue };

// 一般的な慣例
// T: Type（一般的な型）
// K: Key（オブジェクトのキー）
// V: Value（値）
// E: Element（配列要素）
// R: Return（戻り値）
```

### 2. デフォルト型の活用

```typescript
// デフォルト型パラメータ
interface Response<T = unknown, E = Error> {
  data?: T;
  error?: E;
}

const response1: Response = {}; // T = unknown, E = Error
const response2: Response<User> = {}; // T = User, E = Error
const response3: Response<User, ApiError> = {}; // T = User, E = ApiError
```

### 3. 過度な複雑さを避ける

```typescript
// ❌ 過度に複雑な型
type OverlyComplex<
  T extends object,
  K extends keyof T,
  U extends T[K] extends infer R ? R : never,
  V extends U extends object ? keyof U : never,
> = {
  /* ... */
};

// ✅ 段階的に分解
type ExtractValue<T, K extends keyof T> = T[K];
type ExtractKeys<T> = T extends object ? keyof T : never;
```

## 変更履歴

| バージョン | 日付       | 変更内容     |
| ---------- | ---------- | ------------ |
| 1.0.0      | 2025-11-25 | 初版リリース |
