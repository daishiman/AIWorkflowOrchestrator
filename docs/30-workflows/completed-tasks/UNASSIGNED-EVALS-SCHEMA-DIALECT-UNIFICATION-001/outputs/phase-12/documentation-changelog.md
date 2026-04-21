# Phase 12: ドキュメント更新履歴

## 今回の是正

| 対象                                        | 変更内容                                                                                | 理由                    |
| ------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------- |
| `index.md`                                  | `implementation_mode` を `new` に修正し、desktop consumer と validator follow-up を反映 | template 準拠と実装整合 |
| `artifacts.json` / `outputs/artifacts.json` | phase status 付き schema へ更新                                                         | parity validator 対応   |
| `outputs/phase-1..4`                        | 対象集合、コマンド、依存 ID を是正                                                      | false fail と漏れ解消   |
| `outputs/phase-5..13`                       | 欠落成果物を実体化                                                                      | Phase 12 契約回復       |
| `phase-2/4/5/7/11/12`                       | 本文仕様を現行ルールへ寄せた                                                            | 読み筋と close-out 整合 |

## 追跡した MINOR

| MINOR ID | 内容                                | 結果                               |
| -------- | ----------------------------------- | ---------------------------------- |
| M-01     | `evals-schema-spec.md` の実態簡略化 | 条件付き Step 2 として管理         |
| M-02     | 全 root grep 前提                   | validation-matrix へ一本化して解消 |
