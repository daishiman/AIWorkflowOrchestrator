# query() API リファレンス

## パッケージ情報

| 項目             | 内容                                    |
| ---------------- | --------------------------------------- |
| パッケージ名     | `@anthropic-ai/claude-agent-sdk`        |
| 旧名             | `@anthropic-ai/claude-code`             |
| 最新バージョン   | 0.1.73+                                 |
| インストール     | `pnpm add @anthropic-ai/claude-agent-sdk` |
| リリース日       | 2025年9月29日                           |

## SDK履歴

Claude Agent SDKは元々「Claude Code SDK」として開発された。Claude Codeを動かすエージェントハーネスが、より広範なエージェント構築に活用できることから、2025年9月に「Claude Agent SDK」へ改名された。SDKの設計思想は「エージェントにコンピュータを与える」ことで、人間のように作業できるエージェントの構築を可能にする。

---

## query() 基本構文

```typescript
import { query, type SDKMessage, type Options } from "@anthropic-ai/claude-agent-sdk";

function query({
  prompt,
  options,
}: {
  prompt: string | AsyncIterable<SDKUserMessage>;
  options?: Options;
}): Query;

// Query extends AsyncGenerator<SDKMessage, void>
```

## 基本使用例

```typescript
const conversation = query({
  prompt: "Hello, Claude!",
  options: {
    tools: ["Read", "Edit", "Bash"],
    permissionMode: "ask",
  },
});

// ストリーミング処理
for await (const message of conversation.stream()) {
  switch (message.type) {
    case "assistant":
      console.log("Assistant:", message.message.content);
      break;
    case "result":
      console.log("Tool result:", message.message);
      break;
  }
}
```

---

## SDKMessage 型

### 型定義

```typescript
type SDKMessage =
  | SDKAssistantMessage
  | SDKUserMessage
  | SDKUserMessageReplay
  | SDKResultMessage
  | SDKSystemMessage
  | SDKPartialAssistantMessage
  | SDKCompactBoundaryMessage;
```

### SDKUserMessage

```typescript
type SDKUserMessage = {
  type: "user";
  uuid?: UUID;
  session_id: string;
  message: APIUserMessage;
  parent_tool_use_id: string | null;
};
```

### SDKAssistantMessage

```typescript
type SDKAssistantMessage = {
  type: "assistant";
  uuid: UUID;
  session_id: string;
  message: APIAssistantMessage;
  parent_tool_use_id: string | null;
};
```

### SDKResultMessage

```typescript
type SDKResultMessage = {
  type: "result";
  uuid: UUID;
  session_id: string;
  message: APIToolResultMessage;
  parent_tool_use_id: string | null;
};
```

### SDKPartialAssistantMessage（ストリーミング用）

```typescript
type SDKPartialAssistantMessage = {
  type: "stream_event";
  event: RawMessageStreamEvent; // Anthropic SDK からのイベント
};
```

---

## Tools 設定

### ツール設定形式

```typescript
type ToolConfig =
  | string[]                              // 許可リスト
  | { type: "preset"; preset: string }    // プリセット
  | { type: "custom"; tools: ToolDef[] }; // カスタム定義
```

### 使用例

```typescript
// 許可リスト（特定ツールのみ有効）
const options1: Options = {
  tools: ["Bash", "Read", "Edit", "Write"],
};

// すべて無効
const options2: Options = {
  tools: [],
};

// プリセット使用
const options3: Options = {
  tools: { type: "preset", preset: "claude_code" },
};
```

### 組み込みツール一覧

| ツール名  | 説明                 |
| --------- | -------------------- |
| Bash      | シェルコマンド実行   |
| Read      | ファイル読み込み     |
| Write     | ファイル書き込み     |
| Edit      | ファイル編集         |
| Glob      | ファイルパターン検索 |
| Grep      | テキスト検索         |
| Task      | サブタスク起動       |
| WebSearch | Web検索              |
| WebFetch  | URL取得              |
| TodoWrite | タスク管理           |

---

## ストリーミング

### 基本パターン

```typescript
const conversation = query({ prompt: "Hello!" });

// v0.1.72以降: stream() メソッドを使用
for await (const message of conversation.stream()) {
  switch (message.type) {
    case "assistant":
      process.stdout.write(message.message.content);
      break;
    case "partial":
      process.stdout.write(message.delta);
      break;
    case "result":
      console.log("Tool result:", message.message);
      break;
  }
}
```

### バージョン互換性

| バージョン | メソッド名 | 備考          |
| ---------- | ---------- | ------------- |
| < 0.1.72   | receive()  | 旧API         |
| >= 0.1.72  | stream()   | 推奨（新API） |

### includePartialMessages

部分的なメッセージ（トークン単位）をストリーミングで受信するためのオプション:

```typescript
const result = query({
  prompt: "Your task here",
  options: {
    includePartialMessages: true, // 部分メッセージを有効化
  },
});

for await (const msg of result) {
  if (msg.type === "stream_event") {
    // SDKPartialAssistantMessage
    console.log("Streaming:", msg.event);
  } else if (msg.type === "result") {
    console.log("Cost:", msg.total_cost_usd, "Usage:", msg.usage);
  }
}
```

---

## Permission Mode

### モード一覧

```typescript
type PermissionMode =
  | "auto"      // すべて自動承認
  | "ask"       // すべて確認
  | "deny"      // すべて拒否
  | "default";  // デフォルト（ツールごとの設定に従う）
```

### 使用例

```typescript
const options: Options = {
  permissionMode: "ask", // すべてのツール使用で確認を求める
};
```

---

## 認証設定

### 環境変数

```bash
# Anthropic Direct（デフォルト）
ANTHROPIC_API_KEY=sk-ant-...

# AWS Bedrock
CLAUDE_CODE_USE_BEDROCK=1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1

# Google Vertex AI
CLAUDE_CODE_USE_VERTEX=1
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Foundry
CLAUDE_CODE_USE_FOUNDRY=1
FOUNDRY_API_KEY=...
```

### プロバイダー指定

```typescript
const options: Options = {
  provider: "bedrock", // 'anthropic' | 'bedrock' | 'vertex' | 'foundry'
};
```

---

## V2 Preview API（不安定）

**注意**: V2 APIは不安定であり、将来変更される可能性があります。

```typescript
import {
  unstable_v2_createSession,
  unstable_v2_resumeSession,
  unstable_v2_prompt,
} from "@anthropic-ai/claude-agent-sdk";

// セッション作成
const session = await unstable_v2_createSession({ options });

// プロンプト送信
const result = await unstable_v2_prompt({
  session,
  prompt: "Your prompt here",
});

// セッション再開
const resumedSession = await unstable_v2_resumeSession({
  sessionId: session.id,
});
```

---

## 関連ドキュメント

- [hooks-system.md](./hooks-system.md) - Hooksシステム
- [permission-control.md](./permission-control.md) - Permission Control
- [error-handling.md](./error-handling.md) - エラーハンドリング
