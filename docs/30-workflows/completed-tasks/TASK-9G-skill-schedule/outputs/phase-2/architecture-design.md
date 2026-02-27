# Phase 2 成果物: アーキテクチャ設計書

## メタ情報

| 項目      | 値                                                 |
| --------- | -------------------------------------------------- |
| Phase     | 2                                                  |
| 機能名    | TASK-9G-skill-schedule                             |
| 作成日    | 2026-02-27                                         |
| 前提Phase | Phase 1: 要件定義                                  |
| 成果物    | `outputs/phase-2/architecture-design.md`（本文書） |
| 状態      | 完了                                               |

---

## 1. システムアーキテクチャ概要

### 1.1 Electron 3プロセスモデル統合

スキルスケジュール機能は、Electron の 3 プロセスモデル（Main / Preload / Renderer）に準拠して設計する。スケジュール管理の全てのビジネスロジックとタイマー管理は Main Process に配置し、Renderer とは IPC 経由でのみ通信する。

```
┌──────────────────────────────────────────────────────────────┐
│                        Main Process                          │
│                                                              │
│  ┌────────────────────┐  ┌─────────────────┐  ┌──────────┐  │
│  │  SkillScheduler    │─>│  ScheduleStore  │─>│electron- │  │
│  │                    │  │  (in-memory +   │  │store JSON│  │
│  │ - activeJobs Map   │  │   persist())    │  └──────────┘  │
│  │ - initialize()     │  │ - getAll()      │                 │
│  │ - addSchedule()    │  │ - add()         │  ┌──────────┐  │
│  │ - enableSchedule() │  │ - addRunResult()│  │Scheduler │  │
│  │ - disableSchedule()│  │ - delete()      │  │SkillExec │  │
│  │ [Constructor DI]   │  └─────────────────┘  │(interface)│  │
│  └───────┬────────────┘                       └────┬─────┘  │
│          │                                         │         │
│  ┌───────▼─────────────────────────────────────────▼──────┐  │
│  │         Schedule IPC Handlers (skillHandlers.ts内)      │  │
│  │  skill:schedule:list / add / update / delete / toggle   │  │
│  └────────────────────────┬────────────────────────────────┘  │
│                           │ ipcMain.handle()                  │
└───────────────────────────┼──────────────────────────────────┘
                            │ IPC (contextBridge)
┌───────────────────────────┼──────────────────────────────────┐
│                   Preload │ (contextBridge)                   │
│  ┌────────────────────────▼────────────────────────────────┐  │
│  │  skillAPI.schedule                                      │  │
│  │  - list()  / add()  / update()  / delete()  / toggle() │  │
│  │  (safeInvoke / safeInvokeUnwrap)                        │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────┬──────────────────────────────────┘
                            │ window.electronAPI.skill.schedule
┌───────────────────────────▼──────────────────────────────────┐
│                      Renderer Process                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  React UI Components（本タスクのスコープ外）              │ │
│  │  - ScheduleList / ScheduleDialog / CronEditor            │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### 1.2 レイヤー依存方向

```
Renderer → Preload (contextBridge) → IPC Handler → SkillScheduler → ScheduleStore
                                                  → SchedulerSkillExecutor (interface)
```

- 上位層から下位層への**一方向依存**を厳守
- Renderer から Node.js API（`node-cron`, `setInterval`）を直接使用しない
- SkillExecutor は `SchedulerSkillExecutor` インターフェース経由の Constructor DI で注入し、BrowserWindow への直接依存を排除

---

## 2. コンポーネント図

### 2.1 コンポーネント関係図

```
┌─────────────────────────────────────────────────────────────────┐
│                         Main Process                             │
│                                                                  │
│  ┌──────────────────────────────────────────────┐                │
│  │          SkillScheduler                       │                │
│  │                                              │                │
│  │  ┌──────────────────────────────┐            │                │
│  │  │ activeJobs                    │            │                │
│  │  │ Map<string, ActiveJob>        │            │                │
│  │  │  type: "cron"|"interval"|     │            │                │
│  │  │        "timeout"              │            │                │
│  │  └──────────────────────────────┘            │                │
│  │                                              │                │
│  │  [Constructor DI]   [Constructor DI]         │                │
│  │  ┌──────────────┐  ┌──────────────────────┐  │                │
│  │  │ScheduleStore │  │SchedulerSkillExecutor│  │                │
│  │  └──────┬───────┘  └────────┬─────────────┘  │                │
│  └─────────┼───────────────────┼────────────────┘                │
│            │                   │                                 │
│            ▼                   ▼                                 │
│  ┌─────────────────┐  ┌─────────────────────┐                    │
│  │  ScheduleStore   │  │ SkillExecutor       │                    │
│  │  (electron-store) │  │ (implements         │                    │
│  │  in-memory cache │  │  SchedulerSkill-    │                    │
│  │  + persist()     │  │  Executor interface)│                    │
│  └───────────────────┘  └─────────────────────┘                    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  skillHandlers.ts（既存ファイルに統合）                    │    │
│  │  registerSkillScheduleHandlers() /                        │    │
│  │  unregisterSkillScheduleHandlers()                        │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2 ファイル配置

