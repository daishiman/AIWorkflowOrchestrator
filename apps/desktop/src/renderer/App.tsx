import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// i18n initialization (TASK-3-2-B: SkillStreamDisplay i18n対応)
import "./i18n/config";
import { useAppStore, useCurrentView, useResponsiveMode } from "./store";
import { AuthGuard } from "./components/AuthGuard";
import { ComingSoonView } from "./components/atoms";
import { AppDock } from "./components/organisms/AppDock";
import { AppLayout } from "./components/organisms/AppLayout";
import { NotificationCenter } from "./components/organisms/NotificationCenter";
import { DynamicIsland } from "./components/molecules/DynamicIsland";
import { DashboardView } from "./views/DashboardView";
import { EditorView } from "./views/EditorView";
import { ChatView } from "./views/ChatView";
import { GraphView } from "./views/GraphView";
import { SettingsView } from "./views/SettingsView";
import { AgentView } from "./views/AgentView";
import { SkillManagementPanel } from "./components/skill/SkillManagementPanel";
import { SkillChainBuilder } from "./views/SkillChainBuilder";
import { ScheduleManager } from "./views/ScheduleManager";
import { DebugPanel } from "./views/DebugPanel";
import { AnalyticsDashboard } from "./views/AnalyticsDashboard";
import { ChatHistoryView } from "./views/ChatHistoryView";
import { HistorySearchView } from "./views/HistorySearchView";
import { SkillCenterView } from "./views/SkillCenterView";
import { ConcurrencyGuardReviewHarness } from "./views/ConcurrencyGuardReviewHarness";
import { SkillEditorView } from "./views/SkillEditorView";
import { UIDesignFoundationPreview } from "./views/UIDesignFoundationPreview";
import { WorkspaceView } from "./views/WorkspaceView";
import { OrganismsShowcaseView } from "./views/OrganismsShowcaseView";
import { HistoryPage } from "./pages/HistoryPage";
import { AgentSDKPage } from "./pages/AgentSDKPage";
import { SkillAnalysisView, SkillCreateWizard } from "./components/skill";
import { useNavShortcuts } from "./hooks/useNavShortcuts";
import { useThemeInitializer } from "./hooks/useThemeInitializer";
import type { DockViewType } from "./navigation/navContract";
import type { ViewType } from "./store/types";
import { shouldResetUnauthenticatedView } from "./utils/shouldResetUnauthenticatedView";

// Note: ChatHistoryProviderの統合はRenderer側でNode.js依存を避けるため削除
// Chat History機能はIPC経由でMain Processと連携する形で後続タスクで実装予定
// See: UT-009 (Chat History Additional Use Cases)

