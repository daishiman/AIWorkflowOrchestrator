# 実装ガイド

## Part 1: 中学生向けの説明

### なぜ必要か

この変更が必要なのは、同じ「会話」なのに、入口によってルールが少しずつ違っていたからです。ふだんの生活でたとえると、駅の改札は 1 つにしたいのに、教室用の改札、図書室用の改札、部活用の改札が別々に増えてしまった状態でした。このままだと、どの改札で何を持って入るのかが毎回変わってしまいます。

### 何をしたか

今回は「会話そのもの」を全部作り直したのではなく、まず共通の乗車券を作りました。

- どの入口から来たか
- 何を相談したいか
- どんな資料を持ってきたか
- 途中で止まった一時メモは持ち越さない

このルールをそろえたので、Workspace から来ても Skill Center から来ても、Chat へ渡す情報の形が同じになりました。

### 日常のたとえ

学校の提出物を考えると分かりやすいです。教科ごとに紙の大きさや名前の書き方が違うと、先生も生徒も混乱します。そこで「名前を書く場所」「日付を書く場所」「内容を書く場所」をそろえた提出シートを配ると、どの教科でも同じ形で扱えます。今回作ったのは、この提出シートにあたるものです。

### 何がまだ残っているか

まだ、全部の入口が同じ通路で教室まで行けるわけではありません。とくに general chat は、保存のしかたが古いままなので、あとで通路そのものをそろえる作業が必要です。

## Part 2: 技術者向けの説明

### 追加した型

```ts
type ChatMode = "general" | "workspace" | "skill-lifecycle";

interface ChatHandoffPayload {
  mode: ChatMode;
  sourceSurface:
    | "chat-view"
    | "workspace-view"
    | "skill-center"
    | "skill-creator"
    | "task03";
  targetSurface: "chat-view";
  request: string;
  title: string;
  summary: string;
  attachments: ChatContextAttachment[];
  metadata: Record<string, unknown>;
  createdAt: string;
}

interface ChatReviveSnapshot {
  mode: ChatMode;
  conversationId: string | null;
  title: string;
  draftInput: string;
  systemPrompt: string;
  summary: string;
  attachments: ChatContextAttachment[];
  metadata: Record<string, unknown>;
}
```

### 主要 API シグネチャ

```ts
createChatSessionTitle(mode: ChatMode, request: string, maxLength?: number): string

buildChatPlatformRequest(params: {
  mode: ChatMode;
  input: string;
  contextBlock?: string;
  systemPrompt?: string;
  selectedModelId: string | null;
  selectedProviderId: LLMProviderId | null;
  temperature?: number;
}): LLMChatRequest

createWorkspaceChatHandoff(params: {
  request: string;
  selectedFiles: SelectedFile[];
  selectedFilePath: string | null;
  metadata?: Record<string, unknown>;
}): ChatHandoffPayload

createSkillLifecycleChatHandoff(input: SkillLifecycleChatHandoffInput): ChatHandoffPayload

createChatReviveSnapshot(params: {
  mode: ChatMode;
  conversationId: string | null;
  request: string;
  systemPrompt?: string;
  attachments?: ChatContextAttachment[];
  metadata?: Record<string, unknown>;
}): ChatReviveSnapshot
```

### 使用例

```ts
import {
  buildChatPlatformRequest,
  createWorkspaceChatHandoff,
} from "@/renderer/features/chat-platform/contracts";

const handoff = createWorkspaceChatHandoff({
  request: "選択中ファイルの差分をレビューして",
  selectedFiles,
  selectedFilePath,
  metadata: { sourceSurface: "workspace-view" },
});

const request = buildChatPlatformRequest({
  mode: handoff.mode,
  input: handoff.request,
  contextBlock: handoff.summary,
  selectedModelId: "claude-sonnet-4-5",
  selectedProviderId: "anthropic",
});
```

### 実装ポイント

1. `packages/shared/src/types/chat-platform.ts` に mode / handoff / revive / non-persist overlay を集約した。
2. `renderer/features/chat-platform/contracts.ts` で Workspace 固有の request 生成と handoff 生成を吸収した。
3. `skillLifecycleJourney.ts` に lifecycle handoff helper と allowed surface guard を追加した。
4. `chatSlice` は `createEmptyChatStreamOverlayState()` を使って cancel/end/error 後の overlay を統一的にクリアする。

### エラーハンドリング

| ケース                          | 振る舞い                                                                    |
| ------------------------------- | --------------------------------------------------------------------------- |
| file context 読み込み失敗       | `useWorkspaceChatController` が error message を返し、context attach を中断 |
| 空 request                      | default session title を返す                                                |
| streaming error                 | `streamingError` は保持しつつ、stream ids/content はクリア                  |
| 不正な lifecycle source surface | `isSkillLifecycleChatHandoffAllowed()` が false                             |

### エッジケース

| ケース                                          | 期待動作                                                                           |
| ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| Workspace で file selection が 0 件             | attachment は空配列のまま handoff し、request 本文だけを送る                       |
| revive snapshot に `conversationId=null` が入る | recent rail は title / summary / metadata だけを表示し、新規 session として扱う    |
| cancel / end / error が連続到着する             | `createEmptyChatStreamOverlayState()` が最後に適用され、overlay は revive されない |
| lifecycle `prepare` 前に handoff を試みる       | guard が false を返し、不正な surface からの handoff を止める                      |

### 設定と定数

| 定数                              | 内容                                           |
| --------------------------------- | ---------------------------------------------- |
| `CHAT_MODES`                      | mode 一覧                                      |
| `CHAT_ENTRY_SURFACES`             | entry surface 一覧                             |
| `CHAT_EXECUTION_SURFACE`          | 実行面は `chat-view` 固定                      |
| `DEFAULT_CHAT_SESSION_TITLES`     | mode 別 default title                          |
| `NON_PERSISTED_CHAT_OVERLAY_KEYS` | revive 対象外 key                              |
| default temperature               | `general=0.4`, `workspace/skill-lifecycle=0.2` |

### 残課題

- general chat の `conversationAPI` 統合
- Electron shell での end-to-end handoff / revive 自動検証
