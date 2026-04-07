# アーキテクチャ設計 - UT-SDK-07-APPROVAL-REQUEST-SURFACE-001

## 作成日: 2026-04-06

## Phase: 2

---

## レイヤー責務境界

```
[Main Process]
  approvalHandlers.ts
    └─ mainWindow.webContents.send(APPROVAL_REQUEST, payload)
          │
          ▼ IPC push (既存実装・変更不要)
[Preload Layer]
  skill-creator-api.ts
    ├─ SkillCreatorAPI interface に onApprovalRequest 追加 【変更】
    └─ skillCreatorAPI.onApprovalRequest(callback)  【変更】
         └─ safeOn(IPC_CHANNELS.APPROVAL_REQUEST, callback)
              │
              ▼ Renderer へコールバック転送
[Renderer Layer]
  SkillLifecyclePanel.tsx
    ├─ getSkillCreatorApi().onApprovalRequest(handler) 【接続】
    ├─ pendingApproval state 追加 【変更】
    ├─ ApprovalSheet 再利用（条件レンダリング） 【変更】
    │   ├─ operationType: normalizeApprovalOperationType(payload.operationType)
    │   ├─ description: payload.description
    │   ├─ destination: payload.destination
    │   ├─ aiServiceName: disclosureInfo?.aiServiceName ?? "AI"
    │   └─ externalDestinations: disclosureInfo?.externalDestinations ?? []
    └─ approve/reject → respondToApproval(sessionId, operationId, action)
```

---

## 設計判断

### 1. payload shape は local alias で閉じる

shared 型に逃がすと approval context 以外への影響が広がる。
`SkillLifecyclePanel.tsx` 内で inline type alias として閉じる。

```typescript
type ApprovalRequestPayload = {
  operationType: string;
  description: string;
  destination?: string;
  sessionId: string;
  operationId: string;
};
```

### 2. `SkillCreatorRuntimeApi` 型への追加が必要

`SkillLifecyclePanel.tsx` 内の `SkillCreatorRuntimeApi` local type に `onApprovalRequest` を追加する。

```typescript
onApprovalRequest?: (
  callback: (payload: ApprovalRequestPayload) => void,
) => () => void;
```

### 3. `normalizeApprovalOperationType` を SkillLifecyclePanel.tsx 内に定義

`ApprovalSheet.operationType` は `"dangerous_operation" | "external_send"` の union。
IPC payload の `operationType: string` を変換する関数を局所化する。

### 4. cleanup は useEffect return で保証

`useEffect` の return に unsubscribe 関数を渡す。
`getSkillCreatorApi()?.onApprovalRequest` が nil の場合は early return。

---

## 変更ファイル

| ファイルパス                                                         | 変更種別 | 変更概要                                    |
| -------------------------------------------------------------------- | -------- | ------------------------------------------- |
| `apps/desktop/src/preload/skill-creator-api.ts`                      | 修正     | interface + 実装に `onApprovalRequest` 追加 |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 修正     | approval request 購読・UI・cleanup          |

## 変更不要ファイル

| ファイルパス                                    | 理由                         |
| ----------------------------------------------- | ---------------------------- |
| `apps/desktop/src/preload/channels.ts`          | ALLOWED_ON_CHANNELS 登録済み |
| `packages/shared/src/ipc/channels.ts`           | APPROVAL_CHANNELS 定義済み   |
| `apps/desktop/src/main/ipc/approvalHandlers.ts` | Main 側変更不要              |
