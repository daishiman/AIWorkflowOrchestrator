# Phase 4: 詳細テストケース一覧 - TASK-9G スキルスケジュール実行機能

## メタ情報

| 項目       | 値                     |
| ---------- | ---------------------- |
| Phase      | 4                      |
| 機能名     | TASK-9G-skill-schedule |
| 作成日     | 2026-02-27             |
| テスト総数 | 76                     |

## 1. 型定義テスト（T-01 ~ T-05）

**ファイル**: `packages/shared/src/types/__tests__/skill-schedule.test.ts`

### T-01: ScheduledSkill 型の必須フィールド

- **入力**: ScheduledSkill 型のオブジェクトを id, skillName, prompt, schedule, enabled, runHistory, notification フィールド付きで生成
- **期待結果**: TypeScript コンパイルが通り、各フィールドの値が正しくアサインされる
- **検証方法**: expect(obj.fieldName).toBe(expectedValue)

### T-02: SkillSchedule.type の4種類

- **入力**: type: "cron", "interval", "once", "event" の各 SkillSchedule オブジェクト
- **期待結果**: 全ての type 値で型チェックが通る
- **検証方法**: expect(schedule.type).toBe(expectedType)

### T-03: NotificationSettings.notificationType の3種類

- **入力**: notificationType: "system", "inApp", "both" の各 NotificationSettings オブジェクト
- **期待結果**: 全ての notificationType 値で型チェックが通る
- **検証方法**: expect(notification.notificationType).toBe(expectedType)

### T-04: ScheduledRunResult 型の必須フィールド

- **入力**: runId, startedAt, success を持つ ScheduledRunResult オブジェクト（必須のみ + オプショナルフィールド付き）
- **期待結果**: TypeScript コンパイルが通り、オプショナルフィールド（completedAt, output, error）も正常に型チェック
- **検証方法**: expect(result.runId).toBe(expectedValue)

### T-05: lastRun / nextRun のオプショナル性

- **入力**: lastRun/nextRun が (1) 未指定, (2) null, (3) string の3パターン
- **期待結果**: (1) undefined, (2) null, (3) string の全てが型チェックを通過
- **検証方法**: expect(obj.lastRun).toBeUndefined() / toBeNull() / toBe(string)

---

## 2. ScheduleStore テスト（D-01 ~ D-15）

**ファイル**: `apps/desktop/src/main/services/skill/__tests__/ScheduleStore.test.ts`

### D-01: 初期状態

- **前提条件**: electron-store が空配列を返す
- **操作**: store.getAll()
- **期待結果**: []

### D-02: スケジュール追加

- **前提条件**: 空の ScheduleStore
- **操作**: store.add(testSchedule) -> store.getAll()
- **期待結果**: 1件含む配列、skillName が "daily-report"

### D-03: ID 自動生成

- **前提条件**: 空の ScheduleStore
- **操作**: store.add(testSchedule) -> store.getAll()
- **期待結果**: id が string 型で長さ > 0

### D-04: ID 指定取得

- **前提条件**: id: "specific-id" のスケジュールが追加済み
- **操作**: store.getById("specific-id")
- **期待結果**: id === "specific-id" のスケジュールオブジェクト

### D-05: 存在しない ID 取得

- **前提条件**: 空の ScheduleStore
- **操作**: store.getById("non-existent")
- **期待結果**: undefined

### D-06: スケジュール更新

- **前提条件**: id: "update-target" のスケジュールが追加済み（enabled: true）
- **操作**: store.update("update-target", { enabled: false })
- **期待結果**: getById("update-target").enabled === false

### D-07: 存在しない ID 更新

- **前提条件**: 空の ScheduleStore
- **操作**: store.update("non-existent", { enabled: false })
- **期待結果**: Error がスローされる

### D-08: スケジュール削除

- **前提条件**: 1件のスケジュールが追加済み
- **操作**: store.delete(id) -> store.getAll()
- **期待結果**: 空配列

### D-09: 存在しない ID 削除

- **前提条件**: 空の ScheduleStore
- **操作**: store.delete("non-existent")
- **期待結果**: Error がスローされる

### D-10: electron-store 永続化呼び出し

- **前提条件**: ScheduleStore インスタンス
- **操作**: add -> update -> delete の各操作
- **期待結果**: 各操作後に mockStoreSet が呼び出される

### D-11: 実行結果蓄積

- **前提条件**: 1件のスケジュールが追加済み
- **操作**: store.addRunResult(id, runResult)
- **期待結果**: runHistory.length === 1, runHistory[0].runId === "run-001"

### D-12: runHistory 最大件数制限

- **前提条件**: 1件のスケジュールが追加済み
- **操作**: 101件の addRunResult 呼び出し
- **期待結果**: runHistory.length === 100, 最古のエントリが削除されている

### D-13: lastRun 更新

- **前提条件**: 1件のスケジュールが追加済み
- **操作**: store.addRunResult(id, { startedAt: "2026-02-27T15:30:00.000Z", ... })
- **期待結果**: lastRun === "2026-02-27T15:30:00.000Z"

