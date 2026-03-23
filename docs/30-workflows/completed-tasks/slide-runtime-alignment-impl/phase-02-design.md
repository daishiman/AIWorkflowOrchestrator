# Phase 2: 設計

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 2                            |
| 機能名 | slide-runtime-alignment-impl |
| 作成日 | 2026-03-22                   |
| Issue  | #1363                        |

## 目的

Phase 1 で特定した 6 件の drift（D1-D6）を解消するためのアーキテクチャ設計を行い、実装ウェーブとインターフェースを定義する。

## 設計方針

### 実装ウェーブ戦略

drift 間の依存関係を考慮し、3 ウェーブで段階的に統合する。各ウェーブは独立して typecheck・テスト可能な粒度とする。

```
Wave A: IPC 接続 + チャネル統一（D1, D2, D5）
  → Wave B: RuntimeResolver 統合（D3, D4）
    → Wave C: Store fields + legacy 廃止（D6, agent-client.ts 除去）
```

**根拠**: チャネル名とセキュリティ（Wave A）を先に確定すれば、RuntimeResolver（Wave B）の実装時に IPC 契約が安定する。Store fields（Wave C）は Renderer 側変更が集中するため最後に回す。

---

## Wave A: IPC 接続 + チャネル統一 + セキュリティ

### A-1: チャネル定数の rename

**対象ファイル**: `apps/desktop/src/main/slide/ipc-handlers.ts`

```typescript
// Before (legacy)
const SLIDE_IPC_CHANNELS = {
  EXECUTE_PHASE: "slide:executePhase",
  START_WATCHING: "slide:startWatching",
  STOP_WATCHING: "slide:stopWatching",
  GET_SYNC_STATUS: "slide:getSyncStatus",
  MANUAL_SYNC: "slide:manualSync",
  CANCEL_EXECUTION: "slide:cancelExecution",
  STRUCTURE_CHANGED: "slide:structureChanged",
  SYNC_STATUS_CHANGED: "slide:syncStatusChanged",
  EXECUTION_PROGRESS: "slide:executionProgress",
};

// After (canonical 12 channels)
// invoke (Renderer → Main): 6本
const SLIDE_INVOKE_CHANNELS = {
  EXECUTE_PHASE: "slide:executePhase", // 据え置き
  WATCH_START: "slide:watch-start", // rename
  WATCH_STOP: "slide:watch-stop", // rename
  SYNC_STATUS: "slide:sync-status", // rename
  REVERSE_SYNC: "slide:reverse-sync", // rename (manualSync → reverse-sync)
  CANCEL: "slide:cancel", // rename
} as const;

// push (Main → Renderer): 6本
const SLIDE_PUSH_CHANNELS = {
  SYNC_STATUS_CHANGED: "slide:sync-status-changed",
  SYNC_PROGRESS: "slide:sync-progress", // 新規
  SYNC_ERROR: "slide:sync-error", // 新規
  EXECUTION_PROGRESS: "slide:execution-progress", // rename
  STRUCTURE_CHANGED: "slide:structureChanged", // 据え置き
  WATCH_STATUS: "slide:watch-status", // 新規
} as const;
```

**同期対象**: `apps/desktop/src/preload/channels.ts` の `IPC_CHANNELS` 定数も同一文字列へ rename する。

### A-2: Main IPC index への接続

**対象ファイル**: `apps/desktop/src/main/ipc/index.ts`

```typescript
// registerAllIpcHandlers() 内に追加
import { registerSlideIpcHandlers } from "../slide/ipc-handlers";

export function registerAllIpcHandlers(mainWindow: BrowserWindow): void {
  // ... 既存 handler 登録 ...
  registerSlideIpcHandlers(mainWindow);
}

export function unregisterAllIpcHandlers(): void {
  // ... 既存 handler 解除 ...
  unregisterSlideIpcHandlers();
}
```

### A-3: validateIpcSender + P42 + path guard

**対象ファイル**: `apps/desktop/src/main/slide/ipc-handlers.ts`

**validateSlideRequest 2バリアント設計**:

