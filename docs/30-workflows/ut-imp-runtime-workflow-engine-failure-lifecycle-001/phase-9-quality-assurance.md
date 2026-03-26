# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 9                                                    |
| 機能名 | ut-imp-runtime-workflow-engine-failure-lifecycle-001 |
| 作成日 | 2026-03-26                                           |

## 目的

code / docs / tests / shared contract が同じ失敗系仕様を指しているかを総合判定する。

## 実行タスク

- transition 表とテスト期待値の一致を監査する
- artifact append 方針と ownership 文書の一致を監査する
- downstream 契約破壊がないかを確認する

## 参照資料

| 資料名       | パス                                                                                                  | 説明         |
| ------------ | ----------------------------------------------------------------------------------------------------- | ------------ |
| Phase 2      | `phase-2-design.md`                                                                                   | 設計正本     |
| Phase 4      | `phase-4-test-creation.md`                                                                            | テスト期待値 |
| 親 ownership | `../../step-02-seq-task-02-workflow-engine-runtime-orchestration/outputs/phase-2/ownership-matrix.md` | 文書同期先   |

## 成果物

| 成果物     | パス                           | 説明           |
| ---------- | ------------------------------ | -------------- |
| qa summary | `phase-9-quality-assurance.md` | 整合性監査観点 |

## 統合テスト連携

- Phase 5 の実装結果、Phase 4 の `outputs/phase-4/test-matrix.md`、Phase 2 の `outputs/phase-2/artifact-history-decision.md` を 1 つの監査列に並べ、仕様と期待値のズレを検出する。
- 親 ownership 文書との比較は append history / latest accessor / owner 境界の 3 点に限定し、監査観点を膨らませない。
- downstream 契約破壊の有無は Task04 / Task08 が読む shared fields に限定して判定する。

## 完了条件

- [ ] code / docs / tests の整合項目が列挙されている
- [ ] append 戦略と downstream 契約の整合が確認対象になっている
- [ ] blocker 判定条件が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
