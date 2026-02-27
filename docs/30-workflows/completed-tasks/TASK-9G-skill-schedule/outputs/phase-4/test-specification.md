# Phase 4: テスト仕様書 - TASK-9G スキルスケジュール実行機能

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| Phase      | 4                          |
| 機能名     | TASK-9G-skill-schedule     |
| 作成日     | 2026-02-27                 |
| テスト状態 | Red（全テスト失敗 = 正常） |
| テスト総数 | 76                         |

## テストファイル一覧

| No  | ファイルパス                                                            | テスト数 | 対象           |
| --- | ----------------------------------------------------------------------- | -------- | -------------- |
| 1   | `packages/shared/src/types/__tests__/skill-schedule.test.ts`            | 5        | 型定義         |
| 2   | `apps/desktop/src/main/services/skill/__tests__/ScheduleStore.test.ts`  | 15       | ScheduleStore  |
| 3   | `apps/desktop/src/main/services/skill/__tests__/SkillScheduler.test.ts` | 25       | SkillScheduler |
| 4   | `apps/desktop/src/main/ipc/__tests__/skillScheduleHandlers.test.ts`     | 31       | IPCハンドラー  |

## テストケースサマリ

### 1. 型定義テスト（5テスト）

| ID   | テスト項目                                    | 期待結果                             |
| ---- | --------------------------------------------- | ------------------------------------ |
| T-01 | ScheduledSkill 型が必須フィールドを持つ       | TypeScript コンパイルが通る          |
| T-02 | SkillSchedule.type が4種類を受け入れる        | 各 type で型チェックが通る           |
| T-03 | NotificationSettings.notificationType が3種類 | 各 notificationType で型チェック通る |
| T-04 | ScheduledRunResult 型が必須フィールドを持つ   | TypeScript コンパイルが通る          |
| T-05 | lastRun / nextRun がオプショナル              | null / undefined の両方が代入可能    |

### 2. ScheduleStore テスト（15テスト）

| ID   | テスト項目                               | 期待結果                            |
| ---- | ---------------------------------------- | ----------------------------------- |
| D-01 | 初期状態で空配列を返す                   | `getAll()` が `[]` を返す           |
| D-02 | スケジュール追加後に一覧に含まれる       | `getAll()` が1件を含む              |
| D-03 | 追加時にIDが自動生成される               | id が文字列である                   |
| D-04 | IDでスケジュールを取得できる             | 該当スケジュールが返る              |
| D-05 | 存在しないIDで undefined                 | `undefined` が返る                  |
| D-06 | 更新が反映される                         | enabled が false に変更される       |
| D-07 | 存在しないIDの更新で例外                 | Error がスローされる                |
| D-08 | 削除後に一覧から除外される               | `getAll()` が空配列                 |
| D-09 | 存在しないIDの削除で例外                 | Error がスローされる                |
| D-10 | electron-store の set が変更時に呼ばれる | add/update/delete 後に set 呼び出し |
| D-11 | 実行結果追加で runHistory に蓄積         | runHistory が1件増加                |
| D-12 | runHistory は最大100件                   | 101件追加後に length が 100         |
| D-13 | lastRun が実行結果追加時に更新           | lastRun が実行開始時刻と一致        |
| D-14 | コンストラクタで electron-store から復元 | `get("scheduledSkills")` が呼ばれる |
| D-15 | 不正データで空配列にフォールバック       | クラッシュしない                    |

### 3. SkillScheduler テスト（25テスト）

| ID   | テスト項目                                          | 期待結果                                  |
| ---- | --------------------------------------------------- | ----------------------------------------- |
| S-01 | initialize() で有効スケジュールをアクティベート     | enabled: true の数だけアクティベート      |
| S-02 | initialize() で無効スケジュールはスキップ           | activateSchedule が呼ばれない             |
| S-03 | addSchedule() でストアに保存                        | store.add が1回呼び出される               |
| S-04 | addSchedule() で enabled: true 時にアクティベート   | cron.schedule が呼び出される              |
| S-05 | addSchedule() で nextRun が計算される               | nextRun が null でない                    |
| S-06 | type: "cron" で node-cron に登録                    | cron.schedule(expression, callback)       |
| S-07 | type: "interval" で setInterval 登録                | advanceTimersByTime 後にコールバック実行  |
| S-08 | type: "once" で setTimeout 登録                     | advanceTimersByTime 後に1回実行           |
| S-09 | type: "event" でリスナー登録                        | イベントリスナーが設定される              |
| S-10 | 無効 cron 式で例外スロー                            | Error がスローされる                      |
| S-11 | updateSchedule() でストア更新                       | store.update が呼ばれる                   |
| S-12 | updateSchedule() でリアクティベート                 | 既存停止 -> 新タイマー開始                |
| S-13 | deleteSchedule() でタイマー停止 + ストア削除        | stop() + store.delete                     |
| S-14 | enableSchedule() で有効化 + アクティベート          | store.update(id, { enabled: true })       |
| S-15 | disableSchedule() で無効化 + タイマー停止           | stop() + enabled: false 更新              |
| S-16 | executeScheduledSkill で SkillExecutor.execute 呼出 | execute が呼ばれる                        |
| S-17 | 実行成功時に success: true の結果追加               | addRunResult が success: true で呼ばれる  |
| S-18 | 実行失敗時に success: false + error 追加            | addRunResult が success: false で呼ばれる |
| S-19 | 実行後に nextRun が再計算される                     | update が nextRun 付きで呼ばれる          |
| S-20 | type: "once" 実行後にスケジュール自動無効化         | enabled: false に更新される               |
| S-21 | cron の nextRun が次回実行時刻                      | 現在時刻より後の Date                     |
| S-22 | interval の nextRun が now + interval ms            | Date.now() + interval に近い値            |
| S-23 | once の nextRun が runAt（未来）                    | runAt と一致                              |
| S-24 | once の nextRun が undefined（過去）                | undefined が返る                          |
| S-25 | event の nextRun が undefined                       | undefined が返る                          |

