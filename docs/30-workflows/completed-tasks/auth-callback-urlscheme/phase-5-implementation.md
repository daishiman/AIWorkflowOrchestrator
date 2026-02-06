# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目     | 内容                    |
| -------- | ----------------------- |
| Phase    | 5                       |
| 機能名   | auth-callback-urlscheme |
| 作成日   | 2026-02-05              |
| タスクID | TASK-AUTH-CALLBACK-001  |

---

## 目的

Phase 4で作成した失敗テスト（Red状態）を通すための最小限の実装を行い、TDD Greenフェーズを完了する。PKCE生成・ローカルHTTPサーバー・認証フローオーケストレーター・IPC/Preload更新・カスタムURLスキーム統合・devMockAuth復元を実装する。

---

## 実行タスク

- Task 1: PKCE生成モジュール実装 - `apps/desktop/src/main/auth/pkce.ts`
- Task 2: ローカルHTTPサーバー実装 - `apps/desktop/src/main/auth/authCallbackServer.ts`
- Task 3: 認証フローオーケストレーター実装 - `apps/desktop/src/main/auth/authFlowOrchestrator.ts`
- Task 4: authHandlers.tsの更新 - Implicit Flow → PKCE対応
- Task 5: IPC・Preload更新 - チャネル追加、ホワイトリスト更新
- Task 6: カスタムURLスキーム更新 - customProtocol.tsのフォールバック統合
- Task 7: devMockAuth.ts復元 - `return true;`削除、本来のロジック復活

---

## 参照資料

| 参照資料                  | パス                                                                              | 内容                         |
| ------------------------- | --------------------------------------------------------------------------------- | ---------------------------- |
| Phase 2アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`                                          | コンポーネント構成と責務分離 |
| Phase 2 API仕様           | `outputs/phase-2/api-specification.md`                                            | IPC・内部API設計             |
| Phase 2データフロー設計   | `outputs/phase-2/data-flow-design.md`                                             | 認証フロー全体の設計         |
| Phase 3レビュー結果       | `outputs/phase-3/design-review-result.md`                                         | 承認済み設計                 |
| Phase 4テスト仕様書       | `outputs/phase-4/test-specification.md`                                           | テスト設計・観点             |
| 認証セキュリティ仕様      | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` | 認証基盤設計                 |
| Electron IPCセキュリティ  | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      | IPC通信セキュリティ原則      |
| 既存認証ハンドラー        | `apps/desktop/src/main/ipc/authHandlers.ts`                                       | 現在のOAuth認証IPCハンドラー |
| 既存カスタムプロトコル    | `apps/desktop/src/main/protocol/customProtocol.ts`                                | 現在のURLスキーム登録処理    |
| devMockAuth               | `apps/desktop/src/renderer/utils/devMockAuth.ts`                                  | 一時的な認証スキップ処理     |
| SecureStorage             | `apps/desktop/src/main/infrastructure/secureStorage.ts`                           | トークン暗号化保存           |
| IPCチャネル定義           | `packages/shared/constants/ipcChannels.ts`                                        | 既存IPCチャネル定数          |

---

## 実行手順

### Task 1: PKCE生成モジュール実装

**ファイル**: `apps/desktop/src/main/auth/pkce.ts`（新規作成）

**実装内容**:

```typescript
import crypto from "node:crypto";

export interface PKCEPair {
  codeVerifier: string;
  codeChallenge: string;
}

/**
 * Base64URLエンコード（RFC 7636 Appendix A準拠）
 * +→-, /→_, =除去
 */
function base64URLEncode(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * PKCE code_verifierを生成する（RFC 7636 Section 4.1）
 * @param length 生成する文字列の長さ（43-128、デフォルト64）
 */
export function generateCodeVerifier(length: number = 64): string {
  const buffer = crypto.randomBytes(length);
  return base64URLEncode(buffer).slice(0, length);
}

/**
 * PKCE code_challengeを算出する（RFC 7636 Section 4.2）
 * code_challenge = BASE64URL(SHA256(code_verifier))
 */
export function calculateCodeChallenge(verifier: string): string {
  const hash = crypto.createHash("sha256").update(verifier).digest();
  return base64URLEncode(hash);
}

/**
 * PKCEペア（code_verifier + code_challenge）を生成する
 */
export function generatePKCEPair(length?: number): PKCEPair {
  const codeVerifier = generateCodeVerifier(length);
  const codeChallenge = calculateCodeChallenge(codeVerifier);
  return { codeVerifier, codeChallenge };
}
```

**設計原則**:

- 純粋関数として設計（テスタビリティ重視）
- `crypto.randomBytes()` による暗号学的に安全な乱数生成
- RFC 7636準拠のBase64URLエンコード

### Task 2: ローカルHTTPサーバー実装

**ファイル**: `apps/desktop/src/main/auth/authCallbackServer.ts`（新規作成）

**実装内容**:

