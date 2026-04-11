# 未タスク検出レポート - TASK-UI-SCHEDULE-VISUAL-PICKER-001

検出日時: 2026-04-09
検出 Phase: Phase 12 (Task 12-4)

## 検出結果サマリー

| 重篤度   | 件数 |
| -------- | ---- |
| CRITICAL | 0    |
| HIGH     | 0    |
| MEDIUM   | 2    |
| LOW      | 2    |
| 合計     | 4    |

## 検出された未タスク一覧

### MEDIUM-01: 意味論的 cron 検証の欠如

**内容**: `validateCronExpression` は 5フィールド構文と値域（0-59等）のみを検証する。
「2月31日」「30分ステップで59分」等の意味的に不正な値を許容する。

**影響**: ユーザーが存在しない日時を設定した場合、スケジュールが永久に実行されない可能性がある。

**推奨対処**: cron-parser ライブラリの導入、または next-execution-time の計算による実行可能性チェック。

**優先度**: MEDIUM（UX 問題。データ破壊はなし）

---

### MEDIUM-02: `weekdays=[]` 時の cronConverter 出力

**内容**: `visualConfigToCron({ frequency: "weekly", weekdays: [], ... })` は
`"0 9 * * "` のような不正な cron 式を出力する。

**影響**: VisualCronPicker が UI でエラー表示しているため実際には発生しないが、
API を直接呼ぶ場合は不正な式が生成される。

**推奨対処**: cronConverter 内でガード処理を追加し、空の場合は特定の値（例: `"0 9 * * 0"` = 日曜）を返すか例外を投げる。

**優先度**: MEDIUM（API 直接利用時のリスク）

---

### LOW-01: `DayOfMonthSelector` の `dayOfMonth=null` 時の対応

**内容**: monthly で dayOfMonth が未選択の場合の挙動が cronConverter で未定義。

**影響**: 初期値（1）が使われるため実害なし。

**優先度**: LOW

---

### LOW-02: 英語以外のロケール対応

**内容**: `cronHumanizer` は ja/en のみ対応。他言語（zh/ko等）は未対応。

**影響**: 国際化対応が必要になった場合に追加実装が必要。

**優先度**: LOW（現状の要件スコープ外）

## 次のアクション

MEDIUM 以上の未タスクが2件あるが、いずれも現在の要件スコープ外のため
Phase 13（PR作成）に進む。必要に応じて別タスクとして起票する。
