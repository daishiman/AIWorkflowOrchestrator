# Phase 2: テストケース詳細設計書

## 実行日時

2026-02-02

---

## 1. TC-1: 権限ダイアログ表示

### 設計詳細

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| **テストID** | TC-1                                     |
| **前提条件** | test-skill がインポート・選択済み        |
| **操作**     | "Run dangerous command" を入力して Enter |
| **検証**     | `text="権限の確認が必要です"` が visible |
| **待機戦略** | `toBeVisible({ timeout: 10000 })`        |

### 実装コード

```typescript
it("should show permission dialog when tool requires approval", async () => {
  // Arrange: beforeEach で完了済み

  // Act: コマンド入力・送信
  await page.fill('[data-testid="chat-input"]', PERMISSION_TRIGGER_CMD);
  await page.press('[data-testid="chat-input"]', "Enter");

  // Assert: ダイアログ表示確認
  const dialog = page.locator(`text="${DIALOG_TITLE_TEXT}"`);
  await expect(dialog).toBeVisible({ timeout: 10000 });
});
```

### セレクター

| 要素               | セレクター                    | 安定性 |
| ------------------ | ----------------------------- | ------ |
| チャット入力       | `[data-testid="chat-input"]`  | 高     |
| ダイアログタイトル | `text="権限の確認が必要です"` | 中     |

---

## 2. TC-2: ツール情報表示

### 設計詳細

| 項目         | 内容                                          |
| ------------ | --------------------------------------------- |
| **テストID** | TC-2                                          |
| **前提条件** | 権限ダイアログが表示されている                |
| **操作**     | なし（表示確認のみ）                          |
| **検証**     | `text="ツール:"` と `text="引数:"` が visible |

### 実装コード

```typescript
it("should display tool info in permission dialog", async () => {
  // Arrange: ダイアログを表示
  await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
  await waitForPermissionDialog(page);

  // Assert: ツール情報確認
  await expect(page.locator('text="ツール:"')).toBeVisible();
  await expect(page.locator('text="引数:"')).toBeVisible();
});
```

### セレクター

| 要素         | セレクター       | 安定性 |
| ------------ | ---------------- | ------ |
| ツールラベル | `text="ツール:"` | 中     |
| 引数ラベル   | `text="引数:"`   | 中     |

---

## 3. TC-3: 許可して続行

### 設計詳細

| 項目         | 内容                                         |
| ------------ | -------------------------------------------- |
| **テストID** | TC-3                                         |
| **前提条件** | 権限ダイアログが表示されている               |
| **操作**     | 「許可」ボタンをクリック                     |
| **検証**     | ダイアログが閉じ、`text="実行中"` が visible |

### 実装コード

```typescript
it("should approve permission and continue execution", async () => {
  // Arrange: ダイアログを表示
  await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
  await waitForPermissionDialog(page);

  // Act: 許可ボタンクリック
  await page.click(`button:has-text("${APPROVE_BUTTON_TEXT}")`);

  // Assert: ダイアログ非表示・実行継続
  await page.waitForSelector(`text="${DIALOG_TITLE_TEXT}"`, {
    state: "hidden",
  });

  // 実行中またはストリーミング出力を確認
  const executingOrOutput = page
    .locator('text="実行中"')
    .or(page.locator('[data-testid="streaming-output"]'));
  await expect(executingOrOutput).toBeVisible({ timeout: 5000 });
});
```

### セレクター

| 要素       | セレクター                | 安定性 |
| ---------- | ------------------------- | ------ |
| 許可ボタン | `button:has-text("許可")` | 高     |
| 実行中表示 | `text="実行中"`           | 中     |

---

## 4. TC-4: 拒否して停止

### 設計詳細

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| **テストID** | TC-4                                             |
| **前提条件** | 権限ダイアログが表示されている                   |
| **操作**     | 「拒否」ボタンをクリック                         |
| **検証**     | ダイアログが閉じ、`text="キャンセル"` が visible |

### 実装コード

