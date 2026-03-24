import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import type { HandoffGuidance, SkillPhase, SyncStatus } from "@repo/shared";
import { SlideWorkspace } from "./slide/SlideWorkspace";
import { useSlideProjectStore } from "./slide/store";
import { useAppStore } from "./store";
import "./styles/globals.css";

type HarnessScenario = "empty" | "synced" | "running" | "degraded" | "guidance";
type ThemeMode = "light" | "dark";
type SyncStatusListener = (status: SyncStatus) => void;
type ProgressListener = (progress: number) => void;
type StructureListener = (path: string) => void;
type OpenDialogOptions = {
  title?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  properties?: string[];
};
type SaveDialogOptions = {
  title?: string;
  defaultPath?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
};

const PROJECT_PATH = "/Users/dm/demo/ut-slide-ui-001";

const scenarioMeta: Record<
  HarnessScenario,
  { title: string; note: string; initialStatus: SyncStatus }
> = {
  empty: {
    title: "TC-11-01 Empty",
    note: "プロジェクト未選択の初期状態。",
    initialStatus: "synced",
  },
  synced: {
    title: "TC-11-02 Synced",
    note: "同期完了後の 4 領域 UI 基本状態。",
    initialStatus: "synced",
  },
  running: {
    title: "TC-11-03 Running",
    note: "フェーズ実行中の progress / cancel surface。",
    initialStatus: "synced",
  },
  degraded: {
    title: "TC-11-04 Degraded",
    note: "同期失敗時の degraded guidance と retry surface。",
    initialStatus: "error",
  },
  guidance: {
    title: "TC-11-05 Guidance",
    note: "handoff guidance と settings 導線を伴う guidance surface。",
    initialStatus: "synced",
  },
};

const guidanceBundle: HandoffGuidance = {
  terminalCommand: 'claude "slide sync を terminal handoff で継続してください"',
  contextSummary: "Slide runtime alignment guidance",
  reason: "Claude API キーの設定が必要です。",
};

function resolveScenario(raw: string | null): HarnessScenario {
  switch (raw) {
    case "synced":
    case "running":
    case "degraded":
    case "guidance":
    case "empty":
      return raw;
    default:
      return "empty";
  }
}

function resolveTheme(raw: string | null): ThemeMode {
  return raw === "dark" ? "dark" : "light";
}

const searchParams = new URLSearchParams(window.location.search);
const scenario = resolveScenario(searchParams.get("scenario"));
const theme = resolveTheme(searchParams.get("theme"));
const scenarioConfig = scenarioMeta[scenario];

document.documentElement.setAttribute("data-theme", theme);
document.documentElement.style.colorScheme = theme;

function installMocks(selectedScenario: HarnessScenario): void {
  const listeners = {
    structure: new Set<StructureListener>(),
    syncStatus: new Set<SyncStatusListener>(),
    progress: new Set<ProgressListener>(),
  };

  let currentStatus = scenarioMeta[selectedScenario].initialStatus;

  const emitSyncStatus = (status: SyncStatus): void => {
    currentStatus = status;
    listeners.syncStatus.forEach((listener) => listener(status));
  };

  const emitProgress = (progress: number): void => {
    listeners.progress.forEach((listener) => listener(progress));
  };

  window.electronAPI = {
    dialog: {
      showOpenDialog: async (options: OpenDialogOptions) => ({
        canceled: false,
        filePaths: [PROJECT_PATH],
        options,
      }),
      showSaveDialog: async (options: SaveDialogOptions) => ({
        canceled: true,
        filePath: undefined,
        options,
      }),
    },
  } as unknown as typeof window.electronAPI;

  window.slideApi = {
    watchStart: async () => ({ success: true }),
    syncStatus: async () => ({
      success: true,
      data: currentStatus,
    }),
    watchStop: async () => ({ success: true }),
    executePhase: async (phase: SkillPhase) => {
      if (selectedScenario === "running") {
        emitSyncStatus("syncing");
        for (const progress of [18, 41, 67]) {
          await new Promise((resolve) => setTimeout(resolve, 120));
          emitProgress(progress);
        }
      }

      return {
        success: true,
        data: {
          success: true,
          phase,
          output: `${phase} complete`,
          duration: 900,
          direction: "reverse" as const,
        },
      };
    },
    reverseSync: async () => {
      emitSyncStatus("syncing");
      await new Promise((resolve) => setTimeout(resolve, 120));
      emitSyncStatus("synced");
      return { success: true };
    },
    cancel: async () => {
      emitProgress(0);
      emitSyncStatus("error");
      return { success: true };
    },
    onStructureChange: (listener: StructureListener) => {
      listeners.structure.add(listener);
      return () => listeners.structure.delete(listener);
    },
    onSyncStatusChanged: (listener: SyncStatusListener) => {
      listeners.syncStatus.add(listener);
      return () => listeners.syncStatus.delete(listener);
    },
    onExecutionProgress: (listener: ProgressListener) => {
      listeners.progress.add(listener);
      return () => listeners.progress.delete(listener);
    },
    getCapability: async () => ({
      success: true,
      data: { lane: "integrated", apiKeySource: "env", uiStatus: "synced" },
    }),
    onSyncProgress: () => () => {},
    onSyncError: () => () => {},
    onWatchStatus: () => () => {},
  } as typeof window.slideApi;
}

installMocks(scenario);

const HarnessApp: React.FC = () => {
  useEffect(() => {
    useSlideProjectStore.getState().reset();
    useAppStore.getState().clearHandoffGuidance();

    if (scenario === "guidance") {
      useAppStore.getState().setHandoffGuidance(guidanceBundle);
    }
  }, []);

  return (
    <main
      className="min-h-screen bg-[var(--bg-primary)] px-8 py-10 text-[var(--text-primary)]"
      data-testid="phase11-ut-slide-ui-harness"
    >
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.16)]">
        <header className="space-y-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
            UT-SLIDE-UI-001 / Phase 11 Harness
          </p>
          <h1 className="text-xl font-semibold">{scenarioConfig.title}</h1>
          <p
            className="text-sm leading-6 text-[var(--text-secondary)]"
            data-testid="phase11-ut-slide-ui-note"
          >
            {scenarioConfig.note}
          </p>
        </header>

        <div className="rounded-3xl border border-[var(--border-color)] bg-white/80 p-2 shadow-inner">
          <SlideWorkspace />
        </div>
      </section>
    </main>
  );
};

const root = document.getElementById("root");
if (!root) {
  throw new Error("ut-slide-ui-001 harness の root 要素が見つかりませんでした");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <HarnessApp />
  </React.StrictMode>,
);
