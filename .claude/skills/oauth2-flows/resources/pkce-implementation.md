# PKCE (Proof Key for Code Exchange) 実装詳細

## PKCEとは

**目的**: パブリッククライアント（SPA、モバイルアプリ）でのOAuth 2.0を安全にする

**問題**: クライアントシークレットを安全に保管できない環境での認可コード窃取リスク

**解決**: 動的に生成されたCode VerifierとCode Challengeによる検証

## PKCE拡張フロー

```
┌─────────┐                                      ┌──────────────┐
│ Client  │                                      │ Auth Server  │
│  (SPA)  │                                      │  (Provider)  │
└────┬────┘                                      └──────┬───────┘
     │                                                  │
     │ 0. Generate Code Verifier (random)              │
     │    code_verifier = random(43-128 chars)         │
     │                                                  │
     │ 0. Generate Code Challenge                      │
     │    code_challenge = SHA256(code_verifier)       │
     │                                                  │
     │ 1. Redirect to /authorize                       │
     │    + code_challenge, code_challenge_method=S256 │
     ├────────────────────────────────────────────────>│
     │                                                  │
     │                                                  │ 2. Store
     │                                                  │    code_challenge
     │                                                  │
     │ 3. Redirect with code                           │
     │<────────────────────────────────────────────────┤
     │                                                  │
     │ 4. POST to /token                               │
     │    + code, code_verifier                        │
     ├────────────────────────────────────────────────>│
     │                                                  │
     │                                                  │ 5. Verify:
     │                                                  │    SHA256(code_verifier)
     │                                                  │    == code_challenge
     │                                                  │
     │ 6. Access Token (if verified)                   │
     │<────────────────────────────────────────────────┤
```

## 実装詳細

### Step 1: Code Verifier生成

**要件**:
- 長さ: 43-128文字
- 文字セット: `[A-Z a-z 0-9 - . _ ~]`（URL-safe）
- ランダム性: 暗号学的に安全な乱数生成器使用

**実装例（ブラウザ）**:
```typescript
function generateCodeVerifier(): string {
  const array = new Uint8Array(32); // 32バイト = 256ビット
  crypto.getRandomValues(array);
  return base64URLEncode(array); // 約43文字
}

function base64URLEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...Array.from(buffer)));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
```

**実装例（Node.js）**:
```typescript
import crypto from 'crypto';

function generateCodeVerifier(): string {
  return base64URLEncode(crypto.randomBytes(32));
}

function base64URLEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
```

**検証**:
- [ ] Code Verifierは43文字以上128文字以下か？
- [ ] URL-safe文字のみ使用されているか？
- [ ] 暗号学的に安全な乱数生成器を使用しているか？

### Step 2: Code Challenge生成

**方法**:
- **S256（推奨）**: `BASE64URL(SHA256(code_verifier))`
- **plain（非推奨）**: `code_verifier`（そのまま）

**実装例（S256）**:
```typescript
async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(hash));
}
```

**判断基準**:
- [ ] code_challenge_methodは"S256"を使用しているか？
- [ ] "plain"は使用していないか（セキュリティリスク）？

### Step 3: 認可リクエスト（PKCE付き）

**拡張パラメータ**:
```typescript
interface PKCEAuthorizationRequest extends AuthorizationRequest {
  code_challenge: string;           // 必須（PKCE）
  code_challenge_method: 'S256';    // 必須（PKCE）
}
```

**実装例**:
```typescript
async function initiateOAuthFlowWithPKCE(provider: OAuthProvider): Promise<void> {
  // Code Verifier生成
  const codeVerifier = generateCodeVerifier();
  sessionStorage.setItem('pkce_code_verifier', codeVerifier);

  // Code Challenge生成
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // State生成
  const state = generateSecureRandomString(32);
  sessionStorage.setItem('oauth_state', state);

  // 認可URLを構築
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.OAUTH_CLIENT_ID!,
    redirect_uri: process.env.OAUTH_REDIRECT_URI!,
    scope: 'user:email',
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  window.location.href = `${provider.authorizeUrl}?${params.toString()}`;
}
```

