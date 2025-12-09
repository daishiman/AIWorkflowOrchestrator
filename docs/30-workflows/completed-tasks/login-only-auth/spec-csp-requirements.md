# CSP設定要件定義書

## 概要

| 項目           | 内容                    |
| -------------- | ----------------------- |
| ドキュメントID | SEC-CSP                 |
| 対象タスク     | T-00-1: CSP設定要件定義 |
| 作成日         | 2025-12-09              |
| ステータス     | 完了                    |

## 目的

Content Security Policy (CSP) の設定要件を明文化し、Electronアプリケーションにおけるクロスサイトスクリプティング（XSS）攻撃リスクを最小化する。

## 現状分析

### 既存実装の確認

現在の `apps/desktop/src/main/index.ts` では以下のCSP設定が存在する：

```typescript
const getCSPPolicy = (isDev: boolean): string => {
  if (isDev) {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https: ws: wss:", // 問題: 全HTTPSを許可
      "object-src 'none'",
      "frame-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");
  }
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https:", // 問題: 全HTTPSを許可
    "object-src 'none'",
    "frame-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
};
```

### 問題点

| ID      | 問題                                   | リスク                                 |
| ------- | -------------------------------------- | -------------------------------------- |
| CSP-P01 | connect-srcが全HTTPSを許可             | 任意の外部サーバーへのデータ送信が可能 |
| CSP-P02 | Supabase URLが明示的に指定されていない | 許可すべきAPIが不明確                  |
| CSP-P03 | frame-ancestorsディレクティブがない    | クリックジャッキング対策が不完全       |
| CSP-P04 | upgrade-insecure-requestsがない        | HTTP→HTTPS自動アップグレードが未設定   |

## 機能要件

### 必須要件

| ID         | 要件                                       | 優先度 | 根拠                                    |
| ---------- | ------------------------------------------ | ------ | --------------------------------------- |
| SEC-CSP-01 | script-src 'self' のみ許可（本番環境）     | 必須   | インラインスクリプト、eval禁止でXSS防止 |
| SEC-CSP-02 | style-src 'self' 'unsafe-inline' 許可      | 必須   | Tailwind CSS/shadcn/uiとの互換性確保    |
| SEC-CSP-03 | connect-src でSupabase URLのみ明示的に許可 | 必須   | 不要な外部通信を禁止                    |
| SEC-CSP-04 | frame-ancestors 'none' 設定                | 必須   | クリックジャッキング防止                |
| SEC-CSP-05 | 開発環境用CSP設定の分離                    | 必須   | HMR/DevToolsの動作確保                  |

### 推奨要件

| ID         | 要件                               | 優先度 | 根拠                              |
| ---------- | ---------------------------------- | ------ | --------------------------------- |
| SEC-CSP-06 | upgrade-insecure-requests の追加   | 推奨   | HTTP混在コンテンツの自動HTTPS化   |
| SEC-CSP-07 | report-uri または report-to の設定 | 推奨   | CSP違反のモニタリング（将来対応） |

## CSPディレクティブ仕様

### 本番環境 (Production)

| ディレクティブ            | 値                                            | 説明                                          |
| ------------------------- | --------------------------------------------- | --------------------------------------------- |
| default-src               | 'self'                                        | デフォルトで同一オリジンのみ許可              |
| script-src                | 'self'                                        | 同一オリジンのスクリプトのみ（eval禁止）      |
| style-src                 | 'self' 'unsafe-inline'                        | インラインスタイル許可（Tailwind CSS用）      |
| img-src                   | 'self' data: https:                           | 自己、data URI、HTTPS画像を許可               |
| font-src                  | 'self'                                        | 同一オリジンのフォントのみ                    |
| connect-src               | 'self' ${SUPABASE_URL} https://\*.supabase.co | Supabase APIへの接続のみ許可                  |
| object-src                | 'none'                                        | プラグイン（Flash等）を完全禁止               |
| frame-src                 | 'none'                                        | iframe埋め込みを禁止                          |
| frame-ancestors           | 'none'                                        | 他サイトからのiframe埋め込みを禁止            |
| base-uri                  | 'self'                                        | baseタグの値を同一オリジンに制限              |
| form-action               | 'self'                                        | フォーム送信先を同一オリジンに制限            |
| upgrade-insecure-requests | （値なし）                                    | HTTPリクエストを自動的にHTTPSにアップグレード |

