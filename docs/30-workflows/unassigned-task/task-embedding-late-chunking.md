# Late Chunking実装 - タスク指示書

## メタ情報

| 項目         | 内容                          |
| ------------ | ----------------------------- |
| タスクID     | UNASSIGNED-EMB-005            |
| タスク名     | Late Chunking実装             |
| 分類         | 要件                          |
| 対象機能     | embedding-generation-pipeline |
| 優先度       | 高                            |
| 見積もり規模 | 大規模                        |
| ステータス   | 未実施                        |
| 発見元       | Phase 8: 手動テスト検証       |
| 発見日       | 2025-12-26                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 8の手動テスト検証時に、検索品質向上の手法としてLate Chunkingが検討課題として挙がった。

従来のチャンキング手法では、チャンク境界で文脈が失われ、検索品質が低下する問題がある。Late ChunkingはJinaAI等が提唱する最新の手法で、この問題を解決する。

### 1.2 問題点・課題

**従来の手法の問題**:

処理順序:

```
1. テキスト分割（チャンキング）
2. 各チャンクを独立して埋め込み
```

問題点:

- チャンク境界で文脈が断絶
- 前後のチャンクとの意味的関連が失われる
- 検索時に関連するチャンクを見逃す可能性

**具体例**:

```
チャンク1: "関数Aは数値を受け取り、"
チャンク2: "その数値を2倍にして返します。"
```

従来の手法では、チャンク1とチャンク2が独立して埋め込まれるため、「関数Aが何をするか」という全体の文脈が失われる。

### 1.3 放置した場合の影響

**短期的影響**:

- 検索精度が限定的（特に長文書で顕著）
- チャンク境界をまたぐ情報の検索が困難

**中長期的影響**:

- ユーザー体験の低下
- 競合製品に対する劣位
- 検索品質改善の余地が大きい

**影響度**: 高（検索品質に直結、ユーザー価値向上）

---

## 2. 何を達成するか（What）

### 2.1 目的

Late Chunkingを実装し、チャンク境界での文脈損失を防ぎ、検索品質を10-30%向上させる。

### 2.2 最終ゴール

- 文書全体の文脈を考慮したチャンク埋め込みの生成
- 従来手法との切り替え可能な実装
- ベンチマークで検索精度向上を実証

### 2.3 スコープ

#### 含むもの

- ✅ トークンレベル埋め込みインターフェース
- ✅ チャンク境界検出器
- ✅ Late Chunkingサービス
- ✅ 3種類のプーリング戦略（mean, max, cls）
- ✅ EmbeddingPipelineへの統合
- ✅ ベンチマークスクリプト

#### 含まないもの

- ❌ すべてのプロバイダーでのサポート（BGE-M3等の対応モデルのみ）
- ❌ UI/UXでのLate Chunking選択機能
- ❌ 自動最適化（どちらの手法を使うかの自動判定）

### 2.4 成果物

1. `packages/shared/src/services/embedding/types/late-chunking.types.ts`
2. `packages/shared/src/services/chunking/chunk-boundary-detector.ts`
3. `packages/shared/src/services/embedding/late-chunking-service.ts`
4. 更新された`embedding-pipeline.ts`
5. テストファイル（2件）
6. ベンチマークスクリプト
7. 設計ドキュメント

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] チャンキング機能が実装済み
- [ ] トークンレベル埋め込みをサポートするモデルが利用可能
  - BGE-M3、JinaAI embeddings等
- [ ] プーリング戦略の知識がある

### 3.2 依存タスク

- UNASSIGNED-EMB-004: 追加埋め込みプロバイダー実装
  - BGE-M3等のトークンレベル埋め込みサポートプロバイダーが必要

### 3.3 必要な知識・スキル

- トランスフォーマーモデルの仕組み
- トークンレベル埋め込みの概念
- プーリング戦略（mean, max, cls）
- ベクトル演算

### 3.4 推奨アプローチ

1. インターフェースから定義
2. チャンク境界検出を先に実装
3. プーリングロジックを実装
4. パイプラインに統合
5. ベンチマークで効果を実証

---

## 4. 実行手順

### Phase構成

```
Phase 1: インターフェース定義
Phase 2: チャンク境界検出器実装
Phase 3: Late Chunkingサービス実装
Phase 4: パイプライン統合
Phase 5: ベンチマーク実施
```

### Phase 1: インターフェース定義

#### 目的

Late Chunking用の型定義を作成

#### 実行手順

`packages/shared/src/services/embedding/types/late-chunking.types.ts`:

```typescript
export interface TokenEmbedding {
  token: string;
  embedding: number[];
  position: number;
}

export interface ChunkBoundary {
  startToken: number;
  endToken: number;
  metadata?: Record<string, unknown>;
}

export interface LateChunkingResult {
  chunks: ChunkWithEmbedding[];
  documentEmbedding: number[];
}

export type PoolingStrategy = "mean" | "max" | "cls";
```

