# Phase 2: テストユーティリティ設計書

## 実行日時

2026-02-02

---

## 1. テストデータ定数

### 1.1 定数定義

```typescript
// ===== テストデータ定数 =====

/** テストスキル名 */
const TEST_SKILL_NAME = "test-skill";

/** 権限ダイアログをトリガーするコマンド */
const PERMISSION_TRIGGER_CMD = "Run dangerous command";

/** ダイアログタイトルテキスト */
const DIALOG_TITLE_TEXT = "権限の確認が必要です";

/** 許可ボタンテキスト */
const APPROVE_BUTTON_TEXT = "許可";

/** 拒否ボタンテキスト */
const DENY_BUTTON_TEXT = "拒否";

/** デフォルトタイムアウト（ミリ秒） */
const DEFAULT_TIMEOUT = 10000;

/** 短いタイムアウト（ミリ秒） */
const SHORT_TIMEOUT = 5000;
```

### 1.2 セレクター定数

```typescript
// ===== セレクター定数 =====

const SELECTORS = {
  /** チャット入力欄 */
  chatInput: '[data-testid="chat-input"]',

  /** スキルセレクター */
  skillSelector: '[aria-label="スキルを選択"]',

  /** スキルオプション（動的） */
  skillOption: (name: string) => `[role="option"]:has-text("${name}")`,

  /** ダイアログタイトル */
  dialogTitle: `text="${DIALOG_TITLE_TEXT}"`,

  /** 許可ボタン */
  approveButton: `button:has-text("${APPROVE_BUTTON_TEXT}")`,

  /** 拒否ボタン */
  denyButton: `button:has-text("${DENY_BUTTON_TEXT}")`,

  /** チェックボックス */
  rememberCheckbox: '[type="checkbox"]',

  /** ツールラベル */
  toolLabel: 'text="ツール:"',

  /** 引数ラベル */
  argsLabel: 'text="引数:"',

  /** ダイアログコンテナ（ARIA） */
  dialogContainer: '[role="alertdialog"]',
} as const;
```

---

## 2. ヘルパー関数

### 2.1 スキル操作ヘルパー

```typescript
/**
 * スキルをインポートして選択する
 * @param page - Playwrightのページオブジェクト
 * @param skillName - インポート・選択するスキル名
 */
async function importAndSelectSkill(
  page: Page,
  skillName: string,
): Promise<void> {
  // IPCでスキルをインポート
  await page.evaluate(async (name) => {
    await window.electronAPI?.skill?.import?.(name);
  }, skillName);

  // UIでスキルを選択
  await page.click(SELECTORS.skillSelector);
  await page.click(SELECTORS.skillOption(skillName));

  // 選択が完了するまで待機
  await page.waitForTimeout(300);
}

/**
 * スキル選択を解除する
 * @param page - Playwrightのページオブジェクト
 */
async function clearSkillSelection(page: Page): Promise<void> {
  await page.evaluate(() => {
    // Zustand storeの直接操作（テスト用）
    const store = (window as any).__ZUSTAND_STORE__;
    if (store?.getState()?.selectSkillByName) {
      store.getState().selectSkillByName(null);
    }
  });
}
```

### 2.2 権限ダイアログヘルパー

```typescript
/**
 * 権限ダイアログをトリガーする
 * @param page - Playwrightのページオブジェクト
 * @param command - 実行するコマンド
 */
async function triggerPermissionDialog(
  page: Page,
  command: string,
): Promise<void> {
  await page.fill(SELECTORS.chatInput, command);
  await page.press(SELECTORS.chatInput, "Enter");
}

/**
 * 権限ダイアログの表示を待機する
 * @param page - Playwrightのページオブジェクト
 * @param timeout - タイムアウト（ミリ秒）
 */
async function waitForPermissionDialog(
  page: Page,
  timeout = DEFAULT_TIMEOUT,
): Promise<void> {
  await page.waitForSelector(SELECTORS.dialogTitle, { timeout });
}

/**
 * 権限ダイアログが非表示になるのを待機する
 * @param page - Playwrightのページオブジェクト
 */
async function waitForPermissionDialogHidden(page: Page): Promise<void> {
  await page.waitForSelector(SELECTORS.dialogTitle, { state: "hidden" });
}

/**
 * 権限を許可する
 * @param page - Playwrightのページオブジェクト
 */
async function approvePermission(page: Page): Promise<void> {
  await page.click(SELECTORS.approveButton);
  await waitForPermissionDialogHidden(page);
}

/**
 * 権限を拒否する
 * @param page - Playwrightのページオブジェクト
 */
async function denyPermission(page: Page): Promise<void> {
  await page.click(SELECTORS.denyButton);
  await waitForPermissionDialogHidden(page);
}

/**
 * 選択記憶チェックボックスをオンにする
 * @param page - Playwrightのページオブジェクト
 */
async function checkRememberChoice(page: Page): Promise<void> {
  await page.click(SELECTORS.rememberCheckbox);
}
```

### 2.3 アサーションヘルパー