### 開発環境 (Development)

| ディレクティブ  | 値                                   | 説明                                     |
| --------------- | ------------------------------------ | ---------------------------------------- |
| default-src     | 'self'                               | デフォルトで同一オリジンのみ許可         |
| script-src      | 'self' 'unsafe-inline' 'unsafe-eval' | HMR、DevTools用にinline/eval許可         |
| style-src       | 'self' 'unsafe-inline'               | インラインスタイル許可（Tailwind CSS用） |
| img-src         | 'self' data: https:                  | 自己、data URI、HTTPS画像を許可          |
| font-src        | 'self'                               | 同一オリジンのフォントのみ               |
| connect-src     | 'self' https: ws: wss:               | HMR用WebSocket、全HTTPS許可              |
| object-src      | 'none'                               | プラグイン（Flash等）を完全禁止          |
| frame-src       | 'none'                               | iframe埋め込みを禁止                     |
| frame-ancestors | 'none'                               | 他サイトからのiframe埋め込みを禁止       |
| base-uri        | 'self'                               | baseタグの値を同一オリジンに制限         |
| form-action     | 'self'                               | フォーム送信先を同一オリジンに制限       |

## 環境変数要件

| 環境変数名   | 必須/任意 | 用途                              | デフォルト値 |
| ------------ | --------- | --------------------------------- | ------------ |
| SUPABASE_URL | 必須      | connect-srcに追加するSupabase URL | なし         |

## 設計上の考慮事項

### Tailwind CSS互換性

- `style-src 'unsafe-inline'` は Tailwind CSS および shadcn/ui のインラインスタイル適用に必要
- これを削除すると、動的スタイル適用が機能しなくなる
- 将来的には CSP nonce または hash ベースの実装を検討

### 画像ソースの許可

- `img-src 'self' data: https:` の `https:` は以下の用途：
  - ユーザーアバター画像（Supabase Storage、OAuth プロバイダー提供）
  - 外部サービスのアイコン
- セキュリティと機能のバランスとして許容

### 開発環境の緩和

- 開発環境では Vite HMR のために `'unsafe-eval'` と WebSocket が必要
- これは開発時のみの設定であり、本番には影響しない

## テスト要件

### 機能テスト

| テストID | シナリオ                               | 期待結果                       |
| -------- | -------------------------------------- | ------------------------------ |
| CSP-T01  | 本番環境でCSP生成                      | unsafe-eval が含まれない       |
| CSP-T02  | 開発環境でCSP生成                      | unsafe-eval が含まれる         |
| CSP-T03  | Supabase URL が connect-src に含まれる | URL が正しく含まれる           |
| CSP-T04  | frame-ancestors が 'none'              | ディレクティブが設定されている |
| CSP-T05  | 環境変数SUPABASE_URLが未設定時         | 適切にフォールバック           |

### 統合テスト

| テストID | シナリオ                              | 期待結果                          |
| -------- | ------------------------------------- | --------------------------------- |
| CSP-I01  | アプリ起動時にCSPヘッダーが設定される | レスポンスヘッダーにCSPが含まれる |
| CSP-I02  | Supabase認証が正常に動作する          | 認証フローが完了する              |
| CSP-I03  | 外部スクリプトの実行がブロックされる  | コンソールにCSP違反エラーが出る   |

## 完了条件

- [x] CSPディレクティブ一覧が定義されている
- [x] 開発環境と本番環境の差分が明記されている
- [x] Supabase接続に必要なconnect-src設定が定義されている
- [x] frame-ancestors 'none' が要件に含まれている
- [x] テスト要件が定義されている

## 関連ドキュメント

- `docs/00-requirements/17-security-guidelines.md`
- `apps/desktop/src/main/index.ts`
- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Electron Security: Content Security Policy](https://www.electronjs.org/docs/latest/tutorial/security#7-define-a-content-security-policy)
