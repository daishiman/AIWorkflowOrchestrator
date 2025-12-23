import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAppStore, useCurrentView, useResponsiveMode } from "./store";
import { AuthGuard } from "./components/AuthGuard";
import { AppDock } from "./components/organisms/AppDock";
import { DynamicIsland } from "./components/molecules/DynamicIsland";
import { DashboardView } from "./views/DashboardView";
import { EditorView } from "./views/EditorView";
import { ChatView } from "./views/ChatView";
import { GraphView } from "./views/GraphView";
import { SettingsView } from "./views/SettingsView";
import { ChatHistoryView } from "./views/ChatHistoryView";
import { useThemeInitializer } from "./hooks/useThemeInitializer";
import type { ViewType } from "./components/organisms/AppDock";

function App(): JSX.Element {
  // 🔧 デバッグ用: 初回起動時にストレージをクリア（TODO: テスト完了後に削除）
  useEffect(() => {
    const shouldClear = sessionStorage.getItem("debug-clear-storage");
    if (!shouldClear) {
      console.log("🔧 [DEBUG] Clearing all storage for clean auth test...");
      localStorage.clear();
      sessionStorage.setItem("debug-clear-storage", "done");
      window.location.reload();
    }
  }, []);

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
  const dynamicIsland = useAppStore((state) => state.dynamicIsland);

  useEffect(() => {
    // 未認証かつ初期化完了の場合、currentViewをdashboardにリセット
    if (!isAuthenticated && !isLoading && currentView !== "dashboard") {
      setCurrentView("dashboard");
    }
  }, [isAuthenticated, isLoading, currentView, setCurrentView]);

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardView />;
      case "editor":
        return <EditorView />;
      case "chat":
        return <ChatView />;
      case "graph":
        return <GraphView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  const isDesktop = responsiveMode === "desktop";

  return (
    <BrowserRouter>
      <AuthGuard>
        <Routes>
          {/* チャット履歴詳細ページ（URLルーティング） */}
          <Route
            path="/chat/history/:sessionId"
            element={
              <div className="h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
                <ChatHistoryView />
              </div>
            }
          />
          {/* チャット履歴一覧ページ（セッション未選択時） */}
          <Route
            path="/chat/history"
            element={
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
            }
          />
          {/* 既存のビューベースUI（デフォルト） */}
          <Route
            path="*"
            element={
              <div className="h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] flex">
                {/* App Dock - Left side on desktop, bottom on mobile */}
                {isDesktop ? (
                  <AppDock
                    currentView={currentView}
                    onViewChange={handleViewChange}
                    mode="desktop"
                  />
                ) : null}

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Dynamic Island */}
                  <div className="flex justify-center pt-4 pb-2">
                    <DynamicIsland
                      status={dynamicIsland.status}
                      message={dynamicIsland.message}
                      visible={dynamicIsland.visible}
                    />
                  </div>

                  {/* View Content */}
                  <main className="flex-1 overflow-auto p-6">
                    {renderView()}
                  </main>
                </div>

                {/* Mobile Bottom Navigation */}
                {!isDesktop ? (
                  <div className="fixed bottom-0 left-0 right-0">
                    <AppDock
                      currentView={currentView}
                      onViewChange={handleViewChange}
                      mode="mobile"
                    />
                  </div>
                ) : null}
              </div>
            }
          />
        </Routes>
      </AuthGuard>
    </BrowserRouter>
  );
}

export default App;
