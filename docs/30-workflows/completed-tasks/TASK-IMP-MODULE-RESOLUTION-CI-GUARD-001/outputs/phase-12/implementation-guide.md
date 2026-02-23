# 実装ガイド: @repo/shared モジュール解決3層整合CIガード

> **タスクID**: TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001
> **スクリプト**: `scripts/check-shared-module-sync.ts`
> **テスト**: `scripts/__tests__/check-shared-module-sync.test.ts`（43テスト）
> **CI**: `.github/workflows/ci.yml` — `check-module-sync` ジョブ

---

## Part 1: 概念説明（中学生レベル）

### お弁当屋さんで考える「モジュール整合チェック」

あなたが「AIお弁当屋さん」の店長だと想像してみてください。お弁当屋さんには、お弁当を正しく作って届けるための大事な書類が4つあります。

---

#### 4つの書類の役割

**1. 注文票（package.json の exports）**

お弁当屋さんの一番大事な書類です。「うちのお店では、こんなお弁当を売っています」と書いてある、メニュー一覧のことです。

たとえば:

- 「幕の内弁当」（メインのお弁当）
- 「サラダセット」（おかず単品）
- 「デザートセット」（甘いもの）

プログラムの世界では、`@repo/shared` パッケージが「他のアプリに提供する機能の一覧」を書いた場所が `exports` です。ここに書いてあるものだけが、他のアプリから使えます。

**2. レシピ帳（tsconfig.json の paths）**

調理場にあるレシピ帳です。「幕の内弁当を作るには、冷蔵庫のこの棚から材料を取ってきてね」と書いてあります。

プログラムの世界では、TypeScriptが「`@repo/shared/utils` って書いてあったら、実際にはこのファイルを見にいってね」と教える道案内のことです。注文票に「サラダセット」があるのに、レシピ帳に「サラダセットの作り方」が書いていなかったら、作れませんよね。

**3. 食材リスト（vitest.config.ts の alias）**

テスト用の食材リストです。お弁当の「味見担当」（テスト）が使う食材の場所を書いてあります。注文票に載っているお弁当は、全部味見できないといけません。

プログラムの世界では、テストツール（Vitest）が「`@repo/shared/utils` って書いてあったら、テスト用にはこのファイルを見にいってね」と教える道案内です。

**4. 栄養表示（package.json の typesVersions）**

お弁当の箱に貼る栄養成分表示です。どのお弁当にどんな栄養（型の情報）が入っているかを書いてあります。

プログラムの世界では、TypeScriptの「型定義ファイルがどこにあるか」を教える情報です。メインのお弁当（`.` エントリ）には栄養表示は不要ですが、サブメニュー（`./utils` や `./errors`）には必要です。

---

#### なぜ「品質管理の係員」が必要なのか

ある日、お弁当屋さんで大事件が起きました。

注文票に新しいお弁当「エビフライ弁当」を追加したのに、レシピ帳にレシピを書き忘れ、食材リストにも食材を入れ忘れ、栄養表示も貼り忘れました。そのまま営業を始めたら、お客さんが「エビフライ弁当ください」と注文してきたのに、作り方がわからない、味見もしていない、栄養も不明、という大混乱になりました。

実際のプロジェクトでも同じことが起きました。`@repo/shared` に新しいモジュールを追加したとき、`exports` だけ更新して `paths`・`alias`・`typesVersions` の更新を忘れると、228件ものエラーが一気に発生しました。

そこで、**品質管理の係員**（CIガードスクリプト）を雇いました。この係員は、コードに変更があるたびに自動で出勤して、4つの書類が全部揃っているかチェックしてくれます。

---

#### チェックの仕組み（5つのチェックリスト）

品質管理の係員は、5つの項目を順番にチェックします。

| チェック番号 | やること                                       | お弁当屋さんでの例え                           |
| ------------ | ---------------------------------------------- | ---------------------------------------------- |
| チェック1    | 注文票のお弁当が、全部レシピ帳に載っているか   | 「幕の内弁当のレシピ、ちゃんとある？」         |
| チェック2    | レシピ帳のレシピが、全部注文票に載っているか   | 「このレシピ、もう売ってないお弁当じゃない？」 |
| チェック3    | 注文票のお弁当が、全部食材リストに載っているか | 「幕の内弁当の味見用食材、ちゃんとある？」     |
| チェック4    | 食材リストの食材が、全部注文票に対応しているか | 「この食材、もう使わないお弁当のじゃない？」   |
| チェック5    | 注文票のお弁当に、全部栄養表示が貼ってあるか   | 「サラダセットの栄養表示、ちゃんとある？」     |

