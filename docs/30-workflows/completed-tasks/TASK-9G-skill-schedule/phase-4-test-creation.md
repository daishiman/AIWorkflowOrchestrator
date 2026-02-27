# Phase 4: テスト作成（TDD: Red）— TASK-9G スキルスケジュール実行機能

## メタ情報

| 項目       | 値                                               |
| ---------- | ------------------------------------------------ |
| Phase      | 4                                                |
| 機能名     | TASK-9G-skill-schedule                           |
| 作成日     | 2026-02-27                                       |
| 前提Phase  | Phase 1-3（要件定義・設計・設計レビュー）        |
| 依存タスク | TASK-9B（SkillService / SkillExecutor 実装済み） |

## 目的

スキルスケジュール実行機能（SkillScheduler・ScheduleStore・IPCハンドラー・型定義）のテストを**実装より先に作成**し、全テストが **Red 状態**（失敗）であることを確認する。TDD の Red フェーズとして、テストが実装の仕様書となる。

## 実行タスク

### Task 1: 型定義テスト作成（`skill-schedule.test.ts`）

**配置先**: `packages/shared/src/types/__tests__/skill-schedule.test.ts`

#### 1.1 テストケース一覧

| No   | テスト項目                                                                                                    | 期待結果                               |
| ---- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| T-01 | ScheduledSkill 型が必須フィールド（id, skillName, prompt, schedule, enabled, runHistory, notification）を持つ | TypeScript コンパイルが通る            |
| T-02 | SkillSchedule の type が `"cron" \| "interval" \| "once" \| "event"` の4種類を受け入れる                      | 各 type で型チェックが通る             |
| T-03 | NotificationSettings の notificationType が `"system" \| "inApp" \| "both"` の3種類を受け入れる               | 各 notificationType で型チェックが通る |
| T-04 | ScheduledRunResult 型が必須フィールド（runId, startedAt, success）を持つ                                      | TypeScript コンパイルが通る            |
| T-05 | ScheduledSkill.lastRun / nextRun がオプショナル（`string \| null \| undefined`）である                        | null / undefined の両方が代入可能      |

---

### Task 2: ScheduleStore テスト作成（`ScheduleStore.test.ts`）

**配置先**: `apps/desktop/src/main/services/skill/__tests__/ScheduleStore.test.ts`

#### 2.1 テスト基盤セットアップ

```typescript
// electron-store モック
vi.mock("electron-store", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      get: vi.fn().mockReturnValue([]),
      set: vi.fn(),
    })),
  };
});
```

**beforeEach でのリセット（P9対策）**:

```typescript
let store: ScheduleStore;

beforeEach(() => {
  vi.clearAllMocks();
  store = new ScheduleStore();
});
```

#### 2.2 テストケース一覧（CRUD操作）

| No   | テスト項目                                                 | 期待結果                                                |
| ---- | ---------------------------------------------------------- | ------------------------------------------------------- |
| D-01 | 初期状態でスケジュール一覧が空配列を返す                   | `getAll()` が `[]` を返す                               |
| D-02 | スケジュールを追加すると一覧に含まれる                     | `add()` 後に `getAll()` が1件を含む                     |
| D-03 | 追加されたスケジュールに自動生成されたIDが付与される       | `id` が UUID v4 形式の文字列である                      |
| D-04 | IDを指定してスケジュールを取得できる                       | `getById(id)` が該当スケジュールを返す                  |
| D-05 | 存在しないIDで取得すると undefined を返す                  | `getById("non-existent")` が `undefined` を返す         |
| D-06 | スケジュールを更新すると変更が反映される                   | `update(id, { enabled: false })` 後に enabled が false  |
| D-07 | 存在しないIDの更新で例外がスローされる                     | `update("non-existent", ...)` が Error をスロー         |
| D-08 | スケジュールを削除すると一覧から除外される                 | `delete(id)` 後に `getAll()` が空配列を返す             |
| D-09 | 存在しないIDの削除で例外がスローされる                     | `delete("non-existent")` が Error をスロー              |
| D-10 | electron-store の `set` がスケジュール変更時に呼び出される | `add` / `update` / `delete` 後に `store.set` が呼ばれる |

