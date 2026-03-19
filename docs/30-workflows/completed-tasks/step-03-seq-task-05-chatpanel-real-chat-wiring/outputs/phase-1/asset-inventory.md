# Phase 1: アセットインベントリ

## P50チェック結果

### 既存実装状態のサマリー

**ChatPanel.tsx の現状（プレースホルダー状態）:**

`ChatPanel.tsx` は以下の3箇所にプレースホルダー `<div>` が存在し、実際のAIチャット機能は一切配線されていない。

- L95: `<div data-testid="model-selector-slot" />` - ModelSelector未接続
- L124: `<div data-testid="message-list-slot" />` - MessageList未接続
- L141: `<div data-testid="chat-input-slot" />` - ChatInput未接続

**バックエンド実装状態（実装済み・未接続）:**

| 層                                        | 実装状態                                                            |
| ----------------------------------------- | ------------------------------------------------------------------- |
| Main Process ハンドラ (`handlers/llm.ts`) | 完全実装済み（streamChat / sendChat / cancelStream / getProviders） |
| Preload IPC ブリッジ (`preload/index.ts`) | 完全実装済み（`window.electronAPI.llm.*` 全メソッド）               |
| useStreamingChat フック                   | 完全実装済み（179行、ChatPanelへの接続なし）                        |
| ChatSlice (Zustand)                       | 完全実装済み（streaming状態管理一式）                               |
| LLMSlice (Zustand)                        | 完全実装済み（provider/model選択・fetchProviders等）                |

**P50判定:** バックエンド（Main Process）・IPC・フック・ストアはすべて実装済みだが、ChatPanelへの配線が存在しない。`useStreamingChat` を ChatPanel に接続し、3つのプレースホルダーを実コンポーネントに置き換えることで機能完成する。

---

## プレースホルダー特定

### 1. model-selector-slot（行95）

```tsx
{
  /* ModelSelector placeholder - existing component */
}
<div data-testid="model-selector-slot" />;
```

- **場所:** `ChatPanel.tsx` L95
- **親要素:** ヘッダー `<div role="toolbar" aria-label="チャット設定" data-testid="chat-header">` の内部（L88-L115）
- **周辺コンテキスト:** `SkillSelector` コンポーネントの直前。`LLMSlice` に `selectedProviderId` / `selectedModelId` / `providers` が実装済みであり、LLMセレクターコンポーネントを配置するスロット。

### 2. message-list-slot（行124）

```tsx
{
  /* MessageList placeholder - existing component */
}
<div data-testid="message-list-slot" />;
```

- **場所:** `ChatPanel.tsx` L124
- **親要素:** メッセージエリア `<div className="flex-1 overflow-y-auto" data-testid="message-area">` 内の条件分岐ブロック（`showSkillManagement` が false の場合の `<>` フラグメント内）
- **周辺コンテキスト:** 直後に `SkillStreamingView`（スキル実行中のみ表示）が存在。`ChatSlice` の `chatMessages` 配列と `isStreaming` / `streamingContent` を受け取るメッセージリストを配置するスロット。

### 3. chat-input-slot（行141）

```tsx
{
  /* ChatInput placeholder - existing component */
}
<div data-testid="chat-input-slot" />;
```

- **場所:** `ChatPanel.tsx` L141
- **親要素:** 入力エリア `<div data-testid="input-area">` の内部（L139-L143）
- **周辺コンテキスト:** パネル最下部の固定入力エリア。`ChatSlice` の `sendMessage` / `startStreaming` アクションを呼び出し、`chatInput` と `isSending` / `isStreaming` 状態を利用するチャット入力コンポーネントを配置するスロット。

---

## 再利用可能資産一覧

