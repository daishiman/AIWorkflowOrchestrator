# システム仕様更新サマリー

作成日: 2026-04-09
タスク: TASK-UI-SCHEDULE-VISUAL-PICKER-001

## 実装状況テーブル（master_system_design.md 更新内容）

以下のコンポーネント・ユーティリティが TASK-UI-SCHEDULE-VISUAL-PICKER-001 で実装済みとなった。

| コンポーネント/ユーティリティ | 実装状況 | 備考                                    |
| ----------------------------- | -------- | --------------------------------------- |
| VisualCronPicker              | 実装済み | TASK-UI-SCHEDULE-VISUAL-PICKER-001      |
| FrequencySelector             | 実装済み | VisualCronPicker のサブコンポーネント   |
| WeekdaySelector               | 実装済み | VisualCronPicker のサブコンポーネント   |
| TimePickerSection             | 実装済み | VisualCronPicker のサブコンポーネント   |
| DayOfMonthSelector            | 実装済み | VisualCronPicker のサブコンポーネント   |
| CronPreview                   | 実装済み | cronHumanizer と連携                    |
| cronConverter.ts              | 実装済み | visualConfigToCron / cronToVisualConfig |
| cronParser.ts                 | 実装済み | VisualCronPicker の逆変換ユーティリティ |
| cronHumanizer.ts              | 実装済み | 人間可読テキスト生成（ja/en）           |
| scheduleConfigValidator.ts    | 実装済み | cronExpression / timezone の保存前検証  |

## UI/UX ガイドライン追加内容（16-ui-ux-guidelines.md）

### スケジュール設定 UI セクション

**VisualCronPicker の使用シーン**

- ScheduleDialog: スケジュール新規作成・編集
- ConversationRoundStep: スキルウィザードのスケジュール設定

**FrequencySelector 選択肢**
| 値 | 表示ラベル |
|---|---|
| every-minute | 毎分 |
| every-hour | 毎時 |
| daily | 毎日 |
| weekly | 毎週 |
| monthly | 毎月 |
| custom | カスタム |

**WeekdaySelector**

- 曜日順: 月・火・水・木・金・土・日
- 初期状態: 全て未選択
- 複数選択可

**TimePickerSection**

- 時: 0〜23（24時間制）
- 分: 0/5/10/.../55（5分刻み、12選択肢）

**エラー表示**

- `role="alert"` で表示
- 毎週で曜日が0件の場合必須

**AdvancedToggle**

- 「高度な設定」ボタンで直接入力モードに切り替え

## IPC 仕様の変更

**変更なし。** `skill:schedule:add` IPC チャンネルは引き続き `cronExpression: string` を受け取る。
VisualCronPicker は string を生成して渡すため、IPC 仕様の変更は不要。

## Phase 11 視覚証跡

- 専用ハーネス `phase11-task-ui-schedule-visual-picker.html` を使って current build のスクリーンショットを取得した。
- `outputs/phase-11/screenshots/ss-001.png` 〜 `ss-010.png` に VisualCronPicker / ConversationRoundStep の主要状態を保存済み。
- `outputs/phase-11/phase11-capture-metadata.json` で route / viewport / state を紐付けている。

## 残存課題

| 課題                   | 詳細                   | 優先度 |
| ---------------------- | ---------------------- | ------ |
| 意味論的 cron 検証     | "2月31日" 等は現状許容 | LOW    |
| 英語ロケール以外の追加 | 現状 ja/en のみ        | LOW    |
