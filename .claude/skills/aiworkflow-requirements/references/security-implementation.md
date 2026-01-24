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

## 関連ドキュメント

- [デプロイメント](./deployment.md)
- [エラーハンドリング仕様](./error-handling.md)
- [コアインターフェース仕様](./interfaces-core.md)
