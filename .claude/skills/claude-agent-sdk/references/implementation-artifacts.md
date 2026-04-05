# 実装成果物リファレンス

タスク別の成果物・実装ファイル・ドキュメントの一覧。

---

## AGENT-005 初期統合実装

### ドキュメント

| ドキュメント     | パス                                                                                  | 説明                   |
| ---------------- | ------------------------------------------------------------------------------------- | ---------------------- |
| 要件定義         | `docs/30-workflows/claude-code-integration/outputs/phase-1/`                          | 受け入れ基準、スコープ |
| 設計             | `docs/30-workflows/claude-code-integration/outputs/phase-2/`                          | アーキテクチャ、型定義 |
| テスト仕様       | `docs/30-workflows/claude-code-integration/outputs/phase-4/`                          | テストケース設計       |
| 実装サマリー     | `docs/30-workflows/claude-code-integration/outputs/phase-5/implementation-summary.md` | 実装概要               |
| 品質検証レポート | `docs/30-workflows/claude-code-integration/outputs/phase-9/`                          | セキュリティチェック   |
| 最終レビュー     | `docs/30-workflows/claude-code-integration/outputs/phase-10/`                         | リリースチェックリスト |
| 手動テスト結果   | `docs/30-workflows/claude-code-integration/outputs/phase-11/`                         | 手動検証結果           |
| 実装ガイド       | `docs/30-workflows/claude-code-integration/outputs/phase-12/implementation-guide.md`  | 概念・技術詳細         |

### 実装ファイル

| ファイル         | パス                                                       | 説明            |
| ---------------- | ---------------------------------------------------------- | --------------- |
| 型定義           | `packages/shared/src/types/agent-execution.ts`             | Agent実行関連型 |
| HooksFactory     | `apps/desktop/src/main/services/agent/HooksFactory.ts`     | SDK Hooks生成   |
| PermissionRules  | `apps/desktop/src/main/services/agent/PermissionRules.ts`  | 権限ルール定義  |
| AgentExecutor    | `apps/desktop/src/main/services/agent/AgentExecutor.ts`    | SDK query()統合 |
| ExecutionManager | `apps/desktop/src/main/services/agent/ExecutionManager.ts` | 複数実行管理    |
| IPCハンドラー    | `apps/desktop/src/main/ipc/agentHandlers.ts`               | IPC通信処理     |

---

## Slide Agent SDK統合（Direct SDK Pattern）

### ドキュメント

| ドキュメント      | パス                                                                                     | 説明                            |
| ----------------- | ---------------------------------------------------------------------------------------- | ------------------------------- |
| 実装ガイド        | `docs/30-workflows/slide-agent-sdk-integration/outputs/phase-12/implementation-guide.md` | Direct SDKパターン詳細          |
| CHANGELOGエントリ | `docs/30-workflows/slide-agent-sdk-integration/outputs/phase-12/changelog-entry.md`      | リリースノート                  |
| システム仕様      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`              | SDK統合システム仕様（更新済み） |

### 実装ファイル

| ファイル      | パス                                            | 説明                                 |
| ------------- | ----------------------------------------------- | ------------------------------------ |
| AgentClient   | `apps/desktop/src/main/slide/agent-client.ts`   | Direct SDK呼び出し、シングルトン     |
| SkillExecutor | `apps/desktop/src/main/slide/skill-executor.ts` | フェーズマッピング、進捗コールバック |
| 型定義        | `packages/shared/src/types/slide.ts`            | SkillPhase, SkillExecutionResult     |

---

## TASK-SKILL-RETRY-001 リトライ機構

### ドキュメント

| ドキュメント       | パス                                                                                             | 説明                          |
| ------------------ | ------------------------------------------------------------------------------------------------ | ----------------------------- |
| 実装ガイド（概念） | `docs/30-workflows/skillexecutor-retry-mechanism/outputs/phase-12/implementation-guide-part1.md` | 中学生レベル概念説明          |
| 実装ガイド（技術） | `docs/30-workflows/skillexecutor-retry-mechanism/outputs/phase-12/implementation-guide-part2.md` | 型定義・API・使用例           |
| システム仕様       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`             | RetryConfig, isRetryableError |
| エラー仕様         | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                            | リトライ戦略セクション        |

### 実装ファイル

