# Phase 1: 要件定義

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 1                  |
| Phase名    | 要件定義           |
| 対象機能   | TASK-SW-CANCEL-001 |
| 前提Phase  | -（起点）          |
| 次Phase    | Phase 2: 設計      |
| ステータス | 未実施             |
| 作成日     | 2026-04-16         |

## 目的

`packages/shared/src/ipc/channels.ts` の `SKILL_CREATOR_RUNTIME_CHANNELS` に
`SKILL_CREATOR_CANCEL` チャンネル定数が存在しない問題を特定し、
修正に必要な要件と受入条件を明確化する。

## 問題

`skillCreatorHandlers.ts` に `SKILL_CREATOR_CANCEL` チャンネルの登録がない。
`AbortSignal` を受け取るハンドラーも存在しない。

`useCancelGeneration.ts:24-31` の `cancelGeneration()` は renderer 内の
`AbortController.abort()` を呼び出すだけで IPC 経由の通知がない。

```typescript
// useCancelGeneration.ts:24-31
const cancelGeneration = useCallback(() => {
  abortControllerRef.current?.abort();
  abortControllerRef.current = null;
  setStage("cancelled");
  // AbortController.abort() で Main Process 側の処理も中断される  // コメントのみで未実装
}, [setStage]);
```

Preload 側に `skillCreatorAPI.cancelGeneration` / `cancel` メソッドは存在しない。
メインプロセス側に `SKILL_CREATOR_CANCEL` チャンネルのハンドラーも存在しない。

現状の `SKILL_CREATOR_RUNTIME_CHANNELS`（行 195-211）:

```typescript
export const SKILL_CREATOR_RUNTIME_CHANNELS = {
  SKILL_CREATOR_PROGRESS: "skill-creator:progress",
  SKILL_CREATOR_WORKFLOW_STATE_CHANGED: "skill-creator:workflow-state-changed",
  SKILL_CREATOR_ADAPTER_STATUS_CHANGED: "skill-creator:adapter-status-changed",
} as const;
```

`SKILL_CREATOR_CANCEL` が欠落している。

## 実行タスク

### Step 0: P50チェック（必須）

実装状態を確認し、既実装コードの重複修正を防止する。

1. `packages/shared/src/ipc/channels.ts` の `SKILL_CREATOR_RUNTIME_CHANNELS`（行 195 付近）を読み込み現状確認
2. `apps/desktop/src/preload/channels.ts` のスプレッド構造を確認
3. `apps/desktop/src/renderer/hooks/useCancelGeneration.ts` の現状確認

### Task 1: 問題特定と影響範囲調査

1. `SKILL_CREATOR_RUNTIME_CHANNELS` に `SKILL_CREATOR_CANCEL` が存在しないことを確認
2. `apps/desktop/src/preload/channels.ts` が `SKILL_CREATOR_RUNTIME_CHANNELS` をスプレッドしていることを確認
3. 後続タスク TASK-SW-CANCEL-002 との接続点を確認
4. 本タスクで追加するチャンネル定数値 `"skill-creator:cancel"` の命名規則を確認

### Task 2: 受入条件の策定

1. 追加するチャンネル定数の仕様を整理
2. Preload 側の自動有効化メカニズムを確認
3. TypeScript 型安全性の要件を明確化
4. 既存テストへの影響を評価
5. 受入条件を4件策定

## 受入条件

| ID   | 条件                                                                                                                 |
| ---- | -------------------------------------------------------------------------------------------------------------------- |
| AC-1 | `SKILL_CREATOR_CANCEL: "skill-creator:cancel"` が `channels.ts` の `SKILL_CREATOR_RUNTIME_CHANNELS` に追加されている |
| AC-2 | Preload 側の `channels.ts` が `SKILL_CREATOR_RUNTIME_CHANNELS` をスプレッドしているため、自動で有効になることを確認  |
| AC-3 | TypeScript の型エラーがない                                                                                          |
| AC-4 | 既存テストが全てパスし続ける                                                                                         |

## 参照資料

- `packages/shared/src/ipc/channels.ts` — 実装対象（行 195 付近 SKILL_CREATOR_RUNTIME_CHANNELS）
- `apps/desktop/src/preload/channels.ts` — スプレッド確認対象
- `docs/30-workflows/skill-create-flow-gaps/00-task-spec-design-docs/phase-1-analysis.md` — 問題2の現状分析
- `docs/30-workflows/skill-create-flow-gaps/00-task-spec-design-docs/phase-2-solution.md` — 解決アプローチA

## 統合テスト連携

- 本タスクは単一ファイル（`channels.ts`）への1行追加であり、IPC チャンネル契約の追加のみ
- 既存チャンネルの変更はないため、既存の IPC/Preload 層への影響はない
- 接続要件: TASK-SW-CANCEL-002 が本タスクの出力（`SKILL_CREATOR_CANCEL` チャンネル定数）を前提とする

## 成果物

| 成果物                             | パス                                                 |
| ---------------------------------- | ---------------------------------------------------- |
| TASK-SW-CANCEL-001-requirements.md | `outputs/phase-1/TASK-SW-CANCEL-001-requirements.md` |

## 完了条件

- [ ] 問題の根本原因（`SKILL_CREATOR_CANCEL` チャンネル定数の欠落）が特定されている
- [ ] 受入条件（AC-1〜AC-4）が全件策定されている
- [ ] Preload 側の自動有効化メカニズムが確認されている
- [ ] 後続タスク TASK-SW-CANCEL-002 との接続点が確認されている

## タスク100%実行確認【必須】

- [ ] Step 0（P50チェック）を実行し、現状コードを確認した
- [ ] Task 1（問題特定と影響範囲調査）を100%実行した
- [ ] Task 2（受入条件の策定）を100%実行した
- [ ] 成果物（TASK-SW-CANCEL-001-requirements.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 2: 設計](./phase-2-design.md)
