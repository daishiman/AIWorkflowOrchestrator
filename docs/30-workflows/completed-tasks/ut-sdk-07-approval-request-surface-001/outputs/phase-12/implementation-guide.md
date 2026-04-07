# Implementation Guide: onApprovalRequest

## タスクID

UT-SDK-07-APPROVAL-REQUEST-SURFACE-001

---

## Part 1: 初学者向け説明

### たとえば…スマホの通知に例えると

たとえば、スマホアプリを使っているときに「このアプリが位置情報にアクセスしようとしています。許可しますか？」という通知が画面に表示されることがありますよね。

`onApprovalRequest` は、まさにこれと同じ仕組みです。

AIが「何か重要な操作（ファイルの書き込み・ネットワーク通信など）をしようとしています」という通知を、リアルタイムでデスクトップアプリの画面に届けるための仕組みです。

### なぜ必要か

AI が自律的に動作するとき、ユーザーが知らないうちに重要な操作が行われると困ります。そこで「今こういうことをしようとしています」をリアルタイムで画面に表示することで、透明性と安全性を確保します。

### 何をするか

1. メインプロセス（Electron バックエンド）が `approval:request` チャンネルでイベントを送信する
2. プリロードスクリプトが `onApprovalRequest` でそのイベントを受け取る
3. React コンポーネント（`SkillLifecyclePanel`）が画面に承認リクエストを表示する

---

## Part 2: 開発者向けリファレンス

### TypeScript 型定義

```typescript
// ApprovalRequestPayload（apps/desktop/src/preload/skill-creator-api.ts L48）
type ApprovalRequestPayload = {
  operationType: string; // 操作の種類（例: "file_write", "network_request"）
  description: string; // 人が読める説明文
  destination?: string; // 操作先（省略可能）
  sessionId: string; // セッション識別子
  operationId: string; // 操作識別子
};

// SkillCreatorAPI インターフェース（L378）
export interface SkillCreatorAPI {
  // ...
  onApprovalRequest: (
    callback: (payload: ApprovalRequestPayload) => void,
  ) => () => void; // 戻り値はアンサブスクライブ関数
}
```

### API シグネチャと使用例

```typescript
// preload 実装（safeOn 経由）
onApprovalRequest: (callback) =>
  safeOn<ApprovalRequestPayload>(IPC_CHANNELS.APPROVAL_REQUEST, callback);
```

```typescript
// React コンポーネント内での使用例
useEffect(() => {
  if (!skillCreatorApi?.onApprovalRequest) return;
  const unsubscribe = skillCreatorApi.onApprovalRequest((payload) => {
    setPendingApprovalRequest(payload);
  });
  return () => unsubscribe(); // アンマウント時に解除
}, [skillCreatorApi]);
```

### エラーハンドリングとエッジケース

| ケース                           | 挙動                                                                |
| -------------------------------- | ------------------------------------------------------------------- |
| `destination` が `undefined`     | UI で宛先表示をスキップ（条件付きレンダリング）                     |
| `skillCreatorApi` が `undefined` | `if (!skillCreatorApi?.onApprovalRequest) return;` でガード         |
| 複数回登録                       | 各 `onApprovalRequest` 呼び出しは独立したリスナーを返す             |
| アンサブスクライブ後のイベント   | コールバックは呼ばれない（`ipcRenderer.removeListener` で解除済み） |
| 新しいリクエストの受信           | `setPendingApprovalRequest(payload)` で state を上書き              |

### `IPC_CHANNELS.APPROVAL_REQUEST` と `ALLOWED_ON_CHANNELS` の関係

```typescript
// packages/shared/src/ipc/channels.ts
IPC_CHANNELS.APPROVAL_REQUEST = "approval:request"

// apps/desktop/src/preload/channels.ts
// ALLOWED_ON_CHANNELS に含まれていることで、safeOn が許可する
ALLOWED_ON_CHANNELS = [
  // ...
  IPC_CHANNELS.APPROVAL_REQUEST,  // L777
  // ...
]

// safeOn の guard
function safeOn<T>(channel: string, callback: ...) {
  if (!ALLOWED_ON_CHANNELS.includes(channel)) {
    throw new Error(`Channel not allowed: ${channel}`);
  }
  // ...
}
```

`ALLOWED_ON_CHANNELS` に `APPROVAL_REQUEST` が含まれていることで、セキュリティ上許可されたチャンネルのみがリスナー登録できる仕組みになっています。これにより、悪意あるコードが任意のチャンネルを購読することを防ぎます。

### Visual Validation

- Phase 11 の実施記録: `docs/30-workflows/ut-sdk-07-approval-request-surface-001/outputs/phase-11/manual-test-evidence.md`
