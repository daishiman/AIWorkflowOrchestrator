# Phase 13: PR作成準備

## メタ情報

| 項目      | 値                                      |
| --------- | --------------------------------------- |
| Phase番号 | 13                                      |
| 機能名    | ChatView エラーサイレント握りつぶし修正 |
| タスクID  | TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE  |
| 作成日    | 2026-03-20                              |
| 前Phase   | `phase-12-documentation.md`             |

## 目的

全 Phase の成果物とローカル検証結果を最終確認し、user の明示承認が来たときだけ commit / PR に進める状態へ整える。承認前は `blocked` のまま閉じる。

## 実行タスク

- Task 1: 成果物とローカル検証結果を整理する。
- Task 2: PR 情報を下書きとして記録する。
- Task 3: user 承認前は commit / push / PR 作成を実行しない。

### Task 1: 成果物の最終確認

| 成果物               | 確認内容                                                                            |
| -------------------- | ----------------------------------------------------------------------------------- |
| Phase 1〜13 仕様書   | canonical task dir 配下に全 Phase が揃っている                                      |
| Phase 12 成果物 6 種 | `outputs/phase-12/` に正式ファイル名で揃っている                                    |
| 実装差分             | Task 01 の対象ファイルと spec の記述が一致している                                  |
| 未タスク             | `outputs/phase-12/unassigned-task-detection.md` と実際の backlog 配置が一致している |

### Task 2: ローカル検証結果を固定する

`outputs/phase-13/local-check-results.md` に、実行したコマンド、PASS/FAIL、未実行理由を記録する。

### Task 3: PR 情報の下書きを作成する

`outputs/phase-13/pr-info.md` に以下を記録する。

- 予定PRタイトル
- Summary
- Test Plan
- user 承認待ちであること

### Task 4: blocked 判定を明記する

承認前は commit / push / PR 作成を行わない。必要であれば `outputs/phase-13/change-summary.md` に「次に user 承認が必要な操作」を記録する。

## 参照資料

| 資料名                   | パス                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| Phase 2 設計書           | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-2-design.md`            |
| Phase 5 実装             | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-5-implementation.md`    |
| Phase 6 テスト拡充       | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-6-test-expansion.md`    |
| Phase 7 カバレッジ確認   | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-7-coverage-check.md`    |
| Phase 8 リファクタリング | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-8-refactoring.md`       |
| Phase 9 品質保証         | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-9-quality-assurance.md` |
| Phase 10 最終レビュー    | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-10-final-review.md`     |
| Phase 11 手動テスト      | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-11-manual-test.md`      |
| Phase 12 ドキュメント    | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-12-documentation.md`    |
| execute-workflow         | `.claude/skills/task-specification-creator/references/execute-workflow.md`                 |
| Git ツーリングルール     | `.claude/rules/07-git-and-tooling.md`                                                      |

## 実行手順

### Step 1: 成果物を確認する

Phase 12 までの成果物と validator 結果を確認する。

### Step 2: ローカル検証結果を記録する

```bash
git status --short
git branch --show-current
```

必要な test / lint / typecheck を実行した場合は結果を `outputs/phase-13/local-check-results.md` に記録する。

### Step 3: PR 情報を下書きし、blocked で停止する

user の明示承認があるまで commit / PR 作成には進まない。

## 成果物

| 成果物                        | パス                                                                                                  |
| ----------------------------- | ----------------------------------------------------------------------------------------------------- |
| Phase 13 仕様書（本ファイル） | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-13-pr-creation.md`                 |
| local check results           | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-13/local-check-results.md` |
| change summary                | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-13/change-summary.md`      |
| PR info draft                 | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-13/pr-info.md`             |

## 完了条件

- [ ] 全 Phase の成果物が存在することを確認した
- [ ] `outputs/phase-13/local-check-results.md` を作成した
- [ ] `outputs/phase-13/pr-info.md` に PR 下書きを記録した
- [ ] user 承認待ちのため blocked で停止することを明記した
- [ ] user の明示承認なしに commit / PR を作成していない

## タスク完了

user 承認待ち。承認後にのみ commit / PR 作成へ進む。
