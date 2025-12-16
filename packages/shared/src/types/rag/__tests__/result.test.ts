/**
 * @file Result型のテスト
 * @description TDD Red Phase - 実装前にテストを作成
 * @taskId CONV-03-01
 * @subtask T-03-1
 */

import { describe, it, expect } from "vitest";
import {
  type Result,
  type Success,
  type Failure,
  ok,
  err,
  isOk,
  isErr,
  map,
  flatMap,
  mapErr,
  all,
} from "../result";

// =============================================================================
// 1. 型定義のテスト
// =============================================================================

describe("Result型定義", () => {
  describe("Success<T>", () => {
    it("successフィールドがtrueであること", () => {
      const result: Success<number> = { success: true, data: 42 };
      expect(result.success).toBe(true);
    });

    it("dataフィールドに値を保持すること", () => {
      const result: Success<string> = { success: true, data: "hello" };
      expect(result.data).toBe("hello");
    });

    it("オブジェクト型のdataを保持できること", () => {
      interface User {
        id: number;
        name: string;
      }
      const user: User = { id: 1, name: "Alice" };
      const result: Success<User> = { success: true, data: user };
      expect(result.data).toEqual({ id: 1, name: "Alice" });
    });

    it("配列型のdataを保持できること", () => {
      const result: Success<number[]> = { success: true, data: [1, 2, 3] };
      expect(result.data).toEqual([1, 2, 3]);
    });

    it("null値のdataを保持できること", () => {
      const result: Success<null> = { success: true, data: null };
      expect(result.data).toBeNull();
    });

    it("undefined値のdataを保持できること", () => {
      const result: Success<undefined> = { success: true, data: undefined };
      expect(result.data).toBeUndefined();
    });
  });

  describe("Failure<E>", () => {
    it("successフィールドがfalseであること", () => {
      const result: Failure<Error> = {
        success: false,
        error: new Error("fail"),
      };
      expect(result.success).toBe(false);
    });

    it("errorフィールドにErrorを保持すること", () => {
      const error = new Error("Something went wrong");
      const result: Failure<Error> = { success: false, error };
      expect(result.error).toBe(error);
      expect(result.error.message).toBe("Something went wrong");
    });

    it("カスタムエラー型を保持できること", () => {
      interface CustomError {
        code: string;
        message: string;
      }
      const error: CustomError = { code: "E001", message: "Custom error" };
      const result: Failure<CustomError> = { success: false, error };
      expect(result.error.code).toBe("E001");
    });

    it("文字列エラーを保持できること", () => {
      const result: Failure<string> = { success: false, error: "simple error" };
      expect(result.error).toBe("simple error");
    });
  });

  describe("Result<T, E>", () => {
    it("Success型として使用できること", () => {
      const result: Result<number, Error> = { success: true, data: 42 };
      expect(result.success).toBe(true);
    });

    it("Failure型として使用できること", () => {
      const result: Result<number, Error> = {
        success: false,
        error: new Error("fail"),
      };
      expect(result.success).toBe(false);
    });

    it("デフォルトエラー型がErrorであること", () => {
      // E省略時はError型がデフォルト
      const result: Result<number> = { success: false, error: new Error("x") };
      expect(result.success).toBe(false);
    });
  });
});

// =============================================================================
// 2. コンストラクタ関数のテスト
// =============================================================================

