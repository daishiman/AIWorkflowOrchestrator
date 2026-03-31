# Documentation Changelog

## 2026-03-31

### current（本タスク TASK-P0-09 による変更）

#### 型定義

| ファイル                                    | 変更内容                                                                                                                                                                                                             |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts` | governance 関連 8 型を追加（SkillCreatorGovernancePhase, SdkPermissionMode, SkillCreatorSdkPolicy, CanUseToolResult, GovernanceAuditEventKind, GovernanceAuditEvent, GovernanceSessionSummary, GovernanceUiPayload） |
| `packages/shared/src/types/index.ts`        | 8 型の re-export を追加                                                                                                                                                                                              |

#### 新規実装モジュール

| ファイル                                                                 | 変更内容                                                                   |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/SkillCreatorGovernancePolicy.ts` | 新規作成。PHASE_POLICIES 定数、getPolicyForPhase、createCanUseToolCallback |
| `apps/desktop/src/main/services/runtime/GovernanceAuditSink.ts`          | 新規作成。GovernanceAuditSink クラス、createAuditEvent ヘルパー            |
| `apps/desktop/src/main/services/runtime/GovernanceHooksFactory.ts`       | 新規作成。createGovernanceHooks、GovernanceHooks interface                 |

#### 既存モジュール変更

| ファイル                                                              | 変更内容                                                                                                                                                                              |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | governance integration — auditSink インスタンス保持、execute 時の SDK governance options 注入、getGovernanceUiPayload / getGovernanceAuditEvents / resolveSkillTargetDir メソッド追加 |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | `skill-creator:get-governance` IPC ハンドラ追加                                                                                                                                       |
| `apps/desktop/src/preload/skill-creator-api.ts`                       | `getGovernancePayload` API メソッド追加                                                                                                                                               |
| `apps/desktop/src/preload/channels.ts`                                | `SKILL_CREATOR_GET_GOVERNANCE` チャネル定数追加                                                                                                                                       |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts`               | governance 実行オプション（permissionMode / hooks / permissions）を query() へ伝播                                                                                                    |

#### テストファイル

| ファイル                                                                                | 変更内容                                                                                                                    |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorGovernancePolicy.test.ts` | 新規作成。22 テストケース（phase policy 取得、canUseTool 判定、path-safe 制御、必須 path 検証）                             |
| `apps/desktop/src/main/services/runtime/__tests__/GovernanceAuditSink.test.ts`          | 新規作成。11 テストケース（record、phase/session filter 付き getRecentDenials、buildSessionSummary、buildUiPayload、clear） |
| `apps/desktop/src/main/services/runtime/__tests__/GovernanceHooksFactory.test.ts`       | 新規作成。13 テストケース（hooks 生成、SessionStart/End、PreToolUse proceed/deny、PostToolUse）                             |
| `apps/desktop/src/main/services/runtime/__tests__/GovernanceEdgeCases.test.ts`          | 新規作成。19 テストケース（未知ツール、空パス、null byte、パストラバーサル、auditSink 共有、複数 phase 切替）               |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`    | allowedTools 期待値を governance policy に合わせて更新                                                                      |
| `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.sdk-types.test.ts`        | governance options が query() へ渡ることを検証するケース追加                                                                |
| `apps/desktop/src/main/services/runtime/__tests__/GovernanceEdgeCases.test.ts`          | path traversal / 空 path / skillTargetDir 未指定の current policy へ期待値更新                                              |
| `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorGovernancePolicy.test.ts` | targetDir 必須・file_path 必須の current facts へ期待値更新                                                                 |

#### system spec / workflow sync

| ファイル                                                                                       | 変更内容                                                                   |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`                      | governance IPC 行と型定義を追記                                            |
| `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                     | governance payload の public contract と責務境界を追記                     |
| `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md`    | RuntimeSkillCreatorFacade governance 拡張を追記                            |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                 | TASK-P0-09 完了記録を追加                                                  |
| `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                                  | 追加 spec を検索可能にするため再生成                                       |
| `docs/30-workflows/unassigned-task/UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001.md` | execute 以外の phase coverage と renderer UI を follow-up として formalize |

#### 実検証

- `pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts src/main/services/runtime/__tests__/SkillCreatorGovernancePolicy.test.ts src/main/services/runtime/__tests__/GovernanceHooksFactory.test.ts src/main/services/runtime/__tests__/GovernanceAuditSink.test.ts src/main/services/runtime/__tests__/GovernanceEdgeCases.test.ts`
  - PASS（5 files / 95 tests）

### baseline

baseline 変更なし。本タスクは新規 governance 機能の追加であり、既存仕様の変更を伴わない。
