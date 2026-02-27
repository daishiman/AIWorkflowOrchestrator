# Phase 2 成果物: IPC API 仕様書

## メタ情報

| 項目      | 値                                               |
| --------- | ------------------------------------------------ |
| Phase     | 2                                                |
| 機能名    | TASK-9G-skill-schedule                           |
| 作成日    | 2026-02-27                                       |
| 前提Phase | Phase 1: 要件定義                                |
| 成果物    | `outputs/phase-2/api-specification.md`（本文書） |
| 状態      | 完了                                             |

---

## 1. IPC チャンネル一覧

| #   | チャンネル名            | HTTP 相当 | 引数                                               | 成功レスポンス                              | 説明               |
| --- | ----------------------- | --------- | -------------------------------------------------- | ------------------------------------------- | ------------------ |
| 1   | `skill:schedule:list`   | GET       | なし                                               | `{ success: true, data: ScheduledSkill[] }` | 全スケジュール取得 |
| 2   | `skill:schedule:add`    | POST      | `Omit<ScheduledSkill, "id" \| "runHistory">`       | `{ success: true, data: ScheduledSkill }`   | スケジュール追加   |
| 3   | `skill:schedule:update` | PATCH     | `{ id: string, updates: Partial<ScheduledSkill> }` | `{ success: true }`                         | スケジュール更新   |
| 4   | `skill:schedule:delete` | DELETE    | `id: string`                                       | `{ success: true }`                         | スケジュール削除   |
| 5   | `skill:schedule:toggle` | PATCH     | `id: string`                                       | `{ success: true, data: ScheduledSkill }`   | 有効/無効トグル    |

---

## 2. チャンネル定数定義

### 2.1 channels.ts への追加

```typescript
// apps/desktop/src/preload/channels.ts

export const IPC_CHANNELS = {
  // ... 既存チャンネル ...

  // Skill schedule operations (TASK-9G)
  SKILL_SCHEDULE_LIST: "skill:schedule:list",
  SKILL_SCHEDULE_ADD: "skill:schedule:add",
  SKILL_SCHEDULE_UPDATE: "skill:schedule:update",
  SKILL_SCHEDULE_DELETE: "skill:schedule:delete",
  SKILL_SCHEDULE_TOGGLE: "skill:schedule:toggle",
} as const;
```

### 2.2 ホワイトリスト登録

```typescript
// ALLOWED_INVOKE_CHANNELS に追加
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  // ... 既存チャンネル ...

  // Skill schedule channels (TASK-9G)
  IPC_CHANNELS.SKILL_SCHEDULE_LIST,
  IPC_CHANNELS.SKILL_SCHEDULE_ADD,
  IPC_CHANNELS.SKILL_SCHEDULE_UPDATE,
  IPC_CHANNELS.SKILL_SCHEDULE_DELETE,
  IPC_CHANNELS.SKILL_SCHEDULE_TOGGLE,
];
```

---

## 3. チャンネル詳細仕様

### 3.1 `skill:schedule:list`

全てのスケジュールを取得する。引数なし。

#### リクエスト

なし（引数不要）

#### レスポンス

**成功時:**

```typescript
{
  success: true,
  data: ScheduledSkill[]
}
```

**失敗時:**

```typescript
{
  success: false,
  error: "スケジュール一覧の取得に失敗しました"
}
```

#### バリデーション

| 項目               | 内容                                                         |
| ------------------ | ------------------------------------------------------------ |
| 送信元検証         | `validateIpcSender()` で mainWindow からのリクエストのみ許可 |
| 引数バリデーション | なし（引数不要）                                             |

