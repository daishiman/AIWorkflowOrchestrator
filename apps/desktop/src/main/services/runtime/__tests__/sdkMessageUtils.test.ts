/**
 * sdkMessageUtils テスト
 * SDK メッセージ前処理 helper のユニットテスト
 */
import { describe, expect, it } from "vitest";

import { asSdkMessageRecord, getSdkMessageType } from "../sdkMessageUtils";

describe("asSdkMessageRecord", () => {
  it("null を渡すと null を返す", () => {
    expect(asSdkMessageRecord(null)).toBeNull();
  });

  it("undefined を渡すと null を返す", () => {
    expect(asSdkMessageRecord(undefined)).toBeNull();
  });

  it("文字列を渡すと null を返す", () => {
    expect(asSdkMessageRecord("hello")).toBeNull();
  });

  it("数値を渡すと null を返す", () => {
    expect(asSdkMessageRecord(42)).toBeNull();
  });

  it("配列を渡すと null を返す", () => {
    expect(asSdkMessageRecord([1, 2, 3])).toBeNull();
  });

  it("空オブジェクトを渡すと record を返す", () => {
    const result = asSdkMessageRecord({});
    expect(result).toEqual({});
  });

  it("type フィールドを持つ plain object を渡すと record を返す", () => {
    const input = { type: "text", content: "hello" };
    const result = asSdkMessageRecord(input);
    expect(result).toEqual({ type: "text", content: "hello" });
  });
});

describe("getSdkMessageType", () => {
  it('type: "text" のメッセージから "text" を返す', () => {
    expect(getSdkMessageType({ type: "text" })).toBe("text");
  });

  it('type: "error" のメッセージから "error" を返す', () => {
    expect(getSdkMessageType({ type: "error" })).toBe("error");
  });

  it("type フィールドなしのメッセージから undefined を返す", () => {
    expect(getSdkMessageType({ content: "hello" })).toBeUndefined();
  });

  it("type: 123 (数値) のメッセージから undefined を返す", () => {
    expect(getSdkMessageType({ type: 123 })).toBeUndefined();
  });

  it('type: "" (空文字) のメッセージから "" を返す', () => {
    expect(getSdkMessageType({ type: "" })).toBe("");
  });
});

// Phase 6: エッジケーステスト
describe("asSdkMessageRecord - エッジケース", () => {
  it("Symbol を渡すと null を返す", () => {
    expect(asSdkMessageRecord(Symbol("test"))).toBeNull();
  });

  it("BigInt を渡すと null を返す", () => {
    expect(asSdkMessageRecord(BigInt(1))).toBeNull();
  });

  it("boolean を渡すと null を返す", () => {
    expect(asSdkMessageRecord(true)).toBeNull();
  });

  it("ネストされた content を持つオブジェクトは record を返す", () => {
    const input = { content: { nested: true } };
    const result = asSdkMessageRecord(input);
    expect(result).toEqual({ content: { nested: true } });
  });

  it("assistant content 配列を持つオブジェクトは record を返す", () => {
    const input = { type: "assistant", content: [] };
    const result = asSdkMessageRecord(input);
    expect(result).toEqual({ type: "assistant", content: [] });
  });
});

describe("getSdkMessageType - エッジケース", () => {
  it("type: null のメッセージから undefined を返す", () => {
    expect(getSdkMessageType({ type: null })).toBeUndefined();
  });

  it("type: undefined のメッセージから undefined を返す", () => {
    expect(getSdkMessageType({ type: undefined })).toBeUndefined();
  });

  it("type: boolean のメッセージから undefined を返す", () => {
    expect(getSdkMessageType({ type: true })).toBeUndefined();
  });

  it('type: "assistant" を正しく返す', () => {
    expect(getSdkMessageType({ type: "assistant", content: [] })).toBe(
      "assistant",
    );
  });
});
