# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 10                                               |
| Phase名    | 最終レビュー                                     |
| タスクID   | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001 |
| 前提Phase  | Phase 1〜9                                       |
| 後続Phase  | Phase 11（手動テスト）                           |
| ステータス | completed                                        |
| 作成日     | 2026-03-13                                       |
| 更新日     | 2026-03-19                                       |
| 機能名     | rag-embedding-extraction-runtime                 |

## 目的

Phase 1〜9 の全成果物を多角的に検証し、backend AI surface 仕様の最終リリース判定を行う。レビューゲート（PASS / MINOR / MAJOR / CRITICAL）に基づき、後続 Phase への進行可否を決定する。

## レビューゲート判定基準

| 判定     | 対応                                               |
| -------- | -------------------------------------------------- |
| PASS     | Phase 11 へ進行                                    |
| MINOR    | 未タスク仕様書に変換後 Phase 11 へ（**省略不可**） |
| MAJOR    | 影響範囲に応じて Phase 1-5 へ戻る                  |
| CRITICAL | Phase 1 へ戻り要件再確認                           |

- MINOR 指摘は**全て**未タスク仕様書に変換する（「機能影響なし」でも省略不可）
- MAJOR/CRITICAL 判定時は戻り先 Phase と理由を `final-review-report.md` に明記する

## 実行タスク

- review runner 実行: `run-review-task.js --runner codex` で最終レビュー入力を `review-prompt.txt` に固定する
- capability matrix の最終確認: Phase 2 設計と Phase 5 実装の差分を突合する
- test matrix の網羅性確認: Phase 4-7 の test coverage と edge case を横断確認する
- QA 観点の最終確認: Phase 1 受入基準と Phase 9 品質結果の一致を確認する
- spec sync 対象の確認: Phase 12 で更新対象にすべき system spec を判定する
- Phase 3 MINOR 追跡の解決確認: 設計レビュー指摘の解消状況を確認する
- レビュー判定と報告書作成: PASS / MINOR / MAJOR / CRITICAL を記録する

### Task 1: capability matrix の最終確認

Phase 2 設計書の capability matrix を Phase 5 実装結果と突合する。

| 確認項目                             | 確認方法                                                          | 期待結果                                   |
| ------------------------------------ | ----------------------------------------------------------------- | ------------------------------------------ |
| RAG embedding 対応プロバイダ         | `aiHandlers.ts` の `AIIndexRequest` 型と capability matrix の照合 | 全対応プロバイダが matrix に列挙されている |
| extraction pipeline 対応フォーマット | `hybrid-rag-engine.ts` の入力型と Phase 2 定義の照合              | サポート対象フォーマットが一致             |
| community summary 生成               | `communityHandlers.ts` のモック/実装状態と matrix の照合          | 実装ステータスが正確に反映されている       |
| unsupported capability guidance      | Phase 5 実装のフォールバック動作と Phase 2 定義の一致確認         | guidance メッセージが仕様通り              |

### Task 2: test matrix の網羅性確認

Phase 4〜7 のテスト成果物を横断的に検証する。

| 確認項目                 | 確認方法                                 | 期待結果                                              |
| ------------------------ | ---------------------------------------- | ----------------------------------------------------- |
| ユニットテストカバレッジ | Phase 7 カバレッジレポート参照           | Line 80%以上、Branch 60%以上                          |
| 統合テストシナリオ       | Phase 6 テスト拡充結果参照               | check connection / index job / partial failure が網羅 |
| エッジケース             | Phase 4 テスト設計の boundary value 確認 | 空クエリ / 大量チャンク / タイムアウト がカバー       |

### Task 3: QA 観点の最終確認

Phase 9 品質検証結果を Phase 1 受入基準と照合する。

| 確認項目            | 確認方法                             | 期待結果                           |
| ------------------- | ------------------------------------ | ---------------------------------- |
| Lint エラー         | Phase 9 の ESLint 実行結果           | エラー 0件                         |
| 型チェック          | Phase 9 の TypeScript 型チェック結果 | エラー 0件                         |
| acceptance criteria | Phase 1 の受入基準を1項目ずつ確認    | 全項目が Phase 5〜9 の成果物で充足 |

### Task 4: spec sync 対象の確認

実装による仕様書更新の必要性を判定する。

