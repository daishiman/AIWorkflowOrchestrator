# PermissionResolver E2E統合テスト - タスク指示書

## メタ情報

```yaml
issue_number: 506
```

## メタ情報

| 項目         | 内容                                         |
| ------------ | -------------------------------------------- |
| タスクID     | TASK-8c                                      |
| タスク名     | PermissionResolver E2E統合テスト             |
| 分類         | テスト                                       |
| 対象機能     | PermissionResolver → IPC → UI → 判断結果返却 |
| 優先度       | 中                                           |
| 見積もり規模 | 小規模                                       |
| ステータス   | 未実施                                       |
| 発見元       | TASK-3-2（PermissionResolver実装）完了時     |
| 発見日       | 2026-01-25                                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-3-2でPermissionResolverクラス（権限確認管理）の単体テストが完了した（42テストケース、100%カバレッジ）。しかし、実際のElectron環境での以下の統合動作は未検証：

- Main Process → IPC → Renderer Processの通信
- Renderer ProcessでのUI表示
- ユーザー操作 → IPC → Main Processへの判断返却
- 実際のスキル実行フロー内での権限確認

### 1.2 問題点・課題

単体テストでは以下がモック化されている：

- IPC通信（Main ↔ Renderer）
- BrowserWindow操作
- 実際のUI描画・ユーザー操作

これらを実際の環境で検証するE2Eテストが必要。

### 1.3 放置した場合の影響

- 実環境での統合動作が保証されない
- IPC通信のタイミング問題が発見されない
- UI/UXの問題が見逃される
- リリース後に権限確認機能の不具合が発生するリスク

---

## 2. 何を達成するか（What）

### 2.1 目的

PermissionResolverの実環境での統合動作をPlaywrightでE2Eテストし、権限確認フローが正しく機能することを検証する。

### 2.2 最終ゴール

- E2Eテストスイートが作成されている
- 全E2Eテストケースがパスする
- CI/CDで自動実行される
- 実環境での動作が保証される

### 2.3 スコープ

#### 含むもの

- Playwright E2Eテストスイート作成
- 権限確認ダイアログの表示テスト
- 各判断（allow/deny/always_allow/always_deny）のE2Eテスト
- タイムアウトシナリオのテスト
- 複数リクエストのキューイングテスト
- CI/CD統合

#### 含まないもの

- PermissionResolver本体の変更
- IPC Handler本体の変更（TASK-4-2で実装）
- 新機能追加

### 2.4 成果物

- `apps/desktop/e2e/permission-resolver.spec.ts`（新規）
- `apps/desktop/e2e/fixtures/permission-test-skill/`（テスト用スキル）
- CI/CD設定更新（必要に応じて）
- テスト結果レポート

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-3-2（PermissionResolver実装）が完了していること ✅
- TASK-4-2（IPC Handlers）が完了していること
- E2Eテスト環境（Playwright）がセットアップされていること

### 3.2 依存タスク

| タスクID   | タスク名               | ステータス |
| ---------- | ---------------------- | ---------- |
| TASK-3-2   | PermissionResolver実装 | 完了       |
| TASK-4-2   | IPC Handlers           | 未実施     |
| TASK-3-1-A | SDK query() 基本実装   | 完了       |

### 3.3 必要な知識

- Playwright（Electron E2Eテスト）
- Electron IPC
- TypeScript
- スキル実行フロー全体像

### 3.4 推奨アプローチ

#### E2Eテスト構造

```typescript
// apps/desktop/e2e/permission-resolver.spec.ts
import { test, expect, ElectronApplication, Page } from "@playwright/test";
import { _electron as electron } from "playwright";

test.describe("PermissionResolver E2E", () => {
  let electronApp: ElectronApplication;
  let page: Page;

  test.beforeAll(async () => {
    electronApp = await electron.launch({
      args: ["apps/desktop/dist/main/index.js"],
    });
    page = await electronApp.firstWindow();
  });

  test.afterAll(async () => {
    await electronApp.close();
  });

  test("スキル実行時に権限確認ダイアログが表示される", async () => {
    // 1. テスト用スキルを選択
    await page.click('[data-testid="skill-selector"]');
    await page.click('[data-testid="skill-item-test-permission"]');

    // 2. スキル実行
    await page.fill('[data-testid="skill-prompt"]', "test permission");
    await page.click('[data-testid="skill-execute-button"]');

    // 3. 権限確認ダイアログが表示されることを確認
    await expect(
      page.locator('[data-testid="permission-dialog"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="permission-tool-name"]'),
    ).toContainText("Bash");
  });

  test("allowボタンで権限が許可される", async () => {
    // ... セットアップ ...

    // allowボタンをクリック
    await page.click('[data-testid="permission-allow-button"]');

    // ダイアログが閉じる
    await expect(
      page.locator('[data-testid="permission-dialog"]'),
    ).not.toBeVisible();

    // スキル実行が継続される
    await expect(page.locator('[data-testid="skill-output"]')).toContainText(
      "executed",
    );
  });

  test("denyボタンで権限が拒否される", async () => {
    // ... セットアップ ...

    // denyボタンをクリック
    await page.click('[data-testid="permission-deny-button"]');

    // エラーメッセージが表示される
    await expect(page.locator('[data-testid="skill-error"]')).toContainText(
      "Permission denied",
    );
  });

  test("タイムアウト時にエラーが発生する", async () => {
    // 短いタイムアウトを設定してテスト
    // ...
  });

  test("複数の権限リクエストが順番に処理される", async () => {
    // 複数ツールを使用するスキルを実行
    // 権限確認が順番に表示されることを確認
    // ...
  });
});
```

