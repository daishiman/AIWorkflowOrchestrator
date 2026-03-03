# [#401] [UT-003] E2Eテスト追加（チャット履歴）

## メタ情報

```yaml
task_id: UT-003
task_name: E2Eテスト追加（チャット履歴）
category: テスト
target_feature: チャット履歴機能（chat-history）
priority: 中
scale: 中規模
status: 待機中（フィーチャーフラグ実装待ち）
source_phase: Phase 11（手動テスト検証）
created_date: 2026-01-19
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-e2e-test-chat-history.md
```

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| 優先度     | 中                                   |
| 規模       | 中規模                               |
| ステータス | 待機中（フィーチャーフラグ実装待ち） |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

ARCH-001 Clean Architectureリファクタリングにより、チャット履歴機能は新旧アーキテクチャの切り替えが可能となる設計が想定されている。`USE_NEW_CHAT_HISTORY_ARCH`フィーチャーフラグによる切り替え時に、両アーキテクチャの動作を自動検証するE2Eテストが必要である。

### 1.2 問題点・課題

- 新旧アーキテクチャの切り替えテストが自動化されていない
- リグレッションテストの手動実行コストが高い
- CI/CDパイプラインでの品質ゲートが不十分
- フィーチャーフラグ切り替え時の動作保証がない

### 1.3 放置した場合の影響

- フィーチャーフラグ切り替え時のリグレッションリスク
- 本番環境での予期しない動作
- 手動テストの工数増大
- デプロイ信頼性の低下

---

## 2. 何を達成するか（What）

### 2.1 目的

Playwrightを使用したE2Eテストを作成し、チャット履歴機能の主要シナリオを自動検証可能にする。

### 2.2 最終ゴール

- 主要機能のE2Eテスト実装
- フィーチャーフラグ切り替えテスト実装
- CI/CDパイプラインへの統合
- テストレポートの自動生成

### 2.3 スコープ

#### 含むもの

- セッションCRUD操作のE2Eテスト
- 検索機能のE2Eテスト
- エクスポート機能のE2Eテスト
- フィーチャーフラグ切り替えテスト
- CI統合設定

#### 含まないもの

- パフォーマンステスト（別タスク: UT-004）
- 手動テスト（別タスク: UT-002）
- ビジュアルリグレッションテスト
- ロードテスト

### 2.4 成果物

| 成果物                       | 配置先                       |
| ---------------------------- | ---------------------------- |
| chat-history.spec.ts         | `apps/desktop/e2e/tests/`    |
| feature-flag-toggle.spec.ts  | `apps/desktop/e2e/tests/`    |
| chat-history.fixtures.ts     | `apps/desktop/e2e/fixtures/` |
| playwright.config.ts（更新） | `apps/desktop/`              |
| e2e-report.md                | 実行タスクの`outputs/`       |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-005（Drizzle Repository実装）が完了
- UT-006（React Context DI実装）が完了
- フィーチャーフラグ実装が完了
- Playwrightがセットアップ済み
- Electron E2Eテスト環境が構築済み

### 3.2 依存タスク

| タスク             | ステータス | 必要性 |
| ------------------ | ---------- | ------ |
| ARCH-001           | 完了       | 必須   |
| UT-005             | 未着手     | 必須   |
| UT-006             | 未着手     | 必須   |
| フィーチャーフラグ | 未着手     | 必須   |

### 3.3 必要な知識

- Playwright Test Framework
- Electron E2Eテスト設定
- TypeScript
- Page Object Model（POM）パターン
- CI/CD設定（GitHub Actions）

### 3.4 推奨アプローチ

1. Page Objectクラスの作成
2. Fixturesの作成（テストデータ）
3. 機能テストの実装
4. フィーチャーフラグテストの実装
5. CI/CD統合

---

## 4. 実行手順

### Phase構成

