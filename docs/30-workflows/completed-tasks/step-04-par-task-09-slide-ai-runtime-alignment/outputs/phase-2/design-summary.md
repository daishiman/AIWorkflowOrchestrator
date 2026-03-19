# Phase 2: 設計サマリー

## メタ情報

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| タスクID | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 |
| Phase    | 2                                       |
| 作成日   | 2026-03-19                              |

---

## T-2-1: Shared Runtime Policy 設計（Concern 1: Runtime Routing）

### 現行 → 目標フロー

```
[現行]
SlideWorkspace → ipc-handlers → skill-executor → agent-client → Anthropic SDK 直呼び出し
                                                    ↓
                                              electron-store 直読み + env fallback

[目標]
SlideWorkspace → ipc-handlers (validateIpcSender + P42)
                    → skill-executor (RuntimeResolver 統合)
                        → RuntimeResolver.resolve(authMode, authKeyService)
                            → [integrated] IAuthKeyService.getKey() → new Anthropic({ apiKey })
                            → [handoff] { success: false, isHandoff: true, guidance: HandoffGuidance }
```

### 分岐ルール

| authMode       | hasApiKey | 結果         | 処理                                |
| -------------- | --------- | ------------ | ----------------------------------- |
| `subscription` | any       | `handoff`    | guidance + terminal handoff を返却  |
| `api-key`      | `false`   | `handoff`    | guidance + terminal handoff を返却  |
| `api-key`      | `true`    | `integrated` | IAuthKeyService.getKey() → SDK 呼出 |

### API Key 取得経路の統一

| 現行                                        | 目標                            |
| ------------------------------------------- | ------------------------------- |
| `electron-store` 直読み (agent-client:99)   | `IAuthKeyService.getKey()`      |
| `safeStorage` 復号 (agent-client:117)       | IAuthKeyService 内部で処理      |
| `process.env.ANTHROPIC_API_KEY` (agent:127) | IAuthKeyService.exists() で判定 |

---

## T-2-2: Role 設計（Concern 2: Lifecycle Orchestration）

### モジュール責務と存廃

| モジュール        | 責務                                         | DI 注入点                   | 存廃     |
| ----------------- | -------------------------------------------- | --------------------------- | -------- |
| file-watcher.ts   | chokidar でファイル変更検知、callback 発火   | SyncManager コンストラクタ  | 残存     |
| sync-manager.ts   | reverse-sync orchestration、sync status 管理 | ipc-handlers handler 登録時 | 残存拡張 |
| skill-executor.ts | RuntimeResolver + SDK + modifier prompt 統合 | SyncManager コンストラクタ  | 残存拡張 |
| modifier-skill.ts | modifier prompt 構成（孤立・二重実装）       | -                           | **廃止** |
| agent-client.ts   | Direct SDK + electron-store 直読み           | -                           | **廃止** |

### modifier-skill.ts 二重実装解消

- `buildModifierPrompt()` と `parseModifierResponse()` を skill-executor.ts に統合
- `createModifierSkill()` の呼び出し元は現在ゼロ（孤立）→ 廃止可能
- skill-executor.ts の `phase === "modifier"` 分岐は維持し、prompt 構成ロジックを統合

### DI 依存関係図

```
ipc-handlers.ts
  ├── SyncManager (interface: ISyncManager)
  │     ├── FileWatcher (interface: IFileWatcher)
  │     └── SkillExecutor (interface: ISkillExecutor)
  │           ├── IAuthKeyService
  │           └── IAuthModeService
  └── SkillExecutor (直接参照: executePhase / cancelExecution)
```

---

## T-2-3: Authority 設計（Concern 3: IPC / State）

### 状態の Authority

| 状態                                           | Authority     | 保持先       | Push チャネル                                     |
| ---------------------------------------------- | ------------- | ------------ | ------------------------------------------------- |
| SyncStatus (`idle`/`syncing`/`synced`/`error`) | SyncManager   | Main Process | `slide:sync-status-changed` → Renderer slideSlice |
| SyncDirection (`forward`/`reverse`)            | SyncManager   | Main Process | `slide:sync-status-changed` → Renderer slideSlice |
| SyncProgress (`{ percent, message }`)          | SyncManager   | Main Process | `slide:sync-progress` → Renderer slideSlice       |
| SyncError (`{ code, message }`)                | SyncManager   | Main Process | `slide:sync-error` → Renderer slideSlice          |
| IsWatching                                     | FileWatcher   | Main Process | `slide:watch-status` → Renderer slideSlice        |
| ExecutionProgress                              | SkillExecutor | Main Process | `slide:execution-progress` → Renderer slideSlice  |

