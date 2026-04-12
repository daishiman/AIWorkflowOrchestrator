# Phase 12 タスク仕様準拠チェック - UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001

## メタ情報

| 項目     | 内容                                          |
| -------- | --------------------------------------------- | --- | --- | --- | --- | ---------- |
| タスクID | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001 |
| 作成日   | 2026-04-11                                    |
| 対象     | `outputs/phase-12` canonical 6成果物          |
|          |                                               |     |     |     |     | Stash base |
| 項目     | 内容                                          |
| -------- | ------------------------------------          |
| タスクID | TASK-SC-07                                    |
| 作成日   | 2026-04-09                                    |
| 対象     | `outputs/phase-12` canonical 6成果物          |

---

| 項目     | 内容                                          |
| -------- | --------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001 |
| 作成日   | 2026-04-11                                    |
| 対象     | `outputs/phase-12` canonical 6成果物          |

---

## チェック 1: canonical 6成果物の存在

| 成果物                   | パス                                                     | 判定 |
| ------------------------ | -------------------------------------------------------- | ---- |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | PASS |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | PASS |
| 更新履歴                 | `outputs/phase-12/documentation-changelog.md`            | PASS |
| 未タスク検出             | `outputs/phase-12/unassigned-task-detection.md`          | PASS |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`              | PASS |
| 準拠チェック             | `outputs/phase-12/phase12-task-spec-compliance-check.md` | PASS |

---

## チェック 2: 必須要件の反映

| 要件                                                     | 判定 | 根拠                                                                                  |
| -------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------- | --- | --- | --- | ---------- |
| `SkillCategory` 5 値のラベル共有                         | PASS | `skillCreator.ts` の canonical helper に集約                                          |
| `SKILL_CATEGORY_LABELS` / `getSkillCategoryLabel` export | PASS | `@repo/shared/types/skillCreator` から参照可能                                        |
| `SkillInfoStep` の canonical label 表示                  | PASS | shared helper 由来の label を使用                                                     |
| `DescribeStep` の canonical label 表示                   | PASS | deprecated step でも `コード支援` drift を解消                                        |
| `SkillCategory` union 固定テスト                         | PASS | `skillCreator-wizard.test.ts` に型ガードを追加                                        |
| `DescribeStep` option 表示テスト                         | PASS | canonical label の option 表示を追加                                                  |
|                                                          |      |                                                                                       |     |     |     | Stash base |
| 要件                                                     | 判定 | 根拠                                                                                  |
| ------------------------------------------------------   | ---- | ------------------------------------------------------------------------------------- |
| `SkillInfoStep` / LLM モードの併存                       | PASS | `implementation-guide.md` Part 2 と `arch-ui-components-core.md`                      |
| `generationProgress` の表示                              | PASS | `GenerateStep` の current facts に反映                                                |
| `executePlan(planId, skillSpec)` の `skillSpec` 必須化   | PASS | `SkillCreateWizard.tsx` / `implementation-guide.md`                                   |
| `getWorkflowState(planId)` の snapshot 再読込            | PASS | `SkillCreateWizard.tsx` / `implementation-guide.md`                                   |
| `persistResult.skillPath` の反映                         | PASS | `SkillCreateWizard.tsx` / `implementation-guide.md` / `system-spec-update-summary.md` |
| `terminal_handoff` の guidance 表示                      | PASS | `GenerateStep` の current facts とテストに反映                                        |
| `skillPath` と外部連携表示                               | PASS | `CompleteStep` の current facts と出力に反映                                          |
| request-id guard / cancel 競合回避                       | PASS | `SkillCreateWizard.tsx` / `documentation-summary.md`                                  |

---

| 要件                                                     | 判定 | 根拠                                           |
| -------------------------------------------------------- | ---- | ---------------------------------------------- |
| `SkillCategory` 5 値のラベル共有                         | PASS | `skillCreator.ts` の canonical helper に集約   |
| `SKILL_CATEGORY_LABELS` / `getSkillCategoryLabel` export | PASS | `@repo/shared/types/skillCreator` から参照可能 |
| `SkillInfoStep` の canonical label 表示                  | PASS | shared helper 由来の label を使用              |
| `DescribeStep` の canonical label 表示                   | PASS | deprecated step でも `コード支援` drift を解消 |
| `SkillCategory` union 固定テスト                         | PASS | `skillCreator-wizard.test.ts` に型ガードを追加 |
| `DescribeStep` option 表示テスト                         | PASS | canonical label の option 表示を追加           |

---

## チェック 3: ドキュメント整合

| 観点                         | 判定 | 補足                                                        |
| ---------------------------- | ---- | ----------------------------------------------------------- | --- | --- | --- | ---------- |
| タスクIDの一致               | PASS | 6成果物とも current task に統一                             |
| 親リンクの実在               | PASS | `index.md` の参照先を実在する依存元に修正                   |
| 参照パスの誤り               | PASS | `phase-2-design.md` / `phase-9-quality-assurance.md` を修正 |
| category label drift の解消  | PASS | `DescribeStep` の `コード支援` を canonical label に統一    |
|                              |      |                                                             |     |     |     | Stash base |
| 観点                         | 判定 | 補足                                                        |
| ---------------------------- | ---- | ----------------------------------------------------        |
| タスクIDの一致               | PASS | 6成果物とも `TASK-SC-07` に統一                             |
| Phase 11 証跡参照            | PASS | `implementation-guide.md` から参照あり                      |
| 旧 `DescribeStep` 依存の残存 | PASS | deprecated として扱い、正本は `SkillInfoStep` に統一        |
| canonical 6成果物の命名      | PASS | `documentation-changelog.md` に揃えた                       |

---

| 観点                        | 判定 | 補足                                                        |
| --------------------------- | ---- | ----------------------------------------------------------- |
| タスクIDの一致              | PASS | 6成果物とも current task に統一                             |
| 親リンクの実在              | PASS | `index.md` の参照先を実在する依存元に修正                   |
| 参照パスの誤り              | PASS | `phase-2-design.md` / `phase-9-quality-assurance.md` を修正 |
| category label drift の解消 | PASS | `DescribeStep` の `コード支援` を canonical label に統一    |

---

## チェック 4: ブロッカー

| 項目                               | 判定    | 理由                                                                                                          |
| ---------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------- | --- | --- | --- | ---------- |
| repo root の ledger parity         | FAIL    | `artifacts.json` / `outputs/artifacts.json` が current task に未同期                                          |
| Phase 12 の最終合格                | BLOCKED | 上記 parity が未解決のため                                                                                    |
|                                    |         |                                                                                                               |     |     |     | Stash base |
| 項目                               | 判定    | 理由                                                                                                          |
| ---------------------------------- | ----    | ------------------------------------------------------------------------------------------------------------- |
| `api-ipc-agent-core.md` の追加修正 | PASS    | 既存契約が current facts と整合していたため                                                                   |
| `topic-map` の追加更新             | PASS    | `arch-state-management-skill-creator.md` / `arch-ui-components-core.md` の current facts section を索引化済み |

---

| 項目                       | 判定    | 理由                                                                 |
| -------------------------- | ------- | -------------------------------------------------------------------- |
| repo root の ledger parity | FAIL    | `artifacts.json` / `outputs/artifacts.json` が current task に未同期 |
| Phase 12 の最終合格        | BLOCKED | 上記 parity が未解決のため                                           |

---

## 総合判定

BLOCKED

## 補足

canonical 6 成果物は current task 版に更新済みだが、台帳の同期が別 wave で必要である。  
このため、仕様上の最終合格は保留とする。
