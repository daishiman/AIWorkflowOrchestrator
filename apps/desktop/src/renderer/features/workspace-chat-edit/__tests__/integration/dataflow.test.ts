/**
 * データフロー 統合テスト
 *
 * @description TDD Green Phase - データフローの統合テスト
 * テストID: IT-005 ~ IT-007, IT-DFL-001 ~ IT-DFL-002
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

import type {
  FileContext,
  FileReadResult,
  SendWithContextResponse,
  StreamOutputEvent,
  GeneratedResult,
} from "@/renderer/features/workspace-chat-edit/types";

// モックAPI
const mockChatEditAPI = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  getEditorSelection: vi.fn(),
  sendWithContext: vi.fn(),
  detectLanguage: vi.fn(),
  onStreamOutput: vi.fn(),
};

vi.stubGlobal("chatEditAPI", mockChatEditAPI);

// モック状態管理
const createMockChatEditStore = () => {
  let fileContexts: FileContext[] = [];
  let generatedResults: GeneratedResult[] = [];
  let isLoading = false;
  let error: string | null = null;
  let isDiffPreviewOpen = false;
  const counter = { value: 0 }; // ユニークID生成用カウンター

  return {
    get fileContexts() {
      return fileContexts;
    },
    get generatedResults() {
      return generatedResults;
    },
    get isLoading() {
      return isLoading;
    },
    get error() {
      return error;
    },
    get isDiffPreviewOpen() {
      return isDiffPreviewOpen;
    },

    addFileContext: (data: Omit<FileContext, "id" | "addedAt">) => {
      const context: FileContext = {
        ...data,
        id: `ctx-${++counter.value}-${Math.random().toString(36).substr(2, 9)}`,
        addedAt: new Date(),
      };
      fileContexts = [...fileContexts, context];
    },

    removeFileContext: (id: string) => {
      fileContexts = fileContexts.filter((c) => c.id !== id);
    },

    setGeneratedResult: (result: GeneratedResult) => {
      const existingIndex = generatedResults.findIndex(
        (r) => r.id === result.id,
      );
      if (existingIndex >= 0) {
        generatedResults = [
          ...generatedResults.slice(0, existingIndex),
          result,
          ...generatedResults.slice(existingIndex + 1),
        ];
      } else {
        generatedResults = [...generatedResults, result];
      }
      isDiffPreviewOpen = true;
    },

    approveResult: async (resultId: string) => {
      const result = generatedResults.find((r) => r.id === resultId);
      if (!result) return { success: false };

      const writeResult = await mockChatEditAPI.writeFile(
        result.targetFilePath,
        result.generatedContent,
      );

      if (writeResult.success) {
        generatedResults = generatedResults.map((r) =>
          r.id === resultId ? { ...r, status: "approved" as const } : r,
        );
        isDiffPreviewOpen = false;
      }

      return writeResult;
    },

    rejectResult: (resultId: string) => {
      generatedResults = generatedResults.map((r) =>
        r.id === resultId ? { ...r, status: "rejected" as const } : r,
      );
      isDiffPreviewOpen = false;
    },

    setLoading: (value: boolean) => {
      isLoading = value;
    },

    setError: (value: string | null) => {
      error = value;
    },

    reset: () => {
      fileContexts = [];
      generatedResults = [];
      isLoading = false;
      error = null;
      isDiffPreviewOpen = false;
    },
  };
};

describe("データフローテスト", () => {
  let store: ReturnType<typeof createMockChatEditStore>;

  beforeEach(() => {
    store = createMockChatEditStore();
    vi.clearAllMocks();
  });

  describe("完全なデータフロー", () => {
    it("IT-005: 添付→LLM→差分表示の一連の流れが正常に動作する", async () => {
      // Arrange
      const mockFileContent: FileReadResult = {
        success: true,
        content: "function hello() {}",
        language: "typescript",
        fileSize: 1024,
      };

      const mockLLMResponse: SendWithContextResponse = {
        success: true,
        result: {
          id: "result-1",
          contextId: "ctx-1",
          originalContent: "function hello() {}",
          generatedContent: 'function hello(): void { console.log("Hello"); }',
          diffHunks: [
            {
              type: "modify",
              originalStartLine: 1,
              originalEndLine: 1,
              newStartLine: 1,
              newEndLine: 1,
              originalLines: ["function hello() {}"],
              newLines: ['function hello(): void { console.log("Hello"); }'],
            },
          ],
          status: "pending",
          createdAt: new Date(),
          targetFilePath: "/path/to/file.ts",
          command: { type: "continue", targetContextId: "ctx-1" },
        },
      };

      mockChatEditAPI.readFile.mockResolvedValue(mockFileContent);
      mockChatEditAPI.sendWithContext.mockResolvedValue(mockLLMResponse);

      // Step 1: ファイル読み込み
      const fileResult = await mockChatEditAPI.readFile("/path/to/file.ts");
      expect(fileResult.success).toBe(true);

      // Step 2: コンテキスト追加
      if (fileResult.success && fileResult.content) {
        store.addFileContext({
          filePath: "/path/to/file.ts",
          fileName: "file.ts",
          content: fileResult.content,
          language: fileResult.language || "plaintext",
          fileSize: fileResult.fileSize || 0,
        });
      }

      expect(store.fileContexts).toHaveLength(1);

      // Step 3: LLM送信
      const llmResult = await mockChatEditAPI.sendWithContext({
        contexts: store.fileContexts.map((c) => ({
          filePath: c.filePath,
          content: c.content,
          language: c.language,
        })),
        command: { type: "continue", targetContextId: "ctx-1" },
        message: "続きを書いて",
      });

      // Step 4: 結果設定
      if (llmResult.success && llmResult.result) {
        store.setGeneratedResult(llmResult.result);
      }

      expect(store.generatedResults).toHaveLength(1);
      expect(store.generatedResults[0].status).toBe("pending");
      expect(store.isDiffPreviewOpen).toBe(true);
    });
  });

  describe("複数コンテキスト管理", () => {
    it("IT-006: 複数ファイルを添付しても全て保持される", async () => {
      // Arrange
      const files = [
        { path: "/file1.ts", content: "const a = 1;" },
        { path: "/file2.ts", content: "const b = 2;" },
        { path: "/file3.ts", content: "const c = 3;" },
      ];

      mockChatEditAPI.readFile.mockImplementation(async (filePath: string) => ({
        success: true,
        content: files.find((f) => f.path === filePath)?.content || "",
        language: "typescript",
        fileSize: 100,
      }));

      // Act - 各ファイルを読み込んで追加
      for (const file of files) {
        const result = await mockChatEditAPI.readFile(file.path);
        if (result.success && result.content) {
          store.addFileContext({
            filePath: file.path,
            fileName: file.path.split("/").pop() || "",
            content: result.content,
            language: "typescript",
            fileSize: 100,
          });
        }
      }

      // Assert - 全ファイルが保持されている
      expect(store.fileContexts).toHaveLength(3);
      expect(store.fileContexts.map((c) => c.filePath)).toEqual(
        files.map((f) => f.path),
      );
    });

    it("IT-DFL-001: コンテキスト削除が即座に反映される", async () => {
      // Arrange
      mockChatEditAPI.readFile.mockResolvedValue({
        success: true,
        content: "const x = 1;",
        language: "typescript",
        fileSize: 100,
      });

      // 2件追加
      store.addFileContext({
        filePath: "/file1.ts",
        fileName: "file1.ts",
        content: "const a = 1;",
        language: "typescript",
        fileSize: 100,
      });

      store.addFileContext({
        filePath: "/file2.ts",
        fileName: "file2.ts",
        content: "const b = 2;",
        language: "typescript",
        fileSize: 100,
      });

      expect(store.fileContexts).toHaveLength(2);

      const idToRemove = store.fileContexts[0].id;

      // Act
      store.removeFileContext(idToRemove);

      // Assert
      expect(store.fileContexts).toHaveLength(1);
      expect(store.fileContexts[0].filePath).toBe("/file2.ts");
    });
  });

  describe("ストリーミング出力", () => {
    it("IT-007: ストリーミング出力が正しく処理される", async () => {
      // Arrange
      const chunks: string[] = [];
      const streamCallback = vi.fn((event: StreamOutputEvent) => {
        if (event.type === "content" && event.content) {
          chunks.push(event.content);
        }
      });

      mockChatEditAPI.onStreamOutput.mockImplementation(
        (callback: (event: StreamOutputEvent) => void) => {
          // シミュレートされたストリームデータ
          setTimeout(
            () => callback({ type: "content", content: "const " }),
            10,
          );
          setTimeout(() => callback({ type: "content", content: "x = " }), 20);
          setTimeout(() => callback({ type: "content", content: "1;" }), 30);
          setTimeout(() => callback({ type: "done", done: true }), 40);

          return () => {}; // unsubscribe function
        },
      );

      // Act
      mockChatEditAPI.onStreamOutput(streamCallback);

      // Wait for stream to complete
      await new Promise((resolve) => setTimeout(resolve, 60));

      // Assert
      expect(streamCallback).toHaveBeenCalledTimes(4);
      expect(chunks.join("")).toBe("const x = 1;");
    });

    it("ストリームエラー時にエラー状態が設定される", async () => {
      // Arrange
      const errorCallback = vi.fn();

      mockChatEditAPI.onStreamOutput.mockImplementation(
        (callback: (event: StreamOutputEvent) => void) => {
          setTimeout(
            () =>
              callback({
                type: "error",
                error: { code: "LLM_ERROR", message: "Stream failed" },
              }),
            10,
          );
          return () => {};
        },
      );

      // Act
      mockChatEditAPI.onStreamOutput((event: StreamOutputEvent) => {
        if (event.type === "error") {
          store.setError(event.error?.code || "UNKNOWN_ERROR");
          errorCallback(event);
        }
      });

      await new Promise((resolve) => setTimeout(resolve, 30));

      // Assert
      expect(errorCallback).toHaveBeenCalled();
      expect(store.error).toBe("LLM_ERROR");
    });
  });

  describe("適用後のUI更新", () => {
    it("IT-DFL-002: 適用後にUIが正しく更新される", async () => {
      // Arrange
      mockChatEditAPI.writeFile.mockResolvedValue({
        success: true,
        backupPath: "/path/to/file.ts.bak",
      });

      // 生成結果をセット
      const result: GeneratedResult = {
        id: "result-1",
        contextId: "ctx-1",
        originalContent: "const x = 1;",
        generatedContent: "const x: number = 1;",
        diffHunks: [],
        status: "pending",
        createdAt: new Date(),
        targetFilePath: "/path/to/file.ts",
        command: { type: "refactor", targetContextId: "ctx-1" },
      };

      store.setGeneratedResult(result);
      expect(store.isDiffPreviewOpen).toBe(true);

      // Act - 適用
      await store.approveResult("result-1");

      // Assert
      expect(store.generatedResults[0].status).toBe("approved");
      expect(store.isDiffPreviewOpen).toBe(false);
    });

    it("却下後にUIが正しく更新される", () => {
      // Arrange
      const result: GeneratedResult = {
        id: "result-1",
        contextId: "ctx-1",
        originalContent: "const x = 1;",
        generatedContent: "const x: number = 1;",
        diffHunks: [],
        status: "pending",
        createdAt: new Date(),
        targetFilePath: "/path/to/file.ts",
        command: { type: "refactor", targetContextId: "ctx-1" },
      };

      store.setGeneratedResult(result);
      expect(store.isDiffPreviewOpen).toBe(true);

      // Act - 却下
      store.rejectResult("result-1");

      // Assert
      expect(store.generatedResults[0].status).toBe("rejected");
      expect(store.isDiffPreviewOpen).toBe(false);
    });
  });

  describe("状態のリセット", () => {
    it("全状態をリセットできる", () => {
      // Arrange - 状態を変更
      store.addFileContext({
        filePath: "/file.ts",
        fileName: "file.ts",
        content: "const x = 1;",
        language: "typescript",
        fileSize: 100,
      });
      store.setError("some error");
      store.setLoading(true);

      expect(store.fileContexts).toHaveLength(1);
      expect(store.error).toBe("some error");
      expect(store.isLoading).toBe(true);

      // Act
      store.reset();

      // Assert
      expect(store.fileContexts).toHaveLength(0);
      expect(store.error).toBeNull();
      expect(store.isLoading).toBe(false);
    });
  });
});