> **設計決定**: `slide:sync-status` は invoke（Renderer→Main）で使用するため、push（Main→Renderer）側は `slide:sync-status-changed` として衝突を回避する。

### Zustand slideSlice 型定義

```typescript
interface SlideSliceState {
  projectPath: string | null;
  syncStatus: SyncStatus; // "idle" | "syncing" | "synced" | "error"
  syncDirection: SyncDirection; // "forward" | "reverse"
  syncProgress: { percent: number; message: string } | null;
  syncError: { code: string; message: string } | null;
  currentPhase: SkillPhase | "idle";
  lastSyncAt: Date | null;
  isWatching: boolean;
  executionProgress: number; // 0-100
  error: string | null;
  isHandoff: boolean; // handoff 状態
  handoffGuidance: HandoffGuidance | null; // handoff 時の guidance
}

interface SlideSliceActions {
  setProject: (path: string | null) => void;
  setSyncStatus: (status: SyncStatus) => void;
  setSyncDirection: (direction: SyncDirection) => void;
  setSyncProgress: (
    progress: { percent: number; message: string } | null,
  ) => void;
  setSyncError: (error: { code: string; message: string } | null) => void;
  setPhase: (phase: SkillPhase | "idle") => void;
  setWatching: (isWatching: boolean) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  setHandoff: (isHandoff: boolean, guidance: HandoffGuidance | null) => void;
  reset: () => void;
}
```

### 個別セレクタ（P31/P48 対策）

```typescript
// スカラーセレクタ（P48 リスクなし）
export const useSyncStatus = () => useSlideStore((s) => s.syncStatus);
export const useSyncDirection = () => useSlideStore((s) => s.syncDirection);
export const useIsWatching = () => useSlideStore((s) => s.isWatching);
export const useExecutionProgress = () =>
  useSlideStore((s) => s.executionProgress);
export const useCurrentPhase = () => useSlideStore((s) => s.currentPhase);
export const useProjectPath = () => useSlideStore((s) => s.projectPath);
export const useIsHandoff = () => useSlideStore((s) => s.isHandoff);

// オブジェクトセレクタ（useShallow 適用: P48 対策）
export const useSyncProgress = () =>
  useSlideStore(useShallow((s) => s.syncProgress));
export const useSyncError = () => useSlideStore(useShallow((s) => s.syncError));
export const useHandoffGuidance = () =>
  useSlideStore(useShallow((s) => s.handoffGuidance));

// 派生セレクタ（スカラー値、P48 リスクなし）
export const useIsExecuting = () =>
  useSlideStore((s) => s.currentPhase !== "idle");
export const useHasProject = () => useSlideStore((s) => s.projectPath !== null);

// アクションセレクタ（参照安定）
export const useSetSyncStatus = () => useSlideStore((s) => s.setSyncStatus);
export const useSetHandoff = () => useSlideStore((s) => s.setHandoff);
export const useResetSlide = () => useSlideStore((s) => s.reset);
```

### SyncStatus 型の統一

正本仕様に合わせて `"out-of-sync"` → `"idle"` に変更:

```typescript
// 変更前（packages/shared/src/slide/types.ts）
type SyncStatus = "synced" | "out-of-sync" | "syncing" | "error";

// 変更後
type SyncStatus = "idle" | "syncing" | "synced" | "error";
```

影響範囲: `SyncStatusIndicator.tsx` の STATUS_CONFIG、`store.ts` のデフォルト値

---

## T-2-4: Direct SDK 排除設計（Concern 4: Security）

### agent-client.ts 廃止の影響分析

