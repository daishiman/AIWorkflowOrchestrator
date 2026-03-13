# AIWorkflow Requirements Extraction Matrix

| 参照仕様                   | 抽出内容                                               | task-061 への影響                                             | 反映先           |
| -------------------------- | ------------------------------------------------------ | ------------------------------------------------------------- | ---------------- |
| `ui-ux-navigation.md`      | 公開シェル遷移・Global Nav 契約を壊さない              | 新しい route/view ではなく overlay 統合を優先                 | Phase 1, 2       |
| `ui-ux-settings.md`        | 設定画面は再入場導線・永続設定導線の正本               | 「はじめようを再表示」操作を Settings に置く                  | Phase 1, 2       |
| `ui-ux-components.md`      | 既存 UI primitive をラップして拡張する                 | `SuggestionBubble` を wrapper で流用                          | Phase 1, 2       |
| `ui-ux-design-system.md`   | 色は semantic token 中心、ライトテーマ負債を増やさない | `ThemeSelector` 直利用ではなく `ThemePreview` 新設            | Phase 2, 3       |
| `arch-state-management.md` | Redux UI state と persistence 境界を明確にする         | modal step state は renderer、完了状態は store 永続化         | Phase 1, 2       |
| `task-workflow.md`         | Phase 1-3 設計確定後に後続フェーズへ進む               | 本 workflow では Phase 1-3 のみ completed に固定              | index, artifacts |
| `lessons-learned.md`       | 既存コンポーネント API 非破壊、現実の契約優先          | 原本 task 案の `electronAPI.config` を捨てて現行 API に寄せる | Phase 1, 3       |
