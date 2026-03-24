# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 10                                        |
| Phase名    | 最終レビュー                              |
| タスクID   | TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001 |
| 前提Phase  | Phase 1-9                                 |
| 後続Phase  | Phase 11（手動テスト）                    |
| ステータス | completed                                 |
| 作成日     | 2026-03-23                                |
| 機能名     | session-dock-artifact-bridge              |

## 目的

session surface が `artifact-first / manual-share / restoreable` を満たすかを判定する。

## 実行タスク

- AC review
- dependency review
- gate decision

## 参照資料

| 参照資料       | パス                           | 内容                       |
| -------------- | ------------------------------ | -------------------------- |
| Phase 1 成果物 | `phase-1-requirements.md`      | task 要件（依存Phase）     |
| Phase 2 成果物 | `phase-2-design.md`            | task 設計（依存Phase）     |
| Phase 5 成果物 | `phase-5-implementation.md`    | task 実装計画（依存Phase） |
| Phase 9 成果物 | `phase-9-quality-assurance.md` | task 品質確認（依存Phase） |

## 実行手順

### ステップ1: AC-1〜AC-5 の判定を実施する

各受入基準について PASS / FAIL を記録する。

### ステップ2: gate decision を記録する

PASS / MINOR / MAJOR / CRITICAL の判定を outputs/phase-10/final-gate-decision.md に記録する。

### ステップ3: MINOR 指摘を未タスク化する

MINOR 指摘がある場合は全て unassigned-task-detection.md に未タスクとして記録する（省略不可）。

## 統合テスト連携

最終レビューとして、全 Phase の統合テスト結果を総合判定に含める。

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

| 成果物           | パス                                      | 説明                 |
| ---------------- | ----------------------------------------- | -------------------- |
| 最終レビュー報告 | `outputs/phase-10/final-review-report.md` | AC 判定              |
| 最終 gate        | `outputs/phase-10/final-gate-decision.md` | PASS / MINOR / MAJOR |

## 完了条件

- [ ] AC-1〜AC-5 の判定がある
- [ ] Task03 へ渡す safety 論点が記録されている
- [ ] gate decision が記録されている
- [ ] gate 判定値（PASS / MINOR / MAJOR / CRITICAL）が outputs/phase-10/final-gate-decision.md に記録されている
- [ ] MINOR 指摘が全て未タスク化されている（0件の場合も明記）
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次のPhase

- PASS → [Phase 11（手動テスト）](./phase-11-manual-test.md)
- MINOR → 未タスク仕様書に変換後 [Phase 11（手動テスト）](./phase-11-manual-test.md)（省略不可）
- MAJOR → 影響範囲に応じて Phase 1-5 へ戻る
- CRITICAL → [Phase 1（要件定義）](./phase-1-requirements.md) へ戻り要件再確認
