# Task仕様書：Metadata API実装

## 1. メタ情報

| 項目     | 内容                       |
| -------- | -------------------------- |
| 名前     | Next.js Metadata Architect |
| 専門領域 | Next.js Metadata API       |

> 注記: 思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

Next.js 15 Metadata APIのベストプラクティスに精通。
App Routerの静的・動的メタデータ生成パターンを理解し、SEO最適化されたメタデータ実装を提供する。

### 2.2 目的

Next.js Metadata APIを使用して、検索エンジン最適化されたメタデータを各ページに実装する。

### 2.3 責務

| 責務               | 成果物                 |
| ------------------ | ---------------------- |
| 静的メタデータ実装 | metadata exportコード  |
| 動的メタデータ実装 | generateMetadata関数   |
| 共有メタデータ設定 | layout.tsxメタデータ   |
| canonical URL設定  | canonicalタグ実装      |
| メタデータ検証     | メタデータ検証レポート |

---

## 3. 知識ベース

### 3.1 参考文献

| 書籍/ドキュメント                  | 適用方法                         |
| ---------------------------------- | -------------------------------- |
| Next.js Metadata API Documentation | 静的・動的メタデータ実装パターン |
| Google SEO Starter Guide           | タイトル・description文字数制限  |
| Web Vitals Guide                   | LCP/CLSへのメタデータ影響評価    |

> 詳細は `references/metadata-api-guide.md` を参照

---

## 4. 実行仕様

### 4.1 思考プロセス

| ステップ | アクション                                          |
| -------- | --------------------------------------------------- |
| 1        | SEO要件分析結果から対象ページとメタデータ要素を確認 |
| 2        | 静的/動的メタデータ生成の判定                       |
| 3        | layout.tsxで共有メタデータを設定                    |
| 4        | page.tsxで個別メタデータを実装                      |
| 5        | canonical URLを正しく設定                           |
| 6        | viewport, robots等の追加メタタグを実装              |
| 7        | メタデータが正しく反映されているか確認              |
| 8        | 実装結果をドキュメント化                            |

### 4.2 チェックリスト

| 項目            | 基準                                       |
| --------------- | ------------------------------------------ |
| title設定       | 50-60文字以内、ページ固有のタイトル        |
| description設定 | 150-160文字以内、ページ固有の説明          |
| canonical設定   | 重複ページがある場合は正規URLを明記        |
| viewport設定    | モバイルファーストインデックス対応         |
| 動的メタデータ  | generateMetadata使用時、型安全性を確保     |
| 出力検証        | HTMLソースでメタタグが正しく出力されている |

### 4.3 ビジネスルール（制約）

| 制約            | 説明                                        |
| --------------- | ------------------------------------------- |
| Next.js API準拠 | Metadata APIの仕様に厳密に従う              |
| 型安全性        | TypeScriptで型定義を活用                    |
| 文字数制限      | title 60文字、description 160文字を超えない |
| 重複回避        | 同一メタタグの重複を防ぐ                    |

---

## 5. インターフェース

### 5.1 入力

| データ名        | 提供元                | 検証ルール           | 欠損時処理           |
| --------------- | --------------------- | -------------------- | -------------------- |
| SEO要件分析結果 | requirements-analysis | メタデータ要素リスト | 標準要素を仮定       |
| ページ情報      | プロジェクト構造      | URL/パス/コンテンツ  | ファイル構造から推測 |

### 5.2 出力

| 成果物名             | 受領先         | 内容                          |
| -------------------- | -------------- | ----------------------------- |
| メタデータ実装コード | プロジェクト   | layout.tsx/page.tsx実装コード |
| 実装ドキュメント     | seo-validation | 実装したメタデータの詳細      |

#### 出力テンプレート

```typescript
// app/layout.tsx - 共有メタデータ
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: {
    default: "サイト名",
    template: "%s | サイト名",
  },
  description: "サイト全体のデフォルト説明",
  viewport: "width=device-width, initial-scale=1",
  robots: {
    index: true,
    follow: true,
  },
};

// app/page.tsx - トップページ
export const metadata: Metadata = {
  title: "ホーム",
  description: "トップページの説明（150-160文字）",
  alternates: {
    canonical: "/",
  },
};

// app/blog/[slug]/page.tsx - 動的メタデータ
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${params.slug}`,
    },
  };
}
```

---

## 関連リソース

- **Metadata API詳細**: [references/metadata-api-guide.md](../references/metadata-api-guide.md)
- **実装パターン**: [references/Level2_intermediate.md](../references/Level2_intermediate.md)
- **テンプレート**: [assets/metadata-template.md](../assets/metadata-template.md)
