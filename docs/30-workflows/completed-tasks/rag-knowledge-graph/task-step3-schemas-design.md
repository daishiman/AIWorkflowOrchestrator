# Zodスキーマ設計書（schemas.ts）

**タスクID**: T-01-2 (CONV-03-04)
**フェーズ**: Phase 1 - 設計
**作成日**: 2025-12-18
**ステータス**: 完了

---

## 1. 目的

Zodスキーマ（entityEntitySchema, relationEntitySchema等）を設計し、ランタイムバリデーションとTypeScript型推論を両立させる。types.tsの型定義と完全に一致するスキーマを定義し、外部入力の検証、データベース読み書き時のバリデーション、API入出力の型安全性を保証する。

---

## 2. 設計原則

### 2.1 型定義との整合性

- types.tsの型定義と**完全に一致**するスキーマを定義する
- `z.infer<typeof schema>`でTypeScript型を推論した際、types.tsの型と同一になる

### 2.2 Float32Array型の扱い

- TypeScriptではFloat32Array型だが、Zodでは`z.array(z.number())`として定義
- ランタイムでは通常の`number[]`配列としてバリデーション
- 実装時にFloat32Arrayへの変換処理を別途実装

### 2.3 readonly修飾子

- TypeScriptのreadonly修飾子はコンパイル時のみ有効
- Zodスキーマでは通常の配列・オブジェクトとして定義
- 不変性は実装側で保証（Object.freeze等）

### 2.4 バリデーション戦略

- **正常系**: 必須フィールド、型、範囲制約を厳密にチェック
- **異常系**: エラーメッセージを明確に（どのフィールドが不正か特定可能）
- **パフォーマンス**: カスタムバリデーションは最小限（計算コスト削減）

---

## 3. 基本スキーマ（共通部品）

### 3.1 timestampedSchema（タイムスタンプ）

```typescript
import { z } from "zod";

/**
 * タイムスタンプスキーマ
 * Timestampedインターフェースのバリデーション
 */
export const timestampedSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
});
```

**バリデーション制約**:

- `createdAt`, `updatedAt`は必須
- Date型（ISO 8601文字列から変換）

### 3.2 metadataSchema（メタデータ）

```typescript
/**
 * メタデータスキーマ
 * WithMetadataインターフェースのバリデーション
 */
export const metadataSchema = z.object({
  metadata: z.record(z.string(), z.unknown()),
});
```

**バリデーション制約**:

- `metadata`は必須
- キーは文字列、値は任意の型（`z.unknown()`）
- 空オブジェクト`{}`も許可

---

## 4. 列挙型スキーマ（Enum）

### 4.1 entityTypeSchema（48種類）

```typescript
/**
 * エンティティタイプスキーマ
 * 48種類のエンティティタイプを列挙
 */
export const entityTypeSchema = z.enum([
  // 1. 人物・組織カテゴリ (4種類)
  "person",
  "organization",
  "role",
  "team",

  // 2. 場所・時間カテゴリ (3種類)
  "location",
  "date",
  "event",

  // 3. ビジネス・経営カテゴリ (9種類)
  "company",
  "product",
  "service",
  "brand",
  "strategy",
  "metric",
  "business_process",
  "market",
  "customer",

  // 4. 技術全般カテゴリ (5種類)
  "technology",
  "tool",
  "method",
  "standard",
  "protocol",

  // 5. コード・ソフトウェアカテゴリ (7種類)
  "programming_language",
  "framework",
  "library",
  "api",
  "function",
  "class",
  "module",

  // 6. 抽象概念カテゴリ (5種類)
  "concept",
  "theory",
  "principle",
  "pattern",
  "model",

  // 7. ドキュメント構造カテゴリ (5種類)
  "document",
  "chapter",
  "section",
  "paragraph",
  "heading",

  // 8. ドキュメント要素カテゴリ (9種類)
  "keyword",
  "summary",
  "figure",
  "table",
  "list",
  "quote",
  "code_snippet",
  "formula",
  "example",

  // 9. メディアカテゴリ (4種類)
  "image",
  "video",
  "audio",
  "diagram",

  // 10. その他カテゴリ (1種類)
  "other",
]);
```

