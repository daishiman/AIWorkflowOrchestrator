# Phase 4 テストケース一覧

| ID       | レイヤ     | ケース                                  | 期待結果                                        |
| -------- | ---------- | --------------------------------------- | ----------------------------------------------- |
| TC-04-01 | component  | prompt 入力時に `detectMode` が呼ばれる | mode hint が表示される                          |
| TC-04-02 | component  | create 実行                             | `createSkill` が既定 options で呼ばれる         |
| TC-04-03 | component  | create 成功後 handoff                   | `selectSkillByName` に新規 skill 名が渡る       |
| TC-04-04 | component  | create 後の execute                     | `executeSkill` が session card から呼ばれる     |
| TC-04-05 | component  | create 後の auto improve                | `autoImproveSkill` が session card から呼ばれる |
| TC-04-06 | regression | wizard 二次導線                         | 既存 create view へ遷移できる                   |
| TC-04-07 | regression | analysis view                           | 既存 analysis 導線が維持される                  |
