/**
 * @file App.tsx renderView() - skillAnalysis / skillCreate case 検証
 * @description TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001
 *
 * renderView() に追加した 2 case が正しいコンポーネントを返すことを検証する。
 * - TC-RV-01: skillAnalysis case が SkillAnalysisView を描画すること (AC-2)
 * - TC-RV-01b: skillAnalysis で currentSkillName が null のとき demo-skill をフォールバックとして渡すこと
 * - TC-RV-02: skillCreate case が SkillCreateWizard を描画すること (AC-3)
 * - TC-RV-03: 既存の case（dashboard / skillCenter 等）が引き続き正しく描画されること (AC-5)
 *
 * @see .claude/rules/06-known-pitfalls.md#P39 (happy-dom: fireEvent使用)
 * @see .claude/rules/06-known-pitfalls.md#P9 (テスト間状態リセット)
 */

import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";

// --- Store モック ---
const mockInitializeAuth = vi.fn();
const mockSetCurrentView = vi.fn();
const mockGoBack = vi.fn();
const mockSetWindowSize = vi.fn();
const mockSetCurrentSkillName = vi.fn();
let mockCurrentView = "dashboard";
let mockCurrentSkillName: string | null = null;

vi.mock("@/renderer/store", () => ({
  useAppStore: vi.fn(
    (selector: (state: Record<string, unknown>) => unknown) => {
      const mockState: Record<string, unknown> = {
        initializeAuth: mockInitializeAuth,
        isAuthenticated: false,
        isLoading: false,
        themeMode: "system",
        setThemeMode: vi.fn(),
        updateUserProfile: vi.fn(),
        userProfile: { name: "Test User" },
        setCurrentView: mockSetCurrentView,
        goBack: mockGoBack,
        viewHistory: ["dashboard"],
        currentSkillName: mockCurrentSkillName,
        setCurrentSkillName: mockSetCurrentSkillName,
        dynamicIsland: { status: "idle", message: "", visible: false },
        setWindowSize: mockSetWindowSize,
      };
      return selector(mockState);
    },
  ),
  useCurrentView: vi.fn(() => mockCurrentView),
  useResponsiveMode: vi.fn(() => "desktop"),
}));

vi.mock("@/renderer/hooks/useThemeInitializer", () => ({
  useThemeInitializer: vi.fn(),
}));

vi.mock("@/renderer/hooks/useNavShortcuts", () => ({
  useNavShortcuts: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "browser-router" }, children),
  Routes: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "routes" }, children),
  Route: ({ element, path }: { element: React.ReactNode; path?: string }) => {
    // path="*" のみレンダリングする（catch-all route）
    if (path === "*" || path === undefined) {
      return React.createElement(
        "div",
        { "data-testid": `route-${path ?? "unknown"}` },
        element,
      );
    }
    return null;
  },
}));

vi.mock("@/renderer/components/AuthGuard", () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "auth-guard" }, children),
}));

vi.mock("@/renderer/components/organisms/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "app-layout" }, children),
}));

vi.mock("@/renderer/components/organisms/NotificationCenter", () => ({
  NotificationCenter: () => React.createElement("div"),
}));

vi.mock("@/renderer/components/molecules/DynamicIsland", () => ({
  DynamicIsland: () => React.createElement("div"),
}));

vi.mock("@/renderer/components/organisms/OnboardingWizard", () => ({
  OnboardingWizard: () => null,
  ONBOARDING_STORE_KEYS: {
    hasCompleted: "hasCompleted",
    userName: "userName",
    selectedStarterTool: "selectedStarterTool",
    lastCompletedAt: "lastCompletedAt",
  },
  isOnboardingStarterToolId: vi.fn(() => false),
}));

// --- View / Component モック ---
const mockComponent = (name: string) => () =>
  React.createElement("div", { "data-testid": name });