**設計ポイント**:

- `z.enum()`でリテラル型を厳密に制限
- 48種類すべて列挙（types.tsと一致）
- カテゴリごとにコメントで分類

### 4.2 relationTypeSchema（23種類）

```typescript
/**
 * 関係タイプスキーマ
 * 23種類の関係タイプを列挙
 */
export const relationTypeSchema = z.enum([
  // 汎用関係 (4種類)
  "related_to",
  "part_of",
  "has_part",
  "belongs_to",

  // 時間的関係 (3種類)
  "preceded_by",
  "followed_by",
  "concurrent_with",

  // 技術的関係 (7種類)
  "uses",
  "used_by",
  "implements",
  "extends",
  "depends_on",
  "calls",
  "imports",

  // 階層関係 (2種類)
  "parent_of",
  "child_of",

  // 参照関係 (4種類)
  "references",
  "referenced_by",
  "defines",
  "defined_by",

  // 人物関係 (3種類)
  "authored_by",
  "works_for",
  "collaborates_with",
]);
```

---

## 5. Value Objectスキーマ

### 5.1 entityMentionSchema（エンティティメンション）

```typescript
/**
 * エンティティメンションスキーマ
 * エンティティの出現位置を表現
 */
export const entityMentionSchema = z
  .object({
    startChar: z.number().int().nonnegative(), // 0以上の整数
    endChar: z.number().int().nonnegative(), // 0以上の整数
    surfaceForm: z.string().min(1), // 1文字以上
  })
  .refine((data) => data.endChar > data.startChar, {
    message: "endChar must be greater than startChar",
    path: ["endChar"],
  });
```

**バリデーション制約**:

- `startChar`: 0以上の整数
- `endChar`: 0以上の整数
- `surfaceForm`: 1文字以上の文字列
- **カスタムバリデーション**: `endChar > startChar`

### 5.2 relationEvidenceSchema（関係の証拠）

```typescript
import type { ChunkId } from "../branded";

/**
 * 関係の証拠スキーマ
 * 関係の出典チャンクを表現
 */
export const relationEvidenceSchema = z.object({
  chunkId: z.string().uuid() as z.ZodType<ChunkId>, // UUID形式
  excerpt: z.string().min(1).max(500), // 1〜500文字
  confidence: z.number().min(0).max(1), // 0.0〜1.0
});
```

**バリデーション制約**:

- `chunkId`: UUID形式の文字列（ChunkId型）
- `excerpt`: 1〜500文字の文字列
- `confidence`: 0.0〜1.0の実数

### 5.3 graphStatisticsSchema（グラフ統計情報）

```typescript
/**
 * グラフ統計情報スキーマ
 * Knowledge Graph全体の統計を表現
 */
export const graphStatisticsSchema = z.object({
  entityCount: z.number().int().nonnegative(), // 0以上の整数
  relationCount: z.number().int().nonnegative(), // 0以上の整数
  communityCount: z.number().int().nonnegative(), // 0以上の整数
  averageDegree: z.number().nonnegative(), // 0以上の実数
  density: z.number().min(0).max(1), // 0.0〜1.0
  connectedComponents: z.number().int().positive(), // 1以上の整数
});
```

**バリデーション制約**:

- `entityCount`, `relationCount`, `communityCount`: 0以上の整数
- `averageDegree`: 0以上の実数
- `density`: 0.0〜1.0の実数
- `connectedComponents`: 1以上の整数（最低1つの連結成分）

---

## 6. Entityスキーマ

### 6.1 entityEntitySchema（エンティティエンティティ）

