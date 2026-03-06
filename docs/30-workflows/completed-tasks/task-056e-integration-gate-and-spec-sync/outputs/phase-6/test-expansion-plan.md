# Phase 6 テスト拡充計画

## 回帰リスク

| ID   | リスク                                 | 再発条件                                                |
| ---- | -------------------------------------- | ------------------------------------------------------- |
| R-01 | current/completed/parent path の混在   | 正本導線が複数場所で別管理される                        |
| R-02 | `spec_created` と Phase 状態のドリフト | `artifacts.json` だけ更新して index / phase 本文が残る  |
| R-03 | sync 区分誤判定                        | 条件付き更新を常時更新として扱う                        |
| R-04 | downstream handoff 欠落                | `TASK-UI-02/03/04A` の条件がまとめてしか記録されない    |
| R-05 | B の entry spec 境界忘れ               | IPC/security の正本位置を completed workflow と誤認する |

## 追加する回帰ケース

| ケース | 内容                                                               | 優先度 |
| ------ | ------------------------------------------------------------------ | ------ |
| RC-01  | parent docs が current workflow を参照しているか確認する           | High   |
| RC-02  | `artifacts.json` / `index.md` / `phase-*.md` の状態一致を確認する  | High   |
| RC-03  | `常時更新 / 条件付き更新 / 更新不要` の3区分に理由があるか確認する | High   |
| RC-04  | downstream 3タスクが個別条件を持つか確認する                       | High   |
| RC-05  | B が entry spec 正本として明記されているか確認する                 | Medium |

## Phase 7 への引き渡し

- 母集団は `5軸 + 3区分 + downstream 3件 = 11項目` とする。
- `RC-01` から `RC-04` を必須、`RC-05` を推奨の回帰ケースとする。
