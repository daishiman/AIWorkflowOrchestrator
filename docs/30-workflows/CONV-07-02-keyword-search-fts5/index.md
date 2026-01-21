# CONV-07-02: キーワード検索戦略（FTS5/BM25）

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | CONV-07-02                                |
| 機能名     | キーワード検索戦略（FTS5/BM25）           |
| ステータス | 未実施                                    |
| 作成日     | 2026-01-18                                |
| 前提タスク | CONV-05 (Chunking), CONV-06-01 (KG Store) |
| 後続タスク | CONV-08 (HybridRAG Query Engine)          |
| 総Phase数  | 13                                        |

---

## 概要

SQLite FTS5（Full-Text Search 5）とBM25ランキングアルゴリズムを使用したキーワード検索戦略を実装する。HybridRAG検索エンジンの一部として、テキストベースの全文検索機能を提供する。

---

## 目的

1. FTS5仮想テーブルを使用した高速な全文検索の実現
2. BM25アルゴリズムによる関連度スコアリング
3. フレーズ検索・近接検索（NEAR）のサポート
4. VectorSearchStrategy/GraphSearchStrategyとの統合基盤の構築

---

## 機能要件

### 主要インターフェース

```typescript
interface IKeywordSearchStrategy {
  // キーワード検索を実行
  search(
    query: SearchQuery,
  ): Promise<Result<SearchResultItem[], KeywordSearchError>>;

  // 近接検索（NEAR演算子）を実行
  searchNear(
    query: SearchQuery,
    nearDistance?: number,
  ): Promise<Result<SearchResultItem[], KeywordSearchError>>;

  // 戦略名を返す
  getStrategyName(): string; // "keyword"

  // メトリクスを取得
  getMetrics(): StrategyMetric;

  // BM25スコアを0-1に正規化
  normalizeScore(bm25Score: number): number;

  // FTS5クエリ文字列を生成
  buildFTS5Query(text: string): string;

  // FTS結果をSearchResultItemに変換
  toSearchResultItem(ftsResult: FTS5Result): SearchResultItem;
}
```

### 検索モード

| モード  | 判定条件                       | 検索関数                |
| ------- | ------------------------------ | ----------------------- |
| keyword | 通常クエリ                     | searchChunksByKeyword() |
| phrase  | ダブルクォートで囲まれた文字列 | searchChunksByPhrase()  |
| near    | searchNear()メソッド呼び出し   | searchChunksByNear()    |

### エラータイプ

```typescript
type KeywordSearchErrorType = "validation" | "database" | "timeout";

interface KeywordSearchError {
  type: KeywordSearchErrorType;
  message: string;
  cause?: Error;
}
```

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

## 定数

| 定数名               | 値    | 説明                           |
| -------------------- | ----- | ------------------------------ |
| MAX_QUERY_LENGTH     | 1000  | クエリ最大文字数               |
| DEFAULT_SCALE_FACTOR | 0.5   | BM25スコア正規化のスケール係数 |
| SEARCH_TIMEOUT_MS    | 10000 | 検索タイムアウト（ミリ秒）     |

---

## 技術設計

### FTS5テーブル構造

```sql
CREATE VIRTUAL TABLE chunks_fts USING fts5(
  content,
  tokenize = 'unicode61 remove_diacritics 2',
  content_rowid = chunk_id
);
```

### BM25スコア正規化

```typescript
function normalizeScore(bm25Score: number, scaleFactor = 0.5): number {
  // シグモイド関数で0-1に正規化
  return 1 / (1 + Math.exp(-scaleFactor * bm25Score));
}
```

### データフロー

```
SearchQuery → buildFTS5Query() → FTS5実行 → FTS5Result[]
    ↓
normalizeScore() → toSearchResultItem() → SearchResultItem[]
```

---

## Phase構成

| Phase | 名称              | 概要                                       |
| ----- | ----------------- | ------------------------------------------ |
| 1     | 要件定義          | 機能要件・非機能要件・受け入れ基準の定義   |
| 2     | 設計              | アーキテクチャ設計・インターフェース設計   |
| 3     | 設計レビュー      | 設計の妥当性検証・レビューゲート           |
| 4     | テスト作成（Red） | TDDのRed段階・失敗するテストの作成         |
| 5     | 実装（Green）     | TDDのGreen段階・テストを通す最小実装       |
| 6     | テスト拡充        | エッジケース・異常系・統合テストの拡充     |
| 7     | カバレッジ確認    | テストカバレッジ目標達成の確認             |
| 8     | リファクタリング  | TDDのRefactor段階・コード品質改善          |
| 9     | 品質保証          | 静的解析・セキュリティ・パフォーマンス検証 |
| 10    | 最終レビュー      | 全体品質・整合性の最終確認                 |
| 11    | 手動テスト        | 実際の使用シナリオでの検証                 |
| 12    | ドキュメント作成  | API仕様書・設定ガイドの作成                |
| 13    | PR作成・マージ    | Pull Request作成とmainブランチへのマージ   |

---

## 参照資料

| 資料                 | パス                                                                              |
| -------------------- | --------------------------------------------------------------------------------- |
| RAG検索仕様          | `/.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`     |
| RAGアーキテクチャ    | `/.claude/skills/aiworkflow-requirements/references/architecture-rag.md`          |
| アーキテクチャ概要   | `docs/30-workflows/unassigned-task/task-**-architecture-overview-rag-pipeline.md` |
| マスタータスクリスト | `docs/30-workflows/unassigned-task/task-00-master-task-list.md`                   |

---

## 依存関係

### 上流タスク

- CONV-05: チャンキングサービス（チャンクデータ提供）
- CONV-06-01: Knowledge Graph Store（chunks_ftsテーブル管理）

### 下流タスク

- CONV-07-03: HybridSearchOrchestrator（戦略統合）
- CONV-08: HybridRAG Query Engine（検索実行）

---

## 成果物

| 成果物           | パス                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------- |
| 型定義           | `packages/shared/src/services/search/types.ts`                                              |
| インターフェース | `packages/shared/src/services/search/IKeywordSearchStrategy.ts`                             |
| 実装             | `packages/shared/src/services/search/strategies/keyword-search-strategy.ts`                 |
| ユニットテスト   | `packages/shared/src/services/search/__tests__/keyword-search-strategy.test.ts`             |
| 統合テスト       | `packages/shared/src/services/search/__tests__/keyword-search-strategy.integration.test.ts` |
| インデックス     | `packages/shared/src/services/search/index.ts`                                              |

---

## 品質目標

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 93%+     |
| Branch Coverage   | 60%      | 80%+     |
| Function Coverage | 80%      | 100%     |
| テストケース数    | 25+      | 35+      |

---

## テストコマンド

```bash
# ユニットテスト
pnpm --filter @repo/shared test -- --testPathPattern="keyword-search"

# 統合テスト
pnpm --filter @repo/shared test -- --testPathPattern="keyword-search.integration"

# カバレッジ計測
pnpm --filter @repo/shared test -- --coverage --testPathPattern="keyword-search"
```

---

## 開始方法

Phase 1から順番に実行してください:

`docs/30-workflows/CONV-07-02-keyword-search-fts5/phase-1-requirements.md`
