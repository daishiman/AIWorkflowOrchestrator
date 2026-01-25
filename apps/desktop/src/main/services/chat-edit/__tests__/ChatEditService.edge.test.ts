/**
 * ChatEditService Edge Case Tests
 *
 * Phase 6: 追加のエッジケーステスト
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ChatEditService } from "../ChatEditService";
import { ContextBuilder } from "../ContextBuilder";
import type {
  SendWithContextRequest,
  EditCommandType,
  EditCommand,
} from "../types";

describe("ChatEditService - エッジケース", () => {
  let chatEditService: ChatEditService;
  let contextBuilder: ContextBuilder;
  let mockLLMAdapter: { sendMessage: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    contextBuilder = new ContextBuilder();
    mockLLMAdapter = { sendMessage: vi.fn() };
    chatEditService = new ChatEditService(mockLLMAdapter, contextBuilder);
  });

  describe("sendWithContext - エッジケース", () => {
    it("空のcontextsで正常に処理する", async () => {
      const request: SendWithContextRequest = {
        contexts: [],
        command: {
          type: "refactor" as EditCommandType,
          targetContextId: "ctx-1",
        },
        message: "",
      };

      mockLLMAdapter.sendMessage.mockResolvedValue({
        success: true,
        data: { message: "result" },
      });

      const result = await chatEditService.sendWithContext(request);
      expect(result.success).toBe(true);
    });

    it("タイムアウト時にLLM_ERRORを返す", async () => {
      const request: SendWithContextRequest = {
        contexts: [
          {
            filePath: "/path/to/file.ts",
            content: "code",
            language: "typescript",
          },
        ],
        command: {
          type: "refactor" as EditCommandType,
          targetContextId: "ctx-1",
        },
        message: "",
      };

      mockLLMAdapter.sendMessage.mockRejectedValue(new Error("Timeout"));

      const result = await chatEditService.sendWithContext(request);
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("LLM_ERROR");
      expect(result.error?.retryable).toBe(true);
    });

    it("複数ファイルコンテキストを正しく処理する", async () => {
      const request: SendWithContextRequest = {
        contexts: [
          {
            filePath: "/path/to/a.ts",
            content: "code a",
            language: "typescript",
          },
          {
            filePath: "/path/to/b.ts",
            content: "code b",
            language: "typescript",
          },
          {
            filePath: "/path/to/c.ts",
            content: "code c",
            language: "typescript",
          },
        ],
        command: {
          type: "refactor" as EditCommandType,
          targetContextId: "ctx-1",
        },
        message: "",
      };

      mockLLMAdapter.sendMessage.mockResolvedValue({
        success: true,
        data: { message: "refactored code" },
      });

      const result = await chatEditService.sendWithContext(request);
      expect(result.success).toBe(true);
    });

    it("targetContextIdに一致するコンテキストを正しく使用する", async () => {
      const request: SendWithContextRequest = {
        contexts: [
          {
            filePath: "/path/to/a.ts",
            content: "code a",
            language: "typescript",
          },
          {
            filePath: "/path/to/b.ts",
            content: "code b",
            language: "typescript",
          },
        ],
        command: {
          type: "refactor" as EditCommandType,
          targetContextId: "/path/to/b.ts",
        },
        message: "",
      };

      mockLLMAdapter.sendMessage.mockResolvedValue({
        success: true,
        data: { message: "```typescript\nrefactored b\n```" },
      });

      const result = await chatEditService.sendWithContext(request);
      expect(result.success).toBe(true);
      expect(result.result?.contextId).toBe("/path/to/b.ts");
      expect(result.result?.originalContent).toBe("code b");
    });
  });

  describe("buildPrompt - 全コマンドタイプ", () => {
    it("continueコマンドで続きのプロンプトを生成する", () => {
      const command: EditCommand = {
        type: "continue",
        targetContextId: "ctx-1",
      };

      const prompt = chatEditService.buildPrompt(command, "context");
      expect(prompt).toContain("続きを書いてください");
    });

    it("refactorコマンドでリファクタリングプロンプトを生成する", () => {
      const command: EditCommand = {
        type: "refactor",
        targetContextId: "ctx-1",
      };

      const prompt = chatEditService.buildPrompt(command, "context");
      expect(prompt).toContain("リファクタリング");
    });

    it("generate-testコマンドでテスト生成プロンプトを生成する", () => {
      const command: EditCommand = {
        type: "generate-test",
        targetContextId: "ctx-1",
      };

      const prompt = chatEditService.buildPrompt(command, "context");
      expect(prompt).toContain("テストを生成");
    });

    it("add-commentコマンドでコメント追加プロンプトを生成する", () => {
      const command: EditCommand = {
        type: "add-comment",
        targetContextId: "ctx-1",
      };

      const prompt = chatEditService.buildPrompt(command, "context");
      expect(prompt).toContain("コメントを追加");
    });

    it("customコマンドでinstructionを使用する", () => {
      const command: EditCommand = {
        type: "custom",
        targetContextId: "ctx-1",
        instruction: "日本語でコメントを追加",
      };

      const prompt = chatEditService.buildPrompt(command, "context");
      expect(prompt).toContain("日本語でコメントを追加");
    });

    it("customコマンドでinstructionがない場合も動作する", () => {
      const command: EditCommand = {
        type: "custom",
        targetContextId: "ctx-1",
      };

      const prompt = chatEditService.buildPrompt(command, "context");
      expect(prompt).toContain("context");
    });
  });

  describe("parseResponse - エッジケース", () => {
    it("コードブロックなしのレスポンスを処理する", () => {
      const response = "Plain text response without code block";
      const result = chatEditService.parseResponse(
        response,
        { type: "refactor" as EditCommandType, targetContextId: "ctx-1" },
        "original",
        "/path/to/file.ts",
      );
      expect(result.generatedContent).toBe(
        "Plain text response without code block",
      );
    });

    it("複数コードブロックがある場合最初のものを使用する", () => {
      const response =
        "```typescript\nfirst\n```\n\n```typescript\nsecond\n```";
      const result = chatEditService.parseResponse(
        response,
        { type: "refactor" as EditCommandType, targetContextId: "ctx-1" },
        "original",
        "/path/to/file.ts",
      );
      expect(result.generatedContent).toBe("first");
    });

    it("空のコードブロックを正しく処理する", () => {
      const response = "```typescript\n\n```";
      const result = chatEditService.parseResponse(
        response,
        { type: "refactor" as EditCommandType, targetContextId: "ctx-1" },
        "original",
        "/path/to/file.ts",
      );
      expect(result.generatedContent).toBe("");
    });

    it("言語指定なしのコードブロックを処理する", () => {
      const response = "```\ncode without language\n```";
      const result = chatEditService.parseResponse(
        response,
        { type: "refactor" as EditCommandType, targetContextId: "ctx-1" },
        "original",
        "/path/to/file.ts",
      );
      expect(result.generatedContent).toBe("code without language");
    });

    it("同じ内容の場合diffHunksが空になる", () => {
      const content = "same content";
      const result = chatEditService.parseResponse(
        content,
        { type: "refactor" as EditCommandType, targetContextId: "ctx-1" },
        content,
        "/path/to/file.ts",
      );
      expect(result.diffHunks).toHaveLength(0);
    });

    it("異なる内容の場合diffHunksが生成される", () => {
      const result = chatEditService.parseResponse(
        "new content",
        { type: "refactor" as EditCommandType, targetContextId: "ctx-1" },
        "original content",
        "/path/to/file.ts",
      );
      expect(result.diffHunks.length).toBeGreaterThan(0);
      expect(result.diffHunks[0].type).toBe("modify");
    });

    it("生成されたIDがUUID形式である", () => {
      const result = chatEditService.parseResponse(
        "content",
        { type: "refactor" as EditCommandType, targetContextId: "ctx-1" },
        "original",
        "/path/to/file.ts",
      );
      // UUID v4形式をチェック
      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it("createdAtがDate型である", () => {
      const result = chatEditService.parseResponse(
        "content",
        { type: "refactor" as EditCommandType, targetContextId: "ctx-1" },
        "original",
        "/path/to/file.ts",
      );
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it("statusがpendingである", () => {
      const result = chatEditService.parseResponse(
        "content",
        { type: "refactor" as EditCommandType, targetContextId: "ctx-1" },
        "original",
        "/path/to/file.ts",
      );
      expect(result.status).toBe("pending");
    });
  });
});
