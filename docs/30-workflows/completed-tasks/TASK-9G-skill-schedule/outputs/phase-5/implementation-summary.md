# Phase 5 Implementation Summary - TASK-9G Skill Schedule

## 実装ファイル一覧

### 1. ScheduleStore.ts (新規作成)

- **パス**: `apps/desktop/src/main/services/skill/ScheduleStore.ts`
- **目的**: electron-store ベースのスケジュール永続化ストア
- **主要機能**:
  - `getAll()`: 全スケジュール取得
  - `getById(id)`: ID指定でスケジュール取得
  - `add(schedule)`: スケジュール追加（呼び出し元が生成した ID をそのまま保存、createdAt/updatedAt デフォルト付与、戻り値 ScheduledSkill）
  - `update(id, updates)`: スケジュール更新（見つからない場合 Error スロー）
  - `delete(id)`: スケジュール削除（見つからない場合 Error スロー）
  - `addRunResult(id, result)`: 実行結果を runHistory の先頭に追加（最大100件維持）、lastRun 更新
  - `persist()`: electron-store への永続化
- **P19 対策**: コンストラクタで `Array.isArray()` + `filter()` によるバリデーション実施

### 2. SkillScheduler.ts (新規作成)

- **パス**: `apps/desktop/src/main/services/skill/SkillScheduler.ts`
- **目的**: cron / interval / once / event の4方式でスキルスケジュール実行を管理
- **主要機能**:
  - `initialize()`: ストアから全スケジュールを取得し、enabled なものをアクティベート
  - `addSchedule(input)`: cron 式バリデーション、nextRun 計算、ストア保存、アクティベート
  - `updateSchedule(id, updates)`: デアクティベート → ストア更新 → 再アクティベート
  - `deleteSchedule(id)`: デアクティベート → ストア削除
  - `enableSchedule(id)`: enabled=true に更新 + アクティベート
  - `disableSchedule(id)`: デアクティベート + enabled=false に更新
  - `activateSchedule(schedule)`: cron.schedule / setInterval / setTimeout / registerEventListener
  - `deactivateSchedule(id)`: cron stop / clearInterval / clearTimeout
  - `executeScheduledSkill(schedule)`: SkillExecutor 経由でスキル実行、結果記録、nextRun 再計算
  - `calculateNextRun(schedule)`: 各スケジュール方式に応じた次回実行時刻計算
- **依存**: ScheduleStore, SchedulerSkillExecutor (DI インターフェース)

### 3. skillHandlers.ts (修正)

- **パス**: `apps/desktop/src/main/ipc/skillHandlers.ts`
- **変更内容**: `registerSkillScheduleHandlers()` と `unregisterSkillScheduleHandlers()` を追加
- **5つの IPC ハンドラ**:
  - `skill:schedule:list` - スケジュール一覧取得
  - `skill:schedule:add` - スケジュール追加（型別バリデーション: cron は cronExpression 必須、interval は正の数値必須）
  - `skill:schedule:update` - スケジュール更新
  - `skill:schedule:delete` - スケジュール削除
  - `skill:schedule:toggle` - 有効/無効切り替え（現在の enabled 状態を取得して反転）
- **セキュリティ**: 全ハンドラで `validateIpcSender` + P42 準拠3段バリデーション
- **エラーハンドリング**: 既知エラー → error.message、未知エラー → "Internal error"

### 4. ipc/index.ts (修正)

- **パス**: `apps/desktop/src/main/ipc/index.ts`
- **変更内容**:
  - `ScheduleStore` と `SkillScheduler` のインポート追加
  - `registerSkillScheduleHandlers` / `unregisterSkillScheduleHandlers` のインポート追加
  - `registerAllIpcHandlers()` 内に ScheduleStore / SkillScheduler の初期化と登録を追加
  - SkillService.executeSkill を使ったアダプタで SchedulerSkillExecutor を実装

### 5. channels.ts (事前追加済み)

- **パス**: `apps/desktop/src/preload/channels.ts`
- **変更内容**: 5つの IPC チャンネル定数を追加済み
  - `SKILL_SCHEDULE_LIST`, `SKILL_SCHEDULE_ADD`, `SKILL_SCHEDULE_UPDATE`, `SKILL_SCHEDULE_DELETE`, `SKILL_SCHEDULE_TOGGLE`
  - `ALLOWED_INVOKE_CHANNELS` にも追加済み

### 6. skill-schedule.ts (事前作成済み)

- **パス**: `packages/shared/src/types/skill-schedule.ts`
- **変更内容**: 型定義（ScheduledSkill, SkillSchedule, NotificationSettings, ScheduledRunResult）が事前に作成済み
- **IPC シリアライズ方針**: 日時フィールドは全て string（ISO 8601）で定義

## 設計上の決定事項

| 項目             | 決定内容                                              | 理由                                 |
| ---------------- | ----------------------------------------------------- | ------------------------------------ |
| DI パターン      | SchedulerSkillExecutor インターフェース               | SkillExecutor との疎結合（P34 準拠） |
| 永続化           | electron-store の `skill-schedules` ストア            | 既存パターン踏襲                     |
| cron 実行        | node-cron ライブラリ                                  | 軽量・メンテナンス活発               |
| nextRun 計算     | 簡易実装（cron: 現在+1分、interval: 現在+interval）   | cron-parser 未導入のため             |
| once 自動無効化  | executeScheduledSkill 内で disableSchedule() 呼び出し | 仕様書要件通り                       |
| イベントリスナー | app_start のみプレースホルダー実装                    | file_change / git_commit は将来実装  |
