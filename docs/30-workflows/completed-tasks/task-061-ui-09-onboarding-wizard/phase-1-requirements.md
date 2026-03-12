# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-UI-09-ONBOARDING-WIZARD |
| Phase | 1 |
| Phase名 | 要件定義 |
| ステータス | completed |
| 前提Phase | なし |
| 後続Phase | Phase 2 |

## 目的

参照元タスク本文の UX 意図を保持しつつ、現行 Renderer / Store / Preload 契約に沿う要件へ補正する。

## 実行タスク

- タスク1: 参照元タスクと現行コードの契約差分を固定する
- タスク2: 依存ゲート、スコープ、受入基準を定義する
- タスク3: Atent Team / SubAgent の責務分担を定義する

### タスク1: 契約差分の固定

1. 参照元タスクの `electronAPI.config` 前提を現行 `electronAPI.store` / `electronAPI.theme` 契約へ置き換える
2. `DashboardView` の表示名が auth profile 側へ偏っている点を洗い出す
3. Step 3 の表示カードと import 対象 `skillName` を分離する

### タスク2: 依存ゲートとスコープ定義

| 区分 | 内容 |
| --- | --- |
| hard dependency | `task-057`, `task-058a`, `task-058b`, `task-059a`, `task-059b`, `task-058c`, `task-058d`, `task-058e`, `task-030` |
| in scope | overlay shell、4 step interaction、store persistence、settings rerun、dashboard personalization、skill import handoff |
| out of scope | 実装、実テスト、Phase 12 の system spec 同期実行、commit、PR |

### タスク3: SubAgent 責務定義

| SubAgent | 主責務 | 完了条件 |
| --- | --- | --- |
| A | 参照元タスク分析、aiworkflow 抽出、契約差分の固定 | requirements-definition と scope-definition が確定している |
| B | shell / navigation / persistence / settings rerun 設計 | overlay 組み込みと再表示導線が確定している |
| C | step copy / mock response / skill card / theme / responsive 設計 | 4 step の UI 契約と card data 方針が確定している |
| D | design review、traceability、Phase 4-13 planning | Phase 3 判定が PASS である |

## 参照資料

| 参照資料 | パス | 説明 |
| --- | --- | --- |
| 参照元タスク | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-061-ui-09-onboarding-wizard.md` | UX 要件の一次情報 |
| task sequence | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-000-master-index.md` | 実施順序と依存ゲート |
| App shell | `apps/desktop/src/renderer/App.tsx` | overlay 組み込み位置 |
| dashboard home | `apps/desktop/src/renderer/views/DashboardView/index.tsx` | 完了後遷移先 |
| greeting content | `apps/desktop/src/renderer/views/DashboardView/components/dashboardContent.ts` | 表示名解決 |
| settings shell | `apps/desktop/src/renderer/views/SettingsView/index.tsx` | 再表示導線の配置先 |
| store selectors | `apps/desktop/src/renderer/store/index.ts` | `useDisplayName`, `useImportSkill`, `useSetThemeMode` |
| store handlers | `apps/desktop/src/main/ipc/storeHandlers.ts` | `store:get/set` 契約 |
| store key validation | `apps/desktop/src/main/ipc/validation.ts` | key 命名制約 |

### システム仕様（aiworkflow-requirements）

| 参照資料 | パス | 内容 |
| --- | --- | --- |
| Tap & Discover / UX language | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | 文言、SuggestionBubble、EmptyState mood |
| feature catalog | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | Dashboard Home、SkillCreateWizard、mobile overlay |
| navigation contract | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md` | `dashboard` と `settings` の契約 |
| settings shell | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md` | `settings` 公開シェル、未認証 reset 除外 |
| state management | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | local state 優先、P31 個別セレクタ |
| IPC security | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | 既存 preload 再利用 |

## 統合テスト連携

| 観点 | 連携内容 |
| --- | --- |
| dashboard integration | 完了後は `dashboard` 上の挨拶と suggestion 導線へ戻る前提を Phase 4 へ渡す |
| settings rerun | `settings` 公開シェルからの再表示導線を Phase 4 と Phase 11 へ渡す |
| skill import | Step 3 の card data と `importSkill(skillName)` の接続条件を Phase 4 と Phase 5 へ渡す |

## 成果物

| 成果物 | パス |
| --- | --- |
| requirements-definition | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-1/requirements-definition.md` |
| scope-definition | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-1/scope-definition.md` |
| acceptance-criteria | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-1/acceptance-criteria.md` |
| subagent-responsibilities | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-1/subagent-responsibilities.md` |

## 完了条件

- [x] 現行契約との差分が固定されている
- [x] hard dependency と out of scope が明記されている
- [x] Atent Team / SubAgent の責務分担が明記されている
- [x] Phase 1-3 完了前に実装へ進まない方針が明記されている

## 次Phase

Phase 2: 設計
