# Phase 2: テストアーキテクチャ設計書

## 実行日時

2026-02-02

---

## 1. テスト環境構成

### 1.1 レイヤー構成

| レイヤー       | 技術            | 用途                     | 備考                   |
| -------------- | --------------- | ------------------------ | ---------------------- |
| テストランナー | Vitest          | テスト実行・アサーション | `vitest.config.ts`     |
| ブラウザ操作   | Playwright      | Electron起動・DOM操作    | `_electron` API使用    |
| モック注入     | addInitScript   | electronAPI モック       | window.electronAPI     |
| フィクスチャ   | E2Eフィクスチャ | test-skill等             | `__fixtures__/skills/` |

### 1.2 アーキテクチャ図

```
┌─────────────────────────────────────────────────────────────┐
│                    Vitest Test Runner                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              skillPermission.e2e.ts                  │   │
│  │  - describe("Skill Permission Dialog E2E")          │   │
│  │  - beforeAll/afterAll (Electron起動/終了)           │   │
│  │  - beforeEach (スキルインポート・選択)               │   │
│  │  - TC-1〜TC-5 テストケース                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Playwright Electron API                 │   │
│  │  - electron.launch({ args: [...] })                 │   │
│  │  - electronApp.firstWindow()                        │   │
│  │  - page.addInitScript() ← モック注入                │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                  │
└───────────────────────────│──────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Electron Application                       │
│  ┌────────────────────┐   ┌────────────────────────────┐   │
│  │   Main Process     │   │    Renderer Process        │   │
│  │  - preload.js      │   │  - ChatPanel               │   │
│  │  - skillService    │◀──│  - PermissionDialog        │   │
│  │  - electronAPI     │──▶│  - skillSlice (Zustand)    │   │
│  └────────────────────┘   └────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. テストファイル構成

### 2.1 ディレクトリ構造

```
apps/desktop/
├── src/
│   └── __tests__/
│       ├── __fixtures__/
│       │   └── skills/
│       │       ├── test-skill/
│       │       │   └── SKILL.md
│       │       ├── another-skill/
│       │       └── invalid-skill/
│       └── skillPermission.e2e.ts    # メインテストファイル
├── vite.e2e.config.ts                # E2E用Vite設定
└── vitest.config.ts                  # Vitest設定
```

### 2.2 ファイル責務

| ファイル                 | 責務         | 内容                                 |
| ------------------------ | ------------ | ------------------------------------ |
| `skillPermission.e2e.ts` | メインテスト | TC-1〜TC-5, エッジケース, A11yテスト |
| `vite.e2e.config.ts`     | E2E環境設定  | VITE_E2E_MODE, サーバー設定          |
| `__fixtures__/skills/`   | テストデータ | test-skill, another-skill            |

---

## 3. テストライフサイクル

### 3.1 ライフサイクルフック

| フック     | タイミング           | 処理内容                             |
| ---------- | -------------------- | ------------------------------------ |
| beforeAll  | テストスイート開始前 | Electronアプリ起動、firstWindow取得  |
| afterAll   | テストスイート終了後 | Electronアプリ終了                   |
| beforeEach | 各テスト開始前       | スキルインポート・選択、状態リセット |
| afterEach  | 各テスト終了後       | スクリーンショット保存（失敗時）     |

### 3.2 ライフサイクル実装

```typescript
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "vitest";
import { ElectronApplication, Page, _electron as electron } from "playwright";
import path from "path";

describe("Skill Permission Dialog E2E", () => {
  let electronApp: ElectronApplication;
  let page: Page;

  // ===== beforeAll: Electron起動 =====
  beforeAll(async () => {
    electronApp = await electron.launch({
      args: [path.join(__dirname, "../../dist/main/index.js")],
      env: {
        ...process.env,
        NODE_ENV: "test",
        TEST_SKILLS_DIR: path.join(__dirname, "__fixtures__/skills"),
      },
    });
    page = await electronApp.firstWindow();
    await page.waitForLoadState("domcontentloaded");
  });

  // ===== afterAll: Electron終了 =====
  afterAll(async () => {
    await electronApp?.close();
  });

  // ===== beforeEach: スキル初期化 =====
  beforeEach(async () => {
    // スキルインポート・選択
    await importAndSelectSkill(page, "test-skill");
  });

  // ===== afterEach: 失敗時スクリーンショット =====
  afterEach(async (testInfo) => {
    if (testInfo.status === "failed") {
      await page.screenshot({
        path: `screenshots/failed-${testInfo.name}-${Date.now()}.png`,
      });
    }
  });
});
```

---

## 4. テスト実行フロー

### 4.1 全体フロー

```
1. Vitest起動
   │
2. beforeAll: Electron起動
   │
3. ┌─ テストケースループ ─────────────────────┐
   │  │                                        │
   │  4. beforeEach: スキルインポート・選択    │
   │  │                                        │
   │  5. it(): テストケース実行               │
   │  │  - コマンド入力                        │
   │  │  - ダイアログ表示待機                  │
   │  │  - ユーザー操作（許可/拒否）          │
   │  │  - アサーション                        │
   │  │                                        │
   │  6. afterEach: スクリーンショット（失敗時）│
   │                                           │
   └───────────────────────────────────────────┘
   │
7. afterAll: Electron終了
```

### 4.2 テストケース実行フロー（TC-1例）

```
TC-1: 権限ダイアログ表示

1. beforeEach完了（スキル選択済み）
   │
2. コマンド入力
   page.fill('[data-testid="chat-input"]', 'Run dangerous command')
   │
3. Enter送信
   page.press('[data-testid="chat-input"]', 'Enter')
   │
4. ダイアログ表示待機
   page.waitForSelector('text="権限の確認が必要です"', { timeout: 10000 })
   │
5. アサーション
   expect(dialog).toBeVisible()
   │
6. テスト成功
```

---

## 5. 環境設定

### 5.1 Vitest設定（E2E用）

```typescript
// vitest.config.ts (E2E部分)
export default defineConfig({
  test: {
    include: ["src/__tests__/*.e2e.ts"],
    testTimeout: 30000,
    hookTimeout: 15000,
    reporters: ["verbose"],
  },
});
```

### 5.2 環境変数

| 変数              | 用途             | 設定値                |
| ----------------- | ---------------- | --------------------- |
| `NODE_ENV`        | 環境識別         | `test`                |
| `TEST_SKILLS_DIR` | フィクスチャパス | `__fixtures__/skills` |
| `VITE_E2E_MODE`   | E2E環境フラグ    | `true`                |
| `PWDEBUG`         | デバッグモード   | `1`（デバッグ時のみ） |

---

## 6. 技術的考慮事項

### 6.1 Electron + Playwright 制約

| 制約                     | 対応                      |
| ------------------------ | ------------------------- |
| Main Process直接操作不可 | Renderer経由でIPC呼び出し |
| electronAPIモック必要    | addInitScript で注入      |
| 起動時間がかかる         | beforeAllで1回のみ起動    |

### 6.2 フレーキー回避策

| 対策           | 実装                  |
| -------------- | --------------------- |
| 明示的待機     | `waitForSelector()`   |
| 状態ベース待機 | `waitForLoadState()`  |
| リトライ       | Vitest retry設定      |
| 安定セレクター | `data-testid`, `role` |
