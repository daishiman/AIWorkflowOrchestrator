# Phase 4: テスト作成（TDD: Red）— Phase 11 Worktree環境テストプロトコル標準化

## メタ情報

| 項目       | 内容                                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | UT-IMP-PHASE11-WORKTREE-PROTOCOL-001                                                                                              |
| Phase      | 4                                                                                                                                 |
| タスク名   | Phase 11 Worktree環境テストプロトコル標準化                                                                                       |
| 機能名     | ut-imp-phase11-worktree-protocol                                                                                                  |
| Issue      | #853                                                                                                                              |
| 作成日     | 2026-03-01                                                                                                                        |
| 前提Phase  | Phase 3（設計レビュー）完了済み                                                                                                   |
| 次Phase    | Phase 5（実装: TDD Green）                                                                                                        |
| 依存成果物 | `outputs/phase-1/requirements-definition.md`, `outputs/phase-2/architecture-design.md`, `outputs/phase-3/design-review-result.md` |

## 目的

Phase 2 で設計したテスト3層分類（Layer 1: 自動テスト / Layer 2: 静的コード検証 / Layer 3: UI操作・実環境テスト）に基づき、以下のテストを TDD の Red フェーズとして先行作成する。

1. Worktree 環境判定ロジックのユニットテスト（5ケース）
2. deferred-tests.md パーサーのユニットテスト（6ケース）
3. Layer 分類判定ロジックのユニットテスト（7ケース）
4. skill:remove IPC E2E テスト（Playwright / 5ケース）
5. skill:import IPC E2E テスト（Playwright / 5ケース）
6. CI 統合テスト設計（4ケース: 文書化のみ、コードは Phase 5 で作成）

全テストは Red 状態（実装が存在しないため失敗する）であることを前提とする。

## 実行タスク

- Task 1: Worktree 環境判定ロジックのユニットテスト作成（5ケース）
- Task 2: deferred-tests.md パーサーのユニットテスト作成（6ケース）
- Task 3: Layer 分類判定ロジックのユニットテスト作成（7ケース）
- Task 4: E2E テスト `ipc-skill-remove.spec.ts` の設計・作成（5ケース）
- Task 5: E2E テスト `ipc-skill-import.spec.ts` の設計・作成（5ケース）
- Task 6: CI 統合テスト設計の文書化（4ケース）

## 参照資料

