# Phase 8: リファクタリング（TDD: Refactor） - UT-FIX-TS-VITEST-TSCONFIG-PATHS-001

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 8                                   |
| 機能名     | vitest-tsconfig-paths-sync          |
| 作成日     | 2026-02-24                          |
| タスク ID  | UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 |
| Issue      | #875                                |
| 前提 Phase | Phase 7（カバレッジ確認）完了済み   |

## 目的

Phase 5-7 で実装・テスト拡充・カバレッジ確認を完了した `scripts/check-shared-module-sync.ts` と関連テスト群（`scripts/__tests__/`）に対して、SOLID 原則・DRY 原則を適用しコード品質を改善する。リファクタリング前後で関連テストが全て PASS し、機能的な変更がないことを保証する。

## 実行タスク

- タスク一覧: 以下のTask 1以降を順に実行し、各成果物を生成する。

| #   | タスク名                         | 概要                                                   |
| --- | -------------------------------- | ------------------------------------------------------ |
| T1  | 重複コード解析                   | check-shared-module-sync.ts 内の重複パターンを特定する |
| T2  | チェッカー関数の DRY 化          | 6 つのチェッカー関数の共通ロジックを抽出する           |
| T3  | 命名規則の統一                   | 変数名・関数名・型名の命名規則を検証・修正する         |
| T4  | コメントの適切性確認             | 不要コメントの削除、不足コメントの追加                 |
| T5  | テストコードのリファクタリング   | テストヘルパーの抽出、テストデータの整理               |
| T6  | リファクタリング後の全テスト実行 | 関連テスト全件 PASS を確認する                         |
| T7  | リファクタリングレポート作成     | 変更内容と効果を記録する                               |

## 参照資料

| 資料名           | パス                                                                          |
| ---------------- | ----------------------------------------------------------------------------- |
| 要件定義書       | `outputs/phase-1/requirements.md`                                             |
| 設計書           | `outputs/phase-2/design-document.md`                                          |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md`                                   |
| テスト拡充報告書 | `outputs/phase-6/test-enhancement-report.md`                                  |
| カバレッジ報告書 | `outputs/phase-7/coverage-report.md`                                          |
| 本体スクリプト   | `scripts/check-shared-module-sync.ts`                                         |
| テストファイル   | `scripts/__tests__/check-shared-module-sync.test.ts`                          |
| 拡張テスト       | `scripts/__tests__/check-shared-module-sync-extended.test.ts`                 |
| プラグインテスト | `scripts/__tests__/vitest-tsconfig-paths-plugin.test.ts`                      |
| コード品質ルール | `.claude/rules/02-code-quality.md`                                            |
| 開発ガイドライン | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` |
| 品質要件仕様     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   |

## 実行手順

### Step 1: リファクタリング前のベースライン確認

1. 関連テストを実行し、全 PASS を確認する
   ```bash
   pnpm vitest run scripts/__tests__/
   ```
2. テスト件数は固定値を使わず、`vitest` 出力の実測値を記録する
3. ESLint 警告数を記録する
   ```bash
   pnpm eslint scripts/check-shared-module-sync.ts --format compact | wc -l
   ```

### Step 2: 重複コード解析（T1）

`check-shared-module-sync.ts` の以下の重複パターンを特定する：

1. **チェッカー関数の構造的重複**: `checkExportsVsPaths()`、`checkExportsVsAliases()`、`checkExportsVsTypesVersions()` は「基準 Map のエントリが検証先 Map に存在するか」という同一ロジックを持つ。`checkPathsVsExports()`、`checkAliasesVsExports()`、`checkTypesVersionsVsExports()` も同様の逆方向ロジック
2. **キー変換の散在**: `toModuleKey()`、`toSubpath()`、`toTypesVersionsKey()` が各チェッカー内で個別に呼ばれているパターン
3. **CheckResult 生成の重複**: 各チェッカーが `{ checkName, passed, missing }` オブジェクトを同じ構造で生成している

### Step 3: チェッカー関数の DRY 化（T2）

以下の方針でリファクタリングを実施する：

1. **汎用チェック関数の抽出を検討する**:
   - 6 つのチェッカー関数に共通する「Map A のキーが Map B に存在するか」ロジックを汎用関数として抽出可能か検証する
   - 抽出する場合の関数シグネチャ例:
     ```typescript
     function checkMapContainment(
       source: Map<string, unknown>,
       target: Map<string, unknown>,
       checkName: string,
       keyTransform?: (key: string) => string | null,
     ): CheckResult;
     ```
   - 各チェッカー固有の変換ロジック（`toModuleKey`、`toSubpath`、`toTypesVersionsKey`）は `keyTransform` パラメータで注入する
2. **抽出の判断基準**: 共通化により各チェッカーが 5 行以下に削減でき、かつテストの可読性が低下しない場合のみ実施する。共通化による抽象化が過剰な場合は、現状の構造を維持しコメントで意図を明記する
3. **リファクタリング後、関連テスト全件を実行して PASS を確認する**

