# Phase 9: risk register

| ID      | リスク                                        | 影響                              | 緩和策                                        | owner                        | 次確認 Phase | 状態   |
| ------- | --------------------------------------------- | --------------------------------- | --------------------------------------------- | ---------------------------- | ------------ | ------ |
| R-09-01 | restart 後の mode 復元が UI で確認不足        | 永続化不整合を見落とす            | Phase 11 で TC-11-05 を実施                   | SubAgent-Contract-Main 相当  | 11           | 未確認 |
| R-09-02 | stale spec が残り次回変更で drift する        | 実装と正本仕様が再分裂する        | Phase 12 Step 2 で references を更新          | SubAgent-Spec-Sync 相当      | 12           | 未確認 |
| R-09-03 | service internal event と public event の混同 | 将来の event shape 変更時に誤実装 | Phase 12 で internal/public 境界を明記        | SubAgent-Contract-Main 相当  | 12           | 管理中 |
| R-09-04 | coverage 除外ファイルの監査根拠が薄い         | 説明責任不足                      | contract test と selector regression を文書化 | SubAgent-Bridge-Preload 相当 | 10           | 管理中 |

## blocker 判定

- release blocker: 0 件
- residual risk: 4 件
- いずれも Phase 11 または Phase 12 で閉じられる
