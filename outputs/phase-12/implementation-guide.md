# 実装ガイド

- タスクID: UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001
- 作成日: 2026-02-25
- 担当SubAgent: SubAgent-D

## Part 1: 中学生向け説明（たとえ話）

Phase 12 の同期は「図書館の本と目録カードの一致確認」に似ています。

- 本を別の棚へ移したら、目録カードも同時に移さないと、探す人が迷います。
- このタスクでは「本」= 実際のファイル、「目録カード」= `task-workflow.md` / `SKILL.md` / `LOGS.md` です。
- 3つのカードを同時に直すことで、「終わったはずなのに参照だけ古い」状態を防ぎます。

`baseline` と `current` の違い:

- baseline: もともと棚にあった古い不整合
- current: 今回の作業で新しく作ってしまった不整合

今回直すべきなのは current です。baseline は「既存課題」として別に記録します。

## Part 2: 技術者向け手順

### 1. 実行順序（3点同期）

1. `task-workflow.md`
2. `SKILL.md` x2
3. `LOGS.md` x2（最後）

### 2. 検証コマンド3種

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001 --regenerate
python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py .claude/skills/aiworkflow-requirements
python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py .claude/skills/task-specification-creator
```

期待出力:

- verify: `ALL_LINKS_EXIST`
- index: 再生成成功
- validate: `Skill is valid!`（2件）

### 3. 更新対象ファイル

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/task-specification-creator/references/phase-templates.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/aiworkflow-requirements/SKILL.md`
- `.claude/skills/task-specification-creator/SKILL.md`
- `.claude/skills/aiworkflow-requirements/LOGS.md`
- `.claude/skills/task-specification-creator/LOGS.md`

### 4. 再発防止策（P1/P2/P3/P4/P25/P27/P29）

- P1/P25: LOGS 2ファイルを同時更新
- P2/P27: 仕様変更時は必ず index 再生成
- P3: 苦戦箇所は3ステップで未タスク化
- P4: documentation-changelog に「完了」を先に書かない
- P29: SKILL 2ファイルの変更履歴を同時更新
