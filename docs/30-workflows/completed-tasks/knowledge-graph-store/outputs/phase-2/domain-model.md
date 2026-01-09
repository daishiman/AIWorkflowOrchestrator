# ドメインモデル設計 - Knowledge Graph ストア

## 文書情報

| 項目           | 内容       |
| -------------- | ---------- |
| タスクID       | CONV-08-01 |
| Phase          | 2          |
| 文書バージョン | 1.0.0      |
| 作成日         | 2026-01-09 |

---

## 1. ドメインモデル概要

### 1.1 モデル分類

```
┌─────────────────────────────────────────────────────────────────┐
│                      Knowledge Graph Domain                      │
├─────────────────────────────────────────────────────────────────┤
│  Entity (同一性あり)                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │StoredEntity │  │StoredRelation│  │GraphTraversalResult     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  Value Object (値のみで等価)                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │GraphNode    │  │GraphPath    │  │GraphStats               │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  Query Object (検索条件)                                         │
│  ┌─────────────┐  ┌───────────────────────────────────────────┐ │
│  │EntityQuery  │  │TraversalOptions                           │ │
│  └─────────────┘  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Entity型

### 2.1 StoredEntity

永続化されたエンティティを表現。IDによる同一性保証。

```typescript
/**
 * 永続化されたエンティティ
 *
 * @description
 * DBに格納されたエンティティの状態を表現。
 * ExtractedEntityから変換され、追加のメタデータを持つ。
 */
export interface StoredEntity {
  /** エンティティ一意識別子 */
  readonly id: EntityId;

  /** エンティティ名（元の表記） */
  readonly name: string;

  /** 正規化名（小文字・特殊文字除去） */
  readonly normalizedName: string;

  /** エンティティタイプ */
  readonly type: EntityType;

  /** 説明文（オプション） */
  readonly description: string | null;

  /** 別名リスト */
  readonly aliases: readonly string[];

  /** 埋め込みベクトル（オプション） */
  readonly embedding: number[] | null;

  /** 関連チャンクIDリスト */
  readonly chunkIds: readonly ChunkId[];

  /** 出現回数 */
  readonly mentionCount: number;

  /** 重要度スコア (0.0-1.0) */
  readonly importance: number;

  /** 追加属性（JSON） */
  readonly attributes: Record<string, unknown> | null;

  /** 作成日時 */
  readonly createdAt: Date;

  /** 更新日時 */
  readonly updatedAt: Date;
}
```

### 2.2 StoredRelation

永続化された関係を表現。

```typescript
/**
 * 永続化された関係
 *
 * @description
 * エンティティ間の関係をエッジとして表現。
 * 重み付きで、証拠情報を保持。
 */
export interface StoredRelation {
  /** 関係一意識別子 */
  readonly id: RelationId;

  /** ソースエンティティID */
  readonly sourceEntityId: EntityId;

  /** ターゲットエンティティID */
  readonly targetEntityId: EntityId;

  /** 関係タイプ */
  readonly relationType: RelationType;

  /** 説明文（オプション） */
  readonly description: string | null;

  /** 関係の強さ (累積重み) */
  readonly weight: number;

  /** 証拠リスト */
  readonly evidence: readonly RelationEvidence[];

  /** 双方向フラグ */
  readonly bidirectional: boolean;

  /** 追加属性（JSON） */
  readonly attributes: Record<string, unknown> | null;

  /** 作成日時 */
  readonly createdAt: Date;

  /** 更新日時 */
  readonly updatedAt: Date;
}
```

### 2.3 GraphTraversalResult

トラバーサル結果を表現。

```typescript
/**
 * グラフトラバーサル結果
 */
export interface GraphTraversalResult {
  /** 開始エンティティ */
  readonly startEntity: StoredEntity;

  /** 発見されたパスリスト */
  readonly paths: readonly GraphPath[];

  /** 訪問したエンティティリスト */
  readonly visitedEntities: readonly StoredEntity[];

  /** 到達した最大深度 */
  readonly maxDepthReached: number;
}
```

---

## 3. Value Object型

### 3.1 RelationEvidence

関係の証拠（不変オブジェクト）。

```typescript
/**
 * 関係の証拠
 *
 * @description
 * 関係が抽出されたチャンクと抜粋テキストを保持。
 */
export interface RelationEvidence {
  /** 証拠となるチャンクID */
  readonly chunkId: ChunkId;

