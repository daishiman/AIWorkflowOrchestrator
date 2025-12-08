import React, { useEffect } from "react";
import { useAppStore, useCurrentView, useResponsiveMode } from "./store";
import { AppDock } from "./components/organisms/AppDock";
import { DynamicIsland } from "./components/molecules/DynamicIsland";
import { DashboardView } from "./views/DashboardView";
import { EditorView } from "./views/EditorView";
import { ChatView } from "./views/ChatView";
import { GraphView } from "./views/GraphView";
import { SettingsView } from "./views/SettingsView";
import { useThemeInitializer } from "./hooks/useThemeInitializer";
import type { ViewType } from "./components/organisms/AppDock";

function App(): JSX.Element {
  // Initialize theme on app startup (restores from electron-store)
  useThemeInitializer();

  // Initialize auth on app startup
  const initializeAuth = useAppStore((state) => state.initializeAuth);
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);
  const currentView = useCurrentView();
  const responsiveMode = useResponsiveMode();
  const setCurrentView = useAppStore((state) => state.setCurrentView);
  const dynamicIsland = useAppStore((state) => state.dynamicIsland);

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
    <div className="h-screen w-screen overflow-hidden bg-[#0a0a0a] text-white flex">
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
        <main className="flex-1 overflow-auto p-6">{renderView()}</main>
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
  );
}

export default App;
