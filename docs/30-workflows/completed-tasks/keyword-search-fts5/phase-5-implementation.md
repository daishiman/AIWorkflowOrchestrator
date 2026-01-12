# Phase 5: 実装（TDD: Green） - キーワード検索戦略（FTS5/BM25）

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 5                     |
| Phase名    | 実装（TDD: Green）    |
| 前提Phase  | Phase 4（テスト作成） |
| 後続Phase  | Phase 6（テスト拡充） |
| ステータス | 未実施                |
| 作成日     | 2026-01-11            |
| 機能名     | keyword-search-fts5   |
| タスクID   | CONV-07-02            |

---

## 目的

Phase 4で作成したテストを通すための最小限の実装を行う（Green状態）。

## 背景

TDD原則に従い、テストを通すために必要最小限のコードを実装する。過度な最適化や機能追加は行わず、まずテストを通すことに集中する。

---

## 実行タスク

### タスク1: KeywordSearchStrategyクラス実装

**目的**: ISearchStrategyインターフェースを実装するKeywordSearchStrategyクラスを作成する

**実行手順**:

1. `packages/shared/src/services/search/keyword-search-strategy.ts` ファイルを作成
2. ISearchStrategyインターフェースを実装
3. search()メソッドを実装
4. getMetrics()メソッドを実装

**実装ファイル配置**:

```
packages/shared/src/services/search/
  keyword-search-strategy.ts
  types.ts（必要に応じて型追加）
  index.ts（エクスポート更新）
```

**実装スケルトン**:

```typescript
import {
  ISearchStrategy,
  SearchQuery,
  SearchResultItem,
  SearchStrategyMetrics,
} from "./types";
import {
  searchChunksByKeyword,
  searchChunksByPhrase,
  searchChunksByNear,
} from "@repo/shared/db/queries/chunks-search";

export class KeywordSearchStrategy implements ISearchStrategy {
  readonly strategyType = "keyword" as const;

  private metrics: SearchStrategyMetrics = {
    executionTime: 0,
    resultCount: 0,
  };

  constructor(private readonly db: Database) {}

  async search(query: SearchQuery): Promise<SearchResultItem[]> {
    const startTime = performance.now();

    // 1. 検索モードに応じたFTS5検索を実行
    // 2. 結果をSearchResultItem[]に変換
    // 3. メトリクスを更新

    this.metrics.executionTime = performance.now() - startTime;
    return results;
  }

  getMetrics(): SearchStrategyMetrics {
    return { ...this.metrics };
  }

  // 内部メソッド
  private normalizeScore(bm25Score: number, scaleFactor: number = 0.3): number {
    return 1 / (1 + scaleFactor * bm25Score);
  }

  private toSearchResultItem(chunk: ChunkSearchResult): SearchResultItem {
    // チャンク検索結果をSearchResultItemに変換
  }
}
```

---

### タスク2: FTS5クエリ変換実装

**目的**: SearchQueryをFTS5クエリに変換するロジックを実装する

**実行手順**:

1. キーワード検索（OR検索）のクエリ生成を実装
2. フレーズ検索のクエリ生成を実装
3. NEAR検索のクエリ生成を実装
4. 検索モード判定ロジックを実装

**検索モード判定**:

| 条件                      | 検索モード |
| ------------------------- | ---------- |
| クエリが`"`で囲まれている | phrase     |
| options.nearDistance指定  | near       |
| それ以外                  | keyword    |

---

### タスク3: スコア正規化実装

**目的**: BM25スコアを0.0〜1.0に正規化するロジックを実装する

**実行手順**:

1. normalizeScore()メソッドを実装
2. scaleFactor（デフォルト0.3）の設定を実装
3. SearchResultItem.scoreへのマッピングを実装

**正規化ロジック**:

```typescript
// BM25スコア正規化
// BM25スコア: 0（完全一致） → ∞（無関係）
// 正規化スコア: 1.0（完全一致） → 0.0（無関係）
private normalizeScore(bm25Score: number, scaleFactor: number = 0.3): number {
  if (bm25Score < 0) {
    throw new Error('BM25 score cannot be negative');
  }
  return 1 / (1 + scaleFactor * bm25Score);
}
```

---

### タスク4: エラーハンドリング実装

**目的**: 適切なエラー処理を実装する

**実行手順**:

1. 空クエリのバリデーションを実装
2. クエリ長（1〜1000文字）のバリデーションを実装
3. DB接続エラーのハンドリングを実装
4. タイムアウトエラーのハンドリングを実装

**エラー種別**:

| エラー種別   | 対応                    |
| ------------ | ----------------------- |
| 空クエリ     | 空配列を返す            |
| クエリ長超過 | ValidationErrorをスロー |
| DB接続エラー | DatabaseErrorをスロー   |
| タイムアウト | TimeoutErrorをスロー    |

---

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                             | 内容               |
| -------------------- | -------------------------------------------------------------------------------- | ------------------ |
| チャンク検索API      | `.claude/skills/aiworkflow-requirements/references/api-internal-chunk-search.md` | 既存FTS5クエリ関数 |
| 検索インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`     | 型定義             |

### Phase成果物

| 参照資料     | パス                                     | 内容           |
| ------------ | ---------------------------------------- | -------------- |
| 設計書       | `outputs/phase-2/architecture-design.md` | アーキテクチャ |
| テスト仕様書 | `outputs/phase-4/test-specification.md`  | テスト設計     |

---

## 成果物

| 成果物           | パス                                                             | 内容                   |
| ---------------- | ---------------------------------------------------------------- | ---------------------- |
| 実装コード       | `packages/shared/src/services/search/keyword-search-strategy.ts` | KeywordSearchStrategy  |
| 型定義（追加分） | `packages/shared/src/services/search/types.ts`                   | 追加型定義             |
| エクスポート更新 | `packages/shared/src/services/search/index.ts`                   | モジュールエクスポート |

---

## 統合テスト連携【必須】

フロント/バック接続の実装とテスト支援コード整備:

| 実装項目           | 内容                                               |
| ------------------ | -------------------------------------------------- |
| API接続            | ISearchStrategy.search()の実装                     |
| エラーハンドリング | ValidationError, DatabaseError, TimeoutErrorの実装 |
| データ変換         | ChunkSearchResult → SearchResultItem変換の実装     |

---

## 完了条件

- [ ] KeywordSearchStrategyクラスが実装されている
- [ ] すべてのユニットテストが成功状態（Green）
- [ ] 実装が最小限に抑えられている
- [ ] フロント/バック接続（ISearchStrategy）が実装されている
- [ ] エラーハンドリングが実装されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.jsonのPhase 5を更新

---

## 次のPhase

Phase 6: テスト拡充

`docs/30-workflows/keyword-search-fts5/phase-6-test-expansion.md`
