# 待機戦略詳細ガイド

## 待機戦略の重要性

E2Eテストで最も一般的な失敗原因は、**要素がまだ準備できていない状態でアクションを実行すること**です。適切な待機戦略は、テストの安定性を大幅に向上させます。

## 待機戦略の種類

### 1. 自動待機 (Auto-waiting)

Playwrightの最大の特徴は、多くの操作で自動的に要素が準備できるまで待機することです。

```typescript
// 自動的に以下を待機:
// 1. 要素がDOMに存在
// 2. 要素が表示されている
// 3. 要素が安定している（アニメーション完了）
// 4. 要素がクリック可能
await page.getByRole("button").click();
```

**自動待機が行われる操作**:

- `click()`
- `fill()`
- `selectOption()`
- `setInputFiles()`
- `check()` / `uncheck()`
- `focus()`

### 2. 明示的待機 (Explicit Waiting)

特定の条件を待つ必要がある場合に使用します。

#### waitForSelector()

要素がDOMに現れるまで待機します。

```typescript
// 要素が表示されるまで待機
await page.waitForSelector('[data-testid="success-message"]');

// 要素が非表示になるまで待機
await page.waitForSelector('[data-testid="loading"]', { state: "hidden" });

// 要素がDOMから削除されるまで待機
await page.waitForSelector('[data-testid="modal"]', { state: "detached" });
```

**stateオプション**:

- `'attached'`: 要素がDOMに存在 (デフォルト)
- `'detached'`: 要素がDOMから削除
- `'visible'`: 要素が表示されている
- `'hidden'`: 要素が非表示

#### waitForLoadState()

ページの読み込み状態を待機します。

```typescript
// DOMContentLoaded イベントまで待機
await page.waitForLoadState("domcontentloaded");

// ページの完全な読み込みまで待機
await page.waitForLoadState("load");

// ネットワークアイドル（500ms間ネットワーク通信なし）まで待機
await page.waitForLoadState("networkidle");
```

**使い分け**:

- `'domcontentloaded'`: 最小限の待機、DOM構築完了時
- `'load'`: 画像やスタイルシート含む全リソース読み込み完了時
- `'networkidle'`: API呼び出しが完了するまで待つ場合

#### waitForURL()

特定のURLになるまで待機します。

```typescript
// 完全一致
await page.waitForURL("https://example.com/dashboard");

// パターンマッチ
await page.waitForURL("**/dashboard");

// 正規表現
await page.waitForURL(/\/dashboard$/);

// 条件関数
await page.waitForURL((url) => url.searchParams.get("success") === "true");
```

#### waitForFunction()

カスタム条件を待機します。

```typescript
// ページ内のJavaScript関数が真を返すまで待機
await page.waitForFunction(() => {
  return document.querySelectorAll(".item").length > 5;
});

// 引数を渡す
await page.waitForFunction(
  (count) => document.querySelectorAll(".item").length >= count,
  10,
);

// ポーリング間隔を指定
await page.waitForFunction(() => document.title === "Loaded", {
  polling: 100,
  timeout: 5000,
});
```

#### waitForResponse()

特定のネットワークリクエストのレスポンスを待機します。

```typescript
// URLマッチ
const responsePromise = page.waitForResponse("**/api/users");
await page.getByRole("button", { name: "Load Users" }).click();
const response = await responsePromise;
const users = await response.json();

// 条件関数
const responsePromise = page.waitForResponse(
  (response) => response.url().includes("/api/") && response.status() === 200,
);
await page.getByRole("button", { name: "Submit" }).click();
await responsePromise;
```

#### waitForRequest()

特定のネットワークリクエストを待機します。

```typescript
const requestPromise = page.waitForRequest("**/api/users");
await page.getByRole("button", { name: "Load Users" }).click();
const request = await requestPromise;
console.log(request.method()); // GET, POST等
```

### 3. タイムアウト設定

すべての待機操作にタイムアウトを設定できます。

```typescript
// グローバルタイムアウト（デフォルト: 30秒）
// playwright.config.ts
export default {
  timeout: 60000, // 60秒
};

// テストレベルタイムアウト
test.setTimeout(120000); // 120秒

// 個別操作のタイムアウト
await page.getByRole("button").click({ timeout: 10000 }); // 10秒
await expect(page.getByText("Loaded")).toBeVisible({ timeout: 15000 }); // 15秒
```

## 待機アンチパターン

### ❌ 固定時間待機（絶対に避ける）

```typescript
// ❌ 悪い例
await page.waitForTimeout(5000); // 5秒待機

// ✅ 良い例
await page.waitForSelector('[data-testid="loaded"]');
```

**理由**:

- 不必要に遅い（条件が早く満たされても待つ）
- 不安定（条件が遅れると失敗）
- 保守性が低い

### ❌ 過度な待機

```typescript
// ❌ 悪い例
await page.waitForLoadState("networkidle"); // すべての通信が止まるまで待つ
await page.waitForTimeout(1000);
await page.waitForSelector('[data-testid="button"]');

// ✅ 良い例
await page.waitForSelector('[data-testid="button"]');
```

