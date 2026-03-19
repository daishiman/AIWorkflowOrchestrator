# Phase 2: 契約一覧

## メタ情報

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| タスクID | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 |
| Phase    | 2                                       |
| 作成日   | 2026-03-19                              |

---

## IPC 契約マトリクス

### invoke チャネル（Renderer → Main）

| チャネル名（統一後） | 引数                                | レスポンス型                            | validateIpcSender | P42 | pathGuard |
| -------------------- | ----------------------------------- | --------------------------------------- | ----------------- | --- | --------- |
| `slide:executePhase` | `(phase: SkillPhase, path: string)` | `SlideResponse<SkillExecutionResult>`   | Yes               | Yes | Yes       |
| `slide:watch-start`  | `(projectPath: string)`             | `SlideResponse<{ watching: boolean }>`  | Yes               | Yes | Yes       |
| `slide:watch-stop`   | `(projectPath: string)`             | `SlideResponse<void>`                   | Yes               | Yes | Yes       |
| `slide:sync-status`  | `(projectPath: string)`             | `SlideResponse<{ status: SyncStatus }>` | Yes               | Yes | Yes       |
| `slide:reverse-sync` | `(projectPath: string)`             | `SlideResponse<SkillExecutionResult>`   | Yes               | Yes | Yes       |
| `slide:cancel`       | `()`                                | `SlideResponse<void>`                   | Yes               | N/A | N/A       |

### push チャネル（Main → Renderer）

| チャネル名（統一後）        | Payload 型                                         | Authority     | Zustand 反映先                |
| --------------------------- | -------------------------------------------------- | ------------- | ----------------------------- |
| `slide:sync-status-changed` | `{ status: SyncStatus, direction: SyncDirection }` | SyncManager   | `syncStatus`, `syncDirection` |
| `slide:sync-progress`       | `{ percent: number, message: string }`             | SyncManager   | `syncProgress`                |
| `slide:sync-error`          | `{ code: string, message: string }`                | SyncManager   | `syncError`                   |
| `slide:execution-progress`  | `{ progress: number }`                             | SkillExecutor | `executionProgress`           |
| `slide:structureChanged`    | `{ changes: StructureChange[] }`                   | FileWatcher   | (event handler)               |
| `slide:watch-status`        | `{ watching: boolean, path: string }`              | FileWatcher   | `isWatching`                  |

---

## Runtime 契約

### RuntimeResolver 分岐

| 入力条件                    | 出力         | slide 経路での処理                    |
| --------------------------- | ------------ | ------------------------------------- |
| authMode=api-key, key=valid | `integrated` | IAuthKeyService.getKey() → SDK → 実行 |
| authMode=api-key, key=null  | `handoff`    | guidance UI + terminal handoff CTA    |
| authMode=subscription       | `handoff`    | guidance UI + terminal handoff CTA    |

### SkillExecutionResult 拡張型

```typescript
interface SkillExecutionResult {
  phase: SkillPhase;
  success: boolean;
  output?: string;
  error?: string;
  duration: number;
  changes?: StructureChange[];
  direction?: SyncDirection;
  projectPath?: string;
  retryCount?: number;
  // 追加フィールド
  isHandoff?: boolean;
  guidance?: HandoffGuidance;
}
```

---

## State 契約

### Zustand slideSlice フィールド一覧

| フィールド        | 型                                             | デフォルト値 | Authority     | 新規/既存  |
| ----------------- | ---------------------------------------------- | ------------ | ------------- | ---------- |
| projectPath       | `string \| null`                               | `null`       | User Action   | 既存       |
| syncStatus        | `SyncStatus`                                   | `"idle"`     | SyncManager   | 既存(変更) |
| syncDirection     | `SyncDirection`                                | `"forward"`  | SyncManager   | **新規**   |
| syncProgress      | `{ percent: number; message: string } \| null` | `null`       | SyncManager   | **新規**   |
| syncError         | `{ code: string; message: string } \| null`    | `null`       | SyncManager   | **新規**   |
| currentPhase      | `SkillPhase \| "idle"`                         | `"idle"`     | SkillExecutor | 既存       |
| lastSyncAt        | `Date \| null`                                 | `null`       | SyncManager   | 既存       |
| isWatching        | `boolean`                                      | `false`      | FileWatcher   | 既存       |
| executionProgress | `number`                                       | `0`          | SkillExecutor | 既存       |
| error             | `string \| null`                               | `null`       | Any           | 既存       |
| isHandoff         | `boolean`                                      | `false`      | SkillExecutor | **新規**   |
| handoffGuidance   | `HandoffGuidance \| null`                      | `null`       | SkillExecutor | **新規**   |

---

## Security 契約

### 検証順序（全チャネル共通）

```
1. validateIpcSender(event, channel, { getAllowedWindows })
2. P42 3段バリデーション (typeof → === "" → .trim() === "")
3. detectPathTraversal(projectPath)
4. ビジネスロジック委譲 (SyncManager / SkillExecutor)
5. エラーサニタイズ (内部情報を漏洩しない)
```

### Preload Whitelist

| リスト                  | 追加チャネル                                                                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| ALLOWED_INVOKE_CHANNELS | `slide:executePhase`, `slide:watch-start`, `slide:watch-stop`, `slide:sync-status`, `slide:reverse-sync`, `slide:cancel`                           |
| ALLOWED_ON_CHANNELS     | `slide:sync-status-changed`, `slide:sync-progress`, `slide:sync-error`, `slide:execution-progress`, `slide:structureChanged`, `slide:watch-status` |

---

## DI 契約

### インターフェース依存（P61 対策）

| 登録関数                       | 引数型（Port/Interface）              | 具象クラスへの直接依存 |
| ------------------------------ | ------------------------------------- | ---------------------- |
| `registerSlideIpcHandlers`     | `ISyncManager`, `ISkillExecutor`      | なし                   |
| `SyncManager` コンストラクタ   | `IFileWatcher`, `ISkillExecutor`      | なし                   |
| `SkillExecutor` コンストラクタ | `IAuthKeyService`, `IAuthModeService` | なし                   |

### 廃止モジュール

| モジュール        | 廃止理由                                   | 移行先            |
| ----------------- | ------------------------------------------ | ----------------- |
| agent-client.ts   | Direct SDK / electron-store / env fallback | skill-executor.ts |
| modifier-skill.ts | 孤立コード / skill-executor と二重実装     | skill-executor.ts |
