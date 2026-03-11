# task-specification-creator 準拠監査マトリクス

## 目的

`task-specification-creator` スキルの「今回必要な要求」を本 workflow 差分へ漏れなく反映できているかを、破棄ではなく正規化で監査できる状態にする。設計書を作り直すより、差分を監査可能な形に正規化する方が再利用性と追跡性が高いため、この方針を採用する。

## 反映マトリクス

| task-spec 正本                               | 今回必要な要求                                                                                          | 反映先                                                                         | 監査結果         |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------- |
| `references/create-workflow.md`              | create モードで Phase 1-3 を先行確定し、artifacts 初期化と検証を行う                                    | `index.md`, `artifacts.json`, `outputs/verification-report.md`                 | 反映済み         |
| `references/phase-templates.md`              | 全 Phase に共通節、`多角的チェック観点`、`サブタスク管理`、`タスク100%実行確認`、`次のPhase` を持たせる | `phase-1-requirements.md` から `phase-13-pr-creation.md`                       | 今回の改善で反映 |
| `references/review-gate-criteria.md`         | Phase 3 / 10 の判定基準と戻り先を定義する                                                               | `phase-3-design-review.md`, `phase-10-final-review.md`                         | 反映済み         |
| `references/phase-11-12-guide.md`            | Phase 11 の screenshot coverage、Phase 12 の必須タスクを明文化する                                      | `phase-11-manual-test.md`, `phase-12-documentation.md`                         | 反映済み         |
| `references/evidence-sync-rules.md`          | LOGS 2 ファイル同時更新、SKILL 更新、未タスク 3 ステップ完了を明示する                                  | `phase-12-documentation.md`, `branch-diff-reflection-matrix.md`                | 反映済み         |
| `references/phase12-checklist-definition.md` | Part 1 / Part 2、documentation-changelog、unassigned detection の実体確認を持たせる                     | `phase-12-documentation.md`                                                    | 反映済み         |
| `references/commands.md`                     | validator / verifier / documentation-changelog 生成コマンドを再利用可能に残す                           | `index.md`, 各 Phase の `タスク100%実行確認`, `outputs/verification-report.md` | 今回の改善で反映 |

## 監査で見つかった欠落と対策

| 欠落                                | 原因                                            | 対策                                       |
| ----------------------------------- | ----------------------------------------------- | ------------------------------------------ |
| 全 Phase でテンプレート共通節が欠落 | 初回生成後の補強が Phase 11/12 中心に偏っていた | 全 Phase を共通テンプレートへ正規化        |
| Phase 9 に `実行手順` がない        | 生成時の見出し落ち                              | Phase 9 に手順を追加し、品質ゲートを可視化 |
| task-spec 反映状況の監査台帳がない  | aiworkflow 抽出台帳だけでは片側監査しかできない | 本マトリクスを追加                         |

## 結論

| 観点       | 判定     | 理由                                                                    |
| ---------- | -------- | ----------------------------------------------------------------------- |
| 漏れ       | 改善済み | 必須節と主要正本参照を workflow 内へ再配置した                          |
| 矛盾       | 改善済み | Phase 1-3 先行、Phase 11/12 厳格運用、PR 保留条件の整合を維持した       |
| エレガンス | 改善済み | 全面破棄ではなく、テンプレート正規化 + 二重監査台帳で追跡可能性を高めた |
