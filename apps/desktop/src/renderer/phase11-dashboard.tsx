import React from "react";
import ReactDOM from "react-dom/client";
import { DashboardView } from "./views/DashboardView";
import "./styles/globals.css";

function getThemeFromQuery(): "light" | "dark" {
  const value = new URLSearchParams(window.location.search).get("theme");
  return value === "dark" ? "dark" : "light";
}

function applyTheme(theme: "light" | "dark"): void {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
}

function Phase11DashboardHarness(): JSX.Element {
  const theme = getThemeFromQuery();
  applyTheme(theme);

  return (
    <div
      className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]"
      data-testid="phase11-dashboard-shell"
    >
      <main className="mx-auto max-w-[1440px] p-6">
        <DashboardView />
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Phase11DashboardHarness />,
);