| Phase | 名称             | 概要                        |
| ----- | ---------------- | --------------------------- |
| 1     | 環境準備         | Playwright設定・Page Object |
| 2     | 機能テスト実装   | CRUD・検索・エクスポート    |
| 3     | フラグテスト実装 | フィーチャーフラグ切り替え  |
| 4     | CI/CD統合        | GitHub Actions設定          |

---

### Phase 1: 環境準備

#### 目的

E2Eテスト環境とPage Objectを準備する。

#### 手順

1. Playwright設定を確認・更新:

   ```typescript
   // playwright.config.ts
   export default defineConfig({
     testDir: "./e2e/tests",
     timeout: 30000,
     retries: process.env.CI ? 2 : 0,
     use: {
       trace: "on-first-retry",
       screenshot: "only-on-failure",
     },
     projects: [
       {
         name: "electron",
         use: {
           ...devices["Desktop Chrome"],
         },
       },
     ],
   });
   ```

2. ChatHistoryPage Page Objectを作成:

   ```typescript
   // e2e/pages/ChatHistoryPage.ts
   export class ChatHistoryPage {
     constructor(private page: Page) {}

     async createSession(title?: string) {
       await this.page.click('[data-testid="new-chat-button"]');
       if (title) {
         await this.page.fill('[data-testid="session-title-input"]', title);
       }
     }

     async selectSession(sessionId: string) {
       await this.page.click(`[data-testid="session-${sessionId}"]`);
     }

     async sendMessage(content: string) {
       await this.page.fill('[data-testid="message-input"]', content);
       await this.page.click('[data-testid="send-button"]');
     }

     async searchSessions(keyword: string) {
       await this.page.fill('[data-testid="search-input"]', keyword);
       await this.page.press('[data-testid="search-input"]', "Enter");
     }

     async togglePin(sessionId: string) {
       await this.page.click(`[data-testid="pin-button-${sessionId}"]`);
     }

     async deleteSession(sessionId: string) {
       await this.page.click(`[data-testid="delete-button-${sessionId}"]`);
       await this.page.click('[data-testid="confirm-delete"]');
     }
   }
   ```

3. テストFixturesを作成:

   ```typescript
   // e2e/fixtures/chat-history.fixtures.ts
   export const testSession = {
     title: "Test Session",
     messages: [
       { role: "user", content: "Hello, how are you?" },
       { role: "assistant", content: "I am fine, thank you!" },
     ],
   };
   ```

#### 成果物

- `ChatHistoryPage.ts`
- `chat-history.fixtures.ts`
- `playwright.config.ts`（更新）

#### 完了条件

- Page Objectがコンパイルエラーなく定義
- Fixturesが準備完了

---

### Phase 2: 機能テスト実装

#### 目的

チャット履歴の主要機能をE2Eテストでカバーする。

#### テストケース

| TC-ID  | シナリオ             | 検証内容                     |
| ------ | -------------------- | ---------------------------- |
| E2E-01 | セッション作成       | 新規セッションが作成される   |
| E2E-02 | メッセージ送受信     | メッセージが保存・表示される |
| E2E-03 | セッション一覧表示   | 複数セッションが一覧表示     |
| E2E-04 | タイトル編集         | タイトル変更が永続化         |
| E2E-05 | ピン留め/解除        | ピン状態が切り替わる         |
| E2E-06 | 検索                 | キーワードで絞り込み         |
| E2E-07 | Markdownエクスポート | ファイルがダウンロードされる |
| E2E-08 | セッション削除       | セッションが一覧から消える   |

#### 実装

