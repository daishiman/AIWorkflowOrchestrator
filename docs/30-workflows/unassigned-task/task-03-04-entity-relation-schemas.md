# CONV-03-04: エンティティ・関係スキーマ定義

## 概要

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| タスクID | CONV-03-04                             |
| タスク名 | エンティティ・関係スキーマ定義         |
| 依存     | CONV-03-01                             |
| 規模     | 小                                     |
| 出力場所 | `packages/shared/src/types/rag/graph/` |

## 目的

Knowledge Graph構築に必要なエンティティ、関係、コミュニティの型とZodスキーマを定義する。
CONV-08（Knowledge Graph構築）の基盤となる。

## 成果物

### 1. エンティティ型定義

```typescript
// packages/shared/src/types/rag/graph/types.ts

import type { EntityId, RelationId, CommunityId, ChunkId } from "../branded";
import type { Timestamped, WithMetadata } from "../interfaces";

/**
 * エンティティタイプ
 */
export const EntityTypes = {
  // 汎用
  PERSON: "person",
  ORGANIZATION: "organization",
  LOCATION: "location",
  DATE: "date",
  EVENT: "event",

  // 技術ドメイン
  TECHNOLOGY: "technology",
  CONCEPT: "concept",
  PRODUCT: "product",
  API: "api",
  FUNCTION: "function",
  CLASS: "class",

  // ドキュメント
  DOCUMENT: "document",
  SECTION: "section",

  // その他
  OTHER: "other",
} as const;

export type EntityType = (typeof EntityTypes)[keyof typeof EntityTypes];

/**
 * 関係タイプ
 */
export const RelationTypes = {
  // 汎用関係
  RELATED_TO: "related_to",
  PART_OF: "part_of",
  HAS_PART: "has_part",
  BELONGS_TO: "belongs_to",

  // 時間的関係
  PRECEDED_BY: "preceded_by",
  FOLLOWED_BY: "followed_by",
  CONCURRENT_WITH: "concurrent_with",

  // 技術的関係
  USES: "uses",
  USED_BY: "used_by",
  IMPLEMENTS: "implements",
  EXTENDS: "extends",
  DEPENDS_ON: "depends_on",
  CALLS: "calls",
  IMPORTS: "imports",

  // 階層関係
  PARENT_OF: "parent_of",
  CHILD_OF: "child_of",

  // 参照関係
  REFERENCES: "references",
  REFERENCED_BY: "referenced_by",
  DEFINES: "defines",
  DEFINED_BY: "defined_by",

  // 人物関係
  AUTHORED_BY: "authored_by",
  WORKS_FOR: "works_for",
  COLLABORATES_WITH: "collaborates_with",
} as const;

export type RelationType = (typeof RelationTypes)[keyof typeof RelationTypes];

/**
 * エンティティエンティティ
 */
export interface EntityEntity extends Timestamped, WithMetadata {
  readonly id: EntityId;
  readonly name: string;
  readonly normalizedName: string; // 正規化名（検索用）
  readonly type: EntityType;
  readonly description: string | null;
  readonly aliases: readonly string[]; // 別名リスト
  readonly embedding: Float32Array | null; // エンティティ埋め込み
  readonly importance: number; // 重要度スコア (0-1)
}

/**
 * 関係エンティティ
 */
export interface RelationEntity extends Timestamped, WithMetadata {
  readonly id: RelationId;
  readonly sourceId: EntityId;
  readonly targetId: EntityId;
  readonly type: RelationType;
  readonly description: string | null;
  readonly weight: number; // 関係の強さ (0-1)
  readonly bidirectional: boolean; // 双方向関係か
  readonly evidence: readonly RelationEvidence[];
}

/**
 * 関係の証拠（出典チャンク）
 */
export interface RelationEvidence {
  readonly chunkId: ChunkId;
  readonly excerpt: string; // 関係を示すテキスト抜粋
  readonly confidence: number; // 信頼度 (0-1)
}

/**
 * コミュニティ（Leidenアルゴリズムで検出）
 */
export interface CommunityEntity extends Timestamped {
  readonly id: CommunityId;
  readonly level: number; // 階層レベル
  readonly parentId: CommunityId | null;
  readonly name: string;
  readonly summary: string; // LLM生成サマリー
  readonly memberEntityIds: readonly EntityId[];
  readonly memberCount: number;
  readonly embedding: Float32Array | null; // コミュニティ埋め込み
}

/**
 * チャンクとエンティティの関連
 */
export interface ChunkEntityRelation {
  readonly chunkId: ChunkId;
  readonly entityId: EntityId;
  readonly mentionCount: number;
  readonly positions: readonly EntityMention[];
}

/**
 * エンティティメンション（出現位置）
 */
export interface EntityMention {
  readonly startChar: number;
  readonly endChar: number;
  readonly surfaceForm: string; // 実際のテキスト表現
}

/**
 * グラフ統計情報
 */
export interface GraphStatistics {
  readonly entityCount: number;
  readonly relationCount: number;
  readonly communityCount: number;
  readonly averageDegree: number;
  readonly density: number;
  readonly connectedComponents: number;
}
```

