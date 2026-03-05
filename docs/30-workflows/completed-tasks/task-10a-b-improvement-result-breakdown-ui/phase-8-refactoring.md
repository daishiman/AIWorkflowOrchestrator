# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| Phase      | 8                                          |
| タスクID   | UT-TASK-10A-B-003                          |
| 機能名     | task-10a-b-improvement-result-breakdown-ui |
| タスク名   | 改善結果内訳表示実装                       |
| 作成日     | 2026-03-05                                 |
| 前提Phase  | Phase 7                                    |
| 後続Phase  | Phase 9                                    |
| タスク種別 | completed（実装・テスト・文書化完了）      |

## 目的

可読性と再利用性を高めるため、結果表示ロジックの責務境界を整理する。

## 背景

改善結果表示は文言整形・件数算出・表示条件判定が混在しやすく、将来拡張時の変更コストが高くなる。

## 実行タスク

| Task     | 内容                 | 目的                                             | 実行パターン |
| -------- | -------------------- | ------------------------------------------------ | ------------ |
| Task 8-1 | 責務分離方針策定     | 表示ロジックと整形ロジックの分離方針を定義する。 | seq          |
| Task 8-2 | 命名統一方針策定     | state/props/formatter 名称の一貫性を整理する。   | seq          |
| Task 8-3 | 再レンダー最適化方針 | memoization 適用判断を定義する。                 | seq          |

- タスク実行: 実行タスク表の項目を順に完了し、成果物へ反映する。

## Atent Team SubAgent分担（関心分離）

| SubAgent   | 関心ごと        | 主成果物                          | 実行パターン |
| ---------- | --------------- | --------------------------------- | ------------ |
| SubAgent-A | 表示責務整理    | refactoring-plan                  | par          |
| SubAgent-B | 命名/可読性整理 | readability-improvement-checklist | par          |
| SubAgent-C | 最終方針統合    | refactoring-plan 最終版           | seq          |

## 参照資料

| 参照資料                   | パス                                                                                          | 内容                            |
| -------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------- |
| 入力タスク指示書           | docs/30-workflows/completed-tasks/task-10a-b-improvement-result-breakdown-ui.md               | Why/What/How と完了条件の正本   |
| 親ワークフロー             | docs/30-workflows/completed-tasks/skill-analysis-view/                                        | TASK-10A-B 本体仕様と成果物参照 |
| 前Phase仕様                | phase-7-coverage-check.md                                                                     | 前提条件と引き継ぎ事項          |
| Phase 10 指摘元            | docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-10/final-review-result.md | MINOR M3 の原文確認             |
| 依存Phase成果物（Phase 1） | outputs/phase-1/                                                                              | 依存関係に基づく参照成果物      |
| 依存Phase成果物（Phase 2） | outputs/phase-2/                                                                              | 依存関係に基づく参照成果物      |
| 依存Phase成果物（Phase 5） | outputs/phase-5/                                                                              | 依存関係に基づく参照成果物      |
| 依存Phase成果物（Phase 6） | outputs/phase-6/                                                                              | 依存関係に基づく参照成果物      |
| 依存Phase成果物（Phase 7） | outputs/phase-7/                                                                              | 依存関係に基づく参照成果物      |

## システム仕様抽出（aiworkflow-requirements）

