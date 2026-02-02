# Phase 12: 実装ガイド

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| タスクID | TASK-8C-C                          |
| 機能名   | E2Eテスト - インポート・実行フロー |
| 作成日   | 2026-02-02                         |

---

## Part 1: 概念的説明（初学者・非技術者向け）

### E2Eテストとは？

**日常の例え話**:

E2Eテストは「新しいスマートフォンを買ったときに、電話・メール・写真の機能を一通り試してみる」ようなものです。

アプリケーション全体が正しく動くかを、ユーザーの操作をシミュレーションして確認します。「E2E」は「End-to-End（端から端まで）」の略で、最初から最後まで一連の流れを確認するテストです。

### なぜE2Eテストが必要？

| 課題                             | E2Eテストでの解決                      |
| -------------------------------- | -------------------------------------- |
| 個々の部品は動くが組合せで壊れる | 実際の操作フローで動作を確認           |
| 手動テストは時間がかかる         | 自動化で何度でも同じテストを繰り返せる |
| リリース前の確認漏れ             | 自動テストで必ず重要機能をチェック     |

### スキルインポート・実行テストとは？

このプロジェクトでは、AIアシスタント（Claude）に「スキル」という追加機能を教えることができます。

**スキルインポート** = 新しいスキルをアプリに登録すること
**スキル実行** = 登録したスキルを使ってAIに作業をさせること

このテストでは、以下の流れが正しく動くかを確認します：

```
1. スキル一覧を開く
   ↓
2. 新しいスキルを選ぶ
   ↓
3. インポートダイアログが表示される
   ↓
4. 「インポート」ボタンを押す
   ↓
5. スキルが登録される
   ↓
6. スキルを実行する
   ↓
7. 実行中の表示が出る
   ↓
8. 必要に応じて停止できる
```

### このテストで確認すること

| 確認項目             | 内容                                       |
| -------------------- | ------------------------------------------ |
| インポートダイアログ | 新しいスキルを選んだときにダイアログが出る |
| スキル詳細表示       | 許可ツールやサブエージェントが表示される   |
| インポート実行       | ボタンを押すとスキルが登録される           |
| 実行画面表示         | スキルを実行すると進行状況が表示される     |
| 停止機能             | 実行中に停止ボタンで中止できる             |
| 再スキャン           | スキル一覧を更新できる                     |

---

## Part 2: 技術的詳細（開発者・技術者向け）

### テストファイル構成

| 項目                 | 内容                                                     |
| -------------------- | -------------------------------------------------------- |
| ファイルパス         | `apps/desktop/src/__tests__/skillImportExecution.e2e.ts` |
| テストフレームワーク | Vitest + Playwright                                      |
| テストケース数       | 9件（基本7件 + エッジケース2件）                         |
| 総行数               | 374行                                                    |

### テストスイート構造

```
Skill Import & Execution E2E
├── Skill Import Flow (TC-1〜TC-3)
│   ├── should open import dialog for unimported skill
│   ├── should display skill details in import dialog
│   └── should import skill and add to imported list
├── Skill Execution Flow (TC-4〜TC-6)
│   ├── should show streaming view when executing
│   ├── should display abort button while executing
│   └── should abort execution when stop button clicked
├── Rescan Flow (TC-7)
│   └── should rescan skills when rescan button clicked
└── Edge Cases (TC-8〜TC-9)
    ├── should not display invalid skills in the list
    └── should select imported skill without showing import dialog
```

### 主要セレクタ定義

| 要素                 | セレクタ                               | 用途                   |
| -------------------- | -------------------------------------- | ---------------------- |
| スキル選択           | `role=combobox`                        | SkillSelectorを開く    |
| スキルリスト         | `role=listbox`                         | スキル一覧             |
| スキルオプション     | `role=option >> text="${name}"`        | 特定スキルの選択       |
| 再スキャンボタン     | `[aria-label="再スキャン"]`            | スキル一覧を更新       |
| インポートダイアログ | `text="スキルをインポート"`            | ダイアログタイトル     |
| インポートボタン     | `button:has-text("インポート")`        | インポート実行         |
| ストリーミングビュー | `[data-testid="skill-streaming-view"]` | 実行中のストリーミング |
| 停止ボタン           | `[data-testid="abort-button"]`         | 実行中止               |
| チャット入力         | `[data-testid="chat-input"]`           | プロンプト入力         |

### タイムアウト設定

| 定数名    | 値      | 用途               |
| --------- | ------- | ------------------ |
| dialog    | 5000ms  | ダイアログ表示待機 |
| scan      | 10000ms | スキャン完了待機   |
| execution | 5000ms  | 実行状態変化待機   |

### ヘルパー関数

| 関数名              | 引数              | 用途                       |
| ------------------- | ----------------- | -------------------------- |
| openSkillSelector   | `page: Page`      | スキル選択UIを開く         |
| openImportDialog    | `page, skillName` | インポートダイアログを開く |
| importSkillViaAPI   | `page, skillName` | APIでスキルをインポート    |
| startSkillExecution | `page, prompt`    | スキル実行を開始           |
| resetForTesting     | `page: Page`      | テスト間の状態リセット     |

### 環境変数

| 変数名          | 値                              | 用途                           |
| --------------- | ------------------------------- | ------------------------------ |
| NODE_ENV        | `test`                          | テスト環境フラグ               |
| TEST_SKILLS_DIR | `__dirname/__fixtures__/skills` | フィクスチャスキルディレクトリ |

### 依存関係

| 依存タスク | 内容                           |
| ---------- | ------------------------------ |
| TASK-8C-E  | テストフィクスチャ（3スキル）  |
| TASK-7D    | ChatPanel統合（ChatInput連携） |

### 実行コマンド

```bash
# デスクトップアプリをビルド
pnpm --filter @repo/desktop build

# E2Eテストを実行
pnpm --filter @repo/desktop test:e2e skillImportExecution

# 詳細ログ付きで実行
DEBUG=pw:api pnpm --filter @repo/desktop test:e2e

# 特定テストのみ実行
pnpm --filter @repo/desktop test:e2e -- -t "should open import"
```

### IPC通信（Electron）

| チャネル              | 用途                   | 呼び出し元          |
| --------------------- | ---------------------- | ------------------- |
| skill:import          | スキルをインポート     | importSkillViaAPI   |
| skill:execute         | スキルを実行           | startSkillExecution |
| skill:abort           | 実行を中止             | abortButton click   |
| skill:rescan          | スキル一覧を再スキャン | rescanButton click  |
| skill:resetForTesting | テスト用状態リセット   | resetForTesting     |

### テスト設計パターン

**AAAパターン（Arrange-Act-Assert）**:

```typescript
it("should open import dialog for unimported skill", async () => {
  // Arrange: スキル選択UIを開く
  await openSkillSelector(page);

  // Act: 未インポートスキルを選択
  await page.click(SELECTORS.skillOption("test-skill"));

  // Assert: インポートダイアログが表示される
  const dialog = page.locator(SELECTORS.importDialogTitle);
  await expect(dialog).toBeVisible();
});
```

### 注意事項

1. **ビルド必須**: E2Eテスト実行前にElectronアプリのビルドが必要
2. **フィクスチャ依存**: `__fixtures__/skills/` 配下のフィクスチャを使用
3. **状態リセット**: 各テスト前に `resetForTesting` で状態をクリア
4. **タイムアウト調整**: ネットワーク遅延等に応じてTIMEOUTS定数を調整可能
