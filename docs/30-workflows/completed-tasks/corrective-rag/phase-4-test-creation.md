# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値             |
| ------ | -------------- |
| Phase  | 4              |
| 機能名 | corrective-rag |
| 作成日 | 2026-01-16     |

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。TDD原則に従い、失敗するテストを先に書く。

## 実行タスク

- TDD原則適用: テストファースト開発の実践
- ユニットテスト作成: RelevanceEvaluator・CorrectiveRAGのテスト作成
- 統合テスト設計: LLM連携・Web検索連携のテストシナリオ作成
- 境界値分析: エッジケースのテスト追加

## 参照資料

| 資料名       | パス                                         | 説明          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 設計書       | `outputs/phase-2/architecture-design.md`     | Phase 2成果物 |
| レビュー結果 | `outputs/phase-3/design-review-result.md`    | Phase 3成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料 | パス                                                                        | 内容                      |
| -------- | --------------------------------------------------------------------------- | ------------------------- |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | TDD実践ガイド・カバレッジ |

## 実行手順

### 1. テストシナリオ設計

受け入れ基準からテストシナリオを導出する:

#### RelevanceEvaluatorテストシナリオ

| テストID | シナリオ                          | 期待結果                      |
| -------- | --------------------------------- | ----------------------------- |
| RE-001   | 高関連性結果（スコア0.8+）を評価  | action: "correct"             |
| RE-002   | 低関連性結果（スコア0.2-）を評価  | action: "incorrect"           |
| RE-003   | 混在した関連性結果を評価          | action: "ambiguous"           |
| RE-004   | 空の結果配列を評価                | action: "incorrect", score: 0 |
| RE-005   | LLM API失敗時のエラーハンドリング | Result.err()を返す            |
| RE-006   | 個別スコアの計算                  | 各結果に0-1のスコアと理由     |
| RE-007   | 全体スコアの加重平均計算          | 上位結果に重み付け            |
| RE-008   | カスタム閾値での評価              | 設定した閾値で判定            |

#### CorrectiveRAGテストシナリオ

| テストID | シナリオ                         | 期待結果                            |
| -------- | -------------------------------- | ----------------------------------- |
| CR-001   | correct判定時の処理              | 結果をそのまま返す                  |
| CR-002   | incorrect判定時（Web検索有効）   | Web検索結果をaugmentedContextに設定 |
| CR-003   | incorrect判定時（Web検索無効）   | 空の結果を返す                      |
| CR-004   | ambiguous判定時のフィルタリング  | 低スコア結果を除外                  |
| CR-005   | ambiguous判定時のWeb検索補強     | 結果数不足時にWeb検索               |
| CR-006   | Knowledge Refinement有効時       | 不要情報を除去                      |
| CR-007   | 評価エラー時のエラーハンドリング | Result.err()を返す                  |

### 2. ユニットテスト作成

```typescript
// packages/shared/src/services/search/crag/__tests__/relevance-evaluator.test.ts

describe("RelevanceEvaluator", () => {
  describe("evaluate", () => {
    it("高関連性の結果を'correct'と評価する (RE-001)", async () => {
      // Arrange
      const mockLLM = createMockLLMClient({
        evaluations: [
          { score: 9, reason: "Highly relevant" },
          { score: 8, reason: "Very relevant" },
        ],
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const results = createMockFusedResults(2);

      // Act
      const evaluation = await evaluator.evaluate("test query", results);

      // Assert
      expect(evaluation.isOk()).toBe(true);
      expect(evaluation.value.action).toBe("correct");
      expect(evaluation.value.overallScore).toBeGreaterThan(0.7);
    });

    it("低関連性の結果を'incorrect'と評価する (RE-002)", async () => {
      // テスト実装
    });

    it("混在した関連性を'ambiguous'と評価する (RE-003)", async () => {
      // テスト実装
    });

    it("空の結果を'incorrect'と評価する (RE-004)", async () => {
      // テスト実装
    });

    it("LLM API失敗時にResult.err()を返す (RE-005)", async () => {
      // テスト実装
    });
  });
});
```

```typescript
// packages/shared/src/services/search/crag/__tests__/corrective-rag.test.ts

describe("CorrectiveRAG", () => {
  describe("process", () => {
    it("'correct'評価時に結果をそのまま返す (CR-001)", async () => {
      // テスト実装
    });

    it("'incorrect'評価時にWeb検索で補強する (CR-002)", async () => {
      // テスト実装
    });

    it("'ambiguous'評価時に低スコア結果をフィルタする (CR-004)", async () => {
      // テスト実装
    });
  });
});
```

### 3. 統合テスト作成

```typescript
// packages/shared/src/services/search/crag/__tests__/crag.integration.test.ts

describe("CRAG Integration", () => {
  describe("LLM連携", () => {
    it("LLMを呼び出して評価プロンプトを送信する", async () => {
      // 統合テスト実装
    });
  });

  describe("Web検索連携", () => {
    it("incorrect判定時にWeb検索を実行する", async () => {
      // 統合テスト実装
    });
  });
});
```

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ   | 検証内容                                  | テストファイル             |
| ------------------ | ----------------------------------------- | -------------------------- |
| LLM API接続テスト  | ILLMClient.complete()呼び出し・レスポンス | `crag.integration.test.ts` |
| データフローテスト | FusedSearchResult[]→CRAGResult            | `crag.flow.test.ts`        |
| エラーハンドリング | LLM API障害時のResult.err()返却           | `crag.error.test.ts`       |
| Web検索連携テスト  | IWebSearcher.search()呼び出し             | `crag.web-search.test.ts`  |

## 成果物

| 成果物             | パス                                                           | 説明           |
| ------------------ | -------------------------------------------------------------- | -------------- |
| テスト仕様書       | `outputs/phase-4/test-specification.md`                        | テスト設計     |
| テストケース       | `outputs/phase-4/test-cases.md`                                | ケース一覧     |
| 統合テストシナリオ | `outputs/phase-4/integration-test-design.md`                   | 統合テスト設計 |
| テストファイル     | `packages/shared/src/services/search/crag/__tests__/*.test.ts` | テストコード   |

## 完了条件

- [ ] 受け入れ基準ごとにユニットテストがある
- [ ] RelevanceEvaluatorのテスト（RE-001〜RE-008）が作成されている
- [ ] CorrectiveRAGのテスト（CR-001〜CR-007）が作成されている
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている
- [ ] 境界値テストが含まれている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. テストシナリオ設計
3. RelevanceEvaluatorユニットテスト作成
4. CorrectiveRAGユニットテスト作成
5. 統合テスト設計・作成
6. 境界値テスト追加
7. テストがRed状態であることを確認
8. 成果物の作成・配置
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/corrective-rag --phase 4
```

## 次のPhase

Phase 5: 実装（TDD: Green）
