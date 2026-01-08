# 要件定義書 - 関係抽出サービス

## 概要

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| 機能ID     | CONV-06-05                                            |
| 機能名     | 関係抽出サービス（Relation Extraction Service）       |
| 目的       | エンティティ間の関係を抽出しKnowledge Graphを構築する |
| 親タスク   | CONV-06（埋め込み生成パイプライン）                   |
| 依存タスク | CONV-06-04（エンティティ抽出サービス）                |
| 作成日     | 2026-01-07                                            |

---

## 1. 機能要件（Functional Requirements）

### FR-001: 単一チャンク関係抽出

| 項目   | 内容                                                        |
| ------ | ----------------------------------------------------------- |
| 要件ID | FR-001                                                      |
| 名称   | 単一チャンク関係抽出                                        |
| 説明   | ContentChunkとExtractedEntity[]から関係を抽出する           |
| 入力   | ContentChunk, ExtractedEntity[], RelationExtractionOptions? |
| 出力   | Result<RelationExtractionResult, Error>                     |
| 優先度 | Must                                                        |

**詳細仕様**:

- IRelationExtractor.extract()メソッドで実装
- エンティティが2件未満の場合は空のrelations配列を返す
- LLMを使用して関係を識別・分類
- 各関係にsourceEntity, targetEntity, relationType, confidence, evidenceを含む

---

### FR-002: バッチ関係抽出

| 項目   | 内容                                                      |
| ------ | --------------------------------------------------------- |
| 要件ID | FR-002                                                    |
| 名称   | バッチ関係抽出                                            |
| 説明   | 複数チャンクから一括で関係を抽出する                      |
| 入力   | ContentChunk[], Map<ChunkId, ExtractedEntity[]>, Options? |
| 出力   | Result<BatchRelationExtractionResult, Error>              |
| 優先度 | Must                                                      |

**詳細仕様**:

- IRelationExtractor.extractBatch()メソッドで実装
- 各チャンクを順次処理
- totalRelations（全抽出数）とuniqueRelations（重複除去後）を集計

---

### FR-003: 関係マージ

| 項目   | 内容                                       |
| ------ | ------------------------------------------ |
| 要件ID | FR-003                                     |
| 名称   | 関係マージ（重複統合）                     |
| 説明   | 複数チャンクで検出された同一関係を統合する |
| 入力   | RelationExtractionResult[]                 |
| 出力   | ExtractedRelation[]                        |
| 優先度 | Must                                       |

**詳細仕様**:

- IRelationExtractor.mergeRelations()メソッドで実装
- キー（source-target-type）で重複を識別
- evidence配列を集約
- confidenceは最大値を採用
- descriptionは長い方を採用

---

### FR-004: 関係タイプ分類

| 項目   | 内容                                   |
| ------ | -------------------------------------- |
| 要件ID | FR-004                                 |
| 名称   | 関係タイプ分類                         |
| 説明   | 抽出した関係を15種類のタイプに分類する |
| 入力   | テキストとエンティティペア             |
| 出力   | RelationType                           |
| 優先度 | Must                                   |

**関係タイプ一覧**:

| タイプ            | 説明          | 例                      |
| ----------------- | ------------- | ----------------------- |
| belongs_to        | 所属関係      | 山田 → A社              |
| related_to        | 一般的な関連  | AI → 機械学習           |
| causes            | 因果関係      | バグ → エラー           |
| depends_on        | 依存関係      | React → JavaScript      |
| created_by        | 作成者関係    | TypeScript → Microsoft  |
| uses              | 使用関係      | Next.js → React         |
| part_of           | 部分-全体関係 | 章 → 本                 |
| located_in        | 位置関係      | Google → カリフォルニア |
| succeeds          | 後継関係      | Python 3 → Python 2     |
| precedes          | 先行関係      | HTML → HTML5            |
| competes_with     | 競合関係      | React → Vue             |
| collaborates_with | 協力関係      | OpenAI → Microsoft      |
| implements        | 実装関係      | Express → HTTPサーバー  |
| extends           | 拡張関係      | TypeScript → JavaScript |
| other             | その他        | 分類困難な関係          |

---

### FR-005: 信頼度スコア付与

| 項目   | 内容                                     |
| ------ | ---------------------------------------- |
| 要件ID | FR-005                                   |
| 名称   | 信頼度スコア付与                         |
| 説明   | 各関係に0.0〜1.0の信頼度スコアを付与する |
| 入力   | LLMの判定結果                            |
| 出力   | confidence: number (0.0〜1.0)            |
| 優先度 | Must                                     |

**スコア基準**:

- 0.9〜1.0: 明示的に記述された関係
- 0.7〜0.9: 強く暗示された関係
- 0.5〜0.7: 推測による関係
- 0.5未満: 不確実な関係（デフォルトでフィルタ）

---

### FR-006: エビデンス抽出

| 項目   | 内容                                       |
| ------ | ------------------------------------------ |
| 要件ID | FR-006                                     |
| 名称   | エビデンス抽出                             |
| 説明   | 関係を示すテキスト（根拠）を特定し記録する |
| 入力   | チャンクテキスト、関係                     |
| 出力   | RelationEvidence[]                         |
| 優先度 | Must                                       |

