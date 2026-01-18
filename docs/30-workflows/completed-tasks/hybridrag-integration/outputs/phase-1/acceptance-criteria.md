# HybridRAG統合 - 受け入れ基準書

## メタ情報

| 項目       | 内容          |
| ---------- | ------------- |
| タスクID   | CONV-07-07    |
| タスク名   | HybridRAG統合 |
| Phase      | 1             |
| 作成日     | 2026-01-17    |
| ステータス | 完了          |

---

## 1. 機能要件の受け入れ基準

### AC-FR-01: HybridRAGEngineクラスの実装

| ID         | 基準                                                                            | 検証方法       |
| ---------- | ------------------------------------------------------------------------------- | -------------- |
| AC-FR-01-1 | `HybridRAGEngine.search()` が `Result<HybridRAGResponse, Error>` を返す         | ユニットテスト |
| AC-FR-01-2 | 成功時は `result.success === true` かつ `result.data` が `HybridRAGResponse`    | ユニットテスト |
| AC-FR-01-3 | 失敗時は `result.success === false` かつ `result.error` が `Error` インスタンス | ユニットテスト |
| AC-FR-01-4 | `HybridRAGResponse.results` が `HybridRAGResult[]` 型                           | 型チェック     |

### AC-FR-02: 4ステージパイプラインの実装

| ID         | 基準                                                            | 検証方法       |
| ---------- | --------------------------------------------------------------- | -------------- |
| AC-FR-02-1 | `pipelineStages` に `query_classification` ステージが記録される | ユニットテスト |
| AC-FR-02-2 | `pipelineStages` に `triple_search` ステージが記録される        | ユニットテスト |
| AC-FR-02-3 | `pipelineStages` に `rrf_fusion` ステージが記録される           | ユニットテスト |
| AC-FR-02-4 | `pipelineStages` に `reranking` ステージが記録される            | ユニットテスト |
| AC-FR-02-5 | CRAG有効時は `pipelineStages` に `crag` ステージが記録される    | ユニットテスト |
| AC-FR-02-6 | `metadata.queryType` が `QueryType` 列挙型のいずれかの値        | ユニットテスト |
| AC-FR-02-7 | `metadata.searchWeights` が `SearchWeights` 型で合計1.0         | ユニットテスト |

### AC-FR-03: HybridRAGFactoryによるエンジン生成

| ID         | 基準                                                                          | 検証方法       |
| ---------- | ----------------------------------------------------------------------------- | -------------- |
| AC-FR-03-1 | `HybridRAGFactory.createFull(config)` が `HybridRAGEngine` インスタンスを返す | ユニットテスト |
| AC-FR-03-2 | `HybridRAGFactory.createLite(config)` が `HybridRAGEngine` インスタンスを返す | ユニットテスト |
| AC-FR-03-3 | `HybridRAGFactory.createForTesting(mocks)` が `HybridRAGEngine` を返す        | ユニットテスト |
| AC-FR-03-4 | `createFull` で `rerankerType: "cohere"` 指定時、APIキーがないとエラー        | ユニットテスト |
| AC-FR-03-5 | `createLite` で作成したエンジンはCRAGが無効                                   | ユニットテスト |

### AC-FR-04: 部分的な検索失敗への耐性

| ID         | 基準                                                                     | 検証方法       |
| ---------- | ------------------------------------------------------------------------ | -------------- |
| AC-FR-04-1 | Keyword検索失敗時でもSemantic/Graph結果があれば成功を返す                | ユニットテスト |
| AC-FR-04-2 | Semantic検索失敗時でもKeyword/Graph結果があれば成功を返す                | ユニットテスト |
| AC-FR-04-3 | Graph検索失敗時でもKeyword/Semantic結果があれば成功を返す                | ユニットテスト |
| AC-FR-04-4 | すべての検索戦略が失敗した場合は `"All search strategies failed"` エラー | ユニットテスト |

### AC-FR-05: パイプラインメトリクスの記録

