# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 4                          |
| Phase名    | テスト作成                 |
| 前提Phase  | Phase 3                    |
| 後続Phase  | Phase 5                    |
| ステータス | 未実施                     |
| 作成日     | 2026-01-11                 |
| 機能名     | graphrag-query-integration |

---

## 目的

TDDの「Red」フェーズとして、Phase 2の設計に基づきGraphRAGクエリ統合機能のテストを作成する。実装前にテストを作成し、全てのテストが失敗状態（Red）であることを確認する。

## 背景

TDD（テスト駆動開発）では、実装前にテストを作成することで、要件を明確化し、実装の方向性を定める。このPhaseで作成するテストは、Phase 5の実装ガイドとなる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テストファイル構造の設計

**目的**: テストファイルの配置と構造を決定する

**実行手順**:

1. テストファイル配置を決定する

```
packages/shared/src/services/search/__tests__/
├── graphrag-query-service.test.ts        # メインサービステスト
├── graphrag-query-service.integration.test.ts  # 統合テスト
├── response-builder.test.ts              # 回答生成テスト
└── community-context-builder.test.ts     # コミュニティコンテキスト構築テスト
```

2. テストユーティリティを確認する

```typescript
// テストヘルパー・モックの確認
// packages/shared/src/services/graph/__tests__/test-helpers.ts を参照
```

**期待される成果物**:

- テストファイル構造設計

---

### タスク2: ユニットテストの作成

**目的**: GraphRAGQueryService のユニットテストを作成する

**実行手順**:

1. GraphRAGQueryService テストファイルを作成する

```typescript
// packages/shared/src/services/search/__tests__/graphrag-query-service.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import { GraphRAGQueryService } from "../graphrag-query-service";
import type { ICommunitySummarizer } from "../../graph/interfaces";
import type { IQueryClassifier } from "../interfaces";
import type { IEmbeddingProvider, ILLMProvider } from "../../llm/interfaces";

describe("GraphRAGQueryService", () => {
  // モック定義
  let mockCommunitySummarizer: ICommunitySummarizer;
  let mockQueryClassifier: IQueryClassifier;
  let mockEmbeddingProvider: IEmbeddingProvider;
  let mockLLMProvider: ILLMProvider;
  let service: GraphRAGQueryService;

  beforeEach(() => {
    // モックの初期化
    mockCommunitySummarizer = {
      searchSummaries: vi.fn(),
      summarize: vi.fn(),
      summarizeAll: vi.fn(),
      updateSummary: vi.fn(),
    };
    // 他のモックも同様に初期化
  });

  describe("query", () => {
    describe("正常系", () => {
      it("関連コミュニティ要約が存在する場合、回答にコンテキストが含まれる", async () => {
        // Arrange
        const query = "機械学習とデータ分析について教えて";
        mockCommunitySummarizer.searchSummaries.mockResolvedValue({
          success: true,
          data: [
            {
              communityId: "comm-1" as CommunityId,
              level: 0,
              summary: "機械学習に関するコミュニティ要約",
              keywords: ["機械学習", "AI"],
              confidence: 0.9,
            },
          ],
        });

        // Act
        const result = await service.query(query);

        // Assert
        expect(result.success).toBe(true);
        expect(result.data.communitySummaries).toHaveLength(1);
        expect(result.data.answer).toContain("機械学習");
      });

      it("関連コミュニティがない場合、フォールバックで回答生成される", async () => {
        // Arrange
        const query = "存在しないトピックについて";
        mockCommunitySummarizer.searchSummaries.mockResolvedValue({
          success: true,
          data: [],
        });

        // Act
        const result = await service.query(query);

        // Assert
        expect(result.success).toBe(true);
        expect(result.data.communitySummaries).toHaveLength(0);
      });

      it("階層レベル指定で検索が実行される", async () => {
        // Arrange
        const query = "テスト";
        const options = { communityLevel: 1 };

        // Act
        await service.query(query, options);

        // Assert
        expect(mockCommunitySummarizer.searchSummaries).toHaveBeenCalledWith(
          query,
          expect.objectContaining({ level: 1 }),
        );
      });

      it("confidence閾値によるフィルタリングが機能する", async () => {
        // Arrange
        const query = "テスト";
        mockCommunitySummarizer.searchSummaries.mockResolvedValue({
          success: true,
          data: [
            { communityId: "comm-1", confidence: 0.8 },
            { communityId: "comm-2", confidence: 0.3 },
          ],
        });
        const options = { confidenceThreshold: 0.5 };

        // Act
        const result = await service.query(query, options);

        // Assert
        expect(result.data.communitySummaries).toHaveLength(1);
      });

      it("limit指定で検索結果数が制限される", async () => {
        // Arrange
        const query = "テスト";
        const options = { limit: 3 };

        // Act
        await service.query(query, options);

        // Assert
        expect(mockCommunitySummarizer.searchSummaries).toHaveBeenCalledWith(
          query,
          expect.objectContaining({ limit: 3 }),
        );
      });
    });

    describe("異常系", () => {
      it("クエリが空の場合、バリデーションエラーを返す", async () => {
        // Arrange
        const query = "";

        // Act
        const result = await service.query(query);

        // Assert
        expect(result.success).toBe(false);
        expect(result.error.code).toBe("INVALID_QUERY");
      });

      it("コミュニティ検索エラー時、フォールバックで処理継続", async () => {
        // Arrange
        const query = "テスト";
        mockCommunitySummarizer.searchSummaries.mockResolvedValue({
          success: false,
          error: new Error("Search failed"),
        });

        // Act
        const result = await service.query(query);

        // Assert
        expect(result.success).toBe(true); // フォールバックで成功
        expect(result.data.communitySummaries).toHaveLength(0);
      });

      it("LLM生成エラー時、エラーを返す", async () => {
        // Arrange
        const query = "テスト";
        mockLLMProvider.chat.mockResolvedValue({
          success: false,
          error: new Error("LLM failed"),
        });

        // Act
        const result = await service.query(query);

        // Assert
        expect(result.success).toBe(false);
        expect(result.error.code).toBe("LLM_GENERATION_FAILED");
      });
    });
  });
});
```

