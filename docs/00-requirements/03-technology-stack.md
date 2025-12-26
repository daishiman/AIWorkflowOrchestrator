# 技術スタック仕様書

> 本ドキュメントは統合システム設計仕様書の一部です。
> マスタードキュメント: [master_system_design.md](./master_system_design.md)

## 1. 概要

### 1.1 目的

本ドキュメントは、AIWorkflowOrchestratorプロジェクトで使用する技術スタックを定義し、以下を明確にする:

- **技術選定の理由**: なぜその技術を選んだのか
- **バージョン管理戦略**: 互換性とアップデート方針
- **個人開発における最適化**: コスト、学習コスト、保守性のバランス
- **依存関係の管理方針**: 肥大化防止と最小構成の維持

### 1.2 技術選定の基本原則

```
個人開発における技術選定の3原則:

1. 学習コストの最小化
   └─ 広く使われ、ドキュメントが充実した技術を優先

2. 無料枠の最大活用
   └─ Vercel, Turso, Railway等の無料tier内で運用可能

3. 型安全性の徹底
   └─ TypeScript strict mode + Zodによる実行時検証
```

### 1.3 アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────┐
│                    pnpm Monorepo                            │
├─────────────────────────────────────────────────────────────┤
│  apps/                                                      │
│  ├─ web/          Next.js 15 (App Router)                   │
│  └─ desktop/      Electron + Next.js (将来対応)             │
├─────────────────────────────────────────────────────────────┤
│  packages/                                                  │
│  └─ shared/       共通ロジック、型定義、ユーティリティ       │
├─────────────────────────────────────────────────────────────┤
│  外部サービス                                               │
│  ├─ Turso         分散SQLite (無料: 9GB, 500Mリクエスト)    │
│  ├─ Railway       ホスティング (従量課金)                   │
│  └─ AI Provider   OpenAI / Anthropic / Google / xAI        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. コアランタイム

### 2.1 Node.js

| 項目           | 値                     |
| -------------- | ---------------------- |
| 推奨バージョン | `22.x LTS`             |
| 最小バージョン | `20.x LTS`             |
| 更新頻度       | LTSリリース毎（年1回） |

**選定理由**:

1. **Next.js 15との互換性**: Next.js 15はNode.js 18.18.0以上を要求
2. **ESM完全対応**: Node.js 22はES Modulesをネイティブサポート
3. **V8エンジン最新版**: パフォーマンス向上と最新JavaScript機能

**代替案との比較**:

| 選択肢 | 利点                             | 採用しなかった理由              |
| ------ | -------------------------------- | ------------------------------- |
| Deno   | セキュリティ、TypeScript組み込み | npm互換性、エコシステムの成熟度 |
| Bun    | 高速起動、オールインワン         | Next.js本番互換性の不安定さ     |

```bash
# バージョン確認
node --version  # v22.x.x

# .nvmrcでの固定
echo "22" > .nvmrc
```

### 2.2 pnpm

| 項目           | 値                                   |
| -------------- | ------------------------------------ |
| 推奨バージョン | `9.x`                                |
| 最小バージョン | `8.15.0`                             |
| 更新頻度       | マイナー更新は随時、メジャーは慎重に |

**選定理由**:

1. **ディスク効率**: ハードリンクによる重複排除（npm比で約60%削減）
2. **厳密な依存関係**: 幽霊依存関係（phantom dependencies）を防止
3. **高速インストール**: npm比で約2-3倍高速
4. **Monorepo最適化**: workspace機能がnpmより成熟

**代替案との比較**:

| 選択肢 | 利点                | 採用しなかった理由   |
| ------ | ------------------- | -------------------- |
| npm    | 標準、学習コスト0   | ディスク効率、速度   |
| yarn   | PnP、零インストール | 設定複雑、互換性問題 |
| Bun    | 超高速              | pnpm workspace互換性 |

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

---

## 3. フロントエンド

### 3.1 Next.js 15

