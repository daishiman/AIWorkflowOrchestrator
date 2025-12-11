# JWT セキュリティチェックリスト

## JWT基本構造

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

Header . Payload . Signature
```

---

## 1. 署名アルゴリズムのセキュリティ

### 推奨アルゴリズム

| アルゴリズム | タイプ   | セキュリティ | パフォーマンス | 推奨度      |
| ------------ | -------- | ------------ | -------------- | ----------- |
| **RS256**    | RSA署名  | 高           | 中             | ✅ 推奨     |
| **ES256**    | 楕円曲線 | 高           | 高             | ✅ 推奨     |
| **HS256**    | HMAC     | 中           | 高             | ⚠️ 条件付き |

### RS256（RSA署名）

**特徴**:

- 非対称鍵暗号（秘密鍵で署名、公開鍵で検証）
- 秘密鍵の漏洩リスクが限定的（検証側は公開鍵のみ）
- マイクロサービスアーキテクチャに最適

**鍵サイズ**: 2048ビット以上（推奨: 4096ビット）

**使用ケース**:

- マイクロサービス間認証
- 複数サービスでトークン検証が必要な場合
- 公開APIでのトークン発行

### ES256（楕円曲線署名）

**特徴**:

- RS256より高速で短い鍵長
- 同等のセキュリティをより小さな鍵で実現
- モバイルアプリに最適

**鍵サイズ**: P-256曲線（256ビット）

**使用ケース**:

- パフォーマンス重視のシステム
- モバイルアプリケーション
- リソース制約環境

### HS256（HMAC）

**特徴**:

- 対称鍵暗号（同じ鍵で署名と検証）
- 高速だがシークレット管理が重要
- シークレット漏洩で全システムが危殆化

**使用条件**:

- シークレットが厳格に管理されている
- 単一サービス内での使用（マイクロサービスには不適）
- シークレットローテーションが実装されている

**⚠️ 注意**: シークレットが弱い場合、容易に署名を偽造可能

---

## 2. alg headerアタック対策

### none攻撃

**攻撃手法**:

```json
{
  "alg": "none",
  "typ": "JWT"
}
```

攻撃者が署名を削除し、`alg: none`を指定してJWTを偽造。

**対策**:

```javascript
// ✅ アルゴリズムをホワイトリスト化
const allowedAlgorithms = ["RS256", "ES256"];
jwt.verify(token, publicKey, { algorithms: allowedAlgorithms });

// ❌ アルゴリズム指定なし（危険）
jwt.verify(token, publicKey);
```

### アルゴリズム混同攻撃

**攻撃手法**:

- RS256（非対称）で発行されたトークンをHS256（対称）として検証させる
- 公開鍵をHMACシークレットとして使用

**対策**:

- 署名検証時にアルゴリズムを明示的に指定
- Header内のalgクレームを信頼しない

---

## 3. クレーム設計のベストプラクティス

### 標準クレーム

| クレーム | 必須 | 説明                   | 例                           |
| -------- | ---- | ---------------------- | ---------------------------- |
| **iss**  | 推奨 | 発行者                 | `"https://auth.example.com"` |
| **sub**  | 必須 | ユーザー識別子         | `"user_12345"`               |
| **aud**  | 必須 | 対象アプリケーション   | `"my-api"`                   |
| **exp**  | 必須 | 有効期限（Unix時刻）   | `1735257600`                 |
| **iat**  | 推奨 | 発行時刻               | `1735171200`                 |
| **nbf**  | 任意 | 有効開始時刻           | `1735171200`                 |
| **jti**  | 推奨 | JWT ID（リプレイ対策） | `"abc-123-def"`              |

### カスタムクレーム

**推奨クレーム**:

- `roles`: ユーザーロール配列
- `permissions`: 権限配列
- `scope`: OAuthスコープ

**避けるべきクレーム**:

- パスワード、ハッシュ
- 社会保障番号（SSN）、クレジットカード番号
- 大量のユーザーデータ（JWTは肥大化しやすい）

### サイズ考慮

**問題**: JWTはすべてのリクエストで送信されるため、サイズが重要

**ベストプラクティス**:

- ペイロードは最小限に（<1KB推奨）
- 大きなデータはサーバーサイドで保持し、IDのみJWTに含める
- クレーム名は短縮（`userId` → `uid`）は可読性とのトレードオフ

---

## 4. トークン有効期限戦略

### アクセストークン

**推奨有効期限**:

- 一般的なWebアプリ: 15分-1時間
- 高セキュリティシステム: 5-15分
- 低リスクシステム: 1-4時間

**設計原則**:

- 短い有効期限 = より安全（トークン漏洩時の影響を最小化）
- リフレッシュトークンで無縫な再取得

### リフレッシュトークン

**推奨有効期限**:

- 一般的なWebアプリ: 7-30日
- モバイルアプリ: 30-90日
- 長期セッション: 最大1年（慎重に）

**ローテーション戦略**:

```javascript
// ✅ Refresh Token Rotation
POST /token
grant_type=refresh_token&refresh_token=OLD_TOKEN