#### ハンドラ実装

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_SCHEDULE_LIST,
  async (event: IpcMainInvokeEvent) => {
    const validation = validateIpcSender(
      event,
      IPC_CHANNELS.SKILL_SCHEDULE_LIST,
      { getAllowedWindows: () => [mainWindow] },
    );
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

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
  },
);
```

---

### 3.2 `skill:schedule:add`

新しいスケジュールを追加する。`id` と `runHistory` はサーバー側で生成される。

#### リクエスト

```typescript
type ScheduleAddInput = Omit<ScheduledSkill, "id" | "runHistory">;
```

具体的なフィールド:

| フィールド     | 型                     | 必須 | 説明                           |
| -------------- | ---------------------- | ---- | ------------------------------ |
| `skillName`    | `string`               | 必須 | 実行対象のスキル名             |
| `prompt`       | `string`               | 必須 | スキル実行時のプロンプト       |
| `schedule`     | `SkillSchedule`        | 必須 | スケジュール設定               |
| `enabled`      | `boolean`              | 必須 | 有効/無効フラグ                |
| `lastRun`      | `string \| null`       | 任意 | 最終実行日時（通常は null）    |
| `nextRun`      | `string \| null`       | 任意 | 次回実行予定（自動計算される） |
| `notification` | `NotificationSettings` | 必須 | 通知設定                       |

#### レスポンス

**成功時:**

```typescript
{
  success: true,
  data: ScheduledSkill  // id, runHistory が付与された完全なオブジェクト
}
```

**失敗時:**

```typescript
{
  success: false,
  error: "スケジュールの追加に失敗しました"
}
```

#### バリデーション

| 段階 | チェック内容                                                 | エラーメッセージ                            |
| ---- | ------------------------------------------------------------ | ------------------------------------------- |
| 1    | 送信元検証                                                   | `toIPCValidationError(validation)` でスロー |
| 2    | `typeof skillName !== "string" \|\| skillName.trim() === ""` | `"skillName must be a non-empty string"`    |
| 3    | `typeof prompt !== "string" \|\| prompt.trim() === ""`       | `"prompt must be a non-empty string"`       |
| 4    | `schedule` オブジェクトの存在と `type` フィールドの型        | `"schedule.type is required"`               |
| 5    | スケジュール種別固有バリデーション（後述）                   | 種別ごとのエラーメッセージ                  |

#### ハンドラ実装

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_SCHEDULE_ADD,
  async (
    event: IpcMainInvokeEvent,
    scheduleInput: Omit<ScheduledSkill, "id" | "runHistory">,
  ) => {
    const validation = validateIpcSender(
      event,
      IPC_CHANNELS.SKILL_SCHEDULE_ADD,
      { getAllowedWindows: () => [mainWindow] },
    );
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    // P42準拠3段バリデーション: skillName
    if (
      typeof scheduleInput?.skillName !== "string" ||
      scheduleInput.skillName.trim() === ""
    ) {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillName must be a non-empty string",
      };
    }

    // P42準拠3段バリデーション: prompt
    if (
      typeof scheduleInput?.prompt !== "string" ||
      scheduleInput.prompt.trim() === ""
    ) {
      throw {
        code: "VALIDATION_ERROR",
        message: "prompt must be a non-empty string",
      };
    }

    // schedule オブジェクトの検証
    if (
      !scheduleInput?.schedule ||
      typeof scheduleInput.schedule.type !== "string"
    ) {
      throw {
        code: "VALIDATION_ERROR",
        message: "schedule.type is required",
      };
    }

    // スケジュール種別固有バリデーション
    validateScheduleConfig(scheduleInput.schedule);

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

---

### 3.3 `skill:schedule:update`

既存のスケジュールを部分更新する。`id` と `schedule.type` の変更は禁止（削除→再追加で対応）。

#### リクエスト

```typescript
interface ScheduleUpdateArgs {
  id: string;
  updates: Partial<Omit<ScheduledSkill, "id">>;
}
```

| フィールド | 型                                    | 必須 | 説明                      |
| ---------- | ------------------------------------- | ---- | ------------------------- |
| `id`       | `string`                              | 必須 | 更新対象のスケジュール ID |
| `updates`  | `Partial<Omit<ScheduledSkill, "id">>` | 必須 | 部分更新フィールド        |

#### レスポンス

**成功時:**

```typescript
{
  success: true;
}
```

**失敗時:**

```typescript
{
  success: false,
  error: "スケジュールの更新に失敗しました"
}
```

#### バリデーション

| 段階 | チェック内容                                     | エラーメッセージ                            |
| ---- | ------------------------------------------------ | ------------------------------------------- |
| 1    | 送信元検証                                       | `toIPCValidationError(validation)` でスロー |
| 2    | `typeof id !== "string" \|\| id.trim() === ""`   | `"id must be a non-empty string"`           |
| 3    | `updates` がオブジェクトであること               | `"updates must be an object"`               |
| 4    | `updates` に `id` フィールドが含まれていないこと | `"id cannot be updated"`                    |

#### ハンドラ実装

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_SCHEDULE_UPDATE,
  async (
    event: IpcMainInvokeEvent,
    args: { id: string; updates: Partial<ScheduledSkill> },
  ) => {
    const validation = validateIpcSender(
      event,
      IPC_CHANNELS.SKILL_SCHEDULE_UPDATE,
      { getAllowedWindows: () => [mainWindow] },
    );
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    // P42準拠3段バリデーション: id
    if (typeof args?.id !== "string" || args.id.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "id must be a non-empty string",
      };
    }

    // updates オブジェクトの検証
    if (!args?.updates || typeof args.updates !== "object") {
      throw {
        code: "VALIDATION_ERROR",
        message: "updates must be an object",
      };
    }

    // id の変更を禁止
    if ("id" in args.updates) {
      throw {
        code: "VALIDATION_ERROR",
        message: "id cannot be updated",
      };
    }

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

---

### 3.4 `skill:schedule:delete`

スケジュールを削除する。関連するタイマーも停止される。

#### リクエスト

```typescript
id: string; // スケジュール ID（直接引数）
```

#### レスポンス

**成功時:**

```typescript
{
  success: true;
}
```

**失敗時:**

```typescript
{
  success: false,
  error: "スケジュールの削除に失敗しました"
}
```

#### バリデーション

| 段階 | チェック内容                                   | エラーメッセージ                            |
| ---- | ---------------------------------------------- | ------------------------------------------- |
| 1    | 送信元検証                                     | `toIPCValidationError(validation)` でスロー |
| 2    | `typeof id !== "string" \|\| id.trim() === ""` | `"id must be a non-empty string"`           |

#### ハンドラ実装

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_SCHEDULE_DELETE,
  async (event: IpcMainInvokeEvent, id: string) => {
    const validation = validateIpcSender(
      event,
      IPC_CHANNELS.SKILL_SCHEDULE_DELETE,
      { getAllowedWindows: () => [mainWindow] },
    );
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    // P42準拠3段バリデーション: id
    if (typeof id !== "string" || id.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "id must be a non-empty string",
      };
    }

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

---

### 3.5 `skill:schedule:toggle`

スケジュールの有効/無効をトグルする。有効化時はタイマーを開始し、無効化時はタイマーを停止する。

#### リクエスト

```typescript
id: string; // スケジュール ID（直接引数）
```

#### レスポンス

**成功時:**

```typescript
{
  success: true,
  data: ScheduledSkill  // トグル後の完全なスケジュール情報
}
```

**失敗時:**

```typescript
{
  success: false,
  error: "スケジュールのトグルに失敗しました"
}
```

#### バリデーション

| 段階 | チェック内容                                   | エラーメッセージ                            |
| ---- | ---------------------------------------------- | ------------------------------------------- |
| 1    | 送信元検証                                     | `toIPCValidationError(validation)` でスロー |
| 2    | `typeof id !== "string" \|\| id.trim() === ""` | `"id must be a non-empty string"`           |

#### ハンドラ実装

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_SCHEDULE_TOGGLE,
  async (event: IpcMainInvokeEvent, id: string) => {
    const validation = validateIpcSender(
      event,
      IPC_CHANNELS.SKILL_SCHEDULE_TOGGLE,
      { getAllowedWindows: () => [mainWindow] },
    );
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    // P42準拠3段バリデーション: id
    if (typeof id !== "string" || id.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "id must be a non-empty string",
      };
    }

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

---

## 4. スケジュール種別固有バリデーション

### 4.1 `validateScheduleConfig` 関数

```typescript
import cron from "node-cron";
import type { SkillSchedule } from "@repo/shared/types/skill-schedule";

