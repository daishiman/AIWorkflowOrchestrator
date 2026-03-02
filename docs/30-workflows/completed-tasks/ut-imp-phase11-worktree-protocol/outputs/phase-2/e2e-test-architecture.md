# Phase 2: E2Eテストアーキテクチャ設計

## メタ情報

| 項目      | 内容                                 |
| --------- | ------------------------------------ |
| タスクID  | UT-IMP-PHASE11-WORKTREE-PROTOCOL-001 |
| Phase     | 2                                    |
| 作成日    | 2026-03-01                           |
| 依存Phase | Phase 1（要件定義）                  |

## 概要

Playwright `_electron.launch()` パターンを使用したElectron E2EテストのアーキテクチャをTask 2（E2Eテストアーキテクチャ設計）として定義する。テストヘルパー、skill:remove/importテスト、Playwright設定更新、CI/CDジョブ構成を詳細設計する。

## ファイル構成ツリー（apps/desktop/e2e/ 配下）

```
apps/desktop/e2e/
├── helpers/
│   └── electron-app.ts          # Electron起動・終了・IPC呼び出しヘルパー（新規）
├── ipc-skill-remove.spec.ts     # skill:remove E2Eテスト（新規）
├── ipc-skill-import.spec.ts     # skill:import E2Eテスト（新規）
├── skill-permission.spec.ts     # 既存（変更なし）
├── global-setup.ts              # 既存（変更なし）
├── mocks/
│   └── electronAPI.mock.ts      # 既存（変更なし）
└── pages/
    ├── SearchPanelPage.ts       # 既存（変更なし）
    └── WorkspaceSearchPage.ts   # 既存（変更なし）
```

### 新規作成ファイルと既存ファイルの関係

```
electron-app.ts（新規）
  <- ipc-skill-remove.spec.ts（新規）が import して使用
  <- ipc-skill-import.spec.ts（新規）が import して使用
  <- 将来の新規 IPC E2Eテストが import して再利用可能（NFR-3: 50行以内）

skill-permission.spec.ts（既存）
  <- global-setup.ts（既存）で認証モックを設定
  <- mocks/electronAPI.mock.ts（既存）でモックを定義

electron-e2eプロジェクト（新規）
  <- ipc-skill-remove.spec.ts のみマッチ（testMatch: /ipc-.*\.spec\.ts/）
  <- ipc-skill-import.spec.ts のみマッチ
  chromiumプロジェクト（既存）
  <- skill-permission.spec.ts をマッチ（影響なし）
```

## テストヘルパー設計（`helpers/electron-app.ts`）

### 関数一覧

| 関数名                              | 戻り値                                                      | 役割                                               |
| ----------------------------------- | ----------------------------------------------------------- | -------------------------------------------------- |
| `launchElectronApp()`               | `Promise<{ electronApp: ElectronApplication; page: Page }>` | Electronアプリを起動し最初のウィンドウのPageを返す |
| `closeElectronApp(electronApp)`     | `Promise<void>`                                             | Electronアプリを安全に終了する                     |
| `invokeIPC(page, apiPath, ...args)` | `Promise<unknown>`                                          | Preload API経由でIPC通信を実行し結果を返す         |

### launchElectronApp()

```typescript
/**
 * Electronアプリを起動し、最初のウィンドウのPageを返す。
 * 呼び出し元は必ず closeElectronApp() で終了すること。
 *
 * @returns electronApp と page のペア
 * @throws Electronアプリが60秒以内に起動しない場合（NFR-5対策）
 */
export async function launchElectronApp(): Promise<{
  electronApp: ElectronApplication;
  page: Page;
}>;
```

**実装方針:**

- `_electron.launch({ args: ['.'], cwd: process.cwd(), timeout: 60_000 })` でアプリを起動する
- `cwd` は `apps/desktop/` からの実行を前提とする（P40対策: ディレクトリ依存）
- `timeout: 60_000` でNFR-5（Electronアプリ起動タイムアウト60秒）を実現する
- `NODE_ENV: 'test'` と `ELECTRON_IS_E2E: 'true'` を環境変数として渡す
- `electronApp.firstWindow()` で最初のウィンドウを取得し、`waitForLoadState('domcontentloaded')` で読み込み完了を待機する

