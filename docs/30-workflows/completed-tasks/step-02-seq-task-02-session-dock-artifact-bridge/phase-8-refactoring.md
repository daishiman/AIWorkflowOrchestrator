# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 8                                         |
| Phase名    | リファクタリング                          |
| タスクID   | TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001 |
| 前提Phase  | Phase 5-7                                 |
| 後続Phase  | Phase 9（品質検証）                       |
| ステータス | completed                                 |
| 作成日     | 2026-03-23                                |
| 機能名     | session-dock-artifact-bridge              |

## 目的

session surface の重複表示や情報過多を削減し、artifact-first を維持する。

## 実行タスク

- transcript と artifact の重複整理
- share rail と provenance の簡素化
- state 表示の整理

## 参照資料

| 参照資料       | パス                        | 内容                       |
| -------------- | --------------------------- | -------------------------- |
| Phase 1 成果物 | `phase-1-requirements.md`   | task 要件（依存Phase）     |
| Phase 2 成果物 | `phase-2-design.md`         | task 設計（依存Phase）     |
| Phase 5 成果物 | `phase-5-implementation.md` | task 実装計画（依存Phase） |
| Phase 6 成果物 | `phase-6-test-expansion.md` | task 回帰拡張（依存Phase） |
| Phase 7 成果物 | `phase-7-coverage-check.md` | task coverage（依存Phase） |

## 実行手順

### ステップ1: transcript と artifact の重複箇所を特定する

Phase 5 の実装方針から、transcript panel と artifact summary の表示要素が重複していないか確認する。

### ステップ2: share rail と provenance の簡素化候補を洗い出す

情報過多を削減し、最小限の provenance chip + share CTA に絞る。

## 統合テスト連携

リファクタリング前後で state / restore / share の動作が変わらないことを回帰テストで確認する。

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

| 成果物              | パス                                           | 説明     |
| ------------------- | ---------------------------------------------- | -------- |
| refactor 境界       | `outputs/phase-8/refactor-boundaries.md`       | 整理範囲 |
| simplification 候補 | `outputs/phase-8/simplification-candidates.md` | 削減候補 |

## 完了条件

- [ ] transcript と artifact の役割分離が整理されている
- [ ] share rail の情報過多削減方針がある
- [ ] state 表示の重複削減方針がある
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次のPhase

- [Phase 9（品質検証）](./phase-9-quality-assurance.md)
