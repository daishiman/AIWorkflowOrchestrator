# OAuth 2.0 フロー比較ガイド

## フロー選択決定ツリー

```
アプリケーションタイプは？
│
├─ Webアプリケーション（バックエンドあり）
│  └─ Authorization Code Flow + PKCE ✅
│
├─ SPA（Single Page Application）
│  └─ Authorization Code Flow + PKCE ✅
│
├─ ネイティブモバイルアプリ
│  └─ Authorization Code Flow + PKCE ✅
│
├─ サーバー間通信（M2M）
│  └─ Client Credentials Flow ✅
│
└─ デバイス（TVアプリ等）
   └─ Device Authorization Flow ✅
```

---

## Authorization Code Flow + PKCE

### 概要

最も安全で推奨されるフロー。すべてのクライアントタイプで使用可能。

### フローステップ

1. **認可リクエスト**:
   ```
   GET /authorize?
     response_type=code
     &client_id=CLIENT_ID
     &redirect_uri=CALLBACK_URL
     &scope=openid profile email
     &state=RANDOM_STATE
     &code_challenge=CODE_CHALLENGE
     &code_challenge_method=S256
   ```

2. **ユーザー認証とコンセント**: 認可サーバーでログインと権限付与

3. **認可コード発行**: リダイレクトでcodeパラメータを返す

4. **トークンリクエスト**:
   ```
   POST /token
   Content-Type: application/x-www-form-urlencoded

   grant_type=authorization_code
   &code=AUTHORIZATION_CODE
   &redirect_uri=CALLBACK_URL
   &client_id=CLIENT_ID
   &code_verifier=CODE_VERIFIER
   ```

5. **アクセストークン/リフレッシュトークン発行**

### PKCEの重要性

**PKCE（Proof Key for Code Exchange）**:
- 認可コード横取り攻撃（Authorization Code Interception）を防止
- code_verifierとcode_challengeのペアで検証
- SPAやモバイルアプリでは必須

**実装**:
```javascript
// Code Verifier生成（43-128文字のランダム文字列）
const codeVerifier = generateRandomString(128);

// Code Challenge生成（SHA-256ハッシュ）
const codeChallenge = base64UrlEncode(sha256(codeVerifier));

// 認可リクエスト
const authUrl = `${authEndpoint}?code_challenge=${codeChallenge}&code_challenge_method=S256&...`;

// トークンリクエスト時にcode_verifierを送信
```

### セキュリティ考慮事項

- [ ] PKCEが実装されているか？（すべてのクライアントタイプで推奨）
- [ ] stateパラメータでCSRF対策がされているか？
- [ ] redirect_uriがホワイトリストで検証されているか？
- [ ] 認可コードは1回限りの使用か？
- [ ] 認可コードの有効期限は短いか（5-10分）？

---

## Implicit Flow

### 概要

**⚠️ 非推奨**: OAuth 2.0 Security Best Current Practice（BCP）で非推奨とされています。

### 問題点

1. **トークンURLフラグメント露出**: ブラウザ履歴、Refererヘッダーで漏洩リスク
2. **リフレッシュトークンなし**: 長寿命アクセストークンが必要（リスク増）
3. **CSRF脆弱性**: stateパラメータが必須だが、実装漏れが多い
4. **クライアント認証なし**: クライアントの真正性を検証できない

### 移行推奨

Implicit Flowを使用している場合、Authorization Code Flow + PKCEへの移行を推奨。

---

## Client Credentials Flow

### 概要

サーバー間通信（M2M: Machine-to-Machine）専用のフロー。

### フローステップ

1. **トークンリクエスト**:
   ```
   POST /token
   Content-Type: application/x-www-form-urlencoded
   Authorization: Basic base64(client_id:client_secret)

   grant_type=client_credentials
   &scope=api:read api:write
   ```

2. **アクセストークン発行**

### 使用ケース

- マイクロサービス間通信
- バッチ処理ジョブ
- サーバーサイドAPI統合
- CLIツール

### セキュリティ考慮事項

- [ ] クライアントシークレットは安全に保存されているか？
- [ ] スコープは最小権限に制限されているか？
- [ ] トークンの有効期限は適切か？
- [ ] クライアント認証は強固か（mutual TLS推奨）？

---

## Device Authorization Flow

### 概要