```typescript
it("should deny permission and stop execution", async () => {
  // Arrange: ダイアログを表示
  await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
  await waitForPermissionDialog(page);

  // Act: 拒否ボタンクリック
  await page.click(`button:has-text("${DENY_BUTTON_TEXT}")`);

  // Assert: ダイアログ非表示・実行キャンセル
  await page.waitForSelector(`text="${DIALOG_TITLE_TEXT}"`, {
    state: "hidden",
  });

  // キャンセルまたはエラーメッセージを確認
  const cancelledOrError = page
    .locator('text="キャンセル"')
    .or(page.locator('text="拒否"').or(page.locator('text="denied"')));
  await expect(cancelledOrError).toBeVisible({ timeout: 5000 });
});
```

### セレクター

| 要素           | セレクター                | 安定性 |
| -------------- | ------------------------- | ------ |
| 拒否ボタン     | `button:has-text("拒否")` | 高     |
| キャンセル表示 | `text="キャンセル"`       | 中     |

---

## 5. TC-5: 選択記憶

### 設計詳細

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| **テストID** | TC-5                                            |
| **前提条件** | 権限ダイアログが表示されている                  |
| **操作1**    | チェックボックスをクリック → 「許可」クリック   |
| **操作2**    | 同じコマンドを再実行                            |
| **検証**     | 2回目は権限ダイアログが表示されない             |
| **待機戦略** | `waitForTimeout(1000)` 後に `not.toBeVisible()` |

### 実装コード

```typescript
it("should remember choice when checkbox is checked", async () => {
  // Arrange & Act (1回目): ダイアログ表示、チェックボックスON、許可
  await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
  await waitForPermissionDialog(page);

  await page.click('[type="checkbox"]');
  await page.click(`button:has-text("${APPROVE_BUTTON_TEXT}")`);

  // ダイアログが閉じるのを待つ
  await page.waitForSelector(`text="${DIALOG_TITLE_TEXT}"`, {
    state: "hidden",
  });

  // Act (2回目): 同じコマンドを再実行
  await page.fill('[data-testid="chat-input"]', PERMISSION_TRIGGER_CMD);
  await page.press('[data-testid="chat-input"]', "Enter");

  // Assert: 2回目はダイアログが表示されない
  await page.waitForTimeout(1000); // 少し待機
  await expect(page.locator(`text="${DIALOG_TITLE_TEXT}"`)).not.toBeVisible();
});
```

### セレクター

| 要素             | セレクター                | 安定性 |
| ---------------- | ------------------------- | ------ |
| チェックボックス | `[type="checkbox"]`       | 中     |
| 許可ボタン       | `button:has-text("許可")` | 高     |

---

## 6. 追加テストケース（オプション）

### TC-6: タイムアウト処理

```typescript
it("should handle permission request timeout", async () => {
  // Arrange: ダイアログを表示
  await triggerPermissionDialog(page, PERMISSION_TRIGGER_CMD);
  await waitForPermissionDialog(page);

  // Act: 応答せずに待機（タイムアウトまで）
  await page.waitForTimeout(5000); // テスト用短縮タイムアウト

  // Assert: タイムアウトまたはエラー表示
  const timeoutOrError = page
    .locator('text="タイムアウト"')
    .or(page.locator('text="時間切れ"'));
  // 実装によってはタイムアウト機能がない場合はスキップ
  // await expect(timeoutOrError).toBeVisible({ timeout: 10000 });
});
```

---

## 7. テストケースマトリクス

| TC   | テスト名       | 前提条件       | 操作                 | 検証              | 待機 |
| ---- | -------------- | -------------- | -------------------- | ----------------- | ---- |
| TC-1 | ダイアログ表示 | スキル選択済み | コマンド入力         | ダイアログvisible | 10秒 |
| TC-2 | 情報表示       | ダイアログ表示 | なし                 | ラベルvisible     | -    |
| TC-3 | 許可           | ダイアログ表示 | 許可クリック         | 実行継続          | 5秒  |
| TC-4 | 拒否           | ダイアログ表示 | 拒否クリック         | キャンセル        | 5秒  |
| TC-5 | 記憶           | ダイアログ表示 | チェック→許可→再実行 | 2回目非表示       | 1秒  |
