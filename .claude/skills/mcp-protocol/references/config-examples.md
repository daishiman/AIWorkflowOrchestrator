# MCP設定例集

## 1. 基本的なMCPサーバー設定

### npxベースのサーバー

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/path/to/allowed/dir"
      ]
    }
  }
}
```

### Pythonベースのサーバー

```json
{
  "mcpServers": {
    "custom-server": {
      "command": "python",
      "args": ["-m", "my_mcp_server"],
      "cwd": "/path/to/server",
      "env": {
        "PYTHONPATH": "/path/to/libs"
      }
    }
  }
}
```

### Dockerベースのサーバー

```json
{
  "mcpServers": {
    "docker-server": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "my-mcp-server:latest"]
    }
  }
}
```

## 2. 外部サービス連携設定

### Google Drive連携

```json
{
  "mcpServers": {
    "google-drive": {
      "command": "npx",
      "args": ["-y", "@mcp/google-drive-server"],
      "env": {
        "GOOGLE_CLIENT_ID": "${GOOGLE_CLIENT_ID}",
        "GOOGLE_CLIENT_SECRET": "${GOOGLE_CLIENT_SECRET}",
        "GOOGLE_REFRESH_TOKEN": "${GOOGLE_REFRESH_TOKEN}"
      }
    }
  }
}
```

### Slack連携

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "@mcp/slack-server"],
      "env": {
        "SLACK_BOT_TOKEN": "${SLACK_BOT_TOKEN}",
        "SLACK_SIGNING_SECRET": "${SLACK_SIGNING_SECRET}"
      }
    }
  }
}
```

### GitHub連携

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

## 3. データベース連携設定

### SQLite（ローカル）

```json
{
  "mcpServers": {
    "sqlite": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sqlite",
        "/path/to/database.db"
      ]
    }
  }
}
```

### Turso（libSQL）

```json
{
  "mcpServers": {
    "turso": {
      "command": "npx",
      "args": ["-y", "@turso/mcp-server"],
      "env": {
        "TURSO_DATABASE_URL": "${TURSO_DATABASE_URL}",
        "TURSO_AUTH_TOKEN": "${TURSO_AUTH_TOKEN}"
      }
    }
  }
}
```

**環境変数設定例:**

```bash
# .env
# Local SQLite file
TURSO_DATABASE_URL=file:/path/to/local.db

# Or Turso cloud
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

## 4. 複数サーバー構成

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/workspace"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}"
      }
    }
  }
}
```

## 5. 環境別設定

### 開発環境

```json
{
  "mcpServers": {
    "dev-tools": {
      "command": "npx",
      "args": ["-y", "@mcp/dev-tools"],
      "env": {
        "NODE_ENV": "development",
        "DEBUG": "mcp:*"
      }
    }
  }
}
```

### 本番環境

```json
{
  "mcpServers": {
    "prod-tools": {
      "command": "npx",
      "args": ["-y", "@mcp/prod-tools"],
      "env": {
        "NODE_ENV": "production",
        "LOG_LEVEL": "warn"
      }
    }
  }
}
```

## 6. 高度な設定オプション

### タイムアウト設定

```json
{
  "mcpServers": {
    "slow-server": {
      "command": "node",
      "args": ["server.js"],
      "timeout": 60000
    }
  }
}
```

### 条件付き有効化

```json
{
  "mcpServers": {
    "optional-server": {
      "command": "npx",
      "args": ["-y", "@mcp/optional-server"],
      "disabled": false
    }
  }
}
```

## 7. カスタムサーバー実装例

### Node.js カスタムサーバー

```javascript
// server.js
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const {
  StdioServerTransport,
} = require("@modelcontextprotocol/sdk/server/stdio.js");

const server = new Server({
  name: "custom-server",
  version: "1.0.0",
});

server.setRequestHandler("tools/list", async () => ({
  tools: [
    {
      name: "custom_tool",
      description: "Custom tool description",
      inputSchema: {
        type: "object",
        properties: {
          input: { type: "string" },
        },
        required: ["input"],
      },
    },
  ],
}));

const transport = new StdioServerTransport();
server.connect(transport);
```

設定:

```json
{
  "mcpServers": {
    "custom": {
      "command": "node",
      "args": ["server.js"],
      "cwd": "/path/to/server"
    }
  }
}
```
