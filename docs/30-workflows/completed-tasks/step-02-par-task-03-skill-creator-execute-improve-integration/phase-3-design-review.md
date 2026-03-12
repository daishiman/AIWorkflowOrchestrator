# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                                                            |
| ------ | ------------------------------------------------------------- |
| Phase  | 3                                                             |
| 機能名 | step-02-par-task-03-skill-creator-execute-improve-integration |
| 作成日 | 2026-03-11                                                    |

## 目的

Phase 2 の設計が単一導線、状態遷移、IPC 境界、内部責務分離の観点で実装可能かをレビューし、Phase 5 へ進める前提を確定する。

## 実行タスク

- 設計整合性レビュー: session card と wizard の責務重複がないかを確認する
- 状態遷移レビュー: create / execute / improve の handoff が Redux と UI に収まるかを確認する
- IPC 境界レビュー: preload 公開 API と renderer 呼び出しの安全性を確認する
- 役割分離レビュー: Planner / Executor / Improver の責務が UI 文言へ漏れていないかを確認する
- レビュー結果整理: Phase 4 と Phase 5 に反映する修正点を確定する

## 参照資料

| 参照資料                     | パス                                               | 説明           |
| ---------------------------- | -------------------------------------------------- | -------------- |
| 要件定義書                   | `outputs/phase-1/requirements-definition.md`       | Phase 1 成果物 |
| 受け入れ基準                 | `outputs/phase-1/acceptance-criteria.md`           | Phase 1 成果物 |
| アーキテクチャ設計           | `outputs/phase-2/architecture-design.md`           | Phase 2 成果物 |
| セッション状態設計           | `outputs/phase-2/session-state-design.md`          | Phase 2 成果物 |
| 内部オーケストレーション設計 | `outputs/phase-2/internal-orchestration-design.md` | Phase 2 成果物 |

## 実行手順

### ステップ1: Phase 2 設計をレビュー観点へマッピングする

設計成果物の各決定事項を UI、状態管理、IPC、内部責務の観点に分類し、抜け漏れを確認する。

### ステップ2: 実装阻害要因を洗い出す

既存 `SkillManagementPanel`、`SkillCreateWizard`、`agentSlice`、preload API の構造に照らして、設計の衝突点を抽出する。

### ステップ3: 修正要否を整理する

Major / Minor / Note の区分でレビュー結果を整理し、Phase 4 のテスト観点と Phase 5 の実装順へ接続する。

## 統合テスト連携

レビュー結果から、以下の統合テスト追加要件を Phase 4 に引き渡す。

| 項目     | 検証対象               | 連携内容                                                   |
| -------- | ---------------------- | ---------------------------------------------------------- |
| 単一導線 | `SkillManagementPanel` | list view から create / execute / improve を完結できること |
| 選択同期 | `useSelectSkillByName` | 作成直後の skill が execute / improve に引き継がれること   |
| API 経路 | preload skill API      | create / analyze / autoImprove の経路が安定していること    |
| UI 文言  | renderer components    | 内部オーケストレーション名称が表 UI に残らないこと         |

## 成果物

| 成果物           | パス                                      | 説明                        |
| ---------------- | ----------------------------------------- | --------------------------- |
| 設計レビュー記録 | `outputs/phase-3/design-review-report.md` | レビュー観点ごとの判定結果  |
| 指摘一覧         | `outputs/phase-3/review-findings.md`      | Major / Minor / Note の一覧 |

## 完了条件

- [ ] Major 指摘が 0 件または Phase 5 着手前に解消方針が定義されている
- [ ] Phase 4 と Phase 5 へ反映する修正項目が明文化されている
- [ ] 単一導線と内部責務分離の前提がレビューで承認されている
