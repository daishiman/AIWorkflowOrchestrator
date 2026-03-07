# Phase 12 多角的再監査

## 結論

- 全面破棄は不要。
- ただし、path canonicalization、未タスク誤配置、`spec_created` task における branch-level visual recheck の3点は再監査しないと漏れやすいため、Phase 12 で補強した。

## 20思考フレーム再監査

| 思考               | 監査論点                                                     | 結果 | 反映                                                                                                     |
| ------------------ | ------------------------------------------------------------ | ---- | -------------------------------------------------------------------------------------------------------- |
| 水平思考           | A/B/C/D と parent docs を横並びで比較したか                  | PASS | current / completed / parent の path を同時確認                                                          |
| 垂直思考           | 各Phaseの責務が `spec_created` task として成立しているか     | PASS | Phase 5 は code ではなく gate / sync / handoff を正本化し、Phase 11 は integration visual recheck を担当 |
| システム思考       | upstream, downstream, aiworkflow, artifacts が循環整合するか | PASS | `task-workflow` / `lessons` / `artifacts` を同一ターンで同期                                             |
| 逆説思考           | 「コードがないから検証も軽くてよい」を疑ったか               | PASS | code diff がなくても UI smoke を含めて verify/validate/audit を実施                                      |
| 類推思考           | 056a/056c/056d の再監査教訓を再利用したか                    | PASS | path canonicalization と current/baseline 分離を適用                                                     |
| why思考            | 参照切れの真因を掘れたか                                     | PASS | link typo ではなく未実施UTの誤配置と特定                                                                 |
| 改善思考           | 再発防止を skill guide に戻したか                            | PASS | `spec-update-workflow.md` と `phase-11-12-guide.md` を更新                                               |
| 戦略思考           | downstream 3件の unblock 条件が曖昧でないか                  | PASS | `review-gate.md` と `dependency-handoff-plan.md` に固定                                                  |
| 抽象化思考         | 今回の問題を一般ルールへ上げたか                             | PASS | parent/current canonical path 確認を一般化                                                               |
| トレードオン思考   | conditional specs まで広げすぎていないか                     | PASS | Step 2 は更新不要とし、always-update 範囲に限定                                                          |
| if思考             | parent docs のみ旧パス残置なら何が壊れるか                   | PASS | downstream 探索失敗を明文化                                                                              |
| 2軸思考            | 完全性と最小変更を両立したか                                 | PASS | runtime specs は増やさず台帳と導線だけ補強                                                               |
| プロセス思考       | 修正→検証→台帳同期の順序が閉じているか                       | PASS | outputs 作成後に検証を再実行して同期                                                                     |
| 素人思考           | 初見実行者が current workflow を特定できるか                 | PASS | parent docs からの導線を正規化                                                                           |
| 価値提案思考       | 何が良くなったか明確か                                       | PASS | downstream handoff と spec sync の迷いを除去                                                             |
| ダブル・ループ思考 | 手順だけでなく判断原則も見直したか                           | PASS | `spec_created` task でも upstream UI surface がある場合は Phase 11 visual recheck を回す原則を固定       |
| 因果関係ループ     | path drift → 検証失敗 → 台帳失敗の連鎖を断てたか             | PASS | canonical path fix と unassigned file relocation を同時実施                                              |
| プラスサム思考     | 既存教訓を壊さず今回の教訓を足せたか                         | PASS | 既存ガイドを補強し、新規 runtime rule は増やしていない                                                   |
| 仮説思考           | 「古い nested path が原因」仮説を検証したか                  | PASS | parent docs / verification-report / phase docs の3箇所で確認                                             |
| 論点思考           | 主論点と副論点を分離できたか                                 | PASS | 主論点=統合ゲート, 副論点=path/未タスク/台帳整合                                                         |

## 破棄判断

| 対象                              | 判断 | 理由                                                     |
| --------------------------------- | ---- | -------------------------------------------------------- |
| 13Phase 構造                      | 維持 | `spec_created` task でも品質ゲートと visual smoke が有効 |
| 5軸ゲート                         | 維持 | downstream handoff 判定に必要                            |
| Step 2 条件付き更新               | 維持 | runtime 契約追加がないため「更新不要」判定に使える       |
| old nested workflow path 前提     | 破棄 | 実体パスと乖離しており探索失敗の原因                     |
| 未実施UTを completed 側に置く運用 | 破棄 | Phase 12 監査と矛盾する                                  |

## 最終判断

- 本タスクの Phase 12 は、`spec_created` task に必要な正本同期・未タスク監査・path canonicalization・branch-level visual recheck まで含めて成立させるべきであり、その条件を満たす構成へ再整合した。