/**
 * スケジュール設定の種別固有バリデーション。
 * type 値に応じて必須フィールドの存在と値の妥当性を検証する。
 *
 * @param schedule - 検証対象のスケジュール設定
 * @throws VALIDATION_ERROR コードのエラーオブジェクト
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

    case "event": {
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
}
```

### 4.2 バリデーション規則一覧

| 種別     | フィールド     | 規則                                                      | エラーメッセージ                                       |
| -------- | -------------- | --------------------------------------------------------- | ------------------------------------------------------ |
| cron     | cronExpression | 非空文字列 + `cron.validate()` で妥当性検証               | `"cronExpression is required for cron schedule"`       |
| cron     | cronExpression | node-cron 互換形式（5 フィールド: 分 時 日 月 曜日）      | `"cronExpression is not a valid cron expression"`      |
| interval | interval       | `typeof === "number"` かつ `Number.isFinite()`            | `"interval must be a finite number"`                   |
| interval | interval       | `1000 <= interval <= 86400000`                            | `"interval must be between 1000 ... and 86400000 ..."` |
| once     | runAt          | 非空文字列                                                | `"runAt is required for once schedule"`                |
| once     | runAt          | `new Date(runAt).getTime()` が NaN でない                 | `"runAt must be a valid ISO 8601 date string"`         |
| once     | runAt          | 未来の日時であること                                      | `"runAt must be a future date"`                        |
| event    | event          | `"app_start" \| "file_change" \| "git_commit"` のいずれか | `"event must be one of: ..."`                          |

---

## 5. Preload API 仕様

### 5.1 SkillAPI 拡張

```typescript
// apps/desktop/src/preload/skill-api.ts に追加

// SkillAPI インターフェースに schedule プロパティを追加
export interface SkillAPI {
  // ... 既存メソッド ...

  /** スケジュール管理 API（TASK-9G） */
  schedule: {
    /** 全スケジュール一覧を取得する */
    list: () => Promise<ScheduledSkill[]>;
    /** 新しいスケジュールを追加する */
    add: (
      schedule: Omit<ScheduledSkill, "id" | "runHistory">,
    ) => Promise<ScheduledSkill>;
    /** スケジュールを部分更新する */
    update: (id: string, updates: Partial<ScheduledSkill>) => Promise<void>;
    /** スケジュールを削除する */
    delete: (id: string) => Promise<void>;
    /** スケジュールの有効/無効をトグルする */
    toggle: (id: string) => Promise<ScheduledSkill>;
  };
}
```

### 5.2 Preload 実装

```typescript
// apps/desktop/src/preload/skill-api.ts の skillAPI オブジェクトに追加