2. ResponseBuilder テストファイルを作成する

```typescript
// packages/shared/src/services/search/__tests__/response-builder.test.ts

describe("ResponseBuilder", () => {
  describe("buildPrompt", () => {
    it("コミュニティ要約がプロンプトに含まれる", () => {
      // テスト実装
    });

    it("コミュニティ要約が空の場合、要約セクションが省略される", () => {
      // テスト実装
    });

    it("トークン数制限を超える場合、要約が切り詰められる", () => {
      // テスト実装
    });
  });
});
```

**期待される成果物**:

- `graphrag-query-service.test.ts`
- `response-builder.test.ts`

---

### タスク3: 統合テストの作成

**目的**: エンドツーエンドの統合テストを作成する

**実行手順**:

1. 統合テストファイルを作成する

```typescript
// packages/shared/src/services/search/__tests__/graphrag-query-service.integration.test.ts

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { GraphRAGQueryService } from "../graphrag-query-service";
import { CommunitySummarizer } from "../../graph/community-summarizer";
// 必要なモジュールのインポート

describe("GraphRAGQueryService Integration", () => {
  let service: GraphRAGQueryService;

  beforeAll(async () => {
    // 統合テスト用のセットアップ
    // 実際のCommunitySummarizer（モックLLM/Embedding）を使用
  });

  afterAll(async () => {
    // クリーンアップ
  });

  describe("E2E: クエリ→コミュニティ検索→回答生成", () => {
    it("正常系: コミュニティ要約を含む回答が生成される", async () => {
      // Arrange
      const query = "システム設計のベストプラクティスについて";

      // Act
      const result = await service.query(query);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.answer).toBeDefined();
      expect(result.data.metadata.queryType).toBeDefined();
    });

    it("正常系: フォールバック動作が正常に機能する", async () => {
      // Arrange: コミュニティが存在しないクエリ
      const query = "完全にランダムな存在しないトピック12345";

      // Act
      const result = await service.query(query);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.communitySummaries).toHaveLength(0);
    });
  });

  describe("パフォーマンス", () => {
    it("検索レイテンシが100ms以内である", async () => {
      // Arrange
      const query = "テストクエリ";
      const startTime = performance.now();

      // Act
      await service.query(query, { limit: 10 });

      // Assert
      const elapsed = performance.now() - startTime;
      expect(elapsed).toBeLessThan(100);
    });
  });
});
```

