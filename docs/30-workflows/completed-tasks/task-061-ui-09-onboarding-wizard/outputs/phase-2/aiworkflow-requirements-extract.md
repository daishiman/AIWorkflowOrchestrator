# AIWorkflow Requirements Extract

| 仕様書 | 抽出した論点 | task-061 への適用 |
| --- | --- | --- |
| `ui-ux-design-principles.md` | Tap & Discover、UX 言語、SuggestionBubble、EmptyState mood | 4 step の copy と micro interaction に適用 |
| `testing-accessibility.md` | キーボード（Tab/Enter）と focus-visible、ダイアログ focus trap | modal の keyboard contract を Phase 11 に橋渡し |
| `ui-ux-components.md` | shared / view-local の分離 | wizard 専用 UI は onboarding local へ閉じる |
| `testing-component-patterns.md` | component / hook テスト設計 | step interaction と hook 契約を Phase 4 で再利用 |
| `quality-requirements.md` | 回帰ゲートと失敗時基準 | Phase 6-7 の gate と risk 判定に適用 |
| `ui-ux-feature-components.md` | Dashboard Home、SkillCreateWizard、mobile overlay | overlay shell、wizard local state、画面証跡計画へ適用 |
| `ui-ux-navigation.md` | `dashboard`、`settings`、overlay、keyboard contract | 新規 `ViewType` を増やさない |
| `ui-ux-settings.md` | settings 公開シェル、未認証 reset 除外 | rerun path に適用 |
| `arch-state-management.md` | local state 優先、P31、`currentView` 正規化 | new slice 禁止、個別セレクタを採用 |
| `security-electron-ipc.md` | preload 境界、Renderer からの直接 Node 禁止 | 既存 `store` / `theme` surface だけを使う |
| `task-workflow.md` | `spec_created` 運用、Phase 12 同期先 | Phase 12 planning に反映 |