**エビデンス情報**:

- chunkId: 出典チャンクID
- text: 関係を示すテキスト（原文から抽出）
- startPosition: 開始位置（文字オフセット）
- endPosition: 終了位置（文字オフセット）

---

### FR-007: 関係タイプフィルタリング

| 項目   | 内容                                            |
| ------ | ----------------------------------------------- |
| 要件ID | FR-007                                          |
| 名称   | 関係タイプフィルタリング                        |
| 説明   | 指定した関係タイプのみを抽出する                |
| 入力   | RelationExtractionOptions.types: RelationType[] |
| 出力   | 指定タイプのみの関係リスト                      |
| 優先度 | Should                                          |

---

### FR-008: 信頼度フィルタリング

| 項目   | 内容                                            |
| ------ | ----------------------------------------------- |
| 要件ID | FR-008                                          |
| 名称   | 信頼度フィルタリング                            |
| 説明   | 最小信頼度以上の関係のみを抽出する              |
| 入力   | RelationExtractionOptions.minConfidence: number |
| 出力   | 指定信頼度以上の関係リスト                      |
| 優先度 | Should                                          |

---

### FR-009: 双方向関係識別

| 項目   | 内容                                 |
| ------ | ------------------------------------ |
| 要件ID | FR-009                               |
| 名称   | 双方向関係識別                       |
| 説明   | 双方向の関係を識別しフラグを設定する |
| 入力   | 関係のコンテキスト                   |
| 出力   | bidirectional: boolean               |
| 優先度 | Should                               |

**双方向関係の例**:

- competes_with: 競合関係
- collaborates_with: 協力関係
- related_to: 一般的な関連

---

### FR-010: ExtractionPipeline統合

| 項目   | 内容                                             |
| ------ | ------------------------------------------------ |
| 要件ID | FR-010                                           |
| 名称   | ExtractionPipeline統合                           |
| 説明   | エンティティ抽出と連携してパイプライン処理を行う |
| 入力   | ContentChunk[], ExtractionOptions                |
| 出力   | ExtractionPipelineResult                         |
| 優先度 | Must                                             |

**統合フロー**:

1. EntityExtractor.extractBatch()でエンティティ抽出
2. チャンクごとのエンティティマップを作成
3. RelationExtractor.extractBatch()で関係抽出
4. マージと正規化
5. EntityRepository, RelationRepositoryに保存

---

## 2. 非機能要件（Non-Functional Requirements）

### NFR-001: パフォーマンス - 単一チャンク処理時間

| 項目     | 内容                                                 |
| -------- | ---------------------------------------------------- |
| 要件ID   | NFR-001                                              |
| カテゴリ | パフォーマンス（Performance）                        |
| 品質特性 | 時間効率性（Time Behaviour）                         |
| 説明     | 単一チャンクの関係抽出処理時間                       |
| 測定方法 | processingTimeMsの計測                               |
| 目標値   | 5000ms以内（500〜1000文字、5〜10エンティティの場合） |
| 許容範囲 | 7000ms以内                                           |
| 優先度   | Should                                               |

---

### NFR-002: パフォーマンス - バッチ処理スループット

| 項目     | 内容                                                 |
| -------- | ---------------------------------------------------- |
| 要件ID   | NFR-002                                              |
| カテゴリ | パフォーマンス（Performance）                        |
| 品質特性 | スループット（Throughput）                           |
| 説明     | バッチ処理の総処理時間                               |
| 測定方法 | BatchRelationExtractionResult.processingTimeMsの計測 |
| 目標値   | 10チャンク/60秒以内                                  |
| 許容範囲 | 10チャンク/90秒以内                                  |
| 優先度   | Should                                               |

---

### NFR-003: 精度 - 適合率（Precision）

| 項目     | 内容                                 |
| -------- | ------------------------------------ |
| 要件ID   | NFR-003                              |
| カテゴリ | 精度（Accuracy）                     |
| 品質特性 | 正確性（Correctness）                |
| 説明     | 抽出された関係のうち正しいものの割合 |
| 測定方法 | TP / (TP + FP) × 100%                |
| 目標値   | 70%以上                              |
| 許容範囲 | 60%以上                              |
| 優先度   | Should                               |

---

### NFR-004: 精度 - 再現率（Recall）

| 項目     | 内容                                 |
| -------- | ------------------------------------ |
| 要件ID   | NFR-004                              |
| カテゴリ | 精度（Accuracy）                     |
| 品質特性 | 完全性（Completeness）               |
| 説明     | 実際の関係のうち抽出できたものの割合 |
| 測定方法 | TP / (TP + FN) × 100%                |
| 目標値   | 60%以上                              |
| 許容範囲 | 50%以上                              |
| 優先度   | Should                               |

---

### NFR-005: スケーラビリティ - バッチサイズ

