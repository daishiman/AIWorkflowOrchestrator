# Phase 2: 設計

## メタ情報

| 項目   | 値                                                                |
| ------ | ----------------------------------------------------------------- |
| Phase  | 2                                                                 |
| 機能名 | task-imp-runtime-policy-centralization-implementation-closure-001 |
| 作成日 | 2026-03-27                                                        |

## 目的

Task02 の design contract を current code 実装へ落とすため、consumer wiring、shared transport、実装順序、回帰境界を矛盾なく設計する。

## 実行タスク

- handler / facade / preload / shared types の wiring matrix を設計する
- sanitize 前後の型境界と shared への昇格対象を確定する
- implementation order を DI / consumer / preload / tests の順で固定する
- cleanup task へ引き渡す残置条件を定義する

## 参照資料

| 資料名          | パス                                                                                      | 説明                               |
| --------------- | ----------------------------------------------------------------------------------------- | ---------------------------------- |
| Phase 1         | `phase-1-requirements.md`                                                                 | 要件固定                           |
| Task02 contract | `../step-02-seq-task-02-runtime-policy-centralization/outputs/phase-2/contract-matrix.md` | ownership / type / policy contract |
| Task02 gate     | `../step-02-seq-task-02-runtime-policy-centralization/outputs/phase-3/gate-decision.md`   | MINOR 指摘と着手条件               |
| parent audit    | `../ai-runtime-execution-responsibility-realignment/design-audit-matrix.md`               | drift リスク観点                   |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                                                            | 内容                         |
| ------------------ | --------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| canonical workflow | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md` | extraction matrix            |
| api ipc system     | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                           | public system IPC 入口       |
| api ipc core       | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                                      | core envelope / health route |
| arch state core    | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`                               | renderer consumer 境界       |
| security ipc core  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`                               | preload / sender validation  |

## 成果物

| 成果物                    | パス                                           | 説明                                           |
| ------------------------- | ---------------------------------------------- | ---------------------------------------------- |
| design summary            | `outputs/phase-2/design-summary.md`            | centralization close-out の設計要約            |
| consumer wiring matrix    | `outputs/phase-2/consumer-wiring-matrix.md`    | file ごとの authority / input / output / tests |
| shared contract sync plan | `outputs/phase-2/shared-contract-sync-plan.md` | shared / preload / IPC の同期計画              |

## 統合テスト連携

- Phase 4 の unit / integration ケースは `consumer-wiring-matrix.md` の 1 行を 1 観点以上で必ず消化する。
- `shared-contract-sync-plan.md` は preload / IPC / shared type の contract test 入力に使う。
- cleanup へ回す事項は positive 完了条件と混在させず、Phase 10 / 12 で別追跡する。

## 完了条件

- [ ] handler / facade / preload / shared types の wiring matrix がある
- [ ] sanitize 前後の型境界が説明されている
- [ ] 実装順序が dependency edge と一致している
- [ ] cleanup 条件と本 task 完了条件が分離されている
- [ ] **本Phase内の全タスクを100%実行完了**
