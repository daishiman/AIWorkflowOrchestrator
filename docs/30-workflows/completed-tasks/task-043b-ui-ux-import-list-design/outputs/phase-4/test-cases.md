# Phase 4 テストケース一覧

| ID      | 種別        | 内容                                              | 実装先                                      |
| ------- | ----------- | ------------------------------------------------- | ------------------------------------------- |
| UT-01   | unit        | mixed state の 2 セクション表示                   | `SkillManagementPanel.test.tsx`             |
| UT-02   | unit        | global empty / inline empty / no-result の分離    | `SkillManagementPanel.test.tsx`             |
| UT-03   | unit        | 単一検索入力で両セクション絞り込み                | `SkillManagementPanel.test.tsx`             |
| UT-04   | unit        | row importing は対象のみ disabled                 | `SkillManagementPanel.test.tsx`             |
| UT-05   | unit        | nullish metadata fallback                         | `SkillManagementPanel.test.tsx`             |
| UT-06   | unit        | imported 済み duplicate 非表示                    | `SkillManagementPanel.test.tsx`             |
| IT-01   | integration | dialog open / cancel / trigger focus return       | `SkillManagementPanel.integration.test.tsx` |
| IT-02   | integration | confirm success で imported 移動 + status + focus | `SkillManagementPanel.integration.test.tsx` |
| IT-03   | integration | failure でも dialog stay open + alert 1件         | `SkillManagementPanel.integration.test.tsx` |
| IT-04   | integration | analysis/create 往復でも list state 維持          | `SkillManagementPanel.integration.test.tsx` |
| A11Y-01 | unit        | jest-axe violation なし                           | `SkillManagementPanel.test.tsx`             |
| MAN-01  | manual      | light / dark / mobile / keyboard の視覚確認       | Phase 11                                    |
