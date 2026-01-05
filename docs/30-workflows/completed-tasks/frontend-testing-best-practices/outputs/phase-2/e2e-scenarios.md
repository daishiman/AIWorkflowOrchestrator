# E2Eシナリオ設計 - フロントエンドテストベストプラクティス

## 既存E2Eテスト（7本）

| No  | ファイル名                      | シナリオ                   | ステータス |
| --- | ------------------------------- | -------------------------- | ---------- |
| 1   | auth.spec.ts                    | 認証フロー                 | 既存       |
| 2   | chat-history-export.spec.ts     | チャット履歴エクスポート   | 既存       |
| 3   | chat-history-navigation.spec.ts | チャット履歴ナビゲーション | 既存       |
| 4   | file-selection.spec.ts          | ファイル選択               | 既存       |
| 5   | system-prompt.spec.ts           | システムプロンプト         | 既存       |
| 6   | workspace.spec.ts               | ワークスペース操作         | 既存       |

---

## 新規E2Eテスト（3本追加で計10本）

### 7. settings.spec.ts - 設定操作

| テストケース   | 操作手順                | 期待結果             |
| -------------- | ----------------------- | -------------------- |
| 設定画面を開く | 設定ボタンクリック      | 設定画面が表示される |
| テーマ変更     | テーマ選択 → 保存       | テーマが変更される   |
| 設定の永続化   | 設定変更 → アプリ再起動 | 設定が維持される     |

```typescript
// apps/desktop/e2e/settings.spec.ts
test.describe("設定操作", () => {
  test("設定画面を開く", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "設定" }).click();
    await expect(page.getByRole("heading", { name: "設定" })).toBeVisible();
  });

  test("テーマを変更できる", async ({ page }) => {
    await page.goto("/settings");
    await page.getByLabel("テーマ").selectOption("dark");
    await page.getByRole("button", { name: "保存" }).click();
    await expect(page.locator("body")).toHaveClass(/dark/);
  });
});
```

### 8. text-converter.spec.ts - テキスト変換

| テストケース   | 操作手順                    | 期待結果             |
| -------------- | --------------------------- | -------------------- |
| CSV→JSON変換   | CSVファイル選択 → JSON変換  | JSON形式で出力       |
| JSON→YAML変換  | JSONファイル選択 → YAML変換 | YAML形式で出力       |
| 変換エラー処理 | 不正ファイル選択            | エラーメッセージ表示 |

```typescript
// apps/desktop/e2e/text-converter.spec.ts
test.describe("テキスト変換", () => {
  test("CSV→JSON変換ができる", async ({ page }) => {
    await page.goto("/converter");
    // ファイル選択とテスト実行
  });
});
```

### 9. error-handling.spec.ts - エラー処理

| テストケース       | 操作手順             | 期待結果                 |
| ------------------ | -------------------- | ------------------------ |
| 無効なAPIキー      | 無効なキーで認証     | エラーメッセージ表示     |
| ネットワークエラー | オフライン状態で操作 | オフラインメッセージ表示 |
| タイムアウト       | 長時間応答なし       | タイムアウトメッセージ   |

```typescript
// apps/desktop/e2e/error-handling.spec.ts
test.describe("エラー処理", () => {
  test("無効なAPIキーでエラー表示", async ({ page }) => {
    await page.goto("/settings");
    await page.getByLabel("API Key").fill("invalid-key");
    await page.getByRole("button", { name: "保存" }).click();
    await expect(page.getByText("APIキーが無効です")).toBeVisible();
  });
});
```

---

## 追加候補（優先度中）

| No  | シナリオ                 | 優先度 |
| --- | ------------------------ | ------ |
| 10  | キーボードショートカット | 中     |
| 11  | ダークモード切り替え     | 中     |
| 12  | チャット履歴インポート   | 中     |

---

## E2Eテスト設計原則

### 安定性確保

1. **明示的な待機**: `waitForSelector` より `expect().toBeVisible()` を優先
2. **テストIDの活用**: `data-testid` 属性で要素を特定
3. **独立性**: 各テストは独立して実行可能
4. **リトライ設定**: CI環境での安定性向上

### flaky test対策

1. **ネットワーク待機**: API応答を確実に待つ
2. **アニメーション考慮**: アニメーション完了を待つ
3. **ランダム性排除**: 固定のテストデータを使用
