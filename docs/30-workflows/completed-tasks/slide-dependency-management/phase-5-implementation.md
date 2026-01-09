# Phase 5: 実装 - スライド依存関係管理システム

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 5                                         |
| タスクID   | task-feat-slide-dependency-management-003 |
| 名称       | 実装                                      |
| ステータス | 未実施                                    |
| 依存Phase  | Phase 4                                   |

---

## 目的

TDD: テストを通す最小限の実装を行う（Green状態）。

---

## 使用スキル

| スキル名                   | パス                                                 | 選定理由                                       |
| -------------------------- | ---------------------------------------------------- | ---------------------------------------------- |
| clean-code-practices       | `.claude/skills/clean-code-practices/SKILL.md`       | クリーンコード実践（Anchor: Clean Code）       |
| debounce-throttle-patterns | `.claude/skills/debounce-throttle-patterns/SKILL.md` | デバウンス・スロットル（Trigger: デバウンス）  |
| custom-hooks-patterns      | `.claude/skills/custom-hooks-patterns/SKILL.md`      | Reactカスタムフック（Trigger: カスタムフック） |
| electron-ipc-patterns      | `.claude/skills/electron-ipc-patterns/SKILL.md`      | Electron IPC通信（Trigger: IPC通信）           |
| concurrency-control        | `.claude/skills/concurrency-control/SKILL.md`        | 並行制御（Trigger: キュー管理, ロック）        |

**実行方法**: 各スキルのSKILL.mdを読み込み、スキルを参照して実行

---

## 統合テスト連携【必須】

### Phase 5での統合テスト連携アクション

フロント/バック接続の実装とテスト支援コード整備を行う。

**具体的な実装項目**:

1. **IPC通信の実装**
   - Main Process側のIPCハンドラー実装
   - Renderer Process側のpreload実装
   - 双方向通信の実装

2. **テスト支援コード**
   - IPCモックユーティリティ
   - ファイルシステムモックユーティリティ
   - Storeテストユーティリティ

---

## 実行手順

### Step 1: 共有モジュール実装

#### packages/shared/src/slide/types.ts

```typescript
export interface SlideProject {
  path: string;
  structurePath: string;
  htmlPath: string;
  syncStatus: SyncStatus;
  lastSyncAt: Date | null;
}

export type SyncStatus = "synced" | "out-of-sync" | "syncing" | "error";

export type SkillPhase = "hearing" | "structure" | "html" | "modifier";

export interface SkillExecutionResult {
  phase: SkillPhase;
  success: boolean;
  output?: string;
  error?: string;
  duration: number;
}

export interface WatcherConfig {
  persistent: boolean;
  ignoreInitial: boolean;
  awaitWriteFinish: {
    stabilityThreshold: number;
    pollInterval: number;
  };
  ignored: string[];
}
```

#### packages/shared/src/slide/slide-project.ts

```typescript
import { SlideProject, SyncStatus } from "./types";
import path from "path";

export const createSlideProject = (projectPath: string): SlideProject => {
  return {
    path: projectPath,
    structurePath: path.join(projectPath, "structure.md"),
    htmlPath: path.join(projectPath, "index.html"),
    syncStatus: "synced",
    lastSyncAt: null,
  };
};

export const getSyncStatus = (project: SlideProject): SyncStatus => {
  return project.syncStatus;
};
```

#### packages/shared/src/slide/dependency-manager.ts

```typescript
import * as fs from "fs/promises";
import * as crypto from "crypto";

export const calculateHash = async (filePath: string): Promise<string> => {
  const content = await fs.readFile(filePath, "utf-8");
  return crypto.createHash("md5").update(content).digest("hex");
};

export const checkDependency = async (
  structurePath: string,
  htmlPath: string,
): Promise<boolean> => {
  try {
    const [structureStat, htmlStat] = await Promise.all([
      fs.stat(structurePath),
      fs.stat(htmlPath),
    ]);
    return structureStat.mtime <= htmlStat.mtime;
  } catch {
    return false;
  }
};
```

### Step 2: Main Process実装

#### apps/desktop/src/main/slide/file-watcher.ts

