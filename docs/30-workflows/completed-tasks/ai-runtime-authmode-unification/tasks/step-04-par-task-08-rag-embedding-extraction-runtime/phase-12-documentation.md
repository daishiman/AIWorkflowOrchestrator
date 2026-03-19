# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 12                                                                                                                                                                                                          |
| Phase名    | ドキュメント                                                                                                                                                                                                |
| タスクID   | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001                                                                                                                                                            |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認）、Phase 8（リファクタリング）、Phase 9（品質検証）、Phase 10（最終レビュー）、Phase 11（手動テスト） |
| 後続Phase  | Phase 13（PR作成）                                                                                                                                                                                          |
| ステータス | completed                                                                                                                                                                                                   |
| 作成日     | 2026-03-13                                                                                                                                                                                                  |
| 更新日     | 2026-03-19                                                                                                                                                                                                  |
| 機能名     | rag-embedding-extraction-runtime                                                                                                                                                                            |

## 目的

RAG / Embedding / Extraction runtime 統合の成果を system spec と task 台帳へ同期し、実装ガイド・変更履歴・未タスク検出・スキルフィードバックを整備する。Phase 12 は漏れが最も発生しやすい Phase であるため、6 タスク全てを逐次確認しながら 100% 完了させる。

## 実行タスク

- 実装ガイド作成: Part 1 と Part 2 の 2 部構成で runtime ルールを説明する
- システム仕様書更新: Step 1-A / 1-B / 1-C / Step 2 の結果を記録する
- ドキュメント更新履歴作成: 実更新結果を documentation-changelog に事後記録する
- 未タスク検出レポート作成: SF-03 4 パターンを確認して 0 件でも出力する
- スキルフィードバックレポート作成: 改善点の有無を明記する
- Phase 12 準拠チェック: Task 1-5 完了後に compliance check を作成する

| Task | 名称                               | 必須 | 概要                                                           |
| ---- | ---------------------------------- | ---- | -------------------------------------------------------------- |
| 1    | 実装ガイド作成                     | YES  | Part 1（中学生レベル）+ Part 2（技術者レベル）の 2 部構成      |
| 2    | システム仕様書更新                 | YES  | Step 1-A, 1-B, 1-C, Step 2 の 4 サブステップ + SF-02 2段階方式 |
| 3    | ドキュメント更新履歴作成           | YES  | documentation-changelog.md（全 Step 完了後に事後記録）         |
| 4    | 未タスク検出レポート作成           | YES  | 0 件でも出力必須、SF-03 4パターンチェック                      |
| 5    | スキルフィードバックレポート作成   | YES  | 改善点なしでも出力必須                                         |
| 6    | phase12-task-spec-compliance-check | YES  | Task 1-5 の全完了確認チェックリスト                            |

## Task 1: 実装ガイド作成

### Part 1: 初学者・中学生レベル

- 日常生活での例え話を必ず含める（「図書館の司書が本を探す仕組み」のような具体例）
- 専門用語は使わないか、使用時は即座に平易な言葉で説明する
- 「なぜ必要か」を先に説明してから「何をするか」を説明する
- RAG / Embedding / Extraction の各概念を日常例で導入する

### Part 2: 開発者・技術者レベル

- TypeScript 型定義（capability matrix、provider interface）
- API シグネチャ（IPC ハンドラ、サービスメソッド）
- エラーハンドリング（silent fallback 排除、explicit error propagation）
- 設定パラメータ（embedding model、chunk size、reranking threshold）
- runtime 切り替えの具体的コードパス

### 成果物

`outputs/phase-12/implementation-guide.md`

## Task 2: システム仕様書更新

### SF-02 対応: 設計タスク向け 2 段階方式

| ステージ          | タイミング    | 内容                                                      |
| ----------------- | ------------- | --------------------------------------------------------- |
| Step 2A: 計画記録 | Task 2 開始時 | 更新予定ファイルと変更内容の計画を記録                    |
| Step 2B: 実更新   | Task 2 完了前 | 実際に `.claude/skills/` 配下の仕様書を更新（先送り禁止） |

### Step 1-A: タスク完了記録

