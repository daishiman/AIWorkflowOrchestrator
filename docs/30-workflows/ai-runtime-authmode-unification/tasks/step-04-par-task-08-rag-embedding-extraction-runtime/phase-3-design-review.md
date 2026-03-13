# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 3                                                |
| Phase名    | 設計レビュー                                     |
| タスクID   | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001 |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）             |
| 後続Phase  | Phase 4（テスト作成）                            |
| ステータス | not_started                                      |
| 作成日     | 2026-03-13                                       |
| 機能名     | rag-embedding-extraction-runtime                 |

## 目的

backend AI surface の capability 設計が矛盾なく流用できるか確認する。

## 実行タスク

- レビュー実施: レビュー観点に沿って PASS、MINOR、MAJOR の判定根拠を整理する

## レビュー観点

- surface ごとの capability 区分が曖昧でないか
- production mock / TODO が残ったまま成功経路に入らないか
- terminal surface や consumer subscription への silent fallback が紛れ込まないか
- long-running index job の失敗と guidance が不足していないか

## レビューゲート

設計レビュー の判定基準は .claude/skills/task-specification-creator/references/review-gate-criteria.md に従う。

| 判定  | 条件                     | 次のアクション         |
| ----- | ------------------------ | ---------------------- |
| PASS  | 重大な問題がない         | Phase 4 に進む         |
| MINOR | 軽微な指摘がある         | 指摘を記録して次へ進む |
| MAJOR | 戻り先が必要な問題がある | 下表の戻り先へ戻す     |

| 問題の種類 | 戻り先              |
| ---------- | ------------------- |
| 要件の問題 | Phase 1（要件定義） |
| 設計の問題 | Phase 2（設計）     |

## 参照資料

| 参照資料            | パス                                                          | 内容                                                  |
| ------------------- | ------------------------------------------------------------- | ----------------------------------------------------- |
| Phase 1（要件定義） | `phase-1-requirements.md`                                     | 依存する前提成果物を確認する                          |
| Phase 2（設計）     | `phase-2-design.md`                                           | 依存する前提成果物を確認する                          |
| aiHandlers          | `apps/desktop/src/main/ipc/aiHandlers.ts`                     | `AI_CHECK_CONNECTION` / `AI_INDEX` の TODO を確認する |
| communityHandlers   | `apps/desktop/src/main/ipc/communityHandlers.ts`              | community summary mock の現状を確認する               |
| embedding-service   | `packages/shared/src/services/embedding/embedding-service.ts` | embedding 実行サービスを確認する                      |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料           | パス                                                                      | 内容                                           |
| ------------------ | ------------------------------------------------------------------------- | ---------------------------------------------- |
| api-ipc-system     | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`     | `AI_CHECK_CONNECTION` / `AI_INDEX` の正本      |
| llm-embedding      | `.claude/skills/aiworkflow-requirements/references/llm-embedding.md`      | embedding provider / pipeline 契約の正本       |
| architecture-rag   | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`   | RAG / graph / search 正本                      |
| rag-services       | `.claude/skills/aiworkflow-requirements/references/rag-services.md`       | classifier / extraction / community 関連の正本 |
| rag-query-pipeline | `.claude/skills/aiworkflow-requirements/references/rag-query-pipeline.md` | GraphRAG / HybridRAG の正本                    |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、RAG / AI_INDEX / Embedding / Extraction / Graph Summary の runtime ルール の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

設計レビュー の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

AI_INDEX、check connection、embedding、query classifier、extraction、graph summary の設計が Phase 1 と Phase 2 に整合するかをレビューする。

## 成果物

| 成果物           | パス                                      | 内容                                    |
| ---------------- | ----------------------------------------- | --------------------------------------- |
| 設計レビュー報告 | `outputs/phase-3/design-review-report.md` | PASS、MINOR、MAJOR の判定根拠を記録する |

## 完了条件

- [ ] MAJOR 指摘 0 件
- [ ] Task01 契約との矛盾がない

## 次のPhase

- [Phase 4（テスト作成）](./phase-4-test-creation.md) に進む