| 項目           | 値                             |
| -------------- | ------------------------------ |
| 推奨バージョン | `15.1.x`                       |
| 最小バージョン | `15.0.0`                       |
| 更新頻度       | パッチは即時、マイナーは検証後 |

**選定理由**:

1. **App Router成熟**: Server Components、Streamingが安定
2. **Turbopack**: 開発時のHMRが高速化（Webpack比10倍）
3. **React 19準備完了**: Concurrent Features対応
4. **Railway最適化**: スタンドアロンモードで効率的デプロイ

**Next.js 15の活用機能**:

| 機能                 | 活用箇所         | 利点                     |
| -------------------- | ---------------- | ------------------------ |
| Server Components    | ワークフロー一覧 | バンドルサイズ削減       |
| Server Actions       | フォーム送信     | API Route不要            |
| Partial Prerendering | ダッシュボード   | TTFB高速化               |
| Turbopack            | 開発環境         | HMR 10倍高速化           |
| `after()` API        | ログ送信         | レスポンス後の非同期処理 |

**代替案との比較**:

| 選択肢    | 利点                 | 採用しなかった理由             |
| --------- | -------------------- | ------------------------------ |
| Remix     | 優れたデータ読み込み | Vercel以外のホスティング最適化 |
| Nuxt 3    | Vue好みの場合        | Reactエコシステムの規模        |
| SvelteKit | バンドルサイズ最小   | 学習コスト、エコシステム       |

```typescript
// next.config.ts (Next.js 15)
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Railway向け最適化
  experimental: {
    ppr: "incremental", // Partial Prerendering
  },
};

export default nextConfig;
```

### 3.2 React 19

| 項目           | 値           |
| -------------- | ------------ |
| 推奨バージョン | `19.0.x`     |
| 最小バージョン | `19.0.0`     |
| 更新頻度       | パッチは即時 |

**React 19の新機能活用**:

| 機能              | 活用箇所       | 説明                              |
| ----------------- | -------------- | --------------------------------- |
| `use()` フック    | データフェッチ | Promiseの直接unwrap               |
| Server Components | 全ページ       | サーバーでのレンダリング          |
| Actions           | フォーム       | `useActionState`, `useFormStatus` |
| `useOptimistic`   | UI更新         | 楽観的更新                        |

```tsx
// React 19 Actions の例
"use client";

import { useActionState } from "react";
import { createWorkflow } from "@/actions/workflow";

export function WorkflowForm() {
  const [state, formAction, isPending] = useActionState(createWorkflow, null);

  return (
    <form action={formAction}>
      <input name="name" disabled={isPending} />
      <button type="submit" disabled={isPending}>
        {isPending ? "作成中..." : "作成"}
      </button>
      {state?.error && <p>{state.error}</p>}
    </form>
  );
}
```

### 3.3 TypeScript

| 項目           | 値                   |
| -------------- | -------------------- |
| 推奨バージョン | `5.7.x`              |
| 最小バージョン | `5.5.0`              |
| 更新頻度       | マイナー更新は検証後 |

**コンパイラ設定**:

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true, // 配列アクセスの安全性
    "exactOptionalPropertyTypes": true, // オプショナルプロパティの厳密化
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "isolatedModules": true,
    "skipLibCheck": true,
  },
}
```

### 3.4 Tailwind CSS

| 項目           | 値                         |
| -------------- | -------------------------- |
| 推奨バージョン | `3.4.x`                    |
| 次期対応       | `4.0` (2025年中に移行検討) |

**選定理由**:

1. **ゼロランタイム**: CSSファイルへの事前コンパイル
2. **設計システム統一**: カスタムテーマで一貫性
3. **学習コスト低**: ユーティリティファーストの直感的API
4. **Shadcn/ui互換**: コンポーネントライブラリとの親和性

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./node_modules/@repo/ui/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

---

## 4. バックエンド・データベース

### 4.1 Drizzle ORM

| 項目           | 値                    |
| -------------- | --------------------- |
| 推奨バージョン | `0.38.x`              |
| 最小バージョン | `0.36.0`              |
| 関連パッケージ | `drizzle-kit: 0.30.x` |

**選定理由**:

1. **型安全なクエリ**: TypeScriptとの完全な統合
2. **軽量**: Prismaの1/10のバンドルサイズ
3. **SQLファースト**: SQLを直接書く感覚
4. **Turso対応**: libSQLドライバ公式サポート

**代替案との比較**:

| 選択肢  | 利点                 | 採用しなかった理由           |
| ------- | -------------------- | ---------------------------- |
| Prisma  | 成熟度、スキーマ管理 | バンドルサイズ、Edge非対応   |
| Kysely  | 型安全SQL            | ORM機能の不足                |
| TypeORM | 機能豊富             | レガシー設計、パフォーマンス |

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "turso",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
});
```

