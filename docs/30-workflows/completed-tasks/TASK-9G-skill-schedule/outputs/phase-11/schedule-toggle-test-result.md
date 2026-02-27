# スケジュール有効/無効トグルテスト結果

## メタ情報

| 項目     | 内容                     |
| -------- | ------------------------ |
| 実施日   | 2026-02-27（再実行）     |
| 検証方法 | 自動テスト結果による代替 |
| 判定     | PASS                     |

## テストケース結果

### TC-009: 有効 -> 無効（disable）

| 項目       | 内容                                                                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| チャンネル | skill:schedule:toggle                                                                                                                                          |
| 前提条件   | isEnabled=true のスケジュールが存在                                                                                                                            |
| 期待結果   | isEnabled=false になり、cronジョブが停止される                                                                                                                 |
| 検証テスト | SkillScheduler: "disableSchedule() はジョブ停止後に enabled=false を保存する"、skillScheduleHandlers: "toggle は enabled=true の場合 disableSchedule() を呼ぶ" |
| 結果       | **PASS**                                                                                                                                                       |

**詳細**:

- SkillSchedulerレベル: cronタスクの `stop()` が呼び出された後、`store.update(id, { enabled: false })` が呼ばれることを確認
- IPCハンドラレベル: `store.getById()` で現在の状態を取得し、`enabled=true` であれば `scheduler.disableSchedule()` を呼び出すことを確認。レスポンスは `{ success: true, data: <updated schedule> }` 形式

### TC-010: 無効 -> 有効（enable）

| 項目       | 内容                                                                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| チャンネル | skill:schedule:toggle                                                                                                                                  |
| 前提条件   | isEnabled=false のスケジュールが存在                                                                                                                   |
| 期待結果   | isEnabled=true になり、cronジョブが再登録される                                                                                                        |
| 検証テスト | SkillScheduler: "enableSchedule() はストア更新後にジョブを有効化する"、skillScheduleHandlers: "toggle は enabled=false の場合 enableSchedule() を呼ぶ" |
| 結果       | **PASS**                                                                                                                                               |

**詳細**:

- SkillSchedulerレベル: `store.update(id, { enabled: true })` が呼ばれた後、`cron.schedule()` が1回呼び出されることを確認
- IPCハンドラレベル: `store.getById()` で現在の状態を取得し、`enabled=false` であれば `scheduler.enableSchedule()` を呼び出すことを確認。レスポンスは `{ success: true, data: <updated schedule> }` 形式

### TC-追加: 存在しないIDのトグル

| 項目       | 内容                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------- |
| チャンネル | skill:schedule:toggle                                                                           |
| 入力       | `{ id: "missing-id" }`                                                                          |
| 期待結果   | エラーレスポンスが返却される                                                                    |
| 検証テスト | skillScheduleHandlers: "toggle は対象スケジュールがない場合エラーを返す"                        |
| 結果       | **PASS** - `{ success: false, error: "Schedule not found: missing-id" }` が返却されることを確認 |

## 総合判定

有効→無効、無効→有効の切り替え、および存在しないIDへのトグル操作が全て **PASS**。