### 2. Zodスキーマ

```typescript
// packages/shared/src/types/rag/graph/schemas.ts

import { z } from "zod";
import { uuidSchema, timestampedSchema, metadataSchema } from "../schemas";

/**
 * エンティティタイプスキーマ
 */
export const entityTypeSchema = z.enum([
  "person",
  "organization",
  "location",
  "date",
  "event",
  "technology",
  "concept",
  "product",
  "api",
  "function",
  "class",
  "document",
  "section",
  "other",
]);

/**
 * 関係タイプスキーマ
 */
export const relationTypeSchema = z.enum([
  "related_to",
  "part_of",
  "has_part",
  "belongs_to",
  "preceded_by",
  "followed_by",
  "concurrent_with",
  "uses",
  "used_by",
  "implements",
  "extends",
  "depends_on",
  "calls",
  "imports",
  "parent_of",
  "child_of",
  "references",
  "referenced_by",
  "defines",
  "defined_by",
  "authored_by",
  "works_for",
  "collaborates_with",
]);

/**
 * エンティティメンションスキーマ
 */
export const entityMentionSchema = z.object({
  startChar: z.number().int().min(0),
  endChar: z.number().int().min(0),
  surfaceForm: z.string().min(1),
});

/**
 * 関係証拠スキーマ
 */
export const relationEvidenceSchema = z.object({
  chunkId: uuidSchema,
  excerpt: z.string().min(1).max(500),
  confidence: z.number().min(0).max(1),
});

/**
 * エンティティエンティティスキーマ
 */
export const entityEntitySchema = z
  .object({
    id: uuidSchema,
    name: z.string().min(1).max(255),
    normalizedName: z.string().min(1).max(255),
    type: entityTypeSchema,
    description: z.string().max(1000).nullable(),
    aliases: z.array(z.string().min(1).max(255)),
    embedding: z.array(z.number()).nullable(),
    importance: z.number().min(0).max(1),
    metadata: metadataSchema,
  })
  .merge(timestampedSchema);

/**
 * 関係エンティティスキーマ
 */
export const relationEntitySchema = z
  .object({
    id: uuidSchema,
    sourceId: uuidSchema,
    targetId: uuidSchema,
    type: relationTypeSchema,
    description: z.string().max(500).nullable(),
    weight: z.number().min(0).max(1),
    bidirectional: z.boolean(),
    evidence: z.array(relationEvidenceSchema),
    metadata: metadataSchema,
  })
  .merge(timestampedSchema);

/**
 * コミュニティエンティティスキーマ
 */
export const communityEntitySchema = z
  .object({
    id: uuidSchema,
    level: z.number().int().min(0),
    parentId: uuidSchema.nullable(),
    name: z.string().min(1).max(255),
    summary: z.string().max(2000),
    memberEntityIds: z.array(uuidSchema),
    memberCount: z.number().int().min(0),
    embedding: z.array(z.number()).nullable(),
  })
  .merge(timestampedSchema);

/**
 * チャンク-エンティティ関連スキーマ
 */
export const chunkEntityRelationSchema = z.object({
  chunkId: uuidSchema,
  entityId: uuidSchema,
  mentionCount: z.number().int().min(1),
  positions: z.array(entityMentionSchema),
});

/**
 * グラフ統計スキーマ
 */
export const graphStatisticsSchema = z.object({
  entityCount: z.number().int().min(0),
  relationCount: z.number().int().min(0),
  communityCount: z.number().int().min(0),
  averageDegree: z.number().min(0),
  density: z.number().min(0).max(1),
  connectedComponents: z.number().int().min(0),
});

/**
 * エンティティ抽出入力スキーマ
 */
export const entityExtractionInputSchema = z.object({
  chunkId: uuidSchema,
  content: z.string().min(1),
  context: z.string().optional(), // 周辺コンテキスト
  existingEntities: z
    .array(
      z.object({
        name: z.string(),
        type: entityTypeSchema,
      }),
    )
    .optional(), // 既存エンティティ（マージ用）
});

/**
 * 関係抽出入力スキーマ
 */
export const relationExtractionInputSchema = z.object({
  chunkId: uuidSchema,
  content: z.string().min(1),
  entities: z
    .array(
      z.object({
        id: uuidSchema,
        name: z.string(),
        type: entityTypeSchema,
      }),
    )
    .min(2), // 最低2エンティティ必要
});

/**
 * コミュニティ検出設定スキーマ
 */
export const communityDetectionConfigSchema = z.object({
  algorithm: z.enum(["leiden", "louvain"]).default("leiden"),
  resolution: z.number().min(0.1).max(10).default(1.0),
  maxLevels: z.number().int().min(1).max(10).default(3),
  minCommunitySize: z.number().int().min(2).default(3),
  randomSeed: z.number().int().optional(),
});
```

