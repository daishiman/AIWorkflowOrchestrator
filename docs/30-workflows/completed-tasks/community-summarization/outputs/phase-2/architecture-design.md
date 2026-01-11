# アーキテクチャ設計書 - コミュニティ要約生成（CONV-08-03）

## メタ情報

| 項目     | 内容                 |
| -------- | -------------------- |
| タスクID | CONV-08-03           |
| タスク名 | コミュニティ要約生成 |
| 作成日   | 2026-01-11           |
| Phase    | 2（設計）            |

---

## 1. レイヤー構成

```
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                           │
│   (GraphRAG Query, HybridRAG Engine, Global Query Handler)       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               ICommunitySummarizer (Interface)                   │
│  - summarize()           単一コミュニティの要約生成              │
│  - summarizeAll()        全コミュニティの一括要約生成            │
│  - searchSummaries()     要約のセマンティック検索                │
│  - updateSummary()       要約の更新                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               CommunitySummarizer (Implementation)               │
│  - buildCommunitySummaryPrompt() によるプロンプト構築            │
│  - LLMレスポンスのパース                                         │
│  - 階層順処理・並列処理制御                                      │
│  - 部分失敗の追跡                                                │
└─────────────────────────────────────────────────────────────────┘
                              │
      ┌───────────────────────┼───────────────────────┐
      │                       │                       │
      ▼                       ▼                       ▼
┌───────────────┐    ┌─────────────────┐    ┌─────────────────────┐
│  ILLMProvider │    │IEmbeddingProvider│   │ IKnowledgeGraphStore│
│  - generate() │    │  - embedSingle() │   │  - findEntities()   │
│               │    │                  │   │  - getRelations()   │
└───────────────┘    └─────────────────┘    └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ ICommunityRepository│
                    │  - findById()       │
                    │  - getSummary()     │
                    │  - updateSummary()  │
                    │  - insert()         │
                    └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │   SQLite Database   │
                    │  - communities      │
                    │  - community_summaries│
                    │  - entity_communities│
                    └─────────────────────┘
```

---

## 2. モジュール構成

### 2.1 配置構造

```
packages/shared/src/services/graph/
├── interfaces/
│   └── community-summarizer.interface.ts   # ICommunitySummarizer定義
├── prompts/
│   └── community-summary-prompt.ts         # プロンプト構築関数
├── community-summarizer.ts                 # CommunitySummarizer実装
├── types.ts                                # 型定義（追加）
└── __tests__/
    ├── community-summarizer.test.ts        # ユニットテスト
    ├── community-summary-prompt.test.ts    # プロンプトテスト
    └── community-summarizer.integration.test.ts # 統合テスト
```

### 2.2 モジュール責務

| モジュール                   | 責務                                   |
| ---------------------------- | -------------------------------------- |
| ICommunitySummarizer         | 要約生成サービスのインターフェース定義 |
| CommunitySummarizer          | 要約生成ロジックの実装                 |
| buildCommunitySummaryPrompt  | LLM用プロンプト構築                    |
| ICommunityRepository（既存） | コミュニティ永続化（getSummary追加）   |

---

## 3. 依存関係図

```
                    ┌──────────────────────┐
                    │ ICommunitySummarizer │
                    └──────────────────────┘
                              │
                              │ implements
                              ▼
                    ┌──────────────────────┐
                    │ CommunitySummarizer  │
                    └──────────────────────┘
                              │
          ┌───────────────────┼───────────────────┬───────────────────┐
          │ inject            │ inject            │ inject            │
          ▼                   ▼                   ▼                   │
┌───────────────────┐ ┌─────────────────┐ ┌─────────────────────┐    │
│   ILLMProvider    │ │IEmbeddingProvider│ │IKnowledgeGraphStore │    │
│  (外部サービス)   │ │  (外部サービス)  │ │    (CONV-08-01)     │    │
└───────────────────┘ └─────────────────┘ └─────────────────────┘    │
                                                                       │
                                                       inject          │
                                                                       ▼
                                                         ┌─────────────────────┐
                                                         │ ICommunityRepository│
                                                         │    (CONV-08-02)     │
                                                         └─────────────────────┘
                                                                  │
                                                                  │ uses
                                                                  ▼
                                                         ┌─────────────────┐
                                                         │   Community     │
                                                         │ CommunityStructure│
                                                         │  (CONV-08-02)   │
                                                         └─────────────────┘
```

