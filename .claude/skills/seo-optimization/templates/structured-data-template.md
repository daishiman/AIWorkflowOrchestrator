# 構造化データテンプレート

## JSON-LD コンポーネント

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

## WebSite スキーマ（トップページ）

```typescript
// app/page.tsx
import { JsonLd } from '@/components/json-ld'

export default function HomePage() {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '{{site_name}}',
    url: 'https://{{domain}}',
    description: '{{site_description}}',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://{{domain}}/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '{{organization_name}}',
    url: 'https://{{domain}}',
    logo: 'https://{{domain}}/logo.png',
    sameAs: [
      'https://twitter.com/{{twitter_handle}}',
      'https://github.com/{{github_handle}}',
    ],
  }

  return (
    <>
      <JsonLd data={websiteSchema} />
      <JsonLd data={organizationSchema} />
      <main>{/* コンテンツ */}</main>
    </>
  )
}
```

## Article スキーマ（ブログ記事）

```typescript
// app/blog/[slug]/page.tsx
import { JsonLd } from '@/components/json-ld'

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getPost(params.slug)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: [post.ogImage],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
      url: `https://{{domain}}/authors/${post.author.slug}`,
    },
    publisher: {
      '@type': 'Organization',
      name: '{{site_name}}',
      logo: {
        '@type': 'ImageObject',
        url: 'https://{{domain}}/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://{{domain}}/blog/${params.slug}`,
    },
  }

  return (
    <>
      <JsonLd data={articleSchema} />
      <article>{/* コンテンツ */}</article>
    </>
  )
}
```

## BreadcrumbList スキーマ（パンくずリスト）

```typescript
// components/breadcrumb-json-ld.tsx
import { JsonLd } from '@/components/json-ld'

type Breadcrumb = {
  name: string
  url: string
}

export function BreadcrumbJsonLd({ items }: { items: Breadcrumb[] }) {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return <JsonLd data={breadcrumbSchema} />
}

// 使用例
// app/blog/[slug]/page.tsx
<BreadcrumbJsonLd
  items={[
    { name: 'ホーム', url: 'https://{{domain}}' },
    { name: 'ブログ', url: 'https://{{domain}}/blog' },
    { name: post.title, url: `https://{{domain}}/blog/${post.slug}` },
  ]}
/>
```

## FAQPage スキーマ（よくある質問）

```typescript
// app/faq/page.tsx
import { JsonLd } from '@/components/json-ld'

type FAQ = {
  question: string
  answer: string
}

const faqs: FAQ[] = [
  {
    question: '{{question_1}}',
    answer: '{{answer_1}}',
  },
  {
    question: '{{question_2}}',
    answer: '{{answer_2}}',
  },
]

export default function FAQPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <>
      <JsonLd data={faqSchema} />
      <main>
        {faqs.map((faq, index) => (
          <div key={index}>
            <h3>{faq.question}</h3>
            <p>{faq.answer}</p>
          </div>
        ))}
      </main>
    </>
  )
}
```

## Product スキーマ（商品ページ）

```typescript
// app/products/[slug]/page.tsx
import { JsonLd } from '@/components/json-ld'

export default async function ProductPage({
  params,
}: {
  params: { slug: string }
}) {
  const product = await getProduct(params.slug)

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      url: `https://{{domain}}/products/${product.slug}`,
      priceCurrency: 'JPY',
      price: product.price,
      priceValidUntil: product.priceValidUntil,
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: '{{organization_name}}',
      },
    },
    aggregateRating: product.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.rating.average,
          reviewCount: product.rating.count,
        }
      : undefined,
  }

  return (
    <>
      <JsonLd data={productSchema} />
      <main>{/* 商品詳細 */}</main>
    </>
  )
}
```

## LocalBusiness スキーマ（店舗情報）

```typescript
// app/store/page.tsx
import { JsonLd } from '@/components/json-ld'

export default function StorePage() {
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': '{{business_type}}', // Restaurant, Store, LocalBusiness など
    name: '{{store_name}}',
    image: 'https://{{domain}}/store-image.jpg',
    '@id': 'https://{{domain}}',
    url: 'https://{{domain}}',
    telephone: '{{phone_number}}',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '{{street_address}}',
      addressLocality: '{{city}}',
      addressRegion: '{{prefecture}}',
      postalCode: '{{postal_code}}',
      addressCountry: 'JP',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: {{latitude}},
      longitude: {{longitude}},
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '{{weekday_open}}',
        closes: '{{weekday_close}}',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday'],
        opens: '{{weekend_open}}',
        closes: '{{weekend_close}}',
      },
    ],
    priceRange: '{{price_range}}', // ¥, ¥¥, ¥¥¥, ¥¥¥¥
  }

  return (
    <>
      <JsonLd data={localBusinessSchema} />
      <main>{/* 店舗情報 */}</main>
    </>
  )
}
```

## HowTo スキーマ（ハウツー記事）

```typescript
// app/tutorials/[slug]/page.tsx
import { JsonLd } from '@/components/json-ld'

export default async function TutorialPage({
  params,
}: {
  params: { slug: string }
}) {
  const tutorial = await getTutorial(params.slug)

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: tutorial.title,
    description: tutorial.description,
    totalTime: tutorial.duration, // ISO 8601形式: PT15M
    estimatedCost: tutorial.cost
      ? {
          '@type': 'MonetaryAmount',
          currency: 'JPY',
          value: tutorial.cost,
        }
      : undefined,
    tool: tutorial.tools?.map((tool) => ({
      '@type': 'HowToTool',
      name: tool,
    })),
    step: tutorial.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.title,
      text: step.description,
      image: step.image,
      url: `https://{{domain}}/tutorials/${tutorial.slug}#step-${index + 1}`,
    })),
  }

  return (
    <>
      <JsonLd data={howToSchema} />
      <article>{/* チュートリアル内容 */}</article>
    </>
  )
}
```

## 複合スキーマ（記事 + パンくず）

```typescript
// app/blog/[slug]/page.tsx
import { JsonLd } from '@/components/json-ld'

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getPost(params.slug)

  // 複数のスキーマを @graph で結合
  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: post.title,
        // ... Article スキーマ
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          // ... パンくずリスト
        ],
      },
    ],
  }

  return (
    <>
      <JsonLd data={combinedSchema} />
      <article>{/* コンテンツ */}</article>
    </>
  )
}
```

## 変数説明

| 変数 | 説明 | 例 |
|------|------|-----|
| `{{domain}}` | サイトドメイン | `example.com` |
| `{{site_name}}` | サイト名 | `My Site` |
| `{{organization_name}}` | 組織名 | `株式会社サンプル` |
| `{{twitter_handle}}` | Twitterハンドル | `example` |
| `{{business_type}}` | 事業タイプ | `Restaurant`, `Store` |
| `{{latitude}}` | 緯度 | `35.6895` |
| `{{longitude}}` | 経度 | `139.6917` |
| `{{price_range}}` | 価格帯 | `¥¥` |
