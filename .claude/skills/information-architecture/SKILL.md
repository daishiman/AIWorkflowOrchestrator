---
name: .claude/skills/information-architecture/SKILL.md
description: |
  ユーザーが必要な情報を素早く見つけられるドキュメント構造設計スキル。
  階層設計、ナビゲーション、情報粒度管理の技術を提供。
  使用タイミング:
  
  📖 参照書籍:
  - 『Clean Architecture』（Robert C. Martin）: 依存関係ルール
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/navigation-patterns.md`: navigation-patterns のパターン集
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-links.mjs`: linksを検証するスクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/sitemap-template.md`: sitemap-template のテンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling information architecture tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Clean Architecture"
    author: "Robert C. Martin"
    concepts:
      - "依存関係ルール"
      - "境界の設計"
---

# Information Architecture スキル

## 概要

ユーザーが必要な情報を素早く見つけられるドキュメント構造設計スキル。
階層設計、ナビゲーション、情報粒度管理の技術を提供。
使用タイミング:

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
- ドキュメント全体の構造を設計する時
- ナビゲーション設計を行う時
- 情報の粒度を決定する時
- ドキュメントサイトを構築する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/information-architecture/resources/Level1_basics.md
cat .claude/skills/information-architecture/resources/Level2_intermediate.md
cat .claude/skills/information-architecture/resources/Level3_advanced.md
cat .claude/skills/information-architecture/resources/Level4_expert.md
cat .claude/skills/information-architecture/resources/legacy-skill.md
cat .claude/skills/information-architecture/resources/navigation-patterns.md
```

### スクリプト実行
```bash
node .claude/skills/information-architecture/scripts/log_usage.mjs --help
node .claude/skills/information-architecture/scripts/validate-links.mjs --help
node .claude/skills/information-architecture/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/information-architecture/templates/sitemap-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
