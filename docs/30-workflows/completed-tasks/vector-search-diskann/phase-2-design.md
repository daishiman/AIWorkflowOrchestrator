# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 2                     |
| Phase名    | 設計                  |
| 前提Phase  | Phase 1               |
| 後続Phase  | Phase 3               |
| ステータス | 未実施                |
| 作成日     | 2026-01-12            |
| 機能名     | vector-search-diskann |

---

## 目的

VectorSearchStrategyのアーキテクチャ設計と詳細設計を行い、実装の青写真を作成する。

## 背景

Phase 1で確認した既存インターフェース（ISearchStrategy、IEmbeddingProvider）と libSQLベクトル検索機能を統合したVectorSearchStrategyの設計を行う。設計は100人中100人が同じ理解で実装できる粒度で記述する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: クラス設計

**目的**: VectorSearchStrategyのクラス構造を設計する

**実行手順**:

1. クラス図を作成:

   ```typescript
   class VectorSearchStrategy implements ISearchStrategy {
     readonly name = "semantic";

     constructor(
       private readonly db: DrizzleClient,
       private readonly embeddingProvider: IEmbeddingProvider,
     ) {}

     search(
       query: string,
       limit: number,
       filters?: SearchFilters,
       options?: VectorSearchOptions,
     ): Promise<Result<SearchResult[], Error>>;
     private formatEmbedding(embedding: number[]): string;
     private distanceToSimilarity(distance: number): number;
     private buildFilterClauses(filters?: SearchFilters): FilterClauseResult;
   }
   ```

2. 依存関係図を作成
3. データフロー図を作成

**期待される成果物**:

- クラス設計書（`outputs/phase-2/class-design.md`）

---

### タスク2: メソッド詳細設計

**目的**: 各メソッドの入出力と処理フローを定義する

**実行手順**:

1. search()メソッドの詳細設計:
   - 入力: query (string), limit (number), filters? (SearchFilters), options? (VectorSearchOptions)
   - 処理フロー:
     1. embeddingProvider.embedSingle(query)でクエリ埋め込み生成
     2. buildFilterClauses()でフィルタ条件を構築
     3. SQLクエリを構築（vector_distance_cos使用）
     4. db.execute()で検索実行
     5. 結果をSearchResultItem[]に変換
   - 出力: Result<SearchResult[], Error>

2. formatEmbedding()の設計:
   - Float32Array → `vector('[1.0, 2.0, ...]')` 形式に変換

3. distanceToSimilarity()の設計:
   - コサイン距離（0-2）→ コサイン類似度（0-1）に変換
   - 計算式: `Math.max(0, Math.min(1, 1 - distance / 2))`

4. buildFilterClauses()の設計:
   - フィルタ条件からWHERE句を構築
   - JOINが必要かどうかを判定

**期待される成果物**:

- メソッド詳細設計書（`outputs/phase-2/method-design.md`）

---

### タスク3: SQLクエリ設計

**目的**: libSQLベクトル検索のSQLクエリを設計する

**実行手順**:

1. 基本検索クエリを設計:

   ```sql
   SELECT
     c.id as chunk_id,
     c.content,
     c.file_id,
     c.metadata,
     e.embedding,
     vector_distance_cos(e.embedding, ?) as distance
   FROM embeddings e
   JOIN chunks c ON e.chunk_id = c.id
   WHERE vector_distance_cos(e.embedding, ?) <= ?
   ORDER BY distance ASC
   LIMIT ?
   ```

2. フィルタ付きクエリを設計:
   - fileIds, fileTypes, dateRange, workspaceIds対応
   - JOIN filesが必要な場合の処理

3. パラメータバインディングを設計:
   - SQLインジェクション対策
   - プレースホルダーの順序管理

**期待される成果物**:

- SQLクエリ設計書（`outputs/phase-2/sql-design.md`）

---

### タスク4: VectorSearchOptions設計

**目的**: 検索オプションの型定義を設計する

**実行手順**:

1. VectorSearchOptions型を設計:

   ```typescript
   interface VectorSearchOptions {
     /** コサイン距離の閾値（デフォルト: 0.3） */
     threshold?: number;
     /** インデックスを使用するか（大規模データ用） */
     useIndex?: boolean;
   }
   ```