```typescript
/**
 * 権限ダイアログが表示されていることを検証する
 * @param page - Playwrightのページオブジェクト
 */
async function expectPermissionDialogVisible(page: Page): Promise<void> {
  await expect(page.locator(SELECTORS.dialogTitle)).toBeVisible();
}

/**
 * 権限ダイアログが非表示であることを検証する
 * @param page - Playwrightのページオブジェクト
 */
async function expectPermissionDialogHidden(page: Page): Promise<void> {
  await expect(page.locator(SELECTORS.dialogTitle)).not.toBeVisible();
}

/**
 * ツール情報が表示されていることを検証する
 * @param page - Playwrightのページオブジェクト
 */
async function expectToolInfoVisible(page: Page): Promise<void> {
  await expect(page.locator(SELECTORS.toolLabel)).toBeVisible();
  await expect(page.locator(SELECTORS.argsLabel)).toBeVisible();
}
```

### 2.4 デバッグヘルパー

```typescript
/**
 * 現在の状態をスクリーンショットで保存する
 * @param page - Playwrightのページオブジェクト
 * @param name - スクリーンショット名
 */
async function saveScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({
    path: `screenshots/${name}-${Date.now()}.png`,
    fullPage: true,
  });
}

/**
 * コンソールログを出力する（デバッグ用）
 * @param page - Playwrightのページオブジェクト
 * @param message - メッセージ
 */
async function debugLog(page: Page, message: string): Promise<void> {
  console.log(`[E2E Debug] ${message}`);
  await page.evaluate((msg) => {
    console.log(`[E2E] ${msg}`);
  }, message);
}
```

---

## 3. 型定義

```typescript
// ===== 型定義 =====

/** 権限リクエストのモック型 */
interface MockPermissionRequest {
  requestId: string;
  executionId: string;
  toolName: string;
  args: Record<string, unknown>;
  timestamp: number;
}

/** 権限応答のモック型 */
interface MockPermissionResponse {
  requestId: string;
  approved: boolean;
  rememberChoice: boolean;
}

/** テストユーティリティの型 */
interface TestUtils {
  setPermissionResponseSpy: (spy: jest.Mock) => void;
  getPermissionResponseSpy: () => jest.Mock | null;
  triggerPermissionRequest: (req: MockPermissionRequest) => void;
}

// グローバル型拡張
declare global {
  interface Window {
    __testUtils?: TestUtils;
    __rememberedPermissions?: Record<string, boolean>;
    __ZUSTAND_STORE__?: any;
  }
}
```

---

## 4. エクスポート構成

```typescript
// ===== エクスポート =====

export {
  // 定数
  TEST_SKILL_NAME,
  PERMISSION_TRIGGER_CMD,
  DIALOG_TITLE_TEXT,
  APPROVE_BUTTON_TEXT,
  DENY_BUTTON_TEXT,
  DEFAULT_TIMEOUT,
  SHORT_TIMEOUT,
  SELECTORS,

  // スキル操作
  importAndSelectSkill,
  clearSkillSelection,

  // 権限ダイアログ操作
  triggerPermissionDialog,
  waitForPermissionDialog,
  waitForPermissionDialogHidden,
  approvePermission,
  denyPermission,
  checkRememberChoice,

  // アサーション
  expectPermissionDialogVisible,
  expectPermissionDialogHidden,
  expectToolInfoVisible,

  // デバッグ
  saveScreenshot,
  debugLog,
};
```

---

## 5. 使用例

### 5.1 TC-3 での使用例

```typescript
it("should approve permission and continue execution", async () => {
  // ヘルパー関数を使用
  await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
  await waitForPermissionDialog(page);
  await approvePermission(page);

  // 実行継続を確認
  await expect(page.locator('text="実行中"')).toBeVisible({
    timeout: SHORT_TIMEOUT,
  });
});
```

### 5.2 TC-5 での使用例

```typescript
it("should remember choice", async () => {
  // 1回目: チェック付きで許可
  await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
  await waitForPermissionDialog(page);
  await checkRememberChoice(page);
  await approvePermission(page);

  // 2回目: ダイアログ非表示
  await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
  await page.waitForTimeout(1000);
  await expectPermissionDialogHidden(page);
});
```

---

## 6. 関数一覧

| 関数名                          | 用途                   | パラメータ      |
| ------------------------------- | ---------------------- | --------------- |
| `importAndSelectSkill`          | スキルインポート・選択 | page, skillName |
| `clearSkillSelection`           | スキル選択解除         | page            |
| `triggerPermissionDialog`       | ダイアログトリガー     | page, command   |
| `waitForPermissionDialog`       | ダイアログ表示待機     | page, timeout?  |
| `waitForPermissionDialogHidden` | ダイアログ非表示待機   | page            |
| `approvePermission`             | 許可クリック           | page            |
| `denyPermission`                | 拒否クリック           | page            |
| `checkRememberChoice`           | チェックボックス操作   | page            |
| `expectPermissionDialogVisible` | ダイアログ表示検証     | page            |
| `expectPermissionDialogHidden`  | ダイアログ非表示検証   | page            |
| `expectToolInfoVisible`         | ツール情報表示検証     | page            |
| `saveScreenshot`                | スクリーンショット保存 | page, name      |
| `debugLog`                      | デバッグログ出力       | page, message   |