| 確認項目              | 対象ファイル                                                               | 確認内容                                                                               |
| --------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| IPC チャンネル定義    | `api-ipc-system.md`                                                        | 新規/変更チャンネルが仕様書に反映されているか                                          |
| legacy IPC / job 契約 | `api-ipc-system-core.md`                                                   | `AI_CHECK_CONNECTION` / `AI_INDEX` の legacy / long-running job 契約が反映されているか |
| RAG アーキテクチャ    | `architecture-rag.md`                                                      | パイプライン構成の変更が反映されているか                                               |
| extraction interface  | `interfaces-rag.md`, `interfaces-rag-entity-extraction.md`                 | entity / relation extraction 契約が反映されているか                                    |
| RAG サービス群        | `rag-services.md`                                                          | クエリ分類・NER・Leiden の変更が反映されているか                                       |
| クエリパイプライン    | `rag-query-pipeline.md`                                                    | HybridRAG 統合パイプラインの変更が反映されているか                                     |
| cross-cutting         | `error-handling.md`, `security-electron-ipc.md`, `quality-requirements.md` | fail-fast / security / quality gate が反映されているか                                 |

### Task 5: Phase 3 MINOR 追跡の解決確認

Phase 3（設計レビュー）で MINOR 判定された指摘事項の解決状況を確認する。

| 確認項目                 | 確認方法                                    | 期待結果                                     |
| ------------------------ | ------------------------------------------- | -------------------------------------------- |
| Phase 3 MINOR 指摘リスト | `outputs/phase-3/` の設計レビュー報告を参照 | 全 MINOR 指摘が Phase 5〜9 で解決済み        |
| 未解決 MINOR             | 解決されていない指摘の有無を確認            | 未解決があれば本 Phase の MINOR 判定に含める |

### Task 6: レビュー判定と報告書作成

Task 1〜5 の結果を総合し、レビューゲート判定を行う。

| 判定条件                               | 結果                           |
| -------------------------------------- | ------------------------------ |
| 全 Task で問題なし                     | PASS                           |
| 軽微な改善点のみ（機能動作に影響なし） | MINOR → 未タスク仕様書変換必須 |
| 設計/実装の根本的な不整合              | MAJOR → 戻り先 Phase を特定    |
| 要件レベルの欠陥                       | CRITICAL → Phase 1 へ          |

## 実行手順

### ステップ 1: レビュー入力を固定する

`run-review-task.js` を `codex` runner で実行し、最終レビューの共通入力を `outputs/phase-10/review-prompt.txt` に出力する。

```bash
node .claude/skills/task-specification-creator/scripts/run-review-task.js \
  --runner codex \
  --phase 10 \
  --workflow docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime \
  --output-prompt docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/outputs/phase-10/review-prompt.txt
```

### ステップ 2: Phase 1-9 の成果物を横断確認する

capability matrix、test matrix、QA 結果、spec sync 対象、Phase 3 MINOR 追跡を順に確認し、Phase 11 の `handoff-checklist.md` に入力すべき条件を整理する。

### ステップ 3: レビューゲートを判定する

PASS / MINOR / MAJOR / CRITICAL を記録し、MINOR は未タスク仕様書へ変換、MAJOR / CRITICAL は戻り先 Phase を報告書へ明記する。

## 参照資料

| 参照資料                | パス                                                                      | 内容                                  |
| ----------------------- | ------------------------------------------------------------------------- | ------------------------------------- |
| Phase 1（要件定義）     | `phase-1-requirements.md`                                                 | 受入基準・対象範囲の最終確認          |
| Phase 2（設計）         | `phase-2-design.md`                                                       | capability matrix・handoff 契約の確認 |
| Phase 3（設計レビュー） | `phase-3-design-review.md`                                                | MINOR 指摘の追跡確認                  |
| Phase 5（実装）         | `phase-5-implementation.md`                                               | 実装結果との突合確認                  |
| Phase 9（品質検証）     | `phase-9-quality-assurance.md`                                            | QA 結果の最終確認                     |
| hybrid-rag-engine       | `packages/shared/src/services/search/hybrid-rag-engine.ts`                | backend pipeline の実装確認           |
| aiHandlers              | `apps/desktop/src/main/ipc/aiHandlers.ts`                                 | IPC ハンドラの実装確認                |
| communityHandlers       | `apps/desktop/src/main/ipc/communityHandlers.ts`                          | community 関連ハンドラの確認          |
| api-ipc-system.md       | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`     | IPC 仕様との整合確認                  |
| architecture-rag.md     | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`   | RAG アーキテクチャ仕様との整合確認    |
| rag-services.md         | `.claude/skills/aiworkflow-requirements/references/rag-services.md`       | RAG サービス仕様との整合確認          |
| rag-query-pipeline.md   | `.claude/skills/aiworkflow-requirements/references/rag-query-pipeline.md` | クエリパイプライン仕様との整合確認    |

