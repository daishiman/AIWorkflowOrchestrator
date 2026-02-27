# TASK-9G 未タスク検出レポート

## 作成日

2026-02-27

---

## 検出結果サマリー

| ソース                                          | 検出数                            |
| ----------------------------------------------- | --------------------------------- |
| Phase 10 レビュー指摘事項                       | 0件                               |
| Phase 11 手動テスト発見課題                     | 0件                               |
| TODO/FIXME スキャン                             | 0件                               |
| コードレビュー（簡易実装/プレースホルダー検出） | 5件                               |
| スコープ外項目確認                              | 0件（全て既存タスクでカバー済み） |
| **合計**                                        | **5件**                           |

---

## 監査コマンド

```bash
# TODO/FIXME 検索（全対象ファイル）
grep -rn "TODO\|FIXME" apps/desktop/src/main/services/skill/SkillScheduler.ts
grep -rn "TODO\|FIXME" apps/desktop/src/main/services/skill/ScheduleStore.ts
grep -rn "TODO\|FIXME" apps/desktop/src/main/ipc/skillHandlers.ts
grep -rn "TODO\|FIXME" packages/shared/src/types/skill-schedule.ts
# 結果: 全ファイルで TODO/FIXME は0件

# 簡易実装/プレースホルダー検索（P28対策: 提案3の先行適用）
grep -rn "簡易\|プレースホルダー\|将来\|placeholder\|workaround" apps/desktop/src/main/services/skill/SkillScheduler.ts
# 結果: 3箇所検出（330行, 364行, 372行）
```

---

## 検出された未タスク（5件）

### UT-9G-001: calculateNextRun の cron 式パース改善

- **検出箇所**: `apps/desktop/src/main/services/skill/SkillScheduler.ts` 330-339行目
- **現状**: cron 方式の `calculateNextRun()` は簡易実装。node-cron は次回実行時刻を直接算出する API を持たないため、「現在時刻 + 1分」を仮の次回実行時刻としている
- **コード内コメント**: `"簡易実装: 現在時刻 + 1分を仮の次回とする"`, `"実運用では cron-parser ライブラリを使用する"`
- **影響**: スケジュール一覧画面で表示される「次回実行時刻」が不正確になる。cron 式 `"0 18 * * 1-5"`（平日18時）でも、常に「現在時刻の次の分」が返される
- **推奨対応**: `cron-parser` ライブラリ（`npm: cron-parser`）を導入し、`parser.parseExpression(cronExpression).next().toDate()` で正確な次回実行時刻を算出する
- **優先度**: Medium（機能は動作するが、表示精度が低い）
- **Phase 1 対応要件**: FR-10（nextRun を計算し、次回実行予定時刻をスケジュール情報として返却する）

### UT-9G-002: registerEventListener の file_change / git_commit 対応

- **検出箇所**: `apps/desktop/src/main/services/skill/SkillScheduler.ts` 364-374行目
- **現状**: event 方式のうち `app_start` のみ実装済み。`file_change` と `git_commit` はプレースホルダー（コメントのみで実装なし）
- **コード内コメント**: `"file_change と git_commit は将来実装"`
- **影響**: event 方式で `file_change` または `git_commit` を指定したスケジュールは、登録はできるが実行されない
- **推奨対応**:
  - `file_change`: ファイルウォッチャー（既存の `file:watch-start` チャンネルとの統合、または chokidar ライブラリの直接使用）で `eventConfig.watchPaths` に指定されたパスを監視し、変更検知時にスキルを実行する
  - `git_commit`: git hook（post-commit）またはリポジトリのポーリングで検知する仕組みを実装する
- **優先度**: Low（app_start は動作する。file_change/git_commit は UI 側で選択肢として提供されるまでは影響が限定的）
- **Phase 1 対応要件**: FR-04（イベントトリガーでスケジュールを登録し、イベント発生時にスキルを自動実行する）
- **Phase 1 スコープ定義**: 「file_change イベントの詳細実装」「git_commit イベントの詳細実装」は明示的にスコープ外と定義済み

### UT-9G-003: sendNotification() の実装

- **検出箇所**: Phase 2 設計書で定義されたメソッド（`SkillScheduler.ts` に未実装）
- **現状**: Phase 2 設計では `private sendNotification(schedule: ScheduledSkill, result: ScheduledRunResult): void` が定義されていたが、実装されていない。`NotificationSettings` 型はデータとして保存・復元されるが、通知送信のロジックが存在しない
- **影響**: スケジュール実行後に、`notification.onSuccess` や `notification.onFailure` を `true` に設定しても通知が送信されない。ユーザーは実行結果を確認するためにスケジュール一覧画面を手動で開く必要がある
- **推奨対応**:
  - `system` 通知: `new Notification({ title, body })` で Electron のシステム通知を送信
  - `inApp` 通知: `mainWindow.webContents.send('skill:schedule:notification', result)` で Renderer に通知イベントを送信
  - `both` 通知: 上記2つを両方実行
- **優先度**: Medium（通知なしでも機能は動作するが、ユーザー体験が低下する）
- **Phase 1 対応要件**: FR-09（スキル実行完了時に NotificationSettings に基づいて通知を送信する）、AC-08

### UT-9G-004: shutdown() メソッドの実装

