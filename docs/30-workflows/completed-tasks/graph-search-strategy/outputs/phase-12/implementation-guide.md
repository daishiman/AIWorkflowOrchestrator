# GraphSearchStrategy 実装ガイド

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 12                       |
| 対象       | graph-search-strategy.ts |
| 作成日     | 2026-01-13               |
| バージョン | 1.0.0                    |

---

# Part 1: 概念的説明（中学生でもわかる版）

## GraphSearchStrategyって何？

### たとえ話：図書館の司書さん

GraphSearchStrategy（グラフサーチストラテジー）は、**超優秀な図書館の司書さん**のようなものです。

普通の検索は「この言葉が含まれている本を探して」というだけですが、GraphSearchStrategyは：

1. **「この著者は誰と関係があるの？」** → 関係検索
2. **「この分野全体の概要を教えて」** → グローバル検索
3. **「この特定のトピックについて詳しく教えて」** → ローカル検索

こういった「つながり」を理解した検索ができます。

```
┌─────────────────────────────────────────────────────────────┐
│                    Knowledge Graph                          │
│                    （知識のつながり図）                        │
│                                                             │
│     [TypeScript] ───関係──→ [型定義]                        │
│          │                      │                           │
│          ↓                      ↓                           │
│     [JavaScript]            [interface]                     │
│          │                      │                           │
│          └──────────┬──────────┘                           │
│                     │                                       │
│                     ↓                                       │
│              [プログラミング]                                │
│                     │                                       │
│                     ↓                                       │
│        [コミュニティ: フロントエンド技術]                     │
└─────────────────────────────────────────────────────────────┘
```

## 3つの検索モード

### 1. ローカル検索（Local Search）

**例え：特定の本を探す**

「TypeScriptの型定義について教えて」と聞くと、TypeScriptに直接関係するチャンク（情報の断片）を探してきます。

```
質問: 「TypeScriptの型定義について」
     ↓
[TypeScript] という「エンティティ（概念）」を見つける
     ↓
関連するチャンク（情報）を取得
     ↓
結果: TypeScriptの型システムに関する説明
```

### 2. グローバル検索（Global Search）

**例え：本棚のジャンル全体を説明してもらう**

「プロジェクト全体の設計思想を教えて」と聞くと、個別の情報ではなく、プロジェクト全体を俯瞰した「サマリ（要約）」を返します。

```
質問: 「プロジェクト全体の設計思想」
     ↓
[フロントエンド技術] というコミュニティ（グループ）を見つける
     ↓
そのコミュニティのサマリ（要約）を取得
     ↓
結果: 「このプロジェクトはReactとTypeScriptを使用し...」
```

### 3. 関係検索（Relationship Search）

**例え：「この著者とあの著者の関係は？」**

「UserServiceとDatabaseの関連を教えて」と聞くと、2つの概念がどのようにつながっているかを探します。

```
質問: 「UserServiceとDatabaseの関連」
     ↓
[UserService] と [Database] の2つのエンティティを見つける
     ↓
2つをつなぐ「パス（道筋）」を探す
     ↓
結果: UserService → Repository → Database
```

## 用語集（読み方付き）

| 用語                | 読み方                   | 意味                                    |
| ------------------- | ------------------------ | --------------------------------------- |
| GraphSearchStrategy | グラフサーチストラテジー | グラフ（つながり）を使った検索方法      |
| Knowledge Graph     | ナレッジグラフ           | 知識のつながりを表す図・データ構造      |
| Entity              | エンティティ             | 概念や物事（例：TypeScript、Database）  |
| Relation            | リレーション             | エンティティ同士のつながり              |
| Community           | コミュニティ             | 関連するエンティティのグループ          |
| Chunk               | チャンク                 | 情報の断片（ドキュメントの一部分）      |
| Embedding           | エンベディング           | テキストを数値の配列に変換したもの      |
| Traversal           | トラバーサル             | グラフをたどって探索すること            |
| Query Type          | クエリタイプ             | 検索の種類（local/global/relationship） |

---

# Part 2: 技術的詳細

## アーキテクチャ

### レイヤー構造

```
┌───────────────────────────────────────────────────────────────┐
│                    HybridRAGSearcher                          │
│  (検索の司令塔 - 複数の検索戦略を束ねる)                       │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐│
│  │KeywordStrategy  │  │ VectorStrategy  │  │ GraphStrategy   ││
│  │(キーワード検索)  │  │(ベクトル検索)   │  │(グラフ検索)     ││
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘│
│           │                    │                    │         │
└───────────┼────────────────────┼────────────────────┼─────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌───────────────────┐  ┌─────────────────┐  ┌─────────────────────┐
│    FTS5 Engine    │  │   VectorStore   │  │  IKnowledgeGraphStore │
│  (全文検索DB)     │  │ (ベクトルDB)    │  │  (グラフDB)          │
└───────────────────┘  └─────────────────┘  └─────────────────────┘
```

### 依存関係図

```
GraphSearchStrategy
      │
      ├── IKnowledgeGraphStore (必須)
      │     ├── findSimilarEntities()
      │     ├── findShortestPath()
      │     └── traverse()
      │
      ├── IEmbeddingProvider (必須)
      │     └── embed()
      │
      └── ICommunitySummarizer (オプション)
            └── searchSummaries()
```

## クラス構造

### コンストラクタ

