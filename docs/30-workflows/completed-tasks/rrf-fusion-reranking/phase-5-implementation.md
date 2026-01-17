# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 5                    |
| Phase名    | 実装                 |
| 前提Phase  | Phase 4              |
| 後続Phase  | Phase 6              |
| ステータス | 未実施               |
| 作成日     | 2026-01-13           |
| 機能名     | rrf-fusion-reranking |

---

## 目的

TDD Green Phase: テストを通す最小限の実装を行う。

## 背景

Phase 4で作成したテストを全て通す実装を行い、受け入れ基準を満たす機能を実現する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 型定義の実装

**目的**: FusedSearchResult等の型定義を実装する

**実行手順**:

1. ファイル作成: `packages/shared/src/services/search/fusion/types.ts`
2. 以下の型を実装:

```typescript
import type { ChunkId } from "@/types/branded";

export interface FusedSearchResult {
  chunkId: ChunkId;
  content: string;
  fusedScore: number;
  rerankedScore?: number;
  sources: Array<{
    strategy: "keyword" | "semantic" | "graph";
    rank: number;
    score: number;
  }>;
  metadata: Record<string, unknown>;
}

export interface IFusionStrategy {
  fuse(
    resultSets: Map<string, SearchResult[]>,
    weights: SearchWeights,
  ): FusedSearchResult[];
}
```

3. ファイル作成: `packages/shared/src/services/search/reranking/types.ts`
4. 以下の型を実装:

```typescript
import type { Result } from "@/types/result";
import type { FusedSearchResult } from "../fusion/types";

export interface IReranker {
  rerank(
    query: string,
    candidates: FusedSearchResult[],
    limit: number,
  ): Promise<Result<FusedSearchResult[], Error>>;
}

export interface RerankerOptions {
  alwaysRerank?: boolean;
  batchSize?: number;
}
```

**期待される成果物**:

- `packages/shared/src/services/search/fusion/types.ts`
- `packages/shared/src/services/search/reranking/types.ts`

---

### タスク2: RRFFusion クラスの実装

**目的**: RRFアルゴリズムによる検索結果統合を実装する

**実行手順**:

1. ファイル作成: `packages/shared/src/services/search/fusion/rrf-fusion.ts`
2. タスク指示書のコード例を参考に実装:
   - コンストラクタでkパラメータを受け取る（デフォルト: 60）
   - fuse()メソッドで3戦略の結果を統合
   - 各チャンクのRRFスコアを計算
   - 重複チャンクをマージし、全ソース情報を保持
   - fusedScoreを0-1に正規化

**期待される成果物**:

- `packages/shared/src/services/search/fusion/rrf-fusion.ts`

---

### タスク3: WeightedScoreFusion クラスの実装

**目的**: 重み付きスコア統合を実装する

**実行手順**:

1. 同じファイル（`rrf-fusion.ts`）に追加
2. タスク指示書のコード例を参考に実装:
   - fuse()メソッドで加重平均を計算
   - 重複チャンクのスコアを合算

**期待される成果物**:

- `packages/shared/src/services/search/fusion/rrf-fusion.ts`（追加）

---

### タスク4: LLMReranker クラスの実装

**目的**: LLMベースのリランキングを実装する

**実行手順**:

1. ファイル作成: `packages/shared/src/services/search/reranking/cross-encoder-reranker.ts`
2. タスク指示書のコード例を参考に実装:
   - IRerankerインターフェースを実装
   - バッチ処理でLLMにスコアリングを依頼
   - プロンプトを構築してスコアを取得
   - エラー時はフォールバック（fusedScoreを使用）

**期待される成果物**:

- `packages/shared/src/services/search/reranking/cross-encoder-reranker.ts`

---

### タスク5: CohereReranker クラスの実装

**目的**: Cohere Rerank APIを使用したリランキングを実装する

**実行手順**:

1. 同じファイルに追加
2. タスク指示書のコード例を参考に実装:
   - `https://api.cohere.ai/v1/rerank` へのAPI呼び出し
   - レスポンスをFusedSearchResult[]に変換
   - エラーハンドリング

**期待される成果物**:

- `packages/shared/src/services/search/reranking/cross-encoder-reranker.ts`（追加）

