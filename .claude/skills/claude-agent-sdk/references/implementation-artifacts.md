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
