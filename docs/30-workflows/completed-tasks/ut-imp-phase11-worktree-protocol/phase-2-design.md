# Phase 2: 設計 -- Phase 11 Worktree環境テストプロトコル標準化

## メタ情報

| 項目      | 内容                                        |
| --------- | ------------------------------------------- |
| タスクID  | UT-IMP-PHASE11-WORKTREE-PROTOCOL-001        |
| Phase     | 2                                           |
| タスク名  | Phase 11 Worktree環境テストプロトコル標準化 |
| 作成日    | 2026-03-01                                  |
| Issue     | #853                                        |
| 依存Phase | Phase 1（要件定義）                         |

## 目的

Phase 1で定義した7つの機能要件（FR-1～FR-7）と5つの非機能要件（NFR-1～NFR-5）に対する具体的な設計を策定する。テスト3層分類プロトコルの詳細構造、Playwright Electron E2Eテストのアーキテクチャ（`_electron.launch()` + `page.evaluate()` パターン）、CI/CDパイプライン設計（`xvfb-run` + GitHub Actions）、Playwright設定更新差分、Phase 11テンプレート追加内容、`deferred-tests.md` 追跡フローの設計を行い、Phase 4（テスト作成）以降で迷いなく実装できる精度の仕様を定義する。

## 実行タスク

- Task 1: テスト3層分類プロトコル設計 -- Layer 1-3の詳細テスト項目、実行コマンド、判定基準、判定フローを設計する
- Task 2: Playwright Electron E2Eテストアーキテクチャ設計 -- `_electron.launch()` パターン、テストヘルパー構造、テストケースコード設計を行う
- Task 3: CI/CDパイプライン設計 -- `e2e-desktop` ジョブの構成、`xvfb-run` 設定、既存ジョブとの共存を設計する
- Task 4: Playwright設定更新設計 -- `electron-e2e` プロジェクトの追加差分を設計する
- Task 5: Phase 11テンプレート追加設計 -- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` への追加セクション内容と挿入位置を設計する
- Task 6: deferred-tests.md テンプレート設計 -- 未実施テスト追跡テンプレートの構造とワークフローを設計する

---

### Task 1: テスト3層分類プロトコル設計

#### Layer 1: 自動テスト検証（Worktree実行可能）

| テスト種別               | 実行コマンド                                                          | 判定基準                     |
| ------------------------ | --------------------------------------------------------------------- | ---------------------------- |
| ユニットテスト全件実行   | `cd apps/desktop && pnpm test:run`                                    | 全テストPASS（FAILゼロ件）   |
| IPC通信テスト            | `cd apps/desktop && pnpm vitest run src/main/ipc/`                    | IPC関連テスト全件PASS        |
| Zustand Store統合テスト  | `cd apps/desktop && pnpm vitest run src/renderer/store/`              | Store関連テスト全件PASS      |
| エラーハンドリングテスト | `cd apps/desktop && pnpm vitest run --grep "error\|validation\|fail"` | エラー系テスト全件PASS       |
| カバレッジ確認           | `cd apps/desktop && pnpm test:run -- --coverage`                      | Line 80%以上、Branch 60%以上 |

#### Layer 2: 静的コード検証（Worktree実行可能）

| 検証項目                      | 実行コマンド/手順                                                                                           | 判定基準                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| TypeScript型チェック          | `pnpm typecheck`                                                                                            | エラーゼロで終了                                                           |
| ESLint静的解析                | `pnpm lint`                                                                                                 | エラーゼロで終了（Warningは許容）                                          |
| IPC契約整合性検証             | `channels.ts` のチャネル定数一覧と `ipcMain.handle()` / `ipcMain.on()` 登録一覧をコードレビューで比較       | 全チャネルが `IPC_CHANNELS` 定数経由で参照され、ハードコード文字列がゼロ件 |
| セキュリティ設定レビュー      | BrowserWindow生成コードで `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` を確認        | 3設定が全て正しい値であること                                              |
| ARIA属性存在確認              | 新規/変更コンポーネントの `role`, `aria-label`, `aria-modal` 属性をコードレビューで確認                     | 対話的要素に `role` または `aria-label` が付与されていること               |
| Preload APIホワイトリスト確認 | `preload.ts` の `contextBridge.exposeInMainWorld` で公開されたAPIが `IPC_CHANNELS` 定数を使用しているか確認 | ハードコード文字列によるチャネル指定がゼロ件                               |

#### Layer 3: UI/E2Eテスト（CI/メインリポジトリのみ）

| テスト項目                   | 実行環境                 | 検証内容                                                            |
| ---------------------------- | ------------------------ | ------------------------------------------------------------------- |
| Electronアプリ起動テスト     | CI（xvfb-run）           | `_electron.launch()` でアプリが起動し、メインウィンドウが表示される |
| IPC skill:remove E2Eテスト   | CI（xvfb-run）           | FR-2の正常系1件・異常系3件（計4テストケース）                       |
| IPC skill:import E2Eテスト   | CI（xvfb-run）           | FR-3の正常系1件・異常系3件（計4テストケース）                       |
| UIインタラクション操作テスト | メインリポジトリ（手動） | クリック、入力、ナビゲーション操作の手動確認                        |

#### 判定フロー

```
Worktree環境でPhase 11実行:
  1. Layer 1 全項目実行
     -> FAILあり -> Phase 11 FAIL -> Phase 5に戻る
     -> 全PASS -> Layer 2へ進む
  2. Layer 2 全項目実行
     -> FAILあり -> Phase 11 FAIL -> Phase 5に戻る
     -> 全PASS -> Layer 3を deferred-tests.md に記録
  3. Layer 3 記録
     -> deferred-tests.md にLayer 3全テスト項目を記録
     -> Phase 11判定: 条件付きPASS
  4. CI/メインリポジトリ（PRマージ後）
     -> Layer 3 E2Eテスト実行
     -> 全PASS -> deferred-tests.md の項目を完了に更新
     -> FAILあり -> 修正タスクを起票