```typescript
import http from "node:http";
import { URL } from "node:url";

export interface AuthCallbackResult {
  code: string;
  state: string;
}

export interface AuthCallbackServerOptions {
  host?: string; // デフォルト: '127.0.0.1'
  timeoutMs?: number; // デフォルト: 300000（5分）
}

export interface AuthCallbackServer {
  start(): Promise<{ port: number }>;
  stop(): Promise<void>;
  waitForCallback(timeoutMs?: number): Promise<AuthCallbackResult>;
}
```

**主要実装ポイント**:

- `http.createServer()` でNode.js標準HTTPサーバーを作成
- `127.0.0.1` のみでリッスン（セキュリティ: 外部アクセス不可）
- ポート0でOS動的割り当て
- コールバック受信後に「認証完了」HTMLを返却
- タイムアウト（デフォルト5分）でサーバー自動停止
- `stop()` でサーバークローズ・Promiseリジェクト・リソース解放

### Task 3: 認証フローオーケストレーター実装

**ファイル**: `apps/desktop/src/main/auth/authFlowOrchestrator.ts`（新規作成）

**実装内容**:

```typescript
import crypto from "node:crypto";
import { shell } from "electron";
import { generatePKCEPair } from "./pkce";
import { createAuthCallbackServer } from "./authCallbackServer";

interface PendingAuthFlow {
  state: string;
  codeVerifier: string;
  server: AuthCallbackServer;
  createdAt: number;
}
```

**フロー実装**:

1. `startOAuthFlow(provider)` を呼び出し
2. `generatePKCEPair()` でPKCEペアを生成
3. `crypto.randomBytes(32)` でStateパラメータを生成
4. `pendingFlowsMap` に `{state, codeVerifier}` を保存
5. `createAuthCallbackServer()` でHTTPサーバーを起動
6. Supabase OAuth URLを構築（`redirectTo`, `codeChallenge`, `codeChallengeMethod`, `state`）
7. `shell.openExternal(oauthUrl)` でブラウザを開く
8. `server.waitForCallback()` でコールバックを待機
9. State検証 → トークン交換 → セッション確立
10. エラー/タイムアウト時はクリーンアップ → エラー通知

### Task 4: authHandlers.tsの更新

**ファイル**: `apps/desktop/src/main/ipc/authHandlers.ts`（既存更新）

**変更内容**:

- 既存の `signInWithOAuth()` 呼び出し（Implicit Flow）をオーケストレーター呼び出しに置き換え
- `auth:login` ハンドラー内で `authFlowOrchestrator.startOAuthFlow(provider)` を呼び出す
- 既存のOAuthエラーハンドラー（`oauth-error-handler.ts`）との連携を維持
- エラー発生時に既存の `parseOAuthError()` でエラーを検出し、`mapOAuthErrorToMessage()` でユーザー向けメッセージにマッピング
- `parseOAuthError()` はPKCEフロー由来のエラーフォーマット（authorization_codeエラー、トークン交換エラー）にも対応させる

**注意点**:

- 既存のauth:login IPCチャネルのインターフェース（引数: provider名、戻り値: void）を維持
- 既存のAUTH_STATE_CHANGED通知パターンを維持

### Task 5: IPC・Preload更新

**変更ファイル**:

| ファイル                                    | 変更内容                                                                     |
| ------------------------------------------- | ---------------------------------------------------------------------------- |
| `packages/shared/constants/ipcChannels.ts`  | `auth:start-oauth-flow`, `auth:callback-port` チャネル追加                   |
| `apps/desktop/src/preload/index.ts`         | `ALLOWED_INVOKE_CHANNELS` に新規チャネル追加                                 |
| `apps/desktop/src/main/ipc/authHandlers.ts` | 新規チャネルのハンドラー登録（`withValidation()` によるIPC送信元検証を適用） |

**Preloadホワイトリスト更新**:

```typescript
// apps/desktop/src/preload/index.ts
const ALLOWED_INVOKE_CHANNELS = [
  // 既存チャネル...
  "auth:start-oauth-flow", // 新規追加
];
```

### Task 6: カスタムURLスキーム更新

**ファイル**: `apps/desktop/src/main/protocol/customProtocol.ts`（既存更新）

**変更内容**:

- `aiworkflow://auth/done` を受信した場合、ウィンドウをフォアグラウンドに表示する処理を追加
- 既存の `aiworkflow://auth/callback#...` 処理はフォールバックとして維持
- DEBT-SEC-003対応: URLパス検証（許可パスの明示的ホワイトリスト: `/auth/done`, `/auth/callback`）およびクエリパラメータ検証を追加
- macOS: `open-url` イベントでカスタムURLスキーム受信
- Windows: `second-instance` イベントでDeep Link受信

```typescript
// 追加するハンドリング
if (url.pathname === "/auth/done") {
  // パッケージ版: ウィンドウをフォアグラウンドに表示
  const mainWindow = getMainWindow();
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
}
```

### Task 7: devMockAuth.ts復元

**ファイル**: `apps/desktop/src/renderer/utils/devMockAuth.ts`（既存更新）

**変更内容**:

- 一時的に追加された `return true;` を削除
- 本来の認証ロジックを復元
- 開発ビルドでもHTTPサーバー経由の実際の認証フローを使用

