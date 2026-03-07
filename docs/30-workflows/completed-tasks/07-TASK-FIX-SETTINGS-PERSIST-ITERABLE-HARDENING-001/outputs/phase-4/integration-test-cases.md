# Phase 4: 統合テストケース

> タスク: TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001
> 作成日: 2026-03-07

---

## 統合テストシナリオ

### IT-01: 破損 persist → hydrate → settings 遷移

| 項目     | 内容                                                                     |
| -------- | ------------------------------------------------------------------------ |
| 前提条件 | localStorage に expandedFolders が非配列（例: `42`）として保存されている |
| 操作     | アプリ起動（store hydrate）→ setCurrentView("settings")                  |
| 期待結果 | hydrate 時に expandedFolders が空 Set に復旧し、settings 遷移が成功する  |
| 対応 DD  | DD-01, DD-03                                                             |

### IT-02: 破損 viewHistory → 往復遷移

| 項目     | 内容                                                                            |
| -------- | ------------------------------------------------------------------------------- |
| 前提条件 | viewHistory が破損状態（非配列）                                                |
| 操作     | setCurrentView("settings") → setCurrentView("dashboard") → goBack()             |
| 期待結果 | 最初の setCurrentView で viewHistory が [settings] に復旧、以降は正常に動作する |
| 対応 DD  | DD-03, DD-04                                                                    |

### IT-03: 復旧後の再保存

| 項目     | 内容                                                            |
| -------- | --------------------------------------------------------------- |
| 前提条件 | 破損データから復旧した状態の store                              |
| 操作     | expandedFolders に値を追加 → setItem が呼ばれる                 |
| 期待結果 | 復旧後の Set が正しく配列に変換されて localStorage に保存される |
| 対応 DD  | DD-01, DD-02                                                    |

### IT-04: P31 回帰非競合

| 項目     | 内容                                             |
| -------- | ------------------------------------------------ |
| 前提条件 | 既存の infinite-loop-prevention テストが存在する |
| 操作     | 全テストスイート実行                             |
| 期待結果 | 既存の P31 対策テストが全て PASS する            |
| 対応 AC  | AC-05                                            |

---

## fixture 対応表

| fixture 名               | シナリオ ID  | 用途                             |
| ------------------------ | ------------ | -------------------------------- |
| corruptedExpandedFolders | IT-01, IT-03 | getItem/setItem の破損入力テスト |
| corruptedViewHistory     | IT-02        | navigationSlice の破損入力テスト |
| mixedArray               | IT-01        | 要素レベルフィルタリングテスト   |
