# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 6                                               |
| Phase名    | テスト拡充                                      |
| タスクID   | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| 前提Phase  | Phase 4-5                                       |
| 後続Phase  | Phase 7（カバレッジ確認）                       |
| ステータス | completed                                       |
| 作成日     | 2026-03-23                                      |
| 機能名     | advanced-console-safety-governance              |

## 目的

abuse case、誤設定、権限漏れ、開示欠落の edge case を追加する。

## 実行タスク

- abuse case 追加
- permission misconfig 追加
- disclosure missing 追加
- accidental auto-send guard 追加

## 参照資料

| 参照資料      | パス                                                           | 内容             |
| ------------- | -------------------------------------------------------------- | ---------------- |
| 依存Phase     | `phase-5-implementation.md`                                    | Phase 5 実装計画 |
| task 実装計画 | `phase-5-implementation.md`                                    | 実装計画         |
| root pack     | `../../phase-6-test-expansion.md`                              | ルートパック     |
| upstream task | `../step-02-seq-task-02-session-dock-artifact-bridge/index.md` | 上流タスク       |

## 実行手順

### ステップ1: Phase 4-5 のテストケースを基にエッジケースを洗い出す

abuse case、permission misconfig、disclosure missing、accidental auto-send のシナリオを設計する。

### ステップ2: abuse case マトリクスを作成する

攻撃者モデル（一般ユーザー、上級ユーザー、悪意あるユーザー、外部攻撃者）ごとに39シナリオを定義する。

### ステップ3: regression 拡張計画を策定する

既存テストとの整合を確認し、新規テストケースの優先度付けを行う。

## 統合テスト連携

abuse case が approval / disclosure / advanced console の各コンポーネントと正しく連携するかの観点を定義。

## 多角的チェック観点（AIが判断）

- compliance / security / UX の3観点でクロスチェック実施

## サブタスク管理

本Phaseの全サブタスクは完了済み。

## 成果物

| 成果物                | パス                                           | 説明                |
| --------------------- | ---------------------------------------------- | ------------------- |
| regression 拡張計画   | `outputs/phase-6/regression-expansion-plan.md` | 拡張方針            |
| abuse case マトリクス | `outputs/phase-6/abuse-case-matrix.md`         | misuse / abuse 一覧 |

## 完了条件

- [ ] abuse case が定義されている
- [ ] disclosure missing ケースがある
- [ ] accidental auto-send guard ケースがある
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [x] 全実行タスクを100%完了した
- [x] 成果物が全て `outputs/phase-6/` に存在する
- [x] 完了条件を全て満たした

## 次のPhase

- [Phase 7（カバレッジ確認）](./phase-7-coverage-check.md)
