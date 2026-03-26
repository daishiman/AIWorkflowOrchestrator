# Budget Degrade Matrix

`required-core` / `required-context` は `WorkflowManifestPhase.resourceIds` を起点に決め、budget tier はその required set を削らずに optional を落とすための二次ルールとして使う。

## Budget Tier

| tier                 | 説明             | 代表 resource                                   | drop 順           |
| -------------------- | ---------------- | ----------------------------------------------- | ----------------- |
| `required-core`      | phase 実行に必須 | `phase.resourceIds` 由来の agent prompt、schema | 最後まで保持      |
| `required-context`   | 正答率維持に必要 | short reference、current skill content          | `optional-*` の後 |
| `optional-quality`   | 品質向上用       | deep-dive reference、補助 asset                 | 先に drop         |
| `optional-deep-dive` | 調査補助         | 長文 history、examples                          | 最初に drop       |

## Degrade Trigger

| trigger                     | 条件                                    | Task03 で返す内容                      | 後続 task                   |
| --------------------------- | --------------------------------------- | -------------------------------------- | --------------------------- |
| `budget_overflow`           | tier の合計が phase 予算を超える        | drop list、kept list、remaining budget | Task07 が disclosure へ適用 |
| `required_resource_missing` | required-core / required-context が欠落 | failure + missing resource list        | Task07 / Task08             |
| `source_conflict`           | 複数 root の競合で採択が揺れる          | selected root + suppressed roots       | Task05 / Task07             |
| `structure_mismatch`        | root に必要 marker が揃わない           | rejected root list                     | Task04 / Task05             |
| `provenance_incomplete`     | Task03 extension snapshot だけが不完全  | warning + missing extension field      | Task08                      |

## Phase / Operation 別の優先観点

| operation | 必須優先                                        | optional の扱い                      |
| --------- | ----------------------------------------------- | ------------------------------------ |
| `plan`    | agent prompt、軽量 reference、schema            | examples / long reference は drop 可 |
| `execute` | plan artifact、schema、target template          | deep-dive reference は予算次第       |
| `improve` | current skill content、feedback、improve prompt | 履歴全文は optional                  |
| `verify`  | rule set、schema、target artifact               | extra guidance は optional           |

## Foundation Failure Boundary

- manifest schema mismatch / unknown field / hook drift / phase order 不正は Task01 foundation failure であり、Task03 の degrade では扱わない。
- Task03 が扱うのは foundation success 後の selection / budget / handoff extension だけである。
