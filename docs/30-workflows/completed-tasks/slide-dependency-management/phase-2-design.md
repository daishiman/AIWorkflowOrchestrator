# Phase 2: 設計 - スライド依存関係管理システム

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 2                                         |
| タスクID   | task-feat-slide-dependency-management-003 |
| 名称       | 設計                                      |
| ステータス | 未実施                                    |
| 依存Phase  | Phase 1                                   |

---

## 目的

依存関係管理のアーキテクチャ設計・詳細設計を行う。

---

## 使用スキル

| スキル名               | パス                                             | 選定理由                                          |
| ---------------------- | ------------------------------------------------ | ------------------------------------------------- |
| architectural-patterns | `.claude/skills/architectural-patterns/SKILL.md` | アーキテクチャ設計（Trigger: アーキテクチャ設計） |
| dependency-analysis    | `.claude/skills/dependency-analysis/SKILL.md`    | 依存関係分析（Trigger: 依存関係）                 |
| state-manager          | `.claude/skills/state-manager/SKILL.md`          | 状態管理設計（Trigger: 状態管理, Zustand）        |
| workflow-engine        | `.claude/skills/workflow-engine/SKILL.md`        | ワークフロー設計（Trigger: ワークフロー）         |
| claude-agent-sdk       | `.claude/skills/claude-agent-sdk/SKILL.md`       | Agent SDK統合パターン（Trigger: Agent SDK）       |

**実行方法**: 各スキルのSKILL.mdを読み込み、スキルを参照して実行

---

## 統合テスト連携【必須】

### Phase 2での統合テスト連携アクション

統合ポイント/契約（API・スキーマ）を設計に反映する。

**具体的な設計項目**:

1. **IPC通信インターフェース設計**
   - `slide:executePhase` - スキル実行
   - `slide:startWatching` - ウォッチャー起動
   - `slide:stopWatching` - ウォッチャー停止
   - `slide:getSyncStatus` - 同期状態取得
   - `slide:manualSync` - 手動同期

2. **イベントスキーマ設計**
   - ファイル変更イベント
   - スキル実行進捗イベント
   - 同期状態変更イベント

3. **エラーハンドリング契約**
   - エラーコード体系
   - リトライ戦略
   - フォールバック動作

---

## 実行手順

### Step 1: アーキテクチャ設計

`architectural-patterns` スキルを使用してレイヤーアーキテクチャを設計：

```
┌─────────────────────────────────────────────────────┐
│                   Renderer Process                   │
│  ┌───────────────────────────────────────────────┐  │
│  │              SlideWorkspace.tsx                │  │
│  │  ┌─────────────┐  ┌─────────────────────────┐ │  │
│  │  │SkillPhase   │  │SyncStatusIndicator.tsx │ │  │
│  │  │Panel.tsx    │  │                         │ │  │
│  │  └─────────────┘  └─────────────────────────┘ │  │
│  └───────────────────────────────────────────────┘  │
│                        ↑                             │
│                   useSlideProject.ts                 │
│                        ↑                             │
│  ┌───────────────────────────────────────────────┐  │
│  │              Zustand Store                     │  │
│  │          (slideProjectStore.ts)                │  │
│  └───────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────┘
                        │ IPC (contextBridge)
┌───────────────────────▼─────────────────────────────┐
│                    Main Process                      │
│  ┌───────────────────────────────────────────────┐  │
│  │              IPC Handlers                      │  │
│  │           (slideIpcHandlers.ts)                │  │
│  └───────────────────────────────────────────────┘  │
│                        ↓                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │FileWatcher  │  │SkillExecutor│  │SyncManager  │  │
│  │(.ts)        │  │(.ts)        │  │(.ts)        │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
│         ↓                 ↓                          │
│  ┌─────────────────────────────────────────────────┐│
│  │              Claude Agent SDK                    ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### Step 2: モジュール設計

#### packages/shared/src/slide/

```typescript
// types.ts
export interface SlideProject {
  path: string;
  structurePath: string;
  htmlPath: string;
  syncStatus: SyncStatus;
  lastSyncAt: Date | null;
}

export type SyncStatus = 'synced' | 'out-of-sync' | 'syncing' | 'error';

export type SkillPhase = 'hearing' | 'structure' | 'html' | 'modifier';

export interface SkillExecutionResult {
  phase: SkillPhase;
  success: boolean;
  output?: string;
  error?: string;
  duration: number;
}

// slide-project.ts
export const createSlideProject = (path: string): SlideProject => { ... };
export const getSyncStatus = (project: SlideProject): SyncStatus => { ... };

// dependency-manager.ts
export const checkDependency = (structurePath: string, htmlPath: string): boolean => { ... };
export const calculateHash = (filePath: string): Promise<string> => { ... };
```

#### apps/desktop/src/main/slide/

```typescript
// file-watcher.ts
import chokidar from "chokidar";

export interface SlideWatcher {
  projectPath: string;
  start(): void;
  stop(): void;
  onStructureChange(callback: (path: string) => void): void;
}

// skill-executor.ts
export interface SkillExecutor {
  execute(
    phase: SkillPhase,
    projectPath: string,
  ): Promise<SkillExecutionResult>;
  cancel(): void;
  onProgress(callback: (progress: number) => void): void;
}

