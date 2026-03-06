# 多角思考 改善マトリクス

## 目的

ユーザー指定の思考法を「論点 -> 改善アクション -> 証跡」へ変換し、今回の仕様が思いつきではなく、複数視点で再構成されたことを固定する。

## 思考法別チェックと改善

| 思考法             | 論点                                       | 改善アクション                                                           | 証跡                                                    |
| ------------------ | ------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------- |
| 水平思考           | 他の整理法はないか                         | `physical first` を捨て、3層分類へ置換                                   | `phase-1-requirements.md`, `phase-2-design.md`          |
| 逆説思考           | そのままにしたら何が壊れるか               | Issue #996 の固定レンジで現行 active set を誤判定する危険を明示          | `elegant-consistency-check-report.md`                   |
| システム思考       | 全体の循環は整うか                         | canonical -> derived -> audit の流れへ整理                               | `phase-2-design.md`, `phase-12-documentation.md`        |
| 垂直思考           | 要件から手順まで一直線か                   | Phase 1 / 2 / 10 / 12 の論理を直列に接続                                 | `index.md`                                              |
| 類推思考           | 近い成功事例はあるか                       | `UT-TASK-10A-B-001` の補助監査構成を移植                                 | `branch-diff-reflection-matrix.md`                      |
| if思考             | 条件分岐は抜けていないか                   | derived stale 時、historical 固定レンジ時、ルール変更時の分岐を明記      | `phase-12-documentation.md`                             |
| 素人思考           | 非専門者でも追えるか                       | Part 1 / Part 2 の実装ガイド要求を維持                                   | `phase-12-documentation.md`                             |
| トレードオン思考   | 品質と速度を両立できるか                   | 補助監査文書で再監査コストを先払いで削減                                 | `skill-compliance-audit.md`                             |
| プラスサム思考     | 監査と実装準備の両方に効くか               | 仕様書自体と再監査証跡を同時に整備                                       | `outputs/verification-report.md`                        |
| ２軸思考           | 現行 state と履歴 state を分けられているか | canonical / historical の2軸を分離                                       | `phase-1-requirements.md`                               |
| 価値提案思考       | 何の価値が増えるか                         | active set 判定の再発防止と再監査時間短縮を価値として固定                | `index.md`                                              |
| why思考            | 根本原因は何か                             | fixed range 前提と stale ledger を原因に定義                             | `elegant-consistency-check-report.md`                   |
| 改善思考           | 前回より何を良くしたか                     | schema 検証と outputs 台帳を追加                                         | `phase-12-documentation.md`, `outputs/artifacts.json`   |
| 戦略的思考         | どこを先に固めるべきか                     | 正本定義を先、derived 同期を後に固定                                     | `phase-2-design.md`                                     |
| ダブル・ループ思考 | 手順だけでなく前提も変えたか               | 「物理配置が正本」というルール自体を破棄した                             | `elegant-consistency-check-report.md`                   |
| 抽象化思考         | 他タスクでも使えるか                       | 3層分類を一般的な台帳同期パターンへ抽象化                                | `aiworkflow-requirements-extraction-matrix.md`          |
| プロセス思考       | 手順は再現できるか                         | validate / verify / schema / audit の順を固定                            | `outputs/verification-report.md`                        |
| 仮説思考           | 仮説と検証が接続しているか                 | 「stale ledger が根因」仮説を `ui-ux-feature-components.md` の実測で確認 | `aiworkflow-requirements-extraction-matrix.md`          |
| 論点思考           | 論点が混ざっていないか                     | source taxonomy / skill compliance / diff reflection を別文書化          | 補助監査文書一式                                        |
| 因果関係ループ     | 再発ループを断てているか                   | historical が canonical を上書きするループを遮断                         | `phase-10-final-review.md`, `phase-12-documentation.md` |

## 結論

- 指定された思考法はすべて、具体的な仕様改善か監査証跡へ変換済み。
- 改善は「正本の再定義」「補助監査の追加」「実測値での閉じ方」の3系統に集約した。
