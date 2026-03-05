# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| Phase      | 12                                         |
| タスクID   | UT-TASK-10A-B-003                          |
| 機能名     | task-10a-b-improvement-result-breakdown-ui |
| タスク名   | 改善結果内訳表示実装                       |
| 作成日     | 2026-03-05                                 |
| 前提Phase  | Phase 11                                   |
| 後続Phase  | Phase 13                                   |
| タスク種別 | completed（実装・テスト・文書化完了）      |

## 目的

実装完了タスクとして必要な Phase 12 成果物とシステム仕様同期方針を確定する。

## 背景

本依頼では実装・テスト・画面検証まで完了したため、Phase 12 は完了記録と仕様同期の整合を重点化する。

## 実行タスク

| Task      | 内容                     | 目的                                                  | 実行パターン |
| --------- | ------------------------ | ----------------------------------------------------- | ------------ |
| Task 12-1 | 実装ガイド作成           | Part 1（初学者向け）/Part 2（技術者向け）を定義する。 | seq          |
| Task 12-2 | システム仕様書更新       | Step 1-A/1-B/1-C と Step 2 の判断基準を定義する。     | seq          |
| Task 12-3 | 更新履歴作成             | documentation-changelog の記録方針を定義する。        | seq          |
| Task 12-4 | 未タスク検出レポート作成 | 0件でも必ず出力する運用を定義する。                   | seq          |
| Task 12-5 | スキルフィードバック作成 | 改善点なしでも必ず出力する運用を定義する。            | seq          |

- Task 12-1: Part 1（初学者向け）/Part 2（技術者向け）を定義する。
- Task 12-2: Step 1-A/1-B/1-C と Step 2 の判断基準を定義する。
- Task 12-3: documentation-changelog の記録方針を定義する。
- Task 12-4: 検出0件でも必ず出力する運用を定義する。
- Task 12-5: 改善点なしでも必ず出力する運用を定義する。

## Phase 12 必須タスク詳細（task-specification-creator準拠）

### Task 1: 実装ガイド作成（2パート構成）

| パート | 対象読者             | 内容                                                |
| ------ | -------------------- | --------------------------------------------------- |
| Part 1 | 初学者・中学生レベル | 概念説明（日常の例え、専門用語は即時説明）          |
| Part 2 | 開発者・技術者       | 技術詳細（型定義、API、利用例、エラーハンドリング） |

| 必須要件       | 適用内容                                     |
| -------------- | -------------------------------------------- |
| Part 1 例え話  | 日常生活の例えを必ず含める                   |
| Part 1 説明順  | 「なぜ必要か」→「何をするか」の順で説明する  |
| Part 2 型定義  | TypeScriptのインターフェース/型を記載する    |
| Part 2 API契約 | シグネチャ、入出力例、エッジケースを記載する |

### Task 2: システム仕様書更新（Step 1-A/1-B/1-C + Step 2）

| Step     | 必須     | 内容                                                                       | このタスクでの適用                                 |
| -------- | -------- | -------------------------------------------------------------------------- | -------------------------------------------------- |
| Step 1-A | 必須     | 完了タスク追記、関連ドキュメントリンク、変更履歴、LOGS.md×2、topic-map同期 | `completed` として完了記録を残す                   |
| Step 1-B | 必須     | 実装状況テーブル更新（完了 or `spec_created`）                             | 本件は `completed` 適用を明記する                  |
| Step 1-C | 必須     | 関連タスク/未タスク候補テーブル更新                                        | `UT-TASK-10A-B-003` の状態を同期する               |
| Step 2   | 条件付き | 新規IF/型/API変更時のみ仕様本文を更新                                      | 変更有無を `documentation-changelog.md` に明記する |

### Task 3〜5: 出力必須ルール

| Task   | 成果物                         | 必須ルール                          |
| ------ | ------------------------------ | ----------------------------------- |
| Task 3 | `documentation-changelog.md`   | Step 1-A/1-B/1-C/2 の実施結果を残す |
| Task 4 | `unassigned-task-detection.md` | 検出0件でも必ず出力する             |
| Task 5 | `skill-feedback-report.md`     | 改善点なしでも必ず出力する          |

- タスク実行: 実行タスク表の項目を順に完了し、成果物へ反映する。

## Atent Team SubAgent分担（関心分離）

| SubAgent   | 関心ごと                        | 主成果物                                            | 実行パターン |
| ---------- | ------------------------------- | --------------------------------------------------- | ------------ |
| SubAgent-A | 仕様同期（task-workflow/ui-ux） | spec-update-summary                                 | par          |
| SubAgent-B | 履歴・検出レポート              | documentation-changelog / unassigned-task-detection | par          |
| SubAgent-C | フィードバック統合              | skill-feedback-report                               | seq          |

## 参照資料

| 参照資料                    | パス                                                                                          | 内容                            |
| --------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------- |
| 入力タスク指示書            | docs/30-workflows/completed-tasks/task-10a-b-improvement-result-breakdown-ui.md               | Why/What/How と完了条件の正本   |
| 親ワークフロー              | docs/30-workflows/completed-tasks/skill-analysis-view/                                        | TASK-10A-B 本体仕様と成果物参照 |
| 前Phase仕様                 | phase-11-manual-test.md                                                                       | 前提条件と引き継ぎ事項          |
| Phase 10 指摘元             | docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-10/final-review-result.md | MINOR M3 の原文確認             |
| 依存Phase成果物（Phase 1）  | outputs/phase-1/                                                                              | 依存関係に基づく参照成果物      |
| 依存Phase成果物（Phase 2）  | outputs/phase-2/                                                                              | 依存関係に基づく参照成果物      |
| 依存Phase成果物（Phase 5）  | outputs/phase-5/                                                                              | 依存関係に基づく参照成果物      |
| 依存Phase成果物（Phase 6）  | outputs/phase-6/                                                                              | 依存関係に基づく参照成果物      |
| 依存Phase成果物（Phase 7）  | outputs/phase-7/                                                                              | 依存関係に基づく参照成果物      |
| 依存Phase成果物（Phase 8）  | outputs/phase-8/                                                                              | 依存関係に基づく参照成果物      |
| 依存Phase成果物（Phase 9）  | outputs/phase-9/                                                                              | 依存関係に基づく参照成果物      |
| 依存Phase成果物（Phase 10） | outputs/phase-10/                                                                             | 依存関係に基づく参照成果物      |
| 依存Phase成果物（Phase 11） | outputs/phase-11/                                                                             | 依存関係に基づく参照成果物      |

