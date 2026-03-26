# Phase 6 テスト拡張サマリー

## 追加した回帰観点

| 対象        | 追加内容                                                             | 目的                                |
| ----------- | -------------------------------------------------------------------- | ----------------------------------- |
| engine test | failure 後の `verify_result` 件数と payload parity を検証            | AC-01 / AC-02 を固定する            |
| engine test | repeated failure で `execute_result=2件`、`verify_result=4件` を検証 | upsert 回帰を防ぐ                   |
| facade test | snapshot から failure `verify_result` を読めることを検証             | AC-03 を read bridge 観点で固定する |

## 実行コマンド

```bash
ESBUILD_BINARY_PATH="$PWD/node_modules/.pnpm/esbuild@0.21.5/node_modules/esbuild/bin/esbuild" \
  pnpm exec vitest run \
  apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts \
  apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.workflow-orchestration.test.ts
```
