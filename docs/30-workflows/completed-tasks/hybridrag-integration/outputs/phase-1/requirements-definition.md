# HybridRAG統合 - 要件定義書

## メタ情報

| 項目       | 内容          |
| ---------- | ------------- |
| タスクID   | CONV-07-07    |
| タスク名   | HybridRAG統合 |
| Phase      | 1             |
| 作成日     | 2026-01-17    |
| ステータス | 完了          |

---

## 1. 機能要件（Functional Requirements）

### FR-01: HybridRAGEngineクラスの実装

**概要**: 4ステージパイプラインを統合するHybridRAGEngineクラスを実装する

**詳細**:

- `HybridRAGEngine.search()` メソッドが `Result<HybridRAGResponse, Error>` を返す
- コンストラクタで依存コンポーネント（QueryClassifier, SearchStrategies, RRFFusion, Reranker, CRAG）を注入
- 検索オプション（limit, filters, enableCRAG等）を受け付ける

### FR-02: 4ステージパイプラインの実装

**概要**: Query Classification → Triple Search → RRF Fusion + Reranking → CRAG の4ステージを統合する

**詳細**:

- **Stage 1 (Query Classification)**: QueryClassifierによるクエリタイプ判定と検索重み決定
- **Stage 2 (Triple Search)**: Keyword/Semantic/Graphの3種類の検索を並列実行
- **Stage 3 (RRF Fusion + Reranking)**: RRFアルゴリズムによる結果統合と再ランキング
- **Stage 4 (CRAG)**: 関連性評価と検索結果の補正（オプション）

### FR-03: HybridRAGFactoryによるエンジン生成

**概要**: 設定に応じた3種類のHybridRAGEngineを生成するファクトリを実装する

**詳細**:

- `createFull()`: 全機能有効（QueryClassifier+LLM, 3検索戦略, Reranker, CRAG）
- `createLite()`: 軽量版（ルールベース分類、NoOpReranker、CRAG無効）
- `createForTesting()`: テスト用（モックを注入可能）

### FR-04: 部分的な検索失敗への耐性

**概要**: Triple Searchの一部が失敗しても、残りの結果で検索を継続する

**詳細**:

- 1つ以上の検索戦略が成功すれば結果を返す
- すべての検索戦略が失敗した場合のみエラーを返す
- 失敗した検索戦略のエラーはログに記録

### FR-05: パイプラインメトリクスの記録

**概要**: 各ステージの実行メトリクスを記録し、パフォーマンス分析を可能にする

**詳細**:

- 各ステージの実行時間（duration）を記録
- 各ステージの入力件数（inputCount）と出力件数（outputCount）を記録
- 全体の処理時間（totalDuration）を記録
- `PipelineStageResult` として構造化

---

## 2. 非機能要件（Non-Functional Requirements）

### NFR-01: レイテンシ目標

**概要**: 検索処理の応答時間を規定する

**詳細**:

- CRAG無効時: `totalDuration` < 500ms
- CRAG有効時: `totalDuration` < 1000ms
- Triple Search: < 200ms（並列実行）
- RRF Fusion: < 10ms（インメモリ処理）
- Reranking: < 200ms（10件リランク時）
- CRAG: < 300ms（評価+補正）

### NFR-02: 検索精度目標

**概要**: 検索結果の品質を保証する

**詳細**:

- MRR@10（Mean Reciprocal Rank）基準で90%以上
- テストデータセットで精度を検証

### NFR-03: テストカバレッジ

**概要**: コード品質を保証するためのテストカバレッジを規定する

**詳細**:

- Line Coverage: 80%以上（推奨90%）
- Branch Coverage: 60%以上（推奨70%）
- Function Coverage: 80%以上（推奨90%）

### NFR-04: TypeScript型安全性

**概要**: 型エラーのない実装を保証する

**詳細**:

- `pnpm typecheck` がエラー0で完了
- strictモードでのコンパイル成功

### NFR-05: コード品質（ESLint）

**概要**: コーディング規約の遵守を保証する

**詳細**:

- `pnpm lint` が警告0で完了
- プロジェクト標準のESLint設定に準拠

---

## 3. 接続要件（統合テスト連携用）

### 3.1 QueryClassifierインターフェース

| メソッド     | 戻り値                                         | 説明         |
| ------------ | ---------------------------------------------- | ------------ |
| `classify()` | `Promise<Result<{queryType, weights}, Error>>` | クエリを分類 |

### 3.2 ISearchStrategyインターフェース

| メソッド   | 戻り値                                       | 説明       |
| ---------- | -------------------------------------------- | ---------- |
| `search()` | `Promise<Result<SearchResultItem[], Error>>` | 検索を実行 |
| `name`     | `string`                                     | 戦略名     |

### 3.3 RRFFusionインターフェース

| メソッド | 戻り値                | 説明       |
| -------- | --------------------- | ---------- |
| `fuse()` | `FusedSearchResult[]` | 結果を統合 |

### 3.4 IRerankerインターフェース

| メソッド   | 戻り値                                        | 説明         |
| ---------- | --------------------------------------------- | ------------ |
| `rerank()` | `Promise<Result<FusedSearchResult[], Error>>` | 再ランキング |

### 3.5 CorrectiveRAGインターフェース

| メソッド    | 戻り値                               | 説明           |
| ----------- | ------------------------------------ | -------------- |
| `process()` | `Promise<Result<CRAGResult, Error>>` | 検索結果を補正 |

---

## 4. 出力型定義

### HybridRAGResponse

```typescript
interface HybridRAGResponse {
  results: HybridRAGResult[];
  metadata: {
    queryType: QueryType;
    searchWeights: SearchWeights;
    pipelineStages: PipelineStageResult[];
    totalDuration: number;
    cragAction?: "correct" | "incorrect" | "ambiguous";
  };
  augmentedContext?: string;
}
```

### HybridRAGResult

```typescript
interface HybridRAGResult {
  chunkId: ChunkId;
  content: string;
  score: number;
  sources: Array<{
    strategy: "keyword" | "semantic" | "graph";
    rank: number;
    score: number;
  }>;
  metadata: Record<string, unknown>;
}
```

### PipelineStageResult

```typescript
interface PipelineStageResult {
  stage: string;
  duration: number;
  inputCount: number;
  outputCount: number;
}
```

---

## 5. 変更履歴

| 日付       | 版  | 変更内容 |
| ---------- | --- | -------- |
| 2026-01-17 | 1.0 | 初版作成 |
