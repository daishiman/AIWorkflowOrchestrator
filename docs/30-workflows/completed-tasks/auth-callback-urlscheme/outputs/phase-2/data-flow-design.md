# Phase 2: データフロー設計書

## メタ情報

| 項目     | 内容                   |
| -------- | ---------------------- |
| タスクID | TASK-AUTH-CALLBACK-001 |
| Phase    | 2                      |
| 作成日   | 2026-02-06             |

---

## 認証フロー全体図

```
┌────────────┐     ┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Renderer  │     │    Main      │     │  External        │     │   Supabase   │
│  Process   │     │    Process   │     │  Browser         │     │   Auth       │
└─────┬──────┘     └──────┬───────┘     └────────┬─────────┘     └──────┬───────┘
      │                   │                      │                      │
      │ 1. auth:login     │                      │                      │
      │   {provider}      │                      │                      │
      │──────────────────>│                      │                      │
      │                   │                      │                      │
      │                   │ 2. generatePKCEPair()│                      │
      │                   │   codeVerifier       │                      │
      │                   │   codeChallenge      │                      │
      │                   │                      │                      │
      │                   │ 3. generateState()   │                      │
      │                   │   state (32bytes)    │                      │
      │                   │                      │                      │
      │                   │ 4. HTTPServer.start()│                      │
      │                   │   port: 動的割当     │                      │
      │                   │                      │                      │
      │                   │ 5. signInWithOAuth() │                      │
      │                   │───────────────────────────────────────────>│
      │                   │                      │                      │
      │                   │<──────────────────────────────────────────│
      │                   │   oauthUrl           │                      │
      │                   │                      │                      │
      │                   │ 6. openExternal()    │                      │
      │                   │─────────────────────>│                      │
      │                   │                      │                      │
      │  { success: true }│                      │ 7. ユーザー認証      │
      │<──────────────────│                      │─────────────────────>│
      │                   │                      │                      │
      │                   │                      │<─────────────────────│
      │                   │                      │  redirect:           │
      │                   │                      │  127.0.0.1:port      │
      │                   │                      │  ?code=xxx&state=yyy │
      │                   │                      │                      │
      │                   │ 8. HTTP GET           │                      │
      │                   │  /auth/callback       │                      │
      │                   │  ?code=xxx&state=yyy  │                      │
      │                   │<─────────────────────│                      │
      │                   │                      │                      │
      │                   │ 9. state照合          │                      │
      │                   │   pendingFlows.get()  │                      │
      │                   │                      │                      │
      │                   │ 10. 成功HTML返却      │                      │
      │                   │─────────────────────>│                      │
      │                   │                      │ (タブ自動閉鎖)       │
      │                   │                      │                      │
      │                   │ 11. exchangeCodeForSession()                │
      │                   │   code + codeVerifier │                      │
      │                   │───────────────────────────────────────────>│
      │                   │                      │                      │
      │                   │<──────────────────────────────────────────│
      │                   │   session             │                      │
      │                   │   (access_token,      │                      │
      │                   │    refresh_token)     │                      │
      │                   │                      │                      │
      │                   │ 12. secureStorage     │                      │
      │                   │   .storeRefreshToken()│                      │
      │                   │                      │                      │
      │                   │ 13. HTTPServer.stop() │                      │
      │                   │                      │                      │
      │ 14. auth:state-   │                      │                      │
      │   changed          │                      │                      │
      │   {authenticated,  │                      │                      │
      │    user}           │                      │                      │
      │<──────────────────│                      │                      │
      │                   │                      │                      │
      │ 15. mainWindow    │                      │                      │
      │   .focus()        │                      │                      │
      │<──────────────────│                      │                      │
      │                   │                      │                      │
```

---

## エラーフロー

### State不一致（CSRF攻撃検出）

```
HTTPサーバーが ?code=xxx&state=INVALID を受信
  │
  ├── state照合: pendingFlows.get(state) === undefined
  │
  ├── エラーHTML返却（status 400）
  │   「認証に失敗しました: 不正なリクエスト」
  │
  ├── HTTPサーバー停止
  │
  └── Renderer に auth:state-changed { error: "STATE_MISMATCH" } 送信
```

