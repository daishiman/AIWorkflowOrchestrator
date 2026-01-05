# エンティティ抽出サービス (NER) - 要件定義書

## メタ情報

| 項目     | 内容                           |
| -------- | ------------------------------ |
| 作成日   | 2026-01-05                     |
| タスクID | CONV-06-04                     |
| 依存     | CONV-03-04 (Entity/Relation型) |
| 規模     | 中                             |

---

## 1. 概要

### 1.1 目的

ドキュメントチャンクから重要なエンティティ（人物、組織、概念、技術等）を抽出するサービスを実装する。Knowledge Graph構築の基盤となる。

### 1.2 背景

HybridRAGパイプラインにおいて、テキストデータからナレッジグラフを構築するために、まずエンティティを抽出する必要がある。LLMベースの高精度抽出とルールベースのフォールバックを提供し、信頼性と精度のバランスを取る。

---

## 2. 機能要件

### FR-001: LLMベースエンティティ抽出

| ID       | 要件                                                        | 優先度 | 受け入れ基準                                 |
| -------- | ----------------------------------------------------------- | ------ | -------------------------------------------- |
| FR-001-1 | ドキュメントチャンク (Chunk) からエンティティを抽出できる   | 必須   | Chunk入力で ExtractedEntity[] を返す         |
| FR-001-2 | エンティティタイプ (52種類: EntityTypes) を正しく分類できる | 必須   | 分類精度90%以上（手動評価）                  |
| FR-001-3 | 信頼度スコア (0.0-1.0) を付与できる                         | 必須   | 全エンティティに confidence が設定される     |
| FR-001-4 | エンティティの説明 (description) を生成できる（オプション） | 任意   | generateDescriptions=true で説明が生成される |
| FR-001-5 | エンティティのエイリアス（別名）を抽出できる                | 任意   | aliases 配列に別名が格納される               |
| FR-001-6 | エンティティ名を正規化できる (normalizedName)               | 必須   | 小文字化・空白統一・特殊文字除去             |

### FR-002: ルールベースエンティティ抽出

| ID       | 要件                                         | 優先度 | 受け入れ基準                          |
| -------- | -------------------------------------------- | ------ | ------------------------------------- |
| FR-002-1 | パターンマッチングでエンティティを抽出できる | 必須   | 正規表現パターンでエンティティを検出  |
| FR-002-2 | 技術名・組織名・日付を正規表現で検出できる   | 必須   | technology, organization, date を検出 |
| FR-002-3 | LLM不可時のフォールバックとして機能する      | 必須   | LLMエラー時に自動切り替え             |

### FR-003: バッチ処理

| ID       | 要件                                             | 優先度 | 受け入れ基準                    |
| -------- | ------------------------------------------------ | ------ | ------------------------------- |
| FR-003-1 | 複数チャンクからバッチでエンティティを抽出できる | 必須   | extractBatch で複数チャンク処理 |
| FR-003-2 | 重複エンティティをマージできる                   | 必須   | normalizedName で重複判定・統合 |
| FR-003-3 | マージ時にメンション情報を集約できる             | 必須   | mentions 配列に全出現位置を格納 |
| FR-003-4 | マージ時に信頼度は最大値を採用する               | 必須   | Math.max で信頼度を選択         |
| FR-003-5 | マージ時にエイリアスを統合する                   | 必須   | 重複を除去して aliases を結合   |

### FR-004: フィルタリング

| ID       | 要件                                     | 優先度 | 受け入れ基準                         |
| -------- | ---------------------------------------- | ------ | ------------------------------------ |
| FR-004-1 | エンティティタイプでフィルタリングできる | 必須   | types オプションで指定タイプのみ抽出 |
| FR-004-2 | 信頼度スコアでフィルタリングできる       | 必須   | minConfidence 未満は除外             |
| FR-004-3 | 最大抽出数を制限できる                   | 必須   | maxEntitiesPerChunk で上限設定       |
| FR-004-4 | エンティティ名の最小文字数を設定できる   | 必須   | minNameLength 未満は除外             |

### FR-005: メンション抽出

| ID       | 要件                                       | 優先度 | 受け入れ基準                      |
| -------- | ------------------------------------------ | ------ | --------------------------------- |
| FR-005-1 | テキスト内のエンティティ出現位置を記録する | 必須   | startPosition, endPosition を設定 |
| FR-005-2 | 出現位置の周辺コンテキストを抽出する       | 必須   | 前後50文字程度の context を格納   |
| FR-005-3 | 同一チャンク内の複数メンションを検出する   | 必須   | 正規表現で全出現を検出            |

---

## 3. 非機能要件

### NFR-001: パフォーマンス

| ID        | 要件                       | 目標値            | 測定方法                  |
| --------- | -------------------------- | ----------------- | ------------------------- |
| NFR-001-1 | 単一チャンク処理時間 (LLM) | 3秒以内           | processingTimeMs で計測   |
| NFR-001-2 | バッチ処理スループット     | 100チャンク/分    | 100チャンク処理時間で算出 |
| NFR-001-3 | ルールベース処理時間       | 10ms以内/チャンク | processingTimeMs で計測   |

### NFR-002: 精度

| ID        | 要件                   | 目標値  | 測定方法             |
| --------- | ---------------------- | ------- | -------------------- |
| NFR-002-1 | エンティティ抽出再現率 | 80%以上 | 手動テストで評価     |
| NFR-002-2 | エンティティ分類精度   | 90%以上 | 正解ラベルとの一致率 |

