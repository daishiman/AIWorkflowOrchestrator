/**
 * AgentView レイアウトテスト（TASK-UI-03 Phase 4 - TDD Red）
 *
 * 新レイアウト仕様に基づくAgentViewの構造・レイアウトテスト。
 * 子コンポーネントはモック化して純粋にレイアウト構造を検証する。
 *
 * P39対策: happy-dom環境では userEvent 使用禁止。fireEvent のみ使用。
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
// P39対策: userEvent は使用しない

// 子コンポーネントのモック
vi.mock("../../../components/organisms/AgentView/SkillChip", () => ({
  SkillChip: ({ displayName }: { displayName: string }) => (
    <div data-testid="skill-chip">{displayName}</div>
  ),
}));

vi.mock("../../../components/organisms/AgentView/ExecuteButton", () => ({
  ExecuteButton: () => <button data-testid="execute-button">実行する</button>,
}));

vi.mock("../../../components/organisms/AgentView/FloatingExecutionBar", () => ({
  FloatingExecutionBar: () => (
    <div data-testid="floating-execution-bar">実行中</div>
  ),
}));

vi.mock(
  "../../../components/organisms/AgentView/AdvancedSettingsPanel",
  () => ({
    AdvancedSettingsPanel: ({ isOpen }: { isOpen: boolean }) =>
      isOpen ? <div data-testid="advanced-settings-panel">設定</div> : null,
  }),
);

vi.mock("../../../components/organisms/AgentView/RecentExecutionList", () => ({
  RecentExecutionList: () => (
    <div data-testid="recent-execution-list">履歴</div>
  ),
}));

// Store のモック
const mockFetchSkills = vi.fn();

vi.mock("../../../store", () => ({
  useAppStore: vi.fn(),
  useFetchSkills: vi.fn(() => mockFetchSkills),
  useImportedSkills: vi.fn(() => []),
  useIsLoadingSkills: vi.fn(() => false),
  useSkillError: vi.fn(() => null),
  useAvailableSkillsMetadata: vi.fn(() => []),
  useImportedSkillIds: vi.fn(() => []),
  useSelectedSkill: vi.fn(() => null),
  useSkillFilter: vi.fn(() => ""),
  useSkillCategory: vi.fn(() => null),
  useIsImportDialogOpen: vi.fn(() => false),
  useToastMessage: vi.fn(() => null),
  useSelectSkill: vi.fn(() => vi.fn()),
  useSetSkillFilter: vi.fn(() => vi.fn()),
  useSetSkillCategory: vi.fn(() => vi.fn()),
  useOpenImportDialog: vi.fn(() => vi.fn()),
  useCloseImportDialog: vi.fn(() => vi.fn()),
  useShowToast: vi.fn(() => vi.fn()),
  useClearToast: vi.fn(() => vi.fn()),
  useImportSkill: vi.fn(() => vi.fn()),
  useRemoveSkill: vi.fn(() => vi.fn()),
  // TASK-UI-03 セレクタ
  useRecentExecutions: vi.fn(() => []),
  useIsAdvancedSettingsOpen: vi.fn(() => false),
  useSetAdvancedSettingsOpen: vi.fn(() => vi.fn()),
  useSelectedSkillName: vi.fn(() => null),
  useIsSkillExecuting: vi.fn(() => false),
  useSkillExecutionId: vi.fn(() => null),
  useAbortSkillExecution: vi.fn(() => vi.fn()),
  useExecuteSkill: vi.fn(() => vi.fn()),
  useSkillExecutionStatus: vi.fn(() => null),
  useAddExecutionToHistory: vi.fn(() => vi.fn()),
  useLLMProviders: vi.fn(() => []),
  useSelectedProviderId: vi.fn(() => null),
  useSelectedModelId: vi.fn(() => null),
  useLLMHealthStatus: vi.fn(() => ({})),
  useFetchProviders: vi.fn(() => vi.fn()),
  useSelectProvider: vi.fn(() => vi.fn()),
  useSelectModel: vi.fn(() => vi.fn()),
}));

// AgentView をインポート
import { AgentView } from "../index";

describe("AgentView レイアウト", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("シングルカラムレイアウト（max-w-[600px]クラス確認）", () => {
    render(<AgentView />);

    const container = screen.getByTestId("agent-view");
    // 新レイアウトではシングルカラム・max-w-[600px] を使用
    expect(container.innerHTML).toContain("max-w-");
  });

  it("Level 1の要素数（2セクション）", () => {
    render(<AgentView />);

    // 新レイアウトでは2つの主要セクション:
    // 1. できること（ツール一覧）
    // 2. 最近の実行
    const sections = screen
      .getByTestId("agent-view")
      .querySelectorAll(":scope > div > section, :scope > section");
    expect(sections.length).toBeGreaterThanOrEqual(2);
  });

  it("ツール0件でSkillCenter導線表示", async () => {
    const store = await import("../../../store");
    vi.mocked(store.useImportedSkills).mockReturnValue([]);

    render(<AgentView />);

    expect(
      screen.getByText(/Skill Center|ツールをインポート/),
    ).toBeInTheDocument();
  });

  it("ツール10個以下で検索バー非表示", async () => {
    const store = await import("../../../store");
    const skills = Array.from({ length: 5 }, (_, i) => ({
      id: `skill-${i}`,
      name: `Skill ${i}`,
      slug: `skill-${i}`,
      description: `Description ${i}`,
      path: `/path/${i}`,
      triggers: [],
      anchors: [],
      lastModified: new Date(),
    }));
    vi.mocked(store.useImportedSkills).mockReturnValue(skills);

    render(<AgentView />);

    expect(screen.queryByPlaceholderText(/検索/)).not.toBeInTheDocument();
  });

  it("ツール11個以上で検索バー表示", async () => {
    const store = await import("../../../store");
    const skills = Array.from({ length: 11 }, (_, i) => ({
      id: `skill-${i}`,
      name: `Skill ${i}`,
      slug: `skill-${i}`,
      description: `Description ${i}`,
      path: `/path/${i}`,
      triggers: [],
      anchors: [],
      lastModified: new Date(),
    }));
    vi.mocked(store.useImportedSkills).mockReturnValue(skills);

    render(<AgentView />);

    expect(screen.getByPlaceholderText(/検索/)).toBeInTheDocument();
  });

  it("歯車アイコンで詳細設定パネル表示", async () => {
    const mockSetOpen = vi.fn();
    const store = await import("../../../store");
    vi.mocked(store.useSetAdvancedSettingsOpen).mockReturnValue(mockSetOpen);

    render(<AgentView />);

    const settingsButton = screen.getByRole("button", {
      name: /設定|詳細設定/i,
    });
    await act(async () => {
      fireEvent.click(settingsButton);
    });

    expect(mockSetOpen).toHaveBeenCalledWith(true);
  });

  it("UIテキスト準拠（「AIアシスタント」「できること」）", () => {
    render(<AgentView />);

    // 新レイアウトのUIテキスト
    expect(screen.getByText(/AIアシスタント/)).toBeInTheDocument();
    expect(screen.getByText(/できること/)).toBeInTheDocument();
  });

  // === Phase 6: テスト拡充 ===

  describe("エラー状態テスト", () => {
    it("エラー状態で再試行ボタンが表示される", async () => {
      const store = await import("../../../store");
      vi.mocked(store.useSkillError).mockReturnValue("テストエラーです");

      render(<AgentView />);

      expect(screen.getByText("テストエラーです")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /再試行/ }),
      ).toBeInTheDocument();

      // リセット: 後続テストに影響しないよう
      vi.mocked(store.useSkillError).mockReturnValue(null);
    });

    it("エラー状態で再試行ボタンクリックでfetchSkills呼び出し", async () => {
      const store = await import("../../../store");
      vi.mocked(store.useSkillError).mockReturnValue("エラー発生");

      render(<AgentView />);

      const retryButton = screen.getByRole("button", { name: /再試行/ });
      await act(async () => {
        fireEvent.click(retryButton);
      });

      expect(mockFetchSkills).toHaveBeenCalled();

      // リセット
      vi.mocked(store.useSkillError).mockReturnValue(null);
    });
  });

  describe("コンポーネント連携テスト", () => {
    it("歯車アイコンクリックでsetAdvancedSettingsOpen(true)呼び出し", async () => {
      const mockSetOpen = vi.fn();
      const store = await import("../../../store");
      vi.mocked(store.useSetAdvancedSettingsOpen).mockReturnValue(mockSetOpen);

      render(<AgentView />);

      const settingsButton = screen.getByRole("button", {
        name: /設定|詳細設定/i,
      });
      await act(async () => {
        fireEvent.click(settingsButton);
      });

      expect(mockSetOpen).toHaveBeenCalledWith(true);
    });

    it("最近の実行セクションのaria-labelが存在する", () => {
      render(<AgentView />);

      const section = screen.getByRole("region", { name: "最近の実行" });
      expect(section).toBeInTheDocument();
    });

    it("SkillChipフィルタリング（11個以上で検索バー表示後入力）", async () => {
      const mockSetFilter = vi.fn();
      const store = await import("../../../store");
      const skills = Array.from({ length: 12 }, (_, i) => ({
        id: `skill-${i}`,
        name: `Skill ${i}`,
        slug: `skill-${i}`,
        description: `Description ${i}`,
        path: `/path/${i}`,
        triggers: [],
        anchors: [],
        lastModified: new Date(),
      }));
      vi.mocked(store.useImportedSkills).mockReturnValue(skills);
      vi.mocked(store.useSkillError).mockReturnValue(null);
      vi.mocked(store.useSetSkillFilter).mockReturnValue(mockSetFilter);

      render(<AgentView />);

      const searchInput = screen.getByPlaceholderText(/検索/);
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: "test" } });
      });

      expect(mockSetFilter).toHaveBeenCalledWith("test");

      // リセット
      vi.mocked(store.useImportedSkills).mockReturnValue([]);
    });

    it("skillFilter がある場合は SkillChip 一覧が絞り込まれる", async () => {
      const store = await import("../../../store");
      const skills = Array.from({ length: 12 }, (_, i) => ({
        id: `skill-${i}`,
        name: `Skill ${i}`,
        slug: `skill-${i}`,
        description: `Description ${i}`,
        path: `/path/${i}`,
        triggers: [],
        anchors: [],
        lastModified: new Date(),
      }));
      vi.mocked(store.useImportedSkills).mockReturnValue(skills);
      vi.mocked(store.useSkillFilter).mockReturnValue("Skill 1");

      render(<AgentView />);

      expect(screen.queryByText("Skill 0")).not.toBeInTheDocument();
      expect(screen.getByText("Skill 1")).toBeInTheDocument();
      expect(screen.getByText("Skill 10")).toBeInTheDocument();
      expect(screen.getByText("Skill 11")).toBeInTheDocument();

      vi.mocked(store.useImportedSkills).mockReturnValue([]);
      vi.mocked(store.useSkillFilter).mockReturnValue("");
    });
  });
});