// レスポンス
{
  "access_token": "NEW_ACCESS_TOKEN",
  "refresh_token": "NEW_REFRESH_TOKEN",  // 新しいトークン
  "expires_in": 3600
}

// 古いリフレッシュトークンを無効化
```

**判断基準**:

- [ ] アクセストークンの有効期限は1時間以内か？
- [ ] リフレッシュトークンは使用時に新しいトークンと交換されるか？
- [ ] 古いリフレッシュトークンは無効化されるか？
- [ ] リフレッシュトークンはアクセストークンより長寿命か？

---

## 5. トークン保存のセキュリティ

### ブラウザ（SPA）

**アクセストークン**:

```
✅ 推奨:
  - メモリ内変数（ページリロードで消失）
  - SessionStorage（タブ閉じで消失）

⚠️ 注意（XSSリスク）:
  - LocalStorage
  - 通常のCookie

❌ 禁止:
  - URLパラメータ
  - Refererヘッダー
```

**リフレッシュトークン**:

```
✅ 推奨:
  - HttpOnly Secure SameSite Cookie

❌ 禁止:
  - LocalStorage
  - SessionStorage
  - 通常のCookie
```

### モバイルアプリ

**推奨**:

- iOS: Keychain（iOSの安全なストレージ）
- Android: EncryptedSharedPreferences、Keystore

**避けるべき**:

- SharedPreferences（暗号化なし）
- ファイルシステムに平文保存

---

## 6. トークン取り消し

### 取り消しが必要なタイミング

1. **ユーザーがログアウト**: すべてのトークンを無効化
2. **パスワード変更**: すべてのセッションを終了
3. **権限変更**: 既存トークンの権限が不適切になる
4. **不正アクセス検出**: 即座にトークンを取り消し
5. **ユーザーがデバイスログアウト**: 特定デバイスのトークンのみ無効化

### 実装方法

**方法1: トークンブラックリスト**

```javascript
// 取り消されたトークンをRedisに保存
await redis.setex(`blacklist:${jti}`, ttl, "1");

// 検証時にチェック
const isBlacklisted = await redis.exists(`blacklist:${jti}`);
if (isBlacklisted) {
  throw new Error("Token has been revoked");
}
```

**方法2: トークンバージョニング**

```javascript
// ユーザーのtokenVersionをDBに保存
user.tokenVersion = 5;

// JWTに含める
const payload = { sub: userId, version: user.tokenVersion };

