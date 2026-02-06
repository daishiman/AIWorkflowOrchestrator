# Phase 2: 設計

## メタ情報

| 項目     | 内容                    |
| -------- | ----------------------- |
| Phase    | 2                       |
| 機能名   | auth-callback-urlscheme |
| 作成日   | 2026-02-05              |
| タスクID | TASK-AUTH-CALLBACK-001  |

---

## 目的

Phase 1で定義した要件に基づき、ローカルHTTPサーバー + PKCE + State parameterを組み合わせた認証コールバック処理のアーキテクチャ設計・API設計・データフロー設計を行う。

---

## 実行タスク

- Task 1: PKCE生成モジュール設計 - code_verifier/code_challenge生成ユーティリティの設計
- Task 2: ローカルHTTPサーバー設計 - 127.0.0.1動的ポートのHTTPサーバーライフサイクル設計
- Task 3: 認証フローオーケストレーター設計 - OAuth開始からセッション確立までの統合フロー設計
- Task 4: IPC通信設計 - 新規・変更IPCチャネルの設計
- Task 5: カスタムURLスキーム統合設計 - パッケージ版でのUX向上用Deep Link設計

---

## 参照資料

| 参照資料                 | パス                                                                              | 内容                      |
| ------------------------ | --------------------------------------------------------------------------------- | ------------------------- |
| Phase 1成果物            | `outputs/phase-1/requirements-definition.md`                                      | 機能・非機能要件          |
| Phase 1成果物            | `outputs/phase-1/scope-definition.md`                                             | スコープ定義              |
| 認証インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`            | AuthSession型定義         |
| 認証セキュリティ仕様     | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` | プロセス間責務分離        |
| Electron IPC仕様         | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      | safeInvoke/safeOnパターン |
| 既存カスタムプロトコル   | `apps/desktop/src/main/protocol/customProtocol.ts`                                | 現在のURL登録処理         |
| 既存認証ハンドラー       | `apps/desktop/src/main/ipc/authHandlers.ts`                                       | signInWithOAuth実装       |
| SecureStorage            | `apps/desktop/src/main/infrastructure/secureStorage.ts`                           | トークン暗号化保存        |
| IPCチャネル定義          | `packages/shared/constants/ipcChannels.ts`                                        | 既存IPCチャネル定数       |

---

## 実行手順

### Task 1: PKCE生成モジュール設計

**ファイル**: `apps/desktop/src/main/auth/pkce.ts`（新規作成）

```typescript
// インターフェース設計
interface PKCEPair {
  codeVerifier: string; // 43-128文字のBase64URL文字列
  codeChallenge: string; // SHA-256ハッシュのBase64URL文字列
}

// 公開API
function generatePKCEPair(): PKCEPair;
function generateCodeVerifier(length?: number): string; // デフォルト: 64
function calculateCodeChallenge(verifier: string): string;
```

**設計方針**:

- `crypto.randomBytes()`でランダムバイト列を生成
- Base64URLエンコード（`+`→`-`, `/`→`_`, `=`除去）
- SHA-256ハッシュでcode_challengeを算出
- テスタビリティのため純粋関数として設計

### Task 2: ローカルHTTPサーバー設計

**ファイル**: `apps/desktop/src/main/auth/authCallbackServer.ts`（新規作成）

```typescript
// インターフェース設計
interface AuthCallbackServer {
  start(): Promise<{ port: number }>;
  stop(): Promise<void>;
  waitForCallback(timeoutMs?: number): Promise<AuthCallbackResult>;
}

interface AuthCallbackResult {
  code: string; // authorization_code
  state: string; // stateパラメータ
}

interface AuthCallbackServerOptions {
  host?: string; // デフォルト: '127.0.0.1'
  timeoutMs?: number; // デフォルト: 300000（5分）
}
```

**設計方針**:

