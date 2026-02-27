# Phase 2: 設計

## メタ情報

| 項目      | 値                          |
| --------- | --------------------------- |
| Phase     | 2                           |
| 機能名    | TASK-9G-skill-schedule      |
| 作成日    | 2026-02-27                  |
| 前提Phase | Phase 1: 要件定義           |
| 後続Phase | Phase 3: 設計レビューゲート |
| 状態      | 未着手                      |

## 目的

Phase 1で定義した要件を実現するためのアーキテクチャ設計、クラス設計、IPC API設計、永続化スキーマ設計を行う。

## 実行タスク

- クラス設計: SkillScheduler / ScheduleStore の責務分離とAPI設計
- DI設計: BrowserWindow依存のためSetter Injectionパターンを選定（P34対策）
- IPC API設計: 5チャンネルのリクエスト・レスポンス型定義とバリデーション設計
- Preload API設計: skill-api.ts拡張のインターフェース設計
- 永続化設計: electron-storeスキーマ設計
- タイマー管理設計: node-cron / setInterval / setTimeout の統合管理設計
- 型定義設計: packages/shared の共有型とIPC境界の変換設計

## 参照資料

| 資料名                   | パス                                                                                        | 説明                 |
| ------------------------ | ------------------------------------------------------------------------------------------- | -------------------- |
| Phase 1 要件定義         | `phase-1-requirements.md`                                                                   | 前Phase成果物        |
| タスク定義               | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/index.md`                         | TASK-9G概要          |
| システム仕様（IPC）      | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPC チャンネル仕様   |
| システム仕様（サービス） | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | Electronサービス設計 |
| システム仕様（スキルIF） | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | スキル型定義         |
| セキュリティ仕様         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC セキュリティ     |
| Skill IPCセキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | Skill系IPC境界       |
| エラーハンドリング仕様   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーハンドリング   |
| IPC契約チェックリスト    | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC契約検証手順      |
| IPC型不整合ガイド        | `.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md`            | Date/引数形式整合    |
| 実装パターン集           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC実装パターン      |

## 設計方針

### アプローチ選定

| 選択肢                                     | 採用 | 理由                                                                                  |
| ------------------------------------------ | ---- | ------------------------------------------------------------------------------------- |
| SkillScheduler + ScheduleStore 2クラス分離 | ✅   | 単一責務原則。スケジュール制御と永続化を分離し、テスタビリティ向上                    |
| 単一クラスで全管理                         | ❌   | 責務が肥大化し、テスト時のモック困難                                                  |
| Setter Injection（DI）                     | ✅   | BrowserWindow・SkillExecutorは起動後に生成されるため遅延初期化が必要（P34）           |
| Constructor Injection（DI）                | ❌   | BrowserWindow生成前にSkillSchedulerを構築する必要があり不適                           |
| node-cron（cronスケジュール）              | ✅   | 軽量・信頼性が高い・Vitest fake timerとの互換性をモックで確保                         |
| node-schedule                              | ❌   | node-cronより重い依存。cron式の他にDateオブジェクト対応だがonce用にはsetTimeoutで十分 |

## クラス設計

### SkillScheduler

```typescript
// apps/desktop/src/main/services/skill/SkillScheduler.ts

import cron from "node-cron";

export class SkillScheduler {
  // --- DI ---
  private skillExecutor: SkillExecutor | null = null;
  private mainWindow: BrowserWindow | null = null;

  // --- タイマー管理 ---
  // cron式スケジュールのタスク参照
  private cronTasks: Map<string, cron.ScheduledTask> = new Map();
  // interval/onceスケジュールのタイマー参照
  private timers: Map<string, ReturnType<typeof setInterval>> = new Map();

  constructor(private readonly scheduleStore: ScheduleStore) {}

  // --- Setter Injection（P34対策）---
  setSkillExecutor(executor: SkillExecutor): void;
  setMainWindow(window: BrowserWindow): void;

  // --- 公開API ---
  /**
   * アプリ起動時に呼ばれる。保存済みスケジュールを復元し、
   * enabled: true のスケジュールのタイマーを開始する。
   * app_startイベントのスケジュールを即座に実行する。
   */
  async initialize(): Promise<void>;