#### 成果物

- ✅ `late-chunking.types.ts`

#### 完了条件

- [ ] 型定義が完成している

### Phase 2: チャンク境界検出器実装

#### 目的

トークン列からチャンク境界を自動検出

#### 実行手順

主要機能:

- 最大チャンクサイズの遵守
- 文境界の尊重（オプション）
- オーバーラップの考慮

#### 成果物

- ✅ `chunk-boundary-detector.ts`
- ✅ テストファイル

#### 完了条件

- [ ] 境界検出が正確
- [ ] テストが通過

### Phase 3: Late Chunkingサービス実装

#### 目的

Late Chunkingのコアロジックを実装

#### 実行手順

主要機能:

- 文書全体のトークン埋め込み取得
- チャンク境界に基づくプーリング
- 3種類のプーリング戦略

#### 成果物

- ✅ `late-chunking-service.ts`
- ✅ テストファイル

#### 完了条件

- [ ] 3つのプーリング戦略が動作
- [ ] テストが通過

### Phase 4: パイプライン統合

#### 目的

EmbeddingPipelineにLate Chunkingモードを追加

#### 実行手順

設定追加:

```typescript
interface PipelineConfig {
  enableLateChunking?: boolean;
  lateChunkingPooling?: PoolingStrategy;
}
```

#### 成果物

- ✅ 更新された`embedding-pipeline.ts`

#### 完了条件

- [ ] 通常モードとLate Chunkingモードを切り替え可能

### Phase 5: ベンチマーク実施

#### 目的

Late Chunkingの効果を実証

#### 実行手順

測定項目:

- 検索精度の比較
- 処理時間の比較
- メモリ使用量の比較

#### 成果物

- ✅ ベンチマークスクリプト
- ✅ ベンチマーク結果レポート

#### 完了条件

- [ ] 検索精度向上が確認される（10-30%）

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] LateChunkingServiceが実装されている
- [ ] ChunkBoundaryDetectorが実装されている
- [ ] 3つのプーリング戦略が実装されている
- [ ] EmbeddingPipelineに統合されている
- [ ] 通常モードとの切り替えが可能

### 品質要件

- [ ] ユニットテストが実装されている
- [ ] 統合テストが実装されている
- [ ] ベンチマークで効果が実証されている
- [ ] 全テストが通過する

### ドキュメント要件

- [ ] Late Chunkingの設計ドキュメントが作成されている
- [ ] 使い分けガイドが作成されている
- [ ] ベンチマーク結果が文書化されている

---

## 6. 検証方法

### テストケース

| No  | テストケース   | 期待結果                           |
| --- | -------------- | ---------------------------------- |
| 1   | 境界検出       | 正しい境界が検出される             |
| 2   | meanプーリング | トークン埋め込みの平均が計算される |
| 3   | 文脈保持       | 隣接チャンクとの類似度が高い       |

### 検証手順

```bash
pnpm test late-chunking
pnpm tsx test-data/manual-test/scripts/late-chunking-benchmark.ts
```

---

## 7. リスクと対策

| リスク             | 影響度 | 発生確率 | 対策                               |
| ------------------ | ------ | -------- | ---------------------------------- |
| 処理時間の増加     | 中     | 高       | ベンチマークで測定、許容範囲を確認 |
| メモリ使用量の増加 | 中     | 高       | 大規模文書では注意が必要と文書化   |
| 対応モデルの制限   | 中     | 中       | BGE-M3等の対応モデルを明記         |

---

## 8. 参照情報

### 関連ドキュメント

- [Phase 8 手動テスト結果](../embedding-generation-pipeline/manual-test-execution.md)
- [チャンキングサービス設計](../embedding-generation-pipeline/design-chunking.md)

### 参考資料

- Late Chunking論文: "Late Chunking: Contextual Chunk Embeddings Using Long-Context Embedding Models" (JinaAI)
- Blog: https://jina.ai/news/late-chunking-in-long-context-embedding-models/
- GitHub: https://github.com/jina-ai/late-chunking

---

## 9. 備考

### 補足事項

**Late Chunkingの適用シーン**:

| 文書サイズ           | 効果   | 推奨                  |
| -------------------- | ------ | --------------------- |
| 短文（<512トークン） | 限定的 | 通常モード            |
| 中文（512-2048）     | 中程度 | Late Chunking推奨     |
| 長文（>2048）        | 大きい | Late Chunking強く推奨 |
| コード検索           | 大きい | Late Chunking推奨     |

**パフォーマンスへの影響**:

| 指標     | 通常モード | Late Chunking | 差分     |
| -------- | ---------- | ------------- | -------- |
| 処理時間 | 100%       | 120-150%      | +20-50%  |
| メモリ   | 100%       | 150-200%      | +50-100% |
| 検索精度 | 100%       | 110-130%      | +10-30%  |