| ID         | 基準                                               | 検証方法       |
| ---------- | -------------------------------------------------- | -------------- |
| AC-FR-05-1 | 各ステージの `duration` が `number` 型で `>= 0`    | ユニットテスト |
| AC-FR-05-2 | 各ステージの `inputCount` が `number` 型で `>= 0`  | ユニットテスト |
| AC-FR-05-3 | 各ステージの `outputCount` が `number` 型で `>= 0` | ユニットテスト |
| AC-FR-05-4 | `metadata.totalDuration` が全ステージの合計以上    | ユニットテスト |

---

## 2. 非機能要件の受け入れ基準

### AC-NFR-01: レイテンシ目標

| ID          | 基準                                          | 検証方法             |
| ----------- | --------------------------------------------- | -------------------- |
| AC-NFR-01-1 | CRAG無効時、`metadata.totalDuration` < 500ms  | パフォーマンステスト |
| AC-NFR-01-2 | CRAG有効時、`metadata.totalDuration` < 1000ms | パフォーマンステスト |

### AC-NFR-02: 検索精度目標

| ID          | 基準                              | 検証方法   |
| ----------- | --------------------------------- | ---------- |
| AC-NFR-02-1 | テストデータセットでMRR@10 >= 0.9 | 精度テスト |

### AC-NFR-03: テストカバレッジ

| ID          | 基準                                            | 検証方法           |
| ----------- | ----------------------------------------------- | ------------------ |
| AC-NFR-03-1 | `pnpm test:coverage` でLine Coverage >= 80%     | カバレッジレポート |
| AC-NFR-03-2 | `pnpm test:coverage` でBranch Coverage >= 60%   | カバレッジレポート |
| AC-NFR-03-3 | `pnpm test:coverage` でFunction Coverage >= 80% | カバレッジレポート |

### AC-NFR-04: TypeScript型安全性

| ID          | 基準                             | 検証方法           |
| ----------- | -------------------------------- | ------------------ |
| AC-NFR-04-1 | `pnpm typecheck` がエラー0で完了 | 型チェックコマンド |

### AC-NFR-05: コード品質（ESLint）

| ID          | 基準                      | 検証方法       |
| ----------- | ------------------------- | -------------- |
| AC-NFR-05-1 | `pnpm lint` が警告0で完了 | リントコマンド |

---

## 3. 統合テスト受け入れ基準

### AC-INT: パイプライン統合

| ID        | 基準                                                          | 検証方法   |
| --------- | ------------------------------------------------------------- | ---------- |
| AC-INT-01 | QueryClassifier.classify() → Triple Search への重み連携が正常 | 統合テスト |
| AC-INT-02 | Triple Search → RRF Fusion への結果受け渡しが正常             | 統合テスト |
| AC-INT-03 | RRF Fusion → Reranker への結果受け渡しが正常                  | 統合テスト |
| AC-INT-04 | Reranker → CRAG への結果受け渡しが正常                        | 統合テスト |
| AC-INT-05 | CRAG有効/無効の切り替えが正常に動作                           | 統合テスト |
| AC-INT-06 | フィルタ（fileIds, fileTypes等）が各検索戦略に正しく渡される  | 統合テスト |

---

## 4. 受け入れ基準チェックリスト

実装完了時に以下をすべて確認：

### 機能要件

- [ ] AC-FR-01: HybridRAGEngine.search()が正しいResult型を返す
- [ ] AC-FR-02: 4ステージがpipelineStagesに記録される
- [ ] AC-FR-03: Factory3種類が正常に動作する
- [ ] AC-FR-04: 部分的な検索失敗でも結果を返す
- [ ] AC-FR-05: メトリクスが正しく記録される

### 非機能要件

- [ ] AC-NFR-01: レイテンシ目標達成
- [ ] AC-NFR-02: 精度目標達成（MRR@10 >= 0.9）
- [ ] AC-NFR-03: カバレッジ目標達成
- [ ] AC-NFR-04: 型エラーなし
- [ ] AC-NFR-05: ESLint警告なし

### 統合テスト

- [ ] AC-INT-01〜06: パイプライン統合が正常

---

## 5. 変更履歴

| 日付       | 版  | 変更内容 |
| ---------- | --- | -------- |
| 2026-01-17 | 1.0 | 初版作成 |
