# Phase 4: テスト作成（TDD）

## メタ情報

| 項目     | 値                                                   |
| -------- | ---------------------------------------------------- |
| Phase    | 4                                                    |
| タスクID | TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001      |
| 前Phase  | [phase-3-design-review.md](phase-3-design-review.md) |
| 次Phase  | phase-5-implementation.md                            |

## 目的

Phase 3 でレビュー PASS した設計に基づき、実装前に統合テストを RED 状態で作成する（TDD）。

## 実行タスク

1. PI-01〜PI-08 を観測可能な Red テストへ変換する。
2. `EmbeddingService.generateChunkEmbeddings()` と `embedBatch()` の排他性をテストで固定する。
3. 既存フロー回帰と正本契約差分の検知点を揃える。

## テスト対象ファイル

```
packages/shared/src/services/embedding/pipeline/__tests__/embedding-pipeline.integration.test.ts
```

> 注意: `__tests__` ディレクトリは新規作成が必要。

## テストケース詳細（PI-01〜PI-08）

### PI-01: `EmbeddingService.generateChunkEmbeddings()` が呼ばれる（`lateChunking.enabled=true`）

| 項目         | 内容                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------- |
| 分類         | 正常系                                                                                             |
| 前提条件     | `EmbeddingService` の `generateChunkEmbeddings` をモック済み、`config.lateChunking.enabled = true` |
| 操作         | `pipeline.process(input, config)` を呼ぶ                                                           |
| 期待結果     | `mockEmbeddingService.generateChunkEmbeddings` が 1 回呼ばれている                                 |
| 検証方法     | `expect(mockEmbeddingService.generateChunkEmbeddings).toHaveBeenCalledOnce()`                      |
| 対応受入基準 | AC-3                                                                                               |

### PI-02: `EmbeddingService.embedBatch()` が呼ばれない（`lateChunking.enabled=true`）

| 項目         | 内容                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------- |
| 分類         | 正常系                                                                                        |
| 前提条件     | `EmbeddingPipeline` に `lateChunkingService` を注入済み、`config.lateChunking.enabled = true` |
| 操作         | `pipeline.process(input, config)` を呼ぶ                                                      |
| 期待結果     | `mockEmbeddingService.embedBatch` が一度も呼ばれない                                          |
| 検証方法     | `expect(mockEmbeddingService.embedBatch).not.toHaveBeenCalled()`                              |
| 対応受入基準 | AC-4                                                                                          |

### PI-03: 通常フロー（`lateChunking.enabled=false` または未設定）

| 項目         | 内容                                                                                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 分類         | 正常系                                                                                                                                                |
| 前提条件     | `config.lateChunking` が未設定、または `config.lateChunking.enabled = false`                                                                          |
| 操作         | `pipeline.process(input, config)` を呼ぶ                                                                                                              |
| 期待結果     | `mockEmbeddingService.embedBatch` が 1 回呼ばれ、`mockEmbeddingService.generateChunkEmbeddings` は呼ばれない                                          |
| 検証方法     | `expect(mockEmbeddingService.embedBatch).toHaveBeenCalledOnce()` および `expect(mockEmbeddingService.generateChunkEmbeddings).not.toHaveBeenCalled()` |
| 対応受入基準 | AC-5                                                                                                                                                  |

### PI-04: Late Chunking サービス未設定時の失敗伝播

| 項目                 | 内容                                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| 分類                 | 異常系                                                                                             |
| 前提条件             | `EmbeddingService` に lateChunkingService が設定されていない、`config.lateChunking.enabled = true` |
| 操作                 | `pipeline.process(input, config)` を呼ぶ                                                           |
| 期待結果             | `PipelineError` が throw される                                                                    |
| 検証方法             | `await expect(pipeline.process(input, config)).rejects.toThrow(PipelineError)`                     |
| エラーメッセージ検証 | Late Chunking 設定不備を診断可能な文言を含むこと                                                   |
| 対応受入基準         | AC-6                                                                                               |

### PI-05: `poolingStrategy` の引き渡し確認

| 項目         | 内容                                                                                                                                                                    |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 分類         | 正常系                                                                                                                                                                  |
| 前提条件     | `config.lateChunking = { enabled: true, poolingStrategy: "cls" }`                                                                                                       |
| 操作         | `pipeline.process(input, config)` を呼ぶ                                                                                                                                |
| 期待結果     | `generateChunkEmbeddings` の第 3 引数（`config`）に `poolingStrategy: "cls"` と `maxTokenLength` が含まれる                                                             |
| 検証方法     | `expect(mockEmbeddingService.generateChunkEmbeddings).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.objectContaining({ poolingStrategy: "cls" }))` |
| 対応受入基準 | AC-3                                                                                                                                                                    |

### PI-06: `stageTimings.lateChunking` が数値

| 項目         | 内容                                                                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 分類         | 正常系                                                                                                                                       |
| 前提条件     | `config.lateChunking.enabled = true`、`lateChunkingService` 注入済み                                                                         |
| 操作         | `pipeline.process(input, config)` を呼び、戻り値の `stageTimings` を参照する                                                                 |
| 期待結果     | `result.stageTimings.lateChunking` が `number` 型の値（0 以上）である                                                                        |
| 検証方法     | `expect(typeof result.stageTimings.lateChunking).toBe("number")` および `expect(result.stageTimings.lateChunking).toBeGreaterThanOrEqual(0)` |
| 対応受入基準 | AC-7                                                                                                                                         |

