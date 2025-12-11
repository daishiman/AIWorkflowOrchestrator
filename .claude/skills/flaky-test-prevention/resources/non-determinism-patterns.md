# 非決定性パターンと対処法

フレーキーテストの根本原因は**非決定性**です。
このリソースでは、E2Eテストで頻繁に発生する非決定性のパターンとその対処法を解説します。

---

## 目次

1. [非決定性とは](#非決定性とは)
2. [時刻依存の非決定性](#時刻依存の非決定性)
3. [ランダム性の非決定性](#ランダム性の非決定性)
4. [外部API依存の非決定性](#外部api依存の非決定性)
5. [並行処理の非決定性](#並行処理の非決定性)
6. [ネットワークの非決定性](#ネットワークの非決定性)

---

## 非決定性とは

### 定義

**非決定性（Non-determinism）**: 同じ入力に対して、実行ごとに異なる出力が生じる性質。

### E2Eテストにおける影響

❌ **フレーキーテスト**: 同じテストが成功したり失敗したりする
❌ **信頼性の低下**: テスト結果が信用できなくなる
❌ **デバッグ困難**: 問題が再現しない
❌ **CI/CDの停滞**: 不安定なテストがパイプラインを止める

### 非決定性の分類

1. **時刻依存**: 実行時刻によって結果が変わる
2. **ランダム性**: 乱数や確率的な処理
3. **外部依存**: 外部APIやサービスの状態
4. **並行処理**: レースコンディション、タイミング
5. **ネットワーク**: 遅延、タイムアウト、接続失敗

---

## 時刻依存の非決定性

### 問題パターン1: 現在時刻への直接依存

```typescript
// ❌ 悪い例: 現在時刻に直接依存
test("期限切れタスクの表示", async ({ page }) => {
  await page.goto("/tasks");

  // 現在時刻によって結果が変わる
  const expiredTasks = page.locator(".task.expired");
  await expect(expiredTasks).toHaveCount(3); // 時間経過で変わる
});
```

**問題**: テスト実行時刻によって、期限切れタスクの数が変わる。

**解決策**: テストデータで明示的に期限を設定

```typescript
// ✅ 良い例: テストデータで期限を制御
test("期限切れタスクの表示", async ({ page, dbSeeder }) => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // 明示的に期限切れタスクを3件作成
  await dbSeeder.createTask({ title: "Task 1", dueDate: yesterday });
  await dbSeeder.createTask({ title: "Task 2", dueDate: yesterday });
  await dbSeeder.createTask({ title: "Task 3", dueDate: yesterday });

  // 期限内タスクも作成
  await dbSeeder.createTask({ title: "Task 4", dueDate: tomorrow });

  await page.goto("/tasks");

  const expiredTasks = page.locator(".task.expired");
  await expect(expiredTasks).toHaveCount(3); // 確定
});
```

---

### 問題パターン2: タイムゾーン依存

```typescript
// ❌ 悪い例: ローカルタイムゾーンに依存
test("日付フィルター", async ({ page }) => {
  const today = new Date().toISOString().split("T")[0]; // "2024-01-15"

  await page.goto("/tasks");
  await page.fill('input[name="date"]', today);
  await page.click('button:has-text("フィルター")');

  // タイムゾーンによって結果が変わる可能性
  await expect(page.locator(".task")).toHaveCount(5);
});
```

**問題**: サーバーとクライアントのタイムゾーンが異なると、結果が変わる。

**解決策**: UTC固定またはタイムゾーンを明示的に設定

```typescript
// ✅ 良い例: UTCで統一
test("日付フィルター", async ({ page, dbSeeder }) => {
  // UTC 2024-01-15 00:00:00のタスクを作成
  const targetDate = new Date("2024-01-15T00:00:00Z");

  await dbSeeder.createTask({
    title: "UTC Task",
    createdAt: targetDate.toISOString(),
  });

  await page.goto("/tasks");
  await page.fill('input[name="date"]', "2024-01-15");
  await page.click('button:has-text("フィルター")');

  await expect(page.locator(".task")).toBeVisible();
  await expect(page.locator(".task")).toContainText("UTC Task");
});
```

---

### 問題パターン3: 相対時間表示

```typescript
// ❌ 悪い例: "5分前"などの相対表示に依存
test("相対時間表示", async ({ page }) => {
  await page.goto("/notifications");

  // "5分前"は時間経過で変わる
  await expect(page.locator(".time")).toContainText("5分前");
});
```

**解決策**: データ属性で絶対時刻を検証、または時刻をモック

```typescript
// ✅ 良い例: データ属性で絶対時刻を検証
test("相対時間表示", async ({ page, dbSeeder }) => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  await dbSeeder.createNotification({
    message: "Test notification",
    createdAt: fiveMinutesAgo.toISOString(),
  });

  await page.goto("/notifications");

  // data-timestamp属性を検証
  const timeElement = page.locator(".time").first();
  const timestamp = await timeElement.getAttribute("data-timestamp");
  expect(new Date(timestamp!).getTime()).toBeCloseTo(
    fiveMinutesAgo.getTime(),
    -3, // 誤差1秒以内
  );
});
```

---

## ランダム性の非決定性

### 問題パターン1: Math.random()依存

```typescript
// ❌ 悪い例: ランダムな要素の選択
test("ランダムユーザーの表示", async ({ page }) => {
  await page.goto("/users/random");

  // 毎回異なるユーザーが表示される
  const userName = await page.locator(".user-name").textContent();
  expect(userName).toBe("John Doe"); // ランダムなので失敗する可能性
});
```

**解決策**: シード値を設定してランダム性を制御

```typescript
// ✅ 良い例: シード値でランダム性を制御
test("ランダムユーザーの表示", async ({ page }) => {
  // URLパラメータでシード値を指定
  await page.goto("/users/random?seed=12345");

  // シード値が同じなら、常に同じユーザーが表示される
  const userName = await page.locator(".user-name").textContent();
  expect(userName).toBe("John Doe"); // 確定
});
```

---

### 問題パターン2: UUID生成

```typescript
// ❌ 悪い例: 自動生成されたUUIDに依存
test("リソース作成", async ({ page }) => {
  await page.goto("/resources/new");
  await page.fill('input[name="name"]', "Test Resource");
  await page.click('button:has-text("作成")');

  // リダイレクト先のURLが予測できない
  await expect(page).toHaveURL(/\/resources\/[a-f0-9-]+/);

  // IDが分からないので、要素を特定できない
  // ???
});
```

**解決策**: APIレスポンスからIDを取得、またはテストデータで固定IDを使用

```typescript
// ✅ 良い例: APIレスポンスからIDを取得
test("リソース作成", async ({ page }) => {
  // ネットワークレスポンスを監視
  const responsePromise = page.waitForResponse((response) =>
    response.url().includes("/api/resources"),
  );

  await page.goto("/resources/new");
  await page.fill('input[name="name"]', "Test Resource");
  await page.click('button:has-text("作成")');

  const response = await responsePromise;
  const data = await response.json();
  const resourceId = data.id;

  // IDが分かっているので、検証可能
  await expect(page).toHaveURL(`/resources/${resourceId}`);
  await expect(
    page.locator(`[data-resource-id="${resourceId}"]`),
  ).toBeVisible();
});
```

---

## 外部API依存の非決定性

### 問題パターン1: サードパーティAPI

```typescript
// ❌ 悪い例: 実際の外部APIを呼び出す
test("天気情報の表示", async ({ page }) => {
  await page.goto("/weather");

  // 外部API（OpenWeatherMap）の結果に依存
  await expect(page.locator(".temperature")).toContainText("15°C");
  // 実際の天気によって変わるので失敗する
});
```

**解決策**: MSW（Mock Service Worker）でAPIをモック

```typescript
// ✅ 良い例: MSWでAPIレスポンスをモック
import { test, expect } from "@playwright/test";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

const server = setupServer(
  http.get("https://api.openweathermap.org/data/2.5/weather", () => {
    return HttpResponse.json({
      main: { temp: 15 },
      weather: [{ description: "clear sky" }],
    });
  }),
);

test.beforeAll(() => server.listen());
test.afterEach(() => server.resetHandlers());
test.afterAll(() => server.close());

test("天気情報の表示", async ({ page }) => {
  await page.goto("/weather");

  // モックされたレスポンスが常に返る
  await expect(page.locator(".temperature")).toContainText("15°C");
  await expect(page.locator(".description")).toContainText("clear sky");
});
```

---

### 問題パターン2: レート制限

```typescript
// ❌ 悪い例: 外部APIのレート制限に依存
test("複数ユーザーのプロフィール画像取得", async ({ page }) => {
  for (let i = 0; i < 100; i++) {
    await page.goto(`/users/${i}`);
    // 外部CDNから画像を取得
    await expect(page.locator(".avatar")).toBeVisible();
  }
  // レート制限で失敗する可能性
});
```

**解決策**: ローカルにモック画像を配置、またはリクエスト数を制限

```typescript
// ✅ 良い例: ローカルモック画像を使用
test("複数ユーザーのプロフィール画像取得", async ({ page, context }) => {
  // 画像リクエストをインターセプトしてモック画像を返す
  await context.route("**/avatars/**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "image/png",
      path: "./tests/fixtures/mock-avatar.png",
    });
  });

  for (let i = 0; i < 100; i++) {
    await page.goto(`/users/${i}`);
    await expect(page.locator(".avatar")).toBeVisible();
  }
  // ローカルファイルなのでレート制限なし
});
```

---

## 並行処理の非決定性

### 問題パターン1: レースコンディション

```typescript
// ❌ 悪い例: 非同期処理の完了を待たない
test("非同期データの表示", async ({ page }) => {
  await page.goto("/dashboard");

  // データ取得APIが完了する前にチェックしてしまう
  const count = await page.locator(".item").count();
  expect(count).toBe(10); // タイミングによって0〜10
});
```

**解決策**: Playwrightの自動待機、または明示的な待機

```typescript
// ✅ 良い例: Playwrightの自動待機を活用
test("非同期データの表示", async ({ page }) => {
  await page.goto("/dashboard");

  // Playwrightは要素が表示されるまで自動的に待機
  await expect(page.locator(".item")).toHaveCount(10);
});

// ✅ 良い例: 特定のAPIレスポンスを待機
test("非同期データの表示（API待機）", async ({ page }) => {
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/items") && response.status() === 200,
  );

  await page.goto("/dashboard");
  await responsePromise; // API完了を確実に待つ

  await expect(page.locator(".item")).toHaveCount(10);
});
```

---

### 問題パターン2: アニメーション中の操作

```typescript
// ❌ 悪い例: アニメーション中に要素をクリック
test("モーダルのクリック", async ({ page }) => {
  await page.click('button:has-text("開く")');

  // モーダルが開くアニメーション中にクリックしようとする
  await page.click(".modal .close-button"); // 失敗する可能性
});
```

**解決策**: アニメーション完了を待つ、またはアニメーション無効化

```typescript
// ✅ 良い例: 要素が安定するまで待つ
test("モーダルのクリック", async ({ page }) => {
  await page.click('button:has-text("開く")');

  // 要素が表示され、かつクリック可能になるまで待機
  const closeButton = page.locator(".modal .close-button");
  await expect(closeButton).toBeVisible();
  await expect(closeButton).toBeEnabled();

  await closeButton.click(); // 安全
});

// ✅ 良い例: テスト環境ではアニメーション無効化
test.use({
  viewport: { width: 1280, height: 720 },
  // CSSでアニメーションを無効化
  extraHTTPHeaders: {
    "X-Test-Mode": "true", // サーバー側でアニメーション無効化フラグ
  },
});
```

---

## ネットワークの非決定性

### 問題パターン1: ネットワーク遅延

```typescript
// ❌ 悪い例: 固定のタイムアウト
test("データ取得", async ({ page }) => {
  await page.goto("/dashboard");
  await page.waitForTimeout(3000); // 3秒待つ

  // ネットワークが遅い場合、3秒では不十分
  await expect(page.locator(".data")).toBeVisible();
});
```

**解決策**: 条件ベースの待機

```typescript
// ✅ 良い例: 条件ベースの待機
test("データ取得", async ({ page }) => {
  await page.goto("/dashboard");

  // 要素が表示されるまで待つ（最大30秒）
  await expect(page.locator(".data")).toBeVisible({ timeout: 30000 });
});

// ✅ 良い例: ネットワークアイドルを待つ
test("データ取得（ネットワーク完了）", async ({ page }) => {
  await page.goto("/dashboard", { waitUntil: "networkidle" });

  await expect(page.locator(".data")).toBeVisible();
});
```

---

## ベストプラクティス

### DO ✅

- **決定的なテストデータ**: 明示的に日時、ID、値を設定
- **モックとスタブ**: 外部依存をモックして制御
- **Playwrightの自動待機**: `expect`と`locator`を活用
- **条件ベースの待機**: `waitForTimeout`ではなく`waitForSelector`
- **環境変数でUTC固定**: `TZ=UTC`で時刻を統一
- **シード値**: ランダム処理にシード値を渡す

### DON'T ❌

- **固定タイムアウト**: `waitForTimeout`に依存しない
- **現在時刻に依存**: `new Date()`を直接使用しない
- **外部APIに依存**: テストから実際の外部APIを呼び出さない
- **アニメーション中の操作**: 要素が安定するまで待たない
- **レースコンディション**: 非同期処理の完了を仮定しない

---

## まとめ

非決定性を排除することで、安定したフレーキーのないE2Eテストを実現できます。

**キーポイント**:

1. **時刻**: UTC固定、明示的な日時設定
2. **ランダム性**: シード値で制御、固定データを使用
3. **外部依存**: MSWやモックで隔離
4. **並行処理**: Playwrightの自動待機を活用
5. **ネットワーク**: 条件ベースの待機

これらのパターンを適用することで、テストの信頼性が大幅に向上します。
