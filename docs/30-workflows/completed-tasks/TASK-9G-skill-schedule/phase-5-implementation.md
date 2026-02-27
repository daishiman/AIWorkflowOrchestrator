# Phase 5: 実装（TDD: Green）— TASK-9G スキルスケジュール実行機能

## メタ情報

| 項目       | 値                                               |
| ---------- | ------------------------------------------------ |
| Phase      | 5                                                |
| 機能名     | TASK-9G-skill-schedule                           |
| 作成日     | 2026-02-27                                       |
| 前提Phase  | Phase 4（テスト作成・Red状態確認）               |
| 依存タスク | TASK-9B（SkillService / SkillExecutor 実装済み） |

## 目的

Phase 4 で作成した全テスト（76テスト）を通すための**最小限のプロダクションコード**を実装し、全テストが **Green 状態**（成功）であることを確認する。

## 実行タスク

### Task 1: 依存パッケージインストール

以下のコマンドを実行して node-cron を追加する:

```bash
pnpm --filter @repo/desktop add node-cron
pnpm --filter @repo/desktop add -D @types/node-cron
```

---

### Task 2: 型定義実装

#### 2.1 スケジュール型定義

**対象ファイル**: `packages/shared/src/types/skill-schedule.ts`（新規作成）

以下のインターフェースを定義する:

| 型名                   | 説明                   | 必須フィールド                                                            |
| ---------------------- | ---------------------- | ------------------------------------------------------------------------- |
| `ScheduledSkill`       | スケジュール済みスキル | id, skillName, prompt, schedule, enabled, runHistory, notification        |
| `SkillSchedule`        | スケジュール設定       | type（`"cron" \| "interval" \| "once" \| "event"`）                       |
| `NotificationSettings` | 通知設定               | onSuccess, onFailure, notificationType（`"system" \| "inApp" \| "both"`） |
| `ScheduledRunResult`   | 実行結果               | runId, startedAt, success                                                 |

**オプショナルフィールド**:

| 型名                 | オプショナルフィールド                                                  |
| -------------------- | ----------------------------------------------------------------------- |
| `ScheduledSkill`     | lastRun（`string \| null`）、nextRun（`string \| null`）                |
| `SkillSchedule`      | cronExpression、interval、runAt（`string \| null`）、event、eventConfig |
| `ScheduledRunResult` | completedAt（`string \| null`）、output、error                          |

**IPC シリアライズ方針**:

- 日時フィールド（lastRun, nextRun, startedAt, completedAt, runAt）は全て `string`（ISO 8601）で定義する
- Main Process 内部では Date オブジェクトを使用し、IPC 境界で `.toISOString()` に変換する

#### 2.2 re-export 追加

**対象ファイル**: `packages/shared/src/types/index.ts`

```typescript
export * from "./skill-schedule.js";
```

---

### Task 3: ScheduleStore 実装

**対象ファイル**: `apps/desktop/src/main/services/skill/ScheduleStore.ts`（新規作成）

#### 3.1 クラス構成

```
ScheduleStore
├── constructor(): electron-store からデータ復元
├── getAll(): ScheduledSkill[]
├── getById(id: string): ScheduledSkill | undefined
├── add(schedule: Omit<ScheduledSkill, "id" | "runHistory">): ScheduledSkill
├── update(id: string, updates: Partial<ScheduledSkill>): void
├── delete(id: string): void
├── addRunResult(id: string, result: ScheduledRunResult): void
└── private persist(): void  // electron-store への書き込み
```

#### 3.2 実装仕様

| メソッド       | 仕様                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------- |
| `constructor`  | electron-store から `"schedules"` キーで復元。不正データ（非配列）は空配列にフォールバック   |
| `add`          | `crypto.randomUUID()` でID生成、runHistory を空配列で初期化、persist() 呼び出し              |
| `update`       | 存在しないIDで `Error("Schedule not found: {id}")` をスロー、persist() 呼び出し              |
| `delete`       | 存在しないIDで `Error("Schedule not found: {id}")` をスロー、persist() 呼び出し              |
| `addRunResult` | runHistory の先頭に追加、最大100件を維持（古い順に削除）、lastRun を更新、persist() 呼び出し |
| `persist`      | `this.store.set("schedules", this.schedules)` で永続化                                       |