#### 2.3 テストケース一覧（実行履歴）

| No   | テスト項目                                                 | 期待結果                                             |
| ---- | ---------------------------------------------------------- | ---------------------------------------------------- |
| D-11 | 実行結果を追加すると runHistory に蓄積される               | `addRunResult(id, result)` 後に runHistory が1件増加 |
| D-12 | runHistory は最大100件を保持し、超過分は古い順に削除される | 101件追加後に runHistory.length が 100               |
| D-13 | lastRun が実行結果追加時に更新される                       | `addRunResult` 後に lastRun が実行開始時刻と一致     |

#### 2.4 テストケース一覧（永続化復元）

| No   | テスト項目                                                     | 期待結果                          |
| ---- | -------------------------------------------------------------- | --------------------------------- |
| D-14 | コンストラクタで electron-store からスケジュールが復元される   | `get("schedules")` が呼び出される |
| D-15 | 保存データが不正（配列でない）場合に空配列にフォールバックする | 破損データでもクラッシュしない    |

---

### Task 3: SkillScheduler テスト作成（`SkillScheduler.test.ts`）

**配置先**: `apps/desktop/src/main/services/skill/__tests__/SkillScheduler.test.ts`

#### 3.1 テスト基盤セットアップ

```typescript
// node-cron モック
vi.mock("node-cron", () => ({
  schedule: vi.fn().mockReturnValue({
    stop: vi.fn(),
    start: vi.fn(),
  }),
  validate: vi.fn().mockReturnValue(true),
}));

// ScheduleStore モック
const mockScheduleStore = {
  getAll: vi.fn().mockReturnValue([]),
  getById: vi.fn(),
  add: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  addRunResult: vi.fn(),
};

// SkillExecutor モック
const mockSkillExecutor = {
  execute: vi.fn().mockResolvedValue({ success: true, output: "done" }),
};
```

**タイマーテスト基盤（P13対策）**:

```typescript
beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  scheduler = new SkillScheduler(mockScheduleStore, mockSkillExecutor);
});

afterEach(() => {
  vi.useRealTimers();
});
```

#### 3.2 テストケース一覧（初期化）

| No   | テスト項目                                                            | 期待結果                                                       |
| ---- | --------------------------------------------------------------------- | -------------------------------------------------------------- |
| S-01 | initialize() でストアの有効スケジュールが全てアクティベートされる     | enabled: true のスケジュール数だけ activateSchedule が呼ばれる |
| S-02 | initialize() で enabled: false のスケジュールはアクティベートされない | activateSchedule が呼ばれない                                  |

#### 3.3 テストケース一覧（スケジュール追加）

| No   | テスト項目                                                  | 期待結果                                                      |
| ---- | ----------------------------------------------------------- | ------------------------------------------------------------- |
| S-03 | addSchedule() でストアにスケジュールが保存される            | `mockScheduleStore.add` が1回呼び出される                     |
| S-04 | addSchedule() で enabled: true の場合にアクティベートされる | node-cron の `schedule` が呼び出される（type: "cron" の場合） |
| S-05 | addSchedule() で nextRun が計算される                       | 返却された ScheduledSkill の nextRun が null でない           |

#### 3.4 テストケース一覧（スケジュール方式別）

| No   | テスト項目                                                 | 期待結果                                                        |
| ---- | ---------------------------------------------------------- | --------------------------------------------------------------- |
| S-06 | type: "cron" のスケジュールが node-cron で登録される       | `cron.schedule(expression, callback)` が呼び出される            |
| S-07 | type: "interval" のスケジュールが setInterval で登録される | `vi.advanceTimersByTime(interval)` 後にコールバックが実行される |
| S-08 | type: "once" のスケジュールが setTimeout で登録される      | `vi.advanceTimersByTime(delay)` 後にコールバックが1回実行される |
| S-09 | type: "event" で event: "app_start" のリスナーが登録される | イベントリスナーが設定される                                    |
| S-10 | 無効な cron 式で addSchedule すると例外がスローされる      | `cron.validate` が false を返した場合に Error がスロー          |

#### 3.5 テストケース一覧（スケジュール更新・削除・切り替え）

