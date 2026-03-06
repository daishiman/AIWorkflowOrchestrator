# Phase 4 テスト仕様書

## 対象ファイル

| ファイル                                                     | 役割                                                                      |
| ------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `SkillManagementPanel.test.tsx`                              | list UI の状態表示、文言、検索、nullish 防御、a11y smoke                  |
| `SkillManagementPanel.integration.test.tsx`                  | dialog open / close / confirm / failure / focus return / currentView 維持 |
| `capture-task-043b-ui-ux-import-list-design-screenshots.mjs` | manual phase の再現可能な視覚証跡取得                                     |

## 品質方針

- unit で state matrix を押さえる
- integration で user flow を押さえる
- manual で light / dark / mobile / keyboard を補完する