#### 3.3 データ復元のバリデーション（P19対策）

```typescript
constructor() {
  const raw: unknown = this.store.get("schedules");
  this.schedules = Array.isArray(raw)
    ? raw.filter((item): item is ScheduledSkill =>
        typeof item === "object" && item !== null && typeof item.id === "string"
      )
    : [];
}
```

---

### Task 4: SkillScheduler 実装

**対象ファイル**: `apps/desktop/src/main/services/skill/SkillScheduler.ts`（新規作成）

#### 4.1 クラス構成

```
SkillScheduler
├── constructor(scheduleStore: ScheduleStore, skillExecutor: SkillExecutor)
├── async initialize(): Promise<void>
├── async addSchedule(input: Omit<ScheduledSkill, "id" | "runHistory">): Promise<ScheduledSkill>
├── async updateSchedule(id: string, updates: Partial<ScheduledSkill>): Promise<void>
├── async deleteSchedule(id: string): Promise<void>
├── async enableSchedule(id: string): Promise<void>
├── async disableSchedule(id: string): Promise<void>
├── private activateSchedule(schedule: ScheduledSkill): void
├── private deactivateSchedule(id: string): void
├── private async executeScheduledSkill(schedule: ScheduledSkill): Promise<void>
├── private calculateNextRun(schedule: SkillSchedule): Date | undefined
└── private registerEventListener(schedule: ScheduledSkill): void
```

#### 4.2 アクティブスケジュール管理

```typescript
// タイマー/cron ジョブの参照を保持
private activeJobs: Map<string, { type: "cron" | "interval" | "timeout"; ref: cron.ScheduledTask | NodeJS.Timeout }> = new Map();
```

#### 4.3 各メソッドの実装仕様

##### initialize

| 項目 | 仕様                                                            |
| ---- | --------------------------------------------------------------- |
| 処理 | `scheduleStore.getAll()` で全スケジュール取得                   |
| 条件 | `enabled === true` のスケジュールのみ `activateSchedule()` 実行 |

##### addSchedule

| 項目           | 仕様                                                              |
| -------------- | ----------------------------------------------------------------- |
| バリデーション | type: "cron" の場合、`cron.validate(cronExpression)` で式を検証   |
| 保存           | `scheduleStore.add()` で永続化                                    |
| nextRun        | `calculateNextRun()` で次回実行時刻を算出し、スケジュールに設定   |
| アクティベート | `enabled: true` の場合のみ `activateSchedule()` を呼び出す        |
| 戻り値         | 生成された ScheduledSkill（nextRun が ISO 8601 文字列に変換済み） |

##### activateSchedule

| type       | 実装                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------- |
| `cron`     | `cron.schedule(cronExpression, callback)` でジョブ登録、activeJobs に保存                |
| `interval` | `setInterval(callback, interval)` でタイマー登録、activeJobs に保存                      |
| `once`     | `setTimeout(callback, delay)` でワンショット登録、activeJobs に保存。delay = runAt - now |
| `event`    | `registerEventListener()` でイベントリスナー登録                                         |

##### deactivateSchedule

| 項目             | 仕様                                        |
| ---------------- | ------------------------------------------- |
| cron             | `scheduledTask.stop()` で停止               |
| interval/timeout | `clearInterval()` / `clearTimeout()` で停止 |
| 共通             | `activeJobs.delete(id)` で参照を削除        |

##### executeScheduledSkill

| 項目       | 仕様                                                                                  |
| ---------- | ------------------------------------------------------------------------------------- |
| 実行開始   | `startedAt = new Date().toISOString()` を記録                                         |
| スキル実行 | `skillExecutor.execute(schedule.skillName, schedule.prompt)` を呼び出し               |
| 成功時     | `scheduleStore.addRunResult(id, { success: true, output })` で履歴追加                |
| 失敗時     | `scheduleStore.addRunResult(id, { success: false, error: error.message })` で履歴追加 |
| nextRun    | cron/interval の場合、`calculateNextRun()` で次回実行時刻を再計算して store 更新      |
| once 完了  | 実行後に `disableSchedule(id)` で自動無効化                                           |