  /** 抜粋テキスト (1-500文字) */
  readonly text: string;

  /** 信頼度 (0.0-1.0) */
  readonly confidence: number;
}
```

### 3.2 GraphNode

グラフノードとその関係を表現。

```typescript
/**
 * グラフノード
 *
 * @description
 * エンティティとその入出力関係をまとめたビュー。
 */
export interface GraphNode {
  /** エンティティ本体 */
  readonly entity: StoredEntity;

  /** 入力方向の関係（このノードがtarget） */
  readonly inRelations: readonly StoredRelation[];

  /** 出力方向の関係（このノードがsource） */
  readonly outRelations: readonly StoredRelation[];
}
```

### 3.3 GraphPath

エンティティ間のパスを表現。

```typescript
/**
 * グラフパス
 *
 * @description
 * エンティティの連なりと、その間の関係を表現。
 */
export interface GraphPath {
  /** パス上のエンティティリスト（順序付き） */
  readonly entities: readonly StoredEntity[];

  /** パス上の関係リスト（entities間） */
  readonly relations: readonly StoredRelation[];

  /** パスの総重み（関係weightの合計） */
  readonly totalWeight: number;
}
```

### 3.4 GraphStats

グラフ統計情報。

```typescript
/**
 * グラフ統計情報
 */
export interface GraphStats {
  /** エンティティ総数 */
  readonly entityCount: number;

  /** 関係総数 */
  readonly relationCount: number;

  /** エンティティタイプ別分布 */
  readonly entityTypeDistribution: Readonly<Record<EntityType, number>>;

  /** 関係タイプ別分布 */
  readonly relationTypeDistribution: Readonly<Record<RelationType, number>>;

  /** エンティティあたり平均関係数 */
  readonly averageRelationsPerEntity: number;

  /** グラフ密度 (0.0-1.0) */
  readonly graphDensity: number;
}
```

---

## 4. Query Object型

### 4.1 EntityQuery

エンティティ検索条件。

```typescript
/**
 * エンティティ検索条件
 */
export interface EntityQuery {
  /** タイプフィルタ */
  readonly types?: readonly EntityType[];

  /** 名前パターン (LIKE検索用) */
  readonly namePattern?: string;

  /** 最小出現回数 */
  readonly minMentionCount?: number;

  /** チャンクIDフィルタ */
  readonly chunkIds?: readonly ChunkId[];

  /** 取得件数上限 */
  readonly limit?: number;

  /** オフセット（ページネーション） */
  readonly offset?: number;
}
```

### 4.2 TraversalOptions

トラバーサルオプション。

```typescript
/**
 * トラバーサルオプション
 */
export interface TraversalOptions {
  /** 最大探索深度 */
  readonly maxDepth: number;

  /** 関係タイプフィルタ */
  readonly relationTypes?: readonly RelationType[];

  /** 探索方向 */
  readonly direction?: "in" | "out" | "both";

  /** 最大ノード数 */
  readonly maxNodes?: number;

  /** 最小関係重み */
  readonly minRelationWeight?: number;
}
```

### 4.3 RelationQueryOptions

関係取得オプション。

```typescript
/**
 * 関係取得オプション
 */
export interface RelationQueryOptions {
  /** 方向フィルタ */
  readonly direction?: "in" | "out" | "both";

  /** 関係タイプフィルタ */
  readonly types?: readonly RelationType[];
}
```

---

## 5. 入力型（抽出サービスからの入力）

### 5.1 ExtractedEntity

抽出サービスからの入力エンティティ。

```typescript
/**
 * 抽出されたエンティティ（入力型）
 *
 * @description
 * エンティティ抽出サービスから渡されるデータ。
 * StoredEntityに変換して永続化される。
 */
export interface ExtractedEntity {
  /** エンティティ名 */
  readonly name: string;

  /** エンティティタイプ */
  readonly type: EntityType;

  /** 信頼度 (0.0-1.0) */
  readonly confidence: number;

  /** 説明文（オプション） */
  readonly description?: string;

  /** 別名リスト */
  readonly aliases?: readonly string[];

  /** 埋め込みベクトル（オプション） */
  readonly embedding?: readonly number[];

  /** 抽出元チャンクID */
  readonly chunkId?: ChunkId;

