/**
 * @file buildMessages関数のテスト
 * @description システムプロンプト + ユーザーメッセージからLLMメッセージ配列を構築する関数のテスト
 * @feature system-prompt-llm-api
 */

import { describe, it, expect } from "vitest";
import { buildMessages } from "../buildMessages";

describe("buildMessages", () => {
  describe("正常系", () => {
    it("システムプロンプト付きでメッセージ配列を構築する", () => {
      const result = buildMessages("Hello", "You are a translator");
      expect(result).toEqual([
        { role: "system", content: "You are a translator" },
        { role: "user", content: "Hello" },
      ]);
    });

    it("システムプロンプトなしでユーザーメッセージのみ返す", () => {
      const result = buildMessages("Hello");
      expect(result).toEqual([{ role: "user", content: "Hello" }]);
    });

    it("undefinedのシステムプロンプトでユーザーメッセージのみ返す", () => {
      const result = buildMessages("Hello", undefined);
      expect(result).toEqual([{ role: "user", content: "Hello" }]);
    });

    it("長いシステムプロンプトを正しく構築する", () => {
      const longPrompt =
        "あなたは日本語と英語のプロフェッショナル翻訳者です。与えられた文を正確かつ自然に翻訳してください。専門用語があれば適切に訳語を選んでください。";
      const result = buildMessages("Translate: Hello World", longPrompt);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ role: "system", content: longPrompt });
      expect(result[1]).toEqual({
        role: "user",
        content: "Translate: Hello World",
      });
    });
  });

  describe("空白文字処理", () => {
    it("空文字列のシステムプロンプトは無視する", () => {
      const result = buildMessages("Hello", "");
      expect(result).toEqual([{ role: "user", content: "Hello" }]);
    });

    it("空白のみのシステムプロンプトは無視する", () => {
      const result = buildMessages("Hello", "   ");
      expect(result).toEqual([{ role: "user", content: "Hello" }]);
    });

    it("タブと改行のみのシステムプロンプトは無視する", () => {
      const result = buildMessages("Hello", "\t\n  \n\t");
      expect(result).toEqual([{ role: "user", content: "Hello" }]);
    });

    it("システムプロンプトの前後空白をトリムする", () => {
      const result = buildMessages("Hello", "  Translate to Japanese  ");
      expect(result).toEqual([
        { role: "system", content: "Translate to Japanese" },
        { role: "user", content: "Hello" },
      ]);
    });

    it("システムプロンプトの内部改行は保持する", () => {
      const multiline = "Line 1\nLine 2\nLine 3";
      const result = buildMessages("Hello", multiline);
      expect(result[0]).toEqual({ role: "system", content: multiline });
    });
  });

  describe("境界値", () => {
    it("1文字のシステムプロンプトを処理する", () => {
      const result = buildMessages("Hello", "T");
      expect(result).toEqual([
        { role: "system", content: "T" },
        { role: "user", content: "Hello" },
      ]);
    });

    it("1文字のユーザーメッセージを処理する", () => {
      const result = buildMessages("H");
      expect(result).toEqual([{ role: "user", content: "H" }]);
    });

    it("非常に長いユーザーメッセージを処理する", () => {
      const longMessage = "A".repeat(10000);
      const result = buildMessages(longMessage);
      expect(result).toEqual([{ role: "user", content: longMessage }]);
    });

    it("Unicode文字を含むメッセージを処理する", () => {
      const result = buildMessages("こんにちは 🌸", "あなたはアシスタントです");
      expect(result).toEqual([
        { role: "system", content: "あなたはアシスタントです" },
        { role: "user", content: "こんにちは 🌸" },
      ]);
    });
  });

  describe("メッセージ順序", () => {
    it("systemメッセージが常にuserメッセージの前に配置される", () => {
      const result = buildMessages("User message", "System prompt");
      expect(result[0].role).toBe("system");
      expect(result[1].role).toBe("user");
    });
  });

  // Phase 6: テスト拡充 - 追加境界値テスト
  describe("追加境界値テスト", () => {
    it("空のユーザーメッセージを受け付ける", () => {
      const result = buildMessages("");
      expect(result).toEqual([{ role: "user", content: "" }]);
    });

    it("特殊文字を含むシステムプロンプトを正しく処理する", () => {
      const result = buildMessages(
        "Hello",
        '日本語<script>alert("XSS")</script>',
      );
      expect(result[0].content).toBe('日本語<script>alert("XSS")</script>');
    });

    it("SQLインジェクション風の文字列を含むメッセージを正しく処理する", () => {
      const result = buildMessages("'; DROP TABLE users; --", "System");
      expect(result[1].content).toBe("'; DROP TABLE users; --");
    });

    it("改行コードの混在を正しく処理する", () => {
      const result = buildMessages("Hello", "Line1\r\nLine2\nLine3\rLine4");
      expect(result[0].content).toBe("Line1\r\nLine2\nLine3\rLine4");
    });

    it("絵文字のみのシステムプロンプトを処理する", () => {
      const result = buildMessages("Hello", "🎯🚀✨");
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ role: "system", content: "🎯🚀✨" });
    });

    it("非常に長いシステムプロンプトを処理する", () => {
      const longPrompt = "A".repeat(50000);
      const result = buildMessages("Hello", longPrompt);
      expect(result[0].content).toHaveLength(50000);
    });

    it("nullish coalescing的なパターンを正しく処理する", () => {
      // null/undefinedの代わりに空文字が来た場合
      const result1 = buildMessages("Hello", "");
      expect(result1).toHaveLength(1);

      // undefined
      const result2 = buildMessages("Hello", undefined);
      expect(result2).toHaveLength(1);
    });

    it("制御文字を含むメッセージを処理する", () => {
      const result = buildMessages("Hello\x00World", "System\x1FPrompt");
      expect(result[0].content).toBe("System\x1FPrompt");
      expect(result[1].content).toBe("Hello\x00World");
    });

    it("RTL（右から左）言語を含むメッセージを処理する", () => {
      const result = buildMessages("مرحبا", "أنت مساعد ذكي");
      expect(result).toHaveLength(2);
      expect(result[0].content).toBe("أنت مساعد ذكي");
      expect(result[1].content).toBe("مرحبا");
    });

    it("数値のみのメッセージを処理する", () => {
      const result = buildMessages("12345", "67890");
      expect(result[0].content).toBe("67890");
      expect(result[1].content).toBe("12345");
    });
  });
});