チェック1とチェック2はセット、チェック3とチェック4もセットです。片方向だけ確認しても「追加忘れ」は見つけられますが、「削除忘れ」（もう使わないのに残っている）は見つけられません。だから、双方向で確認します。

---

#### チェック結果の報告

全部合格したら:

```
  Check 1: exports -> paths (PASSED)
  Check 2: paths -> exports (PASSED)
  Check 3: exports -> aliases (PASSED)
  Check 4: aliases -> exports (PASSED)
  Check 5: exports -> typesVersions (PASSED)

  ALL CHECKS PASSED
```

係員は「問題なし!」と報告して、お弁当屋さんは安心して営業できます（exit code 0）。

不合格があったら:

```
  Check 1: exports -> paths (FAILED)
   Missing: ./errors
  Check 2: paths -> exports (PASSED)
  Check 3: exports -> aliases (FAILED)
   Missing: ./errors
  Check 4: aliases -> exports (PASSED)
  Check 5: exports -> typesVersions (FAILED)
   Missing: ./errors

  SYNC CHECK FAILED: 3 issue(s) found
```

係員は「ここが足りません!」と不足報告書を出して、お弁当屋さんの営業を止めます（exit code 1）。足りないものを全部追加するまで、営業再開はできません。

---

## Part 2: 開発者向け実装詳細

### 2.1 各関数API仕様

#### パーサー関数（4つ）

##### `parseExports(packageJsonPath: string): Map<string, ExportEntry>`

`package.json` の `exports` フィールドを読み取り、`Map<string, ExportEntry>` に変換する。

- **引数**: `packageJsonPath` — `package.json` のファイルパス（例: `"packages/shared/package.json"`）
- **戻り値**: `Map<string, ExportEntry>` — キーはサブパス（`"."`, `"./utils"` など）、値は `ExportEntry` オブジェクト
- **振る舞い**:
  - `fs.readFileSync` で JSON ファイルを読み取り、`JSON.parse` でパースする
  - `exports` フィールドが未定義の場合は空の `Map` を返す
  - 各エントリの値が `string` の場合は `{ import: value }` に正規化する
  - 各エントリの値が `null` または `undefined` の場合はスキップする
  - ファイルが存在しない場合は `ENOENT` エラーをスローする
  - JSON が不正な場合は `SyntaxError` をスローする

##### `parsePaths(tsconfigPath: string): Map<string, string[]>`

`tsconfig.json` の `compilerOptions.paths` を読み取り、`@repo/shared` プレフィックスのエントリのみ `Map` に変換する。

- **引数**: `tsconfigPath` — `tsconfig.json` のファイルパス（例: `"apps/desktop/tsconfig.json"`）
- **戻り値**: `Map<string, string[]>` — キーはモジュールキー（`"@repo/shared"`, `"@repo/shared/utils"` など）、値はパス配列
- **振る舞い**:
  - `fs.readFileSync` で JSON ファイルを読み取り、`JSON.parse` でパースする
  - `compilerOptions` または `paths` が未定義の場合は空の `Map` を返す
  - ワイルドカード（`*`）を含むキーはスキップする
  - `@repo/shared` プレフィックスで始まるキーのみ結果に含める
  - ファイルが存在しない場合は `ENOENT` エラーをスローする

##### `parseAliases(vitestConfigPath: string): Map<string, string>`

`vitest.config.ts` を正規表現でパースし、`@repo/shared` プレフィックスのエイリアスを `Map` に変換する。

- **引数**: `vitestConfigPath` — `vitest.config.ts` のファイルパス（例: `"apps/desktop/vitest.config.ts"`）
- **戻り値**: `Map<string, string>` — キーはエイリアス名（`"@repo/shared/utils"` など）、値はソースパス
- **振る舞い**:
  - `fs.readFileSync` でファイルを文字列として読み取る
  - 正規表現 `/"(@repo\/shared[^"]*)":\s*resolve\(\s*__dirname,\s*"([^"]+)"\s*,?\s*\)/g` でマッチングする
  - ダブルクォートで囲まれたエントリのみ検出する（シングルクォートはマッチしない）
  - `resolve()` の引数間にコメントがある場合はマッチしない
  - パース結果が0件で、ファイル内に `"alias"` 文字列が含まれる場合は `console.warn` で警告を出力する
  - ファイルが存在しない場合は `ENOENT` エラーをスローする

