import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AgentView } from "../index";

// Mock skillAPI
vi.mock("../../../preload", () => ({
  skillAPI: {
    listImported: vi.fn().mockResolvedValue({ success: true, data: [] }),
    listAvailable: vi.fn().mockResolvedValue({ success: true, data: [] }),
    import: vi.fn().mockResolvedValue({ success: true }),
    remove: vi.fn().mockResolvedValue({ success: true }),
    getDetail: vi.fn().mockResolvedValue({ success: true, data: null }),
  },
}));

// Mock individual selector hooks (既存テストのパターンに準拠)
const mockFetchSkills = vi.fn();
const mockSelectSkill = vi.fn();
const mockSetSkillFilter = vi.fn();
const mockSetSkillCategory = vi.fn();
const mockOpenImportDialog = vi.fn();
const mockCloseImportDialog = vi.fn();
const mockShowToast = vi.fn();
const mockClearToast = vi.fn();
const mockImportSkill = vi.fn();
const mockRemoveSkill = vi.fn();
const mockSetAdvancedSettingsOpen = vi.fn();
const mockAbortExecution = vi.fn();
const mockExecuteSkill = vi.fn();
const mockAddExecutionToHistory = vi.fn();
const mockClearHandoffGuidance = vi.fn();
const mockFetchProviders = vi.fn();
const mockSelectProvider = vi.fn();
const mockSelectModel = vi.fn();
const mockSetCurrentView = vi.fn();
const mockSetCurrentSkillName = vi.fn();

function setMockPermissionsApi() {
  Object.defineProperty(window, "permissionAPI", {
    value: {
      getAllowedTools: vi.fn().mockResolvedValue({ tools: [] }),
      revokeTool: vi.fn().mockResolvedValue({ success: true }),
      clearAll: vi.fn().mockResolvedValue({ success: true, clearedCount: 0 }),
    },
    configurable: true,
    writable: true,
  });
}

vi.mock("../../../store", () => ({
  useAppStore: vi.fn(),
  // State selectors
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
  // TASK-UI-03: 新セレクタ
  useRecentExecutions: vi.fn(() => []),
  useIsAdvancedSettingsOpen: vi.fn(() => false),
  useSetAdvancedSettingsOpen: vi.fn(() => mockSetAdvancedSettingsOpen),
  useSelectedSkillName: vi.fn(() => null),
  useIsSkillExecuting: vi.fn(() => false),
  useSkillExecutionId: vi.fn(() => null),
  useSkillExecutionStatus: vi.fn(() => null),
  useAbortSkillExecution: vi.fn(() => mockAbortExecution),
  useExecuteSkill: vi.fn(() => mockExecuteSkill),
  useAddExecutionToHistory: vi.fn(() => mockAddExecutionToHistory),
  useHandoffGuidance: vi.fn(() => null),
  useClearHandoffGuidance: vi.fn(() => mockClearHandoffGuidance),
  useLLMProviders: vi.fn(() => []),
  useSelectedProviderId: vi.fn(() => null),
  useSelectedModelId: vi.fn(() => null),
  useLLMHealthStatus: vi.fn(() => ({})),
  useFetchProviders: vi.fn(() => mockFetchProviders),
  useSelectProvider: vi.fn(() => mockSelectProvider),
  useSelectModel: vi.fn(() => mockSelectModel),
  // Action selectors
  useSelectSkill: vi.fn(() => mockSelectSkill),
  useSetSkillFilter: vi.fn(() => mockSetSkillFilter),
  useSetSkillCategory: vi.fn(() => mockSetSkillCategory),
  useOpenImportDialog: vi.fn(() => mockOpenImportDialog),
  useCloseImportDialog: vi.fn(() => mockCloseImportDialog),
  useShowToast: vi.fn(() => mockShowToast),
  useClearToast: vi.fn(() => mockClearToast),
  useImportSkill: vi.fn(() => mockImportSkill),
  useRemoveSkill: vi.fn(() => mockRemoveSkill),
  // CTA バナー用セレクタ
  useSetCurrentView: vi.fn(() => mockSetCurrentView),
  useSetCurrentSkillName: vi.fn(() => mockSetCurrentSkillName),
}));

