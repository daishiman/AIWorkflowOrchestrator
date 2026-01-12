# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 5                     |
| Phase名    | 実装                  |
| 前提Phase  | Phase 4               |
| 後続Phase  | Phase 6               |
| ステータス | 未実施                |
| 作成日     | 2026-01-12            |
| 機能名     | vector-search-diskann |

---

## 目的

TDDのGreen段階として、Phase 4で作成したテストを通す最小限の実装を行う。

## 背景

テスト駆動開発（TDD）のGreen段階では、テストを通す最小限のコードを書く。過剰な実装や最適化は行わず、まずテストを通すことに集中する。リファクタリングはPhase 8で行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: VectorSearchStrategy基本実装

**目的**: VectorSearchStrategyクラスの骨格を実装する

**実行手順**:

1. ファイルを作成:
   - `packages/shared/src/services/search/strategies/vector-search-strategy.ts`

2. クラスの骨格を実装:

   ```typescript
   import { DrizzleClient } from "@repo/shared/db";
   import { IEmbeddingProvider } from "@repo/shared/services/embedding";
   import { ISearchStrategy, SearchFilters, SearchResult } from "../types";
   import { Result, ok, err } from "@repo/shared/utils/result";

   export interface VectorSearchOptions {
     threshold?: number;
     useIndex?: boolean;
   }

   export class VectorSearchStrategy implements ISearchStrategy {
     readonly name = "semantic";

     constructor(
       private readonly db: DrizzleClient,
       private readonly embeddingProvider: IEmbeddingProvider,
     ) {}

     async search(
       query: string,
       limit: number,
       filters?: SearchFilters,
       options?: VectorSearchOptions,
     ): Promise<Result<SearchResult[], Error>> {
       // 実装
     }
   }
   ```

**期待される成果物**:

- VectorSearchStrategy実装ファイル

---

### タスク2: クエリ埋め込み生成の実装

**目的**: IEmbeddingProviderを使用してクエリの埋め込みを生成する

**実行手順**:

1. search()メソッド内で埋め込み生成を実装:

   ```typescript
   async search(/*...*/) {
     try {
       // 1. クエリの埋め込みを生成
       const embeddingResult = await this.embeddingProvider.embedSingle(query);
       if (!embeddingResult.success) {
         return err(embeddingResult.error);
       }
       const queryEmbedding = embeddingResult.data;

       // ... 続く
     } catch (error) {
       return err(error instanceof Error ? error : new Error('Vector search failed'));
     }
   }
   ```

**期待される成果物**:

- 埋め込み生成処理の実装

---

### タスク3: SQLクエリ構築の実装

**目的**: libSQLベクトル検索のSQLクエリを構築する

**実行手順**:

1. formatEmbedding()メソッドを実装:

   ```typescript
   private formatEmbedding(embedding: number[]): string {
     return `vector('[${embedding.join(',')}]')`;
   }
   ```

2. buildFilterClauses()メソッドを実装:

   ```typescript
   private buildFilterClauses(filters?: SearchFilters): {
     join: boolean;
     where: string[];
     params: unknown[];
   } {
     if (!filters) {
       return { join: false, where: [], params: [] };
     }

     const where: string[] = [];
     const params: unknown[] = [];
     let needsJoin = false;

     if (filters.fileIds && filters.fileIds.length > 0) {
       where.push(`c.file_id IN (${filters.fileIds.map(() => '?').join(', ')})`);
       params.push(...filters.fileIds);
     }

     if (filters.fileTypes && filters.fileTypes.length > 0) {
       needsJoin = true;
       where.push(`f.mime_type IN (${filters.fileTypes.map(() => '?').join(', ')})`);
       params.push(...filters.fileTypes);
     }

     if (filters.dateRange) {
       where.push('c.created_at >= ? AND c.created_at <= ?');
       params.push(filters.dateRange.from, filters.dateRange.to);
     }

     if (filters.workspaceIds && filters.workspaceIds.length > 0) {
       needsJoin = true;
       where.push(`f.workspace_id IN (${filters.workspaceIds.map(() => '?').join(', ')})`);
       params.push(...filters.workspaceIds);
     }

     return { join: needsJoin, where, params };
   }
   ```