### Step 4: 命名規則の統一（T3）

以下の観点で命名を検証・修正する：

| 対象     | 検証項目                                                        | 基準                                      |
| -------- | --------------------------------------------------------------- | ----------------------------------------- |
| 変数名   | boolean 変数が `is`/`has`/`can`/`should` プレフィックスであるか | `02-code-quality.md` コーディング規約準拠 |
| 関数名   | 動詞始まりか（`check`、`parse`、`format`）                      | 既存命名パターンとの一貫性                |
| 型名     | PascalCase であるか                                             | TypeScript 標準規約                       |
| 定数名   | UPPER_SNAKE_CASE であるか（`CHECK_NAMES` 等）                   | 既存定数 `FILE_PATHS` との一貫性          |
| テスト名 | `describe`/`it` の記述が日本語または英語で統一されているか      | テストファイル内での統一性                |

### Step 5: コメントの適切性確認（T4）

1. **不要コメント**: 自明なコード（例: `// Map に変換` の直前に `new Map()` がある場合）のコメントを削除する
2. **不足コメント**: 以下の箇所にコメントが必要か確認する
   - `parseAliases()` の正規表現パターン（132 行）の意図説明
   - `toTypesVersionsKey()` で `"."` を `null` として返す理由
   - `main()` の処理フロー概要
3. コメント変更後、関連テスト全件を実行して PASS を確認する

### Step 6: テストコードのリファクタリング（T5）

1. **テストヘルパーの抽出を検討する**:
   - 複数の `describe` ブロックで繰り返されるモック設定（`vi.mocked(readFileSync)` 等）を `beforeEach` またはヘルパー関数に集約可能か検証する
   - テストデータ（`mockPackageJson`、`mockTsconfig` 等）が複数テストで重複している場合、共通定数として抽出する
2. **テストの独立性を保証する**: テスト間で状態を共有しないことを確認する（P9 対策）
3. リファクタリング後、関連テスト全件を実行して PASS を確認する

### Step 7: リファクタリングレポート作成（T7）

以下の項目を `outputs/phase-8/refactoring-report.md` に記録する：

1. リファクタリング前後のコード行数比較（本体・テスト）
2. 実施した変更の一覧（ファイル名、変更内容、理由）
3. DRY 化の結果（共通関数を抽出した場合はその効果、抽出しなかった場合はその判断理由）
4. 命名規則の修正箇所（修正した場合のみ）
5. 全テスト実行結果（実測件数ベースの PASS 記録）
6. ESLint 警告数の変化（リファクタリング前 → 後）

## 統合テスト連携

| 連携対象       | 実施内容                                                                   |
| -------------- | -------------------------------------------------------------------------- |
| scripts テスト | リファクタリング後に関連テスト全件PASSを維持し、機能変更なしを保証する     |
| 品質ゲート連携 | ESLint/Prettier/Typecheck の結果を Phase 9 へ引き継げる形式で記録する      |
| CI 実行整合    | `check-shared-module-sync.ts` の入出力契約を維持し CI ジョブ互換を保持する |

## 多角的チェック観点

| #   | 観点           | 確認内容                                                           |
| --- | -------------- | ------------------------------------------------------------------ |
| C1  | 機能保全       | リファクタリング前後で関連テスト全 PASS が維持されているか         |
| C2  | DRY 原則       | 6 つのチェッカー関数に不要な重複が残存していないか                 |
| C3  | 命名一貫性     | 変数・関数・型・定数の命名が規約に準拠しているか                   |
| C4  | コメント適切性 | 自明なコメントが残存していないか、必要なコメントが欠落していないか |
| C5  | テスト独立性   | テスト間の状態共有がないか（P9 対策）                              |
| C6  | 可読性         | リファクタリングにより可読性が向上したか（または低下していないか） |
| C7  | ESLint 準拠    | ESLint 警告が 0 件であるか                                         |

## 成果物

| 成果物                   | パス                                    | 形式     |
| ------------------------ | --------------------------------------- | -------- |
| リファクタリングレポート | `outputs/phase-8/refactoring-report.md` | Markdown |

## 完了条件

- [ ] リファクタリング後の関連テスト全件が PASS する
- [ ] ESLint 警告が 0 件である（`pnpm eslint scripts/check-shared-module-sync.ts` の出力が 0 エラー 0 警告）
- [ ] 重複コードの分析が完了し、DRY 化の実施または見送り判断が記録されている
- [ ] 命名規則が `02-code-quality.md` のコーディング規約に準拠している
- [ ] テストコードの独立性が確認されている（テスト間の状態共有がない）
- [ ] `outputs/phase-8/refactoring-report.md` が作成され、変更内容・効果・テスト結果が記載されている

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/vitest-tsconfig-paths-sync --phase 8
```

## 次のPhase

**Phase 9: 品質保証** — Lint・型チェック・全テスト実行による品質ゲート通過を検証する。
