# 実装ガイド: IPCハンドラ単位カバレッジ測定基盤

## メタ情報

| 項目         | 値                                            |
| ------------ | --------------------------------------------- |
| タスクID     | UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001      |
| Phase        | 12（ドキュメント更新）                        |
| 作成日       | 2026-02-28                                    |
| Issue        | #854                                          |
| 対象ファイル | `apps/desktop/scripts/coverage-by-handler.ts` |

---

# Part 1: 初学者・中学生向け

## テストの成績表を科目ごとに分けるようなもの

### なぜハンドラ単位カバレッジが必要なのか

学校のテストで考えてみましょう。

あなたのクラスの「全科目の平均点」が50点だったとします。でも、あなたが今回一番頑張って勉強した「数学」の点数は何点だったのでしょうか？ 平均点だけを見ても、それは分かりません。もしかしたら数学は100点かもしれないし、30点かもしれません。

**ファイル全体のカバレッジ**は、この「全科目の平均点」に当たります。

私たちのアプリには `skillHandlers.ts` というファイルがあり、ここに23個の「IPCハンドラ」（後で説明します）が詰まっています。このファイル全体のテストカバレッジ（テストの網羅率）が30%と表示されたとしましょう。でも、今回修正したのはたった1つのハンドラ `skill:remove` だけです。

もし `skill:remove` のカバレッジが100%だったら、修正した部分はしっかりテストされていることになります。残りの22個のハンドラがまだテストされていないだけで、今回の修正自体の品質には問題ありません。

つまり、**「全科目の平均点」ではなく「修正した科目の点数」を見る仕組み**が必要だということです。これがハンドラ単位カバレッジの考え方です。

### 専門用語をやさしく説明

このガイドで登場する言葉を先に説明しておきます。

- **IPCハンドラ**: アプリの中で各機能を処理する「窓口」のことです。お店のレジのようなもので、「商品一覧を見せて」「このスキルを削除して」といったお客さん（画面）からの要望を受け付けて、結果を返します。私たちのアプリには23個のレジ（ハンドラ）があります。

- **カバレッジ**: テストがコードのどのくらいの部分を実際に確認したかの割合です。100%なら全部確認済み、0%なら全く確認していないということになります。テストの「網羅率」とも言います。

- **AST（抽象構文木）**: プログラムの構造を木のように表したものです。文章を「主語→述語→目的語」のように分解するのと似ています。この仕組みを使って、TypeScriptのファイルから23個のハンドラを自動的に見つけ出します。

- **Istanbul形式**: テスト結果を記録するための共通フォーマット（ひな形）です。成績表のテンプレートのようなもので、「どの行が実行されたか」「どの分岐が通ったか」「どの関数が呼ばれたか」を一定の書き方で記録します。

### ツールの仕組み

このツールは3つのステップで「科目ごとの点数」を出します。

**ステップ1: 教科書（TypeScriptファイル）のページを読み取る**

まず、TypeScriptのファイルを「教科書」に見立てます。ツールは `ts-morph` という道具を使って、「93ページから118ページが数学の範囲」「121ページから138ページが英語の範囲」というように、各ハンドラが何行目から何行目にあるかを自動で読み取ります。

**ステップ2: テスト結果の答案用紙（カバレッジデータ）を取得する**

次に、テストを実行した結果が記録された「答案用紙」（coverage-final.json）を読み込みます。この答案用紙には「10行目は3回実行された」「15行目は0回（実行されていない）」というデータが詰まっています。

**ステップ3: 科目ごとの点数を計算する**

最後に、ステップ1で特定したページ範囲とステップ2の答案用紙を重ね合わせます。「数学の範囲（93〜118行目）の中で、テストされた行は何行？」というように、科目ごとの点数（カバレッジ率）を計算します。

### 使い方

ターミナル（コマンドを打つ黒い画面）で以下のコマンドを実行します。

```bash
npx tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts
```

すると、以下のような表が出力されます。

