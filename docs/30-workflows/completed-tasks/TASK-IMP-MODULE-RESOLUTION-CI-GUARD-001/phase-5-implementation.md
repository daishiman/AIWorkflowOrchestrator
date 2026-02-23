# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスクID   | TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 |
| Phase      | 5                                       |
| 名称       | 実装（TDD: Green）                      |
| 前提Phase  | Phase 4（テスト作成 — Red 確認済み）    |
| 次Phase    | Phase 6（テスト拡充）                   |
| ステータス | completed                               |

## 目的

Phase 4 で作成した全 28 テストケースをパスさせるために、`scripts/check-shared-module-sync.ts` の本体実装と `.github/workflows/ci.yml` への CI ジョブ追加を行う。TDD の Green フェーズとして、全テストが PASS する最小限の実装を行う。

## aiworkflow-requirements 抽出要件の実装反映

| 要件ID | 出典仕様                   | 実装で守ること                                                                | 本Phaseでの反映先        |
| ------ | -------------------------- | ----------------------------------------------------------------------------- | ------------------------ |
| I1     | `architecture-monorepo.md` | 正本を `exports` に固定し、`paths` / `alias` / `typesVersions` を変換照合する | Task 1（チェッカー実装） |
| I2     | `quality-requirements.md`  | 既存3スイートと新規チェックを同時に満たす                                     | Task 3（Green確認）      |
| I3     | `deployment-gha.md`        | 新規ジョブは既存ジョブと整合する依存方向で追加する                            | Task 2（CIジョブ追加）   |
| I4     | `error-handling.md`        | 検出失敗時はCIが停止できる失敗終了を返す                                      | Task 1（main実装）       |

## 参照資料

| 資料                                       | パス / リンク                                                                        |
| ------------------------------------------ | ------------------------------------------------------------------------------------ |
| Phase 4 テスト作成                         | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-4-test-creation.md` |
| Phase 4 テストファイル                     | `scripts/__tests__/check-shared-module-sync.test.ts`                                 |
| Phase 2 設計                               | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-2-design.md`        |
| @repo/shared package.json                  | `packages/shared/package.json`                                                       |
| tsconfig.json                              | `apps/desktop/tsconfig.json`                                                         |
| vitest.config.ts                           | `apps/desktop/vitest.config.ts`                                                      |
| 既知の落とし穴（P42: trim バリデーション） | `.claude/rules/06-known-pitfalls.md#P42`                                             |
| モノレポ三層整合要件                       | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`         |
| 品質ゲート要件                             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`          |
| GitHub Actions設計要件                     | `.claude/skills/aiworkflow-requirements/references/deployment-gha.md`                |
| 失敗時ハンドリング要件                     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                |

## 実行タスク

- 実行タスク一覧: 本Phaseで定義したTaskを上から順に実施する

### Task 1: チェックスクリプト本体実装

**成果物**: `scripts/check-shared-module-sync.ts`

### Task 2: CI ジョブ追加

**成果物**: `.github/workflows/ci.yml`（`check-module-sync` ジョブ追加）

### Task 3: Green 確認

**成果物**: Phase 5 outputs にテスト実行結果（全 PASS）のスナップショットを記録

---

## 実装対象 1: `scripts/check-shared-module-sync.ts`

### アーキテクチャ

```
check-shared-module-sync.ts
├── パーサー関数（4つ）
│   ├── parseExports(packageJsonPath: string): Map<string, ExportEntry>
│   ├── parsePaths(tsconfigPath: string): Map<string, string[]>
│   ├── parseAliases(vitestConfigPath: string): Map<string, string>
│   └── parseTypesVersions(packageJsonPath: string): Map<string, string[]>
├── チェッカー関数（5つ）
│   ├── checkExportsVsPaths(exports, paths): CheckResult
│   ├── checkPathsVsExports(paths, exports): CheckResult
│   ├── checkExportsVsAliases(exports, aliases): CheckResult
│   ├── checkAliasesVsExports(aliases, exports): CheckResult
│   └── checkExportsVsTypesVersions(exports, typesVersions): CheckResult
├── レポーター関数
│   ├── formatReport(results: CheckResult[]): string
│   └── printSummary(results: CheckResult[]): void
└── main(): void
```

### パーサー関数の実装仕様

#### `parseExports(packageJsonPath: string): Map<string, ExportEntry>`

- `fs.readFileSync` で `package.json` を読み取り、`JSON.parse` する
- `exports` フィールドを取得する
- 各エントリキー（`"."`, `"./utils"` 等）を Map のキーとし、値を `ExportEntry` として格納する
- string 形式のエントリ（`"./foo": "./dist/foo.js"`）は `{ import: value }` に正規化する
- exports が存在しない場合は空 Map を返す

#### `parsePaths(tsconfigPath: string): Map<string, string[]>`

