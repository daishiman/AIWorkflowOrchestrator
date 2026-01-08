# Claude Agent SDK 調査レポート

> **Phase 0**: SDK調査・スキル作成
> **作成日**: 2026-01-08
> **ステータス**: 完了

---

## 1. SDK概要

### 1.1 パッケージ情報

| 項目           | 内容                                                |
| -------------- | --------------------------------------------------- |
| パッケージ名   | `@anthropic-ai/claude-agent-sdk`                    |
| 旧名           | `@anthropic-ai/claude-code`                         |
| 最新バージョン | 0.1.73+                                             |
| インストール   | `pnpm add @anthropic-ai/claude-agent-sdk`           |
| ドキュメント   | https://platform.claude.com/docs/agent-sdk/overview |

### 1.2 主要機能

- **query() API**: メインエントリポイント（ストリーミング対応）
- **Hooks システム**: ツール実行前後のカスタムロジック
- **Permission Control**: 4層の権限制御
- **MCP統合**: Model Context Protocolサポート
- **マルチプロバイダー**: Bedrock、Vertex AI、Foundry対応

---

## 2. コアAPI

### 2.1 query() 関数

SDKのメインエントリポイント。ストリーミング形式でメッセージを返却する。

```typescript
import {
  query,
  type SDKMessage,
  type Options,
} from "@anthropic-ai/claude-agent-sdk";

function query({
  prompt,
  options,
}: {
  prompt: string | AsyncIterable<SDKUserMessage>;
  options?: Options;
}): Query;

// Query extends AsyncGenerator<SDKMessage, void>
```

**基本使用例**:

```typescript
const conversation = query({
  prompt: "Hello, Claude!",
  options: {
    // 設定オプション
  },
});

// ストリーミング処理
for await (const message of conversation.stream()) {
  if (message.type === "assistant") {
    console.log(message.message);
  }
}
```

### 2.2 SDKMessage 型定義

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

#### SDKUserMessage

```typescript
type SDKUserMessage = {
  type: "user";
  uuid?: UUID;
  session_id: string;
  message: APIUserMessage;
  parent_tool_use_id: string | null;
};
```

#### SDKAssistantMessage

```typescript
type SDKAssistantMessage = {
  type: "assistant";
  uuid: UUID;
  session_id: string;
  message: APIAssistantMessage;
  parent_tool_use_id: string | null;
};
```

#### SDKResultMessage

```typescript
type SDKResultMessage = {
  type: "result";
  uuid: UUID;
  session_id: string;
  message: APIToolResultMessage;
  parent_tool_use_id: string | null;
};
```

### 2.3 Options インターフェース

```typescript
interface Options {
  // ツール設定
  tools?: ToolConfig;

  // パーミッション設定
  permissionMode?: PermissionMode;
  permissions?: PermissionRules;
  canUseTool?: (tool: ToolUseRequest) => Promise<boolean>;

  // Hooks設定
  hooks?: HookCallbacks;

  // MCP設定
  mcpServers?: MCPServerConfig[];

  // 認証設定（クラウドプロバイダー）
  provider?: "anthropic" | "bedrock" | "vertex" | "foundry";
}
```

---

## 3. Hooks システム

### 3.1 イベント一覧

| イベント名         | タイミング             | 用途                       |
| ------------------ | ---------------------- | -------------------------- |
| PreToolUse         | ツール実行前           | バリデーション、承認フロー |
| PostToolUse        | ツール実行後           | ロギング、副作用処理       |
| PostToolUseFailure | ツール実行失敗後       | エラーハンドリング         |
| Notification       | 通知発生時             | ユーザー通知               |
| UserPromptSubmit   | プロンプト送信時       | 入力バリデーション         |
| SessionStart       | セッション開始時       | 初期化処理                 |
| SessionEnd         | セッション終了時       | クリーンアップ             |
| Stop               | 停止要求時             | 終了処理                   |
| SubagentStart      | サブエージェント起動時 | サブエージェント管理       |
| SubagentStop       | サブエージェント停止時 | サブエージェント管理       |
| PreCompact         | コンパクト処理前       | コンテキスト管理           |
| PermissionRequest  | 権限要求時             | 動的権限制御               |

### 3.2 Hook コールバック型

```typescript
type HookCallback = (
  input: HookInput,
  toolUseID: string | undefined,
  options: { signal: AbortSignal },
) => Promise<HookJSONOutput>;

interface HookJSONOutput {
  proceed?: boolean; // 処理続行フラグ
  message?: string; // フィードバックメッセージ
  error?: string; // エラーメッセージ
  data?: Record<string, unknown>; // 追加データ
}
```

