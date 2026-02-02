# Phase 2: アーキテクチャ設計

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| タスクID | TASK-8C-C                          |
| 機能名   | E2Eテスト - インポート・実行フロー |
| 作成日   | 2026-02-02                         |

## テストアーキテクチャ

### Electron + Playwright統合構成

```
┌──────────────────────────────────────────────────────────────────┐
│                        Vitest Test Runner                        │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              Playwright Electron Driver                     │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │              Electron Application                     │  │  │
│  │  │  ┌────────────────┐   ┌───────────────────────────┐  │  │  │
│  │  │  │  Main Process  │◄─►│    Renderer Process       │  │  │  │
│  │  │  │  (Node.js)     │IPC│    (Chromium)             │  │  │  │
│  │  │  │                │   │  ┌───────────────────────┐│  │  │  │
│  │  │  │ SkillScanner   │   │  │    ChatPanel          ││  │  │  │
│  │  │  │ SkillExecutor  │   │  │  ┌─────────────────┐  ││  │  │  │
│  │  │  │ IPC Handlers   │   │  │  │ SkillSelector   │  ││  │  │  │
│  │  │  └────────────────┘   │  │  │ SkillImportDlg  │  ││  │  │  │
│  │  │                       │  │  │ SkillStreaming  │  ││  │  │  │
│  │  │                       │  │  └─────────────────┘  ││  │  │  │
│  │  │                       │  └───────────────────────┘│  │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
         ▲
         │ TEST_SKILLS_DIR
         ▼
┌────────────────────────┐
│   Test Fixtures        │
│   __fixtures__/skills/ │
│   ├── test-skill/      │
│   ├── another-skill/   │
│   └── invalid-skill/   │
└────────────────────────┘
```

### コンポーネント役割

| コンポーネント         | 役割                             |
| ---------------------- | -------------------------------- |
| Playwright `_electron` | Electronアプリケーション起動制御 |
| ElectronApplication    | アプリインスタンス管理           |
| Page                   | Rendererプロセスの操作           |
| TEST_SKILLS_DIR        | フィクスチャディレクトリ環境変数 |

### テスト環境設定

| 設定項目        | 値                                                 |
| --------------- | -------------------------------------------------- |
| 起動パス        | `path.join(__dirname, "../../dist/main/index.js")` |
| NODE_ENV        | `test`                                             |
| TEST_SKILLS_DIR | `path.join(__dirname, "__fixtures__/skills")`      |

## テストファイル構造

### ファイル配置

```
apps/desktop/src/__tests__/
├── skillImportExecution.e2e.ts       # 本タスクで作成
├── __fixtures__/
│   └── skills/                        # TASK-8C-Eで作成済み
│       ├── test-skill/
│       │   ├── SKILL.md
│       │   ├── agents/
│       │   └── references/
│       ├── another-skill/
│       │   └── SKILL.md
│       └── invalid-skill/
│           └── README.md              # SKILL.mdなし（無効）
```

### テストスイート構成

| describe             | it（テストケース）                              | TC   |
| -------------------- | ----------------------------------------------- | ---- |
| Skill Import Flow    | should open import dialog for unimported skill  | TC-1 |
| Skill Import Flow    | should display skill details in import dialog   | TC-2 |
| Skill Import Flow    | should import skill and add to imported list    | TC-3 |
| Skill Execution Flow | should show streaming view when executing       | TC-4 |
| Skill Execution Flow | should display abort button while executing     | TC-5 |
| Skill Execution Flow | should abort execution when stop button clicked | TC-6 |
| Rescan Flow          | should rescan skills when rescan button clicked | TC-7 |

## ライフサイクル管理

### セットアップ・ティアダウン

| ライフサイクル | 処理内容                     | 詳細                              |
| -------------- | ---------------------------- | --------------------------------- |
| beforeAll      | Electronアプリ起動、Page取得 | electron.launch() + firstWindow() |
| afterAll       | Electronアプリ終了           | electronApp.close()               |
| beforeEach     | スキル状態リセット           | resetForTesting() IPC呼び出し     |

### Skill Execution Flow専用beforeEach

| 処理                   | 内容                                                |
| ---------------------- | --------------------------------------------------- |
| test-skillをインポート | `window.electronAPI?.skill?.import?.("test-skill")` |

## IPC通信設計

### テストで使用するIPCチャンネル

| チャンネル              | 用途             | 呼び出し方法             |
| ----------------------- | ---------------- | ------------------------ |
| skill:import            | スキルインポート | page.evaluate経由        |
| skill:execute           | スキル実行       | UI操作（プロンプト送信） |
| skill:abort             | 実行中止         | 停止ボタンクリック       |
| skill:rescan            | スキル再スキャン | 再スキャンボタンクリック |
| skill:reset-for-testing | テスト用リセット | page.evaluate経由        |

### page.evaluate使用パターン

```typescript
// beforeEach: スキル状態リセット
await page.evaluate(() => {
  window.electronAPI?.skill?.resetForTesting?.();
});

// Execution Flow beforeEach: スキルインポート
await page.evaluate(async () => {
  await window.electronAPI?.skill?.import?.("test-skill");
});
```

## 待機処理設計

| 操作             | 待機処理                                                    |
| ---------------- | ----------------------------------------------------------- |
| ダイアログ表示   | `waitForSelector('text="スキルをインポート"')`              |
| ダイアログ非表示 | `waitForSelector(..., { state: "hidden" })`                 |
| スキャン完了     | `waitForSelector('text="スキャン中"', { state: "hidden" })` |
| 実行状態変化     | `expect(...).toBeVisible()` のretry                         |

## ヘルパー関数設計

| ヘルパー名          | 用途                       | パラメータ                    |
| ------------------- | -------------------------- | ----------------------------- |
| openSkillSelector   | スキル選択UIを開く         | page: Page                    |
| openImportDialog    | インポートダイアログを開く | page: Page                    |
| startSkillExecution | スキル実行を開始           | page: Page, prompt: string    |
| resetForTesting     | テスト間の状態リセット     | page: Page                    |
| importSkillViaAPI   | APIでスキルをインポート    | page: Page, skillName: string |

## 統合ポイント

| 統合ポイント     | 契約定義                                   |
| ---------------- | ------------------------------------------ |
| Electron起動     | `electron.launch()` + 環境変数設定         |
| フィクスチャ参照 | `TEST_SKILLS_DIR` 環境変数                 |
| IPC経由操作      | `window.electronAPI?.skill?.import?.()` 等 |
| UI操作           | Playwright Locator API                     |
