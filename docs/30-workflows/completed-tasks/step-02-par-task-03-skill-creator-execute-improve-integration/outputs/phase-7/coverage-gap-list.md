# Phase 7 ギャップ一覧

| ID     | 未検証または薄い領域                                  | 理由                                                                             | 対応方針                                                      |
| ------ | ----------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| GAP-01 | `SkillLifecycleSessionCard` の branch coverage 62.50% | mode 判定 API 不在、validation exception、analyze failure 専用分岐の一部が未通過 | Phase 11 手動検証で補完し、必要なら follow-up test を追加する |
| GAP-02 | visual hierarchy と spacing                           | 自動テストでは見た目品質を担保できない                                           | Phase 11 screenshot と Apple UI/UX review で確認する          |
| GAP-03 | `SkillAnalysisView` 詳細画面との横断操作              | session card summary を優先し、詳細画面回帰は既存テストへ依存している            | Phase 10 / 11 で手動確認する                                  |
