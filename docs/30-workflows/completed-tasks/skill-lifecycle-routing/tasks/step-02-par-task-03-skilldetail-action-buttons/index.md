# skilldetail-action-buttons - タスク実行仕様書

## ユーザーからの元の指示

```text
SkillDetailPanel（右スライドインパネル）にスキル編集・分析ボタンを追加する。
インポート済みスキルの詳細パネルから、SkillEditorView および SkillAnalysisView への遷移導線を配線する。
```

## メタ情報

| 項目         | 内容                                      |
| ------------ | ----------------------------------------- |
| タスクID     | TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001   |
| タスク名     | skilldetail-action-buttons                |
| 分類         | UI実装                                    |
| 対象機能     | SkillDetailPanel への編集・分析ボタン追加 |
| 優先度       | 高                                        |
| 見積もり規模 | 小規模                                    |
| ステータス   | spec_created                              |
| 作成日       | 2026-03-17                                |

## タスク概要

### 目的

SkillDetailPanel（SkillCenterView 版）には現在「削除」ボタンのみ存在し、編集・分析への導線がない。本タスクでは SkillDetailPanelProps に `onEdit` / `onAnalyze` prop を追加し、インポート済みスキルの詳細パネルに「エディタで開く」「分析する」の2ボタンを配置して、SkillEditorView と SkillAnalysisView への遷移を可能にする。

### 背景

- SkillCenterView の SkillDetailPanel には「削除」ボタンのみ（danger zone）が存在する
- SkillEditorView は `skill-editor` ViewType として App.tsx に定義済みだが、遷移トリガーがゼロ
- SkillAnalysisView は Task01 で追加される `skillAnalysis` ViewType に対応予定
- ユーザーがスキル詳細を見ている文脈から直接編集・分析に遷移できない問題がある

### 設計パターン（代替案分析の案2: Figma Community「Duplicate to Drafts」パターン）

```
┌─ スキル詳細パネル (450px 右スライドイン) ──────────────┐
│ [← 閉じる]              スキル名                        │
│                                                          │
│ 説明文...                                                │
│ 権限バッジ: Bash / Read / Write                         │
│ ファイル一覧: SKILL.md, agents/, ...                    │
│                                                          │
│ ┌────────────────┐ ┌────────────────┐                  │  ← 追加
│ │  エディタで開く │ │   分析する     │                  │
│ └────────────────┘ └────────────────┘                  │
│                                                          │
│ ─── 危険な操作 ───────────────────────────────────────  │
│ [ツールを削除する]                                      │  ← 既存
└──────────────────────────────────────────────────────────┘
```

### 最終ゴール

インポート済みスキルの詳細パネルから、スキル編集画面（SkillEditorView）とスキル分析画面（SkillAnalysisView）への遷移が1クリックで完了する状態にする。

### 成果物一覧

| 種別       | 成果物                                               | 配置先                                                                                                            |
| ---------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 仕様書     | index.md / phase-1〜3 / artifacts.json               | `docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-03-skilldetail-action-buttons/`                 |
| 設計成果物 | outputs/phase-\*/\*.md                               | `docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-03-skilldetail-action-buttons/outputs/phase-*/` |
| 実装対象   | SkillDetailPanel.tsx / index.tsx / useSkillCenter.ts | 各ファイルのパスは「対象ファイル」参照                                                                            |

## 対象ファイル

| ファイル                                                                                           | 変更内容                                 |
| -------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `apps/desktop/src/renderer/views/SkillCenterView/components/SkillDetailPanel/SkillDetailPanel.tsx` | ボタン追加 + onEdit/onAnalyze props 拡張 |
| `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`                                        | onEdit/onAnalyze ハンドラ接続            |
| `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts`                          | 遷移ロジック追加                         |
| `apps/desktop/src/renderer/store/slices/navigationSlice.ts`                                        | setCurrentSkillName 活用（既存 API）     |

## 受入基準

| AC   | 内容                                                                                                          |
| ---- | ------------------------------------------------------------------------------------------------------------- |
| AC-1 | インポート済みスキルの SkillDetailPanel に「エディタで開く」ボタンが表示される                                |
| AC-2 | 「エディタで開く」クリックで `setCurrentView("skill-editor")` + `setCurrentSkillName(skillName)` が実行される |
| AC-3 | インポート済みスキルの SkillDetailPanel に「分析する」ボタンが表示される                                      |
| AC-4 | 「分析する」クリックで `setCurrentView("skillAnalysis")` が実行される                                         |
| AC-5 | 未インポートスキルでは編集・分析ボタンが表示されない（インポート後のみ有効）                                  |
| AC-6 | モバイル（ボトムシート）でもボタンがアクセス可能                                                              |
| AC-7 | Apple HIG 準拠（ボタンスタイル、スペーシング 8px Grid）                                                       |
| AC-8 | Escape キーでパネルを閉じる既存動作が壊れない                                                                 |

## 依存関係

| 依存タスク                                  | 状態   | 条件                                                                 |
| ------------------------------------------- | ------ | -------------------------------------------------------------------- |
| TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 | 未完了 | Task01 Phase 3 完了後に実行可能（`skillAnalysis` ViewType 追加必要） |

## 参照ファイル

| 参照資料              | パス                                                                                               | 内容                                                |
| --------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| pack parent index     | `docs/30-workflows/skill-lifecycle-routing/index.md`                                               | タスク依存グラフ・実行順序を確認する                |
| SkillDetailPanel 実装 | `apps/desktop/src/renderer/views/SkillCenterView/components/SkillDetailPanel/SkillDetailPanel.tsx` | 現行の props / UI 構造を確認する                    |
| SkillCenterView 実装  | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`                                        | 現行のハンドラ接続を確認する                        |
| useSkillCenter        | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts`                          | 現行の遷移ロジックを確認する                        |
| navigationSlice       | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`                                        | setCurrentView / setCurrentSkillName API を確認する |
| store/types.ts        | `apps/desktop/src/renderer/store/types.ts`                                                         | ViewType 定義を確認する                             |

## タスク分解サマリー

| ID   | フェーズ    | サブタスク名 | 責務                                            | 依存 |
| ---- | ----------- | ------------ | ----------------------------------------------- | ---- |
| T-01 | Phase 1     | 要件定義     | AC 整理・スコープ確定・制約定義                 | -    |
| T-02 | Phase 2     | 設計         | Props 設計・コンポーネント設計・遷移フロー設計  | T-01 |
| T-03 | Phase 3     | 設計レビュー | 設計の矛盾検証・ゲート判定                      | T-02 |
| T-04 | Phase 4-7   | TDD 実装     | テスト作成 → 実装 → テスト拡充 → カバレッジ確認 | T-03 |
| T-05 | Phase 8-10  | 品質保証     | リファクタリング → 品質検証 → 最終レビュー      | T-04 |
| T-06 | Phase 11-13 | 検証・完了   | 手動テスト → ドキュメント → PR                  | T-05 |

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

- SkillDetailPanel の onEdit / onAnalyze ハンドラが正しく呼び出されることを各 Phase で確認する
- setCurrentView / setCurrentSkillName の呼び出しを統合テスト観点の中心に置く
- モバイル（ボトムシート）と デスクトップ（スライドイン）の両レイアウトでボタンが表示されることを確認する

## Phase 完了時の必須アクション

- 本 Phase 内の全タスクを 100% 実行完了と記録する
- 成果物パスと完了条件を確認する
- artifacts.json を更新対象として扱う