| 資料                                                                                        | 用途                                             |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `outputs/phase-1/requirements-definition.md`                                                | 要件定義（FR-1〜FR-7、AC-01〜AC-12）             |
| `outputs/phase-1/acceptance-criteria.md`                                                    | 受入基準（テストケースの網羅性基準）             |
| `outputs/phase-1/scope-definition.md`                                                       | スコープ定義（含む/含まない範囲の確認）          |
| `outputs/phase-2/architecture-design.md`                                                    | アーキテクチャ設計（E2Eテスト技術設計）          |
| `outputs/phase-3/design-review-result.md`                                                   | 設計レビュー結果（指摘事項の反映確認）           |
| `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC契約テストの観点（ハンドラ/Preload/channels） |
| `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC セキュリティ原則（テスト観点の参照）         |
| `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Playwright/E2E実装の再利用パターン               |
| `.claude/skills/aiworkflow-requirements/references/testing-playwright-e2e.md`               | Electron E2Eテスト設計の基準                     |
| `.claude/rules/06-known-pitfalls.md`                                                        | P40, P42, P44, P45（テスト設計の注意点）         |
| `apps/desktop/playwright.config.ts`                                                         | 既存 Playwright 設定（整合性確認）               |
| `apps/desktop/e2e/skill-permission.spec.ts`                                                 | 既存 E2E テストの実装パターン参照                |

## 実行手順

### Task 1: ユニットテスト — Worktree 環境判定ロジック

**テストファイル**: `apps/desktop/src/main/utils/__tests__/worktree-detector.test.ts`

**テストケース一覧**:

| TC-ID    | テスト内容                                                           | 期待結果               | 対応AC |
| -------- | -------------------------------------------------------------------- | ---------------------- | ------ |
| UT-WD-01 | `.git` がディレクトリの場合、`false` を返す                          | `isWorktree === false` | AC-10  |
| UT-WD-02 | `.git` がファイルの場合、`true` を返す                               | `isWorktree === true`  | AC-10  |
| UT-WD-03 | `.git` が存在しない場合、`false` を返す                              | `isWorktree === false` | AC-10  |
| UT-WD-04 | `.git` ファイルの内容が `gitdir: ` で始まる場合、Worktree と判定する | `isWorktree === true`  | AC-10  |
| UT-WD-05 | `.git` ファイルの内容が不正な場合、`false` を返す                    | `isWorktree === false` | AC-10  |

**テストコード構造**:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { isWorktreeEnvironment } from "../worktree-detector";

vi.mock("node:fs");

describe("isWorktreeEnvironment", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("UT-WD-01: .git がディレクトリの場合 false を返す", () => {
    // Arrange: fs.statSync が isFile() === false, isDirectory() === true を返すようモック
    // Act: isWorktreeEnvironment() を呼び出す
    // Assert: false が返ることを検証
    expect(true).toBe(false); // Red: 未実装のため失敗
  });

  it("UT-WD-02: .git がファイルの場合 true を返す", () => {
    // Arrange: fs.statSync が isFile() === true を返すようモック
    // Arrange: fs.readFileSync が "gitdir: /path/to/.git/worktrees/xxx" を返すようモック
    // Act: isWorktreeEnvironment() を呼び出す
    // Assert: true が返ることを検証
    expect(true).toBe(false); // Red: 未実装のため失敗
  });

  it("UT-WD-03: .git が存在しない場合 false を返す", () => {
    // Arrange: fs.statSync が ENOENT エラーを throw するようモック
    // Act: isWorktreeEnvironment() を呼び出す
    // Assert: false が返ることを検証
    expect(true).toBe(false); // Red: 未実装のため失敗
  });

  it("UT-WD-04: .git ファイルの内容が gitdir: で始まる場合 true を返す", () => {
    // Arrange: fs.statSync が isFile() === true を返すようモック
    // Arrange: fs.readFileSync が "gitdir: /absolute/path/.git/worktrees/branch-name" を返す
    // Act: isWorktreeEnvironment() を呼び出す
    // Assert: true が返ることを検証
    expect(true).toBe(false); // Red: 未実装のため失敗
  });

  it("UT-WD-05: .git ファイルの内容が不正な場合 false を返す", () => {
    // Arrange: fs.statSync が isFile() === true を返すようモック
    // Arrange: fs.readFileSync が "invalid content" を返すようモック
    // Act: isWorktreeEnvironment() を呼び出す
    // Assert: false が返ることを検証
    expect(true).toBe(false); // Red: 未実装のため失敗
  });
});
```

### Task 2: ユニットテスト — deferred-tests.md パーサー

**テストファイル**: `apps/desktop/src/main/utils/__tests__/deferred-tests-parser.test.ts`

**テストケース一覧**:

| TC-ID    | テスト内容                                                           | 期待結果                                                          | 対応AC |
| -------- | -------------------------------------------------------------------- | ----------------------------------------------------------------- | ------ |
| UT-DP-01 | 有効な deferred-tests.md をパースし、テスト項目一覧を返す            | テスト項目の配列（`id`, `reason`, `status`, `environment`）を返す | AC-09  |
| UT-DP-02 | 空ファイルをパースした場合、空配列を返す                             | `items` が空配列 `[]`                                             | AC-09  |
| UT-DP-03 | テーブル形式が不正な場合、`ParseError` を throw する                 | `ParseError` が throw される                                      | AC-09  |
| UT-DP-04 | 全項目が「完了」の場合、`allResolved === true` を返す                | `allResolved === true`                                            | AC-09  |
| UT-DP-05 | 未解消項目がある場合、`allResolved === false` を返す                 | `allResolved === false`                                           | AC-09  |
| UT-DP-06 | ファイルが存在しない場合、`DeferredTestsNotFoundError` を throw する | `DeferredTestsNotFoundError` が throw される                      | AC-09  |

