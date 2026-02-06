# セキュリティ実装仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

本プロジェクトのセキュリティ実装に関する包括的なガイドライン。入力バリデーション、API保護、Electronセキュリティ、依存関係管理を含む。

---

## ドキュメント構成

| ドキュメント | ファイル | 説明 |
|-------------|----------|------|
| 入力バリデーション・ファイル変換 | [security-input-validation.md](./security-input-validation.md) | バリデーション原則、SQL/XSS対策、Zodスキーマ、ファイル変換セキュリティ |
| API・Electronセキュリティ | [security-api-electron.md](./security-api-electron.md) | 認証・認可、レート制限、CORS、Electron設定、IPC通信 |
| スキル実行セキュリティ | [security-skill-execution.md](./security-skill-execution.md) | 危険コマンドパターン、保護パス、許可ツールホワイトリスト |

---

## セキュリティ原則

### 多層防御（Defense in Depth）

| レイヤー | 説明 |
| -------- | ---- |
| フロントエンド | クライアントサイドバリデーション（補助的） |
| API境界 | 入力検証、レート制限、認証 |
| ビジネスロジック | 認可チェック、オーナーシップ検証 |
| データアクセス | パラメータ化クエリ、最小権限原則 |

### セキュリティ対策の優先度

| 優先度 | 対策カテゴリ | 例 |
| ------ | ------------ | -- |
| 高 | インジェクション対策 | SQLインジェクション、XSS |
| 高 | 認証・認可 | セッション管理、RBAC |
| 中 | 依存関係管理 | 脆弱性監査、更新 |
| 中 | Electron固有 | CSP、IPC検証 |
| 低 | DoS対策 | レート制限、リソース制御 |

---

## PKCE / State parameter 実装記録

### TASK-AUTH-CALLBACK-001: OAuth認証コールバックPKCE移行（2026-02-06完了）

Authorization Code Flow + PKCE方式を実装し、DEBT-SEC-001/002/003を解消。

#### PKCE実装（RFC 7636準拠）

| 項目                  | 実装                                                   |
| --------------------- | ------------------------------------------------------ |
| code_verifierの生成   | `crypto.randomBytes()` → Base64URL（64文字デフォルト） |
| code_challengeの生成  | `SHA-256(code_verifier)` → Base64URL                   |
| code_challenge_method | `S256`（常にSHA-256）                                  |
| 文字セット            | `[A-Z] [a-z] [0-9] - . _ ~`（RFC 7636 Appendix A）    |

**実装ファイル**: `apps/desktop/src/main/auth/pkce.ts`

#### State parameter（CSRF対策）

| 項目           | 実装                                 |
| -------------- | ------------------------------------ |
| 生成           | `crypto.randomBytes(32)` → Base64URL |
| 検証           | 厳密一致（`===`）                    |
| 有効期限       | 5分（STATE_TTL_MS = 300000）         |
| クリーンアップ | 使用後即削除 + 期限切れ自動削除      |

**実装ファイル**: `apps/desktop/src/main/auth/authFlowOrchestrator.ts`

#### ローカルHTTPサーバー

| 項目           | 実装                                   |
| -------------- | -------------------------------------- |
| バインドアドレス | `127.0.0.1`（ローカルホストのみ）     |
| ポート         | 動的割り当て（OS自動）                 |
| タイムアウト   | 5分（TIMEOUT_MS = 300000）             |
| コールバック後 | 即座にサーバー停止                     |

**実装ファイル**: `apps/desktop/src/main/auth/authCallbackServer.ts`

**詳細**: `docs/30-workflows/auth-callback-urlscheme/outputs/phase-12/implementation-guide.md`

---

## 実装時の苦戦した箇所・知見

### TASK-AUTH-CALLBACK-001: カスタムプロトコルURL解析の落とし穴（2026-02-06）

| 項目   | 内容                                                                    |
| ------ | ----------------------------------------------------------------------- |
| 課題   | `new URL("aiworkflow://auth/callback")` がauthorityコンポーネントとして解析される |
| 影響   | `url.pathname` が `/callback` のみ（`/auth/callback` ではない）        |
| 根本原因 | RFC 3986のauthority規則: `scheme://authority/path` の構造に従い `auth` がhostname扱い |
| 解決策 | `extractProtocolPath()` で文字列操作（`url.slice(prefix.length)`）を使用 |
| 教訓   | カスタムプロトコルでは `new URL()` を避け、プレフィックス除去 + クエリ分離の手動パースを行う |

**適用範囲**: Electronアプリのカスタムプロトコルハンドラー全般に適用可能。`electron://`, `myapp://` 等のスキームすべてに同じ問題が発生する。

**参照**: `apps/desktop/src/main/protocol/customProtocol.ts` の `extractProtocolPath()` 関数

---

## 関連ドキュメント

- [デプロイメント](./deployment.md)
- [エラーハンドリング仕様](./error-handling.md)
- [コアインターフェース仕様](./interfaces-core.md)
