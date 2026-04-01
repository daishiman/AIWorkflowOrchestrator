# Phase 4: テスト計画（RED phase 固定）

## TASK-P0-07 テストケース

| ID      | シナリオ                                                         | 期待結果                                                                   | テストファイル                           | 状態         |
| ------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------- | ------------ |
| T-P7-01 | `plan()` が `PLAN_RESOURCE_REQUESTS` の agent エントリを読み込む | `discover-problem` / `design-workflow` / `plan-structure` が順番に読まれる | `RuntimeSkillCreatorFacade.plan.test.ts` | 既存         |
| T-P7-02 | reference エントリが agent 名導出に混入しない                    | `loadAgent("overview")` が呼ばれない                                       | `RuntimeSkillCreatorFacade.plan.test.ts` | **新規追加** |
| T-P7-03 | fallback path が current source of truth と一致                  | prompt に同じ agent セットが入る                                           | `RuntimeSkillCreatorFacade.plan.test.ts` | 既存         |
| T-P7-04 | `AGENT_NAMES` 残留参照の検出                                     | `loadAgent` の呼び出し順が `PLAN_RESOURCE_REQUESTS` の agent id 順と一致   | `RuntimeSkillCreatorFacade.plan.test.ts` | **新規追加** |

## TASK-SDK-04-U2 テストケース

| ID              | シナリオ                                           | 期待結果                                | テストファイル                                | 状態 |
| --------------- | -------------------------------------------------- | --------------------------------------- | --------------------------------------------- | ---- |
| T-S4-01 / U-8b  | plan 後 textarea を編集しても execute payload 不変 | `executePlan` に承認時 spec が渡される  | `SkillLifecyclePanel.llm-generation.test.tsx` | 既存 |
| T-S4-02 / U-20b | cancel で snapshot が null になる                  | `clearGenerationState` が呼ばれる       | 既存                                          |
| T-S4-03 / U-19b | 複数回 textarea 編集後も approved snapshot が固定  | `executePlan` に最初の spec が渡される  | 既存                                          |
| T-S4-04 / U-21  | execute 失敗後も approved snapshot が保持される    | 2回目の execute も同じ spec で呼ばれる  | 既存                                          |
| U-18b           | cancel → 再 plan で新しい snapshot に差し替わる    | `executePlan` に2回目の spec が渡される | 既存                                          |

## テストファイル競合確認

- `RuntimeSkillCreatorFacade.plan.test.ts` と `SkillLifecyclePanel.llm-generation.test.tsx` は独立ファイル
- 共有モジュールはなく並列実行で競合しない
