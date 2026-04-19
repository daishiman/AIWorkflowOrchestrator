# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 12                                    |
| 機能名 | TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001 |
| 作成日 | 2026-04-19                            |

## 目的

implementation guide、system spec update summary、documentation changelog、unassigned detection、
skill feedback、phase12 compliance-check を same-wave で閉じる。

## 実行タスク

1. `implementation-guide.md` を 2 パート構成で作成する
2. `system-spec-update-summary.md` に current facts / ledger / parity を記録する
3. `documentation-changelog.md` に変更ファイルと validator 実測を残す
4. `unassigned-task-detection.md` に follow-up の有無を残す
5. `skill-feedback-report.md` に skill 改善点を残す
6. `phase12-task-spec-compliance-check.md` で Task 1〜5 の完了を束ねる

## 参照資料

| 資料                         | パス                                                                                              | 用途             |
| ---------------------------- | ------------------------------------------------------------------------------------------------- | ---------------- |
| phase 12 guide               | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`            | canonical output |
| task workflow completed      | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                    | close-out 記録   |
| cancel lessons learned       | `.claude/skills/aiworkflow-requirements/references/lessons-learned-skill-cancel-abortsignal.md`   | current facts    |
| cancel chain lessons learned | `.claude/skills/aiworkflow-requirements/references/lessons-learned-skill-creator-cancel-chain.md` | current facts    |
| aiworkflow LOGS              | `.claude/skills/aiworkflow-requirements/LOGS.md`                                                  | same-wave sync   |
| task-spec LOGS               | `.claude/skills/task-specification-creator/LOGS.md`                                               | same-wave sync   |

## 実行手順

### Step 1: canonical 成果物

| Task | 成果物                                                   |
| ---- | -------------------------------------------------------- |
| 12-1 | `outputs/phase-12/implementation-guide.md`               |
| 12-2 | `outputs/phase-12/system-spec-update-summary.md`         |
| 12-3 | `outputs/phase-12/documentation-changelog.md`            |
| 12-4 | `outputs/phase-12/unassigned-task-detection.md`          |
| 12-5 | `outputs/phase-12/skill-feedback-report.md`              |
| 12-6 | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

### Step 2: same-wave sync 対象

- `artifacts.json`
- `outputs/artifacts.json`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-skill-cancel-abortsignal.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-skill-creator-cancel-chain.md`
- `.claude/skills/aiworkflow-requirements/LOGS.md`
- `.claude/skills/task-specification-creator/LOGS.md`
- `.claude/skills/aiworkflow-requirements/scripts/generate-index.js` 実行結果

### Step 3: NON_VISUAL 固定文

`implementation-guide.md` と `system-spec-update-summary.md` に次の文を入れる。

`UI/UX変更なしのため Phase 11 スクリーンショット不要`

## 統合テスト連携

- Phase 11 の manual test report を Phase 12 の root evidence として参照する
- Phase 12 compliance-check は Task 12-1〜12-6 の完了後にのみ作成する

## 成果物

- `outputs/phase-12/implementation-guide.md`
- `outputs/phase-12/system-spec-update-summary.md`
- `outputs/phase-12/documentation-changelog.md`
- `outputs/phase-12/unassigned-task-detection.md`
- `outputs/phase-12/skill-feedback-report.md`
- `outputs/phase-12/phase12-task-spec-compliance-check.md`

## 完了条件

- [x] 6 つの canonical 成果物が列挙されている
- [x] same-wave sync 対象がファイル名で明記されている
- [x] `spec-update-summary.md` ではなく `system-spec-update-summary.md` に統一されている