vi.mock("@/renderer/components/atoms", () => ({
  ComingSoonView: ({ title }: { title?: string }) =>
    React.createElement("div", { "data-testid": "coming-soon" }, title),
}));
vi.mock("@/renderer/components/organisms/AppDock", () => ({
  AppDock: mockComponent("app-dock"),
}));
vi.mock("@/renderer/views/DashboardView", () => ({
  DashboardView: mockComponent("dashboard-view"),
}));
vi.mock("@/renderer/views/EditorView", () => ({
  EditorView: mockComponent("editor-view"),
}));
vi.mock("@/renderer/views/ChatView", () => ({
  ChatView: mockComponent("chat-view"),
}));
vi.mock("@/renderer/views/GraphView", () => ({
  GraphView: mockComponent("graph-view"),
}));
vi.mock("@/renderer/views/SettingsView", () => ({
  SettingsView: mockComponent("settings-view"),
}));
vi.mock("@/renderer/views/AgentView", () => ({
  AgentView: mockComponent("agent-view"),
}));
vi.mock("@/renderer/components/skill/SkillManagementPanel", () => ({
  SkillManagementPanel: mockComponent("skill-management"),
}));
vi.mock("@/renderer/views/SkillChainBuilder", () => ({
  SkillChainBuilder: mockComponent("skill-chain-builder"),
}));
vi.mock("@/renderer/views/ScheduleManager", () => ({
  ScheduleManager: mockComponent("schedule-manager"),
}));
vi.mock("@/renderer/views/DebugPanel", () => ({
  DebugPanel: mockComponent("debug-panel"),
}));
vi.mock("@/renderer/views/AnalyticsDashboard", () => ({
  AnalyticsDashboard: mockComponent("analytics-dashboard"),
}));
vi.mock("@/renderer/views/ChatHistoryView", () => ({
  ChatHistoryView: mockComponent("chat-history"),
}));
vi.mock("@/renderer/views/HistorySearchView", () => ({
  HistorySearchView: mockComponent("history-search"),
}));
vi.mock("@/renderer/views/SkillCenterView", () => ({
  SkillCenterView: mockComponent("skill-center-view"),
}));
vi.mock("@/renderer/views/ConcurrencyGuardReviewHarness", () => ({
  ConcurrencyGuardReviewHarness: mockComponent("concurrency-guard"),
}));
vi.mock("@/renderer/views/SkillEditorView", () => ({
  SkillEditorView: mockComponent("skill-editor-view"),
}));
vi.mock("@/renderer/views/UIDesignFoundationPreview", () => ({
  UIDesignFoundationPreview: mockComponent("ui-design-foundation"),
}));
vi.mock("@/renderer/views/WorkspaceView", () => ({
  WorkspaceView: mockComponent("workspace-view"),
}));
vi.mock("@/renderer/views/OrganismsShowcaseView", () => ({
  OrganismsShowcaseView: mockComponent("organisms-showcase"),
}));
vi.mock("@/renderer/pages/HistoryPage", () => ({
  HistoryPage: mockComponent("history-page"),
}));
vi.mock("@/renderer/pages/AgentSDKPage", () => ({
  AgentSDKPage: mockComponent("agent-sdk-page"),
}));

// --- SkillAnalysisView / SkillCreateWizard モック（検証対象） ---
vi.mock("@/renderer/components/skill", () => ({
  SkillAnalysisView: ({
    skillName,
    onClose,
    onNavigateBack,
    onNavigateToAgent,
  }: {
    skillName: string;
    onClose: () => void;
    onNavigateBack?: () => void;
    onNavigateToAgent?: () => void;
  }) =>
    React.createElement(
      "div",
      {
        "data-testid": "skill-analysis-view",
        "data-skill-name": skillName,
        "data-has-navigate-back":
          onNavigateBack !== undefined ? "true" : "false",
        "data-has-navigate-to-agent":
          onNavigateToAgent !== undefined ? "true" : "false",
      },
      React.createElement(
        "button",
        { "data-testid": "skill-analysis-close", onClick: onClose },
        "close",
      ),
      onNavigateBack
        ? React.createElement(
            "button",
            {
              "data-testid": "skill-analysis-navigate-back",
              onClick: onNavigateBack,
            },
            "back",
          )
        : null,
      onNavigateToAgent
        ? React.createElement(
            "button",
            {
              "data-testid": "skill-analysis-navigate-to-agent",
              onClick: onNavigateToAgent,
            },
            "to-agent",
          )
        : null,
    ),
  SkillCreateWizard: ({ onClose }: { onClose: () => void }) =>
    React.createElement(
      "div",
      { "data-testid": "skill-create-wizard" },
      React.createElement(
        "button",
        { "data-testid": "skill-create-close", onClick: onClose },
        "close",
      ),
    ),
}));

vi.mock("@/renderer/i18n/config", () => ({}));