| ファイル                                                 | 責務                                         |
| -------------------------------------------------------- | -------------------------------------------- |
| `packages/shared/src/types/skill-schedule.ts`            | 共有型定義                                   |
| `packages/shared/src/types/index.ts`                     | re-export 追加                               |
| `apps/desktop/src/main/services/skill/SkillScheduler.ts` | スケジュール管理サービス                     |
| `apps/desktop/src/main/services/skill/ScheduleStore.ts`  | 永続化ストア                                 |
| `apps/desktop/src/main/ipc/skillHandlers.ts`             | IPC ハンドラ登録・解除（既存ファイルに統合） |
| `apps/desktop/src/preload/channels.ts`                   | チャンネル定数追加                           |
| `apps/desktop/src/preload/skill-api.ts`                  | schedule メソッド追加                        |
| `apps/desktop/src/preload/types.ts`                      | SkillAPI schedule 型追加                     |

---

## 3. データフロー図

### 3.1 Cron スケジュール

```
[追加時]
Renderer                 Preload                  Handler                SkillScheduler          ScheduleStore
   │                        │                        │                       │                       │
   │─ schedule.add({        │                        │                       │                       │
   │   type:"cron",         │                        │                       │                       │
   │   cronExpression:...}) │                        │                       │                       │
   │───────────────────────>│── safeInvokeUnwrap ───>│                       │                       │
   │                        │                        │─ validateIpcSender ──>│                       │
   │                        │                        │─ P42 validate ───────>│                       │
   │                        │                        │─ addSchedule() ──────>│                       │
   │                        │                        │                       │── UUID生成            │
   │                        │                        │                       │── cron.validate()     │
   │                        │                        │                       │── calculateNextRun()  │
   │                        │                        │                       │── store.add() ───────>│
   │                        │                        │                       │                       │── JSON書込
   │                        │                        │                       │<─ ok ────────────────│
   │                        │                        │                       │── cron.schedule()               │
   │                        │                        │                       │── activeJobs.set(id,{type:"cron"})│
   │                        │                        │<─ ScheduledSkill ────│                       │
   │                        │<─ { success, data } ──│                       │                       │
   │<─ ScheduledSkill ─────│                        │                       │                       │

[実行時]
   node-cron callback                               SkillScheduler          SkillExecutor
        │                                                │                       │
        │── タイマー発火 ──────────────────────────────>│                       │
        │                                                │── buildRunResult()    │
        │                                                │── execute() ─────────>│
        │                                                │                       │── スキル実行
        │                                                │<─ result ────────────│
        │                                                │── store.addRunResult()│
        │                                                │── nextRun 再計算      │
        │                                                │── store.update()      │
```

### 3.2 Interval スケジュール

```
[追加時]
SkillScheduler
   │── setInterval(callback, interval)
   │── activeJobs.set(id, {type:"interval", ref})
   │── nextRun = now + interval
   │── store に保存

[実行時]
   setInterval callback
        │── executeScheduledSkill(schedule)
        │── store.addRunResult()
        │── nextRun = now + interval
        │── store.update()
```

### 3.3 Once スケジュール

```
[追加時]
SkillScheduler
   │── delay = new Date(runAt).getTime() - Date.now()
   │── if (delay <= 0) break  // 過去の日時は実行しない
   │── setTimeout(callback, delay)
   │── activeJobs.set(id, {type:"timeout", ref})
   │── nextRun = runAt
   │── store に保存

[実行時]
   setTimeout callback
        │── executeScheduledSkill(schedule)
        │── store.addRunResult()
        │── disableSchedule()（1回限り実行後に自動無効化）
```

### 3.4 Event スケジュール

