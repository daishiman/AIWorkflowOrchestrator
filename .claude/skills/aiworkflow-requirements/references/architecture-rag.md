# RAG・Knowledge Graph アーキテクチャ設計

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## Knowledge Graph型定義（RAG実装）

### 概要

GraphRAG（Graph Retrieval-Augmented Generation）のKnowledge Graph構造を型安全に実装するための型定義群。
Entity-Relation-Communityモデルに基づき、文書から抽出されたエンティティ、関係性、コミュニティを表現する。

**実装場所**: `packages/shared/src/types/rag/graph/`

### 主要型定義

| 型名             | カテゴリ     | 説明                                       |
| ---------------- | ------------ | ------------------------------------------ |
| EntityEntity     | Entity       | Knowledge Graphのノード（頂点）を表現      |
| RelationEntity   | Entity       | Knowledge Graphのエッジ（辺）を表現        |
| CommunityEntity  | Entity       | 意味的に関連するエンティティ群のクラスター |
| EntityMention    | Value Object | エンティティの文書内出現位置               |
| RelationEvidence | Value Object | 関係の出典チャンク情報                     |
| GraphStatistics  | Value Object | Knowledge Graph全体の統計情報              |

### EntityEntity型（ノード）

Knowledge Graphのノード（頂点）を表現するEntity型。

**主要プロパティ**:

| プロパティ     | 型                   | 説明                                      |
| -------------- | -------------------- | ----------------------------------------- |
| id             | EntityId             | エンティティ一意識別子（UUID）            |
| name           | string               | エンティティ名（元の形式）                |
| normalizedName | string               | 正規化されたエンティティ名                |
| type           | EntityType           | エンティティタイプ（52種類）              |
| embedding      | Float32Array \| null | ベクトル埋め込み（512/768/1024/1536次元） |
| importance     | number               | 重要度スコア（0.0〜1.0）                  |
| aliases        | string[]             | 別名・エイリアス                          |

**エンティティタイプ（52種類、10カテゴリ）**:

1. 人物・組織: person, organization, role, team（4種類）
2. 場所・時間: location, date, event（3種類）
3. ビジネス・経営: company, product, service, brand, strategy, metric, business_process, market, customer（9種類）
4. 技術全般: technology, tool, method, standard, protocol（5種類）
5. コード・ソフトウェア: programming_language, framework, library, api, function, class, module（7種類）
6. 抽象概念: concept, theory, principle, pattern, model（5種類）
7. ドキュメント構造: document, chapter, section, paragraph, heading（5種類）
8. ドキュメント要素: keyword, summary, figure, table, list, quote, code_snippet, formula, example（9種類）
9. メディア: image, video, audio, diagram（4種類）
10. その他: other（1種類）

### RelationEntity型（エッジ）

Knowledge Graphのエッジ（辺）を表現するEntity型。

**主要プロパティ**:

| プロパティ    | 型                 | 説明                      |
| ------------- | ------------------ | ------------------------- |
| id            | RelationId         | 関係一意識別子（UUID）    |
| sourceId      | EntityId           | 始点エンティティID        |
| targetId      | EntityId           | 終点エンティティID        |
| type          | RelationType       | 関係タイプ（15種類）      |
| weight        | number             | 関係の強さ（0.0〜1.0）    |
| bidirectional | boolean            | 双方向関係かどうか        |
| evidence      | RelationEvidence[] | 関係の証拠（必須1件以上） |

**関係タイプ（15種類、5カテゴリ）**:

1. 一般関係: related_to, part_of, has_part, belongs_to（4種類）
2. コード関係: uses, implements, extends, depends_on（4種類）
3. 参照関係: references, defines（2種類）
4. 階層関係: contains, contained_by（2種類）
5. 時間・作成関係: precedes, follows, created_by（3種類）

**詳細仕様**: [interfaces-rag-knowledge-graph-store.md](./interfaces-rag-knowledge-graph-store.md)

**制約**:

- Self-loop禁止: `sourceId !== targetId`
- Evidence必須: 最低1件の証拠が必要

### CommunityEntity型（クラスター）

意味的に関連するエンティティ群のクラスター（Leiden Algorithm）。

**主要プロパティ**:

| プロパティ      | 型                  | 説明                              |
| --------------- | ------------------- | --------------------------------- |
| id              | CommunityId         | コミュニティ一意識別子（UUID）    |
| level           | number              | 階層レベル（0=ルート）            |
| parentId        | CommunityId \| null | 親コミュニティID（level 0はnull） |
| memberEntityIds | EntityId[]          | メンバーエンティティID配列        |
| memberCount     | number              | メンバー数                        |
| summary         | string              | コミュニティ要約（最大2000文字）  |

**階層制約**:

- level 0の場合: `parentId === null`（ルートコミュニティ）
- level > 0の場合: `parentId !== null`（サブコミュニティ）

### バリデーション（Zod）

すべてのEntity型にZodスキーマを定義し、ランタイムバリデーションを実装。

**実装ファイル**: `packages/shared/src/types/rag/graph/schemas.ts`

**カスタムバリデーション例**:

