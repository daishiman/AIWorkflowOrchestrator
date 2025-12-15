# Knowledge Graph構築 - タスク指示書

## メタ情報

| 項目             | 内容                            |
| ---------------- | ------------------------------- |
| タスクID         | CONV-08                         |
| タスク名         | Knowledge Graph構築             |
| 分類             | 要件/新規機能                   |
| 対象機能         | ファイル変換システム（RAG基盤） |
| 優先度           | 高                              |
| 見積もり規模     | 大規模                          |
| ステータス       | 未実施                          |
| 発見元           | HybridRAGアーキテクチャ設計     |
| 発見日           | 2025-12-15                      |
| 発見エージェント | @logic-dev                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

HybridRAG（GraphRAG + VectorRAG統合）において、**Knowledge Graph**はグローバルクエリ・関係性クエリの精度向上に不可欠。ベンチマークでは、GraphRAG単体で81.67%、HybridRAGで90%+の正解率を実現（Lettria 2025）。

### 1.2 問題点・課題

- VectorRAG単体では「全体のテーマは？」等のグローバルクエリに対応不可（正解率0%）
- エンティティ間の関係性を捉えられない
- マルチホップ推論が困難
- 5つ以上のエンティティを含むクエリで精度が著しく低下

### 1.3 放置した場合の影響

- RAG精度が57.50%（VectorRAG単体）に留まる
- グローバル/テーマ的クエリに回答できない
- 関係性・因果関係の質問に対応できない

---

## 2. 何を達成するか（What）

### 2.1 目的

ドキュメントからエンティティと関係性を抽出し、Knowledge Graphを構築。コミュニティ検出と要約生成によりグローバルクエリに対応する。

### 2.2 最終ゴール

- **エンティティ抽出**: NER（固有表現認識）による自動抽出
- **関係抽出**: エンティティ間の関係性を識別
- **Knowledge Graph構築**: エンティティ・関係のグラフDB保存
- **コミュニティ検出**: Leidenアルゴリズムによるクラスタリング
- **コミュニティ要約**: LLMによる各コミュニティの要約生成
- **グラフ検索API**: トラバーサル・類似検索の提供

### 2.3 スコープ

#### 含むもの

- エンティティ抽出サービス（LLMベース or NERモデル）
- 関係抽出サービス
- Knowledge Graphストア（SQLiteベース）
- コミュニティ検出（Leidenアルゴリズム）
- コミュニティ要約生成
- グラフトラバーサルAPI
- エンティティ埋め込み生成

#### 含まないもの

- 外部グラフDB（Neo4j等）連携（将来対応）
- リアルタイムグラフ更新
- グラフ可視化UI

### 2.4 成果物

- `packages/shared/src/services/graph/` - グラフサービスディレクトリ
- `packages/shared/src/services/graph/entity-extractor.ts` - エンティティ抽出
- `packages/shared/src/services/graph/relation-extractor.ts` - 関係抽出
- `packages/shared/src/services/graph/knowledge-graph-store.ts` - グラフストア
- `packages/shared/src/services/graph/community-detector.ts` - コミュニティ検出
- `packages/shared/src/services/graph/graph-search-service.ts` - グラフ検索
- ユニットテスト・統合テスト

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- CONV-06（埋め込み + エンティティ抽出基盤）完了
- CONV-04（データベース・グラフテーブル）完了
- LLM API（Claude/GPT）利用可能

### 3.2 依存タスク

- CONV-04: データベーススキーマ（entities, relations, communities テーブル）
- CONV-06: 埋め込み生成パイプライン（チャンクデータ）
- CONV-03: JSONスキーマ定義（Entity, Relation型）

### 3.3 必要な知識・スキル

- 知識グラフの概念
- NER（固有表現認識）
- 関係抽出
- グラフアルゴリズム（Leiden, コミュニティ検出）
- LLMプロンプトエンジニアリング
- TypeScript

### 3.4 推奨アプローチ

1. エンティティ抽出サービスを実装（LLMベース）
2. 関係抽出サービスを実装
3. Knowledge Graphストアを実装
4. コミュニティ検出を実装
5. コミュニティ要約生成を実装
6. グラフ検索APIを実装

---

## 4. 実行手順

### Phase構成

