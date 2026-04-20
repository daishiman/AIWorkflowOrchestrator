# Artifact Canonical 一覧

## 命名原則

- Phase 番号プレフィックス付きディレクトリ: `outputs/phase-{N}/`
- ファイル名は kebab-case
- 拡張子は `.md`（`review-prompt.txt` のみ例外）

## Phase 別 Canonical Artifact 一覧

| Phase | 成果物ファイル                                           | 状態        |
| ----- | -------------------------------------------------------- | ----------- |
| 1     | `outputs/phase-1/requirements-definition.md`             | ✓ canonical |
| 1     | `outputs/phase-1/current-implementation-audit.md`        | ✓ canonical |
| 1     | `outputs/phase-1/artifact-canonical-list.md`             | ✓ canonical |
| 2     | `outputs/phase-2/solution-design.md`                     | ✓ canonical |
| 2     | `outputs/phase-2/subagent-lane-plan.md`                  | ✓ canonical |
| 2     | `outputs/phase-2/validation-path.md`                     | ✓ canonical |
| 3     | `outputs/phase-3/design-review-result.md`                | ✓ canonical |
| 3     | `outputs/phase-3/solution-elegance-review.md`            | ✓ canonical |
| 3     | `outputs/phase-3/review-prompt.txt`                      | ✓ canonical |
| 4     | `outputs/phase-4/test-scenarios.md`                      | ✓ canonical |
| 4     | `outputs/phase-4/command-expectations.md`                | ✓ canonical |
| 5     | `outputs/phase-5/implementation-diff-check.md`           | ✓ canonical |
| 5     | `outputs/phase-5/patch-plan.md`                          | ✓ canonical |
| 6     | `outputs/phase-6/regression-expansion-plan.md`           | ✓ canonical |
| 7     | `outputs/phase-7/coverage-report.md`                     | ✓ canonical |
| 8     | `outputs/phase-8/refactor-decision-log.md`               | ✓ canonical |
| 9     | `outputs/phase-9/quality-gate-report.md`                 | ✓ canonical |
| 10    | `outputs/phase-10/final-review-result.md`                | ✓ canonical |
| 11    | `outputs/phase-11/manual-test-result.md`                 | ✓ canonical |
| 11    | `outputs/phase-11/manual-test-checklist.md`              | ✓ canonical |
| 11    | `outputs/phase-11/discovered-issues.md`                  | ✓ canonical |
| 12    | `outputs/phase-12/implementation-guide.md`               | ✓ canonical |
| 12    | `outputs/phase-12/system-spec-update-summary.md`         | ✓ canonical |
| 12    | `outputs/phase-12/documentation-changelog.md`            | ✓ canonical |
| 12    | `outputs/phase-12/unassigned-task-detection.md`          | ✓ canonical |
| 12    | `outputs/phase-12/skill-feedback-report.md`              | ✓ canonical |
| 12    | `outputs/phase-12/phase12-task-spec-compliance-check.md` | ✓ canonical |
| 13    | `outputs/phase-13/local-check-result.md`                 | ✓ canonical |
| 13    | `outputs/phase-13/change-summary.md`                     | ✓ canonical |
| 13    | `outputs/phase-13/pr-info.md`                            | user 承認後 |
| 13    | `outputs/phase-13/pr-creation-result.md`                 | user 承認後 |

## artifacts.json との parity チェック

- `artifacts.json` (root): 全 phase の canonical 名を登録済み
- `outputs/artifacts.json`: 実行状態を記録（pendng → completed）
- 両ファイルの artifact 名が一致していることが AC-5 の要件

## 非 canonical 名（削除対象）

以下は旧仕様の artifact 名であり使用しない:

| 旧名                                  | 理由                |
| ------------------------------------- | ------------------- |
| `*-report.md` と `*-result.md` の混在 | canonical 名に統一  |
| `createdByThisRun` 関連文書           | 実装実態と乖離      |
| `finally-cleanup-plan.md`             | 実装は catch で実行 |
