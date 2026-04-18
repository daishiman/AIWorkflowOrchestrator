# Lessons Learned — SkillCreator tmpdir接続・多段フォールバック（TASK-SW-STRUCT-001/002）

> 関連タスク: TASK-SW-STRUCT-001 / TASK-SW-STRUCT-002
> 記録日: 2026-04-17
> 親ファイル: [lessons-learned-current-2026-04.md](lessons-learned-current-2026-04.md)

---

## TASK-SW-STRUCT-001: runCreateWorkflow出力仕様修正 教訓（2026-04-17）

### L-STRUCT-001-001: void → 変数代入に変えるだけで後続処理への接続が可能になる

| 項目       | 内容                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `void this.runCreateWorkflow(options)` と書かれていたため、`runCreateWorkflow` が `StructurePlanJson` を返しても後続で使えなかった |
| 原因       | `runCreateWorkflow` の戻り値が `Promise<void>` として破棄される形になっていた                                                   |
| 解決策     | `structurePlan = await this.runCreateWorkflow(options)` に変更し、`switch` 文外で `StructurePlanJson \| null` 型の変数を宣言する |
| 設計原則   | 非同期関数の戻り値を `void` で捨てる前に、後続処理の接続予定がないか必ず確認する                                                |
| 適用条件   | `create` モードの `runCreateWorkflow` 呼び出し部分                                                                              |
| 関連タスク | TASK-SW-STRUCT-001                                                                                                              |

### L-STRUCT-001-002: structurePlan を switch 外で宣言することで全モードで参照可能にする

| 項目       | 内容                                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `structurePlan` を `create` ブランチ内でのみ宣言すると、後続の SKILL.md 生成ロジック（switch 外）から参照できない                            |
| 解決策     | `let structurePlan: StructurePlanJson \| null = null` を `switch` 文の前に宣言し、各モードブランチで代入する設計にする                      |
| 設計原則   | 複数モードで共通して参照するデータは、モード分岐（switch/if）の外側で初期化してから各ブランチで代入する                                      |
| 適用条件   | `SkillCreatorService.createSkill()` 内の `mode` 分岐全般                                                                                    |
| 関連タスク | TASK-SW-STRUCT-001                                                                                                                          |

---

## TASK-SW-STRUCT-002: generateSkillMd接続・多段フォールバック 教訓（2026-04-17）

### L-STRUCT-002-001: SkillCreator tmpdir経由スクリプト接続パターン

| 項目       | 内容                                                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `generate_skill_md.js` へ大きな JSON オブジェクトをコマンドライン引数で渡すと文字数制限に抵触する可能性があった                                                    |
| 解決策     | `os.tmpdir()` 配下に `randomUUID()` 付きの一時 JSON ファイルを生成し、パスのみを `--plan` 引数に渡す。`finally` ブロックで `.catch(() => {})` 付きクリーンアップ実施 |
| 設計原則   | OS依存パス（`os.tmpdir()`）・UUID重複防止（`randomUUID()`）・non-fatal cleanup（`.catch(() => {})`）の3点を確保するのが tmpdir 経由接続の標準パターン             |
| 適用条件   | `generate_skill_md.js` を含む外部スクリプトに JSON データを渡す場合全般                                                                                           |
| 関連タスク | TASK-SW-STRUCT-002                                                                                                                                                |

### L-STRUCT-002-002: 多段フォールバックの検証コスト — 事前にシナリオ整理を行う

| 項目       | 内容                                                                                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | スクリプト失敗チェック（`!generateResult.success`）とファイル存在チェック（`fs.access` 失敗）を分離した多段フォールバックを実装したところ、テストが 242 行必要になった              |
| 原因       | フォールバック条件が「プロセス終了コード」と「出力ファイル存在」の2次元にわたるため、組み合わせケースが多くなった                                                                 |
| 解決策     | フォールバック条件を実装前に「シナリオ表（成功/プロセス失敗/ファイル未生成）」として整理してからテスト設計に入る                                                                  |
| 設計原則   | 多段フォールバックは実装前にシナリオ別の期待動作を一覧化する。テストカバレッジが想定を超えて膨らむ場合は、フォールバック構造自体が複雑すぎるサインとして設計を見直す               |
| 適用条件   | 外部スクリプト呼び出し後に出力ファイルの存在を確認するパターン全般                                                                                                               |
| 関連タスク | TASK-SW-STRUCT-002                                                                                                                                                                |

### L-STRUCT-002-003: planオブジェクト変換 — whitespace正規化は必須

| 項目       | 内容                                                                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 症状       | `purpose` フィールドに余分な改行・スペースが含まれると `generate_skill_md.js` の出力に不正な whitespace が混入した                                                        |
| 解決策     | `purpose` を `trigger.description` に埋め込む際に `trim()` + 連続スペース collapse（`replace(/\s+/g, ' ')`）を必ず適用する                                               |
| 設計原則   | `StructurePlanJson` → `generate_skill_md.js` 期待形式への変換では、文字列フィールドの whitespace 正規化を変換層の責務として必ず実装する。呼び出し元に依存しない         |
| 適用条件   | `StructurePlanJson.purpose` を `workflow.trigger.description` に変換するコード全般                                                                                       |
| 関連タスク | TASK-SW-STRUCT-002                                                                                                                                                        |

### L-STRUCT-002-004: structurePlan null時はwarnログで追跡可能にする

| 項目       | 内容                                                                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `create` モードで `structurePlan` が null になった理由を後からログで確認できなかった                                                      |
| 解決策     | `this.logger.warn("structurePlan is null, falling back to ensureSkillMdExists", ...)` を追加し、create モードの null フォールバックを記録する |
| 設計原則   | `create` モードで期待される生成物（`structurePlan`）が null になることは正常系ではないため warn レベルで記録する。silent fallback は回避する |
| 適用条件   | `create` モードの `structurePlan` null 判定全般。他モードは silent fallback を維持してよい                                               |
| 関連タスク | TASK-SW-STRUCT-002                                                                                                                        |
