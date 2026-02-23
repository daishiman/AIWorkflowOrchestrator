# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスクID   | TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 |
| Phase      | 4                                       |
| 名称       | テスト作成（TDD: Red）                  |
| 前提Phase  | Phase 3（設計レビュー PASS）            |
| 次Phase    | Phase 5（実装）                         |
| ステータス | completed                               |

## 目的

Phase 5 の実装に先立ち、チェックスクリプト `scripts/check-shared-module-sync.ts` の全関数に対するユニットテスト・統合テストを作成する。TDD の Red フェーズとして、テストが全て FAIL する状態を確認する。

## 参照資料

| 資料                                              | パス / リンク                                                                        |
| ------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Phase 1 要件定義                                  | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-1-requirements.md`  |
| Phase 2 設計                                      | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-2-design.md`        |
| Phase 3 設計レビュー                              | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-3-design-review.md` |
| テスト駆動開発ルール                              | `.claude/rules/02-code-quality.md#テスト駆動開発（TDD）`                             |
| 既知の落とし穴（P9: テスト間状態リーク）          | `.claude/rules/06-known-pitfalls.md#P9`                                              |
| 既知の落とし穴（P40: テスト実行ディレクトリ依存） | `.claude/rules/06-known-pitfalls.md#P40`                                             |
| 既知の落とし穴（P41: v8カバレッジインライン関数） | `.claude/rules/06-known-pitfalls.md#P41`                                             |

## 実行タスク

- 実行タスク一覧: 本Phaseで定義したTaskを上から順に実施する

### Task 1: テストファイル作成

**成果物**: `scripts/__tests__/check-shared-module-sync.test.ts`

### Task 2: テスト実行と Red 確認

**成果物**: Phase 4 outputs にテスト実行結果（全 FAIL）のスナップショットを記録

---

## テストケース設計

### 1. パーサー関数ユニットテスト

#### 1.1 `parseExports` テスト

| #   | テストケース名                                 | 入力                                                                                           | 期待出力                                                           | 分類   |
| --- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------ |
| 1   | 標準的な exports を正しくパースする            | `{ ".": { "types": "...", "import": "..." }, "./utils": { "types": "...", "import": "..." } }` | `Map { "." => { types, import }, "./utils" => { types, import } }` | 正常系 |
| 2   | exports が空オブジェクトの場合は空 Map を返す  | `{}`                                                                                           | `Map {}` (size === 0)                                              | 境界値 |
| 3   | `.` のみの exports は `.` を1件含む Map を返す | `{ ".": { ... } }`                                                                             | `Map { "." => ... }` (size === 1)                                  | 境界値 |
| 4   | string 形式の export エントリを正しく処理する  | `{ ".": "./dist/index.js" }`                                                                   | `Map { "." => { import: "./dist/index.js" } }`                     | 正常系 |

#### 1.2 `parsePaths` テスト

| #   | テストケース名                                     | 入力                                                         | 期待出力                               | 分類   |
| --- | -------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------- | ------ |
| 5   | 標準的な paths を正しくパースする                  | `{ "@repo/shared": ["..."], "@repo/shared/utils": ["..."] }` | `Map { "@repo/shared" => [...], ... }` | 正常系 |
| 6   | ワイルドカード paths エントリ（`*`）をスキップする | `{ "@repo/shared/*": ["packages/shared/src/*"] }`            | スキップされ Map に含まれない          | 境界値 |
| 7   | paths が空オブジェクトの場合は空 Map を返す        | `{}`                                                         | `Map {}` (size === 0)                  | 境界値 |

#### 1.3 `parseAliases` テスト

