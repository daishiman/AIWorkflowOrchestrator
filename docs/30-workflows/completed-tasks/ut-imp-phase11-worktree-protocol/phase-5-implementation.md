# Phase 5: 実装（TDD: Green）— Phase 11 Worktree環境テストプロトコル標準化

## メタ情報

| 項目       | 内容                                                                                   |
| ---------- | -------------------------------------------------------------------------------------- |
| タスクID   | UT-IMP-PHASE11-WORKTREE-PROTOCOL-001                                                   |
| Phase      | 5                                                                                      |
| タスク名   | Phase 11 Worktree環境テストプロトコル標準化                                            |
| 機能名     | ut-imp-phase11-worktree-protocol                                                       |
| Issue      | #853                                                                                   |
| 作成日     | 2026-03-01                                                                             |
| 前提Phase  | Phase 4（テスト作成: TDD Red）完了済み                                                 |
| 次Phase    | Phase 6（テスト拡充）                                                                  |
| 依存成果物 | `outputs/phase-4/test-case-design.md`, Phase 4 で作成した全テストファイル（5ファイル） |

## 目的

Phase 4 で作成した Red 状態のテスト（ユニットテスト18ケース + E2Eテスト10ケース）を全て Green（成功）にするための最小限のプロダクションコードを実装する。TDD の Green フェーズとして、テストを通過させることに集中し、コード品質の改善は Phase 8（リファクタリング）で行う。

## 実行タスク

- Task 1: Playwright 依存パッケージの追加
- Task 2: playwright.config.ts の作成（Electron E2E テスト用設定）
- Task 3: Worktree 環境判定ユーティリティの実装
- Task 4: deferred-tests.md パーサーの実装
- Task 5: Layer 分類判定ロジックの実装
- Task 6: E2E テストスクリプトの実装（skill:remove, skill:import）
- Task 7: CI/CD ワークフロー更新（`.github/workflows/ci.yml`）
- Task 8: Phase 11 テンプレート更新（.claude/skills/task-specification-creator/references/phase-11-12-guide.md）
- Task 9: deferred-tests.md テンプレート作成

## 参照資料

| 資料                                                                                        | 用途                                          |
| ------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `outputs/phase-4/test-case-design.md`                                                       | テストケース一覧（テストを Green にする基準） |
| `outputs/phase-2/architecture-design.md`                                                    | アーキテクチャ設計（実装構造の参照）          |
| `outputs/phase-3/design-review-report.md`                                                   | 設計レビュー指摘事項（反映確認）              |
| `outputs/phase-1/requirements-definition.md`                                                | 要件定義（FR-1〜FR-7）                        |
| `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC契約同期（ハンドラ/Preload/channels）      |
| `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC セキュリティ原則                          |
| `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン（E2E/IPC/検証）                  |
| `.claude/skills/aiworkflow-requirements/references/testing-playwright-e2e.md`               | Playwright実装基準                            |
| `.claude/skills/aiworkflow-requirements/references/deployment-gha.md`                       | CIジョブ設計基準                              |
| `.claude/rules/06-known-pitfalls.md`                                                        | P40, P42, P44, P45 の対策                     |
| `apps/desktop/e2e/skill-permission.spec.ts`                                                 | 既存 E2E テストの実装パターン参照             |
| `apps/desktop/src/main/ipc/skill-handlers.ts`                                               | 既存 IPC ハンドラの実装パターン参照           |

## 実行手順

### Task 1: Playwright 依存パッケージの追加

**目的**: E2E テストに必要な Playwright パッケージを `@repo/desktop` に追加する。

**実行コマンド**:

```bash
pnpm --filter @repo/desktop add -D @playwright/test playwright
```

**確認方法**:

```bash
cat apps/desktop/package.json | grep -A 2 "playwright"
```

**期待結果**:

- `apps/desktop/package.json` の `devDependencies` に `@playwright/test` と `playwright` が追加されている
- `pnpm install` が正常に完了する

**対応FR**: FR-4（Playwright 設定ファイル）の前提条件

### Task 2: playwright.config.ts の作成

**目的**: Electron E2E テスト用の Playwright 設定ファイルを作成する。

**配置先**: `apps/desktop/playwright.config.ts`

**実装内容**:

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 1,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: "test-results/html-report", open: "never" }],
  ],
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "electron",
      testMatch: /.*\.spec\.ts/,
    },
  ],
});
```