##### calculateNextRun

| type       | 計算方法                                                      |
| ---------- | ------------------------------------------------------------- |
| `cron`     | cron-parser 等で cron 式の次回実行時刻を算出                  |
| `interval` | `new Date(Date.now() + interval)` を返す                      |
| `once`     | runAt が未来なら `new Date(runAt)` を返す、過去なら undefined |
| `event`    | `undefined` を返す（イベント駆動のため時刻不定）              |

---

### Task 5: チャンネル定数追加

#### 5.1 Preload チャンネル定数

**対象ファイル**: `apps/desktop/src/preload/channels.ts`

`IPC_CHANNELS` オブジェクトの Skill share operations セクション後に以下の5定数を追加する:

```typescript
// Skill schedule operations (TASK-9G)
SKILL_SCHEDULE_LIST: "skill:schedule:list",
SKILL_SCHEDULE_ADD: "skill:schedule:add",
SKILL_SCHEDULE_UPDATE: "skill:schedule:update",
SKILL_SCHEDULE_DELETE: "skill:schedule:delete",
SKILL_SCHEDULE_TOGGLE: "skill:schedule:toggle",
```

`ALLOWED_INVOKE_CHANNELS` 配列の Skill share channels セクション後に以下を追加する:

```typescript
// Skill schedule channels (TASK-9G)
IPC_CHANNELS.SKILL_SCHEDULE_LIST,
IPC_CHANNELS.SKILL_SCHEDULE_ADD,
IPC_CHANNELS.SKILL_SCHEDULE_UPDATE,
IPC_CHANNELS.SKILL_SCHEDULE_DELETE,
IPC_CHANNELS.SKILL_SCHEDULE_TOGGLE,
```

**注意**: `ALLOWED_ON_CHANNELS` への追加は不要（全て invoke パターンのため）。

---

### Task 6: IPCハンドラー実装

**対象ファイル**: `apps/desktop/src/main/ipc/skillHandlers.ts`（既存ファイルへ追記）

#### 6.1 ファイル構成

```
apps/desktop/src/main/ipc/skillHandlers.ts
├── import 宣言
├── registerSkillScheduleHandlers(mainWindow, skillScheduler, scheduleStore)
│   ├── skill:schedule:list ハンドラー
│   ├── skill:schedule:add ハンドラー
│   ├── skill:schedule:update ハンドラー
│   ├── skill:schedule:delete ハンドラー
│   └── skill:schedule:toggle ハンドラー
└── unregisterSkillScheduleHandlers()
```

#### 6.2 関数シグネチャ

```typescript
import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../preload/channels.js";
import {
  validateIpcSender,
  toIPCValidationError,
} from "../infrastructure/security/ipc-validator.js";
import type { SkillScheduler } from "../services/skill/SkillScheduler.js";
import type { ScheduleStore } from "../services/skill/ScheduleStore.js";

export function registerSkillScheduleHandlers(
  mainWindow: BrowserWindow,
  skillScheduler: SkillScheduler,
  scheduleStore: ScheduleStore,
): void;

export function unregisterSkillScheduleHandlers(): void;
```

#### 6.3 各ハンドラーの実装仕様

全ハンドラーは以下の共通パターンに従う:

```
1. validateIpcSender(event, channel, { getAllowedWindows: () => [mainWindow] })
2. validation.valid === false → throw toIPCValidationError(validation)
3. 引数バリデーション（P42準拠: 型チェック → 空文字列 → .trim() 空文字列）
4. サービスメソッド呼び出し
5. { success: true, data? } を返却（Date → ISO 8601 変換）
6. 既知のエラー → { success: false, error: error.message }
7. 予期しないエラー → { success: false, error: "Internal error" }
```

##### skill:schedule:list

| 項目           | 値                                             |
| -------------- | ---------------------------------------------- |
| チャンネル     | `IPC_CHANNELS.SKILL_SCHEDULE_LIST`             |
| 引数           | なし                                           |
| 呼び出し       | `scheduleStore.getAll()`                       |
| 成功レスポンス | `{ success: true, data: ScheduledSkill[] }`    |
| IPC変換        | lastRun / nextRun は ISO 8601 文字列として返却 |