```
[app_start]
SkillScheduler.activateSchedule() → registerEventListener()
   │── event === "app_start" の場合: 即座に executeScheduledSkill()
   │── store.addRunResult() で履歴記録

[file_change / git_commit]
SkillScheduler.registerEventListener(schedule)
   │── プレースホルダー実装（将来的にファイルウォッチャー / git hook と連携）
```

---

## 4. クラス設計

### 4.1 SkillScheduler

> **実装判断**: 設計時はSetter Injectionパターン（P34対策）を予定していたが、実装では`SchedulerSkillExecutor`インターフェースによるConstructor DIを採用。BrowserWindowへの直接依存を避け、インターフェースを介した疎結合を実現した。

```typescript
// apps/desktop/src/main/services/skill/SkillScheduler.ts

import * as cron from "node-cron";
import type { ScheduledTask } from "node-cron";
import { randomUUID } from "crypto";
import type {
  ScheduledSkill,
  SkillSchedule,
  ScheduledRunResult,
} from "@repo/shared";
import type { ScheduleStore } from "./ScheduleStore";

/** SkillExecutor のうちスケジューラが必要とするインターフェース */
export interface SchedulerSkillExecutor {
  execute(
    request: { prompt: string; skillId: string },
    skill: { id: string; name: string; description: string; path: string; anchors: unknown[]; allowedTools?: string[] },
  ): Promise<{ executionId: string; success: boolean; error?: unknown }>;
}

/** アクティブジョブの参照（type discriminatorで統一管理） */
interface ActiveJob {
  type: "cron" | "interval" | "timeout";
  ref: ScheduledTask | ReturnType<typeof setTimeout>;
}

export class SkillScheduler {
  private scheduleStore: ScheduleStore;
  private skillExecutor: SchedulerSkillExecutor;
  private activeJobs: Map<string, ActiveJob> = new Map();

  // ===== Constructor DI =====
  constructor(
    scheduleStore: ScheduleStore,
    skillExecutor: SchedulerSkillExecutor,
  ) {
    this.scheduleStore = scheduleStore;
    this.skillExecutor = skillExecutor;
  }

  // ===== 公開 API =====

  async initialize(): Promise<void>;
  async addSchedule(input: Omit<ScheduledSkill, "id" | "runHistory">): Promise<ScheduledSkill>;
  async updateSchedule(id: string, updates: Partial<ScheduledSkill>): Promise<void>;
  async deleteSchedule(id: string): Promise<void>;
  async enableSchedule(id: string): Promise<void>;
  async disableSchedule(id: string): Promise<void>;
  listSchedules(): ScheduledSkill[];  // 同期メソッド

  // ===== 内部メソッド =====
  private activateSchedule(schedule: ScheduledSkill): void;
  private deactivateSchedule(id: string): void;
  private async executeScheduledSkill(schedule: ScheduledSkill): Promise<void>;
  private buildRunResult(runId: string, startedAt: string, outcome: {...}): ScheduledRunResult;
  private calculateNextRun(schedule: SkillSchedule): Date | undefined;
  private registerEventListener(schedule: ScheduledSkill): void;

  // ===== テスト用 =====
  getActiveJobCount(): number;
  hasActiveJob(id: string): boolean;
}
```

> **toggleSchedule vs enable/disable**: 設計時は`toggleSchedule()`を予定していたが、実装ではIPCハンドラ側でtoggle判定（現在のenabled状態を取得して反転）を行い、`enableSchedule()`と`disableSchedule()`を個別に呼び出すパターンを採用。各メソッドの責務が明確になり、テストが書きやすくなった。

### 4.2 プロパティ詳細

| プロパティ      | 型                       | 初期値         | 説明                                                                    |
| --------------- | ------------------------ | -------------- | ----------------------------------------------------------------------- |
| `scheduleStore` | `ScheduleStore`          | Constructor DI | 永続化ストア（読み書き）                                                |
| `skillExecutor` | `SchedulerSkillExecutor` | Constructor DI | スキル実行サービス（インターフェース経由）                              |
| `activeJobs`    | `Map<string, ActiveJob>` | `new Map()`    | 全種別のジョブ参照（type discriminatorで cron/interval/timeout を区別） |

### 4.3 ScheduleStore

> **実装判断**: 設計時はgetAll()毎にelectron-storeから読み取りP19バリデーションを行う方式だったが、実装ではコンストラクタ時点でP19バリデーション付き復元を行い、インメモリキャッシュ（`private schedules`）で操作する方式を採用。書き込みは`persist()`で一括永続化する。テスト用にDIでelectron-storeインスタンスを注入可能。

