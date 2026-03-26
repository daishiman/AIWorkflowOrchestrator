# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 9                                               |
| Phase名    | 品質検証                                        |
| タスクID   | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| 前提Phase  | Phase 4-8                                       |
| 後続Phase  | Phase 10（最終レビュー）                        |
| ステータス | completed                                       |
| 作成日     | 2026-03-23                                      |
| 機能名     | advanced-console-safety-governance              |

## 目的

規約適合、manual boundary、security、UI 説明責任の品質を確認する。

## 実行タスク

- policy QA
- security QA
- disclosure QA
- boundary QA

## 参照資料

| 参照資料      | パス                                 | 内容                     |
| ------------- | ------------------------------------ | ------------------------ |
| 依存Phase     | `phase-5-implementation.md`          | Phase 5 実装計画         |
| task 実装計画 | `phase-5-implementation.md`          | 実装計画                 |
| task 整理方針 | `phase-8-refactoring.md`             | リファクタリング整理方針 |
| root pack     | `../../phase-9-quality-assurance.md` | ルートパック             |

## 実行手順

### ステップ1: policy / security / disclosure / boundary の品質チェックを実行する

4観点それぞれの品質チェックリストを作成・実行する。

### ステップ2: IPC契約ドリフト検証を実施する

新規定義チャネル（execution:get-terminal-log、execution:get-copy-command、approval:request、approval:respond）の4層整合性を確認する。

### ステップ3: リスクレジスタを作成する

残存リスクを特定し、影響度×確率で評価する。

### IPC契約ドリフト検証【Phase 9 品質ゲート】

| チャネル                   | 定数定義 | ホワイトリスト | ハンドラ登録 | Preload API |
| -------------------------- | -------- | -------------- | ------------ | ----------- |
| execution:get-terminal-log | TBD      | TBD            | TBD          | TBD         |
| execution:get-copy-command | TBD      | TBD            | TBD          | TBD         |
| approval:request           | TBD      | TBD            | TBD          | TBD         |
| approval:respond           | TBD      | TBD            | TBD          | TBD         |

- 設計タスクのため全チャネルが TBD（後続実装タスクで4層整合を確定する）
- P42準拠3段バリデーション適用要件を確認済み

## 統合テスト連携

policy / security / disclosure / boundary の4観点が統合テストの対象として網羅されていることを確認。

## 多角的チェック観点（AIが判断）

- compliance / security / UX の3観点でクロスチェック実施

## サブタスク管理

本Phaseの全サブタスクは完了済み。

## 成果物

| 成果物            | パス                                   | 説明     |
| ----------------- | -------------------------------------- | -------- |
| quality checklist | `outputs/phase-9/quality-checklist.md` | QA 一覧  |
| risk register     | `outputs/phase-9/risk-register.md`     | 残リスク |

## 完了条件

- [ ] policy / security / disclosure / boundary の観点が含まれている
- [ ] consumer auth 非流用の確認項目がある
- [ ] 残リスクが記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [x] 全実行タスクを100%完了した
- [x] 成果物が全て `outputs/phase-9/` に存在する
- [x] 完了条件を全て満たした

## 次のPhase

- [Phase 10（最終レビュー）](./phase-10-final-review.md)
