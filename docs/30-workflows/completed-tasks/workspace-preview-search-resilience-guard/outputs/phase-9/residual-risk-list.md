# Phase 9 Output: Residual Risk List

| 重要度 | リスク                                                                                     | 対応                                                                               |
| ------ | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| 中     | local environment の `electron-vite build` が `esbuild@0.25.12` platform mismatch で不安定 | Phase 11 では renderer dev server を代替 capture 経路として採用し、Phase 12 に記録 |
| 低     | dark theme の no-match empty state は contrast がやや弱い                                  | Phase 11 の Apple UI/UX review に記録、今回の blocker にはしない                   |
| 低     | WorkspaceView 全体 branch coverage は 73.79% に留まる                                      | 今回未変更の既存分岐が主因。別 regression task で補完                              |
