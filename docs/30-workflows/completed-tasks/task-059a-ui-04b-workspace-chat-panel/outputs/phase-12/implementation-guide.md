# Phase 12 実装ガイド

## Part 1（中学生向け）

### なぜ必要か

ただ質問文だけをAIに渡すと、どのファイルの話か分からず答えがずれやすくなります。  
だから、Workspace Chat Panel では「どのファイルを見ながら質問しているか」を一緒に渡せるようにしました。

### 何をするか

- ファイルを添付すると、AIが文脈を理解しやすくなる
- `@` を打つとファイル候補が出る
- 返答が少しずつ表示されるので待ち時間が分かる

### たとえ話

先生に質問するとき、問題文を見せながら聞くと答えやすいのと同じです。  
質問だけを口で伝えるより、資料を見せて聞いた方が正確に答えられます。
たとえば、数学の質問で式を見せずに聞くより、ノートを見せて聞く方が正しく伝わります。

## Part 2（開発者向け）

### 主要構成

- `WorkspaceView` が `WorkspaceChatPanel` を統合
- `useWorkspaceChatController` が conversation + stream + mention を集約
- `workspaceFileSelection.ts` が `SelectedFile` 生成ロジックを共通化

### TypeScript 型定義

```ts
type WorkspaceChatMessageRole = "user" | "assistant";

interface WorkspaceChatMessage {
  id: string;
  role: WorkspaceChatMessageRole;
  content: string;
  createdAt: string;
}

interface WorkspaceChatController {
  messages: WorkspaceChatMessage[];
  input: string;
  isStreaming: boolean;
  sendMessage: () => Promise<void>;
  cancelStreaming: () => void;
}
```

### APIシグネチャ

- `conversationAPI.create(payload: { workspaceId: string }): Promise<{ id: string }>`
- `conversationAPI.addMessage(payload: { conversationId: string; role: "user" | "assistant"; content: string }): Promise<void>`
- `llmAPI.streamChat(payload: StreamChatRequest): Promise<void>`
- `sendMessage(): Promise<void>`

### 送信フロー

1. `sendMessage()` で user message を local append
2. `conversationAPI.create`（初回）
3. `conversationAPI.addMessage`（user）
4. `buildFileContextBlock()` で context 生成
5. `llm.streamChat()` 開始
6. chunk/end/error を listener で処理

### race 対策

- chunk/end 同一ティック競合を避けるため、`streamContentRef` と `isStreamingRef` を state と同時更新

### 使用例

```ts
const controller = useWorkspaceChatController({
  workspaceId,
  selectedFiles,
});

await controller.sendMessage();
```

### エラーハンドリング

- conversation 作成失敗時: stream 開始前に中断し、error surface を表示
- stream 中断/失敗時: partial content を確定し、`isStreaming` を false に戻す
- mention 候補取得失敗時: dropdown を閉じ、入力操作は継続可能にする

### エッジケース

- chunk と end が同一ティックで到着するケース
- 添付ファイル 0 件で送信するケース
- mention query が空文字に戻るケース
- conversation 未作成状態で最初の送信を行うケース

### 設定と定数

| 項目                       | 役割                                 |
| -------------------------- | ------------------------------------ |
| `MAX_CONTEXT_FILES`        | 送信時に含めるファイル数上限         |
| `STREAM_TIMEOUT_MS`        | stream 応答待機の上限時間            |
| `MENTION_MIN_QUERY_LENGTH` | mention 候補検索を開始する最小文字数 |

### 主要テスト

- `WorkspaceView.test.tsx`（統合）
- `useWorkspaceMentionQuery.test.ts`（hook）
- `workspaceFileSelection.test.ts`（utility）
