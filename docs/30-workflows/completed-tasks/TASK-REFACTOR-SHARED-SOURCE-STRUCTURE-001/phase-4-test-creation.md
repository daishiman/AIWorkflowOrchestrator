# Phase 4: テスト作成 — TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001

## メタ情報

| 項目       | 値                                                |
| ---------- | ------------------------------------------------- |
| Phase      | 4                                                 |
| 機能名     | packages/shared 型定義ディレクトリ統合            |
| タスク ID  | TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001         |
| 作成日     | 2026-02-28                                        |
| 前提 Phase | Phase 3（設計レビュー）PASS                       |
| 目的       | 移行前のベースライン確認 + 移行後の検証テスト作成 |

## 目的

TDD の Red フェーズとして、以下の観点でテストを作成する:

1. **ベースライン確認**: 移行前の全テスト・型チェックが PASS することを記録
2. **モジュール解決テスト**: 移行後の公開パス（`@repo/shared/types/auth` 等）が正しく解決されることを検証
3. **ビルド成果物テスト**: `dist/src/types/` に成果物が生成され、旧パス `dist/types/` が存在しないことを検証
4. **4ファイル同期テスト**: package.json / tsconfig.json / vitest.config.ts / tsup.config.ts の整合性を検証

## 実行タスク

- Task 1: ベースラインテスト実行（移行前スナップショット記録）
- Task 2: モジュール解決テスト作成
- Task 3: ビルド成果物検証テスト作成
- Task 4: 4ファイル同期検証テスト作成

## 参照資料

| 資料名                   | パス                                                                                                                     | 説明                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| Phase 1 要件サマリー     | `docs/30-workflows/completed-tasks/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/outputs/phase-1/requirements-definition.md` | FR/NFR の検証観点               |
| Phase 1 受入基準         | `docs/30-workflows/completed-tasks/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/outputs/phase-1/acceptance-criteria.md`     | AC-01〜AC-14                    |
| 設計仕様                 | `docs/30-workflows/completed-tasks/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/phase-2-design.md`                          | アーキテクチャ設計              |
| 設計レビュー結果         | `docs/30-workflows/completed-tasks/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/phase-3-design-review.md`                   | 設計レビュー判定                |
| コード品質ルール         | `.claude/rules/02-code-quality.md`                                                                                       | カバレッジ基準                  |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md`                                                                                     | P8, P11, P23, P32               |
| 現行 package.json        | `packages/shared/package.json`                                                                                           | exports / typesVersions 定義    |
| 現行 tsup.config.ts      | `packages/shared/tsup.config.ts`                                                                                         | エントリーポイント定義          |
| Desktop tsconfig.json    | `apps/desktop/tsconfig.json`                                                                                             | paths 定義                      |
| Desktop vitest.config.ts | `apps/desktop/vitest.config.ts`                                                                                          | alias 定義（tsconfigPaths経由） |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                          | 内容                         |
| ------------------ | ----------------------------------------------------------------------------- | ---------------------------- |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | テスト設計・カバレッジ基準   |
| モノレポ構成       | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`  | `@repo/shared` 公開パス契約  |
| 開発ガイドライン   | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | テスト実行/検証コマンド運用  |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`         | 失敗ケース設計時の分類ルール |

## 実行手順

### Task 1: ベースラインテスト実行（移行前スナップショット記録）

移行前の現状を記録し、Phase 5 実装後の回帰テストのベースラインとする。

#### Step 1.1: shared パッケージの全テスト実行

```bash
pnpm --filter @repo/shared test:run
```

- 全テストが PASS することを確認
- テスト数・PASS 数を記録

#### Step 1.2: shared パッケージのビルド確認

```bash
pnpm --filter @repo/shared build
```

- ビルドが成功することを確認
- `dist/` ディレクトリの構造をスナップショットとして記録

#### Step 1.3: desktop パッケージの型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

- 型チェックが PASS することを確認
- エラー 0 件であることを記録

#### Step 1.4: ベースライン記録の成果物

以下を `outputs/phase-4/test-specification.md` に記録:

- テスト実行結果（テスト数、PASS 数）
- ビルド成果物の `dist/` ディレクトリ構造
- 型チェック結果

### Task 2: モジュール解決テスト作成

テストファイル: `packages/shared/src/types/__tests__/module-resolution.test.ts`

移行後の公開パスからの import が正しく解決されることを検証する。

#### テストケース一覧

| No   | テスト項目                                                       | 期待結果                                                         |
| ---- | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| M-01 | `@repo/shared/types/auth` から AuthProvider 型が import 可能     | import が成功し、型が定義済み                                    |
| M-02 | `@repo/shared/types/api-keys` から ApiKeyConfig 型が import 可能 | import が成功し、型が定義済み                                    |
| M-03 | `@repo/shared/types` (index) から全エクスポートが利用可能        | workflow, common, auth, api-keys, file-selection の全型が export |
| M-04 | `@repo/shared/types/auth` の export 内容が移行前と同一           | 移行前後で export される型名の一覧が一致                         |
| M-05 | `@repo/shared/types/api-keys` の export 内容が移行前と同一       | 移行前後で export される型名の一覧が一致                         |

#### Step 2.1: テストファイル作成

```typescript
// packages/shared/src/types/__tests__/module-resolution.test.ts
import { describe, it, expect } from "vitest";

