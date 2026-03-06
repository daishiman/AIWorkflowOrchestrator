# ドキュメント変更履歴

## 2026-03-06

### workflow / outputs 同期

- `phase-1..11` 仕様書本文に残っていた `ステータス=pending` / 未チェック完了条件 / `実行タスク結果=pending` を completed 実態へ同期
- `phase-12-documentation.md` の `ステータス=pending`、完了条件、実行タスク結果を実態に合わせて `completed` へ同期
- `artifacts.json` に `status=in_progress` / `currentPhase=12` を反映し、`outputs/artifacts.json` を新規同期
- `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core --regenerate` を再実行し、`index.md` の Phase 1-12 状態を completed ベースへ更新
- `outputs/phase-12/re-audit-report.md` と `outputs/phase-11/re-audit-visual-review.md` を最新状態のまま Phase 12 記録へ接続
- `outputs/phase-12/phase12-task-spec-compliance-check.md` を追加し、Task 12-1〜12-5 と workflow stale 是正の両方を準拠証跡として固定

### Step 1-A

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` に TASK-UI-02 再監査追補を追加
- `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md` に再監査追補を追加
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` に Phase 12 台帳ドリフトと mobileLabel 観点を追補
- `.claude/skills/aiworkflow-requirements/LOGS.md` / `.claude/skills/task-specification-creator/LOGS.md` / `.claude/skills/skill-creator/LOGS.md` に実行記録を追記

### Step 1-B

- `ui-ux-components.md` の TASK-UI-02 サマリーへ `mobileLabel` と Phase 12 台帳ドリフトを追記
- `ui-ux-feature-components.md` / `task-workflow.md` / `index.md` の completed 状態を現行実装へ整合

### Step 1-C

- `verify-unassigned-links` で `103/103` を確認
- `audit-unassigned-tasks --json --diff-from HEAD` で `currentViolations=0`, `baselineViolations=93` を記録
- 派生未タスク 2 件（domain UI spec 同期ガード / workflow 本文 stale ガード）を `completed-tasks/task-057-ui-02-global-nav-core/unassigned-task/` へ移管
- 各未タスクは `--unassigned-dir .../unassigned-task --target-file ...` 監査で `currentViolations=0`, `baselineViolations=22` を確認

### Step 2

- `ui-ux-navigation.md` に `mobileLabel` の正式仕様を維持
- `ui-ux-components.md` / `ui-ux-feature-components.md` に Global Navigation Core の実装完了・苦戦箇所・再監査追補を反映
- `directory-structure.md` に organisms / `uiSlice` の現行構成を反映
- `task-workflow.md` / `lessons-learned.md` に実装内容、苦戦箇所、簡潔解決手順を再同期

### skill / template 更新

- `task-specification-creator/references/phase-11-12-guide.md` に workflow index 再生成と `outputs/artifacts.json` 同期確認を追記
- `task-specification-creator/references/spec-update-workflow.md` に `index.md` stale と `phase-1..11` 本文 stale を誤判定パターンとして追加
- `skill-creator/references/patterns.md` と Phase 12 テンプレート 2件に workflow index / artifacts 二重同期に加え `phase-1..11` 本文同期チェックを追加

### 検証ログ

- `pnpm --dir apps/desktop typecheck` PASS
- `pnpm --dir apps/desktop test:run ...7 files...` PASS（100 tests）
- `pnpm --dir apps/desktop exec vite build --config vite.e2e.config.ts` PASS
- `validate-phase11-screenshot-coverage` PASS
- `validate-phase-output` PASS（28項目）
- `verify-all-specs` PASS（13/13）
- `verify-unassigned-links` PASS（103/103）
- `rg -n 'ステータス\\s*\\|\\s*pending' docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/phase-{1,2,3,4,5,6,7,8,9,10,11,12}-*.md` PASS（0件）
