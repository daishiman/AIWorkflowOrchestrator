# Phase 2: アーキテクチャ全体設計

## メタ情報

| 項目      | 内容                                 |
| --------- | ------------------------------------ |
| タスクID  | UT-IMP-PHASE11-WORKTREE-PROTOCOL-001 |
| Phase     | 2                                    |
| 作成日    | 2026-03-01                           |
| 依存Phase | Phase 1（要件定義）                  |

## アーキテクチャ概要

### テスト3層分類とElectron 3プロセスモデルの関係

テスト3層分類（Layer 1-3）は、Electron 3プロセスモデル（Main/Preload/Renderer）に対応して設計する。各Layerで検証できる範囲と実行環境が異なることを明示する。

```
+--------------------------------------------------+
|           テスト3層分類アーキテクチャ            |
+--------------------------------------------------+
|                                                  |
|  Layer 1: 自動テスト検証（Worktree実行可能）     |
|  +--------------------------------------------+ |
|  | Vitest ユニットテスト                       | |
|  |  - Main Process ロジック検証                | |
|  |  - IPC ハンドラ引数バリデーション検証       | |
|  |  - Zustand Store 統合テスト                 | |
|  |  - エラーハンドリングテスト                 | |
|  +--------------------------------------------+ |
|                                                  |
|  Layer 2: 静的コード検証（Worktree実行可能）     |
|  +--------------------------------------------+ |
|  | TypeScript 型チェック / ESLint              | |
|  | IPC 契約整合性コードレビュー                | |
|  | BrowserWindow セキュリティ設定確認          | |
|  | ARIA 属性 / Preload ホワイトリスト確認      | |
|  +--------------------------------------------+ |
|                                                  |
|  Layer 3: UI/E2Eテスト（CI/メインリポジトリのみ）|
|  +--------------------------------------------+ |
|  | Playwright Electron E2E                     | |
|  |  +----------+  +----------+  +----------+  | |
|  |  |  Main    |  | Preload  |  | Renderer |  | |
|  |  | Process  |->|(context  |->|  (DOM)   |  | |
|  |  |          |  | Bridge)  |  |          |  | |
|  |  +----------+  +----------+  +----------+  | |
|  |       ^                           |        | |
|  |       |   IPC (_electron.launch)  |        | |
|  |  page.evaluate() <----------------+        | |
|  +--------------------------------------------+ |
|                                                  |
+--------------------------------------------------+

Electron 3プロセスモデル:
  Main Process    : Node.js フルアクセス（IPCハンドラ登録・ビジネスロジック）
  Preload Process : contextBridge のみ（安全な API ブリッジ）
  Renderer Process: DOM のみ（React UI、page.evaluate() 経由でテスト）
```

### Layer とプロセスの対応マトリクス

| Layer   | テスト種別               | Main Process       | Preload        | Renderer           | 実行環境    |
| ------- | ------------------------ | ------------------ | -------------- | ------------------ | ----------- |
| Layer 1 | Vitest ユニットテスト    | 直接テスト         | モック         | モック             | Worktree 可 |
| Layer 2 | 静的解析・コードレビュー | コードレビュー     | コードレビュー | コードレビュー     | Worktree 可 |
| Layer 3 | Playwright E2E           | page.evaluate 経由 | 透過的         | page.evaluate 直接 | CI のみ     |

## ファイル構成

### 新規作成ファイル（4件）

```
apps/desktop/
  e2e/
    helpers/
      electron-app.ts            # Electron起動・終了・IPC呼び出しヘルパー（新規）
    ipc-skill-remove.spec.ts     # skill:remove E2Eテスト（新規）
    ipc-skill-import.spec.ts     # skill:import E2Eテスト（新規）

docs/30-workflows/ut-imp-phase11-worktree-protocol/
  outputs/
    phase-5/
      deferred-tests-template.md # 未実施テスト追跡テンプレート（新規）
```

### 更新ファイル（3件）

```
apps/desktop/
  playwright.config.ts           # electron-e2eプロジェクト追加（更新）

.github/workflows/
  ci.yml                         # e2e-desktopジョブ追加（更新）

.claude/skills/task-specification-creator/references/
  phase-11-12-guide.md           # Worktree環境テスト手順セクション追加（更新）
```

### ユーティリティモジュール（3件、Phase 5で実装）

```
apps/desktop/src/main/utils/
  worktree-detector.ts           # Worktree環境判定ユーティリティ
  deferred-tests-parser.ts       # deferred-tests.mdパーサー
  test-layer-classifier.ts       # Layer分類判定ロジック
```

### ディレクトリツリー全体（変更対象のみ）

