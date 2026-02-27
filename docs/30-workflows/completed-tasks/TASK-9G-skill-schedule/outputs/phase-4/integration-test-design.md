# Phase 4: 統合テスト設計 - TASK-9G スキルスケジュール実行機能

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 4                      |
| 機能名 | TASK-9G-skill-schedule |
| 作成日 | 2026-02-27             |

## 統合テスト対象

Phase 6（テスト拡充）で実装する統合テストの設計を定義する。

### 1. SkillScheduler + ScheduleStore 統合

**ファイル**: `apps/desktop/src/main/services/skill/__tests__/SkillScheduler.integration.test.ts`

| No   | テスト項目                                                 | 検証内容                                                  |
| ---- | ---------------------------------------------------------- | --------------------------------------------------------- |
| I-01 | addSchedule で ScheduleStore に永続化される                | ScheduleStore.getAll() に追加されたスケジュールが含まれる |
| I-02 | deleteSchedule で ScheduleStore から削除される             | ScheduleStore.getById(id) が undefined を返す             |
| I-03 | initialize で ScheduleStore のデータが復元・アクティベート | 保存済みスケジュールのタイマーが開始される                |
| I-04 | executeScheduledSkill の結果が ScheduleStore に記録される  | runHistory に実行結果が蓄積される                         |
| I-05 | shutdown で全タイマーが停止される                          | cronTasks / timers の Map が空になる                      |

### 2. IPCハンドラー + SkillScheduler 統合

**ファイル**: `apps/desktop/src/main/ipc/__tests__/skillScheduleHandlers.integration.test.ts`

| No   | テスト項目                                            | 検証内容                                                  |
| ---- | ----------------------------------------------------- | --------------------------------------------------------- |
| I-06 | IPC add → SkillScheduler.addSchedule が呼ばれる       | IPC経由でスケジュールが追加され、レスポンスにIDが含まれる |
| I-07 | IPC list → ScheduleStore のデータが返される           | IPC経由で全スケジュールが取得できる                       |
| I-08 | IPC delete → SkillScheduler.deleteSchedule が呼ばれる | IPC経由でスケジュールが削除され、タイマーが停止される     |
| I-09 | IPC toggle → SkillScheduler.toggleSchedule が呼ばれる | IPC経由で有効/無効が切り替わり、タイマー状態が変更される  |
| I-10 | IPC add → IPC list で追加されたスケジュールが返される | 追加→一覧取得の一連のフローが正常動作                     |

### 3. エンドツーエンドフロー

| No   | テスト項目                                                        | 検証内容                               |
| ---- | ----------------------------------------------------------------- | -------------------------------------- |
| I-11 | スケジュール追加 → タイマー起動 → 実行 → 結果記録 → nextRun更新   | 全レイヤーを通したフロー               |
| I-12 | スケジュール追加 → 無効化 → タイマー停止 → 有効化 → タイマー再開  | トグル操作の一連のフロー               |
| I-13 | アプリ起動（initialize）→ 保存済みスケジュール復元 → タイマー開始 | 永続化→復元→アクティベーションのフロー |

## 統合ポイントの契約

### IPC境界の型契約

| チャンネル            | リクエスト型                                       | レスポンス型                                |
| --------------------- | -------------------------------------------------- | ------------------------------------------- |
| skill:schedule:list   | なし                                               | `{ success: true, data: ScheduledSkill[] }` |
| skill:schedule:add    | `Omit<ScheduledSkill, "id" \| "runHistory">`       | `{ success: true, data: ScheduledSkill }`   |
| skill:schedule:update | `{ id: string, updates: Partial<ScheduledSkill> }` | `{ success: true }`                         |
| skill:schedule:delete | `string` (id)                                      | `{ success: true }`                         |
| skill:schedule:toggle | `string` (id)                                      | `{ success: true, data: ScheduledSkill }`   |

### 日時フィールドのシリアライズ契約

- lastRun: ISO 8601 文字列 (`string | null`)
- nextRun: ISO 8601 文字列 (`string | null | undefined`)
- startedAt: ISO 8601 文字列 (`string`)
- completedAt: ISO 8601 文字列 (`string | null | undefined`)

### タイマー管理の契約

| スケジュール種別 | タイマー実装 | 停止方法             | nextRun 計算方法            |
| ---------------- | ------------ | -------------------- | --------------------------- |
| cron             | node-cron    | task.stop()          | cron 式に基づく次回実行時刻 |
| interval         | setInterval  | clearInterval(timer) | Date.now() + interval       |
| once             | setTimeout   | clearTimeout(timer)  | runAt（未来のみ）           |
| event            | リスナー登録 | リスナー解除         | undefined（時刻不定）       |

## 境界値・エッジケース設計（Phase 6 用）

### スケジュール方式別

| No   | テスト項目                                                 | 検証内容                         |
| ---- | ---------------------------------------------------------- | -------------------------------- |
| E-01 | interval の最小値（1000ms）でスケジュール追加              | 正常にタイマーが開始される       |
| E-02 | interval の最大値（86400000ms = 24時間）でスケジュール追加 | 正常にタイマーが開始される       |
| E-03 | once の runAt が1秒後                                      | setTimeout が正常に設定される    |
| E-04 | cron 式に6フィールド（秒を含む）を指定                     | node-cron の validate 結果に依存 |
| E-05 | 同一スキルに複数スケジュール                               | 各スケジュールが独立に動作する   |

### 同時実行・競合

| No   | テスト項目                         | 検証内容                                     |
| ---- | ---------------------------------- | -------------------------------------------- |
| E-06 | 同時に2つのスケジュール実行が発火  | 両方の実行が完了する                         |
| E-07 | 実行中にスケジュールが削除される   | 実行中の処理は完了し、後続の実行は発生しない |
| E-08 | 実行中にスケジュールが無効化される | 実行中の処理は完了し、タイマーが停止する     |

### データ整合性

| No   | テスト項目                                           | 検証内容                            |
| ---- | ---------------------------------------------------- | ----------------------------------- |
| E-09 | runHistory が100件の状態で新規実行結果追加           | 最古のエントリが削除され100件を維持 |
| E-10 | electron-store のデータが破損した状態で初期化        | 空配列にフォールバック（P19対策）   |
| E-11 | スケジュール更新中に electron-store の書き込みが失敗 | エラーが適切にハンドリングされる    |
