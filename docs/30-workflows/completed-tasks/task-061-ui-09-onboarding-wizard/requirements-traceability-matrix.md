# Requirements Traceability Matrix

| ID     | 要件                                                      | ソース                     | 現行システム反映点                         | 仕様書反映先  | 検証予定    |
| ------ | --------------------------------------------------------- | -------------------------- | ------------------------------------------ | ------------- | ----------- |
| FR-01  | 初回利用時に 4 ステップのオンボーディングを表示する       | 原本 task-061              | `App.tsx` で overlay 制御                  | Phase 1, 2    | Phase 4, 11 |
| FR-02  | Step 1 で名前入力とリアルタイムプレビューを行う           | 原本 task-061              | `useDisplayName()` と greeting 連携        | Phase 1, 2, 3 | Phase 4     |
| FR-03  | Step 2 で SuggestionBubble ベースの AI おためし UI を出す | 原本 task-061              | `SuggestionBubble` 非破壊再利用            | Phase 1, 2    | Phase 4     |
| FR-04  | Step 3 でスターターツール選択を行う                       | 原本 task-061              | 実 import ではなく `starterIntent` 保存    | Phase 1, 2, 3 | Phase 4     |
| FR-05  | Step 4 でテーマ選択とライブプレビューを行う               | 原本 task-061              | 既存 `ThemeMode` / `setThemeMode()` 再利用 | Phase 1, 2    | Phase 4     |
| FR-06  | 完了時に confetti と自動遷移を行う                        | 原本 task-061              | overlay close 後 Dashboard へ復帰          | Phase 1, 2    | Phase 4, 11 |
| FR-07  | 設定画面から再表示できる                                  | 原本 task-061              | `SettingsView` 導線追加                    | Phase 1, 2    | Phase 4     |
| FR-08  | 状態を永続化する                                          | 原本 task-061              | `electronAPI.store.get/set` で保存         | Phase 1, 2, 3 | Phase 4     |
| NFR-01 | 公開シェル契約を壊さない                                  | `ui-ux-navigation.md`      | `settings` の bypass 契約を維持            | Phase 1, 2, 3 | Phase 10    |
| NFR-02 | semantic token ベースでテーマを構成する                   | `ui-ux-design-system.md`   | `ThemePreview` 専用化                      | Phase 1, 2, 3 | Phase 9     |
| NFR-03 | 既存 state 管理境界を壊さない                             | `arch-state-management.md` | UI state と persisted state を分離         | Phase 1, 2    | Phase 9     |
| NFR-04 | lessons learned に従い既存 atom API を壊さない            | `lessons-learned.md`       | `SuggestionBubble` wrapper 化              | Phase 1, 2, 3 | Phase 10    |
