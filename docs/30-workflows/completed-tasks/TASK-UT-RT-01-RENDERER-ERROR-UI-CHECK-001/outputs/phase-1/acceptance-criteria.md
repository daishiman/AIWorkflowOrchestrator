# Phase 1: 受け入れ基準

## TC-01: onWorkflowStateChanged → エラー表示

| 項目     | 内容                                                                                               |
| -------- | -------------------------------------------------------------------------------------------------- |
| シナリオ | `onWorkflowStateChanged` コールバックに `errorMessage = "実行に失敗しました"` を渡す               |
| 期待結果 | `data-testid="skill-lifecycle-error"` の `<div role="alert">` に "実行に失敗しました" が表示される |
| 検証方法 | `screen.getByTestId("skill-lifecycle-error")` + `toHaveTextContent`                                |

## TC-02: skillExecutionStatus === "error" → セッションログ表示

| 項目     | 内容                                                                                                  |
| -------- | ----------------------------------------------------------------------------------------------------- |
| シナリオ | `skillExecutionStatus` が `"error"` に変化し `skillError = "タイムアウト"` がある                     |
| 期待結果 | セッションログ (`data-testid="skill-lifecycle-session-log"`) の detail に "タイムアウト" が表示される |
| 検証方法 | `screen.getByTestId("skill-lifecycle-session-log")` + `toHaveTextContent`                             |

## TC-03: getWorkflowState failure snapshot → UI 反映

| 項目     | 内容                                                                                      |
| -------- | ----------------------------------------------------------------------------------------- |
| シナリオ | `getWorkflowState()` が failure snapshot（`currentPhase: "failed"`）を返す                |
| 期待結果 | failure 状態が UI に反映される（`data-testid="skill-lifecycle-workflow-summary"` に表示） |
| 検証方法 | `screen.getByTestId("skill-lifecycle-workflow-summary")` + テキスト確認                   |

## TC-04: localError 優先表示

| 項目     | 内容                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------- |
| シナリオ | `workflowError` が設定されている状態で `localError` も設定される                                |
| 期待結果 | `workflowError` より優先して `data-testid="skill-lifecycle-error"` に `localError` が表示される |
| 検証方法 | エラー要素のテキストが `localError` の値と一致することを確認                                    |

## 優先度マトリクス

```
currentSurfaceError = localError ?? workflowError ?? skillError
                       ↑最高優先    ↑中優先         ↑最低優先
```
