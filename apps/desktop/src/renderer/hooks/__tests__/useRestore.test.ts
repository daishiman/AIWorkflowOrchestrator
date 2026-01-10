/**
 * useRestore Hook Tests
 *
 * TDD Red Phase: These tests are designed to fail until implementation is complete.
 */
import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useRestore } from "../useRestore";

// Types (will be imported from actual types when implemented)
interface VersionHistoryItem {
  conversionId: string;
  fileId: string;
  version: number;
  createdAt: string;
  size: number;
  mimeType: string;
  hash: string;
  isLatest: boolean;
}

// Mock factory
const createMockVersionHistoryItem = (
  overrides?: Partial<VersionHistoryItem>,
): VersionHistoryItem => ({
  conversionId: "conv-001",
  fileId: "file-123",
  version: 1,
  createdAt: "2026-01-10T00:00:00Z",
  size: 1024,
  mimeType: "text/markdown",
  hash: "abc123",
  isLatest: false,
  ...overrides,
});

// Mock setup
const mockHistoryAPI = {
  getFileHistory: vi.fn(),
  getVersionDetail: vi.fn(),
  getConversionLogs: vi.fn(),
  restoreVersion: vi.fn(),
};

describe("useRestore", () => {
  beforeEach(() => {
    // Add historyAPI to window without replacing the entire window object
    (window as unknown as { historyAPI: typeof mockHistoryAPI }).historyAPI =
      mockHistoryAPI;
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up
    delete (window as unknown as { historyAPI?: typeof mockHistoryAPI })
      .historyAPI;
  });

  it("UR-001: restore()でisRestoring=trueになる", async () => {
    // Given: フック初期化
    mockHistoryAPI.restoreVersion.mockReturnValue(new Promise(() => {})); // pending promise

    const { result } = renderHook(() => useRestore());

    // When: restore()を呼ぶ
    act(() => {
      result.current.restore("file-123", "conv-001");
    });

    // Then: isRestoring=true
    expect(result.current.isRestoring).toBe(true);
  });

  it("UR-002: 復元成功後にisRestoring=falseになる", async () => {
    // Given: APIが成功レスポンスを返す
    mockHistoryAPI.restoreVersion.mockResolvedValue({
      success: true,
      data: createMockVersionHistoryItem({ version: 3 }),
    });

    const { result } = renderHook(() => useRestore());

    // When: restore()を呼ぶ
    await act(async () => {
      await result.current.restore("file-123", "conv-001");
    });

    // Then: isRestoring=false
    expect(result.current.isRestoring).toBe(false);
  });

  it("UR-003: 復元成功後にonSuccess()が呼ばれる", async () => {
    // Given: onSuccessコールバックが設定されている
    const onSuccess = vi.fn();
    const restoredItem = createMockVersionHistoryItem({ version: 3 });

    mockHistoryAPI.restoreVersion.mockResolvedValue({
      success: true,
      data: restoredItem,
    });

    const { result } = renderHook(() => useRestore({ onSuccess }));

    // When: restore()を呼ぶ
    await act(async () => {
      await result.current.restore("file-123", "conv-001");
    });

    // Then: onSuccessが復元結果と共に呼ばれる
    expect(onSuccess).toHaveBeenCalledWith(restoredItem);
  });

  it("UR-004: 復元失敗時にerrorを設定する", async () => {
    // Given: APIがエラーを返す
    const mockError = new Error("Restore failed");
    mockHistoryAPI.restoreVersion.mockResolvedValue({
      success: false,
      error: mockError,
    });

    const { result } = renderHook(() => useRestore());

    // When: restore()を呼ぶ
    await act(async () => {
      await result.current.restore("file-123", "conv-001");
    });

    // Then: errorが設定される
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe("Restore failed");
  });

  it("UR-005: 復元失敗時にonError()が呼ばれる", async () => {
    // Given: onErrorコールバックが設定されている
    const onError = vi.fn();
    const mockError = new Error("Restore failed");

    mockHistoryAPI.restoreVersion.mockResolvedValue({
      success: false,
      error: mockError,
    });

    const { result } = renderHook(() => useRestore({ onError }));

    // When: restore()を呼ぶ
    await act(async () => {
      await result.current.restore("file-123", "conv-001");
    });

    // Then: onErrorがエラーと共に呼ばれる
    expect(onError).toHaveBeenCalledWith(mockError);
  });

  it("UR-006: clearError()でerrorをnullにする", async () => {
    // Given: エラー状態になっている
    mockHistoryAPI.restoreVersion.mockResolvedValue({
      success: false,
      error: new Error("Error"),
    });

    const { result } = renderHook(() => useRestore());

    await act(async () => {
      await result.current.restore("file-123", "conv-001");
    });

    expect(result.current.error).not.toBeNull();

    // When: clearError()を呼ぶ
    act(() => {
      result.current.clearError();
    });

    // Then: error=null
    expect(result.current.error).toBeNull();
  });
});