```
| #  | チャンネル名    | 行範囲   | Line% | Branch% | Func% | 判定 |
| -- | -------------- | -------- | ----: | ------: | ----: | ---- |
|  4 | skill:import   | 166-203  | 100.0 |   100.0 | 100.0 | PASS |
|  5 | skill:remove   | 206-224  | 100.0 |   100.0 | 100.0 | PASS |
| 15 | skill:analytics:get | 509-539 | 0.0 |     0.0 |   0.0 | FAIL |
```

**各列の意味:**

| 列名         | 意味                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| #            | ハンドラの番号（1から順番）                                            |
| チャンネル名 | ハンドラの名前（どの窓口か）                                           |
| 行範囲       | そのハンドラがファイルの何行目から何行目にあるか                       |
| Line%        | 行カバレッジ：コードの行のうち何%がテストで実行されたか                |
| Branch%      | 分岐カバレッジ：if文のtrue/falseの両方がテストされたかの割合           |
| Func%        | 関数カバレッジ：関数のうち何%がテストで呼び出されたか                  |
| 判定         | PASS＝合格（基準を満たしている）、FAIL＝不合格（基準を満たしていない） |

合格基準は「Line 80%以上、Branch 60%以上、Function 80%以上」です。3つ全てを満たすとPASSになります。

---

# Part 2: 開発者・技術者向け

## 1. v8カバレッジJSONフォーマット解説

Vitest が `--coverage` オプション付きで実行されると、v8カバレッジプロバイダが `coverage/coverage-final.json` を出力します。このファイルはIstanbul形式で構造化されています。

### Istanbul形式の構造

```json
{
  "/absolute/path/to/skillHandlers.ts": {
    "path": "/absolute/path/to/skillHandlers.ts",
    "statementMap": {
      "0": {
        "start": { "line": 10, "column": 4 },
        "end": { "line": 10, "column": 30 }
      },
      "1": {
        "start": { "line": 12, "column": 4 },
        "end": { "line": 12, "column": 45 }
      }
    },
    "s": {
      "0": 3,
      "1": 0
    },
    "branchMap": {
      "0": {
        "type": "if",
        "line": 15,
        "loc": {
          "start": { "line": 15, "column": 4 },
          "end": { "line": 20, "column": 5 }
        },
        "locations": [
          {
            "start": { "line": 15, "column": 4 },
            "end": { "line": 17, "column": 5 }
          },
          {
            "start": { "line": 18, "column": 4 },
            "end": { "line": 20, "column": 5 }
          }
        ]
      }
    },
    "b": {
      "0": [3, 0]
    },
    "fnMap": {
      "0": {
        "name": "handleSkillRemove",
        "decl": {
          "start": { "line": 206, "column": 0 },
          "end": { "line": 206, "column": 30 }
        },
        "loc": {
          "start": { "line": 206, "column": 0 },
          "end": { "line": 224, "column": 1 }
        },
        "line": 206
      }
    },
    "f": {
      "0": 5
    }
  }
}
```

### 各フィールドの意味

| フィールド     | 型                                            | 説明                                                     |
| -------------- | --------------------------------------------- | -------------------------------------------------------- |
| `statementMap` | `{ [key: string]: IstanbulLocation }`         | 各ステートメントの開始行/列と終了行/列のマップ           |
| `s`            | `{ [key: string]: number }`                   | 各ステートメントの実行回数（`statementMap`のキーと対応） |
| `branchMap`    | `{ [key: string]: IstanbulBranchMapEntry }`   | 各分岐（if/switch/三項演算子）の位置情報と分岐先一覧     |
| `b`            | `{ [key: string]: number[] }`                 | 各分岐の各方向の実行回数（配列の長さ＝分岐先数）         |
| `fnMap`        | `{ [key: string]: IstanbulFunctionMapEntry }` | 各関数の名前、宣言位置、本体位置、行番号                 |
| `f`            | `{ [key: string]: number }`                   | 各関数の実行回数（`fnMap`のキーと対応）                  |

