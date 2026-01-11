import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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

// Mock store state - flat structure matching actual store
const createMockState = (overrides = {}) => ({
  // AgentSlice
  skills: [],
  availableSkills: [],
  importedSkillIds: [],
  selectedSkill: null,
  skillFilter: "",
  skillCategory: null,
  isImportDialogOpen: false,
  toastMessage: null,
  executionStatus: "idle" as const,
  currentExecutionId: null,
  executionOutput: [],
  isLoading: false,
  error: null,
  setSkills: vi.fn(),
  setAvailableSkills: vi.fn(),
  setImportedSkillIds: vi.fn(),
  selectSkill: vi.fn(),
  setSkillFilter: vi.fn(),
  setSkillCategory: vi.fn(),
  openImportDialog: vi.fn(),
  closeImportDialog: vi.fn(),
  showToast: vi.fn(),
  clearToast: vi.fn(),
  setExecutionStatus: vi.fn(),
  setCurrentExecutionId: vi.fn(),
  appendOutput: vi.fn(),
  clearExecution: vi.fn(),
  setLoading: vi.fn(),
  setError: vi.fn(),
  resetAgentState: vi.fn(),
  ...overrides,
});

vi.mock("../../../store", () => ({
  useAppStore: vi.fn((selector: (state: unknown) => unknown) =>
    selector(createMockState()),
  ),
}));

describe("AgentView", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { useAppStore } = await import("../../../store");
    vi.mocked(useAppStore).mockImplementation(((
      selector: (state: ReturnType<typeof createMockState>) => unknown,
    ) => selector(createMockState())) as never);
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
    it("should display loading state when isLoading is true", async () => {
      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) => selector(createMockState({ isLoading: true }))) as never);

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
      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(createMockState({ error: "エラーが発生しました" }))) as never);

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

      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) => selector(createMockState({ skills: mockSkills }))) as never);

      render(<AgentView />);
      // Note: This test will fail in Red state as skill list is not implemented yet
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
        // category is omitted
      };

      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({ skills: [skillWithoutCategory] }),
        )) as never);

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

      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({ skills: [skillWithEmptyTriggers] }),
        )) as never);

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

      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(createMockState({ skills: [skillWithLongName] }))) as never);

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

      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({ skills: [skillWithLongDescription] }),
        )) as never);

      render(<AgentView />);
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it("should handle long error message", async () => {
      const longError = "Error: " + "X".repeat(200);

      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) => selector(createMockState({ error: longError }))) as never);

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

      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({ skills: [skillWithEmptyDescription] }),
        )) as never);

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

      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) => selector(createMockState({ skills: manySkills }))) as never);

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
      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) => selector(createMockState({ error: "Test error" }))) as never);

      render(<AgentView />);
      const errorElement = screen.getByText("Test error");
      expect(errorElement).toHaveClass("text-red-400");
    });

    it("should have region for error state", async () => {
      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) => selector(createMockState({ error: "Error message" }))) as never);

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
      const { useAppStore } = await import("../../../store");

      // First render with loading
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) => selector(createMockState({ isLoading: true }))) as never);

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

      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({ isLoading: false, skills: mockSkills }),
        )) as never);

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

      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) => selector(createMockState({ skills: [japaneseSkill] }))) as never);

      render(<AgentView />);
      expect(screen.getByText("テストスキル")).toBeInTheDocument();
      expect(
        screen.getByText("これはテスト用のスキルです"),
      ).toBeInTheDocument();
    });
  });
});
