# 未タスク検出レポート - TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001

## 検出結果

### 候補 1: `hour`/`minute` 範囲チェック

- **内容**: `hour`（0-23）と `minute`（0-59）にも範囲外ガードが未実装
- **スコープ外理由**: 本タスクでは `monthly` の `dayOfMonth` のみスコープとして定義済み
- **今後の対応**: 将来のタスクとして `TASK-CRON-ALL-FREQUENCY-GUARD-001` への切り出しを検討

### 候補 2: `dayOfMonth: null` の既定値ルール

- **内容**: `VisualCronConfig.dayOfMonth` は `number` 型（null を許容しない）だが、
  null/undefined が渡された場合の既定値ルールが未定義
- **スコープ外理由**: 型定義の責務であり本タスクの変更範囲外
- **今後の対応**: 別タスクとして切り出し検討

## 新規未タスクとして正式化するか

**今回は正式化しない** — 上記候補は既存のスコープ外事項として記録済み。
緊急性が低いため、将来のバックログとして残す。

### 補足: monthly 逆変換の誤分類防止は本タスク内で対応済み

- `cronParser.ts` の monthly 範囲チェックと `cronHumanizer` / `VisualCronPicker` の回帰テストは既存スコープ内で実装済み
- そのため、monthly の不正値に関する新規未タスクは発生させない
- 既存 backlog として残すのは `TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001` のみ

## 件数

未タスク候補: 2 件（正式化: 0 件）
