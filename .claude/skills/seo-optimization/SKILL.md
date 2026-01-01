---
name: seo-optimization
description: |
  SEO最適化の専門スキル。Next.js Metadata APIを活用した検索エンジン対策、ソーシャルメディア最適化、構造化データマークアップを提供します。

  Anchors:
  • 『Google SEO Starter Guide』（Google） / 適用: メタデータ設定と構造化データ / 目的: 検索可視性向上
  • 『Web Vitals Guide』（Google） / 適用: パフォーマンス最適化 / 目的: ユーザー体験向上

  Trigger:
  SEO最適化時、メタデータ設定時、構造化データマークアップ時、OGP設定時、検索エンジン対応時に使用

allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# SEO最適化

## 概要

Next.js Metadata APIを活用したSEO最適化を実装するスキルです。このスキルは検索エンジン最適化（SEO）に必要な以下の領域をカバーします：

- **Metadata API**: Next.js 15のメタデータAPI設定と実装
- **OGP/Twitter Cards**: ソーシャルメディアプレビュー対策
- **構造化データ**: Schema.orgマークアップ実装
- **Sitemap/robots.txt**: クローラー認識最適化

検索エンジンからのオーガニック流入を最大化し、ソーシャルメディア共有を最適化するための包括的なアプローチを提供します。詳細な実装手順は各Levelのリソースを参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認して対象範囲を理解
2. 必要なリソース、スクリプト、テンプレートを特定

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. 関連リソースやテンプレートを参照しながら実装を実施
2. メタデータ、OGP、構造化データを正確に設定
3. 重要な判断点（canonical タグ、lang属性など）をメモとして残す

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. メタデータが正しく設定されているか確認（Open Graph、Twitter Cards）
3. 構造化データが有効なJSON-LDか確認
4. `scripts/log_usage.mjs` を実行して記録を残す

## Task仕様ナビ

| Phase | Task             | 説明                                           | リソース               | スクリプト         |
| ----- | ---------------- | ---------------------------------------------- | ---------------------- | ------------------ |
| 1     | 要件分析         | SEO要件と対象ページを特定                      | Level1_basics.md       | -                  |
| 1     | スコープ定義     | 実装範囲（Metadata/OGP/構造化データ）を決定    | Level2_intermediate.md | -                  |
| 2     | Metadata実装     | Next.js metadata APIで基本メタデータを設定     | metadata-api-guide.md  | analyze-seo.mjs    |
| 2     | OGP設定          | Facebook、Twitter用のOGP/Twitterメタタグを設定 | ogp-twitter-cards.md   | -                  |
| 2     | 構造化データ設定 | Schema.orgマークアップをJSON-LDで実装          | structured-data.md     | -                  |
| 2     | Sitemap生成      | XML Sitemapを自動生成・配置                    | sitemap-robots.md      | -                  |
| 2     | robots.txt設定   | robots.txtでクローラー指示を定義               | sitemap-robots.md      | -                  |
| 3     | 検証             | メタデータ、構造化データの妥当性を検証         | -                      | validate-skill.mjs |
| 3     | 記録保存         | 実装内容と評価を記録                           | -                      | log_usage.mjs      |

## ベストプラクティス

### すべきこと

- **references/Level1_basics.md** を参照し、SEOの基礎概念と適用範囲を明確にする
- **references/Level2_intermediate.md** を参照し、実務的な実装手順を整理する
- 各ページで適切なcanonical タグを指定して重複を防ぐ
- モバイルファーストインデックスに対応したメタビューポート設定を確認
- OGPメタタグはページ固有の画像・説明を含める
- JSON-LD構造化データは有効性をGoogle Rich Results Testで検証
- Sitemap XMLとrobots.txtを定期的に更新・検証

### 避けるべきこと

- アンチパターンや注意点を確認せずに進めることを避ける
- 不正確なメタデータ（例：タイトルが255文字超過）を使用しない
- OGPメタタグの値が一貫していない複数のバージョンを混在させない
- 構造化データにエラーがないか確認せずに本番環境にデプロイしない
- robots.txtでクローラーを完全にブロックしてSEO対象ページを隠さない
- モバイル版サイトで異なるメタデータを使用して、PC版との不整合を生じさせない

## リソース参照

### リソースファイル

| リソース                         | 説明                                      | 用途                       |
| -------------------------------- | ----------------------------------------- | -------------------------- |
| references/Level1_basics.md       | SEO最適化の基礎概念とNext.jsメタデータAPI | 初心者向けの基本理解       |
| references/Level2_intermediate.md | 実装パターンと実務的なテクニック          | 実装の具体的な手順確認     |
| references/Level3_advanced.md     | 高度なSEO技法と最適化パターン             | 複雑なシナリオ対応         |
| references/Level4_expert.md       | エキスパート向けの応用技法と事例研究      | 業界ベストプラクティス習得 |
| references/metadata-api-guide.md  | Next.js 15 Metadata API実装ガイド         | メタデータAPI詳細          |
| references/ogp-twitter-cards.md   | OGP、Twitter Cardsメタタグ設定            | ソーシャルメディア対策     |
| references/sitemap-robots.md      | Sitemap XML、robots.txt実装               | クローラー対策             |
| references/structured-data.md     | Schema.orgとJSON-LD実装                   | 構造化データ設定           |

### スクリプト

```bash
# SEO分析スクリプト - メタデータとOGPを分析
node .claude/skills/seo-optimization/scripts/analyze-seo.mjs [page-url]

# スキル構造検証 - ファイル構成と有効性を確認
node .claude/skills/seo-optimization/scripts/validate-skill.mjs

# 使用記録・自動評価 - 実装内容を記録
node .claude/skills/seo-optimization/scripts/log_usage.mjs
```

### テンプレート

```bash
# メタデータテンプレート - Next.js Metadata設定の雛形
cat .claude/skills/seo-optimization/assets/metadata-template.md

# 構造化データテンプレート - JSON-LD実装の雛形
cat .claude/skills/seo-optimization/assets/structured-data-template.md
```

## 変更履歴

| Version | Date       | Changes                                                                              |
| ------- | ---------- | ------------------------------------------------------------------------------------ |
| 1.0.0   | 2025-12-31 | 18-skills.md仕様への準拠。YAML frontmatter更新、Task仕様ナビ追加、リソース参照表充実 |
