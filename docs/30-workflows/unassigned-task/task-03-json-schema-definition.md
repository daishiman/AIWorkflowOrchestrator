# JSONスキーマ/データ構造定義 - タスク指示書

## メタ情報

| 項目             | 内容                        |
| ---------------- | --------------------------- |
| タスクID         | CONV-03                     |
| タスク名         | JSONスキーマ/データ構造定義 |
| 分類             | 要件/設計                   |
| 対象機能         | ファイル変換システム        |
| 優先度           | 高                          |
| 見積もり規模     | 中規模                      |
| ステータス       | 未実施                      |
| 発見元           | 初期要件定義                |
| 発見日           | 2025-12-15                  |
| 発見エージェント | @schema-def                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

ファイル変換結果をデータベースに保存するためには、統一されたデータ構造（JSONスキーマ）が必要。このスキーマは変換エンジンの出力形式を決定し、データベーススキーマの基盤となる。

### 1.2 問題点・課題

- 変換結果の統一フォーマットが未定義
- データベースに保存する際の構造が決まっていない
- バージョン管理に必要なメタデータの項目が未整理
- 将来の拡張を見据えたスキーマ設計が必要
- **RAG対応**: ベクトル埋め込み・チャンク構造の定義が必要
- **検索最適化**: ハイブリッド検索（キーワード+セマンティック）に対応したスキーマが必要

### 1.3 放置した場合の影響

- 変換エンジンの出力形式が不統一になる
- データベーススキーマの設計が進められない
- バージョン管理・履歴管理の仕組みが構築できない

---

## 2. 何を達成するか（What）

### 2.1 目的

ファイル変換結果を格納するための統一JSONスキーマとTypeScript型定義を策定する。

### 2.2 最終ゴール

- 変換結果のJSONスキーマが定義されている
- TypeScript型定義が整備されている
- バリデーション用のZodスキーマが作成されている
- バージョン管理用のメタデータ構造が定義されている
- **チャンク構造の定義**（RAGパイプライン用）
- **埋め込みベクトルのメタデータ構造**が定義されている
- スキーマのドキュメントが整備されている

### 2.3 スコープ

#### 含むもの

- 変換結果のJSONスキーマ定義
- TypeScript型定義（`packages/shared/src/types/`）
- Zodバリデーションスキーマ
- 変換メタデータの構造定義
- ファイル情報の構造定義
- バージョン管理用フィールドの定義
- **チャンク（Chunk）構造の定義**
- **埋め込みメタデータ（EmbeddingMetadata）の定義**
- **検索結果（SearchResult）の型定義**

#### 含まないもの

- データベーステーブルの実装（CONV-04で対応）
- 変換ロジックの実装（CONV-02で対応）
- 埋め込み生成ロジック（CONV-06で対応）
- 検索エンジン実装（CONV-07で対応）
- UI表示用の型定義

### 2.4 成果物

- `packages/shared/src/types/conversion.ts` - 変換結果の型定義
- `packages/shared/src/types/file-info.ts` - ファイル情報の型定義
- `packages/shared/src/types/chunk.ts` - チャンク構造の型定義
- `packages/shared/src/types/embedding.ts` - 埋め込みメタデータの型定義
- `packages/shared/src/types/search.ts` - 検索関連の型定義
- `packages/shared/src/schemas/conversion.schema.ts` - Zodスキーマ
- `packages/shared/src/schemas/file-info.schema.ts` - ファイル情報Zodスキーマ
- `packages/shared/src/schemas/chunk.schema.ts` - チャンクZodスキーマ
- JSONスキーマ定義ドキュメント

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TypeScript環境がセットアップ済み
- Zodライブラリが導入済み
- sharedパッケージの構造が整備済み

### 3.2 依存タスク

- なし（CONV-02と並行実装可能）

### 3.3 必要な知識・スキル

- TypeScript型システム
- JSONスキーマ設計
- Zodバリデーションライブラリ
- ドメインモデリング

### 3.4 推奨アプローチ

1. ドメインエキスパート（ユーザー）とデータ構造の要件を確認
2. 概念レベルでのデータモデルを設計
3. TypeScript型定義を作成
4. Zodスキーマを作成（型定義から自動推論）
5. ドキュメントを整備

---

## 4. 実行手順

### Phase構成

```
Phase 0: 要件定義 → Phase 1: 設計 → Phase 2: 設計レビュー →
Phase 3: テスト作成 → Phase 4: 実装 → Phase 5: リファクタリング →
Phase 6: 品質保証 → Phase 7: 最終レビュー → Phase 8: 手動テスト
```