// 検証時にバージョンをチェック
const currentVersion = await db.users.findOne(userId).tokenVersion;
if (payload.version !== currentVersion) {
  throw new Error("Token version mismatch");
}
```

**判断基準**:

- [ ] トークン取り消しメカニズムが実装されているか？
- [ ] ログアウト時に即座にトークンが無効化されるか？
- [ ] ブラックリストのTTLは適切か（トークン有効期限と一致）？

---

## 7. JWT検証の完全性

### 検証ステップ

**必須検証**:

1. **署名検証**: JWKSから公開鍵を取得して検証
2. **issクレーム**: 期待する発行者（Authorization Server）か
3. **audクレーム**: 自分のクライアントID/サービス宛か
4. **expクレーム**: 有効期限内か（現在時刻 < exp）
5. **nbfクレーム**: 有効開始時刻を過ぎているか（現在時刻 >= nbf）

**推奨検証**: 6. **iatクレーム**: 発行時刻が合理的範囲内か 7. **jtiクレーム**: リプレイ攻撃検出（使用済みJWT ID記録）

### 検証ライブラリの使用

```javascript
// ✅ 推奨: すべての検証を実行
const decoded = jwt.verify(token, publicKey, {
  algorithms: ["RS256"],
  issuer: "https://auth.example.com",
  audience: "my-api",
  clockTolerance: 30, // 時刻のずれ許容（秒）
});

// ❌ 危険: 検証をスキップ
const decoded = jwt.decode(token); // 署名検証なし
```

**判断基準**:

- [ ] すべての標準クレーム（iss, aud, exp）が検証されているか？
- [ ] 署名アルゴリズムがホワイトリスト化されているか？
- [ ] 検証ライブラリは最新版か（脆弱性修正）？
- [ ] jwt.decode()ではなくjwt.verify()を使用しているか？

---

## 8. リプレイ攻撃対策

### jti（JWT ID）クレーム

**実装**:

```javascript
// トークン生成時
const payload = {
  sub: userId,
  jti: crypto.randomUUID(), // ユニークID
  exp: Date.now() / 1000 + 3600,
};

// 検証時
const usedJtis = new Set(); // または Redis
if (usedJtis.has(decoded.jti)) {
  throw new Error("Token already used (replay attack)");
}
usedJtis.add(decoded.jti);
```

**ストレージ**:

- Redisに保存（TTL = トークン有効期限）
- `used_jti:{jti}` キーで管理

**判断基準**:

- [ ] jtiクレームが生成されているか（ユニークID）？
- [ ] 使用済みJWT IDが記録されているか？
- [ ] リプレイ攻撃が検出・拒否されるか？

---

## 9. トークンバインディング

### Sender-Constrained Tokens

**概念**: トークンを特定のクライアント/接続にバインド

**実装方法1: Certificate Thumbprint**

```javascript
// クライアント証明書のハッシュをトークンに含める
const payload = {
  sub: userId,
  cnf: {
    "x5t#S256": certificateThumbprint,
  },
};

// 検証時にクライアント証明書を確認
```

**実装方法2: DPoP（Demonstrating Proof-of-Possession）**

- RFC 9449で標準化
- トークンと秘密鍵のペアで検証
- トークン窃取による不正利用を防止

**判断基準**:

- [ ] 高セキュリティ要件でトークンバインディングが実装されているか？
- [ ] クライアント証明書が検証されているか？

---

## 10. JWKSとキーローテーション

### JWKS（JSON Web Key Set）

**概要**: 公開鍵を配布するための標準フォーマット

**エンドポイント**:

```
GET /.well-known/jwks.json

