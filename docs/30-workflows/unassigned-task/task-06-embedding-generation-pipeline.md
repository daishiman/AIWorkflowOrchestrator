# 埋め込み生成パイプライン - タスク指示書

## メタ情報

| 項目             | 内容                            |
| ---------------- | ------------------------------- |
| タスクID         | CONV-06                         |
| タスク名         | 埋め込み生成パイプライン        |
| 分類             | 要件/新規機能                   |
| 対象機能         | ファイル変換システム（RAG基盤） |
| 優先度           | 高                              |
| 見積もり規模     | 大規模                          |
| ステータス       | 未実施                          |
| 発見元           | アーキテクチャ設計              |
| 発見日           | 2025-12-15                      |
| 発見エージェント | @logic-dev                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

RAG（検索拡張生成）システムを構築するためには、ドキュメントをベクトル埋め込み（embedding）に変換する必要がある。このパイプラインは変換結果をチャンク分割し、各チャンクの埋め込みベクトルを生成してデータベースに保存する。

### 1.2 問題点・課題

- 変換結果からチャンクへの分割ロジックが未実装
- 埋め込みモデルの選定と統合が必要
- バッチ処理による効率的な埋め込み生成
- Electronアプリでのオンデバイス埋め込み対応の検討
- 埋め込みモデル変更時の再埋め込み戦略
- **チャンクのコンテキスト欠落問題**（Anthropic Contextual Retrieval研究より）
- **Late Chunking対応**（Jina AI研究：トークンレベル埋め込み後のチャンキング）

### 1.3 放置した場合の影響

- セマンティック検索が実現できない
- RAGシステムが構築できない
- LLMへの適切なコンテキスト提供ができない

---

## 2. 何を達成するか（What）

### 2.1 目的

変換結果をセマンティックチャンクに分割し、埋め込みベクトルを生成してデータベースに保存するパイプラインを実装する。

### 2.2 最終ゴール

- **チャンキングサービス**: セマンティック/階層チャンキングの実装
- **埋め込みプロバイダー**: 複数モデル対応（OpenAI, Voyage, BGE-M3, オンデバイス）
- **バッチ処理**: 効率的な一括埋め込み生成
- **パイプライン統合**: 変換→チャンク→埋め込み→保存の一連フロー
- **リトライ・エラーハンドリング**: API制限対応

### 2.3 スコープ

#### 含むもの

- チャンキングサービス（semantic, hierarchical, fixed, sentence, late）
- **Contextual Embeddings**（Anthropic方式：チャンクへのコンテキスト付与）
- 埋め込みプロバイダー抽象化レイヤー
- OpenAI text-embedding-3 統合
- Voyage AI 統合（推奨：精度最高）
- **Qwen3-Embedding 統合**（MTEB多言語1位、2025年6月時点）
- BGE-M3 統合（セルフホスト用）
- EmbeddingGemma 統合（オンデバイス用）
- バッチ処理・レート制限対応
- 再埋め込みキュー管理
- **Late Chunking対応**（長文コンテキスト保持）

#### 含まないもの

- 検索ロジック（CONV-07で対応）
- UIでの埋め込み状態表示
- 外部ベクトルDB連携（将来対応）

### 2.4 成果物

- `packages/shared/src/services/chunking/` - チャンキングサービス
- `packages/shared/src/services/embedding/` - 埋め込みプロバイダー
- `packages/shared/src/services/embedding-pipeline.ts` - パイプライン統合
- 設定ファイル（モデル選択・パラメータ）
- ユニットテスト・統合テスト

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- CONV-03（JSONスキーマ）完了
- CONV-04（データベース）完了
- APIキー管理機能が整備済み

### 3.2 依存タスク

- CONV-02: ファイル変換エンジン（入力データ）
- CONV-03: JSONスキーマ定義（チャンク・埋め込み型）
- CONV-04: データベーススキーマ（保存先）

### 3.3 必要な知識・スキル

- 埋め込みモデルの特性理解
- チャンキング戦略（NLP）
- API統合（OpenAI, etc.）
- バッチ処理・キュー管理
- TypeScript

### 3.4 推奨アプローチ

