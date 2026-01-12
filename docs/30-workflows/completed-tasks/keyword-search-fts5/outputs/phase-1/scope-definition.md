# スコープ定義 - キーワード検索戦略（FTS5/BM25）

## メタ情報

| 項目     | 内容       |
| -------- | ---------- |
| タスクID | CONV-07-02 |
| Phase    | 1          |
| 作成日   | 2026-01-11 |

---

## スコープ内（In Scope）

### 1. KeywordSearchStrategy クラス実装

```
packages/shared/src/services/search/
├── keyword-search-strategy.ts      # メイン実装
├── keyword-search-strategy.test.ts # ユニットテスト
└── index.ts                        # エクスポート追加
```

**実装内容**:

- `ISearchStrategy` インターフェース実装
- `search()` メソッド実装
- `getMetrics()` メソッド実装
- プライベートヘルパーメソッド

---

### 2. 検索モード実装

| 検索モード | 実装内容 | FTS5クエリ形式            |
| ---------- | -------- | ------------------------- |
| keyword    | OR検索   | `term1 OR term2 OR term3` |
| phrase     | 完全一致 | `"term1 term2 term3"`     |
| near       | 近接検索 | `NEAR(term1 term2, N)`    |

---

### 3. スコア正規化ロジック

```typescript
// BM25スコア正規化
normalizeScore(bm25Score: number, scaleFactor: number = 0.3): number {
  return 1 / (1 + scaleFactor * bm25Score);
}
```

---

### 4. 結果変換ロジック

```typescript
// DB結果 → SearchResultItem変換
toSearchResultItem(dbResult: ChunkSearchResult): SearchResultItem {
  return {
    id: generateResultId(),
    type: 'chunk',
    score: normalizeScore(dbResult.bm25Score),
    relevance: {
      keyword: normalizeScore(dbResult.bm25Score),
      semantic: 0,
      graph: 0,
      rerank: 0
    },
    content: {
      text: dbResult.content,
      summary: null,
      context: { before: null, after: null }
    },
    highlights: dbResult.highlights || [],
    sources: {
      chunkId: dbResult.id,
      fileId: dbResult.fileId,
      entityIds: []
    }
  };
}
```

---

### 5. 既存DB層関数の利用

**利用する関数** (`packages/shared/src/db/queries/chunks-search.ts`):

- `searchChunksByKeyword()` - OR検索
- `searchChunksByPhrase()` - フレーズ検索
- `searchChunksByNear()` - NEAR検索

---

### 6. テスト実装

| テスト種別     | ファイル                                      | カバレッジ目標 |
| -------------- | --------------------------------------------- | -------------- |
| ユニットテスト | `keyword-search-strategy.test.ts`             | 80%+           |
| 統合テスト     | `keyword-search-strategy.integration.test.ts` | 100%（API）    |

---

## スコープ外（Out of Scope）

### 1. 他の検索戦略実装

| タスクID   | 内容             | 理由     |
| ---------- | ---------------- | -------- |
| CONV-07-03 | Semantic検索戦略 | 別タスク |
| CONV-07-04 | Graph検索戦略    | 別タスク |

---

### 2. RRF統合・リランキング

| タスクID   | 内容           | 理由     |
| ---------- | -------------- | -------- |
| CONV-07-05 | RRF Fusion実装 | 別タスク |
| CONV-07-06 | CRAG評価実装   | 別タスク |
| CONV-07-07 | HybridRAG統合  | 別タスク |

---

### 3. REST API / IPC層実装

| レイヤー           | 理由               |
| ------------------ | ------------------ |
| Next.js API Routes | 別タスクで実装予定 |
| Electron IPC       | 別タスクで実装予定 |

---

### 4. FTS5テーブル作成

| 内容                       | 理由                             |
| -------------------------- | -------------------------------- |
| `chunks_fts5` テーブル定義 | CONV-04-03で実装済み（前提条件） |
| FTS5トリガー設定           | CONV-04-03で実装済み             |

---

### 5. クエリ分類器

| 内容             | 理由                 |
| ---------------- | -------------------- |
| クエリタイプ判定 | CONV-07-01で実装済み |
| 検索重み計算     | CONV-07-01で実装済み |

---

## 前提条件

### 必須依存タスク

| タスクID   | 内容                  | 状態         |
| ---------- | --------------------- | ------------ |
| CONV-04-03 | chunks + FTS5テーブル | 完了（前提） |
| CONV-07-01 | クエリ分類器          | 完了         |

### 技術的前提

1. **SQLite FTS5拡張**が利用可能
2. **libSQL/Turso**がFTS5をサポート
3. **chunks_fts5**テーブルが存在し、chunksテーブルと同期されている
4. **BM25**スコアリングが有効

---

## 制約条件

### パフォーマンス制約

| 制約         | 値       | 備考                 |
| ------------ | -------- | -------------------- |
| 最大クエリ長 | 1000文字 | バリデーションで制限 |
| 最大結果件数 | 100件    | limit上限            |
| タイムアウト | 5秒      | 検索タイムアウト     |

### 技術的制約

| 制約       | 説明                                |
| ---------- | ----------------------------------- |
| FTS5依存   | SQLite FTS5拡張が必須               |
| 同期モデル | chunks → chunks_fts5 のトリガー同期 |
| 日本語対応 | FTS5トークナイザー設定に依存        |

---

## 成果物一覧

| 成果物           | パス                                                                                        | 種別   |
| ---------------- | ------------------------------------------------------------------------------------------- | ------ |
| メイン実装       | `packages/shared/src/services/search/keyword-search-strategy.ts`                            | コード |
| ユニットテスト   | `packages/shared/src/services/search/__tests__/keyword-search-strategy.test.ts`             | テスト |
| 統合テスト       | `packages/shared/src/services/search/__tests__/keyword-search-strategy.integration.test.ts` | テスト |
| エクスポート追加 | `packages/shared/src/services/search/index.ts`                                              | コード |

---

## 影響範囲

### 変更されるファイル

| ファイル                                       | 変更内容                              |
| ---------------------------------------------- | ------------------------------------- |
| `packages/shared/src/services/search/index.ts` | KeywordSearchStrategyエクスポート追加 |

### 新規作成されるファイル

| ファイル                                      | 内容           |
| --------------------------------------------- | -------------- |
| `keyword-search-strategy.ts`                  | メイン実装     |
| `keyword-search-strategy.test.ts`             | ユニットテスト |
| `keyword-search-strategy.integration.test.ts` | 統合テスト     |

### 影響を受けないファイル

| ファイル           | 理由                 |
| ------------------ | -------------------- |
| `chunks-search.ts` | 既存DB層は変更しない |
| 他の検索戦略       | 独立した実装         |
