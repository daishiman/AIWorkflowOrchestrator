# Phase 1 タスク2: Preload API・Store 契約の確認

## 調査日: 2026-04-08

---

## planSkill シグネチャ

**ファイル**: `apps/desktop/src/preload/skill-creator-api.ts`

```typescript
planSkill: (prompt: string, authMode?: AuthMode, apiKey?: string | null) =>
  Promise<IpcResult<RuntimeSkillCreatorPlanResponse>>;
```

---

## executePlan シグネチャ

**ファイル**: `apps/desktop/src/preload/skill-creator-api.ts`

```typescript
executePlan: (
  planId: string,
  skillSpec: string, // 必須（optional ではない！C-1 回避）
  authMode?: AuthMode,
  apiKey?: string | null,
) => Promise<IpcResult<SkillCreatorExecutePlanAck>>;
```

**重要**: `skillSpec` は必須引数（optional ではない）。

---

## PlanResult 型

**ファイル**: `apps/desktop/src/renderer/store/slices/agentSlice.ts:35-41`

```typescript
export interface PlanResult {
  type: "integrated_api" | "terminal_handoff";
  planId?: string;
  estimatedSteps?: number;
  skillSpec?: string;
  guidance?: HandoffGuidance;
}
```

---

## Store hooks の export

**ファイル**: `apps/desktop/src/renderer/store/index.ts`

| hook                       | 用途                    |
| -------------------------- | ----------------------- |
| `useIsSkillGenerating`     | isGenerating state 読取 |
| `useSetIsSkillGenerating`  | isGenerating state 設定 |
| `useGenerationProgress`    | 進捗メッセージ読取      |
| `useSetGenerationProgress` | 進捗メッセージ設定      |
| `useGenerationError`       | エラーメッセージ読取    |
| `useSetGenerationError`    | エラーメッセージ設定    |
| `useCurrentPlanResult`     | PlanResult 読取         |
| `useSetCurrentPlanResult`  | PlanResult 設定         |
| `useCurrentPlanId`         | planId 読取             |
| `useSetCurrentPlanId`      | planId 設定             |
| `useClearGenerationState`  | 生成状態全クリア        |

---

## getSkillCreatorApi アクセスパターン（SkillLifecyclePanel 実装）

```typescript
// SkillLifecyclePanel.tsx L321-329
function getSkillCreatorApi(): SkillCreatorRuntimeApi | null {
  const runtimeWindow = window as Window & {
    electronAPI?: { skillCreator?: SkillCreatorRuntimeApi };
    skillCreatorAPI?: SkillCreatorRuntimeApi;
  };
  return (
    runtimeWindow.skillCreatorAPI ??
    runtimeWindow.electronAPI?.skillCreator ??
    null
  );
}
```

**重要**: テストは `window.skillCreatorAPI` をモックするため、このパターン踏襲が必須。

---

## SkillLifecyclePanel との差異

SkillLifecyclePanel の `SkillCreatorRuntimeApi` 型では `executePlan` の `skillSpec` が `optional` になっているが（実装上の都合）、Preload API では `skillSpec: string`（必須）。

SkillCreateWizard では C-1 回避のため **必ず `skillSpec: string`（必須）で定義**する。
