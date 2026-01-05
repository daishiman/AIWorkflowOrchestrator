# Reusable Workflows スキル使用ログ

## 概要

このファイルは `reusable-workflows` スキルの使用履歴を記録します。
各実行の結果、フィードバック、改善点を蓄積し、継続的な改善に活用します。

## ログ記録方法

```bash
node .claude/skills/reusable-workflows/scripts/log_usage.mjs \
  --result success|failure \
  --phase "phase-name" \
  --agent "agent-name" \
  --notes "追加のフィードバック"
```

## 使用履歴

<!--
エントリ形式:

### [YYYY-MM-DD HH:MM:SS] - Result: SUCCESS/FAILURE

- **Phase**: phase-name
- **Agent**: agent-name
- **Duration**: N minutes
- **Notes**:
  フィードバックや気づき
- **Improvements**:
  改善提案

---
-->

<!-- ログエントリはここに自動追記されます -->

## 統計情報

- **総実行回数**: 0
- **成功回数**: 0
- **失敗回数**: 0
- **成功率**: 0.0%
- **現在のレベル**: 1

## よくある問題と解決策

<!-- 使用履歴から抽出されたパターンをここに記録 -->

### workflow_call トリガーの設定ミス

**問題**: on: workflow_call のインデントが不正でワークフローが検出されない

**解決策**:

```yaml
on:
  workflow_call: # workflow_dispatch と同じレベル
    inputs: ...
```

### シークレット継承の失敗

**問題**: 再利用可能ワークフロー内で secrets.GITHUB_TOKEN が利用できない

**解決策**:

```yaml
# caller側
jobs:
  call-workflow:
    uses: ./.github/workflows/reusable.yaml
    secrets: inherit # または個別指定
```

## 改善履歴

<!-- スキル改善の履歴をここに記録 -->

| 日付       | バージョン | 改善内容                                                    |
| ---------- | ---------- | ----------------------------------------------------------- |
| 2025-12-31 | 1.1.0      | EVALS.json, LOGS.md, agents/ を追加し18-skills.md仕様に対応 |