```
AIWorkflowOrchestrator/
├── apps/
│   └── desktop/
│       ├── e2e/
│       │   ├── helpers/
│       │   │   └── electron-app.ts          [新規]
│       │   ├── ipc-skill-remove.spec.ts     [新規]
│       │   ├── ipc-skill-import.spec.ts     [新規]
│       │   ├── skill-permission.spec.ts     [既存・変更なし]
│       │   ├── global-setup.ts              [既存・変更なし]
│       │   ├── mocks/
│       │   │   └── electronAPI.mock.ts      [既存・変更なし]
│       │   └── pages/
│       │       ├── SearchPanelPage.ts       [既存・変更なし]
│       │       └── WorkspaceSearchPage.ts   [既存・変更なし]
│       ├── playwright.config.ts             [更新]
│       └── src/
│           └── main/
│               └── utils/
│                   ├── worktree-detector.ts     [新規]
│                   ├── deferred-tests-parser.ts [新規]
│                   └── test-layer-classifier.ts [新規]
├── .github/
│   └── workflows/
│       └── ci.yml                           [更新]
└── .claude/
    └── skills/
        └── task-specification-creator/
            └── references/
                └── phase-11-12-guide.md     [更新]
```

## データフロー

### E2Eテスト実行フロー（Layer 3）

```
Playwright テストランナー（CI環境 / ubuntu-latest）
  |
  | xvfb-run --auto-servernum
  |
  v
_electron.launch({ args: ['.'], cwd: 'apps/desktop/', timeout: 60_000 })
  |
  | Electronプロセス起動
  |
  v
Electron Main Process
  |--- ipcMain.handle('skill:remove', handler) 登録済み
  |--- ipcMain.handle('skill:import', handler) 登録済み
  |
  v
electronApp.firstWindow()  -> BrowserWindow（Renderer）
  |
  | page.waitForLoadState('domcontentloaded')
  |
  v
page.evaluate(({ path, invokeArgs }) => {
  window.electronAPI.skill.remove(skillName)  // Preload API 経由
})
  |
  | contextBridge.exposeInMainWorld('electronAPI', { skill: { remove, import } })
  |
  v
Preload Bridge（ipcRenderer.invoke('skill:remove', skillName)）
  |
  | IPC 通信
  |
  v
Main Process IPCハンドラ
  |--- P42準拠3段バリデーション（型チェック -> 空文字列 -> トリム空文字列）
  |--- SkillService.removeSkill(skillName) / importSkills([skillName])
  |
  v
レスポンス（成功 / VALIDATION_ERROR）
  |
  v
page.evaluate() 戻り値 -> expect() でアサーション
```

### Worktreeテスト判定フロー（Layer 1-2）

```
Phase 11 開始（Worktree環境）
  |
  v
Worktree環境判定（git rev-parse --show-toplevel | grep .worktrees/）
  |--- YES（Worktree環境）-> Layer 1-3分離フローへ
  |--- NO（メインリポジトリ）-> 通常Phase 11フローへ
  |
  v [Worktree環境]
Layer 1 実行（cd apps/desktop && pnpm test:run）
  |--- FAIL -> Phase 11 FAIL -> Phase 5 へ戻る
  |--- 全PASS -> Layer 2 へ進む
  |
  v
Layer 2 実行（pnpm typecheck && pnpm lint + コードレビュー）
  |--- FAIL -> Phase 11 FAIL -> Phase 5 へ戻る
  |--- 全PASS -> Layer 3 記録へ
  |
  v
Layer 3 記録（outputs/phase-11/deferred-tests.md に記録）
  |
  v
Phase 11 条件付きPASS -> Phase 12 へ進む
  |
  v [PRマージ後 / CI]
Layer 3 E2E実行（e2e-desktopジョブ）
  |--- FAIL -> 修正タスク起票
  |--- 全PASS -> deferred-tests.md を完了に更新
```

## 設計原則

### 単一責務（SRP）

各ファイルの責務を明確に分離する。

| ファイル                 | 責務                                    | 責務の境界                        |
| ------------------------ | --------------------------------------- | --------------------------------- |
| electron-app.ts          | Electron起動・終了・IPC呼び出しの共通化 | テストロジックは含まない          |
| ipc-skill-remove.spec.ts | skill:remove E2Eテストケース定義        | 起動・終了ロジックは含まない      |
| ipc-skill-import.spec.ts | skill:import E2Eテストケース定義        | 起動・終了ロジックは含まない      |
| worktree-detector.ts     | Worktree環境判定ロジック                | UI・IPC処理は含まない             |
| deferred-tests-parser.ts | deferred-tests.md のパースのみ          | ファイル操作は含まない            |
| test-layer-classifier.ts | Layer分類判定ロジック                   | ファイルI/O・テスト実行は含まない |

### テスト状態隔離（P9対策）

E2Eテストでのモジュールスコープ変数リークを防止するため、各テストケースで独立したElectronプロセスを起動・終了する。

```typescript
// 設計方針: beforeEach / afterEach でElectronプロセスを完全隔離
test.beforeEach(async () => {
  const app = await launchElectronApp(); // 新規Electronプロセス起動
  electronApp = app.electronApp;
  page = app.page;
});

test.afterEach(async () => {
  await closeElectronApp(electronApp); // Electronプロセス完全終了
});
// 各テスト間でプロセス・メモリ・ファイルシステム状態が完全リセットされる
```