## システム仕様抽出（aiworkflow-requirements）

| 仕様               | パス                                                                                      | 適用内容                                            |
| ------------------ | ----------------------------------------------------------------------------------------- | --------------------------------------------------- |
| 抽出ナビ           | .claude/skills/aiworkflow-requirements/indexes/resource-map.md                            | UI実装タスク向けの参照優先順を固定する              |
| タスク台帳         | .claude/skills/aiworkflow-requirements/references/task-workflow.md                        | UT-TASK-10A-B-003 の登録状態を同期する              |
| 機能別UI           | .claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md             | SkillAnalysisView の関連未タスク表を同期する        |
| UI一覧             | .claude/skills/aiworkflow-requirements/references/ui-ux-components.md                     | 完了タスク/残課題セクション整合を確認する           |
| UI設計原則         | .claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md              | Apple HIG/WCAG観点の記録方針を同期する              |
| デザインシステム   | .claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md                  | トークン・配色・余白ルールの反映先を確認する        |
| UIアーキテクチャ   | .claude/skills/aiworkflow-requirements/references/arch-ui-components.md                   | SkillAnalysisView の責務分離記録先を確認する        |
| 実装パターン       | .claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md | 再利用すべき実装/検証パターンを抽出する             |
| 型契約             | .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md           | `OperationResult<ImprovementResult>` 契約を同期する |
| 状態管理           | .claude/skills/aiworkflow-requirements/references/arch-state-management.md                | agentSlice 状態遷移の記録整合を確認する             |
| IPC API            | .claude/skills/aiworkflow-requirements/references/api-ipc-agent.md                        | `skill:improve` 契約整合の反映先を確認する          |
| API一覧            | .claude/skills/aiworkflow-requirements/references/api-endpoints.md                        | IPC命名規則・実装状況テーブル更新対象を確認する     |
| セキュリティ境界   | .claude/skills/aiworkflow-requirements/references/security-api-electron.md                | Renderer-Preload-Main 境界の記録整合を確認する      |
| IPCセキュリティ    | .claude/skills/aiworkflow-requirements/references/security-electron-ipc.md                | sender検証・エラーサニタイズの記録先を確認する      |
| エラーハンドリング | .claude/skills/aiworkflow-requirements/references/error-handling.md                       | エラー分類・表示方針の記録整合を確認する            |
| a11yテスト仕様     | .claude/skills/aiworkflow-requirements/references/testing-accessibility.md                | a11y検証観点の同期先を確認する                      |
| 教訓               | .claude/skills/aiworkflow-requirements/references/lessons-learned.md                      | 再発防止知見への反映先を確認する                    |
| 仕様更新運用       | .claude/skills/task-specification-creator/references/spec-update-workflow.md              | Phase 12 Step 1-A/1-B/1-C 運用を適用する            |

## 実行手順

1. 参照資料を確認し、入力条件と制約を確定する（seq）。
2. SubAgentごとの成果物草案を作成する（par）。
3. SubAgent成果物を統合し、欠落観点を解消する（seq）。
4. 完了条件チェックを実施し、次Phaseへ引き継ぐ（seq）。

## 統合テスト連携（Phase 1〜11は必須）

本Phaseは文書化/提出準備フェーズのため、新規統合テスト連携は行わない（既存検証証跡の参照のみ）。

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

| 成果物               | パス                                          | 内容                               |
| -------------------- | --------------------------------------------- | ---------------------------------- |
| 実装ガイド           | outputs/phase-12/implementation-guide.md      | 実装時再利用可能な手順書を定義する |
| 仕様更新サマリー     | outputs/phase-12/spec-update-summary.md       | 更新対象仕様と変更点を整理する     |
| ドキュメント更新履歴 | outputs/phase-12/documentation-changelog.md   | 更新履歴と判断理由を記録する       |
| 未タスク検出レポート | outputs/phase-12/unassigned-task-detection.md | 未タスク有無を記録する             |
| スキルフィードバック | outputs/phase-12/skill-feedback-report.md     | スキル改善案を記録する             |

## 完了条件

- [x] Task 1 の Part 1/Part 2 と必須要件（例え話、説明順、型/API記載）が定義されている。
- [x] Task 2 の Step 1-A/1-B/1-C と Step 2 条件が定義され、`completed` 適用方針が明記されている。
- [x] Task 3〜5 の必須出力ルール（0件でも出力/改善点なしでも出力）が定義されている。
- [x] aiworkflow-requirements から今回タスクに必要な仕様抽出元が明記されている。
- [x] Phase 12 必須5成果物（implementation-guide/spec-update-summary/documentation-changelog/unassigned-task-detection/skill-feedback-report）が定義されている。
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料確認
2. 実行タスク実施
3. SubAgent成果物統合
4. 成果物配置確認
5. 完了条件検証

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.json が更新されている

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/task-10a-b-improvement-result-breakdown-ui --phase 12
```

## 次のPhase

Phase 13: PR作成（phase-13-pr-creation.md）