- `fs.readFileSync` で `tsconfig.json` を読み取り、`JSON.parse` する
- `compilerOptions.paths` フィールドを取得する
- ワイルドカード（`*` を含む）エントリはスキップする
- `@repo/shared` プレフィックスを持つエントリのみフィルタリングする
- paths が存在しない場合は空 Map を返す

#### `parseAliases(vitestConfigPath: string): Map<string, string>`

- `fs.readFileSync` で `vitest.config.ts` をテキストとして読み取る
- 正規表現 `/"(@repo\/shared[^"]*)":\s*resolve\(\s*__dirname,\s*"([^"]+)"\s*,?\s*\)/g` でエイリアスを抽出する
- 各マッチからエイリアス名（グループ1）とソースパス（グループ2）を取得する
- ファイルが存在しない場合はエラーをスローする
- マッチが0件の場合は空 Map を返す

#### `parseTypesVersions(packageJsonPath: string): Map<string, string[]>`

- `parseExports` と同じ `package.json` を読み取る（重複読み取りを避けるため、パース済みオブジェクトの受け渡しも可）
- `typesVersions["*"]` フィールドを取得する
- 各キーを Map のキーとし、値（パス配列）を格納する
- typesVersions が未定義の場合は空 Map を返す

### チェッカー関数の実装仕様

各チェッカー関数は `CheckResult` 型を返す:

```typescript
interface CheckResult {
  checkName: string;
  passed: boolean;
  missing: string[];
}
```

#### チェック1: `checkExportsVsPaths(exports, paths): CheckResult`

- exports の各サブパスキー（`"."`→`"@repo/shared"`, `"./utils"`→`"@repo/shared/utils"` に変換）が paths に存在するか検証する
- 変換ルール: `"."` → `"@repo/shared"`, `"./xxx"` → `"@repo/shared/xxx"`
- 存在しないエントリを `missing` 配列に追加する

#### チェック2: `checkPathsVsExports(paths, exports): CheckResult`

- paths の各キー（`@repo/shared` プレフィックス）を exports のサブパスキーに逆変換して存在確認する
- 逆変換ルール: `"@repo/shared"` → `"."`, `"@repo/shared/xxx"` → `"./xxx"`
- 存在しないエントリを `missing` 配列に追加する

#### チェック3: `checkExportsVsAliases(exports, aliases): CheckResult`

- チェック1と同じ変換ルールで exports のサブパスキーを alias キー形式に変換し、aliases Map に存在するか検証する

#### チェック4: `checkAliasesVsExports(aliases, exports): CheckResult`

- チェック2と同じ逆変換ルールで aliases のキーを exports のサブパスキーに逆変換して存在確認する

#### チェック5: `checkExportsVsTypesVersions(exports, typesVersions): CheckResult`

- exports のサブパスキーから `./` プレフィックスを除去して typesVersions のキーと照合する
- `"."` エントリはルートであり、typesVersions では特殊扱い（スキップまたは `""` キーで照合）
- 存在しないエントリを `missing` 配列に追加する

### レポーター関数の実装仕様

#### `formatReport(results: CheckResult[]): string`

- 各 `CheckResult` を以下のフォーマットで文字列化する:
  ```
  ✅ Check 1: exports → paths (PASSED)
  ❌ Check 3: exports → aliases (FAILED)
     Missing: ./errors, ./types
  ```
- 全チェック PASS 時は末尾に `\n✅ ALL CHECKS PASSED` を追加する
- 不整合あり時は末尾に `\n❌ SYNC CHECK FAILED: X issue(s) found` を追加する

#### `printSummary(results: CheckResult[]): void`

- `formatReport` の結果を `console.log` で出力する

### `main()` 関数の実装仕様

1. パスを定数定義する:
   - `PACKAGE_JSON_PATH`: `packages/shared/package.json`
   - `TSCONFIG_PATH`: `tsconfig.json`
   - `VITEST_CONFIG_PATH`: `vitest.config.ts`
2. 4つのパーサー関数を実行する
3. 5つのチェッカー関数を実行する
4. `printSummary` でレポートを出力する
5. いずれかのチェックが失敗した場合、`process.exitCode = 1` を設定する
6. 全チェック PASS の場合は `process.exitCode` を設定しない（0で終了）

### 型定義

```typescript
interface ExportEntry {
  types?: string;
  import?: string;
  require?: string;
  default?: string;
}

interface CheckResult {
  checkName: string;
  passed: boolean;
  missing: string[];
}
```

---

## 実装対象 2: `.github/workflows/ci.yml` — `check-module-sync` ジョブ追加

### ジョブ定義

```yaml
check-module-sync:
  name: Module Sync Check
  runs-on: ubuntu-latest
  timeout-minutes: 2
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
    - uses: actions/setup-node@v6
      with:
        node-version: "22"
        cache: "pnpm"
    - run: pnpm install --frozen-lockfile
    - run: pnpm tsx scripts/check-shared-module-sync.ts
```

### CI 統合ポイント

- `check-module-sync` ジョブは `lint` ジョブと同レベルで並列実行する
- `build-shared` への依存は不要（ソースファイル直接解析のため）
- `build` ジョブの `needs` 配列に `check-module-sync` を追加する
- 失敗時は PR をブロックする（必須チェックとして設定）