2. 統合テストシナリオを網羅する

| シナリオカテゴリ   | テストケース                           |
| ------------------ | -------------------------------------- |
| API接続テスト      | ICommunitySummarizer接続確認           |
| データフローテスト | クエリ→埋め込み→検索→回答の往復        |
| エラーハンドリング | コミュニティ検索失敗時のフォールバック |
| 状態同期テスト     | 複数クエリの並行処理                   |

**期待される成果物**:

- `graphrag-query-service.integration.test.ts`

---

### タスク4: テストケースの網羅性確認

**目的**: 受け入れ基準が全てテストケースでカバーされていることを確認する

**実行手順**:

1. 受け入れ基準とテストケースのマッピングを作成する

| 受け入れ基準 | テストケース                         | ファイル                       |
| ------------ | ------------------------------------ | ------------------------------ |
| AC01         | 関連コミュニティが存在する場合       | graphrag-query-service.test.ts |
| AC02         | 関連コミュニティがない場合           | graphrag-query-service.test.ts |
| AC03         | 階層レベル指定検索                   | graphrag-query-service.test.ts |
| AC04         | 複数コミュニティマッチ時のランキング | graphrag-query-service.test.ts |
| AC05         | confidence閾値フィルタリング         | graphrag-query-service.test.ts |
| AC06         | limit指定による結果数制限            | graphrag-query-service.test.ts |

2. 未カバーの受け入れ基準がないことを確認する

**期待される成果物**:

- 受け入れ基準↔テストケースマッピング表

---

### タスク5: テスト実行とRed状態確認

**目的**: 全てのテストが失敗状態（Red）であることを確認する

**実行手順**:

1. テストを実行する

```bash
# テスト実行
pnpm --filter @repo/shared test -- --run --reporter=verbose src/services/search/__tests__/graphrag-query-service.test.ts
```

2. 全テストがRed状態であることを確認する

```
Expected: All tests FAIL (Red state)
Reason: Implementation does not exist yet
```

3. テスト結果を記録する

**期待される成果物**:

- テスト実行結果（全て失敗）
- Red状態の確認記録

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> テスト設計時に以下のシステム仕様を参照してください。

| 参照資料             | パス                                                                                          | 内容                   |
| -------------------- | --------------------------------------------------------------------------------------------- | ---------------------- |
| コミュニティ要約仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-summarization.md` | searchSummaries() 仕様 |
| 検索型定義           | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`                  | SearchResult型         |

---

## 成果物

| 成果物                | パス                                                                                       | 内容                 |
| --------------------- | ------------------------------------------------------------------------------------------ | -------------------- |
| ユニットテスト        | `packages/shared/src/services/search/__tests__/graphrag-query-service.test.ts`             | メインサービステスト |
| 統合テスト            | `packages/shared/src/services/search/__tests__/graphrag-query-service.integration.test.ts` | E2Eテスト            |
| ResponseBuilderテスト | `packages/shared/src/services/search/__tests__/response-builder.test.ts`                   | 回答生成テスト       |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 4での統合テスト連携アクション**:

統合テストシナリオを全カテゴリで作成すること。

具体的には以下のカテゴリをカバーする:

- API接続テスト: ICommunitySummarizer接続確認
- データフローテスト: クエリ→埋め込み→検索→回答の往復
- エラーハンドリング: コミュニティ検索失敗時のフォールバック
- 状態同期テスト: 複数クエリの並行処理

---

## 完了条件

- [ ] テストファイル構造が設計されている
- [ ] GraphRAGQueryService ユニットテストが作成されている
- [ ] ResponseBuilder ユニットテストが作成されている
- [ ] 統合テストが作成されている
- [ ] 受け入れ基準（AC01〜AC06）が全てテストでカバーされている
- [ ] 全てのテストがRed状態（失敗）である
- [ ] テストカバレッジ目標が設定されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test -- --run src/services/search/__tests__/graphrag-query-service.test.ts
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が完了していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/graphrag-query-integration/phase-5-implementation.md`
