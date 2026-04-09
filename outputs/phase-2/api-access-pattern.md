# Phase 2 タスク4: getSkillCreatorApi アクセスパターン設計

## 設計方針

SkillLifecyclePanel の実装パターンを踏襲する。

## getSkillCreatorApi 実装

```typescript
// SkillCreateWizard.tsx 内に定義
type SkillCreatorRuntimeApi = {
  planSkill?: (
    prompt: string,
    authMode?: string,
    apiKey?: string,
  ) => Promise<{ success: boolean; data?: PlanResult; error?: string }>;
  executePlan?: (
    planId: string,
    skillSpec: string, // 必須（C-1 回避）
    authMode?: string,
    apiKey?: string,
  ) => Promise<{ success: boolean; data?: unknown; error?: string }>;
  getWorkflowState?: (
    planId: string,
  ) => Promise<{ success: boolean; data?: unknown; error?: string }>;
};

function getSkillCreatorApi(): SkillCreatorRuntimeApi {
  const runtimeWindow = window as Window & {
    skillCreatorAPI?: SkillCreatorRuntimeApi;
    electronAPI?: { skillCreator?: SkillCreatorRuntimeApi };
  };
  return (
    runtimeWindow.skillCreatorAPI ??
    runtimeWindow.electronAPI?.skillCreator ??
    {}
  );
}
```

**重要**: `window.skillCreatorAPI` を優先し、`electronAPI.skillCreator` をフォールバックにする。テストは `window.skillCreatorAPI` をモックするため、このパターンが必須。
