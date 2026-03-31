# TASK-P0-07: hardcoded-agent-names-dynamic-resolution

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| 機能名     | hardcoded-agent-names-dynamic-resolution |
| タスクID   | TASK-P0-07                               |
| 作成日     | 2026-03-29                               |
| 完了日     | 2026-03-30                               |
| ステータス | Phase 1-12 完了 / Phase 13 pending       |
| 総Phase数  | 13                                       |

## 概要

`RuntimeSkillCreatorFacade` の `plan()` / `improve()` にハードコードされていたエージェント名（`AGENT_NAMES` 定数等）を `AgentNameResolver` / `ManifestLoader` 経由の動的解決に置き換えた。これにより、異なるスキル定義が独自のエージェント構成を持てるようになり、skill-creator の汎用性が向上した。

## 実装内容

- `AgentNameResolver` クラス新規追加（manifest / PhaseResourceRequest 双方からエージェント名を解決）
- `ManifestLoader.extractAgentConfig()` メソッド追加
- `RuntimeSkillCreatorFacade.plan()` / `improve()` を動的解決に対応
- `planPromptConstants.AGENT_NAMES` / `improvePromptConstants.AGENT_NAME` 定数削除
- テストフィクスチャの phase ID を正規名称（`requirements-gathering` / `plan` / `improve`）に統一

## 成果物

| Phase    | 成果物                                                                              |
| -------- | ----------------------------------------------------------------------------------- |
| 実装     | `apps/desktop/src/main/services/runtime/AgentNameResolver.ts`                       |
| 実装     | `apps/desktop/src/main/services/runtime/ManifestLoader.ts` (extractAgentConfig追加) |
| 実装     | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`               |
| Phase 12 | [implementation-guide.md](outputs/phase-12/implementation-guide.md)                 |
| Phase 12 | [documentation-changelog.md](outputs/phase-12/documentation-changelog.md)           |
| Phase 12 | [system-spec-update-summary.md](outputs/phase-12/system-spec-update-summary.md)     |
| Phase 12 | [skill-feedback-report.md](outputs/phase-12/skill-feedback-report.md)               |
| Phase 12 | [unassigned-task-detection.md](outputs/phase-12/unassigned-task-detection.md)       |

## 未タスク（Phase 12 検出）

| タスクID                                           | 概要                                            | 優先度 |
| -------------------------------------------------- | ----------------------------------------------- | ------ |
| TASK-P0-07-OPERATION-PHASE-IDS-MANIFEST-DRIVEN-001 | `OPERATION_PHASE_IDS` 定数の manifest-driven 化 | 低     |
| TASK-P0-07-MANIFEST-PHASE-ID-CANONICALIZATION-001  | manifest phase ID 正規名称のドキュメント化      | 低     |
