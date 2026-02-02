# Phase 1: 非機能要件定義書

## 実行日時

2026-02-02

---

## 1. テスト安定性要件

### 1.1 非同期待機

| 項目               | 要件            | 実装方法                               |
| ------------------ | --------------- | -------------------------------------- |
| ダイアログ表示待機 | 最大10秒待機    | `toBeVisible({ timeout: 10000 })`      |
| 要素表示待機       | 明示的な待機    | `waitForSelector()`                    |
| ページロード待機   | DOM構築完了まで | `waitForLoadState("domcontentloaded")` |

### 1.2 フレーキーテスト回避策

| 策                 | 実装                  | 理由                           |
| ------------------ | --------------------- | ------------------------------ |
| 明示的待機         | `waitForSelector()`   | 暗黙の待機ではなく明示的に待機 |
| 状態ベース待機     | `waitForLoadState()`  | 固定時間待機を避ける           |
| リトライ戦略       | Vitestのretry設定     | 一時的な失敗を許容             |
| 安定したセレクター | `data-testid`, `role` | DOM構造変更に強い              |

### 1.3 待機戦略一覧

```typescript
// ダイアログ表示待機
await page.waitForSelector('text="権限の確認が必要です"', { timeout: 10000 });

// ダイアログ非表示待機
await page.waitForSelector('text="権限の確認が必要です"', { state: "hidden" });

// ページロード待機
await page.waitForLoadState("domcontentloaded");

// 短い固定待機（最終手段）
await page.waitForTimeout(1000);
```

---

## 2. テスト独立性要件

### 2.1 独立性原則

| 原則           | 実装               | 備考                       |
| -------------- | ------------------ | -------------------------- |
| 各テストは独立 | beforeEachで初期化 | 他テストの結果に依存しない |
| 状態のリセット | スキル再選択       | 選択記憶のリセット含む     |
| 並列実行可能   | 依存関係なし       | CI環境で並列実行可         |

### 2.2 beforeEach 初期化内容

```typescript
beforeEach(async () => {
  // 1. スキルをインポート
  await page.evaluate(async () => {
    await window.electronAPI?.skill?.import?.("test-skill");
  });

  // 2. スキルを選択
  await page.click('[aria-label="スキルを選択"]');
  await page.click('[role="option"]:has-text("test-skill")');

  // 3. 前回の選択記憶をクリア（必要に応じて）
  // await page.evaluate(() => {
  //   window.electronAPI?.skill?.clearRememberedChoices?.();
  // });
});
```

### 2.3 afterEach クリーンアップ

```typescript
afterEach(async ({ page }, testInfo) => {
  // 失敗時のスクリーンショット保存
  if (testInfo.status === "failed") {
    await page.screenshot({
      path: `screenshots/failed-${testInfo.title}-${Date.now()}.png`,
    });
  }
});
```

---

## 3. アクセシビリティテスト要件

### 3.1 ARIA属性要件

| 要素       | 必須属性          | 期待値           |
| ---------- | ----------------- | ---------------- |
| ダイアログ | `role`            | `alertdialog`    |
| ダイアログ | `aria-modal`      | `true`           |
| ダイアログ | `aria-labelledby` | タイトル要素のID |
| 許可ボタン | `role`            | `button`         |
| 拒否ボタン | `role`            | `button`         |

### 3.2 キーボードナビゲーション要件

| 操作               | キー           | 期待動作                         |
| ------------------ | -------------- | -------------------------------- |
| 要素間移動         | Tab            | ダイアログ内の要素を順に移動     |
| ボタン実行         | Enter          | フォーカス中のボタンを押下       |
| ダイアログ閉じる   | Escape         | ダイアログを閉じる（拒否と同等） |
| フォーカストラップ | Tab (繰り返し) | ダイアログ外にフォーカスが出ない |

### 3.3 アクセシビリティテストケース

