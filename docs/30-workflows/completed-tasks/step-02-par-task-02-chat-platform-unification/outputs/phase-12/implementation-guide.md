# 実装ガイド

## Part 1: 中学生向け説明

### なぜ必要か

同じ AI と話しているのに、Chat では普通の相談、Workspace ではファイルつきの相談、Skill Center では「作る」「使う」「改善する」の相談をしたい場面があります。ここで入口ごとに別の会話帳を作ると、会話の止め方、やり直し方、前の会話に戻る方法が全部ばらばらになってしまいます。

### たとえば

たとえば、学校の中に「相談室」「図書室」「部活室」があっても、相談に乗る先生は同じだと考えると分かりやすいです。部屋ごとに持って行くメモは違いますが、先生が話を聞く机、会話のメモ帳、途中で「少し待って」と止める仕組みは同じ方が使いやすいです。

### 何をするか

- Chat は普通の相談を始める入口にしました。
- Workspace は、選んだファイル名や workspace の場所をメモとして持って同じ会話基盤へ渡す入口にしました。
- Skill Center は、「作る」「使う」「改善する」の目的メモを持って同じ会話基盤へ渡す入口にしました。
- 会話を動かす仕組み、途中停止、やり直し、前の会話に戻る仕組みは 1 つにそろえました。

### どう役に立つか

- どの入口から入っても、会話の止め方と戻り方が同じになります。
- Workspace ではファイルの背景情報を持ったまま会話できます。
- Skill Center では目的を忘れずに会話を続けられます。
- 将来 Task03 が来ても、新しい会話エンジンを増やさずに同じ基盤を再利用できます。

## Part 2: 技術説明

### 主要型定義

```ts
type ChatMode = "general" | "workspace" | "skill-lifecycle";

type SkillLifecycleChatJob = "create" | "use" | "improve";

interface ChatSessionContext {
  workspacePath?: string | null;
  selectedFilePaths: string[];
  selectedFileNames: string[];
  selectedSkillName?: string | null;
  lifecycleJob?: SkillLifecycleChatJob | null;
  entryPoint?: "chat" | "workspace" | "skill-center" | "agent";
  handoffLabel?: string | null;
}

interface ChatSessionRecord {
  id: string;
  mode: ChatMode;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  context: ChatSessionContext;
  lastUserMessage?: string | null;
  lastError?: {
    code: string;
    message: string;
    retryable: boolean;
  } | null;
}
```

### API / Store シグネチャ

```ts
interface ChatSlice {
  activateChatMode: (
    mode: ChatMode,
    context?: Partial<ChatSessionContext>,
  ) => string;
  resumeChatSession: (sessionId: string) => void;
  updateActiveChatContext: (context: Partial<ChatSessionContext>) => void;
  sendMessage: (
    message: string,
    options?: {
      providerId?: LLMProviderId | null;
      modelId?: string | null;
      temperature?: number;
      maxTokens?: number;
    },
  ) => Promise<void>;
  abortStreaming: () => Promise<void>;
}

interface UseStreamingChatActions {
  startStream: (request: {
    content: string;
    providerId?: LLMProviderId | null;
    modelId?: string | null;
    temperature?: number;
    maxTokens?: number;
  }) => Promise<void>;
  cancelStream: () => Promise<void>;
  retryLastStream: (request?: {
    providerId?: LLMProviderId | null;
    modelId?: string | null;
    temperature?: number;
    maxTokens?: number;
  }) => Promise<void>;
}
```

### 使用例

```ts
const sessionId = activateChatMode(
  "workspace",
  buildWorkspaceChatContext(selectedFiles, workspacePath),
);

await sendMessage("このファイルの変更方針を提案して", {
  providerId,
  modelId,
  temperature: 1,
});

resumeChatSession(sessionId);
```

```ts
activateChatMode("skill-lifecycle", {
  lifecycleJob: "improve",
  selectedSkillName: "Codex-agent-sdk",
  entryPoint: "skill-center",
  handoffLabel: "改善観点を会話へ引き継ぐ",
});
```

### 実装責務

| 層 / ファイル                                                 | 責務                                                                |
| ------------------------------------------------------------- | ------------------------------------------------------------------- |
| `apps/desktop/src/renderer/features/chat-platform/session.ts` | mode label、session title、workspace / skill-lifecycle context 生成 |
| `apps/desktop/src/renderer/store/slices/chatSlice.ts`         | session record 正本、streaming state、mode handoff、retry / abort   |
| `apps/desktop/src/renderer/hooks/useStreamingChat.ts`         | `chatSlice` を UI から使うための薄い facade                         |
| `apps/desktop/src/renderer/views/ChatView/index.tsx`          | mode 切替 UI、session rail、context summary、retry / stop 操作      |
| `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`     | selected files + workspacePath を handoff する入口                  |
| `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`   | lifecycleJob / handoffLabel を handoff する入口                     |
| `apps/desktop/src/renderer/store/index.ts`                    | `chatSessions` / `modeSessionIds` の persist と revive              |

### ストリーミング / エラーハンドリング

| ケース            | 挙動                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| model 未選択      | `MODEL_REQUIRED` を設定し、stream を開始しない                                                   |
| stream start 失敗 | placeholder assistant message に失敗内容を残し、`lastError` を保存する                           |
| user stop         | `window.electronAPI.llm.cancelStream(requestId)` 後に placeholder を停止済みメッセージへ変換する |
| provider error    | `retryable` を保持し、ChatView の retry CTA へ渡す                                               |

### エッジケース

| ケース                               | 対応                                                                                 |
| ------------------------------------ | ------------------------------------------------------------------------------------ |
| `workspace` mode で選択ファイル 0 件 | `workspacePath` のみを context に残し、handoff 文言を通常化する                      |
| 既存 mode session 再利用             | `activateChatMode()` が `modeSessionIds` を見て既存 session を更新再利用する         |
| persist 復元時の日時型               | `store/index.ts` で `createdAt` / `updatedAt` / `message.timestamp` を `Date` に戻す |
| light theme 低コントラスト           | `ChatView` / `ChatMessage` を token ベース配色へ修正済み                             |

### 設定項目 / 定数

| 項目                | 値 / 役割                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------- |
| `DEFAULT_CHAT_MODE` | `general`                                                                                     |
| `MODE_ORDER`        | `general` → `workspace` → `skill-lifecycle`                                                   |
| persist key         | `knowledge-studio-store`                                                                      |
| persisted fields    | `activeChatMode`, `activeChatSessionId`, `chatSessions`, `chatSessionOrder`, `modeSessionIds` |

### 検証

| 検証                                                                    | 結果 |
| ----------------------------------------------------------------------- | ---- |
| `pnpm --filter @repo/desktop typecheck`                                 | PASS |
| targeted Vitest 4 files / 28 tests                                      | PASS |
| `pnpm --filter @repo/desktop build`                                     | PASS |
| `node apps/desktop/scripts/capture-task-skill-lifecycle-02-phase11.mjs` | PASS |
