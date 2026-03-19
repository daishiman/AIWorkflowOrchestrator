# Phase 2 Task 2-1: State Machine 設計

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| タスクID   | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 |
| Phase      | 2                                   |
| Task       | 2-1                                 |
| Phase名    | 設計 / State Machine                |
| 作成日     | 2026-03-18                          |
| ステータス | completed                           |
| 担当Agent  | Chat Surface Agent (Phase 2)        |

---

## 1. 状態定義（8状態）

ChatPanel の UI 表示は `ChatPanelStatus` という union type で制御する。この値は `chatSlice` に追加する新規フィールドであり、既存の `isStreaming` / `streamingContent` 等とは直交した「画面モード」を表す。

```typescript
export type ChatPanelStatus =
  | "idle"
  | "ready"
  | "streaming"
  | "cancelled"
  | "completed"
  | "error"
  | "blocked"
  | "handoff";
```

### 状態テーブル

| 状態        | 遷移条件                                                                                     | 表示内容                                                                                            | 送信ボタン | キャンセルボタン |
| ----------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------- | ---------------- |
| `idle`      | 初期状態（会話なし、capability 未確定）                                                      | empty state（提案バブルなし）                                                                       | disabled   | 非表示           |
| `ready`     | capability が `integratedRuntime` または `both`、入力待ち                                    | ComposerArea 有効、ChatMessageList 表示（空の場合は zero state 提案バブル）                         | enabled    | 非表示           |
| `streaming` | ユーザーがメッセージ送信、`startStream()` が呼ばれた後                                       | StreamingMessage（蓄積コンテンツ + パルスカーソル）、ComposerArea は disabled                       | disabled   | 表示             |
| `cancelled` | `cancelStream()` 呼び出し後（ボタン / Escape / unmount / 新規送信）                          | 蓄積コンテンツを保持した StreamingMessage（`[キャンセル]` サフィックス付き）、ComposerArea 再有効化 | enabled    | 非表示           |
| `completed` | `llm:stream-done` イベント受信後（`endStreaming()` 呼び出し後）                              | 完了した assistant メッセージが ChatMessageList に追加、ComposerArea 再有効化                       | enabled    | 非表示           |
| `error`     | `llm:stream-error` イベント受信後（`setStreamingError()` 呼び出し後）                        | ErrorGuidance（エラーコードに応じた設定誘導 / 再試行ボタン）、`role="alert"`                        | enabled    | 非表示           |
| `blocked`   | capability が `none`（API key 未設定 かつ terminal 利用不可）                                | ErrorGuidance（設定画面誘導バナー）、capability banner                                              | disabled   | 非表示           |
| `handoff`   | capability が `terminalSurface`（subscription モード または API key 未設定で terminal あり） | HandoffBlock（terminalCommand / contextSummary / PersistentTerminalLauncher）、ComposerArea 非表示  | disabled   | 非表示           |

---

## 2. 状態遷移図

```
                         +----------------+
                         |      idle      |
                         | (初期・未確定)  |
                         +-------+--------+
                                 |
               +-----------------+-----------------+
               |                 |                 |
    capability=ready       capability=handoff  capability=none
               |                 |                 |
               v                 v                 v
         +----------+      +-----------+      +-----------+
         |  ready   |      |  handoff  |      |  blocked  |
         | (入力待ち)|      |(terminal) |      |(設定誘導) |
         +----+-----+      +-----------+      +-----+-----+
              |                                     |
     send msg |              API key 設定            |
              |            +-----------------------+|
              v            v                        |
         +-----------+     |       ready  <---------+
         | streaming |     |
         | (配信中)  |
         +-----+-----+
               |
     +---------+---------+
     |         |         |
  cancel    done      error
     |         |         |
     v         v         v
+----------++--------++-------+
|cancelled ||completed||  error|
|(蓄積保持)||(完了)   ||(誘導) |
+-----+----++---+----++---+---+
      |         |         |
      +---------+---------+
                |
             ready
           (再入力待ち)
```

### 遷移ルール詳細