### 3.3 Hook 実装例

```typescript
const options: Options = {
  hooks: {
    PreToolUse: async (input, toolUseID, { signal }) => {
      // ツール使用前のバリデーション
      if (input.toolName === "Bash" && input.args.command?.includes("rm -rf")) {
        return {
          proceed: false,
          message: "危険なコマンドは許可されていません",
        };
      }
      return { proceed: true };
    },

    PostToolUse: async (input, toolUseID, { signal }) => {
      // ツール使用後のロギング
      console.log(`Tool ${input.toolName} completed`);
      return {};
    },

    PermissionRequest: async (input, toolUseID, { signal }) => {
      // 動的権限要求の処理
      // UIダイアログを表示して承認を待つなど
      return { proceed: true };
    },
  },
};
```

---

## 4. Permission Control

### 4.1 権限制御の4層

1. **Permission Modes**: 基本的な権限レベル設定
2. **canUseTool Callback**: プログラマティックな権限判定
3. **Hooks**: PreToolUse/PermissionRequest イベント
4. **Permission Rules**: 宣言的なルール定義

### 4.2 処理順序

```
PreToolUse Hook
    ↓
Deny Rules（拒否ルール）
    ↓
Allow Rules（許可ルール）
    ↓
Ask Rules（確認ルール）
    ↓
Permission Mode Check
    ↓
canUseTool Callback
    ↓
PostToolUse Hook
```

### 4.3 Permission Mode

```typescript
type PermissionMode =
  | "auto" // すべて自動承認
  | "ask" // すべて確認
  | "deny" // すべて拒否
  | "default"; // デフォルト（ツールごとの設定に従う）
```

### 4.4 Permission Rules

```typescript
interface PermissionRules {
  allow?: ToolPermissionRule[]; // 許可ルール
  deny?: ToolPermissionRule[]; // 拒否ルール
  ask?: ToolPermissionRule[]; // 確認ルール
}

interface ToolPermissionRule {
  tool: string | string[]; // ツール名またはパターン
  paths?: string[]; // 対象パス（オプション）
  commands?: string[]; // 対象コマンド（オプション）
}
```

**例**:

```typescript
const options: Options = {
  permissionMode: "default",
  permissions: {
    allow: [{ tool: "Read", paths: ["/project/**"] }, { tool: "Grep" }],
    deny: [{ tool: "Bash", commands: ["rm", "sudo"] }],
    ask: [{ tool: "Write" }, { tool: "Edit" }],
  },
};
```

---

## 5. Tools 設定

### 5.1 ツール設定形式

```typescript
type ToolConfig =
  | string[] // 許可リスト
  | { type: "preset"; preset: string } // プリセット
  | { type: "custom"; tools: ToolDef[] }; // カスタム定義
```

### 5.2 使用例

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

### 5.3 組み込みツール一覧

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

## 6. ストリーミング

### 6.1 基本パターン

```typescript
const conversation = query({ prompt: "Hello!" });

// v0.1.72以降: stream() メソッドを使用
for await (const message of conversation.stream()) {
  switch (message.type) {
    case "assistant":
      // アシスタントメッセージ
      process.stdout.write(message.message.content);
      break;
    case "partial":
      // 部分メッセージ（ストリーミング中）
      process.stdout.write(message.delta);
      break;
    case "result":
      // ツール実行結果
      console.log("Tool result:", message.message);
      break;
  }
}
```

### 6.2 バージョン互換性

| バージョン | メソッド名 | 備考          |
| ---------- | ---------- | ------------- |
| < 0.1.72   | receive()  | 旧API         |
| >= 0.1.72  | stream()   | 推奨（新API） |

---

## 7. エラーハンドリング

### 7.1 AbortSignal 活用

```typescript
const controller = new AbortController();
const { signal } = controller;

// タイムアウト設定
setTimeout(() => controller.abort(), 30000);

const conversation = query({
  prompt: "Long running task...",
  options: {
    hooks: {
      PreToolUse: async (input, toolUseID, { signal }) => {
        // signal.aborted をチェック
        if (signal.aborted) {
          return { proceed: false, message: "Aborted" };
        }
        return { proceed: true };
      },
    },
  },
});
```

### 7.2 タイムアウト設定

