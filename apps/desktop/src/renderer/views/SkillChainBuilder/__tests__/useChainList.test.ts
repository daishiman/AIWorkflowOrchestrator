/**
 * useChainList フックのテスト
 *
 * - データ取得成功
 * - エラー処理
 * - 再取得（refetch）
 * - 削除操作
 * - 削除エラー時の伝播
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { SkillChainDefinition } from "@repo/shared/types/skill-chain";
import { useChainList } from "../hooks/useChainList";

// --- テストデータファクトリ ---

const createMockChain = (
  overrides: Partial<SkillChainDefinition> = {},
): SkillChainDefinition => ({
  id: "chain-001",
  name: "テストチェーン",
  description: "テスト用のチェーン",
  steps: [],
  variables: {},
  errorHandling: "stop",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  ...overrides,
});

// --- IPC モック ---

const mockChainList = vi.fn();
const mockChainDelete = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (
    window as unknown as {
      electronAPI: { skill: Record<string, unknown> };
    }
  ).electronAPI = {
    skill: {
      chainList: mockChainList,
      chainGet: vi.fn(),
      chainSave: vi.fn(),
      chainDelete: mockChainDelete,
      chainExecute: vi.fn(),
    } as unknown,
  } as unknown as typeof window.electronAPI;
});

describe("useChainList", () => {
  it("初回マウント時にチェーン一覧を取得する", async () => {
    const chains = [
      createMockChain({ id: "c1", name: "チェーン1" }),
      createMockChain({ id: "c2", name: "チェーン2" }),
    ];
    mockChainList.mockResolvedValueOnce(chains);

    const { result } = renderHook(() => useChainList());

    // 初期状態はローディング中
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.chains).toHaveLength(2);
    expect(result.current.chains[0].name).toBe("チェーン1");
    expect(result.current.error).toBeNull();
    expect(mockChainList).toHaveBeenCalledOnce();
  });

  it("取得エラー時にエラーメッセージがセットされる", async () => {
    mockChainList.mockRejectedValueOnce(new Error("接続エラー"));

    const { result } = renderHook(() => useChainList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.chains).toHaveLength(0);
    expect(result.current.error).toBe("接続エラー");
  });

  it("Error以外のエラー時にデフォルトメッセージが表示される", async () => {
    mockChainList.mockRejectedValueOnce("unknown error");

    const { result } = renderHook(() => useChainList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("チェーンの取得に失敗しました");
  });

  it("refetchで再取得できる", async () => {
    mockChainList.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useChainList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.chains).toHaveLength(0);

    // 再取得
    const newChains = [createMockChain({ id: "c3", name: "新チェーン" })];
    mockChainList.mockResolvedValueOnce(newChains);

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.chains).toHaveLength(1);
    expect(result.current.chains[0].name).toBe("新チェーン");
    expect(mockChainList).toHaveBeenCalledTimes(2);
  });

  it("deleteChainでチェーンが一覧から削除される", async () => {
    const chains = [
      createMockChain({ id: "c1", name: "チェーン1" }),
      createMockChain({ id: "c2", name: "チェーン2" }),
    ];
    mockChainList.mockResolvedValueOnce(chains);
    mockChainDelete.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useChainList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.chains).toHaveLength(2);

    await act(async () => {
      await result.current.deleteChain("c1");
    });

    expect(result.current.chains).toHaveLength(1);
    expect(result.current.chains[0].id).toBe("c2");
    expect(mockChainDelete).toHaveBeenCalledWith("c1");
  });

  it("deleteChainのIPCエラーが伝播する", async () => {
    mockChainList.mockResolvedValueOnce([createMockChain({ id: "c1" })]);
    mockChainDelete.mockRejectedValueOnce(new Error("削除失敗"));

    const { result } = renderHook(() => useChainList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.deleteChain("c1");
      }),
    ).rejects.toThrow("削除失敗");
  });
});
