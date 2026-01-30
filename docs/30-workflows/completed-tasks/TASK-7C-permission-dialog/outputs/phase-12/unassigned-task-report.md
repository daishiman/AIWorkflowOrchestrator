# 未タスク検出レポート - TASK-7C PermissionDialog コンポーネント

## 検出結果: 4件

### 確認ソース

| ソース               | 確認項目                           | 結果        |
| -------------------- | ---------------------------------- | ----------- |
| 元タスク仕様書       | 「スコープ外」として明示された項目 | 2件検出     |
| Phase 3レビュー結果  | MINOR判定の指摘事項                | 0件         |
| Phase 10レビュー結果 | MINOR判定の指摘事項                | 0件         |
| Phase 11手動テスト   | スコープ外の発見事項・改善提案     | 4件提案あり |
| コードコメント       | TODO/FIXME/HACK/XXX                | 0件         |

### 検出された未タスク

| #   | 候補                                    | ソース             | 優先度 | 説明                                                                   |
| --- | --------------------------------------- | ------------------ | ------ | ---------------------------------------------------------------------- |
| 1   | ツール別アイコン表示（toolIcons対応）   | 元タスク仕様書     | medium | 仕様書にtoolIcons定義あり。Bash=💻, Read=📖 等のアイコンを表示する機能 |
| 2   | 改善版UI（人間可読な操作説明）への移行  | specification.md   | medium | 「コマンドを実行します」等の自然言語での操作説明への移行               |
| 3   | ダークモード対応                        | Phase 11手動テスト | low    | 現在は白背景のみ。bg-white等をダークモード対応に変更                   |
| 4   | 既存Permission/PermissionDialogとの統合 | 設計判断           | low    | components/Permission/ の既存ダイアログとの統合/移行を検討             |

### 作成された未タスク指示書

| タスクID                              | ファイル                                                                     | 優先度 |
| ------------------------------------- | ---------------------------------------------------------------------------- | ------ |
| task-imp-permission-tool-icons-001    | `docs/30-workflows/unassigned-task/task-imp-permission-tool-icons-001.md`    | 中     |
| task-imp-permission-readable-ui-001   | `docs/30-workflows/unassigned-task/task-imp-permission-readable-ui-001.md`   | 中     |
| task-imp-permission-dark-mode-001     | `docs/30-workflows/unassigned-task/task-imp-permission-dark-mode-001.md`     | 低     |
| task-ref-permission-consolidation-001 | `docs/30-workflows/unassigned-task/task-ref-permission-consolidation-001.md` | 低     |

### コードコメントスキャン結果

```
対象: apps/desktop/src/renderer/components/skill/
検索パターン: TODO, FIXME, HACK, XXX
結果: 0件
```

### 推奨アクション

- 未タスク#1, #2はスキルシステムの次期フェーズで対応を検討
- 未タスク#3はデザインシステム全体のダークモード対応時に対応
- 未タスク#4は既存PermissionDialogの使用状況を調査した上で判断
