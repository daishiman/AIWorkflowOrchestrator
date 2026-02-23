# Phase 2: 設計

## メタ情報

| 項目      | 内容                                         |
| --------- | -------------------------------------------- |
| Phase     | 2                                            |
| 機能名    | TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001      |
| タスク名  | `@repo/shared` モジュール解決3層整合CIガード |
| 作成日    | 2026-02-22                                   |
| 依存Phase | Phase 1（要件定義）                          |

## 目的

Phase 1で定義した5段階チェック要件に基づき、チェックスクリプトのモジュール構成、差分レポートフォーマット、CIワークフロー変更、パース戦略を設計する。

## aiworkflow-requirements 抽出要件の設計反映

| 要件ID | 出典仕様                   | 設計に落とし込む内容                                                              | 本Phaseでの反映先      |
| ------ | -------------------------- | --------------------------------------------------------------------------------- | ---------------------- |
| D1     | `architecture-monorepo.md` | `exports` 起点で `paths` / `alias` / `typesVersions` を照合する変換関数を明示する | Task 1.4               |
| D2     | `architecture-monorepo.md` | `paths` のワイルドカードは直接比較対象から除外し、個別サブパスを対象にする        | Task 1.2, Task 5.3     |
| D3     | `quality-requirements.md`  | 既存3スイートを壊さず、追加スクリプトを早期検出ガードとして位置付ける             | Task 3, 統合テスト連携 |
| D4     | `deployment-gha.md`        | CIジョブは並列実行可能性と `needs` の依存方向を明示する                           | Task 3.2, Task 3.4     |
| D5     | `error-handling.md`        | 失敗時の出力を `MISSING` / `MISMATCH` で分類し、修正行動へ接続する                | Task 2.2, Task 2.3     |

## 実行タスク

- 実行タスク一覧: 本Phaseで定義したTaskを上から順に実施する

### Task 1: チェックスクリプトのモジュール構成設計

#### 1.1 ファイル配置

```
scripts/
├── check-shared-module-sync.ts    # メインスクリプト
└── __tests__/
    └── check-shared-module-sync.test.ts  # ユニットテスト
```

#### 1.2 関数構成

```typescript
// === エントリポイント ===
main(): Promise<void>
  // 1. 4設定をパースする
  // 2. 5段階チェックを実行する
  // 3. レポートを出力する
  // 4. 不整合がある場合 process.exit(1)、ない場合 process.exit(0)

// === パーサー関数 ===
parseExports(packageJsonPath: string): Map<string, ExportEntry>
  // package.json を JSON.parse で読み取り、exports フィールドを Map に変換
  // キー: サブパス（例: ".", "./core"）
  // 値: ExportEntry { types: string, import: string }

parsePaths(tsconfigPath: string): Map<string, string>
  // tsconfig.json を JSON.parse で読み取り、paths フィールドを Map に変換
  // @repo/shared で始まるエントリのみ抽出
  // ワイルドカード（*）を含むエントリはスキップ
  // キー: パス名（例: "@repo/shared/core"）
  // 値: ソースパス（例: "../../packages/shared/core/index.ts"）

parseAliases(vitestConfigPath: string): Map<string, string>
  // vitest.config.ts をテキストとして読み取り、正規表現で alias を抽出
  // @repo/shared で始まるエントリのみ抽出
  // キー: エイリアス名（例: "@repo/shared/core"）
  // 値: ソースパス（例: "../../packages/shared/core/index.ts"）

parseTypesVersions(packageJsonPath: string): Map<string, string[]>
  // package.json を JSON.parse で読み取り、typesVersions["*"] を Map に変換
  // キー: サブパス（例: "core"、"types/auth"）
  // 値: ソースパスの配列（例: ["./core/index.ts"]）

// === チェッカー関数 ===
checkExportsVsPaths(exports: Map, paths: Map): CheckResult
  // チェック1: exports の各キーに対応する paths エントリが存在するか
  // exports "." → paths "@repo/shared"
  // exports "./core" → paths "@repo/shared/core"

checkPathsVsExports(paths: Map, exports: Map): CheckResult
  // チェック2: paths の各 @repo/shared エントリに対応する exports キーが存在するか
  // paths "@repo/shared/core" → exports "./core"
  // paths "@repo/shared" → exports "."

checkExportsVsAliases(exports: Map, aliases: Map): CheckResult
  // チェック3: exports の各キーに対応する alias エントリが存在するか
  // exports "." → alias "@repo/shared"
  // exports "./core" → alias "@repo/shared/core"

checkAliasesVsExports(aliases: Map, exports: Map): CheckResult
  // チェック4: alias の各 @repo/shared エントリに対応する exports キーが存在するか
  // alias "@repo/shared/core" → exports "./core"
  // alias "@repo/shared" → exports "."

checkExportsVsTypesVersions(exports: Map, typesVersions: Map): CheckResult
  // チェック5: exports のルート "." 以外の各サブパスに対応する typesVersions エントリが存在するか
  // exports "./core" → typesVersions "core"
  // exports "./types/auth" → typesVersions "types/auth"

// === レポーター関数 ===
formatReport(results: CheckResult[]): string
  // 全チェック結果をフォーマットされた文字列に変換
  // MISSING / MISMATCH の種別ごとにセクション分け

printSummary(exports: Map, paths: Map, aliases: Map, typesVersions: Map, results: CheckResult[]): string
  // サマリーセクション（エントリ数、不足数）を生成
  // 修正方法ガイダンスを付与
```