**期待される成果物**:

- SQLクエリ構築メソッドの実装

---

### タスク4: ベクトル検索実行の実装

**目的**: libSQLでベクトル検索を実行する

**実行手順**:

1. search()メソッド内で検索を実行:

   ```typescript
   // 2. フィルタ条件を構築
   const filterClauses = this.buildFilterClauses(filters);
   const threshold = options?.threshold ?? 0.3;

   // 3. SQLクエリを構築
   const sql = `
     SELECT
       c.id as chunk_id,
       c.content,
       c.file_id,
       c.metadata,
       vector_distance_cos(e.embedding, ${this.formatEmbedding(queryEmbedding)}) as distance
     FROM embeddings e
     JOIN chunks c ON e.chunk_id = c.id
     ${filterClauses.join ? `JOIN files f ON c.file_id = f.id` : ""}
     WHERE vector_distance_cos(e.embedding, ${this.formatEmbedding(queryEmbedding)}) <= ?
     ${filterClauses.where.length > 0 ? `AND ${filterClauses.where.join(" AND ")}` : ""}
     ORDER BY distance ASC
     LIMIT ?
   `;

   const params = [threshold, ...filterClauses.params, limit];

   // 4. 検索実行
   const results = await this.db.execute(sql, params);
   ```

**期待される成果物**:

- ベクトル検索実行処理の実装

---

### タスク5: 結果変換の実装

**目的**: 検索結果をSearchResultItem形式に変換する

**実行手順**:

1. distanceToSimilarity()メソッドを実装:

   ```typescript
   private distanceToSimilarity(distance: number): number {
     // コサイン距離（0-2）→ コサイン類似度（0-1）
     return Math.max(0, Math.min(1, 1 - distance / 2));
   }
   ```

2. 結果変換を実装:
   ```typescript
   // 5. 結果を変換
   return ok(
     results.rows.map((row) => ({
       chunkId: row.chunk_id as string,
       content: row.content as string,
       score: this.distanceToSimilarity(row.distance as number),
       source: "semantic" as const,
       metadata: {
         fileId: row.file_id,
         distance: row.distance,
         ...JSON.parse(row.metadata || "{}"),
       },
     })),
   );
   ```

**期待される成果物**:

- 結果変換処理の実装

---

### タスク6: CachedVectorSearchStrategy実装

**目的**: 埋め込みキャッシュ付きバージョンを実装する

**実行手順**:

1. ファイルを作成:
   - `packages/shared/src/services/search/strategies/cached-vector-search-strategy.ts`

2. クラスを実装:

   ```typescript
   export class CachedVectorSearchStrategy implements ISearchStrategy {
     readonly name = "semantic";

     private readonly cache = new Map<
       string,
       { embedding: number[]; timestamp: number }
     >();
     private readonly cacheMaxAge = 5 * 60 * 1000; // 5分

     constructor(
       private readonly baseStrategy: VectorSearchStrategy,
       private readonly embeddingProvider: IEmbeddingProvider,
     ) {}

     async search(/*...*/) {
       const cacheKey = this.getCacheKey(query);
       const cached = this.cache.get(cacheKey);

       if (cached && Date.now() - cached.timestamp < this.cacheMaxAge) {
         // キャッシュヒット - 直接埋め込みを使用
         return this.searchWithEmbedding(
           cached.embedding,
           limit,
           filters,
           options,
         );
       }

       // 新規埋め込み生成
       const embeddingResult = await this.embeddingProvider.embedSingle(query);
       if (!embeddingResult.success) {
         return err(embeddingResult.error);
       }

       // キャッシュに保存
       this.cache.set(cacheKey, {
         embedding: embeddingResult.data,
         timestamp: Date.now(),
       });

       this.cleanupCache();

       return this.searchWithEmbedding(
         embeddingResult.data,
         limit,
         filters,
         options,
       );
     }

     private getCacheKey(query: string): string {
       return query.toLowerCase().trim();
     }

     private cleanupCache(): void {
       const now = Date.now();
       for (const [key, value] of this.cache) {
         if (now - value.timestamp > this.cacheMaxAge) {
           this.cache.delete(key);
         }
       }
     }
   }
   ```

