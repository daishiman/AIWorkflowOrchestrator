# 要件定義書 - コミュニティ要約生成（CONV-08-03）

## メタ情報

| 項目     | 内容                 |
| -------- | -------------------- |
| タスクID | CONV-08-03           |
| タスク名 | コミュニティ要約生成 |
| 作成日   | 2026-01-11           |
| Phase    | 1（要件定義）        |

---

## 1. 機能要件

### 1.1 コミュニティ要約生成（FR-001）

| 項目   | 内容                                                                       |
| ------ | -------------------------------------------------------------------------- |
| 優先度 | 必須                                                                       |
| 説明   | 単一コミュニティに対してLLMで要約を生成する                                |
| 入力   | Community, StoredEntity[], StoredRelation[], CommunitySummarizationOptions |
| 出力   | Result<CommunitySummary, Error>                                            |
| 依存   | ILLMProvider.generate()                                                    |

**処理内容**:

1. 子コミュニティの要約取得（useChildSummaries=true時）
2. プロンプト構築（エンティティ上位20件、関係上位30件）
3. LLM呼び出し（temperature=0.3, responseFormat=json）
4. JSONレスポンスのパース
5. 埋め込み生成（generateEmbedding=true時）
6. DBへの保存

### 1.2 全コミュニティ一括要約生成（FR-002）

| 項目   | 内容                                                            |
| ------ | --------------------------------------------------------------- |
| 優先度 | 必須                                                            |
| 説明   | CommunityStructure内の全コミュニティを階層順（子→親）で要約生成 |
| 入力   | CommunityStructure, CommunitySummarizationOptions               |
| 出力   | Result<CommunitySummarizationResult, Error>                     |
| 依存   | summarize(), ICommunityRepository                               |

**処理内容**:

1. 階層の深い順にソート（level降順）
2. 並列処理（maxConcurrency制限付き）
3. 失敗コミュニティの追跡
4. 統計情報の集計（totalTokensUsed, processingTimeMs, failedCommunities）

### 1.3 要約のセマンティック検索（FR-003）

| 項目   | 内容                                                        |
| ------ | ----------------------------------------------------------- |
| 優先度 | 必須                                                        |
| 説明   | クエリ文字列に類似した要約を検索する                        |
| 入力   | query: string, options?: { level?: number; limit?: number } |
| 出力   | Result<CommunitySummary[], Error>                           |
| 依存   | IEmbeddingProvider.embedSingle()                            |

**処理内容**:

1. クエリの埋め込み生成
2. ベクトル類似検索（コサイン距離）
3. レベルフィルタリング（オプション）
4. 結果のソート・制限

### 1.4 要約の更新（FR-004）

| 項目   | 内容                                         |
| ------ | -------------------------------------------- |
| 優先度 | 必須                                         |
| 説明   | 既存コミュニティの要約を再生成する           |
| 入力   | communityId: CommunityId                     |
| 出力   | Result<CommunitySummary, Error>              |
| 依存   | ICommunityRepository.findById(), summarize() |

**処理内容**:

1. コミュニティ情報の取得
2. エンティティと関係の取得
3. 要約再生成

---

## 2. 非機能要件

### 2.1 パフォーマンス要件（NFR-001）

| 項目                 | 目標値         | 説明                                     |
| -------------------- | -------------- | ---------------------------------------- |
| 単一要約生成時間     | LLM応答依存    | LLMプロバイダーのレイテンシに依存        |
| 並列処理上限         | maxConcurrency | デフォルト5、設定可能                    |
| トークン使用量       | 最適化         | エンティティ上位20件、関係上位30件に制限 |
| 処理時間トラッキング | 必須           | processingTimeMsで計測                   |

### 2.2 信頼性要件（NFR-002）

| 項目           | 要件                                             |
| -------------- | ------------------------------------------------ |
| エラー処理     | Result<T, Error>パターンで明示的に処理           |
| 部分失敗継続   | 一部コミュニティ失敗時も他を処理継続             |
| 失敗追跡       | failedCommunities[]で失敗IDを返却                |
| 埋め込み失敗時 | 埋め込みなしで要約を保存（致命的エラーとしない） |

### 2.3 保守性要件（NFR-003）

| 項目                 | 要件                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| 依存性注入           | コンストラクタでILLMProvider, IEmbeddingProvider, IKnowledgeGraphStore, ICommunityRepository注入 |
| インターフェース分離 | ICommunitySummarizer定義                                                                         |
| 型安全性             | Branded Types（CommunityId, EntityId）使用                                                       |
| JSDoc                | 全publicメソッドにドキュメント                                                                   |

---

## 3. 接続要件（統合テスト連携）

### 3.1 ILLMProvider統合

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| メソッド   | generate(prompt, options)                         |
| オプション | maxTokens, temperature=0.3, responseFormat="json" |
| エラー時   | Result.err()を返却                                |

### 3.2 IEmbeddingProvider統合

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| メソッド | embedSingle(text)                              |
| 用途     | 要約テキストの埋め込み生成、クエリ埋め込み生成 |
| エラー時 | 埋め込みなしで保存（要約生成は成功扱い）       |

### 3.3 IKnowledgeGraphStore統合

| 項目     | 内容                                                           |
| -------- | -------------------------------------------------------------- |
| メソッド | findEntities(query), getRelations(entityId, options)           |
| 用途     | コミュニティ内エンティティ・関係の取得                         |
| 戻り値   | Result<StoredEntity[], Error>, Result<StoredRelation[], Error> |

### 3.4 ICommunityRepository統合

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| 既存メソッド | findById(id), insert(), insertMany()                         |
| 追加メソッド | getSummary(communityId), updateSummary(communityId, summary) |
| 用途         | 子コミュニティ要約取得、要約の永続化                         |

### 3.5 データフロー要件

```
Community
    ↓
[IKnowledgeGraphStore] findEntities() / getRelations()
    ↓
エンティティ・関係リスト
    ↓
[ICommunityRepository] getSummary() （子コミュニティ）
    ↓
buildCommunitySummaryPrompt()
    ↓
[ILLMProvider] generate()
    ↓
JSONパース
    ↓
[IEmbeddingProvider] embedSingle() （オプション）
    ↓
CommunitySummary
    ↓
[ICommunityRepository] updateSummary()
```

---

## 4. 制約事項

### 4.1 技術的制約

| 制約                | 理由                                             |
| ------------------- | ------------------------------------------------ |
| LLMプロバイダー依存 | 要約生成にLLM呼び出しが必須                      |
| トークン制限        | LLMのコンテキスト制限に合わせたプロンプト設計    |
| 階層処理順序        | 子コミュニティの要約を親で使用するため階層順必須 |

### 4.2 前提条件

| 前提                  | 内容                               |
| --------------------- | ---------------------------------- |
| CONV-08-02完了        | Leidenコミュニティ検出が実装済み   |
| CONV-08-01完了        | Knowledge Graphストアが実装済み    |
| LLMProvider存在       | ILLMProviderの実装が利用可能       |
| EmbeddingProvider存在 | IEmbeddingProviderの実装が利用可能 |

---

## 完了条件

- [x] 機能要件が定義されている
- [x] 非機能要件（パフォーマンス、信頼性、保守性）が定義されている
- [x] 接続要件（LLM/Embedding/DB）が定義されている
- [x] 制約事項・前提条件が明確化されている

---

## 参照資料

| 参照資料                  | パス                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| タスク指示書              | `docs/30-workflows/unassigned-task/task-08-03-community-summarization.md`                   |
| コミュニティ検出仕様      | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-detection.md`   |
| Knowledge Graphストア仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md` |