| #   | テストケース名                                        | 入力（vitest.config.ts 内容）                                                     | 期待出力                                                               | 分類   |
| --- | ----------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------ |
| 8   | 標準的な alias を正しくパースする                     | `"@repo/shared/utils": resolve(__dirname, "packages/shared/src/utils/index.ts")`  | `Map { "@repo/shared/utils" => "packages/shared/src/utils/index.ts" }` | 正常系 |
| 9   | resolve パス末尾にカンマがある場合も正しくパースする  | `"@repo/shared/utils": resolve(__dirname, "packages/shared/src/utils/index.ts",)` | 正しくパースされる                                                     | 正常系 |
| 10  | alias が0件の場合は空 Map を返す                      | vitest.config.ts に alias 定義なし                                                | `Map {}` (size === 0)                                                  | 境界値 |
| 11  | vitest.config.ts が存在しない場合はエラーをスローする | ファイル未存在                                                                    | `Error` がスローされる                                                 | 異常系 |

#### 1.4 `parseTypesVersions` テスト

| #   | テストケース名                              | 入力                                              | 期待出力                                       | 分類   |
| --- | ------------------------------------------- | ------------------------------------------------- | ---------------------------------------------- | ------ |
| 12  | 標準的な typesVersions を正しくパースする   | `{ "*": { "utils": ["dist/utils/index.d.ts"] } }` | `Map { "utils" => ["dist/utils/index.d.ts"] }` | 正常系 |
| 13  | typesVersions が未定義の場合は空 Map を返す | `package.json` に `typesVersions` キーなし        | `Map {}` (size === 0)                          | 境界値 |

### 2. チェッカー関数ユニットテスト

#### 2.1 `checkExportsVsPaths`（チェック1: exports → paths 包含）

| #   | テストケース名                                       | exports                        | paths                                    | 期待出力                       | 分類   |
| --- | ---------------------------------------------------- | ------------------------------ | ---------------------------------------- | ------------------------------ | ------ |
| 14  | 全 exports エントリが paths に存在する場合は差分なし | `[".", "./utils"]`             | `["@repo/shared", "@repo/shared/utils"]` | `missingInPaths: []`           | 正常系 |
| 15  | exports にあるが paths にないエントリを検出する      | `[".", "./utils", "./errors"]` | `["@repo/shared", "@repo/shared/utils"]` | `missingInPaths: ["./errors"]` | 異常系 |

#### 2.2 `checkPathsVsExports`（チェック2: paths → exports 逆方向）

| #   | テストケース名                                       | paths                                                          | exports            | 期待出力                                   | 分類   |
| --- | ---------------------------------------------------- | -------------------------------------------------------------- | ------------------ | ------------------------------------------ | ------ |
| 16  | 全 paths エントリが exports に存在する場合は差分なし | `["@repo/shared", "@repo/shared/utils"]`                       | `[".", "./utils"]` | `missingInExports: []`                     | 正常系 |
| 17  | paths にあるが exports にないエントリを検出する      | `["@repo/shared", "@repo/shared/utils", "@repo/shared/extra"]` | `[".", "./utils"]` | `missingInExports: ["@repo/shared/extra"]` | 異常系 |

#### 2.3 `checkExportsVsAliases`（チェック3: exports → alias 包含）

| #   | テストケース名                                       | exports                        | aliases                                  | 期待出力                         | 分類   |
| --- | ---------------------------------------------------- | ------------------------------ | ---------------------------------------- | -------------------------------- | ------ |
| 18  | 全 exports エントリが alias に存在する場合は差分なし | `[".", "./utils"]`             | `["@repo/shared", "@repo/shared/utils"]` | `missingInAliases: []`           | 正常系 |
| 19  | exports にあるが alias にないエントリを検出する      | `[".", "./utils", "./errors"]` | `["@repo/shared", "@repo/shared/utils"]` | `missingInAliases: ["./errors"]` | 異常系 |

#### 2.4 `checkAliasesVsExports`（チェック4: alias → exports 逆方向）

