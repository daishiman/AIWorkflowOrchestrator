---
name: .claude/skills/alert-design/SKILL.md
description: |
  アラート設計とAlert Fatigue回避の専門スキル。
  Mike Julianの『入門 監視』に基づく、アクション可能で過負荷を避けるアラートシステム設計を提供します。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/actionable-alert-design.md`: アクション可能なアラート設計ガイド
  - `resources/alert-fatigue-prevention.md`: Alert Fatigue回避戦略と実践手法
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/threshold-setting-guide.md`: 統計的根拠に基づく閾値設定ガイド
  - `scripts/analyze-alert-effectiveness.mjs`: アラート有効性分析スクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/alert-rules-template.yaml`: アラートルール定義テンプレート
  
  Use proactively when handling alert design tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "The Pragmatic Programmer"
    author: "Andrew Hunt, David Thomas"
    concepts:
      - "実践的改善"
      - "品質維持"
---

# Alert Design - アラート設計とAlert Fatigue回避

## 概要

アラート設計とAlert Fatigue回避の専門スキル。
Mike Julianの『入門 監視』に基づく、アクション可能で過負荷を避けるアラートシステム設計を提供します。

詳細な手順や背景は `resources/Level1_basics.md` と `resources/Level2_intermediate.md` を参照してください。


## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `resources/Level1_basics.md` と `resources/Level2_intermediate.md` を確認
2. 必要な resources/scripts/templates を特定

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. 関連リソースやテンプレートを参照しながら作業を実施
2. 重要な判断点をメモとして残す

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. 成果物が目的に合致するか確認
3. `scripts/log_usage.mjs` を実行して記録を残す


## ベストプラクティス

### すべきこと
- アラートルールと閾値を設計する時
- Alert Fatigue（アラート疲れ）を回避する時
- 通知ルーティングとエスカレーションポリシーを設計する時
- アクション可能なアラートを設計する時
- 適応的閾値を設定する時
- アラート有効性をレビューする時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/alert-design/resources/Level1_basics.md
cat .claude/skills/alert-design/resources/Level2_intermediate.md
cat .claude/skills/alert-design/resources/Level3_advanced.md
cat .claude/skills/alert-design/resources/Level4_expert.md
cat .claude/skills/alert-design/resources/actionable-alert-design.md
cat .claude/skills/alert-design/resources/alert-fatigue-prevention.md
cat .claude/skills/alert-design/resources/legacy-skill.md
cat .claude/skills/alert-design/resources/threshold-setting-guide.md
```

### スクリプト実行
```bash
node .claude/skills/alert-design/scripts/analyze-alert-effectiveness.mjs --help
node .claude/skills/alert-design/scripts/log_usage.mjs --help
node .claude/skills/alert-design/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/alert-design/templates/alert-rules-template.yaml
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
