# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 1                                                |
| Phase名    | 要件定義                                         |
| タスクID   | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001 |
| 前提Phase  | なし（Task01 Phase 3 PASS が前提）               |
| 後続Phase  | Phase 2（設計）                                  |
| ステータス | not_started                                      |
| 作成日     | 2026-03-13                                       |
| 更新日     | 2026-03-19                                       |
| 機能名     | rag-embedding-extraction-runtime                 |

## 目的

backend AI surface（RAG / AI_INDEX / Embedding / Extraction / Graph Summary / CRAG / Reranking）の capability と gap を整理し、Integrated API Runtime として動作させるための要件を定義する。

## 実行タスク

- P50チェック（既実装状態の調査）: 対象ファイルの `git log` と現在のコードを確認し、既に runtime 対応が実装済みかどうかを判定する
- inventory 整理: `AI_CHECK_CONNECTION`、`AI_INDEX`、embedding service / pipeline、classifier、extraction、graph summary、GraphRAG、HybridRAG factory / engine、CRAG、reranking の current path を整理する
- runtime capability 分類: 各 surface を `api-key-only` / `guidance-only` / `not-in-scope` で分類する
- implementation status 分類: 各 surface を `implemented` / `mock` / `todo` で分類する
- gap 整理: silent fallback、long-running job 失敗、guidance 不足、production mock の 4 パターンで gap を列挙する
- 受入基準作成: 各要件に対して番号付きの検証可能な受入基準を定義する
- FR/NFR 分類: 機能要件と非機能要件を分類し優先度を設定する

## 参照資料

### ソースコード

| 参照資料               | パス                                                                      | 内容                                                   |
| ---------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------ |
| aiHandlers             | `apps/desktop/src/main/ipc/aiHandlers.ts`                                 | `AI_CHECK_CONNECTION` / `AI_INDEX` の TODO を確認する  |
| communityHandlers      | `apps/desktop/src/main/ipc/communityHandlers.ts`                          | community summary mock の現状を確認する                |
| embedding-service      | `packages/shared/src/services/embedding/embedding-service.ts`             | embedding 実行サービスを確認する                       |
| embedding-pipeline     | `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts`   | batch / retry / persistence を含む pipeline を確認する |
| openai-provider        | `packages/shared/src/services/embedding/providers/openai-provider.ts`     | API key 前提の provider を確認する                     |
| qwen3-provider         | `packages/shared/src/services/embedding/providers/qwen3-provider.ts`      | 追加 provider の capability と key 前提を確認する      |
| llm-query-classifier   | `packages/shared/src/services/search/llm-query-classifier.ts`             | query classifier の LLM 依存を確認する                 |
| entity-extractor       | `packages/shared/src/services/extraction/entity-extractor.ts`             | entity extraction の runtime 依存を確認する            |
| relation-extractor     | `packages/shared/src/services/extraction/relation-extractor.ts`           | relation extraction の runtime 依存を確認する          |
| community-summarizer   | `packages/shared/src/services/graph/community-summarizer.ts`              | graph summary の runtime 依存を確認する                |
| graphrag-query-service | `packages/shared/src/services/search/graphrag-query-service.ts`           | GraphRAG query の runtime 依存を確認する               |
| hybrid-rag-engine      | `packages/shared/src/services/search/hybrid-rag-engine.ts`                | HybridRAG 実行と rerank / CRAG handoff を確認する      |
| hybrid-rag-factory     | `packages/shared/src/services/search/hybrid-rag-factory.ts`               | HybridRAG の組み立て点を確認する                       |
| relevance-evaluator    | `packages/shared/src/services/search/crag/relevance-evaluator.ts`         | CRAG relevance evaluator の runtime 依存を確認する     |
| cross-encoder-reranker | `packages/shared/src/services/search/reranking/cross-encoder-reranker.ts` | reranking の runtime 依存を確認する                    |

### システム仕様（aiworkflow-requirements）

