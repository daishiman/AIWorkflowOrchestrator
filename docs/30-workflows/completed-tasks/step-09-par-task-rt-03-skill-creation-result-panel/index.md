# TASK-RT-03: skill-creation-result-panel

## 概要

SkillLifecyclePanel と SkillCreateWizard は plan/execute 後の詳細結果表示パネルを持たない。`RuntimeSkillCreatorPlanResult` には skillName, description, agents[], scripts[], triggers[], anchors[] が含まれ、`RuntimeSkillCreatorExecuteResult` には success, skillName, error 等が含まれるが、これらのリッチなデータ構造は受信されるのみで表示されていない。本タスクは `PlanResultDetailPanel` と `ExecuteResultDetailPanel` コンポーネントを新規実装し、SkillLifecyclePanel のワークフローフローに統合することで、ユーザーが plan/execute の結果詳細を確認できるようにすることを目的とする。`terminal_handoff` は既存の handoff 導線を維持し、今回の detail panel は integrated_api の結果表示に閉じる。

## メタ情報

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| タスクID   | TASK-RT-03                                                    |
| タスク種別 | 新規実装（UI コンポーネント）                                 |
| 優先度     | P1                                                            |
| ステータス | spec_created                                                  |
| 上流ゲート | `../requirements-draft.md`                                    |
| 依存タスク | TASK-RT-02（error types）, TASK-RT-06（SDK message contract） |
| 後続タスク | なし                                                          |
| 作成日     | 2026-03-29                                                    |
| 更新日     | 2026-03-29                                                    |

## 受入基準

| ID   | 基準                                                                            |
| ---- | ------------------------------------------------------------------------------- |
| AC-1 | `PlanResultDetailPanel` コンポーネントが存在し、plan 結果の詳細を表示する       |
| AC-2 | `ExecuteResultDetailPanel` コンポーネントが存在し、execute 結果の詳細を表示する |
| AC-3 | plan/execute 失敗時にエラー状態が表示される（TASK-RT-02 の error types を使用） |
| AC-4 | 両パネルが SkillLifecyclePanel のワークフローフローに統合されている             |
| AC-5 | UI が既存の Tailwind CSS デザインパターンに従っている                           |
| AC-6 | ワークフロー state 変更がパネル更新をトリガーする                               |

## スコープ

**含む**:

- `PlanResultDetailPanel` コンポーネントの新規実装
- `ExecuteResultDetailPanel` コンポーネントの新規実装
- plan 結果の詳細表示（skillName, description, agents, scripts, triggers, anchors, estimatedSteps）
- execute 結果の詳細表示（success/failure, skillName, error メッセージ）
- エラー状態表示（TASK-RT-02 の error types との連携）
- SkillLifecyclePanel への統合
- ワークフロー state 変更に伴うパネル更新
- ユニットテスト

**含まない**:

- error types の定義（TASK-RT-02 の責務）
- LLM adapter のエラーハンドリング（TASK-RT-01 の責務）
- plan/execute ロジックの変更
- IPC channel の変更
- state management store の新規追加（既存 store を利用）
- verify/improve phase の結果表示

## 依存関係

| 種別       | 参照先                           | 役割                                |
| ---------- | -------------------------------- | ----------------------------------- |
| upstream   | `../requirements-draft.md`       | RT lane の要件定義                  |
| upstream   | `../root-workflow-pack/index.md` | lane 共通不変条件と責務分離方針     |
| peer       | TASK-RT-02 (error notification)  | error types と error state の提供元 |
| peer       | TASK-SDK-02 (WorkflowEngine)     | workflow state の管理者             |
| downstream | なし                             | —                                   |

## 現行コードアンカー

| ファイル                                                                  | 現状の役割                                                                  | TASK-RT-03 での扱い                                     |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`      | ワークフロー状態スナップショット表示。plan/execute 結果の詳細表示なし       | PlanResultDetailPanel / ExecuteResultDetailPanel を統合 |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`        | planSkill() / executePlan() を呼び出すが結果詳細のレンダリングなし          | 結果パネルへのデータ橋渡し                              |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`     | plan/execute の raw response を生成                                         | 結果詳細の source of truth                              |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`    | workflow phase / artifact 管理                                              | currentPhase と phaseArtifacts の source of truth       |
| `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx` | 改善提案パネル。UI スタイルの参考                                           | デザインパターンの参考として利用                        |
| `packages/shared/src/types/skillCreator.ts`                               | `RuntimeSkillCreatorPlanResult` / `RuntimeSkillCreatorExecuteResult` 型定義 | コンポーネントの props 型として参照                     |
| `apps/desktop/src/renderer/stores/`                                       | state management stores                                                     | ワークフロー state の取得元                             |

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 真の論点             | plan/execute のリッチな結果データが受信されているが表示されておらず、ユーザーが作成内容を確認できない問題を UI コンポーネントで閉じること                          |
| 依存関係・責務境界   | error types は TASK-RT-02 に依存。表示ロジックのみ本タスクの責務。raw result の保持は SkillLifecyclePanel の local state に閉じ、plan/execute ロジックは変更しない |
| 価値とコストの不均衡 | 既存の raw response を UI で再利用するだけなので、新規 API は不要。共通 UI パーツを抽出すれば detail surface を増やしても複雑性は上がりにくい                      |
| 改善優先順位         | 1. PlanResultDetailPanel 2. ExecuteResultDetailPanel 3. raw result 保持 4. エラー状態表示 5. SkillLifecyclePanel 統合 6. state 連動                                |
| 4条件評価            | 価値性: P1（UX 向上）/ 実現性: 高（既存 raw response の再利用）/ 整合性: 既存型を参照 / 運用性: 独立テスト可能                                                     |

