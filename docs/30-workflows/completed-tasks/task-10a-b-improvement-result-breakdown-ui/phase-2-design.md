# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| Phase      | 2                                          |
| タスクID   | UT-TASK-10A-B-003                          |
| 機能名     | task-10a-b-improvement-result-breakdown-ui |
| タスク名   | 改善結果内訳表示実装                       |
| 作成日     | 2026-03-05                                 |
| 前提Phase  | Phase 1                                    |
| 後続Phase  | Phase 3                                    |
| タスク種別 | completed（実装・テスト・文書化完了）      |

## 目的

結果内訳UIを SkillAnalysisView へ統合する設計（表示レイアウト・状態遷移・責務分離）を確定する。

## 背景

既存ビューは ScoreDisplay/SuggestionList/RiskPanel の3区画構成であり、内訳表示を追加しても責務混在を起こさない設計が必要。

## 実行タスク

| Task     | 内容                 | 目的                                                           | 実行パターン |
| -------- | -------------------- | -------------------------------------------------------------- | ------------ |
| Task 2-1 | UI構成設計           | ImprovementResultBreakdown を独立moleculeとして設計する。      | seq          |
| Task 2-2 | 状態遷移設計         | applyImprovements / autoImprove 後の表示タイミングを定義する。 | seq          |
| Task 2-3 | 表示優先度設計       | 成功・失敗・スキップの順序と折りたたみ条件を定義する。         | seq          |
| Task 2-4 | アクセシビリティ設計 | role/aria-label とキーボード操作方針を定義する。               | seq          |

- タスク実行: 実行タスク表の項目を順に完了し、成果物へ反映する。

## Atent Team SubAgent分担（関心分離）

| SubAgent   | 関心ごと                      | 主成果物                 | 実行パターン |
| ---------- | ----------------------------- | ------------------------ | ------------ |
| SubAgent-A | レイアウト/コンポーネント責務 | UI仕様書                 | seq          |
| SubAgent-B | 状態管理/イベント導線         | 状態遷移図               | seq          |
| SubAgent-C | a11y設計                      | アクセシビリティ設計メモ | seq          |

## 参照資料

| 参照資料                   | パス                                                                                          | 内容                            |
| -------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------- |
| 入力タスク指示書           | docs/30-workflows/completed-tasks/task-10a-b-improvement-result-breakdown-ui.md               | Why/What/How と完了条件の正本   |
| 親ワークフロー             | docs/30-workflows/completed-tasks/skill-analysis-view/                                        | TASK-10A-B 本体仕様と成果物参照 |
| 前Phase仕様                | phase-1-requirements.md                                                                       | 前提条件と引き継ぎ事項          |
| Phase 10 指摘元            | docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-10/final-review-result.md | MINOR M3 の原文確認             |
| 依存Phase成果物（Phase 1） | outputs/phase-1/                                                                              | 依存関係に基づく参照成果物      |

## システム仕様抽出（aiworkflow-requirements）

| 仕様               | パス                                                                                      | 適用内容                                         |
| ------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 抽出ナビ           | .claude/skills/aiworkflow-requirements/indexes/resource-map.md                            | 対象仕様の選定漏れを防ぐ                         |
| 機能別UI           | .claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md             | SkillAnalysisView の責務と未タスク背景を確認する |
| UIコンポーネント   | .claude/skills/aiworkflow-requirements/references/ui-ux-components.md                     | 表示階層とUI整合を確認する                       |
| UI設計原則         | .claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md              | Apple HIG/WCAG観点の設計要件を定義する           |
| デザインシステム   | .claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md                  | トークン/配色/余白の設計を定義する               |
| UIアーキテクチャ   | .claude/skills/aiworkflow-requirements/references/arch-ui-components.md                   | view/molecule責務境界を設計に反映する            |
| 実装パターン       | .claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md | UI実装パターンを設計へ反映する                   |
| 型契約             | .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md           | ImprovementResult 契約を確認する                 |
| 状態管理           | .claude/skills/aiworkflow-requirements/references/arch-state-management.md                | agentSlice の分析/改善状態を確認する             |
| IPC API            | .claude/skills/aiworkflow-requirements/references/api-ipc-agent.md                        | skill:improve 契約を確認する                     |
| API一覧            | .claude/skills/aiworkflow-requirements/references/api-endpoints.md                        | IPC命名規則・契約整合ルールを設計に反映する      |
| セキュリティ境界   | .claude/skills/aiworkflow-requirements/references/security-api-electron.md                | Renderer-Preload-Main 境界を確認する             |
| IPCセキュリティ    | .claude/skills/aiworkflow-requirements/references/security-electron-ipc.md                | sender検証・sanitize方針を設計へ反映する         |
| エラーハンドリング | .claude/skills/aiworkflow-requirements/references/error-handling.md                       | 失敗理由表示時のエラー表現を整合させる           |
| a11yテスト指針     | .claude/skills/aiworkflow-requirements/references/testing-accessibility.md                | a11y要件を後続テストへ引き継ぐ                   |

## 実行手順

1. 参照資料を確認し、入力条件と制約を確定する（seq）。
2. SubAgentごとの成果物草案を作成する（par）。
3. SubAgent成果物を統合し、欠落観点を解消する（seq）。
4. 完了条件チェックを実施し、次Phaseへ引き継ぐ（seq）。

## 統合テスト連携（Phase 1〜11は必須）

Renderer の状態遷移設計を Phase 5 実装タスクと Phase 11 手動試験シナリオへ同時反映できる形式で設計する。

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

| 成果物   | パス                                    | 内容                               |
| -------- | --------------------------------------- | ---------------------------------- |
| UI仕様   | outputs/phase-2/ui-specification.md     | 表示レイアウトと情報階層を定義する |
| 状態設計 | outputs/phase-2/state-design.md         | イベント起点の表示遷移を整理する   |
| a11y設計 | outputs/phase-2/accessibility-design.md | aria/操作要件を定義する            |

## 完了条件

- [ ] コンポーネント責務が既存3区画と競合しない。
- [ ] 結果表示の出現/消去条件が明文化されている。
- [ ] a11y要件がテスト観点へ引き継げる。
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
  docs/30-workflows/completed-tasks/task-10a-b-improvement-result-breakdown-ui --phase 2
```

## 次のPhase

Phase 3: 設計レビューゲート（phase-3-design-review.md）
