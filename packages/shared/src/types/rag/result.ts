/**
 * @file Result型定義
 * @module @repo/shared/types/rag/result
 * @description Railway Oriented Programmingパターンによるエラーハンドリング
 */

// =============================================================================
// 型定義
// =============================================================================

/**
 * 成功を表す型
 * @template T 成功値の型
 */
export interface Success<T> {
  /** 判別子 - 常にtrue */
  readonly success: true;
  /** 成功値 */
  readonly data: T;
}

/**
 * 失敗を表す型
 * @template E エラーの型
 */
export interface Failure<E> {
  /** 判別子 - 常にfalse */
  readonly success: false;
  /** エラー値 */
  readonly error: E;
}

/**
 * 成功または失敗を表す型（Discriminated Union）
 * @template T 成功値の型
 * @template E エラーの型（デフォルト: Error）
 * @example
 * const result: Result<number, string> = ok(42);
 * if (isOk(result)) {
 *   console.log(result.data); // 42
 * }
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

// =============================================================================
// コンストラクタ関数
// =============================================================================

/**
 * 成功値を生成する
 * @template T 成功値の型
 * @param data 成功値
 * @returns Success<T>
 * @example
 * const result = ok(42); // Success<number>
 * const user = ok({ id: 1, name: "Alice" }); // Success<{ id: number; name: string }>
 */
export const ok = <T>(data: T): Success<T> => ({
  success: true,
  data,
});

/**
 * エラー値を生成する
 * @template E エラーの型
 * @param error エラー値
 * @returns Failure<E>
 * @example
 * const result = err(new Error("Failed")); // Failure<Error>
 * const validation = err("Invalid input"); // Failure<string>
 */
export const err = <E>(error: E): Failure<E> => ({
  success: false,
  error,
});

// =============================================================================
// 型ガード関数
// =============================================================================

/**
 * 結果が成功かどうかを判定する型ガード
 * @template T 成功値の型
 * @template E エラーの型
 * @param result 判定対象
 * @returns resultがSuccess<T>ならtrue
 * @example
 * const result: Result<number, string> = ok(42);
 * if (isOk(result)) {
 *   // result.data にアクセス可能（型が絞り込まれている）
 *   console.log(result.data * 2);
 * }
 */
export const isOk = <T, E>(result: Result<T, E>): result is Success<T> =>
  result.success === true;

/**
 * 結果が失敗かどうかを判定する型ガード
 * @template T 成功値の型
 * @template E エラーの型
 * @param result 判定対象
 * @returns resultがFailure<E>ならtrue
 * @example
 * const result: Result<number, string> = err("error");
 * if (isErr(result)) {
 *   // result.error にアクセス可能（型が絞り込まれている）
 *   console.error(result.error);
 * }
 */
export const isErr = <T, E>(result: Result<T, E>): result is Failure<E> =>
  result.success === false;

// =============================================================================
// モナド的操作
// =============================================================================

/**
 * 成功値に関数を適用する（Functor map）
 * @template T 元の成功値の型
 * @template U 変換後の成功値の型
 * @template E エラーの型
 * @param result 対象のResult
 * @param fn 変換関数
 * @returns 変換後のResult
 * @example
 * map(ok(2), x => x * 2) // ok(4)
 * map(err("fail"), x => x * 2) // err("fail") - 変換はスキップ
 */
export const map = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U,
): Result<U, E> => (isOk(result) ? ok(fn(result.data)) : result);

/**
 * 成功値にResult返却関数を適用する（Monad bind/flatMap）
 * @template T 元の成功値の型
 * @template U 変換後の成功値の型
 * @template E エラーの型
 * @param result 対象のResult
 * @param fn Result返却の変換関数
 * @returns 変換後のResult（ネストなし）
 * @example
 * const divide = (a: number, b: number): Result<number, string> =>
 *   b === 0 ? err("Division by zero") : ok(a / b);
 *
 * flatMap(ok(10), x => divide(x, 2)) // ok(5)
 * flatMap(ok(10), x => divide(x, 0)) // err("Division by zero")
 * flatMap(err("error"), x => divide(x, 2)) // err("error") - 変換はスキップ
 */
export const flatMap = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>,
): Result<U, E> => (isOk(result) ? fn(result.data) : result);

/**
 * エラー値に関数を適用する
 * @template T 成功値の型
 * @template E 元のエラーの型
 * @template F 変換後のエラーの型
 * @param result 対象のResult
 * @param fn エラー変換関数
 * @returns エラー変換後のResult
 * @example
 * mapErr(err("simple error"), e => new Error(e)) // err(Error("simple error"))
 * mapErr(ok(42), e => new Error(e)) // ok(42) - 変換はスキップ
 */
export const mapErr = <T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F,
): Result<T, F> => (isErr(result) ? err(fn(result.error)) : result);

/**
 * 複数のResultを統合する
 * @template T 成功値の型
 * @template E エラーの型
 * @param results Resultの配列
 * @returns 全成功なら成功値の配列、1つでも失敗なら最初のエラー
 * @example
 * all([ok(1), ok(2), ok(3)]) // ok([1, 2, 3])
 * all([ok(1), err("fail"), ok(3)]) // err("fail")
 * all([]) // ok([])
 */
export const all = <T, E>(results: Result<T, E>[]): Result<T[], E> => {
  const values: T[] = [];
  for (const result of results) {
    if (isErr(result)) return result;
    values.push(result.data);
  }
  return ok(values);
};
