---
name: information-architecture
description: |
  ユーザーが必要な情報を素早く見つけられるドキュメント構造設計スキル。
  階層設計、ナビゲーション、情報粒度管理の技術を提供。

  Anchors:
  • Information Architecture (Rosenfeld, Morville) / 適用: IA設計原則 / 目的: ユーザー中心の構造設計
  • Don't Make Me Think (Steve Krug) / 適用: ナビゲーション設計 / 目的: 直感的な情報探索
  • Clean Architecture (Robert C. Martin) / 適用: 依存関係ルール / 目的: 保守可能な構造

  Trigger:
  Use when designing document structures, creating navigation systems, organizing content hierarchies, building documentation sites, or planning information granularity.
  documentation, structure, navigation, hierarchy, sitemap, content organization
allowed-tools:
  - Read
  - Glob
  - Grep
  - Edit
  - Write
---

# Information Architecture スキル

## 概要

ユーザーが必要な情報を素早く見つけられるドキュメント構造設計スキル。
階層設計、ナビゲーション、情報粒度管理の技術を提供します。
詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

### Phase 1: ドキュメント構造分析

**目的**: 既存ドキュメントとユーザー検索パターンを分析し、構造設計の基礎を構築

**アクション**:

1. 既存コンテンツとユーザーニーズを調査
2. 情報カテゴリと分類体系を特定
3. 階層の深さと粒度を決定

**Task**: `agents/analyze-structure.md` を参照

### Phase 2: ナビゲーション設計

**目的**: グローバルナビ、サイドメニュー、パンくずリストの統合設計

**アクション**:

1. ナビゲーションパターンを選択
2. 各レベルでの発見性を最適化
3. ユーザーメンタルモデルとの整合性を確認

**Task**: `agents/design-navigation.md` を参照

### Phase 3: サイトマップ作成と検証

**目的**: 全体構造の可視化とSEO最適化

**アクション**:

1. Mermaid形式で視覚的サイトマップを作成
2. sitemap.xmlを生成（優先度・更新頻度設定）
3. `scripts/validate-links.mjs` でリンク検証
4. `scripts/log_usage.mjs` で記録

**Task**: `agents/create-sitemap.md` を参照

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

| Task               | 起動タイミング | 入力                       | 出力                 | 参照エージェント              |
| ------------------ | -------------- | -------------------------- | -------------------- | ----------------------------- |
| 構造分析           | Phase 1開始時  | 既存ドキュメント、要件定義 | 構造分析レポート     | `agents/analyze-structure.md` |
| ナビゲーション設計 | Phase 2開始時  | 構造分析レポート           | ナビゲーション設計書 | `agents/design-navigation.md` |
| サイトマップ作成   | Phase 3開始時  | ナビゲーション設計書       | sitemap.xml、視覚図  | `agents/create-sitemap.md`    |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリの対応ファイルを参照

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

| Version | Date       | Changes                                        |
| ------- | ---------- | ---------------------------------------------- |
| 2.1.0   | 2026-01-02 | ワークフローをPhase別に再構成、agents/参照追加 |
| 2.0.0   | 2026-01-02 | 18-skills.md完全準拠、Anchors/Trigger修正      |
| 1.1.0   | 2025-12-31 | frontmatter強化、Task仕様ナビ追加              |
| 1.0.0   | 2025-12-24 | 初版                                           |
