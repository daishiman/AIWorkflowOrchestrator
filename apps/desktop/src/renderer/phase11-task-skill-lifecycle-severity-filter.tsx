import React from "react";
import ReactDOM from "react-dom/client";
import { SkillLifecyclePanel } from "./components/skill/SkillLifecyclePanel";
import { useAppStore } from "./store";
import "./styles/globals.css";

type HarnessState = Partial<ReturnType<typeof useAppStore.getState>> & {
  resolvedTheme?: ReturnType<typeof useAppStore.getState>["resolvedTheme"];
};

declare global {
  interface Window {
    __PHASE11_TASK_SKILL_LIFECYCLE_SEVERITY_FILTER__?: HarnessState;
  }
}

const harnessState = window.__PHASE11_TASK_SKILL_LIFECYCLE_SEVERITY_FILTER__;

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
    <SkillLifecyclePanel
      onClose={() => undefined}
      onOpenWizard={() => undefined}
      onOpenSkillWizard={() => undefined}
      skillName="phase11-severity-filter-harness"
    />
  </div>,
);
