# リスク分析

| リスク                                                       | 発生条件                                            | 影響                                         | 対策                                                  | Owner      |
| ------------------------------------------------------------ | --------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------- | ---------- |
| old path の検索が dot directory を落とす                     | `rg` を hidden file 無しで実行する                  | `.claude` / `.agents` の stale path を見逃す | guard は対象ファイルを固定 manifest で走査する        | SubAgent-C |
| status 表記揺れを過剰にエラー扱いする                        | `phase12_completed` と `completed` を同値に扱えない | false positive が増える                      | fail 条件を `pending` / `未着手` 残存に限定する       | SubAgent-C |
| completed-task pointer docs の更新が大きな本文改変に波及する | 旧仕様本文まで全面更新する                          | スコープ逸脱                                 | メタ情報と正本導線だけを修正する                      | SubAgent-A |
| Phase 12 で `.agents` への mirror sync を忘れる              | `.claude` 側だけ編集して終了する                    | 再監査で root drift 再発                     | compliance check に `diff -qr` を必須項目として入れる | SubAgent-D |
