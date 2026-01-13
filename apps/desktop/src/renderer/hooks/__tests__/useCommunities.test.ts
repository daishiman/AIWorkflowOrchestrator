/**
 * useCommunities Hook テスト
 * Phase 4: TDD Redフェーズ
 *
 * @description データ取得Hookのテスト
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

// グローバルwindow.electronAPIをモック
vi.stubGlobal("electronAPI", mockElectronAPI);

// モックデータ
const mockCommunities: Community[] = [
  {
    id: "community-1" as CommunityId,
    level: 0,
    size: 10,
    memberEntityIds: [],
    childCommunityIds: [],
    parentCommunityId: undefined,
    internalEdges: 5,
    externalEdges: 2,
    modularity: 0.5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "community-2" as CommunityId,
    level: 1,
    size: 15,
    memberEntityIds: [],
    childCommunityIds: [],
    parentCommunityId: undefined,
    internalEdges: 8,
    externalEdges: 3,
    modularity: 0.6,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const level0Communities = mockCommunities.filter((c) => c.level === 0);

describe("useCommunities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("データ取得", () => {
    it("マウント時にコミュニティ一覧を取得する", async () => {
      mockElectronAPI.community.getAll.mockResolvedValue({
        ok: true,
        value: mockCommunities,
      });

      renderHook(() => useCommunities());

      await waitFor(() => {
        expect(mockElectronAPI.community.getAll).toHaveBeenCalled();
      });
    });

    it("取得成功時にcommunitiesにデータが設定される", async () => {
      mockElectronAPI.community.getAll.mockResolvedValue({
        ok: true,
        value: mockCommunities,
      });

      const { result } = renderHook(() => useCommunities());

      await waitFor(() => {
        expect(result.current.communities).toEqual(mockCommunities);
      });
    });

    it("取得中はisLoadingがtrueになる", async () => {
      // 遅延させてローディング状態を確認
      mockElectronAPI.community.getAll.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  value: mockCommunities,
                }),
              100,
            ),
          ),
      );

      const { result } = renderHook(() => useCommunities());

      // 初期状態はisLoading: true
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("取得完了後はisLoadingがfalseになる", async () => {
      mockElectronAPI.community.getAll.mockResolvedValue({
        ok: true,
        value: mockCommunities,
      });

      const { result } = renderHook(() => useCommunities());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("communitiesが空の場合は空配列が返される", async () => {
      mockElectronAPI.community.getAll.mockResolvedValue({
        ok: true,
        value: [],
      });

      const { result } = renderHook(() => useCommunities());

      await waitFor(() => {
        expect(result.current.communities).toEqual([]);
      });
    });
  });

  describe("フィルタリング", () => {
    it("levelオプションで特定レベルのみ取得する", async () => {
      mockElectronAPI.community.getByLevel.mockResolvedValue({
        ok: true,
        value: level0Communities,
      });

      const { result } = renderHook(() => useCommunities({ level: 0 }));

      await waitFor(() => {
        expect(mockElectronAPI.community.getByLevel).toHaveBeenCalledWith(0);
        expect(result.current.communities).toEqual(level0Communities);
      });
    });

    it("refetchで再取得が実行される", async () => {
      mockElectronAPI.community.getAll.mockResolvedValue({
        ok: true,
        value: mockCommunities,
      });

      const { result } = renderHook(() => useCommunities());

      await waitFor(() => {
        expect(result.current.communities).toEqual(mockCommunities);
      });

      // 初回呼び出し確認
      expect(mockElectronAPI.community.getAll).toHaveBeenCalledTimes(1);

      // refetch実行
      await act(async () => {
        await result.current.refetch();
      });

      // 2回目の呼び出し確認
      expect(mockElectronAPI.community.getAll).toHaveBeenCalledTimes(2);
    });

    it("levelオプション変更時に再取得される", async () => {
      mockElectronAPI.community.getAll.mockResolvedValue({
        ok: true,
        value: mockCommunities,
      });
      mockElectronAPI.community.getByLevel.mockResolvedValue({
        ok: true,
        value: level0Communities,
      });

      const { result, rerender } = renderHook(
        ({ level }) => useCommunities({ level }),
        { initialProps: { level: undefined as number | undefined } },
      );

      await waitFor(() => {
        expect(result.current.communities).toEqual(mockCommunities);
      });

      // levelオプションを変更
      rerender({ level: 0 });

      await waitFor(() => {
        expect(mockElectronAPI.community.getByLevel).toHaveBeenCalledWith(0);
        expect(result.current.communities).toEqual(level0Communities);
      });
    });
  });

  describe("エラーハンドリング", () => {
    it("IPC通信失敗時にerrorが設定される", async () => {
      const errorMessage = "データベース接続エラー";
      mockElectronAPI.community.getAll.mockResolvedValue({
        ok: false,
        error: { code: "DB_ERROR", message: errorMessage },
      });

      const { result } = renderHook(() => useCommunities());

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.error?.message).toBe(errorMessage);
      });
    });

    it("ネットワークエラー時に適切なエラーメッセージ", async () => {
      mockElectronAPI.community.getAll.mockRejectedValue(
        new Error("Network error"),
      );

      const { result } = renderHook(() => useCommunities());

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.error?.message).toMatch(/Network|接続|通信/i);
      });
    });

    it("エラー時はcommunitiesが空配列", async () => {
      mockElectronAPI.community.getAll.mockResolvedValue({
        ok: false,
        error: { code: "UNKNOWN_ERROR", message: "エラー" },
      });

      const { result } = renderHook(() => useCommunities());

      await waitFor(() => {
        expect(result.current.communities).toEqual([]);
        expect(result.current.error).toBeTruthy();
      });
    });

    it("refetchでエラーがクリアされる", async () => {
      // 最初はエラー
      mockElectronAPI.community.getAll
        .mockResolvedValueOnce({
          ok: false,
          error: { code: "ERROR", message: "エラー" },
        })
        .mockResolvedValueOnce({
          ok: true,
          value: mockCommunities,
        });

      const { result } = renderHook(() => useCommunities());

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // refetch実行
      await act(async () => {
        await result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.communities).toEqual(mockCommunities);
      });
    });
  });

  describe("利用可能レベル", () => {
    it("コミュニティから利用可能レベルが算出される", async () => {
      mockElectronAPI.community.getAll.mockResolvedValue({
        ok: true,
        value: mockCommunities,
      });

      const { result } = renderHook(() => useCommunities());

      await waitFor(() => {
        expect(result.current.availableLevels).toEqual([0, 1]);
      });
    });

    it("レベルがソートされている", async () => {
      const unsortedCommunities: Community[] = [
        { ...mockCommunities[0], level: 2 },
        { ...mockCommunities[1], level: 0 },
        { ...mockCommunities[0], id: "c3" as CommunityId, level: 1 },
      ];

      mockElectronAPI.community.getAll.mockResolvedValue({
        ok: true,
        value: unsortedCommunities,
      });

      const { result } = renderHook(() => useCommunities());

      await waitFor(() => {
        expect(result.current.availableLevels).toEqual([0, 1, 2]);
      });
    });

    it("空コミュニティの場合は空配列", async () => {
      mockElectronAPI.community.getAll.mockResolvedValue({
        ok: true,
        value: [],
      });

      const { result } = renderHook(() => useCommunities());

      await waitFor(() => {
        expect(result.current.availableLevels).toEqual([]);
      });
    });
  });
});