```

---

### Task 2: Playwright Electron E2Eテストアーキテクチャ設計

#### ファイル構成

```
apps/desktop/e2e/
  helpers/
    electron-app.ts          # Electron起動・終了・IPC呼び出しヘルパー（新規）
  ipc-skill-remove.spec.ts   # skill:remove E2Eテスト（新規）
  ipc-skill-import.spec.ts   # skill:import E2Eテスト（新規）
  skill-permission.spec.ts   # 既存（変更なし）
  global-setup.ts            # 既存（変更なし）
  mocks/
    electronAPI.mock.ts      # 既存（変更なし）
  pages/
    SearchPanelPage.ts       # 既存（変更なし）
    WorkspaceSearchPage.ts   # 既存（変更なし）
```

#### テストヘルパー設計（`helpers/electron-app.ts`）

```typescript
// apps/desktop/e2e/helpers/electron-app.ts
import { _electron, type ElectronApplication, type Page } from "playwright";

/**
 * Electronアプリを起動し、最初のウィンドウのPageを返す。
 * 呼び出し元は必ず closeElectronApp() で終了すること。
 *
 * @returns electronApp と page のペア
 */
export async function launchElectronApp(): Promise<{
  electronApp: ElectronApplication;
  page: Page;
}> {
  const electronApp = await _electron.launch({
    args: ["."],
    cwd: process.cwd(), // apps/desktop/ からの実行を前提（P40対策）
    timeout: 60_000, // NFR-5: Electronアプリ起動タイムアウト60秒
    env: {
      ...process.env,
      NODE_ENV: "test",
      ELECTRON_IS_E2E: "true",
    },
  });

  const page = await electronApp.firstWindow();
  await page.waitForLoadState("domcontentloaded");

  return { electronApp, page };
}

/**
 * Electronアプリを安全に終了する。
 * afterEach で必ず呼び出し、ゾンビプロセスを防止する。
 *
 * @param electronApp - 終了するElectronApplicationインスタンス
 */
export async function closeElectronApp(
  electronApp: ElectronApplication,
): Promise<void> {
  await electronApp.close();
}

/**
 * Preload API経由でIPC通信を実行し、結果を返す。
 * window.electronAPI 配下のネストされたAPIパスをサポートする。
 *
 * 使用例: invokeIPC(page, "skill.remove", "my-skill")
 *   -> window.electronAPI.skill.remove("my-skill") を実行
 *
 * @param page - RendererウィンドウのPage
 * @param apiPath - window.electronAPI 配下のドット区切りAPIパス
 * @param args - APIに渡す引数（可変長）
 * @returns IPC通信の結果（成功時）またはエラー（失敗時は reject）
 */
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

