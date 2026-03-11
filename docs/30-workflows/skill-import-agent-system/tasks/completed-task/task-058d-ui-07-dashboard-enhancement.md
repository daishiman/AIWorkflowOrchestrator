---
id: TASK-UI-07-DASHBOARD-ENHANCEMENT
tier: 4
title: ホーム画面リデザイン ─ 挨拶・サジェスチョン・タイムライン
phase: 6
depends_on:
  [
    TASK-UI-00-DESIGN-FOUNDATION,
    TASK-UI-01-STORE-IPC-ARCHITECTURE,
    TASK-UI-02-GLOBAL-NAV-CORE,
  ]
parallel_with: [TASK-UI-08-NOTIFICATION-CENTER]
blocks: [TASK-UI-09-ONBOARDING-WIZARD]
status: completed
priority: medium
estimated_complexity: small
tags: [frontend, renderer, home, dashboard, tap-and-discover]

execution:
  mode: sequential
  timeout_minutes: 45
  retry_count: 1
  allow_partial: false

verification:
  auto_verify: true
  require_tests: true
  require_typecheck: true

artifacts:
  creates:
    - docs/30-workflows/completed-tasks/task-058d-ui-07-dashboard-enhancement/index.md
    - docs/30-workflows/completed-tasks/task-058d-ui-07-dashboard-enhancement/phase-1-requirements.md
    - docs/30-workflows/completed-tasks/task-058d-ui-07-dashboard-enhancement/phase-2-design.md
    - docs/30-workflows/completed-tasks/task-058d-ui-07-dashboard-enhancement/phase-3-design-review.md
    - docs/30-workflows/completed-tasks/task-058d-ui-07-dashboard-enhancement/phase-4-test-creation.md
    - docs/30-workflows/completed-tasks/task-058d-ui-07-dashboard-enhancement/phase-5-implementation.md
    - docs/30-workflows/completed-tasks/task-058d-ui-07-dashboard-enhancement/phase-6-test-expansion.md
    - docs/30-workflows/completed-tasks/task-058d-ui-07-dashboard-enhancement/phase-7-coverage-check.md
    - docs/30-workflows/completed-tasks/task-058d-ui-07-dashboard-enhancement/phase-8-refactoring.md
    - docs/30-workflows/completed-tasks/task-058d-ui-07-dashboard-enhancement/phase-9-quality-assurance.md
    - docs/30-workflows/completed-tasks/task-058d-ui-07-dashboard-enhancement/phase-10-final-review.md
    - docs/30-workflows/completed-tasks/task-058d-ui-07-dashboard-enhancement/phase-11-manual-test.md
    - docs/30-workflows/completed-tasks/task-058d-ui-07-dashboard-enhancement/phase-12-documentation.md
    - docs/30-workflows/completed-tasks/task-058d-ui-07-dashboard-enhancement/phase-13-pr-creation.md
    - docs/30-workflows/completed-tasks/task-058d-ui-07-dashboard-enhancement/artifacts.json
    - docs/30-workflows/completed-tasks/task-058d-ui-07-dashboard-enhancement/outputs/verification-report.md
  modifies:
    - apps/desktop/package.json
    - apps/desktop/src/renderer/views/DashboardView/index.tsx
    - apps/desktop/src/renderer/views/DashboardView/DashboardView.test.tsx
    - apps/desktop/src/renderer/views/DashboardView/components/dashboardContent.ts
    - apps/desktop/src/renderer/views/DashboardView/components/dashboardContent.test.ts
    - apps/desktop/src/renderer/views/DashboardView/components/GreetingHeader.tsx
    - apps/desktop/src/renderer/views/DashboardView/components/DashboardSuggestionSection.tsx
    - apps/desktop/src/renderer/views/DashboardView/components/DashboardSuggestionCard.tsx
    - apps/desktop/src/renderer/views/DashboardView/components/RecentTimeline.tsx
    - apps/desktop/src/renderer/phase11-dashboard-home.tsx
    - apps/desktop/src/renderer/phase11-dashboard-home.html
    - apps/desktop/scripts/capture-dashboard-home-phase11.mjs
---

# TASK-UI-07-DASHBOARD-ENHANCEMENT: ホーム画面リデザイン ─ 挨拶・サジェスチョン・タイムライン

## 仕様書ディレクトリ（task-specification-creator 準拠）

以下のディレクトリに `index.md` と Phase 1〜13 の仕様書を作成済み。

- `docs/30-workflows/completed-tasks/task-058d-ui-07-dashboard-enhancement/`
- Phase 1〜12 の成果物は `outputs/phase-1` 〜 `outputs/phase-12` に作成済み
- `artifacts.json` は `completed`、Phase 13 は `skipped` に同期済み

本ファイルは親タスクや索引から参照される管理エントリであり、
実行時の正本は上記ディレクトリ配下の各 Phase 仕様書とする。

## 概要

既存の `DashboardView` を「ホーム」体験へ再定義する。
統計カード中心の構成を廃止し、挨拶、サジェスチョン、シンプルタイムラインで次の一手が分かる画面へ置き換える。

## 入力

- `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-058d-ui-07-dashboard-enhancement.md`
- `apps/desktop/src/renderer/views/DashboardView/index.tsx`
- `apps/desktop/src/renderer/store/slices/dashboardSlice.ts`
- `apps/desktop/src/renderer/store/index.ts`

## 出力

- `task-058d-ui-07-dashboard-enhancement/index.md`: 全 Phase の実行入口
- `phase-1-requirements.md` 〜 `phase-13-pr-creation.md`: 13 Phase 仕様書
- `outputs/phase-1` 〜 `outputs/phase-12`: 実行成果物
- `outputs/phase-11/screenshots/`: 手動検証スクリーンショット
- `outputs/verification-report.md`: 実装・仕様・validator の検証結果

## 仕様書作成ステータス

- [x] ブランチ作成完了（`docs/task-058d-ui-07-dashboard-enhancement-specs`）
- [x] `task-058d-ui-07-dashboard-enhancement/` ディレクトリ作成
- [x] Phase 1〜3 の要件・設計・レビュー仕様を先行作成
- [x] Phase 4〜13 の実行仕様を作成
- [x] `aiworkflow-requirements` 正本参照を各 Phase に反映
- [x] Phase 4〜12 の実装、テスト、スクリーンショット検証、仕様同期を完了
- [x] コミット、PR は未実施

## Atent Team（SubAgent）分割

| SubAgent | 関心ごと      | 成果物                                 |
| -------- | ------------- | -------------------------------------- |
| A        | UX/用語変換   | Phase 1, 2 の文言・Tap & Discover 要件 |
| B        | Renderer 構造 | component 分割設計                     |
| C        | 状態/導線     | selector / `historySearch` handoff     |
| D        | 品質/文書     | review gate、Phase 12、検証レポート    |

## システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                              | 反映ポイント                                      |
| -------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------- |
| UI設計原則           | `.agents/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`    | Tap & Discover、ホーム文言                        |
| マスターデザイン     | `.agents/skills/aiworkflow-requirements/references/master-design.md`              | Dashboard→ホーム命名変換の境界                    |
| デザインシステム     | `.agents/skills/aiworkflow-requirements/references/ui-ux-design-system.md`        | token / motion                                    |
| Atoms 実装パターン   | `.agents/skills/aiworkflow-requirements/references/ui-ux-atoms-patterns.md`       | SuggestionBubble / EmptyState / RelativeTime 制約 |
| UIコンポーネント台帳 | `.agents/skills/aiworkflow-requirements/references/ui-ux-components.md`           | atoms 再利用                                      |
| UI構造ルール         | `.agents/skills/aiworkflow-requirements/references/arch-ui-components.md`         | view-local molecule 分離                          |
| ディレクトリ構造     | `.agents/skills/aiworkflow-requirements/references/directory-structure.md`        | `views/DashboardView/components/` 配置方針        |
| 機能 UI パターン     | `.agents/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | TASK-UI-03 の参照                                 |
| 状態管理             | `.agents/skills/aiworkflow-requirements/references/arch-state-management.md`      | selector / navigation                             |
| ナビゲーション       | `.agents/skills/aiworkflow-requirements/references/ui-ux-navigation.md`           | `dashboard` / `historySearch` の契約境界          |
| Desktop IPC API      | `.agents/skills/aiworkflow-requirements/references/api-endpoints.md`              | `historySearch` 既存 API の再利用                 |
| System IPC           | `.agents/skills/aiworkflow-requirements/references/api-ipc-system.md`             | 新規 IPC 追加不要の確認                           |
| エラーハンドリング   | `.agents/skills/aiworkflow-requirements/references/error-handling.md`             | empty / loading / invalid data fallback           |
| セキュリティ原則     | `.agents/skills/aiworkflow-requirements/references/security-principles.md`        | 新規 IPC / Preload を増やさない                   |
| テストパターン       | `.agents/skills/aiworkflow-requirements/references/testing-component-patterns.md` | `useAppStore` mock                                |
| A11y テスト          | `.agents/skills/aiworkflow-requirements/references/testing-accessibility.md`      | keyboard / SR                                     |
| 品質要件             | `.agents/skills/aiworkflow-requirements/references/quality-requirements.md`       | UI カバレッジ閾値                                 |
| タスク台帳           | `.agents/skills/aiworkflow-requirements/references/task-workflow.md`              | completed / skipped 運用                          |
| lessons learned      | `.agents/skills/aiworkflow-requirements/references/lessons-learned.md`            | docs-heavy 再発防止                               |

## 検証条件

- [x] 「ホーム」文言と `dashboard` 内部 ID の境界が維持される
- [x] 統計カード撤去後も次アクションが 2〜3 CTA で提示される
- [x] `historySearch` handoff が明確である
- [x] atoms API を壊さずに card UI を実現する設計である
- [x] 新規 slice / IPC / nav contract 文言変更を持ち込まない
- [x] 実装後の Phase 12 同期先が明記されている
