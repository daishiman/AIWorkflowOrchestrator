/**
 * ChatEdit Integration Tests
 *
 * サービス間の統合テスト
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { FileService } from "../FileService";
import { ContextBuilder } from "../ContextBuilder";
import { ChatEditService } from "../ChatEditService";

describe("ChatEdit Integration Tests", () => {
  let fileService: FileService;
  let contextBuilder: ContextBuilder;
  let chatEditService: ChatEditService;
  let mockLLMAdapter: { sendMessage: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    fileService = new FileService();
    contextBuilder = new ContextBuilder();
    mockLLMAdapter = { sendMessage: vi.fn() };
    chatEditService = new ChatEditService(mockLLMAdapter, contextBuilder);
  });

  describe("FileService -> ContextBuilder -> ChatEditService フロー", () => {
    it("ファイル読み取り → コンテキスト構築 → LLMリクエストの一連の流れが動作する", async () => {
      // ファイル読み取りをモック
      vi.spyOn(fileService, "readFile").mockResolvedValue({
        success: true,
        content: "const x = 1;",
        language: "typescript",
        fileSize: 12,
      });

      // LLMレスポンスをモック
      mockLLMAdapter.sendMessage.mockResolvedValue({
        success: true,
        data: { message: "```typescript\nconst x: number = 1;\n```" },
      });

      // ファイル読み取り
      const readResult = await fileService.readFile("/path/to/file.ts");
      expect(readResult.success).toBe(true);

      // コンテキスト構築
      const contexts = [
        {
          filePath: "/path/to/file.ts",
          content: readResult.content!,
          language: readResult.language!,
        },
      ];
      const contextString = contextBuilder.build(contexts);
      expect(contextString).toContain("file.ts");

      // LLMリクエスト
      const result = await chatEditService.sendWithContext({
        contexts,
        command: { type: "refactor", targetContextId: "ctx-1" },
        message: "",
      });

      expect(result.success).toBe(true);
      expect(result.result?.generatedContent).toBe("const x: number = 1;");
    });

    it("コンテキストサイズ超過でエラーが正しく伝播する", async () => {
      // 大きなコンテンツ
      const largeContent = "a".repeat(100 * 1024 + 1);

      const contexts = [
        {
          filePath: "/path/to/file.ts",
          content: largeContent,
          language: "typescript",
        },
      ];

      // サイズ検証
      expect(contextBuilder.validateSize(contexts)).toBe(false);

      // LLMリクエスト - サイズ超過エラー
      const result = await chatEditService.sendWithContext({
        contexts,
        command: { type: "refactor", targetContextId: "ctx-1" },
        message: "",
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("CONTEXT_TOO_LARGE");
    });

    it("LLMエラー時にエラーが正しく伝播する", async () => {
      // LLMエラーをモック
      mockLLMAdapter.sendMessage.mockResolvedValue({
        success: false,
        error: { message: "API Error" },
      });

      const contexts = [
        {
          filePath: "/path/to/file.ts",
          content: "const x = 1;",
          language: "typescript",
        },
      ];

      const result = await chatEditService.sendWithContext({
        contexts,
        command: { type: "refactor", targetContextId: "ctx-1" },
        message: "",
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("LLM_ERROR");
      expect(result.error?.retryable).toBe(true);
    });

    it("選択範囲付きコンテキストが正しく処理される", async () => {
      mockLLMAdapter.sendMessage.mockResolvedValue({
        success: true,
        data: { message: "```typescript\nselected code refactored\n```" },
      });

      const contexts = [
        {
          filePath: "/path/to/file.ts",
          content: "full file content",
          language: "typescript",
          selection: {
            startLine: 5,
            endLine: 10,
            startColumn: 1,
            endColumn: 1,
            selectedText: "selected code",
          },
        },
      ];

      // コンテキスト構築で選択範囲が含まれる
      const contextString = contextBuilder.build(contexts);
      expect(contextString).toContain("L5-L10");
      expect(contextString).toContain("選択範囲");
      expect(contextString).toContain("selected code");

      // LLMリクエスト
      const result = await chatEditService.sendWithContext({
        contexts,
        command: { type: "refactor", targetContextId: "ctx-1" },
        message: "",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("エラー伝播テスト", () => {
    it("無効なコマンドタイプでエラーを返す", async () => {
      const contexts = [
        {
          filePath: "/path/to/file.ts",
          content: "const x = 1;",
          language: "typescript",
        },
      ];

      const result = await chatEditService.sendWithContext({
        contexts,
        command: {
          type: "invalid-type" as any,
          targetContextId: "ctx-1",
        },
        message: "",
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INVALID_COMMAND");
    });

    it("LLM例外発生時にエラーを返す", async () => {
      mockLLMAdapter.sendMessage.mockRejectedValue(
        new Error("Network failure"),
      );

      const contexts = [
        {
          filePath: "/path/to/file.ts",
          content: "const x = 1;",
          language: "typescript",
        },
      ];

      const result = await chatEditService.sendWithContext({
        contexts,
        command: { type: "refactor", targetContextId: "ctx-1" },
        message: "",
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("LLM_ERROR");
      expect(result.error?.message).toContain("Network failure");
    });
  });

  describe("複数ファイル統合テスト", () => {
    it("複数ファイルのコンテキストを正しく処理する", async () => {
      mockLLMAdapter.sendMessage.mockResolvedValue({
        success: true,
        data: { message: "```typescript\nmerged result\n```" },
      });

      const contexts = [
        {
          filePath: "/path/to/a.ts",
          content: "const a = 1;",
          language: "typescript",
        },
        {
          filePath: "/path/to/b.ts",
          content: "const b = 2;",
          language: "typescript",
        },
        {
          filePath: "/path/to/c.py",
          content: "c = 3",
          language: "python",
        },
      ];

      // コンテキスト構築
      const contextString = contextBuilder.build(contexts);
      expect(contextString).toContain("a.ts");
      expect(contextString).toContain("b.ts");
      expect(contextString).toContain("c.py");
      expect(contextString).toContain("```typescript");
      expect(contextString).toContain("```python");

      // LLMリクエスト
      const result = await chatEditService.sendWithContext({
        contexts,
        command: { type: "refactor", targetContextId: "/path/to/a.ts" },
        message: "",
      });

      expect(result.success).toBe(true);
    });
  });
});
