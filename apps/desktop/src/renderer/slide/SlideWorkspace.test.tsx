import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SlideWorkspace } from "./SlideWorkspace";

// useSlideProject をモック
const mockUseSlideProject = vi.fn();
vi.mock("./useSlideProject", () => ({
  useSlideProject: () => mockUseSlideProject(),
}));

// SkillPhasePanel をモック
vi.mock("./SkillPhasePanel", () => ({
  SkillPhasePanel: () => (
    <div data-testid="skill-phase-panel">SkillPhasePanel</div>
  ),
}));

const mockUseHandoffGuidance = vi.fn();
const mockSetCurrentView = vi.fn();
vi.mock("../store", () => ({
  useHandoffGuidance: () => mockUseHandoffGuidance(),
  useSetCurrentView: () => mockSetCurrentView,
}));

// window.electronAPI モック
const mockShowOpenDialog = vi.fn();
Object.defineProperty(window, "electronAPI", {
  value: {
    dialog: {
      showOpenDialog: mockShowOpenDialog,
    },
  },
  writable: true,
});

// navigator.clipboard モック
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

function createMockState(overrides: Record<string, unknown> = {}) {
  return {
    project: null,
    syncStatus: "synced" as const,
    currentPhase: "idle" as const,
    lastSyncedAt: null,
    isExecuting: false,
    executionProgress: 0,
    error: null,
    isWatching: false,
    openProject: vi.fn(),
    executePhase: vi.fn(),
    manualSync: vi.fn(),
    cancelExecution: vi.fn(),
    closeProject: vi.fn(),
    hasProject: false,
    ...overrides,
  };
}