  /**
   * スケジュールを追加し、enabled: trueの場合はタイマーを開始する。
   * IDはcrypto.randomUUID()で生成する。
   */
  async addSchedule(
    schedule: Omit<ScheduledSkill, "id" | "runHistory">,
  ): Promise<ScheduledSkill>;

  /**
   * スケジュールを更新する。タイマーは一度停止してから再開する。
   * id, schedule.type の変更は禁止（削除→再追加で対応）。
   */
  async updateSchedule(
    id: string,
    updates: Partial<Omit<ScheduledSkill, "id">>,
  ): Promise<void>;

  /**
   * スケジュールを削除する。タイマーを停止し、ストアから削除する。
   */
  async deleteSchedule(id: string): Promise<void>;

  /**
   * スケジュールの有効/無効をトグルする。
   * 有効化時: タイマー開始。無効化時: タイマー停止。
   */
  async toggleSchedule(id: string): Promise<ScheduledSkill>;

  /**
   * 全スケジュールを取得する（IPC用）。
   * Date型フィールドはISO 8601文字列に変換済み。
   */
  async listSchedules(): Promise<ScheduledSkill[]>;

  // --- 内部メソッド ---
  /**
   * スケジュール種別に応じてタイマーを開始する。
   * 既存タイマーがある場合は先にdeactivateする（P5/NFR-06対策）。
   */
  private activateSchedule(schedule: ScheduledSkill): void;

  /**
   * タイマーを停止し、Map参照を削除する。
   * cron: task.stop() / interval: clearInterval / once: clearTimeout
   */
  private deactivateSchedule(id: string): void;

  /**
   * スキルを実行し、結果をrunHistoryに記録する。
   * 実行エラーはScheduledRunResult.errorに記録し、例外はスローしない。
   * runHistoryは最新10件に制限（NFR-08）。
   */
  private async executeScheduledSkill(schedule: ScheduledSkill): Promise<void>;

  /**
   * スケジュール種別と設定から次回実行時刻を計算する。
   * cron: node-cronのnextDate()相当。interval: now + interval ms。
   * once: runAt。event: undefined（次回時刻なし）。
   */
  private calculateNextRun(schedule: SkillSchedule): Date | undefined;

  /**
   * イベントトリガースケジュールのリスナーを登録する。
   * app_start: initialize()内で即時実行。
   * file_change / git_commit: インターフェースのみ定義（詳細実装は別タスク）。
   */
  private registerEventListener(schedule: ScheduledSkill): void;

  /**
   * NotificationSettingsに基づいて通知を送信する。
   * system: Electron Notification API。inApp: mainWindow.webContents.send()。
   * both: 両方送信。
   */
  private sendNotification(
    schedule: ScheduledSkill,
    result: ScheduledRunResult,
  ): void;

  /**
   * アプリ終了時に呼ばれる。全タイマーを停止する。
   */
  async shutdown(): Promise<void>;
}
```

### ScheduleStore

```typescript
// apps/desktop/src/main/services/skill/ScheduleStore.ts

import Store from "electron-store";

interface ScheduleStoreSchema {
  scheduledSkills: ScheduledSkill[];
}

export class ScheduleStore {
  private store: Store<ScheduleStoreSchema>;

  constructor() {
    this.store = new Store<ScheduleStoreSchema>({
      name: "skill-schedules",
      defaults: {
        scheduledSkills: [],
      },
      // スキーマバリデーション
      schema: {
        scheduledSkills: {
          type: "array",
          items: {
            type: "object",
            required: ["id", "skillName", "prompt", "schedule", "enabled"],
          },
        },
      },
    });
  }

  /**
   * 全スケジュールを取得する。
   * electron-storeから読み取り、実行時バリデーションを実施する（P19対策）。
   */
  getAll(): ScheduledSkill[];

  /**
   * IDでスケジュールを取得する。見つからない場合はundefined。
   */
  getById(id: string): ScheduledSkill | undefined;

  /**
   * スケジュールを追加する。IDの重複チェックを実施する。
   */
  add(schedule: ScheduledSkill): void;