**設定値の根拠**:

| 設定項目   | 値             | 根拠                                                            |
| ---------- | -------------- | --------------------------------------------------------------- |
| `timeout`  | 30,000ms       | Electron アプリ起動を含むため、デフォルト（30秒）を維持         |
| `retries`  | 1              | フレイキーテスト対策として1回リトライ（NFR-1 対応）             |
| `workers`  | 1              | Electron は単一インスタンスのため、並列実行不可                 |
| `reporter` | list + html    | CI でのログ出力（list）とローカルでのレポート閲覧（html）を両立 |
| `trace`    | on-first-retry | 失敗時のみトレースを記録し、ストレージを節約                    |

**確認方法**:

```bash
cd apps/desktop && npx playwright test --list
```

**期待結果**: テスト一覧が表示される

**対応FR**: FR-4, **対応AC**: AC-05

### Task 3: Worktree 環境判定ユーティリティの実装

**目的**: 現在の実行環境が Git Worktree であるかを判定するユーティリティ関数を実装する。

**配置先**: `apps/desktop/src/main/utils/worktree-detector.ts`

**実装内容**:

```typescript
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * 現在のプロジェクトルートが Git Worktree 環境かどうかを判定する。
 *
 * 判定ロジック:
 * 1. .git がファイルであれば Worktree の可能性あり
 * 2. .git ファイルの内容が "gitdir: " で始まれば Worktree と確定
 * 3. .git がディレクトリまたは存在しなければ通常リポジトリ
 *
 * @param projectRoot - 判定対象のプロジェクトルートディレクトリ（省略時は process.cwd()）
 * @returns Worktree 環境の場合 true、通常リポジトリの場合 false
 */
export function isWorktreeEnvironment(projectRoot?: string): boolean {
  const root = projectRoot ?? process.cwd();
  const gitPath = path.join(root, ".git");

  try {
    const stat = fs.statSync(gitPath);
    if (stat.isFile()) {
      const content = fs.readFileSync(gitPath, "utf-8").trim();
      return content.startsWith("gitdir: ");
    }
    return false;
  } catch {
    return false;
  }
}
```

**テスト対応**: UT-WD-01〜UT-WD-05（5ケース全て Green にする）

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/utils/__tests__/worktree-detector.test.ts
```

**期待結果**: 5テスト全て PASS

**対応AC**: AC-10

### Task 4: deferred-tests.md パーサーの実装

**目的**: deferred-tests.md ファイルの Markdown テーブルをパースし、テスト項目一覧を返すパーサーを実装する。

**配置先**: `apps/desktop/src/main/utils/deferred-tests-parser.ts`

**実装内容**:

```typescript
/**
 * deferred-tests.md パース結果の各テスト項目
 */
export interface DeferredTestItem {
  id: string;
  testContent: string;
  reason: string;
  environment: string;
  deadline: string;
  status: string;
}

/**
 * deferred-tests.md パース結果
 */
export interface DeferredTestsResult {
  items: DeferredTestItem[];
  allResolved: boolean;
}

/**
 * Markdown テーブルのパースに失敗した場合に throw されるエラー
 */
export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

/**
 * deferred-tests.md ファイルが見つからない場合に throw されるエラー
 */
export class DeferredTestsNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeferredTestsNotFoundError";
  }
}

/**
 * deferred-tests.md の Markdown テーブル内容をパースする。
 *
 * @param content - deferred-tests.md のファイル内容（文字列）
 * @returns パース結果（テスト項目一覧と全項目解消フラグ）
 * @throws ParseError テーブル形式が不正な場合
 * @throws DeferredTestsNotFoundError content が null/undefined の場合
 */
