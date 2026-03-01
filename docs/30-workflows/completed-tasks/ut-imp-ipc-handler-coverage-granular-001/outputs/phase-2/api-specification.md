# API仕様書 — IPCハンドラ単位カバレッジ測定基盤

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| 文書種別   | API仕様書                                   |
| Phase      | 2（設計）                                   |
| タスクID   | UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001    |
| 作成日     | 2026-02-28                                  |
| 依存成果物 | Phase 1: 要件定義書、architecture-design.md |

---

## 1. コアデータモデル

### 1.1 HandlerInfo

`HandlerDetector` が AST 解析で検出したハンドラの境界情報。

```typescript
/** ハンドラの境界情報（AST解析結果） */
interface HandlerInfo {
  /** IPCチャンネル名（例: "skill:remove"） */
  channel: string;
  /** ハンドラコールバックの開始行（1-indexed） */
  startLine: number;
  /** ハンドラコールバックの終了行（1-indexed） */
  endLine: number;
  /** 登録関数名（例: "registerSkillHandlers"） */
  registrationGroup: string;
}
```

**制約条件:**

- `channel`: 空文字列は不可。`IPC_CHANNELS.*` 定数参照の場合は解決済みの文字列値を格納する
- `startLine`: 1以上の整数。ハンドラコールバック関数の開始行（`{` の行）
- `endLine`: `startLine` 以上の整数。ハンドラコールバック関数の終了行（`}` の行）
- `registrationGroup`: `registerSkillHandlers`、`registerSkillScheduleHandlers`、`registerSkillDocsHandlers` のいずれか

---

### 1.2 V8CoverageData

`CoverageParser` が v8 カバレッジ JSON を解析した結果。

```typescript
/** v8 カバレッジデータの解析結果 */
interface V8CoverageData {
  /** ファイルパス（正規化済み絶対パス） */
  filePath: string;
  /** 行ごとのヒットカウント（0-indexed配列、値は実行回数） */
  lineHits: number[];
  /** 関数カバレッジ情報 */
  functions: V8FunctionCoverage[];
  /** 分岐カバレッジ情報 */
  branches: V8BranchCoverage[];
}
```

**制約条件:**

- `filePath`: `path.normalize()` で正規化済みの絶対パス
- `lineHits`: インデックス `i` が行番号 `i+1`（1-indexed）に対応する。配列長はファイルの総行数
- `functions`: ファイル内の全関数カバレッジ情報（インライン arrow function を含む）
- `branches`: ファイル内の全分岐カバレッジ情報

---

### 1.3 V8FunctionCoverage

```typescript
/** v8 関数カバレッジ */
interface V8FunctionCoverage {
  /** 関数名（匿名の場合は空文字列） */
  functionName: string;
  /** 開始行（1-indexed） */
  startLine: number;
  /** 終了行（1-indexed） */
  endLine: number;
  /** 実行回数（0の場合は未実行） */
  count: number;
}
```

**P41注記:**
v8 はインライン arrow function（例: `getAllowedWindows: () => [mainWindow]`）を独立した関数としてカウントする。
`functionName` が空文字列の関数エントリが存在する場合、インライン関数の可能性がある。

---

### 1.4 V8BranchCoverage

```typescript
/** v8 分岐カバレッジ */
interface V8BranchCoverage {
  /** 分岐の開始行（1-indexed） */
  line: number;
  /** 分岐タイプ: "if" | "switch" | "ternary" | "logical" */
  type: string;
  /** 各分岐の実行回数（分岐の数だけ要素が存在する） */
  locations: { count: number }[];
}
```

**制約条件:**

- `locations` の要素数は分岐の分岐数に等しい（if 文の場合: then/else で2要素）
- `locations[i].count` が 0 の場合、その分岐は未実行

---

### 1.5 HandlerCoverage

`CoverageCalculator` がハンドラ境界とカバレッジデータを突合して算出した結果。

```typescript
/** ハンドラ単位のカバレッジ計算結果 */
interface HandlerCoverage {
  /** IPCチャンネル名 */
  channel: string;
  /** ハンドラコールバックの開始行 */
  startLine: number;
  /** ハンドラコールバックの終了行 */
  endLine: number;
  /** 登録関数名 */
  registrationGroup: string;
  /** 行カバレッジ */
  lines: CoverageMetric;
  /** 関数カバレッジ */
  functions: CoverageMetric;
  /** 分岐カバレッジ */
  branches: CoverageMetric;
}
```

