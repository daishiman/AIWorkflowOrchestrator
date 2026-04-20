# Phase 1: current facts 棚卸し

## Abort 伝播点の棚卸し

| メソッド                     | signal 受取           | 入口 throwIfAborted | 内部 throwIfAborted | 状態     |
| ---------------------------- | --------------------- | ------------------- | ------------------- | -------- |
| `createSkill()`              | ✅ (operationSignal)  | ✅ L.345            | ✅ 複数箇所         | 成立済み |
| `runCollaborativeWorkflow()` | ✅ signal             | ✅ L.908            | —                   | 成立済み |
| `runOrchestrateWorkflow()`   | ⚠️ `_signal` (未使用) | ❌                  | —                   | 修正対象 |
| `runCreateWorkflow()`        | ⚠️ `_signal` (未使用) | ❌                  | —                   | 修正対象 |
| `generateSkillMd()`          | ✅ signal             | ✅ L.998            | ✅                  | 成立済み |
| `validateSkill()`            | ✅ signal             | —                   | ✅                  | 成立済み |

## cleanup 契約の棚卸し

- `cleanupCancelledSkillDir()`: `existedBefore=true` の場合は何もしない → 既存スキルを誤削除しない
- `signal?.aborted || isAbortError(error)` の場合のみ cleanup → 正常エラーでの誤削除なし

## public 契約と private 実装詳細の分離

| 区分             | 内容                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| public 契約      | `cancelCurrentOperation()` → `abortController.abort()` → `createSkill()` が AbortError をスロー |
| private 実装詳細 | `runOrchestrateWorkflow()` / `runCreateWorkflow()` 入口で signal を確認する実装                 |
