# TASK-9G スキルスケジュール実行機能 実装ガイド

## Part 1: 概念的説明（中学生レベル）

### スキルスケジュールって何？ ── 目覚まし時計の管理に例えて

スマートフォンの目覚まし時計アプリを思い浮かべてください。

- アラームを「セットする」（追加）
- アラームの「時刻を変える」（更新）
- いらなくなったアラームを「消す」（削除）
- アラームを「オン / オフ」する（有効 / 無効切り替え）
- 電源を切ってもアラームの設定は残っている（永続化）
- 時刻になったら自動で音が鳴る（スケジュール実行）

スキルスケジュールもまったく同じ仕組みです。
「毎日18時にレポートスキルを動かして」と設定しておけば、
アプリが自動でスキルを実行してくれます。

### 4つのセット方法 ── 目覚まし時計の4タイプ

| 種類         | 日常の例え                                                          | 設定例                              |
| ------------ | ------------------------------------------------------------------- | ----------------------------------- |
| **cron**     | 「毎朝7時」「平日だけ」のように曜日や時刻を細かく指定できるアラーム | 「平日の18時に毎回実行」            |
| **interval** | 「30分ごとに鳴るキッチンタイマー」                                  | 「60秒ごとに繰り返し実行」          |
| **once**     | 「明日の15時に1回だけ鳴るリマインダー」                             | 「2026年3月1日の10時に1回だけ実行」 |
| **event**    | 「スマホの電源を入れたら天気アプリが自動で開く」                    | 「アプリ起動時に実行」              |

### 3つの登場人物 ── 伝言ゲームで理解するデータの流れ

スキルスケジュール機能には3つの重要な「役割」があります。
これを伝言ゲームに例えてみましょう。

```
[画面（Renderer）]  ──(1)伝言──>  [受付係（Preload + IPC）]  ──(2)伝言──>  [マネージャー（SkillScheduler）]
       ^                                                                         |
       |                                                                         v
   (5)結果を表示                                                         [記録ノート（ScheduleStore）]
       ^                                                                         |
       |                                                                         v
       +-----(4)伝言------  [受付係]  <------(3)実行結果------  [作業員（SkillExecutor）]
```

1. **画面（Renderer）** = お客さんの役割。「このスキルを毎日18時に実行して」とお願いする人
2. **受付係（Preload + IPC）** = 伝言を安全に届ける役割。お客さんの身分証を確認（セキュリティ検証）し、お願いの内容が正しいか確認（バリデーション）してから、マネージャーに伝える
3. **マネージャー（SkillScheduler）** = 目覚まし時計を管理する人。タイマーをセットし、時刻になったら作業員に「スキルを実行して」と指示する
4. **記録ノート（ScheduleStore）** = アラームの設定を書き留めておくノート。アプリを閉じても、次に開いたときに設定が残っている
5. **作業員（SkillExecutor）** = 実際にスキルを動かす人。指示されたスキルを実行して、結果を返す

#### なぜ伝言ゲーム方式なの？

「画面から直接マネージャーに話しかければいいのに」と思うかもしれませんが、
これはセキュリティのためです。受付係が間に入ることで、以下を確認できます。

- 正しい窓口（メインウィンドウ）からのリクエストか？
- 入力内容が空っぽだったり、おかしなデータだったりしないか？

これは銀行の窓口と同じです。直接金庫に入れないように、必ず窓口を通すのです。

### ScheduleStore とは？ ── アラームの設定を記憶しておくノート

- スケジュールを「追加」「変更」「削除」できる
- 「このスケジュールは何回実行されたか」の履歴を最大100件まで記録する
- アプリを閉じても、次に起動したときに設定が復元される
- もし記録ノートのデータが壊れていても、壊れた部分だけ無視して正常な部分は復元する（P19対策）

### SkillScheduler とは？ ── アラームを実際に鳴らす仕組み

- 設定されたタイマー（cron / interval / once）を管理する
- 時刻が来たらスキルを実行する
- 実行結果（成功 / 失敗）を記録ノートに書く
- 「1回だけ」のスケジュールは、実行後に自動的にオフになる
- 同じアラームが二重に鳴らないようにガードする（P5対策）