```typescript
// apps/desktop/src/main/services/skill/ScheduleStore.ts

import ElectronStore from "electron-store";
import type { ScheduledSkill, ScheduledRunResult } from "@repo/shared";

const MAX_RUN_HISTORY = 100;

interface ScheduleStoreSchema {
  scheduledSkills: ScheduledSkill[];
}

export class ScheduleStore {
  private store: ElectronStore<ScheduleStoreSchema>;
  private schedules: ScheduledSkill[]; // インメモリキャッシュ

  // テスト用にelectron-storeインスタンスをDI可能
  constructor(store?: ElectronStore<ScheduleStoreSchema>) {
    this.store =
      store ??
      new ElectronStore<ScheduleStoreSchema>({
        name: "skill-schedules",
        defaults: { scheduledSkills: [] },
      });

    // P19対策: コンストラクタ時点でバリデーション付き復元
    const raw: unknown = this.store.get("scheduledSkills");
    this.schedules = Array.isArray(raw)
      ? raw.filter(
          (item): item is ScheduledSkill =>
            typeof item === "object" &&
            item !== null &&
            typeof (item as Record<string, unknown>).id === "string",
        )
      : [];
  }

  getAll(): ScheduledSkill[]; // コピーを返す ([...this.schedules])
  getById(id: string): ScheduledSkill | undefined;
  add(schedule: ScheduledSkill): ScheduledSkill; // createdAt/updatedAtデフォルト付与、戻り値あり
  update(id: string, updates: Partial<ScheduledSkill>): void; // findIndexOrThrow使用
  delete(id: string): void; // findIndexOrThrow使用（throws on not found）
  addRunResult(id: string, result: ScheduledRunResult): void; // FIFO + MAX_RUN_HISTORY制限

  private findIndexOrThrow(id: string): number; // 共通エラーハンドリング
  private persist(): void; // this.store.set() による永続化
}
```

### 4.4 メソッド一覧

#### SkillScheduler

| メソッド                  | 可視性  | 戻り値                    | 説明                                           |
| ------------------------- | ------- | ------------------------- | ---------------------------------------------- |
| `initialize()`            | public  | `Promise<void>`           | 保存済みスケジュールの復元とタイマー開始       |
| `addSchedule()`           | public  | `Promise<ScheduledSkill>` | スケジュール追加とタイマー開始                 |
| `updateSchedule()`        | public  | `Promise<void>`           | スケジュール更新とタイマー再開                 |
| `deleteSchedule()`        | public  | `Promise<void>`           | スケジュール削除とタイマー停止                 |
| `enableSchedule()`        | public  | `Promise<void>`           | スケジュール有効化とタイマー開始               |
| `disableSchedule()`       | public  | `Promise<void>`           | スケジュール無効化とタイマー停止               |
| `listSchedules()`         | public  | `ScheduledSkill[]`        | 全スケジュール取得（同期メソッド）             |
| `getActiveJobCount()`     | public  | `number`                  | アクティブジョブ数（テスト用）                 |
| `hasActiveJob()`          | public  | `boolean`                 | ジョブ存在確認（テスト用）                     |
| `activateSchedule()`      | private | `void`                    | タイマー開始（既存ジョブは先にdeactivate）     |
| `deactivateSchedule()`    | private | `void`                    | タイマー停止（type discriminatorで種別判定）   |
| `executeScheduledSkill()` | private | `Promise<void>`           | スキル実行、buildRunResult、store.addRunResult |
| `buildRunResult()`        | private | `ScheduledRunResult`      | 実行結果オブジェクト構築                       |
| `calculateNextRun()`      | private | `Date \| undefined`       | 次回実行時刻計算（種別ごとのロジック）         |
| `registerEventListener()` | private | `void`                    | イベントリスナー登録（app_start: 即時実行）    |

#### ScheduleStore

| メソッド           | 可視性  | 戻り値                        | 説明                                               |
| ------------------ | ------- | ----------------------------- | -------------------------------------------------- |
| `getAll()`         | public  | `ScheduledSkill[]`            | 全スケジュール取得（インメモリキャッシュのコピー） |
| `getById()`        | public  | `ScheduledSkill \| undefined` | ID でスケジュール取得                              |
| `add()`            | public  | `ScheduledSkill`              | スケジュール追加（createdAt/updatedAt自動付与）    |
| `update()`         | public  | `void`                        | スケジュール更新（IDは上書き不可）                 |
| `delete()`         | public  | `void`                        | スケジュール削除（未発見時はthrow）                |
| `addRunResult()`   | public  | `void`                        | 実行結果追加（FIFO、最大100件）                    |
| `findIndexOrThrow` | private | `number`                      | ID検索（未発見時にthrow）                          |
| `persist()`        | private | `void`                        | ストアへ永続化                                     |

