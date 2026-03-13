# Phase 12 documentation changelog

## Step 1-A: canonical root / LOGS / SKILL / mirror

- canonical root: `.claude/skills/**`
- 更新対象:
  - `.claude/skills/aiworkflow-requirements/LOGS.md`
  - `.claude/skills/task-specification-creator/LOGS.md`
  - `.claude/skills/skill-creator/LOGS.md`
  - `.claude/skills/aiworkflow-requirements/SKILL.md`
  - `.claude/skills/task-specification-creator/SKILL.md`
  - `.claude/skills/skill-creator/SKILL.md`
  - `.claude/skills/aiworkflow-requirements/references/workflow-light-theme-contrast-regression-guard.md`
  - `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
  - `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
  - `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
  - `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
  - `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
  - `.claude/skills/skill-creator/references/patterns.md`
  - `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`
  - `.claude/skills/skill-creator/assets/phase12-spec-sync-subagent-template.md`
  - `.claude/skills/skill-creator/references/resource-map.md`
- mirror drift:
  - `rsync -a --checksum` で `.agents/skills/**` へ同期
  - `diff -qr` は 3 skill root とも差分なし

## Step 1-B: 実装状況テーブル

- 判定: `completed`
- 理由: Phase 4-12 の成果物とコード実装、test/build/manual verification が揃ったため

## Step 1-C: 関連タスク表

- `UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-BUNDLE-001` の参照先を、削除済み `unassigned-task` から completed workflow `docs/30-workflows/completed-tasks/ut-imp-phase11-current-build-preflight-bundle/index.md` へ正規化した
- parent guard spec / task-workflow / lessons / feature catalog の related row も同値で更新した

## Step 1-D: index / 台帳再生成

- 実行済み:
  - `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`
  - `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/completed-tasks/ut-imp-phase11-current-build-preflight-bundle --regenerate`
- `artifacts.json` と `outputs/artifacts.json` は同一内容へ同期済み
- workflow `index.md` は Phase 1-12 `完了`, Phase 13 `blocked` に再生成済み

## Step 1-E: 未タスク監査

- 今回 task 由来の新規未タスクは `1 件`
- 実測:
  - `verify-unassigned-links`: `221 / 221`
  - `audit --diff-from HEAD`: `currentViolations=0`, `baselineViolations=133`
  - `audit --json`: exit `1`, legacy backlog `133`
- related active open backlog 再確認:
  - `docs/30-workflows/unassigned-task/task-fix-worktree-native-binary-guard-001.md` が指定ディレクトリに存在
  - `rg -n '^## メタ情報$|^## [1-9]\\. ' ...` で `## メタ情報 + ## 1..9` を確認
  - `audit --diff-from HEAD --target-file docs/30-workflows/unassigned-task/task-fix-worktree-native-binary-guard-001.md` は `currentViolations=0`, `baselineViolations=133`
  - 新規 follow-up `docs/30-workflows/unassigned-task/task-imp-phase11-current-build-preflight-runner-guard-001.md` も `audit --diff-from HEAD --target-file ...` で `currentViolations=0`, `baselineViolations=133`

## Step 2: 条件付き本文更新

- 更新あり: workflow / task-workflow / lessons / feature catalog / skill logs / skill changelog / task-spec Phase 11-12 guide / task-spec spec update workflow / task-spec unassigned guideline / skill-creator patterns / skill-creator templates / skill-creator resource-map
- 追補: Playwright browser cache 欠落は UI regress と誤分類せず、environment preflight として `workflow-light-theme-contrast-regression-guard.md` / `lessons-learned.md` / `phase-11-12-guide.md` / `spec-update-workflow.md` に復旧手順を追加した
- 追補: user 要求に合わせて `skill-creator` も更新し、`references/patterns.md` / template 2種 / `references/resource-map.md` に browser install preflight と serial failure simulation の再利用ルールを追加した
- 追補: screenshot 実体だけでは `validate-phase11-screenshot-coverage` は通らず、`phase-11-manual-test.md` の `テストケース` / `画面カバレッジマトリクス` と `manual-test-result.md` の TC 対応が必要なことを system spec 側へ反映した
- 更新不要: 新規 interface / API 本文

## Phase 11 source evidence

- parent workflow に生成された screenshot / metadata を current workflow `outputs/phase-11/` へ mirror した
- current workflow 側には same-day upstream evidence として記録した
- Apple UI/UX 視覚レビューは current workflow copy に対して 2026-03-13 JST に実施した
- 初回再撮影は Playwright browser cache 欠落で失敗し、`pnpm --filter @repo/desktop exec playwright install chromium` 後の再取得 evidence を正本にした
- current workflow `phase-11-manual-test.md` / `manual-test-result.md` に `TC-11-01`〜`TC-11-05` と coverage matrix を補完し、`validate-phase11-screenshot-coverage` を `5/5 PASS` まで回復した

## 2026-03-13 follow-up: unassigned task formalize

- `UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-RUNNER-GUARD-001` を `docs/30-workflows/unassigned-task/` に追加した
- 親タスクで苦戦した `browserType.launch: Executable doesn't exist` と destructive failure simulation の serial 運用を、runner hardening の follow-up として切り出した
- `task-workflow.md` / `lessons-learned.md` / `workflow-light-theme-contrast-regression-guard.md` に同じ未タスク ID を登録し、system spec 正本の導線を追加した