| No   | テスト項目                                                        | 期待結果                                                      |
| ---- | ----------------------------------------------------------------- | ------------------------------------------------------------- |
| S-11 | updateSchedule() でストアが更新される                             | `mockScheduleStore.update` が呼び出される                     |
| S-12 | updateSchedule() でスケジュール設定変更時にリアクティベートされる | 既存タイマーが停止後に新タイマーが開始される                  |
| S-13 | deleteSchedule() でタイマーが停止しストアから削除される           | `cron.stop()` が呼ばれ、`mockScheduleStore.delete` が呼ばれる |
| S-14 | enableSchedule() で無効→有効に切り替わりアクティベートされる      | `mockScheduleStore.update(id, { enabled: true })` が呼ばれる  |
| S-15 | disableSchedule() で有効→無効に切り替わりタイマーが停止する       | `cron.stop()` が呼ばれ enabled が false に更新される          |

#### 3.6 テストケース一覧（スケジュール実行）

| No   | テスト項目                                                                | 期待結果                                                      |
| ---- | ------------------------------------------------------------------------- | ------------------------------------------------------------- |
| S-16 | executeScheduledSkill で SkillExecutor.execute が呼び出される             | `mockSkillExecutor.execute` が呼ばれる                        |
| S-17 | 実行成功時に runHistory に success: true の結果が追加される               | `mockScheduleStore.addRunResult` が success: true で呼ばれる  |
| S-18 | 実行失敗時に runHistory に success: false と error メッセージが追加される | `mockScheduleStore.addRunResult` が success: false で呼ばれる |
| S-19 | 実行後に nextRun が再計算される（cron / interval の場合）                 | `mockScheduleStore.update` が nextRun 付きで呼ばれる          |
| S-20 | type: "once" の実行後にスケジュールが自動無効化される                     | `disableSchedule(id)` が呼ばれる                              |

#### 3.7 テストケース一覧（nextRun 計算）

| No   | テスト項目                                                     | 期待結果                                         |
| ---- | -------------------------------------------------------------- | ------------------------------------------------ |
| S-21 | type: "cron" の nextRun が cron 式に基づく次回実行時刻を返す   | 現在時刻より後の Date オブジェクトが返る         |
| S-22 | type: "interval" の nextRun が現在時刻 + interval ミリ秒を返す | `Date.now() + interval` に近い値が返る           |
| S-23 | type: "once" で runAt が未来の場合に runAt を返す              | runAt と一致する Date が返る                     |
| S-24 | type: "once" で runAt が過去の場合に undefined を返す          | `undefined` が返る                               |
| S-25 | type: "event" の nextRun が undefined を返す                   | `undefined` が返る（イベント駆動のため時刻不定） |

---

### Task 4: IPCハンドラーテスト作成（`skillScheduleHandlers.test.ts`）

**配置先**: `apps/desktop/src/main/ipc/__tests__/skillScheduleHandlers.test.ts`

#### 4.1 テスト基盤セットアップ

```typescript
// electron モック
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn((channel: string, handler: Function) => {
      handlerMap.set(channel, handler);
    }),
    removeHandler: vi.fn((channel: string) => {
      handlerMap.delete(channel);
    }),
  },
  BrowserWindow: {
    fromWebContents: vi.fn(),
  },
}));

// ipc-validator モック
vi.mock("../../infrastructure/security/ipc-validator.js", () => ({
  validateIpcSender: vi.fn().mockReturnValue({ valid: true }),
  toIPCValidationError: vi.fn().mockImplementation((result) => ({
    success: false,
    error: {
      code: result.errorCode ?? "IPC_UNAUTHORIZED",
      message: result.errorMessage ?? "Unauthorized IPC call",
    },
  })),
}));
```

**SkillScheduler モック**:

```typescript
const mockSkillScheduler = {
  addSchedule: vi.fn(),
  updateSchedule: vi.fn(),
  deleteSchedule: vi.fn(),
  enableSchedule: vi.fn(),
  disableSchedule: vi.fn(),
};

const mockScheduleStore = {
  getAll: vi.fn().mockReturnValue([]),
  getById: vi.fn(),
};
```

#### 4.2 テストケース一覧（正常系）

