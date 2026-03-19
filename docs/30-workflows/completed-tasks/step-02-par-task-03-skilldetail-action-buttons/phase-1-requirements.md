# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| Phase      | 1                                                        |
| Phase名    | 要件定義                                                 |
| タスクID   | TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001                  |
| 前提Phase  | なし（既存 routing foundation / CTA routing は利用可能） |
| 後続Phase  | Phase 2（設計）                                          |
| ステータス | not_started                                              |
| 作成日     | 2026-03-17                                               |
| 機能名     | skilldetail-action-buttons                               |

## 目的

SkillDetailPanel への編集・分析ボタン追加に必要な要件を整理し、受入基準・スコープ境界・制約条件を明文化する。

## 実行タスク

- P50 チェック: 対象ファイルの現在の実装状態を調査し、既実装部分がないかを確認する
- inventory 整理: SkillDetailPanel の現行 props・UI 構造・既存ボタン（削除）の実装を調べる
- gap 整理: onEdit / onAnalyze prop が存在しない点、DetailPanel 文脈で `currentSkillName` を渡す edit/analyze handoff が未実装である点を確認する
- 受入基準確定: AC-1〜AC-8 を検証可能な形式で再確認し、不足・矛盾を修正する
- 制約整理: 既存 routing foundation / top-level CTA routing との共存、モバイル対応要件、Apple HIG 準拠要件を整理する
- スコープ境界確定: 本タスクで変更するファイルと変更しないファイルを明確にする

## 参照資料

| 参照資料                | パス                                                                                               | 内容                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| SkillDetailPanel 実装   | `apps/desktop/src/renderer/views/SkillCenterView/components/SkillDetailPanel/SkillDetailPanel.tsx` | 現行 props 定義・PanelContent 構造・削除ボタン実装を確認する     |
| SkillCenterView 実装    | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`                                        | useSkillCenter の利用箇所とハンドラ接続パターンを確認する        |
| useSkillCenter          | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts`                          | 現行の遷移ロジックと返却する関数を確認する                       |
| navigationSlice         | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`                                        | setCurrentView / setCurrentSkillName の API シグネチャを確認する |
| store/types.ts          | `apps/desktop/src/renderer/store/types.ts`                                                         | `skill-editor` / `skillAnalysis` を含む ViewType 一覧を確認する  |
| App.tsx renderView      | `apps/desktop/src/renderer/App.tsx`                                                                | `skill-editor` / `skillAnalysis` の renderView 契約を確認する    |
| pack parent index       | `docs/30-workflows/skill-lifecycle-routing/index.md`                                               | 前後タスクと SkillCenter CTA routing の流れを確認する            |
| SkillDetailPanel テスト | `apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillDetailPanel.test.tsx`              | 既存テストの構造・カバレッジ状況を確認する                       |

### システム仕様（aiworkflow-requirements）

> `resource-map.md` の「バグ修正（Skill Lifecycle routing / renderView foundation）」「UI実装」「Store駆動UI / selector migration」を起点に、child companion まで降りて正本仕様を抽出する。

| 参照資料                                                                     | パス                                                                                                                                                  | 内容                                                                                |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| workflow-skill-lifecycle-routing-render-view-foundation                      | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-routing-render-view-foundation.md`                                        | 既存 foundation、`skillAnalysis`、`renderView()`、close 導線、current canonical set |
| ui-ux-navigation                                                             | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                                                               | `skillCenter` / `skillAnalysis` / `skill-editor` の画面遷移契約                     |
| ui-ux-feature-components-reference                                           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-reference.md`                                                             | `SkillCenterView` / `SkillDetailPanel` / `useSkillCenter` の現行 UI 契約            |
| ui-ux-feature-components-advanced                                            | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-advanced.md`                                                              | `SkillEditor` / `SkillEditorView` 系の既存 UI 導線と completed/spec_created の根拠  |
| arch-state-management-core                                                   | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`                                                                     | ViewType 拡張前提、state handoff、new slice 不要の core 契約                        |
| arch-state-management-reference-permissions-import-lifecycle                 | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference-permissions-import-lifecycle.md`                                   | `useSkillCenter` の既存責務、P31 個別セレクタ運用、SkillCenter の状態境界           |
| architecture-implementation-patterns-reference-agent-view-selector-migration | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-agent-view-selector-migration.md`                   | selector migration と P31/P48 の具体パターン                                        |
| ui-ux-components / ui-ux-design-system                                       | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md` / `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`  | Apple HIG、8px grid、Button variant、レスポンシブの UI 非機能要件                   |
| task-workflow / lessons-learned-current                                      | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` / `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` | follow-up backlog、Phase 12 同期先、教訓の入口                                      |

## 実行手順

### ステップ 0: P50 チェック（既実装状態の調査）

```bash
# 対象ファイルの最近のコミット履歴
git log --oneline -10 -- apps/desktop/src/renderer/views/SkillCenterView/components/SkillDetailPanel/SkillDetailPanel.tsx

# onEdit / onAnalyze が既に実装されているか確認
grep -n "onEdit\|onAnalyze" apps/desktop/src/renderer/views/SkillCenterView/components/SkillDetailPanel/SkillDetailPanel.tsx

# useSkillCenter に既存の分析/作成遷移ロジックがあるか確認
grep -n "skill-editor\|skillAnalysis\|handleEdit\|handleAnalyze" apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts
```

既実装が発見された場合は Phase 4-5 を「検証・補完」モードに切り替える（P50 準拠）。

### ステップ 1: 参照資料を確認する

SkillDetailPanel の現行 props 定義（`SkillDetailPanelProps`）と PanelContent の内部構造、および navigationSlice / `renderView()` の既存契約を確認し、本タスクで追加が必要な props と handoff の境界を固定する。

### ステップ 2: 実行タスクを上から順に実施する

inventory・gap・受入基準・制約・スコープ境界を順に処理し、成果物に反映する。

### ステップ 3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、ViewType・ナビゲーション契約・コンポーネント設計のズレを残さない。

### ステップ 4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

本 Phase では要件の整合性を確認する。以下の観点が Phase 4 のテスト設計に引き継がれることを確認する:

- onEdit クリック時の `setCurrentView("skill-editor")` + `setCurrentSkillName(skillName)` 呼び出し
- onAnalyze クリック時の `setCurrentView("skillAnalysis")` 呼び出し
- `isImported === false` の場合にボタンが非表示になること（AC-5）
- Escape キーで既存の onClose ハンドラが発火すること（AC-8）

## 成果物

| 成果物         | パス                                         | 内容                                                           |
| -------------- | -------------------------------------------- | -------------------------------------------------------------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件・受入基準（AC-1〜AC-8）を整理する         |
| スコープ定義書 | `outputs/phase-1/scope-definition.md`        | 対象範囲・除外範囲・既存 routing foundation との境界を明記する |

## 完了条件

- [ ] SkillDetailPanel の現行 props が inventory されている
- [ ] onEdit / onAnalyze prop が存在しないことが確認されている（または既実装の場合はその事実が記録されている）
- [ ] `skillAnalysis` / `skill-editor` の既存 route contract と top-level CTA routing の現状が記録されている
- [ ] AC-1〜AC-8 が検証可能な形式で確定している
- [ ] スコープ境界（変更ファイル / 非変更ファイル）が明確になっている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

- [Phase 2（設計）](./phase-2-design.md) に進む
