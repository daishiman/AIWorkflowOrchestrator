# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 6                                                |
| Phase名    | テスト拡充                                       |
| タスクID   | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001 |
| 前提Phase  | Phase 4（テスト作成）、Phase 5（実装）           |
| 後続Phase  | Phase 7（カバレッジ確認）                        |
| ステータス | not_started                                      |
| 作成日     | 2026-03-13                                       |
| 更新日     | 2026-03-19                                       |
| 機能名     | rag-embedding-extraction-runtime                 |

## 目的

backend AI surface の回帰に対する追加テストを実装し、Phase 4 で作成したテストマトリクスのカバレッジ不足箇所を補完する。特に異常系・境界値・long-running シナリオを重点的に拡充する。

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断 | 仕様参照先                                                                      |
| ------------------ | -------- | ------------------------------------------------------------------------------- |
| セキュリティ       | 適用     | API key のリーク検証: エラーメッセージに key が含まれないことをテストで検証する |
| アーキテクチャ     | 適用     | RAG pipeline 各層の回帰テストが独立して実行可能であることを確認する             |
| API設計            | 適用     | IPC handler のエラーレスポンスが統一形式であることを回帰テストに含める          |
| エラーハンドリング | 適用     | fail-fast / guidance / retry の各パターンの回帰テストを追加する                 |
| パフォーマンス     | 適用     | long-running job のタイムアウト・キャンセル・進捗通知の回帰テストを追加する     |

## 実行タスク

- 回帰拡張: job retry / provider failure / unsupported capability / query classifier / extraction / mock 排除の回帰を追加する
- 境界拡張: long-running job / partial failure / graph summary fallback の境界ケースを追加する
- CRAG/reranking 回帰シナリオ: corrective path と reranking path の統合シナリオを追加する

### Task 1: 回帰拡張

以下のケースを追加する:

| カテゴリ                     | テストケース                                                         | 優先度 |
| ---------------------------- | -------------------------------------------------------------------- | ------ |
| job retry                    | job 失敗後の自動 retry が正しく動作する                              | 高     |
| provider failure             | provider 障害時に適切なエラーと guidance が返される                  | 高     |
| unsupported capability       | provider が対応していない capability へのリクエストが fail-fast する | 高     |
| entity / relation extraction | extractor failure 時に fail-fast と guidance が正しく返る            | 高     |
| mock 排除                    | 外部 AI サービスの mock を最小限にし、レスポンス構造を検証する       | 中     |
| rate limit                   | rate limit 到達時の backoff/retry が正しく動作する                   | 中     |
| timeout                      | long-running job のタイムアウト処理が正しく動作する                  | 中     |

### Task 2: 境界拡張

以下のケースを追加する:

| カテゴリ                    | テストケース                                                         | 優先度 |
| --------------------------- | -------------------------------------------------------------------- | ------ |
| long-running job            | 長時間実行ジョブのキャンセル・進捗通知・タイムアウトが正しく動作する | 高     |
| partial failure             | バッチ処理の一部失敗時に成功分が保存され、失敗分がレポートされる     | 高     |
| query / extraction boundary | query classifier と entity / relation extraction の境界が崩れない    | 高     |
| graph summary fallback      | primary summarizer 失敗時の fallback が正しく動作する                | 中     |

### Task 3: query classifier / CRAG / reranking 回帰シナリオ

以下のケースを追加する:

| カテゴリ              | テストケース                                                                | 優先度 |
| --------------------- | --------------------------------------------------------------------------- | ------ |
| query classification  | `LLMQueryClassifier` が AI runtime 経由で capability 判定と guidance を返す | 高     |
| CRAG validation       | Corrective RAG の validation ステップが AI runtime 経由で正しく動作する     | 高     |
| reranking             | reranking の AI 呼び出しが AI runtime 経由で正しく動作する                  | 高     |
| CRAG + reranking 結合 | CRAG validation 後の reranking パイプラインが正しく動作する                 | 中     |
| search fallback       | hybrid search の一方が失敗した場合の fallback が正しく動作する              | 中     |

## 参照資料

