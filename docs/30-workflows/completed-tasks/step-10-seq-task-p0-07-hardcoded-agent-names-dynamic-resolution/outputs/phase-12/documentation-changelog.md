# Phase 12 成果物: ドキュメント更新履歴

## 変更サマリー

| 種別 | 対象                                                                                                            | 内容                                                                             |
| ---- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| code | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                           | plan/improve の resource 解決を manifest 優先化                                  |
| code | `apps/desktop/src/main/services/runtime/SkillCreatorSourceResolver.ts`                                          | rootPath ベースの dedupe へ変更                                                  |
| code | `apps/desktop/src/main/services/runtime/improvePromptConstants.ts`                                              | `AGENT_NAME` を除去                                                              |
| code | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                           | broken manifest / missing phase / empty resourceIds を `VALIDATION_ERROR` に変更 |
| test | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.p0-07-dynamic-agent-names.test.ts`  | improve fallback の動的解決を追加検証                                            |
| test | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan-resource-selection.test.ts`    | plan の manifest 優先解決を検証                                                  |
| test | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve-resource-selection.test.ts` | improve の manifest 優先解決を検証                                               |
| test | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan-resource-selection.test.ts`    | broken manifest と missing phase の validation error を検証                      |
| test | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve-resource-selection.test.ts` | empty resourceIds の validation error を検証                                     |
| test | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorSourceResolver.test.ts`                           | same-root dedupe を検証                                                          |
| test | `apps/desktop/src/main/services/runtime/__tests__/PhaseResourcePlanner.test.ts`                                 | fallback / budget の優先順位を検証                                               |
| doc  | `phase-6-test-expansion.md`                                                                                     | broken manifest / empty resourceIds の validation coverage を追記                |
| doc  | `phase-7-coverage-check.md`                                                                                     | validation error coverage を追記                                                 |
| doc  | `outputs/phase-12/implementation-guide.md`                                                                      | Part 1/2 形式で実装ガイドを再構成                                                |
| doc  | `phase-12-documentation.md`                                                                                     | Phase 12 必須成果物の current facts を整理                                       |
| doc  | `outputs/phase-12/phase12-task-spec-compliance-check.md`                                                        | Phase 12 の自己点検を追加                                                        |

## validator 実行結果

| チェック                                | 結果 | 補足                                                  |
| --------------------------------------- | ---- | ----------------------------------------------------- |
| `validate-phase12-implementation-guide` | PASS | Part 1 / Part 2 / APIシグネチャ / エッジケース を確認 |
| `verify-all-specs`                      | PASS | Phase 12 は error 0、warning のみで通過               |

## current / baseline

- current: `outputs/phase-12/` の 6 成果物と root / mirror の台帳を同期し、manifest validation を explicit error にした状態
- baseline: Phase 12 初期案の、root / mirror / outputs の一部がずれ、broken manifest が静かに fallback しうる状態

## artifacts 同期結果

- `artifacts.json` と `outputs/artifacts.json` を同一内容へ同期した
- Phase 11 の `manual-test-checklist.md` を両方の台帳に含めた
- completed mirror へも同じ Phase 12 成果物群を反映する前提で整理した

## 補足

- UI/UX 変更はないため、スクリーンショット参照は不要
- 変更履歴は task-root 内の current facts を基準に整理した
- manifest 不在のみ fallback、破損や phase/resourceIds 欠落は validation error という boundary を明記した
