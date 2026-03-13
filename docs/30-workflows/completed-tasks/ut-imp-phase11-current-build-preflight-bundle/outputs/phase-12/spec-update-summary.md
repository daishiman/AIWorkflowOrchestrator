# Phase 12 仕様更新サマリー

## canonical root

- 正本: `.claude/skills/**`
- mirror: `.agents/skills/**`

## 更新対象

| ファイル                                                                                              | 更新内容                                                                                                                    |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/workflow-light-theme-contrast-regression-guard.md` | preflight bundle 実装済みの導線、関連改善タスク参照先を current workflow へ更新                                             |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                  | 完了台帳 / 関連改善タスク / 変更履歴を更新                                                                                  |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                | preflight bundle の苦戦箇所と再利用手順を追加                                                                               |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                       | baseline routing と current workflow 参照先を更新                                                                           |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                                                      | 実施記録追加                                                                                                                |
| `.claude/skills/skill-creator/references/patterns.md`                                                 | Playwright browser preflight / serial failure simulation / `0 件報告` 時の related active backlog 再監査パターンを追加      |
| `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`                   | browser install preflight / serial failure simulation / related backlog `10見出し + target-file audit` の完了チェックを追加 |
| `.claude/skills/skill-creator/assets/phase12-spec-sync-subagent-template.md`                          | 仕様書別 SubAgent 実行ログテンプレートへ同ルールを追加                                                                      |
| `.claude/skills/skill-creator/references/resource-map.md`                                             | 上記 capability を入口から辿れる説明へ更新                                                                                  |
| `.claude/skills/skill-creator/LOGS.md`                                                                | template-refinement 実行ログを追加                                                                                          |
| `.claude/skills/skill-creator/SKILL.md`                                                               | changelog 追加                                                                                                              |
| `.claude/skills/task-specification-creator/LOGS.md`                                                   | Phase 11/12 実行記録追加                                                                                                    |
| `.claude/skills/aiworkflow-requirements/SKILL.md`                                                     | changelog 追加                                                                                                              |
| `.claude/skills/task-specification-creator/SKILL.md`                                                  | changelog 追加                                                                                                              |
| `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                           | same-day upstream evidence mirror 時の serial failure simulation ルールを追加                                               |
| `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                        | build/harness/baseUrl failure simulation の parallel 禁止条件を追加                                                         |
| `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`                  | 新規未タスク `0 件` でも related active backlog を `--target-file` + 10見出しで再監査するルールを追加                       |

## 仕様書別SubAgent実行ログ

| SubAgent   | 担当仕様書                                          | 実装内容の反映先                                                                                                         | 苦戦箇所の反映先                                                | 検証証跡                                                                           |
| ---------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| SubAgent-A | `workflow-light-theme-contrast-regression-guard.md` | current build preflight bundle の shared core / CLI / capture integration 追補                                           | browser install preflight、serial failure simulation            | `phase11-current-build-preflight*.test.ts`, `preflight:light-theme-contrast-guard` |
| SubAgent-B | `task-workflow.md`                                  | related row と current workflow completed 導線を同期                                                                     | shared artifact を壊す failure simulation の serial ルール      | `verify-all-specs --strict`, `validate-phase-output --phase 12`                    |
| SubAgent-C | `lessons-learned.md`                                | Playwright browser cache 欠落の復旧手順を教訓化                                                                          | UI regress 誤分類を防ぐ environment preflight ルール            | `screenshot:light-theme-contrast-guard` 再実行 PASS                                |
| SubAgent-D | `ui-ux-feature-components.md`                       | representative visual review と baseline routing を current workflow 正本へ更新                                          | light guard と remediation task の責務分離                      | `validate-phase11-screenshot-coverage 5/5 PASS`                                    |
| SubAgent-E | `skill-creator` patterns / templates / resource-map | Playwright browser preflight / serial failure simulation / related active backlog 再監査ルールを再利用テンプレートへ還元 | 画面再取得前提と `0 件報告` 時の related backlog 見落としを防止 | `quick_validate.js .claude/skills/skill-creator`                                   |

## 実行結果

- `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`: PASS
- `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/completed-tasks/ut-imp-phase11-current-build-preflight-bundle --regenerate`: PASS
- `rsync -a --checksum .claude/... .agents/...`: PASS
- `diff -qr .claude/... .agents/...`: 差分なし
- `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator`: PASS
- `pnpm --filter @repo/desktop screenshot:light-theme-contrast-guard`: 初回 FAIL（Playwright browser cache 欠落）→ `pnpm --filter @repo/desktop exec playwright install chromium` 実行 → 再実行 PASS
- `verify-all-specs --strict`: `13/13`, error `0`, warning `0`
- `validate-phase-output --phase 12`: `28項目 PASS`
- `validate-phase12-implementation-guide`: `10/10`
- `validate-phase11-screenshot-coverage --workflow docs/30-workflows/completed-tasks/ut-imp-phase11-current-build-preflight-bundle`: `expected TC=5 / covered TC=5`
- `verify-unassigned-links`: `221 / 221`
- `audit-unassigned-tasks --json --diff-from HEAD`: `currentViolations=0`, `baselineViolations=133`
- `audit-unassigned-tasks --json`: exit `1`, legacy backlog `133`（想定内）
- `rg -n '^## メタ情報$|^## [1-9]\\. ' docs/30-workflows/unassigned-task/task-fix-worktree-native-binary-guard-001.md`: `10見出し確認`
- `audit-unassigned-tasks --json --diff-from HEAD --target-file docs/30-workflows/unassigned-task/task-fix-worktree-native-binary-guard-001.md`: `currentViolations=0`, `baselineViolations=133`
- `audit-unassigned-tasks --json --diff-from HEAD --target-file docs/30-workflows/unassigned-task/task-imp-phase11-current-build-preflight-runner-guard-001.md`: `currentViolations=0`, `baselineViolations=133`

## workflow registry

- `artifacts.json` と `outputs/artifacts.json` を同期
- `index.md` を再生成して Phase 1-12 `completed`, Phase 13 `blocked` を反映

## 未更新でよいもの

- 新規 interface / type spec 本文の追加
  - 理由: 今回は script contract の内部実装であり、既存 architecture / workflow / lessons 更新で十分

## 2026-03-13 follow-up formalize

| ファイル                                                                                              | 更新内容                                                                                                                          |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `docs/30-workflows/unassigned-task/task-imp-phase11-current-build-preflight-runner-guard-001.md`      | Playwright browser preflight の fail-fast 化と destructive failure simulation の serial runner 化を未タスク指示書として formalize |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                  | `UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-RUNNER-GUARD-001` を関連未タスクへ追加                                                    |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                | 親タスクの苦戦箇所と follow-up 導線を追加                                                                                         |
| `.claude/skills/aiworkflow-requirements/references/workflow-light-theme-contrast-regression-guard.md` | current build screenshot task の follow-up row を追加                                                                             |

- follow-up task id: `UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-RUNNER-GUARD-001`
- source of struggle:
  - `browserType.launch: Executable doesn't exist` の environment preflight 化
  - shared artifact を壊す failure simulation の serial runner 化