  /** メンション情報（オプション） */
  readonly mentions?: readonly EntityMention[];
}

/**
 * エンティティメンション位置
 */
export interface EntityMention {
  readonly startChar: number;
  readonly endChar: number;
  readonly surfaceForm: string;
}
```

### 5.2 ExtractedRelation

抽出サービスからの入力関係。

```typescript
/**
 * 抽出された関係（入力型）
 */
export interface ExtractedRelation {
  /** ソースエンティティ名または正規化名 */
  readonly sourceName: string;

  /** ターゲットエンティティ名または正規化名 */
  readonly targetName: string;

  /** 関係タイプ */
  readonly type: RelationType;

  /** 説明文（オプション） */
  readonly description?: string;

  /** 信頼度 */
  readonly confidence: number;

  /** 双方向フラグ */
  readonly bidirectional?: boolean;

  /** 証拠情報 */
  readonly evidence: RelationEvidence;
}
```

---

## 6. 型変換ルール

### 6.1 ExtractedEntity → StoredEntity

| ExtractedEntityフィールド | StoredEntityフィールド | 変換ロジック              |
| ------------------------- | ---------------------- | ------------------------- |
| -                         | id                     | UUID生成                  |
| name                      | name                   | そのままコピー            |
| name                      | normalizedName         | 小文字化 + 特殊文字除去   |
| type                      | type                   | そのままコピー            |
| description               | description            | そのままコピー (null許容) |
| aliases                   | aliases                | 既存とマージ（重複除去）  |
| embedding                 | embedding              | 最新値で上書き            |
| chunkId                   | chunkIds               | 既存配列に追加            |
| confidence                | importance             | 初期値として使用          |
| -                         | mentionCount           | 新規:1 / マージ:+1        |
| -                         | attributes             | null（初期値）            |
| -                         | createdAt              | 現在時刻                  |
| -                         | updatedAt              | 現在時刻                  |

### 6.2 ExtractedRelation → StoredRelation

| ExtractedRelationフィールド | StoredRelationフィールド | 変換ロジック                      |
| --------------------------- | ------------------------ | --------------------------------- |
| -                           | id                       | UUID生成                          |
| sourceName                  | sourceEntityId           | 正規化名でエンティティ検索        |
| targetName                  | targetEntityId           | 正規化名でエンティティ検索        |
| type                        | relationType             | そのままコピー                    |
| description                 | description              | そのままコピー (null許容)         |
| confidence                  | weight                   | 初期値として使用 / マージ時は累積 |
| evidence                    | evidence                 | 既存配列に追加                    |
| bidirectional               | bidirectional            | デフォルト: false                 |
| -                           | attributes               | null（初期値）                    |
| -                           | createdAt                | 現在時刻                          |
| -                           | updatedAt                | 現在時刻                          |

---

## 7. ビジネスルール（不変条件）

### 7.1 StoredEntity

| ルール            | 説明                          |
| ----------------- | ----------------------------- |
| 一意性            | (normalizedName, type) は一意 |
| 名前必須          | name は空文字不可             |
| 正規化名生成      | normalizedName は自動計算     |
| mentionCount >= 1 | 少なくとも1回は言及されている |
| importance範囲    | 0.0 <= importance <= 1.0      |

### 7.2 StoredRelation

| ルール        | 説明                              |
| ------------- | --------------------------------- |
| Self-loop禁止 | sourceEntityId !== targetEntityId |
| Evidence必須  | evidence.length >= 1              |
| 一意性        | (source, target, type) は一意     |
| weight範囲    | weight > 0                        |

---

## 8. 正規化関数

```typescript
/**
 * エンティティ名の正規化
 *
 * @param name 元のエンティティ名
 * @returns 正規化された名前
 *
 * @example
 * normalizeEntityName("TypeScript 5.x") // "typescript 5x"
 * normalizeEntityName("React.js") // "reactjs"
 */
export function normalizeEntityName(name: string): string {
  return name
    .toLowerCase() // 小文字化
    .trim() // 前後空白除去
    .replace(/[^\w\s]/g, "") // 特殊文字除去
    .replace(/\s+/g, " "); // 連続空白を単一に
}
```

---

## 9. 変更履歴

| バージョン | 日付       | 変更者 | 変更内容 |
| ---------- | ---------- | ------ | -------- |
| 1.0.0      | 2026-01-09 | Claude | 初版作成 |
