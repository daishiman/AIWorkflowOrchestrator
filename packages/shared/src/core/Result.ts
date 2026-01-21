/**
 * Result型 - Railway-Oriented Programming
 *
 * 型安全なエラーハンドリングを提供する。
 * 例外ベースのエラー処理を置き換え、明示的なエラー処理を強制する。
 *
 * @module core/Result
 */

/**
 * 成功結果
 */
export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
}

/**
 * 失敗結果
 */
export interface Err<E> {
  readonly ok: false;
  readonly error: E;
}

/**
 * Result型（成功または失敗）
 */
export type Result<T, E> = Ok<T> | Err<E>;

/**
 * 非同期Result型
 */
export type AsyncResult<T, E> = Promise<Result<T, E>>;

// ========================================
// Factory Functions
// ========================================

/**
 * 成功結果を作成する
 *
 * @param value 成功値
 * @returns Ok<T>
 */
export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

/**
 * 失敗結果を作成する
 *
 * @param error エラー値
 * @returns Err<E>
 */
export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

// ========================================
// Type Guards
// ========================================

/**
 * 成功かどうかを判定する型ガード
 *
 * @param result 判定対象
 * @returns 成功の場合true
 */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok;
}

/**
 * 失敗かどうかを判定する型ガード
 *
 * @param result 判定対象
 * @returns 失敗の場合true
 */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return !result.ok;
}

// ========================================
// Map Functions
// ========================================

/**
 * 成功値を変換する
 *
 * @param result 元のResult
 * @param fn 変換関数
 * @returns 変換後のResult
 */
export function map<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U,
): Result<U, E> {
  if (result.ok) {
    return ok(fn(result.value));
  }
  return result;
}

/**
 * 失敗値を変換する
 *
 * @param result 元のResult
 * @param fn 変換関数
 * @returns 変換後のResult
 */
export function mapErr<T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F,
): Result<T, F> {
  if (!result.ok) {
    return err(fn(result.error));
  }
  return result;
}

// ========================================
// FlatMap (Bind/Chain)
// ========================================

/**
 * 成功値に対して別のResult返却関数を適用する
 * Railway-Oriented Programmingの中核
 *
 * @param result 元のResult
 * @param fn Result返却関数
 * @returns 適用後のResult
 */
export function flatMap<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>,
): Result<U, E> {
  if (result.ok) {
    return fn(result.value);
  }
  return result;
}

/**
 * flatMapのエイリアス（チェーン用）
 */
export const andThen = flatMap;

// ========================================
// Unwrap Functions
// ========================================

/**
 * 成功値を取り出す（失敗時はデフォルト値）
 *
 * @param result 元のResult
 * @param defaultValue デフォルト値
 * @returns 成功値またはデフォルト値
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  if (result.ok) {
    return result.value;
  }
  return defaultValue;
}

/**
 * 成功値を取り出す（失敗時は関数実行）
 *
 * @param result 元のResult
 * @param fn エラーから値を生成する関数
 * @returns 成功値または関数の戻り値
 */
export function unwrapOrElse<T, E>(
  result: Result<T, E>,
  fn: (error: E) => T,
): T {
  if (result.ok) {
    return result.value;
  }
  return fn(result.error);
}

/**
 * 成功値を取り出す（失敗時は例外スロー）
 * 注意: 最終手段としてのみ使用
 *
 * @param result 元のResult
 * @returns 成功値
 * @throws Errの場合
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.ok) {
    return result.value;
  }
  throw new Error(`Called unwrap on an Err value: ${String(result.error)}`);
}

// ========================================
// Combine Functions
// ========================================

/**
 * 複数のResultを合成する（全成功または最初の失敗）
 *
 * @param results Result配列
 * @returns 合成後のResult
 */
export function combine<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = [];

  for (const result of results) {
    if (!result.ok) {
      return result;
    }
    values.push(result.value);
  }

  return ok(values);
}

/**
 * オブジェクト形式のResult合成
 *
 * @param results キーごとのResult
 * @returns 合成後のResult
 */
export function combineObject<T extends Record<string, unknown>, E>(results: {
  [K in keyof T]: Result<T[K], E>;
}): Result<T, E> {
  const obj = {} as T;

  for (const key in results) {
    const result = results[key];
    if (!result.ok) {
      return result;
    }
    obj[key] = result.value;
  }

  return ok(obj);
}

// ========================================
// Async Utilities
// ========================================

/**
 * 非同期mapユーティリティ
 *
 * @param result AsyncResult
 * @param fn 変換関数
 * @returns 変換後のAsyncResult
 */
export async function mapAsync<T, U, E>(
  result: AsyncResult<T, E>,
  fn: (value: T) => U | Promise<U>,
): AsyncResult<U, E> {
  const awaited = await result;
  if (awaited.ok) {
    return ok(await fn(awaited.value));
  }
  return awaited;
}

/**
 * 非同期flatMapユーティリティ
 *
 * @param result AsyncResult
 * @param fn Result返却関数
 * @returns 適用後のAsyncResult
 */
export async function flatMapAsync<T, U, E>(
  result: AsyncResult<T, E>,
  fn: (value: T) => AsyncResult<U, E>,
): AsyncResult<U, E> {
  const awaited = await result;
  if (awaited.ok) {
    return fn(awaited.value);
  }
  return awaited;
}

/**
 * Promiseの例外をResultに変換する
 *
 * @param promise 変換対象のPromise
 * @param errorMapper エラー変換関数
 * @returns AsyncResult
 */
export async function fromPromise<T, E>(
  promise: Promise<T>,
  errorMapper: (error: unknown) => E,
): AsyncResult<T, E> {
  try {
    const value = await promise;
    return ok(value);
  } catch (error) {
    return err(errorMapper(error));
  }
}

/**
 * try-catchをResultに変換する（同期版）
 *
 * @param fn 実行関数
 * @param errorMapper エラー変換関数
 * @returns Result
 */
export function fromTry<T, E>(
  fn: () => T,
  errorMapper: (error: unknown) => E,
): Result<T, E> {
  try {
    return ok(fn());
  } catch (error) {
    return err(errorMapper(error));
  }
}
