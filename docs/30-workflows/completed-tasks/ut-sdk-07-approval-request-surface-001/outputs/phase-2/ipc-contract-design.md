# IPC 契約設計 - UT-SDK-07-APPROVAL-REQUEST-SURFACE-001

## 作成日: 2026-04-06

## Phase: 2

---

## チャンネル確認

| 項目           | 値                                                                            |
| -------------- | ----------------------------------------------------------------------------- |
| チャンネル定数 | `IPC_CHANNELS.APPROVAL_REQUEST`                                               |
| チャンネル値   | `approval:request`                                                            |
| 定義元         | `packages/shared/src/ipc/channels.ts` の `APPROVAL_CHANNELS.APPROVAL_REQUEST` |
| allowlist 登録 | `apps/desktop/src/preload/channels.ts` line 777 ✅                            |

---

## `onApprovalRequest` 型契約

### `skill-creator-api.ts` interface 追加定義

```typescript
// TASK-SDK-07: approval:request push 購読
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

### `skillCreatorAPI` オブジェクト実装

```typescript
onApprovalRequest: (
  callback: (payload: {
    operationType: string;
    description: string;
    destination?: string;
    sessionId: string;
    operationId: string;
  }) => void,
): (() => void) =>
  safeOn<{
    operationType: string;
    description: string;
    destination?: string;
    sessionId: string;
    operationId: string;
  }>(
    IPC_CHANNELS.APPROVAL_REQUEST,
    callback,
  ),
```

---

## `preload/index.ts` との対称性確認

| 項目             | `preload/index.ts`                                                     | `skill-creator-api.ts` (追加後) |
| ---------------- | ---------------------------------------------------------------------- | ------------------------------- |
| メソッド名       | `onApprovalRequest`                                                    | `onApprovalRequest`             |
| callback payload | `{ operationType, description, destination?, sessionId, operationId }` | 同一                            |
| 戻り値           | `() => void` (unsubscribe)                                             | `() => void`                    |
| チャンネル       | `IPC_CHANNELS.APPROVAL_REQUEST`                                        | `IPC_CHANNELS.APPROVAL_REQUEST` |

→ 型シグネチャ対称 ✅

---

## `SkillCreatorRuntimeApi` local type への追加（SkillLifecyclePanel.tsx 内）

```typescript
type SkillCreatorRuntimeApi = {
  // 既存メソッド...
  // TASK-SDK-07: approval request 購読
  onApprovalRequest?: (
    callback: (payload: {
      operationType: string;
      description: string;
      destination?: string;
      sessionId: string;
      operationId: string;
    }) => void,
  ) => () => void;
  // ...
};
```
