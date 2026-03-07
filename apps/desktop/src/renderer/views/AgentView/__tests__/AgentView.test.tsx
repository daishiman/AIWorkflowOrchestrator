import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "@testing-library/react";
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

// Mock individual selector hooks (UT-FIX-AGENTVIEW-INFINITE-LOOP-001)
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
  useAbortSkillExecution: vi.fn(() => mockAbortExecution),
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
}));

describe("AgentView", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
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
    vi.mocked(store.useAbortSkillExecution).mockReturnValue(mockAbortExecution);
  });

  describe("レンダリング", () => {
    it("should render without crashing", () => {
      render(<AgentView />);
      expect(screen.getByTestId("agent-view")).toBeInTheDocument();
    });

    it("should display 'AIアシスタント' header", () => {
      render(<AgentView />);
      expect(screen.getByText("AIアシスタント")).toBeInTheDocument();
    });

    it("should have h1 heading with AIアシスタント", () => {
      render(<AgentView />);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("AIアシスタント");
    });
  });

  describe("空状態", () => {
    it("should display SkillCenter導線 when no skills imported", () => {
      render(<AgentView />);
      expect(
        screen.getByText(/Skill Center|ツールをインポート/),
      ).toBeInTheDocument();
    });

    it("should display ツールを追加 button in empty state", () => {
      render(<AgentView />);
      expect(screen.getByText("ツールを追加")).toBeInTheDocument();
    });
  });

  describe("エラー状態", () => {
    it("should display error message when error exists", async () => {
      const { useSkillError } = await import("../../../store");
      vi.mocked(useSkillError).mockReturnValue("エラーが発生しました");

      render(<AgentView />);
      expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
    });
  });

  describe("className", () => {
    it("should accept custom className", () => {
      render(<AgentView className="custom-class" />);
      expect(screen.getByTestId("agent-view")).toHaveClass("custom-class");
    });
  });

  describe("displayName", () => {
    it("should have displayName set", () => {
      expect(AgentView.displayName).toBe("AgentView");
    });
  });

  describe("アクセシビリティ", () => {
    it("should have accessible heading", () => {
      render(<AgentView />);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it("should have proper semantic structure with sections", () => {
      render(<AgentView />);
      const regions = screen.getAllByRole("region");
      // できること + 最近の実行 = 2 regions minimum
      expect(regions.length).toBeGreaterThanOrEqual(2);
    });

    it("should have radiogroup for ツール選択", () => {
      render(<AgentView />);
      const radiogroup = screen.getByRole("radiogroup", {
        name: "ツール選択",
      });
      expect(radiogroup).toBeInTheDocument();
    });
  });

  describe("スキル一覧表示", () => {
    it("should display skills as SkillChip when available", async () => {
      const mockSkills = [
        {
          id: "skill-1",
          name: "Test Skill",
          description: "Test description",
          path: "/path",
          triggers: ["test"],
        },
      ];

      const { useImportedSkills } = await import("../../../store");
      vi.mocked(useImportedSkills).mockReturnValue(mockSkills as never);

      render(<AgentView />);
      expect(screen.getAllByText("Test Skill").length).toBeGreaterThanOrEqual(
        1,
      );
    });
  });

  describe("エッジケース - オプションフィールド", () => {
    it("should render skill with missing optional category field", async () => {
      const skillWithoutCategory = {
        id: "skill-no-category",
        name: "Skill Without Category",
        description: "No category field",
        path: "/path",
        triggers: ["test"],
      };

      const { useImportedSkills } = await import("../../../store");
      vi.mocked(useImportedSkills).mockReturnValue([
        skillWithoutCategory,
      ] as never);

      render(<AgentView />);
      expect(
        screen.getAllByText("Skill Without Category").length,
      ).toBeGreaterThanOrEqual(1);
    });

    it("should render skill with empty triggers array", async () => {
      const skillWithEmptyTriggers = {
        id: "skill-empty-triggers",
        name: "Skill With Empty Triggers",
        description: "Empty triggers array",
        path: "/path",
        triggers: [],
      };

      const { useImportedSkills } = await import("../../../store");
      vi.mocked(useImportedSkills).mockReturnValue([
        skillWithEmptyTriggers,
      ] as never);

      render(<AgentView />);
      expect(
        screen.getAllByText("Skill With Empty Triggers").length,
      ).toBeGreaterThanOrEqual(1);
    });
  });

  describe("エッジケース - 長いテキスト", () => {
    it("should handle very long skill name", async () => {
      const longName = "A".repeat(200);
      const skillWithLongName = {
        id: "skill-long-name",
        name: longName,
        description: "Has a very long name",
        path: "/path",
        triggers: ["test"],
      };

      const { useImportedSkills } = await import("../../../store");
      vi.mocked(useImportedSkills).mockReturnValue([
        skillWithLongName,
      ] as never);

      render(<AgentView />);
      expect(screen.getAllByText(longName).length).toBeGreaterThanOrEqual(1);
    });

    it("should handle long error message", async () => {
      const longError = "Error: " + "X".repeat(200);

      const { useSkillError } = await import("../../../store");
      vi.mocked(useSkillError).mockReturnValue(longError);

      render(<AgentView />);
      expect(screen.getByText(longError)).toBeInTheDocument();
    });
  });

  describe("エッジケース - 空文字列", () => {
    it("should render skill with empty description", async () => {
      const skillWithEmptyDescription = {
        id: "skill-empty-desc",
        name: "Skill With Empty Description",
        description: "",
        path: "/path",
        triggers: ["test"],
      };

      const { useImportedSkills } = await import("../../../store");
      vi.mocked(useImportedSkills).mockReturnValue([
        skillWithEmptyDescription,
      ] as never);

      render(<AgentView />);
      expect(
        screen.getAllByText("Skill With Empty Description").length,
      ).toBeGreaterThanOrEqual(1);
    });
  });

  describe("エッジケース - 大量データ", () => {
    it("should render many skills without crashing", async () => {
      const manySkills = Array.from({ length: 100 }, (_, i) => ({
        id: `skill-${i}`,
        name: `Skill ${i}`,
        description: `Description for skill ${i}`,
        path: `/path/skill-${i}`,
        triggers: ["test"],
      }));

      const { useImportedSkills } = await import("../../../store");
      vi.mocked(useImportedSkills).mockReturnValue(manySkills as never);

      render(<AgentView />);
      expect(screen.getAllByText("Skill 0").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Skill 99").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("アクセシビリティ拡張", () => {
    it("should have proper ARIA labels on main sections", () => {
      render(<AgentView />);
      const regions = screen.getAllByRole("region");
      regions.forEach((region) => {
        expect(region).toHaveAttribute("aria-label");
      });
    });

    it("should have heading hierarchy", () => {
      render(<AgentView />);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("AIアシスタント");
    });

    it("should have region for できること section", () => {
      render(<AgentView />);
      const regions = screen.getAllByRole("region");
      const dekiruRegion = regions.find(
        (r) => r.getAttribute("aria-label") === "できること",
      );
      expect(dekiruRegion).toBeInTheDocument();
    });
  });

  describe("状態遷移", () => {
    it("should display skills when loaded", async () => {
      const store = await import("../../../store");

      const mockSkills = [
        {
          id: "skill-1",
          name: "Loaded Skill",
          description: "Description",
          path: "/path",
          triggers: ["test"],
        },
      ];

      vi.mocked(store.useImportedSkills).mockReturnValue(mockSkills as never);

      render(<AgentView />);
      expect(screen.getAllByText("Loaded Skill").length).toBeGreaterThanOrEqual(
        1,
      );
    });
  });

  describe("日本語コンテンツ", () => {
    it("should render Japanese skill name correctly", async () => {
      const japaneseSkill = {
        id: "skill-jp",
        name: "テストスキル",
        description: "これはテスト用のスキルです",
        path: "/path",
        triggers: ["テスト"],
      };

      const { useImportedSkills } = await import("../../../store");
      vi.mocked(useImportedSkills).mockReturnValue([japaneseSkill] as never);

      render(<AgentView />);
      expect(screen.getAllByText("テストスキル").length).toBeGreaterThanOrEqual(
        1,
      );
    });
  });

  describe("再レンダリング安定性", () => {
    it("should call fetchSkills only once on mount", () => {
      render(<AgentView />);
      expect(mockFetchSkills).toHaveBeenCalledTimes(1);
    });

    it("should not re-trigger fetchSkills on rerender", () => {
      const { rerender } = render(<AgentView />);
      rerender(<AgentView />);
      // StrictModeなしでは1回のみ
      expect(mockFetchSkills).toHaveBeenCalledTimes(1);
    });
  });

  describe("ハンドラ動作", () => {
    it("should call fetchSkills and openImportDialog on import click", () => {
      render(<AgentView />);
      // ヘッダー内のインポートボタンをクリック
      const importButtons = screen.getAllByText("インポート");
      fireEvent.click(importButtons[0]);
      expect(mockFetchSkills).toHaveBeenCalledTimes(2); // mount + click
      expect(mockOpenImportDialog).toHaveBeenCalledTimes(1);
    });
  });

  describe("トースト表示", () => {
    it("should display toast message when present", async () => {
      const { useToastMessage } = await import("../../../store");
      vi.mocked(useToastMessage).mockReturnValue({
        type: "success",
        message: "操作が完了しました",
      });
      render(<AgentView />);
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("操作が完了しました")).toBeInTheDocument();
    });

    it("should not display toast when null", () => {
      render(<AgentView />);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("スキル表示", () => {
    it("should display skills with category field", async () => {
      const skillsWithCategory = [
        {
          id: "skill-cat-1",
          name: "Skill With Category",
          description: "Has a category",
          path: "/path/cat",
          triggers: ["test"],
          category: "automation",
        },
      ];

      const store = await import("../../../store");
      vi.mocked(store.useImportedSkills).mockReturnValue(
        skillsWithCategory as never,
      );

      render(<AgentView />);
      expect(
        screen.getAllByText("Skill With Category").length,
      ).toBeGreaterThanOrEqual(1);
    });
  });

  describe("スキルチップ選択", () => {
    it("should display skill chips when skills are available", async () => {
      const mockSkills = [
        {
          id: "skill-click",
          name: "Clickable Skill",
          description: "A clickable skill",
          path: "/path/click",
          triggers: ["test"],
        },
      ];

      const store = await import("../../../store");
      vi.mocked(store.useImportedSkills).mockReturnValue(mockSkills as never);

      render(<AgentView />);

      expect(
        screen.getAllByText("Clickable Skill").length,
      ).toBeGreaterThanOrEqual(1);
    });
  });

  describe("インポートダイアログ", () => {
    it("should render SkillImportDialog when isImportDialogOpen is true", async () => {
      const store = await import("../../../store");
      vi.mocked(store.useIsImportDialogOpen).mockReturnValue(true);
      vi.mocked(store.useAvailableSkillsMetadata).mockReturnValue([
        {
          id: "avail-1",
          name: "Available Skill",
          description: "An available skill",
          path: "/path/avail",
          triggers: ["test"],
        },
      ] as never);

      render(<AgentView />);
      // インポートダイアログが表示されることを確認
      expect(screen.getByText("Available Skill")).toBeInTheDocument();
    });
  });

  describe("handleImport コールバック", () => {
    it("should call importSkill and closeImportDialog on successful import", async () => {
      mockImportSkill.mockResolvedValue(undefined);

      const store = await import("../../../store");
      vi.mocked(store.useIsImportDialogOpen).mockReturnValue(true);
      vi.mocked(store.useAvailableSkillsMetadata).mockReturnValue([
        {
          id: "import-skill-1",
          name: "ImportableSkill",
          description: "A skill to import",
          path: "/path/import",
          triggers: ["test"],
        },
      ] as never);
      vi.mocked(store.useImportedSkillIds).mockReturnValue([]);

      render(<AgentView />);

      // スキルを選択してインポート実行
      const skillCheckbox = screen.getByLabelText("ImportableSkill");
      fireEvent.click(skillCheckbox);

      // ダイアログのフッター内のインポートボタンを取得
      const importButtons = screen.getAllByText("インポート");
      // 最後のインポートボタン（ダイアログのフッター内）をクリック
      const dialogImportButton = importButtons[importButtons.length - 1];
      await act(async () => {
        fireEvent.click(dialogImportButton);
      });

      expect(mockImportSkill).toHaveBeenCalledWith("ImportableSkill");
      expect(mockShowToast).toHaveBeenCalledWith(
        "success",
        "1件のスキルをインポートしました",
      );
      expect(mockCloseImportDialog).toHaveBeenCalled();
    });

    it("should show error toast when import fails", async () => {
      const importError = new Error("Import failed");
      mockImportSkill.mockRejectedValue(importError);

      const store = await import("../../../store");
      vi.mocked(store.useIsImportDialogOpen).mockReturnValue(true);
      vi.mocked(store.useAvailableSkillsMetadata).mockReturnValue([
        {
          id: "fail-skill-1",
          name: "FailSkill",
          description: "A skill that fails to import",
          path: "/path/fail",
          triggers: ["test"],
        },
      ] as never);
      vi.mocked(store.useImportedSkillIds).mockReturnValue([]);

      render(<AgentView />);

      // スキルを選択してインポート実行
      const skillCheckbox = screen.getByLabelText("FailSkill");
      fireEvent.click(skillCheckbox);

      // ダイアログのフッター内のインポートボタンを取得
      const importButtons = screen.getAllByText("インポート");
      const dialogImportButton = importButtons[importButtons.length - 1];
      await act(async () => {
        fireEvent.click(dialogImportButton);
      });

      expect(mockImportSkill).toHaveBeenCalledWith("FailSkill");
      expect(mockShowToast).toHaveBeenCalledWith(
        "error",
        "インポートに失敗しました: Import failed",
      );
    });

    it("should show generic error toast when import fails with non-Error", async () => {
      mockImportSkill.mockRejectedValue("string error");

      const store = await import("../../../store");
      vi.mocked(store.useIsImportDialogOpen).mockReturnValue(true);
      vi.mocked(store.useAvailableSkillsMetadata).mockReturnValue([
        {
          id: "fail-skill-2",
          name: "FailSkill2",
          description: "A skill that fails with non-Error",
          path: "/path/fail2",
          triggers: ["test"],
        },
      ] as never);
      vi.mocked(store.useImportedSkillIds).mockReturnValue([]);

      render(<AgentView />);

      const skillCheckbox = screen.getByLabelText("FailSkill2");
      fireEvent.click(skillCheckbox);

      const importButtons = screen.getAllByText("インポート");
      const dialogImportButton = importButtons[importButtons.length - 1];
      await act(async () => {
        fireEvent.click(dialogImportButton);
      });

      expect(mockImportSkill).toHaveBeenCalledWith("FailSkill2");
      expect(mockShowToast).toHaveBeenCalledWith(
        "error",
        "インポートに失敗しました",
      );
    });
  });

  describe("無限ループ防止（UT-FIX-AGENTVIEW-INFINITE-LOOP-001）", () => {
    it("should not contain debug console.log statements in source", async () => {
      // ソースコードにデバッグ用console.logが含まれないことを確認
      const fs = await import("fs");
      const path = await import("path");
      const sourceFile = path.resolve(__dirname, "../index.tsx");
      const source = fs.readFileSync(sourceFile, "utf-8");
      const debugLogs = source.match(/console\.log\(/g);
      expect(debugLogs).toBeNull();
    });

    it("should use individual selector hooks instead of inline selectors", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const sourceFile = path.resolve(__dirname, "../index.tsx");
      const source = fs.readFileSync(sourceFile, "utf-8");
      // インラインセレクタパターンが含まれないことを確認
      const inlineSelectors = source.match(/useAppStore\(\(state\) =>/g);
      expect(inlineSelectors).toBeNull();
    });

    it("should not have local fetchSkills useCallback", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const sourceFile = path.resolve(__dirname, "../index.tsx");
      const source = fs.readFileSync(sourceFile, "utf-8");
      // ローカルfetchSkills定義が含まれないことを確認
      const localFetchSkills = source.match(/const fetchSkills = useCallback/g);
      expect(localFetchSkills).toBeNull();
    });
  });
});