export const skillAPI: SkillAPI = {
  // ... 既存実装 ...

  // === Skill Schedule Operations (TASK-9G) ===

  schedule: {
    list: (): Promise<ScheduledSkill[]> =>
      safeInvokeUnwrap<ScheduledSkill[]>(IPC_CHANNELS.SKILL_SCHEDULE_LIST),

    add: (
      schedule: Omit<ScheduledSkill, "id" | "runHistory">,
    ): Promise<ScheduledSkill> =>
      safeInvokeUnwrap<ScheduledSkill>(
        IPC_CHANNELS.SKILL_SCHEDULE_ADD,
        schedule,
      ),

    update: (id: string, updates: Partial<ScheduledSkill>): Promise<void> =>
      safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_SCHEDULE_UPDATE, {
        id,
        updates,
      }),

    delete: (id: string): Promise<void> =>
      safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_SCHEDULE_DELETE, id),

    toggle: (id: string): Promise<ScheduledSkill> =>
      safeInvokeUnwrap<ScheduledSkill>(IPC_CHANNELS.SKILL_SCHEDULE_TOGGLE, id),
  },
};
```

### 5.3 Preload メソッド一覧

| メソッド               | IPC チャンネル          | 引数                                           | 戻り値                      | ラッパー           |
| ---------------------- | ----------------------- | ---------------------------------------------- | --------------------------- | ------------------ |
| `schedule.list()`      | `skill:schedule:list`   | なし                                           | `Promise<ScheduledSkill[]>` | `safeInvokeUnwrap` |
| `schedule.add(s)`      | `skill:schedule:add`    | `Omit<ScheduledSkill, "id" \| "runHistory">`   | `Promise<ScheduledSkill>`   | `safeInvokeUnwrap` |
| `schedule.update(i,u)` | `skill:schedule:update` | `id: string, updates: Partial<ScheduledSkill>` | `Promise<void>`             | `safeInvokeUnwrap` |
| `schedule.delete(i)`   | `skill:schedule:delete` | `id: string`                                   | `Promise<void>`             | `safeInvokeUnwrap` |
| `schedule.toggle(i)`   | `skill:schedule:toggle` | `id: string`                                   | `Promise<ScheduledSkill>`   | `safeInvokeUnwrap` |

### 5.4 引数の IPC 境界での送信形式

| Preload メソッド       | IPC 引数形式                         | P44/P45 整合性確認                    |
| ---------------------- | ------------------------------------ | ------------------------------------- |
| `schedule.list()`      | 引数なし                             | -                                     |
| `schedule.add(s)`      | `scheduleInput` オブジェクト直接渡し | セマンティクス一致: schedule→schedule |
| `schedule.update(i,u)` | `{ id, updates }` オブジェクト包装   | セマンティクス一致: id→id             |
| `schedule.delete(i)`   | `id` 文字列直接渡し                  | セマンティクス一致: id→id             |
| `schedule.toggle(i)`   | `id` 文字列直接渡し                  | セマンティクス一致: id→id             |

---

## 6. 型定義仕様

### 6.1 共有型定義（packages/shared）

```typescript
// packages/shared/src/types/skill-schedule.ts

