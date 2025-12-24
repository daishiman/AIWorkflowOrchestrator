---
name: .claude/skills/api-connector-design/SKILL.md
description: |
  外部APIとの統合設計パターンに関する専門知識。
  RESTful API、GraphQL、WebSocket等の統合設計と実装指針を提供します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/api-connector-design/resources/authentication-flows.md`: OAuth 2.0、API Key、JWTなどの認証フロー詳細
  - `.claude/skills/api-connector-design/resources/error-handling-patterns.md`: API統合におけるエラーハンドリングパターン
  - `.claude/skills/api-connector-design/resources/rate-limiting-strategies.md`: Rate Limiting対策とリトライ戦略
  - `.claude/skills/api-connector-design/templates/api-client-template.ts`: APIクライアント実装テンプレート
  - `.claude/skills/api-connector-design/templates/auth-config-template.json`: 認証設定ファイルテンプレート
  - `.claude/skills/api-connector-design/scripts/test-api-connection.mjs`: API接続テストスクリプト

  使用タイミング:
  - 外部API（Google Drive, Slack, GitHub等）との統合設計時
  - 認証フロー（OAuth 2.0, API Key等）の実装設計時
  - Rate Limitingやリトライ戦略の設計時
  - API統合アーキテクチャのレビュー時
version: 1.0.1
tags: [api, integration, rest, graphql, websocket, authentication]
related_skills:
  - .claude/skills/mcp-protocol/SKILL.md
  - .claude/skills/tool-security/SKILL.md
  - .claude/skills/integration-patterns/SKILL.md
---

# API Connector Design スキル

## 概要

外部APIとの統合において、適切な設計パターンと実装指針を提供します。RESTful API、GraphQL、WebSocketなど様々なAPI形式に対応し、認証、エラーハンドリング、パフォーマンス最適化を網羅します。

## API統合タイプ分類

### 1. RESTful API

**特徴**:

- HTTPメソッドによるCRUD操作
- ステートレス通信
- リソース指向設計

**設計パターン**:

```
GET    /resources          - リソース一覧取得
GET    /resources/{id}     - 個別リソース取得
POST   /resources          - リソース作成
PUT    /resources/{id}     - リソース更新（全体）
PATCH  /resources/{id}     - リソース更新（部分）
DELETE /resources/{id}     - リソース削除
```

**ベストプラクティス**:

- Content-Type: application/json の一貫した使用
- 適切なHTTPステータスコードの返却
- HALまたはJSON:APIフォーマットの採用検討

### 2. GraphQL

**特徴**:

- スキーマベースの型システム
- 単一エンドポイント
- 柔軟なクエリ構造

**設計パターン**:

```graphql
query {
  user(id: "123") {
    name
    email
    posts {
      title
    }
  }
}

mutation {
  createUser(input: { name: "John" }) {
    id
    name
  }
}
```

**ベストプラクティス**:

- N+1問題の回避（DataLoader使用）
- 複雑度制限の実装
- 適切なエラーハンドリング

### 3. WebSocket

**特徴**:

- 双方向リアルタイム通信
- 持続的接続
- 低レイテンシ

**設計パターン**:

```
Client <──────────────> Server
    │ CONNECT              │
    │ ─────────────────────▶
    │ MESSAGE              │
    │ ◀────────────────────│
    │ MESSAGE              │
    │ ─────────────────────▶
    │ DISCONNECT           │
    │ ─────────────────────▶
```

**ベストプラクティス**:

- ハートビートによる接続維持
- 再接続ロジックの実装
- メッセージキューイング

### 4. Webhook

**特徴**:

- イベント駆動型
- プッシュ型通知
- 非同期処理

**設計パターン**:

```
┌─────────┐   Event発生   ┌──────────┐   POST   ┌─────────┐
│ Service │ ────────────▶ │ Webhook  │ ────────▶│ Your    │
│         │               │ Endpoint │          │ Server  │
└─────────┘               └──────────┘          └─────────┘
```

## 認証・認可パターン

### API Key認証

```javascript
// ヘッダーベース
headers: {
  'X-API-Key': process.env.API_KEY
}

