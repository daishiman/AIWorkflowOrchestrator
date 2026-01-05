/**
 * ファイル選択スライス テスト
 *
 * T-03-3: TDD Red Phase
 *
 * @see docs/30-workflows/file-selection/step05-store-design.md
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  createFileSelectionSlice,
  type FileSelectionSlice,
} from "./fileSelectionSlice";
import type { SelectedFile, FileFilterCategory } from "@repo/shared/types";

// =============================================================================
// Test Fixtures
// =============================================================================

const createMockFile = (
  overrides: Partial<SelectedFile> = {},
): SelectedFile => ({
  id: `test-uuid-${Math.random().toString(36).slice(2, 9)}`,
  path: "/Users/test/Documents/file.pdf",
  name: "file.pdf",
  extension: ".pdf",
  size: 1024,
  mimeType: "application/pdf",
  lastModified: "2025-01-01T00:00:00.000Z",
  createdAt: "2025-01-01T00:00:00.000Z",
  ...overrides,
});

const mockFile1: SelectedFile = createMockFile({
  id: "file-1",
  path: "/Users/test/Documents/document1.pdf",
  name: "document1.pdf",
});

const mockFile2: SelectedFile = createMockFile({
  id: "file-2",
  path: "/Users/test/Documents/document2.docx",
  name: "document2.docx",
  extension: ".docx",
  mimeType:
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
});

const mockFile3: SelectedFile = createMockFile({
  id: "file-3",
  path: "/Users/test/Documents/image.png",
  name: "image.png",
  extension: ".png",
  mimeType: "image/png",
  size: 2048,
});

// =============================================================================
// Test Suite
// =============================================================================

describe("fileSelectionSlice", () => {
  let store: FileSelectionSlice;
  let mockSet: (
    fn:
      | ((state: FileSelectionSlice) => Partial<FileSelectionSlice>)
      | Partial<FileSelectionSlice>,
  ) => void;
  let mockGet: () => FileSelectionSlice;

  beforeEach(() => {
    // Create a simple mock store
    const state: Partial<FileSelectionSlice> = {};
    mockSet = (fn) => {
      const partial =
        typeof fn === "function"
          ? fn(store)
          : (fn as Partial<FileSelectionSlice>);
      Object.assign(state, partial);
      store = { ...store, ...state };
    };
    mockGet = () => store;

    // Initialize the slice
    store = createFileSelectionSlice(
      mockSet as never,
      mockGet as never,
      {} as never,
    );
  });

  // ===========================================================================
  // Initial State Tests
  // ===========================================================================

  describe("初期状態", () => {
    it("selectedFilesが空の配列である", () => {
      expect(store.selectedFiles).toEqual([]);
    });

    it("filterCategoryが'all'である", () => {
      expect(store.filterCategory).toBe("all");
    });

    it("isDraggingがfalseである", () => {
      expect(store.isDragging).toBe(false);
    });

    it("isLoadingがfalseである", () => {
      expect(store.isLoading).toBe(false);
    });

    it("errorがnullである", () => {
      expect(store.error).toBeNull();
    });

    it("lastSelectedIdがnullである", () => {
      expect(store.lastSelectedId).toBeNull();
    });
  });

  // ===========================================================================
  // addFiles Action Tests
  // ===========================================================================

  describe("addFiles", () => {
    it("空の状態にファイルを追加できる", () => {
      store.addFiles([mockFile1]);
      expect(store.selectedFiles).toHaveLength(1);
      expect(store.selectedFiles[0]).toEqual(mockFile1);
    });

    it("複数のファイルを一度に追加できる", () => {
      store.addFiles([mockFile1, mockFile2, mockFile3]);
      expect(store.selectedFiles).toHaveLength(3);
    });

    it("既存のファイルに追加できる", () => {
      store.addFiles([mockFile1]);
      store.addFiles([mockFile2]);
      expect(store.selectedFiles).toHaveLength(2);
      expect(store.selectedFiles[0]).toEqual(mockFile1);
      expect(store.selectedFiles[1]).toEqual(mockFile2);
    });

    it("同じパスのファイルは重複追加されない", () => {
      store.addFiles([mockFile1]);
      const duplicateFile = { ...mockFile1, id: "different-id" };
      store.addFiles([duplicateFile]);
      expect(store.selectedFiles).toHaveLength(1);
    });

    it("部分的に重複がある場合、新規ファイルのみ追加される", () => {
      store.addFiles([mockFile1]);
      store.addFiles([mockFile1, mockFile2]);
      expect(store.selectedFiles).toHaveLength(2);
    });

    it("lastSelectedIdが最後に追加されたファイルのIDに更新される", () => {
      store.addFiles([mockFile1, mockFile2]);
      expect(store.lastSelectedId).toBe(mockFile2.id);
    });

    it("空の配列を追加しても状態は変わらない", () => {
      store.addFiles([mockFile1]);
      const beforeFiles = store.selectedFiles;
      store.addFiles([]);
      expect(store.selectedFiles).toBe(beforeFiles);
    });

    it("ファイル追加時にエラーがクリアされる", () => {
      store.setError("Previous error");
      store.addFiles([mockFile1]);
      expect(store.error).toBeNull();
    });
  });

  // ===========================================================================
  // removeFile Action Tests
  // ===========================================================================

  describe("removeFile", () => {
    beforeEach(() => {
      store.addFiles([mockFile1, mockFile2, mockFile3]);
    });

    it("IDを指定してファイルを削除できる", () => {
      store.removeFile(mockFile2.id);
      expect(store.selectedFiles).toHaveLength(2);
      expect(
        store.selectedFiles.find((f) => f.id === mockFile2.id),
      ).toBeUndefined();
    });

    it("存在しないIDを指定しても状態は変わらない", () => {
      store.removeFile("non-existent-id");
      expect(store.selectedFiles).toHaveLength(3);
    });

    it("lastSelectedIdが削除されたファイルの場合、最後のファイルのIDに更新される", () => {
      // beforeEach後: files = [f1, f2, f3], lastSelectedId = f3.id
      expect(store.lastSelectedId).toBe(mockFile3.id);
      store.removeFile(mockFile3.id);
      // f3削除後: files = [f1, f2], lastSelectedIdは新しい最後のファイル（f2）のIDになる
      expect(store.lastSelectedId).toBe(mockFile2.id);
    });

    it("lastSelectedIdが削除されたファイルでない場合、lastSelectedIdは変わらない", () => {
      // lastSelectedIdはmockFile3
      store.removeFile(mockFile1.id);
      expect(store.lastSelectedId).toBe(mockFile3.id);
    });

    it("最後の1つのファイルを削除するとlastSelectedIdがnullになる", () => {
      store.removeFile(mockFile1.id);
      store.removeFile(mockFile2.id);
      store.removeFile(mockFile3.id);
      expect(store.lastSelectedId).toBeNull();
    });
  });

  // ===========================================================================
  // removeFiles Action Tests
  // ===========================================================================

  describe("removeFiles", () => {
    beforeEach(() => {
      store.addFiles([mockFile1, mockFile2, mockFile3]);
    });

    it("複数のファイルを一度に削除できる", () => {
      store.removeFiles([mockFile1.id, mockFile2.id]);
      expect(store.selectedFiles).toHaveLength(1);
      expect(store.selectedFiles[0]).toEqual(mockFile3);
    });

    it("空の配列を渡しても状態は変わらない", () => {
      store.removeFiles([]);
      expect(store.selectedFiles).toHaveLength(3);
    });

    it("存在しないIDが含まれていても、存在するIDは削除される", () => {
      store.removeFiles([mockFile1.id, "non-existent-id"]);
      expect(store.selectedFiles).toHaveLength(2);
    });

    it("lastSelectedIdが削除対象に含まれる場合、残りの最後のファイルのIDに更新される", () => {
      expect(store.lastSelectedId).toBe(mockFile3.id);
      store.removeFiles([mockFile3.id]);
      expect(store.lastSelectedId).toBe(mockFile2.id);
    });
  });

  // ===========================================================================
  // clearFiles Action Tests
  // ===========================================================================

  describe("clearFiles", () => {
    beforeEach(() => {
      store.addFiles([mockFile1, mockFile2, mockFile3]);
      store.setError("Some error");
    });

    it("すべてのファイルがクリアされる", () => {
      store.clearFiles();
      expect(store.selectedFiles).toEqual([]);
    });

    it("lastSelectedIdがnullになる", () => {
      store.clearFiles();
      expect(store.lastSelectedId).toBeNull();
    });

    it("errorがnullになる", () => {
      store.clearFiles();
      expect(store.error).toBeNull();
    });
  });

  // ===========================================================================
  // reorderFile Action Tests
  // ===========================================================================

  describe("reorderFile", () => {
    beforeEach(() => {
      store.addFiles([mockFile1, mockFile2, mockFile3]);
    });

    it("ファイルの順序を変更できる（前から後ろへ）", () => {
      store.reorderFile(0, 2);
      expect(store.selectedFiles[0].id).toBe(mockFile2.id);
      expect(store.selectedFiles[1].id).toBe(mockFile3.id);
      expect(store.selectedFiles[2].id).toBe(mockFile1.id);
    });

    it("ファイルの順序を変更できる（後ろから前へ）", () => {
      store.reorderFile(2, 0);
      expect(store.selectedFiles[0].id).toBe(mockFile3.id);
      expect(store.selectedFiles[1].id).toBe(mockFile1.id);
      expect(store.selectedFiles[2].id).toBe(mockFile2.id);
    });

    it("同じインデックスを指定しても状態は変わらない", () => {
      const beforeOrder = store.selectedFiles.map((f) => f.id);
      store.reorderFile(1, 1);
      const afterOrder = store.selectedFiles.map((f) => f.id);
      expect(afterOrder).toEqual(beforeOrder);
    });

    it("負のインデックスを指定しても状態は変わらない", () => {
      const beforeOrder = store.selectedFiles.map((f) => f.id);
      store.reorderFile(-1, 1);
      const afterOrder = store.selectedFiles.map((f) => f.id);
      expect(afterOrder).toEqual(beforeOrder);
    });

    it("範囲外のインデックスを指定しても状態は変わらない", () => {
      const beforeOrder = store.selectedFiles.map((f) => f.id);
      store.reorderFile(0, 10);
      const afterOrder = store.selectedFiles.map((f) => f.id);
      expect(afterOrder).toEqual(beforeOrder);
    });
  });

  // ===========================================================================
  // setFilterCategory Action Tests
  // ===========================================================================

  describe("setFilterCategory", () => {
    it("フィルターカテゴリを変更できる", () => {
      store.setFilterCategory("office");
      expect(store.filterCategory).toBe("office");
    });

    it("すべてのカテゴリ値を設定できる", () => {
      const categories: FileFilterCategory[] = [
        "all",
        "office",
        "text",
        "media",
        "image",
      ];
      for (const category of categories) {
        store.setFilterCategory(category);
        expect(store.filterCategory).toBe(category);
      }
    });
  });

  // ===========================================================================
  // setIsDragging Action Tests
  // ===========================================================================

  describe("setIsDragging", () => {
    it("trueに設定できる", () => {
      store.setIsDragging(true);
      expect(store.isDragging).toBe(true);
    });

    it("falseに設定できる", () => {
      store.setIsDragging(true);
      store.setIsDragging(false);
      expect(store.isDragging).toBe(false);
    });
  });

  // ===========================================================================
  // setIsLoading Action Tests
  // ===========================================================================

  describe("setIsLoading", () => {
    it("trueに設定できる", () => {
      store.setIsLoading(true);
      expect(store.isLoading).toBe(true);
    });

    it("falseに設定できる", () => {
      store.setIsLoading(true);
      store.setIsLoading(false);
      expect(store.isLoading).toBe(false);
    });
  });

  // ===========================================================================
  // setError / clearError Action Tests
  // ===========================================================================

  describe("setError", () => {
    it("エラーメッセージを設定できる", () => {
      store.setError("File not found");
      expect(store.error).toBe("File not found");
    });

    it("エラー設定時にisLoadingがfalseになる", () => {
      store.setIsLoading(true);
      store.setError("Error occurred");
      expect(store.isLoading).toBe(false);
    });

    it("nullを設定できる", () => {
      store.setError("Error");
      store.setError(null);
      expect(store.error).toBeNull();
    });
  });

  describe("clearError", () => {
    it("エラーをクリアできる", () => {
      store.setError("Some error");
      store.clearError();
      expect(store.error).toBeNull();
    });
  });

  // ===========================================================================
  // resetFileSelection Action Tests
  // ===========================================================================

  describe("resetFileSelection", () => {
    beforeEach(() => {
      // 状態を変更
      store.addFiles([mockFile1, mockFile2]);
      store.setFilterCategory("office");
      store.setIsDragging(true);
      store.setIsLoading(true);
      store.setError("Some error");
    });

    it("selectedFilesが空になる", () => {
      store.resetFileSelection();
      expect(store.selectedFiles).toEqual([]);
    });

    it("filterCategoryが'all'になる", () => {
      store.resetFileSelection();
      expect(store.filterCategory).toBe("all");
    });

    it("isDraggingがfalseになる", () => {
      store.resetFileSelection();
      expect(store.isDragging).toBe(false);
    });

    it("isLoadingがfalseになる", () => {
      store.resetFileSelection();
      expect(store.isLoading).toBe(false);
    });

    it("errorがnullになる", () => {
      store.resetFileSelection();
      expect(store.error).toBeNull();
    });

    it("lastSelectedIdがnullになる", () => {
      store.resetFileSelection();
      expect(store.lastSelectedId).toBeNull();
    });
  });

  // ===========================================================================
  // Complex Scenario Tests
  // ===========================================================================

  describe("複合シナリオ", () => {
    it("ファイル追加→削除→追加のフロー", () => {
      // 追加
      store.addFiles([mockFile1, mockFile2]);
      expect(store.selectedFiles).toHaveLength(2);

      // 削除
      store.removeFile(mockFile1.id);
      expect(store.selectedFiles).toHaveLength(1);

      // 再度追加
      store.addFiles([mockFile3]);
      expect(store.selectedFiles).toHaveLength(2);
      expect(store.selectedFiles.map((f) => f.id)).toEqual([
        mockFile2.id,
        mockFile3.id,
      ]);
    });

    it("エラー発生→ファイル追加→エラークリアのフロー", () => {
      store.setError("Failed to load");
      expect(store.error).not.toBeNull();

      store.addFiles([mockFile1]);
      expect(store.error).toBeNull(); // addFilesでエラークリア
    });

    it("ローディング→成功→ファイル追加のフロー", () => {
      store.setIsLoading(true);
      expect(store.isLoading).toBe(true);

      store.addFiles([mockFile1]);
      store.setIsLoading(false);
      expect(store.isLoading).toBe(false);
      expect(store.selectedFiles).toHaveLength(1);
    });

    it("ローディング→エラー→ローディング終了のフロー", () => {
      store.setIsLoading(true);
      store.setError("Network error");

      // setErrorがisLoadingをfalseにする
      expect(store.isLoading).toBe(false);
      expect(store.error).toBe("Network error");
    });
  });

  // ===========================================================================
  // Boundary Value Tests
  // ===========================================================================

  describe("境界値テスト", () => {
    it("大量のファイル（100件）を追加できる", () => {
      const manyFiles = Array.from({ length: 100 }, (_, i) =>
        createMockFile({
          id: `file-${i}`,
          path: `/Users/test/Documents/file${i}.pdf`,
          name: `file${i}.pdf`,
        }),
      );
      store.addFiles(manyFiles);
      expect(store.selectedFiles).toHaveLength(100);
    });

    it("空文字列のエラーメッセージを設定できる", () => {
      store.setError("");
      expect(store.error).toBe("");
    });

    it("非常に長いエラーメッセージを設定できる", () => {
      const longError = "E".repeat(10000);
      store.setError(longError);
      expect(store.error).toBe(longError);
    });

    it("ファイルサイズが0のファイルを追加できる", () => {
      const zeroSizeFile = createMockFile({ id: "zero-size", size: 0 });
      store.addFiles([zeroSizeFile]);
      expect(store.selectedFiles[0].size).toBe(0);
    });

    it("非常に大きいファイルサイズ（10GB）のファイルを追加できる", () => {
      const largeFile = createMockFile({
        id: "large-file",
        size: 10 * 1024 * 1024 * 1024, // 10GB
      });
      store.addFiles([largeFile]);
      expect(store.selectedFiles[0].size).toBe(10 * 1024 * 1024 * 1024);
    });
  });
});
