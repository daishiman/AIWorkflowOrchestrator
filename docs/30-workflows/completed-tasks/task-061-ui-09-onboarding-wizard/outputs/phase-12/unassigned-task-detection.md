# Phase 12 Unassigned Task Detection

## 判定

- raw 候補は 3 件検出した。
- 精査後は 2 件を未タスク化した。
- Phase 13 は未タスク化対象ではなく、ユーザー承認後に本 workflow で実行する。

## 検出ソース

| ソース | 検出内容 |
| --- | --- |
| `outputs/verification-report.md` | function coverage 76.92%、`act(...)` warning、rerun 導線の発見性 |
| `outputs/phase-11/manual-test-result.md` | rerun card が full settings page 内で fold 下に落ちやすい |
| `outputs/phase-12/documentation-changelog.md` | Phase 12 で report 止まりになっていた follow-up 候補 |

## 精査結果

| 区分 | 内容 | 判定 |
| --- | --- | --- |
| test quality | function coverage 80% 未達と `act(...)` warning | 1 つのテスト hardening task に統合 |
| IA / discoverability | Settings rerun card が見つけにくい | 1 つの UI 改善 task として分離 |
| Phase 13 | commit / PR | ユーザー承認後に本 workflow で実行するため未タスク化しない |

## 作成した未タスク

| 未タスクID | 概要 | 配置先 |
| --- | --- | --- |
| UT-IMP-ONBOARDING-TEST-HARDENING-GUARD-001 | function coverage と `act(...)` warning の解消、Onboarding 回帰テスト hardening | `docs/30-workflows/unassigned-task/task-imp-onboarding-test-hardening-guard-001.md` |
| UT-IMP-SETTINGS-ONBOARDING-RERUN-DISCOVERABILITY-001 | Settings rerun card の配置・文言・視認性改善 | `docs/30-workflows/unassigned-task/task-imp-settings-onboarding-rerun-discoverability-001.md` |

## 配置確認メモ

- 今回差分の未タスクは `docs/30-workflows/unassigned-task/` 配下へ formalize した。
- 本体 workflow は `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/` のまま維持した。
- `verify-unassigned-links.js` は `missing=0`。
- `audit-unassigned-tasks.js --json --diff-from HEAD` は `currentViolations=0`、`baselineViolations=134`。
- legacy backlog の有無は validator 結果と分離して記録する。