#### 1.3 型定義

```typescript
interface ExportEntry {
  types: string; // 例: "./dist/core/index.d.ts"
  import: string; // 例: "./dist/core/index.js"
}

interface CheckIssue {
  type: "MISSING" | "MISMATCH";
  source: string; // 検証元のキー（例: "./core"）
  expected: string; // 期待されるキー（例: "@repo/shared/core"）
  actual?: string; // 不一致時の実際値
  expectedPath?: string; // 期待されるパス
  actualPath?: string; // 実際のパス
}

interface CheckResult {
  checkName: string; // 例: "exports → paths"
  checkNumber: number; // 1〜5
  issues: CheckIssue[]; // 検出された不整合
  isPass: boolean; // issues.length === 0
}

interface SyncCheckSummary {
  exportsCount: number;
  pathsCount: number;
  aliasesCount: number;
  typesVersionsCount: number;
  totalIssues: number;
  isAllPass: boolean;
}
```

#### 1.4 キー変換ロジック

```typescript
// exports キー → paths/alias キーへの変換
function exportsKeyToPathsKey(exportsKey: string): string {
  if (exportsKey === ".") return "@repo/shared";
  // "./core" → "@repo/shared/core"
  return `@repo/shared/${exportsKey.slice(2)}`;
}

// exports キー → typesVersions キーへの変換
function exportsKeyToTypesVersionsKey(exportsKey: string): string {
  // "./core" → "core"
  return exportsKey.slice(2);
}

// paths/alias キー → exports キーへの変換
function pathsKeyToExportsKey(pathsKey: string): string {
  if (pathsKey === "@repo/shared") return ".";
  // "@repo/shared/core" → "./core"
  return `./${pathsKey.replace("@repo/shared/", "")}`;
}
```

### Task 2: 差分レポートフォーマット設計

#### 2.1 正常終了時の出力

```
✅ @repo/shared モジュール解決3層整合チェック PASSED

─── サマリー ───
  exports エントリ数: 27
  paths エントリ数 (@repo/shared): 27
  alias エントリ数 (@repo/shared): 27
  typesVersions エントリ数: 26
  全チェック: 5/5 PASS
```

#### 2.2 異常終了時の出力

```
❌ @repo/shared モジュール解決3層整合チェック FAILED

=== チェック1: exports → paths 不整合 ===
  MISSING: exports "./new-module" に対応する paths "@repo/shared/new-module" が tsconfig.json に存在しません

=== チェック3: exports → alias 不整合 ===
  MISSING: exports "./new-module" に対応する alias "@repo/shared/new-module" が vitest.config.ts に存在しません

=== チェック5: exports → typesVersions 不整合 ===
  MISSING: exports "./new-module" に対応する typesVersions "new-module" が package.json に存在しません

─── サマリー ───
  exports エントリ数: 28
  paths エントリ数 (@repo/shared): 27  (不足: 1)
  alias エントリ数 (@repo/shared): 27  (不足: 1)
  typesVersions エントリ数: 26  (不足: 1)
  全チェック: 2/5 PASS, 3/5 FAIL

💡 修正方法:
  1. package.json exports を正本（Source of Truth）として確認
  2. tsconfig.json paths に不足エントリを追加
  3. vitest.config.ts alias に不足エントリを追加
  4. package.json typesVersions に不足エントリを追加
  詳細: docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/phase-12-documentation.md
```

