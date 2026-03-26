# Test Matrix

| ID   | レベル      | シナリオ                  | 期待結果                                                      |
| ---- | ----------- | ------------------------- | ------------------------------------------------------------- |
| T-01 | unit        | verify detail DTO mapping | status / message / nextAction / provenance が正しく描画される |
| T-02 | unit        | suggestion selection      | 選択 / 全選択 / 全解除が正しく動く                            |
| T-03 | integration | improve -> apply          | apply 結果が panel に反映される                               |
| T-04 | integration | apply -> re-verify        | re-verify 起点が表示される                                    |
| T-05 | integration | terminal_handoff          | guidance が detail panel と同居する                           |
| T-06 | docs QA     | sibling boundary          | Task05 / Task07 / Task08 と責務衝突がない                     |