**テストコード構造**:

```typescript
import { describe, it, expect, vi } from "vitest";
import {
  parseDeferredTests,
  DeferredTestsNotFoundError,
  ParseError,
} from "../deferred-tests-parser";

describe("parseDeferredTests", () => {
  it("UT-DP-01: 有効なファイルからテスト項目を抽出する", () => {
    const content = `
| ID | テスト内容 | スキップ理由 | 実行予定環境 | 期限 | ステータス |
| --- | --- | --- | --- | --- | --- |
| DT-001 | UI表示確認 | Worktree環境でElectron起動不可 | メインリポジトリ | 2026-03-15 | 未実施 |
`;
    const result = parseDeferredTests(content);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe("DT-001");
    expect(result.items[0].reason).toBe("Worktree環境でElectron起動不可");
    expect(result.items[0].status).toBe("未実施");
    expect(result.items[0].environment).toBe("メインリポジトリ");
  });

  it("UT-DP-02: 空ファイルをパースした場合、空配列を返す", () => {
    const result = parseDeferredTests("");
    expect(result.items).toEqual([]);
  });

  it("UT-DP-03: テーブル形式が不正な場合、ParseError を throw する", () => {
    expect(() => parseDeferredTests("不正なMarkdown")).toThrow(ParseError);
  });

  it("UT-DP-04: 全項目が完了の場合、allResolved === true を返す", () => {
    const content = `
| ID | テスト内容 | スキップ理由 | 実行予定環境 | 期限 | ステータス |
| --- | --- | --- | --- | --- | --- |
| DT-001 | UI表示確認 | Worktree環境 | CI | 2026-03-15 | 完了 |
`;
    const result = parseDeferredTests(content);
    expect(result.allResolved).toBe(true);
  });

  it("UT-DP-05: 未解消項目がある場合、allResolved === false を返す", () => {
    const content = `
| ID | テスト内容 | スキップ理由 | 実行予定環境 | 期限 | ステータス |
| --- | --- | --- | --- | --- | --- |
| DT-001 | UI表示確認 | Worktree環境 | CI | 2026-03-15 | 完了 |
| DT-002 | 操作確認 | Worktree環境 | メインリポジトリ | 2026-03-15 | 未実施 |
`;
    const result = parseDeferredTests(content);
    expect(result.allResolved).toBe(false);
  });

  it("UT-DP-06: ファイルが存在しない場合、DeferredTestsNotFoundError を throw する", () => {
    // ファイルパスベースのパース関数を呼び出す場合
    expect(() => parseDeferredTests(null as unknown as string)).toThrow(
      DeferredTestsNotFoundError,
    );
  });
});
```

### Task 3: ユニットテスト — Layer 分類判定ロジック

**テストファイル**: `apps/desktop/src/main/utils/__tests__/test-layer-classifier.test.ts`

**テストケース一覧**:

| TC-ID    | テスト内容                                                | 期待結果                     | 対応AC |
| -------- | --------------------------------------------------------- | ---------------------------- | ------ |
| UT-LC-01 | `pnpm vitest run` で実行可能なテストを Layer 1 に分類する | `layer === 1`                | AC-01  |
| UT-LC-02 | IPC 契約静的解析テストを Layer 2 に分類する               | `layer === 2`                | AC-01  |
| UT-LC-03 | UI 操作テスト（Electron 実環境必要）を Layer 3 に分類する | `layer === 3`                | AC-01  |
| UT-LC-04 | DevTools コンソール呼び出しテストを Layer 3 に分類する    | `layer === 3`                | AC-01  |
| UT-LC-05 | Worktree 環境で Layer 1 テストが実施可能と判定する        | `canRunInWorktree === true`  | AC-10  |
| UT-LC-06 | Worktree 環境で Layer 2 テストが実施可能と判定する        | `canRunInWorktree === true`  | AC-10  |
| UT-LC-07 | Worktree 環境で Layer 3 テストが実施不可と判定する        | `canRunInWorktree === false` | AC-10  |

