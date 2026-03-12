import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { LightThemeSharedColorMigrationReviewHarness } from "./views/LightThemeSharedColorMigrationReviewHarness";
import "./styles/globals.css";

const App = React.lazy(() => import("./App"));
const WorkspaceView = React.lazy(async () => {
  const module = await import("./views/WorkspaceView");
  return { default: module.WorkspaceView };
});

declare global {
  interface Window {
    __PHASE11_WORKSPACE_LAYOUT_HARNESS__?: {
      theme: "light" | "dark";
    };
  }
}

function renderPhase11WorkspaceHarness(): JSX.Element {
  const theme = window.__PHASE11_WORKSPACE_LAYOUT_HARNESS__?.theme ?? "light";
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;

  return (
    <div
      className="min-h-screen bg-[var(--bg-primary)] p-6 text-[var(--text-primary)]"
      data-testid="phase11-workspace-layout-shell"
    >
      <div className="mx-auto h-[calc(100vh-48px)] max-w-[1600px]">
        <WorkspaceView />
      </div>
    </div>
  );
}

function renderLightThemeSharedColorMigrationHarness(): JSX.Element {
  const searchParams = new URLSearchParams(window.location.search);
  const theme =
    (searchParams.get("theme") as
      | "light"
      | "dark"
      | "system"
      | "kanagawa-dragon") ?? "light";
  const surface =
    (searchParams.get("surface") as
      | "settings"
      | "auth"
      | "workspace-search"
      | "dashboard") ?? "settings";

  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme =
    theme === "light" ? "light" : "dark";

  return (
    <LightThemeSharedColorMigrationReviewHarness
      surface={surface}
      theme={theme}
    />
  );
}

const searchParams = new URLSearchParams(window.location.search);
const appElement =
  searchParams.get("phase11Harness") === "workspace-layout" ? (
    renderPhase11WorkspaceHarness()
  ) : searchParams.get("phase11Harness") ===
    "light-theme-shared-color-migration" ? (
    renderLightThemeSharedColorMigrationHarness()
  ) : (
    <App />
  );

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]" />
      }
    >
      {appElement}
    </Suspense>
  </React.StrictMode>,
);
