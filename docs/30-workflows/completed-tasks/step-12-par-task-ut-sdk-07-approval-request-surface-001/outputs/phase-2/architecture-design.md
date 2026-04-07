# Phase 2 成果物: アーキテクチャ設計書

## onApprovalRequest 型シグネチャ設計

### SkillCreatorAPI interface 追加定義

```typescript
/**
 * approval:request イベントを受信するリスナーを登録する (UT-SDK-07-APPROVAL-REQUEST-SURFACE-001)
 * @param callback - approval リクエスト受信時のコールバック
 * @returns クリーンアップ関数（removeListener 用）
 */
onApprovalRequest: (
  callback: (request: ApprovalRequestPayload) => void,
) => () => void;
```

### ApprovalRequestPayload 型定義（preload 内定義）

```typescript
// skill-creator-api.ts 内に定義（shared には追加しない）
export interface ApprovalRequestPayload {
  sessionId: string;
  operationId: string;
  operationType: string;
  description: string;
  destination?: string;
}
```

### 実装パターン（既存 safeOn を使用）

```typescript
onApprovalRequest: (
  callback: (request: ApprovalRequestPayload) => void,
): (() => void) =>
  safeOn<ApprovalRequestPayload>(IPC_CHANNELS.APPROVAL_REQUEST, callback),
```

- `safeOn` は `ALLOWED_ON_CHANNELS` にチャネルが含まれている場合のみ登録する（セキュリティ検証済み）
- `ipcRenderer.on` + `removeListener` でクリーンアップ関数を返す
- `ipcRenderer.once` ではなく `on` を使用（複数 approval request が来る可能性があるため）

---

## ApprovalRequestPanel コンポーネント設計

### 配置方針: 専用コンポーネント（推奨）

`ApprovalRequestPanel.tsx` を新規作成し、`SkillLifecyclePanel` から条件レンダリングする。

### UI 状態機械

```typescript
export interface ApprovalRequestPayload {
  sessionId: string;
  operationId: string;
  operationType: string;
  description: string;
  destination?: string;
}

interface ApprovalRequestPanelProps {
  request: ApprovalRequestPayload | null;
  onApprove: (sessionId: string, operationId: string) => Promise<void>;
  onReject: (sessionId: string, operationId: string) => Promise<void>;
}

// 内部状態
type ApprovalUIStatus = "pending" | "expired" | "resolving" | "resolved";
```

### UI 要素

| 要素                   | 表示条件                 | 内容                                       |
| ---------------------- | ------------------------ | ------------------------------------------ |
| 操作種別バッジ         | 常時（pending/expired）  | `operationType`                            |
| 説明文                 | 常時                     | `description`                              |
| 送信先                 | `destination` がある場合 | `destination`                              |
| TTL カウントダウン     | pending 状態             | `expiresAt` から残り秒数を計算（TTL 300s） |
| 承認ボタン             | pending 状態             | disabled=false                             |
| 拒否ボタン             | pending 状態             | disabled=false                             |
| 承認ボタン（disabled） | expired 状態             | disabled=true                              |
| 拒否ボタン（disabled） | expired 状態             | disabled=true                              |
| expired 警告           | expired 状態             | "この承認リクエストは期限切れです"         |

### TTL カウントダウン設計

```typescript
// request が来た時刻 + APPROVAL_TTL_MS（300 * 1000）で期限を計算
const APPROVAL_TTL_MS = 300 * 1000;

// コンポーネント内で requestedAt を記録し setInterval で残り時間を計算
// request が null → null（idle）
// 残り時間 > 0 → pending
// 残り時間 <= 0 → expired（ボタン無効化）
```

**注意**: Main 側の ApprovalGate は `grantedAt`（grantApproval 呼び出し時）を TTL 起点にするが、
Renderer は request を受信した時刻を起点に 300s でカウントする（送信遅延を保守的に扱う）。

---

## SkillLifecyclePanel 統合設計

### state 追加

```typescript
// approval request state
const [approvalRequest, setApprovalRequest] =
  useState<ApprovalRequestPayload | null>(null);
```

### onApprovalRequest listener 登録（useEffect）

```typescript
useEffect(() => {
  const skillCreatorApi = getSkillCreatorApi();
  if (!skillCreatorApi?.onApprovalRequest) return;

  return skillCreatorApi.onApprovalRequest((request) => {
    setApprovalRequest(request);
  });
}, []);
```

### approve/reject ハンドラ

```typescript
const handleApprovalApprove = async (
  sessionId: string,
  operationId: string,
) => {
  const skillCreatorApi = getSkillCreatorApi();
  if (!skillCreatorApi?.respondToApproval) return;
  await skillCreatorApi.respondToApproval(sessionId, operationId, "approve");
  setApprovalRequest(null);
};

const handleApprovalReject = async (sessionId: string, operationId: string) => {
  const skillCreatorApi = getSkillCreatorApi();
  if (!skillCreatorApi?.respondToApproval) return;
  await skillCreatorApi.respondToApproval(sessionId, operationId, "reject");
  setApprovalRequest(null);
};
```

### JSX 条件レンダリング（エラー表示の直後に配置）

```tsx
{
  approvalRequest ? (
    <ApprovalRequestPanel
      request={approvalRequest}
      onApprove={handleApprovalApprove}
      onReject={handleApprovalReject}
    />
  ) : null;
}
```

---

## IPC 4層整合性チェック

| 層                  | ファイル                                        | 状態        | アクション                          |
| ------------------- | ----------------------------------------------- | ----------- | ----------------------------------- |
| チャネル定数        | `apps/desktop/src/preload/channels.ts`          | 済（行412） | 変更なし                            |
| ALLOWED_ON_CHANNELS | `apps/desktop/src/preload/channels.ts`          | 済（行777） | 変更なし                            |
| Preload API         | `apps/desktop/src/preload/skill-creator-api.ts` | **未実装**  | `onApprovalRequest` 追加            |
| 型定義              | preload 内                                      | **未定義**  | `ApprovalRequestPayload` 定義を追加 |

Main 側 (`approvalHandlers.ts`) は変更なし。

---

## 完了確認

- [x] `onApprovalRequest` の型シグネチャが確定している
- [x] `ApprovalRequestPayload` 型の定義箇所と構造が確定している
- [x] approval UI コンポーネントの配置方針（専用コンポーネント）が確定している
- [x] TTL expired 時の UI 動作設計が確定している
- [x] `respondToApproval()` との接続方式が設計されている
- [x] IPC 4層整合性チェックが完了している
- [x] 本Phase内の全タスクを100%実行完了