  /**
   * スケジュールを更新する。対象が存在しない場合はエラー。
   */
  update(id: string, updates: Partial<ScheduledSkill>): void;

  /**
   * スケジュールを削除する。対象が存在しない場合は何もしない。
   */
  delete(id: string): void;

  /**
   * 全スケジュールを保存する（バッチ更新用）。
   */
  saveAll(schedules: ScheduledSkill[]): void;
}
```

## 型定義設計

### 共有型定義（packages/shared）

```typescript
// packages/shared/src/types/skill-schedule.ts

/**
 * スケジュールされたスキルの完全な定義。
 * IPC境界では日時フィールドはISO 8601文字列として送受信する。
 */
export interface ScheduledSkill {
  /** スケジュールの一意識別子（crypto.randomUUID()で生成） */
  id: string;
  /** 実行対象のスキル名 */
  skillName: string;
  /** スキル実行時のプロンプト */
  prompt: string;
  /** スケジュール設定 */
  schedule: SkillSchedule;
  /** 有効/無効フラグ */
  enabled: boolean;
  /** 最終実行日時（ISO 8601文字列）。未実行の場合はnull */
  lastRun?: string | null;
  /** 次回実行予定日時（ISO 8601文字列）。算出不可の場合はnull */
  nextRun?: string | null;
  /** 実行履歴（最新10件） */
  runHistory: ScheduledRunResult[];
  /** 通知設定 */
  notification: NotificationSettings;
}

/**
 * スケジュール方式の定義。typeフィールドで判別するdiscriminated union。
 */
export interface SkillSchedule {
  /** スケジュール種別 */
  type: "cron" | "interval" | "once" | "event";
  /**
   * cron式（type: "cron"の場合に必須）。
   * node-cron互換形式（5フィールド: 分 時 日 月 曜日）。
   * 例: "0 9 * * 1-5"（平日9時）
   */
  cronExpression?: string;
  /**
   * インターバル（ミリ秒。type: "interval"の場合に必須）。
   * 最小値: 1000（1秒）。最大値: 86400000（24時間）。
   */
  interval?: number;
  /**
   * 実行日時（ISO 8601文字列。type: "once"の場合に必須）。
   * 過去の日時は登録時に拒否する。
   */
  runAt?: string | null;
  /**
   * イベント種別（type: "event"の場合に必須）。
   * app_start: アプリ起動時。file_change: ファイル変更時。git_commit: Git commit時。
   */
  event?: "app_start" | "file_change" | "git_commit";
  /**
   * イベント固有の設定（type: "event"の場合にオプション）。
   * file_change: { watchPaths: string[] }
   * git_commit: { repositoryPath: string }
   */
  eventConfig?: Record<string, unknown>;
}

/**
 * 通知設定。
 */
export interface NotificationSettings {
  /** 成功時に通知するかどうか */
  onSuccess: boolean;
  /** 失敗時に通知するかどうか */
  onFailure: boolean;
  /** 通知方式 */
  notificationType: "system" | "inApp" | "both";
}

/**
 * スケジュール実行結果の記録。
 */
export interface ScheduledRunResult {
  /** 実行IDcrypto.randomUUID()で生成） */
  runId: string;
  /** 実行開始日時（ISO 8601文字列） */
  startedAt: string;
  /** 実行完了日時（ISO 8601文字列）。実行中の場合はnull */
  completedAt?: string | null;
  /** 実行成功フラグ */
  success: boolean;
  /** スキル実行の出力テキスト */
  output?: string;
  /** エラーメッセージ（失敗時） */
  error?: string;
}
```

### re-export

```typescript
// packages/shared/src/types/index.ts に追加
export type {
  ScheduledSkill,
  SkillSchedule,
  NotificationSettings,
  ScheduledRunResult,
} from "./skill-schedule";
```

## IPC通信設計

### チャンネル定数

```typescript
// apps/desktop/src/preload/channels.ts に追加

