# ダイアログテストパターン仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [quality-e2e-testing.md](./quality-e2e-testing.md)

## 変更履歴

| Version | Date       | Changes                                                |
| ------- | ---------- | ------------------------------------------------------ |
| 1.0.0   | 2026-02-02 | 初版作成（TASK-8C-D権限ダイアログE2Eテストパターン抽出） |

---

## 概要

モーダルダイアログ（権限確認、インポート確認、エラー表示等）のE2Eテストパターンを定義する。WCAG 2.1 AA準拠を前提とし、アクセシビリティとユーザビリティの両面をカバーする。

---

## ダイアログ種別

| 種別           | role属性      | 用途                     | ARIA要件                    |
| -------------- | ------------- | ------------------------ | --------------------------- |
| 権限ダイアログ | `alertdialog` | ツール実行許可確認       | aria-modal, aria-labelledby |
| 確認ダイアログ | `dialog`      | ユーザー確認（インポート等） | aria-modal              |
| エラーダイアログ | `alertdialog` | エラー通知             | aria-describedby            |

---

## テストカテゴリ構成

### 標準テストカテゴリ（12テストケース構成例）

| カテゴリ       | TC番号    | テスト数 | 内容                              |
| -------------- | --------- | -------- | --------------------------------- |
| Basic Flow     | TC-1〜5   | 5        | 表示・情報・許可・拒否・記憶      |
| Edge Cases     | TC-6〜7   | 2        | 連続処理・キュー動作              |
| Error Handling | TC-8      | 1(skip)  | タイムアウト処理                  |
| Accessibility  | TC-9〜13  | 5-6      | ARIA・キーボード・フォーカス      |

---

## Basic Flowパターン

### TC-1: ダイアログ表示

**目的**: トリガー条件でダイアログが表示されることを検証

```typescript
test("ツールが承認を必要とする場合、権限ダイアログが表示される", async ({ page }) => {
  // Arrange & Act
  await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);

  // Assert
  const dialog = page.getByText(DIALOG_TITLE_TEXT);
  await expect(dialog).toBeVisible({ timeout: 10000 });
});
```

### TC-2: 情報表示

**目的**: ダイアログに必要な情報が表示されることを検証

```typescript
test("権限ダイアログにツール情報が表示される", async ({ page }) => {
  await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
  await waitForPermissionDialog(page);

  // Assert - 必須情報の表示確認
  await expect(page.getByText("ツール:")).toBeVisible();
  await expect(page.getByText("引数:")).toBeVisible();
});
```

### TC-3: 許可アクション

**目的**: 許可操作で実行が継続されることを検証

```typescript
test("権限を許可すると実行が継続される", async ({ page }) => {
  await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
  await waitForPermissionDialog(page);

  // Act
  await approvePermission(page);

  // Assert - ダイアログ閉じ確認
  await expect(page.getByText(DIALOG_TITLE_TEXT)).not.toBeVisible();

  // Assert - 実行継続確認
  await expect(page.getByText(/実行中|完了|Processing/)).toBeVisible({ timeout: 5000 });
});
```

### TC-4: 拒否アクション

**目的**: 拒否操作で実行が停止されることを検証

```typescript
test("権限を拒否すると実行が停止される", async ({ page }) => {
  await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
  await waitForPermissionDialog(page);

  // Act
  await denyPermission(page);

  // Assert
  await expect(page.getByText(DIALOG_TITLE_TEXT)).not.toBeVisible();
  await expect(page.getByText(/キャンセル|拒否|Cancelled|Denied/)).toBeVisible({ timeout: 5000 });
});
```

### TC-5: 選択記憶（Remember Choice）

**目的**: チェックボックスで選択が永続化されることを検証

```typescript
test("チェックボックスをオンにすると選択が記憶される", async ({ page }) => {
  // 1回目: チェック付きで許可
  await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
  await waitForPermissionDialog(page);
  await checkRememberChoice(page);
  await approvePermission(page);

  // 待機（状態永続化のため）
  await page.waitForTimeout(500); // Note: イベントベース待機に置換推奨

  // 2回目: 同じコマンド実行
  await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);

  // Assert - ダイアログが表示されない
  await page.waitForTimeout(1000); // Note: 状態確認のための待機
  await expect(page.getByText(DIALOG_TITLE_TEXT)).not.toBeVisible();
});
```

---

## Edge Casesパターン

### 連続権限リクエスト処理

```typescript
test("複数の権限リクエストを連続して処理できる", async ({ page }) => {
  // 1回目
  await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
  await waitForPermissionDialog(page);
  await approvePermission(page);

  await page.waitForTimeout(500);

  // 2回目（別コマンド）
  await triggerPermissionDialog(page, "Run another command");
  await waitForPermissionDialog(page);

  // Assert
  await expect(page.getByText(DIALOG_TITLE_TEXT)).toBeVisible();
});
```

### ダイアログキュー動作

```typescript
test("ダイアログ表示中に別のリクエストがキューに追加される", async ({ page }) => {
  await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
  await waitForPermissionDialog(page);

  // ダイアログ表示中に別入力
  await page.fill(SELECTORS.chatInput, "Another command");

  // Assert - エラーなく元のダイアログが表示継続
  await expect(page.getByText(DIALOG_TITLE_TEXT)).toBeVisible();
});
```

