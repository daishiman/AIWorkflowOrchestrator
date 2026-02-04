# Phase 2: E2Eテスト設計書

## メタ情報

| 項目      | 値                     |
| --------- | ---------------------- |
| Phase     | 2                      |
| 機能名    | search-replace-ui      |
| タスクID  | task-imp-search-ui-001 |
| 関連Issue | #366                   |
| 作成日    | 2026-02-04             |

## 概要

Playwrightを使用した検索・置換機能のE2Eテスト設計。

## テスト環境

| 項目                 | 設定値                              |
| -------------------- | ----------------------------------- |
| テストフレームワーク | Playwright                          |
| テストディレクトリ   | `apps/desktop/e2e/`                 |
| 設定ファイル         | `apps/desktop/playwright.config.ts` |
| ブラウザ             | Chromium                            |
| Base URL             | `http://localhost:5173`             |

## テストファイル構成

```
apps/desktop/e2e/
├── global-setup.ts           # 認証モック初期化（既存）
├── fixtures/
│   └── search-test-files/    # テスト用ファイル
│       ├── sample.ts
│       ├── sample2.ts
│       └── nested/
│           └── sample3.ts
├── pages/
│   ├── SearchPanelPage.ts    # ページオブジェクト
│   └── WorkspaceSearchPage.ts
└── search.spec.ts            # E2Eテスト
```

## ページオブジェクト設計

### SearchPanelPage

```typescript
class SearchPanelPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly replaceInput: Locator;
  readonly searchButton: Locator;
  readonly prevButton: Locator;
  readonly nextButton: Locator;
  readonly closeButton: Locator;
  readonly replaceButton: Locator;
  readonly replaceAllButton: Locator;
  readonly caseSensitiveButton: Locator;
  readonly regexButton: Locator;
  readonly wholeWordButton: Locator;
  readonly statusText: Locator;

  async open(): Promise<void>;
  async openWithReplace(): Promise<void>;
  async close(): Promise<void>;
  async search(query: string): Promise<void>;
  async replace(searchQuery: string, replaceText: string): Promise<void>;
  async replaceAll(searchQuery: string, replaceText: string): Promise<void>;
  async goToNext(): Promise<void>;
  async goToPrevious(): Promise<void>;
  async toggleCaseSensitive(): Promise<void>;
  async toggleRegex(): Promise<void>;
  async toggleWholeWord(): Promise<void>;
  async getResultCount(): Promise<{ current: number; total: number }>;
  async isVisible(): Promise<boolean>;
}
```

### WorkspaceSearchPage

```typescript
class WorkspaceSearchPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly replaceInput: Locator;
  readonly searchButton: Locator;
  readonly includePatternInput: Locator;
  readonly excludePatternInput: Locator;
  readonly resultTree: Locator;
  readonly statusText: Locator;

  async open(): Promise<void>;
  async close(): Promise<void>;
  async search(query: string): Promise<void>;
  async searchWithFilters(
    query: string,
    include?: string,
    exclude?: string,
  ): Promise<void>;
  async getResultFiles(): Promise<string[]>;
  async getTotalMatchCount(): Promise<number>;
  async clickResult(filePath: string, line: number): Promise<void>;
  async expandFile(filePath: string): Promise<void>;
  async collapseFile(filePath: string): Promise<void>;
  async isVisible(): Promise<boolean>;
}
```

## テストシナリオ

### E2E-1: 基本検索フロー

```typescript
test("should perform basic search", async ({ page }) => {
  // 1. エディタでファイルを開く
  // 2. Cmd+Fで検索パネルを開く
  // 3. 検索クエリを入力
  // 4. Enterで検索実行
  // 5. 結果がハイライト表示されることを確認
  // 6. 結果件数が表示されることを確認
});
```

### E2E-2: 検索オプション切り替え

```typescript
test("should toggle search options", async ({ page }) => {
  // 1. 検索パネルを開く
  // 2. 大文字小文字区別をONにする
  // 3. 検索結果が変わることを確認
  // 4. 正規表現をONにする
  // 5. 単語単位をONにする
  // 6. 各オプションの結果を確認
});
```

### E2E-3: 検索結果ナビゲーション

```typescript
test("should navigate between results", async ({ page }) => {
  // 1. 検索を実行（複数結果がある状態）
  // 2. F3で次の結果に移動
  // 3. カレント表示が更新されることを確認
  // 4. Shift+F3で前の結果に移動
  // 5. 端で折り返しが動作することを確認
});
```

### E2E-4: 置換操作

```typescript
test("should replace text", async ({ page }) => {
  // 1. 置換モードで検索パネルを開く
  // 2. 検索クエリと置換テキストを入力
  // 3. 「置換」ボタンで単一置換
  // 4. テキストが置換されることを確認
  // 5. 「全置換」ボタンで全置換
  // 6. すべての箇所が置換されることを確認
});
```

### E2E-5: ワークスペース検索基本フロー

```typescript
test("should perform workspace search", async ({ page }) => {
  // 1. Cmd+Shift+Fでワークスペース検索を開く
  // 2. 検索クエリを入力
  // 3. 検索を実行
  // 4. 結果がファイルごとにグループ化されることを確認
  // 5. 総マッチ数が表示されることを確認
});
```

### E2E-6: ファイルジャンプ

```typescript
test("should jump to file on result click", async ({ page }) => {
  // 1. ワークスペース検索を実行
  // 2. 結果の特定行をクリック
  // 3. 該当ファイルが開くことを確認
  // 4. カーソルが該当行に移動することを確認
});
```

### E2E-7: ショートカットによる開閉

```typescript
test("should open/close panels with keyboard shortcuts", async ({ page }) => {
  // 1. Cmd+Fで検索パネルが開くことを確認
  // 2. Escapeで閉じることを確認
  // 3. Cmd+Tで置換モードで開くことを確認
  // 4. Cmd+Shift+Fでワークスペース検索が開くことを確認
});
```

### E2E-8: アクセシビリティ

```typescript
test("should be accessible", async ({ page }) => {
  // 1. 検索パネルを開く
  // 2. axe-coreでアクセシビリティチェック
  // 3. キーボードのみで全操作可能か確認
  // 4. フォーカス順序が適切か確認
  // 5. スクリーンリーダー向けラベルを確認
});
```

## テストデータ

### フィクスチャファイル

`apps/desktop/e2e/fixtures/search-test-files/sample.ts`:

```typescript
// Test file for search functionality
export function hello() {
  console.log("Hello World");
  return "Hello";
}

export function world() {
  console.log("World");
  return "World";
}

// 大文字小文字テスト用
const HELLO = "HELLO";
const Hello = "Hello";
```

## 実行コマンド

```bash
# E2Eテスト実行
pnpm --filter @repo/desktop test:e2e

# 特定テストのみ実行
pnpm --filter @repo/desktop test:e2e -- search.spec.ts

# UIモードで実行（デバッグ用）
pnpm --filter @repo/desktop test:e2e -- --ui
```

## 注意事項

1. **環境依存**: テストはVite開発サーバー（port 5173）で動作
2. **モック**: IPCはモック化、実際のファイルシステムアクセスは行わない
3. **並列実行**: CI環境では1 workerで実行（安定性重視）
4. **リトライ**: CI環境では2回までリトライ
