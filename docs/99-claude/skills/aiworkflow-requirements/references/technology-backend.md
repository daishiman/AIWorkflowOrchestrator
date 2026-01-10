# バックエンド技術スタック（データベース・AI統合）

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

## 概要

### 目的

本ドキュメントは、AIWorkflowOrchestratorプロジェクトで使用する技術スタックを定義し、以下を明確にする:

- **技術選定の理由**: なぜその技術を選んだのか
- **バージョン管理戦略**: 互換性とアップデート方針
- **個人開発における最適化**: コスト、学習コスト、保守性のバランス
- **依存関係の管理方針**: 肥大化防止と最小構成の維持

### 技術選定の基本原則

```
個人開発における技術選定の3原則:

1. 学習コストの最小化
   └─ 広く使われ、ドキュメントが充実した技術を優先

2. 無料枠の最大活用
   └─ Vercel, Turso, Railway等の無料tier内で運用可能

3. 型安全性の徹底
   └─ TypeScript strict mode + Zodによる実行時検証
```

### アーキテクチャ概要

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

## バックエンド・データベース

### Drizzle ORM

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

### Turso (libSQL)

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

### SQLite FTS5（全文検索）

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

### Zod

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

## AI統合

### Vercel AI SDK

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

### Structured Output

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

### 埋め込みプロバイダー

**実装場所**: `packages/shared/src/services/embedding/providers/`

#### OpenAI Embeddings

| 項目         | 値                     |
| ------------ | ---------------------- |
| モデル       | text-embedding-3-small |
| 次元数       | 1536                   |
| 最大トークン | 8,192トークン          |
| レート制限   | 1M tokens/分           |
| コスト       | $0.00002 / 1K tokens   |

**用途**: 高品質な意味検索、ドキュメント類似度計算

**特徴**:

- 高精度な意味表現
- 多言語対応
- 大規模なトレーニングデータ

#### Qwen3 Embeddings

| 項目         | 値               |
| ------------ | ---------------- |
| モデル       | qwen3-embedding  |
| 次元数       | 768              |
| 最大トークン | 4,096トークン    |
| レート制限   | プロバイダー依存 |
| コスト       | 変動             |

**用途**: 軽量な埋め込み生成、フォールバックオプション

**特徴**:

- OpenAIの約半分の次元数（メモリ効率）
- 高速な推論
- フォールバックチェーンの第2選択肢

#### プロバイダー選択戦略

**フォールバックチェーン**:

```
1. OpenAIProvider（第一選択）
     ↓ エラー時
2. Qwen3Provider（フォールバック）
```

**選択基準**:

- 品質優先: OpenAI
- コスト優先: Qwen3
- 可用性優先: フォールバックチェーン有効化

### ベクトルデータベース

#### Chroma

| 項目         | 値                        |
| ------------ | ------------------------- |
| バージョン   | 最新安定版                |
| デプロイ形式 | ローカルプロセス / Docker |
| ストレージ   | ローカルファイルシステム  |

**選定理由**:

- ローカル実行可能（プライバシー保護）
- シンプルなPython/JavaScript API
- メタデータフィルタリング
- コレクション管理

**代替案**:

- Pinecone: クラウドのみ、コストが高い
- Milvus: 大規模用途向け、セットアップ複雑
- Weaviate: 機能豊富だが過剰

### 信頼性アルゴリズム

**実装場所**: `packages/shared/src/services/embedding/utils/`

#### Token Bucket（レート制限）

| パラメータ      | デフォルト値 |
| --------------- | ------------ |
| 容量            | 設定可能     |
| リフィル レート | 1M tokens/分 |
| バースト許容    | 設定可能     |

**用途**: API呼び出しレート制限の遵守

#### Circuit Breaker（サーキットブレーカー）

| 状態      | 遷移条件               |
| --------- | ---------------------- |
| CLOSED    | 正常動作中             |
| OPEN      | 失敗閾値（5回）到達    |
| HALF_OPEN | タイムアウト（60秒）後 |

**用途**: 障害サービスへの呼び出し遮断

#### Exponential Backoff（リトライ）

| パラメータ       | デフォルト値 |
| ---------------- | ------------ |
| 最大リトライ回数 | 3回          |
| 初期遅延         | 1000ms       |
| バックオフ倍率   | 2            |
| ジッター         | 有効         |

**用途**: 一時的な障害からの自動リカバリー

#### LRU Cache（キャッシング）

| パラメータ   | デフォルト値 |
| ------------ | ------------ |
| 最大エントリ | 1000         |
| TTL          | なし         |

**用途**: 埋め込み結果の再利用

#### Cosine Similarity（類似度計算）

| パラメータ     | デフォルト値 |
| -------------- | ------------ |
| 類似度閾値     | 0.95         |
| ベクトル正規化 | 有効         |

**用途**: 重複コンテンツ検出

---

## 開発ツール

### 必須ツール

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

### オプションツール

| ツール    | バージョン | 用途                     | 導入タイミング |
| --------- | ---------- | ------------------------ | -------------- |
| Storybook | `8.x`      | コンポーネントカタログ   | UI安定後       |
| Sentry    | `8.x`      | エラー監視               | 本番運用開始時 |
| Chromatic | 最新       | ビジュアルリグレッション | UI安定後       |

---
