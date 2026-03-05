# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| Phase      | 10                                         |
| タスクID   | UT-TASK-10A-B-003                          |
| 機能名     | task-10a-b-improvement-result-breakdown-ui |
| タスク名   | 改善結果内訳表示実装                       |
| 作成日     | 2026-03-05                                 |
| 前提Phase  | Phase 9                                    |
| 後続Phase  | Phase 11                                   |
| タスク種別 | completed（実装・テスト・文書化完了）      |

## 目的

実装開始可否を判定する最終レビュー基準と戻り先ルールを確定する。

## 背景

本タスクは Phase 10 MINOR 起点で発見されたため、同種漏れを防ぐゲート運用の明確化が必須。

## 実行タスク

| Task      | 内容           | 目的                                             | 実行パターン |
| --------- | -------------- | ------------------------------------------------ | ------------ |
| Task 10-1 | ゲート観点定義 | 機能・品質・a11y・契約整合の判定項目を固定する。 | seq          |
| Task 10-2 | 判定基準定義   | PASS/MINOR/MAJOR/CRITICAL の判断条件を定義する。 | seq          |
| Task 10-3 | 戻り先定義     | 判定別の戻り先Phaseを明記する。                  | seq          |

- Task 10-1: 機能・品質・a11y・契約整合の判定項目を固定する。
- Task 10-2: PASS/MINOR/MAJOR/CRITICAL の判断条件を定義する。
- Task 10-3: 判定別の戻り先Phaseを明記する。

## 最終レビューゲート判定基準（task-specification-creator準拠）

| 判定     | 条件                     | 対応                              |
| -------- | ------------------------ | --------------------------------- |
| PASS     | 全レビュー観点で問題なし | Phase 11（手動テスト）へ進行      |
| MINOR    | 軽微な指摘あり           | 未タスク化して Phase 11 へ進行    |
| MAJOR    | 重大な問題あり           | 影響範囲に応じて戻り先Phaseへ戻る |
| CRITICAL | 致命的な問題あり         | Phase 1へ戻り、要件を再確認する   |

## 戻り先決定基準

| 問題の種類       | 戻り先                      |
| ---------------- | --------------------------- |
| 要件の問題       | Phase 1（要件定義）         |
| 設計の問題       | Phase 2（設計）             |
| テスト設計の問題 | Phase 4（テスト作成）       |
| 実装の問題       | Phase 5（実装）             |
| テスト拡充の問題 | Phase 6（テスト拡充）       |
| カバレッジ未達   | Phase 7（カバレッジ確認）   |
| コード品質の問題 | Phase 8（リファクタリング） |

## MINOR判定時フロー

1. 指摘事項を `outputs/phase-10/final-review-result.md` に記録する。
2. `docs/30-workflows/unassigned-task/` に未タスク指示書を作成する。
3. Phase 11 手動試験へ引き継ぐ観点を対応表として残す。

- タスク実行: 実行タスク表の項目を順に完了し、成果物へ反映する。

## Atent Team SubAgent分担（関心分離）

| SubAgent   | 関心ごと              | 主成果物                          | 実行パターン |
| ---------- | --------------------- | --------------------------------- | ------------ |
| SubAgent-A | 機能レビュー観点      | final-review-checklist の機能項目 | par          |
| SubAgent-B | 品質/契約レビュー観点 | final-review-checklist の品質項目 | par          |
| SubAgent-C | 判定統合              | final-review-result（テンプレ）   | seq          |

## 参照資料