```typescript
import type { EntityId } from "../branded";

/**
 * エンティティエンティティスキーマ
 * Knowledge Graphのノード（頂点）を表現
 */
export const entityEntitySchema = z
  .object({
    id: z.string().uuid() as z.ZodType<EntityId>,
    name: z.string().min(1).max(255),
    normalizedName: z.string().min(1).max(255),
    type: entityTypeSchema,
    description: z.string().max(1000).nullable(),
    aliases: z.array(z.string().min(1).max(255)),
    embedding: z.array(z.number()).nullable(),
    importance: z.number().min(0).max(1),
    metadata: z.record(z.string(), z.unknown()),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .refine((data) => data.embedding === null || data.embedding.length > 0, {
    message: "embedding must be null or non-empty array",
    path: ["embedding"],
  })
  .refine(
    (data) => {
      // embedding次元数チェック（例: 512, 768, 1536次元）
      if (data.embedding === null) return true;
      const validDimensions = [512, 768, 1024, 1536];
      return validDimensions.includes(data.embedding.length);
    },
    {
      message: "embedding dimension must be one of [512, 768, 1024, 1536]",
      path: ["embedding"],
    },
  );
```

**バリデーション制約**:

- `id`: UUID形式の文字列（EntityId型）
- `name`: 1〜255文字の文字列
- `normalizedName`: 1〜255文字の文字列
- `type`: entityTypeSchemaに定義された48種類のいずれか
- `description`: 最大1000文字の文字列またはnull
- `aliases`: 文字列配列（各要素1〜255文字、空配列可）
- `embedding`: 数値配列またはnull
- `importance`: 0.0〜1.0の実数
- `metadata`: 任意のキー・値ペア
- `createdAt`, `updatedAt`: Date型

**カスタムバリデーション**:

1. `embedding`がnullでない場合、空配列でないこと
2. `embedding`の次元数が512, 768, 1024, 1536のいずれかであること（代表的な埋め込みモデルの次元数）

**設計上の注意**:

- Float32Array型は`z.array(z.number())`で表現
- 実装時にFloat32Arrayへの変換処理を別途実装

### 6.2 relationEntitySchema（関係エンティティ）

```typescript
import type { EntityId, RelationId } from "../branded";

/**
 * 関係エンティティスキーマ
 * Knowledge Graphのエッジ（辺）を表現
 */
export const relationEntitySchema = z
  .object({
    id: z.string().uuid() as z.ZodType<RelationId>,
    sourceId: z.string().uuid() as z.ZodType<EntityId>,
    targetId: z.string().uuid() as z.ZodType<EntityId>,
    type: relationTypeSchema,
    description: z.string().max(500).nullable(),
    weight: z.number().min(0).max(1),
    bidirectional: z.boolean(),
    evidence: z.array(relationEvidenceSchema).min(1),
    metadata: z.record(z.string(), z.unknown()),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .refine((data) => data.sourceId !== data.targetId, {
    message: "sourceId and targetId must be different (self-loops not allowed)",
    path: ["targetId"],
  });
```

**バリデーション制約**:

- `id`: UUID形式の文字列（RelationId型）
- `sourceId`, `targetId`: UUID形式の文字列（EntityId型）
- `type`: relationTypeSchemaに定義された23種類のいずれか
- `description`: 最大500文字の文字列またはnull
- `weight`: 0.0〜1.0の実数
- `bidirectional`: boolean型
- `evidence`: relationEvidenceSchemaの配列（最低1件必須）
- `metadata`: 任意のキー・値ペア
- `createdAt`, `updatedAt`: Date型

**カスタムバリデーション**:

1. `sourceId`と`targetId`は異なること（自己ループ禁止）

**設計上の考慮事項**:

- 証拠（evidence）は必ず1件以上必要（関係は証拠なしに存在しない）
- 自己ループ（A → A）は禁止（GraphRAGの意味的関係として不適切）

### 6.3 communityEntitySchema（コミュニティエンティティ）

