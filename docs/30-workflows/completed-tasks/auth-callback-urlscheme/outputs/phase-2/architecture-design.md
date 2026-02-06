# Phase 2: アーキテクチャ設計書

## メタ情報

| 項目     | 内容                   |
| -------- | ---------------------- |
| タスクID | TASK-AUTH-CALLBACK-001 |
| Phase    | 2                      |
| 作成日   | 2026-02-06             |

---

## コンポーネント構成

### 新規ファイル

| ファイル                                             | 層           | 責務                                  |
| ---------------------------------------------------- | ------------ | ------------------------------------- |
| `apps/desktop/src/main/auth/pkce.ts`                 | Main Process | PKCE code_verifier/code_challenge生成 |
| `apps/desktop/src/main/auth/authCallbackServer.ts`   | Main Process | ローカルHTTPサーバー管理              |
| `apps/desktop/src/main/auth/authFlowOrchestrator.ts` | Main Process | OAuth PKCE フロー統合制御             |
| `packages/shared/types/auth-pkce.ts`                 | Shared       | PKCE関連型定義                        |

### 変更ファイル

| ファイル                                           | 変更内容                               |
| -------------------------------------------------- | -------------------------------------- |
| `apps/desktop/src/main/ipc/authHandlers.ts`        | AUTH_LOGIN → オーケストレーター委譲    |
| `apps/desktop/src/preload/channels.ts`             | 新規チャンネル追加・ホワイトリスト更新 |
| `apps/desktop/src/preload/index.ts`                | Bridge API追加                         |
| `apps/desktop/src/main/protocol/customProtocol.ts` | `auth/done` ハンドリング追加           |
| `apps/desktop/src/renderer/utils/devMockAuth.ts`   | `return true;` 一時修正の削除          |

---

## Electron 層別責務分離

```
┌─────────────────────────────────────────────────────────────┐
│                      Renderer Process                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  AuthView    │  │  authSlice   │  │  devMockAuth.ts  │   │
│  │  (ログイン   │──│  (Zustand    │  │  (復元: 本来の   │   │
│  │   ボタン)    │  │   状態管理)  │  │   判定ロジック)  │   │
│  └──────┬───────┘  └──────▲───────┘  └──────────────────┘   │
│         │                 │                                   │
├─────────┼─────────────────┼───────────────────────────────────┤
│         │  Preload (contextBridge)                            │
│  safeInvoke('auth:login') │  safeOn('auth:state-changed')     │
├─────────┼─────────────────┼───────────────────────────────────┤
│         ▼                 │        Main Process               │
│  ┌──────────────────┐     │                                   │
│  │  authHandlers.ts │─────┘                                   │
│  │  (IPC Handler)   │                                         │
│  └──────┬───────────┘                                         │
│         │                                                     │
│         ▼                                                     │
│  ┌──────────────────────────────────────────────────┐         │
│  │          authFlowOrchestrator.ts                 │         │
│  │  ┌──────────────┐  ┌────────────────────────┐   │         │
│  │  │  pkce.ts     │  │ authCallbackServer.ts  │   │         │
│  │  │  (PKCE生成)  │  │ (HTTPサーバー)         │   │         │
│  │  └──────────────┘  └────────────────────────┘   │         │
│  │                                                  │         │
│  │  pendingFlows: Map<state, PendingAuthFlow>       │         │
│  └──────────┬───────────────────────────────────────┘         │
│             │                                                 │
│             ▼                                                 │
│  ┌──────────────────┐  ┌────────────────────────┐             │
│  │  Supabase Auth   │  │  secureStorage         │             │
│  │  (トークン交換)  │  │  (暗号化保存)          │             │
│  └──────────────────┘  └────────────────────────┘             │
│                                                               │
│  ┌──────────────────────────┐                                 │
│  │  customProtocol.ts       │                                 │
│  │  (URLスキーム: fallback) │                                 │
│  └──────────────────────────┘                                 │
└───────────────────────────────────────────────────────────────┘
```

---

## Task 1: PKCE生成モジュール設計

### ファイル: `apps/desktop/src/main/auth/pkce.ts`

