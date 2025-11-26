# Authorization Code Flow 詳細実装

## フロー全体図

```
┌─────────┐                                      ┌──────────────┐
│ Client  │                                      │ Auth Server  │
│  App    │                                      │  (Provider)  │
└────┬────┘                                      └──────┬───────┘
     │                                                  │
     │ 1. Redirect to /authorize                       │
     │    + client_id, redirect_uri, scope, state      │
     ├────────────────────────────────────────────────>│
     │                                                  │
     │                                                  │ 2. User Login
     │                                                  │    & Consent
     │                                                  │
     │ 3. Redirect to redirect_uri                     │
     │    + code, state                                │
     │<────────────────────────────────────────────────┤
     │                                                  │
     │ 4. POST to /token                               │
     │    + code, client_id, client_secret             │
     ├────────────────────────────────────────────────>│
     │                                                  │
     │ 5. Access Token + Refresh Token                 │
     │<────────────────────────────────────────────────┤
     │                                                  │
```

## 実装ステップ

### Step 1: 認可リクエストの構築

**目的**: ユーザーを認可サーバーのログイン画面にリダイレクト

**必須パラメータ**:
```typescript
interface AuthorizationRequest {
  response_type: 'code';           // 必須: 認可コードフローを指定
  client_id: string;               // 必須: アプリケーションID
  redirect_uri: string;            // 必須: コールバックURL
  scope: string;                   // 必須: 要求する権限
  state: string;                   // 必須: CSRF対策用ランダム文字列
}
```

**実装例**:
```typescript
function initiateOAuthFlow(provider: OAuthProvider): void {
  // State生成（CSRF対策）
  const state = generateSecureRandomString(32);
  sessionStorage.setItem(`oauth_state_${provider}`, state);

  // 認可URLを構築
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.OAUTH_CLIENT_ID!,
    redirect_uri: process.env.OAUTH_REDIRECT_URI!,
    scope: 'user:email user:profile',
    state: state,
  });

  // リダイレクト
  window.location.href = `${provider.authorizeUrl}?${params.toString()}`;
}
```

**セキュリティチェックリスト**:
- [ ] stateは暗号学的に安全な乱数生成器で生成されているか？
- [ ] redirect_uriはOAuthプロバイダーに事前登録されているか？
- [ ] HTTPSを使用しているか（ローカル開発除く）？
- [ ] スコープは最小権限の原則に従っているか？

### Step 2: 認可コールバックの処理

**目的**: 認可コードとstateパラメータを受け取り、検証する

**コールバックURL例**:
```
https://yourapp.com/api/auth/callback?code=ABC123&state=XYZ789
```

**実装例**:
```typescript
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  // エラーチェック
  if (error) {
    return handleOAuthError(error);
  }

  // State検証（CSRF対策）
  const savedState = sessionStorage.getItem('oauth_state_provider');
  if (state !== savedState) {
    throw new Error('State mismatch - potential CSRF attack');
  }

  // 認可コード検証
  if (!code) {
    throw new Error('Authorization code missing');
  }

  // State削除（一度のみ使用）
  sessionStorage.removeItem('oauth_state_provider');

  // トークン交換へ進む
  return exchangeCodeForToken(code);
}
```

**セキュリティチェックリスト**:
- [ ] errorパラメータは適切に処理されているか？
- [ ] stateパラメータは検証されているか？
- [ ] stateは使用後に削除されているか？
- [ ] 認可コードは一度のみ使用されているか？

### Step 3: トークン交換

**目的**: 認可コードをアクセストークンに交換

**トークンリクエスト**:
```typescript
async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    client_id: process.env.OAUTH_CLIENT_ID!,
    client_secret: process.env.OAUTH_CLIENT_SECRET!,
    redirect_uri: process.env.OAUTH_REDIRECT_URI!,
  });

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new OAuthTokenError(error);
  }

  return await response.json();
}
```

**レスポンス例**:
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "def50200a1b2c3d4e5f6...",
  "scope": "user:email user:profile"
}
```

**セキュリティチェックリスト**:
- [ ] client_secretはサーバーサイドのみで使用されているか？
- [ ] HTTPSを使用しているか？
- [ ] トークンレスポンスは安全に保管されているか？
- [ ] エラーレスポンスは適切に処理されているか？

### Step 4: トークン使用

**API呼び出し時**:
```typescript
async function fetchProtectedResource(accessToken: string): Promise<any> {
  const response = await fetch('https://api.example.com/user', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  });

  if (response.status === 401) {
    // トークン期限切れ → リフレッシュフローへ
    throw new TokenExpiredError();
  }

  return await response.json();
}
```

## エラーハンドリング

### 認可エラータイプ

| エラーコード | 意味 | 対応 |
|------------|------|------|
| `invalid_request` | リクエストパラメータ不正 | パラメータ修正 |
| `unauthorized_client` | クライアント認証失敗 | Client ID/Secret確認 |
| `access_denied` | ユーザーが拒否 | ユーザーに再試行促す |
| `unsupported_response_type` | response_type非対応 | パラメータ確認 |
| `invalid_scope` | スコープ不正 | スコープ定義修正 |
| `server_error` | サーバーエラー | リトライまたはエスカレーション |
| `temporarily_unavailable` | 一時的障害 | Exponential Backoffでリトライ |

### トークンエラータイプ

| エラーコード | 意味 | 対応 |
|------------|------|------|
| `invalid_client` | クライアント認証失敗 | Client Secret確認 |
| `invalid_grant` | 認可コード不正/期限切れ | 再認証フロー |
| `unauthorized_client` | 許可されていないクライアント | 設定確認 |
| `unsupported_grant_type` | grant_type非対応 | パラメータ修正 |
| `invalid_scope` | スコープ不正 | スコープ定義確認 |

## パフォーマンス最適化

### 認可リクエストの最適化
- 不要なスコープ要求を避ける（ページロード遅延軽減）
- プロバイダー選択画面のプリロード（UX向上）

### トークン交換の最適化
- タイムアウト設定（デフォルト10秒推奨）
- 並列トークン交換禁止（同一codeの再利用検出）
- キャッシュ戦略（取得済みユーザー情報）

## トラブルシューティング

### よくある問題と解決策

**問題**: "State mismatch" エラー
- **原因**: stateパラメータが一致しない
- **解決**: セッションストレージの保存・取得ロジック確認、同一ブラウザセッションでのフロー完結確認

**問題**: "Redirect URI mismatch" エラー
- **原因**: redirect_uriがプロバイダー登録と一致しない
- **解決**: 完全一致確認（スキーム、ホスト、ポート、パス）、環境変数確認

**問題**: "Invalid grant" エラー
- **原因**: 認可コードが期限切れまたは再利用
- **解決**: 認可コードは取得後即座に交換、再利用しない、タイムアウト処理実装

**問題**: トークン取得後にAPIが401を返す
- **原因**: スコープ不足、トークン不正
- **解決**: 要求したスコープと必要なスコープの一致確認、トークンのJWT検証

## まとめ

**OAuth 2.0実装の鉄則**:
1. **フロー選択**: アプリケーションタイプに応じた適切なフロー
2. **PKCE必須**: SPAとモバイルアプリでは必ず使用
3. **State検証**: CSRF対策として必ず実装
4. **最小権限**: 必要最小限のスコープのみ要求
5. **セキュアストレージ**: トークンは安全に保管
6. **エラーハンドリング**: 包括的なエラー処理とログ記録

**次のステップ**:
- セッション管理スキルでトークンライフサイクルを学ぶ
- NextAuth.jsパターンスキルで実装を簡略化
- セキュリティヘッダースキルで多層防御を構築