---

### 1.6 CoverageMetric

```typescript
/** カバレッジ指標 */
interface CoverageMetric {
  /** 計測対象の総数 */
  total: number;
  /** カバー済み数（実行回数が1以上のもの） */
  covered: number;
  /** カバレッジ率（0〜100 の実数、小数点2桁まで） */
  pct: number;
}
```

**制約条件:**

- `pct` は `total === 0` の場合に `100` とする（ハンドラに計測対象がない場合は全カバー扱い）
- `pct` の計算式: `total === 0 ? 100 : Math.round((covered / total) * 10000) / 100`

---

### 1.7 JudgmentResult

`Phase7Judge` が Rule-1〜Rule-4 を適用した判定結果。

```typescript
/** Phase 7 判定結果 */
interface JudgmentResult {
  /** 総合判定: "PASS" | "FAIL" */
  verdict: "PASS" | "FAIL";
  /** 適用されたルールの詳細 */
  appliedRules: AppliedRule[];
  /** 修正対象ハンドラのカバレッジ（targetHandler が指定されなかった場合は null） */
  targetHandlerCoverage: HandlerCoverage | null;
  /** ファイル全体のカバレッジ（全ハンドラの集計値） */
  fileCoverage: {
    lines: CoverageMetric;
    functions: CoverageMetric;
    branches: CoverageMetric;
  };
  /** 未カバーハンドラ一覧（Rule-3 の未タスク化対象） */
  uncoveredHandlers: string[];
}
```

**総合判定の決定ロジック:**

- 全ての `appliedRules` が `"PASS"` または `"N/A"` の場合: `verdict = "PASS"`
- いずれかの `appliedRules` が `"FAIL"` の場合: `verdict = "FAIL"`

---

### 1.8 AppliedRule

```typescript
/** 適用されたルールの詳細 */
interface AppliedRule {
  /** ルールID: "Rule-1" | "Rule-2" | "Rule-3" | "Rule-4" */
  ruleId: "Rule-1" | "Rule-2" | "Rule-3" | "Rule-4";
  /** ルール名 */
  ruleName: string;
  /** 判定結果: "PASS" | "FAIL" | "N/A" */
  result: "PASS" | "FAIL" | "N/A";
  /** 判定理由（具体的な数値を含む） */
  reason: string;
}
```

**各ルールの `ruleName` と `result` の定義:**

| ruleId | ruleName                         | PASS 条件                                                      | FAIL 条件                                     | N/A 条件                   |
| ------ | -------------------------------- | -------------------------------------------------------------- | --------------------------------------------- | -------------------------- |
| Rule-1 | 修正対象ハンドラ基準充足         | 対象ハンドラの Lines/Functions/Branches が全て最低基準以上     | いずれかが最低基準未満                        | `targetHandler` が未指定   |
| Rule-2 | ファイル全体基準未達の許容       | ファイル全体が基準未達でも、未達原因が修正対象外ハンドラに限定 | 修正対象ハンドラ自体が基準未達                | ファイル全体が基準達成済み |
| Rule-3 | 未カバーハンドラの未タスク化     | 未カバーハンドラが0件                                          | 未カバーハンドラが1件以上かつ未タスク化が必要 | Rule-2 が N/A または FAIL  |
| Rule-4 | Branch Coverage ファイル全体基準 | ファイル全体の Branch Coverage が 60% 以上                     | ファイル全体の Branch Coverage が 60% 未満    | なし                       |

---

## 2. CLIインターフェース

### 2.1 CoverageByHandlerOptions

```typescript
/** スクリプト実行オプション */
interface CoverageByHandlerOptions {
  /** 対象の TypeScript ソースファイルパス（相対または絶対パス） */
  sourceFile: string;
  /** v8 カバレッジ JSON ファイルパス（相対または絶対パス） */
  coverageJsonPath: string;
  /** 修正対象ハンドラのチャンネル名（Phase 7 判定用、省略可） */
  targetHandler?: string;
  /** 出力フォーマット（デフォルト: "both"） */
  outputFormat?: "json" | "markdown" | "both";
  /** カバレッジ基準（省略時は quality-requirements.md の最低基準値を使用） */
  thresholds?: {
    /** 行カバレッジ閾値（0〜100、デフォルト: 80） */
    lines: number;
    /** 関数カバレッジ閾値（0〜100、デフォルト: 80） */
    functions: number;
    /** 分岐カバレッジ閾値（0〜100、デフォルト: 60） */
    branches: number;
  };
}
```