**セキュリティチェックリスト**:
- [ ] Code VerifierはセッションストレージにL保管されているか？
- [ ] Code Challengeは正しく生成されているか（S256）？
- [ ] code_challenge_methodは"S256"が指定されているか？

### Step 4: トークン交換（PKCE付き）

**実装例**:
```typescript
async function exchangeCodeForTokenWithPKCE(code: string): Promise<TokenResponse> {
  // Code Verifierを取得
  const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
  if (!codeVerifier) {
    throw new Error('Code verifier missing - PKCE flow broken');
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    client_id: process.env.OAUTH_CLIENT_ID!,
    redirect_uri: process.env.OAUTH_REDIRECT_URI!,
    code_verifier: codeVerifier, // PKCEパラメータ
  });

  // Client Secretは不要（PKCE使用時）
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  // Code Verifier削除（一度のみ使用）
  sessionStorage.removeItem('pkce_code_verifier');

  if (!response.ok) {
    throw new OAuthTokenError(await response.json());
  }

  return await response.json();
}
```

**重要ポイント**:
- `client_secret`は送信しない（PKCEがその代わり）
- `code_verifier`は元の文字列（ハッシュ化しない）
- 使用後にCode Verifierを削除

**検証**:
- [ ] Code Verifierは元の文字列が送信されているか？
- [ ] Code Verifierは使用後に削除されているか？
- [ ] Client Secretは送信されていないか？

## セキュリティ分析

### PKCE導入前の脆弱性

**シナリオ: 認可コードインターセプト攻撃**
1. 攻撃者がカスタムURLスキームを登録（例: `myapp://`）
2. 正規アプリと同じredirect URIを設定
3. ユーザーが認証 → 認可コードが攻撃者のアプリにリダイレクト
4. 攻撃者が認可コードでトークン取得（Client Secretなしで可能）

### PKCE導入後の防御

**防御メカニズム**:
1. Code Verifierは正規アプリのメモリにのみ存在
2. 攻撃者は認可コードを窃取してもCode Verifierを持たない
3. トークン交換時、認可サーバーがSHA256(code_verifier)とcode_challengeを照合
4. 一致しない → トークン発行拒否

**結論**: PKCEにより、認可コードインターセプト攻撃が無効化される

## プロバイダー別実装ガイド

### Google OAuth 2.0 + PKCE

**設定**:
```typescript
const googleOAuthConfig = {
  authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  scope: 'openid email profile',
  usePKCE: true, // Google推奨
};
```

### GitHub OAuth 2.0 + PKCE

**設定**:
```typescript
const githubOAuthConfig = {
  authorizeUrl: 'https://github.com/login/oauth/authorize',
  tokenUrl: 'https://github.com/login/oauth/access_token',
  scope: 'read:user user:email',
  usePKCE: false, // GitHubはPKCE非対応（2025年時点）
};
```

**注意**: GitHubはまだPKCE非対応のため、SPAではClient Secretの安全な管理が課題

## テスト戦略

### ユニットテスト
```typescript
describe('PKCE Helper Functions', () => {
  test('generateCodeVerifier produces valid length', () => {
    const verifier = generateCodeVerifier();
    expect(verifier.length).toBeGreaterThanOrEqual(43);
    expect(verifier.length).toBeLessThanOrEqual(128);
  });

  test('generateCodeChallenge produces consistent output', async () => {
    const verifier = 'test_verifier_1234567890';
    const challenge1 = await generateCodeChallenge(verifier);
    const challenge2 = await generateCodeChallenge(verifier);
    expect(challenge1).toBe(challenge2); // 決定的
  });
});
```

### 統合テスト
- OAuth 2.0プロバイダーとの実際の認証フロー
- PKCE検証の成功・失敗ケース
- トークン交換の正常系・異常系

## 参考資料

- [RFC 7636: Proof Key for Code Exchange](https://tools.ietf.org/html/rfc7636)
- [OAuth 2.0 Security Best Current Practice](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)
- [OAuth 2.0 for Browser-Based Apps](https://tools.ietf.org/html/draft-ietf-oauth-browser-based-apps)