- **検出箇所**: Phase 2 設計書で定義されたメソッド（`SkillScheduler.ts` に未実装）
- **現状**: Phase 2 設計では `async shutdown(): Promise<void>` が定義されていたが、実装されていない。アプリ終了時に全タイマーを明示的に停止する処理がない
- **影響**: アプリ終了時にアクティブなタイマー（cron タスク、setInterval、setTimeout）が明示的に停止されない。Node.js プロセス終了時にタイマーは自動的に破棄されるため実害は限定的だが、graceful shutdown のベストプラクティスに反する。特に、実行中のスキルがある場合にアプリが即座に終了すると、実行結果が記録されない可能性がある
- **推奨対応**:
  ```typescript
  async shutdown(): Promise<void> {
    for (const [id] of this.activeJobs) {
      this.deactivateSchedule(id);
    }
    this.activeJobs.clear();
  }
  ```
  `app.on('before-quit')` で `await skillScheduler.shutdown()` を呼び出す
- **優先度**: Low（プロセス終了で自動破棄されるため実害は限定的）

### UT-9G-005: スケジュール実行完了の Renderer 通知（push イベント）

- **検出箇所**: `apps/desktop/src/preload/channels.ts` の `ALLOWED_ON_CHANNELS` と `apps/desktop/src/main/ipc/skillHandlers.ts`
- **現状**: スケジュール実行完了時に Main -> Renderer への push 通知イベントが存在しない。`ALLOWED_ON_CHANNELS` にスケジュール関連のチャンネルが登録されていない
- **影響**: Renderer 側でスケジュール実行結果をリアルタイムに表示できない。ポーリング（定期的に `scheduleList` を呼び出す）で代替する必要がある
- **推奨対応**:
  - `skill:schedule:executed` チャンネルを `IPC_CHANNELS` と `ALLOWED_ON_CHANNELS` に追加
  - `executeScheduledSkill()` の完了時に `mainWindow.webContents.send(IPC_CHANNELS.SKILL_SCHEDULE_EXECUTED, runResult)` で通知
  - Preload API に `onScheduleExecuted(callback)` メソッドを追加
- **優先度**: Low（UI タスク task-031b で合わせて対応可能）

---

## スコープ外項目確認

| 項目                    | 確認内容             | 結論               |
| ----------------------- | -------------------- | ------------------ |
| スケジュール管理UI      | task-031b で定義済み | 本タスクでは対象外 |
| ScheduleSkillDialog     | task-031b で定義済み | 本タスクでは対象外 |
| CronEditor              | task-031b で定義済み | 本タスクでは対象外 |
| ScheduleList            | task-031b で定義済み | 本タスクでは対象外 |
| E2Eテスト（Playwright） | 別タスクで対応       | 本タスクでは対象外 |

---

## 未タスク管理 3ステップ（P3対策）

### UT-9G-001 (calculateNextRun cron パース改善)

1. [x] 本レポートに検出内容を記録
2. [x] `task-workflow.md` の残課題テーブルに登録
3. [x] 関連仕様書（`interfaces-agent-sdk-skill.md`）に参照リンク追加

### UT-9G-002 (file_change / git_commit イベント対応)

1. [x] 本レポートに検出内容を記録
2. [x] `task-workflow.md` の残課題テーブルに登録
3. [x] 関連仕様書に参照リンク追加

### UT-9G-003 (sendNotification() 実装)

1. [x] 本レポートに検出内容を記録
2. [x] `task-workflow.md` の残課題テーブルに登録
3. [x] 関連仕様書に参照リンク追加

### UT-9G-004 (shutdown() メソッド実装)

1. [x] 本レポートに検出内容を記録
2. [x] `task-workflow.md` の残課題テーブルに登録
3. [x] 関連仕様書に参照リンク追加

### UT-9G-005 (スケジュール実行完了 push 通知)

1. [x] 本レポートに検出内容を記録
2. [x] `task-workflow.md` の残課題テーブルに登録
3. [x] 関連仕様書に参照リンク追加

---

## 判定

**5件の未タスクを検出**。内訳は以下の通り:

| ID        | 内容                     | 優先度 | Phase 1 要件 | 備考                                         |
| --------- | ------------------------ | ------ | ------------ | -------------------------------------------- |
| UT-9G-001 | cron パース改善          | Medium | FR-10        | cron-parser ライブラリ導入で対応             |
| UT-9G-002 | file_change / git_commit | Low    | FR-04        | Phase 1 で明示的にスコープ外と定義済み       |
| UT-9G-003 | sendNotification() 実装  | Medium | FR-09, AC-08 | UI タスクとの統合で対応                      |
| UT-9G-004 | shutdown() メソッド実装  | Low    | Phase 2 設計 | プロセス終了で自動破棄されるため実害は限定的 |
| UT-9G-005 | Renderer push 通知       | Low    | なし         | UI タスク task-031b で合わせて対応可能       |

いずれも機能上の致命的な影響はないが、実運用品質の向上のために後続タスクとして対応すべきである。以下の未タスク指示書を作成し、`task-workflow.md` と関連仕様書への登録を完了した。

| ID        | 指示書                                                                                                                     |
| --------- | -------------------------------------------------------------------------------------------------------------------------- |
| UT-9G-001 | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/unassigned-task/task-skill-schedule-cron-next-run-accuracy.md`   |
| UT-9G-002 | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/unassigned-task/task-skill-schedule-event-trigger-completion.md` |
| UT-9G-003 | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/unassigned-task/task-skill-schedule-notification-dispatch.md`    |
| UT-9G-004 | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/unassigned-task/task-skill-schedule-graceful-shutdown.md`        |
| UT-9G-005 | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/unassigned-task/task-skill-schedule-execution-push-event.md`     |
