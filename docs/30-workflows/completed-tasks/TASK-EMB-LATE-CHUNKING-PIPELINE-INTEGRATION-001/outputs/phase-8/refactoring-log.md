# Phase 8 成果物: リファクタリングログ

## ST-8-01: `runLateChunkingStage()` 抽出

**判断: 実施**

Stage 2.5 の処理（ChunkBoundary 生成 → `generateChunkEmbeddings()` 呼び出し → `convertLateChunkingToEmbeddingResults()` → タイミング記録）を `private async runLateChunkingStage()` に抽出。`process()` が `await this.runLateChunkingStage(...)` の 1 行になり、制御フローの見通しが明確に改善した。

**Before**: `process()` 内に 35 行のインライン実装  
**After**: `process()` 内が 5 行の委譲呼び出し + 独立したメソッド 43 行

## ST-8-02: `convertLateChunkingToEmbeddingResults()` 責務配置

**判断: 現状維持（EmbeddingPipeline に残す）**

`EmbeddingResult` の知識は Pipeline 層が持つのが自然。`LateChunkingService` に移動すると `packages/shared` 内の依存関係が逆転する。他箇所からの再利用も現時点では不要（YAGNI）。

## ST-8-03: テスト重複モックセットアップの `beforeEach` 集約

**判断: 実施済み（Phase 4 で初期設計から `beforeEach` 採用）**

PI-LC-01〜PI-LC-03 は `afterEach(() => vi.clearAllMocks())` で独立性を保証。

## ST-8-04: 不要な型アサーション・`any` の除去

**確認**: `as unknown as ChunkingService` / `as unknown as EmbeddingService` はテストのみで使用。実装コードに `any` / `as unknown as` なし。テストのモック注入は型安全のトレードオフとして許容。

## 最終確認結果

| チェック項目            | 結果              |
| ----------------------- | ----------------- |
| 全テスト PASS           | ✓ 13 tests passed |
| TypeScript 型エラーなし | ✓                 |
| 機能変更なし            | ✓                 |
