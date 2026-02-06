# Phase 1: 受け入れ基準

## メタ情報

| 項目     | 内容                   |
| -------- | ---------------------- |
| タスクID | TASK-AUTH-CALLBACK-001 |
| Phase    | 1                      |
| 作成日   | 2026-02-06             |

---

## 受け入れ基準一覧

### AC-001: 開発ビルドでのOAuth認証完了

- **条件**: `pnpm --filter @repo/desktop dev` で起動したアプリケーション
- **操作**: Google OAuthログインボタンをクリック
- **期待結果**: ブラウザが開き、Googleアカウント選択後、アプリケーションに戻り認証が完了する
- **検証方法**: Renderer ProcessのauthSliceで `isAuthenticated: true`、`authUser` にユーザー情報が格納されている

### AC-002: クロスプラットフォーム動作

- **条件**: macOS / Windows / Linux の開発ビルド
- **操作**: Google OAuth認証フローを実行
- **期待結果**: 3プラットフォーム全てで認証フローが正常完了する
- **検証方法**: 各OSで手動テスト実施、認証状態がRendererに反映される

### AC-003: パッケージ版動作

- **条件**: `pnpm --filter @repo/desktop build` でビルドしたパッケージ版
- **操作**: OAuth認証フローを実行
- **期待結果**: パッケージ版でもカスタムURLスキーム経由で認証が完了する
- **検証方法**: パッケージ版で認証完了、AUTH_STATE_CHANGEDイベント受信を確認

### AC-004: State parameter検証（CSRF対策）

- **条件**: 認証フロー実行中
- **操作**: コールバックURLのstateパラメータを改ざんしてリクエスト
- **期待結果**: 認証が拒否され、エラーHTMLレスポンスが返却される
- **検証方法**: ユニットテストで不正state → 認証拒否を検証

### AC-005: PKCE code_verifier/code_challenge 検証

- **条件**: PKCEフロー開始時
- **操作**: code_verifierを生成し、code_challengeを算出
- **期待結果**: code_verifierが43-128文字のBase64URL文字列、code_challengeがSHA-256ハッシュと一致
- **検証方法**: ユニットテストで生成・検証の正当性を確認（RFC 7636準拠）

### AC-006: HTTPサーバー停止・ポート解放

- **条件**: OAuth認証完了後
- **操作**: 認証フローを完了（成功・失敗問わず）
- **期待結果**: HTTPサーバーが停止し、使用ポートが解放される
- **検証方法**: `server.listening` がfalse、同ポートで新規サーバー起動が可能

### AC-007: devMockAuth.ts 復元

- **条件**: 開発環境起動時
- **操作**: `pnpm --filter @repo/desktop dev` で起動
- **期待結果**: `isDevMode()` の `return true;` が削除され、実際の認証フローが使用される
- **検証方法**: devMockAuth.tsのソースコード確認、`isDevMode()` がE2E/localStorage/URLパラメータのみで判定

### AC-008: 既存テスト互換性

- **条件**: 全テストスイート実行
- **操作**: `pnpm --filter @repo/desktop test` を実行
- **期待結果**: 既存テスト（oauth-error-handler, authSlice, authHandlers等）が全てパスする
- **検証方法**: Vitestテスト結果で0 failuresを確認

### AC-009: 全OAuthプロバイダー対応

- **条件**: Google, GitHub, Discord 各プロバイダー
- **操作**: 各プロバイダーでOAuth認証を実行
- **期待結果**: 全プロバイダーで同一のPKCEフローが正常動作する
- **検証方法**: 少なくともGoogleで手動テスト、GitHub/Discordはユニットテストで検証

### AC-010: セキュリティ要件充足

- **条件**: 実装完了後
- **検証項目**:
  - トークンがRenderer Processに直接露出しない
  - HTTPサーバーが127.0.0.1のみでリッスン
  - code_verifierがcrypto.randomBytesで生成
  - stateパラメータが32バイト以上のランダム文字列
  - Refresh Tokenがsafe Storageで暗号化保存
- **検証方法**: セキュリティテストケース + コードレビュー

### AC-011: DEBT-SEC解消

- **条件**: 実装完了後
- **検証項目**:
  - DEBT-SEC-001: State parameter検証が実装されている
  - DEBT-SEC-002: PKCEが実装されている
  - DEBT-SEC-003: URLスキーム検証がHTTPサーバー方式で根本解決されている
- **検証方法**: 各DEBT IDの要件に対応するテストが存在しパスする