| ファイル      | パス                                                                         | 説明                                        |
| ------------- | ---------------------------------------------------------------------------- | ------------------------------------------- |
| SkillExecutor | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                      | executeWithRetry, isRetryableError, backoff |
| テスト        | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts` | リトライ関連テスト                          |

---

## TASK-3-1-B Hooks Factory実装

### ドキュメント

| ドキュメント | パス                                                                          | 説明                            |
| ------------ | ----------------------------------------------------------------------------- | ------------------------------- |
| 実装ガイド   | `docs/30-workflows/task-3-1-b-hooks/outputs/phase-12/implementation-guide.md` | createHooks, エラーハンドリング |
| テスト仕様   | `apps/desktop/src/main/services/skill/__tests__/hooks.test.ts`                | PreToolUse/PostToolUseテスト    |
| エラーテスト | `apps/desktop/src/main/services/skill/__tests__/error.test.ts`                | categorizeError/isRetryable     |
| システム仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`   | 型定義、メソッドシグネチャ      |

### 実装ファイル

| ファイル      | パス                                                    | 説明                                      |
| ------------- | ------------------------------------------------------- | ----------------------------------------- |
| SkillExecutor | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | createHooks, categorizeError, isRetryable |

---

## TASK-FIX-16-1 SDK Auth Infrastructure

| 区分             | ファイル                                                                     |
| ---------------- | ---------------------------------------------------------------------------- |
| タスク仕様書     | `docs/30-workflows/sdk-auth-infrastructure/`                                 |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md`                                   |
| システム仕様     | `security-skill-execution.md`（AuthKeyService追加）                          |
| 実装ファイル     | `AuthKeyService.ts`, `authKeyHandlers.ts`, `authKeyApi.ts`                   |
| テスト           | `SkillExecutor.auth.test.ts`, `authKeyHandlers.test.ts`                      |

主要パターン:

- **Secure Storage**: `safeStorage.encryptString()` による API キー暗号化（Main Process 専用）
- **DI Pattern**: `AuthKeyService` を `SkillExecutor` にコンストラクタ経由で注入
- **Priority Resolution**: `options.apiKey` > `AuthKeyService.getKey()` > `process.env.ANTHROPIC_API_KEY`
- **IPC Channels**: `auth-key:set`, `auth-key:exists`, `auth-key:validate`, `auth-key:delete`

---

## TASK-3-1-E 権限永続化

### ドキュメント

| ドキュメント | パス                                                                            | 説明                           |
| ------------ | ------------------------------------------------------------------------------- | ------------------------------ |
| 実装ガイド   | `docs/guides/permission-store.md`                                               | PermissionStore API、IPC連携   |
| システム仕様 | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` | データスキーマ、ストレージパス |
| 設定UI仕様   | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`           | PermissionSettings UI          |

### 実装ファイル

| ファイル            | パス                                                                | 説明                               |
| ------------------- | ------------------------------------------------------------------- | ---------------------------------- |
| PermissionStore     | `apps/desktop/src/main/services/skill/PermissionStore.ts`           | 権限永続化ストア（electron-store） |
| permission-handlers | `apps/desktop/src/main/ipc/permission-handlers.ts`                  | IPC handlers（getAllowedTools等）  |
| PermissionSettings  | `apps/desktop/src/renderer/components/settings/PermissionSettings/` | 設定UI                             |

---

## TASK-IMP-permission-history-001 Permission History Tracking

| 区分                     | ファイル                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| タスク仕様書             | `docs/30-workflows/TASK-IMP-permission-history-001/`                                             |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`                                                       |
| システム仕様（状態管理） | `arch-state-management.md`（permissionHistorySlice）                                             |
| システム仕様（UI）       | `ui-ux-settings.md`（Permission History Panel）                                                  |
| システム仕様（履歴）     | `interfaces-agent-sdk-history.md`                                                                |
| 実装ファイル             | `permissionHistorySlice.ts`, `permissionHistory.ts`                                              |
| UIコンポーネント         | `PermissionHistoryPanel.tsx`, `PermissionHistoryItem.tsx`, `PermissionHistoryFilter.tsx`         |
| テスト                   | `permissionHistory.test.ts`, `permissionHistorySlice.test.ts`, `PermissionHistoryPanel.test.tsx` |

主要パターン:

- **Cross-Slice access**: `(get() as unknown as PermissionHistorySlice).addHistoryEntry()`
- **Security**: `safeArgsSnapshot()` による引数サニタイズ（最大 200 文字）
- **Virtual scroll**: `@tanstack/react-virtual` による 1000 件パフォーマンス対応

---

## TASK-9C スキル改善・自動修正機能

| 区分           | ファイル                                                                            |
| -------------- | ----------------------------------------------------------------------------------- |
| タスク仕様書   | `docs/30-workflows/TASK-9C-skill-improver/`                                         |
| 実装ガイド     | `outputs/phase-12/implementation-guide.md`                                          |
| システム仕様   | `interfaces-agent-sdk-skill.md`（IPC 5チャネル追加）、`arch-electron-services.md`   |
| 実装ファイル   | `SkillAnalyzer.ts`, `SkillImprover.ts`, `PromptOptimizer.ts`                        |
| ユーティリティ | `utils/fileUtils.ts`, `utils/sdkUtils.ts`                                           |
| テスト         | `SkillAnalyzer.test.ts`, `SkillImprover.test.ts`, `PromptOptimizer.test.ts`         |

