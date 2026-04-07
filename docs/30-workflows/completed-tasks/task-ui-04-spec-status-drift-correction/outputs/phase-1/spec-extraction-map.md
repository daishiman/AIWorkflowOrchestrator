# Phase 1 成果物: 仕様書ステータス抽出マップ

## メタ情報

| 項目     | 内容         |
| -------- | ------------ |
| 作成日   | 2026-04-07   |
| Phase    | 1 - 要件定義 |
| タスクID | TASK-UI-04   |

## 対象ディレクトリ

`docs/30-workflows/completed-tasks/` 配下の P0 タスク群

## P0 タスク一覧: artifacts.json 現行ステータス

| タスクID   | ディレクトリ（completed-tasks/配下）                            | artifacts.json status | index.md ステータス行                                  |
| ---------- | --------------------------------------------------------------- | --------------------- | ------------------------------------------------------ |
| TASK-P0-01 | step-09-par-task-p0-01-verify-execution-engine-layer12          | phase_12_completed    | phase_12_completed                                     |
| TASK-P0-02 | step-10-seq-task-p0-02-verify-improve-reverify-closed-loop      | in_progress           | spec_created                                           |
| TASK-P0-04 | step-10-seq-task-p0-04-manifest-loader-default-activation       | in_progress           | spec_created                                           |
| TASK-P0-05 | step-09-par-task-p0-05-execute-skill-file-writer-integration    | in_progress           | 実行中                                                 |
| TASK-P0-06 | step-09-par-task-p0-06-conversational-interview-ui              | in_progress           | spec_created                                           |
| TASK-P0-07 | step-10-seq-task-p0-07-hardcoded-agent-names-dynamic-resolution | completed             | spec_created（Phase 1-12 complete / Phase 13 blocked） |
| TASK-P0-08 | step-10-seq-task-p0-08-session-resume-renderer-integration      | in_progress           | spec_created                                           |
| TASK-P0-09 | step-10-seq-task-p0-09-claude-sdk-permission-hooks-governance   | completed             | spec_created                                           |

## P0 タスクの phases ステータス詳細

### TASK-P0-01

- phases 1-12: all completed
- phase 13: pending
- 結論: 実装・ドキュメント完了。PR未作成のみ

### TASK-P0-08

- phases 1-10: all completed
- phase 11: in_progress
- phase 12: in_progress
- phase 13: pending
- 結論: コード実装完了。手動テスト・ドキュメントが形式上未完了

## 関連コードアンカー確認結果

| タスクID   | 確認したシグネチャ/ファイル                                                                                | 存在確認 |
| ---------- | ---------------------------------------------------------------------------------------------------------- | -------- |
| TASK-P0-01 | `SkillCreatorVerificationEngine.ts`                                                                        | ✓ 存在   |
| TASK-P0-02 | `SkillCreatorWorkflowEngine.ts#recordVerifyPass`, `#requestReverify`                                       | ✓ 存在   |
| TASK-P0-04 | `RuntimeSkillCreatorFacade.ts#hasDynamicResourcePipeline`                                                  | ✓ 存在   |
| TASK-P0-05 | `SkillFileWriter` integration tests, `SkillCreatorOutputHandler.ts`                                        | ✓ 存在   |
| TASK-P0-06 | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`                                   | ✓ 存在   |
| TASK-P0-07 | artifacts.json 既に completed                                                                              | ✓ 確認済 |
| TASK-P0-08 | `creatorHandlers.ts#listSessions`, `#resumeSessionWithResult`                                              | ✓ 存在   |
| TASK-P0-09 | `apps/desktop/src/main/services/runtime/governance/` (index.ts, AuditSink, HooksFactory, PermissionPolicy) | ✓ 存在   |

## skill-creator-agent-sdk-lane/index.md 現行リンク状態

P0 タスク群のリンクが旧 step-10/09 ディレクトリを参照している（completed-tasks/ 移動後の更新が未実施）。

## executor-guide.md 現行状態

P0 タスク群のステータス情報が未反映。
