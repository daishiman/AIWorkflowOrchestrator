# 実装結果書 — IPCハンドラ単位カバレッジ測定基盤

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 5                                          |
| 成果物種別 | 実装結果書（implementation-result）        |
| タスクID   | UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001   |
| Issue      | #854                                       |
| 検証日     | 2026-02-28                                 |
| ステータス | 完了                                       |
| 依存成果物 | `outputs/phase-4/test-design.md`           |
| 後続成果物 | `outputs/phase-6/test-expansion-result.md` |

---

## 1. 実装概要

| 項目                  | 内容                                               |
| --------------------- | -------------------------------------------------- |
| 実装ファイル          | `apps/desktop/scripts/coverage-by-handler.ts`      |
| テストファイル        | `apps/desktop/scripts/coverage-by-handler.test.ts` |
| コード行数            | 約800行                                            |
| モジュール数          | 5モジュール + CLI + main関数                       |
| TypeScript interfaces | 12個                                               |
| TDDステップ           | Green（全58テストPASS達成）                        |

---

## 2. モジュール構成

### 2.1 アーキテクチャ概要

```
CLI引数パース → HandlerDetector → CoverageParser → CoverageCalculator → Phase7Judge → ReportFormatter
     ↓                ↓                  ↓                   ↓                 ↓              ↓
  parseCliArgs   extractHandlers   parseCoverageJson  calculateHandler   judgePhase7   formatMarkdown
                                                       Coverage                        Report
```

### 2.2 モジュール詳細

#### モジュール 1: HandlerDetector

| 項目     | 内容                                                                                                |
| -------- | --------------------------------------------------------------------------------------------------- |
| 関数名   | `extractHandlers`                                                                                   |
| 責務     | ts-morphを使用したAST解析で `ipcMain.handle()` の呼び出しを検出する                                 |
| 入力     | TypeScriptソースファイルパス                                                                        |
| 出力     | `HandlerInfo[]`（チャンネル名、開始行、終了行）                                                     |
| 特記事項 | IPC_CHANNELS定数名（例: `IPC_CHANNELS.SKILL_LIST`）を実チャンネル名（例: `"skill:list"`）に変換する |
| 対応要件 | FR-001                                                                                              |

#### モジュール 2: CoverageParser

| 項目     | 内容                                                                                    |
| -------- | --------------------------------------------------------------------------------------- |
| 関数名   | `parseCoverageJson`                                                                     |
| 責務     | Istanbul形式の `coverage-final.json` を解析し、対象ファイルのカバレッジデータを抽出する |
| 入力     | JSONファイルパス、対象ソースファイルパス                                                |
| 出力     | `IstanbulFileCoverage \| null`                                                          |
| 特記事項 | ファイルパスの正規化処理を含み、絶対パス・相対パスの両方に対応する                      |
| 対応要件 | FR-002                                                                                  |

#### モジュール 3: CoverageCalculator

| 項目     | 内容                                                                                               |
| -------- | -------------------------------------------------------------------------------------------------- |
| 関数名   | `calculateHandlerCoverage`                                                                         |
| 責務     | ハンドラ行範囲（startLine〜endLine）とカバレッジデータを突合し、各指標を算出する                   |
| 入力     | `HandlerInfo`、`IstanbulFileCoverage`                                                              |
| 出力     | `HandlerCoverage`                                                                                  |
| 算出指標 | Line Coverage、Branch Coverage、Function Coverage（各ハンドラ個別）                                |
| 特記事項 | 0/0ケース（ブランチ・関数が存在しない場合）は100%として扱う。P41（v8インライン関数カウント）を考慮 |
| 対応要件 | FR-003                                                                                             |

#### モジュール 4: Phase7Judge

