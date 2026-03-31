# タスク実行仕様書生成ガイド / completed records (skill lifecycle)

> 親仕様書: [task-workflow.md](task-workflow.md)
> 役割: completed records - インデックス
> 分割元: 本ファイル（500行超のため2ファイルに分割）

## 分割ファイル一覧

| ファイル | 責務 | 対象タスク |
| --- | --- | --- |
| [task-workflow-completed-skill-lifecycle-ui.md](task-workflow-completed-skill-lifecycle-ui.md) | UI実装・統合系 | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001, TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001, TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001, TASK-10A-C, TASK-10A-D, TASK-SKILL-LIFECYCLE-04, TASK-SKILL-LIFECYCLE-05, TASK-SKILL-LIFECYCLE-08, Task09-12, TASK-RT-05 |
| [task-workflow-completed-skill-lifecycle-security.md](task-workflow-completed-skill-lifecycle-security.md) | セキュリティ・権限ガバナンス系 | UT-06-003, UT-06-005, TASK-SKILL-LIFECYCLE-06, UT-06-001, UT-06-002 |

## タスクID 逆引き

| タスクID | 分割先 | 概要 |
| --- | --- | --- |
| TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 | ui | ViewType/renderView 基盤拡張 |
| TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001 | ui | SkillDetailPanel action buttons handoff |
| TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001 | ui | AgentView CTA と SkillAnalysis round-trip |
| TASK-10A-C | ui | SkillCreateWizard 実装 |
| TASK-10A-D | ui | スキルライフサイクルUI統合 |
| TASK-SKILL-LIFECYCLE-04 | ui | 採点・評価・受け入れゲート統合 |
| TASK-SKILL-LIFECYCLE-05 | ui | 作成済みスキル利用導線 |
| TASK-SKILL-LIFECYCLE-08 | ui | スキル共有・公開・互換性統合 |
| Task09-12 | ui | UI GAP 解消 + 状態遷移完成 |
| TASK-RT-05 | ui | multi_select UserInputKind 追加（checkbox host + engine validation）。TASK-RT-05-TEST-RERUN close-out 完了（2026-03-31, Issue #1756） |
| UT-06-003 | security | DefaultSafetyGate 具象クラス実装 |
| UT-06-005 | security | Permission Fallback 実装 |
| TASK-SKILL-LIFECYCLE-06 | security | 信頼・権限ガバナンス設計 |
| UT-06-001 | security | tool-risk-config 実装 |
| UT-06-002 | security | AllowedToolEntryV2 PermissionStore V2 拡張 |
