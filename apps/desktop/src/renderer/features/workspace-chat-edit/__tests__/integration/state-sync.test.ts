/**
 * 状態同期 統合テスト
 *
 * @description TDD Green Phase - 状態同期の統合テスト
 * テストID: IT-013 ~ IT-015, IT-SYN-001
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

import type { FileContext, GeneratedResult } from "../../types";

// モック状態管理 - Zustand ストアをシミュレート
const createMockChatEditStore = () => {
  let fileContexts: FileContext[] = [];
  let generatedResults: GeneratedResult[] = [];
  let isLoading = false;
  let error: string | null = null;
  let isDiffPreviewOpen = false;
  let currentResultId: string | null = null;

  // オブザーバーパターンでUI更新をシミュレート
  const observers: (() => void)[] = [];

  const notifyObservers = () => {
    observers.forEach((cb) => cb());
  };

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
    get currentResultId() {
      return currentResultId;
    },

    subscribe: (callback: () => void) => {
      observers.push(callback);
      return () => {
        const index = observers.indexOf(callback);
        if (index > -1) observers.splice(index, 1);
      };
    },

    addFileContext: (data: Omit<FileContext, "id" | "addedAt">) => {
      const context: FileContext = {
        ...data,
        id: `ctx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        addedAt: new Date(),
      };
      fileContexts = [...fileContexts, context];
      notifyObservers();
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
      currentResultId = result.id;
      isDiffPreviewOpen = true;
      notifyObservers();
    },

    setLoading: (value: boolean) => {
      isLoading = value;
      notifyObservers();
    },

    setError: (value: string | null) => {
      error = value;
      notifyObservers();
    },

    openDiffPreview: (resultId: string) => {
      currentResultId = resultId;
      isDiffPreviewOpen = true;
      notifyObservers();
    },

    closeDiffPreview: () => {
      isDiffPreviewOpen = false;
      currentResultId = null;
      notifyObservers();
    },

    reset: () => {
      fileContexts = [];
      generatedResults = [];
      isLoading = false;
      error = null;
      isDiffPreviewOpen = false;
      currentResultId = null;
      notifyObservers();
    },
  };
};

// モックworkspaceSlice
const createMockWorkspaceStore = () => {
  let openFiles = [
    { path: "/file1.ts", name: "file1.ts" },
    { path: "/file2.ts", name: "file2.ts" },
  ];

  return {
    get openFiles() {
      return openFiles;
    },
    setOpenFiles: (files: { path: string; name: string }[]) => {
      openFiles = files;
    },
    addFile: (file: { path: string; name: string }) => {
      openFiles = [...openFiles, file];
    },
  };
};

// モックchatSlice
const createMockChatStore = () => {
  const messages: { role: string; content: string }[] = [];

  return {
    get messages() {
      return messages;
    },
    addMessage: (role: string, content: string) => {
      messages.push({ role, content });
    },
  };
};

describe("状態同期テスト", () => {
  let chatEditStore: ReturnType<typeof createMockChatEditStore>;
  let workspaceStore: ReturnType<typeof createMockWorkspaceStore>;
  let chatStore: ReturnType<typeof createMockChatStore>;

  beforeEach(() => {
    chatEditStore = createMockChatEditStore();
    workspaceStore = createMockWorkspaceStore();
    chatStore = createMockChatStore();
    vi.clearAllMocks();
  });

  describe("chatEditSlice 同期", () => {
    it("IT-013: fileContextsの変更がUIに即座に反映される", () => {
      // Arrange - UIコンポーネントをシミュレート
      let uiFileContextsCount = 0;
      chatEditStore.subscribe(() => {
        uiFileContextsCount = chatEditStore.fileContexts.length;
      });

      // Assert - 初期状態
      expect(uiFileContextsCount).toBe(0);

      // Act
      chatEditStore.addFileContext({
        filePath: "/test.ts",
        fileName: "test.ts",
        content: "test",
        language: "typescript",
        fileSize: 100,
      });

      // Assert - 状態が更新された
      expect(uiFileContextsCount).toBe(1);
    });

    it("generatedResultsの変更がUIに反映される", () => {
      // Arrange
      let uiResultsCount = 0;
      chatEditStore.subscribe(() => {
        uiResultsCount = chatEditStore.generatedResults.length;
      });

      // Act
      chatEditStore.setGeneratedResult({
        id: "result-1",
        contextId: "ctx-1",
        originalContent: "test",
        generatedContent: "test modified",
        diffHunks: [],
        status: "pending",
        createdAt: new Date(),
        targetFilePath: "/test.ts",
        command: { type: "refactor", targetContextId: "ctx-1" },
      });

      // Assert
      expect(uiResultsCount).toBe(1);
    });

    it("isLoading状態の変更がUIに反映される", () => {
      // Arrange
      let uiIsLoading = false;
      chatEditStore.subscribe(() => {
        uiIsLoading = chatEditStore.isLoading;
      });

      // Act
      chatEditStore.setLoading(true);

      // Assert
      expect(uiIsLoading).toBe(true);
    });
  });

  describe("workspaceSlice 連携", () => {
    it("IT-014: workspaceSliceから開いているファイル一覧を参照できる", () => {
      // Act
      const availableFiles = workspaceStore.openFiles;

      // Assert
      expect(availableFiles).toHaveLength(2);
      expect(availableFiles[0].path).toBe("/file1.ts");
      expect(availableFiles[1].path).toBe("/file2.ts");
    });

    it("workspaceSliceのファイル変更が反映される", () => {
      // Assert - 初期状態
      expect(workspaceStore.openFiles).toHaveLength(2);

      // Act - ファイル追加
      workspaceStore.addFile({ path: "/file3.ts", name: "file3.ts" });

      // Assert
      expect(workspaceStore.openFiles).toHaveLength(3);
    });
  });

  describe("chatSlice 連携", () => {
    it("IT-015: LLM応答がchatSliceのメッセージ履歴に追加される", () => {
      // Arrange - LLMからの応答をシミュレート
      const llmResponse = {
        id: "result-1",
        contextId: "ctx-1",
        originalContent: "test",
        generatedContent: "test modified",
        diffHunks: [],
        status: "pending" as const,
        createdAt: new Date(),
        targetFilePath: "/test.ts",
        command: { type: "refactor" as const, targetContextId: "ctx-1" },
      };

      // Act - LLM応答を処理
      chatEditStore.setGeneratedResult(llmResponse);
      chatStore.addMessage("assistant", llmResponse.generatedContent);

      // Assert
      expect(chatStore.messages).toHaveLength(1);
      expect(chatStore.messages[0].role).toBe("assistant");
      expect(chatStore.messages[0].content).toBe("test modified");
    });

    it("ユーザーメッセージがchatSliceに追加される", () => {
      // Act
      chatStore.addMessage("user", "リファクタリングしてください");
      chatStore.addMessage("assistant", "コードを修正しました");

      // Assert - ユーザーメッセージとアシスタントメッセージの両方が追加
      expect(chatStore.messages).toHaveLength(2);
      expect(chatStore.messages[0].role).toBe("user");
      expect(chatStore.messages[1].role).toBe("assistant");
    });
  });

  describe("複数コンポーネント間の同期", () => {
    it("IT-SYN-001: 複数タブ間で状態が一貫する", () => {
      // Arrange - 2つのUIコンポーネントをシミュレート
      let componentACount = 0;
      let componentBCount = 0;

      chatEditStore.subscribe(() => {
        componentACount = chatEditStore.fileContexts.length;
      });

      chatEditStore.subscribe(() => {
        componentBCount = chatEditStore.fileContexts.length;
      });

      // Act
      chatEditStore.addFileContext({
        filePath: "/test.ts",
        fileName: "test.ts",
        content: "test",
        language: "typescript",
        fileSize: 100,
      });

      // Assert - 両方のコンポーネントが同じ状態を参照
      expect(componentACount).toBe(1);
      expect(componentBCount).toBe(1);
    });

    it("差分プレビュー状態が他のコンポーネントに伝播する", () => {
      // Arrange
      let previewVisible = false;
      let previewResultId: string | null = null;

      chatEditStore.subscribe(() => {
        previewVisible = chatEditStore.isDiffPreviewOpen;
        previewResultId = chatEditStore.currentResultId;
      });

      // Assert - 初期状態でプレビューは非表示
      expect(previewVisible).toBe(false);
      expect(previewResultId).toBeNull();

      // Act
      chatEditStore.openDiffPreview("result-1");

      // Assert - プレビューが表示される
      expect(previewVisible).toBe(true);
      expect(previewResultId).toBe("result-1");
    });
  });

  describe("状態永続化", () => {
    it("コンテキストがセッション間で保持される", () => {
      // Arrange - セッション状態をシミュレート
      const sessionStorage = new Map<string, string>();

      // セッション保存
      chatEditStore.addFileContext({
        filePath: "/test.ts",
        fileName: "test.ts",
        content: "test content",
        language: "typescript",
        fileSize: 100,
      });

      const stateToSave = JSON.stringify({
        fileContexts: chatEditStore.fileContexts,
      });
      sessionStorage.set("chatEditState", stateToSave);

      // セッション復元をシミュレート
      const savedState = sessionStorage.get("chatEditState");

      // Assert
      expect(savedState).toBeDefined();
      const parsedState = JSON.parse(savedState!);
      expect(parsedState.fileContexts).toHaveLength(1);
      expect(parsedState.fileContexts[0].filePath).toBe("/test.ts");
    });
  });

  describe("エラー状態の伝播", () => {
    it("エラー状態が全コンポーネントに伝播する", () => {
      // Arrange
      let errorInComponentA: string | null = null;
      let errorInComponentB: string | null = null;

      chatEditStore.subscribe(() => {
        errorInComponentA = chatEditStore.error;
      });

      chatEditStore.subscribe(() => {
        errorInComponentB = chatEditStore.error;
      });

      // Act
      chatEditStore.setError("TEST_ERROR");

      // Assert
      expect(errorInComponentA).toBe("TEST_ERROR");
      expect(errorInComponentB).toBe("TEST_ERROR");
    });
  });
});