| 項目     | 内容                                                                      |
| -------- | ------------------------------------------------------------------------- |
| 関数名   | `judgePhase7`                                                             |
| 責務     | ハンドラ単位のカバレッジ結果に対してPASS/FAIL判定を行う                   |
| 入力     | `HandlerCoverage`                                                         |
| 出力     | `Phase7Judgment`（対象ハンドラのPASS/FAILと判定理由）                     |
| 閾値     | Line Coverage 80%、Branch Coverage 60%、Function Coverage 80%（最低基準） |
| 特記事項 | `--target` 指定時は対象ハンドラのみを判定対象とする                       |
| 対応要件 | FR-006                                                                    |

#### モジュール 5: ReportFormatter

| 項目     | 内容                                                            |
| -------- | --------------------------------------------------------------- |
| 関数名   | `formatMarkdownReport`                                          |
| 責務     | カバレッジ結果と判定結果をMarkdown/JSON形式のレポートに整形する |
| 入力     | `CoverageReport`                                                |
| 出力     | Markdown文字列またはJSON文字列                                  |
| 特記事項 | Markdownレポートにはテーブル形式のカバレッジ一覧とP41注記を含む |
| 対応要件 | FR-004                                                          |

---

## 3. TypeScript インターフェース定義

主要な型定義は以下の12件。

| #   | インターフェース名         | 用途                                                             |
| --- | -------------------------- | ---------------------------------------------------------------- |
| 1   | `HandlerInfo`              | AST解析で検出したハンドラの情報（channelName/startLine/endLine） |
| 2   | `IstanbulLocation`         | statement/function/branch 共通の位置情報                         |
| 3   | `IstanbulStatementMap`     | statementMap のエントリ集合                                      |
| 4   | `IstanbulFunctionMapEntry` | fnMap の単一エントリ                                             |
| 5   | `IstanbulBranchMapEntry`   | branchMap の単一エントリ                                         |
| 6   | `IstanbulFileCoverage`     | Istanbul形式のファイル単位カバレッジ                             |
| 7   | `IstanbulCoverageJson`     | coverage JSON 全体                                               |
| 8   | `HandlerCoverage`          | ハンドラ単位の算出結果                                           |
| 9   | `Phase7Judgment`           | 単一ハンドラの判定結果                                           |
| 10  | `CoverageReport`           | 全体レポート構造                                                 |
| 11  | `CoverageByHandlerOptions` | CLI引数の解析結果                                                |
| 12  | `ReportOptions`            | レポート出力オプション                                           |

---

## 4. CLI インターフェース

### 4.1 オプション一覧

| オプション   | 必須/任意                 | 説明                                                          | 例                                            |
| ------------ | ------------------------- | ------------------------------------------------------------- | --------------------------------------------- |
| `--file`     | 必須（`--source` と排他） | 解析対象のTypeScriptファイルパス                              | `--file src/main/ipc/skillHandlers.ts`        |
| `--source`   | 任意                      | `--file` のエイリアス                                         | `--source src/main/ipc/skillHandlers.ts`      |
| `--coverage` | 任意                      | coverage JSON パス（省略時は `coverage/coverage-final.json`） | `--coverage coverage/coverage-final.json`     |
| `--target`   | 任意                      | Phase 7判定対象チャンネル（複数指定可）                       | `--target skill:remove --target skill:import` |
| `--format`   | 任意                      | 出力形式（markdown / json / both）                            | `--format both`                               |

### 4.2 使用例

```bash
# 基本的な使用方法（Markdown出力）
npx tsx scripts/coverage-by-handler.ts \
  --file src/main/ipc/skillHandlers.ts

# 特定ハンドラのみ判定（JSON出力）
npx tsx scripts/coverage-by-handler.ts \
  --file src/main/ipc/skillHandlers.ts \
  --target skill:remove \
  --format json

# --source / --coverage エイリアス指定
npx tsx scripts/coverage-by-handler.ts \
  --source src/main/ipc/skillHandlers.ts \
  --coverage coverage/coverage-final.json

# 複数ハンドラを判定対象に指定
npx tsx scripts/coverage-by-handler.ts \
  --file src/main/ipc/skillHandlers.ts \
  --target skill:remove \
  --target skill:import
```

