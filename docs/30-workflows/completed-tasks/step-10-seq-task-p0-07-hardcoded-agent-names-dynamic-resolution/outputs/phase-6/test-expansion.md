# Phase 6 成果物: テスト拡充結果

## 追加テストファイル

| ファイル                                                                                                       | 役割                                  |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.p0-07-dynamic-agent-names.test.ts` | improve fallback path の agent 名解決 |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan-resource-selection.test.ts`   | plan の custom manifest 解決          |
| `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorSourceResolver.test.ts`                          | root dedupe / manifest provenance     |
| `apps/desktop/src/main/services/runtime/__tests__/PhaseResourcePlanner.test.ts`                                | fallback 優先順位 / source_conflict   |

## テストケース一覧

| ID   | 対応AC | テストケース                                                                     | 結果 |
| ---- | ------ | -------------------------------------------------------------------------------- | ---- |
| TC-1 | AC-1   | fallback path で `IMPROVE_RESOURCE_REQUESTS` の agent id が `loadAgent()` に渡る | PASS |
| TC-2 | AC-3   | fallback path で reference kind は `loadAgent()` に渡らない                      | PASS |
| TC-3 | AC-4   | custom manifest の `plan` / `improve` resourceIds が system prompt に反映される  | PASS |
| TC-4 | AC-5   | 既存 RuntimeSkillCreatorFacade テストが PASS                                     | PASS |
| TC-5 | AC-6   | `loadAgent()` 回数が agent エントリ数と一致する                                  | PASS |
| TC-6 | AC-6   | `SkillCreatorSourceResolver` の同一 root dedupe                                  | PASS |

## 既存テストとの整合性

- `RuntimeSkillCreatorFacade` の関連 5 ファイル / 18 テスト PASS
- manifest 由来の custom resource id と default fallback の両方を確認済み
