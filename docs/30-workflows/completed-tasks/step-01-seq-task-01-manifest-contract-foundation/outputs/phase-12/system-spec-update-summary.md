# Phase 12: システム仕様更新サマリー

## メタ情報

| 項目               | 内容                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------- |
| タスクID           | TASK-SDK-01                                                                           |
| 更新日             | 2026-03-26                                                                            |
| 対象 workflow      | `docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation/` |
| follow-up workflow | `docs/30-workflows/completed-tasks/task-sdk-01-phase12-compliance-sync/`              |

## Step 1-A: ledger sync

| ファイル                                                                                          | 更新内容                                                                                                             |
| ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                      | `UT-IMP-TASK-SDK-01-PHASE12-COMPLIANCE-SYNC-001` を完了扱いへ更新し、backlog に未解決として残さないよう是正する      |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                    | follow-up workflow の completed entry を追加し、親 TASK-SDK-01 側の Phase 12 未タスク記述を current facts に同期する |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md` | Phase 12 status drift と docs-only Phase 11 validator 互換の教訓を追記する                                           |

## Step 1-B: workflow / outputs sync

| ファイル                                                 | 更新内容                                                                                       |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `index.md`                                               | `artifacts.json` の Phase 12=`completed` / Phase 13=`blocked` に合わせて再生成する             |
| `phase-11-manual-test.md`                                | NON_VISUAL task でも validator 互換の placeholder PNG を補助成果物として保存する方針へ同期する |
| `phase-12-documentation.md`                              | Step 1-A の `LOGS.md` / `SKILL.md` 更新対象表現を曖昧語なしへ是正する                          |
| `outputs/phase-11/manual-test-checklist.md`              | placeholder PNG が UI レビュー用途ではないことを追記する                                       |
| `outputs/phase-11/manual-test-result.md`                 | `validator 互換用 placeholder` を画像証跡欄へ記録する                                          |
| `outputs/phase-11/discovered-issues.md`                  | placeholder 保存後も視覚課題 0 件であることを記録する                                          |
| `outputs/phase-11/screenshot-plan.json`                  | docs-only walkthrough 向けの validator compatibility plan を追加する                           |
| `outputs/phase-12/implementation-guide.md`               | Part 1/Part 2、使用例、設定と定数、Phase 12 validator 実測を current facts へ再構成する        |
| `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜Step 2 の実更新 / no-op を file 単位で明文化する                                     |
| `outputs/phase-12/documentation-changelog.md`            | 更新ファイル一覧、validator 実測、4点同期を記録する                                            |
| `outputs/phase-12/unassigned-task-detection.md`          | close-out drift follow-up の解消済み状態と carry-forward 0 件を切り分けて記録する              |
| `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-5 と validator 結果を実測値で再記録する                                          |
| `outputs/phase-12/skill-feedback-report.md`              | close-out 再発防止の改善提案を記録する                                                         |

## Step 1-C: 関連タスク整理

| 区分   | タスク                                            | 扱い                                                                             |
| ------ | ------------------------------------------------- | -------------------------------------------------------------------------------- |
| 解消   | `UT-IMP-TASK-SDK-01-PHASE12-COMPLIANCE-SYNC-001`  | 本 follow-up workflow で完了へ移行                                               |
| 解消   | `task-imp-manifest-loader-contract-hardening-001` | `UT-IMP-TASK-SDK-01-PHASE12-COMPLIANCE-SYNC-001` の runtime contract sync に吸収 |
| 再利用 | native binary / `esbuild` mismatch tracker        | 既存 tracker を再利用し、重複 formalize は行わない                               |

## Step 1-D: discovery / tooling sync

- `.claude/skills/task-specification-creator/scripts/generate-index.js` を配列 / オブジェクト両対応へ更新し、Phase status 再生成で Phase 12/13 drift が再発しないよう是正した
- `generate-index.test.mjs` を追加し、配列形式 `artifacts.json` からの `index.md` 再生成を固定した
- `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行し、`topic-map.md` / `keywords.json` を再生成する

## Step 1-E: 検証

| コマンド                                                                                                                                                                                                      | 結果                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `node --test .claude/skills/task-specification-creator/scripts/__tests__/generate-index.test.mjs`                                                                                                             | PASS（2/2）                   |
| `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation --regenerate`                         | PASS                          |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation --strict`                           | PASS（error 0, warning 0）    |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation`                                          | PASS（warning 0）             |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation`               | PASS（10/10）                 |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-sdk-01-phase12-compliance-sync-001.md` | `currentViolations.total = 0` |

## Step 2: domain spec sync 判定

### 判定

**本文追記なし**

### 理由

- `WorkflowManifest*` / `ManifestLoader` の domain contract は着手前から current facts だった
- 今回の差分は Phase 12 の監査証跡密度と `generate-index.js` の status 再生成ロジックの是正が中心で、manifest domain 自体の public contract は増減していない
- したがって Step 2 は no-op ではなく、「domain spec 本文は current のため追記不要、同時に ledger / lessons / tooling を same-wave で閉じた」と記録する