### 4. IPCハンドラーテスト（31テスト）

| ID   | テスト項目                             | 期待結果                                          |
| ---- | -------------------------------------- | ------------------------------------------------- |
| H-01 | list: スケジュール一覧取得             | { success: true, data: ScheduledSkill[] }         |
| H-02 | add: 新規スケジュール追加              | { success: true, data: ScheduledSkill }           |
| H-03 | update: 既存スケジュール更新           | { success: true }                                 |
| H-04 | delete: スケジュール削除               | { success: true }                                 |
| H-05 | toggle: 有効→無効切り替え              | { success: true }、disableSchedule 呼出           |
| H-06 | toggle: 無効→有効切り替え              | { success: true }、enableSchedule 呼出            |
| H-07 | add: skillName 空文字列                | skillName must be a non-empty string              |
| H-08 | add: skillName スペースのみ            | skillName must be a non-empty string              |
| H-09 | add: skillName 非文字列                | skillName must be a non-empty string              |
| H-10 | add: prompt 空文字列                   | prompt must be a non-empty string                 |
| H-11 | add: schedule 未指定                   | schedule must be a valid object                   |
| H-12 | add: schedule.type 不正値              | schedule.type must be one of: cron, interval, ... |
| H-13 | add: cron で cronExpression 未指定     | cronExpression is required for cron schedule      |
| H-14 | add: interval で interval 0以下        | interval must be a positive number                |
| H-15 | update: id 空文字列                    | id must be a non-empty string                     |
| H-16 | update: id スペースのみ                | id must be a non-empty string                     |
| H-17 | delete: id 未指定                      | id must be a non-empty string                     |
| H-18 | toggle: id 空文字列                    | id must be a non-empty string                     |
| H-19 | update: 存在しないID                   | Schedule not found: ...                           |
| H-20 | delete: 存在しないID                   | Schedule not found: ...                           |
| H-21 | toggle: 存在しないID                   | Schedule not found: ...                           |
| H-22 | add: 無効 cron 式                      | Invalid cron expression: ...                      |
| H-23 | 全チャンネル: 予期しない Error         | Internal error（内部情報漏洩防止）                |
| H-24 | validateIpcSender が invalid の場合    | IPC_UNAUTHORIZED エラー                           |
| H-25 | 全5チャンネルで validateIpcSender 呼出 | 各ハンドラーで1回呼出                             |
| H-26 | validateIpcSender に正しい引数         | getAllowedWindows が [mainWindow] を返す          |
| H-27 | register で5チャンネル登録             | ipcMain.handle が5回呼出                          |
| H-28 | unregister で5チャンネル解除           | ipcMain.removeHandler が5回呼出                   |
| H-29 | チャンネル名が IPC_CHANNELS 定数使用   | ハードコード文字列が存在しない                    |
| H-30 | list の lastRun/nextRun が ISO 8601    | typeof === "string" かつ ISO 8601 形式            |
| H-31 | add の nextRun が ISO 8601             | new Date(nextRun).toISOString() === nextRun       |

## コンプライアンス確認

| ルール | 対策                                                                 | 対応テスト           |
| ------ | -------------------------------------------------------------------- | -------------------- |
| P9     | beforeEach で vi.clearAllMocks() + 新インスタンス生成                | 全テストファイル     |
| P13    | vi.useFakeTimers() + vi.advanceTimersByTime()（runAllTimers 不使用） | SkillScheduler       |
| P19    | 不正データでのフォールバック検証                                     | D-15                 |
| P42    | 3段バリデーション（型 -> 空文字 -> .trim()空文字）                   | H-07~H-09, H-15~H-18 |
| P44    | IPC引数形式とPreload側の一致                                         | H-01~H-06            |
| P41    | getAllowedWindows コールバック検証                                   | H-26                 |
