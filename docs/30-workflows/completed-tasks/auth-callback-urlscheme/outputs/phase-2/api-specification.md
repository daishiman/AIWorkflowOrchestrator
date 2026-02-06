# Phase 2: API仕様書

## メタ情報

| 項目     | 内容                   |
| -------- | ---------------------- |
| タスクID | TASK-AUTH-CALLBACK-001 |
| Phase    | 2                      |
| 作成日   | 2026-02-06             |

---

## IPC API 仕様

### auth:login（変更）

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| チャンネル | `auth:login`                           |
| 方向       | Renderer → Main                        |
| 種別       | invoke (handle)                        |
| 変更内容   | 内部実装をオーケストレーター経由に変更 |

**リクエスト**:

```typescript
{
  provider: string;
} // "google" | "github" | "discord"
```

**レスポンス**:

```typescript
IPCResponse<void>;
// 成功: { success: true }
// 失敗: { success: false, error: { code: number, message: string } }
```

**内部フロー変更**:

```
Before: supabase.auth.signInWithOAuth({ redirectTo: 'aiworkflow://auth/callback' })
After:  orchestrator.startOAuthFlow(provider)
        → PKCE生成 → HTTPサーバー起動 → OAuth URL構築 → ブラウザ起動
```

### auth:state-changed（変更なし）

| 項目       | 内容                 |
| ---------- | -------------------- |
| チャンネル | `auth:state-changed` |
| 方向       | Main → Renderer      |
| 種別       | send (on)            |

**データ**:

```typescript
AuthState = {
  authenticated: boolean;
  user?: AuthUser;
  error?: string;
}
```

### auth:start-oauth-flow（新規・予約）

| 項目           | 内容                                                        |
| -------------- | ----------------------------------------------------------- |
| チャンネル     | `auth:start-oauth-flow`                                     |
| 方向           | Renderer → Main                                             |
| 種別           | invoke (handle)                                             |
| withValidation | 必須                                                        |
| 備考           | 将来の拡張用に予約。Phase 5では auth:login の内部変更で対応 |

---

## 内部 API 仕様

### pkce.ts

#### `generatePKCEPair(): PKCEPair`

PKCE code_verifier/code_challenge ペアを生成する。

```typescript
interface PKCEPair {
  codeVerifier: string; // 43-128文字 Base64URL
  codeChallenge: string; // SHA-256 Base64URL
}
```

- **制約**: code_verifierは43文字以上128文字以下
- **例外**: なし（純粋関数）

#### `generateCodeVerifier(length?: number): string`

ランダムなcode_verifierを生成する。

- **引数**: `length` - バイト長（デフォルト: 32、生成文字列約43文字）
- **戻り値**: Base64URL エンコード文字列
- **例外**: なし

#### `calculateCodeChallenge(verifier: string): string`

code_verifierからcode_challengeを算出する。

- **引数**: `verifier` - code_verifier文字列
- **戻り値**: SHA-256ハッシュのBase64URLエンコード文字列
- **例外**: なし

---

### authCallbackServer.ts

#### `AuthCallbackServer.start(): Promise<{ port: number }>`

ローカルHTTPサーバーを起動する。

- **戻り値**: `{ port: number }` - 割り当てられたポート番号
- **例外**: ポートバインド失敗時

#### `AuthCallbackServer.waitForCallback(): Promise<AuthCallbackResult>`

コールバック受信を待機する。

```typescript
interface AuthCallbackResult {
  code: string; // authorization_code
  state: string; // state parameter
}
```

- **戻り値**: 受信した code と state
- **例外**: タイムアウト時（`AuthTimeoutError`）、不正リクエスト時

#### `AuthCallbackServer.stop(): Promise<void>`

HTTPサーバーを停止しリソースを解放する。

- **例外**: なし（停止済みの場合も安全）

---

### authFlowOrchestrator.ts

#### `AuthFlowOrchestrator.startOAuthFlow(provider: OAuthProvider): Promise<void>`

PKCE対応のOAuth認証フローを開始する。

- **引数**: `provider` - OAuthプロバイダー名
- **処理フロー**:
  1. 既存フローのクリーンアップ
  2. PKCE ペア生成
  3. State parameter 生成
  4. HTTPサーバー起動
  5. OAuth URL構築（redirect_uri に localhost:port を設定）
  6. 外部ブラウザで認証URL表示
  7. コールバック待機
  8. State照合 → トークン交換 → セッション確立
  9. Renderer通知 → クリーンアップ
- **例外**: 各ステップで発生するエラーをキャッチしRendererに通知

#### `AuthFlowOrchestrator.dispose(): Promise<void>`

全ての pending flow を停止し、リソースを解放する。

---

## エラーコード体系

| コード | 名称                         | 説明                     |
| ------ | ---------------------------- | ------------------------ |
| 3001   | PKCE_GENERATION_FAILED       | PKCE生成失敗             |
| 3002   | SERVER_START_FAILED          | HTTPサーバー起動失敗     |
| 3003   | CALLBACK_TIMEOUT             | コールバックタイムアウト |
| 3004   | STATE_MISMATCH               | State parameter不一致    |
| 3005   | TOKEN_EXCHANGE_FAILED        | トークン交換失敗         |
| 3006   | SESSION_ESTABLISHMENT_FAILED | セッション確立失敗       |

> **注**: 3000番台はExternal Service Error（リトライ可能）に分類。
> ただし STATE_MISMATCH (3004) はセキュリティエラーのためリトライ不可。
