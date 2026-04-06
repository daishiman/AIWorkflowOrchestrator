# Phase 8: Before / After Table

| 対象                  | Before                      | After                                  | 理由                                  |
| --------------------- | --------------------------- | -------------------------------------- | ------------------------------------- |
| workflow phase status | `pending` のまま            | `completed` / `blocked` へ同期         | completed workflow と本文を一致させる |
| artifacts             | 一部 phase の成果物が未登録 | 実在ファイルを補完して同期             | validator / review の false pass 防止 |
| Phase 11 evidence     | placeholder /破損 PNG 依存  | review-board PNG + metadata + coverage | NON_VISUAL 証跡の実在性を回復         |