---

## Part 2: 技術者向け実装詳細

### 実装概要

| 項目             | 値                                                                             |
| ---------------- | ------------------------------------------------------------------------------ |
| IPC チャンネル数 | 5（skill:schedule:list / add / update / delete / toggle）                      |
| 新規ファイル数   | 3（SkillScheduler.ts, ScheduleStore.ts, skill-schedule.ts）                    |
| 修正ファイル数   | 5（skillHandlers.ts, channels.ts, skill-api.ts, types/index.ts, package.json） |
| テストファイル数 | 2（ScheduleStore.test.ts: 20件, skill-schedule.test.ts: 5件）                  |
| テストケース合計 | 25件（D-01~D-15 + DB-01~DB-05 + T-01~T-05）                                    |
| 依存パッケージ   | node-cron, @types/node-cron                                                    |

### ファイル構成と責務

```
packages/shared/src/types/
  └── skill-schedule.ts          # 共有型定義（ScheduledSkill, SkillSchedule, NotificationSettings, ScheduledRunResult）

apps/desktop/src/
  ├── main/
  │   ├── services/skill/
  │   │   ├── SkillScheduler.ts  # スケジューラサービス本体（タイマー管理・実行制御）
  │   │   ├── ScheduleStore.ts   # electron-store ベースの永続化ストア（CRUD + 実行履歴管理）
  │   │   └── __tests__/
  │   │       └── ScheduleStore.test.ts  # ScheduleStore ユニットテスト（20件）
  │   └── ipc/
  │       └── skillHandlers.ts   # IPCハンドラ（registerSkillScheduleHandlers / unregisterSkillScheduleHandlers）
  └── preload/
      ├── channels.ts            # チャンネル定数（IPC_CHANNELS + ALLOWED_INVOKE_CHANNELS に5チャンネル追加）
      └── skill-api.ts           # Preload API（SkillAPI インターフェースと実装に5メソッド追加）
```

### アーキテクチャ

```
Renderer
  └── skillAPI.scheduleList() / scheduleAdd() / ...
        |
        v  (IPC via safeInvokeUnwrap)
Preload
  └── channels.ts  (SKILL_SCHEDULE_LIST / ADD / UPDATE / DELETE / TOGGLE)
        |
        v  (ipcMain.handle)
Main Process
  ├── skillHandlers.ts  (registerSkillScheduleHandlers)
  |     ├── validateIpcSender()  -> 送信元ウィンドウ検証
  |     ├── validateStringArg()  -> P42準拠3段バリデーション
  |     └── toIpcErrorResponse() -> エラーサニタイズ
  |
  ├── SkillScheduler.ts  (スケジューラ本体)
  |     ├── addSchedule()     -> UUID生成・nextRun計算・ストア保存・アクティベート
  |     ├── updateSchedule()  -> デアクティベート->更新->リアクティベート
  |     ├── deleteSchedule()  -> デアクティベート->削除
  |     ├── enableSchedule()  -> ストア更新->アクティベート
  |     ├── disableSchedule() -> デアクティベート->ストア更新
  |     └── initialize()      -> 永続化データ復元->enabled分をアクティベート
  |
  └── ScheduleStore.ts  (永続化)
        ├── electron-store ベース（name: "skill-schedules"）
        ├── CRUD: getAll / getById / add / update / delete
        ├── addRunResult() -> runHistory管理（最大100件、FIFO）
        └── P19対策: 復元時に Array.isArray + filter でバリデーション
```

### DI設計パターン: Constructor Injection via SchedulerSkillExecutor interface

SkillScheduler はスキルを実行するために SkillExecutor が必要です。しかし、SkillExecutor の完全なインターフェースに依存させると、テスト時に大量のモック定義が必要になります。

そこで、**Interface Segregation Principle（インターフェース分離原則）** に従い、SkillScheduler が必要とする最小限のメソッドだけを持つインターフェース `SchedulerSkillExecutor` を定義しています。

