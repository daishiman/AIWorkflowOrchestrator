# Phase 5: 仕様書修正レポート

## メタ情報

| 項目     | 値                             |
| -------- | ------------------------------ |
| タスクID | UT-IPC-DATA-FLOW-TYPE-GAPS-001 |
| Phase    | 5                              |
| 作成日   | 2026-02-24                     |

## 修正サマリ

全 6 Gap × 7 ファイルの仕様書修正を完了した。

| Gap | 修正内容                           | 対象ファイル | ステータス |
| --- | ---------------------------------- | ------------ | ---------- |
| 6   | IPC 引数 positional → object 変換  | task-020b    | ✅ 完了    |
| 1   | Date → string (ISO 8601) 変換      | task-022     | ✅ 完了    |
| 1   | Date → string (ISO 8601) 変換      | task-023a    | ✅ 完了    |
| 1+2 | Date → ISO 8601 + idle 追加        | task-023b    | ✅ 完了    |
| 1   | Date → string (ISO 8601) 変換      | task-023d    | ✅ 完了    |
| 3+4 | DocPreview onExport + ExportResult | task-030     | ✅ 完了    |
| 5   | safeOn 購読 + P5 対策              | task-031b    | ✅ 完了    |

## Gap 別修正詳細

### Gap 6: IPC 引数形式統一（task-020b）

- **修正箇所**: Step 2 IPC ハンドラーコードブロック（旧 lines 197-249）
- **変更内容**:
  1. 引数型インターフェース 6 個追加: `SkillReadFileArgs`, `SkillWriteFileArgs`, `SkillCreateFileArgs`, `SkillDeleteFileArgs`, `SkillListBackupsArgs`, `SkillRestoreBackupArgs`
  2. 全 6 ハンドラをオブジェクト形式に統一（`(_, skillName, relativePath)` → `(_, args: SkillReadFileArgs)`）
  3. P42 準拠 3 段バリデーション追加（typeof + 空文字列 + .trim()）
  4. P44 対策コメント付与
- **Step 1**: 変更不要（既に `relativePath` 命名で P45 準拠済み）

### Gap 1: Date 型シリアライズ（4 ファイル）

#### task-022（task-9f: SkillShare）

- `ImportResult.importedAt`: `Date` → `string; // ISO 8601`（JSDoc 付き）
- 「IPC シリアライズ方針（Date 型）」セクション追加

#### task-023a（task-9g: SkillSchedule）

- `ScheduledSkill.lastRun`: `Date` → `string | null; // ISO 8601`
- `ScheduledSkill.nextRun`: `Date` → `string | null; // ISO 8601`
- `SkillSchedule.runAt`: `Date` → `string | null; // ISO 8601`
- `ScheduledRunResult.startedAt`: `Date` → `string; // ISO 8601`
- `ScheduledRunResult.completedAt`: `Date` → `string | null; // ISO 8601`
- 「IPC シリアライズ方針（Date 型）」セクション追加

#### task-023b（task-9h: SkillDebug）

- `DebugSession.startedAt`: `Date` → `string; // ISO 8601`
- `DebugStep.timestamp`: `Date` → `string; // ISO 8601`
- `CallStackEntry.startTime`: `Date` → `string; // ISO 8601`
- 「IPC シリアライズ方針（Date 型）」セクション追加

#### task-023d（task-9j: SkillAnalytics）

- `SkillUsageEvent.timestamp`: `Date` → `string; // ISO 8601`
- `SkillStatistics.lastUsed`: `Date` → `string | null; // ISO 8601`
- `AnalyticsPeriod.start`: `Date` → `string; // ISO 8601`
- `AnalyticsPeriod.end`: `Date` → `string; // ISO 8601`
- `TrendDataPoint.timestamp`: `Date` → `string; // ISO 8601`
- `SkillUsageSummary.lastUsed`: `Date` → `string; // ISO 8601`
- 「IPC シリアライズ方針（Date 型）」セクション追加

### Gap 2: DebugSession.status 拡張（task-023b）

- `status`: `"running" | "paused" | "completed" | "error"` → `"idle" | "running" | "paused" | "completed" | "error"`
- 「idle 状態の定義」セクション追加（未開始の初期状態、05B との値セット一致を明記）

### Gap 3: DocPreview onExport 引数修正（task-030）

- `onExport`: `(format: string, path: string) => void` → `(docId: string, format: ExportFormat, outputPath: string) => void`
- `ExportFormat` 型定義追加: `"markdown" | "html" | "pdf"`
- 「DocPreview エクスポートのデータフロー」セクション追加（4 ステップ IPC フロー図）

### Gap 4: ExportResult 変換ロジック（task-030）

- 「ExportResult → UI コールバック変換ロジック」セクション追加
- 成功時（shareUrl 有無で分岐）、失敗時（リトライ条件含む）のロジックを明記
- `ExportDialogState` interface + `handleExportResult()` 関数概要を追加

### Gap 5: safeOn 購読パターン（task-031b）

- 「skill:debug:event のイベント購読（P5 対策）」セクション追加
- useEffect + cleanup パターンのコード例
- React StrictMode 対策の注意事項
- DebugEvent 型参照（task-9h 定義、ISO 8601 方針）
- Preload API 定義（`onDebugEvent` メソッド）

## 並列実行の構成

| エージェント | 担当 Gap  | 対象ファイル         |
| ------------ | --------- | -------------------- |
| Agent A      | Gap 6     | task-020b            |
| Agent B      | Gap 1     | task-022, task-023a  |
| Agent C      | Gap 1+2   | task-023b, task-023d |
| Agent D      | Gap 3+4+5 | task-030, task-031b  |

## 完了判定

- [x] Gap 1: 全 14 フィールドの Date → ISO 8601 変換が完了
- [x] Gap 2: idle 値の追加と定義セクションの追加が完了
- [x] Gap 3: onExport 引数修正と IPC データフロー図の追加が完了
- [x] Gap 4: ExportResult 変換ロジックの追加が完了
- [x] Gap 5: safeOn 購読パターンと P5 対策の追加が完了
- [x] Gap 6: 全 6 ハンドラのオブジェクト形式変換と Args interface 追加が完了
- [x] 全 7 ファイルの修正が完了
- [x] 各ファイルに「IPC シリアライズ方針」セクションが追加されている