| 仕様               | パス                                                                                      | 適用内容                                         |
| ------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 抽出ナビ           | .claude/skills/aiworkflow-requirements/indexes/resource-map.md                            | 対象仕様の選定漏れを防ぐ                         |
| 機能別UI           | .claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md             | SkillAnalysisView の責務と未タスク背景を確認する |
| UIコンポーネント   | .claude/skills/aiworkflow-requirements/references/ui-ux-components.md                     | 表示階層とUI整合を確認する                       |
| UI設計原則         | .claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md              | Apple HIG/WCAG観点の可読性維持条件を確認する     |
| デザインシステム   | .claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md                  | トークン整合を崩さない改修方針を定義する         |
| UIアーキテクチャ   | .claude/skills/aiworkflow-requirements/references/arch-ui-components.md                   | view/molecule責務境界の維持条件を定義する        |
| 実装パターン       | .claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md | リファクタ時に守るパターンを確認する             |
| 型契約             | .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md           | ImprovementResult 契約を確認する                 |
| 状態管理           | .claude/skills/aiworkflow-requirements/references/arch-state-management.md                | agentSlice の分析/改善状態を確認する             |
| IPC API            | .claude/skills/aiworkflow-requirements/references/api-ipc-agent.md                        | skill:improve 契約を確認する                     |
| API一覧            | .claude/skills/aiworkflow-requirements/references/api-endpoints.md                        | IPC命名規則・契約整合ルールを維持する            |
| セキュリティ境界   | .claude/skills/aiworkflow-requirements/references/security-api-electron.md                | Renderer-Preload-Main 境界を確認する             |
| IPCセキュリティ    | .claude/skills/aiworkflow-requirements/references/security-electron-ipc.md                | sender検証・sanitize方針を維持する               |
| エラーハンドリング | .claude/skills/aiworkflow-requirements/references/error-handling.md                       | 失敗理由表示時のエラー表現を整合させる           |
| a11yテスト指針     | .claude/skills/aiworkflow-requirements/references/testing-accessibility.md                | a11yを毀損しないリファクタ条件を定義する         |

## 実行手順

1. 参照資料を確認し、入力条件と制約を確定する（seq）。
2. SubAgentごとの成果物草案を作成する（par）。
3. SubAgent成果物を統合し、欠落観点を解消する（seq）。
4. 完了条件チェックを実施し、次Phaseへ引き継ぐ（seq）。

## 統合テスト連携（Phase 1〜11は必須）

Phase 9 でコード品質評価しやすいよう、リファクタ方針に検証観点（可読性・変更容易性）を明記する。

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                     | 仕様参照先                                  |
| ------------------ | -------------------------------------------- | ------------------------------------------- |
| セキュリティ       | 入力検証・境界防御・エラー露出制御を扱う場合 | aiworkflow-requirements: security-\*.md     |
| UI/UX              | 表示構造・情報設計・操作性を扱う場合         | aiworkflow-requirements: ui-ux-\*.md        |
| アーキテクチャ     | 責務分離・状態遷移・依存関係を扱う場合       | aiworkflow-requirements: architecture-\*.md |
| API設計            | IPC契約・レスポンス形式を扱う場合            | aiworkflow-requirements: api-\*.md          |
| データ整合性       | 型契約・状態整合を扱う場合                   | aiworkflow-requirements: interfaces-\*.md   |
| エラーハンドリング | 失敗理由表示・回復導線を扱う場合             | aiworkflow-requirements: error-handling.md  |
| アクセシビリティ   | 読み上げ・キーボード操作を扱う場合           | aiworkflow-requirements: ui-ux-\*.md        |

## 成果物

| 成果物                   | パス                                                 | 内容                               |
| ------------------------ | ---------------------------------------------------- | ---------------------------------- |
| リファクタ方針           | outputs/phase-8/refactoring-plan.md                  | 分離対象と優先順位を定義する       |
| 可読性改善チェックリスト | outputs/phase-8/readability-improvement-checklist.md | 命名・責務境界の確認項目を記録する |

## 完了条件

- [ ] 表示/整形/状態判定の責務分離が定義されている。
- [ ] 命名規則が既存SkillAnalysisView群と整合している。
- [ ] 最適化方針に過剰最適化防止ルールが含まれている。
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料確認
2. 実行タスク実施
3. SubAgent成果物統合
4. 成果物配置確認
5. 完了条件検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/task-10a-b-improvement-result-breakdown-ui --phase 8
```

## 次のPhase

Phase 9: 品質保証（phase-9-quality-assurance.md）
