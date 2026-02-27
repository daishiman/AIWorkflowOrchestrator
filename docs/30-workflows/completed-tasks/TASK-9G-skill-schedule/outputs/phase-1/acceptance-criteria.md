# TASK-9G: スキルスケジュール実行機能 — 受け入れ基準書

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| タスクID | TASK-9G                      |
| Phase    | 1（要件定義）                |
| 作成日   | 2026-02-27                   |
| 対応要件 | FR-01〜FR-10、NFR-01〜NFR-11 |
| 状態     | 作成完了                     |

---

## 1. Cronスケジュール関連

### AC-01: Cronスケジュール登録と実行

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-01 |

- **Given**: SkillSchedulerが初期化されている
- **When**: cron式`"*/5 * * * *"`（5分毎）とスキル名`"test-skill"`・プロンプト`"run test"`を指定してスケジュールを追加する
- **Then**:
  - [ ] `node-cron`タスクが登録される
  - [ ] 戻り値の`ScheduledSkill`に`id`（UUID v4）が自動付与されている
  - [ ] `schedule.type`が`"cron"`である
  - [ ] `schedule.cronExpression`が`"*/5 * * * *"`である
  - [ ] `enabled`が`true`である
  - [ ] `runHistory`が空配列である
  - [ ] `nextRun`がISO 8601文字列で次回実行時刻を示している
  - [ ] `createdAt`がISO 8601文字列で現在時刻を示している

### AC-01a: 不正なCron式の拒否

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-01 |

- **Given**: SkillSchedulerが初期化されている
- **When**: 不正なcron式`"invalid-cron"`を指定してスケジュールを追加する
- **Then**:
  - [ ] `VALIDATION_ERROR`（ERR_1005）がスローされる
  - [ ] スケジュールは追加されない
  - [ ] エラーメッセージに「cron expression」に関する記述が含まれる

### AC-01b: 6フィールドCron式の拒否

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-01 |

- **Given**: SkillSchedulerが初期化されている
- **When**: 6フィールドのcron式`"0 */5 * * * *"`（秒フィールド付き）を指定してスケジュールを追加する
- **Then**:
  - [ ] `VALIDATION_ERROR`（ERR_1005）がスローされる
  - [ ] スケジュールは追加されない

---

## 2. インターバルスケジュール関連

### AC-02: インターバルスケジュール登録と実行

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-02 |

- **Given**: SkillSchedulerが初期化されている
- **When**: インターバル`60000`（60秒）とスキル名`"test-skill"`・プロンプト`"run test"`を指定してスケジュールを追加する
- **Then**:
  - [ ] `setInterval`でタイマーが登録される
  - [ ] `schedule.type`が`"interval"`である
  - [ ] `schedule.intervalMs`が`60000`である
  - [ ] 60秒経過後にスキルが自動実行される

### AC-02a: 最小インターバル未満の拒否

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-02 |

- **Given**: SkillSchedulerが初期化されている
- **When**: インターバル`500`（500ms）を指定してスケジュールを追加する
- **Then**:
  - [ ] `VALIDATION_ERROR`（ERR_1004）がスローされる
  - [ ] エラーメッセージに最小インターバル（1000ms）に関する記述が含まれる

### AC-02b: 最大インターバル超過の拒否

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-02 |

- **Given**: SkillSchedulerが初期化されている
- **When**: インターバル`86400001`（24時間+1ms）を指定してスケジュールを追加する
- **Then**:
  - [ ] `VALIDATION_ERROR`（ERR_1004）がスローされる
  - [ ] エラーメッセージに最大インターバル（86400000ms）に関する記述が含まれる

### AC-02c: インターバル境界値（最小値1000ms）

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-02 |

- **Given**: SkillSchedulerが初期化されている
- **When**: インターバル`1000`（1秒ちょうど）を指定してスケジュールを追加する
- **Then**:
  - [ ] スケジュールが正常に追加される
  - [ ] `schedule.intervalMs`が`1000`である

### AC-02d: インターバル境界値（最大値86400000ms）

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-02 |

- **Given**: SkillSchedulerが初期化されている
- **When**: インターバル`86400000`（24時間ちょうど）を指定してスケジュールを追加する
- **Then**:
  - [ ] スケジュールが正常に追加される
  - [ ] `schedule.intervalMs`が`86400000`である

---

## 3. ワンショットスケジュール関連

### AC-03: ワンショットスケジュール登録と実行

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-03 |