### 4.2 Turso (libSQL)

| 項目   | 値                       |
| ------ | ------------------------ |
| SDK    | `@libsql/client: 0.14.x` |
| 無料枠 | 9GB、500Mリクエスト/月   |

**選定理由**:

1. **エッジ最適化**: グローバル分散レプリカ
2. **SQLite互換**: ローカル開発が容易
3. **無料枠充実**: 個人開発に十分な容量
4. **Embedded Replicas**: オフライン対応可能

**Turso 2025年の新機能**:

| 機能              | 説明                     | 活用方法          |
| ----------------- | ------------------------ | ----------------- |
| Vector Search     | ベクトル検索対応         | AI検索に利用可能  |
| Schema Migrations | 組み込みマイグレーション | drizzle-kitと併用 |
| Multi-DB Groups   | 複数DB管理               | 環境分離          |

```typescript
// db/client.ts
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
```

### 4.2.1 SQLite FTS5（全文検索）

| 項目           | 値                                |
| -------------- | --------------------------------- |
| バージョン     | SQLite 3.45.x以降（FTS5組み込み） |
| トークナイザー | unicode61 remove_diacritics 2     |
| 実装パターン   | External Content Table            |

**選定理由**:

1. **SQLite組み込み**: 追加の検索エンジン不要、運用コスト削減
2. **BM25スコアリング**: 関連度の高い検索結果を提供
3. **日本語対応**: unicode61トークナイザーで日本語・英語混在テキストに対応
4. **高速検索**: インデックスベースの全文検索、10,000チャンクで100ms以下
5. **Turso互換**: libSQL/Tursoでそのまま利用可能

**FTS5の特徴**:

| 機能             | 説明                                         |
| ---------------- | -------------------------------------------- |
| External Content | データ重複なし、chunksテーブルを参照         |
| トリガー同期     | INSERT/UPDATE/DELETE時の自動インデックス更新 |
| 複数検索モード   | キーワード/フレーズ/NEAR（近接）検索         |
| ハイライト機能   | 検索キーワードのハイライト表示               |
| スニペット生成   | 検索結果の文脈付きプレビュー                 |

**代替案との比較**:

| 選択肢        | 利点               | 採用しなかった理由               |
| ------------- | ------------------ | -------------------------------- |
| Elasticsearch | 高機能、スケール性 | 運用コスト、個人開発に過剰       |
| Meilisearch   | タイポ許容、UI優秀 | 別プロセス必要、メモリ消費       |
| ベクトル検索  | セマンティック検索 | コスト高、FTS5との併用を将来検討 |

**使用例**:

```typescript
// キーワード検索
import { searchChunksByKeyword } from "@repo/shared/db/queries/chunks-search";

const results = await searchChunksByKeyword(db, {
  query: "TypeScript JavaScript",
  limit: 10,
});
// → BM25スコアでランク付けされた検索結果
```

**参照ドキュメント**:

- 設計詳細: [05-architecture.md](./05-architecture.md) - セクション5.10.5
- データベース設計: [15-database-design.md](./15-database-design.md) - chunksテーブル
- API設計: [08-api-design.md](./08-api-design.md) - セクション8.16

### 4.3 Zod

| 項目           | 値       |
| -------------- | -------- |
| 推奨バージョン | `3.24.x` |
| 最小バージョン | `3.22.0` |

