# Phase 1 成果物: 受け入れ基準

## メタ情報

| 項目     | 値                    |
| -------- | --------------------- |
| タスクID | CONV-07-06            |
| フェーズ | Phase 1: 要件定義     |
| 作成日   | 2026-01-16            |
| 対象機能 | Corrective RAG (CRAG) |

---

## 機能要件の受け入れ基準

### AC-FR-001: LLMベースの関連性評価

| 項目         | 内容                                                                  |
| ------------ | --------------------------------------------------------------------- |
| 要件ID       | FR-001                                                                |
| 受け入れ基準 | `RelevanceEvaluator.evaluate()`がLLMを呼び出して評価結果を返す        |
| 検証方法     | ユニットテスト                                                        |
| テストケース | - モックLLMを使用した評価呼び出しテスト<br>- 評価結果の構造検証テスト |

```typescript
// 検証コード例
describe("FR-001: LLMベースの関連性評価", () => {
  it("evaluate()がLLMを呼び出して評価結果を返す", async () => {
    const mockLLM = createMockLLMClient();
    const evaluator = new RelevanceEvaluator(mockLLM);
    const result = await evaluator.evaluate("test query", mockResults);

    expect(result.success).toBe(true);
    expect(mockLLM.complete).toHaveBeenCalled();
    expect(result.data).toHaveProperty("overallScore");
    expect(result.data).toHaveProperty("action");
    expect(result.data).toHaveProperty("individualScores");
  });
});
```

### AC-FR-002: 3段階アクション分類

| 項目         | 内容                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------- | ----------- | ---------------------- |
| 要件ID       | FR-002                                                                                                              |
| 受け入れ基準 | 評価結果に`action: "correct"                                                                                        | "incorrect" | "ambiguous"`が含まれる |
| 検証方法     | ユニットテスト                                                                                                      |
| テストケース | - correct判定テスト（スコア≥0.7）<br>- incorrect判定テスト（スコア≤0.3）<br>- ambiguous判定テスト（0.3<スコア<0.7） |

```typescript
// 検証コード例
describe("FR-002: 3段階アクション分類", () => {
  it("高スコア（≥0.7）でcorrectを返す", async () => {
    const mockLLM = createMockLLMWithScores([9, 8, 8]);
    const evaluator = new RelevanceEvaluator(mockLLM);
    const result = await evaluator.evaluate("query", mockResults);

    expect(result.data.action).toBe("correct");
    expect(result.data.overallScore).toBeGreaterThanOrEqual(0.7);
  });

  it("低スコア（≤0.3）でincorrectを返す", async () => {
    const mockLLM = createMockLLMWithScores([2, 1, 2]);
    const evaluator = new RelevanceEvaluator(mockLLM);
    const result = await evaluator.evaluate("query", mockResults);

    expect(result.data.action).toBe("incorrect");
    expect(result.data.overallScore).toBeLessThanOrEqual(0.3);
  });

  it("中間スコアでambiguousを返す", async () => {
    const mockLLM = createMockLLMWithScores([8, 3, 5]);
    const evaluator = new RelevanceEvaluator(mockLLM);
    const result = await evaluator.evaluate("query", mockResults);

    expect(result.data.action).toBe("ambiguous");
  });
});
```

### AC-FR-003: Correct処理

| 項目         | 内容                                                                         |
| ------------ | ---------------------------------------------------------------------------- |
| 要件ID       | FR-003                                                                       |
| 受け入れ基準 | `CorrectiveRAG.handleCorrect()`が入力結果をそのまま返す                      |
| 検証方法     | ユニットテスト                                                               |
| テストケース | - 結果件数が維持されることを確認<br>- 結果の内容が変更されていないことを確認 |

```typescript
// 検証コード例
describe("FR-003: Correct処理", () => {
  it("correct評価時に結果をそのまま返す", async () => {
    const mockEvaluator = createMockEvaluator({ action: "correct" });
    const crag = new CorrectiveRAG(mockEvaluator, null);
    const results = createMockFusedResults(3);

    const cragResult = await crag.process("query", results);

    expect(cragResult.data.results.length).toBe(3);
    expect(cragResult.data.evaluation.action).toBe("correct");
  });
});
```

### AC-FR-004: Incorrect処理（Web検索補強）

| 項目         | 内容                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| 要件ID       | FR-004                                                                   |
| 受け入れ基準 | `CorrectiveRAG.handleIncorrect()`がWeb検索結果を`augmentedContext`に設定 |
| 検証方法     | ユニットテスト                                                           |
| テストケース | - Web検索有効時の補強テスト<br>- Web検索無効時の空結果テスト             |

