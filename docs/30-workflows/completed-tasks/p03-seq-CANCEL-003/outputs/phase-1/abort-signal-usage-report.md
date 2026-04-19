# AbortSignal 利用調査レポート - TASK-SW-CANCEL-003

## メタ情報

| 項目     | 内容               |
| -------- | ------------------ |
| タスクID | TASK-SW-CANCEL-003 |
| 作成日   | 2026-04-19         |

## Main 層での AbortSignal 利用

### SkillCreatorService.ts

| 箇所                                     | 用途                                                                               |
| ---------------------------------------- | ---------------------------------------------------------------------------------- |
| L328-330                                 | `createSkill()` で AbortController を生成し signal を `operationSignal` として保持 |
| L345, L392, L411, L429, L452, L480, L493 | `throwIfAborted(operationSignal)` で各ステップ前にキャンセル確認                   |
| L260-268                                 | `executeScript()` に signal を渡し、ScriptExecutor 経由で子プロセスに伝播          |
| L517-519                                 | `finally` で `currentAbortController === abortController` を確認してリセット       |

### ScriptExecutor での伝播

`executeScript()` は signal を `ScriptExecutor.execute()` に渡す。`ScriptExecutor` は Electron の子プロセス実行を担い、signal abort 時に子プロセスを終了させる設計。

## Renderer 層での AbortSignal 利用

### useCancelGeneration.ts

| 箇所                 | 用途                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------- |
| `abortControllerRef` | Renderer 側でも独立した AbortController を保持                                            |
| `startGeneration()`  | 新しい AbortController を生成し signal を返す                                             |
| `cancelGeneration()` | `abortControllerRef.current?.abort()` で Renderer 側を abort、その後 IPC で Main 側に通知 |

### Renderer → Main IPC の流れ

```
cancelGeneration()
  └─ abortControllerRef.current?.abort()  // Renderer local abort
  └─ skillCreatorAPI?.cancelGeneration?.()  // IPC 呼び出し (CANCEL-004 で完全接続)
       └─ SKILL_CREATOR_CANCEL handler
            └─ skillCreatorService.cancelCurrentOperation()
                 └─ currentAbortController?.abort()  // Main abort
```

## CANCEL-003 / CANCEL-004 境界

| 責務                                        | task                  |
| ------------------------------------------- | --------------------- |
| Main 層 AbortController 管理と IPC handler  | CANCEL-003（本 task） |
| Renderer からの IPC 呼び出し接続と E2E 完了 | CANCEL-004            |

## まとめ

- Main 層の signal 利用は完全に実装済み
- Renderer の `useCancelGeneration.ts` は IPC 経由で Main に委譲する設計になっているが、`skillCreatorAPI?.cancelGeneration?.()` の optional chaining により CANCEL-004 未完了でも Renderer 側が abort される
- E2E 完了（IPC 呼び出しが Main 層まで届くこと）は CANCEL-004 で確認する