describe("SlideWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseHandoffGuidance.mockReturnValue(null);
  });

  describe("empty state (no project)", () => {
    it("shows open project CTA when no project selected", () => {
      mockUseSlideProject.mockReturnValue(createMockState());
      render(<SlideWorkspace />);
      expect(screen.getByText("プロジェクトを開く")).toBeDefined();
      expect(
        screen.getByText("プロジェクトが選択されていません"),
      ).toBeDefined();
    });

    it("does not show SlideSyncCard when no project", () => {
      mockUseSlideProject.mockReturnValue(createMockState());
      render(<SlideWorkspace />);
      expect(screen.queryByLabelText(/同期状態/)).toBeNull();
    });
  });

  describe("synced state", () => {
    it("shows SlideSyncCard with synced status", () => {
      mockUseSlideProject.mockReturnValue(
        createMockState({
          project: { path: "/test/project" },
          syncStatus: "synced",
        }),
      );
      render(<SlideWorkspace />);
      expect(screen.getByLabelText("同期状態: 同期済み")).toBeDefined();
      expect(
        screen.getAllByText("/test/project").length,
      ).toBeGreaterThanOrEqual(1);
    });

    it("shows SkillPhasePanel in synced state", () => {
      mockUseSlideProject.mockReturnValue(
        createMockState({
          project: { path: "/test/project" },
          syncStatus: "synced",
        }),
      );
      render(<SlideWorkspace />);
      expect(screen.getByTestId("skill-phase-panel")).toBeDefined();
    });

    it("does not show SlideProgressRow in synced state", () => {
      mockUseSlideProject.mockReturnValue(
        createMockState({
          project: { path: "/test/project" },
          syncStatus: "synced",
        }),
      );
      render(<SlideWorkspace />);
      expect(screen.queryByTestId("slide-progress-row")).toBeNull();
    });

    it("does not show SlideGuidanceBlock in synced state", () => {
      mockUseSlideProject.mockReturnValue(
        createMockState({
          project: { path: "/test/project" },
          syncStatus: "synced",
        }),
      );
      render(<SlideWorkspace />);
      expect(screen.queryByTestId("slide-guidance-block")).toBeNull();
    });

    it("shows SlideWatchStatus", () => {
      mockUseSlideProject.mockReturnValue(
        createMockState({
          project: { path: "/test/project" },
          isWatching: true,
        }),
      );
      render(<SlideWorkspace />);
      expect(screen.getByTestId("slide-watch-status")).toBeDefined();
    });
  });

  describe("running state", () => {
    it("shows SlideProgressRow when executing", () => {
      mockUseSlideProject.mockReturnValue(
        createMockState({
          project: { path: "/test/project" },
          syncStatus: "syncing",
          isExecuting: true,
          currentPhase: "structure",
          executionProgress: 50,
        }),
      );
      render(<SlideWorkspace />);
      expect(screen.getByTestId("slide-progress-row")).toBeDefined();
    });

    it("does not show SkillPhasePanel when running", () => {
      mockUseSlideProject.mockReturnValue(
        createMockState({
          project: { path: "/test/project" },
          syncStatus: "syncing",
          isExecuting: true,
        }),
      );
      render(<SlideWorkspace />);
      expect(screen.queryByTestId("skill-phase-panel")).toBeNull();
    });

    it("shows SlideSyncCard with running badge", () => {
      mockUseSlideProject.mockReturnValue(
        createMockState({
          project: { path: "/test/project" },
          syncStatus: "syncing",
          isExecuting: true,
        }),
      );
      render(<SlideWorkspace />);
      expect(screen.getByLabelText("同期状態: 同期中...")).toBeDefined();
    });
  });

  describe("degraded state", () => {
    it("shows SlideGuidanceBlock with degraded variant when error", () => {
      mockUseSlideProject.mockReturnValue(
        createMockState({
          project: { path: "/test/project" },
          error: "Connection failed",
        }),
      );
      render(<SlideWorkspace />);
      expect(screen.getByTestId("slide-guidance-block")).toBeDefined();
      expect(screen.getByRole("alert")).toBeDefined();
    });

    it("shows SlideSyncCard with degraded badge", () => {
      mockUseSlideProject.mockReturnValue(
        createMockState({
          project: { path: "/test/project" },
          error: "Error",
        }),
      );
      render(<SlideWorkspace />);
      expect(screen.getByLabelText("同期状態: 同期失敗")).toBeDefined();
    });

    it("does not show SkillPhasePanel when degraded", () => {
      mockUseSlideProject.mockReturnValue(
        createMockState({
          project: { path: "/test/project" },
          error: "Error",
        }),
      );
      render(<SlideWorkspace />);
      expect(screen.queryByTestId("skill-phase-panel")).toBeNull();
    });
  });

  describe("guidance state", () => {
    it("shows SlideGuidanceBlock when handoff guidance exists", () => {
      mockUseHandoffGuidance.mockReturnValue({
        terminalCommand: "claude --resume --continue",
        contextSummary: "continue the slide sync",
        reason: "Claude API キーの設定が必要です",
      });
      mockUseSlideProject.mockReturnValue(
        createMockState({
          project: { path: "/test/project" },
        }),
      );

      render(<SlideWorkspace />);

      expect(screen.getByTestId("slide-guidance-block")).toBeDefined();
      expect(screen.getByText("統合実行の設定が必要です")).toBeDefined();
      expect(screen.getByText("Claude API キーの設定が必要です")).toBeDefined();
    });

    it("does not show SkillPhasePanel in guidance state", () => {
      mockUseHandoffGuidance.mockReturnValue({
        terminalCommand: "claude --resume --continue",
        contextSummary: "continue the slide sync",
        reason: "Claude API キーの設定が必要です",
      });
      mockUseSlideProject.mockReturnValue(
        createMockState({
          project: { path: "/test/project" },
        }),
      );

      render(<SlideWorkspace />);

      expect(screen.queryByTestId("skill-phase-panel")).toBeNull();
    });
  });

  describe("TerminalLauncher (persistent)", () => {
    it("shows TerminalLauncher when project is open", () => {
      mockUseSlideProject.mockReturnValue(
        createMockState({
          project: { path: "/test/project" },
        }),
      );
      render(<SlideWorkspace />);
      expect(screen.getByTestId("terminal-launcher")).toBeDefined();
    });

    it("does not show TerminalLauncher when no project", () => {
      mockUseSlideProject.mockReturnValue(createMockState());
      render(<SlideWorkspace />);
      expect(screen.queryByTestId("terminal-launcher")).toBeNull();
    });

    it("shows TerminalLauncher in running state", () => {
      mockUseSlideProject.mockReturnValue(
        createMockState({
          project: { path: "/test/project" },
          syncStatus: "syncing",
          isExecuting: true,
        }),
      );
      render(<SlideWorkspace />);
      expect(screen.getByTestId("terminal-launcher")).toBeDefined();
    });

    it("shows TerminalLauncher in degraded state", () => {
      mockUseSlideProject.mockReturnValue(
        createMockState({
          project: { path: "/test/project" },
          error: "Error",
        }),
      );
      render(<SlideWorkspace />);
      expect(screen.getByTestId("terminal-launcher")).toBeDefined();
    });
  });

  describe("interactions", () => {
    it("calls openProject when open project button is clicked", async () => {
      const mockOpenProject = vi.fn();
      mockShowOpenDialog.mockResolvedValue({
        canceled: false,
        filePaths: ["/new/project"],
      });
      mockUseSlideProject.mockReturnValue(
        createMockState({ openProject: mockOpenProject }),
      );
      render(<SlideWorkspace />);

      await act(async () => {
        fireEvent.click(screen.getByText("プロジェクトを開く"));
      });

      expect(mockShowOpenDialog).toHaveBeenCalled();
      expect(mockOpenProject).toHaveBeenCalledWith("/new/project");
    });

    it("does not call openProject when dialog is canceled", async () => {
      const mockOpenProject = vi.fn();
      mockShowOpenDialog.mockResolvedValue({
        canceled: true,
        filePaths: [],
      });
      mockUseSlideProject.mockReturnValue(
        createMockState({ openProject: mockOpenProject }),
      );
      render(<SlideWorkspace />);

      await act(async () => {
        fireEvent.click(screen.getByText("プロジェクトを開く"));
      });

      expect(mockOpenProject).not.toHaveBeenCalled();
    });

    it("calls closeProject when close button is clicked", () => {
      const mockCloseProject = vi.fn();
      mockUseSlideProject.mockReturnValue(
        createMockState({
          project: { path: "/test/project" },
          closeProject: mockCloseProject,
        }),
      );
      render(<SlideWorkspace />);

      fireEvent.click(screen.getByText("プロジェクトを閉じる"));
      expect(mockCloseProject).toHaveBeenCalled();
    });

    it("calls cancelExecution when cancel button is clicked in running state", () => {
      const mockCancelExecution = vi.fn();
      mockUseSlideProject.mockReturnValue(
        createMockState({
          project: { path: "/test/project" },
          syncStatus: "syncing",
          isExecuting: true,
          currentPhase: "structure",
          executionProgress: 50,
          cancelExecution: mockCancelExecution,
        }),
      );
      render(<SlideWorkspace />);

      fireEvent.click(screen.getByText("キャンセル"));
      expect(mockCancelExecution).toHaveBeenCalled();
    });

    it("copies command via TerminalLauncher", () => {
      mockUseSlideProject.mockReturnValue(
        createMockState({
          project: { path: "/test/project" },
        }),
      );
      render(<SlideWorkspace />);

      fireEvent.click(screen.getByLabelText("コマンドをコピー"));
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "claude --resume",
      );
    });

    it("calls manualSync when retry CTA is clicked", () => {
      const mockManualSync = vi.fn();
      mockUseSlideProject.mockReturnValue(
        createMockState({
          project: { path: "/test/project" },
          error: "Error",
          manualSync: mockManualSync,
        }),
      );

      render(<SlideWorkspace />);

      fireEvent.click(screen.getByText("再試行"));
      expect(mockManualSync).toHaveBeenCalled();
    });

    it("navigates to settings from guidance CTA", () => {
      mockUseHandoffGuidance.mockReturnValue({
        terminalCommand: "claude --resume --continue",
        contextSummary: "continue the slide sync",
        reason: "Claude API キーの設定が必要です",
      });
      mockUseSlideProject.mockReturnValue(
        createMockState({
          project: { path: "/test/project" },
        }),
      );

      render(<SlideWorkspace />);

      fireEvent.click(screen.getByText("API キーを設定"));
      expect(mockSetCurrentView).toHaveBeenCalledWith("settings");
    });

    it("copies handoff command when guidance is active", () => {
      mockUseHandoffGuidance.mockReturnValue({
        terminalCommand: "claude --resume --continue",
        contextSummary: "continue the slide sync",
        reason: "Claude API キーの設定が必要です",
      });
      mockUseSlideProject.mockReturnValue(
        createMockState({
          project: { path: "/test/project" },
        }),
      );

      render(<SlideWorkspace />);

      fireEvent.click(screen.getByLabelText("コマンドをコピー"));
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "claude --resume --continue",
      );
    });
  });

  describe("SlideSyncCard relative time coverage", () => {
    it("shows degradedReason text when error exists", () => {
      mockUseSlideProject.mockReturnValue(
        createMockState({
          project: { path: "/test/project" },
          error: "API timeout",
        }),
      );
      render(<SlideWorkspace />);
      expect(screen.getAllByText("API timeout").length).toBeGreaterThanOrEqual(
        1,
      );
    });
  });
});
