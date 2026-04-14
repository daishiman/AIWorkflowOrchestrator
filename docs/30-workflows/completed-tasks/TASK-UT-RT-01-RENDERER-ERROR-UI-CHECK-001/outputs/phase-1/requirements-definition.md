# Phase 1: 要件定義書

## 機能要件

### 対象コンポーネント

- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

### 検証対象の経路

```
IPC (onWorkflowStateChanged)
  └→ setWorkflowError(errorMessage)   [L634]
       └→ workflowError (Zustand store)
            └→ currentSurfaceError = localError ?? workflowError ?? skillError  [L1362]
                 └→ {currentSurfaceError && <div role="alert" data-testid="skill-lifecycle-error">}  [L1487-1495]
```

### 調査結果

#### SkillLifecyclePanel.tsx の実装確認

| 項目                                       | ファイル行 | 実装状況                     |
| ------------------------------------------ | ---------- | ---------------------------- |
| `onWorkflowStateChanged` コールバック      | L623-637   | 実装済み                     |
| `setWorkflowError(errorMessage)` 配線      | L634       | 実装済み                     |
| `currentSurfaceError` 定義                 | L1362      | 実装済み                     |
| `data-testid="skill-lifecycle-error"` 表示 | L1487-1495 | 実装済み                     |
| `applyWorkflowSnapshot` でのリセット       | L537-539   | 実装済み（handoff 時は保持） |

#### 現状コード（L623-637）

```typescript
useEffect(() => {
  const skillCreatorApi = getSkillCreatorApi();
  if (!skillCreatorApi?.onWorkflowStateChanged) {
    return;
  }

  return skillCreatorApi.onWorkflowStateChanged((snapshot, errorMessage) => {
    if (snapshot) {
      applyWorkflowSnapshot(snapshot);
    }
    if (errorMessage !== undefined) {
      setWorkflowError(errorMessage);
    }
  });
}, [applyWorkflowSnapshot]);
```

#### applyWorkflowSnapshot（L532-545）

```typescript
const applyWorkflowSnapshot = useCallback(
  (snapshot: SkillCreatorWorkflowUiSnapshot) => {
    setWorkflowSnapshot(snapshot);
    // handoff 時はエラーメッセージを保持する
    if (snapshot.currentPhase !== "handoff") {
      setWorkflowError(null); // ← Issue #1844 対応
    }
    if (snapshot.handoffBundle) {
      setHandoffGuidance(toHandoffGuidance(snapshot.handoffBundle));
    }
  },
  [setHandoffGuidance, setWorkflowError, setWorkflowSnapshot],
);
```

#### currentSurfaceError（L1362）

```typescript
const currentSurfaceError = localError ?? workflowError ?? skillError;
```

### 非機能要件

| 項目                 | 要件                                                      |
| -------------------- | --------------------------------------------------------- |
| テストフレームワーク | Vitest + @testing-library/react                           |
| モック方式           | `Object.defineProperty(window, "skillCreatorAPI", {...})` |
| 禁止事項             | `vi.stubGlobal("window", ...)` 使用禁止 [FB-VSCPKR-02]    |
| 実装変更スコープ     | Renderer 層のみ（Main 層・IPC ブリッジ変更禁止）          |
