# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 12                                  |
| 機能名 | TASK-043A IPC契約・セキュリティ整合 |
| 作成日 | 2026-03-05                          |
| 状態   | spec_created                        |

## 目的

実装ガイド（Part 1/Part 2）とシステム仕様同期の必須要件を固定し、未タスク検出とスキル改善提案までを一つの完了フローに統合する。

## 事前チェック【必須】

1. `.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目を確認する。
2. `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` の完了チェックを確認する。
3. `.claude/skills/task-specification-creator/references/spec-update-workflow.md` の Step 1-A〜Step 2 を確認する。

## 実行タスク

| Task      | 内容                                        | 主成果物                                        |
| --------- | ------------------------------------------- | ----------------------------------------------- |
| Task 12-1 | 実装ガイド作成（Part 1/Part 2）             | `outputs/phase-12/implementation-guide.md`      |
| Task 12-2 | システム仕様同期（完了記録 + 更新要否判断） | `outputs/phase-12/spec-update-summary.md`       |
| Task 12-3 | ドキュメント更新履歴作成                    | `outputs/phase-12/documentation-changelog.md`   |
| Task 12-4 | 未タスク検出レポート作成                    | `outputs/phase-12/unassigned-task-detection.md` |
| Task 12-5 | スキルフィードバックレポート作成            | `outputs/phase-12/skill-feedback-report.md`     |

- Task 12-1: 実装ガイドを Part 1（中学生レベル概念説明）と Part 2（技術詳細）で作成する
- Task 12-2: システム仕様を Step 1（完了記録）と Step 2（更新要否判断）で同期する
- Task 12-3: 変更履歴と成果物同期結果を記録する
- Task 12-4: 未タスク検出結果を0件でも出力する
- Task 12-5: 改善提案が0件でもスキルフィードバックを出力する

## 参照資料

| 参照資料             | パス                                                                              | 説明                               |
| -------------------- | --------------------------------------------------------------------------------- | ---------------------------------- |
| Phase 1 仕様書       | `phase-1-requirements.md`                                                         | 依存入力                           |
| Phase 2 仕様書       | `phase-2-design.md`                                                               | 依存入力                           |
| Phase 5 仕様書       | `phase-5-implementation.md`                                                       | 依存入力                           |
| Phase 6 仕様書       | `phase-6-test-expansion.md`                                                       | 依存入力                           |
| Phase 7 仕様書       | `phase-7-coverage-check.md`                                                       | 依存入力                           |
| Phase 8 仕様書       | `phase-8-refactoring.md`                                                          | 依存入力                           |
| Phase 9 仕様書       | `phase-9-quality-assurance.md`                                                    | 依存入力                           |
| Phase 10 仕様書      | `phase-10-final-review.md`                                                        | 依存入力                           |
| Phase 11 仕様書      | `phase-11-manual-test.md`                                                         | 依存入力                           |
| spec-update-workflow | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`    | Step 1-A〜Step 2 の正規手順        |
| phase-11-12-guide    | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`       | Phase 11/12 完了チェック           |
| resource-map         | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                  | タスク種別に対応する正本仕様を抽出 |
| quick-reference      | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`               | IPC/patternの先行固定              |
| interfaces           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | skill系インターフェース契約        |
| api-ipc              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | IPC契約・チャネル責務分離          |
| security-ipc         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | sender/P42/サニタイズ順序          |
| security-preload     | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      | contextIsolation・公開面制約       |
| error                | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | ERR_1001/2004/5001 方針            |
| quality              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 品質ゲート・テスト基準             |

## サブフェーズ

### Task 1: 実装ガイド作成

| パート | 対象読者         | 必須内容                                       |
| ------ | ---------------- | ---------------------------------------------- |
| Part 1 | 初学者・非技術者 | 中学生レベルで概念・目的・全体像を説明         |
| Part 2 | 開発者・技術者   | 契約・セキュリティ・テスト観点を技術詳細で説明 |

### Task 2: システム仕様同期

- Step 1-A（必須）: 完了タスク記録、関連ドキュメント更新、変更履歴更新、LOGS/SKILL 同期を記録する
- Step 1-D（必須）: `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行し、topic-map再生成を記録する
- Step 2（必須）: 更新要否を判断し、更新対象または更新なし理由を `documentation-changelog.md` に記録する

### Task 3.5: 実行証跡整合ガード

1. `outputs/phase-12/` の必須5成果物が実在する。
2. `artifacts.json` の `phases.12.status` が `completed` になる条件を定義する。
3. 成果物一覧と `artifacts.json` の内容が一致することを確認する。

### Task 4: 未タスク検出

- Phase 3/10/11 の指摘事項、成果物内 TODO/FIXME、コード内 TODO/FIXME を対象に検出する。
- 0件でも `outputs/phase-12/unassigned-task-detection.md` を出力する。

### Task 5: スキルフィードバック

- ワークフロー改善点、技術的教訓、テンプレート改善提案を記録する。
- 改善点が0件でも `outputs/phase-12/skill-feedback-report.md` を出力する。

## 実行手順

1. 実行タスクを Task 12-1〜12-5 の順で処理する。
2. Task 12-1 で実装ガイド Part 1/Part 2 を作成する。
3. Task 12-2 でシステム仕様同期と更新要否判断を記録する。
4. Task 12-3/12-4/12-5 で更新履歴・未タスク・フィードバックを出力する。
5. Task 3.5 の3点整合を確認し、Phase 13 へ引き渡す。

## 統合テスト連携

- Phase 12 で確定した仕様同期結果を TASK-10A-E-D / TASK-10A-G の検証証跡へトレース可能な形式で記録する。

## 成果物

| 成果物               | パス                                            | 説明                     |
| -------------------- | ----------------------------------------------- | ------------------------ |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Part 1/Part 2            |
| 仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`       | Step 1/Step 2 の実施結果 |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`   | 変更記録                 |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md` | 0件でも必須              |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     | 改善提案                 |

## 完了条件

- [ ] 実行タスクを「表」と「`- Task 12-X:` 箇条書き」の両方で記載している
- [ ] 実装ガイド Part 1（中学生レベル概念説明）と Part 2（技術詳細）を定義している
- [ ] Task 2 Step 1-A / Step 1-D / Step 2 の実施条件を定義している
- [ ] `spec-update-summary.md` / `documentation-changelog.md` の出力要件を定義している
- [ ] `unassigned-task-detection.md` と `skill-feedback-report.md` を0件時も出力する要件を定義している
- [ ] Task 3.5 の実行証跡整合ガード（成果物実在/状態同期/台帳整合）を定義している
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 13: PR作成
