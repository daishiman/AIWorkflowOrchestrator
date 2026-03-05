# 多角思考 改善マトリクス（UT-TASK-10A-B-001）

## 目的

20思考法を「検証観点 -> 改善アクション -> 証跡」に変換し、矛盾・漏れ・依存崩れを仕様書段階で排除する。

## 思考法別チェックと改善

| 思考法             | 検証観点                            | 実施した改善                                          | 証跡                                                                               |
| ------------------ | ----------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 水平思考           | 同じ目的への代替経路があるか        | 仕様抽出を「採用/非採用理由」付きで分離               | `aiworkflow-requirements-extraction-matrix.md`                                     |
| 逆説思考           | 実装しない場合に何が壊れるか        | `autoFixable` 未対応時のUX劣化を要件と完了条件に固定  | `phase-1-requirements.md`, `phase-10-final-review.md`                              |
| システム思考       | UI/状態/API/台帳の全体整合          | Phase横断で参照仕様のカテゴリを統一                   | `phase-1`〜`phase-13`                                                              |
| 垂直思考           | 要件から実行までの一直線整合        | 依存Phase成果物を全Phaseに明記                        | `phase-*.md`                                                                       |
| 類推思考           | 類似成功タスクの再利用可否          | 既存 completed-task の監査構造を移植                  | `skill-compliance-audit.md`                                                        |
| if思考             | 条件分岐の抜け漏れ                  | Phase 12 Step 2 を条件付き更新として明示              | `phase-12-documentation.md`                                                        |
| 素人思考           | 非専門者にも伝わるか                | Phase 12 Task 12-1 で Part 1/Part 2 要件を固定        | `phase-12-documentation.md`                                                        |
| トレードオン思考   | 品質と速度の両立                    | Step 1-A〜1-G を明文化し手戻り削減                    | `phase-12-documentation.md`                                                        |
| プラスサム思考     | 複数関係者の価値を同時達成できるか  | UI/状態/品質のSubAgent分担を固定                      | `index.md`, `branch-diff-reflection-matrix.md`                                     |
| 2軸思考            | 影響度 x 実装工数で優先できているか | Phase 3/10 をゲート、Phase 12 を同期重点で設計        | `index.md`, `phase-3-design-review.md`, `phase-10-final-review.md`                 |
| 価値提案思考       | ユーザー価値が明確か                | ワンクリック選択の価値を目的とACに接続                | `phase-1-requirements.md`                                                          |
| why思考            | 根本原因が定義されているか          | MINOR M1 を根因として追跡リンクを固定                 | `index.md`, `aiworkflow-requirements-extraction-matrix.md`                         |
| 改善思考           | 継続改善が可能か                    | 監査成果物3点を追加し再監査を定型化                   | `elegant-consistency-check-report.md`, `branch-diff-reflection-matrix.md`          |
| 戦略的思考         | 失敗を前倒しで検出できるか          | Step 1-G の検証コマンド順序を固定                     | `phase-12-documentation.md`                                                        |
| ダブル・ループ思考 | 手順だけでなくルールを改善したか    | Phase 12 に Step 1-D/E/F/G を追加して運用ルールを改良 | `phase-12-documentation.md`                                                        |
| 抽象化思考         | 他タスクへ再利用できるか            | 採用/非採用判定と差分反映のテンプレ化                 | `aiworkflow-requirements-extraction-matrix.md`, `branch-diff-reflection-matrix.md` |
| プロセス思考       | 手順再現性があるか                  | 検証コマンドを再現ブロックとして固定                  | `aiworkflow-requirements-extraction-matrix.md`, `outputs/verification-report.md`   |
| 仮説思考           | 仮説と検証が接続しているか          | 「漏れ原因は Phase 12 手順不足」仮説を検証しStep追加  | `phase-12-documentation.md`, `skill-compliance-audit.md`                           |
| 論点思考           | 争点の分離ができているか            | UI/状態/API/セキュリティ/品質/台帳の6論点に分離       | `aiworkflow-requirements-extraction-matrix.md`                                     |
| 因果関係ループ     | 再発連鎖を断てているか              | 抽出漏れ -> 検証失敗の連鎖を機械検証で短絡            | `outputs/verification-report.md`, `elegant-consistency-check-report.md`            |

## 結論

- 20思考法は全て仕様書改善アクションへ変換済み。
- 追加した改善は「Phase 12 Step拡張」「抽出完全性明文化」「差分反映追跡」の3系統に集約した。