export function parseDeferredTests(content: string): DeferredTestsResult {
  if (content === null || content === undefined) {
    throw new DeferredTestsNotFoundError("deferred-tests.md が見つかりません");
  }

  const trimmed = content.trim();
  if (trimmed === "") {
    return { items: [], allResolved: true };
  }

  const lines = trimmed.split("\n").filter((line) => line.trim() !== "");
  const tableLines = lines.filter((line) => line.includes("|"));

  if (tableLines.length === 0) {
    throw new ParseError("Markdown テーブルが見つかりません");
  }

  // ヘッダー行とセパレーター行を除外（先頭2行）
  const dataLines = tableLines.filter((_, index) => index >= 2);

  const items: DeferredTestItem[] = dataLines.map((line) => {
    const cells = line
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell) => cell !== "");
    if (cells.length < 6) {
      throw new ParseError(`テーブル行のカラム数が不足しています: ${line}`);
    }
    return {
      id: cells[0],
      testContent: cells[1],
      reason: cells[2],
      environment: cells[3],
      deadline: cells[4],
      status: cells[5],
    };
  });

  const allResolved =
    items.length === 0 || items.every((item) => item.status === "完了");

  return { items, allResolved };
}
```

**テスト対応**: UT-DP-01〜UT-DP-06（6ケース全て Green にする）

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/utils/__tests__/deferred-tests-parser.test.ts
```

**期待結果**: 6テスト全て PASS

**対応AC**: AC-09

### Task 5: Layer 分類判定ロジックの実装

**目的**: テスト項目を Layer 1〜3 に分類し、Worktree 環境での実行可否を判定するロジックを実装する。

**配置先**: `apps/desktop/src/main/utils/test-layer-classifier.ts`

**実装内容**:

```typescript
/**
 * テスト Layer の型定義
 * Layer 1: 自動テスト（pnpm vitest run）- Worktree 実施可
 * Layer 2: 静的コード検証（typecheck, lint）- Worktree 実施可
 * Layer 3: UI操作・実環境テスト - CI/メインリポジトリのみ
 */
export type TestLayer = 1 | 2 | 3;

/**
 * テスト項目の定義
 */
export interface TestItem {
  type: "unit-test" | "integration-test" | "static-analysis" | "e2e" | "manual";
  runner: "vitest" | "typecheck" | "lint" | "playwright" | "devtools";
  requiresElectron: boolean;
  requiresUI: boolean;
}

/**
 * テスト項目を Layer 1〜3 に分類する。
 *
 * 分類基準:
 * - Layer 1: Electron不要 かつ UI不要 かつ runner が vitest
 * - Layer 2: Electron不要 かつ UI不要 かつ runner が typecheck または lint
 * - Layer 3: Electron必要 または UI必要
 *
 * @param testItem - 分類対象のテスト項目
 * @returns テスト Layer（1, 2, 3 のいずれか）
 */
export function classifyTestLayer(testItem: TestItem): TestLayer {
  if (testItem.requiresElectron || testItem.requiresUI) {
    return 3;
  }

  if (testItem.runner === "typecheck" || testItem.runner === "lint") {
    return 2;
  }

  return 1;
}

/**
 * 指定された Layer のテストが Worktree 環境で実行可能かを判定する。
 *
 * Layer 1（自動テスト）と Layer 2（静的検証）は Worktree で実行可能。
 * Layer 3（UI操作・実環境テスト）は Worktree では実行不可。
 *
 * @param layer - 判定対象の Layer
 * @returns Worktree 環境で実行可能な場合 true
 */
export function canRunInWorktree(layer: TestLayer): boolean {
  return layer === 1 || layer === 2;
}
```