```typescript
import chokidar, { FSWatcher } from "chokidar";
import { WatcherConfig } from "@repo/shared/slide";

export interface SlideWatcher {
  projectPath: string;
  watcher: FSWatcher | null;
  start(): void;
  stop(): void;
  onStructureChange(callback: (path: string) => void): void;
}

const DEFAULT_CONFIG: WatcherConfig = {
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 500,
    pollInterval: 100,
  },
  ignored: ["**/node_modules/**", "**/.git/**"],
};

export const createSlideWatcher = (projectPath: string): SlideWatcher => {
  let watcher: FSWatcher | null = null;
  const callbacks: Array<(path: string) => void> = [];

  return {
    projectPath,
    get watcher() {
      return watcher;
    },

    start() {
      const structurePath = `${projectPath}/structure.md`;
      watcher = chokidar.watch(structurePath, DEFAULT_CONFIG);

      watcher.on("change", (path) => {
        callbacks.forEach((cb) => cb(path));
      });
    },

    stop() {
      watcher?.close();
      watcher = null;
    },

    onStructureChange(callback) {
      callbacks.push(callback);
    },
  };
};
```

#### apps/desktop/src/main/slide/skill-executor.ts

```typescript
import { SkillPhase, SkillExecutionResult } from "@repo/shared/slide";

export interface SkillExecutor {
  execute(
    phase: SkillPhase,
    projectPath: string,
  ): Promise<SkillExecutionResult>;
  cancel(): void;
  onProgress(callback: (progress: number) => void): void;
}

export const createSkillExecutor = (): SkillExecutor => {
  let cancelled = false;
  const progressCallbacks: Array<(progress: number) => void> = [];

  const emitProgress = (progress: number) => {
    progressCallbacks.forEach((cb) => cb(progress));
  };

  return {
    async execute(phase, projectPath) {
      cancelled = false;
      const startTime = Date.now();

      try {
        emitProgress(0);

        // Claude Agent SDK経由でスキルを実行
        // TODO: Agent SDK統合後に実装
        const skillName = getSkillName(phase);

        emitProgress(50);

        if (cancelled) {
          throw new Error("Cancelled");
        }

        // スキル実行のシミュレーション（Agent SDK統合まで）
        await new Promise((resolve) => setTimeout(resolve, 1000));

        emitProgress(100);

        return {
          phase,
          success: true,
          duration: Date.now() - startTime,
        };
      } catch (error) {
        return {
          phase,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          duration: Date.now() - startTime,
        };
      }
    },

    cancel() {
      cancelled = true;
    },

    onProgress(callback) {
      progressCallbacks.push(callback);
    },
  };
};

const getSkillName = (phase: SkillPhase): string => {
  const skillMap: Record<SkillPhase, string> = {
    hearing: "hearing-facilitator",
    structure: "structure-designer",
    html: "html-generator",
    modifier: "slide-modifier",
  };
  return skillMap[phase];
};
```

#### apps/desktop/src/main/slide/sync-manager.ts

```typescript
import { SyncStatus } from "@repo/shared/slide";
import { checkDependency } from "@repo/shared/slide";
import { createSkillExecutor } from "./skill-executor";

export interface SyncManager {
  getStatus(projectPath: string): Promise<SyncStatus>;
  sync(projectPath: string): Promise<void>;
  setAutoSync(enabled: boolean): void;
}

export const createSyncManager = (): SyncManager => {
  let autoSyncEnabled = true;
  const executor = createSkillExecutor();

  return {
    async getStatus(projectPath) {
      const structurePath = `${projectPath}/structure.md`;
      const htmlPath = `${projectPath}/index.html`;

      const inSync = await checkDependency(structurePath, htmlPath);
      return inSync ? "synced" : "out-of-sync";
    },

    async sync(projectPath) {
      const result = await executor.execute("html", projectPath);
      if (!result.success) {
        throw new Error(result.error || "Sync failed");
      }
    },

    setAutoSync(enabled) {
      autoSyncEnabled = enabled;
    },
  };
};
```

#### apps/desktop/src/main/slide/ipc-handlers.ts