// スケジュール管理
SKILL_SCHEDULE_LIST: "skill:schedule:list",
SKILL_SCHEDULE_ADD: "skill:schedule:add",
SKILL_SCHEDULE_UPDATE: "skill:schedule:update",
SKILL_SCHEDULE_DELETE: "skill:schedule:delete",
SKILL_SCHEDULE_TOGGLE: "skill:schedule:toggle",
```

ホワイトリスト登録:

- `ALLOWED_INVOKE_CHANNELS` に上記5チャンネルを追加

### IPCハンドラ設計

#### skill:schedule:list

```typescript
ipcMain.handle(IPC_CHANNELS.SKILL_SCHEDULE_LIST, async (event) => {
  // Step 1: 送信元検証
  const validation = validateIpcSender(
    event,
    IPC_CHANNELS.SKILL_SCHEDULE_LIST,
    {
      getAllowedWindows: () => [mainWindow],
    },
  );
  if (!validation.valid) {
    throw toIPCValidationError(validation);
  }

  // Step 2: 引数なし（バリデーション不要）

  // Step 3: ビジネスロジック
  try {
    const schedules = await skillScheduler.listSchedules();
    return { success: true, data: schedules };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "スケジュール一覧の取得に失敗しました",
    };
  }
});
```

#### skill:schedule:add

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_SCHEDULE_ADD,
  async (event, scheduleInput: Omit<ScheduledSkill, "id" | "runHistory">) => {
    // Step 1: 送信元検証
    const validation = validateIpcSender(
      event,
      IPC_CHANNELS.SKILL_SCHEDULE_ADD,
      {
        getAllowedWindows: () => [mainWindow],
      },
    );
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    // Step 2: P42準拠3段バリデーション
    if (
      typeof scheduleInput?.skillName !== "string" ||
      scheduleInput.skillName.trim() === ""
    ) {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillName must be a non-empty string",
      };
    }
    if (
      typeof scheduleInput?.prompt !== "string" ||
      scheduleInput.prompt.trim() === ""
    ) {
      throw {
        code: "VALIDATION_ERROR",
        message: "prompt must be a non-empty string",
      };
    }
    if (
      !scheduleInput?.schedule ||
      typeof scheduleInput.schedule.type !== "string"
    ) {
      throw { code: "VALIDATION_ERROR", message: "schedule.type is required" };
    }
    // スケジュール種別固有バリデーション
    validateScheduleConfig(scheduleInput.schedule);

    // Step 3: ビジネスロジック
    try {
      const created = await skillScheduler.addSchedule(scheduleInput);
      return { success: true, data: created };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "スケジュールの追加に失敗しました",
      };
    }
  },
);
```

#### skill:schedule:update

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_SCHEDULE_UPDATE,
  async (event, args: { id: string; updates: Partial<ScheduledSkill> }) => {
    // Step 1: 送信元検証（省略: 上記と同パターン）

    // Step 2: P42準拠3段バリデーション
    if (typeof args?.id !== "string" || args.id.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "id must be a non-empty string",
      };
    }
    if (!args?.updates || typeof args.updates !== "object") {
      throw { code: "VALIDATION_ERROR", message: "updates must be an object" };
    }
    // idとschedule.typeの変更を禁止
    if ("id" in args.updates) {
      throw { code: "VALIDATION_ERROR", message: "id cannot be updated" };
    }

    // Step 3: ビジネスロジック
    try {
      await skillScheduler.updateSchedule(args.id, args.updates);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "スケジュールの更新に失敗しました",
      };
    }
  },
);
```

#### skill:schedule:delete

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_SCHEDULE_DELETE,
  async (event, id: string) => {
    // Step 1: 送信元検証（省略: 上記と同パターン）

    // Step 2: P42準拠3段バリデーション
    if (typeof id !== "string" || id.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "id must be a non-empty string",
      };
    }

    // Step 3: ビジネスロジック
    try {
      await skillScheduler.deleteSchedule(id);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "スケジュールの削除に失敗しました",
      };
    }
  },
);
```

#### skill:schedule:toggle

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_SCHEDULE_TOGGLE,
  async (event, id: string) => {
    // Step 1: 送信元検証（省略: 上記と同パターン）

    // Step 2: P42準拠3段バリデーション
    if (typeof id !== "string" || id.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "id must be a non-empty string",
      };
    }

    // Step 3: ビジネスロジック
    try {
      const toggled = await skillScheduler.toggleSchedule(id);
      return { success: true, data: toggled };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "スケジュールのトグルに失敗しました",
      };
    }
  },
);
```

### スケジュール種別固有バリデーション

```typescript
/**
 * スケジュール設定の種別固有バリデーション。
 * type値に応じて必須フィールドの存在と値の妥当性を検証する。
 */