```typescript
// SkillScheduler.ts で定義
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

**Phase 2 設計との差異**: Phase 2 では Setter Injection パターン（`setSkillExecutor()`, `setMainWindow()`）が提案されていたが、実装では Constructor Injection に変更した。理由は以下の通り。

- SkillScheduler の生成時点で ScheduleStore と SkillExecutor の両方が利用可能であった
- Constructor Injection の方がテスト時のモック注入が簡潔
- `SchedulerSkillExecutor` インターフェースにより、SkillExecutor の全メソッドへの依存を回避

```typescript
// 実装のコンストラクタ
export class SkillScheduler {
  constructor(
    scheduleStore: ScheduleStore,
    skillExecutor: SchedulerSkillExecutor,  // DI: 最小インターフェース
  ) { ... }
}
```

### タイマー管理: activeJobs Map + ActiveJob type discriminator

SkillScheduler は `activeJobs: Map<string, ActiveJob>` で全アクティブジョブを一元管理しています。

```typescript
interface ActiveJob {
  type: "cron" | "interval" | "timeout"; // type discriminator
  ref: ScheduledTask | ReturnType<typeof setTimeout>; // タイマー参照
}
```

**Phase 2 設計との差異**: Phase 2 では `cronTasks` と `timers` の2つの Map に分離する設計だったが、実装では `activeJobs` 1つの Map に統合した。理由は以下の通り。

- 1つの Map で管理することで、`deactivateSchedule()` で type を switch して適切な停止処理を呼び分ける
- ジョブの存在確認が `activeJobs.has(id)` の一発で完結する
- `getActiveJobCount()` や `hasActiveJob()` などのテスト用メソッドも簡潔に実装可能

#### アクティベーション方式

| スケジュール種別 | 使用メカニズム                     | ActiveJob.type     | 停止方法          |
| ---------------- | ---------------------------------- | ------------------ | ----------------- |
| cron             | `node-cron` の `cron.schedule()`   | `"cron"`           | `task.stop()`     |
| interval         | `setInterval()`                    | `"interval"`       | `clearInterval()` |
| once             | `setTimeout()`                     | `"timeout"`        | `clearTimeout()`  |
| event            | `registerEventListener()` 内で判定 | (Map に登録しない) | N/A               |

#### deactivateSchedule のフロー

```typescript
private deactivateSchedule(id: string): void {
  const job = this.activeJobs.get(id);
  if (!job) return;  // 存在しなければ何もしない

  switch (job.type) {
    case "cron":    (job.ref as ScheduledTask).stop();             break;
    case "interval": clearInterval(job.ref as ReturnType<typeof setInterval>); break;
    case "timeout":  clearTimeout(job.ref as ReturnType<typeof setTimeout>);   break;
  }
  this.activeJobs.delete(id);
}
```

P5対策として、`activateSchedule()` の冒頭で必ず `deactivateSchedule(id)` を呼び出し、二重登録を防止しています。

### スケジュール実行ロジック（executeScheduledSkill）

1. `startedAt`（ISO 8601）と `runId`（UUID v4）を生成
2. `skillExecutor.execute()` にスキル情報を渡して実行
3. `buildRunResult()` ヘルパーで `ScheduledRunResult` を構築（成功/失敗に応じて output/error を設定）
4. `scheduleStore.addRunResult()` で履歴に追加（最大100件維持）
5. cron/interval の場合は `calculateNextRun()` で次回実行時刻を再計算
6. once の場合は実行後に `disableSchedule()` で自動無効化

### セキュリティ設計（P42 / P5 / P19 対策）

#### 4層セキュリティ

| 層  | 対策                 | 対象箇所                                              | 準拠                     |
| --- | -------------------- | ----------------------------------------------------- | ------------------------ |
| 1   | ホワイトリスト検証   | Preload `ALLOWED_INVOKE_CHANNELS`                     | IPC セキュリティ原則     |
| 2   | 送信元ウィンドウ検証 | Main `validateIpcSender()`                            | NFR-02                   |
| 3   | 引数バリデーション   | Main `validateStringArg()` + スケジュール種別固有検証 | P42（3段バリデーション） |
| 4   | エラーサニタイズ     | Main `toIpcErrorResponse()`                           | IPC セキュリティ原則     |

#### P42 準拠 3段バリデーション

IPCハンドラ内の `validateStringArg()` 共通関数で実現:

```typescript
function validateStringArg(
  value: unknown,
  argName: string,
): { success: false; error: string } | null {
  // 1. 型チェック: typeof !== "string"
  // 2. 空文字列チェック: (implicit in trim)
  // 3. トリム空文字列チェック: .trim() === ""
  if (typeof value !== "string" || value.trim() === "") {
    return { success: false, error: `${argName} must be a non-empty string` };
  }
  return null;
}
```

#### P5 対策: タイマー二重登録防止

`activateSchedule()` の冒頭で `deactivateSchedule(schedule.id)` を呼び出し、既存のジョブがあれば先に停止してから新しいジョブを登録。

#### P19 対策: electron-store 復元時のバリデーション

`ScheduleStore` のコンストラクタで `unknown` 型として取得し、`Array.isArray()` + `.filter()` で有効なデータのみを復元:

```typescript
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