---

## 4. データフロー

### 4.1 単一コミュニティ要約生成フロー

```
Community + StoredEntity[] + StoredRelation[]
                  │
                  ▼
     ┌─────────────────────────┐
     │ getSummary()            │ ← ICommunityRepository
     │ (子コミュニティ要約取得) │
     └─────────────────────────┘
                  │
                  ▼
     ┌─────────────────────────┐
     │buildCommunitySummaryPrompt()│
     │ - エンティティ上位20件  │
     │ - 関係上位30件          │
     │ - 子コミュニティ要約    │
     │ - スタイルガイド        │
     └─────────────────────────┘
                  │
                  ▼
     ┌─────────────────────────┐
     │ ILLMProvider.generate() │
     │ - temperature=0.3       │
     │ - responseFormat=json   │
     └─────────────────────────┘
                  │
                  ▼
     ┌─────────────────────────┐
     │     JSON Parse          │
     │ - summary, keywords     │
     │ - mainEntities/Relations│
     │ - sentiment, confidence │
     └─────────────────────────┘
                  │
                  ▼
     ┌─────────────────────────┐
     │IEmbeddingProvider.embedSingle()│
     │ (generateEmbedding=true時)│
     └─────────────────────────┘
                  │
                  ▼
     ┌─────────────────────────┐
     │ CommunitySummary構築    │
     └─────────────────────────┘
                  │
                  ▼
     ┌─────────────────────────┐
     │ICommunityRepository.updateSummary()│
     └─────────────────────────┘
                  │
                  ▼
           Result<CommunitySummary, Error>
```

### 4.2 全コミュニティ一括処理フロー

```
CommunityStructure.communities
                  │
                  ▼
     ┌─────────────────────────┐
     │ レベル降順ソート        │
     │ (level: 2→1→0)         │
     └─────────────────────────┘
                  │
                  ▼
     ┌─────────────────────────┐
     │ チャンク分割            │
     │ (maxConcurrency制限)    │
     └─────────────────────────┘
                  │
                  ▼
     ┌─────────────────────────┐
     │ 並列処理ループ          │
     │ for each chunk:         │
     │   Promise.all(          │
     │     summarize(community)│
     │   )                     │
     └─────────────────────────┘
                  │
                  ▼
     ┌─────────────────────────┐
     │ 結果集計                │
     │ - summaries[]          │
     │ - failedCommunities[]  │
     │ - totalTokensUsed      │
     │ - processingTimeMs     │
     └─────────────────────────┘
                  │
                  ▼
           Result<CommunitySummarizationResult, Error>
```

---

## 5. エラー処理戦略

### 5.1 Result型パターン

```typescript
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
```

### 5.2 エラー分類

| エラー種別         | 対応方針                                |
| ------------------ | --------------------------------------- |
| LLM呼び出し失敗    | Result.err返却、failedCommunitiesに追加 |
| JSONパース失敗     | Result.err返却、failedCommunitiesに追加 |
| 埋め込み生成失敗   | 警告ログ、embedding=undefined で続行    |
| DB保存失敗         | Result.err返却                          |
| コミュニティ未発見 | Result.err(\"Community not found\")     |

### 5.3 部分失敗の継続処理

- `summarizeAll()`は一部失敗しても処理を継続
- 成功した要約は`summaries[]`に格納
- 失敗したコミュニティは`failedCommunities[]`に格納
- 全体として`Result.ok`を返却

---

## 6. 非機能要件対応

### 6.1 パフォーマンス

| 要件           | 対応策                             |
| -------------- | ---------------------------------- |
| 並列処理       | maxConcurrency制限付きPromise.all  |
| トークン最適化 | エンティティ上位20件、関係上位30件 |
| 処理時間計測   | performance.now()でトラッキング    |

### 6.2 保守性

| 要件             | 対応策                          |
| ---------------- | ------------------------------- |
| 依存性注入       | コンストラクタでプロバイダ注入  |
| インターフェース | ICommunitySummarizer定義        |
| 型安全           | Branded Types (CommunityId)使用 |

---

## 完了条件

- [x] レイヤー構成が設計されている
- [x] モジュール配置が定義されている
- [x] 依存関係が図示されている
- [x] データフローが設計されている
- [x] エラー処理戦略が定義されている
- [x] 非機能要件の対応策が定義されている
