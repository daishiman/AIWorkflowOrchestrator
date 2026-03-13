# 検索・置換パネルUI設計 / history bundle

> 親仕様書: [ui-ux-search-panel.md](ui-ux-search-panel.md)
> 役割: history bundle

## 関連ドキュメント

- [パネル・セレクターUI/UXガイドライン](./ui-ux-panels.md)
- [Search Service API](./api-internal-search.md)
- [アクセシビリティガイドライン](./accessibility.md)
- [実装ガイド](../../../docs/30-workflows/search-panel-integration/outputs/phase-12/implementation-guide.md)

---

## 完了タスク

- [x] Phase 5 検索パネル実装の EditorView 統合（TASK-SEARCH-INTEGRATE-001） - 2026-01-22
- [x] 検索・置換機能UI実装（task-imp-search-ui-001） - 2026-02-04
- [x] Workspace preview quick file search 実装（TASK-UI-04C-WORKSPACE-PREVIEW） - 2026-03-11

### task-imp-search-ui-001（2026-02-04完了）

| 項目         | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| タスクID     | task-imp-search-ui-001                                    |
| 完了日       | 2026-02-04                                                |
| ステータス   | **完了**                                                  |
| テスト数     | E2E 17件 + ユニット 100+件 + 統合 80+件                   |
| カバレッジ   | Line 80%+, Branch 60%+                                    |
| ドキュメント | `docs/30-workflows/search-replace-ui/`                    |

#### テスト結果サマリー

| カテゴリ           | テスト数 | PASS | FAIL |
| ------------------ | -------- | ---- | ---- |
| E2Eテスト          | 17       | -    | -    |
| ユニットテスト     | 100+     | ✅   | 0    |
| 統合テスト         | 80+      | ✅   | 0    |
| アクセシビリティ   | 含む     | ✅   | 0    |

#### 成果物

| 成果物              | パス                                                                           |
| ------------------- | ------------------------------------------------------------------------------ |
| E2Eテスト           | `apps/desktop/e2e/search.spec.ts`                                              |
| SearchPanelPage     | `apps/desktop/e2e/pages/SearchPanelPage.ts`                                    |
| WorkspaceSearchPage | `apps/desktop/e2e/pages/WorkspaceSearchPage.ts`                                |
| 実装ガイド          | `docs/30-workflows/search-replace-ui/outputs/phase-12/implementation-guide.md` |

---

## 変更履歴

| 日付       | バージョン | 変更内容                                                                 |
| ---------- | ---------- | ------------------------------------------------------------------------ |
| 2026-03-11 | v1.3.1     | TASK-UI-04C follow-up: `Workspace QuickFileSearch dialog` に関連未タスク `UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001` を追加し、`score=0` 除外と stable sort の共通化導線を接続 |
| 2026-03-11 | v1.3.0     | TASK-UI-04C-WORKSPACE-PREVIEW: `Workspace QuickFileSearch dialog` セクションを追加し、`Cmd/Ctrl+P`、top 10 results、focus trap、`score=0` 除外、preview 自動オープンを記録 |
| 2026-02-04 | v1.2.0     | 未タスク2件追加: task-search-scope-folder-001（検索スコープ指定）、task-search-multifile-replace-001（一括置換） |
| 2026-02-04 | v1.1.0     | task-imp-search-ui-001完了記録追加（E2Eテスト17件、グローバルショートカット統合、IPCプロバイダ） |
| 2026-01-26 | v1.0.0     | 仕様ガイドライン準拠: コード例を表形式・文章に変換                       |