- **Given**: SkillSchedulerが初期化されている
- **When**: 未来の日時（ISO 8601）`"2026-03-01T09:00:00+09:00"`を指定してワンショットスケジュールを追加する
- **Then**:
  - [ ] `setTimeout`でタイマーが登録される
  - [ ] `schedule.type`が`"once"`である
  - [ ] 指定時刻に1回だけスキルが実行される
  - [ ] 実行後に`enabled`が`false`に自動設定される

### AC-03a: 過去日時の拒否

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-03 |

- **Given**: SkillSchedulerが初期化されている
- **When**: 過去の日時`"2020-01-01T00:00:00Z"`を指定してワンショットスケジュールを追加する
- **Then**:
  - [ ] `VALIDATION_ERROR`（ERR_1004）がスローされる
  - [ ] エラーメッセージに「past date」または「過去の日時」に関する記述が含まれる

### AC-03b: 不正なISO 8601形式の拒否

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-03 |

- **Given**: SkillSchedulerが初期化されている
- **When**: 不正な日時形式`"2026/03/01 09:00"`を指定してワンショットスケジュールを追加する
- **Then**:
  - [ ] `VALIDATION_ERROR`（ERR_1005）がスローされる
  - [ ] スケジュールは追加されない

---

## 4. イベントトリガースケジュール関連

### AC-04: app_startイベントトリガー

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-04 |

- **Given**: `event: "app_start"`のスケジュールが`enabled: true`で保存されている
- **When**: アプリケーションが起動し`SkillScheduler.initialize()`が呼ばれる
- **Then**:
  - [ ] `app_start`イベントのスケジュールが即座に実行される
  - [ ] 実行結果が`runHistory`に記録される

### AC-04a: file_changeイベントの型定義

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-04 |

- **Given**: イベントトリガーのスケジュール型定義が存在する
- **When**: `event: "file_change"`と`eventConfig.watchPaths: ["/path/to/watch"]`を指定してスケジュールを追加する
- **Then**:
  - [ ] スケジュールが正常に保存される
  - [ ] `schedule.event`が`"file_change"`である
  - [ ] `schedule.eventConfig.watchPaths`が`["/path/to/watch"]`である
  - [ ] タイマーは登録されない（詳細実装は別タスク）

### AC-04b: git_commitイベントの型定義

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-04 |

- **Given**: イベントトリガーのスケジュール型定義が存在する
- **When**: `event: "git_commit"`と`eventConfig.repositoryPath: "/path/to/repo"`を指定してスケジュールを追加する
- **Then**:
  - [ ] スケジュールが正常に保存される
  - [ ] `schedule.event`が`"git_commit"`である
  - [ ] `schedule.eventConfig.repositoryPath`が`"/path/to/repo"`である
  - [ ] タイマーは登録されない（詳細実装は別タスク）

### AC-04c: 無効状態のapp_startスケジュールは起動時に実行されない

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-04 |

- **Given**: `event: "app_start"`のスケジュールが`enabled: false`で保存されている
- **When**: アプリケーションが起動し`SkillScheduler.initialize()`が呼ばれる
- **Then**:
  - [ ] スケジュールは実行されない
  - [ ] `runHistory`は変化しない

---

## 5. トグル関連

### AC-05: 有効→無効トグル

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-05 |

- **Given**: `enabled: true`のcronスケジュールが存在し、タイマーが稼働中である
- **When**: `skill:schedule:toggle` IPCチャンネルで該当スケジュールIDを送信する
- **Then**:
  - [ ] `enabled`が`false`になる
  - [ ] `node-cron`タスクの`stop()`が呼ばれる
  - [ ] タイマー参照がMapから削除される
  - [ ] 戻り値の`ScheduledSkill.enabled`が`false`である
  - [ ] electron-storeに即時永続化される

### AC-05a: 無効→有効トグル

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-05 |

- **Given**: `enabled: false`のintervalスケジュールが存在する
- **When**: `skill:schedule:toggle` IPCチャンネルで該当スケジュールIDを送信する
- **Then**:
  - [ ] `enabled`が`true`になる
  - [ ] `setInterval`でタイマーが再登録される
  - [ ] 戻り値の`ScheduledSkill.enabled`が`true`である
  - [ ] electron-storeに即時永続化される

### AC-05b: 存在しないIDでのトグル拒否

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-05 |

- **Given**: スケジュールが0件または指定IDが存在しない
- **When**: 存在しないID`"non-existent-id"`で`skill:schedule:toggle`を送信する
- **Then**:
  - [ ] `RESOURCE_NOT_FOUND`（ERR_2001）がスローされる

---

## 6. 永続化と復元関連

### AC-06: スケジュール永続化と復元

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-07 |