/**
 * スケジュールされたスキルの完全な定義。
 * IPC 境界では日時フィールドは ISO 8601 文字列として送受信する。
 */
export interface ScheduledSkill {
  /** スケジュールの一意識別子（crypto.randomUUID() で生成） */
  id: string;
  /** 実行対象のスキル名 */
  skillName: string;
  /** スキル実行時のプロンプト */
  prompt: string;
  /** スケジュール設定 */
  schedule: SkillSchedule;
  /** 有効/無効フラグ */
  enabled: boolean;
  /** 最終実行日時（ISO 8601 文字列）。未実行の場合は null */
  lastRun?: string | null;
  /** 次回実行予定日時（ISO 8601 文字列）。算出不可の場合は null */
  nextRun?: string | null;
  /** 実行履歴（最新 10 件） */
  runHistory: ScheduledRunResult[];
  /** 通知設定 */
  notification: NotificationSettings;
}

/**
 * スケジュール方式の定義。type フィールドで判別する discriminated union 的構造。
 *
 * type ごとの必須フィールド:
 * - "cron": cronExpression が必須
 * - "interval": interval が必須
 * - "once": runAt が必須
 * - "event": event が必須
 */
export interface SkillSchedule {
  /** スケジュール種別 */
  type: "cron" | "interval" | "once" | "event";
  /**
   * cron 式（type: "cron" の場合に必須）。
   * node-cron 互換形式（5 フィールド: 分 時 日 月 曜日）。
   * 例: "0 9 * * 1-5"（平日 9 時）
   */
  cronExpression?: string;
  /**
   * インターバル（ミリ秒。type: "interval" の場合に必須）。
   * 最小値: 1000（1 秒）。最大値: 86400000（24 時間）。
   */
  interval?: number;
  /**
   * 実行日時（ISO 8601 文字列。type: "once" の場合に必須）。
   * 過去の日時は登録時に拒否する。
   */
  runAt?: string | null;
  /**
   * イベント種別（type: "event" の場合に必須）。
   * app_start: アプリ起動時。
   * file_change: ファイル変更時（詳細実装は別タスク）。
   * git_commit: Git commit 時（詳細実装は別タスク）。
   */
  event?: "app_start" | "file_change" | "git_commit";
  /**
   * イベント固有の設定（type: "event" の場合にオプション）。
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
  /** 実行 ID（crypto.randomUUID() で生成） */
  runId: string;
  /** 実行開始日時（ISO 8601 文字列） */
  startedAt: string;
  /** 実行完了日時（ISO 8601 文字列）。実行中の場合は null */
  completedAt?: string | null;
  /** 実行成功フラグ */
  success: boolean;
  /** スキル実行の出力テキスト */
  output?: string;
  /** エラーメッセージ（失敗時） */
  error?: string;
}
```

### 6.2 re-export

```typescript
// packages/shared/src/types/index.ts に追加

// スキルスケジュール型定義 (TASK-9G)
export * from "./skill-schedule";
```

### 6.3 Preload 型定義

```typescript
// apps/desktop/src/preload/types.ts の SkillAPI 部分

// 既存の SkillAPI import に ScheduledSkill の import を追加
import type {
  ScheduledSkill,
  NotificationSettings as ScheduleNotificationSettings,
  ScheduledRunResult,
} from "@repo/shared/types/skill-schedule";
```

> **注意**: `apps/desktop/src/preload/types.ts` には既に `NotificationSettings` 型（プロフィール通知設定用）が定義されている。名前衝突を避けるため、スケジュール通知設定は `ScheduleNotificationSettings` としてエイリアスインポートするか、`ScheduledSkill` の定義内で直接参照する。

### 6.4 型定義の配置と参照関係

```
packages/shared/src/types/skill-schedule.ts  ← 正本（共有型定義）
    ↑ import                                    ↑ import
    │                                           │
