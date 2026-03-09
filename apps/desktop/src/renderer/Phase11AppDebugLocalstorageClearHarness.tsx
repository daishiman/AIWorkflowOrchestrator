import React from "react";
import { AppDock } from "./components/organisms/AppDock";
import { SettingsView } from "./views/SettingsView";
import { useAppStore } from "./store";

export function Phase11AppDebugLocalstorageClearHarness(): JSX.Element {
  const currentView = useAppStore((state) => state.currentView);
  const setCurrentView = useAppStore((state) => state.setCurrentView);

  return (
    <div
      className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]"
      data-testid="phase11-app-debug-localstorage-clear-harness"
    >
      <div className="mx-auto flex min-h-screen max-w-[1600px] overflow-hidden">
        <aside className="shrink-0">
          <AppDock
            currentView={currentView}
            onViewChange={setCurrentView}
            mode="desktop"
          />
        </aside>
        <main className="flex-1 overflow-hidden">
          <SettingsView />
        </main>
      </div>
    </div>
  );
}