- Embedding次元数チェック: [512, 768, 1024, 1536]のいずれか
- Self-loop禁止: `sourceId !== targetId`
- 配列長一致: `memberCount === memberEntityIds.length`
- 階層制約: level 0は`parentId === null`

### ユーティリティ関数

**実装ファイル**: `packages/shared/src/types/rag/graph/utils.ts`

| 関数名                    | 説明                                             |
| ------------------------- | ------------------------------------------------ |
| normalizeEntityName       | エンティティ名の正規化（小文字化、特殊文字除去） |
| getInverseRelationType    | 関係タイプの逆関係取得（uses ⇄ used_by）         |
| calculateEntityImportance | 簡易PageRankによる重要度計算                     |
| generateCommunityName     | コミュニティ名の自動生成                         |
| getEntityTypeCategory     | エンティティタイプのカテゴリ取得                 |
| calculateGraphDensity     | グラフ密度の計算                                 |

### 型安全性の保証

| 保証項目       | 実装方法                                                 |
| -------------- | -------------------------------------------------------- |
| 一意識別子     | Branded Type（EntityId, RelationId, CommunityId）        |
| 列挙型         | Union型 + 定数オブジェクト（EntityTypes, RelationTypes） |
| 境界値         | Zodスキーマによる範囲制約（0.0〜1.0）                    |
| 必須フィールド | TypeScript readonly + Zod required                       |
| カスタム制約   | Zod refine()による独自ロジック                           |

### テストカバレッジ

| ファイル   | カバレッジ                                         |
| ---------- | -------------------------------------------------- |
| types.ts   | 100% (Statements/Functions/Lines), 100% (Branches) |
| schemas.ts | 100% (Statements/Functions/Lines), 100% (Branches) |
| utils.ts   | 100% (Statements/Functions), 94.73% (Branches)     |

**総合カバレッジ**: 99.2%（目標80%を19.2%超過達成）

**総テスト数**: 230ケース（正常系・異常系・境界値）

---

## DiskANNベクトル検索アーキテクチャ

### 概要

libSQLのDiskANNベクトルインデックスを活用した高速な近似最近傍探索（ANN）。
セマンティック検索基盤として、チャンクの埋め込みベクトルを効率的に検索。

**実装場所**:

- スキーマ: `packages/shared/src/db/schema/embeddings.ts`
- インデックス管理: `packages/shared/src/db/schema/vector-index.ts`
- 検索クエリ: `packages/shared/src/db/queries/vector-search.ts`

### アーキテクチャ図

```
┌─────────────────────────────────────────────────┐
│                  RAG Pipeline                   │
├─────────────────────────────────────────────────┤
│  Query Vector                                   │
│       │                                         │
│       ▼                                         │
│  ┌─────────────────┐    ┌─────────────────┐    │
│  │   Embeddings    │────│   DiskANN       │    │
│  │   Table (BLOB)  │    │   Index         │    │
│  └────────┬────────┘    └─────────────────┘    │
│           │                                     │
│           ▼                                     │
│  ┌─────────────────┐    ┌─────────────────┐    │
│  │     Chunks      │────│     Files       │    │
│  │   (content)     │    │   (metadata)    │    │
│  └─────────────────┘    └─────────────────┘    │
└─────────────────────────────────────────────────┘
```

### 距離メトリクス

| メトリクス       | libSQL関数          | 特性                             | 用途               |
| ---------------- | ------------------- | -------------------------------- | ------------------ |
| コサイン類似度   | vector_distance_cos | 方向の類似性を測定（0〜2）       | テキスト埋め込み   |
| ユークリッド距離 | vector_distance_l2  | ユークリッド空間での距離（0〜∞） | 空間データ         |
| 内積             | vector_dot          | 内積値（-∞〜∞）                  | 正規化ベクトル向け |

### 類似度計算

| メトリクス       | 距離→類似度変換                     | 範囲     |
| ---------------- | ----------------------------------- | -------- |
| コサイン類似度   | `similarity = 1 - distance / 2`     | 0.0〜1.0 |
| ユークリッド距離 | `similarity = 1 / (1 + distance)`   | 0.0〜1.0 |
| 内積             | `similarity = (dotProduct + 1) / 2` | 0.0〜1.0 |

### ベクトルインデックス設定

```typescript
interface VectorIndexConfig {
  name: string; // インデックス名
  dimensions: number; // ベクトル次元数 (512/768/1024/1536/3072)
  metric: "cosine" | "l2" | "dot"; // 距離メトリクス
  maxElements?: number; // 最大要素数 (default: 1,000,000)
  efConstruction?: number; // 構築時パラメータ (default: 200)
  efSearch?: number; // 検索時パラメータ (default: 100)
}
```

### プリセット設定

| プリセット          | 次元数 | メトリクス | 用途                    |
| ------------------- | ------ | ---------- | ----------------------- |
| openai_small        | 1536   | cosine     | text-embedding-3-small  |
| openai_large        | 3072   | cosine     | text-embedding-3-large  |
| cohere_multilingual | 1024   | cosine     | embed-multilingual-v3.0 |

### データフロー