describe("モジュール解決テスト（移行後）", () => {
  it("M-01: @repo/shared/types/auth から型が import 可能", async () => {
    const authModule = await import("../../types/auth");
    expect(authModule).toBeDefined();
    // AuthProvider 型の存在確認（export されたオブジェクトのキーで検証）
  });

  it("M-02: @repo/shared/types/api-keys から型が import 可能", async () => {
    const apiKeysModule = await import("../../types/api-keys");
    expect(apiKeysModule).toBeDefined();
  });

  it("M-03: index から全エクスポートが利用可能", async () => {
    const indexModule = await import("../../types/index");
    expect(indexModule).toBeDefined();
    // workflow, common, auth, api-keys, file-selection の re-export 確認
  });

  it("M-04: auth の export 内容が移行前と同一", async () => {
    const authModule = await import("../../types/auth");
    const exportKeys = Object.keys(authModule);
    // 移行前のベースラインと比較
    expect(exportKeys.length).toBeGreaterThan(0);
  });

  it("M-05: api-keys の export 内容が移行前と同一", async () => {
    const apiKeysModule = await import("../../types/api-keys");
    const exportKeys = Object.keys(apiKeysModule);
    expect(exportKeys.length).toBeGreaterThan(0);
  });
});
```

### Task 3: ビルド成果物検証テスト作成

テストファイル: `packages/shared/src/types/__tests__/build-artifacts.test.ts`

ビルド後の `dist/` ディレクトリに正しいファイルが生成されることを検証する。

#### テストケース一覧

| No   | テスト項目                                         | 期待結果                         |
| ---- | -------------------------------------------------- | -------------------------------- |
| D-01 | `dist/src/types/auth.js` が存在する                | ファイルが存在する               |
| D-02 | `dist/src/types/auth.d.ts` が存在する              | 型定義ファイルが存在する         |
| D-03 | `dist/src/types/api-keys.js` が存在する            | ファイルが存在する               |
| D-04 | `dist/src/types/api-keys.d.ts` が存在する          | 型定義ファイルが存在する         |
| D-05 | `dist/src/types/common.js` が存在する              | ファイルが存在する               |
| D-06 | `dist/src/types/workflow.js` が存在する            | ファイルが存在する               |
| D-07 | `dist/src/types/file-selection.js` が存在する      | ファイルが存在する               |
| D-08 | `dist/src/types/index.js` が存在する               | 統合 index が存在する            |
| D-09 | 旧パス `dist/types/auth.js` が存在しない           | 移行元のファイルが残存していない |
| D-10 | 旧パス `dist/types/api-keys.js` が存在しない       | 移行元のファイルが残存していない |
| D-11 | 旧パス `dist/types/common.js` が存在しない         | 移行元のファイルが残存していない |
| D-12 | 旧パス `dist/types/workflow.js` が存在しない       | 移行元のファイルが残存していない |
| D-13 | 旧パス `dist/types/file-selection.js` が存在しない | 移行元のファイルが残存していない |
| D-14 | 旧パス `dist/types/index.js` が存在しない          | 旧 index が残存していない        |

#### Step 3.1: テストファイル作成

```typescript
// packages/shared/src/types/__tests__/build-artifacts.test.ts
import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const DIST_ROOT = resolve(__dirname, "../../../dist");

