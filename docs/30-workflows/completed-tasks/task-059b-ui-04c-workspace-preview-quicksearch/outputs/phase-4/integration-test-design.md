# Phase 4 統合テスト設計

## 統合観点

| 観点                  | テスト                                                    |
| --------------------- | --------------------------------------------------------- |
| FileBrowser → Preview | file click 後に status / content / preview が更新されるか |
| QuickSearch → Preview | Enter 確定後に `selectedFilePath` と preview が同期するか |
| Preview → Editor      | SourceView double click で EditorView へ遷移できるか      |
| watch → refresh       | file change 後に debounce 付きで再読込するか              |
| read error / timeout  | status bar / alert へ surfacing されるか                  |

## 手動テストへ渡す観点

- desktop / mobile overlay
- Task 5D 語彙
- QuickSearch モーダルの幅 / 角丸 / 影
- current build screenshot と TC-ID の対応
