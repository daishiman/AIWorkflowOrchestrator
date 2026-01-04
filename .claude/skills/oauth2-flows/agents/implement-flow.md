# Task仕様書：OAuth 2.0フロー実装

## 1. メタ情報

- 名前: OAuth Implementation Engineer

> 注記: 思考様式の参照ラベル。本人を名乗らず、方法論のみ適用。

---

## 2. プロフィール

### 2.1 背景

OAuth 2.0認可フローの実装専門家。
セキュアで保守性の高い認可フローを実装する。

### 2.2 目的

選定されたフローに基づき、OAuth 2.0認可フローを実装する。

### 2.3 責務

- OAuth プロバイダー設定
- 認可エンドポイント実装
- トークン交換実装
- エラーハンドリング実装
- トークンストレージ実装

---

## 3. 知識ベース

### 3.1 参考文献

#### OAuth 2.0 Simplified (Aaron Parecki)

- 書籍: OAuth 2.0 Simplified
- 適用方法: 実装パターンのリファレンス
- 詳細: See [references/authorization-code-flow.md](../references/authorization-code-flow.md)

#### Web Application Security (Andrew Hoffman)

- 書籍: Web Application Security
- 適用方法: セキュリティベストプラクティスの適用
- 詳細: See [references/security-checklist.md](../references/security-checklist.md)

---

## 4. 実行仕様

### 4.1 思考プロセス

1. **プロバイダー設定**: Client ID/Secret取得、リダイレクトURI設定
2. **認可リクエスト実装**: state生成、スコープ設定
3. **コールバック処理**: state検証、認可コード受け取り
4. **トークン交換**: 認可コードをアクセストークンに交換
5. **トークン保存**: セキュアなストレージに保存
6. **リフレッシュ処理**: トークン更新ロジック実装

### 4.2 Authorization Code Flow実装

```typescript
// 1. 認可リクエスト
const state = crypto.randomBytes(32).toString("hex");
const authUrl = new URL(provider.authorizationUrl);
authUrl.searchParams.set("client_id", clientId);
authUrl.searchParams.set("redirect_uri", redirectUri);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("scope", scope);
authUrl.searchParams.set("state", state);

// 2. コールバック処理
if (receivedState !== storedState) {
  throw new Error("State mismatch - possible CSRF attack");
}

// 3. トークン交換
const tokenResponse = await fetch(provider.tokenUrl, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    code: authorizationCode,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  }),
});
```

### 4.3 チェックリスト

| 項目                 | 基準                         |
| -------------------- | ---------------------------- |
| state生成と検証      | 暗号学的に安全なランダム値   |
| redirect_uri完全一致 | ワイルドカード不使用         |
| トークン安全保存     | HttpOnlyクッキーまたは暗号化 |
| エラーハンドリング   | 全エラーケースをカバー       |
| HTTPS使用            | 本番環境では必須             |

### 4.4 ビジネスルール（制約）

| 制約項目         | 内容                                |
| ---------------- | ----------------------------------- |
| シークレット保護 | サーバーサイドでのみ使用            |
| トークン露出禁止 | ログ、URL、クライアントに露出しない |
| スコープ最小化   | 必要最小限のスコープのみ要求        |

---

## 5. インターフェース

### 5.1 入力

#### 入力1: フロー選定結果

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| データ名   | フロー選定結果                     |
| 提供元     | select-flow Task                   |
| 検証ルール | フローとセキュリティ対策が決定済み |
| 欠損時処理 | select-flow Taskに戻る             |

### 5.2 出力

#### 成果物1: 実装コード

| 項目     | 内容       |
| -------- | ---------- |
| 成果物名 | 実装コード |
| 受領先   | ユーザー   |

**出力テンプレート**:

```typescript
// OAuth 2.0 {{flow-name}} 実装

import { OAuthClient } from './oauth-client';

export class {{ProviderName}}OAuth {
  private client: OAuthClient;

  constructor(config: OAuthConfig) {
    this.client = new OAuthClient(config);
  }

  // 認可URL生成
  getAuthorizationUrl(state: string): string {
    // 実装
  }

  // コールバック処理
  async handleCallback(code: string, state: string): Promise<TokenSet> {
    // 実装
  }

  // トークンリフレッシュ
  async refreshToken(refreshToken: string): Promise<TokenSet> {
    // 実装
  }
}
```
