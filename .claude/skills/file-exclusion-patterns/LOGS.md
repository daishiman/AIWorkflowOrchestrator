# File Exclusion Patterns - Usage Log

## 概要

このファイルは `file-exclusion-patterns` スキルの使用履歴を記録します。各実行の結果、問題点、改善提案を蓄積し、継続的な改善に活用します。

## ログ記録方法

```bash
# 使用記録を追加
node .claude/skills/file-exclusion-patterns/scripts/log_usage.mjs \
  --result success \
  --phase "Phase 2" \
  --agent "pattern-designer" \
  --notes "Node.js project pattern generation completed"
```

## 使用履歴

_まだ使用履歴がありません。最初の実行後、ここに記録が追加されます。_

---

## サンプルエントリ形式

### 2025-12-31 12:00:00 - SUCCESS

- **Phase**: Phase 2 - Pattern Design
- **Task**: pattern-designer
- **Result**: Success
- **Duration**: 45 seconds
- **Notes**: Created comprehensive .gitignore for Node.js monorepo project
- **Feedback**: Pattern validation passed, all common Node.js patterns included
- **Issues**: None
- **Improvements**: Consider adding pnpm-specific patterns for monorepo

---

## 統計サマリー

- **総実行回数**: 0
- **成功回数**: 0
- **失敗回数**: 0
- **成功率**: N/A
- **平均実行時間**: N/A
- **最終使用日**: N/A

## よくある問題

_まだ記録がありません_

## 改善提案

_まだ記録がありません_

## レベル達成履歴

- **Level 1**: 未達成
- **Level 2**: 未達成
- **Level 3**: 未達成
- **Level 4**: 未達成

---

## 記録フォーマット

各エントリには以下の情報を含めます：

- **日時**: ISO 8601形式
- **Result**: SUCCESS / FAILURE
- **Phase**: 実行したフェーズ
- **Task**: 使用したTask（agents/）
- **Duration**: 実行時間（秒）
- **Notes**: 実行内容の詳細
- **Feedback**: 結果に対するフィードバック
- **Issues**: 発生した問題
- **Improvements**: 改善提案

## フィードバックの分類

### Positive（良かった点）

- パターンの網羅性
- 実行速度
- 検証の正確性

### Negative（改善が必要な点）

- 不足しているパターン
- パフォーマンスの問題
- ドキュメントの不明瞭さ

### Suggestions（提案）

- 新しいパターンの追加
- ワークフローの改善
- リソースの追加

---

_このログは `scripts/log_usage.mjs` によって自動的に更新されます。_