主要パターン:

- **Graceful SDK fallback**: `tryAgentSdkWithFallback()` で SDK エラー時にフォールバック
- **DI Pattern**: `queryFn` パラメータで SDK 呼び出しを注入可能に
- **Backup strategy**: 改善前にバックアップを自動作成
- **Analysis categories**: static, ai, combined 分析モード

---

## UT-IMP-SAFETY-GOV-PUSH-REQUEST-PRODUCER-001 Approval Request Producer 接続

### ドキュメント

| ドキュメント    | パス                                                                                                               | 説明                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| タスク仕様書    | `docs/30-workflows/completed-tasks/unassigned-task/UT-IMP-SAFETY-GOV-PUSH-REQUEST-PRODUCER-001.md`                | Why/What/How/苦戦箇所                        |
| 設計書          | `docs/30-workflows/completed-tasks/unassigned-task/UT-IMP-SAFETY-GOV-PUSH-REQUEST-PRODUCER-001-design.md`         | 設計詳細                                     |
| Phase 12 成果物 | `docs/30-workflows/completed-tasks/approval-request-producer/outputs/phase-12/`                                   | 6ファイル（compliance-check / system-spec / changelog / unassigned-task-detection / skill-feedback / implementation-guide） |

### 実装ファイル

| ファイル              | パス                                                                                           | 説明                                             |
| --------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| HooksFactory          | `apps/desktop/src/main/services/agent/HooksFactory.ts`                                         | PreToolUse に pushApprovalRequest() producer 接続 |
| AgentExecutor         | `apps/desktop/src/main/services/agent/AgentExecutor.ts`                                        | sessionId 伝播                                   |
| ExecutionManager      | `apps/desktop/src/main/services/agent/ExecutionManager.ts`                                     | sessionId 管理                                   |
| agentHandlers         | `apps/desktop/src/main/ipc/agentHandlers.ts`                                                   | IPC handler 更新                                 |
| index                 | `apps/desktop/src/main/ipc/index.ts`                                                           | IPC 登録確認                                     |
| HooksFactory.producer | `apps/desktop/src/main/services/agent/__tests__/HooksFactory.producer.test.ts`                 | producer 発火テスト（新規）                      |

主要パターン:

- **Producer Pattern**: dangerous command 検出 → `pushApprovalRequest()` 発火 → `proceed: false`
- **Session Correlation**: `sessionId` を constructor で受け取り、`operationId` は呼び出し側で `uuidv4()` 生成
- **Non-blocking push**: IPC 送信と `proceed: false` は独立 — push 失敗でもブロックは維持

---

## TASK-SDK-SC-03 External API Support

### ドキュメント

| ドキュメント | パス | 説明 |
| --- | --- | --- |
| タスク仕様書 | `docs/30-workflows/skill-creator-agent-sdk-lane/` | External API Support 仕様 |

### 実装ファイル

| ファイル | パス | 説明 |
| --- | --- | --- |
| 型定義 | `packages/shared/src/types/skillCreatorExternalApi.ts` | ExternalApiConnectionConfig, ExternalApiAuthType, IExternalApiAdapter, ExternalApiTimeoutError, ExternalApiHttpError |
| IPCチャネル | `packages/shared/src/ipc/channels.ts` | SKILL_CREATOR_EXTERNAL_API_CHANNELS（configure-api / api-configured / api-test-result） |
| IPC Bridge | `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts` | configure-api ハンドラ、api-configured / api-test-result イベント送信 |
| SDK Session | `apps/desktop/src/main/services/runtime/SkillCreatorSdkSession.ts` | RequestExternalApiConfig custom tool, sanitizeExternalApiConfigForPrompt, 並行フロー管理 |
| HTTP Adapter | `apps/desktop/src/main/services/runtime/adapters/HttpExternalApiAdapter.ts` | IExternalApiAdapter 実装（fetch, タイムアウト30s, エラーハンドリング） |
| Preload API | `apps/desktop/src/preload/skill-creator-api.ts` | configureApi() Preload メソッド |
| Preload Session | `apps/desktop/src/preload/skill-creator-session-api.ts` | external-api-config-required イベント購読 |
| テスト（Session） | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorSdkSession.test.ts` | RequestExternalApiConfig tool_use、sendExternalApiConfig テスト |
| テスト（Bridge） | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorIpcBridge.test.ts` | configure-api IPC テスト |
| テスト（Adapter） | `apps/desktop/src/main/services/runtime/adapters/__tests__/HttpExternalApiAdapter.test.ts` | タイムアウト / HTTPエラー テスト |

