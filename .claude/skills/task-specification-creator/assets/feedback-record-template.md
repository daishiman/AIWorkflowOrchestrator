# スキルフィードバック記録テンプレート

## 記録情報

| 項目      | 値              |
| --------- | --------------- |
| 記録日    | {{日付}}        |
| 機能名    | {{機能名}}      |
| 実行Phase | {{PhaseNumber}} |
| 実行者    | Claude Code     |

## 使用スキル一覧

{{#each usedSkills}}

### {{this.name}}

| 項目     | 結果                                      |
| -------- | ----------------------------------------- |
| 結果     | {{this.result}} (success/failure/partial) |
| 有用性   | {{this.usefulness}} (high/medium/low)     |
| 問題     | {{this.issues}}                           |
| 改善提案 | {{this.proposals}}                        |

{{/each}}

## フィードバック要約

### 成功したパターン

{{#each successPatterns}}

- **{{this.skill}}**: {{this.pattern}}
  {{/each}}

### 改善が必要なパターン

{{#each improvementPatterns}}

- **{{this.skill}}**: {{this.issue}}
  - 提案: {{this.proposal}}
    {{/each}}

## LOGS.md更新コマンド

以下のコマンドでスキルのLOGS.mdを更新:

{{#each usedSkills}}

```bash
node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill {{this.name}} \
  --result {{this.result}} \
  --phase {{../PhaseNumber}} \
  --notes "{{this.notes}}"
```

{{/each}}

## SKILL.md改善判定

| スキル名 | 改善必要 | 理由 | 優先度 |
| -------- | -------- | ---- | ------ |

{{#each usedSkills}}
| {{this.name}} | {{this.needsImprovement}} | {{this.improvementReason}} | {{this.priority}} |
{{/each}}

### 改善基準

スキル改善が必要な条件:

- 同じ問題が3回以上発生
- 実行結果がfailureまたはpartial
- 有用性がlowと評価
- 明確な改善提案がある

## 次のアクション

{{#each nextActions}}

- [ ] {{this}}
      {{/each}}

---

**記録完了後**: このフィードバックを元に、必要に応じて`skill-creator`スキルでSKILL.mdを更新してください。
