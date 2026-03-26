# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 6                                                    |
| 機能名 | ut-imp-runtime-workflow-engine-failure-lifecycle-001 |
| 作成日 | 2026-03-26                                           |

## 目的

最小 test matrix を越えて、retry / resume / repeated failure まで含む回帰 guard を追加する。

## 実行タスク

- 同一 phase で失敗が連続した場合の append 検証を追加する
- review 後 retry で state が回復するケースを追加する
- stale request / duplicate transition の拒否を追加する

## 参照資料

| 資料名  | パス                                                                                                      | 説明            |
| ------- | --------------------------------------------------------------------------------------------------------- | --------------- |
| Phase 4 | `phase-4-test-creation.md`                                                                                | 最小ケース      |
| Task08  | `../../skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/index.md` | resume 互換視点 |

## 成果物

| 成果物              | パス                        | 説明               |
| ------------------- | --------------------------- | ------------------ |
| test expansion plan | `phase-6-test-expansion.md` | edge case 拡充方針 |

## 統合テスト連携

- Phase 5 の実装結果と `outputs/phase-2/artifact-history-decision.md` を突き合わせ、append history と latest accessor の両立が repeated failure でも崩れないことを検証する。
- Phase 4 の `outputs/phase-4/test-matrix.md` を最小集合として残しつつ、retry / duplicate transition / stale request を拡張ケースとして追加する。
- Task08 の resume 契約に影響する failure snapshot は互換ケースとして明記する。

## 完了条件

- [ ] retry / repeated failure / duplicate transition が含まれる
- [ ] append 戦略の連続失敗ケースが含まれる
- [ ] Task08 を壊さない観点が含まれる
- [ ] **本Phase内の全タスクを100%実行完了**