##### skill:schedule:add

| 項目           | 値                                                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| チャンネル     | `IPC_CHANNELS.SKILL_SCHEDULE_ADD`                                                                                                                      |
| 引数           | `{ skillName: string, prompt: string, schedule: SkillSchedule, enabled: boolean, notification: NotificationSettings }`                                 |
| バリデーション | skillName: 非空文字列（P42準拠）、prompt: 非空文字列（P42準拠）、schedule: 非null オブジェクト、schedule.type: 4値のいずれか、type別必須フィールド検証 |
| 呼び出し       | `skillScheduler.addSchedule(input)`                                                                                                                    |
| 成功レスポンス | `{ success: true, data: ScheduledSkill }`                                                                                                              |

##### skill:schedule:update

| 項目           | 値                                                 |
| -------------- | -------------------------------------------------- |
| チャンネル     | `IPC_CHANNELS.SKILL_SCHEDULE_UPDATE`               |
| 引数           | `{ id: string, updates: Partial<ScheduledSkill> }` |
| バリデーション | id: 非空文字列（P42準拠）                          |
| 呼び出し       | `skillScheduler.updateSchedule(id, updates)`       |
| 成功レスポンス | `{ success: true }`                                |

##### skill:schedule:delete

| 項目           | 値                                   |
| -------------- | ------------------------------------ |
| チャンネル     | `IPC_CHANNELS.SKILL_SCHEDULE_DELETE` |
| 引数           | `{ id: string }`                     |
| バリデーション | id: 非空文字列（P42準拠）            |
| 呼び出し       | `skillScheduler.deleteSchedule(id)`  |
| 成功レスポンス | `{ success: true }`                  |

##### skill:schedule:toggle

| 項目           | 値                                                                                                             |
| -------------- | -------------------------------------------------------------------------------------------------------------- |
| チャンネル     | `IPC_CHANNELS.SKILL_SCHEDULE_TOGGLE`                                                                           |
| 引数           | `{ id: string }`                                                                                               |
| バリデーション | id: 非空文字列（P42準拠）                                                                                      |
| 呼び出し       | `scheduleStore.getById(id)` で現在の enabled を取得し、`enableSchedule` / `disableSchedule` を切り替え呼び出し |
| 成功レスポンス | `{ success: true }`                                                                                            |

#### 6.4 エラーハンドリング

```typescript
catch (error) {
  if (error instanceof Error && error.message.startsWith("Schedule not found")) {
    return { success: false, error: error.message };
  }
  if (error instanceof Error && error.message.startsWith("Invalid cron expression")) {
    return { success: false, error: error.message };
  }
  // 予期しないエラー: 内部情報を漏洩しない
  return { success: false, error: "Internal error" };
}
```

#### 6.5 unregisterSkillScheduleHandlers

```typescript
export function unregisterSkillScheduleHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_SCHEDULE_LIST);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_SCHEDULE_ADD);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_SCHEDULE_UPDATE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_SCHEDULE_DELETE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_SCHEDULE_TOGGLE);
}
```

---

### Task 7: Preload API 拡張

**対象ファイル**: `apps/desktop/src/preload/skill-api.ts`

#### 7.1 schedule メソッド追加

```typescript
// Skill schedule operations (TASK-9G)
scheduleList: () =>
  safeInvokeUnwrap<ScheduledSkill[]>(IPC_CHANNELS.SKILL_SCHEDULE_LIST),

scheduleAdd: (input: Omit<ScheduledSkill, "id" | "runHistory">) =>
  safeInvokeUnwrap<ScheduledSkill>(IPC_CHANNELS.SKILL_SCHEDULE_ADD, input),

scheduleUpdate: (id: string, updates: Partial<ScheduledSkill>) =>
  safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_SCHEDULE_UPDATE, { id, updates }),

scheduleDelete: (id: string) =>
  safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_SCHEDULE_DELETE, { id }),

scheduleToggle: (id: string) =>
  safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_SCHEDULE_TOGGLE, { id }),
```

