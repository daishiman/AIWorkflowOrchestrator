# 多角思考 改善マトリクス（UT-UI-05A-GETFILETREE-001）

## 目的

要件どおり、複数思考法を単なる説明ではなく「検証観点→改善アクション→証跡」に変換し、仕様漏れ・矛盾・依存崩れを防ぐ。

## 思考法別チェックと改善

| 思考法             | 検証観点                             | 実施した改善                                                    | 証跡                                                   |
| ------------------ | ------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------ |
| 水平思考           | 同じ目的に複数の実現経路がないか     | 仕様抽出を「必須/条件付き」に分離し、過剰参照を削減             | `aiworkflow-requirements-extraction-matrix.md`         |
| 逆説思考           | 「この実装をしない」と何が壊れるか   | `skill:getFileTree` 未実装時の導線断絶を明示し、IPC契約を必須化 | `phase-1-requirements.md`, `phase-10-final-review.md`  |
| システム思考       | Renderer/Preload/Main 全体の整合     | 統合テスト連携を Phase 1〜11 に統一追加                         | `phase-1..11`                                          |
| 垂直思考           | 要件→設計→レビューの直線整合         | Phase依存参照を明示してレビュー基準を固定                       | `phase-4`, `phase-8`, `phase-12`, `phase-13`           |
| 類推思考           | 既存成功パターンとの比較             | `skill-editor-view` 完了ワークフローを比較参照し、構造を同型化  | `spec-alignment-review.md`                             |
| if思考             | 条件分岐（UI変更あり/なし等）        | 条件付き仕様セットを定義し、非適用理由を固定                    | `aiworkflow-requirements-extraction-matrix.md`         |
| 素人思考           | 初学者が読んで理解できるか           | Phase 12 Part 1（中学生向け）要件を明文化                       | `phase-12-documentation.md`                            |
| トレードオン思考   | セキュリティ vs 実装速度の両立       | P42/P45準拠を維持しつつ shared型化で実装コストを削減            | `phase-1`, `phase-2`                                   |
| プラスサム思考     | 片側最適でなく両側価値を作る         | Main/Renderer 両方が同一型を使う設計へ統一                      | `phase-1`, `phase-2`                                   |
| 2軸思考            | 影響度×工数で優先順位                | Phase 12 Step 1-A〜2 を高影響順に再整理                         | `phase-12-documentation.md`                            |
| 価値提案思考       | 利用者価値が定義されているか         | ファイルツリー取得価値を要件・受入基準に直接接続                | `phase-1-requirements.md`                              |
| why思考            | 根本原因が記録されているか           | 未実装根因を「IPC契約不在」と定義し対策を固定                   | `phase-1`, `phase-3`                                   |
| 改善思考           | 再発防止の継続性                     | 差分反映マトリクスで反映漏れ検知を定例化                        | `branch-diff-reflection-matrix.md`                     |
| 戦略的思考         | フェーズゲートで失敗を前倒し検出     | Phase 3/10 のゲート項目を契約中心に明確化                       | `phase-3-design-review.md`, `phase-10-final-review.md` |
| ダブル・ループ思考 | 行動だけでなくルール自体を見直したか | artifacts構造をスクリプト互換へ正規化                           | `artifacts.json`, `outputs/artifacts.json`             |
| 抽象化思考         | 個別対応を再利用可能にできるか       | 仕様抽出・差分反映・整合レビューを3文書テンプレート化           | `*-matrix.md`, `spec-alignment-review.md`              |
| プロセス思考       | 手順が再実行可能か                   | 検証コマンドを全て明示し再現手順を固定                          | `spec-alignment-review.md`                             |
| 仮説思考           | リスク仮説を検証したか               | 「構造エラー主因は命名/セクション不足」仮説を検証し解消         | `outputs/verification-report.md`                       |
| 論点思考           | 重要論点と非論点を分離できたか       | IPC/API・セキュリティ・品質・台帳の5論点に分解                  | `aiworkflow-requirements-extraction-matrix.md`         |
| 因果関係ループ     | 問題の連鎖を断てているか             | 仕様漏れ→検証失敗→再修正のループを自動検証で短絡化              | `validate-phase-output`, `verify-all-specs` 実行結果   |

## 最終判定

- 構造整合: PASS（0エラー / 0警告）
- 仕様抽出: 必須/条件付きの二層で固定化
- 差分反映: 仕様書ごとの SubAgent 担当で追跡可能