- [x] 該当仕様書（`api-ipc-system-core.md` / `llm-ipc-types.md` / `rag-search-hybrid.md` 等）にタスク完了記録セクションを追加
- [x] `.claude/skills/aiworkflow-requirements/LOGS.md` を更新（**1 ファイル目**）
- [x] `.claude/skills/task-specification-creator/LOGS.md` を更新（**2 ファイル目** — P1/P25 対策、2 ファイル両方必須）
- [x] `.claude/skills/aiworkflow-requirements/SKILL.md` 変更履歴を更新
- [x] `.claude/skills/task-specification-creator/SKILL.md` 変更履歴を更新
- [x] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` で `topic-map.md` を再生成（P2/P27 対策）

### Step 1-B: 実装状況テーブル更新

- [x] guidance-only / legacy 残置 / not-ready stub を含む現行実装状態へ実装状況テーブルを更新する

### Step 1-C: 関連タスクテーブル更新

- [x] `grep -rn "TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001" .claude/skills/aiworkflow-requirements/references/` で関連仕様書を検索
- [x] 検索結果の全仕様書で関連タスクテーブルを更新

### Step 2: システム仕様更新（新規インターフェース追加時のみ）

- [x] 新規インターフェース・アーキテクチャ変更がある場合、該当仕様書を更新
- [x] 変更がない場合は「変更なし」と明記（暗黙スキップ禁止）

### Step 2.5: discovery/index/mirror の same-wave 閉包

- [x] `resource-map.md` の Task08 row を今回の canonical set と同期する
- [x] `quick-reference.md` と `quick-reference-search-patterns.md` を今回の抽出導線と同期する
- [x] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行し、`topic-map.md` と `keywords.json` を再生成する
- [x] `.agents/skills/aiworkflow-requirements/` mirror に `SKILL.md` / `LOGS.md` / `indexes/` / `scripts/search-spec.js` を同期する
- [x] `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements` で mirror parity を確認する

### システム仕様同期先（固定リスト）

| 仕様書                                 | パス                                                                                          | 同期内容                                               |
| -------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| api-ipc-system-core                    | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                    | `AI_CHECK_CONNECTION` / `AI_INDEX` の current 契約同期 |
| llm-ipc-types                          | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`                          | preload / shared IPC type の current 契約同期          |
| rag-search-hybrid                      | `.claude/skills/aiworkflow-requirements/references/rag-search-hybrid.md`                      | `HybridRAGFactory` の not-ready / guidance 状態同期    |
| interfaces-rag-graphrag-query          | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-graphrag-query.md`          | `fallbackReason` と warn fallback の current 契約同期  |
| interfaces-rag-community-summarization | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-summarization.md` | embed failure warn + summary save 継続の同期           |
| rag-query-pipeline                     | `.claude/skills/aiworkflow-requirements/references/rag-query-pipeline.md`                     | GraphRAG / HybridRAG パイプライン同期                  |
| architecture-rag                       | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                       | RAG / graph / search アーキテクチャ同期                |
| task-workflow                          | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                          | タスク完了記録・残課題テーブル同期                     |
| lessons-learned-current                | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`                | 苦戦箇所・簡潔解決手順の記録                           |

### aiworkflow-requirements 抽出起点（今回タスクで必須）

| 参照資料                         | パス                                                                                            | 内容                                                                                                                                                                                     |
| -------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| workflow foundation              | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` | Task08 が継承すべき foundation 契約、current canonical set、後続タスク伝搬先を確認する                                                                                                   |
| resource-map                     | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                | Task08 専用 row `設計仕様（RAG runtime / AI_INDEX / Embedding / Extraction / Graph Summary）` と `設計同期（AI runtime/auth-mode unification）` から逆引きする                           |
| quick-reference                  | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                             | Task08 専用ショートカットから canonical spec の最短導線を確認する                                                                                                                        |
| quick-reference-search-patterns  | `.claude/skills/aiworkflow-requirements/indexes/quick-reference-search-patterns.md`             | `AI_INDEX` / `AI_CHECK_CONNECTION` / `entity extraction` / `relation extraction` / `graph summary` / `query classifier` / `GraphRAG` / `HybridRAG` / `CRAG` / `reranking` を分割検索する |
| interfaces-rag-search            | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`                    | GraphRAG / HybridRAG / CRAG / reranking の共通契約を確認する                                                                                                                             |
| interfaces-rag-graphrag-query    | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-graphrag-query.md`            | GraphRAG query service 契約を確認する                                                                                                                                                    |
| interfaces-rag-chunk-embedding   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-chunk-embedding.md`           | chunk / embedding 型と provider 境界を確認する                                                                                                                                           |
| interfaces-rag                   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag.md`                           | entity / relation extraction と GraphRAG の上位契約を確認する                                                                                                                            |
| interfaces-rag-entity-extraction | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-entity-extraction.md`         | `IEntityExtractor` と fallback 抽出器の契約を確認する                                                                                                                                    |
| interfaces-rag-community-summary | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-summarization.md`   | community summary 契約を確認する                                                                                                                                                         |
| api-internal-embedding           | `.claude/skills/aiworkflow-requirements/references/api-internal-embedding.md`                   | embedding API の request / response を確認する                                                                                                                                           |
| rag-search-hybrid                | `.claude/skills/aiworkflow-requirements/references/rag-search-hybrid.md`                        | HybridRAG 4 stage pipeline を確認する                                                                                                                                                    |
| rag-search-crag                  | `.claude/skills/aiworkflow-requirements/references/rag-search-crag.md`                          | CRAG evaluation / correction action を確認する                                                                                                                                           |

