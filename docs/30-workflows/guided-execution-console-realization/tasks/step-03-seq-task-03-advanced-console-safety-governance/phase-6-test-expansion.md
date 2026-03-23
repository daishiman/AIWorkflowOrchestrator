# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 6                                               |
| Phase名    | テスト拡充                                      |
| タスクID   | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| 前提Phase  | Phase 4-5                                       |
| 後続Phase  | Phase 7（カバレッジ確認）                       |
| ステータス | not_started                                     |
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

- 依存Phase: Phase 5
- task 実装計画: `phase-5-implementation.md`
- root pack: `../../phase-6-test-expansion.md`
- upstream task: `../step-02-seq-task-02-session-dock-artifact-bridge/index.md`

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

## 次のPhase

- [Phase 7（カバレッジ確認）](./phase-7-coverage-check.md)