**テストコード構造**:

```typescript
import { describe, it, expect } from "vitest";
import {
  classifyTestLayer,
  canRunInWorktree,
  type TestItem,
  type TestLayer,
} from "../test-layer-classifier";

describe("classifyTestLayer", () => {
  it("UT-LC-01: vitest 実行可能テストを Layer 1 に分類する", () => {
    const testItem: TestItem = {
      type: "unit-test",
      runner: "vitest",
      requiresElectron: false,
      requiresUI: false,
    };
    expect(classifyTestLayer(testItem)).toBe(1 as TestLayer);
  });

  it("UT-LC-02: IPC 契約静的解析テストを Layer 2 に分類する", () => {
    const testItem: TestItem = {
      type: "static-analysis",
      runner: "typecheck",
      requiresElectron: false,
      requiresUI: false,
    };
    expect(classifyTestLayer(testItem)).toBe(2 as TestLayer);
  });

  it("UT-LC-03: UI 操作テストを Layer 3 に分類する", () => {
    const testItem: TestItem = {
      type: "e2e",
      runner: "playwright",
      requiresElectron: true,
      requiresUI: true,
    };
    expect(classifyTestLayer(testItem)).toBe(3 as TestLayer);
  });

  it("UT-LC-04: DevTools コンソールテストを Layer 3 に分類する", () => {
    const testItem: TestItem = {
      type: "manual",
      runner: "devtools",
      requiresElectron: true,
      requiresUI: true,
    };
    expect(classifyTestLayer(testItem)).toBe(3 as TestLayer);
  });
});

describe("canRunInWorktree", () => {
  it("UT-LC-05: Layer 1 テストは Worktree 環境で実行可能", () => {
    expect(canRunInWorktree(1 as TestLayer)).toBe(true);
  });

  it("UT-LC-06: Layer 2 テストは Worktree 環境で実行可能", () => {
    expect(canRunInWorktree(2 as TestLayer)).toBe(true);
  });

  it("UT-LC-07: Layer 3 テストは Worktree 環境で実行不可", () => {
    expect(canRunInWorktree(3 as TestLayer)).toBe(false);
  });
});
```

### Task 4: E2E テスト — skill:remove IPC テスト

**テストファイル**: `apps/desktop/e2e/ipc-skill-remove.spec.ts`

Playwright の `_electron.launch()` を使用した Electron アプリ起動テスト。

**テストケース一覧**:

| TC-ID     | テスト内容                                                     | 期待結果                                                        | 対応AC       |
| --------- | -------------------------------------------------------------- | --------------------------------------------------------------- | ------------ |
| E2E-SR-01 | 存在するスキルの削除が成功する                                 | `removeSkill("test-skill")` が成功レスポンスを返す              | AC-02        |
| E2E-SR-02 | 削除が永続化される（再起動後もスキルが存在しない）             | 再起動後に `getSkills()` でスキルが含まれない                   | AC-02        |
| E2E-SR-03 | 存在しないスキル名を指定した場合、エラーレスポンスを返す       | エラーコードが返される                                          | AC-02        |
| E2E-SR-04 | 空文字列を指定した場合、バリデーションエラーを返す             | `VALIDATION_ERROR` コードが返される                             | AC-02, AC-04 |
| E2E-SR-05 | スペースのみの文字列を指定した場合、バリデーションエラーを返す | `VALIDATION_ERROR` コードが返される（P42準拠3段バリデーション） | AC-02, AC-04 |