#### テスト用スキル

```markdown
## <!-- apps/desktop/e2e/fixtures/permission-test-skill/SKILL.md -->

name: permission-test-skill
description: E2Eテスト用のスキル
allowed-tools:

- Bash

---

# Permission Test Skill

テスト用に権限確認が必要なツールを使用するスキル。

## 実行時の動作

1. Bashツールを使用（権限確認が発生）
2. 許可された場合: `executed` を出力
3. 拒否された場合: エラー
```

---

## 4. 実行手順

### Phase構成

簡易構成（テストタスクのため）

### Phase 1: テスト設計

#### 目的

E2Eテストケースの設計

#### 手順

1. テストシナリオを洗い出す
2. テストケースを定義
3. テストデータ（テスト用スキル）を準備

#### 成果物

- `outputs/phase-1/test-design.md`

#### 完了条件

- テストケースが定義されている
- テスト用スキルが準備されている

### Phase 2: テスト実装

#### 目的

Playwright E2Eテストの実装

#### 手順

1. テストスイートを作成
2. テスト用スキルを配置
3. 各テストケースを実装

#### 成果物

- `apps/desktop/e2e/permission-resolver.spec.ts`
- `apps/desktop/e2e/fixtures/`

#### 完了条件

- 全テストケースが実装されている
- ローカルでテストが実行できる

### Phase 3: CI/CD統合

#### 目的

自動実行環境の整備

#### 手順

1. CI/CD設定を確認・更新
2. E2Eテストが自動実行されることを確認

#### 成果物

- CI/CD設定（更新が必要な場合）

#### 完了条件

- CI/CDでE2Eテストが実行される

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 権限確認ダイアログ表示テストがパス
- [ ] allow判断テストがパス
- [ ] deny判断テストがパス
- [ ] always_allow判断テストがパス
- [ ] always_deny判断テストがパス
- [ ] タイムアウトテストがパス
- [ ] 複数リクエストキューイングテストがパス

### 品質要件

- [ ] 全E2Eテストがローカルで実行可能
- [ ] CI/CDで自動実行される
- [ ] テスト実行時間が許容範囲内（5分以内）

### ドキュメント要件

- [ ] テスト実行方法がドキュメント化されている
- [ ] テストシナリオが明文化されている

---

## 6. 検証方法

### テストケース

| TC-ID     | テスト内容               | 期待結果                           |
| --------- | ------------------------ | ---------------------------------- |
| TC-8c-001 | 権限確認ダイアログ表示   | ダイアログが正しく表示される       |
| TC-8c-002 | ツール名・理由の表示     | 正しい情報が表示される             |
| TC-8c-003 | allowボタン              | 権限許可、スキル実行継続           |
| TC-8c-004 | denyボタン               | 権限拒否、エラー表示               |
| TC-8c-005 | always_allowボタン       | 権限許可、以降同ツール自動許可     |
| TC-8c-006 | always_denyボタン        | 権限拒否、以降同ツール自動拒否     |
| TC-8c-007 | タイムアウト             | タイムアウトエラー表示             |
| TC-8c-008 | 複数リクエスト           | 順番にダイアログ表示               |
| TC-8c-009 | キャンセル（スキル中断） | 全権限リクエストがキャンセルされる |

### 検証手順

1. ローカルでE2Eテスト実行
   ```bash
   pnpm --filter @repo/desktop test:e2e
   ```
2. CI/CDでの自動実行確認
3. テスト結果レポートの確認

---

## 7. リスクと対策

| リスク                 | 影響度 | 発生確率 | 対策                       |
| ---------------------- | ------ | -------- | -------------------------- |
| E2Eテストの不安定性    | 中     | 高       | リトライ機構、待機時間調整 |
| CI環境でのElectron起動 | 高     | 中       | xvfb使用、ヘッドレスモード |
| テスト実行時間の長期化 | 低     | 中       | 並列実行、最適化           |

---

## 8. 参照情報

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料      | パス                                                                        | 内容                   |
| ------------- | --------------------------------------------------------------------------- | ---------------------- |
| Agent SDK仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | PermissionResolver仕様 |
| テスト戦略    | `.claude/skills/aiworkflow-requirements/references/testing-strategy.md`     | E2Eテスト基準          |

### 関連ドキュメント

- TASK-3-2実装ガイド: `docs/30-workflows/TASK-3-2-permission-resolver/outputs/phase-12/implementation-guide.md`
- 既存E2Eテスト: `apps/desktop/e2e/`

### 参考資料

- Playwright Electron Testing: https://playwright.dev/docs/api/class-electron

---

## 9. 備考

### 関連タスク

| タスクID   | 関係性                     |
| ---------- | -------------------------- |
| TASK-3-2   | 依存（PermissionResolver） |
| TASK-4-2   | 依存（IPC Handlers）       |
| TASK-3-1-A | 関連（SkillExecutor）      |

### 補足事項

- TASK-4-2（IPC Handlers）完了後に実施可能
- 既存のE2Eテストインフラを活用
- CI/CDでの実行にはxvfb等のディスプレイ仮想化が必要な場合あり
