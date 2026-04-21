# Phase 10: 最終レビューゲート

## メタ情報

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| Phase        | 10                                                    |
| タスクID     | TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001       |
| タスク名     | Late Chunking EmbeddingPipeline・設定導線への正式統合 |
| タスク種別   | NON_VISUAL                                            |
| ステータス   | 未実施                                                |
| 作成日       | 2026-04-20                                            |
| 前Phase      | 9: 品質保証                                           |
| 次Phase      | 11: 手動テスト                                        |
| GitHub Issue | #2315                                                 |

---

## 目的

Phase 2 の設計事項・テスト要件（PI-01〜PI-08）・後方互換性の全てが満たされていることを
証跡付きで照合し、Phase 11（手動テスト）への進行判定を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: Phase 2 設計事項の実装反映確認

**目的**: Phase 2 で定義した設計事項 1〜5 が全て実装に反映されていることを確認する

**実行手順**:

1. `outputs/phase-2/` の設計ドキュメントを参照する
2. 以下の照合マトリクスを記入する

**設計事項照合マトリクス**:

| 設計事項 | 内容                                                                                                                       | 実装状況 | 証跡ファイル            |
| -------- | -------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------- |
| 設計1    | `PipelineConfig` に `lateChunking` オプションを追加（`enabled`, `poolingStrategy`, `maxTokenLength`）                      | 未確認   | `types.ts`              |
| 設計2    | `StageTimings` に `lateChunking?: number` を追加                                                                           | 未確認   | `types.ts`              |
| 設計3    | `EmbeddingService` に注入済みの `lateChunkingService` を `EmbeddingPipeline` が `generateChunkEmbeddings()` 経由で利用する | 未確認   | `embedding-pipeline.ts` |
| 設計4    | `config.lateChunking.enabled === true` の場合のみ Stage 2.5 を実行する分岐を追加                                           | 未確認   | `embedding-pipeline.ts` |
| 設計5    | Late Chunking サービス未設定でも `lateChunking.enabled` が false であれば通常フローで動作すること                          | 未確認   | `embedding-pipeline.ts` |

3. 未反映の設計事項がある場合は原因を特定する

**期待される成果物**:

- `outputs/phase-10/final-review-result.md` の設計事項照合セクション

---

### タスク2: PI-01〜PI-08 全件 PASS の確認

**目的**: 全統合テスト（PI-01〜PI-08）が PASS していることを証跡付きで確認する

**実行手順**:

1. `outputs/phase-9/quality-check-result.md` の統合テストセクションを参照する
2. 以下の照合マトリクスを記入する

**テスト PASS 照合マトリクス**:

| テスト ID | テスト内容                                            | 達成状況 | 証跡                                      |
| --------- | ----------------------------------------------------- | -------- | ----------------------------------------- |
| PI-01     | Late Chunking 有効時のパイプライン実行                | 未確認   | `outputs/phase-9/quality-check-result.md` |
| PI-02     | Late Chunking 無効時（通常フロー）のパイプライン実行  | 未確認   | `outputs/phase-9/quality-check-result.md` |
| PI-03     | `poolingStrategy` の各オプション動作確認              | 未確認   | `outputs/phase-9/quality-check-result.md` |
| PI-04     | `maxTokenLength` の制約が適用されること               | 未確認   | `outputs/phase-9/quality-check-result.md` |
| PI-05     | `stageTimings.lateChunking` の記録確認                | 未確認   | `outputs/phase-9/quality-check-result.md` |
| PI-06     | Late Chunking サービス未設定時の動作                  | 未確認   | `outputs/phase-9/quality-check-result.md` |
| PI-07     | `PipelineOutput.embeddings` の形式・長さ確認          | 未確認   | `outputs/phase-9/quality-check-result.md` |
| PI-08     | 既存の通常フロー（`lateChunking` 未設定）の後方互換性 | 未確認   | `outputs/phase-9/quality-check-result.md` |

**期待される成果物**:

- `outputs/phase-10/final-review-result.md` の PI テスト照合セクション

---

### タスク3: 後方互換性の確認

**目的**: 既存の通常フロー（`lateChunking` 未設定）の動作が変わらないことを確認する

**実行手順**:

1. `PipelineConfig` に `lateChunking` を指定しない呼び出しで型エラーが発生しないことを確認する
2. 既存のテストが全て PASS していることを `outputs/phase-9/quality-check-result.md` で確認する
3. 以下の後方互換性チェックリストを記入する

**後方互換性チェックリスト**:

- [ ] `PipelineConfig` に `lateChunking` を指定しない既存呼び出しで型エラーが発生しない
- [ ] 既存の通常フロー（Late Chunking 無効）のテストが全て PASS
- [ ] `PipelineConfig` の型変更が既存の呼び出し元に型エラーを引き起こしていない

**期待される成果物**:

- `outputs/phase-10/final-review-result.md` の後方互換性確認セクション

---

### タスク4: 最終判定とPhase 11 進行承認

**目的**: タスク1〜3 の結果を集約し、Phase 11（手動テスト）への進行可否を判定する

**判定基準テーブル**:

| 判定     | 条件                                                                                              | 次のアクション                              |
| -------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| PASS     | 設計事項 1〜5 が全て反映済み、かつ PI-01〜PI-08 が全件 PASS、かつ後方互換性チェックリスト全て充足 | Phase 11 へ進行                             |
| MINOR    | 未達が 1 件以下かつ後方互換性・型安全性に関わらない軽微な問題のみ                                 | 修正後に Phase 11 へ進行                    |
| MAJOR    | 設計事項の未反映が 2 件以上、または PI テストの未達が 1 件以上                                    | Phase 8 に差し戻す                          |
| CRITICAL | 後方互換性の破壊、型安全性の根本的な崩壊、設計前提の破綻                                          | Phase 5 に差し戻す（設計 Phase 2 も再検討） |

**戻り先決定基準**:

| 問題の種類                                | 戻り先           |
| ----------------------------------------- | ---------------- |
| 設計事項の未反映（実装漏れ）              | Phase 5〜8       |
| PI テストの FAIL                          | Phase 4〜7       |
| 後方互換性の破壊                          | Phase 5 または 2 |
| `PipelineConfig` 型変更による既存型エラー | Phase 5 または 2 |

3. 判定結果と根拠を `final-review-result.md` に記録する

**期待される成果物**:

- `outputs/phase-10/final-review-result.md` の最終判定セクション（判定結果・根拠・次アクション）

---

## 完了条件チェックリスト（Issue #2315 より）

### 機能要件

- [ ] `PipelineConfig` に `lateChunking?: { enabled: boolean; poolingStrategy?: "mean" | "max" | "cls"; maxTokenLength?: number }` が追加されている
- [ ] `StageTimings` に `lateChunking?: number` が追加されている
- [ ] `EmbeddingPipeline` が `EmbeddingService.generateChunkEmbeddings()` を使う Stage 2.5 分岐を持つ
- [ ] PI-01〜PI-08 の全テストが PASS

### 後方互換要件

- [ ] `PipelineConfig` に `lateChunking` を指定しない既存呼び出しで型エラーが発生しない
- [ ] 既存の通常フロー（Late Chunking 無効）のテストが全て PASS

---

## 参照資料

| 参照資料                 | パス                                                                                               | 内容                      |
| ------------------------ | -------------------------------------------------------------------------------------------------- | ------------------------- |
| Phase 2 設計ドキュメント | `outputs/phase-2/`                                                                                 | 設計事項 1〜5 の定義      |
| Phase 9 品質チェック結果 | `outputs/phase-9/quality-check-result.md`                                                          | lint/typecheck/テスト結果 |
| 型定義ファイル           | `packages/shared/src/services/embedding/pipeline/types.ts`                                         | `PipelineConfig` 型定義   |
| パイプライン実装         | `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts`                            | コンストラクタ・分岐実装  |
| 統合テストファイル       | `packages/shared/src/services/embedding/pipeline/__tests__/embedding-pipeline.integration.test.ts` | PI-01〜PI-08 の定義       |

---

## 成果物

| 成果物           | パス                                      | 内容                                      |
| ---------------- | ----------------------------------------- | ----------------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | 設計照合・PI テスト・後方互換性・最終判定 |

---

## サブタスク管理

| サブタスクID | 内容                           | ステータス |
| ------------ | ------------------------------ | ---------- |
| ST-10-01     | Phase 2 設計事項の実装反映確認 | 未実施     |
| ST-10-02     | PI-01〜PI-08 全件 PASS 確認    | 未実施     |
| ST-10-03     | 後方互換性チェックリスト記入   | 未実施     |
| ST-10-04     | 最終判定と Phase 11 進行承認   | 未実施     |

---

## 完了条件

- [ ] Phase 2 の設計事項 1〜5 が全て実装に反映されていることを証跡付きで確認している
- [ ] PI-01〜PI-08 の全テストが PASS していることを確認している
- [ ] 既存の通常フロー（`lateChunking` 未設定）の動作が変わらないことを確認している
- [ ] `PipelineConfig` の型変更が既存の呼び出し元に型エラーを引き起こしていないことを確認している
- [ ] `outputs/phase-10/final-review-result.md` が生成されている
- [ ] 最終判定が PASS または MINOR であり、Phase 11 への進行が承認されている

---

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001/phase-11-manual-test.md`

## 統合テスト連携

- Phase 9 の quality gate 結果を Phase 10 の設計照合・後方互換判定に接続する。
- Phase 11 では本 Phase で承認した primary evidence のみを手動テスト証跡として採用する。