1. **埋め込み生成**: チャンク → 埋め込みプロバイダー → Float32Array
2. **BLOB変換**: Float32Array → Buffer（ゼロコピー）
3. **挿入**: embeddings テーブルへバッチ挿入（100件単位）
4. **インデックス作成**: DiskANN自動インデックス構築
5. **検索**: クエリベクトル → ANN検索 → 類似チャンク取得

### CASCADE DELETE

chunksテーブル削除時に関連するembeddingsも自動削除:

```sql
FOREIGN KEY (chunk_id) REFERENCES chunks(id) ON DELETE CASCADE
```

---

## オフライン・同期アーキテクチャ

### Turso Embedded Replicasの活用

| 項目       | 説明                                                               |
| ---------- | ------------------------------------------------------------------ |
| クラウドDB | Turso（libSQL）をプライマリDBとして使用                            |
| ローカルDB | Embedded Replicasとしてローカルにレプリカを保持                    |
| 同期方式   | クラウドからローカルへの非同期レプリケーション                     |
| 書き込み   | オンライン時はクラウドに直接書き込み、オフライン時はローカルキュー |

### オフライン時の動作

| 操作     | オフライン時の動作                           |
| -------- | -------------------------------------------- |
| 読み取り | ローカルレプリカから読み取り（即座に応答）   |
| 書き込み | ローカルキューに保存、オンライン復帰時に同期 |
| 検索     | ローカルインデックスを使用                   |
| 状態表示 | UI上でオフライン状態を明示                   |

### 同期コンフリクト解決

| 戦略             | 説明                                       |
| ---------------- | ------------------------------------------ |
| Last-Write-Wins  | タイムスタンプベースで最新の書き込みを優先 |
| 適用対象         | 設定変更、ステータス更新など単純な更新     |
| コンフリクト検出 | バージョン番号またはタイムスタンプで検出   |
| 手動解決         | 複雑なコンフリクトはユーザーに選択を委ねる |

---

## Desktop状態管理

### テーマ状態管理

| レイヤー         | 責務                                       | ファイル                |
| ---------------- | ------------------------------------------ | ----------------------- |
| Main Process     | nativeTheme API連携、永続化（IPC経由）     | themeHandlers.ts        |
| Preload          | contextBridgeによるAPI公開                 | preload/index.ts        |
| Renderer (Hook)  | システム監視、Zustand連携                  | useTheme.ts             |
| Renderer (Store) | テーマ状態保持（themeMode, resolvedTheme） | settingsSlice.ts        |
| Renderer (UI)    | ThemeSelectorコンポーネント                | ThemeSelector/index.tsx |

### IPCチャネル設計（テーマ）

| チャネル               | 方向            | 用途             |
| ---------------------- | --------------- | ---------------- |
| `theme:get`            | Renderer → Main | 現在のテーマ取得 |
| `theme:set`            | Renderer → Main | テーマ設定変更   |
| `theme:get-system`     | Renderer → Main | OSテーマ取得     |
| `theme:system-changed` | Main → Renderer | OSテーマ変更通知 |

### ワークスペース状態管理

| レイヤー         | 責務                                       | ファイル             |
| ---------------- | ------------------------------------------ | -------------------- |
| Main Process     | ファイルシステム操作、永続化（IPC経由）    | workspaceHandlers.ts |
| Preload          | contextBridgeによるAPI公開                 | preload/index.ts     |
| Renderer (Store) | Workspace状態保持（folders, selectedFile） | workspaceSlice.ts    |
| Renderer (UI)    | WorkspaceSidebar, FolderEntryItem          | components/          |

### IPCチャネル設計（ワークスペース）

| チャネル                   | 方向            | 用途               |
| -------------------------- | --------------- | ------------------ |
| `workspace:load`           | Renderer → Main | ワークスペース読込 |
| `workspace:save`           | Renderer → Main | ワークスペース保存 |
| `workspace:add-folder`     | Renderer → Main | フォルダ追加       |
| `workspace:validate-paths` | Renderer → Main | パス有効性検証     |
| `file:read`                | Renderer → Main | ファイル読込       |
| `file:write`               | Renderer → Main | ファイル書込       |
| `file:get-tree`            | Renderer → Main | ファイルツリー取得 |

### システムプロンプト状態管理

| レイヤー         | 責務                                  | ファイル                                   |
| ---------------- | ------------------------------------- | ------------------------------------------ |
| Main Process     | electron-store永続化（IPC経由）       | storeHandlers.ts                           |
| Preload          | contextBridgeによるAPI公開            | preload/index.ts                           |
| Renderer (Store) | テンプレート状態保持、バリデーション  | systemPromptTemplateSlice.ts, chatSlice.ts |
| Renderer (UI)    | SystemPromptPanel、SaveTemplateDialog | components/organisms/                      |

**状態構造**:

| State                         | 型                 | 責務                            | Slice                        |
| ----------------------------- | ------------------ | ------------------------------- | ---------------------------- |
| `systemPrompt`                | `string`           | 現在のシステムプロンプト        | chatSlice.ts                 |
| `systemPromptUpdatedAt`       | `Date \| null`     | 最終更新日時                    | chatSlice.ts                 |
| `selectedTemplateId`          | `string \| null`   | 選択中のテンプレートID          | chatSlice.ts                 |
| `templates`                   | `PromptTemplate[]` | プリセット+カスタムテンプレート | systemPromptTemplateSlice.ts |
| `isSystemPromptPanelExpanded` | `boolean`          | パネル展開状態                  | chatSlice.ts                 |
| `isSaveTemplateDialogOpen`    | `boolean`          | 保存ダイアログ表示状態          | systemPromptTemplateSlice.ts |

### IPCチャネル設計（システムプロンプト）

| チャネル       | 方向            | 用途                     |
| -------------- | --------------- | ------------------------ |
| `store:get`    | Renderer → Main | electron-storeデータ取得 |
| `store:set`    | Renderer → Main | electron-storeデータ保存 |
| `store:delete` | Renderer → Main | electron-storeデータ削除 |

**データ永続化**:

- **保存先**: electron-store（`~/.config/AIWorkflowOrchestrator/config.json`）
- **キー**: `systemPromptTemplates`
- **形式**: `PromptTemplate[]` JSON配列
- **暗号化**: 不要（機密性低いユーザー設定）
- **同期**: 保存・削除時に即座にelectron-storeへ書き込み

### IPCチャネル設計（チャット・LLM選択）

| チャネル              | 方向            | 用途                            |
| --------------------- | --------------- | ------------------------------- |
| `AI_CHAT`             | Renderer → Main | LLMへのメッセージ送信と応答取得 |
| `AI_CHECK_CONNECTION` | Renderer → Main | LLM/RAG接続状態確認             |
| `AI_INDEX`            | Renderer → Main | RAGドキュメントインデックス作成 |

**プロセス間責務分離**:

| プロセス     | 責務                                                                 |
| ------------ | -------------------------------------------------------------------- |
| Renderer     | ユーザー入力、LLM/モデル選択、システムプロンプト編集、メッセージ表示 |
| Main Process | LLM API呼び出し、RAG処理、会話履歴管理、エラーハンドリング           |