{
  "keys": [
    {
      "kty": "RSA",
      "kid": "key-2024-01",
      "use": "sig",
      "n": "...",  // 公開鍵のモジュラス
      "e": "AQAB"
    }
  ]
}
```

### キーローテーション戦略

**ステップ**:

1. 新しい鍵ペアを生成
2. JWKSに新しい公開鍵を追加（古い鍵も残す）
3. 新しいJWTは新しい鍵で署名（kidヘッダーで識別）
4. 古い鍵で署名されたJWTの有効期限が切れるまで待機
5. 古い公開鍵をJWKSから削除

**推奨頻度**:

- 通常: 3-6ヶ月ごと
- 鍵漏洩時: 即座にローテーション
- セキュリティポリシーに従う

**判断基準**:

- [ ] JWKSエンドポイントが実装されているか？
- [ ] kidヘッダーで鍵を識別できるか？
- [ ] キーローテーション計画が文書化されているか？
- [ ] 複数の鍵が同時に有効（ローテーション期間中）か？

---

## 11. センシティブデータの取り扱い

### ペイロードに含めてはいけない情報

**❌ 禁止**:

- パスワード、ハッシュ
- 社会保障番号（SSN）
- クレジットカード番号
- 医療情報（PHI）
- 秘密鍵、APIキー

**⚠️ 注意（暗号化されたトークンでも慎重に）**:

- メールアドレス（個人情報）
- 電話番号
- 住所

**✅ 許容**:

- ユーザーID（`sub`）
- ロール、権限
- 名前、表示名（公開情報）
- メタデータ（locale、timezone等）

### JWE（JSON Web Encryption）

**使用ケース**: ペイロードの機密性が必要な場合

**判断**:

- 通常はJWTのペイロードは署名されているだけで暗号化されていない
- Base64デコードで内容が読める
- 機密情報が必要ならJWEを使用するか、サーバーサイドで保持

**判断基準**:

- [ ] JWTペイロードにセンシティブデータが含まれていないか？
- [ ] 機密情報が必要な場合、JWEを使用しているか？
- [ ] ペイロードサイズは合理的か（<1KB推奨）？

---

## 12. クロスサイト攻撃対策

### CSRF（Cross-Site Request Forgery）

**OAuth state parameter**:

```javascript
// 認可リクエスト時
const state = crypto.randomBytes(16).toString("hex");
sessionStorage.setItem("oauth_state", state);
window.location = `${authUrl}?state=${state}&...`;

// コールバック時
const returnedState = new URLSearchParams(window.location.search).get("state");
const storedState = sessionStorage.getItem("oauth_state");
if (returnedState !== storedState) {
  throw new Error("CSRF attack detected");
}
```

**JWT CSRF対策**:

- JWTをAuthorizationヘッダーで送信（CookieではなJ）
- Cookieを使う場合、SameSite=Strict/Lax属性を設定

### XSS（Cross-Site Scripting）

**トークン窃取リスク**:

- LocalStorageに保存されたトークンはXSSで窃取可能
- `document.cookie`でCookieを読み取り可能（HttpOnlyなしの場合）

**対策**:

- HttpOnly Cookie使用（JavaScriptからアクセス不可）
- Content Security Policy（CSP）設定
- 入力サニタイズと出力エスケープ

---

## 13. 完全なセキュリティチェックリスト

### JWT生成時

- [ ] 安全な署名アルゴリズム使用（RS256/ES256推奨）
- [ ] expクレームを必ず設定（有効期限）
- [ ] issクレームを設定（発行者）
- [ ] audクレームを設定（対象サービス）
- [ ] jtiクレームを設定（リプレイ攻撃対策）
- [ ] センシティブデータをペイロードに含めない
- [ ] ペイロードサイズを最小限に保つ（<1KB）

### JWT検証時

- [ ] jwt.verify()を使用（jwt.decode()ではない）
- [ ] アルゴリズムをホワイトリスト化
- [ ] alg: noneを拒否
- [ ] iss、aud、expクレームを検証
- [ ] 署名を必ず検証
- [ ] 使用済みjtiをチェック（リプレイ対策）
- [ ] クロックスキュー許容値を設定（30秒程度）

### トークン保存時

- [ ] アクセストークンはメモリまたはSessionStorageに保存
- [ ] リフレッシュトークンはHttpOnly Secure Cookieに保存
- [ ] LocalStorageは避ける（XSSリスク）
- [ ] URLパラメータには絶対に含めない
- [ ] Cookieにはすべてのセキュリティフラグを設定

### トークンライフサイクル

- [ ] アクセストークンは短命（15分-1時間）
- [ ] リフレッシュトークンは適度に長命（7-30日）
- [ ] リフレッシュトークンローテーションが実装されている
- [ ] トークン取り消しメカニズムが存在する
- [ ] ログアウト時にすべてのトークンが無効化される

---

## 参考文献

- **RFC 7519**: JSON Web Token (JWT)
- **RFC 7515**: JSON Web Signature (JWS)
- **RFC 7516**: JSON Web Encryption (JWE)
- **RFC 7517**: JSON Web Key (JWK)
- **RFC 9449**: OAuth 2.0 Demonstrating Proof-of-Possession (DPoP)
- **OWASP JWT Cheat Sheet**: https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html
