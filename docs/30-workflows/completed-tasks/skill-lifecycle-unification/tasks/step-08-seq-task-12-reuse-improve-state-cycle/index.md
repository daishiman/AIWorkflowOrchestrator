# ライフサイクル状態遷移完成（ReuseReady + Improve サイクル）- タスク実行仕様書

## メタ情報

| 項目         | 内容                                                                |
| ------------ | ------------------------------------------------------------------- |
| タスクID     | TASK-IMP-LIFECYCLE-REUSE-IMPROVE-CYCLE-001                          |
| タスク名     | lifecycle-reuse-improve-cycle                                       |
| 分類         | 実装                                                                |
| 対象機能     | ReuseReady 状態の実装 + ImproveReady → Running 再実行サイクルの実装 |
| 優先度       | 高                                                                  |
| 見積もり規模 | 中規模                                                              |
| ステータス   | spec_created                                                        |
| 作成日       | 2026-03-17                                                          |

## タスク概要

### 目的

ui-ux-diagrams.md の Core Journey 状態遷移図で定義されている `Review --> ReuseReady: accepted` と `ImproveReady --> Running: improve` を実装する。現在、`packages/shared/src/types/skill.ts` の SkillExecutionStatus に `"review"` / `"improve_ready"` / `"reuse_ready"` 状態が存在せず（P32 準拠: 型定義の正本は packages/shared であり agentSlice.ts はこの型を import しているだけである）、SkillLifecyclePanel に「採用して再利用」アクションが一切ない。また applySkillImprovements() 完了後の再実行パスが存在しない。本タスクはこれらの欠落した遷移を実装し、ライフサイクル導線を完成させる。

### 背景

現在の問題:

1. D-01: `"review"` / `"improve_ready"` / `"reuse_ready"` 状態が `packages/shared/src/types/skill.ts` の SkillExecutionStatus に存在しない（idle / running / permission_pending / completed / cancelled / error の6状態のみ）。P32 準拠: 型定義の正本は packages/shared/src/types/skill.ts であり、agentSlice.ts はこの型を import しているだけである
2. D-01: SkillLifecyclePanel に「採用して再利用」ボタン・状態変数・遷移ロジックが一切ない
3. D-03: applySkillImprovements() 完了後、currentAnalysis が更新されるだけで isExecuting / skillExecutionStatus は変化しない。改善後の再実行パスが存在しない
4. ui-ux-diagrams.md L52: `Review --> ReuseReady: accepted` が定義されているが未実装
5. ui-ux-diagrams.md L50: `ImproveReady --> Running: improve` が定義されているが明示的サイクルがない
6. ui-ux-realization.md L18: Reuse フェーズ「後でもう一度使いたい」→ CTA「もう一度使う」が定義されているが未実装

### 最終ゴール

`Review → ReuseReady → もう一度使う（再利用導線へ）` と `ImproveReady → Running（改善後再実行）` の両サイクルを UI 上で完結させる。

### 成果物一覧

| 種別       | 成果物                             | 配置先                                                                                               |
| ---------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 仕様書     | index.md / phase-1〜13             | `docs/30-workflows/skill-lifecycle-unification/tasks/step-08-seq-task-12-reuse-improve-state-cycle/` |
| 設計成果物 | outputs/phase-\*/                  | 上記ディレクトリ配下                                                                                 |
| コード     | agentSlice.ts, SkillLifecyclePanel | `apps/desktop/src/renderer/` 配下の該当ファイル                                                      |

## 前提タスク

| 依存タスク                           | 依存 Phase | 理由                                                                 |
| ------------------------------------ | ---------- | -------------------------------------------------------------------- |
| TASK-10A-D（agentSlice 基盤）        | 完了済み   | SkillExecutionStatus 型・executeSkill アクションの基盤が存在する前提 |
| TASK-10A-F-STORE-DRIVEN-LIFECYCLE-UI | 完了済み   | SkillLifecyclePanel が Store 駆動で実装されている前提                |

## 参照ファイル

| 参照資料             | パス                                                                  | 内容                                               |
| -------------------- | --------------------------------------------------------------------- | -------------------------------------------------- |
| UI/UX 状態遷移図     | `docs/30-workflows/skill-lifecycle-unification/ui-ux-diagrams.md`     | ReuseReady / ImproveReady → Running の遷移定義     |
| UI/UX 一次導線       | `docs/30-workflows/skill-lifecycle-unification/ui-ux-realization.md`  | Reuse フェーズ要件「もう一度使う」CTA の仕様       |
| agentSlice           | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                | SkillExecutionStatus 型・現在のアクション定義      |
| SkillLifecyclePanel  | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`  | Review 状態後の UI と CTA の現状確認               |
| SkillManagementPanel | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx` | selectSkillByName / executeSkill 導線の確認        |
| navigationSlice      | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`           | navigateTo / setCurrentView の既存インターフェース |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                        | 内容                                     |
| -------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------- |
| ナビゲーション正本         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | GlobalNavStrip / ViewType 仕様           |
| 機能別コンポーネント       | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | SkillLifecyclePanel / AgentView 仕様     |
| アーキテクチャ実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Zustand 個別セレクタパターン（P31 対策） |
| 状態管理ルール             | `.claude/rules/03-state-management.md`                                                      | Zustand 設計原則・個別セレクタ使用義務   |
| arch-state-management-core | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`           | 状態管理方針、セレクタ命名規約           |

