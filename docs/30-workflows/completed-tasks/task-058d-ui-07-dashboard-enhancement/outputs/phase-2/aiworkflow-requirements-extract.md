# Phase 2 成果物: aiworkflow-requirements 抽出表

| 仕様                            | 適用箇所                                                        | 判断            |
| ------------------------------- | --------------------------------------------------------------- | --------------- |
| `master-design.md`              | Dashboard→ホーム命名、SuggestionBubble の横断用途               | 必須            |
| `ui-ux-design-principles.md`    | Tap & Discover / やさしい文言 / ダッシュボード→ホーム変換       | 必須            |
| `ui-ux-design-system.md`        | semantic token / motion token / EmptyState mood                 | 必須            |
| `ui-ux-atoms-patterns.md`       | SuggestionBubble pill 制約、EmptyState mood、RelativeTime 運用  | 必須            |
| `ui-ux-components.md`           | EmptyState / RelativeTime / SuggestionBubble の実装パス         | 必須            |
| `arch-ui-components.md`         | atom / molecule / organism の責務境界、view-local で閉じる判断  | 必須            |
| `directory-structure.md`        | `views/DashboardView/components/` / helper 配置規約             | 必須            |
| `ui-ux-feature-components.md`   | TASK-UI-03 の Tap & Discover 成功例、UT-UI-055-001              | 推奨            |
| `ui-ux-navigation.md`           | `dashboard` / `historySearch` / nav 契約境界                    | 必須            |
| `api-endpoints.md`              | `historySearch` が既存 API として利用可能かの確認               | 推奨            |
| `api-ipc-system.md`             | `history:search` / `history:get-stats` の既存 IPC 契約確認      | 推奨            |
| `arch-state-management.md`      | selector 利用、direct profile access 回避、`viewHistory` ガード | 必須            |
| `error-handling.md`             | empty / loading / invalid timestamp fallback の統一             | 必須            |
| `security-principles.md`        | 新規 IPC / Preload / secret handling を増やさない境界           | 必須            |
| `testing-component-patterns.md` | store mock と interaction test                                  | 必須            |
| `testing-accessibility.md`      | keyboard / role / SR 観点                                       | 必須            |
| `quality-requirements.md`       | UI 層カバレッジ閾値                                             | 必須            |
| `task-workflow.md`              | Phase 12 の `spec_created` 同期先、touch target の既知未タスク  | Phase 12 で必須 |
| `lessons-learned.md`            | docs-heavy / spec_created 再発防止                              | Phase 12 で必須 |

## 抽出メモ

- 「ダッシュボード → ホーム」の命名変換は画面文言へ適用し、内部識別子には適用しない
- existing atom の API 拡張より、view-local molecule 追加の方が SoC に沿う
- `SuggestionBubble` は pill atom のまま残し、card 表現は view-local molecule で吸収する
- エレガント解は「既存 nav / IPC / atom 契約を温存し、view-local component と既存 selector の再構成だけで解く」方針
- 破棄すべき案は「`SuggestionBubble` の card 化」「`navContract` の表示文言変更」「Dashboard 専用 slice / IPC の追加」
- `UT-UI-055-001`（EmptyState light contrast）と `UT-UI-ATOMS-TOUCH-TARGET-001` は Phase 9/11 で確認観点に昇格させる

## 検索エビデンス

| クエリ             | 主採用                                                                            |
| ------------------ | --------------------------------------------------------------------------------- |
| `dashboard`        | `ui-ux-navigation.md`, `api-ipc-system.md`, `master-design.md`                    |
| `ホーム`           | `master-design.md`, `ui-ux-design-principles.md`                                  |
| `SuggestionBubble` | `ui-ux-design-principles.md`, `ui-ux-design-system.md`, `ui-ux-atoms-patterns.md` |
| `EmptyState`       | `ui-ux-atoms-patterns.md`, `ui-ux-feature-components.md`                          |
| `historySearch`    | `ui-ux-navigation.md`, `api-endpoints.md`, `api-ipc-system.md`                    |
| `navigation`       | `ui-ux-navigation.md`, `arch-state-management.md`                                 |