**CLI 引数との対応:**

```bash
pnpm tsx scripts/coverage-by-handler.ts \
  --source <sourceFile> \
  --coverage <coverageJsonPath> \
  [--target <targetHandler>] \
  [--format json|markdown|both] \
  [--threshold-lines <number>] \
  [--threshold-functions <number>] \
  [--threshold-branches <number>]
```

**使用例:**

```bash
# skill:remove ハンドラのカバレッジを計測して Phase 7 判定を実行する
pnpm tsx scripts/coverage-by-handler.ts \
  --source apps/desktop/src/main/ipc/skillHandlers.ts \
  --coverage apps/desktop/coverage/coverage-final.json \
  --target skill:remove \
  --format both
```

---

## 3. 公開関数インターフェース

### 3.1 calculateHandlerCoverage（メイン関数）

```typescript
/**
 * ハンドラ単位のカバレッジを計算する（メイン関数）
 *
 * CLI エントリポイントからも、テストからも呼び出し可能な純粋関数として設計する。
 * ファイル I/O は内部で実行するが、結果は戻り値で返す（副作用を stdout/stderr に限定する）。
 *
 * @param options - 実行オプション
 * @returns ハンドラカバレッジ一覧、判定結果、レポート文字列
 * @throws {Error} sourceFile が存在しない場合、coverageJsonPath が存在しない場合、
 *                 JSON フォーマットが不正な場合、ts-morph パースが失敗した場合
 */
export function calculateHandlerCoverage(
  options: CoverageByHandlerOptions,
): Promise<{
  /** 全ハンドラのカバレッジ一覧 */
  handlers: HandlerCoverage[];
  /** Phase 7 判定結果（targetHandler が未指定の場合は null） */
  judgment: JudgmentResult | null;
  /** 出力レポート文字列 */
  report: {
    /** JSON 形式のレポート文字列（outputFormat が "json" または "both" の場合） */
    json: string;
    /** Markdown 形式のレポート文字列（outputFormat が "markdown" または "both" の場合） */
    markdown: string;
  };
}>;
```

---

### 3.2 detectHandlers

```typescript
/**
 * TypeScript AST からハンドラ境界を検出する
 *
 * ts-morph を使用して対象ファイルを解析し、ipcMain.handle() の各コールを検出する。
 * IPC_CHANNELS.* 定数参照は解決済みの文字列値に変換する。
 *
 * @param sourceFilePath - 解析対象の TypeScript ファイルパス（絶対パスを推奨）
 * @returns 検出されたハンドラの境界情報の配列（検出順）
 * @throws {Error} ファイルが存在しない場合: "Source file not found: {path}"
 * @throws {Error} パースが失敗した場合: "Failed to parse TypeScript file: {path}: {error}"
 */
export function detectHandlers(sourceFilePath: string): HandlerInfo[];
```

---

### 3.3 parseCoverageJson

```typescript
/**
 * v8 カバレッジ JSON を解析して対象ファイルのカバレッジデータを取得する
 *
 * Vitest の coverage-final.json を読み込み、targetFilePath に対応するエントリを抽出する。
 * パス突合は P40 対策に基づく正規化・suffix match で行う。
 *
 * @param coverageJsonPath - v8 カバレッジ JSON ファイルのパス
 * @param targetFilePath - 抽出対象のファイルパス（絶対パスまたは相対パス）
 * @returns 対象ファイルのカバレッジデータ
 * @throws {Error} JSON ファイルが存在しない場合: "Coverage JSON not found: {path}. Run tests with --coverage first."
 * @throws {Error} フォーマットが不正な場合: "Invalid coverage JSON format: {details}"
 * @throws {Error} 対象ファイルのデータが存在しない場合: "No coverage data for file: {path}"
 */
export function parseCoverageJson(
  coverageJsonPath: string,
  targetFilePath: string,
): V8CoverageData;
```

---

### 3.4 computeHandlerCoverage

```typescript
/**
 * ハンドラ境界とカバレッジデータを突合してハンドラ単位カバレッジを算出する
 *
 * HandlerInfo の startLine〜endLine の範囲に含まれる行・関数・分岐のカバレッジを集計する。
 * P41 対策として、v8 のインライン関数カウントをそのまま使用する。
 *
 * @param handlers - detectHandlers で取得したハンドラ境界情報の配列
 * @param coverageData - parseCoverageJson で取得したカバレッジデータ
 * @returns 全ハンドラのカバレッジ計算結果の配列（handlers と同じ順序）
 */
export function computeHandlerCoverage(
  handlers: HandlerInfo[],
  coverageData: V8CoverageData,
): HandlerCoverage[];
```

