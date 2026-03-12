# Screenshot Matrix

> P50パターン該当: 検証・補完モード。既存画面を current build で再撮影できるよう selector 契約を固定する。

## TC-ID と surface

| TC-ID    | Surface ID | 主 selector 候補                                             | fallback                       | review scope                              |
| -------- | ---------- | ------------------------------------------------------------ | ------------------------------ | ----------------------------------------- |
| TC-11-01 | S-01       | Settings shell 内 ThemeSelector または settings content root | route capture + shell metadata | settings shell + theme switch readability |
| TC-11-02 | S-02       | Dashboard panel / greeting / suggestion area                 | route panel capture            | token hierarchy / panel readability       |
| TC-11-03 | S-03       | auth panel root / CTA block                                  | route capture                  | CTA / helper text readability             |
| TC-11-04 | S-04       | workspace search panel root                                  | dedicated harness 可           | hardcoded slate / zinc drift              |
| TC-11-05 | baseline   | dashboard dark baseline panel                                | route capture                  | light 比較基準                            |

## Capture Policy

1. representative evidence は shell 全景を既定にしない
2. selector が不安定な route は dedicated harness を先に検討する
3. bug path 検証と screenshot path は分離する
4. current worktree build の asset hash と metadata を残す