- **Given**: 以下の3件のスケジュールが登録されている
  - cronスケジュール（`enabled: true`）
  - intervalスケジュール（`enabled: true`）
  - cronスケジュール（`enabled: false`）
- **When**: アプリケーションを再起動し`SkillScheduler.initialize()`が呼ばれる
- **Then**:
  - [ ] electron-storeから3件全てのスケジュールが復元される
  - [ ] `enabled: true`の2件のスケジュールのタイマーが再開される
  - [ ] `enabled: false`の1件のスケジュールはタイマーが登録されない
  - [ ] `skill:schedule:list`で3件全てが返却される

### AC-06a: 復元時のワンショット過去日時処理

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-07 |

- **Given**: ワンショットスケジュール（`enabled: true`、`scheduledAt: "2026-02-01T00:00:00Z"`）が保存されている
- **When**: 2026-02-28にアプリケーションを起動し`SkillScheduler.initialize()`が呼ばれる
- **Then**:
  - [ ] ワンショットスケジュールの`enabled`が`false`に更新される
  - [ ] スキルは実行されない
  - [ ] electron-storeに`enabled: false`の状態が永続化される

### AC-06b: 空のストアからの初期化

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-07 |

- **Given**: electron-storeの`scheduledSkills`キーが存在しない（初回起動）
- **When**: `SkillScheduler.initialize()`が呼ばれる
- **Then**:
  - [ ] エラーは発生しない
  - [ ] `skill:schedule:list`で空配列が返却される

---

## 7. 実行履歴関連

### AC-07: 成功時の実行履歴記録

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-08 |

- **Given**: 有効なcronスケジュールが存在する
- **When**: スケジュールされたスキルが正常に実行完了する
- **Then**:
  - [ ] `ScheduledRunResult`が`runHistory`の先頭に追加される
  - [ ] `status`が`"success"`である
  - [ ] `error`が`undefined`である
  - [ ] `startedAt`がISO 8601文字列である
  - [ ] `completedAt`がISO 8601文字列である
  - [ ] `durationMs`が0以上の数値である
  - [ ] `runId`がUUID v4形式である

### AC-07a: 失敗時の実行履歴記録

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-08 |

- **Given**: 有効なスケジュールが存在し、対象スキルの実行が失敗する設定
- **When**: スケジュールされたスキル実行が失敗する
- **Then**:
  - [ ] `ScheduledRunResult`が`runHistory`の先頭に追加される
  - [ ] `status`が`"failure"`である
  - [ ] `error`にエラーメッセージが記録されている
  - [ ] スケジュール自体は`enabled: true`のまま維持される（次回実行を継続）

### AC-07b: 実行履歴の件数制限（10件）

| 項目     | 内容          |
| -------- | ------------- |
| 対応要件 | FR-08、NFR-08 |

- **Given**: 既に10件の実行履歴を持つスケジュールが存在する
- **When**: 11回目のスキル実行が完了する
- **Then**:
  - [ ] `runHistory`の配列長が10である（10件を超えない）
  - [ ] 最新の実行結果が配列の先頭にある
  - [ ] 最古の実行結果（元の1件目）が配列から削除されている

---

## 8. 通知関連

### AC-08: 成功時のシステム通知

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-09 |

- **Given**: `notification: { onSuccess: true, onFailure: false, notificationType: "system" }`のスケジュールが存在する
- **When**: スケジュールされたスキルが正常に実行完了する
- **Then**:
  - [ ] ElectronのNotification APIが呼ばれる
  - [ ] 通知タイトルにスキル名が含まれる
  - [ ] 通知本文に「成功」または「completed」に関する記述が含まれる

### AC-08a: 失敗時のシステム通知

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-09 |

- **Given**: `notification: { onSuccess: false, onFailure: true, notificationType: "system" }`のスケジュールが存在する
- **When**: スケジュールされたスキル実行が失敗する
- **Then**:
  - [ ] ElectronのNotification APIが呼ばれる
  - [ ] 通知タイトルにスキル名が含まれる
  - [ ] 通知本文にエラー情報が含まれる

### AC-08b: 通知無効時の非送信

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-09 |

- **Given**: `notification: { onSuccess: false, onFailure: false, notificationType: "system" }`のスケジュールが存在する
- **When**: スケジュールされたスキルが実行完了する（成功・失敗問わず）
- **Then**:
  - [ ] ElectronのNotification APIは呼ばれない

---

## 9. IPCバリデーション関連

### AC-09: 空文字列IDの拒否

