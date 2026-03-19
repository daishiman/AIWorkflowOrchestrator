# Phase 9 品質レポート

## タスクID: UT-TASK06-007

## 検証日: 2026-03-19

## 1. 実行した検証

| 検証                      | コマンド / 方法                                                                      | 結果                                               |
| ------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------- | ---------- |
| 型チェック                | `pnpm --filter @repo/desktop typecheck`                                              | PASS                                               |
| 対象テスト                | `pnpm --filter @repo/desktop test:run scripts/__tests__/check-ipc-contracts.test.ts` | PASS (49/49)                                       |
| 対象カバレッジ            | Phase 7 再計測コマンド                                                               | PASS (Line 95.31% / Branch 90.84% / Function 100%) |
| `any` / `@ts-ignore` 監査 | `rg -n "@ts-ignore                                                                   | \\bany\\b" ...`                                    | PASS (0件) |
| `--report-only`           | `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only`                 | PASS (exit 0, real 3.46s)                          |
| JSON 出力                 | `pnpm tsx ... --report-only --format json                                            | jq`                                                | PASS       |
| `--strict`                | `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --strict`                      | PASS (exit 1, 115 errors)                          |
| Lint                      | `apps/desktop/package.json` に lint script なし                                      | N/A                                                |

## 2. 自己診断の実測値

| 指標            | 値     |
| --------------- | ------ |
| Main handlers   | 216    |
| Preload entries | 189    |
| Drifts          | 197    |
| Orphans         | 119    |
| 実行時間        | 3.46秒 |

### ルール別内訳

| ルール | 件数 | 意味                                            |
| ------ | ---- | ----------------------------------------------- |
| R-01   | 75   | Main / Preload の片側のみで観測されたチャンネル |
| R-02   | 71   | object vs primitive の契約不一致                |
| R-03   | 7    | 文字列リテラルのチャンネル指定                  |
| R-04   | 44   | 定数定義済みだが main 未登録                    |

## 3. 解釈

- 今回の PASS は「リポジトリがドリフトゼロ」という意味ではない。
- PASS の意味は「検出スクリプトが current codebase を走査し、再現可能な診断結果を返す」ことである。
- `--strict` の 115 errors は R-02 と R-04 の合計であり、診断のエラー経路が意図どおり動作している。
- 既知のノイズ源は、タプル配列経由 main 登録と event listener parity (`ipcMain.on` / `safeOn`) に集中している。

## 4. 品質ゲート判定

| 観点            | 判定   | 根拠                                               |
| --------------- | ------ | -------------------------------------------------- |
| 型安全性        | PASS   | `typecheck` 通過                                   |
| テスト          | PASS   | 49 / 49 tests passed                               |
| カバレッジ      | PASS   | 推奨基準超過                                       |
| 実行性能        | PASS   | 3.46秒で 10秒以内                                  |
| CLI振る舞い     | PASS   | report-only=0 / strict=1                           |
| 診断妥当性      | PASS   | R-01〜R-04 の出力内訳を再取得                      |
| repo clean 判定 | 対象外 | 本タスクは診断器整備であり、全ドリフト解消ではない |

## 5. 残課題

- EXT-001: タプル配列経由 main 登録の抽出
- EXT-002: エイリアス / 再export / 動的定数経由のチャンネル解決強化
- EXT-003: `ipcMain.on` / `safeOn` parity の精度向上
- EXT-004: 578 行スクリプトの分割
- EXT-005: R-02 の意味的精度向上

## 判定

Phase 9 は PASS。検出器自体の品質は確認できたが、検出結果に含まれる残ドリフトとノイズは follow-up で継続管理する。
