# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 5                       |
| Phase名    | 実装                    |
| 前提Phase  | Phase 4（テスト作成）   |
| 後続Phase  | Phase 6（テスト拡充）   |
| ステータス | 未実施                  |
| 作成日     | 2026-01-10              |
| 機能名     | community-summarization |

---

## 目的

TDDのGreen段階として、Phase 4で作成したテストを通す最小限の実装を行う。

## 背景

テストファーストにより作成されたテストを通すための実装を行い、機能を完成させる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 型定義の実装

**目的**: CommunitySummary等の型を実装

**実行手順**:

1. `packages/shared/src/services/graph/types.ts` に型を追加:

   ```typescript
   export interface CommunitySummary {
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

   export interface CommunitySummarizationOptions {
     maxSummaryTokens?: number;
     maxKeywords?: number;
     useChildSummaries?: boolean;
     generateEmbedding?: boolean;
     maxConcurrency?: number;
     summaryStyle?: "detailed" | "concise" | "technical";
   }

   export interface CommunitySummarizationResult {
     summaries: CommunitySummary[];
     totalTokensUsed: number;
     processingTimeMs: number;
     failedCommunities: CommunityId[];
   }
   ```

2. 型エクスポートを確認

**期待される成果物**:

- `packages/shared/src/services/graph/types.ts`（更新）

---

### タスク2: インターフェースの実装

**目的**: ICommunitySummarizerインターフェースを実装

**実行手順**:

1. `packages/shared/src/services/graph/interfaces/community-summarizer.interface.ts` を作成:

   ```typescript
   import type { Result } from "@/types/result";

   export interface ICommunitySummarizer {
     summarize(
       community: Community,
       entities: StoredEntity[],
       relations: StoredRelation[],
       options?: CommunitySummarizationOptions,
     ): Promise<Result<CommunitySummary, Error>>;

     summarizeAll(
       communityStructure: CommunityStructure,
       options?: CommunitySummarizationOptions,
     ): Promise<Result<CommunitySummarizationResult, Error>>;

     searchSummaries(
       query: string,
       options?: { level?: number; limit?: number },
     ): Promise<Result<CommunitySummary[], Error>>;

     updateSummary(
       communityId: CommunityId,
     ): Promise<Result<CommunitySummary, Error>>;
   }
   ```

2. インデックスファイルからエクスポート

**期待される成果物**:

- `packages/shared/src/services/graph/interfaces/community-summarizer.interface.ts`

---

### タスク3: プロンプト関数の実装

**目的**: buildCommunitySummaryPromptを実装

**実行手順**:

1. `packages/shared/src/services/graph/prompts/community-summary-prompt.ts` を作成
2. タスク指示書の実装仕様に従って実装:
   - エンティティリスト（上位20件）
   - 関係リスト（上位30件）
   - 子コミュニティの要約
   - スタイルガイド
   - JSON出力形式
3. プロンプトテストが通ることを確認

**期待される成果物**:

- `packages/shared/src/services/graph/prompts/community-summary-prompt.ts`

---

### タスク4: CommunitySummarizerサービスの実装

**目的**: メインサービスクラスを実装

**実行手順**:

1. `packages/shared/src/services/graph/community-summarizer.ts` を作成
2. コンストラクタを実装:
   ```typescript
   constructor(
     private readonly llmProvider: ILLMProvider,
     private readonly embeddingProvider: IEmbeddingProvider,
     private readonly graphStore: IKnowledgeGraphStore,
     private readonly communityRepository: CommunityRepository
   ) {}
   ```
3. summarize()メソッドを実装:
   - 子コミュニティの要約取得
   - プロンプト構築
   - LLM呼び出し
   - レスポンスパース
   - 埋め込み生成
   - DB保存
4. summarizeAll()メソッドを実装:
   - 階層順ソート
   - 並列処理（concurrency制限）
   - 失敗コミュニティの追跡
5. searchSummaries()メソッドを実装:
   - クエリ埋め込み生成
   - ベクトル類似検索
6. updateSummary()メソッドを実装

**期待される成果物**:

- `packages/shared/src/services/graph/community-summarizer.ts`

---

### タスク5: LLMProvider/EmbeddingProvider接続の実装（統合テスト連携）

**目的**: 外部プロバイダーとの接続を実装

**実行手順**:

1. ILLMProvider.generate()呼び出しを実装:
   ```typescript
   const llmResponse = await this.llmProvider.generate(prompt, {
     maxTokens: mergedOptions.maxSummaryTokens! * 2,
     temperature: 0.3,
     responseFormat: "json",
   });
   ```
2. IEmbeddingProvider.embedSingle()呼び出しを実装:
   ```typescript
   const embeddingResult = await this.embeddingProvider.embedSingle(
     parsed.data.summary,
   );
   ```
3. エラーハンドリングを実装:
   - LLM呼び出し失敗時: エラーを返却
   - 埋め込み生成失敗時: 埋め込みなしで保存

**期待される成果物**:

- `packages/shared/src/services/graph/community-summarizer.ts`（統合コード）

---

### タスク6: テスト成功確認（Green）

**目的**: 全テストが通ることを確認

**実行手順**:

1. ユニットテストを実行:
   ```bash
   pnpm --filter @repo/shared test -- community-summarizer
   ```
2. プロンプトテストを実行:
   ```bash
   pnpm --filter @repo/shared test -- community-summary-prompt
   ```
3. 全テストが成功することを確認（Green状態）

**期待される成果物**:

- テスト成功ログ（`outputs/phase-5/implementation-summary.md`に記録）

---

## 参照資料

| 参照資料             | パス                                                                                      | 内容         |
| -------------------- | ----------------------------------------------------------------------------------------- | ------------ |
| Phase 2成果物        | `outputs/phase-2/`                                                                        | 設計書       |
| Phase 4成果物        | `outputs/phase-4/`                                                                        | テスト仕様   |
| タスク指示書         | `docs/30-workflows/unassigned-task/task-08-03-community-summarization.md`                 | 実装仕様詳細 |
| コミュニティ検出仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-detection.md` | 既存型       |

---

## 成果物

| 成果物           | パス                                                                              | 内容                 |
| ---------------- | --------------------------------------------------------------------------------- | -------------------- |
| 型定義           | `packages/shared/src/services/graph/types.ts`                                     | CommunitySummary等   |
| インターフェース | `packages/shared/src/services/graph/interfaces/community-summarizer.interface.ts` | ICommunitySummarizer |
| プロンプト       | `packages/shared/src/services/graph/prompts/community-summary-prompt.ts`          | プロンプト生成関数   |
| サービス         | `packages/shared/src/services/graph/community-summarizer.ts`                      | メイン実装           |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md`                                       | 実装記録             |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 5での統合テスト連携アクション**:

LLMProvider/EmbeddingProvider接続の実装とテスト支援コード整備。

- ILLMProvider.generate()との接続実装
- IEmbeddingProvider.embedSingle()との接続実装
- ICommunityRepository.getSummary(), updateSummary()との接続実装
- IKnowledgeGraphStore.findEntities(), getRelations()との接続実装

---

## 完了条件

- [ ] CommunitySummary等の型が実装されている
- [ ] ICommunitySummarizerインターフェースが実装されている
- [ ] buildCommunitySummaryPromptが実装されている
- [ ] CommunitySummarizerサービスが実装されている
- [ ] LLMProvider/EmbeddingProvider接続が実装されている
- [ ] 全テストが成功している（Green状態）
- [ ] TypeScript型エラーがない
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` のPhase 5ステータスを更新

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test -- community-summarizer
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/community-summarization/phase-6-test-expansion.md`