// --- テスト本体 ---
describe("App renderView() - skillAnalysis / skillCreate case (TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentSkillName = null;
  });

  afterEach(() => {
    cleanup();
  });

  it("TC-RV-01: currentView が skillAnalysis のとき SkillAnalysisView が描画されること (AC-2)", async () => {
    mockCurrentView = "skillAnalysis";
    mockCurrentSkillName = "my-test-skill";

    const { useCurrentView, useAppStore } = await import("@/renderer/store");
    (useCurrentView as ReturnType<typeof vi.fn>).mockReturnValue(
      "skillAnalysis",
    );
    (useAppStore as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) => {
        return selector({
          initializeAuth: mockInitializeAuth,
          isAuthenticated: false,
          isLoading: false,
          themeMode: "system",
          setThemeMode: vi.fn(),
          updateUserProfile: vi.fn(),
          userProfile: { name: "Test User" },
          setCurrentView: mockSetCurrentView,
          goBack: mockGoBack,
          viewHistory: ["dashboard"],
          currentSkillName: "my-test-skill",
          setCurrentSkillName: mockSetCurrentSkillName,
          dynamicIsland: { status: "idle", message: "", visible: false },
          setWindowSize: mockSetWindowSize,
        });
      },
    );

    const App = (await import("@/renderer/App")).default;
    render(React.createElement(App));

    expect(screen.getByTestId("skill-analysis-view")).toBeTruthy();
    expect(
      screen.getByTestId("skill-analysis-view").getAttribute("data-skill-name"),
    ).toBe("my-test-skill");
  });

  it("TC-RV-01b: skillAnalysis で currentSkillName が null のとき demo-skill をフォールバックとして渡すこと", async () => {
    mockCurrentView = "skillAnalysis";

    const { useCurrentView, useAppStore } = await import("@/renderer/store");
    (useCurrentView as ReturnType<typeof vi.fn>).mockReturnValue(
      "skillAnalysis",
    );
    (useAppStore as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) => {
        return selector({
          initializeAuth: mockInitializeAuth,
          isAuthenticated: false,
          isLoading: false,
          themeMode: "system",
          setThemeMode: vi.fn(),
          updateUserProfile: vi.fn(),
          userProfile: { name: "Test User" },
          setCurrentView: mockSetCurrentView,
          goBack: mockGoBack,
          viewHistory: ["dashboard"],
          currentSkillName: null,
          setCurrentSkillName: mockSetCurrentSkillName,
          dynamicIsland: { status: "idle", message: "", visible: false },
          setWindowSize: mockSetWindowSize,
        });
      },
    );

    const App = (await import("@/renderer/App")).default;
    render(React.createElement(App));

    const analysisView = screen.getByTestId("skill-analysis-view");
    expect(analysisView.getAttribute("data-skill-name")).toBe("demo-skill");
  });

  it("TC-RV-02: currentView が skillCreate のとき SkillCreateWizard が描画されること (AC-3)", async () => {
    mockCurrentView = "skillCreate";

    const { useCurrentView, useAppStore } = await import("@/renderer/store");
    (useCurrentView as ReturnType<typeof vi.fn>).mockReturnValue("skillCreate");
    (useAppStore as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) => {
        return selector({
          initializeAuth: mockInitializeAuth,
          isAuthenticated: false,
          isLoading: false,
          themeMode: "system",
          setThemeMode: vi.fn(),
          updateUserProfile: vi.fn(),
          userProfile: { name: "Test User" },
          setCurrentView: mockSetCurrentView,
          goBack: mockGoBack,
          viewHistory: ["dashboard"],
          currentSkillName: null,
          setCurrentSkillName: mockSetCurrentSkillName,
          dynamicIsland: { status: "idle", message: "", visible: false },
          setWindowSize: mockSetWindowSize,
        });
      },
    );

    const App = (await import("@/renderer/App")).default;
    render(React.createElement(App));

    expect(screen.getByTestId("skill-create-wizard")).toBeTruthy();
  });

  it("TC-RV-03: currentView が dashboard のとき DashboardView が引き続き描画されること (AC-5)", async () => {
    mockCurrentView = "dashboard";

    const { useCurrentView, useAppStore } = await import("@/renderer/store");
    (useCurrentView as ReturnType<typeof vi.fn>).mockReturnValue("dashboard");
    (useAppStore as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) => {
        return selector({
          initializeAuth: mockInitializeAuth,
          isAuthenticated: false,
          isLoading: false,
          themeMode: "system",
          setThemeMode: vi.fn(),
          updateUserProfile: vi.fn(),
          userProfile: { name: "Test User" },
          setCurrentView: mockSetCurrentView,
          goBack: mockGoBack,
          viewHistory: ["dashboard"],
          currentSkillName: null,
          setCurrentSkillName: mockSetCurrentSkillName,
          dynamicIsland: { status: "idle", message: "", visible: false },
          setWindowSize: mockSetWindowSize,
        });
      },
    );

    const App = (await import("@/renderer/App")).default;
    render(React.createElement(App));

    expect(screen.getByTestId("dashboard-view")).toBeTruthy();
  });

  it("TC-RV-04: skillAnalysis の onClose で skillCenter に遷移すること", async () => {
    mockCurrentView = "skillAnalysis";
    mockCurrentSkillName = "test-skill";

    const { useCurrentView, useAppStore } = await import("@/renderer/store");
    (useCurrentView as ReturnType<typeof vi.fn>).mockReturnValue(
      "skillAnalysis",
    );
    (useAppStore as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) => {
        return selector({
          initializeAuth: mockInitializeAuth,
          isAuthenticated: false,
          isLoading: false,
          themeMode: "system",
          setThemeMode: vi.fn(),
          updateUserProfile: vi.fn(),
          userProfile: { name: "Test User" },
          setCurrentView: mockSetCurrentView,
          goBack: mockGoBack,
          viewHistory: ["dashboard"],
          currentSkillName: "test-skill",
          setCurrentSkillName: mockSetCurrentSkillName,
          dynamicIsland: { status: "idle", message: "", visible: false },
          setWindowSize: mockSetWindowSize,
        });
      },
    );

    const App = (await import("@/renderer/App")).default;
    render(React.createElement(App));

    // P39: happy-dom環境では fireEvent を使用
    fireEvent.click(screen.getByTestId("skill-analysis-close"));
    expect(mockSetCurrentView).toHaveBeenCalledWith("skillCenter");
  });

  it("TC-RV-05: skillAnalysis の onClose で currentSkillName が null にリセットされること", async () => {
    mockCurrentView = "skillAnalysis";
    mockCurrentSkillName = "some-skill";

    const { useCurrentView, useAppStore } = await import("@/renderer/store");
    (useCurrentView as ReturnType<typeof vi.fn>).mockReturnValue(
      "skillAnalysis",
    );
    (useAppStore as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) => {
        return selector({
          initializeAuth: mockInitializeAuth,
          isAuthenticated: false,
          isLoading: false,
          themeMode: "system",
          setThemeMode: vi.fn(),
          updateUserProfile: vi.fn(),
          userProfile: { name: "Test User" },
          setCurrentView: mockSetCurrentView,
          goBack: mockGoBack,
          viewHistory: ["dashboard"],
          currentSkillName: "some-skill",
          setCurrentSkillName: mockSetCurrentSkillName,
          dynamicIsland: { status: "idle", message: "", visible: false },
          setWindowSize: mockSetWindowSize,
        });
      },
    );

    const App = (await import("@/renderer/App")).default;
    render(React.createElement(App));

    fireEvent.click(screen.getByTestId("skill-analysis-close"));
    expect(mockSetCurrentSkillName).toHaveBeenCalledWith(null);
  });

  it("TC-RV-06: skillCreate の onClose で skillCenter に遷移すること", async () => {
    mockCurrentView = "skillCreate";

    const { useCurrentView, useAppStore } = await import("@/renderer/store");
    (useCurrentView as ReturnType<typeof vi.fn>).mockReturnValue("skillCreate");
    (useAppStore as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) => {
        return selector({
          initializeAuth: mockInitializeAuth,
          isAuthenticated: false,
          isLoading: false,
          themeMode: "system",
          setThemeMode: vi.fn(),
          updateUserProfile: vi.fn(),
          userProfile: { name: "Test User" },
          setCurrentView: mockSetCurrentView,
          goBack: mockGoBack,
          viewHistory: ["dashboard"],
          currentSkillName: null,
          setCurrentSkillName: mockSetCurrentSkillName,
          dynamicIsland: { status: "idle", message: "", visible: false },
          setWindowSize: mockSetWindowSize,
        });
      },
    );

    const App = (await import("@/renderer/App")).default;
    render(React.createElement(App));

    fireEvent.click(screen.getByTestId("skill-create-close"));
    expect(mockSetCurrentView).toHaveBeenCalledWith("skillCenter");
  });

  it("TC-RV-07: skill-center が normalizeSkillLifecycleView 経由で skillCenter に正規化されること", async () => {
    mockCurrentView = "skillCenter";

    const { useCurrentView, useAppStore } = await import("@/renderer/store");
    // rawCurrentView として "skill-center" を返す → normalizeSkillLifecycleView で "skillCenter" に変換
    (useCurrentView as ReturnType<typeof vi.fn>).mockReturnValue(
      "skill-center",
    );
    (useAppStore as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) => {
        return selector({
          initializeAuth: mockInitializeAuth,
          isAuthenticated: false,
          isLoading: false,
          themeMode: "system",
          setThemeMode: vi.fn(),
          updateUserProfile: vi.fn(),
          userProfile: { name: "Test User" },
          setCurrentView: mockSetCurrentView,
          goBack: mockGoBack,
          viewHistory: ["dashboard"],
          currentSkillName: null,
          setCurrentSkillName: mockSetCurrentSkillName,
          dynamicIsland: { status: "idle", message: "", visible: false },
          setWindowSize: mockSetWindowSize,
        });
      },
    );

    const App = (await import("@/renderer/App")).default;
    render(React.createElement(App));

    // normalizeSkillLifecycleView("skill-center") → "skillCenter" → SkillCenterView が描画される
    expect(screen.getByTestId("skill-center-view")).toBeTruthy();
  });

  it("TC-RV-08: 未知のViewTypeが default case (ComingSoonView) を表示すること", async () => {
    mockCurrentView = "unknownView";

    const { useCurrentView, useAppStore } = await import("@/renderer/store");
    (useCurrentView as ReturnType<typeof vi.fn>).mockReturnValue("unknownView");
    (useAppStore as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) => {
        return selector({
          initializeAuth: mockInitializeAuth,
          isAuthenticated: false,
          isLoading: false,
          themeMode: "system",
          setThemeMode: vi.fn(),
          updateUserProfile: vi.fn(),
          userProfile: { name: "Test User" },
          setCurrentView: mockSetCurrentView,
          goBack: mockGoBack,
          viewHistory: ["dashboard"],
          currentSkillName: null,
          setCurrentSkillName: mockSetCurrentSkillName,
          dynamicIsland: { status: "idle", message: "", visible: false },
          setWindowSize: mockSetWindowSize,
        });
      },
    );

    const App = (await import("@/renderer/App")).default;
    render(React.createElement(App));

    const comingSoon = screen.getByTestId("coming-soon");
    expect(comingSoon).toBeTruthy();
    expect(comingSoon.textContent).toContain("未接続のビュー");
  });
});

