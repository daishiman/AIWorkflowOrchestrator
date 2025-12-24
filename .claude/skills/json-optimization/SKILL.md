---
name: .claude/skills/json-optimization/SKILL.md
description: |
  SQLiteのJSON1拡張を活用した柔軟なデータ構造設計とパフォーマンス最適化。
  式インデックス、JSON関数の効率的使用、スキーマ検証の統合を提供。
  
  📖 参照書籍:
  - 『High Performance Browser Networking』（Ilya Grigorik）: パフォーマンス測定
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/json-functions-reference.md`: json_extract/json_type/json_valid関数とインデックス活用
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `scripts/analyze-json-usage.mjs`: JSON使用状況分析とリレーショナル分離推奨の自動判定
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/json-schema-design.md`: JSON構造設計テンプレート（式インデックス/CHECK制約/Zodスキーマ統合）
  
  Use proactively when handling json optimization tasks.
version: 2.0.0
level: 2
last_updated: 2025-12-24
references:
  - book: "High Performance Browser Networking"
    author: "Ilya Grigorik"
    concepts:
      - "パフォーマンス測定"
      - "最適化"
---

# JSON Optimization Skill (SQLite)

## 概要

SQLiteのJSON1拡張を活用した柔軟なデータ構造設計とパフォーマンス最適化。
式インデックス、JSON関数の効率的使用、スキーマ検証の統合を提供。

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
- 半構造化データの格納設計時
- JSON検索パフォーマンスの最適化時
- スキーマが動的に変化する属性の設計時
- JSON構造の検証ルール策定時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/json-optimization/resources/Level1_basics.md
cat .claude/skills/json-optimization/resources/Level2_intermediate.md
cat .claude/skills/json-optimization/resources/Level3_advanced.md
cat .claude/skills/json-optimization/resources/Level4_expert.md
cat .claude/skills/json-optimization/resources/json-functions-reference.md
cat .claude/skills/json-optimization/resources/legacy-skill.md
```

### スクリプト実行
```bash
node .claude/skills/json-optimization/scripts/analyze-json-usage.mjs --help
node .claude/skills/json-optimization/scripts/log_usage.mjs --help
node .claude/skills/json-optimization/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/json-optimization/templates/json-schema-design.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 2.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
