# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 7                                               |
| Phase名    | カバレッジ確認                                  |
| タスクID   | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| 前提Phase  | Phase 4-6                                       |
| 後続Phase  | Phase 8（リファクタリング）                     |
| ステータス | completed                                       |
| 作成日     | 2026-03-23                                      |
| 機能名     | advanced-console-safety-governance              |

## 目的

approval、disclosure、manual boundary、advanced console の coverage を可視化する。

## 実行タスク

- AC coverage
- abuse coverage
- boundary coverage
- UI / IPC coverage

## 参照資料

| 参照資料      | パス                              | 内容                      |
| ------------- | --------------------------------- | ------------------------- |
| 依存Phase     | `phase-5-implementation.md`       | Phase 5, 6 実装・拡張計画 |
| task 実装計画 | `phase-5-implementation.md`       | 実装計画                  |
| task 回帰拡張 | `phase-6-test-expansion.md`       | 回帰テスト拡張            |
| root pack     | `../../phase-7-coverage-check.md` | ルートパック              |

## 実行手順

### ステップ1: concern × test case のカバレッジマトリクスを作成する

approval / disclosure / advanced console / compliance の各 concern に対するテスト網羅度を可視化する。

### ステップ2: 統合ゲート判定基準を定義する

設計タスクとしての coverage 基準（FR/AC/DENY/MUST の traceability 100%）を設定する。

### ステップ3: 未カバー領域の優先度付けを行う

gap がある場合は後続実装タスクで対応する前提で記録する。

## 統合テスト連携

concern × dependency edge の coverage マトリクスで統合テスト範囲を可視化。

## 多角的チェック観点（AIが判断）

- compliance / security / UX の3観点でクロスチェック実施

## サブタスク管理

本Phaseの全サブタスクは完了済み。

## 成果物

| 成果物           | パス                                  | 説明          |
| ---------------- | ------------------------------------- | ------------- |
| coverage targets | `outputs/phase-7/coverage-targets.md` | coverage 目標 |
| integration gate | `outputs/phase-7/integration-gate.md` | gate 判定     |

## 完了条件

- [ ] AC-1〜AC-4 の coverage が可視化されている
- [ ] abuse / misuse ケースが coverage 対象になっている
- [ ] UI / IPC の両境界を含んでいる
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [x] 全実行タスクを100%完了した
- [x] 成果物が全て `outputs/phase-7/` に存在する
- [x] 完了条件を全て満たした

## 次のPhase

- [Phase 8（リファクタリング）](./phase-8-refactoring.md)
