# MCP Protocol 仕様詳細

## 1. プロトコルバージョン

MCPは継続的に進化しており、バージョン互換性を考慮した設計が重要です。

### バージョン管理

```json
{
  "protocolVersion": "1.0",
  "capabilities": {
    "tools": true,
    "resources": true,
    "prompts": false
  }
}
```

## 2. メッセージフォーマット

### リクエスト構造

```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "method": "tools/call",
  "params": {
    "name": "tool_name",
    "arguments": {
      "param1": "value1"
    }
  }
}
```

### レスポンス構造

```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "結果テキスト"
      }
    ]
  }
}
```

### エラーレスポンス

```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "error": {
    "code": -32602,
    "message": "Invalid params",
    "data": {
      "details": "param1 is required"
    }
  }
}
```

## 3. ライフサイクルイベント

### 初期化シーケンス

```
1. クライアント → サーバー: initialize
2. サーバー → クライアント: initialize result
3. クライアント → サーバー: initialized (通知)
4. 通常通信開始
```

### シャットダウンシーケンス

```
1. クライアント → サーバー: shutdown
2. サーバー → クライアント: shutdown result
3. クライアント: exit通知またはプロセス終了
```

## 4. ツール呼び出しプロトコル

### ツールリスト取得

```json
{
  "method": "tools/list",
  "params": {}
}
```

### ツール実行

```json
{
  "method": "tools/call",
  "params": {
    "name": "file_read",
    "arguments": {
      "path": "/path/to/file"
    }
  }
}
```

## 5. リソースプロトコル

### リソースリスト

```json
{
  "method": "resources/list",
  "params": {}
}
```

### リソース読み取り

```json
{
  "method": "resources/read",
  "params": {
    "uri": "file:///path/to/resource"
  }
}
```

## 6. コンテンツタイプ

### サポートされるタイプ

| タイプ     | 説明             | 用途                 |
| ---------- | ---------------- | -------------------- |
| `text`     | プレーンテキスト | 一般的なレスポンス   |
| `image`    | Base64画像       | スクリーンショット等 |
| `resource` | リソース参照     | ファイル内容         |

### テキストコンテンツ

```json
{
  "type": "text",
  "text": "結果テキスト"
}
```

### 画像コンテンツ

```json
{
  "type": "image",
  "data": "base64-encoded-data",
  "mimeType": "image/png"
}
```

## 7. 並行処理

### 同時リクエスト

MCPサーバーは複数の同時リクエストを処理できる必要があります。

```
クライアント ────┬─── リクエスト1 ──▶ サーバー
                │
                ├─── リクエスト2 ──▶ サーバー
                │
                └─── リクエスト3 ──▶ サーバー
```

### キャンセル

```json
{
  "method": "$/cancelRequest",
  "params": {
    "id": "request-id-to-cancel"
  }
}
```

## 8. 通知メカニズム

### 進捗通知

```json
{
  "method": "$/progress",
  "params": {
    "token": "progress-token",
    "value": {
      "kind": "report",
      "message": "Processing...",
      "percentage": 50
    }
  }
}
```

### ログ通知

```json
{
  "method": "notifications/message",
  "params": {
    "level": "info",
    "logger": "server-name",
    "message": "ログメッセージ"
  }
}
```

## 9. 拡張ポイント

### カスタムメソッド

プレフィックス `x/` を使用してカスタムメソッドを定義:

```json
{
  "method": "x/custom-method",
  "params": {}
}
```

### カスタムケイパビリティ

```json
{
  "capabilities": {
    "experimental": {
      "customFeature": true
    }
  }
}
```

## 10. セキュリティ考慮事項

### 認証

MCPプロトコル自体には認証機構がないため、トランスポート層で実装:

- TLS/SSL暗号化
- 環境変数によるトークン管理
- ローカルプロセス分離

### 入力検証

すべてのパラメータは厳密に検証:

- 型チェック
- 範囲チェック
- サニタイゼーション
