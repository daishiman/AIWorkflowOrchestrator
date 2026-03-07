# Phase 2 aiworkflow-requirements 抽出レポート

## 必須参照

| 参照資料                                  | 根拠                                          | 上流ソース | 主な反映先            |
| ----------------------------------------- | --------------------------------------------- | ---------- | --------------------- |
| `architecture-overview.md`                | SoC と依存方向の統合判断                      | A/C/D      | Phase 1, 2, 8, 10     |
| `architecture-implementation-patterns.md` | safeInvoke / safeOn / 型契約の統合判断        | B/C        | Phase 2, 5, 10        |
| `arch-state-management.md`                | state 境界と ViewType / slice 判断            | A/C/D      | Phase 1, 2, 5, 10     |
| `api-endpoints.md`                        | IPC カテゴリと更新対象の確認                  | B/C        | Phase 2, 5            |
| `api-ipc-system.md`                       | `notification:*` / `history:*` 契約の統合判断 | B/C        | Phase 1, 2, 5, 10     |
| `security-api-electron.md`                | preload 公開境界の統合判断                    | B/C        | Phase 1, 2, 5, 9      |
| `security-electron-ipc.md`                | sender 順序と cleanup の統合判断              | B/C/D      | Phase 1, 2, 5, 9, 10  |
| `error-handling.md`                       | FAIL / MAJOR / CRITICAL 記録形式              | C/D        | Phase 2, 4, 10, 12    |
| `ui-history-data-types.md`                | history DTO と戻り値構造                      | C          | Phase 2, 5            |
| `ui-history-integration.md`               | history 導線と統合観点                        | C          | Phase 1, 4, 10, 11    |
| `ui-ux-navigation.md`                     | nav / ViewType / AppDock handoff              | D          | Phase 1, 2, 5, 10, 11 |
| `quality-requirements.md`                 | docs-only gate の品質 / coverage 基準         | C/D/E      | Phase 4, 7, 9, 10     |
| `task-workflow.md`                        | `spec_created` / 完了台帳 / 未タスク登録      | E          | Phase 2, 5, 9, 12     |
| `lessons-learned.md`                      | 再発防止策と path ドリフト教訓                | E          | Phase 2, 8, 10, 12    |

## 条件付き参照

| 参照資料                        | 条件                                     | 理由                                          |
| ------------------------------- | ---------------------------------------- | --------------------------------------------- |
| `interfaces-agent-sdk-ui.md`    | downstream UI 契約へ影響する場合         | `TASK-UI-03` の UI 契約へ波及する可能性がある |
| `interfaces-agent-sdk-skill.md` | SkillCenter 導線の型契約まで更新する場合 | `skillCenter` 導線を詳細化する場合のみ必要    |

## 非適用参照

| 参照資料                 | 非適用理由             |
| ------------------------ | ---------------------- |
| `database-schema.md`     | schema 変更を伴わない  |
| `deployment-gha.md`      | CI/CD 変更を伴わない   |
| `deployment-electron.md` | 配布経路変更を伴わない |
| `api-core.md`            | HTTP API を追加しない  |
