---
name: .claude/skills/test-data-management/SKILL.md
description: |
  E2Eテストのためのテストデータ管理戦略。
  
  📖 参照書籍:
  - 『Test-Driven Development: By Example』（Kent Beck）: Red-Green-Refactor
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/cleanup-patterns.md`: Cleanup Patternsリソース
  - `resources/data-isolation-techniques.md`: Data Isolation Techniquesリソース
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/seeding-strategies.md`: Seeding Strategiesリソース
  - `scripts/generate-test-data.mjs`: Generate Test Dataスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/fixture-template.ts`: Fixtureテンプレート
  
  Use proactively when handling test data management tasks.
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

# Test Data Management Skill

## 概要

E2Eテストのためのテストデータ管理戦略。

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
cat .claude/skills/test-data-management/resources/Level1_basics.md
cat .claude/skills/test-data-management/resources/Level2_intermediate.md
cat .claude/skills/test-data-management/resources/Level3_advanced.md
cat .claude/skills/test-data-management/resources/Level4_expert.md
cat .claude/skills/test-data-management/resources/cleanup-patterns.md
cat .claude/skills/test-data-management/resources/data-isolation-techniques.md
cat .claude/skills/test-data-management/resources/legacy-skill.md
cat .claude/skills/test-data-management/resources/seeding-strategies.md
```

### スクリプト実行
```bash
node .claude/skills/test-data-management/scripts/generate-test-data.mjs --help
node .claude/skills/test-data-management/scripts/log_usage.mjs --help
node .claude/skills/test-data-management/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/test-data-management/templates/fixture-template.ts
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