| 遷移元      | 遷移先      | トリガー                                                                |
| ----------- | ----------- | ----------------------------------------------------------------------- |
| `idle`      | `ready`     | capability が `integratedRuntime` または `both` と確定した              |
| `idle`      | `handoff`   | capability が `terminalSurface` と確定した                              |
| `idle`      | `blocked`   | capability が `none` と確定した                                         |
| `blocked`   | `ready`     | API key が設定された（`auth-key:exists` → `{ exists: true }`）          |
| `handoff`   | `ready`     | API key が設定された（capability が `integratedRuntime`/`both` に変化） |
| `ready`     | `streaming` | ユーザーが送信ボタン押下 / Enter キー（`startStream()` 呼び出し）       |
| `streaming` | `cancelled` | キャンセルトリガー（4種、後述）                                         |
| `streaming` | `completed` | `llm:stream-done` イベント（`endStreaming()` 呼び出し）                 |
| `streaming` | `error`     | `llm:stream-error` イベント（`setStreamingError()` 呼び出し）           |
| `cancelled` | `ready`     | ComposerArea が再フォーカスされ、入力待ちに戻る（自動遷移）             |
| `completed` | `ready`     | 完了後に入力待ちに戻る（自動遷移）                                      |
| `error`     | `ready`     | 再試行ボタン押下 / 入力フォーカス時（自動遷移）                         |

---

## 3. キャンセルトリガー（4種）

ストリーミングを中断するトリガーは以下の 4 種類。すべて `cancelStream()` アクション（`useStreamingChat.actions.cancelStream`）を呼び出す。

| トリガー種別       | 発生条件                                                                          | 実装箇所                                            |
| ------------------ | --------------------------------------------------------------------------------- | --------------------------------------------------- |
| Cancel ボタン押下  | StreamingMessage 内の「停止」ボタンを押した場合                                   | `StreamingMessage` の `onCancel` prop               |
| Escape キー        | `streaming` 状態中に Escape キーを押した場合                                      | `ChatPanel` の `useEffect` / `keydown` ハンドラ     |
| コンポーネント解除 | ChatPanel が unmount された場合（タブ切替 / ウィンドウ閉鎖等）                    | `useStreamingChat` の `useEffect` cleanup（既実装） |
| 新規メッセージ送信 | ストリーミング中に新規送信が発生した場合（UI 側で通常はブロックするが防衛として） | `startStream()` の前処理で既存 stream を cancel     |

キャンセル後の動作: 蓄積済みコンテンツを保持し、`chatMessages` の該当メッセージに `[キャンセル]` サフィックスを付与（`chatSlice.cancelStreaming()` の既存実装）。`ChatPanelStatus` は `cancelled` → `ready` へ自動遷移する。

---

## 4. Store 設計

### 4-1. chatSlice 拡張方針

**方針: 新規 Slice は作成しない。`chatSlice` に `chatPanelStatus` と `currentConversationId` を追加する。**

根拠:

- NFR-04「新規グローバル Slice を追加しない（既存 `llmSlice` / `chatSlice` を再利用）」
- `chatPanelStatus` は `isStreaming` / `streamingContent` と密接に連動する状態であり、同じ Slice に配置することで原子的な状態更新が可能
- `currentConversationId` はチャットセッションのコンテキストとして `chatMessages` と同一 Slice が適切

#### chatSlice への追加フィールド

```typescript
// chatSlice.ts への追加
export interface ChatSlice {
  // --- 既存フィールド（変更なし） ---
  chatMessages: ChatMessage[];
  chatInput: string;
  isSending: boolean;
  isStreaming: boolean;
  streamingContent: string;
  currentStreamId: string | null;
  streamingMessageId: string | null;
  streamingError: StreamingError | null;
  // ...

  // --- 新規追加フィールド ---
  /** ChatPanel の表示モード */
  chatPanelStatus: ChatPanelStatus;
  /** 現在のセッションの conversationId（null = 未作成） */
  currentConversationId: string | null;

  // --- 新規追加アクション ---
  setChatPanelStatus: (status: ChatPanelStatus) => void;
  setCurrentConversationId: (id: string | null) => void;
  resetChat: () => void;
}
```

#### initialState 追加分

```typescript
chatPanelStatus: "idle" as ChatPanelStatus,
currentConversationId: null,
```

### 4-2. 型定義

#### ChatPanelStatus（新規追加）

```typescript
// chatSlice.ts に追加
export type ChatPanelStatus =
  | "idle"
  | "ready"
  | "streaming"
  | "cancelled"
  | "completed"
  | "error"
  | "blocked"
  | "handoff";
```

#### ChatMessage（既存、変更なし）

```typescript
// store/types.ts の既存定義（参照のみ）
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}
```