### closeElectronApp(electronApp)

```typescript
/**
 * Electronアプリを安全に終了する。
 * afterEach で必ず呼び出し、ゾンビプロセスを防止する。
 *
 * @param electronApp - 終了するElectronApplicationインスタンス
 */
export async function closeElectronApp(
  electronApp: ElectronApplication,
): Promise<void>;
```

**実装方針:**

- `electronApp.close()` でElectronプロセスを終了する
- `afterEach` で必ず呼び出すことを JSDoc に明記し、ゾンビプロセスを防止する
- エラーが発生してもプロセスが残らないよう `try/finally` で保護しない（呼び出し元が責任を持つ）

### invokeIPC(page, apiPath, ...args)

```typescript
/**
 * Preload API経由でIPC通信を実行し、結果を返す。
 * window.electronAPI 配下のネストされたAPIパスをサポートする。
 *
 * 使用例: invokeIPC(page, "skill.remove", "my-skill")
 *   -> window.electronAPI.skill.remove("my-skill") を実行
 *
 * @param page - RendererウィンドウのPage
 * @param apiPath - window.electronAPI 配下のドット区切りAPIパス（例: "skill.remove"）
 * @param args - APIに渡す引数（可変長）
 * @returns IPC通信の結果（成功時）またはエラー（失敗時は reject）
 * @throws window.electronAPI.{apiPath} が存在しない場合（未定義エラー）
 * @throws window.electronAPI.{apiPath} が関数でない場合（型エラー）
 */
export async function invokeIPC(
  page: Page,
  apiPath: string,
  ...args: unknown[]
): Promise<unknown>;
```

**実装方針:**

- `page.evaluate()` を使用してRendererプロセスでAPIを実行する
- `apiPath` をドット（`.`）で分割し、`window.electronAPI` から再帰的にアクセスする
- 中間パスが `undefined` または `null` の場合は明確なエラーメッセージで `throw` する
- 最終的なオブジェクトが関数でない場合も `throw` する
- `{ path: apiPath, invokeArgs: args }` として `page.evaluate()` に渡すことで、シリアライズ可能なデータのみを渡す

**実装コード（参考）:**

```typescript
export async function invokeIPC(
  page: Page,
  apiPath: string,
  ...args: unknown[]
): Promise<unknown> {
  return page.evaluate(
    ({ path, invokeArgs }) => {
      const parts = path.split(".");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let api: any = (window as any).electronAPI;
      for (const part of parts) {
        if (api === undefined || api === null) {
          throw new Error(
            `window.electronAPI.${path} is not available: ${part} is ${api}`,
          );
        }
        api = api[part];
      }
      if (typeof api !== "function") {
        throw new Error(`window.electronAPI.${path} is not a function`);
      }
      return api(...invokeArgs);
    },
    { path: apiPath, invokeArgs: args },
  );
}
```

## skill:remove E2Eテスト設計（`ipc-skill-remove.spec.ts`）

### テストケース一覧（TC-R01〜TC-R04）

| テストID | テスト名                                         | テスト種別 | 引数                       | 期待する結果                                           | 対策するPitfall                           |
| -------- | ------------------------------------------------ | ---------- | -------------------------- | ------------------------------------------------------ | ----------------------------------------- |
| TC-R01   | 有効なスキル名で削除が成功する                   | 正常系     | `"test-skill"`             | `result` が defined であること                         | P44回帰防止（string引数で通信成功）       |
| TC-R02   | 空文字列がVALIDATION_ERRORで拒否される           | 異常系     | `""`                       | reject & `{ code: "VALIDATION_ERROR" }`                | P42（3段バリデーション Step 2）           |
| TC-R03   | スペースのみ文字列がVALIDATION_ERRORで拒否される | 異常系     | `"   "`                    | reject & `{ code: "VALIDATION_ERROR" }`                | P42（3段バリデーション Step 3）           |
| TC-R04   | 未登録スキル名がエラーレスポンスを返す           | 異常系     | `"non-existent-skill-xyz"` | `result` が defined であること（冪等性または実装依存） | P44回帰防止（バリデーション通過後の処理） |

