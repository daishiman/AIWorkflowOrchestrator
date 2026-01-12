# キーワード検索戦略 (FTS5/BM25) - タスク指示書

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| タスクID     | CONV-07-02                         |
| タスク名     | キーワード検索戦略 (FTS5/BM25)     |
| 親タスク     | CONV-07 (HybridRAG検索エンジン)    |
| 依存タスク   | CONV-04-03 (content_chunks + FTS5) |
| 規模         | 中                                 |
| 見積もり工数 | 0.5日                              |
| ステータス   | 未実施                             |

---

## 1. 目的

FTS5仮想テーブルを使用したBM25スコアリングによるキーワード検索戦略を実装する。HybridRAGのTriple Searchの1つ目の検索源。

---

## 2. 成果物

- `packages/shared/src/services/search/strategies/keyword-search-strategy.ts`
- `packages/shared/src/services/search/strategies/__tests__/keyword-search-strategy.test.ts`

---

## 3. 入力

- 検索クエリ文字列
- 検索オプション（limit, filters）

---

## 4. 出力

```typescript
// packages/shared/src/services/search/types.ts（追加）
export interface SearchResult {
  chunkId: ChunkId;
  content: string;
  score: number;
  source: "keyword" | "semantic" | "graph";
  metadata: Record<string, unknown>;
}

export interface SearchFilters {
  fileIds?: string[];
  fileTypes?: string[];
  dateRange?: { from: Date; to: Date };
  workspaceIds?: string[];
}
```

---

## 5. 実装仕様

### 5.1 検索戦略インターフェース

```typescript
// packages/shared/src/services/search/strategies/base-strategy.ts
import type { Result } from "@/types/result";

export interface ISearchStrategy {
  readonly name: string;

  search(
    query: string,
    limit: number,
    filters?: SearchFilters,
  ): Promise<Result<SearchResult[], Error>>;
}
```

### 5.2 キーワード検索戦略

```typescript
// packages/shared/src/services/search/strategies/keyword-search-strategy.ts
export class KeywordSearchStrategy implements ISearchStrategy {
  readonly name = "keyword";

  constructor(private readonly db: DrizzleClient) {}

  async search(
    query: string,
    limit: number,
    filters?: SearchFilters,
  ): Promise<Result<SearchResult[], Error>> {
    try {
      // クエリをFTS5形式に変換
      const ftsQuery = this.buildFtsQuery(query);

      // フィルタ条件を構築
      const filterClauses = this.buildFilterClauses(filters);

      const sql = `
        SELECT
          c.id as chunk_id,
          c.content,
          c.file_id,
          c.metadata,
          bm25(content_chunks_fts) as score
        FROM content_chunks_fts fts
        JOIN content_chunks c ON fts.rowid = c.rowid
        ${filterClauses.join ? `JOIN files f ON c.file_id = f.id` : ""}
        WHERE content_chunks_fts MATCH ?
        ${filterClauses.where.length > 0 ? `AND ${filterClauses.where.join(" AND ")}` : ""}
        ORDER BY score
        LIMIT ?
      `;

      const params = [ftsQuery, ...filterClauses.params, limit];
      const results = await this.db.execute(sql, params);

      return ok(
        results.rows.map((row) => ({
          chunkId: row.chunk_id as ChunkId,
          content: row.content as string,
          score: this.normalizeBm25Score(row.score as number),
          source: "keyword" as const,
          metadata: {
            fileId: row.file_id,
            ...JSON.parse(row.metadata || "{}"),
          },
        })),
      );
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error("Keyword search failed"),
      );
    }
  }

  /**
   * クエリをFTS5形式に変換
   * - 日本語: 形態素解析（または文字N-gram）
   * - 英語: 単語分割
   * - 演算子: OR/AND/NOT対応
   */
  private buildFtsQuery(query: string): string {
    // 基本的なクエリのエスケープ
    let ftsQuery = query
      .replace(/"/g, '""') // ダブルクォートをエスケープ
      .trim();

    // 日本語文字が含まれる場合はフレーズ検索として扱う
    if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(ftsQuery)) {
      // 日本語はN-gramトークナイザを使用（FTS5設定依存）
      // スペースで分割されていない連続した日本語はそのまま使用
      return `"${ftsQuery}"`;
    }

    // 英語・数字のクエリは単語に分割
    const words = ftsQuery.split(/\s+/).filter((w) => w.length > 0);

    if (words.length === 1) {
      return words[0];
    }

    // 複数単語の場合はAND検索（すべて含む）
    // OR検索にする場合は "word1 OR word2" 形式
    return words.join(" ");
  }

  /**
   * フィルタ条件を構築
   */
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
      where.push(`c.file_id IN (${filters.fileIds.map(() => "?").join(", ")})`);
      params.push(...filters.fileIds);
    }

    if (filters.fileTypes && filters.fileTypes.length > 0) {
      needsJoin = true;
      where.push(
        `f.mime_type IN (${filters.fileTypes.map(() => "?").join(", ")})`,
      );
      params.push(...filters.fileTypes);
    }

    if (filters.dateRange) {
      where.push("c.created_at >= ? AND c.created_at <= ?");
      params.push(filters.dateRange.from, filters.dateRange.to);
    }

    if (filters.workspaceIds && filters.workspaceIds.length > 0) {
      needsJoin = true;
      where.push(
        `f.workspace_id IN (${filters.workspaceIds.map(() => "?").join(", ")})`,
      );
      params.push(...filters.workspaceIds);
    }

    return { join: needsJoin, where, params };
  }

  /**
   * BM25スコアを0-1に正規化
   * FTS5のbm25()は負の値を返す（小さいほど良い）ので変換
   */
  private normalizeBm25Score(rawScore: number): number {
    // bm25スコアは負の値（-10 ~ 0 程度）
    // 0-1の範囲に正規化
    const normalized = 1 / (1 + Math.exp(rawScore));
    return Math.max(0, Math.min(1, normalized));
  }
}
```

