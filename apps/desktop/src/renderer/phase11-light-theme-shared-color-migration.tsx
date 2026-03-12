import React from "react";
import ReactDOM from "react-dom/client";
import { LightThemeSharedColorMigrationReviewHarness } from "./views/LightThemeSharedColorMigrationReviewHarness";
import "./styles/globals.css";

type ReviewSurface = "settings" | "auth" | "workspace-search" | "dashboard";
type ReviewTheme = "kanagawa-dragon" | "light" | "dark" | "system";

function getSearchParams() {
  return new URLSearchParams(window.location.search);
}

function getSurface(): ReviewSurface {
  const value = getSearchParams().get("surface");
  return value === "auth" ||
    value === "workspace-search" ||
    value === "dashboard"
    ? value
    : "settings";
}

function getTheme(): ReviewTheme {
  const value = getSearchParams().get("theme");
  return value === "kanagawa-dragon" || value === "dark" || value === "system"
    ? value
    : "light";
}

const theme = getTheme();
document.documentElement.setAttribute("data-theme", theme);
document.documentElement.style.colorScheme =
  theme === "light" ? "light" : "dark";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LightThemeSharedColorMigrationReviewHarness
      surface={getSurface()}
      theme={theme}
    />
  </React.StrictMode>,
);