### パスキーの仕様

`coverage-final.json` のトップレベルキーはファイルの**絶対パス**です。例:

```
"/Users/dm/dev/dev/.../apps/desktop/src/main/ipc/skillHandlers.ts"
```

スクリプトではまず絶対パスの完全一致で検索し、見つからない場合は相対パスの末尾一致で検索するフォールバック処理を実装しています。

## 2. TypeScript AST解析（ts-morph）

### ipcMain.handle() CallExpression の検出

`extractHandlers()` 関数は、ts-morph を使って TypeScript ファイルの AST を走査し、以下のパターンを検出します。

```typescript
ipcMain.handle(IPC_CHANNELS.SKILL_REMOVE, async (event, skillName: string) => {
  // ハンドラ本体
});
```

**検出アルゴリズム:**

1. `Project` を `skipAddingFilesFromTsConfig: true` で初期化する（スタンドアロン解析、P40対策）
2. ソースファイル内の全ノードを `forEachDescendant` で走査する
3. `CallExpression` ノードかどうかを `Node.isCallExpression()` で判定する
4. 呼び出し先が `PropertyAccessExpression` であり、プロパティ名が `handle`、オブジェクト名が `ipcMain` であるかを確認する
5. 第1引数からチャンネル名を抽出する
6. 呼び出し全体の `getStartLineNumber()` / `getEndLineNumber()` で行範囲を取得する
7. 親関数名を `findParentFunctionName()` で特定する

### 定数名からチャンネル名への変換ロジック

第1引数が `IPC_CHANNELS.SKILL_REMOVE` のような定数参照の場合、`convertConstantToChannelName()` 関数で変換します。

```typescript
export function convertConstantToChannelName(constName: string): string {
  const lower = constName.toLowerCase();

  // プレフィックスに応じたマッピング
  // SKILL_DOCS_GENERATE   → skill:docs:generate
  // SKILL_SCHEDULE_ADD     → skill:schedule:add
  // SKILL_OPTIMIZE_VARIANTS → skill:optimize:variants
  // SKILL_LIST             → skill:list
  // SKILL_GET_IMPORTED     → skill:getImported
}
```

**変換ルール:**

| 定数プレフィックス | 変換結果のプレフィックス | 例                                                    |
| ------------------ | ------------------------ | ----------------------------------------------------- |
| `SKILL_DOCS_`      | `skill:docs:`            | `SKILL_DOCS_GENERATE` → `skill:docs:generate`         |
| `SKILL_SCHEDULE_`  | `skill:schedule:`        | `SKILL_SCHEDULE_ADD` → `skill:schedule:add`           |
| `SKILL_OPTIMIZE_`  | `skill:optimize:`        | `SKILL_OPTIMIZE_VARIANTS` → `skill:optimize:variants` |
| `SKILL_`（汎用）   | `skill:`                 | `SKILL_LIST` → `skill:list`                           |

アンダースコア `_` はハイフン `-` に変換されます（`SKILL_GET_IMPORTED` → `skill:getImported`）。

### ハンドラ行範囲の抽出

```typescript
interface HandlerInfo {
  channelName: string; // "skill:remove"
  startLine: number; // 206（1-indexed）
  endLine: number; // 224（1-indexed）
  registrationFunction: string; // "registerSkillHandlers"
}
```

行番号は1-indexedで記録されます。これはIstanbul形式の位置情報と一致しています。`registrationFunction` は、ハンドラが所属する登録関数名（`registerSkillHandlers`、`registerSkillScheduleHandlers`、`registerSkillDocsHandlers`）です。

## 3. 5モジュール構成のAPI仕様

スクリプトは単一ファイル `coverage-by-handler.ts` 内に5つの論理モジュールを配置しています。

### Module 1: HandlerDetector

TypeScript AST解析によるipcMain.handle()呼び出しの検出を担当します。

