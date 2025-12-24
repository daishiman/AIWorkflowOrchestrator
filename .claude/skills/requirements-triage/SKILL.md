---
name: .claude/skills/requirements-triage/SKILL.md
description: |
  要求のトリアージと優先順位付けスキル。MoSCoW分類、リスク評価、実現可能性評価により、
  実装すべき要件を決定します。
  
  📖 参照書籍:
  - 『Don't Make Me Think』（Steve Krug）: ユーザビリティ
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/moscow-framework-guide.md`: moscow-framework-guide のガイド
  - `resources/moscow-framework.md`: MoSCoW分類の詳細ガイド（Must/Should/Could/Won't）とバランスガイドライン
  - `scripts/calculate-priority.mjs`: 優先度スコアを自動計算しMoSCoW分類を行うNode.jsスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/triage-matrix.md`: 要件評価マトリクステンプレート（ビジネス価値、実現可能性、リスク、コスト）
  
  Use proactively when handling requirements triage tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Don't Make Me Think"
    author: "Steve Krug"
    concepts:
      - "ユーザビリティ"
      - "情報設計"
---

# Requirements Triage

## 概要

要求のトリアージと優先順位付けスキル。MoSCoW分類、リスク評価、実現可能性評価により、
実装すべき要件を決定します。

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
- プロジェクト開始時の要求整理
- 複数の要望がある場合の優先順位決定
- リソース制約下での実装範囲の確定
- 要件のリスク評価が必要な時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/requirements-triage/resources/Level1_basics.md
cat .claude/skills/requirements-triage/resources/Level2_intermediate.md
cat .claude/skills/requirements-triage/resources/Level3_advanced.md
cat .claude/skills/requirements-triage/resources/Level4_expert.md
cat .claude/skills/requirements-triage/resources/legacy-skill.md
cat .claude/skills/requirements-triage/resources/moscow-framework-guide.md
cat .claude/skills/requirements-triage/resources/moscow-framework.md
```

### スクリプト実行
```bash
node .claude/skills/requirements-triage/scripts/calculate-priority.mjs --help
node .claude/skills/requirements-triage/scripts/log_usage.mjs --help
node .claude/skills/requirements-triage/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/requirements-triage/templates/triage-matrix.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
