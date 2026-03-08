import React from "react";
import ReactDOM from "react-dom/client";
import { SettingsView } from "./views/SettingsView";
import { useAppStore } from "./store";
import "./styles/globals.css";

type Phase11HarnessState = Partial<ReturnType<typeof useAppStore.getState>> & {
  resolvedTheme?: ReturnType<typeof useAppStore.getState>["resolvedTheme"];
};

declare global {
  interface Window {
    __PHASE11_AUTH_HARNESS__?: Phase11HarnessState;
  }
}

const harnessState = window.__PHASE11_AUTH_HARNESS__;

if (harnessState) {
  useAppStore.setState(harnessState);

  if (harnessState.resolvedTheme) {
    document.documentElement.setAttribute(
      "data-theme",
      harnessState.resolvedTheme,
    );
    document.documentElement.style.colorScheme =
      harnessState.resolvedTheme === "light" ? "light" : "dark";
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
    <SettingsView />
  </div>,
);
