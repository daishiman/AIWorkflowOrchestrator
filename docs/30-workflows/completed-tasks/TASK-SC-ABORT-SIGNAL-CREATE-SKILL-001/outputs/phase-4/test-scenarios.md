# Phase 4: テストシナリオ

## テストケース一覧

| ID    | 種別    | 対象                       | 内容                                              | 期待結果                          |
| ----- | ------- | -------------------------- | ------------------------------------------------- | --------------------------------- |
| TC-01 | public  | `createSkill()`            | `cancelCurrentOperation()` 後に AbortError が返る | ✅ 既存 TC-05 が対応              |
| TC-02 | public  | `createSkill()`            | create / orchestrate / collaborative 正常系非回帰 | ✅ 既存 SC-001〜が対応            |
| TC-03 | private | `runOrchestrateWorkflow()` | abort 済み signal で即時 AbortError               | 🔴 Red（実装前）→ Green（実装後） |
| TC-04 | private | `runCreateWorkflow()`      | abort 済み signal で即時 AbortError               | 🔴 Red（実装前）→ Green（実装後） |

## 追記方針

- `SkillCreatorService-cancel.test.ts` に TC-03 / TC-04 を describe ブロックとして追記
- private メソッドは `service as unknown as { methodName(...): ... }` でアクセス
- `vi.spyOn` / `jest.spyOn` は使用しない

## Red 期待値

- TC-03: 現状の `_signal` 未使用のため、abort 済みシグナルを渡しても throw しない → テスト FAIL
- TC-04: 現状の `_signal` 未使用のため、abort 済みシグナルを渡しても throw しない → テスト FAIL