```typescript
// 環境変数によるタイムアウト設定
process.env.MCP_TOOL_TIMEOUT = "60000"; // 60秒

// Bashツール個別設定
const bashInput = {
  command: "long-running-script.sh",
  timeout: 300000, // 5分（最大: 600000ms = 10分）
};
```

### 7.3 レート制限対応

429エラー（レート制限）発生時は指数バックオフで自動リトライ:

```typescript
// SDKが自動的にリトライを行う
// リトライ間隔: 1s → 2s → 4s → 8s → 16s（最大5回）
```

---

## 8. 認証・マルチプロバイダー

### 8.1 環境変数設定

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
VERTEX_PROJECT_ID=your-project-id

# Foundry
CLAUDE_CODE_USE_FOUNDRY=1
FOUNDRY_API_KEY=...
```

### 8.2 プロバイダー明示指定

```typescript
const options: Options = {
  provider: "bedrock", // 'anthropic' | 'bedrock' | 'vertex' | 'foundry'
};
```

---

## 9. Electron統合パターン

### 9.1 アーキテクチャ

```
┌─────────────────────────────────────────────────────┐
│                  Electron App                       │
├─────────────────────────────────────────────────────┤
│  Renderer Process                                   │
│  ┌────────────────────────────────────────────────┐ │
│  │  UI Components (React)                         │ │
│  │  - ChatView                                    │ │
│  │  - AgentStatusPanel                            │ │
│  └────────────────────┬───────────────────────────┘ │
│                       │ IPC                         │
│  ┌────────────────────▼───────────────────────────┐ │
│  │  Main Process                                  │ │
│  │  ┌──────────────────────────────────────────┐  │ │
│  │  │  Agent SDK Integration                   │  │ │
│  │  │  - query() API                           │  │ │
│  │  │  - Hook handlers                         │  │ │
│  │  │  - Permission control                    │  │ │
│  │  └──────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 9.2 IPCチャネル設計

| チャネル               | 方向            | 用途                     |
| ---------------------- | --------------- | ------------------------ |
| `agent:start`          | Renderer → Main | エージェント起動         |
| `agent:stop`           | Renderer → Main | エージェント停止         |
| `agent:message`        | Renderer → Main | メッセージ送信           |
| `agent:stream`         | Main → Renderer | ストリーミングメッセージ |
| `agent:permission`     | Main → Renderer | 権限要求                 |
| `agent:permission:res` | Renderer → Main | 権限応答                 |
| `agent:status`         | Main → Renderer | ステータス更新           |

### 9.3 Main Process 実装例

```typescript
// apps/desktop/src/main/ipc/agentHandlers.ts
import { query, type Options } from "@anthropic-ai/claude-agent-sdk";
import { ipcMain, BrowserWindow } from "electron";

let currentConversation: ReturnType<typeof query> | null = null;
let abortController: AbortController | null = null;

export function setupAgentHandlers(mainWindow: BrowserWindow) {
  // エージェント起動
  ipcMain.handle("agent:start", async (event, config) => {
    abortController = new AbortController();

    const options: Options = {
      tools: config.tools || ["Read", "Edit", "Bash"],
      permissionMode: "ask",
      hooks: {
        PreToolUse: async (input, toolUseID, { signal }) => {
          // UIで権限確認
          const approved = await requestPermission(mainWindow, input);
          return { proceed: approved };
        },
        PostToolUse: async (input, toolUseID) => {
          // ステータス更新
          mainWindow.webContents.send("agent:status", {
            type: "tool_completed",
            tool: input.toolName,
          });
          return {};
        },
      },
    };

    currentConversation = query({
      prompt: config.initialPrompt,
      options,
    });

    // ストリーミング開始
    processStream(mainWindow);

    return { success: true };
  });

  // メッセージ送信
  ipcMain.handle("agent:message", async (event, message) => {
    if (!currentConversation) {
      return { success: false, error: "No active conversation" };
    }
    // 追加メッセージ処理
  });

  // エージェント停止
  ipcMain.handle("agent:stop", async () => {
    abortController?.abort();
    currentConversation = null;
    return { success: true };
  });
}

async function processStream(mainWindow: BrowserWindow) {
  if (!currentConversation) return;

  try {
    for await (const message of currentConversation.stream()) {
      mainWindow.webContents.send("agent:stream", message);
    }
  } catch (error) {
    mainWindow.webContents.send("agent:status", {
      type: "error",
      error: String(error),
    });
  }
}

async function requestPermission(
  mainWindow: BrowserWindow,
  input: HookInput,
): Promise<boolean> {
  return new Promise((resolve) => {
    mainWindow.webContents.send("agent:permission", input);

    ipcMain.once("agent:permission:res", (event, approved) => {
      resolve(approved);
    });
  });
}
```