> Phase 開始前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                         | パス                                                                                    | 内容                                                    |
| -------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| api-ipc-system                   | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                   | `AI_CHECK_CONNECTION` / `AI_INDEX` の正本               |
| api-ipc-system-core              | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`              | `AI_CHECK_CONNECTION` legacy 方針と `AI_INDEX` job 契約 |
| interfaces-llm                   | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                   | embedding / chat 周辺の正本                             |
| llm-embedding                    | `.claude/skills/aiworkflow-requirements/references/llm-embedding.md`                    | embedding provider / pipeline 契約の正本                |
| architecture-rag                 | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                 | RAG / graph / search 正本                               |
| interfaces-rag                   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag.md`                   | entity / relation extraction と GraphRAG の上位契約     |
| interfaces-rag-entity-extraction | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-entity-extraction.md` | `IEntityExtractor` と fallback 抽出器の契約             |
| rag-services                     | `.claude/skills/aiworkflow-requirements/references/rag-services.md`                     | classifier / extraction / community 関連の正本          |
| rag-query-pipeline               | `.claude/skills/aiworkflow-requirements/references/rag-query-pipeline.md`               | GraphRAG / HybridRAG の正本                             |
| error-handling                   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                   | fail-fast / explicit error propagation の正本           |
| security-electron-ipc            | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`            | IPC 入力検証、秘密情報非露出、guidance-only 契約        |
| quality-requirements             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`             | silent fallback 排除、coverage、品質ゲート基準          |

### aiworkflow-requirements 抽出起点

| 参照資料                         | パス                                                                                            | 内容                                                                                                                                                                                     |
| -------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| workflow foundation              | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` | foundation 契約、current canonical set、Task08 への伝搬方針を確認する                                                                                                                    |
| resource-map                     | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                | Task08 専用 row `設計仕様（RAG runtime / AI_INDEX / Embedding / Extraction / Graph Summary）` と `設計同期（AI runtime/auth-mode unification）` から逆引きする                           |
| quick-reference                  | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                             | Task08 専用ショートカットから canonical spec の最短導線を確認する                                                                                                                        |
| quick-reference-search-patterns  | `.claude/skills/aiworkflow-requirements/indexes/quick-reference-search-patterns.md`             | `AI_INDEX` / `AI_CHECK_CONNECTION` / `entity extraction` / `relation extraction` / `graph summary` / `query classifier` / `GraphRAG` / `HybridRAG` / `CRAG` / `reranking` を分割検索する |
| interfaces-rag-search            | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`                    | GraphRAG / HybridRAG / CRAG / reranking の共通契約を確認する                                                                                                                             |
| interfaces-rag-graphrag-query    | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-graphrag-query.md`            | GraphRAG query service 契約を確認する                                                                                                                                                    |
| interfaces-rag-chunk-embedding   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-chunk-embedding.md`           | chunk / embedding 型と provider 境界を確認する                                                                                                                                           |
| interfaces-rag-community-summary | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-summarization.md`   | community summary 契約を確認する                                                                                                                                                         |
| api-internal-embedding           | `.claude/skills/aiworkflow-requirements/references/api-internal-embedding.md`                   | embedding API の request / response を確認する                                                                                                                                           |
| rag-search-hybrid                | `.claude/skills/aiworkflow-requirements/references/rag-search-hybrid.md`                        | HybridRAG 4 stage pipeline を確認する                                                                                                                                                    |
| rag-search-crag                  | `.claude/skills/aiworkflow-requirements/references/rag-search-crag.md`                          | CRAG evaluation / correction action を確認する                                                                                                                                           |

### パック横断資料

| 参照資料          | パス                                                                                                     | 内容                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| pack parent index | `docs/30-workflows/ai-runtime-authmode-unification/index.md`                                             | 実行順序、依存グラフ、共通方針の正本を確認する                                |
| pack design audit | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md`                               | 多角的監査の結論、禁止事項、依存整合を確認する                                |
| pack UI/UX 正本   | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                                 | 全 surface 共通の状態、CTA、microcopy 契約                                    |
| Task01 foundation | `docs/30-workflows/TASK-FIX-SKILL-DOCS-SPEC-FOUNDATION/task-05-phase-1-3-source-investigation-report.md` | access matrix / resolver / fail-fast / terminal boundary の現行調査結果を継承 |

## 実行手順

### ステップ0: P50チェック - 既実装状態の調査（必須）

Phase 1 開始時に、対象ファイルの現在の実装状態を確認する。

```bash
# 対象ファイルの最近のコミット履歴を確認
git log --oneline -10 -- apps/desktop/src/main/ipc/aiHandlers.ts
git log --oneline -10 -- packages/shared/src/services/embedding/
git log --oneline -10 -- packages/shared/src/services/search/
git log --oneline -10 -- packages/shared/src/services/extraction/
git log --oneline -10 -- packages/shared/src/services/graph/