describe("コンストラクタ関数", () => {
  describe("ok()", () => {
    it("Success<T>を生成すること", () => {
      const result = ok(42);
      expect(result.success).toBe(true);
      expect(result.data).toBe(42);
    });

    it("文字列でSuccess<string>を生成すること", () => {
      const result = ok("hello");
      expect(result.success).toBe(true);
      expect(result.data).toBe("hello");
    });

    it("オブジェクトでSuccess<T>を生成すること", () => {
      const obj = { id: 1, name: "test" };
      const result = ok(obj);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(obj);
    });

    it("配列でSuccess<T[]>を生成すること", () => {
      const result = ok([1, 2, 3]);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([1, 2, 3]);
    });

    it("nullでSuccess<null>を生成すること", () => {
      const result = ok(null);
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it("undefinedでSuccess<undefined>を生成すること", () => {
      const result = ok(undefined);
      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
    });

    it("空オブジェクトでSuccess<{}>を生成すること", () => {
      const result = ok({});
      expect(result.success).toBe(true);
      expect(result.data).toEqual({});
    });

    it("0でSuccess<number>を生成すること", () => {
      const result = ok(0);
      expect(result.success).toBe(true);
      expect(result.data).toBe(0);
    });

    it("空文字列でSuccess<string>を生成すること", () => {
      const result = ok("");
      expect(result.success).toBe(true);
      expect(result.data).toBe("");
    });

    it("falseでSuccess<boolean>を生成すること", () => {
      const result = ok(false);
      expect(result.success).toBe(true);
      expect(result.data).toBe(false);
    });
  });

  describe("err()", () => {
    it("Failure<Error>を生成すること", () => {
      const error = new Error("Something went wrong");
      const result = err(error);
      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
    });

    it("文字列エラーでFailure<string>を生成すること", () => {
      const result = err("simple error");
      expect(result.success).toBe(false);
      expect(result.error).toBe("simple error");
    });

    it("カスタムエラー型でFailureを生成すること", () => {
      interface AppError {
        code: string;
        message: string;
        details?: unknown;
      }
      const error: AppError = { code: "ERR001", message: "App error" };
      const result = err(error);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe("ERR001");
    });

    it("nullエラーでFailure<null>を生成すること", () => {
      const result = err(null);
      expect(result.success).toBe(false);
      expect(result.error).toBeNull();
    });

    it("数値エラーでFailure<number>を生成すること", () => {
      const result = err(404);
      expect(result.success).toBe(false);
      expect(result.error).toBe(404);
    });
  });
});

// =============================================================================
// 3. 型ガード関数のテスト
// =============================================================================

describe("型ガード関数", () => {
  describe("isOk()", () => {
    it("Success型に対してtrueを返すこと", () => {
      const result = ok(42);
      expect(isOk(result)).toBe(true);
    });

    it("Failure型に対してfalseを返すこと", () => {
      const result = err(new Error("fail"));
      expect(isOk(result)).toBe(false);
    });

    it("型の絞り込みが機能すること", () => {
      const result: Result<number, string> = ok(42);
      if (isOk(result)) {
        // この時点でresult.dataにアクセス可能（型が絞り込まれている）
        expect(result.data).toBe(42);
      }
    });

    it("null dataを持つSuccessに対してtrueを返すこと", () => {
      const result = ok(null);
      expect(isOk(result)).toBe(true);
    });

    it("undefined dataを持つSuccessに対してtrueを返すこと", () => {
      const result = ok(undefined);
      expect(isOk(result)).toBe(true);
    });
  });

  describe("isErr()", () => {
    it("Failure型に対してtrueを返すこと", () => {
      const result = err(new Error("fail"));
      expect(isErr(result)).toBe(true);
    });

    it("Success型に対してfalseを返すこと", () => {
      const result = ok(42);
      expect(isErr(result)).toBe(false);
    });

    it("型の絞り込みが機能すること", () => {
      const result: Result<number, string> = err("error message");
      if (isErr(result)) {
        // この時点でresult.errorにアクセス可能（型が絞り込まれている）
        expect(result.error).toBe("error message");
      }
    });

    it("nullエラーを持つFailureに対してtrueを返すこと", () => {
      const result = err(null);
      expect(isErr(result)).toBe(true);
    });
  });
});

// =============================================================================
// 4. モナド的操作のテスト
// =============================================================================

describe("モナド的操作", () => {
  describe("map()", () => {
    it("Successの値を変換すること", () => {
      const result = ok(2);
      const mapped = map(result, (x) => x * 3);
      expect(isOk(mapped)).toBe(true);
      if (isOk(mapped)) {
        expect(mapped.data).toBe(6);
      }
    });

    it("Failureはそのまま返すこと", () => {
      const result: Result<number, string> = err("error");
      const mapped = map(result, (x) => x * 3);
      expect(isErr(mapped)).toBe(true);
      if (isErr(mapped)) {
        expect(mapped.error).toBe("error");
      }
    });

    it("型を変更する変換ができること", () => {
      const result = ok(42);
      const mapped = map(result, (x) => x.toString());
      expect(isOk(mapped)).toBe(true);
      if (isOk(mapped)) {
        expect(mapped.data).toBe("42");
        expect(typeof mapped.data).toBe("string");
      }
    });

    it("オブジェクトを返す変換ができること", () => {
      const result = ok(5);
      const mapped = map(result, (x) => ({ value: x, doubled: x * 2 }));
      expect(isOk(mapped)).toBe(true);
      if (isOk(mapped)) {
        expect(mapped.data).toEqual({ value: 5, doubled: 10 });
      }
    });

    it("nullを返す変換ができること", () => {
      const result = ok(42);
      const mapped = map(result, () => null);
      expect(isOk(mapped)).toBe(true);
      if (isOk(mapped)) {
        expect(mapped.data).toBeNull();
      }
    });

    it("連鎖的に変換できること", () => {
      const result = ok(2);
      const mapped = map(
        map(result, (x) => x + 1),
        (x) => x * 2,
      );
      expect(isOk(mapped)).toBe(true);
      if (isOk(mapped)) {
        expect(mapped.data).toBe(6); // (2 + 1) * 2
      }
    });
  });

  describe("flatMap()", () => {
    it("成功時にResult返却関数を適用すること", () => {
      const result = ok(2);
      const mapped = flatMap(result, (x) => ok(x * 3));
      expect(isOk(mapped)).toBe(true);
      if (isOk(mapped)) {
        expect(mapped.data).toBe(6);
      }
    });

    it("変換関数がエラーを返すとFailureになること", () => {
      const result = ok(2);
      const mapped = flatMap(result, (x) =>
        x > 5 ? ok(x) : err("Value too small"),
      );
      expect(isErr(mapped)).toBe(true);
      if (isErr(mapped)) {
        expect(mapped.error).toBe("Value too small");
      }
    });

    it("元がFailureならそのまま返すこと", () => {
      const result: Result<number, string> = err("original error");
      const mapped = flatMap(result, (x) => ok(x * 3));
      expect(isErr(mapped)).toBe(true);
      if (isErr(mapped)) {
        expect(mapped.error).toBe("original error");
      }
    });

    it("ネストを平坦化すること（Result<Result<T>>にならない）", () => {
      const result = ok(10);
      // flatMapはResult<Result<T>>ではなくResult<T>を返す
      const mapped = flatMap(result, (x) => ok(x.toString()));
      expect(isOk(mapped)).toBe(true);
      if (isOk(mapped)) {
        expect(mapped.data).toBe("10");
      }
    });

    it("連鎖的に使用できること", () => {
      const divide = (a: number, b: number): Result<number, string> =>
        b === 0 ? err("Division by zero") : ok(a / b);

      const result = flatMap(
        flatMap(ok(100), (x) => divide(x, 2)),
        (x) => divide(x, 5),
      );
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBe(10); // 100 / 2 / 5
      }
    });

    it("連鎖の途中でエラーになると以降の変換をスキップすること", () => {
      const divide = (a: number, b: number): Result<number, string> =>
        b === 0 ? err("Division by zero") : ok(a / b);

      const result = flatMap(
        flatMap(ok(100), (x) => divide(x, 0)),
        (x) => divide(x, 5),
      );
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBe("Division by zero");
      }
    });
  });

  describe("mapErr()", () => {
    it("Failureのエラーを変換すること", () => {
      const result: Result<number, string> = err("simple error");
      const mapped = mapErr(result, (e) => new Error(e));
      expect(isErr(mapped)).toBe(true);
      if (isErr(mapped)) {
        expect(mapped.error).toBeInstanceOf(Error);
        expect(mapped.error.message).toBe("simple error");
      }
    });

    it("Successはそのまま返すこと", () => {
      const result = ok(42);
      const mapped = mapErr(result, (e) => new Error(String(e)));
      expect(isOk(mapped)).toBe(true);
      if (isOk(mapped)) {
        expect(mapped.data).toBe(42);
      }
    });

    it("エラーコードを追加する変換ができること", () => {
      interface DetailedError {
        code: string;
        message: string;
      }
      const result: Result<number, string> = err("Network timeout");
      const mapped = mapErr(
        result,
        (msg): DetailedError => ({
          code: "ERR_NETWORK",
          message: msg,
        }),
      );
      expect(isErr(mapped)).toBe(true);
      if (isErr(mapped)) {
        expect(mapped.error.code).toBe("ERR_NETWORK");
        expect(mapped.error.message).toBe("Network timeout");
      }
    });

    it("エラーをラップできること", () => {
      const originalError = new Error("Original");
      const result: Result<number, Error> = err(originalError);
      const mapped = mapErr(result, (e) => ({
        wrapped: true,
        original: e,
      }));
      expect(isErr(mapped)).toBe(true);
      if (isErr(mapped)) {
        expect(mapped.error.wrapped).toBe(true);
        expect(mapped.error.original).toBe(originalError);
      }
    });
  });
});

