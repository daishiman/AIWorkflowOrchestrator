# Phase 12 同期確認チェックリスト

- 作成フェーズ: Phase 5
- 担当SubAgent: SubAgent-D

## Step 1: 仕様書更新前準備

- [ ] 更新対象ファイルを確定した
- [ ] baseline監査結果を記録した

## Step 2: 3点同期更新

- [ ] `task-workflow.md` の残課題テーブルを更新した
- [ ] `task-workflow.md` の完了タスクセクションを更新した
- [ ] `aiworkflow-requirements/SKILL.md` を更新した
- [ ] `task-specification-creator/SKILL.md` を更新した
- [ ] `aiworkflow-requirements/LOGS.md` を更新した
- [ ] `task-specification-creator/LOGS.md` を更新した

## Step 3: 索引再生成

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行した
- [ ] `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001 --regenerate` を実行した

## Step 4: リンク検証

- [ ] `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行した
- [ ] `ALL_LINKS_EXIST` を確認した

## Step 5: SKILL検証

- [ ] `quick_validate.py` で `aiworkflow-requirements` を検証した
- [ ] `quick_validate.py` で `task-specification-creator` を検証した
- [ ] 両方で `Skill is valid!` を確認した

## Step 6: 監査分離判定

- [ ] `audit-unassigned-tasks.js` の全体結果を記録した
- [ ] `detect-unassigned-tasks --scan <変更範囲>` の差分結果を記録した
- [ ] `baseline` と `current` を分離記録した