function validateScheduleConfig(schedule: SkillSchedule): void {
  const validTypes = ["cron", "interval", "once", "event"];
  if (!validTypes.includes(schedule.type)) {
    throw {
      code: "VALIDATION_ERROR",
      message: `schedule.type must be one of: ${validTypes.join(", ")}`,
    };
  }

  switch (schedule.type) {
    case "cron":
      if (
        typeof schedule.cronExpression !== "string" ||
        schedule.cronExpression.trim() === ""
      ) {
        throw {
          code: "VALIDATION_ERROR",
          message: "cronExpression is required for cron schedule",
        };
      }
      if (!cron.validate(schedule.cronExpression)) {
        throw {
          code: "VALIDATION_ERROR",
          message: "cronExpression is not a valid cron expression",
        };
      }
      break;

    case "interval":
      if (
        typeof schedule.interval !== "number" ||
        !Number.isFinite(schedule.interval)
      ) {
        throw {
          code: "VALIDATION_ERROR",
          message: "interval must be a finite number",
        };
      }
      if (schedule.interval < 1000 || schedule.interval > 86400000) {
        throw {
          code: "VALIDATION_ERROR",
          message: "interval must be between 1000 (1s) and 86400000 (24h)",
        };
      }
      break;

    case "once":
      if (typeof schedule.runAt !== "string" || schedule.runAt.trim() === "") {
        throw {
          code: "VALIDATION_ERROR",
          message: "runAt is required for once schedule",
        };
      }
      if (isNaN(new Date(schedule.runAt).getTime())) {
        throw {
          code: "VALIDATION_ERROR",
          message: "runAt must be a valid ISO 8601 date string",
        };
      }
      if (new Date(schedule.runAt).getTime() <= Date.now()) {
        throw {
          code: "VALIDATION_ERROR",
          message: "runAt must be a future date",
        };
      }
      break;

    case "event":
      const validEvents = ["app_start", "file_change", "git_commit"];
      if (
        typeof schedule.event !== "string" ||
        !validEvents.includes(schedule.event)
      ) {
        throw {
          code: "VALIDATION_ERROR",
          message: `event must be one of: ${validEvents.join(", ")}`,
        };
      }
      break;
  }
}
```

## Preload API設計

### SkillAPI拡張

```typescript
// apps/desktop/src/preload/skill-api.ts に追加

schedule: {
  list: () =>
    safeInvokeUnwrap<ScheduledSkill[]>(IPC_CHANNELS.SKILL_SCHEDULE_LIST),

  add: (schedule: Omit<ScheduledSkill, "id" | "runHistory">) =>
    safeInvokeUnwrap<ScheduledSkill>(IPC_CHANNELS.SKILL_SCHEDULE_ADD, schedule),

  update: (id: string, updates: Partial<ScheduledSkill>) =>
    safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_SCHEDULE_UPDATE, { id, updates }),

  delete: (id: string) =>
    safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_SCHEDULE_DELETE, id),

  toggle: (id: string) =>
    safeInvokeUnwrap<ScheduledSkill>(IPC_CHANNELS.SKILL_SCHEDULE_TOGGLE, id),
},
```

### Preload型定義

```typescript
// apps/desktop/src/preload/types.ts に追加

export interface SkillAPI {
  // ... 既存メソッド ...

