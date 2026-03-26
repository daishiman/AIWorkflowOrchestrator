# Phase 4 テストマトリクス

| ID       | 対象              | ケース                    | 期待値                                                                                                                 |
| -------- | ----------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| TC-04-01 | engine            | verify fail append        | `recordVerifyFailure()` 後に `verify_result` artifact が2件になり、最新 payload が `state.verifyResult` と一致する     |
| TC-04-02 | facade            | failure artifact 読み出し | facade snapshot から `verify_result` 2件を確認できる                                                                   |
| TC-04-03 | engine            | repeated failure          | 2回目実行後に `execute_result=2件`、`verify_result=4件` になる                                                         |
| TC-04-04 | non-visual manual | artifact 順序確認         | `route_snapshot -> plan_result -> route_snapshot -> execute_result -> verify_result -> verify_result ...` の順序を保つ |

## 実行コマンド

```bash
ESBUILD_BINARY_PATH="$PWD/node_modules/.pnpm/esbuild@0.21.5/node_modules/esbuild/bin/esbuild" \
  pnpm exec vitest run \
  apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts \
  apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.workflow-orchestration.test.ts
```
