# スケジュール追加テスト結果

## メタ情報

| 項目     | 内容                     |
| -------- | ------------------------ |
| 実施日   | 2026-02-27（再実行）     |
| 検証方法 | 自動テスト結果による代替 |
| 判定     | PASS                     |

## テストケース結果

### TC-001: cron スケジュール追加

| 項目       | 内容                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------- |
| チャンネル | skill:schedule:add                                                                                       |
| 入力       | `{ skillName: "hourly-report", schedule: { type: "cron", cronExpression: "0 * * * *" }, enabled: true }` |
| 期待結果   | ScheduledSkill オブジェクトが返却され、nextRun に次回実行日時が設定される                                |
| 検証テスト | SkillScheduler.test.ts: "addSchedule() は有効スケジュールを保存しジョブ登録する"                         |
| 結果       | **PASS** - `result.nextRun` が String 型であることを確認。`cron.schedule` が1回呼び出されたことを確認    |

### TC-002: interval スケジュール追加

| 項目       | 内容                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| チャンネル | skill:schedule:add                                                                                                                                      |
| 入力       | `{ skillName: "interval-skill", schedule: { type: "interval", interval: 1000 }, enabled: true }`                                                        |
| 期待結果   | ScheduledSkill オブジェクトが返却され、interval=1000 が設定される                                                                                       |
| 検証テスト | SkillScheduler.test.ts: "interval スケジュール実行時は runHistory が更新される"                                                                         |
| 結果       | **PASS** - intervalスケジュールが追加され、タイマー発火後に `mockSkillExecutor.execute` が1回呼び出され、`addRunResult` に `success: true` が記録された |

### TC-003: once スケジュール追加

| 項目       | 内容                                                                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| チャンネル | skill:schedule:add                                                                                                                                    |
| 入力       | `{ skillName: "once-skill", schedule: { type: "once", runAt: "<未来日時>" }, enabled: true }`                                                         |
| 期待結果   | ScheduledSkill オブジェクトが返却され、runAt が設定される                                                                                             |
| 検証テスト | SkillScheduler.test.ts: "once スケジュール実行後は自動で無効化される" + "過去日時の once は nextRun=null で保存する"                                  |
| 結果       | **PASS** - 未来日時の once スケジュールが追加・実行後に `enabled: false` に自動変更されることを確認。過去日時の場合は `nextRun=null` となることを確認 |

### TC-004: event スケジュール追加

| 項目       | 内容                                                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- |
| チャンネル | skill:schedule:add                                                                                                          |
| 入力       | `{ skillName: "event-skill", schedule: { type: "event", event: "app_start" }, enabled: true }`                              |
| 期待結果   | ScheduledSkill オブジェクトが返却され、event=app_start が設定される                                                         |
| 検証テスト | SkillScheduler.test.ts: "event スケジュールは nextRun=null で保存する"                                                      |
| 結果       | **PASS** - eventスケジュールの `nextRun` が `null` であることを確認（イベント駆動のため時刻ベースの次回実行は設定されない） |

### TC-追加: disabled スケジュール追加

| 項目       | 内容                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| チャンネル | skill:schedule:add                                                                                   |
| 入力       | `{ skillName: "disabled", schedule: { type: "cron", cronExpression: "0 * * * *" }, enabled: false }` |
| 期待結果   | ScheduledSkill が保存されるが、cron ジョブは登録されない                                             |
| 検証テスト | SkillScheduler.test.ts: "addSchedule() は enabled=false の場合ジョブ登録しない"                      |
| 結果       | **PASS** - `cron.schedule` が呼び出されていないことを確認                                            |

## 総合判定

全4タイプ（cron / interval / once / event）+ 無効スケジュールの追加テストが **PASS**。
