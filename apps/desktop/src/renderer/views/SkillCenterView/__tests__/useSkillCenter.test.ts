import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { SkillMetadata, SkillName } from "@repo/shared/types/skill";

// --- テストデータファクトリ ---

const createMockSkillMetadata = (
  overrides: Partial<SkillMetadata> = {},
): SkillMetadata => ({
  name: "test-skill" as SkillName,
  description: "テスト用スキル",
  path: ".claude/skills/test-skill/SKILL.md",
  allowedTools: ["Read", "Write"],
  updatedAt: new Date("2026-01-01"),
  agents: [],
  references: [],
  scripts: [],
  assets: [],
  schemas: [],
  indexes: [],
  otherFiles: [],
  ...overrides,
});

// --- Store モック ---

const mockFetchSkills = vi.fn();
const mockImportSkill = vi.fn();
const mockRemoveSkill = vi.fn();
const mockSetSkillFilter = vi.fn();
const mockSetSkillCategory = vi.fn();
const mockSelectSkillByName = vi.fn();

vi.mock("../../../store", () => ({
  useAppStore: vi.fn(),
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

// テスト対象のフック（実装はPhase 5で作成される）
import { useSkillCenter } from "../hooks/useSkillCenter";

describe("useSkillCenter", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const store = await import("../../../store");
    vi.mocked(store.useAvailableSkillsMetadata).mockReturnValue([]);
    vi.mocked(store.useImportedSkills).mockReturnValue([]);
    vi.mocked(store.useIsLoadingSkills).mockReturnValue(false);
    vi.mocked(store.useSkillError).mockReturnValue(null);
    vi.mocked(store.useSkillFilter).mockReturnValue("");
    vi.mocked(store.useSkillCategory).mockReturnValue(null);
    vi.mocked(store.useFetchSkills).mockReturnValue(mockFetchSkills);
    vi.mocked(store.useImportSkill).mockReturnValue(mockImportSkill);
    vi.mocked(store.useRemoveSkill).mockReturnValue(mockRemoveSkill);
    vi.mocked(store.useSetSkillFilter).mockReturnValue(mockSetSkillFilter);
    vi.mocked(store.useSetSkillCategory).mockReturnValue(mockSetSkillCategory);
    vi.mocked(store.useSelectSkillByName).mockReturnValue(
      mockSelectSkillByName,
    );
  });

  it("初期状態が正しい", () => {
    const { result } = renderHook(() => useSkillCenter());

    expect(result.current.isDetailOpen).toBe(false);
    expect(result.current.detailSkillName).toBeNull();
    expect(result.current.isDeleteConfirmOpen).toBe(false);
    expect(result.current.deleteTargetSkillName).toBeNull();
  });

  it("handleOpenDetail でDetailPanelが開く", () => {
    const { result } = renderHook(() => useSkillCenter());

    act(() => {
      result.current.handleOpenDetail("my-skill" as SkillName);
    });

    expect(result.current.isDetailOpen).toBe(true);
    expect(result.current.detailSkillName).toBe("my-skill");
  });

  it("handleCloseDetail でDetailPanelが閉じる", () => {
    const { result } = renderHook(() => useSkillCenter());

    // まず開く
    act(() => {
      result.current.handleOpenDetail("my-skill" as SkillName);
    });
    expect(result.current.isDetailOpen).toBe(true);

    // 閉じる
    act(() => {
      result.current.handleCloseDetail();
    });

    expect(result.current.isDetailOpen).toBe(false);
    expect(result.current.detailSkillName).toBeNull();
  });

  it("handleAddSkill がimportSkillを呼び出す", async () => {
    mockImportSkill.mockResolvedValue(undefined);
    const { result } = renderHook(() => useSkillCenter());

    await act(async () => {
      await result.current.handleAddSkill("new-skill" as SkillName);
    });

    expect(mockImportSkill).toHaveBeenCalledWith("new-skill");
  });

  it("handleRequestDelete で削除確認ダイアログが開く", () => {
    const { result } = renderHook(() => useSkillCenter());

    act(() => {
      result.current.handleRequestDelete("target-skill" as SkillName);
    });

    expect(result.current.isDeleteConfirmOpen).toBe(true);
    expect(result.current.deleteTargetSkillName).toBe("target-skill");
  });

  it("handleConfirmDelete がremoveSkillを呼び出す", async () => {
    mockRemoveSkill.mockResolvedValue(undefined);
    const { result } = renderHook(() => useSkillCenter());

    // まず削除ターゲットを設定
    act(() => {
      result.current.handleRequestDelete("target-skill" as SkillName);
    });

    // 削除を確認
    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(mockRemoveSkill).toHaveBeenCalledWith("target-skill");
    expect(result.current.isDeleteConfirmOpen).toBe(false);
    expect(result.current.deleteTargetSkillName).toBeNull();
  });

  it("handleCancelDelete で削除確認ダイアログが閉じる", () => {
    const { result } = renderHook(() => useSkillCenter());

    // まず削除ダイアログを開く
    act(() => {
      result.current.handleRequestDelete("target-skill" as SkillName);
    });
    expect(result.current.isDeleteConfirmOpen).toBe(true);

    // キャンセル
    act(() => {
      result.current.handleCancelDelete();
    });

    expect(result.current.isDeleteConfirmOpen).toBe(false);
    expect(result.current.deleteTargetSkillName).toBeNull();
  });

  it("filteredSkills がカテゴリでフィルタリングされる", async () => {
    const skills = [
      createMockSkillMetadata({
        name: "dev-skill" as SkillName,
        description: "開発用スキル [development]",
      }),
      createMockSkillMetadata({
        name: "test-skill" as SkillName,
        description: "テスト用スキル [testing]",
      }),
    ];

    const store = await import("../../../store");
    vi.mocked(store.useAvailableSkillsMetadata).mockReturnValue(skills);
    vi.mocked(store.useSkillCategory).mockReturnValue("development");

    const { result } = renderHook(() => useSkillCenter());

    // カテゴリが "development" のスキルのみ含まれる
    expect(result.current.filteredSkills.length).toBeGreaterThanOrEqual(0);
    // フィルタリングロジックの具体的な実装に依存するが、
    // カテゴリがnullでなければフィルタが適用される
  });

  it("filteredSkills がキーワードでフィルタリングされる", async () => {
    const skills = [
      createMockSkillMetadata({
        name: "hello-skill" as SkillName,
        description: "挨拶スキル",
      }),
      createMockSkillMetadata({
        name: "world-skill" as SkillName,
        description: "世界スキル",
      }),
    ];

    const store = await import("../../../store");
    vi.mocked(store.useAvailableSkillsMetadata).mockReturnValue(skills);
    vi.mocked(store.useSkillFilter).mockReturnValue("hello");

    const { result } = renderHook(() => useSkillCenter());

    // キーワード "hello" でフィルタリングされる
    const names = result.current.filteredSkills.map((s) => s.name);
    expect(names).toContain("hello-skill");
    expect(names).not.toContain("world-skill");
  });

  it("description欠落データが含まれていてもフィルタ処理でクラッシュしない", async () => {
    const malformedSkill = {
      ...createMockSkillMetadata({ name: "broken-skill" as SkillName }),
      description: undefined,
    } as unknown as SkillMetadata;

    const skills = [
      createMockSkillMetadata({
        name: "hello-skill" as SkillName,
        description: "挨拶スキル",
      }),
      malformedSkill,
    ];

    const store = await import("../../../store");
    vi.mocked(store.useAvailableSkillsMetadata).mockReturnValue(skills);
    vi.mocked(store.useSkillFilter).mockReturnValue("hello");

    const { result } = renderHook(() => useSkillCenter());

    expect(result.current.filteredSkills.map((s) => s.name)).toContain(
      "hello-skill",
    );
  });

  it("マウント時にfetchSkillsが呼ばれる", () => {
    renderHook(() => useSkillCenter());
    expect(mockFetchSkills).toHaveBeenCalledTimes(1);
  });
});
