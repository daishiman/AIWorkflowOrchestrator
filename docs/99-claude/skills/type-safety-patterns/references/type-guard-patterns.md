# 型ガードパターン

## 概要

型ガードを使用して、ランタイムで型を安全に判別し、
TypeScriptの型推論を活用するパターンを解説します。

## 組み込み型ガード

### typeof 型ガード

プリミティブ型の判別に使用。

```typescript
type Primitive = string | number | boolean | null | undefined;

function processPrimitive(value: Primitive): string {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  if (typeof value === "number") {
    return value.toFixed(2);
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return "N/A";
}

// typeofで判別可能な型
// 'string', 'number', 'bigint', 'boolean', 'symbol', 'undefined', 'object', 'function'
```

### instanceof 型ガード

クラスインスタンスの判別に使用。

```typescript
class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

class ValidationError extends Error {
  fields: string[];
  constructor(message: string, fields: string[]) {
    super(message);
    this.fields = fields;
  }
}

function handleError(error: Error) {
  if (error instanceof ApiError) {
    console.log(`API Error ${error.statusCode}: ${error.message}`);
  } else if (error instanceof ValidationError) {
    console.log(`Validation Error: ${error.fields.join(", ")}`);
  } else {
    console.log(`Unknown Error: ${error.message}`);
  }
}
```

### in 型ガード

オブジェクトのプロパティ存在チェック。

```typescript
interface Bird {
  fly(): void;
  layEggs(): void;
}

interface Fish {
  swim(): void;
  layEggs(): void;
}

function move(animal: Bird | Fish) {
  if ("fly" in animal) {
    animal.fly();
  } else {
    animal.swim();
  }
}
```

## カスタム型ガード

### 基本的な型述語

```typescript
// 型述語を使用したカスタム型ガード
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value);
}

function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

// 使用例
function processValue(value: unknown) {
  if (isString(value)) {
    return value.toUpperCase();
  }
  if (isNumber(value)) {
    return value.toFixed(2);
  }
  return null;
}
```

### オブジェクト型の型ガード

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

interface Admin extends User {
  permissions: string[];
}

// User型ガード
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    "email" in value &&
    typeof (value as User).id === "string" &&
    typeof (value as User).name === "string" &&
    typeof (value as User).email === "string"
  );
}

// Admin型ガード（Userを拡張）
function isAdmin(value: unknown): value is Admin {
  return (
    isUser(value) &&
    "permissions" in value &&
    Array.isArray((value as Admin).permissions)
  );
}
```

### 配列の型ガード

```typescript
// 型付き配列チェック
function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function isNumberArray(value: unknown): value is number[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "number")
  );
}

// ジェネリック配列型ガード
function isArrayOf<T>(
  value: unknown,
  guard: (item: unknown) => item is T,
): value is T[] {
  return Array.isArray(value) && value.every(guard);
}

// 使用例
const data: unknown = ["a", "b", "c"];
if (isArrayOf(data, isString)) {
  // data は string[] として認識
  data.map((s) => s.toUpperCase());
}
```

### Zodを使用した型ガード

```typescript
import { z } from "zod";

const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
});

type User = z.infer<typeof userSchema>;

// Zodスキーマを型ガードとして使用
function isUser(value: unknown): value is User {
  return userSchema.safeParse(value).success;
}

// より詳細なエラー情報が必要な場合
function validateUser(
  value: unknown,
): { valid: true; data: User } | { valid: false; errors: z.ZodError } {
  const result = userSchema.safeParse(value);
  if (result.success) {
    return { valid: true, data: result.data };
  }
  return { valid: false, errors: result.error };
}
```

## 高度なパターン

### アサーション関数

```typescript
// asserts キーワードを使用
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error(`Expected string, got ${typeof value}`);
  }
}

function assertIsNonNull<T>(value: T): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error("Value is null or undefined");
  }
}

// 使用例
function processData(data: unknown) {
  assertIsString(data);
  // この時点で data は string 型
  return data.toUpperCase();
}
```

### 複合型ガード

```typescript
// 複数の型を判別する型ガード
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

function isSuccessResponse<T>(
  response: ApiResponse<T>,
): response is { success: true; data: T } {
  return response.success === true;
}

function isErrorResponse<T>(
  response: ApiResponse<T>,
): response is { success: false; error: { code: string; message: string } } {
  return response.success === false;
}

// 使用例
async function fetchData<T>(url: string): Promise<T> {
  const response: ApiResponse<T> = await fetch(url).then((r) => r.json());

  if (isSuccessResponse(response)) {
    return response.data;
  }

  throw new Error(`${response.error.code}: ${response.error.message}`);
}
```

### 型の絞り込みと網羅性チェック

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function isCircle(shape: Shape): shape is { kind: "circle"; radius: number } {
  return shape.kind === "circle";
}

function isRectangle(
  shape: Shape,
): shape is { kind: "rectangle"; width: number; height: number } {
  return shape.kind === "rectangle";
}

function isTriangle(
  shape: Shape,
): shape is { kind: "triangle"; base: number; height: number } {
  return shape.kind === "triangle";
}

// 網羅性チェック付きの処理
function getArea(shape: Shape): number {
  if (isCircle(shape)) {
    return Math.PI * shape.radius ** 2;
  }
  if (isRectangle(shape)) {
    return shape.width * shape.height;
  }
  if (isTriangle(shape)) {
    return (shape.base * shape.height) / 2;
  }
  // 網羅性チェック
  const _exhaustiveCheck: never = shape;
  return _exhaustiveCheck;
}
```

## ベストプラクティス

### 1. 型ガードの再利用性

```typescript
// ✅ 再利用可能な型ガードを作成
const guards = {
  isString: (value: unknown): value is string => typeof value === "string",
  isNumber: (value: unknown): value is number => typeof value === "number",
  isObject: (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null,
};

// 使用
if (guards.isString(data)) {
  // ...
}
```

### 2. エラーメッセージの明確化

```typescript
function assertIsUser(value: unknown): asserts value is User {
  if (!isUser(value)) {
    throw new TypeError(
      `Invalid user object. Expected { id: string, name: string, email: string }, ` +
        `got ${JSON.stringify(value)}`,
    );
  }
}
```

### 3. 型ガードのテスト

```typescript
import { describe, it, expect } from "vitest";

describe("isUser", () => {
  it("should return true for valid user", () => {
    const user = { id: "123", name: "John", email: "john@example.com" };
    expect(isUser(user)).toBe(true);
  });

  it("should return false for invalid user", () => {
    expect(isUser(null)).toBe(false);
    expect(isUser({})).toBe(false);
    expect(isUser({ id: 123 })).toBe(false);
  });
});
```

## 変更履歴

| バージョン | 日付       | 変更内容     |
| ---------- | ---------- | ------------ |
| 1.0.0      | 2025-11-25 | 初版リリース |
