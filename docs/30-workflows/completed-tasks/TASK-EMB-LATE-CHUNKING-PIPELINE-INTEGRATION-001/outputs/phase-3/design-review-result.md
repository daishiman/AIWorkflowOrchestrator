# Phase 3 成果物: 設計レビュー結果

## Gate 判定: PASS（MINOR）

### 観点 1: `PipelineConfig.lateChunking` がオプショナルで型エラーが生じないこと → PASS

- オプショナル（`?`）定義により既存利用箇所は影響なし
- `poolingStrategy` 型が `"mean" | "max" | "cls"` に正本と整合

### 観点 2: `StageTimings.lateChunking` がオプショナルで既存メトリクスが壊れないこと → PASS

- `lateChunking?: number` により通常フローでは undefined のまま
- 既存 4 フィールドは非オプショナルのまま維持

### 観点 3: Late Chunking 有効時に `embedBatch()` が呼ばれないことの保証 → PASS

- `if/else` 排他分岐により保証
- PI-02 で `not.toHaveBeenCalled()` により検証

### 観点 4: Late Chunking サービス未設定時のエラーハンドリング確認 → PASS

- `EmbeddingService.generateChunkEmbeddings()` が `EmbeddingError` を throw
- Pipeline の catch ブロックが `EmbeddingStageError`（PipelineError 派生）として再スロー
- PI-04 で `toThrow(PipelineError)` により検証

## 差し戻し条件チェック

1. `PipelineConfig.lateChunking` がオプショナルでない → 問題なし（オプショナル設計）
2. `StageTimings` の既存 4 フィールドがオプショナルに変更される → 問題なし（既存非変更）
3. `enabled=true` 時に `embedBatch()` を呼ぶコードパスが残る → 問題なし（排他 if/else）
4. Late Chunking サービス未設定時の失敗が診断不能 → 問題なし（EmbeddingStageError で再スロー）
5. PI-01〜PI-08 のいずれかが AC-1〜AC-8 と対応していない → 問題なし（全対応確認済み）

## Phase 4 着手可

設計は全観点 PASS。Phase 4 でテスト（RED）の作成に進む。