**テストコード構造**:

```typescript
import {
  test,
  expect,
  _electron as electron,
  type ElectronApplication,
  type Page,
} from "@playwright/test";

let app: ElectronApplication;
let page: Page;

test.beforeAll(async () => {
  app = await electron.launch({
    args: ["apps/desktop/out/main/index.js"],
    env: { ...process.env, NODE_ENV: "test" },
  });
  page = await app.firstWindow();
});

test.afterAll(async () => {
  await app.close();
});

test.describe("skill:remove IPC E2E テスト", () => {
  test("E2E-SR-01: 存在するスキルの削除が成功する", async () => {
    const result = await page.evaluate(async () => {
      return await window.electronAPI.skill.removeSkill("test-skill");
    });
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  test("E2E-SR-02: 削除が永続化される", async () => {
    // 削除実行
    await page.evaluate(async () => {
      return await window.electronAPI.skill.removeSkill("test-skill");
    });
    // アプリ再起動
    await app.close();
    app = await electron.launch({
      args: ["apps/desktop/out/main/index.js"],
      env: { ...process.env, NODE_ENV: "test" },
    });
    page = await app.firstWindow();
    // スキル一覧を取得し、削除されたスキルが含まれないことを確認
    const skills = await page.evaluate(async () => {
      return await window.electronAPI.skill.getSkills();
    });
    expect(
      skills.find((s: { name: string }) => s.name === "test-skill"),
    ).toBeUndefined();
  });

  test("E2E-SR-03: 存在しないスキル名でエラーレスポンスを返す", async () => {
    const result = await page.evaluate(async () => {
      try {
        return await window.electronAPI.skill.removeSkill("non-existent-skill");
      } catch (error) {
        return error;
      }
    });
    expect(result).toHaveProperty("code");
  });

  test("E2E-SR-04: 空文字列でバリデーションエラーを返す", async () => {
    const result = await page.evaluate(async () => {
      try {
        return await window.electronAPI.skill.removeSkill("");
      } catch (error) {
        return error;
      }
    });
    expect(result).toHaveProperty("code", "VALIDATION_ERROR");
  });

  test("E2E-SR-05: スペースのみでバリデーションエラーを返す（P42準拠）", async () => {
    const result = await page.evaluate(async () => {
      try {
        return await window.electronAPI.skill.removeSkill("   ");
      } catch (error) {
        return error;
      }
    });
    expect(result).toHaveProperty("code", "VALIDATION_ERROR");
  });
});
```

### Task 5: E2E テスト — skill:import IPC テスト

**テストファイル**: `apps/desktop/e2e/ipc-skill-import.spec.ts`

**テストケース一覧**:

| TC-ID     | テスト内容                                                     | 期待結果                                                        | 対応AC       |
| --------- | -------------------------------------------------------------- | --------------------------------------------------------------- | ------------ |
| E2E-SI-01 | 有効なスキル名のインポートが成功する                           | `importSkill("valid-skill")` が成功レスポンスを返す             | AC-03        |
| E2E-SI-02 | インポートが永続化される（再起動後もスキルが存在する）         | 再起動後に `getSkills()` でスキルが含まれる                     | AC-03        |
| E2E-SI-03 | 存在しないスキル名を指定した場合、エラーレスポンスを返す       | エラーコードが返される                                          | AC-03        |
| E2E-SI-04 | 空文字列を指定した場合、バリデーションエラーを返す             | `VALIDATION_ERROR` コードが返される                             | AC-03, AC-04 |
| E2E-SI-05 | スペースのみの文字列を指定した場合、バリデーションエラーを返す | `VALIDATION_ERROR` コードが返される（P42準拠3段バリデーション） | AC-03, AC-04 |

**テストコード構造**:

