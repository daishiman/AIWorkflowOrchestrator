# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 6                                         |
| Phase名    | テスト拡充                                |
| タスクID   | TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001 |
| 前提Phase  | Phase 4-5                                 |
| 後続Phase  | Phase 7（カバレッジ確認）                 |
| ステータス | completed                                 |
| 作成日     | 2026-03-23                                |
| 機能名     | session-dock-artifact-bridge              |

## 目的

state 境界、restore failure、empty artifact、share cancel の edge case を追加する。

## 実行タスク

- state boundary 追加
- restore failure 追加
- share cancel 追加
- empty artifact 追加

## 参照資料

| 参照資料       | パス                                                                | 内容                     |
| -------------- | ------------------------------------------------------------------- | ------------------------ |
| Phase 5 成果物 | `phase-5-implementation.md`                                         | 実装計画（依存Phase）    |
| root pack      | `../../phase-6-test-expansion.md`                                   | 親パックのテスト拡充仕様 |
| upstream task  | `../step-01-seq-task-01-guided-execution-shell-foundation/index.md` | 前タスクの成果物         |

## 実行手順

### ステップ1: Phase 4 の test-matrix.md を読み、未カバーの edge case を特定する

restore failure、empty artifact、share cancel の各パターンを特定する。

### ステップ2: 各 edge case をテストファイルに追加する

state boundary、failure path、cancel flow の 3 カテゴリで分類して追加する。

## 統合テスト連携

restore failure と share cancel は renderer-preload 間の統合テストに含める。

## 成果物

| 成果物               | パス                                           | 説明       |
| -------------------- | ---------------------------------------------- | ---------- |
| regression 拡張計画  | `outputs/phase-6/regression-expansion-plan.md` | 拡張方針   |
| edge case マトリクス | `outputs/phase-6/edge-case-matrix.md`          | 境界値一覧 |

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

## 完了条件

- [ ] restore failure ケースがある
- [ ] aborted / empty artifact ケースがある
- [ ] share cancel ケースがある
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次のPhase

- [Phase 7（カバレッジ確認）](./phase-7-coverage-check.md)
