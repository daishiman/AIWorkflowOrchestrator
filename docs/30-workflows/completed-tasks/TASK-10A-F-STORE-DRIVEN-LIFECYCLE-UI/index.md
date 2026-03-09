# TASK-10A-F Store-Driven Lifecycle UI - タスク実行仕様書

## メタ情報

| 項目       | 内容                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------- |
| タスクID   | TASK-10A-F                                                                                  |
| 機能名     | task-10a-f-store-driven-lifecycle-ui                                                        |
| 作成日     | 2026-03-09                                                                                  |
| 実行モード | P50該当: 検証・補完モード                                                                   |
| 依存タスク | TASK-10A-C, TASK-10A-D, TASK-10A-E-C                                                        |
| 後続タスク | TASK-10A-G                                                                                  |
| 監査対象   | 本ブランチ実装 + aiworkflow-requirements 正本仕様 + task-specification-creator テンプレート |

## 概要

TASK-10A-F の現行実装責務は、`useSkillAnalysis.ts` に残っていた Renderer 直接 `window.electronAPI.skill.*` 呼び出しを `agentSlice` の Store action / 個別セレクタ経由へ統一し、`SkillAnalysisView` / `SkillCreateWizard` の責務境界を安定化することにある。  
本 workflow は、すでに実装済みの内容を P50 の検証・補完モードで再構成し、誤って `SkillImportDialog` 移行タスクとして記述されていた仕様を現実の責務へ補正する。

## P50 判定

| 判定    | 根拠                                                                                                          | 対応                                                            |
| ------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| P50該当 | `useSkillAnalysis.ts`, `SkillCreateWizard.tsx`, `SkillAnalysisView.tsx`, `agentSlice.ts` に対象実装が既に存在 | 全Phaseを「実装の再現」ではなく「検証・補完・同期」モードで扱う |

## 正式スコープ

### 含む

1. `useSkillAnalysis.ts` の direct IPC 排除と Store action / 個別セレクタ利用
2. `SkillAnalysisView.tsx` の表示責務と hook 境界の検証
3. `SkillCreateWizard.tsx` の `useCreateSkill()` 利用継続の検証
4. TASK-10A-G に渡す残課題と統合観点の整理

### 含まない

1. `SkillImportDialog.tsx` の selector migration
2. `SkillEditor.tsx` の残存直接 IPC 排除
3. IPC / Preload / Main Process 契約変更
4. 新規 Store state 追加

## 依存関係

| タスク       | 役割                                              |
| ------------ | ------------------------------------------------- |
| TASK-10A-C   | `SkillCreateWizard` の Store action 利用基盤      |
| TASK-10A-D   | `agentSlice` へ skill lifecycle state/action 追加 |
| TASK-10A-E-C | import lifecycle と selector/useShallow 設計      |
| TASK-10A-F   | create/analyze 導線の direct IPC 排除             |
| TASK-10A-G   | 残存直接 IPC と統合テスト強化                     |

## 参照する正本仕様

| 区分         | 正本                                                                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 状態管理     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                       |
| 実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                                                        |
| UI機能       | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                                                    |
| エラー/品質  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`, `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` |
| 台帳/教訓    | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`       |
| 型/契約      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                                                  |

## Phase 一覧

| Phase | 名称                                           | 目的                                         |
| ----- | ---------------------------------------------- | -------------------------------------------- |
| 1     | [要件定義](phase-1-requirements.md)            | P50前提で正しい責務と受け入れ基準を固定する  |
| 2     | [設計](phase-2-design.md)                      | state境界・責務境界・テスト観点を設計する    |
| 3     | [設計レビューゲート](phase-3-design-review.md) | 要件・設計・正本仕様の整合を判定する         |
| 4     | [テスト作成](phase-4-test-creation.md)         | 既存テスト/監査コマンドの観点を整理する      |
| 5     | [実装](phase-5-implementation.md)              | 既実装が設計どおりであることを確認する       |
| 6     | [テスト拡充](phase-6-test-expansion.md)        | error path と再分析 path を補強する          |
| 7     | [カバレッジ確認](phase-7-coverage-check.md)    | analysis/create 導線のカバレッジを確認する   |
| 8     | [リファクタリング](phase-8-refactoring.md)     | 責務分離と読みやすさを確認する               |
| 9     | [品質検証](phase-9-quality-assurance.md)       | lint/typecheck/test/grep を確認する          |
| 10    | [最終レビュー](phase-10-final-review.md)       | スコープ・品質・正本同期を最終判定する       |
| 11    | [手動テスト](phase-11-manual-test.md)          | analysis/create 導線の UI 証跡を確認する     |
| 12    | [ドキュメント更新](phase-12-documentation.md)  | 正本仕様・未タスク・教訓・入口導線を同期する |
| 13    | [完了・PR準備](phase-13-pr-creation.md)        | 成果物確認とユーザー引き継ぎだけを行う       |

## Phase 完了時の必須アクション

1. 各Phaseの全タスクを100%実行したことを明記する。
2. `artifacts.json` へ当該Phaseの成果物を登録する。
3. Phase 11 は `TC-ID ↔ screenshot`、Phase 12 は `正本仕様 ↔ 変更理由 ↔ 未タスク` を同期する。
4. コミット / PR はユーザーの明示許可があるまで実行しない。