### ScheduleStore API

| メソッド                   | 引数                              | 戻り値                        | 説明                                  |
| -------------------------- | --------------------------------- | ----------------------------- | ------------------------------------- |
| `getAll()`                 | なし                              | `ScheduledSkill[]`            | 全スケジュールのコピーを返す          |
| `getById(id)`              | `string`                          | `ScheduledSkill \| undefined` | ID指定で取得                          |
| `add(schedule)`            | `ScheduledSkill`                  | `ScheduledSkill`              | 追加して永続化                        |
| `update(id, updates)`      | `string, Partial<ScheduledSkill>` | `void`                        | 更新して永続化。IDは上書き不可        |
| `delete(id)`               | `string`                          | `void`                        | 削除して永続化                        |
| `addRunResult(id, result)` | `string, ScheduledRunResult`      | `void`                        | 実行結果を先頭に追加（最大100件維持） |

#### 永続化方式

- `electron-store` を使用（ファイルベースの JSON ストア）
- ストアファイル名: `skill-schedules.json`
- スキーマ: `{ scheduledSkills: ScheduledSkill[] }`
- 復元時は `unknown` 型で受け取り、`Array.isArray()` + `.filter()` でバリデーション（P19準拠）

### IPC チャンネル仕様（5チャンネル）

#### skill:schedule:list

| 項目         | 値                                          |
| ------------ | ------------------------------------------- |
| チャンネル名 | `skill:schedule:list`                       |
| 定数         | `IPC_CHANNELS.SKILL_SCHEDULE_LIST`          |
| 引数         | なし                                        |
| 戻り値       | `{ success: true, data: ScheduledSkill[] }` |
| エラー       | `{ success: false, error: string }`         |
| セキュリティ | validateIpcSender（送信元ウィンドウ検証）   |

#### skill:schedule:add

| 項目           | 値                                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------------- |
| チャンネル名   | `skill:schedule:add`                                                                                       |
| 定数           | `IPC_CHANNELS.SKILL_SCHEDULE_ADD`                                                                          |
| 引数           | `Omit<ScheduledSkill, "id" \| "runHistory">`                                                               |
| 戻り値         | `{ success: true, data: ScheduledSkill }`                                                                  |
| バリデーション | skillName (3段), prompt (3段), schedule.type (必須), cronExpression (cron時3段), interval (interval時正数) |

#### skill:schedule:update

| 項目           | 値                                                 |
| -------------- | -------------------------------------------------- |
| チャンネル名   | `skill:schedule:update`                            |
| 定数           | `IPC_CHANNELS.SKILL_SCHEDULE_UPDATE`               |
| 引数           | `{ id: string, updates: Partial<ScheduledSkill> }` |
| 戻り値         | `{ success: true }`                                |
| バリデーション | id (3段)                                           |

#### skill:schedule:delete