1. チャンキングサービスを先に実装（埋め込み不要でテスト可能）
2. 埋め込みプロバイダー抽象化レイヤーを設計
3. OpenAI統合から開始（最も安定）
4. パイプライン統合
5. オンデバイスモデル対応

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

チャンキング戦略と埋め込みモデルの詳細要件を明確化する。

#### Claude Code スラッシュコマンド

```
/ai:gather-requirements embedding-pipeline
```

#### 使用エージェントリスト（動的選定）

- **エージェント**: @logic-dev
- **選定理由**: ビジネスロジック・アルゴリズム実装に特化
- **代替候補**: @gateway-dev（外部API統合が中心の場合）
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名            | 活用方法                     | 選定理由              |
| ------------------- | ---------------------------- | --------------------- |
| api-client-patterns | 埋め込みAPI統合パターン      | 外部API呼び出しの設計 |
| network-resilience  | リトライ・フォールバック設計 | API制限対応           |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

- 埋め込みパイプライン要件定義書
- モデル選定基準ドキュメント

#### 完了条件

- [ ] 対応チャンキング戦略が決定
- [ ] 対応埋め込みモデルが決定
- [ ] バッチ処理仕様が明確化

---

### Phase 1: 設計

#### 目的

チャンキング・埋め込みサービスのアーキテクチャ設計を行う。

#### Claude Code スラッシュコマンド

```
/ai:design-architecture embedding-pipeline
```

#### 使用エージェントリスト（動的選定）

- **エージェント**: @arch-police
- **選定理由**: クリーンアーキテクチャに基づいた設計検証
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名         | 活用方法             | 選定理由           |
| ---------------- | -------------------- | ------------------ |
| solid-principles | インターフェース設計 | 拡張性の確保       |
| factory-patterns | プロバイダー生成     | モデル切り替え対応 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

- アーキテクチャ設計書
- プロバイダーインターフェース定義
- シーケンス図

#### 完了条件

- [ ] プロバイダー抽象化の設計が完了
- [ ] チャンキングサービスの設計が完了
- [ ] パイプラインフローが定義

---

### Phase 4: 実装 (TDD: Green)

#### 目的

テストを通すための実装を行う。

#### Claude Code スラッシュコマンド

```
/ai:implement-business-logic chunking-service
/ai:implement-business-logic embedding-provider
```

#### 使用エージェントリスト（動的選定）

- **エージェント**: @logic-dev
- **選定理由**: ビジネスロジック実装に特化
- **参照**: `.claude/agents/agent_list.md`

#### 成果物

- チャンキングサービス実装
- 埋め込みプロバイダー実装（OpenAI, BGE-M3, EmbeddingGemma）
- パイプライン統合

#### 完了条件

- [ ] テストが成功すること（Green状態）を確認

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] セマンティックチャンキングが動作
- [ ] 階層チャンキングが動作
- [ ] OpenAI埋め込みが生成できる
- [ ] バッチ処理が動作（レート制限対応）
- [ ] 埋め込みがDBに保存される
- [ ] モデル切り替えが可能

### 品質要件

- [ ] 全テストがパス
- [ ] TypeScript型エラーなし
- [ ] ESLint警告なし
- [ ] テストカバレッジ80%以上
- [ ] 1000チャンクの処理が5分以内

### ドキュメント要件

- [ ] 各サービスのJSDocが記述
- [ ] 新規プロバイダー追加手順が文書化
- [ ] チャンキング設定ガイドが整備

---

## 6. 検証方法

### テストケース

1. 各チャンキング戦略の正常動作
2. 空ドキュメントのハンドリング
3. 大容量ドキュメント（100KB+）のチャンキング
4. 埋め込みAPI呼び出し成功
5. レート制限時のリトライ動作
6. バッチ処理の完了確認

### 検証手順

1. `pnpm --filter @repo/shared test:run` でユニットテスト実行
2. サンプルドキュメントでのE2Eテスト
3. APIモック環境でのバッチ処理テスト

---

## 7. リスクと対策

