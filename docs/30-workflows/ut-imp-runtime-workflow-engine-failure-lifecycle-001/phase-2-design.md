# Phase 2: 設計

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 2                                                    |
| 機能名 | ut-imp-runtime-workflow-engine-failure-lifecycle-001 |
| 作成日 | 2026-03-26                                           |

## 目的

失敗系 state machine、artifact append 戦略、invalid transition guard を矛盾なく実装できる設計へ落とす。

## 実行タスク

- failure transition matrix を設計する
- artifact append 戦略を確定する
- facade の reject 捕捉と engine の state 更新 API を分離する
- Task04 / Task08 へ影響する shared contract を洗い出す

## 参照資料

| 資料名            | パス                                                                                                  | 説明                    |
| ----------------- | ----------------------------------------------------------------------------------------------------- | ----------------------- |
| Phase 1           | `phase-1-requirements.md`                                                                             | 要件固定                |
| 親 ownership      | `../../step-02-seq-task-02-workflow-engine-runtime-orchestration/outputs/phase-2/ownership-matrix.md` | 既存 owner 契約         |
| 親 test expansion | `../../step-02-seq-task-02-workflow-engine-runtime-orchestration/phase-6-test-expansion.md`           | failure path の不足観点 |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                                        | 内容                                |
| ------------------------ | ------------------------------------------------------------------------------------------- | ----------------------------------- |
| owner 分離               | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`           | facade / engine / bridge の責務境界 |
| Electron service details | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | facade / service / helper 分離      |
| public IPC 境界          | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                  | workflow engine の公開面            |
| implementation patterns  | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | guard / state transition の設計原則 |

## 成果物

| 成果物                    | パス                                           | 説明                     |
| ------------------------- | ---------------------------------------------- | ------------------------ |
| failure transition matrix | `outputs/phase-2/failure-transition-matrix.md` | 3 経路の canonical state |
| artifact history decision | `outputs/phase-2/artifact-history-decision.md` | append 正本の判断記録    |

## 統合テスト連携

- Phase 4 は `outputs/phase-2/failure-transition-matrix.md` をそのまま期待値の正本として参照し、case 名を変えずに test matrix へ写像する。
- Phase 6 は `outputs/phase-2/artifact-history-decision.md` の consumer rule を repeated failure / retry / resume の回帰条件へ変換する。
- invalid transition guard の拒否条件は engine 単体テストと facade 経由テストの両方で再確認する。

## 完了条件

- [ ] reject / `success:false` / verify review の遷移表がある
- [ ] invalid transition guard の振る舞いが定義されている
- [ ] append 戦略を採用する理由が Task04 / Task08 影響込みで説明されている
- [ ] facade と engine の API 分割が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
