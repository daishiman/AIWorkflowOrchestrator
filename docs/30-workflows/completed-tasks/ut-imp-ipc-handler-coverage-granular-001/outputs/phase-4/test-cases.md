# Phase 4: テストケーステーブル

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| タスクID   | UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001 |
| Phase      | 4 — テスト作成                           |
| 作成日     | 2026-02-28                               |
| Issue      | #854                                     |
| テスト総数 | 58                                       |

---

## テストケース一覧

| ID        | カテゴリ                     | テスト項目                  | 期待結果                                           |
| --------- | ---------------------------- | --------------------------- | -------------------------------------------------- |
| TC-001-1  | HandlerDetector              | 単一ハンドラ検出            | 1件の HandlerInfo を返す                           |
| TC-001-2  | HandlerDetector              | 複数ハンドラ検出            | 2件の HandlerInfo を返す                           |
| TC-001-3  | HandlerDetector              | IPC_CHANNELS形式変換        | `IPC_CHANNELS.SKILL_LIST` → `"skill:list"` に変換  |
| TC-001-4  | HandlerDetector              | 存在しないファイル          | Error をスロー                                     |
| TC-001-5  | HandlerDetector              | ハンドラなしファイル        | 空配列を返す                                       |
| TC-001-6  | HandlerDetector              | 複数登録関数                | 複数の登録関数を横断して全ハンドラを検出           |
| TC-001-7  | HandlerDetector              | 実ファイル23ハンドラ検出    | skillHandlers.ts から23件検出                      |
| TC-001b-1 | convertConstantToChannelName | SKILL_LIST変換              | `"skill:list"`                                     |
| TC-001b-2 | convertConstantToChannelName | SKILL_GET_IMPORTED変換      | `"skill:getImported"`                              |
| TC-001b-3 | convertConstantToChannelName | SKILL_SCHEDULE_ADD変換      | `"skill:schedule:add"`                             |
| TC-001b-4 | convertConstantToChannelName | SKILL_DOCS_GENERATE変換     | `"skill:docs:generate"`                            |
| TC-001b-5 | convertConstantToChannelName | SKILL_OPTIMIZE_VARIANTS変換 | `"skill:optimize:variants"`                        |
| TC-001b-6 | convertConstantToChannelName | SKILL_OPTIMIZE_EVALUATE変換 | `"skill:optimize:evaluate"`                        |
| TC-002-1  | CoverageParser               | 正常解析                    | Istanbul JSON を正しくパース                       |
| TC-002-2  | CoverageParser               | 部分一致検索                | パスの部分一致でカバレッジ取得                     |
| TC-002-3  | CoverageParser               | 存在しないJSON              | Error をスロー                                     |
| TC-002-4  | CoverageParser               | 不正JSON                    | SyntaxError をスロー                               |
| TC-002-5  | CoverageParser               | 対象ファイルなし            | undefined を返す                                   |
| TC-003-1  | CoverageCalculator           | Line Coverage算出           | カバー済み行 / 総行 × 100                          |
| TC-003-2  | CoverageCalculator           | Branch Coverage算出         | カバー済みブランチ / 総ブランチ × 100              |
| TC-003-3  | CoverageCalculator           | Function Coverage算出       | 実行済み関数 / 総関数 × 100                        |
| TC-003-4  | CoverageCalculator           | 行範囲外除外                | ハンドラ行範囲外のデータを除外                     |
| TC-003-5  | CoverageCalculator           | 0%算出                      | カバー済み0で0%を返す                              |
| TC-003-6  | CoverageCalculator           | 100%算出                    | 全行カバーで100%を返す                             |
| TC-003-7  | CoverageCalculator           | P41インライン関数検出       | インライン arrow function を独立関数としてカウント |
| TC-004-1  | Phase7Judge                  | Rule-1推奨達成              | `"PASS（推奨達成）"`                               |
| TC-004-2  | Phase7Judge                  | Rule-1最低達成              | `"PASS（最低達成）"`                               |
| TC-004-3  | Phase7Judge                  | Rule-1未達                  | `"FAIL"`                                           |
| TC-004-4  | Phase7Judge                  | Rule-3未テスト              | `"FAIL"`                                           |
| TC-004-5  | Phase7Judge                  | 複数指標未達                | 未達指標を全て列挙                                 |
| TC-005-1  | ReportFormatter Markdown     | テーブルフォーマット        | Markdown テーブル形式で出力                        |
| TC-005-2  | ReportFormatter Markdown     | ヘッダ/セパレータ確認       | `\| Handler \|` と `\|---\|` を含む                |
| TC-006-1  | ReportFormatter JSON         | 有効JSON出力                | JSON.parse() で解析可能                            |
| TC-007-1  | CLIオプション                | --file解析                  | `file: "path/to/file.ts"`                          |
| TC-007-2  | CLIオプション                | --target解析                | `targets: ["skill:list"]`                          |
| TC-007-3  | CLIオプション                | --target複数解析            | `targets: ["skill:list", "skill:remove"]`          |
| TC-007-4  | CLIオプション                | --source解析                | `file: "path/to/file.ts"`                          |
| TC-007-5  | CLIオプション                | --coverage解析              | `coveragePath` が設定される                        |
| TC-007-6  | CLIオプション                | --format both解析           | `format: "both"`                                   |
| TC-007-7  | CLIオプション                | --file/--sourceなし         | `null`                                             |
| TC-007-8  | CLIオプション                | 引数なし                    | `null`                                             |
| TC-007-9  | CLIオプション                | 不明format                  | `format: "markdown"`                               |
| TC-008-1  | generateReport統合           | レポート生成                | Markdown レポートを生成                            |
| TC-008-2  | generateReport統合           | 空ハンドラ                  | 空レポートを返す                                   |
| TC-008-3  | generateReport統合           | カバー済みカウント          | 基準達成ハンドラ数を正しくカウント                 |
| TC-009-1  | main()エラーケース           | 引数なし                    | process.exit(1)                                    |
| TC-009-2  | main()エラーケース           | 存在しないファイル          | エラーメッセージ + process.exit(1)                 |
| TC-009-3  | main()エラーケース           | 0件ハンドラ                 | 警告メッセージ + process.exit(1)                   |
| TC-010-1  | main()正常系                 | markdown出力                | Markdown レポートを console.log に出力             |
| TC-010-2  | main()正常系                 | json出力                    | JSON レポートを console.log に出力                 |
| TC-010-3  | main()正常系                 | target markdown             | 指定ハンドラの Markdown レポートを出力             |
| TC-010-4  | main()正常系                 | target json                 | 指定ハンドラの JSON レポートを出力                 |
| TC-010-5  | main()正常系                 | 存在しないtarget            | 警告メッセージを出力                               |
| TC-010-6  | main()正常系                 | --source/--coverage         | エイリアス指定で正常実行                           |
| TC-010-7  | main()正常系                 | 複数target json             | `results[]` + `summary` をJSON出力                 |
| TC-010-8  | main()正常系                 | カバレッジなし              | エラー出力して `process.exit(1)`                   |

---

## カテゴリ別集計

| カテゴリ                              | テスト数 |
| ------------------------------------- | -------- |
| TC-001: HandlerDetector               | 7        |
| TC-001b: convertConstantToChannelName | 6        |
| TC-002: CoverageParser                | 5        |
| TC-002b: getDefaultCoverageJsonPath   | 1        |
| TC-003: CoverageCalculator            | 7        |
| TC-004: Phase7Judge                   | 5        |
| TC-005: ReportFormatter Markdown      | 2        |
| TC-006: ReportFormatter JSON          | 1        |
| TC-007: CLIオプション                 | 10       |
| TC-008: generateReport統合            | 3        |
| TC-009: main()エラーケース            | 3        |
| TC-010: main()正常系                  | 8        |
| **合計**                              | **58**   |