### PI-07: `PipelineOutput.embeddings` が `EmbeddingResult[]` 形式

| 項目         | 内容                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| 分類         | 正常系                                                                                                                   |
| 前提条件     | `config.lateChunking.enabled = true`、`lateChunkingService` が `ChunkEmbeddingResult[]` を返すモック                     |
| 操作         | `pipeline.process(input, config)` を呼び、戻り値の `embeddings` を参照する                                               |
| 期待結果     | `result.embeddings` が `EmbeddingResult[]` の形式（`embedding: number[]` フィールドを持つ）で返る                        |
| 検証方法     | `expect(result.embeddings).toEqual(expect.arrayContaining([expect.objectContaining({ embedding: expect.any(Array) })]))` |
| 対応受入基準 | AC-8                                                                                                                     |

### PI-08: `PipelineError`（無効な `poolingStrategy`）

| 項目                 | 内容                                                                           |
| -------------------- | ------------------------------------------------------------------------------ |
| 分類                 | 異常系                                                                         |
| 前提条件             | `config.lateChunking = { enabled: true, poolingStrategy: "invalid" as any }`   |
| 操作                 | `pipeline.process(input, config)` を呼ぶ                                       |
| 期待結果             | `PipelineError` が throw される                                                |
| 検証方法             | `await expect(pipeline.process(input, config)).rejects.toThrow(PipelineError)` |
| エラーメッセージ検証 | `toThrow("Invalid poolingStrategy: invalid")`                                  |
| 対応受入基準         | AC-6                                                                           |

## テストファイル構成

```typescript
// packages/shared/src/services/embedding/pipeline/__tests__/embedding-pipeline.integration.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmbeddingPipeline } from "../embedding-pipeline";
import { PipelineError } from "../errors";
import type { PipelineConfig, PipelineInput } from "../types";
// ... モック定義

describe("EmbeddingPipeline - Late Chunking Integration", () => {
  // PI-01: generateChunkEmbeddings が呼ばれる
  it("PI-01: calls generateChunkEmbeddings when lateChunking.enabled is true", ...);

  // PI-02: embedBatch が呼ばれない
  it("PI-02: does not call embedBatch when lateChunking.enabled is true", ...);

  // PI-03: 通常フロー維持
  it("PI-03: follows normal flow when lateChunking is disabled", ...);

  // PI-04: Late Chunking サービス未設定時の失敗伝播
  it("PI-04: surfaces a diagnosable error when late chunking service is unavailable", ...);

  // PI-05: poolingStrategy 引き渡し
  it("PI-05: passes poolingStrategy to generateChunkEmbeddings", ...);

  // PI-06: stageTimings.lateChunking が数値
  it("PI-06: records lateChunking stage timing as a number", ...);

  // PI-07: embeddings が EmbeddingResult[] 形式
  it("PI-07: returns embeddings in EmbeddingResult[] format", ...);

  // PI-08: 無効な poolingStrategy エラー
  it("PI-08: throws PipelineError for invalid poolingStrategy", ...);
});
```

## 依存関係整合チェック

```bash
pnpm install --frozen-lockfile
pnpm --filter @repo/shared build
pnpm --filter @repo/shared test -- embedding-pipeline.integration
```

## テスト実行コマンド

```bash
# 統合テストのみ実行
pnpm --filter @repo/shared test -- embedding-pipeline.integration

# ウォッチモード
pnpm --filter @repo/shared test --watch -- embedding-pipeline.integration

# カバレッジ付き
pnpm --filter @repo/shared test --coverage -- embedding-pipeline.integration
```

## 成功基準（TDD 初期状態）

| 基準                 | 内容                                                                |
| -------------------- | ------------------------------------------------------------------- |
| RED 状態             | PI-01〜PI-08 が**すべて失敗**することを確認する                     |
| 失敗理由             | 実装が存在しないため（型定義未修正・分岐未実装）                    |
| コンパイルエラー許容 | `PipelineConfig.lateChunking` 未定義による型エラーは Phase 5 で解消 |
| テスト件数           | 8 件（PI-01〜PI-08）                                                |

## 成果物

| 成果物             | パス                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| 統合テストファイル | `packages/shared/src/services/embedding/pipeline/__tests__/embedding-pipeline.integration.test.ts` |

## 参照資料

- `docs/30-workflows/TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001/phase-2-design.md`
- `docs/30-workflows/TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001/phase-3-design-review.md`
- `packages/shared/src/services/embedding/embedding-service.ts`

## 統合テスト連携

- Phase 5 は本 Phase の PI-01〜PI-08 をすべて RED→GREEN に反転する。
- Phase 9 では PI-01〜PI-08 の全 PASS を品質ゲートに使う。

## 完了条件

- [ ] テストファイルが新規作成されている
- [ ] PI-01〜PI-08 がすべて定義されている
- [ ] 依存関係整合チェックコマンドが含まれている
- [ ] テスト実行コマンドが記載されている
- [ ] TDD 初期状態（RED）であることが確認されている