## 統合テスト連携

Phase 4-9 の成果物を横断し、AI_INDEX、embedding pipeline、GraphRAG、HybridRAG、CRAG、reranking の接続点が review gate 判定に反映されていることを確認する。MINOR 指摘は統合テスト未カバー箇所も含めて未タスク仕様書へ変換する。

## 多角的チェック観点（AIが判断）

| 観点                               | 適用判断                                                                                            | 仕様参照先                                                                   |
| ---------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| IPC 契約整合性                     | 適用: aiHandlers / communityHandlers の引数・戻り値が Preload 型と一致するか                        | `api-ipc-system.md`, P44/P45                                                 |
| RAG パイプライン4ステージ完全性    | 適用: query_classification / triple_search / rrf_fusion / reranking / crag の全ステージが設計通りか | `rag-query-pipeline.md`                                                      |
| エラーハンドリング Result パターン | 適用: HybridRAGEngine が `Result<T, E>` パターンを使用しているか                                    | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  |
| 型安全性（any 型不使用）           | 適用: RAG 関連ファイルに `any` 型が残存していないか                                                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  |
| partial failure 時のフォールバック | 適用: 検索戦略の一部失敗時に残りの結果で応答できるか                                                | `architecture-rag.md`                                                        |
| community summary のモック状態管理 | 適用: communityHandlers のモックデータが本番移行計画と整合するか                                    | `rag-services.md`                                                            |
| P42 準拠3段バリデーション          | 適用: IPC ハンドラの文字列引数に trim() チェックがあるか                                            | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` |

## サブタスク管理

Phase 10 実行開始時に以下のサブタスクを作成すること:

- [ ] ST-10-1: capability matrix 突合（Task 1）
- [ ] ST-10-2: test matrix 網羅性検証（Task 2）
- [ ] ST-10-3: QA 観点・acceptance criteria 最終確認（Task 3）
- [ ] ST-10-4: spec sync 対象判定（Task 4）
- [ ] ST-10-5: Phase 3 MINOR 追跡解決確認（Task 5）
- [ ] ST-10-6: レビュー判定・報告書作成（Task 6）

## 成果物

| 成果物                 | パス                                        | 内容                                                  |
| ---------------------- | ------------------------------------------- | ----------------------------------------------------- |
| 最終レビュー報告       | `outputs/phase-10/final-review-report.md`   | レビューゲート判定（PASS/MINOR/MAJOR/CRITICAL）と根拠 |
| レビュープロンプト     | `outputs/phase-10/review-prompt.txt`        | `run-review-task.js` が生成する共通 review 入力       |
| MINOR 指摘一覧         | `outputs/phase-10/minor-issues.md`          | MINOR 判定時の未タスク仕様書変換リスト（0件でも作成） |
| Phase 3 MINOR 追跡結果 | `outputs/phase-10/phase3-minor-tracking.md` | Phase 3 MINOR 指摘の解決状況                          |

## 完了条件

- [ ] Task 1〜5 の全確認項目を実施し結果を記録した
- [ ] capability matrix と実装の突合が完了している
- [ ] test matrix の網羅性が確認されている
- [ ] Phase 1 の acceptance criteria が全て充足されている
- [ ] spec sync 対象ファイルの更新要否が判定されている
- [ ] Phase 3 MINOR 指摘が全て解決済み、または本 Phase の MINOR に含まれている
- [ ] レビューゲート判定（PASS/MINOR/MAJOR/CRITICAL）が明確に記録されている
- [ ] MINOR 判定の場合、全指摘が未タスク仕様書に変換されている
- [ ] `review-prompt.txt` が生成され、共通 review 入力が固定されている
- [ ] `artifacts.json` の Phase 10 ステータスが更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスク（Task 1〜6）を100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

検証コマンド:

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime --phase 10
```

## 次のPhase

- PASS / MINOR → [Phase 11（手動テスト）](./phase-11-manual-test.md) に進む
- MAJOR → 影響範囲に応じて Phase 1-5 へ戻る（戻り先を報告書に明記）
- CRITICAL → [Phase 1（要件定義）](./phase-1-requirements.md) へ戻り要件再確認
