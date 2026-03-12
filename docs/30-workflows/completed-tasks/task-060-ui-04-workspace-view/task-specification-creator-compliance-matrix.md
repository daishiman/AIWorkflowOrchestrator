# task-specification-creator 準拠監査マトリクス

## 目的

`task-specification-creator` スキルの「今回必要な要求」を本 workflow 差分へ漏れなく反映できているかを、branch diff まで含めて監査可能にする。

## 反映マトリクス

| task-spec 正本                                    | 今回必要な要求                                                                                   | 反映先                                                                                                                    | 監査結果         |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `references/create-workflow.md`                   | Phase 1-3 を先行確定し、設計レビュー前に後続へ進まない                                           | `index.md`, `phase-1-requirements.md`, `phase-2-design.md`, `phase-3-design-review.md`                                    | 反映済み         |
| `references/phase-templates.md`                   | 全 Phase に `実行手順`、`多角的チェック観点`、`サブタスク管理`、`タスク100%実行確認` を持たせる  | `phase-1-requirements.md` から `phase-13-pr-creation.md`                                                                  | 今回の改善で反映 |
| `references/review-gate-criteria.md`              | Phase 3 / 10 に PASS / MINOR / MAJOR / CRITICAL と戻り先を置く                                   | `phase-3-design-review.md`, `phase-10-final-review.md`                                                                    | 反映済み         |
| `references/phase-11-12-guide.md`                 | Phase 11 の evidence 継承、Phase 12 の必須5タスクと docs-heavy 運用を明示する                    | `phase-11-manual-test.md`, `phase-12-documentation.md`                                                                    | 今回の改善で反映 |
| `references/screenshot-verification-procedure.md` | `## テストケース`、`## 画面カバレッジマトリクス`、docs-heavy parent の `N/A` を明示する          | `phase-11-manual-test.md`                                                                                                 | 今回の改善で反映 |
| `references/spec-update-workflow.md`              | Step 1-A / 1-B / 1-C / 1-D / Step 2、`spec_created`、LOGS 2ファイル、topic-map 再生成を定義する  | `phase-12-documentation.md`                                                                                               | 今回の改善で反映 |
| `references/phase12-checklist-definition.md`      | `implementation-guide` Part 1 / Part 2、`phase12-task-spec-compliance-check.md` を成果物に含める | `phase-12-documentation.md`                                                                                               | 今回の改善で反映 |
| `references/commands.md`                          | `validate-phase-output.js` / `verify-all-specs.js` / `generate-index.js` を再利用可能な形で残す  | `phase-4-test-creation.md`, `phase-9-quality-assurance.md`, `phase-12-documentation.md`, `outputs/verification-report.md` | 反映済み         |
| `references/evidence-sync-rules.md`               | branch diff / LOGS / skill feedback / manual evidence を同期対象として扱う                       | `phase-11-manual-test.md`, `phase-12-documentation.md`, `branch-diff-reflection-matrix.md`                                | 今回の改善で反映 |

## 監査で見つかった欠落と対策

| 欠落                                                                     | 原因                                                               | 対策                                          |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------ | --------------------------------------------- |
| 全 Phase でテンプレート共通節が欠落                                      | 初回生成後の補強が Phase 11/12 中心に偏っていた                    | Phase 1-13 に共通節を追加した                 |
| Phase 11 に `テストケース` / `画面カバレッジマトリクス` がない           | docs-only task として簡略化しすぎていた                            | child evidence 継承前提の matrix を追加した   |
| Phase 12 に Step 1-A / 1-B / 1-C / 1-D、LOGS 2ファイル、topic-map がない | spec-update-workflow の細目を root matrix にしか反映していなかった | Phase 12 本文へ同期した                       |
| 本ブランチ差分の監査台帳がない                                           | workflow 本体と skill 監査が分離していた                           | `branch-diff-reflection-matrix.md` を追加した |

## 結論

| 観点     | 判定     | 理由                                                                               |
| -------- | -------- | ---------------------------------------------------------------------------------- |
| 漏れ     | 改善済み | 共通テンプレート節、Phase 11/12 固有要件、branch diff 監査を workflow 本体へ戻した |
| 矛盾     | 改善済み | Phase 1-3 先行、docs-only 実装、commit/PR block、`spec_created` が整合した         |
| 再利用性 | 改善済み | 各 Phase と root ledger の役割分担を強め、再監査時の入口を固定した                 |
