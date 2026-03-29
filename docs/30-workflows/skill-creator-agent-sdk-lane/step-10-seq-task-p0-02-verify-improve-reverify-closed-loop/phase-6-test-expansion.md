# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 6                                                |
| Phase名    | テスト拡充                                       |
| 対象機能   | TASK-P0-02 verify→improve→re-verify 閉ループ修復 |
| 前提Phase  | Phase 5: 実装                                    |
| 次Phase    | Phase 7: カバレッジ確認                          |
| ステータス | pending                                          |
| 作成日     | 2026-03-29                                       |

## 目的

閉ループの並行フロー、handoff 中の verify サイクル、複数回 re-verify などの境界条件を補強する。

## 実行タスク

### Task 1: 並行フロー境界ケース

- 複数 session が同時に verify サイクルを実行する場合の挙動を確認する
- verify 中に別の execute 要求が来た場合の排他制御を確認する
- improve 中に verify pass が通知された場合の競合を確認する

### Task 2: handoff 中の verify サイクル

- terminal_handoff route 中に verify が要求された場合の挙動を確認する
- handoff 完了後の verify 再開が正しく動作するかを確認する
- `requestReverify()` の disabled conditions と handoff 状態の整合を確認する

### Task 3: 複数回 re-verify

- improve→verify→fail→improve→verify→pass の 2 周サイクルをテストする
- re-verify 回数の上限（もしあれば）を確認する
- 各周回で phase 遷移が正しく reset されることを確認する

### Task 4: verification engine 統合境界

- verification engine が未初期化の場合の graceful degradation を確認する
- verification engine のチェック結果が空の場合の挙動を確認する
- P0-01 未完了時のフォールバック動作を確認する

## 参照資料

| 資料名         | パス                                                                   | 説明               |
| -------------- | ---------------------------------------------------------------------- | ------------------ |
| 実装記録       | `phase-5-implementation.md`                                            | 実装後の観測点     |
| WorkflowEngine | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | テスト対象         |
| RuntimeFacade  | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`  | 並行フロー観測対象 |

## 統合���スト連携

- 並行フローの排他制御が実装全体で一貫することを確認する
- handoff 状態との整合が Phase 9 の品質保証で再確認される

## 成果���

| 成果物         | パス                                      | 説明                              |
| -------------- | ----------------------------------------- | --------------------------------- |
| テスト拡充記�� | `outputs/phase-6/extended-test-record.md` | 並行フロー・handoff・多周回ケース |

## 完了条件

- [ ] 並行フローの境界ケースが追加��れている
- [ ] handoff 中の verify サイクルがテストされている
- [ ] 複数回 re-verify がテストされている
- [ ] verification engine 統合の境界がテ���トされている
- [ ] 本Phase��の全タスクを100%実行完了

## タスク100%実行確認���必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成���れている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を��記している

## ���Phase

→ [Phase 7: カバレッジ確認](./phase-7-coverage-check.md)
