# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                 |
| ---------- | ------------------------------------------------------------------------------------ |
| Phase      | 5                                                                                    |
| Phase名    | 実装                                                                                 |
| タスクID   | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001                                     |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 3（設計レビュー）、Phase 4（テスト作成） |
| 後続Phase  | Phase 6（テスト拡充）                                                                |
| ステータス | not_started                                                                          |
| 作成日     | 2026-03-13                                                                           |
| 機能名     | rag-embedding-extraction-runtime                                                     |

## 目的

実装順序と変更境界を具体化する。

## 実行タスク

- Main 側整理: `AI_CHECK_CONNECTION` / `AI_INDEX` / community summary の変更順序を定義する
- shared 側整理: embedding / classifier / extraction / graph summary の変更順序を定義する
- 失敗系整理: unsupported capability / job failure / provider failure の反映順序を定義する

## 参照資料

| 参照資料              | パス                                                                    | 内容                                  |
| --------------------- | ----------------------------------------------------------------------- | ------------------------------------- |
| Phase 2（設計）       | `phase-2-design.md`                                                     | 変更順序の前提を確認する              |
| Phase 4（テスト作成） | `phase-4-test-creation.md`                                              | 実装前の test matrix を確認する       |
| aiHandlers            | `apps/desktop/src/main/ipc/aiHandlers.ts`                               | Main 側変更点を確認する               |
| embedding-pipeline    | `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts` | embedding pipeline の変更点を確認する |
| hybrid-rag-factory    | `packages/shared/src/services/search/hybrid-rag-factory.ts`             | search runtime 組み立て点を確認する   |

## 統合テスト連携

Main、shared pipeline、IPC を跨ぐ capability matrix と guidance の変更順序を固定する。

## 成果物

| 成果物   | パス                                     | 内容                                           |
| -------- | ---------------------------------------- | ---------------------------------------------- |
| 実装計画 | `outputs/phase-5/implementation-plan.md` | 変更順序、影響範囲、ロールバック観点を整理する |

## 完了条件

- [ ] Main / shared / IPC の変更順序が定義されている

## 次のPhase

- [Phase 6（テスト拡充）](./phase-6-test-expansion.md) に進む