```typescript
// 変更前（一時修正）
export async function devMockAuth(): Promise<boolean> {
  return true; // ← この行を削除
  // 本来のロジック...
}

// 変更後（復元）
export async function devMockAuth(): Promise<boolean> {
  // 本来の認証ロジックが実行される
}
```

---

## Electron層別ファイル配置ガイド

| 層               | ファイル                                   | 責務                                  |
| ---------------- | ------------------------------------------ | ------------------------------------- |
| Main Process     | `src/main/auth/pkce.ts`                    | PKCE code_verifier/code_challenge生成 |
| Main Process     | `src/main/auth/authCallbackServer.ts`      | ローカルHTTPサーバー管理              |
| Main Process     | `src/main/auth/authFlowOrchestrator.ts`    | OAuth認証フロー全体の制御             |
| Main Process     | `src/main/ipc/authHandlers.ts`             | IPC認証ハンドラー（既存更新）         |
| Main Process     | `src/main/protocol/customProtocol.ts`      | カスタムURLスキーム処理（既存更新）   |
| Preload          | `src/preload/index.ts`                     | IPC APIホワイトリスト更新             |
| Renderer Process | `src/renderer/utils/devMockAuth.ts`        | 一時修正の復元                        |
| Shared           | `packages/shared/constants/ipcChannels.ts` | IPCチャネル定数追加                   |

---

## TDD検証: Green状態確認

```bash
# 全テスト実行
pnpm --filter @repo/desktop test -- --run src/main/auth/__tests__/

# 期待結果: 全テストがパス（Green状態）
# - pkce.test.ts: 全7テストケースがパス
# - authCallbackServer.test.ts: 全7テストケースがパス
# - authFlowOrchestrator.test.ts: 全9テストケースがパス
# - auth-ipc-integration.test.ts: 全5テストケースがパス

# 既存テストのリグレッション確認
pnpm --filter @repo/desktop test -- --run
```

---

## 統合テスト連携

| 実装項目             | 統合テスト検証内容                                  |
| -------------------- | --------------------------------------------------- |
| PKCE生成モジュール   | code_verifier → code_challenge → Supabase送信の連携 |
| ローカルHTTPサーバー | 起動 → コールバック受信 → コード取得の連携          |
| オーケストレーター   | 全コンポーネント統合フローの動作                    |
| authHandlers更新     | IPC経由でのPKCE OAuth開始                           |
| Preload更新          | ホワイトリスト経由でのチャネルアクセス              |
| customProtocol更新   | URLスキーム受信 → ウィンドウフォアグラウンド        |
| devMockAuth復元      | 開発ビルドでの実認証フロー動作                      |

---

## 成果物

| 成果物               | パス                                                 | 説明                          |
| -------------------- | ---------------------------------------------------- | ----------------------------- |
| PKCE生成モジュール   | `apps/desktop/src/main/auth/pkce.ts`                 | PKCE生成ユーティリティ        |
| ローカルHTTPサーバー | `apps/desktop/src/main/auth/authCallbackServer.ts`   | コールバック受信サーバー      |
| オーケストレーター   | `apps/desktop/src/main/auth/authFlowOrchestrator.ts` | 認証フロー全体制御            |
| authHandlers更新     | `apps/desktop/src/main/ipc/authHandlers.ts`          | PKCE対応IPCハンドラー         |
| Preload更新          | `apps/desktop/src/preload/index.ts`                  | ホワイトリスト更新            |
| customProtocol更新   | `apps/desktop/src/main/protocol/customProtocol.ts`   | URLスキームフォールバック統合 |
| devMockAuth復元      | `apps/desktop/src/renderer/utils/devMockAuth.ts`     | 一時修正の復元                |
| IPCチャネル定数更新  | `packages/shared/constants/ipcChannels.ts`           | 新規チャネル追加              |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md`          | 実装済みコンポーネント一覧    |

---

## 完了条件

- [ ] Task 1〜7の全実装が完了している
- [ ] Phase 4で作成した全テスト（28テストケース）がGreen状態である
- [ ] 既存テスト（oauth-error-handler.test.ts, authSlice.test.ts）が引き続きパスする
- [ ] TypeScript型チェック（`pnpm typecheck`）がエラーなしで通過する
- [ ] ESLint（`pnpm lint`）がエラーなしで通過する
- [ ] Electron層別のファイル配置が設計書どおりである
- [ ] 実装サマリーが`outputs/phase-5/implementation-summary.md`に配置されている
- [ ] **本Phase内の全タスクを100%実行完了している**

---

## タスク100%実行確認

- [ ] Task 1: PKCE生成モジュール実装（pkce.ts） - 完了
- [ ] Task 2: ローカルHTTPサーバー実装（authCallbackServer.ts） - 完了
- [ ] Task 3: 認証フローオーケストレーター実装（authFlowOrchestrator.ts） - 完了
- [ ] Task 4: authHandlers.tsの更新 - 完了
- [ ] Task 5: IPC・Preload更新 - 完了
- [ ] Task 6: カスタムURLスキーム更新（customProtocol.ts） - 完了
- [ ] Task 7: devMockAuth.ts復元 - 完了

---

## 次のPhase

[Phase 6: テスト拡充](phase-6-test-expansion.md)