### Phase 0: 要件定義

#### 目的

変換結果に含めるべきデータ項目と構造を明確化する。

#### Claude Code スラッシュコマンド

```
/ai:gather-requirements json-schema-definition
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェントリスト（動的選定）

- **エージェント**: @domain-modeler
- **選定理由**: ドメインモデルの設計、データ構造の設計に特化
- **代替候補**: @schema-def（スキーマ定義が主目的の場合）
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名            | 活用方法                 | 選定理由               |
| ------------------- | ------------------------ | ---------------------- |
| ubiquitous-language | 用語の統一               | チーム間の認識齟齬防止 |
| bounded-context     | コンテキスト境界の明確化 | 責務の明確化           |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

- データ要件定義書
- 用語集（変換・ファイル関連）

#### 完了条件

- [ ] 変換結果に含めるデータ項目が決定
- [ ] バージョン管理用メタデータが定義
- [ ] 用語が統一されている

---

### Phase 1: 設計

#### 目的

JSONスキーマとTypeScript型の詳細設計を行う。

#### Claude Code スラッシュコマンド

```
/ai:create-schema conversion-result
/ai:design-domain-model file-conversion
```

#### 使用エージェントリスト（動的選定）

- **エージェント**: @schema-def
- **選定理由**: スキーマ定義・型設計に特化
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名             | 活用方法          | 選定理由                 |
| -------------------- | ----------------- | ------------------------ |
| zod-validation       | Zodスキーマの設計 | ランタイムバリデーション |
| type-safety-patterns | 型安全な設計      | 型推論の最大化           |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

- JSONスキーマ設計書
- 型定義の設計図
- Zodスキーマの設計

#### 完了条件

- [ ] JSONスキーマのドラフトが完成
- [ ] TypeScript型の設計が完了
- [ ] Zodスキーマの設計が完了

---

### Phase 3: テスト作成 (TDD: Red)

#### 目的

スキーマのバリデーションテストを先に作成する。

#### Claude Code スラッシュコマンド

```
/ai:generate-unit-tests packages/shared/src/schemas/conversion.schema.ts
```

#### 使用エージェントリスト（動的選定）

- **エージェント**: @unit-tester
- **選定理由**: ユニットテストの設計・実装に特化
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名                | 活用方法           | 選定理由                |
| ----------------------- | ------------------ | ----------------------- |
| boundary-value-analysis | 境界値のテスト設計 | エッジケースの検証      |
| test-data-management    | テストデータの管理 | 有効/無効データのセット |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

- `packages/shared/src/schemas/__tests__/conversion.schema.test.ts`
- `packages/shared/src/schemas/__tests__/file-info.schema.test.ts`

#### 完了条件

- [ ] バリデーションテストが作成済み
- [ ] テストが失敗すること（Red状態）を確認

---

### Phase 4: 実装 (TDD: Green)

#### 目的

テストを通すための型定義とZodスキーマを実装する。

#### Claude Code スラッシュコマンド

```
/ai:create-schema conversion
/ai:create-schema file-info
```

#### 使用エージェントリスト（動的選定）

- **エージェント**: @schema-def
- **選定理由**: スキーマ定義の実装に特化
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名             | 活用方法          | 選定理由             |
| -------------------- | ----------------- | -------------------- |
| zod-validation       | Zodスキーマの実装 | バリデーションの実装 |
| type-safety-patterns | 型推論の活用      | 型安全性の確保       |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

- 型定義・Zodスキーマ実装コード一式

#### 完了条件

- [ ] テストが成功すること（Green状態）を確認

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] ConversionResult型が定義されている
- [ ] FileInfo型が定義されている
- [ ] ConversionMetadata型が定義されている
- [ ] VersionInfo型が定義されている
- [ ] 各型に対応するZodスキーマが作成されている
- [ ] スキーマによるバリデーションが正常に動作

### 品質要件

- [ ] 全テストがパス
- [ ] TypeScript型エラーなし
- [ ] ESLint警告なし
- [ ] 型推論が正しく機能（infer利用）

### ドキュメント要件

- [ ] 各型のJSDocが記述されている
- [ ] スキーマの各フィールドに説明が付与されている
- [ ] 使用例がドキュメント化されている

---

## 6. 検証方法

### テストケース

1. 有効なConversionResultのバリデーション成功
2. 必須フィールド欠落時のバリデーション失敗
3. 不正な型のフィールドでのバリデーション失敗
4. オプショナルフィールドの省略時の成功
5. ネストしたオブジェクトのバリデーション
6. 日付フィールドのフォーマット検証

### 検証手順

1. `pnpm --filter @repo/shared test:run` でユニットテスト実行
2. TypeScriptコンパイルで型エラーがないことを確認
3. サンプルデータでの手動バリデーションテスト

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                         |
| -------------------------- | ------ | -------- | ---------------------------- |
| スキーマ変更時の後方互換性 | 高     | 中       | バージョニング戦略の導入     |
| 過度に複雑なスキーマ       | 中     | 中       | シンプルさを優先、段階的拡張 |
| Zodとの型不一致            | 中     | 低       | z.infer<>による型推論の活用  |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/00-requirements/master_system_design.md`
- `docs/00-requirements/15-database-design.md`
- CONV-02: ファイル変換エンジン（変換結果の生成元）
- CONV-04: データベース保存（スキーマの利用先）

