# Phase 11 自動テスト結果

## メタ情報

| 項目     | 内容                           |
| -------- | ------------------------------ |
| 実施日   | 2026-02-27（再実行）           |
| Vitest   | v2.1.9                         |
| 実行時間 | desktop: 16.66s, shared: 2.41s |
| 判定     | 59 PASS / 1 FAIL               |

## 実行結果サマリー

| テストファイル                        | テスト数 | PASS   | FAIL  | 結果       |
| ------------------------------------- | -------- | ------ | ----- | ---------- |
| ScheduleStore.test.ts                 | 20       | 20     | 0     | ALL PASS   |
| SkillScheduler.test.ts                | 23       | 22     | 1     | 1 FAIL     |
| skillScheduleHandlers.test.ts         | 12       | 12     | 0     | ALL PASS   |
| skill-schedule.test.ts (shared/types) | 5        | 5      | 0     | ALL PASS   |
| **合計**                              | **60**   | **59** | **1** | **1 FAIL** |

## ScheduleStore.test.ts（20テスト - ALL PASS）

### CRUD操作（D-01 ~ D-10）

| ID   | テスト内容                                               | 結果 |
| ---- | -------------------------------------------------------- | ---- |
| D-01 | 初期状態でスケジュール一覧が空配列を返す                 | PASS |
| D-02 | スケジュールを追加すると一覧に含まれる                   | PASS |
| D-03 | 追加されたスケジュールに自動生成されたIDが付与される     | PASS |
| D-04 | IDを指定してスケジュールを取得できる                     | PASS |
| D-05 | 存在しないIDで取得すると undefined を返す                | PASS |
| D-06 | スケジュールを更新すると変更が反映される                 | PASS |
| D-07 | 存在しないIDの更新で例外がスローされる                   | PASS |
| D-08 | スケジュールを削除すると一覧から除外される               | PASS |
| D-09 | 存在しないIDの削除で例外がスローされる                   | PASS |
| D-10 | electron-store の set がスケジュール変更時に呼び出される | PASS |

### 実行履歴（D-11 ~ D-13）

| ID   | テスト内容                                                 | 結果 |
| ---- | ---------------------------------------------------------- | ---- |
| D-11 | 実行結果を追加すると runHistory に蓄積される               | PASS |
| D-12 | runHistory は最大100件を保持し、超過分は古い順に削除される | PASS |
| D-13 | lastRun が実行結果追加時に更新される                       | PASS |

### 永続化復元（D-14 ~ D-15）

| ID   | テスト内容                                                     | 結果 |
| ---- | -------------------------------------------------------------- | ---- |
| D-14 | コンストラクタで electron-store からスケジュールが復元される   | PASS |
| D-15 | 保存データが不正（配列でない）場合に空配列にフォールバックする | PASS |

### 境界値テスト（DB-01 ~ DB-05）

| ID    | テスト内容                                                          | 結果 |
| ----- | ------------------------------------------------------------------- | ---- |
| DB-01 | 複数スケジュール（10件）追加後に全件取得できる                      | PASS |
| DB-02 | 同一スキルに複数スケジュールを登録できる                            | PASS |
| DB-03 | update で enabled 以外のフィールド（prompt）も変更できる            | PASS |
| DB-04 | addRunResult で completedAt / output フィールドが保存される         | PASS |
| DB-05 | 保存データの各要素が不正（id フィールド欠損）な場合にフィルタされる | PASS |

## SkillScheduler.test.ts（23テスト - 22 PASS / 1 FAIL）

### コアロジック（13テスト）

| #   | テスト内容                                                  | 結果 |
| --- | ----------------------------------------------------------- | ---- |
| 1   | initialize() は enabled=true のスケジュールのみ有効化する   | PASS |
| 2   | addSchedule() は有効スケジュールを保存しジョブ登録する      | PASS |
| 3   | addSchedule() は無効な cron 式を拒否する                    | PASS |
| 4   | addSchedule() は enabled=false の場合ジョブ登録しない       | PASS |
| 5   | updateSchedule() は既存ジョブを停止して再有効化する         | PASS |
| 6   | deleteSchedule() はジョブ停止後に削除する                   | PASS |
| 7   | enableSchedule() はストア更新後にジョブを有効化する         | PASS |
| 8   | disableSchedule() はジョブ停止後に enabled=false を保存する | PASS |
| 9   | interval スケジュール実行時は runHistory が更新される       | PASS |
| 10  | 実行失敗時は runHistory に error を記録する                 | PASS |
| 11  | once スケジュール実行後は自動で無効化される                 | PASS |
| 12  | 過去日時の once は nextRun=null で保存する                  | PASS |
| 13  | event スケジュールは nextRun=null で保存する                | PASS |

### 境界値テスト（SB-01 ~ SB-12）

