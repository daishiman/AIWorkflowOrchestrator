# Phase 1: 参照箇所棚卸し結果

## タスクID: TASK-SC-SHARED-TYPE-PROMOTE-001

## 棚卸し結果

| ファイル                                                      | 行  | 用途                                            | 判定 |
| ------------------------------------------------------------- | --- | ----------------------------------------------- | ---- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | 36  | `interface StructurePlanJson` の定義            | PASS |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | 112 | `structurePlan` 変数の参照                      | PASS |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | 617 | `runCreateWorkflow()` の戻り値型                | PASS |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | 619 | `const structurePlan: StructurePlanJson` の生成 | PASS |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | 640 | `generateSkillMd()` の引数型                    | PASS |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | 657 | `generate_skill_md.js` 向け変換処理             | PASS |

## 判断結果

- 実装コード参照ファイル数: 1
- 実装コード内ヒット数: 6
- 昇格判断: ローカル定義維持・クローズ
- 理由: `StructurePlanJson` の参照は `SkillCreatorService.ts` の内部に閉じており、`apps/` / `packages/` の他ファイルから再利用されていないため、`@repo/shared/types` に昇格するコストが価値を上回る。

## 補足

- `docs/` と `.claude/` 内の言及は棚卸し対象外。
- 将来、他ファイルから同型を参照する場合のみ shared 昇格を再検討する。
