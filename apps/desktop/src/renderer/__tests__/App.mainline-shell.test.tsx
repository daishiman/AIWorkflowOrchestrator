import React from "react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useAppStore } from "../store";
import App from "../App";
import { buildMainlineExecutionAccessState } from "../features/mainline-access/mainlineAccess";

const mockInitializeAuth = vi.fn();
const mockSetThemeMode = vi.fn().mockResolvedValue(undefined);
const mockUpdateUserProfile = vi.fn();

vi.mock("../components/AuthGuard", () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("../components/atoms", () => ({
  ComingSoonView: () => <div data-testid="coming-soon-view" />,
}));

vi.mock("../components/organisms/AppDock", () => ({
  AppDock: ({ currentView, mode }: { currentView?: string; mode?: string }) => (
    <div
      data-testid="app-dock"
      data-current-view={currentView ?? ""}
      data-mode={mode ?? ""}
    />
  ),
}));

vi.mock("../components/organisms/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  ),
}));

vi.mock("../components/organisms/AppLayout/TerminalLauncher", () => ({
  TerminalLauncher: () => <div data-testid="app-layout-terminal-launcher" />,
}));

vi.mock("../components/organisms/NotificationCenter", () => ({
  NotificationCenter: () => <div data-testid="notification-center" />,
}));

vi.mock("../components/molecules/DynamicIsland", () => ({
  DynamicIsland: () => <div data-testid="dynamic-island" />,
}));

vi.mock("../views/DashboardView", () => ({
  DashboardView: () => <div data-testid="dashboard-view-stub">dashboard</div>,
}));

vi.mock("../views/EditorView", () => ({
  EditorView: () => <div data-testid="editor-view-stub" />,
}));

vi.mock("../views/ChatView", () => ({
  ChatView: () => <div data-testid="chat-view-stub" />,
}));

vi.mock("../views/GraphView", () => ({
  GraphView: () => <div data-testid="graph-view-stub" />,
}));

vi.mock("../views/SettingsView", () => ({
  SettingsView: () => <div data-testid="settings-view-stub" />,
}));

vi.mock("../views/AgentView", () => ({
  AgentView: () => <div data-testid="agent-view-stub" />,
}));

vi.mock("../components/skill/SkillManagementPanel", () => ({
  SkillManagementPanel: () => <div data-testid="skill-management-panel-stub" />,
}));

vi.mock("../views/SkillChainBuilder", () => ({
  SkillChainBuilder: () => <div data-testid="skill-chain-builder-stub" />,
}));

vi.mock("../views/ScheduleManager", () => ({
  ScheduleManager: () => <div data-testid="schedule-manager-stub" />,
}));

vi.mock("../views/DebugPanel", () => ({
  DebugPanel: () => <div data-testid="debug-panel-stub" />,
}));

vi.mock("../views/AnalyticsDashboard", () => ({
  AnalyticsDashboard: () => <div data-testid="analytics-dashboard-stub" />,
}));

vi.mock("../views/ChatHistoryView", () => ({
  ChatHistoryView: () => <div data-testid="chat-history-view-stub" />,
}));

vi.mock("../views/HistorySearchView", () => ({
  HistorySearchView: () => <div data-testid="history-search-view-stub" />,
}));

vi.mock("../views/SkillCenterView", () => ({
  SkillCenterView: () => <div data-testid="skill-center-view-stub" />,
}));

vi.mock("../views/ConcurrencyGuardReviewHarness", () => ({
  ConcurrencyGuardReviewHarness: () => (
    <div data-testid="concurrency-guard-review-stub" />
  ),
}));

vi.mock("../views/SkillEditorView", () => ({
  SkillEditorView: () => <div data-testid="skill-editor-view-stub" />,
}));

vi.mock("../views/UIDesignFoundationPreview", () => ({
  UIDesignFoundationPreview: () => (
    <div data-testid="ui-design-foundation-preview-stub" />
  ),
}));

vi.mock("../views/WorkspaceView", () => ({
  WorkspaceView: () => <div data-testid="workspace-view-stub" />,
}));

vi.mock("../views/OrganismsShowcaseView", () => ({
  OrganismsShowcaseView: () => <div data-testid="organisms-showcase-stub" />,
}));

vi.mock("../pages/HistoryPage", () => ({
  HistoryPage: () => <div data-testid="history-page-stub" />,
}));

vi.mock("../pages/AgentSDKPage", () => ({
  AgentSDKPage: () => <div data-testid="agent-sdk-page-stub" />,
}));

vi.mock("../components/skill", () => ({
  SkillAnalysisView: () => <div data-testid="skill-analysis-view-stub" />,
  SkillCreateWizard: () => <div data-testid="skill-create-wizard-stub" />,
}));

vi.mock("../hooks/useNavShortcuts", () => ({
  useNavShortcuts: () => undefined,
}));

vi.mock("../hooks/useThemeInitializer", () => ({
  useThemeInitializer: () => undefined,
}));

vi.mock("../hooks/useMainlineExecutionAccess", () => ({
  useMainlineExecutionAccess: () => ({
    access: buildMainlineExecutionAccessState({
      apiKeyValid: false,
      subscriptionValid: true,
      isAuthenticated: true,
    }),
    refreshHealth: vi.fn(),
  }),
}));

vi.mock("../navigation/skillLifecycleJourney", () => ({
  normalizeSkillLifecycleView: (view: string) => view,
}));

vi.mock("../utils/shouldResetUnauthenticatedView", () => ({
  shouldResetUnauthenticatedView: () => false,
}));

describe("App mainline shell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("VITE_USE_GLOBAL_NAV_STRIP", "false");
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
            get: ReturnType<typeof vi.fn>;
            set: ReturnType<typeof vi.fn>;
          };
        };
      }
    ).electronAPI = {
      store: {
        get: vi.fn().mockResolvedValue({ success: true, data: true }),
        set: vi.fn().mockResolvedValue({ success: true }),
      },
    };
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("legacy shell 分岐でも persistent launcher を表示する", async () => {
    render(<App />);

    expect(
      await screen.findByTestId("app-layout-terminal-launcher"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("notification-center")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-view-stub")).toBeInTheDocument();
  });

  it("advanced/skill-center で currentView=skillManagement のとき SkillManagementPanel を描画する", async () => {
    useAppStore.setState({
      currentView: "skillManagement",
      viewHistory: ["skillCenter", "skillManagement"],
    });
    window.history.pushState({}, "", "/advanced/skill-center");

    render(<App />);

    expect(
      await screen.findByTestId("skill-management-panel-stub"),
    ).toBeInTheDocument();
  });

  it("mobile legacy shell では dock currentView が skillCenter に正規化される", async () => {
    Object.defineProperty(window, "innerWidth", {
      value: 360,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, "innerHeight", {
      value: 800,
      writable: true,
      configurable: true,
    });
    useAppStore.setState({
      currentView: "skillManagement",
      viewHistory: ["skillCenter", "skillManagement"],
      responsiveMode: "mobile",
      windowSize: { width: 360, height: 800 },
    });

    render(<App />);

    const appDocks = await screen.findAllByTestId("app-dock");
    const mobileDock = appDocks.find(
      (dock) => dock.getAttribute("data-mode") === "mobile",
    );
    expect(mobileDock?.getAttribute("data-current-view")).toBe("skillCenter");
  });
});
