# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 6                                                |
| Phase名    | テスト拡充                                       |
| 対象機能   | TASK-P0-02 verify→improve→re-verify 閉ループ修復 |
| 前提Phase  | Phase 5: 実装                                    |
| 次Phase    | Phase 7: カバレッジ確認                          |
| ステータス | completed                                        |
| 作成日     | 2026-03-29                                       |
| 更新日     | 2026-03-30                                       |

## 目的

閉ループの並行フロー、handoff 中の verify サイクル、複数回 re-verify といった境界条件を補強する。

## 実行タスク

### Task 1: 並行フロー境界ケース

- 複数 session が同時に verify サイクルを実行する場合の挙動を確認する
- verify 中に別の execute 要求が来た場合の排他制御を確認する
- improve 中に verify pass が通知された場合の競合を確認する

### Task 2: handoff 中の verify サイクル

- terminal_handoff route 中に verify が要求された場合の挙動を確認する
- handoff 中および handoff 完了後の re-verify が拒否されることを確認する
- `requestReverify()` の disabled conditions と handoff 状態の整合を確認する

### Task 3: 複数回 re-verify

- improve→verify→fail→improve→verify→pass の 2 周サイクルをテストする
- re-verify 回数の上限（もしあれば）を確認する
- 各周回で phase 遷移が正しく reset されることを確認する

### Task 4: verification engine 統合境界

- verification engine が未初期化の場合の graceful degradation を確認する
- verification engine のチェック結果が空の場合の挙動を確認する
- P0-01 未完了時のフォールバック動作を確認する

### Task 5: エッジケーステスト

以下のエッジケースを網羅的にテストする:

- **verify(pass) 後の重複呼び出し**: `recordVerifyPass()` で pass 遷移した後に再度 `recordVerifyPass()` を呼ぶとエラーになることを確認する
- **improve without prior fail のガード**: verify fail を経ずに improve フェーズに入ろうとした場合のガードが機能することを確認する
- **improve→verify→fail→improve サイクル**: improve→verify 遷移後、再度 fail して improve に戻るサイクルが正しく動作することを確認する
- **`requestReverify()` eligibility check 全パターン**: 以下の 4 条件それぞれで eligibility が正しく判定されることを確認する
  1. 現在の phase が improve でない場合 → 不可
  2. execute phase ongoing の場合 → 不可
  3. terminal_handoff route の場合 → 不可
  4. no execute result / last execution failed の場合 → 不可

### テストファイル

| テストファイル        | パス                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------- |
| WorkflowEngine テスト | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts` |

## 参照資料

| 資料名         | パス                                                                   | 説明               |
| -------------- | ---------------------------------------------------------------------- | ------------------ |
| 実装記録       | `phase-5-implementation.md`                                            | 実装後の観測点     |
| WorkflowEngine | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | テスト対象         |
| RuntimeFacade  | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`  | 並行フロー観測対象 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                                        | 内容                                  |
| ------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------- |
| Skill Creator Service仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | SkillCreatorService仕様との整合性確認 |
| IPC契約チェックリスト     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC修正時の整合性確認                 |

## 統合テスト連携

- 並行フローの排他制御が実装全体で一貫することを確認する
- handoff 状態との整合が Phase 9 の品質保証で再確認される

## 成果物

| 成果物         | パス                                      | 説明                              |
| -------------- | ----------------------------------------- | --------------------------------- |
| テスト拡充記録 | `outputs/phase-6/extended-test-record.md` | 並行フロー・handoff・多周回ケース |

## 完了条件

- [x] 並行フローの境界ケースが追加されている
- [x] handoff 中の verify サイクルがテストされている
- [x] 複数回 re-verify がテストされている
- [x] verification engine 統合の境界がテストされている
- [x] エッジケーステスト（verify(pass) 重複、improve without fail ガード、サイクル、eligibility 全パターン）が追加されている
- [x] aiworkflow-requirements の関連仕様を確認した
- [x] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.jsonが更新されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 7: カバレッジ確認](./phase-7-coverage-check.md)
