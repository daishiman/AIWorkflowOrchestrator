# Phase 4: テスト仕様書

| 項目           | 値                                                 |
| -------------- | -------------------------------------------------- |
| タスクID       | UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001           |
| Phase          | 4 — テスト作成                                     |
| 作成日         | 2026-02-28                                         |
| Issue          | #854                                               |
| テスト総数     | 58                                                 |
| テスト種別     | ユニットテスト                                     |
| フレームワーク | Vitest                                             |
| テストファイル | `apps/desktop/scripts/coverage-by-handler.test.ts` |

---

## 1. 目的

`coverage-by-handler.ts` の5モジュール（HandlerDetector, CoverageParser, CoverageCalculator, Phase7Judge, ReportFormatter）およびCLI/統合機能に対するテストケースを設計し、58テストで全機能を網羅的に検証する。

---

## 2. テストケース仕様

### TC-001: HandlerDetector — AST解析テスト（7テスト）

| #   | テスト項目               | 期待結果                                                                 |
| --- | ------------------------ | ------------------------------------------------------------------------ |
| 1   | 単一ハンドラ検出         | `ipcMain.handle("test:channel", ...)` から1件の `HandlerInfo` を返す     |
| 2   | 複数ハンドラ検出         | 2つの `ipcMain.handle()` 呼び出しから2件を返す                           |
| 3   | IPC_CHANNELS形式変換     | `IPC_CHANNELS.SKILL_LIST` を `"skill:list"` に変換して返す               |
| 4   | 存在しないファイル       | `Error` をスローする                                                     |
| 5   | ハンドラなしファイル     | 空配列 `[]` を返す                                                       |
| 6   | 複数登録関数             | `registerSkillHandlers` + `registerDebugHandlers` 等の複数関数を横断検出 |
| 7   | 実ファイル23ハンドラ検出 | `src/main/ipc/skillHandlers.ts` から23件の `HandlerInfo` を検出          |

### TC-001b: convertConstantToChannelName（6テスト）

| #   | テスト項目                  | 入力                        | 期待結果                    |
| --- | --------------------------- | --------------------------- | --------------------------- |
| 1   | SKILL_LIST変換              | `"SKILL_LIST"`              | `"skill:list"`              |
| 2   | SKILL_GET_IMPORTED変換      | `"SKILL_GET_IMPORTED"`      | `"skill:getImported"`       |
| 3   | SKILL_SCHEDULE_ADD変換      | `"SKILL_SCHEDULE_ADD"`      | `"skill:schedule:add"`      |
| 4   | SKILL_DOCS_GENERATE変換     | `"SKILL_DOCS_GENERATE"`     | `"skill:docs:generate"`     |
| 5   | SKILL_OPTIMIZE_VARIANTS変換 | `"SKILL_OPTIMIZE_VARIANTS"` | `"skill:optimize:variants"` |
| 6   | SKILL_OPTIMIZE_EVALUATE変換 | `"SKILL_OPTIMIZE_EVALUATE"` | `"skill:optimize:evaluate"` |

**変換ルール**: `IPC_CHANNELS.XXX` の定数名を以下の手順でチャンネル名に変換する:

1. `SKILL_` プレフィックスを `skill:` に変換
2. 残りのアンダースコアをコロン `:` に変換
3. 全体を小文字化
4. 既知サブグループ（`SCHEDULE`, `DOCS`, `DEBUG`, `ANALYTICS`, `OPTIMIZE`）はコロン区切りでネスト

### TC-002: CoverageParser — Istanbul形式JSON解析（5テスト）

| #   | テスト項目       | 期待結果                                                     |
| --- | ---------------- | ------------------------------------------------------------ |
| 1   | 正常解析         | Istanbul JSON から `IstanbulFileCoverage` を正しくパースする |
| 2   | 部分一致検索     | ファイルパスの部分一致で対象ファイルのカバレッジを取得する   |
| 3   | 存在しないJSON   | `Error` をスローする                                         |
| 4   | 不正JSON         | `SyntaxError` をスローする                                   |
| 5   | 対象ファイルなし | `undefined` を返す                                           |

### TC-003: CoverageCalculator（7テスト）

| #   | テスト項目            | 期待結果                                                     |
| --- | --------------------- | ------------------------------------------------------------ |
| 1   | Line Coverage算出     | カバー済み行数 / 総行数 × 100 の正確な算出                   |
| 2   | Branch Coverage算出   | カバー済みブランチ / 総ブランチ × 100 の正確な算出           |
| 3   | Function Coverage算出 | 実行済み関数 / 総関数 × 100 の正確な算出                     |
| 4   | 行範囲外除外          | ハンドラの行範囲外のカバレッジデータを除外する               |
| 5   | 0%算出                | カバー済みが0の場合に0%を返す                                |
| 6   | 100%算出              | 全行カバー済みの場合に100%を返す                             |
| 7   | P41インライン関数検出 | インライン arrow function を独立関数としてカウントし注記する |

### TC-004: Phase7Judge（5テスト）

| #   | テスト項目     | 期待結果                                                  |
| --- | -------------- | --------------------------------------------------------- |
| 1   | Rule-1推奨達成 | Line≥90%, Branch≥70%, Function≥90% → `"PASS（推奨達成）"` |
| 2   | Rule-1最低達成 | Line≥80%, Branch≥60%, Function≥80% → `"PASS（最低達成）"` |
| 3   | Rule-1未達     | いずれかの指標が最低基準未満 → `"FAIL"`                   |
| 4   | Rule-3未テスト | テストケース0件 → `"FAIL"`                                |
| 5   | 複数指標未達   | Line, Branch両方未達 → 未達指標を全て列挙                 |

