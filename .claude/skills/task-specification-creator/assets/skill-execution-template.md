# {{Phase名}} - スキル実行指示

## Phase情報

| 項目   | 値              |
| ------ | --------------- |
| Phase  | {{PHASE_NUMBER}} |
| 名称   | {{PHASE_NAME}}   |
| 機能名 | {{FEATURE_NAME}} |
| 作成日 | {{CREATED_DATE}} |

## 使用スキル

{{#each skills}}

### {{this.name}}

**目的**: {{this.purpose}}

**実行方法**:

```
SKILL.mdを読み込み、{{this.name}}スキルを参照して実行
パス: .claude/skills/{{this.name}}/SKILL.md
```

**期待される成果物**:
{{#each this.outputs}}

- {{this}}
  {{/each}}
  {{/each}}

## 参照資料

| 参照資料 | パス | 内容 |
| -------- | ---- | ---- |

{{#each references}}
| {{this.name}} | {{this.path}} | {{this.description}} |
{{/each}}

## 実行前チェックリスト

- [ ] 前Phaseの成果物を確認した
- [ ] 参照資料をすべて読んだ
- [ ] 使用スキルのSKILL.mdを確認した
- [ ] 成果物の出力先を確認した

## 実行手順

{{#each steps}}

### ステップ {{@index}}: {{this.name}}

{{this.description}}

**使用スキル**: {{this.skill}}

**完了条件**:
{{#each this.criteria}}

- [ ] {{this}}
      {{/each}}
      {{/each}}

## 成果物

| 成果物 | パス | 説明 |
| ------ | ---- | ---- |

{{#each outputs}}
| {{this.name}} | {{this.path}} | {{this.description}} |
{{/each}}

## 完了条件

{{#each completionCriteria}}

- [ ] {{this}}
      {{/each}}

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックを記録済み

## 次のPhase

- **次Phase**: {{nextPhase.name}}
- **ファイル**: {{nextPhase.file}}
- **開始条件**: このPhaseの完了条件をすべて満たすこと

---

**注意**: このファイルはそのままClaude Codeにコピー&ペーストして実行できます。
