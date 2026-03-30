# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 12                                      |
| 機能名 | step-ut-rt-06-esbuild-arch-mismatch-001 |
| 作成日 | 2026-03-29                              |

## 目的

環境修正と blocker 判定の current facts を same-wave で文書化し、Part 1 / Part 2 と compliance check を満たした close-out を完了する。

## 実行タスク

- 実装ガイドを作成する
- システム仕様更新と same-wave sync を完了する
- 更新履歴、未タスク、フィードバックを出力する
- task-spec 準拠チェックを記録する

| Task | タスク名               | 必須 | 概要                         |
| ---- | ---------------------- | ---- | ---------------------------- |
| 12-1 | 実装ガイド作成         | ✅   | Part 1 / Part 2 を満たす     |
| 12-2 | システム仕様更新       | ✅   | Step 1-A〜1-C と Step 2 判定 |
| 12-3 | ドキュメント更新履歴   | ✅   | same-wave の更新内容記録     |
| 12-4 | 未タスク検出           | ✅   | 0件でも出力必須              |
| 12-5 | スキルフィードバック   | ✅   | 改善点なしでも出力必須       |
| 12-6 | task-spec 準拠チェック | ✅   | Task 12-1〜12-5 を判定       |

## 参照資料

| 資料名           | パス                                                                                              | 説明                    |
| ---------------- | ------------------------------------------------------------------------------------------------- | ----------------------- |
| 要件定義         | `phase-1-requirements.md`                                                                         | AC 定義                 |
| 設計             | `phase-2-design.md`                                                                               | close-out 前提          |
| 実装             | `phase-5-implementation.md`                                                                       | 復旧結果の根拠          |
| テスト拡充       | `phase-6-test-expansion.md`                                                                       | 周辺確認結果            |
| カバレッジ確認   | `phase-7-coverage-check.md`                                                                       | coverage / blocker 判定 |
| リファクタリング | `phase-8-refactoring.md`                                                                          | 最終文面整理            |
| 品質保証         | `phase-9-quality-assurance.md`                                                                    | quality gate 結果       |
| 最終レビュー     | `phase-10-final-review.md`                                                                        | 判定ルール              |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md`                                                          | preflight 記録          |
| 発見課題一覧     | `outputs/phase-11/discovered-issues.md`                                                           | blocker / note          |
| 完了タスク台帳   | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                    | same-wave sync 先       |
| backlog 台帳     | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                      | 未タスク状態更新先      |
| 教訓             | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md` | close-out 規律          |

## 実行手順

### Step 1: Task 12-1 実装ガイド作成

- Part 1: 中学生向け説明、例え話、なぜ必要か
- Part 2: `EXPECTED_PLATFORM`、`pnpm install --force`、worktree preflight、トラブルシューティング

### Step 2: Task 12-2 システム仕様更新

#### Step 1-A: 完了タスク記録

- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` を更新
- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` の同一未タスク状態を更新
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` または family file に教訓を同期

#### Step 1-B: 実装状況テーブル更新

- current status を environment fix の事実に合わせて更新

#### Step 1-C: 関連タスク更新

- `UT-RT-06-ESBUILD-ARCH-MISMATCH-001` の状態を current facts に更新

#### Step 2: システム仕様更新の要否判断

- interface 変更がなければ N/A
- N/A でも根拠は `system-spec-update-summary.md` に残す

### Step 3: Task 12-3 更新履歴

`documentation-changelog.md` に更新ファイルと判断理由を記録する。

### Step 4: Task 12-4 未タスク検出

- Phase 10 の MINOR / MAJOR
- Phase 11 の blocker / note
- 0件でも summary を残す

### Step 5: Task 12-5 スキルフィードバック

改善点の有無にかかわらず記録する。

### Step 6: Task 12-6 準拠チェック

`outputs/phase-12/phase12-task-spec-compliance-check.md` に Task 12-1〜12-5 の PASS/FAIL と根拠を記録する。

## 統合テスト連携

- Phase 11 の current facts を転記する
- blocker が残る場合は PASS にしない

## 成果物

| 成果物                       | パス                                                     | 説明                   |
| ---------------------------- | -------------------------------------------------------- | ---------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2        |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | 更新内容の履歴         |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 0件でも出力            |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | 改善点または改善点なし |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2 の記録 |
| task-spec 準拠チェック       | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-5 の判定 |

## 完了条件

- [ ] implementation guide に Part 1 / Part 2 がある
- [ ] `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` と backlog 更新を same-wave で記録した
- [ ] `system-spec-update-summary.md` に Step 2 の要否判断を残した
- [ ] `documentation-changelog.md` を作成した
- [ ] `outputs/phase-12/unassigned-task-detection.md` を作成した
- [ ] `skill-feedback-report.md` を作成した
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` を作成した
- [ ] validation command が PASS した
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 13: PR 作成
