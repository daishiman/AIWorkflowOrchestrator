# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 2                              |
| Phase名    | 設計                           |
| 前提Phase  | Phase 1                        |
| 後続Phase  | Phase 3                        |
| ステータス | 未実施                         |
| 作成日     | 2026-01-18                     |
| 機能名     | CONV-07-02-keyword-search-fts5 |

---

## 目的

IKeywordSearchStrategyの詳細設計を行い、実装の指針を明確にする。

## 背景

要件定義を基に、FTS5/BM25を使用したキーワード検索の具体的なアーキテクチャ・インターフェース・データフローを設計する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: アーキテクチャ設計

**目的**: 全体アーキテクチャを設計する

**実行手順**:

1. コンポーネント構成の設計
   - KeywordSearchStrategy（メイン実装）
   - FTS5QueryBuilder（クエリ生成）
   - BM25ScoreNormalizer（スコア正規化）

2. 依存関係の設計
   - Database: libSQL/Turso接続
   - Logger: 検索ログ出力

3. レイヤー構成の設計
   - Interface Layer: IKeywordSearchStrategy
   - Service Layer: KeywordSearchStrategy
   - Data Access Layer: FTS5Repository

4. エラーハンドリング設計
   - Result型による型安全なエラー処理
   - KeywordSearchError型定義

**期待される成果物**:

- `outputs/phase-2/architecture-design.md`

---

### タスク2: インターフェース設計

**目的**: 詳細なインターフェースを設計する

**実行手順**:

1. IKeywordSearchStrategy定義

```typescript
interface IKeywordSearchStrategy extends ISearchStrategy {
  search(
    query: SearchQuery,
  ): Promise<Result<SearchResultItem[], KeywordSearchError>>;
  searchNear(
    query: SearchQuery,
    nearDistance?: number,
  ): Promise<Result<SearchResultItem[], KeywordSearchError>>;
  getStrategyName(): "keyword";
  getMetrics(): StrategyMetric;
}
```

2. 内部メソッド定義
   - normalizeScore(bm25Score: number): number
   - buildFTS5Query(text: string, mode: SearchMode): string
   - toSearchResultItem(ftsResult: FTS5Result): SearchResultItem

3. 型定義
   - SearchMode: 'keyword' | 'phrase' | 'near'
   - FTS5Result: FTS5検索結果型
   - StrategyMetric: メトリクス型

4. エラー型定義
   - KeywordSearchError: { type, message, cause? }

**期待される成果物**:

- `outputs/phase-2/interface-design.md`

---

### タスク3: データフロー設計

**目的**: データの流れを設計する

**実行手順**:

1. 検索フロー

```
SearchQuery
  ↓
validateQuery() → validation error
  ↓
buildFTS5Query()
  ↓
executeFTS5Search() → database error / timeout
  ↓
FTS5Result[]
  ↓
normalizeScore() (each result)
  ↓
toSearchResultItem() (each result)
  ↓
SearchResultItem[]
```

2. FTS5クエリ生成フロー

```
input text → tokenize → escape special chars → build query string
  ↓
keyword mode: term1 term2 term3
phrase mode: "term1 term2 term3"
near mode: term1 NEAR/10 term2
```

3. スコア正規化フロー

```
bm25_score → sigmoid(scale_factor × score) → normalized (0-1)
```

4. メトリクス収集フロー

```
search execution → record time → update metrics → return
```

**期待される成果物**:

- `outputs/phase-2/data-flow-design.md`

---

### タスク4: FTS5テーブル設計

**目的**: FTS5仮想テーブルの設計を行う

**実行手順**:

1. テーブル定義

```sql
CREATE VIRTUAL TABLE chunks_fts USING fts5(
  content,
  tokenize = 'unicode61 remove_diacritics 2',
  content_rowid = chunk_id
);
```

2. インデックス戦略
   - 全文インデックス自動構築
   - 増分更新対応

3. クエリパターン

```sql
-- キーワード検索
SELECT rowid, bm25(chunks_fts) as score
FROM chunks_fts
WHERE chunks_fts MATCH ?
ORDER BY score
LIMIT ?;

-- フレーズ検索
SELECT rowid, bm25(chunks_fts) as score
FROM chunks_fts
WHERE chunks_fts MATCH '"exact phrase"'
ORDER BY score;

-- 近接検索
SELECT rowid, bm25(chunks_fts) as score
FROM chunks_fts
WHERE chunks_fts MATCH 'term1 NEAR/10 term2'
ORDER BY score;
```

**期待される成果物**:

- `outputs/phase-2/fts5-table-design.md`

---

## 参照資料

| 参照資料      | パス                     | 内容                 |
| ------------- | ------------------------ | -------------------- |
| Phase 1成果物 | `outputs/phase-1/`       | 要件定義             |
| RAG検索仕様   | interfaces-rag-search.md | インターフェース仕様 |

---

## 成果物

| 成果物               | パス                                     | 内容         |
| -------------------- | ---------------------------------------- | ------------ |
| アーキテクチャ設計   | `outputs/phase-2/architecture-design.md` | 全体構成     |
| インターフェース設計 | `outputs/phase-2/interface-design.md`    | API定義      |
| データフロー設計     | `outputs/phase-2/data-flow-design.md`    | データの流れ |
| FTS5テーブル設計     | `outputs/phase-2/fts5-table-design.md`   | DB設計       |

## 統合テスト連携【必須】

統合ポイント/契約（API・スキーマ）を設計に反映する:

| 統合ポイント                | 契約定義                          |
| --------------------------- | --------------------------------- |
| chunks_ftsテーブル          | FTS5インデックス構造、カラム定義  |
| SearchQueryインターフェース | クエリ構造、検索モード定義        |
| HybridSearchOrchestrator    | ISearchStrategy準拠、結果形式契約 |

---

---

## 完了条件

- [ ] アーキテクチャ設計が完了している
- [ ] インターフェース設計が完了している
- [ ] データフロー設計が完了している
- [ ] FTS5テーブル設計が完了している

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

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/CONV-07-02-keyword-search-fts5/phase-3-design-review.md`
