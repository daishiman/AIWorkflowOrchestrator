# Test Matrix

## Suite 一覧

| suite                                                       | 主対象           | 主要 assertion                                                           |
| ----------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------ |
| `SkillCreatorSourceResolver.test.ts`                        | source discovery | manifest / explicit / env / home / repo の優先順位で root を解決する     |
| `ResourceLoader.dynamic-resolution.test.ts`                 | resource loading | descriptor / absolute path / multi-root で required resource を読める    |
| `ContextBudgetManager.test.ts`                              | budget / degrade | tier ごとに drop 順と degrade reason が正しい                            |
| `RuntimeSkillCreatorFacade.plan-resource-selection.test.ts` | plan integration | fixed 3 agent 直読から planner 経由へ移っても public contract を崩さない |
| `creatorHandlers.resource-provenance.test.ts`               | IPC              | provenance snapshot が public failure/success envelope と矛盾しない      |

## Regression Cases

| ID    | ケース                               | 期待値                                                    |
| ----- | ------------------------------------ | --------------------------------------------------------- |
| RG-01 | manifest absolute path がある        | manifest resource を最優先で採択する                      |
| RG-02 | explicit path が manifest を補完する | explicit root を採択し provenance に残す                  |
| RG-03 | env root のみ存在                    | env root を採択し repo root へ落ちない                    |
| RG-04 | required resource が欠落             | `required_resource_missing` を返し silent fallback しない |
| RG-05 | optional reference が予算超過        | optional だけ drop して継続する                           |
| RG-06 | 同名 resource が複数 root にある     | selected root と suppressed roots を残す                  |
| RG-07 | structure mismatch                   | rejected roots と reason を残す                           |
| RG-08 | provenance hash が作れない           | `provenance_incomplete` warning を返す                    |
