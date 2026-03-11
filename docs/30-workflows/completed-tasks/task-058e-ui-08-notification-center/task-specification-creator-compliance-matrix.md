# task-specification-creator 準拠監査マトリクス

## 目的

`task-specification-creator` の create / verify / system spec sync の要求が、`task-058e-ui-08-notification-center` workflow に漏れなく反映されているかを監査可能にする。特に「Phase 1-3 設計完了前に先へ進まない」「Phase 12 を簡略化しない」「検証コマンドを固定する」の 3 点を明示する。

## 反映マトリクス

| task-spec 正本                               | 今回必要な要求                                                                                                                     | 反映先                                                                                                   | 監査結果         |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------- |
| `references/create-workflow.md`              | create モードとして 13 Phase 構成を用意し、Phase 1-3 を barrier として先行確定する                                                 | `index.md`, `phase-1-requirements.md`, `phase-2-design.md`, `phase-3-design-review.md`, `artifacts.json` | 反映済み         |
| `references/phase-templates.md`              | 全 Phase に `目的`、`実行タスク`、`参照資料`、`完了条件`、`サブタスク管理`、`タスク100%実行確認`、`次のPhase` を持たせる           | `phase-1-requirements.md` から `phase-13-pr-creation.md`                                                 | 反映済み         |
| `references/artifact-naming-conventions.md`  | `outputs/phase-N/*.md` の成果物名を各 Phase と `artifacts.json` で一致させる                                                       | `artifacts.json`, 各 Phase の `成果物` 節                                                                | 反映済み         |
| `references/review-gate-criteria.md`         | Phase 3 / 10 に PASS / MINOR / MAJOR / CRITICAL と戻り先を定義する                                                                 | `phase-3-design-review.md`, `phase-10-final-review.md`                                                   | 反映済み         |
| `references/phase-11-12-guide.md`            | Phase 11 は screenshot 証跡、Phase 12 は Part 1 / Part 2 と system spec sync を必須化する                                          | `phase-11-manual-test.md`, `phase-12-documentation.md`                                                   | 今回の改善で補強 |
| `references/evidence-sync-rules.md`          | Phase 12 で task workflow / lessons / 関連正本の同期先を先に固定する                                                               | `phase-12-documentation.md`, `branch-diff-reflection-matrix.md`                                          | 今回の改善で補強 |
| `references/phase12-checklist-definition.md` | Step 1-A / 1-B / 1-C / 条件付き Step 2、`documentation-changelog`、`unassigned-task-detection`、`skill-feedback-report` を定義する | `phase-12-documentation.md`                                                                              | 今回の改善で補強 |
| `references/commands.md`                     | validator / verifier を workflow 直下で再利用可能な形で残す                                                                        | `index.md`, `outputs/verification-report.md`                                                             | 今回の改善で補強 |
| `agents/generate-task-specs.md`              | 元タスク正本から FR / NFR / スコープ / SubAgent 分担を生成し、Phase 間の依存を明確にする                                           | `phase-1-requirements.md`, `requirements-traceability-matrix.md`, `index.md`                             | 反映済み         |
| `agents/verify-specs.md`                     | 最終的に 13 Phase の整合と warning / error を確認する                                                                              | `outputs/verification-report.md`                                                                         | 今回の改善で補強 |
| `agents/update-system-specs.md`              | 実装時に更新すべき system spec 候補と条件付き更新判断を先に定義する                                                                | `phase-12-documentation.md`, `aiworkflow-requirements-extraction-matrix.md`                              | 反映済み         |

## 監査で見つかった改善点

| 項目               | 監査前                                                                               | 改善内容                                                  |
| ------------------ | ------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| task-spec 監査導線 | `index.md` の要約のみで、要求ごとの追跡が弱かった                                    | 本マトリクスを追加し、正本ごとの反映先を固定              |
| Phase 12 の厳密さ  | system spec 同期先は書いていたが、Step 1-A / 1-B / 1-C と Part 1 / Part 2 が弱かった | `phase-12-documentation.md` を task-spec 正本に寄せて補強 |
| verify 証跡        | 検証実行結果の root 証跡がなかった                                                   | `outputs/verification-report.md` を追加対象にした         |

## 結論

| 観点             | 判定     | 理由                                                                  |
| ---------------- | -------- | --------------------------------------------------------------------- |
| Phase 構成       | 適合     | Phase 1-13、Barrier Plan、SubAgent 分担が固定されている               |
| テンプレート準拠 | 適合     | 全 Phase が共通節を持ち、成果物命名も `artifacts.json` と整合している |
| Phase 12 準拠    | 改善済み | Part 1 / Part 2、Step 1-A / 1-B / 1-C、条件付き Step 2 を追記した     |
| 検証可能性       | 改善済み | validator / verifier の結果を root 証跡で追える状態にした             |
