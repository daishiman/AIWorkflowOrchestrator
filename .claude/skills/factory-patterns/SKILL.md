---
name: .claude/skills/factory-patterns/SKILL.md
description: |
  GoFのFactory系パターンを専門とするスキル。
  Erich Gammaの『Design Patterns』に基づき、
  オブジェクト生成の柔軟性と拡張性を提供する設計パターンを提供します。
  
  📖 参照書籍:
  - 『Design Patterns』（Erich Gamma et al.）: 設計パターン
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/abstract-factory.md`: abstract-factory の詳細ガイド
  - `resources/builder-pattern.md`: builder-pattern の詳細ガイド
  - `resources/factory-method.md`: factory-method の詳細ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/registry-factory.md`: registry-factory の詳細ガイド
  - `scripts/generate-factory.mjs`: factoryを生成するスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/builder-template.md`: builder-template のテンプレート
  - `templates/factory-method-template.md`: factory-method-template のテンプレート
  
  Use proactively when handling factory patterns tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Design Patterns"
    author: "Erich Gamma et al."
    concepts:
      - "設計パターン"
      - "拡張性"
---

# Factory Patterns

## 概要

GoFのFactory系パターンを専門とするスキル。
Erich Gammaの『Design Patterns』に基づき、
オブジェクト生成の柔軟性と拡張性を提供する設計パターンを提供します。

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
- IWorkflowExecutorの動的生成が必要な時
- 設定ベースのオブジェクト生成を実装する時
- 複雑なExecutorの段階的構築が必要な時
- 新しいワークフロータイプを追加する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/factory-patterns/resources/Level1_basics.md
cat .claude/skills/factory-patterns/resources/Level2_intermediate.md
cat .claude/skills/factory-patterns/resources/Level3_advanced.md
cat .claude/skills/factory-patterns/resources/Level4_expert.md
cat .claude/skills/factory-patterns/resources/abstract-factory.md
cat .claude/skills/factory-patterns/resources/builder-pattern.md
cat .claude/skills/factory-patterns/resources/factory-method.md
cat .claude/skills/factory-patterns/resources/legacy-skill.md
cat .claude/skills/factory-patterns/resources/registry-factory.md
```

### スクリプト実行
```bash
node .claude/skills/factory-patterns/scripts/generate-factory.mjs --help
node .claude/skills/factory-patterns/scripts/log_usage.mjs --help
node .claude/skills/factory-patterns/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/factory-patterns/templates/builder-template.md
cat .claude/skills/factory-patterns/templates/factory-method-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