### 3. グラフユーティリティ

```typescript
// packages/shared/src/types/rag/graph/utils.ts

import type {
  EntityEntity,
  RelationEntity,
  CommunityEntity,
  EntityType,
  RelationType,
} from "./types";
import { EntityTypes, RelationTypes } from "./types";

/**
 * エンティティ名の正規化
 */
export const normalizeEntityName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ") // 複数空白を単一に
    .replace(/[^\w\s-]/g, ""); // 特殊文字除去
};

/**
 * 関係の逆関係を取得
 */
export const getInverseRelationType = (
  type: RelationType,
): RelationType | null => {
  const inverseMap: Partial<Record<RelationType, RelationType>> = {
    [RelationTypes.PART_OF]: RelationTypes.HAS_PART,
    [RelationTypes.HAS_PART]: RelationTypes.PART_OF,
    [RelationTypes.BELONGS_TO]: RelationTypes.HAS_PART,
    [RelationTypes.PRECEDED_BY]: RelationTypes.FOLLOWED_BY,
    [RelationTypes.FOLLOWED_BY]: RelationTypes.PRECEDED_BY,
    [RelationTypes.USES]: RelationTypes.USED_BY,
    [RelationTypes.USED_BY]: RelationTypes.USES,
    [RelationTypes.PARENT_OF]: RelationTypes.CHILD_OF,
    [RelationTypes.CHILD_OF]: RelationTypes.PARENT_OF,
    [RelationTypes.REFERENCES]: RelationTypes.REFERENCED_BY,
    [RelationTypes.REFERENCED_BY]: RelationTypes.REFERENCES,
    [RelationTypes.DEFINES]: RelationTypes.DEFINED_BY,
    [RelationTypes.DEFINED_BY]: RelationTypes.DEFINES,
  };

  return inverseMap[type] ?? null;
};

/**
 * エンティティの重要度スコア計算
 * PageRank的なアプローチ
 */
export const calculateEntityImportance = (
  entityId: string,
  relations: RelationEntity[],
  damping: number = 0.85,
  iterations: number = 20,
): number => {
  // 簡易実装: 接続数に基づくスコア
  const inDegree = relations.filter((r) => r.targetId === entityId).length;
  const outDegree = relations.filter((r) => r.sourceId === entityId).length;
  const totalDegree = inDegree + outDegree;

  // 正規化（0-1の範囲に）
  const maxDegree = Math.max(
    ...(new Set([
      ...relations.map((r) => r.sourceId),
      ...relations.map((r) => r.targetId),
    ]).size
      ? [totalDegree]
      : [1]),
  );

  return Math.min(1, totalDegree / (maxDegree * 2));
};

/**
 * コミュニティ名の自動生成（メンバーエンティティから）
 */
export const generateCommunityName = (members: EntityEntity[]): string => {
  if (members.length === 0) return "Empty Community";
  if (members.length === 1) return members[0].name;

  // 最も重要なエンティティ上位3つを使用
  const topMembers = [...members]
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 3);

  const names = topMembers.map((m) => m.name);
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names[0]}, ${names[1]} & others`;
};

