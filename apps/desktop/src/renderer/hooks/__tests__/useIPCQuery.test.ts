/**
 * useIPCQuery フックのテスト
 *
 * - 初回マウント時のデータ取得
 * - immediate: false での遅延取得
 * - エラーハンドリング
 * - refetch による再取得
 * - Error以外のエラー時のデフォルトメッセージ
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useIPCQuery } from "../useIPCQuery";

describe("useIPCQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("初回マウント時にデータを自動取得する", async () => {
    const fetcher = vi.fn().mockResolvedValue({ id: 1, name: "テスト" });

    const { result } = renderHook(() => useIPCQuery(fetcher));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual({ id: 1, name: "テスト" });
    expect(result.current.error).toBeNull();
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it("immediate: false の場合はマウント時に取得しない", async () => {
    const fetcher = vi.fn().mockResolvedValue("data");

    const { result } = renderHook(() =>
      useIPCQuery(fetcher, { immediate: false }),
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("immediate: false で refetch を呼ぶとデータを取得する", async () => {
    const fetcher = vi.fn().mockResolvedValue("delayed-data");

    const { result } = renderHook(() =>
      useIPCQuery(fetcher, { immediate: false }),
    );

    expect(fetcher).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.data).toBe("delayed-data");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("Errorインスタンスのエラー時にメッセージがセットされる", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("接続エラー"));

    const { result } = renderHook(() => useIPCQuery(fetcher));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("接続エラー");
  });

  it("Error以外のエラー時にデフォルトメッセージがセットされる", async () => {
    const fetcher = vi.fn().mockRejectedValue("unknown");

    const { result } = renderHook(() => useIPCQuery(fetcher));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("データの取得に失敗しました");
  });

  it("refetchで再取得しデータが更新される", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce("first")
      .mockResolvedValueOnce("second");

    const { result } = renderHook(() => useIPCQuery(fetcher));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.data).toBe("first");

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.data).toBe("second");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("refetch時にエラーがクリアされる", async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new Error("失敗"))
      .mockResolvedValueOnce("成功");

    const { result } = renderHook(() => useIPCQuery(fetcher));

    await waitFor(() => {
      expect(result.current.error).toBe("失敗");
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.data).toBe("成功");
  });
});