### NFR-003: 信頼性

| ID        | 要件                             | 目標値                     | 測定方法             |
| --------- | -------------------------------- | -------------------------- | -------------------- |
| NFR-003-1 | LLMエラー時のフォールバック      | ルールベースに自動切り替え | エラー注入テスト     |
| NFR-003-2 | レスポンスパース失敗時のリトライ | 3回まで                    | リトライ回数カウント |
| NFR-003-3 | バッチ処理中のエラースキップ     | エラーチャンクをスキップ   | 部分成功時の結果確認 |

### NFR-004: テスタビリティ

| ID        | 要件                   | 目標値                         |
| --------- | ---------------------- | ------------------------------ |
| NFR-004-1 | テストカバレッジ       | 80%以上                        |
| NFR-004-2 | LLMProvider モック可能 | ILLMProvider インターフェース  |
| NFR-004-3 | 依存注入サポート       | コンストラクタインジェクション |

---

## 4. インターフェース要件

### 4.1 入力

```typescript
// チャンク（既存型を使用）
interface Chunk {
  id: string;
  content: string;
  tokenCount: number;
  position: ChunkPosition;
  metadata: ChunkMetadata;
}

// 抽出オプション
interface EntityExtractionOptions {
  types?: EntityType[]; // 抽出するタイプ（省略時は全タイプ）
  maxEntitiesPerChunk?: number; // 最大抽出数（デフォルト: 20）
  minConfidence?: number; // 最小信頼度（デフォルト: 0.5）
  minNameLength?: number; // 最小名前長（デフォルト: 2）
  useLLM?: boolean; // LLM使用フラグ（デフォルト: true）
  generateDescriptions?: boolean; // 説明生成フラグ（デフォルト: true）
}
```

### 4.2 出力

```typescript
// 抽出エンティティ
interface ExtractedEntity {
  name: string; // エンティティ名
  normalizedName: string; // 正規化名
  type: EntityType; // エンティティタイプ（52種類）
  description?: string; // 説明（オプション）
  aliases: string[]; // エイリアス
  mentions: EntityMention[]; // メンション情報
  confidence: number; // 信頼度（0.0-1.0）
  attributes?: Record<string, unknown>; // 追加属性
}

// メンション情報
interface EntityMention {
  chunkId: string;
  startPosition: number;
  endPosition: number;
  context: string;
}

// 抽出結果
interface EntityExtractionResult {
  entities: ExtractedEntity[];
  chunkId: ChunkId;
  processingTimeMs: number;
  modelUsed: string;
}

// バッチ抽出結果
interface BatchEntityExtractionResult {
  results: EntityExtractionResult[];
  totalEntities: number;
  uniqueEntities: number;
  processingTimeMs: number;
}
```

---

## 5. 依存関係

### 5.1 依存するコンポーネント

| コンポーネント | パス                         | 用途                   |
| -------------- | ---------------------------- | ---------------------- |
| EntityTypes    | `types/rag/graph/types.ts`   | エンティティタイプ定義 |
| Chunk型        | `services/chunking/types.ts` | 入力チャンク型         |
| ChunkId        | `types/rag/branded.ts`       | Branded Type           |
| Result型       | `types/rag/result.ts`        | エラーハンドリング     |
| ILLMProvider   | (未実装・モック対応)         | LLM呼び出し            |

### 5.2 このサービスに依存するコンポーネント

| コンポーネント      | タスクID   | 用途                   |
| ------------------- | ---------- | ---------------------- |
| 関係抽出サービス    | CONV-06-05 | エンティティ間関係抽出 |
| Knowledge Graph構築 | CONV-08    | グラフ構築             |

---

## 6. 制約事項

1. **エンティティタイプ**: 既存の EntityTypes (52種類) を使用する
2. **Branded Types**: ChunkId, EntityId 等の既存Branded型を使用する
3. **Result型**: 既存の Result<T, E> パターンでエラーハンドリングする
4. **LLMプロバイダー**: ILLMProvider インターフェースに依存（テスト時はモック）

---

## 7. 既存仕様との整合性確認

### 7.1 EntityTypes との整合性

- CONV-03-04 で定義された 52種類の EntityTypes を使用
- 新規タイプの追加は不要
- 抽出サービスは既存の EntityType を参照するのみ

### 7.2 Chunk型との整合性

- ChunkingService の出力 (Chunk) を入力として受け取る
- Chunk.id は ChunkId として扱う
- Chunk.content からエンティティを抽出

### 7.3 Knowledge Graph型との整合性

- 抽出結果は EntityEntity に変換可能な形式
- mentions は ChunkEntityRelation.positions に対応
- normalizedName は既存の normalizeEntityName と整合

---

## 8. 受け入れ基準チェックリスト

- [ ] IEntityExtractor インターフェースが定義済み
- [ ] LLMEntityExtractor が実装済み
- [ ] RuleBasedEntityExtractor が実装済み（フォールバック用）
- [ ] 単一チャンクからの抽出が動作する
- [ ] バッチ抽出が動作する
- [ ] エンティティタイプでのフィルタリングが動作する
- [ ] 信頼度でのフィルタリングが動作する
- [ ] 重複エンティティのマージが動作する
- [ ] メンション情報の抽出が動作する
- [ ] テストカバレッジ 80% 以上
- [ ] TypeScript型エラーなし
- [ ] ESLint警告なし