  schedule: {
    list: () => Promise<ScheduledSkill[]>;
    add: (
      schedule: Omit<ScheduledSkill, "id" | "runHistory">,
    ) => Promise<ScheduledSkill>;
    update: (id: string, updates: Partial<ScheduledSkill>) => Promise<void>;
    delete: (id: string) => Promise<void>;
    toggle: (id: string) => Promise<ScheduledSkill>;
  };
}
```

## 永続化設計

### electron-storeスキーマ

```typescript
// ファイル名: skill-schedules.json（electron-storeが自動管理）
// 保存先: app.getPath("userData")/skill-schedules.json

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
      "runHistory": [],
      "notification": {
        "onSuccess": false,
        "onFailure": true,
        "notificationType": "system"
      }
    }
  ]
}
```

### 読み取り時の実行時バリデーション（P19対策）

```typescript
getAll(): ScheduledSkill[] {
  const raw: unknown = this.store.get("scheduledSkills");
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.filter(
    (item): item is ScheduledSkill =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as Record<string, unknown>).id === "string" &&
      typeof (item as Record<string, unknown>).skillName === "string" &&
      typeof (item as Record<string, unknown>).prompt === "string" &&
      typeof (item as Record<string, unknown>).enabled === "boolean"
  );
}
```

## タイマー管理設計

### タイマー種別ごとの管理

| スケジュール種別 | タイマー実装      | 管理Map                          | 停止方法               |
| ---------------- | ----------------- | -------------------------------- | ---------------------- |
| cron             | `cron.schedule()` | `cronTasks: Map<string, Task>`   | `task.stop()`          |
| interval         | `setInterval()`   | `timers: Map<string, NodeTimer>` | `clearInterval(timer)` |
| once             | `setTimeout()`    | `timers: Map<string, NodeTimer>` | `clearTimeout(timer)`  |
| event            | リスナー登録      | （別途管理）                     | リスナー解除           |

### activateScheduleフロー

```
activateSchedule(schedule)
  ├── 既存タイマーチェック（cronTasks.has(id) || timers.has(id)）
  │   └── 存在する場合: deactivateSchedule(id) で先に停止（P5/NFR-06対策）
  ├── switch (schedule.schedule.type)
  │   ├── "cron":
  │   │   ├── cron.schedule(cronExpression, callback)
  │   │   └── cronTasks.set(id, task)
  │   ├── "interval":
  │   │   ├── setInterval(callback, interval)
  │   │   └── timers.set(id, timer)
  │   ├── "once":
  │   │   ├── delay = new Date(runAt).getTime() - Date.now()
  │   │   ├── setTimeout(callback, delay)
  │   │   └── timers.set(id, timer)
  │   └── "event":
  │       └── registerEventListener(schedule)
  └── nextRun更新 → store保存
```

### initializeフロー

```
initialize()
  ├── scheduleStore.getAll() で全スケジュール読み込み
  ├── for each schedule where enabled === true:
  │   ├── schedule.type === "once" && runAt <= now の場合:
  │   │   └── enabled = false に設定（期限切れ）
  │   ├── schedule.type === "event" && event === "app_start" の場合:
  │   │   └── executeScheduledSkill(schedule) を即時実行
  │   └── それ以外:
  │       └── activateSchedule(schedule)
  └── nextRun再計算 → store保存
```

## DI / 初期化設計

### SkillSchedulerの生成と注入

```typescript
// apps/desktop/src/main/ipc/index.ts

// Step 1: ScheduleStore生成（electron-store初期化）
const scheduleStore = new ScheduleStore();

// Step 2: SkillScheduler生成（Constructor Injection: ScheduleStore）
const skillScheduler = new SkillScheduler(scheduleStore);

// Step 3: BrowserWindow生成後にSetter Injection
mainWindow = createWindow();
skillScheduler.setMainWindow(mainWindow);

// Step 4: SkillExecutor生成後にSetter Injection
const skillExecutor = new SkillExecutor(mainWindow, authKeyService);
skillScheduler.setSkillExecutor(skillExecutor);

// Step 5: IPCハンドラ登録
registerScheduleHandlers(skillScheduler, mainWindow);

// Step 6: スケジュール初期化（保存済みスケジュールの復元）
await skillScheduler.initialize();