apps/desktop/src/main/                 apps/desktop/src/preload/
  services/skill/SkillScheduler.ts       skill-api.ts
  services/skill/ScheduleStore.ts        types.ts
  ipc/scheduleHandlers.ts
```

---

## 7. IPC 境界の日時シリアライズ

### 7.1 ISO 8601 変換規則

IPC 境界を超える全ての日時フィールドは ISO 8601 文字列（`toISOString()` 形式）で送受信する。Main Process 内部で `Date` オブジェクトを使用する場合も、IPC レスポンスでは文字列に変換する。

| フィールド                       | 型               | 例                           |
| -------------------------------- | ---------------- | ---------------------------- |
| `ScheduledSkill.lastRun`         | `string \| null` | `"2026-02-27T09:00:00.000Z"` |
| `ScheduledSkill.nextRun`         | `string \| null` | `"2026-02-27T18:00:00.000Z"` |
| `ScheduledRunResult.startedAt`   | `string`         | `"2026-02-27T09:00:00.000Z"` |
| `ScheduledRunResult.completedAt` | `string \| null` | `"2026-02-27T09:00:05.123Z"` |
| `SkillSchedule.runAt`            | `string \| null` | `"2026-02-28T15:00:00.000Z"` |

### 7.2 変換実装パターン

```typescript
// Main Process 内部での Date → ISO 8601 変換
const now = new Date();
const isoString = now.toISOString(); // "2026-02-27T09:00:00.000Z"

// IPC レスポンスでの使用
return {
  success: true,
  data: {
    ...schedule,
    lastRun: schedule.lastRun, // 既に ISO 8601 文字列
    nextRun: schedule.nextRun, // 既に ISO 8601 文字列
  },
};
```

---

## 8. エラーレスポンス形式

### 8.1 標準エラーレスポンス

```typescript
// IPC ハンドラのエラーレスポンス形式
interface IpcErrorResponse {
  success: false;
  error: string; // ユーザー向けエラーメッセージ
}
```

### 8.2 バリデーションエラー（throw）

```typescript
// バリデーション失敗時は throw でエラーをスロー
interface IpcValidationError {
  code: "VALIDATION_ERROR";
  message: string; // バリデーションエラーの詳細
}
```

### 8.3 エラーコード一覧

| コード               | 発生場所                       | 説明                                       |
| -------------------- | ------------------------------ | ------------------------------------------ |
| `VALIDATION_ERROR`   | 全ハンドラのバリデーション段階 | 引数の型・値が不正                         |
| `UNAUTHORIZED`       | `validateIpcSender()`          | 送信元ウィンドウが許可リストにない         |
| `NOT_FOUND`          | `ScheduleStore.getById()`      | 指定 ID のスケジュールが存在しない         |
| （文字列メッセージ） | `catch` ブロック               | 内部エラーのメッセージ化（スタック非公開） |

### 8.4 Preload 側でのエラーハンドリング

`safeInvokeUnwrap` が `{ success: false, error: string }` を展開し、`Error` をスローする。Renderer 側は `try/catch` でエラーを捕捉する。

```typescript
// Renderer 側での使用例
try {
  const schedule = await window.electronAPI.skill.schedule.add({
    skillName: "daily-report",
    prompt: "レポートを生成してください",
    schedule: { type: "cron", cronExpression: "0 18 * * 1-5" },
    enabled: true,
    notification: {
      onSuccess: false,
      onFailure: true,
      notificationType: "system",
    },
  });
} catch (error) {
  // error.message に IPC ハンドラのエラーメッセージが格納される
  console.error("スケジュール追加に失敗:", error.message);
}
```

---

## 9. IPC ハンドラ登録・解除

### 9.1 登録関数

```typescript
// apps/desktop/src/main/ipc/scheduleHandlers.ts