// ---------------------------------------------------------------------------
// skillAnalysis case: onNavigateBack / onNavigateToAgent props 注入テスト
// (Task 5-3: App.tsx skillAnalysis case の更新)
// ---------------------------------------------------------------------------

/**
 * 各テストで useAppStore モックを設定するヘルパー
 */
async function setupSkillAnalysisMock(opts: {
  viewHistory: string[];
  currentSkillName?: string | null;
}) {
  const { useCurrentView, useAppStore } = await import("@/renderer/store");
  (useCurrentView as ReturnType<typeof vi.fn>).mockReturnValue("skillAnalysis");
  (useAppStore as ReturnType<typeof vi.fn>).mockImplementation(
    (selector: (state: Record<string, unknown>) => unknown) => {
      return selector({
        initializeAuth: mockInitializeAuth,
        isAuthenticated: false,
        isLoading: false,
        themeMode: "system",
        setThemeMode: vi.fn(),
        updateUserProfile: vi.fn(),
        userProfile: { name: "Test User" },
        setCurrentView: mockSetCurrentView,
        goBack: mockGoBack,
        viewHistory: opts.viewHistory,
        currentSkillName: opts.currentSkillName ?? null,
        setCurrentSkillName: mockSetCurrentSkillName,
        dynamicIsland: { status: "idle", message: "", visible: false },
        setWindowSize: mockSetWindowSize,
      });
    },
  );
}

