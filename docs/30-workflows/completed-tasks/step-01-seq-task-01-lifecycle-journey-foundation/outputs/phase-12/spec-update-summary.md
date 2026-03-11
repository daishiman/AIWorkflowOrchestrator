# 仕様更新サマリー

## Step 1-A

- 完了タスクとして current workflow の outputs / screenshots を作成
- code / test / screenshot の実体を current workflow に同期し、SkillCenterView の journey / surface ownership を実装へ揃えた
- `.claude` 正本と `.agents` mirror の両方で lifecycle 関連仕様の反映有無を確認
- `outputs/phase-12/phase12-task-spec-compliance-check.md` を追加し、Task 12-1〜12-5 と Step 1-A〜1-E / Step 2 の判定根拠を 1 ファイルへ集約した

## Step 1-B

- artifacts.json / index.md / phase files を completed へ更新
- workflow 本文 stale を残さない方針で同期

## Step 1-C

- Task01 の completed 記録を `.claude` / `.agents` の `task-workflow.md` へ反映
- `lessons-learned.md` / `architecture-overview.md` / `arch-state-management.md` / `ui-ux-navigation.md` / `ui-ux-feature-components.md` を current 実装に同期
- `task-specification-creator` の `phase-11-12-guide.md` に、representative surface は shell 全景より selector-based element capture を優先するルールを追加
- `task-specification-creator` の `unassigned-task-guidelines.md` と `phase12-task-spec-compliance-template.md` に、`current=0` でも `baseline>0` なら既存 backlog 参照を明記する運用を追記
- `skill-creator` の `patterns.md` / `phase12-task-spec-recheck-template.md` に、0件報告でも legacy backlog 参照を落とさない再監査パターンを追記

## Step 1-D

- `.claude` / `.agents` 両方の `resource-map.md` と `quick-reference.md` を更新
- `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行し、topic-map.md / keywords.json を再生成
- `node .agents/skills/aiworkflow-requirements/scripts/generate-index.js` を実行し、mirror 側 topic-map.md / keywords.json を再生成
- `node .agents/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation --regenerate` を実行し、workflow index を再生成
- `search-spec.js "skillLifecycleJourney"` を実地確認し、`.agents` 側の 0 件ヒットを解消した

## Step 1-E

- Phase 11 の discovered issues はすべて LOW で、Task01 の acceptance を崩さないため新規未タスクは 0 件
- `verify-unassigned-links` は `213 / 213`、`audit-unassigned-tasks --json --diff-from HEAD` は `currentViolations=0`, `baselineViolations=133`
- 指定ディレクトリ全体には `format=91 / naming=5 / misplaced=37` の legacy baseline が残るため、既存 backlog として `task-imp-unassigned-task-format-normalization-001.md` / `task-imp-unassigned-task-legacy-normalization-001.md` / `task-imp-phase12-unassigned-baseline-remediation-002.md` を参照先へ固定
- current task 由来で新規作成すべき未タスクはなく、既存 backlog 指示書のフォーマットと背景値だけを現況へ補正した

## Step 2

- 新規 reference ファイル追加は不要
- 既存仕様更新は必要
- 理由: `skillLifecycleJourney.ts` により navigation / feature responsibility / state ownership / architecture overview の説明が増え、SkillCenterView に surface ownership board が追加され、さらに `.agents` mirror 側で同内容を抽出できるように同期が必要だったため。加えて、Phase 12 0件報告時でも legacy backlog の参照を落とさない運用を skill 側へ反映する必要があったため