```typescript
import {
  test,
  expect,
  _electron as electron,
  type ElectronApplication,
  type Page,
} from "@playwright/test";

let app: ElectronApplication;
let page: Page;

test.beforeAll(async () => {
  app = await electron.launch({
    args: ["apps/desktop/out/main/index.js"],
    env: { ...process.env, NODE_ENV: "test" },
  });
  page = await app.firstWindow();
});

test.afterAll(async () => {
  await app.close();
});

test.describe("skill:import IPC E2E テスト", () => {
  test("E2E-SI-01: 有効なスキル名のインポートが成功する", async () => {
    const result = await page.evaluate(async () => {
      return await window.electronAPI.skill.importSkill("valid-skill");
    });
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  test("E2E-SI-02: インポートが永続化される", async () => {
    await page.evaluate(async () => {
      return await window.electronAPI.skill.importSkill("persist-skill");
    });
    await app.close();
    app = await electron.launch({
      args: ["apps/desktop/out/main/index.js"],
      env: { ...process.env, NODE_ENV: "test" },
    });
    page = await app.firstWindow();
    const skills = await page.evaluate(async () => {
      return await window.electronAPI.skill.getSkills();
    });
    expect(
      skills.find((s: { name: string }) => s.name === "persist-skill"),
    ).toBeDefined();
  });

  test("E2E-SI-03: 存在しないスキル名でエラーレスポンスを返す", async () => {
    const result = await page.evaluate(async () => {
      try {
        return await window.electronAPI.skill.importSkill(
          "non-existent-skill-xyz",
        );
      } catch (error) {
        return error;
      }
    });
    expect(result).toHaveProperty("code");
  });

  test("E2E-SI-04: 空文字列でバリデーションエラーを返す", async () => {
    const result = await page.evaluate(async () => {
      try {
        return await window.electronAPI.skill.importSkill("");
      } catch (error) {
        return error;
      }
    });
    expect(result).toHaveProperty("code", "VALIDATION_ERROR");
  });

  test("E2E-SI-05: スペースのみでバリデーションエラーを返す（P42準拠）", async () => {
    const result = await page.evaluate(async () => {
      try {
        return await window.electronAPI.skill.importSkill("   ");
      } catch (error) {
        return error;
      }
    });
    expect(result).toHaveProperty("code", "VALIDATION_ERROR");
  });
});
```

### Task 6: CI 統合テスト設計

CI 環境（ubuntu-latest）での headless Electron 起動テストの設計を文書化する。コードは Phase 5 で作成する。

| TC-ID | テスト内容                                        | 期待結果                                         | 対応AC |
| ----- | ------------------------------------------------- | ------------------------------------------------ | ------ |
| CI-01 | `xvfb-run` で Electron アプリが headless 起動する | プロセスが正常に起動し、ウィンドウが作成される   | AC-06  |
| CI-02 | headless 環境で E2E テストスイートが全 PASS する  | 全テストケースが PASS する                       | AC-06  |
| CI-03 | テスト失敗時にスクリーンショットが生成される      | `test-results/` にスクリーンショットが保存される | AC-06  |
| CI-04 | タイムアウト（15分）以内にテストが完了する        | テスト実行時間が15分未満で完了する               | AC-11  |

**CI ワークフロー設計**:

```yaml
# .github/workflows/ci.yml への追加ジョブ（Phase 5 で実装）
e2e-desktop:
  runs-on: ubuntu-latest
  timeout-minutes: 15
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
    - uses: actions/setup-node@v4
    - run: pnpm install --frozen-lockfile
    - run: pnpm --filter @repo/desktop build
    - run: xvfb-run --auto-servernum pnpm --filter @repo/desktop exec playwright test
```

---

## 統合テスト連携

### IPC 通信の E2E テスト範囲

| IPC チャンネル | テスト内容                                | テスト種別    | テストケース数 |
| -------------- | ----------------------------------------- | ------------- | -------------- |
| `skill:remove` | Renderer → Main の IPC 呼び出しと結果受信 | E2E (Layer 3) | 5              |
| `skill:import` | Renderer → Main の IPC 呼び出しと結果受信 | E2E (Layer 3) | 5              |
| `skill:list`   | スキル一覧取得（削除/インポート後の確認） | E2E (Layer 3) | 2（間接的）    |

