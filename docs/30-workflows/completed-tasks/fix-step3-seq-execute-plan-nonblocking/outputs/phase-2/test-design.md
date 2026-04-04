# テスト設計書 - TASK-FIX-EP-01

## メタ情報

```yaml
task_id: TASK-FIX-EP-01
formal_task_id: TASK-FIX-EXECUTE-PLAN-FF-001
document_type: テスト設計書
created_date: 2026-04-04
test_file: apps/desktop/src/main/ipc/__tests__/creatorHandlers.fire-and-forget.test.ts
```

## テストケース一覧

### TC-T2-01: 100ms 以内レスポンス

| 項目     | 内容                                                                                     |
| -------- | ---------------------------------------------------------------------------------------- |
| ID       | TC-T2-01                                                                                 |
| 目的     | execute-plan invoke が 100ms 以内に `{ accepted: true, planId }` を返す                  |
| 前提     | `executeAsync` は 10 秒かかる Promise を返す（実行完了を待たない検証）                   |
| 手順     | 1. `executeAsync` を 10s の slow Promise に設定<br/>2. invoke 実行<br/>3. 経過時間を計測 |
| 期待結果 | `result === { accepted: true, planId: "plan-001" }` かつ `elapsed < 100ms`               |
| 検証方法 | `expect(result).toEqual(...)` + `expect(elapsed).toBeLessThan(100)`                      |

### TC-T2-02: executeAsync 呼び出し確認

| 項目     | 内容                                                               |
| -------- | ------------------------------------------------------------------ |
| ID       | TC-T2-02                                                           |
| 目的     | バックグラウンドで `executeAsync` が正しい引数で呼ばれることを検証 |
| 前提     | `executeAsync` は `mockResolvedValue(undefined)`                   |
| 手順     | 1. invoke 実行<br/>2. `executeAsync` の呼び出し引数を検証          |
| 期待結果 | `executeAsync("plan-001", expect.any(Object))` が呼ばれる          |
| 検証方法 | `expect(mockFacade.executeAsync).toHaveBeenCalledWith(...)`        |

### TC-T2-03: エラー耐性

| 項目     | 内容                                                                     |
| -------- | ------------------------------------------------------------------------ |
| ID       | TC-T2-03                                                                 |
| 目的     | `executeAsync` がエラーを throw しても invoke は正常に ack を返す        |
| 前提     | `executeAsync` が `throw new Error("Agent SDK error")` する              |
| 手順     | 1. `executeAsync` をエラー throw に設定<br/>2. invoke 実行               |
| 期待結果 | `result === { accepted: true, planId: "plan-001" }` （エラーの影響なし） |
| 検証方法 | `expect(result).toEqual(...)` （例外が伝播しないことの確認）             |

### TC-T2-04: 並列受付

| 項目     | 内容                                                            |
| -------- | --------------------------------------------------------------- |
| ID       | TC-T2-04                                                        |
| 目的     | 複数の planId が並列で invoke されてもそれぞれ受け付けられる    |
| 前提     | デフォルトの mock 設定                                          |
| 手順     | 1. `Promise.all` で 2 件の invoke を同時実行                    |
| 期待結果 | 各 invoke が対応する planId の ack を返す                       |
| 検証方法 | `expect(result1).toEqual(...)` + `expect(result2).toEqual(...)` |

### TC-T2-05: エラー回復

| 項目     | 内容                                                                   |
| -------- | ---------------------------------------------------------------------- |
| ID       | TC-T2-05                                                               |
| 目的     | 1 回目の executeAsync がエラーでも 2 回目の invoke が正常に動作する    |
| 前提     | `mockRejectedValueOnce` -> `mockResolvedValueOnce`                     |
| 手順     | 1. 1 回目 invoke（エラー設定）<br/>2. 2 回目 invoke（正常設定）        |
| 期待結果 | 両方とも `{ accepted: true, planId }` を返す + `executeAsync` 2 回呼出 |
| 検証方法 | 各 result の `toEqual` + `toHaveBeenCalledTimes(2)`                    |

### TC-T2-06: planId 伝播

| 項目     | 内容                                                                   |
| -------- | ---------------------------------------------------------------------- |
| ID       | TC-T2-06                                                               |
| 目的     | req の planId が正しく抽出されて executeAsync に渡されることを検証     |
| 前提     | 一意な planId `"unique-plan-id-abc-123"` を使用                        |
| 手順     | 1. 特定の planId で invoke 実行<br/>2. `executeAsync` の引数を検証     |
| 期待結果 | `executeAsync(planId, expect.objectContaining({ planId }))` が呼ばれる |
| 検証方法 | `expect(mockFacade.executeAsync).toHaveBeenCalledWith(...)`            |

### TC-T2-07: 10 件並列負荷テスト

| 項目     | 内容                                                               |
| -------- | ------------------------------------------------------------------ |
| ID       | TC-T2-07                                                           |
| 目的     | 10 件の並列 invoke が全て 100ms 以内に応答する                     |
| 前提     | `executeAsync` は never-resolve Promise を返す（完了を待たない）   |
| 手順     | 1. `Promise.all` で 10 件の invoke を同時実行<br/>2. 経過時間計測  |
| 期待結果 | 全 result が `{ accepted: true, planId }` かつ `elapsed < 100ms`   |
| 検証方法 | `forEach` で各 result を検証 + `expect(elapsed).toBeLessThan(100)` |

## テスト環境

| 項目                 | 設定                                                     |
| -------------------- | -------------------------------------------------------- |
| テストランナー       | Vitest                                                   |
| モック               | `vi.mock("electron")` + `vi.fn()` ベースの Facade モック |
| IPC シミュレーション | `handlerMap` に登録された handler を直接呼び出し         |
| BrowserWindow        | `createMockMainWindow()` による最小モック                |
| IpcMainInvokeEvent   | `createMockEvent()` による最小モック                     |

## カバレッジ対象

| 観点           | テストケース                 |
| -------------- | ---------------------------- |
| 正常系         | TC-T2-01, TC-T2-02, TC-T2-06 |
| 異常系         | TC-T2-03, TC-T2-05           |
| 並列・負荷     | TC-T2-04, TC-T2-07           |
| 非機能（性能） | TC-T2-01, TC-T2-07           |