| アセット               | パス                                                             | 行数     | 接続状態                       | 再利用方針                                                                                                                                      |
| ---------------------- | ---------------------------------------------------------------- | -------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| useStreamingChat       | `apps/desktop/src/renderer/hooks/useStreamingChat.ts`            | 179行    | ChatPanel未接続                | ChatPanelに接続してstartStream/cancelStreamを利用                                                                                               |
| StreamingMessage       | `apps/desktop/src/renderer/components/chat/StreamingMessage.tsx` | 83行     | ChatPanel未接続                | ChatMessageList内のストリーミングメッセージ表示に使用                                                                                           |
| llm.ts (handlers)      | `apps/desktop/src/main/handlers/llm.ts`                          | 441行    | IPC経由で待機中                | 既存IPC維持（変更不要）                                                                                                                         |
| buildMessages          | `apps/desktop/src/main/utils/buildMessages.ts`                   | 35行     | aiHandlers経由使用中           | ChatInputからの送信時にメッセージ配列構築に利用                                                                                                 |
| ChatSlice              | `apps/desktop/src/renderer/store/slices/chatSlice.ts`            | 330行    | useStreamingChat経由で接続待ち | 拡張不要・既存アクション（sendMessage / startStreaming / appendStreamChunk / endStreaming / cancelStreaming / setStreamingError）をそのまま利用 |
| LLMSlice               | `apps/desktop/src/renderer/store/slices/llmSlice.ts`             | 260行    | SettingsView等で使用中         | ChatPanelのmodel-selector-slotにfetchProviders/selectProvider/selectModel/selectedProviderId/selectedModelIdを供給                              |
| Preload llm API        | `apps/desktop/src/preload/index.ts`（llmセクション L339-L361）   | 23行     | useStreamingChatで参照済み     | 変更不要・window.electronAPI.llm.\*は既実装                                                                                                     |
| LLMChatRequestInput型  | `packages/shared/src/types/llm/schemas/request.ts`               | 調査済み | useStreamingChat/llm.tsで使用  | startStreamの引数型として利用                                                                                                                   |
| ChatMessage型（store） | `apps/desktop/src/renderer/store/types.ts` L39-L45               | 7行      | chatSliceで使用中              | MessageListコンポーネントの型定義に利用（isStreaming?: boolean付き）                                                                            |
| 個別セレクタ群         | `apps/desktop/src/renderer/store/index.ts`                       | 963行    | 一部ChatPanelで利用中          | useChatMessages / useIsSending / useSelectedProviderId / useSelectedModelId / useFetchProviders等をChatPanelで利用                              |

---

## GAP分析サマリー

### 足りないもの（新規実装が必要なもの）

| 不足コンポーネント/機能                                   | 理由                                                                                                                                                                                                                          |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ChatMessageList コンポーネント**                        | `chatMessages` 配列を受け取り、ユーザー・アシスタント発言をリスト表示するコンポーネントが存在しない。`StreamingMessage` はストリーミング中の1件表示のみ。完了済みメッセージのリスト表示ロジックが未実装。                     |
| **ChatInput コンポーネント**                              | テキスト入力・送信ボタン・ストリーミングキャンセルボタンを持つ入力UIが未実装。`chatInput` / `isSending` / `isStreaming` 状態との接続が必要。                                                                                  |
| **LLMSelectorPanel（またはModelSelectorコンポーネント）** | provider一覧・モデル一覧を選択できるセレクターUIが未実装。`LLMSlice` の `providers` / `selectedProviderId` / `selectProvider` / `selectModel` との接続が必要。                                                                |
| **ChatPanel への useStreamingChat 接続**                  | `useStreamingChat` フックが完全実装済みにもかかわらず、ChatPanel 内で一切インポート・使用されていない。                                                                                                                       |
| **sendMessage と streamChat の使い分け判断ロジック**      | `ChatSlice.sendMessage` は `window.electronAPI.ai.chat`（非ストリーミング）を呼ぶ。ストリーミング送信は `useStreamingChat.startStream` → `window.electronAPI.llm.streamChat` を使う。どちらを使うかの入力側での判断が未実装。 |

### 既実装で変更不要なもの

- `apps/desktop/src/main/handlers/llm.ts` - IPC ハンドラ（streamChat / cancelStream）
- `apps/desktop/src/preload/index.ts` の `llm` セクション
- `apps/desktop/src/renderer/hooks/useStreamingChat.ts`
- `apps/desktop/src/renderer/store/slices/chatSlice.ts`
- `apps/desktop/src/renderer/store/slices/llmSlice.ts`
- `apps/desktop/src/main/utils/buildMessages.ts`
