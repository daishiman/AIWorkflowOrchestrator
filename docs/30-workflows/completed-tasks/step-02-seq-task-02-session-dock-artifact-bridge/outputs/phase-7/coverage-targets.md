# Coverage Targets - Session Dock Artifact Bridge

## カバレッジ目標

| 指標              | 最低基準 | 推奨基準 | 対象                    |
| ----------------- | -------- | -------- | ----------------------- |
| Line Coverage     | 80%      | 90%      | 新規/変更ファイル全体   |
| Branch Coverage   | 60%      | 70%      | state 遷移分岐を重点    |
| Function Coverage | 80%      | 90%      | アクション/セレクタ全体 |

## AC カバレッジマッピング

| AC                               | テストカバレッジ                             | 対象テスト ID |
| -------------------------------- | -------------------------------------------- | ------------- |
| AC-1 (8 state 定義)              | SM-01〜SM-12, CTA-01〜CTA-08, NEG-01〜NEG-03 | 23 テスト     |
| AC-2 (persistence)               | PER-01〜PER-07, EDGE-PER-01〜EDGE-PER-05     | 12 テスト     |
| AC-3 (manual share + provenance) | SH-01〜SH-06, EDGE-SH-01〜EDGE-SH-04         | 10 テスト     |
| AC-4 (artifact-first)            | ART-01〜ART-06, EDGE-ART-01〜EDGE-ART-02     | 8 テスト      |
| AC-5 (error summary)             | ART-02, ART-05, EDGE-ART-01                  | 3 テスト      |

**合計: 56 テストケース**（設計タスクのため、テストマトリクスとしての定義）

## ファイル別カバレッジ目標

| ファイル                             | Line | Branch | Function | 重点項目           |
| ------------------------------------ | ---- | ------ | -------- | ------------------ |
| agentSlice.ts (SessionDock 部分)     | 90%  | 70%    | 90%      | state 遷移ロジック |
| ArtifactSummary.tsx                  | 85%  | 65%    | 85%      | 表示分岐           |
| TranscriptShareRail.tsx              | 85%  | 65%    | 85%      | 操作分岐           |
| ProvenanceChip.tsx                   | 90%  | 70%    | 90%      | データ表示         |
| ExecutionConsoleView (dock 接続部分) | 80%  | 60%    | 80%      | state ベース表示   |
