# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-UI-09-ONBOARDING-WIZARD |
| Phase | 2 |
| Phase名 | 設計 |
| ステータス | completed |
| 前提Phase | Phase 1 |
| 後続Phase | Phase 3 |

## 目的

overlay shell、ローカル state、永続化、skill import、theme 切替、display name fallback を実装可能な設計へ落とし込む。

## 実行タスク

- タスク1: コンポーネントと shell 組み込み位置を設計する
- タスク2: state / persistence / selector 利用方針を設計する
- タスク3: navigation、settings rerun、skill import handoff を設計する

### タスク1: コンポーネント設計

| レイヤー | 役割 | 設計方針 |
| --- | --- | --- |
| `OnboardingGate` | 表示判定と store 同期 | `App.tsx` 直下で `onboarding.completed` を読み、overlay 表示だけを担う |
| `OnboardingWizard` | 4 step 全体状態 | local state で完結し、global slice を増やさない |
| step local components | Name / AI Try / Tool Picker / Theme Step | view-local component として wizard 配下に閉じる |
| shared reuse | `SuggestionBubble`, `EmptyState`, `ThemeSelector` | 既存 component を再利用し、shared 側の責務を増やさない |

### タスク2: state / persistence 設計

| concern | 採用する契約 | 理由 |
| --- | --- | --- |
| current step | `useState` | wizard 内だけで閉じる |
| user name | `settingsSlice.userProfile.name` | `dashboard` の表示名 fallback と接続できる |
| completed flag | `window.electronAPI.store.set({ key: "onboarding.completed", value: true })` | 初回起動判定を Main 側に保持できる |
| selected skill | `window.electronAPI.store.set({ key: "onboarding.selectedSkillName", value })` | 完了直後の import handoff を保持できる |
| theme | `useSetThemeMode()` | P31 個別セレクタと現行 `theme` IPC に一致する |

### タスク3: surface integration 設計

| surface | 設計 |
| --- | --- |
| App shell | `dashboard` を残したまま full-screen scrim + modal を重ねる |
| Settings rerun | `settings` 画面から `onboarding.completed=false` と `currentView="dashboard"` を同一操作で行う |
| Dashboard personalization | `useDisplayName()` に `settingsSlice.userProfile.name` fallback を足す |
| Skill import | card data は `label`, `description`, `skillName`, `icon` を持ち、完了時に `importSkill(skillName)` を非同期で呼ぶ |

## 参照資料

| 参照資料 | パス | 説明 |
| --- | --- | --- |
| Phase 1 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-1/` | requirements、scope、AC、SubAgent plan |
| shared components | `apps/desktop/src/renderer/components/atoms/SuggestionBubble/index.tsx` | Step 2 reuse |
| empty state | `apps/desktop/src/renderer/components/atoms/EmptyState/index.tsx` | 完了画面 reuse |
| theme selector | `apps/desktop/src/renderer/components/molecules/ThemeSelector/index.tsx` | Step 4 参照 |
| skill import hook | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` | `importSkill(skillName)` の呼び出し形 |
| theme IPC | `apps/desktop/src/main/ipc/themeHandlers.ts` | `theme.mode` の永続化 |

### システム仕様（aiworkflow-requirements）

| 参照資料 | パス | 内容 |
| --- | --- | --- |
| shared component catalog | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md` | shared / view-local の責務分離 |
| feature catalog | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | SkillCreateWizard と Dashboard Home の設計パターン |
| navigation contract | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md` | overlay と `dashboard` 契約 |
| settings shell | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md` | rerun 導線の配置先 |
| state management | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | local state 優先と P31 |
| task workflow | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | `spec_created` 運用 |

## 統合テスト連携

| 観点 | 連携内容 |
| --- | --- |
| component test | Step 1-4 の local interaction を Phase 4 testcase へ渡す |
| navigation test | rerun path と skip/complete path を Phase 4 と Phase 11 へ渡す |
| persistence test | `store:get/set` と `theme:set` の呼び出しを Phase 4 mock に渡す |

## 成果物

| 成果物 | パス |
| --- | --- |
| component-architecture | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-2/component-architecture.md` |
| state-and-persistence-design | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-2/state-and-persistence-design.md` |
| navigation-and-surface-integration | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-2/navigation-and-surface-integration.md` |
| aiworkflow-requirements-extract | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-2/aiworkflow-requirements-extract.md` |
| traceability-matrix | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-2/traceability-matrix.md` |

## 完了条件

- [x] overlay shell の組み込み位置が確定している
- [x] local state と store / theme IPC の責務が分離されている
- [x] display name fallback と skill import handoff が確定している
- [x] Phase 4 へ渡す設計成果物が出揃っている

## 次Phase

Phase 3: 設計レビュー