**理由**:

- テスト実行時間が不必要に長くなる
- networkidleは必ずしも必要ない

## 実践的な待機パターン

### パターン1: API呼び出し後の待機

```typescript
test("APIデータ読み込み", async ({ page }) => {
  await page.goto("/users");

  // API呼び出しを待つ
  const responsePromise = page.waitForResponse("**/api/users");
  await page.getByRole("button", { name: "Load" }).click();
  const response = await responsePromise;

  // データが表示されるまで待つ
  await expect(page.getByRole("listitem")).toHaveCount(
    (await response.json()).length,
  );
});
```

### パターン2: 動的コンテンツの読み込み

```typescript
test("無限スクロール", async ({ page }) => {
  await page.goto("/feed");

  // 初期アイテム数
  const initialCount = await page.getByRole("article").count();

  // スクロール
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  // 新しいアイテムが追加されるまで待機
  await page.waitForFunction(
    (count) => document.querySelectorAll("article").length > count,
    initialCount,
  );

  // 検証
  const newCount = await page.getByRole("article").count();
  expect(newCount).toBeGreaterThan(initialCount);
});
```

### パターン3: モーダルの表示と非表示

```typescript
test("モーダル操作", async ({ page }) => {
  await page.goto("/");

  // モーダルを開く
  await page.getByRole("button", { name: "Open Modal" }).click();

  // モーダルが表示されるまで待機
  await expect(page.getByRole("dialog")).toBeVisible();

  // モーダルを閉じる
  await page.getByRole("button", { name: "Close" }).click();

  // モーダルが非表示になるまで待機
  await expect(page.getByRole("dialog")).toBeHidden();
});
```

### パターン4: フォーム送信とリダイレクト

```typescript
test("フォーム送信", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email").fill("user@example.com");
  await page.getByLabel("Password").fill("password");

  // URLが変わるまで待機
  const [response] = await Promise.all([
    page.waitForURL("**/dashboard"),
    page.getByRole("button", { name: "Login" }).click(),
  ]);

  // ダッシュボード表示確認
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});
```

### パターン5: ファイルアップロード

```typescript
test("ファイルアップロード", async ({ page }) => {
  await page.goto("/upload");

  // ファイル選択
  await page.getByLabel("File").setInputFiles("test-file.pdf");

  // アップロード開始
  const uploadPromise = page.waitForResponse("**/api/upload");
  await page.getByRole("button", { name: "Upload" }).click();

  // アップロード完了まで待機
  const response = await uploadPromise;
  expect(response.status()).toBe(200);

  // 成功メッセージ表示確認
  await expect(page.getByText("Upload successful")).toBeVisible();
});
```

## デバッグテクニック

### 待機のトレース

```typescript
test("デバッグ", async ({ page }) => {
  // 詳細ログ有効化
  page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

  await page.goto("/");

  // 待機時の状態確認
  console.log("Waiting for selector...");
  await page.waitForSelector('[data-testid="loaded"]');
  console.log("Selector found!");

  // スクリーンショット撮影
  await page.screenshot({ path: "debug.png" });
});
```

### タイムアウトエラーのデバッグ

```typescript
test("タイムアウトデバッグ", async ({ page }) => {
  try {
    await page.waitForSelector('[data-testid="missing"]', { timeout: 5000 });
  } catch (error) {
    // エラー時の状態確認
    console.log("Current URL:", page.url());
    console.log("Page HTML:", await page.content());

    // スクリーンショット保存
    await page.screenshot({ path: "timeout-error.png" });

    throw error;
  }
});
```

## パフォーマンス最適化

### 不要な待機を避ける

```typescript
// ❌ 遅い
await page.goto("/");
await page.waitForLoadState("networkidle"); // 不要な待機
await page.getByRole("button").click();

// ✅ 速い
await page.goto("/");
await page.getByRole("button").click(); // 自動待機で十分
```

### 並列待機

```typescript
// ❌ 遅い（連続待機）
await page.waitForSelector('[data-testid="item1"]');
await page.waitForSelector('[data-testid="item2"]');
await page.waitForSelector('[data-testid="item3"]');

// ✅ 速い（並列待機）
await Promise.all([
  page.waitForSelector('[data-testid="item1"]'),
  page.waitForSelector('[data-testid="item2"]'),
  page.waitForSelector('[data-testid="item3"]'),
]);
```

## まとめ

**待機戦略の原則**:

1. **自動待機を信頼**: Playwrightの自動待機は強力
2. **固定時間待機を避ける**: 必ず条件ベースの待機を使用
3. **適切なタイムアウト設定**: 合理的なタイムアウトを設定
4. **明示的待機を活用**: 自動待機で不十分な場合のみ
5. **デバッグ情報を収集**: 待機失敗時の診断情報を残す

**待機戦略の選択**:

- **要素操作**: 自動待機（何もしない）
- **ページ遷移**: `waitForURL()`
- **API呼び出し**: `waitForResponse()`
- **動的コンテンツ**: `waitForFunction()`
- **カスタム条件**: `waitForFunction()`
