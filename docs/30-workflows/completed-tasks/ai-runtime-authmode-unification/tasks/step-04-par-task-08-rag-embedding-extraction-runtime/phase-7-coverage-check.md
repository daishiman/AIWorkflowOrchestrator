# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| Phase      | 7                                                             |
| Phase名    | カバレッジ確認                                                |
| タスクID   | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001              |
| 前提Phase  | Phase 4（テスト作成）、Phase 5（実装）、Phase 6（テスト拡充） |
| 後続Phase  | Phase 8（リファクタリング）                                   |
| ステータス | not_started                                                   |
| 作成日     | 2026-03-13                                                    |
| 更新日     | 2026-03-19                                                    |
| 機能名     | rag-embedding-extraction-runtime                              |

## 目的

backend AI surface の coverage 目標を確認し、`.claude/skills/aiworkflow-requirements/references/quality-requirements.md` のカバレッジ基準を満たしていることを検証する。未達の場合は Phase 6 に戻って追加テストを作成する。

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断 | 仕様参照先                                                                          |
| ------------------ | -------- | ----------------------------------------------------------------------------------- |
| セキュリティ       | 適用     | API key 管理パスのカバレッジが含まれていることを確認する                            |
| アーキテクチャ     | 適用     | RAG pipeline 各層（Main / shared / IPC）ごとのカバレッジを個別に計測する            |
| API設計            | 適用     | IPC handler の全チャンネルがテストでカバーされていることを確認する                  |
| エラーハンドリング | 適用     | エラーパス（fail-fast / guidance / retry）のカバレッジを Branch Coverage で確認する |
| パフォーマンス     | 適用     | long-running job の状態遷移パスがカバーされていることを確認する                     |

## カバレッジ基準（quality-requirements.md 準拠）

| 指標              | 最低基準 | 推奨基準 | 判定                           |
| ----------------- | -------- | -------- | ------------------------------ |
| Line Coverage     | 80%      | 90%      | 最低基準未達 -> Phase 6 へ戻る |
| Branch Coverage   | 60%      | 70%      | 最低基準未達 -> Phase 6 へ戻る |
| Function Coverage | 80%      | 90%      | 最低基準未達 -> Phase 6 へ戻る |

## 実行タスク

- 指標整理: Main / shared / IPC の coverage 対象と計測コマンドを確定する
- 未達分析: capability matrix と照合して未計測箇所を列挙する
- Gap 対応判定: 最低基準未達時の Phase 6 戻り条件を明記する

### Task 1: 指標整理

Main / shared service / IPC の層ごとに coverage 対象を整理する:

| 層             | カバレッジ対象ファイル                                                  | 計測コマンド                                                                         |
| -------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Main           | `apps/desktop/src/main/ipc/aiHandlers.ts`                               | `pnpm --dir apps/desktop exec vitest run --coverage src/main/ipc/aiHandlers.test.ts` |
| shared service | `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts` | `pnpm --dir packages/shared exec vitest run --coverage src/services/embedding/`      |
| shared service | `packages/shared/src/services/search/llm-query-classifier.ts`           | `pnpm --dir packages/shared exec vitest run --coverage src/services/search/`         |
| shared service | `packages/shared/src/services/extraction/entity-extractor.ts`           | `pnpm --dir packages/shared exec vitest run --coverage src/services/extraction/`     |
| shared service | `packages/shared/src/services/extraction/relation-extractor.ts`         | `pnpm --dir packages/shared exec vitest run --coverage src/services/extraction/`     |
| shared service | `packages/shared/src/services/search/hybrid-rag-engine.ts`              | `pnpm --dir packages/shared exec vitest run --coverage src/services/search/`         |
| shared service | `packages/shared/src/services/graph/community-summarizer.ts`            | `pnpm --dir packages/shared exec vitest run --coverage src/services/graph/`          |

### Task 2: 未達分析

capability matrix に対する未計測箇所を抽出する:

```bash
# カバレッジレポートを生成して未計測箇所を確認
pnpm --dir apps/desktop exec vitest run --coverage --reporter=json src/main/ipc/aiHandlers.test.ts
pnpm --dir packages/shared exec vitest run --coverage --reporter=json src/services/embedding/ src/services/search/ src/services/extraction/ src/services/graph/

# desktop/shared の coverage summary を別々に抽出
cat apps/desktop/coverage/coverage-summary.json | jq '.total'
cat packages/shared/coverage/coverage-summary.json | jq '.total'
```

