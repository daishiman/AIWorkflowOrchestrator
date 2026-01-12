# Phase 2: 設計 - キーワード検索戦略（FTS5/BM25）

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 2                             |
| Phase名    | 設計                          |
| 前提Phase  | Phase 1（要件定義）           |
| 後続Phase  | Phase 3（設計レビューゲート） |
| ステータス | 未実施                        |
| 作成日     | 2026-01-11                    |
| 機能名     | keyword-search-fts5           |
| タスクID   | CONV-07-02                    |

---

## 目的

要件を実現可能な構造に落とし込み、KeywordSearchStrategyの詳細設計を行う。

## 背景

Phase 1で定義した要件に基づき、ISearchStrategyインターフェースに準拠したKeywordSearchStrategyクラスの設計を行う。既存のデータベース層（chunks-search.ts）との連携方法を明確化する。

---

## 実行タスク

### タスク1: アーキテクチャ設計

**目的**: KeywordSearchStrategyの位置づけとコンポーネント構造を設計する

**実行手順**:

1. HybridRAGパイプラインにおけるKeywordSearchStrategyの位置づけを図示
2. 依存コンポーネント（chunks-search.ts、ISearchStrategy）との関係を明確化
3. クラス図・シーケンス図を作成

**期待される成果物**:

- アーキテクチャ図
- クラス図
- シーケンス図

---

### タスク2: インターフェース設計

**目的**: ISearchStrategyインターフェースの実装方法を設計する

**実行手順**:

1. ISearchStrategy.search()メソッドの実装設計
2. SearchQuery → FTS5クエリへの変換ロジック設計
3. FTS5結果 → SearchResultItem[]への変換ロジック設計
4. BM25スコア正規化アルゴリズム設計

**設計詳細**:

```typescript
interface ISearchStrategy {
  readonly strategyType: SearchStrategy; // 'keyword'
  search(query: SearchQuery): Promise<SearchResultItem[]>;
  getMetrics(): SearchStrategyMetrics;
}

class KeywordSearchStrategy implements ISearchStrategy {
  readonly strategyType = "keyword";

  async search(query: SearchQuery): Promise<SearchResultItem[]>;

  // 内部メソッド
  private buildFTS5Query(text: string, options: SearchOptions): string;
  private normalizeScore(bm25Score: number): number;
  private toSearchResultItem(chunk: ChunkSearchResult): SearchResultItem;
}
```

**期待される成果物**:

- インターフェース設計書
- 型定義案

---

### タスク3: 検索モード設計

**目的**: キーワード検索、フレーズ検索、NEAR検索の各モード設計

**実行手順**:

1. キーワード検索（OR検索）のFTS5クエリ生成ロジック設計
2. フレーズ検索（完全一致）のFTS5クエリ生成ロジック設計
3. NEAR検索（近接検索）のFTS5クエリ生成ロジック設計
4. 検索モード切り替えロジック設計

**検索モード**:

| モード  | FTS5構文例             | 用途                       |
| ------- | ---------------------- | -------------------------- |
| keyword | `term1 OR term2`       | 複数キーワードのOR検索     |
| phrase  | `"term1 term2"`        | 語順を保持した完全一致検索 |
| near    | `NEAR(term1 term2, 5)` | 指定距離内の近接検索       |

**期待される成果物**:

- 検索モード設計書
- FTS5クエリ生成ロジック

---

### タスク4: スコアリング設計

**目的**: BM25スコアの正規化と関連度計算を設計する

**実行手順**:

1. BM25スコアの特性を分析（0〜無限大）
2. 0.0〜1.0への正規化アルゴリズム設計
3. scaleFactor（デフォルト0.3）の役割と調整方法を文書化
4. SearchResultItemのscoreフィールドへのマッピング設計

**正規化アルゴリズム**:

```typescript
// BM25スコア正規化: 0 → 1.0, ∞ → 0.0
normalizeScore(bm25Score: number, scaleFactor: number = 0.3): number {
  return 1 / (1 + scaleFactor * bm25Score);
}
```

**期待される成果物**:

- スコアリング設計書

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                             | 内容                           |
| -------------------- | -------------------------------------------------------------------------------- | ------------------------------ |
| RAGアーキテクチャ    | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`          | クエリ分類器と検索重み設計     |
| 検索インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`     | SearchQuery/SearchResult型定義 |
| チャンク検索API      | `.claude/skills/aiworkflow-requirements/references/api-internal-chunk-search.md` | 既存FTS5クエリ関数             |
| Phase 1成果物        | `outputs/phase-1/requirements-definition.md`                                     | 要件定義                       |

---

## 成果物

| 成果物               | パス                                     | 内容                   |
| -------------------- | ---------------------------------------- | ---------------------- |
| アーキテクチャ設計   | `outputs/phase-2/architecture-design.md` | システム構造設計       |
| インターフェース設計 | `outputs/phase-2/interface-design.md`    | API/型設計             |
| 検索モード設計       | `outputs/phase-2/search-mode-design.md`  | 各検索モードの詳細設計 |
| スコアリング設計     | `outputs/phase-2/scoring-design.md`      | BM25正規化設計         |

---

## 統合テスト連携【必須】

統合ポイント/契約（API・スキーマ）を設計に反映する:

| 統合ポイント      | 契約定義                                                |
| ----------------- | ------------------------------------------------------- |
| ISearchStrategy   | search(query: SearchQuery): Promise<SearchResultItem[]> |
| chunks-search.ts  | searchChunksByKeyword/Phrase/Near関数との連携           |
| HybridRAGサービス | 検索重み（keyword: 0.35）に基づくスコア計算             |

---

## 完了条件

- [ ] アーキテクチャが定義されている
- [ ] ISearchStrategyの実装設計が完了している
- [ ] 全検索モード（keyword/phrase/near）の設計が完了している
- [ ] BM25スコア正規化アルゴリズムが設計されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] Phase 1要件との整合性が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.jsonのPhase 2を更新

---

## 次のPhase

Phase 3: 設計レビューゲート

`docs/30-workflows/keyword-search-fts5/phase-3-design-review.md`