| 影響ファイル                          | 影響度 | 変更内容                                                     |
| ------------------------------------- | ------ | ------------------------------------------------------------ |
| skill-executor.ts                     | 高     | `getAgentAPI()` 廃止 → `IAuthKeyService.getKey()` + SDK 統合 |
| modifier-skill.ts                     | 高     | **ファイル廃止** → prompt 構成を skill-executor に統合       |
| `__tests__/agent-client.test.ts`      | 高     | **テスト廃止** → skill-executor.test.ts に移植               |
| `__tests__/modifier-skill.test.ts`    | 高     | **テスト廃止** → skill-executor.test.ts に統合               |
| `__tests__/skill-executor.test.ts`    | 中     | `vi.mock("../agent-client")` 削除 → DI モック差替            |
| `__tests__/sdk-integration.test.ts`   | 中     | agent-client 経由の SDK テスト → skill-executor 経由に改修   |
| `__tests__/slide-integration.test.ts` | 中     | agent-client mock → skill-executor DI mock                   |

### 型変更

`@repo/shared` の `SkillExecutionResult` に `isHandoff?: boolean` と `guidance?: HandoffGuidance` を追加。

---

## T-2-5: IPC セキュリティ設計

### validateIpcSender 適用テーブル

| チャネル（正本名）   | 方向          | validateIpcSender | P42 3段バリデーション | detectPathTraversal |
| -------------------- | ------------- | ----------------- | --------------------- | ------------------- |
| `slide:executePhase` | Renderer→Main | 適用              | phase 引数に適用      | projectPath に適用  |
| `slide:watch-start`  | Renderer→Main | 適用              | projectPath に適用    | projectPath に適用  |
| `slide:watch-stop`   | Renderer→Main | 適用              | projectPath に適用    | projectPath に適用  |
| `slide:sync-status`  | Renderer→Main | 適用              | projectPath に適用    | projectPath に適用  |
| `slide:reverse-sync` | Renderer→Main | 適用              | projectPath に適用    | projectPath に適用  |
| `slide:cancel`       | Renderer→Main | 適用              | N/A                   | N/A                 |

### セキュリティ検証順序

```typescript
ipcMain.handle("slide:watch-start", async (event, projectPath: string) => {
  // 1. sender 検証
  const validation = validateIpcSender(event, "slide:watch-start", {
    getAllowedWindows: () => [mainWindow],
  });
  if (!validation.valid) return toIPCValidationError(validation);

  // 2. P42 3段バリデーション
  if (
    typeof projectPath !== "string" ||
    projectPath === "" ||
    projectPath.trim() === ""
  ) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "projectPath is required" },
    };
  }

  // 3. パストラバーサル検出
  if (detectPathTraversal(projectPath)) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "invalid path" },
    };
  }

  // 4. ビジネスロジック委譲
  return syncManager.startWatching(projectPath.trim());
});
```

### Preload Whitelist 追加

```typescript
// ALLOWED_INVOKE_CHANNELS に追加
("slide:executePhase",
  "slide:watch-start",
  "slide:watch-stop",
  "slide:sync-status",
  "slide:reverse-sync",
  "slide:cancel");

// ALLOWED_ON_CHANNELS に追加
("slide:sync-status-changed",
  "slide:sync-progress",
  "slide:sync-error",
  "slide:structureChanged");
```

---

## T-2-6: IPC チャネル名統一設計

### Rename テーブル

| 種別   | 現行名                    | 正本名（統一後）            | 影響ファイル                                     |
| ------ | ------------------------- | --------------------------- | ------------------------------------------------ |
| invoke | `slide:startWatching`     | `slide:watch-start`         | ipc-handlers.ts, channels.ts, useSlideProject.ts |
| invoke | `slide:stopWatching`      | `slide:watch-stop`          | 同上                                             |
| invoke | `slide:manualSync`        | `slide:reverse-sync`        | 同上                                             |
| invoke | `slide:getSyncStatus`     | `slide:sync-status`         | 同上                                             |
| push   | `slide:syncStatusChanged` | `slide:sync-status-changed` | ipc-handlers.ts, channels.ts, useSlideProject.ts |
| push   | `slide:executionProgress` | `slide:execution-progress`  | 同上                                             |
| 新規   | -                         | `slide:sync-error`          | ipc-handlers.ts, channels.ts, store.ts           |
| 新規   | -                         | `slide:watch-status`        | ipc-handlers.ts, channels.ts, store.ts           |

