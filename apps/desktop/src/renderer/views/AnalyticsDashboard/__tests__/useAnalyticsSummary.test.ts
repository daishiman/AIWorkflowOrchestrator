/**
 * useAnalyticsSummary Hook テスト
 *
 * サマリーデータの取得成功・エラー・再取得をテストする。
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { AnalyticsSummary } from "@repo/shared/types/skill-analytics";
import { useAnalyticsSummary } from "../hooks/useAnalyticsSummary";

// --- テストデータ ---

const mockSummary: AnalyticsSummary = {
  totalSkills: 5,
  totalExecutions: 120,
  overallSuccessRate: 0.92,
  mostUsedSkills: [
    {
      skillName: "code-review",
      executionCount: 40,
      lastUsed: "2026-03-01T10:00:00Z",
    },
    {
      skillName: "test-gen",
      executionCount: 30,
      lastUsed: "2026-03-01T09:00:00Z",
    },
  ],
  recentActivity: [],
};

// --- window.electronAPI モック ---

const mockAnalyticsSummary = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mockAnalyticsSummary.mockResolvedValue(mockSummary);

  // window.electronAPI.skill.analyticsSummary をモック
  const existingElectronAPI =
    (window as unknown as { electronAPI?: Record<string, unknown> })
      .electronAPI || {};
  const existingSkill =
    (existingElectronAPI.skill as Record<string, unknown>) || {};
  (window as unknown as { electronAPI: Record<string, unknown> }).electronAPI =
    {
      ...existingElectronAPI,
      skill: {
        ...existingSkill,
        analyticsSummary: mockAnalyticsSummary,
      },
    };
});

describe("useAnalyticsSummary", () => {
  it("マウント時にデータを取得する", async () => {
    const { result } = renderHook(() => useAnalyticsSummary());

    // 初期状態はローディング
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.summary).toEqual(mockSummary);
    expect(result.current.error).toBeNull();
    expect(mockAnalyticsSummary).toHaveBeenCalledTimes(1);
  });

  it("エラー発生時にエラーメッセージを設定する", async () => {
    mockAnalyticsSummary.mockRejectedValue(new Error("ネットワークエラー"));

    const { result } = renderHook(() => useAnalyticsSummary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.summary).toBeNull();
    expect(result.current.error).toBe("ネットワークエラー");
  });

  it("非Errorオブジェクトのエラーでもメッセージを設定する", async () => {
    mockAnalyticsSummary.mockRejectedValue("文字列エラー");

    const { result } = renderHook(() => useAnalyticsSummary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("サマリーの取得に失敗しました");
  });

  it("refetchでデータを再取得できる", async () => {
    const { result } = renderHook(() => useAnalyticsSummary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockAnalyticsSummary).toHaveBeenCalledTimes(1);

    // 新しいデータで再取得
    const updatedSummary = { ...mockSummary, totalExecutions: 200 };
    mockAnalyticsSummary.mockResolvedValue(updatedSummary);

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.summary).toEqual(updatedSummary);
    expect(mockAnalyticsSummary).toHaveBeenCalledTimes(2);
  });

  it("refetch中にisLoadingがtrueになる", async () => {
    const { result } = renderHook(() => useAnalyticsSummary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // refetch 開始
    let refetchPromise: Promise<void>;
    act(() => {
      refetchPromise = result.current.refetch();
    });

    // ローディング中
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await refetchPromise!;
    });

    expect(result.current.isLoading).toBe(false);
  });
});
