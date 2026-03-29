# Phase 4: テストマトリクス

## 基本テストケース

| TC    | 対象            | 条件                  | 期待結果                                                      | AC         | テストファイル                         |
| ----- | --------------- | --------------------- | ------------------------------------------------------------- | ---------- | -------------------------------------- |
| TC-01 | plan            | `llmAdapter` 未注入   | `{success:false, error:{code:"llm_adapter_unavailable"}}`     | AC-1       | Facade.test.ts, plan.test.ts           |
| TC-02 | plan            | `resourceLoader` 不足 | `{success:false, error:{code:"resource_loader_unavailable"}}` | AC-1       | plan.test.ts                           |
| TC-03 | improve         | `llmAdapter` 未注入   | `{success:false, error:{code:"llm_adapter_unavailable"}}`     | AC-3       | Facade.test.ts, improve.test.ts (E-10) |
| TC-04 | IPC             | plan logical error    | outer `success:true`, `data.success:false`                    | AC-5       | creatorHandlers.test.ts (既存パターン) |
| TC-05 | IPC             | validation failure    | outer `success:false`                                         | AC-5       | creatorHandlers.test.ts (既存パターン) |
| TC-06 | renderer        | plan logical error    | error message 表示、execute CTA 無効                          | AC-2, AC-6 | SkillLifecyclePanel, SkillCreateWizard |
| TC-07 | renderer        | unknown reason code   | fallback message を表示                                       | AC-6       | Phase 6 で追加                         |
| TC-08 | plan 正常系     | runtime 初期化済み    | 既存成功 shape 維持                                           | AC-7       | plan.test.ts (LLM 呼び出し検証)        |
| TC-09 | improve handoff | `terminal_handoff`    | 既存 union 維持                                               | AC-7       | improve.test.ts (E-12)                 |

## 更新済みテスト

| ファイル                                    | 変更内容                                                          |
| ------------------------------------------- | ----------------------------------------------------------------- |
| `RuntimeSkillCreatorFacade.test.ts`         | TC-2, integrated_api plan, authKey plan → explicit error 期待     |
| `RuntimeSkillCreatorFacade.plan.test.ts`    | Graceful degradation → explicit error + resourceLoader テスト追加 |
| `RuntimeSkillCreatorFacade.improve.test.ts` | E-10, E-11 → explicit error 期待                                  |

## テスト結果

- plan.test.ts: 30 passed
- improve.test.ts: 12 passed (E-10, E-11 更新済み)
- Facade.test.ts: 20 passed, 2 failed (execute 系 pre-existing)