| 参照資料                         | パス                                                                                    | 内容                                           |
| -------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Phase 4（テスト作成）            | `phase-4-test-creation.md`                                                              | テストマトリクスを確認する                     |
| Phase 5（実装）                  | `phase-5-implementation.md`                                                             | 実装済み変更点を確認する                       |
| embedding-service                | `packages/shared/src/services/embedding/embedding-service.ts`                           | embedding 回帰点を確認する                     |
| llm-query-classifier             | `packages/shared/src/services/search/llm-query-classifier.ts`                           | query classifier 回帰点を確認する              |
| entity-extractor                 | `packages/shared/src/services/extraction/entity-extractor.ts`                           | entity extraction 回帰点を確認する             |
| relation-extractor               | `packages/shared/src/services/extraction/relation-extractor.ts`                         | relation extraction 回帰点を確認する           |
| community-summarizer             | `packages/shared/src/services/graph/community-summarizer.ts`                            | graph summary 回帰点を確認する                 |
| hybrid-rag-engine                | `packages/shared/src/services/search/hybrid-rag-engine.ts`                              | rerank / CRAG 回帰点を確認する                 |
| interfaces-rag-entity-extraction | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-entity-extraction.md` | extraction 契約を確認する                      |
| rag-search-hybrid                | `.claude/skills/aiworkflow-requirements/references/rag-search-hybrid.md`                | HybridRAG 4 stage pipeline を確認する          |
| rag-search-crag                  | `.claude/skills/aiworkflow-requirements/references/rag-search-crag.md`                  | CRAG evaluation / correction action を確認する |
| error-handling                   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                   | fail-fast / guidance / retry を確認する        |
| コード品質ルール                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`             | テスト設計の注意を確認する                     |

## 実行手順

### ステップ1: Phase 4 の test matrix と Phase 5 の実装差分を確認する

Phase 4 で定義した Red ケースと Phase 5 の Green 実装差分を突合し、追加すべき回帰範囲を確定する。

### ステップ2: 回帰ケースと境界ケースを追加する

job retry、provider failure、unsupported capability、entity / relation extraction、partial failure、graph summary fallback を順に追加する。

### ステップ3: CRAG / reranking シナリオを追加する

HybridRAG 内の query classification、entity / relation extraction、reranking、CRAG 補正の組み合わせを重点的に拡張する。

### ステップ4: テスト実行結果と成果物を更新する

追加テストの PASS と coverage 差分を確認し、`regression-plan.md` と `regression-execution-log.md` に反映する。

## 統合テスト連携

job retry、partial failure、guidance、query classifier、entity / relation extraction、mock 排除の回帰を一体で広げる。CRAG / reranking の回帰シナリオは hybrid-rag-engine のテストファイルに統合する。

## サブタスク管理

Phase 6 実行開始時に以下のサブタスクを作成する:

- [ ] ST-6-1: 回帰拡張テスト追加（job retry / provider failure / unsupported capability / mock 排除）
- [ ] ST-6-2: 境界拡張テスト追加（long-running job / partial failure / graph summary fallback）
- [ ] ST-6-3: query classifier / CRAG / reranking 回帰テスト追加
- [ ] ST-6-4: 全テスト PASS 確認・カバレッジ差分レポート作成
- [ ] ST-6-5: 回帰実行ログ作成

## 成果物

| 成果物       | パス                                          | 内容                                        |
| ------------ | --------------------------------------------- | ------------------------------------------- |
| 回帰計画     | `outputs/phase-6/regression-plan.md`          | 追加テストと優先度を整理する                |
| 回帰実行ログ | `outputs/phase-6/regression-execution-log.md` | 実行コマンド、結果、coverage 差分を記録する |

## 完了条件

- [ ] index / embedding / extraction / graph summary / guidance の回帰ケースが整理されている
- [ ] job retry / provider failure / unsupported capability のテストが追加されている
- [ ] long-running job / partial failure / graph summary fallback のテストが追加されている
- [ ] CRAG / reranking の回帰シナリオが追加されている
- [ ] 追加テストが全て PASS している
- [ ] `regression-execution-log.md` に実行コマンド、結果、coverage 差分が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

検証コマンド:

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime --phase 6
```

## 次のPhase

- [Phase 7（カバレッジ確認）](./phase-7-coverage-check.md) に進む