### 4-3. 個別セレクタ定義（store/index.ts への追加）

P31 / P48 対策として、すべて個別セレクタパターンで定義する。

```typescript
// store/index.ts へ追加

// --- ChatPanel ステータスセレクタ ---

/** ChatPanel の表示モードを取得 */
export const useChatPanelStatus = () =>
  useAppStore((state) => state.chatPanelStatus);

/** ChatPanel ステータス設定アクションを取得 */
export const useSetChatPanelStatus = () =>
  useAppStore((state) => state.setChatPanelStatus);

// --- チャットメッセージセレクタ（P48対策: useShallow適用） ---

/**
 * チャットメッセージ一覧を取得
 * P48対策: 配列を返すため useShallow を適用
 */
export const useChatMessagesShallow = () =>
  useAppStore(useShallow((state) => state.chatMessages));

// --- 会話IDセレクタ ---

/** 現在の conversationId を取得 */
export const useCurrentConversationId = () =>
  useAppStore((state) => state.currentConversationId);

/** conversationId 設定アクションを取得 */
export const useSetCurrentConversationId = () =>
  useAppStore((state) => state.setCurrentConversationId);

// --- チャットアクションセレクタ ---

/** メッセージ追加アクションを取得 */
export const useAddChatMessage = () => useAppStore((state) => state.addMessage);

/** チャットリセットアクションを取得 */
export const useResetChat = () => useAppStore((state) => state.resetChat);
```

> 備考: 既存の `useChatMessages`（L188）は `useShallow` 未適用のため P48 リスクがある。ChatPanel での使用は `useChatMessagesShallow` を使用し、既存 `useChatMessages` は後続タスクで置き換える（未タスク候補）。

### 4-4. Store 統一方針

既存 ChatPanel コードでは `useAppStore((s) => s.xxx)` を直接使用している箇所が存在する。本タスクの実装方針:

- **新規追加コード**: すべて `useAppStore` の個別セレクタフック（`useChatPanelStatus` 等）を使用する
- **既存コード（`useAppStore((s) => s.selectedSkillName)` 等）**: 本タスクスコープ外のため変更しない
- **`useStore` alias**: `useStreamingChat.ts` が `useStore` を使用しているが、`useAppStore` の alias（L180: `export const useStore = useAppStore;`）であるため変更不要

---

## 5. State フィールド一覧（完全版）

ChatPanel 実装に必要なすべての Store フィールドの参照先をまとめる。

| フィールド名            | Slice     | 既存/新規 | 型                       | 用途                                                  |
| ----------------------- | --------- | --------- | ------------------------ | ----------------------------------------------------- |
| `chatPanelStatus`       | chatSlice | 新規      | `ChatPanelStatus`        | ChatPanel の表示モード制御                            |
| `chatMessages`          | chatSlice | 既存      | `ChatMessage[]`          | メッセージリスト表示                                  |
| `currentConversationId` | chatSlice | 新規      | `string \| null`         | DB 会話セッション管理（FR-09）                        |
| `chatInput`             | chatSlice | 既存      | `string`                 | ComposerInput の入力値                                |
| `isSending`             | chatSlice | 既存      | `boolean`                | 非ストリーミング送信中フラグ                          |
| `isStreaming`           | chatSlice | 既存      | `boolean`                | ストリーミング中フラグ（aria-busy 等）                |
| `streamingContent`      | chatSlice | 既存      | `string`                 | 蓄積ストリーミングテキスト（StreamingMessage へ供給） |
| `streamingError`        | chatSlice | 既存      | `StreamingError \| null` | エラー情報（ErrorGuidance へ供給）                    |
| `currentStreamId`       | chatSlice | 既存      | `string \| null`         | キャンセル時の requestId                              |
| `selectedProviderId`    | llmSlice  | 既存      | `LLMProviderId \| null`  | LLMSelectorPanel 選択状態、送信可否判定               |
| `selectedModelId`       | llmSlice  | 既存      | `string \| null`         | LLMSelectorPanel 選択状態、送信可否判定               |
| `providers`             | llmSlice  | 既存      | `LLMProvider[]`          | LLMSelectorPanel のドロップダウン                     |

---

## 変更履歴

| バージョン | 日付       | 変更内容                                |
| ---------- | ---------- | --------------------------------------- |
| v1.0.0     | 2026-03-18 | 初版作成（Task 2-1 State Machine 設計） |
