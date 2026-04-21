# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 4                                      |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| 前提Phase  | Phase 3                                |
| 後続Phase  | Phase 5                                |
| 作成日     | 2026-04-21                             |
| ステータス | completed                              |

## 目的

既存実装の contract を固定する targeted regression test を設計し、新規ロジック前提の過剰テストを避ける。

## 実行タスク

1. 既存テストの有無を棚卸しする
2. 必要最小限の targeted scenario を定義する
3. verify_existing 向けに RED ではなく「既存挙動固定」を主目的とする

## 実行手順

- `pendingRequest` 優先順
- `workflowSnapshot?.awaitingUserInput` 到着後のクリア
- restored value が null の通常経路
- undo / resubmit 周辺の回帰観点

## 統合テスト連携

- typecheck / lint と重複する観点はテストへ持ち込まない
- UI 描画差分ではなく state transition を固定する

## 多角的チェック観点（AIが判断）

- MECE: 正常系 / 遷移系 / 回帰系が漏れなく分かれているか
- 改善思考: 後続タスクに効く契約だけを固定できているか

## サブタスク管理

| 種別           | 内容                                              |
| -------------- | ------------------------------------------------- |
| existing tests | 既存の `ConversationalInterview` 関連テスト棚卸し |
| targeted tests | requestId 依存の clear condition 固定             |

## 参照資料

| 資料名         | パス                   | 用途           |
| -------------- | ---------------------- | -------------- |
| Phase 2 成果物 | `outputs/phase-2/*.md` | テスト設計根拠 |

## 成果物

- `outputs/phase-4/test-specification.md`
- `outputs/phase-4/existing-test-inventory.md`

## 完了条件

- [ ] 既存テスト棚卸しを完了した
- [ ] targeted scenario を定義した
- [ ] verify_existing に不要な RED 前提を除去した

## タスク100%実行確認【必須】

- [ ] 実行タスク 1〜3 完了
- [ ] 成果物を全件定義

## 次のPhase

Phase 5: 実装
