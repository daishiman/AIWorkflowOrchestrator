# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 7                                               |
| Phase名    | カバレッジ確認                                  |
| タスクID   | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| 前提Phase  | Phase 4-6                                       |
| 後続Phase  | Phase 8（リファクタリング）                     |
| ステータス | not_started                                     |
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

- 依存Phase: Phase 5, Phase 6
- task 実装計画: `phase-5-implementation.md`
- task 回帰拡張: `phase-6-test-expansion.md`
- root pack: `../../phase-7-coverage-check.md`

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

## 次のPhase

- [Phase 8（リファクタリング）](./phase-8-refactoring.md)