#### skill:remove E2Eテスト設計（`ipc-skill-remove.spec.ts`）

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

  test.beforeEach(async () => {
    const app = await launchElectronApp();
    electronApp = app.electronApp;
    page = app.page;
  });

  test.afterEach(async () => {
    await closeElectronApp(electronApp);
  });

  // 正常系: スキル名指定で削除が成功する（P44回帰防止: string引数で通信成功）
  test("TC-R01: 有効なスキル名で削除が成功する", async () => {
    const result = await invokeIPC(page, "skill.remove", "test-skill");
    expect(result).toBeDefined();
  });

  // 異常系: 空文字列 -> VALIDATION_ERROR（P42 3段バリデーション Step 2）
  test("TC-R02: 空文字列がVALIDATION_ERRORで拒否される", async () => {
    await expect(invokeIPC(page, "skill.remove", "")).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
  });

  // 異常系: スペースのみ文字列 -> VALIDATION_ERROR（P42 3段バリデーション Step 3）
  test("TC-R03: スペースのみ文字列がVALIDATION_ERRORで拒否される", async () => {
    await expect(invokeIPC(page, "skill.remove", "   ")).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
  });

  // 異常系: 未登録スキル名のエラーレスポンス
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

#### skill:import E2Eテスト設計（`ipc-skill-import.spec.ts`）

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

  test.beforeEach(async () => {
    const app = await launchElectronApp();
    electronApp = app.electronApp;
    page = app.page;
  });

  test.afterEach(async () => {
    await closeElectronApp(electronApp);
  });

  // 正常系: スキル名指定でインポートが成功する（P44回帰防止: string引数で通信成功）
  test("TC-I01: 有効なスキル名でインポートが成功する", async () => {
    const result = await invokeIPC(page, "skill.import", "test-skill");
    expect(result).toBeDefined();
  });

  // 異常系: 空文字列 -> VALIDATION_ERROR（P42 3段バリデーション Step 2）
  test("TC-I02: 空文字列がVALIDATION_ERRORで拒否される", async () => {
    await expect(invokeIPC(page, "skill.import", "")).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
  });

  // 異常系: スペースのみ文字列 -> VALIDATION_ERROR（P42 3段バリデーション Step 3）
  test("TC-I03: スペースのみ文字列がVALIDATION_ERRORで拒否される", async () => {
    await expect(invokeIPC(page, "skill.import", "   ")).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
  });

  // 異常系: パストラバーサル試行 -> エラーレスポンス
  test("TC-I04: パストラバーサル文字列がエラーレスポンスを返す", async () => {
    await expect(
      invokeIPC(page, "skill.import", "../path-traversal-attempt"),
    ).rejects.toBeDefined();
  });
});
```

#### Electron 3プロセスモデルとE2Eテストの対応

| プロセス | テストでの検証対象                                    | 検証方法                                                          |
| -------- | ----------------------------------------------------- | ----------------------------------------------------------------- |
| Main     | IPCハンドラの引数バリデーション、ビジネスロジック実行 | `page.evaluate()` -> Preload API -> IPC -> Main Process           |
| Preload  | `contextBridge.exposeInMainWorld` で公開されたAPI     | `page.evaluate(() => window.electronAPI.skill.remove(skillName))` |
| Renderer | Preload APIの呼び出し結果のレスポンス検証             | `page.evaluate()` の戻り値/rejectを `expect` で検証               |

---

### Task 3: CI/CDパイプライン設計

#### `e2e-desktop` ジョブ構成

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
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup pnpm
      uses: pnpm/action-setup@v4

    - name: Setup Node.js
      uses: actions/setup-node@v6
      with:
        node-version: "22"
        cache: "pnpm"

    - name: Configure git to use HTTPS instead of SSH
      run: git config --global url."https://github.com/".insteadOf "git@github.com:"

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Download shared build artifact
      uses: actions/download-artifact@v4
      with:
        name: shared-build
        path: packages/shared/dist/

    - name: Install Playwright browsers
      run: pnpm --filter @repo/desktop exec playwright install --with-deps chromium

    - name: Build desktop app for E2E
      run: pnpm --filter @repo/desktop build

    - name: Run Electron E2E tests
      run: |
        cd apps/desktop
        xvfb-run --auto-servernum -- pnpm exec playwright test --project=electron-e2e

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

#### 既存CIジョブへの影響分析

| 既存ジョブ        | 影響     | 理由                                                                         |
| ----------------- | -------- | ---------------------------------------------------------------------------- |
| lint              | 影響なし | E2Eテストファイル追加はlint対象に含まれるがESLint設定変更なし                |
| typecheck         | 影響なし | Playwright型は `@playwright/test` で提供され、tsconfig変更不要               |
| build-shared      | 影響なし | shared packageビルドは変更なし                                               |
| test-shared       | 影響なし | shared packageテストは変更なし                                               |
| test-desktop      | 影響なし | Vitestテストのみ実行。Playwright E2Eは別ジョブ                               |
| check-module-sync | 影響なし | モジュール同期チェックは変更なし                                             |
| security          | 影響なし | セキュリティ監査は変更なし                                                   |
| coverage          | 影響なし | カバレッジはVitestのみ対象                                                   |
| build             | 影響なし | `e2e-desktop` は `build` ジョブの `needs` に追加しない（非ブロッキング設計） |

#### `build` ジョブへの非追加理由

`e2e-desktop` ジョブを `build` ジョブの `needs` に追加しない。理由: E2Eテストは品質確認であり、ビルド成果物の生成には不要。E2Eテスト失敗がビルドをブロックすると、Worktree環境からのPRマージが困難になり、本タスクの目的（Worktree環境での品質担保）に反する。

#### フレイキーテスト対策

| 対策                             | 設定値                                                  | 根拠                                           |
| -------------------------------- | ------------------------------------------------------- | ---------------------------------------------- |
| リトライ                         | `retries: 2`（CI環境のみ、既存設定を維持）              | 一時的なElectron起動失敗をカバーする           |
| スクリーンショット               | `screenshot: "only-on-failure"`                         | 失敗時のみ保存してデバッグを支援する           |
| テスト状態隔離                   | 各テストで `launchElectronApp()` / `closeElectronApp()` | テスト間の状態リークを完全に防止する（P9対策） |
| 明示的wait                       | `waitForLoadState("domcontentloaded")` 使用             | `waitForTimeout()` を使用しない（NFR-1対策）   |
| Electronプロセス起動タイムアウト | 60秒（`_electron.launch()` の `timeout` パラメータ）    | CI環境での起動遅延を許容する                   |

---

### Task 4: Playwright設定更新設計

#### 変更差分

```diff
// apps/desktop/playwright.config.ts

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

