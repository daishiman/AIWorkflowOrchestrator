# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 2                       |
| Phase名    | 設計                    |
| 前提Phase  | Phase 1（要件定義）     |
| 後続Phase  | Phase 3（設計レビュー） |
| ステータス | 未実施                  |
| 作成日     | 2026-01-10              |
| 機能名     | community-summarization |

---

## 目的

コミュニティ要約生成機能のアーキテクチャ設計・詳細設計を行い、実装可能な設計書を作成する。

## 背景

Phase 1で定義された要件に基づき、既存のRAGパイプラインアーキテクチャに整合する設計を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: アーキテクチャ設計

**目的**: 全体アーキテクチャとモジュール構成を設計

**実行手順**:

1. 既存アーキテクチャを確認:
   - `interfaces-rag-community-detection.md` のICommunityDetector
   - `interfaces-rag-knowledge-graph-store.md` のIKnowledgeGraphStore
2. コミュニティ要約サービスのレイヤー構成を設計:
   ```
   Application Layer
        ↓
   ICommunitySummarizer (Interface)
        ↓
   CommunitySummarizer (Implementation)
        ↓
   ┌────────────┬──────────────┬─────────────────┬───────────────────┐
   │ ILLMProvider │IEmbeddingProvider│IKnowledgeGraphStore│ICommunityRepository│
   └────────────┴──────────────┴─────────────────┴───────────────────┘
   ```
3. 依存関係を図示

**期待される成果物**:

- `outputs/phase-2/architecture-design.md`

---

### タスク2: インターフェース設計

**目的**: ICommunitySummarizer インターフェースを詳細設計

**実行手順**:

1. メソッドシグネチャを設計:
   ```typescript
   interface ICommunitySummarizer {
     summarize(
       community,
       entities,
       relations,
       options?,
     ): Promise<Result<CommunitySummary, Error>>;
     summarizeAll(
       communityStructure,
       options?,
     ): Promise<Result<CommunitySummarizationResult, Error>>;
     searchSummaries(
       query,
       options?,
     ): Promise<Result<CommunitySummary[], Error>>;
     updateSummary(communityId): Promise<Result<CommunitySummary, Error>>;
   }
   ```
2. 各メソッドの責務を定義
3. エラー処理パターンを定義（Result型）

**期待される成果物**:

- `outputs/phase-2/api-specification.md`

---

### タスク3: 型定義設計

**目的**: CommunitySummary等の型を詳細設計

**実行手順**:

1. CommunitySummary型を設計（タスク指示書のインターフェースを基に）:
   ```typescript
   interface CommunitySummary {
     communityId: CommunityId;
     level: number;
     summary: string;
     keywords: string[];
     mainEntities: string[];
     mainRelations: string[];
     sentiment?: "positive" | "negative" | "neutral";
     confidence: number;
     tokenCount: number;
     embedding?: number[];
     createdAt: Date;
   }
   ```
2. CommunitySummarizationOptions型を設計
3. CommunitySummarizationResult型を設計
4. Branded Types（CommunityId）との整合性を確認

**期待される成果物**:

- `outputs/phase-2/type-definitions.md`

---

### タスク4: プロンプト設計

**目的**: LLM用の要約プロンプトを設計

**実行手順**:

1. プロンプト構造を設計:
   - エンティティリスト（上位20件）
   - 関係リスト（上位30件）
   - 子コミュニティの要約（階層処理時）
   - スタイルガイド（detailed/concise/technical）
2. JSON出力形式を定義
3. プロンプトテンプレート関数を設計:
   ```typescript
   function buildCommunitySummaryPrompt(
     entities: StoredEntity[],
     relations: StoredRelation[],
     childSummaries: CommunitySummary[],
     options: CommunitySummarizationOptions,
   ): string;
   ```

**期待される成果物**:

- `outputs/phase-2/prompt-design.md`

---

### タスク5: 処理フロー設計

**目的**: 主要処理フローを設計

**実行手順**:

1. 単一コミュニティ要約フローを設計:
   - 子コミュニティ要約取得
   - プロンプト構築
   - LLM呼び出し
   - レスポンスパース
   - 埋め込み生成
   - DB保存
2. 全コミュニティ一括処理フローを設計:
   - 階層順ソート（深い順→浅い順）
   - 並列処理（concurrency制限）
   - 失敗コミュニティの追跡
3. セマンティック検索フローを設計:
   - クエリ埋め込み生成
   - ベクトル類似検索
   - レベルフィルタリング

**期待される成果物**:

- `outputs/phase-2/process-flow.md`

---

### タスク6: 統合ポイント設計（統合テスト連携）

**目的**: 他モジュールとの統合ポイントを詳細設計

**実行手順**:

1. ILLMProvider統合を設計:
   - generate()メソッドの呼び出し仕様
   - レスポンスフォーマット（JSON）
   - エラーハンドリング
2. IEmbeddingProvider統合を設計:
   - embedSingle()メソッドの呼び出し仕様
3. IKnowledgeGraphStore統合を設計:
   - findEntities()、getRelations()の使用
4. ICommunityRepository統合を設計:
   - getSummary()、updateSummary()メソッドの追加

**期待される成果物**:

- `outputs/phase-2/integration-design.md`

---

## 参照資料

| 参照資料                  | パス                                                                                        | 内容                             |
| ------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 1成果物             | `outputs/phase-1/`                                                                          | 要件定義、スコープ、受け入れ基準 |
| コミュニティ検出仕様      | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-detection.md`   | ICommunityDetector, Community型  |
| Knowledge Graphストア仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md` | IKnowledgeGraphStore             |
| RAGアーキテクチャ         | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                     | GraphRAG全体設計                 |
| タスク指示書              | `docs/30-workflows/unassigned-task/task-08-03-community-summarization.md`                   | 実装仕様詳細                     |

---

## 成果物

| 成果物             | パス                                     | 内容                     |
| ------------------ | ---------------------------------------- | ------------------------ |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | レイヤー構成、依存関係   |
| API仕様            | `outputs/phase-2/api-specification.md`   | ICommunitySummarizer詳細 |
| 型定義             | `outputs/phase-2/type-definitions.md`    | CommunitySummary等の型   |
| プロンプト設計     | `outputs/phase-2/prompt-design.md`       | LLMプロンプト仕様        |
| 処理フロー         | `outputs/phase-2/process-flow.md`        | 主要処理フロー図         |
| 統合設計           | `outputs/phase-2/integration-design.md`  | 統合ポイント詳細         |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 2での統合テスト連携アクション**:

統合ポイント/契約（ILLMProvider・IEmbeddingProvider・ICommunityRepository）を設計に反映する。

- ILLMProvider.generate() の呼び出し契約を定義
- IEmbeddingProvider.embedSingle() の呼び出し契約を定義
- ICommunityRepository の新規メソッド（getSummary, updateSummary）を定義
- IKnowledgeGraphStore.findEntities(), getRelations() の使用契約を定義

---

## 完了条件

- [ ] アーキテクチャ設計が完了している
- [ ] ICommunitySummarizerインターフェースが詳細設計されている
- [ ] 全ての型定義が設計されている
- [ ] プロンプト設計が完了している
- [ ] 主要処理フローが設計されている
- [ ] 統合ポイントが詳細設計されている
- [ ] 全成果物が `outputs/phase-2/` に出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` のPhase 2ステータスを更新

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/community-summarization/phase-3-design-review.md`