```typescript
import { randomBytes, createHash } from "crypto";

export interface PKCEPair {
  codeVerifier: string; // 43-128文字のBase64URL文字列
  codeChallenge: string; // SHA-256ハッシュのBase64URL文字列
}

/**
 * Base64URL エンコード（RFC 4648 Section 5）
 * '+' → '-', '/' → '_', '=' 除去
 */
function base64UrlEncode(buffer: Buffer): string;

/**
 * PKCE code_verifier を生成（RFC 7636 Section 4.1）
 * @param length バイト長（デフォルト: 32、生成文字列は約43文字）
 */
export function generateCodeVerifier(length?: number): string;

/**
 * PKCE code_challenge を算出（RFC 7636 Section 4.2）
 * SHA-256ハッシュ → Base64URLエンコード
 */
export function calculateCodeChallenge(verifier: string): string;

/**
 * PKCE code_verifier/code_challenge ペアを生成
 */
export function generatePKCEPair(): PKCEPair;
```

### 設計方針

- 純粋関数として設計（副作用なし、テスタビリティ最大化）
- `crypto` モジュールのみ使用（外部依存なし）
- Base64URL エンコードは自前実装（標準ライブラリに依存）
- code_verifierのデフォルト長: 32バイト → Base64URL約43文字（RFC 7636最低要件）

---

## Task 2: ローカルHTTPサーバー設計

### ファイル: `apps/desktop/src/main/auth/authCallbackServer.ts`

```typescript
import { createServer, Server, IncomingMessage, ServerResponse } from 'http';

export interface AuthCallbackResult {
  code: string;    // authorization_code
  state: string;   // state parameter
}

export interface AuthCallbackServerOptions {
  host?: string;       // デフォルト: '127.0.0.1'
  timeoutMs?: number;  // デフォルト: 300000（5分）
}

export class AuthCallbackServer {
  private server: Server | null = null;
  private port: number = 0;

  constructor(private options?: AuthCallbackServerOptions);

  /** HTTPサーバーを起動し、割り当てポートを返す */
  async start(): Promise<{ port: number }>;

  /** コールバック受信を待機（Promise） */
  async waitForCallback(): Promise<AuthCallbackResult>;

  /** HTTPサーバーを停止 */
  async stop(): Promise<void>;

  /** サーバーが稼働中か */
  get isRunning(): boolean;
}
```

### ライフサイクル

```
start() → waitForCallback() → stop()
  │            │                  │
  │            ├── 成功: resolve  │
  │            ├── エラー: reject │
  │            └── タイムアウト   │
  │                 └── reject   │
  └──────────────────────────────┘
       stop() は常に呼び出す
```

### リクエストハンドリング

| パス             | メソッド | 処理                             |
| ---------------- | -------- | -------------------------------- |
| `/auth/callback` | GET      | code + state 抽出 → 成功HTML返却 |
| その他           | \*       | 404 レスポンス                   |

### 成功HTMLレスポンス

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>認証完了</title>
  </head>
  <body style="font-family:system-ui;text-align:center;padding:60px">
    <h1>認証が完了しました</h1>
    <p>このタブを閉じてアプリケーションに戻ってください。</p>
    <script>
      setTimeout(() => {
        window.close();
      }, 2000);
    </script>
  </body>
</html>
```

### エラーHTMLレスポンス

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>認証エラー</title>
  </head>
  <body style="font-family:system-ui;text-align:center;padding:60px">
    <h1>認証に失敗しました</h1>
    <p>エラー: {{errorMessage}}</p>
    <p>アプリケーションに戻って再度お試しください。</p>
  </body>
</html>
```

---

## Task 3: 認証フローオーケストレーター設計

### ファイル: `apps/desktop/src/main/auth/authFlowOrchestrator.ts`

```typescript
import { BrowserWindow, shell } from 'electron';
import { SupabaseClient } from '@supabase/supabase-js';
import { PKCEPair, generatePKCEPair } from './pkce';
import { AuthCallbackServer, AuthCallbackResult } from './authCallbackServer';
import { SecureStorage } from '../ipc/authHandlers';
import { OAuthProvider } from '@repo/shared/types/auth';

interface PendingAuthFlow {
  state: string;
  codeVerifier: string;
  server: AuthCallbackServer;
  createdAt: number;
}

export class AuthFlowOrchestrator {
  private pendingFlows = new Map<string, PendingAuthFlow>();
  private readonly STATE_TTL_MS = 5 * 60 * 1000; // 5分

  constructor(
    private supabase: SupabaseClient,
    private mainWindow: BrowserWindow,
    private secureStorage: SecureStorage,
  );

  /** PKCE対応OAuth認証フローを開始 */
  async startOAuthFlow(provider: OAuthProvider): Promise<void>;

  /** 期限切れの pending flows をクリーンアップ */
  private cleanupExpiredFlows(): void;

  /** state parameter を生成 */
  private generateState(): string;

  /** コールバック受信後の処理 */
  private async handleCallback(
    result: AuthCallbackResult,
    flow: PendingAuthFlow,
  ): Promise<void>;

  /** 全リソースを解放 */
  async dispose(): void;
}
```