import { ipcMain, IpcMainInvokeEvent, BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import { SkillScheduler } from "../services/skill/SkillScheduler";
import {
  validateIpcSender,
  toIPCValidationError,
} from "../infrastructure/security/ipc-validator";
import type {
  ScheduledSkill,
  SkillSchedule,
} from "@repo/shared/types/skill-schedule";

export function registerScheduleHandlers(
  skillScheduler: SkillScheduler,
  mainWindow: BrowserWindow,
): void {
  // 5 チャンネルのハンドラを登録
  // ... (各チャンネルの実装は本仕様書のセクション 3 を参照)
}
```

### 9.2 解除関数

```typescript
export function unregisterScheduleHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_SCHEDULE_LIST);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_SCHEDULE_ADD);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_SCHEDULE_UPDATE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_SCHEDULE_DELETE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_SCHEDULE_TOGGLE);
}
```

### 9.3 既存パターンとの整合性

| 項目               | 既存パターン（skillHandlers.ts）                     | 本設計                                                    |
| ------------------ | ---------------------------------------------------- | --------------------------------------------------------- |
| 関数名             | `registerSkillHandlers` / `unregisterSkillHandlers`  | `registerScheduleHandlers` / `unregisterScheduleHandlers` |
| DI 引数            | `(mainWindow, skillService)`                         | `(skillScheduler, mainWindow)`                            |
| 送信元検証         | `validateIpcSender()` + `toIPCValidationError()`     | 同一パターン                                              |
| バリデーション     | P42 準拠 3 段バリデーション                          | 同一パターン                                              |
| レスポンス形式     | `{ success: true/false, data?, error? }`             | 同一パターン                                              |
| エラーハンドリング | `error instanceof Error ? error.message : "..."`     | 同一パターン                                              |
| `unregister` 関数  | `ipcMain.removeHandler()` を全チャンネルに対して実行 | 同一パターン                                              |

---

## 10. P44/P45 準拠チェック

IPC ハンドラの引数名と Preload 側で渡す値のセマンティクスが一致していることを検証する。

| チャンネル              | ハンドラ側引数                                | Preload 側送信値               | セマンティクス一致 |
| ----------------------- | --------------------------------------------- | ------------------------------ | ------------------ |
| `skill:schedule:list`   | なし                                          | なし                           | -                  |
| `skill:schedule:add`    | `scheduleInput: Omit<ScheduledSkill, ...>`    | `schedule` オブジェクト        | 一致               |
| `skill:schedule:update` | `args: { id: string, updates: Partial<...> }` | `{ id, updates }` オブジェクト | 一致               |
| `skill:schedule:delete` | `id: string`                                  | `id` 文字列                    | 一致               |
| `skill:schedule:toggle` | `id: string`                                  | `id` 文字列                    | 一致               |

全チャンネルで引数名がセマンティクスと一致しており、P44/P45 パターンの再発リスクはない。

---

## 11. テスト用モック設計

### 11.1 SkillScheduler モック

```typescript
const mockSkillScheduler = {
  listSchedules: vi.fn().mockResolvedValue([]),
  addSchedule: vi.fn().mockResolvedValue(mockSchedule),
  updateSchedule: vi.fn().mockResolvedValue(undefined),
  deleteSchedule: vi.fn().mockResolvedValue(undefined),
  toggleSchedule: vi.fn().mockResolvedValue(mockSchedule),
  initialize: vi.fn().mockResolvedValue(undefined),
  shutdown: vi.fn().mockResolvedValue(undefined),
  setSkillExecutor: vi.fn(),
  setMainWindow: vi.fn(),
};
```

### 11.2 ScheduleStore モック

```typescript
const mockScheduleStore = {
  getAll: vi.fn().mockReturnValue([]),
  getById: vi.fn().mockReturnValue(undefined),
  add: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  saveAll: vi.fn(),
};
```

### 11.3 テストデータファクトリ

```typescript
function createMockScheduledSkill(
  overrides?: Partial<ScheduledSkill>,
): ScheduledSkill {
  return {
    id: "test-schedule-id",
    skillName: "test-skill",
    prompt: "テスト用プロンプト",
    schedule: {
      type: "cron",
      cronExpression: "*/5 * * * *",
    },
    enabled: true,
    lastRun: null,
    nextRun: "2026-02-27T18:00:00.000Z",
    runHistory: [],
    notification: {
      onSuccess: false,
      onFailure: true,
      notificationType: "system",
    },
    ...overrides,
  };
}
```
