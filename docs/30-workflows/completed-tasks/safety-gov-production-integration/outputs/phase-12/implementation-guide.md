# Implementation Guide

## Part 1: まず何を直したか

この変更は、「承認が必要な仕組みの部品はあるのに、実際のアプリではまだ線がつながっていない」状態を直すものです。たとえると、受付、確認ボタン、連絡ベルは作ってあったのに、別の部屋につながっていなかったので実際には動かなかった、という状態でした。

今回の統合で、Main Process、Preload、Renderer の間に `execution` API の配線を通し、承認応答、開示情報取得、詳細ログ取得を同じ入口から呼べるようにそろえました。画面そのものを増やした変更ではないため、Phase 11 はスクリーンショット中心ではなく `NON_VISUAL` walkthrough を正本にします。

## Part 2: 技術詳細

### 追加・更新した API

```ts
export interface ExecutionAPI {
  getDisclosureInfo: () => Promise<{
    success: boolean;
    data?: unknown;
    error?: unknown;
  }>;
  getTerminalLog: (
    sessionId: string,
  ) => Promise<{ success: boolean; data?: string[]; error?: unknown }>;
  getCopyCommand: (
    sessionId: string,
  ) => Promise<{ success: boolean; data?: string | null; error?: unknown }>;
  respondApproval: (request: {
    sessionId: string;
    operationId: string;
    action: "approve" | "reject";
  }) => Promise<{ success: boolean; error?: unknown }>;
  onApprovalRequest: (
    callback: (payload: {
      operationType: string;
      description: string;
      destination?: string;
      sessionId: string;
      operationId: string;
    }) => void,
  ) => () => void;
}
```

### IPC シグネチャ

- `approval:respond`
- `approval:request`
- `execution:get-disclosure-info`
- `execution:get-terminal-log`
- `execution:get-copy-command`

### 使用例

```ts
const execution = window.electronAPI.execution;
const logResult = await execution.getTerminalLog(sessionId);

const unsubscribe = execution.onApprovalRequest((payload) => {
  console.log(payload.operationId, payload.destination);
});
```

### エラーハンドリングとエッジケース

- Main 側 handler は sender 検証と 3 段バリデーションを行う。
- `pushApprovalRequest()` は `window.isDestroyed()` / `webContents.isDestroyed()` を確認してから送信する。
- `destination` は `external_send` 時のみ入るため optional 扱いにする。
- `revokeAll(sessionId)` は Claude CLI の `sessionDestroyed` イベントから呼び出す。

### 設定・定数

| 項目            | 内容                                                                 |
| --------------- | -------------------------------------------------------------------- |
| invoke channels | `ALLOWED_INVOKE_CHANNELS` に4件追加                                  |
| on channels     | `ALLOWED_ON_CHANNELS` に `approval:request` を追加                   |
| cleanup hook    | `onSessionDestroyed` から `approvalGate.revokeAll(sessionId)` を呼ぶ |

### 参照

- `outputs/phase-12/implementation-guide-ipc.md`
- `outputs/phase-12/implementation-guide-renderer.md`
- `outputs/phase-11/manual-test-result.md`