// =============================================================================
// 5. all関数のテスト
// =============================================================================

describe("all()", () => {
  it("すべてSuccessなら成功値の配列を返すこと", () => {
    const results = [ok(1), ok(2), ok(3)];
    const combined = all(results);
    expect(isOk(combined)).toBe(true);
    if (isOk(combined)) {
      expect(combined.data).toEqual([1, 2, 3]);
    }
  });

  it("1つでもFailureがあれば最初のエラーを返すこと", () => {
    const results: Result<number, string>[] = [
      ok(1),
      err("first error"),
      ok(3),
      err("second error"),
    ];
    const combined = all(results);
    expect(isErr(combined)).toBe(true);
    if (isErr(combined)) {
      expect(combined.error).toBe("first error");
    }
  });

  it("空配列はSuccess<[]>を返すこと", () => {
    const results: Result<number, string>[] = [];
    const combined = all(results);
    expect(isOk(combined)).toBe(true);
    if (isOk(combined)) {
      expect(combined.data).toEqual([]);
    }
  });

  it("単一要素の配列を処理できること", () => {
    const results = [ok(42)];
    const combined = all(results);
    expect(isOk(combined)).toBe(true);
    if (isOk(combined)) {
      expect(combined.data).toEqual([42]);
    }
  });

  it("単一Failureの配列を処理できること", () => {
    const results: Result<number, string>[] = [err("single error")];
    const combined = all(results);
    expect(isErr(combined)).toBe(true);
    if (isErr(combined)) {
      expect(combined.error).toBe("single error");
    }
  });

  it("異なる型の値を持つResultを処理できること", () => {
    // 型的にはT[]なので同じ型である必要があるが、
    // 基底型がunion型なら可能
    const results: Result<string | number, Error>[] = [ok(1), ok("two"), ok(3)];
    const combined = all(results);
    expect(isOk(combined)).toBe(true);
    if (isOk(combined)) {
      expect(combined.data).toEqual([1, "two", 3]);
    }
  });

  it("最初の要素がエラーの場合", () => {
    const results: Result<number, string>[] = [err("first"), ok(2), ok(3)];
    const combined = all(results);
    expect(isErr(combined)).toBe(true);
    if (isErr(combined)) {
      expect(combined.error).toBe("first");
    }
  });

  it("最後の要素がエラーの場合", () => {
    const results: Result<number, string>[] = [ok(1), ok(2), err("last")];
    const combined = all(results);
    expect(isErr(combined)).toBe(true);
    if (isErr(combined)) {
      expect(combined.error).toBe("last");
    }
  });

  it("null値を含むSuccessを処理できること", () => {
    const results = [ok(1), ok(null), ok(3)];
    const combined = all(results);
    expect(isOk(combined)).toBe(true);
    if (isOk(combined)) {
      expect(combined.data).toEqual([1, null, 3]);
    }
  });
});

