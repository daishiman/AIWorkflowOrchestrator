# Phase 2 仕様同期マトリクス

## 常時更新対象

| 対象                                                                                                                                 | 区分     | Step | 更新理由                                       | 根拠              |
| ------------------------------------------------------------------------------------------------------------------------------------ | -------- | ---- | ---------------------------------------------- | ----------------- |
| `docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/artifacts.json`                                          | 常時更新 | 1-B  | Phase 実行状態を持つ正本                       | workflow 実行台帳 |
| `docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/index.md`                                                | 常時更新 | 1-B  | Phase ステータスと成果物を最新化する           | workflow 導線     |
| `docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/phase-*.md`                                              | 常時更新 | 1-B  | 実行ステータスと完了条件を同期する             | workflow 本文     |
| `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056-ui-01-store-ipc-architecture.md` | 常時更新 | 1-C  | E の正本導線を parent へ反映する               | 056 親タスク      |
| `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-0560-index.md`                       | 常時更新 | 1-C  | 056 系一覧から E へ到達できるようにする        | 056 index         |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                 | 常時更新 | 1-A  | `spec_created` / 完了記録 / 残課題台帳の更新先 | Phase 12 必須     |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                                               | 常時更新 | 1-A  | 統合ゲート運用の教訓反映先                     | Phase 12 必須     |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                                                                                     | 常時更新 | 1-A  | aiworkflow 側の実行ログ                        | Phase 12 必須     |
| `.claude/skills/task-specification-creator/LOGS.md`                                                                                  | 常時更新 | 1-A  | task-spec 側の実行ログ                         | Phase 12 必須     |

## 条件付き更新対象

| 対象                                                                              | Step | 更新条件                                            | 今回の初期判断                             |
| --------------------------------------------------------------------------------- | ---- | --------------------------------------------------- | ------------------------------------------ |
| `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | 2    | E が新しい state 統合ルールを追加した場合           | 既存 056A/D ルールで足りるため原則更新不要 |
| `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`             | 2    | C/B の IPC 契約に新しい統合運用ルールを追加した場合 | 既存契約の再集約のみなら更新不要           |
| `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      | 2    | preload 公開境界に新ルールを追加した場合            | 今回は判定の再利用のみ                     |
| `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | 2    | sender / cleanup 運用に新ルールを追加した場合       | 今回は判定の再利用のみ                     |
| `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | 2    | gate 専用の FAIL / CRITICAL 形式を新設した場合      | 既存 Result / errorCode で足りる           |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`           | 2    | D では扱わない新しい nav handoff 規則を追加した場合 | `TASK-UI-02` 依存の明文化のみ              |
| `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 2    | docs-only gate 用の新しい品質閾値を追加した場合     | 既存閾値を流用                             |
| `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`    | 2    | downstream UI 契約の変更を伴う場合                  | 条件付き                                   |
| `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | 2    | SkillCenter handoff 契約が拡張される場合            | 条件付き                                   |

## 更新不要対象

| 対象                                                                         | 理由                       |
| ---------------------------------------------------------------------------- | -------------------------- |
| `.claude/skills/aiworkflow-requirements/references/database-schema.md`       | DB schema の追加変更がない |
| `.claude/skills/aiworkflow-requirements/references/deployment-gha.md`        | CI/CD 変更を伴わない       |
| `.claude/skills/aiworkflow-requirements/references/deployment-electron.md`   | 配布経路の変更を伴わない   |
| `.claude/skills/aiworkflow-requirements/references/ui-history-data-types.md` | 新規 DTO を追加しない      |
