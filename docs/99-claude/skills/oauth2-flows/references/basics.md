# OAuth 2.0 基礎知識

> **相対パス**: `references/basics.md`
> **原典**: RFC 6749, OAuth 2.0 Simplified (Aaron Parecki)

---

## OAuth 2.0とは

OAuth 2.0は認可（Authorization）のためのフレームワーク。
リソースオーナー（ユーザー）の代わりに、サードパーティアプリケーションがリソースにアクセスすることを許可する。

**重要**: OAuth 2.0は認可（Authorization）であり、認証（Authentication）ではない。認証にはOpenID Connect（OIDC）を使用。

---

## 主要な用語

| 用語                 | 説明                                     |
| -------------------- | ---------------------------------------- |
| Resource Owner       | リソースの所有者（通常はエンドユーザー） |
| Client               | リソースにアクセスするアプリケーション   |
| Authorization Server | 認可を行いトークンを発行するサーバー     |
| Resource Server      | 保護されたリソースをホストするサーバー   |
| Access Token         | リソースへのアクセス権を表すトークン     |
| Refresh Token        | Access Tokenを更新するためのトークン     |
| Scope                | アクセス権限の範囲                       |

---

## 主要なフロー

### Authorization Code Flow

最も一般的で安全なフロー。サーバーサイドアプリケーション向け。

```
1. Client → Authorization Server: 認可リクエスト
2. User → Authorization Server: ログイン・同意
3. Authorization Server → Client: 認可コード
4. Client → Authorization Server: 認可コード + シークレット
5. Authorization Server → Client: Access Token
```

### Authorization Code Flow + PKCE

SPA/モバイルアプリ向け。シークレットを使用せずに安全性を確保。

```
1. Client: code_verifier生成
2. Client: code_challenge = SHA256(code_verifier)
3. Client → Authorization Server: 認可リクエスト + code_challenge
4. User → Authorization Server: ログイン・同意
5. Authorization Server → Client: 認可コード
6. Client → Authorization Server: 認可コード + code_verifier
7. Authorization Server → Client: Access Token
```

### Client Credentials Flow

M2M（マシン間）通信向け。ユーザーが介在しない。

```
1. Client → Authorization Server: client_id + client_secret
2. Authorization Server → Client: Access Token
```

---

## セキュリティの基本

### 必須対策

| 対策         | 目的                     | 適用フロー   |
| ------------ | ------------------------ | ------------ |
| state        | CSRF攻撃対策             | すべて       |
| PKCE         | 認可コード傍受対策       | SPA/モバイル |
| HTTPS        | 通信の暗号化             | すべて       |
| redirect_uri | オープンリダイレクト防止 | すべて       |

### トークン保護

| トークン種別  | 保存場所                | 有効期限           |
| ------------- | ----------------------- | ------------------ |
| Access Token  | メモリ/HttpOnlyクッキー | 短期（数分〜時間） |
| Refresh Token | セキュアストレージ      | 長期（日〜月）     |

---

## 関連リソース

- **Authorization Code詳細**: See [authorization-code-flow.md](authorization-code-flow.md)
- **PKCE実装**: See [pkce-implementation.md](pkce-implementation.md)
- **セキュリティ**: See [security-checklist.md](security-checklist.md)
- **トークンストレージ**: See [token-storage-strategies.md](token-storage-strategies.md)