| 項目     | 内容   |
| -------- | ------ |
| 対応要件 | NFR-01 |

- **Given**: `skill:schedule:delete`ハンドラが登録されている
- **When**: 空文字列`""`のIDが送信される
- **Then**:
  - [ ] `VALIDATION_ERROR`がスローされる
  - [ ] スケジュールは削除されない

### AC-09a: スペースのみIDの拒否（P42準拠）

| 項目     | 内容   |
| -------- | ------ |
| 対応要件 | NFR-01 |

- **Given**: `skill:schedule:delete`ハンドラが登録されている
- **When**: スペースのみの文字列`"   "`のIDが送信される
- **Then**:
  - [ ] `VALIDATION_ERROR`がスローされる（`.trim() === ""`チェックで検出）
  - [ ] スケジュールは削除されない

### AC-09b: 非文字列IDの拒否

| 項目     | 内容   |
| -------- | ------ |
| 対応要件 | NFR-01 |

- **Given**: `skill:schedule:delete`ハンドラが登録されている
- **When**: 数値`123`または`null`がIDとして送信される
- **Then**:
  - [ ] `VALIDATION_ERROR`がスローされる（`typeof !== "string"`チェックで検出）

### AC-09c: 全チャンネルでの送信元検証

| 項目     | 内容   |
| -------- | ------ |
| 対応要件 | NFR-02 |

- **Given**: 5つのskill:schedule:\*チャンネルが登録されている
- **When**: 不正な送信元（mainWindow以外）からリクエストが送信される
- **Then**:
  - [ ] 全チャンネルで`validateIpcSender()`によりリクエストが拒否される

---

## 10. タイマー管理関連

### AC-10: タイマーの確実な解放

| 項目     | 内容   |
| -------- | ------ |
| 対応要件 | NFR-05 |

- **Given**: 有効なcronスケジュールとintervalスケジュールが各1件存在する
- **When**: 両スケジュールを`skill:schedule:delete`で削除する
- **Then**:
  - [ ] cronスケジュールの`node-cron`タスク`stop()`が呼ばれる
  - [ ] intervalスケジュールの`clearInterval`が呼ばれる
  - [ ] タイマー参照がMapから削除される
  - [ ] `Map.size`が0である

### AC-10a: タイマー二重登録防止

| 項目     | 内容   |
| -------- | ------ |
| 対応要件 | NFR-06 |

- **Given**: ID`"schedule-1"`のcronスケジュールが有効状態で稼働中
- **When**: `skill:schedule:update`で同一ID`"schedule-1"`のスケジュールを更新する
- **Then**:
  - [ ] 既存のタイマーが先に停止される
  - [ ] 新しいタイマーが登録される
  - [ ] Mapに同一IDのエントリが1つだけ存在する

### AC-10b: ワンショット実行後のタイマー解放

| 項目     | 内容   |
| -------- | ------ |
| 対応要件 | NFR-05 |

- **Given**: 有効なワンショットスケジュールが存在する
- **When**: 指定時刻に到達しスキルが実行される
- **Then**:
  - [ ] タイマー参照がMapから削除される
  - [ ] `enabled`が`false`に設定される
  - [ ] electron-storeに永続化される

---

## 11. 型安全性関連

### AC-11: IPC境界のDate型変換

| 項目     | 内容   |
| -------- | ------ |
| 対応要件 | NFR-07 |

- **Given**: スケジュールが登録されている
- **When**: `skill:schedule:list`でスケジュールを取得する
- **Then**:
  - [ ] `createdAt`がISO 8601文字列（例: `"2026-02-27T12:00:00.000Z"`）である
  - [ ] `updatedAt`がISO 8601文字列である
  - [ ] `lastRun`がISO 8601文字列または`null`である
  - [ ] `nextRun`がISO 8601文字列または`null`である
  - [ ] Date型オブジェクトが返却されていない（文字列のみ）

### AC-11a: 共有型のインポート可能性

| 項目     | 内容   |
| -------- | ------ |
| 対応要件 | NFR-10 |

- **Given**: `packages/shared/src/types/skill-schedule.ts`に型定義が存在する
- **When**: `@repo/shared`から型をインポートする
- **Then**:
  - [ ] `ScheduledSkill`型がインポート可能である
  - [ ] `SkillSchedule`型がインポート可能である
  - [ ] `NotificationSettings`型がインポート可能である
  - [ ] `ScheduledRunResult`型がインポート可能である
  - [ ] `EventConfig`型がインポート可能である

---

## 12. CRUD操作関連

### AC-12: スケジュール追加（正常系）

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-06 |