**選定理由**:

1. **TypeScript統合**: `z.infer`による自動型生成
2. **軽量**: 12KB gzipped
3. **エコシステム**: React Hook Form, tRPC対応
4. **学習コスト低**: 直感的なAPI

```typescript
// features/xxx/schema.ts
import { z } from "zod";

export const workflowInputSchema = z.object({
  type: z.enum(["BLOG_OUTLINE", "DATA_ANALYSIS", "CODE_REVIEW"]),
  payload: z.record(z.unknown()),
  options: z
    .object({
      maxTokens: z.number().int().min(100).max(4000).default(1000),
      temperature: z.number().min(0).max(2).default(0.7),
    })
    .optional(),
});

export type WorkflowInput = z.infer<typeof workflowInputSchema>;

// 実行時検証
export function validateInput(data: unknown): WorkflowInput {
  return workflowInputSchema.parse(data);
}
```

---

## 5. AI統合

### 5.1 Vercel AI SDK

| 項目           | 値                                                                     |
| -------------- | ---------------------------------------------------------------------- |
| 推奨バージョン | `4.1.x`                                                                |
| 最小バージョン | `4.0.0`                                                                |
| 関連パッケージ | `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`, `@ai-sdk/xai` |

**選定理由**:

1. **統一API**: 複数プロバイダを同一インターフェースで
2. **ストリーミング**: Server-Sent Eventsによるリアルタイム応答
3. **型安全**: Zodスキーマによる構造化出力
4. **Next.js統合**: Server Actionsとの親和性

**対応プロバイダ**:

| プロバイダ | パッケージ          | 推奨モデル        | 無料枠          |
| ---------- | ------------------- | ----------------- | --------------- |
| OpenAI     | `@ai-sdk/openai`    | gpt-4o-mini       | $5/月 (新規)    |
| Anthropic  | `@ai-sdk/anthropic` | claude-3-5-sonnet | なし            |
| Google     | `@ai-sdk/google`    | gemini-2.0-flash  | 60リクエスト/分 |
| xAI        | `@ai-sdk/xai`       | grok-2            | なし            |

```typescript
// shared/infrastructure/ai/provider.ts
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { xai } from "@ai-sdk/xai";
import { generateText, streamText } from "ai";

// 統一インターフェースでの使用
export async function generateWithProvider(
  provider: "openai" | "anthropic" | "google" | "xai",
  prompt: string,
) {
  const models = {
    openai: openai("gpt-4o-mini"),
    anthropic: anthropic("claude-3-5-sonnet-20241022"),
    google: google("gemini-2.0-flash-exp"),
    xai: xai("grok-2"),
  };

  return generateText({
    model: models[provider],
    prompt,
  });
}
```

### 5.2 Structured Output

```typescript
// 構造化出力の例
import { generateObject } from "ai";
import { z } from "zod";

const blogOutlineSchema = z.object({
  title: z.string(),
  sections: z.array(
    z.object({
      heading: z.string(),
      keyPoints: z.array(z.string()),
      estimatedWords: z.number(),
    }),
  ),
  metadata: z.object({
    targetAudience: z.string(),
    tone: z.enum(["formal", "casual", "technical"]),
  }),
});

export async function generateBlogOutline(topic: string) {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: blogOutlineSchema,
    prompt: `Create a blog outline for: ${topic}`,
  });

  return object; // 型安全: typeof blogOutlineSchema
}
```

---

## 6. 開発ツール

### 6.1 必須ツール

| ツール     | バージョン | 用途                             |
| ---------- | ---------- | -------------------------------- |
| ESLint     | `9.x`      | コード品質チェック (Flat Config) |
| Prettier   | `3.x`      | コードフォーマット               |
| Vitest     | `2.x`      | ユニット/統合テスト              |
| Playwright | `1.49.x`   | E2Eテスト                        |

```typescript
// eslint.config.mjs (Flat Config - ESLint 9)
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/strict-boolean-expressions": "error",
    },
  },
);
```

### 6.2 オプションツール