| No   | チャンネル              | テスト項目                                       | 期待結果                                          |
| ---- | ----------------------- | ------------------------------------------------ | ------------------------------------------------- |
| H-01 | `skill:schedule:list`   | スケジュール一覧を取得する                       | `{ success: true, data: ScheduledSkill[] }`       |
| H-02 | `skill:schedule:add`    | 新規スケジュールを追加する                       | `{ success: true, data: ScheduledSkill }`         |
| H-03 | `skill:schedule:update` | 既存スケジュールを更新する                       | `{ success: true }`                               |
| H-04 | `skill:schedule:delete` | スケジュールを削除する                           | `{ success: true }`                               |
| H-05 | `skill:schedule:toggle` | スケジュールの有効/無効を切り替える（有効→無効） | `{ success: true }`、`disableSchedule` が呼ばれる |
| H-06 | `skill:schedule:toggle` | スケジュールの有効/無効を切り替える（無効→有効） | `{ success: true }`、`enableSchedule` が呼ばれる  |

#### 4.3 テストケース一覧（バリデーションエラー — P42準拠3段バリデーション）

| No   | チャンネル              | テスト項目                              | 期待結果                                                                                 |
| ---- | ----------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------- |
| H-07 | `skill:schedule:add`    | skillName が空文字列                    | `{ success: false, error: "skillName must be a non-empty string" }`                      |
| H-08 | `skill:schedule:add`    | skillName がスペースのみ `"   "`        | `{ success: false, error: "skillName must be a non-empty string" }`                      |
| H-09 | `skill:schedule:add`    | skillName が文字列以外（数値）          | `{ success: false, error: "skillName must be a non-empty string" }`                      |
| H-10 | `skill:schedule:add`    | prompt が空文字列                       | `{ success: false, error: "prompt must be a non-empty string" }`                         |
| H-11 | `skill:schedule:add`    | schedule が未指定（undefined）          | `{ success: false, error: "schedule must be a valid object" }`                           |
| H-12 | `skill:schedule:add`    | schedule.type が不正な値（`"weekly"`）  | `{ success: false, error: "schedule.type must be one of: cron, interval, once, event" }` |
| H-13 | `skill:schedule:add`    | type: "cron" で cronExpression が未指定 | `{ success: false, error: "cronExpression is required for cron schedule" }`              |
| H-14 | `skill:schedule:add`    | type: "interval" で interval が0以下    | `{ success: false, error: "interval must be a positive number" }`                        |
| H-15 | `skill:schedule:update` | id が空文字列                           | `{ success: false, error: "id must be a non-empty string" }`                             |
| H-16 | `skill:schedule:update` | id がスペースのみ                       | `{ success: false, error: "id must be a non-empty string" }`                             |
| H-17 | `skill:schedule:delete` | id が未指定（undefined）                | `{ success: false, error: "id must be a non-empty string" }`                             |
| H-18 | `skill:schedule:toggle` | id が空文字列                           | `{ success: false, error: "id must be a non-empty string" }`                             |

#### 4.4 テストケース一覧（サービスエラー）

| No   | チャンネル              | テスト項目             | 期待結果                                                              |
| ---- | ----------------------- | ---------------------- | --------------------------------------------------------------------- |
| H-19 | `skill:schedule:update` | 存在しないIDで更新     | `{ success: false, error: "Schedule not found: ..." }`                |
| H-20 | `skill:schedule:delete` | 存在しないIDで削除     | `{ success: false, error: "Schedule not found: ..." }`                |
| H-21 | `skill:schedule:toggle` | 存在しないIDで切り替え | `{ success: false, error: "Schedule not found: ..." }`                |
| H-22 | `skill:schedule:add`    | 無効な cron 式         | `{ success: false, error: "Invalid cron expression: ..." }`           |
| H-23 | 全チャンネル共通        | 予期しない Error       | `{ success: false, error: "Internal error" }`（内部情報を漏洩しない） |

#### 4.5 テストケース一覧（セキュリティ）

