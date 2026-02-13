# query() API リファレンス

## パッケージ情報

| 項目             | 内容                                    |
| ---------------- | --------------------------------------- |
| パッケージ名     | `@anthropic-ai/claude-agent-sdk`        |
| 旧名             | `@anthropic-ai/claude-code`             |
| 最新バージョン   | 0.2.30+（`npm info` で最新を確認）      |
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
    permissionMode: "default",
    env: { ANTHROPIC_API_KEY: apiKey },
    abortController: new AbortController(),
  },
});

// ストリーミング処理（SDK@0.2.30: conversation を AsyncIterable として直接利用）
for await (const message of conversation) {
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

// SDK@0.2.30: conversation を AsyncIterable として直接利用
for await (const message of conversation) {
  switch (message.type) {
    case "assistant":
      process.stdout.write(message.message.content);
      break;
    case "stream_event":
      // SDKPartialAssistantMessage（部分メッセージ）
      console.log("Streaming:", message.event);
      break;
    case "result":
      console.log("Tool result:", message.message);
      break;
  }
}
```

### バージョン互換性

| バージョン | メソッド名                   | 備考                        |
| ---------- | ---------------------------- | --------------------------- |
| < 0.1.72   | receive()                    | 旧API（非推奨）             |
| 0.1.72+    | stream()                     | 旧推奨API                   |
| 0.2.30+    | conversation 直接（推奨）    | AsyncIterable として利用    |

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

### モード一覧（SDK@0.2.30 実型）

```typescript
type SDKPermissionMode =
  | "default"              // デフォルト（ツールごとの設定に従う）
  | "acceptEdits"          // 編集系を自動承認
  | "bypassPermissions"    // すべてバイパス（開発専用）
  | "plan"                 // 計画モード
  | "delegate"             // 委譲モード
  | "dontAsk";             // 確認なし
```

> **注意**: 旧ドキュメントの "auto" | "ask" | "deny" は SDK@0.2.30 の実型には存在しません。
> `node_modules/@anthropic-ai/claude-agent-sdk/dist/index.d.ts` で確認してください。

### 使用例

```typescript
const options: Options = {
  permissionMode: "default", // デフォルトの権限制御
};
```

---

## 認証設定

### 認証キー設定オプション

`query()` は以下の優先順位で認証キーを解決します:

1. `options.apiKey` で直接指定
2. `AuthKeyService.getKey()` からの取得（Electron環境）
3. 環境変数 `ANTHROPIC_API_KEY`

#### 直接指定パターン

```typescript
const result = await query({
  prompt: "Your task here",
  options: {
    apiKey: "sk-ant-api03-...",  // 直接指定（最優先）
  },
});
```

#### AuthKeyService 連携パターン（Electron環境）

```typescript
// SkillExecutor 経由で自動解決
const skillExecutor = new SkillExecutor({ authKeyService });
const result = await skillExecutor.execute("hearing", projectPath);
// → authKeyService.getKey() が自動的に呼び出される
```

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

## TypeScript モジュール解決パターン（TASK-9B-I 教訓）

### node_modules 実型 vs カスタム declare module

- TypeScript は `node_modules/@anthropic-ai/claude-agent-sdk` の型定義を優先する
- カスタム `declare module`（例: `@anthropic-ai-claude-agent-sdk.d.ts`）は SDK インストール後に無視される
- SDK 未インストール環境でのみカスタム型宣言が有効

### 型安全な動的 import パターン

```typescript
// ❌ 非推奨: as any で型安全性を放棄
const { query } = (await import("@anthropic-ai/claude-agent-sdk")) as any;

// ✅ 推奨: SDK型を直接利用
const { query } = await import("@anthropic-ai/claude-agent-sdk");
// query の型は自動的に SDK の型定義から推論される
```

### SDK Options の型安全な構築パターン

```typescript
import type { Options as SDKOptions } from "@anthropic-ai/claude-agent-sdk";

const options: SDKOptions = {
  tools: allowedTools, // string[]
  permissionMode: "default", // SDKPermissionMode
  env: { ANTHROPIC_API_KEY: apiKey }, // Record<string, string>
  abortController: new AbortController(),
};

const conversation = query({ prompt, options });
```

### パラメータ発見のベストプラクティス

- 公式ドキュメントより `node_modules/@anthropic-ai/claude-agent-sdk/dist/index.d.ts` が信頼できる情報源
- GitHub リポジトリのテストコードも参照
- `env: { ANTHROPIC_API_KEY }` は型定義ファイルで発見（ドキュメントに明記なし）

### apiKey vs env.ANTHROPIC_API_KEY

```typescript
// ❌ 旧パターン: apiKey オプション（SDK@0.2.30 では非推奨）
const conversation = query({
  prompt,
  options: { apiKey: "sk-ant-..." },
});

// ✅ 新パターン: env 経由で環境変数として渡す
const conversation = query({
  prompt,
  options: {
    env: { ANTHROPIC_API_KEY: apiKey },
  },
});
```

### signal vs abortController

```typescript
// ❌ 旧パターン: signal を直接渡す
const conversation = query({
  prompt,
  options: { signal: controller.signal },
});

// ✅ 新パターン: AbortController オブジェクトを渡す
const controller = new AbortController();
const conversation = query({
  prompt,
  options: { abortController: controller },
});
```

### conversation の直接利用

```typescript
// ❌ 旧パターン: stream() メソッド経由
for await (const message of conversation.stream()) {
  // ...
}

// ✅ 新パターン: conversation を AsyncIterable として直接利用
for await (const message of conversation) {
  // ...
}
```

---

## 関連ドキュメント

- [hooks-system.md](./hooks-system.md) - Hooksシステム
- [permission-control.md](./permission-control.md) - Permission Control
- [error-handling.md](./error-handling.md) - エラーハンドリング