## 受入基準（AC）

| ID    | 基準                                                                                                                                                 |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1  | `packages/shared/src/types/skill.ts` の SkillExecutionStatus 型に `"review"` / `"improve_ready"` / `"reuse_ready"` の3値が追加されている（P32 準拠） |
| AC-2  | Review 状態の SkillLifecyclePanel に「受理して再利用」CTA が表示される                                                                               |
| AC-3  | 「受理して再利用」CTA クリックで skillExecutionStatus が `"reuse_ready"` に遷移する                                                                  |
| AC-4  | `reuse_ready` 状態の SkillLifecyclePanel に再利用導線カードが表示される（SkillManagementPanel または AgentView への遷移 UI）                         |
| AC-5  | ImproveReady 状態の SkillLifecyclePanel に「改善を適用して再実行」CTA が表示される                                                                   |
| AC-6  | 「改善を適用して再実行」CTA クリックで applySkillImprovements() 実行後に skillExecutionStatus が `"running"` に遷移する                              |
| AC-7  | Review 状態でない場合（completed / error 等）は「受理して再利用」CTA が表示されない                                                                  |
| AC-8  | ImproveReady 状態でない場合は「改善を適用して再実行」CTA が表示されない                                                                              |
| AC-9  | Apple HIG 準拠（カラーパレット、8px グリッド、アニメーション 200-300ms）                                                                             |
| AC-10 | 既存の 6 状態（idle / running / permission_pending / completed / cancelled / error）の動作が変化しない                                               |

## タスク分解サマリー

| ID   | フェーズ   | サブタスク名       | 責務                                                                  | 依存 |
| ---- | ---------- | ------------------ | --------------------------------------------------------------------- | ---- |
| T-01 | Phase 1    | 要件定義           | 現状調査・遷移条件・受入基準・スコープを整理する                      | -    |
| T-02 | Phase 2    | 設計確定           | 型拡張・アクション設計・UI遷移フローを確定する                        | T-01 |
| T-03 | Phase 3    | 設計レビューゲート | 状態遷移図・一次導線との整合性・設計妥当性を判定する                  | T-02 |
| T-04 | Phase 4-7  | テスト・実装       | TDD で ReuseReady 状態と Improve サイクルを実装しカバレッジを確保する | T-03 |
| T-05 | Phase 8-13 | 品質・ドキュメント | リファクタリング・品質検証・ドキュメント化を行う                      | T-04 |

## Phase 一覧

| Phase | 名称             | 仕様書                                                 | ステータス  |
| ----- | ---------------- | ------------------------------------------------------ | ----------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)   | not_started |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)               | not_started |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md) | not_started |
| 4     | テスト作成       | phase-4-test-creation.md                               | not_started |
| 5     | 実装             | phase-5-implementation.md                              | not_started |
| 6     | テスト拡充       | phase-6-test-expansion.md                              | not_started |
| 7     | カバレッジ確認   | phase-7-coverage-check.md                              | not_started |
| 8     | リファクタリング | phase-8-refactoring.md                                 | not_started |
| 9     | 品質検証         | phase-9-quality-assurance.md                           | not_started |
| 10    | 最終レビュー     | phase-10-final-review.md                               | not_started |
| 11    | 手動テスト       | phase-11-manual-test.md                                | not_started |
| 12    | ドキュメント     | phase-12-documentation.md                              | not_started |
| 13    | PR 作成          | phase-13-pr-creation.md                                | not_started |

## 統合テスト連携（Phase 1〜11 で必須）

- agentSlice の `reuse_ready` 遷移・`acceptSkillResult()` アクションの動作を各 Phase で確認する
- SkillLifecyclePanel の Review 状態での「受理して再利用」CTA 表示条件を確認する
- ImproveReady 状態での「改善を適用して再実行」CTA クリック後の Running 遷移を確認する
- navigationSlice との連携（reuse_ready → SkillManagementPanel / AgentView 遷移）を確認する

## Phase 完了時の必須アクション

- 本 Phase 内の全タスクを 100% 実行完了と記録する
- 成果物パスと完了条件を確認する
- artifacts.json を更新対象として扱う
