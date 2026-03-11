# Phase 3 リスク登録簿

| ID   | リスク                                              | 影響   | 対策                                                     | 所有 |
| ---- | --------------------------------------------------- | ------ | -------------------------------------------------------- | ---- |
| R-01 | filter UI 廃止により既存 view test が全面破壊される | Medium | Phase 4 で view test を 058c 観点へ先に置換              | D    |
| R-02 | observer test が不安定になる                        | High   | 専用 hook test と mock observer を用意する               | D    |
| R-03 | file deep-open が EditorView と接続できない         | High   | editor slice に pending file path を追加し bridge する   | C    |
| R-04 | `preload/types.ts` の旧契約が残り型ドリフトする     | Medium | Phase 5 で contract section を更新                       | C    |
| R-05 | 正本タスク参照パスがずれたまま Phase 12 へ進む      | Medium | doc sync でパス是正、changelog 記録                      | A    |
| R-06 | invalid timestamp で group sort が壊れる            | Medium | `useTimelineGroups` に fallback group を実装し test 固定 | B    |
