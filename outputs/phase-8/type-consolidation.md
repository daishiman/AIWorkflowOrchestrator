# Phase 8 タスク2: 型共通化記録

## 方針: 共通化しない

### 理由

`SkillCreatorRuntimeApi` 型は SkillLifecyclePanel と SkillCreateWizard で意図的に異なる定義を持つ:

- SkillLifecyclePanel: `executePlan` の `skillSpec` が optional（既存実装の互換性維持）
- SkillCreateWizard: `executePlan` の `skillSpec` が required（C-1 回避）

共通化すると TASK-SC-06 の C-1 回避策（Preload API の必須引数 skillSpec を optional にしないという制約）が崩れるリスクがある。

## 記録

SkillCreateWizard.tsx の `SkillCreatorRuntimeApi` 型は以下を維持:

```typescript
type SkillCreatorRuntimeApi = {
  planSkill?: (...) => Promise<...>;
  executePlan?: (
    planId: string,
    skillSpec: string,  // C-1 回避: 必須
    ...
  ) => Promise<...>;
  getWorkflowState?: (...) => Promise<...>;
};
```
