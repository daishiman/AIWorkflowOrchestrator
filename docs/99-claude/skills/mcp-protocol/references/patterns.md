# MCP Protocol パターン

> **相対パス**: `references/patterns.md`
> **読込条件**: 設計時

---

## サーバー設定パターン

### Node.js サーバー

```json
{
  "mcpServers": {
    "my-node-server": {
      "command": "node",
      "args": ["/path/to/server.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### Python サーバー

```json
{
  "mcpServers": {
    "my-python-server": {
      "command": "python",
      "args": ["-m", "my_mcp_server"],
      "env": {
        "PYTHONPATH": "/path/to/modules"
      }
    }
  }
}
```

---

## ツール定義パターン

### 必須パラメータ

```json
{
  "name": "create_file",
  "description": "Create a new file with content",
  "inputSchema": {
    "type": "object",
    "properties": {
      "path": {
        "type": "string",
        "description": "File path to create"
      },
      "content": {
        "type": "string",
        "description": "File content"
      }
    },
    "required": ["path", "content"]
  }
}
```

### オプションパラメータ

```json
{
  "name": "search",
  "description": "Search with optional filters",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Search query"
      },
      "limit": {
        "type": "number",
        "description": "Max results (default: 10)",
        "default": 10
      },
      "caseSensitive": {
        "type": "boolean",
        "description": "Case sensitive search",
        "default": false
      }
    },
    "required": ["query"]
  }
}
```

### 列挙型パラメータ

```json
{
  "name": "set_log_level",
  "inputSchema": {
    "type": "object",
    "properties": {
      "level": {
        "type": "string",
        "enum": ["debug", "info", "warn", "error"],
        "description": "Log level to set"
      }
    },
    "required": ["level"]
  }
}
```

---

## 環境変数パターン

### 機密情報の管理

```json
{
  "mcpServers": {
    "api-server": {
      "command": "node",
      "args": ["server.js"],
      "env": {
        "API_KEY": "${API_KEY}",
        "DATABASE_URL": "${DATABASE_URL}"
      }
    }
  }
}
```

**ベストプラクティス**:

- 機密情報は環境変数経由で渡す
- 設定ファイルにはプレースホルダーを使用
- `.env` ファイルは `.gitignore` に追加

---

## タイムアウト設定

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

| シナリオ   | 推奨値 (ms) |
| ---------- | ----------- |
| 高速ツール | 5000        |
| 標準ツール | 30000       |
| 重い処理   | 60000+      |

---

## エラーハンドリング

```typescript
// サーバー側の推奨実装
try {
  const result = await executeOperation();
  return { success: true, data: result };
} catch (error) {
  return {
    success: false,
    error: {
      code: "OPERATION_FAILED",
      message: error.message,
    },
  };
}
```

---

## 関連リソース

- **基礎知識**: See [basics.md](basics.md)
- **トラブルシュート**: See [troubleshooting.md](troubleshooting.md)