### トークン交換失敗

```
exchangeCodeForSession() がエラーを返す
  │
  ├── HTTPサーバー停止（既に成功HTML返却済み）
  │
  ├── pendingFlows から該当エントリ削除
  │
  └── Renderer に auth:state-changed { error: "TOKEN_EXCHANGE_FAILED" } 送信
```

### タイムアウト

```
waitForCallback() が5分でタイムアウト
  │
  ├── HTTPサーバー停止
  │
  ├── pendingFlows から該当エントリ削除
  │
  └── Renderer に auth:state-changed { error: "CALLBACK_TIMEOUT" } 送信
```

---

## データ構造

### PendingAuthFlow（Main Process メモリ内）

```typescript
interface PendingAuthFlow {
  state: string; // 32バイトランダム文字列（Base64URL）
  codeVerifier: string; // PKCE code_verifier
  server: AuthCallbackServer; // HTTPサーバーインスタンス
  createdAt: number; // タイムスタンプ（Date.now()）
}

// Map<state, PendingAuthFlow>
// TTL: 5分（300,000ms）
// エントリ数上限: 1（同時認証は1フローのみ）
```

### AuthCallbackResult（HTTPサーバー → オーケストレーター）

```typescript
interface AuthCallbackResult {
  code: string; // authorization_code（Supabaseから受信）
  state: string; // state parameter（照合用）
}
```

### Supabase Token Exchange

```typescript
// exchangeCodeForSession の内部動作
// POST https://<project>.supabase.co/auth/v1/token?grant_type=authorization_code
// Body: { code, code_verifier, redirect_uri }
// Response: { access_token, refresh_token, expires_in, user }
```

---

## waitForSession() の設計判断

### 現状分析

- `waitForSession()` は Implicit Flow において、RendererがURLフラグメントからトークンを受信するまで待機する関数
- authSlice 内で `initializeAuth()` と連携して使用

### PKCE移行後の判断

- **結論**: `waitForSession()` は不要になる
- **理由**: PKCE フローでは、Main Process のオーケストレーターがトークン交換 → セッション確立を一貫して処理し、完了後に `auth:state-changed` IPC イベントで Renderer に通知する。Renderer 側で能動的にセッションを待機する必要がない
- **対応**: Phase 5 で実装時に `waitForSession()` の呼び出し元を確認し、`auth:state-changed` リスナーで代替可能か検証した上で削除判断を最終化する

---

## Supabase OAuth URL パラメータ

### PKCE対応 OAuth URL 構成

```
https://<project>.supabase.co/auth/v1/authorize
  ?provider=google
  &redirect_to=http://127.0.0.1:{port}/auth/callback
  &code_challenge={codeChallenge}
  &code_challenge_method=S256
  &state={state}
  &response_type=code
```

### redirect_uri の値

| 環境         | redirect_uri                            |
| ------------ | --------------------------------------- |
| 開発ビルド   | `http://127.0.0.1:{port}/auth/callback` |
| パッケージ版 | `http://127.0.0.1:{port}/auth/callback` |

> **注**: 開発ビルド・パッケージ版ともにHTTPサーバー方式を使用。カスタムURLスキームはHTTPサーバー起動失敗時のフォールバックとしてのみ使用する設計とする。

---

## セキュリティ設計まとめ

### 多層防御モデル（security-implementation.md 準拠）

| レイヤー         | 対策                                    |
| ---------------- | --------------------------------------- |
| フロントエンド   | トークンをRendererに非露出              |
| API境界（IPC）   | withValidation()による送信元検証        |
| ビジネスロジック | State parameter照合、PKCE検証           |
| データアクセス   | safeStorage暗号化、メモリ内一時保存のみ |

### 127.0.0.1 バインド制約

- HTTPサーバーは `127.0.0.1` のみでリッスン
- `0.0.0.0` や `::` バインドは禁止
- 外部ネットワークからのアクセスを物理的に遮断