### ユニットテストとの補完関係

| テスト観点             | ユニットテスト (Layer 1)         | E2E テスト (Layer 3)               |
| ---------------------- | -------------------------------- | ---------------------------------- |
| バリデーションロジック | ハンドラ内部ロジックの単体検証   | IPC経由での Renderer→Main 通信検証 |
| エラーレスポンス形式   | モックベースのレスポンス形式検証 | 実プロセス間通信でのエラー伝搬検証 |
| 永続化                 | モックベースの保存/読込検証      | アプリ再起動後の状態確認           |
| 3段バリデーション      | 個別の入力パターン検証           | E2E での end-to-end 検証           |

### テスト種別別の受入基準カバレッジ

| AC-ID | ユニットテスト | E2E テスト                  | CI 統合テスト    | ドキュメントレビュー |
| ----- | -------------- | --------------------------- | ---------------- | -------------------- |
| AC-01 | UT-LC-01〜07   | -                           | -                | -                    |
| AC-02 | -              | E2E-SR-01〜05               | -                | -                    |
| AC-03 | -              | E2E-SI-01〜05               | -                | -                    |
| AC-04 | -              | E2E-SR-04,05 / E2E-SI-04,05 | -                | -                    |
| AC-06 | -              | -                           | CI-01〜04        | -                    |
| AC-09 | UT-DP-01〜06   | -                           | -                | -                    |
| AC-10 | UT-WD-01〜05   | -                           | -                | -                    |
| AC-11 | -              | -                           | CI-04            | -                    |
| AC-12 | -              | -                           | CI-02（3回実行） | -                    |

---

## 多角的チェック観点

### セキュリティ観点

- [ ] E2E テストが `validateIpcSender` のチャンネルホワイトリストを通過する IPC のみテストしている
- [ ] テストコード内にハードコードされたシークレット（APIキー、トークン）が含まれていない
- [ ] E2E テスト環境が本番環境と隔離されている（`NODE_ENV: "test"` を設定）
- [ ] テスト用データのみ使用しており、本番データにアクセスしない

### パフォーマンス観点

- [ ] E2E テストスイート全体の実行時間が CI 環境で5分以内に収まる設計である
- [ ] `test.beforeAll` で Electron アプリを1回起動し、テスト間で再利用する
- [ ] 不要な `waitForTimeout` を使用していない（P13 対策）
- [ ] テスト間の状態クリーンアップが `beforeEach` で行われている（P9 対策）

### 既知の落とし穴（Pitfall）対策

- [ ] P40 対策: テスト実行は `apps/desktop/` ディレクトリから行う設計になっている
- [ ] P42 対策: 空文字列（`""`）とスペースのみ（`"   "`）のバリデーションテストケースが含まれている
- [ ] P39 対策: happy-dom 環境では `userEvent` を使用しない（E2E テストは Playwright のため該当しないが、ユニットテストでは `fireEvent` を使用）
- [ ] P44 対策: IPC ハンドラの引数形式（`string`）と E2E テストの呼び出し形式が一致している
- [ ] P45 対策: テストコード内の引数名が `skillName`（`skillId` ではない）で統一されている

### コード品質観点

- [ ] テストコード内に `any` 型が使用されていない
- [ ] テストコード内に `@ts-ignore` / `@ts-expect-error` が使用されていない
- [ ] 各テストケースのアサーションが具体的な値または型で検証されている（曖昧な「成功する」のみの記述がない）
- [ ] テスト間で状態を共有していない（`beforeEach` でリセット）

---

## サブタスク管理