##### `parseTypesVersions(packageJsonPath: string): Map<string, string[]>`

`package.json` の `typesVersions["*"]` を読み取り、`Map` に変換する。

- **引数**: `packageJsonPath` — `package.json` のファイルパス（例: `"packages/shared/package.json"`）
- **戻り値**: `Map<string, string[]>` — キーは型バージョンキー（`"utils"` など）、値は型定義パス配列
- **振る舞い**:
  - `fs.readFileSync` で JSON ファイルを読み取り、`JSON.parse` でパースする
  - `typesVersions` が未定義の場合は空の `Map` を返す
  - `"*"` キー配下のエントリのみを対象とする（`">=4.0"` などの他バージョン条件は無視する）
  - ファイルが存在しない場合は `ENOENT` エラーをスローする

---

#### チェッカー関数（5つ）

全チェッカー関数の戻り値は `CheckResult` インターフェースで統一されている。

##### `checkExportsVsPaths(exportsMap: Map<string, ExportEntry>, paths: Map<string, string[]>): CheckResult`

**チェック1**: exports の各エントリが paths に存在するか検証する。

- **引数**:
  - `exportsMap` — `parseExports` の戻り値
  - `paths` — `parsePaths` の戻り値
- **戻り値**: `CheckResult`（`checkName: "exports -> paths"`）
- **振る舞い**:
  - exports の各サブパスキー（`"."`, `"./utils"` など）を `toModuleKey` でモジュールキー（`"@repo/shared"`, `"@repo/shared/utils"` など）に変換し、`paths` に存在するか確認する
  - 存在しないサブパスキーを `missing` 配列に格納する
  - `missing` が空なら `passed: true`、空でなければ `passed: false`

##### `checkPathsVsExports(paths: Map<string, string[]>, exportsMap: Map<string, ExportEntry>): CheckResult`

**チェック2**: paths の各エントリが exports に存在するか検証する。

- **引数**:
  - `paths` — `parsePaths` の戻り値
  - `exportsMap` — `parseExports` の戻り値
- **戻り値**: `CheckResult`（`checkName: "paths -> exports"`）
- **振る舞い**:
  - paths の各モジュールキー（`"@repo/shared"`, `"@repo/shared/utils"` など）を `toSubpath` でサブパスキー（`"."`, `"./utils"` など）に変換し、`exportsMap` に存在するか確認する
  - 存在しないモジュールキーを `missing` 配列に格納する

##### `checkExportsVsAliases(exportsMap: Map<string, ExportEntry>, aliases: Map<string, string>): CheckResult`

**チェック3**: exports の各エントリが alias に存在するか検証する。

- **引数**:
  - `exportsMap` — `parseExports` の戻り値
  - `aliases` — `parseAliases` の戻り値
- **戻り値**: `CheckResult`（`checkName: "exports -> aliases"`）
- **振る舞い**:
  - exports の各サブパスキーを `toModuleKey` で変換し、`aliases` に存在するか確認する
  - 存在しないサブパスキーを `missing` 配列に格納する

##### `checkAliasesVsExports(aliases: Map<string, string>, exportsMap: Map<string, ExportEntry>): CheckResult`

**チェック4**: alias の各エントリが exports に存在するか検証する。

- **引数**:
  - `aliases` — `parseAliases` の戻り値
  - `exportsMap` — `parseExports` の戻り値
- **戻り値**: `CheckResult`（`checkName: "aliases -> exports"`）
- **振る舞い**:
  - aliases の各モジュールキーを `toSubpath` で変換し、`exportsMap` に存在するか確認する
  - 存在しないモジュールキーを `missing` 配列に格納する

##### `checkExportsVsTypesVersions(exportsMap: Map<string, ExportEntry>, typesVersions: Map<string, string[]>): CheckResult`

**チェック5**: exports の各サブパスエントリが typesVersions に存在するか検証する。

