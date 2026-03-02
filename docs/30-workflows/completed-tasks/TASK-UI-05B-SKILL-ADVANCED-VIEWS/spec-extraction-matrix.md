# TASK-UI-05B 仕様抽出マトリクス（aiworkflow-requirements 正本）

## 目的

`task-specification-creator` の Phase 1-13 で必要になる仕様を、`aiworkflow-requirements` から漏れなく抽出し、仕様参照の正本を1ファイルに固定する。

## SubAgent 編成（関心ごと分離）

| SubAgent | 担当関心ごと      | 担当仕様書（最大3）                                                                                                            | 抽出責務                                     |
| -------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| A        | UI/UX             | `ui-ux-components.md`, `ui-ux-feature-components.md`, `arch-ui-components.md`                                                  | Apple HIG/WCAG、コンポーネント責務、画面設計 |
| B        | State/Test        | `arch-state-management.md`, `testing-component-patterns.md`, `testing-accessibility.md`                                        | Zustand方針、happy-dom規約、a11y検証         |
| C        | IPC/Type          | `api-ipc-agent.md`, `interfaces-agent-sdk-skill.md`, `arch-electron-services.md`                                               | IPC契約、型契約、サービス戻り値契約          |
| D        | Security/Workflow | `security-electron-ipc.md`, `task-workflow.md`, `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | P42、event/invoke分離、Phase12同期           |

## 必須仕様ソース（全体）

| 仕様書                                                                            | 抽出する情報                                                                                         | 適用フェーズ   |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------- |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | HIG/WCAG準拠のUI要件                                                                                 | 1,2,10,11,12   |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | Feature View責務分離                                                                                 | 2,5,8,10,12    |
| `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`         | Atomic Design層責務                                                                                  | 2,3,8,10       |
| `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | P31個別セレクタ方針                                                                                  | 2,5,8,9        |
| `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | `skill:debug:*`/`skill:analytics:*` 契約（`skill:schedule:*` は `arch-electron-services.md` で補完） | 1,2,3,4,5,9,10 |
| `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | Debug/Analytics型とPreload API                                                                       | 1,2,3,5,9,10   |
| `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | P42 3段バリデーション、sender検証、eventチャネル規約                                                 | 3,5,9,10,12    |
| `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`     | Scheduleサービス契約                                                                                 | 1,2,5          |
| `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`      | 全体アーキテクチャとディレクトリ配置方針                                                             | 1,2,5,10,12    |
| `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 品質ゲート・性能基準・完了条件                                                                       | 1,7,9,10,12    |
| `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | happy-dom + fireEvent + Storeモック                                                                  | 4,6,7,9        |
| `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | ARIA/キーボード検証パターン                                                                          | 6,9,11         |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | TASK-9D/9G/9H/9Jの完了仕様、未タスク化ルール                                                         | 1,10,12,13     |

## ビュー別抽出（実装直結）

| View                  | 必須仕様                                                                                  | 抽出ポイント                                              |
| --------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 3A SkillChainBuilder  | `task-workflow.md`（TASK-9D参照）, `ui-ux-feature-components.md`, `arch-ui-components.md` | チェーン編集責務、UI層分離、未タスク化条件                |
| 3B ScheduleManager    | `api-ipc-agent.md`, `arch-electron-services.md`, `security-electron-ipc.md`               | `skill:schedule:*` 契約、戻り値仕様、入力検証             |
| 3C DebugPanel         | `api-ipc-agent.md`, `interfaces-agent-sdk-skill.md`, `security-electron-ipc.md`           | `skill:debug:*` + `skill:debug:event` 契約、型、event分離 |
| 3D AnalyticsDashboard | `api-ipc-agent.md`, `interfaces-agent-sdk-skill.md`, `security-electron-ipc.md`           | `skill:analytics:*` 契約、統計型、許可値バリデーション    |

## 抽出漏れガード（整合監査）

| 監査観点     | チェック内容                                                                         |
| ------------ | ------------------------------------------------------------------------------------ |
| 矛盾         | Phase参照資料が `artifacts.json` 依存に整合すること                                  |
| 漏れ         | 必須仕様ソース13件が Phase 1-13 のどこかに必ず参照されること                         |
| 依存関係     | `artifacts.json.dependencies` と Phase本文の依存記述が一致すること                   |
| 契約整合     | IPC契約（api）・型契約（interfaces）・セキュリティ（security）が同時に記載されること |
| 未タスク運用 | Phase 10 MINOR/Phase 12 検出課題の3ステップ運用（指示書/台帳/参照）を維持すること    |

## 抽出適用監査ログ（2026-03-01）

| 監査項目              | 実行内容                                                                                                                                                                                          | 判定                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| matrix→phase 参照一致 | `spec-extraction-matrix.md` の13件×適用Phaseを機械照合                                                                                                                                            | PASS（missing=0）       |
| 抽出漏れ自動監査      | `node docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/scripts/audit-spec-consistency.cjs --workflow docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS --json` | PASS（errors=0）        |
| task-spec 形式整合    | `verify-all-specs --workflow docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS --json`                                                                                           | PASS（13/13, errors=0） |
| Phase出力整合         | `validate-phase-output.js docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS`                                                                                                     | PASS（28項目, 警告0）   |

## 既知ギャップと補完方針

| ギャップ                                                  | 補完元                                                                | 方針                                                              |
| --------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `skill:chain:*` の正本が aiworkflow references に限定的   | `task-workflow.md` の TASK-9D 記録 + 元タスク仕様書                   | Phase 1/2 で契約表を固定し、Phase 10 で再突合する                 |
| `skill:schedule:*` の詳細契約が `api-ipc-agent.md` で薄い | `arch-electron-services.md` の IPC契約表 + `task-workflow.md` TASK-9G | Phase 1/2 で request/response を固定し、Phase 5/10 で実装突合する |
| Phase成果物名ドリフト                                     | `artifact-naming-conventions.md` + `artifacts.json`                   | 命名は `artifacts.json` を単一正本として同期する                  |