```typescript
/**
 * TypeScriptファイルからipcMain.handle()呼び出しを検出し、
 * チャンネル名と行範囲を抽出する。
 *
 * @param filePath - 解析対象のTypeScriptファイルパス
 * @returns HandlerInfo[] - 検出されたハンドラの配列
 * @throws Error - ファイルが存在しない場合
 */
export function extractHandlers(filePath: string): HandlerInfo[];

/**
 * IPC_CHANNELS定数名をIPCチャンネル名に変換する。
 *
 * @param constName - 定数名（例: "SKILL_LIST"）
 * @returns string - チャンネル名（例: "skill:list"）
 */
export function convertConstantToChannelName(constName: string): string;
```

### Module 2: CoverageParser

Istanbul形式のカバレッジJSONファイルを読み込み、指定ファイルのカバレッジデータを抽出します。

```typescript
/**
 * Istanbul形式カバレッジJSONを解析し、指定ファイルのデータを返す。
 *
 * @param coverageJsonPath - coverage-final.jsonのパス
 * @param targetFilePath - カバレッジデータを抽出するファイルパス
 * @returns IstanbulFileCoverage | null - 見つからない場合はnull
 * @throws Error - JSONファイルが存在しない/パース失敗の場合
 */
export function parseCoverageJson(
  coverageJsonPath: string,
  targetFilePath: string,
): IstanbulFileCoverage | null;

/**
 * デフォルトのcoverage-final.jsonパスを返す。
 * @returns string - "coverage/coverage-final.json"の絶対パス
 */
export function getDefaultCoverageJsonPath(): string;
```

### Module 3: CoverageCalculator

ハンドラの行範囲内のステートメント/関数/ブランチのカバレッジを算出します。

```typescript
/**
 * 単一ハンドラのカバレッジを算出する。
 *
 * @param handler - ハンドラ情報（チャンネル名、行範囲）
 * @param coverage - Istanbul形式のカバレッジデータ
 * @returns HandlerCoverage - 算出結果（Line/Branch/Function%、インライン関数一覧）
 */
export function calculateHandlerCoverage(
  handler: HandlerInfo,
  coverage: IstanbulFileCoverage,
): HandlerCoverage;
```

算出ロジックの詳細:

- **Line Coverage**: `statementMap` の各エントリのうち、`start.line >= startLine` かつ `end.line <= endLine` のものを抽出し、`s` の値が0より大きいものをカバー済みとしてカウントする
- **Branch Coverage**: `branchMap` の各エントリのうち、`line >= startLine` かつ `line <= endLine` のものを抽出し、`b` 配列の各要素が0より大きいものをカバー済みとしてカウントする
- **Function Coverage**: `fnMap` の各エントリのうち、`line >= startLine` かつ `line <= endLine` のものを抽出し、`f` の値が0より大きいものをカバー済みとしてカウントする。名前が `(anonymous)` / 空文字列 / `=>` を含む場合はインライン関数として `inlineFunctions` 配列に記録する（P41対策）

### Module 4: Phase7Judge

Phase 7判定ルール（Rule-1〜Rule-4）を適用し、PASS/FAIL判定を返します。

```typescript
/**
 * Phase 7判定ルールを適用する。
 *
 * @param handlerCoverage - ハンドラ単位カバレッジ結果
 * @returns Phase7Judgment - { isPassed, rule, reason }
 */
export function judgePhase7(handlerCoverage: HandlerCoverage): Phase7Judgment;
```

### Module 5: ReportFormatter

カバレッジレポートをMarkdownまたはJSON形式にフォーマットします。