**期待される成果物**:

- CachedVectorSearchStrategy実装ファイル

---

### タスク7: エクスポート設定

**目的**: モジュールをエクスポートする

**実行手順**:

1. indexファイルを更新（または作成）:
   - `packages/shared/src/services/search/strategies/index.ts`
   ```typescript
   export {
     VectorSearchStrategy,
     VectorSearchOptions,
   } from "./vector-search-strategy";
   export { CachedVectorSearchStrategy } from "./cached-vector-search-strategy";
   ```

**期待される成果物**:

- エクスポート設定ファイル

---

### タスク8: テスト成功確認（Green状態）

**目的**: 全テストが成功することを確認する

**実行手順**:

1. テストを実行:

   ```bash
   pnpm --filter @repo/shared test -- --run vector-search-strategy
   ```

2. 全テストが成功することを確認

3. テスト結果を記録

**期待される成果物**:

- テスト実行結果記録（`outputs/phase-5/test-green-state.md`）

---

## 参照資料

| 参照資料       | パス                                                                    | 内容                     |
| -------------- | ----------------------------------------------------------------------- | ------------------------ |
| Phase 2設計    | `outputs/phase-2/`                                                      | クラス設計・メソッド設計 |
| Phase 4テスト  | `packages/shared/src/services/search/strategies/__tests__/`             | テストコード             |
| 元タスク指示書 | `docs/30-workflows/unassigned-task/task-07-03-vector-search-diskann.md` | 実装仕様詳細             |

---

## 成果物

| 成果物                     | パス                                                                              | 内容                   |
| -------------------------- | --------------------------------------------------------------------------------- | ---------------------- |
| VectorSearchStrategy       | `packages/shared/src/services/search/strategies/vector-search-strategy.ts`        | メイン実装             |
| CachedVectorSearchStrategy | `packages/shared/src/services/search/strategies/cached-vector-search-strategy.ts` | キャッシュ付き実装     |
| エクスポート設定           | `packages/shared/src/services/search/strategies/index.ts`                         | モジュールエクスポート |
| テスト実行結果記録         | `outputs/phase-5/test-green-state.md`                                             | Green状態の確認記録    |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 5の統合テスト連携アクション**:

- IEmbeddingProvider接続の実装
- libSQL（embeddings/chunks）接続の実装
- テスト支援コード（モック）の動作確認

---

## 完了条件

- [ ] VectorSearchStrategyが実装されている
- [ ] クエリ埋め込み生成が動作する
- [ ] SQLクエリ構築が動作する
- [ ] ベクトル検索実行が動作する
- [ ] 結果変換が動作する
- [ ] CachedVectorSearchStrategyが実装されている
- [ ] モジュールがエクスポートされている
- [ ] すべてのテストが成功（Green状態）
- [ ] テスト実行結果を記録した
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6 へ進む

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test -- --run vector-search-strategy
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 5 実行記録

### 実行タスク

- タスク1: VectorSearchStrategy基本実装 - [結果]
- タスク2: クエリ埋め込み生成の実装 - [結果]
- タスク3: SQLクエリ構築の実装 - [結果]
- タスク4: ベクトル検索実行の実装 - [結果]
- タスク5: 結果変換の実装 - [結果]
- タスク6: CachedVectorSearchStrategy実装 - [結果]
- タスク7: エクスポート設定 - [結果]
- タスク8: テスト成功確認（Green状態） - [結果]

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

`docs/30-workflows/vector-search-diskann/phase-6-test-expansion.md`