| No   | テスト項目                                                          | 期待結果                                             |
| ---- | ------------------------------------------------------------------- | ---------------------------------------------------- |
| H-24 | validateIpcSender が `{ valid: false }` を返す場合                  | `toIPCValidationError` の結果が throw される         |
| H-25 | 全5チャンネルで validateIpcSender が呼び出される                    | 各ハンドラーで `validateIpcSender` が1回呼び出される |
| H-26 | validateIpcSender に正しい引数（event, channel, options）が渡される | `getAllowedWindows` が `[mainWindow]` を返す         |

#### 4.6 テストケース一覧（登録・解除）

| No   | テスト項目                                                      | 期待結果                                  |
| ---- | --------------------------------------------------------------- | ----------------------------------------- |
| H-27 | `registerSkillScheduleHandlers` で5チャンネル全てが登録される   | `ipcMain.handle` が5回呼び出される        |
| H-28 | `unregisterSkillScheduleHandlers` で5チャンネル全てが解除される | `ipcMain.removeHandler` が5回呼び出される |
| H-29 | 登録されるチャンネル名が全て `IPC_CHANNELS` 定数を使用          | ハードコード文字列が存在しない            |

#### 4.7 テストケース一覧（IPCシリアライズ）

| No   | テスト項目                                                   | 期待結果                                               |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------ |
| H-30 | list レスポンスの lastRun / nextRun が ISO 8601 文字列である | `typeof lastRun === "string"` かつ ISO 8601 形式に一致 |
| H-31 | add レスポンスの nextRun が ISO 8601 文字列である            | `new Date(nextRun).toISOString() === nextRun` が成立   |

---

## 参照資料

| 資料                                                                        | 用途                         |
| --------------------------------------------------------------------------- | ---------------------------- |
| Phase 1 成果物（phase-1-requirements.md）                                   | 要件・受け入れ基準           |
| Phase 2 成果物（phase-2-design.md）                                         | 設計成果物                   |
| Phase 3 成果物（phase-3-design-review.md）                                  | レビュー結果                 |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                                | 既存IPCハンドラーパターン    |
| `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.test.ts`             | テストパターン参考           |
| `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.security.test.ts` | セキュリティテストパターン   |
| `apps/desktop/src/main/services/skill/errors.ts`                            | エラークラス定義パターン     |
| `.claude/rules/04-electron-security.md`                                     | IPCセキュリティ原則          |
| `.claude/rules/06-known-pitfalls.md#P13`                                    | タイマーテスト無限ループ防止 |
| `.claude/rules/06-known-pitfalls.md#P42`                                    | .trim() 3段バリデーション    |

## 統合テスト連携

| 連携先                | 内容                                                          |
| --------------------- | ------------------------------------------------------------- |
| Phase 5（実装）       | Phase 4で定義したテスト仕様を満たす実装を追加する             |
| Phase 6（テスト拡充） | Phase 4で不足する境界値・エッジケース・組合せテストを拡張する |

## 成果物

| 成果物                                                                  | 説明                              |
| ----------------------------------------------------------------------- | --------------------------------- |
| `packages/shared/src/types/__tests__/skill-schedule.test.ts`            | 型定義テスト（5テスト）           |
| `apps/desktop/src/main/services/skill/__tests__/ScheduleStore.test.ts`  | ScheduleStore テスト（15テスト）  |
| `apps/desktop/src/main/services/skill/__tests__/SkillScheduler.test.ts` | SkillScheduler テスト（25テスト） |
| `apps/desktop/src/main/ipc/__tests__/skillScheduleHandlers.test.ts`     | IPCハンドラーテスト（31テスト）   |

## 完了条件

- [ ] 4つのテストファイルが作成されている
- [ ] 全テストケース（76テスト）が記述されている
- [ ] テスト実行時に全テストが **Red 状態**（失敗）である（実装が存在しないため）
- [ ] テストファイル内にハードコード文字列のチャンネル名が存在しない（`IPC_CHANNELS` 定数を使用）
- [ ] タイマーテストで `vi.useFakeTimers()` + `vi.advanceTimersByTime()` を使用している（P13対策）
- [ ] `beforeEach` で全モックがリセットされている（P9対策）
- [ ] IPCバリデーションテストが P42 準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）を検証している

## 次のPhase

Phase 5（実装）へ進む。テストを通すための最小限のプロダクションコードを実装する。