```typescript
import { ipcMain, BrowserWindow } from "electron";
import { SkillPhase, SyncStatus } from "@repo/shared/slide";
import { createSlideWatcher, SlideWatcher } from "./file-watcher";
import { createSkillExecutor } from "./skill-executor";
import { createSyncManager } from "./sync-manager";

let watcher: SlideWatcher | null = null;
const executor = createSkillExecutor();
const syncManager = createSyncManager();

export const registerSlideIpcHandlers = (mainWindow: BrowserWindow) => {
  // スキル実行
  ipcMain.handle(
    "slide:executePhase",
    async (_, phase: SkillPhase, projectPath: string) => {
      return await executor.execute(phase, projectPath);
    },
  );

  // ウォッチャー起動
  ipcMain.handle("slide:startWatching", (_, projectPath: string) => {
    if (watcher) {
      watcher.stop();
    }

    watcher = createSlideWatcher(projectPath);
    watcher.onStructureChange((path) => {
      mainWindow.webContents.send("slide:structureChanged", path);
    });
    watcher.start();

    return { success: true };
  });

  // ウォッチャー停止
  ipcMain.handle("slide:stopWatching", () => {
    if (watcher) {
      watcher.stop();
      watcher = null;
    }
    return { success: true };
  });

  // 同期状態取得
  ipcMain.handle("slide:getSyncStatus", async (_, projectPath: string) => {
    return await syncManager.getStatus(projectPath);
  });

  // 手動同期
  ipcMain.handle("slide:manualSync", async (_, projectPath: string) => {
    await syncManager.sync(projectPath);
    return { success: true };
  });

  // 進捗イベント転送
  executor.onProgress((progress) => {
    mainWindow.webContents.send("slide:executionProgress", progress);
  });
};
```

### Step 3: Renderer Process実装

#### apps/desktop/src/preload/slideApi.ts

```typescript
import { contextBridge, ipcRenderer } from "electron";
import { SkillPhase, SyncStatus } from "@repo/shared/slide";

export const exposeSlideApi = () => {
  contextBridge.exposeInMainWorld("slideApi", {
    executePhase: (phase: SkillPhase, projectPath: string) =>
      ipcRenderer.invoke("slide:executePhase", phase, projectPath),
    startWatching: (projectPath: string) =>
      ipcRenderer.invoke("slide:startWatching", projectPath),
    stopWatching: () => ipcRenderer.invoke("slide:stopWatching"),
    getSyncStatus: (projectPath: string) =>
      ipcRenderer.invoke("slide:getSyncStatus", projectPath),
    manualSync: (projectPath: string) =>
      ipcRenderer.invoke("slide:manualSync", projectPath),

    // Events
    onStructureChange: (callback: (path: string) => void) => {
      const handler = (_: unknown, path: string) => callback(path);
      ipcRenderer.on("slide:structureChanged", handler);
      return () =>
        ipcRenderer.removeListener("slide:structureChanged", handler);
    },
    onSyncStatusChange: (callback: (status: SyncStatus) => void) => {
      const handler = (_: unknown, status: SyncStatus) => callback(status);
      ipcRenderer.on("slide:syncStatusChanged", handler);
      return () =>
        ipcRenderer.removeListener("slide:syncStatusChanged", handler);
    },
    onExecutionProgress: (callback: (progress: number) => void) => {
      const handler = (_: unknown, progress: number) => callback(progress);
      ipcRenderer.on("slide:executionProgress", handler);
      return () =>
        ipcRenderer.removeListener("slide:executionProgress", handler);
    },
  });
};
```

#### apps/desktop/src/renderer/slide/store.ts

```typescript
import { create } from "zustand";
import { SyncStatus, SkillPhase } from "@repo/shared/slide";

interface SlideProjectState {
  projectPath: string | null;
  syncStatus: SyncStatus;
  currentPhase: SkillPhase | "idle";
  lastSyncAt: Date | null;
  isWatching: boolean;
  executionProgress: number;

  setProject: (path: string) => void;
  setSyncStatus: (status: SyncStatus) => void;
  setPhase: (phase: SkillPhase | "idle") => void;
  setWatching: (watching: boolean) => void;
  setProgress: (progress: number) => void;
  reset: () => void;
}

export const useSlideProjectStore = create<SlideProjectState>((set) => ({
  projectPath: null,
  syncStatus: "synced",
  currentPhase: "idle",
  lastSyncAt: null,
  isWatching: false,
  executionProgress: 0,

  setProject: (path) => set({ projectPath: path }),
  setSyncStatus: (status) => set({ syncStatus: status }),
  setPhase: (phase) => set({ currentPhase: phase }),
  setWatching: (watching) => set({ isWatching: watching }),
  setProgress: (progress) => set({ executionProgress: progress }),
  reset: () =>
    set({
      projectPath: null,
      syncStatus: "synced",
      currentPhase: "idle",
      lastSyncAt: null,
      isWatching: false,
      executionProgress: 0,
    }),
}));
```

