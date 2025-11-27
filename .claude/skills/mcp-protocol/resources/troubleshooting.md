# MCP トラブルシューティングガイド

## 1. 接続問題

### サーバーが起動しない

**症状**: MCPサーバーが起動せず、ツールが認識されない

**チェックポイント**:
1. コマンドパスが正しいか確認
2. 必要な依存関係がインストールされているか確認
3. 環境変数が正しく設定されているか確認

**解決策**:

```bash
# npxキャッシュをクリア
npx clear-npx-cache

# 手動でサーバーを起動してエラー確認
npx -y @modelcontextprotocol/server-filesystem /path

# 環境変数の確認
echo $REQUIRED_ENV_VAR
```

### タイムアウトエラー

**症状**: `Connection timed out` エラー

**原因と対策**:
| 原因 | 対策 |
|------|------|
| サーバー起動が遅い | timeout設定を増加 |
| ネットワーク問題 | 接続確認 |
| リソース不足 | メモリ/CPU確認 |

**設定例**:
```json
{
  "mcpServers": {
    "slow-server": {
      "command": "...",
      "timeout": 120000
    }
  }
}
```

## 2. 認証エラー

### 環境変数未設定

**症状**: `API key not found` または `Authentication failed`

**診断**:
```bash
# 環境変数の存在確認
env | grep API_KEY

# .envファイルの確認
cat .env | grep API_KEY
```

**解決策**:
1. `.env` ファイルに環境変数を追加
2. シェル設定に環境変数をエクスポート
3. Claude Desktop設定で環境変数を指定

### トークン期限切れ

**症状**: `Token expired` または `Invalid token`

**解決策**:
1. トークンを再生成
2. リフレッシュトークンの実装
3. 有効期限の確認

## 3. ツール実行エラー

### パラメータ検証失敗

**症状**: `Invalid params` エラー

**診断チェックリスト**:
- [ ] 必須パラメータがすべて含まれているか
- [ ] パラメータの型が正しいか
- [ ] 値が許容範囲内か

**デバッグ方法**:
```json
{
  "method": "tools/call",
  "params": {
    "name": "tool_name",
    "arguments": {
      "param1": "value1"  // ここを確認
    }
  }
}
```

### ツール未定義

**症状**: `Method not found` または `Tool not found`

**原因**:
1. サーバーがツールを公開していない
2. ツール名のスペルミス
3. サーバーバージョン不一致

**確認コマンド**:
```bash
# 利用可能なツールをリスト
# MCPデバッグモードで確認
DEBUG=mcp:* npx -y @server/name
```

## 4. パフォーマンス問題

### レスポンス遅延

**診断**:
1. ネットワークレイテンシの測定
2. サーバー処理時間の確認
3. ペイロードサイズの確認

**最適化策**:
| 問題 | 対策 |
|------|------|
| 大量データ | ページネーション実装 |
| 頻繁な呼び出し | キャッシュ活用 |
| 重い処理 | 非同期処理 |

### メモリリーク

**症状**: メモリ使用量が継続的に増加

**診断**:
```bash
# Node.jsプロセスのメモリ監視
node --inspect server.js
```

**対策**:
1. 接続プールの制限
2. キャッシュの有効期限設定
3. 定期的なガベージコレクション

## 5. よくあるエラーメッセージ

### エラーコード別対応表

| エラーコード | メッセージ | 対応 |
|-------------|-----------|------|
| -32700 | Parse error | JSONフォーマット確認 |
| -32600 | Invalid request | リクエスト構造確認 |
| -32601 | Method not found | メソッド名確認 |
| -32602 | Invalid params | パラメータ確認 |
| -32603 | Internal error | サーバーログ確認 |

### 具体的なエラー対応

**`ECONNREFUSED`**:
```
Error: connect ECONNREFUSED 127.0.0.1:3000
```
→ サーバーが起動しているか確認

**`EPERM`**:
```
Error: EPERM: operation not permitted
```
→ ファイル/ディレクトリのアクセス権限を確認

**`ENOENT`**:
```
Error: ENOENT: no such file or directory
```
→ パスが正しいか確認

## 6. デバッグ手順

### Step 1: ログ有効化

```bash
DEBUG=mcp:* node server.js
```

### Step 2: 手動テスト

```bash
# MCPリクエストを直接送信
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node server.js
```

### Step 3: 設定ファイル検証

```bash
# JSON構文チェック
jq . claude_mcp_config.json
```

### Step 4: 依存関係確認

```bash
# パッケージの確認
npm list @modelcontextprotocol/sdk
```

## 7. 緊急対応

### サーバークラッシュ時

1. エラーログを収集
2. 設定を最小構成に変更
3. 1つずつツールを有効化してテスト

### データ破損時

1. バックアップから復元
2. トランザクションログの確認
3. 整合性チェックの実行

## 8. 予防策

### 監視設定

- サーバー稼働状態の定期チェック
- レスポンス時間のモニタリング
- エラー率のアラート設定

### ベストプラクティス

1. 設定変更前にバックアップ
2. 段階的なロールアウト
3. 定期的なログレビュー
