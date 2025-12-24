---
name: .claude/skills/tdd-red-green-refactor/SKILL.md
description: |
  ケント・ベックのテスト駆動開発（TDD）サイクルを専門とするスキル。
  
  📖 参照書籍:
  - 『Test-Driven Development: By Example』（Kent Beck）: Red-Green-Refactor
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/green-phase.md`: Green Phaseリソース
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/red-phase.md`: Red Phaseリソース
  - `resources/refactor-phase.md`: Refactor Phaseリソース
  - `resources/tdd-anti-patterns.md`: Tdd Anti Patternsリソース
  - `resources/test-naming.md`: Test Namingリソース
  - `scripts/analyze-coverage.mjs`: Analyze Coverageスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/test-template.md`: Testテンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling tdd red green refactor tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Test-Driven Development: By Example"
    author: "Kent Beck"
    concepts:
      - "Red-Green-Refactor"
      - "テスト設計"
---

# TDD Red-Green-Refactor

## 概要

ケント・ベックのテスト駆動開発（TDD）サイクルを専門とするスキル。

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
- resources/Level1_basics.md を参照し、適用範囲を明確にする
- resources/Level2_intermediate.md を参照し、実務手順を整理する

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/tdd-red-green-refactor/resources/Level1_basics.md
cat .claude/skills/tdd-red-green-refactor/resources/Level2_intermediate.md
cat .claude/skills/tdd-red-green-refactor/resources/Level3_advanced.md
cat .claude/skills/tdd-red-green-refactor/resources/Level4_expert.md
cat .claude/skills/tdd-red-green-refactor/resources/green-phase.md
cat .claude/skills/tdd-red-green-refactor/resources/legacy-skill.md
cat .claude/skills/tdd-red-green-refactor/resources/red-phase.md
cat .claude/skills/tdd-red-green-refactor/resources/refactor-phase.md
cat .claude/skills/tdd-red-green-refactor/resources/tdd-anti-patterns.md
cat .claude/skills/tdd-red-green-refactor/resources/test-naming.md
```

### スクリプト実行
```bash
node .claude/skills/tdd-red-green-refactor/scripts/analyze-coverage.mjs --help
node .claude/skills/tdd-red-green-refactor/scripts/log_usage.mjs --help
node .claude/skills/tdd-red-green-refactor/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/tdd-red-green-refactor/templates/test-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