```typescript
// e2e/tests/chat-history.spec.ts
import { test, expect } from "@playwright/test";
import { ChatHistoryPage } from "../pages/ChatHistoryPage";
import { testSession } from "../fixtures/chat-history.fixtures";

test.describe("Chat History Feature", () => {
  let chatHistoryPage: ChatHistoryPage;

  test.beforeEach(async ({ page }) => {
    chatHistoryPage = new ChatHistoryPage(page);
    await page.goto("/");
  });

  test("E2E-01: should create a new session", async ({ page }) => {
    await chatHistoryPage.createSession("My Test Session");

    await expect(page.locator('[data-testid="session-list"]')).toContainText(
      "My Test Session",
    );
  });

  test("E2E-02: should send and display messages", async ({ page }) => {
    await chatHistoryPage.createSession();
    await chatHistoryPage.sendMessage("Hello, AI!");

    await expect(page.locator('[data-testid="message-list"]')).toContainText(
      "Hello, AI!",
    );
  });

  test("E2E-05: should toggle pin status", async ({ page }) => {
    await chatHistoryPage.createSession("Pin Test");
    const sessionId = await page
      .locator('[data-testid^="session-"]')
      .first()
      .getAttribute("data-testid");

    await chatHistoryPage.togglePin(sessionId!.replace("session-", ""));

    await expect(page.locator('[data-testid="pinned-sessions"]')).toContainText(
      "Pin Test",
    );
  });

  test("E2E-06: should search sessions by keyword", async ({ page }) => {
    await chatHistoryPage.createSession("Unique Search Term");
    await chatHistoryPage.searchSessions("Unique");

    await expect(page.locator('[data-testid="session-list"]')).toContainText(
      "Unique Search Term",
    );
  });

  test("E2E-08: should delete a session", async ({ page }) => {
    await chatHistoryPage.createSession("Delete Me");
    const sessionId = await page
      .locator('[data-testid^="session-"]')
      .first()
      .getAttribute("data-testid");

    await chatHistoryPage.deleteSession(sessionId!.replace("session-", ""));

    await expect(
      page.locator('[data-testid="session-list"]'),
    ).not.toContainText("Delete Me");
  });
});
```

#### 成果物

- `chat-history.spec.ts`

#### 完了条件

- 全テストケースがローカルでPASS
- テストが独立して実行可能

---

### Phase 3: フラグテスト実装

#### 目的

フィーチャーフラグ切り替え時の動作を検証する。

#### テストケース

| TC-ID | シナリオ             | 検証内容           |
| ----- | -------------------- | ------------------ |
| FF-01 | 新アーキテクチャON   | 新実装が使用される |
| FF-02 | 新アーキテクチャOFF  | 旧実装が使用される |
| FF-03 | 切り替え時データ保持 | データが消失しない |
| FF-04 | 切り替え後の機能検証 | 全機能が正常動作   |

#### 実装

```typescript
// e2e/tests/feature-flag-toggle.spec.ts
import { test, expect } from "@playwright/test";
import { ChatHistoryPage } from "../pages/ChatHistoryPage";

test.describe("Feature Flag Toggle", () => {
  test("FF-01: should use new architecture when flag is ON", async ({
    page,
  }) => {
    // フラグONで起動
    await page.evaluate(() => {
      localStorage.setItem("USE_NEW_CHAT_HISTORY_ARCH", "true");
    });
    await page.reload();

    // 新アーキテクチャ固有の動作を検証
    await expect(page.locator('[data-arch="new"]')).toBeVisible();
  });

  test("FF-02: should use legacy architecture when flag is OFF", async ({
    page,
  }) => {
    // フラグOFFで起動
    await page.evaluate(() => {
      localStorage.setItem("USE_NEW_CHAT_HISTORY_ARCH", "false");
    });
    await page.reload();

    // 旧アーキテクチャの動作を検証
    await expect(page.locator('[data-arch="legacy"]')).toBeVisible();
  });

  test("FF-03: should preserve data when toggling flag", async ({ page }) => {
    const chatHistoryPage = new ChatHistoryPage(page);

    // フラグONでセッション作成
    await page.evaluate(() => {
      localStorage.setItem("USE_NEW_CHAT_HISTORY_ARCH", "true");
    });
    await page.reload();
    await chatHistoryPage.createSession("Preserved Session");

    // フラグOFFに切り替え
    await page.evaluate(() => {
      localStorage.setItem("USE_NEW_CHAT_HISTORY_ARCH", "false");
    });
    await page.reload();

    // データが保持されていることを確認
    await expect(page.locator('[data-testid="session-list"]')).toContainText(
      "Preserved Session",
    );
  });
});
```