```typescript
import type { CommunityId, EntityId } from "../branded";

/**
 * コミュニティエンティティスキーマ
 * Knowledge Graphのクラスター（意味的に関連するエンティティ群）を表現
 */
export const communityEntitySchema = z
  .object({
    id: z.string().uuid() as z.ZodType<CommunityId>,
    level: z.number().int().nonnegative(),
    parentId: z.string().uuid().nullable() as z.ZodType<CommunityId | null>,
    name: z.string().min(1).max(255),
    summary: z.string().max(2000),
    memberEntityIds: z.array(z.string().uuid() as z.ZodType<EntityId>).min(1),
    memberCount: z.number().int().positive(),
    embedding: z.array(z.number()).nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .refine((data) => data.memberEntityIds.length === data.memberCount, {
    message: "memberCount must equal the length of memberEntityIds",
    path: ["memberCount"],
  })
  .refine(
    (data) => (data.level === 0 && data.parentId === null) || data.level > 0,
    {
      message: "level 0 communities must have parentId = null",
      path: ["parentId"],
    },
  )
  .refine((data) => data.embedding === null || data.embedding.length > 0, {
    message: "embedding must be null or non-empty array",
    path: ["embedding"],
  })
  .refine(
    (data) => {
      // embedding次元数チェック（entityと同じ次元）
      if (data.embedding === null) return true;
      const validDimensions = [512, 768, 1024, 1536];
      return validDimensions.includes(data.embedding.length);
    },
    {
      message: "embedding dimension must be one of [512, 768, 1024, 1536]",
      path: ["embedding"],
    },
  );
```

**バリデーション制約**:

- `id`: UUID形式の文字列（CommunityId型）
- `level`: 0以上の整数
- `parentId`: UUID形式の文字列またはnull（CommunityId型）
- `name`: 1〜255文字の文字列
- `summary`: 最大2000文字の文字列
- `memberEntityIds`: EntityIdの配列（最低1件必須）
- `memberCount`: 1以上の整数
- `embedding`: 数値配列またはnull
- `createdAt`, `updatedAt`: Date型

**カスタムバリデーション**:

1. `memberCount`が`memberEntityIds.length`と一致すること（整合性保証）
2. `level = 0`のコミュニティは`parentId = null`であること（階層制約）
3. `embedding`がnullでない場合、空配列でないこと
4. `embedding`の次元数が512, 768, 1024, 1536のいずれかであること

**設計上の注意**:

- CommunityEntityは**WithMetadataを継承しない**（自動生成データのため、カスタムメタデータ不要）
- 孤児コミュニティ（memberCount = 0）は配列の最小長制約により禁止

---

## 7. 関連型スキーマ

### 7.1 chunkEntityRelationSchema（チャンク-エンティティ関連）

```typescript
import type { ChunkId, EntityId } from "../branded";

/**
 * チャンク-エンティティ関連スキーマ
 * 文書チャンクとエンティティの多対多関連を表現
 */
export const chunkEntityRelationSchema = z
  .object({
    chunkId: z.string().uuid() as z.ZodType<ChunkId>,
    entityId: z.string().uuid() as z.ZodType<EntityId>,
    mentionCount: z.number().int().positive(),
    positions: z.array(entityMentionSchema).min(1),
  })
  .refine((data) => data.positions.length === data.mentionCount, {
    message: "mentionCount must equal the length of positions",
    path: ["mentionCount"],
  });
```

**バリデーション制約**:

- `chunkId`: UUID形式の文字列（ChunkId型）
- `entityId`: UUID形式の文字列（EntityId型）
- `mentionCount`: 1以上の整数
- `positions`: entityMentionSchemaの配列（最低1件必須）

**カスタムバリデーション**:

1. `mentionCount`が`positions.length`と一致すること（整合性保証）

---

## 8. 型推論の検証

### 8.1 型推論の確認方法

Zodスキーマから推論される型が、types.tsの型と一致することを確認する：

