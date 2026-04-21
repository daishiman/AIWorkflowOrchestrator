# Phase 4: Test Spec

## targeted verification

```bash
rg -n 'UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001|shouldShowMainToolBadge|MAIN_TOOL_BADGE_ENABLED' \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx

rg -n 'resolveExternalIntegration' \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx

git log --oneline -- apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx | sed -n '1,5p'
```

## 期待結果

- cleanup 対象 symbol は 0件
- `resolveExternalIntegration` は `toolNames` contract で利用される
- PR #2199 相当履歴が確認できる
