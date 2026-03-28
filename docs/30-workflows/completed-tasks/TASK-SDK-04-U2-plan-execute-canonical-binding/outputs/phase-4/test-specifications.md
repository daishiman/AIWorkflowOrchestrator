# Phase 4: テスト仕様書

## テスト対象ファイル

`apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx`

## 新規テストケース

### 正常系

| ID   | シナリオ                          | AC         | 期待結果                                                                                                                                |
| ---- | --------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| U-8b | plan作成 → textarea変更 → execute | AC-1, AC-2 | executePlan の第2引数が plan 作成時の `approvedSkillSpec`（"承認済みの依頼"）であり、変更後の textarea 値（"改ざんされた依頼"）ではない |

### 失敗系

| ID        | シナリオ                                        | AC   | 期待結果                                                                           |
| --------- | ----------------------------------------------- | ---- | ---------------------------------------------------------------------------------- |
| (既存U-9) | cancel ボタンで clearGenerationState が呼ばれる | AC-3 | `handleCancelPlan` が `setApprovedSkillSpec(null)` + `clearGenerationState` を実行 |

### 回帰テスト

| ID         | シナリオ                                      | AC   | 期待結果                 |
| ---------- | --------------------------------------------- | ---- | ------------------------ |
| U-1〜U-7   | detectMode → planSkill フロー                 | AC-4 | 既存動作に変更なし       |
| U-8        | executePlan → fetchSkills → selectSkillByName | AC-4 | 既存動作に変更なし       |
| U-13       | terminal_handoff の早期リターン               | AC-4 | fetchSkills が呼ばれない |
| U-14〜U-15 | executePlan 失敗系                            | AC-4 | エラーハンドリング維持   |
| U-16〜U-17 | verify detail / reverify                      | AC-4 | 既存動作維持             |

## AC とテストの対応表

| AC   | テスト ID | 検証方法                                                             |
| ---- | --------- | -------------------------------------------------------------------- |
| AC-1 | U-8b      | executePlan の引数を `approvedSkillSpec` で検証                      |
| AC-2 | U-8b      | textarea 変更後も payload 不変を検証                                 |
| AC-3 | U-9       | cancel で clearGenerationState が呼ばれることを検証                  |
| AC-4 | U-1〜U-17 | 全既存テストの pass で回帰なしを検証                                 |
| AC-5 | typecheck | `executePlan(planId, skillSpec?, authMode?, apiKey?)` の型互換を検証 |

## Fail-First 観点

U-8b テストは、修正前のコード（`request.trim()` を使用）では必ず失敗する。修正後（`approvedSkillSpec ?? undefined` を使用）で pass に転じる。
