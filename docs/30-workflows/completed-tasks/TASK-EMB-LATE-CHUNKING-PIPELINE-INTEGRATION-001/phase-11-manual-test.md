# Phase 11: 手動テスト

## メタ情報

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| Phase        | 11                                                    |
| タスクID     | TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001       |
| タスク名     | Late Chunking EmbeddingPipeline・設定導線への正式統合 |
| タスク種別   | NON_VISUAL                                            |
| ステータス   | 完了                                                  |
| 作成日       | 2026-04-20                                            |
| 前Phase      | 10: 最終レビュー                                      |
| 次Phase      | 12: ドキュメント更新                                  |
| GitHub Issue | #2315                                                 |

---

## 目的

NON_VISUAL タスクのため、UI スクリーンショットは不要。
vitest の詳細出力ログとデバッグログを証跡として使用する。

Late Chunking 統合の実際の動作（`currentStage: "lateChunking"` の progress 通知・`stageTimings.lateChunking` の記録・
`PipelineOutput.embeddings` の内容）をテスト実行ログと結果表で確認する。

---

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要
代替証跡: `outputs/phase-10/final-review-result.md` と `outputs/phase-11/manual-test-result.md`（テスト実行ログ）を参照。

---

## 実行タスク

NON_VISUAL code task のため vitest + デバッグログで確認する。

### シナリオ 1: Late Chunking 有効時のパイプライン動作確認

**目的**: `config.lateChunking = { enabled: true, poolingStrategy: "mean" }` を設定した場合の
パイプライン動作を verbose ログで確認する

**実行コマンド**:

```bash
# Late Chunking 有効時のパイプライン動作確認
pnpm --filter @repo/shared test -- --reporter=verbose embedding-pipeline
```

**確認項目**:

- [ ] `config.lateChunking = { enabled: true, poolingStrategy: "mean" }` を設定して `PipelineOutput.embeddings` の内容を確認
- [ ] `stageTimings.lateChunking` が記録されることを確認
- [ ] `PipelineOutput.embeddings[0].embedding.length > 0` であることを確認
- [ ] `currentStage: "lateChunking"` が progress callback で通知される

---

### シナリオ 2: Late Chunking 無効時（通常フロー）の動作確認

**目的**: `lateChunking` を設定しない場合（または `enabled: false`）の動作が従来と変わらないことを確認する

**確認項目**:

- [ ] `lateChunking` 未設定で通常フローが正常に動作すること
- [ ] `stageTimings.lateChunking` が `undefined` であること
- [ ] 既存テストへの回帰がないこと

---

### シナリオ 3: `poolingStrategy` オプションの動作確認

**目的**: `poolingStrategy` の各オプション（`"mean"` / `"max"` / `"cls"`）が正しく動作することを確認する

**確認項目**:

- [ ] `poolingStrategy: "mean"` で正常に埋め込みが生成されること
- [ ] `poolingStrategy: "cls"` で正常に埋め込みが生成されること
- [ ] `poolingStrategy: "max"` で正常に埋め込みが生成されること

---

### シナリオ 4: `maxTokenLength` 制約の動作確認

**目的**: `maxTokenLength` が設定された場合にトークン長の制約が適用されることを確認する

**確認項目**:

- [ ] `maxTokenLength` を設定した場合に制約が適用されること
- [ ] 制約を超えた入力が適切に処理されること

---

## 手動テスト結果記録テーブル

| シナリオ   | 実行コマンド                                                               | 期待結果                                                  | 実際の結果 | 判定 |
| ---------- | -------------------------------------------------------------------------- | --------------------------------------------------------- | ---------- | ---- |
| シナリオ 1 | `pnpm --filter @repo/shared test -- --reporter=verbose embedding-pipeline` | PASS、`stageTimings.lateChunking` 記録あり                | PASS       | ✓    |
| シナリオ 2 | 上記コマンドのログ確認                                                     | 通常フロー正常動作、`stageTimings.lateChunking` undefined | PASS       | ✓    |
| シナリオ 3 | 上記コマンドのログ確認                                                     | mean/max/cls 全て正常動作                                 | PASS       | ✓    |
| シナリオ 4 | 上記コマンドのログ確認                                                     | maxTokenLength 制約が適用される                           | PASS       | ✓    |

---

## discovered-issues セクション

テスト中に発見した問題を以下の形式で記録する。

| 発見日     | 問題の概要 | 深刻度（高/中/低） | 関連ファイル | 対応方針 | 対応状況 |
| ---------- | ---------- | ------------------ | ------------ | -------- | -------- |
| （記入欄） |            |                    |              |          |          |

問題が発見されなかった場合は「問題なし」と記録する。

---

## docs-only 正本ポリシー

`outputs/phase-11/manual-test-result.md` を Phase 11 の正本とし、以下を 1 ファイルに集約する:

- テスト件数サマリー（PASS/FAIL/SKIP）
- 実行コマンドと判定
- `stageTimings.lateChunking` の記録確認結果
- `PipelineOutput.embeddings[0].embedding.length` の確認結果
- discovered-issues の記録

## 統合テスト連携

- Phase 9 で PASS した対象テストの実測ログを primary evidence とする。
- Phase 12 では `outputs/phase-11/manual-test-result.md` を参照元として固定する。

---

## 参照資料

| 参照資料              | パス                                                                                               | 内容                |
| --------------------- | -------------------------------------------------------------------------------------------------- | ------------------- |
| Phase 10 最終レビュー | `outputs/phase-10/final-review-result.md`                                                          | 最終判定結果        |
| 統合テストファイル    | `packages/shared/src/services/embedding/pipeline/__tests__/embedding-pipeline.integration.test.ts` | PI-01〜PI-08 の定義 |
| パイプライン実装      | `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts`                            | Stage 2.5 の実装    |

---

## 成果物

| 成果物         | パス                                     | 内容                                |
| -------------- | ---------------------------------------- | ----------------------------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | シナリオ実行ログ・discovered-issues |

---

## 完了条件

- [ ] シナリオ 1〜4 の全てを実行し、結果を記録している
- [ ] `stageTimings.lateChunking` が記録されることを確認している
- [ ] `PipelineOutput.embeddings[0].embedding.length > 0` であることを確認している
- [ ] Late Chunking 無効時（通常フロー）の動作が変わらないことを確認している
- [ ] discovered-issues セクションに発見した問題（または「問題なし」）を記録している
- [ ] `outputs/phase-11/manual-test-result.md` が生成されている

---

## タスク100%実行確認【必須】

- [ ] シナリオ 1: Late Chunking 有効時のパイプライン動作確認を実行した
- [ ] シナリオ 2: 通常フローの動作確認を実行した
- [ ] シナリオ 3: `poolingStrategy` オプションの動作確認を実行した
- [ ] シナリオ 4: `maxTokenLength` 制約の動作確認を実行した
- [ ] discovered-issues セクションに記録した
- [ ] `outputs/phase-11/manual-test-result.md` を作成した
- [ ] 完了条件を全て満たしている

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001/phase-12-documentation.md`