**テスト対応**: UT-LC-01〜UT-LC-07（7ケース全て Green にする）

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/utils/__tests__/test-layer-classifier.test.ts
```

**期待結果**: 7テスト全て PASS

**対応AC**: AC-01, AC-10

### Task 6: E2E テストスクリプトの実装

**目的**: Phase 4 で設計した E2E テスト（skill:remove 5ケース、skill:import 5ケース）が Green になるよう、テストコードを完成させる。

**実装対象ファイル**:

- `apps/desktop/e2e/ipc-skill-remove.spec.ts`
- `apps/desktop/e2e/ipc-skill-import.spec.ts`

**実装方針**:

1. Phase 4 で作成したテストコードのスケルトン（Red 状態の `expect(true).toBe(false)` 等）を、実際の Playwright API 呼び出しに置き換える
2. `_electron.launch()` で Electron アプリを起動し、`page.evaluate()` 経由で `window.electronAPI.skill.*` を呼び出す
3. P42 準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）を検証するテストを含む

**E2E テスト共通パターン**:

```typescript
// Electron アプリ起動（テストスイート単位で1回）
test.beforeAll(async () => {
  app = await electron.launch({
    args: ["apps/desktop/out/main/index.js"],
    env: { ...process.env, NODE_ENV: "test" },
  });
  page = await app.firstWindow();
});

// IPC 呼び出し（page.evaluate 経由）
const result = await page.evaluate(async () => {
  return await window.electronAPI.skill.removeSkill("test-skill");
});

// バリデーションエラーの検証
const error = await page.evaluate(async () => {
  try {
    return await window.electronAPI.skill.removeSkill("");
  } catch (e) {
    return e;
  }
});
expect(error).toHaveProperty("code", "VALIDATION_ERROR");
```

**確認コマンド**:

```bash
cd apps/desktop && pnpm build && npx playwright test e2e/ipc-skill-remove.spec.ts e2e/ipc-skill-import.spec.ts
```

**期待結果**: 10テスト全て PASS（Electron ビルド後にのみ実行可能）

**注意事項**:

- E2E テストは Electron ビルド後にのみ実行可能。Worktree 環境ではビルドが困難なため、CI 環境での実行を前提とする
- ローカルでの確認は `pnpm --filter @repo/desktop build` 後に行う

**対応FR**: FR-2, FR-3, **対応AC**: AC-02, AC-03, AC-04

### Task 7: CI/CD ワークフロー更新

**目的**: GitHub Actions CI/CD ワークフローに Electron E2E テストジョブを追加する。

**配置先**: `.github/workflows/ci.yml`

**追加ジョブ**:

```yaml
e2e-desktop:
  name: "E2E Desktop Tests"
  runs-on: ubuntu-latest
  timeout-minutes: 15
  needs: [lint, typecheck]
  if: |
    contains(github.event.pull_request.changed_files, 'apps/desktop/') ||
    contains(github.event.pull_request.changed_files, 'packages/shared/')
  steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup pnpm
      uses: pnpm/action-setup@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version-file: ".node-version"
        cache: "pnpm"

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Build shared package
      run: pnpm --filter @repo/shared build

    - name: Build desktop app
      run: pnpm --filter @repo/desktop build

    - name: Run E2E tests
      run: xvfb-run --auto-servernum pnpm --filter @repo/desktop exec playwright test
      env:
        NODE_ENV: test

    - name: Upload test results
      if: failure()
      uses: actions/upload-artifact@v4
      with:
        name: e2e-test-results
        path: apps/desktop/test-results/
        retention-days: 7
```

**確認方法**:

- YAML 構文検証: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"`
- ジョブ名 `e2e-desktop` が追加されていること

**対応FR**: FR-5, **対応AC**: AC-06, AC-07

### Task 8: Phase 11 テンプレート更新

**目的**: Phase 11 仕様書テンプレートに「Worktree 代替手順」セクションを追加する。

**配置先**: `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`

**追加セクション内容**:

```markdown
## Worktree 環境での Phase 11 代替手順

Worktree 環境では Electron アプリの直接起動ができないため、以下の3層テスト戦略で品質を担保する。

### Layer 1: 自動テスト検証（Worktree 実施可）

1. `pnpm --filter @repo/desktop exec vitest run` で全ユニットテストを実行し、全件 PASS を確認する
2. `pnpm --filter @repo/shared exec vitest run` で共有パッケージのテストを実行し、全件 PASS を確認する

### Layer 2: 静的コード検証（Worktree 実施可）

1. `pnpm typecheck` で TypeScript 型チェックを実行し、エラー0件を確認する
2. `pnpm lint` で ESLint チェックを実行し、エラー0件を確認する
3. IPC 契約の静的検証: ハンドラの引数型と Preload 側の呼び出し型が一致していることを `grep` で確認する

### Layer 3: UI操作・実環境テスト（CI/メインリポジトリのみ）

以下のテストは Worktree 環境では実行不可。deferred-tests.md に記録し、CI またはメインリポジトリで実行する。

1. Electron アプリ起動確認
2. UI 操作テスト（ボタンクリック、フォーム入力）
3. DevTools コンソールでの API 呼び出し確認
4. E2E テスト（Playwright）

### deferred-tests.md の記録手順

Layer 3 に分類されたテストは、以下の手順で deferred-tests.md に記録する:

1. `outputs/phase-11/deferred-tests.md` にテーブル行を追加する
2. PR 本文に「未実施テスト: N 件」を記載する
3. メインリポジトリマージ後に未実施テストを実行し、ステータスを「完了」に更新する
```

**対応FR**: FR-6, **対応AC**: AC-08

### Task 9: deferred-tests.md テンプレート作成

**目的**: Worktree 環境でスキップしたテストケースを記録・追跡するためのテンプレートファイルを作成する。

**配置先**: `outputs/phase-5/deferred-tests-template.md`

**テンプレート内容**:

```markdown
# 未実施テスト一覧（deferred-tests.md）

## メタ情報

| 項目     | 値               |
| -------- | ---------------- |
| タスクID | {{TASK_ID}}      |
| 作成日   | {{DATE}}         |
| 実行環境 | Worktree         |
| Phase    | 11（手動テスト） |

## 未実施テスト一覧

| ID     | テスト内容     | スキップ理由                   | 実行予定環境     | 期限       | ステータス |
| ------ | -------------- | ------------------------------ | ---------------- | ---------- | ---------- |
| DT-001 | （テスト内容） | Worktree環境でElectron起動不可 | メインリポジトリ | yyyy-mm-dd | 未実施     |
| DT-002 | （テスト内容） | Worktree環境でElectron起動不可 | CI               | yyyy-mm-dd | 未実施     |

## ステータス定義

| ステータス | 説明                                   |
| ---------- | -------------------------------------- |
| 未実施     | まだテストを実行していない             |
| 実施中     | メインリポジトリまたはCIで実行中       |
| 完了       | テスト実行が完了し、結果を確認済み     |
| 対象外     | テスト内容の変更により実施不要になった |

## PR 記載テンプレート

PR 本文の「Test plan」セクションに以下を記載する:

> **未実施テスト**: {{COUNT}} 件（Worktree 環境のため Layer 3 テストをスキップ）
> 詳細: `outputs/phase-11/deferred-tests.md`
```

**対応FR**: FR-7, **対応AC**: AC-09

---

## 統合テスト連携

### Phase 5 実装物と Phase 4 テストの対応表

| Phase 5 実装物             | Phase 4 テストファイル                                 | テストケース数 | 期待状態 |
| -------------------------- | ------------------------------------------------------ | -------------- | -------- |
| `worktree-detector.ts`     | `worktree-detector.test.ts`                            | 5              | Green    |
| `deferred-tests-parser.ts` | `deferred-tests-parser.test.ts`                        | 6              | Green    |
| `test-layer-classifier.ts` | `test-layer-classifier.test.ts`                        | 7              | Green    |
| E2E テストスクリプト実装   | `ipc-skill-remove.spec.ts`, `ipc-skill-import.spec.ts` | 10             | Green    |
| `playwright.config.ts`     | E2E テスト全体の実行可能性                             | -              | -        |
| CI ワークフロー更新        | CI-01〜CI-04（CI 環境で検証）                          | 4              | CI検証   |