```
Phase 0: 要件定義 → Phase 1: 設計 → Phase 2: 設計レビュー →
Phase 3: テスト作成 → Phase 4: 実装 → Phase 5: リファクタリング →
Phase 6: 品質保証 → Phase 7: 最終レビュー → Phase 8: 手動テスト
```

### Phase 0: 要件定義

#### 目的

Knowledge Graph構築の詳細要件を明確化する。

#### 使用エージェント

- **エージェント**: @logic-dev
- **選定理由**: グラフアルゴリズム・ビジネスロジック実装に特化

#### 成果物

- Knowledge Graph要件定義書
- エンティティタイプ一覧
- 関係タイプ一覧

#### 完了条件

- [ ] エンティティタイプが決定（person, organization, concept, etc.）
- [ ] 関係タイプが決定（belongs_to, related_to, causes, etc.）
- [ ] コミュニティ階層レベルが決定

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] エンティティ抽出が動作
- [ ] 関係抽出が動作
- [ ] Knowledge Graphが構築される
- [ ] コミュニティ検出が動作
- [ ] コミュニティ要約が生成される
- [ ] グラフトラバーサル検索が動作
- [ ] エンティティ類似検索が動作

### 品質要件

- [ ] 全テストがパス
- [ ] TypeScript型エラーなし
- [ ] ESLint警告なし
- [ ] テストカバレッジ80%以上
- [ ] 1000チャンクのグラフ構築が10分以内

### ドキュメント要件

- [ ] 各サービスのJSDocが記述
- [ ] エンティティ/関係タイプの定義が文書化
- [ ] グラフ検索APIの使用方法が文書化

---

## 6. 検証方法

### テストケース

1. エンティティ抽出の正確性
2. 関係抽出の正確性
3. コミュニティ検出の妥当性
4. グラフトラバーサルの動作
5. グローバルクエリへの応答品質

### 検証手順

1. `pnpm --filter @repo/shared test:run` でユニットテスト実行
2. サンプルドキュメントでのグラフ構築テスト
3. グローバルクエリでの精度評価

---

## 7. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                          |
| ------------------------ | ------ | -------- | ----------------------------- |
| エンティティ抽出の精度   | 高     | 中       | LLMプロンプト調整、モデル選定 |
| グラフ構築のコスト       | 中     | 高       | バッチ処理、増分更新          |
| コミュニティ検出の計算量 | 中     | 中       | 階層レベル制限、サンプリング  |
| 要約生成のLLMコスト      | 中     | 中       | キャッシュ、要約の再利用      |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/00-requirements/master_system_design.md`
- CONV-04: データベース設計（グラフテーブル）
- CONV-06: 埋め込み生成パイプライン（入力データ）
- CONV-07: HybridRAG検索エンジン（利用先）

### 参考資料

- [Microsoft GraphRAG](https://github.com/microsoft/graphrag)
- [GraphRAG: Query-Focused Summarization](https://arxiv.org/abs/2404.16130)
- [Leiden Algorithm](https://www.nature.com/articles/s41598-019-41695-z)
- [HybridRAG Paper](https://arxiv.org/abs/2408.04948)
- [AWS GraphRAG Implementation](https://aws.amazon.com/blogs/machine-learning/improving-retrieval-augmented-generation-accuracy-with-graphrag/)

---

## 9. 備考

### 推奨実装構造

```typescript
// =============================================================================
// エンティティ抽出
// =============================================================================
interface EntityExtractor {
  extract(text: string): Promise<ExtractedEntity[]>;
}

interface ExtractedEntity {
  name: string;
  type: EntityType;
  description?: string;
  mentions: { start: number; end: number }[];
}

type EntityType =
  | "person"
  | "organization"
  | "location"
  | "concept"
  | "technology"
  | "event"
  | "document";

// LLMベースのエンティティ抽出プロンプト
const entityExtractionPrompt = `
以下のテキストから重要なエンティティ（人物、組織、概念、技術等）を抽出してください。

テキスト:
{text}

JSON形式で出力:
[
  { "name": "エンティティ名", "type": "タイプ", "description": "簡潔な説明" }
]
`;

// =============================================================================
// 関係抽出
// =============================================================================
interface RelationExtractor {
  extract(
    text: string,
    entities: ExtractedEntity[],
  ): Promise<ExtractedRelation[]>;
}