| TC     | 検証内容            | 実装方法                   |
| ------ | ------------------- | -------------------------- |
| A11y-1 | ARIA属性の存在      | `toHaveAttribute()`        |
| A11y-2 | フォーカストラップ  | Tab連打でフォーカス確認    |
| A11y-3 | Escapeキー動作      | `keyboard.press("Escape")` |
| A11y-4 | Enter/Spaceキー動作 | `keyboard.press("Enter")`  |

---

## 4. パフォーマンス要件

### 4.1 実行時間要件

| メトリクス             | 目標値   | 許容値   |
| ---------------------- | -------- | -------- |
| 各テストケース実行時間 | 10秒以内 | 30秒以内 |
| 全体実行時間           | 1分以内  | 3分以内  |
| ダイアログ表示時間     | 3秒以内  | 10秒以内 |

### 4.2 タイムアウト設定

```typescript
// Vitest設定
export default defineConfig({
  test: {
    testTimeout: 30000, // 各テスト30秒
    hookTimeout: 10000, // beforeAll/afterAll 10秒
  },
});

// Playwright設定
const config: PlaywrightTestConfig = {
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
};
```

### 4.3 パフォーマンス監視

| 監視項目         | 計測方法          | アラート条件 |
| ---------------- | ----------------- | ------------ |
| テスト実行時間   | Vitest出力        | 30秒超過     |
| フレーキー発生率 | CI統計            | 5%超過       |
| メモリ使用量     | Electron DevTools | 500MB超過    |

---

## 5. 環境要件

### 5.1 ローカル環境

| 項目         | 要件                          |
| ------------ | ----------------------------- |
| Node.js      | v18以上                       |
| pnpm         | v8以上                        |
| OS           | macOS / Windows / Linux       |
| ディスプレイ | GUI環境（ヘッドフルモード用） |

### 5.2 CI環境

| 項目         | 要件                              |
| ------------ | --------------------------------- |
| ランナー     | Ubuntu 22.04 (GitHub Actions)     |
| ディスプレイ | Xvfb（仮想ディスプレイ）          |
| タイムアウト | 5分以内                           |
| キャッシュ   | node_modules, Playwright browsers |

### 5.3 環境変数

| 変数名            | 用途             | デフォルト            |
| ----------------- | ---------------- | --------------------- |
| `NODE_ENV`        | 環境識別         | `test`                |
| `TEST_SKILLS_DIR` | フィクスチャパス | `__fixtures__/skills` |
| `VITE_E2E_MODE`   | E2E環境フラグ    | `true`                |
| `PWDEBUG`         | デバッグモード   | 未設定                |

---

## 6. 保守性要件

### 6.1 コード品質

| 項目       | 基準                                  |
| ---------- | ------------------------------------- |
| TypeScript | strict mode                           |
| ESLint     | エラー0件                             |
| Prettier   | フォーマット適用                      |
| 命名規則   | camelCase (関数), PascalCase (クラス) |

### 6.2 ドキュメント

| 項目             | 要件                     |
| ---------------- | ------------------------ |
| テストケース説明 | 日本語でitブロックに記載 |
| ヘルパー関数     | JSDoc コメント           |
| セットアップ手順 | README記載               |

### 6.3 変更容易性

| 項目         | 実装                      |
| ------------ | ------------------------- |
| セレクター   | 定数化（変更時1箇所修正） |
| テストデータ | 外部ファイル化検討        |
| 共通処理     | ヘルパー関数に抽出        |

---

## 7. 要件トレーサビリティ

| 要件ID | 要件内容                 | カテゴリ         |
| ------ | ------------------------ | ---------------- |
| NFR-1  | 10秒以内にダイアログ表示 | パフォーマンス   |
| NFR-2  | 30秒以内にテスト完了     | パフォーマンス   |
| NFR-3  | フレーキーテスト0%       | 安定性           |
| NFR-4  | テスト独立実行可能       | 独立性           |
| NFR-5  | WCAG 2.1 AA準拠          | アクセシビリティ |
| NFR-6  | キーボード操作可能       | アクセシビリティ |
| NFR-7  | CI環境で実行可能         | 環境             |
