# Phase 3 spec drift checklist

| 項目                                                        | 状態                                                | 対応Phase |
| ----------------------------------------------------------- | --------------------------------------------------- | --------- |
| `index.md` の正本タスク参照パス                             | drift あり                                          | 12        |
| `phase-1/2` の `.claude` 参照パス記述                       | 現ワークツリーは `.agents` も併存。実行上は問題なし | 12        |
| `preload/types.ts` の HistorySearch 契約                    | drift あり                                          | 5         |
| `ui-ux-feature-components.md` の HistorySearch 実装サマリー | 056c 状態のまま                                     | 12        |
| `arch-state-management.md` の HistorySearch 契約            | 056c 状態のまま                                     | 12        |

## 結論

- 実装着手を阻害する CRITICAL drift はなし
- 仕様同期を伴う drift は Phase 5 と 12 の必須項目として扱う
