# Phase 4 Test Design

## Test Strategy

TDD の Red を前提に、`SkillLifecyclePanel.test.tsx` へ Layer 別表示のテストを追加した。

## Test Matrix

| TC    | 観点                   | 期待結果                              |
| ----- | ---------------------- | ------------------------------------- |
| TC-01 | Layer ヘッダー表示     | 4 つの Layer セクションが表示される   |
| TC-02 | layer3 の配置          | `L3-001` が Layer 3 内にある          |
| TC-03 | error icon             | `✗` が表示される                      |
| TC-04 | warning icon           | `⚠` が表示される                      |
| TC-05 | info icon              | `✓` が表示される                      |
| TC-06 | count badge            | severity 件数が表示される             |
| TC-07 | empty layer            | 空の Layer は表示されない             |
| TC-08 | backward compatibility | Layer1 / Layer2 が維持される          |
| TC-09 | collapse               | Layer ヘッダーで折りたためる          |
| TC-10 | expand                 | 再クリックで再展開できる              |
| TC-19 | reverify persistence   | reverify 後も折りたたみ状態が保たれる |

## Fixture Update

- `SkillLifecyclePanel.llm-generation.test.tsx` の layer3 fixture を `L3-001` / `L3-002` に更新する。
- Layer 別グルーピング後も既存 fixture の意味が壊れないことを確認する。

## Mocking Plan

| mock                | 目的                              |
| ------------------- | --------------------------------- |
| `getVerifyDetail`   | verify detail 取得を模擬する      |
| `reverifyWorkflow`  | 再検証要求と再取得を模擬する      |
| store currentPlanId | `activeWorkflowId` の同期を起こす |

## TDD Note

- Red では `verifyDetail.checks` の flat 表示前提が崩れる。
- Green では Layer 別表示、件数バッジ、折りたたみ、reverify 再取得が通る。
