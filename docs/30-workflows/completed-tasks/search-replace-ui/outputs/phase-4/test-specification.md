# Phase 4: テスト仕様書

## メタ情報

| 項目      | 値                     |
| --------- | ---------------------- |
| Phase     | 4                      |
| 機能名    | search-replace-ui      |
| タスクID  | task-imp-search-ui-001 |
| 関連Issue | #366                   |
| 作成日    | 2026-02-04             |

## テスト概要

### テスト種別

| 種別           | フレームワーク | 状態 | ファイル数 |
| -------------- | -------------- | ---- | ---------- |
| ユニットテスト | Vitest         | 既存 | 5ファイル  |
| 統合テスト     | Vitest + RTL   | 既存 | 8ファイル  |
| E2Eテスト      | Playwright     | 新規 | 1ファイル  |

### テストファイル構成

```
apps/desktop/
├── src/features/search/__tests__/
│   ├── SearchPanel.test.tsx               # ユニットテスト（既存）
│   ├── WorkspaceSearchPanel.test.tsx      # ユニットテスト（既存）
│   ├── useSearchStore.test.ts             # ユニットテスト（既存）
│   ├── useSearchKeyboardShortcuts.test.ts # ユニットテスト（既存）
│   ├── TextAreaEditorAdapter.test.ts      # ユニットテスト（既存）
│   └── integration/
│       ├── Accessibility.test.tsx         # 統合テスト（既存）
│       ├── EdgeCases.test.tsx             # 統合テスト（既存）
│       ├── EditorViewIntegration.test.tsx # 統合テスト（既存）
│       ├── ErrorHandling.test.tsx         # 統合テスト（既存）
│       ├── KeyboardShortcuts.test.tsx     # 統合テスト（既存）
│       ├── Performance.test.tsx           # 統合テスト（既存）
│       ├── SearchPanelAdapter.test.tsx    # 統合テスト（既存）
│       └── WorkspaceSearchIntegration.test.tsx # 統合テスト（既存）
└── e2e/
    ├── pages/
    │   ├── SearchPanelPage.ts             # ページオブジェクト（新規）
    │   └── WorkspaceSearchPage.ts         # ページオブジェクト（新規）
    └── search.spec.ts                     # E2Eテスト（新規）
```

## E2Eテスト仕様

### ページオブジェクト

#### SearchPanelPage

| メソッド                | 説明                           |
| ----------------------- | ------------------------------ |
| `open()`                | Cmd+F/Ctrl+Fでパネルを開く     |
| `openWithReplace()`     | Cmd+T/Ctrl+Tで置換モードで開く |
| `close()`               | Escapeでパネルを閉じる         |
| `search(query)`         | 検索を実行                     |
| `replace(search, rep)`  | 単一置換                       |
| `replaceAll(...)`       | 全置換                         |
| `goToNext()`            | 次の結果へ移動                 |
| `goToPrevious()`        | 前の結果へ移動                 |
| `toggleCaseSensitive()` | 大文字小文字区別切り替え       |
| `toggleRegex()`         | 正規表現モード切り替え         |
| `toggleWholeWord()`     | 単語単位検索切り替え           |
| `getResultCount()`      | 結果件数を取得                 |

#### WorkspaceSearchPage

| メソッド                 | 説明                           |
| ------------------------ | ------------------------------ |
| `open()`                 | Cmd+Shift+F/Ctrl+Shift+Fで開く |
| `close()`                | パネルを閉じる                 |
| `search(query)`          | 検索を実行                     |
| `searchWithFilters(...)` | フィルター付き検索             |
| `getResultFiles()`       | 結果ファイル一覧を取得         |
| `getTotalMatchCount()`   | 総マッチ数を取得               |
| `clickResult(...)`       | 結果をクリック                 |
| `expandFile(path)`       | ファイルを展開                 |
| `collapseFile(path)`     | ファイルを折りたたむ           |

### テストシナリオ

| テストID | カテゴリ           | テスト名                                |
| -------- | ------------------ | --------------------------------------- |
| E2E-1    | パネル開閉         | should open search panel with Cmd+F     |
| E2E-2    | ファイル内検索     | should search text in file              |
| E2E-3    | ハイライト         | should highlight search results         |
| E2E-4    | ナビゲーション     | should navigate between results with F3 |
| E2E-5    | オプション         | should toggle search options            |
| E2E-6    | 置換               | should replace text                     |
| E2E-7    | 全置換             | should replace all text                 |
| E2E-8    | ワークスペース検索 | should open workspace search            |
| E2E-9    | ファイル横断検索   | should search across files              |
| E2E-10   | ファイルジャンプ   | should jump to file on result click     |
| E2E-11   | パネル閉じる       | should close panel with Escape          |
| E2E-12   | アクセシビリティ   | should be accessible                    |

## テスト実行

### コマンド

```bash
# ユニット/統合テスト
pnpm --filter @repo/desktop test:run

# E2Eテスト
pnpm --filter @repo/desktop test:e2e

# 検索関連テストのみ
pnpm vitest run src/features/search/__tests__/
```

## カバレッジ目標

| カテゴリ    | 目標     |
| ----------- | -------- |
| Line        | 80%以上  |
| Branch      | 60%以上  |
| Function    | 80%以上  |
| E2Eシナリオ | 12ケース |

## TDD状態

| 状態 | 説明                                  |
| ---- | ------------------------------------- |
| Red  | E2Eテストは失敗状態（未実装機能依存） |

E2Eテストは、実際のアプリケーション環境で動作するため、E2E環境のセットアップが完了するまでは失敗状態となります。
