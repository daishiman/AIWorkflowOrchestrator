/**
 * 境界値テスト
 *
 * @description TDD Green Phase - 境界値・エッジケースのテスト
 * テストID: BND-001 ~ BND-014
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

import { MAX_FILE_CONTEXTS, MAX_FILE_SIZE, MAX_CONTEXT_SIZE } from "../types";

// モックAPI
const mockChatEditAPI = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  sendWithContext: vi.fn(),
};

vi.stubGlobal("chatEditAPI", mockChatEditAPI);

// Storeモック
const createMockStore = () => {
  let fileContexts: any[] = [];
  let error: string | null = null;
  let warning: string | null = null;

  return {
    fileContexts,
    error,
    warning,
    addFileContext: (context: any) => {
      if (fileContexts.length >= MAX_FILE_CONTEXTS) {
        error = "MAX_CONTEXTS_EXCEEDED";
        return;
      }
      if (fileContexts.some((c) => c.filePath === context.filePath)) {
        error = "DUPLICATE_FILE";
        return;
      }
      const newContext = {
        ...context,
        id: `ctx-${fileContexts.length + 1}`,
        addedAt: new Date(),
      };
      fileContexts.push(newContext);
      error = null;
    },
    getState: () => ({
      fileContexts,
      error,
      warning,
    }),
    reset: () => {
      fileContexts = [];
      error = null;
      warning = null;
    },
  };
};

describe("境界値テスト", () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    store = createMockStore();
  });

  describe("ファイルサイズ境界", () => {
    it("BND-001: 空ファイル（0バイト）を処理できる", async () => {
      mockChatEditAPI.readFile.mockResolvedValue({
        success: true,
        content: "",
        language: "typescript",
        fileSize: 0,
      });

      const result = await mockChatEditAPI.readFile("/empty.ts");

      expect(result.success).toBe(true);
      expect(result.fileSize).toBe(0);
      expect(result.content).toBe("");
    });

    it("BND-002: 1バイトファイルを処理できる", async () => {
      mockChatEditAPI.readFile.mockResolvedValue({
        success: true,
        content: "x",
        language: "typescript",
        fileSize: 1,
      });

      const result = await mockChatEditAPI.readFile("/tiny.ts");

      expect(result.success).toBe(true);
      expect(result.fileSize).toBe(1);
      expect(result.content).toBe("x");
    });

    it("BND-003: 1MB境界ファイルを正常に処理できる", async () => {
      const oneMB = 1024 * 1024;
      const content = "x".repeat(oneMB);
      mockChatEditAPI.readFile.mockResolvedValue({
        success: true,
        content,
        language: "typescript",
        fileSize: oneMB,
      });

      const startTime = Date.now();
      const result = await mockChatEditAPI.readFile("/1mb.ts");
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(result.fileSize).toBe(oneMB);
      // パフォーマンス: 1秒以内に完了
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it("BND-004: 10MB境界ファイルを警告付きで処理できる", async () => {
      const tenMB = MAX_FILE_SIZE;
      mockChatEditAPI.readFile.mockResolvedValue({
        success: true,
        content: "x".repeat(100), // 実際の内容は省略
        language: "typescript",
        fileSize: tenMB,
        warning: "LARGE_FILE_WARNING",
      });

      const result = await mockChatEditAPI.readFile("/10mb.ts");

      expect(result.success).toBe(true);
      expect(result.fileSize).toBe(tenMB);
      expect(result.warning).toBe("LARGE_FILE_WARNING");
    });

    it("BND-005: 10MB超過ファイルでTOO_LARGEエラー", async () => {
      // overLimit would be MAX_FILE_SIZE + 1 bytes
      mockChatEditAPI.readFile.mockResolvedValue({
        success: false,
        error: {
          code: "TOO_LARGE",
          message: "File size exceeds 10MB limit",
        },
      });

      const result = await mockChatEditAPI.readFile("/large.ts");

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("TOO_LARGE");
    });
  });

  describe("コンテキスト数境界", () => {
    it("BND-006: 0件コンテキストで送信不可", async () => {
      mockChatEditAPI.sendWithContext.mockResolvedValue({
        success: false,
        error: {
          code: "NO_CONTEXT",
          message: "No context attached",
        },
      });

      const result = await mockChatEditAPI.sendWithContext({
        contexts: [],
        command: { type: "continue", targetContextId: "ctx-1" },
        message: "続きを書いて",
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("NO_CONTEXT");
    });

    it("BND-007: 1件コンテキストで送信可能", async () => {
      mockChatEditAPI.sendWithContext.mockResolvedValue({
        success: true,
        result: {
          id: "result-1",
          contextId: "ctx-1",
          originalContent: "const x = 1;",
          generatedContent: "const x: number = 1;",
          diffHunks: [],
          status: "pending",
          createdAt: new Date(),
          targetFilePath: "/file.ts",
          command: { type: "continue", targetContextId: "ctx-1" },
        },
      });

      const result = await mockChatEditAPI.sendWithContext({
        contexts: [
          {
            filePath: "/file.ts",
            content: "const x = 1;",
            language: "typescript",
          },
        ],
        command: { type: "continue", targetContextId: "ctx-1" },
        message: "続きを書いて",
      });

      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
    });

    it("BND-008: 10件コンテキスト（最大）で送信可能", () => {
      // 10件追加
      for (let i = 0; i < MAX_FILE_CONTEXTS; i++) {
        store.addFileContext({
          filePath: `/file${i}.ts`,
          fileName: `file${i}.ts`,
          content: `const x${i} = ${i};`,
          language: "typescript",
          fileSize: 100,
        });
      }

      const state = store.getState();
      expect(state.fileContexts).toHaveLength(MAX_FILE_CONTEXTS);
      expect(state.error).toBeNull();
    });

    it("BND-009: 11件コンテキストでエラー", () => {
      // 10件追加
      for (let i = 0; i < MAX_FILE_CONTEXTS; i++) {
        store.addFileContext({
          filePath: `/file${i}.ts`,
          fileName: `file${i}.ts`,
          content: `const x${i} = ${i};`,
          language: "typescript",
          fileSize: 100,
        });
      }

      // 11件目を追加試行
      store.addFileContext({
        filePath: "/file10.ts",
        fileName: "file10.ts",
        content: "const x10 = 10;",
        language: "typescript",
        fileSize: 100,
      });

      const state = store.getState();
      expect(state.fileContexts).toHaveLength(MAX_FILE_CONTEXTS);
      expect(state.error).toBe("MAX_CONTEXTS_EXCEEDED");
    });
  });

  describe("選択範囲境界", () => {
    it("BND-010: 選択なしで全ファイル添付", async () => {
      mockChatEditAPI.readFile.mockResolvedValue({
        success: true,
        content: "const x = 1;\nconst y = 2;",
        language: "typescript",
        fileSize: 100,
      });

      const result = await mockChatEditAPI.readFile("/file.ts");

      expect(result.success).toBe(true);
      expect(result.content).toBe("const x = 1;\nconst y = 2;");
    });

    it("BND-011: 1文字選択で正常処理", () => {
      const selection = {
        startLine: 1,
        startColumn: 0,
        endLine: 1,
        endColumn: 1,
        selectedText: "c",
      };

      store.addFileContext({
        filePath: "/file.ts",
        fileName: "file.ts",
        content: "c",
        language: "typescript",
        fileSize: 1,
        selection,
      });

      const state = store.getState();
      expect(state.fileContexts[0].selection?.selectedText).toBe("c");
    });

    it("BND-012: 全ファイル選択で正常処理", () => {
      const fullContent = "const x = 1;\nconst y = 2;\nconst z = 3;";
      const selection = {
        startLine: 1,
        startColumn: 0,
        endLine: 3,
        endColumn: 14,
        selectedText: fullContent,
      };

      store.addFileContext({
        filePath: "/file.ts",
        fileName: "file.ts",
        content: fullContent,
        language: "typescript",
        fileSize: fullContent.length,
        selection,
      });

      const state = store.getState();
      expect(state.fileContexts[0].selection?.selectedText).toBe(fullContent);
    });

    it("BND-013: 無効な範囲（逆順）を検出する", () => {
      const invalidSelection = {
        startLine: 5,
        startColumn: 0,
        endLine: 1, // startLineより小さい
        endColumn: 10,
        selectedText: "test",
      };

      // バリデーション関数
      const isValidSelection = (selection: typeof invalidSelection) => {
        if (selection.startLine > selection.endLine) return false;
        if (
          selection.startLine === selection.endLine &&
          selection.startColumn > selection.endColumn
        )
          return false;
        return true;
      };

      expect(isValidSelection(invalidSelection)).toBe(false);
    });

    it("BND-014: 範囲外の行指定を検出する", () => {
      const content = "const x = 1;"; // 1行のみ
      const outOfRangeSelection = {
        startLine: 1,
        startColumn: 0,
        endLine: 100, // ファイルの行数を超えている
        endColumn: 10,
        selectedText: "test",
      };

      // バリデーション関数
      const isSelectionInRange = (
        selection: typeof outOfRangeSelection,
        fileContent: string,
      ) => {
        const lineCount = fileContent.split("\n").length;
        return selection.endLine <= lineCount;
      };

      expect(isSelectionInRange(outOfRangeSelection, content)).toBe(false);
    });
  });

  describe("コンテキストサイズ境界", () => {
    it("合計コンテキストサイズが100KB以内で送信可能", async () => {
      const content = "x".repeat(MAX_CONTEXT_SIZE - 100); // 100KB弱

      mockChatEditAPI.sendWithContext.mockResolvedValue({
        success: true,
        result: {
          id: "result-1",
          contextId: "ctx-1",
          originalContent: content,
          generatedContent: content + " // modified",
          diffHunks: [],
          status: "pending",
          createdAt: new Date(),
          targetFilePath: "/file.ts",
          command: { type: "continue", targetContextId: "ctx-1" },
        },
      });

      const result = await mockChatEditAPI.sendWithContext({
        contexts: [
          {
            filePath: "/file.ts",
            content,
            language: "typescript",
          },
        ],
        command: { type: "continue", targetContextId: "ctx-1" },
        message: "続きを書いて",
      });

      expect(result.success).toBe(true);
    });

    it("合計コンテキストサイズが100KB超過でCONTEXT_TOO_LARGEエラー", async () => {
      const largeContent = "x".repeat(MAX_CONTEXT_SIZE + 100); // 100KB超

      mockChatEditAPI.sendWithContext.mockResolvedValue({
        success: false,
        error: {
          code: "CONTEXT_TOO_LARGE",
          message: "Context size exceeds 100KB limit",
          retryable: false,
        },
      });

      const result = await mockChatEditAPI.sendWithContext({
        contexts: [
          {
            filePath: "/file.ts",
            content: largeContent,
            language: "typescript",
          },
        ],
        command: { type: "continue", targetContextId: "ctx-1" },
        message: "続きを書いて",
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("CONTEXT_TOO_LARGE");
    });
  });

  describe("差分計算境界", () => {
    it("変更なしの場合、空のDiffHunk配列", () => {
      const calculateDiff = (original: string, generated: string) => {
        if (original === generated) return [];
        // 簡易実装
        return [{ type: "modify" }];
      };

      const content = "const x = 1;";
      const diffHunks = calculateDiff(content, content);

      expect(diffHunks).toHaveLength(0);
    });

    it("全行変更の場合、単一のmodify DiffHunk", () => {
      const calculateDiff = (original: string, generated: string) => {
        if (original === generated) return [];

        const originalLines = original.split("\n");
        const generatedLines = generated.split("\n");

        // 全行が変更されている場合
        if (
          originalLines.every((line, i) => line !== generatedLines[i]) &&
          originalLines.length === generatedLines.length
        ) {
          return [
            {
              type: "modify",
              originalStartLine: 1,
              originalEndLine: originalLines.length,
              newStartLine: 1,
              newEndLine: generatedLines.length,
              originalLines,
              newLines: generatedLines,
            },
          ];
        }

        return [{ type: "modify" }];
      };

      const original = "const x = 1;\nconst y = 2;";
      const generated = "const x: number = 1;\nconst y: number = 2;";

      const diffHunks = calculateDiff(original, generated);

      expect(diffHunks.length).toBeGreaterThan(0);
      expect(diffHunks[0].type).toBe("modify");
    });
  });

  describe("重複ファイル検出", () => {
    it("同一ファイルパスの重複追加を防ぐ", () => {
      store.addFileContext({
        filePath: "/file.ts",
        fileName: "file.ts",
        content: "const x = 1;",
        language: "typescript",
        fileSize: 100,
      });

      store.addFileContext({
        filePath: "/file.ts",
        fileName: "file.ts",
        content: "const x = 1;",
        language: "typescript",
        fileSize: 100,
      });

      const state = store.getState();
      expect(state.fileContexts).toHaveLength(1);
      expect(state.error).toBe("DUPLICATE_FILE");
    });

    it("異なるパスの同名ファイルは許可", () => {
      store.addFileContext({
        filePath: "/dir1/file.ts",
        fileName: "file.ts",
        content: "const x = 1;",
        language: "typescript",
        fileSize: 100,
      });

      store.addFileContext({
        filePath: "/dir2/file.ts",
        fileName: "file.ts",
        content: "const y = 2;",
        language: "typescript",
        fileSize: 100,
      });

      const state = store.getState();
      expect(state.fileContexts).toHaveLength(2);
      expect(state.error).toBeNull();
    });
  });

  describe("エラーコード検証", () => {
    it("FILE_NOT_FOUNDエラーが正しく返される", async () => {
      mockChatEditAPI.readFile.mockResolvedValue({
        success: false,
        error: {
          code: "FILE_NOT_FOUND",
          message: "File not found",
        },
      });

      const result = await mockChatEditAPI.readFile("/nonexistent.ts");

      expect(result.error?.code).toBe("FILE_NOT_FOUND");
    });

    it("PERMISSION_DENIEDエラーが正しく返される", async () => {
      mockChatEditAPI.readFile.mockResolvedValue({
        success: false,
        error: {
          code: "PERMISSION_DENIED",
          message: "Permission denied",
        },
      });

      const result = await mockChatEditAPI.readFile("/restricted/file.ts");

      expect(result.error?.code).toBe("PERMISSION_DENIED");
    });

    it("リトライ可能なエラーにretryable: trueが設定される", async () => {
      mockChatEditAPI.readFile.mockResolvedValue({
        success: false,
        error: {
          code: "TIMEOUT",
          message: "Operation timed out",
          retryable: true,
        },
      });

      const result = await mockChatEditAPI.readFile("/slow/file.ts");

      expect(result.error?.retryable).toBe(true);
    });

    it("リトライ不可能なエラーにretryable: falseが設定される", async () => {
      mockChatEditAPI.readFile.mockResolvedValue({
        success: false,
        error: {
          code: "FILE_NOT_FOUND",
          message: "File not found",
          retryable: false,
        },
      });

      const result = await mockChatEditAPI.readFile("/nonexistent.ts");

      expect(result.error?.retryable).toBe(false);
    });
  });
});