| 項目     | 内容                            |
| -------- | ------------------------------- |
| 要件ID   | NFR-005                         |
| カテゴリ | スケーラビリティ（Scalability） |
| 品質特性 | 容量（Capacity）                |
| 説明     | 一度に処理可能なチャンク数      |
| 測定方法 | extractBatch()の入力チャンク数  |
| 目標値   | 100チャンク/バッチ              |
| 許容範囲 | 50チャンク/バッチ               |
| 優先度   | Could                           |

---

### NFR-006: 信頼性 - エラー耐性

| 項目     | 内容                                             |
| -------- | ------------------------------------------------ |
| 要件ID   | NFR-006                                          |
| カテゴリ | 信頼性（Reliability）                            |
| 品質特性 | 障害許容性（Fault Tolerance）                    |
| 説明     | LLM API障害時の振る舞い                          |
| 測定方法 | エラー時のResult型返却                           |
| 目標値   | エラーを適切にResult.errで返却、バッチ処理は継続 |
| 優先度   | Must                                             |

**エラーハンドリング方針**:

- LLM APIエラー: Result.errを返却
- パースエラー: Result.errを返却
- バッチ処理中のエラー: 該当チャンクをスキップし他は継続

---

### NFR-007: 保守性 - テストカバレッジ

| 項目     | 内容                             |
| -------- | -------------------------------- |
| 要件ID   | NFR-007                          |
| カテゴリ | 保守性（Maintainability）        |
| 品質特性 | テスト可能性（Testability）      |
| 説明     | ユニットテストのコードカバレッジ |
| 測定方法 | vitest --coverage                |
| 目標値   | 80%以上                          |
| 許容範囲 | 70%以上                          |
| 優先度   | Should                           |

---

### NFR-008: 保守性 - 型安全性

| 項目     | 内容                         |
| -------- | ---------------------------- |
| 要件ID   | NFR-008                      |
| カテゴリ | 保守性（Maintainability）    |
| 品質特性 | 修正可能性（Modifiability）  |
| 説明     | TypeScript型エラーがないこと |
| 測定方法 | pnpm typecheck               |
| 目標値   | 型エラー0件                  |
| 優先度   | Must                         |

---

### NFR-009: 互換性 - IEntityExtractor連携

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| 要件ID   | NFR-009                                    |
| カテゴリ | 互換性（Compatibility）                    |
| 品質特性 | 相互運用性（Interoperability）             |
| 説明     | CONV-06-04エンティティ抽出サービスとの連携 |
| 測定方法 | 統合テストの成功                           |
| 目標値   | ExtractionPipelineで正常に連携動作         |
| 優先度   | Must                                       |

---

## 3. 依存関係

### 入力依存

| 依存タスク       | タスクID   | 入力データ        | 備考                   |
| ---------------- | ---------- | ----------------- | ---------------------- |
| エンティティ抽出 | CONV-06-04 | ExtractedEntity[] | 関係抽出の前提条件     |
| チャンク分割     | CONV-06-02 | ContentChunk[]    | 処理対象のテキスト単位 |

### 出力依存

| 依存タスク      | タスクID   | 出力データ          | 備考                   |
| --------------- | ---------- | ------------------- | ---------------------- |
| Knowledge Graph | CONV-08-01 | ExtractedRelation[] | グラフエッジとして使用 |

---

## 4. インターフェース仕様

### IRelationExtractor

```typescript
export interface IRelationExtractor {
  extract(
    chunk: ContentChunk,
    entities: ExtractedEntity[],
    options?: RelationExtractionOptions,
  ): Promise<Result<RelationExtractionResult, Error>>;

  extractBatch(
    chunks: ContentChunk[],
    entitiesByChunk: Map<ChunkId, ExtractedEntity[]>,
    options?: RelationExtractionOptions,
  ): Promise<Result<BatchRelationExtractionResult, Error>>;

  mergeRelations(results: RelationExtractionResult[]): ExtractedRelation[];
}
```

### RelationExtractionOptions

```typescript
export interface RelationExtractionOptions {
  types?: RelationType[]; // 抽出する関係タイプ
  maxRelationsPerChunk?: number; // 最大関係数（デフォルト: 30）
  minConfidence?: number; // 最小信頼度（デフォルト: 0.5）
  allowMultipleRelations?: boolean; // 複数関係許可（デフォルト: true）
  useLLM?: boolean; // LLM使用（デフォルト: true）
}
```

---

## 5. 品質特性カバレッジ

| 品質特性       | カバー | 要件ID                    |
| -------------- | ------ | ------------------------- |
| 機能適合性     | ✅     | FR-001〜FR-010            |
| パフォーマンス | ✅     | NFR-001, NFR-002          |
| 互換性         | ✅     | NFR-009                   |
| ユーザビリティ | -      | （バックエンドサービス）  |
| 信頼性         | ✅     | NFR-006                   |
| セキュリティ   | -      | （LLMプロバイダーに依存） |
| 保守性         | ✅     | NFR-007, NFR-008          |
| 移植性         | -      | （Node.js環境前提）       |

---

## 承認

| 役割         | 氏名 | 日付       | 承認 |
| ------------ | ---- | ---------- | ---- |
| 技術リード   |      | 2026-01-07 | [ ]  |
| アーキテクト |      | 2026-01-07 | [ ]  |
