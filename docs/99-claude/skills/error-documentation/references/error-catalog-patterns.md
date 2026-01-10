# エラーカタログパターン

## エラーコード体系

### 体系設計

```
ERR-{CATEGORY}-{SUBCATEGORY}-{NUMBER}

例:
ERR-AUTH-TOKEN-001  認証トークン関連エラー
ERR-DB-CONN-001     データベース接続エラー
ERR-API-VAL-001     API入力検証エラー
```

### カテゴリー例

| カテゴリー | 説明         | 例               |
| ---------- | ------------ | ---------------- |
| AUTH       | 認証・認可   | ERR-AUTH-xxx-xxx |
| DB         | データベース | ERR-DB-xxx-xxx   |
| API        | API関連      | ERR-API-xxx-xxx  |
| FILE       | ファイル操作 | ERR-FILE-xxx-xxx |
| NET        | ネットワーク | ERR-NET-xxx-xxx  |
| SYS        | システム     | ERR-SYS-xxx-xxx  |

## エラーエントリー構造

### 必須フィールド

````markdown
## ERR-AUTH-TOKEN-001: トークン有効期限切れ

**概要**: JWTトークンの有効期限が切れています

**原因**:

- トークン発行から長時間経過
- サーバー時刻とクライアント時刻のずれ

**解決策**:

1. `/auth/refresh` エンドポイントで新しいトークンを取得
2. 再ログインを実行

**関連エラー**:

- ERR-AUTH-TOKEN-002: トークン形式不正
- ERR-AUTH-SESSION-001: セッション切れ

**コード例**:

```typescript
// トークンリフレッシュ
const newToken = await api.refreshToken(refreshToken);
```
````

```

## トラブルシューティングフロー

```

エラー発生
↓
エラーコードの確認
↓
カタログで検索
↓
解決策の実行
↓
解決しない場合
↓
サポートチケット作成

````

## API エラーレスポンス形式

### RFC 7807 準拠

```json
{
  "type": "https://api.example.com/errors/ERR-AUTH-TOKEN-001",
  "title": "Token Expired",
  "status": 401,
  "detail": "The authentication token has expired. Please refresh or re-authenticate.",
  "instance": "/api/users/123",
  "errorCode": "ERR-AUTH-TOKEN-001",
  "timestamp": "2025-12-31T12:00:00Z",
  "traceId": "abc123"
}
````

## ランブック構造

### 基本構成

1. **アラート概要**: 何が起きたか
2. **影響範囲**: どのサービス/ユーザーに影響
3. **対応手順**: ステップバイステップの解決手順
4. **エスカレーション**: 解決しない場合の連絡先
5. **事後対応**: ポストモーテム記録方法
