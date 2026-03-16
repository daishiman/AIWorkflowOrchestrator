# TASK-FIX-ELECTRON-APP-MENU-ZOOM-001

## Electron App Menu Zoom Control Fix

Electronデスクトップアプリでアプリケーションメニューが未定義のため、Cmd+- (ズームアウト) および Cmd+0 (ズームリセット) のキーボードショートカットが動作しない問題を修正する。

## メタ情報

| 項目         | 値                                  |
| ------------ | ----------------------------------- |
| タスクID     | TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 |
| 機能名       | electron-app-menu-zoom              |
| タスクタイプ | fix                                 |
| 優先度       | P2                                  |
| 作成日       | 2026-03-16                          |
| 対象ファイル | `apps/desktop/src/main/index.ts`    |

## 問題の概要

- Cmd+= (ズームイン) は Chromium のデフォルト動作で機能する
- Cmd+- (ズームアウト) が動作しない
- Cmd+0 (ズームリセット) が動作しない
- `Menu.setApplicationMenu()` によるアプリケーションメニューが未定義

## 根本原因

`apps/desktop/src/main/index.ts` の `createWindow()` 関数で `autoHideMenuBar: true` が設定されているが、`Menu.buildFromTemplate()` によるカスタムメニューが一切定義されていない。macOS ではメニューバーにズーム制御の role (`zoomIn`, `zoomOut`, `resetZoom`) を含むメニューテンプレートを明示的に設定する必要がある。

## Phase 一覧

| Phase | 名称             | 仕様書                      | 状態    |
| ----- | ---------------- | --------------------------- | ------- |
| 1     | 要件定義         | `phase-1-requirements.md`   | pending |
| 2     | 設計             | `phase-2-design.md`         | pending |
| 3     | 設計レビュー     | `phase-3-design-review.md`  | pending |
| 4     | テスト作成       | `phase-4-test-creation.md`  | pending |
| 5     | 実装             | `phase-5-implementation.md` | pending |
| 6     | テスト拡充       | `phase-6-test-expansion.md` | pending |
| 7     | カバレッジ確認   | `phase-7-coverage.md`       | pending |
| 8     | リファクタリング | `phase-8-refactoring.md`    | pending |
| 9     | 品質検証         | `phase-9-quality.md`        | pending |
| 10    | 最終レビュー     | `phase-10-final-review.md`  | pending |
| 11    | 手動テスト       | `phase-11-manual-test.md`   | pending |
| 12    | ドキュメント     | `phase-12-documentation.md` | pending |
| 13    | PR作成           | `phase-13-pr-creation.md`   | pending |

## 受入基準

1. Cmd+= でズームインが動作する
2. Cmd+- でズームアウトが動作する
3. Cmd+0 でズームリセットが動作する
4. macOS / Windows / Linux の全プラットフォームでメニューが正しく表示される
5. 既存のセキュリティ設定（CSP、contextIsolation、sandbox）に影響しない
6. 編集メニュー（Undo/Redo/Cut/Copy/Paste/SelectAll）が正しく動作する