### 成果物

`outputs/phase-12/system-spec-update-summary.md`

## Task 3: ドキュメント更新履歴作成

- 更新した全仕様書の変更内容を記録する
- 各 Step の完了結果を詳細に記録する（漏れの可視化）
- **全 Step 確認前に「完了」と記載しない**（P4/P51 対策 — 事後記録のみ）

### 成果物

`outputs/phase-12/documentation-changelog.md`

## Task 4: 未タスク検出レポート作成

0 件でも出力必須。検出した未タスクは 3 ステップ全完了が必要（P3/P38 対策）:

1. `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/unassigned-task/` に指示書を作成
2. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` 残課題テーブルに登録
3. 関連仕様書に参照リンクを追加

### SF-03: 設計タスク特有の未タスク検出 4 パターン

| パターン                 | 候補の例                                   | 優先度 |
| ------------------------ | ------------------------------------------ | ------ |
| 型定義 → 実装            | capability matrix の runtime resolver 実装 | 高     |
| 契約 → テスト            | IPC 契約の統合テスト未作成                 | 中     |
| UI 仕様 → コンポーネント | status row / guidance UI 未実装            | 中     |
| 仕様書間差異 → 設計決定  | 仕様間の矛盾残存                           | 高     |

### 成果物

`outputs/phase-12/unassigned-task-detection.md`

## Task 5: スキルフィードバックレポート作成

改善点なしでも出力必須（P28 対策）。以下の観点で記録する:

- ワークフロー改善点
- スキル設計パターンの改善点
- ツール・スクリプトの改善点

### 成果物

`outputs/phase-12/skill-feedback-report.md`

## Task 6: Phase 12 準拠チェック

Task 1-5 の全完了を確認するチェックリスト。全項目 PASS でなければ Phase 12 は完了としない。

### 成果物

`outputs/phase-12/phase12-task-spec-compliance-check.md`

## Phase 10 MINOR 追跡テーブル

Phase 10 で MINOR 判定された指摘は全て未タスク仕様書に変換する（省略不可）。

| MINOR ID                  | 指摘内容 | 未タスク化状況 | 指示書パス |
| ------------------------- | -------- | -------------- | ---------- |
| （Phase 10 実行後に記録） | —        | —              | —          |

## 参照資料

| 参照資料                    | パス                                                                      | 内容                                                  |
| --------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------- |
| Phase 1（要件定義）         | `phase-1-requirements.md`                                                 | 依存する前提成果物を確認する                          |
| Phase 2（設計）             | `phase-2-design.md`                                                       | 依存する前提成果物を確認する                          |
| Phase 5（実装）             | `phase-5-implementation.md`                                               | 実装対象と capability 変更点を確認する                |
| Phase 6（テスト拡充）       | `phase-6-test-expansion.md`                                               | 回帰拡張内容を確認する                                |
| Phase 7（カバレッジ確認）   | `phase-7-coverage-check.md`                                               | critical path coverage を確認する                     |
| Phase 8（リファクタリング） | `phase-8-refactoring.md`                                                  | job / service 境界整理を確認する                      |
| Phase 9（品質検証）         | `phase-9-quality-assurance.md`                                            | silent fallback / partial failure 観点を確認する      |
| Phase 10（最終レビュー）    | `phase-10-final-review.md`                                                | release 判定の前提を確認する                          |
| Phase 11（手動テスト）      | `phase-11-manual-test.md`                                                 | 依存する前提成果物を確認する                          |
| aiHandlers                  | `apps/desktop/src/main/ipc/aiHandlers.ts`                                 | `AI_CHECK_CONNECTION` / `AI_INDEX` の TODO を確認する |
| communityHandlers           | `apps/desktop/src/main/ipc/communityHandlers.ts`                          | community summary mock の現状を確認する               |
| graphrag-query-service      | `packages/shared/src/services/search/graphrag-query-service.ts`           | GraphRAG query の runtime 依存を確認する              |
| relevance-evaluator         | `packages/shared/src/services/search/crag/relevance-evaluator.ts`         | CRAG relevance evaluator の runtime 依存を確認する    |
| cross-encoder-reranker      | `packages/shared/src/services/search/reranking/cross-encoder-reranker.ts` | reranking の runtime 依存を確認する                   |

### システム仕様（aiworkflow-requirements）

> system spec 更新前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                               | パス                                                                                          | 内容                                               |
| -------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| api-ipc-system-core                    | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                    | `AI_CHECK_CONNECTION` / `AI_INDEX` の current 正本 |
| llm-ipc-types                          | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`                          | preload / shared IPC 型の正本                      |
| rag-search-hybrid                      | `.claude/skills/aiworkflow-requirements/references/rag-search-hybrid.md`                      | HybridRAG / GraphRAG 検索ルールの正本              |
| interfaces-rag-graphrag-query          | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-graphrag-query.md`          | GraphRAG query fallback 契約の正本                 |
| interfaces-rag-community-summarization | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-summarization.md` | community summary 契約の正本                       |
| architecture-rag                       | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                       | RAG / graph / search 正本                          |
| rag-query-pipeline                     | `.claude/skills/aiworkflow-requirements/references/rag-query-pipeline.md`                     | GraphRAG / HybridRAG の正本                        |

