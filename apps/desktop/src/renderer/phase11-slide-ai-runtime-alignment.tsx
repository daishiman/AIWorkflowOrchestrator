import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import type { SkillPhase, SyncStatus } from "@repo/shared";
import { SlideWorkspace } from "./slide/SlideWorkspace";
import { useSlideProjectStore } from "./slide/store";
import "./styles/globals.css";

type HarnessScenario =
  | "empty"
  | "synced"
  | "out-of-sync"
  | "running"
  | "sync-error";

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

const PROJECT_PATH = "/Users/dm/demo/slide-runtime-alignment";

const scenarioMeta: Record<
  HarnessScenario,
  { title: string; note: string; initialStatus: SyncStatus }
> = {
  empty: {
    title: "TC-11-01 Empty State",
    note: "current 実装の初期状態。プロジェクト未選択時は dashed 枠と open CTA のみが表示される。",
    initialStatus: "synced",
  },
  synced: {
    title: "TC-11-02 Synced State",
    note: "プロジェクト選択後の通常状態。current 実装では status badge / phase buttons / file cards を表示する。",
    initialStatus: "synced",
  },
  "out-of-sync": {
    title: "TC-11-03 Reverse Sync CTA",
    note: "current 実装では reverse-sync 専用 UI ではなく、黄色の manual sync ボタンが単独で表示される。",
    initialStatus: "out-of-sync",
  },
  running: {
    title: "TC-11-04 Running Progress",
    note: "modifier 実行中の progress 表示。task-09 設計が想定する guidance / handoff ではなく現行 progress bar を確認する。",
    initialStatus: "synced",
  },
  "sync-error": {
    title: "TC-11-05 Error State",
    note: "manual sync 失敗時の current 実装。alert 文言は出るが、guidance block / terminal launcher は存在しない。",
    initialStatus: "out-of-sync",
  },
};

function resolveScenario(raw: string | null): HarnessScenario {
  switch (raw) {
    case "synced":
    case "out-of-sync":
    case "running":
    case "sync-error":
    case "empty":
      return raw;
    default:
      return "empty";
  }
}

const searchParams = new URLSearchParams(window.location.search);
const scenario = resolveScenario(searchParams.get("scenario"));
const scenarioConfig = scenarioMeta[scenario];

document.documentElement.setAttribute("data-theme", "light");
document.documentElement.style.colorScheme = "light";

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

  const globalWindow = window as typeof window;

  globalWindow.electronAPI = {
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

  globalWindow.slideApi = {
    startWatching: async (_projectPath: string) => ({ success: true }),
    getSyncStatus: async () => ({
      success: true,
      data: currentStatus,
    }),
    stopWatching: async () => ({ success: true }),
    executePhase: async (phase: SkillPhase, projectPath: string) => {
      if (selectedScenario !== "running") {
        return {
          success: true,
          data: {
            success: true,
            phase,
            projectPath,
            output: `${phase} complete`,
            duration: 2_400,
          },
        };
      }

      emitSyncStatus("syncing");
      const progressSteps = [18, 42, 68, 87];
      for (const progress of progressSteps) {
        await new Promise((resolve) => setTimeout(resolve, 220));
        emitProgress(progress);
      }

      await new Promise((resolve) => setTimeout(resolve, 1_800));
      emitProgress(100);
      emitSyncStatus("synced");

      return {
        success: true,
        data: {
          success: true,
          phase,
          projectPath,
          output: `${phase} complete`,
          duration: 2_400,
        },
      };
    },
    manualSync: async (_projectPath: string) => {
      if (selectedScenario === "sync-error") {
        return {
          success: false,
          error: {
            code: "SLIDE_E007",
            message:
              "Reverse sync failed: current implementation does not expose guidance or terminal fallback.",
          },
        };
      }

      emitSyncStatus("synced");
      return { success: true };
    },
    cancelExecution: async () => {
      emitProgress(0);
      emitSyncStatus("error");
      return { success: true };
    },
    onStructureChange: (listener: StructureListener) => {
      listeners.structure.add(listener);
      return () => listeners.structure.delete(listener);
    },
    onSyncStatusChange: (listener: SyncStatusListener) => {
      listeners.syncStatus.add(listener);
      return () => listeners.syncStatus.delete(listener);
    },
    onExecutionProgress: (listener: ProgressListener) => {
      listeners.progress.add(listener);
      return () => listeners.progress.delete(listener);
    },
  } as unknown as typeof window.slideApi;
}

installMocks(scenario);

const HarnessApp: React.FC = () => {
  useEffect(() => {
    useSlideProjectStore.getState().reset();
  }, []);

  return (
    <main
      className="min-h-screen bg-[var(--bg-primary)] px-8 py-10 text-[var(--text-primary)]"
      data-testid="phase11-slide-runtime-harness"
    >
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.16)]">
        <header className="space-y-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
            TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 / Phase 11 Harness
          </p>
          <h1 className="text-xl font-semibold">{scenarioConfig.title}</h1>
          <p
            className="text-sm leading-6 text-[var(--text-secondary)]"
            data-testid="phase11-slide-runtime-note"
          >
            {scenarioConfig.note}
          </p>
        </header>

        <div className="rounded-3xl border border-[var(--border-color)] bg-white/80 p-2 shadow-inner dark:bg-slate-950/30">
          <SlideWorkspace />
        </div>
      </section>
    </main>
  );
};

const root = document.getElementById("root");
if (!root) {
  throw new Error(
    "slide runtime alignment harness の root 要素が見つかりませんでした",
  );
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <HarnessApp />
  </React.StrictMode>,
);
