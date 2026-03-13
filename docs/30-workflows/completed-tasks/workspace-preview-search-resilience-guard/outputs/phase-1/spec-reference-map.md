# Phase 1 Output: Spec Reference Map

## 抽出手順

1. `indexes/resource-map.md` で UI実装、Preload safeInvoke timeout / invoke hang、component test、a11y test、docs sync の一次参照先を選定した。
2. `indexes/quick-reference.md` の 1概念1クエリ原則に従い、broad query が 0 件だった検索は `QuickFileSearch`、`PreviewPanel`、`score=0`、`parse failure`、`no-match`、`exact count` に分割した。
3. 必要な `references/*.md` だけを読み、Phase 1-12 の仕様へ反映した。

## 抽出マップ

| concern                | 正本仕様                                                                                                                                                        | 抽出した契約                                                             | Phase 利用先         |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------- |
| search resilience      | `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`                                                                                       | top 10、`score=0` 除外、stable sort、QuickFileSearch 導線                | Phase 1, 2, 4, 11    |
| navigation contract    | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                                                                         | `Cmd/Ctrl+P`、Arrow/Enter/Escape、focus trap、選択時 preview auto-open   | Phase 1, 2, 4, 11    |
| preview resilience     | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                                                                           | `file:read` 再利用、5秒 timeout、1秒間隔 3 retry                         | Phase 1, 2, 5, 9     |
| implementation pattern | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                                                                     | match gate、renderer local timeout、parse recoverable fallback           | Phase 1, 2, 4, 5, 9  |
| state ownership        | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                    | preview / query / selectedIndex は local state                           | Phase 1, 2, 5, 8     |
| security boundary      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                                                                    | renderer local timeout、Node FS 直触り禁止                               | Phase 1, 2, 5, 9     |
| preview safety         | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md`                                                                                | sanitize、dangerous URL 拒否、既存 CSP / iframe safety を崩さない        | Phase 1, 2, 5, 9, 11 |
| taxonomy               | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                                                           | timeout / read failure / parse failure / crash / no-match 分離           | Phase 1, 2, 4, 5, 12 |
| UI contract            | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                                                                 | `PreviewPanel` / `QuickFileSearch` / 04C 苦戦箇所                        | Phase 1, 2, 11, 12   |
| UI catalog             | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                                                                         | 04C の UI語彙、catalog 上の位置づけ、Apple review continuity             | Phase 1, 11, 12      |
| workflow sync          | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                                            | related UT、Phase 12 exact count sync                                    | Phase 1, 3, 9, 12    |
| lessons                | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                                                                          | 5ステップの簡潔解決手順、same-score stable sort test、exact count 再取得 | Phase 1, 3, 12       |
| modal token            | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                                                                                      | 480px / 12px / shadow の dialog token                                    | Phase 1, 11          |
| test pattern           | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`, `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md` | hook / component test、dialog role、focus trap、banner 検証              | Phase 2, 4, 6, 11    |
| quality gate           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                                                     | future coverage gate と QA 観点                                          | Phase 2, 4, 7, 9     |
