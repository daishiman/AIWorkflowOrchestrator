import { describe, it, expect, beforeEach } from "vitest";
import { createEditorSlice, type EditorSlice } from "./editorSlice";
import type { FileNode } from "../types";

describe("editorSlice", () => {
  let store: EditorSlice;
  let mockSet: (
    fn: ((state: EditorSlice) => Partial<EditorSlice>) | Partial<EditorSlice>,
  ) => void;
  let mockGet: () => EditorSlice;

  beforeEach(() => {
    const state: Partial<EditorSlice> = {};
    mockSet = (fn) => {
      const partial =
        typeof fn === "function" ? fn(store) : (fn as Partial<EditorSlice>);
      Object.assign(state, partial);
      store = { ...store, ...state };
    };
    mockGet = () => store;

    store = createEditorSlice(mockSet as never, mockGet as never, {} as never);
  });

  const mockFile: FileNode = {
    id: "file-1",
    name: "test.ts",
    type: "file",
    path: "/src/test.ts",
  };

  const mockFileTree: FileNode[] = [
    {
      id: "folder-1",
      name: "src",
      type: "folder",
      path: "/src",
      children: [mockFile],
    },
  ];

  describe("初期状態", () => {
    it("selectedFileがnullである", () => {
      expect(store.selectedFile).toBeNull();
    });

    it("fileTreeが空配列である", () => {
      expect(store.fileTree).toEqual([]);
    });

    it("expandedFoldersが空Setである", () => {
      expect(store.expandedFolders).toEqual(new Set());
    });

    it("editorContentが空文字列である", () => {
      expect(store.editorContent).toBe("");
    });

    it("hasUnsavedChangesがfalseである", () => {
      expect(store.hasUnsavedChanges).toBe(false);
    });
  });

  describe("setSelectedFile", () => {
    it("ファイルを選択する", () => {
      store.setSelectedFile(mockFile);
      expect(store.selectedFile).toEqual(mockFile);
    });

    it("editorContentをリセットする", () => {
      store.setEditorContent("some content");
      store.setSelectedFile(mockFile);
      expect(store.editorContent).toBe("");
    });

    it("hasUnsavedChangesをリセットする", () => {
      store.setEditorContent("some content");
      store.setSelectedFile(mockFile);
      expect(store.hasUnsavedChanges).toBe(false);
    });

    it("nullを設定できる", () => {
      store.setSelectedFile(mockFile);
      store.setSelectedFile(null);
      expect(store.selectedFile).toBeNull();
    });
  });

  describe("setFileTree", () => {
    it("ファイルツリーを設定する", () => {
      store.setFileTree(mockFileTree);
      expect(store.fileTree).toEqual(mockFileTree);
    });

    it("空配列を設定できる", () => {
      store.setFileTree(mockFileTree);
      store.setFileTree([]);
      expect(store.fileTree).toEqual([]);
    });
  });

  describe("toggleFolder", () => {
    it("フォルダを展開する", () => {
      store.toggleFolder("folder-1");
      expect(store.expandedFolders.has("folder-1")).toBe(true);
    });

    it("展開済みフォルダを閉じる", () => {
      store.toggleFolder("folder-1");
      store.toggleFolder("folder-1");
      expect(store.expandedFolders.has("folder-1")).toBe(false);
    });

    it("複数のフォルダを展開できる", () => {
      store.toggleFolder("folder-1");
      store.toggleFolder("folder-2");
      expect(store.expandedFolders.has("folder-1")).toBe(true);
      expect(store.expandedFolders.has("folder-2")).toBe(true);
    });
  });

  describe("setExpandedFolders", () => {
    it("展開フォルダを直接設定する", () => {
      const folders = new Set(["folder-1", "folder-2"]);
      store.setExpandedFolders(folders);
      expect(store.expandedFolders).toEqual(folders);
    });
  });

  describe("setEditorContent", () => {
    it("コンテンツを設定する", () => {
      store.setEditorContent("new content");
      expect(store.editorContent).toBe("new content");
    });

    it("hasUnsavedChangesをtrueに設定する", () => {
      store.setEditorContent("new content");
      expect(store.hasUnsavedChanges).toBe(true);
    });
  });

  describe("setHasUnsavedChanges", () => {
    it("未保存状態を設定する", () => {
      store.setHasUnsavedChanges(true);
      expect(store.hasUnsavedChanges).toBe(true);
    });

    it("保存済み状態を設定する", () => {
      store.setHasUnsavedChanges(true);
      store.setHasUnsavedChanges(false);
      expect(store.hasUnsavedChanges).toBe(false);
    });
  });

  describe("markAsSaved", () => {
    it("hasUnsavedChangesをfalseに設定する", () => {
      store.setEditorContent("content");
      store.markAsSaved();
      expect(store.hasUnsavedChanges).toBe(false);
    });
  });
});
