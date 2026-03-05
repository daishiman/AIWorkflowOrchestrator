# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| Phase      | 13                                         |
| タスクID   | UT-TASK-10A-B-003                          |
| 機能名     | task-10a-b-improvement-result-breakdown-ui |
| タスク名   | 改善結果内訳表示実装                       |
| 作成日     | 2026-03-05                                 |
| 前提Phase  | Phase 12                                   |
| 後続Phase  | なし（完了）                               |
| タスク種別 | completed（実装・テスト・文書化完了）      |

## 目的

将来のPR作成に備え、説明テンプレートと証跡整理手順を定義する。

## 背景

本依頼ではコミット/PRを行わないため、Phase 13 は提出準備テンプレートの整備のみを対象とする。

## 実行タスク

| Task      | 内容                   | 目的                                                  | 実行パターン |
| --------- | ---------------------- | ----------------------------------------------------- | ------------ |
| Task 13-1 | PR説明テンプレート定義 | Summary/Changes/Validation/Risks の記載枠を定義する。 | seq          |
| Task 13-2 | 証跡リンク整理方針     | Phase成果物リンクの整理ルールを定義する。             | seq          |
| Task 13-3 | レビュー依頼観点整理   | レビュー観点と確認依頼文テンプレートを定義する。      | seq          |

- タスク実行: 実行タスク表の項目を順に完了し、成果物へ反映する。

## Atent Team SubAgent分担（関心分離）

| SubAgent   | 関心ごと             | 主成果物              | 実行パターン |
| ---------- | -------------------- | --------------------- | ------------ |
| SubAgent-A | PR本文テンプレート   | pr-info.md            | seq          |
| SubAgent-B | 完了報告テンプレート | completion-report.md  | seq          |
| SubAgent-C | 最終整合確認         | Phase 13 チェック結果 | seq          |

## 参照資料

| 参照資料                    | パス                                                                                          | 内容                            |
| --------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------- |
| 入力タスク指示書            | docs/30-workflows/completed-tasks/task-10a-b-improvement-result-breakdown-ui.md               | Why/What/How と完了条件の正本   |
| 親ワークフロー              | docs/30-workflows/completed-tasks/skill-analysis-view/                                        | TASK-10A-B 本体仕様と成果物参照 |
| 前Phase仕様                 | phase-12-documentation.md                                                                     | 前提条件と引き継ぎ事項          |
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
| 依存Phase成果物（Phase 12） | outputs/phase-12/                                                                             | 依存関係に基づく参照成果物      |

## システム仕様抽出（aiworkflow-requirements）

| 仕様               | パス                                                                                      | 適用内容                                                  |
| ------------------ | ----------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 抽出ナビ           | .claude/skills/aiworkflow-requirements/indexes/resource-map.md                            | PR記載対象の仕様ソース漏れを防ぐ                          |
| タスク台帳         | .claude/skills/aiworkflow-requirements/references/task-workflow.md                        | UT-TASK-10A-B-003 の登録状態を同期する                    |
| 機能別UI           | .claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md             | SkillAnalysisView の関連未タスク表を同期する              |
| UI一覧             | .claude/skills/aiworkflow-requirements/references/ui-ux-components.md                     | 完了タスク/残課題セクション整合を確認する                 |
| UI設計原則         | .claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md              | Apple HIG/WCAG観点の説明根拠を整理する                    |
| デザインシステム   | .claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md                  | トークン/配色/余白の説明根拠を整理する                    |
| UIアーキテクチャ   | .claude/skills/aiworkflow-requirements/references/arch-ui-components.md                   | view/molecule責務分離の説明根拠を整理する                 |
| 実装パターン       | .claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md | 実装方針の説明根拠を整理する                              |
| 型契約             | .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md           | `OperationResult<ImprovementResult>` の説明根拠を整理する |
| 状態管理           | .claude/skills/aiworkflow-requirements/references/arch-state-management.md                | 状態遷移の説明根拠を整理する                              |
| IPC API            | .claude/skills/aiworkflow-requirements/references/api-ipc-agent.md                        | `skill:improve` 契約の説明根拠を整理する                  |
| API一覧            | .claude/skills/aiworkflow-requirements/references/api-endpoints.md                        | IPC命名/戻り値ルールの説明根拠を整理する                  |
| セキュリティ境界   | .claude/skills/aiworkflow-requirements/references/security-api-electron.md                | Renderer-Preload-Main 境界の説明根拠を整理する            |
| IPCセキュリティ    | .claude/skills/aiworkflow-requirements/references/security-electron-ipc.md                | sender検証/sanitize方針の説明根拠を整理する               |
| エラーハンドリング | .claude/skills/aiworkflow-requirements/references/error-handling.md                       | エラー分類/表示方針の説明根拠を整理する                   |
| a11yテスト仕様     | .claude/skills/aiworkflow-requirements/references/testing-accessibility.md                | a11y検証観点の説明根拠を整理する                          |
| 教訓               | .claude/skills/aiworkflow-requirements/references/lessons-learned.md                      | 再発防止知見への反映先を確認する                          |
| 仕様更新運用       | .claude/skills/task-specification-creator/references/spec-update-workflow.md              | Phase 12 Step 1-A/1-B/1-C 運用を適用する                  |

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

| 成果物               | パス                                  | 内容                           |
| -------------------- | ------------------------------------- | ------------------------------ |
| PR情報テンプレート   | outputs/phase-13/pr-info.md           | PR本文の雛形を定義する         |
| 完了報告テンプレート | outputs/phase-13/completion-report.md | 実施範囲・未実施範囲を記録する |

## 完了条件

- [ ] PR本文テンプレートが再利用可能な形式で定義されている。
- [ ] 証跡リンク整理ルールが明記されている。
- [ ] 本依頼ではコミット/PRを実施しないことが明記されている。
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
  docs/30-workflows/completed-tasks/task-10a-b-improvement-result-breakdown-ui --phase 13
```

## 次のPhase

完了（本ワークフロー終了）