### 5.3 クエリ拡張（オプション）

```typescript
export class QueryExpander {
  /**
   * クエリを同義語で拡張
   */
  expand(query: string, synonyms: Map<string, string[]>): string {
    const words = query.split(/\s+/);
    const expanded: string[] = [];

    for (const word of words) {
      const wordSynonyms = synonyms.get(word.toLowerCase());
      if (wordSynonyms && wordSynonyms.length > 0) {
        // 元の単語 + 同義語をOR結合
        expanded.push(`(${word} OR ${wordSynonyms.join(" OR ")})`);
      } else {
        expanded.push(word);
      }
    }

    return expanded.join(" ");
  }
}
```

---

## 6. テストケース

```typescript
describe("KeywordSearchStrategy", () => {
  it("基本的なキーワード検索が動作する", async () => {
    const strategy = new KeywordSearchStrategy(mockDb);
    const result = await strategy.search("TypeScript", 10);

    expect(result.success).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0].source).toBe("keyword");
  });

  it("日本語クエリが動作する", async () => {
    const strategy = new KeywordSearchStrategy(mockDb);
    const result = await strategy.search("型安全性", 10);

    expect(result.success).toBe(true);
  });

  it("複数単語クエリがAND検索される", async () => {
    const strategy = new KeywordSearchStrategy(mockDb);
    const result = await strategy.search("TypeScript React", 10);

    expect(result.success).toBe(true);
    // 両方の単語を含む結果のみ
  });

  it("フィルタが正しく適用される", async () => {
    const strategy = new KeywordSearchStrategy(mockDb);
    const result = await strategy.search("test", 10, {
      fileTypes: ["text/markdown"],
    });

    expect(result.success).toBe(true);
    // 結果はすべてmarkdownファイル
  });

  it("BM25スコアが0-1に正規化される", async () => {
    const strategy = new KeywordSearchStrategy(mockDb);
    const result = await strategy.search("test", 10);

    expect(result.success).toBe(true);
    for (const item of result.data) {
      expect(item.score).toBeGreaterThanOrEqual(0);
      expect(item.score).toBeLessThanOrEqual(1);
    }
  });

  it("結果がスコア順でソートされる", async () => {
    const strategy = new KeywordSearchStrategy(mockDb);
    const result = await strategy.search("test", 10);

    expect(result.success).toBe(true);
    for (let i = 1; i < result.data.length; i++) {
      expect(result.data[i].score).toBeLessThanOrEqual(
        result.data[i - 1].score,
      );
    }
  });
});
```

---

## 7. 完了条件

- [ ] `KeywordSearchStrategy`クラスが実装済み
- [ ] FTS5 MATCHクエリが正しく構築される
- [ ] 日本語クエリが動作する
- [ ] 複数単語のAND検索が動作する
- [ ] フィルタ条件が正しく適用される
- [ ] BM25スコアが0-1に正規化される
- [ ] 結果がスコア順でソートされる
- [ ] 全テストがパス
- [ ] TypeScript型エラーなし
- [ ] ESLint警告なし
- [ ] JSDocコメントが記述されている

---

## 8. 次のタスク

- CONV-07-03: ベクトル検索戦略 (DiskANN)

---

## 9. 参照情報

- CONV-04-03: content_chunks テーブル + FTS5
- CONV-07: HybridRAG検索エンジン（親タスク）
- [SQLite FTS5 Documentation](https://www.sqlite.org/fts5.html)

---

## 10. FTS5クエリ構文

| 構文            | 説明           | 例                          |
| --------------- | -------------- | --------------------------- |
| word            | 単純な単語検索 | `typescript`                |
| "phrase"        | フレーズ検索   | `"type safety"`             |
| word1 word2     | AND検索        | `typescript react`          |
| word1 OR word2  | OR検索         | `typescript OR javascript`  |
| word1 NOT word2 | NOT検索        | `typescript NOT javascript` |
| word\*          | 前方一致       | `type*`                     |
| NEAR(w1 w2, N)  | 近接検索       | `NEAR(type safety, 5)`      |
