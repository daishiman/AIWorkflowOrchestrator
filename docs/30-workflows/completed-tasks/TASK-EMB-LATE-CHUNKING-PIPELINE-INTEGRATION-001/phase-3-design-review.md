# Phase 3: 設計レビューゲート

## メタ情報

| 項目     | 値                                                   |
| -------- | ---------------------------------------------------- |
| Phase    | 3                                                    |
| タスクID | TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001      |
| 前Phase  | [phase-2-design.md](phase-2-design.md)               |
| 次Phase  | [phase-4-test-creation.md](phase-4-test-creation.md) |

## 目的

Phase 2 の設計を 30思考法と 4条件でレビューし、実装着手前に型安全・排他フロー・エラーハンドリングの妥当性を確定する。

## 実行タスク

1. 型集合・設定名・API 呼び出し先が正本仕様と一致しているか確認する。
2. `EmbeddingPipeline` と `EmbeddingService` の責務境界が崩れていないか確認する。
3. 差し戻し条件を Phase 4 着手前に固定する。

## レビュー観点

### 観点 1: `PipelineConfig.lateChunking` がオプショナルで型エラーが生じないこと

| チェック項目                                                                              | 期待結果                                                                          |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `lateChunking` フィールドなしの既存 `PipelineConfig` 利用箇所がコンパイルエラーにならない | PASS: オプショナル（`?`）定義により影響なし                                       |
| `lateChunking.enabled` が `boolean` 型として強制されている                                | PASS: `enabled: boolean` は必須フィールドのため `lateChunking` を渡す際に省略不可 |
| `poolingStrategy` の型が `"mean" \| "max" \| "cls"` に限定される                          | PASS: 正本 `PoolingStrategy` と一致する                                           |
| `maxTokenLength` がオプショナルで型エラーがない                                           | PASS: `?` によりオプショナル                                                      |

### 観点 2: `StageTimings.lateChunking` がオプショナルで既存メトリクスが壊れないこと

| チェック項目                                                                             | 期待結果                                                |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 通常フローで `stageTimings.lateChunking` が `undefined` のまま `PipelineOutput` が返せる | PASS: `lateChunking?: number` によりオプショナル        |
| `PipelineMetricsCollector.recordPipelineRun()` の引数型が既存テストと互換                | PASS: `StageTimings` はオブジェクト型参照のため自動追随 |
| `stageTimings.preprocessing / chunking / embedding / deduplication` が引き続き必須       | PASS: 既存フィールドは非オプショナルのまま維持する      |

### 観点 3: Late Chunking 有効時に `EmbeddingService.embedBatch()` が呼ばれないことの保証

| チェック項目                                                                    | 期待結果                                                                                   |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `lateChunking.enabled=true` 分岐では Stage 3 コードブロックを完全にスキップする | PASS: `if/else` 排他分岐により保証可能                                                     |
| `embedBatch()` 非呼び出しをテストで検証できる                                   | PASS: PI-02 で `expect(mockEmbeddingService.embedBatch).not.toHaveBeenCalled()` により検証 |
| Late Chunking 分岐と通常分岐が共存するコードパスがない                          | 要確認: 実装時に `if (lateChunkingEnabled) { ... } else { embedBatch() }` の排他を徹底する |

### 観点 4: Late Chunking サービス未設定時のエラーハンドリング確認

| チェック項目                                                                                 | 期待結果                                                                                |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `lateChunkingService` が未設定の状態で `enabled=true` を渡した場合に失敗が診断可能に伝播する | PASS: Pipeline 文脈で原因が追跡できる                                                   |
| エラーメッセージが明示的で診断可能                                                           | PASS: `EmbeddingService.generateChunkEmbeddings()` 側の失敗が Pipeline 文脈で診断できる |
| `PipelineError` が `PipelineMetricsCollector` にも記録される                                 | 要確認: `catch` ブロックで `recordPipelineRun({ success: false })` が呼ばれることを確認 |
| バリデーションタイミングが Stage 2.5 直前（遅延バリデーション）で正しい                      | 要確認: `process()` 冒頭でのアーリーリターンかステージ直前かを実装で確定する            |

## 30思考法の適用

| 系統         | 主な思考法           | 本 task での使用目的                                                              |
| ------------ | -------------------- | --------------------------------------------------------------------------------- |
| 論理分析系   | 批判的思考、演繹思考 | 型変更の副作用（既存利用箇所への波及）を網羅的に抽出する                          |
| 構造分解系   | MECE、プロセス思考   | Stage 1〜4 の分岐フローを漏れなく設計する                                         |
| メタ・抽象系 | ダブル・ループ思考   | 「型を足す」ではなく「責務境界を引く」という設計目標を再確認する                  |
| 問題解決系   | why 思考、論点思考   | なぜ `embedBatch()` を呼ばない保証が必要かの根拠を明確化する                      |
| システム系   | 因果関係分析         | `EmbeddingServiceConfig.lateChunkingService` 未設定を設定ミスとして早期に診断する |

## Gate 判定基準

| 判定     | 条件                                                                                                           |
| -------- | -------------------------------------------------------------------------------------------------------------- |
| PASS     | 全 4 観点においてチェック項目がすべて PASS または「要確認」が実装ガイドラインとして文書化されている            |
| MINOR    | 文言・成果物名・参照リンクなど軽微な整合修正のみ残る                                                           |
| MAJOR    | `embedBatch()` 非呼び出し保証の排他フローが設計に明記されていない、またはバリデーションタイミングが未確定      |
| CRITICAL | `StageTimings` の既存フィールドが必須から外れ、`PipelineMetric` など他箇所の型整合が破壊される設計になっている |

## 差し戻し条件

以下のいずれかに該当する場合は Phase 2 へ差し戻す：

1. `PipelineConfig.lateChunking` がオプショナルでなく、既存の設定オブジェクトが型エラーになる
2. `StageTimings` の既存 4 フィールド（`preprocessing`/`chunking`/`embedding`/`deduplication`）がオプショナルに変更される
3. `lateChunking.enabled=true` 時に `embedBatch()` を呼ぶコードパスが設計に残っている
4. Late Chunking サービス未設定時の失敗が Pipeline 側で診断不能なまま漏れる
5. テストケース PI-01〜PI-08 のいずれかが受入基準（AC-1〜AC-8）と対応していない

## 成果物

| 成果物           | パス                                                                                         |
| ---------------- | -------------------------------------------------------------------------------------------- |
| 設計レビュー結果 | `docs/30-workflows/TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001/phase-3-design-review.md` |

## 参照資料

- `.agents/skills/aiworkflow-requirements/references/api-internal-embedding.md`
- `.agents/skills/aiworkflow-requirements/references/architecture-embedding-pipeline.md`
- `docs/30-workflows/TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001/phase-2-design.md`

## 統合テスト連携

- PI-01〜PI-05 が本レビュー観点の観測点になる。
- 設計レビューで FAIL が出た観点は Phase 4 テスト化前に差し戻す。

## 完了条件

- [ ] 30思考法の適用方針が記録されている
- [ ] 全 4 レビュー観点のチェック結果が記録されている
- [ ] PASS / MINOR / MAJOR / CRITICAL の判定基準が定義されている
- [ ] 差し戻し条件（5 項目）が定義されている
- [ ] Phase 4 に進む設計根拠が記録されている
