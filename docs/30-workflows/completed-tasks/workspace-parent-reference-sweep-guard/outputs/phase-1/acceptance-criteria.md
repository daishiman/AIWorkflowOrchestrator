# 受入基準

| AC   | 基準                                                                                                                                              | 検証方法                                                                                                               | 証跡                                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| AC-1 | sweep manifest が parent pointer / child workflow / completed-task pointer docs / legacy index / interfaces / capture script / mirror root を含む | manifest と validator 対象一覧を照合する                                                                               | `outputs/phase-2/sweep-manifest-design.md`                                           |
| AC-2 | path drift / status drift / mirror drift の責務が分離されている                                                                                   | contract の fail 条件と JSON 出力を照合する                                                                            | `outputs/phase-2/drift-guard-contract.md`                                            |
| AC-3 | task-060 parent pointer と child workflow の参照関係が一意に説明される                                                                            | parent pointer doc と Phase 11 manual review を照合する                                                                | `outputs/phase-11/manual-test-result.md`                                             |
| AC-4 | Phase 12 同期に `task-workflow.md` / `ui-ux-feature-components.md` / `lessons-learned.md` / `interfaces-*` / mirror sync が含まれる               | spec update summary と changelog を照合する                                                                            | `outputs/phase-12/spec-update-summary.md`                                            |
| AC-5 | workflow validator と新 guard が current tree で PASS する                                                                                        | `validate-phase-output` / `verify-all-specs` / guard / `verify-unassigned-links` / `audit-unassigned-tasks` を実行する | `outputs/phase-9/quality-report.md`, `outputs/phase-12/unassigned-task-detection.md` |

## フェーズゲート

| ゲート            | 条件                                                                        |
| ----------------- | --------------------------------------------------------------------------- |
| Phase 3 進入条件  | audit inventory と concern boundary が文書化済み                            |
| Phase 5 進入条件  | red case と command set が outputs/phase-4 に存在する                       |
| Phase 11 進入条件 | 自動検証が PASS し、manual review 対象一覧が確定している                    |
| Phase 12 完了条件 | system spec 更新、mirror sync、未タスク監査、Part 1/Part 2 実装ガイドが揃う |

## 失敗条件

- task-060 が存在しないローカル task ファイルを参照したまま
- 04A/04B/04C のいずれかが legacy index 上で `pending` のまま
- `.claude` と `.agents` の差分が残ったまま
- system spec が 04B の旧 path を残したまま