interface ExtractedRelation {
  sourceEntity: string;
  targetEntity: string;
  relationType: RelationType;
  description?: string;
}

type RelationType =
  | "belongs_to"
  | "related_to"
  | "causes"
  | "depends_on"
  | "created_by"
  | "uses"
  | "part_of";

// =============================================================================
// Knowledge Graph Store
// =============================================================================
interface KnowledgeGraphStore {
  // エンティティ操作
  upsertEntity(entity: Entity): Promise<void>;
  getEntity(id: string): Promise<Entity | null>;
  findSimilarEntities(embedding: number[], limit: number): Promise<Entity[]>;

  // 関係操作
  addRelation(relation: Relation): Promise<void>;
  getRelations(
    entityId: string,
    direction?: "in" | "out" | "both",
  ): Promise<Relation[]>;

  // グラフトラバーサル
  traverse(
    startEntityId: string,
    maxDepth: number,
    relationTypes?: RelationType[],
  ): Promise<GraphTraversalResult>;

  // コミュニティ操作
  getCommunities(level: number): Promise<Community[]>;
  getCommunityByEntity(entityId: string): Promise<Community | null>;
}

// =============================================================================
// コミュニティ検出（Leidenアルゴリズム）
// =============================================================================
interface CommunityDetector {
  detect(graph: Graph): Promise<CommunityStructure>;
}

interface CommunityStructure {
  communities: Community[];
  levels: number; // 階層レベル数
  modularity: number; // モジュラリティスコア
}

interface Community {
  id: string;
  level: number;
  memberEntityIds: string[];
  parentCommunityId?: string;
  summary?: string;
  summaryEmbedding?: number[];
}

// =============================================================================
// コミュニティ要約生成
// =============================================================================
interface CommunitySummarizer {
  summarize(community: Community, entities: Entity[]): Promise<string>;
}

const communitySummaryPrompt = `
以下のエンティティグループの共通テーマや特徴を要約してください。

エンティティ:
{entities}

関係性:
{relations}

要約（100-200トークン）:
`;

// =============================================================================
// グラフ検索サービス
// =============================================================================
interface GraphSearchService {
  // エンティティベース検索
  searchByEntity(query: string): Promise<GraphSearchResult[]>;

  // 関係ベース検索
  searchByRelation(
    sourceHint: string,
    relationHint: string,
    targetHint: string,
  ): Promise<GraphSearchResult[]>;

  // コミュニティベース検索（グローバルクエリ用）
  searchByCommunity(query: string): Promise<CommunitySearchResult[]>;

  // マルチホップ検索
  multiHopSearch(
    query: string,
    maxHops: number,
  ): Promise<MultiHopSearchResult[]>;
}
```

### GraphRAG処理フロー

```
┌─────────────────────────────────────────────────────────────────┐
│                    Knowledge Graph 構築フロー                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [ドキュメントチャンク]                                          │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────┐                                           │
│  │ エンティティ抽出 │  LLM/NERモデルで重要エンティティを識別     │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │   関係抽出      │  エンティティ間の関係を識別                │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ グラフ構築・保存 │  entities, relations テーブルに保存       │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ コミュニティ検出 │  Leidenアルゴリズムでクラスタリング        │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ コミュニティ要約 │  各クラスタの特徴をLLMで要約              │
│  │   生成          │  要約の埋め込みも生成                      │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  [Knowledge Graph 完成]                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### ベンチマーク目標

| 指標                 | 目標値   | 備考                 |
| -------------------- | -------- | -------------------- |
| エンティティ抽出精度 | 85%+     | F1スコア             |
| 関係抽出精度         | 75%+     | F1スコア             |
| グラフ構築時間       | < 10分   | 1000チャンク         |
| グローバルクエリ精度 | 80%+     | GraphRAG単体         |
| HybridRAG統合精度    | **90%+** | VectorRAG + GraphRAG |

### 補足事項

- このタスクはCONV-06（埋め込み生成）完了後に実装
- 初期実装はLLMベースのエンティティ抽出（精度重視）
- 将来的にはNERモデル（速度重視）への切り替えも検討
- コミュニティ要約は一度生成後キャッシュし、グラフ更新時のみ再生成
