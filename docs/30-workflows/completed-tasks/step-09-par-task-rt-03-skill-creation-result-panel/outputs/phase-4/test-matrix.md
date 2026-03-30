# Phase 4: Test Matrix

## PlanResultDetailPanel テストケース

| テストケース | シナリオ                    | 期待結果                                                        | ステータス |
| ------------ | --------------------------- | --------------------------------------------------------------- | ---------- |
| T-PRP-01     | 完全な planResult を渡す    | skillName, description, agents, scripts, triggers, anchors 表示 | PASS       |
| T-PRP-02     | planResult が null          | 何も表示されない                                                | PASS       |
| T-PRP-03     | isLoading が true           | スケルトンローダーが表示される                                  | PASS       |
| T-PRP-04     | error が設定されている      | ErrorBanner が表示される                                        | PASS       |
| T-PRP-05     | agents が空配列             | 「エージェントなし」が表示される                                | PASS       |
| T-PRP-06     | scripts が空配列            | 「スクリプトなし」が表示される                                  | PASS       |
| T-PRP-07     | triggers が空配列           | 「トリガーなし」が表示される                                    | PASS       |
| T-PRP-08     | anchors が空配列            | 「アンカーなし」が表示される                                    | PASS       |
| T-PRP-09     | estimatedSteps が表示される | バッジに数値が表示される                                        | PASS       |
| T-PRP-10     | skillSpec 折りたたみ展開    | skillSpec の全文が表示される                                    | PASS       |
| T-PRP-11     | agents に複数エントリ       | 全エントリが name — role 形式で表示される                       | PASS       |
| T-PRP-12     | planId が表示される         | フッターに planId が小さく表示される                            | PASS       |
| T-PRP-13     | raw plan detail 保持        | 再レンダリングで値が保持される                                  | PASS       |
| T-PRP-14     | terminal_handoff            | パネルが表示されない                                            | PASS       |

## ExecuteResultDetailPanel テストケース

| テストケース | シナリオ                               | 期待結果                                              | ステータス |
| ------------ | -------------------------------------- | ----------------------------------------------------- | ---------- |
| T-ERP-01     | success: true の executeResult         | 成功バッジ + 成功メッセージが表示される               | PASS       |
| T-ERP-02     | success: false の executeResult        | 失敗バッジ + エラーメッセージが表示される             | PASS       |
| T-ERP-03     | executeResult が null                  | 何も表示されない                                      | PASS       |
| T-ERP-04     | isLoading が true                      | スケルトンが表示される                                | PASS       |
| T-ERP-05     | error が設定されている                 | ErrorBanner が表示される                              | PASS       |
| T-ERP-06     | success: false で error フィールドあり | error メッセージが表示される                          | PASS       |
| T-ERP-07     | success: false で onRetry が渡される   | 再試行ボタンが表示され、クリックで onRetry が呼ばれる | PASS       |
| T-ERP-08     | executeId が表示される                 | フッターに executeId が小さく表示される               | PASS       |
| T-ERP-09     | sessionId / resultSubtype / stopReason | metadata 行に表示される                               | PASS       |
| T-ERP-10     | permissionDenials / sdkEvents          | 件数 + 折りたたみ表示される                           | PASS       |
| T-ERP-11     | terminal_handoff                       | パネルが表示されない                                  | PASS       |

## ErrorBanner テストケース

| テストケース | シナリオ                        | 期待結果                                          | ステータス |
| ------------ | ------------------------------- | ------------------------------------------------- | ---------- |
| T-ERR-01     | errorCode + errorMessage を渡す | エラーアイコン + メッセージが赤系背景で表示される | PASS       |
| T-ERR-02     | onRetry が渡される              | 再試行ボタンが表示される                          | PASS       |
| T-ERR-03     | onRetry が未設定                | 再試行ボタンが表示されない                        | PASS       |
| T-ERR-04     | 長いエラーメッセージ            | テキストが折り返されて表示される                  | PASS       |
| T-ERR-05     | retryable が false              | 再試行ボタンが非表示になる                        | PASS       |

## 全テスト結果サマリ

- Test Files: 4 passed (ErrorBanner, PlanResultDetailPanel, ExecuteResultDetailPanel, SkillLifecyclePanel)
- Tests: 51 passed, 0 failed