### 参考資料

- Zod Documentation: https://zod.dev/
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/

---

## 9. 備考

### 推奨スキーマ構造（2025年12月版 - RAG対応）

```typescript
// =============================================================================
// 変換結果スキーマ
// =============================================================================

// ConversionResult - 変換結果のルートオブジェクト
interface ConversionResult {
  id: string; // UUID
  fileId: string; // 元ファイルID
  version: number; // バージョン番号
  content: ConversionContent; // 変換後コンテンツ
  metadata: ConversionMetadata; // 変換メタデータ
  isLatest: boolean; // 最新フラグ
  createdAt: Date; // 作成日時
  deletedAt: Date | null; // 論理削除日時
}

// ConversionContent - 変換後の内容
interface ConversionContent {
  type: "text" | "markdown" | "json" | "csv";
  data: unknown; // 変換後データ（生データ）
  sections?: ContentSection[]; // 構造化セクション
  plainText: string; // 全文検索用プレーンテキスト
}

// ConversionMetadata - 変換メタデータ
interface ConversionMetadata {
  originalFileName: string; // 元ファイル名
  originalFileSize: number; // 元ファイルサイズ（bytes）
  originalMimeType: string; // MIMEタイプ
  convertedAt: Date; // 変換日時
  converterVersion: string; // コンバーターバージョン
  checksum: string; // SHA-256ハッシュ
  encoding: string; // 文字エンコーディング（UTF-8等）
}

// =============================================================================
// チャンク構造（RAGパイプライン用）
// =============================================================================

// ContentChunk - セマンティックチャンキング結果
interface ContentChunk {
  id: string; // UUID
  conversionId: string; // 親変換結果ID
  chunkIndex: number; // チャンク順序（0始まり）

  // コンテンツ
  content: string; // チャンクテキスト
  tokenCount: number; // トークン数（推定）

  // 位置情報
  startOffset: number; // 元テキストでの開始位置
  endOffset: number; // 元テキストでの終了位置

  // コンテキスト情報（Contextual Retrieval用）
  contextualHeader?: string; // セクション見出し等のコンテキスト
  parentChunkId?: string; // 親チャンクID（階層チャンキング用）

  // メタデータ
  metadata: ChunkMetadata;
}

// ChunkMetadata - チャンクメタデータ
interface ChunkMetadata {
  sectionTitle?: string; // 所属セクション名
  headingLevel?: number; // 見出しレベル（1-6）
  documentType: string; // ドキュメントタイプ
  language?: string; // 言語コード（ja, en等）

  // チャンキング設定
  chunkingStrategy: ChunkingStrategy;
  overlapTokens: number; // オーバーラップトークン数
}

// ChunkingStrategy - チャンキング戦略
type ChunkingStrategy =
  | "fixed" // 固定長（256-512トークン）
  | "semantic" // セマンティックチャンキング
  | "hierarchical" // 階層チャンキング
  | "sentence"; // 文単位

// =============================================================================
// 埋め込み（Embedding）メタデータ
// =============================================================================

// EmbeddingMetadata - 埋め込み生成情報
interface EmbeddingMetadata {
  model: EmbeddingModel; // 使用モデル
  dimensions: number; // ベクトル次元数
  generatedAt: Date; // 生成日時
  modelVersion: string; // モデルバージョン
}

// EmbeddingModel - 対応埋め込みモデル（2025年12月時点推奨）
type EmbeddingModel =
  | "openai/text-embedding-3-large" // 3072次元、MTEB 64.6%
  | "openai/text-embedding-3-small" // 1536次元、コスト効率
  | "voyage/voyage-3-large" // State-of-the-art、多言語対応
  | "cohere/embed-v4" // マルチモーダル、128Kコンテキスト
  | "bge/bge-m3" // OSS、Dense+Sparse+Multi-vector
  | "google/embedding-gemma" // オンデバイス対応、308Mパラメータ
  | "local/custom"; // ローカルモデル

// =============================================================================
// 検索関連スキーマ
// =============================================================================

// SearchQuery - 検索クエリ
interface SearchQuery {
  text: string; // 検索テキスト
  embedding?: number[]; // クエリ埋め込み（事前計算済みの場合）
  filters?: SearchFilters; // フィルタ条件
  options: SearchOptions; // 検索オプション
}

// SearchFilters - 検索フィルタ
interface SearchFilters {
  fileIds?: string[]; // ファイルID絞り込み
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  contentTypes?: string[]; // コンテンツタイプ
  tags?: string[]; // タグ（将来拡張）
}

// SearchOptions - 検索オプション
interface SearchOptions {
  mode: SearchMode; // 検索モード
  limit: number; // 取得件数（default: 10）
  offset?: number; // オフセット
  rerank: boolean; // リランキング有効化
  rerankModel?: RerankModel; // リランクモデル
  hybridWeights?: HybridWeights; // ハイブリッド検索の重み
}

// SearchMode - 検索モード
type SearchMode =
  | "keyword" // キーワード検索（BM25/FTS5）
  | "semantic" // セマンティック検索（ベクトル）
  | "hybrid"; // ハイブリッド（推奨）

// HybridWeights - ハイブリッド検索の重み配分
interface HybridWeights {
  keyword: number; // キーワード検索の重み（0-1）
  semantic: number; // セマンティック検索の重み（0-1）
}

// RerankModel - リランクモデル
type RerankModel =
  | "cohere/rerank-v3"
  | "nvidia/llama-3.2-nv-rerankqa-1b-v2"
  | "cross-encoder/ms-marco-MiniLM-L-12-v2";

// SearchResult - 検索結果
interface SearchResult {
  chunk: ContentChunk; // マッチしたチャンク
  score: number; // 関連度スコア（0-1）
  source: "keyword" | "semantic" | "hybrid";
  highlights?: string[]; // ハイライト箇所
  metadata: SearchResultMetadata;
}

// SearchResultMetadata - 検索結果メタデータ
interface SearchResultMetadata {
  keywordScore?: number; // BM25スコア
  semanticScore?: number; // コサイン類似度
  rerankScore?: number; // リランク後スコア
  retrievalTimeMs: number; // 検索所要時間
}
```

