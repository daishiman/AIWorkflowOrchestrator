# Phase 5: 実装サマリー

## タスク5-1: `skill-creator-api.ts` 変更

**ファイルパス**: `apps/desktop/src/preload/skill-creator-api.ts`

### 追加内容

#### インターフェース (`SkillCreatorAPI` 型) への追加

`getDisclosureInfo` の直後に `onApprovalRequest` を追加:

```typescript
// --- TASK-SDK-07: approval:request surface 追加 ---
onApprovalRequest: (
  callback: (payload: {
    operationType: string;
    description: string;
    destination?: string;
    sessionId: string;
    operationId: string;
  }) => void,
) => () => void;
```

#### 実装オブジェクト (`skillCreatorAPI`) への追加

`getDisclosureInfo` 実装の直後に追加:

```typescript
onApprovalRequest: (callback) => safeOn<{...}>(IPC_CHANNELS.APPROVAL_REQUEST, callback),
```

`safeOn` を使用して `APPROVAL_REQUEST` チャンネルを購読し、アンサブスクライブ関数を返す実装。

---

## タスク5-2: `SkillLifecyclePanel.tsx` 変更

**ファイルパス**: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

### 追加箇所 1: `SkillCreatorRuntimeApi` 型拡張

`getDisclosureInfo?` の直後に `onApprovalRequest?` を追加:

```typescript
onApprovalRequest?: (callback: (payload: {...}) => void) => () => void;
```

### 追加箇所 2: state 追加

`disclosureInfo` state の直後に `pendingApprovalRequest` state を追加:

```typescript
const [pendingApprovalRequest, setPendingApprovalRequest] = useState<{...} | null>(null);
```

### 追加箇所 3: useEffect 追加

`fetchDisclosureInfo` 関数定義の後、`processWorkflowOutcome` の前に useEffect を追加:

```typescript
useEffect(() => {
  const skillCreatorApi = getSkillCreatorApi();
  if (!skillCreatorApi?.onApprovalRequest) return;
  const unsubscribe = skillCreatorApi.onApprovalRequest((payload) => {
    setPendingApprovalRequest(payload);
  });
  return unsubscribe;
}, []);
```

### 追加箇所 4: UI 追加（3箇所）

以下の3箇所に `data-testid="skill-lifecycle-approval-request"` の UI を挿入:

1. トップレベル（常時表示 - `currentSurfaceError` 直後）
2. `workflowSnapshot` 内の disclosure summary 直後
3. `!workflowSnapshot && handoffGuidance` ブロック内の disclosure summary 直後

トップレベルの配置により、`workflowSnapshot` や `handoffGuidance` の有無に関わらず approval request が常に表示される。
