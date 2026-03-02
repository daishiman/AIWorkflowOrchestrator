# Phase 11 スクリーンショット証跡

## 取得メタ情報

| 項目     | 内容                                                                       |
| -------- | -------------------------------------------------------------------------- |
| タスクID | TASK-10A-A                                                                 |
| 取得日   | 2026-03-02                                                                 |
| 取得方法 | `node apps/desktop/scripts/capture-skill-management-panel-screenshots.mjs` |
| 実行環境 | Vite E2E サーバー（`vite.e2e.config.ts`）+ Playwright                      |
| テーマ   | dark                                                                       |

## 証跡一覧

| ファイル名                   | 対応TC | 内容                                         |
| ---------------------------- | ------ | -------------------------------------------- |
| `tc-01-skill-list.png`       | TC-01  | 初期リスト表示（ヘッダー、検索、カード一覧） |
| `tc-02-search-no-result.png` | TC-02  | 検索結果0件表示                              |
| `tc-03-editor-view.png`      | TC-03  | 編集ビュー遷移後の表示                       |
| `tc-04-analysis-view.png`    | TC-04  | 分析ビュー遷移後の表示                       |
| `tc-05-delete-dialog.png`    | TC-05  | 削除確認ダイアログ表示                       |
| `tc-06-create-view.png`      | TC-06  | 新規作成ビュー遷移後の表示                   |
| `tc-07-loading.png`          | TC-07  | ローディング表示（遅延モック）               |
| `tc-08-empty-state.png`      | TC-08  | 空状態表示（全削除後）                       |
| `tc-09-keyboard-focus.png`   | TC-09  | Tab移動後のキーボードフォーカス状態          |
| `tc-10-dark-mode.png`        | TC-10  | ダークモード表示                             |

## 再取得コマンド

```bash
pnpm --filter @repo/shared build
node apps/desktop/scripts/capture-skill-management-panel-screenshots.mjs
```