```typescript
// 検証コード例
describe("FR-004: Incorrect処理", () => {
  it("incorrect評価時にWeb検索で補強する", async () => {
    const mockEvaluator = createMockEvaluator({ action: "incorrect" });
    const mockWebSearcher = createMockWebSearcher();
    const crag = new CorrectiveRAG(mockEvaluator, mockWebSearcher, {
      enableWebSearch: true,
    });

    const cragResult = await crag.process("query", mockResults);

    expect(cragResult.data.results.length).toBe(0); // 元の結果は破棄
    expect(cragResult.data.augmentedContext).toBeDefined();
    expect(mockWebSearcher.search).toHaveBeenCalled();
  });
});
```

### AC-FR-005: Ambiguous処理（フィルタリング）

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| 要件ID       | FR-005                                                       |
| 受け入れ基準 | `CorrectiveRAG.handleAmbiguous()`が閾値以下の結果を除外する  |
| 検証方法     | ユニットテスト                                               |
| テストケース | - 低スコア結果のフィルタリングテスト<br>- 閾値設定変更テスト |

```typescript
// 検証コード例
describe("FR-005: Ambiguous処理", () => {
  it("ambiguous評価時に低スコア結果をフィルタする", async () => {
    const mockEvaluator = createMockEvaluatorWithScores({
      action: "ambiguous",
      scores: [
        { chunkId: "chunk-0", score: 0.8 },
        { chunkId: "chunk-1", score: 0.2 }, // 除外される
        { chunkId: "chunk-2", score: 0.6 },
      ],
    });
    const crag = new CorrectiveRAG(mockEvaluator, null, {
      ambiguousFilterThreshold: 0.4,
    });

    const cragResult = await crag.process("query", mockResults);

    expect(cragResult.data.results.length).toBe(2);
    expect(
      cragResult.data.results.find((r) => r.chunkId === "chunk-1"),
    ).toBeUndefined();
  });
});
```

### AC-FR-006: Knowledge Refinement

| 項目         | 内容                                                                 |
| ------------ | -------------------------------------------------------------------- |
| 要件ID       | FR-006                                                               |
| 受け入れ基準 | `enableRefinement: true`時にKnowledge Refinementが実行される         |
| 検証方法     | ユニットテスト                                                       |
| テストケース | - Refinement有効時の実行テスト<br>- Refinement無効時のスキップテスト |

### AC-FR-007: 個別スコア算出

| 項目         | 内容                                                          |
| ------------ | ------------------------------------------------------------- |
| 要件ID       | FR-007                                                        |
| 受け入れ基準 | `individualScores`配列に各結果のスコア（0-1）と理由が含まれる |
| 検証方法     | ユニットテスト                                                |
| テストケース | - スコアの範囲検証（0-1）<br>- reason文字列の存在検証         |

```typescript
// 検証コード例
describe("FR-007: 個別スコア算出", () => {
  it("individualScoresに各結果のスコアと理由が含まれる", async () => {
    const evaluator = new RelevanceEvaluator(mockLLM);
    const result = await evaluator.evaluate("query", mockResults);

    expect(result.data.individualScores).toHaveLength(mockResults.length);
    result.data.individualScores.forEach((score) => {
      expect(score.score).toBeGreaterThanOrEqual(0);
      expect(score.score).toBeLessThanOrEqual(1);
      expect(score.reason).toBeDefined();
      expect(typeof score.reason).toBe("string");
    });
  });
});
```

### AC-FR-008: 全体スコア計算（加重平均）

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| 要件ID       | FR-008                                                     |
| 受け入れ基準 | `overallScore`が上位結果に重み付けした加重平均で計算される |
| 検証方法     | ユニットテスト                                             |
| テストケース | - 加重平均計算の正確性テスト<br>- 空配列時の0返却テスト    |

```typescript
// 検証コード例
describe("FR-008: 全体スコア計算", () => {
  it("overallScoreが加重平均で計算される", async () => {
    // scores: [0.9, 0.8, 0.7]
    // weights: [1/1, 1/2, 1/3] = [1, 0.5, 0.333]
    // weighted: [0.9*1, 0.8*0.5, 0.7*0.333] = [0.9, 0.4, 0.233]
    // sum(weighted) / sum(weights) = 1.533 / 1.833 ≈ 0.836
    const mockLLM = createMockLLMWithScores([9, 8, 7]);
    const evaluator = new RelevanceEvaluator(mockLLM);
    const result = await evaluator.evaluate("query", mockResults);

    expect(result.data.overallScore).toBeCloseTo(0.836, 2);
  });
});
```

### AC-FR-009: 評価プロンプトカスタマイズ

| 項目         | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| 要件ID       | FR-009                                                    |
| 受け入れ基準 | EvaluatorOptionsでmaxEvaluate、閾値などをカスタマイズ可能 |
| 検証方法     | ユニットテスト                                            |
| テストケース | - maxEvaluate設定テスト<br>- 閾値変更テスト               |