### channels.ts 定数定義（設計）

```typescript
export const SLIDE_IPC_CHANNELS = {
  // invoke (Renderer → Main)
  EXECUTE_PHASE: "slide:executePhase",
  WATCH_START: "slide:watch-start",
  WATCH_STOP: "slide:watch-stop",
  SYNC_STATUS: "slide:sync-status",
  REVERSE_SYNC: "slide:reverse-sync",
  CANCEL: "slide:cancel",
  // push (Main → Renderer)
  SYNC_STATUS_CHANGED: "slide:sync-status-changed",
  SYNC_PROGRESS: "slide:sync-progress",
  SYNC_ERROR: "slide:sync-error",
  EXECUTION_PROGRESS: "slide:execution-progress",
  STRUCTURE_CHANGED: "slide:structureChanged",
  WATCH_STATUS: "slide:watch-status",
} as const;
```

---

## T-2-7: UI/UX 設計（Concern 4: User-facing Surface）

### 4 領域コンポーネント

| 領域                     | コンポーネント       | 表示条件                       | Primary CTA | Secondary CTA    |
| ------------------------ | -------------------- | ------------------------------ | ----------- | ---------------- |
| Sync Card                | `SlideSyncCard`      | 常時表示                       | 状態依存    | 状態依存         |
| Progress Row             | `SlideProgressRow`   | `running` 時のみ               | キャンセル  | -                |
| Watch Status             | `SlideWatchStatus`   | プロジェクト選択時             | -           | -                |
| Manual Fallback Guidance | `SlideGuidanceBlock` | `degraded` / `guidance` 時のみ | 状態依存    | ターミナルで実行 |

### 状態 → CTA マッピング

| 状態       | Badge                          | Primary CTA    | Secondary CTA      |
| ---------- | ------------------------------ | -------------- | ------------------ |
| `synced`   | 「同期済み」(systemGreen)      | 同期を実行     | ウォッチ状態を確認 |
| `running`  | 「同期中...」(systemBlue)      | キャンセル     | -                  |
| `degraded` | 「同期失敗」(systemOrange)     | 再試行         | ターミナルで実行   |
| `guidance` | 「設定が必要です」(systemBlue) | API キーを設定 | ターミナルを開く   |

### マイクロコピー原則

- **degraded**: 「いま何が失敗しているか」+「次に手動で何をするか」を同一ブロックに配置
- **guidance**: 設定手順を1-3ステップで明示し、Primary CTA で設定画面へ遷移

### Persistent Terminal Launcher

- 全状態で SlideWorkspace 右下に固定表示
- degraded 時: systemOrange border でハイライト
- guidance 時: systemBlue border で prominent 表示

---

## Concern / AC 対応マトリクス

| Concern                 | 主タスク            | 閉じる AC        |
| ----------------------- | ------------------- | ---------------- |
| Runtime Routing         | T-2-1, T-2-4        | AC-1, AC-3       |
| Lifecycle Orchestration | T-2-2               | AC-1, AC-2       |
| IPC / State / Security  | T-2-3, T-2-5, T-2-6 | AC-2, AC-4, AC-5 |
| UI / UX                 | T-2-7               | AC-6             |

---

## 完了条件照合

| 条件                                                                           | 充足 |
| ------------------------------------------------------------------------------ | ---- |
| shared runtime policy が slide reverse-sync / modifier / legacy agent まで定義 | Yes  |
| agent-client.ts 廃止の影響分析完了、全呼び出し元の移行先明記                   | Yes  |
| direct SDK read 排除と UI surface の責務分離が明文化                           | Yes  |
| IPC チャネル名が正本仕様に統一（4 チャネル rename + push 衝突解決）            | Yes  |
| validateIpcSender + P42 + パストラバーサル検出が全チャネルに設計               | Yes  |
| slide sync / degraded / manual fallback の UI 状態が 4 領域定義                | Yes  |
| Zustand slideSlice の型定義と個別セレクタ設計（P31/P48 対策）                  | Yes  |
| ModifierSkill の二重実装解消方針が明記                                         | Yes  |