| ツール    | バージョン | 用途                     | 導入タイミング |
| --------- | ---------- | ------------------------ | -------------- |
| Storybook | `8.x`      | コンポーネントカタログ   | UI安定後       |
| Sentry    | `8.x`      | エラー監視               | 本番運用開始時 |
| Chromatic | 最新       | ビジュアルリグレッション | UI安定後       |

---

## 7. パッケージ構成詳細

### 7.1 apps/web (Next.js Webアプリ)

```jsonc
// apps/web/package.json (抜粋)
{
  "name": "@repo/web",
  "dependencies": {
    // フレームワーク
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",

    // データベース
    "@libsql/client": "^0.14.0",
    "drizzle-orm": "^0.38.0",

    // AI
    "ai": "^4.1.0",
    "@ai-sdk/openai": "^1.1.0",
    "@ai-sdk/anthropic": "^1.1.0",
    "@ai-sdk/google": "^1.1.0",

    // バリデーション
    "zod": "^3.24.0",

    // UI
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.6.0",

    // 共有パッケージ
    "@repo/shared": "workspace:*",
  },
  "devDependencies": {
    // 型定義
    "typescript": "^5.7.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",

    // ビルドツール
    "drizzle-kit": "^0.30.0",

    // テスト
    "vitest": "^2.1.0",
    "@testing-library/react": "^16.0.0",

    // スタイル
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
  },
}
```

### 7.2 apps/desktop (Electron)

```jsonc
// apps/desktop/package.json
{
  "name": "@repo/desktop",
  "dependencies": {
    "electron": "^33.0.0",
    "electron-builder": "^25.0.0",
    "@repo/shared": "workspace:*",
  },
  "devDependencies": {
    "electron-vite": "^2.0.0",
  },
}
```

### 7.3 packages/shared (共有ライブラリ)

```jsonc
// packages/shared/package.json
{
  "name": "@repo/shared",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./core": "./dist/core/index.js",
    "./infrastructure": "./dist/infrastructure/index.js",
    "./utils": "./dist/utils/index.js",
  },
  "dependencies": {
    "zod": "^3.24.0",
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "tsup": "^8.0.0",
    "vitest": "^2.1.0",
  },
}
```

**RAG変換システムの依存関係方針**:

- **外部ライブラリ依存ゼロ**: Markdown/Code/YAMLコンバーターは標準ライブラリのみで実装
- **正規表現ベース解析**: AST解析ライブラリ（@babel/parser, typescript等）を使わず軽量化
- **既存依存の活用**: HTMLConverter（turndown）, CSVConverter（papaparse）, JSONConverter（標準JSON.parse）

**将来の依存追加候補**:

| ライブラリ      | 用途                    | 導入タイミング           | サイズ影響 |
| --------------- | ----------------------- | ------------------------ | ---------- |
| `pdf-parse`     | PDFConverter実装時      | PlainTextConverter完了後 | +500KB     |
| `mammoth`       | DocxConverter実装時     | PDF対応後                | +200KB     |
| `xlsx`          | ExcelConverter実装時    | Docx対応後               | +800KB     |
| `@babel/parser` | AST-based解析への移行時 | CONV-DEBT-002対応時      | +1.2MB     |

---

## 8. 依存関係管理戦略

### 8.1 依存関係の分類

```
必須依存関係 (production):
├─ next, react, react-dom     # コアフレームワーク
├─ drizzle-orm, @libsql/client  # データベース
├─ ai, @ai-sdk/*              # AI統合
├─ zod                        # バリデーション
└─ 最小限のUI (clsx, tailwind-merge)

オプション依存関係 (段階的導入):
├─ @radix-ui/*                # 必要なコンポーネントのみ
├─ framer-motion              # アニメーション必要時
├─ @tanstack/react-query      # クライアントキャッシュ必要時
└─ zustand                    # 複雑な状態管理必要時

開発依存関係 (devDependencies):
├─ typescript, @types/*       # 型システム
├─ eslint, prettier           # コード品質
├─ vitest, @testing-library/* # テスト
└─ drizzle-kit                # マイグレーション
```

