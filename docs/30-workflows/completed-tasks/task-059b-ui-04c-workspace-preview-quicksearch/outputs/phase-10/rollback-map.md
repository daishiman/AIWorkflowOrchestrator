# Phase 10 ロールバックマップ

| 失敗条件                                     | 戻り先                   |
| -------------------------------------------- | ------------------------ |
| screenshot が current build で再取得できない | Phase 5                  |
| manual test で keyboard / responsive 崩れ    | Phase 6                  |
| security drift（sanitize / CSP / timeout）   | Phase 5                  |
| coverage validator / phase12 validator 不通  | Phase 11 または Phase 12 |
