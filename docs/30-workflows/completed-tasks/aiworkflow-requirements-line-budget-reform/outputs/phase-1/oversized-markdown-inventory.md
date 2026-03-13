# Phase 1 Output: Oversized Markdown Inventory

## 対象一覧

| ID    | 種別            | ファイル                                             | 行数 | band    | family | action                             | 備考                                                          |
| ----- | --------------- | ---------------------------------------------------- | ---: | ------- | ------ | ---------------------------------- | ------------------------------------------------------------- |
| G0-01 | generated index | `indexes/topic-map.md`                               | 2179 | >700    | G0     | blocked dependency                 | `generate-index.js` 生成物。script 変更なしでは恒久解消が困難 |
| F1-01 | ledger          | `LOGS.md`                                            | 9318 | >700    | F1     | rolling + archive split            | 直近 log と長期履歴が混在                                     |
| F1-02 | ledger          | `references/lessons-learned.md`                      | 7367 | >700    | F1     | domain archive split               | 教訓と task 履歴が集中                                        |
| F1-03 | ledger          | `references/task-workflow.md`                        | 4960 | >700    | F1     | active / completed / backlog split | 台帳、運用、履歴が集中                                        |
| F2-01 | pattern         | `references/architecture-implementation-patterns.md` | 3377 | >700    | F2     | theme shard split                  | 横断パターンの密集                                            |
| F2-02 | pattern         | `references/patterns.md`                             |  795 | >700    | F2     | family shard split                 | 成功 / 失敗 / 運用が混在                                      |
| F2-03 | rulebook        | `references/quality-requirements.md`                 | 1111 | >700    | F2     | quality subtopic split             | 品質要件と実装履歴が混在                                      |
| F2-04 | rulebook        | `references/testing-component-patterns.md`           | 1110 | >700    | F2     | testing family split               | component test pattern の密集                                 |
| F2-05 | rulebook        | `references/development-guidelines.md`               |  715 | >700    | F2     | guideline shard split              | 開発ガイドの横断化                                            |
| F2-06 | rulebook        | `references/error-handling.md`                       |  818 | >700    | F2     | category split                     | error category と task history が混在                         |
| F3-01 | architecture    | `references/arch-state-management.md`                | 1903 | >700    | F3     | domain split                       | UI state と task history が過密                               |
| F3-02 | architecture    | `references/arch-ui-components.md`                   |  988 | >700    | F3     | surface split                      | component architecture の集中                                 |
| F3-03 | architecture    | `references/arch-electron-services.md`               |  599 | 500-700 | F3     | service split                      | service family の密度過多                                     |
| F3-04 | architecture    | `references/architecture-auth-security.md`           |  606 | 500-700 | F3     | auth / security split              | auth と security の混在                                       |
| F3-05 | architecture    | `references/architecture-overview.md`                |  513 | 500-700 | F3     | overview slimming                  | 概要に詳細が残り過ぎている                                    |
| F3-06 | structure       | `references/directory-structure.md`                  |  555 | 500-700 | F3     | package split                      | package 別説明に分ける                                        |
| F4-01 | interface       | `references/interfaces-agent-sdk-skill.md`           | 2397 | >700    | F4     | domain split                       | skill 型定義と履歴が集中                                      |
| F4-02 | interface       | `references/interfaces-agent-sdk-executor.md`        |  804 | >700    | F4     | capability split                   | executor 契約が過密                                           |
| F4-03 | interface       | `references/interfaces-agent-sdk-history.md`         |  583 | 500-700 | F4     | history slimming                   | history companion へ退避                                      |
| F4-04 | interface       | `references/interfaces-auth.md`                      |  516 | 500-700 | F4     | auth / profile split               | domain 境界の明確化                                           |
| F4-05 | interface       | `references/interfaces-chat-history.md`              |  557 | 500-700 | F4     | schema / service split             | repository と service の分離                                  |
| F4-06 | api             | `references/api-ipc-agent.md`                        | 1004 | >700    | F4     | feature split                      | channel family が集中                                         |
| F4-07 | api             | `references/api-ipc-system.md`                       |  688 | 500-700 | F4     | channel split                      | system IPC が過密                                             |
| F4-08 | security        | `references/security-electron-ipc.md`                | 1072 | >700    | F4     | policy / pattern split             | principle と具体例が混在                                      |
| F4-09 | security        | `references/security-skill-ipc.md`                   |  511 | 500-700 | F4     | surface split                      | skill IPC security の密度過多                                 |
| F5-01 | ui              | `references/ui-ux-feature-components.md`             | 2019 | >700    | F5     | surface shard split                | feature catalog が過密                                        |
| F5-02 | ui              | `references/ui-ux-design-principles.md`              |  622 | 500-700 | F5     | principle split                    | 原則と詳細例が混在                                            |
| F5-03 | ui              | `references/ui-ux-atoms-patterns.md`                 |  599 | 500-700 | F5     | pattern split                      | atoms pattern と教訓が混在                                    |
| F5-04 | ui              | `references/ui-ux-components.md`                     |  553 | 500-700 | F5     | catalog split                      | component list と履歴が混在                                   |
| F5-05 | ui              | `references/ui-ux-agent-execution.md`                |  553 | 500-700 | F5     | flow split                         | execution UI 詳細の切り分け                                   |
| F5-06 | ui              | `references/ui-ux-search-panel.md`                   |  556 | 500-700 | F5     | search mode split                  | panel 種別を分ける                                            |
| F5-07 | ui              | `references/ui-ux-settings.md`                       |  512 | 500-700 | F5     | section split                      | settings surface が密集                                       |
| F6-01 | support         | `references/deployment.md`                           |  513 | 500-700 | F6     | deployment split                   | deploy target 別へ分ける                                      |
| F6-02 | support         | `references/database-implementation.md`              |  506 | 500-700 | F6     | db implementation split            | 実装と運用を分離                                              |
| F6-03 | support         | `references/technology-devops.md`                    |  502 | 500-700 | F6     | devops split                       | CI/CD と package 管理を分離                                   |

## サマリ

| 指標             | 値  |
| ---------------- | --- |
| total over-limit | 35  |
| manual docs      | 34  |
| generated index  | 1   |
| >700             | 19  |
| 500-700          | 16  |

## inventory から得た判断

1. `SKILL.md` は対象外であり、entrypoint ではなく ledger / family docs が主問題である。
2. generated `topic-map.md` は manual docs と分離しないと、script exclusion 制約に反する。
3. 34 manual docs を family-wave で処理しないと、Phase 5 実行時に lane 数と rate limit 制約を破る。
