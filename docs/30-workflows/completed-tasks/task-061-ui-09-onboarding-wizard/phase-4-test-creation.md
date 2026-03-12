# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-UI-09-ONBOARDING-WIZARD |
| Phase | 4 |
| Phase名 | テスト作成 |
| ステータス | completed |
| 前提Phase | Phase 1, Phase 2, Phase 3 |
| 後続Phase | Phase 5 |

## 目的

4 step interaction、overlay shell、store persistence、display name fallback、skill import handoff を検証するテスト仕様を作成する。

## 実行タスク

- タスク1: component / hook テスト観点を定義する
- タスク2: store / theme / import mock 契約を定義する
- タスク3: accessibility と rerun path の手動確認観点を定義する

## 参照資料

| 参照資料 | パス | 説明 |
| --- | --- | --- |
| Phase 1 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-1/` | requirements、scope、AC |
| Phase 2 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-2/` | 設計一式 |
| Phase 3 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-3/` | review 判定 |
| SuggestionBubble | `apps/desktop/src/renderer/components/atoms/SuggestionBubble/index.tsx` | Step 2 テスト前提 |
| EmptyState | `apps/desktop/src/renderer/components/atoms/EmptyState/index.tsx` | 完了画面テスト前提 |

### システム仕様（aiworkflow-requirements）

| 参照資料 | パス | 内容 |
| --- | --- | --- |
| component testing | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | component test 構成 |
| accessibility testing | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md` | keyboard と focus 観点 |
| quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | test gate 基準 |

## 統合テスト連携

| 観点 | 連携内容 |
| --- | --- |
| interaction test | Step 1-4 の enable / disable 条件を component test 化する |
| persistence test | `store:set`, `theme:set`, `importSkill` の呼び出しを mock で検証する |
| manual handoff | rerun、skip、complete、responsive は Phase 11 へ引き継ぐ |

## 成果物

| 成果物 | パス |
| --- | --- |
| test-specification | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-4/test-specification.md` |
| test-cases | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-4/test-cases.md` |
| mock-contracts | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-4/mock-contracts.md` |

## 完了条件

- [x] component / hook / accessibility の観点が揃っている
- [x] store / theme / import mock 契約が定義されている
- [x] Phase 11 へ渡す手動確認観点が整理されている

## 次Phase

Phase 5: 実装