| リスク                             | 影響度 | 発生確率 | 対策                             |
| ---------------------------------- | ------ | -------- | -------------------------------- |
| API レート制限                     | 高     | 高       | 指数バックオフ、バッチサイズ調整 |
| 埋め込みモデル変更                 | 中     | 中       | 再埋め込みキュー、バージョン管理 |
| オンデバイスモデルのパフォーマンス | 中     | 中       | フォールバックをクラウドAPIに    |
| コスト増大                         | 中     | 中       | キャッシュ、差分更新             |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/00-requirements/master_system_design.md`
- CONV-03: JSONスキーマ定義（チャンク・埋め込み型）
- CONV-04: データベース設計（保存先）
- CONV-07: ハイブリッド検索エンジン（利用先）

### 参考資料

- [Anthropic Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval) - 67%の検索失敗率削減
- [Late Chunking: Contextual Chunk Embeddings](https://arxiv.org/abs/2409.04701) - Jina AI
- [MMTEB: Massive Multilingual Text Embedding Benchmark](https://arxiv.org/abs/2502.13595)
- [Best Chunking Strategies for RAG 2025](https://www.firecrawl.dev/blog/best-chunking-strategies-rag-2025)
- [NVIDIA Chunking Benchmark](https://developer.nvidia.com/blog/finding-the-best-chunking-strategy-for-accurate-ai-responses/)
- [Voyage AI voyage-3-large](https://blog.voyageai.com/2025/01/07/voyage-3-large/)
- [EmbeddingGemma](https://developers.googleblog.com/en/introducing-embeddinggemma/)
- [Qwen3-Embedding](https://ollama.com/library/qwen3-embedding) - MTEB多言語リーダーボード1位

---

## 9. 備考

### 推奨実装構造

```typescript
// =============================================================================
// チャンキングサービス
// =============================================================================
interface ChunkingService {
  chunk(content: string, options: ChunkingOptions): ContentChunk[];
}

interface ChunkingOptions {
  strategy: 'semantic' | 'hierarchical' | 'fixed' | 'sentence';
  targetTokens: number;      // 目標トークン数（256-512推奨）
  overlapPercent: number;    // オーバーラップ率（10-20%推奨）
  preserveHeaders: boolean;  // 見出し保持（Contextual Retrieval用）
}

// =============================================================================
// 埋め込みプロバイダー
// =============================================================================
interface EmbeddingProvider {
  embed(texts: string[]): Promise<number[][]>;
  readonly model: string;
  readonly dimensions: number;
}

// プロバイダー実装
class OpenAIEmbeddingProvider implements EmbeddingProvider { ... }
class VoyageEmbeddingProvider implements EmbeddingProvider { ... }
class BGEEmbeddingProvider implements EmbeddingProvider { ... }
class EmbeddingGemmaProvider implements EmbeddingProvider { ... } // オンデバイス

// =============================================================================
// パイプライン
// =============================================================================
class EmbeddingPipeline {
  constructor(
    private chunking: ChunkingService,
    private embedding: EmbeddingProvider,
    private chunkRepository: ChunkRepository
  ) {}

  async process(conversion: ConversionResult): Promise<void> {
    // 1. チャンク分割
    const chunks = this.chunking.chunk(conversion.content.plainText, options);

    // 2. バッチ埋め込み生成（レート制限考慮）
    const embeddings = await this.batchEmbed(chunks.map(c => c.content));

    // 3. DB保存
    await this.chunkRepository.bulkInsert(
      chunks.map((c, i) => ({ ...c, embedding: embeddings[i] }))
    );
  }

