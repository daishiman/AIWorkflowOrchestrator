# Phase 2 成果物: 設計確定サマリー

## タスク識別子

UT-SDK-07-APPROVAL-REQUEST-SURFACE-001

## 設計確定内容

### 1. `SkillCreatorAPI` インターフェース追加設計

`apps/desktop/src/preload/skill-creator-api.ts` の `getDisclosureInfo` の直後に以下を追加する。

**インターフェース追加シグネチャ:**

```typescript
// SkillCreatorAPI インターフェースへの追加（skill-creator-api.ts）
// --- TASK-SDK-07: approval:request surface 追加 ---
/**
 * approval:request channel 経由で承認リクエストを受信する (AC-1: push 購読)
 */
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

### 2. 実装オブジェクト追加設計

`safeOn(IPC_CHANNELS.APPROVAL_REQUEST, callback)` 経由で購読する実装を追加する。

**実装オブジェクト追加コード:**

```typescript
// skill-creator-api.ts 実装オブジェクトへの追加
// --- TASK-SDK-07: approval:request surface 追加 ---
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
  }>(IPC_CHANNELS.APPROVAL_REQUEST, callback),
```

**配置先**: `apps/desktop/src/preload/skill-creator-api.ts` の `getDisclosureInfo` の直後（行661〜676 付近）

### 3. `SkillLifecyclePanel.tsx` state / 購読 / UI 設計

#### State 設計

既存の `disclosureInfo` state の直後に approval request state を追加する。

```typescript
// 既存の disclosureInfo state の直後に追加
// TASK-SDK-07: approval request state
const [pendingApprovalRequest, setPendingApprovalRequest] = useState<{
  operationType: string;
  description: string;
  destination?: string;
  sessionId: string;
  operationId: string;
} | null>(null);
```

#### 購読設計

useEffect 内で購読し、アンマウント時に解除する。

```typescript
// useEffect 内での購読（既存 disclosure fetch の近傍に追加）
// TASK-SDK-07: approval:request surface 接続
useEffect(() => {
  const unsubscribe = window.electronAPI.skillCreator.onApprovalRequest(
    (payload) => {
      setPendingApprovalRequest(payload);
    },
  );
  return unsubscribe;
}, []);
```

#### UI 設計方針

- `disclosureInfo` の `data-testid="skill-lifecycle-disclosure-summary"` と対称な構造
- `data-testid="skill-lifecycle-approval-request"` を付与
- approval request が存在する場合のみ表示（disclosure サマリーと同水準）
- `sessionId` / `operationId` / `operationType` / `description` を表示

### 4. 型整合性確認

| 確認項目                                                      | 状態     | 詳細                                     |
| ------------------------------------------------------------- | -------- | ---------------------------------------- |
| `SkillCreatorAPI` インターフェースと実装オブジェクトの型一致  | 確認済み | 同一ペイロード型を使用                   |
| `ExecutionAPI.onApprovalRequest` との互換性                   | 確認済み | `preload/types.ts` 行1038 の型定義と互換 |
| `IPC_CHANNELS.APPROVAL_REQUEST` の `ALLOWED_ON_CHANNELS` 登録 | 確認済み | `channels.ts` 行777 に登録済み           |

## 参照資料

| 参照資料                       | パス                                                                       | 内容                                                 |
| ------------------------------ | -------------------------------------------------------------------------- | ---------------------------------------------------- |
| ExecutionAPI 型定義            | `apps/desktop/src/preload/types.ts` 行1038                                 | `onApprovalRequest` 型の参照元                       |
| skill-creator-api.ts 末尾      | `apps/desktop/src/preload/skill-creator-api.ts` 行661〜676                 | `respondToApproval`/`getDisclosureInfo` 追加済み箇所 |
| safeOn 実装                    | `apps/desktop/src/preload/skill-creator-api.ts` 行405〜                    | 購読ヘルパーパターン                                 |
| SkillLifecyclePanel disclosure | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` 行489 | disclosureInfo state パターン                        |