## 実行手順

### ステップ 1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、RAG / AI_INDEX / Embedding / Extraction / Graph Summary の runtime ルールの対象範囲を固定する。

### ステップ 2: Task 1-6 を順に実施する

Task 番号順に処理し、順序を崩さずに成果物へ反映する。各 Task の完了条件を満たしてから次の Task に進む。

### ステップ 3: Step 2.5 の same-wave 閉包を完了する

`resource-map.md` / `quick-reference.md` / `quick-reference-search-patterns.md` / `topic-map.md` / `keywords.json` と `.agents` mirror parity を同一 wave で閉じる。

### ステップ 4: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ 5: planned wording 残存確認

以下のコマンドで planned wording が残存していないことを確認する:

```bash
rg -n "仕様策定のみ|実行予定|保留として記録" \
  docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/outputs/phase-12/ || echo "planned wording なし"
```

### ステップ 6: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 成果物

| 成果物               | パス                                                     | 内容                                            |
| -------------------- | -------------------------------------------------------- | ----------------------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`               | Part 1（中学生レベル）と Part 2（技術者レベル） |
| 仕様同期サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A/1-B/1-C/Step 2 の結果                  |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`            | 仕様書更新履歴（全 Step 完了後に事後記録）      |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md`          | 残件 formalize（0 件でも出力必須）              |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`              | 改善観点記録（改善点なしでも出力必須）          |
| 準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 1-5 の全完了確認                           |

## 完了条件

- [x] Task 1-6 が全て完了している
- [x] spec sync 先が current canonical set（RAG / graph / IPC types / summary contracts）まで定義されている
- [x] planned wording が残存していない
- [x] LOGS.md が 2 ファイル（aiworkflow-requirements + task-specification-creator）とも更新されている
- [x] `resource-map.md` / `quick-reference.md` / `quick-reference-search-patterns.md` / `topic-map.md` / `keywords.json` が same-wave で同期されている
- [x] `.agents/skills/aiworkflow-requirements/` との mirror parity が確認されている
- [x] 未タスク検出で SF-03 4 パターンが確認されている
- [x] Phase 10 MINOR 指摘が全て未タスク仕様書に変換されている
- [x] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

Phase 12 を並列エージェントで分担する場合の注意事項:

- 仕様書更新は 3 ファイル以下/エージェントに分割する（P43 対策）
- LOGS.md への「完了」記録は全ファイル更新後の最終ステップとする
- documentation-changelog.md は全 Task 完了後に 1 つのエージェントが一括作成する（P59 対策）
- 完了後は `git diff --stat -- .claude/skills/` で実際の変更ファイルを確認する

## タスク 100% 実行確認【必須】

本 Phase の全タスク（Task 1-6）は省略・先送り不可。以下を最終確認すること:

- [x] Task 1: implementation-guide.md が Part 1 + Part 2 の 2 部構成で作成されている
- [x] Task 2: system-spec-update-summary.md に Step 1-A/1-B/1-C/Step 2 の結果が記録されている
- [x] Task 3: documentation-changelog.md に全 Step の完了結果が事後記録されている
- [x] Task 4: unassigned-task-detection.md に SF-03 4 パターンの確認結果が記録されている
- [x] Task 5: skill-feedback-report.md が作成されている
- [x] Task 6: phase12-task-spec-compliance-check.md で Task 1-6 全 PASS が確認されている

## 次のPhase

- [Phase 13（PR作成）](./phase-13-pr-creation.md) に進む