**AI_CHAT チャネル詳細**: リクエストにはユーザーメッセージ（必須）、システムプロンプト（任意）、RAG機能有効化フラグ（必須）、会話ID（任意）が含まれる。レスポンスには成功フラグ、AI応答メッセージ、会話ID、RAG参照元ファイルパス（任意）が含まれる。型定義の詳細は[コアインターフェース 6.9.2](./06-core-interfaces.md#692-ipc-型定義)を参照。

**LLM選択アーキテクチャ**:

| コンポーネント | 責務                                                          |
| -------------- | ------------------------------------------------------------- |
| LLMSelector    | プロバイダー/モデル選択UI（Renderer）                         |
| chatSlice      | 選択状態管理（currentProviderId, currentModelId）（Renderer） |
| aiHandlers.ts  | IPC経由でメッセージ受信、LLM API呼び出し（Main）              |

**統合仕様**:

- LLM選択（プロバイダー/モデル）とシステムプロンプトは独立して設定可能
- メッセージ送信時、両方の設定を`AI_CHAT` IPCリクエストに含める
- プロバイダー/モデル切り替え時もシステムプロンプトは保持される
- 会話履歴は保持されるが、各モデルは独立して動作

**対応LLMプロバイダー**:

| プロバイダー | モデル例                         | コンテキストウィンドウ |
| ------------ | -------------------------------- | ---------------------- |
| OpenAI       | gpt-5.2-instant, gpt-4           | 400K, 8K               |
| Anthropic    | claude-sonnet-4.5, claude-3-opus | 200K (1M beta), 200K   |
| Google       | gemini-3-flash, gemini-pro       | 1M, 32K                |
| xAI          | grok-4.1-fast, grok-1            | 2M, 8K                 |

**実装ファイル**:

- IPC Handler: `apps/desktop/src/main/ipc/aiHandlers.ts`
- 型定義: `apps/desktop/src/preload/types.ts`
- 状態管理: `apps/desktop/src/renderer/store/slices/chatSlice.ts`
- UIコンポーネント: `apps/desktop/src/renderer/components/molecules/LLMSelector/`

**セキュリティ考慮事項**:

| 項目                       | 対策                                             |
| -------------------------- | ------------------------------------------------ |
| APIキー保護                | Electron SafeStorageで暗号化保存                 |
| プロンプトインジェクション | ローカルアプリのため影響限定的                   |
| XSS攻撃                    | React自動エスケープ + IPC経由で文字列のみ送信    |
| レート制限対応             | プロバイダー側のレート制限エラーをRendererに通知 |

---

## クエリ分類器

### 概要

HybridRAG検索パイプラインの入口として、検索クエリを分析し最適な検索戦略を選択するコンポーネント。

### RAGパイプラインにおける位置づけ

```
クエリ → [クエリ分類器] → 検索重み決定 → Keyword/Semantic/Graph検索 → RRF統合 → 結果
```

### アーキテクチャ

| 分類器                   | 特性                     | 用途           |
| ------------------------ | ------------------------ | -------------- |
| RuleBasedQueryClassifier | 高速、パターンマッチング | フォールバック |
| LLMQueryClassifier       | 高精度、コンテキスト理解 | 推奨           |

### クエリタイプと検索重み

| タイプ       | 特徴                 | K:S:G          |
| ------------ | -------------------- | -------------- |
| local        | 特定情報の検索       | 0.35:0.35:0.30 |
| global       | 全体概要の把握       | 0.20:0.30:0.50 |
| relationship | 関係性・比較の質問   | 0.20:0.20:0.60 |
| hybrid       | 判断困難時のバランス | 0.33:0.33:0.34 |

### 実装ファイル

| 種別         | パス                                                                 |
| ------------ | -------------------------------------------------------------------- |
| 型定義       | `packages/shared/src/services/search/types.ts`                       |
| ルールベース | `packages/shared/src/services/search/rule-based-query-classifier.ts` |
| LLMベース    | `packages/shared/src/services/search/llm-query-classifier.ts`        |
| テスト       | `packages/shared/src/services/search/__tests__/`                     |

### テスト品質

- **186テストケース**
- **94.13% Line Coverage**, **92.18% Branch Coverage**, **95.23% Function Coverage**

---

## エンティティ抽出サービス (NER)

### 概要

チャンクからエンティティを抽出し、Knowledge Graphのノード候補を生成するサービス。
RAGパイプラインにおいて、ドキュメントから構造化情報を抽出する中核コンポーネント。

### RAGパイプラインにおける位置づけ

```
ドキュメント → 変換 → チャンキング → [NER] → Knowledge Graph → 検索
                                      ↓
                              ┌──────────────────┐
                              │ エンティティ抽出  │
                              │  サービス (NER)  │
                              └────────┬─────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    ↓                  ↓                  ↓
             ┌────────────┐    ┌─────────────┐    ┌────────────┐
             │  entities  │    │chunk_entities│    │ graphRela- │
             │  テーブル   │    │  テーブル    │    │   tions    │
             └────────────┘    └─────────────┘    └────────────┘
```

### データフロー

1. **入力**: Chunk（テキスト断片）
2. **処理**: IEntityExtractor.extract()
3. **出力**: ExtractedEntity[]
4. **永続化**: entities + chunk_entities テーブルへ保存

### 抽出方式

| 方式         | 実装クラス               | 特性                                   |
| ------------ | ------------------------ | -------------------------------------- |
| LLMベース    | LLMEntityExtractor       | 高精度、未知エンティティ対応           |
| ルールベース | RuleBasedEntityExtractor | 高速、パターンマッチ、フォールバック用 |

### ExtractedEntity → EntityEntity 変換

NERサービスの出力（ExtractedEntity）は、Knowledge Graph永続化時にEntityEntityに変換される。

| ExtractedEntity | EntityEntity     | 変換ロジック                 |
| --------------- | ---------------- | ---------------------------- |
| name            | name             | そのまま                     |
| normalizedName  | normalizedName   | そのまま                     |
| type            | type             | EntityType enum にマッピング |
| confidence      | importance       | 初期重要度として使用         |
| description     | description      | そのまま（LLM生成時のみ）    |
| aliases         | aliases          | JSON配列として格納           |
| mentions        | → chunk_entities | 位置情報を中間テーブルへ保存 |

### 実装ファイル

| 種別         | パス                                                              |
| ------------ | ----------------------------------------------------------------- |
| サービス     | `packages/shared/src/services/extraction/`                        |
| LLM抽出器    | `packages/shared/src/services/extraction/entity-extractor.ts`     |
| ルール抽出器 | `packages/shared/src/services/extraction/rule-based-extractor.ts` |
| 型定義       | `packages/shared/src/services/extraction/types.ts`                |
| プロンプト   | `packages/shared/src/services/extraction/prompts/`                |
| テスト       | `packages/shared/src/services/extraction/__tests__/`              |

### 関連スキーマ

| テーブル        | 役割                             | 参照                                |
| --------------- | -------------------------------- | ----------------------------------- |
| entities        | エンティティ本体（ノード）       | `db/schema/graph/entities.ts`       |
| chunk_entities  | チャンクとエンティティの関連付け | `db/schema/graph/chunk-entities.ts` |
| graph_relations | エンティティ間の関係（エッジ）   | `db/schema/graph/relations.ts`      |

### テスト品質

- **224テストケース**（単体 + 統合 + E2E）
- **97.1% Line Coverage**, **96.8% Quality Score**

**詳細参照**: `docs/30-workflows/CONV-06-04-entity-extraction-ner/outputs/phase-12/implementation-guide.md`

---

## コミュニティ検出サービス (Leiden Algorithm)

### 概要

Knowledge Graphのエンティティを意味的に関連するグループ（コミュニティ）に自動分類するサービス。
GraphRAGにおいて、グラフ全体の構造を把握し、質問に対する包括的な回答を生成するための基盤を提供する。

### RAGパイプラインにおける位置づけ

```
ドキュメント → 変換 → チャンキング → NER → 関係抽出 → [コミュニティ検出] → 検索・要約
                                                            ↓
                                                ┌──────────────────┐
                                                │  コミュニティ検出  │
                                                │  サービス (Leiden)│
                                                └────────┬─────────┘
                                                         │
                              ┌───────────────────────────┼───────────────────────────┐
                              ↓                           ↓                           ↓
                       ┌────────────┐             ┌─────────────┐             ┌────────────┐
                       │ communities │             │entity_      │             │ Community  │
                       │  テーブル   │             │communities  │             │  Summary   │
                       └────────────┘             └─────────────┘             └────────────┘
```

### アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────┐
│                     CommunityDetector                            │
│                  (ICommunityDetector実装)                        │
├─────────────────────────────────────────────────────────────────┤
│  detect()               │ Leidenアルゴリズムによる検出          │
│  saveResults()          │ コミュニティをDBに永続化              │
│  getCommunitiesForEntity()│ エンティティのコミュニティ取得      │
│  getCommunitiesByLevel()│ レベル別コミュニティ取得              │
│  getCommunityMembers()  │ コミュニティメンバー取得              │
└───────────────┬─────────────────────────────────────────────────┘
                │
       ┌────────┴────────┐
       ▼                 ▼
┌─────────────┐   ┌──────────────────┐
│LeidenAlgorithm│   │ICommunityRepository│
│ (Pure Function)│   │   (Persistence)   │
└─────────────┘   └──────────────────┘
```

### Leidenアルゴリズム処理フロー

1. **Local Move Phase**: 各ノードを隣接ノードのコミュニティへ試行移動
2. **Refinement Phase**: コミュニティ内でさらにサブコミュニティを検出
3. **Aggregation Phase**: コミュニティをスーパーノードとして集約
4. **Hierarchy Build**: 階層構造を構築（level 0 → level N）

### 主要インターフェース

**ICommunityDetector**: コミュニティ検出サービスの抽象インターフェース

| メソッド                  | 説明                               |
| ------------------------- | ---------------------------------- |
| detect()                  | グラフからコミュニティを検出       |
| saveResults()             | 検出結果をDBに永続化               |
| getCommunitiesForEntity() | エンティティの所属コミュニティ取得 |
| getCommunitiesByLevel()   | レベル別コミュニティ取得           |
| getCommunityMembers()     | コミュニティのメンバー取得         |

**ICommunityRepository**: コミュニティ永続化の抽象インターフェース

| メソッド                      | 説明                                |
| ----------------------------- | ----------------------------------- |
| insert() / insertMany()       | コミュニティ挿入                    |
| findById() / findByEntityId() | コミュニティ検索                    |
| findByLevel()                 | レベル別検索                        |
| deleteAll()                   | 全削除（再検出時）                  |
| addEntityCommunityMapping()   | エンティティ-コミュニティマッピング |

### Community型

| プロパティ        | 型            | 説明                       |
| ----------------- | ------------- | -------------------------- |
| id                | CommunityId   | コミュニティ一意識別子     |
| level             | number        | 階層レベル（0が最下層）    |
| memberEntityIds   | EntityId[]    | 直接メンバーエンティティID |
| parentCommunityId | CommunityId?  | 親コミュニティID           |
| childCommunityIds | CommunityId[] | 子コミュニティID           |
| size              | number        | コミュニティサイズ         |
| modularity        | number        | モジュラリティ貢献         |

### 検出オプション (CommunityDetectionOptions)

| オプション       | デフォルト | 説明                          |
| ---------------- | ---------- | ----------------------------- |
| resolution       | 1.0        | 解像度（大→小コミュニティ多） |
| maxLevels        | 3          | 最大階層レベル数              |
| minCommunitySize | 2          | 最小コミュニティサイズ        |
| maxIterations    | 100        | 最大イテレーション数          |
| seed             | undefined  | 乱数シード（再現性用）        |

### 実装ファイル

| 種別             | パス                                                       |
| ---------------- | ---------------------------------------------------------- |
| アルゴリズム     | `packages/shared/src/services/graph/leiden-algorithm.ts`   |
| サービス         | `packages/shared/src/services/graph/community-detector.ts` |
| インターフェース | `packages/shared/src/services/graph/interfaces/`           |
| 型定義           | `packages/shared/src/services/graph/types.ts`              |
| テスト           | `packages/shared/src/services/graph/__tests__/`            |

### テスト品質

- **52テストケース**（単体 + 統合）
- **92.06% Line Coverage**, **81.30% Branch Coverage**, **100% Function Coverage**

**詳細参照**: [interfaces-rag-community-detection.md](./interfaces-rag-community-detection.md)

---

## VectorSearchStrategy（セマンティック検索）

### 概要

libSQL/TursoのDiskANNベクトルインデックスを使用したセマンティック検索戦略。
ISearchStrategyインターフェースを実装し、HybridRAGのTriple Search（Keyword/Semantic/Graph）のSemantic検索を担当する。

**実装場所**: `packages/shared/src/services/search/strategies/`

### アーキテクチャ図

```
┌─────────────────────────────────────────────────────────────────┐
│                      HybridRAG Triple Search                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ KeywordSearch   │  │ VectorSearch    │  │ GraphSearch     │  │
│  │ Strategy        │  │ Strategy ★      │  │ Strategy        │  │
│  │ (FTS5/BM25)     │  │ (DiskANN/Cosine)│  │ (Community)     │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
│           │                    │                    │            │
│           └────────────────────┼────────────────────┘            │
│                                ↓                                 │
│                    ┌─────────────────────┐                       │
│                    │   RRF統合           │                       │
│                    │   (Reciprocal Rank  │                       │
│                    │    Fusion)          │                       │
│                    └─────────────────────┘                       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 主要クラス

| クラス                     | 責務                              |
| -------------------------- | --------------------------------- |
| VectorSearchStrategy       | ISearchStrategy実装、ベクトル検索 |
| CachedVectorSearchStrategy | 埋め込みキャッシュ付きの検索      |

### ISearchStrategyインターフェース準拠

| メソッド     | 戻り値                                     | 説明               |
| ------------ | ------------------------------------------ | ------------------ |
| search()     | Promise<Result<SearchResultItem[], Error>> | ベクトル検索実行   |
| getMetrics() | StrategyMetric                             | 検索メトリクス取得 |
| name         | "semantic"                                 | 戦略名             |

### フィルタ対応状況

| フィルタ     | 状態   | 説明                |
| ------------ | ------ | ------------------- |
| fileIds      | 実装済 | 特定ファイルに限定  |
| minRelevance | 実装済 | 最低類似度閾値      |
| limit        | 実装済 | 最大結果数（1-100） |
| dateRange    | 未実装 | 将来対応予定        |
| fileTypes    | 未実装 | 将来対応予定        |
| workspaceIds | 未実装 | 将来対応予定        |

### キャッシュ戦略

| 設定項目     | デフォルト値 | 説明                         |
| ------------ | ------------ | ---------------------------- |
| TTL          | 5分          | キャッシュ有効期間           |
| maxSize      | 1000エントリ | 最大キャッシュエントリ数     |
| アルゴリズム | LRU          | 最も使われていないものを削除 |

### テスト品質

- **83テストケース**（単体35 + 統合15 + キャッシュ33）
- **98.71% Line Coverage**, **95.65% Branch Coverage**, **100% Function Coverage**

**詳細参照**: `docs/30-workflows/vector-search-diskann/outputs/phase-12/implementation-guide.md`

---

## GraphRAGクエリサービス

### 概要

コミュニティ要約を活用してユーザークエリに対する包括的な回答を生成するサービス。
ICommunitySummarizer.searchSummaries()と連携し、関連するコミュニティ要約をコンテキストとしてLLMに提供する。

### RAGパイプラインにおける位置づけ

```
ドキュメント → 変換 → チャンキング → NER → コミュニティ検出 → コミュニティ要約
                                                                    ↓
                                                          [GraphRAGクエリサービス]
                                                                    ↓
                                              ┌──────────────────────────────────────┐
                                              │     GraphRAGQueryService              │
                                              │  (IGraphRAGQueryService実装)          │
                                              ├──────────────────────────────────────┤
                                              │  query()                             │
                                              │    ├─ validateInput()                │
                                              │    ├─ Promise.all():                 │
                                              │    │   ├─ classifyQuery()            │
                                              │    │   └─ searchWithFallback()       │
                                              │    ├─ buildPrompt()                  │
                                              │    └─ llmProvider.generate()         │
                                              └──────────────────────────────────────┘
```

### 主要インターフェース

**IGraphRAGQueryService**: GraphRAGクエリサービスの抽象インターフェース

| メソッド | 説明                 |
| -------- | -------------------- |
| query()  | クエリ実行・回答生成 |

**GraphRAGQueryOptions**: クエリオプション

| オプション             | デフォルト | 説明                          |
| ---------------------- | ---------- | ----------------------------- |
| limit                  | 10         | 最大検索結果数（1-20）        |
| communityLevel         | -          | コミュニティ階層レベル（0-5） |
| confidenceThreshold    | 0.5        | confidence閾値（0-1）         |
| enableCommunitySummary | true       | コミュニティ要約検索を有効化  |

### 依存関係

| 依存サービス         | 用途                 |
| -------------------- | -------------------- |
| IQueryClassifier     | クエリタイプ分類     |
| ICommunitySummarizer | コミュニティ要約検索 |
| IEmbeddingProvider   | 埋め込み生成         |
| ILLMProvider         | 回答テキスト生成     |

### 実装ファイル

| 種別       | パス                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------ |
| サービス   | `packages/shared/src/services/search/graphrag-query-service.ts`                            |
| 型定義     | `packages/shared/src/services/search/graphrag-query-service.ts`                            |
| テスト     | `packages/shared/src/services/search/__tests__/graphrag-query-service.test.ts`             |
| 統合テスト | `packages/shared/src/services/search/__tests__/graphrag-query-service.integration.test.ts` |

### テスト品質

- **44テストケース**（単体24 + 統合20）
- **100% Line Coverage**, **91.66% Branch Coverage**, **100% Function Coverage**

**詳細参照**: [interfaces-rag-graphrag-query.md](./interfaces-rag-graphrag-query.md)

---

## HybridRAG統合パイプライン

### 概要

HybridRAGは、複数の検索戦略を組み合わせて最適な検索結果を提供する統合検索エンジン。
4ステージパイプラインにより、各検索戦略の長所を活かした高精度な検索を実現する。

**実装場所**: `packages/shared/src/services/search/hybrid-rag-engine.ts`

### アーキテクチャ図

```
┌─────────────────────────────────────────────────────────────────┐
│                    HybridRAG 4-Stage Pipeline                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │            Stage 1: Query Classification                 │    │
│  │         クエリを分析し、検索戦略の重みを決定             │    │
│  │  ┌──────────────┐                                        │    │
│  │  │IQueryClassifier│ → QueryType + SearchWeights          │    │
│  │  └──────────────┘                                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│          ┌───────────────────┼───────────────────┐              │
│          ▼                   ▼                   ▼              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │            Stage 2: Triple Search (並列実行)             │    │
│  │                                                          │    │
│  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ │    │
│  │  │KeywordSearch  │ │VectorSearch   │ │GraphSearch    │ │    │
│  │  │Strategy       │ │Strategy       │ │Strategy       │ │    │
│  │  │(FTS5/BM25)    │ │(DiskANN)      │ │(Knowledge     │ │    │
│  │  │               │ │               │ │ Graph)        │ │    │
│  │  └───────────────┘ └───────────────┘ └───────────────┘ │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│          └───────────────────┼───────────────────┘              │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │            Stage 3a: RRF Fusion                          │    │
│  │         Reciprocal Rank Fusionで結果を統合               │    │
│  │         score = Σ(weight_i / (k + rank_i))              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │            Stage 3b: Reranking                           │    │
│  │         CrossEncoder/LLMで関連性を再評価                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │            Stage 4: CRAG (Optional)                      │    │
│  │         Corrective RAGで結果品質を評価・補正             │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐                   │    │
│  │  │ CORRECT │ │ REFINE  │ │ AUGMENT │                   │    │
│  │  │そのまま  │ │フィルタ │ │Web検索  │                   │    │
│  │  └─────────┘ └─────────┘ └─────────┘                   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  HybridRAGResponse                       │    │
│  │  results[], metadata, augmentedContext?                  │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### データフロー

1. **Stage 1: Query Classification**
   - クエリを分析し、4タイプ（local/global/relationship/hybrid）に分類
   - タイプに応じた検索戦略の重みを決定

2. **Stage 2: Triple Search（並列実行）**
   - 3つの検索戦略をPromise.allで並列実行
   - 各戦略は独立して動作し、部分失敗に対応

3. **Stage 3a: RRF Fusion**
   - 3つの検索結果をRRFアルゴリズムで統合
   - 重み付きスコア計算: `score = Σ(weight_i / (k + rank_i))`

4. **Stage 3b: Reranking**
   - クエリと結果の関連性を再評価
   - フォールバック: 失敗時はFusion結果をそのまま使用

5. **Stage 4: CRAG（オプション）**
   - 結果の品質を評価し、必要に応じて補正
   - フォールバック: 失敗時はReranking結果をそのまま使用

### クエリタイプと検索重み

| タイプ       | 特徴                 | keyword | semantic | graph |
| ------------ | -------------------- | ------- | -------- | ----- |
| local        | 特定情報の検索       | 0.20    | 0.60     | 0.20  |
| global       | 全体概要の把握       | 0.10    | 0.30     | 0.60  |
| relationship | 関係性・比較の質問   | 0.10    | 0.20     | 0.70  |
| hybrid       | 判断困難時のバランス | 0.33    | 0.33     | 0.34  |

### フォールバック設計

| シナリオ            | 動作                        |
| ------------------- | --------------------------- |
| 1つの検索戦略が失敗 | 残りの戦略の結果で続行      |
| 2つの検索戦略が失敗 | 残りの1戦略の結果で続行     |
| 全検索戦略が失敗    | エラーを返す                |
| Rerankingが失敗     | Fusion結果をそのまま使用    |
| CRAGが失敗          | Reranking結果をそのまま使用 |

### パフォーマンス目標

| ステージ      | 目標レイテンシ                           |
| ------------- | ---------------------------------------- |
| Triple Search | < 200ms                                  |
| RRF Fusion    | < 10ms                                   |
| Reranking     | < 200ms                                  |
| CRAG          | < 300ms                                  |
| **合計**      | < 500ms (CRAG無効) / < 1000ms (CRAG有効) |

### HybridRAGFactory

設定に基づいてHybridRAGEngineを生成するファクトリクラス。

| メソッド           | 用途                             | 状態   |
| ------------------ | -------------------------------- | ------ |
| createFull()       | フル機能版（LLM分類、CRAG有効）  | 未実装 |
| createLite()       | 軽量版（ルールベース、CRAG無効） | 未実装 |
| createForTesting() | テスト用（モック注入可能）       | 実装済 |

**NOTE**: createFull()とcreateLite()は依存モジュール（LLMQueryClassifier, VectorSearchStrategy等）完成後に実装予定。

### テスト品質

- **39テストケース**（単体23 + 統合16）
- **94.32% Line Coverage**, **91.66% Branch Coverage**, **100% Function Coverage**

**詳細参照**: `docs/30-workflows/hybridrag-integration/outputs/phase-12/implementation-guide.md`

---