describe("App renderView() - skillAnalysis: onNavigateBack / onNavigateToAgent 注入 (Task 5-3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentSkillName = null;
    mockCurrentView = "skillAnalysis";
  });

  afterEach(() => {
    cleanup();
  });

  it("TC-SA-01: viewHistory の末尾から2番目が 'agent' のとき onNavigateBack / onNavigateToAgent が注入されること", async () => {
    await setupSkillAnalysisMock({
      viewHistory: ["dashboard", "agent", "skillAnalysis"],
      currentSkillName: "my-skill",
    });

    const App = (await import("@/renderer/App")).default;
    render(React.createElement(App));

    const view = screen.getByTestId("skill-analysis-view");
    expect(view.getAttribute("data-has-navigate-back")).toBe("true");
    expect(view.getAttribute("data-has-navigate-to-agent")).toBe("true");
  });

  it("TC-SA-02: viewHistory の末尾から2番目が 'skillCenter' のとき onNavigateBack / onNavigateToAgent が undefined であること", async () => {
    await setupSkillAnalysisMock({
      viewHistory: ["dashboard", "skillCenter", "skillAnalysis"],
      currentSkillName: "my-skill",
    });

    const App = (await import("@/renderer/App")).default;
    render(React.createElement(App));

    const view = screen.getByTestId("skill-analysis-view");
    expect(view.getAttribute("data-has-navigate-back")).toBe("false");
    expect(view.getAttribute("data-has-navigate-to-agent")).toBe("false");
  });

  it("TC-SA-03: viewHistory が1要素のみのとき onNavigateBack / onNavigateToAgent が undefined であること", async () => {
    await setupSkillAnalysisMock({
      viewHistory: ["skillAnalysis"],
      currentSkillName: "my-skill",
    });

    const App = (await import("@/renderer/App")).default;
    render(React.createElement(App));

    const view = screen.getByTestId("skill-analysis-view");
    expect(view.getAttribute("data-has-navigate-back")).toBe("false");
    expect(view.getAttribute("data-has-navigate-to-agent")).toBe("false");
  });

  it("TC-SA-04 (回帰): onClose が setCurrentView('skillCenter') と setCurrentSkillName(null) を呼ぶこと", async () => {
    await setupSkillAnalysisMock({
      viewHistory: ["dashboard", "skillCenter", "skillAnalysis"],
      currentSkillName: "test-skill",
    });

    const App = (await import("@/renderer/App")).default;
    render(React.createElement(App));

    // P39: happy-dom環境では fireEvent を使用
    fireEvent.click(screen.getByTestId("skill-analysis-close"));
    expect(mockSetCurrentView).toHaveBeenCalledWith("skillCenter");
    expect(mockSetCurrentSkillName).toHaveBeenCalledWith(null);
  });

  it("TC-SA-05 (回帰): currentSkillName が null のとき 'demo-skill' がフォールバックされること", async () => {
    await setupSkillAnalysisMock({
      viewHistory: ["dashboard", "skillCenter", "skillAnalysis"],
      currentSkillName: null,
    });

    const App = (await import("@/renderer/App")).default;
    render(React.createElement(App));

    const view = screen.getByTestId("skill-analysis-view");
    expect(view.getAttribute("data-skill-name")).toBe("demo-skill");
  });

  it("TC-SA-06: 'agent' 前遷移時に onNavigateBack を呼ぶと goBack が実行されること", async () => {
    await setupSkillAnalysisMock({
      viewHistory: ["dashboard", "agent", "skillAnalysis"],
      currentSkillName: "my-skill",
    });

    const App = (await import("@/renderer/App")).default;
    render(React.createElement(App));

    fireEvent.click(screen.getByTestId("skill-analysis-navigate-back"));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it("TC-SA-07: 'agent' 前遷移時に onNavigateToAgent を呼ぶと setCurrentView('agent') が実行されること", async () => {
    await setupSkillAnalysisMock({
      viewHistory: ["dashboard", "agent", "skillAnalysis"],
      currentSkillName: "my-skill",
    });

    const App = (await import("@/renderer/App")).default;
    render(React.createElement(App));

    fireEvent.click(screen.getByTestId("skill-analysis-navigate-to-agent"));
    expect(mockSetCurrentView).toHaveBeenCalledWith("agent");
  });
});