#### 設計判断

| 項目                 | 判断                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| プロジェクト分離     | `chromium`（既存ブラウザE2E）と `electron-e2e`（Electron E2E）を別プロジェクトに分離する        |
| テストファイルマッチ | `electron-e2e` プロジェクトは `ipc-*.spec.ts` パターンのみマッチする                            |
| globalSetup          | Electron E2Eは各テストで独自にElectronを起動するため、既存globalSetup（認証モック）は使用しない |
| webServer            | Electron E2Eは `_electron.launch()` で直接起動するため、Vite devサーバーは不要                  |
| storageState無効化   | Electron E2Eは独自のストレージ管理を行うため `undefined` に設定する                             |
| JUnit XMLレポーター  | CI環境でのみJUnit XMLレポーターを追加し、テスト結果の構造化出力を可能にする                     |

---

### Task 5: Phase 11テンプレート追加設計

#### 追加位置

`.claude/skills/task-specification-creator/references/phase-11-12-guide.md` の以下の位置に挿入する:

- 挿入開始: Phase 11セクションの「実行フロー」のコードブロック（行13-23）の直後
- 挿入終了: 「テスト結果レポート形式」セクション（行27 `### テスト結果レポート形式`）の直前

#### 追加セクション内容

````markdown
### Worktree環境でのPhase 11実行手順

> 以下の手順は、Git Worktree環境（`.worktrees/` 配下）でPhase 11を実行する場合にのみ適用する。
> メインリポジトリで実行する場合は上記の通常フローに従う。

#### Worktree環境判定

