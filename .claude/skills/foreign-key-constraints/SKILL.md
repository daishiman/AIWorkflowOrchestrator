---
name: .claude/skills/foreign-key-constraints/SKILL.md
description: |
  C.J.デイトの『リレーショナルデータベース入門』に基づく外部キー制約と参照整合性の設計。
  CASCADE動作の戦略的選択、循環参照の回避、ソフトデリートとの整合性を提供。
  専門分野:
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/cascade-patterns.md`: cascade-patterns のパターン集
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `scripts/check-fk-integrity.mjs`: fkintegrityを検証するスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/fk-design-checklist.md`: fk-design-checklist のチェックリスト
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling foreign key constraints tasks.
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

# Foreign Key Constraints Skill

## 概要

C.J.デイトの『リレーショナルデータベース入門』に基づく外部キー制約と参照整合性の設計。
CASCADE動作の戦略的選択、循環参照の回避、ソフトデリートとの整合性を提供。
専門分野:

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
- 外部キー関係の設計時
- CASCADE動作の選択時
- 循環参照の検出・解消時
- ソフトデリートとハードデリートの設計判断時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/foreign-key-constraints/resources/Level1_basics.md
cat .claude/skills/foreign-key-constraints/resources/Level2_intermediate.md
cat .claude/skills/foreign-key-constraints/resources/Level3_advanced.md
cat .claude/skills/foreign-key-constraints/resources/Level4_expert.md
cat .claude/skills/foreign-key-constraints/resources/cascade-patterns.md
cat .claude/skills/foreign-key-constraints/resources/legacy-skill.md
```

### スクリプト実行
```bash
node .claude/skills/foreign-key-constraints/scripts/check-fk-integrity.mjs --help
node .claude/skills/foreign-key-constraints/scripts/log_usage.mjs --help
node .claude/skills/foreign-key-constraints/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/foreign-key-constraints/templates/fk-design-checklist.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
