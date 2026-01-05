/**
 * useFileSelectorModal フックテスト
 *
 * @see docs/30-workflows/file-selector-integration/step01-design.md
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFileSelectorModal } from "./useFileSelectorModal";
import type { SelectedFile } from "@repo/shared/types";

// =============================================================================
// Mocks
// =============================================================================

// SelectedFile型のモックデータを作成するヘルパー
const createMockSelectedFile = (
  id: string,
  name: string,
  path: string,
  size: number,
): SelectedFile => ({
  id,
  name,
  path,
  extension: name.includes(".") ? "." + name.split(".").pop() : "",
  size,
  mimeType: "application/octet-stream",
  lastModified: new Date().toISOString(),
  createdAt: new Date().toISOString(),
});

const mockSelectedFiles = vi.fn((): SelectedFile[] => []);
const mockClearFiles = vi.fn();

vi.mock("../../../store", () => ({
  useSelectedFiles: () => mockSelectedFiles(),
  useClearFiles: () => mockClearFiles,
}));

// =============================================================================
// Tests
// =============================================================================

describe("useFileSelectorModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectedFiles.mockReturnValue([]);
  });

  // ===========================================================================
  // Initial State Tests
  // ===========================================================================

  describe("Initial State", () => {
    it("returns isOpen as false initially", () => {
      const { result } = renderHook(() => useFileSelectorModal());

      expect(result.current.isOpen).toBe(false);
    });

    it("returns empty selectedFiles initially", () => {
      const { result } = renderHook(() => useFileSelectorModal());

      expect(result.current.selectedFiles).toEqual([]);
    });

    it("returns hasSelectedFiles as false initially", () => {
      const { result } = renderHook(() => useFileSelectorModal());

      expect(result.current.hasSelectedFiles).toBe(false);
    });
  });

  // ===========================================================================
  // Modal Control Tests
  // ===========================================================================

  describe("Modal Control", () => {
    it("openModal sets isOpen to true", () => {
      const { result } = renderHook(() => useFileSelectorModal());

      act(() => {
        result.current.openModal();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it("closeModal sets isOpen to false", () => {
      const { result } = renderHook(() => useFileSelectorModal());

      act(() => {
        result.current.openModal();
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.closeModal();
      });

      expect(result.current.isOpen).toBe(false);
    });
  });

  // ===========================================================================
  // File Selection Tests
  // ===========================================================================

  describe("File Selection", () => {
    it("returns selectedFiles from store", () => {
      const files = [
        createMockSelectedFile("1", "test1.txt", "/test1.txt", 100),
        createMockSelectedFile("2", "test2.txt", "/test2.txt", 200),
      ];
      mockSelectedFiles.mockReturnValue(files);

      const { result } = renderHook(() => useFileSelectorModal());

      expect(result.current.selectedFiles).toEqual(files);
    });

    it("hasSelectedFiles returns true when files are selected", () => {
      mockSelectedFiles.mockReturnValue([
        createMockSelectedFile("1", "test.txt", "/test.txt", 100),
      ]);

      const { result } = renderHook(() => useFileSelectorModal());

      expect(result.current.hasSelectedFiles).toBe(true);
    });

    it("confirmSelection returns selected files and closes modal", () => {
      const files = [createMockSelectedFile("1", "test.txt", "/test.txt", 100)];
      mockSelectedFiles.mockReturnValue(files);

      const { result } = renderHook(() => useFileSelectorModal());

      act(() => {
        result.current.openModal();
      });

      expect(result.current.isOpen).toBe(true);

      let returnedFiles;
      act(() => {
        returnedFiles = result.current.confirmSelection();
      });

      expect(returnedFiles).toEqual(files);
      expect(result.current.isOpen).toBe(false);
    });

    it("resetSelection calls clearFiles from store", () => {
      const { result } = renderHook(() => useFileSelectorModal());

      act(() => {
        result.current.resetSelection();
      });

      expect(mockClearFiles).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // Callback Stability Tests
  // ===========================================================================

  describe("Callback Stability", () => {
    it("openModal callback is stable", () => {
      const { result, rerender } = renderHook(() => useFileSelectorModal());

      const firstOpenModal = result.current.openModal;

      rerender();

      expect(result.current.openModal).toBe(firstOpenModal);
    });

    it("closeModal callback is stable", () => {
      const { result, rerender } = renderHook(() => useFileSelectorModal());

      const firstCloseModal = result.current.closeModal;

      rerender();

      expect(result.current.closeModal).toBe(firstCloseModal);
    });

    it("resetSelection callback is stable", () => {
      const { result, rerender } = renderHook(() => useFileSelectorModal());

      const firstResetSelection = result.current.resetSelection;

      rerender();

      expect(result.current.resetSelection).toBe(firstResetSelection);
    });
  });
});
