# Evidence Policy

> P50パターン該当: 検証・補完モード。既存 backlog を隠さず current evidence を切り分ける。

## 基本原則

1. `currentViolations` と `baselineViolations` を分離して記録する
2. `current=0` でも既存 backlog 参照は残す
3. `.claude` を正本として扱い、mirror drift は Phase 12 で報告する

## Evidence Flow

| Phase    | 入力                                      | 出力                                                        |
| -------- | ----------------------------------------- | ----------------------------------------------------------- |
| Phase 2  | surface matrix / audit spec               | TC-ID, selector, split rule                                 |
| Phase 11 | screenshot / metadata / discovered issues | manual-test-result, screenshot-coverage, discovered-issues  |
| Phase 12 | Phase 11 outputs                          | task-workflow sync, lessons sync, unassigned-task-detection |

## 0件報告ルール

- `currentViolations=0` を書く
- `baselineViolations` の件数と既存 remediation task を書く
- evidence 0件ではなく「今回増やしていない」を明示する
