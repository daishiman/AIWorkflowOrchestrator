# Phase 12 準拠チェック

| チェック                                             | 結果 | 補足                                                                                                                        |
| ---------------------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------- |
| 更新対象仕様書が整理されている                       | PASS | system spec 6件、skill docs 5件、mirror 追従を整理                                                                          |
| public preload API の同期要否が判断されている        | PASS | `evaluatePrompt()` と shared export 追加を Step 2 対象に含めた                                                              |
| 手動テスト証跡が validator 互換になっている          | PASS | `validate-phase11-screenshot-coverage` で TC 6/6 を確認                                                                     |
| 実装ガイドが validator 条件を満たす                  | PASS | `validate-phase12-implementation-guide` 10/10                                                                               |
| workflow 本文と outputs が同期している               | PASS | `validate-phase-output` 28項目 PASS                                                                                         |
| workflow 全体整合が取れている                        | PASS | `verify-all-specs --json` 13/13 PASS、warning=0                                                                             |
| 未タスク監査が current/baseline 分離で記録されている | PASS | `current=0 / baseline=134` を記録                                                                                           |
| 未タスクが指定ディレクトリへ配置されている           | PASS | `docs/30-workflows/unassigned-task/` に 2 件を追加作成し、個別 `audit --target-file --diff-from HEAD` で `current=0` を確認 |
| link 整合が取れている                                | PASS | `verify-unassigned-links` 221/221                                                                                           |
