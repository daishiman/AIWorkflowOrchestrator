# E2Eテストガイド

## 概要

Playwrightを使用したEnd-to-Endテストの実行方法と追加方法を説明します。

---

## 実行方法

### 基本コマンド

```bash
# 全E2Eテスト実行
pnpm --filter @repo/desktop test:e2e

# UIモード（推奨）
pnpm --filter @repo/desktop test:e2e:ui

# ブラウザ表示あり
pnpm --filter @repo/desktop test:e2e:headed
```

### 特定テストの実行

```bash
# 特定ファイル
pnpm --filter @repo/desktop test:e2e auth.spec.ts

# 特定テストケース
pnpm --filter @repo/desktop test:e2e -g "ログインできる"
```

---

## テストファイル一覧

| ファイル                        | シナリオ                   |
| ------------------------------- | -------------------------- |
| auth.spec.ts                    | 認証フロー                 |
| chat-history-export.spec.ts     | チャット履歴エクスポート   |
| chat-history-navigation.spec.ts | チャット履歴ナビゲーション |
| file-selection.spec.ts          | ファイル選択               |
| system-prompt.spec.ts           | システムプロンプト         |
| workspace.spec.ts               | ワークスペース操作         |

---

## 新規テスト追加方法

### 1. テストファイル作成

`apps/desktop/e2e/` に `*.spec.ts` ファイルを作成:

```typescript
import { test, expect } from "@playwright/test";

test.describe("機能名", () => {
  test("テストケース名", async ({ page }) => {
    await page.goto("/");
    // テストコード
  });
});
```

### 2. ベストプラクティス

#### 明示的な待機

```typescript
// 良い例: toBeVisibleを使用
await expect(page.getByRole("button")).toBeVisible();

// 避ける: waitForSelector
await page.waitForSelector("button");
```

#### テストIDの活用

```typescript
// 良い例: data-testid
await page.getByTestId("submit-button").click();

// 避ける: CSSセレクタ
await page.click(".btn-primary");
```

#### テストの独立性

```typescript
test.beforeEach(async ({ page }) => {
  // 各テストの前にリセット
  await page.goto("/");
});
```

---

## Flaky Test対策

### ネットワーク待機

```typescript
await page.waitForResponse(
  (response) => response.url().includes("/api/") && response.status() === 200,
);
```

### アニメーション待機

```typescript
await page.waitForTimeout(300); // アニメーション完了を待つ
```

### リトライ設定

`playwright.config.ts`:

```typescript
export default {
  retries: 2,
  timeout: 30000,
};
```

---

## CI/CD統合

GitHub Actionsで自動実行されます。失敗時はアーティファクトにスクリーンショットが保存されます。
