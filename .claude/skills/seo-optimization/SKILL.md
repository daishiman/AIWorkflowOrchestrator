---
name: seo-optimization
description: |
  Next.js Metadata APIを活用したSEO最適化を専門とするスキル。
  検索エンジン最適化、OGP設定、構造化データによるリッチリザルトを実現します。

  専門分野:
  - Metadata API: 静的・動的メタデータの設計と実装
  - OGP設定: Open Graph Protocol、Twitter Card設定
  - 構造化データ: JSON-LD、Schema.org対応
  - サイトマップ/robots: 自動生成、クロール制御

  使用タイミング:
  - ページのメタデータを設計・実装する時
  - OGP画像やTwitter Cardを設定する時
  - 構造化データでリッチリザルトを実装する時
  - サイトマップやrobots.txtを設定する時

  Use proactively when implementing SEO features, Metadata API,
  or structured data for rich results.
version: 1.0.0
---

# SEO Optimization

## 概要

このスキルは、Next.js App RouterのMetadata APIを活用したSEO最適化の
ベストプラクティスを提供します。検索エンジン可視性の向上とソーシャル
シェア時の表示最適化を実現します。

**核心哲学**:
- **Discoverable**: 検索エンジンに正しく理解されるコンテンツ
- **Shareable**: ソーシャルメディアで魅力的に表示される
- **Accessible**: すべてのユーザーとクローラーがアクセス可能

**主要な価値**:
- Metadata APIによる型安全なメタデータ管理
- 動的メタデータ生成による個別ページ最適化
- 構造化データによるリッチリザルト獲得

## リソース構造

```
seo-optimization/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── metadata-api-guide.md                   # Metadata APIガイド
│   ├── ogp-twitter-cards.md                    # OGP/Twitter Card設定
│   ├── structured-data.md                      # 構造化データ
│   └── sitemap-robots.md                       # サイトマップ/robots.txt
├── scripts/
│   └── analyze-seo.mjs                         # SEO分析スクリプト
└── templates/
    ├── metadata-template.md                    # メタデータテンプレート
    └── structured-data-template.md             # 構造化データテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# Metadata APIガイド
cat .claude/skills/seo-optimization/resources/metadata-api-guide.md

# OGP/Twitter Card設定
cat .claude/skills/seo-optimization/resources/ogp-twitter-cards.md

# 構造化データ
cat .claude/skills/seo-optimization/resources/structured-data.md

# サイトマップ/robots.txt
cat .claude/skills/seo-optimization/resources/sitemap-robots.md
```

### スクリプト実行

```bash
# SEO分析
node .claude/skills/seo-optimization/scripts/analyze-seo.mjs <app-directory>
```

### テンプレート参照

```bash
# メタデータテンプレート
cat .claude/skills/seo-optimization/templates/metadata-template.md

# 構造化データテンプレート
cat .claude/skills/seo-optimization/templates/structured-data-template.md
```

## いつ使うか

### シナリオ1: ページメタデータ設定
**状況**: 新しいページにSEOメタデータを設定する

**適用条件**:
- [ ] ページのtitle、descriptionが必要
- [ ] OGP画像の設定が必要
- [ ] 検索エンジン表示を最適化したい

**期待される成果**: 検索結果とソーシャルシェアで最適な表示

### シナリオ2: 動的メタデータ生成
**状況**: 動的ルート（[slug]等）のメタデータを生成する

**適用条件**:
- [ ] 動的パラメータに基づくメタデータが必要
- [ ] データベースやAPIからメタデータを取得
- [ ] 各ページ固有のOGP画像が必要

**期待される成果**: 動的コンテンツに対応したSEO最適化

### シナリオ3: リッチリザルト実装
**状況**: 検索結果でリッチスニペットを表示したい

**適用条件**:
- [ ] 記事、製品、FAQなどの構造化データが必要
- [ ] パンくずリストの構造化データが必要
- [ ] レビュー、評価の表示が必要

**期待される成果**: 検索結果でのリッチリザルト表示

## 知識領域

### 領域1: Metadata API

**静的メタデータ**:
```typescript
export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description...',
}
```

**動的メタデータ**:
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const data = await fetchData(params.id)
  return {
    title: data.title,
    description: data.description,
  }
}
```

**詳細は**: `resources/metadata-api-guide.md` を参照

### 領域2: OGP/Twitter Card

**必須設定**:
- `og:title`: ページタイトル
- `og:description`: 説明文
- `og:image`: 1200x630pxの画像
- `twitter:card`: `summary_large_image`

**詳細は**: `resources/ogp-twitter-cards.md` を参照

### 領域3: 構造化データ

**主要なスキーマ**:
- `Article`: ブログ記事、ニュース
- `Product`: 商品ページ
- `BreadcrumbList`: パンくずリスト
- `FAQPage`: よくある質問

**詳細は**: `resources/structured-data.md` を参照

### 領域4: サイトマップ/robots

**sitemap.ts**:
```typescript
export default async function sitemap() {
  const pages = await getPages()
  return pages.map((page) => ({
    url: `https://example.com${page.path}`,
    lastModified: page.updatedAt,
  }))
}
```

**詳細は**: `resources/sitemap-robots.md` を参照

## ワークフロー

### Phase 1: 要件分析
1. SEO目標を確認（検索順位、CTR等）
2. 対象ページを特定
3. 競合分析を実施

### Phase 2: メタデータ設計
1. タイトル戦略を決定
2. description最適化
3. OGP画像を準備

### Phase 3: 実装
1. Root Layoutのデフォルトメタデータ
2. 各ページの静的/動的メタデータ
3. 構造化データの追加

### Phase 4: 検証
1. メタデータの表示確認
2. OGPプレビュー確認
3. 構造化データテスト

### Phase 5: 監視
1. Search Consoleで監視
2. CTRの改善
3. 定期的な更新

## 設計原則

### ユニーク性の原則
各ページには固有のtitleとdescriptionを設定する。

### 階層的継承の原則
Root Layoutでデフォルトを設定し、子ページで上書きする。

### データ駆動の原則
動的コンテンツには必ず動的メタデータを生成する。

### 検証の原則
実装後は必ずプレビューと構造化データテストを実行する。

## 関連スキル

- `.claude/skills/nextjs-app-router/SKILL.md` - ルーティング構造
- `.claude/skills/server-components-patterns/SKILL.md` - データフェッチ
- `.claude/skills/web-performance/SKILL.md` - パフォーマンス最適化

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版リリース |
