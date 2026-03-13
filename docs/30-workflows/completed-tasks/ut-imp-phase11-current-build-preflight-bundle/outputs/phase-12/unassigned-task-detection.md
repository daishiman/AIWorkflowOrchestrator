# Phase 12 未タスク検出レポート

## current / baseline を分離して記録する

### current 監査

- 判定: `PASS`
- 実行コマンド:
  - `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`
  - `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`
- 結果:
  - `verify-unassigned-links`: `total=221 / existing=221 / missing=0`
  - `audit --diff-from HEAD`: exit `0`, `currentViolations=0`, `baselineViolations=133`

### baseline 監査

- 判定: `legacy baseline only`
- 実行コマンド:
  - `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json`
- 結果:
  - exit `1` は想定内
  - scope 未指定の全体監査では `currentViolations=133`, `baselineViolations=0`
  - これは global `docs/30-workflows/unassigned-task/` の既存 legacy backlog であり、本 task 起因ではない

## 判定

- current workflow 起因の新規未タスク: `1 件`
- directory-wide legacy backlog: `133 件`
- follow-up formalize は `UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-RUNNER-GUARD-001` として完了

## related active open backlog 再確認

- 対象: `docs/30-workflows/unassigned-task/task-fix-worktree-native-binary-guard-001.md`
- 配置: 指定ディレクトリ `docs/30-workflows/unassigned-task/` に存在
- 形式: `rg -n '^## メタ情報$|^## [1-9]\\. ' ...` で `## メタ情報 + ## 1..9` を確認
- 監査: `audit --diff-from HEAD --target-file ...` は `currentViolations=0`, `baselineViolations=133`
- 結論: current task の related open backlog は task-spec フォーマット準拠で維持されている

## 追記事項

- 今回の baseline note は UI remediation 既知課題であり、本 task 起因の新規 backlog ではない
- `task-imp-phase11-current-build-preflight-bundle-001.md` の削除は user 側既存差分であり、completed workflow `docs/30-workflows/completed-tasks/ut-imp-phase11-current-build-preflight-bundle/` を正本として扱った
- `current=0` と `related active open backlog の format 準拠` は別判定として記録した

## 2026-03-13 follow-up formalize

- formalized unassigned task: `UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-RUNNER-GUARD-001`
- 配置先: `docs/30-workflows/unassigned-task/task-imp-phase11-current-build-preflight-runner-guard-001.md`
- 発見根拠:
  - Playwright browser cache 欠落が capture 本体まで遅延し、`browserType.launch: Executable doesn't exist` を UI regress と誤読しやすかった
  - shared `out/renderer` を壊す failure simulation は serial 実行が必須だが、runner 契約までは昇格していない
- 追加で system spec に反映した先:
  - `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
  - `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
  - `.claude/skills/aiworkflow-requirements/references/workflow-light-theme-contrast-regression-guard.md`