### 9.4 Renderer Process 実装例

```typescript
// apps/desktop/src/renderer/hooks/useAgent.ts
import { useCallback, useEffect, useState } from "react";
import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";

interface AgentState {
  isRunning: boolean;
  messages: SDKMessage[];
  pendingPermission: HookInput | null;
}

export function useAgent() {
  const [state, setState] = useState<AgentState>({
    isRunning: false,
    messages: [],
    pendingPermission: null,
  });

  useEffect(() => {
    // ストリーミングメッセージ受信
    const unsubscribeStream = window.electronAPI.agent.onStream((message) => {
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, message],
      }));
    });

    // 権限要求受信
    const unsubscribePermission = window.electronAPI.agent.onPermission(
      (input) => {
        setState((prev) => ({
          ...prev,
          pendingPermission: input,
        }));
      },
    );

    return () => {
      unsubscribeStream();
      unsubscribePermission();
    };
  }, []);

  const startAgent = useCallback(async (prompt: string) => {
    await window.electronAPI.agent.start({ initialPrompt: prompt });
    setState((prev) => ({ ...prev, isRunning: true }));
  }, []);

  const stopAgent = useCallback(async () => {
    await window.electronAPI.agent.stop();
    setState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const respondToPermission = useCallback(async (approved: boolean) => {
    await window.electronAPI.agent.respondToPermission(approved);
    setState((prev) => ({ ...prev, pendingPermission: null }));
  }, []);

  return {
    ...state,
    startAgent,
    stopAgent,
    respondToPermission,
  };
}
```

---

## 10. プロジェクト固有の考慮事項

### 10.1 既存システムとの統合

本プロジェクト（AIWorkflowOrchestrator）との統合時に考慮すべき点:

| 既存機能              | Agent SDK統合方針             |
| --------------------- | ----------------------------- |
| LLM選択（chatSlice）  | Agent SDKのprovider設定と連携 |
| RAGパイプライン       | Agent ToolとしてRAG検索を実装 |
| IPC設計（aiHandlers） | Agent専用チャネルを追加       |
| テーマ/設定管理       | 既存electron-storeを流用      |

### 10.2 推奨実装順序

1. **基盤設定**: Agent SDK依存追加、型定義
2. **IPCチャネル**: agent:\* チャネル実装
3. **Hook実装**: PreToolUse/PostToolUse/PermissionRequest
4. **UI連携**: エージェントパネル、権限ダイアログ
5. **RAG統合**: カスタムToolとしてRAG検索実装
6. **テスト**: 単体・統合・E2Eテスト

### 10.3 セキュリティ考慮

| 項目             | 対策                                       |
| ---------------- | ------------------------------------------ |
| ファイルアクセス | Permission Rulesでプロジェクト外を拒否     |
| コマンド実行     | 危険コマンド（rm -rf等）をdenyルールで禁止 |
| APIキー          | 既存SafeStorage機構を流用                  |
| ユーザー承認     | PermissionRequest hookでUI確認を強制       |

---

## 11. 参考リソース

### 公式ドキュメント

- [Agent SDK Overview](https://platform.claude.com/docs/agent-sdk/overview)
- [Agent Skills Overview](https://platform.claude.com/docs/agents-and-tools/agent-skills/overview)
- [Permission Control](https://platform.claude.com/docs/agent-sdk/permissions)
- [Hooks Reference](https://platform.claude.com/docs/agent-sdk/hooks)

### GitHub

- [claude-agent-sdk-typescript](https://github.com/anthropics/claude-agent-sdk-typescript)
- [claude-agent-sdk-demos](https://github.com/anthropics/claude-agent-sdk-demos)

### npm

- [@anthropic-ai/claude-agent-sdk](https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk)

---

## 12. 次ステップ

本調査に基づき、以下を実施:

1. **claude-agent-sdkスキル作成**: `.claude/skills/claude-agent-sdk/` にスキルを新規作成
2. **Phase 1（要件定義）**: 本レポートを参照し、Agent統合の詳細要件を定義
3. **Phase 2（設計）**: IPC設計、コンポーネント設計を実施

---

_本レポートはPhase 0「SDK調査・スキル作成」の成果物として作成されました。_