入力制限があるデバイス（スマートTV、IoTデバイス等）向けのフロー。

### フローステップ

1. **デバイス認可リクエスト**: デバイスコードとユーザーコードを取得
2. **ユーザーコード表示**: デバイスに表示
3. **ユーザー認証**: ブラウザで認証URLにアクセス、ユーザーコード入力
4. **ポーリング**: デバイスが定期的にトークンをリクエスト
5. **トークン発行**: ユーザー承認後、デバイスにトークン発行

### セキュリティ考慮事項

- [ ] ユーザーコードは短く、入力しやすいか？（6-8文字）
- [ ] デバイスコードの有効期限は適切か（5-10分）？
- [ ] ポーリング間隔は適切か（5秒程度）？
- [ ] レート制限があるか？

---

## Resource Owner Password Credentials Flow

### 概要

**⚠️ レガシー**: 新規実装では使用しないでください。

### 問題点

1. **クライアントにパスワード露出**: 認証情報がクライアントを経由
2. **フィッシングリスク**: クライアントが認証情報を収集可能
3. **MFA非対応**: 多要素認証との統合が困難

### 使用が許容される例外的ケース

- レガシーシステムの移行期間
- 信頼できるファーストパーティクライアントのみ
- より安全なフローへの移行計画がある場合

---

## OpenID Connect（OIDC）

### OAuth 2.0との関係

OpenID Connect = OAuth 2.0 + ID Token（JWT形式）

### ID Token

**クレーム**:
- `sub`: ユーザーの一意識別子
- `iss`: 発行者（Authorization Server）
- `aud`: クライアントID
- `exp`: 有効期限
- `iat`: 発行時刻
- `nonce`: リプレイ攻撃対策

**検証要件**:
- 署名検証（JWKSから公開鍵を取得）
- issクレーム検証（期待する発行者か）
- audクレーム検証（自分のクライアントID宛か）
- expクレーム検証（有効期限内か）
- nonceクレーム検証（リクエスト時に送ったnonceと一致するか）

### UserInfo Endpoint

**使用方法**:
```
GET /userinfo
Authorization: Bearer ACCESS_TOKEN
```

**レスポンス例**:
```json
{
  "sub": "248289761001",
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "email_verified": true,
  "picture": "https://example.com/jane.jpg"
}
```

---

## フロー選択マトリックス

| アプリタイプ | 推奨フロー | 理由 |
|------------|----------|------|
| Webアプリ（サーバーサイド） | Authorization Code + PKCE | 最も安全、リフレッシュトークン対応 |
| SPA | Authorization Code + PKCE | Implicit Flowより安全 |
| モバイルアプリ | Authorization Code + PKCE | ネイティブアプリに最適 |
| デスクトップアプリ | Authorization Code + PKCE | ローカルhttpサーバーでコールバック受信 |
| サーバー間（M2M） | Client Credentials | ユーザーコンテキスト不要 |
| IoT/TV | Device Authorization | 入力制限デバイス向け |
| レガシー移行 | Resource Owner Password（一時的） | 移行期間のみ許容 |

---

## セキュリティベストプラクティス

### 共通原則

1. **HTTPS必須**: すべての通信でHTTPSを使用
2. **stateパラメータ**: CSRF対策のため必須
3. **redirect_uri検証**: 厳格なホワイトリスト検証
4. **スコープ最小化**: 必要最小限の権限のみ要求
5. **トークン有効期限**: アクセストークンは短期、リフレッシュトークンは適度に長期

### 実装チェックリスト

- [ ] すべてのOAuthエンドポイントでHTTPSが強制されているか？
- [ ] PKCEが実装されているか（Authorization Code Flow使用時）？
- [ ] stateパラメータが検証されているか？
- [ ] redirect_uriがホワイトリストで厳格に検証されているか？
- [ ] トークンの有効期限は適切か？
- [ ] トークン取り消しエンドポイントが実装されているか？
- [ ] エラーメッセージで情報漏洩していないか？

---

## 参考文献

- **RFC 6749**: OAuth 2.0 Authorization Framework
- **RFC 7636**: PKCE（Proof Key for Code Exchange）
- **RFC 8628**: OAuth 2.0 Device Authorization Grant
- **OAuth 2.0 Security Best Current Practice**: https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics
- **OpenID Connect Core**: https://openid.net/specs/openid-connect-core-1_0.html