#### 2.3 パス不一致検出時の出力（MISMATCH）

```
=== チェック1: exports → paths パス不一致 ===
  MISMATCH: "@repo/shared/types" のソースパスが一致しません
    exports (types): ./dist/src/types/index.d.ts → ソース推定: src/types/index.ts
    paths:           ../../packages/shared/src/types/other.ts
```

**注記**: パス不一致検出（MISMATCH）はPhase 6（テスト拡充）で追加を検討する拡張機能であり、Phase 5（実装）ではMISSINGチェックのみを実装する。パス不一致はソースパスの正規化ロジックが複雑であるため、まずエントリ存在チェックを優先する。

### Task 3: CIワークフロー変更設計

#### 3.1 現在のジョブ依存構造

```
lint ──────────────────────────────┐
build-shared ──┬── typecheck ──────┤
               ├── test-shared ────┼── build (最終ゲート)
               └── test-desktop ───┘
security ──────────────────────────
coverage (main pushのみ) ──────────
```

#### 3.2 変更後のジョブ依存構造

```
lint ──────────────────────────────┐
check-module-sync ─────────────────┤  ← 新規追加
build-shared ──┬── typecheck ──────┤
               ├── test-shared ────┼── build (最終ゲート)
               └── test-desktop ───┘
security ──────────────────────────
coverage (main pushのみ) ──────────
```

#### 3.3 `check-module-sync` ジョブ定義

```yaml
check-module-sync:
  name: Module Sync Check
  runs-on: ubuntu-latest
  timeout-minutes: 2
  steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup pnpm
      uses: pnpm/action-setup@v4

    - name: Setup Node.js
      uses: actions/setup-node@v6
      with:
        node-version: "22"
        cache: "pnpm"

    - name: Configure git to use HTTPS instead of SSH
      run: git config --global url."https://github.com/".insteadOf "git@github.com:"

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Check @repo/shared module sync
      run: pnpm tsx scripts/check-shared-module-sync.ts
```

#### 3.4 `build` ジョブの `needs` 更新

```yaml
# 変更前
build:
  needs: [lint, typecheck, test-shared, test-desktop, build-shared]

# 変更後
build:
  needs: [lint, typecheck, test-shared, test-desktop, build-shared, check-module-sync]
```

#### 3.5 設計判断根拠

| 判断項目                         | 決定                           | 根拠                                                                          |
| -------------------------------- | ------------------------------ | ----------------------------------------------------------------------------- |
| `build-shared` に依存しない      | `needs` なし（独立実行）       | チェックスクリプトはソースファイルのみ読み取り、ビルド成果物を必要としない    |
| `lint` と並列実行                | 両方とも独立ジョブ             | CIの最速フィードバックを実現（1〜2分以内に結果が得られる）                    |
| `build` の `needs` に追加        | 必須                           | 不整合がある場合に最終ビルドを阻止し、PRマージを防止する                      |
| timeout 2分                      | ファイル読み取りとチェックのみ | `pnpm install` + チェックスクリプト実行で1分以内に完了する想定。2分はバッファ |
| `pnpm install --frozen-lockfile` | 必須                           | `tsx` コマンドを使用するため、devDependencies のインストールが必要            |

### Task 4: vitest.config.ts パース戦略設計

#### 4.1 パース方式

**正規表現ベースのパース**を採用する。

**使用する正規表現**:

```typescript
const ALIAS_PATTERN =
  /"(@repo\/shared[^"]*)":\s*resolve\(\s*__dirname,\s*"([^"]+)"\s*,?\s*\)/g;
```

**マッチ対象の例**:

```typescript
// vitest.config.ts 内の alias エントリ
"@repo/shared/core": resolve(__dirname, "../../packages/shared/core/index.ts"),
"@repo/shared/types": resolve(
  __dirname,
  "../../packages/shared/src/types/index.ts",
),
```

#### 4.2 正規表現のマッチグループ

