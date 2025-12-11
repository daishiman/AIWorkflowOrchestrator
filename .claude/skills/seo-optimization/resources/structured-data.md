# 構造化データ（JSON-LD）

## 概要

構造化データは、検索エンジンがページの内容を理解するためのマークアップです。
Google検索でリッチリザルト（リッチスニペット）を表示するために必要です。

## 基本実装

### JSON-LDコンポーネント

```typescript
// components/json-ld.tsx
type JsonLdProps = {
  data: Record<string, unknown>
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
```

### 使用方法

```typescript
// app/page.tsx
import { JsonLd } from '@/components/json-ld'

export default function Page() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'サイト名',
    url: 'https://example.com',
  }

  return (
    <>
      <JsonLd data={structuredData} />
      <main>{/* コンテンツ */}</main>
    </>
  )
}
```

## 主要なスキーマタイプ

### WebSite（サイト全体）

```typescript
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "サイト名",
  url: "https://example.com",
  description: "サイトの説明",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://example.com/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};
```

### Organization（組織）

```typescript
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "組織名",
  url: "https://example.com",
  logo: "https://example.com/logo.png",
  sameAs: [
    "https://twitter.com/example",
    "https://facebook.com/example",
    "https://linkedin.com/company/example",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+81-3-xxxx-xxxx",
    contactType: "customer service",
    availableLanguage: ["Japanese", "English"],
  },
};
```

### Article（記事）

```typescript
const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "記事のタイトル",
  description: "記事の説明",
  image: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  datePublished: "2024-01-15T08:00:00+09:00",
  dateModified: "2024-01-20T10:00:00+09:00",
  author: {
    "@type": "Person",
    name: "著者名",
    url: "https://example.com/author",
  },
  publisher: {
    "@type": "Organization",
    name: "発行者名",
    logo: {
      "@type": "ImageObject",
      url: "https://example.com/logo.png",
    },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://example.com/article/example",
  },
};
```

### BlogPosting（ブログ記事）

```typescript
const blogPostingSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "ブログ記事タイトル",
  description: "概要",
  image: "https://example.com/blog-image.jpg",
  datePublished: "2024-01-15",
  dateModified: "2024-01-20",
  author: {
    "@type": "Person",
    name: "著者名",
  },
  keywords: ["Next.js", "SEO", "React"],
  wordCount: 1500,
  articleBody: "記事本文...",
};
```

### BreadcrumbList（パンくずリスト）

```typescript
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "ホーム",
      item: "https://example.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "ブログ",
      item: "https://example.com/blog",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "記事タイトル",
      item: "https://example.com/blog/article",
    },
  ],
};
```

### FAQPage（よくある質問）

```typescript
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "質問1",
      acceptedAnswer: {
        "@type": "Answer",
        text: "回答1",
      },
    },
    {
      "@type": "Question",
      name: "質問2",
      acceptedAnswer: {
        "@type": "Answer",
        text: "回答2",
      },
    },
  ],
};
```

### Product（商品）

```typescript
const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "商品名",
  description: "商品説明",
  image: "https://example.com/product.jpg",
  sku: "SKU-12345",
  brand: {
    "@type": "Brand",
    name: "ブランド名",
  },
  offers: {
    "@type": "Offer",
    url: "https://example.com/product",
    priceCurrency: "JPY",
    price: "9800",
    priceValidUntil: "2024-12-31",
    availability: "https://schema.org/InStock",
    seller: {
      "@type": "Organization",
      name: "販売者名",
    },
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.5",
    reviewCount: "100",
  },
  review: [
    {
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: "5",
      },
      author: {
        "@type": "Person",
        name: "レビュアー名",
      },
      reviewBody: "レビュー本文",
    },
  ],
};
```

### LocalBusiness（店舗）

```typescript
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "Restaurant", // または LocalBusiness, Store など
  name: "店舗名",
  image: "https://example.com/store.jpg",
  "@id": "https://example.com",
  url: "https://example.com",
  telephone: "+81-3-xxxx-xxxx",
  address: {
    "@type": "PostalAddress",
    streetAddress: "渋谷区xxx 1-2-3",
    addressLocality: "渋谷区",
    addressRegion: "東京都",
    postalCode: "150-0001",
    addressCountry: "JP",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 35.6595,
    longitude: 139.7004,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
  ],
  priceRange: "¥¥",
};
```

### HowTo（ハウツー）

```typescript
const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Next.jsアプリのデプロイ方法",
  description: "Vercelを使用したNext.jsアプリのデプロイ手順",
  totalTime: "PT15M",
  step: [
    {
      "@type": "HowToStep",
      name: "GitHubにプッシュ",
      text: "コードをGitHubリポジトリにプッシュします",
      image: "https://example.com/step1.png",
    },
    {
      "@type": "HowToStep",
      name: "Vercelでインポート",
      text: "Vercelダッシュボードでリポジトリをインポートします",
      image: "https://example.com/step2.png",
    },
  ],
};
```

## 動的生成パターン

### 記事ページの完全な例

```typescript
// app/blog/[slug]/page.tsx
import { JsonLd } from '@/components/json-ld'

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)
  const breadcrumbs = await getBreadcrumbs(params.slug)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.ogImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
      url: `https://example.com/authors/${post.author.slug}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'My Blog',
      logo: {
        '@type': 'ImageObject',
        url: 'https://example.com/logo.png',
      },
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  }

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <article>{/* コンテンツ */}</article>
    </>
  )
}
```

## 検証ツール

### Google

- [リッチリザルトテスト](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)

### その他

- [JSON-LD Playground](https://json-ld.org/playground/)
- [Structured Data Testing Tool](https://developers.google.com/search/docs/advanced/structured-data)

## チェックリスト

- [ ] JSON-LDが正しい形式で出力されている
- [ ] @context が 'https://schema.org' に設定されている
- [ ] @type が適切に設定されている
- [ ] 必須プロパティがすべて含まれている
- [ ] 日付形式が ISO 8601 に従っている
- [ ] URLが正しい絶対URLになっている
- [ ] リッチリザルトテストでエラーがない
- [ ] 警告を可能な限り解消している