#### 7.2 型定義追加

**対象ファイル**: `apps/desktop/src/preload/types.ts`

SkillAPI インターフェースに以下のメソッドを追加する:

```typescript
// Skill schedule operations (TASK-9G)
scheduleList: () => Promise<ScheduledSkill[]>;
scheduleAdd: (input: Omit<ScheduledSkill, "id" | "runHistory">) =>
  Promise<ScheduledSkill>;
scheduleUpdate: (id: string, updates: Partial<ScheduledSkill>) => Promise<void>;
scheduleDelete: (id: string) => Promise<void>;
scheduleToggle: (id: string) => Promise<void>;
```

**注意**: `ScheduledSkill` は `@repo/shared` からインポートする。型の二重定義を避ける（P23対策）。

---

### Task 8: アプリ初期化統合

**対象ファイル**: `apps/desktop/src/main/ipc/index.ts`

#### 8.1 SkillScheduler インスタンス生成

アプリ初期化時（BrowserWindow 生成後）に以下を追加する:

```typescript
// SkillScheduler 初期化 (TASK-9G)
const scheduleStore = new ScheduleStore();
const skillScheduler = new SkillScheduler(scheduleStore, skillExecutor);
await skillScheduler.initialize();
```

#### 8.2 IPCハンドラー登録

既存の `registerAllIpcHandlers` 関数（または同等の一括登録関数）に以下を追加する:

```typescript
registerSkillScheduleHandlers(mainWindow, skillScheduler, scheduleStore);
```

#### 8.3 IPCハンドラー解除

既存の `unregisterAllIpcHandlers` 関数に以下を追加する:

```typescript
unregisterSkillScheduleHandlers();
```

---

## 既知のPitfall対策

| Pitfall ID | 内容                         | 対策                                                                                                  |
| ---------- | ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| P5         | リスナー二重登録             | `unregisterSkillScheduleHandlers` で確実に全解除                                                      |
| P13        | タイマーテスト無限ループ     | `advanceTimersByTime` を使用、`runAllTimers` は使用禁止                                               |
| P19        | 型キャストによる検証バイパス | electron-store 復元時に `Array.isArray()` + `.filter()` でバリデーション                              |
| P23        | 型二重定義の管理             | `ScheduledSkill` を `@repo/shared` に配置し Preload と Main で同一参照                                |
| P27        | ハードコード文字列の見落とし | 全チャンネル名に `IPC_CHANNELS` 定数を使用。実装後に grep で検証                                      |
| P34        | 遅延初期化が必要な DI        | SkillScheduler は BrowserWindow 生成後に初期化（Setter Injection 不要、Constructor Injection で対応） |
| P42        | .trim() バリデーション漏れ   | 全文字列引数に3段バリデーション（型チェック → 空文字列 → .trim() 空文字列）                           |

## アーキテクチャ層別実装テーブル

| レイヤー | ファイル                                                 | 変更内容                                    |
| -------- | -------------------------------------------------------- | ------------------------------------------- |
| 共有型   | `packages/shared/src/types/skill-schedule.ts`            | 新規: 4インターフェース定義                 |
| 共有型   | `packages/shared/src/types/index.ts`                     | re-export 追加                              |
| Main     | `apps/desktop/src/main/services/skill/ScheduleStore.ts`  | 新規: electron-store CRUD                   |
| Main     | `apps/desktop/src/main/services/skill/SkillScheduler.ts` | 新規: スケジューラサービス                  |
| Main     | `apps/desktop/src/main/ipc/skillHandlers.ts`             | 既存拡張: 5ハンドラー + register/unregister |
| Main     | `apps/desktop/src/main/ipc/index.ts`                     | 初期化統合                                  |
| Preload  | `apps/desktop/src/preload/channels.ts`                   | 5チャンネル定数 + ホワイトリスト追加        |
| Preload  | `apps/desktop/src/preload/skill-api.ts`                  | 5メソッド追加（safeInvokeUnwrap パターン）  |
| Preload  | `apps/desktop/src/preload/types.ts`                      | SkillAPI 型に5メソッド追加                  |

