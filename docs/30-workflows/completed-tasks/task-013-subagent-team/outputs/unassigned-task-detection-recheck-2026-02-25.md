# 未タスク再検出レポート（2026-02-25）

## 実行目的

TASK-013 再監査後に、未タスク管理台帳と実ファイル参照が整合しているかを再確認する。

## 実行コマンド

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js --scan docs/30-workflows/completed-tasks/task-013-subagent-team --output .tmp/unassigned-candidates-task013-docs-recheck.json
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js --scan apps/desktop/src --output .tmp/unassigned-candidates-task013-recheck.json
```

## 結果

- 判定: `ALL_LINKS_EXIST`
- 集計: 91 / 91 リンク存在
- 差分監査（`docs/30-workflows/completed-tasks/task-013-subagent-team`）: 未タスク候補 **0件**
- ベースライン監査（`apps/desktop/src`）: TODO **20件**（既存バックログ）

## 再評価判定

`UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001` は未着手タスクとして継続せず、再評価クローズへ変更した。

- 理由: `skill:get-detail` の `skillId` は、実装上ID検索契約（`getSkillById`）と一致
- 反映先:
  - `docs/30-workflows/unassigned-task/task-skill-getdetail-naming-drift.md`
  - `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
  - `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

## 結論

未タスク台帳の参照整合は問題なし。差分範囲で新規未タスクは検出されず、既存ベースラインTODOのみが継続対象。今回の追加是正により「実課題」と「誤検知クローズ」の区別が台帳上で明確化された。
