import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { WorkspaceView } from "./views/WorkspaceView";
import "./styles/globals.css";

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

const searchParams = new URLSearchParams(window.location.search);
const appElement =
  searchParams.get("phase11Harness") === "workspace-layout" ? (
    renderPhase11WorkspaceHarness()
  ) : (
    <App />
  );

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>{appElement}</React.StrictMode>,
);
