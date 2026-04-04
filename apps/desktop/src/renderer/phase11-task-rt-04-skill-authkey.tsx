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
    __PHASE11_TASK_RT_04_SKILL_AUTHKEY__?: HarnessState;
  }
}

const harnessState = window.__PHASE11_TASK_RT_04_SKILL_AUTHKEY__;
const HarnessApp = () => {
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <SkillLifecyclePanel
        onClose={() => undefined}
        onOpenWizard={() => setSettingsOpen(true)}
        skillName="task-rt-04-phase11"
      />

      {settingsOpen ? (
        <div
          data-testid="phase11-settings-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-10"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Phase 11 settings overlay"
            className="w-full max-w-xl rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-6 shadow-2xl"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Settings
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              「設定を開く」導線が動作しました
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              このオーバーレイは Phase 11 のスクリーンショット検証用です。
              LLMAdapter
              エラーバナーから設定画面へ遷移できることを視覚的に確認できます。
            </p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                data-testid="phase11-settings-overlay-close"
                onClick={() => setSettingsOpen(false)}
                className="rounded-lg border border-[var(--border-primary)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)]"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

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

ReactDOM.createRoot(document.getElementById("root")!).render(<HarnessApp />);
