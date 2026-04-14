# Phase 1: 調査メモ

## 調査対象

### SkillLifecyclePanel.tsx

**エラー表示経路の実装確認結果:**

1. `onWorkflowStateChanged` コールバック（L623-637）: **実装済み**
   - `snapshot` が truthy なら `applyWorkflowSnapshot(snapshot)` を呼ぶ
   - `errorMessage !== undefined` なら `setWorkflowError(errorMessage)` を呼ぶ

2. `currentSurfaceError` 定義（L1362）: **実装済み**

   ```typescript
   const currentSurfaceError = localError ?? workflowError ?? skillError;
   ```

3. エラー表示 DOM（L1487-1495）: **実装済み**

   ```typescript
   {currentSurfaceError ? (
     <div
       role="alert"
       data-testid="skill-lifecycle-error"
       className="..."
     >
       {currentSurfaceError}
     </div>
   ) : null}
   ```

4. `applyWorkflowSnapshot` のリセット（L537-539）: **実装済み（Issue #1844 修正済み）**
   - `snapshot.currentPhase !== "handoff"` のときのみ `setWorkflowError(null)` を呼ぶ

## タスク分類

| 分類               | 判断                                      |
| ------------------ | ----------------------------------------- |
| 実装変更が必要か   | NO - 既存実装は正常に動作している         |
| テスト作成が必要か | YES - E2E 証跡が未存在                    |
| 主な作業           | `SkillLifecyclePanel.test.tsx` の新規作成 |

## Zustand Store 確認

- `useWorkflowError` / `useSetWorkflowError`: `apps/desktop/src/renderer/store/index.ts` L887-894 に存在
- `workflowError` は `persist` の `partialize` 対象外 → テスト間で状態リークしない
- `useAppStore.setState({workflowError: null})` でリセット可能

## window.skillCreatorAPI の実装確認

`getSkillCreatorApi()` (L321-332):

```typescript
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

テストでは `window.skillCreatorAPI` を `Object.defineProperty` でモックすれば OK。
