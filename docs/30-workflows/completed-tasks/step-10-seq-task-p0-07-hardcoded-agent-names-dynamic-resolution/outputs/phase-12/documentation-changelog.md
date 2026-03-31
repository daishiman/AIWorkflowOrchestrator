# documentation-changelog.md — Phase 12 成果物

## 変更履歴

| 日付       | 対象ファイル                                                                                                    | 変更種別 | 変更内容                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------- |
| 2026-03-30 | `packages/shared/src/types/skillCreator.ts`                                                                     | 追加     | `AgentConfig` インターフェース追加                                                    |
| 2026-03-30 | `packages/shared/src/types/index.ts`                                                                            | 追加     | `AgentConfig` の再エクスポート追加                                                    |
| 2026-03-30 | `apps/desktop/src/main/services/runtime/AgentNameResolver.ts`                                                   | 新規     | fallback / manifest 解決ユーティリティ追加                                            |
| 2026-03-30 | `apps/desktop/src/main/services/runtime/ManifestLoader.ts`                                                      | 追加     | `extractAgentConfig()` メソッド追加                                                   |
| 2026-03-30 | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                           | 変更     | plan/improve の dynamic pipeline と legacy path を manifest phase resource 解決へ接続 |
| 2026-03-30 | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan-resource-selection.test.ts`    | 変更     | dynamic path で custom manifest IDs を検証                                            |
| 2026-03-30 | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve-resource-selection.test.ts` | 変更     | dynamic improve path で custom manifest IDs を検証                                    |
| 2026-03-30 | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`                       | 変更     | legacy path の manifest custom agent 解決テスト追加                                   |
| 2026-03-30 | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts`                    | 変更     | legacy path の manifest custom agent 解決テスト追加                                   |
| 2026-03-30 | `docs/30-workflows/.../phase-11-manual-test.md`                                                                 | 更新     | 非視覚 evidence task として current facts へ是正                                      |
| 2026-03-30 | `docs/30-workflows/.../phase-12-documentation.md`                                                               | 更新     | 6成果物・completed 状態へ是正                                                         |
| 2026-03-30 | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                                  | 更新     | TASK-P0-07 completed record を追加                                                    |
| 2026-03-30 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md`                     | 更新     | manifest phase resource selection の current contract を追記                          |
| 2026-03-30 | `.claude/skills/aiworkflow-requirements/LOGS.md`                                                                | 更新     | Phase 12 close-out sync を記録                                                        |
| 2026-03-30 | `.claude/skills/aiworkflow-requirements/SKILL.md`                                                               | 更新     | change history へ TASK-P0-07 sync を追記                                              |
| 2026-03-30 | `.claude/skills/task-specification-creator/LOGS.md`                                                             | 更新     | Phase 12 close-out hardening を記録                                                   |
| 2026-03-30 | `.claude/skills/task-specification-creator/SKILL.md`                                                            | 更新     | change history へ close-out guard を追記                                              |
| 2026-03-30 | `outputs/artifacts.json`                                                                                        | 新規     | root artifacts との同期用 inventory を追加                                            |

## validator / 実測コマンド

- `pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan-resource-selection.test.ts src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve-resource-selection.test.ts src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts src/main/services/runtime/__tests__/AgentNameResolver.test.ts src/main/services/runtime/__tests__/ManifestLoader.test.ts`
- `pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__`
- `pnpm --filter @repo/desktop exec eslint src/main/services/runtime src/main/ipc --ext .ts`
- `pnpm --filter @repo/desktop exec tsc --noEmit`
- planned-wording grep audit（0件）
- `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`

## artifacts 同期結果

| 項目                                         | 状態                     |
| -------------------------------------------- | ------------------------ |
| `index.md` / `phase-*.md` / `artifacts.json` | 同期済み                 |
| `artifacts.json` / `outputs/artifacts.json`  | 同期済み                 |
| Phase 11 evidence                            | current facts へ更新済み |
| Phase 12 必須6成果物                         | 生成済み                 |
| runtime 全体回帰 suite / lint                | 追補検証済み             |

## 変更理由

- manifest に custom agent ID を書いても runtime が固定 request ID を見続ける不整合を解消するため
- Phase 12 の local outputs 完了だけで completed 判定していた drift を解消するため
- canonical root / mirror / topic-map / completed ledger の same-wave sync を current facts へ戻すため