/**
 * エンティティタイプのカテゴリ分類
 */
export const getEntityTypeCategory = (type: EntityType): string => {
  const categories: Record<string, EntityType[]> = {
    person: [EntityTypes.PERSON],
    place: [EntityTypes.LOCATION, EntityTypes.ORGANIZATION],
    time: [EntityTypes.DATE, EntityTypes.EVENT],
    technical: [
      EntityTypes.TECHNOLOGY,
      EntityTypes.CONCEPT,
      EntityTypes.PRODUCT,
      EntityTypes.API,
      EntityTypes.FUNCTION,
      EntityTypes.CLASS,
    ],
    document: [EntityTypes.DOCUMENT, EntityTypes.SECTION],
    other: [EntityTypes.OTHER],
  };

  for (const [category, types] of Object.entries(categories)) {
    if (types.includes(type)) return category;
  }

  return "other";
};

/**
 * 関係の強度による色分け用
 */
export const getRelationWeightColor = (weight: number): string => {
  if (weight >= 0.8) return "#22c55e"; // green-500
  if (weight >= 0.6) return "#84cc16"; // lime-500
  if (weight >= 0.4) return "#eab308"; // yellow-500
  if (weight >= 0.2) return "#f97316"; // orange-500
  return "#ef4444"; // red-500
};

/**
 * グラフ密度計算
 * density = 2 * edges / (nodes * (nodes - 1))
 */
export const calculateGraphDensity = (
  nodeCount: number,
  edgeCount: number,
): number => {
  if (nodeCount <= 1) return 0;
  const maxEdges = (nodeCount * (nodeCount - 1)) / 2;
  return edgeCount / maxEdges;
};
```

### 4. バレルエクスポート

```typescript
// packages/shared/src/types/rag/graph/index.ts

export * from "./types";
export * from "./schemas";
export * from "./utils";
```

## ディレクトリ構造

```
packages/shared/src/types/rag/graph/
├── index.ts      # バレルエクスポート
├── types.ts      # 型定義
├── schemas.ts    # Zodスキーマ
└── utils.ts      # ユーティリティ関数
```

## 受け入れ条件

- [ ] `EntityEntity`, `RelationEntity`, `CommunityEntity` 型が定義されている
- [ ] `EntityType`, `RelationType` 列挙型が定義されている
- [ ] `ChunkEntityRelation`, `EntityMention` 型が定義されている
- [ ] 全型に対応するZodスキーマが定義されている
- [ ] エンティティ名正規化関数が実装されている
- [ ] 逆関係取得関数が実装されている
- [ ] 重要度・密度計算ユーティリティが実装されている
- [ ] 単体テストが作成されている

## 依存関係

### このタスクが依存するもの

- CONV-03-01: 基本型・共通インターフェース定義

### このタスクに依存するもの

- CONV-04-05: Knowledge Graph テーブル群
- CONV-06-04: エンティティ抽出サービス (NER)
- CONV-06-05: 関係抽出サービス
- CONV-08-01: Knowledge Graph ストア実装