## 参照資料

| 資料                                                             | 用途                             |
| ---------------------------------------------------------------- | -------------------------------- |
| Phase 4 成果物（テストファイル4件）                              | テストが Green になることを確認  |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                     | 既存ハンドラーの実装パターン     |
| `apps/desktop/src/main/ipc/skillFileHandlers.ts`                 | ファイルハンドラーの実装パターン |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts`          | スキル実行メソッドシグネチャ     |
| `apps/desktop/src/main/infrastructure/security/ipc-validator.ts` | IPC 検証関数                     |
| `apps/desktop/src/preload/channels.ts`                           | チャンネル定数追加位置           |
| `.claude/rules/04-electron-security.md`                          | セキュリティ原則                 |

## 統合テスト連携

| 連携先                | 内容                                                         |
| --------------------- | ------------------------------------------------------------ |
| Phase 4（テスト作成） | 76件のテスト仕様を満たす最小実装を追加する                   |
| Phase 6（テスト拡充） | 実装後の不足分岐・境界値ケースを追加してカバレッジを拡張する |
| Phase 9（品質保証）   | lint/typecheck/coverage を通じて実装品質を確定する           |

## 成果物

| 成果物                                                   | 説明                              |
| -------------------------------------------------------- | --------------------------------- |
| `packages/shared/src/types/skill-schedule.ts`            | 新規: 型定義（4インターフェース） |
| `packages/shared/src/types/index.ts`                     | re-export 追加                    |
| `apps/desktop/src/main/services/skill/ScheduleStore.ts`  | 新規: 永続化ストア                |
| `apps/desktop/src/main/services/skill/SkillScheduler.ts` | 新規: スケジューラサービス        |
| `apps/desktop/src/main/ipc/skillHandlers.ts`             | 既存拡張: IPCハンドラー           |
| `apps/desktop/src/preload/channels.ts`                   | 5定数 + ホワイトリスト追加        |
| `apps/desktop/src/preload/skill-api.ts`                  | 5メソッド追加                     |
| `apps/desktop/src/preload/types.ts`                      | SkillAPI 型拡張                   |
| `apps/desktop/src/main/ipc/index.ts`                     | 初期化統合                        |

## 完了条件

- [ ] `pnpm --filter @repo/desktop add node-cron` と `pnpm --filter @repo/desktop add -D @types/node-cron` が実行済み
- [ ] 5チャンネル定数が `preload/channels.ts` に定義されている
- [ ] `ALLOWED_INVOKE_CHANNELS` に5チャンネルが追加されている
- [ ] `ScheduledSkill` 等の型が `packages/shared/src/types/skill-schedule.ts` に定義され、`index.ts` から re-export されている
- [ ] `ScheduleStore` が electron-store ベースの CRUD + 実行履歴管理を実装している
- [ ] `SkillScheduler` が cron/interval/once/event の4方式をサポートしている
- [ ] 5つのIPCハンドラーが `skillHandlers.ts` に実装されている
- [ ] 各ハンドラーで `validateIpcSender` による送信元検証が実施されている
- [ ] 各ハンドラーの引数バリデーションが P42 準拠3段バリデーションを実装している
- [ ] 既知エラーは `error.message` をそのまま返し、予期しないエラーは `"Internal error"` を返す
- [ ] Preload API に5メソッドが追加されている（`safeInvokeUnwrap` パターン）
- [ ] `unregisterSkillScheduleHandlers` で5チャンネル全てが解除される
- [ ] ハードコード文字列のチャンネル名が存在しない（`IPC_CHANNELS` 定数のみ使用）
- [ ] `apps/desktop/src/main/ipc/index.ts` で SkillScheduler の初期化が統合されている
- [ ] Phase 4 の全テスト（76テスト）が **Green 状態**（成功）である
- [ ] `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillScheduler` が全PASS
- [ ] `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/ScheduleStore` が全PASS
- [ ] `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillScheduleHandlers` が全PASS

## 次のPhase

Phase 6（テスト拡充）へ進む。カバレッジ不足箇所のテストを追加する。
