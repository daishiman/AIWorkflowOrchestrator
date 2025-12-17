/**
 * useWorkspaceFileSelection フックのテスト
 *
 * @see docs/30-workflows/file-selector-integration/step09-workspace-file-selector-design.md
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWorkspaceFileSelection } from "./useWorkspaceFileSelection";
import type { FileNode } from "../../../../store/types";

describe("useWorkspaceFileSelection", () => {
  const mockFileNode: FileNode = {
    id: "file1",
    name: "test.ts",
    type: "file",
    path: "/project/test.ts",
  };

  const mockFileNode2: FileNode = {
    id: "file2",
    name: "test2.ts",
    type: "file",
    path: "/project/test2.ts",
  };

  const mockFolderId = "folder-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("初期状態", () => {
    it("空の選択状態で初期化される", () => {
      const { result } = renderHook(() => useWorkspaceFileSelection({}));

      expect(result.current.selectedPaths.size).toBe(0);
      expect(result.current.selectedFiles).toEqual([]);
    });
  });

  describe("単一選択モード", () => {
    it("ファイルを選択できる", () => {
      const { result } = renderHook(() =>
        useWorkspaceFileSelection({ selectionMode: "single" }),
      );

      act(() => {
        result.current.toggleFile(
          mockFileNode.path,
          mockFileNode,
          mockFolderId,
        );
      });

      expect(result.current.selectedPaths.has(mockFileNode.path)).toBe(true);
      expect(result.current.selectedFiles).toHaveLength(1);
      expect(result.current.selectedFiles[0].path).toBe(mockFileNode.path);
    });

    it("別のファイルを選択すると前の選択が解除される", () => {
      const { result } = renderHook(() =>
        useWorkspaceFileSelection({ selectionMode: "single" }),
      );

      act(() => {
        result.current.toggleFile(
          mockFileNode.path,
          mockFileNode,
          mockFolderId,
        );
      });

      act(() => {
        result.current.toggleFile(
          mockFileNode2.path,
          mockFileNode2,
          mockFolderId,
        );
      });

      expect(result.current.selectedPaths.size).toBe(1);
      expect(result.current.selectedPaths.has(mockFileNode2.path)).toBe(true);
      expect(result.current.selectedPaths.has(mockFileNode.path)).toBe(false);
    });

    it("同じファイルを再度選択すると選択解除される", () => {
      const { result } = renderHook(() =>
        useWorkspaceFileSelection({ selectionMode: "single" }),
      );

      act(() => {
        result.current.toggleFile(
          mockFileNode.path,
          mockFileNode,
          mockFolderId,
        );
      });

      act(() => {
        result.current.toggleFile(
          mockFileNode.path,
          mockFileNode,
          mockFolderId,
        );
      });

      expect(result.current.selectedPaths.size).toBe(0);
    });
  });

  describe("複数選択モード", () => {
    it("複数のファイルを選択できる", () => {
      const { result } = renderHook(() =>
        useWorkspaceFileSelection({ selectionMode: "multiple" }),
      );

      act(() => {
        result.current.toggleFile(
          mockFileNode.path,
          mockFileNode,
          mockFolderId,
        );
      });

      act(() => {
        result.current.toggleFile(
          mockFileNode2.path,
          mockFileNode2,
          mockFolderId,
        );
      });

      expect(result.current.selectedPaths.size).toBe(2);
      expect(result.current.selectedFiles).toHaveLength(2);
    });

    it("選択済みファイルを再度クリックすると選択解除される", () => {
      const { result } = renderHook(() =>
        useWorkspaceFileSelection({ selectionMode: "multiple" }),
      );

      act(() => {
        result.current.toggleFile(
          mockFileNode.path,
          mockFileNode,
          mockFolderId,
        );
        result.current.toggleFile(
          mockFileNode2.path,
          mockFileNode2,
          mockFolderId,
        );
      });

      act(() => {
        result.current.toggleFile(
          mockFileNode.path,
          mockFileNode,
          mockFolderId,
        );
      });

      expect(result.current.selectedPaths.size).toBe(1);
      expect(result.current.selectedPaths.has(mockFileNode2.path)).toBe(true);
    });
  });

  describe("最大選択数制限", () => {
    it("maxSelection を超える選択ができない", () => {
      const { result } = renderHook(() =>
        useWorkspaceFileSelection({
          selectionMode: "multiple",
          maxSelection: 1,
        }),
      );

      act(() => {
        result.current.toggleFile(
          mockFileNode.path,
          mockFileNode,
          mockFolderId,
        );
      });

      act(() => {
        result.current.toggleFile(
          mockFileNode2.path,
          mockFileNode2,
          mockFolderId,
        );
      });

      expect(result.current.selectedPaths.size).toBe(1);
      expect(result.current.selectedPaths.has(mockFileNode.path)).toBe(true);
    });

    it("canSelect で選択可能かどうかを判定できる", () => {
      const { result } = renderHook(() =>
        useWorkspaceFileSelection({
          selectionMode: "multiple",
          maxSelection: 1,
        }),
      );

      expect(result.current.canSelect(mockFileNode.path)).toBe(true);

      act(() => {
        result.current.toggleFile(
          mockFileNode.path,
          mockFileNode,
          mockFolderId,
        );
      });

      // 既に1件選択されているので、新しいファイルは選択不可
      expect(result.current.canSelect(mockFileNode2.path)).toBe(false);
      // 既に選択されているファイルは選択解除可能なのでtrue
      expect(result.current.canSelect(mockFileNode.path)).toBe(true);
    });
  });

  describe("拡張子フィルター", () => {
    it("allowedExtensions で許可された拡張子のみ選択可能", () => {
      const { result } = renderHook(() =>
        useWorkspaceFileSelection({
          selectionMode: "multiple",
          allowedExtensions: [".md", ".txt"],
        }),
      );

      const mdFile: FileNode = {
        id: "md1",
        name: "readme.md",
        type: "file",
        path: "/project/readme.md",
      };

      const tsFile: FileNode = {
        id: "ts1",
        name: "index.ts",
        type: "file",
        path: "/project/index.ts",
      };

      act(() => {
        result.current.toggleFile(mdFile.path, mdFile, mockFolderId);
        result.current.toggleFile(tsFile.path, tsFile, mockFolderId);
      });

      expect(result.current.selectedPaths.size).toBe(1);
      expect(result.current.selectedPaths.has(mdFile.path)).toBe(true);
      expect(result.current.selectedPaths.has(tsFile.path)).toBe(false);
    });
  });

  describe("選択操作", () => {
    it("clearSelection で全ての選択を解除できる", () => {
      const { result } = renderHook(() =>
        useWorkspaceFileSelection({ selectionMode: "multiple" }),
      );

      act(() => {
        result.current.toggleFile(
          mockFileNode.path,
          mockFileNode,
          mockFolderId,
        );
        result.current.toggleFile(
          mockFileNode2.path,
          mockFileNode2,
          mockFolderId,
        );
      });

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedPaths.size).toBe(0);
      expect(result.current.selectedFiles).toEqual([]);
    });

    it("removeFile で特定のファイルを選択解除できる", () => {
      const { result } = renderHook(() =>
        useWorkspaceFileSelection({ selectionMode: "multiple" }),
      );

      act(() => {
        result.current.toggleFile(
          mockFileNode.path,
          mockFileNode,
          mockFolderId,
        );
        result.current.toggleFile(
          mockFileNode2.path,
          mockFileNode2,
          mockFolderId,
        );
      });

      act(() => {
        result.current.removeFile(mockFileNode.path);
      });

      expect(result.current.selectedPaths.size).toBe(1);
      expect(result.current.selectedPaths.has(mockFileNode2.path)).toBe(true);
    });
  });

  describe("コールバック", () => {
    it("onSelectionChange が選択変更時に呼ばれる", () => {
      const onSelectionChange = vi.fn();

      const { result } = renderHook(() =>
        useWorkspaceFileSelection({
          selectionMode: "multiple",
          onSelectionChange,
        }),
      );

      act(() => {
        result.current.toggleFile(
          mockFileNode.path,
          mockFileNode,
          mockFolderId,
        );
      });

      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ path: mockFileNode.path }),
        ]),
      );
    });
  });
});