| グループ# | 内容         | 例                                                                               |
| --------- | ------------ | -------------------------------------------------------------------------------- |
| 0         | フルマッチ   | `"@repo/shared/core": resolve(__dirname, "../../packages/shared/core/index.ts")` |
| 1         | エイリアス名 | `@repo/shared/core`                                                              |
| 2         | ソースパス   | `../../packages/shared/core/index.ts`                                            |

#### 4.3 代替方式を採用しない理由

| 方式                      | 不採用理由                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| AST パース（ts-morph）    | devDependencies に `ts-morph`（約50MB）を追加する必要があり、CIの軽量性を損なう             |
| `import()` 動的インポート | `vitest.config.ts` は `defineConfig` 等のVitest依存があり、スクリプトから直接importできない |
| `tsx` でevalして読み取り  | セキュリティリスクが高く、設定ファイルの副作用が発生する可能性がある                        |

#### 4.4 正規表現パースの制約と対策

| 制約                                     | 影響度 | 対策                                                                                         |
| ---------------------------------------- | ------ | -------------------------------------------------------------------------------------------- |
| alias定義のフォーマット変更で壊れる      | 中     | パース結果が0件の場合にエラーメッセージを出力し、フォーマット変更を検知する                  |
| 複数行にまたがる `resolve()` 呼び出し    | 低     | 正規表現の `\s*` で改行を含む空白に対応済み（vitest.config.ts の既存フォーマットで検証済み） |
| コメントアウトされたエントリを誤検出する | 低     | 現時点でコメントアウトされた alias エントリは存在しない。将来必要になった場合に対応する      |

#### 4.5 既存テストとの正規表現共有

`vitest-alias-consistency.test.ts` で使用されている同一の正規表現パターンを再利用する。テストスクリプトとチェックスクリプトで同じパターンを使用することで、パースの一貫性を保証する。

### Task 5: 苦戦箇所への対策設計

#### 5.1 苦戦箇所1: 三層正本曖昧性への対策

| 対策項目             | 実装方法                                                                        |
| -------------------- | ------------------------------------------------------------------------------- |
| 正本の明示           | レポートヘッダーに「正本: package.json exports」と明記する                      |
| チェック方向の一貫性 | チェック1, 3, 5 は「exports → 他層」の方向で、exports起点の正本ベース検証を行う |
| 修正ガイダンスの順序 | exports確認 → paths追加 → alias追加 → typesVersions追加 の順で修正を案内する    |

#### 5.2 苦戦箇所2: typesVersions二重管理への対策

| 対策項目                      | 実装方法                                                                                              |
| ----------------------------- | ----------------------------------------------------------------------------------------------------- |
| チェック5の実装               | exports のサブパス（ルート `.` 除外）から `./` プレフィックスを除去し、typesVersions のキーと比較する |
| ルートエントリの除外          | exports `"."` は typesVersions に対応エントリがないため、チェック5の対象から除外する                  |
| 将来の typesVersions 廃止対応 | TypeScript が typesVersions を非推奨にした場合、チェック5を環境変数で無効化可能にする                 |

#### 5.3 苦戦箇所3: alias glob パターン差異への対策

| 対策項目                         | 実装方法                                                                                      |
| -------------------------------- | --------------------------------------------------------------------------------------------- |
| ワイルドカードエントリのスキップ | paths の `@repo/shared/*` のようなワイルドカードエントリは checkPathsVsExports でスキップする |
| 個別エントリの検証               | ワイルドカードではなく、個別のサブパスエントリのみを検証対象とする                            |
| フィルタリングロジック           | `parsePaths()` でワイルドカードを含むキーを除外してから Map に格納する                        |

### Task 6: Electronデスクトップアプリ観点のチェック

#### 6.1 Electron固有の考慮事項

| 項目                       | 対応方針                                                                           |
| -------------------------- | ---------------------------------------------------------------------------------- |
| Main Process の型解決      | `tsconfig.json paths` が正しく設定されていれば、Main Process のimportは解決される  |
| Renderer Process の型解決  | Renderer Process も同じ `tsconfig.json` を参照するため、paths チェックで網羅される |
| Vitest テスト環境の解決    | `vitest.config.ts alias` が正しく設定されていれば、テスト環境のimportは解決される  |
| Preload スクリプトの型解決 | Preload も `apps/desktop/tsconfig.json` の `paths` を参照するため、追加対応不要    |

