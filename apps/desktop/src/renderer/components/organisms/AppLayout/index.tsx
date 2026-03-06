import React from "react";
import clsx from "clsx";
import { Icon } from "../../atoms";
import { DynamicIsland } from "../../molecules";
import { NotificationCenter } from "../NotificationCenter";
import { GlobalNavStrip } from "../GlobalNavStrip";
import { MobileNavBar } from "../MobileNavBar";
import { useDynamicIsland, useResponsiveMode } from "../../../store";
import type { DockViewType } from "../../../navigation/navContract";

export interface AppLayoutProps {
  currentView: DockViewType;
  onViewChange: (view: DockViewType) => void;
  onGoBack: () => void;
  canGoBack: boolean;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentView,
  onViewChange,
  onGoBack,
  canGoBack,
  children,
}) => {
  const dynamicIsland = useDynamicIsland();
  const responsiveMode = useResponsiveMode();
  const isMobile = responsiveMode === "mobile";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {!isMobile ? (
        <GlobalNavStrip
          currentView={currentView}
          onViewChange={onViewChange}
          mode="desktop"
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header
          className={clsx(
            "grid shrink-0 grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-[var(--border-subtle)]",
            isMobile ? "px-4 py-3" : "px-6 py-4",
          )}
        >
          <button
            type="button"
            aria-label="前のビューに戻る"
            disabled={!canGoBack}
            onClick={onGoBack}
            className={clsx(
              "flex h-10 w-10 items-center justify-center rounded-2xl border transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]",
              canGoBack
                ? "border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                : "border-[var(--border-subtle)] text-[var(--text-tertiary)] opacity-60",
            )}
          >
            <Icon name="chevron-left" size={18} />
          </button>

          <div className="flex min-w-0 justify-center">
            <DynamicIsland
              status={dynamicIsland.status}
              message={dynamicIsland.message}
              visible={dynamicIsland.visible}
            />
          </div>

          <div className="flex justify-end">
            <NotificationCenter />
          </div>
        </header>

        <main
          className={clsx(
            "flex-1 overflow-auto",
            isMobile ? "px-4 pt-3 pb-[88px]" : "p-6",
          )}
        >
          {children}
        </main>
      </div>

      {isMobile ? (
        <MobileNavBar currentView={currentView} onViewChange={onViewChange} />
      ) : null}
    </div>
  );
};

AppLayout.displayName = "AppLayout";
