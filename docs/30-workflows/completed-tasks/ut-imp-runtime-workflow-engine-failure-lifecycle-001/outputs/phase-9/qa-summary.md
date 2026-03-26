# QA Summary

## 自動検証コマンド

```bash
pnpm --filter @repo/desktop typecheck
pnpm vitest run \
  apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts \
  apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.workflow-orchestration.test.ts \
  apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts \
  packages/shared/src/types/__tests__/skillCreator.contract-parity.test.ts
```

## 監査観点

- transition guard の stable error
- failure snapshot の一貫性
- review prompt payload の整合
- parent docs と artifact 戦略の一致
