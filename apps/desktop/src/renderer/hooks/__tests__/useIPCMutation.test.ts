/**
 * useIPCMutation フックのテスト
 *
 * - 成功時のデータ返却
 * - ローディング状態の管理
 * - エラーハンドリング
 * - Error以外のエラー時のデフォルトメッセージ
 * - 再実行時のエラークリア
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIPCMutation } from "../useIPCMutation";

describe("useIPCMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mutate成功時に結果を返す", async () => {
    const mutator = vi.fn().mockResolvedValue({ id: "abc" });

    const { result } = renderHook(() => useIPCMutation(mutator));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();

    let output: unknown;
    await act(async () => {
      output = await result.current.mutate("input-data");
    });

    expect(output).toEqual({ id: "abc" });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mutator).toHaveBeenCalledWith("input-data");
  });

  it("mutateエラー時にnullを返しエラーメッセージがセットされる", async () => {
    const mutator = vi.fn().mockRejectedValue(new Error("保存失敗"));

    const { result } = renderHook(() => useIPCMutation(mutator));

    let output: unknown;
    await act(async () => {
      output = await result.current.mutate("input");
    });

    expect(output).toBeNull();
    expect(result.current.error).toBe("保存失敗");
    expect(result.current.isLoading).toBe(false);
  });

  it("Error以外のエラー時にデフォルトメッセージがセットされる", async () => {
    const mutator = vi.fn().mockRejectedValue("unknown error");

    const { result } = renderHook(() => useIPCMutation(mutator));

    await act(async () => {
      await result.current.mutate("input");
    });

    expect(result.current.error).toBe("操作に失敗しました");
  });

  it("再実行時にエラーがクリアされる", async () => {
    const mutator = vi
      .fn()
      .mockRejectedValueOnce(new Error("失敗"))
      .mockResolvedValueOnce("成功");

    const { result } = renderHook(() => useIPCMutation(mutator));

    await act(async () => {
      await result.current.mutate("input1");
    });
    expect(result.current.error).toBe("失敗");

    await act(async () => {
      const output = await result.current.mutate("input2");
      expect(output).toBe("成功");
    });

    expect(result.current.error).toBeNull();
  });
});