| #   | テストケース名                                       | aliases                                                        | exports            | 期待出力                                   | 分類   |
| --- | ---------------------------------------------------- | -------------------------------------------------------------- | ------------------ | ------------------------------------------ | ------ |
| 20  | 全 alias エントリが exports に存在する場合は差分なし | `["@repo/shared", "@repo/shared/utils"]`                       | `[".", "./utils"]` | `missingInExports: []`                     | 正常系 |
| 21  | alias にあるが exports にないエントリを検出する      | `["@repo/shared", "@repo/shared/utils", "@repo/shared/extra"]` | `[".", "./utils"]` | `missingInExports: ["@repo/shared/extra"]` | 異常系 |

#### 2.5 `checkExportsVsTypesVersions`（チェック5: exports → typesVersions 包含）

| #   | テストケース名                                               | exports                        | typesVersions | 期待出力                                       | 分類   |
| --- | ------------------------------------------------------------ | ------------------------------ | ------------- | ---------------------------------------------- | ------ |
| 22  | 全 exports サブパスが typesVersions に存在する場合は差分なし | `[".", "./utils"]`             | `["utils"]`   | `missingInTypesVersions: []`（`.` はスキップ） | 正常系 |
| 23  | exports にあるが typesVersions にないエントリを検出する      | `[".", "./utils", "./errors"]` | `["utils"]`   | `missingInTypesVersions: ["./errors"]`         | 異常系 |

### 3. レポーター関数ユニットテスト

| #   | テストケース名                                  | 入力                               | 期待出力                                  | 分類   |
| --- | ----------------------------------------------- | ---------------------------------- | ----------------------------------------- | ------ |
| 24  | 不整合なしの場合「ALL CHECKS PASSED」を出力する | 全チェック結果が空配列             | stdout に `ALL CHECKS PASSED` を含む      | 正常系 |
| 25  | 不整合ありの場合、差分エントリを一覧出力する    | チェック1 に `["./errors"]` の差分 | stdout に `./errors` と差分カテゴリを含む | 異常系 |
| 26  | 複数チェックの不整合を全て出力する              | チェック1,3,5 にそれぞれ差分       | 全差分カテゴリとエントリが出力される      | 異常系 |

### 4. 統合テスト（main 関数）

| #   | テストケース名                    | 条件                                               | 期待出力                              | 分類   |
| --- | --------------------------------- | -------------------------------------------------- | ------------------------------------- | ------ |
| 27  | 3層が完全一致する場合 exit code 0 | exports / paths / alias / typesVersions が完全一致 | `process.exitCode === 0` または未設定 | 正常系 |
| 28  | 不整合がある場合 exit code 1      | exports に paths 不一致が存在                      | `process.exitCode === 1`              | 異常系 |

---

## テスト設計のポイント

### P9 対策: テスト間状態共有の禁止

- 各テストケースは `beforeEach` で入力データを初期化する
- グローバル状態やモジュールスコープ変数に依存しない
- ファイルシステムのモックは `vi.mock('fs')` で行い、各テストで `mockReturnValue` をリセットする

### P40 対策: テスト実行ディレクトリ

- テストファイルはプロジェクトルートの `scripts/__tests__/` に配置する
- プロジェクトルートの `vitest.config.ts`（存在する場合）または明示的な config 指定で実行する
- 実行コマンド: `pnpm vitest run scripts/__tests__/check-shared-module-sync.test.ts`

### P41 対策: v8 カバレッジのインライン関数カウント

- チェッカー関数内のインライン arrow function（filter, map 等）がカバレッジカウントされることを意識する
- Phase 7 でカバレッジ計測時に、未実行のインライン関数が Function Coverage を下げないよう、テストケースで全分岐を網羅する

### モック戦略

| 対象                | モック方法                                                | 理由                                    |
| ------------------- | --------------------------------------------------------- | --------------------------------------- |
| `fs.readFileSync`   | `vi.mock('fs')` + `mockReturnValue`                       | ファイルI/Oを制御し、テストデータを注入 |
| `process.exitCode`  | `vi.spyOn(process, 'exit')` は使わず `exitCode` 確認      | exit() はテストプロセスを終了させるため |
| `console.log/error` | `vi.spyOn(console, 'log')` + `vi.spyOn(console, 'error')` | レポート出力の検証                      |
| `path.resolve`      | モック不要（テストデータ側でパスを制御）                  | 実際のパス解決ロジックをテスト          |