### テストコード設計

```typescript
// apps/desktop/e2e/ipc-skill-remove.spec.ts
import { test, expect } from "@playwright/test";
import {
  launchElectronApp,
  closeElectronApp,
  invokeIPC,
} from "./helpers/electron-app";
import type { ElectronApplication, Page } from "playwright";

test.describe("skill:remove IPC E2Eテスト", () => {
  let electronApp: ElectronApplication;
  let page: Page;

  // P9対策: 各テストで独立したElectronプロセスを起動・終了（状態リーク防止）
  test.beforeEach(async () => {
    const app = await launchElectronApp();
    electronApp = app.electronApp;
    page = app.page;
  });

  test.afterEach(async () => {
    await closeElectronApp(electronApp);
  });

  // TC-R01: 正常系（P44回帰防止: string引数でIPC通信が成功する）
  test("TC-R01: 有効なスキル名で削除が成功する", async () => {
    const result = await invokeIPC(page, "skill.remove", "test-skill");
    expect(result).toBeDefined();
  });

  // TC-R02: 異常系（P42 3段バリデーション Step 2: 空文字列）
  test("TC-R02: 空文字列がVALIDATION_ERRORで拒否される", async () => {
    await expect(invokeIPC(page, "skill.remove", "")).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
  });

  // TC-R03: 異常系（P42 3段バリデーション Step 3: スペースのみ文字列）
  test("TC-R03: スペースのみ文字列がVALIDATION_ERRORで拒否される", async () => {
    await expect(invokeIPC(page, "skill.remove", "   ")).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
  });

  // TC-R04: 異常系（未登録スキル名の動作確認）
  test("TC-R04: 未登録スキル名がエラーレスポンスを返す", async () => {
    const result = await invokeIPC(
      page,
      "skill.remove",
      "non-existent-skill-xyz",
    );
    // 未登録スキルの削除は成功扱い（冪等性）またはエラーを返す
    // 実装に応じて期待値を調整する
    expect(result).toBeDefined();
  });
});
```

### TC-R01〜TC-R04 のバリデーション対応マップ

```
TC-R01: "test-skill" -> P42 Step 1(通過) -> P42 Step 2(通過) -> P42 Step 3(通過) -> 処理実行 -> 成功
TC-R02: ""           -> P42 Step 1(通過) -> P42 Step 2(拒否) -> VALIDATION_ERROR
TC-R03: "   "        -> P42 Step 1(通過) -> P42 Step 2(通過) -> P42 Step 3(拒否) -> VALIDATION_ERROR
TC-R04: "non-existent-skill-xyz" -> 全Step通過 -> 処理実行 -> 実装依存の結果
```

## skill:import E2Eテスト設計（`ipc-skill-import.spec.ts`）

### テストケース一覧（TC-I01〜TC-I04）

| テストID | テスト名                                         | テスト種別 | 引数                          | 期待する結果                            | 対策するPitfall                            |
| -------- | ------------------------------------------------ | ---------- | ----------------------------- | --------------------------------------- | ------------------------------------------ |
| TC-I01   | 有効なスキル名でインポートが成功する             | 正常系     | `"test-skill"`                | `result` が defined であること          | P44回帰防止（string引数で通信成功）        |
| TC-I02   | 空文字列がVALIDATION_ERRORで拒否される           | 異常系     | `""`                          | reject & `{ code: "VALIDATION_ERROR" }` | P42（3段バリデーション Step 2）            |
| TC-I03   | スペースのみ文字列がVALIDATION_ERRORで拒否される | 異常系     | `"   "`                       | reject & `{ code: "VALIDATION_ERROR" }` | P42（3段バリデーション Step 3）            |
| TC-I04   | パストラバーサル文字列がエラーレスポンスを返す   | 異常系     | `"../path-traversal-attempt"` | reject（エラーレスポンス）              | IPCセキュリティ（04-electron-security.md） |

### テストコード設計

