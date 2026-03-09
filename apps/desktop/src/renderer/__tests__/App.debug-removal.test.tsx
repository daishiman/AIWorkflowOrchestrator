/**
 * @file App.tsx デバッグコード削除検証テスト
 * @description TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001
 *
 * App.tsx L45-61 のデバッグ用 useEffect 削除後の正常動作を検証する。
 * - TC-1: localStorage.clear() が呼ばれないこと (AC-2)
 * - TC-2: window.location.reload() が呼ばれないこと (AC-4)
 * - TC-3: sessionStorage の debug-clear-storage が参照されないこと (AC-1)
 * - TC-4: App が正常にレンダリングされること (AC-6)
 * - TC-5: auth 初期化が正常に実行されること (AC-6)
 *
 * @see .claude/rules/06-known-pitfalls.md#P39 (happy-dom: fireEvent使用)
 * @see .claude/rules/06-known-pitfalls.md#P9 (テスト間状態リセット)
 */

import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";

// Store モック
const mockInitializeAuth = vi.fn();
const mockSetCurrentView = vi.fn();
const mockGoBack = vi.fn();
const mockSetWindowSize = vi.fn();
const mockSetCurrentSkillName = vi.fn();

vi.mock("@/renderer/store", () => ({
  useAppStore: vi.fn(
    (selector: (state: Record<string, unknown>) => unknown) => {
      const mockState: Record<string, unknown> = {
        initializeAuth: mockInitializeAuth,
        isAuthenticated: false,
        isLoading: false,
        currentView: "dashboard",
        setCurrentView: mockSetCurrentView,
        goBack: mockGoBack,
        viewHistory: ["dashboard"],
        currentSkillName: null,
        setCurrentSkillName: mockSetCurrentSkillName,
        dynamicIsland: { status: "idle", message: "", visible: false },
        setWindowSize: mockSetWindowSize,
      };
      return selector(mockState);
    },
  ),
  useCurrentView: vi.fn(() => "dashboard"),
  useResponsiveMode: vi.fn(() => "desktop"),
}));

// Theme initializer モック
vi.mock("@/renderer/hooks/useThemeInitializer", () => ({
  useThemeInitializer: vi.fn(),
}));

// Navigation shortcuts モック
vi.mock("@/renderer/hooks/useNavShortcuts", () => ({
  useNavShortcuts: vi.fn(),
}));

// React Router モック
vi.mock("react-router-dom", () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "browser-router" }, children),
  Routes: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "routes" }, children),
  Route: ({ element }: { element: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "route" }, element),
}));

// AuthGuard モック
vi.mock("@/renderer/components/AuthGuard", () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "auth-guard" }, children),
}));

// View/Component モック（一括）
const mockComponent = (name: string) => () =>
  React.createElement("div", { "data-testid": name });

vi.mock("@/renderer/components/atoms", () => ({
  ComingSoonView: mockComponent("coming-soon"),
}));
vi.mock("@/renderer/components/organisms/AppDock", () => ({
  AppDock: mockComponent("app-dock"),
}));
vi.mock("@/renderer/components/organisms/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "app-layout" }, children),
}));
vi.mock("@/renderer/components/organisms/NotificationCenter", () => ({
  NotificationCenter: mockComponent("notification-center"),
}));
vi.mock("@/renderer/components/molecules/DynamicIsland", () => ({
  DynamicIsland: mockComponent("dynamic-island"),
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
  SkillCenterView: mockComponent("skill-center"),
}));
vi.mock("@/renderer/views/ConcurrencyGuardReviewHarness", () => ({
  ConcurrencyGuardReviewHarness: mockComponent("concurrency-guard"),
}));
vi.mock("@/renderer/views/SkillEditorView", () => ({
  SkillEditorView: mockComponent("skill-editor"),
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
vi.mock("@/renderer/components/skill", () => ({
  SkillAnalysisView: mockComponent("skill-analysis"),
  SkillCreateWizard: mockComponent("skill-create-wizard"),
}));

// i18n モック
vi.mock("@/renderer/i18n/config", () => ({}));

describe("App - デバッグコード削除検証 (TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001)", () => {
  let clearSpy: ReturnType<typeof vi.spyOn>;
  let getItemSpy: ReturnType<typeof vi.spyOn>;
  let setItemSpy: ReturnType<typeof vi.spyOn>;
  let reloadMock: ReturnType<typeof vi.fn>;
  let originalReload: () => void;

  beforeEach(() => {
    vi.clearAllMocks();

    // Storage spies (P9: テスト間で状態を共有しない)
    clearSpy = vi.spyOn(Storage.prototype, "clear");
    getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
    setItemSpy = vi.spyOn(Storage.prototype, "setItem");

    // window.location.reload モック
    originalReload = window.location.reload;
    reloadMock = vi.fn();
    Object.defineProperty(window.location, "reload", {
      value: reloadMock,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    clearSpy.mockRestore();
    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
    Object.defineProperty(window.location, "reload", {
      value: originalReload,
      writable: true,
      configurable: true,
    });
    cleanup();
  });

  it("TC-1: localStorage.clear() がアプリ起動時に呼ばれないこと (AC-2)", async () => {
    const App = (await import("@/renderer/App")).default;
    render(React.createElement(App));

    expect(clearSpy).not.toHaveBeenCalled();
  });

  it("TC-2: window.location.reload() が呼ばれないこと (AC-4)", async () => {
    const App = (await import("@/renderer/App")).default;
    render(React.createElement(App));

    expect(reloadMock).not.toHaveBeenCalled();
  });

  it("TC-3: sessionStorage の debug-clear-storage が参照されないこと (AC-1)", async () => {
    const App = (await import("@/renderer/App")).default;
    render(React.createElement(App));

    const debugCalls = getItemSpy.mock.calls.filter(
      (call) => call[0] === "debug-clear-storage",
    );
    expect(debugCalls).toHaveLength(0);
  });

  it("TC-4: App が正常にレンダリングされること (AC-6)", async () => {
    const App = (await import("@/renderer/App")).default;
    const { container } = render(React.createElement(App));

    expect(container).toBeTruthy();
    expect(container.innerHTML).not.toBe("");
  });

  it("TC-5: auth 初期化が正常に実行されること (AC-6)", async () => {
    const App = (await import("@/renderer/App")).default;
    render(React.createElement(App));

    expect(mockInitializeAuth).toHaveBeenCalled();
  });
});
