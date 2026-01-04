# MCP Protocol 基礎知識

> **相対パス**: `references/basics.md`
> **読込条件**: 初回使用時

---

## MCP とは

| 概念                   | 説明                                 |
| ---------------------- | ------------------------------------ |
| Model Context Protocol | LLM とツールの標準通信プロトコル     |
| 目的                   | ツールの発見・実行・結果取得の標準化 |
| 構造                   | JSON-RPC ベースのメッセージング      |

---

## 主要コンポーネント

| コンポーネント | 役割                           |
| -------------- | ------------------------------ |
| MCP Server     | ツールを提供するサーバー       |
| MCP Client     | サーバーを呼び出すクライアント |
| Tool           | 実行可能な機能単位             |
| Resource       | 読み取り可能なデータソース     |

---

## 設定ファイル構造

```json
{
  "mcpServers": {
    "server-name": {
      "command": "node",
      "args": ["server.js"],
      "env": {
        "API_KEY": "${API_KEY}"
      }
    }
  }
}
```

---

## ツール定義構造

```json
{
  "name": "search_documents",
  "description": "Search documents by keyword",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Search query"
      }
    },
    "required": ["query"]
  }
}
```

---

## 主要設定項目

| 項目    | 説明             | 例                 |
| ------- | ---------------- | ------------------ |
| command | 実行コマンド     | `node`, `python`   |
| args    | コマンド引数     | `["server.js"]`    |
| env     | 環境変数         | `{"KEY": "value"}` |
| cwd     | 作業ディレクトリ | `/path/to/server`  |

---

## inputSchema 基本型

| 型      | 説明         | 例               |
| ------- | ------------ | ---------------- |
| string  | 文字列       | `"hello"`        |
| number  | 数値         | `42`, `3.14`     |
| boolean | 真偽値       | `true`, `false`  |
| array   | 配列         | `[1, 2, 3]`      |
| object  | オブジェクト | `{"key": "val"}` |

---

## 関連リソース

- **パターン詳細**: See [patterns.md](patterns.md)
- **仕様詳細**: See [mcp-specification.md](mcp-specification.md)
- **設定例**: See [config-examples.md](config-examples.md)
