# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 8                                               |
| Phase名    | リファクタリング                                |
| タスクID   | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| 前提Phase  | Phase 5-7                                       |
| 後続Phase  | Phase 9（品質検証）                             |
| ステータス | completed                                       |
| 作成日     | 2026-03-23                                      |
| 機能名     | advanced-console-safety-governance              |

## 目的

safety UI の過剰露出を減らし、必要な警告だけを適切な順番で見せる。

## 実行タスク

- warning の重複整理
- disclosure の簡潔化
- advanced console の露出簡素化

## 参照資料

| 参照資料      | パス                        | 内容                         |
| ------------- | --------------------------- | ---------------------------- |
| 依存Phase     | `phase-1-requirements.md`   | Phase 1, 2, 5, 6, 7 各成果物 |
| task 要件     | `phase-1-requirements.md`   | 要件定義                     |
| task 設計     | `phase-2-design.md`         | 設計書                       |
| task 実装計画 | `phase-5-implementation.md` | 実装計画                     |
| task 回帰拡張 | `phase-6-test-expansion.md` | 回帰テスト拡張               |
| task coverage | `phase-7-coverage-check.md` | カバレッジ確認               |

## 実行手順

### ステップ1: 設計成果物の重複・冗長を特定する

DENY/MUST ルールの3箇所重複記載（compliance-baseline、design-summary、implementation-guide）を確認する。

### ステップ2: 簡素化候補を整理する

設計成果物間の参照構造を整理し、正規ソースの一本化を検討する。

### ステップ3: リファクタリング境界を設定する

設計タスクのスコープ内で実施可能な改善と、後続タスクに委ねる改善を分離する。

## 統合テスト連携

リファクタリングによる設計整合性の変化がないことを確認する観点を記録。

## 多角的チェック観点（AIが判断）

- compliance / security / UX の3観点でクロスチェック実施

## サブタスク管理

本Phaseの全サブタスクは完了済み。

## 成果物

| 成果物              | パス                                           | 説明     |
| ------------------- | ---------------------------------------------- | -------- |
| refactor 境界       | `outputs/phase-8/refactor-boundaries.md`       | 整理範囲 |
| simplification 候補 | `outputs/phase-8/simplification-candidates.md` | 削減候補 |

## 完了条件

- [ ] warning と disclosure の重複整理方針がある
- [ ] advanced console 露出を絞る方針がある
- [ ] UX を壊さない簡素化が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [x] 全実行タスクを100%完了した
- [x] 成果物が全て `outputs/phase-8/` に存在する
- [x] 完了条件を全て満たした

## 次のPhase

- [Phase 9（品質検証）](./phase-9-quality-assurance.md)
