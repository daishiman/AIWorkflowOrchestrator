## 変更履歴

| Version | Date       | Changes                                                                                                                         |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 2.20.0  | 2026-04-06 | Phase-12 Session Resume反映: IPC 4層統合パターン（main/ipc → service/facade → preload → renderer/hook）によるcheckpoint-based session recovery（TASK-P0-08）をTask仕様ナビに追記。listSessions / getSessionDetail / resumeSessionWithResult / deleteSession / cleanupExpiredSessions 5チャネルをelectron-ipc.md参照として記録 |
| 2.19.0  | 2026-04-05 | TASK-P0-05 execute()→SkillFileWriter persist統合反映: 二重パイプライン設計（A経路: Facade→parseLlmResponseToContent→SkillFileWriter.persist / B経路: OutputHandler→SkillRegistry）、Setter Injection optional inject、persistResult/persistError型追加をTask仕様ナビ・implementation-artifacts.mdに追記 |
| 2.18.0  | 2026-04-04 | TASK-P0-01 verify 実行エンジン反映: SkillCreatorVerificationEngine Layer 1-4 verify チェック 19 件（L1-001〜L4-003）の実装完了。Task仕様ナビに Verify Engine 行追加、implementation-artifacts.md に成果物記録、electron-ipc.md に verify IPC チャネル追記 |
| 2.17.0  | 2026-04-04 | TASK-SDK-SC-04 Skill Output Integration反映: Skill Output Integration（output-ready / overwrite-approved / open-skill IPC 3チャネル）・SkillCreatorOutputHandler・SkillRegistry・SkillCreatorResultPanel・onOutputReady() Preload API を Task仕様ナビに追記 |
| 2.16.0  | 2026-04-03 | TASK-SDK-SC-03 External API Support反映: RequestExternalApiConfig custom toolパターン・並行フロー管理・sanitizeForPrompt秘匿化パターンを electron-ipc.md に追加。Task仕様ナビ・implementation-artifacts.md に External API IPC 成果物を追記 |
| 2.15.0  | 2026-04-02 | UT-IMP-SAFETY-GOV-PUSH-REQUEST-PRODUCER-001反映: Approval Request Producerパターン追加（hooks-system.md）、成果物記録追加（implementation-artifacts.md）、Task仕様ナビ追記 |
| 2.14.0  | 2026-03-31 | TASK-P0-09ガバナンス実装反映: Governance Hooks Factoryパターン（hooks-system.md）、Phase-Based Policy表（permission-control.md）、resolvePathSafelyパターン（security-sandboxing.md）、Task仕様ナビ追記 |
| 2.13.0  | 2026-02-12 | Progressive Disclosure最適化: 成果物テーブルをreferences/implementation-artifacts.mdに分離（513→380行）、旧API値修正（permissionMode/stream()）、query-api.mdバージョン情報更新 |
| 2.12.0  | 2026-02-12 | TASK-9B-I教訓反映: query-api.md にTypeScriptモジュール解決パターン追加、permission-control.md の PermissionMode を SDK@0.2.30 実型に更新 |
| 2.11.0  | 2026-02-12 | TASK-9B-I-SDK-FORMAL-INTEGRATION完了（`as any` 除去、SDK実型@0.2.30に基づく型安全な callSDKQuery 実装、apiKey→env.ANTHROPIC_API_KEY、signal→abortController、conversation直接利用、278テスト全PASS） |
| 2.10.0  | 2026-02-08 | TASK-FIX-16-1 SDK Auth Infrastructure追加（AuthKeyService統合パターン、認証キー解決優先順位、IPC 4チャンネル追加、query-api.md/error-handling.md/electron-ipc.md更新） |
| 2.9.0   | 2026-02-03 | TASK-9Cスキル改善・自動修正機能成果物追加（SkillAnalyzer, SkillImprover, PromptOptimizer、83テスト、Graceful fallbackパターン）                                 |
| 2.8.0   | 2026-02-01 | TASK-IMP-permission-history-001 Permission History Tracking成果物追加（Cross-Slice access, safeArgsSnapshot, Virtual scroll）   |
| 2.7.0   | 2026-01-31 | retry-patterns.mdリファレンス新規作成、error-handling.mdリトライセクション最適化（outdated値修正、cross-reference追加）         |
| 2.6.0   | 2026-01-31 | TASK-SKILL-RETRY-001リトライ機構パターン追加（RetryConfig, isRetryableError, Exponential Backoff with Jitter）                  |
| 2.5.0   | 2026-01-26 | TASK-3-1-E権限永続化パターン追加（PermissionStore API、rememberChoice連携、データスキーマ）                                     |
| 2.4.0   | 2026-01-25 | TASK-3-1-B Hooks実装パターン追加（createHooks, categorizeError, isRetryable, セキュリティチェック関数）                         |
| 2.3.0   | 2026-01-17 | Direct SDK Pattern追加、Slide SDK統合実装参照追加、パターン選択ガイド追加                                                       |
| 2.2.0   | 2026-01-12 | AGENT-005実装成果物・実装ファイル参照追加、パス修正                                                                             |
| 2.1.0   | 2026-01-08 | 関連ドキュメントセクション追加、aiworkflow連携                                                                                  |
| 2.0.0   | 2026-01-08 | 責務ベースに再構成、最新情報取得フロー追加                                                                                      |
| 1.0.0   | 2026-01-08 | 初期バージョン作成                                                                                                              |