- Node.js `http.createServer()` を使用（外部依存なし）
- `127.0.0.1` のみでリッスン（セキュリティ: 外部アクセス不可）
- ポート0で起動（OS動的割り当て）
- コールバック受信後に「認証完了」HTML + `aiworkflow://auth/done` リダイレクトを返却
- タイムアウト（5分）でサーバー自動停止
- Promiseベースの非同期API

**HTMLレスポンス設計**:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>認証完了</title>
  </head>
  <body>
    <h1>認証が完了しました</h1>
    <p>アプリケーションに戻ってください。</p>
    <script>
      // パッケージ版: カスタムスキームでアプリに自動復帰
      setTimeout(() => {
        window.location.href = "aiworkflow://auth/done";
      }, 500);
    </script>
  </body>
</html>
```

### Task 3: 認証フローオーケストレーター設計

**ファイル**: `apps/desktop/src/main/auth/authFlowOrchestrator.ts`（新規作成）

```typescript
// インターフェース設計
interface AuthFlowOrchestrator {
  startOAuthFlow(provider: OAuthProvider): Promise<void>;
}

// 内部状態管理
interface PendingAuthFlow {
  state: string;
  codeVerifier: string;
  server: AuthCallbackServer;
  createdAt: number;
}
```

**フロー設計**:

```
1. startOAuthFlow(provider) 呼び出し
   ├── PKCEPairを生成（pkce.ts）
   ├── Stateパラメータを生成（crypto.randomBytes(32)）
   ├── pendingFlowsMapに{state, codeVerifier}を保存
   ├── AuthCallbackServerを起動
   ├── Supabase OAuth URLを構築
   │   ├── redirectTo: `http://127.0.0.1:${port}/auth/callback`
   │   ├── codeChallenge: PKCEPair.codeChallenge
   │   ├── codeChallengeMethod: 'S256'
   │   └── state: 生成したstate
   ├── shell.openExternal(oauthUrl)
   └── server.waitForCallback() を開始
       ├── 成功: state検証 → トークン交換 → セッション確立
       └── タイムアウト/エラー: クリーンアップ → エラー通知
```

### Task 4: IPC通信設計

**変更対象**: `packages/shared/constants/ipcChannels.ts`

新規チャネル:

| チャネル名              | 方向            | 用途                       | withValidation |
| ----------------------- | --------------- | -------------------------- | -------------- |
| `auth:start-oauth-flow` | Renderer → Main | PKCE対応OAuth開始          | 必須           |
| `auth:callback-port`    | Main → Renderer | HTTPサーバーポート番号通知 | 必須           |

> **注**: 新規チャネルには `withValidation()` によるIPC送信元検証を適用する（`security-api-electron.md` 準拠）。チャネル命名は既存の `auth:login`, `auth:logout` パターンに従い `auth:` プレフィックスで統一する。

**変更チャネル**:

| チャネル名   | 変更内容                                    |
| ------------ | ------------------------------------------- |
| `auth:login` | 既存のImplicit Flow呼び出しをPKCE対応に変更 |

**Preload変更**:

`apps/desktop/src/preload/index.ts` の `ALLOWED_INVOKE_CHANNELS` に `auth:start-oauth-flow` を追加。

### Task 5: カスタムURLスキーム統合設計

**変更対象**: `apps/desktop/src/main/protocol/customProtocol.ts`

- `aiworkflow://auth/done` を受信した場合、ウィンドウをフォアグラウンドに表示する処理を追加
- 既存の `aiworkflow://auth/callback#...` 処理は互換性のため残す（フォールバック）
- パッケージ版のみカスタムURLスキーム経由の処理が動作

### waitForSession()の設計判断

Phase 1スコープにて「waitForSession()関数の必要性評価と維持/削除の判断」が含まれている。設計時に以下を判断する:

- **現状**: `waitForSession()` はImplicit Flowでの認証コールバック後にセッション確立を待機する関数
- **PKCE移行後**: `authFlowOrchestrator.startOAuthFlow()` 内でトークン交換→セッション確立を同期的に処理するため、Renderer側での待機は不要になる可能性がある
- **判断**: 実装Phase（Phase 5）にて、オーケストレーターのフロー完了後にIPC経由で通知する方式を採用する場合は `waitForSession()` を削除候補とする。ただし、既存のauthSliceとの互換性を維持するため、最終判断はPhase 5で行う