```typescript
// projectPath なしハンドラ用（watch-stop, cancel）
function validateSlideSenderOnly(
  event: IpcMainInvokeEvent,
  channel: string,
  mainWindow: BrowserWindow,
): void;

// projectPath ありハンドラ用（executePhase, watch-start, sync-status, reverse-sync）
function validateSlideRequestWithPath(
  event: IpcMainInvokeEvent,
  channel: string,
  projectPath: string,
  mainWindow: BrowserWindow,
): IpcValidationResult;
```

全 6 invoke ハンドラに以下の検証順序を適用:

```typescript
ipcMain.handle(
  SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE,
  async (event, phase: string, projectPath: string) => {
    // 1. sender 検証
    validateIpcSender(event, "slide:executePhase", {
      getAllowedWindows: () => [mainWindow],
    });

    // 2. P42 3段バリデーション (phase)
    if (typeof phase !== "string" || phase.trim() === "") {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "phase must be a non-empty string",
        },
      };
    }

    // 3. P42 3段バリデーション (projectPath)
    if (typeof projectPath !== "string" || projectPath.trim() === "") {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "projectPath must be a non-empty string",
        },
      };
    }

    // 4. path traversal guard
    if (detectPathTraversal(projectPath)) {
      return {
        success: false,
        error: { code: "SECURITY_ERROR", message: "Invalid path" },
      };
    }

    // 5. business logic
    try {
      const result = await skillExecutor.execute(
        phase as SkillPhase,
        projectPath.trim(),
      );
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: sanitizeError(error) };
    }
  },
);
```

---

## Wave B: RuntimeResolver 統合

### B-1: skill-executor.ts への RuntimeResolver 統合

**対象ファイル**: `apps/desktop/src/main/slide/skill-executor.ts`

```typescript
// RuntimeResolver のインターフェース（参考）
interface RuntimeResolver {
  resolve(surface: string, phase: string): Promise<"integrated" | "handoff">;
  getClient(surface: string, phase: string): Promise<RuntimeClient>;
  getHandoffReason(surface: string, phase: string): string;
}

interface RuntimeClient {
  complete(prompt: string): Promise<string>;
}
```

```typescript
import { RuntimeResolver } from "../runtime/runtime-resolver";

export interface SkillExecutor {
  execute(
    phase: SkillPhase,
    projectPath: string,
  ): Promise<SkillExecutionResult>;
  cancel(): void;
  onProgress(callback: (progress: number) => void): void;
  isExecuting(): boolean;
}

// SkillExecutionResult に handoff 情報を追加
export interface SkillExecutionResult {
  success: boolean;
  phase: SkillPhase;
  // handoff 拡張
  isHandoff?: boolean;
  guidance?: HandoffGuidance;
  error?: { code: string; message: string };
}
```

**RuntimeResolver 分岐ロジック**:

```typescript
async function execute(
  phase: SkillPhase,
  projectPath: string,
): Promise<SkillExecutionResult> {
  const runtimeMode = await RuntimeResolver.resolve("slide", phase);

  if (runtimeMode === "integrated") {
    // SDK を RuntimeResolver 経由で呼び出す（agent-client.ts の直接呼び出しを置換）
    return executeIntegrated(phase, projectPath);
  } else {
    // handoff: terminal launcher 用の guidance を返す
    return {
      success: true,
      phase,
      isHandoff: true,
      guidance: buildHandoffGuidance(phase, projectPath),
    };
  }
}
```

### B-2: modifier-skill.ts の統合

`modifier-skill.ts` の `buildModifierPrompt()` と `parseModifierResponse()` を `skill-executor.ts` の `phase === "modifier"` 分岐内で呼び出す形に統合する。

```typescript
// skill-executor.ts 内
async function executeIntegrated(
  phase: SkillPhase,
  projectPath: string,
): Promise<SkillExecutionResult> {
  if (phase === "modifier") {
    // modifier-skill.ts のロジックを統合
    const context = await buildModifierContext(projectPath);
    const prompt = buildModifierPrompt(context);
    const response = await runtimeClient.complete(prompt);
    const parsed = parseModifierResponse(response);
    return { success: true, phase, data: parsed };
  }
  // ... 他の phase 処理
}
```

