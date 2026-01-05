/**
 * ユーティリティ関数テスト
 * @description TDD Red Phase - 実装前のテスト作成
 */

import { describe, it, expect } from "vitest";
import {
  normalizeEntityName,
  escapeRegex,
  mergeOptions,
  findMentionsInText,
} from "../utils";
import type { EntityExtractionOptionsInput } from "../types";

describe("utils", () => {
  describe("normalizeEntityName", () => {
    it("小文字に変換する", () => {
      expect(normalizeEntityName("TypeScript")).toBe("typescript");
      expect(normalizeEntityName("REACT")).toBe("react");
    });

    it("前後の空白を除去する", () => {
      expect(normalizeEntityName("  TypeScript  ")).toBe("typescript");
    });

    it("複数の空白を単一空白に変換する", () => {
      expect(normalizeEntityName("Next   JS")).toBe("next js");
    });

    it("空文字列を処理できる", () => {
      expect(normalizeEntityName("")).toBe("");
    });

    it("日本語を処理できる", () => {
      expect(normalizeEntityName("マイクロソフト")).toBe("マイクロソフト");
    });
  });

  describe("escapeRegex", () => {
    it("特殊文字をエスケープする", () => {
      expect(escapeRegex("Next.js")).toBe("Next\\.js");
      expect(escapeRegex("C++")).toBe("C\\+\\+");
      expect(escapeRegex("(test)")).toBe("\\(test\\)");
    });

    it("通常の文字列はそのまま返す", () => {
      expect(escapeRegex("React")).toBe("React");
      expect(escapeRegex("typescript")).toBe("typescript");
    });

    it("空文字列を処理できる", () => {
      expect(escapeRegex("")).toBe("");
    });

    it("複数の特殊文字をエスケープする", () => {
      expect(escapeRegex("[a-z]+.*?")).toBe("\\[a-z\\]\\+\\.\\*\\?");
    });
  });

  describe("mergeOptions", () => {
    it("デフォルト値を適用する", () => {
      const merged = mergeOptions(undefined);

      expect(merged.maxEntitiesPerChunk).toBe(20);
      expect(merged.minConfidence).toBe(0.5);
      expect(merged.minNameLength).toBe(2);
      expect(merged.useLLM).toBe(true);
      expect(merged.generateDescriptions).toBe(true);
    });

    it("指定値でオーバーライドする", () => {
      const options: EntityExtractionOptionsInput = {
        maxEntitiesPerChunk: 10,
        minConfidence: 0.8,
      };

      const merged = mergeOptions(options);

      expect(merged.maxEntitiesPerChunk).toBe(10);
      expect(merged.minConfidence).toBe(0.8);
      expect(merged.minNameLength).toBe(2); // デフォルト
    });

    it("typesが指定されている場合はそのまま使用する", () => {
      const options: EntityExtractionOptionsInput = {
        types: ["technology", "organization"],
      };

      const merged = mergeOptions(options);

      expect(merged.types).toEqual(["technology", "organization"]);
    });

    it("空のオプションでもデフォルトを返す", () => {
      const merged = mergeOptions({});

      expect(merged.maxEntitiesPerChunk).toBe(20);
    });
  });

  describe("findMentionsInText", () => {
    it("テキスト内のエンティティ出現位置を検出する", () => {
      const content = "TypeScriptはTypeScriptの機能です。";
      const mentions = findMentionsInText("TypeScript", content, "chunk-1");

      expect(mentions.length).toBe(2);
      expect(mentions[0].startPosition).toBe(0);
      // "TypeScript"(10) + "は"(1) = 11 で2番目のTypeScriptが始まる
      expect(mentions[1].startPosition).toBe(11);
    });

    it("大文字小文字を区別せず検出する", () => {
      const content = "typescript and TYPESCRIPT and TypeScript";
      const mentions = findMentionsInText("TypeScript", content, "chunk-1");

      expect(mentions.length).toBe(3);
    });

    it("コンテキストを抽出する", () => {
      const content = "前のテキストTypeScript後のテキスト";
      const mentions = findMentionsInText("TypeScript", content, "chunk-1");

      expect(mentions[0].context).toContain("TypeScript");
      expect(mentions[0].context.length).toBeLessThanOrEqual(200);
    });

    it("マッチしない場合は空配列を返す", () => {
      const content = "This is some text without the target.";
      const mentions = findMentionsInText("TypeScript", content, "chunk-1");

      expect(mentions).toEqual([]);
    });

    it("特殊文字を含むエンティティ名を処理できる", () => {
      const content = "Using Next.js for web development.";
      const mentions = findMentionsInText("Next.js", content, "chunk-1");

      expect(mentions.length).toBe(1);
    });

    it("チャンクIDを正しく設定する", () => {
      const content = "React is popular.";
      const mentions = findMentionsInText("React", content, "custom-chunk-id");

      expect(mentions[0].chunkId).toBe("custom-chunk-id");
    });
  });
});
