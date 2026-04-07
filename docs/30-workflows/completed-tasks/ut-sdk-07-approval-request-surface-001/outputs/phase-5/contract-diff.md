# 型・IPC 契約差分 - UT-SDK-07-APPROVAL-REQUEST-SURFACE-001

## 作成日: 2026-04-06

## Phase: 5

---

## `SkillCreatorAPI` 型変更

### Before

```typescript
// onApprovalRequest なし
respondToApproval: (...) => Promise<IpcResult<unknown>>;
getDisclosureInfo: () => Promise<IpcResult<unknown>>;
// ← ここで interface 終了
```

### After

```typescript
respondToApproval: (...) => Promise<IpcResult<unknown>>;
getDisclosureInfo: () => Promise<IpcResult<unknown>>;
// TASK-SDK-07 追加
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

---

## `SkillCreatorRuntimeApi` 型変更（SkillLifecyclePanel.tsx 内）

`onApprovalRequest?` / `respondToApproval?` フィールドを追加。
Local alias として閉じており、shared 型への変更はなし。

---

## IPC チャンネル差分

変更なし。`approval:request` チャンネルは既存の `ALLOWED_ON_CHANNELS` に登録済み。

---

## preload/index.ts との対称性確認

| 項目       | preload/index.ts（line 380〜388）                                      | skill-creator-api.ts（追加後）  |
| ---------- | ---------------------------------------------------------------------- | ------------------------------- |
| メソッド名 | `onApprovalRequest`                                                    | `onApprovalRequest`             |
| payload 型 | `{ operationType, description, destination?, sessionId, operationId }` | 同一                            |
| 戻り値     | `() => void`                                                           | `() => void`                    |
| チャンネル | `IPC_CHANNELS.APPROVAL_REQUEST`                                        | `IPC_CHANNELS.APPROVAL_REQUEST` |

**対称性: ✅ 確認済み（AC-06 PASS）**