**統合後の modifier-skill.ts**: `buildModifierPrompt()` と `parseModifierResponse()` のみ export し、他の責務は `skill-executor.ts` に移管。ファイル自体は utility として残す。

---

## Wave C: Store fields + legacy 廃止

### C-1: slideSlice store fields 追加

**対象ファイル**: Renderer 側 slideSlice（Zustand store）

```typescript
// 正本 7 fields
interface SlideSliceState {
  // 既存
  syncStatus: SyncStatus; // "synced" | "out-of-sync" | "syncing" | "error"
  isWatching: boolean;
  // 新規追加
  syncDirection: SyncDirection; // "forward" | "reverse"
  syncProgress: { percent: number; message: string } | null;
  syncError: { code: string; message: string } | null;
  isHandoff: boolean;
  handoffGuidance: HandoffGuidance | null;
}
```

**selector 方針（P48 対策）**:

- scalar: 個別 selector（`useSyncStatus()`, `useIsHandoff()` 等）
- object: `useShallow` 適用（`useSyncProgress()`, `useHandoffGuidance()`）

### C-2: agent-client.ts legacy path 廃止

`agent-client.ts` から以下を除去:

1. `@anthropic-ai/sdk` の直接 import
2. `electron-store` の直接利用（`Store<{ anthropic_api_key?: string }>`）
3. `safeStorage` の直接利用
4. `process.env.ANTHROPIC_API_KEY` の env fallback

代替として RuntimeResolver 経由の呼び出しに置換。`agent-client.ts` の `getAgentAPI()` は `skill-executor.ts` の `executeIntegrated()` に吸収されるため、最終的にファイル自体を廃止候補とする。

### C-3: 共有型の追加

**対象ファイル**: `packages/shared/src/slide/types.ts`

```typescript
export interface HandoffGuidance {
  command: string; // terminal で実行するコマンド
  contextSummary: string; // コンテキスト要約
  reason: string; // handoff の理由
}
```

---

## レスポンス形式統一

全 slide IPC ハンドラは以下の wrapper 形式で応答する（P60 対策）:

```typescript
// 成功
{ success: true, data: T }

// 失敗
{ success: false, error: { code: string, message: string } }
```

---

## ファイル変更マトリクス

| ファイル                       | Wave A            | Wave B                 | Wave C      |
| ------------------------------ | ----------------- | ---------------------- | ----------- |
| `main/ipc/index.ts`            | 登録追加          | -                      | -           |
| `main/slide/ipc-handlers.ts`   | rename + security | handler 内ロジック変更 | -           |
| `main/slide/skill-executor.ts` | -                 | RuntimeResolver 統合   | -           |
| `main/slide/agent-client.ts`   | -                 | -                      | 廃止        |
| `main/slide/modifier-skill.ts` | -                 | utility 化             | -           |
| `preload/channels.ts`          | rename            | -                      | -           |
| `preload/index.ts`             | channel 参照更新  | -                      | -           |
| `shared/slide/types.ts`        | -                 | HandoffGuidance 追加   | -           |
| Renderer slideSlice            | -                 | -                      | fields 追加 |

---

## リスク対策

| リスク                                    | 影響度 | 対策                                                         |
| ----------------------------------------- | ------ | ------------------------------------------------------------ |
| rename 漏れ（3層同期ミス）                | 高     | Wave A でチャネル定数化→3層を同 wave で更新。grep で残存確認 |
| RuntimeResolver 導入で既存 sync path 破壊 | 高     | Wave B 前に integrated/handoff の targeted test を追加       |
| P48 slideSlice selector 無限ループ        | 中     | object 返却 selector に `useShallow` 必須適用                |

## 統合テスト連携

Phase 4 で各 Wave に対応するテストを設計:

- Wave A: channel rename 後の IPC 疎通テスト + validateIpcSender テスト
- Wave B: RuntimeResolver 分岐テスト + handoff guidance テスト
- Wave C: slideSlice store fields テスト

## 完了条件

- [ ] 3 Wave の設計が完了し、各 Wave の対象ファイル・変更内容が明確
- [ ] ファイル変更マトリクスに全対象ファイルが記載されている
- [ ] リスク対策が全リスクに対して定義されている

## 次のPhase

Phase 3（設計レビュー）へ進む。
