# Phase 12: 未タスク検出レポート

## メタ情報

| 項目         | 値                             |
| ------------ | ------------------------------ |
| タスク ID    | TASK-UI-05A-SKILL-EDITOR-VIEW  |
| 検出日       | 2026-03-02                     |
| raw検出件数  | 8件（Issue 1-7 + getFileTree） |
| 正式登録件数 | 3件（統合管理）                |

## 検出ソース

| ソース                  | 検出数 |
| ----------------------- | ------ |
| Phase 10 レビュー結果   | 1件    |
| Phase 11 手動テスト結果 | 7件    |
| コードベース TODO/FIXME | 0件    |

## raw検出（課題一覧）

1. UT-UI-05A-001: FileTree キーボードナビゲーション
2. UT-UI-05A-002: レスポンシブドロワー
3. UT-UI-05A-003: キーボードショートカット
4. UT-UI-05A-004: 保存成功Toast
5. UT-UI-05A-005: 読み取り専用モード強化
6. UT-UI-05A-006: ナビゲーション導線配線
7. UT-UI-05A-007: マイクロアニメーション
8. UT-UI-05A-GETFILETREE-001: `skill:getFileTree` IPC実装

## 正式登録（正本）

| タスクID                             | ファイル                                                                              | 役割                              |
| ------------------------------------ | ------------------------------------------------------------------------------------- | --------------------------------- |
| UT-UI-05A-GETFILETREE-001            | `docs/30-workflows/unassigned-task/task-ui-05a-getfiletree-ipc-implementation.md`     | IPC契約未実装の解消               |
| UT-UI-05A-SPEC-CONSISTENCY-001       | `docs/30-workflows/unassigned-task/task-ui-05a-spec-consistency-filetree-contract.md` | Phase 2/5 契約記述のドリフト解消  |
| UT-UI-05A-IMPLEMENTATION-CLOSURE-001 | `docs/30-workflows/unassigned-task/task-ui-05a-editor-view-implementation-closure.md` | UI統合残課題（001-007）の収束管理 |

## 3ステップ完了確認（P3準拠）

- [x] 指示書作成（`docs/30-workflows/unassigned-task/`）
- [x] `task-workflow.md` 残課題テーブル登録
- [x] 関連仕様書リンク更新（`ui-ux-components.md` / `ui-ux-feature-components.md`）

## 補足

旧ファイル `docs/30-workflows/skill-editor-view/unassigned-task/UT-UI-05A-GETFILETREE-001.md` は作業履歴として残置し、正本管理は `docs/30-workflows/unassigned-task/` 側へ統一する。
