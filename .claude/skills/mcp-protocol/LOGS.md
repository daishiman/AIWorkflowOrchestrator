# MCP Protocol スキル使用履歴

## 概要

このファイルはmcp-protocolスキルの使用履歴を記録します。各実行の成功/失敗、フィードバック、改善提案を蓄積し、継続的な改善に活用します。

## 使用方法

スキル実行後、以下のコマンドで記録を追加してください：

```bash
node .claude/skills/mcp-protocol/scripts/log_usage.mjs \
  --result success \
  --phase "analyze-requirements" \
  --agent "Andrew Hunt" \
  --notes "MCP統合の要件分析を完了。接続方式としてcommandを選定。"
```

## 記録形式

各エントリは以下の形式で記録されます：

```markdown
### YYYY-MM-DD HH:MM:SS

- Result: success / failure
- Phase: {{phase-name}}
- Agent: {{agent-name}}
- Notes: {{feedback-notes}}
```

---

## 履歴

<!-- ログエントリはここに追記されます -->
<!-- scripts/log_usage.mjsが自動的に追記します -->
