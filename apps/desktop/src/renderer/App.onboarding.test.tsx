import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { useAppStore } from "./store";
import App from "./App";

vi.mock("./components/AuthGuard", () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("./components/atoms", () => ({
  ComingSoonView: () => <div data-testid="coming-soon-view" />,
}));

vi.mock("./components/organisms/AppDock", () => ({
  AppDock: () => <div data-testid="app-dock" />,
}));

vi.mock("./components/organisms/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  ),
}));

vi.mock("./components/organisms/NotificationCenter", () => ({
  NotificationCenter: () => <div data-testid="notification-center" />,
}));

vi.mock("./components/molecules/DynamicIsland", () => ({
  DynamicIsland: () => <div data-testid="dynamic-island" />,
}));

vi.mock("./views/DashboardView", () => ({
  DashboardView: () => <div data-testid="dashboard-view-stub">dashboard</div>,
}));

vi.mock("./views/EditorView", () => ({
  EditorView: () => <div data-testid="editor-view-stub" />,
}));

vi.mock("./views/ChatView", () => ({
  ChatView: () => <div data-testid="chat-view-stub" />,
}));

vi.mock("./views/GraphView", () => ({
  GraphView: () => <div data-testid="graph-view-stub" />,
}));

vi.mock("./views/SettingsView", () => ({
  SettingsView: () => <div data-testid="settings-view-stub" />,
}));

vi.mock("./views/AgentView", () => ({
  AgentView: () => <div data-testid="agent-view-stub" />,
}));

vi.mock("./components/skill/SkillManagementPanel", () => ({
  SkillManagementPanel: () => <div data-testid="skill-management-panel-stub" />,
}));

vi.mock("./views/SkillChainBuilder", () => ({
  SkillChainBuilder: () => <div data-testid="skill-chain-builder-stub" />,
}));

vi.mock("./views/ScheduleManager", () => ({
  ScheduleManager: () => <div data-testid="schedule-manager-stub" />,
}));

vi.mock("./views/DebugPanel", () => ({
  DebugPanel: () => <div data-testid="debug-panel-stub" />,
}));

vi.mock("./views/AnalyticsDashboard", () => ({
  AnalyticsDashboard: () => <div data-testid="analytics-dashboard-stub" />,
}));

vi.mock("./views/ChatHistoryView", () => ({
  ChatHistoryView: () => <div data-testid="chat-history-view-stub" />,
}));

vi.mock("./views/HistorySearchView", () => ({
  HistorySearchView: () => <div data-testid="history-search-view-stub" />,
}));

vi.mock("./views/SkillCenterView", () => ({
  SkillCenterView: () => <div data-testid="skill-center-view-stub" />,
}));

vi.mock("./views/ConcurrencyGuardReviewHarness", () => ({
  ConcurrencyGuardReviewHarness: () => (
    <div data-testid="concurrency-guard-review-stub" />
  ),
}));

vi.mock("./views/SkillEditorView", () => ({
  SkillEditorView: () => <div data-testid="skill-editor-view-stub" />,
}));

vi.mock("./views/UIDesignFoundationPreview", () => ({
  UIDesignFoundationPreview: () => (
    <div data-testid="ui-design-foundation-preview-stub" />
  ),
}));

vi.mock("./views/WorkspaceView", () => ({
  WorkspaceView: () => <div data-testid="workspace-view-stub" />,
}));

vi.mock("./views/OrganismsShowcaseView", () => ({
  OrganismsShowcaseView: () => <div data-testid="organisms-showcase-stub" />,
}));

vi.mock("./pages/HistoryPage", () => ({
  HistoryPage: () => <div data-testid="history-page-stub" />,
}));

vi.mock("./pages/AgentSDKPage", () => ({
  AgentSDKPage: () => <div data-testid="agent-sdk-page-stub" />,
}));

vi.mock("./components/skill", () => ({
  SkillAnalysisView: () => <div data-testid="skill-analysis-view-stub" />,
  SkillCreateWizard: () => <div data-testid="skill-create-wizard-stub" />,
}));

vi.mock("./hooks/useNavShortcuts", () => ({
  useNavShortcuts: () => undefined,
}));

vi.mock("./hooks/useThemeInitializer", () => ({
  useThemeInitializer: () => undefined,
}));

vi.mock("./navigation/skillLifecycleJourney", () => ({
  normalizeSkillLifecycleView: (view: string) => view,
}));

vi.mock("./utils/shouldResetUnauthenticatedView", () => ({
  shouldResetUnauthenticatedView: () => false,
}));

describe("App onboarding integration", () => {
  const mockInitializeAuth = vi.fn();
  const mockSetThemeMode = vi.fn().mockResolvedValue(undefined);
  const mockUpdateUserProfile = vi.fn();
  const mockStoreGet = vi.fn();

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    window.history.pushState({}, "", "/");

    useAppStore.setState({
      currentView: "dashboard",
      viewHistory: ["dashboard"],
      isAuthenticated: true,
      isLoading: false,
      initializeAuth: mockInitializeAuth,
      themeMode: "kanagawa-dragon",
      setThemeMode: mockSetThemeMode,
      updateUserProfile: mockUpdateUserProfile,
      dynamicIsland: {
        visible: false,
        status: "completed",
        message: "",
      },
      currentSkillName: null,
    });

    (
      window as typeof window & {
        electronAPI?: {
          store: {
            get: typeof mockStoreGet;
            set: ReturnType<typeof vi.fn>;
          };
        };
      }
    ).electronAPI = {
      store: {
        get: mockStoreGet,
        set: vi.fn().mockResolvedValue({ success: true }),
      },
    };
  });

  it("未完了時は catch-all shell 上に onboarding overlay を表示する", async () => {
    mockStoreGet.mockImplementation(async ({ key, defaultValue }) => {
      if (key === "onboarding.hasCompleted") {
        return { success: true, data: false };
      }
      return { success: true, data: defaultValue };
    });

    render(<App />);

    expect(await screen.findByTestId("onboarding-wizard")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-view-stub")).toBeInTheDocument();
  });

  it("完了済みなら onboarding overlay を自動表示しない", async () => {
    mockStoreGet.mockImplementation(async ({ key, defaultValue }) => {
      if (key === "onboarding.hasCompleted") {
        return { success: true, data: true };
      }
      return { success: true, data: defaultValue };
    });

    render(<App />);

    await waitFor(() => {
      expect(mockStoreGet).toHaveBeenCalledWith({
        key: "onboarding.hasCompleted",
        defaultValue: false,
      });
    });

    expect(screen.queryByTestId("onboarding-wizard")).not.toBeInTheDocument();
  });
});