### P40対策（テスト実行ディレクトリ依存）

テスト実行は必ず `apps/desktop/` ディレクトリから行い、プロジェクトルートからの実行を禁止する。

```bash
# 正しい実行方法（vitest.config.ts の設定が正しく読み込まれる）
cd apps/desktop && pnpm exec playwright test --project=electron-e2e

# または
pnpm --filter @repo/desktop exec playwright test --project=electron-e2e

# 誤った実行方法（P40: プロジェクトルートからの実行は禁止）
# pnpm exec playwright test apps/desktop/e2e/  <- これは禁止
```

### P42準拠3段バリデーション設計

E2Eテストで3段バリデーション（型チェック -> 空文字列 -> トリム空文字列）の全段階を検証する。

```
バリデーション段階:
  Step 1: typeof skillName !== 'string'   -> VALIDATION_ERROR（型エラー）
  Step 2: skillName === ''                -> VALIDATION_ERROR（空文字列）
  Step 3: skillName.trim() === ''         -> VALIDATION_ERROR（スペースのみ）

E2Eテストの対応:
  TC-R01 / TC-I01: 有効なスキル名 -> 成功（全段階通過）
  TC-R02 / TC-I02: 空文字列 -> Step 2 で拒否（VALIDATION_ERROR）
  TC-R03 / TC-I03: スペースのみ -> Step 3 で拒否（VALIDATION_ERROR）
  TC-R04 / TC-I04: 異常系（未登録スキル / パストラバーサル）
```

## CI/CDパイプラインアーキテクチャ

### 既存CIジョブ（9件）と e2e-desktop ジョブの位置づけ

```
.github/workflows/ci.yml

既存ジョブ（影響なし）:
  +----------+  +----------+  +-------------+  +----------+
  |  lint    |  |typecheck |  |build-shared |  |test-shared|
  +----------+  +----------+  +-------------+  +----------+
                                    |
                              +----------+
                              |  build   |   <- e2e-desktopをneedsに追加しない
                              +----------+      （非ブロッキング設計）
                                    |
  +----------+  +----------+  +-----------------+
  |test-desk-|  |check-mod-|  |    security     |
  |  top     |  |ule-sync  |  +-----------------+
  +----------+  +----------+
  +----------+
  | coverage |
  +----------+

追加ジョブ（新規）:
  +-------------+
  | build-shared|  <- needs（依存）
  +-------------+
        |
        v
  +-----------------+
  |  e2e-desktop    |  <- 新規追加（既存ジョブをブロックしない）
  |  (ubuntu-latest)|
  |  xvfb-run       |
  +-----------------+
```

### e2e-desktop ジョブの位置づけ

| 観点           | 設計判断                                                           |
| -------------- | ------------------------------------------------------------------ |
| 実行タイミング | build-shared 完了後（PRマージ後CI実行）                            |
| ブロッキング   | build ジョブの needs に含めない（非ブロッキング）                  |
| 失敗時の影響   | e2e-desktop 失敗が他ジョブをブロックしない                         |
| 実行条件       | paths フィルタ（apps/desktop/ または packages/shared/ 変更時のみ） |
| 実行環境       | ubuntu-latest + xvfb-run（headless Electron）                      |
| 成果物         | playwright-report/ + test-results/（7日間保持）                    |

### e2e-desktop ジョブと既存CIジョブの共存確認

| 既存ジョブ        | 影響     | 理由                                                     |
| ----------------- | -------- | -------------------------------------------------------- |
| lint              | 影響なし | E2Eテストファイル追加はlint対象だがESLint設定変更なし    |
| typecheck         | 影響なし | Playwright型は @playwright/test で提供、tsconfig変更不要 |
| build-shared      | 影響なし | shared packageビルドは変更なし                           |
| test-shared       | 影響なし | shared packageテストは変更なし                           |
| test-desktop      | 影響なし | Vitestテストのみ実行。Playwright E2Eは別ジョブ           |
| check-module-sync | 影響なし | モジュール同期チェックは変更なし                         |
| security          | 影響なし | セキュリティ監査は変更なし                               |
| coverage          | 影響なし | カバレッジはVitestのみ対象                               |
| build             | 影響なし | e2e-desktop は build の needs に追加しない               |

## 完了条件

- [x] テスト3層分類とElectron 3プロセスモデルの関係がASCII図で示されている
- [x] ファイル構成（新規4件・更新3件・ユーティリティ3件）がディレクトリツリーで示されている
- [x] E2Eテスト実行のデータフロー（Playwright -> Electron Main -> IPC -> Preload -> Renderer）が明示されている
- [x] 設計原則（単一責務・テスト状態隔離・P40対策・P42対策）が定義されている
- [x] CI/CDパイプラインアーキテクチャ（e2e-desktopジョブの位置づけと既存9ジョブとの共存）が設計されている