```typescript
/**
 * カバレッジレポートをMarkdown形式で出力する。
 *
 * @param report - CoverageReport（handlers配列、summary、p41Note）
 * @returns string - Markdownテーブル形式の文字列
 */
export function formatMarkdownReport(report: CoverageReport): string;

/**
 * カバレッジレポートをJSON形式で出力する。
 *
 * @param report - CoverageReport
 * @returns string - JSON文字列（インデント付き）
 */
export function formatJsonReport(report: CoverageReport): string;

/**
 * レポート全体を生成する（calculateHandlerCoverageの集約）。
 *
 * @param handlers - ハンドラ情報の配列
 * @param coverage - Istanbul形式カバレッジデータ
 * @param filePath - 解析対象ファイルパス
 * @returns CoverageReport - 全ハンドラのカバレッジとサマリー
 */
export function generateReport(
  handlers: HandlerInfo[],
  coverage: IstanbulFileCoverage,
  filePath: string,
): CoverageReport;
```

## 4. Phase 7判定ルール

### ルール一覧

| ルールID | ルール名                     | 条件                                                                         | 判定     |
| -------- | ---------------------------- | ---------------------------------------------------------------------------- | -------- |
| Rule-1   | 修正対象ハンドラ基準充足     | Line >= 80%, Branch >= 60%, Function >= 80% の全てを満たす                   | PASS     |
| Rule-2   | ファイル全体基準未達の許容   | ファイル全体が最低基準未達でも、未達原因が修正対象外ハンドラに限定される場合 | PASS     |
| Rule-3   | 未カバーハンドラの未タスク化 | Rule-2適用時、Line/Branch/Function全て0%のハンドラは未タスクとして記録が必要 | 必須対応 |
| Rule-4   | Branch Coverage全体基準      | ファイル全体のBranch Coverageが最低基準（60%）を満たす                       | 必須     |

### 閾値定数

```typescript
const COVERAGE_THRESHOLDS = {
  line: { minimum: 80, recommended: 90 },
  branch: { minimum: 60, recommended: 70 },
  function: { minimum: 80, recommended: 90 },
};
```

### 判定フロー

```
ハンドラカバレッジを入力
  ↓
Line >= 80% AND Branch >= 60% AND Function >= 80% ?
  ├─ YES → 推奨基準も満たす? → "Rule-1 (推奨達成)" / "Rule-1 (最低達成)" → PASS
  ↓
  NO
  ↓
Line == 0% AND Branch == 0% AND Function == 0% ?
  ├─ YES → "Rule-3" → FAIL（テスト未作成、未タスク化が必要）
  ↓
  NO
  ↓
未達指標を列挙 → "Rule-1 (未達)" → FAIL
```

### P41注記（v8インラインarrow functionカウント問題）

v8カバレッジプロバイダは、以下のようなインラインarrow functionを独立した関数としてカウントします。

```typescript
validateIpcSender(event, {
  getAllowedWindows: () => [mainWindow], // ← v8がこれを独立関数としてカウント
});
```

この影響により、テストで `validateIpcSender` のコールバックが実行されない場合、Function Coverageが実態よりも低く表示されます。`skill:list` ハンドラのように Line% が92.3%と高いにもかかわらず Func% が0.0%になるのは、この影響によるものです。

スクリプトではインライン関数を `inlineFunctions` 配列に記録し、レポートにP41注記を自動付与します。

## 5. CLI使用方法

### 基本コマンド

```bash
# apps/desktop ディレクトリから実行
cd apps/desktop

# 全ハンドラのカバレッジレポート（Markdownテーブル）
npx tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts

# 特定ハンドラの判定結果
npx tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts --target skill:remove

# JSON形式で出力
npx tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts --format json

# --source / --coverage 指定
npx tsx scripts/coverage-by-handler.ts --source src/main/ipc/skillHandlers.ts --coverage coverage/coverage-final.json

# Markdown + JSON を同時出力
npx tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts --format both
```

### オプション一覧

| オプション           | 必須 | デフォルト | 説明                                   |
| -------------------- | ---- | ---------- | -------------------------------------- |
| `--file <path>`      | 必須 | なし       | 解析対象のTypeScriptファイルパス       |
| `--source <path>`    | 任意 | なし       | `--file` のエイリアス                  |
| `--coverage <path>`  | 任意 | なし       | coverage JSON パス（省略時は自動探索） |
| `--target <handler>` | 任意 | なし       | 特定ハンドラのみ判定（複数指定可）     |
| `--format <type>`    | 任意 | `markdown` | 出力形式: `markdown` / `json` / `both` |

