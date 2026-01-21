import { describe, it, expect } from "vitest";
import {
  ok,
  err,
  type Result,
  isOk,
  isErr,
  map,
  flatMap,
  unwrapOr,
  unwrapOrElse,
  combine,
} from "../Result.js";

describe("Result", () => {
  describe("ok", () => {
    it("値を保持できる", () => {
      // Arrange
      const value = 42;

      // Act
      const result = ok(value);

      // Assert
      expect(result.ok).toBe(true);
      expect(result.value).toBe(42);
    });

    it("nullを保持できる", () => {
      // Act
      const result = ok(null);

      // Assert
      expect(result.ok).toBe(true);
      expect(result.value).toBeNull();
    });
  });

  describe("err", () => {
    it("エラーを保持できる", () => {
      // Arrange
      const error = new Error("test error");

      // Act
      const result = err(error);

      // Assert
      expect(result.ok).toBe(false);
      expect(result.error).toBe(error);
    });
  });

  describe("isOk", () => {
    it("Ok型の場合はtrueを返す", () => {
      // Arrange
      const result = ok(42);

      // Assert
      expect(isOk(result)).toBe(true);
    });

    it("Err型の場合はfalseを返す", () => {
      // Arrange
      const result = err(new Error("test"));

      // Assert
      expect(isOk(result)).toBe(false);
    });
  });

  describe("isErr", () => {
    it("Err型の場合はtrueを返す", () => {
      // Arrange
      const result = err(new Error("test"));

      // Assert
      expect(isErr(result)).toBe(true);
    });

    it("Ok型の場合はfalseを返す", () => {
      // Arrange
      const result = ok(42);

      // Assert
      expect(isErr(result)).toBe(false);
    });
  });

  describe("map", () => {
    it("Okの場合は値を変換できる", () => {
      // Arrange
      const result = ok(10);
      const fn = (x: number) => x * 2;

      // Act
      const mapped = map(result, fn);

      // Assert
      expect(mapped.ok).toBe(true);
      if (mapped.ok) expect(mapped.value).toBe(20);
    });

    it("Errの場合はエラーをそのまま返す", () => {
      // Arrange
      const error = new Error("test");
      const result: Result<number, Error> = err(error);
      const fn = (x: number) => x * 2;

      // Act
      const mapped = map(result, fn);

      // Assert
      expect(mapped.ok).toBe(false);
      if (!mapped.ok) expect(mapped.error).toBe(error);
    });
  });

  describe("flatMap", () => {
    it("Okの場合はResult返却関数を適用できる", () => {
      // Arrange
      const result = ok(10);
      const fn = (x: number) => ok(x * 2);

      // Act
      const flatMapped = flatMap(result, fn);

      // Assert
      expect(flatMapped.ok).toBe(true);
      if (flatMapped.ok) expect(flatMapped.value).toBe(20);
    });

    it("チェーン内でエラーが発生した場合はエラーを返す", () => {
      // Arrange
      const result = ok(10);
      const fn = (_x: number) => err(new Error("chain error"));

      // Act
      const flatMapped = flatMap(result, fn);

      // Assert
      expect(flatMapped.ok).toBe(false);
    });

    it("Errの場合はエラーをそのまま返す", () => {
      // Arrange
      const error = new Error("original error");
      const result: Result<number, Error> = err(error);
      const fn = (x: number) => ok(x * 2);

      // Act
      const flatMapped = flatMap(result, fn);

      // Assert
      expect(flatMapped.ok).toBe(false);
      if (!flatMapped.ok) expect(flatMapped.error).toBe(error);
    });
  });

  describe("unwrapOr", () => {
    it("Okの場合は値を取得できる", () => {
      // Arrange
      const result = ok(42);

      // Act
      const value = unwrapOr(result, 0);

      // Assert
      expect(value).toBe(42);
    });

    it("Errの場合はデフォルト値を返す", () => {
      // Arrange
      const result: Result<number, Error> = err(new Error("test"));

      // Act
      const value = unwrapOr(result, 0);

      // Assert
      expect(value).toBe(0);
    });
  });

  describe("unwrapOrElse", () => {
    it("Okの場合は値を取得できる", () => {
      // Arrange
      const result = ok(42);

      // Act
      const value = unwrapOrElse(result, () => 0);

      // Assert
      expect(value).toBe(42);
    });

    it("Errの場合は関数を実行して値を返す", () => {
      // Arrange
      const result: Result<number, Error> = err(new Error("test"));

      // Act
      const value = unwrapOrElse(result, (e) => e.message.length);

      // Assert
      expect(value).toBe(4); // "test".length
    });
  });

  describe("combine", () => {
    it("全てOkの場合は値の配列を返す", () => {
      // Arrange
      const results = [ok(1), ok(2), ok(3)];

      // Act
      const combined = combine(results);

      // Assert
      expect(combined.ok).toBe(true);
      if (combined.ok) expect(combined.value).toEqual([1, 2, 3]);
    });

    it("一つでもErrがある場合は最初のエラーを返す", () => {
      // Arrange
      const error = new Error("first error");
      const results = [ok(1), err(error), ok(3)];

      // Act
      const combined = combine(results);

      // Assert
      expect(combined.ok).toBe(false);
      if (!combined.ok) expect(combined.error).toBe(error);
    });

    it("空配列の場合は空配列を返す", () => {
      // Arrange
      const results: Result<number, Error>[] = [];

      // Act
      const combined = combine(results);

      // Assert
      expect(combined.ok).toBe(true);
      if (combined.ok) expect(combined.value).toEqual([]);
    });
  });
});
