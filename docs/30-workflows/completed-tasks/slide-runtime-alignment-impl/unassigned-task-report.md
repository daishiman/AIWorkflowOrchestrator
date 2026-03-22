# 未タスク検出レポート: slide-runtime-alignment-impl

## メタ情報

| 項目     | 値                                   |
| -------- | ------------------------------------ |
| タスク   | TASK-IMP-SLIDE-RUNTIME-ALIGNMENT-001 |
| Issue    | #1363                                |
| 検出日   | 2026-03-22                           |
| 検出件数 | 3件                                  |

## 検出された未タスク

### 1. UT-SLIDE-CI-DRIFT-SCAN-001

| 項目     | 値                                                                                             |
| -------- | ---------------------------------------------------------------------------------------------- |
| タイトル | canonical チャネルリストと registerAllIpcHandlers の自動突合 CI スクリプト                     |
| 優先度   | medium                                                                                         |
| 根拠     | why 思考 5 Why 分析 --- drift 再発の構造的防止                                                 |
| 指示書   | `docs/30-workflows/slide-runtime-alignment-impl/unassigned-task/UT-SLIDE-CI-DRIFT-SCAN-001.md` |

### 2. UT-SLIDE-GUIDANCE-UI-001

| 項目     | 値                                                                                           |
| -------- | -------------------------------------------------------------------------------------------- |
| タイトル | handoffGuidance を表示する Renderer コンポーネント（SlideGuidanceBlock）の実装               |
| 優先度   | low                                                                                          |
| 根拠     | システム思考 --- Store に保存しても表示コンポーネントがなければユーザーに到達しない          |
| 指示書   | `docs/30-workflows/slide-runtime-alignment-impl/unassigned-task/UT-SLIDE-GUIDANCE-UI-001.md` |

### 3. UT-SLIDE-IPC-TEMPLATE-001

| 項目     | 値                                                                                            |
| -------- | --------------------------------------------------------------------------------------------- |
| タイトル | IPC ハンドラ追加時の標準テンプレート（scaffold）                                              |
| 優先度   | low                                                                                           |
| 根拠     | 帰納的思考 --- D1/D2/D5 は「最後の一手の省略」パターンであり、scaffold で防止可能             |
| 指示書   | `docs/30-workflows/slide-runtime-alignment-impl/unassigned-task/UT-SLIDE-IPC-TEMPLATE-001.md` |

## P3 3ステップ完了状況

| ステップ                       | 状況                                             |
| ------------------------------ | ------------------------------------------------ |
| 1. 指示書作成                  | 完了（unassigned-task/ 配下に3ファイル作成済み） |
| 2. task-workflow.md 残課題登録 | PR 作成時に実施（worktree 制約）                 |
| 3. 関連仕様書への参照リンク    | PR 作成時に実施（worktree 制約）                 |
