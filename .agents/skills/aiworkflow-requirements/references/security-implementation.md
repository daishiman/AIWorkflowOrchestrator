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
| timeout時      | `waitForCallback()` は timeout エラーを返し、サーバー停止はしない |
| 停止責務       | 呼び出し側が `stop()` を明示実行（冪等） |
| コールバック後 | callback受信で待機解除。必要に応じて呼び出し側が `stop()` 実行 |

**実装ファイル**: `apps/desktop/src/main/auth/authCallbackServer.ts`

**詳細**:
- `docs/30-workflows/completed-tasks/auth-callback-urlscheme/outputs/phase-12/implementation-guide.md`
- `docs/30-workflows/completed-tasks/TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001/outputs/phase-12/implementation-guide.md`

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

### TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001: auth callback server の timeout/stop 責務分離（2026-02-28）

| 項目 | 内容 |
| --- | --- |
| 課題1 | `waitForCallback()` timeout 内で `stop()` を実行すると、待機失敗と停止処理が結合して終了順序が不安定になる |
| 再発条件1 | 待機APIにライフサイクル操作（stop/close）を同居させる場合 |
| 対処1 | timeout はエラー返却のみに限定し、停止は呼び出し側 `stop()` の責務へ分離 |
| 標準ルール1 | timeout系APIは副作用を持たせず、`finally` で明示停止する |
| 課題2 | 停止済みサーバーへの再停止で例外経路が混ざるとクリーンアップが揺れる |
| 再発条件2 | `stop()` が `server.listening` 状態を判定しない場合 |
| 対処2 | `!server || !server.listening` で早期returnし、`server.close` エラーは握りつぶして冪等停止に統一 |
| 標準ルール2 | 停止APIは idempotent を第一要件にし、best-effort 終了を明文化する |

**同種課題の簡潔解決手順（4ステップ）**:
1. timeout APIから stop/close などの副作用を分離する。  
2. 停止APIに「未起動」「停止済み」の二重ガードを入れる。  
3. timeout テストに `finally` 相当の `await stop()` を固定する。  
4. `task-workflow.md` と `lessons-learned.md` に同一内容を同一ターンで同期する。  

**参照**:
- `apps/desktop/src/main/auth/authCallbackServer.ts`
- `apps/desktop/src/main/auth/__tests__/authCallbackServer.test.ts`
- `docs/30-workflows/completed-tasks/TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001/outputs/phase-12/spec-update-summary.md`
- `docs/30-workflows/completed-tasks/unassigned-task/task-imp-auth-callback-lifecycle-contract-guard-001.md`（派生未タスク: 契約ガード）

---

## Tool Risk Configuration（UT-06-001: 2026-03-16 実装完了）

### 概要

ツール操作のリスクレベルに応じた PermissionDialog の表示設定を定義する定数。

### 実装ファイル

- `packages/shared/src/constants/security.ts`
- エクスポート: `@repo/shared` から named export（`RiskLevel`・`ToolRiskConfigEntry`・`TOOL_RISK_CONFIG`）

### 型定義

| 型名                 | 種別      | 定義                                     |
| -------------------- | --------- | ---------------------------------------- |
| `RiskLevel`          | type      | `"low" \| "medium" \| "high"`           |
| `ToolRiskConfigEntry`| interface | dialogWidth, headerColorToken, allowPermanent, allowTime24h, allowTime7d |
| `TOOL_RISK_CONFIG`   | const     | `Record<RiskLevel, ToolRiskConfigEntry>` |

### セキュリティ不変条件

- `TOOL_RISK_CONFIG.high.allowPermanent === false`（恒久許可禁止）
- `TOOL_RISK_CONFIG.high.allowTime24h === false`（24時間許可禁止）
- `TOOL_RISK_CONFIG.high.allowTime7d === false`（7日間許可禁止）

### 関連未タスク

- UT-06-001-CSS-RISK-VARS: CSS変数 `--risk-low` / `--risk-medium` / `--risk-high` の定義（[指示書](../../../docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ut-06-001-css-risk-variables-definition.md)）

### 後続タスク

- UT-06-004: PermissionDialog UI 実装（本定数を参照）
- TASK-SKILL-LIFECYCLE-08: スキル公開ワークフロー

---

## 関連ドキュメント

- [デプロイメント](./deployment.md)
- [エラーハンドリング仕様](./error-handling.md)
- [コアインターフェース仕様](./interfaces-core.md)