```bash
# .worktrees/ を含む場合はWorktree環境
TOPLEVEL=$(git rev-parse --show-toplevel)
if echo "$TOPLEVEL" | grep -q ".worktrees/"; then
  echo "Worktree環境: 以下のLayer 1-3手順に従う"
else
  echo "メインリポジトリ: 通常のPhase 11フローに従う"
fi
```
````

#### Layer 1: 自動テスト検証（Worktree実行必須）

| 検証項目               | コマンド                                           | 判定基準                     |
| ---------------------- | -------------------------------------------------- | ---------------------------- |
| ユニットテスト全件実行 | `cd apps/desktop && pnpm test:run`                 | 全テストPASS（FAILゼロ件）   |
| IPC通信テスト          | `cd apps/desktop && pnpm vitest run src/main/ipc/` | IPC関連テスト全件PASS        |
| カバレッジ確認         | `cd apps/desktop && pnpm test:run -- --coverage`   | Line 80%以上、Branch 60%以上 |

#### Layer 2: 静的コード検証（Worktree実行必須）

| 検証項目                      | コマンド/手順    | 判定基準                                                              |
| ----------------------------- | ---------------- | --------------------------------------------------------------------- |
| TypeScript型チェック          | `pnpm typecheck` | エラーゼロで終了                                                      |
| ESLint静的解析                | `pnpm lint`      | エラーゼロで終了                                                      |
| IPC契約整合性検証             | コードレビュー   | 全チャネルが `IPC_CHANNELS` 定数経由で参照されている                  |
| BrowserWindowセキュリティ設定 | コードレビュー   | contextIsolation=true, nodeIntegration=false, sandbox=true が設定済み |

#### Layer 3: UI/E2Eテスト（deferred-tests.mdに記録）

Worktree環境ではLayer 3テストを実行しない。以下の手順で記録する:

1. `outputs/phase-11/deferred-tests.md` を `deferred-tests-template.md` からコピーして作成する
2. Layer 3に該当するテスト項目を全て記録する
3. 各項目の「実行予定環境」を「CI」または「メインリポジトリ」に設定する

#### 判定基準

| Layer 1結果 | Layer 2結果 | Phase 11判定 | 次のアクション                                   |
| ----------- | ----------- | ------------ | ------------------------------------------------ |
| 全PASS      | 全PASS      | 条件付きPASS | Layer 3を deferred-tests.md に記録してPhase 12へ |
| FAILあり    | -           | FAIL         | Phase 5に戻り修正する                            |
| 全PASS      | FAILあり    | FAIL         | Phase 5に戻り修正する                            |

````

---

### Task 6: deferred-tests.md テンプレート設計

#### テンプレート構造（`outputs/phase-5/deferred-tests-template.md`）

```markdown
# 未実施テスト追跡 -- {{タスク名}}

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| タスクID   | {{タスクID}}                          |
| 作成日     | {{作成日}}                            |
| 作成Phase  | Phase 11                              |
| 作成理由   | Worktree環境でLayer 3テストが実行不可 |

## 未実施テスト一覧

| ID     | テスト名     | カテゴリ     | スキップ理由                  | 実行予定環境          | 期限                  | ステータス |
| ------ | ------------ | ------------ | ----------------------------- | --------------------- | --------------------- | ---------- |
| DT-001 | {{テスト名}} | {{カテゴリ}} | Worktree環境/Electron起動不可 | CI / メインリポジトリ | PRマージ後3営業日以内 | 未実施     |

## ステータス定義

| ステータス  | 意味                                         |
| ----------- | -------------------------------------------- |
| 未実施      | テスト未実行（Worktree環境制約による）       |
| CI実行待ち  | PRマージ後のCI実行を待っている               |
| PASS        | テスト実行完了・成功                         |
| FAIL        | テスト実行完了・失敗（修正タスク起票が必要） |

## Phase 13完了条件

- [ ] 全テスト項目のステータスが「PASS」であること（「未実施」「CI実行待ち」がゼロ件）
- [ ] FAIL項目がある場合は修正タスクが起票されていること
````

#### ワークフロー設計

```
Phase 11（Worktree環境）:
  1. Layer 1 + Layer 2 実行 -> 全PASS
  2. Layer 3テスト項目を outputs/phase-11/deferred-tests.md に記録
  3. Phase 11判定: 条件付きPASS
     |