### 8.2 依存関係の肥大化防止

**原則**:

1. **Just-in-Time導入**: 必要になるまで追加しない
2. **バンドルサイズ監視**: `next/bundle-analyzer` で定期確認
3. **Tree Shaking対応**: ESM対応パッケージを優先
4. **定期的な監査**: `pnpm audit` + `npm-check-updates`

```bash
# 依存関係の監査
pnpm audit
pnpm outdated

# バンドルサイズ分析
ANALYZE=true pnpm --filter @repo/web build

# 未使用依存関係の検出
pnpm dlx depcheck
```

### 8.3 バージョン更新戦略

```yaml
# 更新頻度とリスク評価
immediate_update: # 即時更新
  - security patches
  - critical bug fixes

weekly_update: # 週次確認
  - patch versions (x.x.N)

monthly_review: # 月次検証
  - minor versions (x.N.x)
  - 新機能確認後に更新

major_migration: # 慎重な計画
  - major versions (N.x.x)
  - breaking changes確認
  - テスト環境での検証必須
```

---

## 9. 無料枠の活用ガイド

### 9.1 サービス別無料枠

| サービス          | 無料枠                   | 個人開発での充足度 |
| ----------------- | ------------------------ | ------------------ |
| **Turso**         | 9GB、500Mリクエスト/月   | 十分               |
| **Railway**       | $5クレジット/月          | 小規模なら可       |
| **Cloudflare R2** | 10GB、100万リクエスト/月 | ファイル保存に最適 |
| **OpenAI**        | $5 (新規)                | 開発テスト用       |
| **Google AI**     | 60リクエスト/分          | 開発テスト用       |

### 9.2 コスト最適化戦略

```typescript
// AI呼び出しのコスト最適化
const costOptimizedConfig = {
  // 開発環境: 安価なモデル
  development: {
    provider: "google",
    model: "gemini-2.0-flash-exp", // 無料枠あり
  },
  // 本番環境: 用途別モデル選択
  production: {
    simple: "gpt-4o-mini", // 簡単なタスク
    complex: "gpt-4o", // 複雑な推論
    creative: "claude-3-5-sonnet", // 創造的タスク
  },
};
```

---

## 10. 学習リソースとコミュニティ

### 10.1 公式ドキュメント

| 技術          | ドキュメント         | 品質評価 |
| ------------- | -------------------- | -------- |
| Next.js       | nextjs.org/docs      | 優秀     |
| React         | react.dev            | 優秀     |
| Drizzle ORM   | orm.drizzle.team     | 良好     |
| Vercel AI SDK | sdk.vercel.ai/docs   | 良好     |
| Turso         | docs.turso.tech      | 良好     |
| Tailwind CSS  | tailwindcss.com/docs | 優秀     |

### 10.2 コミュニティサポート

```
活発度ランキング:
1. React / Next.js  - 非常に活発 (Stack Overflow, Discord, Reddit)
2. TypeScript       - 非常に活発 (GitHub Discussions)
3. Tailwind CSS     - 活発 (Discord)
4. Drizzle ORM      - 成長中 (Discord, GitHub)
5. Turso            - 成長中 (Discord)
```

---

## 11. マイグレーション計画

### 11.1 短期 (2025 Q1-Q2)

- [ ] React 19の新機能を全面活用
- [ ] Next.js 15のPPRを本番有効化
- [ ] ESLint 9 Flat Configへの移行完了

### 11.2 中期 (2025 Q3-Q4)

- [ ] Tailwind CSS 4.0への移行
- [ ] Electron版の開発開始
- [ ] React Compilerの本番導入

### 11.3 長期 (2026)

- [ ] Node.js 24 LTSへの移行
- [ ] 次期Next.jsメジャーバージョン対応

---

## 関連ドキュメント

- [プロジェクト概要](./01-overview.md)
- [非機能要件](./02-non-functional-requirements.md)
- [ディレクトリ構造](./04-directory-structure.md)