主要パターン:

- **RequestExternalApiConfig Custom Tool**: SDK Session 内で外部API設定が必要になった際、IPC 経由で Renderer に UI 表示を要求し、ユーザー入力を待機する
- **並行フロー管理**: `pendingQuestionResolve` と `pendingExternalApiResolve` の相互排他
- **秘匿化**: `sanitizeExternalApiConfigForPrompt()` で credential を `***REDACTED***` に置換してからプロンプトに注入
- **IPC Channels**: `skill-creator:configure-api`, `skill-creator:api-configured`, `skill-creator:api-test-result`, `skill-creator:external-api-config-required`

---

## TASK-P0-01 Verify Engine（Layer 1-4）

### ドキュメント

| ドキュメント | パス | 説明 |
| --- | --- | --- |
| タスク仕様書 | `docs/30-workflows/step-09-par-task-p0-01-verify-execution-engine-layer12/` | verify engine Phase 1-13 仕様 |
| verify 契約仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md` | check ID 体系（19 件、L1-001〜L4-003） |
| 実装ガイド | `docs/30-workflows/step-09-par-task-p0-01-verify-execution-engine-layer12/outputs/phase-12/implementation-guide.md` | 概念説明 + API リファレンス |

### 実装ファイル

| ファイル | パス | 説明 |
| --- | --- | --- |
| 型定義 | `packages/shared/src/types/skillCreator.ts` | `RuntimeSkillCreatorVerifyCheck` 型 |
| Verify Engine | `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts` | Layer 1-4 verify チェック 19 件 |
| Facade 統合 | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | `verifySkill()` / `verifyAndImproveLoop()` |
| テスト | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` | 60 tests PASS |

主要パターン:

- **依存注入**: `RuntimeSkillCreatorFacade` に `verificationEngine?` を optional inject し、未注入時は空配列を返す graceful degradation
- **Severity Routing**: `verifyAndImproveLoop()` が `severity === "info"` を pass、`warning` / `error` を improve 対象として routing
- **IPC Channels**: `skill-creator:get-verify-detail`, `skill-creator:request-reverify` / `skill-creator:reverify-workflow`

---

## TASK-P0-05 execute() → SkillFileWriter persist 統合

### ドキュメント

| ドキュメント | パス | 説明 |
| --- | --- | --- |
| タスク仕様書 | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-03-seq-task-04-skill-output-integration/` | persist 統合仕様 |

### 実装ファイル

| ファイル | パス | 説明 |
| --- | --- | --- |
| Facade（Step 3.5-3.6） | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | `execute()` 内で `parseLlmResponseToContent()` → `SkillFileWriter.persist()` |
| OutputHandler（B経路） | `apps/desktop/src/main/services/runtime/SkillCreatorOutputHandler.ts` | SDK セッション完了時の別系統パイプライン（IPC Bridge 経由） |
| parseLlmResponseToContent | `apps/desktop/src/main/services/runtime/parseLlmResponseToContent.ts` | LLM 応答から SKILL.md コンテンツを抽出 |
| SkillFileWriter | `apps/desktop/src/main/services/skill/SkillFileWriter.ts` | `persist(skillName, content, options)` でファイルシステムへ書き込み |
| 型定義 | `packages/shared/src/types/skillCreator.ts` | `SkillExecuteResult` に `persistResult` / `persistError` フィールド追加 |
| 統合テスト | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.persist-integration.test.ts` | persist 統合テスト 44 件 |
| OutputHandler テスト | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorOutputHandler.test.ts` | OutputHandler 改善テスト |

主要パターン:

- **二重パイプライン設計**: A経路（Facade → `parseLlmResponseToContent` → `SkillFileWriter.persist()`）が正式経路。B経路（`SkillCreatorOutputHandler` → `SkillRegistry`）は IPC Bridge 経由の別系統
- **Setter Injection**: `SkillFileWriter` は `RuntimeSkillCreatorFacadeDeps.skillFileWriter?` で optional inject。未注入時は `console.warn` で警告し persist をスキップ（graceful degradation）
- **Governance Hooks**: `execute()` フェーズで `createGovernanceHooks("execute")` を生成し、`onPreToolUse` / `onPostToolUse` をスキル実行に接続
- **エラー分離**: `persistResult`（成功時の書き込み結果）と `persistError`（persist 中の例外メッセージ）をスキル実行結果とは独立して `SkillExecuteResult` に格納
