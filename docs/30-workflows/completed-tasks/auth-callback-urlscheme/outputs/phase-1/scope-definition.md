# Phase 1: スコープ定義

## メタ情報

| 項目     | 内容                   |
| -------- | ---------------------- |
| タスクID | TASK-AUTH-CALLBACK-001 |
| Phase    | 1                      |
| 作成日   | 2026-02-06             |

---

## スコープ内（含むもの）

### 1. Authorization Code Flow + PKCE 実装

- code_verifier / code_challenge 生成モジュール（`pkce.ts`）
- Supabase Auth APIへの `flowType: 'pkce'` オプション指定
- authorization_code と code_verifier によるトークン交換処理
- 既存 Implicit Flow コードの置き換え

### 2. ローカルHTTPサーバーによるコールバック受信

- `http.createServer()` による127.0.0.1限定HTTPサーバー
- 動的ポート割当（`server.listen(0, '127.0.0.1')`）
- `/auth/callback` エンドポイントでの code + state 受信
- 認証完了 / エラーHTMLレスポンスの返却
- タイムアウト付き自動停止（30秒）

### 3. State parameter検証（CSRF対策）

- OAuth開始時のstate生成（32バイト以上ランダム文字列）
- Main Process Mapでのstate保存（5分TTL）
- コールバック受信時のstate照合
- 使用済みstateの即時削除（リプレイ攻撃防止）

### 4. カスタムURLスキーム（パッケージ版UX向上）

- `aiworkflow://` のOS登録維持（electron-builder.yml既存設定）
- パッケージ版でのカスタムURLスキーム経由フォールバック
- `app.setAsDefaultProtocolClient()` による開発ビルド登録

### 5. devMockAuth.ts 復元

- `isDevMode()` の `return true;` 一時修正の削除
- 本来のロジック（E2E環境フラグ、localStorage、URLパラメータ）の復元
- 開発環境での実OAuth認証フロー有効化

### 6. 技術的負債（DEBT-SEC）解消

| DEBT ID      | 内容                          | 解消方法                            |
| ------------ | ----------------------------- | ----------------------------------- |
| DEBT-SEC-001 | State parameter検証未実装     | state生成・照合・削除の実装         |
| DEBT-SEC-002 | PKCE未実装                    | code_verifier/code_challenge + 交換 |
| DEBT-SEC-003 | カスタムプロトコルURL詳細検証 | HTTPサーバー方式で根本解決          |

### 7. 既存実装との互換性維持

- TASK-FIX-GOOGLE-LOGIN-001の成果物維持:
  - `authListenerRegistered` フラグ（リスナー二重登録防止）
  - `resetAuthListenerFlag()` テスト用関数
  - `calculateRefreshTokenExpiry()` 関数のPKCEフローでの維持
- `waitForSession()` 関数の必要性評価と適切な対応
- 既存テスト（oauth-error-handler, authSlice, authHandlers）のパス維持

### 8. IPC通信更新

- 新規IPCチャンネル追加（`auth:start-pkce-flow`, `auth:callback-server-port`）
- チャンネルホワイトリスト（`channels.ts`）への追加
- Preload Bridge更新

---

## スコープ外（含まないもの）

### 1. Supabase側の設定変更

- SupabaseダッシュボードでのリダイレクトURL追加は手動作業
- `http://127.0.0.1:*/auth/callback` の許可設定はユーザーが実施

### 2. 認証UI（AuthView）の変更

- ログインボタンのUIデザイン変更なし
- 認証画面のレイアウト変更なし
- ローディングインジケーターの追加・変更なし

### 3. 複数アカウントサポート

- 単一アカウントでのログイン/ログアウトのみ
- アカウント切替機能は対象外

### 4. OAuthプロバイダーの追加

- 既存3プロバイダー（Google, GitHub, Discord）のみ
- 新プロバイダー追加は対象外

### 5. バックエンド（Next.js Web）の認証フロー変更

- `apps/web` の認証処理は変更なし
- デスクトップアプリ（`apps/desktop`）のみが対象

### 6. トークンリフレッシュ戦略の変更

- 既存のリフレッシュトークン自動更新ロジックは維持
- リフレッシュ間隔やバックオフ戦略の変更は対象外

---

## 影響範囲

### 変更対象ファイル（予定）

| ファイル                                             | 変更種別 | 内容                         |
| ---------------------------------------------------- | -------- | ---------------------------- |
| `apps/desktop/src/main/auth/pkce.ts`                 | 新規     | PKCE生成モジュール           |
| `apps/desktop/src/main/auth/authCallbackServer.ts`   | 新規     | ローカルHTTPサーバー         |
| `apps/desktop/src/main/auth/authFlowOrchestrator.ts` | 新規     | 認証フローオーケストレーター |
| `apps/desktop/src/main/ipc/authHandlers.ts`          | 変更     | PKCEフロー対応               |
| `apps/desktop/src/preload/channels.ts`               | 変更     | 新規チャンネル追加           |
| `apps/desktop/src/preload/index.ts`                  | 変更     | Bridge API追加               |
| `apps/desktop/src/main/protocol/customProtocol.ts`   | 変更     | HTTPサーバー連携             |
| `apps/desktop/src/renderer/utils/devMockAuth.ts`     | 変更     | 一時修正復元                 |
| `packages/shared/types/auth-pkce.ts`                 | 新規     | PKCE関連型定義               |

### 影響を受ける既存機能

| 機能               | 影響                             | リスク |
| ------------------ | -------------------------------- | ------ |
| OAuth認証フロー    | Implicit Flow → PKCE Flow に移行 | 高     |
| devMockAuth        | 一時修正の復元                   | 中     |
| 認証状態管理       | セッション確立方法の変更         | 中     |
| カスタムプロトコル | HTTPサーバーとの連携追加         | 低     |
| 既存テスト         | テストの互換性維持が必要         | 中     |

---

## 前提条件

1. Supabaseプロジェクトが正常稼働している
2. Supabaseダッシュボードで `http://127.0.0.1:*/auth/callback` がリダイレクトURLに追加済み
3. Node.js 22.x がインストールされている
4. pnpm がグローバルインストールされている
5. macOS 12+ / Windows 10+ / Ubuntu 22.04+ のいずれかの環境

---

## リスク評価

| リスク                                | 影響度 | 発生確率 | 対策                                    |
| ------------------------------------- | ------ | -------- | --------------------------------------- |
| ポート競合でHTTPサーバー起動失敗      | 中     | 低       | 動的ポート割当で回避                    |
| Supabase PKCE対応の互換性問題         | 高     | 低       | Supabase公式ドキュメントに準拠          |
| 既存テストの破壊                      | 高     | 中       | Phase 4でテスト先行作成、互換性テスト   |
| プラットフォーム固有のURLスキーム問題 | 中     | 中       | OS別テスト、HTTPサーバーフォールバック  |
| devMockAuth復元後の開発体験低下       | 低     | 中       | E2Eモードフラグで開発時スキップ可能維持 |