### TC-005: ReportFormatter Markdown（2テスト）

| #   | テスト項目            | 期待結果                                           |
| --- | --------------------- | -------------------------------------------------- | ------- | ---------- | --- | ---------------------- |
| 1   | テーブルフォーマット  | Markdownテーブル形式で全ハンドラのカバレッジを出力 |
| 2   | ヘッダ/セパレータ確認 | `                                                  | Handler | `ヘッダと` | --- | ` セパレータが含まれる |

### TC-006: ReportFormatter JSON（1テスト）

| #   | テスト項目   | 期待結果                                          |
| --- | ------------ | ------------------------------------------------- |
| 1   | 有効JSON出力 | `JSON.parse()` で解析可能な有効なJSON文字列を返す |

### TC-007: CLIオプション（10テスト）

| #   | テスト項目          | 入力                                                               | 期待結果                               |
| --- | ------------------- | ------------------------------------------------------------------ | -------------------------------------- |
| 1   | --file解析          | `["--file", "path/to/file.ts"]`                                    | `file: "path/to/file.ts"`              |
| 2   | --target解析        | `["--file", "x.ts", "--target", "skill:list"]`                     | `targets: ["skill:list"]`              |
| 3   | --target複数解析    | `["--file", "x.ts", "--target", "a", "--target", "b"]`             | `targets: ["a", "b"]`                  |
| 4   | --source解析        | `["--source", "path/to/file.ts"]`                                  | `file: "path/to/file.ts"`              |
| 5   | --coverage解析      | `["--file", "x.ts", "--coverage", "coverage/coverage-final.json"]` | `coveragePath` が設定される            |
| 6   | --format json解析   | `["--file", "x.ts", "--format", "json"]`                           | `format: "json"`                       |
| 7   | --format both解析   | `["--file", "x.ts", "--format", "both"]`                           | `format: "both"`                       |
| 8   | --file/--sourceなし | `["--target", "x"]`                                                | `null` を返す                          |
| 9   | 引数なし            | `[]`                                                               | `null` を返す                          |
| 10  | 不明format          | `["--file", "x.ts", "--format", "xml"]`                            | `format: "markdown"`（フォールバック） |

### TC-008: generateReport統合（3テスト）

| #   | テスト項目         | 期待結果                                         |
| --- | ------------------ | ------------------------------------------------ |
| 1   | レポート生成       | ハンドラ情報とカバレッジからCoverageReportを生成 |
| 2   | 空ハンドラ         | 空配列で空レポートを返す                         |
| 3   | カバー済みカウント | 基準達成ハンドラ数を正しくカウント               |

### TC-009: main()エラーケース（3テスト）

| #   | テスト項目         | 期待結果                                     |
| --- | ------------------ | -------------------------------------------- |
| 1   | 引数なし           | `process.exit(1)` が呼ばれる                 |
| 2   | 存在しないファイル | エラーメッセージを出力して `process.exit(1)` |
| 3   | 0件ハンドラ        | エラーメッセージを出力して `process.exit(1)` |

### TC-010: main()正常系（8テスト）

| #   | テスト項目          | 期待結果                                               |
| --- | ------------------- | ------------------------------------------------------ |
| 1   | markdown出力        | 全ハンドラのMarkdownレポートを `console.log` に出力    |
| 2   | json出力            | 全ハンドラのJSONレポートを `console.log` に出力        |
| 3   | target markdown     | 指定ハンドラの判定結果（Markdown）を出力               |
| 4   | target json         | 指定ハンドラの判定結果（JSON）を出力                   |
| 5   | --source/--coverage | `--source` と `--coverage` で実行可能                  |
| 6   | 複数target json     | `--target` 複数指定時に `results[]` + `summary` を出力 |
| 7   | 存在しないtarget    | エラーメッセージを出力して `process.exit(1)`           |
| 8   | カバレッジなし      | カバレッジ未取得時はエラー出力して `process.exit(1)`   |

---

## 3. テスト設計方針

### 3.1 テストヘルパー

テスト間の重複を排除するため、以下のヘルパー関数を定義:

- `createMockHandlerInfo()`: テスト用 `HandlerInfo` オブジェクトを生成
- `createMockIstanbulCoverage()`: テスト用 Istanbul カバレッジデータを生成
- `createTempFile()`: 一時ファイルを作成し、テスト後に自動削除

### 3.2 テスト分離

- 各テストは `beforeEach` で状態をリセット（P9準拠）
- ファイルシステム操作は一時ディレクトリを使用
- `console.log` / `process.exit` はモック化してテスト間干渉を防止

### 3.3 カバレッジ対象

テスト対象ファイル: `apps/desktop/scripts/coverage-by-handler.ts`

- Line Coverage: 推奨90%以上を目標
- Branch Coverage: 推奨70%以上を目標
- Function Coverage: 推奨90%以上を目標

---

## 4. 完了条件

- [x] 58テストケースが全て設計済み
- [x] TC-001〜TC-010の全テストケースに期待結果が明記されている
- [x] テスト間の独立性が確保されている（P9準拠）
- [x] P41（インライン関数カウント）対策テストが含まれている
- [x] P40（テスト実行ディレクトリ依存）を考慮した設計