---

## 5. DI パターン設計

### 5.1 Constructor DI + インターフェース分離

> **実装判断**: 設計時はSetter Injection（P34対策）を予定していたが、`SchedulerSkillExecutor`インターフェースを導入することでBrowserWindowへの直接依存を排除し、Constructor DIのみで完結する設計を実現した。

| 依存オブジェクト         | DI パターン           | 理由                                                        |
| ------------------------ | --------------------- | ----------------------------------------------------------- |
| `ScheduleStore`          | Constructor Injection | 生成時点で利用可能（electron-store は即座に初期化）         |
| `SchedulerSkillExecutor` | Constructor Injection | インターフェースにより実装の詳細（BrowserWindow等）を抽象化 |

### 5.2 初期化フロー

```typescript
// apps/desktop/src/main/ipc/index.ts（概念フロー）

// Step 1: ScheduleStore 生成（electron-store 初期化）
const scheduleStore = new ScheduleStore();

// Step 2: BrowserWindow 生成
mainWindow = createWindow();

// Step 3: SkillExecutor 生成（BrowserWindow必要）
const skillExecutor = new SkillExecutor(mainWindow, authKeyService);

// Step 4: SkillScheduler 生成（Constructor DI: 全依存を注入）
const skillScheduler = new SkillScheduler(scheduleStore, skillExecutor);

// Step 5: IPC ハンドラ登録
registerSkillScheduleHandlers(mainWindow, skillScheduler, scheduleStore);

// Step 6: スケジュール初期化（保存済みスケジュールの復元）
await skillScheduler.initialize();
```

### 5.3 SchedulerSkillExecutor インターフェース

SkillExecutor の全機能のうち、スケジューラが必要とする最小限のインターフェースを定義。依存性逆転原則（DIP）に準拠。

```typescript
export interface SchedulerSkillExecutor {
  execute(
    request: { prompt: string; skillId: string },
    skill: {
      id: string;
      name: string;
      description: string;
      path: string;
      anchors: unknown[];
      allowedTools?: string[];
    },
  ): Promise<{ executionId: string; success: boolean; error?: unknown }>;
}
```

---

## 6. エラーハンドリング戦略

### 6.1 IPC 層

| エラー種別           | エラーコード       | リトライ | 対応                                               |
| -------------------- | ------------------ | -------- | -------------------------------------------------- |
| バリデーションエラー | `VALIDATION_ERROR` | 不可     | P42 準拠 3 段バリデーションで早期拒否              |
| 送信元不正           | `UNAUTHORIZED`     | 不可     | `validateIpcSender()` で拒否                       |
| スケジュール未発見   | `NOT_FOUND`        | 不可     | `ScheduleStore.getById()` で未発見時にエラーを返す |
| 内部エラー           | -                  | 不可     | `sanitizeErrorMessage()` で内部情報を除去して返却  |

### 6.2 サービス層

```typescript
// エラーレスポンスの標準パターン
try {
  const result = await skillScheduler.addSchedule(scheduleInput);
  return { success: true, data: result };
} catch (error) {
  return {
    success: false,
    error:
      error instanceof Error
        ? error.message
        : "スケジュールの追加に失敗しました",
  };
}
```

### 6.3 スケジュール実行時

スケジュールされたスキルの実行エラーは**握りつぶさない**。`ScheduledRunResult.error` に記録する。タイマー自体は停止しない（次回実行に影響させない）。`once` タイプは実行後に自動で `disableSchedule()` を呼び出す。

