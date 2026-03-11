# Phase 6 成果物: expanded-test-plan

## 拡張方針

Phase 4 の token 契約テストに加え、3テーマ整合と fallback 非依存を強化する。

## 拡張ケース

| ケースID | 観点                       | 目的                                        | 対応                                                         |
| -------- | -------------------------- | ------------------------------------------- | ------------------------------------------------------------ |
| EX-06-01 | light surface / text       | white / black 基準の再発防止                | `--bg-primary`/`--bg-elevated`/`--text-primary` の固定値検証 |
| EX-06-02 | required token 3テーマ整合 | light/dark/kanagawa で必須 token の欠落防止 | `REQUIRED_TOKENS` 一括検証                                   |
| EX-06-03 | fallback 非依存            | `var(--token)` の未定義参照検出             | renderer 全体走査                                            |
| EX-06-04 | representative rendering   | text/background 同色化の再発防止            | computed style 比較                                          |

## 実行対象

- `apps/desktop/src/renderer/styles/tokens.light-theme.contract.test.ts`

## Phase 7 連携

- coverage 評価は上記4ケースを最小セットとして判定する。
- shared color migration タスクへは「token 基盤側で解決済み/未解決」を明示して引き渡す。