---

### タスク6: VoyageReranker クラスの実装

**目的**: Voyage AI Rerank APIを使用したリランキングを実装する

**実行手順**:

1. 同じファイルに追加
2. タスク指示書のコード例を参考に実装:
   - `https://api.voyageai.com/v1/rerank` へのAPI呼び出し
   - レスポンスをFusedSearchResult[]に変換
   - エラーハンドリング

**期待される成果物**:

- `packages/shared/src/services/search/reranking/cross-encoder-reranker.ts`（追加）

---

### タスク7: NoOpReranker クラスの実装

**目的**: フォールバック用のNo-Opリランカーを実装する

**実行手順**:

1. 同じファイルに追加
2. タスク指示書のコード例を参考に実装:
   - 入力をそのまま返す（順序変更なし）
   - limitのみ適用

**期待される成果物**:

- `packages/shared/src/services/search/reranking/cross-encoder-reranker.ts`（追加）

---

### タスク8: エクスポート設定

**目的**: モジュールのエクスポートを設定する

**実行手順**:

1. `packages/shared/src/services/search/fusion/index.ts` を作成
2. `packages/shared/src/services/search/reranking/index.ts` を作成
3. 各クラス・型をエクスポート

**期待される成果物**:

- `packages/shared/src/services/search/fusion/index.ts`
- `packages/shared/src/services/search/reranking/index.ts`

---

### タスク9: テスト成功確認（Green）

**目的**: 全テストが成功することを確認する

**実行手順**:

1. テストを実行:

   ```bash
   pnpm --filter @repo/shared test -- --testPathPattern="fusion|reranking"
   ```

2. 全テストが成功することを確認
3. 結果を記録

**期待される成果物**:

- `outputs/phase-5/test-green-results.md` - テスト成功結果のログ

---

## 参照資料

| 参照資料      | パス                                                                   | 内容             |
| ------------- | ---------------------------------------------------------------------- | ---------------- |
| タスク指示書  | `docs/30-workflows/unassigned-task/task-07-05-rrf-fusion-reranking.md` | 実装コード例     |
| Phase 2成果物 | `outputs/phase-2/`                                                     | 設計ドキュメント |
| Phase 4成果物 | `packages/shared/src/services/search/**/__tests__/`                    | テストコード     |

---

## 成果物

| 成果物               | パス                                                                      | 内容             |
| -------------------- | ------------------------------------------------------------------------- | ---------------- |
| Fusion型定義         | `packages/shared/src/services/search/fusion/types.ts`                     | 型定義           |
| Reranker型定義       | `packages/shared/src/services/search/reranking/types.ts`                  | 型定義           |
| Fusion実装           | `packages/shared/src/services/search/fusion/rrf-fusion.ts`                | RRF/Weighted実装 |
| Reranker実装         | `packages/shared/src/services/search/reranking/cross-encoder-reranker.ts` | 全Reranker実装   |
| Fusionエクスポート   | `packages/shared/src/services/search/fusion/index.ts`                     | エクスポート     |
| Rerankerエクスポート | `packages/shared/src/services/search/reranking/index.ts`                  | エクスポート     |
| テスト結果           | `outputs/phase-5/test-green-results.md`                                   | Green状態確認    |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 5のアクション**: フロント/バック接続の実装とテスト支援コード整備

- HybridRAGSearcherとの統合ポイントを実装
- モックオブジェクトを整備（Reranker APIモック等）
- 統合テスト実行環境を確認

---

## 完了条件

- [ ] 型定義が実装されている（FusedSearchResult, IReranker等）
- [ ] RRFFusionクラスが実装され、テストがパスする
- [ ] WeightedScoreFusionクラスが実装され、テストがパスする
- [ ] LLMRerankerが実装され、テストがパスする
- [ ] CohereRerankerが実装され、テストがパスする
- [ ] VoyageRerankerが実装され、テストがパスする
- [ ] NoOpRerankerが実装され、テストがパスする
- [ ] 全ユニットテストが成功している（Green）
- [ ] 本Phase内の全タスクを100%実行完了

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test -- --testPathPattern="fusion|reranking"
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

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

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/rrf-fusion-reranking/phase-6-test-expansion.md`
