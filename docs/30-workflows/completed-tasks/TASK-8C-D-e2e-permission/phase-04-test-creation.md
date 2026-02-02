# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 4                        |
| Phase名    | テスト作成               |
| 前提Phase  | Phase 3                  |
| 後続Phase  | Phase 5                  |
| ステータス | 未実施                   |
| 作成日     | 2026-02-02               |
| 機能名     | TASK-8C-D-e2e-permission |

---

## 目的

TDD（テスト駆動開発）のRed段階として、権限ダイアログE2Eテストのスケルトンを作成する。E2Eテストの場合、完全なRed状態ではなく、テスト構造とアサーションの骨格を作成する。

## 背景

Phase 3 の設計レビューを通過した設計に基づき、テストファイルの骨格を作成する。E2Eテストは実装後に実行するため、この段階ではテスト構造の確認が主目的となる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テストファイル作成

**目的**: E2Eテストファイルの骨格を作成する

**実行手順**:

1. テストファイルを作成: `apps/desktop/src/__tests__/skillPermission.e2e.ts`

2. 基本構造を実装:

   ```typescript
   import {
     describe,
     it,
     expect,
     beforeAll,
     afterAll,
     beforeEach,
   } from "vitest";
   import {
     ElectronApplication,
     Page,
     _electron as electron,
   } from "playwright";
   import path from "path";

   describe("Skill Permission Dialog E2E", () => {
     let electronApp: ElectronApplication;
     let page: Page;

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

     afterAll(async () => {
       await electronApp?.close();
     });

     beforeEach(async () => {
       // Import and select test skill
       await page.evaluate(async () => {
         await window.electronAPI?.skill?.import?.("test-skill");
       });

       await page.click('[aria-label="スキルを選択"]');
       await page.click('[role="option"]:has-text("test-skill")');
     });

     // TC-1〜TC-5 のテストスケルトン
   });
   ```

3. 型定義を追加（必要に応じて）

**期待される成果物**:

- `apps/desktop/src/__tests__/skillPermission.e2e.ts`: E2Eテストファイル

---

### タスク2: TC-1〜TC-5 テストケース実装

**目的**: 5件のテストケースを実装する

**実行手順**:

1. TC-1: 権限ダイアログ表示

   ```typescript
   it("should show permission dialog when tool requires approval", async () => {
     await page.fill('[data-testid="chat-input"]', "Run dangerous command");
     await page.press('[data-testid="chat-input"]', "Enter");

     const dialog = page.locator('text="権限の確認が必要です"');
     await expect(dialog).toBeVisible({ timeout: 10000 });
   });
   ```

2. TC-2: ツール情報表示

   ```typescript
   it("should display tool info in permission dialog", async () => {
     await page.fill('[data-testid="chat-input"]', "Run dangerous command");
     await page.press('[data-testid="chat-input"]', "Enter");

     await page.waitForSelector('text="権限の確認が必要です"');

     await expect(page.locator('text="ツール:"')).toBeVisible();
     await expect(page.locator('text="引数:"')).toBeVisible();
   });
   ```

3. TC-3: 許可して続行

   ```typescript
   it("should approve permission and continue execution", async () => {
     await page.fill('[data-testid="chat-input"]', "Run dangerous command");
     await page.press('[data-testid="chat-input"]', "Enter");

     await page.waitForSelector('text="権限の確認が必要です"');
     await page.click('button:has-text("許可")');

     await page.waitForSelector('text="権限の確認が必要です"', {
       state: "hidden",
     });

     await expect(page.locator('text="実行中"')).toBeVisible();
   });
   ```

4. TC-4: 拒否して停止

   ```typescript
   it("should deny permission and stop execution", async () => {
     await page.fill('[data-testid="chat-input"]', "Run dangerous command");
     await page.press('[data-testid="chat-input"]', "Enter");

     await page.waitForSelector('text="権限の確認が必要です"');
     await page.click('button:has-text("拒否")');

     await page.waitForSelector('text="権限の確認が必要です"', {
       state: "hidden",
     });

     await expect(page.locator('text="キャンセル"')).toBeVisible();
   });
   ```

5. TC-5: 選択記憶

   ```typescript
   it("should remember choice when checkbox is checked", async () => {
     await page.fill('[data-testid="chat-input"]', "Run dangerous command");
     await page.press('[data-testid="chat-input"]', "Enter");

     await page.waitForSelector('text="権限の確認が必要です"');

     await page.click('[type="checkbox"]');
     await page.click('button:has-text("許可")');

     // Run same command again
     await page.fill('[data-testid="chat-input"]', "Run dangerous command");
     await page.press('[data-testid="chat-input"]', "Enter");

     // Should not show permission dialog again
     await page.waitForTimeout(1000);
     await expect(
       page.locator('text="権限の確認が必要です"'),
     ).not.toBeVisible();
   });
   ```

