# Phase 1: 現状棚卸し (Current State Inventory)

## 作成日

2026-04-20

## 目的

本 workflow 開始時点の実コード・実テスト・IPC 4層の current fact を凍結し、以降 Phase で diff check の base line とする。

## 1. 対象 Hook の current fact

**ファイル**: `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`（全 45 行）

### 実装シグネチャ

```typescript
export interface UseCancelGenerationReturn {
  cancelGeneration: () => Promise<void>;
  startGeneration: () => AbortSignal;
}

export function useCancelGeneration(): UseCancelGenerationReturn;
```

### `cancelGeneration()` 実行順序

1. `abortControllerRef.current?.abort()` — local abort を優先
2. `abortControllerRef.current = null` — ref clear
3. `setStage("cancelled")` — ストア stage 更新
4. `await skillCreatorAPI?.cancelGeneration?.()` — Main 層へ IPC 通知
5. `try/catch` で IPC 失敗は握りつぶし、UI へ伝播させない

## 2. 4層接続確認

| 層       | ファイル                                                 | 確認位置                                             | 状態 |
| -------- | -------------------------------------------------------- | ---------------------------------------------------- | ---- |
| shared   | `packages/shared/src/ipc/channels.ts`                    | L200: `SKILL_CREATOR_CANCEL: "skill-creator:cancel"` | OK   |
| preload  | `apps/desktop/src/preload/skill-creator-api.ts`          | L396 型宣言 / L726 実装                              | OK   |
| main     | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`      | L689 handler 登録 / L750 解除                        | OK   |
| renderer | `apps/desktop/src/renderer/hooks/useCancelGeneration.ts` | L24-41 `cancelGeneration` 実装                       | OK   |

## 3. 既存テストの current fact

**ファイル**: `apps/desktop/src/renderer/hooks/__tests__/useCancelGeneration.test.ts`（全 79 行）

### 既存ケース

| #   | ケース                                                                     | 観点                     |
| --- | -------------------------------------------------------------------------- | ------------------------ |
| 1   | `startGeneration` が AbortSignal を返す                                    | signal 生成              |
| 2   | `cancelGeneration` が AbortSignal を abort する                            | abort + IPC 呼び出し回数 |
| 3   | `cancelGeneration` がストアを cancelled に更新する                         | stage 更新               |
| 4   | `startGeneration` を呼ばずに `cancelGeneration` を呼んでもクラッシュしない | undefined guard          |

### 未カバーの観点

- **IPC failure swallow**: `window.skillCreatorAPI.cancelGeneration` が reject した際にエラーが伝播しないことのテストが不足

## 4. 依存タスクの状態

| タスク             | 状態                  | 役割                    |
| ------------------ | --------------------- | ----------------------- |
| TASK-SW-CANCEL-001 | 完了                  | shared IPC channel 定義 |
| TASK-SW-CANCEL-002 | 完了                  | preload surface         |
| TASK-SW-CANCEL-003 | 完了                  | main handler            |
| TASK-SW-CANCEL-004 | 進行中（本 workflow） | renderer hook 検証      |

## 5. Phase 1 結論

- current fact は workflow 仕様と整合
- 4層接続は全て完了
- 既存テストは主要観点をカバーし、IPC failure swallow のみ補強候補
- `verify_existing` モードが妥当