#### 6.2 `apps/desktop` 固有のパス構造

チェックスクリプトは以下のファイルパスをハードコードで参照する：

| 設定          | ファイルパス（プロジェクトルートからの相対）   |
| ------------- | ---------------------------------------------- |
| exports       | `packages/shared/package.json`                 |
| typesVersions | `packages/shared/package.json`（同一ファイル） |
| paths         | `apps/desktop/tsconfig.json`                   |
| alias         | `apps/desktop/vitest.config.ts`                |

これらのパスはモノレポのディレクトリ構造に依存する。将来 `apps/web` にも paths/alias が追加された場合は、チェックスクリプトの拡張が必要になる（本タスクのスコープ外）。

## 参照資料

| #   | ファイル                                                                            | 役割                              |
| --- | ----------------------------------------------------------------------------------- | --------------------------------- |
| 1   | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-1-requirements.md` | Phase 1 要件定義（前Phase成果物） |
| 2   | `docs/30-workflows/completed-tasks/task-imp-module-resolution-ci-guard.md`          | 元タスク指示書                    |
| 3   | `packages/shared/package.json`                                                      | 正本: exports と typesVersions    |
| 4   | `apps/desktop/tsconfig.json`                                                        | TypeScript paths 設定             |
| 5   | `apps/desktop/vitest.config.ts`                                                     | Vitest alias 設定                 |
| 6   | `.github/workflows/ci.yml`                                                          | CIワークフロー設定                |
| 7   | `apps/desktop/src/__tests__/vitest-alias-consistency.test.ts`                       | 正規表現パターンの参照元          |
| 8   | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`        | 三層整合の設計制約                |
| 9   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`         | 品質ゲート設計                    |
| 10  | `.claude/skills/aiworkflow-requirements/references/deployment-gha.md`               | CIジョブ依存設計                  |
| 11  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`               | エラー出力設計                    |

## 統合テスト連携

| 連携項目          | 内容                                                                                                                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 主要スイート      | `packages/shared/src/__tests__/module-resolution.test.ts` / `apps/desktop/src/__tests__/shared-module-resolution.test.ts` / `apps/desktop/src/__tests__/vitest-alias-consistency.test.ts` |
| このPhaseでの扱い | 本Phaseの成果を3スイートと `scripts/check-shared-module-sync.ts` の期待値に反映し、差分が出た場合は仕様に戻って整合を取る                                                                 |
| 失敗時の戻り先    | 要件不整合はPhase 1、設計不整合はPhase 2、実装不整合はPhase 5/6に戻す                                                                                                                     |

## 成果物

| #   | ファイル                                                                      | 説明     |
| --- | ----------------------------------------------------------------------------- | -------- |
| 1   | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-2-design.md` | 本仕様書 |

## 完了条件

- [ ] チェックスクリプトのモジュール構成（4パーサー + 5チェッカー + 2レポーター + main）が設計されている
- [ ] 全関数のシグネチャ（引数と戻り値の型）が定義されている
- [ ] 型定義（ExportEntry, CheckIssue, CheckResult, SyncCheckSummary）が定義されている
- [ ] キー変換ロジック（exportsKeyToPathsKey, exportsKeyToTypesVersionsKey, pathsKeyToExportsKey）が定義されている
- [ ] 差分レポートフォーマット（正常終了時、異常終了時、MISMATCH時）が設計されている
- [ ] CIワークフローの変更箇所（check-module-sync ジョブ追加、build の needs 更新）が設計されている
- [ ] `check-module-sync` ジョブが `lint` と並列で `build-shared` に依存しない設計であることが確認されている
- [ ] vitest.config.ts パース戦略（正規表現ベース）が設計され、使用する正規表現が確定している
- [ ] 正規表現パースの制約（フォーマット変更、複数行、コメント）と対策が定義されている
- [ ] 3つの苦戦箇所（正本曖昧性、typesVersions二重管理、alias globパターン差異）への対策が設計されている
- [ ] Electronデスクトップアプリ観点のチェック（Main/Renderer/Preload/Vitest）が確認されている
- [ ] ファイルパスのハードコード箇所が明示されている
- [ ] 本Phase内の全タスク（Task 1〜6）を100%実行完了

## 次Phase

Phase 3: 設計レビュー → `phase-3-design-review.md`
