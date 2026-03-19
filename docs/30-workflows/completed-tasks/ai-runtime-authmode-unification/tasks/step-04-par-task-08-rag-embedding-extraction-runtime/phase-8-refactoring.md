# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                                              |
| ---------- | ----------------------------------------------------------------- |
| Phase      | 8                                                                 |
| Phase名    | リファクタリング                                                  |
| タスクID   | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001                  |
| 前提Phase  | Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認） |
| 後続Phase  | Phase 9（品質検証）                                               |
| ステータス | not_started                                                       |
| 作成日     | 2026-03-13                                                        |
| 更新日     | 2026-03-19                                                        |
| 機能名     | rag-embedding-extraction-runtime                                  |

## 目的

backend AI surface の責務分離を保ちながら構造を整理する。Phase 5 で AI runtime 統合した embedding / extraction / graph summary / reranking の各サービスについて、コード品質と保守性を向上させるリファクタリングを実施する。

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断 | 仕様参照先                                                                                                                                     |
| ------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | 適用     | API key がリファクタリングで露出しないこと。`.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                       |
| アーキテクチャ     | 適用     | RAG pipeline の責務境界を維持。`architecture-rag.md`, `rag-services.md`                                                                        |
| API設計            | 適用     | IPC handler のインターフェース契約を破壊しないこと。`api-ipc-system.md`                                                                        |
| エラーハンドリング | 適用     | fail-fast / guidance パターンをリファクタリングで消失させないこと。`.claude/skills/aiworkflow-requirements/references/quality-requirements.md` |
| パフォーマンス     | 適用     | long-running job（index job）のパフォーマンス特性を変えないこと。`rag-query-pipeline.md`                                                       |

## 実行タスク

- 5観点分析: index job / online query / helper 境界、重複、命名、import path を監査する
- リファクタリング計画: 対象・非対象・リスク・Phase 5 既実施項目を整理する
- 実施と回帰確認: 命名統一、重複統合、責務整理、import 最適化後に回帰テストを確認する

### Task 1: リファクタリング対象の特定

Phase 5 実装済みコードを分析し、以下の5観点でリファクタリング候補を洗い出す。

#### 1-1. index job と online query の境界整理

- `aiHandlers.ts` 内の index job 起動ロジックと online query 処理ロジックの責務境界を確認
- IPC handler が直接ビジネスロジックを持っていないか（handler は薄く保つ原則）
- index job の状態管理と online query の状態管理が混在していないか

#### 1-2. embedding / extraction / query classifier / graph summary helper の境界整理

- `embedding-service.ts` と `embedding-pipeline.ts` の責務重複がないか確認
- `llm-query-classifier.ts` と extraction service 群の責務境界が明確か確認
- `entity-extractor.ts` / `relation-extractor.ts` の共通 helper と責務重複がないか確認
- `community-summarizer.ts` が RAG engine と密結合していないか確認
- `relevance-evaluator.ts` と `cross-encoder-reranker.ts` の責務が明確に分離されているか確認

#### 1-3. duplicate（重複コード）の検出と統合

```bash
# 重複パターン検出コマンド
grep -rn "createEmbedding\|generateEmbedding" packages/shared/src/services/embedding/
grep -rn "aiRuntimeConfig\|getAIRuntime" apps/desktop/src/main/ipc/aiHandlers.ts apps/desktop/src/main/ipc/communityHandlers.ts
```

- AI runtime 取得パターンの重複を検出
- エラーハンドリングの定型パターンをユーティリティに抽出すべきか評価
- 共通バリデーションロジックの重複を確認

#### 1-4. naming（命名規則）の統一

- P45 準拠: 引数名がセマンティクスと一致しているか（例: `modelId` vs `modelName`）
- サービス名、メソッド名、変数名が RAG ドメイン用語と一致しているか
- `config` / `options` / `settings` の命名ゆれがないか

#### 1-5. navigation 短縮（import path の最適化）

- barrel export（`index.ts`）の整備状況を確認
- 深いネストの import path を短縮可能か評価
- circular dependency がないか確認

```bash
# import path 分析コマンド
grep -rn "from '.*\.\./\.\./\.\./\.\./'" packages/shared/src/services/embedding/ packages/shared/src/services/search/
```

### Task 2: リファクタリング計画の策定

Task 1 の分析結果に基づき、以下を明記したリファクタリング計画を作成する。

- 整理対象ファイルと変更内容
- 非対象ファイルとその理由（capability matrix を壊さないため）
- Phase 5 で先行実施済みのファイル分離がある場合は「Phase 5 で実施済み」と明記し、重複作業を回避する
- 各リファクタリング項目のリスク評価（テスト影響範囲）

### Task 3: リファクタリング実施

計画に基づき、以下の順序でリファクタリングを実施する。

1. **命名統一**: 影響範囲が最小のため最初に実施
2. **重複コード統合**: テストで検証しやすい単位で統合
3. **責務境界整理**: index job / online query / helper の境界を明確化
4. **import path 最適化**: barrel export 整備（最後に実施）

各ステップ完了後に既存テストが全 PASS することを確認する。

```bash
# リファクタリング後の回帰テスト
pnpm --dir apps/desktop exec vitest run src/main/ipc/aiHandlers.test.ts
pnpm --dir apps/desktop exec vitest run src/main/ipc/communityHandlers.test.ts
pnpm --dir packages/shared exec vitest run src/services/embedding/
pnpm --dir packages/shared exec vitest run src/services/search/
pnpm --dir packages/shared exec vitest run src/services/extraction/
```

## 実行手順

### ステップ 1: 5観点の分析結果を固定する

Phase 5 実装差分、Phase 6 回帰ケース、Phase 7 coverage gap を照合し、境界・重複・命名・import path の論点を洗い出す。

### ステップ 2: 対象 / 非対象 / リスクを明文化する

`refactor-plan.md` に整理対象、見送る箇所、capability matrix への影響、Phase 5 で実施済みの項目を記録する。

### ステップ 3: 小さい単位でリファクタリングする

命名統一、重複統合、責務境界整理、import path 最適化を順番に実施し、各ステップ後に回帰テストを実行する。

### ステップ 4: 品質証跡を出力する

変更履歴を `refactoring-log.md`、静的品質確認を `code-quality-check.md`、回帰 PASS を `test-pass-confirmation.md` に記録する。

## Phase 5 で実施済みの分離に関する注意

Phase 5 実装時にファイル分離やリネームを先行実施している場合がある。リファクタリング計画策定時に Phase 5 の成果物を確認し、既に実施済みの項目は「Phase 5 で実施済み — 追加リファクタリング不要」と明記すること。二重作業を防ぐため、`git log --oneline -20 -- apps/desktop/src/main/ipc/ packages/shared/src/services/` で変更履歴を確認する。

## 参照資料

| 参照資料                         | パス                                                                                    | 内容                                 |
| -------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------ |
| Phase 1（要件定義）              | `phase-1-requirements.md`                                                               | capability 前提を確認する            |
| Phase 2（設計）                  | `phase-2-design.md`                                                                     | 目標とする責務境界を確認する         |
| Phase 5（実装）                  | `phase-5-implementation.md`                                                             | 実装済み責務分布を確認する           |
| Phase 6（テスト拡充）            | `phase-6-test-expansion.md`                                                             | 回帰対象の広がりを確認する           |
| Phase 7（カバレッジ確認）        | `phase-7-coverage-check.md`                                                             | coverage gap を確認する              |
| embedding-service                | `packages/shared/src/services/embedding/embedding-service.ts`                           | embedding 生成の責務を確認する       |
| embedding-pipeline               | `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts`                 | pipeline 責務を確認する              |
| llm-query-classifier             | `packages/shared/src/services/search/llm-query-classifier.ts`                           | query classifier の責務を確認する    |
| entity-extractor                 | `packages/shared/src/services/extraction/entity-extractor.ts`                           | entity extraction の責務を確認する   |
| relation-extractor               | `packages/shared/src/services/extraction/relation-extractor.ts`                         | relation extraction の責務を確認する |
| hybrid-rag-engine                | `packages/shared/src/services/search/hybrid-rag-engine.ts`                              | RAG engine の責務を確認する          |
| hybrid-rag-factory               | `packages/shared/src/services/search/hybrid-rag-factory.ts`                             | engine 組み立て責務を確認する        |
| community-summarizer             | `packages/shared/src/services/graph/community-summarizer.ts`                            | graph summary の責務を確認する       |
| relevance-evaluator              | `packages/shared/src/services/search/crag/relevance-evaluator.ts`                       | 関連度評価の責務を確認する           |
| cross-encoder-reranker           | `packages/shared/src/services/search/reranking/cross-encoder-reranker.ts`               | reranking の責務を確認する           |
| aiHandlers                       | `apps/desktop/src/main/ipc/aiHandlers.ts`                                               | IPC handler の責務を確認する         |
| communityHandlers                | `apps/desktop/src/main/ipc/communityHandlers.ts`                                        | community handler を確認する         |
| architecture-rag                 | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                 | RAG アーキテクチャ仕様               |
| rag-services                     | `.claude/skills/aiworkflow-requirements/references/rag-services.md`                     | RAG サービス仕様                     |
| rag-query-pipeline               | `.claude/skills/aiworkflow-requirements/references/rag-query-pipeline.md`               | RAG クエリパイプライン仕様           |
| api-ipc-system                   | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                   | IPC システム仕様                     |
| llm-embedding                    | `.claude/skills/aiworkflow-requirements/references/llm-embedding.md`                    | LLM/Embedding 仕様                   |
| interfaces-rag-entity-extraction | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-entity-extraction.md` | extraction 契約を確認する            |

