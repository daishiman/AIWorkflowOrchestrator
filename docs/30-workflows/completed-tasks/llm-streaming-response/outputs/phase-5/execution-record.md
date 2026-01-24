# Phase 5: Implementation (TDD Green) - 実行記録

## 実行日時

2026-01-23

## 実行者

Claude Code (Opus 4.5)

## 概要

Phase 4で作成したテストを通すための実装を行いました（TDD Green Phase）。
ストリーミング機能の全レイヤー（Backend → IPC → Preload → Store → UI）を実装しました。

## 実装タスク一覧

### Task 1: BaseLLMAdapter拡張 - AbortSignal対応 ✅

**変更ファイル:**

- `apps/desktop/src/main/adapters/llm/BaseLLMAdapter.ts`
- `apps/desktop/src/main/adapters/llm/types.ts`

**実装内容:**

1. `fetchSSE()` メソッドにオプショナルな `externalSignal` パラメータを追加
2. 外部AbortSignalとの連携ロジックを実装
3. finally句でのクリーンアップ処理を追加
4. `ILLMAdapter` インターフェースの `streamChat` メソッドシグネチャを更新

**コード変更（BaseLLMAdapter.ts）:**

```typescript
protected async *fetchSSE(
  url: string,
  options: RequestInit,
  externalSignal?: AbortSignal,
): AsyncGenerator<string> {
  const controller = new AbortController();

  // External signal linking
  const abortHandler = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener("abort", abortHandler);
    }
  }

  try {
    // ... SSE処理
  } finally {
    if (externalSignal) {
      externalSignal.removeEventListener("abort", abortHandler);
    }
  }
}
```

### Task 2: プロバイダーAdapter更新 ✅

**変更ファイル:**

- `apps/desktop/src/main/adapters/llm/OpenAIAdapter.ts`
- `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts`
- `apps/desktop/src/main/adapters/llm/GoogleAdapter.ts`
- `apps/desktop/src/main/adapters/llm/xAIAdapter.ts`

**実装内容:**
全4プロバイダーの `streamChat()` メソッドにオプショナルな `signal` パラメータを追加し、`fetchSSE()` に伝播。

### Task 3: IPCハンドラー拡張 ✅

**変更ファイル:**

- `apps/desktop/src/main/ipc/channels.ts`
- `apps/desktop/src/main/ipc/handlers/llm.ts`

**実装内容:**

1. `LLM_STREAM_CANCEL` チャンネルを追加
2. `activeStreams` Map（requestId → AbortController）を実装
3. `StreamChatResponse` インターフェースを定義
4. `handleStreamChat()` を更新:
   - UUID requestIdを生成
   - AbortControllerを作成してactiveStreamsに登録
   - safeSend()ヘルパーでisDestroyed()チェック
   - 入力検証とAPIキーチェック
   - アダプターにsignalを渡す
   - requestIdを返す
5. `handleStreamCancel()` 関数を新規作成

**コード変更（llm.ts）:**

```typescript
const activeStreams = new Map<string, AbortController>();

export interface StreamChatResponse {
  requestId: string;
}

export async function handleStreamChat(
  event: IpcMainInvokeEvent,
  request: LLMChatRequestInput,
): Promise<StreamChatResponse> {
  const requestId = randomUUID();
  const abortController = new AbortController();
  activeStreams.set(requestId, abortController);

  // ... 実装

  return { requestId };
}

export function handleStreamCancel(params: { requestId: string }): {
  success: boolean;
} {
  const controller = activeStreams.get(params.requestId);
  if (controller) {
    controller.abort();
    activeStreams.delete(params.requestId);
    return { success: true };
  }
  return { success: false };
}
```

### Task 4: Preload API拡張 ✅

**変更ファイル:**

- `apps/desktop/src/preload/index.ts`
- `apps/desktop/src/preload/types.ts`

**実装内容:**

1. `streamChat()` の戻り値を `{ requestId: string }` に変更
2. `cancelStream(requestId)` メソッドを追加
3. `onStreamEnd` コールバックシグネチャを更新
4. `ElectronAPI` インターフェースを更新

### Task 5: ChatSlice拡張 ✅

**変更ファイル:**

- `apps/desktop/src/renderer/store/slices/chatSlice.ts`

**実装内容:**

