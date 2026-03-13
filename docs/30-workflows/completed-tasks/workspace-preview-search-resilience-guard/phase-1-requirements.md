# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001 |
| Phase      | 1                                                    |
| Phase名    | 要件定義                                             |
| ステータス | completed                                            |
| 前提Phase  | なし                                                 |
| 後続Phase  | Phase 2                                              |

## 目的

04C の苦戦箇所を search / preview / error taxonomy / Phase 12 sync の 4 concern に分解し、今回の workflow が何を扱い、何を扱わないかを固定する。

## 実行タスク

- タスク1: Issue #1161、未タスク指示書、04C 完了 workflow から元要求を抽出する
- タスク2: 機能要件、非機能要件、受け入れ基準、除外範囲を定義する
- タスク3: SubAgent 単位の責務分離と直列 / 並列条件を明文化する

### タスク1: 元要求の正規化

1. `docs/30-workflows/completed-tasks/task-imp-workspace-preview-search-resilience-guard-001.md` を元要求の正本とする。
2. `docs/30-workflows/issues/issue-1161.md` を GitHub 側の一次情報として突き合わせる。
3. `TASK-UI-04C-WORKSPACE-PREVIEW` の完了 workflow と system spec から再利用すべき契約を抽出する。
4. `indexes/resource-map.md` と `indexes/quick-reference.md` を起点に、broad query が 0 件のときは 1概念1クエリへ分割して再検索する。

### タスク2: スコープ定義

| 区分     | 内容                                                                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 含む     | fuzzy no-match / stable sort / top 10 制御、renderer timeout + retry、parse / transport / crash / no-match taxonomy、Phase 12 再同期ルール |
| 含まない | 04C 自体の UI リデザイン、新規 preview renderer、`file:read` IPC 全面変更、Workspace Chat 本体機能追加                                     |

### タスク3: 責務分離

| concern              | 主担当     | 直列 / 並列ルール                                         |
| -------------------- | ---------- | --------------------------------------------------------- |
| search resilience    | SubAgent-A | Phase 1 では直列、Phase 2 で preview concern と並列化可能 |
| preview resilience   | SubAgent-B | Phase 1 では直列、Phase 2 で search concern と並列化可能  |
| error taxonomy       | SubAgent-C | Phase 2 で search / preview の設計結果を受けて定義        |
| docs / Phase 12 sync | SubAgent-D | Phase 3 gate と Phase 12 planning を担当                  |

## 参照資料

| 参照資料        | パス                                                                                           | 説明                 |
| --------------- | ---------------------------------------------------------------------------------------------- | -------------------- |
| 元未タスク      | `docs/30-workflows/completed-tasks/task-imp-workspace-preview-search-resilience-guard-001.md`  | 元要件               |
| related issue   | `docs/30-workflows/issues/issue-1161.md`                                                       | Issue 本文           |
| parent workflow | `docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/`            | 04C 完了 workflow    |
| Phase 1 成果物  | `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/phase-1/` | 要件 / AC / spec map |

### システム仕様（aiworkflow-requirements）

| 参照資料                             | パス                                                                                        | 内容                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| arch-state-management                | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | preview / quick search の state ownership                      |
| api-ipc-system                       | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | `file:read` 再利用契約                                         |
| security-electron-ipc                | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | renderer timeout を local 制御へ閉じる条件                     |
| security-input-validation            | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md`            | preview fallback の sanitize / URL 検証を崩さない条件          |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | match gate、renderer local timeout、parse recoverable fallback |
| ui-ux-components                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | UI語彙と 04C catalog 上の位置づけ                              |
| ui-ux-search-panel                   | `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`                   | QuickFileSearch dialog 契約                                    |
| ui-ux-navigation                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | shortcut / focus trap / preview auto-open 契約                 |
| ui-ux-feature-components             | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | 04C の UI 構成と苦戦箇所                                       |
| error-handling                       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | preview error taxonomy                                         |
| task-workflow                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 04C 完了節と related UT                                        |
| lessons-learned                      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 共通ガード化の目的                                             |
| ui-ux-design-system                  | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  | QuickFileSearch dialog の modal token                          |

## 実行手順

### ステップ1: 元要求と 04C 証跡の照合

- Issue #1161 と未タスク指示書の task ID、目的、スコープを一致させる。
- 04C 完了 workflow と `.claude/skills/aiworkflow-requirements/references/task-workflow.md` から、既に解決済みの難所 3 件を抽出する。

### ステップ2: 要件と除外範囲の固定

- 機能要件を search resilience / preview resilience / error taxonomy / docs sync の 4 つに整理する。
- 04C そのものの再実装や UI リデザインを除外する。

### ステップ3: SubAgent 分担と Gate ルールの定義

- Phase 1 では concern inventory と spec extraction を直列で実施する。
- Phase 2 では SubAgent-A/B を並列、SubAgent-C/D をそれらの結果の上で定義する。

## 統合テスト連携

| 観点                | 連携内容                                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| search test         | `useQuickFileSearch.test.ts` に no-match / stable sort / top 10 の future testcase を紐づける               |
| preview test        | `PreviewPanel.test.tsx` に timeout / retry / loading release の future testcase を紐づける                  |
| error boundary test | `PreviewErrorBoundary.test.tsx` に parse / crash / fallback の future testcase を紐づける                   |
| docs sync test      | `verify-unassigned-links.js` と `audit-unassigned-tasks.js` を Phase 12 の future validation として紐づける |

## 多角的チェック観点

- 共通観点は `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/phase-common-governance.md` を正本とし、security / UI/UX / architecture / API / data / error / performance / accessibility / Electron 層を適用する。

## サブタスク管理

- SubAgent 分担、直列 / 並列ルール、3ファイル以内の関心分離、canonical root / mirror drift の扱いは `phase-common-governance.md` と `outputs/phase-2/subagent-lane-plan.md` に従う。

## タスク100%実行確認

- phase 本文、`outputs/phase-1/`, `artifacts.json`, `outputs/artifacts.json`, root 監査台帳の同期が揃って初めて完了扱いとする。

## 成果物

| 成果物                  | パス                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| requirements-definition | `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/phase-1/requirements-definition.md` |
| acceptance-criteria     | `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/phase-1/acceptance-criteria.md`     |
| spec-reference-map      | `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/phase-1/spec-reference-map.md`      |

## 完了条件

- [x] 元要求、Issue、04C 完了証跡の task ID / 目的 / scope が一致している
- [x] 4 concern が別責務として説明できる
- [x] Phase 1-3 を先に確定する Gate が明記されている
- [x] `.claude` 正本仕様の参照先と抽出手順が整理されている

## 次Phase

Phase 2: 設計