**期待される成果物**:

- 5件のテストケースが実装されたテストファイル

---

### タスク3: タイムアウトテスト追加（オプション）

**目的**: 元タスク仕様に記載のタイムアウトテストを追加する

**実行手順**:

1. タイムアウト処理テストを追加

   ```typescript
   it("should handle permission request timeout", async () => {
     await page.fill('[data-testid="chat-input"]', "Run dangerous command");
     await page.press('[data-testid="chat-input"]', "Enter");

     await page.waitForSelector('text="権限の確認が必要です"');

     // Wait for timeout (mock with shorter timeout in test)
     await page.waitForTimeout(5000);

     // Should show timeout message
     await expect(page.locator('text="タイムアウト"')).toBeVisible();
   });
   ```

**期待される成果物**:

- タイムアウトテストが追加されたテストファイル

---

### タスク4: テスト構造確認

**目的**: テストファイルの構造が正しいことを確認する

**実行手順**:

1. TypeScript コンパイル確認

   ```bash
   pnpm --filter @repo/desktop typecheck
   ```

2. ESLint 確認

   ```bash
   pnpm --filter @repo/desktop lint
   ```

3. テストファイル構造の確認
   - import 文が正しいか
   - describe/it の構造が正しいか
   - beforeAll/afterAll/beforeEach が適切に設定されているか

**期待される成果物**:

- `outputs/phase-4/test-structure-verification.md`: テスト構造確認結果

---

## 参照資料

| 参照資料        | パス                                                                            | 内容             |
| --------------- | ------------------------------------------------------------------------------- | ---------------- |
| Phase 2 設計書  | `outputs/phase-2/`                                                              | テスト設計       |
| 元タスク仕様    | `docs/30-workflows/skill-import-agent-system/tasks/task-8c-d-e2e-permission.md` | テストコード雛形 |
| E2Eフィクスチャ | `apps/desktop/src/__tests__/__fixtures__/skills/`                               | テスト用スキル   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                              | 内容                   |
| ---------------- | --------------------------------------------------------------------------------- | ---------------------- |
| E2Eテスト仕様    | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md`        | テスト戦略             |
| Permission型定義 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | SkillPermissionRequest |

---

## 成果物

| 成果物             | パス                                                | 内容                 |
| ------------------ | --------------------------------------------------- | -------------------- |
| E2Eテストファイル  | `apps/desktop/src/__tests__/skillPermission.e2e.ts` | 5〜6テストケース     |
| テスト構造確認結果 | `outputs/phase-4/test-structure-verification.md`    | コンパイル・Lint確認 |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 4での統合テスト連携アクション:**

- E2Eテストがフィクスチャを正しく参照しているか確認
- IPC通信のモック/シミュレーション方式を確認

---

## 多角的チェック観点（AIが判断）

| 観点             | 適用判断                 | 仕様参照先                                          |
| ---------------- | ------------------------ | --------------------------------------------------- |
| アクセシビリティ | UI要素のテストを含む場合 | `aiworkflow-requirements: testing-accessibility.md` |
| IPC通信          | Main-Renderer連携の場合  | `aiworkflow-requirements: interfaces-*.md`          |

**Electronデスクトップアプリ観点**:

| 層                         | 適用判断                | 仕様参照先                                 |
| -------------------------- | ----------------------- | ------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合      | `aiworkflow-requirements: ui-ux-*.md`      |
| IPC通信                    | Main-Renderer連携の場合 | `aiworkflow-requirements: interfaces-*.md` |

---

## 完了条件

- [ ] E2Eテストファイルが作成されている
- [ ] 5件のテストケース（TC-1〜TC-5）が実装されている
- [ ] TypeScript コンパイルエラーがない
- [ ] ESLint エラーがない
- [ ] テスト構造確認結果が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスク1: テストファイル作成
3. 実行タスク2: TC-1〜TC-5 テストケース実装
4. 実行タスク3: タイムアウトテスト追加（オプション）
5. 実行タスク4: テスト構造確認
6. 統合テスト連携の実施
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

### TDD サイクル確認

E2Eテストは実装後に実行するため、この段階ではテスト構造の確認のみ。

```bash
# TypeScript コンパイル確認
pnpm --filter @repo/desktop typecheck

# ESLint 確認
pnpm --filter @repo/desktop lint
```

**確認項目**:

- [ ] テストファイルの構造が正しい
- [ ] コンパイルエラーがない

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が PASS していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/TASK-8C-D-e2e-permission/phase-05-implementation.md`