### 状態遷移

```
[IDLE] ──startOAuthFlow()──→ [GENERATING]
  │                              │
  │   PKCE生成 + State生成       │
  │   HTTPサーバー起動           │
  │                              ▼
  │                         [WAITING]
  │                              │
  │   ブラウザでOAuth実行中      │
  │   HTTPサーバーが待機         │
  │                              │
  │   ┌──── コールバック受信 ────┤
  │   │                          │
  │   ▼                          ▼
  │  [VALIDATING]          [TIMED_OUT]
  │   │                          │
  │   │ state照合                │ クリーンアップ
  │   │ トークン交換             │
  │   │                          ▼
  │   │                     [ERROR]
  │   │                          │
  │   ▼                          │
  │  [COMPLETING]                │
  │   │                          │
  │   │ セッション確立           │
  │   │ Renderer通知             │
  │   │                          │
  │   ▼                          │
  └──[IDLE] ◄────────────────────┘
```

### OAuth URL 構築

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider,
  options: {
    redirectTo: `http://127.0.0.1:${port}/auth/callback`,
    skipBrowserRedirect: true,
    queryParams: {
      code_challenge: pkcePair.codeChallenge,
      code_challenge_method: "S256",
      state: state,
    },
  },
});
```

---

## Task 4: IPC通信設計

### 新規チャンネル

| チャンネル名            | 方向            | Invoke/On | 用途              | withValidation |
| ----------------------- | --------------- | --------- | ----------------- | -------------- |
| `auth:start-oauth-flow` | Renderer → Main | invoke    | PKCE対応OAuth開始 | 必須           |

### 変更チャンネル

| チャンネル名         | 変更内容                                             |
| -------------------- | ---------------------------------------------------- |
| `auth:login`         | 内部実装をオーケストレーター委譲に変更               |
| `auth:state-changed` | トークン交換完了後のセッション通知に利用（変更なし） |

### channels.ts 追加

```typescript
// 既存
AUTH_LOGIN: "auth:login",
// 追加
AUTH_START_OAUTH_FLOW: "auth:start-oauth-flow",
```

### ホワイトリスト追加

- `ALLOWED_INVOKE_CHANNELS` に `auth:start-oauth-flow` を追加

### Preload Bridge API

```typescript
// apps/desktop/src/preload/index.ts
auth: {
  // 既存
  login: (args: { provider: string }) => safeInvoke(IPC_CHANNELS.AUTH_LOGIN, args),
  // ... 既存API維持
}
```

> **設計判断**: `auth:login` ハンドラーの内部実装をオーケストレーター経由に変更する方式を採用。Renderer側のAPIインターフェースは変更なし（後方互換性維持）。新規 `auth:start-oauth-flow` チャンネルは将来の拡張用に予約するが、Phase 5では `auth:login` の内部委譲で実装する。

---

## Task 5: カスタムURLスキーム統合設計

### 変更対象: `customProtocol.ts`

**現在の処理フロー**:

```
aiworkflow://auth/callback#access_token=xxx → processAuthCallback()
```

**変更後の処理フロー**:

```
aiworkflow://auth/callback?code=xxx&state=yyy → オーケストレーター連携
aiworkflow://auth/done → ウィンドウフォアグラウンド表示
aiworkflow://auth/callback#access_token=xxx → レガシーフォールバック（互換性）
```

### フォールバック戦略

| 優先度 | 方式                 | 対象環境     | 動作                       |
| ------ | -------------------- | ------------ | -------------------------- |
| 1      | ローカルHTTPサーバー | 全環境       | 127.0.0.1:動的ポートで受信 |
| 2      | カスタムURLスキーム  | パッケージ版 | aiworkflow:// で受信       |

---

## 機密情報分類

| データ             | 分類     | 保存先                    | 保護方式                       |
| ------------------ | -------- | ------------------------- | ------------------------------ |
| code_verifier      | 機密     | Main Process メモリのみ   | 使用後即座に削除、ログ出力禁止 |
| state parameter    | 機密     | Main Process メモリのみ   | 使用後即座に削除、5分TTL       |
| authorization_code | 機密     | Main Process メモリのみ   | 使用後即座に削除、ログ出力禁止 |
| access_token       | 機密     | Main Process メモリのみ   | Renderer非露出                 |
| refresh_token      | 最高機密 | safeStorage暗号化ファイル | encryptString()で暗号化        |
