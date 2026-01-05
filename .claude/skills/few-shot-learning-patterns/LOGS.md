# Few-Shot Learning Patterns - Usage Logs

## 概要

このファイルは `few-shot-learning-patterns` スキルの使用履歴とフィードバックを記録します。

## ログ記録方法

スキル実行後、以下のコマンドでログを記録します：

```bash
node .claude/skills/few-shot-learning-patterns/scripts/log_usage.mjs \
  --result [success|failure] \
  --phase "フェーズ名" \
  --agent "エージェント名" \
  --notes "追加のフィードバックメモ"
```

---

## 使用履歴

### 2025-12-31 - スキル改善（18-skills.md仕様準拠）

- **実行者**: システム
- **フェーズ**: Skill Structure Update
- **結果**: Success
- **改善内容**:
  - SKILL.md frontmatter を 18-skills.md 仕様に準拠
  - agents/ ディレクトリにTask仕様書を追加（pattern-designer.md, quality-validator.md）
  - references/ の Level1-4 ファイルを更新（ディレクトリ名の修正）
  - EVALS.json を新規作成
  - LOGS.md を新規作成
- **メトリクス更新**: 初期バージョン 1.2.0
- **備考**: Progressive Disclosure 原則に基づく構造化完了

---

## フィードバックサマリー

### 成功パターン

- （今後の使用で蓄積）

### よくある問題

- （今後の使用で蓄積）

### 改善提案

- （今後の使用で蓄積）

---

## レベル進捗

| レベル | 必要実行回数 | 現在の実行回数 | 成功率目標 | 現在の成功率 | ステータス |
| ------ | ------------ | -------------- | ---------- | ------------ | ---------- |
| 1      | 5            | 0              | 60%        | -            | 未達成     |
| 2      | 15           | 0              | 70%        | -            | 未達成     |
| 3      | 30           | 0              | 80%        | -            | 未達成     |
| 4      | 50           | 0              | 85%        | -            | 未達成     |

---

## 統計情報

- **総実行回数**: 0
- **成功回数**: 0
- **失敗回数**: 0
- **成功率**: -
- **最終更新**: 2025-12-31