1. `StreamingError` インターフェースを定義
2. ストリーミング状態を追加:
   - `isStreaming: boolean`
   - `streamingContent: string`
   - `currentStreamId: string | null`
   - `streamingMessageId: string | null`
   - `streamingError: StreamingError | null`
3. ストリーミングアクションを実装:
   - `startStreaming(requestId)` - プレースホルダーメッセージ作成
   - `appendStreamChunk(content)` - コンテンツ追加
   - `endStreaming()` - ストリーミング完了
   - `cancelStreaming()` - キャンセル処理
   - `setStreamingError(error)` - エラー設定

### Task 6: UIコンポーネント実装 ✅

**作成ファイル:**

- `apps/desktop/src/renderer/components/chat/StreamingMessage.tsx`
- `apps/desktop/src/renderer/hooks/useStreamingChat.ts`

**StreamingMessage.tsx:**

- Props: `content`, `isStreaming`, `showCursor`, `onCancel`, `className`
- ARIA属性: `role="status"`, `aria-live="polite"`, `aria-busy`
- カーソルアニメーション（animate-pulse）
- キャンセルボタン

**useStreamingChat.ts:**

- IPCイベントリスナーのセットアップ
- `startStream()` / `cancelStream()` アクション
- 状態管理: `isStreaming`, `content`, `error`

## アーキテクチャ図

```
┌─────────────────────────────────────────────────────────────┐
│                         Renderer                             │
├─────────────────────────────────────────────────────────────┤
│  useStreamingChat Hook                                       │
│    ├── startStream(request) ──────────────────────┐         │
│    ├── cancelStream() ────────────────────────────┤         │
│    └── IPC listeners (chunk, end, error) ◄────────┤         │
│                                                    │         │
│  ChatSlice (Zustand)                              │         │
│    ├── isStreaming                                │         │
│    ├── streamingContent                           │         │
│    └── currentStreamId                            │         │
│                                                    │         │
│  StreamingMessage Component                       │         │
│    ├── content display                            │         │
│    ├── cursor animation                           │         │
│    └── cancel button                              │         │
└───────────────────────────────────────────────────┼─────────┘
                                                    │
                        Preload API                 │
                        (contextBridge)             │
                                                    │
┌───────────────────────────────────────────────────┼─────────┐
│                         Main Process              │         │
├───────────────────────────────────────────────────┼─────────┤
│  IPC Handlers                                     │         │
│    ├── llm:stream-chat ◄──────────────────────────┘         │
│    │     └── returns { requestId }                          │
│    ├── llm:stream-cancel                                    │
│    └── activeStreams Map<requestId, AbortController>        │
│                                                              │
│  LLMAdapterFactory                                          │
│    └── createAdapter(providerId)                            │
│                                                              │
│  Adapters (OpenAI, Anthropic, Google, xAI)                  │
│    └── streamChat(request, signal?)                         │
│          └── fetchSSE(url, options, signal)                 │
└─────────────────────────────────────────────────────────────┘
```

## キャンセルフロー

```
1. User clicks "Cancel" button
2. useStreamingChat.cancelStream() called
3. window.electronAPI.llm.cancelStream(requestId)
4. IPC: llm:stream-cancel handler
5. activeStreams.get(requestId).abort()
6. AbortSignal propagated to fetchSSE
7. Fetch aborted, generator throws
8. safeSend sends llm:stream-end
9. Renderer receives end event
10. ChatSlice.cancelStreaming() updates state
```

## テスト状況

Phase 4で作成されたテストファイル:

- `apps/desktop/src/main/adapters/llm/__tests__/streaming.test.ts`
- `apps/desktop/src/main/ipc/handlers/__tests__/llm-streaming.test.ts`
- `apps/desktop/src/renderer/components/chat/__tests__/StreamingMessage.test.tsx`
- `apps/desktop/src/renderer/hooks/__tests__/useStreamingChat.test.ts`

## 注意点・課題

1. **safeSend()の導入理由**: ストリーミング中にウィンドウが閉じられた場合のエラー防止
2. **activeStreams Map**: 複数同時ストリーミングをサポートするため
3. **UUID使用**: `crypto.randomUUID()` でrequestIdを生成
4. **メモリリーク防止**: finally句でactiveStreamsからの削除を確実に実行

## 次のフェーズ

Phase 6: Test Expansion（テスト拡張）

- 実装に基づいた追加テストケースの作成
- エッジケースのカバレッジ向上