### Task 3: Gap 対応判定

| 判定結果                       | 対応                                                    |
| ------------------------------ | ------------------------------------------------------- |
| 全指標が最低基準以上           | Phase 8 へ進む                                          |
| いずれかの指標が最低基準未達   | Phase 6 へ戻り、未達箇所のテストを追加する              |
| 推奨基準未達だが最低基準は達成 | Phase 8 へ進む（改善は Phase 8 リファクタリングで検討） |

## 実行手順

### ステップ 1: coverage 対象と計測コマンドを固定する

Phase 4 の test matrix、Phase 5 の実装差分、Phase 6 の回帰ケースを照合し、Main / shared / IPC の対象ファイルと計測コマンドを確定する。

### ステップ 2: coverage 実測値を取得する

各レイヤーで coverage レポートを取得し、Line / Branch / Function の 3 指標を `coverage-report.md` に整理する。

### ステップ 3: gap と integration 補完方針を記録する

未計測箇所、critical path、Phase 6 に戻す条件を `integration-test.md` に整理し、AI_INDEX / GraphRAG / HybridRAG / CRAG / reranking の補完対象を明記する。

### ステップ 4: 計測制約時の structural fallback を残す

カバレッジツールの都合で数値化できない経路がある場合は、該当経路のテストケース、入口、期待状態遷移を `integration-test.md` に structural coverage fallback として記録する。

### ステップ 5: Phase 遷移を判定する

最低基準達成時は Phase 8 へ進み、未達時は Phase 6 に戻す理由と追加対象を明記する。

## 参照資料

| 参照資料                         | パス                                                                                    | 内容                                       |
| -------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------ |
| Phase 5（実装）                  | `phase-5-implementation.md`                                                             | coverage 対象の変更点を確認する            |
| Phase 6（テスト拡充）            | `phase-6-test-expansion.md`                                                             | 追加回帰ケースを確認する                   |
| aiHandlers                       | `apps/desktop/src/main/ipc/aiHandlers.ts`                                               | Main 側 critical path を確認する           |
| llm-query-classifier             | `packages/shared/src/services/search/llm-query-classifier.ts`                           | query classifier の coverage を確認する    |
| entity-extractor                 | `packages/shared/src/services/extraction/entity-extractor.ts`                           | entity extraction の coverage を確認する   |
| relation-extractor               | `packages/shared/src/services/extraction/relation-extractor.ts`                         | relation extraction の coverage を確認する |
| hybrid-rag-engine                | `packages/shared/src/services/search/hybrid-rag-engine.ts`                              | shared 側 critical path を確認する         |
| interfaces-rag-entity-extraction | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-entity-extraction.md` | extraction 契約と coverage 対象を確認する  |
| コード品質ルール                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`             | カバレッジ基準を確認する                   |

## 統合テスト連携

AI_INDEX、embedding pipeline、query classifier、entity / relation extraction、GraphRAG、HybridRAG、CRAG、reranking の coverage gap を確認する。

## サブタスク管理

Phase 7 実行開始時に以下のサブタスクを作成する:

- [ ] ST-7-1: Main 層カバレッジ計測
- [ ] ST-7-2: shared service 層カバレッジ計測（embedding / search / extraction / graph）
- [ ] ST-7-3: 未達箇所の分析・リスト化
- [ ] ST-7-4: Gap 対応判定（Phase 6 戻り or Phase 8 進行）
- [ ] ST-7-5: `coverage-report.md` / `integration-test.md` の成果物作成

## 成果物

| 成果物             | パス                                  | 内容                                           |
| ------------------ | ------------------------------------- | ---------------------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`  | 層別の実測値、閾値判定、未達箇所を記録する     |
| 統合テスト連携     | `outputs/phase-7/integration-test.md` | coverage gap と structural fallback を記録する |

## 完了条件

- [ ] critical path の未計測箇所が列挙されている
- [ ] Line Coverage が最低基準 80% 以上であること（層ごとに計測）
- [ ] Branch Coverage が最低基準 60% 以上であること（層ごとに計測）
- [ ] Function Coverage が最低基準 80% 以上であること（層ごとに計測）
- [ ] 未達の場合は Phase 6 への戻りが明記されている
- [ ] 数値化困難な経路は `integration-test.md` に structural coverage fallback として記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

検証コマンド:

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime --phase 7
```

## 次のPhase

- [Phase 8（リファクタリング）](./phase-8-refactoring.md) に進む
