# Phase 11 手動テストチェックリスト

## メタ情報

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| Phase    | 11                                      |
| タスクID | UT-SLIDE-UI-001                         |
| タスク名 | Slide Workspace UI 4領域実装            |
| 作成日   | 2026-03-21                              |
| 実行環境 | static fallback capture + source review |

## TC別チェック

| TC-ID    | 状態     | Light                                     | Dark                                     | 結果 | 確認メモ                                                 |
| -------- | -------- | ----------------------------------------- | ---------------------------------------- | ---- | -------------------------------------------------------- |
| TC-11-01 | empty    | `screenshots/TC-11-01-empty-light.png`    | `screenshots/TC-11-01-empty-dark.png`    | PASS | empty card のみ、Launcher 非表示                         |
| TC-11-02 | synced   | `screenshots/TC-11-02-synced-light.png`   | `screenshots/TC-11-02-synced-dark.png`   | PASS | sync card / watch status / phase panel / launcher が同居 |
| TC-11-03 | running  | `screenshots/TC-11-03-running-light.png`  | `screenshots/TC-11-03-running-dark.png`  | PASS | progress row と cancel CTA が表示                        |
| TC-11-04 | degraded | `screenshots/TC-11-04-degraded-light.png` | `screenshots/TC-11-04-degraded-dark.png` | PASS | retry / terminal fallback CTA を表示                     |
| TC-11-05 | guidance | `screenshots/TC-11-05-guidance-light.png` | `screenshots/TC-11-05-guidance-dark.png` | PASS | handoff reason と settings CTA を表示                    |

## 操作・アクセシビリティ確認

| ID   | 観点                  | 方法                                            | 結果    | メモ                                                                    |
| ---- | --------------------- | ----------------------------------------------- | ------- | ----------------------------------------------------------------------- |
| A-01 | retry CTA             | `SlideWorkspace.test.tsx` の interaction test   | PASS    | `manualSync` を直接呼ぶ                                                 |
| A-02 | settings CTA          | `SlideWorkspace.test.tsx` の guidance test      | PASS    | `setCurrentView("settings")` を呼ぶ                                     |
| A-03 | handoff copy          | `SlideWorkspace.test.tsx` の guidance copy test | PASS    | `handoffGuidance.terminalCommand` をコピーする                          |
| A-04 | guidance 優先順位     | `selectors.test.ts`                             | PASS    | handoff がある場合は `guidance` を優先                                  |
| A-05 | focus ring            | source review                                   | PASS    | close / cancel / guidance / launcher ボタンへ `focus:ring-2` を追加済み |
| A-06 | aria / progressbar    | source review                                   | PASS    | `role="alert"`, `role="status"`, `role="progressbar"` を維持            |
| A-07 | terminal open native  | source review                                   | PARTIAL | open ボタンは現状 copy fallback。native launch IPC は未実装             |
| A-08 | synced badge contrast | source review                                   | PARTIAL | `#34C759` + white text の低コントラストは未解消                         |
