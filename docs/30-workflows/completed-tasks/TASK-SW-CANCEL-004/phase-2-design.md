# Phase 2: 設計

## メタ情報

| 項目     | 値                                                                  |
| -------- | ------------------------------------------------------------------- |
| Phase    | 2                                                                   |
| タスクID | TASK-SW-CANCEL-004                                                  |
| 前Phase  | [phase-1-requirements.md](phase-1-requirements.md)                  |
| 次Phase  | [phase-3-design-review.md](phase-3-design-review.md)                |
| 目的     | E2E 確認・テスト・不足修正の設計を行い、SubAgent 分割方針を確定する |

## 目的

E2E 確認・テスト・不足修正の設計を行い、SubAgent 分割方針を確定する。

## 実行タスク

### タスク1: IPC E2E 検証導線の設計

**目的**: Renderer → Preload → Main の確認順序と責務境界を固定する。

**実行手順**:

1. 検証対象フローを層ごとに整理する。
2. トップダウンの確認順序を定義する。
3. fail 時の修正対象を層ごとに切り分ける。

**期待される成果物**:

- 検証導線
- 確認順序
- 層別修正パターン

### タスク2: テスト設計とレーン分割

**目的**: E2E テストケースと SubAgent 並列レーンを設計する。

**実行手順**:

1. TC-E2E-01〜04 を定義する。
2. Lane A〜C の並列/直列条件を固定する。
3. Phase 4 と Phase 5 の責務境界を明確化する。

**期待される成果物**:

- E2E テスト設計
- SubAgent レーン計画
- Phase 間責務境界

## 前提

Phase 1 の確認結果をもとに設計する。本タスクは verify_existing モードであるため：

- 不足項目が 0 件 → E2E 統合テスト追加のみが成果物
- 不足項目が 1 件以上 → 最小限の実装修正 + E2E 統合テスト

## 設計方針

### IPC E2E 確認の検証導線

```
[確認対象フロー]
キャンセルボタン click (SkillCreateWizard.tsx)
  → handleCancelGeneration() [:553-557]
    → cancelGeneration() [useCancelGeneration.ts:24-41]
      → abortControllerRef.current.abort()   ← AbortSignal abort
      → setStage("cancelled")                ← Store 更新
      → skillCreatorAPI.cancelGeneration()   ← IPC invoke
        → Preload: safeInvoke(SKILL_CREATOR_CANCEL) [skill-creator-api.ts:726-727]
          → Main: ipcMain.handle(SKILL_CREATOR_CANCEL) [skillCreatorHandlers.ts:688-706]
            → skillCreatorService.cancelCurrentOperation()
            → onCancelCurrentSkillCreation?.()
```

### 確認順序（トップダウン）

| ステップ | 対象                             | 確認内容                                                                    |
| -------- | -------------------------------- | --------------------------------------------------------------------------- |
| Step 1   | Renderer: useCancelGeneration.ts | `cancelGeneration()` に `skillCreatorAPI?.cancelGeneration?.()` があるか    |
| Step 2   | Preload: channels.ts             | `SKILL_CREATOR_CANCEL` が `ALLOWED_INVOKE_CHANNELS` にあるか                |
| Step 3   | Preload: index.ts                | `skillCreatorAPI` が `contextBridge.exposeInMainWorld` で公開されているか   |
| Step 4   | Renderer: SkillCreateWizard.tsx  | キャンセルボタン onClick が `handleCancelGeneration` にバインドされているか |
| Step 5   | Renderer: AbortSignal            | `startGeneration()` の返り値 signal が consumer に渡されているか            |

### E2E 統合テストの設計方針

既存 `useCancelGeneration.test.ts` は単体テスト（IPC は mock）。E2E テストでは：

- `window.skillCreatorAPI.cancelGeneration` の実際の channel 文字列レベルで確認する
- IPC モックを使い Preload 境界まで検証する

**E2E テストファイル**: `apps/desktop/src/renderer/hooks/__tests__/useCancelGeneration.e2e.test.ts`

**テストケース設計**:

| TC        | 検証内容                                                                                     | 期待結果                         |
| --------- | -------------------------------------------------------------------------------------------- | -------------------------------- |
| TC-E2E-01 | `cancelGeneration()` 呼び出し時に `window.skillCreatorAPI.cancelGeneration` が invoke される | mock が 1 回呼ばれる             |
| TC-E2E-02 | `startGeneration()` → `cancelGeneration()` フローで signal.aborted が true                   | `signal.aborted === true`        |
| TC-E2E-03 | `cancelGeneration()` 後に Store の `streamingStage` が `cancelled`                           | `streamingStage === "cancelled"` |
| TC-E2E-04 | `skillCreatorAPI` が null でも `cancelGeneration()` がクラッシュしない                       | 例外が throw されない            |

## SubAgent 分割方針

| Lane   | 役割                                             | 実行形態 | 担当フェーズ          |
| ------ | ------------------------------------------------ | -------- | --------------------- |
| Lane A | IPC chain 確認監査（UT-01〜UT-03 の Step 1-5）   | 並列     | Phase 1 後半・Phase 4 |
| Lane B | E2E 統合テスト設計・ファイル作成                 | 並列     | Phase 4               |
| Lane C | 不足実装修正（Phase 1 確認で不足が判明した場合） | 直列     | Phase 5               |

Lane A と Lane B は Phase 4 で並列実行可能。Lane C は Lane A の確認結果が出てから実行。

## 修正パターン（Phase 1 結果次第）

| 不足項目                                                   | 修正対象ファイル        | 修正内容                                                              |
| ---------------------------------------------------------- | ----------------------- | --------------------------------------------------------------------- |
| `ALLOWED_INVOKE_CHANNELS` に `SKILL_CREATOR_CANCEL` が不足 | `preload/channels.ts`   | `IPC_CHANNELS.SKILL_CREATOR_CANCEL` を配列に追加                      |
| `AbortSignal` の consumer が存在しない                     | `SkillCreateWizard.tsx` | `startGeneration()` 戻り値 signal を `createSkill()` 呼び出し側に渡す |
| キャンセルボタンのバインディングが不足                     | `SkillCreateWizard.tsx` | 該当 onClick に `handleCancelGeneration` を追加                       |

## 参照資料

- `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
- `apps/desktop/src/preload/skill-creator-api.ts`
- `apps/desktop/src/preload/channels.ts`
- `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
- `docs/30-workflows/TASK-SW-CANCEL-004/phase-1-requirements.md`

## 成果物

| 成果物              | パス                                    |
| ------------------- | --------------------------------------- |
| 解決策設計書        | `outputs/phase-2/solution-design.md`    |
| SubAgent レーン計画 | `outputs/phase-2/subagent-lane-plan.md` |
| 検証導線            | `outputs/phase-2/validation-path.md`    |

## 統合テスト連携

- Phase 4 で TC-E2E-01〜04 を Red/Green 管理できるようにする。
- Phase 5 で修正が必要な場合のみ最小限のコード変更に接続する。
- Phase 9 の targeted test と typecheck に必要な確認パスをここで固定する。

## 完了条件

- [ ] IPC E2E 確認の検証導線が定義されている
- [ ] E2E 統合テストの TC-E2E-01〜04 が設計されている
- [ ] SubAgent 分割方針が確定している
- [ ] Phase 1 結果が不足の場合の修正パターンが明記されている
- [ ] Phase 3 レビューに渡す設計書が作成されている