| ID    | テスト内容                                                                 | 結果 |
| ----- | -------------------------------------------------------------------------- | ---- |
| SB-01 | interval スケジュールが指定間隔ごとに繰り返し実行される                    | PASS |
| SB-02 | once スケジュールが実行後に再実行されない                                  | PASS |
| SB-03 | disableSchedule 後に interval タイマーが実行されない                       | PASS |
| SB-04 | deleteSchedule 後にタイマーが実行されない                                  | PASS |
| SB-05 | 同一スキルの複数スケジュールが独立して動作する                             | PASS |
| SB-06 | スケジュール実行中に deleteSchedule しても実行中のタスクはクラッシュしない | PASS |
| SB-07 | SkillExecutor.execute が例外をスローしてもスケジューラは停止しない         | PASS |
| SB-08 | SkillExecutor.execute の結果が success: false の場合も runHistory に記録   | PASS |
| SB-09 | event: 'app_start' のスケジュールが initialize 時に実行される              | PASS |
| SB-10 | event: 'file_change' のスケジュールは登録されるが即座に実行されない        | PASS |
| SB-11 | event: 'git_commit' のスケジュールは登録されるが即座に実行されない         | PASS |
| SB-12 | 無効化されたイベントスケジュールは initialize 時に実行されない             | PASS |

### ユーティリティテスト（3テスト）

| テスト内容                                     | 結果     |
| ---------------------------------------------- | -------- |
| getActiveJobCount() はアクティブジョブ数を返す | PASS     |
| hasActiveJob() はジョブの存在確認を返す        | **FAIL** |
| listSchedules() は store.getAll() を返す       | PASS     |

### 失敗テスト詳細

```
FAIL  SkillScheduler > hasActiveJob() はジョブの存在確認を返す
AssertionError: expected false to be true // Object.is equality
 ❯ src/main/services/skill/__tests__/SkillScheduler.test.ts:988
```

**原因**: テストが `scheduler.hasActiveJob("sched-001")` を呼び出しているが、`addSchedule()` 内部で `randomUUID()` により新しいIDが生成されるため、モックの返却値 `"sched-001"` と実際の `activeJobs` Map のキーが一致しない。テスト側のモック設定の問題であり、実装ロジックの不具合ではない。

## skillScheduleHandlers.test.ts（12テスト - ALL PASS）

| #   | テスト内容                                                            | 結果 |
| --- | --------------------------------------------------------------------- | ---- |
| 1   | 5つの schedule ハンドラーを登録する                                   | PASS |
| 2   | list は store.getAll() を返す                                         | PASS |
| 3   | sender 検証失敗時は toIPCValidationError の戻り値を返す               | PASS |
| 4   | add は scheduler.addSchedule() を呼び出して結果を返す                 | PASS |
| 5   | add は空 skillName を拒否する                                         | PASS |
| 6   | add は interval<=0 を拒否する                                         | PASS |
| 7   | update は id と updates をそのまま scheduler に渡す                   | PASS |
| 8   | delete は id オブジェクトで受け取り scheduler.deleteSchedule() を呼ぶ | PASS |
| 9   | toggle は enabled=true の場合 disableSchedule() を呼ぶ                | PASS |
| 10  | toggle は enabled=false の場合 enableSchedule() を呼ぶ                | PASS |
| 11  | toggle は対象スケジュールがない場合エラーを返す                       | PASS |
| 12  | unregister は5チャンネルすべて removeHandler する                     | PASS |

## skill-schedule.test.ts - shared/types（5テスト - ALL PASS）

| ID   | テスト内容                                                                        | 結果 |
| ---- | --------------------------------------------------------------------------------- | ---- |
| T-01 | ScheduledSkill 型が必須フィールドを持つ                                           | PASS |
| T-02 | SkillSchedule の type が cron/interval/once/event の4種類を受け入れる             | PASS |
| T-03 | NotificationSettings の notificationType が system/inApp/both の3種類を受け入れる | PASS |
| T-04 | ScheduledRunResult 型が必須フィールドを持つ                                       | PASS |
| T-05 | ScheduledSkill.lastRun / nextRun がオプショナルである                             | PASS |

## 実行コマンド

```bash
# desktop テスト（55テスト）
cd apps/desktop && npx vitest run \
  src/main/services/skill/__tests__/ScheduleStore.test.ts \
  src/main/services/skill/__tests__/SkillScheduler.test.ts \
  src/main/ipc/__tests__/skillScheduleHandlers.test.ts \
  --reporter=verbose

# shared 型定義テスト（5テスト）
cd packages/shared && npx vitest run \
  src/types/__tests__/skill-schedule.test.ts \
  --reporter=verbose
```

## 実行ログ

```
Test Files  1 failed | 2 passed (3)  [desktop]
     Tests  1 failed | 54 passed (55)
  Duration  16.66s

Test Files  1 passed (1)  [shared]
     Tests  5 passed (5)
  Duration  2.41s
```
