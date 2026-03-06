# Phase 9 リスク登録表

| ID     | リスク                                               | 影響 | 対応                            |
| ------ | ---------------------------------------------------- | ---- | ------------------------------- |
| R-9-01 | physical-only anomaly が別ID衝突を起こす             | 中   | scope 外 anomaly として継続監視 |
| R-9-02 | repo 全体 baseline 参照切れが current 判定と混線する | 中   | verification-report に分離記録  |
| R-9-03 | future update で derived 片側だけ更新される          | 高   | validator を再利用する          |