#### apps/desktop/src/renderer/slide/useSlideProject.ts

```typescript
import { useCallback, useEffect } from "react";
import { SkillPhase } from "@repo/shared/slide";
import { useSlideProjectStore } from "./store";

export const useSlideProject = () => {
  const store = useSlideProjectStore();

  const openProject = useCallback(async (path: string) => {
    store.setProject(path);
    await window.slideApi.startWatching(path);
    store.setWatching(true);

    const status = await window.slideApi.getSyncStatus(path);
    store.setSyncStatus(status);
  }, []);

  const closeProject = useCallback(async () => {
    await window.slideApi.stopWatching();
    store.reset();
  }, []);

  const executePhase = useCallback(
    async (phase: SkillPhase) => {
      if (!store.projectPath) return;

      store.setPhase(phase);
      const result = await window.slideApi.executePhase(
        phase,
        store.projectPath,
      );
      store.setPhase("idle");

      if (result.success) {
        const status = await window.slideApi.getSyncStatus(store.projectPath);
        store.setSyncStatus(status);
      }

      return result;
    },
    [store.projectPath],
  );

  const manualSync = useCallback(async () => {
    if (!store.projectPath) return;

    store.setSyncStatus("syncing");
    await window.slideApi.manualSync(store.projectPath);
    store.setSyncStatus("synced");
  }, [store.projectPath]);

  // イベントリスナー設定
  useEffect(() => {
    const unsubscribeStructure = window.slideApi.onStructureChange(async () => {
      if (store.projectPath) {
        const status = await window.slideApi.getSyncStatus(store.projectPath);
        store.setSyncStatus(status);
      }
    });

    const unsubscribeProgress = window.slideApi.onExecutionProgress(
      (progress) => {
        store.setProgress(progress);
      },
    );

    return () => {
      unsubscribeStructure();
      unsubscribeProgress();
    };
  }, [store.projectPath]);

  return {
    project: store.projectPath ? { path: store.projectPath } : null,
    syncStatus: store.syncStatus,
    currentPhase: store.currentPhase,
    isWatching: store.isWatching,
    executionProgress: store.executionProgress,
    isExecuting: store.currentPhase !== "idle",
    openProject,
    closeProject,
    executePhase,
    manualSync,
  };
};
```

### Step 4: UIコンポーネント実装

#### apps/desktop/src/renderer/slide/SyncStatusIndicator.tsx

```typescript
import React from 'react';
import { SyncStatus } from '@repo/shared/slide';

interface Props {
  status: SyncStatus;
}

export const SyncStatusIndicator: React.FC<Props> = ({ status }) => {
  const statusConfig = {
    synced: { label: '同期済み', color: 'bg-green-500' },
    'out-of-sync': { label: '非同期', color: 'bg-yellow-500' },
    syncing: { label: '同期中', color: 'bg-blue-500' },
    error: { label: 'エラー', color: 'bg-red-500' },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${config.color}`} />
      <span className="text-sm">{config.label}</span>
    </div>
  );
};
```

#### apps/desktop/src/renderer/slide/SkillPhasePanel.tsx

```typescript
import React from 'react';
import { SkillPhase } from '@repo/shared/slide';

interface Props {
  onExecute: (phase: SkillPhase) => void;
  isExecuting?: boolean;
  currentPhase?: SkillPhase | 'idle';
}

