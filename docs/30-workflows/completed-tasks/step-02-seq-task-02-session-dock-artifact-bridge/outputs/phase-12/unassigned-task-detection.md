# Unassigned Task Detection - Session Dock Artifact Bridge

## 検出結果

検出件数: **4件**

## 検出ソース

| ソース                      | 検出件数 |
| --------------------------- | -------- |
| Phase 10 最終レビュー MINOR | 2件      |
| Phase 11 手動テスト DI      | 1件      |
| Phase 9 リスクレジスタ      | 1件      |

## 検出済み未タスク一覧

### UT-01: data-testid 衝突解消

| 項目           | 内容                                                                       |
| -------------- | -------------------------------------------------------------------------- |
| 未タスクID     | UT-IMP-SESSION-DOCK-TESTID-DEDUP-001                                       |
| 検出元         | Phase 10 MN-10-01 / Phase 9 RISK-06                                        |
| 優先度         | 低                                                                         |
| 概要           | HandoffBlock と PersistentTerminalLauncher に固有の data-testid を付与する |
| 対応タイミング | 実装タスク Phase 5                                                         |

### UT-02: CREDENTIAL_PATTERNS 拡張

| 項目           | 内容                                                          |
| -------------- | ------------------------------------------------------------- |
| 未タスクID     | UT-IMP-SESSION-DOCK-CREDENTIAL-PATTERN-EXTEND-001             |
| 検出元         | Phase 10 MN-10-02 / Phase 9 RISK-04                           |
| 優先度         | 中                                                            |
| 概要           | AWS / GCP / Azure のキー形式を CREDENTIAL_PATTERNS に追加する |
| 対応タイミング | 実装タスク Phase 5                                            |

### UT-03: Share Rail / Transcript レイアウト競合対策

| 項目           | 内容                                                                          |
| -------------- | ----------------------------------------------------------------------------- |
| 未タスクID     | UT-IMP-SESSION-DOCK-SHARE-RAIL-LAYOUT-001                                     |
| 検出元         | Phase 11 DI-01                                                                |
| 優先度         | 低                                                                            |
| 概要           | transcript 展開時の Share Rail 表示位置を sticky footer or 上部移動で対応する |
| 対応タイミング | 実装タスク Phase 5 UI 実装時                                                  |

### UT-04: transcript persistence 実装（Task06 依存）

| 項目           | 内容                                              |
| -------------- | ------------------------------------------------- |
| 未タスクID     | UT-TERMINAL-DOCK-SESSION-PERSISTENCE-001          |
| 検出元         | Phase 9 RISK-01 / 既存未タスク（Issue #1460）     |
| 優先度         | 高                                                |
| 概要           | Task06 完了後に transcript persistence を実装する |
| 対応タイミング | Task06 完了後                                     |
| 備考           | 既に未タスク仕様書として存在（再検出）            |

## 3ステップ確認

| 未タスク | 1. 指示書                                                                                | 2. task-workflow残課題              | 3. 関連仕様書リンク                                       |
| -------- | ---------------------------------------------------------------------------------------- | ----------------------------------- | --------------------------------------------------------- |
| UT-01    | `docs/30-workflows/unassigned-task/UT-IMP-SESSION-DOCK-TESTID-DEDUP-001.md`              | task-workflow-backlog.md に登録済み | final-review-report.md に記載                             |
| UT-02    | `docs/30-workflows/unassigned-task/UT-IMP-SESSION-DOCK-CREDENTIAL-PATTERN-EXTEND-001.md` | task-workflow-backlog.md に登録済み | artifact-bridge-design.md / final-review-report.md に記載 |
| UT-03    | `docs/30-workflows/unassigned-task/UT-IMP-SESSION-DOCK-SHARE-RAIL-LAYOUT-001.md`         | task-workflow-backlog.md に登録済み | discovered-issues.md に記載                               |
| UT-04    | 既存                                                                                     | 既存（#1460）                       | 既存                                                      |

注: UT-01〜UT-03 の独立した指示書ファイルを `docs/30-workflows/unassigned-task/` に作成し、P3/P58 の3ステップを完了した（エレガント検証レビューによる是正）。