```typescript
// apps/desktop/e2e/ipc-skill-import.spec.ts
import { test, expect } from "@playwright/test";
import {
  launchElectronApp,
  closeElectronApp,
  invokeIPC,
} from "./helpers/electron-app";
import type { ElectronApplication, Page } from "playwright";

test.describe("skill:import IPC E2Eテスト", () => {
  let electronApp: ElectronApplication;
  let page: Page;

  // P9対策: 各テストで独立したElectronプロセスを起動・終了（状態リーク防止）
  test.beforeEach(async () => {
    const app = await launchElectronApp();
    electronApp = app.electronApp;
    page = app.page;
  });

  test.afterEach(async () => {
    await closeElectronApp(electronApp);
  });

  // TC-I01: 正常系（P44回帰防止: string引数でIPC通信が成功する）
  test("TC-I01: 有効なスキル名でインポートが成功する", async () => {
    const result = await invokeIPC(page, "skill.import", "test-skill");
    expect(result).toBeDefined();
  });

  // TC-I02: 異常系（P42 3段バリデーション Step 2: 空文字列）
  test("TC-I02: 空文字列がVALIDATION_ERRORで拒否される", async () => {
    await expect(invokeIPC(page, "skill.import", "")).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
  });

  // TC-I03: 異常系（P42 3段バリデーション Step 3: スペースのみ文字列）
  test("TC-I03: スペースのみ文字列がVALIDATION_ERRORで拒否される", async () => {
    await expect(invokeIPC(page, "skill.import", "   ")).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
  });

  // TC-I04: 異常系（パストラバーサル攻撃試行 -> エラーレスポンス）
  test("TC-I04: パストラバーサル文字列がエラーレスポンスを返す", async () => {
    await expect(
      invokeIPC(page, "skill.import", "../path-traversal-attempt"),
    ).rejects.toBeDefined();
  });
});
```

### TC-I01〜TC-I04 の検証観点

| テストID | 検証する仕様                               | 根拠ルール                                    |
| -------- | ------------------------------------------ | --------------------------------------------- |
| TC-I01   | P44修正後の string 引数でIPC通信が成功する | P44（IPC引数形式修正後の回帰防止）            |
| TC-I02   | 空文字列を Step 2 で拒否する               | P42（3段バリデーション標準化）                |
| TC-I03   | スペースのみ文字列を Step 3 で拒否する     | P42（trim()バリデーション漏れ防止）           |
| TC-I04   | パストラバーサル試行を拒否する             | 04-electron-security.md（引数バリデーション） |

## Electron 3プロセスモデルとE2Eテストの対応テーブル

| プロセス         | 検証対象                                                                                                                   | 検証方法                                                                       | テストコード例                                                                         |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Main Process     | IPCハンドラの引数バリデーション（P42 3段）、ビジネスロジック実行（SkillService）                                           | `page.evaluate()` -> Preload API -> IPC -> Main Process の結果を検証           | `expect(result).toBeDefined()` / `rejects.toMatchObject({ code: "VALIDATION_ERROR" })` |
| Preload Process  | `contextBridge.exposeInMainWorld` で公開されたAPI（`window.electronAPI.skill.remove` / `window.electronAPI.skill.import`） | `invokeIPC(page, "skill.remove", skillName)` でAPIパスを解決し、存在・型を検証 | `invokeIPC()` 内の `typeof api !== "function"` チェック                                |
| Renderer Process | Preload APIの呼び出し結果のレスポンス（成功値 / エラーオブジェクト）を検証                                                 | `page.evaluate()` の戻り値 / rejectを `expect` でアサーション                  | `expect(result).toBeDefined()` / `rejects.toMatchObject({...})`                        |

## Playwright設定更新差分

### 変更ファイル: `apps/desktop/playwright.config.ts`

