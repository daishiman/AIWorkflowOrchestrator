# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| Phase      | 9                                          |
| タスクID   | UT-TASK-10A-B-003                          |
| 機能名     | task-10a-b-improvement-result-breakdown-ui |
| タスク名   | 改善結果内訳表示実装                       |
| 作成日     | 2026-03-05                                 |
| 前提Phase  | Phase 8                                    |
| 後続Phase  | Phase 10                                   |
| タスク種別 | completed（実装・テスト・文書化完了）      |

## 目的

仕様準拠・テスト戦略・安全性を横断確認し、最終レビュー前の品質基準を満たす。

## 背景

UI改善タスクでも型契約ドリフト・表示崩れ・エラー露出のリスクがあるため、事前品質ゲートを設ける。

## 実行タスク

| Task     | 内容                        | 目的                                              | 実行パターン |
| -------- | --------------------------- | ------------------------------------------------- | ------------ |
| Task 9-1 | 品質基準チェック            | 定義済みACと設計方針の充足状況を確認する。        | seq          |
| Task 9-2 | セキュリティ/安全性チェック | エラーメッセージ露出とIPC境界の安全性を確認する。 | seq          |
| Task 9-3 | 残リスク整理                | 最終レビューに持ち込むリスクと対策を整理する。    | seq          |

- タスク実行: 実行タスク表の項目を順に完了し、成果物へ反映する。

## Atent Team SubAgent分担（関心分離）

| SubAgent   | 関心ごと     | 主成果物                      | 実行パターン |
| ---------- | ------------ | ----------------------------- | ------------ |
| SubAgent-A | 品質項目監査 | quality-assurance-plan        | par          |
| SubAgent-B | リスク監査   | risk-mitigation-log           | par          |
| SubAgent-C | 監査統合     | quality-assurance-plan 最終版 | seq          |

## 参照資料

| 参照資料                   | パス                                                                                          | 内容                            |
| -------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------- |
| 入力タスク指示書           | docs/30-workflows/completed-tasks/task-10a-b-improvement-result-breakdown-ui.md               | Why/What/How と完了条件の正本   |
| 親ワークフロー             | docs/30-workflows/completed-tasks/skill-analysis-view/                                        | TASK-10A-B 本体仕様と成果物参照 |
| 前Phase仕様                | phase-8-refactoring.md                                                                        | 前提条件と引き継ぎ事項          |
| Phase 10 指摘元            | docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-10/final-review-result.md | MINOR M3 の原文確認             |
| 依存Phase成果物（Phase 5） | outputs/phase-5/                                                                              | 依存関係に基づく参照成果物      |

## システム仕様抽出（aiworkflow-requirements）

| 仕様               | パス                                                                                      | 適用内容                                         |
| ------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 抽出ナビ           | .claude/skills/aiworkflow-requirements/indexes/resource-map.md                            | 対象仕様の選定漏れを防ぐ                         |
| 機能別UI           | .claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md             | SkillAnalysisView の責務と未タスク背景を確認する |
| UIコンポーネント   | .claude/skills/aiworkflow-requirements/references/ui-ux-components.md                     | 表示階層とUI整合を確認する                       |
| UI設計原則         | .claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md              | Apple HIG/WCAG準拠を品質判定に組み込む           |
| デザインシステム   | .claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md                  | トークン整合を品質判定に組み込む                 |
| UIアーキテクチャ   | .claude/skills/aiworkflow-requirements/references/arch-ui-components.md                   | 責務分離維持を品質判定に組み込む                 |
| 実装パターン       | .claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md | 実装規約順守を品質判定に組み込む                 |
| 型契約             | .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md           | ImprovementResult 契約を確認する                 |
| 状態管理           | .claude/skills/aiworkflow-requirements/references/arch-state-management.md                | agentSlice の分析/改善状態を確認する             |
| IPC API            | .claude/skills/aiworkflow-requirements/references/api-ipc-agent.md                        | skill:improve 契約を確認する                     |
| API一覧            | .claude/skills/aiworkflow-requirements/references/api-endpoints.md                        | IPC命名規則・契約整合を品質監査する              |
| セキュリティ境界   | .claude/skills/aiworkflow-requirements/references/security-api-electron.md                | Renderer-Preload-Main 境界を確認する             |
| IPCセキュリティ    | .claude/skills/aiworkflow-requirements/references/security-electron-ipc.md                | sender検証・sanitize方針を品質監査する           |
| エラーハンドリング | .claude/skills/aiworkflow-requirements/references/error-handling.md                       | 失敗理由表示時のエラー表現を整合させる           |
| a11yテスト指針     | .claude/skills/aiworkflow-requirements/references/testing-accessibility.md                | a11y品質監査項目を補完する                       |

## 実行手順

1. 参照資料を確認し、入力条件と制約を確定する（seq）。
2. SubAgentごとの成果物草案を作成する（par）。
3. SubAgent成果物を統合し、欠落観点を解消する（seq）。
4. 完了条件チェックを実施し、次Phaseへ引き継ぐ（seq）。

## 統合テスト連携（Phase 1〜11は必須）

Phase 10 での判定効率化のため、合否項目を PASS/MINOR/MAJOR 観点で先に分類しておく。

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

| 成果物         | パス                                      | 内容                             |
| -------------- | ----------------------------------------- | -------------------------------- |
| 品質保証計画   | outputs/phase-9/quality-assurance-plan.md | 品質確認項目と判定基準を定義する |
| リスク対策ログ | outputs/phase-9/risk-mitigation-log.md    | 残課題と対応方針を整理する       |

## 完了条件

- [ ] 品質基準の判定観点が明文化されている。
- [ ] セキュリティ/安全性観点の抜け漏れがない。
- [ ] 残リスクに優先度と対策が付与されている。
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
  docs/30-workflows/completed-tasks/task-10a-b-improvement-result-breakdown-ui --phase 9
```

## 次のPhase

Phase 10: 最終レビューゲート（phase-10-final-review.md）
