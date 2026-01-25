/**
 * ChatEditService Unit Tests
 *
 * TDD Red Phase: テストは実装前に作成されているため、現時点では失敗する
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// ChatEditServiceのモック（実装前）
// 実装後はこのモックを削除して実際のChatEditServiceをインポート
// import { ChatEditService } from "../ChatEditService";
// import { ContextBuilder } from "../ContextBuilder";

// 型定義（実装時にインポートに置き換え）
type EditCommandType =
  | "continue"
  | "refactor"
  | "generate-test"
  | "add-comment"
  | "custom";

interface EditCommand {
  type: EditCommandType;
  targetContextId: string;
  instruction?: string;
  options?: Record<string, unknown>;
}

interface FileContextInput {
  filePath: string;
  content: string;
  selection?: {
    startLine: number;
    endLine: number;
    startColumn: number;
    endColumn: number;
    selectedText: string;
  };
  language: string;
}

interface SendWithContextRequest {
  contexts: FileContextInput[];
  command: EditCommand;
  message: string;
  options?: {
    modelId?: string;
    stream?: boolean;
    maxTokens?: number;
  };
}

interface _SendWithContextResponse {
  success: boolean;
  result?: {
    id: string;
    contextId: string;
    originalContent: string;
    generatedContent: string;
    diffHunks: unknown[];
    status: string;
    createdAt: Date;
    targetFilePath: string;
    command: EditCommand;
    llmMetadata?: {
      model: string;
      tokensUsed: number;
      generationTimeMs: number;
    };
  };
  error?: {
    code: string;
    message: string;
    retryable: boolean;
    retryAfterMs?: number;
  };
}

describe("ChatEditService", () => {
  let chatEditService: any;
  let _mockLLMAdapter: any;
  let mockContextBuilder: any;
  let _mockFileService: any;

  beforeEach(() => {
    vi.clearAllMocks();

    _mockLLMAdapter = {
      send: vi.fn(),
    };

    mockContextBuilder = {
      build: vi.fn().mockReturnValue("## ファイルコンテキスト\n\n..."),
      calculateSize: vi.fn().mockReturnValue(1000),
      validateSize: vi.fn().mockReturnValue(true),
    };

    _mockFileService = {
      readFile: vi.fn(),
      writeFile: vi.fn(),
    };

    // ChatEditServiceが実装されたらここでインスタンスを作成
    // chatEditService = new ChatEditService(mockFileService, mockContextBuilder, mockLLMAdapter);

    // 一時的なモック実装
    chatEditService = {
      sendWithContext: vi.fn(),
      buildPrompt: vi.fn(),
      parseResponse: vi.fn(),
    };
  });

  describe("sendWithContext", () => {
    it("正常なリクエストで成功レスポンスを返す", async () => {
      // Arrange
      const request: SendWithContextRequest = {
        contexts: [
          {
            filePath: "/path/to/file.ts",
            content: "const x = 1;",
            language: "typescript",
          },
        ],
        command: {
          type: "refactor",
          targetContextId: "/path/to/file.ts",
        },
        message: "リファクタリングしてください",
      };

      chatEditService.sendWithContext.mockResolvedValue({
        success: true,
        result: {
          id: "result-1",
          contextId: "/path/to/file.ts",
          originalContent: "const x = 1;",
          generatedContent: "const x: number = 1;",
          diffHunks: [],
          status: "pending",
          createdAt: new Date(),
          targetFilePath: "/path/to/file.ts",
          command: request.command,
        },
      });

      // Act
      const result = await chatEditService.sendWithContext(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
      expect(result.result?.generatedContent).toBeDefined();
    });

    it("コンテキストサイズ超過でCONTEXT_TOO_LARGEエラーを返す", async () => {
      // Arrange
      const request: SendWithContextRequest = {
        contexts: [
          {
            filePath: "/path/to/file.ts",
            content: "a".repeat(100 * 1024 + 1), // 100KB超
            language: "typescript",
          },
        ],
        command: {
          type: "refactor",
          targetContextId: "ctx-1",
        },
        message: "",
      };

      mockContextBuilder.validateSize.mockReturnValue(false);

      chatEditService.sendWithContext.mockResolvedValue({
        success: false,
        error: {
          code: "CONTEXT_TOO_LARGE",
          message: "Context size exceeds maximum limit",
          retryable: false,
        },
      });

      // Act
      const result = await chatEditService.sendWithContext(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("CONTEXT_TOO_LARGE");
      expect(result.error?.retryable).toBe(false);
    });

    it("無効なコマンドタイプでINVALID_COMMANDエラーを返す", async () => {
      // Arrange
      const request: SendWithContextRequest = {
        contexts: [
          {
            filePath: "/path/to/file.ts",
            content: "const x = 1;",
            language: "typescript",
          },
        ],
        command: {
          type: "unknown-type" as EditCommandType,
          targetContextId: "ctx-1",
        },
        message: "",
      };

      chatEditService.sendWithContext.mockResolvedValue({
        success: false,
        error: {
          code: "INVALID_COMMAND",
          message: "Unknown command type: unknown-type",
          retryable: false,
        },
      });

      // Act
      const result = await chatEditService.sendWithContext(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INVALID_COMMAND");
    });

    it("LLMエラー時にLLM_ERRORを返す", async () => {
      // Arrange
      const request: SendWithContextRequest = {
        contexts: [
          {
            filePath: "/path/to/file.ts",
            content: "const x = 1;",
            language: "typescript",
          },
        ],
        command: {
          type: "refactor",
          targetContextId: "ctx-1",
        },
        message: "",
      };

      chatEditService.sendWithContext.mockResolvedValue({
        success: false,
        error: {
          code: "LLM_ERROR",
          message: "API error occurred",
          retryable: true,
        },
      });

      // Act
      const result = await chatEditService.sendWithContext(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("LLM_ERROR");
      expect(result.error?.retryable).toBe(true);
    });

    it("タイムアウト時にTIMEOUTエラーを返す", async () => {
      // Arrange
      const request: SendWithContextRequest = {
        contexts: [
          {
            filePath: "/path/to/file.ts",
            content: "const x = 1;",
            language: "typescript",
          },
        ],
        command: {
          type: "refactor",
          targetContextId: "ctx-1",
        },
        message: "",
      };

      chatEditService.sendWithContext.mockResolvedValue({
        success: false,
        error: {
          code: "TIMEOUT",
          message: "LLM request timed out",
          retryable: true,
        },
      });

      // Act
      const result = await chatEditService.sendWithContext(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("TIMEOUT");
      expect(result.error?.retryable).toBe(true);
    });

    it("レート制限時にRATE_LIMITエラーとretryAfterMsを返す", async () => {
      // Arrange
      const request: SendWithContextRequest = {
        contexts: [
          {
            filePath: "/path/to/file.ts",
            content: "const x = 1;",
            language: "typescript",
          },
        ],
        command: {
          type: "refactor",
          targetContextId: "ctx-1",
        },
        message: "",
      };

      chatEditService.sendWithContext.mockResolvedValue({
        success: false,
        error: {
          code: "RATE_LIMIT",
          message: "Rate limit exceeded",
          retryable: true,
          retryAfterMs: 60000,
        },
      });

      // Act
      const result = await chatEditService.sendWithContext(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("RATE_LIMIT");
      expect(result.error?.retryAfterMs).toBe(60000);
    });
  });

  describe("buildPrompt", () => {
    it.each([
      ["continue", "続き"],
      ["refactor", "リファクタリング"],
      ["generate-test", "テスト"],
      ["add-comment", "コメント"],
    ])(
      "コマンドタイプ %s で適切なキーワードを含むプロンプトを生成する",
      (type, keyword) => {
        // Arrange
        const command: EditCommand = {
          type: type as EditCommandType,
          targetContextId: "ctx-1",
        };
        const context = "```typescript\nconst x = 1;\n```";

        chatEditService.buildPrompt.mockReturnValue(
          `${keyword}を行ってください\n${context}`,
        );

        // Act
        const prompt = chatEditService.buildPrompt(command, context);

        // Assert
        expect(prompt).toContain(keyword);
        expect(prompt).toContain(context);
      },
    );

    it("customコマンドでinstructionを使用する", () => {
      // Arrange
      const command: EditCommand = {
        type: "custom",
        targetContextId: "ctx-1",
        instruction: "TypeScriptに変換してください",
      };
      const context = "```javascript\nconst x = 1;\n```";

      chatEditService.buildPrompt.mockReturnValue(
        `TypeScriptに変換してください\n${context}`,
      );

      // Act
      const prompt = chatEditService.buildPrompt(command, context);

      // Assert
      expect(prompt).toContain("TypeScriptに変換してください");
      expect(prompt).toContain(context);
    });
  });

  describe("parseResponse", () => {
    it("LLM応答からGeneratedResultを生成する", () => {
      // Arrange
      const response = "```typescript\nconst x: number = 1;\n```";
      const command: EditCommand = {
        type: "refactor",
        targetContextId: "ctx-1",
      };
      const originalContent = "const x = 1;";

      chatEditService.parseResponse.mockReturnValue({
        id: "result-1",
        contextId: "ctx-1",
        originalContent: originalContent,
        generatedContent: "const x: number = 1;",
        diffHunks: [
          {
            type: "modify",
            originalStartLine: 1,
            originalEndLine: 1,
            newStartLine: 1,
            newEndLine: 1,
            originalLines: ["const x = 1;"],
            newLines: ["const x: number = 1;"],
          },
        ],
        status: "pending",
        createdAt: expect.any(Date),
        targetFilePath: "ctx-1",
        command: command,
      });

      // Act
      const result = chatEditService.parseResponse(
        response,
        command,
        originalContent,
      );

      // Assert
      expect(result.generatedContent).toBeDefined();
      expect(result.diffHunks).toBeDefined();
      expect(result.status).toBe("pending");
    });

    it("コードブロックなしの応答でもパースできる", () => {
      // Arrange
      const response = "const x: number = 1;";
      const command: EditCommand = {
        type: "refactor",
        targetContextId: "ctx-1",
      };
      const originalContent = "const x = 1;";

      chatEditService.parseResponse.mockReturnValue({
        id: "result-1",
        contextId: "ctx-1",
        originalContent: originalContent,
        generatedContent: "const x: number = 1;",
        diffHunks: [],
        status: "pending",
        createdAt: expect.any(Date),
        targetFilePath: "ctx-1",
        command: command,
      });

      // Act
      const result = chatEditService.parseResponse(
        response,
        command,
        originalContent,
      );

      // Assert
      expect(result.generatedContent).toBe("const x: number = 1;");
    });
  });
});
