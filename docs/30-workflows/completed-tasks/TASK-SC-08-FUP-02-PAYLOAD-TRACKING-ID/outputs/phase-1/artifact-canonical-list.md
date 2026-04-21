# Phase 1 成果物: artifact canonical 一覧（artifact-canonical-list）

## 目的

`index.md` の Canonical Artifacts 表と `artifacts.json` を正本として、
Phase 1-13 全成果物の正本パスを一覧で固定する。
`artifacts.json` と `outputs/artifacts.json` の parity 方針を明示する。

## 正本パス一覧（Phase 1 - 13）

| Phase | 成果物                                                   |
| ----- | -------------------------------------------------------- |
| 1     | `outputs/phase-1/requirements-definition.md`             |
| 1     | `outputs/phase-1/current-implementation-audit.md`        |
| 1     | `outputs/phase-1/artifact-canonical-list.md`             |
| 2     | `outputs/phase-2/solution-design.md`                     |
| 2     | `outputs/phase-2/subagent-lane-plan.md`                  |
| 2     | `outputs/phase-2/validation-path.md`                     |
| 3     | `outputs/phase-3/design-review-result.md`                |
| 3     | `outputs/phase-3/solution-elegance-review.md`            |
| 3     | `outputs/phase-3/review-prompt.txt`                      |
| 4     | `outputs/phase-4/test-scenarios.md`                      |
| 4     | `outputs/phase-4/command-expectations.md`                |
| 5     | `outputs/phase-5/implementation-diff-plan.md`            |
| 5     | `outputs/phase-5/patch-plan.md`                          |
| 6     | `outputs/phase-6/regression-expansion-plan.md`           |
| 7     | `outputs/phase-7/coverage-report.md`                     |
| 8     | `outputs/phase-8/refactor-decision-log.md`               |
| 9     | `outputs/phase-9/quality-gate-report.md`                 |
| 10    | `outputs/phase-10/final-review-result.md`                |
| 11    | `outputs/phase-11/manual-test-result.md`                 |
| 11    | `outputs/phase-11/manual-test-checklist.md`              |
| 11    | `outputs/phase-11/discovered-issues.md`                  |
| 12    | `outputs/phase-12/implementation-guide.md`               |
| 12    | `outputs/phase-12/system-spec-update-summary.md`         |
| 12    | `outputs/phase-12/documentation-changelog.md`            |
| 12    | `outputs/phase-12/unassigned-task-detection.md`          |
| 12    | `outputs/phase-12/skill-feedback-report.md`              |
| 12    | `outputs/phase-12/phase12-task-spec-compliance-check.md` |
| 13    | `outputs/phase-13/local-check-result.md`                 |
| 13    | `outputs/phase-13/change-summary.md`                     |
| 13    | `outputs/phase-13/pr-info.md`                            |
| 13    | `outputs/phase-13/pr-creation-result.md`                 |

## Phase 依存関係（artifacts.json の `dependencies` セクションより）

| Phase | depends_on             |
| ----- | ---------------------- |
| 1     | （なし）               |
| 2     | 1                      |
| 3     | 1, 2                   |
| 4     | 1, 2, 3                |
| 5     | 4                      |
| 6     | 5                      |
| 7     | 5, 6                   |
| 8     | 5, 6, 7                |
| 9     | 5, 6, 7, 8             |
| 10    | 1, 2, 3, 5, 6, 7, 8, 9 |
| 11    | 10                     |
| 12    | 10, 11                 |
| 13    | 12                     |

## artifacts.json と outputs/artifacts.json の parity 方針

### 原則

本 task では **正本を task spec ルート直下の `artifacts.json`** とし、
`outputs/artifacts.json` は正本のミラーとして parity を維持する。

### parity 規則

1. **フィールド完全一致**: `phases[n].artifacts[]`、`dependencies`、`metadata` を完全一致させる
2. **更新タイミング**: Phase 完了ごとに `status` と `lastUpdated` を同時更新
3. **parity 検証**: Phase 12 の mandatory tasks 内で `diff artifacts.json outputs/artifacts.json` が空であることを確認
4. **Phase 13 ゲート**: `artifacts.json` parity 完了が Phase 13 進入条件

### 現状確認

- ルート側 `artifacts.json`: 作成済み（`docs/30-workflows/TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID/artifacts.json`）
- outputs 側 `artifacts.json`: 作成済み（`docs/30-workflows/TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID/outputs/artifacts.json`）
- 両者とも `feature: "TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID"` / `status: "not_started"` / `currentPhase: 0`

### metadata 正本

```json
{
  "taskType": "NON_VISUAL",
  "taskId": "TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID",
  "title": "skill-creator progress payload への planId / requestId 付与による混線防止",
  "issue": 2300,
  "issueState": "closed",
  "dependsOn": ["TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE"]
}
```

## ゲート対応表

| ゲート                  | Phase 遷移    | 成果物による担保                     |
| ----------------------- | ------------- | ------------------------------------ |
| 4条件修正方針 / AC 固定 | 1 → 2         | `phase-1/requirements-definition.md` |
| Runtime emit 方針決定   | 2 → 3         | `phase-2/solution-design.md`         |
| 4条件 PASS or 修正確定  | 3 → 4         | `phase-3/design-review-result.md`    |
| 品質全 PASS             | 9 → 10        | `phase-9/quality-gate-report.md`     |
| blocker 0 件            | 10 → 11       | `phase-10/final-review-result.md`    |
| mandatory 5 tasks 完了  | 12 → 13       | `phase-12/` 6 成果物                 |
| user 承認               | 13（blocked） | `phase-13/pr-creation-result.md`     |