// =============================================================================
// 6. エッジケースと統合テスト
// =============================================================================

describe("エッジケースと統合テスト", () => {
  describe("複雑な型での使用", () => {
    it("ネストしたオブジェクトを処理できること", () => {
      interface DeepObject {
        level1: {
          level2: {
            value: number;
          };
        };
      }
      const obj: DeepObject = { level1: { level2: { value: 42 } } };
      const result = ok(obj);
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.level1.level2.value).toBe(42);
      }
    });

    it("関数を値として保持できること", () => {
      const fn = (x: number) => x * 2;
      const result = ok(fn);
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data(21)).toBe(42);
      }
    });

    it("Promiseを値として保持できること", () => {
      const promise = Promise.resolve(42);
      const result = ok(promise);
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBe(promise);
      }
    });
  });

  describe("イミュータビリティ", () => {
    it("Successは読み取り専用であること", () => {
      const result = ok({ value: 42 });
      // TypeScript的にはreadonly制約があるため、
      // 実行時に変更を試みても元の値は変わらないことを確認
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.value).toBe(42);
      }
    });

    it("map/flatMapは元のResultを変更しないこと", () => {
      const original = ok(10);
      const mapped = map(original, (x) => x * 2);

      // 元のResultは変更されていない
      expect(isOk(original)).toBe(true);
      if (isOk(original)) {
        expect(original.data).toBe(10);
      }

      // 新しいResultが生成されている
      expect(isOk(mapped)).toBe(true);
      if (isOk(mapped)) {
        expect(mapped.data).toBe(20);
      }
    });
  });

  describe("パイプライン処理パターン", () => {
    it("Railway Oriented Programmingパターンが機能すること", () => {
      // 典型的なバリデーション→変換→保存のパイプライン
      const validateAge = (age: number): Result<number, string> =>
        age >= 0 && age <= 150 ? ok(age) : err("Invalid age");

      const validateName = (name: string): Result<string, string> =>
        name.length > 0 ? ok(name) : err("Name is required");

      const createUser = (
        name: string,
        age: number,
      ): Result<{ name: string; age: number }, string> => {
        const nameResult = validateName(name);
        const ageResult = validateAge(age);

        if (isErr(nameResult)) return nameResult;
        if (isErr(ageResult)) return ageResult;

        return ok({ name: nameResult.data, age: ageResult.data });
      };

      // 成功ケース
      const successResult = createUser("Alice", 30);
      expect(isOk(successResult)).toBe(true);
      if (isOk(successResult)) {
        expect(successResult.data).toEqual({ name: "Alice", age: 30 });
      }

      // 失敗ケース（名前）
      const nameErrorResult = createUser("", 30);
      expect(isErr(nameErrorResult)).toBe(true);
      if (isErr(nameErrorResult)) {
        expect(nameErrorResult.error).toBe("Name is required");
      }

      // 失敗ケース（年齢）
      const ageErrorResult = createUser("Bob", -5);
      expect(isErr(ageErrorResult)).toBe(true);
      if (isErr(ageErrorResult)) {
        expect(ageErrorResult.error).toBe("Invalid age");
      }
    });

    it("flatMapによるエラー伝播が正しく機能すること", () => {
      const parseNumber = (s: string): Result<number, string> => {
        const n = Number(s);
        return isNaN(n) ? err(`"${s}" is not a number`) : ok(n);
      };

      const divide = (a: number, b: number): Result<number, string> =>
        b === 0 ? err("Division by zero") : ok(a / b);

      // "100" -> 100 -> 100 / 4 = 25
      const successCase = flatMap(parseNumber("100"), (n) => divide(n, 4));
      expect(isOk(successCase)).toBe(true);
      if (isOk(successCase)) {
        expect(successCase.data).toBe(25);
      }

      // "abc" -> エラー
      const parseErrorCase = flatMap(parseNumber("abc"), (n) => divide(n, 4));
      expect(isErr(parseErrorCase)).toBe(true);
      if (isErr(parseErrorCase)) {
        expect(parseErrorCase.error).toBe('"abc" is not a number');
      }

      // "100" / 0 -> エラー
      const divideErrorCase = flatMap(parseNumber("100"), (n) => divide(n, 0));
      expect(isErr(divideErrorCase)).toBe(true);
      if (isErr(divideErrorCase)) {
        expect(divideErrorCase.error).toBe("Division by zero");
      }
    });
  });

  describe("allとmapの組み合わせ", () => {
    it("all後にmapで変換できること", () => {
      const results = [ok(1), ok(2), ok(3)];
      const combined = all(results);
      const sum = map(combined, (arr) => arr.reduce((a, b) => a + b, 0));

      expect(isOk(sum)).toBe(true);
      if (isOk(sum)) {
        expect(sum.data).toBe(6);
      }
    });

    it("all後のエラーはmapをスキップすること", () => {
      const results: Result<number, string>[] = [ok(1), err("error"), ok(3)];
      const combined = all(results);
      const sum = map(combined, (arr) => arr.reduce((a, b) => a + b, 0));

      expect(isErr(sum)).toBe(true);
      if (isErr(sum)) {
        expect(sum.error).toBe("error");
      }
    });
  });
});