```typescript
import type { EntityEntity, RelationEntity, CommunityEntity } from "./types";
import {
  entityEntitySchema,
  relationEntitySchema,
  communityEntitySchema,
} from "./schemas";
import { z } from "zod";

// 型推論結果
type InferredEntityEntity = z.infer<typeof entityEntitySchema>;
type InferredRelationEntity = z.infer<typeof relationEntitySchema>;
type InferredCommunityEntity = z.infer<typeof communityEntitySchema>;

// 型の互換性チェック（コンパイル時に検証）
const _testEntityEntity: EntityEntity = {} as InferredEntityEntity;
const _testRelationEntity: RelationEntity = {} as InferredRelationEntity;
const _testCommunityEntity: CommunityEntity = {} as InferredCommunityEntity;
```

**期待される結果**:

- TypeScriptコンパイルエラーなし
- 型の構造が完全に一致

### 8.2 型不一致の主な原因と対処

| 原因                       | 対処方法                                            |
| -------------------------- | --------------------------------------------------- |
| Float32Array vs number[]   | types.tsでFloat32Array、schemaでz.array(z.number()) |
| readonly修飾子             | Zodでは無視（実装側でObject.freezeを使用）          |
| Branded Type（EntityId等） | `as z.ZodType<EntityId>`でキャスト                  |
| Date vs string             | Zodで`z.date()`、必要に応じて`z.coerce.date()`      |

---

## 9. バリデーション戦略

### 9.1 厳格モード（Strict Mode）

```typescript
// デフォルト: 厳格モード（未知のフィールドを拒否）
entityEntitySchema.parse(data); // 未知のフィールドがあればエラー
```

### 9.2 寛容モード（Passthrough Mode）

```typescript
// 未知のフィールドを許可（レガシーデータ対応）
entityEntitySchema.passthrough().parse(data);
```

### 9.3 ストリップモード（Strip Mode）

```typescript
// 未知のフィールドを削除（デフォルトの挙動）
entityEntitySchema.strip().parse(data);
```

**推奨**:

- **外部API入力**: 厳格モード（セキュリティ重視）
- **データベース読み込み**: ストリップモード（マイグレーション対応）
- **内部処理**: 厳格モード（バグ検出）

---

## 10. パフォーマンス最適化

### 10.1 スキーマの事前コンパイル

```typescript
// スキーマを事前にコンパイル（初回パース時のオーバーヘッド削減）
const compiledEntitySchema = entityEntitySchema;
```

### 10.2 部分的バリデーション

```typescript
// 特定フィールドのみバリデーション（パフォーマンス向上）
const partialEntitySchema = entityEntitySchema.pick({
  id: true,
  name: true,
  type: true,
});
```

### 10.3 カスタムバリデーションの最適化

- 計算コストの高いチェック（embedding次元数等）は必要な場合のみ実行
- 早期リターン（最初のエラーで即座に失敗）

---

## 11. エラーハンドリング

### 11.1 バリデーションエラーの構造

```typescript
try {
  entityEntitySchema.parse(data);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("Validation errors:", error.errors);
    // [
    //   {
    //     code: "too_small",
    //     minimum: 1,
    //     type: "string",
    //     inclusive: true,
    //     message: "String must contain at least 1 character(s)",
    //     path: ["name"]
    //   }
    // ]
  }
}
```

### 11.2 カスタムエラーメッセージ

```typescript
// フィールドごとにカスタムメッセージを定義
const customEntitySchema = z.object({
  name: z.string().min(1, { message: "エンティティ名は必須です" }),
  importance: z.number().min(0).max(1, {
    message: "重要度は0.0〜1.0の範囲で指定してください",
  }),
});
```

---

## 12. テストケース設計指針

### 12.1 正常系テスト

- すべての必須フィールドが存在
- 型が正しい
- 制約条件を満たす（min, max, regex等）

### 12.2 異常系テスト

| テストケース                      | 期待結果                   |
| --------------------------------- | -------------------------- |
| 必須フィールド欠落                | ZodError（required_error） |
| 型不一致                          | ZodError（invalid_type）   |
| 範囲外の値（importance > 1）      | ZodError（too_big）        |
| 空文字列（name = ""）             | ZodError（too_small）      |
| 自己ループ（sourceId = targetId） | ZodError（custom）         |
| embedding次元数不正（例: 100）    | ZodError（custom）         |

