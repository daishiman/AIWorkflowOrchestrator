# Phase 6 アクセシビリティケース

## キーボード操作

| ケース                | 期待結果                                             | 結果 |
| --------------------- | ---------------------------------------------------- | ---- |
| ArrowRight on folder  | folder が展開される                                  | PASS |
| ArrowLeft on folder   | folder が閉じる                                      | PASS |
| ArrowUp / ArrowDown   | tree item focus が移動する                           | PASS |
| Enter / Space on file | file select が発火する                               | PASS |
| toggle switch         | `role="switch"` と `aria-checked` が正しく更新される | PASS |
| mobile overlay Escape | overlay close が発火する                             | PASS |

## セマンティクス

| 要素          | 要件                                   | 結果 |
| ------------- | -------------------------------------- | ---- |
| file tree     | `role="tree"`                          | PASS |
| tree item     | `role="treeitem"` と expanded state    | PASS |
| status bar    | `role="status"` + `aria-live="polite"` | PASS |
| resize handle | separator / keyboard resize            | PASS |
