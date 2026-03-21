# Skill Creator public IPC wiring 統合タスク

| 項目       | 値                                                                |
| ---------- | ----------------------------------------------------------------- |
| タスクID   | UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001                       |
| 優先度     | 高                                                                |
| 依存       | TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001                     |
| 関連タスク | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-IMPLEMENTATION-CLOSURE-001 |

---

## 目的

internal `creatorHandlers.ts` の capability bridge を、実アプリの public `skill-creator:*` IPC / preload surface と矛盾なく接続する。

## 背景

- `apps/desktop/src/main/ipc/creatorHandlers.ts` は `ExecutionCapabilityInput` 正規化と `RuntimeSkillCreatorFacade` 呼び出しを実装済み
- しかし `apps/desktop/src/main/ipc/index.ts` が登録しているのは依然 `registerSkillCreatorHandlers` であり、public preload 契約も `apps/desktop/src/preload/channels.ts` の `skill-creator:*` が正本
- このままでは internal adapter 実装が public surface から到達できず、system spec に過大申告が起きやすい

## 実行範囲

1. `creatorHandlers.ts` と `skillCreatorHandlers.ts` の責務を整理する
2. `ipc/index.ts` の登録点を current contract に合わせて統一する
3. `preload/channels.ts` / preload API / system spec を実装実体へ同期する
4. integration / validation test を追加して public surface から capability bridge へ到達することを証明する

## 実行手順

1. `skillCreatorHandlers.ts` と `creatorHandlers.ts` の channel・payload・戻り値・エラー契約を比較する
2. public surface を維持するか internal `creator:*` へ寄せるかを決め、移行方針を固定する
3. `ipc/index.ts`、`preload/channels.ts`、必要な preload API を更新する
4. `api-ipc-*` / `interfaces-*` / workflow spec / lessons を same-wave sync する
5. public channel 経由の integration test と double-registration guard を追加する

## 完了条件

- [ ] public Skill Creator IPC surface から capability bridge が利用される
- [ ] `ipc/index.ts` / preload / system spec の contract drift が解消される
- [ ] internal adapter と public contract の責務が 1 つの current path に整理される
- [ ] integration test と system spec が current implementation を過大申告しない