export const SkillPhasePanel: React.FC<Props> = ({
  onExecute,
  isExecuting = false,
  currentPhase = 'idle',
}) => {
  const phases: Array<{ phase: SkillPhase; label: string }> = [
    { phase: 'hearing', label: 'ヒアリング' },
    { phase: 'structure', label: '構成設計' },
    { phase: 'html', label: 'HTML生成' },
    { phase: 'modifier', label: 'スライド修正' },
  ];

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">スキルフェーズ</h3>
      <div className="flex gap-2">
        {phases.map(({ phase, label }) => (
          <button
            key={phase}
            onClick={() => onExecute(phase)}
            disabled={isExecuting}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${currentPhase === phase ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}
              ${isExecuting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};
```

#### apps/desktop/src/renderer/slide/SlideWorkspace.tsx

```typescript
import React from 'react';
import { useSlideProject } from './useSlideProject';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { SkillPhasePanel } from './SkillPhasePanel';

export const SlideWorkspace: React.FC = () => {
  const {
    project,
    syncStatus,
    currentPhase,
    isExecuting,
    executionProgress,
    openProject,
    executePhase,
    manualSync,
  } = useSlideProject();

  const handleOpenProject = async () => {
    // TODO: ファイル選択ダイアログを実装
    const path = '/path/to/project'; // 仮の値
    await openProject(path);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">スライドワークスペース</h2>

      {!project ? (
        <button
          onClick={handleOpenProject}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          プロジェクトを開く
        </button>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{project.path}</span>
            <SyncStatusIndicator status={syncStatus} />
          </div>

          <SkillPhasePanel
            onExecute={executePhase}
            isExecuting={isExecuting}
            currentPhase={currentPhase}
          />

          {isExecuting && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${executionProgress}%` }}
              />
            </div>
          )}

          {syncStatus === 'out-of-sync' && (
            <button
              onClick={manualSync}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md"
            >
              手動同期
            </button>
          )}
        </>
      )}
    </div>
  );
};
```

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 使用スキルの実行（各スキルごとに1タスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## 成果物

| 成果物       | パス                                        | 説明             | 必須 |
| ------------ | ------------------------------------------- | ---------------- | ---- |
| 実装サマリー | `outputs/phase-5/implementation-summary.md` | 実装内容のまとめ | ✅   |
| 実装コード   | プロジェクトディレクトリ内                  | ソースコード     | ✅   |

### コード成果物の配置先

```
packages/shared/src/slide/
├── types.ts
├── slide-project.ts
├── dependency-manager.ts
└── index.ts

apps/desktop/src/main/slide/
├── file-watcher.ts
├── skill-executor.ts
├── sync-manager.ts
└── ipc-handlers.ts

apps/desktop/src/preload/
└── slideApi.ts

apps/desktop/src/renderer/slide/
├── store.ts
├── useSlideProject.ts
├── SyncStatusIndicator.tsx
├── SkillPhasePanel.tsx
└── SlideWorkspace.tsx
```

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装時に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                     | 内容                    |
| -------------------- | ------------------------------------------------------------------------ | ----------------------- |
| Electron IPC設計     | `.claude/skills/aiworkflow-requirements/references/electron-ipc-spec.md` | IPC通信仕様             |
| Agent SDK統合        | `.claude/skills/aiworkflow-requirements/references/agent-sdk-spec.md`    | Agent SDK統合仕様       |
| 状態管理ガイドライン | `.claude/skills/aiworkflow-requirements/references/state-management.md`  | Zustand使用ガイドライン |

### Phase 4成果物

| 参照資料             | パス                                    | 説明           |
| -------------------- | --------------------------------------- | -------------- |
| テスト仕様書         | `outputs/phase-4/test-specification.md` | テスト観点     |
| ユニットテストコード | `packages/*/src/**/*.test.ts`           | 実装対象テスト |

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/slide-dependency-management --phase 5

# Phase完了・成果物登録
node .claude/skills/task-specification-creator/scripts/complete-phase.mjs \
  --workflow docs/30-workflows/slide-dependency-management --phase 5 --artifacts "implementation-summary.md"
```

---

## 完了条件チェックリスト

- [ ] すべてのテストが成功（Green）
- [ ] ファイルウォッチャーが動作する
- [ ] 4つのスキルフェーズが呼び出せる
- [ ] 自動同期が動作する
- [ ] 手動同期ボタンが動作する
- [ ] 同期状態インジケーターが正しく表示される
- [ ] 無限ループ防止機構が動作する
- [ ] IPC通信が正常に機能する
- [ ] **本Phase内の全スキルを100%実行完了**

---

## スキルフィードバック記録

| スキル                     | 結果    | 備考 |
| -------------------------- | ------- | ---- |
| clean-code-practices       | pending | -    |
| debounce-throttle-patterns | pending | -    |
| custom-hooks-patterns      | pending | -    |
| electron-ipc-patterns      | pending | -    |
| concurrency-control        | pending | -    |

---

## 前後Phase

- 前: [Phase 4: テスト作成](phase-4-test-creation.md)
- 次: [Phase 6: テスト拡充](phase-6-test-expansion.md)