| 項目           | 値                                   |
| -------------- | ------------------------------------ |
| チャンネル名   | `skill:schedule:delete`              |
| 定数           | `IPC_CHANNELS.SKILL_SCHEDULE_DELETE` |
| 引数           | `{ id: string }`                     |
| 戻り値         | `{ success: true }`                  |
| バリデーション | id (3段)                             |

#### skill:schedule:toggle

| 項目         | 値                                                                    |
| ------------ | --------------------------------------------------------------------- |
| チャンネル名 | `skill:schedule:toggle`                                               |
| 定数         | `IPC_CHANNELS.SKILL_SCHEDULE_TOGGLE`                                  |
| 引数         | `{ id: string }`                                                      |
| 戻り値       | `{ success: true, data: ScheduledSkill \| undefined }`                |
| ロジック     | enabled なら disableSchedule、disabled なら enableSchedule を呼び出し |

### 型定義（packages/shared/src/types/skill-schedule.ts）

```typescript
/** スケジュール済みスキル */
interface ScheduledSkill {
  id: string; // UUID v4
  skillName: string; // 実行対象スキル名
  prompt: string; // スキル実行時プロンプト
  schedule: SkillSchedule; // スケジュール設定
  enabled: boolean; // 有効/無効フラグ
  runHistory: ScheduledRunResult[]; // 実行履歴（最大100件、新しい順）
  notification: NotificationSettings; // 通知設定
  lastRun?: string | null; // 最終実行日時 (ISO 8601)
  nextRun?: string | null; // 次回実行予定 (ISO 8601)
  createdAt: string; // 作成日時 (ISO 8601)
  updatedAt: string; // 更新日時 (ISO 8601)
}

/** スケジュール設定 */
interface SkillSchedule {
  type: "cron" | "interval" | "once" | "event";
  cronExpression?: string; // cron式 (type: cron)
  interval?: number; // 実行間隔 ms (type: interval)
  runAt?: string | null; // 実行日時 ISO 8601 (type: once)
  event?: "app_start" | "file_change" | "git_commit"; // トリガーイベント (type: event)
  eventConfig?: Record<string, unknown>; // イベント固有設定
}

/** 通知設定 */
interface NotificationSettings {
  onSuccess: boolean; // 成功時通知
  onFailure: boolean; // 失敗時通知
  notificationType: "system" | "inApp" | "both"; // 通知方式
}

/** スケジュール実行結果 */
interface ScheduledRunResult {
  runId: string; // UUID v4
  startedAt: string; // 開始日時 (ISO 8601)
  success: boolean; // 成功/失敗
  completedAt?: string | null; // 完了日時 (ISO 8601)
  output?: string; // 出力テキスト
  error?: string; // エラーメッセージ
}
```

### Date 型の IPC シリアライズ

- 全ての日時フィールド（`lastRun`, `nextRun`, `createdAt`, `updatedAt`, `startedAt`, `completedAt`, `runAt`）は **ISO 8601 文字列** (`string`) で定義
- Main Process 内部の `SkillScheduler` は `Date` オブジェクトで計算し、`.toISOString()` で文字列に変換してストアに保存
- IPC 境界を跨ぐ際の追加変換は不要（ストア時点で既に文字列化済み）

### Preload API の使い方

Renderer から利用する場合のコード例:

```typescript
// スケジュール一覧取得
const schedules = await window.electronAPI.skill.scheduleList();

// スケジュール追加
const newSchedule = await window.electronAPI.skill.scheduleAdd({
  skillName: "daily-report",
  prompt: "本日の進捗をまとめてください",
  schedule: { type: "cron", cronExpression: "0 18 * * 1-5" },
  enabled: true,
  notification: {
    onSuccess: false,
    onFailure: true,
    notificationType: "system",
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// スケジュール有効/無効切り替え
const toggled = await window.electronAPI.skill.scheduleToggle(scheduleId);

// スケジュール削除
await window.electronAPI.skill.scheduleDelete(scheduleId);
```

Preload 実装では `safeInvokeUnwrap` を使用しており、`IpcResult` ラッパーの展開を自動で行う。
`success: false` の場合は Error をスローするため、呼び出し側は try/catch で捕捉する。
