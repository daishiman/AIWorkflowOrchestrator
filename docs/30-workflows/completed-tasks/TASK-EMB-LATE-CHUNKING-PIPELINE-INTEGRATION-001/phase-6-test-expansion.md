# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| Phase      | 6                                                     |
| タスクID   | TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001       |
| タスク名   | Late Chunking EmbeddingPipeline・設定導線への正式統合 |
| 前提Phase  | Phase 5                                               |
| 後続Phase  | Phase 7                                               |
| 作成日     | 2026-04-20                                            |
| ステータス | 未実施                                                |

## 目的

Issue #2315 Phase 6 の内容として、既存テスト PI-01〜PI-08 が全件 PASS していることを確認したうえで、Late Chunking 統合に関連する追加テストケースを `embedding-pipeline.integration.test.ts` に追加する。

## 背景

Phase 5 で実装した Late Chunking 分岐・バリデーションロジックは既存テストだけでは網羅できない条件を持つ。本フェーズで追加テストを実装し、実装品質を担保する。

---

## 実行タスク

### タスク1: PI-01〜PI-08 の全件 PASS 確認

**目的**: Phase 5 の実装によって既存テストが壊れていないことを確認する

**実行手順**:

1. 以下のコマンドを実行する

```bash
pnpm --filter @repo/shared test -- embedding-pipeline
```

2. PI-01〜PI-08 が全件 PASS していることを確認する
3. FAIL がある場合は Phase 5 の実装に戻り修正する（本フェーズの追加テスト作業は開始しない）

**期待される成果物**:

- `outputs/phase-6/existing-tests-pass-result.md`（実行結果・PASS件数・実行時間を記載）

---

### タスク2: `processBatch()` での Late Chunking 適用確認テストを追加する

**目的**: `processBatch()` メソッドで Late Chunking 設定が各ドキュメントに正しく適用されることを確認する

**追加テストケース（1件）**:

```typescript
it("PI-LC-01: processBatch() で Late Chunking設定が各ドキュメントに適用される", async () => {
  // Arrange: Late Chunking 有効な PipelineConfig と LateChunkingService モックを用意する
  const config: PipelineConfig = {
    // 既存フィールド
    lateChunking: {
      enabled: true,
      poolingStrategy: "mean",
    },
  };
  const mockLateChunkingService = {
    applyLateChunking: vi.fn().mockResolvedValue({
      chunks: [
        { metadata: { lateChunking: { embedding: [0.1, 0.2, 0.3] } } },
      ],
    }),
  };
  const pipeline = new EmbeddingPipeline(config, /* ...deps */, mockLateChunkingService);
  const documents = [
    { id: "doc-1", content: "テストドキュメント1" },
    { id: "doc-2", content: "テストドキュメント2" },
  ];

  // Act
  const results = await pipeline.processBatch(documents);

  // Assert
  expect(mockLateChunkingService.applyLateChunking).toHaveBeenCalledTimes(
    documents.length,
  );
  expect(results).toHaveLength(documents.length);
  results.forEach((result) => {
    expect(result.embedding).toBeDefined();
  });
});
```

**配置先**: `packages/shared/src/services/embedding/pipeline/__tests__/embedding-pipeline.integration.test.ts`

---

### タスク3: `maxTokenLength` デフォルト値（512）の動作確認テストを追加する

**目的**: `lateChunking.maxTokenLength` を省略した場合にデフォルト値 512 で動作することを確認する

**追加テストケース**:

```typescript
it("PI-LC-02: lateChunking.maxSequenceLength 省略時はデフォルト値512で動作する", async () => {
  // Arrange: maxSequenceLength を指定しない設定
  const config: PipelineConfig = {
    // 既存フィールド
    lateChunking: {
      enabled: true,
      poolingStrategy: "mean",
      // maxSequenceLength は省略
    },
  };
  const mockLateChunkingService = {
    applyLateChunking: vi.fn().mockResolvedValue({
      chunks: [
        { metadata: { lateChunking: { embedding: [0.1, 0.2] } } },
      ],
    }),
  };
  const pipeline = new EmbeddingPipeline(config, /* ...deps */, mockLateChunkingService);

  // Act
  const result = await pipeline.process({ id: "doc-1", content: "テスト" });

  // Assert: maxTokenLength が指定されていなくてもエラーが発生しない
  expect(result).toBeDefined();
  // generateChunkEmbeddings() 側でデフォルト設定に委譲できることを確認
  expect(mockEmbeddingService.generateChunkEmbeddings).toHaveBeenCalledWith(
    expect.objectContaining({
      maxTokenLength: 512,
    }),
  );
});
```

**注意**: 実装では `maxTokenLength` 未指定時にパイプラインが値を補完せず、`generateChunkEmbeddings()` 側のデフォルト設定に委譲している。テストも current facts に合わせること。

---

### タスク4: `PipelineMetricsCollector.getStatistics()` の Late Chunking 有効時動作確認テストを追加する

**目的**: Late Chunking が有効な場合も `PipelineMetricsCollector.getStatistics()` が正常に動作することを確認する

**追加テストケース**:

```typescript
it("PI-LC-03: Late Chunking有効時も PipelineMetricsCollector.getStatistics() が正常に動作する", async () => {
  // Arrange
  const config: PipelineConfig = {
    // 既存フィールド
    lateChunking: {
      enabled: true,
      poolingStrategy: "mean",
    },
  };
  const mockLateChunkingService = {
    applyLateChunking: vi.fn().mockResolvedValue({
      chunks: [
        { metadata: { lateChunking: { embedding: [0.1, 0.2] } } },
      ],
    }),
  };
  const metricsCollector = new PipelineMetricsCollector();
  const pipeline = new EmbeddingPipeline(
    config,
    /* ...deps */,
    mockLateChunkingService,
  );

  // Act
  await pipeline.process({ id: "doc-1", content: "テスト" });
  const stats = metricsCollector.getStatistics();

  // Assert
  expect(stats).toBeDefined();
  expect(stats.stageTimings).toBeDefined();
  // lateChunking ステージのタイミングが記録されている
  expect(stats.stageTimings.lateChunking).toBeGreaterThanOrEqual(0);
});
```

---

### タスク5: 全テストの PASS 確認

**目的**: 追加テストを含む全テストが PASS していることを確認する

**実行手順**:

1. 以下のコマンドを実行する

```bash
pnpm --filter @repo/shared test -- embedding-pipeline
```

2. PI-01〜PI-08 および PI-LC-01〜PI-LC-03 が全件 PASS していることを確認する
3. FAIL がある場合は実装またはテストコードを修正する

**成功基準**: 全テストが GREEN になること

**期待される成果物**:

- `outputs/phase-6/expanded-test-result.md`（全 PASS の確認記録。テストID・実行時間を記載）

---

## 参照資料

| 参照資料             | パス                                                                                               | 内容                              |
| -------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------- |
| 統合テストファイル   | `packages/shared/src/services/embedding/pipeline/__tests__/embedding-pipeline.integration.test.ts` | 追加対象ファイル                  |
| パイプライン実装     | `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts`                            | Phase 5 修正済み                  |
| 型定義               | `packages/shared/src/services/embedding/pipeline/types.ts`                                         | `PipelineConfig` / `StageTimings` |
| Phase 5 実装サマリー | `outputs/phase-5/implementation-summary.md`                                                        | 実装差分の参照                    |

---

## 成果物

| 成果物                   | パス                                                                                               | 内容                        |
| ------------------------ | -------------------------------------------------------------------------------------------------- | --------------------------- |
| 既存テスト PASS 確認記録 | `outputs/phase-6/existing-tests-pass-result.md`                                                    | PI-01〜PI-08 PASS 確認      |
| 拡張済みテストファイル   | `packages/shared/src/services/embedding/pipeline/__tests__/embedding-pipeline.integration.test.ts` | PI-LC-01〜PI-LC-03 追加済み |
| テスト結果記録           | `outputs/phase-6/expanded-test-result.md`                                                          | 全テスト PASS 確認記録      |

---

## 多角的チェック観点

| 観点                  | チェック内容                                                             |
| --------------------- | ------------------------------------------------------------------------ |
| 既存テストへの影響    | PI-01〜PI-08 が Phase 5 実装後も変わらず PASS しているか                 |
| モックの適切性        | `LateChunkingService` モックが実際のインターフェースと整合しているか     |
| デフォルト値の検証    | `maxSequenceLength=512` のデフォルト適用がアサーションで確認されているか |
| メトリクスの整合性    | `stageTimings.lateChunking` が Late Chunking 無効時も安全に参照できるか  |
| テスト独立性          | 各テストが他のテストに依存せず独立して実行できるか                       |
| `processBatch` 網羅性 | 複数ドキュメントへの適用が `processBatch()` レベルで確認されているか     |

---

## サブタスク管理

| サブタスクID | 内容                                              | ステータス |
| ------------ | ------------------------------------------------- | ---------- |
| ST-6-01      | PI-01〜PI-08 全件 PASS 確認                       | 未実施     |
| ST-6-02      | PI-LC-01（processBatch Late Chunking 適用）追加   | 未実施     |
| ST-6-03      | PI-LC-02（maxSequenceLength デフォルト値）追加    | 未実施     |
| ST-6-04      | PI-LC-03（PipelineMetricsCollector 正常動作）追加 | 未実施     |
| ST-6-05      | 全テスト（PI-01〜PI-LC-03）PASS 確認              | 未実施     |

---

## 完了条件

- [ ] PI-01〜PI-08 が全件 PASS している
- [ ] PI-LC-01（`processBatch()` で Late Chunking が各ドキュメントに適用される）が追加・PASS している
- [ ] PI-LC-02（`maxSequenceLength` デフォルト値 512 で動作する）が追加・PASS している
- [ ] PI-LC-03（`PipelineMetricsCollector.getStatistics()` が Late Chunking 有効時も正常動作する）が追加・PASS している
- [ ] `outputs/phase-6/existing-tests-pass-result.md` が生成されている
- [ ] `outputs/phase-6/expanded-test-result.md` が生成されている
- [ ] `pnpm --filter @repo/shared test -- embedding-pipeline` で全テストが GREEN になっている

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次Phaseへの申し送り事項

- Phase 7 では `EmbeddingPipeline.process()` の Late Chunking 分岐（有効・無効）および `validateLateChunkingConfig()` の全条件分岐がカバーされているかをカバレッジ計測で確認する
- PI-LC-02 のデフォルト値 512 の適用位置（`process()` 内 or `validateLateChunkingConfig()` 内）を Phase 7 のカバレッジ確認対象に含めること
- PI-LC-03 で `stageTimings.lateChunking` が記録されることを確認したが、Phase 7 でブランチカバレッジが満たされているかを改めて計測すること
- Phase 7 のカバレッジ未達時は本 Phase（Phase 6）に差し戻しとなる

## 統合テスト連携

- PI-01〜PI-08 の Green 維持を前提に、PI-LC-01〜PI-LC-03 を追加する。
- Phase 7 では追加テストを含めた coverage を確認する。