### IPC 通信の end-to-end テスト検証項目

| 検証項目                   | 検証方法                               | 期待結果                    |
| -------------------------- | -------------------------------------- | --------------------------- |
| Renderer→Main IPC 通信成功 | `page.evaluate()` 経由の IPC 呼び出し  | 成功レスポンスが返る        |
| P42 3段バリデーション動作  | 空文字列/スペースのみの入力            | `VALIDATION_ERROR` が返る   |
| IPC レスポンス形式の正当性 | レスポンスオブジェクトのプロパティ検証 | `success`, `code` 等が存在  |
| 永続化の検証               | アプリ再起動後のスキル一覧取得         | 削除/インポート結果が永続化 |

---

## 多角的チェック観点

### セキュリティ観点

- [ ] E2E テスト環境で `NODE_ENV: "test"` が設定されている
- [ ] CI ワークフローで本番環境のシークレットにアクセスしていない
- [ ] Playwright 設定でスクリーンショットが失敗時のみ生成される（情報漏洩防止）
- [ ] テストデータに本番データのパターンが含まれていない

### パフォーマンス観点

- [ ] Playwright `workers: 1` で Electron 単一インスタンス制約を守っている
- [ ] CI ジョブに `timeout-minutes: 15` が設定されている（NFR-2 対応）
- [ ] `pnpm install --frozen-lockfile` でロックファイル更新を防止している
- [ ] CI でキャッシュ（`cache: "pnpm"`）を活用している

### 既知の落とし穴（Pitfall）対策

- [ ] P40 対策: E2E テスト実行は `apps/desktop/` ディレクトリで行う（`pnpm --filter @repo/desktop exec playwright test`）
- [ ] P42 対策: 3段バリデーション（型チェック → 空文字列 → `.trim() === ""`）がテストで検証されている
- [ ] P44 対策: IPC ハンドラの引数が `string` 型（オブジェクト形式ではない）であることをテストで確認
- [ ] P45 対策: テストコード内の引数名が `skillName` で統一されている
- [ ] P7 対策: CI の `pnpm install --frozen-lockfile` でバイナリ不一致を防止

### コード品質観点

- [ ] 実装コード内に `any` 型が使用されていない
- [ ] 実装コード内に `@ts-ignore` / `@ts-expect-error` が使用されていない
- [ ] JSDoc コメントで関数の目的・引数・戻り値を記載している
- [ ] エラークラスが `Error` を正しく継承している（`name` プロパティを設定）

---

## サブタスク管理