### 終了コード

| コード | 意味                                                                                 |
| ------ | ------------------------------------------------------------------------------------ |
| 0      | 正常終了（全体レポート出力、または `--target` 判定が全PASS）                         |
| 1      | エラー（引数不正/ファイル未存在/カバレッジ未取得）または `--target` 判定にFAILを含む |

### 前提条件

カバレッジデータが必要です。事前にテストをカバレッジ付きで実行してください。

```bash
cd apps/desktop
pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts --coverage
```

これにより `coverage/coverage-final.json` が生成されます。

### --target 指定時の出力例

```
## skill:remove の判定結果

- 判定: PASS
- ルール: Rule-1 (推奨達成)
- 理由: Line: 100.0%, Branch: 100.0%, Function: 100.0%

| 指標     |     値 | 最低基準 | 推奨基準 |
| -------- | -----: | -------: | -------: |
| Line     | 100.0% |      80% |      90% |
| Branch   | 100.0% |      60% |      70% |
| Function | 100.0% |      80% |      90% |
```

## 6. エッジケース

### P41: validateIpcSender の getAllowedWindows がFunction Coverageに影響する

**問題**: `skillHandlers.ts` の各ハンドラ内で `validateIpcSender` を呼び出す際、オプションオブジェクト内の `getAllowedWindows: () => [mainWindow]` がv8に独立関数としてカウントされます。テスト内でこのコールバックが明示的に実行されないと、Function Coverageが著しく低下します（44.44%まで低下した事例があります: P41参照）。

**対策**: スクリプトはハンドラ内のインライン関数を `inlineFunctions` 配列に記録し、レポートにP41注記を自動付与します。テスト側で `mockValidateIpcSender.mock.calls[i][2].getAllowedWindows()` を明示的に呼び出すことで、カバレッジを改善できます。

### ハンドラなしファイルの場合

`extractHandlers()` が空の配列を返した場合、CLIはエラーメッセージを出力して終了コード1で終了します。

```
エラー: src/some/file.ts からハンドラが検出されませんでした
```

### カバレッジJSONが存在しない場合

`parseCoverageJson()` がファイル未存在を検出した場合、対処法付きのエラーメッセージを投げます。

```
カバレッジデータが見つかりません: coverage/coverage-final.json
先にテストをカバレッジ付きで実行してください:
  cd apps/desktop && pnpm vitest run <test-file> --coverage --coverage.include='scripts/coverage-by-handler.ts'
```

### カバレッジJSONに対象ファイルが含まれない場合

テストが対象ファイルのコードを一切実行していない場合、`parseCoverageJson()` は `null` を返します。CLIは以下のメッセージを出力して終了します。

```
エラー: src/main/ipc/skillHandlers.ts のカバレッジデータが見つかりません。
先にテストをカバレッジ付きで実行してください:
  cd apps/desktop && pnpm vitest run <test-file> --coverage --coverage.include='scripts/coverage-by-handler.ts'
```

### カバレッジJSON解析失敗の場合

JSON構文エラーが発生した場合、以下のエラーを投げます。

```
カバレッジJSONの解析に失敗しました: coverage/coverage-final.json
```

### 文字列リテラルとIPC_CHANNELS定数の混在

`resolveChannelName()` は以下の2パターンを処理します。

1. **文字列リテラル**: `ipcMain.handle("skill:list", ...)` → そのまま `"skill:list"` を返す
2. **IPC_CHANNELS定数**: `ipcMain.handle(IPC_CHANNELS.SKILL_LIST, ...)` → `convertConstantToChannelName("SKILL_LIST")` で変換

どちらのパターンもサポートしており、ファイル内で混在していても正しく検出します。いずれにも該当しない場合は `null` を返し、そのハンドラはスキップされます。