---

## 多角的チェック観点

### セキュリティ観点

- HTTPサーバーのバインドアドレスが127.0.0.1に限定されているか
- PKCE code_verifierのエントロピーが十分か（最低43文字）
- State parameterがリクエストごとにユニークか
- 使用済みのstate/codeVerifierが速やかに削除されるか

### 機密情報分類

| データ             | 分類     | 保存先                    | 保護方式                            |
| ------------------ | -------- | ------------------------- | ----------------------------------- |
| code_verifier      | 機密     | Main Process メモリのみ   | 使用後即座に削除、ログ出力禁止      |
| state parameter    | 機密     | Main Process メモリのみ   | 使用後即座に削除、ログ出力禁止      |
| authorization_code | 機密     | Main Process メモリのみ   | 使用後即座に削除、ログ出力禁止      |
| access_token       | 機密     | Main Process メモリのみ   | Renderer Process非露出              |
| refresh_token      | 最高機密 | safeStorage暗号化ファイル | safeStorage.encryptString()で暗号化 |

### アーキテクチャ観点（Electron層別）

| 層               | 責務                                         | ファイル                                 |
| ---------------- | -------------------------------------------- | ---------------------------------------- |
| Main Process     | PKCE生成、HTTPサーバー、トークン交換、暗号化 | `src/main/auth/*.ts`                     |
| Preload          | IPC API公開（safeInvoke/safeOnラッパー）     | `src/preload/index.ts`                   |
| Renderer Process | 認証状態表示、ログインボタン、エラー表示     | `src/renderer/store/slices/authSlice.ts` |
| Shared           | IPCチャネル定数、型定義                      | `packages/shared/constants/`, `types/`   |

---

## 統合テスト連携

| カテゴリ | テスト対象                                               |
| -------- | -------------------------------------------------------- |
| ユニット | PKCE生成関数（generatePKCEPair, calculateCodeChallenge） |
| ユニット | State parameter生成・検証                                |
| ユニット | HTMLレスポンス生成                                       |
| 統合     | HTTPサーバー起動→コールバック受信→停止                   |
| 統合     | OAuth開始→コールバック→セッション確立                    |

---

## 成果物

| 成果物             | パス                                     | 説明                         |
| ------------------ | ---------------------------------------- | ---------------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | コンポーネント構成と責務分離 |
| API仕様            | `outputs/phase-2/api-specification.md`   | IPC・内部API設計             |
| データフロー設計   | `outputs/phase-2/data-flow-design.md`    | 認証フロー全体の設計         |

---

## 完了条件

- [ ] PKCEモジュールのインターフェースがTypeScriptで定義されている
- [ ] ローカルHTTPサーバーのライフサイクル（起動・待機・停止）が設計されている
- [ ] 認証フローオーケストレーターの状態遷移が図示されている
- [ ] 新規・変更IPCチャネルがテーブル形式で一覧化されている
- [ ] カスタムURLスキームとHTTPサーバーのフォールバック関係が設計されている
- [ ] Electron層別（Main/Preload/Renderer/Shared）のファイル配置が明確である
- [ ] 3つの成果物ファイルが`outputs/phase-2/`に配置されている
- [ ] **本Phase内の全タスクを100%実行完了している**

---

## タスク100%実行確認

- [ ] Task 1: PKCE生成モジュール設計 - 完了
- [ ] Task 2: ローカルHTTPサーバー設計 - 完了
- [ ] Task 3: 認証フローオーケストレーター設計 - 完了
- [ ] Task 4: IPC通信設計 - 完了
- [ ] Task 5: カスタムURLスキーム統合設計 - 完了

---

## 次のPhase

[Phase 3: 設計レビューゲート](phase-3-design-review.md)
