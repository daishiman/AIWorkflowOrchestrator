# Phase 1 要件定義書

## 実施サマリー

- 実施日: 2026-03-06
- 対象タスク: `TASK-UI-01-E-INTEGRATION-GATE-SPEC-SYNC`
- 実施方式: SubAgent-E1/E2/E3/E4 の関心分離で上流正本を統合

## 入力正本固定

| 区分     | 正本パス                                                                                                                                   | 採用理由                        | 優先順位 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- | -------- |
| A        | `docs/30-workflows/completed-tasks/task-056a-a-store-slice-baseline/index.md`                                                              | Store / state 境界の正本        | 1        |
| B        | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-056a-b-ipc-contract-security.md`                                    | IPC / preload / security の正本 | 2        |
| C        | `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/index.md`                                                         | notification / history の正本   | 3        |
| D        | `docs/30-workflows/completed-tasks/task-056d-viewtype-routing-nav/index.md`                                                                | ViewType / routing / nav の正本 | 4        |
| 親タスク | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056-ui-01-store-ipc-architecture.md`       | 056 親責務の確認                | 5        |
| 統合導線 | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056-ui-01-store-ipc-architecture/index.md` | SubAgent 導線の確認             | 6        |

## 機能要件

| ID    | 要件                                                                                       | 判定方法                                     |
| ----- | ------------------------------------------------------------------------------------------ | -------------------------------------------- |
| FR-01 | A/B/C/D の正本パス、依存方向、参照優先順位を固定する                                       | `outputs/phase-2/traceability-matrix.md`     |
| FR-02 | 統合レビューゲートを `state / ipc / security / navigation / documentation` の5軸で定義する | `outputs/phase-2/integration-gate-design.md` |
| FR-03 | PASS / MINOR / MAJOR の判定条件を証跡ソース付きで定義する                                  | `outputs/phase-5/review-gate.md`             |
| FR-04 | `常時更新 / 条件付き更新 / 更新不要` の3区分で仕様同期対象を定義する                       | `outputs/phase-2/spec-sync-matrix.md`        |
| FR-05 | `TASK-UI-02` / `TASK-UI-03` / `TASK-UI-04A` への引き渡し条件をタスク別に定義する           | `outputs/phase-2/dependency-handoff-plan.md` |
| FR-06 | gate 不合格時の戻り先 Phase を要件単位で定義する                                           | `outputs/phase-4/test-cases.md`              |
| FR-07 | completed/current path の混在を検出対象に含め、正規化方針を固定する                        | `outputs/phase-6/regression-matrix.md`       |
| FR-08 | `spec_created` 反映、関連タスク更新、未タスク検出の実施条件を定義する                      | `outputs/phase-12/spec-update-summary.md`    |
| FR-09 | 各 Phase の成果物を `outputs/phase-N/` 配下に残すことを必須化する                          | `artifacts.json` と各 `outputs/phase-*`      |

## 非機能要件

| ID     | 要件                                                                     | 補足                        |
| ------ | ------------------------------------------------------------------------ | --------------------------- |
| NFR-01 | 判定根拠は上流正本または aiworkflow 正本へトレースできること             | 根拠なし判定を禁止          |
| NFR-02 | Renderer / Preload / Main / IPC / Documentation の責務分離を崩さないこと | SoC の維持                  |
| NFR-03 | 後続 UI タスクが迷わない粒度で handoff 条件を定義すること                | 参照迷子を防止              |
| NFR-04 | 曖昧表現を排除し、100人中100人が同じ判断をできる記述にすること           | `quality-standards.md` 準拠 |
| NFR-05 | コミットと PR 作成は自動実行しないこと                                   | Phase 13 も未実施のまま維持 |
| NFR-06 | 文書のみのタスクであっても検証コマンド、証跡、戻り先を必ず持つこと       | Phase 11/12 の証跡必須      |

## 下流引き渡し要件

| ID        | 下流タスク                          | 引き渡し内容                                      | 解放条件                                 |
| --------- | ----------------------------------- | ------------------------------------------------- | ---------------------------------------- |
| HO-02-01  | `TASK-UI-02-GLOBAL-NAV-CORE`        | ViewType 追加値、nav 契約、AppDock 互換条件       | navigation 軸と state 軸が PASS          |
| HO-02-02  | `TASK-UI-02-GLOBAL-NAV-CORE`        | path 正規化済みの参照導線                         | parent/index/current の参照先が特定可能  |
| HO-03-01  | `TASK-UI-03-AGENT-VIEW-ENHANCEMENT` | renderer/state と notification/history の境界条件 | state / ipc / security 軸が PASS         |
| HO-03-02  | `TASK-UI-03-AGENT-VIEW-ENHANCEMENT` | spec sync で追加更新が必要な場合の更新先          | documentation 軸で Step 2 判定が定義済み |
| HO-04A-01 | `TASK-UI-04A-WORKSPACE-LAYOUT`      | `workspace` 導線、nav 契約、state 境界            | navigation / state 軸が PASS             |
| HO-04A-02 | `TASK-UI-04A-WORKSPACE-LAYOUT`      | B/C/D の前提成果物リンク                          | `dependency-handoff-plan.md` に列挙済み  |

## 層別要件

| 層            | 要件                                                                           | 根拠                                |
| ------------- | ------------------------------------------------------------------------------ | ----------------------------------- |
| Renderer      | `workspace` / `skillCenter` / `historySearch` 導線が後続 UI から参照できること | D 正本, `ui-ux-navigation.md`       |
| Preload       | 新規統合ゲートが preload 公開面を広げないこと                                  | B 正本, `security-api-electron.md`  |
| Main          | sender 検証・認証ゲート・Result 契約を gate 判定に含めること                   | B/C 正本, `api-ipc-system.md`       |
| IPC           | `notification:*` / `history:*` 契約を downstream unlock 条件に含めること       | B/C 正本                            |
| Documentation | `task-workflow.md` / `lessons-learned.md` / `LOGS.md` の同期責務を明記すること | Phase 12, `spec-update-workflow.md` |