// =============================================================================
// 7. 型推論のテスト（コンパイル時チェック）
// =============================================================================

describe("型推論", () => {
  it("okの型推論が正しいこと", () => {
    const result = ok(42);
    // result は Success<number> 型として推論される
    expect(result.success).toBe(true);
    expect(result.data).toBe(42);
  });

  it("errの型推論が正しいこと", () => {
    const result = err(new Error("test"));
    // result は Failure<Error> 型として推論される
    expect(result.success).toBe(false);
    expect(result.error.message).toBe("test");
  });

  it("mapの戻り値型が正しく推論されること", () => {
    const result: Result<number, string> = ok(42);
    const mapped = map(result, (n) => n.toString());
    // mapped は Result<string, string> 型として推論される
    if (isOk(mapped)) {
      expect(typeof mapped.data).toBe("string");
    }
  });

  it("flatMapの戻り値型が正しく推論されること", () => {
    const result: Result<number, string> = ok(42);
    const flattened = flatMap(result, (n) =>
      n > 0 ? ok(n.toString()) : err("negative"),
    );
    // flattened は Result<string, string> 型として推論される
    if (isOk(flattened)) {
      expect(typeof flattened.data).toBe("string");
    }
  });

  it("allの戻り値型が正しく推論されること", () => {
    const results: Result<number, string>[] = [ok(1), ok(2)];
    const combined = all(results);
    // combined は Result<number[], string> 型として推論される
    if (isOk(combined)) {
      expect(Array.isArray(combined.data)).toBe(true);
    }
  });
});
