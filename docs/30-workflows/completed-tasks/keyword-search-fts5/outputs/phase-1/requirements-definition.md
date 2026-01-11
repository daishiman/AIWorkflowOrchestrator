# 要件定義書 - キーワード検索戦略（FTS5/BM25）

## メタ情報

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| タスクID | CONV-07-02                          |
| Phase    | 1                                   |
| 作成日   | 2026-01-11                          |
| 依存     | CONV-04-03（chunks + FTS5テーブル） |

---

## 機能要件（Functional Requirements）

### FR-001: ISearchStrategy インターフェース実装

| 項目   | 内容                                                                            |
| ------ | ------------------------------------------------------------------------------- |
| 要件ID | FR-001                                                                          |
| 説明   | `ISearchStrategy` インターフェースに準拠した `KeywordSearchStrategy` を実装する |
| 優先度 | 高                                                                              |
| 根拠   | HybridRAG検索エンジンの統一アーキテクチャに準拠するため                         |

**準拠すべきインターフェース**:

```typescript
interface ISearchStrategy {
  readonly strategyType: "keyword" | "semantic" | "graph";
  search(query: SearchQuery): Promise<SearchResultItem[]>;
  getMetrics(): SearchStrategyMetrics;
}
```

---

### FR-002: キーワード検索（OR検索）

| 項目   | 内容                                                   |
| ------ | ------------------------------------------------------ |
| 要件ID | FR-002                                                 |
| 説明   | 複数キーワードによるOR検索を実行し、関連チャンクを返す |
| 優先度 | 高                                                     |
| 根拠   | 基本的な全文検索機能として必須                         |

**入力**: `SearchQuery` with `queryText` containing space-separated keywords
**出力**: `SearchResultItem[]` sorted by BM25 score (descending)

---

### FR-003: フレーズ検索（完全一致）

| 項目   | 内容                                         |
| ------ | -------------------------------------------- |
| 要件ID | FR-003                                       |
| 説明   | 語順を保持したフレーズ完全一致検索を実行する |
| 優先度 | 高                                           |
| 根拠   | 正確な文言検索のニーズに対応                 |

**入力**: `SearchQuery` with `searchType: "phrase"`
**出力**: `SearchResultItem[]` with exact phrase matches

---

### FR-004: NEAR検索（近接検索）

| 項目   | 内容                                                       |
| ------ | ---------------------------------------------------------- |
| 要件ID | FR-004                                                     |
| 説明   | 指定した距離内に複数キーワードが出現するチャンクを検索する |
| 優先度 | 中                                                         |
| 根拠   | 関連性の高いコンテキスト検索を可能にする                   |

**入力**: `SearchQuery` with `searchType: "near"`, `nearDistance: number`
**出力**: `SearchResultItem[]` with terms within specified distance

---

### FR-005: BM25スコア正規化

| 項目   | 内容                                                |
| ------ | --------------------------------------------------- |
| 要件ID | FR-005                                              |
| 説明   | FTS5のネイティブBM25スコアを0.0-1.0範囲に正規化する |
| 優先度 | 高                                                  |
| 根拠   | 他の検索戦略（Semantic, Graph）とのスコア統合のため |

**正規化式**: `normalizedScore = 1 / (1 + scaleFactor * bm25Score)`

- `scaleFactor` デフォルト: 0.3
- BM25スコア 0 → 正規化スコア 1.0（最高関連度）
- BM25スコア大 → 正規化スコア低（低関連度）

---

### FR-006: ハイライト機能

| 項目   | 内容                                         |
| ------ | -------------------------------------------- |
| 要件ID | FR-006                                       |
| 説明   | マッチした箇所のハイライト情報を結果に含める |
| 優先度 | 中                                           |
| 根拠   | UI表示時のマッチ箇所強調に必要               |

**出力**: `Highlight[]` with `start`, `end` offset positions

---

### FR-007: ファイルIDフィルタリング

| 項目   | 内容                                       |
| ------ | ------------------------------------------ |
| 要件ID | FR-007                                     |
| 説明   | 特定ファイルIDに絞り込んだ検索を可能にする |
| 優先度 | 中                                         |
| 根拠   | ファイル単位での検索絞り込みニーズ         |

**入力**: `SearchQuery.filters.fileIds: string[]`

---

### FR-008: 検索結果形式変換

| 項目   | 内容                                           |
| ------ | ---------------------------------------------- |
| 要件ID | FR-008                                         |
| 説明   | DB層の結果を `SearchResultItem` 形式に変換する |
| 優先度 | 高                                             |
| 根拠   | 統一されたレスポンス形式をフロントエンドに提供 |

**変換元**: chunks-search.ts の結果
**変換先**: `SearchResultItem` with `score`, `relevance`, `content`, `highlights`, `sources`