## ディレクトリ構成

```text
step-09-par-task-rt-03-skill-creation-result-panel/
├── index.md
├── artifacts.json
├── phase-1-requirements.md
├── phase-2-design.md
├── phase-3-design-review.md
├── phase-4-test-creation.md
├── phase-5-implementation.md
├── phase-6-test-expansion.md
├── phase-7-coverage-check.md
├── phase-8-refactoring.md
├── phase-9-quality-assurance.md
├── phase-10-final-review.md
├── phase-11-manual-test.md
├── phase-12-documentation.md
├── phase-13-pr-creation.md
└── outputs/
    ├── artifacts.json
    ├── verification-report.md
    ├── phase-1/spec-extraction-map.md
    ├── phase-2/component-design.md
    ├── phase-2/panel-props-catalog.md
    ├── phase-3/design-review-gate.md
    ├── phase-4/test-matrix.md
    ├── phase-11/manual-test-checklist.md
    ├── phase-11/manual-test-result.md
    ├── phase-11/manual-test-report.md
    ├── phase-11/discovered-issues.md
    ├── phase-12/
    │   ├── implementation-guide.md
    │   ├── system-spec-update-summary.md
    │   ├── documentation-changelog.md
    │   ├── unassigned-task-detection.md
    │   ├── skill-feedback-report.md
    │   └── phase12-task-spec-compliance-check.md
    └── phase-13/
        ├── local-check-result.md
        └── change-summary.md
```

## 実装者向けクイックガイド

### 着手条件

- `packages/shared/src/types/skillCreator.ts` の `RuntimeSkillCreatorPlanResult` / `RuntimeSkillCreatorExecuteResult` 型を読了している
- `SkillLifecyclePanel.tsx` の現行ワークフロー表示ロジックを読了している
- `RuntimeSkillCreatorFacade.ts` と `SkillCreatorWorkflowEngine.ts` の raw response / phaseArtifacts 経路を読了している
- `ImprovementProposalPanel.tsx` の UI パターンを参考として確認している
- TASK-RT-02 の error types が利用可能であることに合意している

### 想定変更ポイント

- `apps/desktop/src/renderer/components/skill/PlanResultDetailPanel.tsx` — 新規作成
- `apps/desktop/src/renderer/components/skill/ExecuteResultDetailPanel.tsx` — 新規作成
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` — パネル統合
- `apps/desktop/src/renderer/components/skill/__tests__/PlanResultDetailPanel.test.tsx` — 新規作成
- `apps/desktop/src/renderer/components/skill/__tests__/ExecuteResultDetailPanel.test.tsx` — 新規作成

### 非対象

- error types の定義（TASK-RT-02 の責務）
- plan/execute ロジックの変更
- IPC channel の変更
- state management store の新規追加
- verify/improve phase の結果表示

### 完了イメージ

- `PlanResultDetailPanel` に `RuntimeSkillCreatorPlanResult` を渡すと、skillName, description, agents, scripts, triggers, anchors が一覧表示される
- `ExecuteResultDetailPanel` に `RuntimeSkillCreatorExecuteResult` を渡すと、success/failure, skillName, error が表示される
- plan/execute 失敗時にエラー状態パネルが表示される
- SkillLifecyclePanel のワークフローフロー内で適切なタイミングでパネルが切り替わる
- ワークフロー state の変更に応じてパネルがリアクティブに更新される
- raw result は SkillLifecyclePanel の local state に保持され、不要になったら clear される

### 並列実行メモ

- TASK-RT-03 は TASK-RT-02 の error types に依存するため、error 表示部分は RT-02 完了後に統合
- パネルコンポーネント自体は RT-02 と並列で骨格を実装可能
- SkillLifecyclePanel への統合は両コンポーネント完成後に実施

## Phase 一覧

- [phase-1-requirements.md](./phase-1-requirements.md)
- [phase-2-design.md](./phase-2-design.md)
- [phase-3-design-review.md](./phase-3-design-review.md)
- [phase-4-test-creation.md](./phase-4-test-creation.md)
- [phase-5-implementation.md](./phase-5-implementation.md)
- [phase-6-test-expansion.md](./phase-6-test-expansion.md)
- [phase-7-coverage-check.md](./phase-7-coverage-check.md)
- [phase-8-refactoring.md](./phase-8-refactoring.md)
- [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)
- [phase-10-final-review.md](./phase-10-final-review.md)
- [phase-11-manual-test.md](./phase-11-manual-test.md)
- [phase-12-documentation.md](./phase-12-documentation.md)
- [phase-13-pr-creation.md](./phase-13-pr-creation.md)