  private async batchEmbed(texts: string[]): Promise<number[][]> {
    // バッチサイズ: 100（OpenAI推奨）
    // リトライ: 指数バックオフ
  }
}
```

### チャンキング設定ガイドライン

| ドキュメントタイプ   | 推奨戦略     | トークン数    | オーバーラップ |
| -------------------- | ------------ | ------------- | -------------- |
| 技術文書・マニュアル | hierarchical | 親1024, 子256 | 親子連携       |
| 一般記事・ブログ     | semantic     | 256-512       | 10-20%         |
| FAQ・Q&A             | sentence     | 文単位        | 1-2文          |
| コード・設定ファイル | fixed        | 512           | 50トークン     |

### 埋め込みモデル選定基準（2025年12月時点）

| 基準           | Qwen3-Embedding-8B   | Voyage 3-large  | OpenAI 3-large  | BGE-M3               | EmbeddingGemma     |
| -------------- | -------------------- | --------------- | --------------- | -------------------- | ------------------ |
| **精度**       | **最高（MTEB 1位）** | 最高            | 高              | 高                   | 中                 |
| **次元数**     | 4096                 | 1024            | 3072            | 1024                 | 768                |
| **速度**       | 中                   | 中              | 中              | 中                   | 高（オンデバイス） |
| **コスト**     | 無料（セルフホスト） | $0.06/1M tokens | $0.13/1M tokens | 無料（セルフホスト） | 無料（ローカル）   |
| **多言語**     | **最良（100+言語）** | 最良            | 良              | 良                   | 良                 |
| **オフライン** | 可能                 | 不可            | 不可            | 可能                 | 可能               |

> **推奨（2025年12月更新）**:
>
> - **本番環境（精度重視）**: Qwen3-Embedding-8B または Voyage-3-large
> - **本番環境（コスト重視）**: OpenAI text-embedding-3-large
> - **オンプレミス/セルフホスト**: Qwen3-Embedding または BGE-M3
> - **オンデバイス/オフライン**: EmbeddingGemma
>
> ※ Qwen3-Embedding-8BはMTEB多言語リーダーボード1位（2025年6月5日時点、スコア70.58）

### Contextual Retrieval（Anthropic方式）

Anthropicの研究により、チャンクに**コンテキスト情報を付与**することで検索精度が大幅に向上することが実証された。

#### 効果（検索失敗率の削減）

| 手法                         | 失敗率削減 | 失敗率      |
| ---------------------------- | ---------- | ----------- |
| Contextual Embeddings のみ   | 35%        | 5.7% → 3.7% |
| Contextual Embeddings + BM25 | 49%        | 5.7% → 2.9% |
| **+ Reranking（推奨）**      | **67%**    | 5.7% → 1.9% |

#### 実装方法

```typescript
// Contextual Embedding: チャンクにコンテキストを付与
interface ContextualChunkingService {
  chunkWithContext(
    document: string,
    documentTitle: string,
    options: ChunkingOptions,
  ): ContextualChunk[];
}

interface ContextualChunk extends ContentChunk {
  contextualHeader: string; // 50-100トークンのコンテキスト
  originalContent: string;
  embeddingContent: string; // contextualHeader + originalContent
}

// コンテキスト生成例（LLMで生成）
const contextPrompt = `
<document>
{WHOLE_DOCUMENT}
</document>
以下のチャンクがドキュメント内のどの位置にあり、何について述べているか
簡潔に説明してください（50-100トークン）:
<chunk>
{CHUNK_CONTENT}
</chunk>
`;
```

#### コスト

- Claude prompt caching使用時: **$1.02 / 100万ドキュメントトークン**
- 200,000トークン未満のナレッジベースはRAG不要（全文プロンプト可）

### Late Chunking（Jina AI方式）

従来のチャンキングではコンテキストが失われる問題を、**埋め込み後にチャンキング**することで解決。

#### 従来方式 vs Late Chunking

```
【従来方式】
Document → Chunk → Embed（各チャンク独立、コンテキスト欠落）

【Late Chunking】
Document → Token-level Embed → Chunk → Mean Pooling
（ドキュメント全体のコンテキストを保持）
```

#### 特徴

- ColBERTより効率的、ナイーブチャンキングより高精度
- 長文コンテキスト埋め込みモデルが必要（Jina-embeddings-v3等）
- 追加学習不要

```typescript
interface LateChunkingService {
  // 1. ドキュメント全体をトークンレベルで埋め込み
  embedTokens(document: string): Promise<number[][]>; // [token_count, dimensions]

  // 2. トークン埋め込みをチャンクに分割
  splitIntoChunks(
    tokenEmbeddings: number[][],
    chunkBoundaries: number[],
  ): number[][][];

  // 3. 各チャンクをmean poolingで集約
  meanPool(chunkEmbeddings: number[][]): number[];
}
```

### 補足事項

- このタスクはCONV-04（データベース）完了後に実装
- オンデバイス埋め込みはElectronアプリでのオフライン対応に重要
- 埋め込みモデル変更時は全データの再埋め込みが必要（バックグラウンドジョブ推奨）
- **推奨組み合わせ**: Contextual Embeddings + Contextual BM25 + Reranking（67%精度向上）