---

### FR-009: 検索メトリクス収集

| 項目   | 内容                                           |
| ------ | ---------------------------------------------- |
| 要件ID | FR-009                                         |
| 説明   | 検索実行時間、ヒット数等のメトリクスを収集する |
| 優先度 | 低                                             |
| 根拠   | パフォーマンス監視・最適化のため               |

**メトリクス項目**:

- `totalSearches`: 総検索回数
- `averageResponseTime`: 平均応答時間
- `hitCount`: ヒット件数

---

## 非機能要件（Non-Functional Requirements）

### NFR-001: 検索速度

| 項目     | 内容                       |
| -------- | -------------------------- |
| 要件ID   | NFR-001                    |
| 説明     | 検索速度の目標値を達成する |
| 優先度   | 高                         |
| 測定方法 | Vitest performance test    |

**目標値（10,000チャンク）**:

| 検索タイプ | 目標応答時間 | 測定基準         |
| ---------- | ------------ | ---------------- |
| keyword    | < 100ms      | 95パーセンタイル |
| phrase     | < 100ms      | 95パーセンタイル |
| near       | < 150ms      | 95パーセンタイル |

---

### NFR-002: テストカバレッジ

| 項目     | 内容                           |
| -------- | ------------------------------ |
| 要件ID   | NFR-002                        |
| 説明     | テストカバレッジ基準を達成する |
| 優先度   | 高                             |
| 測定方法 | Vitest coverage report         |

**ユニットテストカバレッジ基準**:

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

**結合テストカバレッジ基準**:

| 指標                         | 目標 |
| ---------------------------- | ---- |
| APIエンドポイント            | 100% |
| モジュール間インターフェース | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%+ |

---

### NFR-003: 型安全性

| 項目     | 内容                               |
| -------- | ---------------------------------- |
| 要件ID   | NFR-003                            |
| 説明     | TypeScript厳格型チェックをパスする |
| 優先度   | 高                                 |
| 測定方法 | `pnpm typecheck` 成功              |

**制約**:

- `any` 型の使用禁止
- `@ts-ignore` の使用禁止
- 明示的な型アノテーション必須

---

### NFR-004: エラーハンドリング

| 項目   | 内容                               |
| ------ | ---------------------------------- |
| 要件ID | NFR-004                            |
| 説明   | 適切なエラーハンドリングを実装する |
| 優先度 | 高                                 |

**エラーケース**:

- 空文字クエリ → 空配列を返す（エラーなし）
- 無効なクエリ形式 → `InvalidQueryError`
- DB接続エラー → `SearchError`
- タイムアウト → `SearchTimeoutError`

---

### NFR-005: 保守性

| 項目   | 内容                             |
| ------ | -------------------------------- |
| 要件ID | NFR-005                          |
| 説明   | コードの保守性・可読性を確保する |
| 優先度 | 中                               |

**基準**:

- ESLint/Prettier準拠
- TSDocコメント付与（public API）
- 単一責任の原則に従った設計

---

## 接続要件（API/データフロー/エラーハンドリング）

### API接続

| 接続元                | 接続先                         | 方式            |
| --------------------- | ------------------------------ | --------------- |
| KeywordSearchStrategy | chunks-search.ts               | 関数呼び出し    |
| HybridRAGSearch       | KeywordSearchStrategy.search() | ISearchStrategy |

### データフロー

```
SearchQuery
    ↓
KeywordSearchStrategy.search()
    ↓
buildFTS5Query() - FTS5クエリ文字列構築
    ↓
chunks-search.ts（DB層）
    ↓
FTS5クエリ実行（BM25スコアリング）
    ↓
toSearchResultItem() - 結果変換
    ↓
SearchResultItem[]
```

### エラーハンドリング

| エラー状況         | 対応                       | 返却                 |
| ------------------ | -------------------------- | -------------------- |
| 空クエリ           | バリデーションで早期return | 空配列 `[]`          |
| 無効なsearchType   | バリデーションエラー       | `InvalidQueryError`  |
| DB接続失敗         | エラーラップ・ログ         | `SearchError`        |
| クエリタイムアウト | タイムアウト検出           | `SearchTimeoutError` |
| 予期せぬエラー     | エラーラップ・ログ         | `SearchError`        |

---

## 参照資料

| 資料名               | パス                                                                             |
| -------------------- | -------------------------------------------------------------------------------- |
| RAGアーキテクチャ    | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`          |
| 検索インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`     |
| チャンク検索API      | `.claude/skills/aiworkflow-requirements/references/api-internal-chunk-search.md` |
| DBスキーマ           | `.claude/skills/aiworkflow-requirements/references/database-schema.md`           |
