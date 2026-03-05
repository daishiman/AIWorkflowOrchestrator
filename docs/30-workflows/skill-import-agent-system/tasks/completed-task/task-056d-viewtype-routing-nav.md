---
id: TASK-UI-01-D-VIEWTYPE-ROUTING-NAV
tier: 3
title: ViewType拡張・ルーティング・ナビゲーション整合仕様
phase: 6
depends_on: [TASK-UI-01-A-STORE-SLICE-BASELINE]
parallel_with: [TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN]
blocks: [TASK-UI-01-E-INTEGRATION-GATE-SPEC-SYNC, TASK-UI-02-GLOBAL-NAV-CORE]
status: spec_created
priority: high
estimated_complexity: medium
tags: [frontend, navigation, routing, viewtype]

execution:
  mode: sequential
  timeout_minutes: 50
  retry_count: 1
  allow_partial: false

verification:
  auto_verify: true
  require_tests: true
  require_typecheck: true

artifacts:
  creates:
    - docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056d-viewtype-routing-nav/index.md
    - docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056d-viewtype-routing-nav/phase-1-requirements.md
    - docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056d-viewtype-routing-nav/phase-2-design.md
    - docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056d-viewtype-routing-nav/phase-3-design-review.md
    - docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056d-viewtype-routing-nav/phase-4-test-creation.md
    - docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056d-viewtype-routing-nav/phase-5-implementation.md
    - docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056d-viewtype-routing-nav/phase-6-test-expansion.md
    - docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056d-viewtype-routing-nav/phase-7-coverage-check.md
    - docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056d-viewtype-routing-nav/phase-8-refactoring.md
    - docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056d-viewtype-routing-nav/phase-9-quality-assurance.md
    - docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056d-viewtype-routing-nav/phase-10-final-review.md
    - docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056d-viewtype-routing-nav/phase-11-manual-test.md
    - docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056d-viewtype-routing-nav/phase-12-documentation.md
    - docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056d-viewtype-routing-nav/phase-13-pr-creation.md
    - docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056d-viewtype-routing-nav/artifacts.json
  modifies:
    - apps/desktop/src/renderer/store/types.ts
    - apps/desktop/src/renderer/App.tsx
    - apps/desktop/src/renderer/components/organisms/AppDock/index.tsx
---

# TASK-UI-01-D: ViewType拡張・ルーティング・ナビゲーション整合仕様

## 概要

`workspace` / `skillCenter` / `historySearch` を ViewType に追加する際の更新点を固定し、`App.tsx` とナビゲーション定義の齟齬を防止する。`TASK-UI-02` へ安全に引き渡すための中間仕様を作成する。

## 入力

- `task-056a-a-store-slice-baseline.md` の成果物
- `task-057-ui-02-global-nav-core.md`
- `apps/desktop/src/renderer/store/types.ts`
- `apps/desktop/src/renderer/App.tsx`

## 出力

- `outputs/task-056d-viewtype-routing-map.md`: ViewType追加点、switch網羅表、移行ルール
- `outputs/task-056d-nav-shortcut-contract.md`: ショートカット整合ルール
- `task-056d-viewtype-routing-nav/`: Phase 1〜13のタスク仕様書一式（仕様書作成フェーズ成果物）

## 仕様書作成ステータス

- [x] ブランチ作成完了（`task/task-ui-01-d-viewtype-routing-nav-spec`）
- [x] `task-056d-viewtype-routing-nav/` ディレクトリ作成
- [x] Phase 1〜13仕様書を作成
- [x] aiworkflow-requirements正本参照を反映
- [x] 実装、コミット、PRは未実施

## システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                                        | 反映ポイント             |
| -------------------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| ナビゲーションUI設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | AppDock/遷移導線         |
| アーキテクチャ総論   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | UI層責務、View分離       |
| 状態管理パターン     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | ViewType型とStore境界    |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | exhaustive check、型同期 |

## 実行手順

### Step 1: ViewType拡張対象の固定

- 追加するunion値と影響ファイル一覧を確定する。
- ローカル重複型定義（AppDock側）を削除対象として明示する。

### Step 2: ルーティング網羅設計

- `renderView()` switchの全ケースを定義する。
- `never` 型による網羅チェック手順を記載する。

### Step 3: ナビショートカット整合

- `TASK-UI-02` の NAV_SECTIONS を正本として整合ルールを明記する。
- 移行中（AppDock残存時）の暫定配列と削除タイミングを分離して記載する。

## 検証条件

- [ ] ViewType追加値が仕様上で確定済み
- [ ] App.tsx switch文の網羅条件が明文化済み
- [ ] AppDock重複型定義の解消手順が定義済み
- [ ] NAV_SECTIONS整合ルールがTASK-UI-02正本参照で固定済み

## リスクと対策

| リスク            | 対策                             |
| ----------------- | -------------------------------- |
| ViewType追加漏れ  | 影響ファイル一覧を仕様で固定     |
| switch未網羅      | `never` exhaustive checkを必須化 |
| 旧AppDock定義残存 | Step単位で削除条件を明記         |
