/**
 * useSkillCenter ナビゲーションアクションのテスト
 *
 * TC-01: navigateToSkillCreate が setCurrentView("skillCreate") を呼ぶ
 * TC-02: navigateToWorkspace が setCurrentView("workspace") を呼ぶ
 * TC-03: navigateToSkillAnalysis が setCurrentView("skillAnalysis") を呼ぶ
 * TC-04: 返り値にナビゲーション関数が含まれる
 *
 * P31対策: useAppStore の個別セレクタ形式でモック
 * P39対策: happy-dom環境のため fireEvent を使用（本テストはhook単体のため不要）
 * P40対策: cd apps/desktop && pnpm vitest run で実行
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// --- Store モック ---

const mockSetCurrentView = vi.fn();
const mockFetchSkills = vi.fn();
const mockImportSkill = vi.fn();
const mockRemoveSkill = vi.fn();
const mockSetSkillFilter = vi.fn();
const mockSetSkillCategory = vi.fn();
const mockSelectSkillByName = vi.fn();

vi.mock("../../../../store", () => ({
  useAppStore: vi.fn((selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      setCurrentView: mockSetCurrentView,
    }),
  ),
  useAvailableSkillsMetadata: vi.fn(() => []),
  useImportedSkills: vi.fn(() => []),
  useIsLoadingSkills: vi.fn(() => false),
  useSkillError: vi.fn(() => null),
  useSkillFilter: vi.fn(() => ""),
  useSkillCategory: vi.fn(() => null),
  useFetchSkills: vi.fn(() => mockFetchSkills),
  useImportSkill: vi.fn(() => mockImportSkill),
  useRemoveSkill: vi.fn(() => mockRemoveSkill),
  useSetSkillFilter: vi.fn(() => mockSetSkillFilter),
  useSetSkillCategory: vi.fn(() => mockSetSkillCategory),
  useSelectSkillByName: vi.fn(() => mockSelectSkillByName),
  useIsImportDialogOpen: vi.fn(() => false),
  useToastMessage: vi.fn(() => null),
  useSelectSkill: vi.fn(() => vi.fn()),
  useOpenImportDialog: vi.fn(() => vi.fn()),
  useCloseImportDialog: vi.fn(() => vi.fn()),
  useShowToast: vi.fn(() => vi.fn()),
  useClearToast: vi.fn(() => vi.fn()),
  useImportedSkillIds: vi.fn(() => []),
  useSelectedSkill: vi.fn(() => null),
  useSkills: vi.fn(() => []),
}));

import { useSkillCenter } from "../useSkillCenter";

describe("useSkillCenter ナビゲーションアクション", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TC-01: navigateToSkillCreate が setCurrentView('skillCreate') を呼ぶ", () => {
    const { result } = renderHook(() => useSkillCenter());

    act(() => {
      result.current.navigateToSkillCreate();
    });

    expect(mockSetCurrentView).toHaveBeenCalledTimes(1);
    expect(mockSetCurrentView).toHaveBeenCalledWith("skillCreate");
  });

  it("TC-02: navigateToWorkspace が setCurrentView('workspace') を呼ぶ", () => {
    const { result } = renderHook(() => useSkillCenter());

    act(() => {
      result.current.navigateToWorkspace();
    });

    expect(mockSetCurrentView).toHaveBeenCalledTimes(1);
    expect(mockSetCurrentView).toHaveBeenCalledWith("workspace");
  });

  it("TC-03: navigateToSkillAnalysis が setCurrentView('skillAnalysis') を呼ぶ", () => {
    const { result } = renderHook(() => useSkillCenter());

    act(() => {
      result.current.navigateToSkillAnalysis();
    });

    expect(mockSetCurrentView).toHaveBeenCalledTimes(1);
    expect(mockSetCurrentView).toHaveBeenCalledWith("skillAnalysis");
  });

  it("TC-04: 返り値にナビゲーション関数が含まれる", () => {
    const { result } = renderHook(() => useSkillCenter());

    expect(typeof result.current.navigateToSkillCreate).toBe("function");
    expect(typeof result.current.navigateToWorkspace).toBe("function");
    expect(typeof result.current.navigateToSkillAnalysis).toBe("function");
  });

  it("TC-05: navigateToSkillManagement が setCurrentView('skillManagement') を呼ぶ", () => {
    const { result } = renderHook(() => useSkillCenter());

    act(() => {
      result.current.navigateToSkillManagement();
    });

    expect(mockSetCurrentView).toHaveBeenCalledTimes(1);
    expect(mockSetCurrentView).toHaveBeenCalledWith("skillManagement");
  });

  it("TC-06: 返り値に navigateToSkillManagement が含まれる", () => {
    const { result } = renderHook(() => useSkillCenter());

    expect(typeof result.current.navigateToSkillManagement).toBe("function");
  });

  // TC-07: TASK-UI-01 — navigateToSkillLifecycle が skillLifecycle へ遷移すること (AC-1)
  it("TC-07: navigateToSkillLifecycle が setCurrentView('skillLifecycle') を呼ぶ", () => {
    const { result } = renderHook(() => useSkillCenter());

    act(() => {
      result.current.navigateToSkillLifecycle();
    });

    expect(mockSetCurrentView).toHaveBeenCalledTimes(1);
    expect(mockSetCurrentView).toHaveBeenCalledWith("skillLifecycle");
  });

  // TC-08: TASK-UI-01 — 返り値に navigateToSkillLifecycle が含まれること (AC-1)
  it("TC-08: 返り値に navigateToSkillLifecycle が含まれる", () => {
    const { result } = renderHook(() => useSkillCenter());

    expect(typeof result.current.navigateToSkillLifecycle).toBe("function");
  });
});