### D-14: コンストラクタ復元

- **前提条件**: electron-store が2件のスケジュール配列を返す
- **操作**: new ScheduleStore() -> getAll()
- **期待結果**: 2件のスケジュール、get("scheduledSkills") が呼ばれる

### D-15: 不正データフォールバック

- **前提条件**: electron-store が文字列/null/数値/undefined を返す
- **操作**: new ScheduleStore() -> getAll()
- **期待結果**: 全パターンで空配列が返る（クラッシュしない）

---

## 3. SkillScheduler テスト（S-01 ~ S-25）

**ファイル**: `apps/desktop/src/main/services/skill/__tests__/SkillScheduler.test.ts`

### S-01 ~ S-02: 初期化

- **S-01**: enabled: true が2件 → cron.schedule が呼ばれる
- **S-02**: enabled: false のみ → cron.schedule が呼ばれない

### S-03 ~ S-05: スケジュール追加

- **S-03**: addSchedule → store.add が1回呼出
- **S-04**: enabled: true → cron.schedule が呼出（type: "cron"）
- **S-05**: addSchedule の戻り値に nextRun が含まれる

### S-06 ~ S-10: スケジュール方式別

- **S-06**: type: "cron" → cron.schedule(expression, callback)
- **S-07**: type: "interval" → setInterval + advanceTimersByTime 後にコールバック実行
- **S-08**: type: "once" → setTimeout + advanceTimersByTime 後に1回実行
- **S-09**: type: "event" → schedule.type === "event" のスケジュールが正常に追加
- **S-10**: 無効 cron 式 → cron.validate が false → Error スロー

### S-11 ~ S-15: 更新・削除・切り替え

- **S-11**: updateSchedule → store.update 呼出
- **S-12**: スケジュール設定変更 → 既存停止 + 新タイマー開始
- **S-13**: deleteSchedule → task.stop() + store.delete
- **S-14**: enableSchedule → store.update(id, { enabled: true })
- **S-15**: disableSchedule → task.stop() + store.update(id, { enabled: false })

### S-16 ~ S-20: スケジュール実行

- **S-16**: cron コールバック実行 → SkillExecutor.execute 呼出
- **S-17**: 実行成功 → addRunResult(id, { success: true })
- **S-18**: 実行失敗 → addRunResult(id, { success: false, error: "..." })
- **S-19**: 実行後 → store.update(id, { nextRun: "..." })
- **S-20**: type: "once" 実行後 → store.update(id, { enabled: false })

### S-21 ~ S-25: nextRun 計算

- **S-21**: cron → 現在時刻より後の Date
- **S-22**: interval → Date.now() + interval に近い値（許容範囲1秒）
- **S-23**: once（未来） → runAt と一致
- **S-24**: once（過去） → undefined またはバリデーションエラー
- **S-25**: event → undefined

---

## 4. IPCハンドラーテスト（H-01 ~ H-31）

**ファイル**: `apps/desktop/src/main/ipc/__tests__/skillScheduleHandlers.test.ts`

### H-01 ~ H-06: 正常系

- 各チャンネル（list/add/update/delete/toggle）の正常レスポンス検証
- toggle は有効→無効、無効→有効の2パターン

### H-07 ~ H-18: P42準拠3段バリデーション

- **H-07**: skillName === "" → エラー
- **H-08**: skillName === " " → エラー（.trim() チェック）
- **H-09**: skillName === 12345 → エラー（typeof チェック）
- **H-10**: prompt === "" → エラー
- **H-11**: schedule === undefined → エラー
- **H-12**: schedule.type === "weekly" → エラー（不正値）
- **H-13**: type: "cron" で cronExpression 未指定 → エラー
- **H-14**: type: "interval" で interval === 0 → エラー
- **H-15**: update の id === "" → エラー
- **H-16**: update の id === " " → エラー
- **H-17**: delete の id === undefined → エラー
- **H-18**: toggle の id === "" → エラー

### H-19 ~ H-23: サービスエラー

- **H-19 ~ H-21**: 存在しない ID での update/delete/toggle → "Schedule not found"
- **H-22**: 無効 cron 式 → "Invalid cron expression"
- **H-23**: 予期しない Error → "Internal error"（内部情報漏洩防止）

### H-24 ~ H-26: セキュリティ

- **H-24**: validateIpcSender が invalid → IPC_UNAUTHORIZED エラー
- **H-25**: 全5チャンネルで validateIpcSender が呼出
- **H-26**: 正しい引数（event, channel, { getAllowedWindows }）+ P41 コールバック検証

### H-27 ~ H-29: 登録・解除

- **H-27**: register で5チャンネル登録
- **H-28**: unregister で5チャンネル解除
- **H-29**: IPC_CHANNELS 定数使用（ハードコード文字列なし）

### H-30 ~ H-31: IPCシリアライズ

- **H-30**: list の lastRun/nextRun が ISO 8601 文字列
- **H-31**: add の nextRun が ISO 8601 文字列