---

### 3.5 judgePhase7

```typescript
/**
 * Phase 7 判定ルールを適用して判定結果を生成する
 *
 * Rule-1〜Rule-4 を適用し、修正対象ハンドラの PASS/FAIL 判定を行う。
 * Rule-3 により未カバーハンドラを uncoveredHandlers に列挙する。
 *
 * @param handlerCoverages - computeHandlerCoverage で取得した全ハンドラカバレッジ
 * @param targetHandler - 修正対象のハンドラチャンネル名（例: "skill:remove"）
 * @param thresholds - 判定に使用するカバレッジ閾値
 * @returns Phase 7 判定結果
 * @throws {Error} targetHandler が handlerCoverages に存在しない場合:
 *                 "Target handler not found: {channel}"（エラーではなく判定スキップとして処理）
 *
 * @remarks
 * targetHandler が見つからない場合は Error を throw せず、
 * targetHandlerCoverage を null とした JudgmentResult を返す。
 * Rule-1 は "N/A" として記録する。
 */
export function judgePhase7(
  handlerCoverages: HandlerCoverage[],
  targetHandler: string,
  thresholds: { lines: number; functions: number; branches: number },
): JudgmentResult;
```

---

## 4. Phase 7 判定ルール文書構造設計

### 4.1 `quality-requirements.md` への追記構造

以下の内容を `quality-requirements.md` の末尾に追記する:

````markdown
## Phase 7 ハンドラ単位カバレッジ判定ルール

### 適用条件

- 修正対象ファイルが複数の IPC ハンドラを含む場合に適用する
- 単一ハンドラのみのファイルでは従来のファイル全体基準を使用する

### 判定ルール

| ルールID | ルール名                         | 条件                                                                                       | 判定     |
| -------- | -------------------------------- | ------------------------------------------------------------------------------------------ | -------- |
| Rule-1   | 修正対象ハンドラ基準充足         | 修正対象ハンドラの Line/Function/Branch カバレッジが全て最低基準（80%/80%/60%）を満たす    | PASS     |
| Rule-2   | ファイル全体基準未達の許容       | ファイル全体のカバレッジが最低基準未達でも、未達の原因が修正対象外ハンドラに限定される場合 | PASS     |
| Rule-3   | 未カバーハンドラの未タスク化     | Rule-2 適用時、未カバーハンドラのテスト追加を Phase 12 で未タスクとして検出・登録する      | 必須対応 |
| Rule-4   | Branch Coverage ファイル全体基準 | ファイル全体の Branch Coverage が最低基準（60%）を満たす必要がある                         | 必須     |

### カバレッジ集計スクリプトの使用方法

対象ファイルに対して以下のコマンドを実行する:

```bash
# 1. カバレッジ付きでテストを実行する
pnpm --filter @repo/desktop exec vitest run src/main/ipc/skillHandlers.test.ts --coverage

# 2. ハンドラ単位カバレッジレポートを生成する
pnpm tsx apps/desktop/scripts/coverage-by-handler.ts \
  --source apps/desktop/src/main/ipc/skillHandlers.ts \
  --coverage apps/desktop/coverage/coverage-final.json \
  --target <チャンネル名> \
  --format both
```
````

### Phase 7 レポートテンプレート

（以下の section 4.2 を参照）

````

---

### 4.2 Phase 7 テンプレートへの追加セクション

Phase 7 の仕様書テンプレートに以下のセクションを追加する:

```markdown
### ハンドラ単位カバレッジレポート

#### 対象ファイル: `[ファイルパス]`

| ハンドラ (チャンネル)              | Lines | Functions | Branches | 判定 |
| ---------------------------------- | ----- | --------- | -------- | ---- |
| skill:list                         | XX%   | XX%       | XX%      | -    |
| skill:import                       | XX%   | XX%       | XX%      | -    |
| **skill:remove**（修正対象）       | XX%   | XX%       | XX%      | PASS |
| skill:get-docs                     | XX%   | XX%       | XX%      | -    |
| ... （他ハンドラ）                 | XX%   | XX%       | XX%      | -    |
| **ファイル全体**                   | XX%   | XX%       | XX%      | -    |

> [P41注記] v8 カバレッジプロバイダはインライン arrow function を独立した関数としてカウントします。
> Function カバレッジが予想より低い場合、validateIpcSender のコールバック等の未実行が原因の可能性があります。

#### Phase 7 判定結果

- **総合判定**: PASS / FAIL
- **適用ルール**:
  - Rule-1（修正対象ハンドラ基準充足）: PASS — Lines: XX%, Functions: XX%, Branches: XX%
  - Rule-2（ファイル全体基準未達の許容）: N/A または PASS — [理由]
  - Rule-3（未カバーハンドラの未タスク化）: PASS / 必須対応 — 未カバーハンドラ: [ハンドラ一覧]
  - Rule-4（Branch Coverage ファイル全体基準）: PASS — Branches: XX%
- **未カバーハンドラ**: [ハンドラ一覧]（→ Phase 12 未タスク化対象）
````

---

## 5. JSON レポート出力フォーマット

`ReportFormatter` が生成する JSON レポートの構造:

```typescript
// JSON レポートのルート構造
interface CoverageReport {
  /** レポート生成日時（ISO 8601 形式） */
  generatedAt: string;
  /** 解析対象ファイルパス */
  sourceFile: string;
  /** 全ハンドラのカバレッジ一覧 */
  handlers: HandlerCoverage[];
  /** ファイル全体のカバレッジ（全ハンドラの集計値） */
  fileCoverage: {
    lines: CoverageMetric;
    functions: CoverageMetric;
    branches: CoverageMetric;
  };
  /** Phase 7 判定結果（targetHandler が指定された場合のみ） */
  judgment?: JudgmentResult;
  /** P41 注記フラグ（インライン関数が検出された場合 true） */
  p41Warning: boolean;
}
```

---

## 6. Markdown レポート出力フォーマット

`ReportFormatter` が生成する Markdown レポートの構造:

```markdown
# ハンドラ単位カバレッジレポート

**対象ファイル**: `{sourceFile}`
**生成日時**: {generatedAt}

## ハンドラ別カバレッジ

| ハンドラ (チャンネル) | 登録グループ          | Lines (covered/total) | Functions (covered/total) | Branches (covered/total) |
| --------------------- | --------------------- | --------------------- | ------------------------- | ------------------------ |
| skill:list            | registerSkillHandlers | 95.00% (19/20)        | 100.00% (2/2)             | 75.00% (3/4)             |
| **skill:remove**      | registerSkillHandlers | 100.00% (15/15)       | 100.00% (3/3)             | 100.00% (4/4)            |
| ...                   | ...                   | ...                   | ...                       | ...                      |
| **ファイル全体**      | -                     | XX.XX% (X/X)          | XX.XX% (X/X)              | XX.XX% (X/X)             |

> [P41注記] v8 はインライン arrow function を独立した関数としてカウントします。

## Phase 7 判定結果

| ルール | 判定 | 理由                                                             |
| ------ | ---- | ---------------------------------------------------------------- |
| Rule-1 | PASS | 修正対象 skill:remove: Lines 100%, Functions 100%, Branches 100% |
| Rule-2 | N/A  | ファイル全体が基準達成済み                                       |
| Rule-3 | PASS | 未カバーハンドラ: 0件                                            |
| Rule-4 | PASS | Branches: XX% >= 60%                                             |

**総合判定: PASS**
```

---

## 7. 依存ライブラリ仕様

| ライブラリ  | バージョン制約                                  | 用途                  |
| ----------- | ----------------------------------------------- | --------------------- |
| `ts-morph`  | `^23.0.0`（デスクトップの既存バージョンに準拠） | TypeScript AST 解析   |
| `node:fs`   | Node.js 標準                                    | JSON ファイル読み込み |
| `node:path` | Node.js 標準                                    | パス正規化・結合      |

**追加依存なし**: ts-morph 以外の外部ライブラリは使用しない（NFR-007 準拠）。

---

## 8. 型定義の strict 準拠チェックリスト

- [ ] 全てのインターフェースが `interface` または `type` で定義されており、`any` 型を含まない
- [ ] 関数の引数・戻り値の型が全て明示されている
- [ ] オプショナル引数（`?`）の使用箇所が必要最小限に抑えられている
- [ ] ユニオン型（`"PASS" | "FAIL"` 等）が適切に定義されている
- [ ] `strict: true` 環境での TypeScript コンパイルが通ることを設計段階で確認している
