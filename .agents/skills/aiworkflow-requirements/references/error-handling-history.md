# エラーハンドリング仕様 / history bundle

> 親仕様書: [error-handling.md](error-handling.md)
> 役割: history bundle

## 関連ドキュメント

- [コアインターフェース仕様](./06-core-interfaces.md)
- [REST API 設計原則](./08-api-design.md)
- [非機能要件](./02-non-functional-requirements.md)
- [セキュリティガイドライン](./17-security-guidelines.md)

---

## 変更履歴

| 日付       | バージョン | 変更内容                                                             |
| ---------- | ---------- | -------------------------------------------------------------------- |
| 2026-03-11 | v1.11.1    | TASK-UI-04C follow-up: `Workspace preview エラー分類` に関連未タスク `UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001` を追加し、transport / parse / crash / no-match の共通ガード化導線を接続 |
| 2026-03-11 | v1.11.0    | TASK-UI-04C-WORKSPACE-PREVIEW: `Workspace preview エラー分類` を追加し、timeout / read failure / parse failure / renderer crash / no-match の retryable と UI 応答を整理 |
| 2026-03-08 | v1.10.0    | TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001: Auth/Profile/Avatar fallback エラーコードテーブルに `PROFILE_ERROR_CODES.NOT_CONFIGURED` / `AVATAR_ERROR_CODES.NOT_CONFIGURED` の詳細を追記（既存テーブル拡充） |
| 2026-03-07 | v1.9.0     | 09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001: Renderer 境界防御パターン（Preload Response Shape Guard）セクション追加（4層防御レイヤー、non-null assertion 禁止、P48参照） |
| 2026-03-06 | v1.8.0     | TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001: `IPCResponse<T>` / `IPCError` / `AuthModeStatus` ベースの auth-mode error envelope を追加し、`message` / `errorCode` / `guidance` / `lastCheckedAt` の公開契約を明文化 |
| 2026-02-07 | v1.7.0     | TASK-FIX-4-2: 外部ストレージ取得フォールバックパターンセクション追加（フォールバックマトリクス・実装パターン・セキュリティ考慮事項） |
| 2026-02-06 | v1.6.0     | TASK-AUTH-SESSION-REFRESH-001: TokenRefreshSchedulerリトライ戦略セクション追加（Exponential Backoff with Jitter、リトライ対象/非対象エラー分類、Supabase SDK競合防止） |
| 2026-02-05 | v1.5.0     | TASK-FIX-GOOGLE-LOGIN-001: OAuthエラーコードマッピングセクション追加（9エラーコード、parseOAuthError、mapOAuthErrorToMessage関数仕様） |
| 2026-02-04 | v1.4.0     | AUTH-UI-001: 認証フォールバックパターン（user_profilesテーブル不在時）追加 |
| 2026-02-02 | v1.3.0     | TASK-8A: SkillExecutor実行エラーコード6種の正式仕様追加（EXECUTION_FAILED, MAX_CONCURRENT_EXCEEDED, INVALID_SKILL_METADATA, PERMISSION_DENIED, TIMEOUT, ABORT） |
| 2026-01-31 | v1.2.0     | TASK-SKILL-RETRY-001: SkillExecutorリトライ戦略セクション追加        |
| 2026-01-26 | v1.1.0     | 仕様ガイドライン準拠: コード例を表形式・文章に変換                   |

