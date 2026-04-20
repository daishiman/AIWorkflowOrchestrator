# Phase 2: Abort 経路図

## createSkill() → private workflow Abort 伝播経路

```
cancelCurrentOperation()
  └── currentAbortController.abort()
        └── operationSignal.aborted = true

createSkill()
  ├── throwIfAborted(operationSignal)          [L.345]
  ├── runOrchestrateWorkflow(opts, signal)      ← 入口 throwIfAborted 追加対象
  ├── runCreateWorkflow(opts, signal)           ← 入口 throwIfAborted 追加対象
  ├── throwIfAborted(operationSignal)          [L.392]
  ├── executeScript(..., operationSignal)
  ├── throwIfAborted(operationSignal)
  └── catch → cleanupCancelledSkillDir()
```

## 修正箇所（最小変更 2 箇所）

| メソッド                   | Before                           | After                                                          |
| -------------------------- | -------------------------------- | -------------------------------------------------------------- |
| `runOrchestrateWorkflow()` | `_signal?: AbortSignal` (未使用) | `signal?: AbortSignal` + `throwIfAborted(signal)` を先頭に追加 |
| `runCreateWorkflow()`      | `_signal?: AbortSignal` (未使用) | `signal?: AbortSignal` + `throwIfAborted(signal)` を先頭に追加 |

## 既存 helper 再利用

- `throwIfAborted(signal?: AbortSignal)` は L.231 に定義済み
- 新規 helper 不要