### 変更箇所の特定

既存 `ci.yml` に対して以下の2箇所を変更する:

1. **ジョブ追加**: `jobs:` セクション内に `check-module-sync` ジョブを追加
2. **needs 更新**: `build` ジョブの `needs` 配列に `check-module-sync` を追加

---

## 苦戦箇所対策

### exports を正本とした方向性チェック

- 全チェックは exports を起点として「exports にあるエントリが他層に存在するか」を検証する
- 逆方向チェック（他層 → exports）も実施して漏れを防止する
- exports の `"."` エントリはルートパッケージを表し、特殊な変換ルールが必要

### typesVersions キーの変換

- exports のサブパスキー `"./utils"` は typesVersions では `"utils"` として定義される
- `./` プレフィックスの除去が必要
- `"."` エントリは typesVersions ではルートエントリ（空文字列キーまたは `index` キー）にマッピングされる可能性がある

### ワイルドカード paths エントリのスキップ

- `@repo/shared/*` のようなワイルドカードエントリは個別エントリとの1:1対応がないためスキップする
- スキップ判定は `key.includes('*')` で行う

### Electron デスクトップアプリ観点

- 本タスクは CI/スクリプト領域であり、Renderer/Main/IPC の変更は発生しない
- `@repo/shared` のモジュール解決整合性の検証のみ
- Electron セキュリティルール（04-electron-security.md）への影響なし

---

## 実行手順

1. `scripts/check-shared-module-sync.ts` のスタブを本体実装に置き換える
2. パーサー関数を実装する（parseExports → parsePaths → parseAliases → parseTypesVersions の順）
3. 各パーサー関数の実装後、対応するテストが PASS することを確認する
4. チェッカー関数を実装する（checkExportsVsPaths → checkPathsVsExports → ... の順）
5. 各チェッカー関数の実装後、対応するテストが PASS することを確認する
6. レポーター関数を実装する
7. main 関数を実装する
8. 全 28 テストが PASS することを確認する:
   ```bash
   pnpm vitest run scripts/__tests__/check-shared-module-sync.test.ts
   ```
9. 実際のプロジェクトファイルに対してスクリプトを実行する:
   ```bash
   pnpm tsx scripts/check-shared-module-sync.ts
   ```
10. exit code 0 で正常終了することを確認する（現在の3層は TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 で整合済み）
11. `.github/workflows/ci.yml` に `check-module-sync` ジョブを追加する
12. Green フェーズの結果を `outputs/phase-5/` に記録する

---

## 統合テスト連携

| 連携項目          | 内容                                                                                                                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 主要スイート      | `packages/shared/src/__tests__/module-resolution.test.ts` / `apps/desktop/src/__tests__/shared-module-resolution.test.ts` / `apps/desktop/src/__tests__/vitest-alias-consistency.test.ts` |
| このPhaseでの扱い | 本Phaseの成果を3スイートと `scripts/check-shared-module-sync.ts` の期待値に反映し、差分が出た場合は仕様に戻って整合を取る                                                                 |
| 失敗時の戻り先    | 要件不整合はPhase 1、設計不整合はPhase 2、実装不整合はPhase 5/6に戻す                                                                                                                     |

## 成果物

| #   | 成果物                 | パス                                                                                              |
| --- | ---------------------- | ------------------------------------------------------------------------------------------------- |
| 1   | チェックスクリプト本体 | `scripts/check-shared-module-sync.ts`                                                             |
| 2   | CI ワークフロー更新    | `.github/workflows/ci.yml`                                                                        |
| 3   | Green フェーズ結果     | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/outputs/phase-5/test-results-green.md` |

---

## 完了条件

- [ ] `scripts/check-shared-module-sync.ts` が実装されている
- [ ] 4つのパーサー関数（parseExports, parsePaths, parseAliases, parseTypesVersions）が正しく動作する
- [ ] 5つのチェッカー関数（checkExportsVsPaths, checkPathsVsExports, checkExportsVsAliases, checkAliasesVsExports, checkExportsVsTypesVersions）が正しく動作する
- [ ] レポーター関数（formatReport, printSummary）が正しくフォーマットされた出力を生成する
- [ ] main 関数が不整合時に `process.exitCode = 1` を設定する
- [ ] 全 28 テストが PASS する（Green 確認）
- [ ] `pnpm tsx scripts/check-shared-module-sync.ts` が現在のプロジェクトに対して exit code 0 で終了する
- [ ] `.github/workflows/ci.yml` に `check-module-sync` ジョブが追加されている
- [ ] `check-module-sync` ジョブの timeout が 2 分に設定されている
- [ ] `build` ジョブの `needs` に `check-module-sync` が含まれている
- [ ] Green フェーズの結果が `outputs/phase-5/test-results-green.md` に記録されている

## 次Phase

Phase 6（テスト拡充）へ進む。
