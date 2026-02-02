# Phase 4: テストケース一覧

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| タスクID | TASK-8C-C                          |
| 機能名   | E2Eテスト - インポート・実行フロー |
| 作成日   | 2026-02-02                         |

## テストケース一覧

| TC   | テストケース名                                  | フロー         | 状態   |
| ---- | ----------------------------------------------- | -------------- | ------ |
| TC-1 | should open import dialog for unimported skill  | Import Flow    | 実装済 |
| TC-2 | should display skill details in import dialog   | Import Flow    | 実装済 |
| TC-3 | should import skill and add to imported list    | Import Flow    | 実装済 |
| TC-4 | should show streaming view when executing       | Execution Flow | 実装済 |
| TC-5 | should display abort button while executing     | Execution Flow | 実装済 |
| TC-6 | should abort execution when stop button clicked | Execution Flow | 実装済 |
| TC-7 | should rescan skills when rescan button clicked | Rescan Flow    | 実装済 |

## TC-1: インポートダイアログ表示

| 項目           | 内容                                                 |
| -------------- | ---------------------------------------------------- |
| テストケース名 | should open import dialog for unimported skill       |
| 目的           | 未インポートスキル選択時にダイアログが表示される     |
| 前提条件       | アプリが起動している                                 |
| 操作手順       | 1. スキル選択ボタンをクリック<br>2. test-skillを選択 |
| 期待結果       | 「スキルをインポート」ダイアログが表示               |
| アサーション   | `expect(dialog).toBeVisible()`                       |

## TC-2: スキル詳細表示

| 項目           | 内容                                            |
| -------------- | ----------------------------------------------- |
| テストケース名 | should display skill details in import dialog   |
| 目的           | インポートダイアログ内で詳細情報が表示される    |
| 前提条件       | インポートダイアログが表示されている            |
| 操作手順       | TC-1の操作を実行                                |
| 期待結果       | 許可ツール、サブエージェントが表示              |
| アサーション   | `toBeVisible()`（許可ツール、サブエージェント） |

## TC-3: インポート実行

| 項目           | 内容                                                         |
| -------------- | ------------------------------------------------------------ |
| テストケース名 | should import skill and add to imported list                 |
| 目的           | インポート完了後、インポート済みに追加される                 |
| 前提条件       | インポートダイアログが表示されている                         |
| 操作手順       | 1. インポートボタンをクリック<br>2. スキル選択UIを再度開く   |
| 期待結果       | ダイアログが閉じ、インポート済みセクションに追加             |
| アサーション   | `waitForSelector(..., { state: "hidden" })`, `toBeVisible()` |

## TC-4: ストリーミング表示

| 項目           | 内容                                                 |
| -------------- | ---------------------------------------------------- |
| テストケース名 | should show streaming view when executing            |
| 目的           | スキル実行中にストリーミングビューが表示される       |
| 前提条件       | test-skillがインポート済み                           |
| 操作手順       | 1. スキルを選択<br>2. プロンプト入力<br>3. Enter押下 |
| 期待結果       | skill-streaming-viewが表示                           |
| アサーション   | `expect(streamingView).toBeVisible()`                |

## TC-5: 停止ボタン表示

| 項目           | 内容                                        |
| -------------- | ------------------------------------------- |
| テストケース名 | should display abort button while executing |
| 目的           | 実行中に停止ボタンが表示される              |
| 前提条件       | スキルが実行中                              |
| 操作手順       | TC-4と同様                                  |
| 期待結果       | abort-buttonが表示                          |
| アサーション   | `expect(abortButton).toBeVisible()`         |

## TC-6: 実行中止

| 項目           | 内容                                                      |
| -------------- | --------------------------------------------------------- |
| テストケース名 | should abort execution when stop button clicked           |
| 目的           | 停止ボタン押下で実行がキャンセルされる                    |
| 前提条件       | スキルが実行中                                            |
| 操作手順       | 1. TC-4の操作<br>2. 停止ボタンをクリック                  |
| 期待結果       | キャンセルステータスが表示                                |
| アサーション   | `expect(page.locator('text="キャンセル"')).toBeVisible()` |

## TC-7: 再スキャン実行

| 項目           | 内容                                                         |
| -------------- | ------------------------------------------------------------ |
| テストケース名 | should rescan skills when rescan button clicked              |
| 目的           | 再スキャンでスキル一覧が更新される                           |
| 前提条件       | スキル選択UIが表示されている                                 |
| 操作手順       | 1. スキル選択UIを開く<br>2. 再スキャンボタンをクリック       |
| 期待結果       | スキャン中→完了後にリストが更新                              |
| アサーション   | `toBeVisible()`, `waitForSelector(..., { state: "hidden" })` |

## TDD状態

| 項目               | 状態        |
| ------------------ | ----------- |
| テストファイル作成 | ✅ 完了     |
| テストケース数     | 7件         |
| TDDフェーズ        | Red（想定） |

次のフェーズ（Phase 5）でセレクタ調整・待機処理追加を行い、Green状態を目指す。
