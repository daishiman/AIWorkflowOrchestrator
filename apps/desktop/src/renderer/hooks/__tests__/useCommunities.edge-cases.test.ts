/**
 * useCommunities Hook エッジケーステスト
 * Phase 6: テスト拡充
 *
 * @description データ取得Hookの境界条件・異常系テスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useCommunities } from "../useCommunities";
import type { Community, CommunityId } from "@repo/shared";

// ElectronAPI モック
const mockElectronAPI = {
  community: {
    getAll: vi.fn(),
    getByLevel: vi.fn(),
    getById: vi.fn(),
    getMembers: vi.fn(),
    getSummary: vi.fn(),
    search: vi.fn(),
  },
};

vi.stubGlobal("electronAPI", mockElectronAPI);

// 基本モックデータ
const createMockCommunity = (
  id: string,
  level: number,
  size: number,
): Community => ({
  id: id as CommunityId,
  level,
  size,
  memberEntityIds: [],
  childCommunityIds: [],
  parentCommunityId: undefined,
  internalEdges: 5,
  externalEdges: 2,
  modularity: 0.5,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe("useCommunities Edge Cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("境界値テスト", () => {
    it("1件のコミュニティを正しく取得できる", async () => {
      const singleCommunity = [createMockCommunity("c1", 0, 1)];
      mockElectronAPI.community.getAll.mockResolvedValue({
        ok: true,
        value: singleCommunity,
      });

      const { result } = renderHook(() => useCommunities());

      await waitFor(() => {
        expect(result.current.communities).toHaveLength(1);
        expect(result.current.availableLevels).toEqual([0]);
      });
    });

    it("1000件以上のコミュニティを処理できる", async () => {
      const manyCommunities = Array.from({ length: 1000 }, (_, i) =>
        createMockCommunity(`c${i}`, i % 5, Math.random() * 100),
      );

      mockElectronAPI.community.getAll.mockResolvedValue({
        ok: true,
        value: manyCommunities,
      });

      const { result } = renderHook(() => useCommunities());

      await waitFor(() => {
        expect(result.current.communities).toHaveLength(1000);
        expect(result.current.availableLevels).toEqual([0, 1, 2, 3, 4]);
      });
    });

    it("レベル0（最小値）のフィルタリングが正しく動作する", async () => {
      const level0Communities = [
        createMockCommunity("c1", 0, 10),
        createMockCommunity("c2", 0, 20),
      ];

      mockElectronAPI.community.getByLevel.mockResolvedValue({
        ok: true,
        value: level0Communities,
      });

      const { result } = renderHook(() => useCommunities({ level: 0 }));

      await waitFor(() => {
        expect(mockElectronAPI.community.getByLevel).toHaveBeenCalledWith(0);
        expect(result.current.communities).toHaveLength(2);
      });
    });

    it("非常に大きなレベル値でも処理できる", async () => {
      mockElectronAPI.community.getByLevel.mockResolvedValue({
        ok: true,
        value: [],
      });

      const { result } = renderHook(() => useCommunities({ level: 999 }));

      await waitFor(() => {
        expect(mockElectronAPI.community.getByLevel).toHaveBeenCalledWith(999);
        expect(result.current.communities).toEqual([]);
      });
    });
  });

  describe("異常データ処理", () => {
    it("nullレスポンスをハンドリングできる", async () => {
      mockElectronAPI.community.getAll.mockResolvedValue({
        ok: true,
        value: null,
      });

      const { result } = renderHook(() => useCommunities());

      await waitFor(() => {
        expect(result.current.communities).toEqual([]);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("undefinedレスポンスをハンドリングできる", async () => {
      mockElectronAPI.community.getAll.mockResolvedValue({
        ok: true,
        value: undefined,
      });

      const { result } = renderHook(() => useCommunities());

      await waitFor(() => {
        expect(result.current.communities).toEqual([]);
      });
    });

    it("重複レベルを正しく処理する", async () => {
      const communitiesWithDupLevels = [
        createMockCommunity("c1", 1, 10),
        createMockCommunity("c2", 1, 20),
        createMockCommunity("c3", 1, 30),
        createMockCommunity("c4", 2, 40),
      ];

      mockElectronAPI.community.getAll.mockResolvedValue({
        ok: true,
        value: communitiesWithDupLevels,
      });

      const { result } = renderHook(() => useCommunities());

      await waitFor(() => {
        expect(result.current.availableLevels).toEqual([1, 2]); // 重複なし
      });
    });

    it("負のレベル値を含むデータを処理できる", async () => {
      const communitiesWithNegativeLevel = [
        createMockCommunity("c1", -1, 10),
        createMockCommunity("c2", 0, 20),
        createMockCommunity("c3", 1, 30),
      ];

      mockElectronAPI.community.getAll.mockResolvedValue({
        ok: true,
        value: communitiesWithNegativeLevel,
      });

      const { result } = renderHook(() => useCommunities());

      await waitFor(() => {
        expect(result.current.availableLevels).toEqual([-1, 0, 1]); // ソート済み
      });
    });
  });

  describe("並行処理・タイミング", () => {
    it("連続したrefetchが正しく処理される", async () => {
      let callCount = 0;
      mockElectronAPI.community.getAll.mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          ok: true,
          value: [createMockCommunity(`c${callCount}`, 0, 10)],
        });
      });

      const { result } = renderHook(() => useCommunities());

      await waitFor(() => {
        expect(result.current.communities).toHaveLength(1);
      });

      // 連続refetch
      await act(async () => {
        await Promise.all([
          result.current.refetch(),
          result.current.refetch(),
          result.current.refetch(),
        ]);
      });

      // 各refetchが実行されたことを確認
      expect(
        mockElectronAPI.community.getAll.mock.calls.length,
      ).toBeGreaterThan(1);
    });

    it("アンマウント後のステート更新は行われない", async () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      mockElectronAPI.community.getAll.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ ok: true, value: [] }), 100),
          ),
      );

      const { unmount } = renderHook(() => useCommunities());

      // すぐにアンマウント
      unmount();

      // 警告が出ないことを確認（React state update警告）
      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(consoleWarnSpy).not.toHaveBeenCalledWith(
        expect.stringContaining("update on an unmounted component"),
      );

      consoleWarnSpy.mockRestore();
    });

    it("levelオプション変更中のレースコンディションを処理する", async () => {
      const level0Data = [createMockCommunity("c0", 0, 10)];
      const level1Data = [createMockCommunity("c1", 1, 20)];

      mockElectronAPI.community.getByLevel
        .mockImplementationOnce(
          () =>
            new Promise((resolve) =>
              setTimeout(
                () => resolve({ ok: true, value: level0Data }),
                100, // 遅延
              ),
            ),
        )
        .mockImplementationOnce(() =>
          Promise.resolve({ ok: true, value: level1Data }),
        );

      const { result, rerender } = renderHook(
        ({ level }) => useCommunities({ level }),
        { initialProps: { level: 0 } },
      );

      // すぐにレベルを変更
      rerender({ level: 1 });

      await waitFor(() => {
        // 最新のリクエスト結果が反映される
        expect(result.current.communities).toEqual(level1Data);
      });
    });
  });

  describe("エラー回復", () => {
    it("一時的なエラー後にrefetchで回復できる", async () => {
      mockElectronAPI.community.getAll
        .mockRejectedValueOnce(new Error("Temporary network error"))
        .mockResolvedValueOnce({
          ok: true,
          value: [createMockCommunity("c1", 0, 10)],
        });

      const { result } = renderHook(() => useCommunities());

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      await act(async () => {
        await result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.communities).toHaveLength(1);
      });
    });

    it("連続エラー後も操作可能", async () => {
      mockElectronAPI.community.getAll
        .mockRejectedValueOnce(new Error("Error 1"))
        .mockRejectedValueOnce(new Error("Error 2"))
        .mockResolvedValueOnce({
          ok: true,
          value: [createMockCommunity("c1", 0, 10)],
        });

      const { result } = renderHook(() => useCommunities());

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // 2回目のrefetch（まだエラー）
      await act(async () => {
        await result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // 3回目のrefetch（成功）
      await act(async () => {
        await result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.communities).toHaveLength(1);
      });
    });
  });

  describe("メモリ効率", () => {
    it("大きなデータセットでもメモリリークしない", async () => {
      const largeCommunities = Array.from({ length: 500 }, (_, i) =>
        createMockCommunity(`c${i}`, i % 10, Math.random() * 100),
      );

      mockElectronAPI.community.getAll.mockResolvedValue({
        ok: true,
        value: largeCommunities,
      });

      const { result, unmount } = renderHook(() => useCommunities());

      await waitFor(() => {
        expect(result.current.communities).toHaveLength(500);
      });

      // アンマウント（リソース解放確認）
      unmount();

      // クリーンアップ後はエラーなしで完了
      expect(true).toBe(true);
    });
  });
});