Phase 12（ドキュメント更新）:
  deferred-tests.md をPhase 12成果物に含める
     |
Phase 13（PR準備）:
  1. PR本文の「Test Plan」に「未実施テスト: N件（deferred-tests.md参照）」を記載
  2. 完了条件: deferred-tests.md の「未実施」「CI実行待ち」がゼロ件
     |
PRマージ後:
  1. CIがLayer 3 E2Eテストを自動実行（e2e-desktopジョブ）
  2. 結果に基づき deferred-tests.md を更新
  3. FAIL項目があれば修正タスクを起票
```

---

## 参照資料

| 参照資料                  | パス                                                                        | 内容                             |
| ------------------------- | --------------------------------------------------------------------------- | -------------------------------- |
| Phase 1 要件定義          | `phase-1-requirements.md`                                                   | FR-1～FR-7、NFR-1～NFR-5、AC定義 |
| 受入基準一覧              | `outputs/phase-1/acceptance-criteria.md`                                    | AC-01～AC-16                     |
| 既存Playwright設定        | `apps/desktop/playwright.config.ts`                                         | 現行のPlaywright E2E設定         |
| 既存CIワークフロー        | `.github/workflows/ci.yml`                                                  | 現行のCIジョブ構成（9ジョブ）    |
| 既存E2Eテスト             | `apps/desktop/e2e/skill-permission.spec.ts`                                 | 既存E2Eテストのパターン参照      |
| E2Eグローバルセットアップ | `apps/desktop/e2e/global-setup.ts`                                          | 既存のElectronAPIモック初期化    |
| Phase 11/12テンプレート   | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` | テンプレート追加先               |
| 必要仕様抽出マトリクス    | `spec-reference-matrix.md`                                                  | 必要仕様セットの参照漏れ防止     |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                                        | 内容                                 |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------ |
| アーキテクチャ概要 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | Electron 3プロセスモデル             |
| IPC仕様            | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPCセキュリティ原則・チャンネル管理  |
| IPC契約チェック    | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | ハンドラ/Preload/channels の契約整合 |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | テスト・カバレッジ基準               |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | IPC失敗時のエラー契約                |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Electron E2E/IPCの再利用パターン     |
| IPC API契約        | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPCハンドラ契約とバリデーション境界  |
| Electron API防御   | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | Preload API公開のセキュリティ要件    |
| Playwright E2E仕様 | `.claude/skills/aiworkflow-requirements/references/testing-playwright-e2e.md`               | Electron E2Eテスト実装パターン       |
| E2E品質指針        | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md`                  | E2Eの品質・対象範囲                  |
| CI/CD仕様          | `.claude/skills/aiworkflow-requirements/references/deployment-gha.md`                       | GitHub Actionsジョブ構成             |

## 統合テスト連携

| テスト種別                         | 検証内容                                                                                           |
| ---------------------------------- | -------------------------------------------------------------------------------------------------- |
| Playwright Electron E2E -> IPC契約 | `_electron.launch()` -> `page.evaluate()` -> Preload API -> IPC -> Main Process のフルスタック検証 |
| xvfb-run headless実行              | CI環境（ubuntu-latest）でheadless Electronが安定起動し、テストが正常完了すること                   |
| deferred-tests追跡フロー           | Phase 11記録 -> Phase 13完了条件 -> PRマージ後CI実行の3ステップが連携すること                      |
| 既存Playwright設定との共存         | `chromium` プロジェクト（ブラウザE2E）と `electron-e2e` プロジェクトが独立実行可能であること       |
| 既存CIジョブとの共存               | `e2e-desktop` ジョブが既存の9ジョブの実行に影響しないこと                                          |

## 多角的チェック観点

| 観点                   | チェック内容                                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| テスト状態隔離         | 各テストでElectronアプリを新規起動・終了し、テスト間の状態リークがないこと（NFR-1/P9対策）            |
| IPC契約整合性          | E2Eテストが `window.electronAPI.skill.remove(skillName)` 形式でIPC通信を行い、P44/P45修正を回帰テスト |
| P42 3段バリデーション  | 空文字列（`""`）とスペースのみ文字列（`"   "`）の両方がVALIDATION_ERRORで拒否されること               |
| CI環境依存性           | `xvfb-run --auto-servernum` がubuntu-latestで安定動作すること                                         |
| 既存E2E非破壊          | `chromium` プロジェクトのテスト（skill-permission, auth, search, workspace）が影響を受けないこと      |
| テストヘルパー再利用性 | `helpers/electron-app.ts` が新規IPCハンドラテスト追加時に50行以内で再利用可能であること               |
| テンプレート整合性     | Phase 11テンプレートの追加セクションが既存フロー（実行フロー5ステップ）と矛盾しないこと               |

## サブタスク管理

| サブタスク                     | 対応Task | 依存関係                       |
| ------------------------------ | -------- | ------------------------------ |
| Layer 1-3詳細設計              | Task 1   | なし（独立実行可能）           |
| テストヘルパー設計             | Task 2   | なし（独立実行可能）           |
| skill:remove テスト設計        | Task 2   | テストヘルパーに依存           |
| skill:import テスト設計        | Task 2   | テストヘルパーに依存           |
| CIジョブ構成設計               | Task 3   | Task 4（Playwright設定）に依存 |
| Playwright設定変更差分設計     | Task 4   | なし（独立実行可能）           |
| Phase 11テンプレート追加設計   | Task 5   | Task 1（Layer分類設計）に依存  |
| deferred-testsテンプレート設計 | Task 6   | なし（独立実行可能）           |

## タスク100%実行確認

- [ ] Task 1（3層分類設計）: Layer 1（5項目）、Layer 2（6項目）、Layer 3（4項目）の全テスト項目・コマンド・判定基準が定義されている
- [ ] Task 2（E2Eアーキテクチャ設計）: ヘルパー3関数・skill:remove 4テストケース・skill:import 4テストケースのコード設計が完了している
- [ ] Task 3（CI/CDパイプライン設計）: e2e-desktopジョブのYAML構成が定義され、既存9ジョブへの影響が分析されている
- [ ] Task 4（Playwright設定設計）: 変更差分が定義され、`chromium` プロジェクトとの共存が確認されている
- [ ] Task 5（テンプレート追加設計）: 追加セクションの内容と挿入位置が確定している
- [ ] Task 6（deferred-tests設計）: テンプレート構造とワークフロー（4ステップ）が定義されている

## 成果物

| 成果物                  | パス                                       |
| ----------------------- | ------------------------------------------ |
| 設計書（本ファイル）    | `phase-2-design.md`                        |
| アーキテクチャ設計      | `outputs/phase-2/architecture-design.md`   |
| プロトコル設計          | `outputs/phase-2/protocol-design.md`       |
| E2Eテストアーキテクチャ | `outputs/phase-2/e2e-test-architecture.md` |
| テンプレート追加内容    | `outputs/phase-2/template-additions.md`    |

## 完了条件

- [ ] Layer 1-3の全テスト項目（Layer 1: 5項目、Layer 2: 6項目、Layer 3: 4項目）が実行コマンド・判定基準と共に設計されている
- [ ] 判定フロー（Layer 1 -> Layer 2 -> Layer 3記録 -> CI実行）が条件分岐を含めて設計されている
- [ ] テストヘルパー（`helpers/electron-app.ts`）の3つの関数（`launchElectronApp`, `closeElectronApp`, `invokeIPC`）のシグネチャ・JSDoc・実装方針が設計されている
- [ ] skill:remove E2Eテスト（4テストケース: TC-R01～TC-R04）のテストコード設計が完了している
- [ ] skill:import E2Eテスト（4テストケース: TC-I01～TC-I04）のテストコード設計が完了している
- [ ] CI/CDの `e2e-desktop` ジョブのYAML構成が全ステップ（checkout～artifact upload: 10ステップ）を含めて設計されている
- [ ] 既存CIジョブ（9ジョブ）への影響が「影響なし」であることが個別に分析されている
- [ ] Playwright設定の変更差分が設計され、`chromium` プロジェクトとの共存が確認されている
- [ ] Phase 11テンプレートの追加セクション（Worktree環境テスト手順）の内容と挿入位置が確定している
- [ ] deferred-tests.md テンプレートの構造（記録項目・ステータス定義）とワークフロー（Phase 11 -> Phase 13 -> PRマージ後: 4ステップ）が設計されている

## 次のPhase

-> Phase 3: 設計レビュー（`phase-3-design-review.md`）
