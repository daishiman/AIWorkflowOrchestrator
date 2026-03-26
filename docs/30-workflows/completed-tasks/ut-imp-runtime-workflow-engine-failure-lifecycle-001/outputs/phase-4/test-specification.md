# Test Specification

## 追加テスト

| ファイル                                                   | ケース                                                             |
| ---------------------------------------------------------- | ------------------------------------------------------------------ |
| `SkillCreatorWorkflowEngine.test.ts`                       | `success:false`、verify review、invalid transition、append history |
| `RuntimeSkillCreatorFacade.workflow-orchestration.test.ts` | `success:false`、executor reject                                   |

## 実行コマンド

```bash
ESBUILD_BINARY_PATH=$PWD/node_modules/.pnpm/esbuild@0.21.5/node_modules/esbuild/bin/esbuild \
pnpm vitest run \
  apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts \
  apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.workflow-orchestration.test.ts \
  apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts
```
