# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-UI-09-ONBOARDING-WIZARD |
| Phase | 12 |
| Phase名 | ドキュメント更新 |
| ステータス | completed |
| 前提Phase | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10, Phase 11 |
| 後続Phase | Phase 13 |

## 目的

実装結果、画面証跡、open item を workflow 本文と `.claude` 正本仕様へ同期し、未タスクまで formalize した状態で Phase 13 へ引き渡す。

## 実行タスク

- Task 12-1: implementation guide を Part 1 / Part 2 の 2部構成で作成する
- Task 12-2: `.claude/skills/aiworkflow-requirements/` 正本と workflow 本文を同期する
- Task 12-3: documentation-changelog を作成し、今回の更新対象と苦戦箇所を残す
- Task 12-4: 未タスクを検出し、formalize 後は `docs/30-workflows/unassigned-task/` で追跡できる状態にする
- Task 12-5: skill feedback を作成し、必要な skill 更新を反映する

## 参照資料

| 参照資料 | パス | 説明 |
| --- | --- | --- |
| Phase 1 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-1/` | 要件・AC・subagent 分担 |
| Phase 2 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-2/` | 設計一式 |
| Phase 5 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-5/` | 実装差分 |
| Phase 6 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-6/` | regression |
| Phase 7 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-7/` | coverage |
| Phase 8 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-8/` | refactor |
| Phase 9 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-9/` | quality |
| Phase 10 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-10/` | final review |
| Phase 11 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-11/` | screenshot と手動確認 |
| Verification | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/verification-report.md` | MINOR open item の判定根拠 |

### システム仕様（aiworkflow-requirements）

| 参照資料 | パス | 内容 |
| --- | --- | --- |
| task workflow | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | 完了台帳と未タスク同期 |
| feature catalog | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | onboarding feature 本文 |
| navigation contract | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md` | dashboard overlay / settings rerun 契約 |
| settings guide | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md` | rerun card と persist 契約 |
| lessons learned | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | 苦戦箇所と再利用手順 |

### 使用スキル

| スキル | パス | 用途 |
| --- | --- | --- |
| aiworkflow-requirements | `.claude/skills/aiworkflow-requirements/` | 正本仕様の反映先確定 |
| task-specification-creator | `.claude/skills/task-specification-creator/` | Phase 12 準拠確認と未タスク formalize |
| skill-creator | `.claude/skills/skill-creator/` | Phase 12 再監査パターンの再発防止改善 |

## 成果物

| 成果物 | パス |
| --- | --- |
| implementation-guide | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-12/implementation-guide.md` |
| spec-update-summary | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-12/spec-update-summary.md` |
| documentation-changelog | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-12/documentation-changelog.md` |
| unassigned-task-detection | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-12/unassigned-task-detection.md` |
| skill-feedback-report | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-12/skill-feedback-report.md` |
| phase12-task-spec-compliance-check | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-12/phase12-task-spec-compliance-check.md` |

## 実行結果

| Task | 結果 | 証跡 |
| --- | --- | --- |
| 12-1 実装ガイド | 完了 | `outputs/phase-12/implementation-guide.md` |
| 12-2 正本同期 | 完了 | `outputs/phase-12/spec-update-summary.md` |
| 12-3 更新履歴 | 完了 | `outputs/phase-12/documentation-changelog.md` |
| 12-4 未タスク検出 | 完了 | `outputs/phase-12/unassigned-task-detection.md` |
| 12-5 スキル改善 | 完了 | `outputs/phase-12/skill-feedback-report.md` |

## 完了条件

- [x] implementation guide が Part 1 / Part 2 の両方を満たしている
- [x] `.claude` 正本仕様、workflow 本文、artifacts が同期している
- [x] changelog、unassigned task、skill feedback、compliance check が出力されている

## 次Phase

Phase 13 は Phase 12 完了時点では保留とし、ユーザー明示承認後に別途実行する。
