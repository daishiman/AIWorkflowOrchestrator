# Phase 1: 要件定義書

## メタ情報

| 項目                | 内容                               |
| ------------------- | ---------------------------------- |
| タスクID            | TASK-SW-CANCEL-004                 |
| 機能名              | skill-creator-cancel-renderer-hook |
| taskType            | NON_VISUAL                         |
| implementation_mode | verify_existing                    |
| chain_id            | CANCEL                             |
| chain_position      | 4 / 4                              |
| 作成日              | 2026-04-20                         |
| ステータス          | completed                          |

## 目的

`apps/desktop/src/renderer/hooks/useCancelGeneration.ts` の Renderer 側キャンセル処理が、既に4層 IPC 接続および `abort -> ref clear -> setStage("cancelled") -> IPC await -> catch swallow` contract を満たしていることを **既存実装の検証（verify_existing）** として固定する。新規実装は対象外。

## 受け入れ基準（AC）

| ID   | 内容                                                                                                                                 | 判定 |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| AC-1 | workflow 本文が `implementation_mode: verify_existing` と NON_VISUAL 判定に整合している                                              | 合格 |
| AC-2 | Phase 4-5 が新規実装前提ではなく、既存コード・既存テストの検証導線として再定義されている                                             | 合格 |
| AC-3 | Phase 11 が `manual-test-result.md` / `manual-test-checklist.md` / `discovered-issues.md` を主証跡とする NON_VISUAL 仕様になっている | 合格 |
| AC-4 | Phase 12 が 6成果物、Step 1-A〜1-C / Step 2 条件分岐、`artifacts.json` / `outputs/artifacts.json` parity を明記している              | 合格 |
| AC-5 | workflow 全体が矛盾なし・漏れなし・整合性あり・依存関係整合の4条件を満たす                                                           | 合格 |

## 前提条件

- 依存タスク `TASK-SW-CANCEL-003`（main 層 IPC handler）が完了済みであること
- CANCEL chain の 4/4（最終接続確認）であること
- `packages/shared/src/ipc/channels.ts` の `SKILL_CREATOR_CANCEL` が定義済みであること
- `apps/desktop/src/preload/skill-creator-api.ts` に `cancelGeneration` surface が存在すること
- `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` に handler が登録済みであること

## 除外事項

- 新規 Hook 実装
- 新規テストファイル新設（既存ファイルへの targeted 追加のみ許可）
- `TASK-SW-CANCEL-001〜003` の再設計
- commit / push / PR 作成

## P50 チェック結果

| 項目                                | 結果                                                              |
| ----------------------------------- | ----------------------------------------------------------------- |
| `useCancelGeneration.ts` 存在確認   | 存在（45行）                                                      |
| `cancelGeneration()` 実装確認       | 実装済（`Promise<void>`）                                         |
| `SKILL_CREATOR_CANCEL` channel 確認 | `packages/shared/src/ipc/channels.ts:200`                         |
| preload API surface 確認            | `apps/desktop/src/preload/skill-creator-api.ts:396, 726`          |
| main handler 確認                   | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts:689, 693, 750` |
| 既存テスト確認                      | `__tests__/useCancelGeneration.test.ts`（6 ケース）               |

## 結論

`verify_existing` 前提での検証が妥当。既存実装・テストは contract を満たす。以降 Phase は **差分確認と証跡生成** を主軸に進行する。