### 12.3 境界値テスト

| フィールド        | 境界値                                                    |
| ----------------- | --------------------------------------------------------- |
| `importance`      | 0.0, 0.5, 1.0, -0.1, 1.1                                  |
| `weight`          | 0.0, 0.5, 1.0, -0.1, 1.1                                  |
| `name`            | "", "a", "a".repeat(255), "a".repeat(256)                 |
| `embedding`       | null, [], [0.1], [0.1, ...（512個）], [0.1, ...（513個）] |
| `evidence`        | [], [1件], [10件]                                         |
| `memberEntityIds` | [], [1件], [1000件]                                       |

---

## 13. ADR（Architecture Decision Records）

### ADR-1: Float32Arrayをz.array(z.number())で表現

**状況**: TypeScript型ではFloat32Array、Zodでネイティブサポートなし

**決定**: `z.array(z.number())`で定義、実装時にFloat32Arrayへ変換

**理由**:

- Zodはネイティブでは TypedArray をサポートしていない
- カスタムバリデーションで対応可能だが、複雑性が増す
- 実装時の変換処理は単純（`new Float32Array(array)`）

**結果**:

- スキーマ定義がシンプル
- 型推論時に`number[]`として扱われる
- 実装時に明示的な変換が必要（型安全性は若干低下）

### ADR-2: embedding次元数を512, 768, 1024, 1536に制限

**状況**: AI APIの埋め込みモデルにより次元数が異なる

**決定**: 代表的な次元数（512, 768, 1024, 1536）のみ許可

**理由**:

- OpenAI: 1536次元（text-embedding-ada-002）
- Cohere: 768次元
- Sentence-BERT: 512次元、768次元
- その他のモデル: 1024次元

**結果**:

- 主要な埋め込みモデルをカバー
- 将来的に次元数が増えた場合、配列に追加するだけ
- 不正な次元数（例: 100次元）を早期に検出可能

### ADR-3: CommunityEntityはWithMetadataを継承しない

**状況**: 他のEntity（EntityEntity, RelationEntity）はWithMetadataを継承

**決定**: CommunityEntityは**WithMetadataを継承しない**

**理由**:

- CommunityEntityは自動生成データ（Leidenアルゴリズムの出力）
- ユーザーがカスタムメタデータを付与する用途がない
- メタデータフィールドが不要なコストとなる

**結果**:

- データサイズ削減（1コミュニティあたり数十バイト削減）
- スキーマがシンプルになる
- 将来的にメタデータが必要になった場合、追加は容易

---

## 14. 完了条件チェックリスト

- [x] entityEntitySchema, relationEntitySchema, communityEntitySchema が設計されている
- [x] entityTypeSchema, relationTypeSchema（z.enum）が設計されている
- [x] entityMentionSchema, relationEvidenceSchema が設計されている
- [x] timestampedSchema, metadataSchema が定義されている
- [x] バリデーション制約（min, max, regex等）が適切に定義されている
- [x] カスタムバリデーション（embedding次元数、importance/weight範囲、階層制約等）が設計されている
- [x] 型推論の検証方法が明確
- [x] ADRで主要な設計判断が記録されている

---

## 15. 依存関係

### 前提条件

- T-00-1（要件仕様書）が完了している
- T-01-1（型定義設計）が完了している
- `types/rag/branded.ts`, `interfaces.ts` が存在する

### 後続タスクへの影響

本設計書は以下のタスクの入力となる：

- T-02-1: 設計レビュー実施
- T-03-2: schemas.test.ts作成（Red）
- T-04-2: schemas.ts実装（Green）

---

## 16. 参考資料

- [Zod公式ドキュメント](https://zod.dev/)
- [Zod: Custom Error Messages](https://zod.dev/ERROR_HANDLING)
- [Zod: Refinements](https://zod.dev/#refine)
- [TypeScript: Branded Types](https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types)

---

**ステータス**: ✅ 完了
**レビュアー**: （Phase 2で設定）
**承認日**: （Phase 2で設定）