### チャンキング戦略ガイドライン（2025年最新研究に基づく）

| 戦略             | 推奨トークン数    | オーバーラップ | 用途                     |
| ---------------- | ----------------- | -------------- | ------------------------ |
| **semantic**     | 256-512           | 10-20%         | 一般ドキュメント（推奨） |
| **hierarchical** | 親: 1024, 子: 256 | 親子で連携     | 技術文書、マニュアル     |
| **fixed**        | 512               | 50トークン     | 均一な構造のテキスト     |
| **sentence**     | 文単位            | 1-2文          | 対話データ、FAQ          |

> **参考**: [NVIDIAベンチマーク](https://developer.nvidia.com/blog/finding-the-best-chunking-strategy-for-accurate-ai-responses/)によると、セマンティックチャンキングが最適で、戦略間で最大9%の精度差が発生

### 埋め込みモデル選定ガイドライン（2025年12月時点）

| モデル                     | 次元数 | 特徴                   | 推奨用途                 |
| -------------------------- | ------ | ---------------------- | ------------------------ |
| **voyage-3-large**         | 1024   | SOTA性能、多言語       | 高精度が必要な本番環境   |
| **text-embedding-3-large** | 3072   | 安定、エンタープライズ | OpenAI統合環境           |
| **bge-m3**                 | 1024   | OSS、Dense+Sparse      | コスト重視、セルフホスト |
| **embedding-gemma**        | -      | 308M、オンデバイス     | Electronローカル実行     |

> **参考**: [Voyage AI](https://blog.voyageai.com/2025/01/07/voyage-3-large/)はOpenAI比で平均9.74%の精度向上を報告

### 補足事項

- このスキーマはデータベース設計（CONV-04）の基盤となる
- バージョン管理方式（`is_latest` フラグ）を採用
- **ハイブリッド検索**を標準とし、キーワード+セマンティックの組み合わせで精度向上
- **Contextual Retrieval**: チャンクにコンテキストヘッダーを付与し検索精度を向上
- Turso/libSQLのネイティブベクトル機能（DiskANN）を活用