```typescript
private async executeScheduledSkill(schedule: ScheduledSkill): Promise<void> {
  const startedAt = new Date().toISOString();
  const runId = randomUUID();
  let runResult: ScheduledRunResult;

  try {
    const result = await this.skillExecutor.execute(
      { prompt: schedule.prompt, skillId: schedule.skillName },
      { id: schedule.skillName, name: schedule.skillName, description: "", path: "", anchors: [] },
    );
    runResult = this.buildRunResult(runId, startedAt, {
      success: result.success,
      output: result.success ? `Execution ${result.executionId} completed` : undefined,
      error: result.success ? undefined : "Execution failed",
    });
  } catch (error) {
    runResult = this.buildRunResult(runId, startedAt, {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }

  // store.addRunResult() で runHistory 更新（最大100件: NFR-08）+ lastRun 更新
  this.scheduleStore.addRunResult(schedule.id, runResult);

  // nextRun 再計算（cron/interval のみ）
  if (schedule.schedule.type === "cron" || schedule.schedule.type === "interval") {
    const nextRun = this.calculateNextRun(schedule.schedule);
    this.scheduleStore.update(schedule.id, {
      nextRun: nextRun ? nextRun.toISOString() : null,
    });
  }

  // once タイプは実行後に自動無効化
  if (schedule.schedule.type === "once") {
    await this.disableSchedule(schedule.id);
  }
}
```

---

## 7. セキュリティ設計

### 7.1 IPC 送信元検証（NFR-02）

全ハンドラで `validateIpcSender()` を実施し、許可されたウィンドウからのリクエストのみ受け付ける。

```typescript
const validation = validateIpcSender(event, channelName, {
  getAllowedWindows: () => [mainWindow],
});
if (!validation.valid) {
  throw toIPCValidationError(validation);
}
```

### 7.2 P42 準拠 3 段バリデーション（NFR-01）

全文字列引数に以下の 3 段バリデーションを適用する。

| 段階 | チェック内容                           | 対象引数                              |
| ---- | -------------------------------------- | ------------------------------------- |
| 1    | `typeof arg !== "string"` — 型チェック | skillName, prompt, id, cronExpression |
| 2    | `arg === ""` — 空文字列チェック        | （段階 1 と同じ）                     |
| 3    | `arg.trim() === ""` — トリム空文字列   | （段階 1 と同じ）                     |

### 7.3 Cron 式インジェクション防止

`node-cron` の `validate()` 関数でcron式の妥当性を検証し、不正な cron 式を拒否する。

```typescript
if (!cron.validate(schedule.cronExpression)) {
  throw {
    code: "VALIDATION_ERROR",
    message: "cronExpression is not a valid cron expression",
  };
}
```

### 7.4 チャンネルホワイトリスト

5 つのスケジュールチャンネルを `ALLOWED_INVOKE_CHANNELS` に追加し、Preload 層のホワイトリストで保護する。

---

## 8. 永続化設計

### 8.1 electron-store スキーマ

| 設定         | 値                                             |
| ------------ | ---------------------------------------------- |
| ストア名     | `skill-schedules`                              |
| ファイル名   | `skill-schedules.json`                         |
| 保存先       | `app.getPath("userData")/skill-schedules.json` |
| デフォルト値 | `{ scheduledSkills: [] }`                      |

### 8.2 JSON スキーマ

```json
{
  "scheduledSkills": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "skillName": "daily-report",
      "prompt": "本日の進捗をまとめてください",
      "schedule": {
        "type": "cron",
        "cronExpression": "0 18 * * 1-5"
      },
      "enabled": true,
      "lastRun": "2026-02-27T09:00:00.000Z",
      "nextRun": "2026-02-27T18:00:00.000Z",
      "runHistory": [
        {
          "runId": "a1b2c3d4-...",
          "startedAt": "2026-02-27T09:00:00.000Z",
          "completedAt": "2026-02-27T09:00:05.123Z",
          "success": true,
          "output": "レポートを生成しました"
        }
      ],
      "notification": {
        "onSuccess": false,
        "onFailure": true,
        "notificationType": "system"
      }
    }
  ]
}
```

### 8.3 P19 準拠の実行時バリデーション

> **実装判断**: 設計時は`getAll()`呼び出し毎にバリデーションを行う方式だったが、実装ではコンストラクタ時点で1回だけバリデーションを実施し、以降はインメモリキャッシュを操作する方式を採用。パフォーマンスと整合性を両立する。

`electron-store` から読み取ったデータは `unknown` 型で受け取り、コンストラクタ内で実行時バリデーションを実施する。JSON ファイルの破損や手動編集による不正データに対して安全性を確保する。

```typescript
// コンストラクタ内で実行（1回のみ）
const raw: unknown = this.store.get("scheduledSkills");
this.schedules = Array.isArray(raw)
  ? raw.filter(
      (item): item is ScheduledSkill =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as Record<string, unknown>).id === "string",
    )
  : [];
```

---

## 9. タイマー管理設計

