---
id: TASK-10A-F
tier: 2
title: スキルライフサイクルUIのStore駆動統合
phase: 10
depends_on: [TASK-10A-B, TASK-10A-C, TASK-10A-D]
parallel_with: [TASK-10A-E]
blocks: [TASK-10A-G]
status: pending
priority: critical
estimated_complexity: medium
tags: [frontend, renderer, integration, store, ui]

execution:
  mode: sequential
  timeout_minutes: 90
  retry_count: 1
  allow_partial: false

verification:
  auto_verify: true
  require_tests: true
  require_typecheck: true

artifacts:
  creates: []
  modifies:
    - apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
    - apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts
    - apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx
    - apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx
    - apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx
---

# スキルライフサイクルUIのStore駆動統合

## メタ情報

| 項目       | 値                                                    |
| ---------- | ----------------------------------------------------- |
| 担当       | SubAgent-F（Store統合）                               |
| 実行モード | 仕様書作成のみ（実装・コミット・PRなし）              |
| 関心ごと   | UIから直接IPC呼び出しを除去し、store action経由へ統一 |

## 目的

`SkillCreateWizard` と `SkillAnalysisView` の直接 `window.electronAPI` 呼び出しを排除し、`agentSlice` 経由に統一する設計仕様を定義する。作成完了後の一覧同期と分析/改善状態の一貫性を確保し、`TASK-10A-G` の統合テスト基盤を固定する。

## Atent Team 分担（関心ごと分離）

| SubAgent | 担当領域                                 | 実行順          |
| -------- | ---------------------------------------- | --------------- |
| F1       | CreateWizard 経路統一（createSkill）     | 並列            |
| F2       | AnalysisView 経路統一（analyze/improve） | 並列            |
| F3       | 状態整合・回帰テスト観点統合             | 直列（F1/F2後） |

## 実行タスク

- 直接IPC依存の排除方針を定義する
- store action 経由の状態遷移（成功/失敗/再試行）を定義する
- P31対策（個別selector・依存配列ガード）を定義する
- `TASK-10A-G` へ引き渡す回帰テスト観点を定義する

## 参照資料（aiworkflow-requirements）

| 参照資料              | パス                                                                                        | 使用目的                                |
| --------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------- |
| resource-map          | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | 状態管理/API/テスト実装の対象仕様を抽出 |
| quick-reference       | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                         | P31対策・IPCパターン確認                |
| 状態管理仕様          | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | action/selector責務分離                 |
| 実装パターン          | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | store駆動UIパターン                     |
| UI機能仕様            | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | 作成/分析/改善のUI遷移整合を固定        |
| UI設計原則            | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              | a11y・操作一貫性を固定                  |
| Skillインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | create/analyze/improve契約確認          |
| IPC API仕様           | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | チャネル責務境界確認                    |
| IPCセキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | sender/P42/境界検証の順序を固定         |
| エラー仕様            | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーステート定義                      |
| 品質要件              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | テスト・品質ゲート基準                  |
| タスク運用ルール      | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                  | 品質ゲート判定と差戻し条件を固定        |

## aiworkflow抽出トレーサビリティ

| 抽出ステップ | 根拠                            | 結果                                   |
| ------------ | ------------------------------- | -------------------------------------- |
| タスク分類   | `resource-map.md`               | UI実装 + テスト実装 + API設計          |
| パターン固定 | `quick-reference.md`            | P31対策とResult/IPC利用方針を固定      |
| 正本抽出     | `arch-state-management.md` ほか | 状態遷移・契約・エラーの必須観点を確定 |

## 実行手順

1. CreateWizard の直接IPC呼び出し経路を特定し、`useCreateSkill` 経由に統一する仕様を記述する。
2. AnalysisView の analyze/improve 経路を store action へ統一する仕様を記述する。
3. 成功/失敗/再試行時の状態遷移表を定義する。
4. P31再発防止条件（個別selector、安定参照）を明文化する。
5. `TASK-10A-G` に渡す回帰観点（作成後一覧同期、改善後再分析）を定義する。

## 成果物

| 成果物          | パス                                               | 説明                  |
| --------------- | -------------------------------------------------- | --------------------- |
| Store統合仕様書 | `task-044-task-10a-f-store-driven-lifecycle-ui.md` | UIのstore駆動統一方針 |

## 完了条件

- [ ] CreateWizard/AnalysisView の直接IPC依存排除方針が定義されている
- [ ] store action 経由の状態遷移が定義されている
- [ ] P31対策が明文化されている
- [ ] `TASK-10A-G` へ引き渡す回帰観点が定義されている
- [ ] 本タスクでは実装・コミット・PRを行わないことが明記されている