#### 成果物

- `feature-flag-toggle.spec.ts`

#### 完了条件

- フラグ切り替えテストがPASS
- データ整合性が保証される

---

### Phase 4: CI/CD統合

#### 目的

GitHub ActionsでE2Eテストを自動実行する。

#### 手順

1. GitHub Actionsワークフローを作成/更新:
   2. package.jsonにスクリプト追加:

   ```json
   {
     "scripts": {
       "test:e2e": "playwright test",
       "test:e2e:ui": "playwright test --ui"
     }
   }
   ```

2. テストレポート設定:

   ```typescript
   // playwright.config.ts
   reporter: [
     ['html', { outputFolder: 'playwright-report' }],
     ['json', { outputFile: 'playwright-report/results.json' }],
   ],
   ```

#### 成果物

- `.github/workflows/e2e-tests.yml`
- `package.json`（更新）

#### 完了条件

- CIパイプラインでE2Eテストが自動実行
- テストレポートがアーティファクトとして保存

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 全E2Eテストケース（E2E-01〜E2E-08）がPASS
- [ ] フィーチャーフラグテスト（FF-01〜FF-04）がPASS
- [ ] Page Objectパターンで実装されている

### 品質要件

- [ ] テストが独立して実行可能
- [ ] テスト実行時間が5分以内
- [ ] Flaky Testなし（連続3回PASS）

### CI/CD要件

- [ ] GitHub ActionsでE2Eテストが実行される
- [ ] テストレポートがアーティファクトとして保存される
- [ ] PRマージ時にE2Eテストが必須化

---

## 6. 検証方法

### ローカル実行

```bash
# E2Eテスト実行
pnpm --filter @repo/desktop test:e2e

# UIモードで実行（デバッグ用）
pnpm --filter @repo/desktop test:e2e:ui

# 特定テストのみ実行
pnpm --filter @repo/desktop test:e2e -- chat-history.spec.ts
```

### CI実行

- PRを作成してGitHub Actionsの実行を確認
- Artifacts からplaywright-reportをダウンロードして検証

---

## 7. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                           |
| ------------------------ | ------ | -------- | ------------------------------ |
| Electron E2Eの不安定性   | 高     | 中       | リトライ設定、待機処理の適切化 |
| テストデータの競合       | 中     | 中       | テストごとにデータをリセット   |
| CI環境とローカルの差異   | 中     | 低       | Dockerによる環境統一を検討     |
| フィーチャーフラグ未実装 | 高     | -        | フラグ実装完了後に本タスク着手 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント         | パス                                                                           |
| -------------------- | ------------------------------------------------------------------------------ |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` |
| テスト戦略           | `.claude/skills/aiworkflow-requirements/references/testing-strategy.md`        |
| CI/CD設定            | `.github/workflows/`                                                           |

### 参考資料

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Electron Testing](https://playwright.dev/docs/electron)
- [Page Object Model](https://playwright.dev/docs/pom)

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
Phase 11手動テスト結果より:

UT-003: E2Eテスト追加
- 概要: フィーチャーフラグ実装後にE2Eテストを追加する
- 詳細: `USE_NEW_CHAT_HISTORY_ARCH`フラグによる切り替えテスト
- 優先度: Medium
- 対応期限: フィーチャーフラグ実装後
- ステータス: 待機中（フィーチャーフラグ実装待ち）
```

### 補足事項

- フィーチャーフラグが実装されるまで本タスクは待機状態
- UT-002（手動テスト）の結果をE2Eテストケースに反映
- ビジュアルリグレッションテストは別タスクで対応予定

---

**作成日**: 2026-01-19
**作成者**: Claude Code
**バージョン**: 1.0