### 9.1 統一 ActiveJob Map による管理

> **実装判断**: 設計時は`cronTasks`と`timers`の2つのMapで管理する予定だったが、実装では`activeJobs: Map<string, ActiveJob>`の単一Mapにtype discriminatorパターンで統一。停止時のdispatchが1箇所で完結する。

| スケジュール種別 | タイマー実装      | ActiveJob type | 停止方法             |
| ---------------- | ----------------- | -------------- | -------------------- |
| cron             | `cron.schedule()` | `"cron"`       | `task.stop()`        |
| interval         | `setInterval()`   | `"interval"`   | `clearInterval(ref)` |
| once             | `setTimeout()`    | `"timeout"`    | `clearTimeout(ref)`  |
| event            | リスナー登録      | （Map外管理）  | プレースホルダー     |

### 9.2 二重登録防止（P5/NFR-06 対策）

`activateSchedule()` 内で常に先に `deactivateSchedule()` を呼び出し、既存ジョブがあれば停止してから新ジョブを登録する。

```typescript
private activateSchedule(schedule: ScheduledSkill): void {
  // Step 1: 既存ジョブがあれば先にデアクティベート（P5/NFR-06 対策）
  this.deactivateSchedule(schedule.id);

  // Step 2: 種別に応じてタイマーを開始
  switch (schedule.schedule.type) {
    case "cron": {
      const cronExpression = schedule.schedule.cronExpression;
      if (!cronExpression) break;
      const task = cron.schedule(cronExpression, () => {
        void this.executeScheduledSkill(schedule);
      });
      this.activeJobs.set(schedule.id, { type: "cron", ref: task });
      break;
    }
    case "interval": {
      const interval = schedule.schedule.interval;
      if (!interval || interval <= 0) break;
      const ref = setInterval(() => {
        void this.executeScheduledSkill(schedule);
      }, interval);
      this.activeJobs.set(schedule.id, { type: "interval", ref });
      break;
    }
    case "once": {
      const runAt = schedule.schedule.runAt;
      if (!runAt) break;
      const delay = new Date(runAt).getTime() - Date.now();
      if (delay <= 0) break;  // 過去の日時は実行しない
      const ref = setTimeout(() => {
        void this.executeScheduledSkill(schedule);
      }, delay);
      this.activeJobs.set(schedule.id, { type: "timeout", ref });
      break;
    }
    case "event": {
      this.registerEventListener(schedule);
      break;
    }
  }
}
```

### 9.3 deactivateSchedule（type discriminator による種別判定）

```typescript
private deactivateSchedule(id: string): void {
  const job = this.activeJobs.get(id);
  if (!job) return;

  switch (job.type) {
    case "cron":
      (job.ref as ScheduledTask).stop();
      break;
    case "interval":
      clearInterval(job.ref as ReturnType<typeof setInterval>);
      break;
    case "timeout":
      clearTimeout(job.ref as ReturnType<typeof setTimeout>);
      break;
  }
  this.activeJobs.delete(id);
}
```

---

## 10. シーケンス図

### 10.1 スケジュール追加フロー

```
Renderer          Preload           IPC Handler         SkillScheduler      ScheduleStore
   │                 │                  │                     │                   │
   │── schedule.add(input) ──────────>│                     │                   │
   │                 │── safeInvokeUnwrap ──>│                     │                   │
   │                 │                  │── validateSender ──>│                   │
   │                 │                  │── P42 validate ────>│                   │
   │                 │                  │── validateConfig ──>│                   │
   │                 │                  │── addSchedule() ───>│                   │
   │                 │                  │                     │── UUID 生成       │
   │                 │                  │                     │── calculateNextRun│
   │                 │                  │                     │── store.add() ───>│
   │                 │                  │                     │                   │── JSON 書込
   │                 │                  │                     │<── ok ───────────│
   │                 │                  │                     │── activateSchedule│
   │                 │                  │                     │   (タイマー開始)  │
   │                 │                  │<── ScheduledSkill ──│                   │
   │                 │<── { success } ──│                     │                   │
   │<── ScheduledSkill ────────────────│                     │                   │
```

### 10.2 スケジュール実行フロー

