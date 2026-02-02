# Phase 4: テスト仕様書

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| タスクID | TASK-8C-C                          |
| 機能名   | E2Eテスト - インポート・実行フロー |
| 作成日   | 2026-02-02                         |

## テストファイル

| 項目           | 値                                                       |
| -------------- | -------------------------------------------------------- |
| ファイルパス   | `apps/desktop/src/__tests__/skillImportExecution.e2e.ts` |
| フレームワーク | Vitest + Playwright                                      |
| テストケース数 | 7件                                                      |

## テストスイート構成

```
describe("Skill Import & Execution E2E")
├── beforeAll: Electronアプリ起動
├── afterAll: アプリ終了
├── beforeEach: スキル状態リセット
│
├── describe("Skill Import Flow")
│   ├── TC-1: should open import dialog for unimported skill
│   ├── TC-2: should display skill details in import dialog
│   └── TC-3: should import skill and add to imported list
│
├── describe("Skill Execution Flow")
│   ├── beforeEach: test-skillをインポート
│   ├── TC-4: should show streaming view when executing
│   ├── TC-5: should display abort button while executing
│   └── TC-6: should abort execution when stop button clicked
│
└── describe("Rescan Flow")
    └── TC-7: should rescan skills when rescan button clicked
```

## ライフサイクル詳細

### beforeAll

```typescript
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
```

### afterAll

```typescript
await electronApp?.close();
```

### beforeEach（全体）

```typescript
await page.evaluate(() => {
  window.electronAPI?.skill?.resetForTesting?.();
});
```

### beforeEach（Execution Flow）

```typescript
await page.evaluate(async () => {
  await window.electronAPI?.skill?.import?.("test-skill");
});
```

## 使用セレクタ一覧

| セレクタ                               | 用途                     |
| -------------------------------------- | ------------------------ |
| `role=combobox`                        | スキル選択ボタン         |
| `role=option`                          | スキルオプション         |
| `role=listbox`                         | スキルリスト             |
| `text="スキルをインポート"`            | ダイアログタイトル       |
| `text="許可ツール"`                    | 許可ツールセクション     |
| `text=/サブエージェント/`              | サブエージェント         |
| `button:has-text("インポート")`        | インポートボタン         |
| `text="インポート済み"`                | インポート済みセクション |
| `[data-testid="chat-input"]`           | チャット入力             |
| `[data-testid="skill-streaming-view"]` | ストリーミングビュー     |
| `[data-testid="abort-button"]`         | 停止ボタン               |
| `text="キャンセル"`                    | キャンセルステータス     |
| `[aria-label="再スキャン"]`            | 再スキャンボタン         |
| `text="スキャン中..."`                 | スキャン中表示           |

## 環境変数

| 変数名          | 値                                            | 説明                     |
| --------------- | --------------------------------------------- | ------------------------ |
| NODE_ENV        | `test`                                        | テスト環境識別           |
| TEST_SKILLS_DIR | `path.join(__dirname, "__fixtures__/skills")` | フィクスチャディレクトリ |

## 依存フィクスチャ

| フィクスチャ  | パス                                           | 用途               |
| ------------- | ---------------------------------------------- | ------------------ |
| test-skill    | `__tests__/__fixtures__/skills/test-skill/`    | インポート・実行用 |
| another-skill | `__tests__/__fixtures__/skills/another-skill/` | 複数スキル確認用   |
| invalid-skill | `__tests__/__fixtures__/skills/invalid-skill/` | 無効スキル除外確認 |