// Step 7: アプリ終了時のクリーンアップ
app.on("before-quit", async () => {
  await skillScheduler.shutdown();
});
```

## シーケンス図

### スケジュール追加フロー

```
Renderer          Preload           IPC Handler         SkillScheduler      ScheduleStore
   |                 |                  |                     |                   |
   |-- schedule.add(input) ----------->|                     |                   |
   |                 |-- safeInvoke --->|                     |                   |
   |                 |                  |-- validateSender -->|                   |
   |                 |                  |-- P42 validate ---->|                   |
   |                 |                  |-- addSchedule() --->|                   |
   |                 |                  |                     |-- UUID生成        |
   |                 |                  |                     |-- calculateNextRun|
   |                 |                  |                     |-- store.add() --->|
   |                 |                  |                     |                   |-- JSON書込
   |                 |                  |                     |<-- ok ------------|
   |                 |                  |                     |-- activateSchedule|
   |                 |                  |                     |   (タイマー開始)  |
   |                 |                  |<-- ScheduledSkill --|                   |
   |                 |<-- { success } --|                     |                   |
   |<-- ScheduledSkill -----------------|                     |                   |
```

### スケジュール実行フロー

```
Timer/Cron        SkillScheduler      SkillExecutor       ScheduleStore
   |                   |                    |                   |
   |-- callback ------>|                    |                   |
   |                   |-- RunResult生成    |                   |
   |                   |-- execute() ------>|                   |
   |                   |                    |-- スキル実行      |
   |                   |<-- result ---------|                   |
   |                   |-- runHistory追加   |                   |
   |                   |-- lastRun更新      |                   |
   |                   |-- nextRun再計算    |                   |
   |                   |-- store.update() ->|                   |
   |                   |                    |                   |-- JSON更新
   |                   |-- sendNotification |                   |
   |                   |   (条件付き)       |                   |
```

## 統合テスト連携【必須】

統合ポイント/契約（API・スキーマ）を設計に反映する:

| 統合ポイント | 契約定義                                                                                             |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| IPC通信      | 5チャンネル全てでvalidateIpcSender + P42バリデーション。レスポンス形式は`{ success, data?, error? }` |
| スキル実行   | `SkillExecutor.execute()`を呼び出し。引数は`SkillExecutionRequest`型                                 |
| 永続化       | `electron-store`のJSONスキーマで構造検証。読み取り時はP19準拠の実行時バリデーション                  |
| Preload API  | `safeInvokeUnwrap`で`{ success, data }`を展開。Preload側は`ScheduledSkill`型を直接受け取る           |
| 通知         | `Notification` API（system）/ `mainWindow.webContents.send()`（inApp）                               |
| タイマー管理 | `Map<string, Task/Timer>`で参照保持。削除時は確実に停止・Map削除                                     |

## 多角的チェック観点

| 観点            | 確認事項                                                                          |
| --------------- | --------------------------------------------------------------------------------- |
| P42準拠         | skill:schedule:add/update/delete/toggleの全引数に3段バリデーション適用済み        |
| P44/P45準拠     | ハンドラ引数名とPreload側渡し値のセマンティクスが一致（id→id, schedule→schedule） |
| P5対策          | activateSchedule内で既存タイマーを先にdeactivateしてから新タイマーを登録          |
| P19対策         | ScheduleStore.getAll()で実行時バリデーション実施                                  |
| P34対策         | SkillExecutor/BrowserWindowはSetter Injectionで遅延注入                           |
| メモリ安全性    | shutdown()で全タイマー停止、deleteSchedule()でMap参照削除                         |
| IPC境界の型変換 | Date型フィールドはISO 8601文字列でシリアライズ                                    |

## 成果物

| 成果物               | パス                                     | 説明              |
| -------------------- | ---------------------------------------- | ----------------- |
| アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md` | 本ドキュメント    |
| IPC API仕様書        | `outputs/phase-2/api-specification.md`   | IPCチャンネル詳細 |

## 完了条件

- [ ] SkillScheduler / ScheduleStoreのクラス設計が完了している
- [ ] 全5チャンネルのIPCハンドラ設計（バリデーション含む）が完了している
- [ ] Preload API設計（型定義含む）が完了している
- [ ] 共有型定義（skill-schedule.ts）が設計されている
- [ ] electron-storeスキーマが設計されている
- [ ] タイマー管理（cron/interval/once/event）の設計が完了している
- [ ] DI / 初期化フローが設計されている
- [ ] シーケンス図で主要フローが可視化されている
- [ ] 統合テスト連携の契約が設計に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビューゲート
