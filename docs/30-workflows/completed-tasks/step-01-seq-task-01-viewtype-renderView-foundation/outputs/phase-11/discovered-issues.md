# Phase 11 発見課題

## 件数

1件（Note）

## メモ

- `renderView()` 追加 case（`skillAnalysis` / `skillCreate`）の描画不整合は検出されなかった。
- legacy alias `skill-center` の正規化経路も問題なし。
- Note: screenshot harness は `advanced route fallback` で安定化したが、`currentView` 注入による direct 画面到達は auth/persist 初期化の影響を受けやすい。Phase 12 Task 4 で `UT-IMP-SKILL-LIFECYCLE-ROUTING-DIRECT-RENDERVIEW-CAPTURE-GUARD-001` として未タスク化し、`docs/30-workflows/unassigned-task/task-imp-skill-lifecycle-routing-direct-renderview-capture-guard-001.md` へ formalize 済み。
