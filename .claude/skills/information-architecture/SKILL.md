---
name: .claude/skills/information-architecture/SKILL.md
description: |
  ユーザーが必要な情報を素早く見つけられるドキュメント構造設計スキル。
  階層設計、ナビゲーション、情報粒度管理の技術を提供。

  **Anchors（基本概念）:**
  - ナビゲーションパターン: グローバルナビゲーション、パンくずリスト、サイドメニュー
  - 情報粒度: マイクロコンテンツ、チャンク化戦略
  - 階層設計: 3層まで推奨、ユーザー検索パターン最適化

  **Trigger（発動条件）:**
  - ドキュメント全体の構造を設計する必要がある時
  - ナビゲーション設計を行う時
  - 情報の粒度を決定する時
  - ドキュメントサイトを構築する時

  📖 参照書籍:
  - 『Clean Architecture』（Robert C. Martin）: 依存関係ルール

  📚 リソース参照:
  - `references/Level1_basics.md`: レベル1の基礎ガイド
  - `references/Level2_intermediate.md`: レベル2の実務ガイド
  - `references/Level3_advanced.md`: レベル3の応用ガイド
  - `references/Level4_expert.md`: レベル4の専門ガイド
  - `references/legacy-skill.md`: 旧SKILL.mdの全文
  - `references/navigation-patterns.md`: ナビゲーションパターン集
  - `references/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-links.mjs`: リンク検証スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `assets/sitemap-template.md`: サイトマップテンプレート
allowed-tools:
  - Read
  - Glob
  - Grep
  - Edit
  - Write
version: 1.0.0
level: 1
last_updated: 2025-12-31
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
階層設計、ナビゲーション、情報粒度管理の技術を提供します。
詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認
2. 必要な references/scripts/templates を特定

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
- ユーザーの検索行動を分析した階層設計
- 一貫したナビゲーションパターンの採用

### 避けるべきこと

- アンチパターンや注意点を確認せずに進めることを避ける
- 深い階層構造（4層以上）の設計
- ユーザーのメンタルモデルと異なる分類方法
- 統一されないナビゲーション表現

## Task仕様ナビ

| Task                   | 目的                                                               | 参照リソース                                   | 推奨レベル |
| ---------------------- | ------------------------------------------------------------------ | ---------------------------------------------- | ---------- |
| ドキュメント構造設計   | ユーザーの情報検索パターンに基づいた論理的な階層を設計             | Level1_basics.md, navigation-patterns.md       | 1-2        |
| ナビゲーション設計     | グローバルナビゲーション、パンくずリスト、サイドメニューの統合設計 | Level2_intermediate.md, navigation-patterns.md | 2-3        |
| 情報粒度管理           | マイクロコンテンツ、チャンク化戦略による読みやすさ向上             | Level2_intermediate.md                         | 2-3        |
| サイトマップ作成       | 全体構造の可視化とユーザー検索パターンの最適化                     | sitemap-template.md, Level1_basics.md          | 1-2        |
| 検索アーキテクチャ設計 | カテゴリベース、タグベース、FTS検索の統合                          | Level3_advanced.md                             | 3-4        |

## リソース参照

### 基礎リソース

- `references/Level1_basics.md`: ドキュメント構造設計の基本概念
- `references/Level2_intermediate.md`: ナビゲーション設計実践ガイド
- `references/navigation-patterns.md`: ナビゲーションパターン集

### 応用リソース

- `references/Level3_advanced.md`: 大規模ドキュメント構造化戦略
- `references/Level4_expert.md`: マルチランゲージ対応と検索最適化

### テンプレート

- `assets/sitemap-template.md`: サイトマップ作成テンプレート

### スクリプト

```bash
# スキル構造検証
node .claude/skills/information-architecture/scripts/validate-skill.mjs

# リンク検証
node .claude/skills/information-architecture/scripts/validate-links.mjs

# 使用記録
node .claude/skills/information-architecture/scripts/log_usage.mjs --help
```

## 変更履歴

| Version | Date       | Changes                                                                                                                                             |
| ------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1.0   | 2025-12-31 | 18-skills.md仕様に準拠：frontmatterにallowed-tools追加、Anchors/Triggerセクション追加、Task仕様ナビ（テーブル形式）追加、リソース参照セクション強化 |
| 1.0.0   | 2025-12-24 | 初版：仕様準拠と必須成果物の追加                                                                                                                    |