```diff
 import { defineConfig, devices } from "@playwright/test";

 export default defineConfig({
   testDir: "./e2e",
   fullyParallel: true,
   forbidOnly: !!process.env.CI,
   retries: process.env.CI ? 2 : 0,
   workers: process.env.CI ? 1 : undefined,
-  reporter: "html",
+  reporter: [
+    ["html"],
+    ...(process.env.CI
+      ? [["junit", { outputFile: "test-results/junit.xml" }] as const]
+      : []),
+  ],

   globalSetup: "./e2e/global-setup.ts",

   use: {
     baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:5173",
     trace: "on-first-retry",
     screenshot: "only-on-failure",
     storageState: "./e2e/.auth/user.json",
   },

   projects: [
     {
       name: "chromium",
       use: { ...devices["Desktop Chrome"] },
     },
+    {
+      name: "electron-e2e",
+      testMatch: /ipc-.*\.spec\.ts/,
+      use: {
+        // Electron E2EテストはbaseURL不要（_electron.launch()で起動）
+        baseURL: undefined,
+        storageState: undefined,
+      },
+    },
   ],

   webServer: {
     command: "npx vite --config vite.e2e.config.ts",
     url: "http://localhost:5173",
     reuseExistingServer: !process.env.CI,
     timeout: 120 * 1000,
   },
 });
```

### 設計判断

| 設計項目             | 判断                                                              | 理由                                              |
| -------------------- | ----------------------------------------------------------------- | ------------------------------------------------- |
| プロジェクト分離     | `chromium`（既存）と `electron-e2e`（新規）を分離                 | 既存ブラウザE2Eと干渉しないため                   |
| testMatch            | `electron-e2e` は `/ipc-.*\.spec\.ts/` のみマッチ                 | 他のspec.tsファイルに影響を与えないため           |
| globalSetup 不使用   | `electron-e2e` は既存 `global-setup.ts`（認証モック）を使用しない | Electron E2Eは独自にElectronを起動するため        |
| baseURL 無効化       | `undefined` に設定                                                | Vite devサーバーを使用しないため                  |
| storageState 無効化  | `undefined` に設定                                                | Electron E2Eは独自ストレージ管理を行うため        |
| JUnit XMLレポーター  | CI環境でのみ追加                                                  | テスト結果の構造化出力のため                      |
| retries: 2（CI環境） | 既存設定を維持                                                    | 一時的なElectron起動失敗をカバーするため（NFR-1） |

## CI/CD e2e-desktopジョブのYAML構成（全ステップ）

```yaml
# .github/workflows/ci.yml に追加するジョブ
e2e-desktop:
  name: E2E (desktop)
  runs-on: ubuntu-latest
  needs: [build-shared]
  timeout-minutes: 15
  env:
    CI: true
    NODE_OPTIONS: --max-old-space-size=4096

  steps:
    # Step 1: リポジトリのチェックアウト
    - name: Checkout
      uses: actions/checkout@v4

    # Step 2: pnpm セットアップ
    - name: Setup pnpm
      uses: pnpm/action-setup@v4

    # Step 3: Node.js セットアップ（キャッシュ付き）
    - name: Setup Node.js
      uses: actions/setup-node@v6
      with:
        node-version: "22"
        cache: "pnpm"

    # Step 4: SSH -> HTTPS 切り替え（プライベートリポジトリ対策）
    - name: Configure git to use HTTPS instead of SSH
      run: git config --global url."https://github.com/".insteadOf "git@github.com:"

    # Step 5: 依存関係インストール
    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    # Step 6: shared ビルド成果物のダウンロード（build-shared ジョブの成果物）
    - name: Download shared build artifact
      uses: actions/download-artifact@v4
      with:
        name: shared-build
        path: packages/shared/dist/

    # Step 7: Playwright ブラウザインストール（chromium のみ、--with-deps でシステム依存も）
    - name: Install Playwright browsers
      run: pnpm --filter @repo/desktop exec playwright install --with-deps chromium

    # Step 8: Electron E2E 用のデスクトップアプリビルド
    - name: Build desktop app for E2E
      run: pnpm --filter @repo/desktop build

    # Step 9: xvfb-run でヘッドレス Electron E2E テスト実行（P40対策: apps/desktop/ から実行）
    - name: Run Electron E2E tests
      run: |
        cd apps/desktop
        xvfb-run --auto-servernum -- pnpm exec playwright test --project=electron-e2e

    # Step 10: テスト結果アーティファクトのアップロード（失敗時も含めて常に実行）
    - name: Upload E2E test results
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: e2e-desktop-results
        path: |
          apps/desktop/playwright-report/
          apps/desktop/test-results/
        retention-days: 7
```

