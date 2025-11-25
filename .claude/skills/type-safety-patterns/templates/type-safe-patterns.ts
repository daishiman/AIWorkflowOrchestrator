/**
 * 型安全パターンテンプレート
 *
 * TypeScriptの型安全性を最大化するためのパターン集です。
 * 実際のプロジェクトでこれらのパターンを適用してください。
 *
 * @example
 * // このファイルをコピーして、プロジェクトの型定義に活用
 * cp templates/type-safe-patterns.ts src/types/patterns.ts
 */

// ============================================================
// 1. Result型パターン - エラーハンドリングの型安全化
// ============================================================

/**
 * 成功または失敗を表すResult型
 * 例外を使わない明示的なエラーハンドリング
 */
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

/** 成功を作成 */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/** 失敗を作成 */
export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

/** Result型のマップ処理 */
export function mapResult<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  if (result.ok) {
    return ok(fn(result.value));
  }
  return result;
}

/** Result型のフラットマップ処理 */
export function flatMapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> {
  if (result.ok) {
    return fn(result.value);
  }
  return result;
}

// 使用例:
// function divide(a: number, b: number): Result<number, string> {
//   if (b === 0) return err('Division by zero');
//   return ok(a / b);
// }

// ============================================================
// 2. Option型パターン - null安全の型表現
// ============================================================

/**
 * 値の存在/不在を表すOption型
 * null/undefinedの安全な取り扱い
 */
export type Option<T> = { some: true; value: T } | { some: false };

/** 値が存在する場合 */
export function some<T>(value: T): Option<T> {
  return { some: true, value };
}

/** 値が存在しない場合 */
export function none<T>(): Option<T> {
  return { some: false };
}

/** nullable値をOption型に変換 */
export function fromNullable<T>(value: T | null | undefined): Option<T> {
  return value == null ? none() : some(value);
}

/** Option型からnullable値に変換 */
export function toNullable<T>(option: Option<T>): T | null {
  return option.some ? option.value : null;
}

// ============================================================
// 3. 型ガードユーティリティ
// ============================================================

/** 文字列型ガード */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/** 数値型ガード */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

/** オブジェクト型ガード */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** 配列型ガード（ジェネリック） */
export function isArrayOf<T>(value: unknown, guard: (item: unknown) => item is T): value is T[] {
  return Array.isArray(value) && value.every(guard);
}

/** NonNullable型ガード */
export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

/** プロパティ存在チェック型ガード */
export function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return isObject(obj) && key in obj;
}

// ============================================================
// 4. アサーション関数
// ============================================================

/** 値が存在することをアサート */
export function assertNonNull<T>(value: T, message?: string): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error(message ?? 'Value is null or undefined');
  }
}

/** 条件が真であることをアサート */
export function assertCondition(condition: boolean, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message ?? 'Assertion failed');
  }
}

/** 網羅性チェック用のneverアサーション */
export function assertNever(value: never, message?: string): never {
  throw new Error(message ?? `Unexpected value: ${JSON.stringify(value)}`);
}

// ============================================================
// 5. Discriminated Unionパターン
// ============================================================

/**
 * APIレスポンスの状態を表すDiscriminated Union
 */
export type ApiState<T, E = Error> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T; timestamp: Date }
  | { status: 'error'; error: E; retryCount: number };

/** API状態の初期値 */
export function createIdleState<T, E = Error>(): ApiState<T, E> {
  return { status: 'idle' };
}

/** ローディング状態 */
export function createLoadingState<T, E = Error>(): ApiState<T, E> {
  return { status: 'loading' };
}

/** 成功状態 */
export function createSuccessState<T, E = Error>(data: T): ApiState<T, E> {
  return { status: 'success', data, timestamp: new Date() };
}

/** エラー状態 */
export function createErrorState<T, E = Error>(error: E, retryCount = 0): ApiState<T, E> {
  return { status: 'error', error, retryCount };
}

/**
 * フォーム状態のDiscriminated Union
 */
export type FormState<T extends Record<string, unknown>> =
  | { status: 'pristine'; values: T }
  | { status: 'dirty'; values: T; changedFields: (keyof T)[] }
  | { status: 'submitting'; values: T }
  | { status: 'submitted'; values: T; response: unknown }
  | { status: 'error'; values: T; errors: Partial<Record<keyof T, string[]>> };

// ============================================================
// 6. 型安全なイベントエミッター
// ============================================================

/**
 * 型安全なイベントエミッター
 */
export class TypedEventEmitter<TEvents extends Record<string, unknown>> {
  private listeners = new Map<keyof TEvents, Set<(payload: unknown) => void>>();

  on<K extends keyof TEvents>(event: K, listener: (payload: TEvents[K]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener as (payload: unknown) => void);

    // unsubscribe関数を返す
    return () => {
      this.listeners.get(event)?.delete(listener as (payload: unknown) => void);
    };
  }

  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void {
    this.listeners.get(event)?.forEach((listener) => listener(payload));
  }

  off<K extends keyof TEvents>(event: K, listener: (payload: TEvents[K]) => void): void {
    this.listeners.get(event)?.delete(listener as (payload: unknown) => void);
  }
}

// 使用例:
// type AppEvents = {
//   login: { userId: string };
//   logout: undefined;
//   error: { message: string; code: number };
// };
// const emitter = new TypedEventEmitter<AppEvents>();
// emitter.on('login', (payload) => console.log(payload.userId));

// ============================================================
// 7. ユーティリティ型
// ============================================================

/** DeepPartial - ネストされたすべてのプロパティをオプショナルに */
export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;

/** DeepReadonly - ネストされたすべてのプロパティを読み取り専用に */
export type DeepReadonly<T> = T extends object
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T;

/** Nullable - 型にnullを許可 */
export type Nullable<T> = T | null;

/** Optional - 型にundefinedを許可 */
export type Optional<T> = T | undefined;

/** Maybe - 型にnullとundefinedを許可 */
export type Maybe<T> = T | null | undefined;

/** StrictOmit - 存在するキーのみ除外可能 */
export type StrictOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/** StrictPick - 存在するキーのみ選択可能 */
export type StrictPick<T, K extends keyof T> = Pick<T, K>;

/** RequireAtLeastOne - 少なくとも1つのプロパティが必須 */
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

/** RequireOnlyOne - 1つだけのプロパティが必須 */
export type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, never>>;
  }[Keys];

// ============================================================
// 8. ブランド型（名義型）
// ============================================================

/** ブランド型を作成するためのユーティリティ */
declare const __brand: unique symbol;
export type Brand<T, TBrand extends string> = T & { [__brand]: TBrand };

/** ブランド型の例 */
export type UserId = Brand<string, 'UserId'>;
export type Email = Brand<string, 'Email'>;
export type PositiveNumber = Brand<number, 'PositiveNumber'>;

/** UserId作成関数 */
export function createUserId(id: string): UserId {
  // バリデーションロジックを追加
  if (!id || id.length === 0) {
    throw new Error('Invalid user ID');
  }
  return id as UserId;
}

/** Email作成関数 */
export function createEmail(email: string): Email {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
  return email as Email;
}

/** PositiveNumber作成関数 */
export function createPositiveNumber(n: number): PositiveNumber {
  if (n <= 0 || !Number.isFinite(n)) {
    throw new Error('Number must be positive');
  }
  return n as PositiveNumber;
}
