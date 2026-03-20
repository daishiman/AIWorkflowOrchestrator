# Phase 12 Task 4: 未タスク検出レポート

> タスクID: UT-LIFECYCLE-EXECUTION-STATUS-TYPE-SPEC-SYNC-001
> 作成日: 2026-03-20

## 検出結果サマリー

| 項目                 | 件数 |
| -------------------- | ---- |
| 検出した未タスク候補 | 1件  |

## 検出した未タスク候補

### UT-1: StatusBadge 色/ラベルマッピング仕様への新3値追加

| 項目         | 内容                                                                                                |
| ------------ | --------------------------------------------------------------------------------------------------- |
| 検出元       | Phase 2 impact-analysis.md の DisplayableStatus 影響分析                                            |
| 対象ファイル | `ui-ux-feature-components-advanced.md` L151 付近                                                    |
| 内容         | StatusBadge のマッピングテーブルに `review` / `improve_ready` / `reuse_ready` の色/ラベル定義が必要 |
| 分類         | 仕様書レベルの追記（コード変更は Task12 スコープ）                                                  |
| 優先度       | low（Task12 Phase 5 完了後に実施）                                                                  |
| 対応方針     | Task12 の StatusBadge 実装時に合わせて仕様書を更新する                                              |

### 対応ステータス

本タスクは仕様書同期タスクであり、UT-1 は仕様書レベルの追記に留まる。
Task12（TASK-IMP-LIFECYCLE-REUSE-IMPROVE-CYCLE-001）の実装フェーズで StatusBadge の色/ラベルが確定するため、その時点で仕様書更新を実施するのが適切と判断。

独立した指示書の作成は、Task12 のスコープ内で対応可能なため省略する（Task12 の Phase 12 で合わせて記録予定）。
