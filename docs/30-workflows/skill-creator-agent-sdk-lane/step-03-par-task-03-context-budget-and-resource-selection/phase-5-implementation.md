# Phase 5: 実装

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 5                                     |
| 機能名 | context-budget-and-resource-selection |
| 作成日 | 2026-03-26                            |

## 目的

source resolver、resource planner、resolved reader の実装対象と変更順を確定する。

## 実行タスク

- source resolver の実装対象を定義する
- resource reader / adapter の境界を定義する
- budget / provenance / degrade の保持場所を定義する
- DI / wiring の変更順を定義する

## 参照資料

| 資料名              | パス                             | 説明                               |
| ------------------- | -------------------------------- | ---------------------------------- |
| Phase 1 要件        | `phase-1-requirements.md`        | source discovery / provenance 要件 |
| Phase 2 設計        | `phase-2-design.md`              | source / budget / degrade 設計     |
| Phase 4 test matrix | `outputs/phase-4/test-matrix.md` | 実装で守る回帰観点                 |

## 想定変更ポイント

- `apps/desktop/src/main/services/skill/ResourceLoader.ts`
- `apps/desktop/src/main/services/skill/constants.ts`
- `apps/desktop/src/main/ipc/index.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/services/runtime/planPromptConstants.ts`
- `packages/shared/src/types/skillCreator.ts`（public IPC shape は不変、shared provenance 型が本当に必要な場合のみ）
- 新規 `SkillCreatorSourceResolver` / `PhaseResourcePlanner` / `ResolvedResourceReader` 相当の定義

## 実装しないこと

- UI question flow の詳細
- verify / improve 結果表示
- governance / handoff rule
- session invalidation semantics の最終決定
- `ManifestLoader` の validate / normalize 契約の再設計

## 実装順

1. source root 候補列と structure validation を切り出す
2. `LoadedWorkflowManifest` を consume する `ResolvedResourceReader` を追加し、`ResourceLoader` は single-root adapter として残す
3. `WorkflowManifestPhase.resourceIds` を起点にした phase resource planner を導入する
4. budget / degrade / provenance extension snapshot を facade / engine input へ接続する

## 統合テスト連携

- Phase 4 の `test-matrix.md` を基準に unit / integration suite を実装する。
- Phase 6 で multi-root conflict と structure drift の edge case を追加できるよう、error code を安定化する。

## 成果物

| 成果物   | パス                        | 説明                 |
| -------- | --------------------------- | -------------------- |
| 実装計画 | `phase-5-implementation.md` | 実装対象と順序の本文 |

## 実装完了の判断

- source / select / budget / degrade / provenance の 5 つを別責務として説明できる
- Task04 と独立して進められる write scope になっている
- `DEFAULT_SKILL_CREATOR_PATH` が唯一の正本でなくなっている
- `ResourceLoader` が source authority ではなく leaf reader に留まっている

## 完了条件

- [ ] source / select / budget / degrade / provenance の対象が定義されている
- [ ] 想定変更ポイントと非対象が明記されている
- [ ] single-root 前提から multi-root 前提への移行順がある
- [ ] **本Phase内の全タスクを100%実行完了**
