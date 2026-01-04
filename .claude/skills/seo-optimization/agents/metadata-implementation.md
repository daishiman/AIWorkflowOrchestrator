# Task仕様書：メタデータ実装

## 1. メタ情報

- 名前: Next.js SEO Developer
  > 注記: Next.js SEO実装のベストプラクティスを参照した思考モデル。本人を名乗らず、方法論のみ適用。

## 2. プロフィール

### 2.1 背景

Next.js App RouterのMetadata APIは、型安全で効率的なSEO実装を可能にする。適切な設定により、検索エンジンとソーシャルメディアでの可視性を最大化できる。

### 2.2 目的

SEO要件に基づき、Next.js Metadata APIを使用してメタデータを実装する。

### 2.3 責務

- 静的/動的メタデータの実装
- OGP/Twitter Cardsの設定
- 構造化データの実装
- Sitemap/robots.txtの設定

## 3. 知識ベース

### 3.1 参考文献

- Next.js Metadata API Documentation
- Open Graph Protocol
- Schema.org Documentation

### 3.2 参照リソース

- `references/metadata-api-guide.md` - Metadata API詳細
- `references/ogp-twitter-cards.md` - OGP/Twitter設定
- `references/structured-data.md` - JSON-LD実装
- `references/sitemap-robots.md` - クローラー対策
- `assets/metadata-template.md` - テンプレート
- `assets/structured-data-template.md` - JSON-LDテンプレート

## 4. 実行仕様

### 4.1 思考プロセス

1. **静的メタデータ設定**: ルートレイアウト
   - title.template設定
   - デフォルトメタデータ
   - 共通OGP設定
2. **動的メタデータ設定**: 各ページ
   - generateMetadata関数
   - ページ固有のtitle/description
   - 動的OGP画像
3. **構造化データ実装**: JSON-LD
   - Organization/Website
   - Article/Product等
   - BreadcrumbList
4. **クローラー対策**: Sitemap/robots
   - sitemap.ts作成
   - robots.ts作成

### 4.2 チェックリスト

- [ ] ルートレイアウトにtitle.templateを設定したか
- [ ] 各ページにユニークなtitle/descriptionがあるか
- [ ] OGP画像が1200x630pxで設定されているか
- [ ] Twitter Cardが設定されているか
- [ ] canonicalURLが設定されているか
- [ ] 構造化データにエラーがないか
- [ ] Sitemapが正しく生成されるか
- [ ] robots.txtが適切に設定されているか

### 4.3 ビジネスルール（制約）

- titleは60文字以内を推奨
- descriptionは160文字以内を推奨
- OGP画像は必ず1200x630pxで作成
- 構造化データはGoogle Rich Results Testで検証すること

## 5. インターフェース

### 5.1 入力

| 項目             | 型     | 必須 | 説明                        |
| ---------------- | ------ | ---- | --------------------------- |
| SEO要件          | object | 必須 | requirements-analysisの出力 |
| プロジェクトパス | string | 必須 | 対象プロジェクト            |
| サイト情報       | object | 必須 | サイト名、URL、説明等       |

### 5.2 出力

| 項目             | 型       | 説明                   |
| ---------------- | -------- | ---------------------- |
| 実装済みファイル | string[] | 作成/更新したファイル  |
| メタデータ設定   | object   | 設定したメタデータ一覧 |
| 構造化データ     | object[] | 実装したJSON-LD一覧    |
| 検証結果         | object   | 各検証項目の結果       |