// クエリパラメータベース（非推奨）
url: `${baseUrl}?api_key=${apiKey}`
```

**セキュリティ考慮事項**:

- [ ] 環境変数での管理
- [ ] HTTPS通信の強制
- [ ] ローテーション計画

### OAuth 2.0

**Authorization Code Flow**:

```
1. Client → Authorization Server: 認可リクエスト
2. User: ログイン・承認
3. Authorization Server → Client: 認可コード
4. Client → Authorization Server: トークンリクエスト
5. Authorization Server → Client: アクセストークン
```

**実装チェックリスト**:

- [ ] state パラメータによるCSRF対策
- [ ] PKCE（Proof Key for Code Exchange）実装
- [ ] リフレッシュトークンの安全な保存
- [ ] トークン有効期限管理

### JWT（JSON Web Token）

```javascript
// トークン構造
header.payload.signature

// 検証ステップ
1. 署名検証
2. 有効期限（exp）チェック
3. 発行者（iss）検証
4. 対象者（aud）検証
```

## Rate Limiting対策

### 検出方法

```javascript
// レスポンスヘッダーから制限情報を取得
const rateLimitInfo = {
  limit: response.headers["X-RateLimit-Limit"],
  remaining: response.headers["X-RateLimit-Remaining"],
  reset: response.headers["X-RateLimit-Reset"],
};
```

### リトライ戦略

**指数バックオフ**:

```javascript
const delay = Math.min(
  initialDelay * Math.pow(backoffFactor, attempt),
  maxDelay,
);
// ジッターを追加（同時リトライ回避）
const jitteredDelay = delay * (0.5 + Math.random());
```

**リトライ条件**:
| HTTPステータス | リトライ可能 | 説明 |
|---------------|-------------|------|
| 429 | ✅ | Too Many Requests |
| 500 | ✅ | Internal Server Error |
| 502 | ✅ | Bad Gateway |
| 503 | ✅ | Service Unavailable |
| 504 | ✅ | Gateway Timeout |
| 400 | ❌ | Bad Request |
| 401 | ❌ | Unauthorized |
| 403 | ❌ | Forbidden |
| 404 | ❌ | Not Found |

## 設計時の判断基準

### API統合チェックリスト

- [ ] 適切なAPI統合タイプが選択されているか？
- [ ] 認証方式はセキュリティ要件を満たすか？
- [ ] Rate Limitingとリトライ戦略は定義されているか？
- [ ] タイムアウト設定は適切か？
- [ ] エラーハンドリングは網羅的か？

### パフォーマンスチェックリスト

- [ ] 接続プーリングが実装されているか？
- [ ] キャッシュ戦略が定義されているか？
- [ ] ペイロードサイズは最適化されているか？
- [ ] 圧縮（gzip）が有効か？

## リソース参照

詳細なパターンと実装例については以下を参照:

- **認証フロー詳細**: `cat .claude/skills/api-connector-design/resources/authentication-flows.md`
- **Rate Limiting戦略**: `cat .claude/skills/api-connector-design/resources/rate-limiting-strategies.md`
- **エラーハンドリング**: `cat .claude/skills/api-connector-design/resources/error-handling-patterns.md`

## テンプレート参照

- **APIクライアントテンプレート**: `cat .claude/skills/api-connector-design/templates/api-client-template.ts`
- **認証設定テンプレート**: `cat .claude/skills/api-connector-design/templates/auth-config-template.json`

## スクリプト実行

```bash
# API接続テスト
node .claude/skills/api-connector-design/scripts/test-api-connection.mjs <base-url>

# 認証フロー検証
node .claude/skills/api-connector-design/scripts/validate-auth-flow.mjs <config.json>
```

## 関連スキル

| スキル                                          | 用途             |
| ----------------------------------------------- | ---------------- |
| `.claude/skills/mcp-protocol/SKILL.md`          | MCP設定          |
| `.claude/skills/tool-security/SKILL.md`         | セキュリティ設定 |
| `.claude/skills/resource-oriented-api/SKILL.md` | リソース設計     |
| `.claude/skills/integration-patterns/SKILL.md`  | 統合パターン     |