// sync-manager.ts
export interface SyncManager {
  getStatus(projectPath: string): Promise<SyncStatus>;
  sync(projectPath: string): Promise<void>;
  setAutoSync(enabled: boolean): void;
}
```

#### apps/desktop/src/renderer/slide/

```typescript
// useSlideProject.ts
export const useSlideProject = () => {
  const [project, setProject] = useState<SlideProject | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<SkillPhase | null>(null);

  const openProject = async (path: string) => { ... };
  const executePhase = async (phase: SkillPhase) => { ... };
  const manualSync = async () => { ... };

  return { project, isExecuting, currentPhase, openProject, executePhase, manualSync };
};
```

### Step 3: 状態管理設計

`state-manager` スキルを使用してZustand Storeを設計：

```typescript
// slideProjectStore.ts
interface SlideProjectState {
  projectPath: string | null;
  syncStatus: SyncStatus;
  currentPhase: SkillPhase | "idle";
  lastSyncAt: Date | null;
  isWatching: boolean;
  executionProgress: number;

  // Actions
  setProject(path: string): void;
  setSyncStatus(status: SyncStatus): void;
  setPhase(phase: SkillPhase | "idle"): void;
  setWatching(watching: boolean): void;
  setProgress(progress: number): void;
  reset(): void;
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

### Step 4: IPC通信設計

```typescript
// preload.ts (追加部分)
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
  onStructureChange: (callback: (path: string) => void) =>
    ipcRenderer.on("slide:structureChanged", (_, path) => callback(path)),
  onSyncStatusChange: (callback: (status: SyncStatus) => void) =>
    ipcRenderer.on("slide:syncStatusChanged", (_, status) => callback(status)),
  onExecutionProgress: (callback: (progress: number) => void) =>
    ipcRenderer.on("slide:executionProgress", (_, progress) =>
      callback(progress),
    ),
});
```

### Step 5: ワークフロー設計

`workflow-engine` スキルを使用してスキルフェーズフローを設計：

```
【新規作成フロー】
User Request → hearing-facilitator → structure-designer
                                            ↓
                                    Output: structure.md
                                            ↓
                                    [User Review & Approval]
                                            ↓
                                    html-generator
                                            ↓
                                    Output: index.html

【修正・改善フロー】
structure.md 変更検知 → html-generator 自動実行 → index.html 更新
    or
User Request → slide-modifier → structure.md 更新 → html-generator → index.html 更新
```

### Step 6: 無限ループ防止設計

```typescript
// デバウンス＋変更元識別による無限ループ防止
interface ChangeContext {
  source: "user" | "skill" | "unknown";
  timestamp: number;
}

const changeContextMap = new Map<string, ChangeContext>();

const shouldTriggerRegeneration = (path: string): boolean => {
  const context = changeContextMap.get(path);
  if (!context) return true;

  // スキルによる変更の場合は再生成をスキップ
  if (context.source === "skill") {
    const elapsed = Date.now() - context.timestamp;
    if (elapsed < 1000) return false; // 1秒以内のスキル変更は無視
  }

  return true;
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

| 成果物               | パス                                     | 説明                     | 必須 |
| -------------------- | ---------------------------------------- | ------------------------ | ---- |
| コンポーネント設計書 | `outputs/phase-2/architecture-design.md` | アーキテクチャ設計       | ✅   |
| 状態管理設計書       | `outputs/phase-2/state-design.md`        | Zustand Store設計        | ✅   |
| API仕様書（IPC）     | `outputs/phase-2/api-specification.md`   | IPC通信仕様              | ✅   |
| シーケンス図         | `outputs/phase-2/sequence-diagram.md`    | 処理フローのシーケンス図 | ✅   |

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                     | 内容                    |
| -------------------- | ------------------------------------------------------------------------ | ----------------------- |
| Electron IPC設計     | `.claude/skills/aiworkflow-requirements/references/electron-ipc-spec.md` | IPC通信仕様             |
| Agent SDK統合        | `.claude/skills/aiworkflow-requirements/references/agent-sdk-spec.md`    | Agent SDK統合仕様       |
| 状態管理ガイドライン | `.claude/skills/aiworkflow-requirements/references/state-management.md`  | Zustand使用ガイドライン |

### Phase 1成果物

| 参照資料           | パス                                         | 説明                       |
| ------------------ | -------------------------------------------- | -------------------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件の定義 |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`     | 各要件の受け入れ条件       |
| スキル連携フロー図 | `outputs/phase-1/skill-flow-diagram.md`      | スキルフェーズのフロー     |

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/slide-dependency-management --phase 2

# Phase完了・成果物登録
node .claude/skills/task-specification-creator/scripts/complete-phase.mjs \
  --workflow docs/30-workflows/slide-dependency-management --phase 2 --artifacts "architecture-design.md,state-design.md,api-specification.md,sequence-diagram.md"
```

---

## 完了条件チェックリスト

- [ ] ファイルウォッチャーの設計が完了
- [ ] スキル呼び出しの連携設計が完了
- [ ] UI状態管理の設計が完了
- [ ] IPC通信インターフェースが定義されている
- [ ] 無限ループ防止機構が設計されている
- [ ] シーケンス図が作成されている
- [ ] 統合テスト連携の統合ポイントが設計に反映されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## スキルフィードバック記録

| スキル                 | 結果    | 備考 |
| ---------------------- | ------- | ---- |
| architectural-patterns | pending | -    |
| dependency-analysis    | pending | -    |
| state-manager          | pending | -    |
| workflow-engine        | pending | -    |
| claude-agent-sdk       | pending | -    |

---

## 前後Phase

- 前: [Phase 1: 要件定義](phase-1-requirements.md)
- 次: [Phase 3: 設計レビューゲート](phase-3-design-review.md)
