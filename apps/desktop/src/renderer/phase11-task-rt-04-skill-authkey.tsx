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

const runtimeWindow = window as unknown as Window & {
  electronAPI?: {
    authKey?: {
      exists?: (...args: unknown[]) => Promise<{
        exists: boolean;
        source: string;
      }>;
      set?: (...args: unknown[]) => Promise<{ success: boolean }>;
      delete?: (...args: unknown[]) => Promise<{ success: boolean }>;
    };
    skillCreator?: {
      getAdapterStatus?: (...args: unknown[]) => Promise<{
        success: boolean;
        data?: {
          status: "initializing" | "ready" | "failed";
          failureReason: string | null;
        };
      }>;
      onAdapterStatusChanged?: (
        ...args: [
          cb: (payload: {
            status: "initializing" | "ready" | "failed";
            failureReason: string | null;
          }) => void,
        ]
      ) => () => void;
    };
  };
  skillCreatorAPI?: {
    getAdapterStatus?: (...args: unknown[]) => Promise<{
      success: boolean;
      data?: {
        status: "initializing" | "ready" | "failed";
        failureReason: string | null;
      };
    }>;
    onAdapterStatusChanged?: (
      ...args: [
        cb: (payload: {
          status: "initializing" | "ready" | "failed";
          failureReason: string | null;
        }) => void,
      ]
    ) => () => void;
  };
};

const defaultAuthKeyApi = {
  exists: async () => ({ exists: false, source: "not-set" }),
  set: async () => ({ success: true }),
  delete: async () => ({ success: true }),
};

const defaultSkillCreatorApi = {
  getAdapterStatus: async () => ({
    success: true,
    data: { status: "ready" as const, failureReason: null },
  }),
  onAdapterStatusChanged: () => () => undefined,
};

runtimeWindow.electronAPI = {
  ...runtimeWindow.electronAPI,
  authKey: {
    ...defaultAuthKeyApi,
    ...runtimeWindow.electronAPI?.authKey,
  },
  skillCreator: {
    ...defaultSkillCreatorApi,
    ...runtimeWindow.electronAPI?.skillCreator,
  },
};

runtimeWindow.skillCreatorAPI = {
  ...defaultSkillCreatorApi,
  ...runtimeWindow.skillCreatorAPI,
};
const HarnessApp = () => {
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <SkillLifecyclePanel
        onClose={() => undefined}
        onOpenWizard={() => setSettingsOpen(true)}
        onOpenSkillWizard={() => setSettingsOpen(true)}
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