```
Timer/Cron        SkillScheduler          SkillExecutor       ScheduleStore
   │                   │                        │                   │
   │── callback ──────>│                        │                   │
   │                   │── execute() ──────────>│                   │
   │                   │                        │── スキル実行      │
   │                   │<── result ────────────│                   │
   │                   │── buildRunResult()     │                   │
   │                   │── store.addRunResult() ────────────────>│
   │                   │                        │                   │── runHistory追加
   │                   │                        │                   │── lastRun更新
   │                   │                        │                   │── persist()
   │                   │── nextRun 再計算       │                   │
   │                   │── store.update() ──────────────────────>│
   │                   │                        │                   │── persist()
```

### 10.3 アプリ起動時の初期化フロー

```
App Start          SkillScheduler      ScheduleStore
   │                    │                   │
   │── initialize() ──>│                   │
   │                    │── getAll() ──────>│  （インメモリキャッシュのコピーを返す）
   │                    │<── schedules[] ──│
   │                    │                   │
   │                    │── for each schedule:
   │                    │   └── if (schedule.enabled):
   │                    │       └── activateSchedule(schedule)
   │                    │           ├── cron: cron.schedule() + activeJobs.set()
   │                    │           ├── interval: setInterval() + activeJobs.set()
   │                    │           ├── once: setTimeout() + activeJobs.set() (delay > 0のみ)
   │                    │           └── event: registerEventListener()
   │<── initialized ───│                   │
```

### 10.4 スケジュールトグルフロー

> **実装判断**: IPCハンドラ側でtoggle判定（`scheduleStore.getById()` → `enabled`チェック → `enableSchedule()` or `disableSchedule()`）を行い、SkillSchedulerには個別のenable/disableメソッドのみを持たせる。

```
Renderer          Preload           IPC Handler              ScheduleStore     SkillScheduler
   │                 │                  │                         │                   │
   │── toggle(id) ──>│── safeInvokeUnwrap ──>│                         │                   │
   │                 │                  │── validateSender         │                   │
   │                 │                  │── P42 validate(id)       │                   │
   │                 │                  │── scheduleStore.getById()─>│                   │
   │                 │                  │<── schedule ─────────────│                   │
   │                 │                  │── if (schedule.enabled):  │                   │
   │                 │                  │   └── disableSchedule(id) ──────────────────>│
   │                 │                  │── else:                   │                   │
   │                 │                  │   └── enableSchedule(id) ───────────────────>│
   │                 │                  │── scheduleStore.getById()─>│                   │
   │                 │                  │<── updated ──────────────│                   │
   │                 │<── { success, data } ──│                         │                   │
   │<── ScheduledSkill ──────────────────│                         │                   │
```

---

## 11. 統合テスト連携

| 統合ポイント | 契約定義                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| IPC 通信     | 5 チャンネル全てで validateIpcSender + P42 バリデーション。レスポンス形式は `{ success, data?, error? }` |
| スキル実行   | `SchedulerSkillExecutor.execute()` を呼び出し（インターフェース経由）                                    |
| 永続化       | `electron-store` のインメモリキャッシュ + persist()。コンストラクタで P19 準拠の実行時バリデーション     |
| Preload API  | `safeInvokeUnwrap` で `{ success, data }` を展開。Preload 側は `ScheduledSkill` 型を直接受け取る         |
| タイマー管理 | `activeJobs: Map<string, ActiveJob>` で全種別を統一管理。type discriminator で種別判定・停止             |
| 実行結果     | `store.addRunResult()` で runHistory 追加（FIFO、最大100件）+ lastRun 更新                               |

---

## 12. 多角的チェック観点

| 観点             | 確認事項                                                                      | 対策                              |
| ---------------- | ----------------------------------------------------------------------------- | --------------------------------- |
| P42 準拠         | skill:schedule:add/update/delete/toggle の全引数に 3 段バリデーション適用済み | validateStringArg 共通関数        |
| P44/P45 準拠     | ハンドラ引数名と Preload 側渡し値のセマンティクスが一致                       | id→id, schedule→schedule          |
| P5 対策          | activateSchedule 内で常に先に deactivateSchedule() を呼んでから新ジョブ登録   | 二重登録防止ガード                |
| P19 対策         | ScheduleStore コンストラクタで実行時バリデーション実施                        | Array.isArray + filter + 型ガード |
| DI 設計          | SchedulerSkillExecutor インターフェースで Constructor DI                      | BrowserWindow 直接依存なし        |
| メモリ安全性     | deleteSchedule() で deactivateSchedule() + activeJobs.delete()                | type discriminator で種別判定     |
| IPC 境界の型変換 | Date 型フィールドは ISO 8601 文字列でシリアライズ                             | toISOString() 統一                |
