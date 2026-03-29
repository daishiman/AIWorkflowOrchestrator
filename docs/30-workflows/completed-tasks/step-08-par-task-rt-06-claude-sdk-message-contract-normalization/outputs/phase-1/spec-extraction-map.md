# Phase 1 Spec Extraction Map

## 対象

- TASK-RT-06
- Claude Code SDK `query()` ストリーム
- Runtime Skill Creator lane

## 抽出した必須要件

| 要件                   | 内容                                                                            | 実装反映先                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| message 種別の吸収     | `system/init` / `assistant` / `result` / `error` を lane 契約へ正規化する       | `packages/shared/src/types/skillCreator.ts` / `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` |
| session 維持           | `session_id` / `sessionId` を実行結果へ保持する                                 | `RuntimeSkillCreatorExecuteResult`                                                                                  |
| result 情報維持        | `result.subtype` / stop reason を欠落なく保持する                               | `RuntimeSkillCreatorExecuteResult` / `SkillCreatorSdkEvent`                                                         |
| permission denial 維持 | permission denial 系情報を集約して保持する                                      | `SkillCreatorSdkEvent` / execute result                                                                             |
| provenance 維持        | `.claude/skills/skill-creator/` の source provenance を正規化イベントへ紐付ける | `SkillCreatorSdkEvent` / execute result                                                                             |
| 主線維持               | dynamic skill-creator 読込と `query()` 実行主線は変えない                       | `RuntimeSkillCreatorFacade` / `SkillExecutor`                                                                       |

## 非目標

- `query()` 呼び出し方式そのものの置換
- skill-creator の静的埋め込み
- permission policy 本体の追加実装
- session persistence UI の追加実装

## 実装修正対象

- `packages/shared/src/types/skillCreator.ts`
- `apps/desktop/src/main/services/skill/SkillExecutor.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`
- runtime / preload / renderer の関連テスト
