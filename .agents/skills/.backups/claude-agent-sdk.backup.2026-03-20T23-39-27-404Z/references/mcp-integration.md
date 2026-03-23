# MCP統合 リファレンス

## MCP (Model Context Protocol) 概要

MCPは、AIモデルが外部ツールやデータソースと対話するための標準プロトコル。Claude Agent SDKはMCPサーバーとの統合をネイティブにサポート。

---

## MCPサーバー設定

### 基本設定

```typescript
const options: Options = {
  mcpServers: [
    {
      name: "filesystem",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/dir"],
    },
  ],
};
```

### 複数サーバー設定

```typescript
const options: Options = {
  mcpServers: [
    {
      name: "filesystem",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/dir"],
    },
    {
      name: "github",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-github"],
      env: {
        GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_TOKEN,
      },
    },
    {
      name: "postgres",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-postgres"],
      env: {
        DATABASE_URL: process.env.DATABASE_URL,
      },
    },
  ],
};
```

---

## 公式MCPサーバー

| サーバー名   | パッケージ                              | 用途                       |
| ------------ | --------------------------------------- | -------------------------- |
| Filesystem   | @modelcontextprotocol/server-filesystem | ファイルシステムアクセス   |
| GitHub       | @modelcontextprotocol/server-github     | GitHubリポジトリ操作       |
| PostgreSQL   | @modelcontextprotocol/server-postgres   | PostgreSQLデータベース     |
| Brave Search | @modelcontextprotocol/server-brave-search | Web検索                  |
| Memory       | @modelcontextprotocol/server-memory     | 永続的なメモリストア       |

---

## 認証付きMCPサーバー

### 環境変数による認証

```typescript
const options: Options = {
  mcpServers: [
    {
      name: "github",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-github"],
      env: {
        GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_TOKEN,
      },
    },
  ],
};
```

### OAuth対応

```typescript
const options: Options = {
  mcpServers: [
    {
      name: "google-drive",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-google-drive"],
      env: {
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
      },
    },
  ],
};
```

---

## カスタムMCPサーバー

### TypeScript実装例

```typescript
// my-custom-mcp-server.ts
import { Server } from "@modelcontextprotocol/sdk/server";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";

const server = new Server({
  name: "my-custom-server",
  version: "1.0.0",
});

// ツール定義
server.setRequestHandler("tools/list", async () => ({
  tools: [
    {
      name: "my_custom_tool",
      description: "A custom tool that does something useful",
      inputSchema: {
        type: "object",
        properties: {
          input: { type: "string", description: "Input parameter" },
        },
        required: ["input"],
      },
    },
  ],
}));

// ツール実行
server.setRequestHandler("tools/call", async (request) => {
  if (request.params.name === "my_custom_tool") {
    const input = request.params.arguments.input;
    // カスタムロジック
    return {
      content: [
        {
          type: "text",
          text: `Processed: ${input}`,
        },
      ],
    };
  }
  throw new Error(`Unknown tool: ${request.params.name}`);
});

// サーバー起動
const transport = new StdioServerTransport();
await server.connect(transport);
```

### カスタムサーバーの使用

```typescript
const options: Options = {
  mcpServers: [
    {
      name: "my-custom",
      command: "node",
      args: ["./path/to/my-custom-mcp-server.js"],
    },
  ],
};
```

---

## セキュリティ考慮事項

### 認証情報の管理

| 項目                 | 推奨設定                          |
| -------------------- | --------------------------------- |
| APIキー              | 環境変数で管理                    |
| OAuthトークン        | セキュアストレージを使用          |
| データベース接続文字列 | シークレットマネージャーを使用  |
| アクセス権限         | 最小権限の原則を適用              |

### エンタープライズ対応

```typescript
const options: Options = {
  mcpServers: [
    {
      name: "internal-api",
      command: "node",
      args: ["./internal-mcp-server.js"],
      env: {
        // 集中管理されたシークレットストアから取得
        API_KEY: await secretManager.getSecret("internal-api-key"),
      },
    },
  ],
};
```

---

## トラブルシューティング

### サーバー起動エラー

```typescript
// MCPサーバーの起動ログを確認
const options: Options = {
  mcpServers: [
    {
      name: "filesystem",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/dir"],
      // 環境変数でデバッグを有効化
      env: {
        DEBUG: "mcp:*",
      },
    },
  ],
};
```

### 接続タイムアウト

```bash
# MCPツールのタイムアウト設定
MCP_TOOL_TIMEOUT=60000  # 60秒
```

### 権限エラー

MCPサーバーがアクセスするリソースに対する権限を確認:

```bash
# ファイルシステムサーバーの場合
ls -la /path/to/dir

# GitHubサーバーの場合
gh auth status
```

---

## ベストプラクティス

### すべきこと

- 認証情報は環境変数で管理
- 必要なMCPサーバーのみ有効化
- タイムアウトを適切に設定
- エラーハンドリングを実装

### 避けるべきこと

- 認証情報をコードにハードコード
- 不要なMCPサーバーを有効化
- タイムアウトなしの無期限待機
- エラーを握りつぶす

---

## 公式ドキュメント

| ドキュメント       | URL                                                      |
| ------------------ | -------------------------------------------------------- |
| MCP統合            | https://platform.claude.com/docs/en/agent-sdk/mcp        |
| MCP仕様            | https://modelcontextprotocol.io                          |
| MCP SDKリポジトリ  | https://github.com/modelcontextprotocol/sdk              |

---

## 関連ドキュメント

- [query-api.md](./query-api.md) - query() API
- [security-sandboxing.md](./security-sandboxing.md) - セキュリティとサンドボックス
