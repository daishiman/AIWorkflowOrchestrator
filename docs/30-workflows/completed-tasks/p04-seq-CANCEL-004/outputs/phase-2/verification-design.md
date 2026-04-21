# Phase 2: 検証設計書

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| タスクID   | TASK-SW-CANCEL-004 |
| Phase      | 2                  |
| 作成日     | 2026-04-20         |
| ステータス | completed          |

## 目的

既存 `useCancelGeneration.ts` を **どう検証するか** と **どの条件でのみ補正を許可するか** を定義する。fire-and-forget 前提は採用せず `await + try/catch` を current contract として固定する。

## 1. Current Contract の固定

| 項目            | contract                                                                      |
| --------------- | ----------------------------------------------------------------------------- |
| 戻り値型        | `Promise<void>`                                                               |
| 実行順序        | `abort → ref clear → setStage("cancelled") → IPC await → catch swallow`       |
| IPC 失敗扱い    | `try/catch` で握りつぶし、UI へ伝播させない                                   |
| start 前 cancel | クラッシュさせない（`abortControllerRef.current?.abort()` の optional chain） |
| 並列呼び出し    | 冪等。2回目以降の cancel は無害                                               |

## 2. 4層確認設計

| 層       | 対象                                                     | 確認方法                              | 成功条件                                                                    |
| -------- | -------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------- |
| shared   | `packages/shared/src/ipc/channels.ts`                    | `SKILL_CREATOR_CANCEL` 定数の存在確認 | 定数 `"skill-creator:cancel"` が export されていること                      |
| preload  | `apps/desktop/src/preload/skill-creator-api.ts`          | 型宣言 / 実装 / whitelist 確認        | `cancelGeneration: () => Promise<IpcResult<void>>` が expose されていること |
| main     | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`      | handler 登録 / 解除確認               | `ipcMain.handle` / `removeHandler` 双方で `SKILL_CREATOR_CANCEL` を扱うこと |
| renderer | `apps/desktop/src/renderer/hooks/useCancelGeneration.ts` | 実装順序・型・catch swallow 確認      | contract 通りの 5ステップ順序が保たれていること                             |

## 3. Phase 4-12 の責務固定

| Phase | 責務              | 主作業                              |
| ----- | ----------------- | ----------------------------------- |
| 4     | 既存テスト棚卸し  | AC ↔ 既存テスト対応表作成           |
| 5     | diff check        | current fact と contract の一致確認 |
| 6     | targeted 追加判定 | IPC failure swallow の補強要否判定  |
| 7     | カバレッジ確認    | 回帰観点の網羅確認                  |
| 8     | 整流化            | コメント/識別子 drift 確認          |
| 9     | 品質保証          | focused test / typecheck / lint     |
| 10    | 最終レビュー      | AC / 4条件 / 4層整合                |
| 11    | 手動テスト        | NON_VISUAL 証跡3点セット            |
| 12    | ドキュメント更新  | 6成果物 + parity + same-wave sync   |

## 4. 証跡戦略

- **主証跡**: Phase 9 の focused test 実行結果 + Phase 4-5 の diff check
- **副証跡**: 4層接続確認の grep 結果
- **スクリーンショット**: NON_VISUAL のため **不要**（明示固定）
- **Phase 12 root evidence**: `phase12-task-spec-compliance-check.md`

## 5. 補正許可条件

以下のいずれかを満たす場合のみ、既存コードへの最小補正を許可する。

1. current contract（実行順序、catch swallow）と実装が一致しない mismatch が発見された
2. `useCancelGeneration.test.ts` に targeted ケース追加が必要と Phase 6 で判定された

それ以外の refactor / 美化 / 過剰な拡張は本 workflow で禁止する。

## 6. 設計 結論

- `await + try/catch` で Phase 2 / 4 / 5 / 6 を貫通
- NON_VISUAL / verify_existing / parity の3点で整合
- 新規実装は一切発生しない