| サブタスク | 担当 | ステータス | 成果物                                                                      |
| ---------- | ---- | ---------- | --------------------------------------------------------------------------- |
| Task 1     | 自動 | 未着手     | `apps/desktop/package.json`（devDependencies 追加）                         |
| Task 2     | 自動 | 未着手     | `apps/desktop/playwright.config.ts`                                         |
| Task 3     | 自動 | 未着手     | `apps/desktop/src/main/utils/worktree-detector.ts`                          |
| Task 4     | 自動 | 未着手     | `apps/desktop/src/main/utils/deferred-tests-parser.ts`                      |
| Task 5     | 自動 | 未着手     | `apps/desktop/src/main/utils/test-layer-classifier.ts`                      |
| Task 6     | 自動 | 未着手     | `apps/desktop/e2e/ipc-skill-remove.spec.ts`, `ipc-skill-import.spec.ts`     |
| Task 7     | 自動 | 未着手     | `.github/workflows/ci.yml`                                                  |
| Task 8     | 自動 | 未着手     | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` |
| Task 9     | 自動 | 未着手     | `outputs/phase-5/deferred-tests-template.md`                                |

---

## タスク100%実行確認

Phase 5 完了時に以下の全項目を確認する:

- [ ] Task 1〜9 の全サブタスクが完了している
- [ ] Playwright 依存パッケージが `apps/desktop/package.json` に追加されている
- [ ] `apps/desktop/playwright.config.ts` が作成されている
- [ ] ユニットテスト18ケースが全て Green（PASS）であることを以下のコマンドで確認済み
  ```bash
  cd apps/desktop && pnpm vitest run src/main/utils/__tests__/worktree-detector.test.ts src/main/utils/__tests__/deferred-tests-parser.test.ts src/main/utils/__tests__/test-layer-classifier.test.ts
  ```
- [ ] E2E テスト10ケースのテストコードが完成している
- [ ] `.github/workflows/ci.yml` に `e2e-desktop` ジョブが追加されている
- [ ] Phase 11 テンプレートに「Worktree 代替手順」セクションが追加されている
- [ ] `outputs/phase-5/deferred-tests-template.md` が作成されている
- [ ] 実装コード内に `any` 型が使用されていない
- [ ] 全実装ファイルに JSDoc コメントが記載されている

---

## 成果物

| #   | 成果物                          | 配置先                                                                      | 種別         |
| --- | ------------------------------- | --------------------------------------------------------------------------- | ------------ |
| 1   | Playwright 設定ファイル         | `apps/desktop/playwright.config.ts`                                         | コード       |
| 2   | Worktree 環境判定ユーティリティ | `apps/desktop/src/main/utils/worktree-detector.ts`                          | コード       |
| 3   | deferred-tests パーサー         | `apps/desktop/src/main/utils/deferred-tests-parser.ts`                      | コード       |
| 4   | Layer 分類判定ロジック          | `apps/desktop/src/main/utils/test-layer-classifier.ts`                      | コード       |
| 5   | E2E テスト（skill:remove）      | `apps/desktop/e2e/ipc-skill-remove.spec.ts`                                 | テストコード |
| 6   | E2E テスト（skill:import）      | `apps/desktop/e2e/ipc-skill-import.spec.ts`                                 | テストコード |
| 7   | CI/CD ワークフロー更新          | `.github/workflows/ci.yml`                                                  | コード       |
| 8   | Phase 11 テンプレート更新       | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` | ドキュメント |
| 9   | deferred-tests テンプレート     | `outputs/phase-5/deferred-tests-template.md`                                | ドキュメント |
| 10  | 実装サマリー                    | `outputs/phase-5/implementation-summary.md`                                 | ドキュメント |

注: コード成果物（#1〜#7）はソースコードリポジトリの該当ディレクトリに直接配置する。`outputs/` には配置しない。

## 完了条件

- [ ] Playwright 依存パッケージ（`@playwright/test`, `playwright`）が `apps/desktop/package.json` の `devDependencies` に追加されている
- [ ] `apps/desktop/playwright.config.ts` が作成され、Electron E2E テスト実行に必要な設定（testDir, timeout, retries, workers, reporter）を含んでいる（AC-05）
- [ ] ユニットテスト18ケース全てが Green（PASS）状態である
- [ ] E2E テスト10ケースのテストコードが完成している（Electron ビルド後に実行可能な状態）
- [ ] `.github/workflows/ci.yml` に `e2e-desktop` ジョブが追加されている（AC-06）
- [ ] CI E2E テストの実行条件が `apps/desktop/` 配下のファイル変更時に限定されている（AC-07）
- [ ] Phase 11 テンプレートに「Worktree 代替手順」セクションが存在する（AC-08）
- [ ] deferred-tests.md テンプレートがスキップ理由・実行予定環境・期限・ステータスを記録できる形式である（AC-09）
- [ ] 実装コード内に `any` 型が使用されていない
- [ ] `outputs/phase-5/implementation-summary.md` に実装サマリーが記載されている

## 次のPhase

Phase 6: テスト拡充 — Phase 5 実装のテストカバレッジを分析し、不足箇所のテストを追加する。