function App(): JSX.Element {
  // Initialize theme on app startup (restores from electron-store)
  useThemeInitializer();

  // Initialize auth on app startup
  const initializeAuth = useAppStore((state) => state.initializeAuth);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const isLoading = useAppStore((state) => state.isLoading);

  useEffect(() => {
    console.log("🔍 [App] Initializing auth...");
    initializeAuth();
  }, [initializeAuth]);

  // Reset currentView to dashboard when not authenticated
  const currentView = useCurrentView();
  const responsiveMode = useResponsiveMode();
  const setCurrentView = useAppStore((state) => state.setCurrentView);
  const goBack = useAppStore((state) => state.goBack);
  const canGoBack = useAppStore((state) => state.viewHistory.length > 1);
  const currentSkillName = useAppStore((state) => state.currentSkillName);
  const setCurrentSkillName = useAppStore((state) => state.setCurrentSkillName);
  const dynamicIsland = useAppStore((state) => state.dynamicIsland);
  const setWindowSize = useAppStore((state) => state.setWindowSize);

  useEffect(() => {
    const syncWindowSize = (): void => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    syncWindowSize();
    window.addEventListener("resize", syncWindowSize);
    return () => window.removeEventListener("resize", syncWindowSize);
  }, [setWindowSize]);

  useEffect(() => {
    if (
      shouldResetUnauthenticatedView({
        isAuthenticated,
        isLoading,
        currentView,
      })
    ) {
      setCurrentView("dashboard");
    }
  }, [isAuthenticated, isLoading, currentView, setCurrentView]);

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  const handleGoBack = (): void => {
    if (canGoBack) {
      goBack();
    }
  };

  useNavShortcuts({
    onViewChange: (view) => handleViewChange(view as ViewType),
    onGoBack: handleGoBack,
    canGoBack,
  });

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardView />;
      case "workspace":
        return <WorkspaceView />;
      case "editor":
        return <EditorView />;
      case "chat":
        return <ChatView />;
      case "graph":
        return <GraphView />;
      case "agent":
        return <AgentView />;
      case "skillCenter":
      case "skill-center":
        return <SkillCenterView />;
      case "historySearch":
        return <HistorySearchView />;
      case "chainBuilder":
        return <SkillChainBuilder />;
      case "scheduleManager":
        return <ScheduleManager />;
      case "debugPanel":
        return <DebugPanel />;
      case "analyticsDashboard":
        return <AnalyticsDashboard />;
      case "skill-editor":
        return (
          <SkillEditorView
            skillName={currentSkillName ?? "demo-skill"}
            onClose={() => {
              setCurrentView("skillCenter");
              setCurrentSkillName(null);
            }}
          />
        );
      case "settings":
        return <SettingsView />;
      default: {
        return (
          <ComingSoonView
            title="未接続のビュー"
            description={`${currentView} はまだレイアウトへ接続されていません。`}
          />
        );
      }
    }
  };

  const renderStandaloneView = (view: JSX.Element) => (
    <div className="h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <main className="h-full overflow-auto p-6">{view}</main>
    </div>
  );

  const useGlobalNavStrip =
    import.meta.env.VITE_USE_GLOBAL_NAV_STRIP !== "false";
  const usesSidebar = responsiveMode !== "mobile";

  const renderCatchAllElement = () => {
    const viewContent = useGlobalNavStrip ? (
      <AppLayout
        currentView={currentView as DockViewType}
        onViewChange={(view) => handleViewChange(view as ViewType)}
        onGoBack={handleGoBack}
        canGoBack={canGoBack}
      >
        {renderView()}
      </AppLayout>
    ) : (
      <div className="h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] flex">
        {usesSidebar ? (
          <AppDock
            currentView={currentView}
            onViewChange={handleViewChange}
            mode="desktop"
          />
        ) : null}

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-start justify-between px-6 pt-4 pb-2">
            <div className="flex-1" />
            <div className="flex justify-center">
              <DynamicIsland
                status={dynamicIsland.status}
                message={dynamicIsland.message}
                visible={dynamicIsland.visible}
              />
            </div>
            <div className="flex flex-1 justify-end">
              <NotificationCenter />
            </div>
          </div>

          <main className="flex-1 overflow-auto p-6">{renderView()}</main>
        </div>

        {!usesSidebar ? (
          <div className="fixed bottom-0 left-0 right-0">
            <AppDock
              currentView={currentView}
              onViewChange={handleViewChange}
              mode="mobile"
            />
          </div>
        ) : null}
      </div>
    );

    // Settings画面はAuthGuardをバイパスして直接表示
    // 理由: 認証確認がハングした場合でもAPI Key等の設定変更を可能にするため
    if (currentView === "settings") {
      return viewContent;
    }

    return <AuthGuard>{viewContent}</AuthGuard>;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Agent SDK E2E Test Page */}
        <Route
          path="/agent"
          element={
            <AuthGuard>
              <div className="h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
                <AgentSDKPage />
              </div>
            </AuthGuard>
          }
        />
        {/* チャット履歴詳細ページ（URLルーティング） */}
        <Route
          path="/chat/history/:sessionId"
          element={
            <AuthGuard>
              <div className="h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
                <ChatHistoryView />
              </div>
            </AuthGuard>
          }
        />
        {/* チャット履歴一覧ページ（セッション未選択時） */}
        <Route
          path="/chat/history"
          element={
            <AuthGuard>
              <div className="h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center">
                <div className="text-center text-hig-text-secondary">
                  <p className="mb-2">セッションが選択されていません</p>
                  <button
                    type="button"
                    disabled
                    aria-label="エクスポート"
                    className="rounded-hig-sm bg-hig-bg-tertiary px-4 py-2 text-sm text-hig-text-tertiary cursor-not-allowed"
                  >
                    エクスポート
                  </button>
                </div>
              </div>
            </AuthGuard>
          }
        />
        {/* バージョン履歴ページ */}
        <Route
          path="/history/:fileId"
          element={
            <AuthGuard>
              <div className="h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
                <HistoryPage />
              </div>
            </AuthGuard>
          }
        />
        {/* Skill Advanced Views（直接ルーティング） */}
        <Route
          path="/advanced/chain-builder"
          element={
            <AuthGuard>{renderStandaloneView(<SkillChainBuilder />)}</AuthGuard>
          }
        />
        <Route
          path="/advanced/schedule-manager"
          element={
            <AuthGuard>{renderStandaloneView(<ScheduleManager />)}</AuthGuard>
          }
        />
        <Route
          path="/advanced/debug-panel"
          element={
            <AuthGuard>{renderStandaloneView(<DebugPanel />)}</AuthGuard>
          }
        />
        <Route
          path="/advanced/analytics-dashboard"
          element={
            <AuthGuard>
              {renderStandaloneView(<AnalyticsDashboard />)}
            </AuthGuard>
          }
        />
        <Route
          path="/advanced/skill-management-panel"
          element={
            <AuthGuard>
              {renderStandaloneView(<SkillManagementPanel />)}
            </AuthGuard>
          }
        />
        <Route
          path="/advanced/skill-analysis"
          element={
            <AuthGuard>
              {renderStandaloneView(
                <SkillAnalysisView
                  skillName="demo-skill"
                  onClose={() => window.history.back()}
                />,
              )}
            </AuthGuard>
          }
        />
        <Route
          path="/advanced/skill-center"
          element={
            <AuthGuard>{renderStandaloneView(<SkillCenterView />)}</AuthGuard>
          }
        />
        <Route
          path="/advanced/history-search"
          element={
            <AuthGuard>{renderStandaloneView(<HistorySearchView />)}</AuthGuard>
          }
        />
        <Route
          path="/advanced/concurrency-guard-review"
          element={
            <AuthGuard>
              {renderStandaloneView(<ConcurrencyGuardReviewHarness />)}
            </AuthGuard>
          }
        />
        <Route
          path="/advanced/skill-editor"
          element={
            <AuthGuard>
              {renderStandaloneView(
                <SkillEditorView
                  skillName="demo-skill"
                  onClose={() => window.history.back()}
                />,
              )}
            </AuthGuard>
          }
        />
        <Route
          path="/advanced/skill-editor-readonly"
          element={
            <AuthGuard>
              {renderStandaloneView(
                <SkillEditorView
                  skillName="demo-skill"
                  isReadOnly
                  onClose={() => window.history.back()}
                />,
              )}
            </AuthGuard>
          }
        />
        <Route
          path="/advanced/skill-create-wizard"
          element={
            <AuthGuard>
              {renderStandaloneView(
                <SkillCreateWizard onClose={() => window.history.back()} />,
              )}
            </AuthGuard>
          }
        />
        <Route
          path="/advanced/ui-design-foundation"
          element={
            <AuthGuard>
              {renderStandaloneView(<UIDesignFoundationPreview />)}
            </AuthGuard>
          }
        />
        <Route
          path="/advanced/organisms-showcase"
          element={
            <AuthGuard>
              {renderStandaloneView(<OrganismsShowcaseView />)}
            </AuthGuard>
          }
        />
        {/* 既存のビューベースUI（デフォルト） - settings のみ AuthGuard バイパス */}
        <Route path="*" element={renderCatchAllElement()} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
