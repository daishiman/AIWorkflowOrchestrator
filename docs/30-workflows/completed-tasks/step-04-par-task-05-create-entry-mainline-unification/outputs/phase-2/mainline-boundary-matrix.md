# Mainline Boundary Matrix

## Surface Matrix

| surface                               | route kind  | trigger                                   | 主責務                              | handoff payload                     | warning 表示         | 備考                           |
| ------------------------------------- | ----------- | ----------------------------------------- | ----------------------------------- | ----------------------------------- | -------------------- | ------------------------------ |
| `SkillCenter` header CTA              | primary     | `header-create-cta` click                 | create を始める通常入口             | `setCurrentView("skillCreate")`     | summary のみ         | normal user の最短導線         |
| `SkillCenter` journey create CTA      | primary     | `skill-lifecycle-cta-create` click        | job guide から create へ送る        | `setCurrentView("skillCreate")`     | summary のみ         | primary route の説明付き入口   |
| `SkillCreateWizard`                   | destination | `skillCreate` view render                 | create 本体の設定・生成・完了       | `onClose -> skillCenter`            | summary を受けて開始 | create destination surface     |
| `SkillManagementPanel` create view    | secondary   | `/advanced/skill-management-panel` 内切替 | advanced shell 上の比較・旧導線確認 | local `setCurrentView("create")`    | diagnostics 許容     | primary route の代替にしない   |
| `SkillManagementPanel` lifecycle view | secondary   | `/advanced/skill-management-panel` 内切替 | create/execute/improve 一気通し比較 | local `setCurrentView("lifecycle")` | diagnostics 許容     | advanced review surface        |
| `SkillLifecyclePanel`                 | secondary   | advanced shell 経由                       | runtime 一気通しの試験・比較        | `onOpenWizard` / runtime action     | diagnostics 許容     | mainline create entry ではない |
| `SkillAnalysisView` / improve CTA     | downstream  | Task06 起点                               | verify / improve / re-entry         | `currentSkillName` / `viewHistory`  | result + diagnostics | Task05 非対象                  |

## Navigation Decision

| from                             | to                           | method                          | close/back                                       | owner                              |
| -------------------------------- | ---------------------------- | ------------------------------- | ------------------------------------------------ | ---------------------------------- |
| `SkillCenter` header CTA         | `skillCreate`                | `setCurrentView("skillCreate")` | `SkillCreateWizard.onClose -> skillCenter`       | `useAppStore`                      |
| `SkillCenter` journey create CTA | `skillCreate`                | `setCurrentView("skillCreate")` | `SkillCreateWizard.onClose -> skillCenter`       | `useAppStore`                      |
| advanced `SkillLifecyclePanel`   | wizard within advanced shell | `onOpenWizard()`                | advanced shell 内で list/create/lifecycle を切替 | `SkillManagementPanel` local state |
| `skillCreate` close              | `skillCenter`                | `onClose`                       | canonical `skillCenter`                          | `App.tsx` shell contract           |

## Warning Placement

| trigger                 | mainline 表示                                 | diagnostics 表示                                   | 理由                                        |
| ----------------------- | --------------------------------------------- | -------------------------------------------------- | ------------------------------------------- |
| `source_conflict`       | 「複数候補から選定した」summary を出す        | root list / suppressed roots は diagnostics へ出す | 通常導線では判断材料だけ見せる              |
| `structure_mismatch`    | blocking / non-blocking を summary で区別する | rejected root list は diagnostics へ出す           | mainline で raw path 羅列を避ける           |
| `budget_overflow`       | create entry では非表示または軽量 summary     | 詳細 drop list は diagnostics へ出す               | Task03 / Task07 の責務を尊重する            |
| `provenance_incomplete` | 「詳細は diagnostics で確認」summary のみ     | 欠落 field は diagnostics へ出す                   | resume/gov へ影響する詳細は Task08 / Task07 |

## Boundary Guard

| 項目               | Task05 が持つもの                          | Task05 が持たないもの                          |
| ------------------ | ------------------------------------------ | ---------------------------------------------- |
| create entry       | `SkillCenter` からどこへ送るか             | verify/improve の結果 surface                  |
| create destination | `skillCreate` を destination にすること    | wizard 内部の runtime 実装詳細                 |
| warning summary    | mainline に出す summary の粒度             | diagnostics 全表示、route disclosure hardening |
| state handoff      | `setCurrentView("skillCreate")` の最小契約 | 新しい state owner、新しい slice               |