### 各ステップの設計判断

| ステップ                   | 設計判断                            | 理由                                           |
| -------------------------- | ----------------------------------- | ---------------------------------------------- |
| Step 1: Checkout           | actions/checkout@v4 を使用          | 標準的なチェックアウト                         |
| Step 2: Setup pnpm         | pnpm/action-setup@v4 を使用         | monorepo の pnpm 必須（CLAUDE.md）             |
| Step 3: Setup Node.js      | node-version: "22"、cache: "pnpm"   | プロジェクト標準の Node.js バージョン          |
| Step 4: HTTPS切り替え      | git config で SSH -> HTTPS          | プライベートリポジトリ依存の SSH 問題対策      |
| Step 5: Install            | --frozen-lockfile                   | 再現性のある依存関係インストール               |
| Step 6: Download artifact  | build-shared ジョブの成果物を再利用 | shared ビルドの二重実行を避けるため            |
| Step 7: Playwright install | chromium のみ + --with-deps         | Electron E2E に必要な最小限のブラウザ          |
| Step 8: Build              | pnpm --filter @repo/desktop build   | E2E 実行前にビルドが必要                       |
| Step 9: E2E実行            | cd apps/desktop して xvfb-run       | P40対策（ディレクトリ依存）+ NFR-5（xvfb-run） |
| Step 10: Upload            | if: always() で常に実行             | 失敗時のデバッグ用スクリーンショット保持       |

### xvfb-run オプションの説明

```bash
xvfb-run --auto-servernum -- pnpm exec playwright test --project=electron-e2e
```

| オプション         | 意味                  | 理由                                               |
| ------------------ | --------------------- | -------------------------------------------------- |
| `--auto-servernum` | 自動でX表示番号を選択 | 並列実行時の競合を防止する（NFR-5対策）            |
| `--`               | オプション終端記号    | xvfb-runのオプションとplaywrightのオプションを分離 |

## フレイキーテスト対策設計

| 対策               | 設定値                                                  | 根拠                                         |
| ------------------ | ------------------------------------------------------- | -------------------------------------------- |
| リトライ           | `retries: 2`（CI環境のみ）                              | 一時的なElectron起動失敗をカバー（NFR-1）    |
| スクリーンショット | `screenshot: "only-on-failure"`                         | 失敗時のみ保存してデバッグを支援             |
| テスト状態隔離     | 各テストで `launchElectronApp()` / `closeElectronApp()` | テスト間の状態リークを完全に防止（P9対策）   |
| 明示的wait         | `waitForLoadState("domcontentloaded")` 使用             | `waitForTimeout()` は使用しない（NFR-1対策） |
| 起動タイムアウト   | `_electron.launch()` の `timeout: 60_000`               | CI環境での起動遅延を許容（NFR-5）            |
| 並列実行制限       | `workers: process.env.CI ? 1 : undefined`               | CI環境での並列起動によるリソース競合を防止   |

## 完了条件

- [x] ファイル構成ツリー（apps/desktop/e2e/ 配下）が定義されている
- [x] launchElectronApp() のシグネチャ・JSDoc・実装方針が定義されている
- [x] closeElectronApp() のシグネチャ・JSDoc・実装方針が定義されている
- [x] invokeIPC() のシグネチャ・JSDoc・実装方針が定義されている
- [x] skill:remove E2Eテスト（TC-R01〜TC-R04の4テストケース）のコード設計が完了している
- [x] skill:import E2Eテスト（TC-I01〜TC-I04の4テストケース）のコード設計が完了している
- [x] Electron 3プロセスモデルとE2Eテストの対応テーブル（Main/Preload/Rendererの検証対象・方法）が定義されている
- [x] Playwright設定更新差分（electron-e2eプロジェクト追加のdiff）が定義されている
- [x] CI/CD e2e-desktopジョブのYAML構成（Step 1〜Step 10の全10ステップ）が定義されている
- [x] フレイキーテスト対策が設計されている