```typescript
// GraphSearchStrategyの作成
// - graphStore: Knowledge Graph へのアクセス（必須）
// - embeddingProvider: テキスト→ベクトル変換（必須）
// - communitySummarizer: コミュニティサマリ検索（オプション）
constructor(
  private readonly graphStore: IKnowledgeGraphStore,
  private readonly embeddingProvider: IEmbeddingProvider,
  private readonly communitySummarizer?: ICommunitySummarizer,
) {}
```

### メインメソッド

```typescript
// 検索を実行する
// - query: 検索クエリ（例: "TypeScriptの型定義"）
// - limit: 最大結果数（1〜100）
// - filters: フィルタ条件（オプション）
// - options: クエリタイプなどのオプション
async search(
  query: string,
  limit: number,
  filters?: SearchFilters,
  options?: GraphSearchOptions,
): Promise<Result<SearchResultItem[], Error>>
```

### GraphSearchOptions

```typescript
interface GraphSearchOptions {
  // 検索タイプ: "local" | "global" | "relationship"
  queryType?: "local" | "global" | "relationship";

  // エンティティ類似度の閾値（0〜1、デフォルト0.5）
  entityThreshold?: number;

  // トラバーサル深度（1〜5、デフォルト3）
  traversalDepth?: number;

  // 関係タイプでフィルタ
  relationTypes?: string[];
}
```

## 各検索メソッドの詳細

### localSearch（ローカル検索）

```typescript
// 処理フロー
// 1. クエリを埋め込みベクトルに変換
// 2. 類似エンティティを検索
// 3. 各エンティティのチャンクを取得
// 4. スコア計算: エンティティ類似度×0.6 + チャンク関連度×0.4

const score = entitySimilarity * 0.6 + chunkRelevance * 0.4;
```

### globalSearch（グローバル検索）

```typescript
// 処理フロー
// 1. CommunitySummarizerでサマリを検索
// 2. サマリの信頼度をスコアとして使用
// 3. フォールバック: CommunitySummarizer未設定時 → localSearch

// フォールバック条件
if (!this.communitySummarizer) {
  return this.localSearch(query, limit, filters, options);
}
```

### relationshipSearch（関係検索）

```typescript
// 処理フロー
// 1. クエリからエンティティを抽出
// 2. エンティティ間の最短パスを検索
// 3. トラバーサルで関連エンティティを取得
// 4. スコア計算: 距離ベースのスコアリング

// フォールバック条件
// - 0エンティティ → 空配列
// - 1エンティティ → localSearch
// - 2+エンティティ → パス検索 + トラバーサル
```

## スコアリング計算

### ローカルスコア

```
スコア = エンティティ類似度 × 0.6 + チャンク関連度 × 0.4
        (0〜1の範囲)            (0〜1の範囲)
```

### パス/トラバーサルスコア

```
スコア = (1 / (1 + 距離)) × 0.5 + チャンク関連度 × 0.5

例: 距離1 → (1/2) × 0.5 = 0.25
    距離2 → (1/3) × 0.5 = 0.17
```

## エラーハンドリング

### Result型パターン

```typescript
// 成功時
return ok(results); // Result.isOk() === true

// エラー時
return err(new Error("エラーメッセージ")); // Result.isErr() === true
```

### バリデーション

| 項目           | 制限                      | エラーメッセージ                  |
| -------------- | ------------------------- | --------------------------------- |
| query          | 1〜1000文字、空白のみ不可 | "Query cannot be empty"           |
| limit          | 1〜100                    | "Limit must be between 1 and 100" |
| traversalDepth | 最大5                     | 自動的に5に制限                   |

## 使用例

### 基本的な使用

```typescript
// 1. 戦略の作成
const strategy = new GraphSearchStrategy(
  graphStore,
  embeddingProvider,
  communitySummarizer, // オプション
);

// 2. ローカル検索
const localResult = await strategy.search(
  "TypeScriptの型定義について",
  10,
  undefined,
  { queryType: "local" },
);

if (localResult.isOk()) {
  console.log(localResult.value); // SearchResultItem[]
}
```

### HybridRAGSearcherとの統合

```typescript
// HybridRAGSearcherに3つの戦略を登録
const searcher = new HybridRAGSearcher({
  strategies: [
    new KeywordSearchStrategy(fts5Engine),
    new VectorSearchStrategy(vectorStore, embeddingProvider),
    new GraphSearchStrategy(graphStore, embeddingProvider, communitySummarizer),
  ],
  mergeStrategy: new RRFMergeStrategy(),
});

// 検索実行 - 3つの戦略の結果がマージされる
const result = await searcher.search("プロジェクト管理について");
```

## メトリクス

```typescript
// 検索後にメトリクスを取得
const metrics = strategy.getMetrics();

// StrategyMetric構造
{
  enabled: true,           // 戦略が有効か
  resultCount: 5,          // 結果件数
  processingTime: 42,      // 処理時間（ms）
  topScore: 0.85,          // 最高スコア
}
```

---

## 設計原則

### SOLID準拠

| 原則                 | 適用                            |
| -------------------- | ------------------------------- |
| 単一責任             | クラスはグラフ検索のみを担当    |
| 開放閉鎖             | queryTypeで検索タイプを拡張可能 |
| リスコフ置換         | ISearchStrategyを正しく実装     |
| インターフェース分離 | 必要なメソッドのみ依存          |
| 依存性逆転           | 抽象（インターフェース）に依存  |

### コードスメル排除

| 対策         | 実装                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| DRY          | clampScore(), calculateDistanceBasedScore(), finalizeResults()で共通処理を抽出 |
| 早期リターン | 空結果時に即座にok([])を返却                                                   |
| 明確な命名   | 各メソッド名が処理内容を表現                                                   |
