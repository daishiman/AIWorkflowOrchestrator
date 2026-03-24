# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 9                                         |
| Phase名    | 品質検証                                  |
| タスクID   | TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001 |
| 前提Phase  | Phase 4-8                                 |
| 後続Phase  | Phase 10（最終レビュー）                  |
| ステータス | completed                                 |
| 作成日     | 2026-03-23                                |
| 機能名     | session-dock-artifact-bridge              |

## 目的

state 一貫性、share 監査性、restore 安定性、artifact priority の品質を確認する。

## 実行タスク

- state QA
- share QA
- restore QA
- artifact QA

## 参照資料

| 参照資料       | パス                                 | 内容                              |
| -------------- | ------------------------------------ | --------------------------------- |
| Phase 5 成果物 | `phase-5-implementation.md`          | 実装方針（依存Phase）             |
| Phase 6 成果物 | `phase-6-test-expansion.md`          | edge case 拡張（依存Phase）       |
| Phase 7 成果物 | `phase-7-coverage-check.md`          | coverage 確認（依存Phase）        |
| Phase 8 成果物 | `phase-8-refactoring.md`             | リファクタリング方針（依存Phase） |
| root pack      | `../../phase-9-quality-assurance.md` | 親パックの品質検証仕様            |

## 実行手順

### ステップ1: quality-checklist.md に沿って 4 観点を検証する

state 一貫性、share 監査性、restore 安定性、artifact priority の各観点で品質を確認する。

### ステップ2: risk-register.md に残リスクを記録する

検出されたリスクと対策を記録する。

## 統合テスト連携

state / share / restore / artifact の品質検証結果を Phase 10 の最終レビューに引き継ぐ。

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 適用判断                                | 仕様参照先                                   |
| ------------------ | --------------------------------------- | -------------------------------------------- |
| UI/UX              | dock / artifact / share の surface 設計 | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | session state / store 設計              | `aiworkflow-requirements: architecture-*.md` |
| セキュリティ       | transcript share / provenance           | `aiworkflow-requirements: security-*.md`     |
| エラーハンドリング | aborted state / restore failure         | `aiworkflow-requirements: error-handling.md` |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## 成果物

| 成果物            | パス                                   | 説明     |
| ----------------- | -------------------------------------- | -------- |
| quality checklist | `outputs/phase-9/quality-checklist.md` | QA 一覧  |
| risk register     | `outputs/phase-9/risk-register.md`     | 残リスク |

## 完了条件

- [ ] state 一貫性が確認対象になっている
- [ ] share の監査可能性が確認対象になっている
- [ ] restore / artifact の残リスクが記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次のPhase

- [Phase 10（最終レビュー）](./phase-10-final-review.md)
