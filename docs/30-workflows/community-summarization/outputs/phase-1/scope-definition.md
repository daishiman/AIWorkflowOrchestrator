# スコープ定義書 - コミュニティ要約生成（CONV-08-03）

## メタ情報

| 項目     | 内容                 |
| -------- | -------------------- |
| タスクID | CONV-08-03           |
| タスク名 | コミュニティ要約生成 |
| 作成日   | 2026-01-11           |
| Phase    | 1（要件定義）        |

---

## 1. スコープ内

### 1.1 インターフェース定義

| 成果物               | 配置先                                                                            |
| -------------------- | --------------------------------------------------------------------------------- |
| ICommunitySummarizer | `packages/shared/src/services/graph/interfaces/community-summarizer.interface.ts` |

**メソッド**:

- `summarize()` - 単一コミュニティの要約生成
- `summarizeAll()` - 全コミュニティの一括要約生成
- `searchSummaries()` - 要約のセマンティック検索
- `updateSummary()` - 要約の更新

### 1.2 サービス実装

| 成果物              | 配置先                                                       |
| ------------------- | ------------------------------------------------------------ |
| CommunitySummarizer | `packages/shared/src/services/graph/community-summarizer.ts` |

**責務**:

- LLMプロバイダーとの連携
- 埋め込みプロバイダーとの連携
- 階層順処理の制御
- 並列処理の制御（concurrency制限）
- エラーハンドリングと部分失敗の追跡

### 1.3 プロンプト関数

| 成果物                      | 配置先                                                                   |
| --------------------------- | ------------------------------------------------------------------------ |
| buildCommunitySummaryPrompt | `packages/shared/src/services/graph/prompts/community-summary-prompt.ts` |

**責務**:

- エンティティリスト構築（上位20件）
- 関係リスト構築（上位30件）
- 子コミュニティ要約の埋め込み
- スタイルガイド適用（detailed/concise/technical）
- JSON出力形式の指定

### 1.4 型定義

| 成果物                        | 配置先                                        |
| ----------------------------- | --------------------------------------------- |
| CommunitySummary              | `packages/shared/src/services/graph/types.ts` |
| CommunitySummarizationOptions | `packages/shared/src/services/graph/types.ts` |
| CommunitySummarizationResult  | `packages/shared/src/services/graph/types.ts` |

### 1.5 テスト

| 成果物                           | 配置先                                                                                  |
| -------------------------------- | --------------------------------------------------------------------------------------- |
| community-summarizer.test.ts     | `packages/shared/src/services/graph/__tests__/`                                         |
| community-summary-prompt.test.ts | `packages/shared/src/services/graph/__tests__/`                                         |
| 統合テスト                       | `packages/shared/src/services/graph/__tests__/community-summarizer.integration.test.ts` |

---

## 2. スコープ外

### 2.1 CONV-08-02で実装済み（依存タスク）

| 機能                 | 理由                                       |
| -------------------- | ------------------------------------------ |
| コミュニティ検出     | Leidenアルゴリズムは CONV-08-02 で実装済み |
| Community型          | ICommunityDetector仕様で定義済み           |
| CommunityStructure型 | ICommunityDetector仕様で定義済み           |
| ICommunityRepository | コミュニティ永続化は CONV-08-02 で実装済み |

### 2.2 既存実装を利用

| 機能                   | 理由                                 |
| ---------------------- | ------------------------------------ |
| ILLMProvider実装       | LLMプロバイダーは既存実装を利用      |
| IEmbeddingProvider実装 | 埋め込みプロバイダーは既存実装を利用 |
| IKnowledgeGraphStore   | CONV-08-01 で実装済み                |

### 2.3 将来タスク

| 機能                 | 理由                                      |
| -------------------- | ----------------------------------------- |
| グラフ可視化         | CONV-08の範囲外、将来の可視化タスクで対応 |
| リアルタイム更新検出 | グラフ変更の自動検出は将来タスク          |
| 分散グラフ処理       | 大規模対応は将来タスク                    |
| 要約のキャッシュ     | パフォーマンス最適化は将来タスク          |

---

## 3. 境界条件

### 3.1 入力制限

| 項目             | 制限                           |
| ---------------- | ------------------------------ |
| エンティティ数   | プロンプトに上位20件のみ含める |
| 関係数           | プロンプトに上位30件のみ含める |
| 子コミュニティ数 | 制限なし（全て要約に含める）   |

### 3.2 出力制限

| 項目            | 制限                              |
| --------------- | --------------------------------- |
| 要約トークン数  | maxSummaryTokens（デフォルト200） |
| キーワード数    | maxKeywords（デフォルト10）       |
| mainEntities数  | 最大5                             |
| mainRelations数 | 最大5                             |

### 3.3 処理制限

| 項目         | 制限                          |
| ------------ | ----------------------------- |
| 並列処理数   | maxConcurrency（デフォルト5） |
| 検索結果上限 | limit（デフォルト10）         |

---

## 4. 成果物一覧

| 種別             | 成果物                                                                                  | ステータス |
| ---------------- | --------------------------------------------------------------------------------------- | ---------- |
| インターフェース | `packages/shared/src/services/graph/interfaces/community-summarizer.interface.ts`       | 未作成     |
| サービス         | `packages/shared/src/services/graph/community-summarizer.ts`                            | 未作成     |
| プロンプト       | `packages/shared/src/services/graph/prompts/community-summary-prompt.ts`                | 未作成     |
| 型定義           | `packages/shared/src/services/graph/types.ts`（追加）                                   | 未作成     |
| ユニットテスト   | `packages/shared/src/services/graph/__tests__/community-summarizer.test.ts`             | 未作成     |
| プロンプトテスト | `packages/shared/src/services/graph/__tests__/community-summary-prompt.test.ts`         | 未作成     |
| 統合テスト       | `packages/shared/src/services/graph/__tests__/community-summarizer.integration.test.ts` | 未作成     |

---

## 5. 依存関係

### 5.1 依存するタスク

| タスクID   | 名称                  | ステータス |
| ---------- | --------------------- | ---------- |
| CONV-08-01 | Knowledge Graphストア | 完了       |
| CONV-08-02 | コミュニティ検出      | 完了       |

### 5.2 依存される機能

| 機能                 | 依存タスク                       |
| -------------------- | -------------------------------- |
| コミュニティ要約     | CONV-07（HybridRAG検索エンジン） |
| グローバルクエリ回答 | CONV-07-01（クエリ分類器）       |

---

## 完了条件

- [x] スコープ内が明確に定義されている
- [x] スコープ外が明確に定義されている
- [x] 境界条件が定義されている
- [x] 成果物一覧が作成されている
- [x] 依存関係が整理されている