# TODO / mock / stub の残存を確認
grep -rn "TODO\|FIXME\|mock\|stub\|placeholder" \
  apps/desktop/src/main/ipc/aiHandlers.ts \
  apps/desktop/src/main/ipc/communityHandlers.ts \
  packages/shared/src/services/embedding/ \
  packages/shared/src/services/search/ \
  packages/shared/src/services/extraction/ \
  packages/shared/src/services/graph/
```

既に runtime 対応が実装済みの場合は Phase 4-5 を「検証・補完」モードに切り替える。

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提条件（Task01 Phase 3 PASS）、system spec を確認し、対象範囲を固定する。

### ステップ2: inventory と capability を整理する

実行タスクを上から順に処理し、以下のフォーマットで capability inventory を作成する。

| surface             | current path         | runtime capability | implementation status | gap パターン     | 備考 |
| ------------------- | -------------------- | ------------------ | --------------------- | ---------------- | ---- |
| AI_CHECK_CONNECTION | aiHandlers.ts        | guidance-only      | todo                  | guidance 不足    | ...  |
| AI_INDEX            | aiHandlers.ts        | api-key-only       | todo                  | long-running job | ...  |
| embedding           | embedding-service.ts | api-key-only       | implemented           | -                | ...  |
| ...                 | ...                  | ...                | ...                   | ...              | ...  |

### ステップ3: 受入基準を番号付きで定義する

| AC-ID | 受入基準                                                                              | 検証方法                                                        |
| ----- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| AC-01 | backend AI surface ごとの runtime capability / implementation status が列挙されている | capability inventory table の行数 >= 10                         |
| AC-02 | production mock / TODO が後続設計へ割り当てられている                                 | gap パターン列が「mock」「todo」の行が全て後続 Phase 参照を持つ |
| AC-03 | terminal surface への silent fallback が存在しない                                    | grep で fallback / terminal 参照がないことを確認                |
| AC-04 | FR/NFR が分類されている                                                               | FR/NFR テーブルに分類漏れがない                                 |

### ステップ4: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ5: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

AI_INDEX、check connection、embedding、query classifier、extraction、graph summary、CRAG、reranking の接続要件を要件として明文化する。backend AI surface は terminal surface への fallback を持たないため、API runtime 接続が唯一の実行経路であることを確認する。

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                            | 仕様参照先                                          |
| ------------------ | ----------------------------------- | --------------------------------------------------- |
| セキュリティ       | API key 管理が関係するため適用      | `aiworkflow-requirements: security-api-electron.md` |
| アーキテクチャ     | RAG pipeline 構造変更のため適用     | `aiworkflow-requirements: architecture-rag.md`      |
| API設計            | IPC handler 変更のため適用          | `aiworkflow-requirements: api-ipc-system.md`        |
| エラーハンドリング | fail-fast / guidance 設計のため適用 | `aiworkflow-requirements: error-handling.md`        |
| パフォーマンス     | long-running job 管理のため適用     | `aiworkflow-requirements: architecture-rag.md`      |

## 成果物

| 成果物       | パス                                         | 内容                                                  |
| ------------ | -------------------------------------------- | ----------------------------------------------------- |
| 要件整理     | `outputs/phase-1/requirements-definition.md` | capability inventory、FR/NFR 分類、受入基準を整理する |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象範囲、除外範囲、terminal 非対応ポリシーを明記する |

## 完了条件

- [ ] AC-01: backend AI surface ごとの runtime capability / implementation status が GraphRAG / HybridRAG / CRAG / reranking まで列挙されている
- [ ] AC-02: production mock / TODO / unsupported capability が後続設計へ割り当てられている
- [ ] AC-03: terminal surface への silent fallback が要件に含まれていない
- [ ] AC-04: FR/NFR が分類され優先度が設定されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. P50チェック（既実装状態の調査）
2. 参照資料の確認（ソースコード + システム仕様 + パック横断資料）
3. inventory 整理と capability 分類
4. gap 整理（4パターン）
5. 受入基準作成（番号付き）
6. FR/NFR 分類
7. 統合テスト連携の要件明文化
8. 成果物の作成・配置
9. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime --phase 1
```

## 次のPhase

- [Phase 2（設計）](./phase-2-design.md) に進む
- Phase 1-3 完了前に Phase 4 へは進まない