---

## 非機能要件の受け入れ基準

### AC-NFR-001: タイムアウト制御

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| 要件ID       | NFR-001                                                  |
| 受け入れ基準 | 評価処理が10秒以内に完了するか、タイムアウトエラーを返す |
| 検証方法     | 統合テスト                                               |
| テストケース | - 正常完了時間テスト<br>- タイムアウト発生テスト         |

### AC-NFR-002: エラーハンドリング

| 項目         | 内容                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| 要件ID       | NFR-002                                                                 |
| 受け入れ基準 | LLM API失敗時に`Result.err()`でエラーを返す（例外をthrowしない）        |
| 検証方法     | ユニットテスト                                                          |
| テストケース | - LLM接続エラー時のResult.err返却テスト<br>- パースエラー時の処理テスト |

```typescript
// 検証コード例
describe("NFR-002: エラーハンドリング", () => {
  it("LLM API失敗時にResult.err()を返す", async () => {
    const mockLLM = createMockLLMWithError(new Error("Connection failed"));
    const evaluator = new RelevanceEvaluator(mockLLM);

    const result = await evaluator.evaluate("query", mockResults);

    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
  });

  it("例外をthrowしない", async () => {
    const mockLLM = createMockLLMWithError(new Error("Network error"));
    const evaluator = new RelevanceEvaluator(mockLLM);

    // 例外がthrowされないことを確認
    await expect(
      evaluator.evaluate("query", mockResults),
    ).resolves.toBeDefined();
  });
});
```

### AC-NFR-003: テストカバレッジ

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| 要件ID       | NFR-003                                                  |
| 受け入れ基準 | `pnpm test:coverage`でLine Coverage 80%以上を達成        |
| 検証方法     | CI/CDパイプライン                                        |
| 測定コマンド | `pnpm --filter @repo/shared test:coverage -- --coverage` |

### AC-NFR-004: 型安全性

| 項目         | 内容                                   |
| ------------ | -------------------------------------- |
| 要件ID       | NFR-004                                |
| 受け入れ基準 | `pnpm typecheck`でエラーなしを確認     |
| 検証方法     | CI/CDパイプライン                      |
| 測定コマンド | `pnpm --filter @repo/shared typecheck` |

### AC-NFR-005: Result型エラーハンドリング

| 項目         | 内容                                                   |
| ------------ | ------------------------------------------------------ |
| 要件ID       | NFR-005                                                |
| 受け入れ基準 | すべての公開メソッドがResult<T, Error>を返却する       |
| 検証方法     | コードレビュー + 型チェック                            |
| 検証対象     | RelevanceEvaluator.evaluate(), CorrectiveRAG.process() |

### AC-NFR-006: Web検索の依存性注入

| 項目         | 内容                                                               |
| ------------ | ------------------------------------------------------------------ |
| 要件ID       | NFR-006                                                            |
| 受け入れ基準 | IWebSearcherをコンストラクタで注入可能                             |
| 検証方法     | ユニットテスト                                                     |
| テストケース | - webSearcher: null時の動作テスト<br>- モックWebSearcher注入テスト |

---

## 統合テスト受け入れ基準

### IT-001: LLM連携統合テスト

| 項目           | 内容                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------- |
| 受け入れ基準   | 実際のLLM API（またはMSWモック）と連携して評価が完了する                                      |
| テストシナリオ | 1. クエリと検索結果を入力<br>2. LLM APIを呼び出し<br>3. 評価結果を取得<br>4. アクションを決定 |

### IT-002: パイプライン統合テスト

| 項目           | 内容                                                                                    |
| -------------- | --------------------------------------------------------------------------------------- |
| 受け入れ基準   | RRF Fusion出力 → CRAG → 補正結果のフローが正常に動作する                                |
| テストシナリオ | 1. FusedSearchResult[]を準備<br>2. CorrectiveRAG.process()を実行<br>3. CRAGResultを検証 |

### IT-003: エラー伝播統合テスト

| 項目           | 内容                                                                                                             |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| 受け入れ基準   | エラーが適切にResult.err()として上位に伝播する                                                                   |
| テストシナリオ | 1. LLM APIエラーを発生させる<br>2. Result.err()が返却されることを確認<br>3. エラー情報が保持されていることを確認 |

---

## 完了確認チェックリスト

- [x] 全機能要件（FR-001〜FR-009）に受け入れ基準が定義されている
- [x] 全非機能要件（NFR-001〜NFR-006）に受け入れ基準が定義されている
- [x] 各受け入れ基準に検証方法が明記されている
- [x] 統合テストシナリオが定義されている
- [x] 検証コード例が提供されている
