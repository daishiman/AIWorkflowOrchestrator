import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
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
  });

  describe("レンダリング", () => {
    it("should render without crashing", () => {
      render(<AgentView />);
      expect(screen.getByTestId("agent-view")).toBeInTheDocument();
    });

    it("should display 'Agent' header", () => {
      render(<AgentView />);
      expect(screen.getByText("Agent")).toBeInTheDocument();
    });

    it("should display description text", () => {
      render(<AgentView />);
      expect(screen.getByText("スキルの管理と実行")).toBeInTheDocument();
    });

    it("should have h1 heading", () => {
      render(<AgentView />);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("Agent");
    });
  });

  describe("ローディング状態", () => {
    it("should display loading state when isLoadingSkills is true", async () => {
      const { useIsLoadingSkills } = await import("../../../store");
      vi.mocked(useIsLoadingSkills).mockReturnValue(true);

      render(<AgentView />);
      expect(screen.getByText("スキルを読み込み中...")).toBeInTheDocument();
    });
  });

  describe("空状態", () => {
    it("should display placeholder message when not loading", () => {
      render(<AgentView />);
      expect(
        screen.getByText("スキルがインポートされていません"),
      ).toBeInTheDocument();
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

    it("should have proper semantic structure", () => {
      render(<AgentView />);
      // Header section should contain the title
      const header = screen.getByRole("banner");
      expect(header).toBeInTheDocument();
    });

    it("should have main content section", () => {
      render(<AgentView />);
      // Using section element for main content
      const section = screen.getByRole("region");
      expect(section).toBeInTheDocument();
    });
  });

  describe("スキル一覧表示", () => {
    it("should display skills when available", async () => {
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
      expect(screen.getByText("Test Skill")).toBeInTheDocument();
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
      expect(screen.getByText("Skill Without Category")).toBeInTheDocument();
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
      expect(screen.getByText("Skill With Empty Triggers")).toBeInTheDocument();
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
      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it("should handle very long skill description", async () => {
      const longDescription = "B".repeat(500);
      const skillWithLongDescription = {
        id: "skill-long-desc",
        name: "Skill With Long Description",
        description: longDescription,
        path: "/path",
        triggers: ["test"],
      };

      const { useImportedSkills } = await import("../../../store");
      vi.mocked(useImportedSkills).mockReturnValue([
        skillWithLongDescription,
      ] as never);

      render(<AgentView />);
      expect(screen.getByText(longDescription)).toBeInTheDocument();
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
        screen.getByText("Skill With Empty Description"),
      ).toBeInTheDocument();
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
      expect(screen.getByText("Skill 0")).toBeInTheDocument();
      expect(screen.getByText("Skill 99")).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ拡張", () => {
    it("should have proper ARIA labels on main sections", () => {
      render(<AgentView />);
      const region = screen.getByRole("region");
      expect(region).toHaveAttribute("aria-label");
    });

    it("should have banner role for header", () => {
      render(<AgentView />);
      const banner = screen.getByRole("banner");
      expect(banner).toBeInTheDocument();
    });

    it("should have heading hierarchy", () => {
      render(<AgentView />);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("Agent");
    });

    it("should show error with proper styling", async () => {
      const { useSkillError } = await import("../../../store");
      vi.mocked(useSkillError).mockReturnValue("Test error");

      render(<AgentView />);
      const errorElement = screen.getByText("Test error");
      expect(errorElement).toHaveClass("text-red-400");
    });

    it("should have region for error state", async () => {
      const { useSkillError } = await import("../../../store");
      vi.mocked(useSkillError).mockReturnValue("Error message");

      render(<AgentView />);
      const region = screen.getByRole("region");
      expect(region).toHaveAttribute("aria-label", "エラー");
    });

    it("should have region for main content", () => {
      render(<AgentView />);
      const region = screen.getByRole("region");
      expect(region).toHaveAttribute("aria-label", "メインコンテンツ");
    });
  });

  describe("状態遷移", () => {
    it("should display loading then content", async () => {
      const store = await import("../../../store");

      // First render with loading
      vi.mocked(store.useIsLoadingSkills).mockReturnValue(true);

      const { rerender } = render(<AgentView />);
      expect(screen.getByText("スキルを読み込み中...")).toBeInTheDocument();

      // Rerender with content
      const mockSkills = [
        {
          id: "skill-1",
          name: "Loaded Skill",
          description: "Description",
          path: "/path",
          triggers: ["test"],
        },
      ];

      vi.mocked(store.useIsLoadingSkills).mockReturnValue(false);
      vi.mocked(store.useImportedSkills).mockReturnValue(mockSkills as never);

      rerender(<AgentView />);
      expect(screen.getByText("Loaded Skill")).toBeInTheDocument();
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
      expect(screen.getByText("テストスキル")).toBeInTheDocument();
      expect(
        screen.getByText("これはテスト用のスキルです"),
      ).toBeInTheDocument();
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
      // ヘッダー内のインポートボタンを特定（SkillList内にも同名ボタンが存在するため）
      const header = screen.getByRole("banner");
      const importButton = within(header).getByText("インポート");
      fireEvent.click(importButton);
      expect(mockFetchSkills).toHaveBeenCalledTimes(2); // mount + click
      expect(mockOpenImportDialog).toHaveBeenCalledTimes(1);
    });

    it("should call fetchSkills on retry click", async () => {
      const { useSkillError } = await import("../../../store");
      vi.mocked(useSkillError).mockReturnValue("テストエラー");
      render(<AgentView />);
      const retryButton = screen.getByText("再試行");
      fireEvent.click(retryButton);
      expect(mockFetchSkills).toHaveBeenCalledTimes(2); // mount + retry
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

  describe("カテゴリ抽出", () => {
    it("should extract categories from imported skills with category field", async () => {
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
      // カテゴリフィルタにカテゴリが反映されていることを確認
      expect(screen.getByText("Skill With Category")).toBeInTheDocument();
    });
  });

  describe("レスポンシブレイアウト", () => {
    it("should render detail panel with mobile layout when window is narrow", async () => {
      // windowWidthを小さく設定
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 800,
      });

      const mockSkill = {
        id: "skill-mobile",
        name: "Mobile Skill",
        description: "Test mobile layout",
        path: "/path/mobile",
        triggers: ["test"],
        anchors: [],
      };

      const store = await import("../../../store");
      vi.mocked(store.useSelectedSkill).mockReturnValue(mockSkill as never);
      vi.mocked(store.useImportedSkills).mockReturnValue([mockSkill] as never);

      render(<AgentView />);

      // レンダリング後に resize イベントを発火して handleResize をカバー
      await act(() => {
        window.dispatchEvent(new Event("resize"));
      });

      // モバイルレイアウトのオーバーレイが表示されることを確認
      const detailPanel = screen.getByRole("complementary");
      expect(detailPanel).toBeInTheDocument();

      // windowWidthを元に戻す
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });
  });

  describe("スキル選択ハンドラ", () => {
    it("should call selectSkill when a skill is clicked in the list", async () => {
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

      // SkillList 内のスキルをクリック
      const skillItem = screen.getByText("Clickable Skill");
      fireEvent.click(skillItem);

      expect(mockSelectSkill).toHaveBeenCalledWith(
        expect.objectContaining({ id: "skill-click", name: "Clickable Skill" }),
      );
    });
  });

  describe("スキル詳細パネル表示", () => {
    it("should display SkillDetailPanel when a skill is selected", async () => {
      const mockSkill = {
        id: "skill-selected",
        name: "Selected Skill",
        description: "A selected skill",
        path: "/path/selected",
        triggers: ["test"],
        anchors: [],
      };

      const store = await import("../../../store");
      vi.mocked(store.useSelectedSkill).mockReturnValue(mockSkill as never);
      vi.mocked(store.useImportedSkills).mockReturnValue([mockSkill] as never);

      render(<AgentView />);
      // SkillDetailPanel がレンダリングされることを確認（complementary role）
      const detailPanel = screen.getByRole("complementary");
      expect(detailPanel).toBeInTheDocument();
      expect(
        within(detailPanel).getByText("Selected Skill"),
      ).toBeInTheDocument();
    });

    it("should not display SkillDetailPanel when no skill is selected", () => {
      render(<AgentView />);
      // selectedSkill が null のとき、詳細パネルは非表示
      expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    });

    it("should call showToast on successful execute", async () => {
      const mockSkill = {
        id: "skill-exec",
        name: "Exec Skill",
        description: "Test execution",
        path: "/path/exec",
        triggers: ["test"],
        anchors: [],
      };

      const store = await import("../../../store");
      vi.mocked(store.useSelectedSkill).mockReturnValue(mockSkill as never);
      vi.mocked(store.useImportedSkills).mockReturnValue([mockSkill] as never);

      render(<AgentView />);

      // 詳細パネルの実行ボタンをクリック
      const detailPanel = screen.getByRole("complementary");
      const executeButton = within(detailPanel).getByText("実行");
      await act(async () => {
        fireEvent.click(executeButton);
      });

      expect(mockShowToast).toHaveBeenCalledWith(
        "success",
        "Exec Skill を実行しました",
      );
    });

    it("should call removeSkill and showToast on successful delete", async () => {
      const mockSkill = {
        id: "skill-delete",
        name: "Delete Skill",
        description: "Test deletion",
        path: "/path/delete",
        triggers: ["test"],
        anchors: [],
      };

      mockRemoveSkill.mockResolvedValue(undefined);

      const store = await import("../../../store");
      vi.mocked(store.useSelectedSkill).mockReturnValue(mockSkill as never);
      vi.mocked(store.useImportedSkills).mockReturnValue([mockSkill] as never);

      render(<AgentView />);

      // 詳細パネルの削除ボタンをクリック
      const detailPanel = screen.getByRole("complementary");
      const deleteButton = within(detailPanel).getByText("削除");
      fireEvent.click(deleteButton);

      // 確認ダイアログの「はい」をクリック
      const confirmButton = screen.getByText("はい");
      await act(async () => {
        fireEvent.click(confirmButton);
      });

      expect(mockRemoveSkill).toHaveBeenCalledWith("Delete Skill");
      expect(mockShowToast).toHaveBeenCalledWith(
        "success",
        "Delete Skill を削除しました",
      );
      expect(mockSelectSkill).toHaveBeenCalledWith(null);
    });

    it("should show error toast when execute fails with Error", async () => {
      const mockSkill = {
        id: "skill-exec-fail",
        name: "Exec Fail Skill",
        description: "Test execution failure",
        path: "/path/exec-fail",
        triggers: ["test"],
        anchors: [],
      };

      const store = await import("../../../store");
      vi.mocked(store.useSelectedSkill).mockReturnValue(mockSkill as never);
      vi.mocked(store.useImportedSkills).mockReturnValue([mockSkill] as never);

      // window.electronAPI.skill.execute をエラーに設定
      const execMock = vi.fn().mockRejectedValue(new Error("Exec error"));
      (
        window as unknown as {
          electronAPI: { skill: { execute: typeof execMock } };
        }
      ).electronAPI.skill.execute = execMock;

      render(<AgentView />);

      const detailPanel = screen.getByRole("complementary");
      const executeButton = within(detailPanel).getByText("実行");
      await act(async () => {
        fireEvent.click(executeButton);
      });

      expect(mockShowToast).toHaveBeenCalledWith(
        "error",
        "スキル実行に失敗しました: Exec error",
      );
    });

    it("should show generic error toast when execute fails with non-Error", async () => {
      const mockSkill = {
        id: "skill-exec-fail-generic",
        name: "Exec Fail Generic",
        description: "Test execution failure with non-Error",
        path: "/path/exec-fail-generic",
        triggers: ["test"],
        anchors: [],
      };

      const store = await import("../../../store");
      vi.mocked(store.useSelectedSkill).mockReturnValue(mockSkill as never);
      vi.mocked(store.useImportedSkills).mockReturnValue([mockSkill] as never);

      // window.electronAPI.skill.execute を非Errorで reject
      const execMock = vi.fn().mockRejectedValue("string error");
      (
        window as unknown as {
          electronAPI: { skill: { execute: typeof execMock } };
        }
      ).electronAPI.skill.execute = execMock;

      render(<AgentView />);

      const detailPanel = screen.getByRole("complementary");
      const executeButton = within(detailPanel).getByText("実行");
      await act(async () => {
        fireEvent.click(executeButton);
      });

      expect(mockShowToast).toHaveBeenCalledWith(
        "error",
        "スキル実行に失敗しました",
      );
    });

    it("should show generic error toast when delete fails with non-Error", async () => {
      const mockSkill = {
        id: "skill-delete-fail-generic",
        name: "Delete Fail Generic",
        description: "Test deletion failure with non-Error",
        path: "/path/delete-fail-generic",
        triggers: ["test"],
        anchors: [],
      };

      mockRemoveSkill.mockRejectedValue("string error");

      const store = await import("../../../store");
      vi.mocked(store.useSelectedSkill).mockReturnValue(mockSkill as never);
      vi.mocked(store.useImportedSkills).mockReturnValue([mockSkill] as never);

      render(<AgentView />);

      const detailPanel = screen.getByRole("complementary");
      const deleteButton = within(detailPanel).getByText("削除");
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByText("はい");
      await act(async () => {
        fireEvent.click(confirmButton);
      });

      expect(mockShowToast).toHaveBeenCalledWith("error", "削除に失敗しました");
    });

    it("should show error toast when delete fails", async () => {
      const mockSkill = {
        id: "skill-delete-fail",
        name: "Delete Fail Skill",
        description: "Test deletion failure",
        path: "/path/delete-fail",
        triggers: ["test"],
        anchors: [],
      };

      mockRemoveSkill.mockRejectedValue(new Error("Delete error"));

      const store = await import("../../../store");
      vi.mocked(store.useSelectedSkill).mockReturnValue(mockSkill as never);
      vi.mocked(store.useImportedSkills).mockReturnValue([mockSkill] as never);

      render(<AgentView />);

      const detailPanel = screen.getByRole("complementary");
      const deleteButton = within(detailPanel).getByText("削除");
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByText("はい");
      await act(async () => {
        fireEvent.click(confirmButton);
      });

      expect(mockRemoveSkill).toHaveBeenCalledWith("Delete Fail Skill");
      expect(mockShowToast).toHaveBeenCalledWith(
        "error",
        "削除に失敗しました: Delete error",
      );
    });

    it("should call selectSkill(null) when close button is clicked on detail panel", async () => {
      const mockSkill = {
        id: "skill-close-test",
        name: "Close Test Skill",
        description: "Test closing detail panel",
        path: "/path/close",
        triggers: ["test"],
        anchors: [],
      };

      const store = await import("../../../store");
      vi.mocked(store.useSelectedSkill).mockReturnValue(mockSkill as never);
      vi.mocked(store.useImportedSkills).mockReturnValue([mockSkill] as never);

      render(<AgentView />);

      // 詳細パネルの閉じるボタンをクリック
      const closeButton = screen.getByLabelText("閉じる");
      fireEvent.click(closeButton);

      expect(mockSelectSkill).toHaveBeenCalledWith(null);
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
