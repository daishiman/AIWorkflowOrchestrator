# キーワード検索戦略（FTS5/BM25）

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [interfaces-rag-search.md](./interfaces-rag-search.md)

SQLite FTS5（Full-Text Search 5）とBM25ランキングアルゴリズムを使用したキーワード検索戦略。

**実装場所**: `packages/shared/src/services/search/strategies/keyword-search-strategy.ts`

---

## IKeywordSearchStrategy

| メソッド             | 戻り値                                     | 説明                                    |
| -------------------- | ------------------------------------------ | --------------------------------------- |
| search()             | Promise<Result<SearchResultItem[], Error>> | SearchQueryを受けてキーワード検索を実行 |
| searchNear()         | Promise<Result<SearchResultItem[], Error>> | 近接検索（NEAR演算子）を実行            |
| getStrategyName()    | "keyword"                                  | 戦略名を返す                            |
| getMetrics()         | StrategyMetric                             | 検索メトリクス取得                      |
| normalizeScore()     | number                                     | BM25スコアをシグモイド関数で0-1に正規化 |
| buildFTS5Query()     | string                                     | テキストからFTS5クエリ文字列を生成      |
| toSearchResultItem() | SearchResultItem                           | FTS検索結果をSearchResultItemに変換     |

---

## KeywordSearchError

**エラー型定義**:

| プロパティ | 型                                        | 説明                                         |
| ---------- | ----------------------------------------- | -------------------------------------------- |
| type       | "validation" \| "database" \| "timeout"   | エラー種別                                   |
| message    | string                                    | エラーメッセージ                             |
| cause      | Error（オプション）                       | 原因となったエラー                           |

**エラー種別と対処**:

| type       | 説明                         | 対処                         |
| ---------- | ---------------------------- | ---------------------------- |
| validation | クエリ長超過、無効形式       | クエリ修正を促す             |
| database   | DB接続エラー、クエリ実行失敗 | リトライまたはフォールバック |
| timeout    | 検索タイムアウト（10秒超過） | 結果を切り捨てて返す         |

---

## 定数

| 定数名               | 値    | 説明                           |
| -------------------- | ----- | ------------------------------ |
| MAX_QUERY_LENGTH     | 1000  | クエリ最大文字数               |
| DEFAULT_SCALE_FACTOR | 0.5   | BM25スコア正規化のスケール係数 |
| SEARCH_TIMEOUT_MS    | 10000 | 検索タイムアウト（ミリ秒）     |

---

## 検索モード

| モード  | 判定条件                       | 検索関数                | FTS5クエリ例          |
| ------- | ------------------------------ | ----------------------- | --------------------- |
| keyword | 通常クエリ                     | searchChunksByKeyword() | term1 term2 term3     |
| phrase  | ダブルクォートで囲まれた文字列 | searchChunksByPhrase()  | "exact phrase"        |
| near    | searchNear()メソッド呼び出し   | searchChunksByNear()    | term1 NEAR/10 term2   |

---

## FTS5テーブル構造

**テーブル定義（chunks_fts）**:

| 要素            | 設定                                | 説明                          |
| --------------- | ----------------------------------- | ----------------------------- |
| テーブル種別    | VIRTUAL TABLE USING fts5            | FTS5仮想テーブル              |
| カラム          | content                             | 検索対象テキスト              |
| tokenize        | unicode61 remove_diacritics 2       | Unicode61トークナイザ         |
| content_rowid   | chunk_id                            | chunksテーブルとの連携キー    |

---

## FTS5クエリパターン

| パターン   | WHERE句                                    | 説明                                     |
| ---------- | ------------------------------------------ | ---------------------------------------- |
| キーワード | chunks_fts MATCH ?                         | スペース区切りで複数キーワードをAND検索  |
| フレーズ   | chunks_fts MATCH '"exact phrase"'          | ダブルクォートで完全一致フレーズ検索     |
| 近接検索   | chunks_fts MATCH 'term1 NEAR/10 term2'     | 10トークン以内にterm1とterm2が出現       |

**共通SELECT句**: SELECT rowid, bm25(chunks_fts) as score FROM chunks_fts ORDER BY score

---

## BM25スコア正規化

**normalizeScore関数**:

| 入力               | 処理                          | 出力           |
| ------------------ | ----------------------------- | -------------- |
| bm25Score (number) | シグモイド関数を適用          | 0-1の正規化値  |
| scaleFactor = 0.5  | スケール係数（デフォルト0.5） | -              |

**計算式**: 1 / (1 + exp(-scaleFactor × bm25Score))

---

## データフロー

| ステップ | 処理                 | エラー種別                    |
| -------- | -------------------- | ----------------------------- |
| 1        | SearchQuery受信      | -                             |
| 2        | validateQuery()      | validation error（検証失敗時）|
| 3        | buildFTS5Query()     | -                             |
| 4        | executeFTS5Search()  | database error / timeout      |
| 5        | FTS5Result[]取得     | -                             |
| 6        | normalizeScore()適用 | -                             |
| 7        | toSearchResultItem() | -                             |
| 8        | SearchResultItem[]   | 最終結果                      |

---

## 非機能要件

| 項目         | 要件                               |
| ------------ | ---------------------------------- |
| 検索速度     | 単一クエリ100ms以下                |
| タイムアウト | 10秒（SEARCH_TIMEOUT_MS）          |
| クエリ長上限 | 1000文字（MAX_QUERY_LENGTH）       |
| スコア正規化 | シグモイド関数（scale factor 0.5） |
| 並列処理     | バッチ検索での並列実行対応         |

---

## テスト品質

- **35テストケース**
- **93.39% Line Coverage**

**詳細参照**: docs/30-workflows/CONV-07-02-keyword-search-fts5/ - 設計・実装ドキュメント

---

## 関連ドキュメント

- [検索クエリ・結果型定義](./rag-search-types.md)
- [ベクトル検索戦略](./rag-search-vector.md)
- [グラフ検索戦略](./rag-search-graph.md)

---

## 変更履歴

| Version | Date       | Changes                                            |
| ------- | ---------- | -------------------------------------------------- |
| 1.1.0   | 2026-01-26 | 仕様ガイドライン準拠: コード例を表形式・文章に変換 |