| 参照資料                   | パス                                                                                          | 内容                            |
| -------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------- |
| 入力タスク指示書           | docs/30-workflows/completed-tasks/task-10a-b-improvement-result-breakdown-ui.md               | Why/What/How と完了条件の正本   |
| 親ワークフロー             | docs/30-workflows/completed-tasks/skill-analysis-view/                                        | TASK-10A-B 本体仕様と成果物参照 |
| 前Phase仕様                | phase-9-quality-assurance.md                                                                  | 前提条件と引き継ぎ事項          |
| Phase 10 指摘元            | docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-10/final-review-result.md | MINOR M3 の原文確認             |
| 依存Phase成果物（Phase 1） | outputs/phase-1/                                                                              | 依存関係に基づく参照成果物      |
| 依存Phase成果物（Phase 2） | outputs/phase-2/                                                                              | 依存関係に基づく参照成果物      |
| 依存Phase成果物（Phase 5） | outputs/phase-5/                                                                              | 依存関係に基づく参照成果物      |

## システム仕様抽出（aiworkflow-requirements）

| 仕様               | パス                                                                                      | 適用内容                                         |
| ------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 抽出ナビ           | .claude/skills/aiworkflow-requirements/indexes/resource-map.md                            | 対象仕様の選定漏れを防ぐ                         |
| 機能別UI           | .claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md             | SkillAnalysisView の責務と未タスク背景を確認する |
| UIコンポーネント   | .claude/skills/aiworkflow-requirements/references/ui-ux-components.md                     | 表示階層とUI整合を確認する                       |
| UI設計原則         | .claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md              | Apple HIG/WCAG観点の判定基準を確認する           |
| デザインシステム   | .claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md                  | 色/トークン/余白の整合判定を確認する             |
| UIアーキテクチャ   | .claude/skills/aiworkflow-requirements/references/arch-ui-components.md                   | view/molecule責務分離の最終妥当性を確認する      |
| 実装パターン       | .claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md | 実装規約/エラー処理パターン整合を確認する        |
| 型契約             | .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md           | ImprovementResult 契約を確認する                 |
| 状態管理           | .claude/skills/aiworkflow-requirements/references/arch-state-management.md                | agentSlice の分析/改善状態を確認する             |
| IPC API            | .claude/skills/aiworkflow-requirements/references/api-ipc-agent.md                        | skill:improve 契約を確認する                     |
| API一覧            | .claude/skills/aiworkflow-requirements/references/api-endpoints.md                        | IPC命名・契約整合ルールを最終確認する            |
| セキュリティ境界   | .claude/skills/aiworkflow-requirements/references/security-api-electron.md                | Renderer-Preload-Main 境界を確認する             |
| IPCセキュリティ    | .claude/skills/aiworkflow-requirements/references/security-electron-ipc.md                | sender検証・sanitize方針を最終確認する           |
| エラーハンドリング | .claude/skills/aiworkflow-requirements/references/error-handling.md                       | 失敗理由表示時のエラー表現を整合させる           |
| a11yテスト指針     | .claude/skills/aiworkflow-requirements/references/testing-accessibility.md                | 手動試験へ引き継ぐa11y判定観点を確認する         |

## 実行手順

1. 参照資料を確認し、入力条件と制約を確定する（seq）。
2. SubAgentごとの成果物草案を作成する（par）。
3. SubAgent成果物を統合し、欠落観点を解消する（seq）。
4. 完了条件チェックを実施し、次Phaseへ引き継ぐ（seq）。

## 統合テスト連携（Phase 1〜11は必須）

Phase 11 手動試験へ直接引き継ぐため、レビュー項目と試験項目の対応関係を明記する。

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

| 成果物                       | パス                                       | 内容                           |
| ---------------------------- | ------------------------------------------ | ------------------------------ |
| 最終レビューチェックリスト   | outputs/phase-10/final-review-checklist.md | 判定観点と合否基準を定義する   |
| 最終レビュー結果テンプレート | outputs/phase-10/final-review-result.md    | 判定と指摘記録の雛形を定義する |

## 完了条件

- [ ] 判定基準が4段階で定義されている。
- [ ] 判定別の戻り先Phaseが定義されている。
- [ ] 手動試験へ引き継ぐ対応表が定義されている。
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
  docs/30-workflows/completed-tasks/task-10a-b-improvement-result-breakdown-ui --phase 10
```

## 次のPhase

Phase 11: 手動テスト検証（phase-11-manual-test.md）
