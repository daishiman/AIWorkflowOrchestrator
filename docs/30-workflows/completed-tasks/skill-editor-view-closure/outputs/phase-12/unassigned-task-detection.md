# 未タスク検出レポート

## メタ情報

| 項目      | 内容                                 |
| --------- | ------------------------------------ |
| タスクID  | UT-UI-05A-IMPLEMENTATION-CLOSURE-001 |
| 作成日    | 2026-03-03                           |
| 対象Phase | Phase 10, 11, 12                     |

## 検出結果サマリー

| 区分                 | 件数 |
| -------------------- | ---- |
| 新規未タスク         | 2    |
| 既存未タスク（継続） | 2    |
| 合計                 | 4    |

## 新規未タスク

| 未タスクID                                        | 内容                                                | 優先度 | 指示書                                                                                                                           |
| ------------------------------------------------- | --------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------- |
| UT-UI-05A-PHASE11-SCREENSHOT-NAME-CONSISTENCY-001 | Phase 11 証跡ファイル名の意味一致化                 | 低     | `docs/30-workflows/completed-tasks/skill-editor-view-closure/unassigned-task/task-ui-05a-phase11-screenshot-name-consistency.md` |
| UT-UI-05A-PHASE12-SYNC-BUNDLE-GUARD-001           | Phase 12 同一ターン同期ガード（台帳/教訓/検証証跡） | 中     | `docs/30-workflows/completed-tasks/skill-editor-view-closure/unassigned-task/task-ui-05a-phase12-sync-bundle-guard.md`           |

### 新規未タスクの3ステップ実施状況

1. 指示書作成: ✅ 完了
2. 残課題テーブル登録: ✅ 完了（`task-workflow.md` へ追加）
3. 関連仕様書リンク追加: ✅ 完了（`task-workflow.md` / `lessons-learned.md` へ追加）

## 既存未タスク（継続管理）

| 未タスクID                     | 内容                                      | 優先度   | 参照                                                                                                                            |
| ------------------------------ | ----------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| UT-UI-05A-GETFILETREE-001      | `skill:getFileTree` IPC 実装              | CRITICAL | `docs/30-workflows/completed-tasks/skill-editor-view-closure/unassigned-task/task-ui-05a-getfiletree-ipc-implementation.md`     |
| UT-UI-05A-SPEC-CONSISTENCY-001 | fileTree 契約（配列/IPC戻り値）の仕様統一 | 中       | `docs/30-workflows/completed-tasks/skill-editor-view-closure/unassigned-task/task-ui-05a-spec-consistency-filetree-contract.md` |

## 判定

- Phase 10/11/12 の確認で機能不具合由来の新規未タスクは 0 件
- 文書品質・同期運用改善タスク 2 件を新規作成し、継続2件と合わせて管理
- 未タスク監査コマンドの判定は `currentViolations=0` を採用
