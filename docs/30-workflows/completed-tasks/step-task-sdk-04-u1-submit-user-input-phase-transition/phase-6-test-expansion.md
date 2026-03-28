# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                                  |
| ------ | --------------------------------------------------- |
| Phase  | 6                                                   |
| 機能名 | `task-sdk-04-u1-submit-user-input-phase-transition` |
| 作成日 | 2026-03-28                                          |

## 目的

fallback、edge case、既存回帰の観点を追加し、意味論の固定を強くする。

## 実行タスク

- unknown reason / unknown option の fallback テスト追加
- stale requestId / message 保持の regression テスト追加
- facade / IPC snapshot 整合テスト追加

## 参照資料

| 資料名                 | パス                                | 説明       |
| ---------------------- | ----------------------------------- | ---------- |
| phase 5 implementation | `outputs/phase-5/implementation.md` | 直前実装   |
| test expansion         | `outputs/phase-6/test-expansion.md` | 追加ケース |
| phase 4 test plan      | `outputs/phase-4/test-plan.md`      | 基本計画   |

## 実行手順

### ステップ1: fallback ケースを増やす

不正 option と未知 reason で no-op fallback になることを固定する。

### ステップ2: 既存回帰を再明示する

既存テストが壊れていないことを matrix に残す。

## 統合テスト連携

- engine / runtime test 双方で snapshot の最終形を検証する

## 成果物

| 成果物         | パス                                | 説明           |
| -------------- | ----------------------------------- | -------------- |
| テスト拡充記録 | `outputs/phase-6/test-expansion.md` | edge case 一覧 |

## 完了条件

- [ ] fallback / edge case がテストへ追加されている
- [ ] regression 観点が明示されている
- [ ] snapshot 整合テストが定義されている
- [ ] 本Phase内の全タスクを100%実行完了