- **引数**:
  - `exportsMap` — `parseExports` の戻り値
  - `typesVersions` — `parseTypesVersions` の戻り値
- **戻り値**: `CheckResult`（`checkName: "exports -> typesVersions"`）
- **振る舞い**:
  - exports の各サブパスキーを `toTypesVersionsKey` で変換する
  - `"."` エントリはスキップする（`toTypesVersionsKey` が `null` を返す）
  - 変換後のキーが `typesVersions` に存在するか確認する
  - 存在しないサブパスキーを `missing` 配列に格納する

---

#### ヘルパー関数（3つ）

これらはモジュール内部のユーティリティ関数であり、エクスポートされていない。

##### `toModuleKey(subpath: string): string`

exports サブパスキーを paths/alias キーに変換する。

- **変換ルール**:
  - `"."` → `"@repo/shared"`
  - `"./xxx"` → `"@repo/shared/xxx"`
  - `"./a/b/c"` → `"@repo/shared/a/b/c"`（深いネスト対応）

##### `toSubpath(moduleKey: string): string`

paths/alias キーを exports サブパスキーに逆変換する。

- **変換ルール**:
  - `"@repo/shared"` → `"."`
  - `"@repo/shared/xxx"` → `"./xxx"`
  - `"@repo/shared/a/b/c"` → `"./a/b/c"`（深いネスト対応）

##### `toTypesVersionsKey(subpath: string): string | null`

exports サブパスキーを typesVersions キーに変換する。

- **変換ルール**:
  - `"."` → `null`（スキップ対象）
  - `"./xxx"` → `"xxx"`
  - `"./a/b/c"` → `"a/b/c"`

---

#### レポーター関数（2つ）

##### `formatReport(results: CheckResult[]): string`

チェック結果配列を人間が読みやすい文字列に整形する。

- **引数**: `results` — `CheckResult` の配列（5要素）
- **戻り値**: 整形された複数行文字列
- **振る舞い**:
  - 各チェック結果を `Check N: チェック名 (PASSED)` または `Check N: チェック名 (FAILED)` 形式で出力する（N は 1始まりのインデックス）
  - FAILED の場合は直下に `Missing: エントリ1, エントリ2, ...` をカンマ区切りで出力する
  - 全チェック PASSED の場合は末尾に `ALL CHECKS PASSED` を出力する
  - FAILED が1つ以上ある場合は末尾に `SYNC CHECK FAILED: N issue(s) found`（N は FAILED の件数）を出力する

##### `printSummary(results: CheckResult[]): void`

`formatReport` の結果を `console.log` で標準出力に出力する。

- **引数**: `results` — `CheckResult` の配列
- **戻り値**: なし
- **振る舞い**:
  - `formatReport(results)` を呼び出し、その結果を `console.log` に渡す

---

### 2.2 CIジョブ設定詳細

#### YAML設定

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

    - name: Check module sync
      run: pnpm tsx scripts/check-shared-module-sync.ts