## 統合テスト連携

index job、online query、query classifier、entity / relation extraction、graph summary、reranking の責務分離を壊さないよう整理する。リファクタリング各ステップ後に回帰テストを実行し、capability matrix が維持されていることを確認する。

## サブタスク管理

Phase 8 実行開始時に以下のサブタスクを作成すること:

- [ ] ST-8-1: リファクタリング対象の5観点分析（Task 1）
- [ ] ST-8-2: リファクタリング計画策定と Phase 5 実施済み項目の確認（Task 2）
- [ ] ST-8-3: リファクタリング実施と回帰テスト確認（Task 3）
- [ ] ST-8-4: Phase 8 成果物（plan / log / quality / test confirmation）作成

## 成果物

| 成果物                   | パス                                        | 内容                                           |
| ------------------------ | ------------------------------------------- | ---------------------------------------------- |
| リファクタ計画           | `outputs/phase-8/refactor-plan.md`          | 整理対象と非対象を明記する                     |
| リファクタリング実施記録 | `outputs/phase-8/refactoring-log.md`        | 各ステップの変更内容と回帰テスト結果を記録する |
| コード品質確認           | `outputs/phase-8/code-quality-check.md`     | lint / type / 設計境界の確認結果を記録する     |
| テスト再実行確認         | `outputs/phase-8/test-pass-confirmation.md` | リファクタリング後の回帰 PASS を記録する       |

## 完了条件

- [ ] capability matrix を壊さない整理方針が定義されている
- [ ] 5観点（境界整理 x2、重複検出、命名統一、import 最適化）の分析が完了している
- [ ] Phase 5 で実施済みの分離が識別され、重複作業が回避されている
- [ ] リファクタリング後に全テストが PASS している
- [ ] `code-quality-check.md` と `test-pass-confirmation.md` に品質証跡が記録されている
- [ ] artifacts.json が更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

検証コマンド:

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime --phase 8
```

## 次のPhase

- [Phase 9（品質検証）](./phase-9-quality-assurance.md) に進む
