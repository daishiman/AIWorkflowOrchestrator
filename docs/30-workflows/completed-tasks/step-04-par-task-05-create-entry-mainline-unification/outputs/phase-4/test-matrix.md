# Test Matrix

## Suite 一覧

| suite                                          | 主対象                   | 主要 assertion                                                               |
| ---------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------- |
| `SkillCenterView.cta.test.tsx`                 | primary route UI         | header CTA / journey CTA が create 入口として機能する                        |
| `useSkillCenter.navigation.test.ts`            | navigation handoff       | `navigateToSkillCreate()` が `setCurrentView("skillCreate")` を呼ぶ          |
| `SkillCreateWizard.test.tsx`                   | destination surface      | `skillCreate` 上で wizard が render され、close で戻れる                     |
| `SkillCreateWizard.store-integration.test.tsx` | store contract           | create destination が既存 generation state と整合する                        |
| `App.renderView.viewtype.test.tsx`             | shell route              | `skillCreate` が `SkillCreateWizard` を返し、close 先が `skillCenter` である |
| `skillLifecycleJourney.test.ts`                | wording / advanced route | primary/secondary/advanced の契約が崩れていない                              |
| `SkillManagementPanel.integration.test.tsx`    | advanced route           | `create` / `lifecycle` view が advanced shell 内に留まる                     |
| `SkillLifecyclePanel.test.tsx`                 | secondary route          | create/execute/improve 一気通し panel が primary route の代替にならない      |

## Regression Cases

| ID    | ケース                         | 期待値                                           |
| ----- | ------------------------------ | ------------------------------------------------ |
| RG-01 | header CTA click               | `skillCreate` へ遷移する                         |
| RG-02 | journey create CTA click       | `skillCreate` へ遷移する                         |
| RG-03 | wizard close                   | `skillCenter` へ戻る                             |
| RG-04 | advanced panel open            | primary route の説明が揺れない                   |
| RG-05 | lifecycle panel `onOpenWizard` | advanced shell 内移動として扱われる              |
| RG-06 | `source_conflict` summary      | mainline では summary のみ表示される             |
| RG-07 | `structure_mismatch` blocking  | mainline で blocking / non-blocking を区別できる |
| RG-08 | legacy `skill-center` alias    | canonical `skillCenter` へ正規化される           |
| RG-09 | Task06 improve surface         | Task05 の test scope に混入しない                |

## negative cases

- raw candidate root list を mainline に直接出さない
- `SkillLifecyclePanel` を primary create entry として説明しない
- verify / improve CTA を create 入口テストへ混ぜない