2. デフォルト値を定義:
   - threshold: 0.3（類似度0.85以上）
   - useIndex: undefined（自動判定）

**期待される成果物**:

- オプション設計書（`outputs/phase-2/options-design.md`）

---

### タスク5: CachedVectorSearchStrategy設計

**目的**: 埋め込みキャッシュ付きバージョンを設計する

**実行手順**:

1. キャッシュ戦略を設計:
   - キャッシュキー: `query.toLowerCase().trim()`
   - キャッシュ期間: 5分
   - キャッシュサイズ制限: Map + 定期クリーンアップ

2. クラス構造を設計:

   ```typescript
   class CachedVectorSearchStrategy implements ISearchStrategy {
     readonly name = "semantic";
     private readonly cache = new Map<string, CacheEntry>();
     private readonly cacheMaxAge = 5 * 60 * 1000;

     constructor(
       private readonly baseStrategy: VectorSearchStrategy,
       private readonly embeddingProvider: IEmbeddingProvider,
     ) {}
   }
   ```

**期待される成果物**:

- キャッシュ設計書（`outputs/phase-2/cache-design.md`）

---

### タスク6: エラーハンドリング設計

**目的**: エラーケースと対応方法を設計する

**実行手順**:

1. エラーケースを列挙:
   - 埋め込み生成失敗（API障害）
   - データベース接続エラー
   - 検索タイムアウト
   - 無効なクエリ（空文字、長すぎる等）

2. エラー対応を設計:
   - Result.err()でエラーを返す
   - エラーメッセージの標準化
   - リトライ戦略（キャッシュ版のみ）

**期待される成果物**:

- エラーハンドリング設計書（`outputs/phase-2/error-handling-design.md`）

---

## 参照資料

| 参照資料                | パス                                                                         | 内容                |
| ----------------------- | ---------------------------------------------------------------------------- | ------------------- |
| RAG検索インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md` | ISearchStrategy定義 |
| RAGアーキテクチャ       | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`      | DiskANN設計パターン |
| Phase 1成果物           | `outputs/phase-1/`                                                           | 要件定義結果        |

---

## 成果物

| 成果物                   | パス                                       | 内容                           |
| ------------------------ | ------------------------------------------ | ------------------------------ |
| クラス設計書             | `outputs/phase-2/class-design.md`          | クラス図・依存関係図           |
| メソッド詳細設計書       | `outputs/phase-2/method-design.md`         | 各メソッドの入出力・処理フロー |
| SQLクエリ設計書          | `outputs/phase-2/sql-design.md`            | ベクトル検索SQLクエリ          |
| オプション設計書         | `outputs/phase-2/options-design.md`        | VectorSearchOptions型定義      |
| キャッシュ設計書         | `outputs/phase-2/cache-design.md`          | CachedVectorSearchStrategy設計 |
| エラーハンドリング設計書 | `outputs/phase-2/error-handling-design.md` | エラーケースと対応方法         |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 2の統合テスト連携アクション**:

- embeddingsテーブル・vector_distance_cos連携を設計に反映
- IEmbeddingProvider → VectorSearchStrategy → SearchResultのデータフロー設計
- DBモック/スタブ設計（テスト支援）

---

## 完了条件

- [ ] VectorSearchStrategyのクラス設計が完了している
- [ ] 全メソッドの詳細設計（入出力・処理フロー）が完了している
- [ ] SQLクエリ設計（基本・フィルタ付き）が完了している
- [ ] VectorSearchOptions型が設計されている
- [ ] CachedVectorSearchStrategyが設計されている
- [ ] エラーケースと対応方法が設計されている
- [ ] 統合ポイント（IEmbeddingProvider、libSQL）が設計に反映されている
- [ ] 全成果物が`outputs/phase-2/`に配置されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3 へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 2 実行記録

### 実行タスク

- タスク1: クラス設計 - [結果]
- タスク2: メソッド詳細設計 - [結果]
- タスク3: SQLクエリ設計 - [結果]
- タスク4: VectorSearchOptions設計 - [結果]
- タスク5: CachedVectorSearchStrategy設計 - [結果]
- タスク6: エラーハンドリング設計 - [結果]

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/vector-search-diskann/phase-3-design-review.md`
