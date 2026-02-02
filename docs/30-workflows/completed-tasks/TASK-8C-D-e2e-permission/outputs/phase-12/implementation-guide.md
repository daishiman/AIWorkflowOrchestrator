# 実装ガイド - E2Eテスト: 権限ダイアログフロー

## 作成日: 2026-02-02

## タスクID: TASK-8C-D-e2e-permission

---

# Part 1: 初学者・中学生レベル向け

## なぜ権限ダイアログのE2Eテストが必要なのか

### 日常の例え話

「お店でお金を使うとき、店員さんに『本当に買いますか？』と確認されることがありますよね。これは間違いを防ぐためです。パソコンのアプリも同じで、重要な操作をする前に『本当に実行していいですか？』と確認するのが権限ダイアログです。E2Eテストは、この確認画面が正しく動くかを自動でチェックするテストです。」

### 何をテストするのか

1. **確認画面（ダイアログ）がちゃんと表示されるか**
   - 危険な操作をしようとしたとき、確認画面が出てくること
   - 何をしようとしているか（ツール名・引数）が表示されること

2. **「OK」や「キャンセル」ボタンが正しく動くか**
   - 「許可」を押すと操作が実行されること
   - 「拒否」を押すと操作がキャンセルされること

3. **次回から確認を省略する機能が動くか**
   - 「この選択を記憶する」にチェックを入れると、次回から確認画面が出ないこと

### なぜ自動テストが大切なのか

- **間違いを早く見つけられる**: 人間が毎回手動で確認するのは大変で、見落としもある
- **変更しても安心**: 他の部分を修正したときに、この機能が壊れていないか確認できる
- **時間の節約**: 一度テストを書けば、何度でも自動で確認してくれる

---

# Part 2: 開発者・技術者向け

## テストアーキテクチャ

### 技術スタック

| レイヤー             | 技術             | 説明                       |
| -------------------- | ---------------- | -------------------------- |
| テストランナー       | Playwright       | ブラウザテスト実行         |
| テストフレームワーク | @playwright/test | アサーション・テスト構造   |
| アプリケーション     | Vite + React     | Renderer Process           |
| フィクスチャ         | E2Eフィクスチャ  | `__fixtures__/skills/`配下 |

### テストファイル構成

```
apps/desktop/
├── e2e/
│   └── skill-permission.spec.ts    # E2Eテストファイル
├── playwright.config.ts            # Playwright設定
└── __fixtures__/
    └── skills/
        └── test-skill/             # テスト用スキルフィクスチャ
```

---

## 主要テストケース

### Basic Flow (TC-1〜TC-5)

| TC   | 名称           | セレクター例                     | 説明               |
| ---- | -------------- | -------------------------------- | ------------------ |
| TC-1 | ダイアログ表示 | `text="権限の確認が必要です"`    | ダイアログ表示確認 |
| TC-2 | 情報表示       | `text="ツール:"`, `text="引数:"` | ツール情報表示確認 |
| TC-3 | 許可操作       | `button:has-text("許可")`        | 許可ボタン動作確認 |
| TC-4 | 拒否操作       | `button:has-text("拒否")`        | 拒否ボタン動作確認 |
| TC-5 | 選択記憶       | `[type="checkbox"]`              | 選択記憶機能確認   |

### Edge Cases

| No  | 名称             | 説明                         |
| --- | ---------------- | ---------------------------- |
| 1   | 連続権限処理     | 複数権限リクエストの連続処理 |
| 2   | ダイアログキュー | 表示中の再リクエスト処理     |

### Accessibility

| No  | 名称              | 検証内容                       |
| --- | ----------------- | ------------------------------ |
| 1   | ARIA属性          | `role="alertdialog"` 確認      |
| 2   | Escapeキー        | キーボード操作でダイアログ閉じ |
| 3   | Enterキー操作     | フォーカスボタン実行           |
| 4   | Tabナビゲーション | フォーカストラップ確認         |
| 5   | aria-modal属性    | モーダル属性確認               |

---

## 実行方法

### 基本コマンド

```bash
# E2Eテスト実行（全体）
pnpm --filter @repo/desktop test:e2e

# 権限ダイアログテストのみ実行
pnpm --filter @repo/desktop test:e2e -- skill-permission

# ヘッドフルモード（デバッグ用）
pnpm --filter @repo/desktop test:e2e:headed -- skill-permission

# Playwright UIモード
pnpm --filter @repo/desktop test:e2e:ui -- skill-permission

# デバッグモード
PWDEBUG=1 pnpm --filter @repo/desktop test:e2e -- skill-permission
```

### トラブルシューティング

| 問題                             | 解決方法                          |
| -------------------------------- | --------------------------------- |
| Playwrightブラウザ未インストール | `npx playwright install chromium` |
| Viteサーバー起動失敗             | ポート5173を確認                  |
| タイムアウトエラー               | タイムアウト値を増加              |
| セレクターが見つからない         | SELECTORS定数を更新               |

---

## ヘルパー関数

### 定義済みヘルパー

```typescript
// スキル選択
async function selectSkill(page: Page, skillName: string): Promise<void>;

// 権限ダイアログトリガー
async function triggerPermissionDialog(
  page: Page,
  command: string,
): Promise<void>;

// ダイアログ表示待機
async function waitForPermissionDialog(page: Page): Promise<void>;

// 権限許可
async function approvePermission(page: Page): Promise<void>;

// 権限拒否
async function denyPermission(page: Page): Promise<void>;

// 選択記憶チェック
async function checkRememberChoice(page: Page): Promise<void>;
```

### セレクター定数

```typescript
const SELECTORS = {
  chatInput: '[data-testid="chat-input"]',
  skillSelector: '[aria-label="スキルを選択"]',
  dialogContainer: '[role="alertdialog"]',
} as const;
```

---

## ベストプラクティス

### 1. 待機戦略

```typescript
// Good: 明示的なセレクター待機
await page.waitForSelector(`text="${DIALOG_TITLE_TEXT}"`, { timeout: 10000 });

// Avoid: 固定時間待機（フレーキーの原因）
await page.waitForTimeout(1000); // 必要最小限に
```

### 2. テスト独立性

```typescript
test.beforeEach(async ({ page }) => {
  // 各テスト前に状態をリセット
  await page.goto("/");
  await page.waitForLoadState("networkidle");
});
```

### 3. アサーション

```typescript
// 明確なアサーション
await expect(page.getByText(DIALOG_TITLE_TEXT)).toBeVisible({ timeout: 10000 });
await expect(page.getByText(DIALOG_TITLE_TEXT)).not.toBeVisible();
```

---

## 関連ドキュメント

| ドキュメント         | パス                                                |
| -------------------- | --------------------------------------------------- |
| E2Eテスト仕様        | `aiworkflow-requirements: quality-e2e-testing.md`   |
| アクセシビリティ仕様 | `aiworkflow-requirements: testing-accessibility.md` |
| UIコンポーネント仕様 | `aiworkflow-requirements: ui-ux-components.md`      |