### テストファイル構造

```typescript
// scripts/__tests__/check-shared-module-sync.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// パーサー関数のインポート（Phase 5 で実装）
// import { parseExports, parsePaths, parseAliases, parseTypesVersions } from '../check-shared-module-sync';
// チェッカー関数のインポート
// import { checkExportsVsPaths, checkPathsVsExports, ... } from '../check-shared-module-sync';

describe("check-shared-module-sync", () => {
  describe("parseExports", () => {
    // テストケース #1-4
  });

  describe("parsePaths", () => {
    // テストケース #5-7
  });

  describe("parseAliases", () => {
    // テストケース #8-11
  });

  describe("parseTypesVersions", () => {
    // テストケース #12-13
  });

  describe("checkExportsVsPaths", () => {
    // テストケース #14-15
  });

  describe("checkPathsVsExports", () => {
    // テストケース #16-17
  });

  describe("checkExportsVsAliases", () => {
    // テストケース #18-19
  });

  describe("checkAliasesVsExports", () => {
    // テストケース #20-21
  });

  describe("checkExportsVsTypesVersions", () => {
    // テストケース #22-23
  });

  describe("formatReport / printSummary", () => {
    // テストケース #24-26
  });

  describe("main (統合テスト)", () => {
    // テストケース #27-28
  });
});
```

---

## 実行手順

1. `scripts/__tests__/` ディレクトリが存在しない場合は作成する
2. `scripts/__tests__/check-shared-module-sync.test.ts` を上記テストケース設計に基づいて作成する
3. `scripts/check-shared-module-sync.ts` のスタブファイルを作成する（全関数が `throw new Error('Not implemented')` を返す）
4. テストを実行し、全 28 テストケースが FAIL することを確認する:
   ```bash
   pnpm vitest run scripts/__tests__/check-shared-module-sync.test.ts
   ```
5. FAIL 結果のスナップショットを `outputs/phase-4/` に記録する

---

## 統合テスト連携

| 連携項目          | 内容                                                                                                                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 主要スイート      | `packages/shared/src/__tests__/module-resolution.test.ts` / `apps/desktop/src/__tests__/shared-module-resolution.test.ts` / `apps/desktop/src/__tests__/vitest-alias-consistency.test.ts` |
| このPhaseでの扱い | 本Phaseの成果を3スイートと `scripts/check-shared-module-sync.ts` の期待値に反映し、差分が出た場合は仕様に戻って整合を取る                                                                 |
| 失敗時の戻り先    | 要件不整合はPhase 1、設計不整合はPhase 2、実装不整合はPhase 5/6に戻す                                                                                                                     |

## 成果物

| #   | 成果物             | パス                                                                                            |
| --- | ------------------ | ----------------------------------------------------------------------------------------------- |
| 1   | テストファイル     | `scripts/__tests__/check-shared-module-sync.test.ts`                                            |
| 2   | スタブ実装ファイル | `scripts/check-shared-module-sync.ts`（関数エクスポートのみ、未実装）                           |
| 3   | Red フェーズ結果   | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/outputs/phase-4/test-results-red.md` |

---

## 完了条件

- [ ] `scripts/__tests__/check-shared-module-sync.test.ts` が作成されている
- [ ] テストケース 28 件が全て記述されている
- [ ] `scripts/check-shared-module-sync.ts` のスタブファイルが作成されている（関数シグネチャと `throw new Error('Not implemented')` のみ）
- [ ] `pnpm vitest run scripts/__tests__/check-shared-module-sync.test.ts` で全テストが FAIL する（Red 確認）
- [ ] テスト間で状態を共有していない（P9 対策）
- [ ] Red フェーズの実行結果が `outputs/phase-4/test-results-red.md` に記録されている

## 次Phase

Phase 5（実装 — TDD: Green）へ進む。