```

#### 実行タイミング

CI ワークフロー全体のトリガー条件:

| イベント       | ブランチ | 除外パス                                                                                                       |
| -------------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| `push`         | `main`   | `docs/**`, `**/*.md`, `.github/ISSUE_TEMPLATE/**`, `.github/PULL_REQUEST_TEMPLATE/**`, `LICENSE`, `.gitignore` |
| `pull_request` | `main`   | 同上                                                                                                           |

`check-module-sync` ジョブは他のジョブと並列に独立実行される（`needs` 指定なし）。

#### 並列実行関係

```
lint ─────────────┐
typecheck ────────┤
test-shared ──────┤
test-desktop ─────┼──→ build
build-shared ─────┤
check-module-sync ┘
security (独立実行)
coverage-report (test-desktop 完了後)
```

`check-module-sync` は `build` ジョブの前提条件の1つ。`check-module-sync` が失敗すると `build` ジョブは実行されない。

#### その他の設定

| 項目                   | 値                                                      |
| ---------------------- | ------------------------------------------------------- |
| タイムアウト           | 2分                                                     |
| ランナー               | `ubuntu-latest`                                         |
| Node.js バージョン     | 22                                                      |
| パッケージマネージャー | pnpm（`pnpm/action-setup@v4` でセットアップ）           |
| 依存関係インストール   | `pnpm install --frozen-lockfile`（ロックファイル固定）  |
| 実行コマンド           | `pnpm tsx scripts/check-shared-module-sync.ts`          |
| 権限                   | `contents: read`, `pull-requests: read`（最小権限）     |
| 同時実行制御           | `github.workflow`-`github.ref` グループ単位でキャンセル |

---

### 2.3 差分レポートフォーマット仕様

#### 全チェック PASS 時の出力例

```
  Check 1: exports -> paths (PASSED)
  Check 2: paths -> exports (PASSED)
  Check 3: exports -> aliases (PASSED)
  Check 4: aliases -> exports (PASSED)
  Check 5: exports -> typesVersions (PASSED)

  ALL CHECKS PASSED
```

- 終了コード: `0`（`process.exitCode` 未設定）

#### 不整合あり時の出力例（単一チェック失敗）

```
  Check 1: exports -> paths (FAILED)
   Missing: ./errors
  Check 2: paths -> exports (PASSED)
  Check 3: exports -> aliases (FAILED)
   Missing: ./errors
  Check 4: aliases -> exports (PASSED)
  Check 5: exports -> typesVersions (FAILED)
   Missing: ./errors

  SYNC CHECK FAILED: 3 issue(s) found
```

- 終了コード: `1`（`process.exitCode = 1`）

#### 不整合あり時の出力例（複数エントリ不足）

```
  Check 1: exports -> paths (FAILED)
   Missing: ./errors, ./types
  Check 2: paths -> exports (PASSED)
  Check 3: exports -> aliases (FAILED)
   Missing: ./errors
  Check 4: aliases -> exports (PASSED)
  Check 5: exports -> typesVersions (FAILED)
   Missing: ./types

  SYNC CHECK FAILED: 3 issue(s) found
```

#### 双方向チェックで異なるエントリが不足する場合

```
  Check 1: exports -> paths (FAILED)
   Missing: ./errors
  Check 2: paths -> exports (FAILED)
   Missing: @repo/shared/extra
  Check 3: exports -> aliases (PASSED)
  Check 4: aliases -> exports (PASSED)
  Check 5: exports -> typesVersions (PASSED)

  SYNC CHECK FAILED: 2 issue(s) found
```

#### レポートフォーマットの仕様

| 要素             | フォーマット                                 |
| ---------------- | -------------------------------------------- |
| PASS行           | `  Check N: チェック名 (PASSED)`             |
| FAIL行           | `  Check N: チェック名 (FAILED)`             |
| Missing行        | `   Missing: エントリ1, エントリ2, ...`      |
| 全PASS時サマリー | `  ALL CHECKS PASSED`                        |
| 失敗時サマリー   | `  SYNC CHECK FAILED: N issue(s) found`      |
| 行間インデント   | 2スペース（Check行）、3スペース（Missing行） |
| サマリー前       | 空行1行                                      |

---

### 2.4 定数定義

#### `CONFIG`

ファイルパスとプレフィックスの設定定数。

```typescript
export const CONFIG = {
  PACKAGE_JSON_PATH: "packages/shared/package.json",
  TSCONFIG_PATH: "apps/desktop/tsconfig.json",
  VITEST_CONFIG_PATH: "apps/desktop/vitest.config.ts",
  SHARED_PREFIX: "@repo/shared",
} as const;
```

| キー                 | 値                                | 用途                                           |
| -------------------- | --------------------------------- | ---------------------------------------------- |
| `PACKAGE_JSON_PATH`  | `"packages/shared/package.json"`  | exports と typesVersions の読み取り元          |
| `TSCONFIG_PATH`      | `"apps/desktop/tsconfig.json"`    | paths の読み取り元                             |
| `VITEST_CONFIG_PATH` | `"apps/desktop/vitest.config.ts"` | alias の読み取り元                             |
| `SHARED_PREFIX`      | `"@repo/shared"`                  | フィルタリング対象のパッケージ名プレフィックス |

後方互換エイリアス:

```typescript
export const PACKAGE_JSON_PATH = CONFIG.PACKAGE_JSON_PATH;
export const TSCONFIG_PATH = CONFIG.TSCONFIG_PATH;
export const VITEST_CONFIG_PATH = CONFIG.VITEST_CONFIG_PATH;
```

#### `PATTERNS`

正規表現パターンの定数（モジュール内部、エクスポートされない）。

```typescript
const PATTERNS = {
  VITEST_ALIAS:
    /"(@repo\/shared[^"]*)":\s*resolve\(\s*__dirname,\s*"([^"]+)"\s*,?\s*\)/g,
} as const;
```

| キー           | 用途                                                                      |
| -------------- | ------------------------------------------------------------------------- |
| `VITEST_ALIAS` | `vitest.config.ts` から `@repo/shared` エイリアスを抽出するための正規表現 |

正規表現の構造:

- `"(@repo\/shared[^"]*)"` — ダブルクォートで囲まれたエイリアス名をキャプチャ（キャプチャグループ1）
- `:\s*resolve\(\s*__dirname,\s*` — `: resolve(__dirname,` の部分（空白の揺れに対応）
- `"([^"]+)"` — ダブルクォートで囲まれたソースパスをキャプチャ（キャプチャグループ2）
- `\s*,?\s*\)` — 末尾のオプショナルカンマと閉じ括弧

制限事項:

- シングルクォートで囲まれたエントリはマッチしない
- `resolve()` の引数間にコメントがある場合はマッチしない
- 複数行にまたがる `resolve()` 呼び出しにはマッチする（`__dirname` と パス文字列が同一行にある場合）

#### `CHECK_NAMES`

チェック名の定数（モジュール内部、エクスポートされない）。

```typescript
const CHECK_NAMES = {
  EXPORTS_VS_PATHS: "exports -> paths",
  PATHS_VS_EXPORTS: "paths -> exports",
  EXPORTS_VS_ALIASES: "exports -> aliases",
  ALIASES_VS_EXPORTS: "aliases -> exports",
  EXPORTS_VS_TYPES_VERSIONS: "exports -> typesVersions",
} as const;
```

| キー                        | 値                           | 対応チェッカー関数            |
| --------------------------- | ---------------------------- | ----------------------------- |
| `EXPORTS_VS_PATHS`          | `"exports -> paths"`         | `checkExportsVsPaths`         |
| `PATHS_VS_EXPORTS`          | `"paths -> exports"`         | `checkPathsVsExports`         |
| `EXPORTS_VS_ALIASES`        | `"exports -> aliases"`       | `checkExportsVsAliases`       |
| `ALIASES_VS_EXPORTS`        | `"aliases -> exports"`       | `checkAliasesVsExports`       |
| `EXPORTS_VS_TYPES_VERSIONS` | `"exports -> typesVersions"` | `checkExportsVsTypesVersions` |

---

### 2.5 型定義

#### `ExportEntry`

`package.json` の `exports` フィールドの各エントリを表すインターフェース。

```typescript
export interface ExportEntry {
  types?: string;
  import?: string;
  require?: string;
  default?: string;
}
```

| プロパティ | 型       | 必須 | 説明                                                          |
| ---------- | -------- | ---- | ------------------------------------------------------------- |
| `types`    | `string` | 任意 | TypeScript 型定義ファイルのパス（例: `"./dist/index.d.ts"`）  |
| `import`   | `string` | 任意 | ESM インポート時のエントリポイント（例: `"./dist/index.js"`） |
| `require`  | `string` | 任意 | CJS require 時のエントリポイント                              |
| `default`  | `string` | 任意 | デフォルトのエントリポイント                                  |

**string 形式の正規化**: `exports` の値が `string` の場合（例: `".": "./dist/index.js"`）、`parseExports` が `{ import: value }` に正規化する。

#### `CheckResult`

各チェッカー関数の戻り値を統一するインターフェース。

```typescript
export interface CheckResult {
  checkName: string;
  passed: boolean;
  missing: string[];
}
```

| プロパティ  | 型         | 説明                                                |
| ----------- | ---------- | --------------------------------------------------- |
| `checkName` | `string`   | チェックの名称（`CHECK_NAMES` 定数の値）            |
| `passed`    | `boolean`  | チェック合格なら `true`、不合格なら `false`         |
| `missing`   | `string[]` | 不足しているエントリのキー配列。合格時は空配列 `[]` |

`missing` 配列の要素形式:

- チェック1, 3, 5: exports サブパスキー形式（`"."`, `"./utils"`, `"./errors"` など）
- チェック2, 4: モジュールキー形式（`"@repo/shared"`, `"@repo/shared/extra"` など）