| サブタスク | 担当 | ステータス | 成果物                                                                |
| ---------- | ---- | ---------- | --------------------------------------------------------------------- |
| Task 1     | 自動 | 未着手     | `apps/desktop/src/main/utils/__tests__/worktree-detector.test.ts`     |
| Task 2     | 自動 | 未着手     | `apps/desktop/src/main/utils/__tests__/deferred-tests-parser.test.ts` |
| Task 3     | 自動 | 未着手     | `apps/desktop/src/main/utils/__tests__/test-layer-classifier.test.ts` |
| Task 4     | 自動 | 未着手     | `apps/desktop/e2e/ipc-skill-remove.spec.ts`                           |
| Task 5     | 自動 | 未着手     | `apps/desktop/e2e/ipc-skill-import.spec.ts`                           |
| Task 6     | 自動 | 未着手     | `outputs/phase-4/test-case-design.md`                                 |

---

## タスク100%実行確認

Phase 4 完了時に以下の全項目を確認する:

- [ ] Task 1〜6 の全サブタスクが完了している
- [ ] 全テストファイルが指定パスに配置されている
- [ ] `pnpm --filter @repo/desktop exec vitest run` でユニットテスト（18ケース）が Red 状態（失敗）であることを確認済み
- [ ] E2E テスト（10ケース）のテストコードがコンパイルエラーなく記述されている
- [ ] CI 統合テスト設計（4ケース）が `outputs/phase-4/test-case-design.md` に文書化されている
- [ ] 受入基準（AC-01〜AC-12）ごとに対応するテストケースが存在する

---

## 成果物

| #   | 成果物                        | 配置先                                                                | 種別         |
| --- | ----------------------------- | --------------------------------------------------------------------- | ------------ |
| 1   | Worktree 環境判定テスト       | `apps/desktop/src/main/utils/__tests__/worktree-detector.test.ts`     | テストコード |
| 2   | deferred-tests パーサーテスト | `apps/desktop/src/main/utils/__tests__/deferred-tests-parser.test.ts` | テストコード |
| 3   | Layer 分類判定テスト          | `apps/desktop/src/main/utils/__tests__/test-layer-classifier.test.ts` | テストコード |
| 4   | skill:remove E2E テスト       | `apps/desktop/e2e/ipc-skill-remove.spec.ts`                           | テストコード |
| 5   | skill:import E2E テスト       | `apps/desktop/e2e/ipc-skill-import.spec.ts`                           | テストコード |
| 6   | テストケース設計書            | `outputs/phase-4/test-case-design.md`                                 | ドキュメント |

注: コード成果物（#1〜#5）はソースコードリポジトリの該当ディレクトリに直接配置する。`outputs/` には配置しない。

## 完了条件

- [ ] ユニットテスト 18 ケース（UT-WD-01〜05: 5件、UT-DP-01〜06: 6件、UT-LC-01〜07: 7件）が作成されている
- [ ] E2E テスト 10 ケース（E2E-SR-01〜05: 5件、E2E-SI-01〜05: 5件）が作成されている
- [ ] CI 統合テスト設計 4 ケース（CI-01〜04）が `outputs/phase-4/test-case-design.md` に文書化されている
- [ ] 全ユニットテストが Red 状態（実装がないため失敗する）であることを `pnpm --filter @repo/desktop exec vitest run` で確認済み
- [ ] テストコード内に `any` 型が使用されていない
- [ ] テストコード内に曖昧な期待値（「正しい結果」「成功する」のみ）が存在しない
- [ ] 各テストケースのアサーションが具体的な値または型で検証されている
- [ ] 受入基準（AC-01〜AC-12）のうち AC-01, AC-02, AC-03, AC-04, AC-06, AC-09, AC-10, AC-11, AC-12 に対応するテストが存在する
- [ ] 統合テスト連携テーブル（IPC通信E2Eテスト範囲）が完成している
- [ ] 多角的チェック観点の全項目が確認されている

## 次のPhase

Phase 5: 実装（TDD: Green）— テストを通過させるプロダクションコードを実装する。
