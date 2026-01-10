# サイトマップ / robots.txt

## サイトマップ

### 静的サイトマップ

```typescript
// app/sitemap.ts
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://example.com",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: "https://example.com/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://example.com/blog",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];
}
```

### 動的サイトマップ

```typescript
// app/sitemap.ts
import { MetadataRoute } from "next";
import { getAllPosts, getAllProducts } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://example.com";

  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  // 動的ページ（ブログ記事）
  const posts = await getAllPosts();
  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // 動的ページ（商品）
  const products = await getAllProducts();
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticPages, ...postPages, ...productPages];
}
```

### 複数サイトマップ（大規模サイト）

```typescript
// app/sitemap.ts
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  // サイトマップインデックスを返す
  return [
    {
      url: "https://example.com/sitemaps/pages.xml",
      lastModified: new Date(),
    },
    {
      url: "https://example.com/sitemaps/posts.xml",
      lastModified: new Date(),
    },
    {
      url: "https://example.com/sitemaps/products.xml",
      lastModified: new Date(),
    },
  ];
}

// app/sitemaps/posts/sitemap.ts
export async function generateSitemaps() {
  const posts = await getAllPosts();
  const postsPerSitemap = 1000;

  // 1000件ごとにサイトマップを分割
  return Array.from(
    { length: Math.ceil(posts.length / postsPerSitemap) },
    (_, i) => ({ id: i }),
  );
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  const start = id * 1000;
  const end = start + 1000;

  return posts.slice(start, end).map((post) => ({
    url: `https://example.com/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
  }));
}
```

### 画像・動画サイトマップ

```typescript
// app/sitemap.ts
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPostsWithMedia();

  return posts.map((post) => ({
    url: `https://example.com/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    images: post.images.map((img) => img.url),
    videos: post.videos?.map((video) => ({
      title: video.title,
      thumbnail_loc: video.thumbnail,
      description: video.description,
      content_loc: video.url,
      player_loc: video.playerUrl,
      duration: video.duration,
      publication_date: video.publishedAt,
    })),
  }));
}
```

### 多言語サイトマップ

```typescript
// app/sitemap.ts
import { MetadataRoute } from "next";

const locales = ["ja", "en", "zh"];
const baseUrl = "https://example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getAllPages();

  return pages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${page.path}`,
      lastModified: new Date(page.updatedAt),
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${baseUrl}/${l}${page.path}`]),
        ),
      },
    })),
  );
}
```

## robots.txt

### 基本設定

```typescript
// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/private/",
    },
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

### 複数ルール

```typescript
// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/_next/", "/private/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: "/nogooglebot/",
      },
      {
        userAgent: "Bingbot",
        crawlDelay: 10,
        allow: "/",
      },
    ],
    sitemap: "https://example.com/sitemap.xml",
    host: "https://example.com",
  };
}
```

### 環境別設定

```typescript
// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.NODE_ENV === "production";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";

  // 本番環境以外はクロールを禁止
  if (!isProduction) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/_next/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

## クロール最適化

### メタタグによる制御

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
```

### 特定ページのクロール禁止

```typescript
// app/admin/page.tsx
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
```

### noindex設定

```typescript
// 検索結果に表示したくないページ
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true, // リンクはフォローする
  },
};
```

## ベストプラクティス

### サイトマップ

| 項目            | 推奨                        |
| --------------- | --------------------------- |
| URL数           | 1ファイルあたり50,000件以下 |
| ファイルサイズ  | 50MB以下（非圧縮）          |
| 更新頻度        | 内容変更時に更新            |
| changeFrequency | 実際の更新頻度に合わせる    |
| priority        | 相対的な重要度（0.0〜1.0）  |

### robots.txt

| 項目             | 推奨               |
| ---------------- | ------------------ |
| 配置場所         | ルートディレクトリ |
| サイトマップ参照 | 必ず含める         |
| APIルート        | クロール禁止推奨   |
| 管理画面         | クロール禁止       |
| 認証ページ       | クロール禁止       |

### クロール最適化

```typescript
// 推奨設定
export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
    googleBot: {
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
```

## 検証・確認

### Google Search Console

1. サイトマップを送信
2. インデックス状況を確認
3. クロールエラーを確認

### 検証ツール

- [robots.txt テスター](https://www.google.com/webmasters/tools/robots-testing-tool)
- [サイトマップ検証](https://www.xml-sitemaps.com/validate-xml-sitemap.html)

## チェックリスト

### サイトマップ

- [ ] sitemap.tsが作成されている
- [ ] すべての重要なページが含まれている
- [ ] lastModifiedが適切に設定されている
- [ ] 多言語サイトの場合、alternatesが設定されている
- [ ] 画像がある場合、画像サイトマップが含まれている
- [ ] Google Search Consoleに送信済み

### robots.txt

- [ ] robots.tsが作成されている
- [ ] サイトマップへの参照がある
- [ ] 不要なパス（/api/, /admin/）が禁止されている
- [ ] 本番環境以外でクロール禁止が設定されている
- [ ] robots.txtが正しく生成されているか確認済み