describe("AgentView - CTA バナー", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    setMockPermissionsApi();
    // Reset all selector mocks to defaults
    const store = await import("../../../store");
    vi.mocked(store.useFetchSkills).mockReturnValue(mockFetchSkills);
    vi.mocked(store.useImportedSkills).mockReturnValue([]);
    vi.mocked(store.useIsLoadingSkills).mockReturnValue(false);
    vi.mocked(store.useSkillError).mockReturnValue(null);
    vi.mocked(store.useAvailableSkillsMetadata).mockReturnValue([]);
    vi.mocked(store.useImportedSkillIds).mockReturnValue([]);
    vi.mocked(store.useSelectedSkill).mockReturnValue(null);
    vi.mocked(store.useSkillFilter).mockReturnValue("");
    vi.mocked(store.useSkillCategory).mockReturnValue(null);
    vi.mocked(store.useIsImportDialogOpen).mockReturnValue(false);
    vi.mocked(store.useToastMessage).mockReturnValue(null);
    vi.mocked(store.useSelectSkill).mockReturnValue(mockSelectSkill);
    vi.mocked(store.useSetSkillFilter).mockReturnValue(mockSetSkillFilter);
    vi.mocked(store.useSetSkillCategory).mockReturnValue(mockSetSkillCategory);
    vi.mocked(store.useOpenImportDialog).mockReturnValue(mockOpenImportDialog);
    vi.mocked(store.useCloseImportDialog).mockReturnValue(
      mockCloseImportDialog,
    );
    vi.mocked(store.useShowToast).mockReturnValue(mockShowToast);
    vi.mocked(store.useClearToast).mockReturnValue(mockClearToast);
    vi.mocked(store.useImportSkill).mockReturnValue(mockImportSkill);
    vi.mocked(store.useRemoveSkill).mockReturnValue(mockRemoveSkill);
    vi.mocked(store.useIsSkillExecuting).mockReturnValue(false);
    vi.mocked(store.useSkillExecutionStatus).mockReturnValue(null);
    vi.mocked(store.useAbortSkillExecution).mockReturnValue(mockAbortExecution);
    vi.mocked(store.useExecuteSkill).mockReturnValue(mockExecuteSkill);
    vi.mocked(store.useAddExecutionToHistory).mockReturnValue(
      mockAddExecutionToHistory,
    );
    vi.mocked(store.useHandoffGuidance).mockReturnValue(null);
    vi.mocked(store.useClearHandoffGuidance).mockReturnValue(
      mockClearHandoffGuidance,
    );
    vi.mocked(store.useLLMProviders).mockReturnValue([]);
    vi.mocked(store.useSelectedProviderId).mockReturnValue(null);
    vi.mocked(store.useSelectedModelId).mockReturnValue(null);
    vi.mocked(store.useLLMHealthStatus).mockReturnValue({});
    vi.mocked(store.useFetchProviders).mockReturnValue(mockFetchProviders);
    vi.mocked(store.useSelectProvider).mockReturnValue(mockSelectProvider);
    vi.mocked(store.useSelectModel).mockReturnValue(mockSelectModel);
    vi.mocked(store.useSetCurrentView).mockReturnValue(mockSetCurrentView);
    vi.mocked(store.useSetCurrentSkillName).mockReturnValue(
      mockSetCurrentSkillName,
    );
    vi.mocked(store.useSelectedSkillName).mockReturnValue(null);
    vi.mocked(store.useRecentExecutions).mockReturnValue([]);
    vi.mocked(store.useIsAdvancedSettingsOpen).mockReturnValue(false);
    vi.mocked(store.useSetAdvancedSettingsOpen).mockReturnValue(
      mockSetAdvancedSettingsOpen,
    );
  });

  describe("表示条件", () => {
    it("selectedSkillName非空 + skillExecutionStatus=completed + isExecuting=false のとき CTA を表示する", async () => {
      const store = await import("../../../store");
      vi.mocked(store.useSelectedSkillName).mockReturnValue("my-skill");
      vi.mocked(store.useSkillExecutionStatus).mockReturnValue("completed");
      vi.mocked(store.useIsSkillExecuting).mockReturnValue(false);

      render(<AgentView />);

      expect(
        screen.getByRole("region", { name: "スキル改善提案" }),
      ).toBeInTheDocument();
      expect(screen.getByText("スキルを分析・改善する")).toBeInTheDocument();
    });

    it("isExecuting=true のとき CTA を表示しない", async () => {
      const store = await import("../../../store");
      vi.mocked(store.useSelectedSkillName).mockReturnValue("my-skill");
      vi.mocked(store.useSkillExecutionStatus).mockReturnValue("completed");
      vi.mocked(store.useIsSkillExecuting).mockReturnValue(true);

      render(<AgentView />);

      expect(
        screen.queryByRole("region", { name: "スキル改善提案" }),
      ).not.toBeInTheDocument();
    });

    it("skillExecutionStatus=running のとき CTA を表示しない", async () => {
      const store = await import("../../../store");
      vi.mocked(store.useSelectedSkillName).mockReturnValue("my-skill");
      vi.mocked(store.useSkillExecutionStatus).mockReturnValue("running");
      vi.mocked(store.useIsSkillExecuting).mockReturnValue(false);

      render(<AgentView />);

      expect(
        screen.queryByRole("region", { name: "スキル改善提案" }),
      ).not.toBeInTheDocument();
    });

    it("skillExecutionStatus=error のとき CTA を表示しない", async () => {
      const store = await import("../../../store");
      vi.mocked(store.useSelectedSkillName).mockReturnValue("my-skill");
      vi.mocked(store.useSkillExecutionStatus).mockReturnValue("error");
      vi.mocked(store.useIsSkillExecuting).mockReturnValue(false);

      render(<AgentView />);

      expect(
        screen.queryByRole("region", { name: "スキル改善提案" }),
      ).not.toBeInTheDocument();
    });

    it("skillExecutionStatus=null のとき CTA を表示しない", async () => {
      const store = await import("../../../store");
      vi.mocked(store.useSelectedSkillName).mockReturnValue("my-skill");
      vi.mocked(store.useSkillExecutionStatus).mockReturnValue(null);
      vi.mocked(store.useIsSkillExecuting).mockReturnValue(false);

      render(<AgentView />);

      expect(
        screen.queryByRole("region", { name: "スキル改善提案" }),
      ).not.toBeInTheDocument();
    });

    it("selectedSkillName=null のとき CTA を表示しない", async () => {
      const store = await import("../../../store");
      vi.mocked(store.useSelectedSkillName).mockReturnValue(null);
      vi.mocked(store.useSkillExecutionStatus).mockReturnValue("completed");
      vi.mocked(store.useIsSkillExecuting).mockReturnValue(false);

      render(<AgentView />);

      expect(
        screen.queryByRole("region", { name: "スキル改善提案" }),
      ).not.toBeInTheDocument();
    });

    it('selectedSkillName="" のとき CTA を表示しない', async () => {
      const store = await import("../../../store");
      vi.mocked(store.useSelectedSkillName).mockReturnValue("");
      vi.mocked(store.useSkillExecutionStatus).mockReturnValue("completed");
      vi.mocked(store.useIsSkillExecuting).mockReturnValue(false);

      render(<AgentView />);

      expect(
        screen.queryByRole("region", { name: "スキル改善提案" }),
      ).not.toBeInTheDocument();
    });

    it('selectedSkillName="   " (空白のみ) のとき CTA を表示しない', async () => {
      const store = await import("../../../store");
      vi.mocked(store.useSelectedSkillName).mockReturnValue("   ");
      vi.mocked(store.useSkillExecutionStatus).mockReturnValue("completed");
      vi.mocked(store.useIsSkillExecuting).mockReturnValue(false);

      render(<AgentView />);

      expect(
        screen.queryByRole("region", { name: "スキル改善提案" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("クリック動作", () => {
    it("分析するボタンクリックで setCurrentSkillName が trimmed name で呼ばれ、その後 setCurrentView('skillAnalysis') が呼ばれること", async () => {
      const store = await import("../../../store");
      vi.mocked(store.useSelectedSkillName).mockReturnValue("  my-skill  ");
      vi.mocked(store.useSkillExecutionStatus).mockReturnValue("completed");
      vi.mocked(store.useIsSkillExecuting).mockReturnValue(false);

      render(<AgentView />);

      const button = screen.getByRole("button", {
        name: "スキルを分析・改善する",
      });
      fireEvent.click(button);

      expect(mockSetCurrentSkillName).toHaveBeenCalledWith("my-skill");
      expect(mockSetCurrentView).toHaveBeenCalledWith("skillAnalysis");

      // 呼び出し順序の確認
      const setSkillNameOrder =
        mockSetCurrentSkillName.mock.invocationCallOrder[0];
      const setViewOrder = mockSetCurrentView.mock.invocationCallOrder[0];
      expect(setSkillNameOrder).toBeLessThan(setViewOrder);
    });
  });

  describe("アクセシビリティ", () => {
    it("CTA の aria-label が正しいこと", async () => {
      const store = await import("../../../store");
      vi.mocked(store.useSelectedSkillName).mockReturnValue("my-skill");
      vi.mocked(store.useSkillExecutionStatus).mockReturnValue("completed");
      vi.mocked(store.useIsSkillExecuting).mockReturnValue(false);

      render(<AgentView />);

      const ctaRegion = screen.getByRole("region", { name: "スキル改善提案" });
      expect(ctaRegion).toHaveAttribute("aria-label", "スキル改善提案");

      const button = screen.getByRole("button", {
        name: "スキルを分析・改善する",
      });
      expect(button).toHaveAttribute("aria-label", "スキルを分析・改善する");
    });
  });
});
