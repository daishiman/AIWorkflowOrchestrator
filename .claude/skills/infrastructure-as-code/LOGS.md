# Infrastructure as Code - 使用履歴

このファイルは infrastructure-as-code スキルの使用履歴を記録します。

## 使用方法

各スキル実行後に `scripts/log_usage.mjs` を実行して記録を追加してください。

```bash
node .claude/skills/infrastructure-as-code/scripts/log_usage.mjs \
  --result success \
  --phase "Phase 1" \
  --agent "Infrastructure Architect" \
  --notes "環境変数設計を完了"
```

## 記録形式

各エントリは以下の形式で記録されます：

```markdown
## YYYY-MM-DD HH:mm:ss

- Phase: {{実行したフェーズ}}
- Agent: {{実行したTask/Agent}}
- Result: {{success/failure}}
- Duration: {{所要時間（分）}}
- Notes: {{詳細メモ、発見事項、改善点}}
```

---

## 2025-12-31 08:09:00

- Phase: Skill Setup
- Agent: System
- Result: success
- Duration: -
- Notes: スキルを18-skills.md仕様に準拠するよう更新。agents/ディレクトリにTask仕様書を追加（environment-design, secret-manager, railway-configurator, railway-validator）。EVALS.json、LOGS.md、CHANGELOG.mdを新規作成。

---

<!-- 新しいエントリはこの下に追加されます -->