### 4.3 終了コード

| 終了コード | 意味                                                                |
| ---------- | ------------------------------------------------------------------- |
| 0          | 正常終了（全体レポート出力、または `--target` 判定が全PASS）        |
| 1          | エラー終了（入力不正/対象未検出）または `--target` 判定にFAILを含む |

---

## 5. 実装上の技術的判断

### 5.1 ts-morphによるAST解析

`ipcMain.handle()` の検出には TypeScript Compiler API のラッパーである ts-morph を採用した。正規表現ベースの検出と比較して以下の利点がある:

- コメントや文字列リテラル内の誤検出を防止できる
- コールバック関数の正確な行範囲を取得できる
- IPC_CHANNELS定数の値解決が可能

### 5.2 IPC_CHANNELS定数解決

`IPC_CHANNELS.SKILL_LIST` のような定数参照を `"skill:list"` のような実チャンネル名に変換するため、以下のロジックを実装した:

1. AST上で `ipcMain.handle()` の第1引数ノードを取得する
2. 引数がPropertyAccessExpression（`IPC_CHANNELS.XXX`）の場合、プロパティ名を取得する
3. プロパティ名をケバブケース化（`SKILL_LIST` → `skill:list`）して実チャンネル名とする
4. 引数が文字列リテラルの場合、そのまま値を使用する

### 5.3 カバレッジデータのマッピング

Istanbul形式のカバレッジデータとハンドラ行範囲のマッピングは以下のロジックで行う:

1. `statementMap` の各エントリの行範囲がハンドラの行範囲（startLine〜endLine）に含まれるかを判定する
2. 含まれるステートメントの `s` カウンタ（実行回数）からLine Coverageを算出する
3. `branchMap` と `fnMap` についても同様に行範囲フィルタを適用する

### 5.4 0/0ケースの扱い

ブランチや関数が0件のハンドラ（分母が0）では、カバレッジを100%として扱う。「テストすべき対象が存在しない」ことはカバレッジ不足とは異なるため、この設計判断は妥当である。

---

## 6. テスト実行結果

| 項目       | 結果    |
| ---------- | ------- |
| テスト総数 | 58      |
| PASS       | 58      |
| FAIL       | 0       |
| SKIP       | 0       |
| 実行時間   | 約2.5秒 |

全58テストがPASSし、TDDのGreenステップが完了した。

---

## 7. 対応要件トレーサビリティ

| 要件ID  | 要件名                     | 実装箇所                            | テストカテゴリ   |
| ------- | -------------------------- | ----------------------------------- | ---------------- |
| FR-001  | ハンドラ境界検出           | HandlerDetector                     | TC-001           |
| FR-002  | v8カバレッジJSON解析       | CoverageParser                      | TC-002           |
| FR-003  | ハンドラ単位カバレッジ算出 | CoverageCalculator                  | TC-003           |
| FR-004  | レポート出力               | ReportFormatter                     | TC-005           |
| FR-005  | 修正対象ハンドラの指定     | parseCliArgs + Phase7Judge          | TC-006, TC-004   |
| FR-006  | 判定結果の自動出力         | Phase7Judge                         | TC-004           |
| FR-007  | 複数ファイル対応           | parseCliArgs（--file）              | TC-006           |
| NFR-001 | 実行速度                   | 全モジュール                        | TC-008           |
| NFR-002 | エラーハンドリング         | 全モジュール                        | TC-007           |
| NFR-003 | テストカバレッジ           | テストファイル全体                  | Phase 7で検証    |
| NFR-004 | P41対策                    | CoverageCalculator, ReportFormatter | TC-009           |
| NFR-005 | P40対策                    | パス解決ロジック全体                | TC-009           |
| NFR-006 | 型安全                     | 全ファイル                          | TypeCheckで検証  |
| NFR-007 | 依存関係の最小化           | package.json                        | ts-morphのみ追加 |
