# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 6                                      |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| 前提Phase  | Phase 5                                |
| 後続Phase  | Phase 7                                |
| 作成日     | 2026-04-21                             |
| ステータス | completed                              |

## 目的

既存実装で取りこぼしやすい遷移系と境界条件を追加確認し、RALLY-010 以降の前提を固める。

## 実行タスク

1. null / same requestId / undo 復元の境界ケースを洗い出す
2. targeted test に追加観点を足す
3. regressions を記録する

## 実行手順

- restored が null のまま snapshot が更新される場合
- requestId が変わらない場合
- undo 後に restored request が再度表示される場合

## 統合テスト連携

- Phase 4 の targeted scenario を再利用する
- downstream の RALLY-010 へ影響する挙動だけを追加監査する

## 多角的チェック観点（AIが判断）

- if思考: requestId が変わらない場合に何が起こるか
- 因果ループ: clear effect が別の再描画を誘発しないか

## サブタスク管理

| 項目       | 内容                  |
| ---------- | --------------------- |
| edge cases | null / same id / undo |
| regression | 既存挙動維持の確認    |

## 参照資料

| 資料名         | パス                   | 用途   |
| -------------- | ---------------------- | ------ |
| Phase 5 成果物 | `outputs/phase-5/*.md` | 基準化 |

## 成果物

- `outputs/phase-6/expanded-test-cases.md`
- `outputs/phase-6/regression-test-result.md`
- `outputs/phase-6/edge-case-result.md`

## 完了条件

- [ ] 境界ケースを追加した
- [ ] regressions を記録した
- [ ] downstream 前提を確認した

## タスク100%実行確認【必須】

- [ ] 実行タスク 1〜3 完了
- [ ] 成果物を全件定義

## 次のPhase

Phase 7: カバレッジ確認
