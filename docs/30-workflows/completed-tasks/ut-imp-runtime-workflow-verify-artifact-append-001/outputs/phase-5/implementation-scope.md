# Phase 5 実装スコープ

## 変更対象

| 種別 | ファイル                                                                                                    | 変更内容                                                                             |
| ---- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| code | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                                      | `appendArtifact()` を追加し、`execute_result` / `verify_result` を append 戦略へ切替 |
| test | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`                       | failure append / repeated failure の回帰ケースを追加                                 |
| test | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.workflow-orchestration.test.ts` | facade snapshot の failure 読み出しケースを追加                                      |

## 実装判断

- append 対象は履歴性が必要な `execute_result` と `verify_result` のみに限定した
- `route_snapshot` / `plan_result` / `handoff_bundle` の既存挙動は変えていない
- public IPC / preload / shared types への変更は加えていない

## 完了判定

- `recordVerifyFailure()` が最新 state を更新しつつ `verify_result` を追加する
- repeated failure 後も古い artifact が消えない
- reader bridge である facade の責務は増えていない