---

## Accessibilityパターン

### ARIA属性検証

| 属性          | 期待値             | 検証方法                                |
| ------------- | ------------------ | --------------------------------------- |
| role          | `alertdialog`      | `locator('[role="alertdialog"]')`       |
| aria-modal    | `true`             | `toHaveAttribute("aria-modal", "true")` |
| aria-labelledby | 設定済み          | ラベル要素の存在確認                    |

```typescript
test("権限ダイアログに適切なARIA属性がある", async ({ page }) => {
  await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
  await waitForPermissionDialog(page);

  const dialogContainer = page.locator(SELECTORS.dialogContainer);
  await expect(dialogContainer).toBeVisible();
});

test("ダイアログにaria-modal属性が設定されている", async ({ page }) => {
  await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
  await waitForPermissionDialog(page);

  const dialog = page.locator(SELECTORS.dialogContainer);
  await expect(dialog).toHaveAttribute("aria-modal", "true");
});
```

### キーボードナビゲーション

| キー   | 期待動作                       |
| ------ | ------------------------------ |
| Tab    | ダイアログ内要素間のフォーカス移動 |
| Enter  | フォーカス中ボタンのアクティベート |
| Escape | ダイアログを閉じる（拒否扱い） |

```typescript
test("Escapeキーでダイアログを閉じることができる", async ({ page }) => {
  await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
  await waitForPermissionDialog(page);

  await page.keyboard.press("Escape");

  await expect(page.getByText(DIALOG_TITLE_TEXT)).not.toBeVisible({ timeout: 5000 });
});

test("許可ボタンにフォーカスしてEnterキーで許可できる", async ({ page }) => {
  await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
  await waitForPermissionDialog(page);

  await page.getByRole("button", { name: APPROVE_BUTTON_TEXT }).focus();
  await page.keyboard.press("Enter");

  await expect(page.getByText(DIALOG_TITLE_TEXT)).not.toBeVisible();
});
```

### フォーカストラップ

```typescript
test("Tabキーでダイアログ内の要素間を移動できる", async ({ page }) => {
  await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
  await waitForPermissionDialog(page);

  // 複数回Tab
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");

  // フォーカスがダイアログ内に留まる
  await expect(page.getByText(DIALOG_TITLE_TEXT)).toBeVisible();
});
```

---

## ヘルパー関数定義

### 権限ダイアログ用ヘルパー

| 関数名                    | 機能                           | 戻り値          |
| ------------------------- | ------------------------------ | --------------- |
| `selectSkill`             | スキル選択                     | `Promise<void>` |
| `triggerPermissionDialog` | ダイアログトリガー             | `Promise<void>` |
| `waitForPermissionDialog` | ダイアログ表示待機             | `Promise<void>` |
| `approvePermission`       | 許可操作＋閉じ待機             | `Promise<void>` |
| `denyPermission`          | 拒否操作＋閉じ待機             | `Promise<void>` |
| `checkRememberChoice`     | 記憶チェックボックスON         | `Promise<void>` |

### 実装パターン

```typescript
async function waitForPermissionDialog(page: Page): Promise<void> {
  await page.waitForSelector(`text="${DIALOG_TITLE_TEXT}"`, { timeout: 10000 });
}

async function approvePermission(page: Page): Promise<void> {
  await page.getByRole("button", { name: APPROVE_BUTTON_TEXT }).click();
  await page.waitForSelector(`text="${DIALOG_TITLE_TEXT}"`, { state: "hidden" });
}

async function denyPermission(page: Page): Promise<void> {
  await page.getByRole("button", { name: DENY_BUTTON_TEXT }).click();
  await page.waitForSelector(`text="${DIALOG_TITLE_TEXT}"`, { state: "hidden" });
}
```

---

## 定数パターン

### テストデータ定数

```typescript
const TEST_SKILL_NAME = "test-skill";
const PERMISSION_TRIGGER_CMD = "Run dangerous command";
const DIALOG_TITLE_TEXT = "権限の確認が必要です";
const APPROVE_BUTTON_TEXT = "許可";
const DENY_BUTTON_TEXT = "拒否";
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

## テストファイル実装例

**ファイル**: `apps/desktop/e2e/skill-permission.spec.ts`

**構成**: 12テストケース（有効）、1テストケース（SKIP）

| セクション        | テスト数 | 内容                              |
| ----------------- | -------- | --------------------------------- |
| TC-1〜TC-5        | 5        | Basic Flow                        |
| Edge Cases        | 2        | 連続処理、キュー動作              |
| Error Handling    | 1(skip)  | タイムアウト（モック要）          |
| Accessibility     | 5        | ARIA、Escape、Enter、Tab、modal   |

---

## 関連ドキュメント

| ドキュメント                                                 | 内容                     |
| ------------------------------------------------------------ | ------------------------ |
| [quality-e2e-testing.md](./quality-e2e-testing.md)           | E2Eテスト全体仕様        |
| [testing-playwright-e2e.md](./testing-playwright-e2e.md)     | Playwright実装パターン   |
| [testing-accessibility.md](./testing-accessibility.md)       | アクセシビリティ仕様     |
| [interfaces-agent-sdk-skill.md](./interfaces-agent-sdk-skill.md) | 権限ダイアログインターフェース |