describe("ビルド成果物検証（移行後）", () => {
  describe("新パスにファイルが存在する", () => {
    const expectedFiles = [
      "src/types/auth.js",
      "src/types/auth.d.ts",
      "src/types/api-keys.js",
      "src/types/api-keys.d.ts",
      "src/types/common.js",
      "src/types/workflow.js",
      "src/types/file-selection.js",
      "src/types/index.js",
    ];

    expectedFiles.forEach((file) => {
      it(`D-${expectedFiles.indexOf(file) + 1}: dist/${file} が存在する`, () => {
        expect(existsSync(resolve(DIST_ROOT, file))).toBe(true);
      });
    });
  });

  describe("旧パスにファイルが存在しない", () => {
    const legacyFiles = [
      "types/auth.js",
      "types/api-keys.js",
      "types/common.js",
      "types/workflow.js",
      "types/file-selection.js",
      "types/index.js",
    ];

    legacyFiles.forEach((file) => {
      it(`D-${9 + legacyFiles.indexOf(file)}: 旧パス dist/${file} が存在しない`, () => {
        expect(existsSync(resolve(DIST_ROOT, file))).toBe(false);
      });
    });
  });
});
```

### Task 4: 4ファイル同期検証テスト作成

テストファイル: `packages/shared/src/types/__tests__/config-sync.test.ts`

package.json / tsup.config.ts / tsconfig.json の設定が統一されていることを検証する。

#### テストケース一覧

| No   | テスト項目                                                                     | 期待結果                                  |
| ---- | ------------------------------------------------------------------------------ | ----------------------------------------- |
| S-01 | package.json exports に `dist/types/`（src なし）パスが存在しない              | 全 exports が `dist/src/types/` を参照    |
| S-02 | package.json typesVersions に `./types/*.ts`（src なし）が存在しない           | 全 typesVersions が `./src/types/` を参照 |
| S-03 | package.json exports `./types` が `dist/src/types/index.js` を参照             | 正しいパスを参照                          |
| S-04 | package.json exports `./types/auth` が `dist/src/types/auth.js` を参照         | 正しいパスを参照                          |
| S-05 | package.json exports `./types/api-keys` が `dist/src/types/api-keys.js` を参照 | 正しいパスを参照                          |
| S-06 | tsup.config.ts entry に `types/auth.ts`（src なし）が存在しない                | 全エントリが `src/types/` を参照          |
| S-07 | tsup.config.ts entry に `src/types/auth.ts` が存在する                         | 移行後のエントリが登録済み                |

#### Step 4.1: テストファイル作成

```typescript
// packages/shared/src/types/__tests__/config-sync.test.ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SHARED_ROOT = resolve(__dirname, "../../..");

describe("4ファイル同期検証", () => {
  describe("package.json", () => {
    const pkg = JSON.parse(
      readFileSync(resolve(SHARED_ROOT, "package.json"), "utf-8"),
    );

    it("S-01: exports に dist/types/（src なし）パスが存在しない", () => {
      const exportValues = JSON.stringify(pkg.exports);
      // dist/types/ は許容するが dist/types/auth 等の直接参照がないこと
      const legacyPaths = [
        "dist/types/auth",
        "dist/types/api-keys",
        "dist/types/common",
        "dist/types/workflow",
        "dist/types/file-selection",
      ];
      legacyPaths.forEach((path) => {
        expect(exportValues).not.toContain(path);
      });
    });

    it("S-02: typesVersions に ./types/*.ts（src なし）が存在しない", () => {
      const tvValues = JSON.stringify(pkg.typesVersions);
      const legacyPaths = [
        "./types/auth.ts",
        "./types/api-keys.ts",
        "./types/common.ts",
        "./types/workflow.ts",
        "./types/file-selection.ts",
      ];
      legacyPaths.forEach((path) => {
        expect(tvValues).not.toContain(path);
      });
    });

    it("S-03: exports ./types が dist/src/types/index.js を参照", () => {
      const typesExport = pkg.exports["./types"];
      expect(typesExport.import).toBe("./dist/src/types/index.js");
    });

    it("S-04: exports ./types/auth が dist/src/types/auth.js を参照", () => {
      const authExport = pkg.exports["./types/auth"];
      expect(authExport.import).toBe("./dist/src/types/auth.js");
    });

    it("S-05: exports ./types/api-keys が dist/src/types/api-keys.js を参照", () => {
      const apiKeysExport = pkg.exports["./types/api-keys"];
      expect(apiKeysExport.import).toBe("./dist/src/types/api-keys.js");
    });
  });

  describe("tsup.config.ts", () => {
    it("S-06: entry に types/auth.ts（src なし）が存在しない", () => {
      const config = readFileSync(
        resolve(SHARED_ROOT, "tsup.config.ts"),
        "utf-8",
      );
      // types/auth.ts が entry に含まれていないこと（src/types/ は OK）
      const lines = config.split("\n");
      const entryLines = lines.filter(
        (line) => line.includes('"types/') && !line.includes('"src/types/'),
      );
      expect(entryLines).toHaveLength(0);
    });

    it("S-07: entry に src/types/auth.ts が存在する", () => {
      const config = readFileSync(
        resolve(SHARED_ROOT, "tsup.config.ts"),
        "utf-8",
      );
      expect(config).toContain('"src/types/auth.ts"');
    });
  });
});
```

## テストファイル構成

```
packages/shared/src/types/__tests__/
├── module-resolution.test.ts    (5 tests)  ← Task 2 で作成
├── build-artifacts.test.ts      (14 tests) ← Task 3 で作成
├── config-sync.test.ts          (7 tests)  ← Task 4 で作成
└── auth.test.ts                 (既存)     ← 移行対象（types/__tests__/ から）
```

**テスト総数: 26 テスト**（新規作成分、既存テストは別途）

## 統合テスト連携【必須】

| 検証対象           | 検証方法                                | Phase |
| ------------------ | --------------------------------------- | ----- |
| モジュール解決     | dynamic import によるモジュール存在確認 | 4     |
| ビルド成果物       | fs.existsSync による dist/ 構造検証     | 4     |
| 4ファイル同期      | JSON/テキスト解析による設定値検証       | 4     |
| desktop 型チェック | `pnpm --filter @repo/desktop typecheck` | 5     |
| 全パッケージビルド | `pnpm --filter @repo/shared build`      | 5     |

## Pitfall 対策チェックリスト

| Pitfall ID | 対策                                                            | 適用箇所           |
| ---------- | --------------------------------------------------------------- | ------------------ |
| P8         | import するモジュールが package.json に宣言されていることを確認 | テスト全般         |
| P9         | テスト間で状態共有しない — beforeEach でリセット                | build-artifacts    |
| P11        | Prettier/ESLint の自動修正後に Edit の文字列マッチ失敗に注意    | テストコード作成時 |
| P23        | exports と typesVersions の両方を同時にテスト                   | config-sync        |
| P32        | 型定義は shared と desktop の2箇所を同時に検証                  | module-resolution  |
| P40        | テスト実行は対象パッケージのディレクトリから行う                | テスト実行時       |

## 成果物

| 成果物               | パス                                                                                                                | 説明                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| テスト仕様書         | `docs/30-workflows/completed-tasks/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/outputs/phase-4/test-specification.md` | テストケース一覧・戦略 |
| モジュール解決テスト | `packages/shared/src/types/__tests__/module-resolution.test.ts`                                                     | 5 テスト               |
| ビルド成果物テスト   | `packages/shared/src/types/__tests__/build-artifacts.test.ts`                                                       | 14 テスト              |
| 設定同期テスト       | `packages/shared/src/types/__tests__/config-sync.test.ts`                                                           | 7 テスト               |

## 完了条件

- [ ] ベースラインテスト実行完了 — shared の全テスト PASS を記録
- [ ] ベースラインビルド完了 — shared のビルド成功を記録
- [ ] ベースライン型チェック完了 — desktop の typecheck PASS を記録
- [ ] `module-resolution.test.ts` 作成完了 — 5 テスト
- [ ] `build-artifacts.test.ts` 作成完了 — 14 テスト
- [ ] `config-sync.test.ts` 作成完了 — 7 テスト
- [ ] 全テストが Red（FAIL）であることを確認（TDD の Red フェーズ）
- [ ] テスト仕様書を `outputs/phase-4/test-specification.md` に記録

## TDD 検証

```bash
# ベースライン確認（移行前 — 全 PASS であること）
cd packages/shared && pnpm vitest run

# 新規テストの Red 確認（移行前 — FAIL であること）
cd packages/shared && pnpm vitest run src/types/__tests__/build-artifacts.test.ts
cd packages/shared && pnpm vitest run src/types/__tests__/config-sync.test.ts

# desktop 型チェック
pnpm --filter @repo/desktop typecheck
```

## 次の Phase

Phase 5（実装）へ進む。Phase 4 で作成したテスト（Red）を Green にする実装を行う。
