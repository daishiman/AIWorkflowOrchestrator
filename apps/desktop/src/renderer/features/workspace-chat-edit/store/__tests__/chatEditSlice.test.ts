/**
 * chatEditSlice テスト
 *
 * @description TDD Green Phase - Zustand Store Slice のテスト
 * テストID: UT-005 ~ UT-010
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createChatEditSlice, chatEditSelectors } from "../chatEditSlice";
import type { ChatEditSlice, GeneratedResult } from "../../types";

// モックストア作成ヘルパー
const createMockStore = () => {
  let state: ChatEditSlice;
  const set = (newState: Partial<ChatEditSlice>) => {
    state = { ...state, ...newState };
  };
  const get = () => state;

  // スライスを初期化
  state = createChatEditSlice(set as any, get, {} as any) as ChatEditSlice;

  return { get, set };
};

describe("chatEditSlice", () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    store = createMockStore();
    vi.clearAllMocks();
  });

  describe("初期状態", () => {
    it("初期状態が正しく設定される", () => {
      const state = store.get();
      expect(state.fileContexts).toEqual([]);
      expect(state.activeContextId).toBeNull();
      expect(state.generatedResults).toEqual([]);
      expect(state.currentResultId).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.isDiffPreviewOpen).toBe(false);
      expect(state.error).toBeNull();
      expect(state.isDragging).toBe(false);
    });
  });

  describe("addFileContext", () => {
    it("UT-005: ファイルコンテキストを追加できる", () => {
      const state = store.get();
      const contextData = {
        filePath: "/path/to/file.ts",
        fileName: "file.ts",
        content: "const x = 1;",
        language: "typescript",
        fileSize: 1024,
      };

      state.addFileContext(contextData);

      const newState = store.get();
      expect(newState.fileContexts).toHaveLength(1);
      expect(newState.fileContexts[0].fileName).toBe("file.ts");
      expect(newState.fileContexts[0].filePath).toBe("/path/to/file.ts");
      expect(newState.fileContexts[0].id).toBeDefined();
      expect(newState.activeContextId).toBe(newState.fileContexts[0].id);
    });

    it("UT-006: 最大10件を超えるとMAX_CONTEXTS_EXCEEDEDエラー", () => {
      const state = store.get();

      // 10件追加
      for (let i = 0; i < 10; i++) {
        state.addFileContext({
          filePath: `/path/to/file${i}.ts`,
          fileName: `file${i}.ts`,
          content: `const x${i} = ${i};`,
          language: "typescript",
          fileSize: 100,
        });
      }

      // 11件目を追加試行
      state.addFileContext({
        filePath: "/path/to/file10.ts",
        fileName: "file10.ts",
        content: "const x10 = 10;",
        language: "typescript",
        fileSize: 100,
      });

      const newState = store.get();
      expect(newState.fileContexts).toHaveLength(10);
      expect(newState.error).toBe("MAX_CONTEXTS_EXCEEDED");
    });

    it("UT-007: 重複ファイルパスでDUPLICATE_FILEエラー", () => {
      const state = store.get();
      const contextData = {
        filePath: "/path/to/file.ts",
        fileName: "file.ts",
        content: "const x = 1;",
        language: "typescript",
        fileSize: 1024,
      };

      state.addFileContext(contextData);
      state.addFileContext(contextData);

      const newState = store.get();
      expect(newState.fileContexts).toHaveLength(1);
      expect(newState.error).toBe("DUPLICATE_FILE");
    });
  });

  describe("removeFileContext", () => {
    it("UT-008: 指定IDのコンテキストを削除できる", () => {
      const state = store.get();

      state.addFileContext({
        filePath: "/path/to/file1.ts",
        fileName: "file1.ts",
        content: "const x = 1;",
        language: "typescript",
        fileSize: 100,
      });

      state.addFileContext({
        filePath: "/path/to/file2.ts",
        fileName: "file2.ts",
        content: "const y = 2;",
        language: "typescript",
        fileSize: 100,
      });

      const contextId = store.get().fileContexts[0].id;
      state.removeFileContext(contextId);

      const newState = store.get();
      expect(newState.fileContexts).toHaveLength(1);
      expect(newState.fileContexts[0].fileName).toBe("file2.ts");
    });

    it("アクティブコンテキストを削除すると次のコンテキストがアクティブになる", () => {
      const state = store.get();

      state.addFileContext({
        filePath: "/path/to/file1.ts",
        fileName: "file1.ts",
        content: "const x = 1;",
        language: "typescript",
        fileSize: 100,
      });

      state.addFileContext({
        filePath: "/path/to/file2.ts",
        fileName: "file2.ts",
        content: "const y = 2;",
        language: "typescript",
        fileSize: 100,
      });

      const firstContextId = store.get().fileContexts[0].id;
      const secondContextId = store.get().fileContexts[1].id;

      // 最初のコンテキストがアクティブになっているはず
      state.setActiveContext(firstContextId);

      // 削除
      state.removeFileContext(firstContextId);

      const newState = store.get();
      expect(newState.activeContextId).toBe(secondContextId);
    });
  });

  describe("clearAllContexts", () => {
    it("全コンテキストをクリアできる", () => {
      const state = store.get();

      state.addFileContext({
        filePath: "/path/to/file1.ts",
        fileName: "file1.ts",
        content: "const x = 1;",
        language: "typescript",
        fileSize: 100,
      });

      state.addFileContext({
        filePath: "/path/to/file2.ts",
        fileName: "file2.ts",
        content: "const y = 2;",
        language: "typescript",
        fileSize: 100,
      });

      state.clearAllContexts();

      const newState = store.get();
      expect(newState.fileContexts).toHaveLength(0);
      expect(newState.activeContextId).toBeNull();
    });
  });

  describe("setGeneratedResult", () => {
    it("UT-009: 生成結果を追加できる", () => {
      const state = store.get();

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

      state.setGeneratedResult(result);

      const newState = store.get();
      expect(newState.generatedResults).toHaveLength(1);
      expect(newState.generatedResults[0].id).toBe("result-1");
      expect(newState.currentResultId).toBe("result-1");
      expect(newState.isDiffPreviewOpen).toBe(true);
    });

    it("既存の結果を更新できる", () => {
      const state = store.get();

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

      state.setGeneratedResult(result);

      // 同じIDで更新
      const updatedResult = {
        ...result,
        generatedContent: "const x: number = 2;",
      };
      state.setGeneratedResult(updatedResult);

      const newState = store.get();
      expect(newState.generatedResults).toHaveLength(1);
      expect(newState.generatedResults[0].generatedContent).toBe(
        "const x: number = 2;",
      );
    });
  });

  describe("rejectResult", () => {
    it("UT-010: 結果を却下できる", () => {
      const state = store.get();

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

      state.setGeneratedResult(result);
      state.rejectResult("result-1");

      const newState = store.get();
      expect(newState.generatedResults[0].status).toBe("rejected");
      expect(newState.isDiffPreviewOpen).toBe(false);
      expect(newState.currentResultId).toBeNull();
    });
  });

  describe("clearResults", () => {
    it("全結果をクリアできる", () => {
      const state = store.get();

      state.setGeneratedResult({
        id: "result-1",
        contextId: "ctx-1",
        originalContent: "const x = 1;",
        generatedContent: "const x: number = 1;",
        diffHunks: [],
        status: "pending",
        createdAt: new Date(),
        targetFilePath: "/path/to/file.ts",
        command: { type: "refactor", targetContextId: "ctx-1" },
      });

      state.clearResults();

      const newState = store.get();
      expect(newState.generatedResults).toHaveLength(0);
      expect(newState.currentResultId).toBeNull();
      expect(newState.isDiffPreviewOpen).toBe(false);
    });
  });

  describe("openDiffPreview / closeDiffPreview", () => {
    it("差分プレビューを開閉できる", () => {
      const state = store.get();

      state.openDiffPreview("result-1");
      expect(store.get().isDiffPreviewOpen).toBe(true);
      expect(store.get().currentResultId).toBe("result-1");

      state.closeDiffPreview();
      expect(store.get().isDiffPreviewOpen).toBe(false);
      expect(store.get().currentResultId).toBeNull();
    });
  });

  describe("setLoading / setError / setDragging", () => {
    it("ローディング状態を設定できる", () => {
      const state = store.get();

      state.setLoading(true);
      expect(store.get().isLoading).toBe(true);

      state.setLoading(false);
      expect(store.get().isLoading).toBe(false);
    });

    it("エラー状態を設定できる", () => {
      const state = store.get();

      state.setError("TEST_ERROR");
      expect(store.get().error).toBe("TEST_ERROR");

      state.setError(null);
      expect(store.get().error).toBeNull();
    });

    it("ドラッグ状態を設定できる", () => {
      const state = store.get();

      state.setDragging(true);
      expect(store.get().isDragging).toBe(true);

      state.setDragging(false);
      expect(store.get().isDragging).toBe(false);
    });
  });

  describe("reset", () => {
    it("状態をリセットできる", () => {
      const state = store.get();

      // 状態を変更
      state.addFileContext({
        filePath: "/path/to/file.ts",
        fileName: "file.ts",
        content: "const x = 1;",
        language: "typescript",
        fileSize: 100,
      });
      state.setLoading(true);
      state.setError("TEST_ERROR");

      // リセット
      state.reset();

      const newState = store.get();
      expect(newState.fileContexts).toHaveLength(0);
      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBeNull();
    });
  });

  describe("セレクター", () => {
    it("getCurrentResult: 現在の結果を取得できる", () => {
      const state = store.get();

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

      state.setGeneratedResult(result);

      const currentResult = chatEditSelectors.getCurrentResult(store.get());
      expect(currentResult).toBeDefined();
      expect(currentResult?.id).toBe("result-1");
    });

    it("getActiveContext: アクティブなコンテキストを取得できる", () => {
      const state = store.get();

      state.addFileContext({
        filePath: "/path/to/file.ts",
        fileName: "file.ts",
        content: "const x = 1;",
        language: "typescript",
        fileSize: 100,
      });

      const activeContext = chatEditSelectors.getActiveContext(store.get());
      expect(activeContext).toBeDefined();
      expect(activeContext?.fileName).toBe("file.ts");
    });

    it("getTotalContextSize: コンテキスト合計サイズを取得できる", () => {
      const state = store.get();

      state.addFileContext({
        filePath: "/path/to/file1.ts",
        fileName: "file1.ts",
        content: "const x = 1;",
        language: "typescript",
        fileSize: 100,
      });

      state.addFileContext({
        filePath: "/path/to/file2.ts",
        fileName: "file2.ts",
        content: "const y = 2;",
        language: "typescript",
        fileSize: 200,
      });

      const totalSize = chatEditSelectors.getTotalContextSize(store.get());
      expect(totalSize).toBe(300);
    });

    it("canAddContext: 追加可能かどうか判定できる", () => {
      const state = store.get();

      expect(chatEditSelectors.canAddContext(store.get())).toBe(true);

      // 10件追加
      for (let i = 0; i < 10; i++) {
        state.addFileContext({
          filePath: `/path/to/file${i}.ts`,
          fileName: `file${i}.ts`,
          content: `const x${i} = ${i};`,
          language: "typescript",
          fileSize: 100,
        });
      }

      expect(chatEditSelectors.canAddContext(store.get())).toBe(false);
    });

    it("hasPendingResults: ペンディング結果の有無を判定できる", () => {
      const state = store.get();

      expect(chatEditSelectors.hasPendingResults(store.get())).toBe(false);

      state.setGeneratedResult({
        id: "result-1",
        contextId: "ctx-1",
        originalContent: "const x = 1;",
        generatedContent: "const x: number = 1;",
        diffHunks: [],
        status: "pending",
        createdAt: new Date(),
        targetFilePath: "/path/to/file.ts",
        command: { type: "refactor", targetContextId: "ctx-1" },
      });

      expect(chatEditSelectors.hasPendingResults(store.get())).toBe(true);
    });
  });
});