- **Given**: スケジュールが0件の状態
- **When**: `skill:schedule:add`で有効なスケジュールを追加する
- **Then**:
  - [ ] 戻り値が`{ success: true, data: ScheduledSkill }`形式である
  - [ ] `data.id`がUUID v4形式で自動生成されている
  - [ ] `data.runHistory`が空配列である
  - [ ] electron-storeに1件保存される

### AC-12a: スケジュール更新（正常系）

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-06 |

- **Given**: ID`"schedule-1"`のスケジュールが存在する
- **When**: `skill:schedule:update`で`{ id: "schedule-1", updates: { prompt: "updated prompt" } }`を送信する
- **Then**:
  - [ ] プロンプトが更新される
  - [ ] `updatedAt`が更新時刻に変更される
  - [ ] 戻り値が`{ success: true }`形式である

### AC-12b: スケジュール削除（正常系）

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-06 |

- **Given**: ID`"schedule-1"`のスケジュールが存在する
- **When**: `skill:schedule:delete`で`"schedule-1"`を送信する
- **Then**:
  - [ ] スケジュールが削除される
  - [ ] 対応するタイマーが停止・解放される
  - [ ] 戻り値が`{ success: true }`形式である
  - [ ] `skill:schedule:list`の結果に含まれない

### AC-12c: 存在しないIDでの更新拒否

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-06 |

- **Given**: ID`"non-existent"`のスケジュールが存在しない
- **When**: `skill:schedule:update`で`{ id: "non-existent", updates: { prompt: "test" } }`を送信する
- **Then**:
  - [ ] `RESOURCE_NOT_FOUND`（ERR_2001）がスローされる

### AC-12d: 存在しないIDでの削除拒否

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-06 |

- **Given**: ID`"non-existent"`のスケジュールが存在しない
- **When**: `skill:schedule:delete`で`"non-existent"`を送信する
- **Then**:
  - [ ] `RESOURCE_NOT_FOUND`（ERR_2001）がスローされる

---

## 13. 次回実行時刻関連

### AC-13: Cronスケジュールの次回実行時刻

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-10 |

- **Given**: cron式`"0 9 * * *"`（毎日9時）のスケジュールが登録されている
- **When**: `skill:schedule:list`でスケジュールを取得する
- **Then**:
  - [ ] `nextRun`が次回の9:00のISO 8601文字列である
  - [ ] `nextRun`が現在時刻より未来である

### AC-13a: Intervalスケジュールの次回実行時刻

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-10 |

- **Given**: intervalMs `60000`のスケジュールが登録され、前回実行時刻が記録されている
- **When**: `skill:schedule:list`でスケジュールを取得する
- **Then**:
  - [ ] `nextRun`が前回実行時刻 + 60000msのISO 8601文字列である

### AC-13b: Eventスケジュールの次回実行時刻

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-10 |

- **Given**: `event: "app_start"`のスケジュールが登録されている
- **When**: `skill:schedule:list`でスケジュールを取得する
- **Then**:
  - [ ] `nextRun`が`null`である（次回実行時刻は予測不能）

---

## 14. エラー耐性関連

### AC-14: スキル実行失敗後の継続動作

| 項目     | 内容   |
| -------- | ------ |
| 対応要件 | NFR-09 |

- **Given**: 有効なintervalスケジュール（`intervalMs: 60000`）が存在する
- **When**: 1回目のスキル実行が失敗し、2回目のインターバルが到来する
- **Then**:
  - [ ] 1回目の失敗が`runHistory`に`status: "failure"`で記録される
  - [ ] スケジュールは`enabled: true`のまま維持される
  - [ ] 2回目のスキル実行が正常にトリガーされる

### AC-14a: 存在しないスキル名での追加拒否

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | FR-06 |

- **Given**: スキル`"non-existent-skill"`がインポートされていない
- **When**: `skill:schedule:add`で`skillName: "non-existent-skill"`を指定する
- **Then**:
  - [ ] `RESOURCE_NOT_FOUND`（ERR_2001）がスローされる
  - [ ] スケジュールは追加されない

---

## 完了条件

- [x] 全FR（FR-01〜FR-10）に対応する受け入れ基準が定義されている
- [x] 全NFR（NFR-01〜NFR-11）に対応する受け入れ基準が定義されている
- [x] 各受け入れ基準がGherkin形式（Given/When/Then）で記述されている
- [x] エッジケース・境界値が考慮されている（インターバル上下限、過去日時、空文字列、スペースのみ）
- [x] 検証条件がチェックリスト形式で記述されている
- [x] エラーコードが明示されている
